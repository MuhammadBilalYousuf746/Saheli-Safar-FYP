import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { transformSync } from "esbuild";

import {
  getAdminLoginRedirect,
  hasFullAdminAccess,
} from "../src/features/auth/admin-access.js";
import { getGreetingPeriod, isFreshLoginWelcome } from "../src/shared/utils/greeting.js";

test("only admins with manageAdmins have Full Access", () => {
  assert.equal(
    hasFullAdminAccess({ role: "admin", permissions: ["manageAdmins"] }),
    true
  );
  assert.equal(
    hasFullAdminAccess({ role: "admin", permissions: [] }),
    false
  );
  assert.equal(hasFullAdminAccess(null), false);
});

test("Standard Access defaults away from Overview after login", () => {
  assert.equal(getAdminLoginRedirect({ permissions: [] }), "/drivers");
  assert.equal(getAdminLoginRedirect({ permissions: [] }, "/"), "/drivers");
  assert.equal(
    getAdminLoginRedirect({ permissions: [] }, "/users"),
    "/users"
  );
});

test("Full Access retains the requested login destination", () => {
  const admin = { permissions: ["manageAdmins"] };

  assert.equal(getAdminLoginRedirect(admin), "/overview");
  assert.equal(getAdminLoginRedirect(admin, "/drivers"), "/drivers");
});

test("restricted and public saved destinations cannot loop through Login", () => {
  const standard = { permissions: [] };
  for (const destination of ["/", "/overview", "/Overview/", "/settings/admins", "/settings/admins/?page=2"]) {
    assert.equal(getAdminLoginRedirect(standard, destination), "/drivers");
  }
  for (const admin of [standard, { permissions: ["manageAdmins"] }]) {
    const fallback = getAdminLoginRedirect(admin);
    for (const destination of ["/login", "/login?next=/login", "/reset-password", "//example.test"]) {
      assert.equal(getAdminLoginRedirect(admin, destination), fallback);
    }
    assert.equal(getAdminLoginRedirect(admin, fallback), fallback);
  }
});

// Execute the real JSX component functions with controlled hooks and router
// boundaries. No browser, API, storage, or database connection is required.
const element = (type, props) => ({ type, props });
const loadComponent = (relativePath, mocks, globals = {}) => {
  const filename = new URL(relativePath, import.meta.url);
  const { code } = transformSync(readFileSync(filename, "utf8"), {
    loader: "jsx",
    format: "cjs",
    jsx: "automatic",
  });
  const module = { exports: {} };
  runInNewContext(code, {
    module,
    exports: module.exports,
    require: (name) => {
      if (name === "react/jsx-runtime") return { jsx: element, jsxs: element };
      if (Object.hasOwn(mocks, name)) return mocks[name];
      throw new Error(`Unexpected component dependency: ${name}`);
    },
    ...globals,
  });
  return module.exports;
};

const makeHooks = () => {
  const state = [];
  let cursor = 0;
  let effect;
  return {
    state,
    render(component) { cursor = 0; return component(); },
    runEffect() { return effect?.(); },
    react: {
      useState(initial) {
        const index = cursor++;
        if (!(index in state)) state[index] = typeof initial === "function" ? initial() : initial;
        return [state[index], (value) => { state[index] = value; }];
      },
      createContext: () => ({ Provider: "Provider" }),
      useCallback: (callback) => callback,
      useMemo: (factory) => factory(),
      useRef(initial) {
        const index = cursor++;
        if (!(index in state)) state[index] = { current: initial };
        return state[index];
      },
      useEffect: (callback) => { effect = callback; },
    },
  };
};

const findElement = (node, type) => {
  if (!node || typeof node !== "object") return undefined;
  if (node.type === type) return node;
  const children = [node.props?.children].flat(Infinity);
  return children.map((child) => findElement(child, type)).find(Boolean);
};

