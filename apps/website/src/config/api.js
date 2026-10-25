const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Send a website contact message. Mirrors backend POST /api/contact.
export const sendContactMessage = async (body) => {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "We couldn't reach our server. Please check your connection or email us directly."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data.errors?.[0]?.message ||
        data.message ||
        "Something went wrong. Please try again."
    );
    error.field = data.errors?.[0]?.field;
    throw error;
  }

  return data;
};
