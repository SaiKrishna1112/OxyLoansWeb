import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  KpiCard,
  KpiGrid,
  ExportBar,
  exportRowsToCsv,
  printReport,
  ReportSection,
  SearchableDataTable,
  FyMonthlyPayoutChart,
  fyLabel,
  sumOverdueFromUnpaid,
  PriorityTier,
} from "./adminReportKit";
import AdminCmsPaymentsPanel from "./AdminCmsPaymentsPanel";
import AdminBorrowerOverview from "./AdminBorrowerOverview";
import AdminFdStatistics from "./AdminFdStatistics";
import AdminBorrowerFdHubPanel from "./AdminBorrowerFdHubPanel";
import AdminWalletBreakdown from "./AdminWalletBreakdown";
import { AdminDealRoiTable } from "./AdminDealRoiTable";
import { AdminFyEarnersPanel } from "./AdminFyEarnersPanel";
import {
  DealsDirectoryPanel,
  LenderDirectoryPanel,
  ViewPaymentsPanel,
} from "./AdminFeaturePanels";
import {
  mergeFeeSummary,
  buildSpreadSnapshot,
  buildBorrowerLifecycleSnapshot,
  buildPlatformPlSnapshot,
  buildWalletFlowSnapshot,
  buildAdminPrioritiesByTier,
  ADMIN_METRIC_HELP,
} from "./adminBusinessMetrics";
import { DataTable, money, number, StatTile, HBarChart, TrendChart } from "./adminAIDashboardShared";
import ReactApexChart from "react-apexcharts";

const statusBadge = (status) => {
  const st = (status || "INITIATED").toUpperCase();
  const map = {
    SUCCESS: "ai-stage ai-stage--success",
    APPROVED: "ai-stage ai-stage--info",
    INITIATED: "ai-stage ai-stage--muted",
    FAILURE: "ai-stage ai-stage--danger",
  };
  return <span className={map[st] || "ai-stage"}>{st}</span>;
};

export const CmsPayoutsFullReport = () => (
  <AdminCmsPaymentsPanel fullPage />
);

