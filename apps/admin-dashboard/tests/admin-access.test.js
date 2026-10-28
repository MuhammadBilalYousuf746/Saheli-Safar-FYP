import assert from "node:assert/strict";
import test from "node:test";

import {
  getAdminLoginRedirect,
  hasFullAdminAccess,
} from "../src/features/auth/admin-access.js";

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

  assert.equal(getAdminLoginRedirect(admin), "/");
  assert.equal(getAdminLoginRedirect(admin, "/drivers"), "/drivers");
});
