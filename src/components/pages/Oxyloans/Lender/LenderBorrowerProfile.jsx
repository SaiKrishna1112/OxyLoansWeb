import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import Footer from "../../../Footer/Footer";
import axios from "axios";
import Swal from "sweetalert2";
import BASE_URL from "../../../../config";
import {
  base_url,
  getUserDetailsForBorrower,
  getBorrowerReferenceDetails,
  getBorrowerDocuments,
  getBorrowerLoanDetails,
  lenderInterestedBorrowers,
  getToken,
  getUserId,
  getBorrowerSalaryDetails,
  getBorrowerAnalysis,
  getBorrowerCreditReport,
  getMarketplaceOxyScore,
} from "../../../HttpRequest/afterlogin";
import { calculateBorrowerProfileCompleteness } from "../../../../utils/borrowerValidation";
import CreditScoreGauge from "../Borrower/redesign/components/CreditScoreGauge";
import {
  parseCreditReportData,
  formatINR,
  maskAccountNumber,
  getScoreTier,
} from "../Borrower/redesign/components/creditReportUtils";
import "./LenderBorrowerProfile.css";

const PRIMARY = "#2563eb";

// ── Financial Calculation Helper ─────────────────────────────────────────────
export const calculateOfferEMI = (principal, annualRate, tenureMonths) => {
  const p = Number(principal || 0);
  const r = Number(annualRate || 0) / 12 / 100;
  const n = Number(tenureMonths || 1);
  if (p <= 0 || n <= 0) return 0;
  if (r === 0) return Math.round(p / n);
  const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
};

// ── Masking Helpers ──────────────────────────────────────────────────────────
export const maskPhone = (phone) => {
  if (!phone) return "—";
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length >= 10) {
    return `+91 ••••• •${digits.slice(-4)}`;
  }
  return `••••••${String(phone).slice(-3)}`;
};

export const maskEmail = (email) => {
  if (!email || !String(email).includes("@")) return "—";
  const [user, domain] = String(email).split("@");
  const visible = user.slice(0, 2);
  return `${visible}••••@${domain}`;
};

export const maskPan = (pan) => {
  if (!pan) return "—";
  const str = String(pan).trim();
  if (str.length === 10) {
    return `••••••${str.slice(-4)}`;
  }
  return `••••••${str.slice(-3)}`;
};

export const maskAadhaar = (aadhaar) => {
  if (!aadhaar) return "—";
  const digits = String(aadhaar).replace(/\D/g, "");
  if (digits.length === 12) {
    return `•••• •••• ${digits.slice(-4)}`;
  }
  return `••••••••${String(aadhaar).slice(-4)}`;
};

export const maskAccount = (acc) => {
  if (!acc) return "—";
  const str = String(acc).trim();
  if (str.length >= 4) {
    return `••••••••${str.slice(-4)}`;
  }
  return "••••••••";
};

// ── Document Labels & Helpers ────────────────────────────────────────────────
const DOC_LABELS = {
  AADHAR: "Aadhaar Card",
  PASSPORT: "Passport",
  VOTERID: "Voter ID Card",
  DRIVINGLICENCE: "Driving Licence",
  PAN: "PAN Card",
  PAYSLIPS: "Latest Payslips",
  BANKSTATEMENT: "Bank Statement",
  CHEQUELEAF: "Cancelled Cheque Leaf",
  CREDITREPORT: "Credit Bureau Report",
  OFFERLETTER: "Employment Offer Letter",
  TENTH: "10th Marksheet",
  INTERMEDIATE: "12th / Inter Marksheet",
  GRADUATION: "Graduation Certificate",
  FEERECEIPT: "College Fee Receipt",
};

const DOC_CATEGORIES = [
  {
    title: "Identity & Citizenship",
    icon: "fa-id-card",
    keys: ["AADHAR", "PAN", "PASSPORT", "VOTERID", "DRIVINGLICENCE"],
  },
  {
    title: "Financial & Income Proof",
    icon: "fa-file-invoice-dollar",
    keys: ["PAYSLIPS", "BANKSTATEMENT", "CHEQUELEAF", "CREDITREPORT"],
  },
  {
    title: "Employment & Academic Records",
    icon: "fa-graduation-cap",
    keys: ["OFFERLETTER", "GRADUATION", "INTERMEDIATE", "TENTH", "FEERECEIPT"],
  },
];

const isImage = (filename) => {
  if (!filename) return false;
  return /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(filename);
};

// ── 8 Mandatory Lender Consents ──────────────────────────────────────────────
const LENDER_CONSENTS = [
  {
    id: "loan_processing",
    title: "1. Loan Processing Consent",
    subtitle: "Consent to evaluate and process borrower's loan request",
    text: "I confirm that I have reviewed the borrower's loan application and supporting documents. I consent to proceed with the evaluation, processing, and decision-making for this loan request in accordance with applicable policies and guidelines.",
  },
  {
    id: "credit_assessment",
    title: "2. Credit Assessment Consent",
    subtitle: "Consent to assess borrower's creditworthiness",
    text: "I authorize the platform to evaluate the borrower's credit profile, including credit bureau data, OxyScore, and repayment obligations, for the purpose of making an informed lending decision.",
  },
  {
    id: "doc_verification",
    title: "3. Document Verification Consent",
    subtitle: "Consent to verify submitted documents",
    text: "I consent to the verification of all documents submitted by the borrower, including identity, address, income, and financial records, through authorized third-party verification agencies.",
  },
  {
    id: "loan_approval",
    title: "4. Loan Approval Consent",
    subtitle: "Consent to approve and sanction loan",
    text: "I confirm that based on the available information and risk assessment, I approve the loan for the borrower under the agreed terms and conditions, subject to final documentation and compliance checks.",
  },
  {
    id: "disbursement",
    title: "5. Disbursement Consent",
    subtitle: "Consent to release loan funds",
    text: "I authorize the disbursement of the approved loan amount to the borrower's designated bank account after successful completion of all required checks and formalities.",
  },
  {
    id: "data_sharing",
    title: "6. Data Sharing Consent",
    subtitle: "Consent for sharing borrower data",
    text: "I agree that the borrower's information may be securely shared with relevant financial institutions, credit bureaus, and regulatory authorities as required for loan processing and reporting.",
  },
  {
    id: "risk_acknowledgment",
    title: "7. Risk Acknowledgment",
    subtitle: "Lender acknowledges financial risk",
    text: "I understand and acknowledge that peer-to-peer lending involves financial risk, including the possibility of delayed payments or default, and I accept full responsibility for my lending decision.",
  },
  {
    id: "compliance",
    title: "8. Compliance & Regulatory Consent",
    subtitle: "Adherence to legal and regulatory requirements",
    text: "I confirm that this lending decision complies with all applicable laws, RBI P2P regulations, and internal risk policies, and I agree to adhere to ongoing compliance requirements.",
  },
];

const getApiErrorMessage = (responseOrError) =>
  responseOrError?.response?.data?.errorMessage ||
  responseOrError?.response?.data?.message ||
  responseOrError?.data?.errorMessage ||
  responseOrError?.data?.message ||
  responseOrError?.message ||
  "Something went wrong. Please try again.";

