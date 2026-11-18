import {
  fetchPaysprintCreditReport,
  getBorrowerCreditReport,
  saveBorrowerReferenceDetails,
  verifyBankAccountAndIfsc,
  updatebankDetails,
  getUserDetails,
} from "../../../../../../HttpRequest/afterlogin";
import {
  parseCreditReportData,
  getCachedCreditReport,
  setCachedCreditReport,
} from "../creditReportUtils";

/**
 * Standard Instant Loan Calculation Engine
 * Mirrors underwriting standards of modern digital lenders (Navi, KreditBee, slice)
 */
export const calculateLoanOffers = (salary, creditScore = 700) => {
  const verifiedSalary = Number(salary || 50000);
  
  // Max loan amount is typically 1.0x to 1.5x monthly salary for prime credit score (>= 750)
  let maxEligibility = Math.round(verifiedSalary * 0.9);
  maxEligibility = Math.max(15000, Math.min(200000, maxEligibility));

  // Determine ROI tier based on bureau score
  let annualRoi = 18; // Prime+ default
  if (creditScore >= 780) {
    annualRoi = 16.5;
  } else if (creditScore >= 730) {
    annualRoi = 19.5;
  } else if (creditScore >= 680) {
    annualRoi = 24.0;
  } else {
    annualRoi = 28.0;
  }

  // --- OFFER 1: One-Time Bullet Repayment (30 Days) ---
  const bulletPrincipal = Math.min(30000, Math.round(maxEligibility * 0.65));
  const bulletMonthlyRate = annualRoi / 12 / 100;
  const bulletInterest = Math.round(bulletPrincipal * bulletMonthlyRate);
  const bulletProcessingFee = Math.round(bulletPrincipal * 0.02); // 2% fee
  const bulletGst = Math.round(bulletProcessingFee * 0.18); // 18% GST
  const bulletNetDisbursal = bulletPrincipal - (bulletProcessingFee + bulletGst);
  const bulletTotalPayable = bulletPrincipal + bulletInterest;

  // --- OFFER 2: 3-Month EMI Plan (Dynamic tenure supported) ---
  const emiPrincipal = maxEligibility;
  const emiTenureMonths = 3;
  const emiMonthlyRate = annualRoi / 12 / 100;
  // EMI formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
  const factor = Math.pow(1 + emiMonthlyRate, emiTenureMonths);
  const emiPerMonth = Math.round((emiPrincipal * emiMonthlyRate * factor) / (factor - 1));
  const emiTotalPayable = emiPerMonth * emiTenureMonths;
  const emiTotalInterest = emiTotalPayable - emiPrincipal;
  const emiProcessingFee = Math.round(emiPrincipal * 0.025); // 2.5% fee
  const emiGst = Math.round(emiProcessingFee * 0.18);
  const emiNetDisbursal = emiPrincipal - (emiProcessingFee + emiGst);

  return {
    maxEligibility,
    creditScore,
    annualRoi,
    bulletOffer: {
      id: "OFFER_BULLET_30D",
      type: "BULLET",
      title: "One-Time Full Repayment",
      subtitle: "Zero monthly stress. Repay principal + interest in a single installment after 30 days.",
      badge: "Fastest Settlement",
      principal: bulletPrincipal,
      tenureDays: 30,
      interest: bulletInterest,
      processingFee: bulletProcessingFee,
      gst: bulletGst,
      netDisbursal: bulletNetDisbursal,
      totalPayable: bulletTotalPayable,
      roi: annualRoi,
    },
    emiOffer: {
      id: "OFFER_EMI_3M",
      type: "EMI",
      title: "3 Easy Monthly EMIs",
      subtitle: "Spread your repayment comfortably across 3 equal monthly installments.",
      badge: "Most Popular",
      principal: emiPrincipal,
      tenureMonths: emiTenureMonths,
      emiPerMonth: emiPerMonth,
      totalInterest: emiTotalInterest,
      processingFee: emiProcessingFee,
      gst: emiGst,
      netDisbursal: emiNetDisbursal,
      totalPayable: emiTotalPayable,
      roi: annualRoi,
      schedule: [
        { month: 1, amount: emiPerMonth, dueDate: "After 30 Days" },
        { month: 2, amount: emiPerMonth, dueDate: "After 60 Days" },
        { month: 3, amount: emiPerMonth, dueDate: "After 90 Days" },
      ],
    },
  };
};

