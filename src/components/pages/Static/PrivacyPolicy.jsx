import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaShieldAlt,
  FaFileContract,
  FaUserSecret,
  FaMobileAlt,
  FaPrint,
  FaBalanceScale,
  FaCheckCircle,
} from "react-icons/fa";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="oxy-privacy-page">
      {/* 1. Modular Header */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Top Hero Banner */}
      <section className="oxy-privacy-hero">
        <div className="oxy-privacy-hero-inner">
          <div className="oxy-privacy-badge-top">
            <FaShieldAlt className="badge-icon" />
            <span>STATUTORY DATA PROTECTION &amp; PRIVACY POLICY</span>
          </div>
          <h1 className="oxy-privacy-hero-title">Privacy Policy</h1>
          <p className="oxy-privacy-hero-subhead">
            SRS FINTECHLABS PVT. LTD. (&ldquo;OxyLoans&rdquo;) is committed to safeguarding the privacy,
            confidentiality, and security of all personal and financial data entrusted to us.
          </p>
        </div>
      </section>

      {/* 3. User's Exact Specification Section */}
      <section className="borrower-video-wrap">
        <div className="container">
          <div className="borrower-head">
            <h2>Privacy Policy</h2>
            <div className="oxy-privacy-divider">
              <span className="dot" />
            </div>
          </div>

          <div className="row clearfix">
            <div className="def-temp blog-posts-block blog-post-inner">
              <div className="blog-posts">
                <div className="clearfix">
                  <div className="privacy-content-inner">
                    {/* Header Details */}
                    <div className="privacy-header-box text-center">
                      <h3>Privacy Policy of SRS Fintech Labs Private Limited (&ldquo;OXYLOANS&rdquo;)</h3>
                      <p className="policy-dates">
                        Effective from Oct-16-2016 <br />
                        This Policy has been updated on 25-April-2018.
                      </p>
                      <h4 className="intro-title"><b>Introduction</b></h4>
                    </div>

                    <p>
                      Oxyloans.com is a revolutionary peer 2 peer lending platform, it is our pleasure to host you on our website.
                      By browsing our website, you are agreeing to comply with and be bound by the following terms and conditions of use,
                      which together with our privacy policy govern OxyLoans relationship with you in relation to this website.
                    </p>

                    <p>
                      Our registered office is at SRS FINTECHLABS PVT LTD Plot No 287, 1st Floor, MIG-2, Phase &ndash; IX,
                      KPHB Colony, Hyderabad -500072, Telangana, India. The term &lsquo;you&rsquo; refers to the user or viewer
                      of our website. The term SRS FinTech Labs Private Limited or our product OxyLoans.com, herein after referred
                      as &ldquo;OxyLoans&rdquo; or &lsquo;us&rsquo; or &lsquo;we&rsquo; refers to the Company and owner of the website.
                    </p>

                    <div className="rbi-statutory-notice">
                      <FaBalanceScale className="notice-icon" />
                      <p>
                        <strong>Reserve Bank of India Notice:</strong> Reserve Bank of India does not accept any responsibility
                        for the correctness of any of the statements or representations made or opinions expressed by SRS FinTech Labs
                        India Pvt. Ltd OR OxyLoans, and does not provide any assurance for repayment of the loans lent on it.
                      </p>
                    </div>

                    {/* Table 1: FACTS */}
                    <div className="table-data table-responsive">
                      <table className="table table-striped table-bordered">
                        <thead>
                          <tr>
                            <th style={{ width: "25%" }}>FACTS</th>
                            <th>WHAT DOES OXYLOANS DO WITH YOUR PERSONAL INFORMATION?</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td><strong>Why?</strong></td>
                            <td>
                              Financial companies choose how they share your personal information. RBI gives consumers the right to
                              limit some but not all sharing. Indian Data protection law also requires us to tell you how we collect,
                              share, and protect your personal information. Please read this notice carefully to understand what we do.
                            </td>
                          </tr>
                          <tr>
                            <td><strong>What?</strong></td>
                            <td>
                              The types of personal information we collect and share depend on the product or service you have with us.
                              This information can include:
                              <ul className="table-list">
                                <li>Passport number and income</li>
                                <li>Account balances and transaction history</li>
                                <li>Credit scores and employment information</li>
                              </ul>
                            </td>
                          </tr>
                          <tr>
                            <td><strong>How?</strong></td>
                            <td>
                              All financial companies need to share customers&rsquo; personal information to run their everyday business.
                              In the section below, we list the reasons financial companies can share their customers&rsquo; personal information;
                              the reasons OXYLOANS chooses to share; and whether you can limit this sharing.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Table 2: Reasons We Share */}
                    <div className="table-data table-responsive">
                      <table className="table table-striped table-bordered">
                        <thead>
                          <tr>
                            <th>Reasons we can share your personal information</th>
                            <th style={{ width: "25%", textAlign: "center" }}>Does OXYLOANS share?</th>
                            <th style={{ width: "25%", textAlign: "center" }}>Can you limit this sharing?</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Respond to court orders and legal investigations, or report to credit bureaus</td>
                            <td className="text-center font-bold">Yes</td>
                            <td className="text-center">No</td>
                          </tr>
                          <tr>
                            <td>For our marketing purposes &mdash; to offer our products and services to you</td>
                            <td className="text-center font-bold">Yes</td>
                            <td className="text-center">No</td>
                          </tr>
                          <tr>
                            <td>For joint marketing with other financial companies &ndash; As per RBI, no cross selling and up selling</td>
                            <td className="text-center font-bold">No</td>
                            <td className="text-center">Yes</td>
                          </tr>
                          <tr>
                            <td>For our affiliates&rsquo; everyday business purposes &mdash; information about your transactions and experiences</td>
                            <td className="text-center font-bold">Yes</td>
                            <td className="text-center">No</td>
                          </tr>
                          <tr>
                            <td>For our affiliates&rsquo; everyday business purposes &mdash; information about your creditworthiness</td>
                            <td className="text-center font-bold">Yes</td>
                            <td className="text-center">Yes</td>
                          </tr>
                          <tr>
                            <td>For our affiliates to market to you</td>
                            <td className="text-center font-bold">Yes</td>
                            <td className="text-center">Yes</td>
                          </tr>
                          <tr>
                            <td>For nonaffiliates to market to you</td>
                            <td className="text-center font-bold">Yes</td>
                            <td className="text-center">Yes</td>
                          </tr>
                          <tr className="limit-sharing-row">
                            <td><strong>To limit our sharing</strong></td>
                            <td colSpan="2">
                              Call <strong>+91 9966 8888 25</strong><br />
                              Contact us at: <a href="mailto:megha@oxyloans.com">megha@oxyloans.com</a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Table 3: Who we are */}
                    <div className="table-data table-responsive">
                      <table className="table table-striped table-bordered">
                        <thead>
                          <tr>
                            <th colSpan="2">Who we are</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ width: "40%" }}><strong>Who is providing this notice?</strong></td>
                            <td>SRS Fintech Labs Pvt. Ltd. (Trade Name: OxyLoans)</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Table 4: What we do */}
                    <div className="table-data table-responsive">
                      <table className="table table-striped table-bordered">
                        <thead>
                          <tr>
                            <th colSpan="2">What we do</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ width: "40%" }}><strong>How does OXYLOANS protect my personal information?</strong></td>
                            <td>
                              To protect your personal information from unauthorized access and use, we use security measures that
                              comply with RBI compliance. These measures include computer safeguards and secured files and buildings.
                            </td>
                          </tr>
                          <tr>
                            <td><strong>How does OXYLOANS collect my personal information?</strong></td>
                            <td>
                              We collect your personal information, for example, when you:
                              <ul className="table-list">
                                <li>Open an account</li>
                                <li>Give us your contact information</li>
                                <li>Give us your income information</li>
                                <li>Show your government-issued ID</li>
                                <li>Buy securities or lend funds through us</li>
                              </ul>
                              We also collect information about you from others, such as credit bureaus and other companies.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Online Privacy and Security Policy */}
                    <div className="policy-section-block">
                      <h4>Online Privacy and Security Policy</h4>
                      <p>This Privacy Policy governs the following:</p>
                      <ul className="styled-bullets">
                        <li>The type of information collected from the Visitors, including personal information;</li>
                        <li>The purpose, means and modes of collection, usage, processing, retention, storage and destruction of such information; and</li>
                        <li>How and to whom OXYLOANS will disclose such information. OXYLOANS respects each Visitor&rsquo;s privacy and recognizes the need to protect the personal data or information shared with OXYLOANS.</li>
                      </ul>

                      <p>
                        SRS FINTECHLABS PVT LTD (&lsquo;OXYLOANS&rsquo;) values the users of our website (the &ldquo;Website&rdquo;).
                        Your privacy and trust are very important to us. We recognize that you may be concerned about our collection,
                        use, and disclosure of the personally identifiable information (&ldquo;Personal Information&rdquo;) that we collect
                        when you use the Website and the services offered on the Website (&ldquo;OXYLOANS&rdquo;). This Privacy Policy describes
                        the information that we collect from you, how we collect this information, and what we do with it after we collect it.
                        By using the Website you are accepting the practices described in this Privacy Policy. By using the Website you also
                        give consent to the use of Your Personal Information by OXYLOANS in accordance with the terms set out in this Privacy Policy.
                      </p>

                      <div className="grievance-contact-box">
                        <h5>Grievance Redressal Officer Contact:</h5>
                        <p>
                          If you have any questions or comments regarding this Privacy Policy, please contact us at{" "}
                          <a href="mailto:megha@oxyloans.com">megha@oxyloans.com</a>. You may mark the mail to grievance officer{" "}
                          <strong>Mr. Subash Sure</strong> at <a href="mailto:subbu@oxyloans.com">subbu@oxyloans.com</a> or call at{" "}
                          <strong>+91 99 66 88 88 25</strong>. If your complaint / dispute is not redressed within a period of one month,
                          you may appeal to the Customer Education and Protection Department of Reserve Bank of India.
                        </p>
                      </div>
                    </div>

                    {/* Policy Changes */}
                    <div className="policy-section-block">
                      <h4>DOES OXYLOANS EVER MAKE CHANGES TO ITS PRIVACY POLICY?</h4>
                      <p>
                        We may make changes to the Privacy Policy from time to time. We will notify you of any material changes by
                        sending you an email, posting a notice on the home page of the Website, or posting a notice in your account when
                        you first login after we have made changes. If you receive notification or a change in our Privacy Policy, you must
                        review the new Privacy Policy carefully to make sure you understand our practices and procedures. You may not be able
                        to receive notices from us if your cookies are not set to accept and/or are disabled.
                      </p>
                    </div>

                    {/* Who is user */}
                    <div className="policy-section-block">
                      <h4>WHO IS THE USER AND WHAT HE ACKNOWLEDGES</h4>
                      <p>
                        The words &ldquo;you&rdquo; or &ldquo;your&rdquo; or &ldquo;user&rdquo; or &ldquo;visitor&rdquo; as used herein,
                        refer to all individuals and/or entities accessing or using the Website for any reason.
                      </p>
                      <p>
                        By accessing, browsing, registering, logging in the Website, the Visitor acknowledges to have read, understood,
                        and agreed to be bound by this Privacy Policy and affirm assent to the collection, use, storage, processing and
                        disclosure as set out in this Privacy Policy.
                      </p>
                    </div>

                    {/* Type of information collected */}
                    <div className="policy-section-block">
                      <h4>WHAT TYPE OF INFORMATION DOES OXYLOANS COLLECT FROM USER</h4>
                      <p>
                        Visitors may share personal information such as name, address, mailing address, telephone number, e-mail address
                        and any and all details that may be requested by OXYLOANS from time to time (collectively, &ldquo;Personal Information&rdquo;).
                        Personal Information includes any and all information received by OXYLOANS whether such information is received by
                        email, online forms, telephone, facsimile, mail or otherwise. OXYLOANS stores this information to improve the level
                        of service to you; however, OXYLOANS will not share the Personal Information with any third party without the Visitor&rsquo;s
                        explicit consent.
                      </p>

                      <h5>Classification of data we collect:</h5>
                      <ul className="styled-bullets">
                        <li>
                          <strong>Sensitive Personal Data / Information:</strong> We collect Sensitive Personal Data / Information that
                          you provide to us, such as your name, mailing address, phone number, email address, credit card number, pan number,
                          tan number, income tax returns, bank account number, passport details, driving license details, personal statements,
                          reasons for seeking finance, income sources and financial information.
                        </li>
                        <li>
                          <strong>Non-Personal Information:</strong> We also collect non-personal information from you, such as your browser type,
                          the URL of the previous website you visited, your ISP, operating system, and your Internet protocol (IP) Address
                          (&ldquo;Non-Personal Information&rdquo;). Non-Personal Information cannot be easily used to personally identify you.
                        </li>
                      </ul>
                    </div>

                    {/* How and when collected */}
                    <div className="policy-section-block">
                      <h4>HOW AND WHEN DOES OXYLOANS COLLECT THIS INFORMATION?</h4>
                      <p>
                        <strong>Providing Information to Us:</strong> We collect Sensitive / Personal Data / Information from you when you
                        provide it to us. For example, if you purchase a product or services, or make an application for seeking a grant of loan
                        from a borrower, we may collect your name, mailing address, telephone number, credit card number, pan number, tan number,
                        income tax returns, bank account number, passport details, driving license details, personal statements, reasons for seeking
                        finance, income sources and email address. If you create either a Lender Account or a Borrower Account, we may collect your
                        name, tax identification number, mailing address, email address, credit card number, pan number, tan number, income tax
                        returns, bank account number, passport details, driving license details, personal statements, reasons for seeking finance,
                        income sources and other information that we request during the registration process, and any information that you provide
                        on your OXYLOANS profile. If you sign up to receive a newsletter, we will collect your email address.
                      </p>
                      <p>
                        <strong>Communications With Us:</strong> If you communicate with us regarding the Website or Services, we will collect any
                        information that you provide to us in any such communication.
                      </p>
                      <p>
                        <strong>Analytic and Reporting Technologies:</strong> Like the operators of most websites, we use analytic and reporting
                        technologies to record Non-Personal Information such as Internet domain and host names, Internet protocol (IP) addresses,
                        browser software, operating system types, clickstream patterns, and the dates and times that the Website and Services are
                        accessed. We also contract with several online partners to help manage, monitor and optimize our Website and Services and
                        to help us measure the effectiveness of our advertising, communications and how visitors use the Website. To do this, we
                        may use web beacons and cookies.
                      </p>
                    </div>

                    {/* Mobile App Device Permissions */}
                    <div className="policy-section-block mobile-permissions-box">
                      <div className="mobile-perm-header">
                        <FaMobileAlt className="mobile-icon" />
                        <div>
                          <h4>Mobile Application Permissions &amp; Data Collection</h4>
                          <p>We may also collect certain information from your device through our mobile application/s as follows:</p>
                        </div>
                      </div>

                      <div className="mobile-perm-item">
                        <h5>1. Financial SMS Information</h5>
                        <p>We don&rsquo;t read or collect your personal SMS&rsquo;s from your inbox.</p>
                        <p>
                          After obtaining your explicit consent, we may collect and monitor financial SMS you receive from 5-6 digit
                          alphanumeric senders which helps us in assessing the different bank accounts you hold and your cash flow patterns.
                          This helps us accurately assess your profile for credit risk and provide you with the credit services that are
                          appropriate for you. We only use financial SMS information (current and historical) to perform an updated,
                          accurate credit risk assessment to determine your creditworthiness. While you are using the OXYLOANS application/s,
                          it periodically sends this financial SMS information to us and to our affiliate server.
                        </p>
                      </div>

                      <div className="mobile-perm-item">
                        <h5>2. Contact Information</h5>
                        <p>
                          Upto few references are required before approval and disbursal of a loan. For this purpose, our app requires your
                          permission to collect and monitor your contacts&rsquo; information (including name, phone number, contact last
                          modified, account type, favourites and optional data such as relationship and structural address) so as to enable you
                          to autofill the data during the loan application process. It is essential for the purpose of credit risk assessment to
                          obtain reliable reference information for a successful loan application. We also utilize this information to allow you
                          to easily share app invites with your contacts as part of our referral policy.
                        </p>
                      </div>

                      <div className="mobile-perm-item">
                        <h5>3. Device Location and Device Information</h5>
                        <p>
                          We require your consent for collecting and monitoring the information about the location of your device to determine
                          serviceability of your loan application. This also helps us to verify your submitted address and expedite Know-your-customer
                          (KYC) process, thereby reducing the risk associated with your application.
                        </p>
                        <p>
                          The collection and usage of data by our app can be controlled and managed through the privacy controls of your mobile device.
                          The information we collect is assigned unique identifiers linking it to your mobile device. Upon downloading and installation
                          of our app, we always get explicit permission from you before collecting any information.
                        </p>
                        <p>
                          The information we collect from your device includes the hardware model, build model, RAM, storage; unique device identifiers
                          like IMEI, serial number, SSAID; SIM information that includes network operator, roaming state, MNC and MCC codes, WIFI
                          information that includes MAC address and mobile network information.
                        </p>
                        <p>
                          We collect this information to uniquely identify your device, provide automatic updates and to provide additional security,
                          ensuring no one else uses your account on their device in an unauthorized manner or in an act of fraud. In addition, the
                          information provides us valuable feedback on your identity as a device holder as well as your device behaviour, thereby
                          allowing us to improve our services and provide an enhanced customer experience to you.
                        </p>
                      </div>
                    </div>

                    {/* Sensitive personal data */}
                    <div className="policy-section-block">
                      <h4>Sensitive Personal Data or Information</h4>
                      <p>
                        For the purposes of this Privacy Policy, the information that qualifies for safeguard and protection include information pertaining to:
                      </p>
                      <ul className="styled-bullets">
                        <li>i) Password;</li>
                        <li>ii) Financial information such as Bank account or credit card or debit card or other payment instrument details;</li>
                        <li>iii) Physical, physiological and mental health condition;</li>
                        <li>iv) Sexual orientation;</li>
                        <li>v) Medical record and history;</li>
                        <li>vi) Biometric information;</li>
                        <li>vii) Any detail relating to these as provided to us for availing our services;</li>
                        <li>viii) Any of the information received under these by us for processing, stored or processed under a lawful contract or otherwise.</li>
                      </ul>
                      <p>
                        Any information which is freely available or accessible in public domain or furnished under the Right to Information Act,
                        2005 or any other law for the time being in force shall not be regarded as sensitive personal data and will not qualify for
                        our safeguard and protection measures.
                      </p>
                    </div>

                    {/* Disclosure of Information */}
                    <div className="policy-section-block">
                      <h4>Disclosure of Information</h4>
                      <p>We do not disclose the sensitive personal data or information provided to us, to any third party, except:</p>
                      <ul className="styled-bullets">
                        <li>i) with express prior permission of the user whose information is being disclosed;</li>
                        <li>ii) if such disclosure is necessary for compliance of a legal obligation.</li>
                      </ul>
                      <p>
                        The information can only be shared by us without the prior permission of the user, on receiving a request to the effect from a Government agency.
                      </p>
                      <p>
                        Our staff can also access this information for the purpose of resolving a problem, addressing a support issue, investigating a suspected
                        violation of the Terms &amp; Conditions, or, as may be required by law. Our employees access to information described herein are
                        subject to a non-disclosure agreement or policy consistent with the terms in this Privacy Statement.
                      </p>
                    </div>

                    {/* Loans Tenure and Details */}
                    <div className="policy-section-block loan-details-box">
                      <h4>Loans Tenure and Details</h4>
                      <p>
                        Loan tenure and rate of interest will be decided by the lender and borrower only. If the lender and borrower do not agree to the terms,
                        we won&rsquo;t be processing the loan.
                      </p>
                      <div className="tenure-specs-grid">
                        <div className="spec-item">
                          <span className="spec-label">Maximum Tenure:</span>
                          <span className="spec-val">36 Months</span>
                        </div>
                        <div className="spec-item">
                          <span className="spec-label">Minimum Tenure:</span>
                          <span className="spec-val">1 Month</span>
                        </div>
                        <div className="spec-item">
                          <span className="spec-label">Maximum Rate of Interest:</span>
                          <span className="spec-val">36% PA</span>
                        </div>
                        <div className="spec-item">
                          <span className="spec-label">Minimum Rate of Interest:</span>
                          <span className="spec-val">8% PA</span>
                        </div>
                      </div>
                      <p className="rejection-rights-note">
                        <strong>If the lender or the borrower is not happy with the tenure and rate of interest, he / she always can reject the offer which was sent.</strong>
                      </p>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="privacy-actions-footer">
                      <button type="button" className="btn-privacy-action btn-print" onClick={handlePrint}>
                        <FaPrint />
                        <span>Print Privacy Policy</span>
                      </button>
                      <Link to="/userType" className="btn-privacy-action btn-terms">
                        <span>View Terms and Conditions &rarr;</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Modular Footer */}
      <LandingFooter />
    </div>
  );
};

export default PrivacyPolicy;