const makePassengerDirectory = (query = "", result = { users: [], pagination: { total: 0 } }, failure) => {
  const hooks = makeHooks();
  const requests = [];
  const updates = [];
  const { default: UsersPage } = loadComponent("../src/features/users/pages/UsersPage.jsx", {
    react: hooks.react,
    "react-router-dom": { Navigate: "Navigate", useSearchParams: () => [new URLSearchParams(query), value => updates.push(value)] },
    "../../../features/auth/context/AuthContext": { useAuth: () => ({ request() {} }) },
    "../../../shared/services/admin-list.service": { useAdminListApi: () => ({ listUsers: async params => {
      requests.push(params);
      if (failure) throw failure;
      return typeof result === "function" ? result(params) : result;
    } }) },
    "../../../shared/components/Pagination": { __esModule: true, default: "Pagination" },
    "../../../shared/components/StatusBadge": { __esModule: true, default: "StatusBadge" },
    "../components/UserStatusActions": { __esModule: true, default: "UserStatusActions" },
    "../../../shared/components/States": { EmptyState: "EmptyState", ErrorState: "ErrorState", LoadingState: "LoadingState" },
    "../../../shared/utils/format": { formatDate: value => value, formatDateTime: value => value, formatPhone: value => value },
  }, { URLSearchParams, FormData: class {
    constructor(form) { this.form = form; }
    get() { return this.form.search; }
  } });
  return { hooks, requests, updates, render: () => hooks.render(UsersPage) };
};

test("Passenger directory always requests passengers with server pagination and account status", async () => {
  for (const query of ["", "role=admin", "status=suspended&page=2"]) {
    const page = makePassengerDirectory(query);
    page.render();
    page.hooks.runEffect();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(page.requests.length, 1);
    assert.equal(page.requests[0].role, "passenger");
    assert.equal(page.requests[0].limit, 20);
    assert.equal(page.requests[0].page, query.includes("page=2") ? 2 : 1);
    assert.equal(page.requests[0].status, query.includes("suspended") ? "suspended" : "");
    assert.equal(findElement(page.render(), "EmptyState").props.title, "No passengers found");
  }
});

test("legacy driver directory links redirect without requesting passenger data", () => {
  const page = makePassengerDirectory("role=driver");
  const view = page.render();
  page.hooks.runEffect();
  assert.equal(view.type, "Navigate");
  assert.equal(view.props.to, "/drivers");
  assert.deepEqual(page.requests, []);
});

test("passenger rows retain existing status actions and pagination callbacks", async () => {
  const passenger = { id: "p1", role: "passenger", fullName: "Fixture Passenger", status: "active" };
  const pagination = { page: 1, limit: 20, total: 25, totalPages: 2 };
  const page = makePassengerDirectory("status=active", { users: [passenger], pagination });
  assert.equal(findElement(page.render(), "LoadingState").props.label, "Loading passengers…");
  page.hooks.runEffect();
  await new Promise(resolve => setImmediate(resolve));
  const view = page.render();
  assert.equal(findElement(view, "UserStatusActions").props.user, passenger);
  assert.equal(findElement(view, "Pagination").props.pagination, pagination);
  findElement(view, "Pagination").props.onPageChange(2);
  assert.equal(page.updates[0].get("page"), "2");
  assert.equal(page.updates[0].get("status"), "active");
  findElement(view, "select").props.onChange({ target: { value: "suspended" } });
  assert.equal(page.updates[1].get("status"), "suspended");
  assert.equal(page.updates[1].has("page"), false);
});

test("passenger API failures retain error and retry feedback", async () => {
  const page = makePassengerDirectory("", undefined, new Error("Fixture passenger read error"));
  page.render();
  page.hooks.runEffect();
  await new Promise(resolve => setImmediate(resolve));
  const error = findElement(page.render(), "ErrorState");
  assert.equal(error.props.message, "Fixture passenger read error");
  await error.props.onRetry();
  assert.equal(page.requests.length, 2);
});

