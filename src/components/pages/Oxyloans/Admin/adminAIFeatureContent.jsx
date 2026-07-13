import React from "react";
import {
  loadAdminAIDashboardSections,
  loadDealIntelligence,
  loadBorrowerPaymentsSummary,
  loadFdStatistics,
  loadFyStats,
  loadTopLendersInvestment,
  loadWalletSummary,
  loadPlatformKpis,
  loadDealsDirectorySummary,
  loadParticipationInsights,
  loadLenderRiskPortfolio,
} from "../../../HttpRequest/aiAdminApi";
import { getAdminAIReconciliationSummary } from "../../../HttpRequest/afterlogin";
import {
  DealsDirectoryPanel,
  LenderDirectoryPanel,
  ViewPaymentsPanel,
} from "./AdminFeaturePanels";
import AdminPrioritiesPanel from "./AdminPrioritiesPanel";
import { AdminDealRoiTable } from "./AdminDealRoiTable";
import { AdminFyEarnersPanel } from "./AdminFyEarnersPanel";
import AdminBorrowerOverview from "./AdminBorrowerOverview";
import AdminFdStatistics from "./AdminFdStatistics";
import AdminWalletBreakdown from "./AdminWalletBreakdown";
import AdminWalletHubPanel from "./AdminWalletHubPanel";
import {
  CmsPayoutsFullReport,
  MonthlyPayoutFullReport,
  BorrowerAccountsFullReport,
  BorrowerFeesFullReport,
  BorrowerCollateralFullReport,
  RevenuePayoutsFullReport,
  BorrowerSummaryFullReport,
  ParticipationFullReport,
  PortfolioFullReport,
  PriorityAlertsFullReport,
} from "./adminFullReports";
import {
  buildAdminPriorities,
  buildSpreadSnapshot,
  buildCapitalSnapshot,
  buildBorrowerLifecycleSnapshot,
  buildPlatformPlSnapshot,
  buildWalletFlowSnapshot,
  mergeFeeSummary,
  mergeAdminPlatformKpis,
  enrichBorrowerWithFdStatistics,
  buildDealsSummaryFromIntel,
  ADMIN_METRIC_HELP,
} from "./adminBusinessMetrics";
import { DataTable, money, number, StatTile, TrendChart, HBarChart } from "./adminAIDashboardShared";

export const sectionsToPlatform = (sections) => {
  if (!sections) return null;
  return {
    kpis: sections.platformKpis?.data?.kpis || {},
    users: sections.userGrowth?.data?.users || {},
    topLenders: sections.topLenders?.data?.topLenders || [],
    topDeals: sections.topDeals?.data?.topDeals || [],
    monthlyTrend: sections.monthlyTrend?.data?.monthlyTrend || [],
    fyLeaderboard: sections.topLenders?.data?.fyLeaderboard || [],
  };
};

const hasKpis = (kpis) =>
  kpis &&
  (kpis.fyInterestPaid != null ||
    kpis.totalDeals != null ||
    kpis.totalWalletBalance != null ||
    kpis.activeDealsAmount != null);

const hasLiveKpis = (kpis) =>
  kpis &&
  (kpis.totalWalletBalance != null ||
    kpis.activeDealsAmount != null ||
    kpis.totalInvested != null);

const loadReconciliation = async (cache) => {
  if (cache?.reconciliation && cache.reconciliation.totalInitiated != null) {
    return cache.reconciliation;
  }
  try {
    const ext = await loadAdminAIDashboardSections(null, false, 1, { extendedOnly: true });
    const r =
      ext?.sections?.reconciliation?.data?.reconciliation ||
      ext?.sections?.reconciliation?.data;
    if (r) return r;
  } catch {
    /* legacy fallback */
  }
  const res = await getAdminAIReconciliationSummary();
  return res?.data || {};
};

