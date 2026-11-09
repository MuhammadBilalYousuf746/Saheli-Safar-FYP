import test from 'node:test';
import assert from 'node:assert/strict';
import OTP from '../src/modules/auth/otp.model.js';
import { sendEmailOtp, verifyEmailOtp } from '../src/modules/auth/otp.service.js';
import { hashOtp } from '../src/modules/auth/otp-crypto.js';

process.env.OTP_HMAC_SECRET = 'isolated-otp-test-secret-at-least-32-characters';
const query = value => ({ select: () => Promise.resolve(value) });
function fixture(t) {
  let record = null;
  t.mock.method(OTP, 'findOneAndUpdate', async (filter, operation) => {
    if (operation.$set.otpHash) {
      if (record && record.expiresAt > filter.expiresAt.$lte) throw Object.assign(new Error('cooldown'), { code: 11000 });
      record = { _id: 'mock-otp', email: filter.email, purpose: filter.purpose, ...operation.$set };
      return structuredClone(record);
    }
    if (!record || record.consumedAt || record.expiresAt <= new Date() || record.attempts >= 5 || record.otpHash !== filter.otpHash) return null;
    record.consumedAt = operation.$set.consumedAt; return structuredClone(record);
  });
  t.mock.method(OTP, 'findOne', filter => query(record && record.email === filter.email && record.purpose === filter.purpose ? structuredClone(record) : null));
  t.mock.method(OTP, 'updateOne', async () => { if (record && !record.consumedAt && record.attempts < 5) record.attempts++; });
  t.mock.method(OTP, 'deleteOne', async () => { record = null; });
  let delivered;
  const send = () => sendEmailOtp({ email: 'otp@example.invalid', purpose: 'email_verification',
    registration: { fullName: 'Passenger', phone: '+923001234567', role: 'passenger' }, sendEmail: async ({ otp }) => { delivered = otp; } });
  return { send, otp: () => delivered, record: () => record, verify: (otp, purpose = 'email_verification') => verifyEmailOtp({ email: 'otp@example.invalid', purpose, otp }) };
}

test('registration OTP retains secure hash, registration details, five-minute expiry and cooldown', async t => {
  const f = fixture(t); assert.deepEqual(await f.send(), { expiresInSeconds: 300 });
  assert.match(f.otp(), /^\d{6}$/); assert.equal(f.record().otpHash, hashOtp('otp@example.invalid', 'email_verification', f.otp()));
  assert.equal(f.record().registration.role, 'passenger');
  assert.ok(f.record().expiresAt - Date.now() <= 300000);
  await assert.rejects(f.send(), { statusCode: 429 });
});

test('registration OTP cannot verify another purpose or replay after consumption', async t => {
  const f = fixture(t); await f.send(); assert.equal(await f.verify(f.otp(), 'password_reset'), null);
  assert.ok(await f.verify(f.otp())); assert.equal(await f.verify(f.otp()), null);
});

test('registration OTP rejects expired codes and locks after five failed attempts', async t => {
  const f = fixture(t); await f.send(); const wrong = f.otp() === '000000' ? '999999' : '000000';
  for (let i = 0; i < 5; i++) assert.equal(await f.verify(wrong), null);
  assert.equal(await f.verify(f.otp()), null); assert.equal(f.record().attempts, 5);
  f.record().attempts = 0; f.record().expiresAt = new Date(0);
  assert.equal(await f.verify(f.otp()), null);
});
