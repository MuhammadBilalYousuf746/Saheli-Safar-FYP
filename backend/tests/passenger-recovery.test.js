import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import express from 'express';
import { createPassengerRecoveryService } from '../src/modules/auth/passenger-recovery.service.js';
import { createPassengerRecoveryRoutes } from '../src/modules/auth/passenger-recovery.routes.js';
import { errorHandler } from '../src/middlewares/errorHandler.js';
import { hashOtp } from '../src/modules/auth/otp-crypto.js';
import { createAccessToken } from '../src/modules/auth/token.service.js';
import { requireAuth } from '../src/modules/auth/auth.middleware.js';
import User from '../src/modules/auth/user.model.js';

// These tests never load .env, connect to MongoDB or instantiate an email transport.
process.env.OTP_HMAC_SECRET = 'isolated-recovery-test-secret-at-least-32-characters';
process.env.JWT_ACCESS_SECRET = 'isolated-access-test-secret-at-least-32-characters';
const clone = value => structuredClone(value);
const query = run => { const value = { then: (yes, no) => Promise.resolve().then(run).then(yes, no) };
  for (const method of ['select', 'session']) value[method] = () => value; return value; };
function matches(value, filter) {
  return value && Object.entries(filter).every(([key, expected]) => {
    const actual = value[key];
    if (expected && typeof expected === 'object' && !(expected instanceof Date)) {
      return Object.entries(expected).every(([operator, operand]) => operator === '$gt' ? actual > operand : operator === '$lt' ? actual < operand : false);
    }
    return actual instanceof Date ? +actual === +expected : String(actual) === String(expected);
  });
}
function collection(initial = []) {
  let values = initial.map(clone);
  const find = filter => values.find(value => matches(value, filter));
  const update = (value, operation, inserted) => {
    if (inserted) Object.assign(value, clone(operation.$setOnInsert || {}));
    Object.assign(value, clone(operation.$set || {}));
    for (const [key, count] of Object.entries(operation.$inc || {})) value[key] = (value[key] || 0) + count;
  };
  return {
    values: () => values, replace: snapshot => { values = snapshot; },
    findOne: filter => query(() => clone(find(filter) || null)),
    findById: id => query(() => clone(find({ _id: id }) || null)),
    findOneAndUpdate: (filter, operation, options = {}) => query(() => {
      let value = find(filter), inserted = false;
      if (!value && options.upsert) { value = clone(filter); values.push(value); inserted = true; }
      if (!value) return null;
      update(value, operation, inserted); return clone(value);
    }),
    updateOne: (filter, operation) => query(() => { const value = find(filter); if (!value) return { matchedCount: 0 }; update(value, operation); return { matchedCount: 1 }; }),
    deleteOne: filter => query(() => { const index = values.findIndex(value => matches(value, filter)); if (index < 0) return { deletedCount: 0 }; values.splice(index, 1); return { deletedCount: 1 }; }),
  };
}
const passenger = { _id: '0123456789abcdef01234567', email: 'passenger@example.invalid', fullName: 'Passenger', role: 'passenger', status: 'active', isEmailVerified: true, authVersion: 0, passwordResetVersion: 0, passwordHash: bcrypt.hashSync('OldStrongPass1', 4) };
function fixture(user = passenger) {
  const users = collection(user ? [user] : []), records = collection(), attempts = collection();
  let time = Date.now(), tail = Promise.resolve(); const jobs = [], mail = [], logs = [];
  const transaction = run => {
    const result = tail.catch(() => {}).then(async () => {
      const snapshots = [users, records].map(model => clone(model.values()));
      try { return await run({ testSession: true }); }
      catch (error) { [users, records].forEach((model, index) => model.replace(snapshots[index])); throw error; }
    }); tail = result; return result;
  };
  const service = createPassengerRecoveryService({ users, records, attempts, transaction,
    clock: () => new Date(time), enqueue: job => jobs.push(job), report: () => logs.push('delivery failed') });
  const sendEmail = async message => mail.push(message);
  const drain = async () => { while (jobs.length) await jobs.shift()(); };
  const request = email => service.request({ email: email || passenger.email, sendEmail });
  const grant = async () => { await request(); await drain(); return service.verify({ email: passenger.email, otp: mail.at(-1).otp }); };
  return { service, users, records, attempts, mail, logs, jobs, request, drain, grant, sendEmail, advance: ms => { time += ms; } };
}
const resetInput = token => ({ token, password: 'NewStrongPass1', confirmPassword: 'NewStrongPass1' });

