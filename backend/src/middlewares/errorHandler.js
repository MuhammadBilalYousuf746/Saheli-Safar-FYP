
import { ZodError } from "zod";

// Centralized error handler for all API modules.
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Zod input validation errors.
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: err.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        message: issue.message,
      })),
    });
  }

  // Invalid JSON request body.
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body.",
    });
  }

  // MongoDB duplicate key errors.
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "This information is already registered.",
    });
  }

  // Mongoose document validation errors.
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Invalid database field values.",
    });
  }

  // Mongoose invalid ObjectId errors.
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid resource identifier.",
    });
  }

  // Expected application errors.
  const statusCode =
    Number.isInteger(err.statusCode) &&
    err.statusCode >= 400 &&
    err.statusCode < 500
      ? err.statusCode
      : 500;

  if (statusCode === 500) {
    console.error("❌ API Error:", err);
  }

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error."
        : err.message || "Request failed.",
  });
};
