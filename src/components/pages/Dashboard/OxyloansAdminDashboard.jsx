import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import OxyloansAdminHeader from "../../Header/OxyloansAdminHeader";
import OxyloansAdminSidebar from "../../SideBar/OxyloansAdminSidebar";
import Footer from "../../Footer/Footer";
import FloatingAssistant from "../../FloatingAssistant";
import logo from "../../../assets/img/avtarimage.png";
import { MARKETPLACE_URL } from "../../../config";
import { getToken } from "../../HttpRequest/afterlogin";
import axios from "axios";

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const indFmt = (n) => {
  const v = Number(n || 0);
  if (v >= 1e7)  return `₹${(v / 1e7).toFixed(2)} Cr`;
  if (v >= 1e5)  return `₹${(v / 1e5).toFixed(2)} L`;
  return `₹${fmt(v)}`;
};

const FY_OPTIONS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

// ── sub-components ────────────────────────────────────────────────────────────
const KpiCard = ({ label, value, sub, color, icon }) => (
  <div className="col-6 col-md-4 col-xl-2 mb-3">
    <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: 14, borderLeft: `4px solid ${color}` }}>
      <div className="card-body py-3 px-3">
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#8c8c8c", marginBottom: 4 }}>{label}</div>
        <div style={{ fontWeight: 800, fontSize: 20, color: color || "#262626", lineHeight: 1.2 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 3 }}>{sub}</div>}
      </div>
    </div>
  </div>
);

const SectionCard = ({ title, badge, children }) => (
  <div className="card mb-4 border-0 shadow-sm" style={{ borderRadius: 14 }}>
    <div className="card-header bg-white border-bottom" style={{ borderRadius: "14px 14px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px" }}>
      <h6 style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#262626" }}>{title}</h6>
      {badge}
    </div>
    <div className="card-body">{children}</div>
  </div>
);