const loadUsersOverview = async (cache) => {
  const cached = cache?.platform?.users;
  if (cached?.total != null) {
    return { users: cached, kpis: cache.platform?.kpis || {} };
  }
  try {
    const result = await loadAdminAIDashboardSections(null, false, 1);
    const sections = result?.sections || {};
    return {
      users: sections.userGrowth?.data?.users || {},
      kpis: sections.platformKpis?.data?.kpis || {},
    };
  } catch {
    const kpis = await loadPlatformKpis().catch(() => ({}));
    return { users: {}, kpis };
  }
};

const loadFyPlatform = async (fy, cache) => {
  const cached = sectionsToPlatform(cache?.fySections);
  if (cached && hasKpis(cached.kpis)) return cached;
  const result = await loadFyStats(fy);
  return sectionsToPlatform(result?.sections) || {};
};

const loadBorrowerPreviewCtx = async () => {
  const [borrowerRes, fdStatsRes] = await Promise.all([
    loadBorrowerPaymentsSummary().catch(() => null),
    loadFdStatistics("ALL").catch(() => null),
  ]);
  const borrowerSummary = enrichBorrowerWithFdStatistics(
    borrowerRes?.data ? { ...borrowerRes.data, error: borrowerRes.error } : {},
    fdStatsRes?.data,
    fdStatsRes?.error
  );
  return {
    previewCtx: buildPreviewContext(null, {}, null, null, null, borrowerSummary, null),
  };
};

const loadWalletPreviewCtx = async () => {
  const [walletRes, kpis] = await Promise.all([
    loadWalletSummary().catch(() => null),
    loadPlatformKpis().catch(() => ({})),
  ]);
  return {
    previewCtx: buildPreviewContext(
      null,
      { platformKpis: { data: { kpis } } },
      null,
      null,
      null,
      null,
      walletRes?.data || null
    ),
  };
};

const loadPortfolioPreviewCtx = async () => {
  const [intelRes, dealsSum] = await Promise.all([
    loadDealIntelligence().catch(() => null),
    loadDealsDirectorySummary().catch(() => null),
  ]);
  const dealIntel = intelRes?.data || intelRes || {};
  return {
    previewCtx: buildPreviewContext(
      null,
      {},
      dealsSum,
      null,
      { ...dealIntel, dealRows: dealIntel.runningDeals || [] },
      null,
      null
    ),
    dealIntelligence: dealIntel,
  };
};

const loadDealRoiPreviewCtx = async () => {
  const intelRes = await loadDealIntelligence().catch(() => null);
  const dealIntel = intelRes?.data || intelRes || {};
  return {
    previewCtx: buildPreviewContext(
      null,
      {},
      null,
      null,
      { ...dealIntel, dealRows: dealIntel.runningDeals || [] },
      null,
      null
    ),
    dealIntelligence: dealIntel,
  };
};

const loadFeesRevenuePreviewCtx = async () => {
  const [intelRes, kpis] = await Promise.all([
    loadDealIntelligence().catch(() => null),
    loadPlatformKpis().catch(() => ({})),
  ]);
  const dealIntel = intelRes?.data || intelRes || {};
  return {
    previewCtx: buildPreviewContext(
      null,
      { platformKpis: { data: { kpis } } },
      null,
      null,
      dealIntel,
      null,
      null
    ),
  };
};

const loadOpsAlertsPreviewCtx = async () => {
  const [recon, dealsSum, walletRes] = await Promise.all([
    loadReconciliation({}),
    loadDealsDirectorySummary().catch(() => null),
    loadWalletSummary().catch(() => null),
  ]);
  return {
    previewCtx: buildPreviewContext(null, {}, dealsSum, recon, null, null, walletRes?.data || null),
    reconciliation: recon,
  };
};

/** @deprecated Hub no longer preloads context; each feature loads only what it needs. */
export const PREVIEW_FEATURES = new Set();

