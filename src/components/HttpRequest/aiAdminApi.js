import axios from "axios";
import { MARKETPLACE_URL, API_USER_URL, DEV_ADMIN_MOBILE, DEV_OTP, AI_DASHBOARD_USE_STATIC } from "../../config";
import { handlesenOtp, usersubmitotp } from "./beforelogin";
import {
  STATIC_DB_HEALTH,
  buildStaticDashboardSections,
  buildStaticActiveLendersPage,
} from "./aiAdminStaticData";
import { buildStaticPaymentsData } from "./paymentsStaticData";
import { mapDealRowToRecommendation, buildAiSummaryText } from "../pages/Oxyloans/Admin/adminIntelligenceHelpers";
import {
  categoryToLegacyDealType,
  enrichDealRow,
  filterDealsForCategory,
} from "../pages/Oxyloans/Admin/dealLifecycleHelpers";

const AI_USER_BASE = `${API_USER_URL}admin/ai/`;
const AI_BASE_URL = `${MARKETPLACE_URL}/v1/ai/`;
const DASHBOARD_LIVE_API = `${AI_BASE_URL}admin/dashboard-live`;
const DASHBOARD_OVERVIEW_API = `${AI_BASE_URL}admin/dashboard-live`;
const DASHBOARD_FY_STATS_API = `${AI_BASE_URL}admin/platform-stats`;
const AI_FY_STATS_API = `${AI_USER_BASE}fy-stats`;
const AI_ACTIVE_LENDERS_API = `${MARKETPLACE_URL}/v1/ai/admin/active-lenders`;
const DASHBOARD_LENDERS_API = `${API_USER_URL}admin/dashboard/lenders`;
const DASHBOARD_UPCOMING_INTEREST_API = `${API_USER_URL}admin/dashboard/upcoming-interest-payments`;
const AI_VIEW_PAYMENTS_API = `${API_USER_URL}admin/ai/view-payments`;
const DEALS_DIRECTORY_API = `${AI_USER_BASE}deals-directory`;
const DEALS_DIRECTORY_SUMMARY_API = `${AI_USER_BASE}deals-directory/summary`;
const LEGACY_DEALS_LIST_API = `${API_USER_URL}listOfDealsInformationForNormalDeals`;
export const DEALS_DIRECTORY_PAGE_SIZE = 10;

const bigIntToNumber = (value) => {
  if (value == null) return 0;
  return Number(value);
};

const mapLegacyDealRow = (deal) =>
  enrichDealRow({
    ...deal,
    dealPaticipatedAmount: bigIntToNumber(deal?.dealPaticipatedAmount),
    dealCurrentAmount: bigIntToNumber(deal?.dealCurrentAmount),
  });

const loadLegacyFilteredDealsPage = async (category, pageNo, pageSize) => {
  const headers = requireAuth();
  const fetchSize = Math.max(200, pageNo * pageSize);
  const res = await axios.post(
    LEGACY_DEALS_LIST_API,
    { pageNo: 1, pageSize: fetchSize, dealType: "CLOSED" },
    { headers, timeout: 180000 }
  );
  const payload = res.data || {};
  const all = (payload.listOfBorrowersDealsResponseDto || []).map(mapLegacyDealRow);
  const filtered = filterDealsForCategory(all, category);
  const from = (pageNo - 1) * pageSize;
  return {
    deals: filtered.slice(from, from + pageSize),
    totalCount: filtered.length,
    usedClientFilter: true,
  };
};

const wrapDealsDirectoryPayload = (data, source = "ai-api") => ({
  displayName: "Deals Directory",
  resource: source === "legacy" ? LEGACY_DEALS_LIST_API : DEALS_DIRECTORY_API,
  data,
});

const loadLegacyDealsCount = async (dealType) => {
  const headers = requireAuth();
  const res = await axios.post(
    LEGACY_DEALS_LIST_API,
    { pageNo: 1, pageSize: 1, dealType },
    { headers, timeout: 120000 }
  );
  return res.data?.count ?? 0;
};

const loadLegacyDealsDirectoryPage = async (category, pageNo, pageSize) => {
  const headers = requireAuth();
  const dealType = categoryToLegacyDealType(category);
  const [
    openForParticipationCount,
    activeLoanCount,
    borrowerClosedCount,
    listRes,
  ] = await Promise.all([
    loadLegacyDealsCount("RUNNING").catch(() => 0),
    loadLegacyDealsCount("ACTIVE_LOAN").catch(() => null),
    loadLegacyDealsCount("BORROWER_CLOSED").catch(() => null),
    (async () => {
      if (category === "ACTIVE_LOAN" || category === "BORROWER_CLOSED") {
        try {
          const res = await axios.post(
            LEGACY_DEALS_LIST_API,
            { pageNo, pageSize, dealType },
            { headers, timeout: 180000 }
          );
          const rows = (res.data?.listOfBorrowersDealsResponseDto || []).map(mapLegacyDealRow);
          const filtered = filterDealsForCategory(rows, category);
          if (filtered.length > 0 || (res.data?.count ?? 0) === 0) {
            return { deals: filtered, totalCount: res.data?.count ?? filtered.length };
          }
        } catch (_) {
          /* client filter fallback */
        }
        return loadLegacyFilteredDealsPage(category, pageNo, pageSize);
      }
      const res = await axios.post(
        LEGACY_DEALS_LIST_API,
        { pageNo, pageSize, dealType },
        { headers, timeout: 180000 }
      );
      const rows = (res.data?.listOfBorrowersDealsResponseDto || []).map(mapLegacyDealRow);
      return { deals: rows, totalCount: res.data?.count ?? rows.length };
    })(),
  ]);

  let resolvedActive = activeLoanCount;
  let resolvedClosed = borrowerClosedCount;
  if (resolvedActive == null || resolvedClosed == null) {
    try {
      const achieved = await loadLegacyDealsCount("CLOSED");
      if (resolvedActive == null && resolvedClosed == null) {
        resolvedActive = achieved;
        resolvedClosed = 0;
      } else if (resolvedActive == null) {
        resolvedActive = Math.max(0, achieved - (resolvedClosed || 0));
      } else {
        resolvedClosed = Math.max(0, achieved - (resolvedActive || 0));
      }
    } catch (_) {
      resolvedActive = resolvedActive ?? 0;
      resolvedClosed = resolvedClosed ?? 0;
    }
  }

  const deals = listRes.deals || [];
  return wrapDealsDirectoryPayload(
    {
      category,
      pageNo,
      pageSize,
      totalCount: listRes.totalCount ?? deals.length,
      openForParticipationCount,
      activeLoanCount: resolvedActive,
      borrowerClosedCount: resolvedClosed,
      runningCount: openForParticipationCount,
      participationClosedCount: (resolvedActive || 0) + (resolvedClosed || 0),
      deals,
      legacyResource: LEGACY_DEALS_LIST_API,
      loadTimeMs: null,
      source: "legacy",
      usedClientFilter: listRes.usedClientFilter || false,
    },
    "legacy"
  );
};

const loadLegacyDealsDirectorySummary = async () => {
  const [openForParticipationCount, activeLoanCount, borrowerClosedCount] = await Promise.all([
    loadLegacyDealsCount("RUNNING").catch(() => 0),
    loadLegacyDealsCount("ACTIVE_LOAN").catch(() => null),
    loadLegacyDealsCount("BORROWER_CLOSED").catch(() => null),
  ]);
  let resolvedActive = activeLoanCount;
  let resolvedClosed = borrowerClosedCount;
  if (resolvedActive == null || resolvedClosed == null) {
    try {
      const achieved = await loadLegacyDealsCount("CLOSED");
      if (resolvedActive == null && resolvedClosed == null) {
        resolvedActive = achieved;
        resolvedClosed = 0;
      } else if (resolvedActive == null) {
        resolvedActive = Math.max(0, achieved - (resolvedClosed || 0));
      } else {
        resolvedClosed = Math.max(0, achieved - (resolvedActive || 0));
      }
    } catch (_) {
      resolvedActive = resolvedActive ?? 0;
      resolvedClosed = resolvedClosed ?? 0;
    }
  }
  return {
    displayName: "Deals Directory Summary",
    resource: LEGACY_DEALS_LIST_API,
    openForParticipationCount,
    activeLoanCount: resolvedActive,
    borrowerClosedCount: resolvedClosed,
    runningCount: openForParticipationCount,
    participationClosedCount: (resolvedActive || 0) + (resolvedClosed || 0),
    openInFutureCount: 0,
    source: "legacy",
  };
};

const isDealsDirectoryMissing = (err) => {
  const status = err?.response?.status;
  if (status === 404 || status === 500) return true;
  const msg = extractApiError(err) || "";
  return /internal server error/i.test(msg) || /not found/i.test(msg);
};

/** Live production API — Active Lenders investment (same as sidebar page) */
export const LIVE_ACTIVE_LENDERS_API = `${API_USER_URL}activLendersParicipationAmount`;

const PAGE_SIZE = 20;

export const getToken = () => sessionStorage.getItem("accessToken");

export const clearAdminSession = () => {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("userId");
  sessionStorage.removeItem("tokenTime");
  sessionStorage.removeItem("email");
};

export const isSessionExpiredMessage = (msg) => {
  const m = String(msg || "").toLowerCase();
  return (
    m.includes("session has expired") ||
    m.includes("session expired") ||
    m.includes("authentication required") ||
    m.includes("not logged in")
  );
};

export const isAuthError = (err) => {
  const status = err?.response?.status;
  if (status === 401 || status === 403) return true;
  return isSessionExpiredMessage(extractApiError(err));
};

export const saveLoginSession = (response) => {
  if (!response?.data?.id) return false;
  const token =
    response.headers?.accesstoken ||
    response.headers?.accessToken ||
    response.headers?.["access-token"];
  if (!token) return false;
  sessionStorage.setItem("accessToken", token);
  sessionStorage.setItem("userId", String(response.data.id));
  sessionStorage.setItem("tokenTime", response.data.tokenGeneratedTime || "");
  sessionStorage.setItem("email", response.data.email || "");
  localStorage.setItem("primaryType", response.data.primaryType || "");
  return true;
};

