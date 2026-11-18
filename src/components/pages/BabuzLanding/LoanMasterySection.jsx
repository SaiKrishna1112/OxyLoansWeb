import React from "react";
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