test("passenger search is sent to the API with status and server pagination", async () => {
  const page = makePassengerDirectory("search=Passenger&status=active&page=2");
  page.render(); page.hooks.runEffect();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(page.requests[0].search, "Passenger");
  assert.equal(page.requests[0].role, "passenger");
  assert.equal(page.requests[0].status, "active");
  assert.equal(page.requests[0].page, 2);
});

test("submitting or clearing passenger search resets page and preserves status", () => {
  const page = makePassengerDirectory("status=active&page=4&search=old");
  const form = findElement(page.render(), "form");
  let prevented = false;
  form.props.onSubmit({ preventDefault() { prevented = true; }, currentTarget: { search: "  new name  " } });
  assert.equal(prevented, true);
  assert.equal(page.updates[0].get("search"), "new name");
  assert.equal(page.updates[0].get("status"), "active");
  assert.equal(page.updates[0].has("page"), false);
  form.props.onSubmit({ preventDefault() {}, currentTarget: { search: "   " } });
  assert.equal(page.updates[1].has("search"), false);
  assert.equal(page.updates[1].has("page"), false);
});

test("older passenger search responses cannot replace the latest result", async () => {
  const pending = [];
  const page = makePassengerDirectory("search=Passenger", () => new Promise(resolve => pending.push(resolve)));
  page.render();
  page.hooks.runEffect();
  page.hooks.runEffect();
  const result = id => ({ users: [{ id, role: "passenger", fullName: id }], pagination: { total: 1 } });
  pending[1](result("latest"));
  await new Promise(resolve => setImmediate(resolve));
  pending[0](result("old"));
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(findElement(page.render(), "UserStatusActions").props.user.id, "latest");
});

const makeLogin = (auth, location = {}) => {
  const hooks = makeHooks();
  const { default: LoginPage } = loadComponent("../src/features/auth/pages/LoginPage.jsx", {
    react: hooks.react,
    "react-router-dom": {
      Link: "Link", Navigate: "Navigate", useLocation: () => location,
      // Any imperative redirect would fail this test, including the old code.
      useNavigate: () => { throw new Error("Redirect must use authenticated render"); },
    },
    "lucide-react": { Eye: "Eye", EyeOff: "EyeOff", Lock: "Lock", Mail: "Mail" },
    "../../../assets/logo.png": { default: "test-logo" },
    "../context/AuthContext": { useAuth: () => auth },
    "../admin-access": { getAdminLoginRedirect },
    "../components/LoginRouteNetwork": { default: "LoginRouteNetwork" },
  });
  return { hooks, render: () => hooks.render(LoginPage) };
};

test("actual Login submit waits for the authenticated profile for both access levels", async () => {
  for (const [permissions, destination] of [[["manageAdmins"], "/overview"], [[], "/drivers"]]) {
    let finishLogin;
    let credentials;
    const auth = {
      admin: null, isAuthenticated: false,
      login: (payload) => {
        credentials = payload;
        return new Promise((resolve) => { finishLogin = resolve; });
      },
    };
    const page = makeLogin(auth);
    page.hooks.state[0] = " admin@example.test ";
    page.hooks.state[1] = "fixture-password";
    const form = findElement(page.render(), "form");
    let prevented = false;
    const submitted = form.props.onSubmit({ preventDefault() { prevented = true; } });
    const duplicate = form.props.onSubmit({ preventDefault() {} });
    await duplicate;
    assert.equal(prevented, true);
    assert.equal(credentials.email, "admin@example.test");
    assert.equal(credentials.password, "fixture-password");
    assert.equal(findElement(page.render(), "Navigate"), undefined);
    const pendingForm = findElement(page.render(), "form");
    const pendingButton = pendingForm.props.children.find((child) => child?.props?.type === "submit");
    assert.equal(pendingButton.props.disabled, true);
    assert.equal(pendingButton.props["aria-busy"], true);
    assert.equal(pendingButton.props.children[0].props.className, "spinner login-button-spinner");
    auth.admin = { permissions };
    auth.isAuthenticated = true;
    finishLogin(); // AuthContext login intentionally returns no profile.
    await submitted;
    const redirect = page.render();
    assert.equal(redirect.type, "Navigate");
    assert.equal(redirect.props.to, destination);
    assert.equal(redirect.props.replace, true);
  }
});

