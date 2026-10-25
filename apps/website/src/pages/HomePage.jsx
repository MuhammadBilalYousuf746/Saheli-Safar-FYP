import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  CalendarClock,
  Car,
  Check,
  HeartHandshake,
  MapPinned,
  ShieldCheck,
  Smartphone,
  Ticket,
  UserRoundCheck,
} from "lucide-react";

import RouteIllustration from "../components/RouteIllustration";

const STEPS = [
  {
    icon: MapPinned,
    title: "Choose your route",
    text: "Explore scheduled routes across Karachi and pick the stop closest to you.",
  },
  {
    icon: Ticket,
    title: "Reserve your seat",
    text: "Book ahead of time, so your daily commute is planned, not a scramble.",
  },
  {
    icon: ShieldCheck,
    title: "Travel with confidence",
    text: "Know your driver and vehicle before you board, and follow trip updates on the way.",
  },
];

const FEATURES = [
  {
    icon: HeartHandshake,
    title: "Made for women",
    text: "Every part of Saheli Safar is designed around women's everyday journeys: to campus, to work, and back home.",
  },
  {
    icon: CalendarClock,
    title: "Scheduled routes",
    text: "Fixed routes and timings you can plan your day around, with seats you reserve in advance.",
  },
  {
    icon: UserRoundCheck,
    title: "Verified drivers",
    text: "Drivers submit their CNIC, driving license and vehicle details, and are approved by our team before they can drive.",
  },
  {
    icon: BellRing,
    title: "Stay informed",
    text: "See who is driving and which vehicle is coming, and stay updated throughout the trip.",
  },
];

const SAFETY = [
  "Every passenger account is verified by email before it is activated.",
  "Every driver's CNIC, license and vehicle are reviewed by an admin.",
  "Accounts that break our rules can be suspended immediately.",
  "Passwords are encrypted and never stored in plain text.",
];

const TRUST_POINTS = [
  "Women-focused by design",
  "Drivers reviewed before approval",
  "Seats planned in advance",
];

const HomePage = () => (
  <>
    {/* Hero */}
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="hero-kicker">
            <span className="hero-kicker-dot" aria-hidden="true" />
            A more thoughtful way to get around Karachi
          </span>
          <h1>
            The journey matters <em>as much as the destination.</em>
          </h1>
          <p className="lead">
            Commutes planned around you. Discover scheduled routes, reserve
            your seat ahead of time, and know who's driving before you go.
          </p>
          <div className="hero-actions">
            <Link to="/about" className="btn btn-primary">
              Get to know us <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/contact" className="hero-text-link">
              Talk to our team <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="hero-proof">
            <span className="hero-proof-icon">
              <ShieldCheck size={18} aria-hidden="true" />
            </span>
            <span>
              <strong>Thoughtful travel, from the start</strong>
              <span>Built for the way women move through Karachi.</span>
            </span>
          </div>
        </div>

        <div className="hero-art">
          <RouteIllustration />
        </div>
      </div>
      <div className="container trust-strip" aria-label="What makes Saheli Safar different">
        {TRUST_POINTS.map((point) => (
          <div className="trust-point" key={point}>
            <span><Check size={15} aria-hidden="true" /></span>
            {point}
          </div>
        ))}
      </div>
    </section>

    {/* How it works */}
    <section className="section">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">How it works</span>
          <h2>A little more peace of mind, <em>built in.</em></h2>
          <p>Three considered steps make it easier to plan your everyday journey.</p>
        </div>

        <ol className="steps">
          {STEPS.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="step-card">
              <span className="step-number">0{index + 1}</span>
              <span className="icon-badge">
                <Icon size={22} aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>

    {/* Features */}
    <section className="section section-tinted">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Why Saheli Safar</span>
          <h2>For the moments that make a journey feel right.</h2>
        </div>

        <div className="feature-grid">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <article key={title} className="feature-card">
              <span className="icon-badge">
                <Icon size={22} aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    {/* Passengers & drivers */}
    <section className="section">
      <div className="container audience-grid">
        <article className="audience-card audience-passenger">
          <Smartphone size={28} aria-hidden="true" />
          <h3>For passengers</h3>
          <p>
            Sign up with your name, email and phone number, verify your
            email, and start planning your commute in the Saheli Safar
            passenger app.
          </p>
          <ul>
            <li>Scheduled routes and stops</li>
            <li>Seats reserved ahead of time</li>
            <li>Driver and vehicle details before you board</li>
          </ul>
        </article>

        <article className="audience-card audience-driver">
          <Car size={28} aria-hidden="true" />
          <h3>For drivers</h3>
          <p>
            Apply through the Saheli Safar driver app with your CNIC,
            driving license and vehicle details. Once our team approves
            you, go online and start driving.
          </p>
          <ul>
            <li>Simple, guided application</li>
            <li>Track your verification status</li>
            <li>Drive on your own schedule</li>
          </ul>
          <Link to="/contact" className="text-link">
            Ask us about driving <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </article>
      </div>
    </section>

    {/* Safety */}
    <section className="section section-dark">
      <div className="container safety-grid">
        <div>
          <span className="eyebrow eyebrow-light">Safety first</span>
          <h2>Because feeling safe should never be an afterthought.</h2>
          <p>
            Safety isn't a feature we added later. It shapes how accounts
            are created, how drivers are approved and how every trip is run.
          </p>
        </div>

        <ul className="safety-list">
          {SAFETY.map((item) => (
            <li key={item}>
              <BadgeCheck size={20} aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>

    {/* CTA */}
    <section className="section">
      <div className="container">
        <div className="cta-band">
          <div>
            <h2>Have a question or an idea?</h2>
            <p>
              Whether you're a passenger, a driver or a partner, we'd love
              to hear from you.
            </p>
          </div>
          <Link to="/contact" className="btn btn-light">
            Contact the team <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  </>
);

export default HomePage;
