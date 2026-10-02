import React from "react";

const STEPS = [
  { id: 1, label: "Profile & References", sub: "KYC & 2 Contacts", icon: "fa-user-check" },
  { id: 2, label: "Salary Cap & Fee", sub: "₹150 Assessment", icon: "fa-calculator" },
  { id: 3, label: "Bureau & PAN Check", sub: "CIR Verification", icon: "fa-shield-halved" },
  { id: 4, label: "Choose Loan Offer", sub: "Bullet vs 3M EMI", icon: "fa-hand-holding-dollar" },
  { id: 5, label: "eSign & eNACH", sub: "Legal Contract", icon: "fa-file-signature" },
  { id: 6, label: "Bank & Disbursal", sub: "Penny Drop IMPS", icon: "fa-building-columns" },
];

const InstantLoanStepper = ({ currentStep, onStepClick }) => {
  const currentMeta = STEPS.find((s) => s.id === currentStep) || STEPS[0];
  const progressPercent = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

  return (
    <div className="fintech-stepper mb-4">
      {/* Top Meta Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <span className="badge badge-fintech-primary rounded-pill px-3 py-1 small">
            Step {currentStep} of 6
          </span>
          <span className="fw-bold text-dark">{currentMeta.label}</span>
          <span className="text-muted small d-none d-sm-inline">• {currentMeta.sub}</span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small fw-semibold">Progress</span>
          <div className="progress rounded-pill" style={{ width: "120px", height: "8px", backgroundColor: "#e2e8f0" }}>
            <div
              className="progress-bar rounded-pill"
              role="progressbar"
              style={{
                width: `${progressPercent}%`,
                background: "linear-gradient(90deg, #0040e0 0%, #059669 100%)",
                transition: "width 0.4s ease",
              }}
            />
          </div>
          <span className="fw-bold text-primary small" style={{ minWidth: "35px" }}>
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Segmented Step Circles & Connectors */}
      <div className="d-flex align-items-center justify-content-between position-relative px-2 py-1">
        {/* Continuous Connecting Line */}
        <div
          className="position-absolute d-none d-md-block"
          style={{
            top: "22px",
            left: "5%",
            right: "5%",
            height: "3px",
            backgroundColor: "#e2e8f0",
            zIndex: 1,
          }}
        >
          <div
            className="h-100"
            style={{
              width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
              background: "linear-gradient(90deg, #0040e0 0%, #059669 100%)",
              transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />
        </div>

        {STEPS.map((s) => {
          const isDone = currentStep > s.id;
          const isCurrent = currentStep === s.id;
          const isPending = currentStep < s.id;

          return (
            <div
              key={s.id}
              className={`d-flex flex-column align-items-center position-relative text-center ${
                isDone ? "cursor-pointer" : ""
              }`}
              style={{ zIndex: 2, flex: 1, minWidth: "80px" }}
              onClick={() => {
                if (isDone && onStepClick) onStepClick(s.id);
              }}
              title={isDone ? `Jump back to Step ${s.id}` : undefined}
            >
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center ${
                  isDone
                    ? "stepper-circle-done shadow-sm"
                    : isCurrent
                    ? "stepper-circle-active shadow"
                    : "stepper-circle-pending"
                }`}
                style={{
                  width: "44px",
                  height: "44px",
                  transform: isCurrent ? "scale(1.12)" : "scale(1)",
                  transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {isDone ? (
                  <i className="fa-solid fa-check fs-6"></i>
                ) : (
                  <i className={`fa-solid ${s.icon} ${isCurrent ? "fs-6" : "small"}`}></i>
                )}
              </div>

              <div className="mt-2">
                <span
                  className={`d-block small text-nowrap ${
                    isCurrent
                      ? "text-primary fw-bold"
                      : isDone
                      ? "text-dark fw-semibold"
                      : "text-muted"
                  }`}
                  style={{ fontSize: "12px" }}
                >
                  {s.label}
                </span>
                <span
                  className="d-none d-lg-block text-muted"
                  style={{ fontSize: "10px" }}
                >
                  {isDone ? "✓ Done" : isCurrent ? "In Progress" : s.sub}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InstantLoanStepper;
