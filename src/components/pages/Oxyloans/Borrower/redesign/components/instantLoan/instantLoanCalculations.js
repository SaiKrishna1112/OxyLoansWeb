/**
 * Production-Grade Intelligent Loan Assessment & Lending Decision Calculation Engine
 * 
 * Pure, decoupled calculation functions for:
 * - Income, Expenses, Surplus, and Confidence Scoring
 * - Affordability, Debt-to-Income (DTI), and FOIR
 * - Credit Risk, Stability, Fraud, and Recovery Scoring
 * - Probability of Default (PD), Loss Given Default (LGD), Expected Loss (EL)
 * - Candidate Loan & Tenure Optimization with Constraint Elimination
 * - Dynamic Pricing, Fees, and Transparent APR Simulation
 * - Stress Testing under 6 Macro/Personal Scenarios
 * - Company Safety, Concentration, and Liquidity Limits
 * - Decision Classification (APPROVE, APPROVE_REDUCED_AMOUNT, REVIEW, DECLINE)
 * - Human-Readable Reason Codes & Explainability Matrix
 * 
 * DISCLAIMER: This is a frontend-only intelligent underwriting simulation engine
 * for demonstration, prototyping, and risk policy configuration.
 */

import { DEFAULT_RULES_CONFIG } from "./instantLoanRules.js";

// Format INR currency utility
export const formatINR = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return "0.0%";
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * 1. Income Analysis & Confidence Scoring
 */
export const calculateIncome = (inputs, rules) => {
  const netSalary = Math.max(0, Number(inputs.netSalary || 0));
  const otherIncome = Math.max(0, Number(inputs.otherIncome || 0));

  const salaryStatus = inputs.salaryVerificationStatus || "VERIFIED"; // "VERIFIED" | "DECLARED" | "UNVERIFIED"
  const otherStatus = inputs.otherIncomeVerificationStatus || "DECLARED";

  // Haircuts based on verification status
  const salaryMultiplier = salaryStatus === "VERIFIED" ? 1.0 : salaryStatus === "DECLARED" ? 0.85 : 0.65;
  const otherMultiplier = otherStatus === "VERIFIED" ? rules.otherIncomeHaircut || 0.75 : otherStatus === "DECLARED" ? 0.50 : 0.30;

  const verifiedSalary = Math.round(netSalary * salaryMultiplier);
  const verifiedOtherIncome = Math.round(otherIncome * otherMultiplier);
  const totalVerifiedIncome = verifiedSalary + verifiedOtherIncome;
  const totalDeclaredIncome = netSalary + otherIncome;

  // Data Confidence Score (0 - 100%)
  const statusWeights = { VERIFIED: 100, DECLARED: 60, UNVERIFIED: 25 };
  const salaryConfidence = statusWeights[salaryStatus] || 50;
  const otherConfidence = statusWeights[otherStatus] || 50;
  const bankingConfidence = inputs.bankingCashflowVerified ? 100 : 50;
  const panConfidence = inputs.panVerified ? 100 : 40;

  const overallConfidence = Math.round(
    salaryConfidence * 0.40 +
    bankingConfidence * 0.30 +
    panConfidence * 0.20 +
    otherConfidence * 0.10
  );

  return {
    netSalary,
    otherIncome,
    salaryStatus,
    otherStatus,
    verifiedSalary,
    verifiedOtherIncome,
    totalVerifiedIncome,
    totalDeclaredIncome,
    overallConfidence,
  };
};

/**
 * 2. Expense & Obligation Analysis
 */
export const calculateExpenses = (inputs) => {
  const existingEmi = Math.max(0, Number(inputs.existingEmi || 0));
  const creditCardMinDues = Math.max(0, Number(inputs.creditCardMinDues || 0));
  const rent = Math.max(0, Number(inputs.rent || 0));
  const householdExpenses = Math.max(0, Number(inputs.householdExpenses || 0));
  const educationExpenses = Math.max(0, Number(inputs.educationExpenses || 0));
  const insurance = Math.max(0, Number(inputs.insurance || 0));
  const otherMandatory = Math.max(0, Number(inputs.otherMandatory || 0));

  const totalExistingObligations = existingEmi + creditCardMinDues;
  const essentialLivingExpenses = rent + householdExpenses + educationExpenses;
  const mandatoryExpenses = insurance + otherMandatory;
  const totalMonthlyOutflows = totalExistingObligations + essentialLivingExpenses + mandatoryExpenses;

  return {
    existingEmi,
    creditCardMinDues,
    rent,
    householdExpenses,
    educationExpenses,
    insurance,
    otherMandatory,
    totalExistingObligations,
    essentialLivingExpenses,
    mandatoryExpenses,
    totalMonthlyOutflows,
  };
};

/**
 * 3. Dynamic Surplus Calculation Engine
 */
export const calculateSurplus = (incomeData, expenseData, rules) => {
  const verifiedIncome = incomeData.totalVerifiedIncome;
  const totalOutflows = expenseData.totalMonthlyOutflows;

  const monthlySurplus = Math.max(0, verifiedIncome - totalOutflows);
  const surplusRatio = verifiedIncome > 0 ? (monthlySurplus / verifiedIncome) : 0;
  const minRequiredSurplus = rules.minSurplusThreshold || 8000;
  const isSurplusAdequate = monthlySurplus >= minRequiredSurplus;

  return {
    verifiedIncome,
    totalOutflows,
    monthlySurplus,
    surplusRatio,
    minRequiredSurplus,
    isSurplusAdequate,
  };
};

/**
 * 4. Affordability Engine & Debt Burden
 */
