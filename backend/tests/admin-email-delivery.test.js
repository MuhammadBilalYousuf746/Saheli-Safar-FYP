import assert from "node:assert/strict";
import test from "node:test";
import nodemailer from "nodemailer";

import {
  createAdminEmailChangeSender,
  createPasswordResetEmailSender,
} from "../src/config/email.js";

const EMAIL_CONFIG_KEYS = [
  "EMAIL_PROVIDER",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "EMAIL_FROM",
  "ADMIN_FRONTEND_URL",
  "NODE_ENV",
];

const withMockSmtp = async (run) => {
  const previousEnvironment = Object.fromEntries(
    EMAIL_CONFIG_KEYS.map((key) => [key, process.env[key]])
  );
  const originalCreateTransport = nodemailer.createTransport;
  const messages = [];

  Object.assign(process.env, {
    EMAIL_PROVIDER: "smtp",
    SMTP_HOST: "smtp.example.test",
    SMTP_PORT: "465",
    SMTP_USER: "sender@example.test",
    SMTP_PASS: "test-placeholder",
    EMAIL_FROM: "Saheli Safar <sender@example.test>",
    ADMIN_FRONTEND_URL: "https://admin.example.test",
    NODE_ENV: "test",
  });
  nodemailer.createTransport = () => ({
    sendMail: async (message) => {
      messages.push(message);
      return {
        accepted: [message.to],
        rejected: [],
        messageId: "mock-message-id",
      };
    },
  });

  try {
    await run(messages);
  } finally {
    nodemailer.createTransport = originalCreateTransport;
    for (const [key, value] of Object.entries(previousEnvironment)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
};

test("admin password reset email links to the existing reset page", async () => {
  await withMockSmtp(async (messages) => {
    const sendEmail = createPasswordResetEmailSender();
    const token = "a".repeat(43);

    await sendEmail({
      to: "admin@example.test",
      name: "Test Admin",
      token,
      expiresInMinutes: 15,
    });

    assert.equal(messages.length, 1);
    const resetLink = messages[0].text
      .split("\n")
      .find((line) => line.startsWith("https://"));
    assert.equal(
      resetLink,
      `https://admin.example.test/reset-password?token=${token}`
    );
    assert.equal(messages[0].to, "admin@example.test");
  });
});

test("admin email verification uses the existing verification route", async () => {
  await withMockSmtp(async (messages) => {
    const sendEmail = createAdminEmailChangeSender();
    const token = "b".repeat(43);

    await sendEmail({
      to: "new-admin@example.test",
      name: "Test Admin",
      token,
      expiresInMinutes: 30,
    });

    assert.equal(messages.length, 1);
    const verifyLink = messages[0].text
      .split("\n")
      .find((line) => line.startsWith("https://"));
    assert.equal(
      verifyLink,
      `https://admin.example.test/verify-admin-email?token=${token}`
    );
    assert.equal(messages[0].to, "new-admin@example.test");
  });
});
