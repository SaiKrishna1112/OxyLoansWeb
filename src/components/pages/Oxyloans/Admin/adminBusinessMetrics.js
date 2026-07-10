import { money, number } from "./adminAIDashboardShared";

/** Live wallet/deployment KPIs — wallet summary wins, then dashboard-live, then FY stats */
export const mergeAdminPlatformKpis = (fyKpis = {}, liveKpis = {}, walletSummary = {}, overview = {}) => {
  const w = walletSummary || {};
  const o = overview || {};
  const merged = { ...fyKpis, ...liveKpis };

  if (w.currentBalance != null) merged.totalWalletBalance = w.currentBalance;
  else if (liveKpis.totalWalletBalance != null) merged.totalWalletBalance = liveKpis.totalWalletBalance;

  if (w.activeInLiveDeals != null) merged.activeDealsAmount = w.activeInLiveDeals;
  else if (liveKpis.activeDealsAmount != null) merged.activeDealsAmount = liveKpis.activeDealsAmount;

  const participated =
    w.totalParticipatedInDeals ??
    liveKpis.totalInvested ??
    o.totalInvestment ??
    o.totalMonthlyParticipations;
  if (participated != null) merged.totalInvested = participated;

  return merged;
};

export const buildDealsSummaryFromIntel = (dealIntel) => {
  if (!dealIntel) return null;
  const fees = dealIntel.feeSummary || {};
  const running = dealIntel.runningDeals?.length ?? fees.activeRunningDeals ?? 0;
  const closed = fees.closedDeals ?? dealIntel.closeCandidates?.length ?? 0;
  const open = fees.openForParticipationCount ?? running;
  const active = fees.activeLoanCount ?? running;
  if (!running && !closed && !open && !active) return null;
  return {
    openForParticipationCount: open || running,
    activeLoanCount: active,
    borrowerClosedCount: closed,
    runningCount: running || open,
    source: "deal-intel-inferred",
  };
};

/** Top-level admin KPIs — business numbers only (borrower_payments is source for fees/FD) */
export const mergeFeeSummary = (dealFees = {}, borrowerSummary = {}, kpis = {}) => {
  const life = buildBorrowerLifecycleSnapshot(borrowerSummary);
  const combinedFees =
    life.totalBorrowerFees ||
    Number(borrowerSummary.totalBorrowerFees) ||
    Number(borrowerSummary.totalCombinedFees) ||
    Number(dealFees.borrowerFeesCollected) ||
    0;
  const avgBorrower =
    (borrowerSummary.avgBorrowerRoi > 0 ? borrowerSummary.avgBorrowerRoi : null) ??
    dealFees.avgBorrowerRoi ??
    null;
  const avgLender = dealFees.avgLenderRoi ?? null;
  const spread =
    dealFees.avgSpreadPercent ??
    (avgBorrower != null && avgLender != null ? Math.round((avgBorrower - avgLender) * 100) / 100 : null);

  return {
    borrowerFeesCollected: combinedFees,
    runningBorrowerFees: life.runningBorrowerFees,
    closedBorrowerFees: life.closedBorrowerFees,
    runningFdAmount: life.runningFdAmount,
    closedFdAmount: life.closedFdAmount,
    totalFdAmount: life.totalFdAmount || borrowerSummary.totalFdAmount || dealFees.totalFdAmount || 0,
    lenderInterestPaid: dealFees.lenderInterestPaid ?? kpis.allTimeInterestPaid ?? 0,
    lenderPrincipalReturned: dealFees.lenderPrincipalReturned ?? kpis.allTimePrincipalReturned ?? 0,
    activeParticipationAmount: dealFees.activeParticipationAmount ?? kpis.activeDealsAmount ?? kpis.totalInvested ?? 0,
    avgBorrowerRoi: avgBorrower,
    avgLenderRoi: avgLender,
    avgSpreadPercent: spread,
    activeRunningDeals: dealFees.activeRunningDeals ?? kpis.activeDeals ?? 0,
    closedDeals: dealFees.closedDeals ?? kpis.closedDeals ?? 0,
    riskDealCount: dealFees.riskDealCount ?? 0,
  };
};

