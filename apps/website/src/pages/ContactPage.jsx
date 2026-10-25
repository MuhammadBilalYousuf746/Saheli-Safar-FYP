import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Send,
} from "lucide-react";

import { sendContactMessage } from "../config/api";
import { CONTACT_EMAIL } from "../components/Layout";

// Must match CONTACT_TOPICS in backend/src/utils/constants.js
const TOPICS = [
  { value: "general", label: "General enquiry" },
  { value: "passenger", label: "Passenger support" },
  { value: "driver", label: "Driving with Saheli Safar" },
  { value: "partnership", label: "Partnership" },
  { value: "feedback", label: "Feedback" },
];

const MESSAGE_MAX = 2000;

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  topic: "general",
  message: "",
  website: "", // honeypot
};

// Client-side checks mirror backend/src/modules/contact/contact.validation.js
const validate = (form) => {
  const errors = {};

  if (form.fullName.trim().length < 2) {
    errors.fullName = "Please enter your full name.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (
    form.phone.trim() &&
    !/^(?:\+92|0)3[0-9]{9}$/.test(form.phone.replace(/[\s-]/g, ""))
  ) {
    errors.phone = "Enter a valid Pakistani mobile number, e.g. 03001234567.";
  }

  if (form.message.trim().length < 10) {
    errors.message = "Please write at least 10 characters.";
  }

  return errors;
};

const ContactPage = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent
  const [serverError, setServerError] = useState("");

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("sending");

    try {
      await sendContactMessage({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.replace(/[\s-]/g, ""),
        topic: form.topic,
        message: form.message.trim(),
        ...(form.website ? { website: form.website } : {}),
      });

      setStatus("sent");
      setForm(EMPTY_FORM);
    } catch (error) {
      setStatus("idle");

      if (error.field && error.field in EMPTY_FORM) {
        setErrors({ [error.field]: error.message });
      } else {
        setServerError(error.message);
      }
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="container narrow">
          <span className="eyebrow">Contact</span>
          <h1>
            We'd love to <em>hear from you</em>.
          </h1>
          <p className="lead">
            Questions about riding or driving, partnership ideas, or
            feedback on the app: send us a message and our team will reply
            by email.
          </p>
        </div>
      </section>

      <section className="section section-tight">
        <div className="container contact-grid">
          <aside className="contact-info">
            <div className="info-item">
              <span className="icon-badge">
                <Mail size={20} aria-hidden="true" />
              </span>
              <div>
                <h3>Email us</h3>
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </div>
            </div>

            <div className="info-item">
              <span className="icon-badge">
                <MapPin size={20} aria-hidden="true" />
              </span>
              <div>
                <h3>Based in</h3>
                <p>Karachi, Pakistan</p>
              </div>
            </div>

            <div className="info-item">
              <span className="icon-badge">
                <Clock size={20} aria-hidden="true" />
              </span>
              <div>
                <h3>Response time</h3>
                <p>We usually reply within 1–2 working days.</p>
              </div>
            </div>

            <div className="info-note">
              <strong>Want to drive with us?</strong>
              <p>
                Choose “Driving with Saheli Safar” as the topic and we'll
                guide you through the application.
              </p>
            </div>
          </aside>

          <div className="contact-card">
            {status === "sent" ? (
              <div className="form-success" role="status">
                <CheckCircle2 size={48} aria-hidden="true" />
                <h2>Message sent!</h2>
                <p>
                  Thank you for reaching out. The Saheli Safar team will get
                  back to you by email soon.
                </p>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStatus("idle")}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <h2>Send us a message</h2>

                <div className="form-row">
                  <Field label="Full name" error={errors.fullName} required>
                    <input
                      type="text"
                      autoComplete="name"
                      value={form.fullName}
                      onChange={update("fullName")}
                      maxLength={80}
                    />
                  </Field>

                  <Field label="Email address" error={errors.email} required>
                    <input
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={update("email")}
                      maxLength={254}
                    />
                  </Field>
                </div>

                <div className="form-row">
                  <Field label="Phone number" error={errors.phone} hint="Optional">
                    <input
                      type="tel"
                      autoComplete="tel"
                      placeholder="0300 1234567"
                      value={form.phone}
                      onChange={update("phone")}
                      maxLength={16}
                    />
                  </Field>

                  <Field label="Topic" error={errors.topic} required>
                    <select value={form.topic} onChange={update("topic")}>
                      {TOPICS.map((topic) => (
                        <option key={topic.value} value={topic.value}>
                          {topic.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field
                  label="Message"
                  error={errors.message}
                  hint={`${form.message.length}/${MESSAGE_MAX}`}
                  required
                >
                  <textarea
                    rows={6}
                    value={form.message}
                    onChange={update("message")}
                    maxLength={MESSAGE_MAX}
                    placeholder="How can we help?"
                  />
                </Field>

                {/* Honeypot: hidden from people, filled in by bots. */}
                <div className="honeypot" aria-hidden="true">
                  <label>
                    Website
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={update("website")}
                    />
                  </label>
                </div>

                {serverError && (
                  <p className="form-error" role="alert">
                    {serverError}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? (
                    "Sending…"
                  ) : (
                    <>
                      Send message <Send size={17} aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

const Field = ({ label, error, hint, required, children }) => (
  <label className={`field${error ? " field-invalid" : ""}`}>
    <span className="field-label">
      {label}
      {required && <span className="required"> *</span>}
      {hint && <span className="field-hint">{hint}</span>}
    </span>
    {children}
    {error && <span className="field-error">{error}</span>}
  </label>
);

export default ContactPage;
