import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import { saveAs } from "file-saver";
import {
  FaRobot,
  FaUsers,
  FaUserFriends,
  FaHandshake,
  FaChartLine,
  FaUserClock,
  FaTrophy,
  FaMedal,
  FaCopy,
  FaBriefcase,
  FaFileExcel,
  FaCalendarDay,
  FaCheckCircle,
  FaUserSlash,
  FaFilter,
  FaUserCheck,
  FaUserPlus,
  FaEnvelope,
  FaWhatsapp,
  FaSync,
  FaFilePdf,
  FaTimes,
  FaEye,
} from "react-icons/fa";
import OxyloansAdminSidebar from "../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../Header/OxyloansAdminHeader";
import Footer from "../../../Footer/Footer";
import { getAdminAIPlatformStats } from "../../../HttpRequest/afterlogin";
import AdminNotificationPanel from "./Notification/AdminNotificationPanel";
import {
  getAdminAIActiveLenderDeals,
  getAdminAIActiveLenderProfile,
  getAdminAIActiveLenderBankDetails,
  getAdminAIActiveLenderWallet,
  getAdminAIActiveLenderReferrals,
  getAdminAIActiveLenders,
  getAdminAIUsers,
  defaultParticipationDate,
  getAdminAIInactiveReactivatedLenders,
  getAdminAITopLenders,
  getAdminAIMonthlyTopLenders,
  getAdminAITopLendersMonthlyTrend,
  getAdminAIActiveLenderLegacyDetails,
  getAdminAIActiveLenderStates,
  getRegisteredUsersSummary,
  getOldDashboardActiveLendersCount,
  getAdminAIReferralRegistrationsSummary,
  getAdminAIReferralRegistrationsYearlySummary,
  getAdminAIReferralRegistrations,
  getAdminAITopReferrers,
  getAdminAITopPaidEarnedReferrers,
  getAdminAILenderAnalyticsLenders,
  downloadAdminAIDashboardExcel,
  downloadAdminAIUsersExcel,
  parseAdminAIExportError,
  fetchAllAdminUsersForExport,
  fetchAllCreatedDealsForExport,
  fetchAllActiveLendersForExport,
  fetchParticipationAmountsForBandCounts,
  downloadAdminAIActiveLendersExcel,
  getAdminAICreatedDeals,
} from "../../../HttpRequest/admin";
import { BASE_URL } from "../../../../config";
import "./AdminAIDashboard.css";
import AdminAIUserGeographyPanel from "./AdminAIUserGeographyPanel";
import AdminAILenderAnalyticsPanel from "./AdminAILenderAnalyticsPanel";
import AdminAILatestFirstParticipatedPanel from "./AdminAILatestFirstParticipatedPanel";
import AdminAILenderCampaignModal from "./AdminAILenderCampaignModal";
import AdminAIAutoEmailDraftModal from "./AdminAIAutoEmailDraftModal";
import { OXYINSIGHTS_PATH } from "./adminAINavigation";
import { exportTopReferrersLentTreePdf } from "./exportTopReferrersLentTreePdf";
import { downloadTopPaidEarnedExcel } from "./AdminAITopPaidEarnedReferrersPage";

const ADMIN_AI_DASHBOARD_CACHE_KEY = "oxyloans.adminAIDashboard.bootstrap.v2";
const ADMIN_AI_DASHBOARD_CACHE_TTL_MS = 30 * 60 * 1000;

