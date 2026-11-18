import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      if (window.__babuz_lenis) {
        window.__babuz_lenis.scrollTo(el, { offset: -80, duration: 1.2 });
      } else {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav className={`b-navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="b-container">
        <div className="b-navbar-inner">
          <Link to="/home" style={{ display: "flex", alignItems: "center" }}>
            <img
              src="/assets/images/babuz/logo.40962213.png"
              alt="BabuZ"
              style={{ height: "48px", width: "auto" }}
            />
          </Link>

          <ul className="b-nav-links" style={{ display: window.innerWidth < 992 ? "none" : "flex" }}>
            <li>
              <a href="#hero" onClick={(e) => scrollToSection(e, "hero")} className="b-nav-link">
                Home
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6l6 -6" />
                </svg>
              </a>
            </li>
            <li>
              <a href="#about" onClick={(e) => scrollToSection(e, "about")} className="b-nav-link">About</a>
            </li>
            <li>
              <a href="#services" onClick={(e) => scrollToSection(e, "services")} className="b-nav-link">
                Pages
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6l6 -6" />
                </svg>
              </a>
            </li>
            <li>
              <a href="#loan" onClick={(e) => scrollToSection(e, "loan")} className="b-nav-link">
                Loan
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6l6 -6" />
                </svg>
              </a>
            </li>
            <li>
              <a href="#blog" onClick={(e) => scrollToSection(e, "blog")} className="b-nav-link">Blog</a>
            </li>
            <li>
              <a href="#contact" onClick={(e) => scrollToSection(e, "contact")} className="b-nav-link">Contact</a>
            </li>
          </ul>

          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <Link to="/" className="b-btn-login">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              <span>Login</span>
            </Link>

            <Link to="/usertype" className="b-btn-get-started">
              <span>Get Started</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
