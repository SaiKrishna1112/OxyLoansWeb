import React from "react";

const STEPS = [
  { id: 1, label: "Borrower Profile", sub: "KYC & Employment", icon: "fa-user-check" },
  { id: 2, label: "References & Assessment", sub: "2 Contacts & ₹150 Fee", icon: "fa-users-viewfinder" },
  { id: 3, label: "Bureau & PAN Check", sub: "CIR Verification", icon: "fa-shield-halved" },
  { id: 4, label: "Choose Loan Offer", sub: "Bullet vs 3M EMI", icon: "fa-hand-holding-dollar" },
  { id: 5, label: "eSign & eNACH", sub: "Legal Contract", icon: "fa-file-signature" },
  { id: 6, label: "Bank & Disbursal", sub: "Penny Drop IMPS", icon: "fa-building-columns" },
];

const InstantLoanStepper = ({ currentStep, onStepClick }) => {
  const currentMeta = STEPS.find((s) => s.id === currentStep) || STEPS[0];
  const progressPercent = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

  return (
    <div className="fintech-stepper-shell mb-4">
      {/* Top Meta Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <span className="badge rounded-pill px-3 py-1 small fw-bold" style={{ background: "rgba(0, 82, 255, 0.12)", color: "#0052ff" }}>
            Phase {currentStep} of 6
          </span>
          <span className="fw-bold text-dark fs-6">{currentMeta.label}</span>
          <span className="text-muted small d-none d-sm-inline">• {currentMeta.sub}</span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small fw-semibold">Completed</span>
          <div className="stepper-progress-track" style={{ width: "130px", height: "7px" }}>
            <div
              className="stepper-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="fw-bold small font-monospace" style={{ minWidth: "35px", color: "#0052ff" }}>
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Segmented Step Circles & Connectors */}
      <div className="d-flex align-items-center justify-content-between position-relative px-2 py-2">
        {/* Continuous Connecting Line */}
        <div
          className="position-absolute d-none d-md-block"
          style={{
            top: "26px",
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
              background: "linear-gradient(90deg, #0052ff 0%, #10b981 100%)",
              transition: "width 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
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
              title={isDone ? `Review Step ${s.id}: ${s.label}` : undefined}
            >
              <div
                className={`stepper-node-circle ${
                  isDone
                    ? "stepper-node-done"
                    : isCurrent
                    ? "stepper-node-active"
                    : "stepper-node-pending"
                }`}
              >
                {isDone ? (
                  <i className="fa-solid fa-check fs-6"></i>
                ) : (
                  <i className={`fa-solid ${s.icon} ${isCurrent ? "fs-6" : "small"}`}></i>
                )}
              </div>

              <div className="mt-2">
                <span
                  className={`d-block small text-nowrap transition-all ${
                    isCurrent
                      ? "fw-bold"
                      : isDone
                      ? "text-dark fw-semibold"
                      : "text-muted"
                  }`}
                  style={{ fontSize: "12px", color: isCurrent ? "#0052ff" : undefined }}
                >
                  {s.label}
                </span>
                <span
                  className="d-none d-lg-block text-muted"
                  style={{ fontSize: "10.5px" }}
                >
                  {isDone ? "✓ Completed" : isCurrent ? "Active Step" : s.sub}
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