export const calculateAffordability = (incomeData, expenseData, surplusData, rules, proposedEmi = 0) => {
  const verifiedIncome = incomeData.totalVerifiedIncome;
  const totalExistingObligations = expenseData.totalExistingObligations;
  const totalOutflows = expenseData.totalMonthlyOutflows;
  const monthlySurplus = surplusData.monthlySurplus;

  // Ratios before new loan
  const baselineDTI = verifiedIncome > 0 ? (totalExistingObligations / verifiedIncome) : 1;
  const baselineFOIR = verifiedIncome > 0 ? (totalExistingObligations / verifiedIncome) : 1;
  const baselineTotalBurden = verifiedIncome > 0 ? (totalOutflows / verifiedIncome) : 1;

  // Ratios after new proposed loan EMI
  const newObligations = totalExistingObligations + proposedEmi;
  const newOutflows = totalOutflows + proposedEmi;
  const newDTI = verifiedIncome > 0 ? (newObligations / verifiedIncome) : 1;
  const newFOIR = verifiedIncome > 0 ? (newObligations / verifiedIncome) : 1;
  const newTotalBurden = verifiedIncome > 0 ? (newOutflows / verifiedIncome) : 1;

  // Maximum Safe New EMI:
  // Must respect max surplus allocation ratio (e.g. 55% of surplus)
  // AND must respect residual buffer floor (leaving at least minSurplusBuffer)
  // AND must not push debt obligations (FOIR) beyond policy cap (e.g. 60%)
  const maxSafeEmiBySurplus = Math.round(monthlySurplus * (rules.maxSurplusAllocationRatio || 0.55));
  const maxSafeEmiByBuffer = Math.max(0, Math.round(monthlySurplus - (rules.minSurplusBuffer || 3500)));
  const maxFoirHeadroom = Math.max(0, Math.round((verifiedIncome * (rules.maxFoirLimit || 0.60)) - totalExistingObligations));
  const maxSafeNewEmi = Math.max(0, Math.min(maxSafeEmiBySurplus, maxSafeEmiByBuffer, maxFoirHeadroom));

  // Multiplier / Capacity Mode:
  let loanCapacityByPolicy = 0;
  if (rules.capacityPolicyMode === "SURPLUS_MULTIPLIER") {
    // Configurable multiplier (e.g. 5x surplus)
    loanCapacityByPolicy = Math.round(monthlySurplus * (rules.surplusMultiplier || 5.0));
  } else if (rules.capacityPolicyMode === "SAFE_EMI_CASHFLOW") {
    loanCapacityByPolicy = Math.round(maxSafeNewEmi * (rules.defaultTenureMonths || 6) * 0.95);
  } else {
    // Balanced tiered hybrid
    loanCapacityByPolicy = Math.round((monthlySurplus * (rules.surplusMultiplier || 5.0) + (maxSafeNewEmi * 6)) / 2);
  }

  // Constrain by min/max loan limits
  const maxSafeLoanAmount = Math.max(
    0,
    Math.min(rules.maxLoanAmount || 250000, loanCapacityByPolicy)
  );

  return {
    baselineDTI,
    baselineFOIR,
    baselineTotalBurden,
    newDTI,
    newFOIR,
    newTotalBurden,
    maxSafeEmiBySurplus,
    maxSafeEmiByBuffer,
    maxFoirHeadroom,
    maxSafeNewEmi,
    loanCapacityByPolicy,
    maxSafeLoanAmount,
    isEmiAffordable: proposedEmi <= maxSafeNewEmi && newFOIR <= (rules.maxFoirLimit || 0.60),
  };
};

/**
 * 5. Dynamic Multi-Dimensional Risk Scoring Engine
 */
export const calculateRisk = (inputs, incomeData, surplusData, rules) => {
  const creditScore = Math.max(300, Math.min(900, Number(inputs.creditScore || 750)));
  const dpdHistory = inputs.dpdHistory || "0"; // "0" | "30+" | "60+" | "90+"
  const activeLoans = Math.max(0, Number(inputs.activeLoansCount || 0));
  const recentEnquiries = Math.max(0, Number(inputs.recentEnquiriesCount || 0));
  const creditUtilization = Math.max(0, Math.min(100, Number(inputs.creditUtilizationPct || 30)));
  const bouncedPayments = Math.max(0, Number(inputs.bouncedPaymentsCount || 0));
  const employmentYears = Math.max(0, Number(inputs.employmentStabilityYears || 2));
  const incomeStability = inputs.incomeStability || "HIGH"; // "HIGH" | "MEDIUM" | "LOW"
  const previousInternal = inputs.previousInternalRepayment || "CLEAN"; // "CLEAN" | "MINOR_DELAY" | "SEVERE_DELAY" | "NONE"

  // 1. Credit Risk Score (0 - 100, where 100 is best)
  let creditScoreNorm = ((creditScore - 300) / 600) * 100;
  if (dpdHistory === "30+") creditScoreNorm -= 15;
  if (dpdHistory === "60+") creditScoreNorm -= 35;
  if (dpdHistory === "90+") creditScoreNorm -= 60;
  if (recentEnquiries > 4) creditScoreNorm -= 12;
  else if (recentEnquiries > 2) creditScoreNorm -= 6;
  if (creditUtilization > 85) creditScoreNorm -= 20;
  else if (creditUtilization > 65) creditScoreNorm -= 10;
  if (bouncedPayments > 0) creditScoreNorm -= (bouncedPayments * 15);
  const creditRiskScore = Math.max(0, Math.min(100, Math.round(creditScoreNorm)));

  // 2. Affordability Score (0 - 100)
  const surplusRatio = surplusData.surplusRatio;
  let affordabilityScore = Math.round(surplusRatio * 160);
  if (affordabilityScore > 100) affordabilityScore = 100;
  if (surplusData.monthlySurplus < rules.minSurplusThreshold) affordabilityScore = Math.min(affordabilityScore, 40);

  // 3. Income Stability Score (0 - 100)
  let stabilityScore = 70;
  if (incomeStability === "HIGH") stabilityScore += 20;
  if (incomeStability === "LOW") stabilityScore -= 30;
  if (employmentYears >= 3) stabilityScore += 10;
  else if (employmentYears < 1) stabilityScore -= 15;
  const incomeStabilityScore = Math.max(0, Math.min(100, stabilityScore));

  // 4. Fraud & Anomaly Score (0 - 100, where 100 is pristine / zero fraud)
  let fraudScore = 95;
  const fraudIndicators = Math.max(0, Number(inputs.fraudIndicatorsCount || 0));
  fraudScore -= (fraudIndicators * 30);
  if (!inputs.panVerified) fraudScore -= 20;
  if (inputs.disposableEmailOrPhone) fraudScore -= 25;
  const finalFraudScore = Math.max(0, Math.min(100, fraudScore));

  // 5. Recovery Strength Score (0 - 100)
  let recoveryScore = 75;
  if (previousInternal === "CLEAN") recoveryScore += 15;
  else if (previousInternal === "MINOR_DELAY") recoveryScore -= 20;
  else if (previousInternal === "SEVERE_DELAY") recoveryScore -= 45;
  if (surplusData.monthlySurplus > 25000) recoveryScore += 10;
  else if (surplusData.monthlySurplus < 10000) recoveryScore -= 15;
  const finalRecoveryScore = Math.max(0, Math.min(100, recoveryScore));

  // Composite Weighted Risk Score (0 - 100)
  const weights = rules.riskWeights || {
    credit: 0.35,
    affordability: 0.25,
    stability: 0.15,
    recovery: 0.15,
    fraud: 0.10,
  };
  const compositeScore = Math.round(
    creditRiskScore * weights.credit +
    affordabilityScore * weights.affordability +
    incomeStabilityScore * weights.stability +
    finalRecoveryScore * weights.recovery +
    finalFraudScore * weights.fraud
  );

  // Risk Tier Classification
  let riskTier = "TIER_4_SUBPRIME";
  if (compositeScore >= 80) riskTier = "TIER_1_SUPER_PRIME";
  else if (compositeScore >= 70) riskTier = "TIER_2_PRIME";
  else if (compositeScore >= 55) riskTier = "TIER_3_NEAR_PRIME";

  return {
    creditRiskScore,
    affordabilityScore,
    incomeStabilityScore,
    fraudScore: finalFraudScore,
    recoveryScore: finalRecoveryScore,
    compositeScore,
    riskTier,
  };
};

