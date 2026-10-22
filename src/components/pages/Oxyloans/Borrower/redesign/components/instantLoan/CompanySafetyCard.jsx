import React from "react";
import { formatINR } from "./instantLoanCalculations";

const CompanySafetyCard = ({ portfolioSafety, candidateAmount }) => {
  if (!portfolioSafety) return null;

  const {
    newBorrowerExposure,
    newEmployerExposure,
    newGeoExposure,
    availableLiquidity,
    companySafetyScore,
    limits,
    isSafe,
    safetyViolations,
  } = portfolioSafety;

  const employerUtilPct = Math.min(100, Math.round((newEmployerExposure / limits.maxEmployerConcentration) * 100));
  const geoUtilPct = Math.min(100, Math.round((newGeoExposure / limits.maxGeoConcentration) * 100));
  const borrowerUtilPct = Math.min(100, Math.round((newBorrowerExposure / limits.maxSingleBorrowerExposure) * 100));

  return (
    <div className="studio-card mb-4">
      <div className="studio-card-header">
        <div className="d-flex align-items-center gap-2">
          <i className="fa-solid fa-building-shield text-primary fs-5"></i>
          <div>
            <h5 className="fw-bold mb-0 text-dark">Institutional Company Safety & Concentration Guard</h5>
            <small className="text-muted">Protects lending book against borrower overexposure, corporate cluster risks, and geo concentrations</small>
          </div>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small fw-bold">Company Safety Score:</span>
          <span className={`badge ${companySafetyScore >= 80 ? "bg-success" : companySafetyScore >= 60 ? "bg-warning" : "bg-danger"} fs-6 rounded-pill px-3 py-1 font-monospace`}>
            {companySafetyScore}/100
          </span>
        </div>
      </div>

      <div className="studio-card-body">
        {/* Safety Constraint Alert if Violations Exist */}
        {!isSafe && (
          <div className="alert alert-danger p-3 rounded-3 mb-4 small">
            <div className="d-flex align-items-center gap-2 mb-1 fw-bold">
              <i className="fa-solid fa-ban text-danger"></i>
              <span>Institutional Policy Safeguard Active:</span>
            </div>
            <p className="mb-1 text-secondary">
              The proposed loan amount triggers an institutional safety ceiling. Final sanction is bounded by:
            </p>
            <ul className="mb-0 ps-3">
              {safetyViolations.map((v, idx) => (
                <li key={idx} className="fw-semibold text-danger">{v}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="row g-4">
          {/* Concentration Meter 1: Employer Concentration */}
          <div className="col-12 col-md-4">
            <div className="p-3 bg-light rounded-3 h-100">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="fw-bold text-dark small">Employer Concentration</span>
                <span className={`fw-bold small font-monospace ${employerUtilPct > 85 ? "text-danger" : "text-primary"}`}>
                  {employerUtilPct}%
                </span>
              </div>
              <div className="progress rounded-pill mb-2" style={{ height: "8px" }}>
                <div
                  className={`progress-bar ${employerUtilPct > 85 ? "bg-danger" : "bg-primary"}`}
                  style={{ width: `${employerUtilPct}%` }}
                />
              </div>
              <div className="text-muted small" style={{ fontSize: "0.78rem" }}>
                Total Allocated: <strong>{formatINR(newEmployerExposure)}</strong> / Cap: {formatINR(limits.maxEmployerConcentration)}
              </div>
            </div>
          </div>

          {/* Concentration Meter 2: Regional / Geo Concentration */}
          <div className="col-12 col-md-4">
            <div className="p-3 bg-light rounded-3 h-100">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="fw-bold text-dark small">City / Regional Concentration</span>
                <span className={`fw-bold small font-monospace ${geoUtilPct > 85 ? "text-danger" : "text-info"}`}>
                  {geoUtilPct}%
                </span>
              </div>
              <div className="progress rounded-pill mb-2" style={{ height: "8px" }}>
                <div
                  className={`progress-bar ${geoUtilPct > 85 ? "bg-danger" : "bg-info"}`}
                  style={{ width: `${geoUtilPct}%` }}
                />
              </div>
              <div className="text-muted small" style={{ fontSize: "0.78rem" }}>
                Total Allocated: <strong>{formatINR(newGeoExposure)}</strong> / Cap: {formatINR(limits.maxGeoConcentration)}
              </div>
            </div>
          </div>

          {/* Concentration Meter 3: Single Borrower Cap */}
          <div className="col-12 col-md-4">
            <div className="p-3 bg-light rounded-3 h-100">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="fw-bold text-dark small">Single Borrower Exposure</span>
                <span className={`fw-bold small font-monospace ${borrowerUtilPct > 80 ? "text-warning" : "text-success"}`}>
                  {borrowerUtilPct}%
                </span>
              </div>
              <div className="progress rounded-pill mb-2" style={{ height: "8px" }}>
                <div
                  className={`progress-bar ${borrowerUtilPct > 80 ? "bg-warning" : "bg-success"}`}
                  style={{ width: `${borrowerUtilPct}%` }}
                />
              </div>
              <div className="text-muted small" style={{ fontSize: "0.78rem" }}>
                Current + New: <strong>{formatINR(newBorrowerExposure)}</strong> / Max Limit: {formatINR(limits.maxSingleBorrowerExposure)}
              </div>
            </div>
          </div>
        </div>

        {/* Institutional Escrow Liquidity Buffer */}
        <div className="p-3 bg-soft-primary border rounded-3 mt-3 d-flex flex-wrap align-items-center justify-content-between gap-2 small">
          <div>
            <i className="fa-solid fa-vault text-primary me-2"></i>
            <span>Certified Lending Partner Escrow Pool: <strong>{formatINR(limits.partnerEscrowPoolLimit)}</strong></span>
          </div>
          <div>
            <span>Liquid Reserve Cushion: <strong className="text-success">{formatINR(availableLiquidity)}</strong> (Buffer Floor: {formatINR(limits.minLiquidityBuffer)})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySafetyCard;
