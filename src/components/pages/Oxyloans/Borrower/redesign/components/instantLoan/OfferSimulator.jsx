import React, { useState, useMemo } from "react";
import {
  formatINR,
  formatPercent,
  calculatePricing,
  calculateCandidateLoan,
} from "./instantLoanCalculations";

const OfferSimulator = ({ underwritingResult, rules, onSelectOffer }) => {
  const {
    income,
    expenses,
    surplus,
    risk,
    portfolioSafety,
    optimalCandidate,
  } = underwritingResult;

  const minAmt = rules.minLoanAmount || 10000;
  const maxAmt = rules.maxLoanAmount || 250000;

  // Local interactive slider state
  const [sliderAmount, setSliderAmount] = useState(optimalCandidate?.amount || 50000);
  const [sliderTenure, setSliderTenure] = useState(optimalCandidate?.tenure || 6);

  // Live calculation for currently dragged slider state
  const liveCandidate = useMemo(() => {
    return calculateCandidateLoan(
      sliderAmount,
      sliderTenure,
      risk,
      rules,
      income,
      expenses,
      surplus,
      portfolioSafety
    );
  }, [sliderAmount, sliderTenure, risk, rules, income, expenses, surplus, portfolioSafety]);

  // Generate 4 standard comparative scenario structures
  const comparisonScenarios = useMemo(() => {
    const conservativeAmt = Math.max(minAmt, Math.round((optimalCandidate?.amount || 50000) * 0.65 / 5000) * 5000);
    const recommendedAmt = optimalCandidate?.amount || 50000;
    const aggressiveAmt = Math.min(maxAmt, Math.round((optimalCandidate?.amount || 50000) * 1.35 / 5000) * 5000);
    const bulletAmt = Math.min(30000, Math.round((optimalCandidate?.amount || 50000) * 0.60 / 5000) * 5000);

    const configs = [
      {
        id: "SCENARIO_CONSERVATIVE",
        badge: "Low Debt Burden",
        title: "Conservative Option",
        amount: conservativeAmt,
        tenure: 6,
      },
      {
        id: "SCENARIO_RECOMMENDED",
        badge: "Algorithmic Sweet Spot",
        title: "Optimal Recommendation",
        amount: recommendedAmt,
        tenure: optimalCandidate?.tenure || 6,
        isPrimary: true,
      },
      {
        id: "SCENARIO_AGGRESSIVE",
        badge: "Max Stress Tolerance",
        title: "Upper Bound Option",
        amount: aggressiveAmt,
        tenure: 12,
      },
      {
        id: "SCENARIO_BULLET",
        badge: "Fastest Settlement",
        title: "1-Month Bullet Clean",
        amount: bulletAmt,
        tenure: 1,
      },
    ];

    return configs.map((cfg) => {
      const evalCandidate = calculateCandidateLoan(
        cfg.amount,
        cfg.tenure,
        risk,
        rules,
        income,
        expenses,
        surplus,
        portfolioSafety
      );
      return {
        ...cfg,
        evaluation: evalCandidate,
      };
    });
  }, [optimalCandidate, minAmt, maxAmt, risk, rules, income, expenses, surplus, portfolioSafety]);

  return (
    <div className="mb-4">
      {/* Interactive Slider & Live Telemetry Panel */}
      <div className="studio-card mb-4">
        <div className="studio-card-header">
          <div className="d-flex align-items-center gap-2">
            <i className="fa-solid fa-sliders text-primary fs-5"></i>
            <div>
              <h5 className="fw-bold mb-0 text-dark">Live Interactive Loan Offer Simulator</h5>
              <small className="text-muted">Drag sliders to test any amount and tenure; all financial, risk, and safety formulas recalculate in real-time</small>
            </div>
          </div>
          <span className={`badge ${liveCandidate.isEligible ? "bg-success" : "bg-danger"} rounded-pill px-3 py-1 font-monospace`}>
            {liveCandidate.isEligible ? "ELIGIBLE / COMPLIANT ✓" : "POLICY VIOLATION ✗"}
          </span>
        </div>

        <div className="studio-card-body">
          <div className="row g-4">
            {/* Left Column: Sliders */}
            <div className="col-12 col-lg-6 border-end-lg">
              {/* Slider 1: Loan Amount */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="fw-bold text-dark mb-0">Simulated Loan Amount</label>
                  <span className="fs-4 fw-extrabold text-primary font-monospace">
                    {formatINR(sliderAmount)}
                  </span>
                </div>
                <input
                  type="range"
                  className="studio-slider"
                  min={minAmt}
                  max={maxAmt}
                  step={5000}
                  value={sliderAmount}
                  onChange={(e) => setSliderAmount(Number(e.target.value))}
                />
                <div className="d-flex justify-content-between text-muted small mt-1">
                  <span>Min: {formatINR(minAmt)}</span>
                  <span>Recommended: {formatINR(optimalCandidate?.amount || 50000)}</span>
                  <span>Max Cap: {formatINR(maxAmt)}</span>
                </div>
              </div>

              {/* Selector 2: Tenure */}
              <div className="mb-4">
                <label className="fw-bold text-dark mb-2 d-block">Simulated Tenure Period</label>
                <div className="d-flex flex-wrap gap-2">
                  {[1, 3, 6, 9, 12, 18, 24].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 fw-bold ${
                        sliderTenure === t ? "btn-primary" : "btn-outline-secondary"
                      }`}
                      onClick={() => setSliderTenure(t)}
                    >
                      {t === 1 ? "1M (Bullet)" : `${t} Months`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Warning Alert if Ineligible */}
              {!liveCandidate.isEligible && (
                <div className="alert alert-danger p-3 rounded-3 mb-0 small">
                  <div className="d-flex align-items-center gap-2 mb-1 fw-bold">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    <span>Constraint Violation Detected:</span>
                  </div>
                  <ul className="mb-0 ps-3">
                    {liveCandidate.violations.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column: Instant Live Output Metrics */}
            <div className="col-12 col-lg-6">
              <div className="row g-2">
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 text-center">
                    <span className="text-muted small d-block mb-1">Monthly Installment</span>
                    <strong className="fs-4 text-dark font-monospace">
                      {formatINR(liveCandidate.pricing.emi)}
                    </strong>
                    <span className="text-muted d-block small" style={{ fontSize: "0.72rem" }}>
                      {sliderTenure === 1 ? "Full Settlement" : `${sliderTenure} Equal EMIs`}
                    </span>
                  </div>
                </div>

                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 text-center">
                    <span className="text-muted small d-block mb-1">Annualized Rate (ROI)</span>
                    <strong className="fs-4 text-primary font-monospace">
                      {liveCandidate.pricing.annualRoi}%
                    </strong>
                    <span className="text-muted d-block small" style={{ fontSize: "0.72rem" }}>
                      Risk-adjusted Reducing Rate
                    </span>
                  </div>
                </div>

                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 text-center">
                    <span className="text-muted small d-block mb-1">Processing Fee (incl. GST)</span>
                    <strong className="fs-5 text-dark font-monospace">
                      {formatINR(liveCandidate.pricing.processingFee + liveCandidate.pricing.gst)}
                    </strong>
                    <span className="text-muted d-block small" style={{ fontSize: "0.72rem" }}>
                      Net: {formatINR(liveCandidate.pricing.netDisbursal)}
                    </span>
                  </div>
                </div>

                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 text-center">
                    <span className="text-muted small d-block mb-1">Expected Credit Loss (EL)</span>
                    <strong className="fs-5 text-danger font-monospace">
                      {formatINR(liveCandidate.expectedLossData.expectedLoss)}
                    </strong>
                    <span className="text-muted d-block small" style={{ fontSize: "0.72rem" }}>
                      EL Rate: {liveCandidate.expectedLossData.elRatePercentage}%
                    </span>
                  </div>
                </div>

                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 text-center">
                    <span className="text-muted small d-block mb-1">Resulting FOIR</span>
                    <strong className={`fs-5 font-monospace ${liveCandidate.affordability.newFOIR > 0.60 ? "text-danger" : "text-success"}`}>
                      {formatPercent(liveCandidate.affordability.newFOIR * 100)}
                    </strong>
                    <span className="text-muted d-block small" style={{ fontSize: "0.72rem" }}>
                      Cap: 60.0%
                    </span>
                  </div>
                </div>

                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 text-center">
                    <span className="text-muted small d-block mb-1">Company Margin</span>
                    <strong className="fs-5 text-success font-monospace">
                      {formatINR(liveCandidate.pricing.companyEconomics.estimatedCompanyMargin)}
                    </strong>
                    <span className="text-muted d-block small" style={{ fontSize: "0.72rem" }}>
                      Margin: {liveCandidate.pricing.companyEconomics.marginPercent}%
                    </span>
                  </div>
                </div>
              </div>

              {onSelectOffer && liveCandidate.isEligible && (
                <div className="mt-3">
                  <button
                    type="button"
                    className="btn btn-primary w-100 py-2 fw-bold rounded-pill shadow-xs"
                    onClick={() => onSelectOffer(liveCandidate)}
                  >
                    <i className="fa-solid fa-check-circle me-1"></i> Apply Selected Simulated Offer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Scenario Comparison Matrix */}
      <div className="studio-card">
        <div className="studio-card-header">
          <div className="d-flex align-items-center gap-2">
            <i className="fa-solid fa-table-columns text-primary fs-5"></i>
            <div>
              <h5 className="fw-bold mb-0 text-dark">Multi-Scenario Comparative Matrix</h5>
              <small className="text-muted">Side-by-side trade-off analysis across Conservative, Recommended, Aggressive, and Bullet structures</small>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="scenario-table">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Sanction Amount</th>
                <th>Tenure</th>
                <th>Monthly EMI</th>
                <th>ROI / APR</th>
                <th>FOIR</th>
                <th>Expected Loss</th>
                <th>Compliance Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {comparisonScenarios.map((sc) => {
                const evalData = sc.evaluation;
                return (
                  <tr key={sc.id} className={sc.isPrimary ? "highlight-selected" : ""}>
                    <td>
                      <div className="fw-bold text-dark">{sc.title}</div>
                      <span className="badge bg-light text-muted border small" style={{ fontSize: "0.72rem" }}>
                        {sc.badge}
                      </span>
                    </td>
                    <td className="fw-bold text-dark">{formatINR(sc.amount)}</td>
                    <td>{sc.tenure === 1 ? "30 Days" : `${sc.tenure} Months`}</td>
                    <td className="fw-bold font-monospace text-primary">{formatINR(evalData.pricing.emi)}</td>
                    <td>
                      <div>{evalData.pricing.annualRoi}% p.a.</div>
                      <small className="text-muted" style={{ fontSize: "0.72rem" }}>APR ~{evalData.pricing.illustrativeApr}%</small>
                    </td>
                    <td className={evalData.affordability.newFOIR > 0.60 ? "text-danger fw-bold" : "text-dark"}>
                      {formatPercent(evalData.affordability.newFOIR * 100)}
                    </td>
                    <td className="text-muted">
                      {formatINR(evalData.expectedLossData.expectedLoss)} ({evalData.expectedLossData.elRatePercentage}%)
                    </td>
                    <td>
                      {evalData.isEligible ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1 small">
                          <i className="fa-solid fa-check me-1"></i> Eligible
                        </span>
                      ) : (
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-1 small" title={evalData.primaryViolation}>
                          <i className="fa-solid fa-xmark me-1"></i> Violation
                        </span>
                      )}
                    </td>
                    <td>
                      {onSelectOffer && evalData.isEligible && (
                        <button
                          type="button"
                          className="btn btn-xs btn-outline-primary rounded-pill px-3 py-1"
                          onClick={() => onSelectOffer(evalData)}
                        >
                          Select
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OfferSimulator;