/**
 * 6. Probability of Default (PD), Loss Given Default (LGD), Expected Loss (EL)
 */
export const calculatePD = (riskResult, inputs, rules) => {
  const composite = riskResult.compositeScore;
  const bounced = Math.max(0, Number(inputs.bouncedPaymentsCount || 0));
  const dpd = inputs.dpdHistory || "0";

  // Calibrated logistic proxy mapping (from ~1.2% up to 24%)
  let basePD = 0.015; // 1.5% baseline
  if (composite >= 85) basePD = 0.012;
  else if (composite >= 75) basePD = 0.024;
  else if (composite >= 65) basePD = 0.045;
  else if (composite >= 55) basePD = 0.078;
  else if (composite >= 45) basePD = 0.125;
  else basePD = 0.195;

  // Penalties for real behavioral triggers
  const bounceMultiplier = 1 + (bounced * 0.18);
  const dpdMultiplier = dpd === "30+" ? 1.35 : dpd === "60+" ? 1.70 : dpd === "90+" ? 2.20 : 1.0;

  const pd = Math.min(0.40, basePD * bounceMultiplier * dpdMultiplier);

  // LGD based on recovery score
  const recoveryScore = riskResult.recoveryScore;
  const baselineLgd = rules.baselineLGD || 0.65; // 65% for unsecured
  const recoveryAdjustment = (50 - recoveryScore) / 200; // -0.15 to +0.15
  const lgd = Math.max(0.45, Math.min(0.80, baselineLgd + recoveryAdjustment));

  return {
    pd,
    lgd,
    pdPercentage: (pd * 100).toFixed(2),
    lgdPercentage: (lgd * 100).toFixed(1),
  };
};

export const calculateExpectedLoss = (pd, lgd, ead) => {
  const expectedLoss = Math.round(pd * lgd * ead);
  const elRate = ead > 0 ? (expectedLoss / ead) : 0;
  return {
    ead,
    expectedLoss,
    elRate,
    elRatePercentage: (elRate * 100).toFixed(2),
  };
};

/**
 * 7. Recovery Capacity across Tenures
 */
export const calculateRecoveryCapacity = (surplusData, tenureMonths, rules) => {
  const monthlySurplus = surplusData.monthlySurplus;
  const conservativeSurplusAllocation = rules.recoverySurplusRatio || 0.50;
  const safeMonthlyRepaymentCapacity = Math.round(monthlySurplus * conservativeSurplusAllocation);
  const cumulativeRepaymentCapacity = safeMonthlyRepaymentCapacity * tenureMonths;

  return {
    tenureMonths,
    safeMonthlyRepaymentCapacity,
    cumulativeRepaymentCapacity,
  };
};

/**
 * Dynamic Lender & Admin Confirmed ROI Variance Engine
 * Calibrates permissible P2P matching rate bounds according to borrower credit score
 */