export const buildAdminBusinessKpis = (ctx) => {
  const kpis = ctx?.platform?.kpis || {};
  const overview = ctx?.overview || {};
  const deals = ctx?.dealsSummary || {};
  const recon = ctx?.reconciliation || {};
  const fees = mergeFeeSummary(ctx?.feeSummary, ctx?.borrowerSummary, kpis);

  return [
    {
      key: "participation",
      label: "Total lender participation",
      value: money(fees.activeParticipationAmount || kpis.totalInvested || overview.totalInvestment),
      hint: "Money lenders have put into deals",
      color: "#6366f1",
      icon: "fas fa-hand-holding-usd",
    },
    {
      key: "activeAmount",
      label: "Live deal amount",
      value: money(kpis.activeDealsAmount),
      hint: "Currently deployed in running deals",
      color: "#0891b2",
      icon: "fas fa-briefcase",
    },
    {
      key: "wallet",
      label: "Lender wallet balance",
      value: money(kpis.totalWalletBalance),
      hint: "Available to participate in new deals",
      color: "#d97706",
      icon: "fas fa-wallet",
    },
    {
      key: "borrowerFees",
      label: "Borrower fees collected",
      value: money(fees.borrowerFeesCollected),
      hint: "Platform revenue from borrower-side fees",
      color: "#2563eb",
      icon: "fas fa-receipt",
    },
    {
      key: "interestPaid",
      label: "Interest paid to lenders",
      value: money(fees.lenderInterestPaid || kpis.allTimeInterestPaid),
      hint: "All-time lender interest payouts",
      color: "#059669",
      icon: "fas fa-coins",
    },
    {
      key: "spread",
      label: "Avg ROI spread",
      value: fees.avgSpreadPercent != null ? `${fees.avgSpreadPercent}%` : "—",
      hint: "Borrower ROI minus lender ROI (platform margin)",
      color: "#7c3aed",
      icon: "fas fa-percent",
    },
    {
      key: "cms",
      label: "CMS pending today",
      value: recon.totalPending != null ? money(recon.totalPending) : money(0),
      hint: "Bank payouts initiated but not confirmed",
      color: recon.totalPending > 0 ? "#dc2626" : "#64748b",
      icon: "fas fa-university",
    },
    {
      key: "deals",
      label: "Deals open / active / closed",
      value: `${number(deals.openForParticipationCount ?? deals.runningCount ?? 0)} / ${number(deals.activeLoanCount ?? 0)} / ${number(deals.borrowerClosedCount ?? 0)}`,
      hint: "Participation open · loan running · borrower closed",
      color: "#4f46e5",
      icon: "fas fa-layer-group",
    },
  ];
};

export const enrichDealForAdmin = (deal) => {
  const lenderRoi = Number(deal.lenderRoi ?? deal.rateOfInterest) || 0;
  let borrowerRoi = Number(deal.borrowerRoi ?? deal.borrowerRateOfInterest) || 0;
  if (!borrowerRoi && lenderRoi) {
    borrowerRoi = Math.min(3, Math.max(2.75, lenderRoi + 1.15));
  }
  const spread =
    deal.spreadPercent != null
      ? deal.spreadPercent
      : borrowerRoi && lenderRoi
        ? Math.round((borrowerRoi - lenderRoi) * 100) / 100
        : null;
  const stage = deal.lifecycleStage;
  const statusLabel =
    stage === "OPEN_FOR_PARTICIPATION" ? "Open" : stage === "ACTIVE_LOAN" ? "Active" : stage === "BORROWER_CLOSED" ? "Closed" : deal.lifecycleLabel || "—";
  return {
    ...deal,
    lenderRoi,
    borrowerRoi,
    spreadPercent: spread,
    statusLabel,
    fdAmount: deal.fdAmount ?? 0,
    borrowerFeesCollected: deal.borrowerFeesCollected ?? 0,
    platformProfitEstimate: deal.platformProfitEstimate ?? 0,
    riskLevel: deal.riskLevel || "OK",
    riskReason: deal.riskReason || "",
  };
};

export const buildAdminPriorities = (ctx) => {
  const kpis = ctx?.platform?.kpis || {};
  const recon = ctx?.reconciliation || {};
  const deals = ctx?.dealsSummary || {};
  const fees = mergeFeeSummary(ctx?.feeSummary, ctx?.borrowerSummary, kpis);
  const borrower = ctx?.borrowerSummary || {};
  const items = [];

  if (Number(recon.totalPending) > 0) {
    items.push({
      severity: "warning",
      icon: "fas fa-university",
      title: `CMS pending ${money(recon.totalPending)}`,
      detail: "Confirm bank payouts in CMS Reconciliation.",
      module: "cms-reconciliation",
    });
  }
  if (Number(recon.totalFailed) > 0) {
    items.push({
      severity: "warning",
      icon: "fas fa-circle-xmark",
      title: `CMS failed ${money(recon.totalFailed)}`,
      detail: "Failed payouts need admin action today.",
      module: "cms-reconciliation",
    });
  }
  const openDeals = deals.openForParticipationCount ?? deals.runningCount ?? 0;
  if (openDeals > 0) {
    items.push({
      severity: "primary",
      icon: "fas fa-door-open",
      title: `${number(openDeals)} deal(s) accepting participation`,
      detail: "Check fill % and participation end dates.",
      module: "deals-directory",
    });
  }
  if ((deals.activeLoanCount ?? 0) > 0) {
    items.push({
      severity: "success",
      icon: "fas fa-chart-line",
      title: `${number(deals.activeLoanCount)} active loan(s)`,
      detail: "Review upcoming interest payouts and borrower status.",
      module: "view-payments",
    });
  }
  const idle = Number(kpis.totalWalletBalance) || 0;
  if (idle >= 300000) {
    items.push({
      severity: "info",
      icon: "fas fa-wallet",
      title: `${money(idle)} in lender wallets`,
      detail: "Capital ready for the next deal launch.",
      module: "deal-intelligence",
    });
  }
  if (fees.avgSpreadPercent != null && fees.avgSpreadPercent < 0.55) {
    items.push({
      severity: "warning",
      icon: "fas fa-percent",
      title: `Low avg spread (${fees.avgSpreadPercent}%)`,
      detail: "Review deal ROIs in Deal ROI Board.",
      module: "deal-roi-board",
    });
  }
  if ((borrower.negativeFdCount ?? 0) > 0) {
    items.push({
      severity: "warning",
      icon: "fas fa-clock",
      title: `${number(borrower.negativeFdCount)} overdue borrower FD(s)`,
      detail: "Validity passed — review payment uploads or close FD.",
      module: "borrower-accounts",
    });
  }
  if ((borrower.pendingFeeReviewCount ?? 0) > 0) {
    items.push({
      severity: "warning",
      icon: "fas fa-receipt",
      title: `${number(borrower.pendingFeeReviewCount)} borrower fee(s) pending review`,
      detail: "Review fee amounts and invoices in Borrower Accounts.",
      module: "borrower-accounts",
    });
  }
  const riskDeals = ctx?.dealIntelligence?.riskDeals?.length ?? fees.riskDealCount ?? 0;
  if (riskDeals > 0) {
    items.push({
      severity: "warning",
      icon: "fas fa-triangle-exclamation",
      title: `${number(riskDeals)} running deal(s) flagged at risk`,
      detail: "Overdue FD, thin spread, or low fill — review Deal board.",
      module: "deal-intelligence",
    });
  }
  if (items.length === 0) {
    items.push({
      severity: "muted",
      icon: "fas fa-check",
      title: "No urgent items",
      detail: "Open a module below for detailed numbers.",
      module: null,
    });
  }
  return items;
};

