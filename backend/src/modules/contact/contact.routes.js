import express, { Router } from "express";
import { createContactLimiter } from "../../middlewares/rateLimiters.js";
import { submitContactController } from "./contact.controller.js";

const router = Router();
router.post("/", createContactLimiter(), (req, res, next) => {
  if (!req.is("application/json")) {
    return res.status(415).json({ success: false, message: "Use application/json." });
  }
  next();
}, express.json({ limit: "16kb" }), submitContactController);
router.use((error, req, res, next) => {
  if (error.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "Contact request must not exceed 16 KB." });
  }
  next(error);
});
export default router;
