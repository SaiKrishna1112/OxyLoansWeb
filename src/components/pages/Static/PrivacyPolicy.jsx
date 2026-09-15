import React from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px", fontFamily: "Arial, sans-serif", color: "#222", lineHeight: 1.7 }}>
      <div style={{ marginBottom: 24 }}>
        <Link to="/" style={{ color: "#0066cc", textDecoration: "none", fontSize: 14 }}>← Back to OxyLoans</Link>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4, color: "#1a1a2e" }}>Privacy Policy</h1>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 32 }}>Last updated: September 2026 &nbsp;|&nbsp; OxyLoans Marketplace Pvt. Ltd.</p>

      <p>
        OxyLoans Marketplace Pvt. Ltd. ("OxyLoans", "we", "us", or "our") is an RBI-registered NBFC-P2P platform operating under RBI Certificate of Registration. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our website at <strong>www.oxyloans.com</strong> and related services.
      </p>
      <p>By using OxyLoans, you agree to the terms of this Privacy Policy.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>1. Information We Collect</h2>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>1.1 Personal Information</h3>
      <ul style={{ paddingLeft: 24 }}>
        <li>Full name, date of birth, gender</li>
        <li>Mobile number and email address</li>
        <li>PAN card number and Aadhaar number (for KYC as mandated by RBI)</li>
        <li>Bank account details (IFSC code, account number) for disbursement and repayment</li>
        <li>Address and identity proof documents</li>
      </ul>

      <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>1.2 Financial Information</h3>
      <ul style={{ paddingLeft: 24 }}>
        <li>Income details and credit score (for borrower eligibility assessment)</li>
        <li>Investment amounts, lending history, and interest earned (for lenders)</li>
        <li>Loan application details and repayment records</li>
      </ul>

      <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>1.3 Technical Information</h3>
      <ul style={{ paddingLeft: 24 }}>
        <li>IP address, browser type, and device information</li>
        <li>Login timestamps and session data</li>
        <li>Cookies and usage analytics</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>2. How We Use Your Information</h2>
      <ul style={{ paddingLeft: 24 }}>
        <li>To verify your identity and complete KYC as required by RBI guidelines</li>
        <li>To facilitate P2P lending transactions between lenders and borrowers</li>
        <li>To process payments, disbursements, and repayments via escrow accounts</li>
        <li>To send transaction alerts, OTPs, and account notifications via SMS, WhatsApp, and email</li>
        <li>To generate credit assessments and risk profiles for borrowers</li>
        <li>To provide AI-powered portfolio insights to lenders (using anonymised financial data only — no personal identity is shared with AI providers)</li>
        <li>To comply with RBI reporting requirements and legal obligations</li>
        <li>To improve our platform and prevent fraud</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>3. AI Features and Data Privacy</h2>
      <p>
        OxyLoans uses AI services (including third-party AI APIs) to provide portfolio insights and recommendations. <strong>We never send personally identifiable information</strong> (name, mobile number, PAN, Aadhaar, email, or lender ID) to any AI provider. Only anonymised financial metrics (investment amounts, interest earned, deal counts, tenure) are used for AI analysis.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>4. Sharing of Information</h2>
      <p>We do not sell your personal information. We may share it with:</p>
      <ul style={{ paddingLeft: 24 }}>
        <li><strong>RBI and regulatory authorities</strong> — as required by law and NBFC-P2P regulations</li>
        <li><strong>Credit bureaus</strong> — Experian and others for credit scoring (with your consent)</li>
        <li><strong>Payment gateways</strong> — for processing transactions (e.g., Cashfree, PayU)</li>
        <li><strong>KYC verification providers</strong> — for Aadhaar/PAN verification</li>
        <li><strong>Legal authorities</strong> — when required by court order or law enforcement</li>
      </ul>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>5. Data Security</h2>
      <p>
        We implement industry-standard security measures including SSL/TLS encryption, secure database storage, access controls, and regular security audits. However, no method of internet transmission is 100% secure. You are responsible for keeping your login credentials confidential.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>6. Google Sign-In</h2>
      <p>
        If you use "Sign in with Google", we receive your Google account email address to verify your identity. We do not receive your Google password. Your Google email is matched against your registered OxyLoans account. We store only the association between your Google account and OxyLoans account — no other Google account data is stored or shared.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>7. Cookies</h2>
      <p>
        We use essential cookies for session management and authentication. We may use analytics cookies to understand platform usage. You can disable cookies in your browser, but this may affect platform functionality.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>8. Data Retention</h2>
      <p>
        We retain your personal information for as long as your account is active and as required by RBI regulations (typically 5–8 years after account closure). KYC documents are retained as mandated by the Prevention of Money Laundering Act (PMLA).
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>9. Your Rights</h2>
      <ul style={{ paddingLeft: 24 }}>
        <li>Access the personal information we hold about you</li>
        <li>Request correction of inaccurate information</li>
        <li>Request deletion of your account (subject to regulatory retention requirements)</li>
        <li>Withdraw consent for marketing communications at any time</li>
      </ul>
      <p>To exercise these rights, email us at <strong>support@oxyloans.com</strong>.</p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>10. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on our platform. Continued use of OxyLoans after changes constitutes acceptance of the updated policy.
      </p>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginTop: 32, marginBottom: 12, color: "#1a1a2e" }}>11. Contact Us</h2>
      <p>For any privacy-related questions or grievances:</p>
      <address style={{ fontStyle: "normal", background: "#f5f5f5", padding: "16px 20px", borderRadius: 8, marginTop: 8 }}>
        <strong>OxyLoans Marketplace Pvt. Ltd.</strong><br />
        Email: <a href="mailto:support@oxyloans.com" style={{ color: "#0066cc" }}>support@oxyloans.com</a><br />
        Website: <a href="https://www.oxyloans.com" style={{ color: "#0066cc" }}>www.user.oxyloans.com</a><br />
        RBI Certificate of Registration: NBFC-P2P
      </address>

      <p style={{ marginTop: 40, color: "#888", fontSize: 13 }}>
        © 2026 OxyLoans Marketplace Pvt. Ltd. All rights reserved.
      </p>
    </div>
  );
};

export default PrivacyPolicy;