export const buildFeatureLoader = (feature, fy, cache = {}) => {
  if (!feature) return async () => ({});

  switch (feature.id) {
    case "borrower-summary":
    case "borrower-fees":
    case "borrower-collateral":
    case "borrower-accounts":
      return loadBorrowerPreviewCtx;

    case "capital-liquidity":
      return loadWalletPreviewCtx;

    case "participation-insights":
      return async () => {
        const sections = await loadParticipationInsights(fy);
        return {
          previewCtx: buildPreviewContext(null, sections, null, null, null, null, null),
        };
      };

    case "portfolio-overview":
      return loadPortfolioPreviewCtx;

    case "operations-alerts":
      return loadOpsAlertsPreviewCtx;

    case "fees-revenue":
      return loadFeesRevenuePreviewCtx;

    case "deal-roi-board":
      return loadDealRoiPreviewCtx;

    case "deals-directory":
    case "lender-directory":
    case "view-payments":
    case "cms-lender-payouts":
      return async () => ({ ready: true });

    case "fy-earners":
      return async () => {
        const platform = await loadFyPlatform(fy, cache);
        return {
          platform,
          previewCtx: buildPreviewContext(
            { topLenders: { data: { fyLeaderboard: platform.fyLeaderboard || [] } }, platformKpis: { data: { kpis: platform.kpis || {} } } },
            {},
            null,
            null,
            null,
            null,
            null
          ),
        };
      };

    case "deal-intelligence":
      return async () => {
        const res = await loadDealIntelligence();
        return { dealIntelligence: res?.data || res };
      };

    case "cms-reconciliation":
      return async () => {
        const recon = await loadReconciliation(cache);
        return { reconciliation: recon, previewCtx: buildPreviewContext(null, {}, null, recon, null, null, null) };
      };

    case "risk-summary":
      return async () => {
        const lenderRisk = await loadLenderRiskPortfolio();
        return { lenderRisk };
      };

    case "top-lenders":
      return async () => {
        if (cache?.platform?.topLenders?.length) {
          return { platform: { topLenders: cache.platform.topLenders } };
        }
        const section = await loadTopLendersInvestment(fy, 25);
        return { platform: { topLenders: section?.data?.topLenders || [] } };
      };

    case "platform-users":
      return async () => ({ platform: await loadUsersOverview(cache) });

    case "financial-kpis":
      return async () => {
        const platform = await loadFyPlatform(fy, cache);
        if (!hasKpis(platform.kpis)) {
          throw new Error(`No KPI data for FY ${fy}–${String(fy + 1).slice(2)}.`);
        }
        return { platform };
      };

    case "monthly-payout":
      return async () => {
        const platform = await loadFyPlatform(fy, cache);
        if (!platform.monthlyTrend?.length) {
          const cached = sectionsToPlatform(cache?.fySections);
          if (cached?.monthlyTrend?.length) return { platform: cached };
          throw new Error(`No monthly payout data for FY ${fy}–${String(fy + 1).slice(2)}.`);
        }
        return { platform };
      };

    case "top-deals":
      return async () => {
        const platform = await loadFyPlatform(fy, cache);
        if (!platform.topDeals?.length) {
          const cached = sectionsToPlatform(cache?.fySections);
          if (cached?.topDeals?.length) return { platform: cached };
          throw new Error(`No top deals for FY ${fy}–${String(fy + 1).slice(2)}.`);
        }
        return { platform };
      };

    default:
      return async () => ({ ready: true });
  }
};

