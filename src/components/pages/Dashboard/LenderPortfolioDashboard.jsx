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
const fmtDec = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const churnColor = (level) => {
  if (!level) return "#8c8c8c";
  const l = level.toUpperCase();
  if (l === "HIGH") return "#ff4d4f";
  if (l === "MEDIUM") return "#faad14";
  return "#52c41a";
};

const reinvestColor = (classification) => {
  const c = (classification || "").toUpperCase();
  if (c === "ALWAYS REINVESTS") return "#52c41a";
  if (c === "LOYAL REINVESTOR") return "#73d13d";
  if (c === "PARTIAL REINVESTOR") return "#faad14";
  if (c === "OCCASIONAL REINVESTOR") return "#fa8c16";
  return "#ff4d4f";
};

const StarRating = ({ rating }) => {
  const count = parseInt((rating || "1").split(" ")[0]) || 1;
  return (
    <span>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= count ? "#faad14" : "#d9d9d9", fontSize: 20 }}>★</span>
      ))}
      <span style={{ fontSize: 12, color: "#8c8c8c", marginLeft: 6 }}>{rating}</span>
    </span>
  );
};

const ProgressBar = ({ pct, color }) => (
  <div style={{ background: "#f0f0f0", borderRadius: 6, height: 10, overflow: "hidden", width: "100%" }}>
    <div
      style={{
        width: `${Math.min(100, Math.max(0, pct || 0))}%`,
        height: "100%",
        background: color || "#1890ff",
        borderRadius: 6,
        transition: "width 0.8s ease",
      }}
    />
  </div>
);

const StatCard = ({ label, value, color, sub }) => (
  <div className="col-6 col-md mb-3">
    <div className="card text-center h-100" style={{ borderRadius: 12, border: "1px solid #f0f0f0" }}>
      <div className="card-body py-3 px-2">
        <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#8c8c8c", marginBottom: 6 }}>
          {label}
        </p>
        <h4 style={{ fontWeight: 700, color: color || "#262626", margin: 0 }}>{value}</h4>
        {sub && <p style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4, marginBottom: 0 }}>{sub}</p>}
      </div>
    </div>
  </div>
);

