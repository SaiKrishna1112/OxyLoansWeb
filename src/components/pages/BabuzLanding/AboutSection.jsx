import React from "react";
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
