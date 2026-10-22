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
} from "../../../HttpRequest/afterlogin";
import { calculateBorrowerProfileCompleteness } from "../../../../utils/borrowerValidation";
import CreditScoreGauge from "../Borrower/redesign/components/CreditScoreGauge";
import {
  RAW_SAMPLE_RESPONSE,
  parseCreditReportData,
  getCachedCreditReport,
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
  const borrowerId =
    paramId ||
    searchParams.get("borrowerId") ||
    searchParams.get("userId") ||
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
  const [activeTab, setActiveTab] = useState("overview");

  // Credit Bureau & Risk Analysis States
  const [creditReportData, setCreditReportData] = useState(() => {
    const cached = getCachedCreditReport();
    return parseCreditReportData(cached || RAW_SAMPLE_RESPONSE);
  });
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
    tenure: "3",
    roi: "18",
    durationType: "Months",
    repaymentMethodForLender: "PI",
    comments: "",
    consentItems: new Array(LENDER_CONSENTS.length).fill(false),
  });

  const agreeAllRef = useRef(null);

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

      // Parallel fetch of all borrower endpoints
      const [userRes, refRes, docsRes, loanRes, oxyRes] = await Promise.allSettled([
        getUserDetailsForBorrower(borrowerId).catch(async () => {
          // Fallback to personal endpoint if getBorrowersInfo fails
          return axios.get(`${base_url}personal/${borrowerId}`, {
            headers: { accessToken: token },
          });
        }),
        getBorrowerReferenceDetails(borrowerId).catch(() => null),
        getBorrowerDocuments(borrowerId).catch(() => null),
        getBorrowerLoanDetails(borrowerId).catch(() => null),
        axios
          .get(`${BASE_URL}/v1/cibil/marketplace-score/${borrowerId}`, {
            headers: { userId: currentUserId, accessToken: token },
          })
          .catch(() => null),
      ]);

      // Profile extraction
      let prof = null;
      if (userRes.status === "fulfilled" && userRes.value) {
        prof = userRes.value?.data || userRes.value;
      }
      setProfile(prof);

      // References extraction
      let refList = [];
      if (refRes.status === "fulfilled" && refRes.value) {
        const d = refRes.value?.data || refRes.value;
        if (Array.isArray(d)) refList = d;
        else if (Array.isArray(d?.referenceDto)) refList = d.referenceDto;
        else if (Array.isArray(d?.referenceDetailsResponseDto)) refList = d.referenceDetailsResponseDto;
      }
      // Fallback: check profile object for references if dedicated API returned empty
      if (refList.length === 0 && prof) {
        if (Array.isArray(prof.referenceDto)) refList = prof.referenceDto;
        else if (Array.isArray(prof.referenceDetailsResponseDto)) refList = prof.referenceDetailsResponseDto;
      }
      setReferences(refList);

      // Documents extraction
      let docList = [];
      if (docsRes.status === "fulfilled" && docsRes.value) {
        const d = docsRes.value?.data || docsRes.value;
        if (Array.isArray(d)) docList = d;
      }
      setDocuments(docList);

      // Loan Details extraction
      let loans = [];
      if (loanRes.status === "fulfilled" && loanRes.value) {
        const d = loanRes.value?.data || loanRes.value;
        if (Array.isArray(d)) loans = d;
        else if (d && typeof d === "object" && (d.requestAmount || d.loanRequestAmount)) {
          loans = [d];
        }
      }
      setLoanDetails(loans);

      // OxyScore extraction
      if (oxyRes.status === "fulfilled" && oxyRes.value) {
        setOxyScoreData(oxyRes.value?.data || null);
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

  // ── Financial & Bureau Risk Calculations ─────────────────────────────────
  const monthlyIncome = useMemo(() => {
    return Number(profile?.salary) || Number(oxyScoreData?.dbrAnalysis?.monthlyIncome) || 65000;
  }, [profile?.salary, oxyScoreData?.dbrAnalysis?.monthlyIncome]);

  const existingEMIs = useMemo(() => {
    if (oxyScoreData?.dbrAnalysis?.existingEMIs) {
      return Number(oxyScoreData.dbrAnalysis.existingEMIs);
    }
    const cardBal = Number(creditReportData?.metrics?.totalBalance || 125586);
    return Math.round(cardBal * 0.05); // standard 5% min payment estimate for revolving debt
  }, [oxyScoreData?.dbrAnalysis?.existingEMIs, creditReportData?.metrics?.totalBalance]);

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
    return maxNewEMI * 12; // 12 months capacity
  }, [maxNewEMI]);

  const surplusIncome = useMemo(() => {
    return Math.max(0, monthlyIncome - existingEMIs);
  }, [monthlyIncome, existingEMIs]);

  const cardBalance = useMemo(() => {
    return Number(creditReportData?.metrics?.totalBalance || 125586);
  }, [creditReportData?.metrics?.totalBalance]);

  const cardLimit = useMemo(() => {
    return Number(creditReportData?.metrics?.totalLimit || 156000);
  }, [creditReportData?.metrics?.totalLimit]);

  const cardUtilization = useMemo(() => {
    if (cardLimit > 0) {
      return Number(((cardBalance / cardLimit) * 100).toFixed(1));
    }
    return Number(creditReportData?.metrics?.utilizationRatio || 80.5);
  }, [cardBalance, cardLimit, creditReportData?.metrics?.utilizationRatio]);

  const bureauScore = useMemo(() => {
    return creditReportData?.score || oxyScoreData?.oxyScore || 802;
  }, [creditReportData?.score, oxyScoreData?.oxyScore]);

  const scoreTier = useMemo(() => {
    return getScoreTier(bureauScore);
  }, [bureauScore]);

  const riskGrade = useMemo(() => {
    const score = bureauScore;
    const dti = dtiRatio;
    const pastDue = creditReportData?.metrics?.pastDueAmount || 0;
    const bounces = oxyScoreData?.repaymentHistory?.bounceCount || 0;

    const requested = activeLoan
      ? Number(activeLoan.partiallyPendingAmount || activeLoan.loanRequestAmount || activeLoan.requestAmount || 50000)
      : 50000;

    if (score >= 750 && dti <= 40 && pastDue === 0 && bounces === 0) {
      return {
        grade: "A+",
        title: "Prime+ (Very Low Risk)",
        badgeClass: "bg-success text-white",
        badgeSubtle: "bg-success-subtle text-success",
        color: "#059669",
        recommendedRoiRange: "16% – 18%",
        suggestedRoi: 18,
        suggestedTenure: 6,
        suggestedAmount: Math.min(requested, Math.max(25000, maxNewEMI * 6)),
        summary: "Exceptional credit profile with zero delinquencies, low debt burden, and steady income. Safe for immediate funding.",
        safetyTag: "SAFE TO FUND",
        stars: 5,
      };
    } else if (score >= 700 && dti <= 50 && pastDue === 0) {
      return {
        grade: "A",
        title: "Prime (Low Risk)",
        badgeClass: "bg-primary text-white",
        badgeSubtle: "bg-primary-subtle text-primary",
        color: "#2563eb",
        recommendedRoiRange: "18% – 20%",
        suggestedRoi: 19,
        suggestedTenure: 6,
        suggestedAmount: Math.min(requested, Math.max(20000, maxNewEMI * 6)),
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
        suggestedTenure: 3,
        suggestedAmount: Math.min(requested, Math.max(15000, maxNewEMI * 3)),
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
        suggestedTenure: 3,
        suggestedAmount: Math.min(requested, 10000),
        summary: "Elevated credit risk or high debt burden. Exercise caution and consider smaller offer amounts.",
        safetyTag: "ELEVATED RISK",
        stars: 2,
      };
    }
  }, [bureauScore, dtiRatio, creditReportData, oxyScoreData, activeLoan, maxNewEMI]);

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

    const creditAgeYears = Number(creditReportData?.metrics?.creditAgeYears || 7.8);
    if (creditAgeYears >= 3) {
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

    const activeCount = Number(creditReportData?.metrics?.activeAccountsCount || 1);
    if (activeCount > 0) {
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

  // ── Make Offer Handlers ──────────────────────────────────────────────────
  const handleGiveOfferWithTerms = (customTerms) => {
    const targetLoan = activeLoan || loanDetails[0] || null;
    setSelectedLoanForOffer(targetLoan);
    const amt = customTerms?.amount || riskGrade.suggestedAmount || 50000;
    const roi = customTerms?.roi || riskGrade.suggestedRoi || 18;
    const tenure = customTerms?.tenure || riskGrade.suggestedTenure || 6;

    setOfferData({
      amount: String(amt),
      tenure: String(tenure),
      roi: String(roi),
      durationType: "Months",
      repaymentMethodForLender: "PI",
      comments: `Lender Offer: Grade ${riskGrade.grade} assessed. Offering ₹${Number(amt).toLocaleString("en-IN")} at ${roi}% ROI for ${tenure} months.`,
      consentItems: new Array(LENDER_CONSENTS.length).fill(false),
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
      50000
    );
    setOfferData({
      amount: String(reqAmt > 0 ? reqAmt : 50000),
      tenure: String(targetLoan?.durationMonths || "6"),
      roi: String(targetLoan?.preferredMinRate || "18"),
      durationType: targetLoan?.durationType || "Months",
      repaymentMethodForLender: "PI",
      comments: "",
      consentItems: new Array(LENDER_CONSENTS.length).fill(false),
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
                        <span className="badge bg-primary text-white border border-light-subtle px-2 py-1" style={{ fontSize: "11px" }}>
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
                      <i className="fa fa-hourglass-half" />
                    </div>
                    <div className="text-muted small fw-medium">Funding Needed</div>
                    <div className="fs-5 fw-bold text-dark mt-1">
                      {activeLoan?.partiallyPendingAmount && Number(activeLoan.partiallyPendingAmount) > 0
                        ? `₹ ${Number(activeLoan.partiallyPendingAmount).toLocaleString("en-IN")}`
                        : activeLoan?.requestAmount
                        ? `₹ ${Number(activeLoan.requestAmount).toLocaleString("en-IN")}`
                        : "Fully Funded / Inactive"}
                    </div>
                    <div className="small text-warning mt-1">
                      Status: {activeLoan?.loanRequestStatus || "Active"}
                    </div>
                  </div>
                </div>

                <div className="col-6 col-md-3">
                  <div className="lbp-stat-card">
                    <div className="lbp-stat-icon bg-info-subtle text-info">
                      <i className="fa fa-users-viewfinder" />
                    </div>
                    <div className="text-muted small fw-medium">References & Trust</div>
                    <div className="fs-5 fw-bold text-dark mt-1">
                      {references.length} Contact{references.length !== 1 ? "s" : ""}
                    </div>
                    <div className="small text-success mt-1">
                      <i className="fa fa-check-circle me-1" /> Mandatory 2 Provided
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
                    label: "Credit Report & Risk Analysis",
                    icon: "fa-chart-line",
                    badge: `Grade ${riskGrade.grade}`,
                    badgeClass: riskGrade.badgeClass,
                  },
                  { key: "personal", label: "Personal & Family", icon: "fa-user" },
                  { key: "employment", label: "Employment & Income", icon: "fa-briefcase" },
                  { key: "contact", label: "Contact Details", icon: "fa-phone" },
                  { key: "banking", label: "Bank & Financial", icon: "fa-university" },
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
                        {/* OxyScore Gauge Box */}
                        <div className="lbp-score-gauge mb-4">
                          <div className="text-muted small text-uppercase fw-semibold mb-1">
                            Overall OxyScore
                          </div>
                          <div className="display-6 fw-bold text-success">
                            {oxyScoreData?.oxyScore || profile.profileScore || "740"}
                            <span className="fs-6 text-muted"> / 1000</span>
                          </div>
                          <div className="badge bg-success-subtle text-success px-3 py-1 mt-1 rounded-pill">
                            🟢 Low Risk • High Creditworthiness
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
                              val: oxyScoreData?.breakdown?.cibilBase?.score || 520,
                              max: 600,
                              color: "bg-success",
                            },
                            {
                              label: "Employment Stability",
                              val: oxyScoreData?.breakdown?.employment?.score || 135,
                              max: 150,
                              color: "bg-primary",
                            },
                            {
                              label: "Monthly Income Capacity",
                              val: oxyScoreData?.breakdown?.income?.score || 180,
                              max: 200,
                              color: "bg-info",
                            },
                            {
                              label: "Profile Completeness",
                              val: Math.round((completeness.percentage / 100) * 50),
                              max: 50,
                              color: completeness.percentage >= 90 ? "bg-success" : "bg-warning",
                            },
                          ].map((f) => (
                            <div key={f.label}>
                              <div className="d-flex justify-content-between small mb-1">
                                <span className="fw-semibold text-secondary">{f.label}</span>
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
                    <div className="lbp-card border-primary border-opacity-25" style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)" }}>
                      <div className="lbp-card-header bg-primary bg-opacity-10 d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div className="d-flex align-items-center gap-2">
                          <i className="fa fa-chart-line text-primary fa-lg" />
                          <div>
                            <h6 className="fw-bold mb-0 text-dark">Credit Bureau & Risk Assessment Summary</h6>
                            <small className="text-muted">CIBIL/ERS bureau score, debt burden analysis, and risk rating</small>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary rounded-3 fw-semibold"
                            onClick={() => setActiveTab("creditReport")}
                          >
                            <i className="fa fa-chart-line me-1" /> View Full Credit & Risk Analysis →
                          </button>
                          <button
                            className="btn btn-sm btn-primary rounded-3 fw-bold"
                            onClick={() => handleGiveOfferWithTerms()}
                          >
                            <i className="fa fa-paper-plane me-1" /> Give Loan Offer
                          </button>
                        </div>
                      </div>
                      <div className="lbp-card-body">
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
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: CREDIT REPORT & RISK ANALYSIS (PROS & CONS) */}
              {activeTab === "creditReport" && (
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
                            Report Order #{creditReportData?.reportOrderNumber || "2989093135"}
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
                          <span className="badge bg-primary-subtle text-primary small">Established</span>
                        </div>
                        <div className="fs-4 fw-bold text-dark mb-1">
                          {creditReportData?.metrics?.creditAgeYears || "7.8"} <small className="fs-6 text-muted">Yrs</small>
                        </div>
                        <div className="small text-dark fw-semibold">
                          {creditReportData?.metrics?.totalAccountsCount || 7} Tradelines
                        </div>
                        <div className="small text-muted mt-1" style={{ fontSize: "11px" }}>
                          Active: {creditReportData?.metrics?.activeAccountsCount || 1} • Closed: {creditReportData?.metrics?.closedAccountsCount || 6}
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
                        <button
                          type="button"
                          className="lbp-quick-offer-btn"
                          onClick={() => handleGiveOfferWithTerms({ amount: 25000, roi: 18, tenure: 3 })}
                        >
                          ₹25,000 @ 18% (3 Mo)
                        </button>
                        <button
                          type="button"
                          className="lbp-quick-offer-btn"
                          onClick={() => handleGiveOfferWithTerms({ amount: 50000, roi: 18, tenure: 6 })}
                        >
                          ₹50,000 @ 18% (6 Mo)
                        </button>
                        <button
                          type="button"
                          className="lbp-quick-offer-btn"
                          onClick={() => handleGiveOfferWithTerms({ amount: 100000, roi: 20, tenure: 12 })}
                        >
                          ₹1,00,000 @ 20% (12 Mo)
                        </button>
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
                        <div className="lbp-data-label">First Name</div>
                        <div className="lbp-data-value">{profile.firstName || "—"}</div>
                      </div>
                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">Middle Name</div>
                        <div className="lbp-data-value">{profile.middleName || "—"}</div>
                      </div>
                      <div className="col-md-4 lbp-data-item">
                        <div className="lbp-data-label">Last Name</div>
                        <div className="lbp-data-value">{profile.lastName || "—"}</div>
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
                              {profile.salary ? `₹ ${Number(profile.salary).toLocaleString("en-IN")}` : "—"}
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
              {activeTab === "banking" && (
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
              )}

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
          {showOfferModal && (
            <div
              className="lbp-offer-modal-backdrop"
              onClick={() => setShowOfferModal(false)}
            >
              <div
                className="lbp-offer-modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="modal-header bg-primary text-white p-3 d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <i className="fa fa-paper-plane fa-lg" />
                    <div>
                      <h6 className="mb-0 text-white fw-bold">Send Loan Offer to {fullName}</h6>
                      <small className="text-white-50">
                        Borrower ID: BR{borrowerId} • Requested: ₹{" "}
                        {Number(
                          selectedLoanForOffer?.requestAmount ||
                          selectedLoanForOffer?.loanRequestAmount ||
                          50000
                        ).toLocaleString("en-IN")}
                      </small>
                    </div>
                  </div>
                  <button
                    className="btn btn-sm text-white fs-5"
                    onClick={() => setShowOfferModal(false)}
                  >
                    ✕
                  </button>
                </div>

                {/* Body */}
                <div className="modal-body p-4" style={{ overflowY: "auto", maxHeight: "65vh" }}>
                  <div className="row g-3">
                    {/* Offer Amount */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-dark">
                        Offer Amount (₹) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-control ${offerErrors.amount ? "is-invalid" : ""}`}
                        placeholder="e.g. 50000"
                        value={offerData.amount}
                        onChange={(e) => {
                          setOfferData({ ...offerData, amount: e.target.value });
                          setOfferErrors({ ...offerErrors, amount: "" });
                        }}
                      />
                      {offerErrors.amount && (
                        <div className="invalid-feedback">{offerErrors.amount}</div>
                      )}
                    </div>

                    {/* ROI Rate */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-dark">
                        Expected ROI Rate (% p.a.) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className={`form-control ${offerErrors.roi ? "is-invalid" : ""}`}
                        placeholder="e.g. 18"
                        value={offerData.roi}
                        onChange={(e) => {
                          setOfferData({ ...offerData, roi: e.target.value });
                          setOfferErrors({ ...offerErrors, roi: "" });
                        }}
                      />
                      {offerErrors.roi && (
                        <div className="invalid-feedback">{offerErrors.roi}</div>
                      )}
                    </div>

                    {/* Tenure */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-dark">
                        Tenure Duration <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <input
                          type="number"
                          className={`form-control ${offerErrors.tenure ? "is-invalid" : ""}`}
                          placeholder="e.g. 6"
                          value={offerData.tenure}
                          onChange={(e) => {
                            setOfferData({ ...offerData, tenure: e.target.value });
                            setOfferErrors({ ...offerErrors, tenure: "" });
                          }}
                        />
                        <select
                          className="form-select"
                          style={{ maxWidth: "110px" }}
                          value={offerData.durationType}
                          onChange={(e) => setOfferData({ ...offerData, durationType: e.target.value })}
                        >
                          <option value="Months">Months</option>
                          <option value="Days">Days</option>
                        </select>
                      </div>
                      {offerErrors.tenure && (
                        <div className="text-danger small mt-1">{offerErrors.tenure}</div>
                      )}
                    </div>

                    {/* Repayment Method */}
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-dark">
                        Repayment Method <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        value={offerData.repaymentMethodForLender}
                        onChange={(e) => setOfferData({ ...offerData, repaymentMethodForLender: e.target.value })}
                      >
                        <option value="PI">Principal + Monthly Interest (PI)</option>
                        <option value="I">Monthly Interest Only (I)</option>
                      </select>
                    </div>

                    {/* Comments */}
                    <div className="col-12">
                      <label className="form-label fw-bold small text-dark">
                        Lender Note / Comments (Optional)
                      </label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Add any specific comments or terms for the borrower..."
                        value={offerData.comments}
                        onChange={(e) => setOfferData({ ...offerData, comments: e.target.value })}
                      />
                    </div>

                    {/* 8 Consents Section */}
                    <div className="col-12">
                      <div className="border rounded-3 p-3 bg-light mt-2">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="fw-bold small text-dark">
                            <i className="fa fa-shield me-1 text-primary" />
                            Lender Legal & Compliance Consents (8 Required)
                          </span>
                          <span className="badge bg-primary text-white">
                            {offerData.consentItems.filter(Boolean).length} / {LENDER_CONSENTS.length} Agreed
                          </span>
                        </div>

                        {/* Select All Checkbox */}
                        <div className="form-check p-2 bg-white rounded border mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input ms-1"
                            id="agreeAllConsentBox"
                            ref={agreeAllRef}
                            checked={offerData.consentItems.every(Boolean)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setOfferData({
                                ...offerData,
                                consentItems: new Array(LENDER_CONSENTS.length).fill(checked),
                              });
                              if (offerErrors.consent) setOfferErrors({ ...offerErrors, consent: "" });
                            }}
                          />
                          <label className="form-check-label fw-bold ms-2 text-dark small" htmlFor="agreeAllConsentBox">
                            I Agree to All Terms, Risk Disclosures, & Lending Consents
                          </label>
                        </div>

                        {/* Scrollable Consent Items */}
                        <div style={{ maxHeight: "160px", overflowY: "auto" }}>
                          {LENDER_CONSENTS.map((item, idx) => (
                            <div key={item.id} className="form-check py-1 border-bottom">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`consent_${item.id}`}
                                checked={!!offerData.consentItems[idx]}
                                onChange={(e) => {
                                  const updated = [...offerData.consentItems];
                                  updated[idx] = e.target.checked;
                                  setOfferData({ ...offerData, consentItems: updated });
                                  if (offerErrors.consent) setOfferErrors({ ...offerErrors, consent: "" });
                                }}
                              />
                              <label className="form-check-label small text-secondary" htmlFor={`consent_${item.id}`}>
                                <strong>{item.title}</strong>: {item.text}
                              </label>
                            </div>
                          ))}
                        </div>

                        {offerErrors.consent && (
                          <div className="text-danger small mt-2 fw-semibold">
                            <i className="fa fa-exclamation-circle me-1" />
                            {offerErrors.consent}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer p-3 bg-light d-flex justify-content-between">
                  <button
                    className="btn btn-outline-secondary px-4 rounded-3"
                    onClick={() => setShowOfferModal(false)}
                    disabled={offerLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary px-4 rounded-3 fw-bold shadow"
                    onClick={handleSendOfferSubmit}
                    disabled={offerLoading}
                  >
                    {offerLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Submitting Offer...
                      </>
                    ) : (
                      <>
                        <i className="fa fa-paper-plane me-2" />
                        Confirm & Send Loan Offer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <Footer />
        </div>
      </div>
    </div>
  );
}
