import { contact, site } from '../../content/site.js'
import Icon from '../ui/Icon.jsx'
import Reveal from '../ui/Reveal.jsx'
import logo from '../../assets/logo-withoutbg-text.png'
import ContactForm from './ContactForm.jsx'
import './Contact.css'

function TeamBusinessCard() {
  const card = contact.businessCard
  return <aside className="team-business-card" aria-labelledby="team-card-title">
    <svg className="team-card-geometry" viewBox="0 0 480 290" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs><linearGradient id="team-card-corner" x2="1" y2="1"><stop stopColor="#352641" /><stop offset="1" stopColor="#2F6F9D" /></linearGradient></defs>
      <path d="M0 100 185 290H0ZM350 0H480V130Z" fill="url(#team-card-corner)" />
      <g fill="none" stroke="#FFCB70" strokeWidth="1.2" opacity=".8"><path d="M0 133 152 290M0 160 125 290M0 187 98 290M369 0 480 111M394 0 480 86" /></g>
    </svg>
    <div className="team-card-brand"><img src={logo} width="42" height="42" alt="" /><span>{site.name}<small>Project team</small></span></div>
    <div className="team-card-people"><p className="team-card-eyebrow">THE PEOPLE BEHIND THE JOURNEY</p><h2 id="team-card-title">{card.names}</h2><p>{card.info}</p></div>
    <div className="team-card-emails">{card.emails.map(email => <a href={`mailto:${email}`} key={email}><Icon name="mail" size={17} /><span>{email}</span><Icon name="arrowUpRight" size={15} /></a>)}</div>
    <div className="team-card-foot"><span>Karachi, Pakistan</span></div>
  </aside>
}

export default function Contact() {
  return <section className="contact-page page-section" aria-labelledby="contact-title">
    <div className="container-page">
      <Reveal className="contact-letter-layout">
        <header className="contact-page-heading"><p className="eyebrow text-coral-ink">Contact</p><h1 id="contact-title">Write us a little note.</h1><p>Questions, feedback or an idea? We'd love to hear from you.</p></header>
        <div className="contact-card-column"><TeamBusinessCard /></div>
        <div className="contact-letter-column"><ContactForm /></div>
      </Reveal>
    </div>
  </section>
}
