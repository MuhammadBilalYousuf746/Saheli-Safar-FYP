
import { escapeHtml } from "../../config/email.js";

import ContactMessage from "./contact.model.js";

const TOPIC_LABELS = {
  general: "General enquiry",
  passenger: "Passenger support",
  driver: "Driving with Saheli Safar",
  partnership: "Partnership",
  feedback: "Feedback",
};

// Save a website contact message and notify the team by email.
// The message is saved even if the email cannot be sent.
export const submitContactMessage = async ({
  fullName,
  email,
  phone,
  topic,
  message,
  notifyTeam,
}) => {
  const saved = await ContactMessage.create({
    fullName,
    email,
    phone: phone || null,
    topic,
    message,
  });

  if (typeof notifyTeam === "function") {
    const topicLabel = TOPIC_LABELS[topic] || topic;

    const text = [
      `New message from the Saheli Safar website`,
      ``,
      `Topic : ${topicLabel}`,
      `Name  : ${fullName}`,
      `Email : ${email}`,
      `Phone : ${phone || "Not provided"}`,
      ``,
      message,
    ].join("\n");

    const html = `
      <div style="font-family: Arial, sans-serif; color: #25232A; max-width: 560px;">
        <h2 style="color: #552D50;">New website message</h2>
        <p><strong>Topic:</strong> ${escapeHtml(topicLabel)}<br/>
           <strong>Name:</strong> ${escapeHtml(fullName)}<br/>
           <strong>Email:</strong> ${escapeHtml(email)}<br/>
           <strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
        <p style="white-space: pre-wrap; background: #F7F0F1; padding: 12px; border-radius: 8px;">${escapeHtml(message)}</p>
        <p style="color: #716B73; font-size: 13px;">Reply to this email to respond to ${escapeHtml(fullName)}.</p>
      </div>
    `;

    try {
      await notifyTeam({
        subject: `[Saheli Safar] ${topicLabel} — ${fullName}`,
        text,
        html,
        replyTo: email,
      });

      saved.emailed = true;
      await saved.save();
    } catch (error) {
      console.error("❌ Contact email failed:", error.message);
    }
  }

  return {
    message: "Thank you! Your message has been sent. We'll get back to you soon.",
    id: saved._id.toString(),
  };
};
