import React, { useState } from "react";
import { formatINR, formatPercent } from "./instantLoanCalculations";

const FinancialHealthDashboard = ({ underwritingResult }) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  if (!underwritingResult) return null;

  const {
    income,
    expenses,
    surplus,
    risk,
    affordability,
    optimalCandidate,
    requestedAmount,
    decisionEvaluation,
  } = underwritingResult;

  const foirPercent = Math.min(100, Math.round(affordability.newFOIR * 100));
  const surplusPercent = Math.min(100, Math.round(surplus.surplusRatio * 100));
  const confidencePercent = income.overallConfidence;

  // Visual bar segments for Income allocation
  const incomeTotal = income.totalVerifiedIncome || 1;
  const obligationsPct = Math.min(100, Math.round((expenses.totalExistingObligations / incomeTotal) * 100));
  const livingPct = Math.min(100, Math.round((expenses.essentialLivingExpenses / incomeTotal) * 100));
  const mandatoryPct = Math.min(100, Math.round((expenses.mandatoryExpenses / incomeTotal) * 100));
  const surplusPct = Math.max(0, 100 - (obligationsPct + livingPct + mandatoryPct));

  return (
    <div className="mb-4">
      {/* Top 4 Key Metric Cards */}
      <div className="row g-3 mb-4">
        {/* Metric 1: Monthly Surplus */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="metric-tile shadow-xs">
            <span className="metric-label">
              <i className="fa-solid fa-coins text-success me-1"></i> Net Monthly Surplus
            </span>
            <span className="metric-value text-success">{formatINR(surplus.monthlySurplus)}</span>
            <span className="metric-subtext">
              {surplusPercent}% of verified income ({formatINR(income.totalVerifiedIncome)})
            </span>
          </div>
        </div>

        {/* Metric 2: Debt Burden / FOIR */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="metric-tile shadow-xs">
            <span className="metric-label">
              <i className="fa-solid fa-gauge-high text-primary me-1"></i> Projected FOIR
            </span>
            <span className={`metric-value ${foirPercent > 60 ? "text-danger" : foirPercent > 50 ? "text-warning" : "text-primary"}`}>
              {foirPercent}%
            </span>
            <span className="metric-subtext">
              Policy Cap: 60.0% • Baseline: {Math.round(affordability.baselineFOIR * 100)}%
            </span>
          </div>
        </div>

        {/* Metric 3: Credit Risk Score */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="metric-tile shadow-xs">
            <span className="metric-label">
              <i className="fa-solid fa-shield-halved text-info me-1"></i> Composite Risk Score
            </span>
            <span className="metric-value text-dark">
              {risk.compositeScore}<span className="fs-6 text-muted">/100</span>
            </span>
            <span className="metric-subtext">
              Tier: <strong className="text-primary">{risk.riskTier?.replace(/_/g, " ")}</strong> (PD: {risk.pdPercentage}%)
            </span>
          </div>
        </div>

        {/* Metric 4: Data Confidence Score */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="metric-tile shadow-xs">
            <span className="metric-label">
              <i className="fa-solid fa-check-double text-purple me-1"></i> Data Confidence
            </span>
            <span className="metric-value text-indigo">
              {confidencePercent}%
            </span>
            <span className="metric-subtext">
              Salary: <span className={`badge ${income.salaryStatus === "VERIFIED" ? "badge-verified" : "badge-declared"} small`}>{income.salaryStatus}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Financial Inflows vs Outflows Visual Breakdown */}
      <div className="studio-card mb-4">
        <div className="studio-card-header">
          <div className="d-flex align-items-center gap-2">
            <i className="fa-solid fa-chart-pie text-primary fs-5"></i>
            <div>
              <h5 className="fw-bold mb-0 text-dark">Monthly Cashflow Allocation & Cushion</h5>
              <small className="text-muted">Breakdown of gross verified inflow into obligations, living expenses, and liquid buffer</small>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary rounded-pill px-3"
            onClick={() => setShowFormulaDetails(!showFormulaDetails)}
          >
            <i className="fa-solid fa-circle-info me-1"></i>
            {showFormulaDetails ? "Hide Formulas" : "View Formulas"}
          </button>
        </div>

        <div className="studio-card-body">
          {/* Segmented Progress Bar */}
          <div className="mb-3">
            <div className="d-flex justify-content-between text-muted small fw-semibold mb-2">
              <span>Verified Inflow: <strong>{formatINR(income.totalVerifiedIncome)}</strong></span>
              <span>Available Surplus: <strong className="text-success">{formatINR(surplus.monthlySurplus)}</strong></span>
            </div>

            <div className="progress rounded-pill shadow-xs" style={{ height: "18px", backgroundColor: "#f1f5f9" }}>
              {/* Existing Obligations */}
              <div
                className="progress-bar bg-danger"
                role="progressbar"
                style={{ width: `${obligationsPct}%` }}
                title={`Existing Obligations: ${formatINR(expenses.totalExistingObligations)} (${obligationsPct}%)`}
              />
              {/* Living Expenses */}
              <div
                className="progress-bar bg-warning"
                role="progressbar"
                style={{ width: `${livingPct}%` }}
                title={`Essential Living: ${formatINR(expenses.essentialLivingExpenses)} (${livingPct}%)`}
              />
              {/* Mandatory Expenses */}
              <div
                className="progress-bar bg-info"
                role="progressbar"
                style={{ width: `${mandatoryPct}%` }}
                title={`Mandatory (Insurance/Tax): ${formatINR(expenses.mandatoryExpenses)} (${mandatoryPct}%)`}
              />
              {/* Net Surplus Buffer */}
              <div
                className="progress-bar bg-success"
                role="progressbar"
                style={{ width: `${surplusPct}%` }}
                title={`Unencumbered Surplus: ${formatINR(surplus.monthlySurplus)} (${surplusPct}%)`}
              />
            </div>

            {/* Legend */}
            <div className="d-flex flex-wrap gap-4 mt-3 small text-muted">
              <span className="d-inline-flex align-items-center gap-1">
                <span className="badge rounded-circle p-1 bg-danger"></span>
                Existing Debt ({obligationsPct}% • {formatINR(expenses.totalExistingObligations)})
              </span>
              <span className="d-inline-flex align-items-center gap-1">
                <span className="badge rounded-circle p-1 bg-warning"></span>
                Living Expenses ({livingPct}% • {formatINR(expenses.essentialLivingExpenses)})
              </span>
              <span className="d-inline-flex align-items-center gap-1">
                <span className="badge rounded-circle p-1 bg-info"></span>
                Mandatory Outflows ({mandatoryPct}% • {formatINR(expenses.mandatoryExpenses)})
              </span>
              <span className="d-inline-flex align-items-center gap-1 fw-bold text-success">
                <span className="badge rounded-circle p-1 bg-success"></span>
                Monthly Surplus ({surplusPct}% • {formatINR(surplus.monthlySurplus)})
              </span>
            </div>
          </div>

          {/* Expandable Formulas Explainer */}
          {showFormulaDetails && (
            <div className="p-3 bg-light rounded border mt-3 small font-monospace">
              <div className="fw-bold text-dark mb-2 font-sans-serif">
                <i className="fa-solid fa-code text-primary me-1"></i> Transparent Underwriting Formulas:
              </div>
              <ul className="mb-0 ps-3 text-secondary">
                <li>Total Verified Income = NetSalary ({formatINR(income.verifiedSalary)}) + VerifiedOther ({formatINR(income.verifiedOtherIncome)}) = {formatINR(income.totalVerifiedIncome)}</li>
                <li>Total Monthly Outflows = ExistingEMI ({formatINR(expenses.existingEmi)}) + Cards ({formatINR(expenses.creditCardMinDues)}) + Rent ({formatINR(expenses.rent)}) + Living ({formatINR(expenses.householdExpenses)}) + Mandatory ({formatINR(expenses.mandatoryExpenses)}) = {formatINR(expenses.totalMonthlyOutflows)}</li>
                <li>Monthly Surplus = TotalVerifiedIncome - TotalMonthlyOutflows = {formatINR(surplus.monthlySurplus)}</li>
                <li>Max Safe New EMI = MIN(Surplus × 55%, (Income × 60% FOIR) - CurrentOutflows) = {formatINR(affordability.maxSafeNewEmi)}</li>
                <li>Expected Loss (EL) = PD ({risk.pdPercentage}%) × LGD ({risk.lgdPercentage}%) × EAD ({formatINR(optimalCandidate?.amount || 0)}) = {formatINR(optimalCandidate?.expectedLossData?.expectedLoss || 0)}</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* "Why This Amount?" Section */}
      <div className="studio-card">
        <div className="studio-card-header bg-soft-primary">
          <div className="d-flex align-items-center gap-2">
            <i className="fa-solid fa-lightbulb text-warning fs-5"></i>
            <div>
              <h5 className="fw-bold mb-0 text-dark">Why This Amount? (Explainability Studio)</h5>
              <small className="text-muted">Algorithmic rationale explaining why this exact recommendation was sanctioned</small>
            </div>
          </div>
          <span className="badge bg-primary rounded-pill px-3 py-1 font-monospace">
            {decisionEvaluation.decision}
          </span>
        </div>

        <div className="studio-card-body">
          <div className="row g-4 align-items-center">
            {/* Left: Summary Comparison */}
            <div className="col-12 col-md-5 border-end-md">
              <div className="p-3 bg-light rounded-3 text-center mb-3">
                <span className="text-muted small d-block">Requested by Borrower</span>
                <span className="fs-3 fw-bold text-secondary text-decoration-line-through">
                  {formatINR(requestedAmount)}
                </span>
                <div className="my-2">
                  <i className="fa-solid fa-arrow-down text-primary fs-5"></i>
                </div>
                <span className="text-muted small d-block">Engine Sanctioned Capacity</span>
                <span className="fs-2 fw-extrabold text-success">
                  {formatINR(optimalCandidate?.amount || 0)}
                </span>
                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 mt-2 d-inline-block small">
                  {optimalCandidate?.tenure || 6}-Month EMI: {formatINR(optimalCandidate?.pricing?.emi || 0)}/mo
                </span>
              </div>
            </div>

            {/* Right: Reason Codes & Policy Constraints */}
            <div className="col-12 col-md-7">
              <h6 className="fw-bold text-dark mb-3">
                <i className="fa-solid fa-list-check text-primary me-1"></i> Active Underwriting Factors & Rule Codes:
              </h6>
              {decisionEvaluation.reasons.map((r, idx) => (
                <div key={idx} className={`reason-item impact-${r.impact}`}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <strong className="text-dark small">{r.title}</strong>
                    <span className="badge bg-white text-dark border small font-monospace py-0 px-1">
                      {r.code}
                    </span>
                  </div>
                  <p className="text-muted small mb-0">{r.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialHealthDashboard;