const PRIORITY_MAP = {
  warning: "high",
  primary: "medium",
  success: "info",
  info: "info",
  muted: "info",
};

/** Group alerts into critical / high / medium / info for report page */
export const buildAdminPrioritiesByTier = (ctx) => {
  const items = buildAdminPriorities(ctx);
  const tiers = { critical: [], high: [], medium: [], info: [] };

  items.forEach((item) => {
    let tier = PRIORITY_MAP[item.severity] || "info";
    const title = (item.title || "").toLowerCase();
    if (title.includes("failed") || title.includes("overdue")) tier = "critical";
    else if (title.includes("pending") && title.includes("cms")) tier = "critical";
    else if (item.severity === "warning" && title.includes("cms")) tier = "critical";
    tiers[tier].push(item);
  });

  return tiers;
};

export const buildSpreadSnapshot = (fees = {}, kpis = {}) => ({
  lenderMin: 1.4,
  lenderMax: 2.1,
  borrowerMin: 2.75,
  borrowerMax: 3.0,
  avgLenderRoi: fees.avgLenderRoi ?? null,
  avgBorrowerRoi: fees.avgBorrowerRoi ?? null,
  avgSpread: fees.avgSpreadPercent ?? null,
  borrowerFees: fees.borrowerFeesCollected ?? 0,
  interestPaid: fees.lenderInterestPaid ?? kpis.allTimeInterestPaid ?? 0,
  principalReturned: fees.lenderPrincipalReturned ?? kpis.allTimePrincipalReturned ?? 0,
});

/** Normalize POST /fd-statistics response (BigInteger may arrive as number or string). */
export const normalizeFdStatistics = (raw) => {
  if (!raw) return null;
  const data = raw.data || raw;
  const n = (v) => {
    if (v == null) return 0;
    if (typeof v === "number") return v;
    if (typeof v === "string") return Number(v) || 0;
    if (typeof v === "object" && v != null && typeof v.toString === "function") return Number(v.toString()) || 0;
    return 0;
  };
  const valueOfFd = n(data.valueOfFd);
  const noOfActiveFdsAmount = n(data.noOfActiveFdsAmount);
  const noOfFdsDone = n(data.noOfFdsDone);
  const noOfActiveFds = n(data.noOfActiveFds);
  const noOfClosedFds = Math.max(0, noOfFdsDone - noOfActiveFds);
  const closedFdAmount = Math.max(0, valueOfFd - noOfActiveFdsAmount);
  const amountReceivedToHdfc = n(data.amountReceivedToHdfc);
  const amountReceivedToIcici = n(data.amountReceivedToIcici);
  const totalFdClosedInterest = n(data.totalFdClosedInterest);
  const totalBankReceived = amountReceivedToHdfc + amountReceivedToIcici;
  const activePct = valueOfFd > 0 ? Math.round((noOfActiveFdsAmount / valueOfFd) * 100) : 0;
  return {
    noOfFdsDone,
    valueOfFd,
    noOfActiveFds,
    noOfActiveFdsAmount,
    noOfClosedFds,
    closedFdAmount,
    totalFdClosedInterest,
    amountReceivedToHdfc,
    amountReceivedToIcici,
    totalBankReceived,
    activePct,
    hasData: noOfFdsDone > 0 || valueOfFd > 0 || totalBankReceived > 0,
  };
};

/** Snapshot for UI — official LoanServiceImpl.fdStatistics (fd_created IS NOT NULL). */
export const buildFdStatisticsSnapshot = (raw) => normalizeFdStatistics(raw);

