import React, { useEffect, useMemo, useState } from "react";
import { FaEnvelope, FaImage, FaRobot, FaWhatsapp } from "react-icons/fa";
import {
  generateAdminAILenderCampaignMessage,
  sendAdminAILenderSegmentCampaign,
  uploadAdminAILenderCampaignImage,
} from "../../../HttpRequest/admin";

const PROJECT_TYPES = [
  { id: "oxyloans", label: "oxyloans (support@oxyloans.com)" },
  { id: "bmv", label: "bmv (Hi@BMV.money)" },
  { id: "oxybricks", label: "oxybricks (radha@oxybricks.world)" },
  { id: "erice", label: "erice (Hi@BMV.money)" },
];

const DEFAULT_LOGOS = {
  oxyloans: "https://oxyloans.com/wp-content/themes/oxyloan/oxyloan/_ui/images/logo.png",
  bmv: "https://oxyloansv1.s3.ap-south-1.amazonaws.com/8134/PAN_askoxylogoblack.56dbb158b7a0beaf4fbe.png",
  oxybricks: "https://oxyloanstestv1.s3.ap-south-1.amazonaws.com/BULKINVITE_logo (1).png",
  erice: "https://oxyloansv1.s3.ap-south-1.amazonaws.com/BULKINVITE_Oxyrice logo.png",
};

const fmtNum = (n) => (n == null ? "0" : Number(n).toLocaleString("en-IN"));

const personalizePreview = (message, sampleName = "Ramesh Kumar", sampleMobile = "919876543210") =>
  String(message || "")
    .replace(/\$name/g, sampleName)
    .replace(/\$mobileNumber/g, sampleMobile);

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

  const previewText = useMemo(() => personalizePreview(message), [message]);
  const brandLogo = DEFAULT_LOGOS[projectType] || DEFAULT_LOGOS.oxyloans;

  useEffect(() => {
    if (!open) return;
    setChannel(initialChannel);
    setProjectType("oxyloans");
    setMessageMode("manual");
    setAiPrompt("");
    setMessage("");
    setMailSubject("Update from OxyLoans");
    setTestEmail("");
    setTestMobile("");
    setImageUrl("");
    setImageFileName("");
    setStatus("");
    setError("");
    setShowPreview(false);
  }, [open, initialChannel, segment, segmentLabel]);

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
      setStatus("Image uploaded. It will appear in email/WhatsApp campaign.");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to upload image.");
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleSend = async (dryRun = false) => {
    const trimmedMessage = String(message || "").replace(/\u00a0/g, " ").trim();
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
        message: trimmedMessage,
        mailSubject,
        imageUrl: imageUrl || undefined,
        logoUrl: brandLogo,
        testEmail: dryRun && channel === "email" ? testEmail.trim() : undefined,
        testMobile: dryRun && channel === "whatsapp" ? testMobile.trim() : undefined,
        dryRun,
      });
      if (data?.status === "SUCCESS" || (data?.sentCount > 0 && data?.failedCount >= 0)) {
        const summary = `Sent: ${fmtNum(data?.sentCount || 0)} | Failed: ${fmtNum(data?.failedCount || 0)}`;
        setStatus(data?.message || summary);
        onSent?.(data);
        if (!dryRun) {
          setTimeout(() => onClose?.(), 2000);
        }
      } else {
        setError(data?.message || "Campaign send failed.");
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
              {segmentLabel} &middot; {fmtNum(recipientCount)} lenders &middot; Send test to your email/mobile before full campaign
            </p>
          </div>
          <button type="button" className="admin-ai-close-btn" onClick={onClose}>
            Close
          </button>
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
            Test Email {channel === "email" ? "*" : ""}
            <input
              type="email"
              value={testEmail}
              onChange={(event) => { setTestEmail(event.target.value); setError(""); }}
              placeholder="you@example.com (for Send Test)"
              disabled={channel !== "email"}
            />
          </label>
          <label>
            Test WhatsApp {channel === "whatsapp" ? "*" : ""}
            <input
              value={testMobile}
              onChange={(event) => { setTestMobile(event.target.value); setError(""); }}
              placeholder="9876543210 (for Send Test)"
              disabled={channel !== "whatsapp"}
            />
          </label>
          <label className="admin-ai-campaign-full">
            Campaign Image (optional)
            <div className="admin-ai-campaign-image-row">
              <label className="admin-ai-campaign-upload-btn">
                <FaImage /> {uploadingImage ? "Uploading..." : "Upload Image"}
                <input type="file" accept="image/*" disabled={uploadingImage} onChange={handleImageUpload} hidden />
              </label>
              {imageFileName ? <small>{imageFileName}</small> : <small>Logo + date are added automatically in email.</small>}
              {imageUrl ? (
                <button type="button" className="admin-ai-reset-btn" onClick={() => { setImageUrl(""); setImageFileName(""); }}>
                  Remove
                </button>
              ) : null}
            </div>
            {imageUrl ? (
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
          Message *
          <textarea
            rows={8}
            value={message}
            onChange={(event) => { setMessage(event.target.value); setError(""); }}
            placeholder="Enter the message. Use $name for lender name."
          />
          <small>Use $name and $mobileNumber placeholders for personalization.</small>
        </label>

        {showPreview ? (
          <div className="admin-ai-campaign-preview">
            <strong>Preview</strong>
            {channel === "email" ? (
              <div className="admin-ai-campaign-email-preview">
                <div className="admin-ai-campaign-email-preview-head">
                  <img src={brandLogo} alt="Logo" />
                  <span>Date: {new Date().toLocaleDateString("en-GB")}</span>
                </div>
                <p><strong>Hi Ramesh Kumar</strong></p>
                {imageUrl ? <img src={imageUrl} alt="Campaign" className="admin-ai-campaign-email-preview-banner" /> : null}
                <pre>{previewText}</pre>
                <small>Subject: {mailSubject}</small>
              </div>
            ) : (
              <pre>{previewText}</pre>
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
            Send Test
          </button>
          <button type="button" className="admin-ai-search-btn" disabled={sending} onClick={() => handleSend(false)}>
            {sending ? "Sending..." : `Send ${channel === "email" ? "Email" : "WhatsApp"}`}
          </button>
        </div>
      </section>
    </div>
  );
};

export default AdminAILenderCampaignModal;
