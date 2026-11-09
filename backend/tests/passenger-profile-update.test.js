import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../src/modules/auth/user.model.js';
import PassengerProfile from '../src/modules/passenger/passenger.model.js';
import passengerRoutes from '../src/modules/passenger/passenger.routes.js';
import { getPassengerProfile, updatePassengerProfile } from '../src/modules/passenger/passenger.service.js';
import { updatePassengerProfileSchema } from '../src/modules/passenger/passenger.validation.js';
import { createAccessToken } from '../src/modules/auth/token.service.js';
import { errorHandler } from '../src/middlewares/errorHandler.js';

// No .env, MongoDB connection or SMTP sender is loaded by these isolated tests.
process.env.JWT_ACCESS_SECRET = 'isolated-profile-edit-test-secret-at-least-32-characters';
const id = '0123456789abcdef01234567', otherId = 'ffffffffffffffffffffffff';
const owner = { _id: id, fullName: 'Original Passenger', email: 'passenger@example.invalid', phone: '+923001234567', role: 'passenger', status: 'active', isEmailVerified: true, authVersion: 0, passwordHash: 'PRIVATE', createdAt: new Date('2026-10-25T10:30:00Z') };
const contact = { name: 'Emergency Person', phone: '+923009876543', relationship: 'Sister' };
const clone = value => structuredClone(value);
const query = run => { const result = { then: (yes, no) => Promise.resolve().then(run).then(yes, no) }; result.select = () => result; return result; };
function matches(value, filter) {
  return value && Object.entries(filter).every(([key, expected]) => {
    if (key === '$or') return expected.some(option => matches(value, option));
    const actual = key.split('.').reduce((object, field) => object?.[field], value);
    return expected === null ? actual == null : String(actual) === String(expected);
  });
}
function fixture(t) {
  const users = [clone(owner), { ...clone(owner), _id: otherId, fullName: 'Other Passenger', email: 'other@example.invalid' }];
  const profiles = [{ _id: '1234567890abcdef12345678', user: id, emergencyContact: null }];
  const state = { fail: false, writes: [] };
  const read = (rows, filter) => clone(rows.find(value => matches(value, filter)) || null);
  const update = (rows, filter, changes, options) => query(() => {
    if (state.fail) throw new Error('PRIVATE DATABASE DETAILS');
    state.writes.push({ filter: clone(filter), changes: clone(changes), options: clone(options) });
    const value = rows.find(row => matches(row, filter));
    if (!value) return null;
    Object.assign(value, clone(changes.$set)); return clone(value);
  });
  t.mock.method(User, 'findById', userId => query(() => read(users, { _id: userId })));
  t.mock.method(User, 'findOne', filter => query(() => read(users, filter)));
  t.mock.method(User, 'findOneAndUpdate', (filter, changes, options) => update(users, filter, changes, options));
  t.mock.method(PassengerProfile, 'findOne', filter => query(() => read(profiles, filter)));
  t.mock.method(PassengerProfile, 'findOneAndUpdate', (filter, changes, options) => update(profiles, filter, changes, options));
  return { users, profiles, state };
}
const namePatch = fullName => ({ fullName, expectedFullName: owner.fullName });
const contactPatch = (emergencyContact = contact, expectedEmergencyContact = null) => ({ emergencyContact, expectedEmergencyContact });

test('existing GET returns own sanitized profile and empty contact', async t => {
  fixture(t); const user = await getPassengerProfile(id);
  assert.equal(user.id, id); assert.equal(user.fullName, owner.fullName); assert.equal(user.emergencyContact, null);
  for (const key of ['passwordHash', 'authVersion', 'passwordResetVersion', 'otpHash', 'accessToken']) assert.equal(key in user, false);
});