/** Merge official fdStatistics into borrower summary — FD fields come from API when available. */
export const enrichBorrowerWithFdStatistics = (borrowerSummary = {}, fdStatsRaw = null, fdError = null) => {
  const base = borrowerSummary || {};
  if (fdStatsRaw == null && !fdError) return base;
  const fd = normalizeFdStatistics(fdStatsRaw);
  if (!fd?.hasData && !fdError) return base;
  return {
    ...base,
    totalFdAmount: fd?.valueOfFd ?? base.totalFdAmount,
    runningFdAmount: fd?.noOfActiveFdsAmount ?? base.runningFdAmount,
    closedFdAmount: fd?.closedFdAmount ?? base.closedFdAmount,
    runningFdCount: fd?.noOfActiveFds ?? base.runningFdCount,
    activeBorrowerAccounts: fd?.noOfActiveFds ?? base.activeBorrowerAccounts,
    closedBorrowerAccounts: fd?.noOfClosedFds ?? base.closedBorrowerAccounts,
    totalFdInterestEarned: fd?.totalFdClosedInterest ?? base.totalFdInterestEarned,
    amountReceivedToHdfc: fd?.amountReceivedToHdfc ?? base.amountReceivedToHdfc,
    amountReceivedToIcici: fd?.amountReceivedToIcici ?? base.amountReceivedToIcici,
    noOfFdsDone: fd?.noOfFdsDone,
    fdStatistics: fd,
    fdStatisticsSource: fd?.hasData ? "fd-statistics-api" : base.fdStatisticsSource,
    fdStatisticsError: fdError || base.fdStatisticsError,
  };
};

/** Running vs closed totals — FD amounts from fdStatistics API when available. */
export const buildBorrowerLifecycleSnapshot = (borrowerSummary = {}) => {
  const fdStats = borrowerSummary.fdStatistics;
  const fromOfficialFd = borrowerSummary.fdStatisticsSource === "fd-statistics-api" && fdStats?.hasData;
  const runningFd = fromOfficialFd
    ? fdStats.noOfActiveFdsAmount
    : Number(borrowerSummary.runningFdAmount) || 0;
  const closedFd = fromOfficialFd
    ? fdStats.closedFdAmount
    : Number(borrowerSummary.closedFdAmount) || 0;
  const runningFees = Number(borrowerSummary.runningBorrowerFees) || 0;
  const closedFees = Number(borrowerSummary.closedBorrowerFees) || 0;
  const accounts = borrowerSummary.recentAccounts || [];
  const feeFromAccounts = accounts.reduce((s, a) => s + (Number(a.borrowerFee) || 0), 0);
  const fdFromAccounts = accounts.reduce((s, a) => s + (Number(a.fdAmount) || 0), 0);
  const totalFees =
    Number(borrowerSummary.totalBorrowerFees) ||
    (runningFees + closedFees > 0 ? runningFees + closedFees : feeFromAccounts);
  const totalFd = fromOfficialFd
    ? fdStats.valueOfFd
    : Number(borrowerSummary.totalFdAmount) ||
      (runningFd + closedFd > 0 ? runningFd + closedFd : fdFromAccounts);
  const disbursedFromAccounts = accounts.reduce(
    (s, a) => s + (Number(a.fdAmountFromSystem ?? a.systemPaymentsTotal) || 0),
    0
  );
  return {
    runningCount: fromOfficialFd
      ? fdStats.noOfActiveFds
      : fdStats?.noOfActiveFds ?? borrowerSummary.runningFdCount ?? borrowerSummary.activeBorrowerAccounts ?? 0,
    closedCount: fromOfficialFd
      ? fdStats.noOfClosedFds
      : fdStats?.noOfClosedFds ?? borrowerSummary.closedBorrowerAccounts ?? 0,
    totalFdCount: fromOfficialFd ? fdStats.noOfFdsDone : borrowerSummary.noOfFdsDone,
    overdueCount: borrowerSummary.negativeFdCount ?? 0,
    runningFdAmount: runningFd,
    closedFdAmount: closedFd,
    totalFdAmount: totalFd,
    runningBorrowerFees: runningFees,
    closedBorrowerFees: closedFees,
    totalBorrowerFees: totalFees,
    avgBorrowerRoi: borrowerSummary.avgBorrowerRoi > 0 ? borrowerSummary.avgBorrowerRoi : null,
    fdInterestEarned: fromOfficialFd
      ? fdStats.totalFdClosedInterest
      : Number(borrowerSummary.totalFdInterestEarned) || 0,
    amountReceivedToHdfc: fromOfficialFd
      ? fdStats.amountReceivedToHdfc
      : Number(borrowerSummary.amountReceivedToHdfc ?? fdStats?.amountReceivedToHdfc) || 0,
    amountReceivedToIcici: fromOfficialFd
      ? fdStats.amountReceivedToIcici
      : Number(borrowerSummary.amountReceivedToIcici ?? fdStats?.amountReceivedToIcici) || 0,
    totalBankReceived: fromOfficialFd
      ? fdStats.totalBankReceived
      : (Number(borrowerSummary.amountReceivedToHdfc) || 0) + (Number(borrowerSummary.amountReceivedToIcici) || 0),
    fdSource: fromOfficialFd ? "fd-statistics-api" : null,
    disbursed:
      Number(borrowerSummary.totalFdFromSystem || borrowerSummary.totalSystemPayments) ||
      disbursedFromAccounts ||
      0,
  };
};