export const FeatureContent = ({
  featureId,
  fy,
  platform,
  reconciliation,
  lenderRisk,
  lenderRiskError,
  dealIntelligence,
  previewCtx,
  onOpenModule,
}) => {
  const ctx = previewCtx || {};
  const kpis = platform?.kpis || ctx.platform?.kpis || {};
  const users = platform?.users || ctx.platform?.users || {};
  const recon = reconciliation || ctx.reconciliation || {};
  const overview = ctx.overview || {};

  switch (featureId) {
    case "deals-directory":
      return <DealsDirectoryPanel />;

    case "lender-directory":
      return <LenderDirectoryPanel />;

    case "view-payments":
      return <ViewPaymentsPanel />;

    case "operations-alerts":
      return <PriorityAlertsFullReport ctx={ctx} onOpenModule={onOpenModule} />;

    case "cms-lender-payouts":
      return <CmsPayoutsFullReport />;

    case "borrower-summary":
      return <BorrowerSummaryFullReport ctx={ctx} />;

    case "borrower-fees":
      return <BorrowerFeesFullReport ctx={ctx} />;

    case "borrower-collateral":
      return <BorrowerCollateralFullReport ctx={ctx} />;

    case "portfolio-overview":
      return <PortfolioFullReport ctx={ctx} />;

    case "fees-revenue":
      return <RevenuePayoutsFullReport ctx={ctx} />;

    case "borrower-accounts":
      return <BorrowerAccountsFullReport ctx={ctx} />;

    case "participation-insights":
      return <ParticipationFullReport ctx={ctx} />;

    case "monthly-payout":
      return <MonthlyPayoutFullReport platform={platform?.monthlyTrend ? platform : ctx.platform} fy={fy} />;

    case "deal-roi-board": {
      const rows = ctx.dealRows || dealIntelligence?.runningDeals || [];
      return <AdminDealRoiTable deals={rows} limit={25} />;
    }

    case "capital-liquidity": {
      return (
        <>
          <AdminWalletHubPanel
            walletSummary={ctx.walletSummary}
            kpis={ctx.platform?.kpis}
            loading={false}
          />
          <div className="mt-3">
            <AdminWalletBreakdown
              walletSummary={ctx.walletSummary}
              kpis={ctx.platform?.kpis}
              loading={false}
              onOpenModule={onOpenModule}
            />
          </div>
        </>
      );
    }

    case "deal-intelligence": {
      const di = dealIntelligence || ctx.dealIntelligence || {};
      const fees = di.feeSummary || ctx.feeSummary || {};
      const running = di.runningDeals || ctx.dealRows || [];
      const launch = di.launchSuggestion || {};
      return (
        <>
          <div className="ai-stat-grid mb-3">
            <StatTile label="Borrower fees" value={money(fees.borrowerFeesCollected)} color="#2563eb" />
            <StatTile label="Interest to lenders" value={money(fees.lenderInterestPaid)} color="#059669" />
            <StatTile label="Avg spread" value={fees.avgSpreadPercent != null ? `${fees.avgSpreadPercent}%` : "—"} color="#d97706" />
            <StatTile label="Active deals" value={number(fees.activeRunningDeals)} color="#0891b2" />
          </div>
          {launch.suggestedDealSize > 0 && (
            <p className="small mb-3">
              Launch idea: ~{money(launch.suggestedDealSize)} at {launch.suggestedLenderRoiMin}–{launch.suggestedLenderRoiMax}% lender / ~{launch.suggestedBorrowerRoi}% borrower
            </p>
          )}
          {running.length > 0 && (
            <AdminDealRoiTable deals={running} limit={15} compact />
          )}
        </>
      );
    }

    case "top-lenders":
      return (
        <>
          <DataTable
            rows={platform?.topLenders || ctx.platform?.topLenders || []}
            initialLimit={15}
            columns={[
              ["name", "Lender"],
              ["totalInvested", "Invested", money],
              ["dealCount", "Deals", number],
              ["fyInterestEarned", "FY interest", money],
            ]}
            emptyText="No lender ranking loaded."
          />
        </>
      );

    case "financial-kpis":
      return (
        <>
          <div className="ai-mini-stat-grid mb-3">
            <StatTile label="FY interest paid" value={money(kpis.fyInterestPaid)} color="#2563eb" />
            <StatTile label="FY principal returned" value={money(kpis.fyPrincipalReturned)} color="#059669" />
            <StatTile label="Total deals" value={number(kpis.totalDeals)} color="#6366f1" />
            <StatTile label="P2P deals" value={number(kpis.p2pDeals)} color="#0891b2" />
            <StatTile label="Wallet balance" value={money(kpis.totalWalletBalance)} color="#0d9488" />
            <StatTile label="Active in deals" value={money(kpis.activeDealsAmount)} color="#7c3aed" />
          </div>
        </>
      );

    case "top-deals":
      return (
        <DataTable
          rows={platform?.topDeals || ctx.platform?.topDeals || []}
          initialLimit={10}
          columns={[
            ["dealName", "Deal"],
            ["volume", "Volume", money],
            ["lenderCount", "Lenders", number],
            ["roi", "ROI", (v) => (v ? `${v}%` : "—")],
            ["status", "Status"],
          ]}
          emptyText="No top deals for this FY."
        />
      );

    case "platform-users":
      return (
        <>
          <div className="ai-stat-grid mb-3">
            <StatTile label="Total users" value={number(users.total)} color="#2563eb" />
            <StatTile label="Lenders" value={number(users.lenders)} color="#0f766e" />
            <StatTile label="Borrowers" value={number(users.borrowers)} color="#7c3aed" />
            <StatTile label="New (7 days)" value={number(users.newLast7Days)} color="#059669" />
            <StatTile label="New (30 days)" value={number(users.newLast30Days)} color="#0891b2" />
          </div>
        </>
      );

    case "cms-reconciliation":
      return (
        <>
          <div className="mb-3">
            <span className={`badge ${recon?.fullyReconciled ? "bg-success" : "bg-warning text-dark"}`}>
              {recon?.fullyReconciled ? "Reconciled" : "Action required"}
            </span>
          </div>
          <div className="ai-stat-grid">
            <StatTile label="Initiated" value={money(recon?.totalInitiated)} color="#2563eb" />
            <StatTile label="Confirmed" value={money(recon?.totalConfirmed)} color="#059669" />
            <StatTile label="Pending" value={money(recon?.totalPending)} color="#d97706" />
            <StatTile label="Failed" value={money(recon?.totalFailed)} color="#dc2626" />
          </div>
        </>
      );

    case "fy-earners":
      return (
        <AdminFyEarnersPanel rows={ctx.platform?.fyLeaderboard || platform?.fyLeaderboard || []} fy={fy} />
      );

    case "risk-summary":
      if (lenderRiskError) return <div className="alert alert-warning mb-0">{lenderRiskError}</div>;
      if (!lenderRisk) return <p className="text-muted mb-0">Risk data not loaded.</p>;
      return (
        <div className="ai-stat-grid">
          <StatTile label="Lenders scored" value={number(lenderRisk.totalLenders)} color="#2563eb" />
          <StatTile label="High risk" value={number(lenderRisk.highRiskCount)} color="#dc2626" />
          <StatTile label="Medium" value={number(lenderRisk.mediumRiskCount)} color="#d97706" />
          <StatTile label="Low risk" value={number(lenderRisk.lowRiskCount)} color="#059669" />
        </div>
      );

    default:
      return null;
  }
};

