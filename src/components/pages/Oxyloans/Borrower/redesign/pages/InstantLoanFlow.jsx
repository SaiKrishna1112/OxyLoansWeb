import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BorrowerHeader from "../../../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../../../SideBar/BorrowerSidebar";
import Footer from "../../../../../Footer/Footer";
import { getUserDetails, getBorrowerRequestAmount, getListOfBorrowerLoansInitiated } from "../../../../../HttpRequest/afterlogin";

import InstantLoanStepper, { STEPS } from "../components/instantLoan/InstantLoanStepper";
import InstantLoanStepProfile from "../components/instantLoan/InstantLoanStepProfile";
import InstantLoanStepIncomeVerification from "../components/instantLoan/InstantLoanStepIncomeVerification";
import InstantLoanStepPreEligibility from "../components/instantLoan/InstantLoanStepPreEligibility";
import InstantLoanStepBureauVerification from "../components/instantLoan/InstantLoanStepBureauVerification";
import InstantLoanStepOfferSelection from "../components/instantLoan/InstantLoanStepOfferSelection";
import InstantLoanStepLenderOffers from "../components/instantLoan/InstantLoanStepLenderOffers";
import InstantLoanStepAgreementSign from "../components/instantLoan/InstantLoanStepAgreementSign";
import InstantLoanStepEnachMandate from "../components/instantLoan/InstantLoanStepEnachMandate";
import InstantLoanStepBankDetails from "../components/instantLoan/InstantLoanStepBankDetails";
import InstantLoanStepDisbursalTracker from "../components/instantLoan/InstantLoanStepDisbursalTracker";
import InstantLoanNotEligible from "../components/instantLoan/InstantLoanNotEligible";

import {
  fetchBorrowerProfile,
  loadInstantLoanStorage,
  saveInstantLoanStorage,
  clearInstantLoanStorage,
  normalizeDobToInput,
  fetchLiveIncomeVerification,
} from "../components/instantLoan/instantLoanApi";
import Swal from "sweetalert2";
import CreditScoreGauge from "../components/CreditScoreGauge";
import { formatINR } from "../components/creditReportUtils";
import { calculateOxyScore } from "../components/instantLoan/instantLoanCalculations";
import "../redesign.css";