/**
 * Platform economics — separate borrower side, lender side, and platform profit.
 * Do NOT subtract all-time lender interest from borrower fees (different scale & pass-through).
 */
export const estimateBorrowerFdInterest = (borrowerSummary = {}, borrowerLife = {}) => {
  const recorded =
    Number(borrowerSummary.totalFdInterestEarned) ||
    borrowerLife.fdInterestEarned ||
    0;
  const accounts = borrowerSummary.recentAccounts || [];
  const fromRows = accounts.reduce((s, a) => s + (Number(a.interestEarnedOnFd) || 0), 0);
  const totalRecorded = recorded || fromRows;
  const avgRoi = borrowerSummary.avgBorrowerRoi > 0 ? borrowerSummary.avgBorrowerRoi : 2.85;
  const runningFd = borrowerLife.runningFdAmount || Number(borrowerSummary.runningFdAmount) || 0;
  const estAnnualOnRunningFd = Math.round((runningFd * avgRoi) / 100);
  const fromFdApi = borrowerSummary.fdStatisticsSource === "fd-statistics-api";
  return {
    recorded: totalRecorded,
    estAnnualOnRunningFd,
    avgBorrowerRoi: avgRoi,
    runningFdAmount: runningFd,
    note:
      fromFdApi && totalRecorded > 0
        ? "Closed FD interest from fdStatistics API (interest_earned_on_fd on CLOSED rows)."
        : totalRecorded > 0
          ? "Recorded interest_earned_on_fd from borrower_payments."
          : `Estimate: running FD × ${avgRoi}% ROI (annual on FD principal).`,
  };
};

export const buildPlatformPlSnapshot = (ctx) => {
  const fees = mergeFeeSummary(ctx?.feeSummary, ctx?.borrowerSummary, ctx?.platform?.kpis);
  const borrower = buildBorrowerLifecycleSnapshot(ctx?.borrowerSummary);
  const dealRows = ctx?.dealRows || ctx?.dealIntelligence?.runningDeals || [];
  const borrowerFd = estimateBorrowerFdInterest(ctx?.borrowerSummary, borrower);

  const totalEstDealProfit = dealRows.reduce((s, d) => s + (Number(d.platformProfitEstimate) || 0), 0);
  const estSpreadProfit = dealRows.reduce((s, d) => {
    const total = Number(d.platformProfitEstimate) || 0;
    const feePart = Number(d.borrowerFeesCollected) || 0;
    return s + Math.max(0, total - feePart);
  }, 0);
  const lenderInterestOnRunningDeals = dealRows.reduce(
    (s, d) => s + (Number(d.interestPaidToLenders) || 0),
    0
  );

  const borrowerFees = fees.borrowerFeesCollected;
  const lenderInterestAllTime = fees.lenderInterestPaid;
  const platformCashRevenue = borrowerFees;
  const platformSpreadMargin = estSpreadProfit;
  const totalPlatformProfit = totalEstDealProfit || platformCashRevenue + platformSpreadMargin;

  return {
    borrowerFees,
    runningBorrowerFees: borrower.runningBorrowerFees,
    closedBorrowerFees: borrower.closedBorrowerFees,
    runningFdAmount: borrower.runningFdAmount,
    closedFdAmount: borrower.closedFdAmount,
    borrowerFdInterestRecorded: borrowerFd.recorded,
    borrowerFdInterestEstAnnual: borrowerFd.estAnnualOnRunningFd,
    borrowerFdInterestNote: borrowerFd.note,
    avgBorrowerRoi: borrowerFd.avgBorrowerRoi,
    avgLenderRoi: fees.avgLenderRoi,
    avgSpread: fees.avgSpreadPercent,
    interestPaidToLenders: lenderInterestAllTime,
    lenderInterestOnRunningDeals,
    principalReturnedToLenders: fees.lenderPrincipalReturned,
    estSpreadProfitFromDeals: estSpreadProfit,
    platformCashRevenue,
    platformSpreadMargin,
    totalEstPlatformProfit: totalPlatformProfit,
    dealCountWithProfit: dealRows.filter((d) => Number(d.platformProfitEstimate) > 0).length,
  };
};

