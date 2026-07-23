import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../redesign.css";

const LoanProgress = ({ profileDetails, loans = [], loanRequests = [] }) => {
  const navigate = useNavigate();

  const profileCompletionPct = useMemo(() => {
    if (!profileDetails) return 0;
    const fields = [
      profileDetails.firstName,
      profileDetails.lastName,
      profileDetails.panNumber,
      profileDetails.aadharNumber,
      profileDetails.city,
      profileDetails.state,
      profileDetails.address || profileDetails.residenceAddress,
      profileDetails.whatsAppNumber || profileDetails.mobileNumber,
    ];
    const filledFields = fields.filter((f) => f && String(f).trim() !== "" && String(f) !== "0");
    return Math.round((filledFields.length / fields.length) * 100);
  }, [profileDetails]);

  const journey = useMemo(() => {
    const profileDetailsObj = profileDetails || {};
    const loansList = Array.isArray(loans) ? loans : [];
    const loanRequestsList = Array.isArray(loanRequests) ? loanRequests : [];
    const steps = [
      { key: "PROFILE", label: "Profile", status: "PENDING", statusText: "Complete your profile", icon: "fa-solid fa-user", path: "/borrowerProfile" },
      { key: "KYC", label: "KYC", status: "PENDING", statusText: "KYC pending", icon: "fa-solid fa-id-card", path: "/borrowerProfile" },
      { key: "LOAN_REQUEST", label: "Loan Request", status: "PENDING", statusText: "Create new request", icon: "fa-solid fa-file-invoice-dollar", path: "/borrowerLoanRequestCreate" },
      { key: "OFFERS", label: "Offers", status: "PENDING", statusText: "Awaiting bids", icon: "fa-solid fa-hand-holding-dollar", path: "/borrowerLoansInitiated" },
      { key: "DOCUMENTS", label: "Documents", status: "PENDING", statusText: "Agreement pending", icon: "fa-solid fa-signature", path: "/my-marketplace-loans" },
      { key: "FUNDS", label: "Funds", status: "PENDING", statusText: "Awaiting documents", icon: "fa-solid fa-wallet", path: "/borrowerDisbursementAmount" },
      { key: "REPAYMENT", label: "Repayment", status: "PENDING", statusText: "EMI not started", icon: "fa-solid fa-calendar-check", path: "/borrower-emi-schedule" },
    ];

    let currentStep = "";
    let nextStep = "";
    let journeyComplete = false;
    let activeLoanRequestId = null;
    let activeLoanId = null;
    let activeLoan = null;

    // STEP 1: PROFILE
    const isProfileCompleted = profileDetailsObj.personalDetailsInfo === true;
    if (isProfileCompleted) {
      steps[0].status = "COMPLETED";
      steps[0].statusText = "Profile completed";
    } else {
      steps[0].status = "ACTIVE";
      steps[0].statusText = "Complete your profile";
      currentStep = "Profile";
      nextStep = "Profile";
    }

    // STEP 2: KYC
    if (currentStep === "") {
      const isKycCompleted = profileDetailsObj.kycStatus === true;
      if (isKycCompleted) {
        steps[1].status = "COMPLETED";
        steps[1].statusText = "KYC completed";
      } else {
        steps[1].status = "ACTIVE";
        steps[1].statusText = "KYC pending";
        currentStep = "KYC";
        nextStep = "KYC";
      }
    }

    // STEP 3: LOAN REQUEST
    let latestRequest = null;
    if (loanRequestsList.length > 0) {
      latestRequest = [...loanRequestsList].sort((a, b) => b.id - a.id)[0];
    }

    if (latestRequest) {
      activeLoanRequestId = latestRequest.id;
    } else if (loansList.length > 0 && loansList[0].loanRequestId) {
      activeLoanRequestId = loansList[0].loanRequestId;
    }

    if (currentStep === "") {
      if (latestRequest || loansList.length > 0) {
        steps[2].status = "COMPLETED";
        steps[2].statusText = "Loan request raised";
      } else {
        steps[2].status = "ACTIVE";
        steps[2].statusText = "Create new request";
        currentStep = "Loan Request";
        nextStep = "Loan Request";
      }
    }

    // STEP 4: OFFERS
    const filteredOffers = activeLoanRequestId
      ? loansList.filter((loan) => loan.loanRequestId === activeLoanRequestId)
      : loansList;

    const activeOffers = filteredOffers.filter((o) => {
      const lenderStatus = String(o.lenderStatus || "").toUpperCase().trim();
      const loanStatus = String(o.loanStatus || "").toUpperCase().trim();
      return lenderStatus !== "LENDER_REJECTED" && loanStatus !== "REJECTED";
    });

    const getLoanPriority = (loan) => {
      const loanStatus = String(loan.loanStatus || "").toUpperCase().trim();
      const walletStatus = String(loan.walletStatus || "").toUpperCase().trim();
      const borrowerStatus = String(loan.borrowerStatus || "").toUpperCase().trim();
      const lenderStatus = String(loan.lenderStatus || "").toUpperCase().trim();

      const isDisbursed = [
        "ACTIVE",
        "DISBURSED",
        "FUNDS_TRANSFERRED",
        "TRANSFERRED",
        "LOAN_DISBURSED"
      ].includes(loanStatus) || [
        "ACTIVE",
        "DISBURSED",
        "FUNDS_TRANSFERRED",
        "TRANSFERRED",
        "LOAN_DISBURSED"
      ].includes(walletStatus);

      if (isDisbursed) return 4;

      const isAccepted = (lenderStatus === "LOANACCEPTED" && borrowerStatus === "LOANACCEPTED") || [
        "LOANACCEPTED",
        "AWAITING_ENACH",
        "ESIGN_DONE",
        "ENACH_INITIATED",
        "ENACH_APPROVED",
        "DISBURSAL_PENDING",
        "ACTIVE"
      ].includes(loanStatus);

      if (isAccepted) return 3;

      const isRejected = lenderStatus === "LENDER_REJECTED" || loanStatus === "REJECTED";
      if (!isRejected) return 2;

      return 1;
    };

    const sortedOffers = [...filteredOffers].sort((a, b) => getLoanPriority(b) - getLoanPriority(a));
    const selectedActiveLoan = sortedOffers[0] || null;

    if (selectedActiveLoan) {
      activeLoanId = selectedActiveLoan.id;
      activeLoan = selectedActiveLoan;
    }

    const acceptedLoanRecord = activeOffers.find((o) => {
      const lenderStatus = String(o.lenderStatus || "").toUpperCase().trim();
      const borrowerStatus = String(o.borrowerStatus || "").toUpperCase().trim();
      const loanStatus = String(o.loanStatus || "").toUpperCase().trim();
      
      const isAcceptedStatus = [
        "LOANACCEPTED",
        "AWAITING_ENACH",
        "ESIGN_DONE",
        "ENACH_INITIATED",
        "ENACH_APPROVED",
        "DISBURSAL_PENDING",
        "DISBURSED",
        "FUNDS_TRANSFERRED",
        "TRANSFERRED",
        "LOAN_DISBURSED",
        "ACTIVE"
      ].includes(loanStatus);

      return (lenderStatus === "LOANACCEPTED" && borrowerStatus === "LOANACCEPTED") || isAcceptedStatus;
    });

    if (currentStep === "") {
      if (acceptedLoanRecord || (activeLoan && activeLoan.borrowerStatus === "LOANACCEPTED")) {
        steps[3].status = "COMPLETED";
        steps[3].statusText = "Offer accepted";
      } else if (activeOffers.length > 0) {
        steps[3].status = "ACTIVE";
        steps[3].statusText = "Offers available";
        currentStep = "Offers";
        nextStep = "Offers";
      } else if (filteredOffers.length > 0 && activeOffers.length === 0) {
        steps[3].status = "ACTIVE";
        steps[3].statusText = "No active offers";
        currentStep = "Offers";
        nextStep = "Offers";
      } else {
        steps[3].status = "ACTIVE";
        steps[3].statusText = "Awaiting bids";
        currentStep = "Offers";
        nextStep = "Offers";
      }
    }

    // STEP 5: DOCUMENTS
    if (currentStep === "") {
      if (activeLoan) {
        const loanStatus = String(activeLoan.loanStatus || "").toUpperCase().trim();
        const hasAgreement = activeLoan.borrowerAggrement !== null && activeLoan.borrowerAggrement !== undefined && String(activeLoan.borrowerAggrement).trim() !== "";
        
        const mandateStatusRaw = String(
          activeLoan.mandateStatus ||
          activeLoan.MandateStatus ||
          activeLoan.borrowerMandateStatus ||
          activeLoan.enachStatus ||
          ""
        ).toUpperCase().trim();

        const isMandateSuccess = [
          "SUCCESS",
          "APPROVED",
          "ACTIVE",
          "TRUE",
          "BANK_APPROVAL_PENDING"
        ].includes(mandateStatusRaw) || Boolean(activeLoan.mandateId);

        const isEsigned = activeLoan.borrowerEsigned === true || 
                          activeLoan.borrowerEsigned === "true" ||
                          activeLoan.borrowerEsignStatus === true ||
                          activeLoan.borrowerEsignStatus === "true" ||
                          ["ESIGN_DONE", "AWAITING_ENACH", "ENACH_INITIATED", "ENACH_APPROVED", "DISBURSAL_PENDING", "DISBURSED", "ACTIVE"].includes(loanStatus);

        const isEnachCompleted = isMandateSuccess ||
                                 activeLoan.enachStatus === true ||
                                 activeLoan.enachStatus === "true" ||
                                 ["ENACH_APPROVED", "DISBURSAL_PENDING", "DISBURSED", "ACTIVE"].includes(loanStatus);

        if (isEsigned && isEnachCompleted) {
          steps[4].status = "COMPLETED";
          steps[4].statusText = "eSign & eNACH completed";
        } else if (isEsigned && !isEnachCompleted) {
          steps[4].status = "ACTIVE";
          steps[4].statusText = "eNACH setup pending";
          steps[4].path = `/enach/${activeLoan.loanRequestId}`;
          currentStep = "Documents";
          nextStep = "Documents";
        } else if (hasAgreement) {
          steps[4].status = "ACTIVE";
          steps[4].statusText = "eSign signature pending";
          steps[4].path = `/esign/${activeLoan.loanRequestId}`;
          currentStep = "Documents";
          nextStep = "Documents";
        } else {
          steps[4].status = "PENDING";
          steps[4].statusText = "Agreement pending";
          currentStep = "Documents";
          nextStep = "Documents";
        }
      } else {
        steps[4].status = "PENDING";
        steps[4].statusText = "Agreement pending";
        currentStep = "Documents";
        nextStep = "Documents";
      }
    }

    // STEP 6: FUNDS
    if (currentStep === "") {
      if (activeLoan) {
        const walletStatus = String(activeLoan.walletStatus || "").toUpperCase().trim();
        const loanStatus = String(activeLoan.loanStatus || "").toUpperCase().trim();

        const isDisbursed = [
          "ACTIVE",
          "DISBURSED",
          "FUNDS_TRANSFERRED",
          "TRANSFERRED",
          "LOAN_DISBURSED"
        ].includes(loanStatus) || [
          "ACTIVE",
          "DISBURSED",
          "FUNDS_TRANSFERRED",
          "TRANSFERRED",
          "LOAN_DISBURSED"
        ].includes(walletStatus);

        if (isDisbursed) {
          steps[5].status = "COMPLETED";
          steps[5].statusText = "Funds transferred";
        } else {
          steps[5].status = "ACTIVE";
          steps[5].statusText = "Processing transfer";
          currentStep = "Funds";
          nextStep = "Funds";
        }
      } else {
        steps[5].status = "PENDING";
        steps[5].statusText = "Awaiting documents";
        currentStep = "Funds";
        nextStep = "Funds";
      }
    }

    // STEP 7: REPAYMENT
    if (currentStep === "") {
      const isClosed = activeLoan && (
        String(activeLoan.loanStatus).toUpperCase().trim() === "CLOSED" ||
        String(activeLoan.repaymentStatus).toUpperCase().trim() === "CLOSED" ||
        profileDetailsObj.repaymentStatus === "CLOSED"
      );

      if (isClosed) {
        steps[6].status = "COMPLETED";
        steps[6].statusText = "Loan repaid";
        journeyComplete = true;
      } else {
        steps[6].status = "ACTIVE";
        steps[6].statusText = "EMI active";
        currentStep = "Repayment";
        nextStep = "Repayment";
      }
    }

    // Step state rules enforcement
    let activeFound = false;
    for (let i = 0; i < steps.length; i++) {
      if (steps[i].status === "ACTIVE") {
        activeFound = true;
      } else if (steps[i].status === "PENDING" && !activeFound) {
        steps[i].status = "ACTIVE";
        activeFound = true;
      } else if (activeFound) {
        steps[i].status = "PENDING";
      }
    }

    const completedSteps = steps.filter((s) => s.status === "COMPLETED").length;
    const progressPercentage = Math.round((completedSteps / steps.length) * 100);

    return {
      progressPercentage,
      currentStep: currentStep || "Repayment",
      nextStep: nextStep || (journeyComplete ? "" : "Repayment"),
      journeyComplete,
      activeLoanRequestId,
      activeLoanId,
      steps,
    };
  }, [profileDetails, loans, loanRequests]);

  const activeStageIndex = useMemo(() => {
    const idx = journey.steps.findIndex((s) => s.status === "ACTIVE");
    return idx === -1 ? journey.steps.length : idx;
  }, [journey.steps]);

  const handleStageClick = (e, step, idx) => {
    if (step.status === "PENDING") {
      e.preventDefault();
      Swal.fire({
        icon: "warning",
        title: "Step Locked",
        text: `Please complete the preceding steps and resolve "${journey.nextStep}" first.`,
        confirmButtonText: "Okay",
        confirmButtonColor: "#0040e0",
      });
      return;
    }

    if (step.key === "LOAN_REQUEST" && profileCompletionPct < 75) {
      e.preventDefault();
      Swal.fire({
        icon: "warning",
        title: "Profile Incomplete",
        text: `Please fill in at least 75% of your profile setup (currently ${profileCompletionPct}%) before applying for a loan request.`,
        confirmButtonText: "Go to Profile",
        confirmButtonColor: "#0040e0",
      }).then((result) => {
        if (result.isConfirmed) navigate("/borrowerProfile");
      });
    }
  };

  return (
    <div className="oxy-stepper-container">
      {/* <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0" style={{ fontSize: "16px", color: "var(--oxy-on-surface)" }}>
          <i className="fa-solid fa-route text-primary me-2" />
          Your Onboarding & Loan Journey
        </h5>
        <span className="badge bg-primary px-3 py-2 rounded-pill font-bold" style={{ fontSize: "11px" }}>
          {journey.journeyComplete ? (
            <span className="text-black fw-bold"><i className="fa-solid fa-circle-check me-1" /> All Steps Completed</span>
          ) : (
            `Next Step: ${journey.nextStep}`
          )}
        </span>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <span className="text-muted small">Overall Process Status</span>
        <span className="fw-bold text-primary small">{journey.progressPercentage}% Complete</span>
      </div>

      <div className="w-full bg-light h-2 rounded-pill mb-4 overflow-hidden position-relative" style={{ height: "6px" }}>
        <div 
          className="bg-primary h-100 rounded-pill" 
          style={{ width: `${journey.progressPercentage}%`, transition: "width 0.4s ease" }}
        />
      </div> */} 
  {/* Header */}
  <div className="d-flex justify-content-between align-items-center mb-3">
    <h5
      className="fw-bold mb-0 d-flex align-items-center"
      style={{
        fontSize: "16px",
        color: "var(--oxy-on-surface, #111827)",
      }}
    >
      <i
        className="fa-solid fa-route me-2"
        style={{ color: "#2457ff" }}
      />

      Your Onboarding & Loan Journey
    </h5>

    <span
      className="badge rounded-pill px-3 py-2 fw-bold"
      style={{
        fontSize: "11px",
        backgroundColor: journey.journeyComplete
          ? "#dcfce7"
          : "#fff3cd",
        color: journey.journeyComplete
          ? "#15803d"
          : "#856404",
        border: journey.journeyComplete
          ? "1px solid #bbf7d0"
          : "1px solid #ffe69c",
        minWidth: "110px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 1,
      }}
    >
      {journey.journeyComplete ? (
        <>
          <i className="fa-solid fa-circle-check me-1" />
          All Steps Completed
        </>
      ) : (
        <>
          <i className="fa-solid fa-arrow-right me-1" />
          Next Step: {journey.nextStep}
        </>
      )}
    </span>
  </div>

  {/* Overall Process Status */}
  <div className="d-flex justify-content-between align-items-center mb-4">
    <span
      style={{
        fontSize: "12px",
        color: "#6b7280",
      }}
    >
      Overall Process Status
    </span>

    <span
      className="fw-bold"
      style={{
        fontSize: "12px",
        color: "#2457ff",
      }}
    >
      {journey.progressPercentage}% Complete
    </span>
  </div>

  {/* Progress Bar */}
  {/* <div
    className="w-100 rounded-pill overflow-hidden mb-4"
    style={{
      height: "6px",
      backgroundColor: "#e9e8ff",
    }}
  >
    <div
      className="h-100 rounded-pill"
      style={{
        width: `${journey.progressPercentage}%`,
        backgroundColor: "#2457ff",
        transition: "width 0.4s ease",
      }}
    />
  </div> */}


      <div className="position-relative">
        <div className="oxy-stepper-line-horizontal d-none d-md-block">
          <div 
            className="oxy-stepper-line-active" 
            style={{ width: `${Math.min(100, (activeStageIndex / (journey.steps.length - 1)) * 100)}%` }}
          />
        </div>

        <div className="d-flex flex-column flex-md-row justify-content-between gap-4">
          {journey.steps.map((step, idx) => {
            const isCompleted = step.status === "COMPLETED";
            const isActive = step.status === "ACTIVE";

            let stepClass = "locked";
            if (isCompleted) stepClass = "completed";
            else if (isActive) stepClass = "active";

            return (
              <Link 
                key={step.key} 
                to={step.path} 
                onClick={(e) => handleStageClick(e, step, idx)}
                className={`oxy-step-item ${stepClass}`}
              >
                <div className="oxy-step-circle">
                  {isCompleted ? (
                    <i className="fa-solid fa-circle-check text-white" style={{ fontSize: "18px" }}></i>
                  ) : (
                    <i className={step.icon}></i>
                  )}
                </div>
                <div>
                  <div className="oxy-step-title">{step.label}</div>
                  <div className="oxy-step-desc">{step.statusText}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LoanProgress;
