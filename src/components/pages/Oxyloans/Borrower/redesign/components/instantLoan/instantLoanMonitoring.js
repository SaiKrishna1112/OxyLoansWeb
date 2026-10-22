/**
 * Continuous Post-Disbursement Risk Monitoring Simulator
 * Simulates real-time behavioral drift, early warning signals (EWS), and portfolio exposure updates.
 * 
 * DISCLAIMER: Frontend simulation for risk mitigation demonstration only.
 */

export const MONITORING_EVENTS = [
  {
    id: "EVENT_SALARY_DROP",
    title: "Salary Inflow Drop (-25%)",
    icon: "fa-arrow-trend-down",
    color: "danger",
    description: "Primary payroll account shows consecutive 25% lower monthly direct deposit.",
    impactDelta: {
      pdIncrease: 0.045, // +4.5% PD
      riskScoreDelta: -18,
      ewsLevel: "RED",
    },
    ewsAlert: "Severe Income Volatility Flag: Monthly debt-service coverage ratio (DSCR) impaired below 1.1x.",
    recommendedActions: [
      "Initiate proactive customer success outreach call within 24 hours.",
      "Temporarily freeze instant top-up and revolving credit line enhancements.",
      "Offer voluntary tenure extension to lower immediate monthly EMI by 30%.",
    ],
  },
  {
    id: "EVENT_NACH_BOUNCE",
    title: "eNACH Debit Mandate Bounce",
    icon: "fa-triangle-exclamation",
    color: "danger",
    description: "Scheduled automated clearing house (NACH) presentation returned unpaid (Insufficient Funds).",
    impactDelta: {
      pdIncrease: 0.082, // +8.2% PD
      riskScoreDelta: -28,
      ewsLevel: "RED",
    },
    ewsAlert: "Immediate Delinquency EWS: Active mandate dishonour recorded on NPCI gateway.",
    recommendedActions: [
      "Trigger automated SMS + WhatsApp reminder with instant UPI retry link.",
      "Queue account for soft collections calling queue (Priority Tier 1).",
      "Apply contractual late payment fee and schedule representment after 3 days.",
    ],
  },
  {
    id: "EVENT_CREDIT_UTILIZATION_SPIKE",
    title: "Credit Card Utilization Surge (>88%)",
    icon: "fa-credit-card",
    color: "warning",
    description: "Borrower's external bureau credit utilization increased from 24% to 89% in past 45 days.",
    impactDelta: {
      pdIncrease: 0.028,
      riskScoreDelta: -12,
      ewsLevel: "AMBER",
    },
    ewsAlert: "High Credit Appetite / Liquidity Stress: Sudden reliance on revolving short-term credit lines.",
    recommendedActions: [
      "Monitor incoming repayments closely and trigger pre-due payment nudges.",
      "Prevent any additional cross-sell offers or loan top-ups on mobile app.",
    ],
  },
  {
    id: "EVENT_NEW_EXTERNAL_LOAN",
    title: "New External Personal Loan Opened",
    icon: "fa-landmark",
    color: "warning",
    description: "Experian / CRIF bureau alerts reveal a new ₹1,50,000 personal loan disbursed by NBFC.",
    impactDelta: {
      pdIncrease: 0.021,
      riskScoreDelta: -10,
      ewsLevel: "AMBER",
    },
    ewsAlert: "Leverage Multiplier Alert: Total debt servicing obligations increased, compressing surplus buffer.",
    recommendedActions: [
      "Recalculate composite FOIR with revised external obligations.",
      "Send financial wellness dashboard advice to borrower.",
    ],
  },
  {
    id: "EVENT_BALANCE_CRASH",
    title: "Monthly Average Balance Plunge (<₹2,500)",
    icon: "fa-wallet",
    color: "warning",
    description: "Bank account daily balance fell below ₹2,500 threshold for 14 consecutive days.",
    impactDelta: {
      pdIncrease: 0.018,
      riskScoreDelta: -9,
      ewsLevel: "AMBER",
    },
    ewsAlert: "Cashflow Buffer Depleted: Bank balance insufficient to cover impending auto-debit.",
    recommendedActions: [
      "Send balance alert notification reminding borrower of upcoming installment due date.",
      "Enable split payment or partial installment settlement option.",
    ],
  },
  {
    id: "EVENT_CLEAN_REPAYMENT",
    title: "Consistent On-Time Mandate Clearing (+3 Cycles)",
    icon: "fa-circle-check",
    color: "success",
    description: "Borrower completed 3 consecutive EMI cycles without delay or friction.",
    impactDelta: {
      pdIncrease: -0.012, // Improved PD
      riskScoreDelta: +15,
      ewsLevel: "GREEN",
    },
    ewsAlert: "Positive Behavioral Track Record: Demonstrates high repayment willingness and financial discipline.",
    recommendedActions: [
      "Elevate borrower internal trust rating to Tier 1 Prime.",
      "Unlock pre-approved rate reduction coupon (-0.75% ROI) for future renewals.",
      "Offer eligibility for Instant Limit Enhancement upon loan completion.",
    ],
  },
];

/**
 * Calculates updated risk parameters given active simulated events
 */
export const evaluateMonitoringState = (baseLoan, baseRisk, activeEvents = []) => {
  const principal = baseLoan?.principal || 50000;
  let currentPd = baseRisk?.pd || 0.035;
  let currentScore = baseRisk?.compositeScore || 78;

  let maxEws = "GREEN";
  const allAlerts = [];
  const allActions = [];

  activeEvents.forEach((ev) => {
    currentPd = Math.max(0.008, Math.min(0.50, currentPd + ev.impactDelta.pdIncrease));
    currentScore = Math.max(10, Math.min(100, currentScore + ev.impactDelta.riskScoreDelta));

    if (ev.impactDelta.ewsLevel === "RED") maxEws = "RED";
    else if (ev.impactDelta.ewsLevel === "AMBER" && maxEws !== "RED") maxEws = "AMBER";

    allAlerts.push({
      eventId: ev.id,
      title: ev.title,
      text: ev.ewsAlert,
      level: ev.impactDelta.ewsLevel,
    });

    ev.recommendedActions.forEach((act) => {
      if (!allActions.includes(act)) allActions.push(act);
    });
  });

  const revisedEL = Math.round(principal * currentPd * 0.65);
  const revisedLossRate = ((revisedEL / principal) * 100).toFixed(2);

  return {
    basePd: (baseRisk?.pd * 100).toFixed(2),
    currentPd: (currentPd * 100).toFixed(2),
    baseScore: baseRisk?.compositeScore || 78,
    currentScore,
    ewsStatus: maxEws,
    revisedExpectedLoss: revisedEL,
    revisedLossRate,
    alerts: allAlerts,
    recommendedActions: allActions,
    activeEventsCount: activeEvents.length,
  };
};
