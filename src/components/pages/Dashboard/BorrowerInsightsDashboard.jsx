import React, { useState, useEffect, useCallback } from "react";
import Header from "../../Header/BorrowerHeader";
import BorrowerSidebar from "../../SideBar/BorrowerSidebar";
import Footer from "../../Footer/Footer";
import { MARKETPLACE_URL } from "../../../config";
import { getToken, getUserId } from "../../HttpRequest/afterlogin";
import axios from "axios";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const HEALTH_CONFIG = {
  EXCELLENT:       { color: "#52c41a", bg: "#f6ffed", border: "#b7eb8f", label: "Excellent", icon: "✅" },
  GOOD:            { color: "#1890ff", bg: "#e6f7ff", border: "#91d5ff", label: "Good",      icon: "👍" },
  FAIR:            { color: "#faad14", bg: "#fffbe6", border: "#ffe58f", label: "Fair",       icon: "⚠️" },
  NEEDS_ATTENTION: { color: "#ff4d4f", bg: "#fff2f0", border: "#ffccc7", label: "Needs Attention", icon: "🚨" },
};

const StatCard = ({ label, value, sub, color }) => (
  <div className="card text-center" style={{ borderRadius: 12 }}>
    <div className="card-body py-3">
      <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>{label}</p>
      <h3 className="mb-0" style={{ fontWeight: 700, color: color || "#1a1a2e" }}>{value}</h3>
      {sub && <p className="text-muted mb-0 mt-1" style={{ fontSize: 11 }}>{sub}</p>}
    </div>
  </div>
);

const BorrowerInsightsDashboard = () => {
  const borrowerId = getUserId();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInsights = useCallback(async () => {
    if (!borrowerId) {
      setError("User not logged in.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${MARKETPLACE_URL}/v1/ai/borrower/${borrowerId}/insights`,
        { headers: { accessToken: getToken(), userId: borrowerId } }
      );
      setData(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Failed to load insights");
    } finally {
      setLoading(false);
    }
  }, [borrowerId]);

  useEffect(() => { fetchInsights(); }, [fetchInsights]);

  const health = data ? (HEALTH_CONFIG[data.repaymentHealth] || HEALTH_CONFIG.GOOD) : null;

  return (
    <div className="main-wrapper">
      <Header />
      <BorrowerSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">

          <div className="page-header">
            <div className="row align-items-center">
              <div className="col-sm-12">
                <h3 className="page-title">My Loan Insights</h3>
                <p className="text-muted mb-0">AI-powered summary of your borrowing profile</p>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading…</span>
              </div>
              <p className="mt-3 text-muted">Generating your personal insights…</p>
            </div>
          )}

          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          {!loading && data && (
            <>
              {/* AI Narrative Card */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card" style={{
                    background: "linear-gradient(135deg, #1a237e, #311b92)",
                    border: "none", borderRadius: 16,
                  }}>
                    <div className="card-body p-4">
                      <div className="d-flex align-items-center mb-3">
                        <span style={{ fontSize: 28, marginRight: 12 }}>🤖</span>
                        <div>
                          <p style={{ color: "#9fa8da", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>
                            AI Personal Summary
                          </p>
                          <h5 style={{ color: "#fff", marginBottom: 0 }}>Hello, {data.borrowerName?.split(" ")[0]}</h5>
                        </div>
                      </div>
                      <p style={{ color: "#e8eaf6", fontSize: 15, lineHeight: 1.8, marginBottom: 0 }}>
                        {data.aiNarrative}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Repayment Health Badge */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card" style={{
                    border: `2px solid ${health.border}`,
                    background: health.bg,
                    borderRadius: 12,
                  }}>
                    <div className="card-body py-3 d-flex align-items-center">
                      <span style={{ fontSize: 28, marginRight: 12 }}>{health.icon}</span>
                      <div>
                        <p style={{ color: health.color, fontWeight: 700, fontSize: 16, marginBottom: 2 }}>
                          Repayment Health: {health.label}
                        </p>
                        <p style={{ color: "#666", fontSize: 13, marginBottom: 0 }}>
                          {data.overdueEmis === 0
                            ? "All your EMIs are up to date. Great job!"
                            : `You have ${data.overdueEmis} overdue EMI(s). Please clear them promptly.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="row mb-4">
                <div className="col-6 col-md-3 mb-3">
                  <StatCard label="Total Borrowed" value={`₹${fmt(data.totalBorrowed)}`} color="#1890ff" />
                </div>
                <div className="col-6 col-md-3 mb-3">
                  <StatCard label="Total Repaid" value={`₹${fmt(data.totalRepaid)}`} color="#52c41a" />
                </div>
                <div className="col-6 col-md-3 mb-3">
                  <StatCard label="Outstanding" value={`₹${fmt(data.totalOutstanding)}`} color="#ff4d4f" />
                </div>
                <div className="col-6 col-md-3 mb-3">
                  <StatCard
                    label="Next EMI"
                    value={data.nextEmiDate ? `₹${fmt(data.nextEmiAmount)}` : "—"}
                    sub={data.nextEmiDate || "No upcoming EMIs"}
                    color="#faad14"
                  />
                </div>
              </div>

              {/* Loan Summary Row */}
              <div className="row mb-4">
                <div className="col-6 col-md-4 mb-3">
                  <StatCard label="Total Loans" value={data.totalLoans} />
                </div>
                <div className="col-6 col-md-4 mb-3">
                  <StatCard label="Active Loans" value={data.activeLoans} color="#1890ff" />
                </div>
                <div className="col-6 col-md-4 mb-3">
                  <StatCard label="Overdue EMIs" value={data.overdueEmis} color={data.overdueEmis > 0 ? "#ff4d4f" : "#52c41a"} />
                </div>
              </div>

              {/* AI Tips */}
              {data.aiTips && data.aiTips.length > 0 && (
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card" style={{ borderRadius: 12 }}>
                      <div className="card-header" style={{ background: "#fafafa", borderBottom: "1px solid #f0f0f0" }}>
                        <h5 className="card-title mb-0">
                          <span style={{ marginRight: 8 }}>💡</span>AI Recommendations
                        </h5>
                      </div>
                      <div className="card-body">
                        {data.aiTips.map((tip, i) => (
                          <div key={i} style={{
                            display: "flex", alignItems: "flex-start", gap: 10,
                            padding: "10px 12px", marginBottom: 8,
                            background: "#f8faff", borderRadius: 8,
                            border: "1px solid #e2e8f0",
                          }}>
                            <span style={{
                              minWidth: 24, height: 24, borderRadius: "50%",
                              background: "#4f46e5", color: "#fff",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 11, fontWeight: 700, flexShrink: 0,
                            }}>{i + 1}</span>
                            <span style={{ fontSize: 13, color: "#334155", lineHeight: 1.5 }}>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="row">
                <div className="col-12 d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Generated at: {data.generatedAt ? new Date(data.generatedAt).toLocaleString("en-IN") : "—"}
                  </small>
                  <button className="btn btn-primary btn-sm" onClick={fetchInsights} disabled={loading}>
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

export default BorrowerInsightsDashboard;
