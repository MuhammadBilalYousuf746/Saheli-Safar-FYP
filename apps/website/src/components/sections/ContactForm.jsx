import useContactForm, { CONTACT_FIELD_LIMITS } from '../../features/contact/useContactForm.js'
import { contact } from '../../content/site.js'
import Icon from '../ui/Icon.jsx'
import Button from '../ui/Button.jsx'

const { form } = contact

function LetterField({ name, value, error, onChange, multiline = false }) {
  const config = form.fields[name]
  const id = `contact-${name}`
  const Control = multiline ? 'textarea' : 'input'
  return <div className={`letter-field${multiline ? ' letter-message' : ''}`}>
    <label htmlFor={id}>{config.label}</label>
    <Control id={id} name={name} type={multiline ? undefined : config.type} rows={multiline ? 3 : undefined} inputMode={name === 'phone' ? 'tel' : undefined} autoComplete={config.autoComplete} placeholder={config.placeholder} required maxLength={CONTACT_FIELD_LIMITS[name]} value={value} onChange={onChange} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} />
    {error ? <p id={`${id}-error`} className="letter-field-error"><Icon name="info" size={14} />{error}</p> : null}
  </div>
}

export default function ContactForm() {
  const { values, errors, status, formRef, failure, connected, onChange, onSubmit } = useContactForm()
  return <form ref={formRef} noValidate aria-busy={status === 'sending'} onSubmit={onSubmit} aria-labelledby="contact-form-title" aria-describedby={connected ? undefined : 'contact-not-connected'} className="contact-letter">
    <div className="letter-heading"><div><p>A NOTE TO SAHELI SAFAR</p><h2 id="contact-form-title">{form.title}</h2></div><span className="letter-stamp" aria-hidden="true"><Icon name="mail" size={25} /><span>KARACHI</span></span></div>
    {!connected ? <p id="contact-not-connected" role="note" className="letter-field-error">{form.notConnected}</p> : null}
    <p className="letter-salutation">Dear Saheli Safar team,</p>
    <LetterField name="message" multiline value={values.message} error={errors.message} onChange={onChange} />
    <p className="letter-signoff">Kind regards,</p>
    <LetterField name="name" value={values.name} error={errors.name} onChange={onChange} />
    <div className="letter-reply-fields"><LetterField name="email" value={values.email} error={errors.email} onChange={onChange} /><LetterField name="phone" value={values.phone} error={errors.phone} onChange={onChange} /></div>
    <div className="letter-actions"><Button as="button" type="submit" icon="arrowUpRight" disabled={!connected || status === 'sending'}>{status === 'sending' ? form.sending : form.submit}</Button><p role="status" aria-live="polite">{status === 'success' ? <span className="text-live">{form.success}</span> : null}{status === 'error' ? <span className="text-coral-ink">{failure}</span> : null}</p></div>
    <p className="letter-privacy"><Icon name="lock" size={13} />{form.privacy}</p>
  </form>
}
