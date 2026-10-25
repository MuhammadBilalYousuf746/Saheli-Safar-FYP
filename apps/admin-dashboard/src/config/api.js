const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Build "?a=1&b=2", skipping empty values.
const toQueryString = (query = {}) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });

  const text = params.toString();
  return text ? `?${text}` : "";
};

// Shared API request function for the Admin Dashboard.
export const apiRequest = async (
  endpoint,
  { method = "GET", body, token, query } = {}
) => {
  let response;

  try {
    response = await fetch(
      `${API_BASE_URL}${endpoint}${toQueryString(query)}`,
      {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      }
    );
  } catch {
    throw new Error(
      "Unable to connect to Saheli Safar server. Make sure the backend is running."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Show the first field error from backend validation, if any.
    const fieldError = data.errors?.[0]?.message;

    const error = new Error(
      fieldError || data.message || "Something went wrong. Please try again."
    );

    error.status = response.status;
    error.details = data.errors;

    throw error;
  }

  return data;
};

export { API_BASE_URL };
