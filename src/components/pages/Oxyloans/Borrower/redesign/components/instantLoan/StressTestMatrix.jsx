import React from "react";
import { formatINR, formatPercent } from "./instantLoanCalculations";

const StressTestMatrix = ({ stressTests, proposedLoan }) => {
  if (!stressTests) return null;

  const { scenarios, overallStressPass, failCount, warningCount } = stressTests;

  return (
    <div className="studio-card mb-4">
      <div className="studio-card-header">
        <div className="d-flex align-items-center gap-2">
          <i className="fa-solid fa-bolt-lightning text-warning fs-5"></i>
          <div>
            <h5 className="fw-bold mb-0 text-dark">Automated Macro & Personal Stress Testing Engine</h5>
            <small className="text-muted">Simulates 6 severe shock conditions to ensure loan repayment survivability under economic distress</small>
          </div>
        </div>
        <div>
          {overallStressPass ? (
            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 font-monospace">
              <i className="fa-solid fa-shield-check me-1"></i> RESILIENT / ALL SCENARIOS PASSED
            </span>
          ) : (
            <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3 py-1 font-monospace">
              <i className="fa-solid fa-triangle-exclamation me-1"></i> {failCount} SHOCK SCENARIOS FAILED
            </span>
          )}
        </div>
      </div>

      <div className="studio-card-body p-0">
        <div className="table-responsive">
          <table className="scenario-table mb-0">
            <thead>
              <tr>
                <th>Adverse Shock Scenario</th>
                <th>Hypothesis & Assumption</th>
                <th>Stressed Net Surplus</th>
                <th>Stressed FOIR</th>
                <th>Stressed 12M PD</th>
                <th>Stressed Loss (EL)</th>
                <th>Stress Result</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((sc) => {
                const statusBadge =
                  sc.status === "PASS" ? (
                    <span className="stress-pill-pass">PASS ✓</span>
                  ) : sc.status === "WARNING" ? (
                    <span className="stress-pill-warning">WARNING ⚠</span>
                  ) : (
                    <span className="stress-pill-fail">FAIL ✗</span>
                  );

                return (
                  <tr key={sc.id}>
                    <td>
                      <strong className="text-dark d-block">{sc.title}</strong>
                      <span className="text-muted small font-monospace" style={{ fontSize: "0.72rem" }}>
                        {sc.id}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted small">{sc.description}</span>
                    </td>
                    <td className="fw-bold font-monospace text-dark">
                      {formatINR(sc.stressedSurplus)}
                    </td>
                    <td className={`font-monospace fw-bold ${sc.stressedFOIR > 70 ? "text-danger" : "text-dark"}`}>
                      {sc.stressedFOIR}%
                    </td>
                    <td className="font-monospace text-muted">
                      {sc.stressedPD}%
                    </td>
                    <td className="font-monospace text-danger">
                      {formatINR(sc.stressedEL)}
                    </td>
                    <td>{statusBadge}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-footer bg-light p-3 border-top">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 small text-muted">
          <span>
            <i className="fa-solid fa-circle-info text-primary me-1"></i>
            Stressed FOIR Failure Threshold: <strong>75.0%</strong> • Max Safe Stressed PD: <strong>12.5%</strong>
          </span>
          <span>
            Sanctioned Base Installment: <strong>{formatINR(proposedLoan?.emi || 0)}/mo</strong>
          </span>
        </div>
      </div>
    </div>
  );
};

export default StressTestMatrix;
