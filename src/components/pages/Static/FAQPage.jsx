import React, { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaPhoneAlt,
  FaEnvelope,
  FaUserTie,
  FaUser,
  FaIdCard,
  FaFileInvoiceDollar,
  FaThLarge,
  FaHeadset,
  FaCheck,
  FaArrowRight,
  FaPlus,
} from "react-icons/fa";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";
import "./FAQPage.css";

const FAQ_DATA = [
  // ── LENDER FAQS (16 Items) ────────────────────────────────────────────────
  {
    id: "lender-1",
    category: "lender",
    categoryLabel: "Lender",
    badge: "LENDER",
    badgeClass: "badge-lender",
    question: "Do I need to register with OxyLoans.com?",
    answer: "Yes. OxyLoans encourages you to complete the registration process. Upon 60% of completion of your profile, you are eligible to lend money.",
    answerHtml: "<p>Yes. OxyLoans encourages you to complete the registration process. Upon 60% of completion of your profile, you are eligible to lend money.</p>",
  },
  {
    id: "lender-2",
    category: "lender",
    categoryLabel: "Lender",
    badge: "LENDER",
    badgeClass: "badge-lender",
    question: "Do I need to share my personal, professional data and upload documents?",
    answer: "Yes, we seek basic information and request you to upload govt. documents as proof, as you will be doing monetary transactions.",
    answerHtml: "<p>Yes, we seek basic information and request you to upload govt. documents as proof, as you will be doing monetary transactions.</p>",
  },
  {
    id: "lender-3",
    category: "lender",
    categoryLabel: "Lender",
    badge: "LENDER",
    badgeClass: "badge-lender",
    question: "How do I achieve 100% of Profile completeness?",
    answer: "Each section in your My Profile segment has been assigned a unique weightage. Once you have filled in the required details in a particular section (e.g. ahead to 'Save' it), the profile completion percentage will automatically increase based on the assigned weightage. Once all the sections are filled correctly, 100% of the profile is complete.",
    answerHtml: `<p>Each section in your My Profile segment has been assigned a unique weightage. Once you have filled in the required details in a particular section (e.g. ahead to 'Save' it), the profile completion percentage will automatically increase based on the assigned weightage. Once all the sections are filled correctly, 100% of the profile is complete.</p>
<div class="faq-table-responsive">
  <table class="faq-weightage-table">
    <thead>
      <tr>
        <th>User Profile section</th>
        <th>Weightage in %</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Personal details</td><td>10%</td></tr>
      <tr><td>Contact details</td><td>20%</td></tr>
      <tr><td>Professional details</td><td>20%</td></tr>
      <tr><td>Financial info</td><td>20%</td></tr>
      <tr><td>PAN card</td><td>10%</td></tr>
      <tr><td>ID/Address document</td><td>10%</td></tr>
      <tr><td>Photo</td><td>10%</td></tr>
      <tr class="table-total-row"><td><strong>Total</strong></td><td><strong>100%</strong></td></tr>
    </tbody>
  </table>
</div>`,
  },
  {
    id: "lender-4",
    category: "lender",
    categoryLabel: "Lender",
    badge: "LENDER",
    badgeClass: "badge-lender",
    question: "What is the minimum amount I can lend?",
    answer: "INR 5000 is the minimum amount to start lending. We suggest you lend small amounts to many people so that the risk is minimized.",
    answerHtml: "<p>INR 5000 is the minimum amount to start lending. We suggest you lend small amounts to many people so that the risk is minimized.</p>",
  },
  {
    id: "lender-5",
    category: "lender",
    categoryLabel: "Lender",
    badge: "LENDER",
    badgeClass: "badge-lender",
    question: "What is the maximum time frame for a loan?",
    answer: "You can lend for a minimum period of 1 month and a maximum period of 36 months. Term of the loan can be negotiated with borrower.",
    answerHtml: "<p>You can lend for a minimum period of 1 month and a maximum period of 36 months. Term of the loan can be negotiated with borrower.</p>",
  },
  {
    id: "lender-6",
    category: "lender",
    categoryLabel: "Lender",
    badge: "LENDER",
    badgeClass: "badge-lender",
    question: "How can I ask for repayment date to be 5th of every month?",
    answer: "Yes, lender and borrower can negotiate and fix the repayment date.",
    answerHtml: "<p>Yes, lender and borrower can negotiate and fix the repayment date.</p>",
  },
  {
    id: "lender-7",
    category: "lender",
    categoryLabel: "Lender",
    badge: "LENDER",
    badgeClass: "badge-lender",
    question: "What is the rate of interest that I can ask for?",
    answer: "We suggest you lend to more people and charge the rate of interest based on their profile strength. We suggest you to charge starting from 12% per year to 36% per year and maintain 24% average returns across loans.",
    answerHtml: "<p>We suggest you lend to more people and charge the rate of interest based on their profile strength. We suggest you to charge starting from 12% per year to 36% per year and maintain 24% average returns across loans.</p>",
  },
  {
    id: "lender-8",
    category: "lender",
    categoryLabel: "Lender",
    badge: "LENDER",
    badgeClass: "badge-lender",
    question: "What if borrower absconds after paying two months of interest or EMIs?",
    answer: "Soft scare: OxyLoans Team we will be collecting his office and home locations and If the payment is not done, we from oxyloans telecaller will call to borrower and ask for payment. If the borrower is not responding over the calls we send emails and messages, still if the borrower is not responding we will ask our executives visit their location and ask gently. If the borrower is not ready to pay then we will suggest borrower to reach our legal team move file legally.",
    answerHtml: "<p><strong>Soft scare:</strong> OxyLoans Team we will be collecting his office and home locations and If the payment is not done, we from oxyloans telecaller will call to borrower and ask for payment. If the borrower is not responding over the calls we send emails and messages, still if the borrower is not responding we will ask our executives visit their location and ask gently. If the borrower is not ready to pay then we will suggest borrower to reach our legal team move file legally.</p>",
  },
  {
    id: "lender-9",
    category: "lender",
    categoryLabel: "Lender",
    badge: "LENDER",
    badgeClass: "badge-lender",
    question: "Does OxyLoans validate my details ?",
    answer: "Yes, we follow the same strict procedure in processing the KYC with respect to both borrowers and lenders.",
    answerHtml: "<p>Yes, we follow the same strict procedure in processing the KYC with respect to both borrowers and lenders.</p>",
  },
  {
    id: "lender-10",
    category: "lender",
    categoryLabel: "Lender",
    badge: "LENDER",
    badgeClass: "badge-lender",
    question: "What is the method used for repayments calculation?",
    answer: "We suggest the following types of repayment methods: Pay Interest monthly & Principal Later: Lender and borrower agree on monthly interest only and principal to be paid as a whole/half amount. Flat EMI Method: Borrower needs to pay an EMI every month until the end of the loan term. Reduced Balance Method: Borrower needs to pay an EMI every month but the EMI will keep reducing every month.",
    answerHtml: `<p>We suggest the following types of repayment methods:</p>
<ul>
  <li><strong>Pay Interest monthly &amp; Principal Later:</strong> Lender and borrower agree on monthly interest only and principal to be paid as a whole/half amount. In such case interest calculations are simple. <em>Example: If a user borrowed INR 1 Lakh @ 2% interest per month, Borrower needs to pay INR 2,000 every month and clear off principal as full or part.</em></li>
  <li><strong>Flat EMI Method:</strong> Borrower needs to pay an EMI every month until the end of the loan term. Both principal and interest are paid on a fixed monthly basis.</li>
  <li><strong>Reduced Balance Method:</strong> Borrower needs to pay an EMI every month, and the interest portion reduces as the principal amortizes over the agreed loan term.</li>
</ul>`,
  },
  {
    id: "lender-11",
    category: "lender",
    categoryLabel: "Lender",
    badge: "LENDER",
    badgeClass: "badge-lender",
    question: "How do I transfer funds?",
    answer: "Once the agreement is signed based on the agreed terms, the lender will be given access to the account details and personal details of the borrower so that they can transact directly through the secure Escrow system.",
    answerHtml: "<p>Once the agreement is signed based on the agreed terms, the lender will be given access to the account details and personal details of the borrower so that they can transact directly through the secure Escrow system.</p>",
  },
  {
    id: "lender-12",
    category: "lender",
    categoryLabel: "Lender",
    badge: "LENDER",
    badgeClass: "badge-lender",
    question: "Can I collect fee for delayed or non-payment of EMI?",
    answer: "In the case of an EMI not paid on-time there will be a ripple effect. The lender will have a negative impact on his financial commitments too. So lender will decide how much fee the borrower should pay in case of not paying the EMI on time. We encourage lenders and borrowers to negotiate their terms and conditions for the same.",
    answerHtml: "<p>In the case of an EMI not paid on-time there will be a ripple effect. The lender will have a negative impact on his financial commitments too. So lender will decide how much fee the borrower should pay in case of not paying the EMI on time. We encourage lenders and borrowers to negotiate their terms and conditions for the same.</p>",
  },
  {
    id: "lender-13",
    category: "lender",
    categoryLabel: "Lender",
    badge: "LENDER",
    badgeClass: "badge-lender",
    question: "Can I know my borrowers?",
    answer: "Yes, OxyLoans will enable you to know both personal and professional details of the borrower.",
    answerHtml: "<p>Yes, OxyLoans will enable you to know both personal and professional details of the borrower.</p>",
  },
  {
    id: "lender-14",
    category: "lender",
    categoryLabel: "Lender",
    badge: "LENDER",
    badgeClass: "badge-lender",
    question: "Can I lend multiple times?",
    answer: "Yes, we suggest you allocate certain budget and make it 10 portions and lend it to different borrowers so that risk is distributed and you will have an income stream all around the month.",
    answerHtml: "<p>Yes, we suggest you allocate certain budget and make it 10 portions and lend it to different borrowers so that risk is distributed and you will have an income stream all around the month.</p>",
  },
  {
    id: "lender-15",
    category: "lender",
    categoryLabel: "Lender",
    badge: "LENDER",
    badgeClass: "badge-lender",
    question: "What if borrower does not sign the agreement?",
    answer: "Borrower is mandated to sign the loan contract before the transfer of funds can take place. OxyLoans automatically delivers digital contracts for authenticated e-signatures.",
    answerHtml: "<p>Borrower is mandated to sign the loan contract before the transfer of funds can take place. OxyLoans automatically delivers digital contracts for authenticated e-signatures.</p>",
  },
  {
    id: "lender-16",
    category: "lender",
    categoryLabel: "Lender",
    badge: "LENDER",
    badgeClass: "badge-lender",
    question: "Is lending through OxyLoans safe and legal in India?",
    answer: "Yes, OxyLoans operates as a licensed NBFC-P2P entity strictly regulated by the Reserve Bank of India (RBI). All capital transfers are routed through independent ICICI Bank trustee escrow accounts.",
    answerHtml: "<p>Yes, OxyLoans operates as a licensed NBFC-P2P entity strictly regulated by the Reserve Bank of India (RBI). All capital transfers are routed through independent ICICI Bank trustee escrow accounts.</p>",
  },

  // ── BORROWER FAQS (22 Items) ──────────────────────────────────────────────
  {
    id: "borrower-1",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "Do I need to register?",
    answer: "Yes, OxyLoans encourages you to register with us and upon 60% completion of your profile, you are eligible to borrow money.",
    answerHtml: "<p>Yes, OxyLoans encourages you to register with us and upon 60% completion of your profile, you are eligible to borrow money.</p>",
  },
  {
    id: "borrower-2",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "Do I need to pay penalty if I repay my loan earlier than the agreed time frame?",
    answer: "No, you don't need to pay any penalty. However, you can negotiate early closure terms with your lender directly.",
    answerHtml: "<p>No, you don't need to pay any penalty. However, you can negotiate early closure terms with your lender directly.</p>",
  },
  {
    id: "borrower-3",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "Can I choose to pay only interest month-on-month and clear the Principal in one-go?",
    answer: "Yes, you can choose to pay only interest month-on-month and clear principal in one-go or as partial lump sums, based on mutual agreement with your lender.",
    answerHtml: "<p>Yes, you can choose to pay only interest month-on-month and clear principal in one-go or as partial lump sums, based on mutual agreement with your lender.</p>",
  },
  {
    id: "borrower-4",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "Can I borrow multiple loans at the same time?",
    answer: "Yes, once your profile is verified and active, you can apply for multiple loan requirements subject to your monthly repayment capacity and overall debt-to-income limits.",
    answerHtml: "<p>Yes, once your profile is verified and active, you can apply for multiple loan requirements subject to your monthly repayment capacity and overall debt-to-income limits.</p>",
  },
  {
    id: "borrower-5",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "How much loan amount can I apply for on OxyLoans?",
    answer: "Eligible borrowers can request loans starting from INR 10,000 up to INR 10,00,000 based on verified monthly income, stability, and credit score.",
    answerHtml: "<p>Eligible borrowers can request loans starting from INR 10,000 up to INR 10,00,000 based on verified monthly income, stability, and credit score.</p>",
  },
  {
    id: "borrower-6",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "What is the maximum tenure for repayment?",
    answer: "Loan tenures range from 1 month to 36 months, allowing flexible short-term and medium-term financing customized to your cash flow.",
    answerHtml: "<p>Loan tenures range from 1 month to 36 months, allowing flexible short-term and medium-term financing customized to your cash flow.</p>",
  },
  {
    id: "borrower-7",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "What documents are required to apply for a borrower loan?",
    answer: "You will need to submit: PAN Card, Aadhaar Card / Passport (address proof), last 3 months salary slips or ITR, and latest 6 months bank statement.",
    answerHtml: "<p>You will need to submit: PAN Card, Aadhaar Card / Passport (address proof), last 3 months salary slips or ITR, and latest 6 months bank statement.</p>",
  },
  {
    id: "borrower-8",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "Does taking a loan on OxyLoans impact my CIBIL credit score?",
    answer: "Yes. Timely repayments will positively enhance your credit profile, while delays or defaults will be reported to all RBI-registered credit bureaus.",
    answerHtml: "<p>Yes. Timely repayments will positively enhance your credit profile, while delays or defaults will be reported to all RBI-registered credit bureaus.</p>",
  },
  {
    id: "borrower-9",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "How are borrower interest rates determined?",
    answer: "Interest rates are determined through algorithmic credit assessment and mutual agreement with lenders, typically spanning between 12% to 36% per annum.",
    answerHtml: "<p>Interest rates are determined through algorithmic credit assessment and mutual agreement with lenders, typically spanning between 12% to 36% per annum.</p>",
  },
  {
    id: "borrower-10",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "How quickly are loan funds disbursed?",
    answer: "After document verification and agreement signing, funds are transferred directly to your bank account within 24 to 48 business hours.",
    answerHtml: "<p>After document verification and agreement signing, funds are transferred directly to your bank account within 24 to 48 business hours.</p>",
  },
  {
    id: "borrower-11",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "Can self-employed professionals apply for personal or business loans?",
    answer: "Yes. Self-employed individuals, doctors, consultants, and business owners with verifiable bank transactions and ITR are welcome to apply.",
    answerHtml: "<p>Yes. Self-employed individuals, doctors, consultants, and business owners with verifiable bank transactions and ITR are welcome to apply.</p>",
  },
  {
    id: "borrower-12",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "How do I make my monthly EMI repayments?",
    answer: "Repayments are automated securely through eNACH / auto-debit directly from your verified salary or primary bank account.",
    answerHtml: "<p>Repayments are automated securely through eNACH / auto-debit directly from your verified salary or primary bank account.</p>",
  },
  {
    id: "borrower-13",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "What happens if an auto-debit EMI bounces?",
    answer: "Bank bounce charges and platform penal fees apply. We strongly advise maintaining adequate bank balance prior to the scheduled EMI due date.",
    answerHtml: "<p>Bank bounce charges and platform penal fees apply. We strongly advise maintaining adequate bank balance prior to the scheduled EMI due date.</p>",
  },
  {
    id: "borrower-14",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "Is collateral or security needed to borrow on OxyLoans?",
    answer: "No collateral or physical hypothecation is required for our standard unsecured personal loans. Approval is based on income and creditworthiness.",
    answerHtml: "<p>No collateral or physical hypothecation is required for our standard unsecured personal loans. Approval is based on income and creditworthiness.</p>",
  },
  {
    id: "borrower-15",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "Can I negotiate terms directly with prospective lenders?",
    answer: "Yes. OxyLoans is a direct peer-to-peer ecosystem where borrowers and lenders can negotiate rates, payment schedules, and repayment tenure transparently.",
    answerHtml: "<p>Yes. OxyLoans is a direct peer-to-peer ecosystem where borrowers and lenders can negotiate rates, payment schedules, and repayment tenure transparently.</p>",
  },
  {
    id: "borrower-16",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "What processing fee does OxyLoans charge borrowers?",
    answer: "OxyLoans charges a transparent platform fee (typically 2% to 4% depending on loan category and tenure) deducted only upon successful loan disbursal.",
    answerHtml: "<p>OxyLoans charges a transparent platform fee (typically 2% to 4% depending on loan category and tenure) deducted only upon successful loan disbursal.</p>",
  },
  {
    id: "borrower-17",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "Can I change my EMI repayment date after loan activation?",
    answer: "Repayment dates can only be adjusted with mutual written consent from the lender and updating the corresponding eNACH mandate in advance.",
    answerHtml: "<p>Repayment dates can only be adjusted with mutual written consent from the lender and updating the corresponding eNACH mandate in advance.</p>",
  },
  {
    id: "borrower-18",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "What is OxyScore and how does it help me get lower rates?",
    answer: "OxyScore is our proprietary credit evaluation algorithm assessing banking stability, income health, and repayment reliability to unlock premium lower interest rates.",
    answerHtml: "<p>OxyScore is our proprietary credit evaluation algorithm assessing banking stability, income health, and repayment reliability to unlock premium lower interest rates.</p>",
  },
  {
    id: "borrower-19",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "Is my personal, employment and financial data secure?",
    answer: "Yes, we implement enterprise-grade 256-bit SSL encryption and strict data privacy measures conforming to RBI NBFC-P2P regulatory security mandates.",
    answerHtml: "<p>Yes, we implement enterprise-grade 256-bit SSL encryption and strict data privacy measures conforming to RBI NBFC-P2P regulatory security mandates.</p>",
  },
  {
    id: "borrower-20",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "Can I apply if I have an average or modest CIBIL score?",
    answer: "Yes. Our underwriting model evaluates holistic cash flow and current debt-servicing capability, helping deserving borrowers secure funding.",
    answerHtml: "<p>Yes. Our underwriting model evaluates holistic cash flow and current debt-servicing capability, helping deserving borrowers secure funding.</p>",
  },
  {
    id: "borrower-21",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "Why are bank account details required during onboarding?",
    answer: "Your bank account details are necessary to verify account ownership, credit your approved loan amount, and configure auto-repayment mandates.",
    answerHtml: "<p>Your bank account details are necessary to verify account ownership, credit your approved loan amount, and configure auto-repayment mandates.</p>",
  },
  {
    id: "borrower-22",
    category: "borrower",
    categoryLabel: "Borrower",
    badge: "BORROWER",
    badgeClass: "badge-borrower",
    question: "Can I be both a Lender and a Borrower on OxyLoans?",
    answer: "Yes, once you are a registered user of OxyLoans, you can participate both as a borrower seeking loans and as an investor lending capital.",
    answerHtml: "<p>Yes, once you are a registered user of OxyLoans, you can participate both as a borrower seeking loans and as an investor lending capital.</p>",
  },

  // ── KYC & DOCUMENTS (7 Items) ─────────────────────────────────────────────
  {
    id: "kyc-1",
    category: "kyc",
    categoryLabel: "KYC & Documents",
    badge: "KYC & DOCS",
    badgeClass: "badge-kyc",
    question: "What documents are required for KYC verification on OxyLoans?",
    answer: "For statutory KYC verification, we require: (1) PAN Card (mandatory for identity and taxation), (2) Aadhaar Card, Passport, or Voter ID for address verification, (3) Recent photograph/selfie, and (4) Latest 3 to 6 months bank statement showing regular financial activity.",
    answerHtml: "<p>For statutory KYC verification, we require: (1) <strong>PAN Card</strong> (mandatory for identity and taxation), (2) <strong>Aadhaar Card, Passport, or Voter ID</strong> for address verification, (3) <strong>Recent photograph/selfie</strong>, and (4) <strong>Latest 3 to 6 months bank statement</strong> showing regular financial activity.</p>",
  },
  {
    id: "kyc-2",
    category: "kyc",
    categoryLabel: "KYC & Documents",
    badge: "KYC & DOCS",
    badgeClass: "badge-kyc",
    question: "How long does KYC document verification take?",
    answer: "Automated verification via DigiLocker and instant PAN validation occurs in real-time within minutes. Manual verification of supplementary income proofs typically takes 2 to 4 business hours.",
    answerHtml: "<p>Automated verification via DigiLocker and instant PAN validation occurs in real-time within minutes. Manual verification of supplementary income proofs typically takes 2 to 4 business hours.</p>",
  },
  {
    id: "kyc-3",
    category: "kyc",
    categoryLabel: "KYC & Documents",
    badge: "KYC & DOCS",
    badgeClass: "badge-kyc",
    question: "Is Aadhaar and PAN card mandatory for both Lenders and Borrowers?",
    answer: "Yes. Under Reserve Bank of India (RBI) NBFC-P2P Master Directions and PMLA guidelines, PAN and Aadhaar/OVD (Officially Valid Document) are statutory requirements for executing legally enforceable loan contracts.",
    answerHtml: "<p>Yes. Under Reserve Bank of India (RBI) NBFC-P2P Master Directions and PMLA guidelines, PAN and Aadhaar/OVD (Officially Valid Document) are statutory requirements for executing legally enforceable loan contracts.</p>",
  },
  {
    id: "kyc-4",
    category: "kyc",
    categoryLabel: "KYC & Documents",
    badge: "KYC & DOCS",
    badgeClass: "badge-kyc",
    question: "Can NRI investors register and lend on OxyLoans?",
    answer: "Yes, Non-Resident Indians (NRIs) can register as lenders. Required documents include valid Indian Passport, PAN card, overseas address proof, and NRE/NRO bank account details for transaction routing.",
    answerHtml: "<p>Yes, Non-Resident Indians (NRIs) can register as lenders. Required documents include valid Indian Passport, PAN card, overseas address proof, and NRE/NRO bank account details for transaction routing.</p>",
  },
  {
    id: "kyc-5",
    category: "kyc",
    categoryLabel: "KYC & Documents",
    badge: "KYC & DOCS",
    badgeClass: "badge-kyc",
    question: "How does DigiLocker speed up my document submission?",
    answer: "DigiLocker integration allows you to pull digitally signed, tamper-proof documents directly from government repositories with 1-click OTP consent, eliminating the need to upload physical scanned copies.",
    answerHtml: "<p>DigiLocker integration allows you to pull digitally signed, tamper-proof documents directly from government repositories with 1-click OTP consent, eliminating the need to upload physical scanned copies.</p>",
  },
  {
    id: "kyc-6",
    category: "kyc",
    categoryLabel: "KYC & Documents",
    badge: "KYC & DOCS",
    badgeClass: "badge-kyc",
    question: "What is the Re-KYC policy and when is periodic updating required?",
    answer: "As per RBI Master Direction on KYC, customer information is updated periodically based on risk categorization: low-risk users every 10 years, medium-risk every 8 years, and high-risk every 2 years, or whenever your bank account or primary address changes.",
    answerHtml: "<p>As per RBI Master Direction on KYC, customer information is updated periodically based on risk categorization: low-risk users every 10 years, medium-risk every 8 years, and high-risk every 2 years, or whenever your bank account or primary address changes.</p>",
  },
  {
    id: "kyc-7",
    category: "kyc",
    categoryLabel: "KYC & Documents",
    badge: "KYC & DOCS",
    badgeClass: "badge-kyc",
    question: "How does the ICICI Bank Escrow Mechanism safeguard lender and borrower capital?",
    answer: "Under strict RBI NBFC-P2P regulations, OxyLoans never holds user funds in its own operating accounts. All transactions flow through independent, trustee-managed Escrow bank accounts operated by ICICI Bank. Capital is transferred strictly from Lender Escrow directly to Borrower Bank Account upon contract execution, preventing platform misappropriation.",
    answerHtml: "<p>Under strict RBI NBFC-P2P regulations, OxyLoans never holds user funds in its own operating accounts. All transactions flow through independent, trustee-managed Escrow bank accounts operated by ICICI Bank. Capital is transferred strictly from Lender Escrow directly to Borrower Bank Account upon contract execution, preventing platform misappropriation.</p>",
  },

  // ── TAX & COMPLIANCE (3 Items) ────────────────────────────────────────────
  {
    id: "tax-1",
    category: "taxes",
    categoryLabel: "Tax & Compliance",
    badge: "TAX & COMPLIANCE",
    badgeClass: "badge-tax",
    question: "How is interest income earned by lenders taxed in India?",
    answer: "Interest earned from peer-to-peer lending is classified as 'Income from Other Sources' under the Indian Income Tax Act. It is added to your total gross annual income and taxed according to your individual income tax slab rates. Detailed annual interest statements and TDS certificates can be downloaded from your lender portal for seamless ITR filing.",
    answerHtml: "<p>Interest earned from peer-to-peer lending is classified as 'Income from Other Sources' under the Indian Income Tax Act. It is added to your total gross annual income and taxed according to your individual income tax slab rates. Detailed annual interest statements and TDS certificates can be downloaded from your lender portal for seamless ITR filing.</p>",
  },
  {
    id: "tax-2",
    category: "taxes",
    categoryLabel: "Tax & Compliance",
    badge: "TAX & COMPLIANCE",
    badgeClass: "badge-tax",
    question: "Is Tax Deducted at Source (TDS) applicable on P2P interest earnings?",
    answer: "In P2P transactions between individuals, individual borrowers are generally not required to deduct TDS under Section 194A unless mandated by specific entity thresholds. Lenders receive the full gross interest and are responsible for declaring the income during their annual income tax assessment.",
    answerHtml: "<p>In P2P transactions between individuals, individual borrowers are generally not required to deduct TDS under Section 194A unless mandated by specific entity thresholds. Lenders receive the full gross interest and are responsible for declaring the income during their annual income tax assessment.</p>",
  },
  {
    id: "tax-3",
    category: "taxes",
    categoryLabel: "Tax & Compliance",
    badge: "TAX & COMPLIANCE",
    badgeClass: "badge-tax",
    question: "How is borrower repayment behavior reported to Credit Bureaus?",
    answer: "OxyLoans reports monthly loan performance and repayment records directly to all four RBI-licensed credit information bureaus in India: TransUnion CIBIL, Experian, Equifax, and CRIF High Mark. Timely repayments enhance your credit score, while defaults are logged and impact future creditworthiness.",
    answerHtml: "<p>OxyLoans reports monthly loan performance and repayment records directly to all four RBI-licensed credit information bureaus in India: TransUnion CIBIL, Experian, Equifax, and CRIF High Mark. Timely repayments enhance your credit score, while defaults are logged and impact future creditworthiness.</p>",
  },
];

