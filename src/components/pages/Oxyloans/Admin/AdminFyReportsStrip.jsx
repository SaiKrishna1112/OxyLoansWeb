import React from "react";
import { money, number } from "./adminAIDashboardShared";

const MiniBox = ({ label, value, color, loading }) => (
  <div className="ai-fy-mini-box" style={{ "--box-color": color }}>
    <span className="ai-fy-mini-val">{loading ? "…" : value}</span>
    <span className="ai-fy-mini-lbl">{label}</span>
  </div>
);

const AdminFyReportsStrip = ({ platform, fy, loading, onOpenModule }) => {
  const kpis = platform?.kpis || {};
  const monthlyTrend = platform?.monthlyTrend || [];
  const topDeals = platform?.topDeals || [];
  const fyLeaderboard = platform?.fyLeaderboard || [];
  const latestMonth = monthlyTrend.length ? monthlyTrend[monthlyTrend.length - 1] : null;

  const fyLabel = fy ? `FY ${fy}–${String(fy + 1).slice(2)}` : "FY";

  const tiles = [
    {
      id: "financial-kpis",
      label: "Interest paid",
      value: money(kpis.fyInterestPaid),
      color: "#2563eb",
    },
    {
      id: "financial-kpis",
      label: "Principal returned",
      value: money(kpis.fyPrincipalReturned),
      color: "#059669",
    },
    {
      id: "financial-kpis",
      label: "Total deals",
      value: number(kpis.totalDeals),
      color: "#6366f1",
    },
    {
      id: "monthly-payout",
      label: "Latest month payout",
      value: latestMonth ? money(latestMonth.totalPaid) : "—",
      color: "#0891b2",
    },
    {
      id: "top-deals",
      label: "Top deal volume",
      value: topDeals[0] ? money(topDeals[0].volume) : "—",
      color: "#7c3aed",
    },
    {
      id: "fy-earners",
      label: "Top lender FY interest",
      value: fyLeaderboard[0] ? money(fyLeaderboard[0].fyInterestEarned) : "—",
      color: "#d97706",
    },
  ];

  return (
    <div className="ai-fy-reports-strip">
      <div className="ai-fy-reports-strip-head">
        <span className="ai-fy-reports-strip-title">
          <i className="fas fa-chart-pie me-2" />
          {fyLabel} snapshot
        </span>
        {loading && <span className="text-muted small">Updating…</span>}
      </div>
      <div className="ai-fy-mini-grid">
        {tiles.map((t, i) => (
          <button
            key={`${t.id}-${i}`}
            type="button"
            className="ai-fy-mini-box-btn"
            onClick={() => onOpenModule?.(t.id)}
            title={`Open ${t.label}`}
          >
            <MiniBox label={t.label} value={t.value} color={t.color} loading={loading} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminFyReportsStrip;
