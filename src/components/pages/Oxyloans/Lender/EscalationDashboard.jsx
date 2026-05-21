import React, { useState, useEffect, useCallback } from "react";
import { getMyEscalationLoans, getLoanEscalationStatus } from "../../../HttpRequest/afterlogin";
import Header from "../../../Header/Header";
import Sidebar from "../../../SideBar/SideBar";

const STATE_CONFIG = {
  NONE: { color: "success", label: "On Time" },
  REMINDER_1: { color: "warning", label: "1-6 Days Overdue" },
  REMINDER_7: { color: "warning", label: "7-29 Days Overdue" },
  LEGAL_NOTICE: { color: "danger", label: "Legal Notice" },
  CASE_FILED: { color: "dark", label: "Case Filed" },
  SOCIAL_DISCLOSURE: { color: "dark", label: "Social Disclosure" },
};

function EscalationBadge({ state }) {
  const cfg = STATE_CONFIG[state] || { color: "secondary", label: state };
  return <span className={`badge bg-${cfg.color}`}>{cfg.label}</span>;
}

export default function EscalationDashboard() {
  const [trackers, setTrackers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyEscalationLoans();
      if (res?.data) setTrackers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError("Failed to load escalation data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [load]);

  const total = trackers.length;
  const onTime = trackers.filter((t) => t.escalationState === "NONE").length;
  const overdue = trackers.filter((t) => t.escalationState !== "NONE").length;
  const legal = trackers.filter((t) => ["LEGAL_NOTICE", "CASE_FILED", "SOCIAL_DISCLOSURE"].includes(t.escalationState)).length;

  return (
    <div className="main-wrapper">
      <Sidebar />
      <div style={{ flex: 1 }}>
      <Header />
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header">
          <h3 className="page-title">Escalation Tracker</h3>
          <ul className="breadcrumb">
            <li className="breadcrumb-item">Lender</li>
            <li className="breadcrumb-item active">Escalation Dashboard</li>
          </ul>
        </div>

        {/* Summary metrics */}
        <div className="row mb-4">
          {[
            { label: "Total Active Loans", value: total, color: "primary" },
            { label: "Loans On Time", value: onTime, color: "success" },
            { label: "Loans Overdue", value: overdue, color: "warning" },
            { label: "In Legal", value: legal, color: "danger" },
          ].map((m) => (
            <div key={m.label} className="col-md-3">
              <div className={`card border-${m.color}`}>
                <div className="card-body text-center">
                  <h2 className={`text-${m.color}`}>{m.value}</h2>
                  <p className="mb-0 text-muted">{m.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card">
          <div className="card-header d-flex justify-content-between">
            <h5 className="mb-0">Loan Escalation Status</h5>
            <button className="btn btn-sm btn-outline-primary" onClick={load} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <div className="card-body p-0">
            {loading && trackers.length === 0 ? (
              <div className="text-center py-4"><div className="spinner-border text-primary"></div></div>
            ) : trackers.length === 0 ? (
              <div className="text-center py-4 text-muted">No active marketplace loans found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Loan ID</th>
                      <th>Borrower</th>
                      <th>Days Overdue</th>
                      <th>Escalation Status</th>
                      <th>Last Action</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trackers.map((t) => (
                      <tr key={t.id}>
                        <td>#{t.loanId}</td>
                        <td>
                          <span className="text-muted">Borrower</span>
                          {t.oxyScore && <span className="badge bg-secondary ms-2">{t.oxyScore}</span>}
                        </td>
                        <td>
                          <span className={t.daysOverdue > 0 ? "text-danger fw-bold" : "text-success"}>
                            {t.daysOverdue}
                          </span>
                        </td>
                        <td><EscalationBadge state={t.escalationState} /></td>
                        <td>
                          <small className="text-muted">
                            {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : "—"}
                          </small>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            {t.legalNoticePath && (
                              <a
                                href={t.legalNoticePath}
                                className="btn btn-xs btn-outline-danger"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Download Notice
                              </a>
                            )}
                            <button className="btn btn-xs btn-outline-secondary">View</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
  );
}
