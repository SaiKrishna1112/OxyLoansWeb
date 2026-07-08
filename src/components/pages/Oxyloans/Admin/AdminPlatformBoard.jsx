import React from "react";
import { money, number, HBarChart } from "./adminAIDashboardShared";
import {
  mergeFeeSummary,
  buildBorrowerLifecycleSnapshot,
  buildPlatformPlSnapshot,
  buildWalletFlowSnapshot,
  ADMIN_METRIC_HELP,
} from "./adminBusinessMetrics";

const Metric = ({ label, value, loading, accent }) => (
  <div className={`ai-metric ai-metric--${accent}`}>
    <span className="ai-metric-val">{loading ? "…" : value}</span>
    <span className="ai-metric-lbl">{label}</span>
  </div>
);

const RoiPill = ({ label, value, tone }) => (
  <span className={`ai-roi-pill ai-roi-pill--${tone}`}>
    {label} {value != null ? `${value}%` : "—"}
  </span>
);

const DealStage = ({ count, label, tone, loading }) => (
  <div className={`ai-deal-stage ai-deal-stage--${tone}`}>
    <span className="ai-deal-stage-val">{loading ? "…" : number(count)}</span>
    <span className="ai-deal-stage-lbl">{label}</span>
  </div>
);

/** Four-pillar admin board: Participation · Deals · Borrowers · Fees */
const AdminPlatformBoard = ({ previewCtx, loading, onOpenModule, compact = false }) => {
  const kpis = previewCtx?.platform?.kpis || {};
  const overview = previewCtx?.overview || {};
  const deals = previewCtx?.dealsSummary || {};
  const borrower = previewCtx?.borrowerSummary || {};
  const recon = previewCtx?.reconciliation || {};
  const fees = mergeFeeSummary(previewCtx?.feeSummary, borrower, kpis);
  const walletFlow = buildWalletFlowSnapshot(previewCtx?.walletSummary, kpis);
  const borrowerLife = buildBorrowerLifecycleSnapshot(borrower);
  const pl = buildPlatformPlSnapshot(previewCtx);

  const participation = fees.activeParticipationAmount || kpis.totalInvested || overview.totalInvestment;
  const spread =
    fees.avgSpreadPercent ??
    (fees.avgBorrowerRoi != null && fees.avgLenderRoi != null
      ? Math.round((fees.avgBorrowerRoi - fees.avgLenderRoi) * 100) / 100
      : null);

  const fdSplitItems = [
    { label: "Running FD", value: borrowerLife.runningFdAmount, color: "#10b981" },
    { label: "Closed FD", value: borrowerLife.closedFdAmount, color: "#64748b" },
  ].filter((i) => Number(i.value) > 0);

  const feeSplitItems = [
    { label: "Running fees", value: borrowerLife.runningBorrowerFees, color: "#3b82f6" },
    { label: "Closed fees", value: borrowerLife.closedBorrowerFees, color: "#94a3b8" },
  ].filter((i) => Number(i.value) > 0);

  const payoutItems = [
    { label: "Borrower fees", value: fees.borrowerFeesCollected, color: "#3b82f6" },
    { label: "Lender interest", value: fees.lenderInterestPaid, color: "#10b981" },
    { label: "Principal returned", value: fees.lenderPrincipalReturned, color: "#8b5cf6" },
  ].filter((i) => Number(i.value) > 0);

  const plItems = [
    { label: "Borrower fees (in)", value: pl.borrowerFees, color: "#2563eb" },
    { label: "Est. spread profit", value: pl.estSpreadProfitFromDeals, color: "#059669" },
    { label: "Interest to lenders (out)", value: pl.interestPaidToLenders, color: "#f97316" },
  ].filter((i) => Number(i.value) > 0);

  const mixItems = [
    { label: "Monthly", value: overview.totalMonthlyParticipations, color: "#6366f1" },
    { label: "Quarterly", value: overview.totalQuarterlyParticipations, color: "#14b8a6" },
    { label: "Half-year", value: overview.totalHalfYearlyParticipations, color: "#f59e0b" },
    { label: "Yearly", value: overview.totalYearlyParticipations, color: "#a855f7" },
  ].filter((i) => Number(i.value) > 0);

  return (
    <div className={`ai-platform-board ${compact ? "ai-platform-board--compact" : ""}`}>
      {!compact && (
        <>
          <div className="ai-hero-metrics">
            <Metric label="Total participation" value={money(participation)} loading={loading} accent="indigo" />
            <Metric label="Escrow balance" value={money(walletFlow.currentBalance)} loading={loading} accent="amber" />
            <Metric label="Active deal value" value={money(walletFlow.activeInDeals || kpis.activeDealsAmount)} loading={loading} accent="cyan" />
            <Metric label="Borrower fees" value={money(fees.borrowerFeesCollected)} loading={loading} accent="blue" />
            <Metric label="FD collateral" value={money(borrowerLife.totalFdAmount)} loading={loading} accent="cyan" />
          </div>
        </>
      )}

      {compact && (
        <header className="ai-board-section-head ai-board-section-head--row">
          <i className="fas fa-th-large" />
          <span>Operational breakdown</span>
        </header>
      )}

      <div className="ai-board-grid">
        {/* Participation */}
        <section className="ai-board-section ai-board-section--participation">
          <header className="ai-board-section-head">
            <i className="fas fa-users" />
            <span>Lender participation</span>
            {onOpenModule && (
              <button type="button" className="ai-board-link" onClick={() => onOpenModule("participation-insights")}>
                Details
              </button>
            )}
          </header>
          <div className="ai-board-metrics">
            <Metric label="Active lenders" value={number(overview.activeLenderCount)} loading={loading} accent="soft" />
            <Metric label="Wallet idle" value={money(walletFlow.currentBalance)} loading={loading} accent="soft" />
            <Metric label="Loaded (all-time)" value={money(walletFlow.totalLoaded)} loading={loading} accent="soft" />
            <Metric label="In deals now" value={money(walletFlow.activeInDeals)} loading={loading} accent="soft" />
          </div>
          {mixItems.length > 0 && !compact && (
            <div className="ai-board-chart">
              <HBarChart items={mixItems} />
            </div>
          )}
        </section>

        {/* Deals */}
        <section className="ai-board-section ai-board-section--deals">
          <header className="ai-board-section-head">
            <i className="fas fa-briefcase" />
            <span>Deal portfolio</span>
            {onOpenModule && (
              <button type="button" className="ai-board-link" onClick={() => onOpenModule("deals-directory")}>
                Directory
              </button>
            )}
          </header>
          <div className="ai-deal-stages">
            <DealStage
              count={deals.openForParticipationCount ?? deals.runningCount}
              label="Open"
              tone="open"
              loading={loading}
            />
            <DealStage count={deals.activeLoanCount} label="Active" tone="active" loading={loading} />
            <DealStage count={deals.borrowerClosedCount} label="Closed" tone="closed" loading={loading} />
          </div>
          <div className="ai-board-roi-row">
            <RoiPill label="Lender" value={fees.avgLenderRoi} tone="lender" />
            <RoiPill label="Borrower" value={fees.avgBorrowerRoi ?? borrower.avgBorrowerRoi} tone="borrower" />
            <RoiPill label="Spread" value={spread} tone="spread" />
          </div>
          <div className="ai-board-metrics ai-board-metrics--inline">
            <Metric label="Live amount" value={money(kpis.activeDealsAmount)} loading={loading} accent="soft" />
          </div>
        </section>

        {/* Borrowers & FD — official fdStatistics API */}
        <section className="ai-board-section ai-board-section--borrowers">
          <header className="ai-board-section-head">
            <i className="fas fa-piggy-bank" />
            <span>Borrower collateral</span>
            {borrower.fdStatisticsSource === "fd-statistics-api" && (
              <span className="ai-board-api-badge">Live</span>
            )}
            {onOpenModule && (
              <button type="button" className="ai-board-link" onClick={() => onOpenModule("borrower-accounts")}>
                All accounts
              </button>
            )}
          </header>
          <div className="ai-board-metrics">
            <Metric label="Active FDs" value={number(borrowerLife.runningCount)} loading={loading} accent="soft" />
            <Metric label="Closed FDs" value={number(borrowerLife.closedCount)} loading={loading} accent="soft" />
            <Metric label="Running amount" value={money(borrowerLife.runningFdAmount)} loading={loading} accent="soft" />
            <Metric label="Total collateral" value={money(borrowerLife.totalFdAmount)} loading={loading} accent="soft" />
          </div>
          <div className="ai-borrower-chips">
            <span className="ai-chip ai-chip--ok">{number(borrowerLife.runningCount)} active</span>
            <span className="ai-chip ai-chip--warn">{number(borrowerLife.overdueCount)} overdue</span>
            {(borrower.pendingFeeReviewCount ?? 0) > 0 && (
              <span className="ai-chip ai-chip--warn">{number(borrower.pendingFeeReviewCount)} fee review</span>
            )}
          </div>
          {!compact && fdSplitItems.length > 0 && (
            <div className="ai-board-chart">
              <p className="ai-board-chart-title" title={ADMIN_METRIC_HELP.fdStatistics}>
                FD amount by status (fdStatistics)
              </p>
              <HBarChart items={fdSplitItems} />
            </div>
          )}
          {!compact && (
            <>
          <header className="ai-board-section-subhead">
            <span>Borrower fees</span>
          </header>
          <div className="ai-board-metrics ai-board-metrics--inline">
            <Metric label="Running fee" value={money(borrowerLife.runningBorrowerFees)} loading={loading} accent="soft" />
            <Metric label="Closed fee" value={money(borrowerLife.closedBorrowerFees)} loading={loading} accent="soft" />
            <Metric label="Total fee" value={money(borrowerLife.totalBorrowerFees)} loading={loading} accent="soft" />
          </div>
          {feeSplitItems.length > 0 && (
            <div className="ai-board-chart ai-board-chart--split">
              <p className="ai-board-chart-title" title={ADMIN_METRIC_HELP.borrowerFee}>
                Fees by status
              </p>
              <HBarChart items={feeSplitItems} />
            </div>
          )}
            </>
          )}
        </section>

        {/* Fees & payouts */}
        <section className="ai-board-section ai-board-section--fees">
          <header className="ai-board-section-head">
            <i className="fas fa-chart-pie" />
            <span>Revenue &amp; payouts</span>
            {onOpenModule && (
              <button type="button" className="ai-board-link" onClick={() => onOpenModule("fees-revenue")}>
                Report
              </button>
            )}
          </header>
          <div className="ai-board-metrics">
            <Metric label="Borrower fees" value={money(fees.borrowerFeesCollected)} loading={loading} accent="soft" />
            <Metric label="Interest paid" value={money(fees.lenderInterestPaid)} loading={loading} accent="soft" />
            <Metric label="CMS pending" value={money(recon.totalPending ?? 0)} loading={loading} accent="soft" />
          </div>
          {plItems.length > 0 && !compact && (
            <div className="ai-board-chart">
              <p className="ai-board-chart-title" title={ADMIN_METRIC_HELP.estProfit}>
                Platform revenue vs payouts
              </p>
              <HBarChart items={plItems} />
              <p className="ai-pl-net-line">
                Platform profit = fees + spread: <strong>{loading ? "…" : money(pl.totalEstPlatformProfit)}</strong>
                <span className="text-muted ms-1" title={ADMIN_METRIC_HELP.platformProfit}>
                  (borrower fees {money(pl.platformCashRevenue)} + spread {money(pl.platformSpreadMargin)})
                </span>
              </p>
            </div>
          )}
          {payoutItems.length > 0 && !compact ? (
            <div className="ai-board-chart">
              <p className="ai-board-chart-title">All-time lender payouts</p>
              <HBarChart items={payoutItems} />
            </div>
          ) : (
            !plItems.length && <p className="ai-board-empty">No payout totals yet</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminPlatformBoard;