export const isLoggedIn = () => !!getToken();

export const devAutoLogin = async () => {
  if (getToken() || !DEV_ADMIN_MOBILE) return isLoggedIn();
  try {
    await handlesenOtp(DEV_ADMIN_MOBILE);
    const res = await usersubmitotp(DEV_ADMIN_MOBILE, DEV_OTP);
    if (res?.status === 200) return saveLoginSession(res);
  } catch (e) {
    // manual login required
  }
  return false;
};

const authHeaders = () => {
  const token = getToken();
  if (!token) return null;
  return { accessToken: token };
};

const extractApiError = (err) => {
  const data = err?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return (
    data?.errorMessage ||
    data?.error ||
    (err?.response?.status === 401
      ? "Your session has expired. Please login again."
      : null) ||
    err?.message ||
    "Request failed"
  );
};

export const getAdminAIDbHealth = async () => {
  if (AI_DASHBOARD_USE_STATIC) {
    return { data: STATIC_DB_HEALTH };
  }
  try {
    const health = await axios.get(`${MARKETPLACE_URL}/healthCheck`, { timeout: 10000 });
    if (health.status === 200) {
      let database = "oxyloans (live — default profile)";
      try {
        const dbCheck = await axios.get(`${API_USER_URL}verifyEndPoint-admin-ai-db-health`, {
          timeout: 15000,
        });
        if (dbCheck.data?.database) database = dbCheck.data.database;
        if (dbCheck.data?.status === "connected") {
          return {
            data: {
              status: "connected",
              database,
              message: "Backend online. DB connected.",
            },
          };
        }
      } catch (e) {
        // optional health endpoint
      }
      return {
        data: {
          status: "backend-online",
          database,
          message: "Backend reachable. Login for live stats.",
        },
      };
    }
  } catch (err) {
    return {
      data: {
        status: "error",
        database: "unknown",
        error: err?.message || "Cannot reach backend (check backend on port 8181 and restart npm start)",
      },
    };
  }
  return { data: { status: "error", error: "Unexpected health response" } };
};

const requireAuth = () => {
  if (!getToken()) {
    const err = new Error("Not logged in. Login at /loginotp or /admlogin.");
    err.code = "NO_TOKEN";
    throw err;
  }
  return authHeaders();
};

const wrapSection = (displayName, resource, data) => ({
  displayName,
  resource,
  generatedAt: new Date().toISOString(),
  apiVersion: "2026.06.16-loan-ai-v1",
  data,
});

const fetchSectionGet = async (path, fy, extraParams = {}) => {
  const headers = requireAuth();
  const params = new URLSearchParams();
  if (fy) params.set("fy", String(fy));
  Object.entries(extraParams).forEach(([k, v]) => params.set(k, String(v)));
  const qs = params.toString() ? `?${params.toString()}` : "";
  const res = await axios.get(`${AI_USER_BASE}${path}${qs}`, { headers, timeout: 180000 });
  return res.data;
};

const safeLoad = async (key, loader) => {
  try {
    const section = await loader();
    if (section?.error) {
      return { key, section, error: section.error };
    }
    return { key, section, error: null };
  } catch (err) {
    return { key, section: err?.response?.data || null, error: extractApiError(err) };
  }
};

const sumInvestment = (list) =>
  (list || []).reduce((s, r) => s + (Number(r.totalParticipationAmount) || 0), 0);

/**
 * Live API: GET /v1/user/activLendersParicipationAmount
 * Tables: user, oxy_lenders_accepted_deals, lenders_paticipation_updation
 */
const loadLiveActiveLendersInvestment = async () => {
  const headers = requireAuth();
  const res = await axios.get(LIVE_ACTIVE_LENDERS_API, { headers, timeout: 180000 });
  const list = res.data?.activeUserList || [];
  const totalInvestment = sumInvestment(list);
  return {
    list,
    downloadLink: res.data?.downloadLink || "",
    totalInvestment,
    resource: "/v1/user/activLendersParicipationAmount",
  };
};

const buildActiveLendersSections = (live, pageNo = 1) => {
  const { list, downloadLink, totalInvestment, resource } = live;
  const from = (pageNo - 1) * PAGE_SIZE;
  const page = list.slice(from, from + PAGE_SIZE);

  const activeLenders = wrapSection("Active Lenders Investment", resource, {
    activeLenders: page,
    activeUserList: page,
    totalCount: list.length,
    totalInvestment,
    downloadLink,
    pageNo,
    pageSize: PAGE_SIZE,
    tables: ["user", "oxy_lenders_accepted_deals", "lenders_paticipation_updation"],
  });

  const activeLendersSummary = wrapSection("Active Lenders Summary", resource, {
    activeLenderCount: list.length,
    totalInvestment,
    totalCurrentParticipation: totalInvestment,
    liveResource: resource,
    tables: ["user", "oxy_lenders_accepted_deals", "lenders_paticipation_updation"],
  });

  return { activeLenders, activeLendersSummary, fullList: list, downloadLink };
};

/** AI dashboard wrapper (same DB query, no Excel upload) */
const loadAiActiveLendersInvestment = async (pageNo = 1) => {
  const section = await fetchSectionGet("active-lenders-investment");
  const list = section?.data?.activeUserList || section?.data?.activeLenders || [];
  return buildActiveLendersSections(
    {
      list,
      downloadLink: section?.data?.downloadLink || "",
      totalInvestment: section?.data?.totalInvestment ?? sumInvestment(list),
      resource: section?.resource || "/v1/user/admin/ai/active-lenders-investment",
    },
    pageNo
  );
};

const loadLegacyParticipation = async () => {
  const headers = requireAuth();
  const res = await axios.get(`${API_USER_URL}getParticipatedAmountInfo`, { headers, timeout: 120000 });
  return wrapSection("Participation Amount Info", "/v1/user/getParticipatedAmountInfo", {
    participationAmounts: res.data,
  });
};

const loadLegacyPlatformBundle = async (fy) => {
  const headers = requireAuth();
  const qs = fy ? `?fy=${fy}` : "";
  const res = await axios.get(`${AI_BASE_URL}admin/platform-stats${qs}`, { headers, timeout: 120000 });
  const stats = res.data || {};
  return {
    platformKpis: wrapSection("Platform KPIs", "/v1/ai/admin/platform-stats", { kpis: stats.kpis || {} }),
    userGrowth: wrapSection("User Growth", "/v1/ai/admin/platform-stats", { users: stats.users || {} }),
    topLenders: wrapSection("Top Lenders", "/v1/ai/admin/platform-stats", {
      topLenders: stats.topLenders || [],
      fyLeaderboard: stats.fyLeaderboard || [],
    }),
    topDeals: wrapSection("Top Deals", "/v1/ai/admin/platform-stats", { topDeals: stats.topDeals || [] }),
    monthlyTrend: wrapSection("Monthly Payout Trend", "/v1/ai/admin/platform-stats", {
      monthlyTrend: stats.monthlyTrend || [],
      fyHistory: stats.fyHistory || [],
    }),
  };
};

const loadLegacyReconciliation = async () => {
  const headers = requireAuth();
  const res = await axios.get(`${AI_BASE_URL}admin/reconciliation-summary`, { headers, timeout: 120000 });
  return wrapSection("CMS Daily Reconciliation", "/v1/ai/admin/reconciliation-summary", {
    reconciliation: res.data,
  });
};


const buildDealIntelligenceFallback = async () => {
  const headers = requireAuth();
  const [statsRes, dealsPage] = await Promise.all([
    axios.get(DASHBOARD_LIVE_API, { headers, timeout: 120000 }).then((r) => ({ data: r.data?.platform || {} })).catch(() => null),
    loadDealsDirectoryPage("ACTIVE_LOAN", 1, 50).catch(() => loadDealsDirectoryPage("RUNNING", 1, 50).catch(() => null)),
  ]);

  const kpis = statsRes?.data?.kpis || {};
  const deals = dealsPage?.data?.deals || [];
  const runningDeals = deals.map(mapDealRowToRecommendation);
  const closeCandidates = runningDeals.filter(
    (d) => d.action === "CLOSE" || d.action === "CLOSE_SOON"
  );
  const relaunchCandidates = runningDeals.filter((d) => d.action?.startsWith("RELAUNCH"));

  const avgLender =
    runningDeals.length > 0
      ? runningDeals.reduce((s, d) => s + (d.lenderRoi || 0), 0) / runningDeals.length
      : 1.65;
  const avgBorrower =
    runningDeals.length > 0
      ? runningDeals.reduce((s, d) => s + (d.borrowerRoi || 0), 0) / runningDeals.length
      : 2.85;

  const wallet = Number(kpis.totalWalletBalance) || 0;
  const launchSuggestion = {
    idleLenderWalletBalance: wallet,
    maturingPrincipalNext30Days: 0,
    suggestedDealSize: Math.round(Math.min(Math.max(wallet * 0.25, 500000), 10000000)),
    suggestedLenderRoiMin: 1.4,
    suggestedLenderRoiMax: 2.1,
    suggestedBorrowerRoi: 2.85,
    rationale:
      wallet > 0
        ? `₹${wallet.toLocaleString("en-IN")} in lender wallets — launch a deal in the 1.4–2.1% lender ROI band.`
        : "Review running deals and wallet balances before the next launch.",
  };

  const feeSummary = {
    borrowerFeesCollected: 0,
    lenderInterestPaid: kpis.allTimeInterestPaid || 0,
    lenderPrincipalReturned: kpis.allTimePrincipalReturned || 0,
    activeParticipationAmount: kpis.activeDealsAmount || kpis.totalInvested || 0,
    avgBorrowerRoi: Math.round(avgBorrower * 100) / 100,
    avgLenderRoi: Math.round(avgLender * 100) / 100,
    avgSpreadPercent: Math.round((avgBorrower - avgLender) * 100) / 100,
    activeRunningDeals: kpis.activeDeals || runningDeals.length,
    closedDeals: kpis.closedDeals || 0,
  };

  return {
    feeSummary,
    launchSuggestion,
    runningDeals,
    closeCandidates,
    relaunchCandidates,
    aiSummary: buildAiSummaryText(feeSummary, closeCandidates, relaunchCandidates, launchSuggestion),
    generatedAt: new Date().toISOString(),
    source: "legacy-computed",
    fallbackNote:
      "Built from platform-stats + deals directory (deploy backend deal-intelligence for full fee & maturity data).",
  };
};

