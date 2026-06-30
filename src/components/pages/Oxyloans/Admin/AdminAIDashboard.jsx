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
} from "react-icons/fa";
import OxyloansAdminSidebar from "../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../Header/OxyloansAdminHeader";
import Footer from "../../../Footer/Footer";
import {
  getAdminAIActiveLenderDeals,
  getAdminAIActiveLenderProfile,
  getAdminAIActiveLenderBankDetails,
  getAdminAIActiveLenderWallet,
  getAdminAIActiveLenders,
  getAdminAIUsers,
  getAdminAITopLenders,
  getAdminAIMonthlyTopLenders,
  getAdminAITopLendersMonthlyTrend,
  getAdminAIActiveLenderLegacyDetails,
  getAdminAIActiveLenderStates,
  getRegisteredUsersSummary,
  downloadAdminAIDashboardExcel,
  downloadAdminAIUsersExcel,
  parseAdminAIExportError,
  fetchAllAdminUsersForExport,
  fetchAllCreatedDealsForExport,
  fetchAllActiveLendersForExport,
  downloadAdminAIActiveLendersExcel,
  getAdminAICreatedDeals,
} from "../../../HttpRequest/admin";
import "./AdminAIDashboard.css";
import AdminAIUserGeographyPanel from "./AdminAIUserGeographyPanel";
import AdminAIMonthlyRegistrationChart from "./AdminAIMonthlyRegistrationChart";
import AdminAILenderAnalyticsPanel from "./AdminAILenderAnalyticsPanel";

const activeLendersPageSize = 20;
const adminUserPageSize = 20;
const topLendersLimit = 10;

const currentYearMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const fallbackStats = {
  allUsers: 0,
  allLenders: 0,
  allBorrowers: 0,
  todayRegisteredUsers: 0,
  todayParticipatedUsers: 0,
  allActiveLenders: 0,
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
  allLenders: "lenders",
  allBorrowers: "borrowers",
  lastThreeMonthsActiveLenders: "last3MonthsActive",
  todayRegisteredUsers: "todayRegistered",
  todayParticipatedUsers: "todayParticipated",
};

const userExportByCard = {
  allUsers: { type: "users", userView: "registered", label: "Registered Users", fileSlug: "registered-users" },
  allLenders: { type: "users", userView: "lenders", label: "Registered Lenders", fileSlug: "registered-lenders" },
  allBorrowers: { type: "users", userView: "borrowers", label: "Registered Borrowers", fileSlug: "registered-borrowers" },
  allActiveLenders: { type: "activeLenders", label: "All Active Lenders", fileSlug: "active-lenders" },
  lastThreeMonthsActiveLenders: { type: "users", userView: "last3MonthsActive", label: "Last 3 Months Active", fileSlug: "last-3-months-active" },
  todayRegisteredUsers: { type: "users", userView: "todayRegistered", label: "Today Registered", fileSlug: "today-registered" },
  todayParticipatedUsers: { type: "users", userView: "todayParticipated", label: "Today Participated", fileSlug: "today-participated" },
};

const fmtNum = (n) => (n == null ? "0" : Number(n).toLocaleString("en-IN"));
const fmtMoney = (n) => `Rs ${fmtNum(n)}`;
const pickNumber = (...values) => {
  for (const value of values) {
    if (value != null && value !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return 0;
};
const responseData = (payload) => (payload && payload.data ? payload.data : payload);
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);
const formatDate = (value) => String(value || "").slice(0, 10) || "-";
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
  ["Registered Lenders", stats.allLenders, "LENDER accounts"],
  ["Registered Borrowers", stats.allBorrowers, "BORROWER accounts"],
  ["All Active Lenders", stats.allActiveLenders, "Participated in deals"],
  ["Last 3 Months Active", stats.lastThreeMonthsActiveLenders, "Recent participation"],
  ["Today Registered", stats.todayRegisteredUsers, "New sign-ups today"],
  ["Today Participated", stats.todayParticipatedUsers, "Deal activity today"],
];