const SectionCard = ({ title, badge, children }) => (
  <div className="card mb-4" style={{ borderRadius: 14, border: "1px solid #f0f0f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
    <div className="card-header" style={{ background: "#fafafa", borderBottom: "1px solid #f0f0f0", borderRadius: "14px 14px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <h6 style={{ margin: 0, fontWeight: 700, color: "#262626" }}>{title}</h6>
      {badge}
    </div>
    <div className="card-body">{children}</div>
  </div>
);

const LenderPortfolioDashboard = () => {
  const { lenderId: paramLenderId } = useParams();
  const resolvedLenderId = paramLenderId || getUserId();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getToken();
        const res = await axios.get(
          `${MARKETPLACE_URL}/v1/ai/lender/${resolvedLenderId}/portfolio`,
          { headers: { accessToken: token } }
        );
        setData(res.data);
      } catch (err) {
        setError(err?.response?.data?.error || err.message || "Failed to load portfolio");
      } finally {
        setLoading(false);
      }
    };
    if (resolvedLenderId) fetchPortfolio();
  }, [resolvedLenderId]);

  return (
    <div className="main-wrapper">
      <Header />
      <SideBar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header mb-4">
            <h3 className="page-title">My Investment Portfolio</h3>
            <p className="text-muted mb-0">AI-powered personal wealth summary</p>
          </div>

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-3 text-muted">Preparing your portfolio narrative…</p>
            </div>
          )}

          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && data && (
            <>
              {/* ── 1. HERO NARRATIVE ──────────────────────────────────────── */}
              <div className="row mb-4">
                <div className="col-12">
                  <div
                    className="card"
                    style={{
                      background: "linear-gradient(135deg, #1a237e 0%, #4a148c 60%, #6a1b9a 100%)",
                      border: "none",
                      borderRadius: 16,
                    }}
                  >
                    <div className="card-body p-4">
                      <div className="d-flex align-items-start mb-3" style={{ flexWrap: "wrap", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ color: "#fff", margin: 0, fontWeight: 700, fontSize: 22 }}>
                            {data.lenderName}
                          </h4>
                          {data.email && (
                            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{data.email}</span>
                          )}
                          <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
                            {[
                              { label: "Member Since", value: data.memberSince ? new Date(data.memberSince).getFullYear() : "—" },
                              { label: "Years Active", value: `${data.memberSinceYears ?? "—"} yrs` },
                              data.city && { label: "City", value: data.city },
                            ].filter(Boolean).map((item) => (
                              <div key={item.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: "6px 14px" }}>
                                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>{item.label}</div>
                                <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{item.value}</div>
                              </div>
                            ))}
                            {data.churnRiskLevel && (
                              <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: "6px 14px" }}>
                                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Engagement</div>
                                <div style={{ color: churnColor(data.churnRiskLevel), fontWeight: 700, fontSize: 14 }}>
                                  {data.churnRiskLevel} RISK
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {data.reinvestmentStarRating && (
                          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 16px", textAlign: "center" }}>
                            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, textTransform: "uppercase", marginBottom: 4 }}>Reinvestment</div>
                            <StarRating rating={data.reinvestmentStarRating} />
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {(data.narrative || data.aiNarrative || "")
                          .split("\n")
                          .map((line) => line.trim())
                          .filter((line) => line.length > 0)
                          .map((line, idx) => {
                            const icons = ["🎯", "💰", "♻️", "📈", "💡"];
                            const text = line.replace(/^[•\-\*#]+\s*/, "").replace(/\*\*/g, "");
                            return (
                              <div
                                key={idx}
                                style={{
                                  background: "rgba(255,255,255,0.09)",
                                  borderRadius: 10,
                                  padding: "12px 16px",
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 12,
                                  border: "1px solid rgba(255,255,255,0.12)",
                                }}
                              >
                                <span style={{ fontSize: 20, lineHeight: 1 }}>{icons[idx] || "•"}</span>
                                <span style={{ color: "#fff", fontSize: 15, lineHeight: 1.6 }}>{text}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 2. STATS ROW (5 cards) ─────────────────────────────────── */}
              <div className="row mb-4">
                <StatCard label="Total Invested" value={`₹${fmt(data.totalInvested)}`} color="#1890ff" />
                <StatCard label="Interest Earned" value={`₹${fmt(data.totalInterestEarned)}`} color="#52c41a" />
                <StatCard label="Wallet Balance" value={`₹${fmt(data.walletBalance)}`} color="#722ed1" sub={data.walletIdleDays > 0 ? `Idle ${Math.round(data.walletIdleDays)} days` : null} />
                <StatCard label="Active Deals" value={data.activeDeals ?? "—"} color="#faad14" sub={`${data.closedDeals ?? 0} closed`} />
                <StatCard label="EMIs Paid" value={data.emisPaid ?? "—"} color="#13c2c2" sub={data.totalDeals ? `${data.totalDeals} total deals` : null} />
              </div>

              {/* ── 3. ACTIVE DEALS WITH PROGRESS BARS ────────────────────── */}
              {(data.activeDealsWithProgress || []).length > 0 && (
                <SectionCard
                  title={`Active Deals (${(data.activeDealsWithProgress || []).length})`}
                  badge={<span style={{ background: "#f6ffed", color: "#52c41a", border: "1px solid #b7eb8f", borderRadius: 6, padding: "2px 10px", fontSize: 12 }}>Live</span>}
                >
                  <div className="row">
                    {(data.activeDealsWithProgress || []).map((deal, idx) => (
                      <div key={idx} className="col-12 col-md-6 mb-3">
                        <div style={{ background: "#fafafa", borderRadius: 10, padding: 16, border: "1px solid #f0f0f0" }}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span style={{ fontWeight: 700, color: "#262626" }}>Deal #{deal.dealId}</span>
                            <span style={{ color: "#1890ff", fontWeight: 600 }}>₹{fmt(deal.amount)}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-1">
                            <span style={{ fontSize: 12, color: "#8c8c8c" }}>{deal.rateOfInterest}% p.a.</span>
                            <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                              {deal.daysPassed || 0} / {deal.daysTotal || 0} days
                            </span>
                          </div>
                          <ProgressBar pct={deal.progressPct} color={deal.progressPct >= 75 ? "#52c41a" : deal.progressPct >= 40 ? "#1890ff" : "#faad14"} />
                          <div className="d-flex justify-content-between mt-2">
                            <span style={{ fontSize: 12, color: "#52c41a" }}>Earned: ₹{fmt(deal.interestEarned)}</span>
                            <span style={{ fontSize: 12, color: deal.daysToMaturity <= 30 ? "#ff4d4f" : "#8c8c8c" }}>
                              {deal.daysToMaturity > 0 ? `${deal.daysToMaturity}d to maturity` : "Maturing"}
                            </span>
                          </div>
                          {deal.nextPayoutDate && (
                            <div style={{ marginTop: 6, fontSize: 12, color: "#722ed1" }}>
                              Next payout: {fmtDate(deal.nextPayoutDate)} — ₹{fmt(deal.nextPayoutAmount)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {/* ── 4. REINVESTMENT PROFILE CARD ───────────────────────────── */}
              {data.reinvestmentDetails && (
                <SectionCard
                  title="Reinvestment Profile"
                  badge={<StarRating rating={data.reinvestmentStarRating || data.reinvestmentDetails?.starRating} />}
                >
                  <div className="row">
                    <div className="col-12 col-md-4 mb-3">
                      <div style={{ textAlign: "center", padding: 16, background: "#fafafa", borderRadius: 10 }}>
                        <div style={{ fontSize: 13, color: "#8c8c8c", marginBottom: 6 }}>Classification</div>
                        <div style={{
                          fontWeight: 700, fontSize: 16,
                          color: reinvestColor(data.reinvestmentDetails.classification),
                          background: reinvestColor(data.reinvestmentDetails.classification) + "18",
                          borderRadius: 8, padding: "6px 12px",
                        }}>
                          {data.reinvestmentDetails.classification || "—"}
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-4 mb-3">
                      <div style={{ textAlign: "center", padding: 16, background: "#fafafa", borderRadius: 10 }}>
                        <div style={{ fontSize: 13, color: "#8c8c8c", marginBottom: 6 }}>Reinvestment Ratio</div>
                        <div style={{ fontWeight: 700, fontSize: 22, color: "#1890ff" }}>
                          {Math.round(data.reinvestmentDetails.reinvestRatioPct || 0)}%
                        </div>
                        <div style={{ fontSize: 12, color: "#8c8c8c" }}>{data.reinvestmentDetails.ratio || "—"}</div>
                      </div>
                    </div>
                    <div className="col-12 col-md-4 mb-3">
                      <div style={{ textAlign: "center", padding: 16, background: "#fafafa", borderRadius: 10 }}>
                        <div style={{ fontSize: 13, color: "#8c8c8c", marginBottom: 6 }}>Reinvest Probability</div>
                        <div style={{ fontWeight: 700, fontSize: 22, color: "#52c41a" }}>
                          {data.reinvestmentDetails.reinvestmentProbabilityPct || 0}%
                        </div>
                        <div style={{ fontSize: 12, color: "#8c8c8c" }}>
                          Avg delay: {data.reinvestmentDetails.avgReinvestmentDelayDays || 0} days
                        </div>
                      </div>
                    </div>
                    <div className="col-6 col-md-3 mb-2">
                      <div style={{ fontSize: 12, color: "#8c8c8c" }}>Preferred Tenure</div>
                      <div style={{ fontWeight: 600 }}>{data.preferredTenure || data.reinvestmentDetails.preferredTenure || "—"}</div>
                    </div>
                    <div className="col-6 col-md-3 mb-2">
                      <div style={{ fontSize: 12, color: "#8c8c8c" }}>Avg Deal Size</div>
                      <div style={{ fontWeight: 600 }}>₹{fmt(data.avgInvestmentAmount || data.reinvestmentDetails.avgInvestmentAmount)}</div>
                    </div>
                    <div className="col-6 col-md-3 mb-2">
                      <div style={{ fontSize: 12, color: "#8c8c8c" }}>Same-Day Reinvest</div>
                      <div style={{ fontWeight: 600, color: (data.reinvestmentDetails.sameDayReinvestFlag) ? "#52c41a" : "#8c8c8c" }}>
                        {data.reinvestmentDetails.sameDayReinvestFlag ? "Yes" : "No"}
                      </div>
                    </div>
                    <div className="col-6 col-md-3 mb-2">
                      <div style={{ fontSize: 12, color: "#8c8c8c" }}>Returns Received</div>
                      <div style={{ fontWeight: 600 }}>{data.reinvestmentDetails.totalReturns || 0}</div>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* ── 5. SMART MATURITY PLANNER ──────────────────────────────── */}
              {(data.upcomingMaturities || []).length > 0 && (
                <SectionCard title="Smart Maturity Planner">
                  <div className="table-responsive">
                    <table className="table table-sm mb-0">
                      <thead className="thead-light">
                        <tr>
                          <th>Deal</th>
                          <th>Maturity Date</th>
                          <th>Principal</th>
                          <th>Days Left</th>
                          <th>Projected Reinvest Earning</th>
                          <th>Nudge Date</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(data.upcomingMaturities || []).map((m, idx) => (
                          <tr key={idx} style={m.actionNeeded ? { background: "#fff7e6" } : {}}>
                            <td><strong>#{m.dealId}</strong></td>
                            <td>{fmtDate(m.maturityDate)}</td>
                            <td>₹{fmt(m.principalAmount)}</td>
                            <td>
                              <span style={{ color: m.daysToMaturity <= 30 ? "#ff4d4f" : m.daysToMaturity <= 60 ? "#faad14" : "#52c41a", fontWeight: 600 }}>
                                {m.daysToMaturity} days
                              </span>
                            </td>
                            <td style={{ color: "#722ed1", fontWeight: 600 }}>₹{fmt(m.projectedEarningIfReinvested)}</td>
                            <td style={{ fontSize: 12, color: "#8c8c8c" }}>{fmtDate(m.nudgeSendDate)}</td>
                            <td>
                              {m.actionNeeded
                                ? <span style={{ background: "#fff1f0", color: "#ff4d4f", border: "1px solid #ffa39e", borderRadius: 4, padding: "2px 8px", fontSize: 11 }}>Plan now</span>
                                : <span style={{ color: "#8c8c8c", fontSize: 11 }}>Monitor</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>
              )}

              {/* ── 6. EARNINGS INTELLIGENCE ──────────────────────────────── */}
              <SectionCard title="Earnings Intelligence">
                <div className="row">
                  <div className="col-12 col-md-6 mb-3">
                    <div style={{ background: "linear-gradient(135deg, #e6f7ff, #bae7ff)", borderRadius: 12, padding: 20, height: "100%" }}>
                      <div style={{ fontSize: 13, color: "#0050b3", fontWeight: 600, marginBottom: 8 }}>
                        FY Earnings Forecast
                      </div>
                      <div style={{ fontSize: 32, fontWeight: 700, color: "#1890ff" }}>
                        ₹{fmt(data.forecastThisFinancialYear || data.earningsForecast?.forecastThisFinancialYear)}
                      </div>
                      {data.earningsForecast?.financialYearEnd && (
                        <div style={{ fontSize: 12, color: "#0050b3", marginTop: 6 }}>
                          By {fmtDate(data.earningsForecast.financialYearEnd)}
                        </div>
                      )}
                      <div style={{ marginTop: 12, fontSize: 13, color: "#0050b3" }}>
                        To earn ₹1 Lakh this FY, deploy{" "}
                        <strong>₹{fmt(data.amountNeededForOneLakhTarget || data.earningsForecast?.amountNeededToReachOneLakh)}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-6 mb-3">
                    {data.fdComparison && (
                      <div style={{ background: "linear-gradient(135deg, #f6ffed, #d9f7be)", borderRadius: 12, padding: 20, height: "100%" }}>
                        <div style={{ fontSize: 13, color: "#135200", fontWeight: 600, marginBottom: 8 }}>
                          vs SBI Fixed Deposit
                        </div>
                        <div className="d-flex align-items-center gap-3 mb-2">
                          <div>
                            <div style={{ fontSize: 11, color: "#52c41a" }}>OxyLoans ROI</div>
                            <div style={{ fontSize: 26, fontWeight: 700, color: "#52c41a" }}>
                              {data.fdComparison.oxyloansReturnPct || 0}%
                            </div>
                          </div>
                          <div style={{ fontSize: 22, color: "#52c41a", fontWeight: 700 }}>vs</div>
                          <div>
                            <div style={{ fontSize: 11, color: "#8c8c8c" }}>SBI FD Rate</div>
                            <div style={{ fontSize: 26, fontWeight: 700, color: "#8c8c8c" }}>
                              {data.fdComparison.sbiFdRate || 6.8}%
                            </div>
                          </div>
                        </div>
                        {data.fdComparison.extraEarningsVsFd > 0 && (
                          <div style={{ background: "#52c41a", color: "#fff", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 600 }}>
                            +{data.fdComparison.extraEarningsVsFd}% extra vs SBI FD
                          </div>
                        )}
                        <div style={{ marginTop: 8, fontSize: 12, color: "#135200" }}>{data.fdComparison.summary}</div>
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>

              {/* ── 7. SAFETY NARRATIVE ───────────────────────────────────── */}
              {(data.safetyNarrativeDetails || data.safetyNarrative) && (
                <SectionCard
                  title="Safety & Compliance"
                  badge={<span style={{ background: "#f6ffed", color: "#52c41a", border: "1px solid #b7eb8f", borderRadius: 6, padding: "2px 10px", fontSize: 12 }}>RBI Registered</span>}
                >
                  <div className="row align-items-center">
                    <div className="col-12 col-md-8">
                      <p style={{ fontSize: 14, color: "#595959", margin: 0 }}>
                        {data.safetyNarrativeDetails?.message || data.safetyNarrative}
                      </p>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="row text-center mt-3 mt-md-0">
                        <div className="col-6">
                          <div style={{ fontSize: 11, color: "#8c8c8c" }}>On-Time Rate</div>
                          <div style={{ fontSize: 22, fontWeight: 700, color: "#52c41a" }}>
                            {data.onTimePaymentRate || data.safetyNarrativeDetails?.onTimePaymentRate || 0}%
                          </div>
                        </div>
                        <div className="col-6">
                          <div style={{ fontSize: 11, color: "#8c8c8c" }}>Payments Made</div>
                          <div style={{ fontSize: 22, fontWeight: 700, color: "#1890ff" }}>
                            {data.successfulPayments || data.safetyNarrativeDetails?.successfulPayments || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* ── 8. DEAL HISTORY TABLE ─────────────────────────────────── */}
              <SectionCard
                title="Deal History"
                badge={<span style={{ fontSize: 12, color: "#8c8c8c" }}>{(data.deals || []).length} deals</span>}
              >
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="thead-light">
                      <tr>
                        <th>Deal ID</th>
                        <th>Amount</th>
                        <th>ROI %</th>
                        <th>Status</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Interest Earned</th>
                        <th>Next Payout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.deals || data.allDeals || []).length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center text-muted py-4">No deals found</td>
                        </tr>
                      )}
                      {(data.deals || data.allDeals || []).map((deal, idx) => {
                        const isActive = (deal.status || "").toUpperCase() === "ACTIVE";
                        return (
                          <tr key={idx} style={isActive ? { background: "#f6ffed" } : {}}>
                            <td><strong>#{deal.dealId}</strong></td>
                            <td>₹{fmt(deal.amount)}</td>
                            <td>{deal.rateOfInterest}%</td>
                            <td>
                              <span style={{
                                color: isActive ? "#52c41a" : "#8c8c8c",
                                fontWeight: 600,
                                background: isActive ? "#f6ffed" : "#f5f5f5",
                                borderRadius: 4,
                                padding: "2px 8px",
                                fontSize: 12,
                              }}>
                                {deal.status || "—"}
                              </span>
                            </td>
                            <td style={{ fontSize: 13 }}>{fmtDate(deal.startDate)}</td>
                            <td style={{ fontSize: 13, color: "#8c8c8c" }}>{fmtDate(deal.endDate)}</td>
                            <td style={{ color: "#52c41a", fontWeight: 600 }}>₹{fmt(deal.interestEarned)}</td>
                            <td style={{ fontSize: 13 }}>
                              {deal.nextPayoutDate ? fmtDate(deal.nextPayoutDate) : <span style={{ color: "#bfbfbf" }}>—</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              {/* ── 9. REFERRAL CARD ──────────────────────────────────────── */}
              {(data.referredLendersCount > 0 || data.referralEarnings > 0) && (
                <SectionCard title="Referral Summary">
                  <div className="row text-center">
                    <div className="col-4">
                      <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase" }}>Lenders Referred</div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: "#722ed1" }}>{data.referredLendersCount || 0}</div>
                    </div>
                    <div className="col-4">
                      <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase" }}>Referred Amount</div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: "#1890ff" }}>₹{fmt(data.totalReferredAmount)}</div>
                    </div>
                    <div className="col-4">
                      <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase" }}>Referral Earnings</div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: "#52c41a" }}>₹{fmt(data.referralEarnings)}</div>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* Footer */}
              <div className="row mb-2">
                <div className="col-12">
                  <small className="text-muted">
                    Generated at: {data.generatedAt ? new Date(data.generatedAt).toLocaleString("en-IN") : "—"}
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

export default LenderPortfolioDashboard;
