/**
 * Static demo data for AI Admin Dashboard (offline / fallback).
 */

const wrap = (displayName, resource, data) => ({
  displayName,
  resource,
  generatedAt: new Date().toISOString(),
  apiVersion: "static-demo-v1",
  data,
});

export const STATIC_DB_HEALTH = {
  status: "demo",
  message: "Static demo mode — no live database connection",
  source: "static-demo",
};

const STATIC_KPIS = {
  fyLabel: "FY 2025-26",
  fyYear: 2025,
  fyInterestPaid: 34233785,
  fyPrincipalReturned: 128000000,
  fyTotalDisbursed: 162233785,
  fyLendersPaid: 420,
  totalInvested: 520000000,
  totalLenders: 890,
  totalDeals: 1169,
  p2pDeals: 980,
  equityDeals: 189,
  activeDeals: 145,
  closedDeals: 1024,
  totalWalletBalance: 8500000,
};

const STATIC_USERS = {
  total: 1250,
  lenders: 890,
  borrowers: 360,
  newLast30Days: 42,
  newLast7Days: 11,
};

const STATIC_TOP_LENDERS = [
  { name: "Demo Lender One", userId: 12001, totalInvested: 38245566, dealCount: 28, fyInterestEarned: 420000 },
  { name: "Demo Lender Two", userId: 12002, totalInvested: 29500000, dealCount: 22, fyInterestEarned: 310000 },
  { name: "Demo Lender Three", userId: 12003, totalInvested: 22100000, dealCount: 18, fyInterestEarned: 275000 },
];

const STATIC_TOP_DEALS = [
  { dealId: 501, dealName: "Demo Running Deal", status: "RUNNING", volume: 15000000, lenderCount: 45, roi: "18%" },
  { dealId: 502, dealName: "Demo Closed Deal", status: "CLOSED", volume: 12000000, lenderCount: 38, roi: "16%" },
];

const STATIC_MONTHLY_TREND = [
  { monthLabel: "Apr 25", interestPaid: 2800000, principalReturned: 9000000, totalPaid: 11800000, lendersCount: 120 },
  { monthLabel: "May 25", interestPaid: 3100000, principalReturned: 9500000, totalPaid: 12600000, lendersCount: 125 },
  { monthLabel: "Jun 25", interestPaid: 30481967, principalReturned: 10200000, totalPaid: 40681967, lendersCount: 130 },
];

const STATIC_RECONCILIATION = {
  totalInitiated: 5000000,
  totalConfirmed: 4800000,
  totalPending: 150000,
  totalFailed: 50000,
  fullyReconciled: false,
  aiSummary: "Demo reconciliation summary.\nPending amount needs review.",
};

const STATIC_ACTIVE_LENDERS = [
  {
    lenderId: 12045,
    lenderName: "Rajesh Kumar",
    email: "rajesh.k@example.com",
    mobileNumber: "9876543210",
    state: "Telangana",
    city: "Hyderabad",
    totalParticipationAmount: 2850000,
  },
  {
    lenderId: 12046,
    lenderName: "Priya Sharma",
    email: "priya.s@example.com",
    mobileNumber: "9876543211",
    state: "Karnataka",
    city: "Bengaluru",
    totalParticipationAmount: 1920000,
  },
];

const STATIC_LENDER_RISK = {
  totalLenders: 890,
  highRiskCount: 12,
  mediumRiskCount: 85,
  lowRiskCount: 793,
};

export const buildStaticActiveLendersPage = (pageNo = 1, pageSize = 20) =>
  wrap("Active Lenders Table", "/static/active-lenders", {
    activeLenders: STATIC_ACTIVE_LENDERS.slice(0, pageSize),
    totalCount: STATIC_ACTIVE_LENDERS.length,
    totalInvestment: 4770000,
    pageNo,
    pageSize,
  });

export const buildStaticDashboardSections = (fy, includeRisk = false, activeLendersPage = 1, pageSize = 20) => {
  const kpis = { ...STATIC_KPIS, fyYear: fy || STATIC_KPIS.fyYear, fyLabel: fy ? `FY ${fy}-${String(fy + 1).slice(2)}` : STATIC_KPIS.fyLabel };
  const pageStart = (activeLendersPage - 1) * pageSize;

  const sections = {
    platformKpis: wrap("Platform KPIs", "/static/platform-kpis", { kpis }),
    userGrowth: wrap("User Growth", "/static/users", { users: STATIC_USERS }),
    topLenders: wrap("Top Lenders", "/static/top-lenders", { topLenders: STATIC_TOP_LENDERS }),
    topDeals: wrap("Top Deals", "/static/top-deals", { topDeals: STATIC_TOP_DEALS }),
    monthlyTrend: wrap("Monthly Payout Trend", "/static/monthly-trend", { monthlyTrend: STATIC_MONTHLY_TREND }),
    reconciliation: wrap("CMS Reconciliation", "/static/reconciliation", { reconciliation: STATIC_RECONCILIATION }),
    participationAmountInfo: wrap("Participation", "/static/participation", {
      participationAmounts: {
        totalMonthlyParticipations: 1200000,
        totalQuarterlyParticipations: 3500000,
        totalHalfYearlyParticipations: 2100000,
        totalYearlyParticipations: 8900000,
      },
    }),
    activeLendersSummary: wrap("Active Lenders", "/static/active-summary", {
      activeLenderCount: STATIC_ACTIVE_LENDERS.length,
      totalInvestment: 4770000,
      totalCurrentParticipation: 4770000,
    }),
    activeLenders: wrap("Active Lenders Table", "/static/active-lenders", {
      activeLenders: STATIC_ACTIVE_LENDERS.slice(pageStart, pageStart + pageSize),
      totalCount: STATIC_ACTIVE_LENDERS.length,
      totalInvestment: 4770000,
      pageNo: activeLendersPage,
      pageSize,
    }),
    _activeLendersFullList: null,
    _activeLendersTotalCount: STATIC_ACTIVE_LENDERS.length,
  };

  if (includeRisk) {
    sections.lenderRisk = wrap("Lender Risk", "/static/lender-risk", { lenderRisk: STATIC_LENDER_RISK });
  }

  return {
    sections,
    errors: [],
    loadTimeMs: 0,
    source: "static-demo",
    loadedAt: new Date().toISOString(),
  };
};
