import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaCheck, FaEye, FaEyeSlash, FaPaperPlane, FaRobot, FaSync, FaTimes, FaTrash, FaWhatsapp } from "react-icons/fa";
import {
  createAdminAIAutoEmailDraft,
  decideAdminAIAutoEmailDraft,
  deleteAdminAIAutoEmailDraft,
  getAdminAIAutoEmailDraft,
  listAdminAIAutoEmailDrafts,
  resendAdminAIAutoEmailWhatsApp,
  scheduleAdminAIAutoEmailDraft,
  sendAdminAIAutoEmailTest,
} from "../../../HttpRequest/admin";

const formatWhatsAppNotifyResults = (results) => {
  if (!results || typeof results !== "object") return "";
  return Object.entries(results)
    .map(([mobile, status]) => `${mobile}: ${status}`)
    .join(" · ");
};

const responseData = (payload) => payload?.data || payload || {};

const statusLabel = (status) => {
  const value = String(status || "").toUpperCase();
  if (value === "WAITING_APPROVAL") return "Waiting approval";
  if (value === "APPROVED") return "Approved";
  if (value === "REJECTED") return "Rejected";
  if (value === "TEST_SENT") return "Test sent";
  return value || "Draft";
};

const statusClass = (status) => {
  const value = String(status || "").toUpperCase();
  if (value === "WAITING_APPROVAL") return "is-waiting";
  if (value === "APPROVED") return "is-approved";
  if (value === "REJECTED") return "is-rejected";
  if (value === "TEST_SENT") return "is-sent";
  return "";
};

