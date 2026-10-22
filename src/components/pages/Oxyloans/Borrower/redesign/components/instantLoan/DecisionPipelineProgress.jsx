import React, { useState } from "react";
import { formatINR, formatPercent } from "./instantLoanCalculations";

const DecisionPipelineProgress = ({ underwritingResult }) => {
  const [selectedStageIndex, setSelectedStageIndex] = useState(null);

  if (!underwritingResult) return null;

  const {
    income,
    expenses,
    surplus,
    risk,
    affordability,
    stressTests,
    portfolioSafety,
    optimalCandidate,
    requestedAmount,
    decisionEvaluation,
  } = underwritingResult;

  const stages = [
    {
      id: "STAGE_PROFILE",
      name: "Profile",
      status: "PASS",
      summary: underwritingResult.inputs?.employmentType || "Salaried",
      icon: "fa-user",
      metrics: [
        { label: "Applicant", value: underwritingResult.inputs?.fullName || "Borrower" },
        { label: "Employer", value: underwritingResult.inputs?.companyName || "Corporate" },
        { label: "Experience", value: `${underwritingResult.inputs?.employmentStabilityYears || 2} Years` },
      ],
    },
    {
      id: "STAGE_VERIFICATION",
      name: "Verification",
      status: income.overallConfidence >= 75 ? "PASS" : income.overallConfidence >= 60 ? "WARNING" : "FAIL",
      summary: `${income.overallConfidence}% Confidence`,
      icon: "fa-certificate",
      metrics: [
        { label: "Salary State", value: income.salaryStatus },
        { label: "PAN Match", value: underwritingResult.inputs?.panVerified ? "Verified (Live)" : "Unverified" },
        { label: "Bank Cashflow", value: underwritingResult.inputs?.bankingCashflowVerified ? "Reconciled" : "Declared" },
      ],
    },
    {
      id: "STAGE_FINANCIAL",
      name: "Financials",
      status: "PASS",
      summary: `${formatINR(income.totalVerifiedIncome)}/mo`,
      icon: "fa-wallet",
      metrics: [
        { label: "Verified Income", value: formatINR(income.totalVerifiedIncome) },
        { label: "Total Obligations", value: formatINR(expenses.totalExistingObligations) },
        { label: "Living Expenses", value: formatINR(expenses.essentialLivingExpenses) },
      ],
    },
    {
      id: "STAGE_SURPLUS",
      name: "Surplus",
      status: surplus.isSurplusAdequate ? "PASS" : "FAIL",
      summary: `${formatINR(surplus.monthlySurplus)} Net`,
      icon: "fa-scale-balanced",
      metrics: [
        { label: "Monthly Surplus", value: formatINR(surplus.monthlySurplus) },
        { label: "Surplus Margin", value: formatPercent(surplus.surplusRatio * 100) },
        { label: "Min Required Floor", value: formatINR(surplus.minRequiredSurplus) },
      ],
    },
    {
      id: "STAGE_AFFORDABILITY",
      name: "Affordability",
      status: affordability.newFOIR <= 0.60 ? "PASS" : "WARNING",
      summary: `${Math.round(affordability.newFOIR * 100)}% FOIR`,
      icon: "fa-calculator",
      metrics: [
        { label: "Max Safe New EMI", value: formatINR(affordability.maxSafeNewEmi) },
        { label: "Projected FOIR", value: formatPercent(affordability.newFOIR * 100) },
        { label: "Capacity Limit", value: formatINR(affordability.maxSafeLoanAmount) },
      ],
    },
    {
      id: "STAGE_RISK",
      name: "Risk Scoring",
      status: risk.compositeScore >= 70 ? "PASS" : risk.compositeScore >= 55 ? "WARNING" : "FAIL",
      summary: `${risk.compositeScore}/100 Score`,
      icon: "fa-shield-halved",
      metrics: [
        { label: "Risk Tier", value: risk.riskTier?.replace(/_/g, " ") },
        { label: "12M Default (PD)", value: `${risk.pdPercentage}%` },
        { label: "Loss Given Default (LGD)", value: `${risk.lgdPercentage}%` },
      ],
    },
    {
      id: "STAGE_RECOVERY",
      name: "Recovery",
      status: risk.recoveryScore >= 65 ? "PASS" : "WARNING",
      summary: `${risk.recoveryScore}/100 Strength`,
      icon: "fa-rotate",
      metrics: [
        { label: "Recovery Strength", value: `${risk.recoveryScore}/100` },
        { label: "Internal Track", value: underwritingResult.inputs?.previousInternalRepayment || "CLEAN" },
        { label: "Residual Cushion", value: formatINR(surplus.monthlySurplus - (optimalCandidate?.pricing?.emi || 0)) },
      ],
    },
    {
      id: "STAGE_OPTIMIZATION",
      name: "Optimization",
      status: optimalCandidate?.isEligible ? "PASS" : "FAIL",
      summary: `${formatINR(optimalCandidate?.amount || 0)} Opt`,
      icon: "fa-wand-magic-sparkles",
      metrics: [
        { label: "Requested", value: formatINR(requestedAmount) },
        { label: "Engine Recommended", value: formatINR(optimalCandidate?.amount || 0) },
        { label: "Tenure", value: `${optimalCandidate?.tenure || 6} Months` },
      ],
    },
    {
      id: "STAGE_STRESS_TEST",
      name: "Stress Test",
      status: stressTests.overallStressPass ? "PASS" : stressTests.failCount === 1 ? "WARNING" : "FAIL",
      summary: `${stressTests.scenarios.length - stressTests.failCount}/${stressTests.scenarios.length} Passed`,
      icon: "fa-bolt-lightning",
      metrics: [
        { label: "Scenarios Passed", value: `${stressTests.scenarios.length - stressTests.failCount} of 6` },
        { label: "Failures", value: `${stressTests.failCount}` },
        { label: "Warnings", value: `${stressTests.warningCount}` },
      ],
    },
    {
      id: "STAGE_COMPANY_SAFETY",
      name: "Safety Check",
      status: portfolioSafety.isSafe ? "PASS" : "FAIL",
      summary: `${portfolioSafety.companySafetyScore}/100 Safe`,
      icon: "fa-building-shield",
      metrics: [
        { label: "Safety Score", value: `${portfolioSafety.companySafetyScore}/100` },
        { label: "Employer Cap", value: portfolioSafety.employerPassed ? "Within Cap" : "Breached" },
        { label: "Geo Cap", value: portfolioSafety.geoPassed ? "Within Cap" : "Breached" },
      ],
    },
    {
      id: "STAGE_FINAL_OFFER",
      name: "Final Offer",
      status: decisionEvaluation.isApproved ? "PASS" : decisionEvaluation.isReview ? "WARNING" : "FAIL",
      summary: decisionEvaluation.decision?.replace(/_/g, " "),
      icon: "fa-award",
      metrics: [
        { label: "Final Decision", value: decisionEvaluation.decision },
        { label: "Sanctioned EMI", value: formatINR(optimalCandidate?.pricing?.emi || 0) },
        { label: "Annualized ROI", value: `${optimalCandidate?.pricing?.annualRoi || 0}%` },
      ],
    },
  ];

  return (
    <div className="mb-4">
      {/* Pipeline Navigation Header */}
      <div className="d-flex justify-content-between align-items-center mb-2 px-1">
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-light text-dark border px-2 py-1 small fw-bold">
            Automated Underwriting Pipeline
          </span>
          <span className="text-muted small">
            11-Stage Continuous Risk & Capacity Evaluation
          </span>
        </div>
        <div className="d-flex align-items-center gap-2 small">
          <span className="d-inline-flex align-items-center gap-1 text-muted">
            <span className="badge rounded-circle p-1 bg-success"></span> Pass
          </span>
          <span className="d-inline-flex align-items-center gap-1 text-muted">
            <span className="badge rounded-circle p-1 bg-warning"></span> Warning
          </span>
          <span className="d-inline-flex align-items-center gap-1 text-muted">
            <span className="badge rounded-circle p-1 bg-danger"></span> Fail
          </span>
        </div>
      </div>

      {/* Horizontal Pipeline Track */}
      <div className="pipeline-track">
        {stages.map((st, idx) => {
          const isSelected = selectedStageIndex === idx;
          const statusIcon =
            st.status === "PASS"
              ? "fa-circle-check text-success"
              : st.status === "WARNING"
              ? "fa-triangle-exclamation text-warning"
              : "fa-circle-xmark text-danger";

          return (
            <div
              key={st.id}
              className={`pipeline-node status-${st.status} ${isSelected ? "active-inspect" : ""}`}
              onClick={() => setSelectedStageIndex(isSelected ? null : idx)}
              title="Click to inspect stage calculations and telemetry"
            >
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span className="badge rounded-pill bg-white text-dark border small py-0 px-1 font-monospace">
                  #{idx + 1}
                </span>
                <i className={`fa-solid ${statusIcon} small`}></i>
              </div>
              <div className="fw-bold text-dark text-truncate small mb-1">{st.name}</div>
              <div className="text-muted small text-truncate" style={{ fontSize: "0.72rem" }}>
                {st.summary}
              </div>
            </div>
          );
        })}
      </div>

      {/* Expandable Inspection Drawer */}
      {selectedStageIndex !== null && (
        <div className="card mt-3 border-primary shadow-sm bg-light">
          <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <i className={`fa-solid ${stages[selectedStageIndex].icon} text-primary`}></i>
                <h6 className="fw-bold mb-0 text-dark">
                  Stage {selectedStageIndex + 1}: {stages[selectedStageIndex].name} Telemetry & Formulas
                </h6>
                <span className={`badge bg-${stages[selectedStageIndex].status === "PASS" ? "success" : stages[selectedStageIndex].status === "WARNING" ? "warning" : "danger"} small`}>
                  {stages[selectedStageIndex].status}
                </span>
              </div>
              <button
                type="button"
                className="btn-close btn-sm"
                onClick={() => setSelectedStageIndex(null)}
              ></button>
            </div>

            <div className="row g-2">
              {stages[selectedStageIndex].metrics.map((m, mIdx) => (
                <div key={mIdx} className="col-12 col-md-4">
                  <div className="bg-white p-2 rounded border small">
                    <span className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                      {m.label}
                    </span>
                    <strong className="text-dark fs-6">{m.value}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionPipelineProgress;
