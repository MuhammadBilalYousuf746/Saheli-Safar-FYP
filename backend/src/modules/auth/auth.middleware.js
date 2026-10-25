
import User from "./user.model.js";
import {
  verifyAccessToken,
  verifyOnboardingToken,
} from "./token.service.js";

// Read "Authorization: Bearer <token>".
const getBearerToken = (req) => {
  const authorization = req.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(\S+)$/i);

  return match ? match[1] : null;
};

// Allow only verified, pending accounts of the given role
// (passenger or driver) that are completing registration.
// Usage: router.post("/profile/complete", requireOnboarding("driver"), ...)
export const requireOnboarding = (role) => async (req, res, next) => {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Onboarding authentication required.",
      });
    }

    let payload;

    try {
      payload = verifyOnboardingToken(token);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired onboarding token.",
      });
    }

    // Never trust the token alone.
    // Check the current account state in MongoDB.
    const user = await User.findById(payload.userId).select(
      "_id email phone role status isEmailVerified"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    // Only verified, pending accounts of this role can continue.
    if (
      payload.role !== role ||
      user.role !== role ||
      user.status !== "pending" ||
      user.isEmailVerified !== true
    ) {
      return res.status(403).json({
        success: false,
        message: "Onboarding access is not permitted.",
      });
    }

    // Attach trusted user information to the request.
    req.onboardingUser = {
      id: user._id.toString(),
      email: user.email,
      phone: user.phone,
      role: user.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Allow only active accounts with one of the given roles.
// Usage: router.get("/profile/me", requireAuth("passenger"), ...)
//        router.use(requireAuth("admin"))
export const requireAuth = (...roles) => async (req, res, next) => {
  try {
    const token = getBearerToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    let payload;

    try {
      payload = verifyAccessToken(token);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token.",
      });
    }

    if (roles.length > 0 && !roles.includes(payload.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource.",
      });
    }

    // Never trust the token alone.
    // Suspended or disabled accounts lose access immediately.
    const user = await User.findById(payload.userId).select(
      "_id phone email role status permissions authVersion"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (user.role !== payload.role || user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active.",
      });
    }

    if ((user.authVersion || 0) !== payload.authVersion) {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please sign in again.",
      });
    }

    // Attach trusted user information to the request.
    req.user = {
      id: user._id.toString(),
      phone: user.phone || null,
      email: user.email || null,
      role: user.role,
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdminPermission = (permission) => async (req, res, next) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access is required.",
      });
    }

    const user = await User.findById(req.user.id).select(
      "_id role status permissions"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    const permissions = Array.isArray(user.permissions)
      ? user.permissions
      : [];

    if (user.role !== "admin" || user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your admin account is not active.",
      });
    }

    if (!permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to manage admin accounts.",
      });
    }

    req.user.permissions = permissions;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdminManagerOrSelf = (paramName = "userId") =>
  async (req, res, next) => {
    try {
      if (req.user?.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access is required.",
        });
      }

      if (req.user.id === req.params[paramName]) {
        return next();
      }

      return requireAdminPermission("manageAdmins")(req, res, next);
    } catch (error) {
      return next(error);
    }
  };