/**
 * Storage key helper for Instant Loan session persistence
 */
export const getStorageKey = (applicationId = "") => {
  const resolved = applicationId || sessionStorage.getItem("userId") || localStorage.getItem("userId") || "instant";
  return `oxy_instant_loan_${resolved}`;
};

export const loadInstantLoanState = (applicationId = "") => {
  try {
    const raw = localStorage.getItem(getStorageKey(applicationId));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to load stored instant loan state:", e);
  }
  return null;
};

export const saveInstantLoanState = (applicationId = "", state) => {
  try {
    localStorage.setItem(getStorageKey(applicationId), JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save instant loan state:", e);
  }
};

/**
 * Execute Credit Bureau & PAN/DOB Verification:
 * 1. FIRST checks if an existing Credit Bureau report already exists on file or in cache.
 * 2. ONLY IF no existing credit report is found, hits the live Credit Report API (PaySprint CIR gateway).
 */
export const verifyBureauAndIdentity = async (formData, onProgress = null) => {
  const borrowerId =
    formData.userId ||
    formData.borrowerId ||
    sessionStorage.getItem("userId") ||
    localStorage.getItem("userId") ||
    "";

  const payload = {
    name: formData.name || "",
    mobile: formData.mobile || "",
    documentId: (formData.panNumber || formData.documentId || "").toUpperCase().trim(),
    dateOfBirth: formData.dateOfBirth || formData.dob || "",
    address: formData.address || "",
    pincode: (formData.pincode || "").trim(),
    borrowerId: Number(borrowerId),
  };

  let apiResponse = null;
  let isExistingReport = false;
  let reportSource = "NONE";
  let isMockUsed = false;

  // STEP 1: First check if we already have a credit report on file
  if (onProgress) onProgress("CHECKING_EXISTING", `Checking existing credit bureau records on file for borrower #${borrowerId}...`);

  // 1A. Check backend stored credit report: GET paysprint/credit-report/{borrowerId}
  try {
    if (borrowerId) {
      const storedRes = await getBorrowerCreditReport(borrowerId);
      const storedData = storedRes?.data?.data || storedRes?.data;
      if (storedData) {
        const parsedStored = parseCreditReportData(storedData);
        if (parsedStored && (Number(parsedStored.score) > 0 || (Array.isArray(parsedStored.accounts) && parsedStored.accounts.length > 0))) {
          apiResponse = storedData;
          isExistingReport = true;
          reportSource = "EXISTING_STORED";
          console.log("[Bureau Verification] Existing credit report found on backend for borrower:", borrowerId);
          if (onProgress) onProgress("EXISTING_FOUND", "Found existing verified credit report in database.");
        }
      }
    }
  } catch (storedErr) {
    console.warn("[Bureau Verification] Notice while checking existing stored credit report:", storedErr);
  }

  // 1B. If not found in backend, check local/session cached credit report
  if (!apiResponse) {
    try {
      const cached = getCachedCreditReport();
      if (cached) {
        const parsedCached = parseCreditReportData(cached);
        if (parsedCached && Number(parsedCached.score) > 0) {
          apiResponse = cached;
          isExistingReport = true;
          reportSource = "EXISTING_CACHE";
          console.log("[Bureau Verification] Existing credit report found in cache.");
          if (onProgress) onProgress("EXISTING_FOUND", "Found verified credit report in cache.");
        }
      }
    } catch (cachedErr) {
      console.warn("[Bureau Verification] Error reading cached credit report:", cachedErr);
    }
  }

  // 1C. Check if profileData already has credit report data passed down
  if (!apiResponse && formData.creditReportData) {
    const parsedPassed = parseCreditReportData(formData.creditReportData);
    if (parsedPassed && Number(parsedPassed.score) > 0) {
      apiResponse = formData.creditReportData;
      isExistingReport = true;
      reportSource = "PROFILE_DATA";
    }
  }

  // STEP 2: Only if NO existing credit report is found, THEN hit the credit report API
  if (!apiResponse) {
    console.log("[Bureau Verification] No existing credit report found. Hitting PaySprint Credit Report API...");
    if (onProgress) onProgress("FETCHING_NEW", "No existing credit report found. Querying PaySprint Bureau API...");

    try {
      const res = await fetchPaysprintCreditReport(payload);
      if (res && (res.status === 200 || res.data?.success || res.data?.rawResponse)) {
        const resData = res.data || res;
        const parsedNew = parseCreditReportData(resData);
        if (parsedNew && Number(parsedNew.score) > 0) {
          apiResponse = resData;
          reportSource = "NEW_API_PULL";
          try { setCachedCreditReport(resData); } catch {}
        } else if (resData?.success) {
          apiResponse = resData;
          reportSource = "NEW_API_PULL";
          try { setCachedCreditReport(resData); } catch {}
        }
      }
    } catch (apiErr) {
      console.warn("Live Bureau API call failed or in sandbox, using fallback:", apiErr);
    }
  }

  // Strict: No dummy data fallback. If API call returns no report, fail gracefully.
  if (!apiResponse || (!apiResponse.success && !apiResponse.rawResponse && !apiResponse.data && !apiResponse.score)) {
    console.warn("[Bureau Verification] Credit Bureau API returned no valid report. Dummy fallback is removed.");
    return {
      success: false,
      isExistingReport: false,
      reportSource: "NONE",
      isMockUsed: false,
      parsedReport: null,
      rawResponse: null,
      score: null,
      panMatched: false,
      dobMatched: false,
      bureauPan: null,
      bureauDob: null,
      isEligible: false,
      errorMessage: "Credit Bureau report could not be retrieved from the bureau API. Please try again later.",
      ineligibilityReason: "Unable to retrieve live Credit Bureau report. Verification cannot proceed without valid bureau data.",
    };
  }

  const parsed = parseCreditReportData(apiResponse);
  if (!parsed || !parsed.score) {
    console.warn("[Bureau Verification] API response could not be parsed into a valid credit report.");
    return {
      success: false,
      isExistingReport,
      reportSource,
      isMockUsed: false,
      parsedReport: null,
      rawResponse: apiResponse,
      score: null,
      panMatched: false,
      dobMatched: false,
      bureauPan: null,
      bureauDob: null,
      isEligible: false,
      errorMessage: "Credit Bureau API returned data but no valid credit score was found.",
      ineligibilityReason: "No valid credit score found in bureau report.",
    };
  }

  const bureauPan = (parsed?.personal?.pan || "").toUpperCase().trim();
  const bureauDob = (parsed?.personal?.dob || "").trim();
  const userPan = payload.documentId.toUpperCase().trim();
  const userDob = payload.dateOfBirth.trim();

  // Verification checks using genuine parsed values
  const panMatched = bureauPan && userPan ? bureauPan === userPan : true;
  const dobMatched = bureauDob && userDob ? bureauDob === userDob : true;
  const score = Number(parsed.score);
  const isScoreEligible = score >= 650 && Number(parsed?.metrics?.writeOffs || 0) === 0;

  return {
    success: true,
    isExistingReport,
    reportSource,
    isMockUsed: false,
    parsedReport: parsed,
    rawResponse: apiResponse,
    score,
    panMatched,
    dobMatched,
    bureauPan,
    bureauDob,
    isEligible: panMatched && isScoreEligible,
    ineligibilityReason: !isScoreEligible
      ? `Credit score (${score}) is below the minimum required underwriting threshold (650).`
      : !panMatched
      ? "Provided PAN does not match the Bureau Identity on file."
      : "",
  };
};

import {
  saveBorrowerReferences,
  verifyPennyDropBankAccount,
} from "./instantLoanApi";

/**
 * Save references to backend API (or fallback safely)
 */
export const submitEmergencyReferences = async (ref1, ref2) => {
  const res = await saveBorrowerReferences(ref1, ref2);
  return { success: res.success, isMock: res.isMock };
};

/**
 * Bank Account Verification
 */
export const verifyBankAccount = async (bankData) => {
  const res = await verifyPennyDropBankAccount(bankData);
  return {
    success: res.success,
    verifiedName: res.data?.beneficiaryName || bankData.accountHolderName || "",
    isMock: res.isMock,
  };
};

export * from "./instantLoanApi";
export * from "./instantLoanCalculations";
export * from "./instantLoanRules";
export * from "./instantLoanPersonas";
export * from "./instantLoanMonitoring";
export * from "./instantLoanAuditService";
export * from "./instantLoanTests";

