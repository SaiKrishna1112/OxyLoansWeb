import React, { useMemo, useState } from "react";
import { money, number, DataTable } from "./adminAIDashboardShared";
import { buildBorrowerLifecycleSnapshot } from "./adminBusinessMetrics";

const stageBadge = (label) => {
  const map = {
    Overdue: "ai-stage ai-stage--danger",
    Running: "ai-stage ai-stage--success",
    "FD dated": "ai-stage ai-stage--success",
    "Bank saved": "ai-stage ai-stage--info",
    Closed: "ai-stage ai-stage--muted",
  };
  return <span className={map[label] || "ai-stage"}>{label || "—"}</span>;
};

const daysLabel = (days) => {
  if (days == null) return "—";
  if (days < 0) return `${Math.abs(days)}d`;
  return `${days}d`;
};

const isRunningRow = (r) =>
  r.lifecycleLabel === "Running" || r.lifecycleLabel === "FD dated" || r.lifecycleLabel === "Bank saved";

const StatPill = ({ label, count, fd, fee, roi }) => (
  <div className="ai-borrower-stat-pill">
    <span className="ai-borrower-stat-pill-title">{label}</span>
    <span className="ai-borrower-stat-pill-row">
      <span>{number(count)} loans</span>
      <span>FD {money(fd)}</span>
      <span>Fee {money(fee)}</span>
      {roi != null && roi > 0 && <span>ROI {roi}%</span>}
    </span>
  </div>
);

/** Borrower loans from borrower_payments: fd_amount, borrower_fee, roi, amount (disbursed) */
const AdminBorrowerOverview = ({ summary, loading, compact = false }) => {
  const [filter, setFilter] = useState("ALL");
  const rows = summary?.recentAccounts || [];

  const filtered = useMemo(() => {
    if (filter === "ALL") return rows;
    if (filter === "RUNNING") return rows.filter(isRunningRow);
    if (filter === "OVERDUE") return rows.filter((r) => r.lifecycleLabel === "Overdue");
    if (filter === "CLOSED") return rows.filter((r) => r.lifecycleLabel === "Closed");
    return rows;
  }, [rows, filter]);

  const runningInTable = useMemo(() => rows.filter(isRunningRow).length, [rows]);
  const closedInTable = useMemo(() => rows.filter((r) => r.lifecycleLabel === "Closed").length, [rows]);

  if (loading && !summary?.recentAccounts && !summary?.fdStatistics?.hasData) {
    return <p className="ai-board-empty">Loading…</p>;
  }

  const hasFdOfficial = summary?.fdStatistics?.hasData || summary?.fdStatisticsSource === "fd-statistics-api";
  const hasBorrowerData =
    rows.length > 0 || summary.totalFdAmount || summary.totalBorrowerFees || hasFdOfficial;

  if (!summary || !hasBorrowerData) {
    return (
      <p className="ai-board-empty">
        {summary?.error
          ? `Borrower data unavailable: ${summary.error}`
          : summary?.fallbackNote || "No borrower data loaded — log in as admin and refresh."}
      </p>
    );
  }

  const avgRoi = summary.avgBorrowerRoi > 0 ? summary.avgBorrowerRoi : null;
  const life = buildBorrowerLifecycleSnapshot(summary);
  const runningCount = life.runningCount ?? summary.runningFdCount ?? runningInTable;
  const closedCount = life.closedCount ?? summary.closedBorrowerAccounts ?? closedInTable;

  const filters = [
    { id: "ALL", label: "All", count: rows.length },
    { id: "RUNNING", label: "Running", count: runningCount },
    { id: "OVERDUE", label: "Overdue", count: summary.negativeFdCount },
    { id: "CLOSED", label: "Closed", count: closedCount },
  ];

  const columns = compact
    ? [
        ["borrowerName", "Borrower"],
        ["borrowerRef", "ID"],
        ["fdAmount", "FD amt", money],
        ["borrowerFee", "Fee", money],
        ["borrowerRoi", "ROI", (v) => (v ? `${v}%` : "—")],
        ["fdAmountFromSystem", "Disbursed", money],
        ["lifecycleLabel", "Status", (v) => stageBadge(v)],
      ]
    : [
        ["borrowerName", "Borrower"],
        ["borrowerRef", "ID"],
        ["dealName", "Deal", (v) => (v ? String(v).slice(0, 22) : "—")],
        ["fdAmount", "FD amount", money],
        ["borrowerFee", "Borrower fee", (v, row) => (
          <span>
            {money(v)}
            {row.feePendingReview && <span className="ai-chip ai-chip--warn ms-1">Review</span>}
          </span>
        )],
        ["borrowerRoi", "Borrower ROI", (v) => (v ? `${v}%` : "—")],
        ["fdAmountFromSystem", "Disbursed", money],
        ["interestEarnedOnFd", "FD interest", money],
        ["daysToValidity", "Days left", (v) => daysLabel(v)],
        ["repaymentRemaining", "Repay due", money],
        ["lifecycleLabel", "Status", (v) => stageBadge(v)],
        ["bankName", "Bank", (v) => (v ? String(v).slice(0, 14) : "—")],
      ];

  return (
    <div className="ai-borrower-table-wrap">
      {hasFdOfficial && (
        <p className="ai-borrower-fd-note text-muted small">
          FD totals above from <code>fdStatistics</code>. Table below shows recent loan rows (fees, disbursed, status).
        </p>
      )}
      <div className="ai-borrower-stats-row">
        <StatPill
          label="Running"
          count={runningCount}
          fd={life.runningFdAmount}
          fee={life.runningBorrowerFees}
        />
        <StatPill
          label="Closed"
          count={closedCount}
          fd={life.closedFdAmount}
          fee={life.closedBorrowerFees}
        />
        <div className="ai-borrower-stat-pill ai-borrower-stat-pill--total">
          <span className="ai-borrower-stat-pill-title">Platform totals</span>
          <span className="ai-borrower-stat-pill-row">
            <span>FD {money(life.totalFdAmount)}</span>
            <span>Fee {money(life.totalBorrowerFees)}</span>
            <span>Disbursed {money(life.disbursed)}</span>
            {life.fdInterestEarned > 0 && <span>FD int. {money(life.fdInterestEarned)}</span>}
            {avgRoi != null && <span>Avg ROI {avgRoi}%</span>}
          </span>
        </div>
      </div>
      {rows.length > 0 ? (
        <>
      <div className="ai-borrower-filters">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`ai-borrower-filter ${filter === f.id ? "ai-borrower-filter--active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            <span className="ai-borrower-filter-count">{f.count ?? 0}</span>
          </button>
        ))}
      </div>
      <DataTable rows={filtered} initialLimit={compact ? 12 : 20} columns={columns} emptyText="No rows" />
        </>
      ) : (
        <p className="ai-board-empty ai-borrower-no-rows">Loan-level rows not loaded — FD totals above are from official API.</p>
      )}
    </div>
  );
};

export default AdminBorrowerOverview;
