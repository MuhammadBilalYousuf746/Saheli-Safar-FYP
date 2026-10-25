
import express from "express";
import cors from "cors";
import helmet from "helmet";

import {
  createEmailProvider,
  createPasswordResetEmailSender,
  createAdminEmailChangeSender,
  createAdminEmailChangeNoticeSender,
  createTeamNotifier,
} from "./config/email.js";
import passengerRoutes from "./modules/passenger/passenger.routes.js";
import driverRoutes from "./modules/driver/driver.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import contactRoutes from "./modules/contact/contact.routes.js";
import { createApiLimiter } from "./middlewares/rateLimiters.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

if (process.env.TRUST_PROXY_HOPS !== undefined) {
  const trustedProxyHops = Number(process.env.TRUST_PROXY_HOPS);

  if (!Number.isInteger(trustedProxyHops) || trustedProxyHops < 0) {
    throw new Error("TRUST_PROXY_HOPS must be a non-negative integer.");
  }

  app.set("trust proxy", trustedProxyHops);
}

// ========================================
// 1. SECURITY MIDDLEWARES
// ========================================

app.use(helmet());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((origin) =>
          origin.trim()
        )
      : false,
    credentials: false,
  })
);

// ========================================
// 2. REQUEST BODY PARSING
// ========================================

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false }));

// ========================================
// 3. EMAIL PROVIDER CONFIGURATION
// ========================================

app.locals.sendVerificationEmail = createEmailProvider();
app.locals.sendPasswordResetEmail = createPasswordResetEmailSender();
app.locals.sendAdminEmailChange = createAdminEmailChangeSender();
app.locals.notifyAdminEmailChange = createAdminEmailChangeNoticeSender();

// Website contact form messages go to the team inbox.
app.locals.notifyTeam = createTeamNotifier();

// ========================================
// 4. GLOBAL API RATE LIMITING
// ========================================

app.use("/api", createApiLimiter());

// ========================================
// 5. HEALTH CHECK
// ========================================

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Saheli Safar API is running",
  });
});

// ========================================
// 6. API ROUTES
// ========================================

// Passenger App
app.use("/api/passenger", passengerRoutes);

// Driver App
app.use("/api/driver", driverRoutes);

// Admin Panel
app.use("/api/admin", adminRoutes);

// Public Website
app.use("/api/contact", contactRoutes);

// ========================================
// 7. 404 HANDLER
// ========================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ========================================
// 8. CENTRALIZED ERROR HANDLER
// ========================================

app.use(errorHandler);

export default app;
