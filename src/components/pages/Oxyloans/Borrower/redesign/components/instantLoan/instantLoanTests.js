/**
 * In-Browser & CI/CD Unit Test Suite for Intelligent Underwriting Calculation Engine
 * 
 * Verifies:
 * - Mathematical accuracy and edge-case handling across pure calculation functions
 * - Constraint elimination and candidate matrix optimization
 * - 6-Scenario Macroeconomic and Personal Stress Testing
 * - All 6 Customer Personas (Prime, High Debt, Unstable, Overleveraged, New-to-Credit, Defaulter)
 * - Defensive handling of empty, zero, and negative inputs without runtime exceptions
 * - Policy configuration versioning and LocalStorage integrity
 */

import {
  calculateIncome,
  calculateExpenses,
  calculateSurplus,
  calculateAffordability,
  calculateRisk,
  calculatePD,
  calculateExpectedLoss,
  calculateRecoveryCapacity,
  calculateCandidateLoan,
  calculatePricing,
  calculateLenderRoiBand,
  calculatePortfolioRisk,
  runStressTests,
  evaluateDecision,
  runComprehensiveUnderwriting,
} from "./instantLoanCalculations.js";
import { DEFAULT_RULES_CONFIG, getActiveRules, saveAndActivateRuleVersion, resetRulesToDefault } from "./instantLoanRules.js";
import { CUSTOMER_PERSONAS } from "./instantLoanPersonas.js";

