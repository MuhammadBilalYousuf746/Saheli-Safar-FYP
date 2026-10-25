
import nodemailer from "nodemailer";

/**
 * Saheli Safar Email Provider
 *
 * EMAIL_PROVIDER=console  (development only)
 *   Display OTP in local backend terminal. No email is sent.
 *
 * EMAIL_PROVIDER=smtp
 *   Send real emails. Requires:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM
 *   Gmail: SMTP_HOST=smtp.gmail.com, SMTP_PORT=465,
 *          SMTP_PASS = a Google "App password".
 */

const SUBJECTS = {
  email_verification: "Your Saheli Safar verification code",
  password_reset: "Your Saheli Safar password reset code",
  admin_password_reset: "Reset Your Saheli Safar Admin Password",
};

const validatePayload = ({ to, otp }) => {
  if (
    typeof to !== "string" ||
    !to.includes("@") ||
    typeof otp !== "string" ||
    !/^[0-9]{6}$/.test(otp)
  ) {
    throw new Error("Invalid email payload.");
  }
};

// Names come from user input, so escape them before putting them in HTML.
const escapeHtml = (text) =>
  text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const buildMessage = ({ name, otp, purpose, expiresInMinutes }) => {
  const greeting = name ? `Hi ${escapeHtml(name)},` : "Hi,";
  const action =
    purpose === "password_reset"
      ? "reset your password"
      : "verify your email address";

  const text = [
    greeting,
    "",
    `Use this code to ${action}: ${otp}`,
    "",
    `The code expires in ${expiresInMinutes} minutes.`,
    "If you did not request this, you can ignore this email.",
    "",
    "— Saheli Safar",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #25232A; max-width: 480px;">
      <h2 style="color: #552D50;">Saheli Safar</h2>
      <p>${greeting}</p>
      <p>Use this code to ${action}:</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #552D50;">${otp}</p>
      <p>The code expires in ${expiresInMinutes} minutes.</p>
      <p style="color: #716B73; font-size: 13px;">If you did not request this, you can ignore this email.</p>
    </div>
  `;

  return { text, html };
};

const createTransporter = () => {
  const port = Number(process.env.SMTP_PORT);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendSmtpMessage = async (transporter, message, purpose) => {
  try {
    const result = await transporter.sendMail(message);
    const accepted = Array.isArray(result.accepted) ? result.accepted : [];
    const rejected = Array.isArray(result.rejected) ? result.rejected : [];

    console.info("SMTP message accepted by provider.", {
      purpose,
      messageId: result.messageId || "unavailable",
      acceptedRecipients: accepted.length,
      rejectedRecipients: rejected.length,
    });

    if (rejected.length > 0 || accepted.length === 0) {
      const error = new Error("SMTP provider did not accept the recipient.");
      error.code = "SMTP_RECIPIENT_REJECTED";
      throw error;
    }

    return result;
  } catch (error) {
    console.error("SMTP message delivery failed.", {
      purpose,
      code: typeof error?.code === "string" ? error.code : "unknown",
      responseCode: Number.isInteger(error?.responseCode)
        ? error.responseCode
        : null,
    });
    throw error;
  }
};

const createConsoleProvider = () => {
  console.log("⚠️ Email : Development console mode");

  return async ({ to, otp, purpose }) => {
    validatePayload({ to, otp });

    console.log("\n📧 DEVELOPMENT OTP");
    console.log(`Email   : ${to}`);
    console.log(`Purpose : ${purpose}`);
    console.log(`OTP     : ${otp}`);
    console.log("Status  : Simulated (not sent)\n");
  };
};

const createSmtpProvider = () => {
  const missing = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "EMAIL_FROM",
  ].filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ Email : Missing ${missing.join(", ")} in .env`);
    return null;
  }

  const transporter = createTransporter();

  console.log(`✅ Email : SMTP (${process.env.SMTP_HOST})`);

  return async ({ to, name, otp, purpose, expiresInMinutes }) => {
    validatePayload({ to, otp });

    const { text, html } = buildMessage({
      name,
      otp,
      purpose,
      expiresInMinutes,
    });

    await sendSmtpMessage(transporter, {
      from: process.env.EMAIL_FROM,
      to,
      subject: SUBJECTS[purpose] || SUBJECTS.email_verification,
      text,
      html,
    }, purpose || "email_verification");
  };
};

