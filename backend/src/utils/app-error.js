
// Create an expected application error with an HTTP status code.
// The centralized error handler sends its message to the client.
export const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};