test("actual authenticated Login preserves deep links and rejects restricted destinations", () => {
  for (const [permissions, from, expected] of [
    [["manageAdmins"], { pathname: "/settings/admins", search: "?page=2", hash: "#table" }, "/settings/admins?page=2#table"],
    [[], { pathname: "/drivers/driver-id", search: "?tab=details", hash: "#vehicle" }, "/drivers/driver-id?tab=details#vehicle"],
    [[], { pathname: "/overview" }, "/drivers"],
    [[], { pathname: "/settings/admins" }, "/drivers"],
    [[], { pathname: "/login" }, "/drivers"],
  ]) {
    const page = makeLogin({ admin: { permissions }, isAuthenticated: true }, { state: { from } });
    assert.equal(page.render().props.to, expected);
  }
});

test("actual Login preserves empty-field disabling and login error feedback", async () => {
  const page = makeLogin({
    admin: null, isAuthenticated: false,
    login: async () => { throw new Error("Invalid credentials"); },
  });
  const empty = page.render();
  assert.equal(findElement(empty, "input").props.required, true);
  const form = findElement(empty, "form");
  assert.equal(findElement(form, "button").props.type, "button");
  const submitButton = form.props.children.find((child) => child?.props?.type === "submit");
  assert.equal(submitButton.props.disabled, true);
  await form.props.onSubmit({ preventDefault() {} });
  assert.equal(page.hooks.state[3], "Invalid credentials");
  assert.equal(page.hooks.state[4], false);
  assert.equal(findElement(page.render(), "Navigate"), undefined);
});

