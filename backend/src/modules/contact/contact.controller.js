import { contactMessageSchema } from "./contact.validation.js";
import { submitContactMessage } from "./contact.service.js";

export const submitContactController = async (req, res, next) => {
  try {
    const data = contactMessageSchema.parse(req.body);
    const result = await submitContactMessage({ ...data, notifyTeam: req.app.locals.notifyTeam });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