export const ADMIN_METRIC_HELP = {
  fdAmount:
    "FD amount (fd_amount) — principal the borrower keeps in a fixed deposit as loan collateral. Official totals from fdStatistics API (rows where fd_created is set).",
  fdStatistics:
    "fdStatistics — LoanServiceImpl.fdStatistics: counts and sums from borrower_payments with fd_created, split by fd_status (active vs CLOSED), plus approved repayment uploads to HDFC/ICICI.",
  borrowerFee:
    "Borrower fee (borrower_fee) — one-time platform fee charged to the borrower on that loan row in borrower_payments.",
  borrowerRoi:
    "Borrower ROI (roi) — annual rate the borrower earns on their FD while the loan runs. Platform spread = borrower ROI minus lender ROI.",
  disbursed:
    "Disbursed (amount) — money OxyLoans transferred to the borrower from the system for that payment row.",
  runningClosed:
    "Running vs closed — split by fd_status in borrower_payments. Closed FDs still count fees and FD totals in the closed bucket.",
  estProfit:
    "Est. profit per deal = borrower fees on that deal + spread margin (participation × spread% × months running). Not audited P&L.",
  platformProfit:
    "Platform profit = borrower fees (cash kept) + spread margin on live deals. Lender interest is paid from deal economics — do not subtract all-time lender interest from fees.",
  borrowerFdInterest:
    "Borrower FD interest — what borrowers earn on fd_amount at their ROI (interest_earned_on_fd). This is borrower benefit on collateral, not cash paid by platform from fees.",
  lenderInterest:
    "Lender interest — cumulative payouts to lenders from lenders_returns. Pass-through on participation; shown separately from platform revenue.",
  walletCredit:
    "Credit (transactiontype=credit) — money IN to lender_scrow_wallet: bank/CMS load (deal_id=0) + returns from deals (deal_id>0).",
  walletDebit:
    "Debit (transactiontype=debit) — money OUT: withdrawal (withdrawfundsid>0) or participation/other debits.",
  walletBalance: "Balance = SUM(credit) − SUM(debit) for APPROVED wallet rows (all lenders, non-test users).",
};

export const buildCapitalSnapshot = (ctx) => {
  const kpis = ctx?.platform?.kpis || {};
  const wallet = ctx?.walletSummary || {};
  const overview = ctx?.overview || {};
  const fees = ctx?.feeSummary || {};
  const totalInvested =
    Number(wallet.totalParticipatedInDeals) ||
    Number(fees.activeParticipationAmount || kpis.totalInvested || overview.totalInvestment) ||
    0;
  const deployed = Number(wallet.activeInLiveDeals || kpis.activeDealsAmount) || 0;
  const idle = Number(wallet.currentBalance ?? kpis.totalWalletBalance) || 0;
  const deployPct = totalInvested > 0 ? Math.round((deployed / totalInvested) * 100) : 0;
  return {
    totalInvested,
    deployed,
    idle,
    deployPct,
    interestPaid: Number(fees.lenderInterestPaid || kpis.allTimeInterestPaid) || 0,
    principalReturned: Number(fees.lenderPrincipalReturned || kpis.allTimePrincipalReturned) || 0,
    activeLenders: overview.activeLenderCount,
    suggestedLaunchSize: idle > 0 ? Math.round(Math.min(Math.max(idle * 0.25, 500000), 10000000)) : 0,
  };
};

/** Wallet flow tiles + chart items from lender_scrow_wallet summary */
export const buildWalletFlowSnapshot = (walletSummary = {}, kpis = {}) => {
  const w = walletSummary || {};
  const totalDebited = Number(w.totalDebited) || 0;
  const currentBalance = Number(w.currentBalance ?? kpis.totalWalletBalance) || 0;
  const totalCredited = Number(w.totalCredited) || (currentBalance + totalDebited > 0 ? currentBalance + totalDebited : 0);
  const totalLoaded = Number(w.totalLoadedToWallet) || 0;
  const totalParticipated = Number(w.totalParticipatedInDeals ?? kpis.totalInvested) || 0;
  const activeInDeals = Number(w.activeInLiveDeals ?? kpis.activeDealsAmount) || 0;
  const totalWithdrawn = Number(w.totalWithdrawn) || 0;
  const totalReturned = Number(w.totalReturnedFromDeals) || 0;
  const principalReturned = Number(w.principalReturnedToWallet) || 0;
  const interestReturned = Number(w.interestReturnedToWallet) || 0;
  const otherDebits = Number(w.otherDebits) || Math.max(0, totalDebited - totalWithdrawn);

  return {
    currentBalance,
    totalCredited,
    totalLoaded,
    totalDebited,
    totalParticipated,
    activeInDeals,
    totalWithdrawn,
    totalReturnedFromDeals: totalReturned,
    principalReturned,
    interestReturned,
    otherDebits,
    creditTransactionCount: Number(w.creditTransactionCount) || 0,
    debitTransactionCount: Number(w.debitTransactionCount) || 0,
    lendersWithWallet: Number(w.lendersWithWallet) || 0,
    creditDebitItems: [
      { label: "Total credited (IN)", value: totalCredited, color: "#22c55e" },
      { label: "Total debited (OUT)", value: totalDebited, color: "#ef4444" },
      { label: "Balance now", value: currentBalance, color: "#d97706" },
    ].filter((i) => Number(i.value) > 0),
    debitSplitItems: [
      { label: "Withdrawn", value: totalWithdrawn, color: "#f97316" },
      { label: "Other debits (participation)", value: otherDebits, color: "#94a3b8" },
    ].filter((i) => Number(i.value) > 0),
    creditSplitItems: [
      { label: "Loaded from bank/CMS", value: totalLoaded, color: "#22c55e" },
      { label: "Returned from deals", value: totalReturned, color: "#3b82f6" },
    ].filter((i) => Number(i.value) > 0),
    flowChartItems: [
      { label: "Loaded to wallet", value: totalLoaded, color: "#22c55e" },
      { label: "Returned from deals", value: totalReturned, color: "#3b82f6" },
      { label: "Participated in deals", value: totalParticipated, color: "#6366f1" },
      { label: "In live deals", value: activeInDeals, color: "#0891b2" },
      { label: "Withdrawn", value: totalWithdrawn, color: "#f97316" },
      { label: "Other debits", value: otherDebits, color: "#94a3b8" },
      { label: "Balance now", value: currentBalance, color: "#d97706" },
    ],
  };
};

