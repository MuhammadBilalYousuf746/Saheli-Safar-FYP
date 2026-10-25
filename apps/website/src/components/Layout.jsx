import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Mail, MapPin, Menu, X } from "lucide-react";

import logo from "../assets/logo.png";

export const CONTACT_EMAIL = "sahelisafar.team@gmail.com";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
];

const Layout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  // Close the mobile menu after navigating.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand" aria-label="Saheli Safar home">
            <img src={logo} alt="" className="brand-logo" />
            <span className="brand-name">Saheli Safar</span>
          </Link>

          <button
            type="button"
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <nav
            id="site-nav"
            className={`site-nav${menuOpen ? " open" : ""}`}
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link to="/contact" className="btn btn-primary nav-cta">
              Get in touch
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand brand-light">
              <img src={logo} alt="" className="brand-logo" />
              <span className="brand-name">Saheli Safar</span>
            </Link>
            <p>
              Safer, scheduled journeys for women across Karachi.
            </p>
          </div>

          <div>
            <h3>Explore</h3>
            <ul>
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>Contact</h3>
            <ul>
              <li>
                <Mail size={15} aria-hidden="true" />
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </li>
              <li>
                <MapPin size={15} aria-hidden="true" />
                Karachi, Pakistan
              </li>
            </ul>
          </div>
        </div>

        <div className="container footer-bottom">
          © {new Date().getFullYear()} Saheli Safar. Made for her journeys.
        </div>
      </footer>
    </>
  );
};

export default Layout;
