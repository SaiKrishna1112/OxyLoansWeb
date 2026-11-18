import os

print("Writing all 13 components for Babuz landing page...")

NAVBAR_JSX = """import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`b-navbar ${isScrolled ? "scrolled" : ""}`}>
      <div className="b-container">
        <div className="b-navbar-inner">
          {/* Logo */}
          <Link to="/home" style={{ display: "flex", alignItems: "center" }}>
            <img
              src="/assets/images/babuz/logo.40962213.png"
              alt="BabuZ"
              style={{ height: "48px", width: "auto" }}
            />
          </Link>

          {/* Desktop Nav Links */}
          <ul className="b-nav-links" style={{ display: window.innerWidth < 992 ? "none" : "flex" }}>
            <li>
              <a href="#hero" className="b-nav-link">
                Home
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6l6 -6" />
                </svg>
              </a>
            </li>
            <li>
              <a href="#about" className="b-nav-link">About</a>
            </li>
            <li>
              <a href="#services" className="b-nav-link">
                Pages
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6l6 -6" />
                </svg>
              </a>
            </li>
            <li>
              <a href="#loan" className="b-nav-link">
                Loan
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6l6 -6" />
                </svg>
              </a>
            </li>
            <li>
              <a href="#blog" className="b-nav-link">Blog</a>
            </li>
            <li>
              <a href="#contact" className="b-nav-link">Contact</a>
            </li>
          </ul>

          {/* Actions */}
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

HERO_JSX = """import React from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section id="hero" className="b-hero-wrapper">
      <div className="b-hero-card">
        {/* Floating review badge */}
        <div className="b-hero-reviews-badge">
          <img
            src="/assets/images/babuz/banner-star.64effc86.png"
            alt="Star"
            className="b-anim-pulse"
            style={{ width: "50px", height: "50px" }}
          />
          <div
            style={{
              backgroundColor: "#7d49f3",
              borderRadius: "50px",
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#ffffff",
              fontWeight: 600,
            }}
          >
            <span>4.7</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffffff">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#ffffff", fontSize: "14px", fontWeight: 500, margin: "0 0 8px 0" }}>Active user</p>
            <div style={{ display: "flex", justifyContent: "center", marginLeft: "10px" }}>
              <img
                src="/assets/images/babuz/banner-user-1.81918b8a.png"
                alt="user"
                style={{ width: "42px", height: "42px", borderRadius: "50%", border: "2px solid #ffffff", marginLeft: "-10px" }}
              />
              <img
                src="/assets/images/babuz/banner-user-2.4309ff3a.png"
                alt="user"
                style={{ width: "42px", height: "42px", borderRadius: "50%", border: "2px solid #ffffff", marginLeft: "-10px" }}
              />
              <img
                src="/assets/images/babuz/banner-user-3.06a324c1.png"
                alt="user"
                style={{ width: "42px", height: "42px", borderRadius: "50%", border: "2px solid #ffffff", marginLeft: "-10px" }}
              />
            </div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px", marginTop: "8px", margin: 0 }}>+100 More</p>
          </div>
        </div>

        <div className="b-container">
          <div className="b-hero-grid">
            {/* Left Content */}
            <div>
              <div className="b-hero-subtitle">SAVE &amp; MANAGE YOUR MONEY</div>
              <h1 className="b-hero-title">Banking Solutions for Businesses</h1>
              <p className="b-hero-desc">
                Banking is the practice of accepting and safeguarding money owned and then to earn a profit.
              </p>
              <div className="b-hero-btns">
                <Link to="/usertype" className="b-btn-hero-outline">
                  <span>Open Account</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 17L17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </Link>
                <Link to="/usertype" className="b-btn-hero-outline">
                  <span>Get in touch</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M7 17L17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right Graphic */}
            <div className="b-hero-image-wrap">
              <img
                src="/assets/images/babuz/banner-three-image.bdac1d43.png"
                alt="Banking Solutions for Businesses"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
"""

ABOUT_JSX = """import React from "react";
import { Link } from "react-router-dom";

