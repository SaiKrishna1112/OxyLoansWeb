import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/OxyloansAdminHeader";
import Sidebar from "../../../SideBar/OxyloansAdminSidebar";
import axios from "axios";
import { MARKETPLACE_URL } from "../../../../config";

const BASE = MARKETPLACE_URL;
const getHeaders = () => ({
  accessToken: sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken"),
  userId: sessionStorage.getItem("userId") || localStorage.getItem("userId"),
});

const priorityColor = { LOW: "#52c41a", MEDIUM: "#faad14", HIGH: "#fa8c16", CRITICAL: "#ff4d4f" };
const statusColor = { OPEN: "#1890ff", IN_PROGRESS: "#722ed1", PROMISED_TO_PAY: "#13c2c2",
  PARTIAL_PAYMENT: "#fa8c16", RESOLVED: "#52c41a", ESCALATED: "#fa541c", LEGAL: "#f5222d", CLOSED: "#8c8c8c" };

const ACTION_TYPES = ["CALL_ATTEMPTED", "CALL_CONNECTED", "SMS_SENT", "EMAIL_SENT",
  "FIELD_VISIT", "PROMISE_TO_PAY", "PAYMENT_RECEIVED", "NOTE_ADDED"];

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

const AgentPortal = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [actionForm, setActionForm] = useState({ actionType: "CALL_ATTEMPTED", note: "", outcome: "" });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const agentId = sessionStorage.getItem("userId") || localStorage.getItem("userId");
  const agentName = localStorage.getItem("userName") || "Agent";

  const loadMyCases = useCallback(() => {
    setLoading(true);
    axios.get(`${BASE}/v1/collections/my-cases`, { headers: getHeaders() })
      .then(r => { setCases(r.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { loadMyCases(); }, [loadMyCases]);

  const openDetail = (c) => {
    setSelected(c);
    setMsg("");
    axios.get(`${BASE}/v1/collections/cases/${c.id}`, { headers: getHeaders() })
      .then(r => setDetail(r.data)).catch(() => {});
  };

  const logAction = async () => {
    if (!actionForm.note) return;
    setSubmitting(true);
    setMsg("");
    try {
      await axios.post(`${BASE}/v1/collections/cases/${selected.id}/action`,
        { ...actionForm, agentName },
        { headers: getHeaders() });
      setMsg("Action logged successfully.");
      setActionForm({ actionType: "CALL_ATTEMPTED", note: "", outcome: "" });
      openDetail(selected);
      loadMyCases();
    } catch (e) {
      setMsg("Error: " + (e?.response?.data?.error || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  const openCases = cases.filter(c => ["OPEN", "IN_PROGRESS", "PROMISED_TO_PAY"].includes(c.status));
  const resolvedCases = cases.filter(c => ["RESOLVED", "CLOSED"].includes(c.status));

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">My Collection Cases</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><Link to="/mainadmindashboard">Dashboard</Link></li>
                  <li className="breadcrumb-item active">Agent Portal</li>
                </ul>
              </div>
              <div className="col-auto">
                <span className="badge bg-primary me-2">{openCases.length} Active</span>
                <span className="badge bg-success">{resolvedCases.length} Resolved</span>
              </div>
            </div>
          </div>

          {msg && <div className="alert alert-info py-2">{msg}</div>}

          <div className="row">
            <div className={selected ? "col-md-5" : "col-md-12"}>
              {loading ? (
                <div className="text-center py-5"><div className="spinner-border" /></div>
              ) : cases.length === 0 ? (
                <div className="text-center py-5">
                  <h5 className="text-muted">No cases assigned to you</h5>
                  <p className="text-muted">Cases assigned by admin will appear here.</p>
                </div>
              ) : (
                <>
                  {openCases.length > 0 && (
                    <div className="card mb-3">
                      <div className="card-header bg-warning-subtle">
                        <h6 className="mb-0">Active Cases ({openCases.length})</h6>
                      </div>
                      <div className="list-group list-group-flush">
                        {openCases.map(c => (
                          <button key={c.id} className={`list-group-item list-group-item-action ${selected?.id === c.id ? "active" : ""}`}
                            onClick={() => openDetail(c)}>
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <div className="fw-bold">{c.borrowerName || "—"}</div>
                                <small>{c.loanId || `Loan #${c.loanRequestId}`} · ₹{fmt(c.overdueAmount)}</small>
                              </div>
                              <div className="text-end">
                                <span className="badge mb-1" style={{ background: priorityColor[c.priority] }}>{c.priority}</span>
                                <br />
                                <small className="text-danger fw-bold">{c.daysOverdue}d OD</small>
                              </div>
                            </div>
                            {c.lastActionNote && (
                              <small className="text-muted d-block mt-1" style={{ fontSize: 11 }}>
                                Last: {c.lastActionNote.substring(0, 60)}...
                              </small>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {resolvedCases.length > 0 && (
                    <div className="card">
                      <div className="card-header bg-success-subtle">
                        <h6 className="mb-0">Resolved Cases ({resolvedCases.length})</h6>
                      </div>
                      <div className="list-group list-group-flush">
                        {resolvedCases.map(c => (
                          <button key={c.id} className={`list-group-item list-group-item-action ${selected?.id === c.id ? "active" : ""}`}
                            onClick={() => openDetail(c)}>
                            <div className="d-flex justify-content-between">
                              <div>
                                <div className="fw-bold">{c.borrowerName || "—"}</div>
                                <small>{c.loanId} · ₹{fmt(c.overdueAmount)}</small>
                              </div>
                              <span className="badge" style={{ background: statusColor[c.status] }}>{c.status}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {selected && (
              <div className="col-md-7">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-0">{selected.borrowerName}</h5>
                      <small className="text-muted">
                        {selected.loanId} · ₹{fmt(selected.overdueAmount)} overdue · {selected.daysOverdue} days
                        {selected.borrowerMobile && ` · 📞 ${selected.borrowerMobile}`}
                      </small>
                    </div>
                    <button className="btn-close" onClick={() => setSelected(null)} />
                  </div>
                  <div className="card-body" style={{ maxHeight: 560, overflowY: "auto" }}>
                    {/* Log Action Form */}
                    <div className="card border-primary mb-3">
                      <div className="card-body py-2">
                        <h6 className="mb-2">Log New Action</h6>
                        <select className="form-select form-select-sm mb-2" value={actionForm.actionType}
                          onChange={e => setActionForm(f => ({ ...f, actionType: e.target.value }))}>
                          {ACTION_TYPES.map(a => <option key={a} value={a}>{a.replace(/_/g, " ")}</option>)}
                        </select>
                        <textarea className="form-control form-control-sm mb-2" rows={2} placeholder="What happened? (required)"
                          value={actionForm.note} onChange={e => setActionForm(f => ({ ...f, note: e.target.value }))} />
                        <input type="text" className="form-control form-control-sm mb-2" placeholder="Outcome (optional)"
                          value={actionForm.outcome} onChange={e => setActionForm(f => ({ ...f, outcome: e.target.value }))} />
                        <button className="btn btn-sm btn-primary" onClick={logAction}
                          disabled={submitting || !actionForm.note}>
                          {submitting ? "Saving…" : "Log Action"}
                        </button>
                      </div>
                    </div>

                    {/* Action History */}
                    <h6>Contact History</h6>
                    {detail?.actions?.length === 0 ? (
                      <div className="text-muted small">No actions logged yet.</div>
                    ) : (
                      (detail?.actions || []).map(a => (
                        <div key={a.id} className="border rounded p-2 mb-2" style={{ fontSize: 12 }}>
                          <div className="d-flex justify-content-between mb-1">
                            <span className="badge bg-secondary">{a.actionType}</span>
                            <small className="text-muted">{new Date(a.createdAt).toLocaleString("en-IN")}</small>
                          </div>
                          <div>{a.note}</div>
                          {a.outcome && <div className="text-muted">→ {a.outcome}</div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPortal;