export const loadDealIntelligence = async () => {
  if (AI_DASHBOARD_USE_STATIC) {
    const feeSummary = {
      borrowerFeesCollected: 1250000,
      lenderInterestPaid: 48500000,
      lenderPrincipalReturned: 120000000,
      activeParticipationAmount: 85000000,
      avgBorrowerRoi: 2.85,
      avgLenderRoi: 1.65,
      avgSpreadPercent: 1.2,
      activeRunningDeals: 12,
      closedDeals: 48,
    };
    const launchSuggestion = {
      idleLenderWalletBalance: 15000000,
      maturingPrincipalNext30Days: 8200000,
      suggestedDealSize: 5000000,
      suggestedLenderRoiMin: 1.4,
      suggestedLenderRoiMax: 2.1,
      suggestedBorrowerRoi: 2.85,
      rationale: "Demo: redeploy idle wallet into a 1.65% lender ROI deal.",
    };
    return {
      data: {
        feeSummary,
        launchSuggestion,
        closeCandidates: [],
        relaunchCandidates: [],
        runningDeals: [],
        aiSummary: buildAiSummaryText(feeSummary, [], [], launchSuggestion),
        generatedAt: new Date().toISOString(),
        source: "static-demo",
      },
    };
  }

  const headers = requireAuth();
  try {
    const res = await axios.get(`${AI_BASE_URL}admin/deal-intelligence`, { headers, timeout: 180000 });
    if (res.data?.error) throw new Error(res.data.error);
    return { data: { ...res.data, source: res.data.source || "live" } };
  } catch (err) {
    if (isAuthError(err)) {
      clearAdminSession();
      throw err;
    }
    try {
      return { data: await buildDealIntelligenceFallback() };
    } catch (fallbackErr) {
      if (isAuthError(fallbackErr)) {
        clearAdminSession();
        throw fallbackErr;
      }
      throw new Error(extractApiError(err) || extractApiError(fallbackErr));
    }
  }
};


const paymentRowId = (row) => row.paymentId ?? row.borrowerPaymentId ?? row.id;

const resolveBorrowerFee = (row) => {
  const candidates = [row.borrowerFee, row.borrower_fee];
  for (const v of candidates) {
    const n = Number(v);
    if (n > 0) return n;
  }
  return 0;
};

const resolveDisbursedAmount = (row) =>
  Number(row.fdAmountFromSystem ?? row.amount ?? row.disbursedAmount) || 0;

const isClosedPaymentRow = (row) =>
  String(row.status || row.fdStatus || "").toUpperCase() === "CLOSED";

const mergeBorrowerRowsByPaymentId = (...lists) => {
  const map = new Map();
  lists.flat().forEach((row) => {
    const id = paymentRowId(row);
    if (id) map.set(id, { ...(map.get(id) || {}), ...row });
  });
  return [...map.values()];
};

const mapLegacyBorrowerRow = (row, lifecycleLabel) => {
  const borrowerFee = resolveBorrowerFee(row);
  return {
    borrowerPaymentId: row.paymentId,
    userId: row.userId,
    borrowerRef: 'BR' + (row.userId || ''),
    borrowerName: row.userName || row.nameFromProfile || '',
    dealName: row.dealName || row.university || '',
    fdAmount: Number(row.fdAmount) || 0,
    fdAmountFromSystem: Number(row.fdAmountFromSystem) || 0,
    borrowerFee,
    feePendingReview: Boolean(row.feePendingReview) || (borrowerFee > 0 && !row.feeInvoice),
    borrowerRoi: Number(row.roi) || 0,
    bankName: row.bankName || '',
    daysToValidity: row.days != null ? row.days : null,
    fdValidityDate: row.fdValidityDate || null,
    fdCreatedDate: row.fdCreatedDate || null,
    registeredMobile: row.registeredMobileNumber || '',
    lifecycleLabel: lifecycleLabel || (row.status === 'NEGATIVE' ? 'Overdue' : row.status === 'CLOSED' ? 'Closed' : row.status === 'RUNNING' ? 'Running' : 'Bank saved'),
    fdStatus: row.status || '',
  };
};

const loadLegacyBorrowerFdPage = async (status, pageNo = 1, pageSize = 40) => {
  const headers = requireAuth();
  const res = await axios.post(
    API_USER_URL + 'fd-details-basedon-status',
    { status, pageNo, pageSize, bankType: 'ALL' },
    { headers, timeout: 120000 }
  );
  return res.data?.borrowerNewBankDetailsResponseDto || [];
};

/** Paginate fd-details ALL so borrower_fee totals cover every row in borrower_payments. */
const loadAllLegacyBorrowerFdRows = async () => {
  const pageSize = 200;
  const all = [];
  for (let pageNo = 1; pageNo <= 100; pageNo += 1) {
    const rows = await loadLegacyBorrowerFdPage('ALL', pageNo, pageSize);
    if (!rows.length) break;
    all.push(...rows);
    if (rows.length < pageSize) break;
  }
  return all;
};

const buildBorrowerPaymentsFallback = async () => {
  const [running, overdue, closed, allRows] = await Promise.all([
    loadLegacyBorrowerFdPage("RUNNING", 1, 200).catch(() => []),
    loadLegacyBorrowerFdPage("NEGATIVE", 1, 200).catch(() => []),
    loadLegacyBorrowerFdPage("CLOSED", 1, 200).catch(() => []),
    loadAllLegacyBorrowerFdRows().catch(() => []),
  ]);

  const merged = mergeBorrowerRowsByPaymentId(allRows, running, overdue, closed);
  const openRows = merged.filter((r) => !isClosedPaymentRow(r));
  const closedRows = merged.filter(isClosedPaymentRow);

  const mapOpen = (r) => {
    const label = r.status === 'NEGATIVE' ? 'Overdue' : r.status === 'RUNNING' ? 'Running' : 'Running';
    return mapLegacyBorrowerRow(r, label);
  };

  const byPaymentId = new Map();
  openRows.slice(0, 35).forEach((r) => {
    const row = mapOpen(r);
    if (row.borrowerPaymentId) byPaymentId.set(row.borrowerPaymentId, row);
  });
  closedRows.slice(0, 35).forEach((r) => {
    const row = mapLegacyBorrowerRow(r, 'Closed');
    if (row.borrowerPaymentId) byPaymentId.set(row.borrowerPaymentId, row);
  });
  running.slice(0, 35).forEach((r) => {
    const row = mapLegacyBorrowerRow(r, 'Running');
    if (row.borrowerPaymentId) byPaymentId.set(row.borrowerPaymentId, row);
  });
  overdue.slice(0, 35).forEach((r) => {
    const row = mapLegacyBorrowerRow(r, 'Overdue');
    if (row.borrowerPaymentId) byPaymentId.set(row.borrowerPaymentId, row);
  });
  closed.slice(0, 35).forEach((r) => {
    const row = mapLegacyBorrowerRow(r, 'Closed');
    if (row.borrowerPaymentId) byPaymentId.set(row.borrowerPaymentId, row);
  });

  const recentAccounts = Array.from(byPaymentId.values());

  const sumFee = (list) => list.reduce((s, r) => s + resolveBorrowerFee(r), 0);
  const sumFd = (list) => list.reduce((s, r) => s + (Number(r.fdAmount) || 0), 0);

  const runningBorrowerFees = sumFee(openRows);
  const closedBorrowerFees = sumFee(closedRows.length ? closedRows : closed);
  const runningFdAmount = sumFd(openRows);
  const closedFdAmount = sumFd(closedRows.length ? closedRows : closed);
  const totalFdAmount = runningFdAmount + closedFdAmount;
  const totalBorrowerFees = runningBorrowerFees + closedBorrowerFees;
  const totalDisbursed = merged.reduce((s, r) => s + resolveDisbursedAmount(r), 0);
  const pendingFeeReviewCount = merged.filter(
    (r) => resolveBorrowerFee(r) > 0 && (r.feePendingReview || !r.feeInvoice)
  ).length;
  const roiRows = merged.filter((r) => Number(r.roi) > 0);
  const avgBorrowerRoi = roiRows.length
    ? Math.round((roiRows.reduce((s, r) => s + Number(r.roi), 0) / roiRows.length) * 100) / 100
    : 0;

  return {
    totalBorrowerFees,
    totalCombinedFees: totalBorrowerFees,
    totalFdAmount,
    runningBorrowerFees,
    closedBorrowerFees,
    runningFdAmount,
    closedFdAmount,
    totalFdFromSystem: totalDisbursed,
    totalSystemPayments: totalDisbursed,
    activeBorrowerAccounts: openRows.length,
    closedBorrowerAccounts: closedRows.length,
    runningFdCount: openRows.filter((r) => { const st = String(r.status || '').toUpperCase(); return st === 'RUNNING' || st === 'CREATED' || st === 'SAVED'; }).length,
    negativeFdCount: openRows.filter((r) => String(r.status || '').toUpperCase() === 'NEGATIVE').length,
    bankSavedCount: 0,
    pendingFeeReviewCount,
    avgBorrowerRoi,
    recentAccounts,
    generatedAt: new Date().toISOString(),
    source: 'legacy-borrower-payments',
    fallbackNote: 'borrower_fee from borrower_payments (via fd-details API). Deploy AI endpoint for full summary.',
  };
};