const buildDealsSummaryRows = (stats) => [
  ["Today's Deals (Created)", stats.todayDealsCreated, "Deals created today"],
  ["Today's Deals (Closed)", stats.todayDealsClosed, "Deals closed today"],
  ["All Deals Created", stats.allDeals, "Full deals directory"],
  ["Active Deals", stats.activeDeals, "Open / not closed"],
  ["Closed Deals", stats.closedDeals, "Completed deals"],
  ["Test Deals", stats.testDeals, "Test records only"],
];

const ACTIVE_LENDER_EXPORT_HEADERS = [
  "Lender ID", "User Code", "Name", "Mobile Number", "Email", "City", "State",
  "Deals Count", "Total Participation Amount", "Last Participation",
];

const buildActiveLenderExportRows = (lenders) =>
  (lenders || []).map((lender) => [
    pickNumber(lender.lenderId),
    lender.userCode || `LR${pickNumber(lender.lenderId)}`,
    valueOrDash(lender.name),
    valueOrDash(lender.mobileNumber),
    valueOrDash(lender.email),
    valueOrDash(lender.city),
    valueOrDash(lender.state),
    pickNumber(lender.dealsCount),
    Math.round(pickNumber(lender.totalParticipationAmount)),
    formatDate(lender.lastParticipationOn),
  ]);

const buildUserExportRows = (users) =>
  (users || []).map((user) => [
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
  ]);

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