export default function LenderBorrowerProfile() {
  const { borrowerId: paramId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Resolve borrowerId from param, search params, or route state
  const searchParams = new URLSearchParams(location.search);
  const passedBorrower = location.state?.borrower || null;
  const borrowerId =
    paramId ||
    searchParams.get("borrowerId") ||
    searchParams.get("userId") ||
    passedBorrower?.borrowerId ||
    location.state?.borrowerId ||
    location.state?.userId;

  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [references, setReferences] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loanDetails, setLoanDetails] = useState([]);
  const [oxyScoreData, setOxyScoreData] = useState(null);
  const [borrowerSalaryData, setBorrowerSalaryData] = useState(null);
  const [bankAnalysisData, setBankAnalysisData] = useState(null);
  const [creditReportData, setCreditReportData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [bureauAccountFilter, setBureauAccountFilter] = useState("all");
  const [bureauSearch, setBureauSearch] = useState("");

  // Document modal viewer state
  const [viewDoc, setViewDoc] = useState(null);

  // Send Offer Modal state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedLoanForOffer, setSelectedLoanForOffer] = useState(null);
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerErrors, setOfferErrors] = useState({});
  const [offerData, setOfferData] = useState({
    amount: "",
    tenure: "6", // Standard OxyLoans 6-Month locking period default
    roi: "18",
    durationType: "Months",
    repaymentMethodForLender: "PI",
    comments: "",
    consentItems: new Array(LENDER_CONSENTS.length).fill(false),
    isPresetLocked: false,
    presetTitle: null,
  });

  const agreeAllRef = useRef(null);
  const [showConsentDetails, setShowConsentDetails] = useState(false);

  useEffect(() => {
    if (agreeAllRef.current) {
      const checkedCount = offerData.consentItems.filter(Boolean).length;
      agreeAllRef.current.indeterminate = checkedCount > 0 && checkedCount < LENDER_CONSENTS.length;
    }
  }, [offerData.consentItems]);

  // ── Fetch Borrower Data ──────────────────────────────────────────────────
  const fetchAllBorrowerData = useCallback(async () => {
    if (!borrowerId) {
      setError("No Borrower ID provided in the URL.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const currentUserId = getUserId();
      const token = getToken();

      // Parallel fetch of all live borrower endpoints (100% Live APIs)
      const [
        userRes,
        refRes,
        docsRes,
        loanRes,
        oxyRes,
        salaryRes,
        analysisRes,
        creditRes,
      ] = await Promise.allSettled([
        getUserDetailsForBorrower(borrowerId).catch(async () => {
          // Fallback to personal endpoint if getBorrowersInfo fails
          return axios.get(`${base_url}personal/${borrowerId}`, {
            headers: { accessToken: token },
          });
        }),
        getBorrowerReferenceDetails(borrowerId).catch(() => null),
        getBorrowerDocuments(borrowerId).catch(() => null),
        getBorrowerLoanDetails(borrowerId).catch(() => null),
        getMarketplaceOxyScore(borrowerId).catch(() => null),
        getBorrowerSalaryDetails(borrowerId).catch(() => null),
        getBorrowerAnalysis(borrowerId).catch(() => null),
        getBorrowerCreditReport(borrowerId).catch(() => null),
      ]);

      // 1. Live Profile extraction
      let prof = null;
      if (userRes.status === "fulfilled" && userRes.value) {
        prof = userRes.value?.data || userRes.value;
      }
      setProfile(prof);

      // 2. Live References extraction
      let refList = [];
      if (refRes.status === "fulfilled" && refRes.value) {
        const d = refRes.value?.data || refRes.value;
        if (Array.isArray(d)) refList = d;
        else if (Array.isArray(d?.referenceDto)) refList = d.referenceDto;
        else if (Array.isArray(d?.referenceDetailsResponseDto)) refList = d.referenceDetailsResponseDto;
      }
      if (refList.length === 0 && prof) {
        if (Array.isArray(prof.referenceDto)) refList = prof.referenceDto;
        else if (Array.isArray(prof.referenceDetailsResponseDto)) refList = prof.referenceDetailsResponseDto;
      }
      setReferences(refList);

      // 3. Live Documents extraction
      let docList = [];
      if (docsRes.status === "fulfilled" && docsRes.value) {
        const d = docsRes.value?.data || docsRes.value;
        if (Array.isArray(d)) docList = d;
      }
      setDocuments(docList);

      // 4. Live Loan Details extraction
      let loans = [];
      if (loanRes.status === "fulfilled" && loanRes.value) {
        const d = loanRes.value?.data || loanRes.value;
        if (Array.isArray(d)) loans = d;
        else if (d && typeof d === "object" && (d.requestAmount || d.loanRequestAmount)) {
          loans = [d];
        }
      }
      setLoanDetails(loans);

      // 5. Live OxyScore extraction
      if (oxyRes.status === "fulfilled" && oxyRes.value) {
        setOxyScoreData(oxyRes.value?.data || null);
      }

      // 6. Live Verified Salary extraction
      if (salaryRes.status === "fulfilled" && salaryRes.value) {
        const sData = salaryRes.value?.data?.data || salaryRes.value?.data || {};
        const sList = Array.isArray(sData.salaryDetails) ? sData.salaryDetails : Array.isArray(sData) ? sData : [];
        if (sList.length > 0) setBorrowerSalaryData(sList[0]);
      }

      // 7. Live Bank Statement Analysis extraction
      if (analysisRes.status === "fulfilled" && analysisRes.value) {
        const aData = analysisRes.value?.data?.data || analysisRes.value?.data || null;
        if (aData) setBankAnalysisData(aData);
      }

      // 8. Live Stored CIBIL / Credit Report via paysprint/credit-report/{borrowerId}
      if (creditRes.status === "fulfilled" && creditRes.value) {
        const cData = creditRes.value?.data?.data || creditRes.value?.data;
        if (cData) {
          const parsed = parseCreditReportData(cData);
          setCreditReportData(parsed || null);
        } else {
          setCreditReportData(null);
        }
      } else {
        setCreditReportData(null);
      }

      if (!prof && loans.length === 0 && docList.length === 0) {
        setError(`Unable to load borrower details for ID #${borrowerId}. Please verify the borrower ID or try again.`);
      }
    } catch (err) {
      console.error("Error fetching borrower profile:", err);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [borrowerId]);

  useEffect(() => {
    fetchAllBorrowerData();
  }, [fetchAllBorrowerData]);

  // ── Profile Completeness Math ────────────────────────────────────────────
  const completeness = useMemo(() => {
    if (!profile) return { percentage: 0, isEligibleToRaiseLoan: false, missingRequirements: [] };
    return calculateBorrowerProfileCompleteness(profile, references, null, {
      accountNumber: profile.accountNumber,
      ifscCode: profile.ifscCode,
      bankName: profile.bankName,
      bankDetailsInfo: profile.bankDetailsInfo,
    });
  }, [profile, references]);

  // Calculated Age
  const calculatedAge = useMemo(() => {
    if (!profile?.dob) return null;
    const parts = String(profile.dob).split(/[-/]/);
    let birthDate;
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        birthDate = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
      }
      if (!isNaN(birthDate.getTime())) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
      }
    }
    return null;
  }, [profile?.dob]);

  // Borrower Name
  const fullName = useMemo(() => {
    if (!profile) return `Borrower #${borrowerId}`;
    const n = [profile.firstName, profile.middleName, profile.lastName].filter(Boolean).join(" ");
    return n.trim() || `Borrower #${borrowerId}`;
  }, [profile, borrowerId]);

  // Active Loan Request (primary)
  const activeLoan = useMemo(() => {
    return (
      loanDetails.find(
        (l) =>
          l.loanRequestStatus !== "CLOSED" &&
          (l.requestAmount || l.loanRequestAmount || l.partiallyPendingAmount)
      ) || loanDetails[0] || null
    );
  }, [loanDetails]);

  // ── Financial & Bureau Risk Calculations (100% Live APIs) ─────────────────
  const monthlyIncome = useMemo(() => {
    return (
      Number(profile?.salary) ||
      Number(profile?.salaryIncomeMonthly) ||
      Number(borrowerSalaryData?.salary) ||
      Number(borrowerSalaryData?.netSalary) ||
      Number(bankAnalysisData?.averageMonthlySalary) ||
      Number(oxyScoreData?.dbrAnalysis?.monthlyIncome) ||
      0
    );
  }, [profile, borrowerSalaryData, bankAnalysisData, oxyScoreData]);

  const existingEMIs = useMemo(() => {
    if (oxyScoreData?.dbrAnalysis?.existingEMIs != null) {
      return Number(oxyScoreData.dbrAnalysis.existingEMIs);
    }
    if (bankAnalysisData?.monthlyEmiOutflow != null) {
      return Number(bankAnalysisData.monthlyEmiOutflow);
    }
    if (creditReportData?.metrics?.totalBalance) {
      return Math.round(Number(creditReportData.metrics.totalBalance) * 0.05);
    }
    return 0;
  }, [oxyScoreData, bankAnalysisData, creditReportData]);

  const dtiRatio = useMemo(() => {
    if (monthlyIncome <= 0) return 0;
    return Number(((existingEMIs / monthlyIncome) * 100).toFixed(1));
  }, [existingEMIs, monthlyIncome]);

  const maxPermissibleEMI = useMemo(() => {
    return Math.round(monthlyIncome * 0.50); // 50% regulatory banking cap
  }, [monthlyIncome]);

  const maxNewEMI = useMemo(() => {
    return Math.max(0, maxPermissibleEMI - existingEMIs);
  }, [maxPermissibleEMI, existingEMIs]);

  const maxEligibleLoan = useMemo(() => {
    return (
      Number(profile?.eligibleAmount) ||
      Number(profile?.eligibleamount) ||
      Number(profile?.borrowerEligibleAmount) ||
      Number(passedBorrower?.eligibleAmount) ||
      Number(passedBorrower?.eligibleamount) ||
      Number(oxyScoreData?.dbrAnalysis?.loanEligible) ||
      (maxNewEMI > 0 ? maxNewEMI * 12 : 0)
    );
  }, [profile, passedBorrower, oxyScoreData, maxNewEMI]);

  const surplusIncome = useMemo(() => {
    return Math.max(0, monthlyIncome - existingEMIs);
  }, [monthlyIncome, existingEMIs]);

  const cardBalance = useMemo(() => {
    return Number(creditReportData?.metrics?.totalBalance || 0);
  }, [creditReportData]);

  const cardLimit = useMemo(() => {
    return Number(creditReportData?.metrics?.totalLimit || 0);
  }, [creditReportData]);

  const cardUtilization = useMemo(() => {
    if (cardLimit > 0) {
      return Number(((cardBalance / cardLimit) * 100).toFixed(1));
    }
    return Number(creditReportData?.metrics?.utilizationRatio || 0);
  }, [cardBalance, cardLimit, creditReportData]);

  const bureauScore = useMemo(() => {
    return (
      Number(profile?.cibilScore) ||
      Number(profile?.cibilscore) ||
      Number(passedBorrower?.cibilScore) ||
      Number(passedBorrower?.cibilscore) ||
      Number(creditReportData?.score) ||
      Number(oxyScoreData?.oxyScore) ||
      0
    );
  }, [profile, passedBorrower, creditReportData, oxyScoreData]);

  const scoreTier = useMemo(() => {
    if (!bureauScore || bureauScore <= 0) {
      return {
        tier: "No Bureau Score",
        rating: "N/A",
        color: "#6c757d",
        badgeBg: "#f8f9fa",
        badgeBorder: "#dee2e6",
        pillClass: "bg-secondary text-white",
        description: "No institutional CIBIL or bureau score is recorded for this borrower.",
      };
    }
    return getScoreTier(bureauScore);
  }, [bureauScore]);

  // ── Borrower Credit Cycle & Tenure Eligibility ──────────────────────────
  // User Rule:
  // 1. Cycle 1: First-time borrower -> 30 Days and 3 Months only.
  // 2. Cycle 2: After repaying first loan -> Recheck all conditions, unlock 6 Months.
  // 3. Cycle 3: After 6-month loan cycle completed -> Unlock 12 Months.
  const borrowerRepaymentCycle = useMemo(() => {
    const closedLoans = loanDetails.filter(
      (l) => String(l.loanRequestStatus || "").toUpperCase() === "CLOSED"
    );
    const closedCount = closedLoans.length;

    const hasCompleted6MLoan = closedLoans.some((l) => {
      const d = Number(l.duration || l.durationMonths || 0);
      const isDays = String(l.durationType || "").toUpperCase() === "DAYS";
      const tenureInMonths = isDays ? d / 30 : d;
      return tenureInMonths >= 5.5; // ~6 months
    });

    const totalLoansCount = Number(
      oxyScoreData?.repaymentHistory?.totalLoansCount ||
      profile?.closedLoansCount ||
      closedCount
    );

    if (hasCompleted6MLoan || (closedCount >= 2 && totalLoansCount >= 2)) {
      return {
        cycle: 3,
        tierName: "Cycle 3 (Matured Borrower)",
        badge: "Tier 3 • 12M Unlocked",
        allowedTenures: [1, 3, 6, 12],
        canOffer30D: true,
        canOffer3M: true,
        canOffer6M: true,
        canOffer12M: true,
        description: "Borrower has successfully completed a 6-month loan cycle. All locking periods up to 12 months are unlocked.",
      };
    } else if (closedCount >= 1 || totalLoansCount >= 1) {
      return {
        cycle: 2,
        tierName: "Cycle 2 (Repeat Borrower)",
        badge: "Tier 2 • 6M Unlocked",
        allowedTenures: [1, 3, 6],
        canOffer30D: true,
        canOffer3M: true,
        canOffer6M: true,
        canOffer12M: false,
        description: "Borrower has successfully repaid their first loan cycle. Rechecked conditions: 6-Month Locking Period unlocked.",
      };
    } else {
      // First-time borrower (0 closed loans)
      return {
        cycle: 1,
        tierName: "Cycle 1 (First-Time Borrower)",
        badge: "Tier 1 • Starter (30D & 3M)",
        allowedTenures: [1, 3],
        canOffer30D: true,
        canOffer3M: true,
        canOffer6M: false,
        canOffer12M: false,
        description: "First-time borrower: Eligible for 30 Days and 3 Months only. 6-Month Locking Period unlocks post first loan repayment.",
      };
    }
  }, [loanDetails, oxyScoreData, profile]);

  const riskGrade = useMemo(() => {
    const score = bureauScore;
    const requested = activeLoan
      ? Number(activeLoan.partiallyPendingAmount || activeLoan.loanRequestAmount || activeLoan.requestAmount || 0)
      : Number(maxEligibleLoan || 0);
    const safeSuggestedAmt = requested > 0 ? requested : maxEligibleLoan > 0 ? Math.min(maxEligibleLoan, 50000) : 25000;

    // Derived safe tenure adhering strictly to borrower repayment credit cycle
    const maxCycleTenure = borrowerRepaymentCycle.cycle === 1 ? 3 : borrowerRepaymentCycle.cycle === 2 ? 6 : 12;
    const loanDuration = activeLoan?.duration ? Number(activeLoan.duration) : maxCycleTenure;
    const safeTenure = Math.min(loanDuration, maxCycleTenure);

    // When there is NO credit report and NO verified bureau score
    if (!creditReportData && (!score || score <= 0)) {
      return {
        grade: "N/A",
        title: "Unrated (No Bureau Report)",
        badgeClass: "bg-secondary text-white",
        badgeSubtle: "bg-secondary-subtle text-secondary",
        color: "#6c757d",
        recommendedRoiRange: "18% – 24%",
        suggestedRoi: 20,
        suggestedTenure: safeTenure,
        suggestedAmount: safeSuggestedAmt,
        summary: "No bureau credit report is on record for this borrower. Evaluate offer based on verified salary, KYC documentation, and platform capacity.",
        safetyTag: "PROFILE EVALUATION",
        stars: 3,
      };
    }

    const dti = dtiRatio;
    const pastDue = Number(creditReportData?.metrics?.pastDueAmount || 0);
    const bounces = Number(oxyScoreData?.repaymentHistory?.bounceCount || bankAnalysisData?.bounceCount || 0);

    if (score >= 750 && dti <= 40 && pastDue === 0 && bounces === 0) {
      return {
        grade: "A+",
        title: "Prime+ (Very Low Risk)",
        badgeClass: "bg-success text-white",
        badgeSubtle: "bg-success-subtle text-success",
        color: "#059669",
        recommendedRoiRange: "16% – 18%",
        suggestedRoi: 18,
        suggestedTenure: safeTenure,
        suggestedAmount: safeSuggestedAmt,
        summary: "Exceptional credit profile with zero delinquencies, low debt burden, and steady income. Safe for immediate funding.",
        safetyTag: "SAFE TO FUND",
        stars: 5,
      };
    } else if (score >= 700 && dti <= 50 && pastDue === 0) {
      return {
        grade: "A",
        title: "Prime (Low Risk)",
        badgeClass: "lbp-badge-starter",
        badgeSubtle: "bg-primary-subtle text-primary",
        color: "#2563eb",
        recommendedRoiRange: "18% – 20%",
        suggestedRoi: 19,
        suggestedTenure: safeTenure,
        suggestedAmount: safeSuggestedAmt,
        summary: "Strong credit history with moderate debt obligations. High approval and timely repayment confidence.",
        safetyTag: "LOW RISK",
        stars: 4,
      };
    } else if (score >= 650 && dti <= 60) {
      return {
        grade: "B",
        title: "Standard (Moderate Risk)",
        badgeClass: "bg-warning text-dark",
        badgeSubtle: "bg-warning-subtle text-warning",
        color: "#d97706",
        recommendedRoiRange: "20% – 24%",
        suggestedRoi: 22,
        suggestedTenure: safeTenure,
        suggestedAmount: safeSuggestedAmt,
        summary: "Moderate risk factors present. Best suited for balanced allocation with elevated interest return.",
        safetyTag: "MODERATE RISK",
        stars: 3,
      };
    } else {
      return {
        grade: "C",
        title: "Subprime (Elevated Risk)",
        badgeClass: "bg-danger text-white",
        badgeSubtle: "bg-danger-subtle text-danger",
        color: "#dc2626",
        recommendedRoiRange: "24% – 28%",
        suggestedRoi: 24,
        suggestedTenure: safeTenure,
        suggestedAmount: Math.min(safeSuggestedAmt, 15000),
        summary: "Elevated credit risk or high debt burden. Exercise caution and consider smaller offer amounts.",
        safetyTag: "ELEVATED RISK",
        stars: 2,
      };
    }
  }, [bureauScore, dtiRatio, creditReportData, oxyScoreData, activeLoan, maxNewEMI, borrowerRepaymentCycle]);

  const prosList = useMemo(() => {
    const list = [];

    if (bureauScore >= 750) {
      list.push({
        title: `Prime Bureau Score (${bureauScore}/900)`,
        desc: `Borrower falls in the "${scoreTier.tier}" tier, indicating consistent credit discipline and very low default risk.`,
        icon: "fa-shield-halved",
      });
    } else if (bureauScore >= 700) {
      list.push({
        title: `Good Bureau Score (${bureauScore}/900)`,
        desc: `Solid credit history with consistent repayment record across previous credit facilities.`,
        icon: "fa-shield",
      });
    }

    const pastDue = creditReportData?.metrics?.pastDueAmount || 0;
    const writeOffs = creditReportData?.metrics?.writeOffs || 0;
    if (pastDue === 0 && writeOffs === 0) {
      list.push({
        title: "Zero Past Due & Zero Write-Offs",
        desc: `Non-Delinquent status across 24-48 months with ₹0 overdue debt obligations and zero settlement accounts.`,
        icon: "fa-circle-check",
      });
    }

    if (dtiRatio <= 40) {
      list.push({
        title: `Healthy Debt Burden Ratio (${dtiRatio}%)`,
        desc: `Only ${dtiRatio}% of verified monthly salary goes toward debt repayment, leaving ₹${surplusIncome.toLocaleString("en-IN")}/mo surplus disposable income.`,
        icon: "fa-wallet",
      });
    } else if (dtiRatio <= 50) {
      list.push({
        title: `Acceptable Debt Burden (${dtiRatio}%)`,
        desc: `Committed debt payments remain within regulatory safe limits (<50% cap).`,
        icon: "fa-wallet",
      });
    }

    if (profile?.salary && Number(profile.salary) > 0) {
      list.push({
        title: `Verified Salaried Income (₹${Number(profile.salary).toLocaleString("en-IN")}/mo)`,
        desc: `Stable monthly payroll at ${profile.companyName || "established firm"} (${profile.designation || "Professional"}).`,
        icon: "fa-briefcase",
      });
    }

    const creditAgeYears = Number(creditReportData?.metrics?.creditAgeYears || 0);
    if (creditReportData && creditAgeYears >= 3) {
      list.push({
        title: `Established Credit Vintage (${creditAgeYears} Years)`,
        desc: `Over ${creditAgeYears} years of institutional credit track record demonstrating long-term creditworthiness.`,
        icon: "fa-hourglass-half",
      });
    }

    if (references.length >= 2) {
      list.push({
        title: `2 Emergency References Verified`,
        desc: `Borrower has submitted 2 mandatory emergency contacts with complete contact details and addresses.`,
        icon: "fa-users",
      });
    }

    if (completeness.percentage >= 90) {
      list.push({
        title: `High Profile Completeness (${completeness.percentage}%)`,
        desc: `Profile is ${completeness.percentage}% complete with verified PAN, Aadhaar, bank account, and documentation.`,
        icon: "fa-file-shield",
      });
    }

    return list;
  }, [bureauScore, scoreTier, creditReportData, dtiRatio, surplusIncome, profile, references, completeness]);

  const consList = useMemo(() => {
    const list = [];

    if (cardUtilization > 50) {
      list.push({
        title: `High Credit Card Utilization (${cardUtilization}%)`,
        desc: `Outstanding card balance is ₹${Number(creditReportData?.metrics?.totalBalance || 0).toLocaleString("en-IN")} out of ₹${Number(creditReportData?.metrics?.totalLimit || 0).toLocaleString("en-IN")} total limit.`,
        icon: "fa-credit-card",
        severity: "medium",
        badge: "Watch Factor",
      });
    } else if (cardUtilization > 30) {
      list.push({
        title: `Moderate Credit Card Utilization (${cardUtilization}%)`,
        desc: `Card balances are slightly elevated above the ideal 30% credit health guideline.`,
        icon: "fa-credit-card",
        severity: "low",
        badge: "Moderate",
      });
    }

    if (dtiRatio > 50) {
      list.push({
        title: `Elevated Debt Burden Ratio (${dtiRatio}%)`,
        desc: `More than half of monthly income is dedicated to existing loan EMIs, reducing buffer for emergencies.`,
        icon: "fa-scale-unbalanced",
        severity: "high",
        badge: "High Debt",
      });
    }

    list.push({
      title: "Unsecured Peer-to-Peer Facility",
      desc: "This loan request is unsecured without physical asset hypothecation; repayment depends on borrower cash flow.",
      icon: "fa-shield-exclamation",
      severity: "medium",
      badge: "Unsecured",
    });

    const activeCount = Number(creditReportData?.metrics?.activeAccountsCount || 0);
    if (creditReportData && activeCount > 0) {
      list.push({
        title: `${activeCount} Active Tradeline(s) Running`,
        desc: `Borrower has active open credit line with ₹${Number(creditReportData?.metrics?.totalBalance || 0).toLocaleString("en-IN")} aggregate debt balance.`,
        icon: "fa-chart-line",
        severity: "low",
        badge: "Open Loans",
      });
    }

    list.push({
      title: "Regulatory P2P Lending Risk",
      desc: "Peer-to-peer lending is subject to borrower repayment performance; investments are not bank deposits or capital guaranteed.",
      icon: "fa-triangle-exclamation",
      severity: "info",
      badge: "Regulatory Notice",
    });

    return list;
  }, [cardUtilization, dtiRatio, creditReportData]);

  // Filtered bureau accounts
  const filteredBureauAccounts = useMemo(() => {
    if (!creditReportData?.accounts) return [];
    let list = creditReportData.accounts;

    if (bureauAccountFilter === "active") {
      list = list.filter((acc) => String(acc.open).toLowerCase() === "yes" || acc.accountStatus?.toLowerCase().includes("current"));
    } else if (bureauAccountFilter === "closed") {
      list = list.filter((acc) => String(acc.open).toLowerCase() === "no" || acc.accountStatus?.toLowerCase().includes("closed"));
    } else if (bureauAccountFilter === "cards") {
      list = list.filter((acc) => acc.accountType?.toLowerCase().includes("card"));
    } else if (bureauAccountFilter === "loans") {
      list = list.filter((acc) => !acc.accountType?.toLowerCase().includes("card"));
    }

    if (bureauSearch.trim()) {
      const q = bureauSearch.toLowerCase();
      list = list.filter(
        (acc) =>
          acc.institution?.toLowerCase().includes(q) ||
          acc.accountNumber?.includes(q) ||
          acc.accountType?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [creditReportData?.accounts, bureauAccountFilter, bureauSearch]);

  const estimatedReturn = useMemo(() => {
    return calculateOfferEMI(riskGrade.suggestedAmount, riskGrade.suggestedRoi, riskGrade.suggestedTenure);
  }, [riskGrade]);

  const totalEstimatedReturn = useMemo(() => {
    return estimatedReturn * riskGrade.suggestedTenure;
  }, [estimatedReturn, riskGrade.suggestedTenure]);

  const estimatedProfit = useMemo(() => {
    return Math.max(0, totalEstimatedReturn - riskGrade.suggestedAmount);
  }, [totalEstimatedReturn, riskGrade.suggestedAmount]);

  // ── Surplus Income & Affordability Breakdown ─────────────────────────────
  const livingExpenses = useMemo(() => {
    // 35% standard living & household expense allocation benchmark
    return Math.round(monthlyIncome * 0.35);
  }, [monthlyIncome]);

  const totalMonthlyOutflow = useMemo(() => {
    return existingEMIs + livingExpenses;
  }, [existingEMIs, livingExpenses]);

  const netMonthlySurplus = useMemo(() => {
    return Math.max(0, monthlyIncome - totalMonthlyOutflow);
  }, [monthlyIncome, totalMonthlyOutflow]);

  const safeEmiHeadroom = useMemo(() => {
    // Conservative underwriting: max 60% of net surplus or DBR maxNewEMI limit
    if (netMonthlySurplus > 0) {
      const surplusCap = Math.round(netMonthlySurplus * 0.60);
      return maxNewEMI > 0 ? Math.min(maxNewEMI, surplusCap) : surplusCap;
    }
    return maxNewEMI > 0 ? maxNewEMI : 0;
  }, [netMonthlySurplus, maxNewEMI]);

  const surplusBasedOffers = useMemo(() => {
    const targetAmt = Number(
      activeLoan?.partiallyPendingAmount ||
      activeLoan?.loanRequestAmount ||
      activeLoan?.requestAmount ||
      maxEligibleLoan ||
      30000
    );

    const safeEmi = safeEmiHeadroom > 0 ? safeEmiHeadroom : 2500;
    const baseSurplus = netMonthlySurplus > 0 ? netMonthlySurplus : 5000;
    const borrowerRoi = Number(activeLoan?.rateOfInterest || activeLoan?.preferredMinRate || riskGrade.suggestedRoi || 18);

    // 1. 30-Day Payday Bullet Calculation
    const amt30D = Math.min(30000, targetAmt);
    const roi30D = 16;
    const interest30D = Math.round(amt30D * (roi30D / 100) * (30 / 365));
    const total30D = amt30D + interest30D;

    // 2. 3-Month Equal EMI Calculation
    const amt3M = Math.max(500, Math.min(targetAmt, Math.round((safeEmi * 2.8) / 500) * 500));
    const roi3M = borrowerRoi || 18;
    const emi3M = calculateOfferEMI(amt3M, roi3M, 3);
    const totalInt3M = Math.max(0, emi3M * 3 - amt3M);

    // 3. 6-Month Locking Period Calculation
    const roi6M = Number(riskGrade.suggestedRoi || borrowerRoi || 18);
    const amt6M = Math.max(500, Math.min(targetAmt, Math.round((safeEmi * 5.4) / 500) * 500));
    const emi6M = calculateOfferEMI(amt6M, roi6M, 6);
    const totalInt6M = Math.max(0, emi6M * 6 - amt6M);

    // 4. 12-Month Locking Period Calculation
    const max12MCap = maxEligibleLoan > 0 ? maxEligibleLoan : Math.round(targetAmt * 1.5);
    const amt12M = Math.max(500, Math.min(max12MCap, Math.round((safeEmi * 10) / 500) * 500));
    const roi12M = Math.max(20, roi6M + 1);
    const emi12M = calculateOfferEMI(amt12M, roi12M, 12);
    const totalInt12M = Math.max(0, emi12M * 12 - amt12M);

    if (borrowerRepaymentCycle.cycle === 1) {
      // Cycle 1: First-time borrower -> 3 Months and 30 Days ONLY
      return [
        {
          id: "starter_3m",
          title: "3-Month Equal EMI",
          subtitle: "First-time borrower: Spread across 3 equal monthly installments",
          badge: "★ 3M Starter (Recommended)",
          badgeColor: "lbp-badge-starter",
          badgeStyle: {
            background: "linear-gradient(135deg, #0040e0 0%, #1d4ed8 100%)",
            color: "#ffffff",
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: "999px",
            boxShadow: "0 2px 6px rgba(0, 64, 224, 0.25)",
          },
          btnVariant: "primary",
          featured: true,
          amount: amt3M,
          tenure: 3,
          durationType: "Months",
          repaymentMethod: "PI",
          lockingPeriod: "3 Months",
          roi: roi3M,
          monthlyEmi: emi3M,
          totalInterest: totalInt3M,
          surplusPct: Math.round((emi3M / baseSurplus) * 100),
          status: emi3M <= safeEmi ? "Comfortable Margin" : "Moderate",
          tag: "Starter Plan",
          btnLabel: `Give ₹${amt3M.toLocaleString("en-IN")} Offer (3 Months)`,
        },
        {
          id: "bullet_30d",
          title: "30-Day Payday Bullet",
          subtitle: "Single settlement on upcoming salary credit",
          badge: "⚡ 30-Day Payday Bullet",
          badgeColor: "lbp-badge-payday",
          badgeStyle: {
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#ffffff",
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: "999px",
            boxShadow: "0 2px 6px rgba(16, 185, 129, 0.25)",
          },
          btnVariant: "success",
          featured: false,
          amount: amt30D,
          tenure: 30,
          durationType: "Days",
          repaymentMethod: "PI",
          lockingPeriod: "30 Days (1 Month)",
          roi: roi30D,
          monthlyEmi: total30D,
          totalInterest: interest30D,
          surplusPct: Math.round((total30D / baseSurplus) * 100),
          status: total30D <= safeEmi ? "Safe Settlement" : "Manageable",
          tag: "Fastest Closure",
          btnLabel: `Give ₹${amt30D.toLocaleString("en-IN")} Offer (30 Days)`,
        },
      ];
    } else if (borrowerRepaymentCycle.cycle === 2) {
      // Cycle 2: Repeat borrower -> 6 Months Unlocked post 1st repayment
      return [
        {
          id: "optimal_6m",
          title: "6-Month Locking Period",
          subtitle: "Unlocked after 1st on-time repayment: Balanced 6-month lock-in",
          badge: "★ 6M Lock-in (Unlocked)",
          badgeColor: "lbp-badge-lock6m",
          badgeStyle: {
            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            color: "#ffffff",
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: "999px",
            boxShadow: "0 2px 6px rgba(5, 150, 105, 0.25)",
          },
          btnVariant: "success",
          featured: true,
          amount: amt6M,
          tenure: 6,
          durationType: "Months",
          repaymentMethod: "PI",
          lockingPeriod: "6 Months",
          roi: roi6M,
          monthlyEmi: emi6M,
          totalInterest: totalInt6M,
          surplusPct: Math.round((emi6M / baseSurplus) * 100),
          status: emi6M <= safeEmi ? "Comfortable Margin" : "Moderate",
          tag: "6M Lock-in",
          btnLabel: `Give ₹${amt6M.toLocaleString("en-IN")} Offer (6M Lock-in)`,
        },
        {
          id: "starter_3m",
          title: "3-Month Equal EMI",
          subtitle: "Shorter alternative with fast principal turnover",
          badge: "3M Quick Return",
          badgeColor: "lbp-badge-starter",
          badgeStyle: {
            background: "linear-gradient(135deg, #0040e0 0%, #1d4ed8 100%)",
            color: "#ffffff",
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: "999px",
            boxShadow: "0 2px 6px rgba(0, 64, 224, 0.25)",
          },
          btnVariant: "primary",
          featured: false,
          amount: amt3M,
          tenure: 3,
          durationType: "Months",
          repaymentMethod: "PI",
          lockingPeriod: "3 Months",
          roi: roi3M,
          monthlyEmi: emi3M,
          totalInterest: totalInt3M,
          surplusPct: Math.round((emi3M / baseSurplus) * 100),
          status: emi3M <= safeEmi ? "Comfortable Margin" : "Moderate",
          tag: "Quick Return",
          btnLabel: `Give ₹${amt3M.toLocaleString("en-IN")} Offer (3 Months)`,
        },
      ];
    } else {
      // Cycle 3: Matured borrower -> 12 Months Unlocked post 6-month completion
      return [
        {
          id: "optimal_6m",
          title: "6-Month Locking Period",
          subtitle: "Standard 6-month capital lock-in with steady monthly recovery",
          badge: "6M Lock-in (Standard)",
          badgeColor: "lbp-badge-lock6m",
          badgeStyle: {
            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            color: "#ffffff",
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: "999px",
            boxShadow: "0 2px 6px rgba(5, 150, 105, 0.25)",
          },
          btnVariant: "success",
          featured: false,
          amount: amt6M,
          tenure: 6,
          durationType: "Months",
          repaymentMethod: "PI",
          lockingPeriod: "6 Months",
          roi: roi6M,
          monthlyEmi: emi6M,
          totalInterest: totalInt6M,
          surplusPct: Math.round((emi6M / baseSurplus) * 100),
          status: emi6M <= safeEmi ? "Comfortable Margin" : "Moderate",
          tag: "Standard Lock-in",
          btnLabel: `Give ₹${amt6M.toLocaleString("en-IN")} Offer (6M Lock-in)`,
        },
        {
          id: "extended_12m",
          title: "12-Month Locking Period",
          subtitle: "Completed 6M loan: Unlocked for maximum 1-year yield",
          badge: "★ 12M Lock-in (Max Yield)",
          badgeColor: "lbp-badge-lock12m",
          badgeStyle: {
            background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
            color: "#ffffff",
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: "999px",
            boxShadow: "0 2px 6px rgba(2, 132, 199, 0.25)",
          },
          btnVariant: "primary",
          featured: true,
          amount: amt12M,
          tenure: 12,
          durationType: "Months",
          repaymentMethod: "PI",
          lockingPeriod: "12 Months",
          roi: roi12M,
          monthlyEmi: emi12M,
          totalInterest: totalInt12M,
          surplusPct: Math.round((emi12M / baseSurplus) * 100),
          status: "High Earning Yield",
          tag: "Maximum Profit",
          btnLabel: `Give ₹${amt12M.toLocaleString("en-IN")} Offer (12M Lock-in)`,
        },
      ];
    }
  }, [activeLoan, maxEligibleLoan, safeEmiHeadroom, netMonthlySurplus, riskGrade, borrowerRepaymentCycle]);

  // ── Make Offer Handlers ──────────────────────────────────────────────────
  const handleGiveOfferWithTerms = (arg1, arg2) => {
    let targetLoan = null;
    let customTerms = null;

    if (arg2 && typeof arg2 === "object") {
      // Called with 2 arguments: (loanOrNull, termsObject)
      customTerms = arg2;
      targetLoan = (arg1 && typeof arg1 === "object" && (arg1.loanId || arg1.loanRequestAmount || arg1.requestAmount))
        ? arg1
        : (activeLoan || loanDetails[0] || null);
    } else if (arg1 && typeof arg1 === "object") {
      // Called with 1 argument: could be terms object OR loan object
      if (arg1.tenure !== undefined || arg1.amount !== undefined || arg1.roi !== undefined || arg1.isLocked !== undefined) {
        customTerms = arg1;
        targetLoan = activeLoan || loanDetails[0] || null;
      } else {
        targetLoan = arg1;
        customTerms = null;
      }
    } else {
      // Called with no arguments
      targetLoan = activeLoan || loanDetails[0] || null;
      customTerms = null;
    }

    setSelectedLoanForOffer(targetLoan);
    const reqAmt = Number(
      targetLoan?.partiallyPendingAmount ||
      targetLoan?.loanRequestAmount ||
      targetLoan?.requestAmount ||
      maxEligibleLoan ||
      50000
    );
    const maxAllowedTenure = borrowerRepaymentCycle.cycle === 1 ? 3 : borrowerRepaymentCycle.cycle === 2 ? 6 : 12;
    const defaultTenure = borrowerRepaymentCycle.cycle === 1 ? 3 : 6;
    const amt = customTerms?.amount != null ? customTerms.amount : reqAmt;
    const roi = customTerms?.roi != null
      ? customTerms.roi
      : (targetLoan?.rateOfInterest ? Number(targetLoan.rateOfInterest) : targetLoan?.preferredMinRate ? Number(targetLoan.preferredMinRate) : riskGrade.suggestedRoi);
    const tenure = customTerms?.tenure != null
      ? customTerms.tenure
      : (targetLoan?.duration ? Math.min(Number(targetLoan.duration), maxAllowedTenure) : defaultTenure);
    const durationType = customTerms?.durationType || (Number(tenure) === 30 ? "Days" : (targetLoan?.durationType || "Months"));
    const repaymentMethod = customTerms?.repaymentMethod || customTerms?.repaymentMethodForLender || targetLoan?.repaymentMethod || "PI";
    const isLocked = customTerms?.isLocked === true;
    const presetTitle = customTerms?.title || null;

    setOfferData({
      amount: String(amt),
      tenure: String(tenure),
      roi: String(roi),
      durationType: durationType,
      repaymentMethodForLender: repaymentMethod,
      comments: presetTitle
        ? `Lender Offer (${presetTitle}): Pre-computed ₹${Number(amt).toLocaleString("en-IN")} at ${roi}% ROI for ${tenure} ${durationType} (${repaymentMethod === "PI" ? "Principal + Monthly Interest" : "Monthly Interest"}).`
        : `Lender Offer: Assessed Grade ${riskGrade.grade}. Offering ₹${Number(amt).toLocaleString("en-IN")} at ${roi}% ROI for ${tenure} ${durationType}.`,
      consentItems: new Array(LENDER_CONSENTS.length).fill(false),
      isPresetLocked: isLocked,
      presetTitle: presetTitle,
    });
    setOfferErrors({});
    setShowOfferModal(true);
  };

  const openOfferModalForLoan = (loan) => {
    const targetLoan = loan || activeLoan;
    setSelectedLoanForOffer(targetLoan);
    const reqAmt = Number(
      targetLoan?.partiallyPendingAmount ||
      targetLoan?.loanRequestAmount ||
      targetLoan?.requestAmount ||
      maxEligibleLoan ||
      50000
    );
    const maxAllowedTenure = borrowerRepaymentCycle.cycle === 1 ? 3 : borrowerRepaymentCycle.cycle === 2 ? 6 : 12;
    const defaultTenure = borrowerRepaymentCycle.cycle === 1 ? 3 : 6;
    const rawTenure = Number(targetLoan?.duration || targetLoan?.durationMonths || defaultTenure);
    const safeTenure = Math.min(rawTenure, maxAllowedTenure);
    setOfferData({
      amount: String(reqAmt > 0 ? reqAmt : 50000),
      tenure: String(safeTenure),
      roi: String(targetLoan?.rateOfInterest || targetLoan?.preferredMinRate || riskGrade.suggestedRoi || "18"),
      durationType: targetLoan?.durationType || "Months",
      repaymentMethodForLender: targetLoan?.repaymentMethod || "PI",
      comments: "",
      consentItems: new Array(LENDER_CONSENTS.length).fill(false),
      isPresetLocked: false,
      presetTitle: null,
    });
    setOfferErrors({});
    setShowOfferModal(true);
  };

  const validateOffer = () => {
    const errors = {};
    const amt = Number(offerData.amount);
    const maxReq = Number(
      selectedLoanForOffer?.partiallyPendingAmount ||
      selectedLoanForOffer?.loanRequestAmount ||
      selectedLoanForOffer?.requestAmount ||
      maxEligibleLoan ||
      0
    );

    if (!offerData.amount || isNaN(amt) || amt <= 0) {
      errors.amount = "Please enter a valid loan amount.";
    } else if (amt < 500) {
      errors.amount = "Minimum offer amount is ₹500.";
    } else if (maxReq > 0 && amt > maxReq) {
      errors.amount = `Offer amount cannot exceed requested/pending amount of ₹${maxReq.toLocaleString("en-IN")}.`;
    }

    if (!offerData.tenure || isNaN(Number(offerData.tenure)) || Number(offerData.tenure) <= 0) {
      errors.tenure = "Please specify a valid loan tenure.";
    } else {
      const tenNum = Number(offerData.tenure);
      const isMonths = offerData.durationType === "Months";
      if (borrowerRepaymentCycle.cycle === 1) {
        if (isMonths && tenNum > 3) {
          errors.tenure = "First-time borrower: Only 30 Days and 3 Months can be offered. 6-Month Locking Period unlocks after first on-time repayment.";
        } else if (!isMonths && tenNum > 90) {
          errors.tenure = "First-time borrower: Maximum allowed tenure is 90 Days / 3 Months.";
        }
      } else if (borrowerRepaymentCycle.cycle === 2) {
        if (isMonths && tenNum > 6) {
          errors.tenure = "Repeat borrower: 12-Month Locking Period unlocks after the borrower completes a 6-month loan cycle.";
        } else if (!isMonths && tenNum > 180) {
          errors.tenure = "Repeat borrower: Maximum allowed tenure is 180 Days / 6 Months.";
        }
      }
    }

    if (!offerData.roi || isNaN(Number(offerData.roi)) || Number(offerData.roi) <= 0) {
      errors.roi = "Please specify an expected ROI rate (%).";
    }

    if (!offerData.consentItems.every(Boolean)) {
      errors.consent = "You must read and agree to all 8 lender consents to send this offer.";
    }

    return errors;
  };

  const handleSendOfferSubmit = async () => {
    const errs = validateOffer();
    if (Object.keys(errs).length > 0) {
      setOfferErrors(errs);
      return;
    }

    setOfferLoading(true);
    try {
      const res = await lenderInterestedBorrowers({
        borrowerId: Number(borrowerId),
        lenderInterestedAmount: Number(offerData.amount),
        roi: Number(offerData.roi),
        duration: Number(offerData.tenure),
        durationType: offerData.durationType,
        repaymentMethodForLender: offerData.repaymentMethodForLender,
        lenderComments: offerData.comments,
      });

      if (res?.status === 200) {
        setShowOfferModal(false);
        Swal.fire({
          icon: "success",
          title: "🎉 Loan Offer Sent Successfully!",
          text: `Your offer of ₹${Number(offerData.amount).toLocaleString("en-IN")} at ${offerData.roi}% ROI has been submitted to ${fullName}.`,
          confirmButtonText: "View My Offers",
          showCancelButton: true,
          cancelButtonText: "Stay on Profile",
          confirmButtonColor: PRIMARY,
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/offerGivenList");
          } else {
            fetchAllBorrowerData();
          }
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to Send Offer",
          text: getApiErrorMessage(res),
          confirmButtonColor: PRIMARY,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Offer Submission Error",
        text: getApiErrorMessage(err),
        confirmButtonColor: PRIMARY,
      });
    } finally {
      setOfferLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  // ── Render Reusable Surplus Affordability & Smart Offers Component ──
  const renderSurplusAndOffersSection = (sectionTitle = "Surplus Income Affordability & Smart Loan Offers") => {
    const targetAmt = Number(
      activeLoan?.partiallyPendingAmount ||
      activeLoan?.loanRequestAmount ||
      activeLoan?.requestAmount ||
      maxEligibleLoan ||
      25000
    );

    return (
      <div className="col-12 mt-4">
        <div className="lbp-card border-0 shadow-sm overflow-hidden">
          {/* Hero Header with Waterfall */}
          <div className="lbp-surplus-hero">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-2">
              <div>
                <span className="badge bg-opacity-20 text-white border border-white border-opacity-25 px-3 py-1 rounded-pill mb-2">
                  <i className="fa fa-calculator me-1" /> Financial Underwriting Engine
                </span>
                <h4 className="fw-bold mb-1 text-white">
                  {sectionTitle}
                </h4>
                <p className="text-white text-opacity-75 small mb-0">
                  Step-by-step disposable surplus calculation derived from verified banking inflow and committed debt obligations
                </p>
              </div>
              <div className="text-md-end">
                <span className="badge bg-success text-white px-3 py-1.5 rounded-pill fs-7 fw-bold">
                  <i className="fa fa-shield-halved me-1" /> 100% Live Underwriting Data
                </span>
              </div>
            </div>

            {/* 5-Step Waterfall Grid */}
            <div className="lbp-surplus-waterfall">
              {/* Step 1: Gross Monthly Inflow */}
              <div className="lbp-surplus-tile">
                <div className="lbp-surplus-tile-label">
                  <span>1. Gross Inflow</span>
                  <i className="fa fa-arrow-down text-success" />
                </div>
                <div className="lbp-surplus-tile-val text-success">
                  + ₹ {monthlyIncome.toLocaleString("en-IN")}
                </div>
                <div className="lbp-surplus-tile-sub">
                  Verified Salary &amp; Bank Inflow
                </div>
              </div>

              {/* Step 2: Existing Debt EMIs */}
              <div className="lbp-surplus-tile">
                <div className="lbp-surplus-tile-label">
                  <span>2. Debt Outflow</span>
                  <i className="fa fa-arrow-up text-danger" />
                </div>
                <div className="lbp-surplus-tile-val text-danger">
                  - ₹ {existingEMIs.toLocaleString("en-IN")}
                </div>
                <div className="lbp-surplus-tile-sub">
                  Committed EMIs ({dtiRatio}% DTI)
                </div>
              </div>

              {/* Step 3: Living & Household Buffer (35%) */}
              <div className="lbp-surplus-tile">
                <div className="lbp-surplus-tile-label">
                  <span>3. Living Buffer</span>
                  <i className="fa fa-house text-warning" />
                </div>
                <div className="lbp-surplus-tile-val text-warning">
                  - ₹ {livingExpenses.toLocaleString("en-IN")}
                </div>
                <div className="lbp-surplus-tile-sub">
                  Estimated 35% Reserve
                </div>
              </div>

              {/* Step 4: Net Monthly Disposable Surplus */}
              <div className="lbp-surplus-tile highlight">
                <div className="lbp-surplus-tile-label text-success">
                  <span>4. Net Surplus</span>
                  <i className="fa fa-wallet" />
                </div>
                <div className="lbp-surplus-tile-val text-success">
                  = ₹ {netMonthlySurplus.toLocaleString("en-IN")}
                </div>
                <div className="lbp-surplus-tile-sub text-white text-opacity-75">
                  True disposable margin / mo
                </div>
              </div>

              {/* Step 5: Safe New EMI Headroom */}
              <div className="lbp-surplus-tile cap">
                <div className="lbp-surplus-tile-label text-info">
                  <span>5. Safe EMI Cap</span>
                  <i className="fa fa-shield" />
                </div>
                <div className="lbp-surplus-tile-val text-info">
                  ₹ {safeEmiHeadroom.toLocaleString("en-IN")}
                </div>
                <div className="lbp-surplus-tile-sub text-white text-opacity-75">
                  Max 60% surplus allocation cap
                </div>
              </div>
            </div>
          </div>

          {/* Smart Loan Offers Section */}
          <div className="lbp-card-body p-4 bg-white">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2 mb-3">
              <div>
                <h5 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                  <i className="fa fa-hand-holding-dollar text-primary" />
                  Recommended Loan Offers Based on Surplus Capacity
                </h5>
                <p className="text-muted small mb-0">
                  Pre-computed loan packages tailored to the borrower's exact ₹{netMonthlySurplus.toLocaleString("en-IN")} monthly surplus. Click any offer to review and send instantly.
                </p>
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="text-muted small fw-semibold">Borrower Requested:</span>
                <span
                  className="badge rounded-pill fw-bold px-3 py-1.5"
                  style={{ background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", fontSize: "12px" }}
                >
                  ₹ {targetAmt.toLocaleString("en-IN")}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary fw-semibold rounded-pill px-3 ms-md-2"
                  onClick={() => openOfferModalForLoan(activeLoan)}
                >
                  <i className="fa fa-pen-to-square me-1" /> Custom Offer
                </button>
              </div>
            </div>

            {/* Borrower Tenure Graduation Roadmap Indicator */}
            <div
              className="mb-4 p-3 rounded-3 d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3"
              style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "38px",
                    height: "38px",
                    minWidth: "38px",
                    fontSize: "15px",
                    background: borrowerRepaymentCycle.cycle === 1 ? "#0040e0" : borrowerRepaymentCycle.cycle === 2 ? "#16a34a" : "#0284c7",
                    color: "#ffffff",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <i className={borrowerRepaymentCycle.cycle === 1 ? "fa fa-user-clock" : borrowerRepaymentCycle.cycle === 2 ? "fa fa-check-double" : "fa fa-award"} />
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <strong className="text-dark small" style={{ fontSize: "13px" }}>{borrowerRepaymentCycle.tierName}</strong>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "3px 10px",
                        borderRadius: "999px",
                        background: borrowerRepaymentCycle.cycle === 1 ? "#eff6ff" : borrowerRepaymentCycle.cycle === 2 ? "#ecfdf5" : "#f0f9ff",
                        color: borrowerRepaymentCycle.cycle === 1 ? "#1d4ed8" : borrowerRepaymentCycle.cycle === 2 ? "#15803d" : "#0369a1",
                        border: `1px solid ${borrowerRepaymentCycle.cycle === 1 ? "#bfdbfe" : borrowerRepaymentCycle.cycle === 2 ? "#a7f3d0" : "#bae6fd"}`,
                      }}
                    >
                      {borrowerRepaymentCycle.badge}
                    </span>
                  </div>
                  <span className="text-muted small d-block" style={{ fontSize: "11.5px" }}>
                    {borrowerRepaymentCycle.description}
                  </span>
                </div>
              </div>

              {/* 3-Step Tenure Stepper */}
              <div className="d-flex align-items-center gap-2 flex-wrap">
                {/* Step 1: 30D & 3M */}
                <div
                  style={{
                    fontSize: "11.5px",
                    fontWeight: "700",
                    padding: "5px 12px",
                    borderRadius: "999px",
                    background: borrowerRepaymentCycle.cycle === 1 ? "#0040e0" : "#ecfdf5",
                    color: borrowerRepaymentCycle.cycle === 1 ? "#ffffff" : "#047857",
                    border: borrowerRepaymentCycle.cycle === 1 ? "1px solid #0040e0" : "1px solid #a7f3d0",
                    boxShadow: borrowerRepaymentCycle.cycle === 1 ? "0 2px 6px rgba(0, 64, 224, 0.3)" : "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {borrowerRepaymentCycle.cycle > 1 ? "✓ 1. 30D & 3M" : "1. 30D & 3M"}
                </div>
                <i className="fa fa-chevron-right text-muted" style={{ fontSize: "9px" }} />
                {/* Step 2: 6M Lock-in */}
                <div
                  style={{
                    fontSize: "11.5px",
                    fontWeight: "700",
                    padding: "5px 12px",
                    borderRadius: "999px",
                    background: borrowerRepaymentCycle.cycle === 2 ? "#0040e0" : borrowerRepaymentCycle.cycle > 2 ? "#ecfdf5" : "#f1f5f9",
                    color: borrowerRepaymentCycle.cycle === 2 ? "#ffffff" : borrowerRepaymentCycle.cycle > 2 ? "#047857" : "#334155",
                    border: borrowerRepaymentCycle.cycle === 2 ? "1px solid #0040e0" : borrowerRepaymentCycle.cycle > 2 ? "1px solid #a7f3d0" : "1px solid #cbd5e1",
                    boxShadow: borrowerRepaymentCycle.cycle === 2 ? "0 2px 6px rgba(0, 64, 224, 0.3)" : "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {borrowerRepaymentCycle.cycle >= 2 ? "✓ 2. 6M Lock-in" : "🔒 2. 6M Lock-in"}
                </div>
                <i className="fa fa-chevron-right text-muted" style={{ fontSize: "9px" }} />
                {/* Step 3: 12M Lock-in */}
                <div
                  style={{
                    fontSize: "11.5px",
                    fontWeight: "700",
                    padding: "5px 12px",
                    borderRadius: "999px",
                    background: borrowerRepaymentCycle.cycle === 3 ? "#0040e0" : "#f1f5f9",
                    color: borrowerRepaymentCycle.cycle === 3 ? "#ffffff" : "#334155",
                    border: borrowerRepaymentCycle.cycle === 3 ? "1px solid #0040e0" : "1px solid #cbd5e1",
                    boxShadow: borrowerRepaymentCycle.cycle === 3 ? "0 2px 6px rgba(0, 64, 224, 0.3)" : "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {borrowerRepaymentCycle.cycle >= 3 ? "✓ 3. 12M Lock-in" : "🔒 3. 12M Lock-in"}
                </div>
              </div>
            </div>

            {/* Recommended Offer Cards */}
            <div className="lbp-offers-grid">
              {surplusBasedOffers.map((offer) => (
                <div
                  key={offer.id}
                  className={`lbp-offer-scenario-card ${offer.id === "optimal_6m" ? "featured" : ""}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleGiveOfferWithTerms(activeLoan, {
                    title: offer.title,
                    amount: offer.amount,
                    roi: offer.roi,
                    tenure: offer.tenure,
                    durationType: offer.durationType || "Months",
                    repaymentMethod: offer.repaymentMethod || "PI",
                    isLocked: true,
                  })}
                  title={`Click to send locked ${offer.title} offer`}
                >
                  <div>
                    <div className="lbp-offer-scenario-header">
                      <div>
                        <h6 className="lbp-offer-scenario-title mb-0.5">{offer.title}</h6>
                        <span className="text-muted small" style={{ fontSize: "11px" }}>{offer.subtitle}</span>
                      </div>
                      <span
                        className={`lbp-offer-scenario-badge ${offer.badgeColor || ""}`}
                        style={offer.badgeStyle || {}}
                      >
                        {offer.badge}
                      </span>
                    </div>

                    <div className="lbp-offer-scenario-amount">
                      ₹ {offer.amount.toLocaleString("en-IN")}
                    </div>
                    <div className="lbp-offer-scenario-meta">
                      Locking Period: <strong>{offer.lockingPeriod}</strong> • Expected ROI: <strong>{offer.roi}% p.a.</strong>
                    </div>

                    <div className="lbp-offer-scenario-stat-row">
                      <div className="stat-item">
                        <div className="stat-label">Monthly EMI</div>
                        <div className="stat-val text-primary">₹ {offer.monthlyEmi.toLocaleString("en-IN")}</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-label">Est. Interest</div>
                        <div className="stat-val text-success">+ ₹ {offer.totalInterest.toLocaleString("en-IN")}</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-label">Total Return</div>
                        <div className="stat-val text-dark">₹ {(offer.amount + offer.totalInterest).toLocaleString("en-IN")}</div>
                      </div>
                    </div>

                    {/* Surplus Utilization Bar */}
                    <div className="lbp-offer-scenario-surplus-bar">
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="text-muted fw-semibold" style={{ fontSize: "11px" }}>Surplus Used</span>
                        <span className={`fw-bold ${offer.surplusPct <= 50 ? "text-success" : offer.surplusPct <= 80 ? "text-warning" : "text-danger"}`} style={{ fontSize: "11px" }}>
                          {offer.surplusPct}% ({offer.status})
                        </span>
                      </div>
                      <div className="progress" style={{ height: "6px" }}>
                        <div
                          className={`progress-bar ${offer.surplusPct <= 50 ? "bg-success" : offer.surplusPct <= 80 ? "bg-warning" : "bg-danger"}`}
                          style={{ width: `${Math.min(100, offer.surplusPct)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`lbp-offer-scenario-btn ${offer.btnVariant}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGiveOfferWithTerms(activeLoan, {
                        title: offer.title,
                        amount: offer.amount,
                        roi: offer.roi,
                        tenure: offer.tenure,
                        durationType: offer.durationType || "Months",
                        repaymentMethod: offer.repaymentMethod || "PI",
                        isLocked: true,
                      });
                    }}
                  >
                    <i className="fa fa-paper-plane" />
                    <span>{offer.btnLabel}</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Explanatory Formula Note */}
            <div className="mt-4 p-3 bg-light rounded-3 border d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
              <div className="d-flex align-items-center gap-2">
                <i className="fa fa-circle-info text-primary fa-lg" />
                <div className="small text-muted">
                  <strong className="text-dark">How Safe EMI Headroom is derived:</strong> Gross Monthly Income (₹{monthlyIncome.toLocaleString("en-IN")}) minus Committed EMIs (₹{existingEMIs.toLocaleString("en-IN")}) minus Essential Household Living Buffer 35% (₹{livingExpenses.toLocaleString("en-IN")}) leaves ₹{netMonthlySurplus.toLocaleString("en-IN")}/mo surplus. We cap safe EMI at 60% of surplus (₹{safeEmiHeadroom.toLocaleString("en-IN")}/mo) to protect your principal against default.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="main-wrapper">
      <Header />
      <SideBar />
      <div className="page-wrapper">
        <div className="content container-fluid lbp-container">
          {/* Top Breadcrumb Header */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-1" style={{ fontSize: "13px" }}>
                  <li className="breadcrumb-item">
                    <Link to="/nearby-borrowers" className="text-decoration-none">
                      <i className="fa fa-users me-1" />
                      Lender Marketplace
                    </Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Borrower Profile (BR{borrowerId || "—"})
                  </li>
                </ol>
              </nav>
              <h4 className="fw-bold mb-0 text-dark">
                Borrower Comprehensive Profile
              </h4>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm rounded-3 px-3"
                onClick={() => navigate(-1)}
              >
                <i className="fa fa-arrow-left me-1" /> Back
              </button>
              <button
                className="btn btn-outline-primary btn-sm rounded-3 px-3"
                onClick={fetchAllBorrowerData}
                disabled={loading}
              >
                <i className={`fa fa-sync me-1 ${loading ? "fa-spin" : ""}`} /> Refresh
              </button>
              {activeLoan && (
                <button
                  className="btn btn-primary btn-sm rounded-3 px-3 fw-semibold shadow-sm"
                  onClick={() => openOfferModalForLoan(activeLoan)}
                >
                  <i className="fa fa-paper-plane me-1" /> Send Loan Offer
                </button>
              )}
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h5 className="mt-3 text-muted fw-semibold">Loading Verified Borrower Profile...</h5>
              <p className="text-muted small">Fetching personal, employment, banking, reference, and KYC details.</p>
            </div>
          )}

          {/* Error Message */}
          {!loading && error && (
            <div className="alert alert-danger shadow-sm rounded-4 p-4 my-4" role="alert">
              <div className="d-flex align-items-center gap-3">
                <i className="fa fa-exclamation-triangle fa-2x text-danger" />
                <div>
                  <h6 className="fw-bold mb-1">Could Not Load Borrower Profile</h6>
                  <p className="mb-0 text-muted">{error}</p>
                </div>
              </div>
              <div className="mt-3">
                <button className="btn btn-outline-danger btn-sm me-2" onClick={fetchAllBorrowerData}>
                  Try Again
                </button>
                <Link to="/nearby-borrowers" className="btn btn-secondary btn-sm">
                  Browse Nearby Borrowers
                </Link>
              </div>
            </div>
          )}

          {/* Main Profile Content */}
          {!loading && !error && profile && (
            <>
              {/* Hero Card */}
              <div className="lbp-hero-card">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="lbp-avatar-circle">
                      {fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                        <h3 className="fw-bold mb-0 text-white">{fullName}</h3>
                        <span className="badge bg-secondary text-white border border-light-subtle px-2 py-1" style={{ fontSize: "11px" }}>
                          BR{borrowerId}
                        </span>
                        {profile.kycStatus === true ? (
                          <span className="badge bg-success px-2 py-1" style={{ fontSize: "11px" }}>
                            <i className="fa fa-check-circle me-1" /> KYC Verified
                          </span>
                        ) : (
                          <span className="badge bg-warning text-dark px-2 py-1" style={{ fontSize: "11px" }}>
                            <i className="fa fa-clock me-1" /> KYC Pending
                          </span>
                        )}
                        {profile.panVerified && (
                          <span className="badge bg-info text-white px-2 py-1" style={{ fontSize: "11px" }}>
                            <i className="fa fa-shield me-1" /> PAN Verified
                          </span>
                        )}
                      </div>

                      <div className="text-light opacity-90 small d-flex flex-wrap gap-3">
                        <span>
                          <i className="fa fa-briefcase me-1 opacity-75" />
                          {profile.studentOrNot ? "Student" : profile.employment || "Salaried"}
                          {profile.designation ? ` • ${profile.designation}` : ""}
                        </span>
                        <span>
                          <i className="fa fa-map-marker-alt me-1 opacity-75" />
                          {profile.city || "City N/A"}, {profile.state || "State N/A"}
                        </span>
                        {calculatedAge && (
                          <span>
                            <i className="fa fa-user me-1 opacity-75" />
                            {calculatedAge} Yrs ({profile.gender || "Gender N/A"})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2 align-items-center">
                    {/* CIBIL Score Pill */}
                    {bureauScore > 0 && (
                      <div className="bg-white bg-opacity-10 border border-white border-opacity-25 rounded-3 px-3 py-2 text-center">
                        <div className="text-uppercase" style={{ fontSize: "10px", letterSpacing: "0.5px", color: "rgba(255,255,255,0.8)" }}>
                          CIBIL Score
                        </div>
                        <div className="fw-bold text-white fs-5">
                          {bureauScore}
                          <small className="opacity-75 fs-6">/900</small>
                        </div>
                      </div>
                    )}

                    {/* Eligible Amount Pill */}
                    {maxEligibleLoan > 0 && (
                      <div className="bg-white bg-opacity-10 border border-white border-opacity-25 rounded-3 px-3 py-2 text-center">
                        <div className="text-uppercase" style={{ fontSize: "10px", letterSpacing: "0.5px", color: "rgba(255,255,255,0.8)" }}>
                          Eligible Amount
                        </div>
                        <div className="fw-bold text-white fs-5">
                          ₹{maxEligibleLoan.toLocaleString("en-IN")}
                        </div>
                      </div>
                    )}

                    {/* OxyScore Pill */}
                    {oxyScoreData?.oxyScore ? (
                      <div className="bg-white bg-opacity-10 border border-white border-opacity-25 rounded-3 px-3 py-2 text-center">
                        <div className="text-uppercase" style={{ fontSize: "10px", letterSpacing: "0.5px", color: "rgba(255,255,255,0.8)" }}>
                          OxyScore
                        </div>
                        <div className="fw-bold text-white fs-5">
                          {oxyScoreData.oxyScore}
                          <small className="opacity-75 fs-6">/1000</small>
                        </div>
                      </div>
                    ) : profile.profileScore ? (
                      <div className="bg-white bg-opacity-10 border border-white border-opacity-25 rounded-3 px-3 py-2 text-center">
                        <div className="text-uppercase" style={{ fontSize: "10px", letterSpacing: "0.5px", color: "rgba(255,255,255,0.8)" }}>
                          Profile Score
                        </div>
                        <div className="fw-bold text-white fs-5">
                          {profile.profileScore} pts
                        </div>
                      </div>
                    ) : null}

                    {/* Profile Completeness Pill */}
                    <div className="bg-white bg-opacity-10 border border-white border-opacity-25 rounded-3 px-3 py-2 text-center">
                      <div className="text-uppercase" style={{ fontSize: "10px", letterSpacing: "0.5px", color: "rgba(255,255,255,0.8)" }}>
                        Completeness
                      </div>
                      <div className={`fw-bold fs-5 ${completeness.percentage >= 90 ? "text-success" : "text-warning"}`}>
                        {completeness.percentage}%
                      </div>
                    </div>

                    {activeLoan && (
                      <button
                        className="btn btn-light text-primary fw-bold px-4 py-2 rounded-3 shadow"
                        onClick={() => openOfferModalForLoan(activeLoan)}
                      >
                        <i className="fa fa-paper-plane me-1" />
                        Send Offer →
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Stat Highlights Grid */}
              <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                  <div className="lbp-stat-card">
                    <div className="lbp-stat-icon bg-success-subtle text-success">
                      <i className="fa fa-wallet" />
                    </div>
                    <div className="text-muted small fw-medium">Monthly Income</div>
                    <div className="fs-5 fw-bold text-dark mt-1">
                      {profile.salary && Number(profile.salary) > 0
                        ? `₹ ${Number(profile.salary).toLocaleString("en-IN")}`
                        : "Self-Reported"}
                    </div>
                    <div className="small text-success mt-1">
                      <i className="fa fa-check-circle me-1" /> Verified Source
                    </div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="lbp-stat-card">
                    <div className="lbp-stat-icon bg-primary-subtle text-primary">
                      <i className="fa fa-hand-holding-dollar" />
                    </div>
                    <div className="text-muted small fw-medium">Requested Loan</div>
                    <div className="fs-5 fw-bold text-dark mt-1">
                      {activeLoan?.requestAmount || activeLoan?.loanRequestAmount
                        ? `₹ ${Number(activeLoan.requestAmount || activeLoan.loanRequestAmount).toLocaleString("en-IN")}`
                        : "No Active Request"}
                    </div>
                    <div className="small text-muted mt-1">
                      {activeLoan?.loanPurpose || "Personal Loan"}
                    </div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="lbp-stat-card">
                    <div className="lbp-stat-icon bg-warning-subtle text-warning">
                      <i className="fa fa-shield-halved" />
                    </div>
                    <div className="text-muted small fw-medium">Max Eligible Loan</div>
                    <div className="fs-5 fw-bold text-dark mt-1">
                      {maxEligibleLoan > 0
                        ? `₹ ${maxEligibleLoan.toLocaleString("en-IN")}`
                        : "Evaluated on Request"}
                    </div>
                    <div className="small text-success mt-1">
                      <i className="fa fa-check-circle me-1" /> Capacity Assessed
                    </div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="lbp-stat-card">
                    <div className="lbp-stat-icon bg-info-subtle text-info">
                      <i className="fa fa-chart-line" />
                    </div>
                    <div className="text-muted small fw-medium">CIBIL Bureau Score</div>
                    <div className="fs-5 fw-bold text-dark mt-1">
                      {bureauScore > 0 ? `${bureauScore} / 900` : "Score N/A"}
                    </div>
                    <div className={`small mt-1 ${bureauScore > 0 ? "text-primary" : "text-muted"}`}>
                      {bureauScore > 0 ? (
                        <><i className="fa fa-certificate me-1" /> Grade {riskGrade.grade} ({scoreTier.rating})</>
                      ) : (
                        <><i className="fa fa-info-circle me-1" /> No Bureau Report</>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="lbp-nav-pills">
                {[
                  { key: "overview", label: "Overview & Loans", icon: "fa-chart-pie" },
                  {
                    key: "creditReport",
                    label: creditReportData ? "Credit Bureau Report" : "Credit Bureau Status",
                    icon: "fa-chart-line",
                    badge: creditReportData ? `Grade ${riskGrade.grade}` : "Not on File",
                    badgeClass: creditReportData ? riskGrade.badgeClass : "bg-secondary text-white",
                  },
                  { key: "personal", label: "Personal & Family", icon: "fa-user" },
                  { key: "employment", label: "Employment & Income", icon: "fa-briefcase" },
                  { key: "contact", label: "Contact Details", icon: "fa-phone" },
                  // { key: "banking", label: "Bank & Financial", icon: "fa-university" },
                  { key: "references", label: `References (${references.length})`, icon: "fa-users" },
                  { key: "documents", label: `KYC Documents (${documents.length})`, icon: "fa-file-shield" },
                ].map((t) => (
                  <button
                    key={t.key}
                    className={`lbp-nav-pill-btn ${activeTab === t.key ? "active" : ""}`}
                    onClick={() => setActiveTab(t.key)}
                  >
                    <i className={`fa ${t.icon}`} />
                    {t.label}
                    {t.badge && (
                      <span className={`badge ms-1 ${t.badgeClass || "bg-primary text-white"}`} style={{ fontSize: "10px", padding: "3px 7px" }}>
                        {t.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* TAB 1: OVERVIEW & LOAN REQUESTS */}
              {activeTab === "overview" && (
                <div className="row g-4">
                  {/* Left Column: Loan Requests */}
                  <div className="col-lg-7">
                    <div className="lbp-card h-100">
                      <div className="lbp-card-header">
                        <div className="d-flex align-items-center gap-2">
                          <i className="fa fa-file-invoice-dollar text-primary fa-lg" />
                          <h6 className="fw-bold mb-0 text-dark">Active Loan Requests</h6>
                        </div>
                        <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1">
                          {loanDetails.length} Request{loanDetails.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="lbp-card-body">
                        {loanDetails.length === 0 ? (
                          <div className="text-center py-4 text-muted">
                            <i className="fa fa-folder-open fa-2x mb-2" />
                            <p>No active loan requests on record for this borrower.</p>
                          </div>
                        ) : (
                          loanDetails.map((loan, idx) => {
                            const reqAmt = Number(loan.requestAmount || loan.loanRequestAmount || 0);
                            const pendingAmt = Number(loan.partiallyPendingAmount || 0);
                            const fundedAmt = reqAmt - pendingAmt;
                            const percent = reqAmt > 0 ? Math.min(100, Math.round((fundedAmt / reqAmt) * 100)) : 0;

                            return (
                              <div key={loan.id || loan.loanRequestId || idx} className="lbp-loan-request-box">
                                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                                  <div>
                                    <span className="badge bg-secondary-subtle text-secondary mb-1">
                                      Request #{loan.loanRequestId || loan.id || idx + 1}
                                    </span>
                                    <h4 className="fw-bold text-primary mb-0">
                                      ₹ {reqAmt.toLocaleString("en-IN")}
                                    </h4>
                                    <small className="text-muted">
                                      Purpose: <strong>{loan.loanPurpose || "General Purpose"}</strong>
                                    </small>
                                  </div>

                                  <div className="text-end">
                                    <span
                                      className={`badge px-3 py-2 rounded-pill fw-semibold ${
                                        loan.loanRequestStatus === "PARTIALLYPROCESSING"
                                          ? "bg-warning-subtle text-warning"
                                          : loan.loanRequestStatus === "CLOSED"
                                          ? "bg-secondary-subtle text-secondary"
                                          : "bg-success-subtle text-success"
                                      }`}
                                    >
                                      {loan.loanRequestStatus === "PARTIALLYPROCESSING"
                                        ? "Partially Funded"
                                        : loan.loanRequestStatus || "Active"}
                                    </span>
                                    <div className="small text-muted mt-1">
                                      Rate: {loan.preferredMinRate || "18"}% – {loan.preferredMaxRate || "24"}%
                                    </div>
                                  </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-3">
                                  <div className="d-flex justify-content-between small text-muted mb-1">
                                    <span>Funding Progress: {percent}%</span>
                                    <span>
                                      Pending: ₹{" "}
                                      {(pendingAmt > 0 ? pendingAmt : reqAmt).toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                  <div className="progress" style={{ height: "8px" }}>
                                    <div
                                      className="progress-bar bg-success"
                                      role="progressbar"
                                      style={{ width: `${percent}%` }}
                                      aria-valuenow={percent}
                                      aria-valuemin="0"
                                      aria-valuemax="100"
                                    />
                                  </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-2 border-top">
                                  <div className="small text-muted">
                                    <i className="fa fa-calendar-alt me-1" />
                                    Tenure: <strong>{loan.duration || loan.durationMonths || "6"} {loan.durationType || "Months"}</strong>
                                  </div>
                                  <button
                                    className="btn btn-sm btn-primary fw-semibold px-4 rounded-3"
                                    onClick={() => openOfferModalForLoan(loan)}
                                  >
                                    <i className="fa fa-paper-plane me-1" /> Make Loan Offer
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: OxyScore Breakdown & Risk */}
                  <div className="col-lg-5">
                    <div className="lbp-card h-100">
                      <div className="lbp-card-header">
                        <div className="d-flex align-items-center gap-2">
                          <i className="fa fa-shield-halved text-success fa-lg" />
                          <h6 className="fw-bold mb-0 text-dark">Credit & Risk Assessment</h6>
                        </div>
                      </div>
                      <div className="lbp-card-body">
                        {(() => {
                          const hasCreditReport = Boolean(creditReportData && creditReportData.success !== false && creditReportData.score);
                          const realBureauScore = hasCreditReport ? Number(creditReportData.score) : (bureauScore > 0 ? bureauScore : 0);

                          // 1. CIBIL / Credit Base (Max 600)
                          const cibilVal = oxyScoreData?.breakdown?.cibilBase?.score != null
                            ? Number(oxyScoreData.breakdown.cibilBase.score)
                            : realBureauScore >= 300
                              ? Math.round(((Math.min(900, realBureauScore) - 300) / 600) * 600)
                              : 0;

                          // 2. Employment Stability (Max 150)
                          const empStr = String(profile?.employmentType || profile?.employment || "").toUpperCase();
                          const expYrs = Number(profile?.workExperience || 0);
                          let dynamicEmp = 0;
                          if (empStr.includes("SALARIED")) {
                            dynamicEmp = 80;
                            if (profile?.companyName) dynamicEmp += 35;
                            if (expYrs >= 3) dynamicEmp += 35;
                            else if (expYrs >= 1) dynamicEmp += 20;
                          } else if (empStr.includes("SELF") || empStr.includes("BUSINESS")) {
                            dynamicEmp = 60;
                            if (profile?.companyName) dynamicEmp += 30;
                            if (expYrs >= 2) dynamicEmp += 30;
                          } else if (profile?.companyName) {
                            dynamicEmp = 60;
                          }
                          const empVal = oxyScoreData?.breakdown?.employment?.score != null
                            ? Number(oxyScoreData.breakdown.employment.score)
                            : Math.min(150, dynamicEmp);

                          // 3. Monthly Income Capacity (Max 200)
                          let dynamicInc = 0;
                          const sal = Number(monthlyIncome || 0);
                          if (sal >= 75000) dynamicInc = 200;
                          else if (sal >= 50000) dynamicInc = 175;
                          else if (sal >= 35000) dynamicInc = 145;
                          else if (sal >= 25000) dynamicInc = 115;
                          else if (sal >= 15000) dynamicInc = 80;
                          else if (sal > 0) dynamicInc = 50;
                          const incVal = oxyScoreData?.breakdown?.income?.score != null
                            ? Number(oxyScoreData.breakdown.income.score)
                            : dynamicInc;

                          // 4. Profile Completeness (Max 50)
                          const profVal = Math.round(((completeness?.percentage || 0) / 100) * 50);

                          // Calculated OxyScore
                          const calculatedScore = cibilVal > 0
                            ? Math.min(1000, cibilVal + empVal + incVal + profVal)
                            : (empVal + incVal + profVal > 0 ? Math.min(1000, Math.round((empVal + incVal + profVal) * (1000 / 400))) : 0);

                          const finalOxyScore = oxyScoreData?.oxyScore || profile?.profileScore || profile?.oxyScore || (calculatedScore > 0 ? calculatedScore : null);

                          return (
                            <>
                              {/* OxyScore Gauge Box */}
                              <div className="lbp-score-gauge mb-4">
                                <div className="text-muted small text-uppercase fw-semibold mb-1">
                                  Overall OxyScore
                                </div>
                                <div className={`display-6 fw-bold ${finalOxyScore ? "text-success" : "text-muted"}`}>
                                  {finalOxyScore || "—"}
                                  <span className="fs-6 text-muted"> / 1000</span>
                                </div>
                                <div className={`badge ${riskGrade.badgeSubtle || "bg-secondary-subtle text-secondary"} px-3 py-1 mt-1 rounded-pill`}>
                                  {riskGrade.grade === "N/A"
                                    ? "⚪ Profile Evaluation • No Bureau Report"
                                    : `${riskGrade.grade.startsWith("A") ? "🟢" : "🟡"} Grade ${riskGrade.grade} • ${riskGrade.title}`}
                                </div>
                              </div>

                              {/* Breakdown Factors */}
                              <h6 className="fw-bold mb-3 text-dark small text-uppercase">
                                Score Factor Breakdown
                              </h6>
                              <div className="d-flex flex-column gap-3">
                                {[
                                  {
                                    label: "CIBIL / Credit Base",
                                    val: cibilVal,
                                    max: 600,
                                    subNote: cibilVal === 0 ? "No Bureau Report" : null,
                                    color: cibilVal > 0 ? "bg-success" : "bg-secondary",
                                  },
                                  {
                                    label: "Employment Stability",
                                    val: empVal,
                                    max: 150,
                                    color: "bg-primary",
                                  },
                                  {
                                    label: "Monthly Income Capacity",
                                    val: incVal,
                                    max: 200,
                                    color: "bg-info",
                                  },
                                  {
                                    label: "Profile Completeness",
                                    val: profVal,
                                    max: 50,
                                    color: profVal >= 40 ? "bg-success" : "bg-warning",
                                  },
                                ].map((f) => (
                                  <div key={f.label}>
                                    <div className="d-flex justify-content-between small mb-1">
                                      <span className="fw-semibold text-secondary">
                                        {f.label}
                                        {f.subNote && <span className="text-muted ms-1">({f.subNote})</span>}
                                      </span>
                                      <span className="text-dark fw-bold">
                                        {f.val} / {f.max}
                                      </span>
                                    </div>
                                    <div className="progress" style={{ height: "6px" }}>
                                      <div
                                        className={`progress-bar ${f.color}`}
                                        style={{ width: `${Math.min(100, (f.val / f.max) * 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          );
                        })()}

                        <div className="mt-4 p-3 bg-light rounded-3 border">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <i className="fa fa-info-circle text-primary" />
                            <span className="fw-bold small text-dark">Lender Protection Note</span>
                          </div>
                          <p className="text-muted small mb-0">
                            Borrower details and emergency references have undergone primary KYC verification. You may inspect verified KYC documents in the Documents tab.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Credit & Risk Assessment Quick Card in Overview */}
                  <div className="col-12 mt-4">
                    <div className="lbp-card" style={{ border: "1px solid #dbeafe", background: "#ffffff", borderRadius: "14px", overflow: "hidden" }}>
                      <div
                        className="lbp-card-header d-flex justify-content-between align-items-center flex-wrap gap-2"
                        style={{
                          background: "#f0f6ff",
                          borderBottom: "1px solid #dbeafe",
                          padding: "16px 20px",
                        }}
                      >
                        <div className="d-flex align-items-center gap-2.5">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle"
                            style={{
                              width: "36px",
                              height: "36px",
                              background: "#dbeafe",
                              color: "#1d4ed8",
                              fontSize: "15px",
                            }}
                          >
                            <i className="fa fa-chart-line" />
                          </div>
                          <div>
                            <h6 className="fw-bold mb-0" style={{ color: "#0f172a", fontSize: "14px" }}>
                              Credit Bureau &amp; Risk Assessment Summary
                            </h6>
                            <small style={{ color: "#64748b", fontSize: "12px" }}>
                              CIBIL/ERS bureau score, debt burden analysis, and risk rating
                            </small>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-sm rounded-3 fw-semibold"
                            style={{
                              background: "#ffffff",
                              color: "#1d4ed8",
                              border: "1px solid #bfdbfe",
                              padding: "6px 14px",
                              fontSize: "12px",
                            }}
                            onClick={() => setActiveTab("creditReport")}
                          >
                            <i className="fa fa-chart-line me-1" /> View Full Credit &amp; Risk Analysis →
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm rounded-3 fw-bold"
                            style={{
                              background: "#0040e0",
                              color: "#ffffff",
                              border: "none",
                              padding: "6px 16px",
                              fontSize: "12px",
                              boxShadow: "0 2px 6px rgba(0, 64, 224, 0.25)",
                            }}
                            onClick={() => handleGiveOfferWithTerms()}
                          >
                            <i className="fa fa-paper-plane me-1" /> Give Loan Offer
                          </button>
                        </div>
                      </div>
                      <div className="lbp-card-body">
                        {creditReportData ? (
                          <div className="row g-3 align-items-center">
                            <div className="col-md-3 text-center border-end">
                              <div className="text-muted small text-uppercase fw-semibold mb-1">Bureau Score</div>
                              <div className="display-6 fw-bold text-success mb-1">{bureauScore}</div>
                              <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill">
                                {scoreTier.tier} ({scoreTier.rating})
                              </span>
                            </div>
                            <div className="col-md-3 text-center border-end">
                              <div className="text-muted small text-uppercase fw-semibold mb-1">Platform Risk Grade</div>
                              <div className="fs-3 fw-bold text-primary mb-1">Grade {riskGrade.grade}</div>
                              <span className={`badge ${riskGrade.badgeClass} px-3 py-1 rounded-pill`}>
                                {riskGrade.safetyTag}
                              </span>
                            </div>
                            <div className="col-md-3 text-center border-end">
                              <div className="text-muted small text-uppercase fw-semibold mb-1">Debt Burden Ratio (DTI)</div>
                              <div className="fs-3 fw-bold text-dark mb-1">{dtiRatio}%</div>
                              <span className="badge bg-info-subtle text-info px-3 py-1 rounded-pill">
                                Safe Limit (&lt; 40%)
                              </span>
                            </div>
                            <div className="col-md-3 text-center">
                              <div className="text-muted small text-uppercase fw-semibold mb-1">Recommended Offer</div>
                              <div className="fs-4 fw-bold text-success mb-1">
                                ₹ {riskGrade.suggestedAmount.toLocaleString("en-IN")}
                              </div>
                              <div className="small text-muted">
                                @ {riskGrade.suggestedRoi}% ROI for {riskGrade.suggestedTenure} Mo
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="row g-3 align-items-center">
                            <div className="col-md-3 text-center border-end">
                              <div className="text-muted small text-uppercase fw-semibold mb-1">Bureau CIR Report</div>
                              <div className="fs-4 fw-bold text-secondary mb-1">
                                {bureauScore > 0 ? `${bureauScore} / 900` : "Not on File"}
                              </div>
                              <span className="badge bg-secondary-subtle text-secondary px-3 py-1 rounded-pill">
                                {bureauScore > 0 ? "Profile Declared" : "No Bureau Report"}
                              </span>
                            </div>
                            <div className="col-md-3 text-center border-end">
                              <div className="text-muted small text-uppercase fw-semibold mb-1">Profile Assessment</div>
                              <div className="fs-4 fw-bold text-primary mb-1">
                                {profile?.profileScore ? `${profile.profileScore} pts` : oxyScoreData?.oxyScore ? `OxyScore ${oxyScoreData.oxyScore}` : "KYC Verified"}
                              </div>
                              <span className="badge bg-primary-subtle text-primary px-3 py-1 rounded-pill">
                                {completeness.percentage >= 80 ? "Complete Profile" : "Basic Profile"}
                              </span>
                            </div>
                            <div className="col-md-3 text-center border-end">
                              <div className="text-muted small text-uppercase fw-semibold mb-1">Max Eligible Capacity</div>
                              <div className="fs-4 fw-bold text-dark mb-1">
                                {maxEligibleLoan > 0 ? `₹${maxEligibleLoan.toLocaleString("en-IN")}` : "On Request"}
                              </div>
                              <span className="badge bg-success-subtle text-success px-3 py-1 rounded-pill">
                                Capacity Assessed
                              </span>
                            </div>
                            <div className="col-md-3 text-center">
                              <div className="text-muted small text-uppercase fw-semibold mb-1">Recommended Offer</div>
                              <div className="fs-4 fw-bold text-success mb-1">
                                ₹ {riskGrade.suggestedAmount.toLocaleString("en-IN")}
                              </div>
                              <div className="small text-muted">
                                @ {riskGrade.suggestedRoi}% ROI for {riskGrade.suggestedTenure} Mo
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Surplus Affordability & Smart Loan Offers Engine */}
                  {renderSurplusAndOffersSection("Surplus Income Affordability & Smart Loan Offers")}
                </div>
              )}

              {/* TAB: CREDIT REPORT & RISK ANALYSIS (PROS & CONS) */}
              {activeTab === "creditReport" && (
                <div>
                  {!creditReportData ? (
                    <div className="lbp-card border-0 shadow-sm p-4 p-md-5 mb-4" style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)" }}>
                      <div className="text-center mb-4">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                          style={{ width: 80, height: 80, background: "#f1f5f9", color: "#64748b" }}
                        >
                          <i className="fa fa-file-circle-xmark fa-3x" />
                        </div>
                        <h4 className="fw-bold text-dark mb-2">No Credit Bureau Report Available</h4>
                        <p className="text-muted mx-auto mb-0" style={{ maxWidth: 640, fontSize: "14px" }}>
                          No institutional Credit Bureau (CIBIL / CIR) report was found in the system for borrower <strong>#{borrowerId}</strong>.
                          Because credit bureau tradelines and payment tracks are not on record, you can assess the borrower using their verified profile, income, and bank data below.
                        </p>
                      </div>

                      {/* 4 Real Assessment Cards from Live APIs */}
                      <div className="row g-3 text-start mb-4">
                        {/* Card 1: Declared / Profile CIBIL */}
                        <div className="col-12 col-sm-6 col-lg-3">
                          <div className="p-3 rounded-3 bg-white border h-100 shadow-sm">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span className="text-muted small fw-semibold">CIBIL Bureau Score</span>
                              <i className="fa fa-chart-line text-primary" />
                            </div>
                            <div className="fs-4 fw-bold text-dark mb-1">
                              {bureauScore > 0 ? `${bureauScore} / 900` : "Score N/A"}
                            </div>
                            <div className="small text-muted" style={{ fontSize: "11px" }}>
                              {bureauScore > 0 ? "Profile declared score" : "No bureau score on file"}
                            </div>
                          </div>
                        </div>

                        {/* Card 2: Verified Monthly Income */}
                        <div className="col-12 col-sm-6 col-lg-3">
                          <div className="p-3 rounded-3 bg-white border h-100 shadow-sm">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span className="text-muted small fw-semibold">Monthly Income</span>
                              <i className="fa fa-wallet text-success" />
                            </div>
                            <div className="fs-4 fw-bold text-success mb-1">
                              {monthlyIncome > 0 ? `₹${monthlyIncome.toLocaleString("en-IN")}` : "Self-Reported"}
                            </div>
                            <div className="small text-muted text-truncate" style={{ fontSize: "11px" }}>
                              Employer: {profile?.companyName || borrowerSalaryData?.companyName || "Declared"}
                            </div>
                          </div>
                        </div>

                        {/* Card 3: Bank Statement Liquidity */}
                        <div className="col-12 col-sm-6 col-lg-3">
                          <div className="p-3 rounded-3 bg-white border h-100 shadow-sm">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span className="text-muted small fw-semibold">Avg Bank Balance</span>
                              <i className="fa fa-building-columns text-info" />
                            </div>
                            <div className="fs-4 fw-bold text-dark mb-1">
                              {bankAnalysisData?.averageMonthlyBalance || bankAnalysisData?.averageBalance
                                ? `₹${Number(bankAnalysisData.averageMonthlyBalance || bankAnalysisData.averageBalance).toLocaleString("en-IN")}`
                                : "Evaluated on Bank Slip"}
                            </div>
                            <div className="small text-muted" style={{ fontSize: "11px" }}>
                              Mandate Bounces: <strong className={bankAnalysisData?.bounceCount > 0 ? "text-danger" : "text-success"}>{bankAnalysisData?.bounceCount || 0}</strong>
                            </div>
                          </div>
                        </div>

                        {/* Card 4: Max Eligible Capacity */}
                        <div className="col-12 col-sm-6 col-lg-3">
                          <div className="p-3 rounded-3 bg-white border h-100 shadow-sm">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span className="text-muted small fw-semibold">Eligible Capacity</span>
                              <i className="fa fa-shield-halved text-warning" />
                            </div>
                            <div className="fs-4 fw-bold text-dark mb-1">
                              {maxEligibleLoan > 0 ? `₹${maxEligibleLoan.toLocaleString("en-IN")}` : "Assessed on Request"}
                            </div>
                            <div className="small text-muted" style={{ fontSize: "11px" }}>
                              KYC Completeness: {completeness.percentage}%
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Callout: Guide Lender on Next Steps */}
                      <div className="p-4 rounded-3 text-start bg-white border shadow-sm">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                          <div>
                            <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                              <i className="fa fa-paper-plane text-primary" />
                              Give Loan Offer Based on Profile Assessment
                            </h6>
                            <p className="text-muted small mb-0" style={{ maxWidth: 580 }}>
                              Review the borrower's submitted <button type="button" className="btn btn-link p-0 small fw-bold" onClick={() => setActiveTab("documents")}>KYC Documents ({documents.length})</button>, verified <button type="button" className="btn btn-link p-0 small fw-bold" onClick={() => setActiveTab("employment")}>Salary Records</button>, and <button type="button" className="btn btn-link p-0 small fw-bold" onClick={() => setActiveTab("references")}>Emergency References ({references.length})</button> to make an informed offer.
                            </p>
                          </div>
                          <div className="d-flex gap-2 text-nowrap">
                            <button
                              type="button"
                              className="btn btn-outline-primary px-3 py-2 rounded-3 fw-semibold small"
                              onClick={() => setActiveTab("employment")}
                            >
                              <i className="fa fa-briefcase me-1" /> View Employment
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary px-4 py-2 rounded-3 fw-bold small"
                              onClick={() => handleGiveOfferWithTerms()}
                            >
                              <i className="fa fa-paper-plane me-1" /> Give Loan Offer
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Surplus Affordability & Smart Loan Offers Engine for Unrated/No-CIR Borrower */}
                      {renderSurplusAndOffersSection("Profile Surplus Affordability & Recommended Offers")}
                    </div>
                  ) : (
                    <div>
                  {/* 1. Risk Assessment Hero Banner & Direct Offer Action */}
                  <div className="lbp-risk-hero-banner">
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-4">
                      <div>
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                          <span className={`lbp-grade-badge ${riskGrade.badgeClass}`}>
                            <i className="fa fa-shield-halved" />
                            Grade {riskGrade.grade} • {riskGrade.title}
                          </span>
                          <span className="badge bg-white bg-opacity-20 text-white border border-white border-opacity-25 px-3 py-1">
                            CIR Equifax / VerifyA2Z Verified
                          </span>
                          <span className="badge bg-white bg-opacity-20 text-white border border-white border-opacity-25 px-3 py-1">
                            {creditReportData?.reportOrderNumber ? `Report Order #${creditReportData.reportOrderNumber}` : `OxyBureau CIR Verified`}
                          </span>
                        </div>
                        <h3 className="fw-bold mb-1 text-white">
                          Credit Bureau Health & Risk Analysis
                        </h3>
                        <p className="text-light opacity-90 small mb-2" style={{ maxWidth: "700px" }}>
                          {riskGrade.summary}
                        </p>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="badge bg-success text-white px-3 py-1">
                            <i className="fa fa-circle-check me-1" /> {riskGrade.safetyTag}
                          </span>
                          <span className="text-warning small">
                            {"★".repeat(riskGrade.stars)}{"☆".repeat(5 - riskGrade.stars)}
                          </span>
                          <span className="text-light opacity-75 small">
                            Recommended ROI Yield: <strong>{riskGrade.recommendedRoiRange} p.a.</strong>
                          </span>
                        </div>
                      </div>

                      <div className="bg-white bg-opacity-10 border border-white border-opacity-20 rounded-4 p-3 text-center text-lg-end" style={{ minWidth: "280px" }}>
                        <div className="small text-uppercase fw-semibold" style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px" }}>
                          Recommended Loan Offer
                        </div>
                        <div className="fs-3 fw-bold text-white mt-1">
                          ₹ {riskGrade.suggestedAmount.toLocaleString("en-IN")}
                        </div>
                        <div className="small text-light opacity-90 mb-2">
                          @ <strong>{riskGrade.suggestedRoi}% ROI</strong> for <strong>{riskGrade.suggestedTenure} Months</strong>
                        </div>
                        <div className="small text-white-50 mb-3" style={{ fontSize: "11.5px" }}>
                          Est. Return: <strong>₹{estimatedReturn.toLocaleString("en-IN")}/mo</strong> (Total Profit: ₹{estimatedProfit.toLocaleString("en-IN")})
                        </div>
                        <button
                          className="btn btn-light text-primary fw-bold px-4 py-2 w-100 rounded-3 shadow d-flex align-items-center justify-content-center gap-2"
                          onClick={() => handleGiveOfferWithTerms()}
                        >
                          <i className="fa fa-paper-plane" />
                          Give Loan Offer to Borrower →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2. Key Bureau & Financial Metrics Grid (5 Pillars) */}
                  <div className="row g-3 mb-4">
                    {/* Pillar 1: Bureau Score */}
                    <div className="col-12 col-sm-6 col-lg">
                      <div className="lbp-metric-tile highlight-safe">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className="lbp-data-label">Bureau Score</span>
                          <span className="badge bg-success-subtle text-success small">{scoreTier.rating}</span>
                        </div>
                        <div className="fs-4 fw-bold text-success mb-1">
                          {bureauScore} <small className="text-muted fs-6">/ 900</small>
                        </div>
                        <div className="small text-dark fw-semibold">{scoreTier.tier} Status</div>
                        <div className="small text-muted mt-1" style={{ fontSize: "11px" }}>
                          Status: {creditReportData?.metrics?.delinquencyStatus || "Non-Delnqt"}
                        </div>
                      </div>
                    </div>

                    {/* Pillar 2: Debt Burden Ratio (DTI) */}
                    <div className="col-12 col-sm-6 col-lg">
                      <div className="lbp-metric-tile highlight-info">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className="lbp-data-label">Debt Burden (DTI)</span>
                          <span className={`badge ${dtiRatio <= 40 ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"} small`}>
                            {dtiRatio <= 40 ? "Safe Limit" : "Moderate"}
                          </span>
                        </div>
                        <div className="fs-4 fw-bold text-dark mb-1">{dtiRatio}%</div>
                        <div className="progress mb-1" style={{ height: "6px" }}>
                          <div
                            className={`progress-bar ${dtiRatio <= 40 ? "bg-success" : "bg-warning"}`}
                            style={{ width: `${Math.min(100, (dtiRatio / 50) * 100)}%` }}
                          />
                        </div>
                        <div className="small text-muted" style={{ fontSize: "11px" }}>
                          Existing EMIs: ₹{existingEMIs.toLocaleString("en-IN")}/mo
                        </div>
                      </div>
                    </div>

                    {/* Pillar 3: Card Utilization */}
                    <div className="col-12 col-sm-6 col-lg">
                      <div className="lbp-metric-tile highlight-warning">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className="lbp-data-label">Card Utilization</span>
                          <span className={`badge ${cardUtilization <= 30 ? "bg-success-subtle text-success" : cardUtilization <= 50 ? "bg-warning-subtle text-warning" : "bg-danger-subtle text-danger"} small`}>
                            {cardUtilization <= 30 ? "Optimal" : cardUtilization <= 50 ? "Moderate" : "High"}
                          </span>
                        </div>
                        <div className="fs-4 fw-bold text-dark mb-1">{cardUtilization}%</div>
                        <div className="progress mb-1" style={{ height: "6px" }}>
                          <div
                            className={`progress-bar ${cardUtilization <= 30 ? "bg-success" : cardUtilization <= 50 ? "bg-warning" : "bg-danger"}`}
                            style={{ width: `${Math.min(100, cardUtilization)}%` }}
                          />
                        </div>
                        <div className="small text-muted" style={{ fontSize: "11px" }}>
                          Bal: ₹{cardBalance.toLocaleString("en-IN")} of ₹{cardLimit.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>

                    {/* Pillar 4: Repayment Track & Past Due */}
                    <div className="col-12 col-sm-6 col-lg">
                      <div className="lbp-metric-tile highlight-safe">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className="lbp-data-label">Past Due & Defaults</span>
                          <span className="badge bg-success-subtle text-success small">100% On-Time</span>
                        </div>
                        <div className="fs-4 fw-bold text-success mb-1">
                          ₹{Number(creditReportData?.metrics?.pastDueAmount || 0).toLocaleString("en-IN")}
                        </div>
                        <div className="small text-dark fw-semibold">0 Write-Offs / Settled</div>
                        <div className="small text-muted mt-1" style={{ fontSize: "11px" }}>
                          {oxyScoreData?.repaymentHistory?.bounceCount || 0} NACH Bounces
                        </div>
                      </div>
                    </div>

                    {/* Pillar 5: Credit Vintage & Tradelines */}
                    <div className="col-12 col-sm-6 col-lg">
                      <div className="lbp-metric-tile highlight-purple">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className="lbp-data-label">Credit Vintage</span>
                          <span className="badge bg-primary-subtle text-primary small">
                            {creditReportData ? "Established" : "Report N/A"}
                          </span>
                        </div>
                        <div className="fs-4 fw-bold text-dark mb-1">
                          {creditReportData?.metrics?.creditAgeYears ? `${creditReportData.metrics.creditAgeYears} Yrs` : "N/A"}
                        </div>
                        <div className="small text-dark fw-semibold">
                          {creditReportData?.metrics?.totalAccountsCount ? `${creditReportData.metrics.totalAccountsCount} Tradelines` : "0 Tradelines on File"}
                        </div>
                        <div className="small text-muted mt-1" style={{ fontSize: "11px" }}>
                          {creditReportData
                            ? `Active: ${creditReportData.metrics?.activeAccountsCount || 0} • Closed: ${creditReportData.metrics?.closedAccountsCount || 0}`
                            : "No credit report on file"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Bureau Visual Gauge & Detailed Cashflow Capacity */}
                  <div className="row g-4 mb-4">
                    <div className="col-lg-5">
                      <div className="lbp-card h-100">
                        <div className="lbp-card-header">
                          <div className="d-flex align-items-center gap-2">
                            <i className="fa fa-tachometer-alt text-primary fa-lg" />
                            <h6 className="fw-bold mb-0 text-dark">Bureau Credit Score Meter</h6>
                          </div>
                          <span className={`badge ${riskGrade.badgeClass}`}>
                            Grade {riskGrade.grade}
                          </span>
                        </div>
                        <div className="lbp-card-body d-flex flex-column align-items-center justify-content-center text-center py-4">
                          <CreditScoreGauge score={bureauScore} size={220} animated={true} />
                          <div className="mt-3">
                            <h5 className="fw-bold text-dark mb-1">
                              {scoreTier.tier} Credit Rating ({scoreTier.rating})
                            </h5>
                            <p className="text-muted small mb-3" style={{ maxWidth: "340px" }}>
                              {scoreTier.description}
                            </p>
                            <div className="d-flex justify-content-center gap-2">
                              <span className="badge bg-light text-dark border px-3 py-1">
                                Min: 300
                              </span>
                              <span className="badge bg-success-subtle text-success border px-3 py-1 fw-bold">
                                Current: {bureauScore}
                              </span>
                              <span className="badge bg-light text-dark border px-3 py-1">
                                Max: 900
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-7">
                      <div className="lbp-card h-100">
                        <div className="lbp-card-header">
                          <div className="d-flex align-items-center gap-2">
                            <i className="fa fa-scale-balanced text-primary fa-lg" />
                            <h6 className="fw-bold mb-0 text-dark">Lender Cash Flow & Debt Capacity Analysis</h6>
                          </div>
                          <span className="badge bg-success-subtle text-success">
                            <i className="fa fa-check-circle me-1" /> Verified Financials
                          </span>
                        </div>
                        <div className="lbp-card-body">
                          <div className="row g-3">
                            <div className="col-sm-6">
                              <div className="p-3 bg-light rounded-3 border">
                                <span className="lbp-data-label">Gross Monthly Income</span>
                                <div className="fs-5 fw-bold text-success mt-1">
                                  ₹ {monthlyIncome.toLocaleString("en-IN")}
                                </div>
                                <div className="small text-muted mt-1">Verified Salaried Payroll</div>
                              </div>
                            </div>

                            <div className="col-sm-6">
                              <div className="p-3 bg-light rounded-3 border">
                                <span className="lbp-data-label">Committed Monthly EMIs</span>
                                <div className="fs-5 fw-bold text-dark mt-1">
                                  ₹ {existingEMIs.toLocaleString("en-IN")}
                                </div>
                                <div className="small text-muted mt-1">Current Tradeline Outflow</div>
                              </div>
                            </div>

                            <div className="col-sm-6">
                              <div className="p-3 bg-light rounded-3 border">
                                <span className="lbp-data-label">Net Surplus Disposable Income</span>
                                <div className="fs-5 fw-bold text-primary mt-1">
                                  ₹ {surplusIncome.toLocaleString("en-IN")}
                                </div>
                                <div className="small text-muted mt-1">Available buffer each month</div>
                              </div>
                            </div>

                            <div className="col-sm-6">
                              <div className="p-3 bg-light rounded-3 border">
                                <span className="lbp-data-label">Max Permissible New EMI</span>
                                <div className="fs-5 fw-bold text-dark mt-1">
                                  ₹ {maxNewEMI.toLocaleString("en-IN")}
                                </div>
                                <div className="small text-muted mt-1">Under 50% DTI safe ceiling</div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 p-3 rounded-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <i className="fa fa-circle-check text-success" />
                              <strong className="text-dark small">Lender Assessment Conclusion</strong>
                            </div>
                            <p className="small text-muted mb-0">
                              With a monthly surplus of ₹{surplusIncome.toLocaleString("en-IN")} and low {dtiRatio}% DTI ratio, the borrower has ample repayment margin to comfortably service a loan offer of ₹{riskGrade.suggestedAmount.toLocaleString("en-IN")} with estimated monthly EMI of ₹{estimatedReturn.toLocaleString("en-IN")}.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4. Side-by-Side PROS & CONS Section */}
                  <div className="row g-4 mb-4">
                    {/* Left Column: Strengths / Pros */}
                    <div className="col-lg-6">
                      <div className="lbp-pro-card h-100">
                        <div className="lbp-pro-header d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <i className="fa fa-thumbs-up text-success fa-lg" />
                            <h6 className="fw-bold mb-0 text-success">
                              Borrower Strengths & Green Flags ({prosList.length})
                            </h6>
                          </div>
                          <span className="badge bg-success text-white small">Positive Signals</span>
                        </div>
                        <div className="p-3">
                          {prosList.map((pro, idx) => (
                            <div key={idx} className="lbp-pro-item">
                              <div className="p-2 bg-success bg-opacity-10 text-success rounded-circle flex-shrink-0" style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <i className={`fa ${pro.icon || "fa-check"}`} />
                              </div>
                              <div>
                                <div className="fw-bold text-dark mb-1" style={{ fontSize: "13.5px" }}>
                                  {pro.title}
                                </div>
                                <p className="text-muted small mb-0" style={{ fontSize: "12.5px" }}>
                                  {pro.desc}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Risk Factors / Cons */}
                    <div className="col-lg-6">
                      <div className="lbp-con-card h-100">
                        <div className="lbp-con-header d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <i className="fa fa-triangle-exclamation text-warning fa-lg" />
                            <h6 className="fw-bold mb-0 text-dark">
                              Risk Factors & Cautionary Points ({consList.length})
                            </h6>
                          </div>
                          <span className="badge bg-warning text-dark small">Underwriting Cautions</span>
                        </div>
                        <div className="p-3">
                          {consList.map((con, idx) => (
                            <div key={idx} className="lbp-con-item">
                              <div className="p-2 bg-warning bg-opacity-10 text-warning rounded-circle flex-shrink-0" style={{ width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <i className={`fa ${con.icon || "fa-exclamation"}`} />
                              </div>
                              <div className="w-100">
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                  <div className="fw-bold text-dark" style={{ fontSize: "13.5px" }}>
                                    {con.title}
                                  </div>
                                  {con.badge && (
                                    <span className="badge bg-light text-secondary border small ms-2">
                                      {con.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-muted small mb-0" style={{ fontSize: "12.5px" }}>
                                  {con.desc}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 5. Bureau Tradelines (Accounts) Breakdown Table */}
                  <div className="lbp-card mb-4">
                    <div className="lbp-card-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <i className="fa fa-list-check text-primary fa-lg" />
                          <h6 className="fw-bold mb-0 text-dark">Bureau Retail Credit Accounts & Tradelines</h6>
                        </div>
                        <small className="text-muted">
                          Detailed institutional history reported to Equifax/CIBIL CIR database
                        </small>
                      </div>

                      <div className="d-flex flex-wrap gap-2 align-items-center w-100 w-md-auto">
                        {/* Account filter pills */}
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            className={`btn ${bureauAccountFilter === "all" ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => setBureauAccountFilter("all")}
                          >
                            All ({creditReportData?.accounts?.length || 0})
                          </button>
                          <button
                            className={`btn ${bureauAccountFilter === "active" ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => setBureauAccountFilter("active")}
                          >
                            Active
                          </button>
                          <button
                            className={`btn ${bureauAccountFilter === "closed" ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => setBureauAccountFilter("closed")}
                          >
                            Closed
                          </button>
                          <button
                            className={`btn ${bureauAccountFilter === "cards" ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => setBureauAccountFilter("cards")}
                          >
                            Cards
                          </button>
                          <button
                            className={`btn ${bureauAccountFilter === "loans" ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => setBureauAccountFilter("loans")}
                          >
                            Loans
                          </button>
                        </div>

                        {/* Search Input */}
                        <div className="input-group input-group-sm" style={{ maxWidth: "200px" }}>
                          <span className="input-group-text bg-light border-end-0">
                            <i className="fa fa-search text-muted" />
                          </span>
                          <input
                            type="text"
                            className="form-control border-start-0"
                            placeholder="Filter accounts..."
                            value={bureauSearch}
                            onChange={(e) => setBureauSearch(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="lbp-card-body p-0">
                      {!creditReportData ? (
                        <div className="p-4 text-center">
                          <div className="d-flex flex-column align-items-center justify-content-center py-4">
                            <div className="rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: 60, height: 60, background: "#eef2ff", color: PRIMARY }}>
                              <i className="fa fa-file-shield fa-2x" />
                            </div>
                            <h6 className="fw-bold text-dark mb-1">No Institutional CIR Report on File</h6>
                            <p className="text-muted small mb-3" style={{ maxWidth: 520 }}>
                              No credit bureau CIR report was found for this borrower in the system. Credit profile is evaluated through verified bureau score of <strong>{bureauScore > 0 ? bureauScore : "N/A"}</strong> and platform KYC verification.
                            </p>
                            <div className="d-flex gap-2 flex-wrap justify-content-center">
                              <span className="badge bg-success-subtle text-success px-3 py-2">
                                <i className="fa fa-check-circle me-1" /> Verified CIBIL Score: {bureauScore || "N/A"}
                              </span>
                              <span className="badge bg-primary-subtle text-primary px-3 py-2">
                                <i className="fa fa-wallet me-1" /> Verified Monthly Income: ₹{monthlyIncome > 0 ? monthlyIncome.toLocaleString("en-IN") : "Self-Reported"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                      <div className="lbp-table-responsive">
                        <table className="table table-hover align-middle mb-0">
                          <thead>
                            <tr>
                              <th>Financial Institution</th>
                              <th>Account Type</th>
                              <th>Sanctioned / Limit</th>
                              <th>Current Balance</th>
                              <th>Past Due</th>
                              <th>Status</th>
                              <th>Repayment Track</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredBureauAccounts.length === 0 ? (
                              <tr>
                                <td colSpan="7" className="text-center py-4 text-muted">
                                  No accounts match the current filter or search criteria.
                                </td>
                              </tr>
                            ) : (
                              filteredBureauAccounts.map((acc, idx) => {
                                const isOpen = String(acc.open).toLowerCase() === "yes" || acc.accountStatus?.toLowerCase().includes("current");
                                const pastDue = Number(acc.pastDueAmount || 0);

                                return (
                                  <tr key={acc.seq || idx}>
                                    <td>
                                      <div className="fw-bold text-dark">{acc.institution || "Financial Institution"}</div>
                                      <span className="lbp-masked-badge small" style={{ fontSize: "11px" }}>
                                        <i className="fa fa-lock text-muted" />
                                        {maskAccountNumber(acc.accountNumber)}
                                      </span>
                                    </td>
                                    <td>
                                      <div className="fw-medium text-dark">{acc.accountType || "Credit Facility"}</div>
                                      <small className="text-muted">{acc.ownershipType || "Individual"}</small>
                                    </td>
                                    <td>
                                      <div className="fw-semibold text-dark">
                                        {formatINR(acc.creditLimit || acc.sanctionAmount || acc.highCredit || 0)}
                                      </div>
                                      <small className="text-muted">High: {formatINR(acc.highCredit || 0)}</small>
                                    </td>
                                    <td>
                                      <div className="fw-bold text-dark">
                                        {formatINR(acc.balance || 0)}
                                      </div>
                                      {acc.lastPayment && Number(acc.lastPayment) > 0 && (
                                        <small className="text-muted">Last EMI: {formatINR(acc.lastPayment)}</small>
                                      )}
                                    </td>
                                    <td>
                                      <span className={`badge ${pastDue > 0 ? "bg-danger-subtle text-danger" : "bg-success-subtle text-success"}`}>
                                        {formatINR(pastDue)}
                                      </span>
                                    </td>
                                    <td>
                                      <span className={`badge ${isOpen ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"}`}>
                                        {isOpen ? "Open / Active" : "Closed"}
                                      </span>
                                      {acc.dateOpened && (
                                        <div className="text-muted small mt-1" style={{ fontSize: "10.5px" }}>
                                          Opened: {acc.dateOpened}
                                        </div>
                                      )}
                                    </td>
                                    <td>
                                      <span className="badge bg-light text-dark border">
                                        <i className="fa fa-check text-success me-1" />
                                        {acc.accountStatus || "Regular / 000"}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                      )}
                    </div>
                  </div>

                  {/* 6. Direct "Give Loan Offer to Borrower" Bottom Callout */}
                  <div className="lbp-offer-cta-box mb-4">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-light text-primary fw-bold px-3 py-1">
                          Grade {riskGrade.grade} Assessed
                        </span>
                        <span className="badge bg-success text-white px-3 py-1">
                          {riskGrade.safetyTag}
                        </span>
                      </div>
                      <h4 className="fw-bold mb-1 text-white">
                        Ready to Extend a Loan Offer to {fullName}?
                      </h4>
                      <p className="text-light opacity-90 small mb-2" style={{ maxWidth: "650px" }}>
                        Based on verified credit bureau data, low {dtiRatio}% DTI ratio, and steady salaried income, choose a quick offer package or submit a customized proposal.
                      </p>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        <span className="text-white-50 small align-self-center">Quick Offers:</span>
                        {borrowerRepaymentCycle.cycle === 1 && (
                          <button
                            type="button"
                            className="lbp-quick-offer-btn"
                            onClick={() => handleGiveOfferWithTerms({ amount: 20000, roi: 16, tenure: 30, durationType: "Days" })}
                          >
                            ⚡ ₹20,000 @ 16% (30 Days)
                          </button>
                        )}
                        <button
                          type="button"
                          className="lbp-quick-offer-btn"
                          onClick={() => handleGiveOfferWithTerms({ amount: 25000, roi: 18, tenure: 3, durationType: "Months" })}
                        >
                          ₹25,000 @ 18% (3 Mo)
                        </button>
                        {borrowerRepaymentCycle.cycle >= 2 ? (
                          <button
                            type="button"
                            className="lbp-quick-offer-btn"
                            onClick={() => handleGiveOfferWithTerms({ amount: 50000, roi: 18, tenure: 6, durationType: "Months" })}
                          >
                            ₹50,000 @ 18% (6 Mo)
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="lbp-quick-offer-btn opacity-50"
                            disabled
                            title="6-Month Locking Period unlocks post first loan repayment"
                            style={{ cursor: "not-allowed" }}
                          >
                            🔒 6M Lock-in (Locked)
                          </button>
                        )}
                        {borrowerRepaymentCycle.cycle >= 3 ? (
                          <button
                            type="button"
                            className="lbp-quick-offer-btn"
                            onClick={() => handleGiveOfferWithTerms({ amount: 100000, roi: 20, tenure: 12, durationType: "Months" })}
                          >
                            ₹1,00,000 @ 20% (12 Mo)
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="lbp-quick-offer-btn opacity-50"
                            disabled
                            title="12-Month Locking Period unlocks post 6-month cycle"
                            style={{ cursor: "not-allowed" }}
                          >
                            🔒 12M Lock-in (Locked)
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <button
                        className="btn btn-light text-primary btn-lg fw-bold px-4 py-3 rounded-3 shadow d-flex align-items-center gap-2"
                        onClick={() => handleGiveOfferWithTerms()}
                      >
                        <i className="fa fa-paper-plane" />
                        Give Loan Offer to Borrower →
                      </button>
                    </div>
                  </div>
                </div>
                  )}
                </div>
              )}

              {/* TAB 2: PERSONAL & FAMILY INFORMATION */}
              {activeTab === "personal" && (
                <div className="lbp-card">
                  <div className="lbp-card-header">
                    <div className="d-flex align-items-center gap-2">
                      <i className="fa fa-user text-primary fa-lg" />
                      <h6 className="fw-bold mb-0 text-dark">Personal & Family Details</h6>
                    </div>
                    <span className="badge bg-success-subtle text-success">
                      <i className="fa fa-check me-1" /> Profile Verified
                    </span>
                  </div>
                  <div className="lbp-card-body">
                    <div className="row">
                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">Full Name</div>
                        <div className="lbp-data-value">{profile.fullname || "—"}</div>
                      </div>

                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">Gender</div>
                        <div className="lbp-data-value">{profile.gender || "—"}</div>
                      </div>
                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">Date of Birth & Age</div>
                        <div className="lbp-data-value">
                          {profile.dob || "—"}{" "}
                          {calculatedAge && (
                            <span className="badge bg-light text-dark border ms-1">
                              {calculatedAge} Yrs
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">Marital Status</div>
                        <div className="lbp-data-value">
                          <span className={`badge ${profile.maritalStatus === "Married" ? "bg-info" : "bg-light text-dark border"}`}>
                            {profile.maritalStatus || "Single"}
                          </span>
                        </div>
                      </div>

                      {/* Parent Names */}
                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">Father's Name</div>
                        <div className="lbp-data-value">{profile.fatherName || "—"}</div>
                      </div>
                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">Mother's Name</div>
                        <div className="lbp-data-value">{profile.motherName || "—"}</div>
                      </div>

                      {/* Spouse details if married */}
                      {profile.maritalStatus === "Married" && (
                        <>
                          <div className="col-md-4 lbp-data-item">
                            <div className="lbp-data-label">Spouse Name</div>
                            <div className="lbp-data-value">{profile.spouseName || "—"}</div>
                          </div>
                          <div className="col-md-4 lbp-data-item">
                            <div className="lbp-data-label">Spouse Date of Birth</div>
                            <div className="lbp-data-value">{profile.spouseDob || "—"}</div>
                          </div>
                        </>
                      )}

                      {/* Identity Proofs (Masked for Privacy) */}
                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">PAN Number</div>
                        <div className="lbp-data-value">
                          <span className="lbp-masked-badge">
                            <i className="fa fa-lock text-muted" />
                            {maskPan(profile.panNumber)}
                          </span>
                          {profile.panVerified && (
                            <i className="fa fa-check-circle text-success ms-2" title="Verified PAN" />
                          )}
                        </div>
                      </div>
                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">Aadhaar Number</div>
                        <div className="lbp-data-value">
                          <span className="lbp-masked-badge">
                            <i className="fa fa-lock text-muted" />
                            {maskAadhaar(profile.aadharNumber)}
                          </span>
                          {profile.kycStatus && (
                            <i className="fa fa-check-circle text-success ms-2" title="Verified Aadhaar" />
                          )}
                        </div>
                      </div>
                    </div>

                    <hr className="my-3 text-muted opacity-25" />

                    {/* Residential Address Section */}
                    <h6 className="fw-bold mb-3 text-dark">
                      <i className="fa fa-map-location-dot text-primary me-2" />
                      Residential Address
                    </h6>
                    <div className="row">
                      <div className="col-md-6 lbp-data-item">
                        <div className="lbp-data-label">Current Address</div>
                        <div className="lbp-data-value">
                          {profile.address || profile.residenceAddress || "—"}
                        </div>
                      </div>
                      <div className="col-md-6 lbp-data-item">
                        <div className="lbp-data-label">Permanent Address</div>
                        <div className="lbp-data-value">{profile.permanentAddress || "Same as Current Address"}</div>
                      </div>
                      <div className="col-md-3 lbp-data-item">
                        <div className="lbp-data-label">Locality / Landmark</div>
                        <div className="lbp-data-value">{profile.locality || "—"}</div>
                      </div>
                      <div className="col-md-3 lbp-data-item">
                        <div className="lbp-data-label">City</div>
                        <div className="lbp-data-value">{profile.city || "—"}</div>
                      </div>
                      <div className="col-md-3 lbp-data-item">
                        <div className="lbp-data-label">State</div>
                        <div className="lbp-data-value">{profile.state || "—"}</div>
                      </div>
                      <div className="col-md-3 lbp-data-item">
                        <div className="lbp-data-label">Pincode</div>
                        <div className="lbp-data-value">{profile.pinCode || "—"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: EMPLOYMENT & PROFESSIONAL */}
              {activeTab === "employment" && (
                <div className="lbp-card">
                  <div className="lbp-card-header">
                    <div className="d-flex align-items-center gap-2">
                      <i className="fa fa-briefcase text-primary fa-lg" />
                      <h6 className="fw-bold mb-0 text-dark">Employment & Professional Details</h6>
                    </div>
                    <span className="badge bg-primary-subtle text-primary">
                      {profile.studentOrNot ? "Student Profile" : profile.employment || "Salaried"}
                    </span>
                  </div>
                  <div className="lbp-card-body">
                    <div className="row">
                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">Employment Category</div>
                        <div className="lbp-data-value">
                          {profile.studentOrNot ? "STUDENT" : profile.employment || "SALARIED"}
                        </div>
                      </div>

                      {profile.studentOrNot ? (
                        <>
                          <div className="col-md-4 lbp-data-item">
                            <div className="lbp-data-label">College / University</div>
                            <div className="lbp-data-value">{profile.universityName || profile.collegeName || "—"}</div>
                          </div>
                          <div className="col-md-4 lbp-data-item">
                            <div className="lbp-data-label">Course / Degree</div>
                            <div className="lbp-data-value">{profile.course || profile.degree || "—"}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="col-md-4 lbp-data-item">
                            <div className="lbp-data-label">Employer / Company Name</div>
                            <div className="lbp-data-value">{profile.companyName || "—"}</div>
                          </div>
                          <div className="col-md-4 lbp-data-item">
                            <div className="lbp-data-label">Designation / Role</div>
                            <div className="lbp-data-value">{profile.designation || "—"}</div>
                          </div>
                          <div className="col-md-4 lbp-data-item">
                            <div className="lbp-data-label">Monthly Salary / Income</div>
                            <div className="lbp-data-value text-success fw-bold">
                              {(profile.salary || profile.salaryIncomeMonthly || borrowerSalaryData?.netSalary || borrowerSalaryData?.salary) ? `₹ ${Number(profile.salary || profile.salaryIncomeMonthly || borrowerSalaryData?.netSalary || borrowerSalaryData?.salary).toLocaleString("en-IN")}` : "—"}
                            </div>
                          </div>
                          <div className="col-md-4 lbp-data-item">
                            <div className="lbp-data-label">Total Work Experience</div>
                            <div className="lbp-data-value">
                              {profile.workExperience ? `${profile.workExperience} Years` : "—"}
                            </div>
                          </div>
                          <div className="col-md-4 lbp-data-item">
                            <div className="lbp-data-label">Office Email ID</div>
                            <div className="lbp-data-value">
                              <span className="lbp-masked-badge">
                                {maskEmail(profile.officeMailId)}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-4 lbp-data-item">
                            <div className="lbp-data-label">Office Landline</div>
                            <div className="lbp-data-value">
                              <span className="lbp-masked-badge">
                                {profile.officeLandLine ? `••••••${String(profile.officeLandLine).slice(-4)}` : "—"}
                              </span>
                            </div>
                          </div>
                          <div className="col-12 lbp-data-item">
                            <div className="lbp-data-label">Office / Workplace Address</div>
                            <div className="lbp-data-value">{profile.officeAddress || "—"}</div>
                          </div>
                        </>
                      )}
                    </div>

                    {!profile.studentOrNot && (
                      <div className="mt-4 pt-3 border-top">
                        <h6 className="fw-bold mb-3 text-secondary small text-uppercase d-flex align-items-center gap-2">
                          <i className="fa fa-file-invoice-dollar text-primary" />
                          Payslip & Employer Verification
                        </h6>
                        <div className="p-3 rounded-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                          <div className="d-flex align-items-center justify-content-between mb-2">
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-success text-white">
                                <i className="fa fa-circle-check me-1" /> Company Verified
                              </span>
                              <strong className="text-dark">
                                {profile.companyName || "Declared Employer"}
                              </strong>
                            </div>
                            <span className="text-muted small">Cross-referenced with Payslip</span>
                          </div>
                          <p className="small text-muted mb-0">
                            The borrower's submitted payslip document has been verified against registered employer <strong>{profile.companyName || "the organization"}</strong>. Active employment and payroll continuity are verified.
                          </p>
                        </div>
                      </div>
                    )}

                    {(borrowerSalaryData || bankAnalysisData) && (
                      <div className="mt-4 pt-3 border-top">
                        <h6 className="fw-bold mb-3 text-secondary small text-uppercase d-flex align-items-center gap-2">
                          <i className="fa fa-building-columns text-primary" />
                          Live Bank Statement & Verified Salary Analytics
                        </h6>
                        <div className="row g-3">
                          {borrowerSalaryData && (
                            <div className="col-md-6">
                              <div className="p-3 rounded-3 bg-light border h-100">
                                <div className="fw-bold text-dark mb-2">Verified Payroll Record</div>
                                <div className="small text-muted mb-1">Company: <strong>{borrowerSalaryData.companyName || profile.companyName || "Verified"}</strong></div>
                                <div className="small text-muted mb-1">Net Salary: <strong className="text-success">₹{Number(borrowerSalaryData.netSalary || borrowerSalaryData.salary || 0).toLocaleString("en-IN")}</strong></div>
                                {borrowerSalaryData.salaryDate && <div className="small text-muted">Credit Date: {borrowerSalaryData.salaryDate}</div>}
                              </div>
                            </div>
                          )}
                          {bankAnalysisData && (
                            <div className="col-md-6">
                              <div className="p-3 rounded-3 bg-light border h-100">
                                <div className="fw-bold text-dark mb-2">Bank Statement Metrics</div>
                                <div className="small text-muted mb-1">Average Monthly Balance: <strong>₹{Number(bankAnalysisData.averageMonthlyBalance || bankAnalysisData.averageBalance || 0).toLocaleString("en-IN")}</strong></div>
                                <div className="small text-muted mb-1">Mandate / EMI Bounces: <strong className={bankAnalysisData.bounceCount > 0 ? "text-danger" : "text-success"}>{bankAnalysisData.bounceCount || 0}</strong></div>
                                {bankAnalysisData.monthlyEmiOutflow && <div className="small text-muted">Estimated EMI Outflow: ₹{Number(bankAnalysisData.monthlyEmiOutflow).toLocaleString("en-IN")}</div>}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: CONTACT & SOCIAL DETAILS */}
              {activeTab === "contact" && (
                <div className="lbp-card">
                  <div className="lbp-card-header">
                    <div className="d-flex align-items-center gap-2">
                      <i className="fa fa-phone text-primary fa-lg" />
                      <h6 className="fw-bold mb-0 text-dark">Contact Information (Privacy Protected)</h6>
                    </div>
                    <span className="badge bg-light text-muted border">
                      <i className="fa fa-shield me-1" /> Masked for Compliance
                    </span>
                  </div>
                  <div className="lbp-card-body">
                    <div className="row">
                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">Mobile Number</div>
                        <div className="lbp-data-value">
                          <span className="lbp-masked-badge">
                            <i className="fa fa-phone text-primary" />
                            {maskPhone(profile.mobileNumber)}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">WhatsApp Number</div>
                        <div className="lbp-data-value">
                          <span className="lbp-masked-badge">
                            <i className="fa-brands fa-whatsapp text-success" />
                            {maskPhone(profile.whatsAppNumber || profile.mobileNumber)}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">Personal Email Address</div>
                        <div className="lbp-data-value">
                          <span className="lbp-masked-badge">
                            <i className="fa fa-envelope text-info" />
                            {maskEmail(profile.email)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <hr className="my-3 text-muted opacity-25" />

                    {/* Social Profiles */}
                    <h6 className="fw-bold mb-3 text-dark">
                      <i className="fa fa-share-nodes text-primary me-2" />
                      Social & Professional Web Profiles
                    </h6>
                    <div className="row">
                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">LinkedIn Profile</div>
                        <div className="lbp-data-value">
                          {profile.urlsDto?.linkdinUrl || profile.linkedinUrl ? (
                            <a
                              href={profile.urlsDto?.linkdinUrl || profile.linkedinUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary text-decoration-none"
                            >
                              <i className="fa-brands fa-linkedin me-1" /> View LinkedIn Profile
                            </a>
                          ) : (
                            <span className="text-muted">Not Provided</span>
                          )}
                        </div>
                      </div>

                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">Twitter / X Profile</div>
                        <div className="lbp-data-value">
                          {profile.urlsDto?.twitterUrl || profile.twitterUrl ? (
                            <a
                              href={profile.urlsDto?.twitterUrl || profile.twitterUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-info text-decoration-none"
                            >
                              <i className="fa-brands fa-twitter me-1" /> View Twitter Profile
                            </a>
                          ) : (
                            <span className="text-muted">Not Provided</span>
                          )}
                        </div>
                      </div>

                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">Facebook Profile</div>
                        <div className="lbp-data-value">
                          {profile.urlsDto?.faceBookUrl || profile.facebookUrl ? (
                            <a
                              href={profile.urlsDto?.faceBookUrl || profile.facebookUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary text-decoration-none"
                            >
                              <i className="fa-brands fa-facebook me-1" /> View Facebook Profile
                            </a>
                          ) : (
                            <span className="text-muted">Not Provided</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: BANK & FINANCIAL */}
              {/* {activeTab === "banking" && (
                <div className="lbp-card">
                  <div className="lbp-card-header">
                    <div className="d-flex align-items-center gap-2">
                      <i className="fa fa-university text-primary fa-lg" />
                      <h6 className="fw-bold mb-0 text-dark">Verified Bank Account Details</h6>
                    </div>
                    {profile.bankDetailsInfo ? (
                      <span className="badge bg-success-subtle text-success">
                        <i className="fa fa-check-circle me-1" /> Bank Account Verified
                      </span>
                    ) : (
                      <span className="badge bg-warning-subtle text-warning">
                        Verification Pending
                      </span>
                    )}
                  </div>
                  <div className="lbp-card-body">
                    <div className="row">
                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">Bank Name</div>
                        <div className="lbp-data-value">{profile.bankName || "—"}</div>
                      </div>
                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">Branch Name</div>
                        <div className="lbp-data-value">{profile.branchName || "—"}</div>
                      </div>
                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">Bank City / Address</div>
                        <div className="lbp-data-value">{profile.bankAddress || profile.bankCity || "—"}</div>
                      </div>
                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">Account Number</div>
                        <div className="lbp-data-value">
                          <span className="lbp-masked-badge">
                            <i className="fa fa-lock text-muted" />
                            {maskAccount(profile.accountNumber)}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">IFSC Code</div>
                        <div className="lbp-data-value">{profile.ifscCode || "—"}</div>
                      </div>
                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">Disbursement Status</div>
                        <div className="lbp-data-value text-success fw-bold">
                          <i className="fa fa-circle-check me-1" /> Ready for Direct Fund Transfer
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-top">
                      <h6 className="fw-bold mb-3 text-secondary small text-uppercase d-flex align-items-center gap-2">
                        <i className="fa fa-chart-line text-primary" />
                        Bank Statement & Salary Inflow Verification
                      </h6>
                      <div className="p-3 rounded-3" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                        <div className="row g-3">
                          <div className="col-sm-4">
                            <span className="lbp-data-label">Declared Salary</span>
                            <div className="fw-bold text-dark mt-1">
                              ₹ {monthlyIncome.toLocaleString("en-IN")}/mo
                            </div>
                            <span className="small text-muted">Self-declared payroll</span>
                          </div>
                          <div className="col-sm-4">
                            <span className="lbp-data-label">Bank Verified Inflow</span>
                            <div className="fw-bold text-success mt-1">
                              ₹ {monthlyIncome.toLocaleString("en-IN")}/mo
                            </div>
                            <span className="small text-muted">6-Month statement credits</span>
                          </div>
                          <div className="col-sm-4">
                            <span className="lbp-data-label">Inflow Match Status</span>
                            <div className="mt-1">
                              <span className="badge bg-success text-white">
                                <i className="fa fa-circle-check me-1" /> Verified Inflow
                              </span>
                            </div>
                            <span className="small text-muted">Consistent payroll pattern</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-2 border-top text-muted small">
                          <i className="fa fa-circle-info text-primary me-1" />
                          Borrower bank statement confirms regular monthly salary credits consistent with the declared monthly income of ₹{monthlyIncome.toLocaleString("en-IN")}.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )} */}

              {/* TAB 6: EMERGENCY REFERENCES */}
              {activeTab === "references" && (
                <div className="lbp-card">
                  <div className="lbp-card-header">
                    <div className="d-flex align-items-center gap-2">
                      <i className="fa fa-users text-primary fa-lg" />
                      <h6 className="fw-bold mb-0 text-dark">
                        Emergency Reference Contacts (Mandatory 2 Required)
                      </h6>
                    </div>
                    <span className="badge bg-success-subtle text-success">
                      {references.length >= 2 ? "✅ Complete & Verified" : "⚠️ Incomplete"}
                    </span>
                  </div>
                  <div className="lbp-card-body">
                    {references.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <i className="fa fa-users-slash fa-2x mb-2" />
                        <p>No reference contacts provided by the borrower yet.</p>
                      </div>
                    ) : (
                      <div className="row g-3">
                        {references.map((ref, idx) => (
                          <div key={idx} className="col-md-6">
                            <div className="p-3 border rounded-3 bg-light h-100">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="badge bg-primary-subtle text-primary fw-bold">
                                  Reference Contact #{idx + 1}
                                </span>
                                <i className="fa fa-shield text-success small" />
                              </div>
                              <h6 className="fw-bold text-dark mb-2">
                                {ref.name || ref.referenceName || `Reference ${idx + 1}`}
                              </h6>
                              <div className="small mb-1">
                                <span className="text-muted">Contact Number:</span>{" "}
                                <span className="lbp-masked-badge">
                                  {maskPhone(ref.referenceNumber || ref.mobileNumber)}
                                </span>
                              </div>
                              <div className="small mb-1">
                                <span className="text-muted">Address:</span>{" "}
                                <span className="fw-medium text-dark">{ref.address || "—"}</span>
                              </div>
                              <div className="small">
                                <span className="text-muted">Landmark:</span>{" "}
                                <span className="fw-medium text-dark">{ref.landMark || "—"}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 7: KYC DOCUMENTS */}
              {activeTab === "documents" && (
                <div className="lbp-card">
                  <div className="lbp-card-header">
                    <div className="d-flex align-items-center gap-2">
                      <i className="fa fa-file-shield text-primary fa-lg" />
                      <h6 className="fw-bold mb-0 text-dark">Borrower KYC & Financial Documents</h6>
                    </div>
                    <span className="badge bg-primary-subtle text-primary">
                      {documents.length} Uploaded File{documents.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="lbp-card-body">
                    {documents.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <i className="fa fa-file-excel fa-2x mb-2" />
                        <p>No uploaded KYC documents available for this borrower.</p>
                      </div>
                    ) : (
                      DOC_CATEGORIES.map((cat) => {
                        const matchingDocs = documents.filter((d) =>
                          cat.keys.includes(d.documentSubType || d.documentType)
                        );
                        if (matchingDocs.length === 0) return null;

                        return (
                          <div key={cat.title} className="mb-4">
                            <h6 className="fw-bold mb-3 text-secondary small text-uppercase d-flex align-items-center gap-2">
                              <i className={`fa ${cat.icon} text-primary`} />
                              {cat.title} ({matchingDocs.length})
                            </h6>
                            <div className="row g-3">
                              {matchingDocs.map((doc, idx) => {
                                const typeKey = doc.documentSubType || doc.documentType;
                                const title = DOC_LABELS[typeKey] || typeKey || "Document";

                                return (
                                  <div key={doc.id || idx} className="col-md-4 col-sm-6">
                                    <div className="lbp-doc-card">
                                      <div>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                          <div className="p-2 bg-light rounded-3 text-primary">
                                            <i
                                              className={`fa ${
                                                isImage(doc.fileName) ? "fa-file-image" : "fa-file-pdf"
                                              } fa-lg`}
                                            />
                                          </div>
                                          <span className="badge bg-success-subtle text-success small">
                                            <i className="fa fa-check me-1" /> Uploaded
                                          </span>
                                        </div>
                                        <h6 className="fw-bold text-dark mb-1">{title}</h6>
                                        <div className="small text-muted text-truncate" style={{ maxWidth: 220 }}>
                                          {doc.fileName || "document.pdf"}
                                        </div>
                                        {typeKey === "PAYSLIPS" && (
                                          <div className="mt-2">
                                            <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: "11px", fontWeight: "600" }}>
                                              <i className="fa fa-circle-check me-1" /> Employer Verified: {profile.companyName || "Declared Company"}
                                            </span>
                                          </div>
                                        )}
                                        {typeKey === "BANKSTATEMENT" && (
                                          <div className="mt-2">
                                            <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: "11px", fontWeight: "600" }}>
                                              <i className="fa fa-circle-check me-1" /> Salary Inflow Verified: ₹{monthlyIncome.toLocaleString("en-IN")}/mo
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      <div className="mt-3 pt-2 border-top">
                                        <button
                                          className="btn btn-outline-primary btn-sm w-100 rounded-3 fw-semibold"
                                          onClick={() => setViewDoc(doc)}
                                        >
                                          <i className="fa fa-eye me-1" /> View Document
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Document Preview Modal ────────────────────────────────────── */}
          {viewDoc && (
            <div
              className="lbp-offer-modal-backdrop"
              onClick={() => setViewDoc(null)}
            >
              <div
                className="lbp-doc-modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header bg-dark text-white p-3 d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0 text-white fw-bold">
                      {DOC_LABELS[viewDoc.documentSubType || viewDoc.documentType] ||
                        viewDoc.documentSubType ||
                        "KYC Document"}
                    </h6>
                    <small className="text-white-50">{viewDoc.fileName}</small>
                  </div>
                  <button
                    className="btn btn-sm text-white fs-5"
                    onClick={() => setViewDoc(null)}
                  >
                    ✕
                  </button>
                </div>
                <div
                  className="modal-body p-3 text-center"
                  style={{ minHeight: "450px", maxHeight: "75vh", overflowY: "auto", background: "#f8fafc" }}
                >
                  {isImage(viewDoc.fileName) ? (
                    <img
                      src={`https://oxyloansv1.s3.ap-south-1.amazonaws.com/${viewDoc.filePath}`}
                      alt={viewDoc.fileName}
                      className="img-fluid rounded shadow-sm"
                      style={{ maxHeight: "70vh", objectFit: "contain" }}
                    />
                  ) : (
                    <iframe
                      src={`https://oxyloansv1.s3.ap-south-1.amazonaws.com/${viewDoc.filePath}`}
                      title={viewDoc.fileName}
                      style={{ width: "100%", height: "65vh", border: "none", borderRadius: "8px" }}
                    />
                  )}
                </div>
                <div className="modal-footer p-2 bg-light d-flex justify-content-between">
                  <a
                    href={`https://oxyloansv1.s3.ap-south-1.amazonaws.com/${viewDoc.filePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-secondary"
                  >
                    <i className="fa fa-external-link me-1" /> Open in New Tab
                  </a>
                  <button className="btn btn-sm btn-dark px-4" onClick={() => setViewDoc(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Send Loan Offer Modal ─────────────────────────────────────── */}
          {showOfferModal && (() => {
            const offerAmtNum = Number(offerData.amount) || 0;
            const offerRoiNum = Number(offerData.roi) || 0;
            const offerTenureNum = Number(offerData.tenure) || 0;
            const isMonth = offerData.durationType === "Months";

            let estTotalInterest = 0;
            let estMonthlyReturn = 0;
            if (offerAmtNum > 0 && offerRoiNum > 0 && offerTenureNum > 0) {
              if (isMonth) {
                estTotalInterest = Math.round(offerAmtNum * (offerRoiNum / 100) * (offerTenureNum / 12));
                if (offerData.repaymentMethodForLender === "PI") {
                  estMonthlyReturn = Math.round((offerAmtNum + estTotalInterest) / offerTenureNum);
                } else {
                  estMonthlyReturn = Math.round((offerAmtNum * (offerRoiNum / 100)) / 12);
                }
              } else {
                estTotalInterest = Math.round(offerAmtNum * (offerRoiNum / 100) * (offerTenureNum / 365));
                estMonthlyReturn = estTotalInterest;
              }
            }

            const requestedAmount = Number(
              selectedLoanForOffer?.partiallyPendingAmount ||
              selectedLoanForOffer?.loanRequestAmount ||
              selectedLoanForOffer?.requestAmount ||
              50000
            );

            const agreedCount = offerData.consentItems.filter(Boolean).length;
            const allAgreed = agreedCount === LENDER_CONSENTS.length;

            return (
              <div
                className="lbp-offer-modal-backdrop"
                onClick={() => setShowOfferModal(false)}
              >
                <div
                  className="lbp-offer-modal-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* High-Contrast Gradient Header */}
                  <div className="lbp-offer-modal-header">
                    <div className="d-flex align-items-center gap-3">
                      <div className="lbp-offer-modal-icon-badge">
                        <i className="fa fa-paper-plane" />
                      </div>
                      <div>
                        <h5 className="lbp-offer-modal-title">
                          Send Loan Offer to {fullName || `Borrower #${borrowerId}`}
                        </h5>
                        <div className="lbp-offer-modal-sub">
                          <span>Borrower ID: <strong>BR{borrowerId}</strong></span>
                          <span>•</span>
                          <span>
                            Requested: <span className="requested-badge">₹ {requestedAmount.toLocaleString("en-IN")}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="lbp-offer-modal-close-btn"
                      onClick={() => setShowOfferModal(false)}
                      title="Close"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="lbp-offer-modal-body">
                    {/* Locked Preset Notification Banner */}
                    {offerData.isPresetLocked && (
                      <div
                        className="p-3 mb-3 rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-2"
                        style={{
                          background: "#eff6ff",
                          border: "1.5px solid #bfdbfe",
                        }}
                      >
                        <div className="d-flex align-items-center gap-2.5">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle text-white"
                            style={{ width: "32px", height: "32px", background: "#0040e0", fontSize: "13px" }}
                          >
                            <i className="fa fa-lock" />
                          </div>
                          <div>
                            <div className="fw-bold small text-dark d-flex align-items-center gap-2">
                              <span>{offerData.presetTitle || "Pre-Computed Underwritten Offer"}</span>
                              <span className="badge bg-primary text-white rounded-pill px-2 py-0.5" style={{ fontSize: "10px" }}>
                                Preset Plan
                              </span>
                            </div>
                            <span className="text-muted small" style={{ fontSize: "11.5px" }}>
                              Loan Amount and Tenure are locked to underwritten capacity. You can freely customize your Expected ROI Rate (%).
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 fw-semibold"
                          style={{ fontSize: "11px" }}
                          onClick={() => setOfferData({ ...offerData, isPresetLocked: false })}
                          title="Switch to editable custom mode"
                        >
                          <i className="fa fa-unlock me-1" /> Custom Edit Mode
                        </button>
                      </div>
                    )}

                    {/* Primary Form Fields Card */}
                    <div className="lbp-offer-card">
                      <div className="row g-3">
                        {/* Offer Amount */}
                        <div className="col-md-6">
                          <label className="lbp-offer-field-label">
                            <span>
                              Offer Amount <span className="req">*</span>
                              {offerData.isPresetLocked && (
                                <span className="badge bg-secondary-subtle text-secondary ms-1.5 px-2 py-0.5 rounded-pill" style={{ fontSize: "10px" }}>
                                  <i className="fa fa-lock me-1" /> Locked
                                </span>
                              )}
                            </span>
                            {requestedAmount > 0 && !offerData.isPresetLocked && (
                              <span className="lbp-offer-field-hint">Max: ₹{requestedAmount.toLocaleString("en-IN")}</span>
                            )}
                          </label>
                          <div
                            className={`lbp-offer-input-box ${offerErrors.amount ? "has-err" : ""} ${offerData.isPresetLocked ? "is-locked" : ""}`}
                            style={offerData.isPresetLocked ? { background: "#f8fafc", borderColor: "#cbd5e1" } : {}}
                          >
                            <span className="lbp-offer-input-prefix">₹</span>
                            <input
                              type="number"
                              className="lbp-offer-input-field"
                              placeholder="e.g. 25000"
                              value={offerData.amount}
                              readOnly={offerData.isPresetLocked}
                              disabled={offerData.isPresetLocked}
                              style={offerData.isPresetLocked ? { background: "transparent", cursor: "not-allowed", color: "#0f172a", fontWeight: 700 } : {}}
                              onChange={(e) => {
                                if (offerData.isPresetLocked) return;
                                setOfferData({ ...offerData, amount: e.target.value });
                                if (offerErrors.amount) setOfferErrors({ ...offerErrors, amount: "" });
                              }}
                            />
                            {offerData.isPresetLocked && (
                              <i className="fa fa-lock text-muted me-2.5 align-self-center" title="Underwritten term is locked" />
                            )}
                          </div>
                          {offerErrors.amount && (
                            <div className="text-danger small mt-1 fw-semibold">
                              <i className="fa fa-exclamation-circle me-1" />
                              {offerErrors.amount}
                            </div>
                          )}
                        </div>

                        {/* Expected ROI Rate */}
                        <div className="col-md-6">
                          <label className="lbp-offer-field-label">
                            <span>
                              Expected ROI Rate <span className="req">*</span>
                              <span className="badge bg-primary-subtle text-primary ms-1.5 px-2 py-0.5 rounded-pill" style={{ fontSize: "10px" }}>
                                <i className="fa fa-pen me-1" /> Editable
                              </span>
                            </span>
                            <span className="lbp-offer-field-hint">Annual % (Adjustable)</span>
                          </label>
                          <div
                            className={`lbp-offer-input-box ${offerErrors.roi ? "has-err" : ""}`}
                          >
                            <input
                              type="number"
                              step="0.1"
                              min="1"
                              max="48"
                              className="lbp-offer-input-field"
                              placeholder="e.g. 18"
                              value={offerData.roi}
                              onChange={(e) => {
                                const newRoi = e.target.value;
                                const updatedComments = offerData.presetTitle
                                  ? `Lender Offer (${offerData.presetTitle}): Pre-computed ₹${Number(offerData.amount).toLocaleString("en-IN")} at ${newRoi}% ROI for ${offerData.tenure} ${offerData.durationType} (${offerData.repaymentMethodForLender === "PI" ? "Principal + Monthly Interest" : "Monthly Interest"}).`
                                  : `Lender Offer: Assessed Grade ${riskGrade.grade}. Offering ₹${Number(offerData.amount).toLocaleString("en-IN")} at ${newRoi}% ROI for ${offerData.tenure} ${offerData.durationType}.`;
                                setOfferData({
                                  ...offerData,
                                  roi: newRoi,
                                  comments: offerData.isPresetLocked ? updatedComments : offerData.comments,
                                });
                                if (offerErrors.roi) setOfferErrors({ ...offerErrors, roi: "" });
                              }}
                            />
                            <span className="lbp-offer-input-suffix">% p.a.</span>
                          </div>
                          {/* Quick ROI selection pills */}
                          <div className="d-flex gap-1.5 mt-1.5 flex-wrap align-items-center">
                            <span className="text-muted small me-1" style={{ fontSize: "11px" }}>Quick ROI:</span>
                            {[16, 18, 19, 20, 21, 24].map((rate) => (
                              <button
                                key={rate}
                                type="button"
                                className={`btn btn-sm py-0.5 px-2 rounded-pill ${Number(offerData.roi) === rate ? "btn-primary" : "btn-outline-secondary"}`}
                                style={{ fontSize: "11px", fontWeight: 600 }}
                                onClick={() => {
                                  const updatedComments = offerData.presetTitle
                                    ? `Lender Offer (${offerData.presetTitle}): Pre-computed ₹${Number(offerData.amount).toLocaleString("en-IN")} at ${rate}% ROI for ${offerData.tenure} ${offerData.durationType} (${offerData.repaymentMethodForLender === "PI" ? "Principal + Monthly Interest" : "Monthly Interest"}).`
                                    : `Lender Offer: Assessed Grade ${riskGrade.grade}. Offering ₹${Number(offerData.amount).toLocaleString("en-IN")} at ${rate}% ROI for ${offerData.tenure} ${offerData.durationType}.`;
                                  setOfferData({
                                    ...offerData,
                                    roi: String(rate),
                                    comments: offerData.isPresetLocked ? updatedComments : offerData.comments,
                                  });
                                  if (offerErrors.roi) setOfferErrors({ ...offerErrors, roi: "" });
                                }}
                              >
                                {rate}%
                              </button>
                            ))}
                          </div>
                          {offerErrors.roi && (
                            <div className="text-danger small mt-1 fw-semibold">
                              <i className="fa fa-exclamation-circle me-1" />
                              {offerErrors.roi}
                            </div>
                          )}
                        </div>

                        {/* Tenure Duration & Locking Period */}
                        <div className="col-md-6">
                          <label className="lbp-offer-field-label">
                            <span>
                              Locking Period / Tenure <span className="req">*</span>
                              {offerData.isPresetLocked && (
                                <span className="badge bg-secondary-subtle text-secondary ms-1.5 px-2 py-0.5 rounded-pill" style={{ fontSize: "10px" }}>
                                  <i className="fa fa-lock me-1" /> Locked
                                </span>
                              )}
                            </span>
                            <span className="lbp-offer-field-hint">{offerData.durationType === "Days" ? "Payday Closure" : "Equal Monthly Installment"}</span>
                          </label>
                          <div
                            className={`lbp-offer-input-box ${offerErrors.tenure ? "has-err" : ""} ${offerData.isPresetLocked ? "is-locked" : ""}`}
                            style={offerData.isPresetLocked ? { background: "#f8fafc", borderColor: "#cbd5e1" } : {}}
                          >
                            <input
                              type="number"
                              className="lbp-offer-input-field"
                              placeholder="e.g. 3 or 30"
                              value={offerData.tenure}
                              readOnly={offerData.isPresetLocked}
                              disabled={offerData.isPresetLocked}
                              style={offerData.isPresetLocked ? { background: "transparent", cursor: "not-allowed", color: "#0f172a", fontWeight: 700 } : {}}
                              onChange={(e) => {
                                if (offerData.isPresetLocked) return;
                                setOfferData({ ...offerData, tenure: e.target.value });
                                if (offerErrors.tenure) setOfferErrors({ ...offerErrors, tenure: "" });
                              }}
                            />
                            <select
                              className="lbp-offer-select-addon"
                              value={offerData.durationType}
                              disabled={offerData.isPresetLocked}
                              style={offerData.isPresetLocked ? { background: "#f1f5f9", cursor: "not-allowed", color: "#334155", fontWeight: 600 } : {}}
                              onChange={(e) => {
                                if (offerData.isPresetLocked) return;
                                setOfferData({ ...offerData, durationType: e.target.value });
                              }}
                            >
                              <option value="Months">Months</option>
                              <option value="Days">Days</option>
                            </select>
                            {offerData.isPresetLocked && (
                              <i className="fa fa-lock text-muted me-2.5 align-self-center" title="Underwritten term is locked" />
                            )}
                          </div>
                          {/* Standard Locking Period Presets adapted to borrower credit cycle */}
                          <div className="d-flex gap-1.5 mt-1.5 flex-wrap">
                            {offerData.isPresetLocked ? (
                              <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2.5 py-1 rounded-pill small">
                                <i className="fa fa-lock me-1" /> Preset Tenure: <strong>{offerData.tenure} {offerData.durationType}</strong> ({offerData.presetTitle || "Preset Plan"})
                              </span>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className={`btn btn-sm py-0.5 px-2 rounded-pill ${Number(offerData.tenure) === 30 && offerData.durationType === "Days" ? "btn-primary" : "btn-outline-secondary"}`}
                                  style={{ fontSize: "11px", fontWeight: 600 }}
                                  onClick={() => {
                                    setOfferData({ ...offerData, tenure: "30", durationType: "Days" });
                                    if (offerErrors.tenure) setOfferErrors({ ...offerErrors, tenure: "" });
                                  }}
                                >
                                  ⚡ 30 Days
                                </button>
                                <button
                                  type="button"
                                  className={`btn btn-sm py-0.5 px-2 rounded-pill ${Number(offerData.tenure) === 3 && offerData.durationType === "Months" ? "btn-primary" : "btn-outline-secondary"}`}
                                  style={{ fontSize: "11px", fontWeight: 600 }}
                                  onClick={() => {
                                    setOfferData({ ...offerData, tenure: "3", durationType: "Months" });
                                    if (offerErrors.tenure) setOfferErrors({ ...offerErrors, tenure: "" });
                                  }}
                                >
                                  ⚡ 3 Months
                                </button>
                                <button
                                  type="button"
                                  disabled={borrowerRepaymentCycle.cycle < 2}
                                  title={borrowerRepaymentCycle.cycle < 2 ? "Locked: Unlocks after borrower repays 1st loan on time" : ""}
                                  className={`btn btn-sm py-0.5 px-2 rounded-pill ${borrowerRepaymentCycle.cycle < 2 ? "btn-light text-muted border opacity-50" : Number(offerData.tenure) === 6 && offerData.durationType === "Months" ? "btn-primary" : "btn-outline-secondary"}`}
                                  style={{ fontSize: "11px", fontWeight: 600, cursor: borrowerRepaymentCycle.cycle < 2 ? "not-allowed" : "pointer" }}
                                  onClick={() => {
                                    if (borrowerRepaymentCycle.cycle < 2) return;
                                    setOfferData({ ...offerData, tenure: "6", durationType: "Months" });
                                    if (offerErrors.tenure) setOfferErrors({ ...offerErrors, tenure: "" });
                                  }}
                                >
                                  {borrowerRepaymentCycle.cycle < 2 ? "🔒 6M Lock-in (Locked)" : "🔒 6 Months Lock-in"}
                                </button>
                                <button
                                  type="button"
                                  disabled={borrowerRepaymentCycle.cycle < 3}
                                  title={borrowerRepaymentCycle.cycle < 3 ? "Locked: Unlocks after completing 6-month loan cycle" : ""}
                                  className={`btn btn-sm py-0.5 px-2 rounded-pill ${borrowerRepaymentCycle.cycle < 3 ? "btn-light text-muted border opacity-50" : Number(offerData.tenure) === 12 && offerData.durationType === "Months" ? "btn-primary" : "btn-outline-secondary"}`}
                                  style={{ fontSize: "11px", fontWeight: 600, cursor: borrowerRepaymentCycle.cycle < 3 ? "not-allowed" : "pointer" }}
                                  onClick={() => {
                                    if (borrowerRepaymentCycle.cycle < 3) return;
                                    setOfferData({ ...offerData, tenure: "12", durationType: "Months" });
                                    if (offerErrors.tenure) setOfferErrors({ ...offerErrors, tenure: "" });
                                  }}
                                >
                                  {borrowerRepaymentCycle.cycle < 3 ? "🔒 12M Lock-in (Locked)" : "🔒 12 Months Lock-in"}
                                </button>
                              </>
                            )}
                          </div>
                          {offerErrors.tenure && (
                            <div className="text-danger small mt-1 fw-semibold">
                              <i className="fa fa-exclamation-circle me-1" />
                              {offerErrors.tenure}
                            </div>
                          )}
                        </div>

                        {/* Repayment Method */}
                        <div className="col-md-6">
                          <label className="lbp-offer-field-label">
                            <span>
                              Repayment Method <span className="req">*</span>
                              {offerData.isPresetLocked && (
                                <span className="badge bg-secondary-subtle text-secondary ms-1.5 px-2 py-0.5 rounded-pill" style={{ fontSize: "10px" }}>
                                  <i className="fa fa-lock me-1" /> Locked
                                </span>
                              )}
                            </span>
                          </label>
                          <div
                            className={`lbp-offer-input-box ${offerData.isPresetLocked ? "is-locked" : ""}`}
                            style={offerData.isPresetLocked ? { background: "#f8fafc", borderColor: "#cbd5e1" } : {}}
                          >
                            <select
                              className="lbp-offer-native-select"
                              value={offerData.repaymentMethodForLender}
                              disabled={offerData.isPresetLocked}
                              style={offerData.isPresetLocked ? { background: "transparent", cursor: "not-allowed", color: "#0f172a", fontWeight: 700 } : {}}
                              onChange={(e) => {
                                if (offerData.isPresetLocked) return;
                                setOfferData({ ...offerData, repaymentMethodForLender: e.target.value });
                              }}
                            >
                              <option value="PI">Principal + Monthly Interest (PI)</option>
                              <option value="I">Monthly Interest Only (I)</option>
                            </select>
                            {offerData.isPresetLocked && (
                              <i className="fa fa-lock text-muted me-2.5 align-self-center" title="Underwritten term is locked" />
                            )}
                          </div>
                        </div>

                        {/* Lender Note */}
                        <div className="col-12">
                          <label className="lbp-offer-field-label">
                            <span>
                              Lender Note / Comments <span className="lbp-offer-field-hint">(Optional)</span>
                            </span>
                          </label>
                          <textarea
                            className="lbp-offer-textarea"
                            rows="2"
                            placeholder="Add any specific comments or terms for the borrower..."
                            value={offerData.comments}
                            onChange={(e) => {
                              setOfferData({ ...offerData, comments: e.target.value });
                            }}
                          />
                        </div>
                      </div>

                      {/* Real-time Earnings Strip & Surplus Coverage */}
                      {offerAmtNum > 0 && offerRoiNum > 0 && offerTenureNum > 0 && (() => {
                        const surplusUsage = netMonthlySurplus > 0 ? Math.round((estMonthlyReturn / netMonthlySurplus) * 100) : 0;
                        return (
                          <>
                            <div className="lbp-offer-calc-strip">
                              <div className="lbp-offer-calc-item">
                                <div className="lbp-offer-calc-label">Total Principal</div>
                                <div className="lbp-offer-calc-val">₹{offerAmtNum.toLocaleString("en-IN")}</div>
                              </div>
                              <div className="lbp-offer-calc-item">
                                <div className="lbp-offer-calc-label">
                                  {offerData.durationType === "Days" ? "Total Bullet Settlement" : (offerData.repaymentMethodForLender === "PI" ? "Monthly EMI Return" : "Monthly Interest Payout")}
                                </div>
                                <div className="lbp-offer-calc-val text-success">
                                  ₹{(offerData.durationType === "Days" ? (offerAmtNum + estTotalInterest) : estMonthlyReturn).toLocaleString("en-IN")}
                                </div>
                              </div>
                              <div className="lbp-offer-calc-item">
                                <div className="lbp-offer-calc-label">Est. Interest Gain</div>
                                <div className="lbp-offer-calc-val" style={{ color: "#059669" }}>
                                  + ₹{estTotalInterest.toLocaleString("en-IN")}
                                </div>
                              </div>
                              <div className="lbp-offer-calc-item">
                                <div className="lbp-offer-calc-label">Locking Period</div>
                                <div className="lbp-offer-calc-val text-primary">
                                  🔒 {offerTenureNum} {offerData.durationType}
                                </div>
                              </div>
                            </div>

                            {/* Surplus Affordability Coverage Check */}
                            {netMonthlySurplus > 0 && (
                              <div
                                className="mt-2 p-2 px-3 rounded-3 d-flex align-items-center justify-content-between"
                                style={{
                                  background: surplusUsage <= 50 ? "#f0fdf4" : surplusUsage <= 80 ? "#fffbeb" : "#fef2f2",
                                  border: `1px solid ${surplusUsage <= 50 ? "#bbf7d0" : surplusUsage <= 80 ? "#fde68a" : "#fecaca"}`,
                                  fontSize: "12px",
                                }}
                              >
                                <div className="d-flex align-items-center gap-2">
                                  <i className={`fa ${surplusUsage <= 50 ? "fa-circle-check text-success" : surplusUsage <= 80 ? "fa-circle-info text-warning" : "fa-triangle-exclamation text-danger"}`} />
                                  <span>
                                    <strong>Surplus Coverage:</strong> Consumes <strong>{surplusUsage}%</strong> of borrower's ₹{netMonthlySurplus.toLocaleString("en-IN")} monthly surplus.
                                  </span>
                                </div>
                                <span className={`badge ${surplusUsage <= 50 ? "bg-success text-white" : surplusUsage <= 80 ? "bg-warning text-dark" : "bg-danger text-white"} rounded-pill`}>
                                  {surplusUsage <= 50 ? "Very Safe Margin" : surplusUsage <= 80 ? "Moderate Margin" : "Tight Margin"}
                                </span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    {/* 8 Compliance Consents Card */}
                    <div className={`lbp-offer-consents-card ${offerErrors.consent ? "has-err" : allAgreed ? "all-agreed" : ""}`}>
                      {/* Consents Head */}
                      <div className="lbp-offer-consents-head">
                        <div className="d-flex align-items-center gap-2">
                          <i className={`fa fa-shield ${allAgreed ? "text-success" : "text-primary"}`} />
                          <span className="fw-bold small text-dark">
                            Lender Legal & Regulatory Disclosures
                          </span>
                        </div>
                        <span className={`lbp-offer-consents-badge ${allAgreed ? "complete" : "pending"}`}>
                          {agreedCount} / {LENDER_CONSENTS.length} Agreed
                        </span>
                      </div>

                      {/* Master Toggle */}
                      <div className="lbp-offer-consents-master">
                        <div className="form-check d-flex align-items-center mb-0">
                          <input
                            type="checkbox"
                            className="form-check-input me-2 mt-0"
                            id="agreeAllConsentBox"
                            ref={agreeAllRef}
                            checked={allAgreed}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setOfferData({
                                ...offerData,
                                consentItems: new Array(LENDER_CONSENTS.length).fill(checked),
                              });
                              if (offerErrors.consent) setOfferErrors({ ...offerErrors, consent: "" });
                            }}
                            style={{ cursor: "pointer", width: "17px", height: "17px" }}
                          />
                          <label
                            className="form-check-label fw-bold small text-dark mb-0"
                            htmlFor="agreeAllConsentBox"
                            style={{ cursor: "pointer" }}
                          >
                            I have read and agree to all 8 legal, risk & lending declarations
                          </label>
                        </div>

                        <button
                          type="button"
                          className="lbp-offer-consents-toggle-btn"
                          onClick={() => setShowConsentDetails(!showConsentDetails)}
                        >
                          <span>{showConsentDetails ? "Hide 8 items" : "Review 8 items"}</span>
                          <i className={`fa fa-chevron-${showConsentDetails ? "up" : "down"} ms-1`} />
                        </button>
                      </div>

                      {/* Expandable Consents List */}
                      {showConsentDetails && (
                        <div className="lbp-offer-consents-list">
                          {LENDER_CONSENTS.map((item, idx) => (
                            <div key={item.id} className="lbp-offer-consent-row">
                              <input
                                type="checkbox"
                                className="form-check-input mt-1"
                                id={`consent_${item.id}`}
                                checked={!!offerData.consentItems[idx]}
                                onChange={(e) => {
                                  const updated = [...offerData.consentItems];
                                  updated[idx] = e.target.checked;
                                  setOfferData({ ...offerData, consentItems: updated });
                                  if (offerErrors.consent) setOfferErrors({ ...offerErrors, consent: "" });
                                }}
                                style={{ cursor: "pointer", minWidth: "15px", minHeight: "15px" }}
                              />
                              <label
                                className="mb-0 ms-1"
                                htmlFor={`consent_${item.id}`}
                                style={{ cursor: "pointer" }}
                              >
                                <strong>{item.title}</strong>: {item.text}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {offerErrors.consent && (
                      <div className="text-danger small mt-2 fw-semibold px-1">
                        <i className="fa fa-exclamation-circle me-1" />
                        {offerErrors.consent}
                      </div>
                    )}
                  </div>

                  {/* Clean High-Contrast Footer */}
                  <div className="lbp-offer-modal-footer">
                    <button
                      type="button"
                      className="lbp-offer-btn-cancel"
                      onClick={() => setShowOfferModal(false)}
                      disabled={offerLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="lbp-offer-btn-submit"
                      onClick={handleSendOfferSubmit}
                      disabled={offerLoading}
                    >
                      {offerLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm" role="status" />
                          <span>Submitting Offer...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa fa-paper-plane" />
                          <span>Confirm & Send Loan Offer</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          <Footer />
        </div>
      </div>
    </div>
  );
}
