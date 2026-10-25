
import { contactMessageSchema } from "./contact.validation.js";
import { submitContactMessage } from "./contact.service.js";

// POST /api/contact
export const submitContactController = async (req, res, next) => {
  try {
    const { website, ...data } = contactMessageSchema.parse(req.body);

    // Honeypot filled in: pretend success, store nothing.
    if (website) {
      return res.status(200).json({
        success: true,
        message: "Thank you! Your message has been sent.",
      });
    }

    const result = await submitContactMessage({
      ...data,
      notifyTeam: req.app.locals.notifyTeam,
    });

    return res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};
