import React, { useState } from "react";
import { formatINR } from "./instantLoanCalculations";
import {
  getDecisionAudits,
  clearDecisionAudits,
  exportAuditsToJSON,
} from "./instantLoanAuditService";
import Swal from "sweetalert2";

const DecisionAuditView = () => {
  const [audits, setAudits] = useState(getDecisionAudits());
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleClear = () => {
    Swal.fire({
      title: "Clear All Decision Audits?",
      text: "This removes the local historical decision record.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Clear",
    }).then((res) => {
      if (res.isConfirmed) {
        clearDecisionAudits();
        setAudits([]);
        setSelectedAudit(null);
      }
    });
  };

  const filteredAudits = audits.filter(
    (a) =>
      a.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.pan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.decision?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="studio-card mb-4">
      <div className="studio-card-header">
        <div className="d-flex align-items-center gap-2">
          <i className="fa-solid fa-clock-rotate-left text-primary fs-5"></i>
          <div>
            <h5 className="fw-bold mb-0 text-dark">Automated Decision Audit Trail & Governance Ledger</h5>
            <small className="text-muted">Immutable frontend log of every underwritten decision, input snapshot, rule version, and reason code</small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary rounded-pill px-3"
            onClick={exportAuditsToJSON}
            disabled={audits.length === 0}
          >
            <i className="fa-solid fa-file-export me-1"></i> Export Audits (JSON)
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger rounded-pill px-3"
            onClick={handleClear}
            disabled={audits.length === 0}
          >
            <i className="fa-solid fa-trash me-1"></i> Clear Log
          </button>
        </div>
      </div>

      <div className="studio-card-body">
        {/* Search Filter */}
        <div className="mb-3">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-light border-end-0">
              <i className="fa-solid fa-magnifying-glass text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search audit trail by applicant name, PAN, audit ref, or decision..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredAudits.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="fa-solid fa-clipboard-list fs-1 opacity-50 mb-2"></i>
            <p className="mb-0">No decision audit entries recorded yet.</p>
            <small>Evaluations are automatically logged whenever an underwriting decision runs.</small>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="scenario-table">
              <thead>
                <tr>
                  <th>Audit Reference</th>
                  <th>Timestamp</th>
                  <th>Applicant / PAN</th>
                  <th>Requested</th>
                  <th>Sanctioned</th>
                  <th>Decision</th>
                  <th>Rule Version</th>
                  <th>Inspector</th>
                </tr>
              </thead>
              <tbody>
                {filteredAudits.map((a) => {
                  const decisionBadge =
                    a.decision === "APPROVE"
                      ? "bg-success"
                      : a.decision === "APPROVE_REDUCED_AMOUNT"
                      ? "bg-primary"
                      : a.decision === "REVIEW"
                      ? "bg-warning"
                      : "bg-danger";

                  return (
                    <tr key={a.id}>
                      <td className="font-monospace small fw-bold text-dark">{a.id}</td>
                      <td className="small text-muted">{new Date(a.timestamp).toLocaleString()}</td>
                      <td>
                        <strong className="text-dark small d-block">{a.customerName}</strong>
                        <span className="text-muted font-monospace small" style={{ fontSize: "0.72rem" }}>
                          {a.pan}
                        </span>
                      </td>
                      <td className="font-monospace text-muted">{formatINR(a.requestedAmount)}</td>
                      <td className="font-monospace fw-bold text-dark">{formatINR(a.recommendedAmount)}</td>
                      <td>
                        <span className={`badge ${decisionBadge} rounded-pill px-2 py-1 small font-monospace`}>
                          {a.decision}
                        </span>
                      </td>
                      <td className="font-monospace small text-muted">{a.ruleVersion}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-xs btn-outline-secondary rounded-pill px-2 py-1"
                          onClick={() => setSelectedAudit(a)}
                        >
                          <i className="fa-solid fa-eye me-1"></i> Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Audit Inspector Modal / Drawer */}
        {selectedAudit && (
          <div className="card mt-4 border-primary shadow-sm bg-light">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
              <div>
                <strong className="text-dark">Audit Details: {selectedAudit.id}</strong>
                <span className="text-muted small ms-2">• {selectedAudit.customerName}</span>
              </div>
              <button
                type="button"
                className="btn-close btn-sm"
                onClick={() => setSelectedAudit(null)}
              ></button>
            </div>
            <div className="card-body">
              <div className="row g-3 mb-3">
                <div className="col-3">
                  <div className="p-2 bg-white rounded border small">
                    <span className="text-muted d-block" style={{ fontSize: "0.72rem" }}>Decision</span>
                    <strong className="text-dark">{selectedAudit.decision}</strong>
                  </div>
                </div>
                <div className="col-3">
                  <div className="p-2 bg-white rounded border small">
                    <span className="text-muted d-block" style={{ fontSize: "0.72rem" }}>Requested vs Sanctioned</span>
                    <strong className="text-dark">{formatINR(selectedAudit.requestedAmount)} → {formatINR(selectedAudit.recommendedAmount)}</strong>
                  </div>
                </div>
                <div className="col-3">
                  <div className="p-2 bg-white rounded border small">
                    <span className="text-muted d-block" style={{ fontSize: "0.72rem" }}>PD / Loss</span>
                    <strong className="text-dark">{selectedAudit.pd}% (Score: {selectedAudit.creditScore})</strong>
                  </div>
                </div>
                <div className="col-3">
                  <div className="p-2 bg-white rounded border small">
                    <span className="text-muted d-block" style={{ fontSize: "0.72rem" }}>Resulting FOIR</span>
                    <strong className="text-dark">{selectedAudit.newFOIR}%</strong>
                  </div>
                </div>
              </div>

              <h6 className="fw-bold text-dark small mb-2">Recorded Reason Codes:</h6>
              {selectedAudit.reasons.map((r, i) => (
                <div key={i} className="p-2 bg-white rounded border-start border-3 border-primary mb-1 small">
                  <strong>{r.title} ({r.code})</strong>
                  <p className="text-muted mb-0">{r.detail}</p>
                </div>
              ))}

              <details className="mt-3">
                <summary className="text-primary small cursor-pointer fw-semibold">
                  View Full Input Telemetry Snapshot (JSON)
                </summary>
                <pre className="p-3 bg-dark text-light rounded mt-2 small font-monospace" style={{ maxHeight: "250px", overflowY: "auto" }}>
                  {JSON.stringify(selectedAudit.fullSnapshot, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DecisionAuditView;