export const loadWalletSummary = async () => {
  if (AI_DASHBOARD_USE_STATIC) {
    return {
      data: {
        currentBalance: 2878776834,
        totalLoadedToWallet: 5200000000,
        totalDebited: 2321223166,
        totalParticipatedInDeals: 2749822820,
        activeInLiveDeals: 951849033,
        totalWithdrawn: 450000000,
        totalReturnedFromDeals: 890000000,
        principalReturnedToWallet: 720000000,
        interestReturnedToWallet: 170000000,
        lendersWithWallet: 943,
        monthlyFlow: [],
        source: "static-demo",
      },
    };
  }
  const headers = requireAuth();
  try {
    const res = await axios.get(`${AI_BASE_URL}admin/wallet-summary`, { headers, timeout: 180000 });
    if (res.data?.error) throw new Error(res.data.error);
    return { data: { ...res.data, source: res.data.source || "live" } };
  } catch (err) {
    if (isAuthError(err)) {
      clearAdminSession();
      throw err;
    }
    try {
      const kpis = await loadPlatformKpis();
      if (kpis?.totalWalletBalance != null || kpis?.activeDealsAmount != null) {
        return {
          data: {
            currentBalance: kpis.totalWalletBalance,
            activeInLiveDeals: kpis.activeDealsAmount,
            totalParticipatedInDeals: kpis.totalInvested,
            source: "platform-kpis-fallback",
          },
        };
      }
    } catch (fallbackErr) {
      if (isAuthError(fallbackErr)) throw fallbackErr;
    }
    return { data: null, error: extractApiError(err) };
  }
};


const augmentBorrowerSummary = async (primary) => {
  const fd = Number(primary?.totalFdAmount) || 0;
  const fees = Number(primary?.totalBorrowerFees) || 0;
  const disbursed = Number(primary?.totalFdFromSystem || primary?.totalSystemPayments) || 0;
  if (fd <= 0 || (fees > 0 && disbursed > 0)) return primary;
  try {
    const fb = await buildBorrowerPaymentsFallback();
    return {
      ...primary,
      totalBorrowerFees: fees || fb.totalBorrowerFees,
      totalCombinedFees: fees || fb.totalCombinedFees,
      totalFdFromSystem: disbursed || fb.totalFdFromSystem,
      totalSystemPayments: disbursed || fb.totalSystemPayments,
      runningBorrowerFees: primary.runningBorrowerFees || fb.runningBorrowerFees,
      closedBorrowerFees: primary.closedBorrowerFees || fb.closedBorrowerFees,
      runningFdAmount: primary.runningFdAmount || fb.runningFdAmount,
      closedFdAmount: primary.closedFdAmount || fb.closedFdAmount,
      totalFdAmount: fd || fb.totalFdAmount,
      source: (primary.source || "live") + "+legacy-fallback",
    };
  } catch {
    return primary;
  }
};


/** Official FD stats — LoanServiceImpl.fdStatistics (POST /v1/user/fd-statistics). */
/** Participation page only - 3 parallel calls, no full dashboard-live. */
export const loadParticipationInsights = async (fy) => {
  const fyYear =
    fy ??
    (new Date().getMonth() >= 3 ? new Date().getFullYear() : new Date().getFullYear() - 1);

  const [participationSec, activeSec, topLendersSec] = await Promise.all([
    fetchSectionGet("participation-amount-info").catch(() => loadLegacyParticipation()),
    fetchSectionGet("active-lenders-investment").catch(() => null),
    loadTopLendersInvestment(fyYear, 25).catch(() => null),
  ]);

  const participationAmounts =
    participationSec?.data?.participationAmounts || participationSec?.data || {};

  const activeList =
    activeSec?.data?.activeUserList || activeSec?.data?.activeLenders || [];
  const totalInvestment =
    activeSec?.data?.totalInvestment ?? sumInvestment(activeList);

  return {
    activeLendersSummary: {
      data: {
        activeLenderCount: activeList.length,
        totalInvestment,
        totalCurrentParticipation: totalInvestment,
      },
    },
    participationAmountInfo: {
      data: { participationAmounts },
    },
    topLenders: topLendersSec || { data: { topLenders: [] } },
  };
};

/** Risk page only - single section endpoint. */
export const loadLenderRiskPortfolio = async () => {
  const section = await fetchSectionGet("lender-risk-portfolio");
  const lenderRisk = section?.data?.lenderRisk;
  if (!lenderRisk) {
    throw new Error(section?.error || "Risk data unavailable.");
  }
  return lenderRisk;
};

export const loadFdStatistics = async (type = "ALL", startDate = null, endDate = null) => {
  if (AI_DASHBOARD_USE_STATIC) {
    return {
      data: {
        noOfFdsDone: 60,
        valueOfFd: 19000000,
        noOfActiveFds: 40,
        noOfActiveFdsAmount: 12000000,
        totalFdClosedInterest: 450000,
        amountReceivedToHdfc: 3200000,
        amountReceivedToIcici: 1800000,
      },
      source: "static-demo",
    };
  }
  const headers = requireAuth();
  const body = { type: type || "ALL" };
  if (startDate) body.startDate = startDate;
  if (endDate) body.endDate = endDate;
  try {
    const res = await axios.post(API_USER_URL + "fd-statistics", body, { headers, timeout: 120000 });
    return { data: res.data, source: "fd-statistics-api" };
  } catch (err) {
    if (isAuthError(err)) {
      clearAdminSession();
      throw err;
    }
    return { data: null, error: extractApiError(err) };
  }
};

export const loadBorrowerPaymentsSummary = async () => {
  if (AI_DASHBOARD_USE_STATIC) {
    return {
      data: {
        totalBorrowerFees: 980000,
        totalDealFeesCollected: 270000,
        totalCombinedFees: 1250000,
        totalFdAmount: 45000000,
        runningFdAmount: 28000000,
        closedFdAmount: 17000000,
        runningBorrowerFees: 620000,
        closedBorrowerFees: 360000,
        runningFdCount: 18,
        negativeFdCount: 2,
        totalSystemPayments: 3200000,
        activeBorrowerAccounts: 18,
        closedBorrowerAccounts: 42,
        pendingFeeReviewCount: 2,
        avgBorrowerRoi: 2.85,
        recentAccounts: [
          {
            borrowerPaymentId: 1,
            borrowerName: "Demo Borrower",
            dealName: "Education Loan Q1",
            fdAmount: 2500000,
            borrowerFee: 45000,
            borrowerRoi: 2.85,
            fdStatus: "CREATED",
            systemPaymentsTotal: 120000,
            bankName: "HDFC Bank",
          },
        ],
        generatedAt: new Date().toISOString(),
        source: "static-demo",
      },
    };
  }

  const headers = requireAuth();
  try {
    const res = await axios.get(`${AI_BASE_URL}admin/borrower-payments-summary`, {
      headers,
      timeout: 120000,
    });
    if (res.data?.error) throw new Error(res.data.error);
    return { data: { ...res.data, source: res.data.source || "live" } };
  } catch (err) {
    if (isAuthError(err)) {
      clearAdminSession();
      throw err;
    }
    try {
      return { data: await buildBorrowerPaymentsFallback() };
    } catch (fallbackErr) {
      if (isAuthError(fallbackErr)) {
        clearAdminSession();
        throw fallbackErr;
      }
      return { data: null, error: extractApiError(err) || extractApiError(fallbackErr) };
    }
  }
};

const adaptDashboardLive = (live = {}) => {
  const platform = live.platform || {};
  return {
    resource: live.resource,
    generatedAt: live.generatedAt,
    kpis: platform.kpis || {},
    users: platform.users || {},
    topLenders: platform.topLenders || [],
    fyLeaderboard: platform.fyLeaderboard || [],
    topDeals: platform.topDeals || [],
    monthlyTrend: platform.monthlyTrend || [],
    fyHistory: platform.fyHistory || [],
    reconciliation: live.reconciliation || {},
    lenderRisk: live.lenderRisk,
    platformError: live.platformError,
    reconciliationError: live.reconciliationError,
    lenderRiskError: live.lenderRiskError,
    loadTimeMs: platform.loadTimeMs,
  };
};

const mergeDashboardLiveSections = async (liveBody, pageNo = 1) => {
  const flat = adaptDashboardLive(liveBody);
  if (!flat.kpis || Object.keys(flat.kpis).length === 0) {
    try { flat.kpis = await loadPlatformKpis(); } catch (err) { if (isAuthError(err)) throw err; }
  }
  const [participationSec, activeLive] = await Promise.all([
    loadLegacyParticipation().catch(() => null),
    loadLiveActiveLendersInvestment().catch(() => null),
  ]);
  const activeBundle = activeLive ? buildActiveLendersSections(activeLive, pageNo) : null;
  const sections = mapLiveDashboardToSections(
    {
      ...flat,
      activeLendersSummary: activeBundle?.activeLendersSummary?.data || {},
      participationAmounts: participationSec?.data?.participationAmounts || {},
      activeLenders: activeBundle?.activeLenders?.data || {},
      _fullLenderCount: activeBundle?.fullList?.length,
    },
    pageNo
  );
  if (activeBundle) {
    sections.activeLenders = activeBundle.activeLenders;
    sections.activeLendersSummary = activeBundle.activeLendersSummary;
  }
  if (participationSec) sections.participationAmountInfo = participationSec;
  return { sections, errors: collectLiveErrors(liveBody), loadTimeMs: flat.loadTimeMs };
};
const mapLiveDashboardToSections = (payload, pageNo = 1) => {
  const resource = payload?.resource || DASHBOARD_LIVE_API;
  const generatedAt = payload?.generatedAt || new Date().toISOString();
  const wrap = (name, data) => ({
    displayName: name,
    resource,
    generatedAt,
    data,
  });

  const al = payload?.activeLenders || {};
  const page = al.activeLenders || [];
  const totalCount = al.totalCount || payload?._fullLenderCount || page.length;

  const sections = {
    platformKpis: wrap("Platform KPIs", { kpis: payload?.kpis || {} }),
    userGrowth: wrap("User Growth", { users: payload?.users || {} }),
    topLenders: wrap("Top Lenders", {
      topLenders: payload?.topLenders || [],
      fyLeaderboard: payload?.fyLeaderboard || [],
    }),
    topDeals: wrap("Top Deals", { topDeals: payload?.topDeals || [] }),
    monthlyTrend: wrap("Monthly Payout Trend", {
      monthlyTrend: payload?.monthlyTrend || [],
      fyHistory: payload?.fyHistory || [],
    }),
    reconciliation: wrap("CMS Reconciliation", {
      reconciliation: payload?.reconciliation || {},
    }),
    participationAmountInfo: wrap("Participation", {
      participationAmounts: payload?.participationAmounts || {},
    }),
    activeLendersSummary: wrap("Active Lenders", {
      ...(payload?.activeLendersSummary || {}),
    }),
    activeLenders: wrap("Active Lenders Table", {
      activeLenders: page,
      totalCount,
      totalInvestment: al.totalInvestment,
      pageNo: al.pageNo || pageNo,
      pageSize: al.pageSize || PAGE_SIZE,
    }),
    _loadTimeMs: payload?.loadTimeMs,
    _database: payload?.database,
  };

  if (payload?.lenderRisk) {
    sections.lenderRisk = wrap("Lender Risk", { lenderRisk: payload.lenderRisk });
  }

  sections._activeLendersFullList = null;
  sections._activeLendersTotalCount = totalCount;
  return sections;
};

