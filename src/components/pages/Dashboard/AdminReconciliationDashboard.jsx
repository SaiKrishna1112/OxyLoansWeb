import React, { useState, useEffect, useCallback } from "react";
import Header from "../../Header/OxyloansAdminHeader";
import SideBar from "../../SideBar/OxyloansAdminSidebar";
import Footer from "../../Footer/Footer";
import { MARKETPLACE_URL } from "../../../config";
import { getToken } from "../../HttpRequest/afterlogin";
import axios from "axios";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const AdminReconciliationDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await axios.get(
        `${MARKETPLACE_URL}/v1/ai/admin/reconciliation-summary`,
        { headers: { accessToken: token } }
      );
      setData(res.data);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err.message ||
          "Failed to load reconciliation summary"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <div className="main-wrapper">
      <Header />
      <SideBar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <h3 className="page-title">AI Reconciliation Dashboard</h3>
                <p className="text-muted mb-0">
                  Daily CMS payment reconciliation powered by AI
                </p>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading…</span>
              </div>
              <p className="mt-3 text-muted">Generating AI summary…</p>
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {!loading && data && (
            <>
              {/* AI Summary Card */}
              <div className="row mb-4">
                <div className="col-12">
                  <div
                    className="card"
                    style={{
                      background: "#0d1b4b",
                      border: "none",
                      borderRadius: 12,
                    }}
                  >
                    <div className="card-body p-4">
                      <p
                        className="mb-3"
                        style={{
                          color: "#7eb3ff",
                          fontSize: 12,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          fontWeight: 600,
                        }}
                      >
                        AI Briefing — Today
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {(data.aiSummary || "")
                          .split("\n")
                          .map((line) => line.trim())
                          .filter((line) => line.length > 0)
                          .map((line, idx) => {
                            const icons = ["📊", "⚠️", "✅"];
                            const text = line.replace(/^[•\-\*#]+\s*/, "").replace(/\*\*/g, "");
                            return (
                              <div
                                key={idx}
                                style={{
                                  background: "rgba(255,255,255,0.07)",
                                  borderRadius: 8,
                                  padding: "10px 14px",
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 12,
                                  border: "1px solid rgba(126,179,255,0.15)",
                                }}
                              >
                                <span style={{ fontSize: 18, minWidth: 24, marginTop: 1 }}>
                                  {icons[idx] || "•"}
                                </span>
                                <span style={{ color: "#e8f0fe", fontSize: 15, lineHeight: 1.6 }}>
                                  {text}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="row mb-4">
                <div className="col-6 col-md-3 mb-3">
                  <div className="card text-center h-100">
                    <div className="card-body">
                      <p className="text-muted mb-1" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                        Total Deals
                      </p>
                      <h2 className="mb-0" style={{ fontWeight: 700 }}>
                        {data.totalDeals ?? "—"}
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3 mb-3">
                  <div className="card text-center h-100">
                    <div className="card-body">
                      <p className="text-muted mb-1" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                        Initiated
                      </p>
                      <h2 className="mb-0" style={{ fontWeight: 700, color: "#1890ff" }}>
                        ₹{fmt(data.totalInitiated)}
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3 mb-3">
                  <div className="card text-center h-100">
                    <div className="card-body">
                      <p className="text-muted mb-1" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>
                        Confirmed
                      </p>
                      <h2 className="mb-0" style={{ fontWeight: 700, color: "#52c41a" }}>
                        ₹{fmt(data.totalConfirmed)}
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3 mb-3">
                  <div className="card text-center h-100" style={data.totalPending > 0 ? { border: "2px solid #ff4d4f" } : {}}>
                    <div className="card-body">
                      <p className="mb-1" style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: data.totalPending > 0 ? "#ff4d4f" : "#8c8c8c" }}>
                        Pending
                      </p>
                      <h2 className="mb-0" style={{ fontWeight: 700, color: data.totalPending > 0 ? "#ff4d4f" : "#52c41a" }}>
                        {data.totalPending > 0 ? `₹${fmt(data.totalPending)}` : "✓ Clear"}
                      </h2>
                      {data.totalPending > 0 && (
                        <small style={{ color: "#ff4d4f", fontSize: 11 }}>
                          {(data.pendingLenders || []).length} lender(s) pending
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Table */}
              {data.totalPending > 0 && (
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card">
                      <div
                        className="card-header"
                        style={{ background: "#ff4d4f", border: "none" }}
                      >
                        <h5
                          className="card-title mb-0"
                          style={{ color: "#fff" }}
                        >
                          Pending Reconciliation — ₹{fmt(data.totalPending)}
                        </h5>
                      </div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead className="thead-light">
                              <tr>
                                <th>Lender Name</th>
                                <th>Amount</th>
                                <th>Deal ID</th>
                                <th>File Name</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(data.pendingLenders || []).map((p, idx) => (
                                <tr key={idx}>
                                  <td>{p.lenderName}</td>
                                  <td style={{ color: "#ff4d4f", fontWeight: 600 }}>
                                    ₹{fmt(p.amount)}
                                  </td>
                                  <td>{p.dealId}</td>
                                  <td>
                                    <code style={{ fontSize: 12 }}>
                                      {p.fileName || "—"}
                                    </code>
                                  </td>
                                  <td>
                                    <button className="btn btn-sm btn-outline-warning">
                                      Check Status
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="row">
                <div className="col-12 d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Generated at:{" "}
                    {data.generatedAt
                      ? new Date(data.generatedAt).toLocaleString("en-IN")
                      : "—"}
                  </small>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={fetchSummary}
                    disabled={loading}
                  >
                    {loading ? "Refreshing…" : "Refresh"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default AdminReconciliationDashboard;
