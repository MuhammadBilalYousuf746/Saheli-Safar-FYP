import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import cors from 'cors';
import { createCorsOptions } from '../src/config/cors.js';
import { errorHandler } from '../src/middlewares/errorHandler.js';
import { createError } from '../src/utils/app-error.js';
import { sendEmailOtp } from '../src/modules/auth/otp.service.js';
import OTP from '../src/modules/auth/otp.model.js';

async function withServer(env, run) {
  // Deliberately do not import app/server, load .env, or connect to MongoDB/SMTP.
  const app = express();
  app.use(cors(createCorsOptions(env)));
  app.get('/probe', (req, res) => res.json({ success: true }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  try { await run(`http://127.0.0.1:${server.address().port}`); }
  finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
}

test('development allows exact Expo origin and preserves configured origins', async () => {
  await withServer({ NODE_ENV: 'development', CORS_ORIGIN: 'https://existing.example, http://localhost:3000' }, async base => {
    for (const origin of ['http://localhost:8081', 'https://existing.example', 'http://localhost:3000']) {
      const response = await fetch(base + '/probe', { headers: { Origin: origin } });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('access-control-allow-origin'), origin);
      assert.equal(response.headers.get('access-control-allow-credentials'), null);
    }
  });
});

test('JSON registration preflight is handled without invoking any registration handler', async () => {
  await withServer({ NODE_ENV: 'development' }, async base => {
    const response = await fetch(base + '/api/passenger/auth/register', { method: 'OPTIONS', headers: {
      Origin: 'http://localhost:8081', 'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    } });
    assert.equal(response.status, 204);
    assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:8081');
    assert.match(response.headers.get('access-control-allow-methods'), /POST/);
    assert.equal(response.headers.get('access-control-allow-headers'), 'content-type');
  });
});

test('external and lookalike origins receive no CORS permission', async () => {
  await withServer({ NODE_ENV: 'development' }, async base => {
    for (const origin of ['https://untrusted.example', 'http://localhost:8081.evil.example', 'http://localhost:8082', 'null']) {
      for (const method of ['GET', 'OPTIONS']) {
        const response = await fetch(base + '/probe', { method, headers: { Origin: origin, 'Access-Control-Request-Method': 'POST' } });
        assert.equal(response.headers.get('access-control-allow-origin'), null);
      }
    }
  });
});

test('production retains its allowlist without the development exception', async () => {
  await withServer({ NODE_ENV: 'production', CORS_ORIGIN: 'https://existing.example' }, async base => {
    for (const origin of ['http://localhost:8081', 'https://untrusted.example', 'https://existing.example']) {
      const response = await fetch(base + '/probe', { headers: { Origin: origin } });
      assert.equal(response.headers.get('access-control-allow-origin'), origin === 'https://existing.example' ? origin : null);
    }
  });
  assert.equal(createCorsOptions({}).origin, false);
});

function render(error) {
  let status, body;
  const res = { headersSent: false, status(value) { status = value; return this; }, json(value) { body = value; return this; } };
  errorHandler(error, {}, res, () => assert.fail('Unexpected next'));
  return { status, body };
}

test('trusted application 502 and 503 preserve safe messages and JSON contract', () => {
  for (const status of [502, 503]) {
    const message = status === 502 ? 'Verification email could not be sent. Please try again.' : 'Email verification is temporarily unavailable.';
    assert.deepEqual(render(createError(message, status)), { status, body: { success: false, message } });
  }
});

test('unexpected, forged and unsupported server errors remain sanitized 500', t => {
  t.mock.method(console, 'error', () => {});
  for (const error of [new Error('PRIVATE INTERNAL DETAIL'),
    Object.assign(new Error('PRIVATE INTERNAL DETAIL'), { statusCode: 502, isOperational: true }),
    Object.assign(new Error('PRIVATE INTERNAL DETAIL'), { statusCode: 503 }),
    Object.assign(new Error('PRIVATE INTERNAL DETAIL'), { statusCode: '502' }),
    createError('PRIVATE INTERNAL DETAIL', 501), createError('PRIVATE INTERNAL DETAIL', 500)]) {
    assert.deepEqual(render(error), { status: 500, body: { success: false, message: 'Internal server error.' } });
  }
});

test('existing authentication and client error statuses are preserved', () => {
  for (const status of [400, 401, 403, 404, 409, 429]) {
    assert.deepEqual(render(Object.assign(new Error('Expected error'), { statusCode: status })),
      { status, body: { success: false, message: 'Expected error' } });
  }
});

test('actual OTP delivery-failure branch produces a trusted, safe 502 using only mocked storage/email', async t => {
  t.mock.method(console, 'error', () => {});
  const previous = process.env.OTP_HMAC_SECRET;
  process.env.OTP_HMAC_SECRET = 'isolated-test-only-hmac-key-at-least-32-characters';
  let removed = false;
  t.mock.method(OTP, 'findOneAndUpdate', async () => ({ _id: 'mock-record' }));
  t.mock.method(OTP, 'deleteOne', async () => { removed = true; });
  try {
    await assert.rejects(sendEmailOtp({ email: 'test@example.invalid', purpose: 'email_verification',
      sendEmail: async () => { throw new Error('PRIVATE SMTP DETAIL'); },
    }), error => {
      assert.deepEqual(render(error), { status: 502, body: { success: false,
        message: 'Verification email could not be sent. Please try again.' } });
      return true;
    });
    assert.equal(removed, true);
  } finally {
    if (previous === undefined) delete process.env.OTP_HMAC_SECRET;
    else process.env.OTP_HMAC_SECRET = previous;
  }
});
