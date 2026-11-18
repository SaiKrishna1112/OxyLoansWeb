import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logoWhite from "../../assets/img/landing/oxylogodashboard_white.png";
import "./LandingFooter.css";

/**
 * LandingFooter Component
 * 
 * Modular public footer matching the present OxyLoans landing design:
 * - Brand logo, Certificate of Incorporation (U72900TG2016PTC103822), and RBI status
 * - 16 categorized navigation links with smooth scroll & disclosure handling
 * - Verbatim RBI NBFC-P2P regulatory statutory disclaimer & Anti-Fraud advisory
 * - Self-contained regulatory disclosure modal
 * - Copyright bar
 */
const LandingFooter = ({ onOpenDisclosure, onScrollToSection }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [localDisclosureModal, setLocalDisclosureModal] = useState(null);

  const handleOpenDisclosure = (title) => {
    if (onOpenDisclosure) {
      onOpenDisclosure(title);
    } else {
      setLocalDisclosureModal(title);
    }
  };

  const handleScrollToSection = (sectionId) => {
    if (onScrollToSection) {
      onScrollToSection(sectionId);
      return;
    }

    if (
      location.pathname === "/landing" ||
      location.pathname === "/home" ||
      location.pathname === "/"
    ) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(`/landing#${sectionId}`);
    }
  };

  return (
    <footer className="oxy-landing-footer">
      <div className="oxy-landing-footer-container">
        {/* Top Row: Brand Info + Links Grid */}
        <div className="oxy-landing-footer-top">
          <div className="oxy-landing-footer-brand">
            <div className="oxy-landing-footer-logo">
              <img
                src={logoWhite}
                alt="OxyLoans"
                className="oxy-landing-footer-logo-img"
              />
            </div>
            <div className="oxy-landing-footer-cin">
              Certificate of Incorporation: <strong>U72900TG2016PTC103822</strong>
            </div>
            <div className="oxy-landing-footer-rbi-note">
              RBI Registered Non-Banking Financial Company - Peer to Peer (NBFC-P2P).
            </div>
          </div>

          <div className="oxy-landing-footer-links-col">
            <div className="oxy-landing-footer-links-title">LINKS</div>
            <div className="oxy-landing-footer-links-grid">
              <Link to="/lender">Lender</Link>
              <Link to="/borrower">Borrower</Link>
              <a onClick={() => handleScrollToSection("about-section")}>
                Vision and Mission
              </a>
              <a onClick={() => handleScrollToSection("about-section")}>
                Management
              </a>
              <Link to="/how-it-works">How It Works</Link>
              <Link to="/faqs">Faq</Link>
              <Link to="/userType">Terms and Conditions</Link>
              <Link to="/privacy-policy">Privacy Policy</Link>
              <Link to="/know-your-fees">
                Know Your Fees
              </Link>
              <Link to="/know-your-tax">
                Know Your Tax
              </Link>
              <Link to="/know-your-earnings">
                Know Your Earnings
              </Link>
              <Link to="/transparency">
                Transparency and Disclosure Requirements
              </Link>
              <Link to="/grievance-redressal-mechanism">
                Grievances Redressal Mechanism
              </Link>
              <Link to="/latest-egm-notice">Latest EGM Notice</Link>
              <a onClick={() => handleOpenDisclosure("Fair Practices Code")}>
                FAIR PRACTICES CODE
              </a>
              <Link to="/loan-performance">Loan Performance</Link>
              <Link to="/rbi-directions">RBI Directions</Link>
              <Link to="/team-management">Management Team</Link>
              <Link to="/advisory-team">Our Advisory Team</Link>
              <Link to="/blogs">OxyLoans Blog</Link>
              <Link to="/contact-us">Contact Us</Link>
            </div>
          </div>
        </div>

        {/* Detailed Legal Disclaimers (Exact Verbatim Regulatory Compliance) */}
        <div className="oxy-landing-disclaimer-box">
          <h5>Disclaimer</h5>
          <p>
            M/S SRS FINTECHLABS PVT. LTD. (OxyLoans) is now registered as an{" "}
            <strong>NBFC-P2P</strong> with <strong>RBI</strong>. Disclaimer: The company
            is having a valid Certificate of Registration dated Feb 06 2019 issued by
            the Reserve Bank of India under Section 45 IA of the Reserve Bank of India
            Act, 1934. However, the RBI does not accept any responsibility or guarantee
            about the present position as to the financial soundness of the company or
            for the correctness of any of the statements or representations made or
            opinions expressed by the company and for repayment of deposits/discharge of
            liabilities by the company.
          </p>
          <p>
            Reserve Bank of India does not accept any responsibility for the
            correctness of any of the statements or representations made or opinions
            expressed by SRS FINTECHLABS Pvt. Ltd (OXYLOANS), and does not provide any
            assurance for repayment of the loans lent on it. However, the RBI does not
            accept any responsibility or guarantee about the present position as to the
            financial soundness of the company or for the correctness of any of the
            statements or representations made or the opinions expressed by the company
            and for repayment of deposits / discharge of liabilities by the company.
          </p>
          <p>
            The information contained herein is only to enable the Lender to make a
            considered decision. Any decision taken by the Lender on the basis of this
            information is the sole responsibility of the Lender and OxyLoans is not
            liable. This information does not include any sensitive personal data or
            information of the Borrower. OxyLoans only facilitates a virtual meeting
            place between the Borrowers and the Lenders on its online platform. The
            decision to lend is entirely at the discretion of the Lender and OxyLoans
            does not guarantee that the Borrowers will receive any loans from the
            Lenders. OxyLoans merely aids and assist the Lenders and the Borrowers listed
            on its website to make and receive loans and charges a service fee from the
            Lenders and the Borrowers for such assistance. OxyLoans is only an
            'Intermediary' under the provisions of the Information Technology Act, 1999.
          </p>
          <p>
            Our attention has recently been drawn to the fraudulent activities of persons
            who misrepresent to third parties that they are employees or authorized
            representatives of OxyLoans.com in order to cheat them. Please be aware that
            the only legitimate domain for OxyLoans.com is{" "}
            <strong>www.oxyloans.com</strong>. We urge you to please verify that any
            borrowing/lending opportunities are legitimate by checking with us at the
            below mentioned contact details. If you are in doubt about any email, phone
            call, communication, etc, please do not respond by revealing personal
            information about yourself or your company and strictly refrain from
            forwarding any money to third parties prior to verification with
            OxyLoans.com. To verify borrowing/lending opportunities or to report any
            suspicious behavior, please contact us at{" "}
            <strong>support@oxyloans.com</strong> or Whatsapp us at{" "}
            <strong>+91 99 66 88 88 25</strong> between 9:30 am to 6:00 pm IST from
            Monday to Saturday.
          </p>
        </div>

        {/* Copyright Bar */}
        <div className="oxy-landing-copyright">
          &copy; Copyright 2016-OxyLoans. All Rights Reserved
        </div>
      </div>

      {/* Built-in Regulatory Disclosure Modal Fallback */}
      {localDisclosureModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setLocalDisclosureModal(null)}
        >
          <div
            style={{
              background: "#ffffff",
              maxWidth: "600px",
              width: "100%",
              borderRadius: "10px",
              padding: "25px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
              color: "#333333",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h4 style={{ margin: 0, fontSize: "18px", color: "#0077c8" }}>
                {localDisclosureModal}
              </h4>
              <button
                onClick={() => setLocalDisclosureModal(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                &times;
              </button>
            </div>
            <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#444" }}>
              <p>
                <strong>RBI Compliance &amp; Regulatory Overview:</strong>
                <br />
                M/S SRS FINTECHLABS PVT. LTD. operates the P2P lending platform OxyLoans
                under Certificate of Registration dated Feb 06, 2019, issued by the
                Reserve Bank of India under Section 45 IA of the Reserve Bank of India
                Act, 1934.
              </p>
              <p style={{ marginTop: "10px" }}>
                <strong>Key Principles:</strong>
                <br />
                • 100% transparency in interest rates and fee structures.
                <br />
                • Strict adherence to RBI Fair Practices Code for transparent disclosures.
                <br />
                • Independent Escrow Account Trustee oversight for seamless fund movement.
                <br />
                • Robust grievance redressal mechanism with dedicated nodal officers.
              </p>
            </div>
            <button
              onClick={() => setLocalDisclosureModal(null)}
              style={{
                marginTop: "15px",
                background: "#0077c8",
                color: "#ffffff",
                border: "none",
                padding: "8px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};

export default LandingFooter;
