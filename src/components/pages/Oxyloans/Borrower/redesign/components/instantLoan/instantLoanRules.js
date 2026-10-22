/**
 * Configurable Underwriting Policy, Risk Scoring Weights, and Governance Rules
 * Fully decoupled from UI with LocalStorage versioning, comparison, and persistence.
 */

export const DEFAULT_RULES_CONFIG = {
  versionId: "RULES_v2.4_PROD_SIM",
  versionName: "Standard Digital Underwriting Policy (v2.4)",
  createdAt: "2026-10-01T00:00:00.000Z",
  isActive: true,
  description: "Standard retail instant loan underwriting policy balancing surplus capacity, FOIR ceilings, and portfolio exposure limits.",

  // 1. Capacity & Surplus Engine
  capacityPolicyMode: "SURPLUS_MULTIPLIER", // "SURPLUS_MULTIPLIER" | "SAFE_EMI_CASHFLOW" | "BALANCED_HYBRID"
  surplusMultiplier: 5.0, // The classic 5x surplus multiplier
  minSurplusThreshold: 8000, // Minimum monthly surplus in INR required to raise a loan
  minSurplusBuffer: 3500, // Minimum residual surplus cushion required after paying new EMI
  maxSurplusAllocationRatio: 0.55, // Max 55% of monthly surplus can go towards new EMI
  otherIncomeHaircut: 0.75, // 25% haircut on secondary verified income

  // 2. Affordability & Debt Burden Limits
  maxFoirLimit: 0.60, // 60% Maximum Fixed Obligation to Income Ratio
  maxDtiLimit: 0.50, // 50% Maximum Debt-to-Income Ratio
  stressedFoirLimit: 0.75, // Stressed FOIR failure threshold
  defaultTenureMonths: 6,

  // 3. Product Loan Boundaries
  minLoanAmount: 10000,
  maxLoanAmount: 250000,
  allowedTenures: [3, 6, 9, 12, 18, 24],

  // 4. Scoring Weights (Must sum to 1.0)
  riskWeights: {
    credit: 0.35,
    affordability: 0.25,
    stability: 0.15,
    recovery: 0.15,
    fraud: 0.10,
  },

  // 5. Credit & Risk Thresholds
  hardCreditScoreCutoff: 620, // Strict reject below this score
  maxAllowedPD: 0.085, // 8.5% Maximum allowable 12-month PD
  maxExpectedLossRate: 0.045, // 4.5% Maximum Expected Loss rate
  baselineLGD: 0.65, // 65% baseline Loss Given Default for unsecured

  // 6. Transparent Dynamic Pricing Components (% per annum)
  pricingComponents: {
    baseRate: 10.50, // Cost of Funds
    operatingCost: 2.25, // Tech & Servicing Cost
    collectionCost: 1.50, // Recovery Infrastructure
    capitalCost: 2.75, // Regulatory Capital Cost
    targetMargin: 3.50, // Company Net Target Margin
  },
  processingFeeRate: 0.030, // 3.0% Upfront Origination & Platform Fee
  gstRate: 0.18, // 18% GST

  // Progressive Tenure Ladder based on On-Time Repayment Performance
  progressiveTenureRules: {
    cycle1AllowedTenures: [1, 3], // New borrower: 30-Day Payday Bullet & 3 Months only
    cycle2AllowedTenures: [1, 3, 6], // 1 on-time loan: unlocks 6 Months
    cycle3AllowedTenures: [1, 3, 6, 9, 12], // 2+ on-time loans: unlocks 9 & 12 Months
    mandatoryBureauCheckEveryDisbursal: true, // Re-check CIR bureau report every cycle
  },

  // Lender & Admin Matched ROI Variance Bounds (P2P Marketplace Matching)
  lenderMatchingPolicy: {
    allowLenderCounterOffer: true,
    bureauBasedBoundsRequired: true,
    tierBounds: {
      superPrime: { minScore: 780, minRoi: 12.0, maxRoi: 18.0, defaultRoi: 15.5 },
      prime: { minScore: 720, minRoi: 15.0, maxRoi: 22.0, defaultRoi: 18.0 },
      nearPrime: { minScore: 650, minRoi: 19.0, maxRoi: 26.0, defaultRoi: 22.5 },
      subprime: { minScore: 300, minRoi: 24.0, maxRoi: 32.0, defaultRoi: 27.5 },
    },
  },

  // 7. Portfolio & Institutional Safety Limits (INR)
  safetyLimits: {
    maxSingleBorrowerExposure: 250000,
    maxEmployerConcentration: 5000000,
    maxGeoConcentration: 10000000,
    partnerEscrowPoolLimit: 50000000,
    minLiquidityBuffer: 2500000,
  },

  // 8. Stress Testing Assumptions
  stressTestingAssumptions: {
    incomeShockPercent: 20,
    debtSpikePercent: 25,
    inflationShockPercent: 30,
    macroPdSpikePercent: 50,
  },
};