test('atomic name persistence only updates allowed name and preserves identifiers/security fields', async t => {
  const f = fixture(t); const saved = await updatePassengerProfile(id, namePatch('  Updated Passenger  '));
  assert.equal(saved.fullName, 'Updated Passenger'); assert.equal(f.users[0].fullName, 'Updated Passenger');
  assert.equal(f.users[0].email, owner.email); assert.equal(f.users[0].phone, owner.phone); assert.equal(f.users[0].authVersion, 0);
  assert.deepEqual(f.state.writes[0].changes, { $set: { fullName: 'Updated Passenger' } });
  assert.equal(f.state.writes[0].options.runValidators, true); assert.equal(f.state.writes[0].options.session, undefined);
  assert.equal(f.users[1].fullName, 'Other Passenger');
});

test('creates, reads, updates and removes one normalized emergency-contact subdocument', async t => {
  const f = fixture(t);
  const added = await updatePassengerProfile(id, contactPatch({ ...contact, phone: '03009876543' }));
  assert.deepEqual(added.emergencyContact, contact); assert.deepEqual((await getPassengerProfile(id)).emergencyContact, contact);
  const changed = { ...contact, name: 'Updated Contact', relationship: 'Mother' };
  assert.deepEqual((await updatePassengerProfile(id, contactPatch(changed, contact))).emergencyContact, changed);
  assert.equal(f.profiles.length, 1); assert.equal(Array.isArray(f.profiles[0].emergencyContact), false);
  assert.equal((await updatePassengerProfile(id, contactPatch(null, changed))).emergencyContact, null);
  assert.equal(f.users[0].fullName, owner.fullName);
});

test('single contact schema rejects arrays, invalid numbers and extra ownership properties', async () => {
  const valid = new PassengerProfile({ user: id, emergencyContact: contact }); await valid.validate();
  const invalid = new PassengerProfile({ user: id, emergencyContact: { ...contact, phone: '123' } }); await assert.rejects(invalid.validate());
  for (const emergencyContact of [[contact, contact], { ...contact, user: otherId }]) assert.throws(() => updatePassengerProfileSchema.parse(contactPatch(emergencyContact)));
  assert.equal(PassengerProfile.schema.path('emergencyContact').schema.options._id, false);
});

test('strict allowlist rejects forbidden identity/security fields and mixed writes before persistence', async t => {
  const f = fixture(t);
  for (const key of ['userId', '_id', 'user', 'email', 'phone', 'role', 'status', 'isEmailVerified', 'approvalStatus', 'passwordHash', 'authVersion', 'permissions']) {
    await assert.rejects(updatePassengerProfile(id, { ...namePatch('Updated Passenger'), [key]: 'forbidden' }), error => error.name === 'ZodError');
  }
  await assert.rejects(updatePassengerProfile(id, { ...namePatch('Updated Passenger'), ...contactPatch() }), error => error.name === 'ZodError');
  assert.equal(f.state.writes.length, 0); assert.deepEqual(f.users[0], owner);
});

test('field validation rejects empty/overlong names and missing contact details', async t => {
  const f = fixture(t);
  for (const fullName of ['', ' ', 'A', 'A'.repeat(81)]) await assert.rejects(updatePassengerProfile(id, namePatch(fullName)), error => error.issues.some(issue => issue.path[0] === 'fullName'));
  for (const draft of [{ ...contact, name: '' }, { ...contact, phone: '123' }, { ...contact, relationship: '' }, { name: 'Person', phone: contact.phone }]) {
    await assert.rejects(updatePassengerProfile(id, contactPatch(draft)), error => error.name === 'ZodError');
  }
  assert.equal(f.state.writes.length, 0);
});

test('missing profile and non-Passenger/inactive service identities cannot write', async t => {
  const f = fixture(t);
  await assert.rejects(updatePassengerProfile(otherId, namePatch('New Name')), { statusCode: 404 });
  f.users[0].role = 'driver'; await assert.rejects(updatePassengerProfile(id, namePatch('New Name')), { statusCode: 404 });
  f.users[0].role = 'passenger'; f.users[0].status = 'suspended'; await assert.rejects(updatePassengerProfile(id, namePatch('New Name')), { statusCode: 404 });
  assert.equal(f.state.writes.length, 0);
});

