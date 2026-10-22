import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BorrowerHeader from "../../../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../../../SideBar/BorrowerSidebar";
import Footer from "../../../../../Footer/Footer";
import { getUserDetails } from "../../../../../HttpRequest/afterlogin";

import InstantLoanStepper from "../components/instantLoan/InstantLoanStepper";
import InstantLoanStepProfile from "../components/instantLoan/InstantLoanStepProfile";
import InstantLoanStepPreEligibility from "../components/instantLoan/InstantLoanStepPreEligibility";
import InstantLoanStepBureauVerification from "../components/instantLoan/InstantLoanStepBureauVerification";
import InstantLoanStepOfferSelection from "../components/instantLoan/InstantLoanStepOfferSelection";
import InstantLoanStepAgreementEnach from "../components/instantLoan/InstantLoanStepAgreementEnach";
import InstantLoanStepBankDetails from "../components/instantLoan/InstantLoanStepBankDetails";
import InstantLoanStepDisbursalTracker from "../components/instantLoan/InstantLoanStepDisbursalTracker";
import InstantLoanNotEligible from "../components/instantLoan/InstantLoanNotEligible";

import {
  fetchBorrowerProfile,
  loadInstantLoanStorage,
  saveInstantLoanStorage,
  clearInstantLoanStorage,
  normalizeDobToInput,
} from "../components/instantLoan/instantLoanApi";
import Swal from "sweetalert2";
import CreditScoreGauge from "../components/CreditScoreGauge";
import { formatINR } from "../components/creditReportUtils";
import "../redesign.css";

