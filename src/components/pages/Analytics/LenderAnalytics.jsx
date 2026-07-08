import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useNavigate } from "react-router-dom";
import Header from "../../Header/Header";
import Sidebar from "../../SideBar/SideBar";
import {
  getactivityApisData,
  getDashboardInterestEarnings,
  getDashboardPrincipalReturned,
  getDashboardInvestment,
} from "../../HttpRequest/afterlogin";

const fmt = (n) =>
  n == null ? "₹0" : "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const Card = ({ label, value, sub, color }) => (
  <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", flex: 1, minWidth: 160,
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)", borderLeft: `4px solid ${color}` }}>
    <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", margin: "6px 0 2px" }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "#94a3b8" }}>{sub}</div>}
  </div>
);

export default function LenderAnalytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [interestData, setInterestData] = useState([]);
  const [principalData, setPrincipalData] = useState([]);
  const [participationData, setParticipationData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [actRes, intRes, prinRes, partRes] = await Promise.allSettled([
          getactivityApisData(),
          getDashboardInterestEarnings(1, 50),
          getDashboardPrincipalReturned(1, 50),
          getDashboardInvestment(1, 30),
        ]);

        if (actRes.status === "fulfilled") setStats(actRes.value?.data);
        if (intRes.status === "fulfilled") {
          const rows = intRes.value?.data?.lenderInterestHistory || intRes.value?.data || [];
          setInterestData(Array.isArray(rows) ? rows : []);
        }
        if (prinRes.status === "fulfilled") {
          const rows = prinRes.value?.data?.principalReturnedHistory || prinRes.value?.data || [];
          setPrincipalData(Array.isArray(rows) ? rows : []);
        }
        if (partRes.status === "fulfilled") {
          const rows = partRes.value?.data?.lenderTotalPaticipationDealsInfo || partRes.value?.data || [];
          setParticipationData(Array.isArray(rows) ? rows : []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Group interest by month
  const monthlyInterest = (() => {
    const map = {};
    interestData.forEach((row) => {
      const d = row.returedDate || row.date || row.creditedDate;
      if (!d) return;
      const dt = new Date(d);
      if (isNaN(dt)) return;
      const key = dt.toLocaleString("default", { month: "short", year: "2-digit" });
      map[key] = (map[key] || 0) + (Number(row.amount) || 0);
    });
    const sorted = Object.entries(map).sort((a, b) => {
      const da = new Date("01 " + a[0]);
      const db = new Date("01 " + b[0]);
      return da - db;
    });
    return { labels: sorted.map((x) => x[0]), values: sorted.map((x) => x[1]) };
  })();

  // Group principal by month
  const monthlyPrincipal = (() => {
    const map = {};
    principalData.forEach((row) => {
      const d = row.returedDate || row.date;
      if (!d) return;
      const dt = new Date(d);
      if (isNaN(dt)) return;
      const key = dt.toLocaleString("default", { month: "short", year: "2-digit" });
      map[key] = (map[key] || 0) + (Number(row.amount) || 0);
    });
    const allKeys = new Set([...monthlyInterest.labels, ...Object.keys(map)]);
    const sorted = Array.from(allKeys).sort((a, b) => new Date("01 " + a) - new Date("01 " + b));
    return sorted.map((k) => map[k] || 0);
  })();

  const donutSeries = [
    stats?.numberOfActiveDealsCount || 0,
    stats?.numberOfClosedDealsCount || 0,
    stats?.numberOfDisbursedDealsCount || 0,
  ];

  const barChart = {
    series: [
      { name: "Interest Earned", data: monthlyInterest.values },
      { name: "Principal Returned", data: monthlyPrincipal },
    ],
    options: {
      chart: { type: "bar", height: 280, toolbar: { show: false }, fontFamily: "Inter, sans-serif" },
      plotOptions: { bar: { borderRadius: 4, columnWidth: "55%", groupPadding: 0.1 } },
      colors: ["#0ea5a1", "#6366f1"],
      dataLabels: { enabled: false },
      xaxis: { categories: monthlyInterest.labels, labels: { style: { fontSize: "11px" } } },
      yaxis: { labels: { formatter: (v) => "₹" + (v >= 100000 ? (v / 100000).toFixed(1) + "L" : v >= 1000 ? (v / 1000).toFixed(0) + "K" : v) } },
      grid: { borderColor: "#f1f5f9" },
      tooltip: { y: { formatter: (v) => fmt(v) } },
      legend: { position: "top", fontSize: "12px" },
    },
  };

  const donutChart = {
    series: donutSeries,
    options: {
      chart: { type: "donut", fontFamily: "Inter, sans-serif" },
      labels: ["Active", "Closed", "Disbursed"],
      colors: ["#0ea5a1", "#6366f1", "#f59e0b"],
      plotOptions: { pie: { donut: { size: "65%", labels: { show: true, total: { show: true, label: "Total", color: "#64748b", fontSize: "13px" } } } } },
      dataLabels: { enabled: true, style: { fontSize: "12px" } },
      legend: { position: "bottom", fontSize: "12px" },
      tooltip: { y: { formatter: (v) => v + " deals" } },
    },
  };

  const totalInterest = interestData.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const totalPrincipal = principalData.reduce((s, r) => s + (Number(r.amount) || 0), 0);

  // Cumulative earnings over time (sorted by date)
  const cumulativeChart = (() => {
    const entries = interestData
      .map(r => ({ d: new Date(r.returedDate || r.date || r.creditedDate || 0), v: Number(r.amount) || 0 }))
      .filter(e => !isNaN(e.d))
      .sort((a, b) => a.d - b.d);
    let running = 0;
    const labels = [];
    const values = [];
    entries.forEach(e => {
      running += e.v;
      labels.push(e.d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }));
      values.push(running);
    });
    return { labels, values };
  })();

  const cumulativeSeries = [{ name: "Cumulative Earnings", data: cumulativeChart.values }];
  const cumulativeOptions = {
    chart: { type: "area", height: 200, toolbar: { show: false }, fontFamily: "Inter, sans-serif", sparkline: { enabled: false } },
    stroke: { curve: "smooth", width: 2 },
    colors: ["#f59e0b"],
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05 } },
    dataLabels: { enabled: false },
    xaxis: { categories: cumulativeChart.labels, labels: { show: cumulativeChart.labels.length <= 10, style: { fontSize: "10px" }, rotate: -30 } },
    yaxis: { labels: { formatter: v => "₹" + (v >= 100000 ? (v / 100000).toFixed(1) + "L" : v >= 1000 ? (v / 1000).toFixed(0) + "K" : v) } },
    grid: { borderColor: "#f1f5f9" },
    tooltip: { y: { formatter: v => fmt(v) } },
  };

  const totalInvested = participationData.reduce((s, r) => s + (Number(r.participatedAmount) || 0), 0);
  const roi = totalInvested > 0 ? ((totalInterest / totalInvested) * 100).toFixed(1) : null;

  if (loading) return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header />
        <div style={{ paddingTop: 100, textAlign: "center", color: "#64748b" }}>Loading analytics…</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", fontFamily: "Inter, system-ui, sans-serif" }}>
      <Sidebar />
      <div style={{ flex: 1, background: "#f8fafc", minHeight: "100vh" }}>
        <Header />
        <div style={{ padding: "90px 24px 32px" }}>

          {/* Page Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Lender Analytics</h2>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>Your investment performance at a glance</p>
            </div>
            <button onClick={() => navigate("/dashboard")}
              style={{ padding: "8px 18px", borderRadius: 8, background: "#0ea5a1", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              ← Dashboard
            </button>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
            <Card label="Active Deals" value={stats?.numberOfActiveDealsCount ?? "—"} sub={`Amount: ${fmt(stats?.activeDealsAmount)}`} color="#0ea5a1" />
            <Card label="Closed Deals" value={stats?.numberOfClosedDealsCount ?? "—"} sub={`Amount: ${fmt(stats?.closedDealsAmount)}`} color="#6366f1" />
            <Card label="Total Interest Earned" value={fmt(totalInterest)} sub="All time" color="#f59e0b" />
            <Card label="Principal Returned" value={fmt(totalPrincipal)} sub="All time" color="#10b981" />
            {roi !== null && (
              <Card label="Overall ROI" value={`${roi}%`} sub="Interest / Invested" color="#ef4444" />
            )}
          </div>

          {/* Cumulative earnings chart */}
          {cumulativeChart.values.length > 1 && (
            <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", marginBottom: 4 }}>Cumulative Interest Earned</div>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>Total growth of your interest income over time</div>
              <ReactApexChart options={cumulativeOptions} series={cumulativeSeries} type="area" height={200} />
            </div>
          )}

          {/* Charts Row */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 24 }}>

            <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", marginBottom: 16 }}>Monthly Interest & Principal</div>
              {monthlyInterest.labels.length > 0
                ? <ReactApexChart options={barChart.options} series={barChart.series} type="bar" height={260} />
                : <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 13 }}>No earnings data available yet</div>
              }
            </div>

            <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", marginBottom: 16 }}>Deal Breakdown</div>
              {donutSeries.some(v => v > 0)
                ? <ReactApexChart options={donutChart.options} series={donutChart.series} type="donut" height={260} />
                : <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 13 }}>No deals found</div>
              }
            </div>

          </div>

          {/* Participated Deals Table */}
          {participationData.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", marginBottom: 16 }}>Participated Deals</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Deal Name", "Participated (₹)", "Rate of Interest", "Status", "Closed Date"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: 12, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {participationData.slice(0, 10).map((row, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 500, color: "#0f172a" }}>{row.dealName || "—"}</td>
                        <td style={{ padding: "10px 14px", color: "#0ea5a1", fontWeight: 600 }}>{fmt(row.participatedAmount)}</td>
                        <td style={{ padding: "10px 14px" }}>{row.rateofinterest ? `${row.rateofinterest}%` : "—"}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{ padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600,
                            background: row.pricipaleReturnedStatus === "YES" ? "#dcfce7" : "#fef3c7",
                            color: row.pricipaleReturnedStatus === "YES" ? "#16a34a" : "#d97706" }}>
                            {row.pricipaleReturnedStatus === "YES" ? "Closed" : "Active"}
                          </span>
                        </td>
                        <td style={{ padding: "10px 14px", color: "#64748b" }}>{row.dealClosedDate || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
