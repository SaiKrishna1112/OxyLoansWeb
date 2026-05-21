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

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

const ACTION_TYPES = ["CALL_ATTEMPTED", "CALL_CONNECTED", "SMS_SENT", "EMAIL_SENT",
  "FIELD_VISIT", "PROMISE_TO_PAY", "PAYMENT_RECEIVED", "ESCALATED_TO_LEGAL", "NOTE_ADDED"];

const STATUSES = ["OPEN", "IN_PROGRESS", "PROMISED_TO_PAY", "PARTIAL_PAYMENT",
  "RESOLVED", "ESCALATED", "LEGAL", "CLOSED"];

const CollectionsAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);
  const [caseDetail, setCaseDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionForm, setActionForm] = useState({ actionType: "CALL_ATTEMPTED", note: "", outcome: "" });
  const [assignForm, setAssignForm] = useState({ agentId: "", agentName: "" });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const loadStats = useCallback(() => {
    axios.get(`${BASE}/v1/collections/stats`, { headers: getHeaders() })
      .then(r => setStats(r.data)).catch(() => {});
  }, []);

  const loadCases = useCallback(() => {
    setLoading(true);
    axios.get(`${BASE}/v1/collections/cases?status=${statusFilter}`, { headers: getHeaders() })
      .then(r => { setCases(r.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { loadStats(); loadCases(); }, [loadStats, loadCases]);

  const openCase = (c) => {
    setSelectedCase(c);
    setDetailLoading(true);
    setCaseDetail(null);
    axios.get(`${BASE}/v1/collections/cases/${c.id}`, { headers: getHeaders() })
      .then(r => { setCaseDetail(r.data); setDetailLoading(false); })
      .catch(() => setDetailLoading(false));
  };

  const submitAction = async () => {
    if (!actionForm.note) return;
    setSubmitting(true);
    setMsg("");
    try {
      await axios.post(`${BASE}/v1/collections/cases/${selectedCase.id}/action`,
        { ...actionForm, agentName: localStorage.getItem("userName") || "Admin" },
        { headers: getHeaders() });
      setMsg("Action logged.");
      setActionForm({ actionType: "CALL_ATTEMPTED", note: "", outcome: "" });
      openCase(selectedCase);
      loadStats();
      loadCases();
    } catch (e) {
      setMsg("Error: " + (e?.response?.data?.error || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  const submitAssign = async () => {
    if (!assignForm.agentId) return;
    setSubmitting(true);
    try {
      await axios.post(`${BASE}/v1/collections/cases/${selectedCase.id}/assign`,
        assignForm, { headers: getHeaders() });
      setMsg("Agent assigned.");
      openCase(selectedCase);
      loadCases();
    } catch (e) {
      setMsg("Error: " + (e?.response?.data?.error || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (newStatus) => {
    const note = window.prompt(`Reason for status → ${newStatus}`);
    if (note === null) return;
    setSubmitting(true);
    try {
      await axios.put(`${BASE}/v1/collections/cases/${selectedCase.id}/status`,
        { status: newStatus, note }, { headers: getHeaders() });
      setMsg("Status updated.");
      openCase(selectedCase);
      loadCases();
      loadStats();
    } catch (e) {
      setMsg("Error: " + (e?.response?.data?.error || e.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Collections Dashboard</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><Link to="/mainadmindashboard">Dashboard</Link></li>
                  <li className="breadcrumb-item active">Collections</li>
                </ul>
              </div>
              <div className="col-auto">
                <button className="btn btn-outline-warning btn-sm" onClick={() => {
                  axios.post(`${BASE}/v1/collections/sync`, {}, { headers: getHeaders() })
                    .then(r => { setMsg(`Synced ${r.data.synced} cases`); loadCases(); loadStats(); })
                    .catch(() => setMsg("Sync failed"));
                }}>
                  Sync Overdue EMIs
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="row mb-4">
              {[
                { label: "Total Cases", value: stats.totalCases, color: "primary" },
                { label: "Open", value: stats.openCases, color: "info" },
                { label: "In Progress", value: stats.inProgressCases, color: "warning" },
                { label: "Critical", value: stats.criticalCases, color: "danger" },
                { label: "Resolved", value: stats.resolvedCases, color: "success" },
                { label: "Legal", value: stats.legalCases, color: "dark" },
              ].map(s => (
                <div key={s.label} className="col-md-2">
                  <div className={`card border-${s.color}`}>
                    <div className="card-body py-2 text-center">
                      <div className="text-muted" style={{ fontSize: 11 }}>{s.label}</div>
                      <h4 className={`text-${s.color} mb-0`}>{s.value || 0}</h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {stats && (
            <div className="alert alert-warning py-2 mb-3">
              Total Overdue: <strong>₹{fmt(stats.totalOverdueAmount)}</strong>
            </div>
          )}

          {msg && <div className="alert alert-info py-2">{msg}</div>}

          <div className="row">
            {/* Case list */}
            <div className={selectedCase ? "col-md-5" : "col-md-12"}>
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Collection Cases</h5>
                  <select className="form-select form-select-sm" style={{ width: 160 }}
                    value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">All Status</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="card-body p-0" style={{ maxHeight: 600, overflowY: "auto" }}>
                  {loading ? (
                    <div className="text-center py-4"><div className="spinner-border" /></div>
                  ) : cases.length === 0 ? (
                    <div className="text-center text-muted py-4">No cases found</div>
                  ) : (
                    <table className="table table-sm table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Borrower</th>
                          <th>Days OD</th>
                          <th>Amount</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Agent</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cases.map(c => (
                          <tr key={c.id} style={{ cursor: "pointer", background: selectedCase?.id === c.id ? "#e6f7ff" : "" }}
                            onClick={() => openCase(c)}>
                            <td>
                              <div style={{ fontWeight: 600 }}>{c.borrowerName || "—"}</div>
                              <small className="text-muted">{c.loanId || `#${c.loanRequestId}`}</small>
                            </td>
                            <td><span className="text-danger fw-bold">{c.daysOverdue}d</span></td>
                            <td>₹{fmt(c.overdueAmount)}</td>
                            <td>
                              <span className="badge" style={{ background: priorityColor[c.priority], color: "#fff" }}>
                                {c.priority}
                              </span>
                            </td>
                            <td>
                              <span className="badge" style={{ background: statusColor[c.status] || "#999", color: "#fff", fontSize: 10 }}>
                                {c.status}
                              </span>
                            </td>
                            <td style={{ fontSize: 11 }}>{c.assignedAgentName || <span className="text-muted">Unassigned</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* Case detail */}
            {selectedCase && (
              <div className="col-md-7">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Case: {selectedCase.borrowerName} — {selectedCase.loanId || `#${selectedCase.loanRequestId}`}</h5>
                    <button className="btn-close" onClick={() => setSelectedCase(null)} />
                  </div>
                  <div className="card-body" style={{ maxHeight: 580, overflowY: "auto" }}>
                    {detailLoading ? (
                      <div className="text-center py-3"><div className="spinner-border spinner-border-sm" /></div>
                    ) : caseDetail ? (
                      <>
                        {/* Status buttons */}
                        <div className="mb-3">
                          <label className="form-label fw-bold">Update Status:</label>
                          <div className="d-flex flex-wrap gap-1">
                            {STATUSES.filter(s => s !== caseDetail.status).map(s => (
                              <button key={s} className="btn btn-sm btn-outline-secondary"
                                style={{ fontSize: 11 }} onClick={() => updateStatus(s)} disabled={submitting}>
                                → {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Assign agent */}
                        <div className="mb-3 p-2 border rounded">
                          <label className="form-label fw-bold mb-1">Assign Agent</label>
                          <div className="d-flex gap-2">
                            <input type="number" className="form-control form-control-sm" placeholder="Agent ID"
                              value={assignForm.agentId} onChange={e => setAssignForm(f => ({ ...f, agentId: e.target.value }))} style={{ width: 100 }} />
                            <input type="text" className="form-control form-control-sm" placeholder="Agent Name"
                              value={assignForm.agentName} onChange={e => setAssignForm(f => ({ ...f, agentName: e.target.value }))} />
                            <button className="btn btn-sm btn-primary" onClick={submitAssign} disabled={submitting}>Assign</button>
                          </div>
                        </div>

                        {/* Log action */}
                        <div className="mb-3 p-2 border rounded">
                          <label className="form-label fw-bold mb-1">Log Action</label>
                          <select className="form-select form-select-sm mb-2" value={actionForm.actionType}
                            onChange={e => setActionForm(f => ({ ...f, actionType: e.target.value }))}>
                            {ACTION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                          <input type="text" className="form-control form-control-sm mb-2" placeholder="Note..."
                            value={actionForm.note} onChange={e => setActionForm(f => ({ ...f, note: e.target.value }))} />
                          <input type="text" className="form-control form-control-sm mb-2" placeholder="Outcome..."
                            value={actionForm.outcome} onChange={e => setActionForm(f => ({ ...f, outcome: e.target.value }))} />
                          <button className="btn btn-sm btn-success" onClick={submitAction} disabled={submitting || !actionForm.note}>
                            Log Action
                          </button>
                        </div>

                        {/* Action history */}
                        <div>
                          <label className="form-label fw-bold">Action History</label>
                          {(caseDetail.actions || []).length === 0 ? (
                            <div className="text-muted small">No actions yet</div>
                          ) : (
                            <div style={{ maxHeight: 200, overflowY: "auto" }}>
                              {(caseDetail.actions || []).map(a => (
                                <div key={a.id} className="border-bottom py-1">
                                  <div className="d-flex justify-content-between">
                                    <span className="badge bg-secondary" style={{ fontSize: 10 }}>{a.actionType}</span>
                                    <small className="text-muted">{new Date(a.createdAt).toLocaleString("en-IN")}</small>
                                  </div>
                                  <div style={{ fontSize: 12 }}>{a.note}</div>
                                  {a.outcome && <div style={{ fontSize: 11, color: "#666" }}>Outcome: {a.outcome}</div>}
                                  {a.agentName && <div style={{ fontSize: 11, color: "#999" }}>by {a.agentName}</div>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-muted text-center">Failed to load case details</div>
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

export default CollectionsAdminDashboard;
