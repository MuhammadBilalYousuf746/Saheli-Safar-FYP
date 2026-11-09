// Requires the dashboard Vite development server. Every API is mocked;
// only synthetic flat-color image bytes are rendered.
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

test("Admin notifications, responsive screens and identity navigation", { timeout: 120000 }, async () => {
  const base = process.env.ADMIN_TEST_URL || "http://localhost:5174";
  const pixel = await require('../../../backend/node_modules/sharp')({ create: { width: 16, height: 16, channels: 3, background: '#775577' } }).png().toBuffer();
  const userId = "0123456789abcdef01234567";
  let permissions = ["manageAdmins", "verifyPassengers"], mode = 'unread', failRead = false, mediaFailure = true, conflict = false;
  let verification = { status: 'pending_review', revision: 1, submissionId: 'synthetic', documents: [{ key: 'cnic-0', kind: 'cnic' }, { key: 'selfie', kind: 'selfie' }] }, history = [], decisions = 0;
  let driverMode = 'empty';
  const driverId = '555555555555555555555555';
  let driver = { id: driverId, fullName: 'Synthetic Driver', email: 'driver@example.invalid', status: 'active', role: 'driver', cnic: '00000-0000000-0', licenseNumber: 'TEST-ONLY', verificationStatus: 'pending', submittedAt: '2026-11-09T08:00:00.000Z', vehicle: { type: 'car', make: 'Synthetic', model: 'Fixture', color: 'Purple', year: 2020, plateNumber: 'TEST-ONLY' } };
  const notifications = [
    { id: 'identity:test', title: 'New identity submission', message: 'A passenger identity submission is ready for review.', destination: '/passenger-verifications', createdAt: '2026-11-09T08:00:00.000Z', read: false },
    { id: 'driver:test', title: 'New driver verification request', message: 'A driver application is ready for review.', destination: '/drivers?verificationStatus=pending', createdAt: '2026-11-09T07:00:00.000Z', read: false },
  ];
  const screenshots = await mkdtemp(join(tmpdir(), 'saheli-admin-mid-final-screenshots-'));
  console.log('Screenshots: ' + screenshots);
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
      if (!path.startsWith('/api/admin/')) { await send('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' }); throw new Error('Blocked unexpected network request: ' + path); }
      if (path.includes('/documents/') && request.method !== 'OPTIONS') {
        await send('Fetch.fulfillRequest', { requestId, responseCode: mediaFailure ? 503 : 200, responseHeaders: [{ name: 'Content-Type', value: mediaFailure ? 'application/json' : 'image/png' }, { name: 'Access-Control-Allow-Origin', value: base }], body: mediaFailure ? Buffer.from(JSON.stringify({ message: 'Synthetic protected image unavailable' })).toString('base64') : pixel.toString('base64') }); return;
      }
      let status = 200, body = { success: true };
      if (request.method !== 'OPTIONS') {
        requests.push({ path, method: request.method });
        if (path.endsWith('/profile/me')) body.user = { id: '222222222222222222222222', role: 'admin', status: 'active', fullName: 'Synthetic Reviewer', permissions };
        else if (path.endsWith('/notifications')) {
          if (mode === 'error') { status = 503; body.message = 'Synthetic notification service unavailable'; }
          else if (mode === 'expired') { status = 401; body.message = 'Session expired'; }
          else Object.assign(body, { notifications: mode === 'empty' ? [] : notifications, unreadCount: mode === 'empty' ? 0 : notifications.filter(n => !n.read).length });
        } else if (path.endsWith('/review')) {
          const input = JSON.parse(request.postData);
          if (conflict) { status = 409; body.message = 'Verification details changed.'; }
          else { assert.equal(input.revision, verification.revision); if (input.decision === 'rejected') assert.ok(input.reason); decisions++; verification = { ...verification, status: input.decision, revision: verification.revision + 1 }; history.push({ revision: verification.revision, decision: input.decision, reason: input.reason, adminId: 'synthetic', decidedAt: new Date().toISOString() }); body.verification = verification; }
        } else if (path === '/api/admin/drivers/' + driverId + '/verification') {
          const input = JSON.parse(request.postData);
          assert.equal(driver.verificationStatus, 'pending');
          if (input.status === 'rejected') assert.ok(input.reason.trim());
          driver = { ...driver, verificationStatus: input.status, rejectionReason: input.reason || null, verifiedAt: new Date().toISOString() };
          Object.assign(body, { driver, message: 'Driver ' + input.status + ' successfully.' });
        } else if (path === '/api/admin/drivers/' + driverId) Object.assign(body, { driver });
        else if (path.endsWith('/read-all')) notifications.forEach(n => { n.read = true; });
        else if (path.endsWith('/read')) {
          if (failRead) { status = 503; body.message = 'Synthetic read update failed'; }
          else notifications.find(n => n.id === decodeURIComponent(path.split('/').at(-2))).read = true;
        } else if (path.endsWith('/overview')) Object.assign(body, { stats: { passengers: 12, drivers: 5, pending: 0, approved: 4, rejected: 1, suspended: 0 }, recentPending: [] });
        else if (path.endsWith('/users')) Object.assign(body, { users: [], pagination: { page: 1, totalPages: 0, total: 0 } });
        else if (path.endsWith('/drivers')) {
          if (driverMode === 'error') { status = 503; body.message = 'Synthetic driver service unavailable'; }
          else { const rows = driverMode === 'ready' && (!url.searchParams.get('verificationStatus') || url.searchParams.get('verificationStatus') === driver.verificationStatus) ? [driver] : []; Object.assign(body, { drivers: rows, pagination: { page: 1, totalPages: rows.length ? 1 : 0, total: rows.length } }); }
        }
        else if (path.endsWith('/passenger-verifications')) Object.assign(body, { submissions: [], page: 1, hasMore: false });
        else if (path.endsWith('/passenger-verifications/' + userId)) Object.assign(body, { verification, passenger: { fullName: 'Synthetic Passenger', email: 'synthetic@example.invalid' }, history });
        else throw new Error('Unexpected Admin API: ' + path);
      }
      await send('Fetch.fulfillRequest', { requestId, responseCode: status, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }, { name: 'Access-Control-Allow-Origin', value: base }, { name: 'Access-Control-Allow-Headers', value: 'content-type, authorization' }, { name: 'Access-Control-Allow-Methods', value: 'GET, POST, PATCH, OPTIONS' }], body: Buffer.from(JSON.stringify(body)).toString('base64') });
    };
    ws.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) { const job = pending.get(message.id); pending.delete(message.id); clearTimeout(job?.timer); message.error ? job?.reject(new Error(message.error.message)) : job?.resolve(message.result); }
      if (message.method === "Runtime.exceptionThrown") failures.push(message.params.exceptionDetails.text);
      if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") failures.push(message.params.args.map(arg => arg.value || arg.description).join(" "));
      if (message.method === "Fetch.requestPaused") void handle(message.params).catch(e => {
        // Direct navigation can cancel a paused request before CDP fulfills it.
        if (e.message !== "Invalid InterceptionId.") error = e;
      });
    };
    await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable"); await send("Network.setBypassServiceWorker", { bypass: true }); await send("Fetch.enable", { patterns: [{ urlPattern: "*" }] });
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await send("Page.addScriptToEvaluateOnNewDocument", { source: "sessionStorage.setItem('saheli_admin_token','synthetic-token');window.confirm=()=>true;window.testPolls=new Map();const si=window.setInterval.bind(window),ci=window.clearInterval.bind(window);window.setInterval=(fn,ms,...args)=>{const id=si(fn,ms,...args);if(ms===30000 && String(fn).includes('document.hidden'))window.testPolls.set(id,fn);return id};window.clearInterval=id=>{window.testPolls.delete(id);ci(id)};" });
    const evaluate = async expression => { const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.text); return result.result.value; };
    const has = text => evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`);
    const click = async text => {
      await until(() => evaluate(`Array.from(document.querySelectorAll('button,a')).some(e=>e.textContent.trim()===${JSON.stringify(text)}&&!e.disabled)`), text);
      await evaluate(`Array.from(document.querySelectorAll('button,a')).find(e=>e.textContent.trim()===${JSON.stringify(text)}&&!e.disabled).click()`);
    };
    const selectorClick = selector => evaluate('document.querySelector(' + JSON.stringify(selector) + ').click()');
    const bell = () => selectorClick('.topbar-bell');
    const screenshot = async name => { await delay(200); const shot = await send('Page.captureScreenshot', { format: 'png' }); await writeFile(join(screenshots, name + '.png'), Buffer.from(shot.data, 'base64')); };
    const go = async path => { await send('Page.navigate', { url: base + path }); await until(() => evaluate('!!document.querySelector(".topbar-bell")'), 'layout'); };
    await go('/overview'); await until(() => has('Drivers awaiting verification'), 'overview data');
    await until(() => evaluate('document.querySelector(".topbar-alert-count")?.textContent === "2"'), 'real unread badge');
    assert.equal(await evaluate('window.testPolls.size'), 1, 'single polling loop in Strict Mode');
    const feedRequests = () => requests.filter(r => r.path.endsWith('/notifications')).length;
    let beforePoll = feedRequests();
    await evaluate('Object.defineProperty(document,"hidden",{configurable:true,value:true});[...window.testPolls.values()][0]()'); await delay(100); assert.equal(feedRequests(), beforePoll, 'hidden page skips polling');
    await evaluate('Object.defineProperty(document,"hidden",{configurable:true,value:false});[...window.testPolls.values()][0]()'); await until(() => feedRequests()>beforePoll, 'visible page polling');
    await bell(); await until(() => has('New identity submission'), 'notification feed');
    assert.equal(await evaluate('document.activeElement.getAttribute("role")'), 'dialog');
    await screenshot('notifications-unread');
    await bell(); await until(() => evaluate('!document.querySelector(".topbar-notifications")'), 'bell closes');
    await bell(); await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await until(() => evaluate('!document.querySelector(".topbar-notifications")'), 'Escape closes');
    assert.equal(await evaluate('document.activeElement.classList.contains("topbar-bell")'), true);
    await bell(); await evaluate('document.querySelector("h1").dispatchEvent(new PointerEvent("pointerdown",{bubbles:true}))');
    await until(() => evaluate('!document.querySelector(".topbar-notifications")'), 'outside closes');
    await bell(); failRead = true; await selectorClick('.notification-row'); await until(() => has('Synthetic read update failed'), 'failed read feedback');
    assert.equal(await evaluate('location.pathname'), '/overview'); assert.equal(notifications[0].read, false);
    failRead = false; await selectorClick('.notification-row'); await until(() => evaluate('location.pathname === "/passenger-verifications"'), 'passenger destination');
    assert.equal(notifications[0].read, true);
    await go('/overview'); await until(() => evaluate('document.querySelector(".topbar-alert-count")?.textContent === "1"'), 'read persists after navigation');
    await bell(); await selectorClick('.notification-row:nth-child(1)');
    await until(() => evaluate('location.pathname === "/passenger-verifications"'), 'read notification navigation');
    await go('/overview'); await bell(); await evaluate('document.querySelectorAll(".notification-row")[1].click()');
    await until(() => evaluate('location.pathname === "/drivers" && location.search.includes("pending")'), 'driver destination');
    notifications.forEach(n => { n.read = false; }); await go('/overview'); await bell(); await click('Mark all as read');
    await until(() => evaluate('!document.querySelector(".topbar-alert-count")'), 'mark all clears badge');
    await go('/overview'); await bell(); await until(() => evaluate('document.querySelectorAll(".notification-row:not(.is-unread)").length === 2'), 'mark all persists after reload');
    mode = 'empty'; await go('/overview'); await bell(); await until(() => has("You're all caught up."), 'genuine empty'); await screenshot('notifications-empty');
    mode = 'error'; await go('/overview'); await bell(); await until(() => has('Synthetic notification service unavailable'), 'API error');
    mode = 'unread'; notifications.forEach(n => { n.read = false; }); await click('Try again'); await until(() => has('New identity submission'), 'retry');
    for (const [width, height] of [[360,800],[390,844],[768,1024],[1024,768],[1366,768],[1440,900],[1920,1080],[2560,1440]]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
      await go('/overview'); await until(() => has('Drivers awaiting verification'), 'overview at ' + width);
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'overview overflow ' + width);
      if ([390,768,1366,1920,2560].includes(width)) await screenshot(width + '-overview');
      const measureOverview = () => evaluate('(()=>{const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {left:r.left,right:r.right,width:r.width}};const main=rect(".main"),wrapper=rect(".overview-page"),stats=rect(".overview-metrics"),verification=rect(".overview-queue"),greeting=rect(".overview-heading"),style=getComputedStyle(document.querySelector(".overview-page"));return {viewport:innerWidth,main,wrapper,leftGutter:stats.left-main.left,rightGutter:main.right-stats.right,paddingLeft:parseFloat(style.paddingLeft),paddingRight:parseFloat(style.paddingRight),stats,verification,greeting}})()');
      const assertOverview = metrics => {
        assert.ok(Math.abs(metrics.main.width-metrics.wrapper.width)<=1, 'Overview fills main at ' + width);
        assert.ok(Math.abs(metrics.leftGutter-metrics.paddingLeft)<=1);
        assert.ok(Math.abs(metrics.rightGutter-metrics.paddingRight)<=1);
        assert.ok(Math.abs(metrics.stats.width-metrics.verification.width)<=1);
        assert.ok(Math.abs(metrics.greeting.left-metrics.stats.left)<=1);
      };
      const metrics = await measureOverview(); assertOverview(metrics);
      if (width === 2560) console.log('QHD expanded: ' + JSON.stringify(metrics));
      if (width >= 1024) {
        await selectorClick('.sidebar-brand-toggle'); await delay(260);
        const collapsed = await measureOverview(); assertOverview(collapsed);
        assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
        if (width === 2560) { console.log('QHD collapsed: ' + JSON.stringify(collapsed)); await screenshot('2560-overview-collapsed'); }
        await selectorClick('.sidebar-brand-toggle'); await delay(260);
      }
      await bell(); await until(() => has('New identity submission'), 'panel at ' + width);
      assert.equal(await evaluate('(()=>{const r=document.querySelector(".topbar-notifications").getBoundingClientRect();return r.left>=0 && r.right<=innerWidth})()'), true, 'panel bounds ' + width);
      if ([390,768,1366,1920,2560].includes(width)) await screenshot(width + '-notifications');
      await go('/users?search=synthetic&page=2'); await until(() => has('Review Identity Submissions'), 'CTA');
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'passengers overflow ' + width);
      if ([390,768,1366,1920,2560].includes(width)) await screenshot(width + '-passengers');
      await click('Review Identity Submissions'); await until(() => has('Pending Review'), 'identity queue');
      assert.equal(await evaluate('document.querySelector(".passenger-back").getAttribute("aria-label")'), 'Back to Passengers');
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'queue overflow ' + width);
      if ([390,768,1366,1920,2560].includes(width)) await screenshot(width + '-identity');
      await selectorClick('.passenger-back'); await until(() => evaluate('location.pathname === "/users"'), 'list back');
      assert.equal(await evaluate('location.search.includes("search=synthetic") && location.search.includes("page=2")'), true);
      await go('/drivers?verificationStatus=pending'); await until(() => has('Drivers'), 'drivers'); assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'drivers overflow ' + width);
      if (width < 1024) { await selectorClick('.sidebar-menu-button'); await until(() => evaluate('document.querySelector(".sidebar").classList.contains("is-open")'), 'drawer opens'); await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await until(() => evaluate('!document.querySelector(".sidebar").classList.contains("is-open")'), 'drawer closes'); }
      await go('/settings/account'); await until(() => has('Account'), 'settings'); assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, 'settings overflow ' + width);
    }
    await go('/passenger-verifications/' + userId); await until(() => has('Synthetic Passenger'), 'direct detail'); await selectorClick('.passenger-back'); await until(() => evaluate('location.pathname === "/users"'), 'direct-link back');
    await go('/passenger-verifications/' + userId); await until(() => has('Unable to retrieve this protected document.'), 'protected image failure');
    assert.equal(await evaluate('Array.from(document.querySelectorAll("button")).find(e=>e.textContent==="Approve Passenger").disabled'), true);
    mediaFailure = false; await click('Refresh verification records');
    await until(() => evaluate('Array.from(document.querySelectorAll("button")).some(e=>e.textContent==="Approve Passenger"&&!e.disabled)'), 'protected fixtures loaded');
    await click('Reject Passenger'); await until(() => has('Enter a rejection or reverification reason'), 'reason required'); assert.equal(decisions, 0);
    await evaluate('(()=>{const e=document.querySelector("textarea");Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,"value").set.call(e,"Synthetic rejection reason");e.dispatchEvent(new Event("input",{bubbles:true}))})()');
    await click('Reject Passenger'); await until(() => has('Decision saved.'), 'rejection'); assert.equal(decisions, 1);
    verification = { ...verification, status: 'pending_review', revision: verification.revision + 1 }; await click('Refresh verification records');
    await until(() => evaluate('Array.from(document.querySelectorAll("button")).some(e=>e.textContent==="Approve Passenger"&&!e.disabled)'), 'resubmission');
    await click('Approve Passenger'); await until(() => has('Decision saved.'), 'approval'); assert.equal(decisions, 2);
    verification = { ...verification, status: 'pending_review', revision: verification.revision + 1 }; await click('Refresh verification records');
    await until(() => evaluate('Array.from(document.querySelectorAll("button")).some(e=>e.textContent==="Approve Passenger"&&!e.disabled)'), 'conflict fixture'); conflict = true;
    await click('Approve Passenger'); await until(() => has('Verification details changed.'), 'conflict'); assert.equal(decisions, 2);
    driverMode = 'error'; await go('/drivers'); await until(() => has('Synthetic driver service unavailable'), 'driver API error');
    driverMode = 'ready'; await click('Try again'); await until(() => has('Synthetic Driver'), 'real driver rendering fixture');
    await selectorClick('.drivers-view-link'); await until(() => has('License & vehicle'), 'driver details');
    assert.equal(await has('TEST-ONLY'), true, 'associated vehicle and license');
    await click('Reject'); await until(() => has('Reason for rejection (shown to the driver)'), 'driver rejection modal');
    assert.equal(await evaluate('Array.from(document.querySelectorAll("button")).find(e=>e.textContent.trim()==="Reject driver").disabled'), true);
    await evaluate('(()=>{const e=document.querySelector("textarea");Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,"value").set.call(e,"Synthetic vehicle review reason");e.dispatchEvent(new Event("input",{bubbles:true}))})()');
    await click('Reject driver'); await until(() => has('Driver rejected successfully.'), 'driver rejection');
    await go('/drivers/' + driverId); await until(() => has('Synthetic vehicle review reason'), 'driver rejection persists');
    assert.equal(await evaluate('Array.from(document.querySelectorAll("button")).some(e=>e.textContent.trim()==="Approve")'), false, 'decided driver has no approval action');
    driver = { ...driver, verificationStatus: 'pending', rejectionReason: null }; await go('/drivers/' + driverId); await until(() => has('License & vehicle'), 'new isolated pending driver fixture');
    await click('Approve'); await click('Approve driver'); await until(() => has('Driver approved successfully.'), 'driver approval');
    await go('/drivers?verificationStatus=rejected'); await until(() => has('No drivers found'), 'driver filter excludes approved');
    await click('Approved'); await until(() => has('Synthetic Driver'), 'driver approved filter');
    permissions = ['manageAdmins']; await go('/users'); await until(() => has('Passengers'), 'unauthorized passengers'); assert.equal(await has('Review Identity Submissions'), false);
    await go('/passenger-verifications'); await until(() => has('Only Full Access Admins explicitly granted'), 'unauthorized queue');
    mode = 'expired'; await send('Page.navigate', { url: base + '/users' }); await until(() => evaluate('location.pathname === "/login"'), 'expired session');
    assert.equal(await evaluate('window.testPolls.size'), 0, 'polling cleanup on logout');
    assert.equal(failures.filter(text => !text.includes('503') && !text.includes('401') && !text.includes('409')).length, 0, failures.join('\n'));

  } finally { for (const job of pending.values()) clearTimeout(job.timer); ws?.close(); browser.kill(); }
});
