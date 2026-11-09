
// Create an expected application error with an HTTP status code.
// The centralized error handler sends its message to the client.
const applicationErrors = new WeakSet();
export const isApplicationError = error => applicationErrors.has(error);

export const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  applicationErrors.add(error);
  return error;
};