const OxyloansAdminDashboard = () => {
  const[userData,setUserData]=useState({})
  const [ActiveLenders, setActiveLenders] = useState({});
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState('');
const primaryType=localStorage.getItem('primaryType') || sessionStorage.getItem('primaryType')
  const email = sessionStorage.getItem("email") || localStorage.getItem("email") || "";
  const adminName = email.includes("@") ? email.split("@")[0].replace(/^\w/, c => c.toUpperCase()) : "Admin";

  const currentFy = new Date().getMonth() >= 3 ? new Date().getFullYear() : new Date().getFullYear() - 1;
  const [selectedFy, setSelectedFy] = useState(currentFy);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = getToken();
    setLoading(true);
    setError(null);
    axios.get(`${MARKETPLACE_URL}/v1/ai/admin/platform-stats?fy=${selectedFy}`, {
      headers: { accessToken: token }
    }).then(res => {
      setData(res.data);
    }).catch(err => {
      setError(err?.response?.data?.error || "Failed to load stats");
    }).finally(() => setLoading(false));
  }, [selectedFy]);

  const kpis   = data?.kpis   || {};
  const users  = data?.users  || {};
  const monthly = data?.monthlyTrend || [];
  const fyHist  = data?.fyHistory   || [];
  const topLenders = data?.topLenders || [];
  const topDeals   = data?.topDeals  || [];
  const leaderboard = data?.fyLeaderboard || [];

  // Monthly chart series
  const mLabels   = monthly.map(m => m.monthLabel);
  const mInterest = monthly.map(m => m.interestPaid);
  const mPrincipal = monthly.map(m => m.principalReturned);

  // FY history chart
  const fyLabels    = fyHist.map(f => f.fyLabel);
  const fyInterests = fyHist.map(f => f.interestPaid);
  const fyPrincipals = fyHist.map(f => f.principalReturned);

  const chartFont = { fontFamily: "inherit" };

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />

      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row">
              <div className="col-sm-12">
                <h3 className="page-title text-primary">  Welcome {email ? capitalize(email.split("@")[0]) : capitalize(primaryType)}
                </h3>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-3 text-muted">Loading platform data…</p>
            </div>
          )}
          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && data && (
            <>
              {/* ── SECTION: THIS FY KPIs ── */}
              <div className="mb-2" style={{ fontSize: 12, fontWeight: 700, color: "#8c8c8c", textTransform: "uppercase", letterSpacing: 1 }}>
                {kpis.fyLabel} — Payouts to Lenders
              </div>
              <div className="row mb-2">
                <KpiCard label="Interest Paid Out" value={indFmt(kpis.fyInterestPaid)}       color="#52c41a" sub={`${fmt(kpis.fyLendersPaid)} lenders received`} />
                <KpiCard label="Principal Returned" value={indFmt(kpis.fyPrincipalReturned)} color="#1890ff" sub="to lenders this FY" />
                <KpiCard label="Total FY Disbursed" value={indFmt(kpis.fyTotalDisbursed)}    color="#722ed1" sub="interest + principal" />
                <KpiCard label="Active Deals (P2P)"  value={fmt(kpis.activeDeals)}            color="#faad14" sub={`${indFmt(kpis.activeDealsAmount)} deployed`} />
                <KpiCard label="Closed Deals (P2P)"  value={fmt(kpis.closedDeals)}            color="#8c8c8c" sub={`${indFmt(kpis.closedDealsAmount)} returned`} />
                <KpiCard label="Wallet Balance"      value={indFmt(kpis.totalWalletBalance)}  color="#13c2c2" sub="platform-wide escrow" />
              </div>

              {/* ── SECTION: ALL-TIME KPIs ── */}
              <div className="mb-2 mt-3" style={{ fontSize: 12, fontWeight: 700, color: "#8c8c8c", textTransform: "uppercase", letterSpacing: 1 }}>
                All-Time Platform Numbers
              </div>
              <div className="row mb-4">
                <KpiCard label="Total Ever Invested"  value={indFmt(kpis.totalInvested)}         color="#1a237e" sub={`${fmt(kpis.totalLenders)} lenders · ${fmt(kpis.p2pDeals)} P2P + ${fmt(kpis.equityDeals)} equity deals`} />
                <KpiCard label="All-Time Interest"    value={indFmt(kpis.allTimeInterestPaid)}    color="#52c41a" sub="paid to lenders" />
                <KpiCard label="All-Time Principal"   value={indFmt(kpis.allTimePrincipalReturned)} color="#1890ff" sub="returned to lenders" />
                <KpiCard label="Registered Users"     value={fmt(users.total)}                   color="#f5222d" sub={`${fmt(users.lenders)} lenders · ${fmt(users.borrowers)} borrowers`} />
                <KpiCard label="New This Month"        value={fmt(users.newLast30Days)}            color="#fa8c16" sub={`${fmt(users.newLast7Days)} this week`} />
              </div>

              {/* ── MONTHLY TREND CHART ── */}
              <SectionCard
                title="Monthly Payouts to Lenders — Last 13 Months"
                badge={<span style={{ fontSize: 12, color: "#52c41a", fontWeight: 600 }}>Interest + Principal</span>}
              >
                <ReactApexChart
                  options={{
                    chart: { type: "bar", stacked: false, toolbar: { show: false }, ...chartFont },
                    xaxis: { categories: mLabels, labels: { rotate: -45, style: { fontSize: "11px" } } },
                    yaxis: { title: { text: "Amount (₹)" }, labels: { formatter: v => `₹${(v / 1e5).toFixed(0)}L` } },
                    colors: ["#52c41a", "#1890ff"],
                    plotOptions: { bar: { borderRadius: 4, columnWidth: "60%" } },
                    dataLabels: { enabled: false },
                    legend: { position: "top" },
                    tooltip: { y: { formatter: v => indFmt(v) } },
                  }}
                  series={[
                    { name: "Interest Paid", data: mInterest },
                    { name: "Principal Returned", data: mPrincipal },
                  ]}
                  type="bar" height={280}
                />
              </SectionCard>

              {/* ── FY HISTORY CHART ── */}
              <SectionCard
                title="Year-on-Year FY Summary"
                badge={<span style={{ fontSize: 12, color: "#722ed1", fontWeight: 600 }}>Since inception</span>}
              >
                <ReactApexChart
                  options={{
                    chart: { type: "bar", stacked: true, toolbar: { show: false }, ...chartFont },
                    xaxis: { categories: fyLabels },
                    yaxis: { title: { text: "Amount (₹)" }, labels: { formatter: v => `₹${(v / 1e7).toFixed(1)}Cr` } },
                    colors: ["#52c41a", "#1890ff"],
                    plotOptions: { bar: { borderRadius: 4, columnWidth: "55%" } },
                    dataLabels: { enabled: false },
                    legend: { position: "top" },
                    tooltip: { y: { formatter: v => indFmt(v) } },
                  }}
                  series={[
                    { name: "Interest Paid", data: fyInterests },
                    { name: "Principal Returned", data: fyPrincipals },
                  ]}
                  type="bar" height={250}
                />
              </SectionCard>

              {/* ── TWO COLUMN: TOP LENDERS + FY LEADERBOARD ── */}
              <div className="row">
                {/* Top lenders by all-time investment */}
                <div className="col-12 col-lg-6 mb-4">
                  <SectionCard title="Top 10 Lenders by Investment" badge={<span style={{ fontSize: 11, color: "#8c8c8c" }}>All time</span>}>
                    <div className="table-responsive">
                      <table className="table table-sm mb-0">
                        <thead className="thead-light">
                          <tr>
                            <th>#</th>
                            <th>Lender</th>
                            <th className="text-right" title="Uses corrected lpu.updation_amount when available">Total Invested</th>
                            <th className="text-right" title="All deals including equity">Deals</th>
                            <th className="text-right" title={`Interest paid to this lender in ${kpis.fyLabel} only — not all-time`}>{kpis.fyLabel} Interest ℹ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topLenders.map((l, i) => (
                            <tr key={i}>
                              <td style={{ color: "#8c8c8c", fontWeight: 600 }}>{i + 1}</td>
                              <td style={{ fontWeight: 600 }}>{l.name.trim()}</td>
                              <td className="text-right" style={{ color: "#1890ff", fontWeight: 600 }}>{indFmt(l.totalInvested)}</td>
                              <td className="text-right">
                                {l.dealCount}
                                {l.equityDeals > 0 && <span style={{ fontSize: 10, color: "#fa8c16", marginLeft: 4 }}>({l.equityDeals} equity)</span>}
                              </td>
                              <td className="text-right" style={{ color: "#52c41a" }}>{indFmt(l.fyInterestEarned)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </SectionCard>
                </div>

                {/* FY interest leaderboard */}
                <div className="col-12 col-lg-6 mb-4">
                  <SectionCard title={`${kpis.fyLabel} Interest Earners (Top 10)`} badge={<span style={{ background: "#f6ffed", color: "#52c41a", border: "1px solid #b7eb8f", borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>This FY</span>}>
                    <div className="table-responsive">
                      <table className="table table-sm mb-0">
                        <thead className="thead-light">
                          <tr>
                            <th>#</th>
                            <th>Lender</th>
                            <th className="text-right">Interest Earned</th>
                            <th className="text-right">Principal Back</th>
                            <th className="text-right">Payouts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaderboard.map((l, i) => (
                            <tr key={i}>
                              <td>
                                <span style={{
                                  fontWeight: 700, fontSize: 12,
                                  color: i === 0 ? "#faad14" : i === 1 ? "#8c8c8c" : i === 2 ? "#cd7f32" : "#595959"
                                }}>
                                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                                </span>
                              </td>
                              <td style={{ fontWeight: 600 }}>{l.name.trim()}</td>
                              <td className="text-right" style={{ color: "#52c41a", fontWeight: 600 }}>{indFmt(l.fyInterestEarned)}</td>
                              <td className="text-right" style={{ color: "#1890ff" }}>{indFmt(l.fyPrincipalReturned)}</td>
                              <td className="text-right">{l.payoutCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </SectionCard>
                </div>
              </div>

              {/* ── DEAL PORTFOLIO + TOP DEALS ── */}
              <div className="row">
                {/* Deal status donut */}
                <div className="col-12 col-md-4 mb-4">
                  <SectionCard title="Deal Portfolio" badge={<span style={{ fontSize: 11, color: "#8c8c8c" }}>{fmt(kpis.totalDeals)} total</span>}>
                    <ReactApexChart
                      options={{
                        chart: { type: "donut", ...chartFont },
                        labels: ["Active", "Closed"],
                        colors: ["#52c41a", "#d9d9d9"],
                        legend: { position: "bottom" },
                        plotOptions: { pie: { donut: { size: "65%", labels: { show: true, total: { show: true, label: "Deals", formatter: () => fmt(kpis.totalDeals) } } } } },
                        tooltip: { y: { formatter: (v, { seriesIndex }) => `${v} deals — ${indFmt(seriesIndex === 0 ? kpis.activeDealsAmount : kpis.closedDealsAmount)}` } },
                        dataLabels: { enabled: true, formatter: (v, { seriesIndex, w }) => `${w.config.labels[seriesIndex]}: ${w.config.series[seriesIndex]}` },
                      }}
                      series={[kpis.activeDeals || 0, kpis.closedDeals || 0]}
                      type="donut" height={260}
                    />
                  </SectionCard>
                </div>

                {/* Top 5 deals by volume */}
                <div className="col-12 col-md-8 mb-4">
                  <SectionCard title="Top 5 Deals by Volume">
                    <div className="table-responsive">
                      <table className="table table-sm mb-0">
                        <thead className="thead-light">
                          <tr>
                            <th>Deal</th>
                            <th>Status</th>
                            <th className="text-right">Volume</th>
                            <th className="text-right">Lenders</th>
                            <th className="text-right">ROI</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topDeals.map((d, i) => (
                            <tr key={i}>
                              <td><strong>#{d.dealId}</strong><br /><span style={{ fontSize: 11, color: "#8c8c8c" }}>{d.dealName}</span></td>
                              <td>
                                <span style={{
                                  background: d.status === "ACTIVE" ? "#f6ffed" : "#f5f5f5",
                                  color: d.status === "ACTIVE" ? "#52c41a" : "#8c8c8c",
                                  border: `1px solid ${d.status === "ACTIVE" ? "#b7eb8f" : "#d9d9d9"}`,
                                  borderRadius: 4, padding: "1px 7px", fontSize: 11, fontWeight: 600
                                }}>
                                  {d.status}
                                </span>
                              </td>
                                <td className="text-right" style={{ fontWeight: 700, color: "#1890ff" }}>{indFmt(d.volume)}</td>
                              <td className="text-right">{d.lenderCount}</td>
                              <td className="text-right" style={{ color: "#722ed1", fontWeight: 600 }}>
                                {d.roi < 5 ? `${(d.roi * 12).toFixed(1)}% p.a.` : `${d.roi}% p.a.`}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </SectionCard>
                </div>
              </div>

              {/* ── USER GROWTH ── */}
              <SectionCard title="User Base">
                <div className="row text-center">
                  {[
                    { label: "Registered Users", value: fmt(users.total), color: "#1a237e" },
                    { label: "Lenders", value: fmt(users.lenders), color: "#1890ff" },
                    { label: "Borrowers", value: fmt(users.borrowers), color: "#722ed1" },
                    { label: "New (Last 30 Days)", value: fmt(users.newLast30Days), color: "#52c41a" },
                    { label: "New (Last 7 Days)", value: fmt(users.newLast7Days), color: "#fa8c16" },
                  ].map((u, i) => (
                    <div key={i} className="col-6 col-md mb-3 mb-md-0">
                      <div style={{ background: "#fafafa", borderRadius: 10, padding: "16px 8px" }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: u.color }}>{u.value}</div>
                        <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase", letterSpacing: 1 }}>{u.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <div className="text-right">
                <small className="text-muted">Data as of {new Date().toLocaleString("en-IN")} — uses paid_date from lenders_returns</small>
              </div>
            </>
          )}

        </div>
        <Footer />
      </div>
      <FloatingAssistant avatarSrc={logo} />
    </div>
  );
};

export default OxyloansAdminDashboard;
