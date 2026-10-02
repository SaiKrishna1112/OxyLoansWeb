// Utilities, mock fallback data, and parser for Credit Report integration (PaySprint / VerifyA2Z bureau)

export const RAW_SAMPLE_RESPONSE = {
  success: true,
  httpStatus: 200,
  tokenUsed: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aW1lc3RhbXAiOjE3OTA5MjQ4MjEsInBhcnRuZXJJZCI6IkNPUlAwMDAwMjY4MCIsInJlcWlkIjozOTA5OTgyMjZ9.v8isXl68yVsYgwkqGL52Ka_c323Zk3sESr1YxMmcInA",
  requestUrl: "https://api.verifya2z.com/api/v1/verification/credit_report_checker",
  rawResponse: JSON.stringify({
    statuscode: 200,
    status: true,
    message: "Credit Report fetched successfully",
    reference_id: 196843658,
    data: {
      cCRResponse: {
        status: "1",
        reportOrderNumber: "2989093135",
        cIRReportDataLst: [
          {
            cIRReportData: {
              iDAndContactInfo: {
                personalInfo: {
                  name: {
                    fullName: "BALIJEPALLI NARENDRA ",
                    firstName: "BALIJEPALLI ",
                    middleName: "NARENDRA "
                  },
                  dateOfBirth: "1994-08-08",
                  gender: "Male",
                  age: { age: "32" },
                  totalIncome: ""
                },
                identityInfo: {
                  pANId: [{ seq: "1", reportedDate: "2026-09-23", idNumber: "CDBPB2737H" }],
                  otherId: [{ seq: "1", reportedDate: "2026-06-30", idNumber: "60011901969107" }]
                },
                addressInfo: [
                  { seq: "1", reportedDate: "2026-09-23", address: "4-15-124-2 BHARATH PET 8THLANE AMARAVATHI ROAD  GUNTUR GUNTUR", state: "AP", postal: "522002", type: "Permanent" },
                  { seq: "2", reportedDate: "2026-09-23", address: "SRS FINTECH LABS PVT LTD  CCO2 BLOCK  C HINDU FORTUNE FIELDS 9TH PHASE ANNEXE HYDERABAD", state: "AP", postal: "500085", type: "Office" },
                  { seq: "3", reportedDate: "2026-09-23", address: "PLOT NO 287 MIG/2 KAHI PHOSE 9 KUKADPALLY  NEAR FORUM MALL HYDERABAD", state: "TS", postal: "500072", type: "Office" },
                  { seq: "4", reportedDate: "2026-09-23", address: "SAI MSDHAV BOYS HOSTEL 155A ADDAGUTTA  NEAR JNTU HYDERABAD", state: "TS", postal: "500090", type: "Primary" },
                  { seq: "5", reportedDate: "2021-03-31", address: "4-15-124-2 BHARATH PET 8THLANE AMARAVATHI ROAD  GUNTUR GUNTUR", state: "AP", postal: "522002", type: "Permanent" }
                ],
                phoneInfo: [
                  { seq: "1", typeCode: "H", reportedDate: "2020-02-29", number: "00522002" },
                  { seq: "2", typeCode: "M", reportedDate: "2026-09-23", number: "09492902990" },
                  { seq: "3", typeCode: "M", reportedDate: "2023-02-01", number: "9966888825" },
                  { seq: "4", typeCode: "T", reportedDate: "2026-06-30", number: "9492902990" },
                  { seq: "5", typeCode: "T", reportedDate: "2023-04-01", number: "00522002" }
                ],
                emailAddressInfo: [
                  { seq: "1", reportedDate: "2023-02-01", emailAddress: "NARENDRA@OXYLOANS.COM" }
                ]
              },
              retailAccountsSummary: {
                noOfAccounts: "7",
                noOfActiveAccounts: "1",
                noOfWriteOffs: "0",
                totalPastDue: "0.00",
                mostSevereStatusWithIn24Months: "Non-Delnqt",
                singleHighestCredit: "150467.00",
                singleHighestSanctionAmount: "0.00",
                totalHighCredit: "150467.00",
                averageOpenBalance: "125586.00",
                singleHighestBalance: "125586.00",
                noOfPastDueAccounts: "0",
                noOfZeroBalanceAccounts: "0",
                recentAccount: "Credit Card on 10-03-2022",
                oldestAccount: "Credit Card on 14-12-2018",
                totalBalanceAmount: "125586.00",
                totalSanctionAmount: "0.00",
                totalCreditLimit: "156000.0",
                totalMonthlyPaymentAmount: "0.00"
              },
              scoreDetails: [
                {
                  type: "ERS",
                  version: "4.0",
                  name: "ERS4.0",
                  value: "802",
                  scoringElements: [
                    { type: "RES", seq: "1", code: "703", description: "Total Utilization" },
                    { type: "RES", seq: "2", code: "704", description: "Credit Card Utilization" },
                    { type: "RES", seq: "3", code: "702", description: "Total Credit Exposure" }
                  ]
                }
              ],
              retailAccountDetails: [
                {
                  seq: "1",
                  accountNumber: "0252965746111987943",
                  institution: "SBI CARDS AND PAYMENT SERVICES LIMITED",
                  accountType: "Credit Card",
                  ownershipType: "Individual",
                  balance: "125586",
                  pastDueAmount: "0",
                  open: "Yes",
                  highCredit: "150467",
                  lastPaymentDate: "2026-09-23",
                  dateReported: "2026-09-23",
                  dateOpened: "2022-03-10",
                  termFrequency: "Monthly",
                  creditLimit: "156000",
                  accountStatus: "Current Account",
                  source: "INDIVIDUAL",
                  history48Months: [
                    { key: "09-26", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "08-26", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "07-26", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "06-26", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "05-26", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "04-26", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "03-26", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "02-26", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "01-26", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "12-25", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "11-25", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "10-25", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "09-25", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "08-25", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" }
                  ]
                },
                {
                  seq: "2",
                  accountNumber: "9406455010135272",
                  institution: "Kotak Mahindra Bank Ltd",
                  accountType: "Credit Card",
                  ownershipType: "Individual",
                  balance: "89883",
                  pastDueAmount: "0",
                  lastPayment: "107516",
                  open: "No",
                  highCredit: "161856",
                  lastPaymentDate: "2026-09-03",
                  dateReported: "2026-09-23",
                  dateOpened: "2019-12-10",
                  dateClosed: "2021-03-31",
                  termFrequency: "Monthly",
                  creditLimit: "162000",
                  accountStatus: "Current Account",
                  source: "INDIVIDUAL",
                  history48Months: [
                    { key: "09-26", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "08-26", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "07-26", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "06-26", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "05-26", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "04-26", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "03-26", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "02-26", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "01-26", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "12-25", paymentStatus: "*", suitFiledStatus: "*", assetClassificationStatus: "*" }
                  ]
                },
                {
                  seq: "3",
                  accountNumber: "7280514346111996607",
                  institution: "SBI CARDS AND PAYMENT SERVICES LIMITED",
                  accountType: "Credit Card",
                  ownershipType: "Individual",
                  balance: "0",
                  pastDueAmount: "0",
                  open: "No",
                  highCredit: "75339",
                  lastPaymentDate: "2025-06-18",
                  dateReported: "2025-08-30",
                  dateOpened: "2022-03-10",
                  dateClosed: "2025-07-09",
                  reason: "Closed Account",
                  termFrequency: "Monthly",
                  creditLimit: "0",
                  accountStatus: "Closed Account",
                  source: "INDIVIDUAL",
                  history48Months: [
                    { key: "08-25", paymentStatus: "CLSD", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "07-25", paymentStatus: "CLSD", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "06-25", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "05-25", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" }
                  ]
                },
                {
                  seq: "4",
                  accountNumber: "9406151000648776",
                  institution: "Kotak Mahindra Bank Ltd",
                  accountType: "Credit Card",
                  ownershipType: "Individual",
                  balance: "0",
                  pastDueAmount: "0",
                  open: "No",
                  highCredit: "8284",
                  lastPaymentDate: "2021-01-04",
                  dateReported: "2025-04-22",
                  dateOpened: "2019-12-10",
                  dateClosed: "2021-10-21",
                  termFrequency: "Monthly",
                  accountStatus: "Closed Account",
                  source: "INDIVIDUAL",
                  history48Months: [
                    { key: "04-25", paymentStatus: "CLSD", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "10-21", paymentStatus: "CLSD", suitFiledStatus: "*", assetClassificationStatus: "*" }
                  ]
                },
                {
                  seq: "5",
                  accountNumber: "9406150005334457",
                  institution: "Kotak Mahindra Bank Ltd",
                  accountType: "Credit Card",
                  ownershipType: "Individual",
                  balance: "0",
                  pastDueAmount: "0",
                  open: "No",
                  highCredit: "2662",
                  lastPaymentDate: "2020-10-04",
                  dateReported: "2025-04-22",
                  dateOpened: "2019-12-10",
                  dateClosed: "2021-10-21",
                  termFrequency: "Monthly",
                  accountStatus: "Closed Account",
                  source: "INDIVIDUAL",
                  history48Months: [
                    { key: "04-25", paymentStatus: "CLSD", suitFiledStatus: "*", assetClassificationStatus: "*" }
                  ]
                },
                {
                  seq: "6",
                  accountNumber: "0001014550015442292",
                  institution: "HDFC Bank Limited",
                  accountType: "Credit Card",
                  ownershipType: "Individual",
                  balance: "0",
                  open: "No",
                  highCredit: "55550",
                  lastPaymentDate: "2022-01-29",
                  dateReported: "2023-07-01",
                  dateOpened: "2018-12-14",
                  dateClosed: "2023-03-01",
                  reason: "Closed Account",
                  creditLimit: "150000",
                  accountStatus: "Closed Account",
                  source: "INDIVIDUAL",
                  history48Months: [
                    { key: "07-23", paymentStatus: "CLSD", suitFiledStatus: "*", assetClassificationStatus: "*" },
                    { key: "03-23", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "*" }
                  ]
                },
                {
                  seq: "7",
                  accountNumber: "6439810",
                  institution: "HDFC Bank Limited",
                  accountType: "Personal Loan",
                  ownershipType: "Individual",
                  balance: "0",
                  pastDueAmount: "0",
                  lastPayment: "3523",
                  open: "No",
                  sanctionAmount: "100000",
                  lastPaymentDate: "2022-05-07",
                  dateReported: "2022-05-31",
                  dateOpened: "2019-05-16",
                  dateClosed: "2022-05-07",
                  reason: "Closed Account",
                  termFrequency: "Monthly",
                  accountStatus: "Closed Account",
                  assetClassification: "Standard",
                  source: "INDIVIDUAL",
                  history48Months: [
                    { key: "05-22", paymentStatus: "CLSD", suitFiledStatus: "*", assetClassificationStatus: "STD" },
                    { key: "04-22", paymentStatus: "000", suitFiledStatus: "*", assetClassificationStatus: "STD" }
                  ]
                }
              ],
              enquirySummary: {
                purpose: "ALL",
                total: "0",
                past30Days: "0",
                past12Months: "0",
                past24Months: "0"
              },
              otherKeyInd: {
                ageOfOldestTrade: "94",
                numberOfOpenTrades: "1",
                allLinesEVERWritten: "0.00",
                allLinesEVERWrittenIn9Months: "0",
                allLinesEVERWrittenIn6Months: "0"
              },
              recentActivities: {
                accountsDeliquent: "0",
                accountsOpened: "0",
                totalInquiries: "0",
                accountsUpdated: "2"
              }
            }
          }
        ]
      }
    }
  }),
  message: "Credit Report fetched successfully"
};

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

  let raw = apiResponse?.rawResponse || apiResponse;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch (e) {
      console.error("Error parsing rawResponse string", e);
    }
  }

  // Find cIRReportData
  const cCRResponse = raw?.data?.cCRResponse || raw?.cCRResponse || apiResponse?.data?.cCRResponse;
  const reportOrderNumber = cCRResponse?.reportOrderNumber || raw?.reference_id || "";
  const referenceId = raw?.reference_id || apiResponse?.reference_id || "";

  const reportList = cCRResponse?.cIRReportDataLst || [];
  const cIRData = reportList[0]?.cIRReportData || {};

  const scoreDetails = cIRData?.scoreDetails || [];
  const primaryScoreObj = scoreDetails[0] || {};
  const scoreValue = Number(primaryScoreObj?.value || 0);

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