test('request privacy for unknown, Admin, Driver and ineligible Passenger accounts', async () => {
  const results = [];
  for (const user of [null, { ...passenger, role: 'admin' }, { ...passenger, role: 'driver' }, { ...passenger, status: 'suspended' }, { ...passenger, status: 'pending' }, { ...passenger, isEmailVerified: false }, passenger]) {
    const f = fixture(user); results.push(await f.request()); assert.equal(f.mail.length, 0, 'response does not await delivery');
    await f.drain(); assert.equal(f.mail.length, user === passenger ? 1 : 0);
  }
  for (const result of results) assert.deepEqual(result, results[0]);
});

test('email normalization and malformed email rejection', async () => {
  const f = fixture(); await f.request(' PASSENGER@EXAMPLE.INVALID '); await f.drain(); assert.equal(f.mail.length, 1);
  await assert.rejects(f.request('invalid'), error => error.name === 'ZodError');
});

test('secure OTP storage, purpose isolation, and no secret in public response', async () => {
  const f = fixture(); const result = await f.request(); await f.drain(); const message = f.mail[0], record = f.records.values()[0];
  assert.match(message.otp, /^\d{6}$/); assert.equal(message.purpose, 'password_reset');
  assert.equal(record.otpHash, hashOtp(passenger.email, 'passenger_password_reset', message.otp));
  assert.notEqual(record.otpHash, hashOtp(passenger.email, 'email_verification', message.otp));
  assert.equal(JSON.stringify(record).includes('"otp":'), false);
  assert.deepEqual(Object.keys(result).sort(), ['expiresInSeconds', 'message', 'retryAfterSeconds']);
  assert.equal(record.expiresAt - record.sentAt, 300000);
});

test('five wrong attempts lock verification; expired and reused OTPs fail', async () => {
  const f = fixture(); await f.request(); await f.drain(); const otp = f.mail[0].otp;
  const wrong = otp === '000000' ? '999999' : '000000';
  for (let i = 0; i < 5; i++) await assert.rejects(f.service.verify({ email: passenger.email, otp: wrong }), { statusCode: 400 });
  await assert.rejects(f.service.verify({ email: passenger.email, otp }), { statusCode: 400 });
  assert.equal(f.records.values()[0].attempts, 5);
  const expired = fixture(); await expired.request(); await expired.drain(); expired.advance(300001);
  await assert.rejects(expired.service.verify({ email: passenger.email, otp: expired.mail[0].otp }), { statusCode: 400 });
  const used = fixture(); await used.grant(); await assert.rejects(used.service.verify({ email: passenger.email, otp: used.mail[0].otp }), { statusCode: 400 });
});

test('cooldown, resend replacement and account request cap', async () => {
  const f = fixture(); await f.request(); await f.drain(); const first = clone(f.records.values()[0]);
  await f.request(); await f.drain(); assert.equal(f.mail.length, 1);
  f.advance(60001); await f.request(); await f.drain(); assert.equal(f.mail.length, 2);
  assert.notEqual(f.records.values()[0].challenge, first.challenge);
  await assert.rejects(f.service.verify({ email: passenger.email, otp: f.mail[0].otp }), { statusCode: 400 });
  // Compare the old challenge rather than relying on randomly generated codes being different.
  f.advance(60001); await f.request(); await f.drain(); assert.equal(f.mail.length, 2, 'fourth account request is silently capped');
});

