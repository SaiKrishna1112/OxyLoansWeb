import React, { useState, useEffect } from "react";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import Footer from "../../../Footer/Footer";
import { getLenderAIPortfolio } from "../../../HttpRequest/afterlogin";

const fmt = (n) =>
  n == null ? "—" : "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const churnColor = { LOW: "#22c55e", MEDIUM: "#f59e0b", HIGH: "#ef4444" };

const LenderAIDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    getLenderAIPortfolio(userId)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load AI portfolio. Please try again.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="main-wrapper">
      <Header />
      <SideBar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">AI Portfolio Dashboard</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">Lender</li>
                  <li className="breadcrumb-item active">AI Portfolio</li>
                </ul>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2">Loading your AI portfolio…</p>
            </div>
          )}

          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          {data && (
            <>
              {/* Summary Cards */}
              <div className="row">
                <StatCard label="Total Invested" value={fmt(data.totalInvested)} color="#6366f1" />
                <StatCard label="Total Interest Earned" value={fmt(data.totalEarned)} color="#22c55e" />
                <StatCard label="Principal Returned" value={fmt(data.totalPrincipalReturned)} color="#0ea5e9" />
                <StatCard label="Wallet Balance" value={fmt(data.walletBalance)} color="#f59e0b" />
              </div>

              <div className="row mt-3">
                <StatCard label="Active Deals" value={data.activeDeals} color="#8b5cf6" />
                <StatCard label="Closed Deals" value={data.closedDeals} color="#64748b" />
                <StatCard label="EMIs Paid" value={data.emisPaid} color="#0ea5e9" />
                <StatCard label="On-Time Payment Rate" value={`${data.onTimePaymentRate}%`} color="#22c55e" />
              </div>

              {/* AI Narrative */}
              {data.aiNarrative && (
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="card" style={{ border: "1px solid #6366f1" }}>
                      <div className="card-header" style={{ background: "#6366f1", color: "#fff" }}>
                        <h5 className="mb-0">🤖 AI Portfolio Analysis</h5>
                      </div>
                      <div className="card-body">
                        <p style={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>{data.aiNarrative}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Churn Risk + Reinvestment */}
              <div className="row mt-4">
                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header"><h5 className="mb-0">Churn Risk</h5></div>
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-2">
                        <span
                          className="badge me-2"
                          style={{
                            background: churnColor[data.churnRiskLevel] || "#6b7280",
                            color: "#fff",
                            padding: "6px 14px",
                            fontSize: 14,
                          }}
                        >
                          {data.churnRiskLevel}
                        </span>
                        <span className="text-muted">Score: {data.churnRiskScore}/100</span>
                      </div>
                      {data.churnRecommendation && (
                        <p className="mb-0 text-muted">{data.churnRecommendation}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card h-100">
                    <div className="card-header"><h5 className="mb-0">Reinvestment Profile</h5></div>
                    <div className="card-body">
                      <p className="mb-1">
                        <strong>Profile:</strong> {data.reinvestmentProfile || "—"}
                      </p>
                      <p className="mb-1">
                        <strong>Reinvestment Ratio:</strong>{" "}
                        {data.reinvestmentRatioPct != null ? `${data.reinvestmentRatioPct.toFixed(1)}%` : "—"}
                      </p>
                      <p className="mb-1">
                        <strong>Avg Delay:</strong>{" "}
                        {data.avgReinvestmentDelayDays != null
                          ? `${data.avgReinvestmentDelayDays.toFixed(0)} days`
                          : "—"}
                      </p>
                      <p className="mb-0">
                        <strong>Star Rating:</strong> {data.reinvestmentStarRating || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interest Breakdown */}
              <div className="row mt-4">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header"><h5 className="mb-0">Interest Breakdown</h5></div>
                    <div className="card-body">
                      <div className="row text-center">
                        <BreakdownItem label="Monthly / Quarterly Payouts" value={fmt(data.lenderInterest)} />
                        <BreakdownItem label="Closure Interest" value={fmt(data.closureInterest)} />
                        <BreakdownItem label="Withdrawal Interest" value={fmt(data.withdrawalInterest)} />
                        <BreakdownItem label="Total Interest" value={fmt(data.totalInterestEarned)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Maturities */}
              {data.upcomingMaturities && data.upcomingMaturities.length > 0 && (
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header"><h5 className="mb-0">Upcoming Maturities (Next 90 Days)</h5></div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead className="thead-light">
                              <tr>
                                <th>Deal</th>
                                <th>Maturity Date</th>
                                <th>Days Left</th>
                                <th>Principal</th>
                                <th>Expected Interest</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.upcomingMaturities.map((m, i) => (
                                <tr key={i}>
                                  <td>{m.dealName || m.dealId}</td>
                                  <td>{m.maturityDate}</td>
                                  <td>
                                    <span
                                      className="badge"
                                      style={{
                                        background: m.daysLeft <= 14 ? "#ef4444" : "#6366f1",
                                        color: "#fff",
                                      }}
                                    >
                                      {m.daysLeft}d
                                    </span>
                                  </td>
                                  <td>{fmt(m.principal)}</td>
                                  <td>{fmt(m.expectedInterest)}</td>
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

              {/* Member info footer */}
              <div className="row mt-4">
                <div className="col-12 text-muted text-end" style={{ fontSize: 12 }}>
                  Member since {data.memberSince} ({data.memberSinceYears} years) ·{" "}
                  {data.city} · Last updated: {new Date().toLocaleString()}
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

const StatCard = ({ label, value, color }) => (
  <div className="col-md-3 col-sm-6 mb-3">
    <div className="card h-100" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="card-body py-3">
        <p className="text-muted mb-1" style={{ fontSize: 12 }}>{label}</p>
        <h4 className="mb-0" style={{ color, fontWeight: 700 }}>{value}</h4>
      </div>
    </div>
  </div>
);

const BreakdownItem = ({ label, value }) => (
  <div className="col-md-3 col-6 mb-2">
    <p className="text-muted mb-1" style={{ fontSize: 12 }}>{label}</p>
    <h5 className="mb-0">{value}</h5>
  </div>
);

export default LenderAIDashboard;
