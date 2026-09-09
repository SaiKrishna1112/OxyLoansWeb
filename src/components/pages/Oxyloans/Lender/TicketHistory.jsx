import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import Footer from "../../../Footer/Footer";
import {
  TicketHistoryapi,
  allQueriesCount1,
  ticketcommentapi,
} from "../../../HttpRequest/afterlogin";
import Comment from "../Utills/Modals/Comment";
import { handletocancelticket } from "../../Base UI Elements/SweetAlert";
import "./TicketHistory.css";

const TicketHistory = () => {
  const [tickets, setTickets] = useState([]);
  const [comments, setComments] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loadingCommentsId, setLoadingCommentsId] = useState(null);
  const [cancellingTicketId, setCancellingTicketId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [dateFilter, setDateFilter] = useState("All Dates");
  const [queryCounts, setQueryCounts] = useState({
    allQueriesCount: 0,
    resolvedCount: 0,
    cancelledCount: 0,
    pendingCount: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadTickets = async (page = currentPage) => {
    const response = await TicketHistoryapi(page, pageSize);
    if (response?.request?.status === 200) {
      setTickets(response.data?.listOfUserQueryDetailsResponseDto || []);
    }
  };

  const loadQueryCounts = async () => {
    const response = await allQueriesCount1();
    if (response?.request?.status === 200) {
      setQueryCounts({
        allQueriesCount: response.data?.allQueriesCount || 0,
        resolvedCount: response.data?.resolvedCount || 0,
        cancelledCount: response.data?.cancelledCount || 0,
        pendingCount: response.data?.pendingCount || 0,
      });
    }
  };

  useEffect(() => {
    loadQueryCounts();
  }, []);

  useEffect(() => {
    loadTickets(currentPage);
  }, [currentPage]);

  const refreshAfterCancel = async () => {
    await Promise.all([loadTickets(), loadQueryCounts()]);
  };

  const handleCancel = (id) => {
    handletocancelticket(
      id,
      refreshAfterCancel,
      () => setCancellingTicketId(id),
      () => setCancellingTicketId(null)
    );
  };

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tickets.filter((item) => {
      const matchesSearch = !query || [item.ticketId, item.query, item.comments]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
      const matchesStatus = statusFilter === "All Statuses" || item.status === statusFilter;
      const matchesDate = dateFilter === "All Dates" || String(item.receivedOn || "").includes(dateFilter);
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [dateFilter, search, statusFilter, tickets]);

  const hasFilters = Boolean(search.trim() || statusFilter !== "All Statuses" || dateFilter !== "All Dates");
  const totalPages = Math.max(1, Math.ceil((hasFilters ? filteredTickets.length : queryCounts.allQueriesCount) / pageSize));
  const visibleTickets = filteredTickets;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateFilter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const openComments = async (item) => {
    setSelectedTicket(item);
    setLoadingCommentsId(item.id);
    try {
      setComments(await ticketcommentapi(item.id));
    } finally {
      setLoadingCommentsId(null);
    }
  };

  const exportCsv = () => {
    const rows = filteredTickets.map((item, index) => [
      index + 1, item.ticketId, item.receivedOn, item.query, item.status, item.comments || "",
    ]);
    const csv = [["S.No", "Ticket ID", "Received On", "Query", "Status", "Admin Comments"], ...rows]
      .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "ticket-history.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="main-wrapper ticket-history-page">
      <Header />
      <SideBar />
      <div className="page-wrapper">
        <main className="content container-fluid ticket-shell">
          <div className="ticket-breadcrumb">Dashboard <span>›</span> <strong>Ticket History</strong></div>
          <div className="ticket-page-heading">
            <div>
              <h1>Ticket History</h1>
              <p>Track, manage, and respond to your customer support queries and deal requests</p>
            </div>
            <div className="ticket-heading-actions">
              {/* <button className="ticket-btn ticket-btn-light" onClick={exportCsv} type="button"><i className="fa-solid fa-download" /> Export CSV</button> */}
              <Link className="ticket-btn ticket-btn-primary" to="/writetous"><i className="fa-solid fa-plus" /> Create New Ticket</Link>
            </div>
          </div>

          <section className="ticket-stats" aria-label="Ticket summary">
            <div className="ticket-stat"><div><span>Total Tickets</span><strong>{queryCounts.allQueriesCount}</strong><small>All registered issues</small></div><i className="fa-solid fa-briefcase" /></div>
            <div className="ticket-stat is-pending"><div><span>Pending Attention</span><strong>{queryCounts.pendingCount}</strong><small>Awaiting agent response</small></div><i className="fa-regular fa-clock" /></div>
            <div className="ticket-stat is-progress"><div><span>Resolved</span><strong>{queryCounts.resolvedCount}</strong><small>Resolved tickets</small></div><i className="fa-solid fa-rotate" /></div>
            <div className="ticket-stat is-closed"><div><span>Closed / Cancelled</span><strong>{queryCounts.cancelledCount}</strong><small>Cancelled tickets</small></div><i className="fa-regular fa-circle-xmark" /></div>
          </section>

          <section className="ticket-table-card">
            <div className="ticket-toolbar">
              <div className="ticket-search"><i className="fa-solid fa-magnifying-glass" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by Ticket ID, query keywords, or date..." /></div>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status"><option>All Statuses</option><option>Pending</option><option>Completed</option><option>Cancelled</option></select>
              {/* <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} aria-label="Filter by date"><option>All Dates</option><option>2026-09-07</option><option>2026-09-06</option><option>2026-09-05</option></select> */}
            </div>
            <div className="ticket-table-wrap">
              <table className="ticket-table">
                <thead><tr><th>S.No</th><th>Ticket Details</th><th>Query &amp; Subject</th><th>Status</th><th>Admin Comments</th><th aria-label="Actions" /></tr></thead>
                <tbody>
                  {visibleTickets.map((item, index) => (
                    <tr key={item.id || item.ticketId || index}>
                      <td className="ticket-number">{(currentPage - 1) * pageSize + index + 1}</td>
                      <td><strong className="ticket-id-chip">{item.ticketId}</strong><span className="ticket-received"><i className="fa-regular fa-calendar" /> Received:<br />{item.receivedOn}</span>{item.screenshotUrl && <a className="ticket-attachment-link" href={item.screenshotUrl} target="_blank" rel="noreferrer"><i className="fa-regular fa-image" /> View attachment</a>}</td>
                      <td><strong className="ticket-subject">{item.subject || item.query}</strong></td>
                      <td><span className={`ticket-status status-${String(item.status || "default").toLowerCase().replace(/\s+/g, "-")}`}><i />{item.status}</span></td>
                      <td><span className="ticket-comment-preview">{item.comments || "Awaiting review from Support Executive..."}</span></td>
                      <td><div className="ticket-row-actions"><button className="ticket-comment-btn" disabled={loadingCommentsId === item.id || cancellingTicketId !== null} onClick={() => openComments(item)} type="button">{loadingCommentsId === item.id ? <><i className="fa-solid fa-spinner fa-spin" /> Loading...</> : <><i className="fa-regular fa-message" /> Comments</>}</button><button className="ticket-cancel-btn" disabled={item.status === "Cancelled" || item.status === "Completed" || cancellingTicketId !== null || loadingCommentsId !== null} onClick={() => handleCancel(item.id)} type="button">{cancellingTicketId === item.id ? <><i className="fa-solid fa-spinner fa-spin" /> Cancelling...</> : <><i className="fa-regular fa-circle-xmark" /> Cancel</>}</button></div></td>
                    </tr>
                  ))}
                  {!filteredTickets.length && <tr><td className="ticket-empty" colSpan="6">No tickets match your filters.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="ticket-table-footer"><span>Showing <strong>{filteredTickets.length ? (currentPage - 1) * pageSize + 1 : 0}</strong> to <strong>{Math.min((currentPage - 1) * pageSize + filteredTickets.length, hasFilters ? filteredTickets.length : queryCounts.allQueriesCount)}</strong> of <strong>{hasFilters ? filteredTickets.length : queryCounts.allQueriesCount}</strong> entries</span><div><button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>Previous</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => <button className={page === currentPage ? "is-current" : ""} type="button" key={page} onClick={() => setCurrentPage(page)}>{page}</button>)}<button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)}>Next</button></div></div>
          </section>
          {comments && <Comment data={comments} ticket={selectedTicket} onClose={() => { setComments(null); setSelectedTicket(null); }} />}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default TicketHistory;