export const getFeaturePreviewStats = (featureId, ctx, fy) => {
  const platform = ctx?.platform || {};
  const kpis = platform.kpis || {};
  const topLenders = platform.topLenders || [];
  const monthlyTrend = platform.monthlyTrend || [];
  const reconciliation = ctx?.reconciliation || {};
  const overview = ctx?.overview || {};
  const dealsSummary = ctx?.dealsSummary || {};
  const fees = ctx?.feeSummary || {};

  switch (featureId) {
    case "operations-alerts": {
      const items = buildAdminPriorities(ctx);
      return [
        { label: "Items", value: number(items.filter((i) => i.severity !== "muted").length) },
        { label: "CMS", value: reconciliation?.totalPending ? money(reconciliation.totalPending) : "OK" },
      ];
    }
    case "fees-revenue": {
      const merged = mergeFeeSummary(fees, ctx?.borrowerSummary, platform.kpis);
      const life = buildBorrowerLifecycleSnapshot(ctx?.borrowerSummary);
      return [
        { label: "Fees", value: money(merged.borrowerFeesCollected) },
        { label: "Run / Cls", value: `${money(life.runningBorrowerFees)} / ${money(life.closedBorrowerFees)}` },
      ];
    }
    case "borrower-accounts": {
      const b = ctx?.borrowerSummary || {};
      const life = buildBorrowerLifecycleSnapshot(b);
      const fd = b.fdStatistics;
      return [
        { label: "FDs done", value: number(fd?.noOfFdsDone ?? life.runningCount + life.closedCount) },
        { label: "FD run", value: money(life.runningFdAmount) },
        { label: "FD int.", value: money(life.fdInterestEarned) },
      ];
    }
    case "deal-roi-board":
      return [
        { label: "Deals", value: number((ctx?.dealRows || []).length) },
        { label: "ROI", value: "Board" },
      ];
    case "deals-directory":
      return [
        { label: "Open", value: number(dealsSummary?.openForParticipationCount ?? dealsSummary?.runningCount) },
        { label: "Active", value: number(dealsSummary?.activeLoanCount) },
        { label: "Closed", value: number(dealsSummary?.borrowerClosedCount) },
      ];
    case "financial-kpis":
      return [
        { label: "FY interest", value: money(kpis.fyInterestPaid) },
        { label: "Deals", value: number(kpis.totalDeals) },
      ];
    case "top-lenders":
      return [
        { label: "Listed", value: number(topLenders.length) },
        { label: "Top", value: topLenders[0] ? money(topLenders[0].totalInvested) : "—" },
      ];
    case "top-deals":
      return [
        { label: "FY deals", value: number((platform.topDeals || []).length) },
        { label: "Top vol.", value: platform.topDeals?.[0] ? money(platform.topDeals[0].volume) : "—" },
      ];
    case "monthly-payout":
      return [
        { label: "Months", value: number(monthlyTrend.length) },
        { label: "Latest", value: monthlyTrend.length ? money(monthlyTrend[monthlyTrend.length - 1]?.totalPaid) : "—" },
      ];
    case "lender-directory":
      return [
        { label: "Active", value: number(overview.activeLenderCount) },
        { label: "Invested", value: money(overview.totalInvestment) },
      ];
    case "view-payments":
      return [
        { label: "Upcoming", value: "Interest" },
        { label: "Window", value: "3 days" },
      ];
    case "deal-intelligence":
      return [
        { label: "Fees", value: money(fees.borrowerFeesCollected) },
        { label: "Spread", value: fees.avgSpreadPercent != null ? `${fees.avgSpreadPercent}%` : "—" },
      ];
    case "capital-liquidity": {
      const flow = buildWalletFlowSnapshot(ctx?.walletSummary, ctx?.platform?.kpis);
      return [
        { label: "Balance", value: money(flow.currentBalance) },
        { label: "Loaded", value: money(flow.totalLoaded) },
        { label: "Withdrawn", value: money(flow.totalWithdrawn) },
      ];
    }
    case "participation-insights":
      return [
        { label: "Lenders", value: number(overview.activeLenderCount) },
        { label: "Participated", value: money(overview.totalInvestment) },
      ];
    case "platform-users":
      return [
        { label: "Users", value: number(platform.users?.total) },
        { label: "Lenders", value: number(platform.users?.lenders) },
      ];
    case "cms-reconciliation":
      return [
        { label: "Pending", value: money(reconciliation?.totalPending) },
        { label: "Status", value: reconciliation?.fullyReconciled ? "OK" : "Review" },
      ];
    case "cms-lender-payouts":
      return [
        { label: "CMS", value: "Payouts" },
        { label: "Range", value: "Date filter" },
      ];
    case "borrower-summary":
      return [
        { label: "Borrowers", value: number(ctx?.borrowerSummary?.recentAccounts?.length) },
        { label: "Summary", value: "View" },
      ];
    case "borrower-fees":
      return [
        { label: "Fees", value: money(mergeFeeSummary(ctx?.feeSummary, ctx?.borrowerSummary).borrowerFeesCollected) },
        { label: "Detail", value: "Table" },
      ];
    case "borrower-collateral":
      return [
        { label: "FD", value: money(ctx?.borrowerSummary?.fdStatistics?.valueOfFd) },
        { label: "Active", value: number(ctx?.borrowerSummary?.fdStatistics?.noOfActiveFds) },
      ];
    case "portfolio-overview":
      return [
        { label: "Deals", value: number(ctx?.dealsSummary?.activeLoanCount) },
        { label: "Portfolio", value: "View" },
      ];
    case "fy-earners": {
      const rows = platform.fyLeaderboard || [];
      return [
        { label: "Earners", value: number(rows.length) },
        { label: "Top", value: rows[0] ? money(rows[0].fyInterestEarned) : "—" },
      ];
    }
    case "risk-summary":
      return [
        { label: "Live", value: "Risk" },
        { label: "Open", value: "View" },
      ];
    default:
      return [
        { label: "View", value: "Details" },
        { label: "FY", value: fy ? `${fy}-${String(fy + 1).slice(2)}` : "—" },
      ];
  }
};