export const calculateLenderRoiBand = (creditScore = 750, customBaseRoi = null) => {
  const score = Number(creditScore) || 750;

  let tier = "TIER_2_PRIME";
  let tierLabel = "Prime Tier";
  let minPermissibleRoi = 15.0;
  let maxPermissibleRoi = 22.0;
  let defaultIndicativeRoi = 18.0;
  let maxVariance = 3.0;
  let description = "Prime credit profile. Eligible for institutional lender matching between 15.0% and 22.0% p.a.";

  if (score >= 780) {
    tier = "TIER_1_SUPER_PRIME";
    tierLabel = "Super Prime (Tier 1)";
    minPermissibleRoi = 12.0;
    maxPermissibleRoi = 18.0;
    defaultIndicativeRoi = 15.5;
    maxVariance = 2.5;
    description = "Super prime bureau track. Qualifies for lowest institutional auction bids (12.0% - 18.0% p.a.).";
  } else if (score >= 720) {
    tier = "TIER_2_PRIME";
    tierLabel = "Prime (Tier 2)";
    minPermissibleRoi = 15.0;
    maxPermissibleRoi = 22.0;
    defaultIndicativeRoi = 18.0;
    maxVariance = 3.0;
    description = "Strong credit score with clean repayment. Matched lender rates vary between 15.0% - 22.0% p.a.";
  } else if (score >= 650) {
    tier = "TIER_3_NEAR_PRIME";
    tierLabel = "Near Prime (Tier 3)";
    minPermissibleRoi = 19.0;
    maxPermissibleRoi = 26.0;
    defaultIndicativeRoi = 22.5;
    maxVariance = 3.5;
    description = "Moderate risk bureau profile. Permissible lender counter-offers range between 19.0% - 26.0% p.a.";
  } else {
    tier = "TIER_4_SUBPRIME";
    tierLabel = "Subprime (Tier 4)";
    minPermissibleRoi = 24.0;
    maxPermissibleRoi = 32.0;
    defaultIndicativeRoi = 27.5;
    maxVariance = 4.0;
    description = "Subprime profile. Higher risk premium applies with permissible bidding between 24.0% - 32.0% p.a.";
  }

  const indicativeRoi = (customBaseRoi !== null && customBaseRoi !== undefined && !isNaN(customBaseRoi))
    ? Number(Number(customBaseRoi).toFixed(2))
    : defaultIndicativeRoi;

  return {
    creditScore: score,
    tier,
    tierLabel,
    minPermissibleRoi,
    maxPermissibleRoi,
    indicativeRoi,
    maxVariance,
    description,
    clampToBand: (roi) => Math.max(minPermissibleRoi, Math.min(maxPermissibleRoi, Number(roi))),
  };
};

/**
 * 8. Dynamic Pricing, Fees & Illustrative APR
 */
export const calculatePricing = (principal, tenureMonths, riskTier, pd, rules, overrideRoi = null) => {
  const p = Math.max(0, principal);
  const n = Math.max(1, tenureMonths);

  // Pricing components (Annual %)
  const pricingConfig = rules?.pricingComponents || {
    baseRate: 10.50,
    operatingCost: 2.25,
    collectionCost: 1.50,
    capitalCost: 2.75,
    targetMargin: 3.50,
  };

  // Risk premium scaling by tier & PD
  let tierPremium = 1.0;
  if (riskTier === "TIER_1_SUPER_PRIME") tierPremium = 0.0;
  else if (riskTier === "TIER_2_PRIME") tierPremium = 2.0;
  else if (riskTier === "TIER_3_NEAR_PRIME") tierPremium = 5.5;
  else tierPremium = 9.5;

  const eclPremium = Math.min(8.0, Number((pd * 100 * 0.75).toFixed(2)));

  const computedAnnualRoi = Number((
    pricingConfig.baseRate +
    pricingConfig.operatingCost +
    pricingConfig.collectionCost +
    pricingConfig.capitalCost +
    pricingConfig.targetMargin +
    tierPremium +
    eclPremium
  ).toFixed(2));

  // If lender or admin counter-offer ROI is provided, use it; otherwise use computed algorithmic ROI
  const annualRoi = (overrideRoi !== null && overrideRoi !== undefined && !isNaN(overrideRoi))
    ? Number(Number(overrideRoi).toFixed(2))
    : computedAnnualRoi;

  // Monthly reducing rate
  const monthlyRate = (annualRoi / 100) / 12;

  // Monthly EMI: P * r * (1+r)^n / ((1+r)^n - 1)
  let emi = 0;
  if (n === 1) {
    // Bullet 30-day
    emi = Math.round(p * (1 + monthlyRate));
  } else {
    const factor = Math.pow(1 + monthlyRate, n);
    emi = Math.round((p * monthlyRate * factor) / (factor - 1));
  }

  const totalPayable = n === 1 ? emi : emi * n;
  const totalInterest = Math.max(0, totalPayable - p);

  // Processing Fee & GST (3.0% Standard)
  const feeRate = rules?.processingFeeRate || 0.030; // 3.0%
  const processingFee = Math.max(500, Math.round(p * feeRate));
  const gst = Math.round(processingFee * 0.18);
  const netDisbursal = Math.max(0, p - processingFee - gst);

  // Estimated annualized cost (Illustrative UI Placeholder)
  const totalCharges = totalInterest + processingFee + gst;
  const illustrativeApr = p > 0 ? Number(((totalCharges / p) / (n / 12) * 100).toFixed(2)) : annualRoi;

  // Company Margin Breakdown
  const revenueFromLoan = totalInterest + processingFee;
  const estimatedCreditCost = Math.round(p * pd * (rules?.baselineLGD || 0.65));
  const estimatedServicingCost = Math.round(p * 0.025);
  const estimatedCompanyMargin = Math.round(revenueFromLoan - estimatedCreditCost - estimatedServicingCost);

  return {
    principal: p,
    tenureMonths: n,
    annualRoi,
    computedAnnualRoi,
    isCustomLenderRoi: (overrideRoi !== null && overrideRoi !== undefined && !isNaN(overrideRoi)),
    monthlyRate,
    emi,
    totalInterest,
    totalPayable,
    processingFee,
    gst,
    netDisbursal,
    illustrativeApr,
    pricingBreakdown: {
      baseRate: pricingConfig.baseRate,
      operatingCost: pricingConfig.operatingCost,
      collectionCost: pricingConfig.collectionCost,
      capitalCost: pricingConfig.capitalCost,
      targetMargin: pricingConfig.targetMargin,
      tierPremium,
      eclPremium,
    },
    companyEconomics: {
      revenueFromLoan,
      estimatedCreditCost,
      estimatedServicingCost,
      estimatedCompanyMargin,
      marginPercent: p > 0 ? Number(((estimatedCompanyMargin / p) * 100).toFixed(1)) : 0,
    },
  };
};

/**
 * 9. Company Safety, Exposure & Concentration Engine
 */