const collectLiveErrors = (payload) => {
  const errors = [];
  const map = {
    platformError: "platformKpis",
    participationError: "participationAmountInfo",
    reconciliationError: "reconciliation",
    activeLendersError: "activeLenders",
    lenderRiskError: "lenderRisk",
  };
  Object.entries(map).forEach(([key, sectionKey]) => {
    if (payload?.[key]) errors.push({ key: sectionKey, message: payload[key] });
  });
  return errors;
};

const mapOverviewToSections = (payload) => {
  const resource = payload?.resource || DASHBOARD_OVERVIEW_API;
  const generatedAt = payload?.generatedAt || new Date().toISOString();
  const wrap = (name, data) => ({
    displayName: name,
    resource,
    generatedAt,
    data,
  });
  return {
    activeLendersSummary: wrap("Active Lenders", { ...(payload?.activeLendersSummary || {}) }),
    participationAmountInfo: wrap("Participation", {
      participationAmounts: payload?.participationAmounts || {},
    }),
    _loadTimeMs: payload?.loadTimeMs,
    _database: payload?.database,
  };
};

const mergeFyStatsIntoSections = (sections, payload) => {
  const resource = payload?.resource || DASHBOARD_FY_STATS_API;
  const generatedAt = payload?.generatedAt || new Date().toISOString();
  const wrap = (name, data) => ({
    displayName: name,
    resource,
    generatedAt,
    data,
  });
  return {
    ...sections,
    platformKpis: wrap("Platform KPIs", { kpis: payload?.kpis || {} }),
    userGrowth: wrap("User Growth", { users: payload?.users || {} }),
    topLenders: wrap("Top Lenders", {
      topLenders: payload?.topLenders || [],
      fyLeaderboard: payload?.fyLeaderboard || [],
    }),
    topDeals: wrap("Top Deals", { topDeals: payload?.topDeals || [] }),
    monthlyTrend: wrap("Monthly Payout Trend", {
      monthlyTrend: payload?.monthlyTrend || [],
      fyHistory: payload?.fyHistory || [],
    }),
    _fyLoadTimeMs: payload?.loadTimeMs,
    _fyYear: payload?.fyYear,
  };
};

/**
 * Fast overview — active lenders + participation only (~1–3s).
 */

export const loadPlatformKpis = async () => {
  const headers = requireAuth();
  const attempts = [
    () => axios.get(DASHBOARD_FY_STATS_API, { headers, timeout: 300000 }),
    () => axios.get(`${AI_BASE_URL}admin/platform-stats`, { headers, timeout: 300000 }),
    () => axios.get(DASHBOARD_LIVE_API, { headers, timeout: 120000 }),
  ];
  for (const attempt of attempts) {
    try {
      const res = await attempt();
      const kpis = res.data?.kpis || res.data?.platform?.kpis;
      if (kpis && typeof kpis === "object" && Object.keys(kpis).length > 0) return kpis;
    } catch (err) {
      if (isAuthError(err)) throw err;
    }
  }
  return {};
};

export const loadDashboardOverview = async () => {
  const headers = requireAuth();
  try {
    const liveRes = await axios.get(DASHBOARD_OVERVIEW_API, { headers, timeout: 120000 });
    return mergeDashboardLiveSections(liveRes.data || {}, 1);
  } catch (err) {
    if (isAuthError(err)) {
      clearAdminSession();
      throw err;
    }
    const legacy = await loadAdminAIDashboardSectionsLegacy(null, false, 1, extractApiError(err));
    return {
      sections: legacy.sections || {},
      errors: legacy.errors || [{ key: "overview", message: extractApiError(err) }],
    };
  }
};

const normalizeFyStatsPayload = (data) => {
  if (!data) return null;
  if (data.kpis) {
    return {
      kpis: data.kpis,
      users: data.users,
      topLenders: data.topLenders,
      fyLeaderboard: data.fyLeaderboard,
      topDeals: data.topDeals,
      monthlyTrend: data.monthlyTrend,
      fyHistory: data.fyHistory,
      fyYear: data.fyYear,
      resource: data.resource,
      generatedAt: data.generatedAt,
      loadTimeMs: data.loadTimeMs,
    };
  }
  if (data.data?.kpis) {
    return {
      ...data.data,
      resource: data.resource,
      generatedAt: data.generatedAt,
      loadTimeMs: data.loadTimeMs,
      fyYear: data.data.fyYear ?? data.fyYear,
    };
  }
  return null;
};

const hasFyKpis = (payload) =>
  payload?.kpis && typeof payload.kpis === "object" && Object.keys(payload.kpis).length > 0;

const ensureMonthlyTrend = async (fy, payload) => {
  if (payload?.monthlyTrend?.length > 0) return payload;
  try {
    const sec = await fetchSectionGet("monthly-payout-trend", fy);
    if (sec?.error) return payload;
    return {
      ...payload,
      monthlyTrend: sec?.data?.monthlyTrend || [],
      fyHistory: sec?.data?.fyHistory || payload?.fyHistory || [],
    };
  } catch {
    try {
      const headers = requireAuth();
      const res = await axios.get(`${AI_BASE_URL}admin/platform-stats?fy=${fy}`, {
        headers,
        timeout: 300000,
      });
      const stats = res.data || {};
      return {
        ...payload,
        monthlyTrend: stats.monthlyTrend || [],
        fyHistory: stats.fyHistory || payload?.fyHistory || [],
      };
    } catch {
      return payload;
    }
  }
};

/** Fill any missing FY ranking arrays (each checked independently). */
const enrichFyPayloadIfNeeded = async (fy, payload) => {
  if (!payload) return payload;

  let result = { ...payload };
  const needsLenders = !result.topLenders?.length;
  const needsDeals = !result.topDeals?.length;
  const needsTrend = !result.monthlyTrend?.length;

  if (!needsLenders && !needsDeals && !needsTrend) {
    return result;
  }

  if (needsTrend) {
    result = await ensureMonthlyTrend(fy, result);
  }

  if ((needsLenders || needsDeals) && (!result.topLenders?.length || !result.topDeals?.length)) {
    try {
      const bundle = await loadLegacyPlatformBundle(fy);
      if (needsLenders && !result.topLenders?.length) {
        result.topLenders = bundle.topLenders?.data?.topLenders || [];
        result.fyLeaderboard = bundle.topLenders?.data?.fyLeaderboard || [];
      }
      if (needsDeals && !result.topDeals?.length) {
        result.topDeals = bundle.topDeals?.data?.topDeals || [];
      }
      if (needsTrend && !result.monthlyTrend?.length) {
        result.monthlyTrend = bundle.monthlyTrend?.data?.monthlyTrend || [];
        result.fyHistory = bundle.monthlyTrend?.data?.fyHistory || [];
      }
      result.users = result.users || bundle.userGrowth?.data?.users;
    } catch {
      // fall through
    }
  }

  if (needsLenders || needsDeals) {
    try {
      const fetches = [];
      if (needsLenders && !result.topLenders?.length) {
        fetches.push(fetchSectionGet("top-lenders", fy).then((sec) => {
          result.topLenders = sec?.data?.topLenders || [];
          result.fyLeaderboard = sec?.data?.fyLeaderboard || [];
        }));
      }
      if (needsDeals && !result.topDeals?.length) {
        fetches.push(fetchSectionGet("top-deals", fy).then((sec) => {
          result.topDeals = sec?.data?.topDeals || [];
        }));
      }
      await Promise.all(fetches);
    } catch {
      // ignore
    }
  }

  if (!result.monthlyTrend?.length) {
    result = await ensureMonthlyTrend(fy, result);
  }

  return result;
};


const loadFyStatsFromDashboardLive = async (fy, headers) => {
  const res = await axios.get(`${DASHBOARD_LIVE_API}?fy=${fy}`, { headers, timeout: 120000 });
  const platform = res.data?.platform || {};
  if (res.data?.platformError) throw new Error(res.data.platformError);
  const payload = normalizeFyStatsPayload(platform);
  if (!hasFyKpis(payload)) throw new Error("dashboard-live did not return KPI data");
  return buildFyStatsResult(fy, { ...payload, resource: DASHBOARD_LIVE_API, loadTimeMs: platform.loadTimeMs });
};
const buildFyStatsResult = async (fy, payload) => {
  let enriched = await enrichFyPayloadIfNeeded(fy, payload);
  enriched = await ensureMonthlyTrend(fy, enriched);
  return {
    sections: mergeFyStatsIntoSections({}, enriched),
    loadTimeMs: enriched.loadTimeMs ?? null,
    fyYear: fy,
  };
};

