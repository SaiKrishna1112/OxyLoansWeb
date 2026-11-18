import React from "react";
import "./instantLoan.css";

export const STEPS = [
  {
    id: 1,
    phase: "Phase 1",
    label: "Borrower Profile",
    sub: "KYC & Personal Details",
    icon: "fa-user-check",
  },
  {
    id: 2,
    phase: "Phase 2",
    label: "Income Verification",
    sub: "Bank Statement & Payslip",
    icon: "fa-building-columns",
  },
  {
    id: 3,
    phase: "Phase 3",
    label: "Pre-Eligibility & Fee",
    sub: "References & ₹150 Fee",
    icon: "fa-users-viewfinder",
  },
  {
    id: 4,
    phase: "Phase 4",
    label: "Bureau & CIR Check",
    sub: "Paysprint Soft Check",
    icon: "fa-shield-halved",
  },
  {
    id: 5,
    phase: "Phase 5",
    label: "Choose Loan Plan",
    sub: "Amount & Repayment",
    icon: "fa-sliders",
  },
  {
    id: 6,
    phase: "Phase 6",
    label: "Lender Offers",
    sub: "Offers Received",
    icon: "fa-hand-holding-dollar",
  },
  {
    id: 7,
    phase: "Phase 7",
    label: "eSign Agreement",
    sub: "Aadhaar eSign",
    icon: "fa-file-signature",
  },
  {
    id: 8,
    phase: "Phase 8",
    label: "eNACH Mandate",
    sub: "Automated Auto-Debit",
    icon: "fa-repeat",
  },
  {
    id: 9,
    phase: "Phase 9",
    label: "Disbursal",
    sub: "Escrow IMPS Disbursal",
    icon: "fa-money-bill-transfer",
  },
];

/**
 * InstantLoanStepper
 * Left-side vertical phase stepper sidebar for desktop screens,
 * with responsive horizontal compact adaptation for mobile viewports.
 */
