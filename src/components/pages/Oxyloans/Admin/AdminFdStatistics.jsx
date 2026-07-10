import React from "react";
import { money, number, HBarChart } from "./adminAIDashboardShared";
import { normalizeFdStatistics, ADMIN_METRIC_HELP } from "./adminBusinessMetrics";

const FdRow = ({ label, count, amount, tone, loading }) => (
  <div className={`ai-fd-row ai-fd-row--${tone}`}>
    <div className="ai-fd-row-label">{label}</div>
    <div className="ai-fd-row-count">{loading ? "…" : number(count)}</div>
    <div className="ai-fd-row-amount">{loading ? "…" : money(amount)}</div>
  </div>
);

/**
 * Official FD statistics — LoanServiceImpl.fdStatistics
 * borrower_payments where fd_created IS NOT NULL, split by fd_status.
 */
const AdminFdStatistics = ({ summary, fdStatistics: fdProp, loading, compact = false, error }) => {
  const fd = fdProp || summary?.fdStatistics || normalizeFdStatistics(summary);
  const apiError = error || summary?.fdStatisticsError;
  const fromApi = summary?.fdStatisticsSource === "fd-statistics-api" || Boolean(fd?.hasData);

  if (!fd && !loading && !apiError) {
    return (
      <p className="ai-board-empty ai-fd-empty">
        FD statistics not loaded — ensure backend is running and <code>POST /v1/user/fd-statistics</code> returns data.
      </p>
    );
  }

  if (apiError && !fd?.hasData) {
    return (
      <p className="ai-board-empty ai-fd-empty ai-fd-empty--error">
        FD statistics unavailable: {apiError}
      </p>
    );
  }

  const bankItems = [
    { label: "HDFC", value: fd?.amountReceivedToHdfc, color: "#004c8f" },
    { label: "ICICI", value: fd?.amountReceivedToIcici, color: "#f58220" },
  ].filter((i) => Number(i.value) > 0);

  const statusItems = [
    { label: "Active FD", value: fd?.noOfActiveFdsAmount, color: "#10b981" },
    { label: "Closed FD", value: fd?.closedFdAmount, color: "#64748b" },
  ].filter((i) => Number(i.value) > 0);

  if (compact) {
    return (
      <div className="ai-fd-statistics ai-fd-statistics--compact">
        <div className="ai-fd-compact-grid">
          <span><strong>{loading ? "…" : number(fd?.noOfFdsDone)}</strong> FDs</span>
          <span><strong>{loading ? "…" : money(fd?.valueOfFd)}</strong> total</span>
          <span className="text-success"><strong>{loading ? "…" : number(fd?.noOfActiveFds)}</strong> active</span>
          <span className="text-muted"><strong>{loading ? "…" : number(fd?.noOfClosedFds)}</strong> closed</span>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-fd-statistics">
      <div className="ai-fd-hero">
        <div className="ai-fd-hero-main">
          <span className="ai-fd-hero-val">{loading ? "…" : money(fd?.valueOfFd)}</span>
          <span className="ai-fd-hero-lbl" title={ADMIN_METRIC_HELP.fdAmount}>
            Total FD collateral ({loading ? "…" : number(fd?.noOfFdsDone)} loans with FD)
          </span>
        </div>
        <div className="ai-fd-hero-chips">
          <span className="ai-chip ai-chip--ok" title="fd_status ≠ CLOSED">
            {loading ? "…" : number(fd?.noOfActiveFds)} running · {loading ? "…" : money(fd?.noOfActiveFdsAmount)}
          </span>
          <span className="ai-chip ai-chip--muted" title="fd_status = CLOSED">
            {loading ? "…" : number(fd?.noOfClosedFds)} closed · {loading ? "…" : money(fd?.closedFdAmount)}
          </span>
          {(fd?.totalFdClosedInterest > 0 || loading) && (
            <span className="ai-chip ai-chip--info">
              Closed interest {loading ? "…" : money(fd?.totalFdClosedInterest)}
            </span>
          )}
        </div>
        {fromApi && (
          <p className="ai-fd-source text-muted small mb-0">
            <i className="fas fa-check-circle text-success me-1" />
            Live from <code>fdStatistics</code> — same method as admin FD report
          </p>
        )}
      </div>

      <div className="ai-fd-body">
        <div className="ai-fd-table-block">
          <p className="ai-board-chart-title">FD breakdown by status</p>
          <div className="ai-fd-table">
            <div className="ai-fd-table-head">
              <span>Status</span>
              <span>Count</span>
              <span>FD amount</span>
            </div>
            <FdRow label="Active (running)" count={fd?.noOfActiveFds} amount={fd?.noOfActiveFdsAmount} tone="active" loading={loading} />
            <FdRow label="Closed" count={fd?.noOfClosedFds} amount={fd?.closedFdAmount} tone="closed" loading={loading} />
            <FdRow label="All FDs" count={fd?.noOfFdsDone} amount={fd?.valueOfFd} tone="total" loading={loading} />
          </div>
          {fd?.activePct > 0 && (
            <p className="ai-fd-pct text-muted small mt-2 mb-0">
              {fd.activePct}% of FD value is still active (running loans)
            </p>
          )}
        </div>

        <div className="ai-fd-side">
          {statusItems.length > 0 && (
            <div className="ai-fd-chart-box">
              <p className="ai-board-chart-title">Active vs closed amount</p>
              <HBarChart items={statusItems} />
            </div>
          )}
          <div className="ai-fd-chart-box">
            <p className="ai-board-chart-title" title={ADMIN_METRIC_HELP.fdStatistics}>
              Borrower repayments received (approved uploads)
            </p>
            {bankItems.length > 0 ? (
              <>
                <HBarChart items={bankItems} />
                <p className="ai-fd-bank-total small mb-0">
                  Total received: <strong>{loading ? "…" : money(fd?.totalBankReceived)}</strong>
                </p>
              </>
            ) : (
              <p className="text-muted small mb-0">No approved HDFC/ICICI repayment uploads yet</p>
            )}
          </div>
          <div className="ai-fd-interest-box">
            <span className="ai-fd-interest-val">{loading ? "…" : money(fd?.totalFdClosedInterest)}</span>
            <span className="ai-fd-interest-lbl">Interest earned on closed FDs</span>
            <span className="ai-fd-interest-sub text-muted">interest_earned_on_fd where fd_status = CLOSED</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFdStatistics;