const formatDraftWhen = (sentAt) => {
  if (!sentAt) return "";
  try {
    const date = new Date(typeof sentAt === "number" ? sentAt : Number(sentAt));
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (err) {
    return "";
  }
};

const AdminAIAutoEmailDraftModal = ({
  open,
  onClose,
  segment = "notParticipatedRegistered1Month",
  segmentLabel = "Last 1 Month Registered - Not Participated",
  recipientCount = 0,
}) => {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState(null);
  const [rows, setRows] = useState([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [testEmail, setTestEmail] = useState("vijaydasari060@gmail.com");
  const [autoSendOnApprove, setAutoSendOnApprove] = useState(true);
  const [polling, setPolling] = useState(false);
  const [showApprovalId, setShowApprovalId] = useState(false);
  const [showDraftList, setShowDraftList] = useState(false);
  const selectedCodeRef = useRef("");

  useEffect(() => {
    selectedCodeRef.current = draft?.code || "";
  }, [draft?.code]);

  const applyDraft = useCallback((next) => {
    if (!next) return;
    setDraft(next);
    setSubject(next.subject || "");
    setBody(next.body || "");
    if (next.preferredTestEmail) setTestEmail(next.preferredTestEmail);
    setShowApprovalId(false);
  }, []);

  const loadDrafts = useCallback(async ({ silent = false } = {}) => {
    try {
      const data = responseData(await listAdminAIAutoEmailDrafts({ segment, pageNo: 1, pageSize: 50 }));
      const list = Array.isArray(data.rows) ? data.rows : [];
      setRows(list);
      if (data.defaultTestEmail) {
        setTestEmail((prev) => (prev && prev.trim() ? prev : data.defaultTestEmail));
      }
      if (typeof data.autoSendTestOnApprove === "boolean") setAutoSendOnApprove(data.autoSendTestOnApprove);
      const selectedCode = selectedCodeRef.current;
      const matched = selectedCode ? list.find((row) => row.code === selectedCode) : null;
      if (matched) {
        setDraft(matched);
        setSubject(matched.subject || "");
        setBody(matched.body || "");
      } else if (!selectedCode && list.length) {
        applyDraft(list[0]);
      } else if (selectedCode && !matched) {
        setDraft(null);
        selectedCodeRef.current = "";
      }
      return list;
    } catch (err) {
      if (!silent) setError(err?.message || "Failed to load auto email drafts.");
      return [];
    }
  }, [segment, applyDraft]);

  const refreshSelectedDraft = useCallback(async () => {
    const code = selectedCodeRef.current;
    if (!code) {
      await loadDrafts({ silent: true });
      return;
    }
    try {
      const data = responseData(await getAdminAIAutoEmailDraft(code));
      if (data.status === "SUCCESS" && data.draft) {
        setDraft(data.draft);
        setSubject(data.draft.subject || "");
        setBody(data.draft.body || "");
        const nextStatus = String(data.draft.status || "").toUpperCase();
        if (nextStatus === "APPROVED" || nextStatus === "TEST_SENT") {
          setMessage(
            nextStatus === "TEST_SENT"
              ? "Approved and test email auto-sent."
              : "Draft approved. Test email is sending / use Send Test Email if needed."
          );
          setError("");
        } else if (nextStatus === "REJECTED") {
          setMessage("Draft was rejected.");
        }
      }
      await loadDrafts({ silent: true });
    } catch (err) {
      await loadDrafts({ silent: true });
    }
  }, [loadDrafts]);

  useEffect(() => {
    if (!open) return undefined;
    setError("");
    setMessage("");
    setDraft(null);
    setShowApprovalId(false);
    setShowDraftList(false);
    selectedCodeRef.current = "";
    loadDrafts();
    return undefined;
  }, [open, loadDrafts]);

  useEffect(() => {
    if (!open) return undefined;
    const waiting = String(draft?.status || "").toUpperCase() === "WAITING_APPROVAL";
    if (!waiting) {
      setPolling(false);
      return undefined;
    }
    setPolling(true);
    const timer = window.setInterval(() => refreshSelectedDraft(), 4000);
    return () => window.clearInterval(timer);
  }, [open, draft?.status, draft?.code, refreshSelectedDraft]);

  if (!open) return null;

  const selectDraft = (row) => {
    applyDraft(row);
    setMessage("");
    setError("");
  };

  const deleteDraft = async (row, event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (!row?.code) return;
    const labelIndex = rows.findIndex((item) => item.code === row.code);
    const label = labelIndex >= 0 ? "Draft " + (rows.length - labelIndex) : "this draft";
    if (!window.confirm("Delete " + label + "? You can still create a new campaign draft anytime.")) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = responseData(await deleteAdminAIAutoEmailDraft(row.code));
      if (data.status !== "SUCCESS") throw new Error(data.message || "Failed to delete draft.");
      const wasSelected = selectedCodeRef.current === row.code;
      if (wasSelected) {
        setDraft(null);
        selectedCodeRef.current = "";
        setSubject("");
        setBody("");
        setShowApprovalId(false);
      }
      setMessage(label + " deleted. Click New campaign draft to start another campaign.");
      const list = await loadDrafts({ silent: true });
      if (wasSelected && list.length) applyDraft(list[0]);
    } catch (err) {
      setError(err?.message || "Failed to delete draft.");
    } finally {
      setBusy(false);
    }
  };

  const createDraft = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = responseData(await createAdminAIAutoEmailDraft({ segment, segmentLabel, channel: "email", testEmail: testEmail.trim() || undefined }));
      if (data.status !== "SUCCESS" && data.status !== "PARTIAL") {
        throw new Error(data.message || "Failed to create draft.");
      }
      applyDraft(data.draft || null);
      setShowDraftList(true);
      const notifyDetail = formatWhatsAppNotifyResults(data.whatsappNotifyResults || data.draft?.whatsappNotifyResults);
      if (data.status === "PARTIAL") {
        setError(data.message || "Draft created, but WhatsApp approval did not reach one or more numbers.");
        if (notifyDetail) setMessage(`WhatsApp send result: ${notifyDetail}`);
      } else {
        setMessage(
          (data.message || "AI content generated and WhatsApp approval sent.")
          + (notifyDetail ? ` (${notifyDetail})` : "")
          + " After APPROVE, test email auto-sends to "
          + (testEmail.trim() || "configured address")
          + "."
        );
      }
      await loadDrafts({ silent: true });
    } catch (err) {
      setError(err?.message || "Failed to create auto email draft.");
    } finally {
      setBusy(false);
    }
  };

  const resendWhatsApp = async () => {
    if (!draft?.code) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = responseData(await resendAdminAIAutoEmailWhatsApp(draft.code));
      if (data.status !== "SUCCESS" && data.status !== "PARTIAL") {
        throw new Error(data.message || "Failed to resend WhatsApp approval.");
      }
      if (data.draft) applyDraft(data.draft);
      const notifyDetail = formatWhatsAppNotifyResults(data.whatsappNotifyResults || data.draft?.whatsappNotifyResults);
      if (data.status === "PARTIAL") {
        setError(data.message || "WhatsApp resend partially failed.");
        if (notifyDetail) setMessage(`WhatsApp send result: ${notifyDetail}`);
      } else {
        setMessage((data.message || "WhatsApp approval resent.") + (notifyDetail ? ` (${notifyDetail})` : ""));
      }
    } catch (err) {
      setError(err?.message || "Failed to resend WhatsApp approval.");
    } finally {
      setBusy(false);
    }
  };

  const scheduleDraftForIst = async (timeIst = "18:50") => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const now = new Date();
      const istParts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(now);
      const y = istParts.find((p) => p.type === "year")?.value;
      const m = istParts.find((p) => p.type === "month")?.value;
      const d = istParts.find((p) => p.type === "day")?.value;
      const scheduleDate = `${y}-${m}-${d}`;
      const data = responseData(await scheduleAdminAIAutoEmailDraft({
        segment,
        segmentLabel,
        scheduleDate,
        scheduleTime: timeIst,
        testEmail: testEmail.trim() || undefined,
      }));
      if (data.status !== "SCHEDULED" && data.status !== "SUCCESS") {
        throw new Error(data.message || "Failed to schedule auto email campaign.");
      }
      setMessage(data.message || `Scheduled for ${scheduleDate} ${timeIst} IST.`);
    } catch (err) {
      setError(err?.message || "Failed to schedule auto email campaign.");
    } finally {
      setBusy(false);
    }
  };

  const decide = async (action, { sendAfterApprove = false } = {}) => {
    if (!draft?.code) return;
    if (sendAfterApprove && !testEmail.trim()) {
      setError("Enter your test email first, then click Approve and Send Test Email.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = responseData(await decideAdminAIAutoEmailDraft({
        code: draft.code,
        action,
        subject,
        body,
        testEmail: testEmail.trim() || undefined,
        sendAfterApprove: Boolean(sendAfterApprove),
      }));
      if (data.status !== "SUCCESS" && data.status !== "PARTIAL") {
        throw new Error(data.message || "Failed to " + action.toLowerCase() + " draft.");
      }
      if (data.draft) {
        setDraft(data.draft);
        setSubject(data.draft.subject || subject);
        setBody(data.draft.body || body);
      }
      setMessage(data.message || (action === "APPROVE" ? "Draft approved." : "Draft rejected."));
      await loadDrafts({ silent: true });
    } catch (err) {
      setError(err?.message || "Failed to " + action.toLowerCase() + " draft.");
    } finally {
      setBusy(false);
    }
  };

  const sendTest = async () => {
    if (!draft?.code) return;
    if (!testEmail.trim()) {
      setError("Enter a test email address.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = responseData(await sendAdminAIAutoEmailTest({ code: draft.code, testEmail: testEmail.trim() }));
      if (data.status !== "SUCCESS" && data.status !== "PARTIAL") {
        throw new Error(data.message || "Send test failed.");
      }
      setMessage(data.message || "Test email sent to " + testEmail.trim() + ".");
      if (data.draft) {
        setDraft(data.draft);
        setSubject(data.draft.subject || "");
        setBody(data.draft.body || "");
      }
      await loadDrafts({ silent: true });
    } catch (err) {
      setError(err?.message || "Failed to send test email.");
    } finally {
      setBusy(false);
    }
  };

  const status = String(draft?.status || "").toUpperCase();
  const waiting = status === "WAITING_APPROVAL";
  const approved = status === "APPROVED";
  const editable = waiting || approved;
  const selectedIndex = rows.findIndex((row) => row.code === draft?.code);

  return (
    <div className="admin-ai-campaign-backdrop" onClick={onClose}>
      <section
        className="admin-ai-campaign-modal admin-ai-auto-email-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Auto email draft"
      >
        <div className="admin-ai-campaign-head">
          <div>
            <h5><FaRobot /> Auto Email Campaign</h5>
            <p>{segmentLabel} · {recipientCount} lenders · Test mode (no live blast)</p>
          </div>
          <button type="button" className="admin-ai-close-btn" onClick={onClose}>Close</button>
        </div>

        <div className={"admin-ai-pro-note " + (approved || status === "TEST_SENT" ? "admin-ai-campaign-test-ok" : "")}>
          <strong>
            {waiting
              ? "Step 1: AI draft ready — waiting for WhatsApp approval"
              : approved
                ? (autoSendOnApprove ? "Step 2: Approved — test email auto-sends" : "Step 2: Approved — send a test email")
                : status === "TEST_SENT"
                  ? "Test email sent — create a new campaign anytime"
                  : status === "REJECTED"
                    ? "Draft rejected — create a new campaign anytime"
                    : "Create a new campaign draft anytime"}
          </strong>{" "}
          {waiting
            ? "Either approval number can reply APPROVE/REJECT. Status auto-refreshes every 4 seconds. After APPROVE, test email sends automatically to the address below."
            : approved
              ? "Change the test email if needed. Live blast stays off in test mode (not all lenders)."
              : "New campaign draft auto-generates AI content and WhatsApps both approval numbers. After APPROVE, test email auto-sends (editable default)."}
        </div>

        <div className="admin-ai-auto-email-toolbar">
          <button type="button" className="admin-ai-search-btn" disabled={busy} onClick={createDraft}>
            <FaRobot /> {busy ? "Working..." : "New campaign draft"}
          </button>
          <button
            type="button"
            className="admin-ai-search-btn"
            disabled={busy}
            onClick={() => scheduleDraftForIst("18:50")}
            title="At 18:50 IST: create draft + WhatsApp approval; after APPROVE send WhatsApp to this segment"
          >
            <FaPaperPlane /> Schedule 18:50 IST
          </button>
          <button type="button" className="admin-ai-auto-email-secondary-btn" disabled={busy} onClick={() => refreshSelectedDraft()}>
            <FaSync className={polling ? "is-spinning" : ""} /> {polling ? "Auto-refreshing" : "Refresh status"}
          </button>
          {draft && String(draft.status || "").toUpperCase() === "WAITING_APPROVAL" ? (
            <button type="button" className="admin-ai-search-btn" disabled={busy} onClick={resendWhatsApp} title="Resend APPROVE/REJECT WhatsApp to both approval numbers">
              <FaWhatsapp /> Resend WhatsApp
            </button>
          ) : null}
        </div>

        {rows.length ? (
          <div className="admin-ai-auto-email-draft-box">
            <div className="admin-ai-auto-email-draft-box-head">
              <div>
                <strong>Saved drafts</strong>
                <span>{rows.length} draft{rows.length === 1 ? "" : "s"} stored - create new anytime</span>
              </div>
              <button type="button" className="admin-ai-auto-email-view-id-btn" onClick={() => setShowDraftList((prev) => !prev)}>
                {showDraftList ? <FaEyeSlash /> : <FaEye />}
                {showDraftList ? "Hide drafts" : "View drafts"}
              </button>
            </div>
            {!showDraftList && draft ? (
              <div className={"admin-ai-auto-email-draft-summary " + statusClass(draft.status)}>
                <div>
                  <strong>Selected: Draft {selectedIndex >= 0 ? rows.length - selectedIndex : 1}</strong>
                  <span>{statusLabel(draft.status)}</span>
                </div>
                <small>{formatDraftWhen(draft.sentAt) || "Open View drafts to switch or delete"}</small>
              </div>
            ) : null}
            {showDraftList ? (
              <div className="admin-ai-auto-email-draft-scroll">
                {rows.map((row, index) => (
                  <div
                    key={row.code || row.id}
                    className={"admin-ai-auto-email-draft-row " + (draft?.code === row.code ? "is-active " : "") + statusClass(row.status)}
                  >
                    <button type="button" className="admin-ai-auto-email-draft-row-main" onClick={() => selectDraft(row)}>
                      <div>
                        <strong>Draft {rows.length - index}</strong>
                        <small>{formatDraftWhen(row.sentAt) || "-"}</small>
                      </div>
                      <span className={"admin-ai-auto-email-badge " + statusClass(row.status)}>{statusLabel(row.status)}</span>
                    </button>
                    <button
                      type="button"
                      className="admin-ai-auto-email-draft-delete"
                      title="Delete draft"
                      disabled={busy}
                      onClick={(event) => deleteDraft(row, event)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="admin-ai-auto-email-empty">
            <FaWhatsapp />
            <p>No drafts yet. Click New campaign draft to generate AI content and notify WhatsApp approvers.</p>
          </div>
        )}

        {draft ? (
          <>
            <div className="admin-ai-auto-email-status-bar">
              <span className={"admin-ai-auto-email-badge " + statusClass(draft.status)}>{statusLabel(draft.status)}</span>
              <span><strong>Draft</strong> {selectedIndex >= 0 ? rows.length - selectedIndex : 1}</span>
              <span><strong>Mode</strong> {draft.testMode === false ? "LIVE" : "TEST"}</span>
              {draft.approvedBy ? (
                <span>
                  <strong>Approved by</strong>{" "}
                  {String(draft.approvedBy).includes("admin") ? "Admin panel" : "WhatsApp"}
                </span>
              ) : null}
              <button type="button" className="admin-ai-auto-email-view-id-btn" onClick={() => setShowApprovalId((prev) => !prev)}>
                {showApprovalId ? <FaEyeSlash /> : <FaEye />}
                {showApprovalId ? "Hide approval ID" : "View approval ID"}
              </button>
            </div>

            {showApprovalId ? (
              <div className="admin-ai-auto-email-id-panel">
                <div>
                  <strong>WhatsApp approval ID</strong>
                  <code>{draft.code}</code>
                </div>
                <p>Approvers reply: <code>APPROVE {draft.code}</code> or <code>REJECT {draft.code}</code></p>
              </div>
            ) : null}

            <div className="admin-ai-campaign-grid admin-ai-auto-email-grid">
              <label className="admin-ai-campaign-full">
                Subject
                <input value={subject} onChange={(e) => setSubject(e.target.value)} disabled={busy || !editable} />
              </label>
              <label className="admin-ai-campaign-full">
                Email body
                <textarea rows={10} value={body} onChange={(e) => setBody(e.target.value)} disabled={busy || !editable} />
              </label>
            </div>

            {(waiting || approved) ? (
              <div className="admin-ai-auto-email-send-panel">
                <div className="admin-ai-auto-email-send-panel-head">
                  <strong>{waiting ? "Test email (auto-send after approval)" : (autoSendOnApprove ? "Approved - auto send uses this email" : "Approved - send test email")}</strong>
                  <span>
                    Default test inbox is editable. Test mode sends only here (not to all {recipientCount} lenders).
                    Approval numbers: 8374108739 / 9640035218.
                  </span>
                </div>
                <div className="admin-ai-auto-email-test-row">
                  <input
                    type="email"
                    placeholder="Your test email (required to send)"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    disabled={busy}
                  />
                  {waiting ? (
                    <button
                      type="button"
                      className="admin-ai-search-btn"
                      disabled={busy || !testEmail.trim()}
                      onClick={() => decide("APPROVE", { sendAfterApprove: true })}
                    >
                      <FaPaperPlane /> Approve (auto-sends test email)
                    </button>
                  ) : (
                    <button type="button" className="admin-ai-search-btn" disabled={busy || !testEmail.trim()} onClick={sendTest}>
                      <FaPaperPlane /> Send Test Email
                    </button>
                  )}
                </div>
                {waiting ? (
                  <div className="admin-ai-auto-email-actions">
                    <button type="button" className="admin-ai-auto-email-secondary-btn" disabled={busy} onClick={() => decide("APPROVE")}>
                      <FaCheck /> Approve only
                    </button>
                    <button type="button" className="admin-ai-auto-email-reject-btn" disabled={busy} onClick={() => decide("REJECT")}>
                      <FaTimes /> Reject
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        ) : null}

        {message ? <div className="admin-ai-auto-email-success">{message}</div> : null}
        {error ? <div className="admin-ai-auto-email-error">{error}</div> : null}
      </section>
    </div>
  );
};

export default AdminAIAutoEmailDraftModal;
