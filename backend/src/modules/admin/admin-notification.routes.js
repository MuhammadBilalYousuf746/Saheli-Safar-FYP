import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware.js";
import { createNotificationService } from "./admin-notification.service.js";

export function createNotificationRoutes(service = createNotificationService()) {
  const router = Router();
  router.use(requireAuth("admin"), (_req, res, next) => { res.set("Cache-Control", "private, no-store"); next(); });
  const safe = action => async (req, res, next) => { try { await action(req, res); } catch (error) { next(error); } };
  router.get("/", safe(async (req, res) => res.json({ success: true, ...await service.list(req.user) })));
  router.post("/read-all", safe(async (req, res) => { await service.readAll(req.user, req.body?.before); res.json({ success: true }); }));
  router.post("/:id/read", safe(async (req, res) => { await service.read(req.user, req.params.id); res.json({ success: true }); }));
  return router;
}