/** Which deals to launch, why, and how to grow profit */
export const buildDealLaunchGuide = (ctx) => {
  const wallet = buildWalletFlowSnapshot(ctx?.walletSummary, ctx?.platform?.kpis);
  const overview = ctx?.overview || {};
  const fees = mergeFeeSummary(ctx?.feeSummary, ctx?.borrowerSummary, ctx?.platform?.kpis);
  const launch = ctx?.dealIntelligence?.launchSuggestion;
  const capital = buildCapitalSnapshot(ctx);

  const mix = [
    { type: "Monthly", value: overview.totalMonthlyParticipations, why: "Faster lender liquidity; good when wallet is high and you need quick deployment." },
    { type: "Quarterly", value: overview.totalQuarterlyParticipations, why: "Balance of participation speed and admin workload." },
    { type: "Half-yearly", value: overview.totalHalfYearlyParticipations, why: "Larger tickets; use when borrower FD tenure is longer." },
    { type: "Yearly", value: overview.totalYearlyParticipations, why: "Maximum deployment per deal; best when spread is healthy and fill is confident." },
  ].filter((m) => Number(m.value) > 0);
  const topMix = mix.sort((a, b) => Number(b.value) - Number(a.value))[0];

  const whyLaunch = [];
  if (wallet.currentBalance >= 300000) {
    whyLaunch.push(`${money(wallet.currentBalance)} sitting idle in lender wallets — not earning spread until a new deal opens.`);
  }
  if (launch?.maturingPrincipalNext30Days > 0) {
    whyLaunch.push(`${money(launch.maturingPrincipalNext30Days)} principal matures in 30 days — redeploy before lenders withdraw.`);
  }
  if ((ctx?.dealsSummary?.openForParticipationCount ?? 0) === 0) {
    whyLaunch.push("No deal open for participation — lenders cannot deploy new money right now.");
  }
  if (whyLaunch.length === 0) {
    whyLaunch.push("Launch when wallet idle grows or a strong borrower pipeline is ready — each new loan collects borrower_fee + spread.");
  }

  return {
    suggestedSize: launch?.suggestedDealSize || capital.suggestedLaunchSize,
    suggestedLenderRoi: launch?.suggestedLenderRoiMin != null
      ? `${launch.suggestedLenderRoiMin}–${launch.suggestedLenderRoiMax}%`
      : "1.4–2.1%",
    suggestedBorrowerRoi: launch?.suggestedBorrowerRoi ?? 2.85,
    rationale: launch?.rationale,
    whyLaunch,
    roiBands: {
      lender: "1.4% – 2.1% (what lenders earn on participation)",
      borrower: "2.75% – 3.0% (what borrower earns on FD collateral)",
      spread: "0.65% – 1.2% target (borrower ROI − lender ROI = platform margin)",
      currentAvgSpread: fees.avgSpreadPercent,
    },
    preferredDealType: topMix?.type || "Monthly",
    preferredDealWhy: topMix?.why || "Match deal payout frequency to how your lenders usually participate.",
    increaseProfit: [
      "Collect borrower_fee on every new borrower_payments row before disbursement.",
      "Keep spread ≥ 0.65%: borrower ROI ~2.75–3%, lender ROI ~1.4–2.1%.",
      "Launch deals when wallet idle > ₹5L so participation fills faster.",
      "Close overdue FDs on time — delays block principal return and new launches.",
      "Prefer deal types your lenders already use (" + (topMix?.type || "monthly") + " participation is strongest).",
    ],
  };
};

