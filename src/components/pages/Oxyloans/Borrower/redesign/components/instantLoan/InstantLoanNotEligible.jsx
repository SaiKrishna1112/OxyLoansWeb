import React from "react";
import { Link, useNavigate } from "react-router-dom";

const InstantLoanNotEligible = ({ verificationResult, onRetry }) => {
  const navigate = useNavigate();

  // 30 days cooldown calculation
  const cooldownDate = new Date();
  cooldownDate.setDate(cooldownDate.getDate() + 30);
  const formattedCooldownDate = cooldownDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fintech-card text-center mx-auto" style={{ maxWidth: "780px" }}>
      {/* Icon & Status */}
      <div
        className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4 shadow-xs"
        style={{
          width: "80px",
          height: "80px",
          backgroundColor: "#fef2f2",
          color: "#dc2626",
          border: "2px solid #fee2e2",
        }}
      >
        <i className="fa-solid fa-clock-rotate-left fa-2xl"></i>
      </div>

      <span className="badge badge-fintech-danger-soft px-3 py-1 rounded-pill small mb-2">
        Underwriting Notice • 30-Day Cooling Period
      </span>

      <h3 className="fw-bold text-dark mb-2">You Can Re-Apply After 30 Days</h3>
      
      <p className="text-muted small mx-auto mb-4" style={{ maxWidth: "560px", lineHeight: "1.6" }}>
        Based on our algorithmic risk underwriting and credit bureau assessment, we are currently unable to approve an instant P2P loan request at this time.
      </p>

      {/* Cooldown Highlight Box */}
      <div className="p-4 bg-light rounded-4 border mb-4 text-start mx-auto" style={{ maxWidth: "620px" }}>
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="fw-bold text-dark small d-flex align-items-center gap-2">
            <i className="fa-solid fa-calendar-check text-primary fs-5"></i>
            Next Eligible Application Date
          </span>
          <span className="badge badge-fintech-primary rounded-pill px-3 py-1 small">
            30 Days Cooldown
          </span>
        </div>
        <h4 className="fw-bold text-primary mb-1">{formattedCooldownDate}</h4>
        <small className="text-muted" style={{ fontSize: "11px" }}>
          You will receive an automated SMS and email notification when your cooling period ends.
        </small>
      </div>

      {/* Primary Underwriting Diagnostics */}
      <div className="p-4 rounded-4 border text-start mx-auto mb-4 bg-white shadow-xs" style={{ maxWidth: "620px" }}>
        <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <i className="fa-solid fa-sliders text-warning"></i>
          Recommended Steps to Boost Your Credit Profile:
        </h6>
        
        <div className="d-flex flex-column gap-3 small">
          <div className="d-flex align-items-start gap-3">
            <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: "28px", height: "28px" }}>
              <i className="fa-solid fa-credit-card small" style={{ fontSize: "10px" }}></i>
            </div>
            <div>
              <strong className="text-dark d-block">Lower Credit Card Utilization</strong>
              <span className="text-muted" style={{ fontSize: "11px" }}>
                Keep total credit card balances under 30% of total sanctioned limits across all active cards.
              </span>
            </div>
          </div>

          <div className="d-flex align-items-start gap-3">
            <div className="rounded-circle bg-success bg-opacity-10 text-success p-2 d-flex align-items-center justify-content-center" style={{ width: "28px", height: "28px" }}>
              <i className="fa-solid fa-calendar-days small" style={{ fontSize: "10px" }}></i>
            </div>
            <div>
              <strong className="text-dark d-block">Maintain 100% On-Time Repayments</strong>
              <span className="text-muted" style={{ fontSize: "11px" }}>
                Ensure zero missed or delayed payments for EMIs, utility bills, and credit card dues.
              </span>
            </div>
          </div>

          <div className="d-flex align-items-start gap-3">
            <div className="rounded-circle bg-warning bg-opacity-10 text-warning p-2 d-flex align-items-center justify-content-center" style={{ width: "28px", height: "28px" }}>
              <i className="fa-solid fa-shield-halved small" style={{ fontSize: "10px" }}></i>
            </div>
            <div>
              <strong className="text-dark d-block">Avoid Simultaneous Hard Enquiries</strong>
              <span className="text-muted" style={{ fontSize: "11px" }}>
                Refrain from submitting multiple loan or card applications within a short window.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex flex-wrap justify-content-center gap-3">
        <Link
          to="/borrower-credit-report"
          className="btn btn-outline-primary px-4 py-2 rounded-3 fw-bold"
        >
          <i className="fa-solid fa-chart-pie me-2"></i>
          Inspect Detailed Credit Report
        </Link>

        <button
          type="button"
          className="btn btn-primary px-4 py-2 rounded-3 fw-bold text-white shadow-sm"
          style={{ backgroundColor: "#0040e0", borderColor: "#0040e0" }}
          onClick={() => navigate("/borrowerDashboard")}
        >
          Return to Dashboard
        </button>

        {onRetry && (
          <button
            type="button"
            className="btn btn-link text-muted small"
            onClick={onRetry}
          >
            <i className="fa-solid fa-rotate-left me-1"></i> Retry Assessment (Demo)
          </button>
        )}
      </div>
    </div>
  );
};

export default InstantLoanNotEligible;
