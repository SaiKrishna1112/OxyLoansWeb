import React, { useState, useEffect } from "react";
import OxyloansAdminHeader from "../../../Header/OxyloansAdminHeader";
import OxyloansAdminSidebar from "../../../SideBar/OxyloansAdminSidebar";
import Footer from "../../../Footer/Footer";
import { getAdminAIReconciliationSummary } from "../../../HttpRequest/afterlogin";

const fmt = (n) =>
  n == null ? "—" : "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const AdminAIReconciliationDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getAdminAIReconciliationSummary()
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.error || "Failed to load reconciliation summary."
        );
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
  }, []);

  const aiLines = data?.aiSummary
    ? data.aiSummary.split("\n").filter((l) => l.trim())
    : [];

  const isGood = data?.fullyReconciled;

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />

      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">
                  🤖 AI Daily CMS Reconciliation
                </h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">Admin</li>
                  <li className="breadcrumb-item active">
                    AI Reconciliation
                  </li>
                </ul>
              </div>
              <div className="col-auto">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={load}
                  disabled={loading}
                >
                  {loading ? "Refreshing…" : "↻ Refresh"}
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2 text-muted">Loading reconciliation data…</p>
            </div>
          )}

          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          {!loading && !error && data && (
            <>
              {/* AI Summary */}
              <div className={`card mb-4 border-0 shadow-sm ${isGood ? "border-success" : "border-warning"}`}
                style={{ borderLeft: `4px solid ${isGood ? "#22c55e" : "#f59e0b"}` }}>
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <span style={{ fontSize: 22 }}>🤖</span>
                    <h6 className="mb-0 ms-2 text-muted" style={{ fontSize: 13 }}>
                      AI Briefing — Today's CMS Reconciliation
                    </h6>
                    {isGood && (
                      <span className="badge bg-success ms-auto">Fully Reconciled</span>
                    )}
                    {!isGood && (
                      <span className="badge bg-warning text-dark ms-auto">Action Required</span>
                    )}
                  </div>
                  {aiLines.map((line, i) => (
                    <p key={i} className="mb-1" style={{ fontSize: 14 }}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              {/* Stats Row */}
              <div className="row mb-4">
                <StatCard label="Files Processed" value={data.totalDeals} color="#6366f1" />
                <StatCard label="Total Initiated" value={fmt(data.totalInitiated)} color="#3b82f6" />
                <StatCard label="Confirmed" value={fmt(data.totalConfirmed)} color="#22c55e" />
                <StatCard label="Pending" value={fmt(data.totalPending)} color="#f59e0b" />
                <StatCard label="Failed" value={fmt(data.totalFailed)} color="#ef4444" />
                <StatCard label="Reconciliation Gap" value={fmt(data.reconciliationGap)}
                  color={data.reconciliationGap === 0 ? "#22c55e" : "#ef4444"} />
              </div>

              {/* Overdue Alerts */}
              {data.overdueAlerts && data.overdueAlerts.length > 0 && (
                <div className="card mb-4 shadow-sm">
                  <div className="card-header bg-danger text-white">
                    <strong>🚨 Overdue Alerts ({data.overdueAlerts.length})</strong>
                    <span className="ms-2" style={{ fontSize: 12 }}>
                      File EXECUTED but payment PENDING &gt; 4 hours
                    </span>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="thead-light">
                          <tr>
                            <th>Lender</th>
                            <th>Amount</th>
                            <th>Deal ID</th>
                            <th>File</th>
                            <th>Hours Overdue</th>
                            <th>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.overdueAlerts.map((o, i) => (
                            <tr key={i} className="table-danger">
                              <td>{o.lenderName || "—"}</td>
                              <td>{fmt(o.amount)}</td>
                              <td>{o.dealId}</td>
                              <td style={{ fontSize: 12 }}>{o.fileName}</td>
                              <td>
                                <span className="badge bg-danger">
                                  {o.hoursOverdue}h
                                </span>
                              </td>
                              <td style={{ fontSize: 12 }}>{o.failureReason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Pending Lenders */}
              {data.pendingLenders && data.pendingLenders.length > 0 && (
                <div className="card mb-4 shadow-sm">
                  <div className="card-header">
                    <strong>⏳ Pending Lenders ({data.pendingLenders.length})</strong>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="thead-light">
                          <tr>
                            <th>Lender</th>
                            <th>Amount</th>
                            <th>Deal ID</th>
                            <th>File</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.pendingLenders.map((p, i) => (
                            <tr key={i}>
                              <td>{p.lenderName || "—"}</td>
                              <td>{fmt(p.amount)}</td>
                              <td>{p.dealId}</td>
                              <td style={{ fontSize: 12 }}>{p.fileName}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Failed Lenders */}
              {data.failedLenders && data.failedLenders.length > 0 && (
                <div className="card mb-4 shadow-sm">
                  <div className="card-header bg-warning">
                    <strong>❌ Failed Lenders ({data.failedLenders.length})</strong>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="thead-light">
                          <tr>
                            <th>Lender</th>
                            <th>Amount</th>
                            <th>Deal ID</th>
                            <th>File</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.failedLenders.map((f, i) => (
                            <tr key={i} className="table-warning">
                              <td>{f.lenderName || "—"}</td>
                              <td>{fmt(f.amount)}</td>
                              <td>{f.dealId}</td>
                              <td style={{ fontSize: 12 }}>{f.fileName}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {data.overdueAlerts?.length === 0 &&
                data.pendingLenders?.length === 0 &&
                data.failedLenders?.length === 0 && (
                <div className="alert alert-success">
                  All CMS payments for today are confirmed. No pending or failed transactions.
                </div>
              )}

              {data.generatedAt && (
                <p className="text-muted text-end" style={{ fontSize: 11 }}>
                  Generated at: {new Date(data.generatedAt).toLocaleString("en-IN")}
                </p>
              )}
            </>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="col-md-2 col-sm-4 col-6 mb-3">
    <div className="card h-100 shadow-sm" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="card-body py-3 px-3">
        <p className="text-muted mb-1" style={{ fontSize: 11 }}>{label}</p>
        <h5 className="mb-0" style={{ color, fontWeight: 700 }}>{value}</h5>
      </div>
    </div>
  </div>
);

export default AdminAIReconciliationDashboard;
