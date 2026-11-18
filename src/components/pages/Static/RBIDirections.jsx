import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaUniversity,
  FaShieldAlt,
  FaFileContract,
  FaCheckCircle,
  FaTimesCircle,
  FaBalanceScale,
  FaArrowRight,
  FaPrint,
  FaAward,
  FaFileAlt,
  FaBuilding,
} from "react-icons/fa";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";
import "./RBIDirections.css";

const RBIDirections = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="oxy-rbi-directions-page">
      {/* 1. Unified Modular Header */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Top Hero Banner */}
      <section className="oxy-rbi-hero">
        <div className="oxy-rbi-hero-inner">
          <div className="oxy-rbi-badge-top">
            <FaUniversity className="badge-icon" />
            <span>REGULATORY COMPLIANCE &amp; GOVERNANCE</span>
          </div>
          <h1 className="oxy-rbi-hero-title">Reserve Bank of India (RBI) Directions</h1>
          <p className="oxy-rbi-hero-subhead">
            Statutory framework, operational guidelines, prudential exposure norms,
            and permissible activities for NBFC - Peer to Peer Lending Platforms (NBFC-P2P).
          </p>

          {/* Compliance Fast Highlights */}
          <div className="oxy-rbi-highlights-row">
            <div className="rbi-highlight-card">
              <FaAward className="hl-icon hl-gold" />
              <div className="hl-text">
                <span className="hl-title">RBI CoR Date</span>
                <span className="hl-desc">Feb 06, 2019 (Sec 45 IA)</span>
              </div>
            </div>

            <div className="rbi-highlight-card">
              <FaShieldAlt className="hl-icon hl-blue" />
              <div className="hl-text">
                <span className="hl-title">Escrow Mechanism</span>
                <span className="hl-desc">Trustee Managed by ICICI Bank</span>
              </div>
            </div>

            <div className="rbi-highlight-card">
              <FaFileContract className="hl-icon hl-green" />
              <div className="hl-text">
                <span className="hl-title">Credit Bureau Sync</span>
                <span className="hl-desc">Member of CIBIL, Experian, Equifax, CRIF</span>
              </div>
            </div>

            <div className="rbi-highlight-card">
              <FaBalanceScale className="hl-icon hl-purple" />
              <div className="hl-text">
                <span className="hl-title">Fair Practices</span>
                <span className="hl-desc">100% Transparent Disclosures</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. User's Exact Specification Section */}
      <section className="borrower-video-wrap">
        <div className="container">
          <div className="borrower-head">
            <h2>RBI Directions</h2>
            <div className="oxy-rbi-divider">
              <span className="dot" />
            </div>
          </div>

          <div className="row clearfix">
            {/* Main Blog Post Content Wrapper */}
            <div className="def-temp blog-posts-block blog-post-inner">
              <div className="blog-posts">
                <div className="clearfix">
                  <div className="rbiguideLines">
                    {/* Status Header */}
                    <div className="rbi-status-banner">
                      <FaAward className="status-banner-icon" />
                      <h3>
                        M/S SRS FINTECHLABS PVT. LTD. (OxyLoans) is now registered as an{" "}
                        <b>NBFC-P2P</b> with <b>RBI</b>.
                      </h3>
                    </div>

                    <p className="rbi-lead-text">
                      The much-awaited Peer to Peer Lending directions have been issued by the
                      Reserve Bank of India (RBI) on October 4, 2017, post the notification in the
                      official gazette last month. The Directions provide a detailed framework for
                      registration of P2P lending platforms as &ldquo;Non-banking financial company
                      &ndash; Peer to Peer Lending Platform&rdquo; (NBFC-P2P), eligibility criteria,
                      the scope of activities, prudential norms, operational guidelines, information
                      technology/security, governance, disclosure and reporting requirements.
                    </p>

                    <div className="rbi-section-subtitle-wrap">
                      <p style={{ textAlign: "left", margin: 0 }}>
                        <span style={{ textDecoration: "underline" }}>
                          <strong>The key requirements contained in the Directions are:</strong>
                        </span>
                      </p>
                    </div>

                    {/* Section 1: NBFC - P2P registration */}
                    <div className="rbi-content-group">
                      <h4 className="rbi-group-heading">
                        <FaBuilding className="group-heading-icon" />
                        <span>NBFC &ndash; P2P registration</span>
                      </h4>
                      <ul className="rbi-guideline-list">
                        <li>
                          &ldquo;Peer to Peer Lending Platform&rdquo; has been defined to mean
                          intermediary providing the services of loan facilitation via online medium
                          or otherwise, to the participants
                        </li>
                        <li>
                          Existing P2P entities should apply within 3 months for Certificate of
                          Registration and are allowed to continue carrying on the P2P business until
                          disposal of the application by RBI
                        </li>
                        <li>
                          For other entities, applications will be processed through a two-stage
                          approval &ndash; In-principle and final (Certificate of Registration). The
                          final approval will be issued upon the applicant meeting all the prescribed
                          conditions such as execution of legal contracts, putting in place the tech
                          platform within the twelve months period (i.e. validity of the in-principle
                          approval)
                        </li>
                        <li>
                          Along with the duly filled application form (yet to be prescribed), the
                          applicant will have to submit its business plan, capital structure and the
                          plan for robust and secure IT system to RBI
                        </li>
                      </ul>
                    </div>

                    {/* Section 2: Key Eligibility criteria */}
                    <div className="rbi-content-group">
                      <h4 className="rbi-group-heading">
                        <FaFileAlt className="group-heading-icon" />
                        <span>Key Eligibility criteria</span>
                      </h4>
                      <ul className="rbi-guideline-list">
                        <li>Applicant to be an Indian company</li>
                        <li>
                          Minimum net owned fund &ndash; INR 20 mn (i.e. <strong>INR 2 crores</strong>)
                        </li>
                        <li>Fit and proper criteria for promoters and directors</li>
                      </ul>
                    </div>

                    {/* Section 3: Permitted vs Prohibited Scope of Activities Table */}
                    <div className="rbi-scope-table-wrap">
                      <div className="rbi-table-title">
                        <h4>Scope of Activities: Permitted vs. Prohibited</h4>
                        <span className="table-caption">
                          Strict regulatory boundaries enforced by RBI Master Directions
                        </span>
                      </div>

                      <div className="rbi-table-responsive">
                        <table style={{ width: "100%" }} className="rbi-activities-table">
                          <thead>
                            <tr>
                              <th className="th-permitted">
                                <div className="th-content">
                                  <FaCheckCircle className="th-icon icon-check" />
                                  <strong>Permitted scope of activities</strong>
                                </div>
                              </th>
                              <th className="th-prohibited">
                                <div className="th-content">
                                  <FaTimesCircle className="th-icon icon-cross" />
                                  <strong>Prohibited scope of activities</strong>
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="td-permitted">
                                <ul className="scope-list list-permitted">
                                  <li>
                                    <FaCheckCircle className="item-icon" />
                                    <span>Act as an intermediary</span>
                                  </li>
                                  <li>
                                    <FaCheckCircle className="item-icon" />
                                    <span>Undertake due diligence on participants</span>
                                  </li>
                                  <li>
                                    <FaCheckCircle className="item-icon" />
                                    <span>
                                      Undertake credit assessment and risk profiling of borrowers and
                                      disclose to lenders
                                    </span>
                                  </li>
                                  <li>
                                    <FaCheckCircle className="item-icon" />
                                    <span>Assistance in documentation of loan agreements</span>
                                  </li>
                                  <li>
                                    <FaCheckCircle className="item-icon" />
                                    <span>Assistance in disbursement and repayments</span>
                                  </li>
                                  <li>
                                    <FaCheckCircle className="item-icon" />
                                    <span>
                                      Provide recovery services on platform originated loans
                                    </span>
                                  </li>
                                </ul>
                              </td>
                              <td className="td-prohibited">
                                <ul className="scope-list list-prohibited">
                                  <li>
                                    <FaTimesCircle className="item-icon" />
                                    <span>Raising of deposits</span>
                                  </li>
                                  <li>
                                    <FaTimesCircle className="item-icon" />
                                    <span>Lending from its own books</span>
                                  </li>
                                  <li>
                                    <FaTimesCircle className="item-icon" />
                                    <span>Any credit enhancement / guarantee</span>
                                  </li>
                                  <li>
                                    <FaTimesCircle className="item-icon" />
                                    <span>
                                      Any facilitation of secured lending linked to its platform
                                    </span>
                                  </li>
                                  <li>
                                    <FaTimesCircle className="item-icon" />
                                    <span>Holding of funds on its own balance sheet</span>
                                  </li>
                                  <li>
                                    <FaTimesCircle className="item-icon" />
                                    <span>Cross selling except loan specific insurance</span>
                                  </li>
                                  <li>
                                    <FaTimesCircle className="item-icon" />
                                    <span>International flow of funds</span>
                                  </li>
                                  <li>
                                    <FaTimesCircle className="item-icon" />
                                    <span>
                                      Storage of all data on hardware located outside India
                                    </span>
                                  </li>
                                </ul>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Section 4: Key Prudential Norms */}
                    <div className="rbi-content-group">
                      <h4 className="rbi-group-heading">
                        <FaBalanceScale className="group-heading-icon" />
                        <span>Key Prudential Norms</span>
                      </h4>
                      <ul className="rbi-guideline-list">
                        <li>
                          Leverage ratio <strong>not exceeding 2</strong> (Outside Liabilities /Owned
                          Funds)
                        </li>
                        <li>
                          Aggregate exposure limit of <strong>INR 10 lacs per lender and per borrower</strong> at
                          any point in time, across all P2P platforms (extendable up to INR 50 lacs with CA certification)
                        </li>
                        <li>
                          Single lender-borrower exposure limit of <strong>INR 50,000,</strong> across all
                          P2P platforms
                        </li>
                        <li>
                          Loan tenure of <strong>maximum 36 months</strong>
                        </li>
                      </ul>
                    </div>

                    {/* Section 5: Operational and other guidelines */}
                    <div className="rbi-content-group">
                      <h4 className="rbi-group-heading">
                        <FaShieldAlt className="group-heading-icon" />
                        <span>Operational and other guidelines</span>
                      </h4>
                      <ul className="rbi-guideline-list">
                        <li>
                          Fund transfer through escrow mechanism and operated by a trustee (promoted by
                          the bank). At least 2 escrow accounts to be maintained &ndash; one for the
                          lenders and other for the borrowers. Cash transaction is strictly
                          prohibited
                        </li>
                        <li>
                          NBFC-P2P must become a member of all Credit Information Companies and submit
                          data to them
                        </li>
                        <li>
                          Detailed requirements prescribed on transparency, disclosure, Fair Practices
                          Code, grievance redressal mechanism
                        </li>
                        <li>
                          Establish rules and processes such as each lender approve each borrower
                          loan, signing of loan contracts by participants, mandatory disclosure of
                          certain information on website, etc
                        </li>
                        <li>
                          Board approved IT /Security plan to be in place in accordance with prescribed
                          guidelines on IT framework for NBFCs; Business Continuity Plan and reasonable
                          arrangements to be in place, in case of closure/winding down of P2P platforms
                        </li>
                        <li>
                          Prior RBI approval with Public Notice required in case of change in control
                          /ownership of P2P entity
                        </li>
                        <li>
                          Quarterly reporting and Information Security Audit by CISA Certified Auditors
                          once in 2 years prescribed
                        </li>
                      </ul>
                    </div>

                    {/* Print / Actions Bar */}
                    <div className="rbi-actions-footer">
                      <button
                        type="button"
                        className="btn-rbi-action btn-rbi-print"
                        onClick={handlePrint}
                      >
                        <FaPrint />
                        <span>Print Official Directions</span>
                      </button>
                      <Link to="/faqs" className="btn-rbi-action btn-rbi-faqs">
                        <span>View Regulatory FAQs &rarr;</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bottom CTA Section */}
      <section className="oxy-rbi-cta-banner">
        <div className="container">
          <div className="rbi-cta-card">
            <h2>Experience Fully RBI Regulated P2P Lending</h2>
            <p>
              Join OxyLoans today for institutional-grade safety, ICICI Bank Escrow Trustee protection,
              and fully transparent peer-to-peer returns.
            </p>
            <div className="rbi-cta-buttons">
              <Link to="/register" className="btn-cta-lender">
                Start Lending (Earn Up to 1.75% / Month)
                <FaArrowRight />
              </Link>
              <Link to="/borrower_register" className="btn-cta-borrower">
                Start Borrowing (Fast Loan Approval)
                <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Unified Modular Footer */}
      <LandingFooter />
    </div>
  );
};

export default RBIDirections;