const AboutSection = () => {
  return (
    <section id="about" className="b-about-section">
      {/* Background runner lines */}
      <div className="b-runner-lines">
        <div className="b-runner-line" style={{ left: "10%" }}></div>
        <div className="b-runner-line" style={{ left: "30%" }}></div>
        <div className="b-runner-line" style={{ left: "50%" }}></div>
        <div className="b-runner-line" style={{ left: "70%" }}></div>
        <div className="b-runner-line" style={{ left: "90%" }}></div>
      </div>

      <div className="b-container">
        <div className="b-about-grid">
          {/* Left Graphic */}
          <div style={{ position: "relative", textAlign: "center" }}>
            <img
              src="/assets/images/babuz/about.2df54fdb.png"
              alt="About Babuz"
              style={{ maxWidth: "100%", maxHeight: "550px", height: "auto", display: "inline-block" }}
            />
            {/* Animated star */}
            <img
              src="/assets/images/babuz/about-star.6a9d5df8.png"
              alt="star"
              className="b-anim-pulse"
              style={{ position: "absolute", top: "20px", left: "20px", width: "90px", height: "90px", pointerEvents: "none" }}
            />
          </div>

          {/* Right Text */}
          <div>
            <div style={{ color: "#005655", fontSize: "16px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>
              ABOUT US
            </div>
            <h2 style={{ fontSize: "42px", fontWeight: 700, color: "#111111", lineHeight: 1.2, margin: "0 0 16px 0" }}>
              Introduction to Banking
            </h2>
            <p style={{ color: "#555555", fontSize: "17px", lineHeight: 1.65, margin: "0 0 40px 0" }}>
              This section provides an overview of what banking is and its importance in the financial system.
            </p>

            {/* Feature Sub-row */}
            <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
              <Link to="/usertype" className="b-circle-btn b-circle-btn-yellow">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
                <span style={{ fontSize: "15px" }}>About More</span>
              </Link>

              <div style={{ flex: 1, minWidth: "240px" }}>
                <h3 style={{ fontSize: "24px", fontWeight: 700, color: "#111111", margin: "0 0 10px 0" }}>
                  Online and Mobile Banking
                </h3>
                <p style={{ color: "#666666", fontSize: "16px", lineHeight: 1.6, margin: 0 }}>
                  Highlights the impact of technology on the banking industry, enabling convenient digital access to financial services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
"""

SERVICES_JSX = """import React, { useState } from "react";
import { Link } from "react-router-dom";

const ServicesSection = () => {
  const [activeDot, setActiveDot] = useState(0);

  const services = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
      title: "Savings Account",
      desc: "Reduced Payments maintenance and processing fees. No hidden fees.",
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "Agent Banking",
      desc: "Stay updated: check your bank account to manage funds and track transactions securely.",
    },
  ];

  return (
    <section id="services" className="b-services-section">
      {/* Background runner lines */}
      <div className="b-runner-lines">
        <div className="b-runner-line b-runner-line-white" style={{ left: "10%" }}></div>
        <div className="b-runner-line b-runner-line-white" style={{ left: "30%" }}></div>
        <div className="b-runner-line b-runner-line-white" style={{ left: "50%" }}></div>
        <div className="b-runner-line b-runner-line-white" style={{ left: "70%" }}></div>
        <div className="b-runner-line b-runner-line-white" style={{ left: "90%" }}></div>
      </div>

      <div className="b-container">
        <div className="b-services-grid">
          {/* Left info */}
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

              {/* Indicator dots */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {[0, 1, 2, 3].map((idx) => (
                  <span
                    key={idx}
                    onClick={() => setActiveDot(idx)}
                    style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      backgroundColor: activeDot === idx ? "#ffce32" : "transparent",
                      border: "2px solid #ffce32",
                      cursor: "pointer",
                      display: "inline-block",
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {services.slice(0, 2).map((srv, idx) => (
              <div key={idx} className="b-service-card">
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

        {/* Mascot */}
        <img
          src="/assets/images/babuz/service-animale.b432fdbc.png"
          alt="Mascot"
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

PRICING_JSX = """import React, { useState } from "react";
import { Link } from "react-router-dom";

const PricingSection = () => {
  const [billingCycle, setBillingCycle] = useState("Yearly");

  const plans = [
    {
      name: "Simple Plan",
      price: billingCycle === "Yearly" ? "$10" : "$3",
      period: billingCycle === "Yearly" ? "/yr" : "/wk",
      featured: false,
      cornerColor: "#7d49f3",
      minInvestment: "$100",
      duration: "30D",
      dailyReturns: "2.0%",
      totalReturn: "160%",
      btnText: "Join Simple Plan",
    },
    {
      name: "Growth Plan",
      price: billingCycle === "Yearly" ? "$30" : "$8",
      period: billingCycle === "Yearly" ? "/yr" : "/wk",
      featured: true,
      badge: "Most Popular",
      minInvestment: "$500",
      duration: "60D",
      dailyReturns: "2.5%",
      totalReturn: "230%",
      btnText: "Join Standard Plan",
    },
    {
      name: "Premium Plan",
      price: billingCycle === "Yearly" ? "$75" : "$20",
      period: billingCycle === "Yearly" ? "/yr" : "/wk",
      featured: false,
      cornerColor: "#005655",
      minInvestment: "$1000",
      duration: "90D",
      dailyReturns: "3.0%",
      totalReturn: "475%",
      btnText: "Join Premium Plan",
    },
  ];

  return (
    <section id="pricing" className="b-pricing-section">
      <div className="b-container">
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto" }}>
          <div style={{ color: "#005655", fontSize: "16px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>
            PRICING PLAN
          </div>
          <h2 style={{ fontSize: "44px", fontWeight: 700, color: "#111111", lineHeight: 1.2, margin: "0 0 16px 0" }}>
            Simple pricing for everyone.
          </h2>
          <p style={{ color: "#666666", fontSize: "17px", lineHeight: 1.6, margin: "0 0 32px 0" }}>
            Use customer data to build great and solid product experiences that convert.
          </p>

          {/* Switcher */}
          <div style={{ display: "inline-flex", alignItems: "center", backgroundColor: "#ffffff", border: "1px solid #e0e0e0", borderRadius: "8px", padding: "4px" }}>
            <button
              onClick={() => setBillingCycle("Weekly")}
              style={{
                padding: "10px 28px",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "15px",
                backgroundColor: billingCycle === "Weekly" ? "#ffce32" : "transparent",
                color: "#111111",
                transition: "all 0.3s ease",
              }}
            >
              Weekly
            </button>
            <button
              onClick={() => setBillingCycle("Yearly")}
              style={{
                padding: "10px 28px",
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "15px",
                backgroundColor: billingCycle === "Yearly" ? "#ffce32" : "transparent",
                color: "#111111",
                transition: "all 0.3s ease",
              }}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="b-pricing-grid">
          {plans.map((p, idx) => (
            <div key={idx} className={`b-pricing-card ${p.featured ? "featured" : ""}`}>
              {/* Corner accent if not featured */}
              {!p.featured && p.cornerColor && (
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    right: "-20px",
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    backgroundColor: p.cornerColor,
                  }}
                />
              )}

              {/* Most popular badge */}
              {p.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: "24px",
                    right: "24px",
                    backgroundColor: "#111111",
                    color: "#ffce32",
                    fontSize: "13px",
                    fontWeight: 700,
                    padding: "6px 14px",
                    borderRadius: "20px",
                  }}
                >
                  {p.badge}
                </div>
              )}

              <h3 style={{ fontSize: "22px", fontWeight: 600, color: "#111111", margin: "0 0 20px 0" }}>
                {p.name}
              </h3>

              <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "32px" }}>
                <span style={{ fontSize: "48px", fontWeight: 700, color: "#111111" }}>{p.price}</span>
                <span style={{ fontSize: "16px", color: p.featured ? "#333333" : "#666666" }}>{p.period}</span>
              </div>

              {/* Rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "36px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "#333333", fontSize: "15px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Minimum Investment
                  </span>
                  <span style={{ fontWeight: 700, color: "#111111", fontSize: "15px" }}>{p.minInvestment}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "#333333", fontSize: "15px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Investment Duration
                  </span>
                  <span style={{ fontWeight: 700, color: "#111111", fontSize: "15px" }}>{p.duration}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "#333333", fontSize: "15px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Daily Returns
                  </span>
                  <span style={{ fontWeight: 700, color: "#111111", fontSize: "15px" }}>{p.dailyReturns}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "#333333", fontSize: "15px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Total Return
                  </span>
                  <span style={{ fontWeight: 700, color: "#111111", fontSize: "15px" }}>{p.totalReturn}</span>
                </div>
              </div>

              {/* Action Button */}
              <Link
                to="/usertype"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "14px 20px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "15px",
                  backgroundColor: p.featured ? "#111111" : "#ffce32",
                  color: p.featured ? "#ffce32" : "#111111",
                  transition: "all 0.3s ease",
                }}
              >
                {p.btnText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
"""

LOAN_JSX = """import React from "react";
import { Link } from "react-router-dom";

const LoanMasterySection = () => {
  const features = [
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7d49f3" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8" />
          <path d="M12 17v4" />
        </svg>
      ),
      title: "Boost your Payments",
      desc: "Reduced Payments maintenance and processing fees. No hidden fees.",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7d49f3" strokeWidth="2">
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
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7d49f3" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      ),
      title: "Savings Account",
      desc: "Reduced Payments maintenance and processing fees. No hidden fees.",
    },
    {
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7d49f3" strokeWidth="2">
          <path d="M17 3l4 4-4 4" />
          <path d="M3 7h18" />
          <path d="M7 21l-4-4 4-4" />
          <path d="M21 17H3" />
        </svg>
      ),
      title: "Pay Out & Refund",
      desc: "Execute pay outs and refunds straight to your customer's bank account via Babuz.",
    },
  ];

  return (
    <section id="loan" className="b-loan-section">
      <div className="b-loan-grid">
        {/* Left Side: 4 Cards in 2x2 */}
        <div style={{ padding: "80px 60px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px 30px", backgroundColor: "#f8f9fa" }}>
          {features.map((f, idx) => (
            <div key={idx} style={{ maxWidth: "300px" }}>
              <div style={{ marginBottom: "16px" }}>{f.icon}</div>
              <h4 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", margin: "0 0 10px 0" }}>
                {f.title}
              </h4>
              <p style={{ color: "#666666", fontSize: "15px", lineHeight: 1.6, margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Right Side: Royal Purple Box */}
        <div className="b-loan-purple-box">
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "15px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>
            FINANCIAL PLANNING
          </div>
          <h2 style={{ fontSize: "40px", fontWeight: 700, color: "#ffffff", lineHeight: 1.25, margin: "0 0 20px 0" }}>
            Financial Mastery. The Right Way to Plan
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "17px", lineHeight: 1.65, margin: "0 0 40px 0", maxWidth: "480px" }}>
            Lending that doesn't weigh you down. We know how hard it is to start something new, that's why we have the perfect plan for you.
          </p>

          <Link to="/usertype" className="b-circle-btn b-circle-btn-yellow">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
            <span style={{ fontSize: "14px" }}>Apply For A Loan</span>
          </Link>

          {/* Robot graphic */}
          <img
            src="/assets/images/babuz/robot.50761808.png"
            alt="Robot"
            style={{
              position: "absolute",
              bottom: "10px",
              right: "20px",
              width: "120px",
              height: "auto",
              pointerEvents: "none",
              opacity: 0.9,
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default LoanMasterySection;
"""

FAQ_JSX = """import React, { useState } from "react";

const FaqSection = () => {
  const [openIdx, setOpenIdx] = useState(null);

  const leftFaqs = [
    { q: "How do I report fraudulent activity on my account?", a: "You can report fraudulent transactions instantly through our 24/7 mobile app support or by calling our fraud prevention helpline immediately." },
    { q: "Can I set up account alerts for unusual transactions?", a: "Yes, you can enable custom SMS and push notification alerts for high-value transactions, international usage, and daily limits." },
    { q: "What should I do if my card is damaged?", a: "You can request a free card replacement directly in your account settings, and a new contactless card will be dispatched within 48 hours." },
    { q: "Is there a way to dispute a transaction on my account?", a: "Yes, tap the disputed transaction in your account dashboard and select 'Dispute Charge' to submit evidence for rapid resolution." },
    { q: "What steps should I take if I forget my card PIN?", a: "You can instantly and securely reset your PIN in the app using biometric verification or OTP verification." },
  ];

  const rightFaqs = [
    { q: "How do I report fraudulent activity on my account?", a: "You can report fraudulent transactions instantly through our 24/7 mobile app support or by calling our fraud prevention helpline immediately." },
    { q: "Can I set up account alerts for unusual transactions?", a: "Yes, you can enable custom SMS and push notification alerts for high-value transactions, international usage, and daily limits." },
    { q: "What should I do if my card is damaged?", a: "You can request a free card replacement directly in your account settings, and a new contactless card will be dispatched within 48 hours." },
    { q: "Is there a way to dispute a transaction on my account?", a: "Yes, tap the disputed transaction in your account dashboard and select 'Dispute Charge' to submit evidence for rapid resolution." },
    { q: "What steps should I take if I forget my card PIN?", a: "You can instantly and securely reset your PIN in the app using biometric verification or OTP verification." },
  ];

  const toggle = (key) => {
    setOpenIdx(openIdx === key ? null : key);
  };

  return (
    <section id="faq" className="b-faq-section">
      {/* Background runner lines */}
      <div className="b-runner-lines">
        <div className="b-runner-line" style={{ left: "10%" }}></div>
        <div className="b-runner-line" style={{ left: "30%" }}></div>
        <div className="b-runner-line" style={{ left: "50%" }}></div>
        <div className="b-runner-line" style={{ left: "70%" }}></div>
        <div className="b-runner-line" style={{ left: "90%" }}></div>
      </div>

      <div className="b-container">
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ color: "#005655", fontSize: "16px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>
            FAQ
          </div>
          <h2 style={{ fontSize: "44px", fontWeight: 700, color: "#111111", lineHeight: 1.2, margin: 0 }}>
            Frequently ASked Questions
          </h2>
        </div>

        {/* 2 Columns */}
        <div className="b-faq-grid">
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {leftFaqs.map((faq, idx) => {
              const isOpen = openIdx === `l-${idx}`;
              return (
                <div
                  key={idx}
                  className={`b-faq-item ${isOpen ? "open" : ""}`}
                  onClick={() => toggle(`l-${idx}`)}
                >
                  <div style={{ flex: 1, paddingRight: "16px" }}>
                    <div style={{ fontWeight: 600, fontSize: "16px", color: "#111111" }}>{faq.q}</div>
                    {isOpen && (
                      <p style={{ color: "#666666", fontSize: "14px", marginTop: "12px", lineHeight: 1.6, margin: 0 }}>
                        {faq.a}
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      border: "1px solid #d0d0d0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "#111111",
                      flexShrink: 0,
                    }}
                  >
                    {isOpen ? "−" : "+"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {rightFaqs.map((faq, idx) => {
              const isOpen = openIdx === `r-${idx}`;
              return (
                <div
                  key={idx}
                  className={`b-faq-item ${isOpen ? "open" : ""}`}
                  onClick={() => toggle(`r-${idx}`)}
                >
                  <div style={{ flex: 1, paddingRight: "16px" }}>
                    <div style={{ fontWeight: 600, fontSize: "16px", color: "#111111" }}>{faq.q}</div>
                    {isOpen && (
                      <p style={{ color: "#666666", fontSize: "14px", marginTop: "12px", lineHeight: 1.6, margin: 0 }}>
                        {faq.a}
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      border: "1px solid #d0d0d0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "#111111",
                      flexShrink: 0,
                    }}
                  >
                    {isOpen ? "−" : "+"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
"""

TEAM_JSX = """import React, { useState } from "react";
import { Link } from "react-router-dom";

const TeamSection = () => {
  const [slideOffset, setSlideOffset] = useState(0);

  const teamMembers = [
    {
      name: "Amanda Jones",
      role: "Customer Support Specialist",
      img: "/assets/images/babuz/home-one-team-1.e0dadc48.png",
    },
    {
      name: "Charles S. Brown",
      role: "CEO & Founder",
      img: "/assets/images/babuz/home-one-team-2.365585d0.png",
    },
    {
      name: "Jennifer White",
      role: "COO",
      img: "/assets/images/babuz/home-one-team-3.0212e381.png",
    },
    {
      name: "Robert Johnson",
      role: "CFO",
      img: "/assets/images/babuz/home-one-team-4.c3bf5dc0.png",
    },
    {
      name: "Olivia Smith",
      role: "CTO",
      img: "/assets/images/babuz/home-one-team-5.4ac8fec8.png",
    },
    {
      name: "Eva Green",
      role: "Head of Marketing",
      img: "/assets/images/babuz/home-one-team-6.9b5e03ce.png",
    },
  ];

  const visibleMembers = teamMembers.slice(slideOffset, slideOffset + 3);

  const nextSlide = () => {
    if (slideOffset + 3 < teamMembers.length) {
      setSlideOffset(slideOffset + 1);
    } else {
      setSlideOffset(0);
    }
  };

  const prevSlide = () => {
    if (slideOffset > 0) {
      setSlideOffset(slideOffset - 1);
    } else {
      setSlideOffset(teamMembers.length - 3);
    }
  };

  return (
    <section id="team" className="b-team-section">
      <div className="b-container">
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px" }}>
          <div>
            <div style={{ color: "#005655", fontSize: "16px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>
              OUR TEAM
            </div>
            <h2 style={{ fontSize: "44px", fontWeight: 700, color: "#111111", lineHeight: 1.2, margin: 0 }}>
              We are Business Consulting<br />Professionals
            </h2>
          </div>

          <Link to="/usertype" className="b-circle-btn b-circle-btn-white">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
            <span style={{ fontSize: "15px" }}>Explore Now</span>
          </Link>
        </div>

        {/* 3 Team Cards */}
        <div className="b-team-grid">
          {visibleMembers.map((m, idx) => (
            <div key={idx} className="b-team-card">
              <div className="b-team-card-image">
                <img src={m.img} alt={m.name} />
                <div className="b-team-plus-badge">+</div>
              </div>
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <h4 style={{ fontSize: "22px", fontWeight: 700, color: "#111111", margin: "0 0 6px 0" }}>
                  {m.name}
                </h4>
                <p style={{ color: "#777777", fontSize: "15px", margin: 0 }}>
                  {m.role}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Slider Controls */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", marginTop: "40px" }}>
          <button
            onClick={prevSlide}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "1px solid #d0d0d0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            &larr;
          </button>
          <button
            onClick={nextSlide}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "1px solid #d0d0d0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            &rarr;
          </button>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
"""

TESTIMONIALS_JSX = """import React, { useState } from "react";

const TestimonialsSection = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  const testimonials = [
    {
      quote: "It's been 2 years since I found Bankio, and it's such a relief as a small business owner to not worry about unnecessary fees. I lost my credit card once, and the service was so quick.",
      name: "Andrew Russel",
      role: "VP of Marketing",
      img: "/assets/images/babuz/home-one-testimonial-1.912f25d0.png",
    },
    {
      quote: "Bankio has made managing my finances so much easier. The user-friendly interface and excellent customer support make it the perfect choice for individuals and businesses alike.",
      name: "Emily Thompson",
      role: "Freelance Designer",
      img: "/assets/images/babuz/home-one-testimonial-2.a7bcae8b.png",
    },
    {
      quote: "I switched to Bankio for my personal and business banking needs, and I couldn't be happier. The app is intuitive, and I love the convenience it offers.",
      name: "John Davis",
      role: "Entrepreneur",
      img: "/assets/images/babuz/home-one-testimonial-3.053c370b.png",
    },
  ];

  const nextTesti = () => {
    setActiveIdx((activeIdx + 1) % testimonials.length);
  };

  const prevTesti = () => {
    setActiveIdx((activeIdx - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[activeIdx];

  return (
    <section id="testimonials" className="b-testimonials-section">
      {/* Background runner lines */}
      <div className="b-runner-lines">
        <div className="b-runner-line" style={{ left: "10%" }}></div>
        <div className="b-runner-line" style={{ left: "30%" }}></div>
        <div className="b-runner-line" style={{ left: "50%" }}></div>
        <div className="b-runner-line" style={{ left: "70%" }}></div>
        <div className="b-runner-line" style={{ left: "90%" }}></div>
      </div>

      <div className="b-container">
        {/* Header */}
        <div style={{ color: "#005655", fontSize: "16px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>
          TESTIMONIALS
        </div>
        <h2 style={{ fontSize: "44px", fontWeight: 700, color: "#111111", lineHeight: 1.2, margin: "0 0 40px 0" }}>
          What people say
        </h2>

        {/* Quote Badge */}
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "rgba(125, 73, 243, 0.1)",
            color: "#7d49f3",
            fontSize: "24px",
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          99
        </div>

        {/* 5 Stars */}
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", color: "#ffce32", fontSize: "20px", marginBottom: "28px" }}>
          {"★★★★★"}
        </div>

        {/* Quote text */}
        <div style={{ position: "relative", maxWidth: "800px", margin: "0 auto 36px auto" }}>
          <p style={{ fontSize: "22px", fontWeight: 500, color: "#222222", lineHeight: 1.6, margin: 0 }}>
            "{current.quote}"
          </p>

          {/* Left Arrow Button */}
          <button
            onClick={prevTesti}
            style={{
              position: "absolute",
              left: "-80px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "1px solid #d0d0d0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            &larr;
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={nextTesti}
            style={{
              position: "absolute",
              right: "-80px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "1px solid #d0d0d0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            &rarr;
          </button>
        </div>

        {/* Author Avatar and Info */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <img
            src={current.img}
            alt={current.name}
            style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", marginBottom: "12px", border: "2px solid #ffce32" }}
          />
          <h4 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", margin: "0 0 4px 0" }}>
            {current.name}
          </h4>
          <p style={{ color: "#777777", fontSize: "15px", margin: 0 }}>
            {current.role}
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
"""

COUNTER_JSX = """import React from "react";

const CounterSection = () => {
  const stats = [
    { number: "120 +", label: "Partner with us" },
    { number: "$1.3+", label: "Cumulative trading volume" },
    { number: "705K+", label: "Successful Projects" },
    { number: "575K", label: "Active Banking Accounts" },
  ];

  return (
    <section className="b-counter-section">
      <div className="b-container">
        <div className="b-counter-grid">
          {stats.map((s, idx) => (
            <div key={idx} className="b-counter-item">
              <h3 style={{ fontSize: "52px", fontWeight: 700, color: "#005655", margin: "0 0 8px 0" }}>
                {s.number}
              </h3>
              <p style={{ color: "#666666", fontSize: "16px", fontWeight: 500, margin: 0 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CounterSection;
"""

BLOG_JSX = """import React from "react";
import { Link } from "react-router-dom";

const BlogSection = () => {
  const blogs = [
    {
      img: "/assets/images/babuz/home-one-recent-blog-1.3fab76d3.png",
      date: "Latest News December 12, 2023",
      title: "The future of fraud protection.",
      desc: "Morbi eget venenatis lorem, id viverra massa. Etiam congue efficitur velit vel pharetra.",
    },
    {
      img: "/assets/images/babuz/home-one-recent-blog-2.7ec13838.png",
      date: "Latest News December 12, 2023",
      title: "Digital Banking Services",
      desc: "Morbi eget venenatis lorem, id viverra massa. Etiam congue efficitur velit vel pharetra.",
    },
  ];

  return (
    <section id="blog" className="b-blog-section">
      {/* Background runner lines */}
      <div className="b-runner-lines">
        <div className="b-runner-line" style={{ left: "10%" }}></div>
        <div className="b-runner-line" style={{ left: "30%" }}></div>
        <div className="b-runner-line" style={{ left: "50%" }}></div>
        <div className="b-runner-line" style={{ left: "70%" }}></div>
        <div className="b-runner-line" style={{ left: "90%" }}></div>
      </div>

      <div className="b-container">
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px" }}>
          <div>
            <div style={{ color: "#005655", fontSize: "16px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>
              RECENT BLOG
            </div>
            <h2 style={{ fontSize: "44px", fontWeight: 700, color: "#111111", lineHeight: 1.2, margin: 0 }}>
              Read update<br />Journal
            </h2>
          </div>

          <p style={{ color: "#666666", fontSize: "16px", lineHeight: 1.6, maxWidth: "420px", margin: 0 }}>
            Read our blog and try to see passion kesin making everything accessible andaesthetic for everyone.
          </p>
        </div>

        {/* 2 Blog Cards */}
        <div className="b-blog-grid">
          {blogs.map((b, idx) => (
            <div
              key={idx}
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid #ebebeb",
                backgroundColor: "#ffffff",
                transition: "all 0.3s ease",
              }}
            >
              <img
                src={b.img}
                alt={b.title}
                style={{ width: "100%", height: "280px", objectFit: "cover", display: "block" }}
              />
              <div style={{ padding: "32px 28px" }}>
                <div style={{ color: "#888888", fontSize: "13px", fontWeight: 500, marginBottom: "10px" }}>
                  {b.date}
                </div>
                <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#111111", margin: "0 0 12px 0" }}>
                  {b.title}
                </h3>
                <p style={{ color: "#666666", fontSize: "15px", lineHeight: 1.6, margin: "0 0 24px 0" }}>
                  {b.desc}
                </p>
                <Link
                  to="/usertype"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#005655",
                    fontWeight: 600,
                    fontSize: "15px",
                  }}
                >
                  <span>Read More</span>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "6px",
                      backgroundColor: "#005655",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 17L17 7" />
                      <path d="M7 7h10v10" />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom All Blog Button */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
          <Link to="/usertype" className="b-circle-btn b-circle-btn-white">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
            <span style={{ fontSize: "15px" }}>All Blog</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
"""

FOOTER_JSX = """import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer id="contact" className="b-footer">
      <div className="b-container" style={{ paddingTop: "80px" }}>
        {/* Full-width Horizontal Top CTA Bar */}
        <div className="b-footer-cta-bar">
          <div>
            <h3 style={{ fontSize: "32px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
              Have a Project in Your Mind?
            </h3>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#ffffff", fontSize: "18px", fontWeight: 600 }}>09:00 AM - 10:30 PM</div>
            <div style={{ color: "#ffce32", fontSize: "15px", fontWeight: 600, marginTop: "4px" }}>Saturday - Thursday</div>
          </div>

          <div>
            <Link to="/usertype" className="b-circle-btn b-circle-btn-yellow" style={{ width: "120px", height: "120px" }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
              <span style={{ fontSize: "13px" }}>Contact Us</span>
            </Link>
          </div>
        </div>

        {/* 4 Column Main Footer */}
        <div className="b-footer-grid">
          {/* Column 1: Logo & Info */}
          <div>
            <img
              src="/assets/images/babuz/footer-logo.09cbce3b.png"
              alt="BabuZ"
              style={{ height: "46px", width: "auto", marginBottom: "20px" }}
            />
            <p style={{ color: "#8e9097", fontSize: "15px", lineHeight: 1.65, margin: "0 0 24px 0" }}>
              Highlights the impact of technology on the banking industry, enabling convenient digital access to financial services.
            </p>
            {/* Social Icons */}
            <div style={{ display: "flex", gap: "10px" }}>
              {["facebook", "twitch", "instagram", "discord", "youtube"].map((platform, idx) => (
                <a
                  key={idx}
                  href={`https://${platform}.com`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    backgroundColor: "#1e1e1e",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#005655")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1e1e1e")}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff", margin: "0 0 24px 0" }}>Quick Link</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              {["About Us", "Our Blog", "Services", "Our Features", "Contact Us"].map((link, idx) => (
                <li key={idx}>
                  <a
                    href="#about"
                    style={{ color: "#8e9097", fontSize: "15px", transition: "all 0.3s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ffce32")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8e9097")}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Us */}
          <div>
            <h4 style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff", margin: "0 0 24px 0" }}>Contact Us</h4>
            <p style={{ color: "#8e9097", fontSize: "15px", lineHeight: 1.6, margin: "0 0 16px 0" }}>
              Valentin, Street Road 27, New<br />York, USA - 752252
            </p>
            <p style={{ margin: "0 0 8px 0" }}>
              <a href="tel:3035550105" style={{ color: "#8e9097", fontSize: "15px", textDecoration: "underline" }}>
                (303) 555-0105
              </a>
            </p>
            <p style={{ margin: 0 }}>
              <a href="mailto:info@gmail.com" style={{ color: "#8e9097", fontSize: "15px" }}>
                info@gmail.com
              </a>
            </p>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff", margin: "0 0 24px 0" }}>Newsletter</h4>
            <p style={{ color: "#8e9097", fontSize: "15px", lineHeight: 1.6, margin: "0 0 16px 0" }}>
              Subscribe to our newsletter to receive the latest updates.
            </p>
            <div style={{ display: "flex", backgroundColor: "#1e1e1e", borderRadius: "8px", overflow: "hidden", padding: "4px" }}>
              <input
                type="email"
                placeholder="Enter Your Email"
                style={{
                  flex: 1,
                  backgroundColor: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#ffffff",
                  padding: "10px 14px",
                  fontSize: "14px",
                }}
              />
              <button
                style={{
                  backgroundColor: "#ffce32",
                  color: "#111111",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0 16px",
                  cursor: "pointer",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 14l11 -11" />
                  <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="b-footer-bottom">
          <p style={{ color: "#8e9097", fontSize: "14px", margin: 0 }}>
            Copyright @ 2024 BabuZ | Designed By <span style={{ color: "#ffce32" }}>Pixelaxis</span>
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link to="/privacypolicy" style={{ color: "#8e9097", fontSize: "14px" }}>Privacy Policy</Link>
            <Link to="/howitworks" style={{ color: "#8e9097", fontSize: "14px" }}>Terms of Service</Link>
          </div>
        </div>
      </div>

      {/* Floating 3D graphics */}
      <img
        src="/assets/images/babuz/footer-coin.c039b2a2.png"
        alt="coin"
        className="b-anim-spin"
        style={{
          position: "absolute",
          top: "-150px",
          left: "-100px",
          width: "450px",
          height: "450px",
          opacity: 0.15,
          pointerEvents: "none",
        }}
      />
      <img
        src="/assets/images/babuz/footer-crown.2623c060.png"
        alt="crown"
        style={{
          position: "absolute",
          bottom: "10px",
          left: "20px",
          width: "120px",
          height: "auto",
          opacity: 0.9,
          pointerEvents: "none",
        }}
      />
    </footer>
  );
};

export default Footer;
"""

SCROLL_TO_TOP_JSX = """import React, { useState, useEffect } from "react";

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <div className="b-scroll-top" onClick={scrollToTop} title="Scroll to top">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.5">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </div>
  );
};

export default ScrollToTop;
"""

BABUZ_LANDING_JSX = """import React, { useEffect } from "react";
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
    window.scrollTo(0, 0);
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

files = {
    "Navbar.jsx": NAVBAR_JSX,
    "HeroSection.jsx": HERO_JSX,
    "AboutSection.jsx": ABOUT_JSX,
    "ServicesSection.jsx": SERVICES_JSX,
    "PricingSection.jsx": PRICING_JSX,
    "LoanMasterySection.jsx": LOAN_JSX,
    "FaqSection.jsx": FAQ_JSX,
    "TeamSection.jsx": TEAM_JSX,
    "TestimonialsSection.jsx": TESTIMONIALS_JSX,
    "CounterSection.jsx": COUNTER_JSX,
    "BlogSection.jsx": BLOG_JSX,
    "Footer.jsx": FOOTER_JSX,
    "ScrollToTop.jsx": SCROLL_TO_TOP_JSX,
    "BabuzLanding.jsx": BABUZ_LANDING_JSX,
}

base_dir = "src/components/pages/BabuzLanding"
for filename, content in files.items():
    filepath = os.path.join(base_dir, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\\n")
    print(f"Written: {filename}")

print("All components written successfully!")
