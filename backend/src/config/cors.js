export const createCorsOptions = (env = process.env) => {
  const origins = (env.CORS_ORIGIN || "").split(",").map(origin => origin.trim()).filter(Boolean);
  if (env.NODE_ENV === "development") origins.push("http://localhost:8081");
  return { origin: origins.length ? [...new Set(origins)] : false, credentials: false };
};
