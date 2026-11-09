// Requires the dashboard Vite development server. Every API is mocked;
// only synthetic flat-color image bytes are rendered.
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

test("Admin Passenger review: Full Access and explicit permission, protected images, decisions, history and conflict", { timeout: 60000 }, async () => {
  const base = process.env.ADMIN_TEST_URL || "http://localhost:5174";
  const pixel = await require('../../../backend/node_modules/sharp')({ create: { width: 16, height: 16, channels: 3, background: '#775577' } }).png().toBuffer();
  const userId = "0123456789abcdef01234567";
  let permissions = [], rejectCount = 0, approveCount = 0, conflict = false, mediaFailure = true;
  let verification = { status: "pending_review", revision: 1, submissionId: "00000000-0000-4000-8000-000000000000", documents: [{ key: "cnic-0", kind: "cnic" }, { key: "selfie", kind: "selfie" }] };
  let history = [];
  const requests = [], failures = [], pending = new Map();
  const profile = await mkdtemp(join(tmpdir(), "saheli-review-browser-"));
  const browser = spawn(process.env.ADMIN_TEST_BROWSER || "C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", "--no-sandbox", "--no-first-run", "--disable-background-networking", "--disable-sync", "--no-proxy-server", "--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { windowsHide: true, stdio: "ignore" });
  let ws, sequence = 0, error;
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  const until = async (check, label) => { for (let n = 0; n < 150; n++) { if (error) throw error; if (await check()) return; await delay(100); } throw new Error("Timed out: " + label); };
  try {
    let port; await until(async () => { try { port = (await readFile(join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0]; return true; } catch { return false; } }, "Chrome");
    const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    ws = new WebSocket(targets.find(t => t.type === "page").webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
    const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; const timer = setTimeout(() => { pending.delete(id); reject(new Error("CDP timeout: " + method)); }, 15000); pending.set(id, { resolve, reject, timer }); ws.send(JSON.stringify({ id, method, params })); });
    const handle = async ({ requestId, request }) => {
      const url = new URL(request.url), path = url.pathname;
      if (url.origin === "https://fonts.googleapis.com" && path === "/css2") return send("Fetch.fulfillRequest", { requestId, responseCode: 200, responseHeaders: [{ name: "Content-Type", value: "text/css" }], body: "" });
      if (!path.startsWith("/api/") && url.origin === base && request.method === "GET") return send("Fetch.continueRequest", { requestId });
      const supported = ["/api/admin/profile/me", "/api/admin/drivers", "/api/admin/passenger-verifications", `/api/admin/passenger-verifications/${userId}`, `/api/admin/passenger-verifications/${userId}/review`, `/api/admin/passenger-verifications/${userId}/documents/cnic-0`, `/api/admin/passenger-verifications/${userId}/documents/selfie`];
      if (!supported.includes(path)) { await send("Fetch.failRequest", { requestId, errorReason: "BlockedByClient" }); throw new Error(`Unrecognized network request blocked: ${url.origin}${path}`); }
      let status = 200, body = { success: true }, media = path.includes("/documents/");
      if (request.method !== "OPTIONS") {
        requests.push({ path, method: request.method });
        if (path.endsWith("/profile/me")) body.user = { id: "222222222222222222222222", role: "admin", status: "active", fullName: "Synthetic Reviewer", permissions };
        else if (path.endsWith("/drivers")) Object.assign(body, { drivers: [], pagination: { total: 0, page: 1, totalPages: 0 } });
        else if (path.endsWith("/review")) {
          const input = JSON.parse(request.postData);
          if (conflict) { status = 409; body.message = "Verification details changed. Refresh before trying again."; }
          else {
            assert.equal(input.revision, verification.revision);
            if (input.decision === "rejected") { assert.ok(input.reason); rejectCount++; } else approveCount++;
            verification = { ...verification, status: input.decision, revision: verification.revision + 1, rejectionReason: input.reason };
            history = [{ revision: verification.revision, decision: input.decision, reason: input.reason, adminId: "synthetic-admin", decidedAt: new Date().toISOString() }, ...history]; body.verification = verification;
          }
        } else if (path === "/api/admin/passenger-verifications") Object.assign(body, { submissions: [{ userId, fullName: "Synthetic Passenger", email: "synthetic@example.invalid" }], page: 1, hasMore: false });
        else if (!media) Object.assign(body, { verification, passenger: { id: userId, fullName: "Synthetic Passenger", email: "synthetic@example.invalid" }, history });
      }
      if (media && mediaFailure) { status = 503; body = { message: "Synthetic protected media unavailable" }; }
      await send("Fetch.fulfillRequest", { requestId, responseCode: status, responseHeaders: [{ name: "Content-Type", value: media && !mediaFailure ? "image/png" : "application/json" }, { name: "Access-Control-Allow-Origin", value: base }, { name: "Access-Control-Allow-Headers", value: "content-type, authorization" }, { name: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" }], body: media && !mediaFailure ? pixel.toString("base64") : Buffer.from(JSON.stringify(body)).toString("base64") });
    };
    ws.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) { const job = pending.get(message.id); pending.delete(message.id); clearTimeout(job?.timer); message.error ? job?.reject(new Error(message.error.message)) : job?.resolve(message.result); }
      if (message.method === "Runtime.exceptionThrown") failures.push(message.params.exceptionDetails.text);
      if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") failures.push(message.params.args.map(arg => arg.value || arg.description).join(" "));
      if (message.method === "Fetch.requestPaused") void handle(message.params).catch(e => { error = e; });
    };
    await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable"); await send("Network.setBypassServiceWorker", { bypass: true }); await send("Fetch.enable", { patterns: [{ urlPattern: "*" }] });
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await send("Page.addScriptToEvaluateOnNewDocument", { source: "sessionStorage.setItem('saheli_admin_token','synthetic-token');window.confirm=()=>true;" });
    const evaluate = async expression => { const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.text); return result.result.value; };
    const has = text => evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`);
    const click = async text => {
      await until(() => evaluate(`Array.from(document.querySelectorAll('button,a')).some(e=>e.textContent.trim()===${JSON.stringify(text)}&&!e.disabled)`), text);
      await evaluate(`Array.from(document.querySelectorAll('button,a')).find(e=>e.textContent.trim()===${JSON.stringify(text)}&&!e.disabled).click()`);
    };
    for (const deniedPermissions of [[], ["verifyPassengers"], ["manageAdmins"]]) {
      permissions = deniedPermissions;
      await send("Page.navigate", { url: base + "/passenger-verifications" });
      await until(() => has("Only Full Access Admins explicitly granted verifyPassengers"), "queue permission denied");
      await send("Page.navigate", { url: base + `/passenger-verifications/${userId}` });
      await until(() => has("Only Full Access Admins explicitly granted verifyPassengers"), "detail permission denied");
      assert.equal(requests.some(r => r.path.startsWith("/api/admin/passenger-verifications")), false);
    }
    permissions = ["manageAdmins", "verifyPassengers"];
    await send("Page.navigate", { url: base + "/passenger-verifications" }); await until(() => has("Synthetic Passenger"), "pending queue");
    await click("Synthetic Passenger"); await until(() => has("Current decision:"), "detail");
    await until(() => has("Unable to retrieve this protected document."), "image retrieval failure");
    assert.equal(await evaluate("Array.from(document.querySelectorAll('button')).find(e=>e.textContent==='Approve Passenger').disabled"), true);
    assert.equal(verification.status, "pending_review"); mediaFailure = false; await click("Refresh verification records");
    await until(() => evaluate("!!document.querySelector('button')&&Array.from(document.querySelectorAll('button')).some(e=>e.textContent==='Approve Passenger'&&!e.disabled)"), "all protected images loaded");
    await click("Reject Passenger"); await until(() => has("Enter a rejection or reverification reason"), "required rejection reason"); assert.equal(rejectCount, 0);
    await evaluate("(()=>{const e=document.querySelector('textarea');const set=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set;set.call(e,'Use a clearer synthetic image.');e.dispatchEvent(new Event('input',{bubbles:true}));})()");
    await click("Reject Passenger"); await until(() => has("Decision saved."), "rejection recorded"); assert.equal(rejectCount, 1);
    await click("Refresh verification records"); await until(() => has("Use a clearer synthetic image."), "decision history");
    verification = { ...verification, status: "pending_review", revision: verification.revision + 1 }; await click("Refresh verification records");
    await until(() => evaluate("Array.from(document.querySelectorAll('button')).some(e=>e.textContent==='Approve Passenger'&&!e.disabled)"), "new submission images ready");
    await click("Approve Passenger"); await until(() => has("Decision saved."), "approval recorded"); assert.equal(approveCount, 1);
    verification = { ...verification, status: "pending_review", revision: verification.revision + 1 }; await click("Refresh verification records");
    await until(() => evaluate("Array.from(document.querySelectorAll('button')).some(e=>e.textContent==='Approve Passenger'&&!e.disabled)"), "conflict attempt ready");
    conflict = true; await click("Approve Passenger"); await until(() => has("Verification details changed."), "conflict shown"); assert.equal(approveCount, 1);
    assert.deepEqual(failures, []);
  } finally { for (const job of pending.values()) clearTimeout(job.timer); ws?.close(); browser.kill(); }
});
