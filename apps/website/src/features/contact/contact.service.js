import { contact } from '../../content/site.js'

// Delivery is confirmed only by the existing backend's explicit success response.
export async function sendContactMessage(payload) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)
  try {
    const response = await fetch(contact.endpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = await response.json().catch(() => null)
    if (!response.ok || result?.success !== true) {
      throw Object.assign(new Error(result?.message || contact.form.failure), {
        status: response.status,
        errors: result?.errors,
      })
    }
    return result
  } finally {
    clearTimeout(timeout)
  }
}
