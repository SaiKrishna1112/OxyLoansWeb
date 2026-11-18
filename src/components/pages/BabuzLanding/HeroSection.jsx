import React from "react";
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
