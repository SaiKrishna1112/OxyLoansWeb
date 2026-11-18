import os

print("Writing enhanced animated components for Babuz...")

BABUZ_LANDING = """import React, { useEffect } from "react";
import Lenis from "lenis";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import ServicesSection from "./ServicesSection";
import PricingSection from "./PricingSection";
import LoanMasterySection from "./LoanMasterySection";
import FaqSection from "./FaqSection";
import TeamSection from "./TeamSection";
import TestimonialsSection from "./TestimonialsSection";
import CounterSection from "./CounterSection";
import BlogSection from "./BlogSection";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import "./babuz.css";

const BabuzLanding = () => {
  useEffect(() => {
    document.title = "Home Three - Banking Solutions for Businesses | Babuz";

    // Disable browser scroll restoration so page always starts at top hero
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);

    // Initialize Lenis Ultra-Smooth Scrolling
    let lenis = null;
    let animationFrameId = null;

    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.1,
        touchMultiplier: 2,
      });

      lenis.scrollTo(0, { immediate: true });

      function raf(time) {
        if (lenis) {
          lenis.raf(time);
          animationFrameId = requestAnimationFrame(raf);
        }
      }
      animationFrameId = requestAnimationFrame(raf);

      window.__babuz_lenis = lenis;
    } catch (e) {
      console.warn("Lenis init fallback:", e);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (lenis) lenis.destroy();
      window.__babuz_lenis = null;
    };
  }, []);

  return (
    <div className="babuz-page">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <PricingSection />
      <LoanMasterySection />
      <FaqSection />
      <TeamSection />
      <TestimonialsSection />
      <CounterSection />
      <BlogSection />
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default BabuzLanding;
"""

SCROLL_TO_TOP = """import React, { useState, useEffect } from "react";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    if (window.__babuz_lenis) {
      window.__babuz_lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!visible) return null;

  const strokeDashoffset = 126 - (126 * scrollProgress) / 100;

  return (
    <div
      className="b-scroll-top"
      onClick={scrollToTop}
      title="Scroll to top"
      style={{
        position: "fixed",
        bottom: "30px",
        right: "30px",
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        backgroundColor: "#ffffff",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 9999,
        transition: "all 0.3s ease",
      }}
    >
      <svg width="44" height="44" viewBox="0 0 44 44" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
        <circle cx="22" cy="22" r="20" fill="none" stroke="#e0e0e0" strokeWidth="2.5" />
        <circle
          cx="22"
          cy="22"
          r="20"
          fill="none"
          stroke="#005655"
          strokeWidth="2.5"
          strokeDasharray="126"
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.1s linear" }}
        />
      </svg>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.5" style={{ position: "relative", zIndex: 2 }}>
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </div>
  );
};

export default ScrollToTop;
"""

SERVICES_JSX = """import React, { useState } from "react";
import { Link } from "react-router-dom";

const ServicesSection = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  const services = [
    {
      icon: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
      title: "Savings Account",
      desc: "Reduced Payments maintenance and processing fees. No hidden fees.",
    },
    {
      icon: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 3l4 4-4 4" />
          <path d="M3 7h18" />
          <path d="M7 21l-4-4 4-4" />
          <path d="M21 17H3" />
        </svg>
      ),
      title: "Pay Out & Refund",
      desc: "Execute pay outs and refunds straight to your customer's bank account via Babuz.",
    },
    {
      icon: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "Agent Banking",
      desc: "Stay updated: check your bank account to manage funds and track transactions securely.",
    },
    {
      icon: (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8" />
          <path d="M12 17v4" />
        </svg>
      ),
      title: "Boost your Payments",
      desc: "Reduced Payments maintenance and processing fees. No hidden fees.",
    },
  ];

  const visibleCards = [
    services[activeIdx % services.length],
    services[(activeIdx + 1) % services.length],
  ];

  return (
    <section id="services" className="b-services-section">
      <div className="b-runner-lines">
        <div className="b-runner-line b-runner-line-white" style={{ left: "10%" }}></div>
        <div className="b-runner-line b-runner-line-white" style={{ left: "30%" }}></div>
        <div className="b-runner-line b-runner-line-white" style={{ left: "50%" }}></div>
        <div className="b-runner-line b-runner-line-white" style={{ left: "70%" }}></div>
        <div className="b-runner-line b-runner-line-white" style={{ left: "90%" }}></div>
      </div>

      <div className="b-container">
        <div className="b-services-grid">
          <div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "16px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>
              SERVICES
            </div>
            <h2 style={{ fontSize: "44px", fontWeight: 700, color: "#ffffff", lineHeight: 1.2, margin: "0 0 20px 0" }}>
              Our Featured Services.
            </h2>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "17px", lineHeight: 1.65, margin: "0 0 40px 0" }}>
              Integrate Babuz on your web-site to offer fast, secure and seamless online bank transfer payment method. You could receive payments straight into your company bank account or open a Babuz merchant account and collect funds there.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <Link to="/usertype" className="b-circle-btn b-circle-btn-yellow">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
                <span style={{ fontSize: "15px" }}>All Services</span>
              </Link>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {[0, 1, 2, 3].map((idx) => (
                  <span
                    key={idx}
                    onClick={() => setActiveIdx(idx)}
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: activeIdx === idx ? "#ffce32" : "transparent",
                      border: "2px solid #ffce32",
                      cursor: "pointer",
                      display: "inline-block",
                      transition: "all 0.3s ease",
                      transform: activeIdx === idx ? "scale(1.2)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {visibleCards.map((srv, idx) => (
              <div key={idx} className="b-service-card" style={{ animation: "titleFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
                <div style={{ color: "#ffce32", marginBottom: "20px" }}>{srv.icon}</div>
                <h3 style={{ color: "#ffffff", fontSize: "22px", fontWeight: 600, margin: "0 0 14px 0" }}>
                  {srv.title}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "15px", lineHeight: 1.6, margin: "0 0 28px 0" }}>
                  {srv.desc}
                </p>
                <Link
                  to="/usertype"
                  style={{
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "15px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ffce32")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#ffffff")}
                >
                  <span>Learn More</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <img
          src="/assets/images/babuz/service-animale.b432fdbc.png"
          alt="Mascot"
          className="b-anim-pulse"
          style={{
            position: "absolute",
            bottom: "-30px",
            left: "20px",
            width: "100px",
            height: "auto",
            pointerEvents: "none",
            zIndex: 3,
          }}
        />
      </div>
    </section>
  );
};

export default ServicesSection;
"""

NAVBAR_JSX = """import React, { useState, useEffect } from "react";
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
"""

files_to_update = {
    "BabuzLanding.jsx": BABUZ_LANDING,
    "ScrollToTop.jsx": SCROLL_TO_TOP,
    "ServicesSection.jsx": SERVICES_JSX,
    "Navbar.jsx": NAVBAR_JSX,
}

base_dir = "src/components/pages/BabuzLanding"
for filename, content in files_to_update.items():
    filepath = os.path.join(base_dir, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\n")
    print(f"Updated: {filename}")

print("All enhanced animated components written successfully!")