const InstantLoanStepper = ({
  currentStep = 1,
  maxReachedStep = null,
  onStepClick,
  isWaitingForLender = false,
  isModalMode = false,
  onClose,
}) => {
  const currentMeta = STEPS.find((s) => s.id === currentStep) || STEPS[0];
  const totalSteps = STEPS.length;
  const highestStep = Math.max(maxReachedStep || 1, currentStep);
  const progressPercent = Math.round(((Math.max(highestStep, currentStep) - 1) / (totalSteps - 1)) * 100);

  if (isModalMode) {
    return (
      <div className="steps-modal-card">
        {/* Modal Drawer Header */}
        <div className="p-3 border-bottom bg-white d-flex align-items-center justify-content-between">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span
                className="badge rounded-pill px-2.5 py-1 small fw-bold"
                style={{
                  background: isWaitingForLender ? "rgba(217, 119, 6, 0.12)" : "rgba(0, 82, 255, 0.12)",
                  color: isWaitingForLender ? "#d97706" : "#0052ff",
                  fontSize: "11px",
                }}
              >
                {isWaitingForLender && currentStep === 5 ? "Phase 5 • Awaiting Lender" : `Phase ${currentStep} of ${totalSteps}`}
              </span>
              <span className="fw-bold small font-monospace text-primary">
                {isWaitingForLender && currentStep === 5 ? "72% Submitted" : `${progressPercent}% Complete`}
              </span>
            </div>
            <h6 className="fw-bold text-dark mb-0 fs-6">Instant Loan Journey</h6>
            <small className="text-muted" style={{ fontSize: "11px" }}>Click any completed phase to review</small>
          </div>

          {onClose && (
            <button
              type="button"
              className="btn btn-sm btn-light rounded-circle p-1 d-flex align-items-center justify-content-center shadow-xs"
              onClick={onClose}
              style={{ width: "32px", height: "32px" }}
              title="Close steps drawer"
            >
              <i className="fa-solid fa-xmark fs-6"></i>
            </button>
          )}
        </div>

        {/* Progress Fill Bar */}
        <div className="stepper-progress-track" style={{ height: "4px" }}>
          <div
            className="stepper-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Modal Drawer Body (Vertical Timeline) */}
        <div className="steps-modal-body">
          <div className="stepper-vertical-timeline position-relative">
            {STEPS.map((s, idx) => {
              const isDone = highestStep > s.id;
              const isCurrent = currentStep === s.id;
              const isClickable = s.id <= highestStep;
              const isLast = idx === STEPS.length - 1;

              return (
                <div
                  key={s.id}
                  className={`stepper-v-row d-flex align-items-start position-relative ${
                    isDone ? "cursor-pointer stepper-v-done" : isCurrent ? "stepper-v-active" : "stepper-v-pending"
                  }`}
                  onClick={() => {
                    if (isClickable && onStepClick) {
                      onStepClick(s.id);
                      if (onClose) onClose();
                    }
                  }}
                  title={isClickable ? `Jump to ${s.phase}: ${s.label}` : undefined}
                  style={{
                    paddingBottom: isLast ? "2px" : "16px",
                    cursor: isClickable ? "pointer" : "default",
                  }}
                >
                  {/* Connecting Line between step nodes */}
                  {!isLast && (
                    <div
                      className={`stepper-v-connector ${isDone ? "completed" : ""}`}
                      style={{
                        position: "absolute",
                        left: "16px",
                        top: "34px",
                        bottom: "0",
                        width: "2px",
                        backgroundColor: isDone ? "#10b981" : "#e2e8f0",
                        zIndex: 1,
                        transition: "background-color 0.3s ease",
                      }}
                    />
                  )}

                  {/* Node Circle */}
                  <div
                    className={`stepper-node-circle me-3 ${
                      isDone
                        ? "stepper-node-done"
                        : isCurrent
                        ? "stepper-node-active"
                        : "stepper-node-pending"
                    }`}
                    style={{
                      width: "32px",
                      height: "32px",
                      minWidth: "32px",
                      fontSize: "0.82rem",
                      zIndex: 2,
                    }}
                  >
                    {isDone ? (
                      <i className="fa-solid fa-check"></i>
                    ) : (
                      <i className={`fa-solid ${s.icon} ${isCurrent ? "" : "opacity-75"}`}></i>
                    )}
                  </div>

                  {/* Step Label & Subtext */}
                  <div className="flex-grow-1 overflow-hidden pt-0.5">
                    <div className="d-flex align-items-center justify-content-between gap-1 mb-0.5">
                      <span
                        className="fw-bold text-uppercase"
                        style={{
                          fontSize: "9.5px",
                          letterSpacing: "0.5px",
                          color: isCurrent ? "#0052ff" : isDone ? "#059669" : "#94a3b8",
                        }}
                      >
                        {s.phase}
                      </span>
                      {isDone && (
                        <span className="badge bg-success-subtle text-success rounded-pill" style={{ fontSize: "9px" }}>
                          ✓ Done
                        </span>
                      )}
                      {isCurrent && !isWaitingForLender && (
                        <span className="badge bg-primary-subtle text-primary rounded-pill animate-pulse" style={{ fontSize: "9px" }}>
                          Active
                        </span>
                      )}
                      {isWaitingForLender && s.id === 5 && (
                        <span className="badge bg-warning text-dark rounded-pill" style={{ fontSize: "9px" }}>
                          Linked ✓
                        </span>
                      )}
                      {isWaitingForLender && s.id === 6 && (
                        <span className="badge bg-secondary-subtle text-secondary rounded-pill" style={{ fontSize: "9px" }}>
                          🔒 Waiting
                        </span>
                      )}
                    </div>

                    <div
                      className={`fw-semibold text-truncate ${
                        isCurrent
                          ? "text-primary fw-bold"
                          : isDone
                          ? "text-dark"
                          : "text-muted"
                      }`}
                      style={{ fontSize: "12.5px" }}
                    >
                      {s.label}
                    </div>

                    <div
                      className="text-muted text-truncate"
                      style={{ fontSize: "10.5px", marginTop: "0px" }}
                    >
                      {isWaitingForLender && s.id === 5
                        ? "Awaiting Lender Agreement"
                        : isWaitingForLender && s.id === 6
                        ? "Lender must sign first"
                        : isDone
                        ? "✓ Information Verified"
                        : isCurrent
                        ? "Complete Required Details"
                        : s.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Drawer Footer */}
        <div className="p-3 bg-light border-top">
          <div className="d-flex align-items-center justify-content-between gap-2">
            <div className="d-flex align-items-center gap-2">
              <div className="rounded-circle bg-success bg-opacity-10 text-success p-1.5 d-flex align-items-center justify-content-center" style={{ width: "26px", height: "26px" }}>
                <i className="fa-solid fa-shield-check small"></i>
              </div>
              <small className="text-muted" style={{ fontSize: "11px" }}>Bank-Grade Escrow Security</small>
            </div>
            {onClose && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 fw-semibold"
                onClick={onClose}
                style={{ fontSize: "11.5px" }}
              >
                Close Drawer
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ===================================================================
          1. DESKTOP / TABLET (>=992px): VERTICAL STEPPER ON LEFT SIDE OF SCREEN
          =================================================================== */}
      <div className="d-none d-lg-block instant-stepper-left-card shadow-sm">
        {/* Stepper Header */}
        <div className="p-2.5 px-3 border-bottom bg-white rounded-top-4">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span
              className="badge rounded-pill px-2.5 py-1 small fw-bold"
              style={{ background: isWaitingForLender ? "rgba(217, 119, 6, 0.12)" : "rgba(0, 82, 255, 0.12)", color: isWaitingForLender ? "#d97706" : "#0052ff", fontSize: "11px" }}
            >
              {isWaitingForLender && currentStep === 5 ? "Phase 5 • Awaiting Lender" : `${currentMeta.phase} of ${totalSteps}`}
            </span>
            <span className="fw-bold small font-monospace text-primary">
              {isWaitingForLender && currentStep === 5 ? "72% Submitted" : `${progressPercent}% Complete`}
            </span>
          </div>

          <h6 className="fw-bold text-dark mb-1 fs-6">Instant Loan Journey</h6>
          <p className="text-muted small mb-2" style={{ fontSize: "11.5px" }}>
            Complete all 7 phases to trigger instant escrow matching.
          </p>

          {/* Progress Fill Bar */}
          <div className="stepper-progress-track" style={{ height: "6px" }}>
            <div
              className="stepper-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Vertical Step Timeline */}
        <div className="p-2.5 px-3 bg-white">
          <div className="stepper-vertical-timeline position-relative">
            {STEPS.map((s, idx) => {
              const isDone = highestStep > s.id;
              const isCurrent = currentStep === s.id;
              const isClickable = s.id <= highestStep;
              const isPending = highestStep < s.id;
              const isLast = idx === STEPS.length - 1;

              return (
                <div
                  key={s.id}
                  className={`stepper-v-row d-flex align-items-start position-relative ${
                    isDone ? "cursor-pointer stepper-v-done" : isCurrent ? "stepper-v-active" : "stepper-v-pending"
                  }`}
                  onClick={() => {
                    if (isClickable && onStepClick) onStepClick(s.id);
                  }}
                  title={isClickable ? `Review ${s.phase}: ${s.label}` : undefined}
                  style={{
                    paddingBottom: isLast ? "2px" : "13px",
                    cursor: isClickable ? "pointer" : "default",
                  }}
                >
                  {/* Connecting Line between step nodes */}
                  {!isLast && (
                    <div
                      className={`stepper-v-connector ${isDone ? "completed" : ""}`}
                      style={{
                        position: "absolute",
                        left: "16px",
                        top: "34px",
                        bottom: "0",
                        width: "2px",
                        backgroundColor: isDone ? "#10b981" : "#e2e8f0",
                        zIndex: 1,
                        transition: "background-color 0.3s ease",
                      }}
                    />
                  )}

                  {/* Node Circle */}
                  <div
                    className={`stepper-node-circle me-3 ${
                      isDone
                        ? "stepper-node-done"
                        : isCurrent
                        ? "stepper-node-active"
                        : "stepper-node-pending"
                    }`}
                    style={{
                      width: "32px",
                      height: "32px",
                      minWidth: "32px",
                      fontSize: "0.82rem",
                      zIndex: 2,
                    }}
                  >
                    {isDone ? (
                      <i className="fa-solid fa-check"></i>
                    ) : (
                      <i className={`fa-solid ${s.icon} ${isCurrent ? "" : "opacity-75"}`}></i>
                    )}
                  </div>

                  {/* Step Label & Subtext */}
                  <div className="flex-grow-1 overflow-hidden pt-1">
                    <div className="d-flex align-items-center justify-content-between gap-1 mb-0.5">
                      <span
                        className="fw-bold text-uppercase"
                        style={{
                          fontSize: "10px",
                          letterSpacing: "0.5px",
                          color: isCurrent ? "#0052ff" : isDone ? "#059669" : "#94a3b8",
                        }}
                      >
                        {s.phase}
                      </span>
                      {isDone && (
                        <span className="badge bg-success-subtle text-success rounded-pill" style={{ fontSize: "9px" }}>
                          ✓ Done
                        </span>
                      )}
                      {isCurrent && !isWaitingForLender && (
                        <span className="badge bg-primary-subtle text-primary rounded-pill animate-pulse" style={{ fontSize: "9px" }}>
                          Active
                        </span>
                      )}
                      {isWaitingForLender && s.id === 5 && (
                        <span className="badge bg-warning text-dark rounded-pill" style={{ fontSize: "9px" }}>
                          Linked ✓
                        </span>
                      )}
                      {isWaitingForLender && s.id === 6 && (
                        <span className="badge bg-secondary-subtle text-secondary rounded-pill" style={{ fontSize: "9px" }}>
                          🔒 Waiting
                        </span>
                      )}
                    </div>

                    <div
                      className={`fw-semibold text-truncate ${
                        isCurrent
                          ? "text-primary fw-bold"
                          : isDone
                          ? "text-dark"
                          : "text-muted"
                      }`}
                      style={{ fontSize: "13px" }}
                    >
                      {s.label}
                    </div>

                    <div
                      className="text-muted text-truncate"
                      style={{ fontSize: "10.5px", marginTop: "0px" }}
                    >
                      {isWaitingForLender && s.id === 5
                        ? "Awaiting Lender Agreement"
                        : isWaitingForLender && s.id === 6
                        ? "Lender must sign first"
                        : isDone
                        ? "✓ Information Verified"
                        : isCurrent
                        ? "Complete Required Details"
                        : s.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security / Trust Seal at Bottom of Sidebar */}
        <div className="p-2 px-3 bg-light border-top rounded-bottom-4">
          <div className="d-flex align-items-center gap-2">
            <div className="rounded-circle bg-success bg-opacity-10 text-success p-2 d-flex align-items-center justify-content-center" style={{ width: "30px", height: "30px" }}>
              <i className="fa-solid fa-shield-check small"></i>
            </div>
            <div>
              <span className="fw-bold text-dark d-block" style={{ fontSize: "11px" }}>
                RBI Regulated NBFC-P2P
              </span>
              <span className="text-muted d-block" style={{ fontSize: "10px" }}>
                Escrow Protected • 256-Bit SSL
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          2. MOBILE (<992px): COMPACT RESPONSIVE HORIZONTAL STEPPER
          =================================================================== */}
      <div className="d-lg-none fintech-stepper-shell mb-3">
        {/* Top Meta Header */}
        <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
          <div className="d-flex align-items-center gap-2">
            <span
              className="badge rounded-pill px-2.5 py-1 small fw-bold"
              style={{ background: "rgba(0, 82, 255, 0.12)", color: "#0052ff", fontSize: "10.5px" }}
            >
              {currentMeta.phase} of {totalSteps}
            </span>
            <span className="fw-bold text-dark small text-truncate" style={{ maxWidth: "160px" }}>
              {currentMeta.label}
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="stepper-progress-track" style={{ width: "70px", height: "6px" }}>
              <div
                className="stepper-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="fw-bold small font-monospace text-primary" style={{ fontSize: "11px" }}>
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Horizontal Mobile Step Scroll */}
        <div className="d-flex align-items-center overflow-x-auto py-1 gap-2 instant-mobile-stepper-scroll" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
          {STEPS.map((s) => {
            const isDone = highestStep > s.id;
            const isCurrent = currentStep === s.id;
            const isClickable = s.id <= highestStep;

            return (
              <div
                key={s.id}
                className={`d-flex flex-column align-items-center text-center ${isClickable ? "cursor-pointer" : ""}`}
                style={{ minWidth: "50px", flexShrink: 0 }}
                onClick={() => {
                  if (isClickable && onStepClick) onStepClick(s.id);
                }}
              >
                <div
                  className={`stepper-node-circle ${
                    isDone
                      ? "stepper-node-done"
                      : isCurrent
                      ? "stepper-node-active"
                      : "stepper-node-pending"
                  }`}
                  style={{ width: "32px", height: "32px", minWidth: "32px", fontSize: "0.75rem" }}
                >
                  {isDone ? (
                    <i className="fa-solid fa-check"></i>
                  ) : (
                    <span>{s.id}</span>
                  )}
                </div>
                <span
                  className="mt-1 text-truncate small d-block"
                  style={{
                    fontSize: "9.5px",
                    maxWidth: "50px",
                    fontWeight: isCurrent ? "700" : "500",
                    color: isCurrent ? "#0052ff" : isDone ? "#059669" : "#64748b",
                  }}
                >
                  {s.label.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default InstantLoanStepper;
