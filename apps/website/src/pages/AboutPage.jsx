import { Link } from "react-router-dom";
import {
  ArrowRight,
  Compass,
  Eye,
  HeartHandshake,
  LayoutDashboard,
  Lock,
  Smartphone,
  Car,
  Users,
} from "lucide-react";

const VALUES = [
  {
    icon: Lock,
    title: "Safety",
    text: "Verified accounts, approved drivers and clear trip information come before everything else.",
  },
  {
    icon: HeartHandshake,
    title: "Dignity",
    text: "Every woman deserves a commute that feels calm, respectful and predictable.",
  },
  {
    icon: Eye,
    title: "Transparency",
    text: "Passengers know who is driving and what vehicle is coming. Drivers know exactly where their application stands.",
  },
  {
    icon: Users,
    title: "Community",
    text: "Passengers, drivers and our team working together to make the city easier to move through.",
  },
];

const PLATFORM = [
  {
    icon: Smartphone,
    title: "Passenger app",
    text: "Register, explore scheduled routes, reserve seats and follow your trip.",
  },
  {
    icon: Car,
    title: "Driver app",
    text: "Apply with CNIC, license and vehicle details, track verification and go online.",
  },
  {
    icon: LayoutDashboard,
    title: "Admin dashboard",
    text: "Our team reviews driver applications and manages accounts to keep the platform safe.",
  },
];

const AboutPage = () => (
  <>
    <section className="page-hero">
      <div className="container narrow">
        <span className="eyebrow">About us</span>
        <h1>
          A <em>saheli</em> for every safar.
        </h1>
        <p className="lead">
          “Saheli” means a trusted friend, and “safar” means a journey. We
          started Saheli Safar with one idea: getting around Karachi should
          feel as safe as travelling with a friend.
        </p>
      </div>
    </section>

    <section className="section">
      <div className="container two-column">
        <div>
          <span className="eyebrow">Our story</span>
          <h2>Why we're building Saheli Safar</h2>
        </div>
        <div className="prose">
          <p>
            For many women in Karachi, the daily commute to university, to
            work, or across the city takes careful planning. Questions like
            “Will I find a ride on time?”, “Who is driving?” and “Will I feel
            comfortable on the way?” come up every single day.
          </p>
          <p>
            Saheli Safar brings scheduled routes, reserved seats and verified
            drivers together in one place, so women can plan their journeys
            ahead and travel with greater confidence.
          </p>
          <p>
            Saheli Safar is being developed as a Final Year Project, with a
            real platform behind it: a passenger app, a driver app and an
            admin dashboard, all connected to one secure backend.
          </p>
        </div>
      </div>
    </section>

    <section className="section section-tinted">
      <div className="container mission-grid">
        <article className="mission-card">
          <Compass size={26} aria-hidden="true" />
          <h3>Our mission</h3>
          <p>
            To make everyday travel safer, more reliable and more
            comfortable for women, one scheduled route at a time.
          </p>
        </article>
        <article className="mission-card">
          <Eye size={26} aria-hidden="true" />
          <h3>Our vision</h3>
          <p>
            A city where every woman can plan her day without worrying about
            how she'll get there and back.
          </p>
        </article>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">What we believe</span>
          <h2>Our values</h2>
        </div>

        <div className="feature-grid">
          {VALUES.map(({ icon: Icon, title, text }) => (
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

    <section className="section section-tinted">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">The platform</span>
          <h2>One platform, three experiences</h2>
        </div>

        <div className="platform-grid">
          {PLATFORM.map(({ icon: Icon, title, text }) => (
            <article key={title} className="platform-card">
              <span className="icon-badge icon-badge-rose">
                <Icon size={22} aria-hidden="true" />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="cta-band">
          <div>
            <h2>Want to know more?</h2>
            <p>Send us a message and the Saheli Safar team will reply.</p>
          </div>
          <Link to="/contact" className="btn btn-light">
            Contact us <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  </>
);

export default AboutPage;