export const calculatePortfolioRisk = (inputs, candidateAmount, rules, safetyContext = {}) => {
  const p = candidateAmount;
  const currentBorrowerExposure = Number(safetyContext.currentBorrowerExposure || 0);
  const currentEmployerExposure = Number(safetyContext.currentEmployerExposure || 3800000);
  const currentGeoExposure = Number(safetyContext.currentGeoExposure || 7800000);
  const partnerEscrowPoolBalance = Number(safetyContext.partnerEscrowPoolBalance || 48500000);

  const limits = rules.safetyLimits || {
    maxSingleBorrowerExposure: 250000,
    maxEmployerConcentration: 5000000,
    maxGeoConcentration: 10000000,
    partnerEscrowPoolLimit: 50000000,
    minLiquidityBuffer: 2500000,
  };

  const newBorrowerExposure = currentBorrowerExposure + p;
  const newEmployerExposure = currentEmployerExposure + p;
  const newGeoExposure = currentGeoExposure + p;
  const availableLiquidity = partnerEscrowPoolBalance - p;

  const borrowerExposurePassed = newBorrowerExposure <= limits.maxSingleBorrowerExposure;
  const employerPassed = newEmployerExposure <= limits.maxEmployerConcentration;
  const geoPassed = newGeoExposure <= limits.maxGeoConcentration;
  const liquidityPassed = availableLiquidity >= limits.minLiquidityBuffer;

  const safetyViolations = [];
  if (!borrowerExposurePassed) {
    safetyViolations.push(`Exceeds single borrower limit (${formatINR(limits.maxSingleBorrowerExposure)})`);
  }
  if (!employerPassed) {
    safetyViolations.push(`Exceeds company employer concentration cap (${formatINR(limits.maxEmployerConcentration)})`);
  }
  if (!geoPassed) {
    safetyViolations.push(`Exceeds regional geography concentration cap (${formatINR(limits.maxGeoConcentration)})`);
  }
  if (!liquidityPassed) {
    safetyViolations.push(`Exceeds current liquidity reserve buffer threshold`);
  }

  // Safety Score (0 - 100)
  const employerRatio = newEmployerExposure / limits.maxEmployerConcentration;
  const geoRatio = newGeoExposure / limits.maxGeoConcentration;
  const borrowerRatio = newBorrowerExposure / limits.maxSingleBorrowerExposure;

  let safetyScore = 100;
  if (employerRatio > 0.85) safetyScore -= 20;
  if (geoRatio > 0.85) safetyScore -= 15;
  if (borrowerRatio > 0.80) safetyScore -= 20;
  if (safetyViolations.length > 0) safetyScore = Math.min(safetyScore, 45);

  return {
    newBorrowerExposure,
    newEmployerExposure,
    newGeoExposure,
    availableLiquidity,
    borrowerExposurePassed,
    employerPassed,
    geoPassed,
    liquidityPassed,
    isSafe: safetyViolations.length === 0,
    safetyViolations,
    companySafetyScore: Math.max(0, safetyScore),
    limits,
  };
};

/**
 * 10. Stress Testing Module (6 Adverse Personal / Macroeconomic Scenarios)
 */
export const runStressTests = (incomeData, expenseData, proposedLoan, riskResult, rules) => {
  const baseIncome = incomeData?.totalVerifiedIncome || 0;
  const baseDebt = expenseData?.totalExistingObligations || 0;
  const baseOutflows = expenseData?.totalMonthlyOutflows || 0;
  const baseLiving = expenseData?.essentialLivingExpenses || 0;
  const proposedEmi = proposedLoan?.emi || 0;
  const principal = proposedLoan?.principal || 0;
  const basePD = riskResult?.pd || 0.035;

  const scenarios = [
    {
      id: "STRESS_INCOME_SHOCK",
      title: "Severe Salary Cut (-20%)",
      description: "Tests repayment resiliency if borrower experiences 20% income reduction.",
      stressedIncome: Math.round(baseIncome * 0.80),
      stressedDebt: baseDebt,
      stressedOutflows: baseOutflows,
      stressedPD: basePD * 1.5,
    },
    {
      id: "STRESS_EMI_SPIKE",
      title: "Existing Debt Surge (+25% EMI)",
      description: "Simulates floating rate hike or sudden new external debt burden.",
      stressedIncome: baseIncome,
      stressedDebt: Math.round(baseDebt * 1.25),
      stressedOutflows: baseOutflows + Math.round(baseDebt * 0.25),
      stressedPD: basePD * 1.4,
    },
    {
      id: "STRESS_INFLATION",
      title: "Living Expense Inflation (+30%)",
      description: "Severe inflation shock in household, rent, and utility expenditures.",
      stressedIncome: baseIncome,
      stressedDebt: baseDebt,
      stressedOutflows: baseOutflows + Math.round(baseLiving * 0.30),
      stressedPD: basePD * 1.3,
    },
    {
      id: "STRESS_DELAY",
      title: "Cashflow Delay Shock",
      description: "Salary delay of 15 days forcing debt servicing from surplus reserves.",
      stressedIncome: Math.round(baseIncome * 0.88),
      stressedDebt: baseDebt,
      stressedOutflows: baseOutflows,
      stressedPD: basePD * 1.6,
    },
    {
      id: "STRESS_RECOVERY_DROP",
      title: "Surplus Capacity Impairment (-30%)",
      description: "Sudden medical or emergency burden consuming 30% of monthly surplus.",
      stressedIncome: baseIncome,
      stressedDebt: baseDebt,
      stressedOutflows: baseOutflows + Math.round(Math.max(0, baseIncome - baseOutflows) * 0.30),
      stressedPD: basePD * 1.5,
    },
    {
      id: "STRESS_MACRO_DEFAULT",
      title: "Macroeconomic Credit Shock (+50% PD)",
      description: "Widespread industry downturn triggering heightened credit default waves.",
      stressedIncome: baseIncome,
      stressedDebt: baseDebt,
      stressedOutflows: baseOutflows,
      stressedPD: basePD * 2.0,
    },
  ];

  const results = scenarios.map((sc) => {
    const stressedSurplus = Math.max(0, sc.stressedIncome - sc.stressedOutflows);
    const stressedDebtTotal = sc.stressedDebt + proposedEmi;
    const stressedFOIR = sc.stressedIncome > 0 ? (stressedDebtTotal / sc.stressedIncome) : 1;
    const isEmiCovered = stressedSurplus >= proposedEmi;
    const isFoirSafe = stressedFOIR <= (rules?.stressedFoirLimit || 0.75);

    let status = "PASS";
    if (!isEmiCovered || stressedFOIR > 0.75) {
      status = "FAIL";
    } else if (!isFoirSafe || stressedSurplus < proposedEmi * 1.15) {
      status = "WARNING";
    }

    const stressedEL = Math.round(sc.stressedPD * 0.70 * principal);

    return {
      ...sc,
      stressedSurplus,
      stressedFOIR: Number((stressedFOIR * 100).toFixed(1)),
      stressedPD: Number((sc.stressedPD * 100).toFixed(2)),
      stressedEL,
      status,
    };
  });

  const failCount = results.filter((r) => r.status === "FAIL").length;
  const warningCount = results.filter((r) => r.status === "WARNING").length;

  return {
    scenarios: results,
    overallStressPass: failCount === 0,
    failCount,
    warningCount,
  };
};