const STORAGE_ACTIVE_RULE_KEY = "oxy_instant_loan_active_rules";
const STORAGE_VERSIONS_LIST_KEY = "oxy_instant_loan_rule_versions";

/**
 * Load currently active rules configuration from localStorage or default
 */
export const getActiveRules = () => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const saved = window.localStorage.getItem(STORAGE_ACTIVE_RULE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge with default to guarantee new schema fields exist
        return {
          ...DEFAULT_RULES_CONFIG,
          ...parsed,
          riskWeights: { ...DEFAULT_RULES_CONFIG.riskWeights, ...(parsed.riskWeights || {}) },
          pricingComponents: { ...DEFAULT_RULES_CONFIG.pricingComponents, ...(parsed.pricingComponents || {}) },
          safetyLimits: { ...DEFAULT_RULES_CONFIG.safetyLimits, ...(parsed.safetyLimits || {}) },
          progressiveTenureRules: { ...DEFAULT_RULES_CONFIG.progressiveTenureRules, ...(parsed.progressiveTenureRules || {}) },
          lenderMatchingPolicy: { ...DEFAULT_RULES_CONFIG.lenderMatchingPolicy, ...(parsed.lenderMatchingPolicy || {}) },
        };
      }
    }
  } catch (e) {
    console.warn("Failed to load active rules from localStorage:", e);
  }
  return DEFAULT_RULES_CONFIG;
};

/**
 * Save and activate a rules configuration
 */
export const saveAndActivateRules = (newRules) => {
  try {
    const updated = {
      ...newRules,
      updatedAt: new Date().toISOString(),
      isActive: true,
    };
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_ACTIVE_RULE_KEY, JSON.stringify(updated));

      // Also update in versions history
      const versions = listRuleVersions();
      const existingIdx = versions.findIndex((v) => v.versionId === updated.versionId);
      if (existingIdx >= 0) {
        versions[existingIdx] = updated;
      } else {
        versions.unshift(updated);
      }
      window.localStorage.setItem(STORAGE_VERSIONS_LIST_KEY, JSON.stringify(versions));
    }

    return updated;
  } catch (e) {
    console.error("Failed to save rules:", e);
    return newRules;
  }
};

export const saveAndActivateRuleVersion = saveAndActivateRules;

/**
 * List all saved rule versions
 */
export const listRuleVersions = () => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const raw = window.localStorage.getItem(STORAGE_VERSIONS_LIST_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to list rule versions:", e);
  }
  return [DEFAULT_RULES_CONFIG];
};

/**
 * Reset rules to default production simulated configuration
 */
export const resetRulesToDefault = () => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(STORAGE_ACTIVE_RULE_KEY);
      window.localStorage.setItem(STORAGE_VERSIONS_LIST_KEY, JSON.stringify([DEFAULT_RULES_CONFIG]));
    }
  } catch (e) {
    console.warn("Failed to reset rules:", e);
  }
  return DEFAULT_RULES_CONFIG;
};
