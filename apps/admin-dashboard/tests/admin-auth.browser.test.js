// Real browser/router regression test. Requires the dashboard Vite server.
// All Fetch/XHR requests are fulfilled locally; no backend is contacted.
import assert from "node:assert/strict";
import test from "node:test";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const appUrl = process.env.ADMIN_TEST_URL || "http://localhost:5173";
const browserExe = process.env.ADMIN_TEST_BROWSER || "C:/Program Files/Google/Chrome/Application/chrome.exe";

test("real browser: explicit logout, account switching, deep links and permission guards", { timeout: 60000 }, async () => {
  const profile = await mkdtemp(join(tmpdir(), "saheli-auth-test-"));
  const browser = spawn(browserExe, [
    "--headless=new", "--no-first-run", "--no-default-browser-check",
    "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank",
  ], { windowsHide: true, stdio: "ignore" });
  let socket;
  try {
    let port;
    for (let i = 0; i < 100; i++) {
      try { port = (await readFile(join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0]; break; }
      catch { await delay(50); }
    }
    assert.ok(port, "Browser must expose a debugging port");
    const tabs = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    socket = new WebSocket(tabs.find((tab) => tab.type === "page").webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    let id = 0;
    const pending = new Map();
    const errors = [];
    const apiRequests = [];
    let passengerMode = 'baseline';
    const directoryFixtures = [
      ...Array.from({ length: 21 }, (_, index) => ({ id: 'passenger-' + index, fullName: 'Fixture Passenger ' + index, email:index === 20 ? 'findme@example.test' : undefined, role:'passenger', status:index % 2 ? 'suspended' : 'active', createdAt:'2026-10-01T00:00:00Z' })),
      { id:'driver-only', fullName:'Excluded Driver', email:'findme@example.test', role:'driver', status:'active' },
      { id:'admin-only', fullName:'Excluded Administrator', email:'findme@example.test', role:'admin', status:'active' },
    ];
    let alertTotal = 3;
    let invalidAlerts = false;
    let holdAlerts = false;
    const delayedAlerts = [];
    let holdLogin = false;
    const delayedLogins = [];
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const requestId = ++id;
      pending.set(requestId, { resolve, reject });
      socket.send(JSON.stringify({ id: requestId, method, params }));
    });
    const admin = (full) => ({
      id: "fixture-admin", fullName: full ? "Fixture Admin" : "Standard Admin", email: "admin@example.test",
      role: "admin", status: "active", permissions: full ? ["manageAdmins"] : [],
    });
    socket.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      if (message.id) {
        const job = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) job?.reject(new Error(message.error.message));
        else job?.resolve(message.result);
      } else if (message.method === "Log.entryAdded") {
        if (message.params.entry.level === "error") errors.push(message.params.entry.text);
      } else if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
        errors.push(message.params.args.map((arg) => arg.value || arg.description).join(" "));
      } else if (message.method === "Runtime.exceptionThrown") {
        errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
      } else if (message.method === "Fetch.requestPaused") {
        const { requestId, request, resourceType } = message.params;
        const path = new URL(request.url).pathname;
        if (resourceType === "Script" && new URL(request.url).origin === appUrl) {
          void send("Fetch.continueRequest", { requestId });
          return;
        }
        let body = { success: true };
        let responseCode = 200;
        const pendingDrivers = path.endsWith("/drivers") && new URL(request.url).searchParams.get("verificationStatus") === "pending";
        if (request.method !== "OPTIONS") apiRequests.push({ path, method: request.method, query: new URL(request.url).search, standard: Object.values(request.headers).includes("Bearer fixture-standard") });
        if (path.endsWith("/auth/login") && request.method === "POST") {
          const full = JSON.parse(request.postData).email === "full@example.test";
          body = { success: true, user: admin(full), accessToken: full ? "fixture-full" : "fixture-standard" };
        } else if (path.endsWith("/profile/me")) {
          body.user = admin(Object.values(request.headers).includes("Bearer fixture-full"));
        } else if (passengerMode !== 'baseline' && path.endsWith('/users')) {
          const params = new URL(request.url).searchParams;
          const needle = (params.get('search') || '').toLowerCase();
          const matches = directoryFixtures.filter(user => user.role === params.get('role') && (!params.get('status') || user.status === params.get('status')) && [user.fullName, user.email, user.phone].some(value => (value || '').toLowerCase().includes(needle)));
          const page = Number(params.get('page') || 1), limit = Number(params.get('limit') || 20);
          body = { success:true, users: passengerMode === 'empty' ? [] : matches.slice((page - 1) * limit, page * limit), pagination:{page,limit,total:passengerMode === 'empty' ? 0 : matches.length,totalPages:passengerMode === 'empty' ? 0 : Math.ceil(matches.length / limit)} };
          if (passengerMode === 'error' && request.method !== 'OPTIONS') { responseCode = 500; body = { message:'Fixture passenger service unavailable' }; }
        } else if (path.endsWith("/overview")) {
          body = { ...body, stats: { pending: 0, approved: 0, rejected: 0, passengers: 0, drivers: 0, suspended: 0 }, recentPending: [] };
        } else {
          body = { ...body, users: [], drivers: [], admins: [], pagination: { page: 1, total: 0, totalPages: 0, limit: 20 } };
          if (pendingDrivers) body.pagination.total = invalidAlerts ? null : alertTotal;
        }
        const deliver = () => send("Fetch.fulfillRequest", {
          requestId, responseCode,
          responseHeaders: [
            { name: "Content-Type", value: "application/json" },
            { name: "Access-Control-Allow-Origin", value: appUrl },
            { name: "Access-Control-Allow-Headers", value: "content-type, authorization" },
            { name: "Access-Control-Allow-Methods", value: "GET, POST, PATCH, DELETE, OPTIONS" },
          ],
          body: Buffer.from(JSON.stringify(body)).toString("base64"),
        });
        if (holdLogin && path.endsWith("/auth/login") && request.method === "POST") delayedLogins.push(deliver);
        else if (pendingDrivers && holdAlerts && request.method === "GET") delayedAlerts.push(deliver);
        else void deliver();
      }
    };
    await send("Page.enable");
    await send("Runtime.enable");
    await send("Log.enable");
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] });
    await send("Page.addScriptToEvaluateOnNewDocument", { source: `
      localStorage.setItem('saheli-admin-theme', 'dark');
      localStorage.setItem('unrelated-fixture', 'preserve');
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
      window.testEntrances = [];
      window.testMenuAnimations = [];
      document.addEventListener('animationstart', event => {
        if (event.animationName.startsWith('dashboard-')) {
          testEntrances.push({ name: event.animationName, target: event.target.className });
        }
      });
      const animate = Element.prototype.animate;
      Element.prototype.animate = function (frames, options) {
        if (this.classList.contains('topbar-dropdown')) testMenuAnimations.push({ frames, options });
        return animate.call(this, frames, options);
      };
    ` });
    await send("Fetch.enable", { patterns: [
      { resourceType: "XHR", urlPattern: "*" },
      { resourceType: "Fetch", urlPattern: "*" },
      { urlPattern: "*/api/*" },
    ] });
    const evaluate = async (expression) => {
      const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
      return result.result.value;
    };
    const waitFor = async (expression) => {
      for (let i = 0; i < 150; i++) {
        try {
          if (await evaluate(expression)) {
            // History can update before React commits the destination and its
            // close-on-navigation effects. Wait for paint before the next action.
            await evaluate("new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))");
            if (await evaluate(expression)) return;
          }
        } catch { /* Navigation replaces the execution context. */ }
        await delay(30);
      }
      assert.fail(`Timed out: ${expression}; location/state: ${await evaluate("JSON.stringify({path:location.pathname,state:history.state,ready:document.readyState,layout:document.querySelector('.layout')?.className,sidebar:document.querySelector('.sidebar') && getComputedStyle(document.querySelector('.sidebar')).width,focus:document.activeElement?.outerHTML.slice(0,300)})")}; errors: ${errors.join("; ")}`);
    };
    const visit = async (path) => { await send("Page.navigate", { url: appUrl + path }); };
    const login = async (full, expected) => {
      await waitFor("!!document.querySelector('input[type=email]')");
      await evaluate(`(() => {
        const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        const email = document.querySelector('input[type=email]');
        const password = document.querySelector('input[autocomplete=current-password]');
        set.call(email, '${full ? "full" : "standard"}@example.test');
        email.dispatchEvent(new Event('input', { bubbles: true }));
        set.call(password, 'fixture-password');
        password.dispatchEvent(new Event('input', { bubbles: true }));
      })()`);
      await waitFor("!document.querySelector('button[type=submit]').disabled");
      await evaluate("document.querySelector('button[type=submit]').click()");
      await waitFor(`location.pathname === ${JSON.stringify(expected)} && !!document.querySelector('.topbar-avatar')`);
      assert.equal(await evaluate("!!document.querySelector('.sidebar-footer, .sidebar .avatar, .sidebar .admin-chip, .sidebar [aria-label=Logout]')"), false);
      assert.equal(await evaluate("document.querySelector('.layout').classList.contains('is-sidebar-collapsed')"), false,
        "Every new login must start expanded");
      assert.equal(await evaluate("document.querySelector('.topbar-avatar').textContent"), full ? "F" : "S");
      assert.equal(await evaluate("document.querySelector('.page-entrance').classList.contains('page-entrance--login')"), true);
      if (expected === (full ? "/overview" : "/drivers")) {
        await waitFor(`document.querySelector('.admin-greeting')?.textContent === ${JSON.stringify(`Welcome back, ${full ? "Fixture Admin" : "Standard Admin"}!`)}`);
      }
    };
    const logout = async () => {
      await evaluate("document.querySelector('.topbar-avatar').click()");
      await waitFor("!!document.querySelector('.topbar-profile-menu')");
      assert.equal(await evaluate("document.querySelectorAll('.topbar-profile-logout').length"), 1);
      await evaluate("document.querySelector('.topbar-profile-logout').click()");
      await waitFor("location.pathname === '/login' && !!document.querySelector('input[type=email]')");
      assert.equal(await evaluate("history.state?.usr?.from?.pathname || null"), null,
        "Explicit logout must not save the page being exited");
      assert.equal(await evaluate("!!document.querySelector('.page-entrance')"), false);
    };
    await visit("/login");
    await waitFor("document.querySelectorAll('.login-route-bus').length === 12 && !!document.querySelector('.login-route-bus').getAttribute('transform')");
    await evaluate("document.fonts.ready.then(() => true)");
    assert.equal(await evaluate("document.documentElement.dataset.theme"), "light");
    assert.equal(await evaluate("getComputedStyle(document.documentElement).colorScheme"), "light");
    assert.equal(await evaluate("localStorage.getItem('saheli-admin-theme')"), "dark");
    assert.equal(await evaluate("localStorage.getItem('unrelated-fixture')"), "preserve");
    assert.equal(await evaluate("!!document.querySelector('.theme-toggle')"), false);
    const setSearch = async (query) => {
      const bounds = await evaluate("(() => { const r = document.querySelector('.dashboard-search input').getBoundingClientRect(); return { x: r.x + 20, y: r.y + r.height / 2 }; })()");
      await send("Input.dispatchMouseEvent", { type: "mousePressed", button: "left", clickCount: 1, ...bounds });
      await send("Input.dispatchMouseEvent", { type: "mouseReleased", button: "left", clickCount: 1, ...bounds });
      await evaluate(`(() => {
        const input = document.querySelector('.dashboard-search input'); input.focus();
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(query)});
        input.dispatchEvent(new Event('input', { bubbles: true }));
      })()`);
      await press("ArrowDown");
      await waitFor("document.querySelector('.dashboard-search input').getAttribute('aria-expanded') === 'true'");
    };
    const press = async (key, code = key) => {
      const windowsVirtualKeyCode = { Enter: 13, Escape: 27, ArrowDown: 40, ArrowUp: 38, Tab: 9 }[key];
      await send("Input.dispatchKeyEvent", { type: "keyDown", key, code, windowsVirtualKeyCode, ...(key === "Enter" ? { text: "\r", unmodifiedText: "\r" } : {}) });
      await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode });
    };
    const openAccount = async () => {
      await evaluate("document.querySelector('.topbar-avatar').click()");
      await waitFor("!!document.querySelector('.topbar-profile-menu')");
      await evaluate("document.querySelector('.topbar-profile-menu a[href=\"/settings/account\"]').click()");
    };
    assert.equal(await evaluate("getComputedStyle(document.querySelector('.login-route-network')).pointerEvents"), "none");
    assert.equal(await evaluate("getComputedStyle(document.querySelector('.login-page'), '::before').backgroundImage !== 'none'"), true);
    await evaluate("window.testBuses = [...document.querySelectorAll('.login-route-bus')]; window.busPositions = () => testBuses.map(bus => bus.getAttribute('transform')).join('|'); window.initialPositions = busPositions()");
    await waitFor("busPositions() !== initialPositions");
    if (process.env.ADMIN_UI_SCREENSHOT) {
      const capture = await send("Page.captureScreenshot", { format: "png" });
      await writeFile(process.env.ADMIN_UI_SCREENSHOT.replace(/\.png$/, "-desktop.png"), Buffer.from(capture.data, "base64"));
    }
    assert.equal(await evaluate("document.querySelectorAll('.login-route-network canvas').length"), 0);
    assert.equal(await evaluate("[...document.querySelectorAll('.login-bus-trail')].every(p => p.style.strokeDasharray && p.style.strokeDashoffset)"), true);
    await send("Emulation.setEmulatedMedia", { features: [
      { name: "prefers-color-scheme", value: "dark" }, { name: "prefers-reduced-motion", value: "reduce" },
    ] });
    await waitFor("matchMedia('(prefers-reduced-motion: reduce)').matches");
    await delay(100);
    const staticPositions = await evaluate("busPositions()");
    await delay(180);
    assert.equal(await evaluate("busPositions()"), staticPositions, "Reduced motion must stop bus movement");
    await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
    await waitFor("innerWidth === 390");
    await waitFor("[...document.querySelectorAll('.login-route-network > g')].filter(group => getComputedStyle(group).display !== 'none').length === 6");
    // Mobile stays static even after the reduced-motion preference is removed.
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] });
    await delay(100);
    const mobilePositions = await evaluate("busPositions()");
    await delay(180);
    assert.equal(await evaluate("busPositions()"), mobilePositions, "Mobile must use static buses");
    assert.equal(await evaluate("document.documentElement.scrollWidth <= innerWidth"), true);
    assert.equal(await evaluate("(() => { const r = document.querySelector('.login-card').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; })()"), true);
    if (process.env.ADMIN_UI_SCREENSHOT) {
      const capture = await send("Page.captureScreenshot", { format: "png" });
      await writeFile(process.env.ADMIN_UI_SCREENSHOT, Buffer.from(capture.data, "base64"));
    }
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] });
    await waitFor("busPositions() !== " + JSON.stringify(mobilePositions));
    holdLogin = true;
    const firstLogin = login(true, "/overview");
    await waitFor("document.querySelector('button[type=submit]')?.getAttribute('aria-busy') === 'true'");
    assert.equal(await evaluate("document.querySelector('button[type=submit]').textContent"), "Signing in...");
    assert.equal(await evaluate("!!document.querySelector('.login-button-spinner')"), true);
    await evaluate("document.querySelector('form').requestSubmit(); document.querySelector('form').requestSubmit()");
    assert.equal(apiRequests.filter((request) => request.path.endsWith('/auth/login')).length, 1);
    holdLogin = false;
    for (const deliver of delayedLogins.splice(0)) await deliver();
    await firstLogin;
    assert.equal(await evaluate("testEntrances.filter(event => event.name === 'dashboard-login-in').length"), 1);
    assert.equal(await evaluate("testEntrances.every(event => event.target.startsWith('page-entrance'))"), true);
    const stoppedPositions = await evaluate("busPositions()");
    await delay(150);
    assert.equal(await evaluate("busPositions()"), stoppedPositions, "Leaving Login must cancel bus movement");
    assert.equal(await evaluate("!!document.querySelector('.login-route-network')"), false);
    assert.equal(await evaluate("getComputedStyle(document.documentElement).getPropertyValue('--sidebar-start').trim()"), "#241432");
    assert.equal(await evaluate("getComputedStyle(document.querySelector('.sidebar')).width"), "248px");
    assert.equal(await evaluate("!!document.querySelector('.theme-toggle')"), false);
    assert.equal(await evaluate("!!document.querySelector('.topbar-brand')"), false);
    assert.equal(await evaluate("document.querySelector('.dashboard-search').getBoundingClientRect().left < document.querySelector('.topbar-actions').getBoundingClientRect().left"), true);
    // Controlled fixtures verify loading, actionable count, empty and error states.
    holdAlerts = true;
    await evaluate("document.querySelector('.topbar-bell').click()");
    await waitFor("document.querySelector('.topbar-notifications')?.textContent.includes('Loading alerts')");
    holdAlerts = false;
    for (const deliver of delayedAlerts.splice(0)) await deliver();
    await waitFor("document.querySelector('.topbar-alert-count')?.textContent === '3'");
    await evaluate("document.querySelector('.topbar-notification-link').click()");
    await waitFor("location.pathname === '/drivers' && location.search === '?verificationStatus=pending'");
    assert.equal(await evaluate("document.querySelector('.topbar-notifications')?.inert ?? true"), true);
    await waitFor("!document.querySelector('.topbar-notifications')");
    await evaluate("window.testPage = document.querySelector('.page-entrance'); window.routeEntranceCount = testEntrances.length; document.querySelector('.drivers-tabs [role=tab]').click()");
    await waitFor("location.search === ''");
    assert.equal(await evaluate("testPage === document.querySelector('.page-entrance')"), true);
    assert.equal(await evaluate("testEntrances.length"), await evaluate("routeEntranceCount"));
    alertTotal = 0;
    await evaluate("document.querySelector('.topbar-bell').click()");
    await waitFor("document.querySelector('.topbar-notifications')?.textContent.includes(\"You're all caught up!\")");
    assert.equal(await evaluate("!!document.querySelector('.topbar-alert-count')"), false);
    await press("Escape");
    assert.equal(await evaluate("document.activeElement.classList.contains('topbar-bell')"), true);
    invalidAlerts = true;
    await evaluate("document.querySelector('.topbar-bell').click()");
    await waitFor("!!document.querySelector('.topbar-notifications [role=alert]')");
    invalidAlerts = false;
    alertTotal = 3;
    await evaluate("document.querySelector('.topbar-notifications button').click()");
    await waitFor("!!document.querySelector('.topbar-notification-link')");
    await press("Escape");
    await evaluate("document.querySelector('.topbar-avatar').click()");
    await waitFor("!!document.querySelector('.topbar-profile-menu')");
    assert.equal(await evaluate("document.querySelector('.topbar-profile-summary').textContent.includes('Full Access')"), true);
    assert.equal(await evaluate("!!document.querySelector('.topbar-profile-menu a[href=\"/settings/admins\"]')"), true);
    await press("Escape");
    assert.equal(await evaluate("document.activeElement.classList.contains('topbar-avatar')"), true);
    // Refresh must restore the session without replaying a successful-login welcome.
    await visit("/overview");
    await waitFor("!!document.querySelector('.admin-greeting')");
    assert.equal(await evaluate("document.querySelector('.admin-greeting').textContent.startsWith('Welcome back')"), false);
    assert.equal(await evaluate("document.querySelector('.page-entrance').classList.contains('page-entrance--login')"), false);
    await setSearch("");
    assert.deepEqual(await evaluate("[...document.querySelectorAll('.dashboard-search [role=option]')].map(x => x.textContent)"),
      ["Overview", "Drivers", "Passengers", "Settings", "My Account", "Security", "Admin Management"]);
    await setSearch("not a passenger database search");
    await waitFor("!!document.querySelector('.dashboard-search-empty')");
    await press("Escape");
    await waitFor("!document.querySelector('.dashboard-search-results')");
    await setSearch("sec");
    await press("ArrowDown");
    await press("Enter");
    await waitFor("location.pathname === '/settings/security'");
    assert.equal(await evaluate("!!document.querySelector('.dashboard-search-results')"), false);
    await openAccount();
    await waitFor("location.pathname === '/settings/account'");
    await setSearch("passengers");
    await evaluate("document.querySelector('.dashboard-search [role=option]').click()");
    await waitFor("location.pathname === '/users'");
    await openAccount();
    await waitFor("location.pathname === '/settings/account'");
    if (process.env.ADMIN_UI_SCREENSHOT) {
      const capture = await send("Page.captureScreenshot", { format: "png" });
      await writeFile(process.env.ADMIN_UI_SCREENSHOT.replace(/\.png$/, "-dashboard-expanded.png"), Buffer.from(capture.data, "base64"));
    }
    // Keyboard activation of the branding button must work in both directions.
    await evaluate("document.querySelector('.sidebar-brand-toggle').focus()");
    await press("Enter");
    await waitFor("getComputedStyle(document.querySelector('.sidebar')).width === '76px'");
    await waitFor("document.querySelector('.topbar-avatar').getBoundingClientRect().right <= innerWidth");
    assert.equal(await evaluate("document.documentElement.scrollWidth <= innerWidth"), true);
    if (process.env.ADMIN_UI_SCREENSHOT) {
      const capture = await send("Page.captureScreenshot", { format: "png" });
      await writeFile(process.env.ADMIN_UI_SCREENSHOT.replace(/\.png$/, "-dashboard-collapsed.png"), Buffer.from(capture.data, "base64"));
    }
    await press("Enter");
    await waitFor("getComputedStyle(document.querySelector('.sidebar')).width === '248px'");
    // Use real NavLink navigation before Logout, retaining the mounted router.
    const openUsers = async () => {
      await evaluate("document.querySelector('a[href=\"/users\"]').click()");
      await waitFor("location.pathname === '/users' && !!document.querySelector('.topbar-avatar')");
      await waitFor("document.querySelector('h1')?.textContent === 'Passengers'");
    };
    for (const [nextFull, expected] of [[true, "/overview"], [false, "/drivers"], [true, "/overview"]]) {
      await evaluate("document.querySelector('.sidebar-brand-toggle').click()");
      await waitFor("getComputedStyle(document.querySelector('.sidebar')).width === '76px'");
      await openUsers();
      assert.equal(await evaluate("document.querySelector('.sidebar a[href=\"/users\"]').classList.contains('active')"), true);
      assert.equal(await evaluate("document.querySelector('.layout').classList.contains('is-sidebar-collapsed')"), true);
      await logout();
      await login(nextFull, expected);
      if (!nextFull) {
        await evaluate("document.querySelector('.topbar-avatar').click()");
        await waitFor("!!document.querySelector('.topbar-profile-menu')");
        assert.equal(await evaluate("!!document.querySelector('.topbar-profile-menu a[href=\"/settings/admins\"]')"), false);
        assert.equal(await evaluate("document.querySelector('.topbar-profile-menu a[href=\"/drivers\"]').textContent"), "Dashboard");
        await press("Escape");
        await evaluate("document.querySelector('.topbar-bell').click()");
        await waitFor("!!document.querySelector('.topbar-notification-link')");
        await press("Escape");
        await setSearch("");
        assert.deepEqual(await evaluate("[...document.querySelectorAll('.dashboard-search [role=option]')].map(x => x.textContent)"),
          ["Drivers", "Passengers", "Settings", "My Account", "Security"]);
        await setSearch("admin");
        await waitFor("!!document.querySelector('.dashboard-search-empty')");
        await press("Escape");
      }
    }
    await logout();
    assert.equal(apiRequests.some((entry) => entry.standard && entry.path.endsWith('/overview')), false,
      "Standard Access must never request the Overview endpoint");
    // A new SPA deep link after logout must also work without reloading AuthProvider.
    await evaluate("history.pushState(null, '', '/users?role=passenger#list'); dispatchEvent(new PopStateEvent('popstate'))");
    await login(false, "/users");
    assert.equal(await evaluate("location.search + location.hash"), "?role=passenger#list");
    await logout();
    await visit("/users?role=passenger#list");
    await login(false, "/users");
    assert.equal(await evaluate("location.search + location.hash"), "?role=passenger#list");
    for (const path of ["/overview", "/settings/admins"]) {
      await logout();
      await visit(path);
      await login(false, "/drivers");
    }
    await visit("/overview");
    await waitFor("location.pathname === '/drivers'");
    await visit("/settings/admins");
    await waitFor("location.pathname === '/settings/account'");
    await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await waitFor("getComputedStyle(document.querySelector('.sidebar-menu-button')).display === 'grid'");
    await evaluate("document.querySelector('.sidebar-menu-button').click()");
    await waitFor("document.querySelector('.sidebar').classList.contains('is-open')");
    await press("Escape");
    await waitFor("!document.querySelector('.sidebar').classList.contains('is-open')");
    await evaluate("document.querySelector('.topbar-avatar').click()");
    await waitFor("!!document.querySelector('.topbar-profile-menu')");
    assert.equal(await evaluate("(() => { const r = document.querySelector('.topbar-profile-menu').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; })()"), true);
    await press("Escape");
    await evaluate("document.querySelector('.topbar-bell').click()");
    await waitFor("!!document.querySelector('.topbar-notification-link')");
    assert.equal(await evaluate("(() => { const r = document.querySelector('.topbar-notifications').getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; })()"), true);
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: 5, y: 150, button: "left", clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: 5, y: 150, button: "left", clickCount: 1 });
    await waitFor("!document.querySelector('.topbar-notifications')");
    assert.equal(await evaluate("document.documentElement.scrollWidth <= innerWidth"), true);
    assert.equal(await evaluate("(() => { const r = document.querySelector('.topbar-avatar').getBoundingClientRect(); return r.right <= innerWidth; })()"), true);
    await logout();
    await login(false, "/drivers");
    await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await waitFor("getComputedStyle(document.querySelector('.sidebar')).width === '248px'");
    assert.equal(await evaluate("testMenuAnimations.some(animation => animation.options.duration === 160)"), true);
    assert.equal(await evaluate("testMenuAnimations.some(animation => animation.options.duration === 120)"), true);
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    const beforeReduced = await evaluate("testMenuAnimations.length");
    await evaluate("document.querySelector('.topbar-avatar').click()");
    await waitFor("!!document.querySelector('.topbar-profile-menu')");
    await press("Escape");
    await waitFor("!document.querySelector('.topbar-profile-menu')");
    assert.equal(await evaluate("testMenuAnimations.length"), beforeReduced);
    await logout();
    assert.equal(apiRequests.some((entry) => entry.standard && entry.path.endsWith('/overview')), false);

    // Mixed fixture accounts exercise the real Passenger page's scoped requests.
    // All requests remain intercepted; no status-changing actions are submitted.
    await login(true, '/overview');
    passengerMode = 'populated';
    await visit('/users');
    await waitFor('document.querySelectorAll(".users-table-wrap tbody tr").length === 20');
    assert.equal(await evaluate('document.querySelector(".users-table-wrap").textContent.includes("Excluded")'), false);
    assert.equal(await evaluate('document.querySelector(".pagination").textContent.includes("of 21")'), true);
    assert.equal(await evaluate('document.querySelectorAll(".users-filters select").length'), 1);
    assert.equal(await evaluate('document.querySelector(".users-card .action-row button").textContent'), 'Suspend');
    await evaluate('[...document.querySelectorAll(".pagination button")].find(b => b.getAttribute("aria-label") === "Next page").click()');
    await waitFor('location.search.includes("page=2") && document.querySelectorAll(".users-table-wrap tbody tr").length === 1');
    const passengerSearch = async (term) => {
      await evaluate(`(() => {
        const input = document.querySelector('.users-filters input[name=search]');
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(term)});
        document.querySelector('.users-filters').requestSubmit();
      })()`);
    };
    await passengerSearch('findme@example.test');
    await waitFor('location.search.includes("search=findme") && !location.search.includes("page=") && document.querySelectorAll(".users-table-wrap tbody tr").length === 1');
    assert.equal(await evaluate('document.querySelector(".users-table-wrap").textContent.includes("Fixture Passenger 20")'), true);
    assert.equal(await evaluate('document.querySelector(".users-table-wrap").textContent.includes("Excluded")'), false);
    await passengerSearch('no matching passenger');
    await waitFor('document.querySelector(".users-card")?.textContent.includes("No passengers found")');
    await passengerSearch('');
    await waitFor('!location.search.includes("search=") && document.querySelectorAll(".users-table-wrap tbody tr").length === 20');
    await evaluate(`(() => {
      const select = document.querySelector('.users-filters select');
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set.call(select, 'suspended');
      select.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    await waitFor('location.search === "?status=suspended" && document.querySelectorAll(".users-table-wrap tbody tr").length === 10');
    assert.equal(await evaluate('document.querySelector(".users-table-wrap").textContent.includes("Excluded")'), false);
    await visit('/users?role=admin');
    await waitFor('document.querySelectorAll(".users-table-wrap tbody tr").length === 20');
    passengerMode = 'empty';
    await visit('/users');
    await waitFor('document.querySelector(".users-card")?.textContent.includes("No passengers found")');
    passengerMode = 'error';
    await visit('/users');
    await waitFor('document.querySelector(".users-card [role=alert]")?.textContent.includes("Fixture passenger service unavailable")');
    passengerMode = 'populated';
    await evaluate('document.querySelector(".users-card button").click()');
    await waitFor('document.querySelectorAll(".users-table-wrap tbody tr").length === 20');
    const requestsBeforeLegacy = apiRequests.filter(r => r.path.endsWith('/users')).length;
    await visit('/users?role=driver');
    await waitFor('location.pathname === "/drivers" && document.querySelector("h1")?.textContent === "Drivers"');
    assert.equal(apiRequests.filter(r => r.path.endsWith('/users')).length, requestsBeforeLegacy);
    assert.ok(apiRequests.filter(r => r.path.endsWith('/users')).every(r => new URLSearchParams(r.query).get('role') === 'passenger'));
    assert.equal(apiRequests.some(r => r.method !== 'GET' && !r.path.endsWith('/auth/login')), false);
    await logout();

    assert.deepEqual(errors.filter(error => !/Failed to load resource.*500/.test(error)), [], "No unexpected browser console or runtime errors");
  } finally {
    socket?.close();
    const exited = new Promise((resolve) => browser.once("exit", resolve));
    browser.kill();
    await exited;
    await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
});