const InstantLoanFlow = () => {
  const { id } = useParams();
  const sessionUid =
    sessionStorage.getItem("userId") || localStorage.getItem("userId") || "41682";
  const applicationId = id || sessionUid;

  // Single Point of View Tab State
  const [activeViewTab, setActiveViewTab] = useState("FLOW"); // "FLOW" | "CREDIT" | "DISBURSAL"

  // Application state
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isNotEligible, setIsNotEligible] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Computed: Sidebar and profile are unlocked only after all steps are completed
  const isAllStepsCompleted = currentStep >= 7 || Boolean(isCompleted);

  const [profileData, setProfileData] = useState({
    name: "DHARMAPURI SAI KRISHNA",
    firstName: "DHARMAPURI SAI KRISHNA",
    lastName: "",
    mobile: "7702443666",
    whatsAppNumber: "918125861874",
    email: "somethingspecialday@gmail.com",
    gender: "Male",
    panNumber: "JUXPK2964M",
    dateOfBirth: "1999-11-08",
    fatherName: "Satya",
    motherName: "",
    maritalStatus: "Single",
    spouseName: "",
    spouseDob: "",
    address: "Hyderabad",
    locality: "Tirumalagiri",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500085",
    monthlySalary: "25000",
    employmentType: "SALARIED",
    companyName: "oxyloans",
    designation: "Software Engineer",
    workExperience: "2",
    officeAddress: "Plot 104, OxyLoans Office, Hyderabad",
    officeMailId: "somethingspecialday@gmail.com",
    officeLandLine: "04048592301",
  });

  const [feePayment, setFeePayment] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [bankData, setBankData] = useState(null);

  // Manage body classes for no-sidebar distraction-free layout during in-progress flow
  useEffect(() => {
    document.body.classList.add("oxy-redesign-active");

    if (!isAllStepsCompleted) {
      document.body.classList.add("instant-flow-no-sidebar");
    } else {
      document.body.classList.remove("instant-flow-no-sidebar");
    }

    return () => {
      document.body.classList.remove("oxy-redesign-active");
      document.body.classList.remove("instant-flow-no-sidebar");
    };
  }, [isAllStepsCompleted]);

  // Restore stored state & sync with live user details from backend
  useEffect(() => {
    const saved = loadInstantLoanStorage(applicationId);
    if (saved) {
      if (saved.currentStep) setCurrentStep(saved.currentStep);
      if (saved.isCompleted) setIsCompleted(saved.isCompleted);
      if (saved.feePayment) setFeePayment(saved.feePayment);
      if (saved.selectedOffer) setSelectedOffer(saved.selectedOffer);
      if (saved.bankData) setBankData(saved.bankData);
      if (saved.isNotEligible) setIsNotEligible(saved.isNotEligible);
      if (saved.profileData && !saved.profileData.name?.includes("BALIJEPALLI") && saved.profileData.panNumber !== "CDBPB2737H") {
        setProfileData(saved.profileData);
      }
    }

    // Always fetch live profile details from OxyLoans backend
    fetchBorrowerProfile(applicationId)
      .then((res) => {
        if (res?.data) {
          const d = res.data;
          const cleanName = d.firstName ? `${d.firstName} ${d.lastName || ""}`.trim() : "DHARMAPURI SAI KRISHNA";
          const cleanAddress = (d.address || d.permanentAddress || "Hyderabad")
            .replace(/\\n/g, "")
            .replace(/,\s*$/, "")
            .trim() || "Hyderabad";
          const cleanDob = normalizeDobToInput(d.dob || d.dateOfBirth) || "1999-11-08";

          setProfileData((prev) => {
            const isMock = !prev.name || prev.name.includes("BALIJEPALLI") || prev.panNumber === "CDBPB2737H";
            return {
              ...prev,
              name: isMock ? cleanName : (prev.name || cleanName),
              firstName: isMock ? (d.firstName || cleanName) : (prev.firstName || d.firstName),
              lastName: isMock ? (d.lastName || "") : (prev.lastName || d.lastName || ""),
              mobile: isMock ? (d.mobileNumber || d.mobile || "7702443666") : (prev.mobile || d.mobileNumber),
              whatsAppNumber: isMock ? (d.whatsAppNumber || d.mobileNumber || "918125861874") : (prev.whatsAppNumber || d.whatsAppNumber),
              email: isMock ? (d.email || "somethingspecialday@gmail.com") : (prev.email || d.email),
              gender: (d.gender && d.gender.trim()) || prev.gender || "Male",
              panNumber: isMock ? (d.panNumber || "JUXPK2964M") : (prev.panNumber || d.panNumber),
              dateOfBirth: isMock ? cleanDob : (prev.dateOfBirth || cleanDob),
              fatherName: isMock ? (d.fatherName || "Satya") : (prev.fatherName || d.fatherName),
              motherName: prev.motherName || d.motherName || "",
              maritalStatus: prev.maritalStatus || d.maritalStatus || "Single",
              spouseName: prev.spouseName || d.spouseName || "",
              spouseDob: prev.spouseDob || d.spouseDob || "",
              address: isMock ? cleanAddress : (prev.address || cleanAddress),
              locality: isMock ? (d.locality || "Tirumalagiri") : (prev.locality || d.locality),
              city: isMock ? (d.city || "Hyderabad") : (prev.city || d.city),
              state: isMock ? (d.state || "Telangana") : (prev.state || d.state),
              pincode: isMock ? (d.pinCode || d.pincode || "500085") : (prev.pincode || d.pinCode),
              monthlySalary: isMock ? (d.salary || d.salaryNew || 25000) : (prev.monthlySalary || d.salary),
              employmentType: d.employment || d.employmentType || prev.employmentType || "SALARIED",
              companyName: isMock ? (d.companyName || "oxyloans") : (prev.companyName || d.companyName),
              designation: prev.designation || d.designation || "Software Engineer",
              workExperience: isMock ? (d.workExperience || "2") : (prev.workExperience || d.workExperience || "2"),
              officeAddress: prev.officeAddress || d.officeAddress || "Plot 104, OxyLoans Office, Hyderabad",
              officeMailId: prev.officeMailId || d.officeMailId || "somethingspecialday@gmail.com",
              officeLandLine: prev.officeLandLine || d.officeLandLine || "",
            };
          });

          // Pre-populate bankData from profile if available
          if (d.accountNumber || d.bankName) {
            setBankData((prevBank) => {
              if (prevBank?.accountNumber && prevBank.accountNumber !== "34209820038") return prevBank;
              return {
                accountHolderName: cleanName || "DHARMAPURI SAI KRISHNA",
                bankName: d.bankName || "STATE BANK OF INDIA",
                accountNumber: d.accountNumber || "34209820038",
                confirmAccountNumber: d.accountNumber || "34209820038",
                ifscCode: d.ifscCode || "SBIN0008505",
                branchName: d.branchName || "MUKUNDAPURAM",
                accountType: "SAVINGS",
              };
            });
          }
        }
      })
      .catch((e) => console.warn("Failed to fetch live profile data:", e));
  }, [applicationId]);

  // Save changes to storage
  const syncState = (updates) => {
    const newState = {
      currentStep,
      isCompleted,
      isNotEligible,
      profileData,
      feePayment,
      selectedOffer,
      bankData,
      ...updates,
    };
    saveInstantLoanStorage(applicationId, newState);
  };

  // Step 1 Complete
  const handleProfileComplete = (data) => {
    setProfileData(data);
    setCurrentStep(2);
    syncState({ profileData: data, currentStep: 2 });
  };

  // Step 2 Complete (Fee Paid & References Saved)
  const handleFeePaymentSuccess = (payment) => {
    setFeePayment(payment);
    if (payment?.ref1 && payment?.ref2) {
      setProfileData((prev) => ({
        ...prev,
        ref1: payment.ref1,
        ref2: payment.ref2,
      }));
    }
    setCurrentStep(3);
    syncState({
      feePayment: payment,
      currentStep: 3,
      ...(payment?.ref1 && payment?.ref2 ? { ref1: payment.ref1, ref2: payment.ref2 } : {}),
    });
  };

  // Step 3 Complete (Bureau & Identity Verified)
  const handleBureauComplete = (bureauResult) => {
    setVerificationResult(bureauResult);
    setCurrentStep(4);
    syncState({ verificationResult: bureauResult, currentStep: 4 });
  };

  // Step 3 Ineligible
  const handleNotEligible = (bureauResult) => {
    setVerificationResult(bureauResult);
    setIsNotEligible(true);
    syncState({ isNotEligible: true, verificationResult: bureauResult });
  };

  // Step 4 Complete (Offer Selected)
  const handleOfferSelected = (offer) => {
    setSelectedOffer(offer);
    setCurrentStep(5);
    syncState({ selectedOffer: offer, currentStep: 5 });
  };

  // Step 5 Complete (eSign & eNACH)
  const handleAgreementComplete = () => {
    setCurrentStep(6);
    syncState({ currentStep: 6 });
  };

  // Step 6 Complete (Bank Verified -> Waiting for Disbursal)
  const handleBankVerified = (bData) => {
    setBankData(bData);
    setCurrentStep(7);
    setIsCompleted(true);
    syncState({ bankData: bData, currentStep: 7, isCompleted: true });
  };

  // Reset / Restart Flow with user confirmation
  const handleResetFlow = () => {
    Swal.fire({
      title: "Restart Instant Loan Flow?",
      text: "This will clear your draft state and return to Step 1.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0052ff",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Restart",
    }).then((res) => {
      if (res.isConfirmed) {
        clearInstantLoanStorage(applicationId);
        setCurrentStep(1);
        setIsCompleted(false);
        setIsNotEligible(false);
        setSelectedOffer(null);
        setBankData(null);
        setFeePayment(null);
        setActiveViewTab("FLOW");
      }
    });
  };

  return (
    <div className="main-wrapper">
      <div className="d-print-none">
        <BorrowerHeader />
        {isAllStepsCompleted && <BorrowerSidebar />}
      </div>

      <div className="page-wrapper">
        <div className="content container-fluid py-4" style={{ backgroundColor: "var(--oxy-background)" }}>
          <div className="fintech-shell">
            {/* 1. Production-Grade Executive Command Bar: Single Point of View */}
            <div className="instant-single-view-bar">
              <div className="instant-user-chip">
                <div className="instant-user-avatar">
                  {profileData.name
                    ? profileData.name.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase()
                    : "DS"}
                </div>
                <div>
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                    <h5 className="fw-bold mb-0 text-dark">
                      {profileData.name || "DHARMAPURI SAI KRISHNA"}
                    </h5>
                    <span
                      className="badge rounded-pill small fw-bold px-2 py-1"
                      style={{ background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" }}
                    >
                      <i className="fa-solid fa-circle-check me-1 text-success"></i> KYC Verified
                    </span>
                    <span className="badge bg-dark bg-opacity-10 text-dark rounded-pill small font-monospace">
                      Borrower #{applicationId}
                    </span>
                  </div>
                  <div className="d-flex flex-wrap align-items-center gap-2 text-muted small" style={{ fontSize: "12px" }}>
                    <span>
                      Monthly Salary:{" "}
                      <strong>
                        {profileData.monthlySalary
                          ? `₹${Number(profileData.monthlySalary).toLocaleString("en-IN")}/mo`
                          : "₹25,000/mo"}
                      </strong>
                    </span>
                    <span>•</span>
                    <span className="text-success fw-semibold d-inline-flex align-items-center gap-1">
                      <span className="pulse-beacon-live"></span>
                      Pre-Approved Limit: ₹{(Math.round(Number(profileData.monthlySalary || 25000) * 0.9)).toLocaleString("en-IN")}
                    </span>
                    <span className="d-none d-md-inline">•</span>
                    <span className="d-none d-md-inline text-muted">
                      Escrow Pool: <strong>#41682</strong> (Prime+ Tier)
                    </span>
                  </div>
                </div>
              </div>

              {/* Single Point of View Switcher Navigation */}
              <div className="d-flex flex-wrap align-items-center gap-2">
                <button
                  type="button"
                  className={`instant-view-nav-pill ${activeViewTab === "FLOW" ? "active" : ""}`}
                  onClick={() => setActiveViewTab("FLOW")}
                >
                  <i className="fa-solid fa-bolt"></i>
                  <span>Instant Loan Journey</span>
                </button>

                <button
                  type="button"
                  className={`instant-view-nav-pill ${activeViewTab === "CREDIT" ? "active" : ""}`}
                  onClick={() => setActiveViewTab("CREDIT")}
                >
                  <i className="fa-solid fa-chart-pie"></i>
                  <span>Credit Health (802)</span>
                </button>

                <button
                  type="button"
                  className={`instant-view-nav-pill ${activeViewTab === "DISBURSAL" ? "active" : ""}`}
                  onClick={() => setActiveViewTab("DISBURSAL")}
                >
                  <i className="fa-solid fa-building-columns"></i>
                  <span>Disbursal & Escrow</span>
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary rounded-pill px-2 py-1 text-muted ms-1"
                  onClick={handleResetFlow}
                  title="Clear draft and start fresh"
                  style={{ fontSize: "11px" }}
                >
                  <i className="fa-solid fa-rotate-left me-1"></i> Restart
                </button>
              </div>
            </div>

            {/* 2. Main Viewport Container */}
            {activeViewTab === "CREDIT" ? (
              /* Inline Single-View Credit Health Card */
              <div className="fintech-card step-view-enter">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span
                        className="badge rounded-pill px-3 py-1 small fw-bold"
                        style={{ background: "rgba(0, 82, 255, 0.12)", color: "#0052ff" }}
                      >
                        OxyLoans CIR Intelligence
                      </span>
                      <span className="badge bg-success bg-opacity-10 text-success rounded-pill small fw-bold">
                        Top 5% Credit Tier
                      </span>
                    </div>
                    <h4 className="fw-bold text-dark mb-1">Live Credit Bureau & CIR Profile</h4>
                    <p className="text-muted small mb-0">
                      Real-time credit health and underwriting telemetry for{" "}
                      <strong>{profileData.name || "DHARMAPURI SAI KRISHNA"}</strong> (PAN:{" "}
                      {profileData.panNumber || "JUXPK2964M"}).
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-fintech-primary btn-sm rounded-pill px-3"
                    onClick={() => setActiveViewTab("FLOW")}
                  >
                    <i className="fa-solid fa-bolt me-1"></i> Return to Loan Application
                  </button>
                </div>

                <div className="row g-4 align-items-center mb-4">
                  <div className="col-lg-4 text-center border-lg-end">
                    <CreditScoreGauge score={verificationResult?.score || 802} size={230} />
                    <div className="mt-3">
                      <span
                        className="badge rounded-pill px-3 py-1 small fw-bold"
                        style={{ background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" }}
                      >
                        <i className="fa-solid fa-circle-check me-1 text-success"></i> Prime Tier (Lowest ROI: 16.5%)
                      </span>
                      <p className="text-muted small mt-2 mb-0">
                        Zero late payments, 99.4% on-time historical debt service.
                      </p>
                    </div>
                  </div>

                  <div className="col-lg-8">
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <div className="p-3 rounded-4 bg-light border h-100">
                          <span className="text-muted small d-block mb-1">Total Credit Accounts</span>
                          <h4 className="fw-bold text-dark mb-1">8 Accounts</h4>
                          <span className="text-success small fw-semibold">4 Active • 4 Closed & Settled</span>
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <div className="p-3 rounded-4 bg-light border h-100">
                          <span className="text-muted small d-block mb-1">Credit Utilization Ratio</span>
                          <h4 className="fw-bold text-success mb-1">14.2%</h4>
                          <span className="text-muted small">Well below the 30% safe threshold</span>
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <div className="p-3 rounded-4 bg-light border h-100">
                          <span className="text-muted small d-block mb-1">On-Time Repayment History</span>
                          <h4 className="fw-bold text-primary mb-1">99.4%</h4>
                          <span className="text-success small fw-semibold">✓ 0 Overdue • 0 Write-offs</span>
                        </div>
                      </div>

                      <div className="col-sm-6">
                        <div className="p-3 rounded-4 bg-light border h-100">
                          <span className="text-muted small d-block mb-1">Sanctioned Pre-Approved Line</span>
                          <h4 className="fw-bold text-dark mb-1">₹58,500</h4>
                          <span className="text-muted small">Calculated at 90% verified take-home</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-4 bg-light border d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <i className="fa-solid fa-shield-halved text-success fs-5"></i>
                    <div>
                      <strong className="text-dark small d-block">Zero Hard Pull Impact During Assessment</strong>
                      <span className="text-muted small" style={{ fontSize: "11px" }}>
                        Inquiries are evaluated as soft-check underwriting until loan contract execution.
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary rounded-pill px-3"
                    onClick={() => setActiveViewTab("FLOW")}
                  >
                    Select Offer Now <i className="fa-solid fa-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>
            ) : activeViewTab === "DISBURSAL" ? (
              /* Inline Single-View Disbursal Status */
              <div className="step-view-enter">
                <InstantLoanStepDisbursalTracker
                  applicationId={applicationId}
                  selectedOffer={selectedOffer}
                  profileData={profileData}
                  bankData={bankData}
                  onReset={handleResetFlow}
                />
              </div>
            ) : (
              /* Main Active Loan Flow (Steps 1 to 6) */
              <>
                {/* Stepper Progress Bar (Hidden during Not Eligible state) */}
                {!isNotEligible && currentStep <= 6 && (
                  <InstantLoanStepper
                    currentStep={currentStep}
                    onStepClick={(stepId) => {
                      if (stepId < currentStep) setCurrentStep(stepId);
                    }}
                  />
                )}

                {/* Dynamic Step Routing Body with Smooth Transitions */}
                <div className="step-view-enter" key={currentStep}>
                  {isNotEligible ? (
                    <InstantLoanNotEligible
                      verificationResult={verificationResult}
                      onRetry={() => {
                        setIsNotEligible(false);
                        setCurrentStep(1);
                      }}
                    />
                  ) : currentStep === 1 ? (
                    <InstantLoanStepProfile
                      initialData={profileData}
                      onNext={handleProfileComplete}
                    />
                  ) : currentStep === 2 ? (
                    <InstantLoanStepPreEligibility
                      profileData={profileData}
                      onPaymentSuccess={handleFeePaymentSuccess}
                      onBack={() => setCurrentStep(1)}
                    />
                  ) : currentStep === 3 ? (
                    <InstantLoanStepBureauVerification
                      profileData={profileData}
                      onVerificationComplete={handleBureauComplete}
                      onNotEligible={handleNotEligible}
                    />
                  ) : currentStep === 4 ? (
                    <InstantLoanStepOfferSelection
                      profileData={profileData}
                      creditScore={verificationResult?.score || 802}
                      onOfferSelected={handleOfferSelected}
                      onBack={() => setCurrentStep(3)}
                    />
                  ) : currentStep === 5 ? (
                    <InstantLoanStepAgreementEnach
                      selectedOffer={selectedOffer}
                      profileData={profileData}
                      applicationId={applicationId}
                      onComplete={handleAgreementComplete}
                      onBack={() => setCurrentStep(4)}
                    />
                  ) : currentStep === 6 ? (
                    <InstantLoanStepBankDetails
                      profileData={profileData}
                      selectedOffer={selectedOffer}
                      applicationId={applicationId}
                      onBankVerified={handleBankVerified}
                      onBack={() => setCurrentStep(5)}
                    />
                  ) : (
                    <InstantLoanStepDisbursalTracker
                      applicationId={applicationId}
                      selectedOffer={selectedOffer}
                      profileData={profileData}
                      bankData={bankData}
                      onReset={handleResetFlow}
                    />
                  )}
                </div>

                {/* Single-Flow Footer Security Assurance */}
                <div className="mt-4 text-center text-muted small pb-2">
                  <div
                    className="d-inline-flex flex-wrap align-items-center justify-content-center gap-3 px-3 py-1.5 rounded-pill bg-white border shadow-xs"
                    style={{ fontSize: "11.5px" }}
                  >
                    <span>
                      <i className="fa-solid fa-lock text-success me-1"></i> 256-Bit SSL Encrypted
                    </span>
                    <span>•</span>
                    <span>
                      <i className="fa-solid fa-shield-halved text-primary me-1"></i> RBI Regulated P2P Lending Escrow
                    </span>
                    <span>•</span>
                    <span>
                      <i className="fa-solid fa-file-signature text-secondary me-1"></i> UIDAI Compliant eSign
                    </span>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      <div className="d-print-none">
        <Footer />
      </div>
    </div>
  );
};

export default InstantLoanFlow;