const getAdminFrontendUrl = () => {
  const configuredUrl = process.env.ADMIN_FRONTEND_URL;

  if (!configuredUrl) return null;

  try {
    const url = new URL(configuredUrl);
    const isLocalDevelopment =
      process.env.NODE_ENV === "development" &&
      ["localhost", "127.0.0.1"].includes(url.hostname);

    if (
      (url.protocol !== "https:" && !isLocalDevelopment) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    ) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
};

export const createPasswordResetEmailSender = () => {
  if (process.env.EMAIL_PROVIDER !== "smtp") {
    console.error(
      "Password reset email is unavailable: configure EMAIL_PROVIDER=smtp and SMTP credentials."
    );
    return null;
  }

  const missing = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "EMAIL_FROM",
    "ADMIN_FRONTEND_URL",
  ].filter((key) => !process.env[key]);
  const frontendUrl = getAdminFrontendUrl();

  if (missing.length > 0 || !frontendUrl) {
    const configurationErrors = [
      ...missing,
      ...(!frontendUrl && process.env.ADMIN_FRONTEND_URL
        ? ["ADMIN_FRONTEND_URL (must be a trusted HTTPS URL)"]
        : []),
    ];
    console.error(
      `Password reset email is not configured: ${configurationErrors.join(", ")}.`
    );
    return null;
  }

  const port = Number(process.env.SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error("Password reset email is not configured: SMTP_PORT is invalid.");
    return null;
  }

  const transporter = createTransporter();
  const resetBase = new URL("/reset-password", frontendUrl);

  return async ({ to, name, token, expiresInMinutes }) => {
    if (
      typeof to !== "string" ||
      !to.includes("@") ||
      typeof token !== "string" ||
      !/^[A-Za-z0-9_-]{43}$/.test(token)
    ) {
      throw new Error("Invalid password reset email payload.");
    }

    const resetUrl = new URL(resetBase);
    resetUrl.searchParams.set("token", token);
    const greeting = name ? `Hi ${escapeHtml(name)},` : "Hello,";
    const text = [
      "We received a request to reset your Saheli Safar Admin password.",
      "Use the secure link below to choose a new password:",
      resetUrl.toString(),
      "",
      `This link expires in ${expiresInMinutes} minutes and can only be used once.`,
      "If you did not request this, you can ignore this email.",
      "",
      "Saheli Safar",
    ].join("\n");
    const html = `
      <div style="margin:0;padding:32px 16px;background:#fcf9f6;font-family:Arial,sans-serif;color:#25232a">
        <div style="max-width:520px;margin:0 auto;padding:32px;background:#fff;border:1px solid #e9e1e5;border-radius:12px">
          <h1 style="margin:0 0 24px;color:#382039;font-size:24px">Saheli Safar</h1>
          <p>${greeting}</p>
          <p>We received a request to reset your Saheli Safar Admin password. Use the secure link below to choose a new password.</p>
          <p style="margin:28px 0">
            <a href="${escapeHtml(resetUrl.toString())}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#552d50;color:#fff;text-decoration:none;font-weight:600">Reset Password</a>
          </p>
          <p>This link expires in ${expiresInMinutes} minutes and can only be used once.</p>
          <p style="color:#716b73;font-size:13px">If you did not request this, you can ignore this email. Your password will remain unchanged.</p>
        </div>
      </div>
    `;

    await sendSmtpMessage(transporter, {
      from: process.env.EMAIL_FROM,
      to,
      subject: SUBJECTS.admin_password_reset,
      text,
      html,
    }, "admin_password_reset");
  };
};

export const createAdminEmailChangeSender = () => {
  if (process.env.EMAIL_PROVIDER !== "smtp") {
    console.error(
      "Admin email verification is unavailable: configure EMAIL_PROVIDER=smtp and SMTP credentials."
    );
    return null;
  }

  const missing = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "EMAIL_FROM",
    "ADMIN_FRONTEND_URL",
  ].filter((key) => !process.env[key]);
  const frontendUrl = getAdminFrontendUrl();

  if (missing.length > 0 || !frontendUrl) {
    console.error(
      `Admin email verification is not configured: ${[
        ...missing,
        ...(!frontendUrl && process.env.ADMIN_FRONTEND_URL
          ? ["ADMIN_FRONTEND_URL (must be a trusted HTTPS URL)"]
          : []),
      ].join(", ")}.`
    );
    return null;
  }

  const port = Number(process.env.SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error("Admin email verification is not configured: SMTP_PORT is invalid.");
    return null;
  }

  const transporter = createTransporter();
  const verifyBase = new URL("/verify-admin-email", frontendUrl);

  return async ({ to, name, token, expiresInMinutes }) => {
    if (
      typeof to !== "string" ||
      !to.includes("@") ||
      typeof token !== "string" ||
      !/^[A-Za-z0-9_-]{43}$/.test(token)
    ) {
      throw new Error("Invalid admin email verification payload.");
    }

    const verifyUrl = new URL(verifyBase);
    verifyUrl.searchParams.set("token", token);
    const greeting = name ? `Hi ${escapeHtml(name)},` : "Hello,";
    const text = [
      greeting,
      "",
      "A Full Access administrator requested this address for your Saheli Safar Admin account.",
      "Verify the new email address using this secure link:",
      verifyUrl.toString(),
      "",
      `This link expires in ${expiresInMinutes} minutes and can only be used once.`,
      "Your current email remains active until verification completes.",
      "If you did not expect this change, contact a Full Access administrator.",
    ].join("\n");
    const html = `
      <div style="margin:0;padding:32px 16px;background:#fcf9f6;font-family:Arial,sans-serif;color:#25232a">
        <div style="max-width:520px;margin:0 auto;padding:32px;background:#fff;border:1px solid #e9e1e5;border-radius:12px">
          <h1 style="margin:0 0 24px;color:#382039;font-size:24px">Saheli Safar</h1>
          <p>${greeting}</p>
          <p>A Full Access administrator requested this address for your Saheli Safar Admin account. Verify it to complete the change.</p>
          <p style="margin:28px 0">
            <a href="${escapeHtml(verifyUrl.toString())}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#552d50;color:#fff;text-decoration:none;font-weight:600">Verify Email Address</a>
          </p>
          <p>This link expires in ${expiresInMinutes} minutes and can only be used once. Your current email remains active until verification completes.</p>
          <p style="color:#716b73;font-size:13px">If you did not expect this change, contact a Full Access administrator.</p>
        </div>
      </div>
    `;

    await sendSmtpMessage(transporter, {
      from: process.env.EMAIL_FROM,
      to,
      subject: "Verify your Saheli Safar Admin email address",
      text,
      html,
    }, "admin_email_verification");
  };
};

