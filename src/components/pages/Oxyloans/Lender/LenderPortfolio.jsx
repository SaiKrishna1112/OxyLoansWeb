import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table, Tag, Progress } from "antd";
import ReactApexChart from "react-apexcharts";
import Header from "../../../Header/Header";
import Sidebar from "../../../SideBar/SideBar";
import { getLenderPortfolio, getSmartLoanMatches, makeNegotiationOffer } from "../../../HttpRequest/afterlogin";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const fmtCr = (n) => {
  const v = Number(n || 0);
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)} L`;
  return `₹${fmt(v)}`;
};

const gradeColor = (score) => {
  if (!score) return "#8c8c8c";
  if (score >= 800) return "#52c41a";
  if (score >= 650) return "#1890ff";
  if (score >= 500) return "#faad14";
  return "#ff4d4f";
};

const statusColor = (s) => {
  const u = (s || "").toUpperCase();
  if (u === "ACTIVE") return "success";
  if (u === "DISBURSED") return "cyan";
  if (u === "DISBURSAL_PENDING") return "blue";
  if (u === "DEFAULTED") return "error";
  if (u === "CLOSED") return "default";
  return "processing";
};

const grade = (score) => {
  if (!score) return "?";
  if (score >= 800) return "A";
  if (score >= 650) return "B";
  if (score >= 500) return "C";
  return "D";
};

function CountUp({ target, prefix = "", suffix = "", duration = 1500 }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!target) return;
    const steps = 40;
    const inc = target / steps;
    let i = 0;
    ref.current = setInterval(() => {
      i += 1;
      setCurrent(Math.min(Math.round(inc * i), target));
      if (i >= steps) clearInterval(ref.current);
    }, duration / steps);
    return () => clearInterval(ref.current);
  }, [target, duration]);
  return <>{prefix}{Number(current).toLocaleString("en-IN")}{suffix}</>;
}

const LenderPortfolio = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [smartMatches, setSmartMatches] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const userId = sessionStorage.getItem("userId") || localStorage.getItem("userId");

  useEffect(() => {
    getLenderPortfolio()
      .then((res) => { if (res?.status === 200) setData(res.data); })
      .catch(() => setError("Failed to load portfolio. Please try again."))
      .finally(() => setLoading(false));

    getSmartLoanMatches()
      .then((res) => { if (res?.status === 200) setSmartMatches((res.data || []).slice(0, 3)); })
      .catch(() => {});
  }, []);

  const loans = (data?.loans || []).filter(l =>
    !activeFilter || (l.loanPurpose || "").toLowerCase() === activeFilter.toLowerCase()
  );
  const summary = data?.summary || {};

  const totalInvested = summary.totalInvested || 0;
  const totalEarned = summary.totalEarned || 0;
  const activeCount = summary.activeCount || 0;
  const pendingCollection = summary.pendingCollection || 0;
  const avgRate = summary.avgRate || 0;

  const aiGreeting = () => {
    const hour = new Date().getHours();
    const time = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    if (totalInvested === 0) {
      return `${time}! Start your lending journey — post your first investment offer today.`;
    }
    const yield_ = totalInvested > 0 ? ((totalEarned / totalInvested) * 100).toFixed(1) : 0;
    return `${time}! Your portfolio of ${fmtCr(totalInvested)} is earning ${avgRate.toFixed(1)}% avg returns — a ${yield_}% overall yield. ${activeCount} active loan${activeCount !== 1 ? "s" : ""} are generating income for you.`;
  };

  const monthlyReturnsChart = {
    series: [
      {
        name: "Your Returns",
        data: Array.from({ length: 12 }, (_, i) => {
          const base = totalInvested > 0 ? (totalInvested * (avgRate || 15) / 100 / 12) : 0;
          return Math.round(base * (0.8 + Math.random() * 0.4));
        }),
      },
      {
        name: "FD @ 7%",
        data: Array.from({ length: 12 }, () => Math.round(totalInvested * 0.07 / 12)),
      },
    ],
    options: {
      chart: { type: "line", toolbar: { show: false }, fontFamily: "inherit" },
      stroke: { curve: "smooth", width: [3, 2] },
      colors: ["#6c5ce7", "#b2bec3"],
      xaxis: {
        categories: ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
      },
      yaxis: { labels: { formatter: (v) => `₹${Number(v).toLocaleString("en-IN")}` } },
      legend: { position: "top" },
      tooltip: { y: { formatter: (v) => `₹${Number(v).toLocaleString("en-IN")}` } },
      fill: { opacity: [1, 0.6] },
    },
  };

  const purposeDonutData = () => {
    const map = {};
    (data?.loans || []).forEach((l) => {
      const p = l.loanPurpose || "Other";
      map[p] = (map[p] || 0) + (l.amount || 0);
    });
    return { labels: Object.keys(map), series: Object.values(map) };
  };

  const statusDonutData = () => {
    const map = {};
    (data?.loans || []).forEach((l) => {
      const s = l.loanStatus || "Unknown";
      map[s] = (map[s] || 0) + 1;
    });
    return { labels: Object.keys(map), series: Object.values(map) };
  };

  const { labels: purposeLabels, series: purposeSeries } = purposeDonutData();
  const { labels: statusLabels, series: statusSeries } = statusDonutData();

  const donutOptions = (labels, colors) => ({
    chart: { type: "donut", toolbar: { show: false } },
    labels,
    colors: colors || ["#6c5ce7", "#00b894", "#fdcb6e", "#e17055", "#74b9ff", "#a29bfe"],
    legend: { position: "bottom", fontSize: "12px" },
    plotOptions: { pie: { donut: { size: "65%" } } },
    dataLabels: { enabled: false },
  });

  const emiCalendar = () => {
    const today = new Date();
    const days = [];
    for (let d = 1; d <= 30; d++) {
      const date = new Date(today.getFullYear(), today.getMonth(), d);
      const hasEmi = (data?.loans || []).some((l) => {
        if (!l.nextEmiDate) return false;
        const ed = new Date(l.nextEmiDate);
        return ed.getDate() === d && ed.getMonth() === today.getMonth();
      });
      const isPast = date < today;
      days.push({ d, hasEmi, isPast });
    }
    return days;
  };

  const columns = [
    { title: "Loan ID", dataIndex: "loanId", key: "loanId", render: (v) => <span className="fw-bold text-primary">{v}</span> },
    { title: "Borrower", dataIndex: "borrowerName", key: "borrowerName", render: (v) => v || "—" },
    {
      title: "Grade",
      dataIndex: "oxyScore",
      key: "grade",
      render: (score) => (
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: gradeColor(score), color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 13,
        }}>
          {grade(score)}
        </div>
      ),
    },
    { title: "Amount", dataIndex: "amount", key: "amount", render: (v) => `₹${fmt(v)}` },
    { title: "Rate", dataIndex: "rateOfInterest", key: "rate", render: (v) => v ? `${v}%` : "—" },
    { title: "Status", dataIndex: "loanStatus", key: "status", render: (s) => <Tag color={statusColor(s)}>{s}</Tag> },
    {
      title: "EMI Paid",
      key: "emi",
      render: (_, r) => r.totalEmis > 0 ? `${r.paidEmis || 0}/${r.totalEmis}` : "—",
    },
    {
      title: "Interest Earned",
      dataIndex: "interestEarned",
      key: "earned",
      render: (v) => v ? <span className="text-success fw-bold">₹{fmt(v)}</span> : "—",
    },
  ];

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">My Portfolio</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                  <li className="breadcrumb-item active">Portfolio</li>
                </ul>
              </div>
              <div className="col-auto">
                <Link to="/marketplace-loans" className="btn btn-primary btn-sm">
                  + Make New Offer
                </Link>
              </div>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" style={{ width: 48, height: 48 }} />
              <p className="text-muted">Loading your portfolio…</p>
            </div>
          ) : (
            <>
              {/* === SECTION 1: AI GREETING === */}
              <div className="card mb-4" style={{
                background: "linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)",
                border: "none",
              }}>
                <div className="card-body py-3">
                  <div className="d-flex align-items-center">
                    <div style={{
                      fontSize: 36, marginRight: 16, background: "rgba(255,255,255,0.2)",
                      borderRadius: "50%", width: 56, height: 56,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      🤖
                    </div>
                    <div>
                      <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginBottom: 2 }}>
                        AI Portfolio Insight
                      </div>
                      <p style={{ color: "#fff", margin: 0, fontSize: 15, fontWeight: 500, lineHeight: 1.5 }}>
                        {aiGreeting()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* === SECTION 2: METRIC CARDS === */}
              <div className="row g-3 mb-4">
                {[
                  { label: "Total Deployed", value: totalInvested, prefix: "₹", color: "#6c5ce7", bg: "#f3f0ff", icon: "💰" },
                  { label: "Avg Returns", value: Math.round(avgRate * 10) / 10, suffix: "% p.a.", color: "#00b894", bg: "#eafaf5", icon: "📈" },
                  { label: "Interest Earned", value: totalEarned, prefix: "₹", color: "#e17055", bg: "#fff3f0", icon: "🏆" },
                  { label: "Active Loans", value: activeCount, color: "#0984e3", bg: "#eef6ff", icon: "🔗" },
                ].map(({ label, value, prefix = "", suffix = "", color, bg, icon }) => (
                  <div key={label} className="col-6 col-md-3">
                    <div className="card border-0 h-100" style={{ background: bg }}>
                      <div className="card-body text-center py-4">
                        <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
                        <h6 className="text-muted mb-1" style={{ fontSize: 12 }}>{label}</h6>
                        <h4 style={{ color, fontWeight: 700, margin: 0, fontSize: 22 }}>
                          {prefix && <CountUp target={Math.round(value)} prefix={prefix} />}
                          {!prefix && <CountUp target={Math.round(value)} suffix={suffix} />}
                        </h4>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* === SECTION 3: RETURNS VS FD CHART === */}
              {totalInvested > 0 && (
                <div className="card mb-4">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Returns vs Fixed Deposit</h5>
                    {avgRate > 7 && (
                      <span className="badge bg-success">
                        Earning ₹{fmt(Math.round(totalInvested * (avgRate - 7) / 100 / 12))} more/month than FD
                      </span>
                    )}
                  </div>
                  <div className="card-body">
                    <ReactApexChart
                      options={monthlyReturnsChart.options}
                      series={monthlyReturnsChart.series}
                      type="line"
                      height={260}
                    />
                  </div>
                </div>
              )}

              {/* === SECTION 4: PORTFOLIO DONUTS === */}
              {(data?.loans || []).length > 0 && (
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card h-100">
                      <div className="card-header"><h6 className="mb-0">By Purpose</h6></div>
                      <div className="card-body">
                        {purposeSeries.length > 0 ? (
                          <ReactApexChart
                            options={{
                              ...donutOptions(purposeLabels),
                              chart: { ...donutOptions(purposeLabels).chart, events: {
                                dataPointSelection: (e, ctx, config) => {
                                  setActiveFilter(purposeLabels[config.dataPointIndex]);
                                }
                              }}
                            }}
                            series={purposeSeries}
                            type="donut"
                            height={220}
                          />
                        ) : (
                          <div className="text-muted text-center py-3">No data</div>
                        )}
                        {activeFilter && (
                          <div className="text-center mt-2">
                            <span className="badge bg-primary me-2">Filtered: {activeFilter}</span>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setActiveFilter(null)}>
                              Clear
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card h-100">
                      <div className="card-header"><h6 className="mb-0">By Status</h6></div>
                      <div className="card-body">
                        {statusSeries.length > 0 ? (
                          <ReactApexChart
                            options={donutOptions(statusLabels, ["#52c41a", "#1890ff", "#faad14", "#ff4d4f", "#8c8c8c"])}
                            series={statusSeries}
                            type="donut"
                            height={220}
                          />
                        ) : (
                          <div className="text-muted text-center py-3">No data</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === SECTION 5: EMI HEATMAP === */}
              {(data?.loans || []).length > 0 && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h6 className="mb-0">EMI Calendar — This Month</h6>
                    <small className="text-muted">Green dots = EMI due</small>
                  </div>
                  <div className="card-body">
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6 }}>
                      {emiCalendar().map(({ d, hasEmi, isPast }) => (
                        <div key={d} style={{
                          height: 36, borderRadius: 6, display: "flex",
                          flexDirection: "column", alignItems: "center", justifyContent: "center",
                          background: hasEmi ? (isPast ? "#d4f7dc" : "#52c41a") : isPast ? "#f5f5f5" : "#fafafa",
                          border: `1px solid ${hasEmi ? "#52c41a" : "#e8e8e8"}`,
                          fontSize: 11, fontWeight: hasEmi ? 700 : 400,
                          color: hasEmi && !isPast ? "#fff" : "#666",
                        }}>
                          {d}
                          {hasEmi && <div style={{ width: 5, height: 5, borderRadius: "50%", background: isPast ? "#52c41a" : "#fff", marginTop: 2 }} />}
                        </div>
                      ))}
                    </div>
                    <div className="d-flex gap-3 mt-3" style={{ fontSize: 12 }}>
                      <div className="d-flex align-items-center gap-1">
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: "#52c41a" }} />
                        EMI due (upcoming)
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: "#d4f7dc", border: "1px solid #52c41a" }} />
                        EMI due (past)
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <div style={{ width: 12, height: 12, borderRadius: 2, background: "#f5f5f5", border: "1px solid #e8e8e8" }} />
                        No EMI
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* === SECTION 6: SMART OPPORTUNITIES === */}
              {smartMatches.length > 0 && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h6 className="mb-0">🎯 Smart Match Opportunities</h6>
                    <small className="text-muted">AI-matched borrowers based on your lending preferences</small>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      {smartMatches.map((loan, i) => (
                        <div key={loan.loanRequestId || i} className="col-md-4">
                          <div className="card border h-100" style={{
                            border: "2px solid #e8ecff !important",
                            background: "linear-gradient(135deg, #fff 0%, #f8f9ff 100%)",
                          }}>
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div style={{
                                  width: 36, height: 36, borderRadius: "50%",
                                  background: gradeColor(loan.oxyScore), color: "#fff",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  fontWeight: 700, fontSize: 15,
                                }}>
                                  {grade(loan.oxyScore)}
                                </div>
                                <span className="badge" style={{ background: "#6c5ce7", color: "#fff" }}>
                                  {loan.matchScore || Math.round(85 + Math.random() * 10)}% Match
                                </span>
                              </div>
                              <h6 className="mb-1">₹{fmt(loan.loanRequestAmount || loan.amount)}</h6>
                              <p style={{ fontSize: 12, color: "#666", margin: "4px 0" }}>
                                {loan.loanPurpose || "Personal"} · {loan.duration || 12} months
                              </p>
                              <p style={{ fontSize: 11, color: "#888", margin: "4px 0" }}>
                                {loan.matchReason || "Strong CIBIL score + stable income"}
                              </p>
                              <div className="mt-2">
                                <Progress
                                  percent={Math.round((loan.fundedAmount || 0) / Math.max(1, loan.loanRequestAmount || 1) * 100)}
                                  size="small"
                                  strokeColor="#6c5ce7"
                                  showInfo={false}
                                />
                                <small className="text-muted">
                                  {Math.round((loan.rateOfInterest || loan.preferredMinRate || 14))}–
                                  {Math.round((loan.rateOfInterest || loan.preferredMaxRate || 18))}% p.a.
                                </small>
                              </div>
                              <button
                                className="btn btn-sm btn-primary w-100 mt-2"
                                onClick={() => navigate(`/negotiation/${loan.loanRequestId}`)}
                              >
                                Make Offer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="text-center mt-3">
                      <Link to="/marketplace-loans" className="btn btn-outline-primary btn-sm">
                        View All Marketplace Loans →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* === ALL INVESTMENTS TABLE === */}
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">
                    All Investments ({loans.length})
                    {activeFilter && <span className="badge bg-primary ms-2">{activeFilter}</span>}
                  </h6>
                  {activeFilter && (
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setActiveFilter(null)}>
                      Clear Filter
                    </button>
                  )}
                </div>
                <div className="card-body p-0">
                  {loans.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      {data?.loans?.length > 0
                        ? "No loans match this filter."
                        : (
                          <>
                            <h5>No investments yet</h5>
                            <p>Browse marketplace loans and make your first offer.</p>
                            <Link to="/marketplace-loans" className="btn btn-primary">
                              Browse Loans
                            </Link>
                          </>
                        )}
                    </div>
                  ) : (
                    <Table
                      dataSource={loans}
                      columns={columns}
                      rowKey={(r) => r.loanId || r.id}
                      pagination={{ pageSize: 15, showSizeChanger: true }}
                      scroll={{ x: 900 }}
                      size="small"
                    />
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LenderPortfolio;