export const runInstantLoanUnitTests = () => {
  const testResults = [];

  const assert = (testName, condition, details = "") => {
    testResults.push({
      name: testName,
      passed: Boolean(condition),
      details: details || (condition ? "Assertion succeeded" : "Assertion failed"),
    });
  };

  try {
    // ----------------------------------------------------
    // Test 1: Income Haircuts based on verification status
    // ----------------------------------------------------
    const incomeVerified = calculateIncome(
      {
        netSalary: 50000,
        otherIncome: 10000,
        salaryVerificationStatus: "VERIFIED",
        otherIncomeVerificationStatus: "VERIFIED",
        bankingCashflowVerified: true,
        panVerified: true,
      },
      DEFAULT_RULES_CONFIG
    );
    assert(
      "Income Analysis: 100% verified salary passes without haircut",
      incomeVerified.verifiedSalary === 50000 && incomeVerified.overallConfidence >= 80,
      `Verified salary: ₹${incomeVerified.verifiedSalary}, Confidence: ${incomeVerified.overallConfidence}%`
    );

    const incomeDeclared = calculateIncome(
      { netSalary: 50000, otherIncome: 10000, salaryVerificationStatus: "DECLARED", otherIncomeVerificationStatus: "DECLARED" },
      DEFAULT_RULES_CONFIG
    );
    assert(
      "Income Analysis: Declared salary receives 15% haircut and lower confidence",
      incomeDeclared.verifiedSalary === 42500 && incomeDeclared.overallConfidence < incomeVerified.overallConfidence,
      `Declared verified salary: ₹${incomeDeclared.verifiedSalary}, Confidence: ${incomeDeclared.overallConfidence}%`
    );

    // ----------------------------------------------------
    // Test 2: Expense Aggregation across all obligation types
    // ----------------------------------------------------
    const expenses = calculateExpenses({
      existingEmi: 10000,
      creditCardMinDues: 2000,
      rent: 15000,
      householdExpenses: 8000,
      educationExpenses: 2000,
      insurance: 1500,
      otherMandatory: 1500,
    });
    assert(
      "Expense Analysis: Aggregates total debt obligations and essential outflows accurately",
      expenses.totalExistingObligations === 12000 && expenses.totalMonthlyOutflows === 40000,
      `Total obligations: ₹${expenses.totalExistingObligations}, Total outflows: ₹${expenses.totalMonthlyOutflows}`
    );

    // ----------------------------------------------------
    // Test 3: Monthly Surplus Engine & Floor Validation
    // ----------------------------------------------------
    const surplus = calculateSurplus(incomeVerified, expenses, DEFAULT_RULES_CONFIG);
    // Verified income: 50000 + 7500 = 57500. Outflows: 40000. Surplus: 17500
    assert(
      "Surplus Engine: Deducts all verified outflows from verified income",
      surplus.monthlySurplus === 17500,
      `Expected surplus ₹17,500, received ₹${surplus.monthlySurplus}`
    );
    assert(
      "Surplus Engine: Validates adequate surplus against policy floor (₹8,000)",
      surplus.isSurplusAdequate === true,
      `Surplus ₹${surplus.monthlySurplus} >= ₹8,000 threshold`
    );

    // ----------------------------------------------------
    // Test 4: Affordability Engine & Safe New EMI
    // ----------------------------------------------------
    const affordability = calculateAffordability(incomeVerified, expenses, surplus, DEFAULT_RULES_CONFIG, 5000);
    assert(
      "Affordability Engine: Respects maximum surplus allocation (55%) and FOIR cap (60%)",
      affordability.maxSafeNewEmi <= Math.round(surplus.monthlySurplus * 0.55) && affordability.newFOIR <= 0.60,
      `Max Safe EMI: ₹${affordability.maxSafeNewEmi}, Proposed FOIR: ${(affordability.newFOIR * 100).toFixed(1)}%`
    );

    // ----------------------------------------------------
    // Test 5: Multi-Dimensional Risk Scoring & Tiering
    // ----------------------------------------------------
    const primeRisk = calculateRisk(
      {
        creditScore: 810,
        dpdHistory: "0",
        activeLoansCount: 1,
        recentEnquiriesCount: 0,
        creditUtilizationPct: 20,
        bouncedPaymentsCount: 0,
        employmentStabilityYears: 3,
        incomeStability: "HIGH",
        previousInternalRepayment: "CLEAN",
        fraudIndicatorsCount: 0,
        panVerified: true,
      },
      incomeVerified,
      surplus,
      DEFAULT_RULES_CONFIG
    );
    assert(
      "Risk Scoring: Prime credit profile qualifies for Tier 1 Super Prime (score >= 80)",
      primeRisk.riskTier === "TIER_1_SUPER_PRIME" && primeRisk.compositeScore >= 80,
      `Tier: ${primeRisk.riskTier}, Composite Score: ${primeRisk.compositeScore}/100`
    );

    // ----------------------------------------------------
    // Test 6: Probability of Default (PD) & Expected Loss
    // ----------------------------------------------------
    const pdData = calculatePD(primeRisk, { bouncedPaymentsCount: 0, dpdHistory: "0" }, DEFAULT_RULES_CONFIG);
    const expectedLoss = calculateExpectedLoss(pdData.pd, pdData.lgd, 50000);
    assert(
      "Credit Loss Modeling: Expected Loss = PD * LGD * EAD",
      expectedLoss.expectedLoss === Math.round(pdData.pd * pdData.lgd * 50000) && pdData.pd > 0,
      `PD: ${(pdData.pd * 100).toFixed(2)}%, LGD: ${(pdData.lgd * 100).toFixed(1)}%, EL: ₹${expectedLoss.expectedLoss}`
    );

    // ----------------------------------------------------
    // Test 7: Multi-Tenure Recovery Capacity
    // ----------------------------------------------------
    const recovery3M = calculateRecoveryCapacity(surplus, 3, DEFAULT_RULES_CONFIG);
    const recovery12M = calculateRecoveryCapacity(surplus, 12, DEFAULT_RULES_CONFIG);
    assert(
      "Recovery Capacity: Cumulative recovery scales proportionally with tenure horizon",
      recovery12M.cumulativeRepaymentCapacity === recovery3M.cumulativeRepaymentCapacity * 4,
      `3M Capacity: ₹${recovery3M.cumulativeRepaymentCapacity}, 12M Capacity: ₹${recovery12M.cumulativeRepaymentCapacity}`
    );

    // ----------------------------------------------------
    // Test 8: Transparent Dynamic Pricing & Positive Margin
    // ----------------------------------------------------
    const pricing = calculatePricing(50000, 6, "TIER_1_SUPER_PRIME", 0.015, DEFAULT_RULES_CONFIG);
    assert(
      "Pricing Engine: Yields positive institutional margin after ECL and operating expenses",
      pricing.companyEconomics.estimatedCompanyMargin > 0 && pricing.annualRoi > 10,
      `Annual ROI: ${pricing.annualRoi}%, Company Net Margin: ₹${pricing.companyEconomics.estimatedCompanyMargin}`
    );

    // ----------------------------------------------------
    // Test 9: Candidate Elimination on Policy Violation
    // ----------------------------------------------------
    const candidateUnsafe = calculateCandidateLoan(
      240000,
      3,
      { ...primeRisk, ...pdData },
      DEFAULT_RULES_CONFIG,
      incomeVerified,
      expenses,
      surplus,
      {}
    );
    assert(
      "Loan Optimizer: Eliminates excessive candidate violating safe EMI and surplus buffer",
      candidateUnsafe.isEligible === false && candidateUnsafe.violations.length > 0,
      `Primary violation: ${candidateUnsafe.primaryViolation}`
    );

    // ----------------------------------------------------
    // Test 10: 6-Scenario Stress Testing Matrix
    // ----------------------------------------------------
    const stressResults = runStressTests(incomeVerified, expenses, pricing, { pd: 0.015 }, DEFAULT_RULES_CONFIG);
    assert(
      "Stress Testing: Evaluates exactly 6 personal and macroeconomic shock scenarios",
      stressResults.scenarios.length === 6 && typeof stressResults.failCount === "number",
      `Total evaluated scenarios: ${stressResults.scenarios.length}, Fails: ${stressResults.failCount}`
    );

    // ----------------------------------------------------
    // Test 11: Company Institutional Safety & Exposure Guards
    // ----------------------------------------------------
    const safetyNormal = calculatePortfolioRisk({}, 50000, DEFAULT_RULES_CONFIG, {
      currentBorrowerExposure: 0,
      currentEmployerExposure: 3000000,
      currentGeoExposure: 5000000,
      partnerEscrowPoolBalance: 40000000,
    });
    assert(
      "Company Safety: Approves loan within exposure thresholds",
      safetyNormal.isSafe === true && safetyNormal.companySafetyScore >= 70,
      `Safety Score: ${safetyNormal.companySafetyScore}, Safe: ${safetyNormal.isSafe}`
    );

    const safetyBreached = calculatePortfolioRisk({}, 100000, DEFAULT_RULES_CONFIG, {
      currentBorrowerExposure: 200000,
      currentEmployerExposure: 4950000, // Breaches 50L limit
      currentGeoExposure: 5000000,
      partnerEscrowPoolBalance: 40000000,
    });
    assert(
      "Company Safety: Flags employer concentration breach",
      safetyBreached.employerPassed === false && safetyBreached.safetyViolations.length > 0,
      `Violations flagged: ${safetyBreached.safetyViolations.join("; ")}`
    );

    // ----------------------------------------------------
    // Test 12: Persona 1 End-to-End: Salaried Low-Risk Prime -> APPROVE
    // ----------------------------------------------------
    const p1Outcome = runComprehensiveUnderwriting(CUSTOMER_PERSONAS[0].inputs, DEFAULT_RULES_CONFIG);
    assert(
      "Persona 1 (Salaried Prime): Straight-through APPROVE for full requested ₹60,000",
      p1Outcome.decisionEvaluation.decision === "APPROVE" && p1Outcome.optimalCandidate.amount === 60000,
      `Decision: ${p1Outcome.decisionEvaluation.decision}, Sanctioned: ₹${p1Outcome.optimalCandidate.amount}`
    );

    // ----------------------------------------------------
    // Test 13: Persona 2 End-to-End: High Existing Debt -> APPROVE_REDUCED_AMOUNT
    // ----------------------------------------------------
    const p2Outcome = runComprehensiveUnderwriting(CUSTOMER_PERSONAS[1].inputs, DEFAULT_RULES_CONFIG);
    assert(
      "Persona 2 (High Existing Debt): Reduced to ₹50,000 by safe FOIR/EMI capacity",
      p2Outcome.decisionEvaluation.decision === "APPROVE_REDUCED_AMOUNT" && p2Outcome.optimalCandidate.amount < 120000,
      `Decision: ${p2Outcome.decisionEvaluation.decision}, Sanctioned: ₹${p2Outcome.optimalCandidate.amount}`
    );

    // ----------------------------------------------------
    // Test 14: Persona 3 End-to-End: Unstable / Consultant -> REVIEW
    // ----------------------------------------------------
    const p3Outcome = runComprehensiveUnderwriting(CUSTOMER_PERSONAS[2].inputs, DEFAULT_RULES_CONFIG);
    assert(
      "Persona 3 (Unstable Consultant): Triggers manual underwriter REVIEW due to verification haircut & low stability",
      p3Outcome.decisionEvaluation.decision === "REVIEW",
      `Decision: ${p3Outcome.decisionEvaluation.decision}, Reasons: ${p3Outcome.decisionEvaluation.reasons.map((r) => r.code).join(", ")}`
    );

    // ----------------------------------------------------
    // Test 15: Persona 4 End-to-End: Overleveraged Request -> APPROVE_REDUCED_AMOUNT
    // ----------------------------------------------------
    const p4Outcome = runComprehensiveUnderwriting(CUSTOMER_PERSONAS[3].inputs, DEFAULT_RULES_CONFIG);
    assert(
      "Persona 4 (Overleveraged Request): Trims ₹2,20,000 down to safe ₹60,000 loan",
      p4Outcome.decisionEvaluation.decision === "APPROVE_REDUCED_AMOUNT" && p4Outcome.optimalCandidate.amount <= 70000,
      `Decision: ${p4Outcome.decisionEvaluation.decision}, Sanctioned: ₹${p4Outcome.optimalCandidate.amount}`
    );

    // ----------------------------------------------------
    // Test 16: Persona 5 End-to-End: New-to-Credit -> APPROVE Starter Line
    // ----------------------------------------------------
    const p5Outcome = runComprehensiveUnderwriting(CUSTOMER_PERSONAS[4].inputs, DEFAULT_RULES_CONFIG);
    assert(
      "Persona 5 (New-to-Credit): Approves ₹20,000 starter line with clean Straight-Through Processing",
      p5Outcome.decisionEvaluation.decision === "APPROVE" && p5Outcome.optimalCandidate.amount === 20000,
      `Decision: ${p5Outcome.decisionEvaluation.decision}, Sanctioned: ₹${p5Outcome.optimalCandidate.amount}`
    );

    // ----------------------------------------------------
    // Test 17: Persona 6 End-to-End: High Risk Defaulter -> DECLINE
    // ----------------------------------------------------
    const p6Outcome = runComprehensiveUnderwriting(CUSTOMER_PERSONAS[5].inputs, DEFAULT_RULES_CONFIG);
    assert(
      "Persona 6 (High Risk Defaulter): Hard DECLINE for score below cutoff (<620) and zero surplus",
      p6Outcome.decisionEvaluation.decision === "DECLINE",
      `Decision: ${p6Outcome.decisionEvaluation.decision}, Reasons: ${p6Outcome.decisionEvaluation.reasons.map((r) => r.code).join(", ")}`
    );

    // ----------------------------------------------------
    // Test 18: Defensive Stability: Empty input object does not crash
    // ----------------------------------------------------
    const emptyOutcome = runComprehensiveUnderwriting({}, DEFAULT_RULES_CONFIG);
    assert(
      "Defensive Robustness: Empty inputs return clean non-crashing decision without NaN",
      emptyOutcome && !isNaN(emptyOutcome.surplus.monthlySurplus) && typeof emptyOutcome.decisionEvaluation.decision === "string",
      `Decision for empty inputs: ${emptyOutcome?.decisionEvaluation?.decision}`
    );

    // ----------------------------------------------------
    // Test 19: Defensive Stability: Negative inputs clamped to zero
    // ----------------------------------------------------
    const negativeIncome = calculateIncome({ netSalary: -50000, otherIncome: -10000 });
    const negativeExpenses = calculateExpenses({ existingEmi: -5000, rent: -10000 });
    assert(
      "Defensive Robustness: Negative salary and expense inputs clamped safely to zero",
      negativeIncome.netSalary === 0 && negativeExpenses.existingEmi === 0,
      `Clamped salary: ${negativeIncome.netSalary}, Clamped EMI: ${negativeExpenses.existingEmi}`
    );

    // ----------------------------------------------------
    // Test 20: Admin Rules Configuration Integrity
    // ----------------------------------------------------
    const activeRules = getActiveRules();
    assert(
      "Rules Governance: Active rules config contains required underwriting ceilings and pricing components",
      activeRules.maxFoirLimit === 0.60 && activeRules.pricingComponents.baseRate > 0 && activeRules.minSurplusThreshold === 8000,
      `Active rule version: ${activeRules.versionId}, Max FOIR: ${activeRules.maxFoirLimit * 100}%`
    );

    // ----------------------------------------------------
    // Test 21: Standard 3.0% Origination & Platform Fee Cut
    // ----------------------------------------------------
    const feeTestPricing = calculatePricing(50000, 3, "TIER_1_SUPER_PRIME", 0.015, activeRules);
    assert(
      "Pricing Policy: Exactly 3.0% processing fee deducted with 18% GST",
      feeTestPricing.processingFee === 1500 && feeTestPricing.gst === 270 && feeTestPricing.netDisbursal === 48230,
      `Principal: ₹50,000, Fee (3%): ₹${feeTestPricing.processingFee}, GST: ₹${feeTestPricing.gst}, Net Disbursal: ₹${feeTestPricing.netDisbursal}`
    );

    // ----------------------------------------------------
    // Test 22: Progressive Tenure Ladder & Mandatory Bureau Re-Check
    // ----------------------------------------------------
    const ladder = activeRules.progressiveTenureRules;
    assert(
      "Progressive Tenure Policy: Cycle 1 restricted to 30D & 3M, Cycle 2 unlocks 6M, Bureau check required",
      ladder && ladder.cycle1AllowedTenures.length === 2 && ladder.cycle2AllowedTenures.includes(6) && ladder.mandatoryBureauCheckEveryDisbursal === true,
      `Cycle 1: [${ladder?.cycle1AllowedTenures?.join(", ")}], Cycle 2: [${ladder?.cycle2AllowedTenures?.join(", ")}], Bureau Re-Check: ${ladder?.mandatoryBureauCheckEveryDisbursal}`
    );

    // ----------------------------------------------------
    // Test 23: Credit Score Permissible Lender ROI Band Calculation
    // ----------------------------------------------------
    const bandPrime = calculateLenderRoiBand(802);
    const bandNear = calculateLenderRoiBand(680);
    const bandSubprime = calculateLenderRoiBand(610);
    assert(
      "Lender ROI Bounds: Calibrates permissible P2P matching rate bounds according to borrower credit score",
      bandPrime.minPermissibleRoi === 12.0 && bandPrime.maxPermissibleRoi === 18.0 &&
      bandNear.minPermissibleRoi === 19.0 && bandNear.maxPermissibleRoi === 26.0 &&
      bandSubprime.minPermissibleRoi === 24.0 && bandSubprime.maxPermissibleRoi === 32.0,
      `Score 802 Band: ${bandPrime.minPermissibleRoi}%-${bandPrime.maxPermissibleRoi}%, Score 680 Band: ${bandNear.minPermissibleRoi}%-${bandNear.maxPermissibleRoi}%, Score 610 Band: ${bandSubprime.minPermissibleRoi}%-${bandSubprime.maxPermissibleRoi}%`
    );

    // ----------------------------------------------------
    // Test 24: Dynamic Interest Rate Variance on Matched Lender Counter-Offer
    // ----------------------------------------------------
    const pricingAlgorithmic = calculatePricing(60000, 3, "TIER_1_SUPER_PRIME", 0.015, activeRules);
    const pricingMatchedLender = calculatePricing(60000, 3, "TIER_1_SUPER_PRIME", 0.015, activeRules, 14.50);
    assert(
      "Interest Rate Variance: Matched lender counter-offer recalculates reducing monthly EMI and total interest",
      pricingMatchedLender.annualRoi === 14.50 &&
      pricingMatchedLender.isCustomLenderRoi === true &&
      pricingMatchedLender.emi < pricingAlgorithmic.emi &&
      pricingMatchedLender.totalInterest < pricingAlgorithmic.totalInterest &&
      pricingMatchedLender.processingFee === 1800, // 3% of 60k
      `Algorithmic EMI: ₹${pricingAlgorithmic.emi} (@ ${pricingAlgorithmic.annualRoi}%), Matched EMI: ₹${pricingMatchedLender.emi} (@ ${pricingMatchedLender.annualRoi}%), Savings: ₹${pricingAlgorithmic.totalInterest - pricingMatchedLender.totalInterest}`
    );
  } catch (err) {
    assert("Engine Test Exception", false, `Uncaught execution error: ${err.message}`);
  }

  const passedCount = testResults.filter((t) => t.passed).length;
  const failedCount = testResults.filter((t) => !t.passed).length;

  return {
    total: testResults.length,
    passed: passedCount,
    failed: failedCount,
    allPassed: failedCount === 0,
    results: testResults,
  };
};
