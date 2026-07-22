import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRobot,
  FaUsers,
  FaArrowLeft,
  FaIdCard,
  FaHandshake,
  FaCopy,
  FaEnvelope,
  FaPhone,
  FaTimes,
  FaUserCircle,
  FaWallet,
  FaChevronDown,
  FaChevronUp,
  FaPercent,
  FaChartLine,
  FaMoneyBillWave,
  FaSignOutAlt,
  FaFileExcel,
} from "react-icons/fa";
import { saveAs } from "file-saver";
import OxyloansAdminSidebar from "../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../Header/OxyloansAdminHeader";
import Footer from "../../../Footer/Footer";
import {
  getAdminAIActiveLenderDeals,
  getAdminAIActiveLenderProfile,
  getAdminAIActiveLenderFullDetails,
  getAdminAIActiveLenderUserRepoProfile,
  getAdminAIActiveLenderBankDetails,
  getAdminAIActiveLenderReturnsSummary,
  getAdminAIActiveLenderLegacyDetails,
  getAdminAIActiveLenders,
  fetchAllActiveLendersForExport,
  getAdminAIActiveLenderWallet,
  getAdminAIActiveLenderWalletTransactions,
  getAdminAIActiveLenderDealInterestDetails,
  getAdminAIMonthlyInterestEarnings,
  getAdminAIUsers,
  getAdminAICreatedDeals,
  getAdminAILenderReferenceDetails,
  getAdminAILenderReferralEarnings,
  getAdminAIActiveLenderReferrals,
  getAdminAIActiveLenderReferralDeals,
  getRegisteredUsersSummary,
  getOldDashboardActiveLendersCount,
} from "../../../HttpRequest/admin";
import "./AdminAIDashboard.css";

const pageSize = 20;

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const fmtNum = (n) => (n == null ? "0" : Number(n).toLocaleString("en-IN"));
const fmtMoney = (n) => `Rs ${fmtNum(Math.round(Number(n) || 0))}`;
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
    const num = Number(value);
    if (value != null && value !== "" && !Number.isNaN(num) && num > 0) {
      return num;
    }
  }
  return 0;
};
const normalizeDealStatusText = (value) => String(value || "").toUpperCase().replace(/\s+/g, "");
const isOpenDealStatus = (status, deal) => {
  const value = normalizeDealStatusText(status || deal?.dealStatus || deal?.status || deal?.displayStatus);
  if (value.includes("NOTYET")) return true;
  if (deal?.activeDeal === true) return true;
  return false;
};
const responseData = (payload) => (payload && payload.data ? payload.data : payload);
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);

const buildActiveLendersExcelXml = (rows) => {
  const headers = ["Lender ID", "Name", "Mobile Number", "Email", "Total Participation Amount"];
  const headerXml = headers
    .map((title) => `<Cell><Data ss:Type="String">${escapeXml(title)}</Data></Cell>`)
    .join("");
  const rowXml = rows
    .map((lender) => {
      const cells = [
        pickNumber(lender.lenderId),
        valueOrDash(lender.name) === "-" ? "" : lender.name,
        valueOrDash(lender.mobileNumber) === "-" ? "" : lender.mobileNumber,
        valueOrDash(lender.email) === "-" ? "" : lender.email,
        Math.round(pickNumber(lender.totalParticipationAmount)),
      ];
      return `<Row>${cells
        .map((cell, index) =>
          index === 0 || index === 4
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
<Worksheet ss:Name="Active Lenders">
<Table>
<Row>${headerXml}</Row>
${rowXml}
</Table>
</Worksheet>
</Workbook>`;
};

const formatDate = (value) => String(value || "").slice(0, 10) || "-";
const formatDisplayDate = (value) => {
  const text = String(value || "").trim();
  if (!text || text === "-") return "-";
  if (text.includes("/")) {
    const parts = text.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
    }
    return text;
  }
  const iso = text.slice(0, 10);
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso || "-";
  return `${day}/${month}/${year}`;
};
const daysBetweenForInterest = (start, end, payoutType) => {
  if (!start || !end || end < start) return 0;
  const msPerDay = 86400000;
  let days = Math.floor((end.getTime() - start.getTime()) / msPerDay);
  const payout = String(payoutType || "MONTHLY").toUpperCase();
  if (days > 0 && !payout.includes("YEAR") && !payout.includes("QUART")) {
    const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    if (daysInMonth > 30) days -= 2;
    else if (daysInMonth === 29) days += 1;
    else if (daysInMonth === 28) days += 1;
    else days -= 1;
  }
  return Math.max(days, 0);
};
const calculateSingleDayInterest = (amount, roi, payoutType, newCalc) => {
  const periodInterest = calculatePeriodInterest(amount, roi, payoutType, newCalc);
  const payout = String(payoutType || "MONTHLY").toUpperCase();
  // DealLevelInformation uses annual period interest / 30 for yearly day-based accrual.
  if (payout.includes("YEAR")) return periodInterest / 30;
  if (payout.includes("QUART")) return periodInterest / 90;
  if (payout.includes("HALF")) return periodInterest / 180;
  return periodInterest / 30;
};
const calculateDayBasedSegmentInterest = (amount, roi, days, payoutType, newCalc) => {
  if (!days || days <= 0) return 0;
  return Math.round(calculateSingleDayInterest(amount, roi, payoutType, newCalc) * days);
};
const parseDurationMonths = (duration) => {
  const text = String(duration || "").trim().toUpperCase();
  if (!text) return 0;
  const match = text.match(/(\d+)/);
  if (!match) return 0;
  const value = Number(match[1]);
  if (text.includes("YEAR")) return value * 12;
  return value;
};
const formatPayoutTypeLabel = (payoutType, lenderReturnsType) => {
  const value = normalizePayoutType(payoutType || lenderReturnsType);
  if (value.includes("YEAR")) return "Yearly";
  if (value.includes("QUART")) return "Quarterly";
  if (value.includes("HALF")) return "Half-Yearly";
  if (value.includes("END")) return "End Of Deal";
  return "Monthly";
};
const normalizePayoutType = (lenderReturnsType) => {
  const value = String(lenderReturnsType || "MONTHLY").trim().toUpperCase();
  if (!value) return "MONTHLY";
  if (value.includes("YEAR") || value.includes("YLY")) return "YEARLY";
  if (value.includes("QUART")) return "QUARTERLY";
  if (value.includes("HALF")) return "HALF-YEARLY";
  if (value.includes("END")) return "END OF DEAL";
  return value;
};
const resolveDealPayoutMeta = (details, deal) => {
  const lenderReturnsType = details?.lenderReturnsType || deal?.lenderReturnsType || "MONTHLY";
  const payoutType = normalizePayoutType(lenderReturnsType);
  return {
    lenderReturnsType,
    payoutType,
    payoutTypeLabel: formatPayoutTypeLabel(payoutType, lenderReturnsType),
  };
};
const calculateYearlyFirstPeriodDays = (participatedDate, fundsAcceptanceStartDate, loanActiveDate) => {
  const participated = parseLocalDate(participatedDate);
  const fundsStart = parseLocalDate(fundsAcceptanceStartDate);
  const loanActive = parseLocalDate(loanActiveDate);
  if (!participated || !fundsStart || !loanActive) return 0;

  const participatedIso = formatDate(participated);
  const fundsStartIso = formatDate(fundsStart);
  const noOfDays = Math.max(0, Math.floor((participated.getTime() - fundsStart.getTime()) / 86400000));
  const partMonthStart = new Date(participated.getFullYear(), participated.getMonth(), 1);
  const loanMonthStart = new Date(loanActive.getFullYear(), loanActive.getMonth(), 1);
  let years = loanMonthStart.getFullYear() - partMonthStart.getFullYear();
  let months = loanMonthStart.getMonth() - partMonthStart.getMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  const firstMonthCount = noOfDays < 30 ? 30 - noOfDays : 0;

  if (years === 1 && months === 0) {
    if (firstMonthCount >= 1) {
      return participatedIso === fundsStartIso ? 359 : 360 - noOfDays;
    }
    return 359;
  }
  if (years === 0 && months >= 1) {
    if (firstMonthCount >= 1) {
      return (firstMonthCount - 1) + ((months - 1) * 30);
    }
    return (months * 30) - 2;
  }
  if (years === 1 && months >= 1) {
    if (firstMonthCount >= 1) {
      return (firstMonthCount - 1) + 330;
    }
    return 359;
  }
  return 0;
};
const computeFirstUnpaidPaymentDate = (loanActiveDate, payoutType) => {
  const payout = normalizePayoutType(payoutType);
  if (payout.includes("YEAR")) {
    return parseLocalDate(loanActiveDate);
  }
  return computeNextPaymentDate(loanActiveDate, payoutType);
};
const resolveSegmentDifferenceInDays = (segment, deal, interestData, payoutType) => {
  const existing = pickNumber(segment.differenceInDays);
  if (existing > 0) return existing;

  const payout = normalizePayoutType(payoutType);
  if (payout.includes("YEAR")) {
    const participated = segment.activityOn || segment.updatedDate || segment.upatedDate
      || deal.receivedOn || interestData?.receivedOn;
    const fundsStart = deal.fundsAcceptanceStartDate || interestData?.fundsAcceptanceStartDate;
    const loanActive = interestData?.loanActiveDate || deal.loanActiveDate;
    return calculateYearlyFirstPeriodDays(participated, fundsStart, loanActive);
  }

  const segmentStart = parseLocalDate(segment.activityOn || segment.updatedDate || segment.upatedDate);
  const paymentEnd = computeNextPaymentDate(interestData?.loanActiveDate || deal.loanActiveDate, payoutType);
  if (!segmentStart || !paymentEnd) return 0;
  return daysBetweenForInterest(segmentStart, paymentEnd, payoutType);
};
const enrichSegmentInterest = (segment, deal, interestData) => {
  const roi = pickPositiveNumber(segment.roi, interestData?.roi, deal.roi);
  const payoutMeta = resolveDealPayoutMeta(interestData, deal);
  const payoutType = payoutMeta.payoutType;
  const amount = pickNumber(segment.amount);
  const fundsStart = String(deal.fundsAcceptanceStartDate || deal.receivedOn || interestData?.fundsAcceptanceStartDate || "").slice(0, 10);
  const newCalc = fundsStart >= "2021-10-04";
  let differenceInDays = resolveSegmentDifferenceInDays(segment, deal, interestData, payoutType);
  let interestAmount = pickNumber(segment.estimatedInterestAmount, segment.interestAmount);
  if (interestAmount <= 0 && roi > 0 && amount > 0) {
    interestAmount = calculateDayBasedSegmentInterest(amount, roi, differenceInDays, payoutType, newCalc);
  }
  return {
    ...segment,
    roi,
    differenceInDays,
    interestAmount: Math.round(interestAmount),
    estimatedInterestAmount: Math.round(interestAmount),
  };
};
const computeAccruedPeriods = (months, payoutType) => {
  const payout = String(payoutType || "MONTHLY").toUpperCase();
  if (months <= 0) return 1;
  if (payout.includes("YEAR")) return Math.max(1, Math.ceil(months / 12));
  if (payout.includes("QUART")) return Math.max(1, Math.ceil(months / 3));
  if (payout.includes("HALF")) return Math.max(1, Math.ceil(months / 6));
  return Math.max(1, months);
};
const computeAccruedPeriodsForSegment = (months, payoutType) => {
  if (months <= 0) return 0;
  return computeAccruedPeriods(months, payoutType);
};
const parseLocalDate = (value) => {
  const text = String(value || "").trim();
  if (!text) return null;
  if (text.includes("/")) {
    const [day, month, year] = text.split("/");
    if (day && month && year) {
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      return Number.isNaN(date.getTime()) ? null : date;
    }
  }
  const iso = text.slice(0, 10);
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
};
const computeNextPaymentDate = (loanActiveDate, payoutType) => {
  const active = parseLocalDate(loanActiveDate);
  if (!active) return null;
  const payout = String(payoutType || "MONTHLY").toUpperCase();
  const payment = new Date(active.getTime());
  const day = active.getDate();
  if (payout.includes("YEAR")) {
    payment.setFullYear(payment.getFullYear() + 1);
  } else if (payout.includes("QUART")) {
    payment.setMonth(payment.getMonth() + 3);
  } else if (payout.includes("HALF")) {
    payment.setMonth(payment.getMonth() + 6);
  } else {
    payment.setMonth(payment.getMonth() + 1);
  }
  if (day >= 29) payment.setDate(28);
  return payment;
};
const monthsBetween = (start, end) => {
  if (!start || !end || end < start) return 0;
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
};
const calculatePeriodInterest = (amount, roi, payoutType, newCalc) => {
  const payout = String(payoutType || "MONTHLY").toUpperCase();
  if (payout.includes("YEAR")) return Math.round(amount * roi / 100);
  if (payout.includes("QUART")) return Math.round(amount * (roi / 4) / 100);
  if (payout.includes("HALF")) return Math.round(amount * (roi / 2) / 100);
  return newCalc ? Math.round(amount * roi / 100) : Math.round(amount * (roi / 12) / 100);
};
const buildParticipationSegmentsFromDeal = (deal, interestData) => {
  if (interestData?.participationSegments?.length) {
    return interestData.participationSegments;
  }
  const segments = [];
  const participatedAmount = pickNumber(deal.participatedAmount, interestData?.participatedAmount);
  const updationAmount = pickNumber(deal.updationAmount, interestData?.updationAmount);
  if (participatedAmount > 0) {
    segments.push({
      segmentType: "INITIAL",
      amount: participatedAmount,
      activityOn: deal.receivedOn || interestData?.receivedOn || deal.loanActiveDate,
    });
  }
  if (updationAmount > 0) {
    segments.push({
      segmentType: "UPDATION",
      amount: updationAmount,
      activityOn: deal.firstUpdationOn || interestData?.firstUpdationOn || deal.receivedOn,
    });
  }
  return segments;
};
const calculateSegmentedInterestLocal = (deal, interestData = {}) => {
  const roi = pickPositiveNumber(interestData.roi, deal.roi);
  const payoutMeta = resolveDealPayoutMeta(interestData, deal);
  const payoutType = payoutMeta.payoutType;
  const fundsStart = String(deal.fundsAcceptanceStartDate || deal.receivedOn || interestData.fundsAcceptanceStartDate || "").slice(0, 10);
  const newCalc = fundsStart >= "2021-10-04";
  const loanActiveDate = parseLocalDate(interestData.loanActiveDate || deal.loanActiveDate);
  const paymentEnd = computeFirstUnpaidPaymentDate(interestData.loanActiveDate || deal.loanActiveDate, payoutType);
  const accrualEnd = paymentEnd || new Date();
  const lenderId = pickNumber(interestData.userId, interestData.lenderId, deal.lenderId);
  const rawSegments = buildParticipationSegmentsFromDeal(deal, interestData);
  const breakdown = [];
  let totalEstimatedInterest = 0;
  let totalAccruedPeriods = 0;
  let maxElapsedMonths = 0;
  let maxDifferenceInDays = 0;

  rawSegments.forEach((rawSegment) => {
    const amount = pickNumber(rawSegment.amount);
    if (!amount) return;
    const segmentStart = parseLocalDate(rawSegment.activityOn);
    if (!segmentStart) return;
    const interestEnd = accrualEnd;
    const differenceInDays = resolveSegmentDifferenceInDays(rawSegment, deal, interestData, payoutType);
    const months = monthsBetween(segmentStart, interestEnd);
    const periods = computeAccruedPeriodsForSegment(months, payoutType);
    const periodInterest = calculatePeriodInterest(amount, roi, payoutType, newCalc);
    let segmentInterest = calculateDayBasedSegmentInterest(amount, roi, differenceInDays, payoutType, newCalc);
    if (segmentInterest <= 0 && !payoutType.includes("YEAR")) {
      segmentInterest = periodInterest * periods;
    }
    totalEstimatedInterest += segmentInterest;
    totalAccruedPeriods += periods;
    maxElapsedMonths = Math.max(maxElapsedMonths, months);
    maxDifferenceInDays = Math.max(maxDifferenceInDays, differenceInDays);
    breakdown.push({
      segmentType: rawSegment.segmentType,
      amount,
      activityOn: rawSegment.activityOn,
      updatedDate: formatDisplayDate(rawSegment.activityOn),
      upatedDate: formatDisplayDate(rawSegment.activityOn),
      interestStartDate: formatDate(segmentStart),
      interestEndDate: formatDate(interestEnd),
      differenceInDays,
      elapsedMonths: months,
      accruedPeriods: periods,
      periodInterestAmount: periodInterest,
      estimatedInterestAmount: segmentInterest,
      interestAmount: segmentInterest,
      roi,
      userId: lenderId,
    });
  });

  const formula =
    breakdown.length > 1
      ? breakdown
          .map(
            (segment) =>
              `Rs ${fmtNum(Math.round(segment.estimatedInterestAmount))} (${segment.segmentType} Rs ${fmtNum(segment.amount)} x ${segment.differenceInDays || segment.accruedPeriods} day(s))`
          )
          .join(" + ") + ` = Total Rs ${fmtNum(Math.round(totalEstimatedInterest))}`
      : buildInterestFormula(
          breakdown[0]?.amount || totalParticipation(deal),
          roi,
          payoutType,
          newCalc,
          breakdown[0]?.periodInterestAmount || 0,
          breakdown[0]?.accruedPeriods || 0
        );

  return {
    estimatedInterestAmount: Math.round(totalEstimatedInterest),
    segmentInterestBreakdown: breakdown,
    usesSegmentedInterest: breakdown.length > 1,
    accruedPeriods: totalAccruedPeriods,
    elapsedMonths: maxElapsedMonths,
    periodInterestAmount: breakdown[breakdown.length - 1]?.periodInterestAmount || 0,
    interestCalculationFormula: formula,
    estimatedInterestLabel:
      breakdown.length > 1
        ? "Estimated accrued interest (segment-wise participation + updation)"
        : payoutType.includes("YEAR")
          ? `Estimated accrued interest (${breakdown[0]?.accruedPeriods || 1} yearly payout period(s))`
          : `Estimated accrued interest (${maxDifferenceInDays || breakdown[0]?.differenceInDays || breakdown[0]?.accruedPeriods || 1} day(s))`,
    nextPaymentDate: paymentEnd ? formatDate(paymentEnd) : "",
    maxDifferenceInDays,
  };
};
const computeMaxPeriods = (durationMonths, payoutType) => {
  if (!durationMonths) return Number.MAX_SAFE_INTEGER;
  const payout = String(payoutType || "MONTHLY").toUpperCase();
  if (payout.includes("YEAR")) return Math.max(1, Math.ceil(durationMonths / 12));
  if (payout.includes("QUART")) return Math.max(1, Math.ceil(durationMonths / 3));
  if (payout.includes("HALF")) return Math.max(1, Math.ceil(durationMonths / 6));
  return Math.max(1, durationMonths);
};
const buildInterestFormula = (participation, roi, payoutType, newCalc, periodInterest, accruedPeriods) => {
  const payout = formatPayoutTypeLabel(payoutType);
  const normalized = String(payoutType || "MONTHLY").toUpperCase();
  let roiFactor = "participation x ROI%";
  if (normalized.includes("QUART")) roiFactor = "participation x (ROI% / 4)";
  else if (normalized.includes("HALF")) roiFactor = "participation x (ROI% / 2)";
  else if (!normalized.includes("YEAR") && !newCalc) roiFactor = "participation x (ROI% / 12)";
  if (accruedPeriods > 1) {
    return `${payout} payout: (${roiFactor}) x ${accruedPeriods} periods = Rs ${fmtNum(Math.round(periodInterest * accruedPeriods))}`;
  }
  return `${payout} payout: ${roiFactor} = Rs ${fmtNum(Math.round(periodInterest))}`;
};
const parseLenderIdSearch = (value) => {
  const text = String(value || "").trim().toUpperCase().replace(/^LR\s*/i, "");
  const id = Number(text);
  return Number.isNaN(id) || id <= 0 ? "" : String(id);
};

const mapProfileToLenderRow = (profile) => ({
  lenderId: pickNumber(profile?.lenderId),
  userCode: profile?.userCode,
  name: profile?.name,
  email: profile?.email,
  mobileNumber: profile?.mobileNumber,
  city: profile?.city,
  state: profile?.state,
  pincode: profile?.pincode,
  dealsCount: pickNumber(profile?.dealsCount),
  totalParticipationAmount: pickNumber(profile?.totalParticipationAmount),
  participatedAmount: pickNumber(profile?.participatedAmount),
  updationAmount: pickNumber(profile?.updationAmount),
  lastParticipationOn: profile?.lastParticipationOn,
  bankName: profile?.bankName,
  accountNumber: profile?.accountNumber,
  ifscCode: profile?.ifscCode,
  branchName: profile?.branchName,
  accountType: profile?.accountType,
  bankDetailsSource: profile?.bankDetailsSource,
});

const nameFromBankUser = (value) => {
  const text = String(value || "").trim();
  if (!text) {
    return "";
  }
  return text.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s*/i, "").trim();
};

