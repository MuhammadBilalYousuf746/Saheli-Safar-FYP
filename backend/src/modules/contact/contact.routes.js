
import { Router } from "express";

import { createContactLimiter } from "../../middlewares/rateLimiters.js";

import { submitContactController } from "./contact.controller.js";

const router = Router();

// ==========================================
// WEBSITE CONTACT FORM
// ==========================================

// Public: no login required. Rate limited to prevent spam.
router.post("/", createContactLimiter(), submitContactController);

export default router;
