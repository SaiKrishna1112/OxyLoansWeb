import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../../Header/Header";
import SideBar from "../../SideBar/SideBar";
import Footer from "../../Footer/Footer";
import { MARKETPLACE_URL } from "../../../config";
import { getToken, getUserId } from "../../HttpRequest/afterlogin";
import axios from "axios";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const LenderEarningsDashboard = () => {
  const { lenderId: paramLenderId } = useParams();
  const resolvedLenderId = paramLenderId || getUserId();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(
          `${MARKETPLACE_URL}/v1/ai/lender/${resolvedLenderId}/earnings`,
          { headers: { accessToken: getToken() } }
        );
        setData(res.data);
      } catch (err) {
        setError(
          err?.response?.data?.error || err.message || "Failed to load earnings"
        );
      } finally {
        setLoading(false);
      }
    };
    if (resolvedLenderId) fetch();
  }, [resolvedLenderId]);

  return (
    <div className="main-wrapper">
      <Header />
      <SideBar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <h3 className="page-title">AI Earnings Insights</h3>
                <p className="text-muted mb-0">
                  Month-wise breakdown &amp; upcoming payouts
                </p>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading…</span>
              </div>
              <p className="mt-3 text-muted">Analysing your earnings…</p>
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {!loading && data && (
            <>
              {/* AI Narrative */}
              <div className="row mb-4">
                <div className="col-12">
                  <div
                    className="card"
                    style={{
                      background: "linear-gradient(135deg, #0d47a1, #1565c0)",
                      border: "none",
                      borderRadius: 16,
                    }}
                  >
                    <div className="card-body p-4">
                      <h5 style={{ color: "#90caf9", marginBottom: 16, fontWeight: 700 }}>
                        {data.lenderName} — {data.fyLabel} Summary
                      </h5>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {(data.narrative || "")
                          .split("\n")
                          .map((l) => l.trim())
                          .filter((l) => l.length > 0)
                          .map((line, idx) => {
                            const icons = ["📊", "💸", "📅", "🚀"];
                            const text = line.replace(/^[•\-\*#]+\s*/, "").replace(/\*\*/g, "");
                            return (
                              <div
                                key={idx}
                                style={{
                                  background: "rgba(255,255,255,0.1)",
                                  borderRadius: 10,
                                  padding: "12px 16px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 12,
                                  border: "1px solid rgba(255,255,255,0.15)",
                                }}
                              >
                                <span style={{ fontSize: 20 }}>{icons[idx] || "•"}</span>
                                <span style={{ color: "#fff", fontSize: 15, lineHeight: 1.6 }}>
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

              {/* FY Stats */}
              <div className="row mb-4">
                <div className="col-6 col-md-3 mb-3">
                  <div className="card text-center h-100">
                    <div className="card-body">
                      <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
                        {data.fyLabel} Interest
                      </p>
                      <h3 className="mb-0" style={{ fontWeight: 700, color: "#52c41a" }}>
                        ₹{fmt(data.fyInterestEarned)}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3 mb-3">
                  <div className="card text-center h-100">
                    <div className="card-body">
                      <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
                        {data.fyLabel} Principal
                      </p>
                      <h3 className="mb-0" style={{ fontWeight: 700, color: "#1890ff" }}>
                        ₹{fmt(data.fyPrincipalReturned)}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3 mb-3">
                  <div className="card text-center h-100">
                    <div className="card-body">
                      <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
                        {data.fyLabel} Total
                      </p>
                      <h3 className="mb-0" style={{ fontWeight: 700, color: "#722ed1" }}>
                        ₹{fmt(data.fyTotalReceived)}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3 mb-3">
                  <div className="card text-center h-100">
                    <div className="card-body">
                      <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>
                        Due Next 60 Days
                      </p>
                      <h3 className="mb-0" style={{ fontWeight: 700, color: "#fa8c16" }}>
                        ₹{fmt(data.upcomingTotal)}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Earnings Table */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="card-title mb-0">Month-Wise Earnings (Last 12 Months)</h5>
                    </div>
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead className="thead-light">
                            <tr>
                              <th>Month</th>
                              <th className="text-right">Interest Received</th>
                              <th className="text-right">Principal Returned</th>
                              <th className="text-right">Total</th>
                              <th className="text-center">Deals</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(data.monthlyEarnings || []).length === 0 && (
                              <tr>
                                <td colSpan={5} className="text-center text-muted py-4">
                                  No earnings data in the last 12 months
                                </td>
                              </tr>
                            )}
                            {(data.monthlyEarnings || []).map((m, idx) => (
                              <tr key={idx}>
                                <td style={{ fontWeight: 600 }}>{m.monthLabel}</td>
                                <td className="text-right" style={{ color: "#52c41a" }}>
                                  ₹{fmt(m.interestAmount)}
                                </td>
                                <td className="text-right" style={{ color: "#1890ff" }}>
                                  ₹{fmt(m.principalReturned)}
                                </td>
                                <td className="text-right" style={{ fontWeight: 700 }}>
                                  ₹{fmt(m.totalReceived)}
                                </td>
                                <td className="text-center">
                                  <span
                                    style={{
                                      background: "#f0f5ff",
                                      color: "#2f54eb",
                                      borderRadius: 10,
                                      padding: "2px 10px",
                                      fontSize: 13,
                                      fontWeight: 600,
                                    }}
                                  >
                                    {m.dealCount}
                                  </span>
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

              {/* Upcoming Payouts */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h5 className="card-title mb-0">Upcoming Payouts (Next 60 Days)</h5>
                      {(data.upcomingPayouts || []).length > 0 && (
                        <span
                          style={{
                            background: "#fff7e6",
                            color: "#fa8c16",
                            border: "1px solid #ffd591",
                            borderRadius: 4,
                            padding: "2px 10px",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          Total: ₹{fmt(data.upcomingTotal)}
                        </span>
                      )}
                    </div>
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead className="thead-light">
                            <tr>
                              <th>Due Date</th>
                              <th>Deal ID</th>
                              <th className="text-right">Interest</th>
                              <th className="text-right">Principal</th>
                              <th className="text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(data.upcomingPayouts || []).length === 0 && (
                              <tr>
                                <td colSpan={5} className="text-center text-muted py-4">
                                  No payouts due in the next 60 days
                                </td>
                              </tr>
                            )}
                            {(data.upcomingPayouts || []).map((p, idx) => (
                              <tr key={idx}>
                                <td style={{ fontWeight: 600 }}>
                                  {p.dueDate
                                    ? new Date(p.dueDate).toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : "—"}
                                </td>
                                <td>{p.dealId || "—"}</td>
                                <td className="text-right" style={{ color: "#52c41a" }}>
                                  ₹{fmt(p.interestAmount)}
                                </td>
                                <td className="text-right" style={{ color: "#1890ff" }}>
                                  ₹{fmt(p.principalAmount)}
                                </td>
                                <td className="text-right" style={{ fontWeight: 700 }}>
                                  ₹{fmt(p.totalAmount)}
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

              <div className="row">
                <div className="col-12">
                  <small className="text-muted">
                    Generated at:{" "}
                    {data.generatedAt
                      ? new Date(data.generatedAt).toLocaleString("en-IN")
                      : "—"}
                  </small>
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

export default LenderEarningsDashboard;