test('failed database saves preserve original name/contact', async t => {
  const f = fixture(t); f.profiles[0].emergencyContact = clone(contact); f.state.fail = true;
  await assert.rejects(updatePassengerProfile(id, namePatch('Failed Name')));
  await assert.rejects(updatePassengerProfile(id, contactPatch({ ...contact, name: 'Failed Contact' }, contact)));
  assert.equal(f.users[0].fullName, owner.fullName); assert.deepEqual(f.profiles[0].emergencyContact, contact);
});

test('concurrent stale name edits produce one success and one conflict', async t => {
  const f = fixture(t);
  const results = await Promise.allSettled([updatePassengerProfile(id, namePatch('First Name')), updatePassengerProfile(id, namePatch('Second Name'))]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(results.find(result => result.status === 'rejected').reason.statusCode, 409);
  assert.equal(f.users[0].fullName, 'First Name');
});

test('concurrent contact creation/update conflicts rather than producing multiple contacts', async t => {
  const f = fixture(t);
  const results = await Promise.allSettled([updatePassengerProfile(id, contactPatch()), updatePassengerProfile(id, contactPatch({ ...contact, name: 'Other Contact' }))]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(results.find(result => result.status === 'rejected').reason.statusCode, 409);
  assert.deepEqual(f.profiles[0].emergencyContact, contact); assert.equal(f.profiles.length, 1);
});

test('legacy profile without a contact field accepts first contact without a migration', async t => {
  const f = fixture(t); delete f.profiles[0].emergencyContact;
  assert.deepEqual((await updatePassengerProfile(id, contactPatch())).emergencyContact, contact);
});

test('actual HTTP auth, ownership, validation, missing-profile and sanitized-failure contracts', async t => {
  const f = fixture(t);
  const app = express(); app.use(express.json()); app.use('/api/passenger', passengerRoutes); app.use(errorHandler);
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/passenger/profile/me`;
  const token = createAccessToken(owner);
  const patch = (body, bearer = token, url = base) => fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) }, body: JSON.stringify(body) });
  try {
    assert.equal((await patch(namePatch('New Name'), null)).status, 401);
    for (const role of ['admin', 'driver']) assert.equal((await patch(namePatch('New Name'), createAccessToken({ ...owner, role }))).status, 403);
    const expired = jwt.sign({ tokenType: 'access', role: 'passenger', authVersion: 0 }, process.env.JWT_ACCESS_SECRET,
      { subject: id, issuer: 'saheli-safar-api', audience: 'saheli-safar-apps', expiresIn: -1 });
    assert.equal((await patch(namePatch('New Name'), expired)).status, 401);
    assert.equal((await patch({ ...namePatch('New Name'), userId: otherId })).status, 400);
    const invalid = await patch(namePatch('')); assert.equal(invalid.status, 400);
    assert.ok((await invalid.json()).errors.some(error => error.field === 'fullName'));
    const saved = await patch(namePatch('Saved Name'), token, base + '?userId=' + otherId);
    assert.equal(saved.status, 200); assert.equal(saved.headers.get('cache-control'), 'no-store');
    const body = await saved.json(); assert.equal(body.user.id, id); assert.equal(body.user.fullName, 'Saved Name');
    assert.equal('passwordHash' in body.user, false); assert.equal('authVersion' in body.user, false); assert.equal(f.users[1].fullName, 'Other Passenger');
    f.state.fail = true;
    const failed = await patch({ fullName: 'Failed Name', expectedFullName: 'Saved Name' }); assert.equal(failed.status, 500);
    assert.equal(JSON.stringify(await failed.json()).includes('PRIVATE'), false); assert.equal(f.users[0].fullName, 'Saved Name');
    f.state.fail = false; f.profiles.length = 0;
    assert.equal((await patch({ fullName: 'New Name', expectedFullName: 'Saved Name' })).status, 404);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});
