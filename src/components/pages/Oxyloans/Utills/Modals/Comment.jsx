import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { uploadqueryImage, writequery } from "../../../../HttpRequest/afterlogin";
import "./Comment.css";

function Comment({ data, ticket, onClose }) {
  const [reply, setReply] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [documentId, setDocumentId] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [previewModal, setPreviewModal] = useState(null);

  // Extract queries solely from /queryDetailsBasedOnUserId (ticket.listOfPendingQueries)
  const sourceQueries = Array.isArray(ticket?.listOfPendingQueries)
    ? ticket.listOfPendingQueries
    : Array.isArray(ticket)
    ? ticket
    : Array.isArray(data?.listOfPendingQueries)
    ? data.listOfPendingQueries
    : [];

  // Deduplicate entries from /queryDetailsBasedOnUserId
  const seenKeys = new Set();
  const rawList = [];

  for (const item of sourceQueries) {
    if (!item) continue;
    const text = String(item.pendingQuereis || item.comments || "").trim();
    const status = String(item.status || "").trim();
    const role = String(item.respondedBy || item.resolvedBy || "").trim().toUpperCase();
    const date = String(item.respondedOn || "").trim();
    const docId = String(item.adminDocumentId || item.documentId || 0);
    const key = item.id ? `id-${item.id}` : `${text}|${status}|${role}|${date}|${docId}`;

    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      rawList.push(item);
    }
  }

  // Active adminScreenshotUrl across all sources
  const itemWithAdminScreenshot = rawList.find(
    (item) => item?.adminScreenshotUrl && String(item.adminScreenshotUrl).trim() !== ""
  );
  const adminScreenshotUrl =
    itemWithAdminScreenshot?.adminScreenshotUrl ||
    (ticket?.adminScreenshotUrl && String(ticket.adminScreenshotUrl).trim() !== ""
      ? ticket.adminScreenshotUrl
      : null) ||
    itemWithAdminScreenshot?.screenshotUrl ||
    (ticket?.screenshotUrl && String(ticket.screenshotUrl).trim() !== ""
      ? ticket.screenshotUrl
      : null) ||
    null;

  const adminFileName =
    itemWithAdminScreenshot?.adminFileName ||
    ticket?.adminFileName ||
    itemWithAdminScreenshot?.fileName ||
    ticket?.fileName ||
    null;

  const getStatusColor = (status) => {
    const s = String(status || "").toLowerCase().trim();
    if (s === "completed" || s === "resolved" || s === "closed") {
      return { bg: "#eafaf3", text: "#03885e", border: "#a7e6cb" };
    }
    if (s === "cancelled") {
      return { bg: "#fff0f2", text: "#e12b3c", border: "#ffcbd1" };
    }
    if (s === "reopen" || s === "reopened") {
      return { bg: "#f3e8ff", text: "#7e22ce", border: "#d8b4fe" };
    }
    if (s === "in-progress" || s === "inprogress" || s === "in progress") {
      return { bg: "#eff5ff", text: "#2468ed", border: "#c6d9ff" };
    }
    return { bg: "#fff7df", text: "#d88700", border: "#f5d484" };
  };

  // 1. Initial user query from ticket.query
  const hasInitialQueryInList = rawList.some((item) => {
    const text = String(item.pendingQuereis || item.comments || "").trim().toLowerCase();
    const queryText = String(ticket?.query || "").trim().toLowerCase();
    return queryText && text === queryText;
  });

  const initialEntry =
    ticket?.query && !hasInitialQueryInList
      ? [
          {
            id: `initial-${ticket?.id || 0}`,
            pendingQuereis: ticket.query,
            senderName: ticket?.name?.trim() || "User",
            respondedOn: ticket?.receivedOn || "-",
            role: "USER",
            screenshotUrl: ticket?.screenshotUrl,
            fileName: ticket?.fileName,
            status: "Pending",
            isInitialQuery: true,
          },
        ]
      : [];

  // Sort queries in chronological order (oldest to newest):
  // If items have database auto-increment IDs, sort by ID ascending.
  // Otherwise, reverse the descending array returned from the backend.
  const hasIds = rawList.some((item) => Boolean(item.id));
  const chronologicalReplies = hasIds
    ? [...rawList].sort((a, b) => Number(a.id || 0) - Number(b.id || 0))
    : [...rawList].reverse();

  const replies = chronologicalReplies.map((item, idx) => {
    const isUser =
      String(item.respondedBy || "").toUpperCase() === "USER" ||
      (String(item.resolvedBy || "").toUpperCase() === "USER" &&
        String(item.status || "").toLowerCase() !== "completed");
    return {
      ...item,
      id: item.id || item.adminDocumentId || `reply-${idx}`,
      role: isUser ? "USER" : "ADMIN",
      senderName: isUser
        ? ticket?.name?.trim() || item.resolvedBy || "User"
        : item.resolvedBy || item.respondedBy || "Support Admin",
      status: item.status || (isUser ? "Pending" : "Completed"),
      adminScreenshotUrl: item.adminScreenshotUrl,
      adminFileName: item.adminFileName,
      screenshotUrl: item.screenshotUrl,
    };
  });

  // Check if ticket.comments contains a latest admin completion not yet in replies
  const hasCommentsInList = replies.some((item) => {
    const text = String(item.pendingQuereis || item.comments || "").trim().toLowerCase();
    const commentText = String(ticket?.comments || "").trim().toLowerCase();
    return commentText && text === commentText;
  });

  const latestAdminCompletionEntry =
    ticket?.comments &&
    !hasCommentsInList &&
    String(ticket?.status || "").toLowerCase() === "completed"
      ? [
          {
            id: `admin-completion-latest-${ticket?.id || 0}`,
            pendingQuereis: ticket?.comments,
            senderName: ticket?.resolvedBy || "Support Admin",
            respondedOn: ticket?.respondedOn || ticket?.receivedOn || "-",
            role: "ADMIN",
            isResolution: true,
            status: "Completed",
            adminScreenshotUrl: ticket?.adminScreenshotUrl,
            adminFileName: ticket?.adminFileName,
          },
        ]
      : [];

  // If ticket is cancelled, add cancellation event entry
  const isCancelled = String(ticket?.status || "").toLowerCase() === "cancelled";
  const cancellationEntry = isCancelled
    ? [
        {
          id: `cancellation-${ticket?.id || 0}`,
          pendingQuereis: "Ticket has been cancelled by User",
          senderName: ticket?.name?.trim() || "User",
          respondedOn: ticket?.respondedOn || ticket?.receivedOn || "-",
          role: "USER",
          status: "Cancelled",
          isCancellation: true,
        },
      ]
    : [];

  const entries = [
    ...initialEntry,
    ...replies,
    ...latestAdminCompletionEntry,
    ...cancellationEntry,
  ];

  // Active ticket status reflects the ticket status and timeline
  const lastEntry = entries.length ? entries[entries.length - 1] : null;
  const ticketStatus = isCancelled
    ? "Cancelled"
    : String(ticket?.status || "").toLowerCase() === "completed" &&
      String(lastEntry?.status || "").toLowerCase() !== "reopen"
    ? "Completed"
    : lastEntry?.status ||
      ticket?.status ||
      data?.status ||
      data?.data?.status ||
      "Pending";

  const isCompletedOrCancelled =
    String(ticketStatus).toLowerCase() === "completed" ||
    String(ticketStatus).toLowerCase() === "cancelled" ||
    String(ticketStatus).toLowerCase() === "closed";
  const canReopen = isCompletedOrCancelled;
  const [isReopened, setIsReopened] = useState(!canReopen);

  const statusStyle = getStatusColor(ticketStatus);

  const ticketId =
    ticket?.ticketId ||
    data?.ticketId ||
    data?.data?.ticketId ||
    rawList.find((item) => item?.ticketId)?.ticketId ||
    "-";

  const handleAttachmentChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAttachedFile(file);
    setIsUploading(true);
    setSendError("");
    try {
      const response = await uploadqueryImage(file);
      if (response?.request?.status === 200 && response.data?.documentId) {
        setDocumentId(response.data.documentId);
      } else {
        setAttachedFile(null);
        setSendError("Unable to upload the attachment. Please try again.");
      }
    } catch (error) {
      setAttachedFile(null);
      setSendError(error?.response?.data?.errorMessage || "Unable to upload the attachment. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Modal show onHide={onClose} centered size="lg" className="ticket-comments-modal">
      <Modal.Header closeButton>
        <div className="comments-title-wrap" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", width: "100%" }}>
          <span className="comments-icon">#</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <Modal.Title style={{ margin: 0 }}>View Comments - Ticket #{ticketId}</Modal.Title>
              {ticketStatus && (
                <span
                  className={`ticket-status status-${String(ticketStatus).toLowerCase().replace(/\s+/g, "-")}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    fontWeight: 600,
                    background: statusStyle.bg,
                    color: statusStyle.text,
                    border: `1px solid ${statusStyle.border}`,
                  }}
                >
                  <i style={{ width: "5px", height: "5px", borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                  {ticketStatus}
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "2px", flexWrap: "wrap" }}>
              <small>Ticket ID: {ticketId}</small>
              {ticketStatus && (
                <small style={{ color: "#4a5b73" }}>
                  Status: <strong>{ticketStatus}</strong>
                </small>
              )}
            </div>
          </div>
          {adminScreenshotUrl && (
            <div style={{ marginRight: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                type="button"
                onClick={() =>
                  setPreviewModal({
                    url: adminScreenshotUrl,
                    name: adminFileName || "Admin Screenshot",
                    isUser: false,
                  })
                }
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  background: "#eff5ff",
                  border: "1px solid #bfd5ff",
                  color: "#1858c7",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <i className="fa-regular fa-image" />
                <span>{adminFileName ? adminFileName : "Preview Screenshot"}</span>
                <i className="fa-solid fa-eye" style={{ fontSize: "10px" }} />
              </button>
              <a
                href={adminScreenshotUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "5px 8px",
                  borderRadius: "6px",
                  background: "#fff",
                  border: "1px solid #bfd5ff",
                  color: "#1858c7",
                  fontSize: "11px",
                  textDecoration: "none",
                }}
                title="Open in new window"
              >
                <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "9px" }} />
              </a>
            </div>
          )}
        </div>
      </Modal.Header>
      <Modal.Body>
        {(ticketStatus || adminScreenshotUrl) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
              padding: "10px 14px",
              marginBottom: "14px",
              borderRadius: "8px",
              background: "#f4f7fa",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>Ticket Status:</span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "3px 10px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: 600,
                  background: statusStyle.bg,
                  color: statusStyle.text,
                  border: `1px solid ${statusStyle.border}`,
                }}
              >
                <i style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                {ticketStatus}
              </span>
            </div>

            {adminScreenshotUrl && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#475569" }}>Screenshot / Attachment:</span>
                <button
                  type="button"
                  onClick={() =>
                    setPreviewModal({
                      url: adminScreenshotUrl,
                      name: adminFileName || "Admin Screenshot",
                      isUser: false,
                    })
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: "#eff5ff",
                    border: "1px solid #bfd5ff",
                    color: "#1858c7",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <i className="fa-regular fa-image" />
                  <span>{adminFileName ? adminFileName : "Preview Screenshot"}</span>
                  <i className="fa-solid fa-eye" style={{ fontSize: "10px" }} />
                </button>
                <a
                  href={adminScreenshotUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "4px 8px",
                    borderRadius: "6px",
                    background: "#fff",
                    border: "1px solid #bfd5ff",
                    color: "#1858c7",
                    fontSize: "11px",
                    textDecoration: "none",
                  }}
                  title="Open in new window"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "9px" }} />
                </a>
              </div>
            )}
          </div>
        )}

        <div className="conversation-stream">
          {entries.length ? (
            entries.map((item, index) => {
              const isUser = item.role === "USER";
              const sender = item.senderName || (isUser ? "User" : "Support Admin");
              const screenshot =
                (item.adminScreenshotUrl && String(item.adminScreenshotUrl).trim() !== ""
                  ? item.adminScreenshotUrl
                  : null) ||
                (item.screenshotUrl && String(item.screenshotUrl).trim() !== ""
                  ? item.screenshotUrl
                  : null) ||
                null;
              const fileName = item.adminFileName || item.fileName || null;

              return (
                <div
                  className={`chat-message ${isUser ? "chat-message-user" : "chat-message-admin"}`}
                  key={item.id || item.adminDocumentId || index}
                >
                  <div className="chat-message-meta">
                    <span className="chat-avatar">{String(sender).trim().charAt(0).toUpperCase()}</span>
                    <strong>{sender}</strong>
                    <span className={`chat-role ${isUser ? "chat-role-user" : "chat-role-admin"}`}>
                      {isUser ? "USER" : "ADMIN"}
                    </span>
                    {item.status && (
                      <span
                        style={{
                          marginLeft: "4px",
                          padding: "1px 6px",
                          borderRadius: "10px",
                          fontSize: "9px",
                          fontWeight: 600,
                          background: getStatusColor(item.status).bg,
                          color: getStatusColor(item.status).text,
                          border: `1px solid ${getStatusColor(item.status).border}`,
                        }}
                      >
                        {item.status}
                      </span>
                    )}
                    <time>{item.respondedOn || "-"}</time>
                  </div>
                  <div className="chat-bubble">
                    {item.pendingQuereis || item.comments || "-"}

                    {screenshot && (
                      <div
                        style={{
                          marginTop: "8px",
                          paddingTop: "8px",
                          borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color: isUser ? "#087e61" : "#1e3a66",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <i className="fa-solid fa-paperclip" />
                          <span>{isUser ? "User Attachment" : "Admin Attachment"}:</span>
                          {fileName && (
                            <span style={{ fontWeight: 500, color: "#475569" }}>{fileName}</span>
                          )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewModal({
                                url: screenshot,
                                name: fileName || (isUser ? "User Attachment" : "Admin Attachment"),
                                isUser,
                              })
                            }
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              background: isUser ? "#f4fffa" : "#eff5ff",
                              border: `1px solid ${isUser ? "#a9ead1" : "#bfd5ff"}`,
                              color: isUser ? "#008e67" : "#1858c7",
                              fontSize: "11px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            <i className="fa-regular fa-image" />
                            <span>Preview</span>
                            <i className="fa-solid fa-eye" style={{ fontSize: "10px" }} />
                          </button>
                          <a
                            href={screenshot}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              background: "#fff",
                              border: "1px solid #cbd5e1",
                              color: "#475569",
                              fontSize: "11px",
                              textDecoration: "none",
                            }}
                            title="Open in new window"
                          >
                            <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "9px" }} />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="comments-empty">No conversation yet.</div>
          )}
        </div>

        <div className="reply-panel">
          <div className="reply-panel-heading">
            <strong>WRITE A REPLY / ADD COMMENT</strong>
            <span>Visible to support desk &amp; administrators</span>
          </div>
          {canReopen && !isReopened && (
            <button
              type="button"
              className="reopen-ticket-btn"
              onClick={() => setIsReopened(true)}
            >
              <i className="fa-solid fa-rotate-left" /> Reopen Ticket to Reply
            </button>
          )}
          <textarea
            disabled={canReopen && !isReopened}
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder={
              canReopen && !isReopened
                ? "Click Reopen Ticket to add a reply..."
                : "Type your reply or question for the support admin here..."
            }
          />
          <div className="reply-actions">
            <label
              className={`attach-btn ${isUploading ? "is-uploading" : ""} ${
                canReopen && !isReopened ? "is-disabled" : ""
              }`}
            >
              <i className="fa-solid fa-paperclip" />{" "}
              {isUploading ? "Uploading..." : attachedFile ? attachedFile.name : "Attach File / Screenshot"}
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleAttachmentChange}
                disabled={canReopen && !isReopened}
                hidden
              />
            </label>
            <small>(PDF, PNG, JPG up to 5MB)</small>
            <div>
              <button type="button" className="modal-close-btn" onClick={onClose}>
                Close
              </button>
              <button
                type="button"
                className="modal-send-btn"
                disabled={
                  !reply.trim() ||
                  isSending ||
                  isUploading ||
                  (!ticket?.id && !rawList.find((item) => item?.id)?.id) ||
                  (canReopen && !isReopened)
                }
                onClick={async () => {
                  setIsSending(true);
                  setSendError("");
                  try {
                    const ticketIdVal = ticket?.id || rawList.find((item) => item?.id)?.id;
                    const response = await writequery({
                      query: reply.trim(),
                      documentId,
                      email: ticket?.email || "",
                      mobileNumber: ticket?.mobileNumber || "",
                      id: ticketIdVal,
                      status:
                        ticketStatus === "Cancelled" || ticketStatus === "Completed"
                          ? ticketStatus
                          : null,
                      respondedBy: "USER",
                      profiledata: {
                        email: ticket?.email || "",
                        mobileNumber: ticket?.mobileNumber || "",
                      },
                      urlquery: "",
                    });
                    if (response?.request?.status === 200) {
                      setReply("");
                      onClose();
                    } else {
                      setSendError("Unable to send your reply. Please try again.");
                    }
                  } catch (error) {
                    setSendError(
                      error?.response?.data?.errorMessage ||
                        "Unable to send your reply. Please try again."
                    );
                  } finally {
                    setIsSending(false);
                  }
                }}
              >
                <i className="fa-solid fa-paper-plane" /> {isSending ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
          {sendError && <div className="reply-error">{sendError}</div>}
        </div>
      </Modal.Body>
    </Modal>

    {previewModal && (
      <Modal
        show
        onHide={() => setPreviewModal(null)}
        centered
        size="lg"
        style={{ zIndex: 1060 }}
      >
        <Modal.Header closeButton>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <i className="fa-regular fa-image" style={{ color: "#2563eb", fontSize: "16px" }} />
            <Modal.Title style={{ fontSize: "15px", fontWeight: 600, margin: 0 }}>
              {previewModal.name || "Attachment Preview"}
            </Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body style={{ padding: "16px", textAlign: "center", background: "#f8fafc" }}>
          <img
            src={previewModal.url}
            alt={previewModal.name || "Attachment"}
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              objectFit: "contain",
              display: "block",
              margin: "0 auto",
            }}
          />
        </Modal.Body>
        <Modal.Footer style={{ justifyContent: "space-between", padding: "10px 16px" }}>
          <a
            href={previewModal.url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "6px",
              background: "#eff5ff",
              border: "1px solid #bfd5ff",
              color: "#1858c7",
              fontSize: "12px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <i className="fa-solid fa-arrow-up-right-from-square" />
            <span>Open in New Tab</span>
          </a>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setPreviewModal(null)}
            style={{ fontSize: "12px", padding: "6px 16px" }}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    )}
  </>
);
}

export default Comment;
