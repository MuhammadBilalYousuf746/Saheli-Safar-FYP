import { Router } from "express";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import { requireAuth, requireAdminPermission } from "../auth/auth.middleware.js";
import { createError, isApplicationError } from "../../utils/app-error.js";
import { parseVerificationMultipart } from "./verification-images.js";
import { createVerificationService } from "./verification.service.js";

const privateHeaders = (req, res, next) => {
  res.set({ "Cache-Control": "private, no-store, max-age=0", "Pragma": "no-cache", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" });
  if (process.env.NODE_ENV === "production" && !req.secure) return next(createError("A secure HTTPS connection is required for identity verification.", 403));
  next();
};
const safe = handler => async (req, res, next) => {
  try { await handler(req, res); }
  catch (error) { next(isApplicationError(error) || error.name === "ZodError" ? error : createError("Verification service is temporarily unavailable. Please retry.", 503)); }
  finally { for (const file of Object.values(req.files || {}).flat()) file.buffer?.fill(0); req.releaseVerificationCapacity?.(); }
};
let activeUploads = 0;
const capacity = (req, res, next) => {
  if (activeUploads >= 2) return next(createError("Document uploads are busy. Please retry shortly.", 429));
  activeUploads++; let released = false;
  const release = () => { if (!released) { released = true; activeUploads--; } };
  req.releaseVerificationCapacity = release;
  res.once("finish", release);
  req.once("aborted", () => { if (!req.verificationProcessing) release(); });
  req.setTimeout(30000, () => req.destroy());
  next();
};
export function createPassengerVerificationRoutes(service = createVerificationService()) {
  const router = Router(); router.use(privateHeaders, requireAuth("passenger"));
  router.get("/me", safe(async (req, res) => res.json({ success: true, verification: await service.mine(req.user.id) })));
  router.post("/submit", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false }), capacity, parseVerificationMultipart,
    safe(async (req, res) => res.json({ success: true, verification: await service.submit(req.user.id, req.body, req.files) })));
  router.get("/documents/:key", safe(async (req, res) => { const bytes = await service.document(req.user.id, req.params.key); res.type("image/jpeg").set("Content-Disposition", 'inline; filename="identity-document.jpg"').send(bytes); }));
  return router;
}
export function createAdminVerificationRoutes(service = createVerificationService()) {
  const router = Router();
  router.use(privateHeaders, requireAuth("admin"), requireAdminPermission("verifyPassengers"), (req, _res, next) => {
    // The existing Admin architecture derives Full Access from manageAdmins.
    // requireAdminPermission has just refreshed this array from the database:
    // test both capabilities from that same current account read.
    if (!req.user.permissions.includes("manageAdmins")) return next(createError("Only Full Access Admins explicitly granted verifyPassengers may perform Passenger identity verification.", 403));
    next();
  });
  router.param("userId", (_req, _res, next, id) => next(mongoose.isObjectIdOrHexString(id) ? undefined : createError("Verification record not available.", 404)));
  router.get("/", safe(async (req, res) => { const page = Number(req.query.page || 1); if (!Number.isInteger(page) || page < 1 || page > 10000) throw createError("Invalid page.", 400); res.json({ success: true, ...await service.queue(page) }); }));
  router.get("/:userId", safe(async (req, res) => res.json({ success: true, ...await service.detail(req.params.userId) })));
  router.post("/:userId/review", safe(async (req, res) => res.json({ success: true, verification: await service.decide(req.params.userId, req.user.id, req.body) })));
  router.get("/:userId/documents/:key", safe(async (req, res) => res.type("image/jpeg").set("Content-Disposition", 'inline; filename="identity-document.jpg"').send(await service.document(req.params.userId, req.params.key))));
  return router;
}
