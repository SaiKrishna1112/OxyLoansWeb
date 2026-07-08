import React, { useEffect, useMemo, useState } from "react";
import { FaEnvelope, FaImage, FaRobot, FaWhatsapp } from "react-icons/fa";
import {
  generateAdminAILenderCampaignMessage,
  sendAdminAILenderSegmentCampaign,
  uploadAdminAILenderCampaignImage,
} from "../../../HttpRequest/admin";

const PROJECT_TYPES = [
  { id: "oxyloans", label: "oxyloans (support@oxyloans.com)", displayName: "OxyLoans" },
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

const formatWhatsAppText = (text) =>
  compactWhatsAppLineSpacing(
    String(text || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/br>/gi, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/^\s*subject\s*:\s*.+\n+/i, "")
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

const fmtNum = (n) => (n == null ? "0" : Number(n).toLocaleString("en-IN"));

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

const AdminAILenderCampaignModal = ({
  open,
  onClose,
  onSent,
  segment,
  segmentLabel,
  recipientCount = 0,
  initialChannel = "email",
}) => {
  const [channel, setChannel] = useState(initialChannel);
  const [projectType, setProjectType] = useState("oxyloans");
  const [messageMode, setMessageMode] = useState("manual");
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
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [testVerified, setTestVerified] = useState(false);

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

  useEffect(() => {
    if (!open) return;
    setChannel(initialChannel);
    setProjectType("oxyloans");
    setMessageMode("manual");
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
  }, [open, initialChannel, segment, segmentLabel]);

  useEffect(() => {
    setTestVerified(false);
  }, [campaignFingerprint]);

  if (!open) {
    return null;
  }

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
      setMessage(data?.message || "");
      if (data?.suggestedMailSubject) {
        setMailSubject(data.suggestedMailSubject);
      }
      if (data?.suggestedWhatsappSubject) {
        setWhatsappSubject(data.suggestedWhatsappSubject);
      } else if (data?.suggestedMailSubject) {
        setWhatsappSubject(data.suggestedMailSubject);
      }
      setStatus("AI message generated. You can edit before sending.");
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

  const handleSend = async (dryRun = false) => {
    const trimmedMessage = formatWhatsAppText(String(message || "").replace(/\u00a0/g, " "));
    if (!trimmedMessage) {
      setError("Please enter or generate a message first.");
      return;
    }
    if (channel === "email" && !String(mailSubject || "").trim()) {
      setError("Email subject is required.");
      return;
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
      setError("Please run Send Test first and confirm you received the message before sending to all lenders.");
      return;
    }

    const confirmText = dryRun
      ? channel === "email"
        ? `Send a test email to ${testEmail.trim()}?`
        : `Send a test WhatsApp to ${testMobile.trim()}?`
      : `Send ${channel} campaign to ${fmtNum(recipientCount)} lenders in "${segmentLabel}"?`;
    if (!window.confirm(confirmText)) {
      return;
    }

    setSending(true);
    setError("");
    setStatus("");
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
        testMobile: dryRun && channel === "whatsapp" ? testMobile.trim() : undefined,
        dryRun,
      });
      const deliveryError = Array.isArray(data?.deliveryResults)
        ? data.deliveryResults.find((row) => row?.errorMessage)?.errorMessage
        : "";
      const recipient = Array.isArray(data?.deliveryResults)
        ? data.deliveryResults[0]?.recipient || data.deliveryResults[0]?.email || data.deliveryResults[0]?.mobileNumber
        : "";
      if (data?.status === "SUCCESS" && (data?.sentCount || 0) > 0 && (data?.failedCount || 0) === 0) {
        const summary = data?.message || `Sent: ${fmtNum(data?.sentCount || 0)} | Failed: ${fmtNum(data?.failedCount || 0)}`;
        const detail = dryRun && recipient ? `${summary} (to ${recipient})` : summary;
        setStatus(dryRun && channel === "whatsapp"
          ? `${detail} — Check WhatsApp: ONE message with OxyLoans image and your text as caption below (not two separate messages).`
          : detail);
        if (dryRun) {
          setTestVerified(true);
        }
        onSent?.(data);
        if (!dryRun) {
          setTimeout(() => onClose?.(), 2000);
        }
      } else {
        const summary = data?.message || `Sent: ${fmtNum(data?.sentCount || 0)} | Failed: ${fmtNum(data?.failedCount || 0)}`;
        setError(deliveryError ? `${summary} — ${deliveryError}` : summary || "Campaign send failed.");
        onSent?.(data);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to send campaign.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="admin-ai-campaign-backdrop" onClick={onClose}>
      <section className="admin-ai-campaign-modal" onClick={(event) => event.stopPropagation()}>
        <div className="admin-ai-campaign-head">
          <div>
            <h5>Campaign Automation</h5>
            <p>
              {segmentLabel} &middot; {fmtNum(recipientCount)} lenders &middot; Step 1: Send Test to your email/mobile &middot; Step 2: Send to all
            </p>
          </div>
          <button type="button" className="admin-ai-close-btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className={`admin-ai-pro-note ${testVerified ? "admin-ai-campaign-test-ok" : ""}`}>
          <strong>{testVerified ? "Test passed." : "Test required before bulk send."}</strong>{" "}
          {testVerified
            ? "You can now send the campaign to all lenders in this segment."
            : "Use Send Test with your own email or WhatsApp number. Bulk send stays disabled until test succeeds."}
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
          <button type="button" className={messageMode === "ai" ? "active" : ""} onClick={() => setMessageMode("ai")}>
            <FaRobot /> Generate with AI
          </button>
          <button type="button" className={messageMode === "manual" ? "active" : ""} onClick={() => setMessageMode("manual")}>
            Manual Message
          </button>
        </div>

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

        <div className="admin-ai-campaign-actions">
          <button type="button" className="admin-ai-reset-btn" onClick={() => setShowPreview((value) => !value)}>
            {showPreview ? "Hide Preview" : "Preview"}
          </button>
          <button type="button" className="admin-ai-reset-btn" disabled={sending} onClick={() => handleSend(true)}>
            {sending ? "Sending..." : "Send Test"}
          </button>
          <button
            type="button"
            className="admin-ai-search-btn"
            disabled={sending || !testVerified}
            title={!testVerified ? "Run Send Test first" : `Send to ${fmtNum(recipientCount)} lenders`}
            onClick={() => handleSend(false)}
          >
            {sending ? "Sending..." : `Send ${channel === "email" ? "Email" : "WhatsApp"} to ${fmtNum(recipientCount)}`}
          </button>
        </div>
      </section>
    </div>
  );
};

export default AdminAILenderCampaignModal;
