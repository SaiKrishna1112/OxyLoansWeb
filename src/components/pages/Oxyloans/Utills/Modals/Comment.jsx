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
  const canReopen = ticket?.status === "Completed" || ticket?.status === "Cancelled";
  const [isReopened, setIsReopened] = useState(!canReopen);
  const replies = data?.data || ticket?.listOfPendingQueries || [];
  const entries = [
    {
      pendingQuereis: ticket?.query,
      respondedBy: ticket?.name?.trim() || "User",
      respondedOn: ticket?.receivedOn,
      role: "USER",
    },
    ...replies,
    ...(ticket?.comments ? [{
      pendingQuereis: ticket.comments,
      respondedBy: ticket.resolvedBy || "Admin",
      respondedOn: ticket.respondedOn || ticket.receivedOn,
      role: "ADMIN",
      isResolution: true,
    }] : []),
  ].filter((item) => item.pendingQuereis || item.comments).map((item, index) => ({
    ...item,
    role: index === 0 ? "USER" : String(item.respondedBy || "ADMIN").toUpperCase(),
  }));
  const ticketId = ticket?.ticketId || data?.ticketId || replies[0]?.ticketId || "-";

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
    <Modal show onHide={onClose} centered size="lg" className="ticket-comments-modal">
      <Modal.Header closeButton>
        <div className="comments-title-wrap">
          <span className="comments-icon">#</span>
          <div><Modal.Title>View Comments - Ticket #{ticketId}</Modal.Title><small>Ticket ID: {ticketId}</small></div>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="conversation-stream">
          {entries.length ? entries.map((item, index) => {
            const isUser = item.role === "USER";
            const sender = isUser
              ? ticket?.name?.trim() || "User"
              : String(item.respondedBy || "Support Admin").trim();
            return (
              <div className={`chat-message ${isUser ? "chat-message-user" : "chat-message-admin"}`} key={item.id || index}>
                <div className="chat-message-meta"><span className="chat-avatar">{String(sender).trim().charAt(0).toUpperCase()}</span><strong>{sender}</strong><span className={`chat-role ${isUser ? "chat-role-user" : "chat-role-admin"}`}>{isUser ? "USER" : "ADMIN"}</span><time>{item.respondedOn || "-"}</time></div>
                <div className="chat-bubble">{item.pendingQuereis || item.comments || "-"}</div>
              </div>
            );
          }) : <div className="comments-empty">No conversation yet.</div>}
        </div>
        <div className="reply-panel">
          <div className="reply-panel-heading"><strong>WRITE A REPLY / ADD COMMENT</strong><span>Visible to support desk &amp; administrators</span></div>
          {canReopen && !isReopened && <button type="button" className="reopen-ticket-btn" onClick={() => setIsReopened(true)}><i className="fa-solid fa-rotate-left" /> Reopen Ticket to Reply</button>}
          <textarea disabled={canReopen && !isReopened} value={reply} onChange={(event) => setReply(event.target.value)} placeholder={canReopen && !isReopened ? "Click Reopen Ticket to add a reply..." : "Type your reply or question for the support admin here..."} />
          <div className="reply-actions"><label className={`attach-btn ${isUploading ? "is-uploading" : ""} ${canReopen && !isReopened ? "is-disabled" : ""}`}><i className="fa-solid fa-paperclip" /> {isUploading ? "Uploading..." : attachedFile ? attachedFile.name : "Attach File / Screenshot"}<input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleAttachmentChange} disabled={canReopen && !isReopened} hidden /></label><small>(PDF, PNG, JPG up to 5MB)</small><div><button type="button" className="modal-close-btn" onClick={onClose}>Close</button><button type="button" className="modal-send-btn" disabled={!reply.trim() || isSending || isUploading || !ticket?.id || (canReopen && !isReopened)} onClick={async () => {
            setIsSending(true);
            setSendError("");
            try {
              const response = await writequery({
                query: reply.trim(),
                documentId,
                email: ticket.email,
                mobileNumber: ticket.mobileNumber,
                id: ticket.id,
                status: ticket.status === "Cancelled" || ticket.status === "Completed" ? ticket.status : null,
                respondedBy: "USER",
                profiledata: { email: ticket.email, mobileNumber: ticket.mobileNumber },
                urlquery: "",
              });
              if (response?.request?.status === 200) {
                setReply("");
                onClose();
              } else {
                setSendError("Unable to send your reply. Please try again.");
              }
            } catch (error) {
              setSendError(error?.response?.data?.errorMessage || "Unable to send your reply. Please try again.");
            } finally {
              setIsSending(false);
            }
          }}><i className="fa-solid fa-paper-plane" /> {isSending ? "Sending..." : "Send Reply"}</button></div></div>
          {sendError && <div className="reply-error">{sendError}</div>}
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default Comment;
