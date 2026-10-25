# Admin account operations

## Initial deployment

1. Configure `backend/.env` from `.env.example`, including MongoDB Atlas, distinct JWT secrets, and a verified SMTP sender. Do not commit `.env`.
2. From `backend/`, run `npm run bootstrap-first-admin` in an interactive terminal. Enter the first administrator's name, email, and password when prompted. Password input is not echoed.
3. This local, server-side command creates the first active Full Access admin and refuses to run after any admin account exists. It does not expose an unauthenticated API.
4. Create subsequent accounts in **Admin Dashboard → Settings → Admin Management → Add Admin**. New accounts use the existing Standard Access default.

For a local development run, create a MongoDB replica set or use an Atlas development database: account creation and password changes use MongoDB transactions.

## Email delivery and password recovery

The shared email service already uses Nodemailer. Configure these backend variables with credentials from a trusted SMTP provider:

- `EMAIL_PROVIDER=smtp`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS`
- `EMAIL_FROM` using a sender address verified by the provider
- `ADMIN_FRONTEND_URL` as the exact trusted Admin Dashboard origin

Use HTTPS for `ADMIN_FRONTEND_URL` in production. Plain HTTP is accepted only for localhost during development. For example, a local dashboard uses `http://localhost:5173`; production must use the deployed dashboard's `https://` origin. Reset links are built from this configured value, never from request headers.

After configuration, restart the backend and make a password-reset request from the Admin Login page. Confirm delivery and link expiry with a test admin mailbox. Password reset is unavailable for delivery when SMTP is missing or fails; the public response remains non-enumerating, and the backend logs only a generic diagnostic (and provider error code when available), never the email address or reset token.

Reset links expire after 15 minutes, are single-use, and invalidate the previous reset link for that admin. Requests are limited to 10 per IP per 15 minutes and 3 per normalized email per hour. Set `TRUST_PROXY_HOPS` to the exact number of trusted reverse proxies in front of Express; leave it at `0` when clients connect directly. The IP limiter uses the default in-memory store, so production deployments with multiple backend instances should configure a shared `express-rate-limit` store as well.

## Emergency recovery

- If an admin can access their registered mailbox, use **Forgot Password?** on the login page. This supports both Standard and Full Access admins and does not modify permissions.
- If email delivery or mailbox access is unavailable, an authorized operator with direct backend/database access can run `npm run recover-admin-password -- --email admin@example.com`. The command prompts for a password without echoing it, applies the standard password rules, revokes existing sessions, preserves the account status and permissions, and invalidates any outstanding reset links. It cannot create or promote an admin.
- If Admin Management permissions need operational repair, `npm run grant-admin-permission -- --email first@example.com --email second@example.com` remains available. It requires two distinct existing admin accounts and adds `manageAdmins` only to those explicitly named accounts. Run it only from a controlled backend environment with authorized database credentials.
- If the deployment has no admin records, use the guarded `bootstrap-first-admin` command above. It refuses to create another initial admin if any admin already exists.

These procedures require direct operator access and database credentials. Do not expose them as public routes or place secrets in shell command arguments, screenshots, or logs.

## Session revocation

Admin access tokens include an authentication version. Password reset and password change increment it, so every previously issued access token is rejected on its next authenticated request. The admin must sign in again.

## Admin account changes

- Only an active Full Access admin can request another admin's email change or deactivate another admin. Both actions require the acting admin's current password.
- Both Full Access and Standard Access admins can change their own email or deactivate their own account after password confirmation.
- Email updates are not applied when requested. A one-time verification link is sent to the proposed address and expires after 30 minutes. The old address remains active until the link is verified; the owner can request a new link from Settings while it remains pending. The previous verified address is notified of the request. Completion updates the address and revokes the target admin's existing sessions.
- Deactivation is a soft status change. The account and historical records remain in MongoDB, but login and authenticated API access are immediately blocked. Deactivation of the last active Full Access admin is refused, including self-deactivation.
- Sensitive actions are recorded in the admin-management audit collection. Configure the same SMTP sender and trusted `ADMIN_FRONTEND_URL` used for password recovery before using email changes.

SMTP acceptance in backend logs means the provider accepted the message for processing; it does not confirm inbox delivery. For a custom sending domain, configure SPF and DKIM records supplied by the email provider and publish an appropriate DMARC policy. Use only the verified sender identity authorized by the SMTP account.
