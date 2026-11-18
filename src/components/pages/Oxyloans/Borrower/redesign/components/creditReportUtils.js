// Utilities, mock fallback data, and parser for Credit Report integration (PaySprint / VerifyA2Z bureau)

// Dummy credit report sample removed - genuine API response required
export const RAW_SAMPLE_RESPONSE = null;


/**
 * Format Indian Rupee currency
 */
export const formatINR = (val) => {
  const num = Number(val || 0);
  return `₹${num.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`;
};

/**
 * Score Band metadata
 */
export const getScoreTier = (scoreNum) => {
  const score = Number(scoreNum || 0);
  if (score >= 750) {
    return {
      tier: "Excellent",
      color: "#059669", // Emerald
      badgeBg: "#ecfdf5",
      badgeBorder: "#a7f3d0",
      pillClass: "bg-success text-white",
      description: "Superb credit profile. Qualifies for lowest interest rates and immediate loan matching.",
      rating: "Prime+",
      gaugePercent: Math.min(100, Math.max(0, ((score - 300) / 600) * 100)),
    };
  }
  if (score >= 700) {
    return {
      tier: "Good",
      color: "#0284c7", // Sky blue
      badgeBg: "#f0f9ff",
      badgeBorder: "#bae6fd",
      pillClass: "bg-info text-white",
      description: "Reliable credit history with very good approval odds.",
      rating: "Prime",
      gaugePercent: Math.min(100, Math.max(0, ((score - 300) / 600) * 100)),
    };
  }
  if (score >= 650) {
    return {
      tier: "Fair",
      color: "#d97706", // Amber
      badgeBg: "#fffbeb",
      badgeBorder: "#fde68a",
      pillClass: "bg-warning text-dark",
      description: "Moderate credit profile. May require additional collateral or slightly higher interest rate.",
      rating: "Standard",
      gaugePercent: Math.min(100, Math.max(0, ((score - 300) / 600) * 100)),
    };
  }
  return {
    tier: "Needs Improvement",
    color: "#dc2626", // Red
    badgeBg: "#fef2f2",
    badgeBorder: "#fecaca",
    pillClass: "bg-danger text-white",
    description: "Credit builder required. Low approval odds for standard loans without co-applicant.",
    rating: "Subprime",
    gaugePercent: Math.min(100, Math.max(0, ((score - 300) / 600) * 100)),
  };
};

/**
 * Mask account number for secure rendering
 */
export const maskAccountNumber = (accNo) => {
  if (!accNo) return "••••";
  const str = String(accNo).trim();
  if (str.length <= 4) return `•••• ${str}`;
  return `•••• •••• ${str.slice(-4)}`;
};

/**
 * Parse full Credit Report API response safely
 */
