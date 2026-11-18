import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaBalanceScale,
  FaUserTie,
  FaEnvelope,
  FaPhoneAlt,
  FaUniversity,
  FaShieldAlt,
  FaCheckCircle,
  FaClock,
  FaPrint,
} from "react-icons/fa";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";
import oxyTitleDivider from "../../../assets/img/landing/oxy_title_divider.png";
import "./GrievanceRedressal.css";

const GrievanceRedressal = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="oxy-grievance-page">
      {/* 1. Modular Header */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Top Hero Section */}
      <section className="oxy-grievance-hero">
        <div className="oxy-grievance-hero-inner">
          <div className="oxy-grievance-badge-top">
            <FaBalanceScale className="badge-icon" />
            <span>CUSTOMER PROTECTION &amp; DISPUTE RESOLUTION</span>
          </div>
          <h1 className="oxy-grievance-hero-title">
            Grievances Redressal Mechanism
          </h1>
          <p className="oxy-grievance-hero-subhead">
            SRS FINTECHLABS PVT. LTD. (OxyLoans) is committed to transparent, fair, and
            time-bound resolution of all participant grievances in strict adherence to
            Reserve Bank of India (RBI) NBFC-P2P Directions and Fair Practices Code.
          </p>

          <div className="oxy-grievance-highlights-row">
            <div className="hl-item-card">
              <FaClock className="hl-icon hl-blue" />
              <div>
                <span className="hl-title">Resolution SLA</span>
                <span className="hl-desc">Within 30 Days (Max 4 Weeks)</span>
              </div>
            </div>
            <div className="hl-item-card">
              <FaUserTie className="hl-icon hl-green" />
              <div>
                <span className="hl-title">Nodal Officer</span>
                <span className="hl-desc">Mr. Subash Sure (GRO)</span>
              </div>
            </div>
            <div className="hl-item-card">
              <FaUniversity className="hl-icon hl-gold" />
              <div>
                <span className="hl-title">Appellate Authority</span>
                <span className="hl-desc">RBI Ombudsman / CEPD</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. User's Exact Specification Section: borrower-video-wrap */}
      <section className="borrower-video-wrap grievance-body-wrap">
        <div className="container">
          <div className="borrower-head">
            <h2>Grievances Redressal Mechanism</h2>
            <div className="oxy-title-divider-wrap">
              <img
                src={oxyTitleDivider}
                alt="Divider"
                className="oxy-title-divider-img"
              />
            </div>
          </div>

          <div className="row clearfix">
            {/* User's Exact Content Block */}
            <div className="def-temp blog-posts-block blog-post-inner">
              <div className="blog-posts">
                <div className="clearfix">
                  <div className="sendtoInner grievance-content-box">
                    <div className="policy-intro-banner">
                      <FaShieldAlt className="intro-shield" />
                      <p className="policy-lead">
                        The Company shall put in place participant grievances/complaints
                        mechanism wherein complaints shall be handled/ disposed of by
                        company within such time and in such manner as provided for in its
                        Board approved policy, but in any case not beyond a period of one
                        month from the date of receipt.
                      </p>
                    </div>

                    <div className="officer-contact-section">
                      <p className="contact-lead-text">
                        In case of any complaint/grievance, the applicant/borrowers may
                        contact Grievance Redressal Officer through any of the following
                        channels:
                      </p>

                      {/* Official Nodal Officer Card */}
                      <div className="gro-officer-card">
                        <div className="gro-avatar">
                          <FaUserTie />
                        </div>
                        <div className="gro-info">
                          <span className="gro-badge">DESIGNATED GRIEVANCE REDRESSAL OFFICER</span>
                          <h4 className="gro-name">Mr. Subash Sure</h4>
                          <div className="gro-channels">
                            <a
                              href="mailto:subbu@oxyloans.com"
                              className="gro-channel-link"
                            >
                              <FaEnvelope className="channel-icon" />
                              <span>E-mail: <strong>subbu@oxyloans.com</strong></span>
                            </a>
                            <a
                              href="tel:08977849440"
                              className="gro-channel-link"
                            >
                              <FaPhoneAlt className="channel-icon" />
                              <span>Contact No. <strong>08977849440</strong></span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Board Governance & Level-Up Resolution */}
                    <div className="board-oversight-card">
                      <h4 className="card-section-title">
                        <FaBalanceScale className="section-title-icon" />
                        Board Oversight &amp; Independent Hearing
                      </h4>
                      <p>
                        The Board will periodically review the compliance of this Fair
                        Practices Code and the functioning of the grievances redressal
                        mechanism at various levels of management. All grievances shall
                        be heard and disposed off by a person at least one level higher
                        to the person / designation against / relating to whom the
                        grievance is made. After examining the matter, it will be our
                        endeavor to provide the borrower/applicant with our final or
                        other response, within a period of Four (4) weeks from receipt of
                        such complaint / grievance.
                      </p>
                    </div>

                    {/* Escalation to RBI CEPD */}
                    <div className="rbi-escalation-card">
                      <div className="rbi-escalation-header">
                        <FaUniversity className="rbi-icon" />
                        <h4>Escalation to Reserve Bank of India (Level 2 Appeal)</h4>
                      </div>
                      <p>
                        In case the complaint/dispute is not redressed within a period of
                        one month, the customer may appeal to the Officer-in-Charge of
                        the Regional Office of Customer Education and Protection
                        Department (CEPD) of the Reserve Bank of India, under whose
                        jurisdiction the registered office of the NBFC falls.
                      </p>

                      <div className="rbi-ombudsman-details">
                        <div className="ombudsman-sub-box">
                          <strong>RBI Regional Office (Telangana Jurisdiction):</strong>
                          <p>
                            Customer Education and Protection Department (CEPD),
                            Reserve Bank of India, 6-1-56, Secretariat Road, Saifabad,
                            Hyderabad - 500004, Telangana, India.
                          </p>
                        </div>
                        <div className="ombudsman-sub-box">
                          <strong>RBI Complaint Management System (CMS):</strong>
                          <p>
                            Online portal:{" "}
                            <a
                              href="https://cms.rbi.org.in"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rbi-cms-link"
                            >
                              https://cms.rbi.org.in
                            </a>{" "}
                            or Toll-Free CRPC: <strong>14448</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Page Content */}
                </div>
              </div>
            </div>
            {/* .entry-content-page */}
          </div>

          {/* 4. 3-Tier Grievance Resolution Workflow */}
          <div className="grievance-tiers-workflow">
            <h3 className="tiers-title">Grievance Escalation Matrix</h3>
            <div className="tiers-grid">
              <div className="tier-step-card">
                <div className="tier-step-number">LEVEL 1</div>
                <h4>Customer Support Desk</h4>
                <p>
                  Register your issue via Help Desk, email (support@oxyloans.com), or
                  phone. You will receive an acknowledgment ticket number.
                </p>
                <span className="sla-badge">Response: 48 - 72 Hours</span>
              </div>

              <div className="tier-step-card active-tier">
                <div className="tier-step-number">LEVEL 2</div>
                <h4>Grievance Redressal Officer</h4>
                <p>
                  Escalate to Mr. Subash Sure (subbu@oxyloans.com / 08977849440).
                  Investigated and disposed of by a senior executive.
                </p>
                <span className="sla-badge highlight">Max Resolution: 30 Days</span>
              </div>

              <div className="tier-step-card">
                <div className="tier-step-number">LEVEL 3</div>
                <h4>RBI CEPD Ombudsman</h4>
                <p>
                  If unresolved within 30 days or if dissatisfied with the response,
                  escalate to the RBI Regional Office / CMS portal.
                </p>
                <span className="sla-badge">Appellate Authority</span>
              </div>
            </div>

            <div className="grievance-footer-actions">
              <button
                type="button"
                className="grievance-print-btn"
                onClick={handlePrint}
              >
                <FaPrint /> Print Mechanism
              </button>
              <Link to="/contact-us" className="grievance-contact-btn">
                Contact Customer Care
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Modular Footer */}
      <LandingFooter />
    </div>
  );
};

export default GrievanceRedressal;
