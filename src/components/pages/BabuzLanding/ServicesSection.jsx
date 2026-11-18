import React, { useState } from "react";
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
