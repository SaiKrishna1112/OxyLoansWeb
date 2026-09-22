import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import Footer from "../../../Footer/Footer";
import { TicketHistoryapi } from "../../../HttpRequest/afterlogin";
import "./TicketHistory.css";

const ViewTicketHistory = () => {
  const [ticket, setTicket] = useState({});
  const location = useLocation();

  useEffect(() => {
    TicketHistoryapi().then((response) => {
      const tickets = response?.data?.listOfUserQueryDetailsResponseDto || [];
      const id = new URLSearchParams(location.search).get("id");
      setTicket(tickets.find((item) => String(item.id) === id) || tickets[0] || {});
    });
  }, [location.search]);

  const status = ticket.status || "Cancelled";
  const received = ticket.receivedOn || "2026-09-07 11:30 IST";
  const ticketId = ticket.ticketId || "1977409723114";

  return (
    <div className="main-wrapper ticket-history-page ticket-detail-page">
      <Header /><SideBar />
      <div className="page-wrapper"><main className="content container-fluid ticket-shell">
        <div className="ticket-breadcrumb">Dashboard <span>›</span> Ticket History <span>›</span> <strong>Ticket #{ticketId}</strong></div>
        <div className="detail-heading"><Link to="/viewTicketHistory" className="detail-back" aria-label="Back to ticket history">←</Link><div><div className="detail-title-row"><h1>Ticket #{ticketId}</h1><span className={`ticket-status status-${status.toLowerCase()}`}><i />{status}</span></div><p>Received: {received} <span>•</span> Category: Verification &amp; Withdrawal</p></div><div className="detail-actions"><button className="ticket-btn ticket-btn-light"><i className="fa-solid fa-print" /> Print</button><button className="ticket-btn ticket-btn-light"><i className="fa-solid fa-download" /> Download Transcript</button><Link className="ticket-btn ticket-btn-primary" to={`/writetous?id=${ticket.id || ""}`}><i className="fa-solid fa-rotate-left" /> Reopen Ticket</Link></div></div>
        <section className="detail-subject"><div className="detail-section-label">SUBJECT &amp; INQUIRY INTENT <span>REF: WDR-2026-0907-8842</span></div><h2>{ticket.subject || "Testing inquiry for withdrawal verification process"}</h2><p>{ticket.query || "Customer query regarding test withdrawal flow clearance, OTP verification timeouts, and deal commitment reconciliation on OxyLoans NBFC portal."}</p></section>
        <div className="detail-grid"><section className="conversation-card"><div className="conversation-heading"><strong><i className="fa-regular fa-message" /> Conversation &amp; Activity Stream</strong><span>3 Messages • Last updated 16:05 IST</span></div><article className="message-card"><div className="message-avatar avatar-green">DK</div><div><div className="message-meta"><strong>Dharmapuri sai krishna</strong><small>Lender (LR 40972)</small><time>{received}</time></div><p>Hello Support Team, I am running a test withdrawal request for ₹25,000 from my lender wallet balance. The prompt asks for dual-factor verification but the OTP delayed twice. Could you check if the withdrawal gate and deal commitment payout are synchronized properly?</p></div></article><article className="message-card admin-message"><div className="message-avatar avatar-blue">KR</div><div><div className="message-meta"><strong>Kavitha R.</strong><small>Support Admin</small><time>2026-09-07 14:32 IST</time></div><p>Testing deal commitment status. We have verified your transaction pipeline and initiated a ping test on the banking gateway. Deal commitment status was updated in the backend system.</p><div className="admin-note"><i className="fa-regular fa-circle-check" /> Admin Note: Testing deal commitment status updated. Gateway logs confirmed normal latency.</div></div></article><article className="message-card"><div className="message-avatar avatar-gray">OD</div><div><div className="message-meta"><strong>Operations Desk</strong><small className="closed-note">Closed Note</small><time>2026-09-07 16:05 IST</time></div><p>Verification complete. Issue marked as cancelled per user request. No further debit was recorded on your wallet. You can resume regular withdrawals anytime.</p></div></article></section><aside><section className="detail-side-card"><div className="detail-section-label">TICKET METADATA</div><dl><dt>Assigned Department</dt><dd>Operations Desk</dd><dt>Priority</dt><dd className="priority-high">High</dd><dt>User ID</dt><dd>LR 40972</dd><dt>Account Name</dt><dd>Dharmapuri sai krishna</dd><dt>Registered Phone</dt><dd>+91 98•••• 1204</dd><dt>Registered Email</dt><dd>saikrishna@••••.com</dd></dl></section><section className="detail-side-card"><div className="detail-section-label">QUICK REFERENCES</div><div className="reference-link">Related Deal ID<strong>DEAL-BLR-2026-992</strong><span>→ View Deal Terms</span></div><div className="reference-link">Wallet Transaction Ref<strong>TXN-WL-58201948</strong><span>→ Check Transaction Log</span></div></section></aside></div>
      </main><Footer /></div>
    </div>
  );
};

export default ViewTicketHistory;