const loadFyStatsFromUrl = async (url, fy, headers) => {
  const res = await axios.get(`${url}?fy=${fy}`, {
    headers,
    timeout: 300000,
    validateStatus: (status) => (status >= 200 && status < 300) || status === 500,
  });
  if (res.data?.platformError) {
    throw new Error(res.data.platformError);
  }
  if (res.status === 500) {
    throw new Error(res.data?.error || extractApiError({ response: res }) || "FY stats request failed");
  }
  const payload = normalizeFyStatsPayload(res.data);
  if (!hasFyKpis(payload)) {
    throw new Error("FY stats response did not include KPI data");
  }
  return buildFyStatsResult(fy, payload);
};

const loadFyStatsFromLegacyBundle = async (fy) => {
  const bundle = await loadLegacyPlatformBundle(fy);
  const payload = {
    kpis: bundle.platformKpis?.data?.kpis,
    users: bundle.userGrowth?.data?.users,
    topLenders: bundle.topLenders?.data?.topLenders,
    fyLeaderboard: bundle.topLenders?.data?.fyLeaderboard,
    topDeals: bundle.topDeals?.data?.topDeals,
    monthlyTrend: bundle.monthlyTrend?.data?.monthlyTrend,
    fyHistory: bundle.monthlyTrend?.data?.fyHistory,
    fyYear: fy,
    resource: "/v1/ai/admin/platform-stats",
  };
  if (!hasFyKpis(payload)) {
    throw new Error("Legacy platform-stats did not return KPI data");
  }
  return buildFyStatsResult(fy, payload);
};

/** Last resort: fetch each FY section (full stats per call) and merge. */
const loadFyStatsFromSectionEndpoints = async (fy) => {
  const [platformKpis, topLendersSec, topDealsSec, monthlyTrendSec, userGrowthSec] = await Promise.all([
    fetchSectionGet("platform-kpis", fy),
    fetchSectionGet("top-lenders", fy),
    fetchSectionGet("top-deals", fy),
    fetchSectionGet("monthly-payout-trend", fy),
    fetchSectionGet("user-growth", fy),
  ]);

  if (platformKpis?.error) {
    throw new Error(platformKpis.error);
  }

  const payload = {
    kpis: platformKpis?.data?.kpis,
    users: userGrowthSec?.data?.users,
    topLenders: topLendersSec?.data?.topLenders || [],
    fyLeaderboard: topLendersSec?.data?.fyLeaderboard || [],
    topDeals: topDealsSec?.data?.topDeals || [],
    monthlyTrend: monthlyTrendSec?.data?.monthlyTrend || [],
    fyHistory: monthlyTrendSec?.data?.fyHistory || [],
    fyYear: fy,
    resource: `${AI_USER_BASE}platform-kpis`,
  };

  if (!hasFyKpis(payload)) {
    throw new Error("platform-kpis did not return KPI data");
  }
  return buildFyStatsResult(fy, payload);
};

/**
 * FY stats on demand — interest, deals, trends for selected financial year.
 */
export const loadFyStats = async (fy) => {
  const headers = requireAuth();
  const attempts = [
    () => loadFyStatsFromDashboardLive(fy, headers),
    () => loadFyStatsFromUrl(DASHBOARD_FY_STATS_API, fy, headers),
    () => loadFyStatsFromUrl(AI_FY_STATS_API, fy, headers),
    () => loadFyStatsFromLegacyBundle(fy),
    () => loadFyStatsFromSectionEndpoints(fy),
  ];

  let lastError = null;
  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (err) {
      if (isAuthError(err)) {
        clearAdminSession();
        throw err;
      }
      lastError = err;
    }
  }

  throw new Error(extractApiError(lastError) || "Failed to load FY statistics");
};

/**
 * Top lenders by total investment — all deals from platform start to now.
 */
export const loadTopLendersInvestment = async (fy, limit = 25) => {
  if (AI_DASHBOARD_USE_STATIC) {
    const staticResult = buildStaticDashboardSections(fy, false, 1, 20);
    return staticResult.sections.topLenders;
  }
  const section = await fetchSectionGet("top-lenders", fy, { limit });
  if (section?.error) {
    throw new Error(section.error);
  }
  return {
    displayName: section.displayName || "Top Lenders",
    resource: section.resource || `${AI_USER_BASE}top-lenders`,
    generatedAt: section.generatedAt || new Date().toISOString(),
    data: {
      topLenders: section?.data?.topLenders || [],
      investmentScope: section?.data?.investmentScope || "ALL_TIME",
      limit: section?.data?.limit ?? limit,
    },
  };
};

/**
 * Fast deal tab counts — running vs participation-closed normal deals.
 */
export const loadDealsDirectorySummary = async () => {
  const headers = requireAuth();
  try {
    const res = await axios.get(DEALS_DIRECTORY_SUMMARY_API, { headers, timeout: 30000 });
    if (res.data?.error) {
      throw new Error(res.data.error);
    }
    return res.data;
  } catch (err) {
    if (isAuthError(err)) {
      clearAdminSession();
      throw err;
    }
    if (isDealsDirectoryMissing(err)) {
      return loadLegacyDealsDirectorySummary();
    }
    throw err;
  }
};

/**
 * Paginated deals — AI dashboard API with legacy production fallback.
 * category: OPEN_FOR_PARTICIPATION | ACTIVE_LOAN | BORROWER_CLOSED (aliases: RUNNING, PARTICIPATION_CLOSED)
 */
export const loadDealsDirectoryPage = async (
  category = "RUNNING",
  pageNo = 1,
  pageSize = DEALS_DIRECTORY_PAGE_SIZE
) => {
  const headers = requireAuth();
  const params = new URLSearchParams({
    category,
    pageNo: String(pageNo),
    pageSize: String(pageSize),
  });
  try {
    const res = await axios.get(`${DEALS_DIRECTORY_API}?${params.toString()}`, {
      headers,
      timeout: 180000,
      validateStatus: (status) => (status >= 200 && status < 300) || status === 500,
    });
    if (res.status === 500) {
      const detail = res.data?.error || res.data?.data?.error;
      throw Object.assign(new Error(detail || "Deals directory failed"), {
        response: res,
      });
    }
    if (res.data?.error) {
      throw new Error(res.data.error);
    }
    return res.data;
  } catch (err) {
    if (isAuthError(err)) {
      clearAdminSession();
      throw err;
    }
    if (isDealsDirectoryMissing(err)) {
      return loadLegacyDealsDirectoryPage(category, pageNo, pageSize);
    }
    throw err;
  }
};

/**
 * Extended dashboard — lenders table, reconciliation (no FY stats by default).
 */
const loadDashboardExtended = async (pageNo = 1, includeRisk = false) => {
  const headers = requireAuth();
  const params = new URLSearchParams();
  if (includeRisk) params.set("includeLenderRisk", "true");
  const liveRes = await axios.get(`${DASHBOARD_LIVE_API}?${params.toString()}`, {
    headers,
    timeout: 120000,
  });
  const merged = await mergeDashboardLiveSections(liveRes.data || {}, pageNo);
  return {
    ...adaptDashboardLive(liveRes.data || {}),
    activeLendersSummary: merged.sections.activeLendersSummary?.data || {},
    participationAmounts: merged.sections.participationAmountInfo?.data?.participationAmounts || {},
    activeLenders: merged.sections.activeLenders?.data || {},
    _fullLenderCount: merged.sections._activeLendersTotalCount,
    loadTimeMs: merged.loadTimeMs,
  };
};

/**
 * Loads dashboard — fast overview first, then extended sections in background.
 */
export const loadAdminAIDashboardSections = async (
  fy,
  includeRisk = false,
  activeLendersPage = 1,
  { extendedOnly = false } = {}
) => {
  if (AI_DASHBOARD_USE_STATIC) {
    return buildStaticDashboardSections(fy, includeRisk, activeLendersPage, PAGE_SIZE);
  }

  requireAuth();

  if (extendedOnly) {
    try {
      const payload = await loadDashboardExtended(activeLendersPage, includeRisk);
      const sections = mapLiveDashboardToSections(payload, activeLendersPage);
      const errors = collectLiveErrors(payload);
      return {
        sections,
        errors,
        loadedAt: payload?.generatedAt || new Date().toISOString(),
        loadTimeMs: payload?.loadTimeMs,
      };
    } catch (liveErr) {
      if (isAuthError(liveErr)) {
        clearAdminSession();
        throw liveErr;
      }
      return loadAdminAIDashboardSectionsLegacy(fy, includeRisk, activeLendersPage, extractApiError(liveErr));
    }
  }

  try {
    const overview = await loadDashboardOverview();
    return {
      sections: overview.sections,
      errors: overview.errors,
      loadedAt: new Date().toISOString(),
      loadTimeMs: overview.loadTimeMs,
    };
  } catch (overviewErr) {
    if (isAuthError(overviewErr)) {
      clearAdminSession();
      throw overviewErr;
    }
    try {
      const payload = await loadDashboardExtended(activeLendersPage, includeRisk);
      const sections = mapLiveDashboardToSections(payload, activeLendersPage);
      const errors = collectLiveErrors(payload);
      return {
        sections,
        errors,
        loadedAt: payload?.generatedAt || new Date().toISOString(),
        loadTimeMs: payload?.loadTimeMs,
      };
    } catch (liveErr) {
      if (isAuthError(liveErr)) {
        clearAdminSession();
        throw liveErr;
      }
      const legacyResult = await loadAdminAIDashboardSectionsLegacy(
        fy,
        includeRisk,
        activeLendersPage,
        extractApiError(liveErr)
      );
      const sectionKeys = Object.keys(legacyResult.sections || {}).filter(
        (k) => !k.startsWith("_")
      );
      if (sectionKeys.length < 2) {
        const hasAuthFailure = (legacyResult.errors || []).some((e) =>
          isSessionExpiredMessage(e.message)
        );
        if (hasAuthFailure) {
          clearAdminSession();
          const err = new Error("Your session has expired. Please login again.");
          err.code = "SESSION_EXPIRED";
          throw err;
        }
        const staticResult = buildStaticDashboardSections(fy, includeRisk, activeLendersPage, PAGE_SIZE);
        return {
          ...staticResult,
          errors: [
            ...(legacyResult.errors || []),
            { key: "dashboard", message: extractApiError(liveErr) },
          ],
          source: "demo-fallback",
          loadedAt: new Date().toISOString(),
        };
      }
      return legacyResult;
    }
  }
};