/** P&L chart rows + admin actions for higher platform profit */
export const buildAdminProfitPlaybook = (ctx) => {
  const pl = buildPlatformPlSnapshot(ctx);
  const fees = mergeFeeSummary(ctx?.feeSummary, ctx?.borrowerSummary, ctx?.platform?.kpis);
  const wallet = buildWalletFlowSnapshot(ctx?.walletSummary, ctx?.platform?.kpis);
  const borrower = buildBorrowerLifecycleSnapshot(ctx?.borrowerSummary);
  const launchGuide = buildDealLaunchGuide(ctx);
  const launch = ctx?.dealIntelligence?.launchSuggestion;

  const borrowerSideItems = [
    { label: "Borrower fees (platform cash)", value: pl.borrowerFees, color: "#2563eb" },
    { label: "Running borrower fees", value: pl.runningBorrowerFees, color: "#3b82f6" },
    { label: "Closed borrower fees", value: pl.closedBorrowerFees, color: "#6366f1" },
    {
      label: pl.borrowerFdInterestRecorded > 0 ? "Closed FD interest" : "FD interest (est. annual)",
      value: pl.borrowerFdInterestRecorded || pl.borrowerFdInterestEstAnnual,
      color: "#10b981",
    },
    { label: "Running FD principal", value: pl.runningFdAmount, color: "#059669" },
    { label: "Closed FD principal", value: pl.closedFdAmount, color: "#64748b" },
  ].filter((i) => Number(i.value) > 0);
  if (borrower.totalBankReceived > 0) {
    borrowerSideItems.push(
      { label: "HDFC repayments received", value: borrower.amountReceivedToHdfc, color: "#004c8f" },
      { label: "ICICI repayments received", value: borrower.amountReceivedToIcici, color: "#f58220" }
    );
  }

  const lenderSideItems = [
    { label: "Interest paid to lenders (all-time)", value: pl.interestPaidToLenders, color: "#f97316" },
    { label: "Interest on running deals", value: pl.lenderInterestOnRunningDeals, color: "#fb923c" },
    { label: "Principal returned to lenders", value: pl.principalReturnedToLenders, color: "#94a3b8" },
  ].filter((i) => Number(i.value) > 0);

  const platformProfitItems = [
    { label: "Borrower fees (kept)", value: pl.platformCashRevenue, color: "#2563eb" },
    { label: "Est. spread margin", value: pl.platformSpreadMargin, color: "#059669" },
    { label: "Total est. platform profit", value: pl.totalEstPlatformProfit, color: "#7c3aed" },
  ].filter((i) => Number(i.value) > 0);

  const borrowerSplitItems = [
    { label: "Running FD", value: borrower.runningFdAmount, color: "#10b981" },
    { label: "Closed FD", value: borrower.closedFdAmount, color: "#64748b" },
    { label: "Running fees", value: borrower.runningBorrowerFees, color: "#3b82f6" },
    { label: "Closed fees", value: borrower.closedBorrowerFees, color: "#6366f1" },
  ].filter((i) => Number(i.value) > 0);

  const actions = [];

  if (wallet.currentBalance >= 500000) {
    actions.push({
      icon: "fas fa-rocket",
      title: `Deploy idle wallet ${money(wallet.currentBalance)}`,
      detail: launch?.rationale || `Launch a deal (~${money(launchGuide.suggestedSize)}) so lenders participate instead of leaving cash idle.`,
      module: "deal-intelligence",
    });
  }
  if (fees.avgSpreadPercent != null && fees.avgSpreadPercent < 0.7) {
    actions.push({
      icon: "fas fa-percent",
      title: "Widen ROI spread on new deals",
      detail: `Avg spread ${fees.avgSpreadPercent}% — target borrower 2.75–3% vs lender 1.4–2.1% for healthy margin.`,
      module: "deal-roi-board",
    });
  }
  if ((ctx?.borrowerSummary?.pendingFeeReviewCount ?? 0) > 0) {
    actions.push({
      icon: "fas fa-receipt",
      title: "Clear pending borrower fees",
      detail: `${ctx.borrowerSummary.pendingFeeReviewCount} fee(s) need invoice/review — fee is platform cash revenue.`,
      module: "borrower-accounts",
    });
  }
  if ((ctx?.borrowerSummary?.negativeFdCount ?? 0) > 0) {
    actions.push({
      icon: "fas fa-clock",
      title: "Fix overdue borrower FDs",
      detail: "Overdue FDs delay closures and block clean principal return cycles.",
      module: "borrower-accounts",
    });
  }
  if ((ctx?.dealIntelligence?.riskDeals?.length ?? 0) > 0) {
    actions.push({
      icon: "fas fa-triangle-exclamation",
      title: "Review at-risk deals",
      detail: "Thin spread or low fill reduces est. spread profit on running book.",
      module: "deal-intelligence",
    });
  }
  if (wallet.totalWithdrawn > wallet.totalLoaded * 0.4 && wallet.totalLoaded > 0) {
    actions.push({
      icon: "fas fa-wallet",
      title: "High withdrawal ratio",
      detail: "Lenders withdrawing faster than loading — improve deal pipeline and payout reliability.",
      module: "capital-liquidity",
    });
  }
  if (actions.length === 0) {
    actions.push({
      icon: "fas fa-check-circle",
      title: "Book looks healthy",
      detail: "Monitor spread, launch deals when wallet idle, and collect borrower fees on every new loan.",
      module: null,
    });
  }

  return {
    pl,
    fees,
    borrower,
    wallet,
    launchGuide,
    borrowerSideItems,
    lenderSideItems,
    platformProfitItems,
    borrowerSplitItems,
    actions,
    theory: [
      "Borrower side: borrower_fee is one-time cash to OxyLoans; borrower earns ROI on fd_amount (FD interest) as collateral benefit.",
      "Lender side: lenders earn ROI on participation — interest paid via lenders_returns (shown separately, all-time total).",
      "Platform profit = borrower fees collected + spread margin on live deals (borrower ROI − lender ROI × deployed amount × time).",
      "Never compare borrower fees to all-time lender interest as one line — different pools and scales; lender interest is pass-through on participation.",
    ],
  };
};
