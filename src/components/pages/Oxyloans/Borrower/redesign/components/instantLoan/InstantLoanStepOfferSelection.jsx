import React, { useState, useMemo, useEffect, useRef } from "react";
import "./instantLoan.css";
import {
  runComprehensiveUnderwriting,
  calculatePricing,
  calculateLenderRoiBand,
  calculateOxyScore,
  formatINR,
  formatPercent,
} from "./instantLoanCalculations";
import { getActiveRules } from "./instantLoanRules";
import StressTestMatrix from "./StressTestMatrix";
import CompanySafetyCard from "./CompanySafetyCard";
import { submitInstantLoanApplication } from "./instantLoanApi";
import Swal from "sweetalert2";
import {
  submitBorrowerLoanRequest,
  submitloanRequest,
  borrowerLoanAcceptOrReject,
  getListOfBorrowerLoansInitiated,
  getBorrowerRequestAmount,
} from "../../../../../../HttpRequest/afterlogin";

const InstantLoanStepOfferSelection = ({
  profileData = {},
  creditScore = null,
  oxyScore,
  onOfferSelected,
  onProceedToOffers,
  onProceedToEsign,
  onBack,
}) => {
  const resolvedOxyScore = useMemo(() => {
    return oxyScore || calculateOxyScore(profileData, creditScore);
  }, [oxyScore, profileData, creditScore]);
  const salary = Number(profileData.monthlySalary || profileData.salary || 25000);
  const activeRules = useMemo(() => getActiveRules(), []);
  const maxCap = Math.min(activeRules.maxLoanAmount || 250000, Math.round(salary * 0.9));
  const minCap = 5000;

  // Borrower Credit Cycle / Repayment History Track
  // Cycle 1: First-time borrower -> Only 30-Day Bullet and 3 Months allowed
  // Cycle 2: 1 loan repaid on time -> Unlocks 6 Months
  // Cycle 3+: 2+ loans repaid on time -> Unlocks 9 & 12 Months
  const [repaymentCycle, setRepaymentCycle] = useState(1); // 1 | 2 | 3

  // Allowed tenures based on repayment cycle
  const allowedTenuresForCycle = useMemo(() => {
    if (repaymentCycle === 1) return [1, 3];
    if (repaymentCycle === 2) return [1, 3, 6];
    return [1, 3, 6, 9, 12];
  }, [repaymentCycle]);

  // Dynamic Permissible Lender ROI Band based on Credit Score
  const roiBand = useMemo(() => {
    return calculateLenderRoiBand(creditScore);
  }, [creditScore]);

  // P2P Lender / Admin Confirmed Matching Mode
  // "INDICATIVE": Algorithmic Bureau Benchmark rate
  // "MATCHED": Confirmed or Counter-Offer rate offered by matched institutional lender or admin committee
  const [lenderMatchStatus, setLenderMatchStatus] = useState("INDICATIVE"); // "INDICATIVE" | "MATCHED"
  const [confirmedLenderRoi, setConfirmedLenderRoi] = useState(roiBand.indicativeRoi);

  // Borrower-adjustable cashflow commitments
  const [customCashflow, setCustomCashflow] = useState({
    existingEmi: profileData.existingEmi !== undefined ? Number(profileData.existingEmi) : Math.round(salary * 0.18),
    creditCardMinDues: profileData.creditCardMinDues !== undefined ? Number(profileData.creditCardMinDues) : 2000,
    rent: profileData.rent !== undefined ? Number(profileData.rent) : Math.round(salary * 0.22),
    householdExpenses: profileData.householdExpenses !== undefined ? Number(profileData.householdExpenses) : Math.round(salary * 0.16),
    educationExpenses: profileData.educationExpenses !== undefined ? Number(profileData.educationExpenses) : 2500,
    insurance: profileData.insurance !== undefined ? Number(profileData.insurance) : 1500,
    otherMandatory: profileData.otherMandatory !== undefined ? Number(profileData.otherMandatory) : 1000,
  });

  // Dynamic loan amount slider & tenure selection
  // First-time borrower defaults to 3 Months (the safe starter tenure)
  const [requestedAmount, setRequestedAmount] = useState(
    Math.min(maxCap, Math.max(minCap, 31500))
  );
  const [tempAmountInput, setTempAmountInput] = useState(
    Math.min(maxCap, Math.max(minCap, 31500))
  );

  const handleStepAmount = (step) => {
    setRequestedAmount((prev) => {
      const next = Math.min(maxCap, Math.max(minCap, prev + step));
      setTempAmountInput(next);
      return next;
    });
  };
  const [selectedOfferType, setSelectedOfferType] = useState("EMI"); // "EMI" | "BULLET"
  const [selectedTenure, setSelectedTenure] = useState(repaymentCycle === 1 ? 3 : 6); // Cycle 1: 30D & 3M only
  const [onlyRbiRegulated, setOnlyRbiRegulated] = useState(true);
  const [showExpenseDrawer, setShowExpenseDrawer] = useState(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState(false);
  const [showKfsModal, setShowKfsModal] = useState(false);
  const [showAmortizationModal, setShowAmortizationModal] = useState(false);
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState("SURPLUS"); // "CALCULATION" | "SCHEDULE" | "KFS"
  const [tenureLockedNotice, setTenureLockedNotice] = useState("");

  const isBreakdownModalOpen = Boolean(showCalculationModal || showAmortizationModal || showKfsModal);
  const handleCloseBreakdownModal = () => {
    setShowCalculationModal(false);
    setShowAmortizationModal(false);
    setShowKfsModal(false);
  };

  // Live Loan Request & Offers State
  const [activeLoanRequest, setActiveLoanRequest] = useState(null);
  const hasAutoRedirectedRef = useRef(false);
  const [hasSubmittedLoanRequest, setHasSubmittedLoanRequest] = useState(false);
  const [isSubmittingLoanRequest, setIsSubmittingLoanRequest] = useState(false);
  const [acceptedOffer, setAcceptedOffer] = useState(null);
  const [loanInitiatedInfo, setLoanInitiatedInfo] = useState({
    apiData: [],
    hasData: false,
    loading: false,
    errorMessage: "",
  });

  // Build live underwriting inputs
  const underwritingInputs = useMemo(() => ({
    fullName: profileData.name || "Borrower",
    panNumber: profileData.panNumber || "CDBPB2737H",
    mobile: profileData.mobile || "9492902990",
    employmentType: profileData.employmentType || "SALARIED",
    companyName: profileData.companyName || "SRS Fintech Labs Pvt Ltd",
    netSalary: salary,
    otherIncome: 0,
    salaryVerificationStatus: "VERIFIED",
    otherIncomeVerificationStatus: "DECLARED",
    bankingCashflowVerified: true,
    panVerified: true,
    creditScore: Number(creditScore || 802),
    requestedAmount,
    requestedTenure: selectedTenure,
    existingEmi: customCashflow.existingEmi,
    creditCardMinDues: customCashflow.creditCardMinDues,
    rent: customCashflow.rent,
    householdExpenses: customCashflow.householdExpenses,
    educationExpenses: customCashflow.educationExpenses,
    insurance: customCashflow.insurance,
    otherMandatory: customCashflow.otherMandatory,
    incomeStability: "HIGH",
    dpdHistory: "0",
    activeLoansCount: 2,
    recentEnquiriesCount: 1,
    creditUtilizationPct: 24,
    bouncedPaymentsCount: 0,
    employmentStabilityYears: 3.5,
    previousInternalRepayment: repaymentCycle > 1 ? "CLEAN" : "NONE",
    fraudIndicatorsCount: 0,
    disposableEmailOrPhone: false,
  }), [profileData, salary, creditScore, requestedAmount, selectedTenure, customCashflow, repaymentCycle]);

  // Run comprehensive underwriting synchronously on every input change
  const underwritingResult = useMemo(() => {
    return runComprehensiveUnderwriting(underwritingInputs, activeRules);
  }, [underwritingInputs, activeRules]);

  const {
    income,
    expenses,
    surplus,
    affordability,
    risk,
    optimalCandidate,
    stressTests,
    portfolioSafety,
    decisionEvaluation,
  } = underwritingResult;

  // Active pricing for current user selection with 3.0% Standard Processing Fee & Dynamic Lender Matched Rate
  const isBullet = selectedOfferType === "BULLET" || selectedTenure === 1;
  const currentPricing = useMemo(() => {
    const feeRate = 0.030; // Exactly 3.0% as per policy
    const p = requestedAmount;
    const targetRoi = (lenderMatchStatus === "MATCHED") ? confirmedLenderRoi : null;

    if (isBullet) {
      const annualRate = targetRoi || 18.0;
      const flatMonthlyRate = (annualRate / 100) / 12;
      const interest = Math.round(p * flatMonthlyRate);
      const processingFee = Math.max(500, Math.round(p * feeRate));
      const gst = Math.round(processingFee * 0.18);
      const netDisbursal = Math.max(0, p - processingFee - gst);
      const totalPayable = p + interest;
      return {
        principal: p,
        tenureMonths: 1,
        annualRoi: annualRate,
        computedAnnualRoi: 18.0,
        isCustomLenderRoi: Boolean(targetRoi && targetRoi !== 18.0),
        monthlyRate: flatMonthlyRate,
        emi: totalPayable,
        totalInterest: interest,
        totalPayable,
        processingFee,
        gst,
        netDisbursal,
        illustrativeApr: Number((annualRate + 3.54).toFixed(2)),
      };
    }

    const calculated = calculatePricing(p, selectedTenure, risk?.riskTier || "A", risk?.pd || 0.02, {
      ...activeRules,
      processingFeeRate: 0.030,
    }, targetRoi);

    // Ensure 3% fee rate is strictly applied
    const processingFee = Math.max(500, Math.round(p * feeRate));
    const gst = Math.round(processingFee * 0.18);
    const netDisbursal = Math.max(0, p - processingFee - gst);

    return {
      ...calculated,
      processingFee,
      gst,
      netDisbursal,
    };
  }, [isBullet, requestedAmount, selectedTenure, risk, activeRules, lenderMatchStatus, confirmedLenderRoi]);

  // Pricing calculations for the 2 direct repayment options shown in Underwriting
  const option3M = useMemo(() => {
    const calc = calculatePricing(requestedAmount, 3, risk?.riskTier || "A", risk?.pd || 0.02, {
      ...activeRules,
      processingFeeRate: 0.030,
    }, confirmedLenderRoi || 16.5);
    const processingFee = Math.max(500, Math.round(requestedAmount * 0.030));
    const gst = Math.round(processingFee * 0.18);
    const netDisbursal = Math.max(0, requestedAmount - processingFee - gst);
    return {
      ...calc,
      processingFee,
      gst,
      netDisbursal,
    };
  }, [requestedAmount, risk, activeRules, confirmedLenderRoi]);

  const optionPayday = useMemo(() => {
    const p = requestedAmount;
    const annualRate = 15.6;
    const flatMonthlyRate = (annualRate / 100) / 12;
    const interest = Math.round(p * flatMonthlyRate);
    const processingFee = Math.max(500, Math.round(p * 0.030));
    const gst = Math.round(processingFee * 0.18);
    const netDisbursal = Math.max(0, p - processingFee - gst);
    return {
      principal: p,
      tenureMonths: 1,
      annualRoi: annualRate,
      emi: p + interest,
      totalInterest: interest,
      totalPayable: p + interest,
      processingFee,
      gst,
      netDisbursal,
    };
  }, [requestedAmount]);

  const option6M = useMemo(() => {
    const calc = calculatePricing(requestedAmount, 6, risk?.riskTier || "A", risk?.pd || 0.02, {
      ...activeRules,
      processingFeeRate: 0.030,
    }, confirmedLenderRoi || 16.5);
    const processingFee = Math.max(500, Math.round(requestedAmount * 0.030));
    const gst = Math.round(processingFee * 0.18);
    const netDisbursal = Math.max(0, requestedAmount - processingFee - gst);
    return {
      ...calc,
      processingFee,
      gst,
      netDisbursal,
    };
  }, [requestedAmount, risk, activeRules, confirmedLenderRoi]);

  const option12M = useMemo(() => {
    const calc = calculatePricing(requestedAmount, 12, risk?.riskTier || "A", risk?.pd || 0.02, {
      ...activeRules,
      processingFeeRate: 0.030,
    }, confirmedLenderRoi || 18.0);
    const processingFee = Math.max(500, Math.round(requestedAmount * 0.030));
    const gst = Math.round(processingFee * 0.18);
    const netDisbursal = Math.max(0, requestedAmount - processingFee - gst);
    return {
      ...calc,
      processingFee,
      gst,
      netDisbursal,
    };
  }, [requestedAmount, risk, activeRules, confirmedLenderRoi]);

  // Dynamic Plan A & Plan B based on user credit cycle rule:
  // Cycle 1: 30 Days & 3 Months only
  // Cycle 2: 6 Months unlocked (post 1st repayment)
  // Cycle 3: 12 Months unlocked (post 6M completion)
  const planA = useMemo(() => {
    if (repaymentCycle === 1) {
      return {
        tenure: 3,
        type: "EMI",
        title: "3-Month Equal EMI",
        subtitle: "First-time borrower: 3 equal monthly installments",
        badge: "★ Recommended Starter",
        badgeBg: "#10b981",
        badgeColor: "#ffffff",
        installments: "For 3 installments",
        data: option3M,
      };
    }
    return {
      tenure: 6,
      type: "EMI",
      title: "6-Month Equal EMI (6M Lock-in)",
      subtitle: "Unlocked post 1st repayment: Balanced 6-month lock-in",
      badge: "★ 6M Lock-in (Recommended)",
      badgeBg: "#10b981",
      badgeColor: "#ffffff",
      installments: "For 6 installments (6M Lock-in)",
      data: option6M,
    };
  }, [repaymentCycle, option3M, option6M]);

  const planB = useMemo(() => {
    if (repaymentCycle === 1) {
      return {
        tenure: 1,
        type: "BULLET",
        title: "30-Day Payday Bullet",
        subtitle: "Single settlement on upcoming salary credit",
        badge: "Due at Day 30",
        badgeBg: "#eff6ff",
        badgeColor: "#1d4ed8",
        installments: "Due Day 30",
        data: optionPayday,
      };
    } else if (repaymentCycle === 2) {
      return {
        tenure: 3,
        type: "EMI",
        title: "3-Month Equal EMI",
        subtitle: "Fast turnaround alternative",
        badge: "3M Quick Return",
        badgeBg: "#eff6ff",
        badgeColor: "#1d4ed8",
        installments: "For 3 installments",
        data: option3M,
      };
    } else {
      return {
        tenure: 12,
        type: "EMI",
        title: "12-Month Equal EMI (12M Lock-in)",
        subtitle: "Completed 6M loan: Unlocked for maximum 1-year yield",
        badge: "🔒 12M Lock-in • Extended",
        badgeBg: "#0284c7",
        badgeColor: "#ffffff",
        installments: "{planB.installments}",
        data: option12M,
      };
    }
  }, [repaymentCycle, optionPayday, option3M, option12M]);

  // Check if live lenders have given offers for this borrower
  const hasLenderOffers = useMemo(() => {
    return Boolean(
      loanInitiatedInfo?.hasData &&
      Array.isArray(loanInitiatedInfo?.apiData) &&
      loanInitiatedInfo.apiData.length > 0
    );
  }, [loanInitiatedInfo]);

  // Fetch live loans initiated / lender offers from backend
  const fetchLoansInitiated = async () => {
    const borrowerId = profileData.userId || sessionStorage.getItem("userId") || localStorage.getItem("userId") || "";
    setLoanInitiatedInfo((prev) => ({ ...prev, loading: true, errorMessage: "" }));
    try {
      const res = await getListOfBorrowerLoansInitiated(borrowerId);
      if (res?.status === 200 && Array.isArray(res?.data) && res.data.length > 0) {
        setLoanInitiatedInfo({
          apiData: res.data,
          hasData: true,
          loading: false,
          errorMessage: "",
        });
      } else {
        setLoanInitiatedInfo({
          apiData: [],
          hasData: false,
          loading: false,
          errorMessage: "",
        });
      }
    } catch (e) {
      console.warn("fetchLoansInitiated notice:", e);
      setLoanInitiatedInfo({
        apiData: [],
        hasData: false,
        loading: false,
        errorMessage: "",
      });
    }
  };

  useEffect(() => {
    fetchLoansInitiated();
    const bId = profileData.userId || sessionStorage.getItem("userId") || localStorage.getItem("userId") || "";
    getBorrowerRequestAmount(bId)
      .then((res) => {
        if (res?.status === 200 && Array.isArray(res.data) && res.data.length > 0) {
          const latest = [...res.data].sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))[0];
          const st = String(latest?.loanRequestStatus || "").toUpperCase();
          if (st && st !== "CLOSED") {
            setActiveLoanRequest(latest);
            setHasSubmittedLoanRequest(true);

          }
        }
      })
      .catch((err) => {
        console.warn("getBorrowerRequestAmount error:", err);
      });
  }, [profileData.userId, onProceedToOffers]);

  // Raise loan request in P2P market (Borrower requests the loan)
  const handleRaiseLoanRequest = async () => {
    const borrowerId = profileData.userId || sessionStorage.getItem("userId") || localStorage.getItem("userId") || "";
    const amountToRequest = requestedAmount || 31500;

    const confirmResult = await Swal.fire({
      title: "Raise Loan Request in P2P Market",
      html: `
        <div class="text-start small">
          <p class="mb-2">Submit your loan request into the OxyLoans P2P network:</p>
          <div class="p-3 bg-light rounded-3 border mb-2">
            <div class="d-flex justify-content-between mb-1">
              <span>Requested Amount:</span>
              <strong class="text-primary fs-6">${formatINR(amountToRequest)}</strong>
            </div>
            <div class="d-flex justify-content-between mb-1">
              <span>Repayment Plan:</span>
              <span class="text-dark fw-bold">${selectedOfferType === "BULLET" ? "30-Day Payday Bullet" : `${selectedTenure} Months EMI`}</span>
            </div>
            <div class="d-flex justify-content-between">
              <span>Indicative Benchmark ROI:</span>
              <span class="text-success fw-bold">${confirmedLenderRoi || 16.5}% p.a.</span>
            </div>
          </div>
          <p class="text-muted mb-0" style="font-size: 11px;">
            Nearby certified peer lenders will review your request and submit competing loan offers.
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Raise Request",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#0040e0",
      cancelButtonColor: "#6c757d",
    });

    if (!confirmResult.isConfirmed) return;

    setIsSubmittingLoanRequest(true);
    const payload = {
      borrowerId: Number(borrowerId),
      requestAmount: Number(amountToRequest),
    };

    try {
      let response = await submitBorrowerLoanRequest(payload);
      let isSuccess = response?.status === 200 || response?.status === 201;

      // If PATCH /borrowerLoanRequest fails or returns 403, fallback to standard ${userId}/loan/BORROWER/newrequest
      if (!isSuccess) {
        try {
          const stdPayload = {
            duration: isBullet ? 1 : selectedTenure,
            durationType: "MONTHS",
            expectedDate: new Date().toISOString().split("T")[0],
            loanpurpose: "Personal / Instant Needs",
            loanamount: Number(amountToRequest),
            roi: Number(confirmedLenderRoi || 16.5),
            repayment: isBullet ? "PI" : "EMI",
          };
          const stdRes = await submitloanRequest(stdPayload);
          if (stdRes?.status === 200 || stdRes?.status === 201) {
            response = stdRes;
            isSuccess = true;
          }
        } catch (fallbackErr) {
          console.warn("submitloanRequest fallback error:", fallbackErr);
        }
      }

      if (isSuccess) {
        const newReq = {
          id: response?.data?.id || Date.now(),
          loanRequestId: response?.data?.loanRequestId || `LR${borrowerId}${Date.now().toString().slice(-4)}`,
          borrowerId,
          requestAmount: amountToRequest,
          loanRequestStatus: "REQUEST",
          createdAt: new Date().toISOString(),
        };
        setActiveLoanRequest(newReq);
        setHasSubmittedLoanRequest(true);

        const chosenPlan = {
          title: isBullet ? "30-Day Payday Bullet" : `${selectedTenure}-Month EMI Plan`,
          selectedOfferType: isBullet ? "BULLET" : "EMI",
          principal: amountToRequest,
          tenureMonths: isBullet ? 1 : selectedTenure,
          interestRate: confirmedLenderRoi || 16.5,
          monthlyEmi: currentPricing.emi,
          totalPayable: currentPricing.totalPayable,
          processingFee: currentPricing.processingFee,
          netDisbursal: currentPricing.netDisbursal,
        };

        await Swal.fire({
          icon: "success",
          title: "Loan Request Raised!",
          text: `Your loan request for ${formatINR(amountToRequest)} is now active in the OxyLoans marketplace. Lenders will review and submit offers.`,
          confirmButtonColor: "#0040e0",
          confirmButtonText: "View Matched Offers",
        });

        if (onProceedToOffers) {
          onProceedToOffers(chosenPlan);
        } else if (onProceedToEsign) {
          onProceedToEsign(chosenPlan);
        } else if (onOfferSelected) {
          onOfferSelected(chosenPlan);
        }
      } else {
        const errMsg =
          response?.response?.data?.errorMessage ||
          response?.response?.data?.message ||
          response?.data?.errorMessage ||
          response?.data?.message ||
          response?.message ||
          "Could not submit your loan request at this time. Please try again.";
        Swal.fire({
          icon: "error",
          title: "Unable to Submit Loan Request",
          text: errMsg,
          confirmButtonColor: "#0040e0",
        });
      }
    } catch (err) {
      console.error("handleRaiseLoanRequest error:", err);
      const errMsg =
        err?.response?.data?.errorMessage ||
        err?.response?.data?.message ||
        err?.data?.errorMessage ||
        err?.data?.message ||
        err?.message ||
        "Could not submit your loan request at this time. Please try again.";
      Swal.fire({
        icon: "error",
        title: "Loan Request Failed",
        text: errMsg,
        confirmButtonColor: "#0040e0",
      });
    } finally {
      setIsSubmittingLoanRequest(false);
    }
  };

  // Cashflow waterfall percentages
  const verifiedInflow = income.totalVerifiedIncome || salary;
  const obligationsPct = Math.min(100, Math.round((expenses.totalExistingObligations / verifiedInflow) * 100));
  const livingPct = Math.min(100, Math.round((expenses.essentialLivingExpenses / verifiedInflow) * 100));
  const mandatoryPct = Math.min(100, Math.round((expenses.mandatoryExpenses / verifiedInflow) * 100));
  const surplusPct = Math.max(0, 100 - (obligationsPct + livingPct + mandatoryPct));

  // Affordability metrics for current loan selection
  const currentEmi = currentPricing.emi;
  const surplusAllocationPct = surplus.monthlySurplus > 0
    ? Math.round((currentEmi / surplus.monthlySurplus) * 100)
    : 100;
  const residualBuffer = Math.max(0, surplus.monthlySurplus - currentEmi);
  const projectedFoirPct = verifiedInflow > 0
    ? Number((((expenses.totalExistingObligations + (isBullet ? 0 : currentEmi)) / verifiedInflow) * 100).toFixed(1))
    : 0;

  // Bullet-specific payday headroom & post-settlement salary buffer
  const paydayHeadroom = Math.max(0, verifiedInflow - expenses.totalExistingObligations);
  const postSettlementPaydaySalary = Math.max(0, paydayHeadroom - currentPricing.totalPayable);
  const paydayBurdenPct = verifiedInflow > 0
    ? Math.round((currentPricing.totalPayable / verifiedInflow) * 100)
    : 0;
  const isCommitmentSafe = isBullet
    ? (currentPricing.totalPayable <= paydayHeadroom && paydayBurdenPct <= 65)
    : (currentEmi <= affordability.maxSafeNewEmi);

  // Effective active ROI (Lender Matched or Indicative Bureau Benchmark)
  const effectiveRoi = currentPricing.annualRoi;

  // Rate variance between indicative bureau rate and confirmed matched rate
  const roiVariance = Number((effectiveRoi - roiBand.indicativeRoi).toFixed(2));

  // Handle cashflow adjustment input change
  const handleCashflowChange = (field, val) => {
    const num = Math.max(0, Number(val || 0));
    setCustomCashflow((prev) => ({ ...prev, [field]: num }));
  };

  // Deduplicated preset chips for the slider
  const presetChips = useMemo(() => {
    const candidates = [25000, 35000, 45000, maxCap];
    return Array.from(new Set(candidates)).sort((a, b) => a - b);
  }, [maxCap]);

  // Handle tenure click with progressive lock check
  const handleTenureClick = (tenure, type) => {
    const isAllowed = allowedTenuresForCycle.includes(tenure);
    if (!isAllowed) {
      const reason = tenure === 6
        ? "🔒 6-Month tenure unlocks automatically after you complete your current loan on time. Keep a clean record to qualify!"
        : "🔒 9 & 12-Month extended tenures unlock after 2 successful on-time repayments. Re-checked every cycle.";
      setTenureLockedNotice(reason);
      setTimeout(() => setTenureLockedNotice(""), 6000);
      return;
    }
    setTenureLockedNotice("");
    setSelectedTenure(tenure);
    setSelectedOfferType(type);
    if (type === "BULLET" && requestedAmount > 30000) {
      setRequestedAmount(30000);
    }
  };

  // 4 Standard Comparative Scenario Structures
  const scenarioOptions = useMemo(() => {
    const feeRate = 0.030; // 3%
    const targetRoi = (lenderMatchStatus === "MATCHED") ? confirmedLenderRoi : null;

    const plans = [
      {
        id: "SCENARIO_3M",
        type: "EMI",
        tenure: 3,
        title: "3-Month EMI Plan",
        tag: "Available Now",
        tagColor: "success",
        description: "Lowest total interest outlay. Pay off quickly in 3 equal monthly installments.",
        amount: Math.min(requestedAmount, maxCap),
        isLocked: !allowedTenuresForCycle.includes(3),
        unlockMilestone: "Starter Plan",
      },
      {
        id: "SCENARIO_BULLET",
        type: "BULLET",
        tenure: 1,
        title: "30-Day Payday Settlement",
        tag: "Available Now",
        tagColor: "warning",
        description: "Repay in full on your next salary credit. Zero recurring monthly EMI commitments.",
        amount: Math.min(30000, requestedAmount),
        isLocked: !allowedTenuresForCycle.includes(1),
        unlockMilestone: "Starter Plan",
      },
      {
        id: "SCENARIO_6M",
        type: "EMI",
        tenure: 6,
        title: "6-Month EMI Plan",
        tag: allowedTenuresForCycle.includes(6) ? "Unlocked ✓" : "🔒 Locked",
        tagColor: allowedTenuresForCycle.includes(6) ? "primary" : "secondary",
        description: "Optimal balance between comfortable monthly EMI and low overall borrowing cost.",
        amount: Math.min(requestedAmount, maxCap),
        isLocked: !allowedTenuresForCycle.includes(6),
        unlockMilestone: "Unlocks After 1st On-Time Repayment",
      },
      {
        id: "SCENARIO_12M",
        type: "EMI",
        tenure: 12,
        title: "12-Month Extended Plan",
        tag: allowedTenuresForCycle.includes(12) ? "Unlocked ✓" : "🔒 Locked",
        tagColor: allowedTenuresForCycle.includes(12) ? "info" : "secondary",
        description: "Minimizes monthly commitment to protect your daily disposable surplus.",
        amount: Math.min(requestedAmount, maxCap),
        isLocked: !allowedTenuresForCycle.includes(12),
        unlockMilestone: "Unlocks After 2+ On-Time Repayments",
      },
    ];

    return plans.map((plan) => {
      let pr;
      if (plan.type === "BULLET") {
        const p = plan.amount;
        const annualRate = targetRoi || 18.0;
        const interest = Math.round(p * ((annualRate / 100) / 12));
        const processingFee = Math.max(500, Math.round(p * feeRate));
        const gst = Math.round(processingFee * 0.18);
        pr = {
          emi: p + interest,
          totalInterest: interest,
          totalPayable: p + interest,
          netDisbursal: p - processingFee - gst,
          annualRoi: annualRate,
          processingFee,
          gst,
        };
      } else {
        const calculated = calculatePricing(plan.amount, plan.tenure, risk?.riskTier || "A", risk?.pd || 0.02, {
          ...activeRules,
          processingFeeRate: feeRate,
        }, targetRoi);
        const processingFee = Math.max(500, Math.round(plan.amount * feeRate));
        const gst = Math.round(processingFee * 0.18);
        pr = {
          ...calculated,
          processingFee,
          gst,
          netDisbursal: Math.max(0, plan.amount - processingFee - gst),
        };
      }
      return {
        ...plan,
        pricing: pr,
      };
    });
  }, [requestedAmount, maxCap, risk, activeRules, allowedTenuresForCycle, lenderMatchStatus, confirmedLenderRoi]);

  // Generate illustrative 3-month amortization breakdown
  const amortizationSchedule = useMemo(() => {
    const p = requestedAmount;
    const n = isBullet ? 1 : selectedTenure;
    const monthlyRate = (currentPricing.annualRoi / 100) / 12;
    const emi = currentPricing.emi;

    let balance = p;
    const rows = [];
    const today = new Date();

    for (let i = 1; i <= n; i++) {
      const dueDate = new Date(today.getFullYear(), today.getMonth() + i, 5);
      const interestPayment = isBullet ? currentPricing.totalInterest : Math.round(balance * monthlyRate);
      const principalPayment = isBullet ? p : Math.max(0, emi - interestPayment);
      const closingBalance = isBullet ? 0 : Math.max(0, balance - principalPayment);

      rows.push({
        installmentNo: i,
        dueDateStr: dueDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
        emiAmount: isBullet ? currentPricing.totalPayable : emi,
        principalPart: principalPayment,
        interestPart: interestPayment,
        closingBalance,
      });

      balance = closingBalance;
    }
    return rows;
  }, [requestedAmount, selectedTenure, isBullet, currentPricing]);

  return (
    <div className="fintech-card step-view-enter">
      {/* 1. Header & Navigation */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3 pb-2">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1.5">
            <span
              className="badge rounded-pill px-3 py-1 small fw-bold"
              style={{
                backgroundColor: "#064e3b",
                color: "#34d399",
                fontSize: "11px",
              }}
            >
              Step 5 of 9 • Choose Loan Plan
            </span>
          </div>
          <h4 className="fw-bold text-dark mb-1" style={{ fontSize: "22px" }}>
            Underwriting & Repayment Plan Selection
          </h4>
          <p className="text-secondary small mb-0" style={{ fontSize: "12.5px" }}>
            Review how your loan amount is calculated based on verified salary and living expenses, choose your repayment plan, and raise your loan request to receive lender offers.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={onBack}
            className="btn btn-sm btn-outline-primary bg-white rounded-pill px-3.5 py-2 fw-semibold d-flex align-items-center gap-1.5 shadow-2xs"
            style={{ fontSize: "12.5px", borderColor: "#cbd5e1", color: "#0040e0" }}
          >
            <i className="fa-solid fa-arrow-left me-1.5"></i>
            <span>Back to Step 4</span>
          </button>
        </div>
      </div>

      {/* Active Loan Request Notification Banner */}
      {(hasSubmittedLoanRequest || activeLoanRequest) && (
        <div
          className="p-3.5 rounded-4 mb-4 text-white d-flex flex-wrap justify-content-between align-items-center gap-3 shadow-sm"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)", border: "1.5px solid rgba(59, 130, 246, 0.3)" }}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle bg-primary bg-opacity-25 p-2.5 text-info">
              <i className="fa-solid fa-bell-concierge fs-5"></i>
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-0.5">
                <span className="badge rounded-pill bg-success text-white px-2.5 py-0.5 fw-bold" style={{ fontSize: "10.5px" }}>
                  <i className="fa-solid fa-check me-1"></i> REQUEST ACTIVE IN P2P MARKET
                </span>
                <span className="text-light opacity-75 small">Loan Request #{activeLoanRequest?.id || "167"}</span>
              </div>
              <h6 className="fw-bold text-white mb-0">
                Loan Request of {formatINR(activeLoanRequest?.requestAmount || requestedAmount)} is Live (Status: {activeLoanRequest?.loanRequestStatus || "REQUEST"})
              </h6>
              <span className="text-light opacity-80 small" style={{ fontSize: "11.5px" }}>
                Your request is already submitted. Matching lender pool capital is available. Proceed to view and accept offers.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onProceedToOffers) onProceedToOffers(activeLoanRequest);
              else if (onProceedToEsign) onProceedToEsign(activeLoanRequest);
              else if (onOfferSelected) onOfferSelected(activeLoanRequest);
            }}
            className="btn btn-light px-4 py-2.5 rounded-pill fw-bold text-primary shadow-sm d-flex align-items-center gap-2"
            style={{ fontSize: "13px" }}
          >
            <span>Offers Received from Lenders</span>
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      )}

      {/* 2. Top 3 Summary Cards */}
      <div className="row g-3 mb-4">
        {/* Card 1: Underwriting Verified */}
        <div className="col-12 col-lg-4">
          <div
            className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden"
            style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}
          >
            <div className="card-body p-3.5 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center gap-3 mb-2.5">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle text-primary"
                    style={{ width: "36px", height: "36px", minWidth: "36px", backgroundColor: "#eff6ff" }}
                  >
                    <i className="fa-solid fa-calculator fs-6"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "14px" }}>
                      Underwriting Verified
                    </h6>
                    <span
                      className="badge rounded-pill px-2 py-0.5 mt-0.5 fw-semibold"
                      style={{ backgroundColor: "rgba(0, 64, 224, 0.08)", color: "#0040e0", fontSize: "10.5px" }}
                    >
                      Prime+ Tier (16.5% p.a)
                    </span>
                  </div>
                </div>

                <div className="row g-2" style={{ fontSize: "11.5px" }}>
                  <div className="col-6">
                    <span className="text-secondary d-flex align-items-center gap-2">
                      <i className="fa-solid fa-check text-success" style={{ fontSize: "11px" }}></i>
                      <span>Verified Inflow: <strong className="text-dark fw-bold">{formatINR(verifiedInflow)}</strong></span>
                    </span>
                  </div>
                  <div className="col-6">
                    <span className="text-secondary d-flex align-items-center gap-2">
                      <i className="fa-solid fa-check text-success" style={{ fontSize: "11px" }}></i>
                      <span>Safe EMI Limit: <strong className="text-dark fw-bold">{formatINR(affordability.maxSafeNewEmi)}/mo</strong></span>
                    </span>
                  </div>
                  <div className="col-6">
                    <span className="text-secondary d-flex align-items-center gap-2">
                      <i className="fa-solid fa-check text-success" style={{ fontSize: "11px" }}></i>
                      <span>Net Monthly Surplus: <strong className="text-dark fw-bold">{formatINR(surplus.monthlySurplus)}</strong></span>
                    </span>
                  </div>
                  <div className="col-6">
                    <span className="text-secondary d-flex align-items-center gap-2">
                      <i className="fa-solid fa-check text-success" style={{ fontSize: "11px" }}></i>
                      <span>Optimal Limit: <strong className="text-dark fw-bold">{formatINR(maxCap)}</strong></span>
                    </span>
                  </div>
                  <div className="col-12 mt-1">
                    <span className="text-secondary d-flex align-items-center gap-2">
                      <i className="fa-solid fa-check text-success" style={{ fontSize: "11px" }}></i>
                      <span>0% Prepayment Penalty</span>
                    </span>
                  </div>
                  <div className="col-12 mt-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success bg-white rounded-pill px-2.5 py-1 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-2xs"
                      style={{ fontSize: "11px", borderColor: "#a7f3d0", color: "#065f46" }}
                      onClick={() => {
                        setModalActiveTab("SURPLUS");
                        setShowCalculationModal(true);
                      }}
                    >
                      <i className="fa-solid fa-wallet text-success" style={{ fontSize: "11px" }}></i>
                      <span>View Surplus Calculation</span>
                      <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "10px" }}></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: OxyScore & Credit Health */}
        <div className="col-12 col-lg-4">
          <div
            className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden"
            style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}
          >
            <div className="card-body p-3.5 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center gap-3 mb-1.5">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: "36px",
                      height: "36px",
                      minWidth: "36px",
                      backgroundColor: resolvedOxyScore.badgeBg || "#ecfdf5",
                      color: resolvedOxyScore.color || "#15803d",
                    }}
                  >
                    <i className="fa-solid fa-gauge-high fs-6"></i>
                  </div>
                  <div className="d-flex align-items-center justify-content-between flex-grow-1">
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "14px" }}>
                      OxyScore & Credit Health
                    </h6>
                    <span className="badge rounded-pill bg-light text-secondary border px-2 py-0.5" style={{ fontSize: "10px" }}>
                      CIR: {creditScore}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between mb-1.5">
                  <h3 className="fw-extrabold text-dark mb-0" style={{ fontSize: "26px", letterSpacing: "-0.5px" }}>
                    {resolvedOxyScore.score}
                    <span className="text-muted fw-normal" style={{ fontSize: "14px" }}> / 1000</span>
                  </h3>
                  <span
                    className="badge rounded-pill px-2.5 py-1 fw-bold"
                    style={{
                      backgroundColor: resolvedOxyScore.badgeBg || "#dcfce7",
                      color: resolvedOxyScore.color || "#15803d",
                      border: `1px solid ${resolvedOxyScore.badgeBorder || "#a7f3d0"}`,
                      fontSize: "11px",
                    }}
                  >
                    {resolvedOxyScore.label} • {resolvedOxyScore.rating}
                  </span>
                </div>

                <div className="progress rounded-pill mb-2.5" style={{ height: "6px", backgroundColor: "#f1f5f9" }}>
                  <div
                    className="progress-bar rounded-pill"
                    role="progressbar"
                    style={{
                      width: `${Math.round((resolvedOxyScore.score / 1000) * 100)}%`,
                      backgroundColor: resolvedOxyScore.color || "#10b981",
                    }}
                  />
                </div>

                <div className="row g-1.5" style={{ fontSize: "11px" }}>
                  {(resolvedOxyScore.factors || [
                    { label: "Profile & KYC Completeness", status: "100% Verified", positive: true },
                    { label: "Monthly Salary & Cashflow", status: "Verified Cashflow", positive: true },
                    { label: "Employment Standing", status: "Stable Employment", positive: true },
                    { label: "CIR Bureau Track Record", status: "0 Defaults / 0 DPD", positive: true },
                  ]).map((factor, idx) => (
                    <div className="col-6" key={idx}>
                      <span className="text-secondary d-flex align-items-center gap-1.5" title={factor.status}>
                        <i
                          className={`fa-solid ${factor.positive ? "fa-circle-check text-success" : "fa-circle-exclamation text-warning"}`}
                          style={{ fontSize: "11px" }}
                        ></i>
                        <span className="text-truncate">{factor.label}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Loan Summary */}
        <div className="col-12 col-lg-4">
          <div
            className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden"
            style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}
          >
            <div className="card-body p-3.5 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle text-primary"
                      style={{ width: "36px", height: "36px", minWidth: "36px", backgroundColor: "#eff6ff" }}
                    >
                      <i className="fa-solid fa-receipt fs-6"></i>
                    </div>
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "14px" }}>
                      Loan Summary
                    </h6>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary bg-white rounded-pill px-2.5 py-1 fw-semibold d-flex align-items-center gap-1 shadow-2xs"
                    style={{ fontSize: "11px", borderColor: "#bfdbfe" }}
                    onClick={() => {
                      setModalActiveTab("SURPLUS");
                      setShowCalculationModal(true);
                    }}
                  >
                    <span>View Calculation Breakdown</span>
                    <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "10px" }}></i>
                  </button>
                </div>

                <div className="d-flex flex-column gap-1.5" style={{ fontSize: "11.5px" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">
                      <i className="fa-solid fa-user me-2 text-muted" style={{ fontSize: "10.5px" }}></i>
                      Requested Loan
                    </span>
                    <strong className="text-dark fw-bold">{formatINR(requestedAmount)}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">
                      <i className="fa-solid fa-landmark me-2 text-muted" style={{ fontSize: "10.5px" }}></i>
                      Recommended Limit
                    </span>
                    <strong className="text-dark fw-bold">{formatINR(maxCap)}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">
                      <i className="fa-solid fa-shield-halved me-2 text-muted" style={{ fontSize: "10.5px" }}></i>
                      Processing Fee
                    </span>
                    <strong className="text-dark">3.0% + 18% GST</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">
                      <i className="fa-solid fa-clock me-2 text-muted" style={{ fontSize: "10.5px" }}></i>
                      Tenure Options
                    </span>
                    <strong className="text-dark">3 to 12 Months</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Numbered Circle 1: Select Your Preferred Repayment Plan */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold shadow-xs"
                style={{ width: "32px", height: "32px", minWidth: "32px", backgroundColor: "#0040e0", fontSize: "14px" }}
              >
                1
              </div>
              <div>
                <h6 className="fw-bold text-dark mb-0 fs-6">
                  Select Your Preferred Repayment Plan
                </h6>
                <span className="text-secondary small d-block" style={{ fontSize: "12px" }}>
                  Choose how you want to repay your loan of <strong className="text-dark">{formatINR(requestedAmount)}</strong>
                </span>
              </div>
            </div>

            <span className="badge rounded-pill px-3 py-1.5 fw-semibold text-secondary bg-white border shadow-2xs" style={{ fontSize: "11px", borderColor: "#e2e8f0" }}>
              <i className="fa-regular fa-calendar-check text-primary me-2"></i> Available Tenures: 30 Days, 3 Months, 6 Months
            </span>
          </div>

          {/* Interactive Desired Loan Amount & Live EMI Calibrator Bar (Seamless, unboxed) */}
          <div id="loan-amount-calibrator" className="pt-2 pb-1">
            <div className="row align-items-center g-3 g-lg-4">
              {/* Stepper on left */}
              <div className="col-12 col-md-4 col-lg-3">
                <span className="text-secondary small d-block mb-1.5" style={{ fontSize: "12px", fontWeight: "600" }}>Loan Amount</span>
                <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2.5">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => handleStepAmount(-1000)}
                    disabled={requestedAmount <= minCap}
                    title="Decrease amount by ₹1,000"
                    style={{
                      width: "34px",
                      height: "34px",
                      minWidth: "34px",
                      borderRadius: "50%",
                      border: "1.5px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#334155",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: requestedAmount <= minCap ? "not-allowed" : "pointer",
                      opacity: requestedAmount <= minCap ? 0.35 : 1,
                      transition: "all 0.18s ease",
                    }}
                  >
                    <i className="fa-solid fa-minus" style={{ fontSize: "11px" }}></i>
                  </button>

                  <span
                    style={{
                      fontSize: "28px",
                      fontWeight: "800",
                      color: "#0040e0",
                      letterSpacing: "-0.6px",
                      lineHeight: "1",
                      minWidth: "120px",
                      textAlign: "center",
                      display: "inline-block",
                      userSelect: "none",
                    }}
                  >
                    {formatINR(requestedAmount)}
                  </span>

                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => handleStepAmount(1000)}
                    disabled={requestedAmount >= maxCap}
                    title="Increase amount by ₹1,000"
                    style={{
                      width: "34px",
                      height: "34px",
                      minWidth: "34px",
                      borderRadius: "50%",
                      border: "1.5px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#334155",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: requestedAmount >= maxCap ? "not-allowed" : "pointer",
                      opacity: requestedAmount >= maxCap ? 0.35 : 1,
                      transition: "all 0.18s ease",
                    }}
                  >
                    <i className="fa-solid fa-plus" style={{ fontSize: "11px" }}></i>
                  </button>
                </div>
              </div>

              {/* Slider in center */}
              <div className="col-12 col-md-4 col-lg-5">
                <div className="px-1">
                  <input
                    type="range"
                    className="fintech-slider w-100"
                    min={minCap}
                    max={maxCap}
                    step={1000}
                    value={requestedAmount}
                    style={{
                      background: `linear-gradient(to right, #0040e0 0%, #0040e0 ${Math.max(0, Math.min(100, Math.round(((requestedAmount - minCap) / (maxCap - minCap || 1)) * 100)))}%, #e2e8f0 ${Math.max(0, Math.min(100, Math.round(((requestedAmount - minCap) / (maxCap - minCap || 1)) * 100)))}%, #e2e8f0 100%)`
                    }}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setRequestedAmount(val);
                      setTempAmountInput(val);
                    }}
                  />
                  <div className="d-flex justify-content-between text-secondary mt-2 fw-semibold" style={{ fontSize: "11.5px" }}>
                    <span>Min - {formatINR(minCap)}</span>
                    <span>Max - {formatINR(maxCap)}</span>
                  </div>
                </div>
              </div>

              {/* Badges and live notice on right */}
              <div className="col-12 col-md-4 col-lg-4 text-md-end">
                <div className="d-flex align-items-center justify-content-md-end gap-1.5 mb-1.5 flex-wrap">
                  <span className="badge rounded-pill px-3 py-1.5 fw-bold text-white shadow-xs" style={{ backgroundColor: "#0040e0", fontSize: "11.5px" }}>
                    Desired Loan Amount
                  </span>
                  <span className="badge rounded-pill px-3 py-1.5 fw-semibold text-secondary bg-white border shadow-2xs" style={{ fontSize: "11.5px", borderColor: "#e2e8f0" }}>
                    Live EMI Recalculation
                  </span>
                  <i className="fa-solid fa-circle-info text-muted ms-1" style={{ fontSize: "13px" }} title="EMI recalculates live as you change loan amount"></i>
                </div>
                <span className="text-secondary small d-block" style={{ fontSize: "12px" }}>
                  Adjust borrowing amount to instantly see your EMI and lender offers.
                </span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="instant-preset-chips-scroll d-flex align-items-center gap-2 pt-3 mt-3 border-top overflow-x-auto py-1" style={{ borderColor: "#f1f5f9", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
              {[5000, 8000, 10000, 12000, 15000, 20000, 25000, maxCap].map((amt) => {
                const isSelected = requestedAmount === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    className={`preset-chip-btn ${isSelected ? "active" : ""}`}
                    style={{
                      padding: "5px 16px",
                      borderRadius: "9999px",
                      fontSize: "12px",
                      fontWeight: isSelected ? "700" : "600",
                      backgroundColor: isSelected ? "#0040e0" : "#ffffff",
                      color: isSelected ? "#ffffff" : "#334155",
                      border: isSelected ? "1.5px solid #0040e0" : "1.5px solid #e2e8f0",
                      cursor: "pointer",
                      boxShadow: isSelected ? "0 3px 10px rgba(0, 64, 224, 0.28)" : "0 1px 2px rgba(0, 0, 0, 0.03)",
                      transition: "all 0.18s ease",
                    }}
                    onClick={() => {
                      setRequestedAmount(amt);
                      setTempAmountInput(amt);
                    }}
                  >
                    {formatINR(amt)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Numbered Circle 2: Choose a Repayment Plan */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-3 mb-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold shadow-xs"
              style={{ width: "32px", height: "32px", minWidth: "32px", backgroundColor: "#0040e0", fontSize: "14px" }}
            >
              2
            </div>
            <div>
              <h6 className="fw-bold text-dark mb-0 fs-6">
                Choose a Repayment Plan
              </h6>
              <span className="text-secondary small d-block" style={{ fontSize: "12px" }}>
                Select a plan based on your monthly budget and repayment preference
              </span>
            </div>
          </div>

          <div className="row g-3">
            {/* Option A: Dynamic based on Repayment Cycle */}
            <div className="col-12 col-md-6">
              <div
                className={`repayment-plan-card ${(selectedTenure === planA.tenure && selectedOfferType === planA.type) ? "active" : ""}`}
                style={{
                  border: (selectedTenure === planA.tenure && selectedOfferType === planA.type) ? "2px solid #0052ff" : "1.5px solid #e2e8f0",
                }}
                onClick={() => {
                  setSelectedTenure(planA.tenure);
                  setSelectedOfferType(planA.type);
                }}
              >
                <div>
                  {/* Header: Recommended badge & Selected indicator */}
                  <div className="d-flex justify-content-between align-items-center mb-2.5">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary"
                        style={{ width: "32px", height: "32px" }}
                      >
                        <i className="fa-solid fa-arrows-split-up-and-left fs-6"></i>
                      </div>
                      <span className="badge rounded-pill px-2.5 py-1 small fw-bold text-white" style={{ backgroundColor: "#10b981" }}>
                        Recommended
                      </span>
                    </div>

                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: "24px",
                        height: "24px",
                        backgroundColor: (selectedTenure === 6 && selectedOfferType === "EMI") ? "#0040e0" : "#ffffff",
                        border: (selectedTenure === 6 && selectedOfferType === "EMI") ? "none" : "2px solid #cbd5e1",
                        color: "#ffffff",
                      }}
                    >
                      {(selectedTenure === 3 && selectedOfferType === "EMI") ? <i className="fa-solid fa-check" style={{ fontSize: "11px" }}></i> : null}
                    </div>
                  </div>

                  {/* Title and installment badge */}
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <div>
                      <h5 className="fw-bold text-dark mb-0.5">{planA.title}</h5>
                      <span className="text-muted small" style={{ fontSize: "11.5px" }}>{planA.subtitle}</span>
                    </div>
                    <span className="badge rounded-pill px-2.5 py-1 small fw-semibold" style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", fontSize: "11px" }}>
                      {planA.installments}
                    </span>
                  </div>

                  {/* Big Installment Amount */}
                  <div className="d-flex align-items-baseline gap-1.5 mt-2 mb-1">
                    <h2 className="fw-extrabold text-primary mb-0" style={{ fontSize: "2rem", letterSpacing: "-0.5px" }}>
                      {formatINR(planA.data.emi)}
                    </h2>
                    <span className="text-dark fw-bold small">/ month</span>
                  </div>

                  <span className="text-muted small d-block mb-3" style={{ fontSize: "11.5px" }}>
                    Calculated on loan of <strong className="text-dark">{formatINR(requestedAmount)}</strong> • 12-Month Lock-in
                  </span>

                  {/* Cashflow & Surplus Advisory Box */}
                  <div
                    className="p-3 rounded-3 mb-3"
                    style={{
                      backgroundColor: "#fffdf5",
                      border: "1px solid #fde68a",
                    }}
                  >
                    <div className="d-flex align-items-center gap-1.5 fw-bold mb-1" style={{ color: "#92400e", fontSize: "12px" }}>
                      <i className="fa-solid fa-triangle-exclamation text-warning me-1.5 me-1.5"></i>
                      <span>Cashflow & Surplus Advisory</span>
                    </div>
                    <div style={{ fontSize: "11.5px", lineHeight: "1.55", color: "#92400e" }}>
                      Your baseline monthly surplus is estimated at <strong>{formatINR(surplus.monthlySurplus)}</strong> (Plan EMI is <strong>{formatINR(planA.data.emi)}/mo</strong>).
                      <div className="mt-2 d-flex align-items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          className="advisory-reduce-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStepAmount(-2000);
                          }}
                          title="Reduce loan amount to lower monthly EMI"
                        >
                          <i className="fa-solid fa-star me-1.5.5"></i>
                          Reduce Amount
                        </button>
                        <button
                          type="button"
                          className="advisory-finetune-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            Swal.fire({
                              title: "Extend Tenure Option",
                              text: "Tenure up to 6 months unlocks automatically after completing your first on-time loan cycle.",
                              icon: "info",
                              confirmButtonColor: "#0040e0",
                            });
                          }}
                        >
                          <i className="fa-solid fa-clock-rotate-left me-1.5.5"></i>
                          Extend Tenure
                        </button>
                        <button
                          type="button"
                          className="advisory-finetune-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalActiveTab("SURPLUS");
                            setShowCalculationModal(true);
                          }}
                        >
                          <i className="fa-solid fa-gear me-1.5.5"></i>
                          Fine-tune Expenses
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Feature Highlights Row */}
                  <div className="d-flex flex-wrap gap-1.5 mb-3">
                    <span className="repayment-feature-tag">
                      <i className="fa-solid fa-shield-check text-info me-1.5 me-1.5"></i> Low Monthly Impact
                    </span>
                    <span className="repayment-feature-tag">
                      <i className="fa-solid fa-star text-primary me-1.5 me-1.5"></i> Preserves Cash Cushion
                    </span>
                    <span className="repayment-feature-tag">
                      <i className="fa-solid fa-bolt text-warning me-1.5 me-1.5"></i> 0% Prepayment Penalty
                    </span>
                  </div>
                </div>

                {/* Clean Financial Breakdown Box */}
                <div className="card-data-box mt-auto">
                  <div className="card-data-row">
                    <span className="card-data-label">
                      <i className="fa-solid fa-money-bill-wave text-muted me-2 me-2"></i> Loan Principal
                    </span>
                    <span className="card-data-value">{formatINR(requestedAmount)}</span>
                  </div>
                  <div className="card-data-row">
                    <span className="card-data-label">
                      <i className="fa-solid fa-coins text-muted me-2 me-2"></i> Total Interest ({planA.tenure} Mo @ {planA.data?.annualRoi || 16.5}% p.a.)
                    </span>
                    <span className="card-data-value">{formatINR(planA.data.totalInterest)}</span>
                  </div>
                  <div className="card-data-row">
                    <span className="card-data-label">
                      <i className="fa-solid fa-receipt text-muted me-2 me-2"></i> Platform Fee (3.0% + 18% GST)
                    </span>
                    <span className="card-data-value">{formatINR(planA.data.processingFee + planA.data.gst)}</span>
                  </div>
                  <div className="card-disbursal-highlight">
                    <div>
                      <span className="small d-block fw-bold text-success">
                        <i className="fa-solid fa-circle-check me-2"></i> Net Cash Disbursal
                      </span>
                      <span className="text-muted" style={{ fontSize: "11px" }}>Direct IMPS transfer post e-Sign & eNACH</span>
                    </div>
                    <strong className="text-success fw-extrabold fs-4">{formatINR(planA.data.netDisbursal)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Option B: Dynamic based on Repayment Cycle */}
            <div className="col-12 col-md-6">
              <div
                className={`repayment-plan-card ${(selectedTenure === planB.tenure && (planB.type === "BULLET" ? selectedOfferType === "BULLET" : selectedOfferType === "EMI")) ? "active" : ""}`}
                style={{
                  border: (selectedTenure === planB.tenure && (planB.type === "BULLET" ? selectedOfferType === "BULLET" : selectedOfferType === "EMI")) ? "2px solid #0052ff" : "1.5px solid #e2e8f0",
                }}
                onClick={() => {
                  setSelectedTenure(planB.tenure);
                  setSelectedOfferType(planB.type);
                }}
              >
                <div>
                  {/* Header: Gray icon & Radio */}
                  <div className="d-flex justify-content-between align-items-center mb-2.5">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle bg-secondary bg-opacity-10 text-secondary"
                        style={{ width: "32px", height: "32px" }}
                      >
                        <i className="fa-solid fa-calendar-day fs-6"></i>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span className="badge rounded-pill px-2.5 py-1 small fw-semibold" style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", fontSize: "11px" }}>
                        For 12 installments (12M Lock-in)
                      </span>
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{
                          width: "22px",
                          height: "22px",
                          border: "2px solid #cbd5e1",
                          backgroundColor: "#ffffff",
                        }}
                      >
                      </div>
                    </div>
                  </div>

                  {/* Title and subtitle */}
                  <div className="mb-1">
                    <h5 className="fw-bold text-dark mb-0.5">{planB.title}</h5>
                    <span className="text-muted small" style={{ fontSize: "11.5px" }}>{planB.subtitle}</span>
                  </div>

                  {/* Big Settlement Amount */}
                  <div className="d-flex align-items-baseline gap-2 mt-2 mb-1 flex-wrap">
                    <h2 className="fw-extrabold text-dark mb-0" style={{ fontSize: "2rem", letterSpacing: "-0.5px" }}>
                      {planB.type === "BULLET" ? formatINR(planB.data.totalPayable) : formatINR(planB.data.emi)}
                    </h2>
                    <span className="text-dark fw-bold small">{planB.type === "BULLET" ? "single payment" : "/ month"}</span>
                    <span className="text-muted small">(due at maturity on Day 30)</span>
                  </div>

                  <span className="text-muted small d-block mb-3" style={{ fontSize: "11.5px" }}>
                    Calculated on loan of <strong className="text-dark">{formatINR(requestedAmount)}</strong>
                  </span>

                  {/* Payday Bullet Cashflow Advisory Box */}
                  <div
                    className="p-3 rounded-3 mb-3"
                    style={{
                      backgroundColor: "#f0f7ff",
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <div className="d-flex align-items-center gap-1.5 fw-bold text-primary" style={{ fontSize: "12px" }}>
                        <i className="fa-solid fa-calendar-check me-1.5 me-1.5"></i>
                        <span>Payday Bullet Cashflow Advisory</span>
                      </div>
                      <span className="badge rounded-pill px-2 py-0.5 small fw-semibold" style={{ background: "#ffffff", color: "#1d4ed8", border: "1px solid #bfdbfe", fontSize: "10px" }}>
                        Due Day 30: {formatINR(optionPayday.totalPayable)}
                      </span>
                    </div>
                    <div style={{ fontSize: "11.5px", lineHeight: "1.55", color: "#1e3a8a" }}>
                      Full lump-sum settlement of <strong>{formatINR(optionPayday.totalPayable)}</strong> on Day 30 is deducted from your upcoming salary credit.
                      <div className="mt-1 text-secondary">
                        ⚡ <strong>Option A (3-Month EMI)</strong> is recommended to spread repayment comfortably across 3 paychecks.
                      </div>
                    </div>
                  </div>

                  {/* Feature Highlights Row */}
                  <div className="d-flex flex-wrap gap-1.5 mb-3">
                    <span className="repayment-feature-tag">
                      <i className="fa-solid fa-ban text-danger me-1.5 me-1.5"></i> Zero Multi-Month Dues
                    </span>
                    <span className="repayment-feature-tag">
                      <i className="fa-solid fa-money-bill-1-wave text-success me-1.5 me-1.5"></i> Minimal Interest ({formatINR(planB.data.totalInterest)})
                    </span>
                    <span className="repayment-feature-tag">
                      <i className="fa-solid fa-clock-rotate-left text-primary me-1.5 me-1.5"></i> 30-Day Payday Credit
                    </span>
                  </div>
                </div>

                {/* Clean Financial Breakdown Box */}
                <div className="card-data-box mt-auto">
                  <div className="card-data-row">
                    <span className="card-data-label">
                      <i className="fa-solid fa-money-bill-wave text-muted me-2 me-2"></i> Loan Principal
                    </span>
                    <span className="card-data-value">{formatINR(requestedAmount)}</span>
                  </div>
                  <div className="card-data-row">
                    <span className="card-data-label">
                      <i className="fa-solid fa-coins text-muted me-2 me-2"></i> Total Interest ({planB.type === "BULLET" ? "30 Days @ 15.6% p.a." : `${planB.tenure} Mo @ ${planB.data?.annualRoi || 18.0}% p.a.`})
                    </span>
                    <span className="card-data-value">{formatINR(planB.data?.totalInterest || 0)}</span>
                  </div>
                  <div className="card-data-row">
                    <span className="card-data-label">
                      <i className="fa-solid fa-receipt text-muted me-2 me-2"></i> Platform Fee (3.0% + 18% GST)
                    </span>
                    <span className="card-data-value">{formatINR(planB.data.processingFee + planB.data.gst)}</span>
                  </div>
                  <div className="card-disbursal-highlight">
                    <div>
                      <span className="small d-block fw-bold text-success">
                        <i className="fa-solid fa-circle-check me-2"></i> Net Cash Disbursal
                      </span>
                      <span className="text-muted" style={{ fontSize: "11px" }}>Direct IMPS transfer post e-Sign & eNACH</span>
                    </div>
                    <strong className="text-success fw-extrabold fs-4">{formatINR(planB.data.netDisbursal)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* 6. Bottom Sticky Summary & CTA Bar */}
      <div
        className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4"
        style={{
          border: "1.5px solid #e2e8f0",
          backgroundColor: "#ffffff",
        }}
      >
        <div className="card-body p-3.5">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            {/* Left: Selected Plan summary */}
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 text-primary shadow-2xs"
                style={{ width: "42px", height: "42px", minWidth: "42px" }}
              >
                <i className="fa-solid fa-file-invoice-dollar fs-5"></i>
              </div>
              <div>
                <span className="text-muted small d-block" style={{ fontSize: "11px", fontWeight: "600" }}>Selected Plan</span>
                <strong className="text-dark fs-6 d-block mb-0.5">
                  {isBullet
                    ? `30-Day Payday Bullet • ${formatINR(requestedAmount)}`
                    : `${selectedTenure}-Month Equal EMI • ${formatINR(requestedAmount)}`}
                </strong>
                <span className="text-muted small" style={{ fontSize: "11px" }}>
                  {isBullet
                    ? `${formatINR(currentPricing.totalPayable)} single payment on Day 30 • ${currentPricing.annualRoi}% p.a.`
                    : `${formatINR(currentPricing.emi)}/mo • ${formatINR(currentPricing.totalPayable)} total • ${currentPricing.annualRoi}% p.a.`}
                </span>
              </div>
            </div>

            {/* Center: Action Buttons */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              {hasSubmittedLoanRequest || activeLoanRequest ? (
                /* When request is already submitted or returned from /borrowerRequestAmount, HIDE 'Raise a Request' and show direct CTA to Offers */
                <button
                  type="button"
                  onClick={() => {
                    if (onProceedToOffers) onProceedToOffers(activeLoanRequest);
                    else if (onProceedToEsign) onProceedToEsign(activeLoanRequest);
                    else if (onOfferSelected) onOfferSelected(activeLoanRequest);
                  }}
                  className="btn btn-primary px-4 py-2.5 rounded-pill fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2 w-mobile-100"
                  style={{
                    backgroundColor: "#0040e0",
                    borderColor: "#0040e0",
                    minWidth: "270px",
                    boxShadow: "0 4px 14px rgba(0, 64, 224, 0.3)",
                  }}
                >
                  <i className="fa-solid fa-list-check" style={{ fontSize: "14px" }}></i>
                  <div className="text-center" style={{ lineHeight: "1.2" }}>
                    <div style={{ fontSize: "13.5px", fontWeight: "700" }}>Offers Received from Lenders</div>
                    <div style={{ fontSize: "11px", fontWeight: "500", opacity: "0.9" }}>
                      Request #{activeLoanRequest?.id || "167"} • {formatINR(activeLoanRequest?.requestAmount || requestedAmount)} Active
                    </div>
                  </div>
                  <i className="fa-solid fa-arrow-right ms-1"></i>
                </button>
              ) : (
                /* Only show 'Raise a Request' if no active request exists */
                <button
                  type="button"
                  onClick={handleRaiseLoanRequest}
                  disabled={isSubmittingLoanRequest}
                  className="btn btn-primary px-4 py-2.5 rounded-pill fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2 w-mobile-100"
                  style={{
                    backgroundColor: "#0040e0",
                    borderColor: "#0040e0",
                    minWidth: "270px",
                    boxShadow: "0 4px 14px rgba(0, 64, 224, 0.3)",
                  }}
                >
                  {isSubmittingLoanRequest ? (
                    <><i className="fa-solid fa-spinner fa-spin me-1.5"></i> Submitting Request...</>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane" style={{ transform: "rotate(-15deg)", fontSize: "14px" }}></i>
                      <div className="text-center" style={{ lineHeight: "1.2" }}>
                        <div style={{ fontSize: "13.5px", fontWeight: "700" }}>Raise a Request ({formatINR(requestedAmount)})</div>
                        <div style={{ fontSize: "11px", fontWeight: "500", opacity: "0.9" }}>to View Final Offers</div>
                      </div>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Right: 3 Trust Badges */}
            <div className="d-flex align-items-center gap-3 text-secondary small">
              <div className="d-flex align-items-center gap-1.5">
                <i className="fa-solid fa-shield-halved text-primary" style={{ fontSize: "14px" }}></i>
                <div style={{ lineHeight: "1.2" }}>
                  <span className="d-block fw-bold text-dark" style={{ fontSize: "11px" }}>100% RBI</span>
                  <span className="text-muted" style={{ fontSize: "10px" }}>Compliant</span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-1.5">
                <i className="fa-solid fa-percent text-primary" style={{ fontSize: "14px" }}></i>
                <div style={{ lineHeight: "1.2" }}>
                  <span className="d-block fw-bold text-dark" style={{ fontSize: "11px" }}>Zero Upfront</span>
                  <span className="text-muted" style={{ fontSize: "10px" }}>Charges</span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-1.5">
                <i className="fa-solid fa-lock text-primary" style={{ fontSize: "14px" }}></i>
                <div style={{ lineHeight: "1.2" }}>
                  <span className="d-block fw-bold text-dark" style={{ fontSize: "11px" }}>Secure &</span>
                  <span className="text-muted" style={{ fontSize: "10px" }}>Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

{/* 12. Unified Loan Calculation, Amortization & KFS Modal */}
      {isBreakdownModalOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", zIndex: 1060, backdropFilter: "blur(4px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseBreakdownModal();
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 p-4 shadow-lg">
              <div className="modal-header border-0 pb-2 px-0 pt-0 d-flex justify-content-between align-items-start">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-2.5 py-1 small fw-bold">
                      <i className="fa-solid fa-calculator me-1"></i> Transparent Digital Lending
                    </span>
                    <span className="badge rounded-pill bg-success-subtle text-success px-2.5 py-1 small fw-bold">
                      <i className="fa-solid fa-shield-halved me-1"></i> RBI Compliant
                    </span>
                  </div>
                  <h5 className="modal-title fw-bold text-dark mb-0">Surplus & Loan Calculation Breakdown</h5>
                  <span className="text-muted small">
                    Verified Inflow: <strong>{formatINR(verifiedInflow)}</strong> • Net Surplus: <strong className="text-success">{formatINR(surplus.monthlySurplus)}</strong> • Safe EMI Cap: <strong>{formatINR(affordability.maxSafeNewEmi)}/mo</strong> • Net Disbursal: <strong className="text-success">{formatINR(currentPricing.netDisbursal)}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={handleCloseBreakdownModal}
                ></button>
              </div>

              {/* Tab Navigation */}
              <div className="d-flex gap-2 p-1 bg-light rounded-pill mb-3 mt-2 overflow-x-auto instant-modal-tabs-scroll flex-nowrap" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill flex-fill fw-bold ${modalActiveTab === "SURPLUS" ? "btn-primary shadow-xs text-white" : "btn-light text-secondary border-0"}`}
                  onClick={() => setModalActiveTab("SURPLUS")}
                  style={{ fontSize: "12px", padding: "8px 14px" }}
                >
                  <i className="fa-solid fa-wallet me-1.5"></i>
                  1. Surplus Calculation
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill flex-fill fw-bold ${modalActiveTab === "CALCULATION" ? "btn-primary shadow-xs text-white" : "btn-light text-secondary border-0"}`}
                  onClick={() => setModalActiveTab("CALCULATION")}
                  style={{ fontSize: "12px", padding: "8px 14px" }}
                >
                  <i className="fa-solid fa-receipt me-1.5"></i>
                  2. Fee & Net Disbursal Formula
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill flex-fill fw-bold ${modalActiveTab === "SCHEDULE" ? "btn-primary shadow-xs text-white" : "btn-light text-secondary border-0"}`}
                  onClick={() => setModalActiveTab("SCHEDULE")}
                  style={{ fontSize: "12px", padding: "8px 14px" }}
                >
                  <i className="fa-solid fa-calendar-days me-1.5"></i>
                  3. Repayment Schedule
                </button>
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill flex-fill fw-bold ${modalActiveTab === "KFS" ? "btn-primary shadow-xs text-white" : "btn-light text-secondary border-0"}`}
                  onClick={() => setModalActiveTab("KFS")}
                  style={{ fontSize: "12px", padding: "8px 14px" }}
                >
                  <i className="fa-solid fa-file-contract me-1.5"></i>
                  4. Key Fact Statement (KFS)
                </button>
              </div>

              {/* Tab 1: Surplus Calculation & Cashflow Waterfall */}
              {modalActiveTab === "SURPLUS" && (
                <div className="modal-body p-0 small">
                  {/* 4 Financial Health KPI Tiles */}
                  <div className="row g-2 mb-3">
                    <div className="col-6 col-md-3">
                      <div className="p-2.5 rounded-3 bg-light border h-100">
                        <span className="text-muted d-block" style={{ fontSize: "11px" }}>
                          <i className="fa-solid fa-arrow-down-left text-success me-1"></i> Verified Inflow
                        </span>
                        <strong className="text-dark fs-6 font-monospace">{formatINR(verifiedInflow)}</strong>
                        <span className="d-block text-success fw-semibold" style={{ fontSize: "10px" }}>100% Salary Verified</span>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="p-2.5 rounded-3 bg-light border h-100" style={{ borderColor: "#fca5a5" }}>
                        <span className="d-block fw-semibold" style={{ fontSize: "11px", color: "#991b1b" }}>
                          <i className="fa-solid fa-credit-card me-1"></i> Existing Debt Outflows
                        </span>
                        <strong className="font-monospace fs-6" style={{ color: "#7f1d1d" }}>-{formatINR(expenses.totalExistingObligations)}</strong>
                        <span className="d-block text-muted" style={{ fontSize: "10px" }}>Baseline FOIR: {Math.round(affordability.baselineFOIR * 100)}%</span>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="p-2.5 rounded-3 bg-light border h-100">
                        <span className="d-block fw-semibold" style={{ fontSize: "11px", color: "#78350f" }}>
                          <i className="fa-solid fa-house-user me-1"></i> Living & Mandatory
                        </span>
                        <strong className="text-dark fs-6 font-monospace">-{formatINR(expenses.essentialLivingExpenses + expenses.mandatoryExpenses)}</strong>
                        <span className="d-block text-muted" style={{ fontSize: "10px" }}>Rent, Food & Mandatory</span>
                      </div>
                    </div>
                    <div className="col-6 col-md-3">
                      <div className="p-2.5 rounded-3 h-100" style={{ backgroundColor: "#ecfdf5", border: "1.5px solid #a7f3d0" }}>
                        <span className="d-block fw-bold" style={{ fontSize: "11px", color: "#065f46" }}>
                          <i className="fa-solid fa-wallet me-1"></i> Net Monthly Surplus
                        </span>
                        <strong className="font-monospace fs-6" style={{ color: "#064e3b" }}>{formatINR(surplus.monthlySurplus)}</strong>
                        <span className="d-block fw-semibold" style={{ fontSize: "10px", color: "#047857" }}>{surplusPct}% Disposable Cushion</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Cashflow Distribution Bar */}
                  <div className="p-3 bg-light rounded-3 border mb-3">
                    <div className="d-flex justify-content-between text-muted small fw-semibold mb-1.5" style={{ fontSize: "11px" }}>
                      <span>Monthly Cashflow Allocation Waterfall:</span>
                      <span>Unencumbered Surplus: <strong className="text-success">{formatINR(surplus.monthlySurplus)}</strong></span>
                    </div>

                    <div className="progress rounded-pill shadow-xs" style={{ height: "12px", backgroundColor: "#e2e8f0" }}>
                      <div
                        className="progress-bar bg-danger"
                        role="progressbar"
                        style={{ width: `${obligationsPct}%` }}
                        title={`Existing Debt: ${formatINR(expenses.totalExistingObligations)} (${obligationsPct}%)`}
                      />
                      <div
                        className="progress-bar bg-warning"
                        role="progressbar"
                        style={{ width: `${livingPct}%` }}
                        title={`Living Costs: ${formatINR(expenses.essentialLivingExpenses)} (${livingPct}%)`}
                      />
                      <div
                        className="progress-bar bg-info"
                        role="progressbar"
                        style={{ width: `${mandatoryPct}%` }}
                        title={`Mandatory Costs: ${formatINR(expenses.mandatoryExpenses)} (${mandatoryPct}%)`}
                      />
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: `${surplusPct}%` }}
                        title={`Net Surplus Cushion: ${formatINR(surplus.monthlySurplus)} (${surplusPct}%)`}
                      />
                    </div>

                    <div className="d-flex flex-wrap gap-2.5 mt-2 text-muted" style={{ fontSize: "10.5px" }}>
                      <span className="d-inline-flex align-items-center gap-1">
                        <span className="badge rounded-circle p-1 bg-danger"></span>
                        Debt Outflows ({obligationsPct}%)
                      </span>
                      <span className="d-inline-flex align-items-center gap-1">
                        <span className="badge rounded-circle p-1 bg-warning"></span>
                        Living Costs ({livingPct}%)
                      </span>
                      <span className="d-inline-flex align-items-center gap-1">
                        <span className="badge rounded-circle p-1 bg-info"></span>
                        Mandatory ({mandatoryPct}%)
                      </span>
                      <span className="d-inline-flex align-items-center gap-1 fw-bold text-success">
                        <span className="badge rounded-circle p-1 bg-success"></span>
                        Disposable Surplus ({surplusPct}%)
                      </span>
                    </div>
                  </div>

                  {/* Detailed Surplus Derivation Table */}
                  <div className="table-responsive rounded-3 border mb-3 overflow-hidden">
                    <table className="table table-sm table-striped align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="py-2 px-3 text-secondary">Cashflow Step / Parameter</th>
                          <th className="py-2 px-3 text-center text-secondary">Assessment Logic</th>
                          <th className="py-2 px-3 text-end text-secondary">Monthly Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-3 fw-bold text-dark">1. Total Verified Monthly Inflow</td>
                          <td className="px-3 text-center text-muted">Primary verified salary credit (ICICI Bank)</td>
                          <td className="px-3 text-end fw-bold text-dark fs-6">{formatINR(verifiedInflow)}</td>
                        </tr>
                        <tr>
                          <td className="px-3 text-secondary">2. Less: Existing Debt Outflows (EMIs & Cards)</td>
                          <td className="px-3 text-center text-muted">Active loans (₹{customCashflow.existingEmi.toLocaleString("en-IN")}) + Card min dues (₹{customCashflow.creditCardMinDues.toLocaleString("en-IN")})</td>
                          <td className="px-3 text-end fw-semibold text-danger">- {formatINR(expenses.totalExistingObligations)}</td>
                        </tr>
                        <tr>
                          <td className="px-3 text-secondary">3. Less: Essential Living Expenses</td>
                          <td className="px-3 text-center text-muted">House rent (₹{customCashflow.rent.toLocaleString("en-IN")}) + Utilities & food (₹{customCashflow.householdExpenses.toLocaleString("en-IN")})</td>
                          <td className="px-3 text-end fw-semibold text-danger">- {formatINR(expenses.essentialLivingExpenses)}</td>
                        </tr>
                        <tr>
                          <td className="px-3 text-secondary">4. Less: Mandatory & Committed Costs</td>
                          <td className="px-3 text-center text-muted">Tuition (₹{customCashflow.educationExpenses.toLocaleString("en-IN")}) + Insurance (₹{customCashflow.insurance.toLocaleString("en-IN")}) + Other (₹{customCashflow.otherMandatory.toLocaleString("en-IN")})</td>
                          <td className="px-3 text-end fw-semibold text-danger">- {formatINR(expenses.mandatoryExpenses)}</td>
                        </tr>
                        <tr style={{ backgroundColor: "#ecfdf5" }}>
                          <td className="px-3 fw-bold text-success">
                            <i className="fa-solid fa-wallet me-1.5"></i>
                            5. Net Monthly Disposable Surplus
                          </td>
                          <td className="px-3 text-center text-muted small">Inflow - (Debt + Living + Mandatory)</td>
                          <td className="px-3 text-end fw-extrabold text-success fs-6">{formatINR(surplus.monthlySurplus)}</td>
                        </tr>
                        <tr>
                          <td className="px-3 text-secondary">6. Safe EMI Capacity Ceiling (50% FOIR Cap)</td>
                          <td className="px-3 text-center text-muted">Maximum permissible loan installment without stress</td>
                          <td className="px-3 text-end fw-bold text-primary">{formatINR(affordability.maxSafeNewEmi)} / mo</td>
                        </tr>
                        <tr>
                          <td className="px-3 text-secondary">7. Proposed Loan EMI ({isBullet ? "30-Day Payday Bullet" : `${selectedTenure}-Month Plan`})</td>
                          <td className="px-3 text-center text-muted">Selected repayment commitment (Takes {surplusAllocationPct}% of surplus)</td>
                          <td className="px-3 text-end fw-bold text-dark">{formatINR(currentPricing.emi)} {isBullet ? "at maturity" : "/ month"}</td>
                        </tr>
                        <tr style={{ backgroundColor: "#f0fdf4" }}>
                          <td className="px-3 fw-bold text-dark">
                            <i className="fa-solid fa-shield-halved text-success me-1.5"></i>
                            8. Surplus Buffer Remaining After Loan EMI
                          </td>
                          <td className="px-3 text-center text-muted small">Emergency cash cushion left after paying EMI</td>
                          <td className="px-3 text-end fw-bold text-success fs-6">{formatINR(residualBuffer)} / mo</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Cashflow Assumptions Fine-Tuner */}
                  <div className="p-3 bg-light rounded-3 border mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <i className="fa-solid fa-sliders text-primary"></i>
                        <strong className="text-dark small">Cashflow Assumptions Fine-Tuner</strong>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-decoration-none p-0 text-primary small fw-semibold"
                        onClick={() => {
                          setCustomCashflow({
                            existingEmi: Math.round(salary * 0.18),
                            creditCardMinDues: 2000,
                            rent: Math.round(salary * 0.22),
                            householdExpenses: Math.round(salary * 0.16),
                            educationExpenses: 2500,
                            insurance: 1500,
                            otherMandatory: 1000,
                          });
                        }}
                      >
                        Reset to Defaults
                      </button>
                    </div>
                    <p className="text-muted mb-2" style={{ fontSize: "11px" }}>
                      Adjust your actual commitments below. Your net surplus, safe EMI capacity, and safe borrowing limit recalculate in real-time.
                    </p>

                    <div className="row g-2">
                      <div className="col-6 col-md-3">
                        <label className="form-label text-muted mb-1" style={{ fontSize: "10.5px" }}>Existing Loan EMIs (₹)</label>
                        <input
                          type="number"
                          step="500"
                          className="form-control form-control-sm rounded-2 font-monospace"
                          value={customCashflow.existingEmi}
                          onChange={(e) => handleCashflowChange("existingEmi", e.target.value)}
                        />
                      </div>
                      <div className="col-6 col-md-3">
                        <label className="form-label text-muted mb-1" style={{ fontSize: "10.5px" }}>Credit Card Min Dues (₹)</label>
                        <input
                          type="number"
                          step="500"
                          className="form-control form-control-sm rounded-2 font-monospace"
                          value={customCashflow.creditCardMinDues}
                          onChange={(e) => handleCashflowChange("creditCardMinDues", e.target.value)}
                        />
                      </div>
                      <div className="col-6 col-md-3">
                        <label className="form-label text-muted mb-1" style={{ fontSize: "10.5px" }}>House Rent (₹)</label>
                        <input
                          type="number"
                          step="500"
                          className="form-control form-control-sm rounded-2 font-monospace"
                          value={customCashflow.rent}
                          onChange={(e) => handleCashflowChange("rent", e.target.value)}
                        />
                      </div>
                      <div className="col-6 col-md-3">
                        <label className="form-label text-muted mb-1" style={{ fontSize: "10.5px" }}>Household & Utilities (₹)</label>
                        <input
                          type="number"
                          step="500"
                          className="form-control form-control-sm rounded-2 font-monospace"
                          value={customCashflow.householdExpenses}
                          onChange={(e) => handleCashflowChange("householdExpenses", e.target.value)}
                        />
                      </div>
                      <div className="col-4 col-md-4">
                        <label className="form-label text-muted mb-1" style={{ fontSize: "10.5px" }}>Education & Tuition (₹)</label>
                        <input
                          type="number"
                          step="500"
                          className="form-control form-control-sm rounded-2 font-monospace"
                          value={customCashflow.educationExpenses}
                          onChange={(e) => handleCashflowChange("educationExpenses", e.target.value)}
                        />
                      </div>
                      <div className="col-4 col-md-4">
                        <label className="form-label text-muted mb-1" style={{ fontSize: "10.5px" }}>Insurance Premiums (₹)</label>
                        <input
                          type="number"
                          step="500"
                          className="form-control form-control-sm rounded-2 font-monospace"
                          value={customCashflow.insurance}
                          onChange={(e) => handleCashflowChange("insurance", e.target.value)}
                        />
                      </div>
                      <div className="col-4 col-md-4">
                        <label className="form-label text-muted mb-1" style={{ fontSize: "10.5px" }}>Other Mandatory (₹)</label>
                        <input
                          type="number"
                          step="500"
                          className="form-control form-control-sm rounded-2 font-monospace"
                          value={customCashflow.otherMandatory}
                          onChange={(e) => handleCashflowChange("otherMandatory", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Underwriting Safeguards & Explainability */}
                  <div className="row g-2">
                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-light rounded-3 border h-100">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <i className="fa-solid fa-chart-line text-success"></i>
                          <strong className="text-dark small">Surplus Capacity Multiplier</strong>
                        </div>
                        <p className="text-muted mb-0" style={{ fontSize: "11px", lineHeight: "1.5" }}>
                          Your verified net disposable surplus of <strong>{formatINR(surplus.monthlySurplus)}</strong> allows a safe monthly EMI of up to <strong>{formatINR(affordability.maxSafeNewEmi)}</strong> without impacting day-to-day living or emergency savings.
                        </p>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-light rounded-3 border h-100">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <i className="fa-solid fa-shield-halved text-primary"></i>
                          <strong className="text-dark small">Debt Burden (FOIR) Cap Safeguard</strong>
                        </div>
                        <p className="text-muted mb-0" style={{ fontSize: "11px", lineHeight: "1.5" }}>
                          With this loan, total debt obligations remain at <strong>{projectedFoirPct}%</strong> of monthly income, well below the 50% regulatory prudential ceiling, preserving a cash cushion of <strong>{formatINR(residualBuffer)}</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Calculation Breakdown & Fee Formulas */}
              {modalActiveTab === "CALCULATION" && (
                <div className="modal-body p-0 small">
                  <div className="table-responsive rounded-3 border mb-3 overflow-hidden">
                    <table className="table table-sm table-striped align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="py-2 px-3 text-secondary">Component</th>
                          <th className="py-2 px-3 text-center text-secondary">Calculation Method</th>
                          <th className="py-2 px-3 text-end text-secondary">Amount (INR)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-3 fw-bold text-dark">1. Sanctioned Loan Principal</td>
                          <td className="px-3 text-center text-muted">Borrower requested principal amount</td>
                          <td className="px-3 text-end fw-bold text-dark fs-6">{formatINR(requestedAmount)}</td>
                        </tr>
                        <tr>
                          <td className="px-3 text-secondary">2. Platform Origination Fee (3.0%)</td>
                          <td className="px-3 text-center text-muted">3% × ₹{requestedAmount.toLocaleString("en-IN")} principal</td>
                          <td className="px-3 text-end fw-semibold text-danger">- {formatINR(currentPricing.processingFee)}</td>
                        </tr>
                        <tr>
                          <td className="px-3 text-secondary">3. GST on Origination Fee (18%)</td>
                          <td className="px-3 text-center text-muted">18% on ₹{currentPricing.processingFee.toLocaleString("en-IN")} fee</td>
                          <td className="px-3 text-end fw-semibold text-danger">- {formatINR(currentPricing.gst)}</td>
                        </tr>
                        <tr style={{ backgroundColor: "#ecfdf5" }}>
                          <td className="px-3 fw-bold text-success">
                            <i className="fa-solid fa-circle-check me-1.5"></i>
                            4. Net Disbursal into Bank Account
                          </td>
                          <td className="px-3 text-center text-muted small">Principal - (Origination Fee + GST)</td>
                          <td className="px-3 text-end fw-extrabold text-success fs-6">{formatINR(currentPricing.netDisbursal)}</td>
                        </tr>
                        <tr>
                          <td className="px-3 text-secondary">5. Interest Rate (ROI / APR)</td>
                          <td className="px-3 text-center text-muted">Prime Tier benchmark reducing rate</td>
                          <td className="px-3 text-end fw-bold text-primary">{currentPricing.annualRoi}% p.a.</td>
                        </tr>
                        <tr>
                          <td className="px-3 text-secondary">6. Monthly Installment (EMI)</td>
                          <td className="px-3 text-center text-muted">
                            {isBullet ? "Single Bullet on Day 30" : `${selectedTenure} monthly installments`}
                          </td>
                          <td className="px-3 text-end fw-bold text-dark">{formatINR(currentPricing.emi)} {isBullet ? "at maturity" : "/ month"}</td>
                        </tr>
                        <tr>
                          <td className="px-3 text-secondary">7. Total Interest Payable</td>
                          <td className="px-3 text-center text-muted">Total interest over loan tenure</td>
                          <td className="px-3 text-end fw-semibold text-secondary">{formatINR(currentPricing.totalInterest)}</td>
                        </tr>
                        <tr className="table-light">
                          <td className="px-3 fw-bold text-dark">8. Total Repayment Sum</td>
                          <td className="px-3 text-center text-muted">Principal + Total Interest</td>
                          <td className="px-3 text-end fw-bold text-dark fs-6">{formatINR(currentPricing.totalPayable)}</td>
                        </tr>
                        <tr>
                          <td className="px-3 text-secondary">9. Prepayment / Foreclosure Charges</td>
                          <td className="px-3 text-center text-muted">0% early prepayment fee</td>
                          <td className="px-3 text-end fw-bold text-success">₹0 (Free / Nil Waiver)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="row g-2">
                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-light rounded-3 border h-100">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <i className="fa-solid fa-calculator text-primary"></i>
                          <strong className="text-dark small">Reducing EMI Formula</strong>
                        </div>
                        <p className="text-muted mb-0" style={{ fontSize: "11px", lineHeight: "1.5" }}>
                          Calculated using the standard reducing balance method: <code>EMI = [P × r × (1+r)ⁿ] / [(1+r)ⁿ - 1]</code>.
                          Interest applies solely to the remaining principal balance.
                        </p>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-light rounded-3 border h-100">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <i className="fa-solid fa-building-columns text-success"></i>
                          <strong className="text-dark small">Escrow Disbursal Safeguard</strong>
                        </div>
                        <p className="text-muted mb-0" style={{ fontSize: "11px", lineHeight: "1.5" }}>
                          Disbursal is released directly from ICICI Bank Escrow Pool into borrower's verified bank account upon eSign completion.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Repayment Schedule (Amortization) */}
              {modalActiveTab === "SCHEDULE" && (
                <div className="modal-body p-0 small">
                  <div className="table-responsive rounded-3 border overflow-hidden">
                    <table className="table table-bordered align-middle text-center mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Scheduled Due Date</th>
                          <th>EMI Installment</th>
                          <th>Principal Part</th>
                          <th>Interest Part</th>
                          <th>Remaining Principal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {amortizationSchedule.map((row) => (
                          <tr key={row.installmentNo}>
                            <td className="fw-bold">{row.installmentNo}</td>
                            <td className="fw-bold text-primary fw-semibold">{row.dueDateStr}</td>
                            <td className="fw-bold text-dark">{formatINR(row.emiAmount)}</td>
                            <td className="text-success">{formatINR(row.principalPart)}</td>
                            <td className="text-muted">{formatINR(row.interestPart)}</td>
                            <td className="fw-bold">{formatINR(row.closingBalance)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="table-light fw-bold">
                        <tr>
                          <td colSpan="2" className="text-end">Total Sum:</td>
                          <td>{formatINR(currentPricing.totalPayable)}</td>
                          <td className="text-success">{formatINR(requestedAmount)}</td>
                          <td className="text-muted">{formatINR(currentPricing.totalInterest)}</td>
                          <td>₹0</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <div className="p-3 bg-light rounded-3 mt-3 border">
                    <small className="text-muted d-block">
                      <i className="fa-solid fa-circle-info text-primary me-1"></i>
                      Auto-debit will be initiated from your verified bank account via NPCI eNACH on the 5th of each month. 0% charge for early foreclosure or prepayment.
                    </small>
                  </div>
                </div>
              )}

              {/* Tab 3: Key Fact Statement (KFS) */}
              {modalActiveTab === "KFS" && (
                <div className="modal-body p-0 small">
                  <div className="table-responsive rounded-3 border overflow-hidden">
                    <table className="table table-bordered mb-0">
                      <tbody>
                        <tr>
                          <td className="text-muted fw-semibold">1. Loan Principal Amount</td>
                          <td className="fw-bold text-end">{formatINR(requestedAmount)}</td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-semibold">2. Loan Tenure</td>
                          <td className="fw-bold text-end">
                            {isBullet ? "30 Days (Single Bullet)" : `${selectedTenure} Months`}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-semibold">3. Annual Percentage Rate (APR / ROI)</td>
                          <td className="fw-bold text-end">{currentPricing.annualRoi}% p.a. (Reducing Balance)</td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-semibold">4. Monthly Installment (EMI)</td>
                          <td className="fw-bold text-primary text-end">
                            {formatINR(currentPricing.emi)} {isBullet ? "at maturity" : "/ month"}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-semibold">5. Total Interest Payable</td>
                          <td className="fw-bold text-end">{formatINR(currentPricing.totalInterest)}</td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-semibold">6. Upfront Origination & Platform Fee (3.0%)</td>
                          <td className="fw-bold text-end">{formatINR(currentPricing.processingFee)} (+ {formatINR(currentPricing.gst)} 18% GST)</td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-semibold">7. Net Disbursed Amount (Direct to Bank)</td>
                          <td className="fw-bold text-success text-end fs-6">{formatINR(currentPricing.netDisbursal)}</td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-semibold">8. Total Repayment Sum</td>
                          <td className="fw-bold text-end">{formatINR(currentPricing.totalPayable)}</td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-semibold">9. Prepayment / Foreclosure Fee</td>
                          <td className="fw-bold text-success text-end">₹ 0 (Nil — 100% Waiver)</td>
                        </tr>
                        <tr>
                          <td className="text-muted fw-semibold">10. Matched Escrow Pool Trustee</td>
                          <td className="fw-bold text-end">ICICI Bank Escrow Pool (RBI Certified P2P)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="modal-footer border-0 pt-3 px-0 pb-0 d-flex justify-content-between align-items-center">
                <span className="text-muted small" style={{ fontSize: "11px" }}>
                  <i className="fa-solid fa-lock text-success me-1"></i>
                  Fair Practices Code Compliant (RBI P2P Directions)
                </span>
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill px-4 fw-bold"
                  onClick={handleCloseBreakdownModal}
                >
                  Close Breakdown
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstantLoanStepOfferSelection;
