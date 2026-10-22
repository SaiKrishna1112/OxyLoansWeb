import React, { useState } from "react";
import { runInstantLoanUnitTests } from "./instantLoanTests";

const UnitTestRunnerModal = ({ onClose }) => {
  const [testSuiteResults, setTestSuiteResults] = useState(runInstantLoanUnitTests());
  const [isRunning, setIsRunning] = useState(false);

  const handleRerun = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = runInstantLoanUnitTests();
      setTestSuiteResults(results);
      setIsRunning(false);
    }, 400);
  };

  return (
    <div className="studio-card mb-4">
      <div className="studio-card-header bg-dark text-white">
        <div className="d-flex align-items-center gap-2">
          <i className="fa-solid fa-vial-circle-check text-success fs-5"></i>
          <div>
            <h5 className="fw-bold mb-0 text-white">Automated Underwriting Engine Unit Test Verification</h5>
            <small className="text-light opacity-75">Live in-browser test runner asserting formula integrity, constraints, and credit loss mathematics</small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-light rounded-pill px-3"
            onClick={handleRerun}
            disabled={isRunning}
          >
            <i className={`fa-solid fa-arrows-rotate me-1 ${isRunning ? "fa-spin" : ""}`}></i>
            Rerun Tests
          </button>
          {onClose && (
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          )}
        </div>
      </div>

      <div className="studio-card-body">
        {/* Results Summary Bar */}
        <div className="p-3 bg-light rounded-3 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <span className={`badge ${testSuiteResults.allPassed ? "bg-success" : "bg-danger"} fs-6 rounded-pill px-3 py-1 font-monospace`}>
              {testSuiteResults.allPassed ? `ALL ${testSuiteResults.total} TESTS PASSED ✓` : `${testSuiteResults.failed} TESTS FAILED ✗`}
            </span>
            <span className="text-muted small">
              Passed: <strong className="text-success">{testSuiteResults.passed}</strong> / Total: {testSuiteResults.total}
            </span>
          </div>

          <span className="text-muted small">
            Execution Environment: <strong>In-Browser React Virtual Thread</strong>
          </span>
        </div>

        {/* Test List */}
        <div className="table-responsive">
          <table className="scenario-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>#</th>
                <th>Test Case Description</th>
                <th>Status</th>
                <th>Assertion Telemetry</th>
              </tr>
            </thead>
            <tbody>
              {testSuiteResults.results.map((t, idx) => (
                <tr key={idx}>
                  <td className="font-monospace text-muted small">{idx + 1}</td>
                  <td>
                    <strong className="text-dark small">{t.name}</strong>
                  </td>
                  <td>
                    {t.passed ? (
                      <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1 small">
                        PASS ✓
                      </span>
                    ) : (
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2 py-1 small">
                        FAIL ✗
                      </span>
                    )}
                  </td>
                  <td className="font-monospace small text-muted">
                    {t.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-footer bg-light p-3 border-top small text-muted">
        <i className="fa-solid fa-code text-primary me-1"></i>
        These unit test functions can be imported into standard Jest/Vitest/Mocha pipelines or executed in CI/CD without browser dependencies.
      </div>
    </div>
  );
};

export default UnitTestRunnerModal;