/** Merge extended sections into existing overview (background load). */
export const loadDashboardExtendedSections = async (includeRisk = false, pageNo = 1) => {
  const result = await loadAdminAIDashboardSections(null, includeRisk, pageNo, { extendedOnly: true });
  return result;
};

const loadAdminAIDashboardSectionsLegacy = async (fy, includeRisk, activeLendersPage, primaryError) => {
  let activeLenderBundle = null;
  let activeLenderError = primaryError || null;
  try {
    const live = await loadLiveActiveLendersInvestment();
    activeLenderBundle = buildActiveLendersSections(live, activeLendersPage);
  } catch (liveErr) {
    activeLenderError = extractApiError(liveErr);
    try {
      activeLenderBundle = await loadAiActiveLendersInvestment(activeLendersPage);
    } catch (aiErr) {
      activeLenderError = `${activeLenderError} | AI fallback: ${extractApiError(aiErr)}`;
    }
  }

  const loaders = [
    { key: "platformKpis", load: () => fetchSectionGet("platform-kpis", fy) },
    { key: "userGrowth", load: () => fetchSectionGet("user-growth", fy) },
    { key: "topLenders", load: () => fetchSectionGet("top-lenders", fy) },
    { key: "topDeals", load: () => fetchSectionGet("top-deals", fy) },
    { key: "monthlyTrend", load: () => fetchSectionGet("monthly-payout-trend", fy) },
    { key: "reconciliation", load: () => fetchSectionGet("cms-reconciliation-daily") },
    { key: "participationAmountInfo", load: () => fetchSectionGet("participation-amount-info") },
  ];

  if (includeRisk) {
    loaders.push({ key: "lenderRisk", load: () => fetchSectionGet("lender-risk-portfolio") });
  }

  const results = await Promise.all(loaders.map(({ key, load }) => safeLoad(key, load)));

  const sections = {};
  const errors = [];
  let loadedAt = null;

  if (activeLenderBundle) {
    sections.activeLenders = activeLenderBundle.activeLenders;
    sections.activeLendersSummary = activeLenderBundle.activeLendersSummary;
    sections._activeLendersFullList = activeLenderBundle.fullList;
    loadedAt = sections.activeLenders.generatedAt;
  } else if (activeLenderError) {
    errors.push({ key: "activeLenders", message: activeLenderError });
    errors.push({ key: "activeLendersSummary", message: activeLenderError });
  }

  results.forEach(({ key, section, error }) => {
    if (section && !error) {
      sections[key] = section;
      if (section.generatedAt && !loadedAt) loadedAt = section.generatedAt;
    }
    if (error) errors.push({ key, message: error });
  });

  const fallbackMap = {
    platformKpis: async () => (await loadLegacyPlatformBundle(fy)).platformKpis,
    userGrowth: async () => (await loadLegacyPlatformBundle(fy)).userGrowth,
    topLenders: async () => (await loadLegacyPlatformBundle(fy)).topLenders,
    topDeals: async () => (await loadLegacyPlatformBundle(fy)).topDeals,
    monthlyTrend: async () => (await loadLegacyPlatformBundle(fy)).monthlyTrend,
    reconciliation: loadLegacyReconciliation,
    participationAmountInfo: loadLegacyParticipation,
  };

  let legacyBundle = null;
  for (const { key } of errors.slice()) {
    const fallback = fallbackMap[key];
    if (!fallback) continue;
    try {
      if (["platformKpis", "userGrowth", "topLenders", "topDeals", "monthlyTrend"].includes(key)) {
        if (!legacyBundle) legacyBundle = await loadLegacyPlatformBundle(fy);
        sections[key] = legacyBundle[key === "monthlyTrend" ? "monthlyTrend" : key];
      } else {
        sections[key] = await fallback();
      }
      const idx = errors.findIndex((e) => e.key === key);
      if (idx >= 0) errors.splice(idx, 1);
    } catch (fallbackErr) {
      const idx = errors.findIndex((e) => e.key === key);
      if (idx >= 0) {
        errors[idx].message = `${errors[idx].message} | Legacy: ${extractApiError(fallbackErr)}`;
      }
    }
  }

  if (includeRisk && !sections.lenderRisk) {
    try {
      const headers = requireAuth();
      const res = await axios.get(`${AI_BASE_URL}admin/lenders/intelligence-summary`, {
        headers,
        timeout: 120000,
      });
      sections.lenderRisk = wrapSection("Lender Risk Portfolio", "/v1/ai/admin/lenders/intelligence-summary", {
        lenderRisk: res.data,
      });
      const idx = errors.findIndex((e) => e.key === "lenderRisk");
      if (idx >= 0) errors.splice(idx, 1);
    } catch (e) {
      // keep error
    }
  }

  return { sections, errors, loadedAt: loadedAt || new Date().toISOString() };
};

/** Active lenders — GET /v1/ai/admin/active-lenders?startDate=&endDate=&pageNo= */
export const loadActiveLendersPage = async (pageNo = 1, options = {}) => {
  const { startDate = null, endDate = null, pageSize = PAGE_SIZE, fullList = null, totalCount = 0 } = options;
  if (AI_DASHBOARD_USE_STATIC) {
    return buildStaticActiveLendersPage(pageNo, pageSize);
  }
  try {
    const headers = requireAuth();
    const params = new URLSearchParams();
    params.set("pageNo", String(pageNo));
    params.set("pageSize", String(pageSize));
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    const res = await axios.get(`${AI_ACTIVE_LENDERS_API}?${params.toString()}`, {
      headers,
      timeout: 120000,
    });
    const d = res.data?.data || res.data || {};
    return wrapSection("Active Lenders Table", AI_ACTIVE_LENDERS_API, {
      activeLenders: d.activeLenders || [],
      totalCount: d.totalCount ?? totalCount,
      totalInvestment: d.totalInvestment,
      startDate: d.startDate,
      endDate: d.endDate,
      pageNo: d.pageNo || pageNo,
      pageSize: d.pageSize || pageSize,
    });
  } catch (e) {
    if (isAuthError(e)) {
      clearAdminSession();
      throw e;
    }
    if (fullList && fullList.length) {
      const from = (pageNo - 1) * pageSize;
      const page = fullList.slice(from, from + pageSize);
      return wrapSection("Active Lenders Table", AI_ACTIVE_LENDERS_API, {
        activeLenders: page,
        totalCount: fullList.length,
        totalInvestment: sumInvestment(fullList),
        pageNo,
        pageSize,
      });
    }
    try {
      const legacy = await loadLiveActiveLendersInvestment();
      const list = legacy.list || [];
      const from = (pageNo - 1) * pageSize;
      const page = list.slice(from, from + pageSize);
      return wrapSection("Active Lenders Table", legacy.resource || LIVE_ACTIVE_LENDERS_API, {
        activeLenders: page,
        totalCount: list.length,
        totalInvestment: legacy.totalInvestment ?? sumInvestment(list),
        startDate,
        endDate,
        pageNo,
        pageSize,
        fallbackNote: startDate
          ? "Period filter unavailable — restart backend. Showing all-time lenders."
          : "Loaded from activLendersParicipationAmount (legacy).",
      });
    } catch (_) {
      /* use original error */
    }
    throw e;
  }
};

const unwrapPaymentsPayload = (raw) => {
  if (Array.isArray(raw)) {
    return { payments: raw, source: "legacy" };
  }
  if (Array.isArray(raw?.data)) {
    return { payments: raw.data, source: "legacy" };
  }
  if (raw?.data && (raw.data.upcomingDeals || raw.data.payments || raw.data.summary)) {
    return { ...raw.data, source: raw.data.source || "ai" };
  }
  return raw;
};

const ensureUpcomingDeals = (payload, daysAhead, skipWindowFilter = false) => {
  if (!payload?.upcomingDeals?.length) {
    const payments = payload?.payments || [];
    if (payments.length) {
      payload.upcomingDeals = flattenPaymentsToDeals(payments, daysAhead, skipWindowFilter);
    }
  }
  return payload;
};

/** View Payments — uses dealLevelInterestPaymentsInfo via AI admin API */
export const getViewPayments = async ({
  daysAhead = 3,
  mode = "auto",
  monthName,
  year,
  startDate,
  endDate,
} = {}) => {
  if (AI_DASHBOARD_USE_STATIC) {
    return { data: buildStaticPaymentsData(daysAhead) };
  }

  let headers;
  try {
    headers = requireAuth();
  } catch (authErr) {
    throw authErr;
  }

  const params = new URLSearchParams();
  params.set("daysAhead", String(daysAhead));
  if (mode === "month" && monthName && year) {
    params.set("monthName", monthName);
    params.set("year", year);
    params.set("startDate", String(startDate || 1));
    params.set("endDate", String(endDate || 31));
  }

  try {
    const res = await axios.get(`${AI_VIEW_PAYMENTS_API}?${params.toString()}`, {
      headers,
      timeout: 180000,
    });
    if (res.data?.error) {
      throw new Error(res.data.error);
    }
    const payload = ensureUpcomingDeals(
      unwrapPaymentsPayload(res.data),
      daysAhead,
      mode === "month"
    );
    payload.daysAhead = payload.daysAhead ?? daysAhead;
    payload.source = payload.source || "live";
    return { data: payload };
  } catch (aiErr) {
    if (isAuthError(aiErr)) {
      clearAdminSession();
      throw aiErr;
    }
  }

  if (mode === "month" && monthName && year) {
    try {
      const legacy = await fetchLegacyPaymentsByMonth(headers, {
        monthName,
        year,
        startDate: startDate || "1",
        endDate: endDate || "31",
        daysAhead,
      });
      return { data: { ...legacy, source: "live" } };
    } catch (legacyErr) {
      if (isAuthError(legacyErr)) {
        clearAdminSession();
        throw legacyErr;
      }
      throw new Error(extractApiError(legacyErr));
    }
  }

  try {
    const res = await axios.get(`${DASHBOARD_UPCOMING_INTEREST_API}?daysAhead=${daysAhead}`, {
      headers,
      timeout: 180000,
    });
    if (res.data?.error) {
      throw new Error(res.data.error);
    }
    const payload = ensureUpcomingDeals(unwrapPaymentsPayload(res.data), daysAhead);
    payload.daysAhead = payload.daysAhead ?? daysAhead;
    payload.source = "live";
    return { data: payload };
  } catch (dashErr) {
    if (isAuthError(dashErr)) {
      clearAdminSession();
      throw dashErr;
    }
    try {
      const legacy = await fetchLegacyUpcomingInterest(headers, daysAhead);
      const payload = ensureUpcomingDeals({ ...legacy, source: "live" }, daysAhead);
      payload.daysAhead = payload.daysAhead ?? daysAhead;
      return { data: payload };
    } catch (legacyErr) {
      if (isAuthError(legacyErr)) {
        clearAdminSession();
        throw legacyErr;
      }
      return {
        data: {
          ...buildStaticPaymentsData(daysAhead),
          source: "static-fallback",
          fallbackReason: extractApiError(legacyErr),
        },
      };
    }
  }
};