const readAdminAIDashboardCache = () => {
  try {
    const raw = sessionStorage.getItem(ADMIN_AI_DASHBOARD_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > ADMIN_AI_DASHBOARD_CACHE_TTL_MS) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const writeAdminAIDashboardCache = (payload) => {
  try {
    sessionStorage.setItem(
      ADMIN_AI_DASHBOARD_CACHE_KEY,
      JSON.stringify({ ...payload, savedAt: Date.now() })
    );
  } catch {
    // ignore quota / private mode
  }
};

const clearAdminAIDashboardCache = () => {
  try {
    sessionStorage.removeItem(ADMIN_AI_DASHBOARD_CACHE_KEY);
  } catch {
    // ignore
  }
};

const activeLendersPageSize = 20;
const adminUserPageSize = 20;
const PARTICIPATION_50_LAKH = 5000000;
const PARTICIPATION_1_CRORE = 10000000;
const PARTICIPATION_2_CRORE = 20000000;
const PARTICIPATION_3_CRORE = 30000000;
const activeLenderPanelCardKeys = [
  "newParticipatedLenders",
  "participation50LakhTo1Crore",
  "participation1CroreTo2Crore",
  "participation2CroreTo3Crore",
  "participation3CrorePlus",
];
const participationRangeByCard = {
  participation50LakhTo1Crore: { min: PARTICIPATION_50_LAKH, max: PARTICIPATION_1_CRORE },
  participation1CroreTo2Crore: { min: PARTICIPATION_1_CRORE, max: PARTICIPATION_2_CRORE },
  participation2CroreTo3Crore: { min: PARTICIPATION_2_CRORE, max: PARTICIPATION_3_CRORE },
  participation3CrorePlus: { min: PARTICIPATION_3_CRORE, max: null },
};
const activeLenderPanelMeta = {
  newParticipatedLenders: {
    title: "New Participated Lenders",
    description: "Lenders whose first-ever deal participation happened today. Open participation to view profile and deal history.",
    exportSlug: "new-participated-lenders",
  },
  participation50LakhTo1Crore: {
    title: "50 Lakhs to Below 1 Crore",
    description: "Lenders with total participation (including updation) from Rs 50,00,000 up to below Rs 1,00,00,000.",
    segment: "participation50LakhTo1Crore",
    segmentLabel: "50 Lakhs to Below 1 Crore Lenders",
    exportSlug: "participation-50-lakh-to-1-crore",
  },
  participation1CroreTo2Crore: {
    title: "1 Crore to Below 2 Crores",
    description: "Lenders with total participation (including updation) from Rs 1,00,00,000 up to below Rs 2,00,00,000.",
    segment: "participation1CroreTo2Crore",
    segmentLabel: "1 Crore to Below 2 Crores Lenders",
    exportSlug: "participation-1-crore-to-2-crore",
  },
  participation2CroreTo3Crore: {
    title: "2 Crores to Below 3 Crores",
    description: "Lenders with total participation (including updation) from Rs 2,00,00,000 up to below Rs 3,00,00,000.",
    segment: "participation2CroreTo3Crore",
    segmentLabel: "2 Crores to Below 3 Crores Lenders",
    exportSlug: "participation-2-crore-to-3-crore",
  },
  participation3CrorePlus: {
    title: "3 Crores and Above",
    description: "Lenders with total participation (including updation) of Rs 3,00,00,000 or more.",
    segment: "participation3CrorePlus",
    segmentLabel: "3 Crores and Above Lenders",
    exportSlug: "participation-3-crore-plus",
  },
};
const topLendersLimit = 10;

const currentYearMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const emptyRegisteredUsersBreakdown = {
  borrowers: 0,
  lenders: 0,
  testBorrowers: 0,
  testLenders: 0,
  verifiedEmailBorrowers: 0,
  verifiedEmailLenders: 0,
  unverifiedEmailBorrowers: 0,
  unverifiedEmailLenders: 0,
};

const fallbackStats = {
  allUsers: 0,
  rawLenders: 0,
  goodLenders: 0,
  goodLendersVerified: 0,
  goodLendersUnverifiedEmail: 0,
  notParticipatedRegistered1Month: 0,
  notParticipatedRegistered3Months: 0,
  notParticipatedRegistered6Months: 0,
  notParticipatedRegistered1Year: 0,
  eliminatedLenders: 0,
  activeCleanLenders: 0,
  lenderQualityFilterActive: false,
  lenderQualityError: "",
  lenderQualityBreakdown: {
    testUsers: 0,
    invalidMobile: 0,
    invalidEmail: 0,
    duplicateMobile: 0,
    duplicateName: 0,
  },
  allBorrowers: 0,
  registeredBorrowersCampaignCount: 0,
  registeredBorrowersVerifiedEmailCampaignCount: 0,
  registeredBorrowersValidEmailCount: 0,
  registeredUsersBreakdown: emptyRegisteredUsersBreakdown,
  allActiveLenders: 0,
  participation50LakhTo1Crore: 0,
  participation1CroreTo2Crore: 0,
  participation2CroreTo3Crore: 0,
  participation3CrorePlus: 0,
  todayRegisteredUsers: 0,
  todayParticipatedUsers: 0,
  newParticipatedLenders: 0,
  referralRegisteredUsers: 0,
  lastThreeMonthsActiveLenders: 0,
  allDeals: 0,
  activeDeals: 0,
  closedDeals: 0,
  testDeals: 0,
  todayDealsCreated: 0,
  todayDealsClosed: 0,
};

const userViewByCard = {
  allUsers: "registered",
  allLenders: "lendersRaw",
  goodLenders: "lendersNotParticipated",
  notParticipatedRegistered1Month: "lendersNotParticipatedRegistered1Month",
  notParticipatedRegistered3Months: "lendersNotParticipatedRegistered3Months",
  notParticipatedRegistered6Months: "lendersNotParticipatedRegistered6Months",
  notParticipatedRegistered1Year: "lendersNotParticipatedRegistered1Year",
  eliminatedLenders: "lendersExcluded",
  allBorrowers: "borrowers",
  lastThreeMonthsActiveLenders: "last3MonthsActive",
  todayRegisteredUsers: "todayRegistered",
  todayParticipatedUsers: "todayParticipated",
};

const userExportByCard = {
  allUsers: { type: "users", userView: "registered", label: "Registered Users", fileSlug: "registered-users" },
  allLenders: { type: "users", userView: "lendersRaw", label: "Registered Lenders", fileSlug: "registered-lenders-raw" },
  goodLenders: { type: "users", userView: "lendersNotParticipated", label: "Not Participated Lenders", fileSlug: "not-participated-lenders" },
  notParticipatedRegistered1Month: { type: "users", userView: "lendersNotParticipatedRegistered1Month", label: "Last 1 Month Registered - Not Participated", fileSlug: "last-1-month-registered-not-participated-lenders" },
  notParticipatedRegistered3Months: { type: "users", userView: "lendersNotParticipatedRegistered3Months", label: "Last 3 Months Registered - Not Participated", fileSlug: "last-3-months-registered-not-participated-lenders" },
  notParticipatedRegistered6Months: { type: "users", userView: "lendersNotParticipatedRegistered6Months", label: "Last 6 Months Registered - Not Participated", fileSlug: "last-6-months-registered-not-participated-lenders" },
  notParticipatedRegistered1Year: { type: "users", userView: "lendersNotParticipatedRegistered1Year", label: "Last 1 Year Registered - Not Participated", fileSlug: "last-1-year-registered-not-participated-lenders" },
  eliminatedLenders: { type: "users", userView: "lendersExcluded", label: "Eliminated Lenders", fileSlug: "eliminated-lenders" },
  allBorrowers: { type: "users", userView: "borrowers", label: "Registered Borrowers", fileSlug: "registered-borrowers" },
  allActiveLenders: { type: "activeLenders", label: "All Active Lenders", fileSlug: "all-active-lenders" },
  newParticipatedLenders: {
    type: "activeLenders",
    label: "New Participated Lenders",
    fileSlug: "new-participated-lenders",
    lenderView: "newParticipated",
  },
  participation50LakhTo1Crore: {
    type: "activeLenders",
    label: "50 Lakhs to Below 1 Crore Lenders",
    fileSlug: "participation-50-lakh-to-1-crore",
    minParticipationAmount: PARTICIPATION_50_LAKH,
    maxParticipationAmount: PARTICIPATION_1_CRORE,
  },
  participation1CroreTo2Crore: {
    type: "activeLenders",
    label: "1 Crore to Below 2 Crores Lenders",
    fileSlug: "participation-1-crore-to-2-crore",
    minParticipationAmount: PARTICIPATION_1_CRORE,
    maxParticipationAmount: PARTICIPATION_2_CRORE,
  },
  participation2CroreTo3Crore: {
    type: "activeLenders",
    label: "2 Crores to Below 3 Crores Lenders",
    fileSlug: "participation-2-crore-to-3-crore",
    minParticipationAmount: PARTICIPATION_2_CRORE,
    maxParticipationAmount: PARTICIPATION_3_CRORE,
  },
  participation3CrorePlus: {
    type: "activeLenders",
    label: "3 Crores and Above Lenders",
    fileSlug: "participation-3-crore-plus",
    minParticipationAmount: PARTICIPATION_3_CRORE,
  },
  lastThreeMonthsActiveLenders: { type: "users", userView: "last3MonthsActive", label: "Last 3 Months Active", fileSlug: "last-3-months-active" },
  todayRegisteredUsers: { type: "users", userView: "todayRegistered", label: "Today Registered", fileSlug: "today-registered" },
  todayParticipatedUsers: { type: "users", userView: "todayParticipated", label: "Today Participated", fileSlug: "today-participated" },
};

const lenderQualityChipViews = {
  testUsers: {
    userView: "lendersExcludedTestUsers",
    label: "Test Users Removed",
    chipLabel: "Test users removed",
    fileSlug: "eliminated-test-users",
  },
  invalidMobile: {
    userView: "lendersExcludedInvalidMobile",
    label: "Invalid / Fake Mobile",
    chipLabel: "Invalid / fake mobile",
    fileSlug: "eliminated-invalid-mobile",
  },
  invalidEmail: {
    userView: "lendersExcludedInvalidEmail",
    label: "Invalid Email",
    chipLabel: "Invalid email",
    fileSlug: "eliminated-invalid-email",
  },
  duplicateMobile: {
    userView: "lendersExcludedDuplicateMobile",
    label: "Duplicate Mobile",
    chipLabel: "Duplicate mobile",
    fileSlug: "eliminated-duplicate-mobile",
  },
  duplicateName: {
    userView: "lendersExcludedDuplicateName",
    label: "Duplicate First+Last Name",
    chipLabel: "Duplicate first+last name",
    fileSlug: "eliminated-duplicate-name",
  },
};

/** Boxes shown after clicking Registered Users. */
const registeredUsersBreakdownBoxes = [
  {
    key: "borrowers",
    userView: "borrowers",
    label: "Borrowers",
    meta: "Non-test BORROWER accounts",
    accent: "violet",
    countKey: "borrowers",
  },
  {
    key: "lenders",
    userView: "registeredLenders",
    label: "Lenders",
    meta: "Non-test LENDER accounts",
    accent: "indigo",
    countKey: "lenders",
  },
  {
    key: "testBorrowers",
    userView: "testBorrowers",
    label: "Test Borrowers",
    meta: "test_user = true · BORROWER",
    accent: "amber",
    countKey: "testBorrowers",
  },
  {
    key: "testLenders",
    userView: "testLenders",
    label: "Test Lenders",
    meta: "test_user = true · LENDER",
    accent: "orange",
    countKey: "testLenders",
  },
  {
    key: "verifiedEmailBorrowers",
    userView: "registeredBorrowersVerifiedEmail",
    label: "Verified Email Borrowers",
    meta: "email_verified · BORROWER",
    accent: "emerald",
    countKey: "verifiedEmailBorrowers",
  },
  {
    key: "verifiedEmailLenders",
    userView: "registeredLendersVerifiedEmail",
    label: "Verified Email Lenders",
    meta: "email_verified · LENDER",
    accent: "teal",
    countKey: "verifiedEmailLenders",
  },
  {
    key: "unverifiedEmailBorrowers",
    userView: "registeredBorrowersUnverifiedEmail",
    label: "Unverified Email Borrowers",
    meta: "email not verified · BORROWER",
    accent: "rose",
    countKey: "unverifiedEmailBorrowers",
  },
  {
    key: "unverifiedEmailLenders",
    userView: "registeredLendersUnverifiedEmail",
    label: "Unverified Email Lenders",
    meta: "email not verified · LENDER",
    accent: "cyan",
    countKey: "unverifiedEmailLenders",
  },
];

const isEliminatedUserView = (userView) => String(userView || "").startsWith("lendersExcluded");

const fmtNum = (n) => (n == null ? "0" : Number(n).toLocaleString("en-IN"));
const fmtMoney = (n) => `Rs ${fmtNum(n)}`;
/** Official compact INR for rankings (Cr / Lakh). */
const fmtOfficialMoney = (n) => {
  const value = Number(n);
  if (!Number.isFinite(value)) return String(n ?? "");
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 10000000) {
    return `${sign}₹ ${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹ ${(abs / 100000).toFixed(2)} L`;
  }
  return `${sign}₹ ${Math.round(abs).toLocaleString("en-IN")}`;
};
const shortLenderLabel = (row) => {
  const code = row?.userCode || (row?.lenderId ? `LR${row.lenderId}` : "");
  const name = String(row?.name || "").trim();
  const shortName = name.length > 16 ? `${name.slice(0, 15)}…` : name;
  return shortName ? `${code} · ${shortName}` : (code || "Lender");
};
const pickNumber = (...values) => {
  for (const value of values) {
    if (value != null && value !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return 0;
};
const pickPositiveNumber = (...values) => {
  for (const value of values) {
    if (value != null && value !== "" && !Number.isNaN(Number(value))) {
      const parsed = Number(value);
      if (parsed > 0) {
        return parsed;
      }
    }
  }
  return 0;
};
const hasParticipationBandSummaryFields = (summaryData = {}) =>
  Number(summaryData.participationBandsVersion) >= 2
  || summaryData.participationBands != null
  || summaryData.participation50LakhTo1CroreCount != null;
const lenderParticipationAmount = (lender = {}) =>
  Number(lender?.totalParticipationAmount) || 0;
const matchesParticipationRange = (amount, range) => {
  if (!range) {
    return true;
  }
  if (amount < range.min) {
    return false;
  }
  if (range.max && amount >= range.max) {
    return false;
  }
  return true;
};
const mapLegacyActiveLenderRow = (row = {}) => ({
  lenderId: row.lenderId,
  name: row.lenderName || row.name || "",
  email: row.email || "",
  mobileNumber: row.mobileNumber || "",
  city: row.city || "",
  state: row.state || "",
  pincode: row.pincode || "",
  dealsCount: pickNumber(row.dealsCount),
  totalParticipationAmount: lenderParticipationAmount(row),
});
let participationLenderRowsCache = null;
const rememberParticipationLenderRows = (rows = []) => {
  participationLenderRowsCache = rows.map((row) => (
    row.lenderId != null ? row : mapLegacyActiveLenderRow(row)
  ));
  return participationLenderRowsCache;
};
const getParticipationLenderRows = async () => {
  if (participationLenderRowsCache?.length) {
    return participationLenderRowsCache;
  }
  await loadParticipationBandCountsFromDatabase();
  return participationLenderRowsCache || [];
};
const filterParticipationBandLenders = (rows = [], participationRange, filters = {}) => {
  const lenderId = String(filters.lenderId || "").trim();
  const mobileNumber = String(filters.mobileNumber || "").trim();
  return rows
    .filter((row) => matchesParticipationRange(lenderParticipationAmount(row), participationRange))
    .filter((row) => !lenderId || String(row.lenderId) === lenderId)
    .filter((row) => !mobileNumber || String(row.mobileNumber || "").includes(mobileNumber))
    .sort((left, right) => lenderParticipationAmount(right) - lenderParticipationAmount(left));
};
const paginateParticipationBandLenders = (rows = [], pageNo = 1, pageSize = activeLendersPageSize) => {
  const offset = (pageNo - 1) * pageSize;
  return {
    activeLenders: rows.slice(offset, offset + pageSize),
    totalCount: rows.length,
    pageNo,
  };
};
const looksLikeValidParticipationList = (data, participationRange) => {
  const rows = data?.activeLenders || [];
  if (!rows.length) {
    return true;
  }
  return rows.every((row) => matchesParticipationRange(lenderParticipationAmount(row), participationRange));
};
const looksLikeValidBandCounts = (counts, activeLendersCount = 0) => {
  const values = [
    counts.participation50LakhTo1Crore,
    counts.participation1CroreTo2Crore,
    counts.participation2CroreTo3Crore,
    counts.participation3CrorePlus,
  ];
  if (values.every((value) => value === 0)) {
    return activeLendersCount <= 0;
  }
  const unique = new Set(values);
  if (unique.size === 1 && values[0] === activeLendersCount && activeLendersCount > 0) {
    return false;
  }
  const bandTotal = values.reduce((sum, value) => sum + value, 0);
  return bandTotal > 0 && bandTotal <= activeLendersCount;
};
const bucketParticipationCountsFromLenders = (lenders = []) => {
  const counts = {
    participation50LakhTo1Crore: 0,
    participation1CroreTo2Crore: 0,
    participation2CroreTo3Crore: 0,
    participation3CrorePlus: 0,
  };
  lenders.forEach((lender) => {
    const amount = lenderParticipationAmount(lender);
    if (amount >= PARTICIPATION_3_CRORE) {
      counts.participation3CrorePlus += 1;
    } else if (amount >= PARTICIPATION_2_CRORE) {
      counts.participation2CroreTo3Crore += 1;
    } else if (amount >= PARTICIPATION_1_CRORE) {
      counts.participation1CroreTo2Crore += 1;
    } else if (amount >= PARTICIPATION_50_LAKH) {
      counts.participation50LakhTo1Crore += 1;
    }
  });
  return counts;
};
const loadParticipationBandCountsFromDatabase = async () => {
  try {
    const { rows } = await fetchParticipationAmountsForBandCounts();
    if (rows.length) {
      rememberParticipationLenderRows(rows);
      return bucketParticipationCountsFromLenders(rows);
    }
  } catch {
    // Fall through to active-lender export below.
  }
  const { rows } = await fetchAllActiveLendersForExport();
  rememberParticipationLenderRows(rows);
  return bucketParticipationCountsFromLenders(rows);
};
const loadParticipationBandLendersFromDatabase = async (
  pageNo = 1,
  filters = {},
  participationRange
) => {
  const allRows = await getParticipationLenderRows();
  const filteredRows = filterParticipationBandLenders(allRows, participationRange, filters);
  return paginateParticipationBandLenders(filteredRows, pageNo, activeLendersPageSize);
};
const derivedRawLendersCount = (summaryData = {}, registrationBreakdown = {}) =>
  pickNumber(
    summaryData.rawLendersCount,
    summaryData.primaryTypeCounts?.LENDER,
    pickNumber(summaryData.registeredUsersCount, registrationBreakdown.registeredUsers)
      - pickNumber(summaryData.borrowersCount, registrationBreakdown.borrowers)
  );
const fetchAdminUserViewCount = async (userView) => {
  const data = responseData(await getAdminAIUsers(1, 1, userView, {}));
  return pickNumber(data.totalCount);
};
const enrichMissingSummaryFields = async (summaryData = {}, registrationBreakdown = {}) => {
  const enriched = { ...summaryData };
  if (!pickNumber(summaryData.rawLendersCount)) {
    const derivedRawLenders = derivedRawLendersCount(summaryData, registrationBreakdown);
    if (derivedRawLenders > 0) {
      enriched.rawLendersCount = derivedRawLenders;
    } else {
      try {
        enriched.rawLendersCount = await fetchAdminUserViewCount("lendersRaw");
      } catch {
        enriched.rawLendersCount = derivedRawLenders;
      }
    }
  }
  if (!pickNumber(summaryData.notParticipatedLendersTotal) && !pickNumber(summaryData.goodLendersCount)) {
    try {
      const notParticipatedCount = await fetchAdminUserViewCount("lendersNotParticipated");
      if (notParticipatedCount > 0) {
        enriched.notParticipatedLendersTotal = notParticipatedCount;
        enriched.goodLendersCount = notParticipatedCount;
      }
    } catch {
      // Keep summary defaults.
    }
  }
  if (!pickNumber(summaryData.lendersExcludedCount)) {
    try {
      const excludedCount = await fetchAdminUserViewCount("lendersExcluded");
      if (excludedCount > 0) {
        enriched.lendersExcludedCount = excludedCount;
      }
    } catch {
      // Keep summary defaults.
    }
  }
  return enriched;
};
const resolveParticipationBandStats = async (summaryData = {}) => {
  const activeLendersCount = pickNumber(summaryData.activeLendersCount, summaryData.users?.activeLenders);
  const fromSummary = {
    participation50LakhTo1Crore: pickNumber(
      summaryData.participation50LakhTo1CroreCount,
      summaryData.participationBands?.participation50LakhTo1Crore
    ),
    participation1CroreTo2Crore: pickNumber(
      summaryData.participation1CroreTo2CroreCount,
      summaryData.participationBands?.participation1CroreTo2Crore
    ),
    participation2CroreTo3Crore: pickNumber(
      summaryData.participation2CroreTo3CroreCount,
      summaryData.participationBands?.participation2CroreTo3Crore
    ),
    participation3CrorePlus: pickNumber(
      summaryData.participation3CrorePlusCount,
      summaryData.participationBands?.participation3CrorePlus
    ),
  };
  if (
    hasParticipationBandSummaryFields(summaryData)
    && looksLikeValidBandCounts(fromSummary, activeLendersCount)
  ) {
    return fromSummary;
  }
  if (activeLendersCount <= 0) {
    return fromSummary;
  }
  try {
    return await loadParticipationBandCountsFromDatabase();
  } catch {
    return fromSummary;
  }
};
const responseData = (payload) => (payload && payload.data ? payload.data : payload);
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);

const dashboardLoadErrorMessage = (error) => {
  if (!error?.response) {
    if (error?.code === "ECONNABORTED" || /timeout/i.test(error?.message || "")) {
      return `Dashboard request timed out at ${BASE_URL}. Backend is usually still warming up or the query is slow. Wait a few seconds, then click Retry.`;
    }
    return `Dashboard request could not get a response from ${BASE_URL}. Confirm /oxyloans/healthCheck is OK, then click Retry.`;
  }
  const status = error.response.status;
  const backendMessage = error.response.data?.errorMessage || error.response.data?.message;
  if (status === 401 || status === 403) {
    return "Admin session expired or not authorized. Log out and log in again, then click Retry.";
  }
  return backendMessage
    ? `Failed to load dashboard data: ${backendMessage}`
    : `Failed to load dashboard data from backend (HTTP ${status}).`;
};
const formatDate = (value) => String(value || "").slice(0, 10) || "-";
const emptyAdminUserSearch = (userView = "") => ({
  userId: "",
  mobileNumber: "",
  email: "",
  ...(userView === "todayParticipated" ? { participationDate: defaultParticipationDate() } : {}),
});
const isTodayParticipationDate = (date) =>
  String(date || "").slice(0, 10) === defaultParticipationDate();
const participationGapDays = (previousDate, selectedDate) => {
  const prev = new Date(`${String(previousDate).slice(0, 10)}T00:00:00`);
  const sel = new Date(`${String(selectedDate).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(prev.getTime()) || Number.isNaN(sel.getTime())) {
    return 0;
  }
  return Math.floor((sel - prev) / 86400000);
};
const isInactiveReactivatedUser = (user, participationDate, minGapDays = 366) => {
  const previous = String(user?.lastParticipationOn || user?.previousLastActivityOn || "").slice(0, 10);
  const selected = String(participationDate || "").slice(0, 10);
  if (!previous || previous === "-" || !selected || selected === "-") {
    return false;
  }
  return participationGapDays(previous, selected) >= minGapDays;
};
const mapUserToInactiveReactivated = (user) => ({
  lenderId: user.lenderId || user.userId,
  userCode: user.userCode || (user.userId ? `LR${user.userId}` : ""),
  name: user.name,
  mobileNumber: user.mobileNumber,
  dealId: user.dealId || user.todayDealId,
  dealName: user.dealName || user.todayDealName,
  participationAmount: user.participationAmount ?? user.todayParticipationAmount,
  previousDealId: user.previousDealId || user.lastDealId,
  previousDealName: user.previousDealName || user.lastDealName,
  previousDealAmount: user.previousDealAmount ?? user.lastDealParticipationAmount,
  previousLastActivityOn: user.previousLastActivityOn || user.lastParticipationOn,
  participationOn: user.participationOn || user.todayParticipationOn,
});
const lenderToProfileUser = (lender) => ({
  userId: lender?.lenderId,
  lenderId: lender?.lenderId,
  userCode: lender?.userCode || (lender?.lenderId ? `LR${lender.lenderId}` : ""),
  name: lender?.name,
  email: lender?.email,
  mobileNumber: lender?.mobileNumber,
  primaryType: "LENDER",
});
const deriveInactiveReactivatedUsers = (users = [], participationDate) =>
  (users || [])
    .filter((user) => isInactiveReactivatedUser(user, participationDate))
    .map(mapUserToInactiveReactivated);
const fetchParticipatedUsersForDate = async (participationDate) => {
  const rows = [];
  let pageNo = 1;
  let totalCount = 0;
  while (pageNo <= 50) {
    const data = responseData(
      await getAdminAIUsers(pageNo, 100, "todayParticipated", { participationDate })
    );
    const batch = Array.isArray(data?.users) ? data.users : [];
    if (pageNo === 1) {
      totalCount = Number(data?.totalCount) || 0;
    }
    if (!batch.length) break;
    rows.push(...batch);
    if (totalCount > 0 && rows.length >= totalCount) break;
    if (batch.length < 100) break;
    pageNo += 1;
  }
  return rows;
};
const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const buildSpreadsheetXml = (sheetName, headers, rows, numericColumns = []) => {
  const headerXml = headers
    .map((title) => `<Cell><Data ss:Type="String">${escapeXml(title)}</Data></Cell>`)
    .join("");
  const rowXml = rows
    .map((cells) => {
      const cellXml = cells
        .map((cell, index) => {
          const type = numericColumns.includes(index) ? "Number" : "String";
          return `<Cell><Data ss:Type="${type}">${escapeXml(cell)}</Data></Cell>`;
        })
        .join("");
      return `<Row>${cellXml}</Row>`;
    })
    .join("");
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
<Worksheet ss:Name="${escapeXml(sheetName)}">
<Table>
<Row>${headerXml}</Row>
${rowXml}
</Table>
</Worksheet>
</Workbook>`;
};

const saveSpreadsheetXml = (xml, fileName) => {
  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  saveAs(blob, fileName.endsWith(".xls") ? fileName : fileName.replace(/\.xlsx$/, ".xls"));
};

const buildOverviewSummaryRows = (stats) => [
  ["Registered Users", stats.allUsers, "All platform users"],
  ["Registered Lenders (Raw)", stats.rawLenders, "All LENDER accounts before quality filter"],
  ["Not Participated Lenders", stats.goodLenders, "Clean lenders not yet in deals (verified + unverified email)"],
  ["Eliminated Lenders", stats.eliminatedLenders, "Test, invalid/duplicate mobile, duplicate name, bad email"],
  ["Registered Borrowers", stats.allBorrowers, "BORROWER accounts"],
  ["All Active Lenders", stats.allActiveLenders, "Participated in deals"],
  ["Last 3 Months Active", stats.lastThreeMonthsActiveLenders, "Recent participation"],
  ["Today Registered", stats.todayRegisteredUsers, "New sign-ups today"],
  ["Today Participated", stats.todayParticipatedUsers, "Eligible lenders active today across all deals"],
  ["New Participated Lenders", stats.newParticipatedLenders, "First-ever participation today"],
  ["Referral Registered Users", stats.referralRegisteredUsers, "Registered via referral link (today by default)"],
];

const buildDealsSummaryRows = (stats) => [
  ["Today's Deals (Created)", stats.todayDealsCreated, "Deals created today"],
  ["Today's Deals (Closed)", stats.todayDealsClosed, "Deals closed today"],
  ["All Deals Created", stats.allDeals, "Full deals directory"],
  ["Active Deals", stats.activeDeals, "Open / not closed"],
  ["Closed Deals", stats.closedDeals, "Completed deals"],
  ["Test Deals", stats.testDeals, "Test records only"],
];

const USER_EXPORT_HEADERS = [
  "User ID", "User Code", "Name", "Mobile Number", "Email", "User Type", "Registered Date",
  "City", "State", "Pincode", "UTM Source", "Deals Count", "Total Participation Amount",
];

const TODAY_PARTICIPATED_EXPORT_HEADERS = [
  ...USER_EXPORT_HEADERS,
  "Today Participation Amount", "Today Accepted Amount", "Today Updation Amount",
  "Today Deal ID", "Today Deal Name", "Today Participation Date",
  "Previous Deal ID", "Previous Deal Name", "Previous Participation Date",
];

const LAST_3_MONTHS_ACTIVE_EXPORT_HEADERS = [
  ...USER_EXPORT_HEADERS,
  "Last Deal ID", "Last Deal Name", "Last Participation Date",
];

const EXCLUDED_LENDERS_EXPORT_HEADERS = [
  ...USER_EXPORT_HEADERS,
  "First Name", "Last Name", "Exclusion Reasons",
];

const GOOD_LENDERS_EXPORT_HEADERS = USER_EXPORT_HEADERS;

const userExportHeadersForView = (userView) => {
  if (userView === "todayParticipated") return TODAY_PARTICIPATED_EXPORT_HEADERS;
  if (userView === "last3MonthsActive") return LAST_3_MONTHS_ACTIVE_EXPORT_HEADERS;
  if (isEliminatedUserView(userView)) return EXCLUDED_LENDERS_EXPORT_HEADERS;
  if (userView === "lenders" || userView === "lendersRaw") return GOOD_LENDERS_EXPORT_HEADERS;
  return USER_EXPORT_HEADERS;
};

const buildUserExportRows = (users, userView = "") =>
  (users || []).map((user) => {
    const row = [
      pickNumber(user.userId),
      user.userCode || `U${pickNumber(user.userId)}`,
      valueOrDash(user.name),
      valueOrDash(user.mobileNumber),
      valueOrDash(user.email),
      valueOrDash(user.primaryType || user.lenderType),
      formatDate(user.registeredOn),
      valueOrDash(user.city),
      valueOrDash(user.state),
      valueOrDash(user.pincode),
      valueOrDash(user.utm),
      pickNumber(user.dealsCount),
      Math.round(pickNumber(user.totalParticipationAmount)),
    ];
    if (userView === "todayParticipated") {
      row.push(
        Math.round(pickNumber(user.todayParticipationAmount)),
        Math.round(pickNumber(user.todayAcceptedAmount)),
        Math.round(pickNumber(user.todayUpdationAmount)),
        pickNumber(user.todayDealId),
        valueOrDash(user.todayDealName),
        formatDate(user.todayParticipationOn),
        pickNumber(user.lastDealId),
        valueOrDash(user.lastDealName),
        formatDate(user.lastParticipationOn),
      );
    } else if (userView === "last3MonthsActive") {
      row.push(
        pickNumber(user.lastDealId),
        valueOrDash(user.lastDealName),
        formatDate(user.lastParticipationOn),
      );
    } else if (isEliminatedUserView(userView)) {
      row.push(
        valueOrDash(user.firstName),
        valueOrDash(user.lastName),
        valueOrDash(user.exclusionReasons),
      );
    }
    return row;
  });

const buildDealExportRows = (deals) =>
  (deals || []).map((deal) => [
    pickNumber(deal.dealId),
    valueOrDash(deal.dealName),
    Math.round(pickNumber(deal.dealAmount)),
    valueOrDash(deal.status === "NOTYETCLOSED" ? "Active" : deal.status),
    valueOrDash(deal.dealType),
    formatDate(deal.createdOn),
    formatDate(deal.closedDate || deal.borrowerClosedDate),
    pickNumber(deal.lendersParticipated),
    Math.round(pickNumber(deal.collectedAmount || deal.dealAchievedAmount)),
    valueOrDash(deal.tenure),
    valueOrDash(deal.payoutTypeLabel || deal.payoutType),
  ]);

const DEAL_EXPORT_HEADERS = [
  "Deal ID", "Deal Name", "Deal Amount", "Status", "Deal Type", "Created On", "Closed Date",
  "Lenders Participated", "Collected Amount", "Tenure", "Payout Type",
];

const downloadOverviewExcelFallback = async (stats) => {
  const summaryXml = buildSpreadsheetXml(
    "Overview Summary",
    ["Metric", "Count", "Description"],
    buildOverviewSummaryRows(stats),
    [1]
  );
  saveSpreadsheetXml(summaryXml, `admin-ai-overview-summary-${new Date().toISOString().slice(0, 10)}.xls`);

  const { rows } = await fetchAllAdminUsersForExport("registered");
  const usersXml = buildSpreadsheetXml(
    "Registered Users",
    USER_EXPORT_HEADERS,
    buildUserExportRows(rows),
    [0, 11, 12]
  );
  saveSpreadsheetXml(usersXml, `admin-ai-registered-users-${new Date().toISOString().slice(0, 10)}.xls`);
};

const userViewSheetLabel = (userView) => {
  if (userView === "lenders") return "Not Participated - Verified Email";
  if (userView === "lendersNotParticipated") return "Not Participated Lenders";
  if (userView === "borrowers") return "Registered Borrowers";
  if (userView === "todayRegistered") return "Today Registered";
  if (userView === "todayParticipated") return "Today Participated";
  if (userView === "last3MonthsActive") return "Last 3 Months Active";
  return "Registered Users";
};

const cardExportFileName = (fileSlug) => {
  const stamp = new Date().toISOString().slice(0, 10);
  return `admin-ai-${fileSlug}-${stamp}.xlsx`;
};

const downloadDealsExcelFallback = async (stats) => {
  const summaryXml = buildSpreadsheetXml(
    "Deals Summary",
    ["Metric", "Count", "Description"],
    buildDealsSummaryRows(stats),
    [1]
  );
  saveSpreadsheetXml(summaryXml, `admin-ai-deals-summary-${new Date().toISOString().slice(0, 10)}.xls`);

  const [todayCreated, todayClosed, allDeals] = await Promise.all([
    getAdminAICreatedDeals(1, 500, "todaycreated", {}),
    getAdminAICreatedDeals(1, 500, "todayclosed", {}),
    fetchAllCreatedDealsForExport("all"),
  ]);
  const todayRows = [
    ...(todayCreated?.deals || []).map((deal) => ({ ...deal, todayActivity: "Created Today" })),
    ...(todayClosed?.deals || []).map((deal) => ({ ...deal, todayActivity: "Closed Today" })),
  ];
  const todayXml = buildSpreadsheetXml(
    "Todays Deals",
    [...DEAL_EXPORT_HEADERS.slice(0, 7), "Today's Activity", ...DEAL_EXPORT_HEADERS.slice(7)],
    todayRows.map((deal) => [
      ...buildDealExportRows([deal])[0].slice(0, 7),
      valueOrDash(deal.todayActivity),
      ...buildDealExportRows([deal])[0].slice(7),
    ]),
    [0, 2, 7, 8]
  );
  saveSpreadsheetXml(todayXml, `admin-ai-todays-deals-${new Date().toISOString().slice(0, 10)}.xls`);

  const allXml = buildSpreadsheetXml(
    "All Deals",
    DEAL_EXPORT_HEADERS,
    buildDealExportRows(allDeals.rows),
    [0, 2, 7, 8]
  );
  saveSpreadsheetXml(allXml, `admin-ai-all-deals-${new Date().toISOString().slice(0, 10)}.xls`);
};

const formatLenderCode = (lenderId, userCode) => userCode || (lenderId ? `LR${lenderId}` : "-");
const gmailUrl = (email) => (email ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}` : "");

const hasBankDetailsData = (profile) =>
  [profile?.bankName, profile?.accountNumber, profile?.ifscCode, profile?.branchName].some(
    (value) => String(value || "").trim() !== ""
  );

const mapBankProfile = (bankData) => ({
  bankName: bankData.bankName,
  accountNumber: bankData.accountNumber || bankData.bankAccNumber,
  ifscCode: bankData.ifscCode || bankData.ifsc,
  branchName: bankData.branchName,
  accountType: bankData.accountType,
  bankAddress: bankData.bankAddress,
  userNameAccordingToBank: bankData.userNameAccordingToBank,
  modeOfTransactions: bankData.modeOfTransactions,
  bankDetailsVerified: bankData.bankDetailsVerified,
  bankDetailsUpdatedOn: bankData.bankDetailsUpdatedOn,
  bankDetailsSource: bankData.bankDetailsSource,
});

const mergeProfile = (base, extra) => {
  if (!base && !extra) return null;
  const merged = { ...(base || {}) };
  if (!extra) return merged;
  Object.entries(extra).forEach(([key, value]) => {
    if (value == null || value === "") return;
    if (Array.isArray(value) || typeof value === "object") {
      merged[key] = value;
      return;
    }
    merged[key] = value;
  });
  return merged;
};

const mergeProfiles = (...sources) => sources.reduce((acc, source) => mergeProfile(acc, source), null);

const normalizeUserToProfile = (user) => {
  if (!user) return null;
  const addr = user.address && typeof user.address === "object" ? user.address : {};
  const addressLine = addr.addressLine || (typeof user.address === "string" ? user.address : "");
  return {
    lenderId: user.userId || user.lenderId,
    userCode: user.userCode || (user.userId ? `LR${user.userId}` : ""),
    name: user.name,
    email: user.email,
    mobileNumber: user.mobileNumber,
    registeredOn: user.registeredOn,
    city: addr.city || user.city,
    state: addr.state || user.state,
    pincode: addr.pincode || user.pincode,
    addressLine,
    address: addressLine,
    dob: user.dob,
    panNumber: user.panNumber,
    aadharNumber: user.aadharNumber,
    whatsappNumber: user.whatsappNumber,
    lenderGroupId: user.lenderGroupId,
    lenderGroupName: user.lenderGroupName,
    lenderType: user.lenderType || user.primaryType,
    primaryType: user.primaryType,
    dealsCount: user.dealsCount,
    totalParticipationAmount: user.totalParticipationAmount,
    bankName: user.bankName,
    accountNumber: user.accountNumber,
    ifscCode: user.ifscCode,
    branchName: user.branchName,
    accountType: user.accountType,
    userNameAccordingToBank: user.userNameAccordingToBank,
    bankAddress: user.bankAddress,
    modeOfTransactions: user.modeOfTransactions,
    bankDetailsVerified: user.bankDetailsVerified,
    bankDetailsSource: user.bankDetailsSource,
  };
};

const formatCompleteAddress = (profile) => {
  const parts = [profile?.addressLine || profile?.address, profile?.city, profile?.state, profile?.pincode].filter(
    (part) => part != null && String(part).trim() !== ""
  );
  return parts.length ? parts.join(", ") : "-";
};

const formatLenderGroup = (profile) => {
  const id = profile?.lenderGroupId;
  const name = profile?.lenderGroupName;
  if (!id && !name) return "-";
  if (id && name) return `${id} · ${name}`;
  return String(id || name);
};

const AdminAIDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(fallbackStats);
  const [charts, setCharts] = useState({
    registrationBreakdown: {},
    dailyRegistrationTrend: [],
    activeParticipationWindows: [],
    userLocationSummary: [],
    userLocationByState: [],
    activeLenderLocationByState: [],
    userLocationByDistrict: [],
    monthlyRegistrationByType: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedQualityChipKey, setSelectedQualityChipKey] = useState("");
  const [registeredUsersSubView, setRegisteredUsersSubView] = useState("");

  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUsersPage, setAdminUsersPage] = useState(1);
  const [adminUsersTotal, setAdminUsersTotal] = useState(0);
  const [adminUsersView, setAdminUsersView] = useState("registered");
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState("");
  const [adminUserSearch, setAdminUserSearch] = useState(() => emptyAdminUserSearch());
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedProfileLoading, setSelectedProfileLoading] = useState(false);
  const [selectedProfileError, setSelectedProfileError] = useState("");
  const [adminUserDeals, setAdminUserDeals] = useState(null);
  const [adminUserDealsTab, setAdminUserDealsTab] = useState("active");
  const [adminUserDealsLoading, setAdminUserDealsLoading] = useState(false);
  const [inactiveReactivatedLenders, setInactiveReactivatedLenders] = useState([]);
  const [inactiveReactivatedCount, setInactiveReactivatedCount] = useState(0);
  const [inactiveReactivatedLoading, setInactiveReactivatedLoading] = useState(false);
  const [inactiveReactivatedError, setInactiveReactivatedError] = useState("");

  const [activeLenders, setActiveLenders] = useState([]);
  const [activeLendersPage, setActiveLendersPage] = useState(1);
  const [activeLendersTotal, setActiveLendersTotal] = useState(0);
  const [activeLendersLoading, setActiveLendersLoading] = useState(false);
  const [activeLendersError, setActiveLendersError] = useState("");
  const [activeLenderSearch, setActiveLenderSearch] = useState({ lenderId: "", mobileNumber: "" });
  const [activeLenderSearchStatus, setActiveLenderSearchStatus] = useState("");
  const [activeLenderParticipationRange, setActiveLenderParticipationRange] = useState(null);
  const [activeLenderView, setActiveLenderView] = useState(null);
  const [newParticipationDate, setNewParticipationDate] = useState(() => defaultParticipationDate());
  const [newParticipatedDateCount, setNewParticipatedDateCount] = useState(null);
  const [newParticipatedDateLoading, setNewParticipatedDateLoading] = useState(false);
  const [newParticipatedDateError, setNewParticipatedDateError] = useState("");
  const [participatedDate, setParticipatedDate] = useState(() => defaultParticipationDate());
  const [participatedDateCount, setParticipatedDateCount] = useState(null);
  const [participatedDateLoading, setParticipatedDateLoading] = useState(false);
  const [participatedDateError, setParticipatedDateError] = useState("");
  const [registeredDate, setRegisteredDate] = useState(() => defaultParticipationDate());
  const [registeredDateCount, setRegisteredDateCount] = useState(null);
  const [registeredDateLoading, setRegisteredDateLoading] = useState(false);
  const [registeredDateError, setRegisteredDateError] = useState("");

  const [lenderDeals, setLenderDeals] = useState(null);
  const [lenderDealsTab, setLenderDealsTab] = useState("active");
  const [lenderDealsLoading, setLenderDealsLoading] = useState(false);
  const [lenderDealsError, setLenderDealsError] = useState("");

  const [topLenders, setTopLenders] = useState([]);
  const [monthlyTopLenders, setMonthlyTopLenders] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [selectedTopMonth, setSelectedTopMonth] = useState(currentYearMonth());
  const [topLendersLoading, setTopLendersLoading] = useState(false);
  const [topLendersError, setTopLendersError] = useState("");
  const [selectedTopLender, setSelectedTopLender] = useState(null);
  const [topLenderDetail, setTopLenderDetail] = useState(null);
  const [topLenderDetailLoading, setTopLenderDetailLoading] = useState(false);
  const [topLenderDetailError, setTopLenderDetailError] = useState("");
  const [topLenderDealsTab, setTopLenderDealsTab] = useState("active");
  const [topLendersTab, setTopLendersTab] = useState("allTime");
  const [exportingOverview, setExportingOverview] = useState(false);
  const [exportingDeals, setExportingDeals] = useState(false);
  const [exportingCardKey, setExportingCardKey] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const [campaignModalState, setCampaignModalState] = useState(null);
  const [autoEmailModalState, setAutoEmailModalState] = useState(null);
  const [showReferralRegistrations, setShowReferralRegistrations] = useState(false);
  const [showYearWiseReferrals, setShowYearWiseReferrals] = useState(false);
  const [referralDate, setReferralDate] = useState(() => defaultParticipationDate());
  const [referralYear, setReferralYear] = useState(null);
  const [referralYearStatus, setReferralYearStatus] = useState(null);
  const [referralYearCards, setReferralYearCards] = useState([]);
  const [referralYearGrandTotal, setReferralYearGrandTotal] = useState(0);
  const [referralYearGrandRegistered, setReferralYearGrandRegistered] = useState(0);
  const [referralYearGrandLent, setReferralYearGrandLent] = useState(0);
  const [topReferrers, setTopReferrers] = useState([]);
  const [selectedTopReferrerLimit, setSelectedTopReferrerLimit] = useState(null);
  const [topReferrersLoading, setTopReferrersLoading] = useState(false);
  const [topReferrerStatusesLoading, setTopReferrerStatusesLoading] = useState(false);
  const [topReferrersTreePdfExporting, setTopReferrersTreePdfExporting] = useState(false);
  const [topPaidEarnedExcelExporting, setTopPaidEarnedExcelExporting] = useState(null);
  const [topReferrersTreePdfProgress, setTopReferrersTreePdfProgress] = useState("");
  const [selectedTopReferrer, setSelectedTopReferrer] = useState(null);
  const [selectedTopReferrerDetail, setSelectedTopReferrerDetail] = useState(null);
  const [selectedTopReferrerLoading, setSelectedTopReferrerLoading] = useState(false);
  const [selectedTopReferrerError, setSelectedTopReferrerError] = useState("");
  const [referralRows, setReferralRows] = useState([]);
  const [referralPage, setReferralPage] = useState(1);
  const [referralTotal, setReferralTotal] = useState(0);
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralError, setReferralError] = useState("");
  const [referralYearsLoading, setReferralYearsLoading] = useState(false);

  const showReferralPanel = showReferralRegistrations || showYearWiseReferrals;
  const showActiveLenders = activeLenderPanelCardKeys.includes(selectedCard?.key) && !showReferralPanel;
  const showRegisteredUsersBreakdown = Boolean(
    !showReferralPanel
    && selectedCard?.key === "allUsers"
    && !registeredUsersSubView
    && !selectedQualityChipKey
  );
  const showAdminUsers = Boolean(
    !showReferralPanel
    && ((selectedCard && userViewByCard[selectedCard.key] && !activeLenderPanelCardKeys.includes(selectedCard.key)
      && selectedCard.key !== "allActiveLenders"
      && !(selectedCard.key === "allUsers" && !registeredUsersSubView))
    || selectedQualityChipKey
    || registeredUsersSubView)
  );

  const loadStats = async ({ force = false } = {}) => {
    if (!force) {
      const cached = readAdminAIDashboardCache();
      if (cached?.stats) {
        setStats(cached.stats);
        if (cached.charts) setCharts(cached.charts);
        if (Array.isArray(cached.referralYearCards) && cached.referralYearCards.length) {
          setReferralYearCards(cached.referralYearCards);
          setReferralYearGrandTotal(pickNumber(cached.referralYearGrandTotal));
          setReferralYearGrandRegistered(pickNumber(cached.referralYearGrandRegistered));
          setReferralYearGrandLent(pickNumber(cached.referralYearGrandLent));
        }
        setLoading(false);
        setLoadError("");
        return;
      }
    }
    setLoading(true);
    setLoadError("");
    participationLenderRowsCache = null;
    try {
      const registeredUsersSummary = await getRegisteredUsersSummary();
      const [oldDashboardActiveLendersCount, referralSummaryPayload, referralYearlyPayload] = await Promise.all([
        getOldDashboardActiveLendersCount(),
        getAdminAIReferralRegistrationsSummary(defaultParticipationDate()).catch(() => null),
        getAdminAIReferralRegistrationsYearlySummary(2021).catch(() => null),
      ]);
      let registeredUsersData = responseData(registeredUsersSummary);
      const registrationBreakdown = registeredUsersData.registrationBreakdown || {};
      registeredUsersData = await enrichMissingSummaryFields(registeredUsersData, registrationBreakdown);
      const users = registeredUsersData.users || {};
      const today = registeredUsersData.today || {};
      const referralSummary = responseData(referralSummaryPayload);
      const referralYearly = responseData(referralYearlyPayload);
      const yearlyRows = Array.isArray(referralYearly?.years) ? referralYearly.years : [];
      if (yearlyRows.length) {
        setReferralYearCards(yearlyRows);
        setReferralYearGrandTotal(pickNumber(referralYearly?.grandTotal));
        setReferralYearGrandRegistered(pickNumber(referralYearly?.grandRegistered));
        setReferralYearGrandLent(pickNumber(referralYearly?.grandLent));
      }

      let activeLenderLocationByState = registeredUsersData.activeLenderLocationByState || [];
      if (!activeLenderLocationByState.length) {
        try {
          const geoPayload = responseData(await getAdminAIActiveLenderStates());
          activeLenderLocationByState = geoPayload?.states || [];
        } catch {
          activeLenderLocationByState = [];
        }
      }

      let goodLendersVerified = pickNumber(registeredUsersData.goodLendersCount);
      let goodLendersUnverifiedEmail = pickNumber(
        registeredUsersData.goodLendersUnverifiedEmailCount,
        registeredUsersData.lenderQualityBreakdown?.unverifiedEmail
      );
      let goodLenders = pickNumber(
        registeredUsersData.notParticipatedLendersTotal,
        goodLendersVerified + goodLendersUnverifiedEmail
      );

      const participationBandStats = await resolveParticipationBandStats(registeredUsersData);

      const nextStats = {
        allUsers: pickNumber(
          registeredUsersData.registeredUsersCount,
          registrationBreakdown.registeredUsers,
          users.totalUsers
        ),
        rawLenders: derivedRawLendersCount(registeredUsersData, registrationBreakdown),
        goodLenders,
        goodLendersVerified,
        goodLendersUnverifiedEmail,
        notParticipatedRegistered1Month: pickNumber(registeredUsersData.notParticipatedRegisteredLast1MonthCount),
        notParticipatedRegistered3Months: pickNumber(registeredUsersData.notParticipatedRegisteredLast3MonthsCount),
        notParticipatedRegistered6Months: pickNumber(registeredUsersData.notParticipatedRegisteredLast6MonthsCount),
        notParticipatedRegistered1Year: pickNumber(registeredUsersData.notParticipatedRegisteredLast1YearCount),
        eliminatedLenders: pickNumber(registeredUsersData.lendersExcludedCount),
        activeCleanLenders: pickNumber(registeredUsersData.activeCleanLendersCount),
        lenderQualityFilterActive: registeredUsersData.lenderQualityFilterActive === true,
        lenderQualityError: registeredUsersData.lenderQualityError || "",
        lenderQualityBreakdown: registeredUsersData.lenderQualityBreakdown || fallbackStats.lenderQualityBreakdown,
        allBorrowers: pickNumber(
          registeredUsersData.borrowersCount,
          registrationBreakdown.borrowers,
          registeredUsersData.primaryTypeCounts?.BORROWER,
          users.totalBorrowers
        ),
        registeredBorrowersCampaignCount: pickNumber(
          registeredUsersData.registeredBorrowersCampaignCount
        ),
        registeredBorrowersVerifiedEmailCampaignCount: pickNumber(
          registeredUsersData.registeredBorrowersVerifiedEmailCampaignCount
        ),
        registeredBorrowersValidEmailCount: pickNumber(
          registeredUsersData.registeredBorrowersValidEmailCount
        ),
        registeredUsersBreakdown: {
          ...emptyRegisteredUsersBreakdown,
          ...(registeredUsersData.registeredUsersBreakdown || {}),
        },
        allActiveLenders: pickNumber(
          registeredUsersData.activeLendersCount,
          users.activeLenders,
          oldDashboardActiveLendersCount
        ),
        ...participationBandStats,
        todayRegisteredUsers: pickNumber(
          registeredUsersData.todayRegisteredUsersCount,
          today.registeredUsers,
          users.todayRegisteredUsers
        ),
        todayParticipatedUsers: pickNumber(
          registeredUsersData.todayParticipatedUsersCount,
          today.participatedUsers
        ),
        newParticipatedLenders: pickNumber(
          registeredUsersData.newParticipatedLendersCount,
          today.newParticipatedLenders
        ),
        referralRegisteredUsers: pickNumber(referralSummary?.totalCount),
        lastThreeMonthsActiveLenders: pickNumber(
          registeredUsersData.lastThreeMonthsActiveLenders,
          users.lastThreeMonthsActiveLenders,
          users.last3MonthsActiveLenders
        ),
        allDeals: pickNumber(registeredUsersData.allDealsCreatedCount),
        activeDeals: pickNumber(registeredUsersData.activeDealsCount),
        closedDeals: pickNumber(registeredUsersData.closedDealsCount),
        testDeals: pickNumber(registeredUsersData.testDealsCount),
        todayDealsCreated: pickNumber(registeredUsersData.todayDealsCreatedCount, today.dealsCreated),
        todayDealsClosed: pickNumber(registeredUsersData.todayDealsClosedCount, today.dealsClosed),
      };
      const nextCharts = {
        registrationBreakdown,
        dailyRegistrationTrend: registeredUsersData.dailyRegistrationTrend || [],
        activeParticipationWindows: registeredUsersData.activeParticipationWindows || [],
        userLocationSummary: registeredUsersData.userLocationSummary || [],
        userLocationByState:
          registeredUsersData.userLocationByState || registeredUsersData.userLocationSummary || [],
        activeLenderLocationByState,
        userLocationByDistrict: registeredUsersData.userLocationByDistrict || [],
        monthlyRegistrationByType: registeredUsersData.monthlyRegistrationByType || [],
      };
      setStats(nextStats);
      setCharts(nextCharts);
      const existingCache = readAdminAIDashboardCache() || {};
      writeAdminAIDashboardCache({
        ...existingCache,
        stats: nextStats,
        charts: nextCharts,
        referralYearCards: yearlyRows.length ? yearlyRows : existingCache.referralYearCards,
        referralYearGrandTotal: yearlyRows.length
          ? pickNumber(referralYearly?.grandTotal)
          : existingCache.referralYearGrandTotal,
        referralYearGrandRegistered: yearlyRows.length
          ? pickNumber(referralYearly?.grandRegistered)
          : existingCache.referralYearGrandRegistered,
        referralYearGrandLent: yearlyRows.length
          ? pickNumber(referralYearly?.grandLent)
          : existingCache.referralYearGrandLent,
      });
    } catch (error) {
      setStats(fallbackStats);
      setCharts({
        registrationBreakdown: {},
        dailyRegistrationTrend: [],
        activeParticipationWindows: [],
        userLocationSummary: [],
        userLocationByState: [],
        activeLenderLocationByState: [],
        userLocationByDistrict: [],
        monthlyRegistrationByType: [],
      });
      setLoadError(dashboardLoadErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const loadInactiveReactivatedLenders = async (
    participationDate,
    inactiveInterval = "1 year",
    usersFallback = []
  ) => {
    setInactiveReactivatedLoading(true);
    setInactiveReactivatedError("");
    try {
      try {
        const data = responseData(
          await getAdminAIInactiveReactivatedLenders(participationDate, inactiveInterval)
        );
        if (!data.backendError && Array.isArray(data.lenders)) {
          setInactiveReactivatedLenders(data.lenders);
          setInactiveReactivatedCount(pickNumber(data.totalCount, data.lenders.length));
          return;
        }
        if (data.backendError) {
          throw new Error(data.backendError);
        }
      } catch (apiError) {
        try {
          const sourceUsers = usersFallback.length
            ? usersFallback
            : await fetchParticipatedUsersForDate(participationDate);
          const derived = deriveInactiveReactivatedUsers(sourceUsers, participationDate);
          setInactiveReactivatedLenders(derived);
          setInactiveReactivatedCount(derived.length);
          setInactiveReactivatedError("");
          return;
        } catch {
          throw apiError;
        }
      }
      setInactiveReactivatedLenders([]);
      setInactiveReactivatedCount(0);
    } catch (error) {
      const derived = deriveInactiveReactivatedUsers(usersFallback, participationDate);
      if (usersFallback.length) {
        setInactiveReactivatedLenders(derived);
        setInactiveReactivatedCount(derived.length);
        setInactiveReactivatedError("");
        return;
      }
      setInactiveReactivatedLenders([]);
      setInactiveReactivatedCount(0);
      const message =
        error?.response?.data?.backendError ||
        error?.response?.data?.errorMessage ||
        error?.message ||
        "Failed to load inactive 1+ year reactivated lenders for this date.";
      setInactiveReactivatedError(
        /network error/i.test(message)
          ? `Cannot reach backend at ${BASE_URL}. Start oxyloans-rest on port 8181, then refresh.`
          : message
      );
    } finally {
      setInactiveReactivatedLoading(false);
    }
  };

  const loadAdminUsers = async (pageNo = 1, userView = adminUsersView, filters = adminUserSearch) => {
    setAdminUsersLoading(true);
    setAdminUsersError("");
    try {
      const data = responseData(await getAdminAIUsers(pageNo, adminUserPageSize, userView, filters));
      const users = data.users || [];
      setAdminUsers(users);
      setAdminUsersPage(pickNumber(data.pageNo, pageNo) || 1);
      setAdminUsersTotal(pickNumber(data.totalCount));
      const resolvedView = data.userView || userView;
      setAdminUsersView(resolvedView);
      if (resolvedView === "todayParticipated" && data.participationDate) {
        const returnedDate = String(data.participationDate).slice(0, 10);
        const requestedDate = filters.participationDate || defaultParticipationDate();
        setAdminUserSearch((search) => ({
          ...search,
          participationDate: returnedDate,
        }));
        loadInactiveReactivatedLenders(returnedDate, "1 year", users);
        if (returnedDate !== requestedDate) {
          setAdminUsersError(
            `Date filter mismatch: requested ${requestedDate}, backend returned ${returnedDate}. Restart backend and try again.`
          );
        }
      }
      if (data.backendError) {
        setAdminUsersError(`Failed to load registered user records: ${data.backendError}`);
      }
    } catch (error) {
      setAdminUsers([]);
      setAdminUsersError(
        error?.response?.data?.errorMessage ||
          error?.message ||
          "Failed to load registered user records from backend."
      );
    } finally {
      setAdminUsersLoading(false);
    }
  };

  const loadActiveLenders = async (
    pageNo = 1,
    filters = activeLenderSearch,
    participationRange = activeLenderParticipationRange,
    lenderView = activeLenderView
  ) => {
    setActiveLendersLoading(true);
    setActiveLendersError("");
    try {
      const hasFilters =
        Boolean(filters?.lenderId) || Boolean(String(filters?.mobileNumber || "").trim());
      const minParticipation = participationRange?.min || null;
      const maxParticipation = participationRange?.max || null;
      let data = null;

      if (lenderView === "newParticipated") {
        data = responseData(await getAdminAIActiveLenders(pageNo, activeLendersPageSize, {
          ...filters,
          lenderView: "newParticipated",
          participationDate: filters?.participationDate || newParticipationDate,
        }));
        setActiveLenders(data?.activeLenders || []);
        setActiveLendersPage(pickNumber(data?.pageNo, pageNo) || 1);
        setActiveLendersTotal(
          hasFilters ? pickNumber(data?.totalCount) : pickNumber(data?.totalCount, stats.newParticipatedLenders)
        );
        return;
      }

      if (participationRange) {
        try {
          const apiData = responseData(await getAdminAIActiveLenders(pageNo, activeLendersPageSize, {
            ...filters,
            minParticipationAmount: minParticipation || undefined,
            maxParticipationAmount: maxParticipation || undefined,
          }));
          if (!apiData?.backendError && looksLikeValidParticipationList(apiData, participationRange)) {
            data = apiData;
          }
        } catch {
          data = null;
        }

        if (!data) {
          const segment = activeLenderPanelMeta[selectedCard?.key]?.segment;
          if (segment) {
            try {
              const segmentData = responseData(
                await getAdminAILenderAnalyticsLenders(segment, pageNo, activeLendersPageSize, filters.lenderId)
              );
              if (!segmentData?.backendError && looksLikeValidParticipationList(segmentData, participationRange)) {
                data = {
                  ...segmentData,
                  activeLenders: segmentData.activeLenders || [],
                  totalCount: pickNumber(segmentData.totalCount, segmentData.segmentTotalCount),
                };
              }
            } catch {
              data = null;
            }
          }
        }

        if (!data) {
          data = await loadParticipationBandLendersFromDatabase(pageNo, filters, participationRange);
        }
      } else {
        data = responseData(await getAdminAIActiveLenders(pageNo, activeLendersPageSize, {
          ...filters,
          minParticipationAmount: minParticipation || undefined,
          maxParticipationAmount: maxParticipation || undefined,
        }));
      }

      setActiveLenders(data.activeLenders || []);
      setActiveLendersPage(pickNumber(data.pageNo, pageNo) || 1);
      let totalCount = pickNumber(data.totalCount);
      if (!hasFilters && !participationRange) {
        const legacyCount = await getOldDashboardActiveLendersCount();
        totalCount = pickNumber(legacyCount, stats.allActiveLenders, data.totalCount);
      } else if (!hasFilters && participationRange) {
        totalCount = pickNumber(data.totalCount, stats[selectedCard?.key]);
      }
      setActiveLendersTotal(totalCount);
    } catch (error) {
      setActiveLenders([]);
      setActiveLendersError(
        error?.response?.data?.errorMessage
          || error?.response?.data?.backendError
          || error?.message
          || "Failed to load active lender profiles from backend."
      );
    } finally {
      setActiveLendersLoading(false);
    }
  };

  const loadTopLendersData = async (yearMonth = selectedTopMonth, { force = false } = {}) => {
    if (!force) {
      const cached = readAdminAIDashboardCache();
      if (cached?.topLenders) {
        setTopLenders(cached.topLenders || []);
        setMonthlyTopLenders(cached.monthlyTopLenders || []);
        setMonthlyTrend(cached.monthlyTrend || []);
        if (cached.selectedTopMonth) setSelectedTopMonth(cached.selectedTopMonth);
        setTopLendersLoading(false);
        setTopLendersError("");
        return;
      }
    }
    setTopLendersLoading(true);
    setTopLendersError("");
    try {
      const [allTimeData, monthlyData, trendData] = await Promise.all([
        getAdminAITopLenders(topLendersLimit),
        getAdminAIMonthlyTopLenders(yearMonth, topLendersLimit),
        getAdminAITopLendersMonthlyTrend(12),
      ]);
      const nextTop = responseData(allTimeData)?.topLenders || [];
      const nextMonthly = responseData(monthlyData)?.topLenders || [];
      const trendRows = responseData(trendData)?.monthlyTrend || [];
      setTopLenders(nextTop);
      setMonthlyTopLenders(nextMonthly);
      setMonthlyTrend(trendRows);
      let nextMonth = yearMonth;
      if (trendRows.length && !trendRows.some((row) => row.yearMonth === yearMonth)) {
        nextMonth = trendRows[trendRows.length - 1].yearMonth;
        setSelectedTopMonth(nextMonth);
      }
      const existingCache = readAdminAIDashboardCache() || {};
      writeAdminAIDashboardCache({
        ...existingCache,
        topLenders: nextTop,
        monthlyTopLenders: nextMonthly,
        monthlyTrend: trendRows,
        selectedTopMonth: nextMonth,
      });
    } catch (error) {
      setTopLenders([]);
      setMonthlyTopLenders([]);
      setMonthlyTrend([]);
      setTopLendersError("Failed to load top lender rankings from backend.");
    } finally {
      setTopLendersLoading(false);
    }
  };

  const loadMonthlyTopLenders = async (yearMonth) => {
    setTopLendersLoading(true);
    try {
      const monthlyData = responseData(await getAdminAIMonthlyTopLenders(yearMonth, topLendersLimit));
      setMonthlyTopLenders(monthlyData?.topLenders || []);
      setSelectedTopMonth(yearMonth);
    } catch {
      setMonthlyTopLenders([]);
    } finally {
      setTopLendersLoading(false);
    }
  };

  const openTopLenderDetail = async (lender) => {
    const lenderId = pickNumber(lender?.lenderId);
    if (!lenderId) {
      return;
    }
    setSelectedTopLender(lender);
    setTopLenderDetail(null);
    setTopLenderDetailLoading(true);
    setTopLenderDetailError("");
    setTopLenderDealsTab("active");
    try {
      const [profileData, bankData, walletData, dealsData] = await Promise.all([
        getAdminAIActiveLenderProfile(lenderId).catch(() => null),
        getAdminAIActiveLenderBankDetails(lenderId).catch(() => null),
        getAdminAIActiveLenderWallet(lenderId).catch(() => null),
        getAdminAIActiveLenderDeals(lenderId).catch(() => null),
      ]);
      const profile = responseData(profileData)?.profile || lender;
      const bank = responseData(bankData) || {};
      const wallet = responseData(walletData) || {};
      const deals = responseData(dealsData) || {};
      setTopLenderDetail({
        profile: { ...profile, ...bank, walletAmount: pickNumber(wallet.walletAmount) },
        deals,
      });
    } catch (error) {
      setTopLenderDetailError("Failed to load full lender profile and participation details.");
    } finally {
      setTopLenderDetailLoading(false);
    }
  };

  const closeTopLenderDetail = () => {
    setSelectedTopLender(null);
    setTopLenderDetail(null);
    setTopLenderDetailError("");
  };

  useEffect(() => {
    loadStats();
    loadTopLendersData();
  }, []);

  const refreshDashboard = () => {
    clearAdminAIDashboardCache();
    loadStats({ force: true });
    loadTopLendersData(undefined, { force: true });
  };

  const resetPanels = () => {
    setAdminUsers([]);
    setActiveLenders([]);
    setLenderDeals(null);
    setAdminUsersError("");
    setActiveLendersError("");
    setLenderDealsError("");
    setSelectedProfile(null);
    setSelectedProfileLoading(false);
    setSelectedProfileError("");
    setAdminUserDeals(null);
    setAdminUserDealsTab("active");
    setAdminUserDealsLoading(false);
    setInactiveReactivatedLenders([]);
    setInactiveReactivatedCount(0);
    setInactiveReactivatedLoading(false);
    setInactiveReactivatedError("");
    setShowReferralRegistrations(false);
    setShowYearWiseReferrals(false);
    setReferralRows([]);
    setReferralPage(1);
    setReferralTotal(0);
    setReferralLoading(false);
    setReferralError("");
    setReferralYear(null);
    setReferralYearStatus(null);
    setReferralYearsLoading(false);
  };

  const buildDefaultReferralYearCards = () => {
    const currentYear = Number(String(defaultParticipationDate()).slice(0, 4)) || new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 2021; year -= 1) {
      years.push({ year, registeredCount: 0, lentCount: 0, totalCount: 0 });
    }
    return years;
  };

  const loadReferralYearCards = async ({ force = false } = {}) => {
    const fallback = buildDefaultReferralYearCards();
    if (!force) {
      const cached = readAdminAIDashboardCache();
      if (Array.isArray(cached?.referralYearCards) && cached.referralYearCards.length) {
        setReferralYearCards(cached.referralYearCards);
        setReferralYearGrandTotal(pickNumber(cached.referralYearGrandTotal));
        setReferralYearGrandRegistered(pickNumber(cached.referralYearGrandRegistered));
        setReferralYearGrandLent(pickNumber(cached.referralYearGrandLent));
        setReferralYearsLoading(false);
        return;
      }
    }
    setReferralYearCards((prev) => (prev.length ? prev : fallback));
    setReferralYearsLoading(true);
    try {
      const data = responseData(await getAdminAIReferralRegistrationsYearlySummary(2021));
      const years = Array.isArray(data?.years) ? data.years : [];
      const nextYears = years.length ? years : fallback;
      setReferralYearCards(nextYears);
      const grand = pickNumber(data?.grandTotal, years.reduce((sum, row) => sum + pickNumber(row.totalCount), 0));
      const grandRegistered = pickNumber(
        data?.grandRegistered,
        years.reduce((sum, row) => sum + pickNumber(row.registeredCount), 0)
      );
      const grandLent = pickNumber(
        data?.grandLent,
        years.reduce((sum, row) => sum + pickNumber(row.lentCount), 0)
      );
      setReferralYearGrandTotal(grand);
      setReferralYearGrandRegistered(grandRegistered);
      setReferralYearGrandLent(grandLent);
      const existingCache = readAdminAIDashboardCache() || {};
      writeAdminAIDashboardCache({
        ...existingCache,
        referralYearCards: nextYears,
        referralYearGrandTotal: grand,
        referralYearGrandRegistered: grandRegistered,
        referralYearGrandLent: grandLent,
      });
    } catch {
      setReferralYearCards((prev) => (prev.length ? prev : fallback));
    } finally {
      setReferralYearsLoading(false);
    }
  };

  const loadTopReferrers = async ({ force = false } = {}) => {
    if (!force) {
      const cached = readAdminAIDashboardCache();
      if (Array.isArray(cached?.topReferrers) && cached.topReferrers.length) {
        setTopReferrers(cached.topReferrers);
        setTopReferrersLoading(false);
        return cached.topReferrers;
      }
    }
    setTopReferrersLoading(true);
    try {
      const data = responseData(await getAdminAITopReferrers(50));
      const rows = Array.isArray(data?.referrers) ? data.referrers : [];
      const ranked = rows
        .slice()
        .sort((a, b) => pickNumber(b.lentCount) - pickNumber(a.lentCount) || pickNumber(b.referralCount) - pickNumber(a.referralCount))
        .map((row, index) => ({ ...row, rank: index + 1 }));
      setTopReferrers(ranked);
      const existingCache = readAdminAIDashboardCache() || {};
      writeAdminAIDashboardCache({ ...existingCache, topReferrers: ranked });
      return ranked;
    } catch {
      setTopReferrers([]);
      return [];
    } finally {
      setTopReferrersLoading(false);
    }
  };

  const downloadTopReferrersTreePdf = async (limit = 10) => {
    const safeLimit = limit === 50 ? 50 : 10;
    if (topReferrersTreePdfExporting) return;
    let rows = topReferrers.slice(0, safeLimit);
    if (!rows.length) {
      const ranked = await loadTopReferrers({ force: true });
      rows = (Array.isArray(ranked) ? ranked : []).slice(0, safeLimit);
    }
    if (!rows.length) {
      window.alert("Top referrers are not loaded yet. Click Refresh and try again.");
      return;
    }
    setTopReferrersTreePdfExporting(true);
    setTopReferrersTreePdfProgress(`Preparing Top ${safeLimit} tree maps PDF…`);
    try {
      const result = await exportTopReferrersLentTreePdf(rows, {
        limit: safeLimit,
        onProgress: (info) => {
          setTopReferrersTreePdfProgress(
            info?.message || `Building page ${info.current}/${info.total}…`
          );
        },
      });
      setTopReferrersTreePdfProgress(`Saved ${result.fileName} (${result.pageCount} pages).`);
    } catch (error) {
      setTopReferrersTreePdfProgress("");
      window.alert(error?.message || "Failed to create Top Referrers tree maps PDF.");
    } finally {
      setTopReferrersTreePdfExporting(false);
      window.setTimeout(() => setTopReferrersTreePdfProgress(""), 4000);
    }
  };

  const downloadTopPaidEarnedExcelFile = async (limit = 10) => {
    const safeLimit = limit === 50 ? 50 : 10;
    if (topPaidEarnedExcelExporting) return;
    setTopPaidEarnedExcelExporting(safeLimit);
    try {
      const data = responseData(await getAdminAITopPaidEarnedReferrers(safeLimit));
      const rows = Array.isArray(data.referrers) ? data.referrers : [];
      if (!rows.length) {
        window.alert(`No Top ${safeLimit} paid earned referrers found to export.`);
        return;
      }
      downloadTopPaidEarnedExcel(rows, safeLimit);
    } catch (error) {
      window.alert(error?.response?.data?.message || error?.message || `Failed to download Top ${safeLimit} Excel.`);
    } finally {
      setTopPaidEarnedExcelExporting(null);
    }
  };

  const loadReferralRegistrations = async (
    page = 1,
    { dateValue = referralDate, yearValue = referralYear, statusValue = referralYearStatus } = {}
  ) => {
    const safeDate = dateValue || defaultParticipationDate();
    const safeYear = yearValue ? Number(yearValue) : null;
    const safeStatus = safeYear && statusValue ? statusValue : null;
    setReferralLoading(true);
    setReferralError("");
    try {
      const data = responseData(
        await getAdminAIReferralRegistrations(
          page,
          20,
          safeYear ? { year: safeYear, status: safeStatus } : { date: safeDate }
        )
      );
      setReferralRows(Array.isArray(data?.referees) ? data.referees : []);
      setReferralPage(pickNumber(data?.pageNo, page) || 1);
      setReferralTotal(pickNumber(data?.totalCount));
      if (safeYear) {
        setReferralYear(safeYear);
        setReferralYearStatus(safeStatus);
      } else {
        setReferralYear(null);
        setReferralYearStatus(null);
        setReferralDate(data?.date || safeDate);
        if (safeDate === defaultParticipationDate()) {
          setStats((prev) => ({
            ...prev,
            referralRegisteredUsers: pickNumber(data?.totalCount, prev.referralRegisteredUsers),
          }));
        }
      }
    } catch (error) {
      setReferralRows([]);
      setReferralTotal(0);
      setReferralError(error?.response?.data?.message || error?.message || "Failed to load referral registrations.");
    } finally {
      setReferralLoading(false);
    }
  };

  const openReferralRegistrations = (card) => {
    const today = defaultParticipationDate();
    setSelectedQualityChipKey("");
    resetPanels();
    setSelectedCard(card);
    setShowReferralRegistrations(true);
    setShowYearWiseReferrals(false);
    setReferralDate(today);
    setReferralYear(null);
    setReferralYearStatus(null);
    loadReferralRegistrations(1, { dateValue: today, yearValue: null, statusValue: null });
  };

  const openYearWiseReferrals = () => {
    setSelectedQualityChipKey("");
    resetPanels();
    setSelectedCard({ key: "yearWiseReferrals", label: "YearWise referrals" });
    setShowYearWiseReferrals(true);
    setShowReferralRegistrations(false);
    setReferralYear(null);
    setReferralYearStatus(null);
    setReferralRows([]);
    setReferralTotal(0);
    setSelectedTopReferrerLimit(null);
    setSelectedTopReferrer(null);
    setSelectedTopReferrerDetail(null);
    setSelectedTopReferrerError("");
    setReferralYearCards((prev) => (prev.length ? prev : buildDefaultReferralYearCards()));
    loadReferralYearCards();
    loadTopReferrers();
  };

  useEffect(() => {
    const requestedPanel = new URLSearchParams(window.location.search).get("panel");
    if (requestedPanel === "yearWiseReferrals") {
      openYearWiseReferrals();
      navigate("/adminAIDashboard", { replace: true });
    }
  }, []);

  const openReferralYearStatus = (year, status) => {
    const safeYear = Number(year);
    if (!safeYear || (status !== "Lent" && status !== "Registered")) {
      return;
    }
    if (status === "Registered") {
      navigate(`/adminAIReferralUsers?year=${safeYear}&status=Registered`);
      return;
    }
    setReferralYear(safeYear);
    setReferralYearStatus(status);
    loadReferralRegistrations(1, { yearValue: safeYear, statusValue: status });
  };

  const openReferralCampaign = (segment, segmentLabel, recipientCount, channel) => {
    setCampaignModalState({
      segment,
      segmentLabel,
      recipientCount: pickNumber(recipientCount),
      channel: channel || "email",
      campaignSetCount: 3,
    });
  };

  const openTopPaidEarnedCampaign = (channel) => {
    const choice = window.prompt(
      `Send ${channel === "whatsapp" ? "WhatsApp" : "Email"} campaign to Top Paid Earned.\n\nEnter 10 or 50:`,
      "10"
    );
    if (choice == null) return;
    const raw = String(choice).trim();
    const limit = raw === "50" ? 50 : raw === "10" ? 10 : 0;
    if (!limit) {
      window.alert("Enter 10 or 50 only.");
      return;
    }
    openReferralCampaign(
      `top${limit}PaidEarned`,
      `Top ${limit} Paid Earned Referrers`,
      limit,
      channel || "email"
    );
  };

  const openTopReferrerDetail = (referrer) => {
    const lenderId = pickNumber(referrer?.referrerId);
    if (!lenderId) return;
    const params = new URLSearchParams({
      referrerId: String(lenderId),
      referrerCode: String(referrer?.referrerCode || `LR${lenderId}`),
      name: String(referrer?.name || ""),
      rank: String(referrer?.rank || ""),
      limit: String(selectedTopReferrerLimit || 10),
    });
    navigate(`/adminAITopReferrer?${params.toString()}`);
  };

  const showTopReferrers = async (limit) => {
    setSelectedTopReferrerLimit(limit);
    setSelectedTopReferrer(null);
    setSelectedTopReferrerDetail(null);
    const visibleRows = topReferrers.slice(0, limit);
    if (!visibleRows.length) return;
    setTopReferrerStatusesLoading(true);
    try {
      const updates = [];
      for (let start = 0; start < visibleRows.length; start += 5) {
        const batch = visibleRows.slice(start, start + 5);
        const batchUpdates = await Promise.all(batch.map(async (row) => {
          try {
            const data = responseData(await getAdminAIActiveLenderReferrals(row.referrerId, 1, 1));
            const summary = data?.referralSummary || {};
            return {
              referrerId: row.referrerId,
              registeredCount: pickNumber(summary.registered),
              lentCount: pickNumber(summary.lent) + pickNumber(summary.disbursed),
              invitedCount: pickNumber(summary.invited),
            };
          } catch {
            return null;
          }
        }));
        updates.push(...batchUpdates.filter(Boolean));
      }
      const byId = new Map(updates.map((row) => [pickNumber(row.referrerId), row]));
      setTopReferrers((rows) => {
        const merged = rows.map((row) => ({ ...row, ...(byId.get(pickNumber(row.referrerId)) || {}) }));
        // Keep Top 10 / Top 50 ordered by Lent.
        return merged
          .slice()
          .sort((a, b) => pickNumber(b.lentCount) - pickNumber(a.lentCount) || pickNumber(b.referralCount) - pickNumber(a.referralCount))
          .map((row, index) => ({ ...row, rank: index + 1 }));
      });
    } finally {
      setTopReferrerStatusesLoading(false);
    }
  };

  const loadBankDetailsForProfile = async (userId) => {
    try {
      const bankData = responseData(await getAdminAIActiveLenderBankDetails(userId));
      if (bankData && hasBankDetailsData(bankData)) {
        return mapBankProfile(bankData);
      }
    } catch {
      // Fall through to legacy admin API.
    }
    try {
      const legacyData = responseData(await getAdminAIActiveLenderLegacyDetails(userId));
      if (legacyData && hasBankDetailsData(legacyData)) {
        return mapBankProfile({ ...legacyData, bankDetailsSource: legacyData.bankDetailsSource || "legacy_admin_api" });
      }
    } catch {
      return null;
    }
    return null;
  };

  const openAdminUserProfile = (user) => {
    const userId = pickNumber(user?.userId);
    if (!userId) {
      return;
    }
    const params = new URLSearchParams({
      userId: String(userId),
      view: adminUsersView,
      label: adminUsersTitle,
    });
    navigate(`/adminAIUserProfile?${params.toString()}`);
  };

  const openReferralUserProfile = (userId, userCode, roleLabel = "Referral User") => {
    let id = pickNumber(userId);
    if (!id && userCode) {
      const digits = String(userCode).replace(/^(LR|BR|PR)\s*/i, "").replace(/\D/g, "");
      id = pickNumber(digits);
    }
    if (!id) {
      return;
    }
    const params = new URLSearchParams({
      userId: String(id),
      view: "referralRegistered",
      label: roleLabel,
    });
    navigate(`/adminAIUserProfile?${params.toString()}`);
  };

  const closeAdminUserProfile = () => {
    setSelectedProfile(null);
    setSelectedProfileError("");
    setAdminUserDeals(null);
    setAdminUserDealsTab("active");
  };

  const openActiveLenders = (card) => {
    const participationRange = participationRangeByCard[card.key] || null;
    const lenderView = card.key === "newParticipatedLenders" ? "newParticipated" : null;
    setSelectedCard(card);
    resetPanels();
    setActiveLenderParticipationRange(participationRange);
    setActiveLenderView(lenderView);
    const nextSearch = {
      lenderId: "",
      mobileNumber: "",
      ...(lenderView === "newParticipated" ? { participationDate: newParticipationDate } : {}),
    };
    setActiveLenderSearch(nextSearch);
    loadActiveLenders(1, nextSearch, participationRange, lenderView);
  };

  const searchNewParticipatedByDate = async () => {
    const participationDate = String(newParticipationDate || "").slice(0, 10);
    if (!participationDate) {
      setNewParticipatedDateError("Please select a date.");
      return;
    }
    setNewParticipatedDateLoading(true);
    setNewParticipatedDateError("");
    try {
      const data = responseData(await getAdminAIActiveLenders(1, 1, {
        lenderView: "newParticipated",
        participationDate,
        includeBankDetails: false,
      }));
      setNewParticipatedDateCount(pickNumber(data?.totalCount));
    } catch (error) {
      setNewParticipatedDateCount(null);
      setNewParticipatedDateError(error?.response?.data?.errorMessage || error?.message || "Failed to load this date.");
    } finally {
      setNewParticipatedDateLoading(false);
    }
  };

  const openAdminUsers = (card) => {
    const nextView = userViewByCard[card.key] || "registered";
    const nextSearch = emptyAdminUserSearch(nextView);
    if (nextView === "todayParticipated") {
      nextSearch.participationDate = participatedDate;
    }
    if (nextView === "todayRegistered") {
      nextSearch.participationDate = registeredDate;
    }
    setSelectedQualityChipKey("");
    setSelectedCard(card);
    resetPanels();
    setAdminUserSearch(nextSearch);
    if (card.key === "allUsers") {
      setRegisteredUsersSubView("");
      setAdminUsersView("registered");
      return;
    }
    setRegisteredUsersSubView("");
    setAdminUsersView(nextView);
    loadAdminUsers(1, nextView, nextSearch);
  };

  const openRegisteredUsersBreakdownBox = (box) => {
    if (!box?.userView) {
      return;
    }
    const nextSearch = emptyAdminUserSearch(box.userView);
    setSelectedQualityChipKey("");
    setRegisteredUsersSubView(box.key);
    setAdminUserSearch(nextSearch);
    setAdminUsersView(box.userView);
    loadAdminUsers(1, box.userView, nextSearch);
  };

  const searchParticipatedByDate = async () => {
    const participationDate = String(participatedDate || "").slice(0, 10);
    if (!participationDate) {
      setParticipatedDateError("Please select a date.");
      return;
    }
    setParticipatedDateLoading(true);
    setParticipatedDateError("");
    try {
      const data = responseData(await getAdminAIUsers(1, 1, "todayParticipated", { participationDate }));
      setParticipatedDateCount(pickNumber(data?.totalCount));
    } catch (error) {
      setParticipatedDateCount(null);
      setParticipatedDateError(error?.response?.data?.errorMessage || error?.message || "Failed to load this date.");
    } finally {
      setParticipatedDateLoading(false);
    }
  };

  const searchRegisteredByDate = async () => {
    const selectedDate = String(registeredDate || "").slice(0, 10);
    if (!selectedDate) {
      setRegisteredDateError("Please select a date.");
      return;
    }
    setRegisteredDateLoading(true);
    setRegisteredDateError("");
    try {
      const data = responseData(await getAdminAIUsers(1, 1, "todayRegistered", { participationDate: selectedDate }));
      setRegisteredDateCount(pickNumber(data?.totalCount));
    } catch (error) {
      setRegisteredDateCount(null);
      setRegisteredDateError(error?.response?.data?.errorMessage || error?.message || "Failed to load registrations for this date.");
    } finally {
      setRegisteredDateLoading(false);
    }
  };

  const openLenderQualityChip = (chipKey) => {
    const chip = lenderQualityChipViews[chipKey];
    if (!chip) {
      return;
    }
    const nextSearch = emptyAdminUserSearch(chip.userView);
    setSelectedCard(null);
    setSelectedQualityChipKey(chipKey);
    setRegisteredUsersSubView("");
    resetPanels();
    setAdminUserSearch(nextSearch);
    setAdminUsersView(chip.userView);
    loadAdminUsers(1, chip.userView, nextSearch);
  };

  const handleCardClick = (card) => {
    if (card.key === "allActiveLenders") {
      navigate("/adminAIDeals");
      return;
    }
    if (card.key === "referralRegisteredUsers") {
      openReferralRegistrations(card);
      return;
    }
    if (activeLenderPanelCardKeys.includes(card.key)) {
      openActiveLenders(card);
      return;
    }
    openAdminUsers(card);
  };

  const openParticipationTierCampaign = (cardKey, channel) => {
    const meta = activeLenderPanelMeta[cardKey];
    if (!meta) {
      return;
    }
    const recipientCount = pickNumber(stats[cardKey]);
    setCampaignModalState({
      segment: meta.segment,
      segmentLabel: meta.segmentLabel,
      recipientCount,
      channel: channel || "email",
      campaignSetCount: 3,
    });
  };

  const openGoodLendersCampaign = (channel) => {
    setCampaignModalState({
      segment: "goodLenders",
      segmentLabel: "Not Participated Lenders",
      recipientCount: pickNumber(stats.goodLendersVerified),
      channel: channel || "email",
      campaignSetCount: 3,
    });
  };

  const openIndividualActiveLenderCampaign = (lender, channel) => {
    if (!lender?.lenderId) {
      return;
    }
    setCampaignModalState({
      segment: "allTime",
      segmentLabel: `Individual Active Lender — LR${lender.lenderId}`,
      recipientCount: 1,
      channel: channel || "email",
      campaignSetCount: 1,
      audienceType: "lenders",
      targetLender: {
        lenderId: lender.lenderId,
        name: lender.name || "",
        email: lender.email || "",
        mobileNumber: lender.mobileNumber || "",
      },
    });
  };

  const openRegisteredNotParticipatedCampaign = (card, channel) => {
    const segmentByCard = {
      notParticipatedRegistered1Month: "notParticipatedRegistered1Month",
      notParticipatedRegistered3Months: "notParticipatedRegistered3Months",
      notParticipatedRegistered6Months: "notParticipatedRegistered6Months",
      notParticipatedRegistered1Year: "notParticipatedRegistered1Year",
    };
    setCampaignModalState({
      segment: segmentByCard[card.key],
      segmentLabel: card.label,
      recipientCount: pickNumber(card.value),
      channel: channel || "email",
      campaignSetCount: 3,
    });
  };

  const openRegisteredNotParticipatedAutoEmail = (card) => {
    setAutoEmailModalState({
      segment: "notParticipatedRegistered1Month",
      segmentLabel: card?.label || "Last 1 Month Registered - Not Participated",
      recipientCount: pickNumber(card?.value),
    });
  };

  const openRegisteredBorrowersCampaign = (channel) => {
    const safeChannel = channel || "email";
    const isEmail = safeChannel === "email";
    setCampaignModalState({
      segment: "registeredBorrowers",
      segmentLabel: isEmail
        ? "Registered Borrowers (verified email only)"
        : "Registered Borrowers",
      recipientCount: isEmail
        ? pickPositiveNumber(
            stats.registeredBorrowersVerifiedEmailCampaignCount,
            stats.registeredBorrowersCampaignCount
          )
        : pickPositiveNumber(stats.allBorrowers, stats.registeredBorrowersCampaignCount),
      channel: safeChannel,
      campaignSetCount: 10,
      audienceType: "borrowers",
    });
  };

  const backToDashboard = () => {
    setSelectedCard(null);
    setSelectedQualityChipKey("");
    setRegisteredUsersSubView("");
    setActiveLenderParticipationRange(null);
    setActiveLenderView(null);
    resetPanels();
  };

  const backFromRegisteredUsersList = () => {
    if (registeredUsersSubView) {
      setRegisteredUsersSubView("");
      setAdminUsers([]);
      setAdminUsersTotal(0);
      setAdminUsersError("");
      setAdminUsersView("registered");
      closeAdminUserProfile();
      return;
    }
    backToDashboard();
  };

  const searchAdminUsers = (event) => {
    event.preventDefault();
    loadAdminUsers(1, adminUsersView, adminUserSearch);
  };

  const searchActiveLenders = (event) => {
    event.preventDefault();
    setLenderDeals(null);
    loadActiveLenders(1, activeLenderSearch, activeLenderParticipationRange, activeLenderView);
  };

  const openLenderDeals = async (profile) => {
    setLenderDealsLoading(true);
    setLenderDealsError("");
    setLenderDeals(null);
    setLenderDealsTab("active");
    try {
      const data = responseData(await getAdminAIActiveLenderDeals(profile.lenderId));
      setLenderDeals({ ...data, profile });
      if (!data.activeDeals?.length && data.closedDeals?.length) {
        setLenderDealsTab("closed");
      }
    } catch (error) {
      setLenderDealsError("Failed to load deal participation details for this lender.");
    } finally {
      setLenderDealsLoading(false);
    }
  };

  const downloadDashboardExcel = async (section) => {
    const isOverview = section === "overview";
    if (isOverview ? exportingOverview : exportingDeals) {
      return;
    }
    const setLoading = isOverview ? setExportingOverview : setExportingDeals;
    setExportMessage("");
    setLoading(true);
    const date = new Date().toISOString().slice(0, 10);
    const fileName = `admin-ai-${section}-${date}.xlsx`;
    try {
      const response = await downloadAdminAIDashboardExcel(section);
      const blob = response?.data;
      if (!blob || blob.size === 0) {
        throw new Error("Export returned no data.");
      }
      if (blob.type && blob.type.includes("json")) {
        const text = await blob.text();
        const payload = JSON.parse(text);
        throw new Error(payload?.errorMessage || "Export failed.");
      }
      saveAs(blob, fileName);
      setExportMessage(
        section === "overview"
          ? "Downloaded Excel: Overview Summary + all Registered Users (name, mobile, email, type, date)."
          : "Downloaded Excel: Deals Summary + Today's Deals + All Deals with status."
      );
    } catch (error) {
      try {
        if (section === "overview") {
          await downloadOverviewExcelFallback(stats);
          setExportMessage("Downloaded registered users Excel (browser export). Restart backend for single .xlsx file.");
        } else {
          await downloadDealsExcelFallback(stats);
          setExportMessage("Downloaded deals Excel files (browser export). Restart backend for single .xlsx file.");
        }
      } catch (fallbackError) {
        setExportMessage(await parseAdminAIExportError(error) || fallbackError?.message || "Export failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadUsersExcel = async (userView = "registered", label = "", fileSlug = "", filters = {}) => {
    const exportLabel = label || userViewSheetLabel(userView);
    const fileName = cardExportFileName(fileSlug || userView);
    const participationDate =
      userView === "todayParticipated"
        ? filters.participationDate || defaultParticipationDate()
        : undefined;
    setExportMessage(`Preparing ${exportLabel} export...`);
    try {
      const response = await downloadAdminAIUsersExcel(userView, participationDate);
      const blob = response?.data;
      if (!blob || blob.size === 0) {
        throw new Error("Export returned no data.");
      }
      if (blob.type && blob.type.includes("json")) {
        const text = await blob.text();
        const payload = JSON.parse(text);
        throw new Error(payload?.errorMessage || "Export failed.");
      }
      saveAs(blob, fileName);
      setExportMessage(`Downloaded ${exportLabel} Excel with user details.`);
    } catch (error) {
      setExportMessage(`Fetching all ${exportLabel} records page by page...`);
      const { rows, totalCount } = await fetchAllAdminUsersForExport(
        userView,
        (pageNo, fetched) => {
        setExportMessage(`Fetching ${exportLabel}... page ${pageNo} (${fetched} loaded)`);
        },
        filters
      );
      if (!rows.length) {
        throw new Error((await parseAdminAIExportError(error)) || "No users found to export.");
      }
      const exportHeaders = userExportHeadersForView(userView);
      const numericColumns = exportHeaders
        .map((header, index) => ({ header, index }))
        .filter(({ header }) => /ID|Count|Amount/i.test(header))
        .map(({ index }) => index);
      const usersXml = buildSpreadsheetXml(
        userViewSheetLabel(userView),
        exportHeaders,
        buildUserExportRows(rows, userView),
        numericColumns
      );
      saveSpreadsheetXml(usersXml, fileName.replace(/\.xlsx$/, ".xls"));
      setExportMessage(`Downloaded ${rows.length} of ${totalCount || rows.length} ${exportLabel} records as Excel.`);
    }
  };

  const downloadActiveLendersExcel = async (
    label = "All Active Lenders",
    fileSlug = "all-active-lenders",
    minParticipationAmount = null,
    maxParticipationAmount = null,
    lenderView = null,
    participationDate = null
  ) => {
    const fileName = cardExportFileName(fileSlug);
    setExportMessage(`Preparing ${label} export...`);
    try {
      if (!minParticipationAmount && !lenderView) {
        const response = await downloadAdminAIActiveLendersExcel();
        const blob = response?.data;
        if (!blob || blob.size === 0) {
          throw new Error("Export returned no data.");
        }
        if (blob.type && blob.type.includes("json")) {
          const text = await blob.text();
          const payload = JSON.parse(text);
          throw new Error(payload?.errorMessage || payload?.message || "Export failed.");
        }
        saveAs(blob, fileName);
        setExportMessage(`Downloaded ${label} Excel.`);
        return;
      }
      throw new Error("fallback");
    } catch (error) {
      if (error?.message !== "fallback") {
        // continue to page-by-page export below for filtered tiers or legacy failure
      }
      setExportMessage(`Fetching all ${label} records page by page...`);
      const { rows, totalCount } = await fetchAllActiveLendersForExport((pageNo, fetched) => {
        setExportMessage(`Fetching ${label}... page ${pageNo} (${fetched} loaded)`);
      }, { minParticipationAmount, maxParticipationAmount, lenderView, participationDate });
      if (!rows.length) {
        throw new Error((await parseAdminAIExportError(error)) || "No active lenders found to export.");
      }
      const headers = [
        "Lender ID", "Name", "Email", "Mobile", "City", "State", "Pincode",
        "Deals Count", "Total Participation", "Last Participation",
      ];
      const exportRows = rows.map((row) => [
        row.lenderId ?? "",
        row.name ?? "",
        row.email ?? "",
        row.mobileNumber ?? "",
        row.city ?? "",
        row.state ?? "",
        row.pincode ?? "",
        row.dealsCount ?? "",
        row.totalParticipationAmount ?? "",
        String(row.lastParticipationOn || row.lastActivityOn || "").slice(0, 10),
      ]);
      const xml = buildSpreadsheetXml(label, headers, exportRows, [0, 7, 8]);
      saveSpreadsheetXml(xml, fileName.replace(/\.xlsx$/, ".xls"));
      setExportMessage(`Downloaded ${rows.length} of ${totalCount || rows.length} ${label} records as Excel.`);
    }
  };

  const downloadOverviewCardExcel = async (cardKey) => {
    const config = userExportByCard[cardKey];
    if (!config || exportingCardKey) {
      return;
    }
    setExportingCardKey(cardKey);
    setExportMessage("");
    try {
      if (config.type === "activeLenders") {
        await downloadActiveLendersExcel(
          config.label,
          config.fileSlug,
          config.minParticipationAmount,
          config.maxParticipationAmount,
          config.lenderView
        );
      } else {
        await downloadUsersExcel(config.userView, config.label, config.fileSlug);
      }
    } catch (error) {
      setExportMessage(error?.message || "Failed to download Excel for this card.");
    } finally {
      setExportingCardKey("");
    }
  };

  const userCards = useMemo(
    () => [
      { key: "allUsers", label: "Registered Users", value: stats.allUsers, icon: <FaUsers />, meta: "Click to filter borrowers, lenders, test & email status", accent: "blue", clickable: true },
      { key: "allLenders", label: "Registered Lenders", value: stats.rawLenders, icon: <FaUserFriends />, meta: "All LENDER sign-ups (incl. eliminated)", accent: "indigo", clickable: true },
      {
        key: "allBorrowers",
        label: "Registered Borrowers",
        value: stats.allBorrowers,
        icon: <FaHandshake />,
        meta: (
          <>
            <span>Verified emails: {fmtNum(stats.registeredBorrowersVerifiedEmailCampaignCount)}</span>
            <br />
            <span>Correct email addresses: {fmtNum(stats.registeredBorrowersValidEmailCount)}</span>
            <br />
            <span>BORROWER accounts · 10 email sets</span>
          </>
        ),
        accent: "violet",
        clickable: true,
      },
      { key: "allActiveLenders", label: "All Active Lenders", value: stats.allActiveLenders, icon: <FaUserCheck />, meta: "Participated in deals", accent: "teal", clickable: true },
      { key: "lastThreeMonthsActiveLenders", label: "Last 3 Months Active", value: stats.lastThreeMonthsActiveLenders, icon: <FaChartLine />, meta: "Recent participation", accent: "cyan", clickable: true },
      {
        key: "todayRegisteredUsers",
        label: "Registered Users by Date",
        value: registeredDateCount ?? stats.todayRegisteredUsers,
        icon: <FaUserFriends />,
        meta: `New sign-ups on ${registeredDate}`,
        accent: "amber",
        clickable: true,
      },
      {
        key: "todayParticipatedUsers",
        label: "Participated Lenders",
        value: participatedDateCount ?? stats.todayParticipatedUsers,
        icon: <FaUserClock />,
        meta: `Lenders active on ${participatedDate} (all deals)`,
        accent: "orange",
        clickable: true,
      },
      {
        key: "newParticipatedLenders",
        label: "New Participated Lenders",
        value: newParticipatedDateCount ?? stats.newParticipatedLenders,
        icon: <FaUserPlus />,
        meta: `First-ever participation on ${newParticipationDate}`,
        accent: "emerald",
        clickable: true,
      },
      { key: "referralRegisteredUsers", label: "Referral Registered Users", value: stats.referralRegisteredUsers, icon: <FaUserPlus />, meta: "Via referral link · default today", accent: "rose", clickable: true },
    ],
    [stats, newParticipatedDateCount, newParticipationDate, participatedDateCount, participatedDate, registeredDateCount, registeredDate]
  );

  const highParticipationCards = useMemo(
    () => [
      {
        key: "participation50LakhTo1Crore",
        label: "50 Lakhs to Below 1 Crore",
        value: stats.participation50LakhTo1Crore,
        icon: <FaMedal />,
        meta: "Rs 50,00,000 to below Rs 1,00,00,000",
        accent: "amber",
        clickable: true,
      },
      {
        key: "participation1CroreTo2Crore",
        label: "1 Crore to Below 2 Crores",
        value: stats.participation1CroreTo2Crore,
        icon: <FaTrophy />,
        meta: "Rs 1,00,00,000 to below Rs 2,00,00,000",
        accent: "rose",
        clickable: true,
      },
      {
        key: "participation2CroreTo3Crore",
        label: "2 Crores to Below 3 Crores",
        value: stats.participation2CroreTo3Crore,
        icon: <FaChartLine />,
        meta: "Rs 2,00,00,000 to below Rs 3,00,00,000",
        accent: "violet",
        clickable: true,
      },
      {
        key: "participation3CrorePlus",
        label: "3 Crores and Above",
        value: stats.participation3CrorePlus,
        icon: <FaTrophy />,
        meta: "Rs 3,00,00,000 or more",
        accent: "indigo",
        clickable: true,
      },
    ],
    [stats]
  );

  const lenderQualityCards = useMemo(
    () => [
      {
        key: "goodLenders",
        label: "Not Participated Lenders",
        value: stats.goodLenders,
        icon: <FaCheckCircle />,
        meta: `${fmtNum(stats.goodLendersVerified)} verified email · ${fmtNum(stats.goodLendersUnverifiedEmail)} unverified email`,
        accent: "green",
        clickable: true,
      },
      {
        key: "eliminatedLenders",
        label: "Eliminated",
        value: stats.eliminatedLenders,
        icon: <FaUserSlash />,
        meta: `Test ${fmtNum(stats.lenderQualityBreakdown?.testUsers)} · bad mobile ${fmtNum(stats.lenderQualityBreakdown?.invalidMobile)} · bad email ${fmtNum(stats.lenderQualityBreakdown?.invalidEmail)} · dup mobile ${fmtNum(stats.lenderQualityBreakdown?.duplicateMobile)} · dup name ${fmtNum(stats.lenderQualityBreakdown?.duplicateName)}`,
        accent: "rose",
        clickable: true,
      },
    ],
    [stats]
  );

  const registeredNotParticipatedCards = useMemo(() => [
    { key: "notParticipatedRegistered1Month", label: "Last 1 Month Registered - Not Participated", value: stats.notParticipatedRegistered1Month, icon: <FaUserClock />, meta: "Lenders registered in the last month with no participation", accent: "cyan", clickable: true },
    { key: "notParticipatedRegistered3Months", label: "Last 3 Months Registered - Not Participated", value: stats.notParticipatedRegistered3Months, icon: <FaUserClock />, meta: "Lenders registered in the last 3 months with no participation", accent: "teal", clickable: true },
    { key: "notParticipatedRegistered6Months", label: "Last 6 Months Registered - Not Participated", value: stats.notParticipatedRegistered6Months, icon: <FaUserClock />, meta: "Lenders registered in the last 6 months with no participation", accent: "amber", clickable: true },
    { key: "notParticipatedRegistered1Year", label: "Last 1 Year Registered - Not Participated", value: stats.notParticipatedRegistered1Year, icon: <FaUserClock />, meta: "Lenders registered in the last year with no participation", accent: "rose", clickable: true },
  ], [stats]);

  const dealCards = useMemo(
    () => [
      {
        key: "todayDeals",
        label: "Today's Deals",
        value: stats.todayDealsCreated,
        icon: <FaCalendarDay />,
        meta:
          stats.todayDealsCreated > 0 || stats.todayDealsClosed > 0
            ? `${fmtNum(stats.todayDealsCreated)} created · ${fmtNum(stats.todayDealsClosed)} closed today`
            : "No deals today",
        accent: "amber",
        clickable: true,
        navigateTo: "/adminAICreatedDeals?tab=todaycreated",
      },
      {
        key: "allDeals",
        label: "All Deals Created",
        value: stats.allDeals,
        icon: <FaBriefcase />,
        meta: "Full deals directory",
        accent: "slate",
        clickable: true,
        navigateTo: "/adminAICreatedDeals",
      },
      {
        key: "activeDeals",
        label: "Active Deals",
        value: stats.activeDeals,
        icon: <FaHandshake />,
        meta: "Open / not closed",
        accent: "green",
        clickable: true,
        navigateTo: "/adminAICreatedDeals?tab=active",
      },
      {
        key: "closedDeals",
        label: "Closed Deals",
        value: stats.closedDeals,
        icon: <FaHandshake />,
        meta: "Completed deals",
        accent: "emerald",
        clickable: true,
        navigateTo: "/adminAICreatedDeals?tab=closed",
      },
      {
        key: "testDeals",
        label: "Test Deals",
        value: stats.testDeals,
        icon: <FaBriefcase />,
        meta: "Test records only",
        accent: "gray",
        clickable: true,
        navigateTo: "/adminAICreatedDeals?tab=test",
      },
    ],
    [stats]
  );

  const platformMix = useMemo(() => {
    const breakdown = charts.registrationBreakdown || {};
    const usersCount = pickNumber(breakdown.registeredUsers, stats.allUsers);
    const lendersCount = pickNumber(breakdown.lenders, stats.rawLenders, stats.goodLenders);
    const borrowersCount = pickNumber(breakdown.borrowers, stats.allBorrowers);
    return {
      usersCount,
      lendersCount,
      borrowersCount,
      series: [usersCount, lendersCount, borrowersCount],
      options: {
        labels: ["Registered Users", "Lenders", "Borrowers"],
        colors: ["#2563EB", "#0D9488", "#EA580C"],
        legend: { show: false },
        dataLabels: { enabled: false },
        stroke: { width: 0 },
        plotOptions: {
          pie: {
            donut: {
              size: "72%",
              labels: {
                show: true,
                name: { show: true, fontSize: "12px", fontWeight: 700, color: "#64748B" },
                value: {
                  show: true,
                  fontSize: "22px",
                  fontWeight: 800,
                  color: "#0F172A",
                  formatter: (val) => fmtNum(val),
                },
                total: {
                  show: true,
                  label: "Total users",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#64748B",
                  formatter: () => fmtNum(usersCount),
                },
              },
            },
          },
        },
      },
    };
  }, [charts.registrationBreakdown, stats]);

  const everydayRegChart = useMemo(() => {
    const rows = charts.dailyRegistrationTrend || [];
    return {
      series: [
        { name: "Registered", data: rows.map((row) => pickNumber(row.registeredUsers)) },
        { name: "Participated", data: rows.map((row) => pickNumber(row.participatedUsers)) },
      ],
      options: {
        chart: { toolbar: { show: false }, fontFamily: "inherit", zoom: { enabled: false } },
        colors: ["#2563EB", "#0D9488"],
        stroke: { curve: "smooth", width: 3 },
        fill: {
          type: "gradient",
          gradient: { shadeIntensity: 1, opacityFrom: 0.28, opacityTo: 0.04, stops: [0, 90, 100] },
        },
        grid: { borderColor: "#E2E8F0", strokeDashArray: 3 },
        xaxis: {
          categories: rows.map((row) => row.date),
          labels: { style: { colors: "#64748B", fontSize: "10px", fontWeight: 600 }, rotate: -35 },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          labels: {
            style: { colors: "#94A3B8", fontSize: "10px" },
            formatter: (value) => fmtNum(value),
          },
        },
        legend: { position: "top", horizontalAlign: "left", fontWeight: 700 },
        dataLabels: { enabled: false },
        tooltip: { y: { formatter: (value) => fmtNum(value) } },
      },
    };
  }, [charts.dailyRegistrationTrend]);

  const topLendersChart = useMemo(() => {
    const rows = topLenders || [];
    return {
      series: [{ name: "Total Investment", data: rows.map((row) => Math.round(pickNumber(row.totalInvestment, row.totalParticipationAmount))) }],
      options: {
        chart: { toolbar: { show: false }, fontFamily: "inherit", foreColor: "#475569" },
        colors: ["#0f766e"],
        plotOptions: { bar: { horizontal: true, borderRadius: 5, barHeight: "58%", distributed: false } },
        dataLabels: { enabled: false },
        grid: { borderColor: "#e2e8f0", strokeDashArray: 3 },
        xaxis: {
          categories: rows.map((row) => shortLenderLabel(row)),
          labels: {
            style: { fontSize: "11px", fontWeight: 600, colors: "#334155" },
            formatter: (value) => fmtOfficialMoney(value),
          },
          title: { text: "Investment (₹)", style: { fontSize: "11px", fontWeight: 700, color: "#64748b" } },
        },
        yaxis: {
          labels: {
            style: { fontSize: "11px", fontWeight: 700, colors: "#0f172a" },
            maxWidth: 148,
          },
        },
        tooltip: {
          y: {
            formatter: (value) => `${fmtOfficialMoney(value)} (${fmtMoney(value)})`,
          },
        },
        legend: { show: false },
      },
    };
  }, [topLenders]);

  const monthlyTopLendersChart = useMemo(() => {
    const rows = monthlyTopLenders || [];
    return {
      series: [{ name: "Month Investment", data: rows.map((row) => Math.round(pickNumber(row.totalInvestment, row.totalParticipationAmount))) }],
      options: {
        chart: { toolbar: { show: false }, fontFamily: "inherit", foreColor: "#475569" },
        colors: ["#0369a1"],
        plotOptions: { bar: { horizontal: true, borderRadius: 5, barHeight: "58%" } },
        dataLabels: { enabled: false },
        grid: { borderColor: "#e2e8f0", strokeDashArray: 3 },
        xaxis: {
          categories: rows.map((row) => shortLenderLabel(row)),
          labels: {
            style: { fontSize: "11px", fontWeight: 600, colors: "#334155" },
            formatter: (value) => fmtOfficialMoney(value),
          },
          title: { text: "Investment (₹)", style: { fontSize: "11px", fontWeight: 700, color: "#64748b" } },
        },
        yaxis: {
          labels: {
            style: { fontSize: "11px", fontWeight: 700, colors: "#0f172a" },
            maxWidth: 148,
          },
        },
        tooltip: {
          y: {
            formatter: (value) => `${fmtOfficialMoney(value)} (${fmtMoney(value)})`,
          },
        },
        legend: { show: false },
      },
    };
  }, [monthlyTopLenders]);

  const monthlyInvestmentTrendChart = useMemo(() => {
    const rows = monthlyTrend || [];
    return {
      series: [
        { name: "Total Investment", type: "column", data: rows.map((row) => Math.round(pickNumber(row.totalInvestment))) },
        { name: "Active Lenders", type: "line", data: rows.map((row) => pickNumber(row.activeLenderCount)) },
      ],
      options: {
        chart: { toolbar: { show: false }, fontFamily: "inherit", type: "line", foreColor: "#475569" },
        colors: ["#0f766e", "#b45309"],
        stroke: { width: [0, 3], curve: "smooth" },
        plotOptions: { bar: { borderRadius: 6, columnWidth: "48%" } },
        dataLabels: { enabled: false },
        grid: { borderColor: "#e2e8f0", strokeDashArray: 3 },
        xaxis: { categories: rows.map((row) => row.monthLabel || row.yearMonth) },
        yaxis: [
          {
            title: { text: "Investment (₹)" },
            labels: { formatter: (value) => fmtOfficialMoney(value) },
          },
          { opposite: true, title: { text: "Lenders" } },
        ],
        tooltip: {
          shared: true,
          intersect: false,
          y: [
            { formatter: (value) => `${fmtOfficialMoney(value)} (${fmtMoney(value)})` },
            { formatter: (value) => fmtNum(value) },
          ],
        },
      },
    };
  }, [monthlyTrend]);

  const monthOptions = useMemo(() => {
    const fromTrend = (monthlyTrend || []).map((row) => row.yearMonth).filter(Boolean);
    if (fromTrend.length) {
      return [...fromTrend].reverse();
    }
    const options = [];
    const now = new Date();
    for (let index = 0; index < 12; index += 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
      options.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
    }
    return options;
  }, [monthlyTrend]);

  const adminUsersTitle = useMemo(() => {
    if (selectedQualityChipKey && lenderQualityChipViews[selectedQualityChipKey]) {
      return lenderQualityChipViews[selectedQualityChipKey].label;
    }
    if (registeredUsersSubView) {
      const box = registeredUsersBreakdownBoxes.find((item) => item.key === registeredUsersSubView);
      if (box) {
        return box.label;
      }
    }
    if (adminUsersView === "todayParticipated") {
      const date = adminUserSearch.participationDate || defaultParticipationDate();
      return isTodayParticipationDate(date)
        ? "Today Participated Users"
        : `Participated Users — ${formatDate(date)}`;
    }
    return {
      registered: "All Registered Users",
      lenders: "Not Participated Lenders",
      lendersNotParticipated: "Not Participated Lenders",
      lendersNotParticipatedRegistered1Month: "Last 1 Month Registered - Not Participated Lenders",
      lendersNotParticipatedRegistered3Months: "Last 3 Months Registered - Not Participated Lenders",
      lendersNotParticipatedRegistered6Months: "Last 6 Months Registered - Not Participated Lenders",
      lendersNotParticipatedRegistered1Year: "Last 1 Year Registered - Not Participated Lenders",
      lendersRaw: "All Registered Lenders",
      registeredLenders: "Lenders",
      lendersExcluded: "Eliminated Lenders",
      lendersExcludedTestUsers: "Test Users Removed",
      lendersExcludedInvalidMobile: "Invalid / Fake Mobile",
      lendersExcludedInvalidEmail: "Invalid Email",
      lendersExcludedDuplicateMobile: "Duplicate Mobile",
      lendersExcludedDuplicateName: "Duplicate First+Last Name",
      borrowers: "Borrowers",
      testBorrowers: "Test Borrowers",
      testLenders: "Test Lenders",
      registeredBorrowersVerifiedEmail: "Verified Email Borrowers",
      registeredLendersVerifiedEmail: "Verified Email Lenders",
      registeredBorrowersUnverifiedEmail: "Unverified Email Borrowers",
      registeredLendersUnverifiedEmail: "Unverified Email Lenders",
      todayRegistered: "Today Registered Users",
      last3MonthsActive: "Last 3 Months Active",
    }[adminUsersView] || "Registered User Records";
  }, [adminUsersView, adminUserSearch.participationDate, selectedQualityChipKey, registeredUsersSubView]);

  const handleParticipationDateChange = (participationDate) => {
    const nextSearch = { ...adminUserSearch, participationDate };
    setAdminUserSearch(nextSearch);
    closeAdminUserProfile();
    loadAdminUsers(1, adminUsersView, nextSearch);
  };

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid admin-ai-page admin-ai-pro">
          <section className="admin-ai-brand-strip" aria-label="OxyLoans brand">
            <div className="admin-ai-brand-strip-accent" aria-hidden="true" />
            <div className="admin-ai-brand-strip-content">
              <div className="admin-ai-brand-anniversary" aria-hidden="true">
                <strong>10</strong>
                <span>Years</span>
              </div>
              <img
                src={`${process.env.PUBLIC_URL || ""}/assets/img/oxyloans-campaign-logo.png`}
                alt="OxyLoans"
                className="admin-ai-brand-strip-logo"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://oxyloans.com/wp-content/themes/oxyloan/oxyloan/_ui/images/logo4.png";
                }}
              />
              <div className="admin-ai-brand-strip-text">
                <span className="admin-ai-brand-strip-rbi">RBI Approved P2P NBFC</span>
                <span className="admin-ai-brand-strip-tagline">Lend · Borrow · Invest</span>
              </div>
            </div>
            <span className="admin-ai-brand-strip-badge">Trusted since 2016</span>
          </section>

          <header className="admin-ai-pro-header">
            <div>
              <p className="admin-ai-pro-eyebrow">Admin · Live Platform Data</p>
              <h1 className="admin-ai-pro-title">Admin AI Dashboard</h1>
              <p className="admin-ai-pro-desc">Operational summary of users, lenders, borrowers, and deals.</p>
            </div>
            <div className="admin-ai-pro-header-actions">
              <button
                type="button"
                className="admin-ai-search-btn"
                disabled={loading || topLendersLoading}
                onClick={refreshDashboard}
                title="Reload dashboard counts and rankings from server"
              >
                <FaSync /> {loading || topLendersLoading ? "Refreshing..." : "Refresh"}
              </button>
              <span className="admin-ai-pro-breadcrumb">Admin / AI Dashboard</span>
            </div>
          </header>

          {loadError && (
            <div className="alert alert-danger d-flex justify-content-between align-items-center">
              <span>{loadError}</span>
              <button className="btn btn-sm btn-outline-danger" onClick={refreshDashboard}>Retry</button>
            </div>
          )}

          {exportMessage ? <div className="admin-ai-pro-export-msg">{exportMessage}</div> : null}

          {loading && <div className="admin-ai-empty-state">Loading Admin AI dashboard...</div>}

          {!loading && !showActiveLenders && !showAdminUsers && !showReferralPanel && !showRegisteredUsersBreakdown && (
            <>
              <section className="admin-ai-pro-section admin-ai-pro-section--oxyinsights-entry">
                <button
                  type="button"
                  className="admin-ai-pro-section-head admin-ai-yearwise-header admin-ai-oxyinsights-entry"
                  onClick={() => navigate(OXYINSIGHTS_PATH)}
                >
                  <div className="admin-ai-pro-section-icon admin-ai-pro-section-icon--oxyinsights">
                    <FaChartLine />
                  </div>
                  <div className="admin-ai-yearwise-header-copy">
                    <h2>OXYINSIGHTS</h2>
                    <p>Today / weekly / yearly login history and registration history. Open full insights page.</p>
                  </div>
                  <span className="admin-ai-yearwise-header-meta">
                    <span className="admin-ai-yearwise-header-open">Open →</span>
                  </span>
                </button>
              </section>

              <section className="admin-ai-pro-section admin-ai-pro-section--users">
                <div className="admin-ai-pro-section-head">
                  <div className="admin-ai-pro-section-icon admin-ai-pro-section-icon--users"><FaUsers /></div>
                  <div>
                    <h2>Platform Overview</h2>
                    <p>Summary counts plus full registered-user Excel (name, mobile, email, LENDER/BORROWER, register date).</p>
                  </div>
                  <div className="admin-ai-pro-section-head-actions">
                    <button
                      type="button"
                      className="admin-ai-reset-btn"
                      disabled={loading || topLendersLoading}
                      onClick={refreshDashboard}
                      title="Reload dashboard counts and rankings from server"
                    >
                      <FaSync /> {loading || topLendersLoading ? "Refreshing..." : "Refresh"}
                    </button>
                    <button
                      type="button"
                      className="admin-ai-pro-section-export-btn"
                      disabled={exportingOverview}
                      onClick={() => downloadDashboardExcel("overview")}
                      title="Sheet 1: counts. Sheet 2: all registered users with details."
                    >
                      <FaFileExcel /> {exportingOverview ? "Exporting..." : "Download Excel"}
                    </button>
                  </div>
                </div>
                <div className="admin-ai-pro-grid admin-ai-pro-grid-overview">
                  {userCards.map((card) => (
                    <StatCard
                      key={card.key}
                      {...card}
                      active={selectedCard?.key === card.key}
                      onClick={card.clickable ? () => handleCardClick(card) : undefined}
                      onExport={
                        card.key === "todayRegisteredUsers"
                          ? () => downloadUsersExcel(
                              "todayRegistered",
                              `Registered Users - ${registeredDate}`,
                              `registered-users-${registeredDate}`,
                              { participationDate: registeredDate }
                            )
                        : card.key === "newParticipatedLenders"
                          ? () => downloadActiveLendersExcel(
                              "New Participated Lenders",
                              `new-participated-lenders-${newParticipationDate}`,
                              null,
                              null,
                              "newParticipated",
                              newParticipationDate
                            )
                          : card.key === "todayParticipatedUsers"
                            ? () => downloadUsersExcel(
                                "todayParticipated",
                                `Participated Lenders - ${participatedDate}`,
                                `participated-lenders-${participatedDate}`,
                                { participationDate: participatedDate }
                              )
                          : userExportByCard[card.key]
                            ? () => downloadOverviewCardExcel(card.key)
                            : undefined
                      }
                      exporting={exportingCardKey === card.key}
                      dateFilter={
                        card.key === "todayRegisteredUsers"
                          ? registeredDate
                        : card.key === "newParticipatedLenders"
                          ? newParticipationDate
                          : card.key === "todayParticipatedUsers"
                            ? participatedDate
                            : undefined
                      }
                      dateFilterLoading={
                        card.key === "todayRegisteredUsers"
                          ? registeredDateLoading
                        : card.key === "newParticipatedLenders"
                          ? newParticipatedDateLoading
                          : card.key === "todayParticipatedUsers"
                            ? participatedDateLoading
                            : false
                      }
                      dateFilterError={
                        card.key === "todayRegisteredUsers"
                          ? registeredDateError
                        : card.key === "newParticipatedLenders"
                          ? newParticipatedDateError
                          : card.key === "todayParticipatedUsers"
                            ? participatedDateError
                            : ""
                      }
                      onDateFilterChange={
                        card.key === "todayRegisteredUsers"
                          ? (date) => {
                              setRegisteredDate(date);
                              setRegisteredDateCount(null);
                              setRegisteredDateError("");
                            }
                        : card.key === "newParticipatedLenders"
                          ? (date) => {
                              setNewParticipationDate(date);
                              setNewParticipatedDateCount(null);
                              setNewParticipatedDateError("");
                            }
                          : card.key === "todayParticipatedUsers"
                            ? (date) => {
                                setParticipatedDate(date);
                                setParticipatedDateCount(null);
                                setParticipatedDateError("");
                              }
                            : undefined
                      }
                      onDateSearch={
                        card.key === "todayRegisteredUsers"
                          ? searchRegisteredByDate
                        : card.key === "newParticipatedLenders"
                          ? searchNewParticipatedByDate
                          : card.key === "todayParticipatedUsers"
                            ? searchParticipatedByDate
                            : undefined
                      }
                      onCampaign={
                        card.key === "allBorrowers"
                          ? openRegisteredBorrowersCampaign
                          : undefined
                      }
                    />
                  ))}
                </div>
              </section>

              <section className="admin-ai-pro-section admin-ai-pro-section--yearwise">
                <button
                  type="button"
                  className="admin-ai-pro-section-head admin-ai-yearwise-header"
                  onClick={openYearWiseReferrals}
                >
                  <div className="admin-ai-pro-section-icon admin-ai-pro-section-icon--yearwise">
                    <FaChartLine />
                  </div>
                  <div className="admin-ai-yearwise-header-copy">
                    <h2>YearWise referrals</h2>
                    <p>Referral lenders by year (2021 → current). Click to open year boxes and lists.</p>
                  </div>
                  <span className="admin-ai-yearwise-header-meta">
                    <span className="admin-ai-yearwise-header-open">Open →</span>
                  </span>
                </button>
                <button
                  type="button"
                  className="admin-ai-pro-section-head admin-ai-yearwise-header admin-ai-ref-portfolio-entry"
                  onClick={() => navigate("/adminAIActiveLendersReferralPortfolio")}
                >
                  <div className="admin-ai-pro-section-icon admin-ai-pro-section-icon--yearwise">
                    <FaUsers />
                  </div>
                  <div className="admin-ai-yearwise-header-copy">
                    <h2>All Active Lenders Referral Portfolio</h2>
                    <p>All active lenders with/without referrals, referee tree map, and Excel download.</p>
                  </div>
                  <span className="admin-ai-yearwise-header-meta">
                    <span className="admin-ai-yearwise-header-open">Open →</span>
                  </span>
                </button>
              </section>

              <section className="admin-ai-pro-section admin-ai-pro-section--high-participation">
                <div className="admin-ai-pro-section-head">
                  <div className="admin-ai-pro-section-icon admin-ai-pro-section-icon--users"><FaTrophy /></div>
                  <div>
                    <h2>High Participation Lenders</h2>
                    <p>Lenders grouped by total participation ranges (participation + updation): 50L to below 1Cr, 1Cr to below 2Cr, 2Cr to below 3Cr, and 3Cr+.</p>
                  </div>
                </div>
                <div className="admin-ai-pro-grid admin-ai-pro-grid-overview">
                  {highParticipationCards.map((card) => (
                    <StatCard
                      key={card.key}
                      {...card}
                      active={selectedCard?.key === card.key}
                      onClick={card.clickable ? () => handleCardClick(card) : undefined}
                      onExport={userExportByCard[card.key] ? () => downloadOverviewCardExcel(card.key) : undefined}
                      exporting={exportingCardKey === card.key}
                      onCampaign={(channel) => openParticipationTierCampaign(card.key, channel)}
                    />
                  ))}
                </div>
              </section>

              <section className="admin-ai-pro-section admin-ai-pro-section--lender-quality">
                <div className="admin-ai-pro-section-head">
                  <div className="admin-ai-pro-section-icon admin-ai-pro-section-icon--filter"><FaFilter /></div>
                  <div>
                    <h2>Lender Quality Filter</h2>
                    <p>
                      From {fmtNum(stats.rawLenders)} registered lenders: {fmtNum(stats.goodLenders)} not participated ({fmtNum(stats.goodLendersVerified)} verified, {fmtNum(stats.goodLendersUnverifiedEmail)} unverified email),{" "}
                      {fmtNum(stats.activeCleanLenders)} active clean, and {fmtNum(stats.eliminatedLenders)} eliminated.
                      {!stats.lenderQualityFilterActive ? (
                        <>
                          {" "}
                          <strong>Quality filter is not active — restart the backend to load the latest code.</strong>
                          {stats.lenderQualityError ? ` (${stats.lenderQualityError})` : ""}
                        </>
                      ) : null}
                    </p>
                  </div>
                </div>
                <div className="admin-ai-lender-filter-rules">
                  {Object.entries(lenderQualityChipViews).map(([chipKey, chip]) => {
                    const countKey = chip.countKey
                      || (chipKey === "testUsers"
                      ? "testUsers"
                      : chipKey === "invalidMobile"
                        ? "invalidMobile"
                        : chipKey === "invalidEmail"
                          ? "invalidEmail"
                          : chipKey === "duplicateMobile"
                            ? "duplicateMobile"
                            : "duplicateName");
                    return (
                      <button
                        key={chipKey}
                        type="button"
                        className={`admin-ai-lender-filter-chip admin-ai-lender-filter-chip--clickable${
                          selectedQualityChipKey === chipKey ? " admin-ai-lender-filter-chip--active" : ""
                        }`}
                        onClick={() => openLenderQualityChip(chipKey)}
                        title={`View ${chip.label} list`}
                      >
                        {chip.chipLabel} · {fmtNum(stats.lenderQualityBreakdown?.[countKey])}
                      </button>
                    );
                  })}
                </div>
                <div className="admin-ai-pro-grid admin-ai-pro-grid-lender-quality">
                  {lenderQualityCards.map((card) => (
                    <StatCard
                      key={card.key}
                      {...card}
                      active={selectedCard?.key === card.key}
                      onClick={card.clickable ? () => handleCardClick(card) : undefined}
                      onExport={userExportByCard[card.key] ? () => downloadOverviewCardExcel(card.key) : undefined}
                      exporting={exportingCardKey === card.key}
                      onCampaign={card.key === "goodLenders" ? openGoodLendersCampaign : undefined}
                    />
                  ))}
                </div>
              </section>

              <section className="admin-ai-pro-section admin-ai-pro-section--lender-quality">
                <div className="admin-ai-pro-section-head">
                  <div className="admin-ai-pro-section-icon admin-ai-pro-section-icon--users"><FaUserClock /></div>
                  <div>
                    <h2>Registered Lenders - Not Participated</h2>
                    <p>Lender-only registration windows. Each list includes registration date, email, mobile, and WhatsApp details for campaigns.</p>
                  </div>
                </div>
                <div className="admin-ai-pro-grid admin-ai-pro-grid-overview">
                  {registeredNotParticipatedCards.map((card) => (
                    <StatCard
                      key={card.key}
                      {...card}
                      active={selectedCard?.key === card.key}
                      onClick={() => handleCardClick(card)}
                      onExport={() => downloadOverviewCardExcel(card.key)}
                      exporting={exportingCardKey === card.key}
                      onCampaign={(channel) => openRegisteredNotParticipatedCampaign(card, channel)}
                      onAutoEmail={
                        card.key === "notParticipatedRegistered1Month"
                          ? () => openRegisteredNotParticipatedAutoEmail(card)
                          : undefined
                      }
                    />
                  ))}
                </div>
              </section>

              <section className="admin-ai-pro-section admin-ai-pro-section--deals">
                <div className="admin-ai-pro-section-head">
                  <div className="admin-ai-pro-section-icon admin-ai-pro-section-icon--deals"><FaBriefcase /></div>
                  <div>
                    <h2>Platform Deals</h2>
                    <p>Summary counts, today&apos;s deals with status, and full all-deals list in Excel.</p>
                  </div>
                  <button
                    type="button"
                    className="admin-ai-pro-section-export-btn admin-ai-pro-section-export-btn--deals"
                    disabled={exportingDeals}
                    onClick={() => downloadDashboardExcel("deals")}
                    title="Sheets: summary, today's deals, all deals with status."
                  >
                    <FaFileExcel /> {exportingDeals ? "Exporting..." : "Download Excel"}
                  </button>
                </div>
                <div className="admin-ai-pro-grid admin-ai-pro-grid-overview">
                  {dealCards.map((card) => (
                    <StatCard
                      key={card.key}
                      {...card}
                      active={selectedCard?.key === card.key}
                      onClick={() => navigate(card.navigateTo)}
                    />
                  ))}
                </div>
              </section>

              <AdminAILenderAnalyticsPanel onOpenLender={openTopLenderDetail} />

              <AdminAILatestFirstParticipatedPanel onOpenLender={openTopLenderDetail} />

              <section className="admin-ai-panel admin-ai-top-lenders-panel admin-ai-top-lenders-panel--compact admin-ai-top-lenders-panel--official">
                <div className="admin-ai-panel-head">
                  <div>
                    <h4><FaTrophy /> Top 10 Lenders</h4>
                    <p>Official investment rankings — amounts in ₹ Crore / Lakh. Switch tabs for all-time, monthly, or trend.</p>
                  </div>
                  <span className="admin-ai-live-pill admin-ai-live-pill--official">Investment Rankings</span>
                </div>

                {topLendersError && (
                  <div className="alert alert-danger d-flex justify-content-between align-items-center">
                    <span>{topLendersError}</span>
                    <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => loadTopLendersData(selectedTopMonth)}>Retry</button>
                  </div>
                )}

                {topLendersLoading && <div className="admin-ai-empty-state">Loading top lender rankings...</div>}

                {!topLendersLoading && (
                  <>
                    <div className="admin-ai-top-lenders-toolbar">
                      <div className="admin-ai-top-lenders-tabs">
                        <button
                          type="button"
                          className={topLendersTab === "allTime" ? "active" : ""}
                          onClick={() => setTopLendersTab("allTime")}
                        >
                          <FaMedal /> All-Time
                        </button>
                        <button
                          type="button"
                          className={topLendersTab === "monthly" ? "active" : ""}
                          onClick={() => setTopLendersTab("monthly")}
                        >
                          Month-Wise
                        </button>
                        <button
                          type="button"
                          className={topLendersTab === "trend" ? "active" : ""}
                          onClick={() => setTopLendersTab("trend")}
                        >
                          <FaChartLine /> 12-Mo Trend
                        </button>
                      </div>
                      {topLendersTab === "monthly" ? (
                        <label className="admin-ai-month-picker admin-ai-month-picker--inline">
                          Month
                          <select
                            value={selectedTopMonth}
                            onChange={(event) => loadMonthlyTopLenders(event.target.value)}
                          >
                            {monthOptions.map((month) => (
                              <option key={month} value={month}>{month}</option>
                            ))}
                          </select>
                        </label>
                      ) : null}
                    </div>

                    {topLendersTab === "trend" ? (
                      <div className="admin-ai-top-lenders-trend-only">
                        {monthlyTrend.length ? (
                          <div className="admin-ai-chart-wrap admin-ai-chart-wrap-compact">
                            <ReactApexChart type="line" height={240} series={monthlyInvestmentTrendChart.series} options={monthlyInvestmentTrendChart.options} />
                          </div>
                        ) : (
                          <div className="admin-ai-empty-state">No monthly investment trend data returned.</div>
                        )}
                      </div>
                    ) : (
                      <div className="admin-ai-top-lenders-split">
                        <div className="admin-ai-top-lenders-chart-pane">
                          {topLendersTab === "allTime" ? (
                            topLenders.length ? (
                              <ReactApexChart type="bar" height={240} series={topLendersChart.series} options={topLendersChart.options} />
                            ) : (
                              <div className="admin-ai-empty-state">No all-time top lender data.</div>
                            )
                          ) : monthlyTopLenders.length ? (
                            <ReactApexChart type="bar" height={240} series={monthlyTopLendersChart.series} options={monthlyTopLendersChart.options} />
                          ) : (
                            <div className="admin-ai-empty-state">No data for {selectedTopMonth}.</div>
                          )}
                        </div>
                        <div className="admin-ai-top-lenders-list-pane">
                          <TopLendersCompactList
                            lenders={topLendersTab === "allTime" ? topLenders : monthlyTopLenders}
                            monthly={topLendersTab === "monthly"}
                            onSelect={openTopLenderDetail}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </section>

              <section className="admin-ai-oxyinsights admin-ai-oxy-platform" aria-label="Platform mix and everyday registrations">
                <div className="admin-ai-oxy-head">
                  <div className="admin-ai-oxy-title-block">
                    <div className="admin-ai-oxy-title-row">
                      <h2>PLATFORM MIX</h2>
                      <span className="admin-ai-oxy-today-badge">LIVE</span>
                    </div>
                    <p className="admin-ai-oxy-today-date">Users · Lenders · Borrowers</p>
                    <p>Same OXYINSIGHTS style — portfolio mix and last 14 days registrations at a glance.</p>
                  </div>
                  <div className="admin-ai-oxy-head-actions">
                    <button
                      type="button"
                      className="admin-ai-oxy-refresh"
                      onClick={() => navigate(OXYINSIGHTS_PATH)}
                      title="Open full OXYINSIGHTS"
                    >
                      <FaChartLine /> Open OXYINSIGHTS
                    </button>
                  </div>
                </div>

                <div className="admin-ai-oxy-today-banner">
                  <strong>Platform snapshot ready</strong>
                  <span>
                    Total users: <b>{fmtNum(platformMix.usersCount)}</b>
                    {" · "}
                    Lenders: <b>{fmtNum(platformMix.lendersCount)}</b>
                    {" · "}
                    Borrowers: <b>{fmtNum(platformMix.borrowersCount)}</b>
                  </span>
                </div>

                <div className="admin-ai-oxy-kpi-row admin-ai-oxy-kpi-row--three">
                  <button
                    type="button"
                    className="admin-ai-oxy-kpi-card is-blue is-clickable"
                    onClick={() => handleCardClick({ key: "allUsers", clickable: true })}
                  >
                    <span>Registered users</span>
                    <strong>{fmtNum(platformMix.usersCount)}</strong>
                    <em className="is-neutral">All platform users in UserRepo</em>
                    <span className="admin-ai-oxy-view-btn"><FaEye /> View</span>
                  </button>
                  <button
                    type="button"
                    className="admin-ai-oxy-kpi-card is-teal is-clickable"
                    onClick={() => handleCardClick({ key: "allLenders", clickable: true })}
                  >
                    <span>Lenders</span>
                    <strong>{fmtNum(platformMix.lendersCount)}</strong>
                    <em className="is-neutral">Lender accounts on the platform</em>
                    <span className="admin-ai-oxy-view-btn"><FaEye /> View</span>
                  </button>
                  <button
                    type="button"
                    className="admin-ai-oxy-kpi-card is-amber is-clickable"
                    onClick={() => handleCardClick({ key: "allBorrowers", clickable: true })}
                  >
                    <span>Borrowers</span>
                    <strong>{fmtNum(platformMix.borrowersCount)}</strong>
                    <em className="is-neutral">Borrower accounts on the platform</em>
                    <span className="admin-ai-oxy-view-btn"><FaEye /> View</span>
                  </button>
                </div>

                <div className="admin-ai-oxy-grid admin-ai-oxy-platform-grid">
                  <section className="admin-ai-oxy-panel is-chart">
                    <div className="admin-ai-oxy-panel-head">
                      <h3>User portfolio mix</h3>
                      <span>Registered users vs lenders vs borrowers</span>
                    </div>
                    <div className="admin-ai-oxy-platform-donut">
                      <ReactApexChart type="donut" height={280} series={platformMix.series} options={platformMix.options} />
                    </div>
                  </section>
                  <section className="admin-ai-oxy-panel is-list admin-ai-oxy-panel--wide">
                    <div className="admin-ai-oxy-panel-head">
                      <h3>Everyday registrations</h3>
                      <span>Last {fmtNum(charts.dailyRegistrationTrend.length || 14)} days · registered vs participated</span>
                    </div>
                    {charts.dailyRegistrationTrend.length ? (
                      <ReactApexChart type="area" height={280} series={everydayRegChart.series} options={everydayRegChart.options} />
                    ) : (
                      <div className="admin-ai-oxy-empty">No registration trend data returned from backend.</div>
                    )}
                  </section>
                </div>
              </section>

              <AdminAIUserGeographyPanel
                stateRows={charts.activeLenderLocationByState}
                platformStats={stats}
              />
            </>
          )}

          {selectedTopLender && (
            <TopLenderDetailPanel
              lender={selectedTopLender}
              detail={topLenderDetail}
              loading={topLenderDetailLoading}
              error={topLenderDetailError}
              dealsTab={topLenderDealsTab}
              onDealsTabChange={setTopLenderDealsTab}
              onClose={closeTopLenderDetail}
            />
          )}

          {showRegisteredUsersBreakdown && (
            <section className="admin-ai-pro-section admin-ai-registered-users-breakdown">
              <div className="admin-ai-pro-section-head">
                <div className="admin-ai-pro-section-icon admin-ai-pro-section-icon--users"><FaUsers /></div>
                <div>
                  <h2>Registered Users</h2>
                  <p>
                    Total {fmtNum(stats.allUsers)} accounts. Open a box to view that group.
                  </p>
                </div>
                <div className="admin-ai-pro-section-head-actions">
                  <button type="button" className="admin-ai-close-btn" onClick={backToDashboard}>
                    Back to Dashboard
                  </button>
                </div>
              </div>
              <div className="admin-ai-pro-grid admin-ai-pro-grid-overview">
                {registeredUsersBreakdownBoxes.map((box) => (
                  <StatCard
                    key={box.key}
                    label={box.label}
                    value={pickNumber(stats.registeredUsersBreakdown?.[box.countKey])}
                    icon={String(box.key).toLowerCase().includes("borrower")
                      ? <FaHandshake />
                      : <FaUserFriends />}
                    meta={box.meta}
                    accent={box.accent}
                    clickable
                    onClick={() => openRegisteredUsersBreakdownBox(box)}
                  />
                ))}
              </div>
            </section>
          )}

          {showAdminUsers && (
            <AdminUsersPanel
              title={adminUsersTitle}
              userView={adminUsersView}
              users={adminUsers}
              page={adminUsersPage}
              pageSize={adminUserPageSize}
              total={adminUsersTotal}
              loading={adminUsersLoading}
              error={adminUsersError}
              search={adminUserSearch}
              selectedProfile={selectedProfile}
              profileLoading={selectedProfileLoading}
              profileError={selectedProfileError}
              profileDeals={adminUserDeals}
              profileDealsTab={adminUserDealsTab}
              onProfileDealsTabChange={setAdminUserDealsTab}
              onSearchChange={setAdminUserSearch}
              onSearch={searchAdminUsers}
              onResetSearch={() => {
                const empty = emptyAdminUserSearch(adminUsersView);
                setAdminUserSearch(empty);
                closeAdminUserProfile();
                loadAdminUsers(1, adminUsersView, empty);
              }}
              onClearSearchField={(fieldName) => {
                setAdminUserSearch((search) => ({ ...search, [fieldName]: "" }));
                closeAdminUserProfile();
              }}
              onSelectProfile={openAdminUserProfile}
              onCloseProfile={closeAdminUserProfile}
              onPrevious={() => loadAdminUsers(adminUsersPage - 1, adminUsersView, adminUserSearch)}
              onNext={() => loadAdminUsers(adminUsersPage + 1, adminUsersView, adminUserSearch)}
              onParticipationDateChange={handleParticipationDateChange}
              inactiveReactivatedLenders={inactiveReactivatedLenders}
              inactiveReactivatedCount={inactiveReactivatedCount}
              inactiveReactivatedLoading={inactiveReactivatedLoading}
              inactiveReactivatedError={inactiveReactivatedError}
              onBack={registeredUsersSubView ? backFromRegisteredUsersList : backToDashboard}
              onExport={() => {
                const config = userExportByCard[selectedCard?.key];
                const chipConfig = selectedQualityChipKey
                  ? lenderQualityChipViews[selectedQualityChipKey]
                  : null;
                const breakdownBox = registeredUsersBreakdownBoxes.find((item) => item.key === registeredUsersSubView);
                if (breakdownBox) {
                  downloadUsersExcel(breakdownBox.userView, breakdownBox.label, breakdownBox.key, adminUserSearch);
                } else if (config) {
                  downloadOverviewCardExcel(selectedCard.key);
                } else if (chipConfig) {
                  downloadUsersExcel(chipConfig.userView, chipConfig.label, chipConfig.fileSlug, adminUserSearch);
                } else {
                  downloadUsersExcel(adminUsersView, adminUsersTitle, adminUsersView, adminUserSearch);
                }
              }}
              exporting={Boolean(exportingCardKey)}
            />
          )}

          {showYearWiseReferrals && (
            <section className="admin-ai-panel admin-ai-yearwise-panel" id="admin-ai-yearwise-referrals">
              <div className="admin-ai-panel-head">
                <div>
                  <h5>YearWise referrals</h5>
                  <p>Yearly Lent vs Registered referral audiences — click a year status to list users.</p>
                </div>
                <div className="admin-ai-panel-actions">
                  {referralYear && referralYearStatus ? (
                    <span className="admin-ai-count-pill">
                      {`${fmtNum(referralTotal)} ${referralYearStatus} in ${referralYear}`}
                    </span>
                  ) : null}
                  <button
                    className="admin-ai-reset-btn"
                    type="button"
                    onClick={() => {
                      loadReferralYearCards({ force: true });
                      loadTopReferrers({ force: true });
                    }}
                    disabled={referralYearsLoading || topReferrersLoading}
                  >
                    {referralYearsLoading || topReferrersLoading ? "Refreshing..." : "Refresh"}
                  </button>
                  <button className="admin-ai-close-btn" type="button" onClick={backToDashboard}>Close</button>
                </div>
              </div>

              <div className="admin-ai-ref-portfolio-inline-entry">
                <div>
                  <strong>All Active Lenders Referral Portfolio</strong>
                  <span>View every active lender with/without referrals, referee tree map, and Excel export.</span>
                </div>
                <button type="button" className="admin-ai-search-btn" onClick={() => navigate("/adminAIActiveLendersReferralPortfolio")}>
                  Open portfolio
                </button>
              </div>

              <div className="admin-ai-referral-year-head">
                <div className="admin-ai-referral-year-head-top">
                  <div className="admin-ai-referral-year-head-copy">
                    <strong>Yearly referral lenders</strong>
                    <span>
                      {referralYearsLoading
                        ? "Loading yearly totals..."
                        : "Each year card splits Lent and Registered — click a metric to open the user list"}
                    </span>
                  </div>
                </div>
                <div className="admin-ai-referral-year-grid">
                  {referralYearCards.map((item) => {
                    const year = pickNumber(item.year);
                    const registeredCount = pickNumber(item.registeredCount);
                    const registeredLenderCount = pickNumber(item.registeredLenderCount);
                    const registeredBorrowerCount = pickNumber(item.registeredBorrowerCount);
                    const lentCount = pickNumber(item.lentCount);
                    const yearActive = Number(referralYear) === year;
                    const lentActive = yearActive && referralYearStatus === "Lent";
                    const registeredActive = yearActive && referralYearStatus === "Registered";
                    return (
                      <div
                        key={year}
                        className={`admin-ai-referral-year-card${yearActive ? " is-active" : ""}`}
                      >
                        <div className="admin-ai-referral-year-card-top">
                          <small>YEAR</small>
                          <strong className="admin-ai-referral-year-number">{year}</strong>
                        </div>
                        <div className="admin-ai-referral-year-status-row">
                          <button
                            type="button"
                            className={`admin-ai-referral-year-status-box admin-ai-referral-year-status-box--lent${lentActive ? " is-active" : ""}`}
                            onClick={() => openReferralYearStatus(year, "Lent")}
                          >
                            <small>Lent</small>
                            <strong>{fmtNum(lentCount)}</strong>
                            <span>lenders</span>
                          </button>
                          <button
                            type="button"
                            className={`admin-ai-referral-year-status-box admin-ai-referral-year-status-box--registered${registeredActive ? " is-active" : ""}`}
                            onClick={() => openReferralYearStatus(year, "Registered")}
                          >
                            <small>Registered</small>
                            <strong>{fmtNum(registeredCount)}</strong>
                            <span>users</span>
                            <em>{fmtNum(registeredLenderCount)} L · {fmtNum(registeredBorrowerCount)} B</em>
                          </button>
                        </div>
                        <div className="admin-ai-referral-campaign-grid">
                          <div className="admin-ai-referral-campaign-group admin-ai-referral-campaign-group--lent">
                            <span>Lent campaign</span>
                            <div>
                              <button type="button" title={`Email ${year} Lent referral lenders`} onClick={() => openReferralCampaign(`referralLentYear${year}`, `${year} Lent Referral Lenders`, lentCount, "email")}><FaEnvelope /> Email</button>
                              <button type="button" title={`WhatsApp ${year} Lent referral lenders`} onClick={() => openReferralCampaign(`referralLentYear${year}`, `${year} Lent Referral Lenders`, lentCount, "whatsapp")}><FaWhatsapp /> WhatsApp</button>
                            </div>
                          </div>
                          <div className="admin-ai-referral-campaign-group admin-ai-referral-campaign-group--registered">
                            <span>Registered campaign</span>
                            <div>
                              <button type="button" title={`Email ${year} Registered referral users`} onClick={() => openReferralCampaign(`referralRegisteredYear${year}`, `${year} Registered Referral Users`, registeredCount, "email")}><FaEnvelope /> Email</button>
                              <button type="button" title={`WhatsApp ${year} Registered referral users`} onClick={() => openReferralCampaign(`referralRegisteredYear${year}`, `${year} Registered Referral Users`, registeredCount, "whatsapp")}><FaWhatsapp /> WhatsApp</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="admin-ai-top-referrer-section">
                <div className="admin-ai-top-referrer-heading">
                  <div>
                    <strong>Top Referrers</strong>
                    <span>Ranked by Lent (includes disbursed) — Top 10 and Top 50</span>
                  </div>
                  <div className="admin-ai-top-referrer-heading-actions">
                    {topReferrersLoading ? <span className="admin-ai-top-referrer-loading">Loading...</span> : null}
                    <button
                      type="button"
                      className="admin-ai-reset-btn"
                      onClick={() => {
                        loadReferralYearCards({ force: true });
                        loadTopReferrers({ force: true });
                      }}
                      disabled={topReferrersLoading}
                    >
                      {topReferrersLoading ? "Refreshing..." : "Refresh"}
                    </button>
                    <button
                      type="button"
                      className="admin-ai-close-btn"
                      onClick={() => {
                        if (selectedTopReferrerLimit) {
                          setSelectedTopReferrerLimit(null);
                          setSelectedTopReferrer(null);
                          setSelectedTopReferrerDetail(null);
                        } else {
                          backToDashboard();
                        }
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div className="admin-ai-top-referrer-boxes">
                  {[10, 50].map((limit) => {
                    const available = Math.min(limit, topReferrers.length);
                    return (
                      <div key={limit} className={`admin-ai-top-referrer-box${selectedTopReferrerLimit === limit ? " is-active" : ""}`}>
                        <small>LENT RANKING</small>
                        <strong>Top {limit} Referrers</strong>
                        <span>{fmtNum(available)} ranked by Lent count</span>
                        <button type="button" className="admin-ai-top-referrer-view" disabled={topReferrerStatusesLoading} onClick={() => showTopReferrers(limit)}>
                          {topReferrerStatusesLoading && selectedTopReferrerLimit === limit ? "Loading status..." : "View"}
                        </button>
                        <div className="admin-ai-top-referrer-actions">
                          <button type="button" onClick={() => openReferralCampaign(`top${limit}Referrers`, `Top ${limit} Referrers`, available, "email")}><FaEnvelope /> Email</button>
                          <button type="button" onClick={() => openReferralCampaign(`top${limit}Referrers`, `Top ${limit} Referrers`, available, "whatsapp")}><FaWhatsapp /> WhatsApp</button>
                          {limit === 10 ? (
                            <button
                              type="button"
                              className="admin-ai-top-referrer-pdf"
                              disabled={topReferrersTreePdfExporting || topReferrersLoading || available < 1}
                              onClick={() => downloadTopReferrersTreePdf(10)}
                              title="PDF with one Lent referral tree map per Top 10 referrer"
                            >
                              <FaFilePdf /> {topReferrersTreePdfExporting ? "PDF…" : "Tree PDF"}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                  <div className="admin-ai-top-referrer-box admin-ai-top-referrer-box--paid">
                    <small>PAID EARNINGS</small>
                    <strong>Top 10 / 50 Paid Earned</strong>
                    <span>All-time ranking by paid referral earnings</span>
                    <div className="admin-ai-top-referrer-actions">
                      <button type="button" className="admin-ai-top-referrer-view" onClick={() => navigate("/adminAITopPaidEarnedReferrers?limit=10")}>
                        Top 10
                      </button>
                      <button type="button" className="admin-ai-top-referrer-view" onClick={() => navigate("/adminAITopPaidEarnedReferrers?limit=50")}>
                        Top 50
                      </button>
                    </div>
                    <div className="admin-ai-top-referrer-actions admin-ai-top-paid-excel-actions">
                      <button
                        type="button"
                        className="admin-ai-top-referrer-view is-excel"
                        disabled={Boolean(topPaidEarnedExcelExporting)}
                        onClick={() => downloadTopPaidEarnedExcelFile(10)}
                        title="Download Excel for Top 10 paid earned rankers"
                      >
                        <FaFileExcel /> {topPaidEarnedExcelExporting === 10 ? "Excel…" : "Excel 10"}
                      </button>
                      <button
                        type="button"
                        className="admin-ai-top-referrer-view is-excel"
                        disabled={Boolean(topPaidEarnedExcelExporting)}
                        onClick={() => downloadTopPaidEarnedExcelFile(50)}
                        title="Download Excel for Top 50 paid earned rankers"
                      >
                        <FaFileExcel /> {topPaidEarnedExcelExporting === 50 ? "Excel…" : "Excel 50"}
                      </button>
                    </div>
                    <div className="admin-ai-top-referrer-actions">
                      <button
                        type="button"
                        title="Email Top 10 or Top 50 paid earned referrers"
                        onClick={() => openTopPaidEarnedCampaign("email")}
                      >
                        <FaEnvelope /> Email
                      </button>
                      <button
                        type="button"
                        title="WhatsApp Top 10 or Top 50 paid earned referrers"
                        onClick={() => openTopPaidEarnedCampaign("whatsapp")}
                      >
                        <FaWhatsapp /> WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
                {topReferrersTreePdfProgress ? (
                  <div className="admin-ai-top-referrer-pdf-progress" role="status">
                    {topReferrersTreePdfProgress}
                  </div>
                ) : null}
                {selectedTopReferrerLimit ? (
                  <div className="admin-ai-top-referrer-table-wrap">
                    <div className="admin-ai-top-referrer-table-head">
                      <span>Rank</span><span>Referrer</span><span>Total</span><span>Registered</span><span>Lent</span><span>Invited</span><span>Mobile</span><span>Email</span><span>Details</span>
                    </div>
                    <div className="admin-ai-top-referrer-list">
                      {topReferrers.slice(0, selectedTopReferrerLimit).map((row) => (
                        <button
                          type="button"
                          key={row.referrerId}
                          onClick={() => openTopReferrerDetail(row)}
                        >
                          <strong>#{row.rank}</strong>
                          <strong>{valueOrDash(row.referrerCode)} · {valueOrDash(row.name)}</strong>
                          <span className="admin-ai-top-referrer-count-box total-count">{fmtNum(row.referralCount)}</span>
                          <span className="admin-ai-top-referrer-count-box registered-count">{fmtNum(row.registeredCount)}</span>
                          <span className="admin-ai-top-referrer-count-box lent-count">{fmtNum(row.lentCount)}</span>
                          <span className="admin-ai-top-referrer-count-box invited-count">{fmtNum(row.invitedCount)}</span>
                          <span>{valueOrDash(row.mobileNumber)}</span>
                          <span>{valueOrDash(row.email)}</span>
                          <span className="admin-ai-top-referrer-open">View →</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {referralYear && referralYearStatus ? (
                <p className="admin-ai-referral-filter-hint">
                  Showing: Year {referralYear} · {referralYearStatus} lenders
                </p>
              ) : (
                <p className="admin-ai-referral-filter-hint">Select Lent or Registered in a year card to list users.</p>
              )}

              {referralError ? <div className="alert alert-danger">{referralError}</div> : null}
              {referralLoading ? <div className="admin-ai-empty-state">Loading referral registrations...</div> : null}

              {!referralLoading && referralYear && referralYearStatus && (
                <div className="admin-ai-lender-list">
                  {referralRows.length === 0 ? (
                    <div className="admin-ai-empty-state">
                      No {referralYearStatus} referral lenders for year {referralYear}.
                    </div>
                  ) : (
                    referralRows.map((row) => (
                      <div className="admin-ai-lender-row" key={row.id || `${row.refereeId}-${row.referrerId}`}>
                        <div>
                          <small>REFEREE</small>
                          <strong>
                            {pickNumber(row.refereeId) || row.refereeCode ? (
                              <button
                                type="button"
                                className="admin-ai-link-btn"
                                title="Open referee full profile"
                                onClick={() => openReferralUserProfile(row.refereeId, row.refereeCode, "Referee Profile")}
                              >
                                {valueOrDash(row.refereeCode)} {valueOrDash(row.refereeName)}
                              </button>
                            ) : (
                              <>{valueOrDash(row.refereeCode)} {valueOrDash(row.refereeName)}</>
                            )}
                          </strong>
                        </div>
                        <div><small>MOBILE</small><strong>{valueOrDash(row.refereeMobileNumber)}</strong></div>
                        <div><small>EMAIL</small><strong>{valueOrDash(row.refereeEmail)}</strong></div>
                        <div><small>TYPE</small><strong>{valueOrDash(row.primaryType)}</strong></div>
                        <div><small>STATUS</small><strong>{valueOrDash(row.status)}</strong></div>
                        <div className="admin-ai-referral-referrer-cell">
                          <small>REFERRER</small>
                          <strong>
                            {pickNumber(row.referrerId) || row.referrerCode ? (
                              <button
                                type="button"
                                className="admin-ai-link-btn admin-ai-referral-referrer-btn"
                                title="Open referrer full details (same as active lender profile)"
                                onClick={() => openReferralUserProfile(row.referrerId, row.referrerCode, "Referrer Profile")}
                              >
                                {valueOrDash(row.referrerCode)}
                              </button>
                            ) : (
                              valueOrDash(row.referrerCode)
                            )}
                          </strong>
                        </div>
                        <div><small>REFERRED ON</small><strong>{String(row.referredOn || "").slice(0, 19)}</strong></div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {referralYear && referralYearStatus ? (
                <Pager
                  page={referralPage}
                  pageSize={20}
                  total={referralTotal}
                  loading={referralLoading}
                  onPrevious={() => loadReferralRegistrations(referralPage - 1, {
                    yearValue: referralYear,
                    statusValue: referralYearStatus,
                  })}
                  onNext={() => loadReferralRegistrations(referralPage + 1, {
                    yearValue: referralYear,
                    statusValue: referralYearStatus,
                  })}
                />
              ) : null}
            </section>
          )}

          {showReferralRegistrations && (
            <section className="admin-ai-panel" id="admin-ai-referral-registrations">
              <div className="admin-ai-panel-head">
                <div>
                  <h5>Referral Registered Users</h5>
                  <p>
                    Users who registered through referral links (`lender_reference_details`, source = ReferralLink).
                    Default date is today (IST). Pick another date to filter.
                  </p>
                </div>
                <div className="admin-ai-panel-actions">
                  <span className="admin-ai-count-pill">{fmtNum(referralTotal)} referees</span>
                  <button className="admin-ai-close-btn" type="button" onClick={backToDashboard}>Back to Dashboard</button>
                </div>
              </div>

              <form
                className="admin-ai-search-grid"
                onSubmit={(event) => {
                  event.preventDefault();
                  setReferralYear(null);
                  loadReferralRegistrations(1, { dateValue: referralDate, yearValue: null });
                }}
              >
                <label>
                  Referral date
                  <input
                    type="date"
                    value={referralDate}
                    onChange={(event) => setReferralDate(event.target.value)}
                  />
                </label>
                <button className="admin-ai-search-btn" type="submit">Apply date</button>
                <button
                  className="admin-ai-reset-btn"
                  type="button"
                  onClick={() => {
                    const today = defaultParticipationDate();
                    setReferralDate(today);
                    setReferralYear(null);
                    loadReferralRegistrations(1, { dateValue: today, yearValue: null });
                  }}
                >
                  Today
                </button>
              </form>

              <p className="admin-ai-referral-filter-hint">Showing: Date {referralDate}</p>

              {referralError ? <div className="alert alert-danger">{referralError}</div> : null}
              {referralLoading ? <div className="admin-ai-empty-state">Loading referral registrations...</div> : null}

              {!referralLoading && (
                <div className="admin-ai-lender-list">
                  {referralRows.length === 0 ? (
                    <div className="admin-ai-empty-state">
                      No referral registrations for {referralDate}.
                    </div>
                  ) : (
                    referralRows.map((row) => (
                      <div className="admin-ai-lender-row" key={row.id || `${row.refereeId}-${row.referrerId}`}>
                        <div>
                          <small>REFEREE</small>
                          <strong>
                            {pickNumber(row.refereeId) || row.refereeCode ? (
                              <button
                                type="button"
                                className="admin-ai-link-btn"
                                title="Open referee full profile"
                                onClick={() => openReferralUserProfile(row.refereeId, row.refereeCode, "Referee Profile")}
                              >
                                {valueOrDash(row.refereeCode)} {valueOrDash(row.refereeName)}
                              </button>
                            ) : (
                              <>{valueOrDash(row.refereeCode)} {valueOrDash(row.refereeName)}</>
                            )}
                          </strong>
                        </div>
                        <div><small>MOBILE</small><strong>{valueOrDash(row.refereeMobileNumber)}</strong></div>
                        <div><small>EMAIL</small><strong>{valueOrDash(row.refereeEmail)}</strong></div>
                        <div><small>TYPE</small><strong>{valueOrDash(row.primaryType)}</strong></div>
                        <div><small>STATUS</small><strong>{valueOrDash(row.status)}</strong></div>
                        <div className="admin-ai-referral-referrer-cell">
                          <small>REFERRER</small>
                          <strong>
                            {pickNumber(row.referrerId) || row.referrerCode ? (
                              <button
                                type="button"
                                className="admin-ai-link-btn admin-ai-referral-referrer-btn"
                                title="Open referrer full details (same as active lender profile)"
                                onClick={() => openReferralUserProfile(row.referrerId, row.referrerCode, "Referrer Profile")}
                              >
                                {valueOrDash(row.referrerCode)}
                              </button>
                            ) : (
                              valueOrDash(row.referrerCode)
                            )}
                          </strong>
                        </div>
                        <div><small>REFERRED ON</small><strong>{String(row.referredOn || "").slice(0, 19)}</strong></div>
                      </div>
                    ))
                  )}
                </div>
              )}

              <Pager
                page={referralPage}
                pageSize={20}
                total={referralTotal}
                loading={referralLoading}
                onPrevious={() => loadReferralRegistrations(referralPage - 1, {
                  dateValue: referralDate,
                  yearValue: null,
                })}
                onNext={() => loadReferralRegistrations(referralPage + 1, {
                  dateValue: referralDate,
                  yearValue: null,
                })}
              />
            </section>
          )}

          {showActiveLenders && (
            <section className="admin-ai-panel admin-ai-active-lenders-panel" id="admin-ai-active-lender-profiles">
              <div className="admin-ai-panel-head">
                <div>
                  <h5>{activeLenderPanelMeta[selectedCard?.key]?.title || "Active Lenders"}</h5>
                  <p>
                    {activeLenderPanelMeta[selectedCard?.key]?.description
                      || "Search across all active lenders by lender ID or mobile number. Open participation to view deal history."}
                  </p>
                </div>
                <div className="admin-ai-panel-actions">
                  <span className="admin-ai-count-pill">{fmtNum(activeLendersTotal)} lenders</span>
                  <button className="admin-ai-close-btn" type="button" onClick={backToDashboard}>Back to Dashboard</button>
                </div>
              </div>

              <form className="admin-ai-search-grid" onSubmit={searchActiveLenders}>
                <label>
                  Lender ID
                  <input value={activeLenderSearch.lenderId} onChange={(e) => setActiveLenderSearch({ ...activeLenderSearch, lenderId: e.target.value })} />
                </label>
                <label>
                  Mobile Number
                  <input value={activeLenderSearch.mobileNumber} onChange={(e) => setActiveLenderSearch({ ...activeLenderSearch, mobileNumber: e.target.value })} />
                </label>
                <button className="admin-ai-search-btn" type="submit">Search</button>
                <button className="admin-ai-reset-btn" type="button" onClick={() => {
                  const empty = { lenderId: "", mobileNumber: "" };
                  setActiveLenderSearch(empty);
                  loadActiveLenders(1, empty, activeLenderParticipationRange, activeLenderView);
                }}>Reset</button>
              </form>

              {activeLenderSearchStatus && <div className="alert alert-info">{activeLenderSearchStatus}</div>}
              {activeLendersError && <div className="alert alert-danger">{activeLendersError}</div>}
              {activeLendersLoading && <div className="admin-ai-empty-state">Loading active lender profiles...</div>}

              {!activeLendersLoading && (
                <div className="admin-ai-lender-list">
                  {activeLenders.map((lender) => (
                    <div className="admin-ai-lender-row" key={lender.lenderId}>
                      <div><small>LENDER</small><strong>#{lender.lenderId} {valueOrDash(lender.name)}</strong></div>
                      <div><small>MOBILE</small><strong>{valueOrDash(lender.mobileNumber)}</strong></div>
                      <div><small>EMAIL</small><strong>{valueOrDash(lender.email)}</strong></div>
                      <div><small>LOCATION</small><strong>{valueOrDash(lender.city)}, {valueOrDash(lender.state)}</strong></div>
                      <div><small>DEALS</small><strong>{fmtNum(lender.dealsCount)}</strong></div>
                      <div><small>PARTICIPATION</small><button className="admin-ai-search-btn" type="button" onClick={() => openLenderDeals(lender)}>{fmtMoney(lender.totalParticipationAmount)}</button></div>
                      <div className="admin-ai-lender-campaign-actions">
                        <small>CAMPAIGN</small>
                        <div className="admin-ai-pro-kpi-stat-campaign-actions">
                          <button
                            type="button"
                            className="admin-ai-pro-kpi-campaign-btn"
                            title={`Email LR${lender.lenderId} only`}
                            onClick={() => openIndividualActiveLenderCampaign(lender, "email")}
                          >
                            <FaEnvelope /> Email
                          </button>
                          <button
                            type="button"
                            className="admin-ai-pro-kpi-campaign-btn admin-ai-pro-kpi-campaign-btn--whatsapp"
                            title={`WhatsApp LR${lender.lenderId} only`}
                            onClick={() => openIndividualActiveLenderCampaign(lender, "whatsapp")}
                          >
                            <FaWhatsapp /> WhatsApp
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Pager
                page={activeLendersPage}
                pageSize={activeLendersPageSize}
                total={activeLendersTotal}
                loading={activeLendersLoading}
                onPrevious={() => loadActiveLenders(
                  activeLendersPage - 1,
                  activeLenderSearch,
                  activeLenderParticipationRange,
                  activeLenderView
                )}
                onNext={() => loadActiveLenders(
                  activeLendersPage + 1,
                  activeLenderSearch,
                  activeLenderParticipationRange,
                  activeLenderView
                )}
              />

              {lenderDealsLoading && <div className="admin-ai-empty-state">Loading lender deal participation...</div>}
              {lenderDealsError && <div className="alert alert-danger">{lenderDealsError}</div>}
              {lenderDeals && (
                <div className="admin-ai-profile-box">
                  <h5>#{lenderDeals.profile?.lenderId} {lenderDeals.profile?.name}</h5>
                  <div className="admin-ai-deal-tabs">
                    <button type="button" className={lenderDealsTab === "active" ? "active" : ""} onClick={() => setLenderDealsTab("active")}>Active Deals</button>
                    <button type="button" className={lenderDealsTab === "closed" ? "active" : ""} onClick={() => setLenderDealsTab("closed")}>Closed Deals</button>
                  </div>
                  <div className="admin-ai-deal-list">
                    {(lenderDealsTab === "active" ? lenderDeals.activeDeals : lenderDeals.closedDeals || []).map((deal) => (
                      <div className="admin-ai-deal-row" key={`${lenderDeals.profile.lenderId}-${deal.dealId}`}>
                        <div><small>DEAL</small><strong>#{deal.dealId} {valueOrDash(deal.dealName)}</strong></div>
                        <div><small>AMOUNT</small><strong>{fmtMoney(deal.participatedAmount)}</strong></div>
                        <div><small>ROI</small><strong>{valueOrDash(deal.roi)}%</strong></div>
                        <div><small>STATUS</small><strong>{valueOrDash(deal.status)}</strong></div>
                        <div><small>RECEIVED</small><strong>{String(deal.receivedOn || "").slice(0, 10)}</strong></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        <AdminAILenderCampaignModal
          open={Boolean(campaignModalState)}
          onClose={() => setCampaignModalState(null)}
          segment={campaignModalState?.segment}
          segmentLabel={campaignModalState?.segmentLabel}
          recipientCount={campaignModalState?.recipientCount}
          initialChannel={campaignModalState?.channel}
          campaignSetCount={campaignModalState?.campaignSetCount || 3}
          audienceType={campaignModalState?.audienceType || "lenders"}
          targetLender={campaignModalState?.targetLender || null}
          onSent={(result) => {
            if (result?.status === "SCHEDULED" && result?.message) {
              setExportMessage(result.message);
            }
          }}
        />
        <AdminAIAutoEmailDraftModal
          open={Boolean(autoEmailModalState)}
          onClose={() => setAutoEmailModalState(null)}
          segment={autoEmailModalState?.segment}
          segmentLabel={autoEmailModalState?.segmentLabel}
          recipientCount={autoEmailModalState?.recipientCount}
        />
        <Footer />
      </div>
    </div>
  );
};

const TopLendersCompactList = ({ lenders, onSelect, monthly = false }) => (
  <ul className="admin-ai-top-lenders-compact-list">
    {(lenders || []).map((lender) => {
      const amount = pickNumber(lender.totalInvestment, lender.totalParticipationAmount);
      return (
        <li key={`${monthly ? "m" : "a"}-${lender.lenderId}`}>
          <span className="admin-ai-rank-badge admin-ai-rank-badge--sm">{lender.rank || "-"}</span>
          <div className="admin-ai-top-lenders-compact-copy">
            <strong>{lender.userCode || `LR${lender.lenderId}`}</strong>
            <span>{valueOrDash(lender.name)}</span>
            <small>{valueOrDash(lender.city)}{lender.state ? `, ${lender.state}` : ""}</small>
          </div>
          <div className="admin-ai-top-lenders-compact-meta" title={fmtMoney(amount)}>
            <strong className="admin-ai-top-lenders-amount">{fmtOfficialMoney(amount)}</strong>
            <em className="admin-ai-top-lenders-amount-exact">{fmtMoney(amount)}</em>
            <small>{monthly ? "This month" : `${fmtNum(lender.dealsCount)} deals`}</small>
          </div>
          <button className="admin-ai-top-lenders-view-btn" type="button" onClick={() => onSelect(lender)}>
            View
          </button>
        </li>
      );
    })}
  </ul>
);

const TopLenderDetailPanel = ({ lender, detail, loading, error, dealsTab, onDealsTabChange, onClose }) => {
  const profile = detail?.profile || lender;
  const deals = detail?.deals || {};
  const activeDeals = deals.activeDeals || [];
  const closedDeals = deals.closedDeals || [];
  const visibleDeals = dealsTab === "active" ? activeDeals : closedDeals;

  return (
    <div className="admin-ai-top-lender-modal-backdrop" onClick={onClose}>
      <section className="admin-ai-top-lender-modal" onClick={(event) => event.stopPropagation()}>
        <div className="admin-ai-panel-head">
          <div>
            <h5>{profile.userCode || `LR${profile.lenderId}`} {valueOrDash(profile.name)}</h5>
            <p>Full lender profile, investment summary, and deal participation.</p>
          </div>
          <button className="admin-ai-close-btn" type="button" onClick={onClose}>Close</button>
        </div>

        {loading && <div className="admin-ai-empty-state">Loading lender profile and participation...</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && (
          <>
            <div className="admin-ai-top-lender-summary-grid">
              <div><small>EMAIL</small><strong>{valueOrDash(profile.email)}</strong></div>
              <div><small>MOBILE</small><strong>{valueOrDash(profile.mobileNumber)}</strong></div>
              <div><small>LOCATION</small><strong>{valueOrDash(profile.city)}, {valueOrDash(profile.state)} {valueOrDash(profile.pincode)}</strong></div>
              <div><small>WALLET</small><strong>{fmtMoney(profile.walletAmount)}</strong></div>
              <div><small>TOTAL INVESTMENT</small><strong>{fmtMoney(profile.totalInvestment ?? profile.totalParticipationAmount ?? lender.totalInvestment)}</strong></div>
              <div><small>DEALS</small><strong>{fmtNum(profile.dealsCount ?? lender.dealsCount)}</strong></div>
              <div><small>PARTICIPATED</small><strong>{fmtMoney(profile.participatedAmount ?? lender.participatedAmount)}</strong></div>
              <div><small>UPDATION</small><strong>{fmtMoney(profile.updationAmount ?? lender.updationAmount)}</strong></div>
              <div><small>PAN</small><strong>{valueOrDash(profile.panNumber)}</strong></div>
              <div><small>AADHAR</small><strong>{valueOrDash(profile.aadharNumber)}</strong></div>
              <div><small>BANK</small><strong>{valueOrDash(profile.bankName)}</strong></div>
              <div><small>ACCOUNT</small><strong>{valueOrDash(profile.accountNumber)}</strong></div>
            </div>

            <div className="admin-ai-deal-tabs">
              <button type="button" className={dealsTab === "active" ? "active" : ""} onClick={() => onDealsTabChange("active")}>
                Active Deals ({activeDeals.length})
              </button>
              <button type="button" className={dealsTab === "closed" ? "active" : ""} onClick={() => onDealsTabChange("closed")}>
                Closed Deals ({closedDeals.length})
              </button>
            </div>

            <div className="admin-ai-deal-list">
              {visibleDeals.length === 0 && <div className="admin-ai-empty-state">No {dealsTab} deals found for this lender.</div>}
              {visibleDeals.map((deal) => (
                <div className="admin-ai-deal-row" key={`${profile.lenderId}-${deal.dealId}`}>
                  <div><small>DEAL</small><strong>#{deal.dealId} {valueOrDash(deal.dealName)}</strong></div>
                  <div><small>AMOUNT</small><strong>{fmtMoney(deal.participatedAmount)}</strong></div>
                  <div><small>ROI</small><strong>{valueOrDash(deal.roi)}%</strong></div>
                  <div><small>STATUS</small><strong>{valueOrDash(deal.status)}</strong></div>
                  <div><small>RECEIVED</small><strong>{String(deal.receivedOn || "").slice(0, 10)}</strong></div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

const StatCard = ({ label, value, icon, meta, accent = "blue", active, clickable, onClick, onExport, exporting = false, onCampaign, onAutoEmail, dateFilter, dateFilterLoading, dateFilterError, onDateFilterChange, onDateSearch }) => (
  <div
    className={`admin-ai-pro-kpi admin-ai-pro-kpi--${accent} ${clickable || onClick ? "is-clickable" : ""} ${active ? "is-active" : ""}`}
    onClick={onClick}
    onKeyDown={clickable || onClick ? (event) => event.key === "Enter" && onClick?.() : undefined}
    role={clickable || onClick ? "button" : undefined}
    tabIndex={clickable || onClick ? 0 : undefined}
  >
    <div className="admin-ai-pro-kpi-header">
      <span className="admin-ai-pro-kpi-icon">{icon}</span>
      <span className="admin-ai-pro-kpi-label">{label}</span>
      {(clickable || onClick) ? <span className="admin-ai-pro-kpi-link">View</span> : null}
    </div>
    <div className="admin-ai-pro-kpi-body">
      <strong className="admin-ai-pro-kpi-value">{fmtNum(value)}</strong>
      {meta ? <small className="admin-ai-pro-kpi-meta">{meta}</small> : null}
    </div>
    {onDateSearch ? (
      <div
        className="admin-ai-pro-kpi-date-search"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <input
          type="date"
          value={dateFilter || ""}
          max={defaultParticipationDate()}
          aria-label={`${label} date`}
          onChange={(event) => onDateFilterChange?.(event.target.value)}
        />
        <button type="button" disabled={dateFilterLoading || !dateFilter} onClick={onDateSearch}>
          {dateFilterLoading ? "Searching..." : "Search"}
        </button>
        {dateFilterError ? <small className="admin-ai-pro-kpi-date-error">{dateFilterError}</small> : null}
      </div>
    ) : null}
    {onCampaign || onAutoEmail ? (
      <div className="admin-ai-pro-kpi-stat-campaign-actions">
        {onCampaign ? (
          <>
            <button
              type="button"
              className="admin-ai-pro-kpi-campaign-btn"
              title="Email campaign"
              onClick={(event) => {
                event.stopPropagation();
                onCampaign("email");
              }}
            >
              <FaEnvelope /> Email
            </button>
            <button
              type="button"
              className="admin-ai-pro-kpi-campaign-btn admin-ai-pro-kpi-campaign-btn--whatsapp"
              title="WhatsApp campaign"
              onClick={(event) => {
                event.stopPropagation();
                onCampaign("whatsapp");
              }}
            >
              <FaWhatsapp /> WhatsApp
            </button>
          </>
        ) : null}
        {onAutoEmail ? (
          <button
            type="button"
            className="admin-ai-pro-kpi-campaign-btn admin-ai-pro-kpi-campaign-btn--auto"
            title="Auto email with WhatsApp approval (test mode)"
            onClick={(event) => {
              event.stopPropagation();
              onAutoEmail();
            }}
          >
            <FaRobot /> Auto Email
          </button>
        ) : null}
      </div>
    ) : null}
    {onExport ? (
      <button
        type="button"
        className="admin-ai-pro-kpi-card-export-btn"
        disabled={exporting}
        title="Download this segment as Excel with user details"
        onClick={(event) => {
          event.stopPropagation();
          onExport();
        }}
      >
        <FaFileExcel /> {exporting ? "Exporting..." : "Download Excel"}
      </button>
    ) : null}
  </div>
);

const Pager = ({ page, pageSize, total, loading, onPrevious, onNext }) => {
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, total);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="admin-ai-pager">
      <strong>Showing {start} - {end} of {fmtNum(total)} records</strong>
      <div>
        <button className="admin-ai-page-btn ghost" disabled={loading || page <= 1} onClick={onPrevious} type="button">Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button className="admin-ai-page-btn" disabled={loading || page >= totalPages} onClick={onNext} type="button">Next</button>
      </div>
    </div>
  );
};

const AdminUsersPanel = ({
  title,
  userView,
  users,
  page,
  pageSize,
  total,
  loading,
  error,
  search,
  selectedProfile,
  profileLoading,
  profileError,
  profileDeals,
  profileDealsTab,
  onProfileDealsTabChange,
  onSearchChange,
  onSearch,
  onResetSearch,
  onClearSearchField,
  onSelectProfile,
  onCloseProfile,
  onPrevious,
  onNext,
  onBack,
  onExport,
  onParticipationDateChange,
  inactiveReactivatedLenders = [],
  inactiveReactivatedCount = 0,
  inactiveReactivatedLoading = false,
  inactiveReactivatedError = "",
  exporting = false,
}) => {
  const [showInactiveReactivatedList, setShowInactiveReactivatedList] = useState(false);
  const isLenderView = userView === "lenders" || userView === "lendersRaw"
    || userView === "lendersNotParticipated" || userView.startsWith("lendersNotParticipatedRegistered");
  const isGoodLendersView = userView === "lenders" || userView === "lendersNotParticipated";
  const isEliminatedLendersView = isEliminatedUserView(userView);
  const isParticipationDetailView = userView === "todayParticipated" || userView === "last3MonthsActive";
  const isTodayParticipatedView = userView === "todayParticipated";
  const selectedParticipationDate = search.participationDate || defaultParticipationDate();
  const viewingTodayParticipation = isTodayParticipationDate(selectedParticipationDate);
  const participationDayLabel = viewingTodayParticipation ? "Today" : formatDate(selectedParticipationDate);
  const dealValue = (id, name) => ({
    idText: id ? `#${id}` : "-",
    nameText: valueOrDash(name),
  });
  const moneyValue = (amount) => fmtMoney(amount);
  const dateValue = (value) => formatDate(value);

  useEffect(() => {
    setShowInactiveReactivatedList(false);
  }, [selectedParticipationDate]);

  return (
  <section className="admin-ai-panel">
    <div className="admin-ai-panel-head">
      <div>
        <h5>{title}</h5>
        <p>
          {isTodayParticipatedView
            ? viewingTodayParticipation
              ? "Eligible lenders who participated today, with today's amount and deal, plus the deal they participated in before today."
              : `Eligible lenders who participated on ${formatDate(selectedParticipationDate)}, with that day's amount and deal, plus the deal they participated in before that date.`
            : isParticipationDetailView
              ? "Lenders active in the last 3 months with last deal and participation date."
              : isGoodLendersView
                ? userView === "lenders"
                  ? "Clean lenders (valid mobile, email, unique name) with verified email who have not participated in any deal yet."
                  : "Clean lenders who have not participated in any deal yet (includes verified and unverified email)."
                : isEliminatedLendersView
                  ? userView === "lendersExcluded"
                    ? "Lenders eliminated from GOOD and active lists: test users, invalid email, invalid or duplicate mobile, or duplicate first+last name (with reason per row)."
                    : "Eliminated lenders matching this quality-filter category (excludes foreign and participated users)."
                  : userView === "lendersRaw"
                  ? "Registered lenders who pass quality checks. Eliminated accounts are listed separately."
                  : "Search across this full admin user dataset by user ID, mobile number, or email."}
        </p>
      </div>
      <div className="admin-ai-panel-actions">
        <span className="admin-ai-count-pill">{fmtNum(total)} records</span>
        {onExport ? (
          <button
            className="admin-ai-pro-kpi-export-btn"
            type="button"
            disabled={exporting}
            onClick={onExport}
            title="User ID, code, name, mobile, email, type, register date, city, state"
          >
            <FaFileExcel /> {exporting ? "Exporting..." : "Download Excel"}
          </button>
        ) : null}
        <button className="admin-ai-close-btn" type="button" onClick={onBack}>Back to Dashboard</button>
      </div>
    </div>

    <div className="alert alert-success admin-ai-search-note">
      Search runs across all {fmtNum(total)} records in this view, not only this page.
    </div>

    <form className="admin-ai-search-grid" onSubmit={onSearch}>
      <label>
        User ID
        <input
          value={search.userId}
          placeholder="Example: LR41389, BR41389, or 41389"
          onChange={(e) => onSearchChange({ ...search, userId: e.target.value })}
        />
        {search.userId ? (
          <button className="admin-ai-clear-field" type="button" onClick={() => onClearSearchField("userId")}>Clear</button>
        ) : null}
      </label>
      <label>
        Mobile Number
        <input
          value={search.mobileNumber}
          placeholder="Search by mobile number"
          onChange={(e) => onSearchChange({ ...search, mobileNumber: e.target.value })}
        />
        {search.mobileNumber ? (
          <button className="admin-ai-clear-field" type="button" onClick={() => onClearSearchField("mobileNumber")}>Clear</button>
        ) : null}
      </label>
      <label>
        Email
        <input
          value={search.email}
          placeholder="Search by email"
          onChange={(e) => onSearchChange({ ...search, email: e.target.value })}
        />
        {search.email ? (
          <button className="admin-ai-clear-field" type="button" onClick={() => onClearSearchField("email")}>Clear</button>
        ) : null}
      </label>
      {isTodayParticipatedView ? (
        <label>
          Participation Date
          <input
            type="date"
            value={selectedParticipationDate}
            max={defaultParticipationDate()}
            onChange={(e) => onParticipationDateChange?.(e.target.value)}
          />
        </label>
      ) : null}
      <button className="admin-ai-search-btn" type="submit">Search</button>
    </form>
    <button className="admin-ai-reset-btn mb-3" type="button" onClick={onResetSearch}>Reset</button>

    {isTodayParticipatedView ? (
      <div className="admin-ai-inactive-reactivated-box">
        <div className="admin-ai-inactive-reactivated-head">
          <h6>Inactive 1+ Year — Participated on {formatDate(selectedParticipationDate)}</h6>
          <button
            type="button"
            className={`admin-ai-count-pill admin-ai-count-pill-btn${showInactiveReactivatedList ? " is-open" : ""}`}
            onClick={() => setShowInactiveReactivatedList((open) => !open)}
            title="Click to view lender profiles"
          >
            {inactiveReactivatedLoading ? "..." : fmtNum(inactiveReactivatedCount)} lenders
          </button>
        </div>
        <p className="admin-ai-analytics-hint">
          Lenders who participated on {formatDate(selectedParticipationDate)} and whose previous deal was more than 366 days earlier (based on last accept/update date from database).
          {inactiveReactivatedCount > 0 ? " Click the count to open profiles." : ""}
        </p>
        {inactiveReactivatedError ? (
          <div className="alert alert-warning mb-2">{inactiveReactivatedError}</div>
        ) : null}
        {inactiveReactivatedLoading ? (
          <div className="admin-ai-empty-state">Loading inactive reactivated lenders...</div>
        ) : !showInactiveReactivatedList ? (
          <div className="admin-ai-empty-state admin-ai-inactive-reactivated-collapsed">
            {inactiveReactivatedCount > 0
              ? `${fmtNum(inactiveReactivatedCount)} lender(s) reactivated after 1+ year. Click the count above to view profiles.`
              : "No inactive 1+ year lenders participated on this date."}
          </div>
        ) : inactiveReactivatedCount === 0 ? (
          <div className="admin-ai-empty-state">No inactive 1+ year lenders participated on this date.</div>
        ) : (
          <div className="admin-ai-advanced-table-wrap">
            <table className="admin-ai-advanced-table admin-ai-inactive-reactivated-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Mobile</th>
                  <th>Deal (Selected Day)</th>
                  <th>Amount</th>
                  <th>Previous Deal</th>
                  <th>Previous Last Active</th>
                  <th>Gap (Days)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {inactiveReactivatedLenders.map((lender) => (
                  <tr key={`${lender.lenderId}-${lender.dealId}`}>
                    <td>
                      <button
                        type="button"
                        className="admin-ai-link-btn admin-ai-lender-name-btn"
                        onClick={() => onSelectProfile(lenderToProfileUser(lender))}
                      >
                        <strong>{valueOrDash(lender.userCode || (lender.lenderId ? `LR${lender.lenderId}` : "-"))}</strong>
                      </button>
                      <div className="admin-ai-top-lender-name">{valueOrDash(lender.name)}</div>
                    </td>
                    <td>{valueOrDash(lender.mobileNumber)}</td>
                    <td>
                      <strong>{lender.dealId ? `#${lender.dealId}` : "-"}</strong>
                      <div className="admin-ai-top-lender-name">{valueOrDash(lender.dealName)}</div>
                    </td>
                    <td><strong>{fmtMoney(lender.participationAmount)}</strong></td>
                    <td>
                      <strong>{lender.previousDealId ? `#${lender.previousDealId}` : "-"}</strong>
                      <div className="admin-ai-top-lender-name">{valueOrDash(lender.previousDealName)}</div>
                      {lender.previousDealAmount ? (
                        <div className="admin-ai-top-lender-name"><small>{fmtMoney(lender.previousDealAmount)}</small></div>
                      ) : null}
                    </td>
                    <td>{formatDate(lender.previousLastActivityOn)}</td>
                    <td>{participationGapDays(lender.previousLastActivityOn, selectedParticipationDate) || "-"}</td>
                    <td>
                      <button
                        className="admin-ai-link-btn"
                        type="button"
                        onClick={() => onSelectProfile(lenderToProfileUser(lender))}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    ) : null}

    {error && <div className="alert alert-danger">{error}</div>}

    {loading && (
      <div className="admin-ai-empty-state">
        {isParticipationDetailView ? `Loading ${participationDayLabel.toLowerCase()} participated lenders...` : "Loading registered user records..."}
      </div>
    )}

    {!loading && isParticipationDetailView && (
      <div className="admin-ai-advanced-table-wrap">
        <table className="admin-ai-advanced-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Mobile</th>
              <th>WhatsApp</th>
              <th>Email</th>
              {isTodayParticipatedView ? <th>{participationDayLabel} Amount</th> : null}
              {isTodayParticipatedView ? <th>{participationDayLabel} Deal</th> : null}
              <th>{isTodayParticipatedView ? "Previous Deal" : "Last Deal"}</th>
              <th>{isTodayParticipatedView ? "Previous Deal Amount" : "Last Deal Amount"}</th>
              <th>{isTodayParticipatedView ? "Previous Participation" : "Last Participation"}</th>
              <th>Lifetime</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={isTodayParticipatedView ? 10 : 8} className="admin-ai-empty-cell">
                  No lender participation records found.
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user.userId} className={selectedProfile?.userId === user.userId ? "active" : ""}>
                <td>
                  <strong>{valueOrDash(user.userCode)}</strong>
                  <div className="admin-ai-top-lender-name">{valueOrDash(user.name)}</div>
                </td>
                <td>{valueOrDash(user.mobileNumber)}</td>
                <td>{valueOrDash(user.email)}</td>
                {isTodayParticipatedView ? (
                  <td>
                    <strong>{moneyValue(user.todayParticipationAmount)}</strong>
                    <div className="admin-ai-top-lender-name">
                      <small>Accept: {fmtMoney(user.todayAcceptedAmount)} | Update: {fmtMoney(user.todayUpdationAmount)}</small>
                    </div>
                  </td>
                ) : null}
                {isTodayParticipatedView ? (
                  <td>
                    <strong>{dealValue(user.todayDealId, user.todayDealName).idText}</strong>
                    <div className="admin-ai-top-lender-name">{dealValue(user.todayDealId, user.todayDealName).nameText}</div>
                    {user.todayParticipationOn ? (
                      <div className="admin-ai-top-lender-name"><small>{formatDate(user.todayParticipationOn)}</small></div>
                    ) : null}
                  </td>
                ) : null}
                <td>
                  <strong>{dealValue(user.lastDealId, user.lastDealName).idText}</strong>
                  <div className="admin-ai-top-lender-name">{dealValue(user.lastDealId, user.lastDealName).nameText}</div>
                  {isTodayParticipatedView && user.lastParticipationOn ? (
                    <div className="admin-ai-top-lender-name"><small>{formatDate(user.lastParticipationOn)}</small></div>
                  ) : null}
                </td>
                <td><strong>{moneyValue(user.lastDealParticipationAmount)}</strong></td>
                <td>{dateValue(user.lastParticipationOn)}</td>
                <td>
                  <strong>{fmtMoney(user.totalParticipationAmount)}</strong>
                  <div><small>{fmtNum(user.dealsCount)} deals</small></div>
                </td>
                <td>
                  <button className="admin-ai-link-btn" type="button" onClick={() => onSelectProfile(user)}>View Profile</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {!loading && isEliminatedLendersView && (
      <div className="admin-ai-advanced-table-wrap">
        <table className="admin-ai-advanced-table">
          <thead>
            <tr>
              <th>User</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Elimination Reason</th>
              <th>Registered</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={8} className="admin-ai-empty-cell">No eliminated lender records found.</td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user.userId} className={selectedProfile?.userId === user.userId ? "active" : ""}>
                <td>
                  <strong>{valueOrDash(user.userCode)}</strong>
                  <div className="admin-ai-top-lender-name">{valueOrDash(user.name)}</div>
                </td>
                <td>{valueOrDash(user.firstName)}</td>
                <td>{valueOrDash(user.lastName)}</td>
                <td>{valueOrDash(user.mobileNumber)}</td>
                <td>{valueOrDash(user.email)}</td>
                <td><span className="admin-ai-exclusion-reasons">{valueOrDash(user.exclusionReasons)}</span></td>
                <td>{formatDate(user.registeredOn)}</td>
                <td>
                  <button className="admin-ai-link-btn" type="button" onClick={() => onSelectProfile(user)}>View Profile</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {!loading && isLenderView && (
      <div className="admin-ai-advanced-table-wrap">
        <table className="admin-ai-advanced-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Registered</th>
              <th>Bank Details</th>
              <th>Participation</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={8} className="admin-ai-empty-cell">No registered lender records found.</td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user.userId} className={selectedProfile?.userId === user.userId ? "active" : ""}>
                <td>
                  <strong>{valueOrDash(user.userCode)}</strong>
                  <div className="admin-ai-top-lender-name">{valueOrDash(user.name)}</div>
                </td>
                <td>{valueOrDash(user.mobileNumber)}</td>
                <td>{valueOrDash(user.whatsappNumber || user.mobileNumber)}</td>
                <td>{valueOrDash(user.email)}</td>
                <td>{formatDate(user.registeredOn)}</td>
                <td><BankDetailsCell lender={user} /></td>
                <td><strong>{fmtMoney(user.totalParticipationAmount)}</strong><div><small>{fmtNum(user.dealsCount)} deals</small></div></td>
                <td>
                  <button className="admin-ai-link-btn" type="button" onClick={() => onSelectProfile(user)}>View Profile</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {!loading && !isLenderView && !isEliminatedLendersView && !isParticipationDetailView && (
      <div className="admin-ai-advanced-table-wrap">
        <table className="admin-ai-advanced-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Type</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Registered</th>
              <th>Participation</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="admin-ai-empty-cell">No registered user records found.</td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user.userId}>
                <td>
                  <strong>{valueOrDash(user.userCode)}</strong>
                  <div className="admin-ai-top-lender-name">{valueOrDash(user.name)}</div>
                </td>
                <td>{valueOrDash(user.primaryType)}</td>
                <td>{valueOrDash(user.mobileNumber)}</td>
                <td>{valueOrDash(user.email)}</td>
                <td>{formatDate(user.registeredOn)}</td>
                <td>
                  <strong>{fmtMoney(user.totalParticipationAmount)}</strong>
                  <div><small>{fmtNum(user.dealsCount)} deals</small></div>
                </td>
                <td>
                  <button className="admin-ai-link-btn" type="button" onClick={() => onSelectProfile(user)}>
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    <Pager
      page={page}
      pageSize={pageSize}
      total={total}
      loading={loading}
      onPrevious={onPrevious}
      onNext={onNext}
    />
  </section>
  );
};

const BankDetailsCell = ({ lender }) => {
  const bankName = valueOrDash(lender?.bankName);
  const accountNumber = valueOrDash(lender?.accountNumber);
  const ifscCode = valueOrDash(lender?.ifscCode);
  if (bankName === "-" && accountNumber === "-" && ifscCode === "-") {
    return <span className="admin-ai-bank-empty">-</span>;
  }
  return (
    <div className="admin-ai-bank-details-cell">
      <strong>{bankName}</strong>
      <span>{accountNumber}</span>
      <span>{ifscCode}</span>
    </div>
  );
};

const ProfileRow = ({ label, value, copyable, mailLink }) => (
  <div className="admin-ai-profile-row">
    <span className="admin-ai-profile-row-label">{label}</span>
    <span className="admin-ai-profile-row-value">
      {mailLink ? (
        <a href={mailLink} target="_blank" rel="noreferrer">{valueOrDash(value)}</a>
      ) : (
        valueOrDash(value)
      )}
      {copyable && value ? (
        <button className="admin-ai-copy-btn" type="button" onClick={() => navigator.clipboard?.writeText(String(value))}>
          <FaCopy />
        </button>
      ) : null}
    </span>
  </div>
);

const RegisteredLenderProfilePanel = ({ profile, loading, error, deals, dealsTab, onDealsTabChange, onClose, isLender }) => {
  const visibleDeals = dealsTab === "active" ? deals?.activeDeals || [] : deals?.closedDeals || [];

  if (!isLender) {
    return (
      <div className="admin-ai-profile-box">
        <div className="admin-ai-panel-head">
          <h5>{valueOrDash(profile.name)} ({valueOrDash(profile.userCode)})</h5>
          <button className="admin-ai-close-btn" type="button" onClick={onClose}>Close Profile</button>
        </div>
        <div className="admin-ai-user-row">
          <div><small>TYPE</small><strong>{valueOrDash(profile.primaryType)}</strong></div>
          <div><small>MOBILE</small><strong>{valueOrDash(profile.mobileNumber)}</strong></div>
          <div><small>EMAIL</small><strong>{valueOrDash(profile.email)}</strong></div>
          <div><small>CITY</small><strong>{valueOrDash(profile.city)}</strong></div>
          <div><small>STATE</small><strong>{valueOrDash(profile.state)}</strong></div>
          <div><small>PARTICIPATION</small><strong>{fmtMoney(profile.totalParticipationAmount)}</strong></div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-ai-profile-box admin-ai-profile-box-rich">
      <div className="admin-ai-panel-head">
        <div>
          <h5>{formatLenderCode(profile.lenderId, profile.userCode)} {valueOrDash(profile.name)}</h5>
          <p>Full lender profile with bank details, wallet, and deal participation.</p>
        </div>
        <button className="admin-ai-close-btn" type="button" onClick={onClose}>Close Profile</button>
      </div>

      {loading && <div className="admin-ai-empty-state">Loading full lender profile...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && (
        <>
          <div className="admin-ai-profile-stats-row">
            <div className="admin-ai-profile-stat"><small>Wallet</small><strong>{fmtMoney(profile.walletAmount)}</strong></div>
            <div className="admin-ai-profile-stat"><small>Total Investment</small><strong>{fmtMoney(profile.totalParticipationAmount)}</strong></div>
            <div className="admin-ai-profile-stat"><small>Deals</small><strong>{fmtNum(profile.dealsCount)}</strong></div>
          </div>

          <div className="admin-ai-profile-sections">
            <div className="admin-ai-profile-section">
              <h6>Contact Information</h6>
              <div className="admin-ai-profile-table">
                <ProfileRow label="Email" value={profile.email} copyable mailLink={gmailUrl(profile.email)} />
                <ProfileRow label="Mobile Number" value={profile.mobileNumber} copyable />
                <ProfileRow label="WhatsApp" value={profile.whatsappNumber} copyable />
                <ProfileRow label="Registered On" value={formatDate(profile.registeredOn)} />
              </div>
            </div>
            <div className="admin-ai-profile-section">
              <h6>Location</h6>
              <div className="admin-ai-profile-table">
                <ProfileRow label="City" value={profile.city} />
                <ProfileRow label="State" value={profile.state} />
                <ProfileRow label="Pincode" value={profile.pincode} />
                <ProfileRow label="Address" value={formatCompleteAddress(profile)} />
              </div>
            </div>
            <div className="admin-ai-profile-section">
              <h6>Identity</h6>
              <div className="admin-ai-profile-table">
                <ProfileRow label="Lender ID" value={formatLenderCode(profile.lenderId, profile.userCode)} />
                <ProfileRow label="Lender Group" value={formatLenderGroup(profile)} />
                <ProfileRow label="Lender Type" value={profile.lenderType || profile.primaryType} />
                <ProfileRow label="Date of Birth" value={formatDate(profile.dob)} />
                <ProfileRow label="PAN Number" value={profile.panNumber} />
                <ProfileRow label="Aadhar Number" value={profile.aadharNumber} />
              </div>
            </div>
            <div className="admin-ai-profile-section admin-ai-profile-section-wide">
              <h6>Bank Details</h6>
              <div className="admin-ai-profile-table">
                <ProfileRow label="Bank Name" value={profile.bankName} />
                <ProfileRow label="Account Number" value={profile.accountNumber} copyable />
                <ProfileRow label="IFSC Code" value={profile.ifscCode} copyable />
                <ProfileRow label="Branch Name" value={profile.branchName} />
                <ProfileRow label="Account Type" value={profile.accountType} />
                <ProfileRow label="Name As Per Bank" value={profile.userNameAccordingToBank} />
                <ProfileRow label="Bank Address" value={profile.bankAddress} />
                <ProfileRow label="Mode Of Transactions" value={profile.modeOfTransactions} />
                <ProfileRow
                  label="Verification Status"
                  value={
                    profile.bankDetailsVerified === true
                      ? "Verified"
                      : hasBankDetailsData(profile)
                        ? "Not Verified"
                        : "-"
                  }
                />
                {profile.bankDetailsSource ? <ProfileRow label="Data Source" value={profile.bankDetailsSource} /> : null}
              </div>
            </div>
          </div>

          <div className="admin-ai-deal-tabs">
            <button type="button" className={dealsTab === "active" ? "active" : ""} onClick={() => onDealsTabChange("active")}>
              Active Deals ({deals?.activeDeals?.length || 0})
            </button>
            <button type="button" className={dealsTab === "closed" ? "active" : ""} onClick={() => onDealsTabChange("closed")}>
              Closed Deals ({deals?.closedDeals?.length || 0})
            </button>
          </div>
          <div className="admin-ai-deal-list">
            {visibleDeals.length === 0 && <div className="admin-ai-empty-state">No {dealsTab} deals found for this lender.</div>}
            {visibleDeals.map((deal) => (
              <div className="admin-ai-deal-row" key={`${profile.lenderId}-${deal.dealId}`}>
                <div><small>DEAL</small><strong>#{deal.dealId} {valueOrDash(deal.dealName)}</strong></div>
                <div><small>AMOUNT</small><strong>{fmtMoney(deal.participatedAmount)}</strong></div>
                <div><small>ROI</small><strong>{valueOrDash(deal.roi)}%</strong></div>
                <div><small>STATUS</small><strong>{valueOrDash(deal.status)}</strong></div>
                <div><small>RECEIVED</small><strong>{formatDate(deal.receivedOn)}</strong></div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAIDashboard;
