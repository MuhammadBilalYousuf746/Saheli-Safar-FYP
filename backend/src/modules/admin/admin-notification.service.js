import Notification from "./admin-notification.model.js";
import { createError } from "../../utils/app-error.js";

export const notificationScope = admin => ({ type: { $in: ["driver_verification",
  ...(admin.permissions?.includes("manageAdmins") && admin.permissions.includes("verifyPassengers") ? ["passenger_identity"] : []),
] } });

export const notificationDto = (event, adminId) => {
  const passenger = event.type === "passenger_identity";
  return { id: event._id, title: passenger ? (event.resubmission ? "Identity verification resubmitted" : "New identity submission") : "New driver verification request",
    message: passenger ? "A passenger identity submission is ready for review." : "A driver application is ready for review.",
    destination: passenger ? "/passenger-verifications" : "/drivers?verificationStatus=pending",
    createdAt: event.createdAt, read: event.readBy.some(id => String(id) === String(adminId)) };
};

export function createNotificationService(model = Notification) {
  return {
    async list(admin) {
      const scope = notificationScope(admin);
      const [events, unreadCount] = await Promise.all([
        model.find(scope).sort({ createdAt: -1, _id: -1 }).limit(50).lean(),
        model.countDocuments({ ...scope, readBy: { $ne: admin.id } }),
      ]);
      return { notifications: events.map(event => notificationDto(event, admin.id)), unreadCount };
    },
    async read(admin, id) {
      if (typeof id !== "string" || id.length > 120) throw createError("Notification unavailable.", 404);
      const result = await model.updateOne({ ...notificationScope(admin), _id: id }, { $addToSet: { readBy: admin.id } });
      if (!result.matchedCount) throw createError("Notification unavailable.", 404);
    },
    async readAll(admin, before) {
      const date = new Date(before);
      if (!before || !Number.isFinite(date.getTime())) throw createError("Invalid notification timestamp.", 400);
      await model.updateMany({ ...notificationScope(admin), createdAt: { $lte: date }, readBy: { $ne: admin.id } }, { $addToSet: { readBy: admin.id } });
    },
  };
}