/**
 * 11. Candidate Loan Evaluator & Optimizer
 */
export const calculateCandidateLoan = (amount, tenure, riskResult, rules, incomeData, expenseData, surplusData, safetyContext) => {
  const pricing = calculatePricing(amount, tenure, riskResult.riskTier, riskResult.pd, rules);
  const emi = pricing.emi;

  const affordability = calculateAffordability(incomeData, expenseData, surplusData, rules, emi);
  const expectedLossData = calculateExpectedLoss(riskResult.pd, riskResult.lgd, amount);
  const portfolioSafety = calculatePortfolioRisk(null, amount, rules, safetyContext);
  const recoveryCapacity = calculateRecoveryCapacity(surplusData, tenure, rules);

  // Constraint Checks
  const violations = [];

  // Constraint 1: FOIR Cap
  if (affordability.newFOIR > (rules.maxFoirLimit || 0.60)) {
    violations.push(`New FOIR (${(affordability.newFOIR * 100).toFixed(1)}%) exceeds policy cap (${((rules.maxFoirLimit || 0.60) * 100).toFixed(0)}%)`);
  }

  // Constraint 2: Safe EMI vs Surplus
  if (emi > affordability.maxSafeNewEmi) {
    violations.push(`Monthly EMI (${formatINR(emi)}) exceeds max safe EMI threshold (${formatINR(affordability.maxSafeNewEmi)})`);
  }

  // Constraint 3: Minimum Surplus Buffer
  const remainingSurplus = surplusData.monthlySurplus - emi;
  const minBuffer = rules.minSurplusBuffer || 3500;
  if (remainingSurplus < minBuffer) {
    violations.push(`Residual surplus (${formatINR(remainingSurplus)}) is below minimum required safety buffer (${formatINR(minBuffer)})`);
  }

  // Constraint 4: Maximum PD Ceiling
  if (riskResult.pd > (rules.maxAllowedPD || 0.10)) {
    violations.push(`Calculated PD (${(riskResult.pd * 100).toFixed(2)}%) exceeds maximum acceptable risk tolerance (${((rules.maxAllowedPD || 0.10) * 100).toFixed(1)}%)`);
  }

  // Constraint 5: Portfolio & Company Safety Limits
  if (!portfolioSafety.isSafe) {
    violations.push(...portfolioSafety.safetyViolations);
  }

  // Constraint 6: Min/Max Loan Limits
  if (amount < (rules.minLoanAmount || 10000)) {
    violations.push(`Amount below product minimum (${formatINR(rules.minLoanAmount || 10000)})`);
  }
  if (amount > (rules.maxLoanAmount || 250000)) {
    violations.push(`Amount exceeds product maximum (${formatINR(rules.maxLoanAmount || 250000)})`);
  }

  const isEligible = violations.length === 0;

  return {
    amount,
    tenure,
    pricing,
    affordability,
    expectedLossData,
    portfolioSafety,
    recoveryCapacity,
    isEligible,
    violations,
    primaryViolation: violations[0] || null,
  };
};

/**
 * 12. Candidate Matrix Generator & Optimizer
 */