export const parseCreditReportData = (apiResponse) => {
  if (!apiResponse) return null;

  // Handle explicit API response where no report is found:
  // e.g. { id: null, borrowerId: 68506, success: false, httpStatus: 0, rawResponse: null, message: "No credit report found for borrowerId 68506" }
  if (
    apiResponse.success === false ||
    apiResponse.httpStatus === 0 ||
    (typeof apiResponse.message === "string" && apiResponse.message.toLowerCase().includes("no credit report"))
  ) {
    if (!apiResponse.rawResponse && !apiResponse.data?.cCRResponse && !apiResponse.cCRResponse) {
      return null;
    }
  }

  let raw = apiResponse?.rawResponse || apiResponse?.data || apiResponse;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch (e) {
      console.error("Error parsing rawResponse string", e);
    }
  }

  if (raw && typeof raw === "object") {
    if (
      (raw.success === false || raw.httpStatus === 0 || (typeof raw.message === "string" && raw.message.toLowerCase().includes("no credit report"))) &&
      !raw.rawResponse &&
      !raw.cCRResponse &&
      !raw.data?.cCRResponse
    ) {
      return null;
    }
  }

  // Find cIRReportData
  const cCRResponse = raw?.data?.cCRResponse || raw?.cCRResponse || apiResponse?.data?.cCRResponse || (raw?.cIRReportDataLst ? raw : null);
  const reportOrderNumber = cCRResponse?.reportOrderNumber || raw?.reference_id || apiResponse?.reference_id || "";
  const referenceId = raw?.reference_id || apiResponse?.reference_id || "";

  const reportList = cCRResponse?.cIRReportDataLst || raw?.cIRReportDataLst || (cCRResponse?.cIRReportData ? [cCRResponse] : []);
  const cIRData = reportList[0]?.cIRReportData || reportList[0] || cCRResponse?.cIRReportData || {};

  const scoreDetails = cIRData?.scoreDetails || raw?.scoreDetails || [];
  const primaryScoreObj = scoreDetails[0] || {};
  let scoreValue = Number(primaryScoreObj?.value || 0);
  if (!scoreValue) {
    scoreValue = Number(raw?.cibilScore || raw?.score || apiResponse?.cibilScore || apiResponse?.score || apiResponse?.creditScore || 0);
  }

  const retailAccountsList = cIRData?.retailAccountDetails || [];
  const pInfo = cIRData?.iDAndContactInfo?.personalInfo || {};
  if (!scoreValue && retailAccountsList.length === 0 && !pInfo?.name?.fullName && !pInfo?.name?.firstName && !apiResponse?.fullName) {
    return null;
  }

  const personalInfo = cIRData?.iDAndContactInfo?.personalInfo || {};
  const identityInfo = cIRData?.iDAndContactInfo?.identityInfo || {};
  const addressInfo = cIRData?.iDAndContactInfo?.addressInfo || [];
  const phoneInfo = cIRData?.iDAndContactInfo?.phoneInfo || [];
  const emailInfo = cIRData?.iDAndContactInfo?.emailAddressInfo || [];

  const retailSummary = cIRData?.retailAccountsSummary || {};
  const retailAccounts = cIRData?.retailAccountDetails || [];
  const enquirySummary = cIRData?.enquirySummary || {};
  const otherKeyInd = cIRData?.otherKeyInd || {};
  const recentActivities = cIRData?.recentActivities || {};

  // Compute calculated metrics
  const totalBalance = Number(retailSummary?.totalBalanceAmount || 0);
  const totalLimit = Number(retailSummary?.totalCreditLimit || 0);
  const totalHighCredit = Number(retailSummary?.totalHighCredit || 0);
  const utilizationRatio = totalLimit > 0 ? ((totalBalance / totalLimit) * 100).toFixed(1) : 0;
  const pastDueAmount = Number(retailSummary?.totalPastDue || 0);
  const activeAccountsCount = Number(retailSummary?.noOfActiveAccounts || 0);
  const totalAccountsCount = Number(retailSummary?.noOfAccounts || retailAccounts.length || 0);
  const creditAgeMonths = Number(otherKeyInd?.ageOfOldestTrade || 0);
  const creditAgeYears = (creditAgeMonths / 12).toFixed(1);

  return {
    raw,
    referenceId,
    reportOrderNumber,
    score: scoreValue,
    scoreTier: getScoreTier(scoreValue),
    scoreDetails: primaryScoreObj,
    scoringFactors: primaryScoreObj?.scoringElements || [],
    personal: {
      name: personalInfo?.name?.fullName || personalInfo?.name?.firstName || "Borrower",
      firstName: personalInfo?.name?.firstName || "",
      middleName: personalInfo?.name?.middleName || "",
      dob: personalInfo?.dateOfBirth || "",
      gender: personalInfo?.gender || "Not Specified",
      age: personalInfo?.age?.age || "",
      pan: identityInfo?.pANId?.[0]?.idNumber || "",
      otherId: identityInfo?.otherId?.[0]?.idNumber || "",
      addresses: addressInfo,
      phones: phoneInfo,
      emails: emailInfo,
    },
    metrics: {
      totalBalance,
      totalLimit,
      totalHighCredit,
      utilizationRatio,
      pastDueAmount,
      activeAccountsCount,
      totalAccountsCount,
      closedAccountsCount: Math.max(0, totalAccountsCount - activeAccountsCount),
      creditAgeMonths,
      creditAgeYears,
      oldestAccount: retailSummary?.oldestAccount || "",
      recentAccount: retailSummary?.recentAccount || "",
      delinquencyStatus: retailSummary?.mostSevereStatusWithIn24Months || "Non-Delnqt",
      writeOffs: Number(retailSummary?.noOfWriteOffs || 0),
    },
    accounts: retailAccounts,
    enquiries: enquirySummary,
    indicators: otherKeyInd,
    activities: recentActivities,
  };
};

/**
 * Storage helpers to persist bureau data in browser
 */
const STORAGE_KEY = "oxy_credit_report_data";

export const getCachedCreditReport = () => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn("Error reading credit report cache", e);
  }
  return null;
};

export const setCachedCreditReport = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Error setting credit report cache", e);
  }
};
