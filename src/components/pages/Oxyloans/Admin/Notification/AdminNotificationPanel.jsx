import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  sendAdminNotificationAll,
  sendAdminNotificationSegment,
} from "../../../../HttpRequest/admin";

const NOTIFICATION_TYPES = [
  { value: "OFFER_CREATED", label: "New Offer" },
  { value: "NEW_DEAL_OPENED", label: "New Deal" },
  { value: "PROMOTION_AVAILABLE", label: "Promotion" },
  { value: "CAMPAIGN_STARTED", label: "Campaign / Update" },
];

const SEGMENTS = [
  { value: "ALL", label: "All active users" },
  { value: "LENDERS", label: "Active lenders" },
  { value: "BORROWERS", label: "Active borrowers" },
];

const AdminNotificationPanel = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notificationType, setNotificationType] = useState("OFFER_CREATED");
  const [segment, setSegment] = useState("ALL");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setStatus({ type: "danger", text: "Title and message are required." });
      return;
    }
    setSending(true);
    setStatus(null);
    const payload = {
      notificationType,
      title: title.trim(),
      message: message.trim(),
      redirectUrl: redirectUrl.trim() || undefined,
      priority: "HIGH",
      
    };
    try {
      const res =
        segment === "ALL"
          ? await sendAdminNotificationAll(payload)
          : await sendAdminNotificationSegment({
              ...payload,
              recipientSegment: segment,
            });
      if (res.data?.success !== false) {
        const notificationId = res.data?.data?.id;
        const dispatchStatus = res.data?.data?.dispatchStatus;
        const isQueued = dispatchStatus === "QUEUED" || res.status === 202;
        setStatus({
          type: "success",
          text: isQueued
            ? `Notification queued (ID: ${notificationId}). Delivery runs in background — check dispatch status in admin APIs.`
            : "Notification sent to users (in-app + push).",
        });
        setTitle("");
        setMessage("");
        setRedirectUrl("");
      } else {
        setStatus({ type: "danger", text: res.data?.error || "Send failed." });
      }
    } catch (err) {
      setStatus({
        type: "danger",
        text: err.response?.data?.error || err.message || "Send failed.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="row mt-4">
      <div className="col-12 mb-2">
        <Link to="/adminNotifications" className="btn btn-outline-primary btn-sm">
          Open full Notification Command Center →
        </Link>
      </div>
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Send In-App &amp; Push Notification</h5>
            <small className="text-muted">
              Broadcast deals, offers, and updates to mobile users (like e-commerce apps).
            </small>
          </div>
          <div className="card-body">
            {status && (
              <div className={`alert alert-${status.type} py-2`}>{status.text}</div>
            )}
            <form onSubmit={handleSend}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select"
                    value={notificationType}
                    onChange={(e) => setNotificationType(e.target.value)}
                  >
                    {NOTIFICATION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Audience</label>
                  <select
                    className="form-select"
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                  >
                    {SEGMENTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label">Title</label>
                  <input
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. New deal live — 12% returns"
                    maxLength={255}
                  />
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Short message shown in the notification bell and on mobile push"
                  />
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label">Redirect URL (optional)</label>
                  <input
                    className="form-control"
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    placeholder="/myRunningDeals or full app deep link"
                  />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary" disabled={sending}>
                    {sending ? "Sending…" : "Send notification"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationPanel;