export const generateCandidateMatrix = (
  requestedAmount = 50000,
  requestedTenure = 6,
  riskResult = {},
  rules = {},
  incomeData = {},
  expenseData = {},
  surplusData = {},
  safetyContext = {}
) => {
  let targetTenure = 6;
  let riskObj = riskResult;
  let ruleObj = rules;
  let incObj = incomeData;
  let expObj = expenseData;
  let surObj = surplusData;
  let safetyObj = safetyContext;

  // Handle legacy signature where 2nd argument was riskResult
  if (typeof requestedTenure === "object" && requestedTenure !== null) {
    riskObj = requestedTenure;
    ruleObj = riskResult || {};
    incObj = rules || {};
    expObj = incomeData || {};
    surObj = expenseData || {};
    safetyObj = surplusData || {};
    targetTenure = Number(incObj?.requestedTenure || 6);
  } else {
    targetTenure = Number(requestedTenure || 6);
  }

  const reqAmt = Math.max(0, Number(requestedAmount || 50000));
  const tenures = [3, 6, 9, 12, 18, 24];
  const maxCap = ruleObj?.maxLoanAmount || 250000;
  const minCap = ruleObj?.minLoanAmount || 10000;

  // Discrete candidate amounts to test
  const step = 10000;
  const candidateAmounts = new Set();
  candidateAmounts.add(minCap);
  if (reqAmt >= minCap && reqAmt <= maxCap) {
    candidateAmounts.add(reqAmt);
  }

  for (let a = minCap; a <= maxCap; a += step) {
    candidateAmounts.add(a);
  }

  const sortedAmounts = Array.from(candidateAmounts).sort((a, b) => a - b);
  const matrix = [];

  let highestEligibleOverall = null;
  let highestEligibleAtRequestedTenure = null;
  let requestedCandidate = null;

  sortedAmounts.forEach((amt) => {
    tenures.forEach((tenure) => {
      const evaluation = calculateCandidateLoan(
        amt,
        tenure,
        riskObj,
        ruleObj,
        incObj,
        expObj,
        surObj,
        safetyObj
      );
      matrix.push(evaluation);

      // Match exact requested candidate
      if (amt === reqAmt && tenure === targetTenure) {
        requestedCandidate = evaluation;
      }

      if (evaluation.isEligible) {
        // Track overall highest eligible across all tenures
        if (!highestEligibleOverall || amt > highestEligibleOverall.amount) {
          highestEligibleOverall = evaluation;
        } else if (amt === highestEligibleOverall.amount && tenure < highestEligibleOverall.tenure) {
          // Prefer shorter tenure for same amount to reduce cumulative interest
          highestEligibleOverall = evaluation;
        }

        // Track highest eligible specifically at target requested tenure
        if (tenure === targetTenure) {
          if (!highestEligibleAtRequestedTenure || amt > highestEligibleAtRequestedTenure.amount) {
            highestEligibleAtRequestedTenure = evaluation;
          }
        }
      }
    });
  });

  // Ensure requested candidate exists even if out of regular grid
  if (!requestedCandidate) {
    requestedCandidate = calculateCandidateLoan(
      reqAmt,
      targetTenure,
      riskObj,
      ruleObj,
      incObj,
      expObj,
      surObj,
      safetyObj
    );
  }

  // Determine optimal candidate recommendation:
  // 1. If requested candidate is eligible, offer exactly what was requested.
  // 2. Otherwise, if eligible at requested tenure exists, offer highest eligible at requested tenure (reduced amount).
  // 3. Otherwise, offer highest eligible overall across tenures (restructured tenure).
  // 4. Fallback to requestedCandidate (contains explicit violation diagnostics).
  let highestEligibleCandidate = null;
  if (requestedCandidate && requestedCandidate.isEligible) {
    highestEligibleCandidate = requestedCandidate;
  } else if (highestEligibleAtRequestedTenure && highestEligibleAtRequestedTenure.isEligible) {
    highestEligibleCandidate = highestEligibleAtRequestedTenure;
  } else if (highestEligibleOverall && highestEligibleOverall.isEligible) {
    highestEligibleCandidate = highestEligibleOverall;
  }

  return {
    matrix,
    highestEligibleCandidate: highestEligibleCandidate || requestedCandidate,
    highestEligibleAtRequestedTenure,
    highestEligibleOverall,
    requestedCandidate,
  };
};

/**
 * 13. Decision Engine & Human-Readable Reason Codes
 */
export const evaluateDecision = (
  requestedAmount = 50000,
  requestedTenure = 6,
  optimalCandidate = null,
  riskResult = {},
  affordabilityResult = {},
  surplusResult = {},
  stressResults = { failCount: 0, scenarios: [] },
  portfolioResult = { isSafe: true, safetyViolations: [] },
  rules = {}
) => {
  const reasons = [];
  let decision = "DECLINE";

  const hardScoreCutoff = rules?.hardCreditScoreCutoff || 620;
  const isScoreBelowCutoff = (riskResult?.creditRiskScore || 0) < Math.round((hardScoreCutoff - 300) / 6);
  const minSurplus = rules?.minSurplusThreshold || 8000;

  // 1. Hard Declines
  if ((surplusResult?.monthlySurplus || 0) < minSurplus) {
    decision = "DECLINE";
    reasons.push({
      code: "SURPLUS_INSUFFICIENT",
      title: "Monthly Cashflow Surplus Below Mandatory Policy Floor",
      detail: `Verified net surplus of ${formatINR(surplusResult?.monthlySurplus || 0)} does not meet the minimum required underwriting threshold of ${formatINR(minSurplus)}.`,
      impact: "HIGH",
    });
  } else if ((riskResult?.fraudScore || 100) < 50) {
    decision = "DECLINE";
    reasons.push({
      code: "FRAUD_ANOMALY_DETECTED",
      title: "Critical Identity or Behavioral Anomaly Flagged",
      detail: "Application triggered automated fraud anomaly heuristics (mismatched identity / high-velocity queries).",
      impact: "CRITICAL",
    });
  } else if (isScoreBelowCutoff) {
    decision = "DECLINE";
    reasons.push({
      code: "BUREAU_SCORE_BELOW_CUTOFF",
      title: "Credit Score Below Underwriting Floor",
      detail: `Credit risk score is below the mandatory underwriting cutoff threshold of ${hardScoreCutoff}.`,
      impact: "HIGH",
    });
  } else if ((riskResult?.compositeScore || 0) < 45) {
    decision = "DECLINE";
    reasons.push({
      code: "CREDIT_RISK_EXCESSIVE",
      title: "Underwriting Score Below Lending Cutoff",
      detail: `Composite risk score (${riskResult?.compositeScore || 0}/100) is below the minimum viable credit acceptance tier.`,
      impact: "HIGH",
    });
  } else if (!optimalCandidate || !optimalCandidate.isEligible || (optimalCandidate.amount || 0) <= 0) {
    decision = "DECLINE";
    reasons.push({
      code: "NO_VIABLE_CANDIDATE",
      title: "No Risk-Compliant Loan Structure Found",
      detail: optimalCandidate?.primaryViolation || "All simulated loan amount and tenure candidates violated one or more essential credit, FOIR, or recovery constraints.",
      impact: "HIGH",
    });
  } else {
    // 2. Conditional Approvals or Reviews
    const isStressFailed = (stressResults?.failCount || 0) >= 4;
    const isConfidenceLow = (riskResult?.overallConfidence || 100) < 65 || (riskResult?.incomeStabilityScore || 100) < 50;

    if (isStressFailed || isConfidenceLow) {
      decision = "REVIEW";
      if (isStressFailed) {
        reasons.push({
          code: "STRESS_TEST_VULNERABILITY",
          title: "Sensitive to Macroeconomic Stress Scenarios",
          detail: `${stressResults?.failCount || 0} adverse stress scenarios failed. Underwriter manual review or collateral enhancement recommended.`,
          impact: "MEDIUM",
        });
      }
      if (isConfidenceLow) {
        if ((riskResult?.overallConfidence || 100) < 65) {
          reasons.push({
            code: "DATA_CONFIDENCE_BELOW_PAR",
            title: "Self-Declared Data Requires Document Verification",
            detail: "Data confidence level is below automated straight-through processing standard (requires salary slip / bank statement upload).",
            impact: "MEDIUM",
          });
        }
        if ((riskResult?.incomeStabilityScore || 100) < 50) {
          reasons.push({
            code: "INCOME_STABILITY_MARGINAL",
            title: "Variable Income Pattern Requires Validation",
            detail: "Self-employed or irregular income pattern requires manual review of recent cashflow statements.",
            impact: "MEDIUM",
          });
        }
      }
    } else if (optimalCandidate.amount < requestedAmount) {
      decision = "APPROVE_REDUCED_AMOUNT";
      reasons.push({
        code: "AMOUNT_TRIMMED_TO_SAFE_CAP",
        title: "Requested Amount Exceeded Safe Capacity Constraints",
        detail: `Requested ${formatINR(requestedAmount)} exceeded safe debt servicing limit. Approved for maximum compliant limit of ${formatINR(optimalCandidate.amount)}.`,
        impact: "POSITIVE_REDUCED",
      });
    } else {
      decision = "APPROVE";
      reasons.push({
        code: "FULL_PRIME_APPROVAL",
        title: "All Underwriting Policies and Capacity Checks Satisfied",
        detail: `Borrower satisfies income verification, surplus ratio, credit score (${riskResult?.creditRiskScore || 0}/100), and all company exposure rules.`,
        impact: "POSITIVE",
      });
    }
  }

  // Add supplementary advisory reasons
  if (optimalCandidate && optimalCandidate.amount < requestedAmount) {
    if (affordabilityResult && affordabilityResult.newFOIR > 0.50) {
      reasons.push({
        code: "FOIR_HEADROOM_CONSTRAINED",
        title: "Debt-to-Income Concentration Limit Reached",
        detail: `Current obligations absorb ${Math.round((affordabilityResult.baselineFOIR || 0) * 100)}% of income, capping additional credit leverage.`,
        impact: "INFO",
      });
    }
    if (portfolioResult && !portfolioResult.isSafe) {
      reasons.push({
        code: "PORTFOLIO_CONCENTRATION_GUARD",
        title: "Institutional Exposure Guard Active",
        detail: (portfolioResult.safetyViolations || []).join("; "),
        impact: "INFO",
      });
    }
  }

  return {
    decision,
    reasons,
    isApproved: decision === "APPROVE" || decision === "APPROVE_REDUCED_AMOUNT",
    isReview: decision === "REVIEW",
    isDeclined: decision === "DECLINE",
  };
};