export const MonthlyPayoutFullReport = ({ platform, fy }) => {
  const [chartType, setChartType] = useState("bar");
  const monthlyTrend = platform?.monthlyTrend || [];
  const kpis = platform?.kpis || {};
  const tableRows = monthlyTrend.map((m) => ({
    ...m,
    transactions: m.dealCount ?? m.transactionCount ?? "—",
  }));
  const cols = [
    ["monthLabel", "Month"],
    ["interestPaid", "Interest paid", money],
    ["principalReturned", "Principal", money],
    ["totalPaid", "Total payout", money],
    ["transactions", "Transactions"],
  ];

  return (
    <div className="ai-full-report">
      <div className="ai-report-fy-banner">
        <i className="fas fa-calendar-alt me-2" />
        {fyLabel(fy)}
      </div>
      <KpiGrid>
        <KpiCard tone="blue" icon="fas fa-coins" label="FY interest paid" value={money(kpis.fyInterestPaid)} />
        <KpiCard tone="green" icon="fas fa-check-circle" label="FY principal returned" value={money(kpis.fyPrincipalReturned)} />
        <KpiCard tone="teal" icon="fas fa-chart-line" label="Months with data" value={number(monthlyTrend.length)} />
        <KpiCard
          tone="orange"
          icon="fas fa-receipt"
          label="Latest month total"
          value={monthlyTrend.length ? money(monthlyTrend[monthlyTrend.length - 1]?.totalPaid) : "—"}
        />
      </KpiGrid>
      <ReportSection
        title="Monthly payout trend"
        icon="fas fa-chart-bar"
        actions={
          <div className="btn-group btn-group-sm">
            {["bar", "line", "area"].map((t) => (
              <button
                key={t}
                type="button"
                className={`btn btn-outline-primary ${chartType === t ? "active" : ""}`}
                onClick={() => setChartType(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        }
      >
        <FyMonthlyPayoutChart monthlyTrend={monthlyTrend} fy={fy} chartType={chartType} />
      </ReportSection>
      <ReportSection title="Month-wise details" icon="fas fa-table">
        <ExportBar
          onExportCsv={() => exportRowsToCsv(tableRows, cols, `monthly-payouts-fy${fy}.csv`)}
          onPrint={printReport}
          disabled={!tableRows.length}
        />
        <SearchableDataTable rows={tableRows} columns={cols} searchKeys={["monthLabel"]} initialLimit={12} />
      </ReportSection>
    </div>
  );
};

export const BorrowerAccountsFullReport = ({ ctx }) => {
  const summary = ctx?.borrowerSummary || {};
  const life = buildBorrowerLifecycleSnapshot(summary);
  const rows = summary.recentAccounts || [];
  const cols = [
    ["borrowerName", "Borrower"],
    ["borrowerRef", "ID"],
    ["dealName", "Deal"],
    ["fdAmount", "FD amount", money],
    ["borrowerFee", "Fee", money],
    ["borrowerRoi", "ROI", (v) => (v ? `${v}%` : "—")],
    ["fdAmountFromSystem", "Disbursed", money],
    ["repaymentRemaining", "Outstanding", money],
    ["lifecycleLabel", "Status"],
  ];

  return (
    <div className="ai-full-report">
      <KpiGrid>
        <KpiCard tone="blue" label="Total borrowers (table)" value={number(rows.length)} icon="fas fa-users" />
        <KpiCard tone="green" label="Running" value={number(life.runningCount)} sub={`FD ${money(life.runningFdAmount)}`} icon="fas fa-play" />
        <KpiCard tone="muted" label="Closed" value={number(life.closedCount)} sub={`FD ${money(life.closedFdAmount)}`} icon="fas fa-stop" />
        <KpiCard tone="red" label="Overdue FD" value={number(summary.negativeFdCount)} icon="fas fa-clock" />
        <KpiCard tone="teal" label="Total borrowed (disbursed)" value={money(life.disbursed)} icon="fas fa-hand-holding-usd" />
        <KpiCard tone="orange" label="Outstanding repay" value={money(summary.totalRepaymentRemaining)} icon="fas fa-exclamation-circle" />
        <KpiCard tone="green" label="Interest on FD" value={money(life.fdInterestEarned)} icon="fas fa-percent" />
        <KpiCard tone="blue" label="Total fees" value={money(life.totalBorrowerFees)} icon="fas fa-receipt" />
      </KpiGrid>
      <ReportSection title="Borrower loan details" icon="fas fa-table">
        <ExportBar
          onExportCsv={() => exportRowsToCsv(rows, cols, "borrower-accounts.csv")}
          onPrint={printReport}
          disabled={!rows.length}
        />
        <AdminBorrowerOverview summary={summary} />
      </ReportSection>
    </div>
  );
};

export const BorrowerFeesFullReport = ({ ctx }) => {
  const summary = ctx?.borrowerSummary || {};
  const fees = mergeFeeSummary(ctx?.feeSummary, summary, ctx?.platform?.kpis);
  const life = buildBorrowerLifecycleSnapshot(summary);
  const rows = (summary.recentAccounts || []).map((r) => ({
    ...r,
    processingFee: r.processingFee ?? r.borrowerFee,
    platformFee: r.platformFee ?? 0,
  }));
  const cols = [
    ["borrowerName", "Borrower"],
    ["borrowerRef", "ID"],
    ["borrowerFee", "Total fee", money],
    ["processingFee", "Processing", money],
    ["platformFee", "Platform", money],
    ["lifecycleLabel", "Status"],
  ];

  return (
    <div className="ai-full-report">
      <KpiGrid>
        <KpiCard tone="blue" label="Total fees" value={money(fees.borrowerFeesCollected)} icon="fas fa-receipt" />
        <KpiCard tone="green" label="Running fees" value={money(life.runningBorrowerFees)} icon="fas fa-play" />
        <KpiCard tone="muted" label="Closed fees" value={money(life.closedBorrowerFees)} icon="fas fa-archive" />
        <KpiCard tone="orange" label="Pending review" value={number(summary.pendingFeeReviewCount)} icon="fas fa-hourglass-half" />
      </KpiGrid>
      <ReportSection title="Fee breakdown by borrower" icon="fas fa-list">
        <ExportBar
          onExportCsv={() => exportRowsToCsv(rows, cols, "borrower-fees.csv")}
          onPrint={printReport}
          disabled={!rows.length}
        />
        <SearchableDataTable rows={rows} columns={cols} searchKeys={["borrowerName", "borrowerRef"]} />
      </ReportSection>
    </div>
  );
};

export const BorrowerCollateralFullReport = ({ ctx }) => (
  <div className="ai-full-report">
    <AdminBorrowerFdHubPanel borrowerSummary={ctx?.borrowerSummary} loading={false} />
    <ReportSection title="FD statistics detail" icon="fas fa-list">
      <AdminFdStatistics summary={ctx?.borrowerSummary} fdStatistics={ctx?.borrowerSummary?.fdStatistics} />
    </ReportSection>
  </div>
);

export const RevenuePayoutsFullReport = ({ ctx }) => {
  const fees = mergeFeeSummary(ctx?.feeSummary, ctx?.borrowerSummary, ctx?.platform?.kpis);
  const pl = buildPlatformPlSnapshot(ctx);
  const spread = buildSpreadSnapshot(fees, ctx?.platform?.kpis);
  const monthlyTrend = ctx?.platform?.monthlyTrend || [];

  return (
    <div className="ai-full-report">
      <KpiGrid>
        <KpiCard tone="blue" label="Total revenue (fees)" value={money(pl.platformCashRevenue)} icon="fas fa-coins" />
        <KpiCard tone="orange" label="Lender payouts" value={money(pl.interestPaidToLenders)} icon="fas fa-money-check" />
        <KpiCard tone="green" label="Net / est. profit" value={money(pl.totalEstPlatformProfit)} icon="fas fa-chart-line" />
        <KpiCard tone="teal" label="Spread margin" value={money(pl.platformSpreadMargin)} icon="fas fa-percent" />
        <KpiCard tone="blue" label="Borrower payments" value={money(fees.borrowerFeesCollected)} icon="fas fa-user-graduate" />
        <KpiCard tone="green" label="Platform income" value={money(pl.totalEstPlatformProfit)} icon="fas fa-building" />
      </KpiGrid>
      <ReportSection title="Revenue vs payout" icon="fas fa-chart-bar">
        <HBarChart
          items={[
            { label: "Borrower fees", value: spread.borrowerFees, color: "#2563eb" },
            { label: "Interest to lenders", value: spread.interestPaid, color: "#f97316" },
            { label: "Est. profit", value: pl.totalEstPlatformProfit, color: "#059669" },
          ].filter((i) => Number(i.value) > 0)}
        />
      </ReportSection>
      {monthlyTrend.length > 0 && (
        <ReportSection title="Monthly trend" icon="fas fa-chart-line">
          <TrendChart rows={monthlyTrend} />
        </ReportSection>
      )}
    </div>
  );
};

export const BorrowerSummaryFullReport = ({ ctx }) => {
  const summary = ctx?.borrowerSummary || {};
  const life = buildBorrowerLifecycleSnapshot(summary);
  const fees = mergeFeeSummary(ctx?.feeSummary, summary, ctx?.platform?.kpis);
  const fd = summary.fdStatistics;

  return (
    <div className="ai-full-report">
      <p className="ai-admin-knowledge small mb-3">{ADMIN_METRIC_HELP.platformProfit}</p>
      <KpiGrid>
        <KpiCard tone="blue" label="Total borrowers" value={number(summary.recentAccounts?.length)} />
        <KpiCard tone="green" label="Running" value={number(life.runningCount)} />
        <KpiCard tone="muted" label="Closed" value={number(life.closedCount)} />
        <KpiCard tone="teal" label="Total borrowed" value={money(life.disbursed)} />
        <KpiCard tone="orange" label="Outstanding" value={money(summary.totalRepaymentRemaining)} />
        <KpiCard tone="green" label="Total interest (FD)" value={money(life.fdInterestEarned)} />
        <KpiCard tone="blue" label="Total fees" value={money(fees.borrowerFeesCollected)} />
        <KpiCard tone="purple" label="Collateral value" value={money(fd?.valueOfFd ?? life.totalFdAmount)} />
      </KpiGrid>
      <div className="ai-report-quick-links mt-3">
        <Link to="/adminAIDashboard/borrower-accounts" className="btn btn-sm btn-outline-primary">Borrower accounts</Link>
        <Link to="/adminAIDashboard/borrower-fees" className="btn btn-sm btn-outline-primary">Borrower fees</Link>
        <Link to="/adminAIDashboard/borrower-collateral" className="btn btn-sm btn-outline-primary">Collateral</Link>
      </div>
    </div>
  );
};

export const ParticipationFullReport = ({ ctx }) => {
  const overview = ctx?.overview || {};
  const mix = [
    { label: "Monthly", value: overview.totalMonthlyParticipations, color: "#2563eb" },
    { label: "Quarterly", value: overview.totalQuarterlyParticipations, color: "#0d9488" },
    { label: "Half-yearly", value: overview.totalHalfYearlyParticipations, color: "#d97706" },
    { label: "Yearly", value: overview.totalYearlyParticipations, color: "#7c3aed" },
  ].filter((i) => Number(i.value) > 0);
  const lenders = ctx?.platform?.topLenders || [];
  const avg =
    lenders.length > 0
      ? lenders.reduce((s, l) => s + (Number(l.totalInvested) || 0), 0) / lenders.length
      : 0;

  return (
    <div className="ai-full-report">
      <KpiGrid>
        <KpiCard tone="blue" label="Active investors" value={number(overview.activeLenderCount)} icon="fas fa-users" />
        <KpiCard tone="green" label="Total investment" value={money(overview.totalInvestment)} icon="fas fa-wallet" />
        <KpiCard tone="teal" label="Avg investment" value={money(avg)} icon="fas fa-chart-pie" />
        <KpiCard tone="orange" label="Listed top lenders" value={number(lenders.length)} icon="fas fa-list" />
      </KpiGrid>
      <ReportSection title="Participation distribution" icon="fas fa-chart-pie">
        {mix.length ? <HBarChart items={mix} /> : <p className="text-muted small">No mix data.</p>}
      </ReportSection>
      <ReportSection title="Top lenders" icon="fas fa-trophy">
        <DataTable
          rows={lenders}
          columns={[
            ["name", "Lender"],
            ["totalInvested", "Invested", money],
            ["dealCount", "Deals", number],
          ]}
          initialLimit={20}
        />
      </ReportSection>
    </div>
  );
};

export const PortfolioFullReport = ({ ctx }) => {
  const deals = ctx?.dealsSummary || {};
  const fees = mergeFeeSummary(ctx?.feeSummary, ctx?.borrowerSummary, ctx?.platform?.kpis);
  const kpis = ctx?.platform?.kpis || {};
  const life = buildBorrowerLifecycleSnapshot(ctx?.borrowerSummary);

  return (
    <div className="ai-full-report">
      <ReportSection title="Running portfolio" icon="fas fa-play-circle">
        <KpiGrid>
          <KpiCard tone="green" label="Running deals" value={number(deals.activeLoanCount ?? fees.activeRunningDeals)} />
          <KpiCard tone="teal" label="Running investment" value={money(kpis.activeDealsAmount)} />
          <KpiCard tone="blue" label="Running borrowers" value={number(life.runningCount)} />
          <KpiCard tone="green" label="Running FD" value={money(life.runningFdAmount)} />
        </KpiGrid>
      </ReportSection>
      <ReportSection title="Closed portfolio" icon="fas fa-archive">
        <KpiGrid>
          <KpiCard tone="muted" label="Closed deals" value={number(deals.borrowerClosedCount ?? fees.closedDeals)} />
          <KpiCard tone="muted" label="Closed FD amount" value={money(life.closedFdAmount)} />
          <KpiCard tone="green" label="Interest paid (all-time)" value={money(fees.lenderInterestPaid)} />
          <KpiCard tone="muted" label="Closed borrowers" value={number(life.closedCount)} />
        </KpiGrid>
      </ReportSection>
      <ReportSection title="Overall portfolio" icon="fas fa-globe">
        <KpiGrid>
          <KpiCard tone="blue" label="Total deals" value={number(kpis.totalDeals)} />
          <KpiCard tone="teal" label="Total investment" value={money(kpis.totalInvested)} />
          <KpiCard tone="green" label="Wallet balance" value={money(kpis.totalWalletBalance)} />
          <KpiCard tone="orange" label="Avg spread" value={fees.avgSpreadPercent != null ? `${fees.avgSpreadPercent}%` : "—"} />
        </KpiGrid>
      </ReportSection>
      {(ctx?.dealRows || []).length > 0 && (
        <ReportSection title="Deal performance" icon="fas fa-table">
          <AdminDealRoiTable deals={ctx.dealRows} limit={25} />
        </ReportSection>
      )}
    </div>
  );
};

export const PriorityAlertsFullReport = ({ ctx, onOpenModule }) => {
  const tiers = buildAdminPrioritiesByTier(ctx);
  const [sort, setSort] = useState("priority");

  return (
    <div className="ai-full-report">
      <div className="ai-alert-sort mb-3">
        <span className="small text-muted me-2">Sort by</span>
        {["priority", "title"].map((s) => (
          <button
            key={s}
            type="button"
            className={`btn btn-sm ${sort === s ? "btn-primary" : "btn-outline-secondary"} me-1`}
            onClick={() => setSort(s)}
          >
            {s === "priority" ? "Priority" : "Title"}
          </button>
        ))}
      </div>
      <PriorityTier tier="critical" title="Critical alerts" items={tiers.critical} onOpen={onOpenModule} />
      <PriorityTier tier="high" title="High priority" items={tiers.high} onOpen={onOpenModule} />
      <PriorityTier tier="medium" title="Medium priority" items={tiers.medium} onOpen={onOpenModule} />
      <PriorityTier tier="info" title="Information" items={tiers.info} onOpen={onOpenModule} />
    </div>
  );
};

export { statusBadge };
