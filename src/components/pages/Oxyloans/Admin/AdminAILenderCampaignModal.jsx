import React, { useEffect, useMemo, useState } from "react";
import { FaEnvelope, FaFileExcel, FaImage, FaRobot, FaWhatsapp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import {
  fetchAllCampaignFailedDeliveries,
  generateAdminAILenderCampaignMessage,
  getAdminAILenderAnalyticsLenders,
  isCampaignDeliveryFailed,
  sendAdminAILenderSegmentCampaign,
  uploadAdminAILenderCampaignImage,
} from "../../../HttpRequest/admin";

const PROJECT_TYPES = [
  { id: "oxyloans", label: "oxyloans (admin@oxyloans.com)", displayName: "OxyLoans" },
  { id: "bmv", label: "bmv (anil@askoxy.ai)", displayName: "BMV" },
  { id: "oxybricks", label: "oxybricks (radha@oxybricks.world)", displayName: "Oxybricks" },
  { id: "erice", label: "erice (ceo@oxyglobaltech.net)", displayName: "Erice" },
  { id: "rotary", label: "rotary (Rotaryaihub@rotary3150.com)", displayName: "Rotary AI Hub" },
];

// Clean OxyLoans logo without the mark above the final S (local preview asset only).
const OXYLOANS_UI_LOGO = `${process.env.PUBLIC_URL || ""}/assets/img/oxyloans-campaign-logo.png`;
// Inbox-safe public HTTPS logo (S3/private/signed URLs break for email recipients).
const OXYLOANS_EMAIL_LOGO =
  "https://oxyloans.com/wp-content/themes/oxyloan/oxyloan/_ui/images/logo4.png";

const DEFAULT_LOGOS = {
  oxyloans: OXYLOANS_UI_LOGO,
  bmv: "https://oxyloansv1.s3.ap-south-1.amazonaws.com/8134/PAN_askoxylogoblack.56dbb158b7a0beaf4fbe.png",
  oxybricks: "https://oxyloanstestv1.s3.ap-south-1.amazonaws.com/BULKINVITE_logo%20(1).png",
  erice: "https://oxyloansv1.s3.ap-south-1.amazonaws.com/BULKINVITE_Oxyrice%20logo.png",
  rotary: OXYLOANS_UI_LOGO,
};

const defaultLogoForProject = (projectId) =>
  DEFAULT_LOGOS[projectId] || DEFAULT_LOGOS.oxyloans;

const isPublicHttpUrl = (value) => /^https?:\/\//i.test(String(value || "").trim());

const isFragileEmailLogoUrl = (value) => {
  const url = String(value || "").trim().toLowerCase();
  if (!url) return true;
  const s3 = url.includes(".amazonaws.com/") || url.includes("s3.");
  if (!s3) return false;
  return (
    url.includes("x-amz-") ||
    url.includes("signature=") ||
    url.includes("awsaccesskeyid=") ||
    url.includes("oxyloansv1.s3.") ||
    url.includes("oxyloanstestv1.s3.")
  );
};

/** Inbox-safe logo URL: public HTTPS only (no localhost / relative / known-private S3 defaults). */
const resolveDeliverableLogoUrl = (candidate, projectId) => {
  const url = String(candidate || "").trim();
  const projectDefault = defaultLogoForProject(projectId);
  // Custom upload (not the project default asset)
  if (
    isPublicHttpUrl(url) &&
    !/localhost|127\.0\.0\.1/i.test(url) &&
    url !== projectDefault
  ) {
    return url;
  }
  if (projectId === "oxyloans" || projectId === "rotary") {
    return OXYLOANS_EMAIL_LOGO;
  }
  if (isPublicHttpUrl(projectDefault) && !isFragileEmailLogoUrl(projectDefault)) {
    return projectDefault;
  }
  return OXYLOANS_EMAIL_LOGO;
};

const TEST_PREVIEW_NAME = "Vijay Dasari";
const TEST_PREVIEW_MOBILE = "919876543210";

const compactWhatsAppLineSpacing = (text) => {
  const compact = String(text || "").replace(/\n{2,}/g, "\n");
  return compact.replace(/([.!?])\n(?=[A-Z*"])/g, "$1\n\n").trim();
};

const normalizeCampaignText = (text) =>
  String(text || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/br>/gi, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .trim();

const formatEmailMessage = (text) => normalizeCampaignText(text);

const formatWhatsAppText = (text) =>
  compactWhatsAppLineSpacing(
    normalizeCampaignText(text).replace(/^\s*subject\s*:\s*.+\n+/i, "")
  );

const stripSubjectFromPreview = (text, subject) => {
  let result = String(text || "").trim();
  const sub = String(subject || "").trim();
  if (sub) {
    const escaped = sub.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(`^\\*?${escaped}\\*?\\s*\\n*`, "i"), "");
  }
  return result.replace(/^\*?update from oxyloans\*?\s*\n*/i, "").trim();
};

const scheduleTestStorageKey = (segmentKey) => `oxy-campaign-test-scheduled:${segmentKey || "default"}`;
const customTemplateStorageKey = (segmentKey, audience, activeChannel) =>
  `oxy-campaign-custom-templates:${segmentKey || "default"}:${audience || "lenders"}:${activeChannel || "email"}`;

const fmtNum = (n) => (n == null ? "0" : Number(n).toLocaleString("en-IN"));
const DEFAULT_CAMPAIGN_SET_COUNT = 3;

const CAMPAIGN_EMAIL_FOOTER = `Please reply to this email if you need assistance or log in to https://oxyloans.com/ to review your account.

For assistance, please contact:
Manikanta: +91 81061 77269
Divya: +91 93479 67774

We look forward to welcoming you as an active member of the OXYLOANS community.

Warm regards,

Radhakrishna Thatavarti
Founder & CEO
OXYLOANS`;

const CAMPAIGN_WHATSAPP_FOOTER = `Reply for assistance or visit https://oxyloans.com/

Help: Manikanta +91 81061 77269 | Divya +91 93479 67774

Warm regards,
Radhakrishna Thatavarti
Founder & CEO
OXYLOANS`;

const LENDER_TEMPLATE_IDEAS = [
  {
    title: "Registration Preference",
    subject: "Please Confirm Your OXYLOANS Registration Preference",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Thank you for registering with OXYLOANS. We noticed that your account is active, but we would like to confirm whether you registered as a *Lender* or as a *Borrower* so we can share the most relevant opportunities with you.

If you registered as a Lender, you can start earning attractive monthly returns by participating in verified lending opportunities on our RBI-approved P2P-NBFC platform. If you registered as a Borrower, our team can guide you through suitable loan options based on your requirement.

Please reply to this email with your preference, or log in to https://oxyloans.com/ and update your profile so we can assist you with the right next step.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

We would like to confirm whether you registered on OXYLOANS as a *Lender* or *Borrower*. This helps us share the right opportunities with you.

Lenders can earn attractive returns by participating in verified deals. Borrowers can explore suitable loan options with our team's support.

Please reply with your preference or visit https://oxyloans.com/ to update your profile.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Lending Opportunities",
    subject: "Explore Current Lending Opportunities on OXYLOANS",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

OXYLOANS currently has active lending opportunities available for registered lenders. As a 10-year-old RBI-approved P2P-NBFC platform, we connect verified borrowers with lenders who wish to participate in structured lending deals.

Our active lenders are currently earning returns in the range of 1.7% to 2.0% per month (approximately 18% to 23% per annum), depending on the deal structure and tenure. You can review deal details, borrower profiles, and participation terms directly from your lender dashboard.

We encourage you to log in today, review the opportunities that match your preference, and take your first step toward active participation on the platform.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Active lending opportunities are now available on OXYLOANS for registered lenders. Review deal details, returns, and participation terms from your dashboard.

Our lenders are earning approximately 1.7% to 2.0% per month on suitable deals. Log in today to explore and participate.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Lender Account Activation",
    subject: "Activate Your OXYLOANS Lender Account",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Your OXYLOANS lender registration is on record, but your account still appears to be pending full activation for deal participation. To begin lending on the platform, please complete any remaining profile, verification, or wallet-related steps shown in your account.

Once your lender account is fully activated, you will be able to browse live deals, review borrower information, and confirm your participation based on your lending preference. Our operations team is available to guide you through each step if anything is unclear.

Please log in to https://oxyloans.com/ today and complete the pending activation steps so you do not miss current lending opportunities.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Your OXYLOANS lender account appears pending full activation. Please log in and complete any remaining profile or verification steps so you can start participating in live deals.

Our team can guide you through activation if needed.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Attractive Returns",
    subject: "Earn Attractive Returns with OXYLOANS",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Many lenders on OXYLOANS are currently earning attractive returns by participating in verified lending opportunities through our platform. Depending on the deal, lenders have been earning approximately 1.7% to 2.0% per month, which translates to roughly 18% to 23% per annum.

OXYLOANS is a 10-year-old RBI-approved P2P-NBFC lending platform built to help lenders review opportunities transparently and participate with clarity on deal terms. You can compare available deals, review tenure and return structure, and choose what suits your lending preference.

We invite you to log in, review the current opportunities, and consider participating in a deal that aligns with your goals.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Lenders on OXYLOANS are earning approximately *1.7% to 2.0% per month* on suitable deals. Review live opportunities, compare terms, and participate from your dashboard.

Log in today to explore current lending options on our RBI-approved platform.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Lender Portfolio Review",
    subject: "Review Your OXYLOANS Lender Portfolio",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

We request you to take a few minutes to review your OXYLOANS lender account and portfolio position. Even if you have not yet participated in a deal, your dashboard provides a clear view of your registration status, wallet readiness, and currently available lending opportunities.

Reviewing your account now will help you understand what is pending, what is ready, and which new deals may be suitable for your lending preference. This is the best way to move from registration to active participation.

Please log in to https://oxyloans.com/ and review your lender portfolio and available opportunities at your convenience.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Please review your OXYLOANS lender account and portfolio position. Your dashboard shows registration status, wallet readiness, and available deals.

Log in today to understand pending steps and explore suitable lending opportunities.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "New Deals Available",
    subject: "New Lending Opportunities Are Now Available",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

We are pleased to inform you that new lending opportunities have been listed on OXYLOANS. These deals are open for review by registered lenders and include details on tenure, return structure, and participation requirements.

If you have been waiting for the right opportunity to begin or continue lending on the platform, this is a good time to log in and review the newly available deals. Early review helps you understand the options before participation slots fill up.

Please visit https://oxyloans.com/, review the new deals in your lender dashboard, and confirm your participation based on your preference.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

*New lending opportunities* are now listed on OXYLOANS. Review tenure, returns, and participation details from your lender dashboard.

Log in today and choose a deal that matches your preference.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Lender Re-engagement",
    subject: "Welcome Back to OXYLOANS Lending",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

We noticed that you registered with OXYLOANS as a lender but have not yet participated in a lending opportunity. We would be delighted to welcome you back and help you restart your lending journey on the platform.

OXYLOANS continues to list verified deals for lenders who want to earn structured returns through an RBI-approved P2P-NBFC platform. Whether you paused due to timing, documentation, or account setup, our team can help you complete the next step.

Please log in to review current opportunities, or reply to this email if you would like personal assistance in reactivating your lender participation.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

We noticed you registered as a lender on OXYLOANS but have not yet participated. We would love to help you restart your lending journey.

Log in to review current deals or reply if you need assistance completing the next step.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "RBI-Approved Platform",
    subject: "Lend Through a 10-Year-Old RBI-Approved P2P Platform",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

OXYLOANS is a 10-year-old RBI-approved P2P-NBFC lending platform built to connect verified borrowers with registered lenders in a structured and transparent manner. If you are exploring a reliable platform for lending participation, OXYLOANS offers deal-level visibility, platform oversight, and operational support.

As a registered lender, you can review borrower-linked opportunities, understand the deal terms clearly, and participate based on your comfort and lending preference. Many lenders choose OXYLOANS because of our long operating history and regulated platform framework.

We invite you to log in, review how lending works on OXYLOANS, and explore the opportunities currently open for participation.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

OXYLOANS is a *10-year-old RBI-approved P2P-NBFC platform* connecting verified borrowers with registered lenders. Review deal terms transparently and participate based on your preference.

Log in today to explore how lending works on OXYLOANS.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Lender Assistance",
    subject: "Assistance with Your OXYLOANS Lender Account",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

If you need help understanding your OXYLOANS lender account, wallet setup, verification process, or available lending opportunities, our team is ready to assist you.

Many lenders prefer a quick walkthrough before their first participation. We can help you understand how to review deals, what documents or steps may be pending, and how to complete participation from your dashboard.

Please reply to this email with your question, or contact Manikanta at +91 81061 77269 or Divya at +91 93479 67774. You may also log in to https://oxyloans.com/ and review your account while our team supports you.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Need help with your OXYLOANS lender account, verification, wallet setup, or deal participation? Our team is ready to guide you.

Reply here or contact Manikanta +91 81061 77269 | Divya +91 93479 67774.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Participation Reminder",
    subject: "Reminder: Review Today’s OXYLOANS Lending Opportunities",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

This is a gentle reminder to review today's lending opportunities on OXYLOANS. Registered lenders who actively review new deals are better placed to choose opportunities that match their preferred tenure, return expectation, and participation capacity.

Your lender dashboard provides access to current deals, account readiness, and participation options. Taking action today can help you move from registration to active lending on the platform.

Please log in to https://oxyloans.com/ at your earliest convenience and confirm whether you would like to participate in any of the opportunities currently available.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Gentle reminder to review *today's lending opportunities* on OXYLOANS. Log in to your lender dashboard, check available deals, and confirm participation if suitable.

We are here to help if you need assistance.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
];

const BORROWER_TEMPLATE_IDEAS = [
  {
    title: "Borrower Registration",
    subject: "Complete Your OXYLOANS Borrower Registration",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Thank you for your interest in OXYLOANS. Your borrower registration is on record, but a few steps may still be pending before our team can review your loan requirement in detail.

Please log in to https://oxyloans.com/ and complete your borrower profile, contact details, and any required information shown in your dashboard. Once completed, our team can guide you on suitable borrowing options available through the platform.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Please complete your OXYLOANS borrower registration and pending profile details so our team can review your loan requirement.

Log in at https://oxyloans.com/ or reply if you need help.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Loan Opportunities",
    subject: "Explore Loan Opportunities Available on OXYLOANS",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

OXYLOANS helps eligible borrowers explore structured loan opportunities through an RBI-approved P2P-NBFC platform. Based on your registration, you may now review borrowing options and understand the next steps for your requirement.

Please log in to your borrower dashboard, review the information requested for your application, and connect with our team if you need help choosing the right path for your loan journey.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Explore loan opportunities on OXYLOANS and review the next steps for your borrowing requirement from your dashboard.

Visit https://oxyloans.com/ or reply for assistance.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Application Completion",
    subject: "Complete Your Pending OXYLOANS Loan Application",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Your OXYLOANS loan application appears to be incomplete. To avoid delays in review, please log in and submit the pending details requested in your borrower account.

Our team can only proceed once the required information and documents are complete. If you are unsure what is pending, reply to this email and we will guide you step by step.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Your OXYLOANS loan application is still pending completion. Please log in and submit the remaining details so our team can review your requirement.

Reply if you need help identifying pending steps.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Profile Verification",
    subject: "Action Required: Verify Your OXYLOANS Borrower Profile",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Action is required on your OXYLOANS borrower profile. Please review and verify the information in your account so we can continue processing your loan requirement without delay.

Verified borrower details help us assess eligibility accurately and share the most suitable next steps. Log in today and complete any profile or document verification shown as pending.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Please verify your OXYLOANS borrower profile and complete any pending verification steps shown in your account.

Log in today or reply for assistance.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Eligibility Review",
    subject: "Review Your Loan Eligibility on OXYLOANS",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

We invite you to review your loan eligibility and application status on OXYLOANS. Your borrower dashboard shows what has been submitted, what is pending, and what our team needs to proceed.

If you would like help understanding your eligibility or the documents required, our support team is available to assist you.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Review your loan eligibility and application status on OXYLOANS from your borrower dashboard.

Reply if you need help understanding the next required step.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Document Reminder",
    subject: "Reminder: Complete Your Borrower Documents",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

This is a reminder to upload or confirm the borrower documents and details still pending in your OXYLOANS account. Incomplete documentation is the most common reason for delay in loan application review.

Please log in today, review the pending checklist, and submit the required information so our team can move your application forward.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Reminder: please complete pending borrower documents in your OXYLOANS account so your application can be reviewed without delay.

Log in today or reply for help.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Borrower Re-engagement",
    subject: "Continue Your Loan Journey with OXYLOANS",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

We noticed that your borrowing journey on OXYLOANS was started but not yet completed. If you still require a loan or wish to continue your application, we would be happy to help you take the next step.

Please log in to review your application status, complete pending actions, and reconnect with our team for guidance on suitable borrowing options.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Continue your loan journey on OXYLOANS by reviewing your application status and completing pending steps.

Log in or reply if you would like our team's assistance.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Trusted Platform",
    subject: "Borrow Through OXYLOANS — An RBI-Approved P2P Platform",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

OXYLOANS is a 10-year-old RBI-approved P2P-NBFC platform that helps eligible borrowers explore loan opportunities in a structured and transparent environment.

If you are evaluating a reliable platform for your borrowing requirement, we invite you to log in, review the application process, and connect with our team for any clarifications you may need.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Borrow through OXYLOANS, a *10-year-old RBI-approved P2P-NBFC platform*. Review the application process and next steps from your dashboard.

Visit https://oxyloans.com/ or reply for assistance.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Borrower Assistance",
    subject: "Need Help with Your OXYLOANS Loan Application?",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

If you need help with your OXYLOANS borrower account, application status, eligibility, or document submission, our team is ready to support you.

Please reply to this email with your question, or contact Manikanta at +91 81061 77269 or Divya at +91 93479 67774. You may also log in to https://oxyloans.com/ while our team guides you through the next step.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Need help with your OXYLOANS loan application? Reply here or contact Manikanta +91 81061 77269 | Divya +91 93479 67774.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Application Reminder",
    subject: "Reminder: Review Your OXYLOANS Borrower Account",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

This is a reminder to review your OXYLOANS borrower account today. Your dashboard shows your current application status, pending actions, and the information required to move forward.

Taking action now can help avoid delays and allow our team to review your loan requirement promptly.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Reminder to review your OXYLOANS borrower account today and complete any pending application steps.

Log in or reply if you need assistance.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
];

const REFERRAL_TEMPLATE_IDEAS = [
  {
    title: "Referral Account Update",
    subject: "Important Update on Your OXYLOANS Referral Account",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

We request you to review your OXYLOANS referral account and the members you have introduced to our platform. Your dashboard provides visibility into registrations, participation status, and referral-linked activity.

Please log in to https://oxyloans.com/ and review your referral summary so you can follow up with interested members and track progress accurately.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Please review your OXYLOANS referral account and the members you have introduced. Your dashboard shows registrations and participation status.

Log in today or reply for assistance.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Referral Activity",
    subject: "Review Your OXYLOANS Referral Activity",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Your referral activity on OXYLOANS includes registrations, follow-up status, and participation progress for the members you have introduced. Reviewing this information regularly helps you support your network more effectively.

Please log in today and review your referral dashboard for the latest activity update.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Review your latest OXYLOANS referral activity, including registrations and participation progress, from your referral dashboard.

Visit https://oxyloans.com/ today.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Referral Earnings",
    subject: "Review Your OXYLOANS Referral Earnings",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

You can review your eligible referral earnings, paid amount, and any pending referral-linked amount directly from your OXYLOANS referral dashboard.

We encourage you to log in, verify your referral earnings summary, and contact our team if you need clarification on any referral payout or pending status.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Review your OXYLOANS referral earnings, paid amount, and pending referral status from your dashboard.

Reply if you need clarification on any payout detail.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Invite New Members",
    subject: "Invite More Members to the OXYLOANS Community",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

OXYLOANS values referrers who introduce eligible lenders and borrowers to our growing community. If you know members who may benefit from the platform, you can continue expanding your referral network and track their progress from your dashboard.

Please log in to review your referral tools and invite suitable lenders or borrowers who may be interested in OXYLOANS.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Invite eligible lenders and borrowers to OXYLOANS and track their registration and participation from your referral dashboard.

Log in today to continue growing your referral network.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Registered Referrals",
    subject: "Your Registered OXYLOANS Referrals — Next Steps",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Some of your referred members have registered on OXYLOANS but may still need guidance to complete their profile and participate on the platform. Your follow-up can help them take the next step.

Please log in, review your registered referrals, and encourage them to complete pending actions so they can become active members of the OXYLOANS community.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Some of your referred members have registered but may still need follow-up. Review your registered referrals and help them complete pending profile and participation steps.

Log in to your referral dashboard today.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Participated Referrals",
    subject: "Update on Your Participated OXYLOANS Referrals",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

We invite you to review which of your referred members have participated on OXYLOANS and track their progress from your referral dashboard.

This update helps you understand referral outcomes, follow up where needed, and stay informed on the members you have introduced to the platform.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Review which of your referred members have participated on OXYLOANS and track their progress from your referral dashboard.

Log in today for the latest update.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Referral Re-engagement",
    subject: "Reconnect with Your OXYLOANS Referral Network",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

If you have referred members who registered but have not yet participated, this is a good time to reconnect with your referral network and help them take the next step on OXYLOANS.

Please log in to review your referrals and follow up with members who may need assistance completing their profile or participation.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Reconnect with your OXYLOANS referral network and follow up with registered members who have not yet participated.

Log in to review your referrals today.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Referral Recognition",
    subject: "Thank You for Growing the OXYLOANS Community",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Thank you for introducing new members to OXYLOANS and supporting the growth of our community. Referrers like you play an important role in helping eligible lenders and borrowers discover the platform.

We appreciate your continued support and invite you to log in to review your referral progress and identify further opportunities to grow your network.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Thank you for helping grow the OXYLOANS community through your referrals. Review your referral progress and continue supporting eligible members on the platform.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Referral Assistance",
    subject: "Need Help with Your OXYLOANS Referrals?",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

If you need help understanding referral registrations, participation tracking, or referral-linked earnings on OXYLOANS, our team is ready to assist you.

Please reply to this email with your question, or contact Manikanta at +91 81061 77269 or Divya at +91 93479 67774 for referral support.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Need help with your OXYLOANS referrals, earnings, or referral tracking? Reply here or contact Manikanta +91 81061 77269 | Divya +91 93479 67774.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
  {
    title: "Referral Reminder",
    subject: "Reminder: Review Your OXYLOANS Referral Dashboard",
    emailBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

This is a reminder to review your OXYLOANS referral dashboard today. Your latest registrations, participation status, and referral-linked activity are available in your account.

Please log in at your earliest convenience and follow up with members who may need your guidance to complete the next step.

${CAMPAIGN_EMAIL_FOOTER}`,
    whatsappBody: `Dear $name,

Greetings from Radhakrishna Thatavarti!

Reminder to review your OXYLOANS referral dashboard today and follow up with members who need guidance to complete the next step.

Log in or reply for assistance.

${CAMPAIGN_WHATSAPP_FOOTER}`,
  },
];

const buildCampaignTemplates = ({ segmentLabel, audienceLabel, channel }) => {
  const segmentText = String(segmentLabel || "Selected segment").trim();
  const isReferralAudience = /referr|invite/i.test(segmentText);
  const isBorrowerAudience = audienceLabel === "borrowers";
  const templateIdeas = isReferralAudience
    ? REFERRAL_TEMPLATE_IDEAS
    : isBorrowerAudience
      ? BORROWER_TEMPLATE_IDEAS
      : LENDER_TEMPLATE_IDEAS;

  return templateIdeas.map((idea, index) => ({
      id: `template-${index + 1}`,
      number: index + 1,
      title: idea.title,
      subject: idea.subject,
    message: channel === "whatsapp" ? idea.whatsappBody : idea.emailBody,
  }));
};

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const buildFailedDeliveriesExcelXml = (rows) => {
  const headers = ["Sent At", "Lender ID", "Lender Name", "Email", "Mobile", "Recipient", "Channel", "Status", "Error"];
  const headerXml = headers.map((title) => `<Cell><Data ss:Type="String">${escapeXml(title)}</Data></Cell>`).join("");
  const rowXml = rows
    .map((row) => {
      const cells = [
        row.sentAt || "",
        row.lenderId ? `LR${row.lenderId}` : "",
        row.lenderName || "",
        row.email || "",
        row.mobileNumber || "",
        row.recipient || row.email || row.mobileNumber || "",
        row.channel || "",
        row.status || "",
        row.errorMessage || "",
      ];
      return `<Row>${cells.map((cell) => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join("")}</Row>`;
    })
    .join("");
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
<Worksheet ss:Name="Failed Users">
<Table>
<Row>${headerXml}</Row>
${rowXml}
</Table>
</Worksheet>
</Workbook>`;
};

const isAiErrorText = (text) => {
  const value = String(text || "").trim().toLowerCase();
  if (!value) return true;
  return value.startsWith("gemini")
    || value.includes("service error")
    || value.includes("temporarily unavailable")
    || value.includes("parse error")
    || value.includes("unexpected format")
    || value.includes("not configured");
};

const personalizePreview = (message, sampleName = TEST_PREVIEW_NAME, sampleMobile = TEST_PREVIEW_MOBILE) =>
  formatWhatsAppText(
    String(message || "")
      .replace(/\$name/g, sampleName)
      .replace(/\$mobileNumber/g, sampleMobile)
  );

const renderWhatsAppBody = (text) =>
  String(text || "")
    .split(/(\*[^*\n]+\*)/g)
    .map((part, index) => {
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return <strong key={index}>{part.slice(1, -1)}</strong>;
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });

const nowInIst = () => {
  const now = new Date();
  return {
    date: now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
    time: now.toLocaleTimeString("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
};

const defaultScheduleDate = () => nowInIst().date;

const defaultScheduleTime = () => {
  const ist = nowInIst();
  const [hh, mm] = ist.time.split(":").map(Number);
  const totalMin = (hh * 60) + mm + 15;
  const nextHour = Math.floor(totalMin / 60) % 24;
  const nextMinute = totalMin % 60;
  return `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;
};

const formatSchedulePreview = (scheduleDate, scheduleTime) => {
  if (!scheduleDate || !scheduleTime) return "";
  const normalizedTime = scheduleTime.length >= 5 ? scheduleTime.slice(0, 5) : scheduleTime;
  const instant = new Date(`${scheduleDate}T${normalizedTime}:00+05:30`);
  if (Number.isNaN(instant.getTime())) return "";
  return instant.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
};

const AdminAILenderCampaignModal = ({
  open,
  onClose,
  onSent,
  segment,
  segmentLabel,
  recipientCount = 0,
  initialChannel = "email",
  campaignSetCount = 3,
  audienceType = "lenders",
  targetLender = null,
  customEmails = null,
}) => {
  const navigate = useNavigate();
  const excelEmailList = Array.isArray(customEmails)
    ? [...new Set(customEmails.map((v) => String(v || "").trim().toLowerCase()).filter((v) => v.includes("@")))]
    : [];
  const isExcelCampaign = excelEmailList.length > 0 || segment === "excelUpload";
  // Kept for compatibility with hot-reload / older modal paths (Excel no longer uses Send Test).
  const excelTestEmail = excelEmailList[0] || "";
  const audienceLabel = audienceType === "borrowers" ? "borrowers" : isExcelCampaign ? "Excel emails" : "lenders";
  const isIndividualLender = Boolean(targetLender?.lenderId) && !isExcelCampaign;
  const individualLabel = isIndividualLender
    ? `LR${targetLender.lenderId}${targetLender.name ? ` — ${targetLender.name}` : ""}`
    : "";
  const [channel, setChannel] = useState(initialChannel);
  const [projectType, setProjectType] = useState("oxyloans");
  const [messageMode, setMessageMode] = useState("templates");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [customTemplates, setCustomTemplates] = useState([]);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [customTemplateTitle, setCustomTemplateTitle] = useState("");
  const [customTemplateSubject, setCustomTemplateSubject] = useState("");
  const [customTemplateMessage, setCustomTemplateMessage] = useState("");
  const [contentSource, setContentSource] = useState("manual");
  const [aiPrompt, setAiPrompt] = useState("");
  const [message, setMessage] = useState("");
  const [mailSubject, setMailSubject] = useState("Update from OxyLoans");
  const [whatsappSubject, setWhatsappSubject] = useState("Update from OxyLoans");
  const [testEmail, setTestEmail] = useState("");
  const [testMobile, setTestMobile] = useState("");
  const [mailDisplayName, setMailDisplayName] = useState("OxyLoans");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFileName, setLogoFileName] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sendingAction, setSendingAction] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [testVerified, setTestVerified] = useState(false);
  const [scheduledTestQueued, setScheduledTestQueued] = useState(false);
  const [useSchedule, setUseSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(defaultScheduleDate);
  const [scheduleTime, setScheduleTime] = useState(defaultScheduleTime);
  const [selectedSet, setSelectedSet] = useState("set1");
  const [lastSendResult, setLastSendResult] = useState(null);
  const [exportingFailed, setExportingFailed] = useState(false);
  const [liveRecipientCount, setLiveRecipientCount] = useState(0);
  const isWhatsapp = channel === "whatsapp";
  const totalRecipients = isIndividualLender
    ? 1
    : isExcelCampaign
      ? excelEmailList.length
      : Math.max(Number(recipientCount) || 0, Number(liveRecipientCount) || 0);
  const splitSetCount = Math.max(1, Number(campaignSetCount) || DEFAULT_CAMPAIGN_SET_COUNT);
  const shouldSplitCampaign = !isIndividualLender && channel === "email" && totalRecipients > 0;
  const setSize = shouldSplitCampaign ? Math.ceil(totalRecipients / splitSetCount) : 0;
  const campaignSets = useMemo(() => {
    if (!shouldSplitCampaign) {
      return [];
    }
    const primarySets = Array.from({ length: splitSetCount }, (_, index) => {
      const start = (index * setSize) + 1;
      const end = Math.min((index + 1) * setSize, totalRecipients);
      return {
        key: `set${index + 1}`,
        label: `Set ${index + 1}`,
        start,
        end,
        offset: index * setSize,
        maxRecipients: Math.max(0, end - start + 1),
      };
    }).filter((item) => item.maxRecipients > 0);
    return [
      ...primarySets,
      {
        key: `set${splitSetCount + 1}`,
        label: `Set ${splitSetCount + 1} (All Users)`,
        start: 1,
        end: totalRecipients,
        offset: 0,
        maxRecipients: totalRecipients,
        isAllUsers: true,
      },
    ];
  }, [setSize, shouldSplitCampaign, splitSetCount, totalRecipients]);
  const selectedCampaignSet = campaignSets.find((item) => item.key === selectedSet) || campaignSets[0] || null;

  const previewText = useMemo(() => {
    const text = personalizePreview(message);
    const withoutGreeting = text
      .replace(/^dear\s+[^\n]+,?\s*\n*/i, "")
      .replace(/^hi\s+[^\n]+,?\s*\n*/i, "")
      .trim();
    return stripSubjectFromPreview(withoutGreeting, whatsappSubject || mailSubject);
  }, [message, whatsappSubject, mailSubject]);
  const previewGreeting = `Dear ${TEST_PREVIEW_NAME},`;
  const brandLogo = logoUrl || defaultLogoForProject(projectType);
  const previewLogo = brandLogo;
  const deliverableLogo = resolveDeliverableLogoUrl(brandLogo, projectType);
  const whatsappPreviewImage = imageUrl || previewLogo;
  const campaignFingerprint = `${channel}|${projectType}|${mailSubject}|${whatsappSubject}|${message}|${imageUrl}|${logoUrl}|${mailDisplayName}`;
  const schedulePreview = useMemo(
    () => formatSchedulePreview(scheduleDate, scheduleTime),
    [scheduleDate, scheduleTime]
  );
  const campaignTemplates = useMemo(
    () => buildCampaignTemplates({ segmentLabel, audienceLabel, channel }),
    [segmentLabel, audienceLabel, channel]
  );
  const availableTemplates = useMemo(
    () => [
      ...campaignTemplates,
      ...customTemplates.map((template, index) => ({
        ...template,
        number: campaignTemplates.length + index + 1,
      })),
    ],
    [campaignTemplates, customTemplates]
  );

  const applyCampaignTemplate = (template) => {
    setSelectedTemplateId(template.id);
    setMessage(template.message);
    setMailSubject(template.subject);
    setWhatsappSubject(template.subject);
    setMessageMode("manual");
    setContentSource(template.custom ? "custom-template" : "built-in-template");
    setShowPreview(true);
    setError("");
    setStatus(`Template ${template.number} selected. Review or edit it below before Send Test.`);
  };

  const startManualMessage = () => {
    setMessageMode("manual");
    setContentSource("manual");
    setSelectedTemplateId("");
    setMessage("");
    setMailSubject("Update from OxyLoans");
    setWhatsappSubject("Update from OxyLoans");
    setShowPreview(false);
    setError("");
    setStatus("New manual message started. It is not saved automatically; use Add to Custom Content only if you approve it.");
  };

  const approveManualContentAsCustom = () => {
    const content = message.trim();
    if (!content) {
      setError("Enter the manual message before adding it to Custom Content.");
      return;
    }
    const suggestedTitle = channel === "email" ? mailSubject.trim() : whatsappSubject.trim();
    const title = window.prompt("Enter an official title for this Custom Content:", suggestedTitle || "Manual Campaign Content");
    if (!String(title || "").trim()) return;
    if (!window.confirm(`Add \"${String(title).trim()}\" to Custom Content for this segment?`)) return;
    const newTemplate = {
      id: `custom-template-${Date.now()}`,
      title: String(title).trim(),
      subject: suggestedTitle || String(title).trim(),
      message: content,
      custom: true,
    };
    const nextTemplates = [...customTemplates, newTemplate];
    setCustomTemplates(nextTemplates);
    try {
      localStorage.setItem(
        customTemplateStorageKey(segment, audienceType, channel),
        JSON.stringify(nextTemplates)
      );
    } catch {
      // Keep approved content available during the current session.
    }
    setContentSource("custom-template");
    setStatus(`Approved manual message added to Custom Content as template ${campaignTemplates.length + nextTemplates.length}.`);
    setError("");
  };

  const saveCustomTemplate = () => {
    const title = customTemplateTitle.trim();
    const subject = customTemplateSubject.trim();
    const content = customTemplateMessage.trim();
    if (!title || !content || (channel === "email" && !subject)) {
      setError(channel === "email"
        ? "Template title, email subject, and message are required."
        : "Template title and WhatsApp message are required.");
      return;
    }
    const nextTemplates = [
      ...customTemplates,
      {
        id: `custom-template-${Date.now()}`,
        title,
        subject: subject || title,
        message: content,
        custom: true,
      },
    ];
    setCustomTemplates(nextTemplates);
    try {
      localStorage.setItem(
        customTemplateStorageKey(segment, audienceType, channel),
        JSON.stringify(nextTemplates)
      );
    } catch {
      // The template is still usable for this session if browser storage is unavailable.
    }
    setCustomTemplateTitle("");
    setCustomTemplateSubject("");
    setCustomTemplateMessage("");
    setShowAddTemplate(false);
    setError("");
    setStatus(`New ${channel === "email" ? "email" : "WhatsApp"} content added as template ${campaignTemplates.length + nextTemplates.length}.`);
  };

  useEffect(() => {
    if (!open) return;
    setChannel(isExcelCampaign ? "email" : initialChannel);
    setProjectType("oxyloans");
    setMailDisplayName(PROJECT_TYPES.find((option) => option.id === "oxyloans")?.displayName || "OxyLoans");
    setLogoUrl("");
    setLogoFileName("");
    setMessageMode("templates");
    setSelectedTemplateId("");
    setContentSource("manual");
    setShowAddTemplate(false);
    setCustomTemplateTitle("");
    setCustomTemplateSubject("");
    setCustomTemplateMessage("");
    setAiPrompt("");
    setMessage("");
    setMailSubject("Update from OxyLoans");
    setWhatsappSubject("Update from OxyLoans");
    if (isExcelCampaign) {
      setTestEmail("");
      setTestMobile("");
    } else if (isIndividualLender) {
      setTestEmail(String(targetLender?.email || "").trim());
      setTestMobile(String(targetLender?.mobileNumber || "").replace(/\D/g, ""));
    } else {
      setTestEmail("");
      setTestMobile("");
    }
    setImageUrl("");
    setImageFileName("");
    setStatus("");
    setError("");
    setShowPreview(false);
    setTestVerified(Boolean(isIndividualLender || isExcelCampaign));
    setScheduledTestQueued(false);
    setUseSchedule(false);
    setScheduleDate(defaultScheduleDate());
    setScheduleTime(defaultScheduleTime());
    setSelectedSet("set1");
    setLastSendResult(null);
    setExportingFailed(false);
    try {
      const stored = sessionStorage.getItem(scheduleTestStorageKey(segment));
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.scheduledAtDisplay) {
          setScheduledTestQueued(true);
          setUseSchedule(true);
          setStatus(`Test already scheduled for ${parsed.scheduledAtDisplay}. Confirm below after it arrives.`);
        }
      }
    } catch {
      // ignore invalid session storage
    }
  }, [open, initialChannel, segment, segmentLabel, isIndividualLender, isExcelCampaign, targetLender?.lenderId, targetLender?.email, targetLender?.mobileNumber, targetLender?.name]);

  useEffect(() => {
    if (!open) return;
    try {
      const stored = localStorage.getItem(customTemplateStorageKey(segment, audienceType, channel));
      const parsed = stored ? JSON.parse(stored) : [];
      setCustomTemplates(Array.isArray(parsed) ? parsed : []);
    } catch {
      setCustomTemplates([]);
    }
    setShowAddTemplate(false);
  }, [open, segment, audienceType, channel]);

  useEffect(() => {
    if (!open || !segment) {
      setLiveRecipientCount(0);
      return;
    }
    if (isIndividualLender) {
      setLiveRecipientCount(1);
      return;
    }
    if (isExcelCampaign) {
      setLiveRecipientCount(excelEmailList.length);
      return;
    }
    const initialCount = Number(recipientCount) || 0;
    setLiveRecipientCount(initialCount);
    if (initialCount > 0) {
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const payload = await getAdminAILenderAnalyticsLenders(segment, 1, 1);
        const data = payload?.data ?? payload;
        const count = Number(data?.totalCount ?? data?.segmentTotalCount ?? 0);
        if (!cancelled && count > 0) {
          setLiveRecipientCount(count);
        }
      } catch {
        // keep dashboard-provided count fallback
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, recipientCount, segment, isIndividualLender, isExcelCampaign, excelEmailList.length]);

  useEffect(() => {
    setTestVerified(false);
  }, [campaignFingerprint]);

  useEffect(() => {
    setTestVerified(false);
  }, [testMobile, testEmail]);

  useEffect(() => {
    if (useSchedule) {
      setTestVerified(false);
      setScheduledTestQueued(false);
      setStatus("");
    }
  }, [useSchedule]);

  if (!open) {
    return null;
  }

  const openFailedUsersPage = (result = lastSendResult) => {
    if (!result?.batchId) return;
    const params = new URLSearchParams();
    if (segment) params.set("segment", segment);
    params.set("segmentLabel", segmentLabel || segment || "All segments");
    params.set("batchId", result.batchId);
    params.set("filter", "failed");
    if (result?.failedCount != null) params.set("failedCount", String(result.failedCount));
    if (result?.sentCount != null) params.set("successCount", String(result.sentCount));
    if (mailSubject) params.set("campaignTitle", mailSubject);
    navigate(`/adminAICampaignHistory?${params.toString()}`);
    onClose?.();
  };

  const downloadFailedUsersExcel = async (result = lastSendResult) => {
    if (!result?.batchId || exportingFailed) return;
    setExportingFailed(true);
    setError("");
    try {
      const rows = (await fetchAllCampaignFailedDeliveries(result.batchId)).filter(isCampaignDeliveryFailed);
      if (!rows.length) {
        setError("No failed users found for this campaign batch.");
        return;
      }
      const xml = buildFailedDeliveriesExcelXml(rows);
      saveAs(
        new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" }),
        `campaign-failed-${result.batchId}.xls`
      );
      setStatus(`Downloaded ${rows.length} failed user(s) as Excel.`);
    } catch (err) {
      setError(err?.message || "Failed to download failed users.");
    } finally {
      setExportingFailed(false);
    }
  };

  const rememberSendResult = (data, dryRun) => {
    if (dryRun || !data?.batchId) return;
    const failedCount = Number(data?.failedCount) || 0;
    if (failedCount <= 0) {
      setLastSendResult(null);
      return;
    }
    setLastSendResult({
      batchId: data.batchId,
      failedCount,
      sentCount: Number(data?.sentCount) || 0,
      segment,
      segmentLabel,
    });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setStatus("");
    try {
      const data = await generateAdminAILenderCampaignMessage({
        segment,
        segmentLabel,
        channel,
        projectType,
        aiPrompt,
      });
      const generated = data?.message || "";
      const usableMessage = generated && !isAiErrorText(generated) ? generated : "";
      if (!usableMessage) {
        setError(data?.error || data?.backendError || generated || "AI generation failed. Try again or type the message manually.");
        return;
      }
      setMessage(usableMessage);
      setContentSource("ai");
      if (data?.suggestedMailSubject) {
        setMailSubject(data.suggestedMailSubject);
      }
      if (data?.suggestedWhatsappSubject) {
        setWhatsappSubject(data.suggestedWhatsappSubject);
      } else if (data?.suggestedMailSubject) {
        setWhatsappSubject(data.suggestedMailSubject);
      }
      if (data?.status === "FAILED" || data?.aiGenerated === false) {
        setStatus("Default template loaded. AI was unavailable — please review and edit before sending.");
      } else {
        setStatus("AI message generated. You can edit before sending.");
      }
      setMessageMode("manual");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to generate AI message.");
    } finally {
      setGenerating(false);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload a logo image file (PNG, JPG, etc.).");
      return;
    }
    setUploadingLogo(true);
    setError("");
    setLogoFileName(file.name);
    try {
      const url = await uploadAdminAILenderCampaignImage(file);
      if (!isPublicHttpUrl(url)) {
        throw new Error("Upload did not return a public https logo URL.");
      }
      setLogoUrl(url);
      setStatus("Custom campaign logo uploaded.");
    } catch (err) {
      setLogoUrl("");
      setLogoFileName("");
      setError(err?.response?.data?.message || err?.message || "Failed to upload logo.");
    } finally {
      setUploadingLogo(false);
      event.target.value = "";
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, etc.).");
      return;
    }
    setUploadingImage(true);
    setError("");
    try {
      const url = await uploadAdminAILenderCampaignImage(file);
      setImageUrl(url);
      setImageFileName(file.name);
      setStatus(channel === "whatsapp"
        ? "Image uploaded. It will be sent as the WhatsApp campaign card."
        : "Banner image uploaded. It will appear below the logo in the email.");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleSend = async (dryRun = false, campaignWindow = null, skipConfirm = false, keepOpen = false) => {
    const activeSet = campaignWindow || selectedCampaignSet;
    const normalizedMessage = String(message || "").replace(/\u00a0/g, " ");
    const trimmedMessage = channel === "email"
      ? formatEmailMessage(normalizedMessage)
      : formatWhatsAppText(normalizedMessage);
    if (!trimmedMessage) {
      setError("Please enter or generate a message first.");
      return;
    }
    if (channel === "email" && !String(mailSubject || "").trim()) {
      setError("Email subject is required.");
      return;
    }
    if (channel === "email" && !String(mailDisplayName || "").trim()) {
      setError("Mail Display Name is required.");
      return;
    }
    if (dryRun && channel === "whatsapp" && useSchedule) {
      if (!scheduleDate || !scheduleTime) {
        setError("Select schedule date and time (24-hour IST) for the scheduled test.");
        return;
      }
    }
    if (dryRun && channel === "email" && !isExcelCampaign && !String(testEmail || "").trim()) {
      setError("Enter a test email address for Send Test.");
      return;
    }
    if (dryRun && isExcelCampaign) {
      setError("Excel campaigns do not use Send Test. Choose content and send to all Excel emails.");
      return;
    }
    if (dryRun && channel === "whatsapp" && !String(testMobile || "").trim()) {
      setError("Enter a test WhatsApp mobile number for Send Test.");
      return;
    }

    if (!dryRun && !testVerified && !isIndividualLender && !isExcelCampaign) {
      setError(
        useSchedule && channel === "whatsapp"
          ? "Schedule a test first, wait until it arrives at your chosen IST time, then confirm below before scheduling bulk."
          : `Please run Send Test first and confirm you received the message before sending to all ${audienceLabel}.`
      );
      return;
    }

    if (!dryRun && channel === "whatsapp" && useSchedule && !isIndividualLender) {
      if (!scheduleDate || !scheduleTime) {
        setError("Select schedule date and time (24-hour) for bulk send.");
        return;
      }
    }

    if (dryRun && channel === "whatsapp" && useSchedule && !String(testMobile || "").trim()) {
      setError("Enter your test WhatsApp number for the scheduled test.");
      return;
    }

    const setText = !dryRun && activeSet && shouldSplitCampaign
      ? ` (${activeSet.label}: ${fmtNum(activeSet.start)}-${fmtNum(activeSet.end)})`
      : "";
    const confirmText = isIndividualLender && !dryRun
      ? channel === "whatsapp"
        ? `Send WhatsApp now to ${individualLabel} (${targetLender?.mobileNumber || "no mobile"})?`
        : `Send email now to ${individualLabel} (${targetLender?.email || "no email"})?`
      : dryRun
      ? channel === "email"
        ? `Send a test email to ${testEmail.trim()}?`
        : useSchedule
          ? `Schedule test WhatsApp to ${testMobile.trim()} at ${schedulePreview || `${scheduleDate} ${scheduleTime}`} IST?\n\nNothing sends now — only at that time.`
          : `Send a test WhatsApp to ${testMobile.trim()} now?`
      : channel === "whatsapp" && useSchedule
        ? `Schedule bulk WhatsApp to ${fmtNum(totalRecipients)} ${audienceLabel} at ${schedulePreview || `${scheduleDate} ${scheduleTime}`} IST?\n\nNothing sends now — only at that time.`
        : channel === "whatsapp"
          ? `Send WhatsApp now to ${fmtNum(totalRecipients)} ${audienceLabel} in "${segmentLabel}"?`
          : isExcelCampaign
            ? `Send email now to all ${fmtNum(totalRecipients)} Excel emails and track opens/clicks?`
            : `Send email to ${fmtNum(totalRecipients)} ${audienceLabel} in "${segmentLabel}" now${setText}?`;
    if (!skipConfirm && !window.confirm(confirmText)) {
      return;
    }

    setSendingAction(dryRun ? "test" : "bulk");
    setError("");
    setStatus("");
    const isScheduledWhatsApp = !isIndividualLender && channel === "whatsapp" && useSchedule;
    try {
      const data = await sendAdminAILenderSegmentCampaign({
        segment: isExcelCampaign ? "excelUpload" : segment,
        segmentLabel: isIndividualLender
          ? `Individual Active Lender — ${individualLabel}`
          : isExcelCampaign
            ? (segmentLabel || `Excel Upload (${excelEmailList.length} emails)`)
            : segmentLabel,
        channel,
        projectType,
        mailDisplayName: String(mailDisplayName || "").trim() || "OxyLoans",
        message: trimmedMessage,
        mailSubject,
        whatsappSubject,
        imageUrl: channel === "email" ? (imageUrl || undefined) : undefined,
        logoUrl: deliverableLogo || undefined,
        testEmail: dryRun && channel === "email" && !isExcelCampaign ? testEmail.trim() : undefined,
        testMobile: channel === "whatsapp" && (dryRun || isScheduledWhatsApp) ? testMobile.trim() : undefined,
        dryRun: dryRun && !isScheduledWhatsApp,
        scheduleSend: Boolean(isScheduledWhatsApp),
        scheduleTestOnly: Boolean(dryRun && isScheduledWhatsApp),
        scheduleDate: isScheduledWhatsApp ? scheduleDate : undefined,
        scheduleTime: isScheduledWhatsApp
          ? (scheduleTime ? scheduleTime.slice(0, 5) : undefined)
          : undefined,
        recipientCount: isScheduledWhatsApp || isIndividualLender || isExcelCampaign ? totalRecipients : undefined,
        maxRecipients: !isIndividualLender && !dryRun && activeSet && !activeSet.isAllUsers ? activeSet.maxRecipients : undefined,
        recipientOffset: !isIndividualLender && !dryRun && activeSet && !activeSet.isAllUsers ? activeSet.offset : undefined,
        targetLenderId: isIndividualLender && !dryRun ? Number(targetLender.lenderId) : undefined,
        customEmails: isExcelCampaign ? excelEmailList : undefined,
      });
      const deliveryError = Array.isArray(data?.deliveryResults)
        ? data.deliveryResults.find((row) => row?.errorMessage)?.errorMessage
        : "";
      const recipient = Array.isArray(data?.deliveryResults)
        ? data.deliveryResults[0]?.recipient || data.deliveryResults[0]?.email || data.deliveryResults[0]?.mobileNumber
        : "";
      const notifySent = (payload) => onSent?.(payload, { dryRun });
      if (isScheduledWhatsApp) {
        if (data?.status === "SCHEDULED") {
          const isTestSchedule = Boolean(data?.scheduleTestOnly || dryRun);
          if (isTestSchedule) {
            try {
              sessionStorage.setItem(scheduleTestStorageKey(segment), JSON.stringify({
                scheduledAtDisplay: data?.scheduledAtDisplay || schedulePreview,
                testMobile: testMobile.trim(),
              }));
            } catch {
              // ignore quota errors
            }
            setStatus(data?.message || `Test WhatsApp scheduled for ${data?.scheduledAtDisplay || schedulePreview}.`);
            setTestVerified(true);
            notifySent(data);
            // Keep modal open after Schedule Test so user can proceed to bulk.
          } else {
            notifySent(data);
            onClose?.();
          }
        } else if (data?.status === "SUCCESS" && (data?.sentCount || 0) > 0) {
          setError(
            `WhatsApp was sent immediately at ${new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })} IST `
              + `instead of at ${schedulePreview || "your scheduled time"}. `
              + "Restart the backend, run migration v4, hard-refresh (Ctrl+Shift+R), then use Schedule Test again."
          );
          notifySent(data);
        } else {
          setError(
            data?.message
              || `Schedule failed (status: ${data?.status || "unknown"}). Enable the schedule checkbox and use Schedule Test — not Send Test.`
          );
          notifySent(data);
        }
      } else if (data?.status === "SCHEDULED") {
        const serverNow = data?.serverNowIst ? ` Server time now: ${data.serverNowIst}.` : "";
        setStatus((data?.message || `Scheduled for ${data?.scheduledAtDisplay || schedulePreview}.`) + serverNow);
        notifySent(data);
        if (!dryRun) {
          setTimeout(() => onClose?.(), 2500);
        } else {
          setTestVerified(true);
        }
      } else if (!useSchedule && dryRun && data?.status === "SUCCESS" && (data?.sentCount || 0) > 0) {
        const summary = data?.message || `Test sent to ${recipient || "your number"}.`;
        setStatus(channel === "whatsapp"
          ? `${summary} — Check WhatsApp, then use the green button to send or schedule for all ${audienceLabel}.`
          : `${summary} — Check your inbox, then send to all ${audienceLabel} when ready.`);
        setTestVerified(true);
        notifySent(data);
      } else if (data?.status === "SUCCESS" && (data?.sentCount || 0) > 0 && (data?.failedCount || 0) === 0) {
        const summary = data?.message || `Sent: ${fmtNum(data?.sentCount || 0)} | Failed: ${fmtNum(data?.failedCount || 0)}`;
        const detail = dryRun && recipient ? `${summary} (to ${recipient})` : summary;
        setStatus(dryRun && channel === "whatsapp"
          ? `${detail} — Check WhatsApp: ONE message with OxyLoans image and your text as caption below (not two separate messages).`
          : dryRun
            ? `${detail} — Check your inbox, then send to all ${audienceLabel} when ready.`
            : detail);
        if (dryRun) {
          setTestVerified(true);
        }
        rememberSendResult(data, dryRun);
        notifySent(data);
        if (!dryRun && !keepOpen) {
          setTimeout(() => onClose?.(), 2000);
        }
      } else if (dryRun) {
        const summary = data?.message || "Test send failed.";
        setError(deliveryError ? `${summary} — ${deliveryError}` : summary);
        setTestVerified(false);
        notifySent(data);
      } else {
        const summary = data?.message || `Sent: ${fmtNum(data?.sentCount || 0)} | Failed: ${fmtNum(data?.failedCount || 0)}`;
        setError(deliveryError ? `${summary} — ${deliveryError}` : summary || "Campaign send failed.");
        rememberSendResult(data, dryRun);
        notifySent(data);
      }
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Failed to send campaign.";
      setError(
        String(message).toLowerCase().includes("timeout")
          ? `${message} — Schedule should finish in seconds. Restart the backend, then try Schedule Test again.`
          : message
      );
    } finally {
      setSendingAction(null);
    }
  };

  const handleSendAllSets = async () => {
    if (!campaignSets.length) {
      return;
    }
    const splitSets = campaignSets.filter((item) => !item.isAllUsers);
    const ok = window.confirm(
      `Send email campaign in ${splitSets.length} sets (${splitSets.map((item) => item.label).join(", ")})?`
    );
    if (!ok) {
      return;
    }
    for (const setInfo of splitSets) {
      // eslint-disable-next-line no-await-in-loop
      await handleSend(false, setInfo, true, true);
    }
    setStatus(`All sets sent. Total recipients targeted: ${fmtNum(totalRecipients)}.`);
  };

  return (
    <div className="admin-ai-campaign-backdrop" onClick={onClose}>
      <section className="admin-ai-campaign-modal" onClick={(event) => event.stopPropagation()}>
        <div className="admin-ai-campaign-head">
          <div>
            <h5>{isIndividualLender ? "Individual Active Lender Campaign" : "Campaign Automation"}</h5>
            <p>
              {isIndividualLender
                ? `${individualLabel} · 1 lender · Email or WhatsApp to this lender only (no bulk / no auto schedule)`
                : isExcelCampaign
                  ? `${segmentLabel} · ${fmtNum(totalRecipients)} Excel emails · Compose and send (opens tracked)`
                  : `${segmentLabel} · ${fmtNum(totalRecipients)} ${audienceLabel} · ${
                      isWhatsapp && useSchedule
                        ? "Step 1: Schedule test · Step 2: Confirm test · Step 3: Schedule bulk"
                        : "Step 1: Send Test · Step 2: Send now or schedule"
                    }`}
            </p>
          </div>
          <button type="button" className="admin-ai-close-btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className={`admin-ai-pro-note ${isIndividualLender || isExcelCampaign || testVerified || scheduledTestQueued ? "admin-ai-campaign-test-ok" : ""}`}>
          <strong>
            {isIndividualLender
              ? "Individual send mode"
              : isExcelCampaign
                ? "Excel send mode"
              : isWhatsapp && useSchedule
              ? scheduledTestQueued
                ? "Test scheduled — waiting for IST time."
                : "Schedule mode — nothing sends on click."
              : testVerified
                ? "Test passed."
                : "Step 1: Send Test required."}
          </strong>{" "}
          {isIndividualLender
            ? `Choose a template or AI content, then send Email/WhatsApp only to ${individualLabel}. Optional Send Test still goes to the address/number you enter below.`
            : isExcelCampaign
              ? `No Send Test. Choose content and send to all ${fmtNum(totalRecipients)} Excel emails. Opens and clicks are tracked.`
            : isWhatsapp && useSchedule
            ? scheduledTestQueued
              ? `Test goes only to your number at ${schedulePreview || "your chosen time"} IST. After you receive it, check the box below, then schedule bulk.`
              : `Step 1: Schedule Test to your number at ${schedulePreview || "chosen time"} IST. Step 2: After test arrives, confirm and schedule bulk to all ${audienceLabel}.`
            : testVerified
              ? isWhatsapp
                ? "Step 2: Send WhatsApp to all now, or enable schedule below."
                : `You can now send the email campaign to all ${audienceLabel} in this segment.`
                : "Send Test to your number first. Send-all stays disabled until test succeeds."}
        </div>

        <div className="admin-ai-campaign-channel-tabs">
          <button type="button" className={channel === "email" ? "active" : ""} onClick={() => setChannel("email")}>
            <FaEnvelope /> Email
          </button>
          {!isExcelCampaign ? (
            <button type="button" className={channel === "whatsapp" ? "active" : ""} onClick={() => setChannel("whatsapp")}>
              <FaWhatsapp /> WhatsApp
            </button>
          ) : null}
        </div>

        <div className="admin-ai-campaign-grid">
          <label>
            Project Type *
            <select
              value={projectType}
              onChange={(event) => {
                const next = event.target.value;
                setProjectType(next);
                const matched = PROJECT_TYPES.find((option) => option.id === next);
                if (matched?.displayName) {
                  setMailDisplayName(matched.displayName);
                }
                // Reset to that project's default logo (OxyLoans → OxyLoans logo).
                setLogoUrl("");
                setLogoFileName("");
                setError("");
              }}
            >
              {PROJECT_TYPES.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            {isIndividualLender ? "Target Lender" : "Segment"}
            <input
              value={isIndividualLender ? individualLabel : segmentLabel}
              readOnly
              title={isIndividualLender ? individualLabel : segmentLabel}
            />
          </label>
          {shouldSplitCampaign ? (
            <label>
              Email Set
              <select value={selectedSet} onChange={(event) => setSelectedSet(event.target.value)}>
                {campaignSets.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}{item.isAllUsers ? ` (${fmtNum(totalRecipients)} users)` : ` (${fmtNum(item.start)}-${fmtNum(item.end)})`}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {channel === "email" ? (
            <label className="admin-ai-campaign-full">
              Mail Subject *
              <input
                value={mailSubject}
                onChange={(event) => { setMailSubject(event.target.value); setError(""); }}
                placeholder="Enter email subject"
              />
            </label>
          ) : null}
          <label>
            Mail Display Name *
            <input
              value={mailDisplayName}
              onChange={(event) => { setMailDisplayName(event.target.value); setError(""); }}
              placeholder="Name shown in recipient inbox"
            />
          </label>
          {!isExcelCampaign ? (
            <label>
              {isIndividualLender ? "Optional Test Email" : `Test Email ${channel === "email" ? "*" : ""}`}
              <input
                type="email"
                value={testEmail}
                onChange={(event) => { setTestEmail(event.target.value); setError(""); }}
                placeholder="your-email@gmail.com"
                disabled={channel !== "email"}
              />
            </label>
          ) : null}
          {!isExcelCampaign ? (
          <label>
            {isIndividualLender ? "Optional Test WhatsApp" : `Test WhatsApp ${channel === "whatsapp" ? "*" : ""}`}
            <input
              value={testMobile}
              onChange={(event) => { setTestMobile(event.target.value); setError(""); }}
              placeholder="10-digit mobile (e.g. 9876543210)"
              disabled={channel !== "whatsapp"}
            />
          </label>
          ) : null}
          {isWhatsapp && !isIndividualLender ? (
            <div className="admin-ai-campaign-full admin-ai-campaign-schedule-block">
              <label className="admin-ai-campaign-schedule-check">
                <input
                  type="checkbox"
                  checked={useSchedule}
                  onChange={(event) => { setUseSchedule(event.target.checked); setError(""); }}
                />
                <strong>Schedule WhatsApp for later (optional)</strong>
              </label>
              <small>
                {useSchedule
                  ? "Important: button must say Schedule Test (not Send Test). Nothing sends on click — only at the IST time below."
                  : "Send Test sends to your number immediately. Turn on schedule above to delay until a chosen IST time."}
              </small>
              {useSchedule ? (
                <>
                  <div className="admin-ai-campaign-schedule-fields">
                    <label>
                      Date *
                      <input
                        type="date"
                        value={scheduleDate}
                        min={defaultScheduleDate()}
                        onChange={(event) => { setScheduleDate(event.target.value); setError(""); }}
                      />
                    </label>
                    <label>
                      Time (24h, IST) *
                      <input
                        type="time"
                        step="60"
                        value={scheduleTime}
                        onChange={(event) => { setScheduleTime(event.target.value); setError(""); }}
                      />
                    </label>
                  </div>
                  {schedulePreview ? (
                    <div className="admin-ai-campaign-schedule-preview">
                      <small>
                        Will run at: <strong>{schedulePreview} IST</strong> (not before). Pick at least 2 minutes ahead.
                      </small>
                    </div>
                  ) : null}
                  {scheduledTestQueued ? (
                    <label className="admin-ai-campaign-schedule-check admin-ai-campaign-test-confirm">
                      <input
                        type="checkbox"
                        checked={testVerified}
                        onChange={(event) => {
                          setTestVerified(event.target.checked);
                          setError("");
                          if (event.target.checked) {
                            try {
                              sessionStorage.removeItem(scheduleTestStorageKey(segment));
                            } catch {
                              // ignore
                            }
                          }
                        }}
                      />
                      <strong>I received the scheduled test on WhatsApp — enable bulk schedule</strong>
                    </label>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : null}
          <label className="admin-ai-campaign-full">
            Campaign Logo
            <div className="admin-ai-campaign-image-row">
              <label className="admin-ai-campaign-upload-btn">
                <FaImage /> {uploadingLogo ? "Uploading..." : "Upload Logo"}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingLogo}
                  onChange={handleLogoUpload}
                  hidden
                />
              </label>
              {logoFileName ? <small title={logoFileName}>{logoFileName}</small> : (
                <small>
                  {projectType === "oxyloans"
                    ? "Default: OxyLoans logo. Upload only to use a different logo."
                    : `Default: ${PROJECT_TYPES.find((p) => p.id === projectType)?.displayName || projectType} logo. Upload to override.`}
                </small>
              )}
              {logoUrl ? (
                <button
                  type="button"
                  className="admin-ai-reset-btn"
                  onClick={() => {
                    setLogoUrl("");
                    setLogoFileName("");
                  }}
                >
                  Use default logo
                </button>
              ) : null}
            </div>
            <div className="admin-ai-campaign-image-preview admin-ai-campaign-logo-preview">
              <img
                key={previewLogo}
                src={previewLogo}
                alt="Campaign logo"
              />
            </div>
          </label>
          <label className="admin-ai-campaign-full">
            Campaign Image (optional — email only)
            <div className="admin-ai-campaign-image-row">
              <label className={`admin-ai-campaign-upload-btn ${channel !== "email" ? "is-disabled" : ""}`}>
                <FaImage /> {uploadingImage ? "Uploading..." : "Upload Image"}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage || channel !== "email"}
                  onChange={handleImageUpload}
                  hidden
                />
              </label>
              {imageFileName ? <small>{imageFileName}</small> : (
                <small>
                  {channel === "whatsapp"
                    ? "WhatsApp uses the campaign logo automatically. Your caption appears below the image."
                    : "Optional banner below the logo. Logo + date are still added automatically."}
                </small>
              )}
              {imageUrl && channel === "email" ? (
                <button type="button" className="admin-ai-reset-btn" onClick={() => { setImageUrl(""); setImageFileName(""); }}>
                  Remove
                </button>
              ) : null}
            </div>
            {imageUrl && channel === "email" ? (
              <div className="admin-ai-campaign-image-preview">
                <img src={imageUrl} alt="Campaign" />
              </div>
            ) : null}
          </label>
        </div>

        <div className="admin-ai-campaign-mode-tabs">
          <button type="button" className={messageMode === "templates" ? "active" : ""} onClick={() => setMessageMode("templates")}>
            10 Content Templates
          </button>
          <button type="button" className={messageMode === "ai" ? "active" : ""} onClick={() => setMessageMode("ai")}>
            <FaRobot /> Generate with AI
          </button>
          <button type="button" className={messageMode === "manual" ? "active" : ""} onClick={startManualMessage}>
            Manual Message
          </button>
        </div>

        {messageMode === "templates" ? (
          <section className="admin-ai-template-library">
            <div className="admin-ai-template-library-head">
              <div>
                <strong>10 ready-to-use {channel === "email" ? "Email" : "WhatsApp"} contents</strong>
                <small>Prepared for: {segmentLabel}. Open any content to review it, then choose Use &amp; Edit.</small>
              </div>
              <div className="admin-ai-template-head-actions">
                <span>{campaignTemplates.length} standard templates</span>
                <button type="button" onClick={() => setMessageMode("manual")}>Close Templates</button>
              </div>
            </div>
            <div className="admin-ai-template-grid">
              {campaignTemplates.map((template) => (
                <article key={template.id} className={selectedTemplateId === template.id ? "is-selected" : ""}>
                  <div className="admin-ai-template-title">
                    <span>{template.number}</span>
                    <div>
                      <strong>{template.title}</strong>
                      <small>{template.subject}</small>
                    </div>
                  </div>
                  <p>{template.message}</p>
                  <details>
                    <summary>View full content</summary>
                    <pre>{template.message}</pre>
                  </details>
                  <button type="button" onClick={() => applyCampaignTemplate(template)}>
                    Use &amp; Edit
                  </button>
                </article>
              ))}
            </div>

            <section className="admin-ai-custom-template-section">
              <div className="admin-ai-custom-template-head">
                <div>
                  <strong>Custom Content</strong>
                  <small>Your approved content for this segment and {channel === "email" ? "Email" : "WhatsApp"} only.</small>
                </div>
                <div>
                  <span>{customTemplates.length} custom</span>
                  <button type="button" onClick={() => setShowAddTemplate((current) => !current)}>
                    {showAddTemplate ? "Cancel Add" : "+ Add Custom Content"}
                  </button>
                </div>
              </div>
              {showAddTemplate ? (
                <div className="admin-ai-template-add-form">
                  <div className="admin-ai-template-add-head">
                    <strong>Add custom content {customTemplates.length + 1}</strong>
                    <small>This will not change the 10 standard templates.</small>
                  </div>
                  <label>
                    Official content title *
                    <input
                      value={customTemplateTitle}
                      onChange={(event) => setCustomTemplateTitle(event.target.value)}
                      placeholder={channel === "email" ? "Example: Annual Lender Portfolio Update" : "Example: Lender Participation Reminder"}
                    />
                  </label>
                  {channel === "email" ? (
                    <label>
                      Email subject *
                      <input
                        value={customTemplateSubject}
                        onChange={(event) => setCustomTemplateSubject(event.target.value)}
                        placeholder="Enter the official email subject"
                      />
                    </label>
                  ) : null}
                  <label className="admin-ai-template-add-message">
                    {channel === "email" ? "Email content *" : "WhatsApp content *"}
                    <textarea
                      rows={8}
                      value={customTemplateMessage}
                      onChange={(event) => setCustomTemplateMessage(event.target.value)}
                      placeholder="Enter complete content. You can use $name for the recipient name."
                    />
                  </label>
                  <div className="admin-ai-template-add-actions">
                    <button type="button" className="is-cancel" onClick={() => setShowAddTemplate(false)}>Cancel</button>
                    <button type="button" className="is-save" onClick={saveCustomTemplate}>Save Custom Content</button>
                  </div>
                </div>
              ) : null}
              {customTemplates.length ? (
                <div className="admin-ai-template-grid admin-ai-template-grid--custom">
                  {availableTemplates.slice(campaignTemplates.length).map((template) => (
                    <article key={template.id} className={selectedTemplateId === template.id ? "is-selected" : ""}>
                      <div className="admin-ai-template-title">
                        <span>{template.number}</span>
                        <div><strong>{template.title}</strong><small>{template.subject}</small></div>
                      </div>
                      <p>{template.message}</p>
                      <details><summary>View full content</summary><pre>{template.message}</pre></details>
                      <button type="button" onClick={() => applyCampaignTemplate(template)}>Use &amp; Edit</button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="admin-ai-custom-template-empty">No custom content added yet.</div>
              )}
            </section>
            <button type="button" className="admin-ai-template-close-bottom" onClick={() => setMessageMode("manual")}>Close Templates</button>
          </section>
        ) : null}

        {messageMode === "ai" ? (
          <div className="admin-ai-campaign-ai-box">
            <label>
              AI Instructions (optional)
              <textarea
                rows={3}
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
                placeholder="Example: Remind inactive lenders about new high-ROI deals this month"
              />
            </label>
            <button type="button" className="admin-ai-search-btn" disabled={generating} onClick={handleGenerate}>
              {generating ? "Generating..." : "Generate Message"}
            </button>
          </div>
        ) : null}

        <label className="admin-ai-campaign-full">
          {channel === "whatsapp" ? "Caption (below image) *" : "Message *"}
          <textarea
            rows={channel === "whatsapp" ? 4 : 8}
            value={message}
            onChange={(event) => { setMessage(event.target.value); setError(""); }}
            placeholder={channel === "whatsapp"
              ? "Caption below OxyLoans image. Example: Prosperous and joyful moments to our valued lender. Best regards from Team OxyLoans."
              : "Enter the message. Use $name for lender name."}
          />
          <small>
            {channel === "whatsapp"
              ? `WhatsApp sends ONE message: OxyLoans logo image + your caption below (like birthday automation). Live send uses each lender's real name.`
              : `Use $name and $mobileNumber placeholders. Preview shows "${TEST_PREVIEW_NAME}"; live send uses each lender's real name from the database.`}
          </small>
          {messageMode === "manual" && contentSource === "manual" && message.trim() ? (
            <button type="button" className="admin-ai-manual-approve-btn" onClick={approveManualContentAsCustom}>
              + Add This Manual Message to Custom Content
            </button>
          ) : null}
        </label>

        {showPreview ? (
          <div className="admin-ai-campaign-preview">
            <strong>Preview</strong>
            {channel === "email" ? (
              <div className="admin-ai-campaign-email-preview">
                <div className="admin-ai-campaign-email-preview-head">
                  <img
                    key={`email-preview-${previewLogo}`}
                    src={previewLogo}
                    alt="Campaign logo"
                  />
                  <span>Date: {new Date().toLocaleDateString("en-GB")}</span>
                </div>
                <p><strong>{previewGreeting}</strong></p>
                {imageUrl ? <img src={imageUrl} alt="Campaign" className="admin-ai-campaign-email-preview-banner" /> : null}
                <div className="admin-ai-campaign-email-preview-body">{renderWhatsAppBody(previewText)}</div>
                <small>Subject: {mailSubject}</small>
              </div>
            ) : (
              <div className="admin-ai-campaign-whatsapp-preview">
                <div className="admin-ai-campaign-whatsapp-preview-bubble admin-ai-campaign-whatsapp-card-style">
                  <img
                    key={`wa-preview-${whatsappPreviewImage}`}
                    src={whatsappPreviewImage}
                    alt="Campaign logo"
                    className="admin-ai-campaign-whatsapp-card-image admin-ai-campaign-whatsapp-logo-card"
                  />
                  <div className="admin-ai-campaign-whatsapp-caption">
                    <p className="admin-ai-campaign-whatsapp-greeting"><strong>{previewGreeting}</strong></p>
                    {previewText ? (
                      <div className="admin-ai-campaign-whatsapp-body">{renderWhatsAppBody(previewText)}</div>
                    ) : null}
                    <small className="admin-ai-campaign-whatsapp-footer">*This is a system generated message*</small>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {error ? <div className="alert alert-danger">{error}</div> : null}
        {status ? <div className="alert alert-success">{status}</div> : null}

        {lastSendResult?.failedCount > 0 ? (
          <div className="admin-ai-campaign-failed-actions">
            <p>
              {fmtNum(lastSendResult.failedCount)} lender(s) failed in this batch.
              View details on the next page or download failed users as Excel.
            </p>
            <div className="admin-ai-campaign-actions">
              <button type="button" className="admin-ai-search-btn" onClick={() => openFailedUsersPage()}>
                View failed users
              </button>
              <button
                type="button"
                className="admin-ai-reset-btn"
                onClick={() => downloadFailedUsersExcel()}
                disabled={exportingFailed}
              >
                <FaFileExcel /> {exportingFailed ? "Preparing..." : "Download failed Excel"}
              </button>
            </div>
          </div>
        ) : null}

        <div className="admin-ai-campaign-actions">
          <button type="button" className="admin-ai-reset-btn" onClick={() => setShowPreview((value) => !value)}>
            {showPreview ? "Hide Preview" : "Preview"}
          </button>
          {!isExcelCampaign ? (
          <button
            type="button"
            className="admin-ai-reset-btn"
            disabled={
              sendingAction !== null
              || (isWhatsapp && useSchedule && (!scheduleDate || !scheduleTime || !String(testMobile || "").trim()))
            }
            title={
              isWhatsapp && useSchedule
                ? `Schedule test to your number at ${schedulePreview || "selected time"} IST only`
                : "Send one test message to your number now"
            }
            onClick={() => handleSend(true)}
          >
            {sendingAction === "test"
              ? (isWhatsapp && useSchedule ? "Scheduling..." : "Sending...")
              : isWhatsapp && useSchedule
                ? "Schedule Test"
                : "Send Test"}
          </button>
          ) : null}
          <button
            type="button"
            className="admin-ai-search-btn"
            disabled={
              sendingAction !== null
              || (!isIndividualLender && !isExcelCampaign && !testVerified)
              || (!isIndividualLender && isWhatsapp && useSchedule && (!scheduleDate || !scheduleTime))
              || (isExcelCampaign && excelEmailList.length < 1)
            }
            title={
              isIndividualLender
                ? channel === "whatsapp"
                  ? `Send WhatsApp to ${individualLabel}`
                  : `Send email to ${individualLabel}`
                : isExcelCampaign
                  ? `Send email to all ${fmtNum(totalRecipients)} Excel emails (tracked)`
                : isWhatsapp && useSchedule
                ? testVerified
                  ? `Bulk to ${fmtNum(totalRecipients)} ${audienceLabel} at ${schedulePreview || "selected time"} IST only`
                  : "Schedule and confirm test first"
                : !testVerified
                  ? "Run Send Test first"
                  : isWhatsapp
                    ? `Send WhatsApp to ${fmtNum(totalRecipients)} ${audienceLabel} now`
                    : shouldSplitCampaign && selectedCampaignSet
                      ? `Send ${selectedCampaignSet.label} (${fmtNum(selectedCampaignSet.start)}-${fmtNum(selectedCampaignSet.end)})`
                      : `Send email to ${fmtNum(totalRecipients)} ${audienceLabel} now`
            }
            onClick={() => handleSend(false)}
          >
            {sendingAction === "bulk"
              ? (isIndividualLender || isExcelCampaign ? "Sending..." : "Scheduling...")
              : isIndividualLender
                ? channel === "whatsapp"
                  ? `Send WhatsApp to ${individualLabel}`
                  : `Send Email to ${individualLabel}`
              : isExcelCampaign
                ? `Send Email to ${fmtNum(totalRecipients)} Excel emails`
              : isWhatsapp && useSchedule
                ? `Schedule WhatsApp to ${fmtNum(totalRecipients)}`
                : isWhatsapp
                  ? `Send WhatsApp to ${fmtNum(totalRecipients)} now`
                  : shouldSplitCampaign && selectedCampaignSet
                    ? `Send ${selectedCampaignSet.label}`
                    : `Send Email to ${fmtNum(totalRecipients)}`}
          </button>
          {shouldSplitCampaign && !isExcelCampaign ? (
            <button
              type="button"
              className="admin-ai-search-btn"
              disabled={sendingAction !== null || !testVerified}
              onClick={handleSendAllSets}
              title="Send Set 1, Set 2 and Set 3 in order"
            >
              Send All Sets
            </button>
          ) : null}
          {shouldSplitCampaign && isExcelCampaign ? (
            <button
              type="button"
              className="admin-ai-search-btn"
              disabled={sendingAction !== null || excelEmailList.length < 1}
              onClick={handleSendAllSets}
              title="Send Set 1, Set 2 and Set 3 in order to Excel emails"
            >
              Send All Sets
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default AdminAILenderCampaignModal;
