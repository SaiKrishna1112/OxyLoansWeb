import React from "react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px", fontFamily: "Arial, sans-serif", color: "#222", lineHeight: 1.7 }}>
      <div style={{ marginBottom: 24 }}>
        <Link to="/" style={{ color: "#0066cc", textDecoration: "none", fontSize: 14 }}>← Back to OxyLoans</Link>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, color: "#1a1a2e" }}>Terms of Service</h1>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 32 }}>Last updated: September 2026 &nbsp;|&nbsp; OxyLoans Marketplace Pvt. Ltd.</p>

      <p>
        These Terms of Service ("Terms") govern your use of the OxyLoans platform operated by <strong>OxyLoans Marketplace Pvt. Ltd.</strong>, an RBI-registered NBFC-P2P company. By registering or using OxyLoans, you agree to these Terms. Please read them carefully.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>1. About OxyLoans</h2>
      <p>
        OxyLoans is a Peer-to-Peer (P2P) lending marketplace registered with the Reserve Bank of India (RBI) as an NBFC-P2P. We facilitate direct lending between individual lenders and borrowers. OxyLoans itself does not lend money; it only provides the technology platform for matching lenders and borrowers.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>2. Eligibility</h2>
      <p>To use OxyLoans you must:</p>
      <ul style={{ paddingLeft: 24 }}>
        <li>Be an Indian resident aged 18 years or above</li>
        <li>Have a valid PAN card and Aadhaar number</li>
        <li>Have a bank account in your name</li>
        <li>Complete full KYC verification as required by RBI</li>
        <li>Not be declared insolvent or have any legal disqualification from entering into financial contracts</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>3. RBI Lending Limits</h2>
      <p>As per RBI NBFC-P2P guidelines:</p>
      <ul style={{ paddingLeft: 24 }}>
        <li>The aggregate lending limit across all P2P platforms is <strong>₹50 lakhs per lender</strong></li>
        <li>The maximum lending to a single borrower is <strong>₹50,000 per lender</strong></li>
        <li>Borrowers are subject to a maximum borrowing limit of <strong>₹10 lakhs</strong> across all P2P platforms</li>
        <li>OxyLoans monitors and enforces these limits. Transactions exceeding limits will be rejected.</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>4. Lender Terms</h2>
      <ul style={{ paddingLeft: 24 }}>
        <li>Lending through OxyLoans involves <strong>risk of default</strong>. Returns are not guaranteed.</li>
        <li>Funds are held in an escrow account managed by a SEBI-registered trustee before disbursement</li>
        <li>Interest rates are agreed upon at the time of deal participation and cannot be changed mid-tenure</li>
        <li>OxyLoans charges a platform fee (subscription) for lender services</li>
        <li>Lenders are responsible for their own tax obligations on interest income</li>
        <li>OxyLoans does not guarantee repayment in case of borrower default</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>5. Borrower Terms</h2>
      <ul style={{ paddingLeft: 24 }}>
        <li>Borrowers must repay principal and interest as per the agreed EMI schedule</li>
        <li>Default or delayed payment will be reported to credit bureaus (Experian)</li>
        <li>OxyLoans charges a processing fee for loan disbursement</li>
        <li>Pre-payment is allowed subject to the terms of the specific deal</li>
        <li>Borrowers must notify OxyLoans of any change in employment, income, or financial status</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>6. Platform Fees</h2>
      <ul style={{ paddingLeft: 24 }}>
        <li>Lenders pay an annual/monthly subscription fee to access lending features</li>
        <li>Borrowers pay a one-time processing fee deducted from the loan disbursement</li>
        <li>All fees are displayed clearly before any transaction is confirmed</li>
        <li>Fees are non-refundable except as required by law</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>7. KYC and Verification</h2>
      <p>
        OxyLoans is required by RBI to complete full KYC verification for all users. You agree to provide accurate and up-to-date information. Providing false or misleading information is grounds for immediate account termination and may result in legal action.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>8. Account Security</h2>
      <ul style={{ paddingLeft: 24 }}>
        <li>You are responsible for maintaining the confidentiality of your login credentials</li>
        <li>Immediately notify us at <a href="mailto:support@oxyloans.com" style={{ color: "#0066cc" }}>support@oxyloans.com</a> if you suspect unauthorised access</li>
        <li>OxyLoans will never ask for your OTP, password, or PIN via phone or email</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>9. Prohibited Activities</h2>
      <p>You must not:</p>
      <ul style={{ paddingLeft: 24 }}>
        <li>Use the platform for money laundering or any illegal activity</li>
        <li>Create multiple accounts or misrepresent your identity</li>
        <li>Attempt to access other users' accounts or data</li>
        <li>Use automated bots or scrapers on the platform</li>
        <li>Circumvent RBI lending limits through artificial transactions</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>10. Dispute Resolution</h2>
      <p>
        In case of any dispute between lenders and borrowers, OxyLoans will facilitate communication but is not liable for the outcome. Disputes that cannot be resolved through the platform should be referred to arbitration under the Arbitration and Conciliation Act, 1996. The jurisdiction for all legal proceedings is Hyderabad, Telangana.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>11. Limitation of Liability</h2>
      <p>
        OxyLoans is a technology intermediary and is not liable for: investment losses due to borrower default, market fluctuations affecting returns, or technical downtime beyond our reasonable control. Our total liability in any case shall not exceed the platform fees paid by you in the preceding 12 months.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>12. Termination</h2>
      <p>
        OxyLoans may suspend or terminate your account if you violate these Terms, fail KYC re-verification, or if required by regulatory authorities. Existing loans/investments will continue to be serviced until maturity even after account termination.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>13. Changes to Terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be notified via email or platform notification at least 15 days before taking effect. Continued use of OxyLoans after the effective date constitutes acceptance of the updated Terms.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>14. Governing Law</h2>
      <p>
        These Terms are governed by the laws of India, including but not limited to the RBI NBFC-P2P Master Directions 2017 (as amended), the Information Technology Act 2000, and the Consumer Protection Act 2019. Any disputes shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>15. Contact Us</h2>
      <address style={{ fontStyle: "normal", background: "#f5f5f5", padding: "16px 20px", borderRadius: 8, marginTop: 8 }}>
        <strong>OxyLoans Marketplace Pvt. Ltd.</strong><br />
        Email: <a href="mailto:support@oxyloans.com" style={{ color: "#0066cc" }}>support@oxyloans.com</a><br />
        Website: <a href="https://www.oxyloans.com" style={{ color: "#0066cc" }}>www.oxyloans.com</a><br />
        Grievance Officer: <a href="mailto:support@oxyloans.com" style={{ color: "#0066cc" }}>support@oxyloans.com</a>
      </address>

      <p style={{ marginTop: 40, color: "#888", fontSize: 13 }}>
        © 2026 OxyLoans Marketplace Pvt. Ltd. All rights reserved.
      </p>
    </div>
  );
};

export default TermsOfService;