const isSparseLenderRow = (lender) => {
  const lenderId = pickNumber(lender?.lenderId);
  if (!lenderId) {
    return true;
  }
  const hasIdentity = Boolean(String(lender?.name || lender?.email || lender?.mobileNumber || "").trim());
  const hasStats = pickNumber(lender?.dealsCount) > 0 || pickNumber(lender?.totalParticipationAmount) > 0;
  return !hasIdentity || !hasStats;
};

const buildDealParticipationSummary = (dealsData) => {
  const allDeals = dealsData?.allDeals?.length
    ? dealsData.allDeals
    : [
        ...(dealsData?.activeDeals || []),
        ...(dealsData?.closedDeals || []),
        ...(dealsData?.withdrawDeals || []),
      ];
  if (!allDeals.length) {
    return null;
  }
  let participatedAmount = 0;
  let updationAmount = 0;
  let totalParticipationAmount = 0;
  let lastParticipationOn = "";
  allDeals.forEach((deal) => {
    participatedAmount += pickNumber(deal.participatedAmount);
    updationAmount += pickNumber(deal.updationAmount);
    totalParticipationAmount += pickNumber(deal.totalParticipationAmount, deal.totalAmount);
    const receivedOn = String(deal.receivedOn || deal.firstUpdationOn || "").trim();
    if (receivedOn && (!lastParticipationOn || receivedOn > lastParticipationOn)) {
      lastParticipationOn = receivedOn;
    }
  });
  return {
    dealsCount: allDeals.length,
    participatedAmount,
    updationAmount,
    totalParticipationAmount,
    lastParticipationOn,
  };
};

const normalizeLegacyLenderProfile = (legacyData, lenderId) => {
  const entry =
    legacyData?.activeLendersResponse?.[0] ||
    legacyData?.activeLenders?.[0] ||
    (legacyData?.lenderId || legacyData?.lenderName ? legacyData : null);
  if (!entry) {
    return null;
  }
  return {
    lenderId: pickNumber(entry.lenderId, lenderId),
    userCode: entry.userCode || (pickNumber(entry.lenderId, lenderId) ? `LR${pickNumber(entry.lenderId, lenderId)}` : ""),
    name: entry.lenderName || entry.name,
    email: entry.email,
    mobileNumber: entry.mobileNumber,
    city: entry.city,
    state: entry.state,
    pincode: entry.pincode,
    address: entry.address,
    panNumber: entry.panNumber,
    aadharNumber: entry.aadharNumber,
    whatsappNumber: entry.whatsappNumber || entry.whastappNumber,
    registeredOn: entry.registeredOn || entry.userRegisterDate,
    dob: entry.dob,
    gender: entry.gender,
    lenderGroupId: entry.lenderGroupId,
    lenderGroupName: entry.lenderGroup || entry.lenderGroupName,
    lenderType: entry.lenderType || entry.primaryType,
    walletAmount: pickNumber(entry.walletAmount, entry.currentWalletAmount),
    totalParticipationAmount: pickNumber(entry.totalParticipationAmount),
    dealsCount: pickNumber(entry.dealsCount),
    bankName: entry.bankName,
    accountNumber: entry.accountNumber || entry.bankAccNumber,
    ifscCode: entry.ifscCode || entry.ifsc,
    branchName: entry.branchName,
  };
};

const isApprovedLenderWithdrawDeal = (deal) =>
  Boolean(
    deal?.hasLenderWithdraw ||
      deal?.lenderDealStatus === "LENDER_WITHDRAW" ||
      String(deal?.lenderWithdrawStatus || "").toUpperCase() === "APPROVED" ||
      (Array.isArray(deal?.paidReturns) &&
        deal.paidReturns.some(
          (item) =>
            String(item?.amountType || "").toUpperCase() === "LENDERWITHDRAW" &&
            String(item?.status || "").toUpperCase() === "APPROVED"
        ))
  );

const reclassifyDealsBuckets = (data) => {
  if (!data) {
    return data;
  }
  const withdrawIds = new Set((data.withdrawDeals || []).map((deal) => pickNumber(deal.dealId)));
  const withdraw = [...(data.withdrawDeals || [])];
  const active = [];
  const closed = [];

  const moveToWithdraw = (deal) => {
    const dealId = pickNumber(deal.dealId);
    if (!dealId || withdrawIds.has(dealId)) {
      return;
    }
    withdraw.push({
      ...deal,
      hasLenderWithdraw: true,
      lenderDealStatus: "LENDER_WITHDRAW",
      lenderWithdrawStatus: deal?.lenderWithdrawStatus || "APPROVED",
      displayStatus: "Lender Withdraw",
      activeDeal: false,
    });
    withdrawIds.add(dealId);
  };

  (data.activeDeals || []).forEach((deal) => {
    if (isApprovedLenderWithdrawDeal(deal)) {
      moveToWithdraw(deal);
      return;
    }
    if (!withdrawIds.has(pickNumber(deal.dealId))) {
      active.push(deal);
    }
  });

  (data.closedDeals || []).forEach((deal) => {
    if (isApprovedLenderWithdrawDeal(deal)) {
      moveToWithdraw(deal);
      return;
    }
    if (!withdrawIds.has(pickNumber(deal.dealId))) {
      closed.push(deal);
    }
  });

  const allDeals = data?.allDeals?.length
    ? data.allDeals.filter((deal) => !withdrawIds.has(pickNumber(deal.dealId)) || withdraw.some((w) => pickNumber(w.dealId) === pickNumber(deal.dealId)))
    : [...active, ...closed, ...withdraw].sort((a, b) => String(b.receivedOn || "").localeCompare(String(a.receivedOn || "")));

  return {
    ...data,
    activeDeals: active,
    closedDeals: closed,
    withdrawDeals: withdraw,
    allDeals: allDeals.length ? allDeals : [...active, ...closed, ...withdraw],
  };
};

const mergeReturnsSummary = (base, extra) => {
  if (!base && !extra) {
    return null;
  }
  const merged = { ...(base || {}) };
  if (!extra) {
    return merged;
  }
  ["totalInterestEarned", "totalPrincipalAmount", "totalWithdrawAmount", "interestEarnedCount"].forEach((key) => {
    const nextValue = pickNumber(extra[key]);
    const currentValue = pickNumber(merged[key]);
    if (nextValue > 0 || currentValue <= 0) {
      merged[key] = nextValue;
    }
  });
  if (Array.isArray(extra.interestEarnedHistory) && extra.interestEarnedHistory.length) {
    merged.interestEarnedHistory = extra.interestEarnedHistory;
  }
  return merged;
};

const fetchEnrichedLenderProfile = async (lenderId, seedLender = null, asListRow = false) => {
  const userId = pickNumber(lenderId, seedLender?.lenderId);
  if (!userId) {
    return seedLender || null;
  }

  let dealsData = null;
  let apiProfile = null;
  let bankData = null;
  let legacyProfile = null;
  let userProfile = null;
  let returnsSummary = null;

  let fullDetailsProfile = null;
  let userRepoProfile = null;

  await Promise.all([
    getAdminAIActiveLenderDeals(userId)
      .then((response) => {
        dealsData = reclassifyDealsBuckets(responseData(response));
      })
      .catch(() => {}),
    getAdminAIActiveLenderReturnsSummary(userId)
      .then((response) => {
        returnsSummary = responseData(response);
      })
      .catch(() => {}),
    getAdminAIActiveLenderUserRepoProfile(userId)
      .then((response) => {
        const data = responseData(response);
        userRepoProfile = data?.profile || data;
      })
      .catch(() => {}),
    getAdminAIActiveLenderFullDetails(userId)
      .then((response) => {
        const data = responseData(response);
        fullDetailsProfile = data?.profile || data;
      })
      .catch(() => {}),
    getAdminAIActiveLenderProfile(userId)
      .then((response) => {
        const data = responseData(response);
        apiProfile = data?.profile || data;
      })
      .catch(() => {}),
    getAdminAIActiveLenderBankDetails(userId)
      .then((response) => {
        const data = responseData(response);
        if (data && hasBankDetailsData(data)) {
          bankData = mapBankProfile(data);
        }
      })
      .catch(() => {}),
    getAdminAIActiveLenderLegacyDetails(userId)
      .then((response) => {
        legacyProfile = normalizeLegacyLenderProfile(responseData(response), userId);
      })
      .catch(() => {}),
    getAdminAIUsers(1, 1, "registered", { userId })
      .then((response) => {
        const data = responseData(response);
        if (data?.users?.[0]) {
          userProfile = normalizeUserToProfile(data.users[0]);
        }
      })
      .catch(() => {}),
  ]);

  const dealSummary = buildDealParticipationSummary(dealsData);
  const dealsProfile = dealsData?.profile || null;
  const bankUserName = nameFromBankUser(
    bankData?.userNameAccordingToBank || dealsProfile?.userNameAccordingToBank
  );
  const merged = mergeReturnsSummary(
    mergeProfiles(
      seedLender || { lenderId: userId, userCode: `LR${userId}` },
      userRepoProfile,
      fullDetailsProfile,
      dealsProfile,
      dealSummary,
      buildReturnsSummaryFromDeals(dealsData),
      returnsSummary,
      apiProfile,
      bankData,
      legacyProfile,
      userProfile,
      bankUserName ? { name: bankUserName } : null
    ),
    returnsSummary || buildReturnsSummaryFromDeals(dealsData)
  );

  if (!merged) {
    return seedLender || null;
  }
  return asListRow ? mapProfileToLenderRow(merged) : merged;
};

const formatReturnAmountType = (value) => {
  const text = String(value || "").trim().toUpperCase();
  if (text === "LENDERINTEREST") return "Lender Interest";
  if (text === "PRINCIPALINTEREST") return "Principal Interest";
  if (text === "WITHDRAWALINTEREST") return "Withdrawal Interest";
  return text || "-";
};

const buildReturnsSummaryFromDeals = (dealsData) => {
  const interestDetails = dealsData?.interestDetailsByDeal;
  if (!interestDetails || !Object.keys(interestDetails).length) {
    return null;
  }
  let totalInterestEarned = 0;
  let totalPrincipalAmount = 0;
  let totalWithdrawAmount = 0;
  const interestEarnedHistory = [];
  Object.entries(interestDetails).forEach(([dealId, details]) => {
    totalInterestEarned += pickNumber(details?.totalPaidInterest);
    totalPrincipalAmount += pickNumber(details?.totalPaidPrincipal);
    if (details?.hasLenderWithdraw) {
      totalWithdrawAmount += pickNumber(details?.lenderWithdrawAmount);
    }
    (details?.interestPaymentHistory || []).forEach((item) => {
      interestEarnedHistory.push({
        dealId: pickNumber(item.dealId, dealId),
        dealName: item.dealName || "",
        amount: pickNumber(item.amount),
        paidDate: item.paidDate || item.actualDate || "",
        actualDate: item.actualDate || "",
        amountType: item.amountType || "LENDERINTEREST",
        status: item.status || "INITIATED",
        remarks: item.remarks || "",
      });
    });
  });
  interestEarnedHistory.sort((a, b) => String(b.paidDate || "").localeCompare(String(a.paidDate || "")));
  return {
    totalInterestEarned,
    totalPrincipalAmount,
    totalWithdrawAmount,
    interestEarnedCount: interestEarnedHistory.length,
    interestEarnedHistory,
  };
};

const formatLenderCode = (lenderId, userCode) => {
  const raw = String(userCode || "").trim();
  if (/^LR/i.test(raw)) {
    return `LR ${raw.replace(/^LR/i, "").trim()}`;
  }
  return lenderId ? `LR ${lenderId}` : "-";
};
const formatLenderType = (value) => {
  const text = String(value || "").trim();
  if (!text) {
    return "-";
  }
  return text.charAt(0) + text.slice(1).toLowerCase();
};
const formatReferralStatus = (status) => {
  const text = String(status || "").trim();
  if (!text) {
    return "-";
  }
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const referralUnpaidAmount = (referral) => {
  const unpaid = pickNumber(referral?.amountNotPaid);
  if (unpaid > 0) return unpaid;
  const earned = pickNumber(referral?.totalEarned, referral?.totalAmountEarned, referral?.amount);
  const paid = pickNumber(referral?.amountPaid);
  return earned > paid ? earned - paid : 0;
};

const referralEarnedAmount = (referral) => {
  const earned = pickNumber(referral?.totalEarned, referral?.totalAmountEarned, referral?.amount);
  if (earned > 0) return earned;
  return pickNumber(referral?.amountPaid) + referralUnpaidAmount(referral);
};

const referralCount = (profile, referralTotal = 0) =>
  Math.max(pickNumber(profile?.referralSummary?.total), profile?.referrals?.length || 0, referralTotal);

const fmtInr = (n) => `INR ${fmtNum(Math.round(Number(n) || 0))}`;

const normalizeBonusDeal = (deal) => ({
  dealId: pickNumber(deal?.dealId),
  participatedOn: deal?.participatedOn || "",
  participatedAmount: pickNumber(deal?.participatedAmount),
  amount: pickNumber(deal?.amount),
  paymentStatus: deal?.paymentStatus || "",
  transferredOn: deal?.transferredOn || "",
});

const normalizeApiReferralRow = (referral) => {
  const totalEarned = pickNumber(referral?.totalEarned, referral?.totalAmountEarned);
  const amountPaid = pickNumber(referral?.amountPaid);
  let amountNotPaid = pickNumber(referral?.amountNotPaid);
  if (amountNotPaid <= 0 && totalEarned > amountPaid) {
    amountNotPaid = totalEarned - amountPaid;
  }
  const rawBonusDeals = Array.isArray(referral?.bonusDeals)
    ? referral.bonusDeals
    : Array.isArray(referral?.lenderReferenceAmountResponse)
      ? referral.lenderReferenceAmountResponse
      : [];
  return {
    referenceId: pickNumber(referral?.referenceId),
    refereeId: pickNumber(referral?.refereeId),
    refereeName: referral?.refereeName || "",
    refereeEmail: referral?.refereeEmail || "",
    refereeMobileNumber: referral?.refereeMobileNumber || "",
    status: referral?.status || "",
    referredOn: referral?.referredOn || "",
    totalEarned: totalEarned || amountPaid + amountNotPaid,
    amountPaid,
    amountNotPaid,
    totalInvestment: pickNumber(referral?.totalInvestment),
    bonusDeals: rawBonusDeals.map(normalizeBonusDeal),
  };
};

const referralStatusClass = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "invited") return "invited";
  if (normalized === "registered") return "registered";
  if (normalized === "lent") return "lent";
  if (normalized === "disbursed") return "disbursed";
  return "neutral";
};