/**
 * 14. Master Comprehensive Underwriting Orchestration Function
 * Runs the entire end-to-end intelligence engine in one synchronous call.
 */
export const runComprehensiveUnderwriting = (inputs = {}, rules = {}, safetyContext = {}) => {
  const activeRules = { ...DEFAULT_RULES_CONFIG, ...rules };
  const income = calculateIncome(inputs, activeRules);
  const expenses = calculateExpenses(inputs);
  const surplus = calculateSurplus(income, expenses, activeRules);
  const risk = calculateRisk(inputs, income, surplus, activeRules);
  const pdData = calculatePD(risk, inputs, activeRules);
  const fullRisk = { ...risk, ...pdData, overallConfidence: income.overallConfidence };

  const requestedAmount = Math.max(activeRules.minLoanAmount || 10000, Number(inputs?.requestedAmount || 50000));
  const requestedTenure = Math.max(1, Number(inputs?.requestedTenure || 6));

  // Affordability baseline
  const affordability = calculateAffordability(income, expenses, surplus, activeRules);

  // Generate candidate matrix and find optimal loan
  const {
    matrix,
    highestEligibleCandidate,
    highestEligibleAtRequestedTenure,
    highestEligibleOverall,
    requestedCandidate,
  } = generateCandidateMatrix(
    requestedAmount,
    requestedTenure,
    fullRisk,
    activeRules,
    income,
    expenses,
    surplus,
    safetyContext
  );

  // Active proposed candidate:
  // If highestEligibleCandidate exists, use it. Otherwise fallback to calculating candidate loan for requested or min amount.
  const activeCandidate = highestEligibleCandidate || requestedCandidate || calculateCandidateLoan(
    requestedAmount,
    requestedTenure,
    fullRisk,
    activeRules,
    income,
    expenses,
    surplus,
    safetyContext
  );

  // Stress tests on proposed loan
  const stressTests = runStressTests(income, expenses, activeCandidate.pricing, fullRisk, activeRules);

  // Portfolio Safety
  const portfolioSafety = calculatePortfolioRisk(inputs, activeCandidate.amount, activeRules, safetyContext);

  // Master Decision
  const decisionEvaluation = evaluateDecision(
    requestedAmount,
    requestedTenure,
    activeCandidate,
    fullRisk,
    activeCandidate.affordability,
    surplus,
    stressTests,
    portfolioSafety,
    activeRules
  );

  return {
    timestamp: new Date().toISOString(),
    inputs,
    income,
    expenses,
    surplus,
    risk: fullRisk,
    affordability,
    candidateMatrix: matrix,
    optimalCandidate: activeCandidate,
    highestEligibleAtRequestedTenure,
    highestEligibleOverall,
    requestedCandidate,
    requestedAmount,
    requestedTenure,
    stressTests,
    portfolioSafety,
    decisionEvaluation,
  };
};