export const getUpcomingInterestPayments = getViewPayments;

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const parsePaymentDate = (str) => {
  if (!str) return null;
  const parts = String(str).split("-");
  if (parts.length !== 3) return null;
  const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  return Number.isNaN(d.getTime()) ? null : d;
};

const flattenPaymentsToDeals = (payments, daysAhead = 3, skipWindowFilter = false) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deals = [];
  (payments || []).forEach((row) => {
    const payDate = parsePaymentDate(row.paymentDate);
    const daysUntil = payDate
      ? Math.round((payDate - today) / (1000 * 60 * 60 * 24))
      : 0;
    const dayLabel =
      daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : daysUntil > 1 ? `In ${daysUntil} days` : `${Math.abs(daysUntil)}d ago`;
    (row.dealLevelInterestPaymentsDto || []).forEach((deal) => {
      deals.push({
        paymentDate: row.paymentDate,
        paymentDateLabel: payDate
          ? payDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })
          : row.paymentDate,
        daysUntil,
        dayLabel,
        dealId: deal.dealId,
        dealName: deal.dealName || deal.DealName || `Deal #${deal.dealId}`,
        totalInterest: Math.round(Number(deal.totalInterest) || 0),
        noOfLenders: deal.noOfLenders || 0,
        dealStatus: deal.dealStatus || "PENDING",
        paymentStatus: row.status || "PENDING",
        rateOfInterest: deal.rateOfInterest,
        currentValue: deal.currentValue,
        totalDealValue: deal.totalDealValue,
        totalAchievedValue: deal.totalAchievedValue,
        withDrawlValue: deal.withDrawlValue,
        actualPaymentDate: deal.actualPaymentDate,
      });
    });
  });
  const sorted = deals.sort(
    (a, b) =>
      (parsePaymentDate(a.paymentDate)?.getTime() || 0) -
        (parsePaymentDate(b.paymentDate)?.getTime() || 0) ||
      a.dealName.localeCompare(b.dealName)
  );
  if (skipWindowFilter) return sorted;
  return sorted.filter((d) => d.daysUntil >= 0 && d.daysUntil < daysAhead);
};

const fetchMonthPayments = async (headers, monthName, year, startDate, endDate) => {
  const url = `${API_USER_URL}dealLevelInterestPaymentsInfo/${encodeURIComponent(monthName)}/${year}?startDate=${startDate}&endDate=${endDate}`;
  const res = await axios.get(url, { headers, timeout: 180000 });
  return Array.isArray(res.data) ? res.data : [];
};

const fetchLegacyUpcomingInterest = async (headers, daysAhead) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setDate(end.getDate() + daysAhead - 1);

  const payments = [];
  let cursor = new Date(today.getFullYear(), today.getMonth(), 1);
  while (cursor <= end) {
    const isStartMonth =
      cursor.getMonth() === today.getMonth() && cursor.getFullYear() === today.getFullYear();
    const isEndMonth =
      cursor.getMonth() === end.getMonth() && cursor.getFullYear() === end.getFullYear();
    const monthStart = isStartMonth ? today.getDate() : 1;
    const lastDay = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const monthEnd = isEndMonth ? end.getDate() : lastDay;
    try {
      const chunk = await fetchMonthPayments(
        headers,
        MONTH_NAMES[cursor.getMonth()],
        String(cursor.getFullYear()),
        monthStart,
        monthEnd
      );
      payments.push(...chunk);
    } catch {
      // continue other months
    }
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }

  const upcomingDeals = flattenPaymentsToDeals(payments, daysAhead);
  const totalInterest = upcomingDeals.reduce((s, d) => s + (d.totalInterest || 0), 0);
  return {
    daysAhead,
    windowFrom: today.toISOString().slice(0, 10),
    windowTo: end.toISOString().slice(0, 10),
    windowLabel: `${today.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`,
    payments,
    upcomingDeals,
    summary: {
      daysAhead,
      paymentDateCount: payments.length,
      totalDeals: upcomingDeals.length,
      totalInterest,
      pendingDates: payments.filter((p) => p.status !== "COMPLETED").length,
      completedDates: payments.filter((p) => p.status === "COMPLETED").length,
    },
    loadTimeMs: null,
    source: "legacy",
  };
};

const fetchLegacyPaymentsByMonth = async (
  headers,
  { monthName, year, startDate, endDate, daysAhead = 30 }
) => {
  const payments = await fetchMonthPayments(headers, monthName, year, startDate, endDate);
  const upcomingDeals = flattenPaymentsToDeals(payments, daysAhead, true);
  const totalInterest = upcomingDeals.reduce((s, d) => s + (d.totalInterest || 0), 0);
  return {
    daysAhead,
    windowLabel: `${monthName} ${year} (day ${startDate}–${endDate})`,
    payments,
    upcomingDeals,
    summary: {
      daysAhead,
      paymentDateCount: payments.length,
      totalDeals: upcomingDeals.length,
      totalInterest,
      pendingDates: payments.filter((p) => p.status !== "COMPLETED").length,
      completedDates: payments.filter((p) => p.status === "COMPLETED").length,
    },
    loadTimeMs: null,
    source: "legacy",
  };
};


/** CMS interest payout for a deal (lender_cms_payments + details). paymentDate = dd-MM-yyyy */

/** CMS interest payouts across deals in a payment-date range (yyyy-MM-dd or dd-MM-yyyy). */
export const loadCmsInterestPaymentsToday = async () => {
  const headers = requireAuth();
  try {
    const res = await axios.get(`${AI_BASE_URL}admin/cms-interest-payments/today`, { headers, timeout: 90000 });
    return res.data?.data ?? res.data;
  } catch (err) {
    const status = err?.response?.status;
    const serverErr = err?.response?.data?.error || err?.response?.data?.errorMessage;
    if (status === 404) {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, "0");
      const d = String(today.getDate()).padStart(2, "0");
      return loadCmsInterestPaymentsInRange(`${y}-${m}-${d}`, `${y}-${m}-${d}`, { includeUnpaid: false });
    }
    if (err?.code === "ECONNABORTED") {
      throw new Error("CMS today request timed out. Check backend on port 8181.");
    }
    if (!err?.response) {
      throw new Error("Cannot reach backend (network error). Is the server running on port 8181?");
    }
    throw new Error(serverErr || extractApiError(err) || "CMS today load failed");
  }
};

export const loadCmsInterestPaymentsInRange = async (fromDate, toDate, { includeUnpaid = false } = {}) => {
  const headers = requireAuth();
  const params = new URLSearchParams();
  if (fromDate) params.set("fromDate", fromDate);
  if (toDate) params.set("toDate", toDate);
  if (includeUnpaid) params.set("includeUnpaid", "true");
  const qs = params.toString() ? `?${params.toString()}` : "";
  try {
    const res = await axios.get(`${AI_BASE_URL}admin/cms-interest-payments${qs}`, { headers, timeout: 180000 });
    return res.data?.data ?? res.data;
  } catch (err) {
    const status = err?.response?.status;
    const serverErr = err?.response?.data?.error || err?.response?.data?.errorMessage;
    if (status === 404) {
      throw new Error("CMS API not found. Rebuild backend: mvn install -pl oxyloans-service,oxyloans-rest -am then restart on port 8181.");
    }
    if (status === 500 && !serverErr) {
      throw new Error("CMS server error. Run: mvn install -pl oxyloans-service,oxyloans-rest -am then restart backend.");
    }
    if (err?.code === "ECONNABORTED") {
      throw new Error("CMS report timed out. Try a shorter date range or turn off unpaid-lender list.");
    }
    if (!err?.response) {
      throw new Error("Cannot reach backend (network error). Is the server running on port 8181?");
    }
    throw new Error(serverErr || extractApiError(err) || "CMS payout load failed");
  }
};
export const loadDealCmsInterestPayments = async (dealId, paymentDate = null, opts = {}) => {
  const headers = requireAuth();
  const q = new URLSearchParams();
  if (paymentDate) q.set("paymentDate", paymentDate);
  if (opts.cmsPaymentId) q.set("cmsPaymentId", String(opts.cmsPaymentId));
  if (opts.returnsType) q.set("returnsType", opts.returnsType);
  const qs = q.toString() ? `?${q.toString()}` : "";
  const res = await axios.get(
    `${AI_BASE_URL}admin/deals/${dealId}/cms-interest-payments${qs}`,
    { headers, timeout: 120000 }
  );
  return res.data?.data ?? res.data;
};

/** All CMS interest payment cycles for a deal (newest first). */
export const loadDealCmsInterestPaymentHistory = async (dealId) => {
  const headers = requireAuth();
  const res = await axios.get(
    `${AI_BASE_URL}admin/deals/${dealId}/cms-interest-payments/history`,
    { headers, timeout: 120000 }
  );
  return res.data?.data ?? res.data ?? [];
};
export { AI_DASHBOARD_USE_STATIC } from "../../config";
