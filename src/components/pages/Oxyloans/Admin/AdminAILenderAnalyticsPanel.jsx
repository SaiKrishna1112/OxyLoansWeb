import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import { FaChartLine, FaUserClock, FaUsers, FaLayerGroup, FaFileExcel, FaEnvelope, FaWhatsapp, FaSync, FaEye, FaHistory, FaTimes, FaCalendarAlt } from "react-icons/fa";
import { saveAs } from "file-saver";
import {
  getAdminAILenderAnalyticsSummary,
  getOldDashboardActiveLendersCount,
  downloadAdminAILenderAnalyticsExcel,
  fetchAllLenderAnalyticsForExport,
  getAdminAIInactiveReactivatedLenders,
  getAdminAIInactiveReactivatedWeekSummary,
  INACTIVE_REACTIVATION_REPORT_START,
  getAdminAIUsers,
  defaultParticipationDate,
  getAdminAIActiveLenderProfile,
  getAdminAIActiveLenderDeals,
  getAdminAIActiveLenderWallet,
} from "../../../HttpRequest/admin";
import AdminAILenderCampaignModal from "./AdminAILenderCampaignModal";
import { BASE_URL } from "../../../../config";

const fmtNum = (n) => (n == null ? "0" : Number(n).toLocaleString("en-IN"));
const fmtMoney = (n) => `Rs ${fmtNum(n)}`;
const formatDate = (value) => String(value || "").slice(0, 10) || "-";
const formatDisplayDate = (value) => {
  const text = String(value || "").slice(0, 10);
  if (!text || text === "-") {
    return "-";
  }
  const date = new Date(`${text}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return text;
  }
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
const formatWeekday = (value) => {
  const text = String(value || "").slice(0, 10);
  if (!text || text === "-") {
    return "-";
  }
  const date = new Date(`${text}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleDateString("en-IN", { weekday: "long" });
};
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);
const participationGapDays = (previousDate, selectedDate) => {
  const prev = new Date(`${String(previousDate).slice(0, 10)}T00:00:00`);
  const sel = new Date(`${String(selectedDate).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(prev.getTime()) || Number.isNaN(sel.getTime())) return 0;
  return Math.floor((sel - prev) / 86400000);
};
const isInactiveReactivatedUser = (user, participationDate, minGapDays = 366) => {
  const previous = String(user?.lastParticipationOn || user?.previousLastActivityOn || "").slice(0, 10);
  const selected = String(participationDate || "").slice(0, 10);
  if (!previous || previous === "-" || !selected || selected === "-") return false;
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
const deriveInactiveReactivatedUsers = (users = [], participationDate) =>
  (users || [])
    .filter((user) => isInactiveReactivatedUser(user, participationDate))
    .map(mapUserToInactiveReactivated);
const lenderToProfileUser = (lender) => ({
  userId: lender?.lenderId,
  lenderId: lender?.lenderId,
  userCode: lender?.userCode || (lender?.lenderId ? `LR${lender.lenderId}` : ""),
  name: lender?.name,
  email: lender?.email,
  mobileNumber: lender?.mobileNumber,
  primaryType: "LENDER",
});
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
const shiftParticipationDate = (dateStr, deltaDays) => {
  const date = new Date(`${String(dateStr).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return defaultParticipationDate();
  }
  date.setDate(date.getDate() + deltaDays);
  return date.toISOString().slice(0, 10);
};
const buildInactiveWeekSummaryClient = async (endDate, startDate = INACTIVE_REACTIVATION_REPORT_START) => {
  const safeEndDate = String(endDate || defaultParticipationDate()).slice(0, 10);
  const safeStartDate = String(startDate || INACTIVE_REACTIVATION_REPORT_START).slice(0, 10);
  const dailyBreakdown = [];
  const uniqueLenders = new Map();
  let totalDailySum = 0;
  let cursor = safeStartDate;
  while (cursor <= safeEndDate) {
    const dateStr = cursor;
    const data = responseData(await getAdminAIInactiveReactivatedLenders(dateStr, "1 year"));
    const lenders = Array.isArray(data?.lenders) ? data.lenders : [];
    totalDailySum += lenders.length;
    dailyBreakdown.push({ date: dateStr, count: lenders.length, lenders, cumulativeUniqueCount: 0 });
    lenders.forEach((lender) => {
      const lenderId = pickNumber(lender.lenderId);
      if (!lenderId) {
        return;
      }
      if (!uniqueLenders.has(lenderId)) {
        uniqueLenders.set(lenderId, { ...lender, participationDates: [dateStr] });
        return;
      }
      const existing = uniqueLenders.get(lenderId);
      if (!existing.participationDates.includes(dateStr)) {
        existing.participationDates.push(dateStr);
      }
    });
    dailyBreakdown[dailyBreakdown.length - 1].cumulativeUniqueCount = uniqueLenders.size;
    cursor = shiftParticipationDate(cursor, 1);
  }
  const computedDays = dailyBreakdown.length;
  return {
    endDate: safeEndDate,
    startDate: safeStartDate,
    days: computedDays,
    inactiveInterval: "1 year",
    totalUniqueCount: uniqueLenders.size,
    totalDailySum,
    dailyBreakdown,
    lenders: [...uniqueLenders.values()],
  };
};
const responseData = (payload) => (payload && payload.data ? payload.data : payload);
const pickNumber = (...values) => {
  for (const value of values) {
    if (value != null && value !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return 0;
};

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const cellValue = (value) => (value == null || value === "" ? "" : value);

const buildLenderAnalyticsExcelXml = (rows) => {
  const headers = [
    "Lender ID",
    "Lender Name",
    "Email",
    "Mobile Number",
    "Pincode",
    "Address",
    "Participation Amount",
    "Deals Count",
    "Last Active",
  ];
  const headerXml = headers
    .map((title) => `<Cell><Data ss:Type="String">${escapeXml(title)}</Data></Cell>`)
    .join("");
  const rowXml = rows
    .map((lender) => {
      const cells = [
        pickNumber(lender.lenderId),
        cellValue(lender.name),
        cellValue(lender.email),
        cellValue(lender.mobileNumber),
        cellValue(lender.pincode),
        cellValue(lender.address),
        Math.round(pickNumber(lender.totalParticipationAmount)),
        pickNumber(lender.dealsCount),
        String(lender.lastActivityOn || lender.lastParticipationOn || "").slice(0, 10),
      ];
      return `<Row>${cells
        .map((cell, index) =>
          index === 0 || index === 6 || index === 7
            ? `<Cell><Data ss:Type="Number">${escapeXml(cell)}</Data></Cell>`
            : `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`
        )
        .join("")}</Row>`;
    })
    .join("");
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
<Worksheet ss:Name="Lenders">
<Table>
<Row>${headerXml}</Row>
${rowXml}
</Table>
</Worksheet>
</Workbook>`;
};

const segmentExportFileName = (segment, label) => {
  const stamp = new Date().toISOString().slice(0, 10);
  const safe = String(segment || label || "lenders")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `lenders-${safe}-${stamp}.xls`;
};

const ADMIN_AI_ACCENT = "#1e40af";

const SEGMENT_LABELS = {
  allTime: "All Active Lenders",
  last3Months: "Last 3 Months Active Lenders",
  last6Months: "Last 6 Months Active Lenders",
  last1Year: "Last 1 Year Active Lenders",
  inactive3Months: "Inactive (3+ Months)",
  inactive6Months: "Inactive (6+ Months)",
  inactive1Year: "Inactive (1+ Year)",
  oneTime: "1 Deal Participated",
  twoToNine: "2–9 Deals",
  tenToFortyNine: "10–49 Deals",
  fiftyToNinetyNine: "50–99 Deals",
  hundredPlus: "100+ Deals",
};

const MetricCard = ({
  label,
  value,
  purpose,
  subMeta,
  accent = "blue",
  onExport,
  exporting,
  onCampaign,
  onView,
}) => (
  <div className={`admin-ai-pro-kpi admin-ai-pro-kpi-metric admin-ai-pro-kpi--${accent}`}>
    <div className="admin-ai-pro-kpi-header admin-ai-pro-kpi-header--metric">
      <span className="admin-ai-pro-kpi-label">{label}</span>
    </div>
    <div className="admin-ai-pro-kpi-metric-body">
      <strong className="admin-ai-pro-kpi-value">{fmtNum(value)}</strong>
      {purpose ? <small className="admin-ai-pro-kpi-purpose">{purpose}</small> : null}
      {subMeta ? <small className="admin-ai-pro-kpi-meta">{subMeta}</small> : null}
    </div>
    <div className="admin-ai-pro-kpi-metric-actions">
      <button
        type="button"
        className="admin-ai-pro-kpi-campaign-btn"
        title="Email campaign"
        onClick={(event) => {
          event.stopPropagation();
          onCampaign?.("email");
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
          onCampaign?.("whatsapp");
        }}
      >
        <FaWhatsapp /> WhatsApp
      </button>
      <button
        type="button"
        className="admin-ai-pro-kpi-view-btn"
        title="View all lenders"
        onClick={(event) => {
          event.stopPropagation();
          onView?.();
        }}
      >
        <FaEye /> View
      </button>
      <button
        type="button"
        className="admin-ai-pro-kpi-export-btn"
        title="Download Excel"
        disabled={exporting}
        onClick={(event) => {
          event.stopPropagation();
          onExport?.();
        }}
      >
        <FaFileExcel /> {exporting ? "..." : "Excel"}
      </button>
    </div>
  </div>
);

const AdminAILenderAnalyticsPanel = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportingSegment, setExportingSegment] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const [campaignState, setCampaignState] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [reactivationDate, setReactivationDate] = useState(() => defaultParticipationDate());
  const [weekEndDate, setWeekEndDate] = useState(() => defaultParticipationDate());
  const [inactiveReactivated, setInactiveReactivated] = useState([]);
  const [inactiveReactivatedCount, setInactiveReactivatedCount] = useState(0);
  const [inactiveReactivatedLoading, setInactiveReactivatedLoading] = useState(false);
  const [inactiveReactivatedError, setInactiveReactivatedError] = useState("");
  const [inactiveWeekSummary, setInactiveWeekSummary] = useState(null);
  const [inactiveWeekLoading, setInactiveWeekLoading] = useState(false);
  const [inactiveWeekError, setInactiveWeekError] = useState("");
  const [showInactiveReactivatedList, setShowInactiveReactivatedList] = useState(false);
  const [showInactiveReactivationPanel, setShowInactiveReactivationPanel] = useState(true);
  const [selectedReactivatedProfile, setSelectedReactivatedProfile] = useState(null);
  const [reactivatedProfileLoading, setReactivatedProfileLoading] = useState(false);
  const [reactivatedProfileError, setReactivatedProfileError] = useState("");
  const [reactivatedProfileDeals, setReactivatedProfileDeals] = useState(null);

  const loadSummary = async ({ showFullLoading = true } = {}) => {
    if (showFullLoading) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError("");
    try {
      const [summaryResponse, oldDashboardActiveLendersCount] = await Promise.all([
        getAdminAILenderAnalyticsSummary(),
        getOldDashboardActiveLendersCount(),
      ]);
      const data = responseData(summaryResponse) || {};
      if (oldDashboardActiveLendersCount != null && oldDashboardActiveLendersCount > 0) {
        data.rollingWindows = {
          ...(data.rollingWindows || {}),
          allTime: oldDashboardActiveLendersCount,
        };
      }
      setAnalytics(data);
    } catch {
      setAnalytics(null);
      setError("Failed to load lender analytics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshAnalytics = async () => {
    const today = defaultParticipationDate();
    setWeekEndDate(today);
    await loadSummary({ showFullLoading: false });
    await loadInactiveWeekSummary(today);
    await loadInactiveReactivated(reactivationDate);
  };

  const openLendersPage = (segment, label) => {
    const params = new URLSearchParams({
      segment,
      label: label || SEGMENT_LABELS[segment] || segment,
    });
    navigate(`/adminAILenderAnalytics?${params.toString()}`);
  };

  useEffect(() => {
    loadSummary();
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        loadSummary({ showFullLoading: false });
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  const applyInactiveReactivatedResult = (lenders = []) => {
    const rows = Array.isArray(lenders) ? lenders : [];
    setInactiveReactivated(rows);
    setInactiveReactivatedCount(rows.length);
    setInactiveReactivatedError("");
  };

  const openReactivatedProfile = async (lender) => {
    const user = lenderToProfileUser(lender);
    const lenderId = pickNumber(user.lenderId);
    if (!lenderId) return;
    setSelectedReactivatedProfile(user);
    setReactivatedProfileLoading(true);
    setReactivatedProfileError("");
    setReactivatedProfileDeals(null);
    setShowInactiveReactivatedList(true);
    try {
      const [profileData, walletData, dealsData] = await Promise.all([
        getAdminAIActiveLenderProfile(lenderId).catch(() => null),
        getAdminAIActiveLenderWallet(lenderId).catch(() => null),
        getAdminAIActiveLenderDeals(lenderId).catch(() => null),
      ]);
      const apiProfile = responseData(profileData)?.profile || {};
      const wallet = responseData(walletData) || {};
      const deals = responseData(dealsData) || {};
      setSelectedReactivatedProfile({
        ...user,
        ...apiProfile,
        lenderId,
        walletAmount: pickNumber(wallet.walletAmount, apiProfile.walletAmount),
      });
      setReactivatedProfileDeals(deals);
    } catch {
      setReactivatedProfileError("Failed to load lender profile.");
    } finally {
      setReactivatedProfileLoading(false);
    }
  };

  const loadInactiveReactivated = async (participationDate = reactivationDate) => {
    setInactiveReactivatedLoading(true);
    setInactiveReactivatedError("");
    try {
      try {
        const data = responseData(await getAdminAIInactiveReactivatedLenders(participationDate, "1 year"));
        if (!data.backendError && Array.isArray(data.lenders)) {
          applyInactiveReactivatedResult(data.lenders);
          setInactiveReactivatedCount(pickNumber(data.totalCount, data.lenders.length));
          return;
        }
        if (data.backendError) {
          throw new Error(data.backendError);
        }
      } catch (apiError) {
        try {
          const participatedUsers = await fetchParticipatedUsersForDate(participationDate);
          const derived = deriveInactiveReactivatedUsers(participatedUsers, participationDate);
          applyInactiveReactivatedResult(derived);
          return;
        } catch {
          throw apiError;
        }
      }
      applyInactiveReactivatedResult([]);
    } catch (error) {
      applyInactiveReactivatedResult([]);
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

  const loadInactiveWeekSummary = async (endDate = reactivationDate) => {
    setInactiveWeekLoading(true);
    setInactiveWeekError("");
    try {
      try {
        const data = responseData(
          await getAdminAIInactiveReactivatedWeekSummary(endDate, INACTIVE_REACTIVATION_REPORT_START)
        );
        if (!data.backendError && Array.isArray(data.dailyBreakdown)) {
          setInactiveWeekSummary(data);
          return;
        }
        if (data.backendError) {
          throw new Error(data.backendError);
        }
      } catch (apiError) {
        const fallback = await buildInactiveWeekSummaryClient(endDate, INACTIVE_REACTIVATION_REPORT_START);
        setInactiveWeekSummary(fallback);
        return;
      }
      setInactiveWeekSummary(await buildInactiveWeekSummaryClient(endDate, INACTIVE_REACTIVATION_REPORT_START));
    } catch (error) {
      setInactiveWeekSummary(null);
      const message =
        error?.response?.data?.backendError ||
        error?.response?.data?.errorMessage ||
        error?.message ||
        "Failed to load reactivation summary.";
      setInactiveWeekError(
        /network error|econnrefused|failed to fetch/i.test(message)
          ? `Cannot reach backend at ${BASE_URL}. Start oxyloans-rest on port 8181, then refresh.`
          : message
      );
    } finally {
      setInactiveWeekLoading(false);
    }
  };

  const selectReactivationDay = (dateStr) => {
    const safeDate = String(dateStr || "").slice(0, 10);
    if (!safeDate) {
      return;
    }
    setReactivationDate(safeDate);
    setShowInactiveReactivatedList(true);
    setSelectedReactivatedProfile(null);
    setReactivatedProfileDeals(null);
  };

  const closeSelectedDayPanel = () => {
    setShowInactiveReactivatedList(false);
    setSelectedReactivatedProfile(null);
    setReactivatedProfileDeals(null);
    setReactivatedProfileError("");
  };

  const closeInactiveReactivationPanel = () => {
    setShowInactiveReactivationPanel(false);
    closeSelectedDayPanel();
  };

  const openInactiveReactivationPanel = () => {
    setShowInactiveReactivationPanel(true);
  };

  const inactiveWeekFromDate = formatDisplayDate(
    inactiveWeekSummary?.startDate || INACTIVE_REACTIVATION_REPORT_START
  );
  const inactiveWeekToDate = formatDisplayDate(inactiveWeekSummary?.endDate || weekEndDate);

  useEffect(() => {
    const today = defaultParticipationDate();
    setWeekEndDate(today);
    loadInactiveWeekSummary(today);
  }, []);

  useEffect(() => {
    if (!showInactiveReactivatedList) {
      return;
    }
    setSelectedReactivatedProfile(null);
    setReactivatedProfileDeals(null);
    loadInactiveReactivated(reactivationDate);
  }, [reactivationDate, showInactiveReactivatedList]);

  const rolling = analytics?.rollingWindows || {};
  const inactive = analytics?.inactiveWindows || {};
  const buckets = analytics?.participationBuckets || {};
  const monthly = analytics?.monthlyActiveLenders || [];
  const financialYears = analytics?.financialYearActiveLenders || [];

  const monthlyChart = useMemo(
    () => ({
      series: [{ name: "Active Lenders", data: monthly.map((row) => pickNumber(row.count)) }],
      options: {
        chart: { toolbar: { show: false }, fontFamily: "inherit" },
        colors: [ADMIN_AI_ACCENT],
        stroke: { curve: "smooth", width: 3 },
        dataLabels: { enabled: false },
        xaxis: { categories: monthly.map((row) => row.label || row.month) },
        yaxis: { labels: { formatter: (v) => fmtNum(v) } },
      },
    }),
    [monthly]
  );

  const openCampaign = (segment, label, count, channel) => {
    setCampaignState({
      segment,
      segmentLabel: label || SEGMENT_LABELS[segment] || segment,
      recipientCount: pickNumber(count),
      channel: channel || "email",
    });
  };

  const openCampaignHistory = (segment, label) => {
    const selectedSegment = segment || "";
    const selectedLabel = label || SEGMENT_LABELS[segment] || segment || "All segments";
    const query = new URLSearchParams();
    if (selectedSegment) query.set("segment", selectedSegment);
    query.set("segmentLabel", selectedLabel);
    navigate(`/adminAICampaignHistory?${query.toString()}`);
  };

  const openAllCampaignHistory = () => {
    openCampaignHistory("", "All segments");
  };

  const downloadSegmentExcel = async (segment, label) => {
    if (!segment || exportingSegment) return;
    setExportingSegment(segment);
    setExportMessage("");
    const fileName = segmentExportFileName(segment, label);
    try {
      try {
        const response = await downloadAdminAILenderAnalyticsExcel(segment);
        const blob = response?.data;
        if (blob && blob.size > 0) {
          saveAs(blob, fileName.replace(/\.xls$/, ".xlsx"));
          setExportMessage(`Downloaded Excel for ${label || segment}`);
          return;
        }
      } catch {
        // Fall back to paginated client export.
      }

      const { rows, totalCount } = await fetchAllLenderAnalyticsForExport(segment);
      if (!rows.length) {
        setExportMessage("No lenders found to export.");
        return;
      }
      if (totalCount > 0 && rows.length < totalCount) {
        setExportMessage(`Export incomplete: ${rows.length} of ${totalCount} lenders.`);
        return;
      }
      const xml = buildLenderAnalyticsExcelXml(rows);
      saveAs(new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" }), fileName);
      setExportMessage(`Downloaded ${rows.length} lenders for ${label || segment}`);
    } catch {
      setExportMessage("Failed to download Excel. Please try again.");
    } finally {
      setExportingSegment("");
    }
  };

  if (loading) {
    return <div className="admin-ai-empty-state">Loading lender analytics...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex justify-content-between align-items-center">
        <span>{error}</span>
        <button type="button" className="btn btn-sm btn-outline-danger" onClick={loadSummary}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="admin-ai-pro-section admin-ai-pro-section-analytics admin-ai-pro-section--analytics">
      <div className="admin-ai-pro-section-head">
        <div className="admin-ai-pro-section-icon admin-ai-pro-section-icon--analytics"><FaChartLine /></div>
        <div>
          <h2>Lender Participation Analytics</h2>
          <p>How many lenders participated in deals — by time window, inactivity, month, FY, and deal count.</p>
        </div>
        <span className="admin-ai-pro-badge">Excludes test users &amp; admin #6680</span>
        <button
          type="button"
          className="admin-ai-analytics-refresh-btn"
          onClick={refreshAnalytics}
          disabled={loading || refreshing}
          title="Reload counts from database"
        >
          <FaSync className={refreshing ? "admin-ai-spin" : ""} /> {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {exportMessage ? <div className="admin-ai-pro-export-msg">{exportMessage}</div> : null}

      <div className="admin-ai-campaign-history-box is-collapsed">
        <div className="admin-ai-campaign-history-hero">
          <div className="admin-ai-campaign-history-hero-main">
            <span className="admin-ai-campaign-history-hero-icon" aria-hidden="true">
              <FaHistory />
            </span>
            <div>
              <h4>Campaign History</h4>
              <p>Email and WhatsApp campaigns — data from <code>email_tracking</code></p>
            </div>
          </div>
          <div className="admin-ai-campaign-history-hero-actions">
            <button
              type="button"
              className="admin-ai-campaign-history-hero-toggle admin-ai-campaign-history-hero-toggle--view"
              onClick={openAllCampaignHistory}
            >
              <FaEye aria-hidden="true" />
              View campaign history
            </button>
          </div>
        </div>
      </div>

      <div className="admin-ai-analytics-section">
        <h5><FaUsers /> Active Lender Windows</h5>
        <p className="admin-ai-analytics-hint">Lenders with deal participation in each rolling time period.</p>
        <div className="admin-ai-pro-grid admin-ai-pro-grid-analytics">
          <MetricCard label="All Time Active Lenders" value={rolling.allTime} purpose="Lenders who participated in at least one deal, ever" accent="teal" onView={() => openLendersPage("allTime", "All Time Active Lenders")} onExport={() => downloadSegmentExcel("allTime", "All Time Active Lenders")} exporting={exportingSegment === "allTime"} onCampaign={(channel) => openCampaign("allTime", "All Time Active Lenders", rolling.allTime, channel)} />
          <MetricCard label="Last 3 Months Active Lenders" value={rolling.last3Months} purpose="Participated in any deal in the last 90 days" accent="cyan" onView={() => openLendersPage("last3Months", "Last 3 Months Active Lenders")} onExport={() => downloadSegmentExcel("last3Months", "Last 3 Months Active Lenders")} exporting={exportingSegment === "last3Months"} onCampaign={(channel) => openCampaign("last3Months", "Last 3 Months Active Lenders", rolling.last3Months, channel)} />
          <MetricCard label="Last 6 Months Active Lenders" value={rolling.last6Months} purpose="Participated in any deal in the last 6 months" accent="blue" onView={() => openLendersPage("last6Months", "Last 6 Months Active Lenders")} onExport={() => downloadSegmentExcel("last6Months", "Last 6 Months Active Lenders")} exporting={exportingSegment === "last6Months"} onCampaign={(channel) => openCampaign("last6Months", "Last 6 Months Active Lenders", rolling.last6Months, channel)} />
          <MetricCard label="Last 1 Year Active Lenders" value={rolling.last1Year} purpose="Participated in any deal in the last 12 months" accent="indigo" onView={() => openLendersPage("last1Year", "Last 1 Year Active Lenders")} onExport={() => downloadSegmentExcel("last1Year", "Last 1 Year Active Lenders")} exporting={exportingSegment === "last1Year"} onCampaign={(channel) => openCampaign("last1Year", "Last 1 Year Active Lenders", rolling.last1Year, channel)} />
        </div>
      </div>

      <div className="admin-ai-analytics-section">
        <h5><FaUserClock /> Inactive Lenders</h5>
        <p className="admin-ai-analytics-hint">Previously active lenders whose last participation was before each window. Recent participation removes them from these counts. Based on last accept/update date only; test users excluded.</p>
        <div className="admin-ai-pro-grid admin-ai-pro-grid-analytics admin-ai-pro-grid-inactive">
          <MetricCard label="Inactive 3+ Months" value={inactive.inactive3Months} purpose="No participation in last 90 days, but participated before" accent="emerald" onView={() => openLendersPage("inactive3Months", "Inactive 3+ Months")} onExport={() => downloadSegmentExcel("inactive3Months", "Inactive 3+ Months")} exporting={exportingSegment === "inactive3Months"} onCampaign={(channel) => openCampaign("inactive3Months", "Inactive 3+ Months", inactive.inactive3Months, channel)} />
          <MetricCard label="Inactive 6+ Months" value={inactive.inactive6Months} purpose="No participation in last 6 months, but participated before" accent="amber" onView={() => openLendersPage("inactive6Months", "Inactive 6+ Months")} onExport={() => downloadSegmentExcel("inactive6Months", "Inactive 6+ Months")} exporting={exportingSegment === "inactive6Months"} onCampaign={(channel) => openCampaign("inactive6Months", "Inactive 6+ Months", inactive.inactive6Months, channel)} />
          <MetricCard label="Inactive 1+ Year" value={inactive.inactive1Year} purpose="No participation in last 1 year, but participated before" accent="orange" onView={() => openLendersPage("inactive1Year", "Inactive 1+ Year")} onExport={() => downloadSegmentExcel("inactive1Year", "Inactive 1+ Year")} exporting={exportingSegment === "inactive1Year"} onCampaign={(channel) => openCampaign("inactive1Year", "Inactive 1+ Year", inactive.inactive1Year, channel)} />
        </div>

        <div className={`admin-ai-inactive-reactivated-box admin-ai-inactive-reactivated-box--analytics${showInactiveReactivationPanel ? " is-open" : " is-collapsed"}`}>
          <div className="admin-ai-inactive-reactivation-hero">
            <div className="admin-ai-inactive-reactivation-hero-main">
              <span className="admin-ai-inactive-reactivated-icon admin-ai-inactive-reactivated-icon--hero" aria-hidden="true">
                <FaUserClock />
              </span>
              <div className="admin-ai-inactive-reactivation-hero-copy">
                <h4>Inactive 1+ Year — Participated Again</h4>
                <p>Date-wise reactivation after 366+ days of inactivity</p>
                {!showInactiveReactivationPanel ? (
                  <div className="admin-ai-inactive-reactivation-hero-summary">
                    <span className="admin-ai-count-pill admin-ai-inactive-week-total-pill">
                      {inactiveWeekLoading ? "..." : `${fmtNum(inactiveWeekSummary?.totalUniqueCount)} unique lenders`}
                    </span>
                    <span className="admin-ai-inactive-reactivation-hero-range">
                      {inactiveWeekFromDate} – {inactiveWeekToDate}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="admin-ai-inactive-reactivation-hero-actions">
              {showInactiveReactivationPanel ? (
                <button
                  type="button"
                  className="admin-ai-inactive-hero-toggle admin-ai-inactive-hero-toggle--close"
                  onClick={closeInactiveReactivationPanel}
                  title="Close reactivation report"
                >
                  <FaTimes aria-hidden="true" />
                  Close report
                </button>
              ) : (
                <button
                  type="button"
                  className="admin-ai-inactive-hero-toggle admin-ai-inactive-hero-toggle--view"
                  onClick={openInactiveReactivationPanel}
                  title="View daily reactivation report from 30 Jun 2026"
                >
                  <FaEye aria-hidden="true" />
                  View daily report
                </button>
              )}
            </div>
          </div>

          {showInactiveReactivationPanel ? (
          <div className="admin-ai-inactive-reactivation-body">
          <div className="admin-ai-inactive-reactivated-toolbar-row">
            <label className="admin-ai-inactive-reactivated-date">
              <FaCalendarAlt aria-hidden="true" />
              <span>Selected date</span>
              <input
                type="date"
                value={reactivationDate}
                max={defaultParticipationDate()}
                onChange={(e) => selectReactivationDay(e.target.value)}
              />
            </label>
            <span className="admin-ai-count-pill admin-ai-inactive-date-pill">
              {inactiveReactivatedLoading ? "..." : fmtNum(inactiveReactivatedCount)} on {formatDisplayDate(reactivationDate)}
            </span>
          </div>
          <p className="admin-ai-analytics-hint admin-ai-inactive-reactivated-hint">
            Daily report from 30 Jun 2026 through today. Past days stay in the table — each new day adds a row and the cumulative unique count grows.
          </p>

          <div className="admin-ai-inactive-week-summary admin-ai-inactive-week-summary--open">
            <div className="admin-ai-inactive-week-summary-head">
              <div>
                <h6 className="admin-ai-inactive-week-title">Daily reactivation count (from 30 Jun 2026)</h6>
                <div className="admin-ai-inactive-week-range-row">
                  <span><strong>From:</strong> {inactiveWeekFromDate}</span>
                  <span className="admin-ai-inactive-week-range-sep" aria-hidden="true">·</span>
                  <span><strong>To:</strong> {inactiveWeekToDate}</span>
                </div>
              </div>
              <span className="admin-ai-count-pill admin-ai-inactive-week-total-pill">
                {inactiveWeekLoading ? "..." : `${fmtNum(inactiveWeekSummary?.totalUniqueCount)} unique lenders`}
              </span>
            </div>
            {inactiveWeekError ? (
              <div className="alert alert-warning mb-0 mt-2">{inactiveWeekError}</div>
            ) : inactiveWeekLoading ? (
              <div className="admin-ai-empty-state">Loading reactivation summary...</div>
            ) : (
              <div className="admin-ai-advanced-table-wrap admin-ai-inactive-week-table-wrap">
                <table className="admin-ai-advanced-table admin-ai-inactive-week-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Day</th>
                      <th>Lenders reactivated</th>
                      <th>Cumulative unique</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(inactiveWeekSummary?.dailyBreakdown || []).map((day, index) => (
                      <tr
                        key={day.date}
                        className={reactivationDate === day.date && showInactiveReactivatedList ? "active" : ""}
                      >
                        <td>{index + 1}</td>
                        <td><strong>{formatDate(day.date)}</strong></td>
                        <td>{formatWeekday(day.date)}</td>
                        <td><strong>{fmtNum(day.count)}</strong></td>
                        <td><strong>{fmtNum(day.cumulativeUniqueCount)}</strong></td>
                        <td>
                          <button
                            type="button"
                            className={`admin-ai-inactive-day-btn${reactivationDate === day.date && showInactiveReactivatedList ? " is-active" : ""}`}
                            onClick={() => selectReactivationDay(day.date)}
                          >
                            {reactivationDate === day.date && showInactiveReactivatedList ? "Selected" : "View lenders"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3}><strong>Period unique total</strong></td>
                      <td><strong>{fmtNum(inactiveWeekSummary?.totalDailySum)}</strong></td>
                      <td><strong>{fmtNum(inactiveWeekSummary?.totalUniqueCount)}</strong></td>
                      <td><small>{fmtNum(inactiveWeekSummary?.days)} days</small></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {showInactiveReactivatedList ? (
          <div className="admin-ai-inactive-selected-day-panel">
            <div className="admin-ai-inactive-selected-day-head">
              <div className="admin-ai-inactive-selected-day-title">
                <h6>Lenders on {formatDisplayDate(reactivationDate)}</h6>
                <p>{fmtNum(inactiveReactivatedCount)} reactivated lender{inactiveReactivatedCount === 1 ? "" : "s"} on this day</p>
              </div>
              <div className="admin-ai-inactive-selected-day-actions">
                <span className="admin-ai-count-pill admin-ai-inactive-selected-count-pill">
                  {inactiveReactivatedLoading ? "..." : `${fmtNum(inactiveReactivatedCount)} lenders`}
                </span>
                <button
                  type="button"
                  className="admin-ai-icon-close-btn"
                  onClick={closeSelectedDayPanel}
                  title="Close lender list"
                  aria-label="Close lender list"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          {inactiveReactivatedError ? <div className="alert alert-warning mb-2">{inactiveReactivatedError}</div> : null}
          {inactiveReactivatedLoading ? (
            <div className="admin-ai-empty-state">Loading reactivated lenders...</div>
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
                  {inactiveReactivated.map((lender) => (
                    <tr
                      key={`${lender.lenderId}-${lender.dealId}`}
                      className={selectedReactivatedProfile?.lenderId === lender.lenderId ? "active" : ""}
                    >
                      <td>
                        <button
                          type="button"
                          className="admin-ai-link-btn admin-ai-lender-name-btn"
                          onClick={() => openReactivatedProfile(lender)}
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
                      <td>{participationGapDays(lender.previousLastActivityOn, reactivationDate) || "-"}</td>
                      <td>
                        <button className="admin-ai-link-btn" type="button" onClick={() => openReactivatedProfile(lender)}>
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
          {selectedReactivatedProfile ? (
            <div className="admin-ai-profile-box admin-ai-inactive-reactivated-profile">
              <div className="admin-ai-panel-head">
                <div>
                  <h5>
                    {valueOrDash(selectedReactivatedProfile.userCode || `LR${selectedReactivatedProfile.lenderId}`)}{" "}
                    {valueOrDash(selectedReactivatedProfile.name)}
                  </h5>
                  <p>Reactivated after 1+ year on {formatDate(reactivationDate)}.</p>
                </div>
                <button
                  className="admin-ai-icon-close-btn admin-ai-icon-close-btn--profile"
                  type="button"
                  onClick={() => {
                    setSelectedReactivatedProfile(null);
                    setReactivatedProfileDeals(null);
                    setReactivatedProfileError("");
                  }}
                  title="Close profile"
                  aria-label="Close profile"
                >
                  <FaTimes />
                </button>
              </div>
              {reactivatedProfileLoading ? (
                <div className="admin-ai-empty-state">Loading lender profile...</div>
              ) : null}
              {reactivatedProfileError ? <div className="alert alert-danger">{reactivatedProfileError}</div> : null}
              {!reactivatedProfileLoading && !reactivatedProfileError ? (
                <div className="admin-ai-user-row">
                  <div><small>EMAIL</small><strong>{valueOrDash(selectedReactivatedProfile.email)}</strong></div>
                  <div><small>MOBILE</small><strong>{valueOrDash(selectedReactivatedProfile.mobileNumber)}</strong></div>
                  <div><small>LOCATION</small><strong>{valueOrDash(selectedReactivatedProfile.city)}, {valueOrDash(selectedReactivatedProfile.state)}</strong></div>
                  <div><small>WALLET</small><strong>{fmtMoney(selectedReactivatedProfile.walletAmount)}</strong></div>
                  <div><small>DEALS</small><strong>{fmtNum(selectedReactivatedProfile.dealsCount)}</strong></div>
                  <div><small>TOTAL INVESTMENT</small><strong>{fmtMoney(selectedReactivatedProfile.totalInvestment ?? selectedReactivatedProfile.totalParticipationAmount)}</strong></div>
                </div>
              ) : null}
              {reactivatedProfileDeals ? (
                <p className="admin-ai-analytics-hint mb-0">
                  Active deals: {fmtNum(reactivatedProfileDeals.activeDeals?.length || 0)} · Closed deals: {fmtNum(reactivatedProfileDeals.closedDeals?.length || 0)}
                </p>
              ) : null}
            </div>
          ) : null}
          </div>
          ) : null}
        </div>
      </div>

      <div className="admin-ai-analytics-section">
        <h5>Monthly Active Lenders</h5>
        <p className="admin-ai-analytics-hint">Distinct lenders who participated in at least one deal each calendar month. Click a month to open the lender list.</p>
        {monthly.length > 0 ? (
          <>
            <ReactApexChart type="area" height={260} series={monthlyChart.series} options={monthlyChart.options} />
            <div className="admin-ai-month-chips">
              {[...monthly].reverse().slice(0, 12).map((row) => (
                <button
                  key={row.month}
                  type="button"
                  className="admin-ai-month-chip"
                  onClick={() => openLendersPage(row.segment, row.label)}
                >
                  {row.label} <strong>{fmtNum(row.count)}</strong>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="admin-ai-empty-state">No monthly active lender data.</div>
        )}
      </div>

      <div className="admin-ai-analytics-section">
        <h5>Financial Year Active Lenders (Apr–Mar)</h5>
        <p className="admin-ai-analytics-hint">Unique lenders active during each Indian financial year (1 Apr – 31 Mar).</p>
        <div className="admin-ai-pro-grid admin-ai-pro-grid-analytics admin-ai-pro-grid-fy">
          {financialYears.map((row, index) => {
            const fyAccents = ["violet", "indigo", "blue", "cyan", "teal", "emerald", "green"];
            return (
            <MetricCard
              key={row.fyLabel}
              label={`FY ${row.fyLabel}`}
              value={row.count}
              purpose="Lenders with deal participation in this FY"
              subMeta={`${row.startDate} → ${row.endDate}`}
              accent={fyAccents[index % fyAccents.length]}
              onView={() => openLendersPage(row.segment, `FY ${row.fyLabel}`)}
              onExport={() => downloadSegmentExcel(row.segment, `FY ${row.fyLabel}`)}
              exporting={exportingSegment === row.segment}
              onCampaign={(channel) => openCampaign(row.segment, `FY ${row.fyLabel}`, row.count, channel)}
            />
            );
          })}
        </div>
      </div>

      <div className="admin-ai-analytics-section">
        <h5><FaLayerGroup /> Participation Frequency (by distinct deals)</h5>
        <p className="admin-ai-analytics-hint">How many separate deals each lender has participated in (lifetime count).</p>
        <div className="admin-ai-pro-grid admin-ai-pro-grid-analytics">
          <MetricCard label="1 Deal Only" value={buckets.oneTime} purpose="Participated in exactly 1 distinct deal" accent="slate" onView={() => openLendersPage("oneTime", "1 Deal Participated")} onExport={() => downloadSegmentExcel("oneTime", "1 Deal Participated")} exporting={exportingSegment === "oneTime"} onCampaign={(channel) => openCampaign("oneTime", "1 Deal Participated", buckets.oneTime, channel)} />
          <MetricCard label="2–9 Deals" value={buckets.twoToNine} purpose="Participated in 2 to 9 distinct deals" accent="teal" onView={() => openLendersPage("twoToNine", "2–9 Deals")} onExport={() => downloadSegmentExcel("twoToNine", "2–9 Deals")} exporting={exportingSegment === "twoToNine"} onCampaign={(channel) => openCampaign("twoToNine", "2–9 Deals", buckets.twoToNine, channel)} />
          <MetricCard label="10–49 Deals" value={buckets.tenToFortyNine} purpose="Participated in 10 to 49 distinct deals" accent="blue" onView={() => openLendersPage("tenToFortyNine", "10–49 Deals")} onExport={() => downloadSegmentExcel("tenToFortyNine", "10–49 Deals")} exporting={exportingSegment === "tenToFortyNine"} onCampaign={(channel) => openCampaign("tenToFortyNine", "10–49 Deals", buckets.tenToFortyNine, channel)} />
          <MetricCard label="50–99 Deals" value={buckets.fiftyToNinetyNine} purpose="Participated in 50 to 99 distinct deals" accent="indigo" onView={() => openLendersPage("fiftyToNinetyNine", "50–99 Deals")} onExport={() => downloadSegmentExcel("fiftyToNinetyNine", "50–99 Deals")} exporting={exportingSegment === "fiftyToNinetyNine"} onCampaign={(channel) => openCampaign("fiftyToNinetyNine", "50–99 Deals", buckets.fiftyToNinetyNine, channel)} />
          <MetricCard label="100+ Deals" value={buckets.hundredPlus} purpose="Participated in 100 or more distinct deals" accent="violet" onView={() => openLendersPage("hundredPlus", "100+ Deals")} onExport={() => downloadSegmentExcel("hundredPlus", "100+ Deals")} exporting={exportingSegment === "hundredPlus"} onCampaign={(channel) => openCampaign("hundredPlus", "100+ Deals", buckets.hundredPlus, channel)} />
        </div>
      </div>

      <AdminAILenderCampaignModal
        open={Boolean(campaignState)}
        onClose={() => setCampaignState(null)}
        segment={campaignState?.segment}
        segmentLabel={campaignState?.segmentLabel}
        recipientCount={campaignState?.recipientCount}
        initialChannel={campaignState?.channel}
        onSent={(result) => {
          if (result?.status === "SCHEDULED" && result?.message) {
            setExportMessage(result.message);
          }
          refreshAnalytics();
        }}
      />
    </section>
  );
};

export default AdminAILenderAnalyticsPanel;
