import { useRef, useState } from 'react'
import { contact } from '../../content/site.js'
import { sendContactMessage } from './contact.service.js'

const { form } = contact
export const CONTACT_FIELD_LIMITS = { name: 80, email: 254, phone: 40, message: 2000 }

const EMPTY = { name: '', email: '', phone: '', message: '' }
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values) {
  const errors = {}
  if (values.name.trim().length > CONTACT_FIELD_LIMITS.name || /[\r\n\x00-\x1f\x7f]/.test(values.name)) errors.name = 'Use at most 80 characters without control characters.'
  if (values.email.trim().length > CONTACT_FIELD_LIMITS.email) errors.email = 'Use at most 254 characters.'
  if (values.phone.trim().length > CONTACT_FIELD_LIMITS.phone) errors.phone = 'Use at most 40 characters.'
  if (values.message.trim().length > CONTACT_FIELD_LIMITS.message) errors.message = 'Use at most 2000 characters.'
  const phoneDigits = values.phone.replace(/\D/g, '')
  if (!values.name.trim()) errors.name = form.errors.name
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = form.errors.email
  if (!/^\+?[\d\s()-]+$/.test(values.phone.trim()) || phoneDigits.length < 10 || phoneDigits.length > 15) {
    errors.phone = form.errors.phone
  }
  if (values.message.trim().length < 10) errors.message = form.errors.message
  return errors
}

export default function useContactForm() {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const formRef = useRef(null)
  const pending = useRef(false)
  const [failure, setFailure] = useState(form.failure)

  const connected = Boolean(contact.endpoint)

  const onChange = (event) => {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }))
    if (status !== 'idle' && status !== 'sending') setStatus('idle')
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    if (!connected || pending.current) return

    const found = validate(values)
    setErrors(found)
    const firstInvalid = Object.keys(found)[0]
    if (firstInvalid) {
      formRef.current?.querySelector(`[name="${firstInvalid}"]`)?.focus()
      return
    }

    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      message: values.message.trim(),
    }

    pending.current = true
    setFailure(form.failure)
    setStatus('sending')
    try {
      await sendContactMessage(payload)
      setStatus('success')
      setValues(EMPTY)
    } catch (error) {
      if (error.status === 400 && Array.isArray(error.errors)) {
        const fieldErrors = Object.fromEntries(error.errors.filter(item => Object.hasOwn(EMPTY, item.field)).map(item => [item.field, item.message]))
        setErrors(fieldErrors)
        const first = Object.keys(fieldErrors)[0]
        if (first) formRef.current?.querySelector('[name="' + first + '"]')?.focus()
      }
      setFailure(error.name === 'AbortError'
        ? 'The request timed out. Delivery could not be confirmed. Please wait before trying again.'
        : error instanceof TypeError ? 'Unable to reach the server. Check your connection and try again.' : error.message || form.failure)
      setStatus('error')
    } finally {
      pending.current = false
    }
  }

  return { values, errors, status, formRef, failure, connected, onChange, onSubmit }
}
