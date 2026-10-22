/**
 * Decision Audit Trail Service
 * Records every underwriting evaluation in localStorage with complete inputs,
 * outputs, rule versions, reason codes, and export capability.
 */

const STORAGE_AUDIT_KEY = "oxy_instant_loan_decision_audits";

export const logDecisionAudit = (underwritingResult, ruleVersionId = "RULES_v2.4_PROD_SIM") => {
  try {
    const audits = getDecisionAudits();
    const entry = {
      id: `AUDIT_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      customerName: underwritingResult.inputs?.fullName || "Borrower",
      pan: underwritingResult.inputs?.panNumber || "PAN_ANON",
      ruleVersion: ruleVersionId,
      requestedAmount: underwritingResult.requestedAmount,
      requestedTenure: underwritingResult.requestedTenure,
      recommendedAmount: underwritingResult.optimalCandidate?.amount || 0,
      decision: underwritingResult.decisionEvaluation?.decision || "DECLINE",
      creditScore: underwritingResult.risk?.creditRiskScore || 0,
      pd: (underwritingResult.risk?.pd * 100).toFixed(2),
      monthlySurplus: underwritingResult.surplus?.monthlySurplus || 0,
      newFOIR: underwritingResult.affordability?.newFOIR ? (underwritingResult.affordability.newFOIR * 100).toFixed(1) : 0,
      reasons: underwritingResult.decisionEvaluation?.reasons || [],
      fullSnapshot: underwritingResult,
    };

    audits.unshift(entry);
    // Keep max 50 recent audits
    const trimmed = audits.slice(0, 50);
    localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify(trimmed));
    return entry;
  } catch (e) {
    console.warn("Failed to write decision audit:", e);
    return null;
  }
};

export const getDecisionAudits = () => {
  try {
    const raw = localStorage.getItem(STORAGE_AUDIT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Failed to read decision audits:", e);
  }
  return [];
};

export const clearDecisionAudits = () => {
  try {
    localStorage.removeItem(STORAGE_AUDIT_KEY);
    return true;
  } catch (e) {
    console.error("Failed to clear decision audits:", e);
    return false;
  }
};

export const exportAuditsToJSON = () => {
  try {
    const audits = getDecisionAudits();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(audits, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `oxy_instant_loan_audits_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    return true;
  } catch (e) {
    console.error("Failed to export audits:", e);
    return false;
  }
};