export const buildPreviewContext = (fySections, overviewSections, dealsSummary, reconData, dealIntel = null, borrowerSummary = null, walletSummary = null) => {
  const fromFy = sectionsToPlatform(fySections) || {};
  const summary = overviewSections?.activeLendersSummary?.data || {};
  const participation = overviewSections?.participationAmountInfo?.data?.participationAmounts || {};
  const dealRows = dealIntel?.dealRows || dealIntel?.runningDeals || [];
  const rawFees = dealIntel?.feeSummary || {};
  const liveKpis = overviewSections?.platformKpis?.data?.kpis || {};
  const fyKpis = fromFy.kpis || {};
  const overview = {
    activeLenderCount: summary.activeLenderCount,
    totalInvestment:
      summary.totalInvestment ??
      summary.totalCurrentParticipation ??
      participation.totalMonthlyParticipations,
    totalMonthlyParticipations: participation.totalMonthlyParticipations,
    totalQuarterlyParticipations: participation.totalQuarterlyParticipations,
    totalHalfYearlyParticipations: participation.totalHalfYearlyParticipations,
    totalYearlyParticipations: participation.totalYearlyParticipations,
  };
  const kpis = mergeAdminPlatformKpis(fyKpis, liveKpis, walletSummary, overview);
  const resolvedDealsSummary = dealsSummary || buildDealsSummaryFromIntel(dealIntel);

  return {
    platform: {
      kpis,
      users: fromFy.users || overviewSections?.userGrowth?.data?.users || {},
      topLenders: fromFy.topLenders || overviewSections?.topLenders?.data?.topLenders || [],
      topDeals: fromFy.topDeals || overviewSections?.topDeals?.data?.topDeals || [],
      monthlyTrend: fromFy.monthlyTrend || overviewSections?.monthlyTrend?.data?.monthlyTrend || [],
      fyLeaderboard: fromFy.fyLeaderboard || overviewSections?.topLenders?.data?.fyLeaderboard || [],
    },
    fySections,
    overview,
    reconciliation:
      reconData ||
      overviewSections?.reconciliation?.data?.reconciliation ||
      fySections?.reconciliation?.data?.reconciliation ||
      {},
    dealsSummary: resolvedDealsSummary,
    feeSummary: rawFees,
    borrowerSummary: borrowerSummary || {},
    fdStatistics: borrowerSummary?.fdStatistics || null,
    walletSummary: walletSummary || {},
    dealRows,
    dealIntelligence: dealIntel,
  };
};
