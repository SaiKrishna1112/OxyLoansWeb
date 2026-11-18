import React, { useState } from "react";
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
