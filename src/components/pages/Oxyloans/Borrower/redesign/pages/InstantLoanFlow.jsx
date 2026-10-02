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
  loadInstantLoanState,
  saveInstantLoanState,
} from "../components/instantLoan/instantLoanService";
import "../redesign.css";

const InstantLoanFlow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const applicationId = id || "41682";

  // Application state
  const [currentStep, setCurrentStep] = useState(1);
  const [isNotEligible, setIsNotEligible] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const [profileData, setProfileData] = useState({
    name: "narendra kumar b",
    mobile: "9492902990",
    panNumber: "CDBPB2737H",
    dateOfBirth: "1994-08-08",
    motherName: "abc",
    maritalStatus: "Married",
    spouseName: "Non",
    spouseDob: "20/10/2003",
    monthlySalary: "65000",
    employmentType: "SALARIED",
    companyName: "SRS Fintech Labs Pvt Ltd",
    designation: "Senior Software Engineer",
    officeAddress: "oxyloans",
    officeMailId: "nanan@gmail.com",
    officeLandLine: "12254655",
    address: "KPHB",
    pincode: "500072",
  });

  const [feePayment, setFeePayment] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [bankData, setBankData] = useState(null);

  // Restore stored state if available for this application ID
  useEffect(() => {
    document.body.classList.add("oxy-redesign-active");

    const saved = loadInstantLoanState(applicationId);
    if (saved) {
      if (saved.currentStep) setCurrentStep(saved.currentStep);
      if (saved.profileData) setProfileData(saved.profileData);
      if (saved.feePayment) setFeePayment(saved.feePayment);
      if (saved.selectedOffer) setSelectedOffer(saved.selectedOffer);
      if (saved.bankData) setBankData(saved.bankData);
      if (saved.isNotEligible) setIsNotEligible(saved.isNotEligible);
    } else {
      // Pre-fill from current user details if fresh
      getUserDetails()
        .then((res) => {
          if (res?.data) {
            const d = res.data;
            setProfileData((prev) => ({
              ...prev,
              name: d.firstName ? `${d.firstName} ${d.lastName || ""}`.trim() : prev.name,
              mobile: d.mobileNumber || prev.mobile,
              panNumber: d.panNumber || prev.panNumber,
              dateOfBirth: d.dob || prev.dateOfBirth,
              motherName: d.motherName || prev.motherName,
              maritalStatus: d.maritalStatus || prev.maritalStatus,
              spouseName: d.spouseName || prev.spouseName,
              spouseDob: d.spouseDob || prev.spouseDob,
              monthlySalary: d.salary || prev.monthlySalary,
              companyName: d.companyName || prev.companyName,
              designation: d.designation || prev.designation,
              officeAddress: d.officeAddress || prev.officeAddress,
              officeMailId: d.officeMailId || prev.officeMailId,
              officeLandLine: d.officeLandLine || prev.officeLandLine,
              address: d.address || prev.address,
              pincode: d.pinCode || prev.pincode,
            }));
          }
        })
        .catch(() => {});
    }

    return () => {
      document.body.classList.remove("oxy-redesign-active");
    };
  }, [applicationId]);

  // Save changes to storage
  const syncState = (updates) => {
    const newState = {
      currentStep,
      isNotEligible,
      profileData,
      feePayment,
      selectedOffer,
      bankData,
      ...updates,
    };
    saveInstantLoanState(applicationId, newState);
  };

  // Step 1 Complete
  const handleProfileComplete = (data) => {
    setProfileData(data);
    setCurrentStep(2);
    syncState({ profileData: data, currentStep: 2 });
  };

  // Step 2 Complete (Fee Paid)
  const handleFeePaymentSuccess = (payment) => {
    setFeePayment(payment);
    setCurrentStep(3);
    syncState({ feePayment: payment, currentStep: 3 });
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
    syncState({ bankData: bData, currentStep: 7 });
  };

  // Reset / Restart Flow
  const handleResetFlow = () => {
    localStorage.removeItem(`oxy_instant_loan_${applicationId}`);
    setCurrentStep(1);
    setIsNotEligible(false);
    setSelectedOffer(null);
    setBankData(null);
    setFeePayment(null);
  };

  return (
    <div className="main-wrapper">
      <div className="d-print-none">
        <BorrowerHeader />
        <BorrowerSidebar />
      </div>

      <div className="page-wrapper">
        <div className="content container-fluid py-4" style={{ backgroundColor: "var(--oxy-background)" }}>
          <div className="fintech-shell">
            {/* Top Executive Header Bar */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
              <div>
                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                  <span className="badge badge-fintech-primary px-3 py-1 rounded-pill small">
                    <i className="fa-solid fa-bolt me-1"></i> Instant Loan Journey
                  </span>
                  <span className="badge badge-fintech-dark px-2 py-1 rounded-pill small font-monospace">
                    App #{applicationId}
                  </span>
                  <span className="badge badge-fintech-success-soft px-2 py-1 rounded-pill small d-inline-flex align-items-center gap-1">
                    <span className="pulse-beacon" style={{ width: "8px", height: "8px" }}></span>
                    PaySprint CIR Ready
                  </span>
                </div>
                <h3 className="fw-bold mb-0 text-dark">Pre-Approved Borrower Instant Disbursal</h3>
              </div>

              {/* Demo / Sandbox Controls for Tech Head */}
              <div className="d-flex align-items-center gap-2 d-print-none">
                <button
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 fw-bold border shadow-xs ${
                    isNotEligible
                      ? "bg-danger text-white border-danger"
                      : "bg-white text-dark border-secondary"
                  }`}
                  onClick={() => {
                    const toggled = !isNotEligible;
                    setIsNotEligible(toggled);
                    syncState({ isNotEligible: toggled });
                  }}
                  title="Toggle 30-day cooldown state for testing rejection handling"
                >
                  <i className="fa-solid fa-vial text-warning me-1"></i>
                  {isNotEligible ? "Exit Cooldown View" : "Simulate 30-Day Cooldown"}
                </button>

                <button
                  type="button"
                  className="btn btn-sm bg-white text-dark border border-secondary rounded-pill px-3 fw-bold shadow-xs"
                  onClick={handleResetFlow}
                  title="Clear local application storage and start fresh"
                >
                  <i className="fa-solid fa-rotate-left text-primary me-1"></i> Reset Demo
                </button>
              </div>
            </div>

            {/* Stepper Progress Bar (Hidden during Not Eligible state) */}
            {!isNotEligible && currentStep <= 6 && (
              <InstantLoanStepper
                currentStep={currentStep}
                onStepClick={(stepId) => {
                  if (stepId < currentStep) setCurrentStep(stepId);
                }}
              />
            )}

          {/* Dynamic Step Routing Body */}
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
        </div>
      </div>

      <div className="d-print-none">
        <Footer />
      </div>
    </div>
  );
};

export default InstantLoanFlow;
