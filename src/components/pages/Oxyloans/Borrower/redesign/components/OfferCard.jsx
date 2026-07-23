import React from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import "../redesign.css";

const OfferCard = ({ 
  offer, 
  processingFee, 
  onAccept, 
  onReject, 
  onExecute, 
  isLoading,
  updatingRowId,
  executingRowId
}) => {
  const amount = offer?.lenderInterestedAmount || offer?.amount || 0;
  const roi = offer?.roi || 0;
  const duration = offer?.duration || 0;
  const lenderName = offer?.lenderName || `Lender #${offer?.lenderId || "N/A"}`;
  
  const durationType = offer?.durationType || "Days";
  const repaymentMethod = offer?.repaymentMethodForLender || "PI";
  
  // Calculate Interest and Repayments
  let tenureDays = duration;
  let tenureMonths = duration / 30;
  let interest = 0;

  if (durationType.toLowerCase() === "months") {
    tenureDays = duration * 30;
    tenureMonths = duration;
    interest = amount * (roi / 100) * (duration / 12);
  } else {
    tenureDays = duration;
    tenureMonths = duration / 30;
    interest = amount * (roi / 100) * (duration / 365);
  }

  let repaymentLabel = "Est. Monthly EMI";
  let repaymentValue = "";

  if (repaymentMethod === "PI" || repaymentMethod.toLowerCase().includes("one time") || repaymentMethod.toLowerCase().includes("principal")) {
    repaymentLabel = "Total Repayment";
    const totalRepayment = amount + interest;
    repaymentValue = `₹ ${Math.round(totalRepayment).toLocaleString("en-IN")} (One-time)`;
  } else if (repaymentMethod === "I" || repaymentMethod.toLowerCase().startsWith("i")) {
    repaymentLabel = "Monthly Interest";
    const monthlyInterest = (amount * (roi / 100)) / 12;
    repaymentValue = `₹ ${Math.round(monthlyInterest).toLocaleString("en-IN")} / month`;
  } else {
    // Fallback EMI
    const monthlyRate = (roi / 100) / 12;
    const emiVal = monthlyRate > 0 && tenureMonths > 0
      ? (amount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1)
      : (amount + (amount * (roi / 100) * (tenureDays / 365))) / Math.max(1, tenureMonths);
    repaymentValue = `₹ ${Math.round(emiVal).toLocaleString("en-IN")} / month`;
  }

  const isUpdating = updatingRowId === offer.id;
  const isExecuting = executingRowId === offer.id;
  const actionLoading = isLoading || isUpdating || isExecuting;

  const borrowerStatus = String(offer?.borrowerStatus || "").toUpperCase().trim();
  const lenderStatus = String(offer?.lenderStatus || "").toUpperCase().trim();
  const loanStatus = String(offer?.loanStatus || "").toUpperCase().trim();

  const isExecuted = loanStatus === "EXECUTED" || loanStatus === "COMPLETED" || loanStatus === "DISBURSED";
  const isRejected = borrowerStatus === "BORROWER_REJECTED" || borrowerStatus === "REJECTED" || lenderStatus === "LENDER_REJECTED" || lenderStatus === "REJECTED";

  const hasBorrowerAgreement = offer?.borrowerAggrement !== null && offer?.borrowerAggrement !== undefined && offer?.borrowerAggrement !== "";
  const canAccept = !isExecuted && !isRejected && (borrowerStatus === "INITIATED" || borrowerStatus === "PENDING" || borrowerStatus === "");
  const canReject = !isExecuted && !isRejected && (borrowerStatus === "INITIATED" || borrowerStatus === "PENDING" || borrowerStatus === "PROCESSING" || borrowerStatus === "IN_PROGRESS" || borrowerStatus === "LOANACCEPTED" || borrowerStatus === "ACCEPTED" || borrowerStatus === "");
  const canExecute = !hasBorrowerAgreement && borrowerStatus === "LOANACCEPTED" && lenderStatus === "LOANACCEPTED" && (loanStatus === "LOANACCEPTED" || loanStatus === "PROCESSING" || loanStatus === "INITIATED");

  const getMandateStatus = (off) => {
    const raw = off?.mandateStatus || off?.MandateStatus || off?.borrowerMandateStatus || off?.enachStatus;
    if (!raw) return "NOT_FOUND";
    const norm = String(raw).trim().toUpperCase().replace(/[\s_-]/g, "");
    if (norm === "INITIATED") return "INITIATED";
    if (norm === "BANKAPPROVALPENDING" || norm === "BANK_APPROVAL_PENDING") return "BANK_APPROVAL_PENDING";
    if (norm === "SUCCESS" || norm === "ACTIVE") return "SUCCESS";
    if (norm === "FAILED") return "FAILED";
    if (norm === "ADMINREJECTED" || norm === "ADMIN_REJECTED") return "ADMINREJECTED";
    return "NOT_FOUND";
  };

  const mandateStatusValue = getMandateStatus(offer);
  const isMandatePendingOrSuccess = mandateStatusValue === "BANK_APPROVAL_PENDING" || mandateStatusValue === "SUCCESS";

  const showEnachBtn = !isMandatePendingOrSuccess && (
    offer?.borrowerEsignStatus === true || 
    offer?.borrowerEsignStatus === "true" || 
    offer?.borrowerEsigned === true || 
    offer?.borrowerEsigned === "true" || 
    offer?.MandateStatus === "NOT_FOUND" ||
    offer?.mandateStatus === "NOT_FOUND"
  );

  return (
    <div className="col-md-6 col-lg-4 d-flex">
      <div className="oxy-card w-100 d-flex flex-column justify-content-between">
        <div>
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <span className="text-muted d-block small uppercase text-uppercase">Lender</span>
              <h6 className="fw-bold mb-0 text-truncate" style={{ maxWidth: "160px" }}>{lenderName}</h6>
            </div>
            <StatusBadge status={lenderStatus === "LENDER_REJECTED" ? "LENDER_REJECTED" : (offer?.borrowerStatus || offer?.loanStatus)} />
          </div>

          <div className="bg-light p-3 rounded-3 mb-4">
            <span className="text-muted d-block small">Offered Amount</span>
            <h3 className="fw-bold mb-0 text-primary">₹ {Number(amount).toLocaleString("en-IN")}</h3>
          </div>

          <div className="space-y-2 mb-4">
            <div className="info-row">
              <span className="info-label">Interest Rate (ROI)</span>
              <span className="info-value text-dark">{roi}% p.a.</span>
            </div>
            <div className="info-row">
              <span className="info-label">Duration</span>
              <span className="info-value text-dark">{duration} {durationType}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Repayment Type</span>
              <span className="info-value text-dark fw-semibold">{repaymentMethod == "PI" ? "Principal + Interest" : "Only Interest"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Loan Agreement</span>
              <span className="info-value">
                {offer.borrowerAggrement !== null && offer.borrowerAggrement !== undefined && offer.borrowerAggrement !== "" ? (
                  <a 
                    href={offer.borrowerAggrement} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-success fw-bold text-decoration-none"
                    style={{ fontSize: "13px" }}
                  >
                  <i className="fa fa-external-link ms-1" style={{ fontSize: "11px" }}/> View Agreement
                  </a>
                ) : (
                  <span className="text-warning fw-semibold" style={{ fontSize: "13px" }}>
                    Pending
                  </span>
                )}
              </span>
            </div>
            {offer.borrowerAggrement !== null && offer.borrowerAggrement !== undefined && offer.borrowerAggrement !== "" && (
            <div className="info-row">
              <span className="info-label">eSign</span>
              <span className="info-value">
                {offer.borrowerEsigned === true && offer.lenderEsigned === true ? (
                  <span className="text-success fw-bold" style={{ fontSize: "13px" }}>
                    ✓ Signed
                  </span>
                ) : (
                  <span className="text-warning fw-semibold" style={{ fontSize: "13px" }}>
                    {offer.lenderEsigned === false ? "Waiting for Lender eSign" : "Pending"}
                  </span>
                )}
              </span>
            </div>
            )}
        {mandateStatusValue !== "NOT_FOUND" ?
          <div className="info-row">
              <span className="info-label">Mandate Status</span>
              <span className="info-value">
                {(() => {
                  let bgStyle = { backgroundColor: "#f3f4f6", color: "#4b5563", border: "1px solid #e5e7eb" };

                  if (mandateStatusValue === "INITIATED") {
                    bgStyle = { backgroundColor: "#e0f2fe", color: "#0369a1", border: "1px solid #bae6fd" };
                  } else if (mandateStatusValue === "BANK_APPROVAL_PENDING") {
                    bgStyle = { backgroundColor: "#fef3c7", color: "#d97706", border: "1px solid #fde68a" };
                  } else if (mandateStatusValue === "SUCCESS") {
                    bgStyle = { backgroundColor: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" };
                  } else if (mandateStatusValue === "FAILED") {
                    bgStyle = { backgroundColor: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca" };
                  } else if (mandateStatusValue === "ADMINREJECTED") {
                    bgStyle = { backgroundColor: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" };
                  } else if (mandateStatusValue === "NOT_FOUND") {
                    bgStyle = { backgroundColor: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" };
                  }

                  return (
                    <span className="badge px-2.5 py-1 rounded fw-semibold" style={{ fontSize: "11px", ...bgStyle }}>
                      {mandateStatusValue}
                    </span>
                  );
                })()}
              </span>
            </div>:null}
            <div className="info-row">
              <span className="info-label">Processing Fee</span>
              <span className="info-value text-dark">
                {processingFee !== undefined && processingFee !== null 
                  ? `₹ ${Number(processingFee).toFixed(2)}` 
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2 w-100 pt-3 border-top mt-auto">
          {canAccept && (
            <button 
              className="oxy-btn-primary flex-fill btn-success" 
              onClick={() => onAccept(offer)}
              disabled={actionLoading}
              style={{ backgroundColor: "var(--oxy-tertiary)" }}
            >
              {isUpdating ? "Accepting..." : "Accept"}
            </button>
          )}
          {canExecute && (
            <button 
              className="oxy-btn-primary flex-fill btn-primary" 
              onClick={() => onExecute(offer)}
              disabled={actionLoading}
            >
              {isExecuting ? "Executing..." : "Execute Loan"}
            </button>
          )}
          {canReject && (offer.borrowerAggrement === null || offer.borrowerAggrement === "" || offer.borrowerAggrement === undefined ) && (
            <button 
              className="oxy-btn-secondary flex-fill btn-outline-danger text-danger" 
              onClick={() => onReject(offer)}
              disabled={actionLoading}
            >
              {isUpdating ? "Rejecting..." : "Reject"}
            </button>
          )}
          {borrowerStatus === "LOANACCEPTED" && !offer.borrowerEsigned && offer.borrowerAggrement && offer.lenderEsigned && (
            <Link 
              to={`/esign/${offer.loanRequestId}`}
              className="oxy-btn-primary flex-fill btn-warning text-white text-center d-flex align-items-center justify-content-center"
              style={{ textDecoration: "none", fontSize: "12px", fontWeight: "600", borderRadius: "6px", padding: "8px 12px" }}
            >
              eSign Agreement
            </Link>
          )}
          {/* {isMandatePendingOrSuccess ? (
            <Link 
              to={`/borrower/repayment/${offer.loanRequestId}`}
              className="oxy-btn-primary flex-fill btn-success text-white text-center d-flex align-items-center justify-content-center"
              style={{ textDecoration: "none", fontSize: "12px", fontWeight: "600", borderRadius: "6px", padding: "8px 12px", backgroundColor: "#16a34a" }}
            >
              <i className="fa-solid fa-receipt me-1"></i> Repayment
            </Link>
          ) : */}
          {borrowerStatus === "LOANACCEPTED" && !offer.borrowerEsigned && offer.borrowerAggrement && offer.lenderEsigned && offer.borrowerEsigned && showEnachBtn ? (
            <Link 
              to={`/enach/${offer.loanRequestId}`}
              className="oxy-btn-primary flex-fill btn-info text-white text-center d-flex align-items-center justify-content-center"
              style={{ textDecoration: "none", fontSize: "12px", fontWeight: "600", borderRadius: "6px", padding: "8px 12px" }}
            >
              Register eNACH
            </Link>
          ) : null}
          {!canAccept && !canReject && !canExecute && !showEnachBtn && !isMandatePendingOrSuccess && !(borrowerStatus === "LOANACCEPTED" && !offer.borrowerEsigned && offer.borrowerAggrement) && (
            <button className="oxy-btn-secondary flex-fill text-muted" disabled>
              Processed
            </button>
          )}
        {offer.mandateStatus === "SUCCESS" &&  
        <div
            style={{
              backgroundColor: "#FFF3CD",
              color: "#856404",
              padding: "12px 16px",
              border: "1px solid #FFE69C",
              borderRadius: "8px",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            🚀 Disbursal is in progress. Please wait while we process your loan amount.
          </div> }
        </div>
      </div>
    </div>
  );
};

export default OfferCard;