test("actual AuthProvider keeps login, restoration, logout, and expired-session behavior", async () => {
  const hooks = makeHooks();
  const storage = new Map();
  const calls = [];
  const user = { permissions: ["manageAdmins"] };
  let expired = false;
  const { AuthProvider } = loadComponent("../src/features/auth/context/AuthContext.jsx", {
    react: hooks.react,
    "../../../shared/api/api": {
      apiRequest: async (endpoint, options) => {
        calls.push({ endpoint, options });
        if (expired) throw Object.assign(new Error("Expired"), { status: 401 });
        return endpoint === "/admin/auth/login" ? { accessToken: "mock-token", user } : { user };
      },
    },
  }, {
    sessionStorage: {
      getItem: (key) => storage.get(key) || null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
  });
  const render = () => hooks.render(() => AuthProvider({ children: null })).props.value;
  assert.equal(render().isAuthenticated, false);
  assert.equal(await render().login({ email: "admin@example.test", password: "fixture" }), undefined);
  assert.equal(render().admin, user);
  assert.equal(render().isAuthenticated, true);
  assert.equal(isFreshLoginWelcome(render().loginWelcome), true);
  render().consumeLoginWelcome();
  assert.equal(render().loginWelcome, null);
  assert.equal(storage.get("saheli_admin_token"), "mock-token");
  // Simulate reload: retain session storage, discard provider state.
  hooks.state.length = 0;
  assert.equal(render().isRestoring, true);
  hooks.runEffect();
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(render().isRestoring, false);
  assert.equal(render().admin, user);
  assert.equal(calls.at(-1).endpoint, "/admin/profile/me");
  assert.equal(render().loginWelcome, null, "Restoring a session must not create a welcome event");
  expired = true;
  await assert.rejects(render().request("/admin/users"), /Expired/);
  assert.equal(render().isAuthenticated, false);
  assert.equal(storage.size, 0);
});

test("actual route guards retain session restoration and permission boundaries", () => {
  const auth = { isAuthenticated: false, isRestoring: true, admin: null };
  const location = { pathname: "/users", search: "?role=driver", hash: "#list" };
  const router = {
    Navigate: "Navigate", Outlet: "Outlet", NavLink: "NavLink",
    useLocation: () => location,
  };
  const authMock = { useAuth: () => auth };
  const { default: ProtectedRoute } = loadComponent("../src/features/auth/components/ProtectedRoute.jsx", {
    "react-router-dom": router,
    "../context/AuthContext": authMock,
    "../../../shared/components/States": { LoadingState: "LoadingState" },
  });
  assert.equal(ProtectedRoute().type, "LoadingState");
  auth.isRestoring = false;
  assert.equal(ProtectedRoute().props.to, "/login");
  assert.equal(ProtectedRoute().props.state.from, location);
  auth.isExplicitLogout = true;
  assert.equal(ProtectedRoute().props.state, null);
  auth.isExplicitLogout = false;
  auth.isAuthenticated = true;
  assert.equal(ProtectedRoute().type, "Outlet");

  const { default: OverviewRoute } = loadComponent("../src/features/overview/pages/OverviewRoute.jsx", {
    "react-router-dom": router,
    "../../auth/context/AuthContext": authMock,
    "../../auth/admin-access": { hasFullAdminAccess },
    "./OverviewPage": { default: "OverviewPage" },
  });
  const { default: SettingsPage } = loadComponent("../src/features/settings/pages/SettingsPage.jsx", {
    "react-router-dom": router,
    "lucide-react": { ShieldCheck: "ShieldCheck", UserRound: "UserRound", UsersRound: "UsersRound" },
    "../../../features/auth/context/AuthContext": authMock,
  });
  auth.admin = { permissions: [] };
  assert.equal(OverviewRoute().props.to, "/drivers");
  location.pathname = "/settings/admins";
  assert.equal(SettingsPage().props.to, "/settings/account");
  auth.admin = { permissions: ["manageAdmins"] };
  assert.notEqual(OverviewRoute().type, "Navigate");
  assert.equal(SettingsPage().type, "div");
});

test("explicit Layout logout clears the saved page and next login uses the role default", () => {
  for (const [permissions, expected] of [[["manageAdmins"], "/overview"], [[], "/drivers"]]) {
    const hooks = makeHooks();
    const location = {
      pathname: "/users", search: "?role=driver", hash: "#list",
      state: { from: { pathname: "/settings/admins" } },
    };
    const auth = {
      admin: { permissions }, isAuthenticated: true,
      logout(options) {
        assert.equal(options.explicit, true);
        auth.admin = null;
        auth.isAuthenticated = false;
      },
    };
    let navigation;
    const { default: Layout } = loadComponent("../src/app/layouts/Layout.jsx", {
      react: { ...hooks.react, useRef: () => ({ current: null }) },
      "react-router-dom": {
        NavLink: "NavLink", Outlet: "Outlet",
        useLocation: () => location,
        useNavigate: () => (to, options) => { navigation = { to, options }; },
      },
      "lucide-react": {},
      "../../assets/logo.png": { default: "test-logo" },
      "../../features/auth/context/AuthContext": { useAuth: () => auth },
      "../../features/auth/admin-access": { hasFullAdminAccess },
      "./DashboardSearch": { default: "DashboardSearch" },
      "../../shared/components/TopbarActions": { __esModule: true, default: "TopbarActions" },
      "../../shared/components/PageEntrance": { default: "PageEntrance" },
    }, { window: { matchMedia: () => ({ matches: false }) } });
    const tree = hooks.render(Layout);
    const sidebar = findElement(tree, "aside");
    assert.equal(JSON.stringify(sidebar).includes("sidebar-footer"), false);
    assert.equal(JSON.stringify(sidebar).includes("admin-chip"), false);
    findElement(tree, "TopbarActions").props.onLogout();
    assert.equal(auth.isAuthenticated, false);
    assert.equal(navigation?.to, "/login");
    assert.equal(navigation.options.replace, true);
    assert.equal(navigation.options.state, null);
    // Apply navigation, then simulate successful authentication on Login.
    location.pathname = navigation.to;
    location.search = "";
    location.hash = "";
    location.state = navigation.options.state;
    auth.admin = { permissions };
    auth.isAuthenticated = true;
    assert.equal(makeLogin(auth, location).render().props.to, expected);
  }
});

test("greeting periods use local-time boundaries and welcome signals expire", () => {
  for (const [hour, minute, expected] of [
    [4, 59, "Good night"], [5, 0, "Good morning"], [11, 59, "Good morning"],
    [12, 0, "Good afternoon"], [16, 59, "Good afternoon"], [17, 0, "Good evening"],
    [20, 59, "Good evening"], [21, 0, "Good night"], [0, 0, "Good night"],
  ]) {
    assert.equal(getGreetingPeriod(new Date(2026, 9, 28, hour, minute)).text, expected);
  }
  assert.equal(isFreshLoginWelcome({ createdAt: 1000 }, 1000), true);
  assert.equal(isFreshLoginWelcome({ createdAt: 1000 }, 15999), true);
  assert.equal(isFreshLoginWelcome({ createdAt: 1000 }, 16000), false);
  assert.equal(isFreshLoginWelcome(null, 1000), false);
  assert.equal(isFreshLoginWelcome({ createdAt: 2000 }, 1000), false);
});

test("unauthenticated protected deep links still reach Login and retain permitted destinations", () => {
  for (const [permissions, pathname, expected] of [
    [["manageAdmins"], "/users", "/users?role=driver#list"],
    [[], "/users", "/users?role=driver#list"],
    [[], "/overview", "/drivers"],
    [[], "/settings/admins", "/drivers"],
  ]) {
    const location = { pathname, search: "?role=driver", hash: "#list" };
    const auth = { admin: null, isAuthenticated: false, isRestoring: false };
    const { default: ProtectedRoute } = loadComponent("../src/features/auth/components/ProtectedRoute.jsx", {
      "react-router-dom": { Navigate: "Navigate", Outlet: "Outlet", useLocation: () => location },
      "../context/AuthContext": { useAuth: () => auth },
      "../../../shared/components/States": { LoadingState: "LoadingState" },
    });
    const redirect = ProtectedRoute();
    assert.equal(redirect.props.to, "/login");
    assert.equal(redirect.props.state.from, location);
    auth.admin = { permissions };
    auth.isAuthenticated = true;
    const destination = makeLogin(auth, { state: redirect.props.state }).render().props.to;
    assert.equal(destination, expected);
    assert.notEqual(destination, "/login");
  }
});

test("page entrance captures the login event once and uses a lighter entrance on later routes", () => {
  const auth = { loginWelcome: { createdAt: Date.now() } };
  const hooks = makeHooks();
  const { default: PageEntrance } = loadComponent("../src/shared/components/PageEntrance.jsx", {
    react: hooks.react,
    "../../features/auth/context/AuthContext": { useAuth: () => auth },
    "../utils/greeting": { isFreshLoginWelcome },
  });
  const render = () => hooks.render(() => PageEntrance({ children: "Authorized content" }));
  assert.equal(render().props.className, "page-entrance page-entrance--login");
  auth.loginWelcome = null;
  assert.equal(render().props.className, "page-entrance page-entrance--login");
  hooks.state.length = 0;
  assert.equal(render().props.className, "page-entrance");
});

test("Login clears stale route state before acknowledging explicit logout", () => {
  let completed = 0;
  const auth = {
    admin: null, isAuthenticated: false, isExplicitLogout: true,
    completeLogout: () => { completed++; auth.isExplicitLogout = false; },
  };
  const location = { state: { from: { pathname: "/users" } } };
  const page = makeLogin(auth, location);
  const cleanRedirect = page.render();
  assert.equal(cleanRedirect.props.to, "/login");
  assert.equal(cleanRedirect.props.state, null);
  page.hooks.runEffect();
  assert.equal(completed, 0);
  location.state = null;
  assert.equal(page.render().type, "div");
  page.hooks.runEffect();
  assert.equal(completed, 1);
  auth.admin = { permissions: [] };
  auth.isAuthenticated = true;
  assert.equal(page.render().props.to, "/drivers");
});
