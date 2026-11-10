import { createError } from "../../utils/app-error.js";

// Email only: no database writes, local storage or message-content logging.
export const submitContactMessage = async ({ name, email, phone, message, notifyTeam }) => {
  if (typeof notifyTeam !== "function") {
    throw createError("Contact email is unavailable. The project owner must configure SMTP and CONTACT_RECIPIENT_EMAIL.", 503);
  }
  try {
    await notifyTeam({
      subject: "Saheli Safar website enquiry",
      text: [`Name: ${name}`, `Email: ${email}`, `Phone: ${phone}`, "", message].join("\n"),
      replyTo: email,
    });
  } catch {
    throw createError("The email service could not accept your message. Please try again later.", 502);
  }
  return { message: "Thank you. Your message was accepted by our email service." };
};