const USER_EXPORT_HEADERS = [
  "User ID", "User Code", "Name", "Mobile Number", "Email", "User Type", "Registered Date",
  "City", "State", "Pincode", "UTM Source", "Deals Count", "Total Participation Amount",
];

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
  if (userView === "lenders") return "Registered Lenders";
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

  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUsersPage, setAdminUsersPage] = useState(1);
  const [adminUsersTotal, setAdminUsersTotal] = useState(0);
  const [adminUsersView, setAdminUsersView] = useState("registered");
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState("");
  const [adminUserSearch, setAdminUserSearch] = useState({ userId: "", mobileNumber: "", email: "" });
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedProfileLoading, setSelectedProfileLoading] = useState(false);
  const [selectedProfileError, setSelectedProfileError] = useState("");
  const [adminUserDeals, setAdminUserDeals] = useState(null);
  const [adminUserDealsTab, setAdminUserDealsTab] = useState("active");
  const [adminUserDealsLoading, setAdminUserDealsLoading] = useState(false);

  const [activeLenders, setActiveLenders] = useState([]);
  const [activeLendersPage, setActiveLendersPage] = useState(1);
  const [activeLendersTotal, setActiveLendersTotal] = useState(0);
  const [activeLendersLoading, setActiveLendersLoading] = useState(false);
  const [activeLendersError, setActiveLendersError] = useState("");
  const [activeLenderSearch, setActiveLenderSearch] = useState({ lenderId: "", mobileNumber: "" });
  const [activeLenderSearchStatus, setActiveLenderSearchStatus] = useState("");

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

  const showActiveLenders = selectedCard?.key === "lastThreeMonthsActiveLenders";
  const showAdminUsers = Boolean(
    selectedCard && userViewByCard[selectedCard.key] && selectedCard.key !== "lastThreeMonthsActiveLenders"
  );

  const loadStats = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const registeredUsersData = responseData(await getRegisteredUsersSummary());
      const users = registeredUsersData.users || {};
      const today = registeredUsersData.today || {};
      const registrationBreakdown = registeredUsersData.registrationBreakdown || {};

      let activeLenderLocationByState = registeredUsersData.activeLenderLocationByState || [];
      if (!activeLenderLocationByState.length) {
        try {
          const geoPayload = responseData(await getAdminAIActiveLenderStates());
          activeLenderLocationByState = geoPayload?.states || [];
        } catch {
          activeLenderLocationByState = [];
        }
      }

      setStats({
        allUsers: pickNumber(
          registeredUsersData.registeredUsersCount,
          registrationBreakdown.registeredUsers,
          users.totalUsers
        ),
        allLenders: pickNumber(
          registeredUsersData.lendersCount,
          registrationBreakdown.lenders,
          registeredUsersData.primaryTypeCounts?.LENDER,
          users.totalLenders
        ),
        allBorrowers: pickNumber(
          registeredUsersData.borrowersCount,
          registrationBreakdown.borrowers,
          registeredUsersData.primaryTypeCounts?.BORROWER,
          users.totalBorrowers
        ),
        todayRegisteredUsers: pickNumber(
          registeredUsersData.todayRegisteredUsersCount,
          today.registeredUsers,
          users.todayRegisteredUsers
        ),
        todayParticipatedUsers: pickNumber(
          registeredUsersData.todayParticipatedUsersCount,
          today.participatedUsers
        ),
        allActiveLenders: pickNumber(registeredUsersData.activeLendersCount, users.activeLenders),
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
      });
      setCharts({
        registrationBreakdown,
        dailyRegistrationTrend: registeredUsersData.dailyRegistrationTrend || [],
        activeParticipationWindows: registeredUsersData.activeParticipationWindows || [],
        userLocationSummary: registeredUsersData.userLocationSummary || [],
        userLocationByState:
          registeredUsersData.userLocationByState || registeredUsersData.userLocationSummary || [],
        activeLenderLocationByState,
        userLocationByDistrict: registeredUsersData.userLocationByDistrict || [],
        monthlyRegistrationByType: registeredUsersData.monthlyRegistrationByType || [],
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
      setLoadError("Failed to load UserRepo data from backend.");
    } finally {
      setLoading(false);
    }
  };

  const loadAdminUsers = async (pageNo = 1, userView = adminUsersView, filters = adminUserSearch) => {
    setAdminUsersLoading(true);
    setAdminUsersError("");
    try {
      const data = responseData(await getAdminAIUsers(pageNo, adminUserPageSize, userView, filters));
      setAdminUsers(data.users || []);
      setAdminUsersPage(pickNumber(data.pageNo, pageNo) || 1);
      setAdminUsersTotal(pickNumber(data.totalCount));
      setAdminUsersView(data.userView || userView);
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

  const loadActiveLenders = async (pageNo = 1, filters = activeLenderSearch) => {
    setActiveLendersLoading(true);
    setActiveLendersError("");
    try {
      const data = responseData(await getAdminAIActiveLenders(pageNo, activeLendersPageSize, filters));
      setActiveLenders(data.activeLenders || []);
      setActiveLendersPage(pickNumber(data.pageNo, pageNo) || 1);
      setActiveLendersTotal(pickNumber(data.totalCount));
    } catch (error) {
      setActiveLenders([]);
      setActiveLendersError("Failed to load active lender profiles from backend.");
    } finally {
      setActiveLendersLoading(false);
    }
  };

  const loadTopLendersData = async (yearMonth = selectedTopMonth) => {
    setTopLendersLoading(true);
    setTopLendersError("");
    try {
      const [allTimeData, monthlyData, trendData] = await Promise.all([
        getAdminAITopLenders(topLendersLimit),
        getAdminAIMonthlyTopLenders(yearMonth, topLendersLimit),
        getAdminAITopLendersMonthlyTrend(12),
      ]);
      setTopLenders(responseData(allTimeData)?.topLenders || []);
      setMonthlyTopLenders(responseData(monthlyData)?.topLenders || []);
      const trendRows = responseData(trendData)?.monthlyTrend || [];
      setMonthlyTrend(trendRows);
      if (trendRows.length && !trendRows.some((row) => row.yearMonth === yearMonth)) {
        setSelectedTopMonth(trendRows[trendRows.length - 1].yearMonth);
      }
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

  const openAdminUserProfile = async (user) => {
    setSelectedProfile(normalizeUserToProfile(user));
    setSelectedProfileLoading(true);
    setSelectedProfileError("");
    setAdminUserDeals(null);
    setAdminUserDealsTab("active");
    const userId = pickNumber(user?.userId);
    const isLender = String(user?.primaryType || "").toUpperCase() === "LENDER";
    if (!userId || !isLender) {
      setSelectedProfileLoading(false);
      return;
    }
    try {
      const [profileData, bankProfile, walletData, dealsData] = await Promise.all([
        getAdminAIActiveLenderProfile(userId).catch(() => null),
        loadBankDetailsForProfile(userId),
        getAdminAIActiveLenderWallet(userId).catch(() => null),
        getAdminAIActiveLenderDeals(userId).catch(() => null),
      ]);
      const apiProfile = responseData(profileData)?.profile || null;
      const wallet = responseData(walletData) || {};
      const deals = responseData(dealsData) || {};
      const enriched = mergeProfiles(user, normalizeUserToProfile(user), apiProfile, bankProfile, {
        walletAmount: pickNumber(wallet.walletAmount),
        referrals: apiProfile?.referrals,
        referralSummary: apiProfile?.referralSummary,
        personalReferences: apiProfile?.personalReferences,
        referredBy: apiProfile?.referredBy,
      });
      setSelectedProfile(enriched);
      setAdminUserDeals(deals);
      if (!deals.activeDeals?.length && deals.closedDeals?.length) {
        setAdminUserDealsTab("closed");
      }
    } catch {
      setSelectedProfileError("Failed to load full lender profile details.");
    } finally {
      setSelectedProfileLoading(false);
    }
  };

  const closeAdminUserProfile = () => {
    setSelectedProfile(null);
    setSelectedProfileError("");
    setAdminUserDeals(null);
    setAdminUserDealsTab("active");
  };

  const openActiveLenders = (card) => {
    setSelectedCard(card);
    resetPanels();
    setActiveLenderSearch({ lenderId: "", mobileNumber: "" });
    loadActiveLenders(1, { lenderId: "", mobileNumber: "" });
  };

  const openAdminUsers = (card) => {
    if (card.key === "lastThreeMonthsActiveLenders") {
      openActiveLenders(card);
      return;
    }
    const nextView = userViewByCard[card.key] || "registered";
    setSelectedCard(card);
    resetPanels();
    setAdminUserSearch({ userId: "", mobileNumber: "", email: "" });
    setAdminUsersView(nextView);
    loadAdminUsers(1, nextView, { userId: "", mobileNumber: "", email: "" });
  };

  const handleCardClick = (card) => {
    if (card.key === "allActiveLenders") {
      navigate("/adminAIDeals");
      return;
    }
    if (card.key === "lastThreeMonthsActiveLenders") {
      openActiveLenders(card);
      return;
    }
    openAdminUsers(card);
  };

  const backToDashboard = () => {
    setSelectedCard(null);
    resetPanels();
  };

  const searchAdminUsers = (event) => {
    event.preventDefault();
    loadAdminUsers(1, adminUsersView, adminUserSearch);
  };

  const searchActiveLenders = (event) => {
    event.preventDefault();
    setLenderDeals(null);
    loadActiveLenders(1, activeLenderSearch);
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

  const downloadUsersExcel = async (userView = "registered", label = "", fileSlug = "") => {
    const exportLabel = label || userViewSheetLabel(userView);
    const fileName = cardExportFileName(fileSlug || userView);
    setExportMessage(`Preparing ${exportLabel} export...`);
    try {
      const response = await downloadAdminAIUsersExcel(userView);
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
      const { rows, totalCount } = await fetchAllAdminUsersForExport(userView, (pageNo, fetched) => {
        setExportMessage(`Fetching ${exportLabel}... page ${pageNo} (${fetched} loaded)`);
      });
      if (!rows.length) {
        throw new Error((await parseAdminAIExportError(error)) || "No users found to export.");
      }
      const usersXml = buildSpreadsheetXml(
        userViewSheetLabel(userView),
        USER_EXPORT_HEADERS,
        buildUserExportRows(rows),
        [0, 11, 12]
      );
      saveSpreadsheetXml(usersXml, fileName.replace(/\.xlsx$/, ".xls"));
      setExportMessage(`Downloaded ${rows.length} of ${totalCount || rows.length} ${exportLabel} records as Excel.`);
    }
  };

  const downloadActiveLendersExcel = async (label = "All Active Lenders", fileSlug = "active-lenders") => {
    const fileName = cardExportFileName(fileSlug);
    setExportMessage("");
    try {
      const response = await downloadAdminAIActiveLendersExcel();
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
      setExportMessage(`Downloaded ${label} Excel with lender details.`);
    } catch (error) {
      const { rows } = await fetchAllActiveLendersForExport();
      if (!rows.length) {
        throw new Error((await parseAdminAIExportError(error)) || "No active lenders found to export.");
      }
      const lendersXml = buildSpreadsheetXml(
        "Active Lenders",
        ACTIVE_LENDER_EXPORT_HEADERS,
        buildActiveLenderExportRows(rows),
        [0, 7, 8]
      );
      saveSpreadsheetXml(lendersXml, fileName.replace(/\.xlsx$/, ".xls"));
      setExportMessage(`Downloaded ${rows.length} ${label} records as Excel.`);
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
        await downloadActiveLendersExcel(config.label, config.fileSlug);
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
      { key: "allUsers", label: "Registered Users", value: stats.allUsers, icon: <FaUsers />, meta: "All platform users", accent: "blue", clickable: true },
      { key: "allLenders", label: "Registered Lenders", value: stats.allLenders, icon: <FaUserFriends />, meta: "LENDER accounts", accent: "indigo", clickable: true },
      { key: "allBorrowers", label: "Registered Borrowers", value: stats.allBorrowers, icon: <FaHandshake />, meta: "BORROWER accounts", accent: "violet", clickable: true },
      { key: "allActiveLenders", label: "All Active Lenders", value: stats.allActiveLenders, icon: <FaUsers />, meta: "Participated in deals", accent: "teal", clickable: true },
      { key: "lastThreeMonthsActiveLenders", label: "Last 3 Months Active", value: stats.lastThreeMonthsActiveLenders, icon: <FaChartLine />, meta: "Recent participation", accent: "cyan", clickable: true },
      { key: "todayRegisteredUsers", label: "Today Registered", value: stats.todayRegisteredUsers, icon: <FaUserFriends />, meta: "New sign-ups today", accent: "amber", clickable: true },
      { key: "todayParticipatedUsers", label: "Today Participated", value: stats.todayParticipatedUsers, icon: <FaUserClock />, meta: "Deal activity today", accent: "orange", clickable: true },
    ],
    [stats]
  );

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

  const registrationDonut = useMemo(() => {
    const breakdown = charts.registrationBreakdown || {};
    const usersCount = pickNumber(breakdown.registeredUsers, stats.allUsers);
    const lendersCount = pickNumber(breakdown.lenders, stats.allLenders);
    const borrowersCount = pickNumber(breakdown.borrowers, stats.allBorrowers);
    return {
      usersCount,
      lendersCount,
      borrowersCount,
      series: [usersCount, lendersCount, borrowersCount],
      options: {
        labels: ["Registered Users", "Lenders", "Borrowers"],
        colors: ["#635bff", "#22c55e", "#0ea5e9"],
        legend: { position: "bottom", fontWeight: 700 },
        dataLabels: { enabled: false },
        plotOptions: {
          pie: {
            donut: {
              size: "68%",
              labels: {
                show: true,
                total: {
                  show: true,
                  label: "Total Users",
                  formatter: () => fmtNum(usersCount),
                },
              },
            },
          },
        },
      },
    };
  }, [charts.registrationBreakdown, stats]);

  const dailyTrendChart = useMemo(() => {
    const rows = charts.dailyRegistrationTrend || [];
    return {
      series: [
        { name: "Registered", data: rows.map((row) => pickNumber(row.registeredUsers)) },
        { name: "Participated", data: rows.map((row) => pickNumber(row.participatedUsers)) },
      ],
      options: {
        chart: { toolbar: { show: false }, fontFamily: "inherit" },
        colors: ["#635bff", "#14b8a6"],
        stroke: { curve: "smooth", width: 3 },
        xaxis: { categories: rows.map((row) => row.date) },
        dataLabels: { enabled: false },
      },
    };
  }, [charts.dailyRegistrationTrend]);

  const topLendersChart = useMemo(() => {
    const rows = topLenders || [];
    return {
      series: [{ name: "Total Investment", data: rows.map((row) => Math.round(pickNumber(row.totalInvestment, row.totalParticipationAmount))) }],
      options: {
        chart: { toolbar: { show: false }, fontFamily: "inherit" },
        colors: ["#635bff"],
        plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: "62%" } },
        dataLabels: { enabled: false },
        xaxis: {
          categories: rows.map((row) => `#${row.lenderId} ${String(row.name || "").trim() || "Lender"}`),
          labels: { formatter: (value) => fmtNum(value) },
        },
        tooltip: { y: { formatter: (value) => fmtMoney(value) } },
      },
    };
  }, [topLenders]);

  const monthlyTopLendersChart = useMemo(() => {
    const rows = monthlyTopLenders || [];
    return {
      series: [{ name: "Month Investment", data: rows.map((row) => Math.round(pickNumber(row.totalInvestment, row.totalParticipationAmount))) }],
      options: {
        chart: { toolbar: { show: false }, fontFamily: "inherit" },
        colors: ["#22c55e"],
        plotOptions: { bar: { horizontal: true, borderRadius: 6, barHeight: "62%" } },
        dataLabels: { enabled: false },
        xaxis: {
          categories: rows.map((row) => `#${row.lenderId} ${String(row.name || "").trim() || "Lender"}`),
          labels: { formatter: (value) => fmtNum(value) },
        },
        tooltip: { y: { formatter: (value) => fmtMoney(value) } },
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
        chart: { toolbar: { show: false }, fontFamily: "inherit", type: "line" },
        colors: ["#0ea5e9", "#f59e0b"],
        stroke: { width: [0, 3], curve: "smooth" },
        plotOptions: { bar: { borderRadius: 6, columnWidth: "48%" } },
        dataLabels: { enabled: false },
        xaxis: { categories: rows.map((row) => row.monthLabel || row.yearMonth) },
        yaxis: [
          { title: { text: "Investment (Rs)" }, labels: { formatter: (value) => fmtNum(value) } },
          { opposite: true, title: { text: "Lenders" } },
        ],
        tooltip: {
          shared: true,
          intersect: false,
          y: [{ formatter: (value) => fmtMoney(value) }, { formatter: (value) => fmtNum(value) }],
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

  const adminUsersTitle = {
    registered: "All Registered Users",
    lenders: "All Registered Lenders",
    borrowers: "All Registered Borrowers",
    todayRegistered: "Today Registered Users",
    todayParticipated: "Today Participated Users",
  }[adminUsersView] || "Registered User Records";

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid admin-ai-page admin-ai-pro">
          <header className="admin-ai-pro-header">
            <div>
              <p className="admin-ai-pro-eyebrow">Admin · Live Platform Data</p>
              <h1 className="admin-ai-pro-title">Admin AI Dashboard</h1>
              <p className="admin-ai-pro-desc">Operational summary of users, lenders, borrowers, and deals.</p>
            </div>
            <span className="admin-ai-pro-breadcrumb">Admin / AI Dashboard</span>
          </header>

          {loadError && (
            <div className="alert alert-danger d-flex justify-content-between align-items-center">
              <span>{loadError}</span>
              <button className="btn btn-sm btn-outline-danger" onClick={loadStats}>Retry</button>
            </div>
          )}

          {exportMessage ? <div className="admin-ai-pro-export-msg">{exportMessage}</div> : null}

          {loading && <div className="admin-ai-empty-state">Loading Admin AI dashboard...</div>}

          {!loading && !showActiveLenders && !showAdminUsers && (
            <>
              <section className="admin-ai-pro-section admin-ai-pro-section--users">
                <div className="admin-ai-pro-section-head">
                  <div className="admin-ai-pro-section-icon admin-ai-pro-section-icon--users"><FaUsers /></div>
                  <div>
                    <h2>Platform Overview</h2>
                    <p>Summary counts plus full registered-user Excel (name, mobile, email, LENDER/BORROWER, register date).</p>
                  </div>
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
                <div className="admin-ai-pro-grid admin-ai-pro-grid-overview">
                  {userCards.map((card) => (
                    <StatCard
                      key={card.key}
                      {...card}
                      active={selectedCard?.key === card.key}
                      onClick={card.clickable ? () => handleCardClick(card) : undefined}
                      onExport={userExportByCard[card.key] ? () => downloadOverviewCardExcel(card.key) : undefined}
                      exporting={exportingCardKey === card.key}
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

              <section className="admin-ai-panel admin-ai-top-lenders-panel admin-ai-top-lenders-panel--compact">
                <div className="admin-ai-panel-head">
                  <div>
                    <h4><FaTrophy /> Top 10 Lenders</h4>
                    <p>Compact rankings by total investment — switch tabs for all-time, monthly, or trend.</p>
                  </div>
                  <span className="admin-ai-live-pill">Investment Rankings</span>
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

              <div className="row admin-ai-section-row">
                <div className="col-lg-4 mb-4">
                  <section className="admin-ai-panel">
                    <div className="admin-ai-panel-head">
                      <div>
                        <h4>user-Portfolio chart</h4>
                        <p>Registered users, lenders, and borrowers from UserRepo.</p>
                      </div>
                      <span className="admin-ai-db-pill">DB</span>
                    </div>
                    <div className="admin-ai-chart-wrap">
                      <ReactApexChart type="donut" height={280} series={registrationDonut.series} options={registrationDonut.options} />
                    </div>
                    <div className="admin-ai-mix-legend admin-ai-portfolio-legend">
                      <div className="admin-ai-mix-legend-item">
                        <span className="dot users" />
                        <div className="admin-ai-mix-legend-copy">
                          <small>Users</small>
                          <strong>{fmtNum(registrationDonut.usersCount)}</strong>
                        </div>
                      </div>
                      <div className="admin-ai-mix-legend-item">
                        <span className="dot lenders" />
                        <div className="admin-ai-mix-legend-copy">
                          <small>Lenders</small>
                          <strong>{fmtNum(registrationDonut.lendersCount)}</strong>
                        </div>
                      </div>
                      <div className="admin-ai-mix-legend-item">
                        <span className="dot borrowers" />
                        <div className="admin-ai-mix-legend-copy">
                          <small>Borrowers</small>
                          <strong>{fmtNum(registrationDonut.borrowersCount)}</strong>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
                <div className="col-lg-8 mb-4">
                  <section className="admin-ai-panel">
                    <div className="admin-ai-panel-head">
                      <div>
                        <h4>Everyday Registrations</h4>
                        <p>Last 14 days trend from public.user with primary type split.</p>
                      </div>
                      <span className="admin-ai-live-pill">{fmtNum(charts.dailyRegistrationTrend.length)} days</span>
                    </div>
                    <div className="admin-ai-chart-wrap">
                      {charts.dailyRegistrationTrend.length ? (
                        <ReactApexChart type="line" height={280} series={dailyTrendChart.series} options={dailyTrendChart.options} />
                      ) : (
                        <div className="admin-ai-empty-state">No registration trend data returned from backend.</div>
                      )}
                    </div>
                  </section>
                </div>
              </div>

              <AdminAIUserGeographyPanel
                stateRows={charts.activeLenderLocationByState}
                platformStats={stats}
              />

              <AdminAIMonthlyRegistrationChart
                monthlyRows={charts.monthlyRegistrationByType}
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
                const empty = { userId: "", mobileNumber: "", email: "" };
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
              onBack={backToDashboard}
              onExport={() => {
                const config = userExportByCard[selectedCard?.key];
                if (config?.type === "activeLenders") {
                  downloadOverviewCardExcel("allActiveLenders");
                } else if (config) {
                  downloadOverviewCardExcel(selectedCard.key);
                } else {
                  downloadUsersExcel(adminUsersView, adminUsersTitle, adminUsersView);
                }
              }}
              exporting={Boolean(exportingCardKey)}
            />
          )}

          {showActiveLenders && (
            <section className="admin-ai-panel admin-ai-active-lenders-panel" id="admin-ai-active-lender-profiles">
              <div className="admin-ai-panel-head">
                <div>
                  <h5>
                    {selectedCard?.key === "lastThreeMonthsActiveLenders"
                      ? "Last 3 Months Active Lenders"
                      : "Active Lender Profiles"}
                  </h5>
                  <p>
                    {selectedCard?.key === "lastThreeMonthsActiveLenders"
                      ? "Active lenders who participated in deals during the last 3 months."
                      : "Search across all active lenders by lender ID or mobile number."}
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
                  loadActiveLenders(1, empty);
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
                    </div>
                  ))}
                </div>
              )}

              <Pager
                page={activeLendersPage}
                pageSize={activeLendersPageSize}
                total={activeLendersTotal}
                loading={activeLendersLoading}
                onPrevious={() => loadActiveLenders(activeLendersPage - 1, activeLenderSearch)}
                onNext={() => loadActiveLenders(activeLendersPage + 1, activeLenderSearch)}
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
        <Footer />
      </div>
    </div>
  );
};

const TopLendersCompactList = ({ lenders, onSelect, monthly = false }) => (
  <ul className="admin-ai-top-lenders-compact-list">
    {(lenders || []).map((lender) => (
      <li key={`${monthly ? "m" : "a"}-${lender.lenderId}`}>
        <span className="admin-ai-rank-badge admin-ai-rank-badge--sm">{lender.rank || "-"}</span>
        <div className="admin-ai-top-lenders-compact-copy">
          <strong>{lender.userCode || `LR${lender.lenderId}`}</strong>
          <span>{valueOrDash(lender.name)}</span>
          <small>{valueOrDash(lender.city)}{lender.state ? `, ${lender.state}` : ""}</small>
        </div>
        <div className="admin-ai-top-lenders-compact-meta">
          <strong>{fmtMoney(lender.totalInvestment ?? lender.totalParticipationAmount)}</strong>
          <small>{monthly ? "This month" : `${fmtNum(lender.dealsCount)} deals`}</small>
        </div>
        <button className="admin-ai-link-btn" type="button" onClick={() => onSelect(lender)}>View</button>
      </li>
    ))}
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

const StatCard = ({ label, value, icon, meta, accent = "blue", active, clickable, onClick, onExport, exporting = false }) => (
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
  exporting = false,
}) => {
  const isLenderView = userView === "lenders" || userView === "last3MonthsActive";

  return (
  <section className="admin-ai-panel">
    <div className="admin-ai-panel-head">
      <div>
        <h5>{title}</h5>
        <p>Search across this full admin user dataset by user ID, mobile number, or email.</p>
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
      <button className="admin-ai-search-btn" type="submit">Search</button>
    </form>
    <button className="admin-ai-reset-btn mb-3" type="button" onClick={onResetSearch}>Reset</button>

    {error && <div className="alert alert-danger">{error}</div>}
    {loading && <div className="admin-ai-empty-state">Loading registered user records...</div>}

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
                <td colSpan={7} className="admin-ai-empty-cell">No registered lender records found.</td>
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

    {!loading && !isLenderView && (
      <div className="admin-ai-user-list">
        {users.length === 0 && <div className="admin-ai-empty-state">No registered user records found.</div>}
        {users.map((user) => (
          <button
            type="button"
            className={`admin-ai-user-row admin-ai-user-row-btn ${selectedProfile?.userId === user.userId ? "active" : ""}`}
            key={user.userId}
            onClick={() => onSelectProfile(user)}
          >
            <div><small>USER</small><strong>{valueOrDash(user.userCode)} {valueOrDash(user.name)}</strong></div>
            <div><small>TYPE</small><strong>{valueOrDash(user.primaryType)}</strong></div>
            <div><small>MOBILE</small><strong>{valueOrDash(user.mobileNumber)}</strong></div>
            <div><small>EMAIL</small><strong>{valueOrDash(user.email)}</strong></div>
            <div><small>REGISTERED</small><strong>{formatDate(user.registeredOn)}</strong></div>
            <div><small>PARTICIPATION</small><strong>{fmtMoney(user.totalParticipationAmount)} ({fmtNum(user.dealsCount)} deals)</strong></div>
          </button>
        ))}
      </div>
    )}

    {selectedProfile && (
      <RegisteredLenderProfilePanel
        profile={selectedProfile}
        loading={profileLoading}
        error={profileError}
        deals={profileDeals}
        dealsTab={profileDealsTab}
        onDealsTabChange={onProfileDealsTabChange}
        onClose={onCloseProfile}
        isLender={String(selectedProfile.primaryType || "").toUpperCase() === "LENDER"}
      />
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