const CATEGORIES = [
  { key: "all", label: "All Questions", count: 48, icon: FaThLarge },
  { key: "lender", label: "Lender FAQs", shortLabel: "Lender", count: 16, icon: FaUserTie },
  { key: "borrower", label: "Borrower FAQs", shortLabel: "Borrower", count: 22, icon: FaUser },
  { key: "kyc", label: "KYC & Documents", shortLabel: "KYC & Documents", count: 7, icon: FaIdCard },
  { key: "taxes", label: "Tax & Compliance", shortLabel: "Tax & Compliance", count: 3, icon: FaFileInvoiceDollar },
];

const FAQPage = ({ defaultCategory }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryCategory = searchParams.get("category");
  const initialCategory = queryCategory || defaultCategory || "all";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");

  // Requirement: Do NOT expand any items when screen opens (all collapsed by default)
  const [openItems, setOpenItems] = useState({});

  // Motion: Interactive mouse parallax effect across 3D elements in hero
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleHeroMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: normX * 22, y: normY * 22 });
  };
  const handleHeroMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (queryCategory) {
      setSelectedCategory(queryCategory);
    } else if (defaultCategory) {
      setSelectedCategory(defaultCategory);
    }
  }, [queryCategory, defaultCategory]);

  const handleSelectCategory = (catKey) => {
    setSelectedCategory(catKey);
    if (catKey === "all") {
      searchParams.delete("category");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catKey });
    }
  };

  // Toggle single item
  const toggleItem = (id) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Expand all / Collapse all helper
  const handleToggleAll = (expand) => {
    if (expand) {
      const allOpen = {};
      filteredFaqs.forEach((f) => {
        allOpen[f.id] = true;
      });
      setOpenItems(allOpen);
    } else {
      setOpenItems({});
    }
  };

  // Filtered FAQs based on selected category & live search
  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="oxy-faq-page">
      {/* 1. Header (Untouched as requested: 'don't header') */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Top Hero Section with 3D Motion & Animated Visual Accents */}
      <section
        className="oxy-faq-hero-v2 animated-hero"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        {/* Animated Background Mesh & Light Sweeps */}
        <div className="hero-motion-backdrop" aria-hidden="true">
          <span className="light-orb orb-1" />
          <span className="light-orb orb-2" />
          <span className="light-sweep" />
        </div>

        {/* Left 3D Animated Clipboard & Coins Illustration */}
        <div
          className="faq-hero-decor left-decor motion-float-left"
          style={{
            transform: `translate3d(${-mousePos.x * 0.75}px, ${-mousePos.y * 0.75}px, 0)`,
          }}
          aria-hidden="true"
        >
          <div className="decor-clipboard animated-card">
            <div className="clipboard-shine-glint" />
            <div className="clipboard-header">
              <span className="clip-pin" />
            </div>
            <div className="clipboard-body">
              <div className="check-row row-1">
                <span className="mini-check" />
                <span className="mini-line" />
              </div>
              <div className="check-row row-2">
                <span className="mini-check" />
                <span className="mini-line" />
              </div>
              <div className="check-row row-3">
                <span className="mini-check" />
                <span className="mini-line short" />
              </div>
            </div>
            <div className="decor-coin coin-1 animated-coin">
              <span className="coin-shine" />
              <span className="coin-text">₹</span>
            </div>
            <div className="decor-coin coin-2 animated-coin delay">
              <span className="coin-shine" />
              <span className="coin-text">₹</span>
            </div>
          </div>
        </div>

        {/* Center Content with Motion Entrance */}
        <div className="oxy-faq-hero-center motion-center-block">
          <h1 className="oxy-faq-title-main animate-title">
            Frequently Asked Questions
          </h1>
          <p className="oxy-faq-subhead-main animate-subhead">
            Everything you need to know about peer-to-peer lending, borrower eligibility &amp; document requirements, KYC, repayment options, and RBI compliant operations.
          </p>

          <div className="oxy-faq-search-wrapper animate-search">
            <FaSearch className="faq-search-glass-icon" />
            <input
              type="text"
              className="faq-search-input-pill"
              placeholder="Search your question (e.g., loan limit, repayment, documents...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search your question"
            />
          </div>
        </div>

        {/* Right 3D Animated FAQ Speech Bubble & Twinkling Sparkles */}
        <div
          className="faq-hero-decor right-decor motion-float-right"
          style={{
            transform: `translate3d(${mousePos.x * 0.75}px, ${mousePos.y * 0.75}px, 0)`,
          }}
          aria-hidden="true"
        >
          <div className="decor-bubble animated-bubble">
            <span className="sparkle sp-1 twinkle-1" />
            <span className="sparkle sp-2 twinkle-2" />
            <span className="sparkle sp-3 twinkle-3" />
            <span className="sparkle sp-4 twinkle-4" />
            <div className="bubble-card">
              <span className="bubble-sub pulse-badge">?</span>
              <span className="bubble-bold">FAQ</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Horizontal Filter Pills Bar */}
      <div className="oxy-faq-pills-bar">
        <div className="faq-container-wrap pills-flex">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                className={`faq-pill-btn ${isActive ? "active" : ""}`}
                onClick={() => handleSelectCategory(cat.key)}
              >
                <Icon className="pill-icon" />
                <span>
                  {cat.label} ({cat.count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Main 2-Column Section */}
      <main className="oxy-faq-body-wrap">
        <div className="faq-container-wrap faq-grid-layout">
          {/* ── Left Sidebar (300px) ───────────────────────────────────────── */}
          <aside className="faq-sidebar">
            {/* Card 1: FAQ Categories */}
            <div className="faq-side-card card-categories">
              <h3 className="side-card-title">FAQ Categories</h3>
              <nav className="side-cat-list" aria-label="FAQ Categories Sidebar">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      className={`side-cat-btn ${isActive ? "active" : ""}`}
                      onClick={() => handleSelectCategory(cat.key)}
                    >
                      <div className="cat-btn-left">
                        <Icon className="cat-icon" />
                        <span className="cat-name">{cat.shortLabel || cat.label}</span>
                      </div>
                      <span className={`cat-count-badge ${isActive ? "active" : ""}`}>
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Card 2: Still need help? */}
            <div className="faq-side-card card-support">
              <div className="support-head-icon">
                <FaHeadset />
              </div>
              <h3 className="side-card-title text-center">Still need help?</h3>
              <p className="support-card-desc">
                Our support team is here to assist you.
              </p>
              <Link to="/contact-us" className="btn-side-contact">
                Contact Support
              </Link>
              <div className="support-contact-rows">
                <a href="tel:+918800668000" className="contact-item">
                  <FaPhoneAlt className="c-icon" />
                  <span>+91 88006 68000</span>
                </a>
                <a href="mailto:support@oxyloans.com" className="contact-item">
                  <FaEnvelope className="c-icon" />
                  <span>support@oxyloans.com</span>
                </a>
              </div>
            </div>

            {/* Card 3: Lend or Borrow with Confidence */}
            <div className="faq-side-card card-confidence">
              <div className="confidence-icon-box">
                <div className="confidence-graphic">
                  <span className="coin-sign">₹</span>
                  <div className="bar-graph">
                    <span className="bar b1" />
                    <span className="bar b2" />
                    <span className="bar b3" />
                  </div>
                </div>
              </div>
              <h3 className="confidence-title">
                Lend or Borrow <br /> with Confidence
              </h3>
              <ul className="confidence-check-list">
                <li>
                  <FaCheck className="chk-icon" />
                  <span>RBI Compliant</span>
                </li>
                <li>
                  <FaCheck className="chk-icon" />
                  <span>Secure &amp; Transparent</span>
                </li>
                <li>
                  <FaCheck className="chk-icon" />
                  <span>100% Digital Process</span>
                </li>
              </ul>
              <Link to="/register" className="btn-side-get-started">
                <span>Get Started</span>
                <FaArrowRight className="arr-icon" />
              </Link>
            </div>
          </aside>

          {/* ── Right Content Column (Accordion Cards) ─────────────────────── */}
          <section className="faq-content-main">
            {/* Top Toolbar: Showing count + Expand / Collapse All */}
            <div className="faq-content-toolbar">
              <div className="showing-count">
                Showing {filteredFaqs.length}{" "}
                {filteredFaqs.length === 1 ? "question" : "questions"}
                {searchQuery ? ` for "${searchQuery}"` : ""}
              </div>
              <div className="toolbar-actions">
                <button
                  type="button"
                  className="btn-expand-collapse"
                  onClick={() => handleToggleAll(true)}
                >
                  <FaPlus className="action-ico" />
                  <span>Expand All</span>
                </button>
                <button
                  type="button"
                  className="btn-expand-collapse"
                  onClick={() => handleToggleAll(false)}
                >
                  <FaChevronDown className="action-ico" />
                  <span>Collapse All</span>
                </button>
              </div>
            </div>

            {/* Questions List */}
            {filteredFaqs.length === 0 ? (
              <div className="faq-empty-state">
                <h4>No matching questions found</h4>
                <p>
                  Try searching with different keywords or select a different category from the sidebar or pills above.
                </p>
                <button
                  type="button"
                  className="btn-reset-filter"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  View All Questions
                </button>
              </div>
            ) : (
              <div className="faq-accordion-list">
                {filteredFaqs.map((faq) => {
                  const isOpen = !!openItems[faq.id];
                  return (
                    <article
                      key={faq.id}
                      className={`faq-accordion-item ${isOpen ? "open" : ""}`}
                    >
                      <button
                        type="button"
                        className="faq-accordion-header"
                        onClick={() => toggleItem(faq.id)}
                        aria-expanded={isOpen}
                      >
                        <div className="faq-header-left">
                          <span className={`faq-type-pill ${faq.badgeClass}`}>
                            {faq.badge}
                          </span>
                          <span className="faq-question-heading">
                            {faq.question}
                          </span>
                        </div>
                        <div className="faq-header-right">
                          {isOpen ? (
                            <FaChevronUp className="faq-toggle-chevron open" />
                          ) : (
                            <FaChevronDown className="faq-toggle-chevron" />
                          )}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="faq-accordion-body">
                          <div
                            className="faq-answer-inner"
                            dangerouslySetInnerHTML={{
                              __html: faq.answerHtml || `<p>${faq.answer}</p>`,
                            }}
                          />
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* 5. Unified Modular Footer */}
      <LandingFooter />
    </div>
  );
};

export default FAQPage;
