import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaFileContract,
  FaChartPie,
  FaUniversity,
  FaBalanceScale,
  FaArrowRight,
  FaUserCheck,
  FaUsers,
  FaCheckCircle,
  FaPrint,
  FaLock,
  FaBuilding,
} from "react-icons/fa";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";
import lenderDashboardImg from "../../../assets/img/landing/transparency/lender_dashboard.gif";
import borrowerDashboardImg from "../../../assets/img/landing/transparency/borrower_dashboard.gif";
import disclosureImg from "../../../assets/img/landing/transparency/disclosure_screenshot.jpg";
import loanProcessImg from "../../../assets/img/landing/transparency/loan_process.jpg";
import "./TransparencyDisclosures.css";

const TransparencyDisclosures = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="oxy-transparency-page">
      {/* 1. Modular Header */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Top Hero Banner */}
      <section className="oxy-transparency-hero">
        <div className="oxy-transparency-hero-inner">
          <div className="oxy-transparency-badge-top">
            <FaShieldAlt className="badge-icon" />
            <span>STATUTORY REGULATORY DISCLOSURES</span>
          </div>
          <h1 className="oxy-transparency-hero-title">
            Transparency &amp; Disclosure Requirements
          </h1>
          <p className="oxy-transparency-hero-subhead">
            Mandatory disclosures in compliance with Reserve Bank of India (RBI) Directions for
            Non-Banking Financial Company &ndash; Peer to Peer Lending Platforms (NBFC-P2P).
          </p>

          <div className="oxy-transparency-highlights-row">
            <div className="transparency-hl-card">
              <FaUniversity className="hl-icon hl-blue" />
              <div className="hl-text">
                <span className="hl-title">Regulatory Authority</span>
                <span className="hl-desc">Reserve Bank of India (RBI)</span>
              </div>
            </div>
            <div className="transparency-hl-card">
              <FaBalanceScale className="hl-icon hl-gold" />
              <div className="hl-text">
                <span className="hl-title">Pricing Format</span>
                <span className="hl-desc">Annualized Percentage Rate (APR)</span>
              </div>
            </div>
            <div className="transparency-hl-card">
              <FaChartPie className="hl-icon hl-green" />
              <div className="hl-text">
                <span className="hl-title">Risk Profiling</span>
                <span className="hl-desc">DTI Ratio &amp; Credit Bureau Grading</span>
              </div>
            </div>
            <div className="transparency-hl-card">
              <FaLock className="hl-icon hl-purple" />
              <div className="hl-text">
                <span className="hl-title">Data Protection</span>
                <span className="hl-desc">Escrow &amp; Complete Anonymity</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. User's Exact Specification Section */}
      <section className="borrower-video-wrap">
        <div className="container">
          <div className="borrower-head">
            <h2>Transparency and Disclosure Requirements</h2>
            <div className="oxy-transparency-divider">
              <span className="dot" />
            </div>
          </div>

          <div className="row clearfix">
            <div className="def-temp blog-posts-block blog-post-inner">
              <div className="blog-posts">
                <div className="clearfix">
                  <div className="sendtoInner">
                    {/* Header Banner */}
                    <div className="transparency-notice-banner">
                      <FaFileContract className="notice-icon" />
                      <div>
                        <h3>Transparency and Disclosure Requirements &ndash; As Per RBI guidelines</h3>
                        <p className="subtext">
                          An NBFC-P2P shall be strictly required to disclose the following to lenders,
                          borrowers, and the general public:
                        </p>
                      </div>
                    </div>

                    {/* 1. To the Lender */}
                    <div className="disclosure-card-box">
                      <div className="box-header header-lender">
                        <FaUserCheck className="box-header-icon" />
                        <h4>1. To the Lender</h4>
                      </div>
                      <div className="box-body">
                        <ul className="disclosure-bullets">
                          <li>
                            Details about the borrower/s including personal identity, required amount,
                            interest rate sought and credit score as arrived by the NBFC-P2P.
                            <div className="platform-proof-wrap">
                              <span className="proof-label">
                                <u>SRS FinTech / OxyLoans</u>:
                              </span>
                              <div className="proof-img-card">
                                <img
                                  className="displayedPicAtrules"
                                  src={lenderDashboardImg}
                                  alt="Lender Dashboard Disclosure"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "https://s3.amazonaws.com/oxyloanswordpress/wp-content/uploads/2018/05/25113559/lender_dashboard_test_account1.gif";
                                  }}
                                />
                                <span className="img-caption">
                                  Lender Dashboard: Transparent view of borrower profile, credit score &amp; requested ROI
                                </span>
                              </div>
                            </div>
                          </li>
                          <li>
                            Details about all the terms and conditions of the loan, including likely
                            return, fees and taxes.
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* 2. To the Borrower */}
                    <div className="disclosure-card-box">
                      <div className="box-header header-borrower">
                        <FaUsers className="box-header-icon" />
                        <h4>2. To the Borrower</h4>
                      </div>
                      <div className="box-body">
                        <ul className="disclosure-bullets">
                          <li>
                            Details about the lender/s including proposed amount, interest rate offered
                            but excluding personal identity and contact details.
                            <div className="platform-proof-wrap">
                              <span className="proof-label">
                                <u>SRS FinTech / OxyLoans</u>:
                              </span>
                              <div className="proof-img-card">
                                <img
                                  className="displayedPicAtrules"
                                  src={borrowerDashboardImg}
                                  alt="Borrower Dashboard Disclosure"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "https://s3.amazonaws.com/oxyloanswordpress/wp-content/uploads/2018/05/22163920/borrower_dashboard_test_account1.gif";
                                  }}
                                />
                                <span className="img-caption">
                                  Borrower Dashboard: Transparent lender offers, rates, and commitment without personal identity
                                </span>
                              </div>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* 3. Public Website Disclosures */}
                    <div className="disclosure-card-box">
                      <div className="box-header header-public">
                        <FaBuilding className="box-header-icon" />
                        <h4>3. Public Website Disclosures</h4>
                      </div>
                      <div className="box-body">
                        {/* A. Credit Assessment Methodology */}
                        <div className="sub-disclosure-group">
                          <h5>Overview of Credit Assessment / Score Methodology and Factors Considered</h5>
                          <p className="platform-note">
                            <u>SRS FinTech / OxyLoans</u>: We are using CIBIL credit score As-Is, we want
                            to use proven method with track record.
                          </p>

                          <div className="dir-calculation-box">
                            <h6>
                              <strong>DIR Ratio (Debt-to-Income):</strong>
                            </h6>
                            <p>
                              Based on the borrower&rsquo;s profile details collected, the Debt to
                              Income Ratio of the borrower is calculated as below:
                            </p>
                            <div className="dir-formula-pill">
                              <code>DIR = (Total EMIs / Salary) * 100</code>
                            </div>
                            <p className="dir-threshold-lead">
                              If DTI &lt;= 65% then the Credit report is sought from the bureau for
                              verifying the credit score based on the history of the borrower.
                            </p>
                            <ul className="risk-level-list">
                              <li className="risk-low">
                                <FaCheckCircle className="risk-icon" />
                                <span>
                                  <strong>If DTI &lt;= 50%</strong>: Low Risk
                                </span>
                              </li>
                              <li className="risk-med">
                                <FaCheckCircle className="risk-icon" />
                                <span>
                                  <strong>If DTI &gt; 50% and &lt;= 65%</strong>: Medium Risk
                                </span>
                              </li>
                              <li className="risk-high">
                                <FaCheckCircle className="risk-icon" />
                                <span>
                                  <strong>If DTI &gt; 65%</strong>: High Risk
                                </span>
                              </li>
                            </ul>
                          </div>

                          <div className="credit-score-desc">
                            <h6>
                              <strong>Credit Score &amp; Experian / CIBIL Scoring:</strong>
                            </h6>
                            <p>
                              The borrower&rsquo;s credit score is retrieved from the credit bureau
                              &ndash; Experian / CIBIL. Based on the afore-mentioned borrower&rsquo;s
                              credit file information and his or her inputs, the credit-scoring algorithm
                              determines a borrower&rsquo;s creditworthiness. The borrower&rsquo;s
                              creditworthiness is represented by assigned credit grade with a related
                              interest rate. Immediately after being scored, loan-listing offer with
                              obtained interest rate is offered to the borrower. The borrower may accept
                              or reject the offer provided.
                            </p>
                            <p>
                              Based on the credit risk assessment, Oxyloans shall offer the best interest
                              rate available from the lenders as per the below matrix. Processing fee will
                              be levied as applicable.
                            </p>
                          </div>

                          {/* APR Matrix Table */}
                          <div className="apr-table-wrap">
                            <div className="table-header-title">
                              <span>Official OxyLoans Annualized Percentage Rate (APR) Matrix</span>
                            </div>
                            <table className="apr-matrix-table">
                              <thead>
                                <tr>
                                  <th>Credit Score Range</th>
                                  <th>Annualized Percentage Rate (APR)</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td><strong>776 and Above</strong></td>
                                  <td><span className="apr-pill apr-green">24%</span></td>
                                </tr>
                                <tr>
                                  <td><strong>750 &ndash; 775</strong></td>
                                  <td><span className="apr-pill apr-green">27%</span></td>
                                </tr>
                                <tr>
                                  <td><strong>700 &ndash; 749</strong></td>
                                  <td><span className="apr-pill apr-blue">30%</span></td>
                                </tr>
                                <tr>
                                  <td><strong>649 &ndash; 750</strong></td>
                                  <td><span className="apr-pill apr-amber">40%</span></td>
                                </tr>
                                <tr>
                                  <td><strong>549 &ndash; 650</strong></td>
                                  <td><span className="apr-pill apr-orange">48%</span></td>
                                </tr>
                                <tr>
                                  <td><strong>450 &ndash; 550</strong></td>
                                  <td><span className="apr-pill apr-red">60%</span></td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          <p className="post-table-note">
                            Post verification done, the loan is approved or rejected by the platform.
                            In some cases, a revised interest rate is offered by the platform if the
                            borrower rejects the originally offered rate.
                          </p>

                          <div className="social-validation-box">
                            <h6>
                              <strong>Social Validation:</strong>
                            </h6>
                            <p>
                              Social validation is also done through Facebook and related professional
                              applications to verify the borrower&rsquo;s social network. Stronger and
                              more verifiable relational network measures are associated with higher
                              likelihood of a loan being funded, a lower risk of default, and lower
                              interest rates.
                            </p>
                          </div>
                        </div>

                        {/* B. Data Usage & Protection Disclosure */}
                        <div className="sub-disclosure-group">
                          <h5>Disclosures on Usage / Protection of Data</h5>
                          <p className="platform-note">
                            <u>SRS FinTech / OxyLoans</u>:
                          </p>
                          <div className="proof-img-card data-disclosure-card">
                            <img
                              className="displayedPicAtrules"
                              src={disclosureImg}
                              alt="Data Protection & Privacy Policy Disclosure"
                              loading="lazy"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  "https://s3.amazonaws.com/oxyloanswordpress/wp-content/uploads/2018/05/22065042/disclosure_screenshot.jpg";
                              }}
                            />
                            <span className="img-caption">
                              Statutory data protection, IT security framework &amp; privacy disclosures
                            </span>
                          </div>
                        </div>

                        {/* C. Grievances & Portfolio Performance Links */}
                        <div className="sub-disclosure-group">
                          <h5>Grievance Redressal Mechanism &amp; Portfolio Performance</h5>
                          <div className="transparency-links-grid">
                            <div className="tl-card">
                              <h6>Grievance Redressal Mechanism</h6>
                              <p>Dedicated Nodal Grievance Redressal Officer escalation matrix.</p>
                              <Link to="/faqs" className="tl-link">
                                <span>View Grievances Redressal Mechanism &rarr;</span>
                              </Link>
                            </div>
                            <div className="tl-card">
                              <h6>Portfolio Performance</h6>
                              <p>Share of non-performing assets on a monthly basis and segregation by age.</p>
                              <Link to="/how-it-works" className="tl-link">
                                <span>View Platform Loan Performance &rarr;</span>
                              </Link>
                            </div>
                          </div>
                        </div>

                        {/* D. Broad Business Model */}
                        <div className="sub-disclosure-group business-model-group">
                          <h5>Broad Business Model &amp; Operational Flow</h5>
                          <p className="platform-note">
                            <u>SRS FinTech / OxyLoans</u>:
                          </p>

                          <div className="bm-section">
                            <h6>About OxyLoans</h6>
                            <p>
                              Oxyloans.com is a ground breaking online financial marketplace connecting
                              lenders and borrowers. Our platform invites Banks, Financial Institutions,
                              and Individuals as preferred Lenders. Our platform is &ldquo;At the very
                              center of the Borrower&rdquo; and enables Borrower to obtain the loan
                              quickly as compared to traditional methods.
                            </p>
                          </div>

                          <div className="bm-grid-2">
                            <div className="bm-card vision-card">
                              <h6>Vision</h6>
                              <p>
                                To be a trustworthy and preferred FinTech platform enabling citizens
                                across the world to connect and exchange funds directly from lender to
                                borrower.
                              </p>
                            </div>
                            <div className="bm-card mission-card">
                              <h6>Mission</h6>
                              <p>
                                To witness INR 6,500 crores funds disbursement by 2024, indirectly
                                creating 160,000 new jobs.
                              </p>
                            </div>
                          </div>

                          <div className="bm-section">
                            <h6>Business Model</h6>
                            <p>Under the P2P Lending umbrella, OxyLoans enables the following:</p>
                            <ul className="bm-bullets">
                              <li>
                                <strong>P2P Lending</strong> &ndash; OxyLoans enables Individuals to
                                act as peers and enable lending between many-many.
                              </li>
                              <li>
                                <strong>Crowd Lending to SMEs</strong> &ndash; OxyLoans enables SMEs to
                                act as borrowers &ndash; pool of individuals to act as syndicated
                                lenders.
                              </li>
                            </ul>
                          </div>

                          <div className="bm-section">
                            <h6>Implementation Model</h6>
                            <p>
                              OxyLoans acts as an intermediary providing an online marketplace for its
                              borrowers and lenders through a standardized implementation model.
                              Lenders and borrowers register online and submit lending commitments and
                              loan applications respectively.
                            </p>
                            <p>
                              This involves profile verification for each and every listing. Personal,
                              professional and financial data are collected and verified to the best
                              extent possible from all available data sources such as government data
                              bank, credit information bureau, and social media. Due care is taken to
                              safeguard the interests of both the borrowers and the lender through a
                              stringent verification process.
                            </p>
                          </div>

                          <div className="bm-docs-box">
                            <h6>Required Borrower Documents:</h6>
                            <div className="docs-dual-col">
                              <div>
                                <strong>Individual Borrowers:</strong>
                                <ul>
                                  <li>PAN Card</li>
                                  <li>Bank Account Statements of a Salary Account &ndash; 6 months</li>
                                  <li>Email verification</li>
                                  <li>Salary Slip &ndash; 3 months</li>
                                  <li>Employment / Company details &amp; Office ID Card</li>
                                  <li>Passport copy &amp; Passport size photo</li>
                                  <li>Telephone bill &ndash; 3 months</li>
                                  <li>Cheques &ndash; 1 Principal + N EMI Cheques</li>
                                </ul>
                              </div>
                              <div>
                                <strong>For Company Borrowers:</strong>
                                <ul>
                                  <li>Registration Certificate</li>
                                  <li>MoA &amp; AoA</li>
                                  <li>Corporate Identity Number (CIN)</li>
                                  <li>TAN &amp; PAN Card</li>
                                  <li>GST Registration Certificate</li>
                                </ul>
                              </div>
                            </div>
                            <p className="ekyc-note">
                              Oxyloans performs electronic KYC and Aadhaar validation, wherein Identity
                              and Address are verified electronically through UIDAI authentication.
                            </p>
                          </div>

                          {/* Complete Loan Life Cycle in Wheel */}
                          <div className="loan-cycle-wheel-wrap">
                            <h6>The Complete Loan Life Cycle in Wheel</h6>
                            <div className="wheel-img-card">
                              <img
                                className="loan_processImage"
                                src={loanProcessImg}
                                alt="The complete Loan Life Cycle in wheel"
                                loading="lazy"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://s3.amazonaws.com/oxyloanswordpress/wp-content/uploads/2018/05/22063931/loan_process.jpg";
                                }}
                              />
                            </div>
                          </div>

                          <div className="bm-segments-grid">
                            <div className="seg-card">
                              <h6>Geographies</h6>
                              <p>India (Pan-India operations across all states &amp; UTs)</p>
                            </div>
                            <div className="seg-card">
                              <h6>Target Segments</h6>
                              <p>
                                <strong>Lenders:</strong> Resident Individuals, HNIs, SMEs, Corporates,
                                Banks &amp; Financial Institutions.
                                <br />
                                <strong>Borrowers:</strong> Resident Individuals, Salaried Professionals,
                                Self-Employed, SMEs &amp; Corporates.
                              </p>
                            </div>
                            <div className="seg-card">
                              <h6>Products Offered</h6>
                              <p>
                                SME Loans, Personal Loans, Travel Loans, Motor Loans, International
                                Business Expansion Loans, Technology Loans, and Sports Loans.
                              </p>
                            </div>
                          </div>

                          <div className="platform-revenue-box">
                            <h6>Platform Fee Structure</h6>
                            <p>
                              • We charge minimum <strong>2.5%</strong> and maximum <strong>7%</strong> to
                              borrowers on loan disbursed amount.
                              <br />
                              • We charge lenders minimum <strong>0.5%</strong> and maximum <strong>1%</strong> on
                              loan committed amount.
                            </p>
                          </div>

                          <div className="statutory-clause-box">
                            <h6>Agreements &amp; Participant Protection:</h6>
                            <p>
                              (2) NBFC-P2P shall ensure that the providing of services to a participant,
                              who has applied for availing of such services, is backed by appropriate
                              agreements between the participants and the NBFC-P2P. The agreements shall
                              categorically specify all the terms and conditions among the borrower, the
                              lender and the NBFC-P2P.
                            </p>
                            <p className="platform-note">
                              <strong><u>SRS FinTech / OxyLoans</u>:</strong> All terms and legal
                              commitments are systematically incorporated into digitally executed Aadhaar
                              e-Sign contracts.
                            </p>
                          </div>

                          <div className="statutory-clause-box">
                            <h6>Annualized Percentage Rate (APR) Display:</h6>
                            <p>
                              (3) The interest rates displayed on the platform shall be in Annualized
                              Percentage Rate (APR) format.
                            </p>
                            <p className="platform-note">
                              <strong><u>SRS FinTech / OxyLoans</u>:</strong> We have ensured that all
                              interest rates and loan listings across our portals are strictly presented in
                              standardized Annualized Percentage Rate (APR) format.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Print & Return Navigation */}
                    <div className="transparency-actions-footer">
                      <button
                        type="button"
                        className="btn-transparency-action btn-print"
                        onClick={handlePrint}
                      >
                        <FaPrint />
                        <span>Print Disclosures</span>
                      </button>
                      <Link to="/rbi-directions" className="btn-transparency-action btn-rbi">
                        <span>View RBI Master Directions &rarr;</span>
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
      <section className="oxy-transparency-cta">
        <div className="container">
          <div className="cta-card">
            <h2>Experience Complete Transparency in Peer-to-Peer Finance</h2>
            <p>
              Join OxyLoans today for institutional-grade safety, ICICI Bank Escrow Trustee oversight,
              and 100% transparent APR interest rates.
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn-cta-lender">
                Start Lending (Earn Up to 1.75% / Month)
                <FaArrowRight />
              </Link>
              <Link to="/borrower_register" className="btn-cta-borrower">
                Start Borrowing (Fast Digital Loan)
                <FaArrowRight />
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

export default TransparencyDisclosures;