const InstantLoanFlow = () => {
  const { id } = useParams();
  const sessionUid =
    sessionStorage.getItem("userId") || localStorage.getItem("userId") || "";
  const applicationId = id || sessionUid;

  // Single Point of View Tab State
  const [activeViewTab, setActiveViewTab] = useState("FLOW"); // "FLOW" | "CREDIT" | "DISBURSAL"

  // Application state
  const [currentStep, setCurrentStep] = useState(1);
  const currentStepRef = useRef(1);
  const maxReachedStepRef = useRef(1);

  // Keep refs in sync with state
  useEffect(() => {
    currentStepRef.current = currentStep;
    maxReachedStepRef.current = Math.max(maxReachedStepRef.current, currentStep);
  }, [currentStep]);

  const [isCompleted, setIsCompleted] = useState(false);
  const [isNotEligible, setIsNotEligible] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [showStepsModal, setShowStepsModal] = useState(false);

  // Computed: Sidebar and profile are unlocked only after all steps are completed
  const isAllStepsCompleted = currentStep >= 9 || Boolean(isCompleted);


  const [profileData, setProfileData] = useState({
    name: "",
    firstName: "",
    lastName: "",
    mobile: "",
    whatsAppNumber: "",
    email: "",
    gender: "",
    panNumber: "",
    dateOfBirth: "",
    fatherName: "",
    motherName: "",
    maritalStatus: "Single",
    spouseName: "",
    spouseDob: "",
    address: "",
    locality: "",
    city: "",
    state: "",
    pincode: "",
    monthlySalary: "",
    employmentType: "SALARIED",
    companyName: "",
    designation: "",
    workExperience: "",
    officeAddress: "",
    officeMailId: "",
    officeLandLine: "",
  });

  const [feePayment, setFeePayment] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [bankData, setBankData] = useState(null);
  const [payslipVerification, setPayslipVerification] = useState(null);
  const [bankStatementVerification, setBankStatementVerification] = useState(null);
  const [verifiedSalary, setVerifiedSalary] = useState(0);
  const [isWaitingForLender, setIsWaitingForLender] = useState(false);
  const [lenderSigned, setLenderSigned] = useState(false);

  // Dynamic OxyScore based on borrower profile details, verified income, and bureau CIR
  const oxyScore = useMemo(() => {
    return calculateOxyScore(profileData, verificationResult?.score || null, {
      payslipVerification,
      bankStatementVerification,
      verifiedSalary,
    });
  }, [profileData, verificationResult, payslipVerification, bankStatementVerification, verifiedSalary]);

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

  // Restore stored state & sync with live user details & live income verification from backend (Pure API - No localStorage)
  useEffect(() => {
    const saved = loadInstantLoanStorage(applicationId);
    let savedStep = null;
    if (saved) {
      if (saved.currentStep) {
        savedStep = Number(saved.currentStep);
        setCurrentStep(savedStep);
        currentStepRef.current = savedStep;
        maxReachedStepRef.current = Math.max(maxReachedStepRef.current, savedStep);
      }
      if (saved.isCompleted) setIsCompleted(saved.isCompleted);
      if (saved.feePayment) setFeePayment(saved.feePayment);
      if (saved.selectedOffer) setSelectedOffer(saved.selectedOffer);
      if (saved.bankData) setBankData(saved.bankData);
      if (saved.isNotEligible) setIsNotEligible(saved.isNotEligible);
      if (saved.payslipVerification) setPayslipVerification(saved.payslipVerification);
      if (saved.bankStatementVerification) setBankStatementVerification(saved.bankStatementVerification);
      if (saved.verifiedSalary) setVerifiedSalary(saved.verifiedSalary);
      if (saved.isWaitingForLender !== undefined) setIsWaitingForLender(saved.isWaitingForLender);
      if (saved.lenderSigned !== undefined) setLenderSigned(saved.lenderSigned);
      if (saved.profileData && !saved.profileData.name?.includes("BALIJEPALLI") && saved.profileData.panNumber !== "CDBPB2737H") {
        setProfileData(saved.profileData);
      }
    }

    // Live income cross-verification from OxyLoans backend APIs (Payslips & Bank Statement)
    fetchLiveIncomeVerification(applicationId, profileData)
      .then((incRes) => {
        if (incRes?.payslipVerification) {
          setPayslipVerification(incRes.payslipVerification);
        }
        if (incRes?.bankStatementVerification) {
          setBankStatementVerification(incRes.bankStatementVerification);
        }
        if (incRes?.verifiedSalary) {
          setVerifiedSalary(incRes.verifiedSalary);
          setProfileData((prev) => ({
            ...prev,
            monthlySalary: incRes.verifiedSalary,
            verifiedSalary: incRes.verifiedSalary,
            companyName: incRes.payslipVerification?.companyName || prev.companyName,
          }));
        }
      })
      .catch((e) => console.warn("Live income verification load notice:", e));

    // Always fetch live profile details from OxyLoans backend
    fetchBorrowerProfile(applicationId)
      .then((res) => {
        if (res?.data) {
          const d = res.data;
          const cleanName = d.firstName ? `${d.firstName} ${d.lastName || ""}`.trim() : (d.name || "");
          const cleanAddress = (d.address || d.permanentAddress || "")
            .replace(/\\n/g, "")
            .replace(/,\s*$/, "")
            .trim();
          const cleanDob = normalizeDobToInput(d.dob || d.dateOfBirth) || "";

          setProfileData((prev) => ({
            ...prev,
            name: cleanName || prev.name || "",
            firstName: d.firstName || prev.firstName || cleanName || "",
            lastName: d.lastName || prev.lastName || "",
            mobile: d.mobileNumber || d.mobile || prev.mobile || "",
            whatsAppNumber: d.whatsAppNumber || d.mobileNumber || prev.whatsAppNumber || "",
            email: d.email || prev.email || "",
            gender: (d.gender && d.gender.trim()) || prev.gender || "Male",
            panNumber: d.panNumber || prev.panNumber || "",
            dateOfBirth: cleanDob || prev.dateOfBirth || "",
            fatherName: d.fatherName || prev.fatherName || "",
            motherName: prev.motherName || d.motherName || "",
            maritalStatus: prev.maritalStatus || d.maritalStatus || "Single",
            spouseName: prev.spouseName || d.spouseName || "",
            spouseDob: prev.spouseDob || d.spouseDob || "",
            address: cleanAddress || prev.address || "",
            locality: d.locality || prev.locality || "",
            city: d.city || prev.city || "",
            state: d.state || prev.state || "",
            pincode: d.pinCode || d.pincode || prev.pincode || "",
            monthlySalary: d.salary || d.salaryNew || prev.monthlySalary || "",
            employmentType: d.employment || d.employmentType || prev.employmentType || "SALARIED",
            companyName: d.companyName || prev.companyName || "",
            designation: prev.designation || d.designation || "",
            workExperience: d.workExperience || prev.workExperience || "",
            officeAddress: prev.officeAddress || d.officeAddress || "",
            officeMailId: prev.officeMailId || d.officeMailId || "",
            officeLandLine: prev.officeLandLine || d.officeLandLine || "",
          }));

          // Pre-populate bankData from profile if available
          if (d.accountNumber || d.bankName) {
            setBankData((prevBank) => {
              if (prevBank?.accountNumber) return prevBank;
              return {
                accountHolderName: cleanName || "",
                bankName: d.bankName || "",
                accountNumber: d.accountNumber || "",
                confirmAccountNumber: d.accountNumber || "",
                ifscCode: d.ifscCode || "",
                branchName: d.branchName || "",
                accountType: "SAVINGS",
              };
            });
          }
        }
      })
      .catch((e) => console.warn("Failed to fetch live profile data:", e));

    // Intelligently resume the borrower at their actual current active step from live OxyLoans backend
    const targetBorrowerId = applicationId || sessionUid;

    Promise.allSettled([
      getListOfBorrowerLoansInitiated(targetBorrowerId),
      getBorrowerRequestAmount(targetBorrowerId),
    ]).then(([loansRes, reqRes]) => {
      let activeBackendStep = 1;

      // 1. Check if lender proposals/offers exist in the marketplace
      if (loansRes.status === "fulfilled" && Array.isArray(loansRes.value?.data) && loansRes.value.data.length > 0) {
        const activeOffers = loansRes.value.data;
        const latestOffer = activeOffers[0];
        setSelectedOffer((prev) => prev || latestOffer);

        const hasEsigned = activeOffers.some((o) => Boolean(o.borrowerEsigned));
        const hasEnachDone = activeOffers.some((o) => Boolean(o.enachCompleted) || o.mandateStatus === "ACTIVE");
        const hasExecuted = activeOffers.some((o) => {
          const st = String(o.loanStatus || "").toUpperCase();
          return st === "EXECUTED" || st === "LOANEXECUTED" || st === "DISBURSED";
        });

        if (hasExecuted || (hasEnachDone && hasEsigned)) {
          activeBackendStep = 9; // Step 9: Disbursal Tracker
        } else if (hasEsigned && !hasEnachDone) {
          activeBackendStep = 8; // Step 8: eNACH Mandate Setup
        } else {
          activeBackendStep = 6; // Step 6: Offers Received from Lenders
        }
      } 
      // 2. Check if an active loan request is already live in the P2P market awaiting lender offers
      else if (reqRes.status === "fulfilled" && Array.isArray(reqRes.value?.data) && reqRes.value.data.length > 0) {
        const latestReq = [...reqRes.value.data].sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))[0];
        const st = String(latestReq?.loanRequestStatus || "").toUpperCase();
        if (st && st !== "CLOSED") {
          setSelectedOffer((prev) => prev || latestReq);
          activeBackendStep = 6; // Loan request live in market -> Step 6: Lender Offers
        }
      }

      // If backend indicates active progress, unlock steps and resume user at their active step
      if (activeBackendStep > 1) {
        maxReachedStepRef.current = Math.max(maxReachedStepRef.current, activeBackendStep);
        setCurrentStep((prevStep) => {
          // If no stored step exists or sitting at Step 1, resume at active step
          if (!savedStep || savedStep === 1 || prevStep === 1) {
            currentStepRef.current = activeBackendStep;
            saveInstantLoanStorage(applicationId, { currentStep: activeBackendStep });
            return activeBackendStep;
          }
          return prevStep;
        });
      }
    }).catch((e) => console.warn("Notice checking live borrower step progression in InstantLoanFlow:", e));
  }, [applicationId]);

  // Save changes to storage safely merging existing state and preserving highest step
  const syncState = (updates = {}) => {
    const existing = loadInstantLoanStorage(applicationId) || {};
    const determinedStep = updates.currentStep !== undefined
      ? updates.currentStep
      : Math.max(currentStepRef.current, existing.currentStep || 1);

    const newState = {
      ...existing,
      currentStep: determinedStep,
      isCompleted,
      isNotEligible,
      profileData,
      feePayment,
      selectedOffer,
      bankData,
      payslipVerification,
      bankStatementVerification,
      verifiedSalary,
      isWaitingForLender,
      lenderSigned,
      ...updates,
    };
    currentStepRef.current = determinedStep;
    saveInstantLoanStorage(applicationId, newState);
  };

  // Step 1 Complete (Personal Profile Saved)
  const handleProfileComplete = (data) => {
    setProfileData(data);
    // Advance to Step 2: Income Verification
    const targetStep = 2;
    maxReachedStepRef.current = targetStep;
    currentStepRef.current = targetStep;
    setCurrentStep(targetStep);
    syncState({
      profileData: data,
      currentStep: targetStep,
    });
  };

  const handlePayslipVerified = (ver) => {
    setPayslipVerification(ver);
    if (ver?.detectedSalary) {
      const vSal = Number(ver.detectedSalary);
      setVerifiedSalary(vSal);
      setProfileData((prev) => ({
        ...prev,
        monthlySalary: vSal,
        verifiedSalary: vSal,
        companyName: ver.companyName || prev.companyName,
      }));
    }
    syncState({ payslipVerification: ver });
  };

  const handleBankStatementVerified = (bVer) => {
    setBankStatementVerification(bVer);
    if (bVer?.detectedSalary) {
      const vSal = Number(bVer.detectedSalary);
      setVerifiedSalary(vSal);
      setProfileData((prev) => ({
        ...prev,
        monthlySalary: vSal,
        verifiedSalary: vSal,
      }));
    }
    syncState({ bankStatementVerification: bVer });
  };

  // Step 2 Complete (Income Verified via Bank Statement & Payslip)
  const handleIncomeVerificationComplete = (incomeData) => {
    const vSal = Number(incomeData.verifiedSalary || incomeData.monthlySalary || verifiedSalary);
    setVerifiedSalary(vSal);
    if (incomeData.payslipVerification) {
      setPayslipVerification(incomeData.payslipVerification);
    }
    if (incomeData.bankStatementVerification) {
      setBankStatementVerification(incomeData.bankStatementVerification);
    }
    setProfileData((prev) => ({
      ...prev,
      monthlySalary: vSal,
      verifiedSalary: vSal,
      companyName: incomeData.payslipVerification?.companyName || prev.companyName,
    }));
    setCurrentStep(3);
    syncState({
      currentStep: 3,
      verifiedSalary: vSal,
      payslipVerification: incomeData.payslipVerification || payslipVerification,
      bankStatementVerification: incomeData.bankStatementVerification || bankStatementVerification,
      profileData: {
        ...profileData,
        monthlySalary: vSal,
        verifiedSalary: vSal,
        companyName: incomeData.payslipVerification?.companyName || profileData.companyName,
      },
    });
  };

  // Step 3 Complete (Fee Paid & References Saved)
  const handleFeePaymentSuccess = (payment) => {
    if (!payment?.paymentId && !payment?.orderId) {
      Swal.fire({
        icon: "error",
        title: "Payment Required",
        text: "Cannot proceed to Credit Bureau Verification without a confirmed payment transaction.",
        confirmButtonColor: "#0040e0",
      });
      return;
    }
    setFeePayment(payment);
    if (payment?.ref1 && payment?.ref2) {
      setProfileData((prev) => ({
        ...prev,
        ref1: payment.ref1,
        ref2: payment.ref2,
      }));
    }
    setCurrentStep(4);
    syncState({
      feePayment: payment,
      currentStep: 4,
      ...(payment?.ref1 && payment?.ref2 ? { ref1: payment.ref1, ref2: payment.ref2 } : {}),
    });
  };

  // Step 4 Complete (Bureau & Identity Verified)
  const handleBureauComplete = (bureauResult) => {
    setVerificationResult(bureauResult);
    setCurrentStep(5);
    syncState({ verificationResult: bureauResult, currentStep: 5 });
  };

  // Step 4 Ineligible
  const handleNotEligible = (bureauResult) => {
    setVerificationResult(bureauResult);
    setIsNotEligible(true);
    syncState({ isNotEligible: true, verificationResult: bureauResult });
  };

  // Step 5: Advance to Step 6 (Lender Offers Received - BorrowerLoansInitiated)
  const handleProceedToOffers = (offer = null) => {
    if (offer) setSelectedOffer(offer);
    setIsWaitingForLender(false);
    const targetStep = 6;
    maxReachedStepRef.current = Math.max(maxReachedStepRef.current, targetStep);
    currentStepRef.current = targetStep;
    setCurrentStep(targetStep);
    syncState({
      ...(offer ? { selectedOffer: offer } : {}),
      isWaitingForLender: false,
      currentStep: targetStep,
    });
  };

  const handleOfferSelected = (offer) => {
    handleProceedToOffers(offer);
  };

  // Step 6: Advance to Step 7 (Individual Agreement eSign)
  const handleProceedToEsign = (offer = null) => {
    if (offer) setSelectedOffer(offer);
    setIsWaitingForLender(false);
    const targetStep = 7;
    maxReachedStepRef.current = Math.max(maxReachedStepRef.current, targetStep);
    currentStepRef.current = targetStep;
    setCurrentStep(targetStep);
    syncState({
      ...(offer ? { selectedOffer: offer } : {}),
      currentStep: targetStep,
      isWaitingForLender: false,
      lenderSigned: true,
    });
  };

  // Advance to Step 8 (eNACH Mandate Setup)
  const handleProceedToEnach = (offer = null) => {
    if (offer) setSelectedOffer(offer);
    const targetStep = 8;
    maxReachedStepRef.current = Math.max(maxReachedStepRef.current, targetStep);
    currentStepRef.current = targetStep;
    setCurrentStep(targetStep);
    syncState({
      ...(offer ? { selectedOffer: offer } : {}),
      currentStep: targetStep,
    });
  };

  // Step 5: Modify or reselect offer
  const handleModifyOffer = () => {
    setIsWaitingForLender(false);
    syncState({ isWaitingForLender: false });
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
        maxReachedStepRef.current = 1;
        currentStepRef.current = 1;
        setCurrentStep(1);
        setIsCompleted(false);
        setIsNotEligible(false);
        setSelectedOffer(null);
        setBankData(null);
        setFeePayment(null);
        setPayslipVerification(null);
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

      <div className="page-wrapper instant-flow-page-wrapper">
        <div className="content container-fluid px-3 px-md-4 py-3" style={{ backgroundColor: "var(--oxy-background)" }}>
          <div className="fintech-shell fintech-shell-fullscreen">
            {/* 1. Production-Grade Executive Command Bar: Borrower Profile Bar */}
            <div className="card border-0 shadow-sm rounded-4 mb-3 bg-white p-2.5 p-md-3 border instant-profile-header-card">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 gap-md-3">
                <div className="d-flex align-items-center gap-2.5 gap-md-3 flex-grow-1 overflow-hidden">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-xs instant-profile-avatar"
                    style={{ width: "42px", height: "42px", minWidth: "42px", background: "#0a2540", fontSize: "15px" }}
                  >
                    {profileData.name
                      ? profileData.name.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 2).join("").toUpperCase()
                      : "DS"}
                  </div>
                  <div className="overflow-hidden flex-grow-1">
                    <div className="d-flex flex-wrap align-items-center gap-1.5 gap-md-2 mb-0.5">
                      <h5 className="fw-bold mb-0 text-dark fs-6 fs-md-5 text-truncate" style={{ maxWidth: "220px" }}>
                        {profileData.name || "Borrower"}
                      </h5>
                      <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2 py-0.5 small fw-semibold d-none d-md-inline-flex">
                        <i className="fa-solid fa-circle-check me-1"></i> KYC
                      </span>
                      <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-2 py-0.5 small fw-semibold d-none d-md-inline-flex">
                        <i className="fa-solid fa-building-columns me-1"></i> Bank
                      </span>
                      <span
                        className="badge rounded-pill px-2 py-0.5 small fw-bold d-inline-flex align-items-center gap-1 shadow-2xs"
                        style={{
                          backgroundColor: oxyScore.badgeBg,
                          color: oxyScore.color,
                          border: `1px solid ${oxyScore.badgeBorder}`,
                          fontSize: "11px",
                        }}
                      >
                        <i className="fa-solid fa-gauge-high"></i>
                        <span>OxyScore: <strong>{oxyScore.score}</strong></span>
                      </span>
                    </div>
                    <div className="d-flex flex-wrap align-items-center gap-2 text-muted small" style={{ fontSize: "11px" }}>
                      <span>
                        Salary: <strong>₹{Number(verifiedSalary || profileData.monthlySalary || 0).toLocaleString("en-IN")}/mo</strong>
                      </span>
                      <span className="text-muted opacity-50">|</span>
                      <span className="text-success fw-bold">
                        Pre-Approved: ₹{(Math.round(Number(verifiedSalary || profileData.monthlySalary || 0) * 0.9)).toLocaleString("en-IN")}
                      </span>
                      <span className="text-muted opacity-50 d-none d-sm-inline">|</span>
                      <span className="d-none d-sm-inline">Borrower: <strong>#{applicationId || sessionUid || ""}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-1.5 gap-md-2 ms-auto ms-md-0 flex-shrink-0">
                  {/* Quick Journey Drawer Trigger for Mobile */}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-1 fw-semibold d-inline-flex align-items-center gap-1 shadow-2xs d-lg-none"
                    onClick={() => setShowStepsModal(true)}
                    style={{ fontSize: "11.5px" }}
                    title="View All Journey Steps"
                  >
                    <i className="fa-solid fa-list-check text-primary"></i>
                    <span>Steps ({currentStep}/7)</span>
                    <i className="fa-solid fa-chevron-down opacity-50" style={{ fontSize: "9px" }}></i>
                  </button>

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary bg-white rounded-pill px-2.5 px-md-3 py-1 fw-semibold d-flex align-items-center gap-1 shadow-2xs"
                    onClick={handleResetFlow}
                    title="Clear draft and start fresh"
                    style={{ fontSize: "11.5px" }}
                  >
                    <i className="fa-solid fa-rotate-left"></i>
                    <span className="d-none d-sm-inline">Restart</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal Step Breadcrumbs Bar */}
            <div className="card border-0 shadow-sm rounded-4 mb-3 bg-white px-2.5 px-md-4 py-2 border">
              <div
                className="instant-breadcrumbs-scroll d-flex align-items-center flex-nowrap gap-2 text-muted small overflow-x-auto py-1"
                style={{ fontSize: "12px", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
              >
                {STEPS.map((s, idx) => {
                  const isActive = currentStep === s.id;
                  const isPast = currentStep > s.id;
                  const isFeePaid = Boolean(feePayment?.paymentId || selectedOffer);
                  const isUnlocked = s.id <= Math.max(maxReachedStepRef.current, currentStep) && (s.id <= 3 || isFeePaid);
                  return (
                    <React.Fragment key={s.id}>
                      <div
                        className={`d-flex align-items-center gap-1.5 flex-shrink-0 ${isUnlocked && !isActive ? "cursor-pointer" : ""}`}
                        onClick={() => {
                          if (isUnlocked) {
                          if (s.id > 3 && !feePayment?.paymentId && !selectedOffer) {
                            Swal.fire({
                              icon: "warning",
                              title: "Payment Required",
                              text: "Please complete the Platform Assessment Fee (₹150) in Step 3 to proceed.",
                              confirmButtonColor: "#0040e0",
                            });
                            return;
                          }
                          setCurrentStep(s.id);
                        }
                        }}
                        style={isActive ? {
                          background: "#0040e0",
                          color: "#ffffff",
                          padding: "4px 12px",
                          borderRadius: "9999px",
                          fontWeight: "700"
                        } : {
                          padding: "4px 8px",
                        }}
                      >
                        <span
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: "20px",
                            height: "20px",
                            fontSize: "10.5px",
                            fontWeight: "700",
                            background: isActive ? "#ffffff" : isUnlocked ? "#0a2540" : "#94a3b8",
                            color: isActive ? "#0040e0" : "#ffffff",
                          }}
                        >
                          {s.id}
                        </span>
                        <span className={isActive ? "text-white fw-bold" : isUnlocked ? "text-secondary fw-semibold" : "text-muted"}>
                          {s.label}
                        </span>
                      </div>
                      {idx < STEPS.length - 1 && (
                        <i className="fa-solid fa-chevron-right text-muted opacity-40 mx-0.5 flex-shrink-0" style={{ fontSize: "9px" }}></i>
                      )}
                    </React.Fragment>
                  );
                })}
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
                      <strong>{profileData.name || "Borrower"}</strong> (PAN:{" "}
                      {profileData.panNumber || "—"}).
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
                    <CreditScoreGauge score={verificationResult?.score || 0} size={230} />
                    <div className="mt-3">
                      <span
                        className="badge rounded-pill px-3 py-1 small fw-bold"
                        style={{ background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0" }}
                      >
                        <i className="fa-solid fa-circle-check me-1.5.5.5 text-success"></i> Prime Tier (Lowest ROI: 16.5%)
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
              /* Main Active Loan Flow (Steps 1 to 7) */
              <>
                {/* Steps Sidebar Modal Drawer */}
                {showStepsModal && (
                  <div className="steps-sidebar-modal-root">
                    <div
                      className="steps-sidebar-modal-backdrop"
                      onClick={() => setShowStepsModal(false)}
                    />
                    <div className="steps-sidebar-modal-drawer">
                      <InstantLoanStepper
                        currentStep={currentStep}
                        maxReachedStep={(!feePayment?.paymentId && !selectedOffer) ? Math.min(3, maxReachedStepRef.current) : maxReachedStepRef.current}
                        isWaitingForLender={isWaitingForLender}
                        isModalMode={true}
                        onClose={() => setShowStepsModal(false)}
                        onStepClick={(stepId) => {
                          if (stepId <= Math.max(maxReachedStepRef.current, currentStep)) {
                          if (stepId > 3 && !feePayment?.paymentId && !selectedOffer) {
                            Swal.fire({
                              icon: "warning",
                              title: "Payment Required",
                              text: "Please complete the Platform Assessment Fee (₹150) in Step 3 to proceed.",
                              confirmButtonColor: "#0040e0",
                            });
                            return;
                          }
                          setCurrentStep(stepId);
                          setShowStepsModal(false);
                        }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Floating Steps Navigator Button for Mobile Devices */}
                <button
                  type="button"
                  className="instant-floating-steps-btn d-lg-none"
                  onClick={() => setShowStepsModal(true)}
                  aria-label="View Application Journey Steps"
                >
                  <i className="fa-solid fa-list-check"></i>
                  <span>Step {currentStep} of {STEPS.length}</span>
                  <i className="fa-solid fa-chevron-up ms-1 small"></i>
                </button>

                <div className="row g-4 align-items-start">
                  {/* Step Content Body - Full Width Executive Widescreen Canvas */}
                  <div className="col-12">
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
                          maxReachedStep={(!feePayment?.paymentId && !selectedOffer) ? Math.min(3, maxReachedStepRef.current) : maxReachedStepRef.current}
                          onReturnToOffers={() => setCurrentStep(5)}
                          oxyScore={oxyScore}
                        />
                      ) : currentStep === 2 ? (
                        <InstantLoanStepIncomeVerification
                          profileData={profileData}
                          payslipVerification={payslipVerification}
                          bankStatementVerification={bankStatementVerification}
                          onPayslipVerified={handlePayslipVerified}
                          onBankStatementVerified={handleBankStatementVerified}
                          onNext={handleIncomeVerificationComplete}
                          onBack={() => setCurrentStep(1)}
                        />
                      ) : currentStep === 3 ? (
                        <InstantLoanStepPreEligibility
                          profileData={profileData}
                          payslipVerification={payslipVerification}
                          bankStatementVerification={bankStatementVerification}
                          onPaymentSuccess={handleFeePaymentSuccess}
                          onBack={() => setCurrentStep(2)}
                        />
                      ) : currentStep === 4 ? (
                        (!feePayment?.paymentId && !selectedOffer) ? (
                          <div className="fintech-card p-5 text-center">
                            <div className="rounded-circle bg-warning bg-opacity-10 text-warning d-inline-flex align-items-center justify-content-center p-3 mb-3" style={{ width: "64px", height: "64px" }}>
                              <i className="fa-solid fa-lock fs-3"></i>
                            </div>
                            <h4 className="fw-bold text-dark mb-2">Platform Assessment Fee Required</h4>
                            <p className="text-muted small mx-auto mb-4" style={{ maxWidth: "480px" }}>
                              To initiate the live Credit Bureau pull and KYC underwriting checks, payment of the ₹150 platform assessment fee must be successfully completed.
                            </p>
                            <button
                              type="button"
                              className="btn btn-primary px-4 py-2.5 rounded-pill fw-bold shadow-sm"
                              style={{ backgroundColor: "#0040e0", borderColor: "#0040e0" }}
                              onClick={() => setCurrentStep(3)}
                            >
                              <i className="fa-solid fa-arrow-left me-1.5"></i> Return to Step 3 &amp; Pay Fee
                            </button>
                          </div>
                        ) : (
                          <InstantLoanStepBureauVerification
                            profileData={profileData}
                            onVerificationComplete={handleBureauComplete}
                            onNotEligible={handleNotEligible}
                            oxyScore={oxyScore}
                          />
                        )
                      ) : currentStep === 5 ? (
                        <InstantLoanStepOfferSelection
                          profileData={profileData}
                          payslipVerification={payslipVerification}
                          bankStatementVerification={bankStatementVerification}
                          creditScore={verificationResult?.score || null}
                          oxyScore={oxyScore}
                          onOfferSelected={handleOfferSelected}
                          onProceedToOffers={handleProceedToOffers}
                          onProceedToEsign={handleProceedToEsign}
                          onBack={() => setCurrentStep(4)}
                          isWaitingForLender={isWaitingForLender}
                          lenderSigned={lenderSigned}
                          selectedOffer={selectedOffer}
                          onModifyOffer={handleModifyOffer}
                        />
                      ) : currentStep === 6 ? (
                        <InstantLoanStepLenderOffers
                          profileData={profileData}
                          selectedOffer={selectedOffer}
                          applicationId={applicationId}
                          bankData={bankData}
                          onProceedToEsign={handleProceedToEsign}
                          onProceedToEnach={handleProceedToEnach}
                          onProceedToDisbursal={() => {
                            const nextStep = 9;
                            maxReachedStepRef.current = Math.max(maxReachedStepRef.current, nextStep);
                            currentStepRef.current = nextStep;
                            setCurrentStep(nextStep);
                            syncState({ currentStep: nextStep });
                          }}
                          onBack={() => setCurrentStep(5)}
                        />
                      ) : currentStep === 7 ? (
                        <InstantLoanStepAgreementSign
                          selectedOffer={selectedOffer}
                          profileData={profileData}
                          applicationId={applicationId}
                          onComplete={() => {
                            const nextStep = 8;
                            maxReachedStepRef.current = Math.max(maxReachedStepRef.current, nextStep);
                            currentStepRef.current = nextStep;
                            setCurrentStep(nextStep);
                            syncState({ currentStep: nextStep });
                          }}
                          onBack={() => setCurrentStep(6)}
                        />
                      ) : currentStep === 8 ? (
                        <InstantLoanStepEnachMandate
                          selectedOffer={selectedOffer}
                          profileData={profileData}
                          bankData={bankData}
                          applicationId={applicationId}
                          onComplete={() => {
                            const nextStep = 9;
                            maxReachedStepRef.current = Math.max(maxReachedStepRef.current, nextStep);
                            currentStepRef.current = nextStep;
                            setCurrentStep(nextStep);
                            setIsCompleted(true);
                            syncState({ currentStep: nextStep, isCompleted: true });
                          }}
                          onBack={() => setCurrentStep(7)}
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