test('concurrent issuance and verification permit only one current challenge/grant', async () => {
  const f = fixture(); await Promise.all([f.request(), f.request()]); await f.drain(); assert.equal(f.mail.length, 1);
  const input = { email: passenger.email, otp: f.mail[0].otp };
  const results = await Promise.allSettled([f.service.verify(input), f.service.verify(input)]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
});

test('single-use reset changes bcrypt password and increments session/version counters', async () => {
  const f = fixture(); const { resetToken } = await f.grant();
  assert.equal(await bcrypt.compare('OldStrongPass1', f.users.values()[0].passwordHash), true);
  assert.match(resetToken, /^[A-Za-z0-9_-]{43}$/); assert.notEqual(f.records.values()[0].resetHash, resetToken);
  const results = await Promise.allSettled([f.service.reset(resetInput(resetToken)), f.service.reset(resetInput(resetToken))]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  const user = f.users.values()[0]; assert.equal(await bcrypt.compare('NewStrongPass1', user.passwordHash), true);
  assert.equal(await bcrypt.compare('OldStrongPass1', user.passwordHash), false);
  assert.equal(bcrypt.getRounds(user.passwordHash), 12);
  assert.equal(user.authVersion, 1); assert.equal(user.passwordResetVersion, 2); assert.equal(f.records.values().length, 0);
});

test('password policy and confirmation rejected without consuming the grant', async () => {
  const f = fixture(); const { resetToken } = await f.grant();
  for (const data of [{ password: 'weak', confirmPassword: 'weak' }, { password: 'NoNumberHere', confirmPassword: 'NoNumberHere' },
    { password: 'lowercase1', confirmPassword: 'lowercase1' }, { password: 'UPPERCASE1', confirmPassword: 'UPPERCASE1' },
    { password: 'NewStrongPass1', confirmPassword: 'Mismatch1' }, { password: 'Aa1' + '�'.repeat(36), confirmPassword: 'Aa1' + '�'.repeat(36) }]) {
    await assert.rejects(f.service.reset({ token: resetToken, ...data }), error => error.name === 'ZodError');
  }
  assert.ok(f.records.values()[0].resetHash);
});

test('expired authorization, another identity and stale grant after resend are rejected', async () => {
  const f = fixture(); const { resetToken } = await f.grant();
  await assert.rejects(f.service.reset({ ...resetInput(resetToken), userId: 'ffffffffffffffffffffffff' }), error => error.name === 'ZodError');
  await assert.rejects(f.service.verify({ email: 'other@example.invalid', otp: f.mail[0].otp }), { statusCode: 400 });
  f.advance(60001); await f.request(); await f.drain(); await assert.rejects(f.service.reset(resetInput(resetToken)), { statusCode: 400 });
  const expired = fixture(); const grant = await expired.grant(); expired.advance(300001);
  await assert.rejects(expired.service.reset(resetInput(grant.resetToken)), { statusCode: 400 });
});

test('account becoming inactive or changing version prevents reset', async () => {
  for (const patch of [{ status: 'suspended' }, { role: 'driver' }, { authVersion: 1 }, { passwordResetVersion: 99 }]) {
    const f = fixture(); const { resetToken } = await f.grant(); Object.assign(f.users.values()[0], patch);
    await assert.rejects(f.service.reset(resetInput(resetToken)), { statusCode: 400 });
    assert.equal(f.users.values()[0].passwordHash, passenger.passwordHash);
  }
});

test('SMTP failure retains generic response, cleans matching record and logs no secrets', async () => {
  const f = fixture(); const response = await f.service.request({ email: passenger.email, sendEmail: async () => { throw new Error('PRIVATE SMTP DETAIL'); } });
  await f.drain(); assert.deepEqual(response, await fixture(null).request());
  assert.equal(f.records.values().length, 0); assert.deepEqual(f.logs, ['delivery failed']);
  await assert.rejects(f.service.request({ email: passenger.email, sendEmail: null }), { statusCode: 503 });
});

test('old access token is rejected by existing authVersion middleware after reset', async t => {
  const f = fixture(); const oldToken = createAccessToken(passenger); const grant = await f.grant(); await f.service.reset(resetInput(grant.resetToken));
  t.mock.method(User, 'findById', () => query(() => f.users.values()[0]));
  let status, body, reached = false;
  const res = { status(value) { status = value; return this; }, json(value) { body = value; return this; } };
  await requireAuth('passenger')({ get: () => `Bearer ${oldToken}` }, res, () => { reached = true; });
  assert.equal(status, 401); assert.equal(body.success, false); assert.equal(reached, false);
});

test('HTTP contracts validate inputs, sanitize failures, and rate-limit without database/email', async () => {
  const app = express(); app.use(express.json()); app.locals.sendVerificationEmail = () => {};
  const service = { request: async () => ({ message: 'Generic response', expiresInSeconds: 300, retryAfterSeconds: 60 }),
    verify: async () => { throw new Error('PRIVATE DATABASE DETAIL'); }, reset: async () => ({ message: 'Reset' }) };
  app.use('/api/passenger/auth', createPassengerRecoveryRoutes(service)); app.use(errorHandler);
  const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/passenger/auth`;
  try {
    const post = (route, body) => fetch(base + route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const response = await post('/forgot-password', { email: passenger.email }); assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'no-store');
    const failed = await post('/verify-reset-otp', {}); assert.equal(failed.status, 503); assert.equal(JSON.stringify(await failed.json()).includes('PRIVATE'), false);
    for (let i = 0; i < 9; i++) await post('/forgot-password', { email: passenger.email });
    const limited = await post('/forgot-password', { email: passenger.email }); assert.equal(limited.status, 429);
  } finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
});

test('delayed older request cannot overwrite a newer recovery challenge', async () => {
  const f = fixture(); await f.request(); const oldJob = f.jobs.shift(); f.advance(60001);
  await f.request(); await f.drain(); const challenge = f.records.values()[0].challenge;
  f.advance(60001); await oldJob();
  assert.equal(f.records.values()[0].challenge, challenge); assert.equal(f.mail.length, 1);
});
