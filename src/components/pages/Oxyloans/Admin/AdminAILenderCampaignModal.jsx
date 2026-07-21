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
  { id: "bmv", label: "bmv (Hi@BMV.money)", displayName: "BMV" },
  { id: "oxybricks", label: "oxybricks (radha@oxybricks.world)", displayName: "Oxybricks" },
  { id: "erice", label: "erice (Hi@BMV.money)", displayName: "Erice" },
];

const OXYLOANS_BRAND_LOGO = "https://oxyloans.com/wp-content/themes/oxyloan/oxyloan/_ui/images/logo4.png";
const OXYLOANS_BRAND_LOGO_FALLBACK = `${process.env.PUBLIC_URL || ""}/assets/img/oxyloans-campaign-logo.png`;

const DEFAULT_LOGOS = {
  oxyloans: OXYLOANS_BRAND_LOGO,
  bmv: "https://oxyloansv1.s3.ap-south-1.amazonaws.com/8134/PAN_askoxylogoblack.56dbb158b7a0beaf4fbe.png",
  oxybricks: "https://oxyloanstestv1.s3.ap-south-1.amazonaws.com/BULKINVITE_logo%20(1).png",
  erice: "https://oxyloansv1.s3.ap-south-1.amazonaws.com/BULKINVITE_Oxyrice%20logo.png",
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

const LENDER_TEMPLATE_IDEAS = [
  { title: "Registration Preference", subject: "Please Confirm Your OXYLOANS Registration Preference", focus: "Confirm whether you registered as a Lender or Borrower so we can share the most relevant opportunities." },
  { title: "Lending Opportunities", subject: "Explore Current Lending Opportunities on OXYLOANS", focus: "Explore the latest lending opportunities available on OXYLOANS and take the next step from your account." },
  { title: "Lender Account Activation", subject: "Activate Your OXYLOANS Lender Account", focus: "Review your lender registration, complete any pending account steps, and activate your participation." },
  { title: "Attractive Returns", subject: "Earn Attractive Returns with OXYLOANS", focus: "Review current lending opportunities offering attractive returns through the OXYLOANS platform." },
  { title: "Lender Portfolio Review", subject: "Review Your OXYLOANS Lender Portfolio", focus: "Log in to review your lender account, portfolio position, and opportunities relevant to you." },
  { title: "New Deals Available", subject: "New Lending Opportunities Are Now Available", focus: "New opportunities are available. Visit OXYLOANS to review the details and participate based on your preference." },
  { title: "Lender Re-engagement", subject: "Welcome Back to OXYLOANS Lending", focus: "Reconnect with OXYLOANS, review current lending opportunities, and continue your investment journey." },
  { title: "RBI-Approved Platform", subject: "Lend Through a 10-Year-Old RBI-Approved P2P Platform", focus: "Discover lending opportunities on our 10-year-old RBI-approved P2P-NBFC platform." },
  { title: "Lender Assistance", subject: "Assistance with Your OXYLOANS Lender Account", focus: "Our team is ready to help you understand your lender account, portfolio, and available opportunities." },
  { title: "Participation Reminder", subject: "Reminder: Review Today’s OXYLOANS Lending Opportunities", focus: "Please log in today to review suitable lending opportunities and confirm your participation." },
];

const BORROWER_TEMPLATE_IDEAS = [
  { title: "Borrower Registration", subject: "Complete Your OXYLOANS Borrower Registration", focus: "Complete your borrower registration so we can help you explore suitable loan opportunities." },
  { title: "Loan Opportunities", subject: "Explore Loan Opportunities Available on OXYLOANS", focus: "Review the borrowing opportunities currently available through OXYLOANS." },
  { title: "Application Completion", subject: "Complete Your Pending OXYLOANS Loan Application", focus: "Complete the pending information in your application so our team can review your loan requirement." },
  { title: "Profile Verification", subject: "Action Required: Verify Your OXYLOANS Borrower Profile", focus: "Review and verify your borrower profile to continue with your loan application." },
  { title: "Eligibility Review", subject: "Review Your Loan Eligibility on OXYLOANS", focus: "Log in to review your account and the next steps for your borrowing requirement." },
  { title: "Document Reminder", subject: "Reminder: Complete Your Borrower Documents", focus: "Upload or confirm the required borrower information to avoid delays in processing." },
  { title: "Borrower Re-engagement", subject: "Continue Your Loan Journey with OXYLOANS", focus: "Reconnect with OXYLOANS and continue the pending steps for your borrowing requirement." },
  { title: "Trusted Platform", subject: "Borrow Through OXYLOANS — An RBI-Approved P2P Platform", focus: "Explore borrowing through our 10-year-old RBI-approved P2P-NBFC platform." },
  { title: "Borrower Assistance", subject: "Need Help with Your OXYLOANS Loan Application?", focus: "Our team is ready to assist with your borrower account and application process." },
  { title: "Application Reminder", subject: "Reminder: Review Your OXYLOANS Borrower Account", focus: "Please log in today to review your application status and complete the next required step." },
];

const REFERRAL_TEMPLATE_IDEAS = [
  { title: "Referral Account Update", subject: "Important Update on Your OXYLOANS Referral Account", focus: "Review your OXYLOANS referral account and the people you have introduced to our platform." },
  { title: "Referral Activity", subject: "Review Your OXYLOANS Referral Activity", focus: "Log in to review your referral activity, registrations, and participation status." },
  { title: "Referral Earnings", subject: "Review Your OXYLOANS Referral Earnings", focus: "Review your eligible referral earnings, paid amount, and any pending amount." },
  { title: "Invite New Members", subject: "Invite More Members to the OXYLOANS Community", focus: "Introduce eligible lenders and borrowers to OXYLOANS and grow your referral network." },
  { title: "Registered Referrals", subject: "Your Registered OXYLOANS Referrals — Next Steps", focus: "Encourage your registered referrals to complete their profile and participate on the platform." },
  { title: "Participated Referrals", subject: "Update on Your Participated OXYLOANS Referrals", focus: "Review which referred members have participated and track their progress." },
  { title: "Referral Re-engagement", subject: "Reconnect with Your OXYLOANS Referral Network", focus: "Reconnect with your referral network and help interested members take their next step." },
  { title: "Referral Recognition", subject: "Thank You for Growing the OXYLOANS Community", focus: "Thank you for introducing new members and supporting the growth of the OXYLOANS community." },
  { title: "Referral Assistance", subject: "Need Help with Your OXYLOANS Referrals?", focus: "Our team is ready to help you understand referral registrations, participation, and earnings." },
  { title: "Referral Reminder", subject: "Reminder: Review Your OXYLOANS Referral Dashboard", focus: "Please log in today to review referral progress and follow up with interested members." },
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
  const opportunityText = isReferralAudience
    ? "OXYLOANS values the referrers who introduce eligible lenders and borrowers to our growing community."
    : isBorrowerAudience
      ? "OXYLOANS helps eligible borrowers explore and apply for suitable loan opportunities through its platform."
      : "Our lenders are currently earning attractive returns of 1.7% to 2.0% per month (approximately 18% to 23% per annum) by participating in lending opportunities through OXYLOANS.";
  const actionText = isReferralAudience
    ? "Please log in to review your referral dashboard, registered referrals, participation, and eligible earnings."
    : isBorrowerAudience
      ? "Please log in as a Borrower to review your application and suitable loan opportunities."
      : "Please confirm your registration preference:\nLender - To earn returns by lending money.\nBorrower - To apply for a loan.";
  const signature = "Warm regards,\n\nRadhakrishna Thatavarti\nFounder & CEO\nOXYLOANS";

  return templateIdeas.map((idea, index) => {
    const emailMessage = `Dear $name,\n\nGreetings from Radhakrishna Thatavarti!\n\n${idea.focus}\n\nOXYLOANS is a 10-year-old company and an RBI-approved P2P-NBFC Lending Platform. ${opportunityText}\n\n${actionText}\n\nPlease reply to this email if you need assistance or log in to https://oxyloans.com/ to review your account.\n\nFor assistance, please contact:\nManikanta: +91 81061 77269\nDivya: +91 93479 67774\n\nWe look forward to welcoming you as an active member of the OXYLOANS community.\n\n${signature}`;
    const whatsappMessage = `Dear $name,\n\nGreetings from Radhakrishna Thatavarti!\n\n${idea.focus}\n\n${opportunityText}\n\n${actionText}\n\nReply for assistance or visit https://oxyloans.com/\n\nHelp: Manikanta +91 81061 77269 | Divya +91 93479 67774\n\n${signature}`;
    return {
      id: `template-${index + 1}`,
      number: index + 1,
      title: idea.title,
      subject: idea.subject,
      message: channel === "whatsapp" ? whatsappMessage : emailMessage,
    };
  });
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
}) => {
  const navigate = useNavigate();
  const audienceLabel = audienceType === "borrowers" ? "borrowers" : "lenders";
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
  const totalRecipients = Math.max(Number(recipientCount) || 0, Number(liveRecipientCount) || 0);
  const splitSetCount = Math.max(1, Number(campaignSetCount) || DEFAULT_CAMPAIGN_SET_COUNT);
  const shouldSplitCampaign = channel === "email" && totalRecipients > 0;
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
  const brandLogo = DEFAULT_LOGOS[projectType] || DEFAULT_LOGOS.oxyloans;
  const whatsappPreviewImage = imageUrl || brandLogo;
  const mailDisplayName = PROJECT_TYPES.find((option) => option.id === projectType)?.displayName || "OxyLoans";
  const campaignFingerprint = `${channel}|${projectType}|${mailSubject}|${whatsappSubject}|${message}|${imageUrl}`;
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
    setChannel(initialChannel);
    setProjectType("oxyloans");
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
    setTestEmail("");
    setTestMobile("");
    setImageUrl("");
    setImageFileName("");
    setStatus("");
    setError("");
    setShowPreview(false);
    setTestVerified(false);
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
  }, [open, initialChannel, segment, segmentLabel]);

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
  }, [open, recipientCount, segment]);

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
        : "Image uploaded. It will appear in the email campaign.");
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
    if (dryRun && channel === "whatsapp" && useSchedule) {
      if (!scheduleDate || !scheduleTime) {
        setError("Select schedule date and time (24-hour IST) for the scheduled test.");
        return;
      }
    }
    if (dryRun && channel === "email" && !String(testEmail || "").trim()) {
      setError("Enter a test email address for Send Test.");
      return;
    }
    if (dryRun && channel === "whatsapp" && !String(testMobile || "").trim()) {
      setError("Enter a test WhatsApp mobile number for Send Test.");
      return;
    }

    if (!dryRun && !testVerified) {
      setError(
        useSchedule && channel === "whatsapp"
          ? "Schedule a test first, wait until it arrives at your chosen IST time, then confirm below before scheduling bulk."
          : `Please run Send Test first and confirm you received the message before sending to all ${audienceLabel}.`
      );
      return;
    }

    if (!dryRun && channel === "whatsapp" && useSchedule) {
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
    const confirmText = dryRun
      ? channel === "email"
        ? `Send a test email to ${testEmail.trim()}?`
        : useSchedule
          ? `Schedule test WhatsApp to ${testMobile.trim()} at ${schedulePreview || `${scheduleDate} ${scheduleTime}`} IST?\n\nNothing sends now — only at that time.`
          : `Send a test WhatsApp to ${testMobile.trim()} now?`
      : channel === "whatsapp" && useSchedule
        ? `Schedule bulk WhatsApp to ${fmtNum(totalRecipients)} ${audienceLabel} at ${schedulePreview || `${scheduleDate} ${scheduleTime}`} IST?\n\nNothing sends now — only at that time.`
        : channel === "whatsapp"
          ? `Send WhatsApp now to ${fmtNum(totalRecipients)} ${audienceLabel} in "${segmentLabel}"?`
          : `Send email to ${fmtNum(totalRecipients)} ${audienceLabel} in "${segmentLabel}" now${setText}?`;
    if (!skipConfirm && !window.confirm(confirmText)) {
      return;
    }

    setSendingAction(dryRun ? "test" : "bulk");
    setError("");
    setStatus("");
    const isScheduledWhatsApp = channel === "whatsapp" && useSchedule;
    try {
      const data = await sendAdminAILenderSegmentCampaign({
        segment,
        segmentLabel,
        channel,
        projectType,
        mailDisplayName,
        message: trimmedMessage,
        mailSubject,
        whatsappSubject,
        imageUrl: channel === "email" ? (imageUrl || undefined) : undefined,
        logoUrl: brandLogo,
        testEmail: dryRun && channel === "email" ? testEmail.trim() : undefined,
        testMobile: channel === "whatsapp" && (dryRun || useSchedule) ? testMobile.trim() : undefined,
        dryRun: dryRun && !isScheduledWhatsApp,
        scheduleSend: Boolean(isScheduledWhatsApp),
        scheduleTestOnly: Boolean(dryRun && isScheduledWhatsApp),
        scheduleDate: isScheduledWhatsApp ? scheduleDate : undefined,
        scheduleTime: isScheduledWhatsApp
          ? (scheduleTime ? scheduleTime.slice(0, 5) : undefined)
          : undefined,
        recipientCount: isScheduledWhatsApp ? totalRecipients : undefined,
        maxRecipients: !dryRun && activeSet && !activeSet.isAllUsers ? activeSet.maxRecipients : undefined,
        recipientOffset: !dryRun && activeSet && !activeSet.isAllUsers ? activeSet.offset : undefined,
      });
      const deliveryError = Array.isArray(data?.deliveryResults)
        ? data.deliveryResults.find((row) => row?.errorMessage)?.errorMessage
        : "";
      const recipient = Array.isArray(data?.deliveryResults)
        ? data.deliveryResults[0]?.recipient || data.deliveryResults[0]?.email || data.deliveryResults[0]?.mobileNumber
        : "";
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
          }
          onSent?.(data);
          onClose?.();
        } else if (data?.status === "SUCCESS" && (data?.sentCount || 0) > 0) {
          setError(
            `WhatsApp was sent immediately at ${new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })} IST `
              + `instead of at ${schedulePreview || "your scheduled time"}. `
              + "Restart the backend, run migration v4, hard-refresh (Ctrl+Shift+R), then use Schedule Test again."
          );
          onSent?.(data);
        } else {
          setError(
            data?.message
              || `Schedule failed (status: ${data?.status || "unknown"}). Enable the schedule checkbox and use Schedule Test — not Send Test.`
          );
          onSent?.(data);
        }
      } else if (data?.status === "SCHEDULED") {
        const serverNow = data?.serverNowIst ? ` Server time now: ${data.serverNowIst}.` : "";
        setStatus((data?.message || `Scheduled for ${data?.scheduledAtDisplay || schedulePreview}.`) + serverNow);
        onSent?.(data);
        setTimeout(() => onClose?.(), 2500);
      } else if (!useSchedule && dryRun && data?.status === "SUCCESS" && (data?.sentCount || 0) > 0) {
        const summary = data?.message || `Test sent to ${recipient || "your number"}.`;
        setStatus(channel === "whatsapp"
          ? `${summary} — Check WhatsApp, then use the green button to send or schedule for all ${audienceLabel}.`
          : summary);
        setTestVerified(true);
        onSent?.(data);
      } else if (data?.status === "SUCCESS" && (data?.sentCount || 0) > 0 && (data?.failedCount || 0) === 0) {
        const summary = data?.message || `Sent: ${fmtNum(data?.sentCount || 0)} | Failed: ${fmtNum(data?.failedCount || 0)}`;
        const detail = dryRun && recipient ? `${summary} (to ${recipient})` : summary;
        setStatus(dryRun && channel === "whatsapp"
          ? `${detail} — Check WhatsApp: ONE message with OxyLoans image and your text as caption below (not two separate messages).`
          : detail);
        if (dryRun) {
          setTestVerified(true);
        }
        rememberSendResult(data, dryRun);
        onSent?.(data);
        if (!dryRun && !keepOpen) {
          setTimeout(() => onClose?.(), 2000);
        }
      } else if (dryRun) {
        const summary = data?.message || "Test send failed.";
        setError(deliveryError ? `${summary} — ${deliveryError}` : summary);
        setTestVerified(false);
        onSent?.(data);
      } else {
        const summary = data?.message || `Sent: ${fmtNum(data?.sentCount || 0)} | Failed: ${fmtNum(data?.failedCount || 0)}`;
        setError(deliveryError ? `${summary} — ${deliveryError}` : summary || "Campaign send failed.");
        rememberSendResult(data, dryRun);
        onSent?.(data);
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
            <h5>Campaign Automation</h5>
            <p>
              {segmentLabel} &middot; {fmtNum(totalRecipients)} {audienceLabel} &middot;{" "}
              {isWhatsapp && useSchedule
                ? "Step 1: Schedule test · Step 2: Confirm test · Step 3: Schedule bulk"
                : "Step 1: Send Test · Step 2: Send now or schedule"}
            </p>
          </div>
          <button type="button" className="admin-ai-close-btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className={`admin-ai-pro-note ${testVerified || scheduledTestQueued ? "admin-ai-campaign-test-ok" : ""}`}>
          <strong>
            {isWhatsapp && useSchedule
              ? scheduledTestQueued
                ? "Test scheduled — waiting for IST time."
                : "Schedule mode — nothing sends on click."
              : testVerified
                ? "Test passed."
                : "Step 1: Send Test required."}
          </strong>{" "}
          {isWhatsapp && useSchedule
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
          <button type="button" className={channel === "whatsapp" ? "active" : ""} onClick={() => setChannel("whatsapp")}>
            <FaWhatsapp /> WhatsApp
          </button>
        </div>

        <div className="admin-ai-campaign-grid">
          <label>
            Project Type *
            <select value={projectType} onChange={(event) => setProjectType(event.target.value)}>
              {PROJECT_TYPES.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            Segment
            <input value={segmentLabel} readOnly />
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
            Mail Display Name
            <input value={mailDisplayName} readOnly />
          </label>
          <label>
            Test Email {channel === "email" ? "*" : ""}
            <input
              type="email"
              value={testEmail}
              onChange={(event) => { setTestEmail(event.target.value); setError(""); }}
              placeholder="your-email@gmail.com"
              disabled={channel !== "email"}
            />
          </label>
          <label>
            Test WhatsApp {channel === "whatsapp" ? "*" : ""}
            <input
              value={testMobile}
              onChange={(event) => { setTestMobile(event.target.value); setError(""); }}
              placeholder="10-digit mobile (e.g. 9876543210)"
              disabled={channel !== "whatsapp"}
            />
          </label>
          {isWhatsapp ? (
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
                    ? "WhatsApp uses the OxyLoans logo automatically. Your caption appears below the image."
                    : "OxyLoans logo + date are added automatically in email."}
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
                    src={brandLogo}
                    alt="OxyLoans"
                    onError={(event) => { event.currentTarget.src = OXYLOANS_BRAND_LOGO_FALLBACK; }}
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
                    src={whatsappPreviewImage}
                    alt="OxyLoans"
                    className="admin-ai-campaign-whatsapp-card-image admin-ai-campaign-whatsapp-logo-card"
                    onError={(event) => { event.currentTarget.src = OXYLOANS_BRAND_LOGO_FALLBACK; }}
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
          <button
            type="button"
            className="admin-ai-search-btn"
            disabled={
              sendingAction !== null
              || !testVerified
              || (isWhatsapp && useSchedule && (!scheduleDate || !scheduleTime))
              || (channel === "email" && !testVerified)
            }
            title={
              isWhatsapp && useSchedule
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
              ? "Scheduling..."
              : isWhatsapp && useSchedule
                ? `Schedule WhatsApp to ${fmtNum(totalRecipients)}`
                : isWhatsapp
                  ? `Send WhatsApp to ${fmtNum(totalRecipients)} now`
                  : shouldSplitCampaign && selectedCampaignSet
                    ? `Send ${selectedCampaignSet.label}`
                    : `Send Email to ${fmtNum(totalRecipients)}`}
          </button>
          {shouldSplitCampaign ? (
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
        </div>
      </section>
    </div>
  );
};

export default AdminAILenderCampaignModal;