export const createAdminEmailChangeNoticeSender = () => {
  if (process.env.EMAIL_PROVIDER !== "smtp") {
    console.error(
      "Admin email change notices are unavailable: configure EMAIL_PROVIDER=smtp and SMTP credentials."
    );
    return null;
  }

  const required = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "EMAIL_FROM",
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `Admin email change notices are not configured: ${missing.join(", ")}.`
    );
    return null;
  }

  const port = Number(process.env.SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error("Admin email change notices are not configured: SMTP_PORT is invalid.");
    return null;
  }

  const transporter = createTransporter();
  return async ({ to, name, newEmail }) => {
    if (
      typeof to !== "string" ||
      !to.includes("@") ||
      typeof newEmail !== "string" ||
      !newEmail.includes("@")
    ) {
      throw new Error("Invalid admin email change notice.");
    }

    const greeting = name ? `Hi ${escapeHtml(name)},` : "Hello,";
    const text = [
      greeting,
      "",
      `A change to your Saheli Safar Admin account email was requested to: ${newEmail}`,
      "The new address will not become active until it is verified.",
      "If you did not request this change, contact a Full Access administrator immediately.",
      "",
      "Saheli Safar",
    ].join("\n");
    const html = `
      <div style="margin:0;padding:32px 16px;background:#fcf9f6;font-family:Arial,sans-serif;color:#25232a">
        <div style="max-width:520px;margin:0 auto;padding:32px;background:#fff;border:1px solid #e9e1e5;border-radius:12px">
          <h1 style="margin:0 0 24px;color:#382039;font-size:24px">Saheli Safar</h1>
          <p>${greeting}</p>
          <p>A change to your Saheli Safar Admin account email was requested to:</p>
          <p style="font-weight:600;color:#552d50">${escapeHtml(newEmail)}</p>
          <p>The new address will not become active until it is verified.</p>
          <p style="color:#716b73;font-size:13px">If you did not request this change, contact a Full Access administrator immediately.</p>
        </div>
      </div>
    `;

    await sendSmtpMessage(
      transporter,
      {
        from: process.env.EMAIL_FROM,
        to,
        subject: "A change to your Saheli Safar Admin email was requested",
        text,
        html,
      },
      "admin_email_change_notice"
    );
  };
};

export const createEmailProvider = () => {
  const provider = process.env.EMAIL_PROVIDER;

  if (provider === "smtp") {
    return createSmtpProvider();
  }

  // Never enable the console provider
  // outside the development environment.
  if (
    provider === "console" &&
    process.env.NODE_ENV === "development"
  ) {
    return createConsoleProvider();
  }

  console.error("❌ Email : No email provider configured.");
  return null;
};

/**
 * Team notifications (e.g. website contact form).
 * Sends to CONTACT_INBOX, or SMTP_USER when not set.
 * Returns null when no email provider is configured; callers
 * should still save the message so nothing is lost.
 */
export const createTeamNotifier = () => {
  const provider = process.env.EMAIL_PROVIDER;

  if (provider === "smtp" && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = createTransporter();
    const inbox = process.env.CONTACT_INBOX || process.env.SMTP_USER;

    return async ({ subject, text, html, replyTo }) => {
      await sendSmtpMessage(transporter, {
        from: process.env.EMAIL_FROM,
        to: inbox,
        replyTo,
        subject,
        text,
        html,
      }, "team_notification");
    };
  }

  if (
    provider === "console" &&
    process.env.NODE_ENV === "development"
  ) {
    return async ({ subject, text }) => {
      console.log(`\n📨 TEAM NOTIFICATION (not sent)\n${subject}\n${text}\n`);
    };
  }

  return null;
};

export { escapeHtml };
