import React from "react";
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
