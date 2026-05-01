import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useNavigate } from "react-router-dom";
import Header from "../../Header/Header";
import Sidebar from "../../SideBar/SideBar";
import {
  getBorrowerApplication,
  getBorrowerEmiSchedule,
  getMyMarketplaceLoans,
} from "../../HttpRequest/afterlogin";

const fmt = (n) =>
  n == null ? "₹0" : "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const STATUS_COLOR = {
  PENDING:  { bg: "#fef3c7", text: "#d97706" },
  APPROVED: { bg: "#dbeafe", text: "#2563eb" },
  ACTIVE:   { bg: "#dcfce7", text: "#16a34a" },
  CLOSED:   { bg: "#f1f5f9", text: "#475569" },
  REJECTED: { bg: "#fee2e2", text: "#dc2626" },
  WITHDRAWN:{ bg: "#f1f5f9", text: "#94a3b8" },
};

const Badge = ({ status }) => {
  const c = STATUS_COLOR[status?.toUpperCase()] || STATUS_COLOR.PENDING;
  return (
    <span style={{ padding: "2px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, background: c.bg, color: c.text }}>
      {status || "—"}
    </span>
  );
};

const Card = ({ label, value, sub, color }) => (
  <div style={{ background: "#fff", borderRadius: 12, padding: "20px 24px", flex: 1, minWidth: 160,
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)", borderLeft: `4px solid ${color}` }}>
    <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", margin: "6px 0 2px" }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "#94a3b8" }}>{sub}</div>}
  </div>
);

export default function BorrowerAnalytics() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [emis, setEmis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [loanRes, emiRes, mktRes] = await Promise.allSettled([
          getBorrowerApplication(1, 50),
          getBorrowerEmiSchedule(),
          getMyMarketplaceLoans(),
        ]);

        if (loanRes.status === "fulfilled") {
          const d = loanRes.value?.data?.content || loanRes.value?.data?.data || loanRes.value?.data || [];
          setLoans(Array.isArray(d) ? d : []);
        }
        // Also try marketplace loans
        if (mktRes.status === "fulfilled" && loans.length === 0) {
          const d = mktRes.value?.data || [];
          if (Array.isArray(d) && d.length > 0) setLoans(d);
        }
        if (emiRes.status === "fulfilled") {
          const d = emiRes.value?.data?.emiSchedule || emiRes.value?.data || [];
          setEmis(Array.isArray(d) ? d : []);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Status breakdown for donut
  const statusCounts = loans.reduce((acc, loan) => {
    const s = (loan.status || loan.loanStatus || "PENDING").toUpperCase();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const donutLabels = Object.keys(statusCounts);
  const donutSeries = Object.values(statusCounts);
  const donutColors = donutLabels.map(s => STATUS_COLOR[s]?.text || "#94a3b8");

  // EMI timeline (next 6 months)
  const emiByMonth = (() => {
    const map = {};
    emis.forEach(e => {
      const d = e.dueDate || e.emiDate || e.date;
      if (!d) return;
      const dt = new Date(d);
      if (isNaN(dt) || dt < new Date()) return;
      const key = dt.toLocaleString("default", { month: "short", year: "2-digit" });
      map[key] = (map[key] || 0) + (Number(e.emiAmount || e.amount) || 0);
    });
    const sorted = Object.entries(map)
      .sort((a, b) => new Date("01 " + a[0]) - new Date("01 " + b[0]))
      .slice(0, 6);
    return { labels: sorted.map(x => x[0]), values: sorted.map(x => x[1]) };
  })();

  const emiChart = {
    series: [{ name: "EMI Due", data: emiByMonth.values }],
    options: {
      chart: { type: "area", height: 220, toolbar: { show: false }, fontFamily: "Inter, sans-serif" },
      stroke: { curve: "smooth", width: 2 },
      colors: ["#6366f1"],
      fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } },
      dataLabels: { enabled: false },
      xaxis: { categories: emiByMonth.labels, labels: { style: { fontSize: "11px" } } },
      yaxis: { labels: { formatter: v => "₹" + (v >= 1000 ? (v / 1000).toFixed(0) + "K" : v) } },
      grid: { borderColor: "#f1f5f9" },
      tooltip: { y: { formatter: v => fmt(v) } },
    },
  };

  const donutChart = {
    series: donutSeries,
    options: {
      chart: { type: "donut", fontFamily: "Inter, sans-serif" },
      labels: donutLabels,
      colors: donutColors,
      plotOptions: { pie: { donut: { size: "65%", labels: { show: true, total: { show: true, label: "Loans", color: "#64748b", fontSize: "13px" } } } } },
      dataLabels: { enabled: true, style: { fontSize: "12px" } },
      legend: { position: "bottom", fontSize: "12px" },
      tooltip: { y: { formatter: v => v + " loan(s)" } },
    },
  };

  const totalBorrowed = loans.reduce((s, l) => s + (Number(l.loanRequestAmount || l.amount || 0)), 0);
  const activeLoans = loans.filter(l => ["ACTIVE", "APPROVED", "DISBURSED"].includes((l.status || l.loanStatus || "").toUpperCase())).length;
  const totalEmiDue = emis.reduce((s, e) => s + (Number(e.emiAmount || e.amount) || 0), 0);

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
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>Borrower Analytics</h2>
              <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>Your loan portfolio at a glance</p>
            </div>
            <button onClick={() => navigate("/borrowerDashboard")}
              style={{ padding: "8px 18px", borderRadius: 8, background: "#6366f1", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              ← Dashboard
            </button>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
            <Card label="Total Loan Applications" value={loans.length} sub="All time" color="#6366f1" />
            <Card label="Active / Approved Loans" value={activeLoans} sub="Currently running" color="#0ea5a1" />
            <Card label="Total Amount Applied" value={fmt(totalBorrowed)} sub="Across all loans" color="#f59e0b" />
            <Card label="Total EMI Due" value={fmt(totalEmiDue)} sub="Upcoming payments" color="#ef4444" />
          </div>

          {/* Charts Row */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 24 }}>

            <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", marginBottom: 16 }}>Upcoming EMI Schedule</div>
              {emiByMonth.labels.length > 0
                ? <ReactApexChart options={emiChart.options} series={emiChart.series} type="area" height={220} />
                : <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 13 }}>No EMI data available</div>
              }
            </div>

            <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", marginBottom: 16 }}>Loan Status Breakdown</div>
              {donutSeries.length > 0 && donutSeries.some(v => v > 0)
                ? <ReactApexChart options={donutChart.options} series={donutChart.series} type="donut" height={220} />
                : <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 13 }}>No loan data found</div>
              }
            </div>

          </div>

          {/* Loan Applications Table */}
          {loans.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a", marginBottom: 16 }}>Loan Applications</div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      {["Loan ID", "Amount", "Purpose", "Duration", "Status", "Created"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: 12, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loans.slice(0, 15).map((loan, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 500, color: "#6366f1" }}>
                          {loan.loanRequestId || loan.id || `#${i + 1}`}
                        </td>
                        <td style={{ padding: "10px 14px", fontWeight: 600, color: "#0f172a" }}>
                          {fmt(loan.loanRequestAmount || loan.amount)}
                        </td>
                        <td style={{ padding: "10px 14px", color: "#475569" }}>{loan.loanPurpose || loan.purpose || "—"}</td>
                        <td style={{ padding: "10px 14px", color: "#64748b" }}>
                          {loan.loanDuration ? `${loan.loanDuration} mo` : "—"}
                        </td>
                        <td style={{ padding: "10px 14px" }}>
                          <Badge status={loan.status || loan.loanStatus} />
                        </td>
                        <td style={{ padding: "10px 14px", color: "#94a3b8" }}>
                          {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString("en-IN") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {loans.length === 0 && !loading && (
            <div style={{ background: "#fff", borderRadius: 12, padding: 48, textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 8 }}>No loan applications yet</div>
              <div style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Post your first loan request to see analytics here</div>
              <button onClick={() => navigate("/newLoanRequest")}
                style={{ padding: "10px 24px", borderRadius: 8, background: "#6366f1", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                Post Loan Request
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
