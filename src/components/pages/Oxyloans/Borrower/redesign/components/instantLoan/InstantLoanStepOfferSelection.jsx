import React, { useState, useMemo } from "react";
import "./instantLoan.css";
import {
  runComprehensiveUnderwriting,
  calculatePricing,
  calculateLenderRoiBand,
  formatINR,
  formatPercent,
} from "./instantLoanCalculations";
import { getActiveRules } from "./instantLoanRules";
import StressTestMatrix from "./StressTestMatrix";
import CompanySafetyCard from "./CompanySafetyCard";
import { submitInstantLoanApplication } from "./instantLoanApi";

const InstantLoanStepOfferSelection = ({
  profileData = {},
  creditScore = 802,
  onOfferSelected,
  onBack,
}) => {
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
    Math.min(maxCap, Math.max(minCap, 45000))
  );
  const [selectedOfferType, setSelectedOfferType] = useState("EMI"); // "EMI" | "BULLET"
  const [selectedTenure, setSelectedTenure] = useState(3); // Default 3 Months for new borrowers
  const [showExpenseDrawer, setShowExpenseDrawer] = useState(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState(false);
  const [showKfsModal, setShowKfsModal] = useState(false);
  const [showAmortizationModal, setShowAmortizationModal] = useState(false);
  const [tenureLockedNotice, setTenureLockedNotice] = useState("");

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

    const calculated = calculatePricing(p, selectedTenure, risk.riskTier, risk.pd, {
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
        const calculated = calculatePricing(plan.amount, plan.tenure, risk.riskTier, risk.pd, {
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

  // Handle offer submission to next step (eSign / eNACH)
  const handleConfirmOffer = () => {
    const chosenPlan = {
      title: isBullet ? "Single Bullet Repayment (30 Days)" : `${selectedTenure}-Month EMI Plan`,
      selectedOfferType: isBullet ? "BULLET" : "EMI",
      principal: requestedAmount,
      tenureMonths: selectedTenure,
      indicativeRoi: roiBand.indicativeRoi,
      interestRate: currentPricing.annualRoi,
      roiVariance,
      isCustomLenderRoi: currentPricing.isCustomLenderRoi,
      lenderMatchStatus,
      lenderRoiBand: roiBand,
      interest: currentPricing.totalInterest,
      processingFee: currentPricing.processingFee,
      gst: currentPricing.gst,
      netDisbursal: currentPricing.netDisbursal,
      totalPayable: currentPricing.totalPayable,
      monthlyEmi: currentPricing.emi,
      matchedLender: lenderMatchStatus === "MATCHED"
        ? `Matched Institutional Escrow Pool #41682 (@ ${currentPricing.annualRoi}%)`
        : "OxyLoans Certified Escrow Lending Pool #41682",
      apr: currentPricing.illustrativeApr,
      surplusBufferRemaining: residualBuffer,
      decisionTelemetry: decisionEvaluation,
      repaymentCycle,
    };

    // Submit loan request asynchronously to backend
    submitInstantLoanApplication(chosenPlan).catch((err) => {
      console.warn("submitInstantLoanApplication background response:", err);
    });

    onOfferSelected(chosenPlan);
  };

  return (
    <div className="fintech-card step-view-enter">
      {/* 1. Header & Navigation */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge badge-fintech-success-soft px-3 py-1 rounded-pill small">
              Phase 4 • Live Intelligent Underwriting & Repayment Modeling
            </span>
            <span className="badge badge-fintech-neutral px-2 py-1 rounded-pill small">
              Step 4 of 6
            </span>
          </div>
          <h4 className="fw-bold text-dark mb-1">Select Your Loan & Repayment Structure</h4>
          <p className="text-muted small mb-0">
            Real-time underwriting calculations dynamically modeled for <strong>{profileData.name || "Borrower"}</strong> based on verified salary and bureau credit records.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary rounded-pill px-3"
            onClick={() => setShowExpenseDrawer(!showExpenseDrawer)}
          >
            <i className="fa-solid fa-sliders me-1"></i>
            {showExpenseDrawer ? "Hide Cashflow Editor" : "Fine-Tune Cashflow & Expenses"}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="btn btn-sm btn-outline-secondary rounded-3 px-3"
          >
            <i className="fa-solid fa-arrow-left me-1"></i> Back
          </button>
        </div>
      </div>

      {/* 2. Progressive Tenure Ladder & Milestone Tracker Bar */}
      <div className="credit-ladder-tracker mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-success rounded-pill px-2 py-1 small fw-bold">
                <i className="fa-solid fa-award me-1"></i> Credit Ladder: Level {repaymentCycle}
              </span>
              <strong className="text-dark small">
                {repaymentCycle === 1 ? "Starter Credit Track (30 Days & 3 Months)" : repaymentCycle === 2 ? "Bronze Track (6-Month Unlocked)" : "Gold Prime Track (Full Flexibility)"}
              </strong>
            </div>
            <p className="text-muted small mb-0" style={{ fontSize: "12px" }}>
              {repaymentCycle === 1
                ? "First-time borrowers start with 30-Day Payday Bullet or 3-Month EMI plan. Complete this loan on time to unlock 6-Month plans & higher limits!"
                : repaymentCycle === 2
                ? "1 on-time loan repaid! 6-Month tenure is now unlocked with lower monthly EMIs. Complete this cycle to unlock 12-Month plans!"
                : "Excellent repayment track record! All tenures up to 12 months unlocked with prime interest rates."}
            </p>
          </div>

          {/* Cycle Switcher for Demo / Testing */}
          <div className="d-flex align-items-center gap-1 bg-white p-1 rounded-pill border">
            <span className="text-muted small px-2 font-monospace" style={{ fontSize: "10px" }}>History Track:</span>
            {[
              { cycle: 1, label: "🌱 Cycle 1 (First-Time)" },
              { cycle: 2, label: "⭐ Cycle 2 (1 On-Time)" },
              { cycle: 3, label: "🏆 Cycle 3+ (Prime)" },
            ].map((c) => (
              <button
                key={c.cycle}
                type="button"
                className={`btn btn-xs rounded-pill px-2 py-1 fw-bold ${
                  repaymentCycle === c.cycle
                    ? "btn-primary text-white"
                    : "btn-light text-muted"
                }`}
                style={{ fontSize: "10px" }}
                onClick={() => {
                  setRepaymentCycle(c.cycle);
                  if (c.cycle === 1 && selectedTenure > 3) {
                    setSelectedTenure(3);
                  }
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Locked Tenure Notice Banner (Appears if user clicks locked tenure) */}
      {tenureLockedNotice && (
        <div className="alert alert-warning py-2 px-3 rounded-3 small mb-3 d-flex align-items-center justify-content-between animate__animated animate__fadeIn">
          <div>
            <i className="fa-solid fa-lock text-warning me-2"></i>
            <strong>Tenure Milestone Locked:</strong> {tenureLockedNotice}
          </div>
          <button type="button" className="btn-close btn-sm" onClick={() => setTenureLockedNotice("")}></button>
        </div>
      )}

      {/* 3. Mandatory Bureau Check Every Disbursal Strip */}
      <div className="p-2 px-3 rounded-3 bg-light border mb-4 d-flex flex-wrap justify-content-between align-items-center gap-2" style={{ fontSize: "11px" }}>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-primary text-white rounded-pill px-2 py-0">
            <i className="fa-solid fa-shield-halved me-1"></i> Verified
          </span>
          <span className="text-dark fw-semibold">
            Mandatory OxyLoans Credit Bureau Re-Check on Every Disbursal:
          </span>
          <span className="text-muted">
            Score: <strong className="text-success">{creditScore}</strong> • DPD History: <strong className="text-success">0 (Clean)</strong> • No Overdue Accounts
          </span>
        </div>
        <span className="text-primary fw-bold">
          <i className="fa-solid fa-circle-check text-success me-1"></i>
          Pre-Disbursal Safety Cleared
        </span>
      </div>

      {/* 4. Algorithmic Underwriting Decision Hero Banner (High Contrast) */}
      <div className="p-4 rounded-4 mb-4 text-white shadow-sm" style={{
        background: decisionEvaluation.decision === "APPROVE"
          ? "linear-gradient(135deg, #064e3b 0%, #047857 50%, #065f46 100%)"
          : decisionEvaluation.decision === "APPROVE_REDUCED_AMOUNT"
          ? "linear-gradient(135deg, #7c2d12 0%, #9a3412 50%, #78350f 100%)"
          : "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #172554 100%)"
      }}>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-white text-dark rounded-pill px-3 py-1 font-monospace fw-bold small">
                {decisionEvaluation.decision}
              </span>
              <span className="badge bg-black bg-opacity-25 text-white rounded-pill px-3 py-1 small border border-white border-opacity-25 fw-semibold">
                CIR Score: {creditScore} ({roiBand.tierLabel})
              </span>
              <span className="badge bg-black bg-opacity-25 text-white rounded-pill px-3 py-1 small border border-white border-opacity-25 fw-semibold">
                Fee: 3.0% Standard
              </span>
              {currentPricing.isCustomLenderRoi && (
                <span className="badge bg-warning text-dark rounded-pill px-3 py-1 small fw-bold">
                  Matched Lender ROI: {currentPricing.annualRoi}% p.a.
                </span>
              )}
            </div>

            <h3 className="fw-bold mb-1 text-white">
              {decisionEvaluation.decision === "APPROVE"
                ? `Algorithmic Approval Granted for ${formatINR(requestedAmount)}`
                : decisionEvaluation.decision === "APPROVE_REDUCED_AMOUNT"
                ? `Approved for Maximum Safe Capacity of ${formatINR(optimalCandidate?.amount || requestedAmount)}`
                : `Straight-Through Underwriting Assessment Active`}
            </h3>

            <p className="text-white text-opacity-90 small mb-0" style={{ maxWidth: "680px" }}>
              {decisionEvaluation.reasons[0]?.detail || "All debt service capacity, cashflow surplus, and company risk policy checks satisfied."}
            </p>
          </div>

          <div className="text-end">
            <span className="text-white text-opacity-75 small d-block">Verified Monthly Surplus</span>
            <h2 className="fw-bold text-white mb-0">{formatINR(surplus.monthlySurplus)}</h2>
            <small className="text-white text-opacity-80">Max Safe EMI: {formatINR(affordability.maxSafeNewEmi)}/mo</small>
          </div>
        </div>
      </div>

      {/* 5. Expandable Cashflow Assumption Customizer */}
      {showExpenseDrawer && (
        <div className="p-4 rounded-4 bg-light border mb-4 shadow-xs">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i className="fa-solid fa-receipt text-primary"></i>
                Borrower Monthly Cashflow & Expenditure Assumptions
              </h6>
              <small className="text-muted">Adjust living expenses or existing debt; surplus, FOIR, and safe loan limits recalculate in real-time</small>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-link text-decoration-none p-0 text-primary"
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

          <div className="row g-3">
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label small fw-bold text-dark mb-1">Existing Loan EMIs (₹)</label>
              <input
                type="number"
                step="500"
                className="form-control form-control-sm rounded-3"
                value={customCashflow.existingEmi}
                onChange={(e) => handleCashflowChange("existingEmi", e.target.value)}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label small fw-bold text-dark mb-1">Credit Card Min Dues (₹)</label>
              <input
                type="number"
                step="500"
                className="form-control form-control-sm rounded-3"
                value={customCashflow.creditCardMinDues}
                onChange={(e) => handleCashflowChange("creditCardMinDues", e.target.value)}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label small fw-bold text-dark mb-1">Monthly House Rent (₹)</label>
              <input
                type="number"
                step="500"
                className="form-control form-control-sm rounded-3"
                value={customCashflow.rent}
                onChange={(e) => handleCashflowChange("rent", e.target.value)}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label small fw-bold text-dark mb-1">Household & Utilities (₹)</label>
              <input
                type="number"
                step="500"
                className="form-control form-control-sm rounded-3"
                value={customCashflow.householdExpenses}
                onChange={(e) => handleCashflowChange("householdExpenses", e.target.value)}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">Education & Tuition (₹)</label>
              <input
                type="number"
                step="500"
                className="form-control form-control-sm rounded-3"
                value={customCashflow.educationExpenses}
                onChange={(e) => handleCashflowChange("educationExpenses", e.target.value)}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">Insurance Premiums (₹)</label>
              <input
                type="number"
                step="500"
                className="form-control form-control-sm rounded-3"
                value={customCashflow.insurance}
                onChange={(e) => handleCashflowChange("insurance", e.target.value)}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-4">
              <label className="form-label small fw-bold text-dark mb-1">Other Mandatory (₹)</label>
              <input
                type="number"
                step="500"
                className="form-control form-control-sm rounded-3"
                value={customCashflow.otherMandatory}
                onChange={(e) => handleCashflowChange("otherMandatory", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. Financial Health & Monthly Cashflow Allocation Waterfall */}
      <div className="mb-4">
        {/* 4 Metric Tiles (High Contrast) */}
        <div className="row g-3 mb-3">
          {/* Tile 1: Verified Inflow */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="p-3 rounded-4 bg-white border h-100 shadow-xs">
              <span className="text-muted small d-block">
                <i className="fa-solid fa-arrow-down-left text-success me-1"></i> Verified Inflow
              </span>
              <h4 className="fw-bold text-dark mb-1">{formatINR(verifiedInflow)}</h4>
              <span className="badge badge-fintech-success-soft small rounded-pill px-2 py-0">
                100% Salary Verified
              </span>
            </div>
          </div>

          {/* Tile 2: Existing Commitments */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="p-3 rounded-4 bg-white border h-100 shadow-xs" style={{ borderColor: "#fca5a5" }}>
              <span className="small d-block fw-semibold" style={{ color: "#991b1b" }}>
                <i className="fa-solid fa-credit-card me-1"></i> Existing Debt Outflows
              </span>
              <h4 className="fw-bold mb-1" style={{ color: "#7f1d1d" }}>-{formatINR(expenses.totalExistingObligations)}</h4>
              <span className="small" style={{ color: "#475569" }}>
                Baseline FOIR: {Math.round(affordability.baselineFOIR * 100)}%
              </span>
            </div>
          </div>

          {/* Tile 3: Living & Mandatory */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="p-3 rounded-4 bg-white border h-100 shadow-xs">
              <span className="small d-block fw-semibold" style={{ color: "#78350f" }}>
                <i className="fa-solid fa-house-user me-1"></i> Essential Living Costs
              </span>
              <h4 className="fw-bold text-dark mb-1">-{formatINR(expenses.essentialLivingExpenses + expenses.mandatoryExpenses)}</h4>
              <span className="small" style={{ color: "#475569" }}>
                Rent, Food & Mandatory
              </span>
            </div>
          </div>

          {/* Tile 4: Net Monthly Surplus */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="p-3 rounded-4 h-100 shadow-xs" style={{ backgroundColor: "#ecfdf5", border: "1.5px solid #a7f3d0" }}>
              <span className="small fw-bold d-block" style={{ color: "#065f46" }}>
                <i className="fa-solid fa-wallet me-1"></i> Net Monthly Surplus
              </span>
              <h4 className="fw-extrabold mb-1 font-monospace" style={{ color: "#064e3b" }}>{formatINR(surplus.monthlySurplus)}</h4>
              <span className="small fw-semibold" style={{ color: "#047857" }}>
                {surplusPct}% Disposable Cushion
              </span>
            </div>
          </div>
        </div>

        {/* Visual Cashflow Distribution Bar */}
        <div className="p-3 rounded-4 bg-white border shadow-xs mb-4">
          <div className="d-flex justify-content-between text-muted small fw-semibold mb-2">
            <span>Monthly Cashflow Allocation:</span>
            <span>Unencumbered Surplus: <strong className="text-success">{formatINR(surplus.monthlySurplus)}</strong></span>
          </div>

          <div className="progress rounded-pill shadow-xs" style={{ height: "14px", backgroundColor: "#f1f5f9" }}>
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

          <div className="d-flex flex-wrap gap-3 mt-2 text-muted small" style={{ fontSize: "11px" }}>
            <span className="d-inline-flex align-items-center gap-1">
              <span className="badge rounded-circle p-1 bg-danger"></span>
              Debt Commitments ({obligationsPct}%)
            </span>
            <span className="d-inline-flex align-items-center gap-1">
              <span className="badge rounded-circle p-1 bg-warning"></span>
              Living Outflows ({livingPct}%)
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
      </div>

      {/* 7. Interactive Loan Amount Slider & Progressive Tenure Selector */}
      <div className="p-4 rounded-4 bg-light border mb-4 shadow-xs">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <span className="text-muted small fw-bold text-uppercase letter-spacing-1">
              Select Desired Loan Amount
            </span>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <h2 className="fw-bold text-primary mb-0 font-monospace">{formatINR(requestedAmount)}</h2>
              <span className="badge badge-fintech-primary-soft small">
                Pre-Approved Cap: {formatINR(maxCap)}
              </span>
              <span className="badge bg-success-subtle text-success small rounded-pill px-2 py-1">
                Max Safe: {formatINR(optimalCandidate?.amount || maxCap)}
              </span>
            </div>
          </div>

          {/* Deduplicated quick preset chips */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            {presetChips.map((amt, idx) => (
              <button
                key={idx}
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
                  requestedAmount === amt
                    ? "btn-primary"
                    : "btn-outline-secondary bg-white"
                }`}
                onClick={() => setRequestedAmount(amt)}
              >
                {amt === maxCap ? `Max (${formatINR(amt)})` : formatINR(amt)}
              </button>
            ))}
          </div>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min={minCap}
          max={maxCap}
          step={1000}
          value={requestedAmount}
          onChange={(e) => setRequestedAmount(Number(e.target.value))}
          className="fintech-slider mb-2"
        />

        <div className="d-flex justify-content-between text-muted small" style={{ fontSize: "11px" }}>
          <span>Product Min: {formatINR(minCap)}</span>
          <span className="text-primary fw-semibold">
            <i className="fa-solid fa-building-shield me-1"></i>
            RBI P2P Escrow Pool #41682 Pre-Funded
          </span>
          <span>Max Eligibility: {formatINR(maxCap)}</span>
        </div>

        <hr className="my-3 opacity-25" />

        {/* Progressive Multi-Tenure Selection Bar */}
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="text-muted small fw-bold text-uppercase letter-spacing-1 mb-0">
              Select Repayment Tenure Horizon:
            </label>
            <span className="text-muted small" style={{ fontSize: "11px" }}>
              {repaymentCycle === 1 ? "Starter track: 30-Day & 3-Month unlocked" : "Higher tenures unlocked with good track record"}
            </span>
          </div>

          <div className="d-flex flex-wrap gap-2">
            {[
              { label: "30-Day Payday Bullet", tenure: 1, type: "BULLET", note: "Single Settlement" },
              { label: "3 Months", tenure: 3, type: "EMI", note: "Lowest Total Interest" },
              { label: "6 Months", tenure: 6, type: "EMI", note: "Recommended Balance", lockMilestone: "Unlocks after 1 on-time loan" },
              { label: "9 Months", tenure: 9, type: "EMI", note: "Lower Monthly EMI", lockMilestone: "Unlocks after 2 on-time loans" },
              { label: "12 Months", tenure: 12, type: "EMI", note: "Lowest Commitment", lockMilestone: "Unlocks after 2 on-time loans" },
            ].map((opt) => {
              const isAllowed = allowedTenuresForCycle.includes(opt.tenure);
              const isSelected = selectedTenure === opt.tenure && selectedOfferType === opt.type && isAllowed;

              return (
                <button
                  key={opt.tenure}
                  type="button"
                  className={`btn btn-sm rounded-3 px-3 py-2 text-start flex-grow-1 ${
                    isSelected
                      ? "btn-primary text-white shadow-sm"
                      : isAllowed
                      ? "btn-outline-secondary bg-white text-dark"
                      : "tenure-pill-locked"
                  }`}
                  onClick={() => handleTenureClick(opt.tenure, opt.type)}
                  style={{ minWidth: "140px" }}
                  title={!isAllowed ? opt.lockMilestone : undefined}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <strong className="small d-flex align-items-center gap-1">
                      {!isAllowed && <i className="fa-solid fa-lock text-muted small" style={{ fontSize: "10px" }}></i>}
                      {opt.label}
                    </strong>
                    {isSelected && <i className="fa-solid fa-circle-check small text-white"></i>}
                  </div>
                  <small className={isSelected ? "text-white opacity-90" : isAllowed ? "text-muted" : "text-muted opacity-75"} style={{ fontSize: "10px" }}>
                    {!isAllowed ? opt.lockMilestone : opt.note}
                  </small>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 8. P2P Lender & Admin Rate Confirmation (Rate Variance Window) */}
      <div className="lender-matching-card mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3 pb-3 border-bottom">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-primary text-white rounded-pill px-3 py-1 small fw-bold">
                <i className="fa-solid fa-handshake me-1"></i> OxyLoans P2P Lender Matching Flow
              </span>
              <span className={
                roiVariance < 0 ? "lender-variance-badge-discount" : roiVariance > 0 ? "lender-variance-badge-positive" : "lender-variance-badge-equal"
              }>
                {roiVariance === 0 ? "Matched at Indicative Benchmark" : roiVariance < 0 ? `Lender Discount: ${roiVariance}% p.a.` : `Lender Counter-Offer: +${roiVariance}% p.a.`}
              </span>
            </div>
            <h5 className="fw-bold text-dark mb-1">P2P Lender & Admin Rate Confirmation & Variance</h5>
            <p className="text-muted small mb-0" style={{ fontSize: "12px", maxWidth: "800px" }}>
              In OxyLoans P2P lending, your initial rate is an <strong>indicative benchmark ({roiBand.indicativeRoi}%)</strong> based on your CIR credit score of <strong>{creditScore}</strong>. Once submitted, verified institutional lenders or platform credit committee confirm the matched ROI (permissible band: <strong>{roiBand.minPermissibleRoi}% – {roiBand.maxPermissibleRoi}% p.a.</strong>). Your final EMI and agreement dynamically reflect this matched rate.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 fw-bold ${
                lenderMatchStatus === "INDICATIVE" ? "btn-primary text-white" : "btn-outline-secondary bg-white text-dark"
              }`}
              onClick={() => {
                setLenderMatchStatus("INDICATIVE");
                setConfirmedLenderRoi(roiBand.indicativeRoi);
              }}
            >
              Indicative Bureau Rate ({roiBand.indicativeRoi}%)
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 fw-bold ${
                lenderMatchStatus === "MATCHED" ? "btn-primary text-white" : "btn-outline-primary bg-white text-primary"
              }`}
              onClick={() => setLenderMatchStatus("MATCHED")}
            >
              <i className="fa-solid fa-sliders me-1"></i> Simulate Lender Match
            </button>
          </div>
        </div>

        {/* 3 Metric Comparison Blocks */}
        <div className="row g-3 mb-3">
          <div className="col-12 col-md-4">
            <div className="p-3 rounded-3 bg-white border h-100 shadow-xs">
              <span className="text-muted small d-block" style={{ fontSize: "11px" }}>
                1. Indicative Benchmark (Bureau Score {creditScore})
              </span>
              <h4 className="fw-bold text-dark mb-0 font-monospace">{roiBand.indicativeRoi}% <span className="fs-6 fw-normal text-muted">p.a.</span></h4>
              <small className="text-muted" style={{ fontSize: "11px" }}>
                {roiBand.tierLabel} • Algorithm Base
              </small>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="p-3 rounded-3 bg-white border h-100 shadow-xs" style={{ borderColor: "#bfdbfe" }}>
              <span className="small d-block fw-semibold" style={{ fontSize: "11px", color: "#1e3a8a" }}>
                2. Credit Score Permissible Band
              </span>
              <h4 className="fw-bold text-primary mb-0 font-monospace">
                {roiBand.minPermissibleRoi}% – {roiBand.maxPermissibleRoi}% <span className="fs-6 fw-normal text-muted">p.a.</span>
              </h4>
              <small className="text-muted" style={{ fontSize: "11px" }}>
                Legally capped variance for Score {creditScore}
              </small>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className={`p-3 rounded-3 border h-100 shadow-xs ${
              roiVariance < 0 ? "bg-success bg-opacity-10 border-success" : roiVariance > 0 ? "bg-warning bg-opacity-10 border-warning" : "bg-primary bg-opacity-10 border-primary"
            }`}>
              <span className="text-dark small d-block fw-bold" style={{ fontSize: "11px" }}>
                3. Confirmed Matched ROI (Current Plan)
              </span>
              <h4 className="fw-extrabold text-dark mb-0 font-monospace">
                {currentPricing.annualRoi}% <span className="fs-6 fw-normal text-muted">p.a.</span>
              </h4>
              <small className="fw-bold text-dark" style={{ fontSize: "11px" }}>
                {roiVariance === 0 ? "Matched at Benchmark (0% Variance)" : roiVariance < 0 ? `Saves ${Math.abs(roiVariance)}% interest` : `+${roiVariance}% risk adjustment`}
              </small>
            </div>
          </div>
        </div>

        {/* Quick Simulation Chips & Precision Slider */}
        <div className="p-3 bg-light rounded-3 border">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
            <span className="text-dark small fw-bold">
              <i className="fa-solid fa-gavel text-primary me-1"></i>
              Simulate Lender / Admin Counter-Offer Bids:
            </span>
            <span className="text-muted small" style={{ fontSize: "11px" }}>
              Monthly EMI dynamically updates across all tenures
            </span>
          </div>

          <div className="d-flex flex-wrap gap-2 mb-3">
            {[
              { label: `Benchmark (${roiBand.indicativeRoi}%)`, val: roiBand.indicativeRoi },
              { label: `Fast Disbursal Discount (-1.0% = ${(roiBand.indicativeRoi - 1.0).toFixed(1)}%)`, val: Math.max(roiBand.minPermissibleRoi, Number((roiBand.indicativeRoi - 1.0).toFixed(1))) },
              { label: `Institutional Match (-0.5% = ${(roiBand.indicativeRoi - 0.5).toFixed(1)}%)`, val: Math.max(roiBand.minPermissibleRoi, Number((roiBand.indicativeRoi - 0.5).toFixed(1))) },
              { label: `High Liquidity Pool (+1.0% = ${(roiBand.indicativeRoi + 1.0).toFixed(1)}%)`, val: Math.min(roiBand.maxPermissibleRoi, Number((roiBand.indicativeRoi + 1.0).toFixed(1))) },
              { label: `Upper Band (+2.0% = ${(roiBand.indicativeRoi + 2.0).toFixed(1)}%)`, val: Math.min(roiBand.maxPermissibleRoi, Number((roiBand.indicativeRoi + 2.0).toFixed(1))) },
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                className={`btn btn-xs rounded-pill px-3 py-1 small fw-semibold ${
                  lenderMatchStatus === "MATCHED" && confirmedLenderRoi === chip.val
                    ? "btn-primary text-white"
                    : "btn-outline-secondary bg-white text-dark"
                }`}
                style={{ fontSize: "11px" }}
                onClick={() => {
                  setLenderMatchStatus("MATCHED");
                  setConfirmedLenderRoi(chip.val);
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Precision ROI Slider */}
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted small font-monospace" style={{ fontSize: "11px" }}>{roiBand.minPermissibleRoi}%</span>
            <input
              type="range"
              min={roiBand.minPermissibleRoi}
              max={roiBand.maxPermissibleRoi}
              step={0.1}
              value={effectiveRoi}
              onChange={(e) => {
                setLenderMatchStatus("MATCHED");
                setConfirmedLenderRoi(Number(Number(e.target.value).toFixed(1)));
              }}
              className="fintech-slider flex-grow-1"
            />
            <span className="text-muted small font-monospace" style={{ fontSize: "11px" }}>{roiBand.maxPermissibleRoi}%</span>
            <span className="badge bg-primary text-white rounded-pill px-3 py-1 font-monospace fw-bold">
              {effectiveRoi}% p.a.
            </span>
          </div>
        </div>
      </div>

      {/* 9. 4-Way Multi-Scenario Comparative Table with Progressive Unlock State */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h6 className="fw-bold text-dark mb-0">Compare Loan Structures & Tenures</h6>
            <small className="text-muted">
              {repaymentCycle === 1
                ? "First-time borrowers can select 3-Month EMI or 30-Day Payday Bullet. Higher tenures unlock progressively with on-time repayment."
                : "Select any unlocked structure to apply it immediately to your loan offer."}
            </small>
          </div>
        </div>

        <div className="row g-3">
          {scenarioOptions.map((opt) => {
            const isOptSelected = selectedTenure === opt.tenure && selectedOfferType === opt.type && !opt.isLocked;
            return (
              <div key={opt.id} className="col-12 col-md-6 col-lg-3">
                <div
                  className={`p-3 rounded-4 border h-100 d-flex flex-column justify-content-between transition-all ${
                    opt.isLocked
                      ? "scenario-card-locked"
                      : isOptSelected
                      ? "border-primary shadow-sm cursor-pointer"
                      : "bg-white hover-shadow cursor-pointer"
                  }`}
                  onClick={() => handleTenureClick(opt.tenure, opt.type)}
                  style={{
                    borderWidth: isOptSelected ? "2px" : "1.5px",
                    backgroundColor: isOptSelected ? "#f0f7ff" : "#ffffff",
                    transform: isOptSelected ? "translateY(-2px)" : "none",
                  }}
                >
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className={`badge ${
                        opt.tagColor === "success" ? "badge-fintech-success-soft" : opt.tagColor === "warning" ? "badge-fintech-warning-soft" : "badge-fintech-primary-soft"
                      } rounded-pill px-2 py-1 small`} style={{ fontSize: "10px" }}>
                        {opt.tag}
                      </span>
                      {opt.isLocked ? (
                        <i className="fa-solid fa-lock text-muted small" title={opt.unlockMilestone}></i>
                      ) : (
                        <input
                          type="radio"
                          checked={isOptSelected}
                          onChange={() => {}}
                          className="form-check-input"
                        />
                      )}
                    </div>

                    <strong className="text-dark d-block mb-1">{opt.title}</strong>
                    <p className="small mb-3" style={{ fontSize: "11px", minHeight: "33px", color: "#475569" }}>
                      {opt.description}
                    </p>

                    <div className="p-2 rounded-3 mb-2 small" style={{ backgroundColor: isOptSelected ? "#e2eafd" : "#f1f5f9", border: "1px solid #cbd5e1" }}>
                      <div className="d-flex justify-content-between mb-1" style={{ color: "#334155" }}>
                        <span className="fw-semibold">Monthly EMI:</span>
                        <strong className="text-dark font-monospace">{formatINR(opt.pricing.emi)}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-1" style={{ color: "#334155" }}>
                        <span>Total Interest:</span>
                        <span className="text-dark fw-semibold">{formatINR(opt.pricing.totalInterest)}</span>
                      </div>
                      <div className="d-flex justify-content-between" style={{ color: "#334155" }}>
                        <span>Net In Bank:</span>
                        <strong style={{ color: "#065f46" }}>{formatINR(opt.pricing.netDisbursal)}</strong>
                      </div>
                    </div>
                  </div>

                  {opt.isLocked ? (
                    <div className="text-center mt-2">
                      <span className="badge text-dark border rounded-pill px-2 py-1 small w-100 font-monospace" style={{ fontSize: "10px", backgroundColor: "#f1f5f9", borderColor: "#cbd5e1" }}>
                        🔒 {opt.unlockMilestone}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className={`btn btn-sm rounded-pill w-100 mt-2 fw-semibold ${
                        isOptSelected ? "btn-primary" : "btn-outline-primary bg-white text-primary"
                      }`}
                    >
                      {isOptSelected ? "Selected Plan ✓" : "Choose This Plan"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 10. Single View Transparent Calculation Grid (Zero Horizontal Scroll) */}
      <div className="row g-4 mb-4">
        {/* Left Column: Complete Calculation Breakdown (Single View) */}
        <div className="col-lg-7">
          <div className="p-4 rounded-4 bg-white border h-100 shadow-xs calc-breakdown-container">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary"
                  style={{ width: "36px", height: "36px" }}
                >
                  <i className="fa-solid fa-calculator fs-6"></i>
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-0">Transparent Loan & Fee Calculation Breakdown</h6>
                  <small className="text-muted" style={{ fontSize: "11px" }}>Algorithmic straight-through calculation</small>
                </div>
              </div>
              <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 small fw-semibold">
                Straight-Through Calculation ✓
              </span>
            </div>

            {/* Zero-Scroll Calculation Grid */}
            <div className="calc-breakdown-grid">
              {/* Row 1: Principal */}
              <div className="calc-grid-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid #f1f5f9" }}>
                <div className="calc-grid-label">
                  <div className="fw-semibold text-dark" style={{ fontSize: "13.5px" }}>Sanctioned Principal</div>
                  <span className="calc-grid-subtext">Approved borrowing capital</span>
                </div>
                <div className="calc-grid-value" style={{ textAlign: "right", fontWeight: 700, fontSize: "15px" }}>
                  {formatINR(requestedAmount)}
                </div>
              </div>

              {/* Row 2: Repayment Structure */}
              <div className="calc-grid-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid #f1f5f9" }}>
                <div className="calc-grid-label">
                  <div className="fw-semibold text-dark" style={{ fontSize: "13.5px" }}>Repayment Structure</div>
                  <span className="calc-grid-subtext">Selected tenure schedule</span>
                </div>
                <div className="calc-grid-value text-dark" style={{ textAlign: "right", fontWeight: 600, fontSize: "13.5px" }}>
                  {isBullet ? "Single Bullet Settlement on Day 30" : `${selectedTenure} Equal Monthly EMIs`}
                </div>
              </div>

              {/* Row 3: APR / ROI */}
              <div className="calc-grid-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid #f1f5f9" }}>
                <div className="calc-grid-label">
                  <div className="fw-semibold text-dark" style={{ fontSize: "13.5px" }}>Annual Percentage Rate (APR / ROI)</div>
                  <span className="calc-grid-subtext">
                    {currentPricing.isCustomLenderRoi
                      ? `Lender Matched Rate (${currentPricing.annualRoi}% p.a.) • Benchmark was ${roiBand.indicativeRoi}% (Variance: ${roiVariance > 0 ? `+` : ``}${roiVariance}%) • Permissible Score Band: ${roiBand.minPermissibleRoi}% - ${roiBand.maxPermissibleRoi}%`
                      : `Indicative Benchmark (${currentPricing.annualRoi}% p.a.) based on CIR Score ${creditScore} • Capped Band: ${roiBand.minPermissibleRoi}% - ${roiBand.maxPermissibleRoi}%`}
                  </span>
                </div>
                <div className="calc-grid-value text-end">
                  <div className="fw-bold text-primary font-monospace" style={{ fontSize: "14.5px" }}>
                    {currentPricing.annualRoi}% p.a.
                  </div>
                  {currentPricing.isCustomLenderRoi ? (
                    <span className={`badge ms-1 small ${roiVariance < 0 ? "bg-success text-white" : "bg-warning text-dark"}`}>
                      {roiVariance < 0 ? "Discount" : "Counter-Offer"}
                    </span>
                  ) : (
                    <span className="badge badge-fintech-primary-soft small ms-1">Prime Tier</span>
                  )}
                </div>
              </div>

              {/* Row 4: Total Interest Payable */}
              <div className="calc-grid-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid #f1f5f9" }}>
                <div className="calc-grid-label">
                  <div className="fw-semibold text-dark" style={{ fontSize: "13.5px" }}>Total Interest Payable</div>
                  <span className="calc-grid-subtext">Accrued interest across chosen horizon</span>
                </div>
                <div className="calc-grid-value text-secondary" style={{ textAlign: "right", fontWeight: 700, fontSize: "14.5px" }}>
                  {formatINR(currentPricing.totalInterest)}
                </div>
              </div>

              {/* Row 5: Platform & Origination Fee */}
              <div className="calc-grid-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid #f1f5f9" }}>
                <div className="calc-grid-label">
                  <div className="fw-semibold text-dark" style={{ fontSize: "13.5px" }}>Platform & Origination Fee (3.0%)</div>
                  <span className="calc-grid-subtext">Fixed 3% platform origination charge + 18% GST</span>
                </div>
                <div className="calc-grid-value text-dark" style={{ textAlign: "right" }}>
                  <span className="fw-bold font-monospace" style={{ fontSize: "14.5px" }}>{formatINR(currentPricing.processingFee)}</span>
                  <span className="text-muted small ms-1" style={{ fontSize: "11px" }}>(+ {formatINR(currentPricing.gst)} GST)</span>
                </div>
              </div>

              {/* Net Disbursed Highlight Row (High Contrast Mint Box) */}
              <div
                className="calc-grid-row-highlight"
                style={{
                  background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)",
                  borderRadius: "12px",
                  padding: "14px 16px",
                  margin: "8px 0",
                  border: "1.5px solid #a7f3d0",
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.08)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle"
                    style={{ width: "38px", height: "38px", backgroundColor: "#d1fae5", color: "#065f46" }}
                  >
                    <i className="fa-solid fa-building-columns fs-6"></i>
                  </div>
                  <div>
                    <div className="fw-bold" style={{ color: "#065f46", fontSize: "14px" }}>
                      Net Amount Disbursed to Bank
                    </div>
                    <div style={{ color: "#047857", fontSize: "11px" }}>
                      Direct IMPS/NEFT disbursal into your verified account
                    </div>
                  </div>
                </div>
                <div className="text-end">
                  <div className="fw-extrabold font-monospace" style={{ color: "#064e3b", fontSize: "22px" }}>
                    {formatINR(currentPricing.netDisbursal)}
                  </div>
                  <span className="badge bg-white text-success border border-success-subtle rounded-pill small fw-semibold" style={{ fontSize: "10px" }}>
                    Instant Payout Cleared
                  </span>
                </div>
              </div>

              {/* Row 7: Total Repayable */}
              <div className="calc-grid-row calc-grid-row-total" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <div className="calc-grid-label">
                  <div className="fw-bold text-dark" style={{ fontSize: "14px" }}>Total Amount to Repay</div>
                  <span className="calc-grid-subtext">Principal + total interest payable</span>
                </div>
                <div className="calc-grid-value text-dark fs-6 fw-bold font-monospace" style={{ textAlign: "right", fontSize: "16px" }}>
                  {formatINR(currentPricing.totalPayable)}
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
              <span className="text-muted small" style={{ fontSize: "11px" }}>
                <i className="fa-solid fa-lock text-success me-1"></i>
                Zero hidden charges • 0% Prepayment / Foreclosure fee
              </span>
              <button
                type="button"
                className="btn btn-sm btn-link text-primary p-0 text-decoration-none small"
                onClick={() => setShowFormulaDetails(!showFormulaDetails)}
              >
                {showFormulaDetails ? "Hide Formulas" : "View Pure Formulas"}
              </button>
            </div>

            {showFormulaDetails && (
              <div className="p-3 bg-light rounded border mt-3 small font-monospace" style={{ fontSize: "11px" }}>
                <div className="fw-bold text-dark mb-1 font-sans-serif">
                  <i className="fa-solid fa-code text-primary me-1"></i> Decoupled Frontend Calculation Logic:
                </div>
                <div className="text-secondary">
                  <div>• MonthlyRate (r) = ({currentPricing.annualRoi} / 100) / 12 = {(currentPricing.annualRoi / 100 / 12).toFixed(5)}</div>
                  <div>• MonthlyEMI = [P × r × (1+r)^n] / [(1+r)^n - 1] = {formatINR(currentPricing.emi)}</div>
                  <div>• Fee (3.0%) = P × 0.03 = {formatINR(currentPricing.processingFee)} (+ GST {formatINR(currentPricing.gst)})</div>
                  <div>• NetDisbursal = Principal - (Fee + GST) = {formatINR(currentPricing.netDisbursal)}</div>
                  <div>• PostLoanFOIR = ({formatINR(expenses.totalExistingObligations)} + {formatINR(currentPricing.emi)}) / {formatINR(verifiedInflow)} = {projectedFoirPct}%</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Cashflow Affordability & Safe Cushion Meter */}
        <div className="col-lg-5">
          <div className="p-4 rounded-4 bg-white border h-100 shadow-xs d-flex flex-column justify-content-between affordability-container">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 text-success"
                    style={{ width: "36px", height: "36px" }}
                  >
                    <i className="fa-solid fa-chart-pie fs-6"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-0">Affordability & Debt Servicing</h6>
                    <small className="text-muted" style={{ fontSize: "11px" }}>Cashflow headroom & safety stress capacity</small>
                  </div>
                </div>
                <span className={`badge ${
                  isCommitmentSafe ? "bg-success text-white" : "bg-danger text-white"
                } rounded-pill px-3 py-1 small fw-semibold`}>
                  {isBullet
                    ? "Payday Safe ✓"
                    : isCommitmentSafe
                    ? "Within Safe Limits ✓"
                    : "Exceeds Safe EMI ✗"}
                </span>
              </div>

              {/* Monthly EMI / Payday Commitment Hero Card */}
              <div
                className="p-3 rounded-4 mb-3 text-center commitment-hero-box"
                style={{
                  background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                  border: "1.5px solid #e2e8f0",
                  boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.02)",
                }}
              >
                <span className="text-muted text-uppercase fw-bold letter-spacing-1 d-block" style={{ fontSize: "11px" }}>
                  {isBullet ? "One-Time Payday Settlement Commitment" : "Monthly EMI Commitment"}
                </span>
                <div className="d-flex justify-content-center align-items-baseline gap-1 my-1">
                  <h2 className="fw-extrabold text-primary mb-0 font-monospace" style={{ fontSize: "28px" }}>
                    {formatINR(currentPricing.emi)}
                  </h2>
                  <span className="text-muted fw-semibold" style={{ fontSize: "13px" }}>
                    {isBullet ? "on Day 30" : "/ month"}
                  </span>
                </div>
                <div className="d-flex justify-content-center align-items-center flex-wrap gap-2 mt-2">
                  <span
                    className="badge rounded-pill px-2.5 py-1 small fw-semibold"
                    style={{
                      backgroundColor: isCommitmentSafe ? "#ecfdf5" : "#fef2f2",
                      color: isCommitmentSafe ? "#065f46" : "#991b1b",
                      border: `1px solid ${isCommitmentSafe ? "#a7f3d0" : "#fca5a5"}`,
                      fontSize: "11px",
                    }}
                  >
                    {isBullet
                      ? `Takes ${paydayBurdenPct}% of Next Salary Credit`
                      : `Takes ${surplusAllocationPct}% of Surplus`}
                  </span>
                  <span className="text-muted small" style={{ fontSize: "11px" }}>
                    {isBullet
                      ? `• Disposable Headroom: ${formatINR(postSettlementPaydaySalary)}`
                      : `• Max Safe EMI: ${formatINR(affordability.maxSafeNewEmi)}`}
                  </span>
                </div>
              </div>

              {/* Surplus Cushion Indicator */}
              <div className="p-3 bg-white rounded-3 border mb-3 meter-card">
                <div className="d-flex justify-content-between align-items-center mb-1.5" style={{ fontSize: "12px" }}>
                  <span className="text-muted fw-semibold">
                    {isBullet ? "Salary Buffer Remaining on Payday:" : "Monthly Surplus Cushion Left After EMI:"}
                  </span>
                  <strong className="text-success font-monospace" style={{ fontSize: "14px" }}>
                    {isBullet
                      ? formatINR(postSettlementPaydaySalary)
                      : `${formatINR(residualBuffer)} / mo`}
                  </strong>
                </div>
                <div className="progress rounded-pill shadow-xs" style={{ height: "8px", backgroundColor: "#f1f5f9" }}>
                  <div
                    className="progress-bar rounded-pill"
                    role="progressbar"
                    style={{
                      width: `${isBullet
                        ? Math.min(100, Math.max(15, (postSettlementPaydaySalary / (verifiedInflow || 1)) * 100))
                        : Math.min(100, Math.max(10, (residualBuffer / (surplus.monthlySurplus || 1)) * 100))}%`,
                      backgroundColor: "#10b981",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-between text-muted mt-1.5" style={{ fontSize: "10.5px" }}>
                  <span>Min Buffer Required: ₹3,500</span>
                  <span className="text-success fw-semibold">
                    <i className="fa-solid fa-circle-check me-1"></i>
                    Safety Cushion: {formatINR(isBullet ? Math.max(0, postSettlementPaydaySalary - 3500) : Math.max(0, residualBuffer - 3500))} preserved
                  </span>
                </div>
              </div>

              {/* FOIR Meter (Fixed Unicode Arrow) */}
              <div className="p-3 bg-white rounded-3 border mb-3 meter-card">
                <div className="d-flex justify-content-between align-items-center mb-1.5" style={{ fontSize: "12px" }}>
                  <span className="text-muted fw-semibold">Fixed Obligation to Income (FOIR)</span>
                  <span className="fw-bold font-monospace" style={{ color: projectedFoirPct > 60 ? "#dc2626" : "#0f172a" }}>
                    {projectedFoirPct}% <span className="text-muted fw-normal" style={{ fontSize: "11px" }}>(Policy Cap: 60%)</span>
                  </span>
                </div>
                <div className="progress rounded-pill shadow-xs" style={{ height: "7px", backgroundColor: "#f1f5f9" }}>
                  <div
                    className="progress-bar rounded-pill"
                    role="progressbar"
                    style={{
                      width: `${Math.min(100, projectedFoirPct)}%`,
                      backgroundColor: projectedFoirPct > 60 ? "#dc2626" : projectedFoirPct > 50 ? "#f59e0b" : "#0040e0",
                    }}
                  />
                </div>
                <div className="d-flex justify-content-between text-muted mt-1.5" style={{ fontSize: "10.5px" }}>
                  <span>Baseline: {Math.round(affordability.baselineFOIR * 100)}%</span>
                  <span className="text-primary fw-semibold">Safe Headroom: {(60 - projectedFoirPct).toFixed(1)}%</span>
                </div>
              </div>

              {/* Destination Bank Account Confirmation */}
              <div className="p-2.5 px-3 bg-white rounded-3 border mb-3 d-flex align-items-center justify-content-between verified-bank-card" style={{ fontSize: "11.5px" }}>
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary"
                    style={{ width: "28px", height: "28px" }}
                  >
                    <i className="fa-solid fa-building-columns" style={{ fontSize: "12px" }}></i>
                  </div>
                  <div>
                    <span className="text-muted d-block" style={{ fontSize: "10px" }}>Disbursal Destination Bank:</span>
                    <strong className="text-dark">State Bank of India (•••• 1119)</strong>
                  </div>
                </div>
                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1 small fw-semibold" style={{ fontSize: "10px" }}>
                  <i className="fa-solid fa-circle-check me-1"></i> Penny-Drop Verified
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-primary rounded-pill flex-grow-1 py-2 fw-semibold"
                onClick={() => setShowKfsModal(true)}
                style={{ fontSize: "12px" }}
              >
                <i className="fa-solid fa-file-contract me-1.5"></i> View KFS
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-pill flex-grow-1 py-2 fw-semibold"
                onClick={() => setShowAmortizationModal(true)}
                style={{ fontSize: "12px" }}
              >
                <i className="fa-solid fa-calendar-days me-1.5"></i> Due Dates
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 9. "Why this amount & structure?" Explainability Section */}
      <div className="p-4 rounded-4 bg-white border mb-4 shadow-xs">
        <div className="d-flex align-items-center gap-2 mb-3">
          <i className="fa-solid fa-lightbulb text-warning fs-5"></i>
          <div>
            <h6 className="fw-bold text-dark mb-0">Why This Amount & Loan Structure? (Transparent Underwriting)</h6>
            <small className="text-muted">How our automated intelligence engine computed your borrowing ceiling and terms</small>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-md-4">
            <div className="p-3 rounded-3 bg-light border h-100">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge rounded-circle p-1 bg-success text-white">1</span>
                <strong className="text-dark small">Surplus Capacity Multiplier</strong>
              </div>
              <p className="text-muted small mb-0" style={{ fontSize: "12px", lineHeight: "1.5" }}>
                Your verified net surplus of <strong>{formatINR(surplus.monthlySurplus)}</strong> supports a safe monthly EMI of up to <strong>{formatINR(affordability.maxSafeNewEmi)}</strong> (55% allocation limit).
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-3 rounded-3 bg-light border h-100">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge rounded-circle p-1 bg-primary text-white">2</span>
                <strong className="text-dark small">Debt Burden (FOIR) Cap</strong>
              </div>
              <p className="text-muted small mb-0" style={{ fontSize: "12px", lineHeight: "1.5" }}>
                Total obligations remain at <strong>{projectedFoirPct}%</strong> of income, comfortably within the 60% institutional risk ceiling, leaving an emergency buffer of <strong>{formatINR(residualBuffer)}</strong>.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="p-3 rounded-3 bg-light border h-100">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="badge rounded-circle p-1 bg-info text-white">3</span>
                <strong className="text-dark small">Risk-Tiered Pricing</strong>
              </div>
              <p className="text-muted small mb-0" style={{ fontSize: "12px", lineHeight: "1.5" }}>
                Your CIR Bureau score of <strong>{creditScore}</strong> qualifies you for Prime+ pricing with a minimal risk premium, keeping your annual reducing rate at <strong>{currentPricing.annualRoi}% p.a.</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      

      {/* 11. Stress Resilience & Institution Safeguard Badges */}
      <div className="p-3 rounded-4 bg-white border mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3 shadow-xs">
        <div className="d-flex flex-wrap align-items-center gap-3">
          <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 small">
            <i className="fa-solid fa-shield-check me-1"></i>
            Macro Stress Tested ({stressTests.failCount === 0 ? "6/6 Passed" : `${6 - stressTests.failCount}/6 Passed`})
          </span>
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1 small">
            <i className="fa-solid fa-building-columns me-1"></i>
            ICICI Escrow Pool #41682 Funded
          </span>
          <span className="badge bg-info-subtle text-info border border-info-subtle rounded-pill px-3 py-1 small">
            <i className="fa-solid fa-ban me-1"></i>
            Zero Foreclosure Penalties
          </span>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-link text-muted p-0 text-decoration-none small"
          onClick={() => setShowTelemetryDrawer(!showTelemetryDrawer)}
        >
          <i className="fa-solid fa-microchip me-1"></i>
          {showTelemetryDrawer ? "Hide Advanced Risk Telemetry" : "View Full Underwriting Telemetry"}
        </button>
      </div>

      {/* Optional Advanced Telemetry Inspector Drawer */}
      {showTelemetryDrawer && (
        <div className="mb-4">
          <div className="row g-4">
            <div className="col-lg-6">
              <StressTestMatrix stressResults={stressTests} />
            </div>
            <div className="col-lg-6">
              <CompanySafetyCard safetyResult={portfolioSafety} />
            </div>
          </div>
        </div>
      )}

      {/* 12. Monthly Amortization Schedule Modal */}
      {showAmortizationModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 p-3 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <div>
                  <h5 className="modal-title fw-bold text-dark">Repayment Schedule & Amortization Breakdown</h5>
                  <span className="text-muted small">
                    Loan: {formatINR(requestedAmount)} • Tenure: {isBullet ? "30 Days (Single Bullet)" : `${selectedTenure} Months`} • Net Disbursal: {formatINR(currentPricing.netDisbursal)}
                  </span>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowAmortizationModal(false)}></button>
              </div>

              <div className="modal-body small">
                <div className="table-responsive">
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
                          <td className="font-monospace text-primary fw-semibold">{row.dueDateStr}</td>
                          <td className="fw-bold text-dark">{formatINR(row.emiAmount)}</td>
                          <td className="text-success">{formatINR(row.principalPart)}</td>
                          <td className="text-muted">{formatINR(row.interestPart)}</td>
                          <td className="font-monospace fw-semibold">{formatINR(row.closingBalance)}</td>
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

                <div className="p-3 bg-light rounded-3 mt-3">
                  <small className="text-muted d-block">
                    <i className="fa-solid fa-circle-info text-primary me-1"></i>
                    Auto-debit will be initiated from your verified bank account via NPCI eNACH on the 5th of each month. 0% charge for early foreclosure or prepayment.
                  </small>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-secondary rounded-3 w-100 fw-bold" onClick={() => setShowAmortizationModal(false)}>
                  Close Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 13. Key Fact Statement (KFS) Modal */}
      {showKfsModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 p-3 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <div>
                  <h5 className="modal-title fw-bold text-dark">Key Fact Statement (KFS) for Digital Lending</h5>
                  <span className="text-muted small">Mandatory RBI Regulatory Disclosure for Borrower: {profileData.name || "Borrower"}</span>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowKfsModal(false)}></button>
              </div>

              <div className="modal-body small">
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
                      <td className="fw-bold text-end">ICICI Bank Escrow Pool #41682 (RBI Certified P2P)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-primary rounded-3 w-100 fw-bold" onClick={() => setShowKfsModal(false)}>
                  I Acknowledge Key Fact Statement (KFS) Terms
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 14. Bottom Sticky CTA Summary Strip */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-3 border-top">
        <div>
          <span className="text-muted small d-block">Selected Repayment Plan</span>
          <strong className="text-dark fs-6">
            {isBullet
              ? `Single Bullet Settlement (${formatINR(currentPricing.totalPayable)} on Day 30)`
              : `${selectedTenure}-Month Plan (${formatINR(currentPricing.emi)} / month)`}
          </strong>
          <span className="text-muted small d-block">
            Net In Bank: <strong className="text-success">{formatINR(currentPricing.netDisbursal)}</strong>
          </span>
        </div>

        <button
          type="button"
          onClick={handleConfirmOffer}
          className="btn btn-primary px-4 py-3 rounded-3 fw-bold text-white shadow-sm"
          style={{ backgroundColor: "#0040e0", borderColor: "#0040e0" }}
        >
          Confirm Offer & Proceed to eSign / eNACH
          <i className="fa-solid fa-arrow-right ms-2"></i>
        </button>
      </div>
    </div>
  );
};

export default InstantLoanStepOfferSelection;