const formatLenderGroup = (profile) => {
  const groupId = pickNumber(profile?.lenderGroupId);
  if (!groupId) {
    return "-";
  }
  const groupName = String(profile?.lenderGroupName || "").trim();
  return groupName ? `${groupId} (${groupName})` : String(groupId);
};
const gmailUrl = (email) => {
  const trimmed = String(email || "").trim();
  return trimmed && trimmed !== "-" ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(trimmed)}` : null;
};

const normalizeDealsData = (data) => {
  const reclassified = reclassifyDealsBuckets(data);
  const activeDeals = reclassified?.activeDeals || [];
  const closedDeals = reclassified?.closedDeals || [];
  const withdrawDeals = reclassified?.withdrawDeals || [];
  const allDeals =
    reclassified?.allDeals?.length > 0
      ? reclassified.allDeals
      : [...activeDeals, ...closedDeals, ...withdrawDeals].sort(
          (a, b) => String(b.receivedOn || "").localeCompare(String(a.receivedOn || ""))
        );
  return { ...reclassified, activeDeals, closedDeals, withdrawDeals, allDeals };
};

const totalParticipation = (item) =>
  pickNumber(
    item?.totalParticipationAmount,
    item?.totalAmount,
    pickNumber(item?.participatedAmount) + pickNumber(item?.updationAmount)
  );

const sumDealParticipationAmount = (deals = []) =>
  (deals || []).reduce((sum, deal) => sum + totalParticipation(deal), 0);

const sumWithdrawDealAmount = (deals = []) =>
  (deals || []).reduce(
    (sum, deal) => sum + pickNumber(deal.lenderWithdrawAmount, totalParticipation(deal)),
    0
  );

const hasBankDetailsData = (profile) => {
  const fields = [profile?.bankName, profile?.accountNumber, profile?.ifscCode, profile?.branchName];
  return fields.some((value) => String(value || "").trim() !== "");
};

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

const resolveLenderUserId = (lender) =>
  pickNumber(lender?.lenderId, lender?.userId, lender?.id);

const mergeProfile = (base, extra) => {
  if (!base && !extra) {
    return null;
  }
  const merged = { ...(base || {}) };
  if (!extra) {
    return merged;
  }
  Object.entries(extra).forEach(([key, value]) => {
    if (value == null || value === "") {
      return;
    }
    if (Array.isArray(value)) {
      if (!value.length && Array.isArray(merged[key]) && merged[key].length) {
        return;
      }
      merged[key] = value;
      return;
    }
    if (typeof value === "object") {
      merged[key] = value;
      return;
    }
    merged[key] = value;
  });
  return merged;
};

const mergeProfiles = (...sources) => sources.reduce((acc, source) => mergeProfile(acc, source), null);

const profileInitials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) {
    return "LR";
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const normalizeUserToProfile = (user) => {
  if (!user) {
    return null;
  }
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
  };
};

const formatDateTime = (value) => {
  const text = String(value || "").trim();
  if (!text) {
    return "-";
  }
  return text.slice(0, 19).replace("T", " ");
};

const walletTypeLabel = (type) => {
  const value = String(type || "").toLowerCase();
  if (value === "credit") {
    return "Credit";
  }
  if (value === "debit") {
    return "Debit";
  }
  return valueOrDash(type);
};

const txTypeValue = (tx) => tx?.amountType || tx?.transactionType;
const txAmountValue = (tx) => pickNumber(tx?.amount, tx?.transactionAmount);
const txPaidDate = (tx) => tx?.paidDate || tx?.transactionDate;
const returnTypeLabel = (amountType) => {
  const value = String(amountType || "").trim().toUpperCase();
  if (value === "LENDERINTEREST") {
    return "Lender Interest";
  }
  if (value === "LENDERPRINCIPAL" || value === "LENDERPRICIPAL") {
    return "Lender Principal";
  }
  if (value === "PRINCIPALINTEREST") {
    return "Lender Principal Interest";
  }
  if (value === "WITHDRAWALINTEREST") {
    return "Withdrawal Interest";
  }
  if (value === "LENDERWITHDRAW") {
    return "Lender Withdrawal";
  }
  if (value === "PRINCIPALTOWALLET") {
    return "Principal To Wallet";
  }
  return valueOrDash(amountType);
};

const isCreditTx = (tx) => String(txTypeValue(tx) || "").toLowerCase() === "credit";

const buildLocalInterestDetails = (deal) => {
  const participatedAmount = pickNumber(deal.participatedAmount);
  const updationAmount = pickNumber(deal.updationAmount);
  const totalParticipationAmount = totalParticipation(deal);
  const roi = pickNumber(deal.roi);
  const payoutTypeRaw = normalizePayoutType(deal.lenderReturnsType);
  const payoutType = payoutTypeRaw;
  const payoutTypeLabel = formatPayoutTypeLabel(payoutType, deal.lenderReturnsType);
  const duration = deal.duration || "";
  const durationMonths = pickNumber(deal.durationMonths, parseDurationMonths(duration));
  const isActive = isOpenDealStatus(deal.status, deal);
  const segmented = isActive ? calculateSegmentedInterestLocal(deal) : {
    estimatedInterestAmount: calculatePeriodInterest(totalParticipationAmount, roi, payoutType, String(deal.fundsAcceptanceStartDate || deal.receivedOn || "").slice(0, 10) >= "2021-10-04"),
    segmentInterestBreakdown: [],
    usesSegmentedInterest: false,
    accruedPeriods: 0,
    elapsedMonths: 0,
    periodInterestAmount: calculatePeriodInterest(totalParticipationAmount, roi, payoutType, String(deal.fundsAcceptanceStartDate || deal.receivedOn || "").slice(0, 10) >= "2021-10-04"),
    interestCalculationFormula: "",
    estimatedInterestLabel: "Estimated interest payout",
  };

  return {
    participatedAmount,
    updationAmount,
    totalParticipationAmount,
    roi,
    lenderReturnsType: deal.lenderReturnsType || "MONTHLY",
    payoutType,
    payoutTypeLabel,
    duration,
    durationMonths,
    elapsedMonths: segmented.elapsedMonths,
    accruedPeriods: segmented.accruedPeriods,
    periodInterestAmount: segmented.periodInterestAmount,
    segmentInterestBreakdown: segmented.segmentInterestBreakdown,
    usesSegmentedInterest: segmented.usesSegmentedInterest,
    interestCalculationFormula: segmented.interestCalculationFormula,
    loanActiveDate: deal.loanActiveDate,
    fundsAcceptanceStartDate: deal.fundsAcceptanceStartDate,
    borrowerClosedDate: deal.borrowerClosedDate,
    dealStatus: deal.status,
    activeDeal: isActive,
    hasPaidInterest: false,
    estimatedInterestAmount: segmented.estimatedInterestAmount,
    estimatedInterestLabel: segmented.estimatedInterestLabel,
    totalPaidInterest: 0,
    totalPaidPrincipal: 0,
    paidReturns: [],
    paidReturnsCount: 0,
    interestPaymentHistory: [],
    localFallback: true,
    sourceTables: [
      "oxy_lenders_accepted_deals",
      "lenders_paticipation_updation",
      "oxy_borrowers_deals_information",
    ],
  };
};

const resolveInterestDetails = (dealId, dealsPayload, cache) =>
  cache?.[dealId] ||
  cache?.[String(dealId)] ||
  dealsPayload?.interestDetailsByDeal?.[dealId] ||
  dealsPayload?.interestDetailsByDeal?.[String(dealId)] ||
  null;

const isInterestReturnType = (amountType) => {
  const value = String(amountType || "").trim().toUpperCase();
  return value === "LENDERINTEREST" || value === "PRINCIPALINTEREST" || value === "WITHDRAWALINTEREST";
};

const buildInterestPaymentHistory = (paidReturns = []) =>
  (paidReturns || [])
    .filter((item) => isInterestReturnType(item.amountType))
    .map((item) => ({
      returnId: item.returnId,
      interestPaidDate: item.paidDate || item.actualDate,
      interestPaidAmount: pickNumber(item.amount),
      amountType: item.amountType,
      status: item.status,
      remarks: item.remarks,
    }))
    .sort((a, b) => String(b.interestPaidDate || "").localeCompare(String(a.interestPaidDate || "")));

const enrichInterestDetails = (details, deal) => {
  if (!details) {
    return buildLocalInterestDetails(deal);
  }
  const paidReturns = details.paidReturns || [];
  const interestPaymentHistory = details.interestPaymentHistory?.length
    ? details.interestPaymentHistory
    : buildInterestPaymentHistory(paidReturns);
  const hasPaidInterest = pickNumber(details.totalPaidInterest) > 0 || interestPaymentHistory.length > 0;
  const isActive = isOpenDealStatus(deal.status || details.dealStatus, deal);
  const payoutMeta = resolveDealPayoutMeta(details, deal);
  let merged = {
    ...details,
    loanActiveDate: details.loanActiveDate || deal.loanActiveDate,
    fundsAcceptanceStartDate: details.fundsAcceptanceStartDate || deal.fundsAcceptanceStartDate,
    borrowerClosedDate: details.borrowerClosedDate || deal.borrowerClosedDate,
    dealStatus: details.dealStatus || deal.status,
    roi: pickPositiveNumber(details.roi, deal.roi),
    participatedAmount: pickNumber(details.participatedAmount, deal.participatedAmount),
    updationAmount: pickNumber(details.updationAmount, deal.updationAmount),
    totalParticipationAmount: pickNumber(details.totalParticipationAmount, totalParticipation(deal)),
    lenderReturnsType: payoutMeta.lenderReturnsType,
    payoutType: payoutMeta.payoutType,
    payoutTypeLabel: payoutMeta.payoutTypeLabel,
    duration: details.duration || deal.duration,
    durationMonths: pickNumber(details.durationMonths, deal.durationMonths, parseDurationMonths(details.duration || deal.duration)),
    interestPaymentHistory,
    hasPaidInterest,
  };

  if (!hasPaidInterest && isActive) {
    const local = calculateSegmentedInterestLocal(deal, merged);
    const apiRowsHaveAmount = (merged.interestInfoRows || []).some((row) => pickNumber(row.interestAmount) > 0);
    const apiSegmentsHaveAmount = (merged.segmentInterestBreakdown || []).some(
      (segment) => pickNumber(segment.estimatedInterestAmount, segment.interestAmount) > 0
    );
    if (!apiRowsHaveAmount || !apiSegmentsHaveAmount || !pickNumber(merged.estimatedInterestAmount)) {
      merged = {
        ...merged,
        ...local,
        ...payoutMeta,
        roi: pickPositiveNumber(merged.roi, deal.roi),
        estimatedInterestAmount: pickNumber(local.estimatedInterestAmount),
        onTheFlyInterest: true,
        interestInfoRows: [],
        segmentInterestBreakdown: local.segmentInterestBreakdown,
        usesSegmentedInterest: local.usesSegmentedInterest,
      };
    }
  } else {
    merged.segmentInterestBreakdown = merged.segmentInterestBreakdown || [];
    merged.interestInfoRows = merged.interestInfoRows || [];
    merged.usesSegmentedInterest = Boolean(merged.usesSegmentedInterest || merged.segmentInterestBreakdown.length > 1);
  }

  return merged;
};

const mapInterestEarningsFallback = (payload, deal) => {
  const list = payload?.listOfInterestDetails || [];
  const dealName = String(deal.dealName || "").trim().toLowerCase();
  const matched = list.filter((item) => String(item.dealName || "").trim().toLowerCase() === dealName);
  const paidReturns = matched.map((item, index) => ({
    returnId: `earn-${index}`,
    amount: pickNumber(item.interestAmount),
    paidDate: item.paidDate,
    actualDate: item.paidDate,
    amountType: "LENDERINTEREST",
    status: "INITIATED",
    remarks: "From monthly_interest_earnings",
    sourceTable: "lenders_returns",
  }));
  const totalPaidInterest = paidReturns.reduce((sum, item) => sum + pickNumber(item.amount), 0);
  const interestPaymentHistory = buildInterestPaymentHistory(paidReturns);
  return enrichInterestDetails(
    {
      ...buildLocalInterestDetails(deal),
      localFallback: false,
      paidReturns,
      paidReturnsCount: paidReturns.length,
      totalPaidInterest,
      totalPaidPrincipal: 0,
      hasPaidInterest: totalPaidInterest > 0,
      interestPaymentHistory,
      estimatedInterestAmount: 0,
    },
    deal
  );
};

const formatCompleteAddress = (profile) => {
  const line = profile?.addressLine || (typeof profile?.address === "string" ? profile.address : profile?.address?.addressLine);
  if (line) {
    return String(line).replace(/\n+/g, ", ").replace(/\s+/g, " ").trim();
  }
  return [profile?.city, profile?.state, profile?.pincode].filter(Boolean).join(", ") || "-";
};

const applyDealAmountMap = (deals, amountMap) =>
  (deals || []).map((deal) => {
    const dealAmount = pickNumber(deal.dealAmount, amountMap[deal.dealId], amountMap[String(deal.dealId)]);
    const participatedAmount = pickNumber(deal.participatedAmount);
    const updationAmount = pickNumber(deal.updationAmount);
    const totalParticipationAmount = pickNumber(deal.totalParticipationAmount, participatedAmount + updationAmount);
    return {
      ...deal,
      dealAmount,
      participatedAmount,
      updationAmount,
      totalParticipationAmount,
      totalAmount: totalParticipationAmount,
    };
  });

const fetchDealMetaMap = async (dealIds) => {
  const map = {};
  const uniqueIds = [...new Set(dealIds.filter(Boolean))];
  const batchSize = 8;
  for (let index = 0; index < uniqueIds.length; index += batchSize) {
    const batch = uniqueIds.slice(index, index + batchSize);
    await Promise.all(
      batch.map(async (dealId) => {
        try {
          const res = responseData(await getAdminAICreatedDeals(1, 1, "regular", { dealId: String(dealId) }));
          const found = res.deals?.[0];
          if (found) {
            map[dealId] = found;
          }
        } catch {
          // Ignore single deal lookup failures.
        }
      })
    );
  }
  return map;
};

const fetchDealAmountMap = async (dealIds) => {
  const metaMap = await fetchDealMetaMap(dealIds);
  const map = {};
  Object.entries(metaMap).forEach(([dealId, found]) => {
    map[dealId] = pickNumber(found.dealAmount);
  });
  return map;
};

const applyInterestWithdrawFlags = (data) => {
  if (!data?.interestDetailsByDeal) {
    return data;
  }
  const patchDeal = (deal) => {
    const interest =
      data.interestDetailsByDeal[deal.dealId] ||
      data.interestDetailsByDeal[String(deal.dealId)] ||
      null;
    if (!interest) {
      return deal;
    }
    if (
      interest.hasLenderWithdraw ||
      interest.lenderDealStatus === "LENDER_WITHDRAW" ||
      String(interest.lenderWithdrawStatus || "").toUpperCase() === "APPROVED"
    ) {
      return {
        ...deal,
        hasLenderWithdraw: true,
        lenderDealStatus: "LENDER_WITHDRAW",
        lenderWithdrawStatus: interest.lenderWithdrawStatus || "APPROVED",
        lenderWithdrawAmount: interest.lenderWithdrawAmount,
        activeDeal: false,
        paidReturns: interest.paidReturns || deal.paidReturns,
      };
    }
    if (interest.activeDeal === false && deal.activeDeal !== false) {
      return { ...deal, activeDeal: false };
    }
    return deal;
  };
  return {
    ...data,
    activeDeals: (data.activeDeals || []).map(patchDeal),
    closedDeals: (data.closedDeals || []).map(patchDeal),
    withdrawDeals: (data.withdrawDeals || []).map(patchDeal),
    allDeals: (data.allDeals || []).map(patchDeal),
  };
};

const enrichLenderDeals = async (data) => {
  const normalized = normalizeDealsData(applyInterestWithdrawFlags(data));
  const combined = [...normalized.activeDeals, ...normalized.closedDeals, ...normalized.withdrawDeals];
  const needsLookup = combined.some(
    (deal) => !pickNumber(deal.dealAmount) || !deal.loanActiveDate || !deal.lenderReturnsType || !deal.duration
  );
  const metaMap = needsLookup ? await fetchDealMetaMap(combined.map((deal) => deal.dealId)) : {};
  const amountMap = Object.fromEntries(
    Object.entries(metaMap).map(([dealId, found]) => [dealId, pickNumber(found.dealAmount)])
  );
  const mergeDealMeta = (deal) => {
    const meta = metaMap[deal.dealId] || metaMap[String(deal.dealId)] || {};
    return {
      ...deal,
      loanActiveDate: deal.loanActiveDate || meta.loanActiveDate,
      fundsAcceptanceStartDate: deal.fundsAcceptanceStartDate || meta.createdOn,
      borrowerClosedDate: deal.borrowerClosedDate,
      lenderReturnsType: deal.lenderReturnsType || meta.lenderReturnsType || "MONTHLY",
      duration: deal.duration || meta.duration,
      durationMonths: pickNumber(deal.durationMonths, meta.durationMonths, parseDurationMonths(deal.duration || meta.duration)),
    };
  };
  const activeDeals = applyDealAmountMap(normalized.activeDeals, amountMap).map(mergeDealMeta);
  const closedDeals = applyDealAmountMap(normalized.closedDeals, amountMap).map(mergeDealMeta);
  const withdrawDeals = applyDealAmountMap(normalized.withdrawDeals, amountMap).map(mergeDealMeta);
  const allDeals = applyDealAmountMap(normalized.allDeals, amountMap).map(mergeDealMeta);
  return { ...normalized, activeDeals, closedDeals, withdrawDeals, allDeals };
};

const buildInterestBreakupRows = (interestData, deal, lenderId) => {
  const resolvedRoi = pickPositiveNumber(interestData?.roi, deal.roi);
  const payoutMeta = resolveDealPayoutMeta(interestData, deal);
  const local = calculateSegmentedInterestLocal(deal, {
    ...interestData,
    ...payoutMeta,
    roi: resolvedRoi,
    lenderId,
  });
  const unpaidApiRows = (interestData?.interestInfoRows || []).filter((row) => {
    const paidDate = String(row.interestPaidDate || "").trim().toLowerCase();
    return !paidDate || paidDate.includes("yet") || paidDate === "-";
  });
  const apiHasValidUpcoming = unpaidApiRows.some((row) => pickNumber(row.interestAmount) > 0);
  const shouldUseLocalUpcoming = !interestData?.hasPaidInterest && !apiHasValidUpcoming;

  if (shouldUseLocalUpcoming) {
    const segments = (local.segmentInterestBreakdown || []).map((segment) =>
      enrichSegmentInterest(segment, deal, { ...interestData, ...payoutMeta, roi: resolvedRoi })
    );
    if (!segments.length) return [];
    const totalInterest = segments.reduce(
      (sum, segment) => sum + pickNumber(segment.estimatedInterestAmount, segment.interestAmount),
      pickNumber(local.estimatedInterestAmount)
    );
    return [{
      sno: 1,
      actualPaymentDate: local.nextPaymentDate || segments[0]?.interestEndDate || deal.loanActiveDate,
      interestPaidDate: "Yet to be paid",
      interestAmount: totalInterest,
      noOfDays: pickNumber(
        local.maxDifferenceInDays,
        Math.max(...segments.map((segment) => pickNumber(segment.differenceInDays)), 0)
      ),
      segments,
      showBreakup: segments.length > 0,
      onTheFlyCalculated: true,
    }];
  }

  if (interestData?.interestInfoRows?.length) {
    return interestData.interestInfoRows.map((row, index) => ({
      sno: row.sno ?? index + 1,
      actualPaymentDate: row.actualPaymentDate,
      interestPaidDate: row.interestPaidDate || "Yet to be paid",
      interestAmount: pickNumber(row.interestAmount),
      noOfDays: pickNumber(row.noOfDays),
      segments: (row.segments || []).map((segment) => enrichSegmentInterest(segment, deal, { ...interestData, roi: resolvedRoi })),
      showBreakup: Boolean(row.showBreakup && row.segments?.length),
      onTheFlyCalculated: Boolean(row.onTheFlyCalculated ?? interestData.onTheFlyInterest),
    }));
  }

  const segments = (local.segmentInterestBreakdown || []).map((segment) =>
    enrichSegmentInterest(segment, deal, { ...interestData, roi: resolvedRoi })
  );
  if (!segments.length) return [];
  return [{
    sno: 1,
    actualPaymentDate: local.nextPaymentDate || segments[0]?.interestEndDate || deal.loanActiveDate,
    interestPaidDate: interestData?.hasPaidInterest
      ? formatDisplayDate(interestData.interestPaymentHistory?.[0]?.interestPaidDate)
      : "Yet to be paid",
    interestAmount: pickNumber(local.estimatedInterestAmount),
    noOfDays: pickNumber(local.maxDifferenceInDays, Math.max(...segments.map((segment) => pickNumber(segment.differenceInDays)), 0)),
    segments,
    showBreakup: segments.length > 0,
    onTheFlyCalculated: true,
  }];
};

const InterestBreakupPanel = ({ rows, lenderId, roi, breakupOpenMap, onToggleBreakup }) => {
  if (!rows?.length) return null;

  return (
    <div className="admin-ai-interest-info-wrap">
      <div className="admin-ai-interest-info-head">
        <strong>Interest Info</strong>
        <span>
          {rows.some((row) => row.onTheFlyCalculated)
            ? "Calculated on-the-fly (no lenders_returns record yet) — same logic as lender Interest Info"
            : "Participation and updation calculated separately, then summed"}
        </span>
      </div>
      <div className="admin-ai-advanced-table-wrap">
        <table className="admin-ai-advanced-table admin-ai-interest-info-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Actual Payment Date</th>
              <th>Interest Paid Date</th>
              <th>Interest Amount</th>
              <th>No of Days</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
  const segmentTotal = (row.segments || []).reduce(
    (sum, segment) => sum + pickNumber(segment.estimatedInterestAmount, segment.interestAmount),
    0
  );
  const rowTotal = segmentTotal || pickNumber(row.interestAmount);
              return (
                <tr key={`interest-info-${row.sno}`}>
                  <td>{row.sno}</td>
                  <td>{formatDisplayDate(row.actualPaymentDate)}</td>
                  <td>{row.interestPaidDate || "Yet to be paid"}</td>
                  <td className="admin-ai-interest-amount-cell">
                    <span>{fmtNum(rowTotal)}</span>
                    {row.showBreakup ? (
                      <button
                        type="button"
                        className={`admin-ai-breakup-btn ${breakupOpenMap?.[row.sno] ? "open" : ""}`}
                        onClick={() => onToggleBreakup(row.sno)}
                      >
                        Breakup View
                      </button>
                    ) : null}
                  </td>
                  <td>{fmtNum(row.noOfDays)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.map((row) => {
        if (!breakupOpenMap?.[row.sno] || !row.segments?.length) return null;
        const segmentInterestTotal = row.segments.reduce(
          (sum, segment) => sum + pickNumber(segment.estimatedInterestAmount, segment.interestAmount),
          0
        );
        const rowTotal = segmentInterestTotal > 0 ? segmentInterestTotal : pickNumber(row.interestAmount);
        return (
          <div className="admin-ai-interest-breakup-wrap" key={`breakup-${row.sno}`}>
            <div className="admin-ai-advanced-table-wrap">
              <table className="admin-ai-advanced-table admin-ai-interest-breakup-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>ROI</th>
                    <th>Amount</th>
                    <th>Updated Date</th>
                    <th>Difference in Days</th>
                    <th>Interest Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {row.segments.map((segment, index) => (
                    <tr key={`breakup-${row.sno}-${index}`}>
                      <td>{pickNumber(segment.userId, lenderId) || 0}</td>
                      <td>{valueOrDash(segment.roi ?? roi)}</td>
                      <td>{fmtNum(segment.amount)}</td>
                      <td>{segment.updatedDate || segment.upatedDate || formatDisplayDate(segment.activityOn)}</td>
                      <td>{fmtNum(segment.differenceInDays)}</td>
                      <td><strong>{fmtNum(pickNumber(segment.estimatedInterestAmount, segment.interestAmount))}</strong></td>
                    </tr>
                  ))}
                  <tr className="admin-ai-interest-breakup-total-row">
                    <td colSpan={5} className="admin-ai-breakup-total-label">Total Interest</td>
                    <td><strong>{fmtNum(rowTotal)}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AdminAIDealsDashboard = () => {
  const navigate = useNavigate();
  const [totalLenders, setTotalLenders] = useState(0);
  const [lenders, setLenders] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [search, setSearch] = useState({ lenderId: "", mobileNumber: "" });
  const [copyNotice, setCopyNotice] = useState("");
  const [exportingLenders, setExportingLenders] = useState(false);

  const [view, setView] = useState("list");
  const [selectedLender, setSelectedLender] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [walletAmount, setWalletAmount] = useState(0);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [walletPage, setWalletPage] = useState(1);
  const [walletTotal, setWalletTotal] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletHistoryOpen, setWalletHistoryOpen] = useState(false);
  const walletPageSize = 10;

  const [dealsData, setDealsData] = useState(null);
  const [dealsTab, setDealsTab] = useState("all");
  const [dealsLoading, setDealsLoading] = useState(false);
  const [dealsError, setDealsError] = useState("");
  const [dealSearch, setDealSearch] = useState({ dealId: "", dealName: "" });
  const [dealsPage, setDealsPage] = useState(1);
  const dealsPageSize = 15;
  const [expandedInterestDealId, setExpandedInterestDealId] = useState(null);
  const [interestBreakupOpenByDeal, setInterestBreakupOpenByDeal] = useState({});
  const [interestDetailsByDeal, setInterestDetailsByDeal] = useState({});
  const [interestLoadingDealId, setInterestLoadingDealId] = useState(null);

  const referralPageSize = 5;
  const [referralRows, setReferralRows] = useState([]);
  const [referralTotal, setReferralTotal] = useState(0);
  const [referralPage, setReferralPage] = useState(1);
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralError, setReferralError] = useState("");
  const [referralEarnings, setReferralEarnings] = useState({
    totalEarned: 0,
    amountPaid: 0,
    amountNotPaid: 0,
    totalInvestment: 0,
  });
  const [paidEarningsByDate, setPaidEarningsByDate] = useState([]);
  const [profileReferredBy, setProfileReferredBy] = useState(null);
  const [referralBonusModal, setReferralBonusModal] = useState({
    open: false,
    title: "",
    rows: [],
  });

  const showCopyNotice = (message) => {
    setCopyNotice(message);
    window.setTimeout(() => setCopyNotice(""), 2200);
  };

  const copyText = async (label, value) => {
    const text = String(value || "").trim();
    if (!text || text === "-") {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showCopyNotice(`${label} copied`);
    } catch (error) {
      showCopyNotice(`Could not copy ${label.toLowerCase()}`);
    }
  };

  const loadSummary = async () => {
    try {
      const [summaryResponse, oldDashboardActiveLendersCount] = await Promise.all([
        getRegisteredUsersSummary(),
        getOldDashboardActiveLendersCount(),
      ]);
      const data = responseData(summaryResponse);
      setTotalLenders(
        pickNumber(data.activeLendersCount, data.users?.activeLenders, oldDashboardActiveLendersCount)
      );
    } catch (error) {
      setTotalLenders(0);
    }
  };

  const loadLenders = async (pageNo = 1, filters = search) => {
    setLoading(true);
    setListError("");
    const normalizedFilters = {
      ...filters,
      lenderId: parseLenderIdSearch(filters?.lenderId),
      mobileNumber: String(filters?.mobileNumber || "").trim(),
    };
    try {
      const data = responseData(await getAdminAIActiveLenders(pageNo, pageSize, normalizedFilters));
      let lendersList = data.activeLenders || [];
      let totalCount = pickNumber(data.totalCount);

      if (normalizedFilters.lenderId && pageNo === 1) {
        const lenderUserId = Number(normalizedFilters.lenderId);
        if (lendersList.length === 0) {
          const enriched = await fetchEnrichedLenderProfile(lenderUserId, null, true);
          if (enriched && pickNumber(enriched.lenderId) > 0) {
            lendersList = [enriched];
            totalCount = 1;
          }
        } else if (lendersList.some(isSparseLenderRow)) {
          lendersList = await Promise.all(
            lendersList.map((row) =>
              isSparseLenderRow(row)
                ? fetchEnrichedLenderProfile(lenderUserId, row, true)
                : row
            )
          );
        }
      } else if (pageNo === 1 && lendersList.some(isSparseLenderRow)) {
        lendersList = await Promise.all(
          lendersList.map((row) =>
            isSparseLenderRow(row)
              ? fetchEnrichedLenderProfile(pickNumber(row.lenderId), row, true)
              : row
          )
        );
      }

      setLenders(lendersList);
      setPage(pickNumber(data.pageNo, pageNo) || 1);
      setTotal(totalCount);
    } catch (error) {
      setLenders([]);
      setListError("Failed to load active lenders from backend.");
    } finally {
      setLoading(false);
    }
  };

  const downloadActiveLendersExcel = async () => {
    setExportingLenders(true);
    setListError("");
    const stamp = new Date().toISOString().slice(0, 10);
    try {
      const { rows, totalCount } = await fetchAllActiveLendersForExport((pageNo, expectedTotal) => {
        const suffix = expectedTotal ? ` of ${expectedTotal}` : "";
        showCopyNotice(`Fetching lenders... page ${pageNo}${suffix}`);
      });

      if (!rows.length) {
        setListError("No active lenders found to export.");
        return;
      }

      if (totalCount > 0 && rows.length < totalCount) {
        setListError(`Export incomplete: got ${rows.length} of ${totalCount} lenders. Please try again.`);
        return;
      }

      const xml = buildActiveLendersExcelXml(rows);
      const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
      saveAs(blob, `active-lenders-${stamp}.xls`);
      showCopyNotice(`Downloaded ${rows.length} active lenders`);
    } catch (error) {
      setListError("Failed to download active lenders Excel file.");
    } finally {
      setExportingLenders(false);
    }
  };

  useEffect(() => {
    loadSummary();
    loadLenders(1, { lenderId: "", mobileNumber: "" });
  }, []);

  const loadBankDetailsForProfile = async (lenderId) => {
    const userId = pickNumber(lenderId);
    if (!userId) {
      return null;
    }
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
        return mapBankProfile({
          ...legacyData,
          bankDetailsSource: legacyData.bankDetailsSource || "legacy_admin_api",
        });
      }
    } catch {
      return null;
    }
    return null;
  };

  const loadUserRepoProfile = async (lenderId) => {
    try {
      const userData = responseData(await getAdminAIUsers(1, 1, "lenders", { userId: Number(lenderId) }));
      return normalizeUserToProfile(userData?.users?.[0]);
    } catch {
      return null;
    }
  };

  const loadWalletBalance = async (lenderId) => {
    try {
      const walletData = responseData(await getAdminAIActiveLenderWallet(lenderId));
      setWalletAmount(pickNumber(walletData?.walletAmount));
    } catch {
      setWalletAmount(0);
    }

    try {
      const txData = responseData(await getAdminAIActiveLenderWalletTransactions(lenderId, 1, 1));
      setWalletTotal(pickNumber(txData?.totalCount));
    } catch {
      setWalletTotal(0);
    }
  };

  const loadWalletTransactions = async (lenderId, pageNo = 1) => {
    setWalletLoading(true);
    try {
      const txData = responseData(
        await getAdminAIActiveLenderWalletTransactions(lenderId, pageNo, walletPageSize)
      );
      setWalletTransactions(txData?.transactions || []);
      setWalletTotal(pickNumber(txData?.totalCount));
      setWalletPage(pickNumber(txData?.pageNo, pageNo) || pageNo);
    } catch {
      setWalletTransactions([]);
      setWalletTotal(0);
    } finally {
      setWalletLoading(false);
    }
  };

  const openWalletHistory = (lenderId) => {
    setWalletHistoryOpen(true);
    setWalletPage(1);
    loadWalletTransactions(lenderId, 1);
  };

  const closeWalletHistory = () => {
    setWalletHistoryOpen(false);
  };

  const resetReferralState = () => {
    setReferralRows([]);
    setReferralTotal(0);
    setReferralPage(1);
    setReferralLoading(false);
    setReferralError("");
    setReferralEarnings({ totalEarned: 0, amountPaid: 0, amountNotPaid: 0, totalInvestment: 0 });
    setPaidEarningsByDate([]);
    setProfileReferredBy(null);
    setReferralBonusModal({ open: false, title: "", rows: [] });
  };

  const applyReferralPayload = (payload, pageNo) => {
    const data = responseData(payload) || {};
    const earnings = data.earningsSummary || data.referralSummary || {};
    const rows = Array.isArray(data.referrals) ? data.referrals.map(normalizeApiReferralRow) : [];
    setReferralRows(rows);
    setReferralTotal(pickNumber(data.totalCount, rows.length));
    setReferralPage(pageNo);
    setReferralEarnings({
      totalEarned: pickNumber(earnings.refEarnings, earnings.totalEarned),
      amountPaid: pickNumber(earnings.refPaid, earnings.amountPaid),
      amountNotPaid: pickNumber(earnings.refUnpaid, earnings.amountNotPaid),
      totalInvestment: pickNumber(earnings.refAmt, earnings.totalInvestment),
    });
    setPaidEarningsByDate(Array.isArray(data.paidEarningsByDate) ? data.paidEarningsByDate : []);
    if (data.referredBy?.referrerId) {
      setProfileReferredBy(data.referredBy);
    }
    if (data.referralSummary) {
      setProfile((current) => (current ? { ...current, referralSummary: data.referralSummary, referredBy: data.referredBy || current.referredBy } : current));
    }
    if (rows.length > 0 || pickNumber(earnings.refEarnings, earnings.totalEarned) > 0) {
      setReferralError("");
    }
  };

  const loadReferralProfileData = async (lenderId, pageNo = 1) => {
    const userId = pickNumber(lenderId);
    if (!userId) {
      resetReferralState();
      return;
    }
    setReferralLoading(true);
    setReferralError("");
    try {
      const payload = await getAdminAIActiveLenderReferrals(userId, pageNo, referralPageSize);
      applyReferralPayload(payload, pageNo);
    } catch {
      try {
        const [detailsPayload, earningsPayload] = await Promise.all([
          getAdminAILenderReferenceDetails(userId, pageNo, referralPageSize),
          pageNo === 1 ? getAdminAILenderReferralEarnings(userId, 1, referralPageSize) : Promise.resolve(null),
        ]);
        const details = responseData(detailsPayload) || {};
        const bonusDeals = (row) =>
          Array.isArray(row?.lenderReferenceAmountResponse) ? row.lenderReferenceAmountResponse : [];
        const rows = Array.isArray(details.listOfLenderReferenceResponseDto)
          ? details.listOfLenderReferenceResponseDto.map((row) =>
              normalizeApiReferralRow({
                referenceId: row?.refereeId,
                refereeId: row?.refereeId,
                refereeName: row?.refereeName,
                refereeEmail: row?.refereeEmail,
                refereeMobileNumber: row?.refereeMobileNumber,
                status: row?.status,
                referredOn: row?.referredOn,
                totalEarned: row?.totalAmountEarned,
                bonusDeals: bonusDeals(row),
              })
            )
          : [];
        setReferralRows(rows);
        setReferralTotal(pickNumber(details.count, rows.length));
        setReferralPage(pageNo);
        if (earningsPayload) {
          const earnings = responseData(earningsPayload) || {};
          setReferralEarnings({
            totalEarned: pickNumber(earnings.totalAmountEarned, earnings.sumOfEarnedAmount, details.sumOfEarnedAmount),
            amountPaid: pickNumber(earnings.sumOfPaidAmount),
            amountNotPaid: pickNumber(earnings.sumOfUnpaidAmount),
            totalInvestment: 0,
          });
        }
      } catch {
        try {
          const profilePayload = responseData(await getAdminAIActiveLenderProfile(userId));
          const apiProfile = profilePayload?.profile || profilePayload;
          const rows = Array.isArray(apiProfile?.referrals)
            ? apiProfile.referrals.map(normalizeApiReferralRow)
            : [];
          if (rows.length > 0 || pickNumber(apiProfile?.referralSummary?.total) > 0) {
            setReferralRows(rows);
            setReferralTotal(pickNumber(apiProfile?.referralSummary?.total, rows.length));
            setReferralPage(pageNo);
            const summary = apiProfile?.referralSummary || {};
            setReferralEarnings({
              totalEarned: pickNumber(summary.refEarnings, summary.totalEarned),
              amountPaid: pickNumber(summary.refPaid, summary.amountPaid),
              amountNotPaid: pickNumber(summary.refUnpaid, summary.amountNotPaid),
              totalInvestment: pickNumber(summary.refAmt, summary.totalInvestment),
            });
            if (apiProfile?.referredBy?.referrerId) {
              setProfileReferredBy(apiProfile.referredBy);
            }
            setReferralError("");
            return;
          }
        } catch {
          // Continue to error state below.
        }
        setReferralRows([]);
        setReferralTotal(0);
        setReferralError("Failed to load referral details.");
      }
    } finally {
      setReferralLoading(false);
    }
  };

  const openReferralBonusModal = async (referral) => {
    const lenderId = resolveLenderUserId(profile || selectedLender);
    const refereeId = pickNumber(referral?.refereeId);
    let rows = (referral.bonusDeals || []).map(normalizeBonusDeal);
    if (!rows.length && lenderId && refereeId) {
      try {
        const payload = responseData(await getAdminAIActiveLenderReferralDeals(lenderId, refereeId));
        rows = (payload?.bonusDeals || []).map(normalizeBonusDeal);
      } catch {
        rows = [];
      }
    }
    setReferralBonusModal({
      open: true,
      title: valueOrDash(referral.refereeName),
      rows,
    });
  };

  const closeReferralBonusModal = () => {
    setReferralBonusModal({ open: false, title: "", rows: [] });
  };

  const referralTotalPages = Math.max(1, Math.ceil(referralTotal / referralPageSize));
  const referralRangeStart = referralTotal === 0 ? 0 : (referralPage - 1) * referralPageSize + 1;
  const referralRangeEnd = Math.min(referralPage * referralPageSize, referralTotal);

  const openProfile = async (lender) => {
    const lenderUserId = resolveLenderUserId(lender);
    setSelectedLender(lender);
    setView("profile");
    setProfileLoading(true);
    setProfile(lender);
    setWalletPage(1);
    setWalletHistoryOpen(false);
    setWalletTransactions([]);
    resetReferralState();
    try {
      const enriched = await fetchEnrichedLenderProfile(lenderUserId, lender, false);
      setProfile(enriched || lender);
      if (enriched?.referrals?.length) {
        setReferralRows(enriched.referrals.map(normalizeApiReferralRow));
        setReferralTotal(pickNumber(enriched.referralSummary?.total, enriched.referrals.length));
        const summary = enriched.referralSummary || {};
        setReferralEarnings({
          totalEarned: pickNumber(summary.refEarnings, summary.totalEarned),
          amountPaid: pickNumber(summary.refPaid, summary.amountPaid),
          amountNotPaid: pickNumber(summary.refUnpaid, summary.amountNotPaid),
          totalInvestment: pickNumber(summary.refAmt, summary.totalInvestment),
        });
        if (enriched.referredBy?.referrerId) {
          setProfileReferredBy(enriched.referredBy);
        }
      }
      await loadReferralProfileData(lenderUserId, 1);
    } catch {
      setProfile(lender);
    } finally {
      setProfileLoading(false);
    }

    loadWalletBalance(lenderUserId);
  };

  const openDeals = async (lender) => {
    setSelectedLender(lender);
    setView("deals");
    setDealsTab("all");
    setDealSearch({ dealId: "", dealName: "" });
    setDealsPage(1);
    setExpandedInterestDealId(null);
    setInterestBreakupOpenByDeal({});
    setInterestDetailsByDeal({});
    setInterestLoadingDealId(null);
    setDealsLoading(true);
    setDealsError("");
    setDealsData(null);
    try {
      const raw = responseData(await getAdminAIActiveLenderDeals(lender.lenderId));
      const data = await enrichLenderDeals(raw);
      const mergedProfile = await fetchEnrichedLenderProfile(lender.lenderId, mergeProfiles(lender, data.profile), false);
      setDealsData({
        ...data,
        profile: mergedProfile,
      });
      if (data.interestDetailsByDeal) {
        const allDealsList = data.allDeals?.length
          ? data.allDeals
          : [...(data.activeDeals || []), ...(data.closedDeals || [])];
        const dealById = Object.fromEntries(allDealsList.map((item) => [item.dealId, item]));
        const enrichedInterest = {};
        Object.entries(data.interestDetailsByDeal).forEach(([dealId, details]) => {
          enrichedInterest[dealId] = enrichInterestDetails(details, dealById[dealId] || dealById[Number(dealId)] || {});
        });
        setInterestDetailsByDeal(enrichedInterest);
      }
      if (mergedProfile) {
        setProfile(mergedProfile);
      }
    } catch (error) {
      setDealsError("Failed to load lender deal participation.");
    } finally {
      setDealsLoading(false);
    }
  };

  const openReferralsPortfolio = async (lender = selectedLender || profile) => {
    const lenderUserId = resolveLenderUserId(lender);
    if (!lenderUserId) {
      return;
    }
    setSelectedLender(lender);
    setProfile((current) => current || lender);
    setView("referrals");
    await loadReferralProfileData(lenderUserId, 1);
  };

  const backToProfile = () => {
    setView("profile");
  };

  const renderReferralPortfolioDetails = () => {
    if (!profile) {
      return null;
    }
    return (
      <div className="admin-ai-profile-section admin-ai-profile-section-wide admin-ai-referral-profile-section admin-ai-referral-portfolio-page">
        <div className="admin-ai-referral-section-head admin-ai-my-referrals-head">
          <h6>My Referrals Earnings Portfolio</h6>
          <span className="admin-ai-referral-count-chip">
            {fmtNum(referralCount(profile, referralTotal))} people referred
          </span>
        </div>
        {(profileReferredBy?.referrerId || profile.referredBy?.referrerId) ? (
          <div className="admin-ai-referred-by-hero">
            <small>Referred By</small>
            <div className="admin-ai-referred-by-hero-main">
              <strong>
                {formatLenderCode(
                  profileReferredBy?.referrerId || profile.referredBy?.referrerId,
                  profileReferredBy?.referrerCode || profile.referredBy?.referrerCode
                )}
              </strong>
              <span className="admin-ai-referred-by-hero-name">
                {valueOrDash(profileReferredBy?.referrerName || profile.referredBy?.referrerName)}
              </span>
            </div>
            <div className="admin-ai-referred-by-hero-meta">
              <span className={`admin-ai-referral-status-pill ${referralStatusClass(profileReferredBy?.status || profile.referredBy?.status)}`}>
                {formatReferralStatus(profileReferredBy?.status || profile.referredBy?.status)}
              </span>
              <span className="admin-ai-referred-on">
                Referred on {formatDate(profileReferredBy?.referredOn || profile.referredBy?.referredOn)}
              </span>
            </div>
          </div>
        ) : null}
        <div className="admin-ai-referral-summary-row">
          <div className="admin-ai-referral-summary-pill invited">
            <small>Invited</small>
            <strong>{fmtNum(profile.referralSummary?.invited)}</strong>
          </div>
          <div className="admin-ai-referral-summary-pill registered">
            <small>Registered</small>
            <strong>{fmtNum(profile.referralSummary?.registered)}</strong>
          </div>
          <div className="admin-ai-referral-summary-pill lent">
            <small>Lent</small>
            <strong>{fmtNum(profile.referralSummary?.lent)}</strong>
          </div>
          <div className="admin-ai-referral-summary-pill total">
            <small>Total Referrals</small>
            <strong>{fmtNum(profile.referralSummary?.total)}</strong>
          </div>
        </div>
        <div className="admin-ai-referral-earnings-hero">
          <div className="admin-ai-referral-earnings-hero-card total">
            <small>Total Earnings</small>
            <strong>{fmtInr(referralEarnings.totalEarned)}</strong>
          </div>
          <div className="admin-ai-referral-earnings-hero-card paid">
            <small>Paid Earnings</small>
            <strong>{fmtInr(referralEarnings.amountPaid)}</strong>
          </div>
          <div className="admin-ai-referral-earnings-hero-card unpaid">
            <small>Unpaid Earnings</small>
            <strong>{fmtInr(referralEarnings.amountNotPaid)}</strong>
          </div>
          <div className="admin-ai-referral-earnings-hero-card investment">
            <small>Total Investment</small>
            <strong>{fmtInr(referralEarnings.totalInvestment)}</strong>
          </div>
        </div>
        {referralEarnings.amountPaid > 0 && paidEarningsByDate.length > 0 ? (
          <div className="admin-ai-referral-paid-history">
            <div className="admin-ai-paid-history-head">
              <h6>Paid Earnings History</h6>
              <span className="admin-ai-referral-count-chip">
                {fmtNum(paidEarningsByDate.length)} payment{paidEarningsByDate.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="admin-ai-paid-earnings-list">
              {paidEarningsByDate.map((item, index) => (
                <div className="admin-ai-paid-earnings-card" key={`${item.paidDate}-${index}`}>
                  <div className="admin-ai-paid-earnings-card-main">
                    <div className="admin-ai-paid-earnings-field date">
                      <small>Paid Date</small>
                      <strong>{formatDate(item.paidDate)}</strong>
                    </div>
                    <div className="admin-ai-paid-earnings-field status">
                      <small>Status</small>
                      <span className="admin-ai-referral-status-pill paid">
                        {valueOrDash(item.paymentStatus)}
                      </span>
                    </div>
                    <div className="admin-ai-paid-earnings-field referees">
                      <small>Referees</small>
                      <strong>{fmtNum(item.refereeCount)}</strong>
                    </div>
                    <div className="admin-ai-paid-earnings-field ids">
                      <small>Referee IDs</small>
                      <span className="admin-ai-paid-earnings-ids">
                        {(() => {
                          const ids = String(item.refereeIds || "")
                            .split(",")
                            .map((id) => id.trim())
                            .filter(Boolean);
                          if (!ids.length) return "-";
                          return ids.map((id) => (
                            <span className="admin-ai-paid-earnings-id-chip" key={id}>
                              {formatLenderCode(id)}
                            </span>
                          ));
                        })()}
                      </span>
                    </div>
                    <div className="admin-ai-paid-earnings-field amount">
                      <small>Paid Amount</small>
                      <strong>{fmtInr(item.paidAmount)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : referralEarnings.amountPaid <= 0 ? (
          <div className="admin-ai-referral-no-paid-note">
            No paid referral earnings yet — bonuses are still unpaid in the system.
          </div>
        ) : null}
        {referralError ? (
          <div className="admin-ai-empty-state compact admin-ai-error-text">{referralError}</div>
        ) : null}
        {referralLoading ? (
          <div className="admin-ai-empty-state compact">Loading referral details...</div>
        ) : referralRows.length > 0 ? (
          <>
            <div className="admin-ai-referee-section-head">
              <div>
                <h6>Referee Persons</h6>
                <small>People you referred — status, contact, and earnings per person</small>
              </div>
              <span className="admin-ai-referral-count-chip">
                {fmtNum(referralTotal)} total
              </span>
            </div>
            <div className="admin-ai-referee-card-grid">
              {referralRows.map((referral) => (
                <div
                  className={`admin-ai-referee-card ${referralStatusClass(referral.status)}`}
                  key={referral.referenceId || `${referral.refereeId}-${referral.refereeEmail}`}
                >
                  <div className="admin-ai-referee-card-head">
                    <div className="admin-ai-referee-card-identity">
                      <strong>{valueOrDash(referral.refereeName)}</strong>
                      <span>
                        {referral.refereeId
                          ? formatLenderCode(referral.refereeId)
                          : "Not registered yet"}
                      </span>
                    </div>
                    <span className={`admin-ai-referral-status-pill ${referralStatusClass(referral.status)}`}>
                      {formatReferralStatus(referral.status)}
                    </span>
                  </div>
                  <div className="admin-ai-referee-card-contact">
                    <div>
                      <small>Email</small>
                      <span>{valueOrDash(referral.refereeEmail)}</span>
                    </div>
                    <div>
                      <small>Mobile</small>
                      <span>{valueOrDash(referral.refereeMobileNumber)}</span>
                    </div>
                    <div>
                      <small>Referred On</small>
                      <span>{formatDate(referral.referredOn)}</span>
                    </div>
                  </div>
                  <div className="admin-ai-referee-card-stats">
                    <div className="admin-ai-referee-stat earned">
                      <small>Earned</small>
                      <strong>{fmtInr(referralEarnedAmount(referral))}</strong>
                    </div>
                    <div className="admin-ai-referee-stat paid">
                      <small>Paid</small>
                      <strong>{fmtInr(referral.amountPaid)}</strong>
                    </div>
                    <div className="admin-ai-referee-stat unpaid">
                      <small>Unpaid</small>
                      <strong>{fmtInr(referralUnpaidAmount(referral))}</strong>
                    </div>
                    <div className="admin-ai-referee-stat investment">
                      <small>Investment</small>
                      <strong>{fmtInr(referral.totalInvestment)}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="admin-ai-referee-view-btn"
                    onClick={() => openReferralBonusModal(referral)}
                  >
                    View Referee Deals
                  </button>
                </div>
              ))}
            </div>
            <div className="admin-ai-referral-legacy-toolbar">
              <span>
                Showing {fmtNum(referralRangeStart)} to {fmtNum(referralRangeEnd)} of {fmtNum(referralTotal)} referees
              </span>
              {referralTotalPages > 1 ? (
                <div className="admin-ai-referral-pagination">
                  <button
                    type="button"
                    disabled={referralPage <= 1 || referralLoading}
                    onClick={() => loadReferralProfileData(profile.lenderId, referralPage - 1)}
                  >
                    {"<"}
                  </button>
                  <span>{referralPage}</span>
                  <button
                    type="button"
                    disabled={referralPage >= referralTotalPages || referralLoading}
                    onClick={() => loadReferralProfileData(profile.lenderId, referralPage + 1)}
                  >
                    {">"}
                  </button>
                </div>
              ) : null}
            </div>
          </>
        ) : referralCount(profile, referralTotal) > 0 ? (
          <div className="admin-ai-empty-state compact">No referral rows found on this page.</div>
        ) : (
          <div className="admin-ai-empty-state compact">No referrals found for this lender.</div>
        )}
      </div>
    );
  };

  const backToList = () => {
    setView("list");
    setSelectedLender(null);
    setProfile(null);
    resetReferralState();
    setDealsData(null);
    setDealSearch({ dealId: "", dealName: "" });
    setDealsPage(1);
    setExpandedInterestDealId(null);
    setInterestBreakupOpenByDeal({});
    setInterestDetailsByDeal({});
    setInterestLoadingDealId(null);
    setDealsError("");
  };

  const toggleInterestDetails = async (deal) => {
    const dealId = deal.dealId;
    const lenderId = selectedLender?.lenderId || dealsData?.profile?.lenderId;
    if (!lenderId || !dealId) {
      return;
    }
    if (expandedInterestDealId === dealId) {
      setExpandedInterestDealId(null);
      return;
    }
    setExpandedInterestDealId(dealId);

    const cached = resolveInterestDetails(dealId, dealsData, interestDetailsByDeal);
    if (cached?.paidReturns?.length || pickNumber(cached?.totalPaidInterest) > 0 || cached?.interestPaymentHistory?.length) {
      setInterestDetailsByDeal((current) => ({ ...current, [dealId]: enrichInterestDetails(cached, deal) }));
      return;
    }

    if (!cached) {
      setInterestDetailsByDeal((current) => ({ ...current, [dealId]: buildLocalInterestDetails(deal) }));
    } else {
      setInterestDetailsByDeal((current) => ({ ...current, [dealId]: enrichInterestDetails(cached, deal) }));
      return;
    }

    setInterestLoadingDealId(dealId);
    try {
      const data = responseData(await getAdminAIActiveLenderDealInterestDetails(lenderId, dealId));
      if (data) {
        setInterestDetailsByDeal((current) => ({ ...current, [dealId]: enrichInterestDetails(data, deal) }));
      }
    } catch {
      try {
        const earnings = responseData(await getAdminAIMonthlyInterestEarnings(lenderId));
        const fallback = mapInterestEarningsFallback(earnings, deal);
        if (fallback.paidReturns?.length) {
          setInterestDetailsByDeal((current) => ({ ...current, [dealId]: fallback }));
        }
      } catch {
        // Keep local fallback already shown.
      }
    } finally {
      setInterestLoadingDealId(null);
    }
  };

  const searchLenders = (event) => {
    event.preventDefault();
    loadLenders(1, search);
  };

  const resetSearch = () => {
    const empty = { lenderId: "", mobileNumber: "" };
    setSearch(empty);
    loadLenders(1, empty);
  };

  const clearSearchField = (fieldName) => {
    const next = { ...search, [fieldName]: "" };
    setSearch(next);
    loadLenders(1, next);
  };

  const visibleDeals = () => {
    if (!dealsData) {
      return [];
    }
    if (dealsTab === "active") {
      return dealsData.activeDeals || [];
    }
    if (dealsTab === "closed") {
      return dealsData.closedDeals || [];
    }
    if (dealsTab === "withdraw") {
      return dealsData.withdrawDeals || [];
    }
    return dealsData.allDeals || [];
  };

  const dealCounts = {
    all: dealsData?.allDeals?.length || 0,
    active: dealsData?.activeDeals?.length || 0,
    closed: dealsData?.closedDeals?.length || 0,
    withdraw: dealsData?.withdrawDeals?.length || 0,
  };

  const dealAmounts = useMemo(
    () => ({
      all: sumDealParticipationAmount(dealsData?.allDeals),
      active: sumDealParticipationAmount(dealsData?.activeDeals),
      closed: sumDealParticipationAmount(dealsData?.closedDeals),
      withdraw: sumWithdrawDealAmount(dealsData?.withdrawDeals),
    }),
    [dealsData]
  );

  const filteredDealsList = useMemo(() => {
    const tabDeals = visibleDeals();
    const idQuery = String(dealSearch.dealId || "").replace("#", "").trim();
    const nameQuery = String(dealSearch.dealName || "").trim().toLowerCase();
    return tabDeals.filter((deal) => {
      if (idQuery && !String(deal.dealId).includes(idQuery)) {
        return false;
      }
      if (nameQuery && !String(deal.dealName || "").toLowerCase().includes(nameQuery)) {
        return false;
      }
      return true;
    });
  }, [dealsData, dealsTab, dealSearch]);

  const dealsTotal = filteredDealsList.length;
  const dealsTotalPages = Math.max(1, Math.ceil(dealsTotal / dealsPageSize));
  const paginatedDeals = filteredDealsList.slice((dealsPage - 1) * dealsPageSize, dealsPage * dealsPageSize);

  useEffect(() => {
    setDealsPage(1);
  }, [dealsTab, dealSearch.dealId, dealSearch.dealName]);

  const statusClass = (status, deal) => {
    if (deal?.hasLenderWithdraw || deal?.lenderDealStatus === "LENDER_WITHDRAW" || String(deal?.displayStatus || "").toLowerCase().includes("withdraw")) {
      return "withdraw";
    }
    const value = String(status || deal?.displayStatus || "").toUpperCase();
    if (value.includes("NOTYET")) {
      return "open";
    }
    if (value.includes("CLOSED") || value.includes("WITHDRAW")) {
      return "closed";
    }
    return "neutral";
  };

  const statusLabel = (status, deal) => {
    if (deal?.hasLenderWithdraw || deal?.lenderDealStatus === "LENDER_WITHDRAW" || String(deal?.displayStatus || "").toLowerCase().includes("withdraw")) {
      return "Lender Withdraw";
    }
    const value = String(status || deal?.displayStatus || "").toUpperCase();
    if (value.includes("NOTYET")) {
      return "Not Yet Closed";
    }
    if (value.includes("CLOSED")) {
      return "Closed";
    }
    return valueOrDash(status || deal?.displayStatus);
  };

  const clearDealSearchField = (fieldName) => {
    setDealSearch((current) => ({ ...current, [fieldName]: "" }));
  };

  const resetDealSearch = () => {
    setDealSearch({ dealId: "", dealName: "" });
  };

  const ProfileRow = ({ label, value, copyable, mailLink }) => (
    <div className="admin-ai-profile-row">
      <span className="admin-ai-profile-row-label">{label}</span>
      <div className="admin-ai-profile-row-value">
        {mailLink ? (
          <a className="admin-ai-gmail-link" href={mailLink} target="_blank" rel="noreferrer">
            {valueOrDash(value)}
          </a>
        ) : (
          <strong>{valueOrDash(value)}</strong>
        )}
        {copyable && value && value !== "-" ? (
          <button className="admin-ai-icon-copy" type="button" onClick={() => copyText(label, value)} title={`Copy ${label}`}>
            <FaCopy />
          </button>
        ) : null}
      </div>
    </div>
  );

  const ContactCell = ({ type, value }) => {
    const text = valueOrDash(value);
    if (text === "-") {
      return <span>-</span>;
    }
    const isEmail = type === "email";
    return (
      <div className="admin-ai-contact-cell">
        {isEmail ? (
          <a className="admin-ai-gmail-link" href={gmailUrl(text)} target="_blank" rel="noreferrer" title="Open in Gmail">
            <FaEnvelope /> {text}
          </a>
        ) : (
          <span className="admin-ai-contact-text"><FaPhone /> {text}</span>
        )}
        <button className="admin-ai-icon-copy" type="button" onClick={() => copyText(isEmail ? "Email" : "Mobile", text)} title={`Copy ${isEmail ? "email" : "mobile"}`}>
          <FaCopy />
        </button>
      </div>
    );
  };

  const BankDetailsCell = ({ lender }) => {
    const bankName = valueOrDash(lender?.bankName);
    const accountNumber = valueOrDash(lender?.accountNumber);
    const ifscCode = valueOrDash(lender?.ifscCode);
    const branchName = valueOrDash(lender?.branchName);
    if (bankName === "-" && accountNumber === "-" && ifscCode === "-") {
      return <span className="admin-ai-bank-empty">-</span>;
    }
    return (
      <div className="admin-ai-bank-details-cell">
        <strong>{bankName}</strong>
        {accountNumber !== "-" ? <span>A/C {accountNumber}</span> : null}
        {ifscCode !== "-" ? <span>IFSC {ifscCode}</span> : null}
        {branchName !== "-" ? <span>{branchName}</span> : null}
      </div>
    );
  };

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid admin-ai-page">
          {copyNotice ? <div className="admin-ai-copy-toast">{copyNotice}</div> : null}

          <section className="admin-ai-hero admin-ai-hero-glow">
            <div>
              <span className="admin-ai-pill"><FaRobot /> AI Operations</span>
              <h2>All Active Lenders</h2>
              <p className="admin-ai-subtitle">
                Active lenders with participation amounts, deal history, and personal profile details.
              </p>
            </div>
            <strong>Admin / AI Dashboard / Active Lenders</strong>
          </section>

          {view === "list" && (
            <>
              <div className="admin-ai-summary-bar">
                <div className="admin-ai-summary-card admin-ai-summary-card-glow">
                  <FaUsers />
                  <div>
                    <span>Total Active Lenders</span>
                    <strong>{fmtNum(totalLenders || total)}</strong>
                  </div>
                </div>
                <button className="admin-ai-close-btn" type="button" onClick={() => navigate("/adminAIDashboard")}>
                  Back to Dashboard
                </button>
              </div>

              <section className="admin-ai-panel admin-ai-panel-premium">
                <div className="admin-ai-panel-head">
                  <div>
                    <h5>Active Lender Directory</h5>
                    <p>Click lender name or ID for personal details. Click the deals badge to open full deal participation.</p>
                  </div>
                  <div className="admin-ai-panel-actions">
                    <button
                      className="admin-ai-search-btn"
                      type="button"
                      onClick={downloadActiveLendersExcel}
                      disabled={exportingLenders}
                    >
                      <FaFileExcel /> {exportingLenders ? "Preparing Excel..." : "Download Excel"}
                    </button>
                    <span className="admin-ai-count-pill">{fmtNum(total)} lenders</span>
                  </div>
                </div>

                <div className="admin-ai-unified-search-panel">
                  <form className="admin-ai-search-grid admin-ai-search-grid-clear admin-ai-search-grid-unified" onSubmit={searchLenders}>
                    <label>
                      Lender ID
                      <div className="admin-ai-input-wrap">
                        <input
                          value={search.lenderId}
                          placeholder="Example: 41389"
                          onChange={(e) => setSearch({ ...search, lenderId: e.target.value })}
                        />
                        {search.lenderId ? (
                          <button className="admin-ai-clear-field" type="button" onClick={() => clearSearchField("lenderId")} title="Clear lender ID">
                            <FaTimes /> Clear
                          </button>
                        ) : null}
                      </div>
                    </label>
                    <label>
                      Mobile Number
                      <div className="admin-ai-input-wrap">
                        <input
                          value={search.mobileNumber}
                          placeholder="Search by mobile"
                          onChange={(e) => setSearch({ ...search, mobileNumber: e.target.value })}
                        />
                        {search.mobileNumber ? (
                          <button className="admin-ai-clear-field" type="button" onClick={() => clearSearchField("mobileNumber")} title="Clear mobile number">
                            <FaTimes /> Clear
                          </button>
                        ) : null}
                      </div>
                    </label>
                    <div className="admin-ai-unified-search-actions">
                      <button className="admin-ai-search-btn" type="submit">Search</button>
                      <button className="admin-ai-reset-btn" type="button" onClick={resetSearch}>Clear All</button>
                    </div>
                  </form>
                </div>

                {listError && <div className="alert alert-danger">{listError}</div>}
                {loading && <div className="admin-ai-empty-state">Loading active lenders...</div>}

                {!loading && (
                  <div className="admin-ai-advanced-table-wrap">
                    <table className="admin-ai-advanced-table admin-ai-lender-table">
                      <thead>
                        <tr>
                          <th>Lender ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Mobile</th>
                          <th>Location</th>
                          <th>Bank Details</th>
                          <th>Deals</th>
                          <th>Total Participation Amount</th>
                          <th>Last Active</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lenders.length === 0 && (
                          <tr>
                            <td colSpan={10} className="admin-ai-empty-cell">No active lenders found.</td>
                          </tr>
                        )}
                        {lenders.map((lender) => (
                          <tr key={lender.lenderId}>
                            <td>
                              <button
                                className="admin-ai-lender-id-badge"
                                type="button"
                                title="Open lender profile"
                                onClick={() => openProfile(lender)}
                              >
                                {formatLenderCode(lender.lenderId, lender.userCode)}
                              </button>
                            </td>
                            <td>
                              <button className="admin-ai-link-btn admin-ai-name-text" type="button" onClick={() => openProfile(lender)}>
                                {valueOrDash(lender.name)}
                              </button>
                            </td>
                            <td><ContactCell type="email" value={lender.email} /></td>
                            <td><ContactCell type="mobile" value={lender.mobileNumber} /></td>
                            <td>
                              <div className="admin-ai-location-cell">
                                <strong>{valueOrDash(lender.city)}</strong>
                                <span>{valueOrDash(lender.state)} {lender.pincode ? `· ${lender.pincode}` : ""}</span>
                              </div>
                            </td>
                            <td><BankDetailsCell lender={lender} /></td>
                            <td>
                              <button className="admin-ai-deals-badge" type="button" onClick={() => openDeals(lender)}>
                                <span className="admin-ai-deals-badge-count">{fmtNum(lender.dealsCount)}</span>
                                <span className="admin-ai-deals-badge-label">Deals</span>
                              </button>
                            </td>
                            <td>
                              <span className="admin-ai-total-participation-list">{fmtMoney(totalParticipation(lender))}</span>
                            </td>
                            <td>{formatDate(lender.lastParticipationOn)}</td>
                            <td>
                              <div className="admin-ai-row-actions">
                                <button className="admin-ai-action-btn" type="button" onClick={() => openDeals(lender)}>
                                  View Deals
                                </button>
                                <button className="admin-ai-mini-btn profile" type="button" onClick={() => openProfile(lender)}>
                                  <FaUserCircle /> Profile
                                </button>
                              </div>
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
                  onPrevious={() => loadLenders(page - 1, search)}
                  onNext={() => loadLenders(page + 1, search)}
                />
              </section>
            </>
          )}

          {view === "profile" && (
            <section className="admin-ai-panel admin-ai-panel-premium admin-ai-profile-panel">
              <div className="admin-ai-panel-head">
                <div>
                  <h5><FaIdCard /> Lender Personal Details</h5>
                  <p>Full profile for active lender {formatLenderCode(profile?.lenderId || selectedLender?.lenderId, profile?.userCode || selectedLender?.userCode)}</p>
                </div>
                <div className="admin-ai-panel-actions">
                  <button className="admin-ai-close-btn" type="button" onClick={backToList}>
                    <FaArrowLeft /> Back to Lenders
                  </button>
                  <button className="admin-ai-search-btn" type="button" onClick={() => openDeals(selectedLender)}>
                    <FaHandshake /> View Deals
                  </button>
                  <button className="admin-ai-search-btn" type="button" onClick={() => openReferralsPortfolio(selectedLender || profile)}>
                    <FaUsers /> Referrals Portfolio
                  </button>
                </div>
              </div>

              {profileLoading && <div className="admin-ai-empty-state">Loading personal details...</div>}

              {!profileLoading && profile && (
                <>
                  <div className="admin-ai-profile-hero admin-ai-profile-hero-magic">
                    <div className="admin-ai-profile-identity">
                      <div className="admin-ai-profile-avatar">{profileInitials(profile.name)}</div>
                      <div>
                        <span className="admin-ai-lender-tag">Active Lender</span>
                        <h4>
                          {valueOrDash(profile.name)}
                          <span className="admin-ai-profile-id">{formatLenderCode(profile.lenderId, profile.userCode)}</span>
                        </h4>
                        <div className="admin-ai-profile-quick-links">
                          <button className="admin-ai-link-btn admin-ai-lender-name-btn" type="button" onClick={() => openDeals(selectedLender || profile)}>
                            <FaHandshake /> View Deals
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="admin-ai-profile-stats-row">
                      <div className="admin-ai-profile-stat-card wallet">
                        <small><FaWallet /> Wallet Balance</small>
                        <strong>{fmtMoney(walletAmount)}</strong>
                      </div>
                      <button
                        className="admin-ai-profile-stat-card history"
                        type="button"
                        title="View credit and debit history from lender transaction history"
                        onClick={() => openWalletHistory(profile.lenderId)}
                      >
                        <small>Transaction History</small>
                        <strong>{fmtNum(walletTotal)}</strong>
                        <span>Click to open</span>
                      </button>
                      <div className="admin-ai-profile-stat-card participation">
                        <small>Total Participation</small>
                        <strong>{fmtMoney(totalParticipation(profile))}</strong>
                      </div>
                      <button
                        className="admin-ai-profile-stat-card deals"
                        type="button"
                        title="View deal participation and amounts"
                        onClick={() => openDeals(selectedLender || profile)}
                      >
                        <small>Deals</small>
                        <strong>{fmtNum(profile.dealsCount)}</strong>
                        <span>View deals</span>
                      </button>
                    </div>
                    <div className="admin-ai-profile-stats-row returns">
                      <div className="admin-ai-profile-stat-card interest">
                        <small><FaChartLine /> Total Interest Earned</small>
                        <strong>{fmtMoney(pickNumber(profile.totalInterestEarned))}</strong>
                        <span>{fmtNum(profile.interestEarnedCount)} interest payments</span>
                      </div>
                      <div className="admin-ai-profile-stat-card principal">
                        <small><FaMoneyBillWave /> Total Principal Amount</small>
                        <strong>{fmtMoney(pickNumber(profile.totalPrincipalAmount))}</strong>
                        <span>Principal returned to lender</span>
                      </div>
                      <div className="admin-ai-profile-stat-card withdraw">
                        <small><FaSignOutAlt /> Total Withdraw Amount</small>
                        <strong>{fmtMoney(pickNumber(profile.totalWithdrawAmount))}</strong>
                        <span>Approved and initiated withdrawals</span>
                      </div>
                    </div>
                  </div>

                  <div className="admin-ai-profile-section admin-ai-profile-section-wide admin-ai-referral-portfolio-entry-section">
                    <button
                      type="button"
                      className="admin-ai-referral-portfolio-entry"
                      onClick={() => openReferralsPortfolio(profile)}
                    >
                      <div className="admin-ai-referral-portfolio-entry-top">
                        <div className="admin-ai-referral-portfolio-entry-icon">
                          <FaUsers />
                        </div>
                        <div className="admin-ai-referral-portfolio-entry-copy">
                          <h6>My Referrals Earnings Portfolio</h6>
                          <p>View referral counts, bonus earnings, paid history, and each referee in detail</p>
                        </div>
                        <span className="admin-ai-referral-portfolio-entry-cta">Open portfolio</span>
                      </div>
                      <div className="admin-ai-referral-portfolio-entry-stats">
                        <div className="admin-ai-referral-portfolio-mini-stat">
                          <small>Total Referrals</small>
                          <strong>{fmtNum(referralCount(profile, referralTotal))}</strong>
                        </div>
                        <div className="admin-ai-referral-portfolio-mini-stat earned">
                          <small>Total Earnings</small>
                          <strong>{fmtInr(referralEarnings.totalEarned)}</strong>
                        </div>
                        <div className="admin-ai-referral-portfolio-mini-stat paid">
                          <small>Paid</small>
                          <strong>{fmtInr(referralEarnings.amountPaid)}</strong>
                        </div>
                        <div className="admin-ai-referral-portfolio-mini-stat unpaid">
                          <small>Unpaid</small>
                          <strong>{fmtInr(referralEarnings.amountNotPaid)}</strong>
                        </div>
                        <div className="admin-ai-referral-portfolio-mini-stat investment">
                          <small>Investment</small>
                          <strong>{fmtInr(referralEarnings.totalInvestment)}</strong>
                        </div>
                      </div>
                      {(profileReferredBy?.referrerId || profile.referredBy?.referrerId) ? (
                        <div className="admin-ai-referral-portfolio-entry-referred-by">
                          <small>Referred by</small>
                          <span>
                            {formatLenderCode(
                              profileReferredBy?.referrerId || profile.referredBy?.referrerId,
                              profileReferredBy?.referrerCode || profile.referredBy?.referrerCode
                            )}{" "}
                            · {valueOrDash(profileReferredBy?.referrerName || profile.referredBy?.referrerName)}
                          </span>
                        </div>
                      ) : null}
                    </button>
                  </div>

                  {(profile.interestEarnedHistory || []).length > 0 ? (
                    <div className="admin-ai-profile-section admin-ai-profile-section-wide admin-ai-interest-earned-section">
                      <h6>Interest Earned History</h6>
                      <div className="admin-ai-interest-earned-table-wrap">
                        <table className="admin-ai-advanced-table">
                          <thead>
                            <tr>
                              <th>Deal ID</th>
                              <th>Deal Name</th>
                              <th>Paid Date</th>
                              <th>Type</th>
                              <th>Status</th>
                              <th>Amount</th>
                              <th>Source</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(profile.interestEarnedHistory || []).map((item, index) => (
                              <tr key={`${item.dealId}-${item.paidDate}-${index}`}>
                                <td>{item.dealId || "-"}</td>
                                <td>{valueOrDash(item.dealName)}</td>
                                <td>{formatDate(item.paidDate || item.actualDate)}</td>
                                <td>{formatReturnAmountType(item.amountType)}</td>
                                <td>{valueOrDash(item.status)}</td>
                                <td>{fmtMoney(pickNumber(item.amount))}</td>
                                <td>{valueOrDash(item.sourceTable)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : null}

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
                        <ProfileRow label="Lender Group ID" value={formatLenderGroup(profile)} />
                        <ProfileRow label="Lender Type" value={formatLenderType(profile.lenderType || profile.primaryType)} />
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
                        {profile.bankDetailsSource ? (
                          <ProfileRow label="Data Source" value={profile.bankDetailsSource} />
                        ) : null}
                        {profile.bankDetailsUpdatedOn ? (
                          <ProfileRow label="Last Updated" value={formatDate(profile.bankDetailsUpdatedOn)} />
                        ) : null}
                      </div>
                    </div>
                    {profile.personalReferences && Object.keys(profile.personalReferences).length > 0 ? (
                      <div className="admin-ai-profile-section admin-ai-profile-section-wide">
                        <h6>Personal References</h6>
                        <div className="admin-ai-profile-table">
                          {Object.entries(profile.personalReferences).map(([key, value]) => (
                            <ProfileRow key={key} label={key.replace(/reference/i, "Reference ")} value={value} copyable />
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {walletHistoryOpen ? (
                    <div className="admin-ai-wallet-modal" onClick={closeWalletHistory} role="presentation">
                      <div
                        className="admin-ai-wallet-modal-panel"
                        onClick={(event) => event.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Wallet transaction history"
                      >
                        <div className="admin-ai-wallet-modal-head">
                          <div>
                            <h5><FaWallet /> Lender Transaction History</h5>
                            <p>
                              {formatLenderCode(profile.lenderId, profile.userCode)} · {fmtNum(walletTotal)} records from lender transaction history ·
                              Current balance {fmtMoney(walletAmount)}
                            </p>
                          </div>
                          <button className="admin-ai-wallet-modal-close" type="button" onClick={closeWalletHistory} aria-label="Close">
                            <FaTimes />
                          </button>
                        </div>

                        {walletLoading ? (
                          <div className="admin-ai-empty-state">Loading wallet transactions...</div>
                        ) : null}

                        {!walletLoading && walletTransactions.length === 0 ? (
                          <div className="admin-ai-empty-state">No transaction history found for this lender.</div>
                        ) : null}

                        {!walletLoading && walletTransactions.length > 0 ? (
                          <>
                            <div className="admin-ai-table-wrap">
                              <table className="admin-ai-lender-table admin-ai-wallet-table admin-ai-wallet-table-magic">
                                <thead>
                                  <tr>
                                    <th>Paid Date</th>
                                    <th>Credit / Debit</th>
                                    <th>Sub Type</th>
                                    <th>Amount</th>
                                    <th>Previous Balance</th>
                                    <th>Current Balance</th>
                                    <th>Deal</th>
                                    <th>Remarks</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {walletTransactions.map((tx) => {
                                    const isCredit = isCreditTx(tx);
                                    return (
                                      <tr key={tx.transactionId} className={isCredit ? "credit-row" : "debit-row"}>
                                        <td>{formatDate(txPaidDate(tx))}</td>
                                        <td>
                                          <span className={`admin-ai-wallet-type ${String(txTypeValue(tx) || "").toLowerCase()}`}>
                                            {walletTypeLabel(txTypeValue(tx))}
                                          </span>
                                        </td>
                                        <td>{valueOrDash(tx.amountSubType)}</td>
                                        <td>
                                          <span className={`admin-ai-wallet-amount ${isCredit ? "credit" : "debit"}`}>
                                            {isCredit ? "+" : "-"}
                                            {fmtMoney(txAmountValue(tx))}
                                          </span>
                                        </td>
                                        <td>{fmtMoney(pickNumber(tx.previousBalance))}</td>
                                        <td>{fmtMoney(pickNumber(tx.currentAmount))}</td>
                                        <td>{tx.dealId ? `#${tx.dealId}` : "-"}</td>
                                        <td>{valueOrDash(tx.remarks)}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                            <Pager
                              page={walletPage}
                              pageSize={walletPageSize}
                              total={walletTotal}
                              loading={walletLoading}
                              onPrevious={() => loadWalletTransactions(profile.lenderId, walletPage - 1)}
                              onNext={() => loadWalletTransactions(profile.lenderId, walletPage + 1)}
                            />
                          </>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </section>
          )}

          {view === "referrals" && (
            <section className="admin-ai-panel admin-ai-panel-premium admin-ai-referral-portfolio-panel">
              <div className="admin-ai-panel-head">
                <div>
                  <h5><FaUsers /> My Referrals Earnings Portfolio</h5>
                  <p>
                    Detailed referral earnings, paid history, and referee persons for{" "}
                    {formatLenderCode(profile?.lenderId || selectedLender?.lenderId, profile?.userCode || selectedLender?.userCode)}{" "}
                    {valueOrDash(profile?.name || selectedLender?.name)}
                  </p>
                </div>
                <div className="admin-ai-panel-actions">
                  <button className="admin-ai-close-btn" type="button" onClick={backToProfile}>
                    <FaArrowLeft /> Back to Profile
                  </button>
                  <button className="admin-ai-close-btn" type="button" onClick={backToList}>
                    Back to Lenders
                  </button>
                </div>
              </div>

              {profile ? renderReferralPortfolioDetails() : (
                <div className="admin-ai-empty-state">Loading referral portfolio...</div>
              )}
            </section>
          )}

          {view === "deals" && (
            <section className="admin-ai-panel admin-ai-panel-premium admin-ai-deals-panel">
              <div className="admin-ai-panel-head">
                <div>
                  <h5>Deal Participation</h5>
                  <p>Deal-wise participation and status for this active lender.</p>
                </div>
                <div className="admin-ai-panel-actions">
                  <button className="admin-ai-close-btn" type="button" onClick={backToList}>
                    <FaArrowLeft /> Back to Lenders
                  </button>
                  <button className="admin-ai-search-btn" type="button" onClick={() => openProfile(selectedLender)}>
                    View Profile
                  </button>
                </div>
              </div>

              {(dealsData?.profile || selectedLender) && (
                <div className="admin-ai-inline-profile admin-ai-inline-profile-rich">
                  <div className="admin-ai-lender-identity">
                    <span className="admin-ai-lender-tag">Active Lender</span>
                    <button className="admin-ai-link-btn admin-ai-lender-name-btn" type="button" onClick={() => openProfile(dealsData?.profile || selectedLender)}>
                      {formatLenderCode((dealsData?.profile || selectedLender)?.lenderId, (dealsData?.profile || selectedLender)?.userCode)} {valueOrDash((dealsData?.profile || selectedLender)?.name)}
                    </button>
                  </div>
                  <ContactCell type="email" value={(dealsData?.profile || selectedLender)?.email} />
                  <ContactCell type="mobile" value={(dealsData?.profile || selectedLender)?.mobileNumber} />
                  <div className="admin-ai-total-participation-hero admin-ai-total-participation-hero-xl">
                    <small>Total Participation Amount</small>
                    <strong>{fmtMoney(totalParticipation(dealsData?.profile || selectedLender))}</strong>
                  </div>
                </div>
              )}

              <div className="admin-ai-deal-filter-grid">
                <button type="button" className={`admin-ai-deal-filter-box all ${dealsTab === "all" ? "active" : ""}`} onClick={() => setDealsTab("all")}>
                  <span className="admin-ai-deal-filter-label">All Deals</span>
                  <strong>{fmtNum(dealCounts.all)}</strong>
                  <span className="admin-ai-deal-filter-amount">{fmtMoney(dealAmounts.all)}</span>
                  <small>Complete participation history</small>
                </button>
                <button type="button" className={`admin-ai-deal-filter-box active-tab ${dealsTab === "active" ? "active" : ""}`} onClick={() => setDealsTab("active")}>
                  <span className="admin-ai-deal-filter-label">Active Deals</span>
                  <strong>{fmtNum(dealCounts.active)}</strong>
                  <span className="admin-ai-deal-filter-amount">{fmtMoney(dealAmounts.active)}</span>
                  <small>Open deals not yet closed</small>
                </button>
                <button type="button" className={`admin-ai-deal-filter-box closed-tab ${dealsTab === "closed" ? "active" : ""}`} onClick={() => setDealsTab("closed")}>
                  <span className="admin-ai-deal-filter-label">Closed Deals</span>
                  <strong>{fmtNum(dealCounts.closed)}</strong>
                  <span className="admin-ai-deal-filter-amount">{fmtMoney(dealAmounts.closed)}</span>
                  <small>Completed deal records</small>
                </button>
                <button type="button" className={`admin-ai-deal-filter-box withdraw-tab ${dealsTab === "withdraw" ? "active" : ""}`} onClick={() => setDealsTab("withdraw")}>
                  <span className="admin-ai-deal-filter-label">Lender Withdraw</span>
                  <strong>{fmtNum(dealCounts.withdraw)}</strong>
                  <span className="admin-ai-deal-filter-amount">{fmtMoney(dealAmounts.withdraw)}</span>
                  <small>Approved early exit from deal</small>
                </button>
              </div>

              <div className="admin-ai-unified-search-panel">
                <form
                  className="admin-ai-search-grid admin-ai-search-grid-clear admin-ai-search-grid-unified admin-ai-deal-search-grid"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setDealsPage(1);
                  }}
                >
                  <label>
                    Deal ID
                    <div className="admin-ai-input-wrap">
                      <input
                        value={dealSearch.dealId}
                        placeholder="1289 or #1289"
                        onChange={(e) => setDealSearch({ ...dealSearch, dealId: e.target.value })}
                      />
                      {dealSearch.dealId ? (
                        <button className="admin-ai-clear-field" type="button" onClick={() => clearDealSearchField("dealId")}>
                          <FaTimes /> Clear
                        </button>
                      ) : null}
                    </div>
                  </label>
                  <label>
                    Deal Name
                    <div className="admin-ai-input-wrap">
                      <input
                        value={dealSearch.dealName}
                        placeholder="Search by deal name"
                        onChange={(e) => setDealSearch({ ...dealSearch, dealName: e.target.value })}
                      />
                      {dealSearch.dealName ? (
                        <button className="admin-ai-clear-field" type="button" onClick={() => clearDealSearchField("dealName")}>
                          <FaTimes /> Clear
                        </button>
                      ) : null}
                    </div>
                  </label>
                  <div className="admin-ai-unified-search-actions">
                    <button className="admin-ai-search-btn" type="submit">Search</button>
                    <button className="admin-ai-reset-btn" type="button" onClick={resetDealSearch}>Clear All</button>
                  </div>
                </form>
              </div>

              {!dealsLoading && dealsTotal > dealsPageSize && (
                <Pager
                  page={dealsPage}
                  pageSize={dealsPageSize}
                  total={dealsTotal}
                  loading={dealsLoading}
                  onPrevious={() => setDealsPage((current) => Math.max(1, current - 1))}
                  onNext={() => setDealsPage((current) => Math.min(dealsTotalPages, current + 1))}
                />
              )}

              {dealsLoading && <div className="admin-ai-empty-state">Loading deal participation...</div>}
              {dealsError && <div className="alert alert-danger">{dealsError}</div>}

              {!dealsLoading && (
                <div className="admin-ai-advanced-table-wrap admin-ai-deals-table-wrap admin-ai-deals-table-premium">
                  <table className="admin-ai-advanced-table admin-ai-deals-table">
                    <thead>
                      <tr>
                        <th>Deal ID</th>
                        <th>Deal Name</th>
                        <th className="admin-ai-deal-amount-head">Deal Amount</th>
                        <th>Participated Amount</th>
                        <th>Updation Amount</th>
                        <th>Total Participation Amount</th>
                        <th>ROI</th>
                        <th>Status</th>
                        <th>Received On</th>
                        <th>Interest Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedDeals.length === 0 && (
                        <tr>
                          <td colSpan={10} className="admin-ai-empty-cell">No deals found for this lender.</td>
                        </tr>
                      )}
                      {paginatedDeals.map((deal) => {
                        const isExpanded = expandedInterestDealId === deal.dealId;
                        const interestData = interestDetailsByDeal[deal.dealId];
                        const interestLoading = interestLoadingDealId === deal.dealId;
                        return (
                          <React.Fragment key={`${deal.dealId}-${deal.receivedOn}`}>
                            <tr>
                              <td><span className="admin-ai-deal-id-pill">#{deal.dealId}</span></td>
                              <td className="admin-ai-deal-name-cell">{valueOrDash(deal.dealName)}</td>
                              <td className="admin-ai-deal-amount-cell">
                                <span className="admin-ai-deal-amount-badge">{fmtMoney(deal.dealAmount)}</span>
                                <small>from oxy borrower deals</small>
                              </td>
                              <td>{fmtMoney(deal.participatedAmount)}</td>
                              <td>{fmtMoney(deal.updationAmount || 0)}</td>
                              <td><strong className="admin-ai-total-participation-cell">{fmtMoney(totalParticipation(deal))}</strong></td>
                              <td>{valueOrDash(deal.roi)}%</td>
                              <td><span className={`admin-ai-status-pill admin-ai-status-pill-lg ${statusClass(deal.status, deal)}`}>{statusLabel(deal.status, deal)}</span></td>
                              <td>{formatDate(deal.receivedOn)}</td>
                              <td>
                                <button
                                  className={`admin-ai-interest-toggle ${isExpanded ? "open" : ""}`}
                                  type="button"
                                  onClick={() => toggleInterestDetails(deal)}
                                >
                                  <FaPercent /> {isExpanded ? "Hide" : "View"}
                                  {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                </button>
                              </td>
                            </tr>
                            {isExpanded ? (
                              <tr className="admin-ai-interest-expand-row">
                                <td colSpan={10}>
                                  <div className="admin-ai-interest-details-panel admin-ai-interest-magic">
                                    {interestLoading ? (
                                      <div className="admin-ai-interest-loading-bar">Refreshing from lenders_returns...</div>
                                    ) : null}
                                    {interestData ? (
                                      <>
                                        <div className="admin-ai-interest-details-head">
                                          <strong><FaPercent /> Interest & Return Details</strong>
                                          <div className="admin-ai-interest-source-badges">
                                            <span className={`admin-ai-payout-type-badge ${(interestData.payoutType || "").includes("YEAR") ? "yearly" : "monthly"}`}>
                                              Payout Type: {interestData.payoutTypeLabel || formatPayoutTypeLabel(interestData.payoutType, interestData.lenderReturnsType || deal.lenderReturnsType)}
                                            </span>
                                            {(interestData.sourceTables || [
                                              "lenders_returns",
                                              "oxy_principal_return",
                                              "oxy_lenders_accepted_deals",
                                              "lenders_paticipation_updation",
                                              "oxy_borrowers_deals_information",
                                            ]).map((table) => (
                                              <span className="admin-ai-source-table-badge" key={table}>{table}</span>
                                            ))}
                                          </div>
                                        </div>

                                        {interestData.onTheFlyInterest ? (
                                          <div className="admin-ai-interest-fallback-note admin-ai-interest-onthefly-note">
                                            No interest record in lenders_returns yet. Showing on-the-fly calculation (same as lender Interest Info).
                                          </div>
                                        ) : null}

                                        {interestData.localFallback && !interestData.onTheFlyInterest ? (
                                          <div className="admin-ai-interest-fallback-note">
                                            Showing estimated values from deal participation. Paid returns load when API is available.
                                          </div>
                                        ) : null}

                                        <div className="admin-ai-interest-summary-grid">
                                          <div className="admin-ai-interest-summary-card highlight-interest">
                                            <small>Total Paid Interest</small>
                                            <strong>{fmtMoney(pickNumber(interestData.totalPaidInterest))}</strong>
                                            <span>lenders_returns + oxy_principal_return</span>
                                          </div>
                                          <div className="admin-ai-interest-summary-card highlight-principal">
                                            <small>Total Paid Principal</small>
                                            <strong>{fmtMoney(pickNumber(interestData.totalPaidPrincipal))}</strong>
                                            <span>Approved returns only (Lender Withdraw counts when APPROVED)</span>
                                          </div>
                                          {interestData.hasLenderWithdraw || deal.hasLenderWithdraw ? (
                                            <div className="admin-ai-interest-summary-card highlight-withdraw">
                                              <small>Lender Withdraw (Approved)</small>
                                              <strong>{fmtMoney(pickNumber(interestData.lenderWithdrawAmount, deal.lenderWithdrawAmount))}</strong>
                                              <span>
                                                Paid on {formatDate(interestData.lenderWithdrawPaidDate || deal.lenderWithdrawPaidDate)}
                                                {" · "}
                                                Status APPROVED
                                              </span>
                                            </div>
                                          ) : null}
                                          <div className="admin-ai-interest-summary-card">
                                            <small>Deal Duration</small>
                                            <strong>
                                              {pickNumber(interestData.durationMonths, deal.durationMonths, parseDurationMonths(interestData.duration || deal.duration))
                                                ? `${pickNumber(interestData.durationMonths, deal.durationMonths, parseDurationMonths(interestData.duration || deal.duration))} months`
                                                : valueOrDash(interestData.duration || deal.duration)}
                                            </strong>
                                            <span>oxy_borrowers_deals_information.duration</span>
                                          </div>
                                          <div className="admin-ai-interest-summary-card">
                                            <small>Payout Type</small>
                                            <strong>{interestData.payoutTypeLabel || formatPayoutTypeLabel(interestData.payoutType, interestData.lenderReturnsType || deal.lenderReturnsType)}</strong>
                                            <span>oxy_lenders_accepted_deals.lender_returns_type</span>
                                          </div>
                                          <div className="admin-ai-interest-summary-card">
                                            <small>Loan Active Date</small>
                                            <strong>{formatDate(interestData.loanActiveDate)}</strong>
                                            <span>oxy_borrowers_deals_information</span>
                                          </div>
                                          <div className="admin-ai-interest-summary-card">
                                            <small>Deal Status</small>
                                            <strong>
                                              {interestData.hasLenderWithdraw || deal.hasLenderWithdraw
                                                ? "Lender Withdraw"
                                                : statusLabel(interestData.dealStatus || deal.status, deal)}
                                            </strong>
                                            <span>
                                              ROI {valueOrDash(interestData.roi || deal.roi)}%
                                              {" · "}
                                              {interestData.payoutTypeLabel || formatPayoutTypeLabel(interestData.payoutType, interestData.lenderReturnsType || deal.lenderReturnsType)}
                                            </span>
                                          </div>
                                        </div>

                                        {!interestData.hasPaidInterest && pickNumber(interestData.estimatedInterestAmount) > 0 ? (
                                          <div className="admin-ai-interest-estimate-box">
                                            <small>{interestData.estimatedInterestLabel || "Estimated interest"}</small>
                                            <strong>{fmtMoney(interestData.estimatedInterestAmount)}</strong>
                                            <span>
                                              {interestData.interestCalculationFormula ||
                                                buildInterestFormula(
                                                  pickNumber(interestData.totalParticipationAmount, totalParticipation(deal)),
                                                  pickNumber(interestData.roi, deal.roi),
                                                  interestData.payoutType || interestData.lenderReturnsType || deal.lenderReturnsType,
                                                  String(deal.fundsAcceptanceStartDate || deal.receivedOn || "").slice(0, 10) >= "2021-10-04",
                                                  pickNumber(interestData.periodInterestAmount),
                                                  pickNumber(interestData.accruedPeriods, 1)
                                                )}
                                              {interestData.loanActiveDate ? ` · Loan active since ${formatDate(interestData.loanActiveDate)}` : ""}
                                            </span>
                                          </div>
                                        ) : null}

                                        {(interestData.interestInfoRows?.length > 0
                                          || interestData.segmentInterestBreakdown?.length > 0
                                          || (!interestData.hasPaidInterest && (pickNumber(interestData.estimatedInterestAmount) > 0 || totalParticipation(deal) > 0))) ? (
                                          <InterestBreakupPanel
                                            rows={buildInterestBreakupRows(interestData, deal, selectedLender?.lenderId || dealsData?.profile?.lenderId || profile?.lenderId)}
                                            lenderId={selectedLender?.lenderId || dealsData?.profile?.lenderId || profile?.lenderId}
                                            roi={pickNumber(interestData.roi, deal.roi)}
                                            breakupOpenMap={interestBreakupOpenByDeal[deal.dealId] || {}}
                                            onToggleBreakup={(rowSno) => setInterestBreakupOpenByDeal((current) => ({
                                              ...current,
                                              [deal.dealId]: {
                                                ...(current[deal.dealId] || {}),
                                                [rowSno]: !current[deal.dealId]?.[rowSno],
                                              },
                                            }))}
                                          />
                                        ) : null}

                                        {interestData.interestPaymentsByPeriod?.length > 0 ? (
                                          <div className="admin-ai-interest-period-wrap">
                                            <div className="admin-ai-interest-returns-head">
                                              <strong>
                                                {(interestData.payoutType || "MONTHLY").includes("YEAR")
                                                  ? "Yearly Interest Credits"
                                                  : "Month-wise Interest Credits"}
                                              </strong>
                                              <span>Grouped by payout type from lenders_returns</span>
                                            </div>
                                            <div className="admin-ai-interest-period-grid">
                                              {interestData.interestPaymentsByPeriod.map((group) => (
                                                <div className="admin-ai-interest-period-card" key={group.paymentPeriod}>
                                                  <small>{group.paymentPeriodLabel || group.paymentPeriod}</small>
                                                  <strong>{fmtMoney(pickNumber(group.totalInterestPaid))}</strong>
                                                  <span>{pickNumber(group.paymentCount)} payment(s)</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        ) : null}

                                        {(interestData.interestPaymentHistory?.length > 0 || buildInterestPaymentHistory(interestData.paidReturns).length > 0) ? (
                                          <div className="admin-ai-interest-history-wrap">
                                            <div className="admin-ai-interest-returns-head">
                                              <strong>Interest Payment History</strong>
                                              <span>Paid date and amount history from lenders_returns / oxy_principal_return</span>
                                            </div>
                                            <div className="admin-ai-interest-history-list">
                                              {(interestData.interestPaymentHistory?.length
                                                ? interestData.interestPaymentHistory
                                                : buildInterestPaymentHistory(interestData.paidReturns)
                                              ).map((item, index, list) => (
                                                <div className="admin-ai-interest-history-item" key={item.returnId || `${item.interestPaidDate}-${index}`}>
                                                  <div className="admin-ai-interest-history-marker">
                                                    <span className="dot" />
                                                    {index < list.length - 1 ? <span className="line" /> : null}
                                                  </div>
                                                  <div className="admin-ai-interest-history-content">
                                                    <div className="admin-ai-interest-history-top">
                                                      <strong>{fmtMoney(item.interestPaidAmount)}</strong>
                                                      <span className={`admin-ai-return-type ${String(item.amountType || "").toLowerCase()}`}>
                                                        {returnTypeLabel(item.amountType)}
                                                      </span>
                                                    </div>
                                                    <div className="admin-ai-interest-history-meta">
                                                      <span>Interest Paid Date: <strong>{formatDate(item.interestPaidDate)}</strong></span>
                                                      {item.paymentPeriodLabel ? <span>Period: {item.paymentPeriodLabel}</span> : null}
                                                      {item.sourceTable ? <span>Source: {item.sourceTable}</span> : null}
                                                    </div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        ) : null}

                                        {(interestData.lenderWithdrawPaymentHistory?.length > 0 || (interestData.paidReturns || []).some((item) => String(item.amountType || "").toUpperCase() === "LENDERWITHDRAW")) ? (
                                          <div className="admin-ai-lender-withdraw-wrap">
                                            <div className="admin-ai-interest-returns-head">
                                              <strong>Lender Withdraw Returns</strong>
                                              <span>Only APPROVED rows count toward received principal</span>
                                            </div>
                                            <table className="admin-ai-interest-returns-table admin-ai-withdraw-returns-table">
                                              <thead>
                                                <tr>
                                                  <th>Return ID</th>
                                                  <th>Amount</th>
                                                  <th>Paid Date</th>
                                                  <th>Status</th>
                                                  <th>Counts In Total</th>
                                                  <th>Remarks</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {(interestData.lenderWithdrawPaymentHistory?.length
                                                  ? interestData.lenderWithdrawPaymentHistory
                                                  : (interestData.paidReturns || []).filter((item) => String(item.amountType || "").toUpperCase() === "LENDERWITHDRAW")
                                                ).map((item) => (
                                                  <tr key={item.returnId || `${item.withdrawPaidDate}-${item.withdrawPaidAmount || item.amount}`}>
                                                    <td>#{item.returnId}</td>
                                                    <td><strong>{fmtMoney(item.withdrawPaidAmount || item.amount)}</strong></td>
                                                    <td>{formatDate(item.withdrawPaidDate || item.paidDate)}</td>
                                                    <td>{valueOrDash(item.status)}</td>
                                                    <td>
                                                      <span className={`admin-ai-referral-status-pill ${item.countsTowardTotal || String(item.status || "").toUpperCase() === "APPROVED" ? "lent" : "invited"}`}>
                                                        {item.countsTowardTotal || String(item.status || "").toUpperCase() === "APPROVED" ? "Yes" : "No"}
                                                      </span>
                                                    </td>
                                                    <td>{valueOrDash(item.remarks)}</td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        ) : null}

                                        {interestData.paidReturns?.length > 0 ? (
                                          <div className="admin-ai-interest-returns-table-wrap">
                                            <div className="admin-ai-interest-returns-head">
                                              <strong>Paid Returns ({interestData.paidReturns.length})</strong>
                                              <span>All rows from lenders_returns for deal #{deal.dealId}</span>
                                            </div>
                                            <table className="admin-ai-interest-returns-table">
                                              <thead>
                                                <tr>
                                                  <th>Return ID</th>
                                                  <th>Type</th>
                                                  <th>Amount</th>
                                                  <th>Paid Date</th>
                                                  <th>Actual Date</th>
                                                  <th>Status</th>
                                                  <th>Remarks</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {interestData.paidReturns.map((item) => (
                                                  <tr key={item.returnId}>
                                                    <td>#{item.returnId}</td>
                                                    <td>
                                                      <span className={`admin-ai-return-type ${String(item.amountType || "").toLowerCase()}`}>
                                                        {returnTypeLabel(item.amountType)}
                                                      </span>
                                                    </td>
                                                    <td><strong>{fmtMoney(item.amount)}</strong></td>
                                                    <td>{formatDate(item.paidDate)}</td>
                                                    <td>{formatDate(item.actualDate)}</td>
                                                    <td>
                                                      <span className={`admin-ai-referral-status-pill ${String(item.status || "").toUpperCase() === "APPROVED" ? "lent" : "invited"}`}>
                                                        {valueOrDash(item.status)}
                                                      </span>
                                                    </td>
                                                    <td>{valueOrDash(item.remarks)}</td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        ) : interestData.interestPaymentHistory?.length || buildInterestPaymentHistory(interestData.paidReturns).length ? null : (
                                          <div className="admin-ai-empty-state">
                                            {interestData.activeDeal
                                              ? "No paid interest yet. Estimated accrual shown above using loan active date."
                                              : "No paid returns recorded in lenders_returns for this closed deal."}
                                          </div>
                                        )}
                                      </>
                                    ) : (
                                      <div className="admin-ai-empty-state">Loading interest details...</div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ) : null}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {referralBonusModal.open ? (
            <div className="admin-ai-wallet-modal" onClick={closeReferralBonusModal} role="presentation">
              <div
                className="admin-ai-wallet-modal-panel admin-ai-referral-bonus-modal"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
              >
                <div className="admin-ai-wallet-modal-head">
                  <h5>Referral Earnings · {referralBonusModal.title}</h5>
                  <button type="button" className="admin-ai-wallet-close" onClick={closeReferralBonusModal}>
                    <FaTimes />
                  </button>
                </div>
                {referralBonusModal.rows.length === 0 ? (
                  <div className="admin-ai-empty-state">
                    No referral bonus deal records for this referee yet. Deals appear here after the referee participates and a bonus is created in lender_referral_bonus_updated.
                  </div>
                ) : (
                  <div className="admin-ai-table-wrap">
                    <table className="admin-ai-advanced-table">
                      <thead>
                        <tr>
                          <th>Deal ID</th>
                          <th>Participated On</th>
                          <th>Participated Amount</th>
                          <th>Bonus Amount</th>
                          <th>Payment Status</th>
                          <th>Transferred On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {referralBonusModal.rows.map((deal, index) => (
                          <tr key={`${deal.dealId || "deal"}-${index}`}>
                            <td>{valueOrDash(deal.dealId)}</td>
                            <td>{formatDate(deal.participatedOn)}</td>
                            <td>{fmtMoney(deal.participatedAmount)}</td>
                            <td>{fmtMoney(deal.amount)}</td>
                            <td>{valueOrDash(deal.paymentStatus)}</td>
                            <td>{valueOrDash(deal.transferredOn)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
        <Footer />
      </div>
    </div>
  );
};

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

export default AdminAIDealsDashboard;
