import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Modal from "react-bootstrap/Modal";
import PhoneInput from "react-phone-number-input";

import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import Footer from "../../../Footer/Footer";

import {
  base_url,
  profileupadate,
  setLatLong,
  loadlendernomineeDetails,
  savenomineeDeatailsApi,
  saveBorrowerReferenceDetails,
  getBorrowerReferenceDetails,
  uploadkyc,
  getuploadCredit,
  getBorrowerRunningloans,
  getBorrowerLoanDetails,
  sendWhatsappOtpapi,
  verifyWhatsappOtpapi,
  getUserDetails,
  getPanDoc,
  getdataPassport,
  getdatachequeLeaf,
  getdataDrivingLicence,
  getdataVoterId,
  getdataAadhar,
  getdataBankStatement,
  analyzeBorrowerBankStatement,
  analyzePayslipApi,
  getBorrowerAnalysis,
  getBorrowerStatementById,
  getBorrowerReportPdfUser,
  getBorrowerSalaryDetails,
  getdatatenth,
  getdataintermediate,
  getdatagraduation,
  getdataofferletter,
  getdatafeereceipt,
  getdatapayslips,
  getPCreditReportDoc,
} from "../../../HttpRequest/afterlogin";

import LoadingState from "./redesign/components/LoadingState";
import KYCModal from "./redesign/components/KYCModal";
import CreditScoreModal from "./redesign/components/CreditScoreModal";
import { getCachedCreditReport, parseCreditReportData } from "./redesign/components/creditReportUtils";
import "./redesign/redesign.css";
import { Button } from "antd";
import {
  validateBorrowerPersonalDetails,
  validateMobileNumber,
  validatePincode,
  validateName,
  validatePanNumber,
  validateDesignation,
  validateOfficeAddress,
  calculateBorrowerProfileCompleteness,
  isKycDocUploaded,
  verifySalaryFromBankStatement,
  validatePayslipDocument,
  validateBankStatementAnalysis,
} from "../../../../utils/borrowerValidation";

const Profile = () => {
  const navigate = useNavigate();

  // Loading States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCompletionDetails, setShowCompletionDetails] = useState(false);

  // Edit Modal State: null | "personal" | "nominee" | "kyc" | "references" | "pan"
  const [editSection, setEditSection] = useState(null);
  const [hasRunningLoans, setHasRunningLoans] = useState(false);

  // KYC Production Modal State
  const [kycModal, setKycModal] = useState({
    open: false,
    mode: "preview",
    documentType: "",
    fileUrl: "",
    title: "",
    fileName: "",
  });
  const [modalUploading, setModalUploading] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditBureauData, setCreditBureauData] = useState(() => {
    const cached = getCachedCreditReport();
    return cached ? parseCreditReportData(cached) : null;
  });

  const handleOpenEditSection = (section) => {
    if (hasRunningLoans) {
      if (section === "personal") {
        const isPersonalCompletedAndVerified = Boolean(
          profileData.firstName &&
          profileData.email &&
          profileData.mobileNumber &&
          profileData.panNumber &&
          (profileData.kycStatus || isPanVerified)
        );
        if (isPersonalCompletedAndVerified) {
          Swal.fire({
            icon: "warning",
            title: "Profile Editing Locked",
            text: "You have active running loans. Verified personal profile details cannot be edited while loans are active.",
            confirmButtonColor: "#006242",
          });
          return;
        }
      }



      if (section === "kyc") {
        const isKycCompletedAndVerified = Boolean(
          profileData.kycStatus === true ||
          (kycDocs && Object.values(kycDocs).filter((v) => v !== null).length > 0)
        );
        if (!isKycCompletedAndVerified) {
          Swal.fire({
            icon: "warning",
            title: "KYC & Documents Locked",
            text: "You have active running loans. Verified KYC documents cannot be edited or re-uploaded while loans are active.",
            confirmButtonColor: "#006242",
          });
          return;
        }
      }

      if (section === "pan") {
        if (isPanVerified || profileData.panNumber) {
          Swal.fire({
            icon: "warning",
            title: "PAN Details Locked",
            text: "You have active running loans. Verified PAN card details cannot be edited while loans are active.",
            confirmButtonColor: "#006242",
          });
          return;
        }
      }
    }
    setEditSection(section);
  };

  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    fatherName: "",
    motherName: "",
    maritalStatus: "Single",
    spouseName: "",
    spouseDob: null,
    dob: "",
    gender: "",
    panNumber: "",
    aadharNumber: "",
    email: "",
    mobileNumber: "",
    whatsAppNumber: "",
    residenceAddress: "",
    permanentAddress: "",
    locality: "",
    pinCode: "",
    city: "",
    state: "",
    designation: "",
    officeAddress: "",
    officeMailId: "",
    officeLandLine: "",
    facebookUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
    kycStatus: false,
    bankDetailsInfo: false,
    esignedStatus: false,
    enachStatus: false,
    profileScore: 0,
    cibilScore: 0,
    userId: "",
    studentOrNot: false,
    workExperience: "",
    companyName: "",
    salary: "",
    country: "",
    universityName: "",
    location: "",
    emailVerified: false,
    whatsappVerified: false,
  });

  // Employment Category: STUDENT / SALARIED / SELFEMPLOYED
  const [category, setCategory] = useState("SALARIED");



  // Nominee State
  const [nominee, setNominee] = useState({
    nomineeName: "",
    relation: "",
    nomineeEmail: "",
    nomineeMobile: "",
    accountNo: "",
    nomineeIfsc: "",
    bank: "",
    branch: "",
    nomineecity: "",
  });

  // Reference Contacts State (minimum 2 mandatory contacts)
  const [referenceList, setReferenceList] = useState([
    { name: "", referenceNumber: "", address: "", landMark: "" },
    { name: "", referenceNumber: "", address: "", landMark: "" },
  ]);

  // Secure Passwords State
  const [secureInfo, setSecureInfo] = useState({
    aadharPassword: "",
    panPassword: "",
    bankStatementPassword: "",
    companyAddress: "",
    designation: "",
    cibilScore: "",
    comments: "",
    cibilPassword: "",
    creditReportPassword: "",
    payslipsPassword: "",
    userId: "",
  });

  // KYC Upload Documents State
  const [kycDocs, setKycDocs] = useState({
    PanCard: null,
    Passport: null,
    CHEQUELEAF: null,
    DRIVINGLICENCE: null,
    VOTERID: null,
    aadhar: null,
    bankStatement: null,
    tenth: null,
    inter: null,
    graduation: null,
    universityOfferLetter: null,
    feeReceipt: null,
    paySlips: null,
    creditReport: null,
  });

  // Geocoding and Verification states
  const [addressGeoStatus, setAddressGeoStatus] = useState({
    loading: false,
    message: "",
    valid: null,
  });
  const [isVerifyingPan, setIsVerifyingPan] = useState(false);
  const [panVerificationStatus, setPanVerificationStatus] = useState("");
  const [isPanVerified, setIsPanVerified] = useState(false);

  // WhatsApp OTP verification state
  const [whatsappVal, setWhatsappVal] = useState("");
  const [whatsappOtp, setWhatsappOtp] = useState("");
  const [whatsappSubmitted, setWhatsappSubmitted] = useState(false);

  // Document Verification States (Values populated purely from API responses - no localStorage)
  const [payslipVerification, setPayslipVerification] = useState(null);
  const [salaryVerification, setSalaryVerification] = useState(null);
  const [borrowerSalaryData, setBorrowerSalaryData] = useState(null);
  const [kycActiveTab, setKycActiveTab] = useState("all");

  const documentNames = {
  pan: "PAN Card",
  creditReport: "Credit Bureau Report",
  CREDITREPORT: "Credit Bureau Report",
  CHEQUELEAF: "Cancelled Cheque Leaf",
  BANKSTATEMENT: "Bank Statement (3-6 Months)",
  AADHAR: "Aadhaar Card",
  DRIVINGLICENCE: "Driving Licence",
  VOTERID: "Voter ID Card",
  PASSPORT: "Passport",
  PAYSLIPS: "Current Payslip",
  INTER: "Intermediate Marksheet",
  TENTH: "10th Grade Marksheet",
  GRADUATION: "Graduation Marksheet",
  UNIVERSITYOFFERLETTER: "Offer Letter",
  FEE: "Fee Receipt",
};

  useEffect(() => {
    // Clean up any deprecated local storage verification caches to ensure values are taken ONLY from API responses
    try {
      localStorage.removeItem("oxy_borrower_payslip_verified");
      localStorage.removeItem("oxy_borrower_salary_verified");
      localStorage.removeItem("oxy_borrower_salary_data");
    } catch (e) {}

    document.body.classList.add("oxy-redesign-active");
    loadAllProfileData();
    return () => {
      document.body.classList.remove("oxy-redesign-active");
    };
  }, []);

  const loadAllProfileData = async () => {
    setLoading(true);
    console.log("Loading all profile data...");
    const userId = sessionStorage.getItem("userId") || localStorage.getItem("userId");
    
    try {
      // 1. Load Personal Details
      const userRes = await getUserDetails();
      if (userRes?.status === 200 && userRes.data) {
        const d = userRes.data;
        setProfileData({
          firstName: d.firstName || "",
          lastName: d.lastName || "",
          middleName: d.middleName || "",
          fatherName: d.fatherName || "",
          motherName: d.motherName || "",
          maritalStatus: d.maritalStatus || "Single",
          spouseName: d.maritalStatus === "Married" ? (d.spouseName || "") : "",
          spouseDob: d.maritalStatus === "Married" && d.spouseDob && d.spouseDob.toString().trim() ? d.spouseDob.toString().trim() : null,
          dob: d.dob || "",
          gender: d.gender || "",
          panNumber: d.panNumber || "",
          aadharNumber: d.aadharNumber || "",
          email: d.email || "",
          mobileNumber: d.mobileNumber || "",
          whatsAppNumber: d.whatsAppNumber || "",
          residenceAddress: d.address || "",
          permanentAddress: d.permanentAddress || "",
          locality: d.locality || "",
          pinCode: d.pinCode || "",
          city: d.city || "",
          state: d.state || "",
          designation: d.designation || "",
          officeAddress: d.officeAddress || "",
          officeMailId: d.officeMailId || "",
          officeLandLine: d.officeLandLine || "",
          facebookUrl: d.urlsDto?.faceBookUrl || "",
          linkedinUrl: d.urlsDto?.linkdinUrl || "",
          twitterUrl: d.urlsDto?.twitterUrl || "",
          kycStatus: d.kycStatus || false,
          bankDetailsInfo: d.bankDetailsInfo || false,
          esignedStatus: d.esignedStatus || false,
          enachStatus: d.enachStatus || false,
          profileScore: d.profileScore || d.oxyScore || 0,
          cibilScore: d.cibilScore || 0,
          userId: d.userId || userId,
          studentOrNot: d.studentOrNot || false,
          workExperience: d.workExperience || "",
          companyName: d.companyName || "",
          salary: d.salary || "",
          country: d.country || "",
          universityName: d.universityName || "",
          location: d.location || "",
          emailVerified: d.emailVerified || false,
          whatsappVerified: d.whatsappVerified || false,
        });

        setCategory(d.studentOrNot ? "STUDENT" : d.employment || "SALARIED");
        setWhatsappVal(d.whatsAppNumber || "");



        // Set PAN Verified status initially
        if (d.panVerified) {
          setIsPanVerified(true);
          setPanVerificationStatus("PAN card verified successfully!");
        }

        // Set references via getBorrowerReferenceDetails API
        try {
          const uId = d.userId || sessionStorage.getItem("userId");
          if (uId) {
            const refRes = await getBorrowerReferenceDetails(uId);
            if (refRes?.data) {
              const parsed = normalizeReferenceList(refRes.data);
              if (parsed.length > 0) {
                while (parsed.length < 2) {
                  parsed.push({ name: "", referenceNumber: "", address: "", landMark: "" });
                }
                setReferenceList(parsed);
              }
            }
          }
        } catch (refErr) {
          console.warn("Could not fetch borrower reference details via GET API:", refErr);
          if (d.referenceDetailsResponseDto) {
            const parsed = normalizeReferenceList(d.referenceDetailsResponseDto);
            while (parsed.length < 2) {
              parsed.push({ name: "", referenceNumber: "", address: "", landMark: "" });
            }
            setReferenceList(parsed);
          }
        }
      }
        console.log("Loaded personal profile data:", userRes.data);
      // 2. Load Nominee details
      const nomineeRes = await loadlendernomineeDetails();
      if (nomineeRes?.request?.status === 200 && nomineeRes.data) {
        const nd = nomineeRes.data;
        setNominee({
          nomineeName: nd.name || "",
          relation: nd.relation || "",
          nomineeEmail: nd.emial || "",
          nomineeMobile: nd.mobileNumber || "",
          accountNo: nd.accountNumber || "",
          nomineeIfsc: nd.ifscCode || "",
          bank: nd.bankName || "",
          branch: nd.branchName || "",
          nomineecity: nd.city || "",
        });
      }
      console.log("Loaded nominee details:", nomineeRes.data);
      // 3. Load KYC Files status
      await fetchKycFiles();

      // 5. Check if borrower has active running loans via getBorrowerLoanDetails(userId)
      console.log("Checking borrower running loans for userId:", userId);
      try {
        const loanDetailsRes = await getBorrowerLoanDetails(userId);
        if (loanDetailsRes?.status === 200 && loanDetailsRes.data) {
          const list = Array.isArray(loanDetailsRes.data)
            ? loanDetailsRes.data
            : [loanDetailsRes.data];

          const hasActiveDetails = list.length > 0 && list.some((item) => {
            if (!item || Object.keys(item).length === 0) return false;
            const st = String(item.loanStatus || item.status || item.loanRequestStatus || "").toUpperCase();
            return (
              st === "ACTIVE" ||
              st === "DISBURSED" ||
              st === "ENACH_APPROVED" ||
              st === "ESIGN_DONE" ||
              st === "LOANACCEPTED" ||
              st === "RUNNING" ||
              st === "REQUEST" ||
              st === "PARTIALLYPROCESSING" ||
              Number(item.requestAmount || item.loanRequestAmount || item.amount || 0) > 0
            );
          });

          if (hasActiveDetails) {
            setHasRunningLoans(true);
          } else {
            const runningRes = await getBorrowerRunningloans(1, 10);
            if (runningRes?.status === 200 && runningRes.data) {
              const runList = Array.isArray(runningRes.data)
                ? runningRes.data
                : runningRes.data.results || runningRes.data.listOfApplications || runningRes.data.loans || [];
              setHasRunningLoans(runList.length > 0);
            }
          }
          console.log("Borrower running loans check:", hasActiveDetails);
        } else {
          const runningRes = await getBorrowerRunningloans(1, 10);
          if (runningRes?.status === 200 && runningRes.data) {
            const runList = Array.isArray(runningRes.data)
              ? runningRes.data
              : runningRes.data.results || runningRes.data.listOfApplications || runningRes.data.loans || [];
            setHasRunningLoans(runList.length > 0);
          }
          console.log("Borrower running loans check: No active loans found in getBorrowerLoanDetails, fallback to getBorrowerRunningloans.");
        }
      } catch (activeErr) {
        console.log("Failed to check getBorrowerLoanDetails for profile edit lock", activeErr);
        try {
          const runningRes = await getBorrowerRunningloans(1, 10);
          if (runningRes?.status === 200 && runningRes.data) {
            const runList = Array.isArray(runningRes.data)
              ? runningRes.data
              : runningRes.data.results || runningRes.data.listOfApplications || runningRes.data.loans || [];
            setHasRunningLoans(runList.length > 0);
          }
        } catch {
          setHasRunningLoans(false);
        }
      }
    } catch (err) {
      console.error("Error populating profile data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchKycFiles = async () => {
    try {
      const currentUserId = profileData?.userId || localStorage.getItem("userId") || sessionStorage.getItem("userId");
      const creditReportPass = secureInfo?.creditReportPassword || secureInfo?.cibilPassword || "";
      const res = await Promise.allSettled([
        getPanDoc(),
        getdataPassport(),
        getdatachequeLeaf(),
        getdataDrivingLicence(),
        getdataVoterId(),
        getdataAadhar(),
        getdataBankStatement(),
        getdatatenth(),
        getdataintermediate(),
        getdatagraduation(),
        getdataofferletter(),
        getdatafeereceipt(),
        getdatapayslips(currentUserId),
        getPCreditReportDoc(creditReportPass),
      ]);

      const docKeys = [
        "PanCard", "Passport", "CHEQUELEAF", "DRIVINGLICENCE", "VOTERID",
        "aadhar", "bankStatement", "tenth", "inter", "graduation",
        "universityOfferLetter", "feeReceipt", "paySlips", "creditReport"
      ];

      const updatedDocs = {};
      docKeys.forEach((key, idx) => {
        if (res[idx]?.status === "fulfilled" && res[idx].value?.data) {
          const val = res[idx].value.data;
          if (key === "paySlips") {
            // Handle API response from payslip/user/{userId}:
            // Response format: { data: [ { payslipAnalysisId: 19, ... }, ... ], message: "Payslip analyses fetched successfully", status: "success" }
            // Specifically pick data[0] (the newest/first payslip analysis)
            const payslipList = Array.isArray(val?.data)
              ? val.data
              : Array.isArray(val)
              ? val
              : (val && typeof val === "object" && (val.payslipAnalysisId || val.netSalary || val.fileName))
              ? [val]
              : [];

            const latestPayslip = payslipList.length > 0 ? payslipList[0] : null;

            if (latestPayslip) {
              const downloadUrl =
                latestPayslip.downloadUrl ||
                latestPayslip.documentUrl ||
                latestPayslip.fileUrl ||
                latestPayslip.url ||
                latestPayslip.documentPath ||
                latestPayslip.fileUri ||
                null;

              updatedDocs[key] = {
                ...latestPayslip,
                downloadUrl: downloadUrl,
                fileName: latestPayslip.fileName || "October_2026_Payslip.pdf",
                allPayslips: payslipList,
              };

              const rawSalary =
                latestPayslip.netSalary != null
                  ? latestPayslip.netSalary
                  : latestPayslip.salary != null
                  ? latestPayslip.salary
                  : latestPayslip.grossSalary != null
                  ? latestPayslip.grossSalary
                  : latestPayslip.monthlySalary != null
                  ? latestPayslip.monthlySalary
                  : latestPayslip.amount != null
                  ? latestPayslip.amount
                  : 0;
              const detectedSalary =
                typeof rawSalary === "number"
                  ? rawSalary
                  : rawSalary && typeof rawSalary === "object" && rawSalary.amount
                  ? Number(rawSalary.amount)
                  : Number(rawSalary || 0);

              const rawCompany =
                latestPayslip.companyName ||
                latestPayslip.employerName ||
                latestPayslip.company ||
                latestPayslip.detectedCompany ||
                latestPayslip.employer ||
                "";
              const detectedCompany = typeof rawCompany === "string" ? rawCompany.trim() : "";

              const rawDate =
                latestPayslip.payPeriod ||
                latestPayslip.generatedMonth ||
                latestPayslip.payMonth ||
                latestPayslip.salaryMonth ||
                latestPayslip.payDate ||
                latestPayslip.detectedDate ||
                latestPayslip.monthYear ||
                latestPayslip.month ||
                "";
              let detectedDate = "";
              if (typeof rawDate === "string" && rawDate.trim()) {
                detectedDate = rawDate.trim();
              } else if (rawDate && typeof rawDate === "object" && rawDate.month) {
                detectedDate = `${rawDate.month} ${rawDate.year || ""}`.trim();
              } else if (latestPayslip.createdAt) {
                try {
                  const d = new Date(latestPayslip.createdAt);
                  if (!isNaN(d.getTime())) {
                    detectedDate = d.toLocaleString("en-US", { month: "long", year: "numeric" });
                  }
                } catch (e) {}
              }

              const rawName =
                latestPayslip.employeeName ||
                latestPayslip.detectedName ||
                latestPayslip.name ||
                "";
              let detectedName = typeof rawName === "string" ? rawName.trim() : "";
              if (detectedName.includes("Employee ID")) {
                detectedName = detectedName.split(/Employee ID/i)[0].trim() || detectedName;
              }

              if (detectedCompany || detectedSalary > 0 || detectedDate || detectedName) {
                setPayslipVerification({
                  verified: Boolean(latestPayslip.verified !== false && latestPayslip.success !== false),
                  companyName: detectedCompany,
                  declaredCompany: profileData?.companyName || detectedCompany,
                  detectedName: detectedName,
                  detectedSalary: detectedSalary,
                  detectedDate: detectedDate,
                  netSalary: latestPayslip.netSalary != null ? Number(latestPayslip.netSalary) : detectedSalary,
                  grossSalary: latestPayslip.grossSalary != null ? Number(latestPayslip.grossSalary) : null,
                  totalDeductions: latestPayslip.totalDeductions != null ? Number(latestPayslip.totalDeductions) : null,
                  nameMatch: Boolean(detectedName),
                  salaryMatch: detectedSalary > 0,
                  companyMatch: Boolean(detectedCompany),
                  fileName: latestPayslip.fileName || "",
                  message: latestPayslip.message || `Payslip verified for ${detectedCompany} ${detectedDate ? `(${detectedDate})` : ""}.`,
                  analysisData: latestPayslip,
                });
              }

              if (detectedSalary > 0) {
                setProfileData((prev) => {
                  if (!prev.salary || Number(prev.salary) === 0) {
                    return { ...prev, salary: detectedSalary };
                  }
                  return prev;
                });
              }

              if (detectedCompany) {
                setProfileData((prev) => {
                  if (!prev.companyName) {
                    return { ...prev, companyName: detectedCompany };
                  }
                  return prev;
                });
              }
            } else {
              updatedDocs[key] = null;
              setPayslipVerification(null);
            }
          } else {
            if (val?.errorCode || val?.errorMessage || val?.error) {
              updatedDocs[key] = null;
            } else {
              const docUrl =
                val?.downloadUrl ||
                val?.documentUrl ||
                val?.fileUrl ||
                val?.url ||
                val?.document ||
                val?.documentPath ||
                val?.fileUri ||
                (typeof val === "string" && (val.startsWith("http") || val.startsWith("/") || val.includes(".")) ? val : null);

              if (docUrl) {
                updatedDocs[key] = typeof val === "object" ? { ...val, downloadUrl: docUrl } : { downloadUrl: docUrl };
              } else {
                updatedDocs[key] = null;
              }
            }
          }
        } else {
          updatedDocs[key] = null;
        }
      });
      console.log("Fetched KYC files status:", updatedDocs);
      setKycDocs(updatedDocs);
      await fetchBorrowerAnalysisData();
    } catch (e) {
      console.error("KYC files status load failed", e);
    }
  };

  // Bank Statement Analysis states & handlers
  const [bankAnalysisData, setBankAnalysisData] = useState(null);
  const [latestStatementId, setLatestStatementId] = useState(null);
  const [analyzingBankStatement, setAnalyzingBankStatement] = useState(false);
  const [processingDocument, setProcessingDocument] = useState({
    bankStatement: false,
    creditReport: false,
  });
  const [downloadingBankReport, setDownloadingBankReport] = useState(false);
  const [pdfPasswordModal, setPdfPasswordModal] = useState({
    open: false,
    title: "",
    text: "",
    placeholder: "",
    confirmText: "Continue",
    cancelText: "Skip",
    hasPasswordChoice: null, // null (unselected) | "yes" | "no"
    password: "",
    showPassword: false,
    error: "",
    resolver: null,
  });

  const fetchBorrowerAnalysisData = async () => {
    const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
    if (!userId) return;
    try {
      const res = await getBorrowerAnalysis(userId);
      const resData = res?.data?.data || res?.data || {};
      const statementsList = resData?.statements || resData?.results || [];

      if (Array.isArray(statementsList) && statementsList.length > 0) {
        // Sort statements by uploadedAt descending or id descending to grab the LATEST statement!
        const sortedStatements = [...statementsList].sort((a, b) => {
          if (a.uploadedAt && b.uploadedAt) {
            return new Date(b.uploadedAt) - new Date(a.uploadedAt);
          }
          return (b.id || 0) - (a.id || 0);
        });

        const latestStatement = sortedStatements[0];
        if (latestStatement?.id) {
          setLatestStatementId(latestStatement.id);

          // Pass the latest statement's ID to /v1/user/:statementId/borrower to get statement details!
          try {
            const detailRes = await getBorrowerStatementById(latestStatement.id);
            const detailData = detailRes?.data?.data || detailRes?.data || {};
            setBankAnalysisData({
              ...latestStatement,
              ...detailData,
            });
          } catch (detailErr) {
            console.log("Statement detail by ID notice:", detailErr);
            setBankAnalysisData(latestStatement);
          }
        } else {
          setBankAnalysisData(latestStatement);
        }
      } else if (resData) {
        setBankAnalysisData(resData);
      }
    } catch (e) {
      console.log("No previous bank statement analysis found yet.");
    }

    // Also fetch verified salary details from /borrower/:userId/salary (API-only, no localStorage)
    try {
      const salaryRes = await getBorrowerSalaryDetails(userId);
      const sData = salaryRes?.data?.data || salaryRes?.data || {};
      const sList = Array.isArray(sData.salaryDetails) ? sData.salaryDetails : Array.isArray(sData) ? sData : [];
      if (sList.length > 0) {
        setBorrowerSalaryData(sList[0]);
      } else {
        setBorrowerSalaryData(null);
      }
    } catch (sErr) {
      console.log("No previous salary details found yet.");
      setBorrowerSalaryData(null);
    }
  };

  // Sync Salary Verification whenever bankAnalysisData or profileData.salary changes (in-memory only)
  useEffect(() => {
    if (bankAnalysisData) {
      const result = verifySalaryFromBankStatement(profileData.salary, bankAnalysisData);
      setSalaryVerification(result);
    } else {
      setSalaryVerification(null);
    }
  }, [profileData.salary, bankAnalysisData]);

  const handleTriggerBankAnalysis = async (customPass = null) => {
    const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
    if (!userId) return;

    let activePassword = customPass !== null ? customPass : (secureInfo?.bankStatementPassword || "");

    // If password is not provided yet, prompt borrower to check if their bank statement PDF requires a password
    if (!activePassword && customPass === null) {
      const enteredPassword = await promptForPdfPassword({
        title: "Bank Statement PDF Password",
        text: "Please indicate whether your Bank Statement PDF is password-protected.",
        placeholder: "Enter PDF Password (e.g. DOB or Name)",
        confirmText: "Analyze Statement",
        cancelText: "Skip & Continue",
      });

      if (enteredPassword === null) {
        return; // User closed modal
      }
      activePassword = enteredPassword || "";
      if (activePassword) {
        setSecureInfo((prev) => ({ ...prev, bankStatementPassword: activePassword }));
      }
    }

    setAnalyzingBankStatement(true);
    try {
      const res = await analyzeBorrowerBankStatement(userId, activePassword);
      if (res?.data || res?.status === 200) {
        Swal.fire({
          title: "Bank Statement Analyzed",
          text: res?.data?.message || "Bank statement analysis completed successfully!",
          icon: "success",
          confirmButtonColor: "var(--oxy-primary)"
        });
        await fetchBorrowerAnalysisData();
      }
    } catch (e) {
      const errMsg = e?.response?.data?.errorMessage || e?.message || "";
      const isPasswordError =
        errMsg.toLowerCase().includes("password") ||
        errMsg.toLowerCase().includes("protected") ||
        errMsg.toLowerCase().includes("encrypted") ||
        errMsg.toLowerCase().includes("decrypt") ||
        e?.response?.status === 400 ||
        e?.response?.status === 422;

      if (isPasswordError) {
        const retryPass = await promptForPdfPassword({
          title: "Password Required",
          text: errMsg || "The uploaded bank statement PDF is encrypted or requires a password to analyze. Please enter password:",
          placeholder: "Enter Bank Statement Password",
          confirmText: "Submit & Analyze",
          cancelText: "Cancel",
          initialPassword: activePassword,
        });

        if (retryPass !== null) {
          setSecureInfo((prev) => ({ ...prev, bankStatementPassword: retryPass }));
          setAnalyzingBankStatement(false);
          return handleTriggerBankAnalysis(retryPass);
        }
      } else {
        Swal.fire({
          title: "Analysis Error",
          text: errMsg || "Failed to analyze bank statement.",
          icon: "error",
          confirmButtonColor: "var(--oxy-error)"
        });
      }
    } finally {
      setAnalyzingBankStatement(false);
    }
  };

  const handleDownloadBankReportPdf = async () => {
    const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
    if (!userId) return;
    setDownloadingBankReport(true);
    try {
      const targetId = latestStatementId || userId;
      const res = await getBorrowerReportPdfUser(targetId);
      if (res?.data) {
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Bank_Statement_Analysis_Report_${targetId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        Swal.fire("Downloaded", "Bank statement PDF report downloaded successfully.", "success");
      }
    } catch (e) {
      Swal.fire("Download Failed", e?.response?.data?.errorMessage || "Could not download PDF report.", "error");
    } finally {
      setDownloadingBankReport(false);
    }
  };

  const profileCompletenessInfo = useMemo(() => {
    return calculateBorrowerProfileCompleteness(
      { ...profileData, isPanVerified, kycDocs, payslipVerification, salaryVerification, borrowerSalaryData },
      referenceList,
      nominee,
      null
    );
  }, [profileData, isPanVerified, referenceList, nominee, kycDocs, payslipVerification, salaryVerification, borrowerSalaryData]);

  const profileCompletionPct = profileCompletenessInfo.percentage;
  const getCompletionGroup = (label) =>
    profileCompletenessInfo.completionGroups?.find((group) => group.label === label);

const validateNomineeDetails = (nominee, borrower = {}) => {
  if (!nominee?.nomineeName?.trim()) {
    return { valid: false, message: "Nominee name is mandatory." };
  }
  if (!/^[a-zA-Z\s.]{2,50}$/.test(nominee.nomineeName.trim())) {
    return { valid: false, message: "Nominee name must contain only letters and spaces (at least 2 characters)." };
  }
  if (!nominee?.relation?.trim()) {
    return { valid: false, message: "Nominee relation is mandatory." };
  }
  if (!/^[a-zA-Z\s-]{2,40}$/.test(nominee.relation.trim())) {
    return { valid: false, message: "Nominee relation must contain only letters, spaces, or hyphens." };
  }
  if (!nominee?.nomineeMobile?.trim()) {
    return { valid: false, message: "Nominee mobile number is mandatory." };
  }
  if (!/^[6-9]\d{9}$/.test(nominee.nomineeMobile.trim())) {
    return { valid: false, message: "Nominee mobile must be a valid 10-digit Indian mobile number starting with 6-9." };
  }
  const normalizedBorrowerMobile = String(borrower.mobileNumber || "").replace(/\D/g, "").slice(-10);
  if (normalizedBorrowerMobile && nominee.nomineeMobile.trim() === normalizedBorrowerMobile) {
    return { valid: false, message: "Nominee mobile number must be different from the borrower's mobile number." };
  }
  const normalizedNomineeName = nominee.nomineeName.trim().replace(/\s+/g, "").toLowerCase();
  const normalizedBorrowerName = `${borrower.firstName || ""}${borrower.lastName || ""}`.replace(/\s+/g, "").toLowerCase();
  if (normalizedBorrowerName && normalizedNomineeName === normalizedBorrowerName) {
    return { valid: false, message: "Nominee name must be different from the borrower's name." };
  }
  if (nominee.nomineeEmail?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nominee.nomineeEmail.trim())) {
    return { valid: false, message: "Invalid Nominee email format." };
  }
  if (
    nominee.nomineeEmail?.trim() &&
    borrower.email?.trim() &&
    nominee.nomineeEmail.trim().toLowerCase() === borrower.email.trim().toLowerCase()
  ) {
    return { valid: false, message: "Nominee email must be different from the borrower's email." };
  }
  if (nominee.accountNo?.trim() && !/^\d{9,18}$/.test(nominee.accountNo.trim())) {
    return { valid: false, message: "Nominee account number must be 9 to 18 digits." };
  }
  if (
    nominee.accountNo?.trim() &&
    borrower.accountNumber &&
    nominee.accountNo.trim() === String(borrower.accountNumber).replace(/\D/g, "")
  ) {
    return { valid: false, message: "Nominee account number must be different from the borrower's account number." };
  }
  if (nominee.nomineeIfsc?.trim() && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(nominee.nomineeIfsc.trim().toUpperCase())) {
    return { valid: false, message: "Invalid Nominee IFSC code format (e.g. SBIN0001234)." };
  }
  return { valid: true };
};

const normalizeReferenceList = (raw) => {
  if (!raw) return [];
  let list = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (Array.isArray(raw.referenceDto)) {
    list = raw.referenceDto;
  } else if (Array.isArray(raw.referenceDetailsResponseDto)) {
    list = raw.referenceDetailsResponseDto;
  } else if (Array.isArray(raw.references)) {
    list = raw.references;
  } else if (typeof raw === "object") {
    const legacyRefs = [];
    for (let i = 1; i <= 8; i++) {
      const val = raw[`reference${i}`];
      if (val && String(val).trim()) {
        const str = String(val).trim();
        const phoneMatch = str.match(/[6-9]\d{9}/);
        const phone = phoneMatch ? phoneMatch[0] : "";
        let name = str.replace(/[6-9]\d{9}/, "").replace(/[-–()]/g, "").trim();
        if (!name) name = `Reference ${i}`;
        legacyRefs.push({
          name,
          referenceNumber: phone || str,
          address: "",
          landMark: "",
        });
      }
    }
    if (legacyRefs.length > 0) {
      list = legacyRefs;
    }
  }

  return list.map((item) => ({
    name: item.name || item.referenceName || "",
    referenceNumber: (item.referenceNumber || item.mobileNumber || item.number || "")
      .toString()
      .replace(/\D/g, "")
      .slice(0, 10),
    address: item.address || "",
    landMark: item.landMark || item.landmark || "",
  }));
};

const validateReferenceDetails = (referenceList, borrowerMobile = "") => {
  if (!Array.isArray(referenceList)) {
    return { valid: false, message: "Invalid reference details provided." };
  }

  // Filter entries that have any field filled
  const filledEntries = referenceList.filter(
    (item) =>
      (item.name && item.name.trim() !== "") ||
      (item.referenceNumber && item.referenceNumber.trim() !== "") ||
      (item.address && item.address.trim() !== "") ||
      (item.landMark && item.landMark.trim() !== "")
  );

  if (filledEntries.length < 2) {
    return {
      valid: false,
      message: "At least 2 reference contacts with valid 10-digit mobile numbers are mandatory.",
    };
  }

  const validContacts = [];
  const mobileSet = new Set();
  const cleanBorrowerMobile = String(borrowerMobile || "").replace(/\D/g, "");

  for (let i = 0; i < filledEntries.length; i++) {
    const item = filledEntries[i];
    const cleanNum = String(item.referenceNumber || "").replace(/\D/g, "");
    const cleanName = String(item.name || "").trim();

    if (!cleanName) {
      return {
        valid: false,
        message: `Please enter a name for Reference Contact ${i + 1}.`,
      };
    }

    if (!cleanNum || cleanNum.length !== 10 || !/^[6-9]\d{9}$/.test(cleanNum)) {
      return {
        valid: false,
        message: `Reference Contact ${i + 1} (${cleanName}) must have a valid 10-digit mobile number starting with 6-9.`,
      };
    }

    if (cleanBorrowerMobile && cleanNum === cleanBorrowerMobile) {
      return {
        valid: false,
        message: `Reference mobile number (${cleanNum}) cannot be your own registered mobile number.`,
      };
    }

    if (mobileSet.has(cleanNum)) {
      return {
        valid: false,
        message: `Duplicate reference mobile number detected: ${cleanNum}. Each reference contact must be unique.`,
      };
    }

    mobileSet.add(cleanNum);
    validContacts.push({
      referenceNumber: cleanNum,
      name: cleanName,
      address: String(item.address || "").trim(),
      landMark: String(item.landMark || "").trim(),
    });
  }

  return { valid: true, sanitizedDto: validContacts };
};


  const [localityOptions, setLocalityOptions] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);

  const displayCityOptions = useMemo(() => {
    return Array.from(
      new Set([
        ...(profileData.city ? [profileData.city] : []),
        ...(cityOptions || []),
      ])
    ).filter(Boolean);
  }, [profileData.city, cityOptions]);

  const handlePinCodeLookup = async (pincodeVal) => {
    if (!pincodeVal || pincodeVal.length !== 6) return;
    try {
      const res = await axios.get(`${base_url}${pincodeVal}/pincode`);
      const resData = res.data || res;

      const blocks = resData.pinresults
        ? resData.pinresults
            .map((item) => item.block)
            .filter((block, index, self) => block && self.indexOf(block) === index)
        : [];

      setLocalityOptions(blocks);

        let cities = [];
        if (typeof resData.city === "string" && resData.city.trim()) {
          cities = resData.city.split(/[,/]+/).map((c) => c.trim()).filter(Boolean);
        } else if (Array.isArray(resData.city)) {
          cities = resData.city.filter(Boolean);
        }

        if (resData.cities && Array.isArray(resData.cities)) {
          const extraCities = resData.cities.map((c) => String(c).trim()).filter(Boolean);
          cities = [...cities, ...extraCities];
        }

        if (resData.pinresults && Array.isArray(resData.pinresults)) {
          const pinCities = resData.pinresults
            .map((item) => item.city || item.district || item.districtName || item.taluk)
            .filter(Boolean);
          cities = [...cities, ...pinCities];
        }

        cities = Array.from(new Set(cities));

        setCityOptions(cities);

        const fetchedState =
          resData.state ||
          (resData.pinresults && resData.pinresults[0]?.state) ||
          (resData.pinresults && resData.pinresults[0]?.statename) ||
          "";

      setProfileData((prev) => ({
        ...prev,
        locality: blocks.length > 0 ? (blocks.includes(prev.locality) ? prev.locality : blocks[0]) : prev.locality,
        city: cities.length > 0 ? (cities.includes(prev.city) ? prev.city : cities[0]) : (resData.city || prev.city),
        state: fetchedState || prev.state,
      }));
    } catch (error) {
      console.error("Failed to fetch pincode info", error);
      setLocalityOptions([]);
      setCityOptions([]);
    }
  };

  useEffect(() => {
    if (profileData.pinCode && String(profileData.pinCode).length === 6) {
      handlePinCodeLookup(String(profileData.pinCode));
    }
  }, [profileData.pinCode]);

  // Geocoding Timer hook
  useEffect(() => {
    const address = (profileData.residenceAddress || "").trim();
    const pin = String(profileData.pinCode || "").trim();
    const city = (profileData.city || "").trim();
    const state = (profileData.state || "").trim();

    if (!address || pin.length < 6 || !city || !state) {
      setAddressGeoStatus({ loading: false, message: "", valid: null });
      return;
    }

    setAddressGeoStatus({ loading: true, message: "Verifying residential geocode location...", valid: null });

    const timer = setTimeout(async () => {
      try {
        const query = encodeURIComponent(`${address}, ${pin}, ${city}, ${state}, India`);
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=in`,
          { headers: { "Accept-Language": "en" } }
        );
        if (res.data && res.data.length > 0) {
          const { lat, lon } = res.data[0];
          setAddressGeoStatus({
            loading: false,
            message: `✓ Verified geocode — Lat: ${parseFloat(lat).toFixed(5)}, Lng: ${parseFloat(lon).toFixed(5)}`,
            valid: true,
          });
        } else {
          setAddressGeoStatus({ loading: false, message: "Address geocode not found. Validate pincode.", valid: false });
        }
      } catch (err) {
        setAddressGeoStatus({ loading: false, message: "Geocode verification check failed.", valid: false });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [profileData.residenceAddress, profileData.pinCode, profileData.city, profileData.state]);

  const handleVerifyPan = async () => {
    const panCheck = validatePanNumber(profileData.panNumber);
    if (!panCheck.valid) {
      Swal.fire({
        title: "Invalid PAN Format",
        html: `${panCheck.message}<br/><br/>Would you like to edit your PAN number now?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Edit PAN Number",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          setIsPanVerified(false);
          setEditSection("personal");
        }
      });
      return;
    }
    if (!profileData.firstName) {
      Swal.fire("Validation Error", "First name is mandatory for PAN verification", "warning");
      return;
    }

    setIsVerifyingPan(true);
    setPanVerificationStatus("");
    try {
      const response = await axios.get(
        `${base_url}verifyPan?name=${encodeURIComponent(profileData.firstName)}&pan=${encodeURIComponent(profileData.panNumber)}`,
        {
          headers: {
            accessToken: sessionStorage.getItem("accessToken"),
          },
        }
      );
      if (response.status === 200 && (response.data?.valid === "true" || response.data?.valid === true || response.data?.valid === undefined)) {
        setIsPanVerified(true);
        setPanVerificationStatus("PAN card verified successfully!");
        const panName = response.data?.registered_name || response.data?.name || response.data?.panName || response.data?.registeredName || response.data?.fullName;
        if (panName) {
          setProfileData((prev) => ({ ...prev, firstName: panName }));
          try {
            const currentMaritalStatus = profileData.maritalStatus || "Single";
            const isMarried = currentMaritalStatus === "Married";
            await profileupadate({
              ...profileData,
              firstName: panName,
              panVerified: true,
              maritalStatus: currentMaritalStatus,
              spouseName: isMarried ? (profileData.spouseName || "") : "",
              spouseDob: isMarried && profileData.spouseDob && profileData.spouseDob.toString().trim() ? profileData.spouseDob.toString().trim() : null,
            });
          } catch (persistErr) {
            console.log("Error saving PAN name update", persistErr);
          }
        }
        Swal.fire("Success", panName ? `PAN verified successfully! Name updated to "${panName}".` : "PAN verified successfully!", "success");
        setEditSection(null);
      } else {
        setIsPanVerified(false);
        setPanVerificationStatus("PAN record verification failed.");
        Swal.fire({
          title: "PAN Verification Failed",
          html: `The entered PAN number <strong>${profileData.panNumber}</strong> could not be verified against tax records.<br/><br/>Please edit your PAN number and try again.`,
          icon: "error",
          showCancelButton: true,
          confirmButtonText: "Edit PAN Number",
          cancelButtonText: "Close",
        }).then((result) => {
          if (result.isConfirmed) {
            setIsPanVerified(false);
            setEditSection("personal");
          }
        });
      }
    } catch (err) {
      setIsPanVerified(false);
      setPanVerificationStatus("Verification failure.");
      Swal.fire({
        title: "PAN Verification Failed",
        html: "Unable to verify PAN card at this time.<br/><br/>Would you like to edit your PAN number?",
        icon: "error",
        showCancelButton: true,
        confirmButtonText: "Edit PAN Number",
        cancelButtonText: "Close",
      }).then((result) => {
        if (result.isConfirmed) {
          setIsPanVerified(false);
          setEditSection("personal");
        }
      });
    } finally {
      setIsVerifyingPan(false);
    }
  };

  const handleprofileInput = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    if (name === "maritalStatus") {
      const selectedStatus = value || "Single";
      setProfileData((prev) => ({
        ...prev,
        maritalStatus: selectedStatus,
        ...(selectedStatus !== "Married" ? { spouseName: "", spouseDob: null } : {}),
      }));
      return;
    }

    if (name === "firstName" || name === "lastName" || name === "fatherName" || name === "motherName" || name === "spouseName" || name === "city" || name === "state") {
      sanitizedValue = value.replace(/[^a-zA-Z\s.-]/g, "").slice(0, 50);
    } else if (name === "officeLandLine") {
      sanitizedValue = value.replace(/\D/g, "").slice(0, 15);
    } else if (name === "whatsAppNumber") {
      sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "pinCode") {
      sanitizedValue = value.replace(/\D/g, "").slice(0, 6);
      if (sanitizedValue.length === 6) {
        const pinCheck = validatePincode(sanitizedValue);
        if (pinCheck.valid) {
          handlePinCodeLookup(sanitizedValue);
        } else {
          setLocalityOptions([]);
          setCityOptions([]);
        }
      } else {
        setLocalityOptions([]);
        setCityOptions([]);
      }
    } else if (name === "workExperience") {
      sanitizedValue = value.replace(/\D/g, "").slice(0, 2);
    } else if (name === "panNumber") {
      sanitizedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    } else if (name === "aadharNumber") {
      sanitizedValue = value.replace(/\D/g, "").slice(0, 12);
    } else if (name === "workExperience"){
      sanitizedValue = value.replace(/\D/g, "").slice(0, 2);
    } else if (name === "salary"){
      sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setProfileData((prev) => ({ ...prev, [name]: sanitizedValue }));
  };



  const handleNomineeInput = (e) => {
    const { name, value } = e.target;
    let sanitized = value;
    if (name === "nomineeMobile") {
      sanitized = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "accountNo") {
      sanitized = value.replace(/\D/g, "").slice(0, 18);
    } else if (name === "nomineeIfsc") {
      sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
    }
    setNominee((prev) => ({ ...prev, [name]: sanitized }));
  };

  const handleReferenceChange = (index, field, value) => {
    setReferenceList((prev) => {
      const updated = [...prev];
      let sanitizedVal = value;
      if (field === "referenceNumber") {
        sanitizedVal = value.replace(/\D/g, "").slice(0, 10);
      }
      updated[index] = { ...updated[index], [field]: sanitizedVal };
      return updated;
    });
  };

  const handleAddReference = () => {
    setReferenceList((prev) => [
      ...prev,
      { name: "", referenceNumber: "", address: "", landMark: "" },
    ]);
  };

  const handleRemoveReference = (index) => {
    setReferenceList((prev) => {
      if (prev.length <= 2) {
        const updated = [...prev];
        updated[index] = { name: "", referenceNumber: "", address: "", landMark: "" };
        return updated;
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleSecureInput = (e) => {
    const { name, value } = e.target;
    setSecureInfo((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "cibilPassword") {
        updated.creditReportPassword = value;
      } else if (name === "creditReportPassword") {
        updated.cibilPassword = value;
      }
      return updated;
    });
  };

  const promptForPdfPassword = async ({
    title,
    text,
    placeholder,
    confirmText = "Continue",
    cancelText = "Skip",
    validationMessage = "Password is required!",
    initialPassword = "",
  }) => {
    return new Promise((resolve) => {
      setPdfPasswordModal({
        open: true,
        title,
        text,
        placeholder,
        confirmText,
        cancelText,
        hasPasswordChoice: initialPassword ? "yes" : null,
        password: initialPassword || "",
        showPassword: false,
        error: "",
        resolver: resolve,
      });
    }).then((value) => {
      if (value === undefined || value === null) return null;
      return String(value).trim();
    });
  };

  const handlePdfPasswordModalClose = () => {
    const resolver = pdfPasswordModal.resolver;
    setPdfPasswordModal({
      open: false,
      title: "",
      text: "",
      placeholder: "",
      confirmText: "Continue",
      cancelText: "Skip",
      hasPasswordChoice: null,
      password: "",
      showPassword: false,
      error: "",
      resolver: null,
    });
    if (resolver) {
      resolver(null);
    }
  };

  const handlePdfPasswordModalChange = (e) => {
    const value = e.target.value;
    // Allows all letters (a-z, A-Z), numbers, and special characters
    setPdfPasswordModal((prev) => ({ ...prev, password: value, error: "" }));
  };

  const handlePdfPasswordModalSubmit = () => {
    if (!pdfPasswordModal.hasPasswordChoice) {
      setPdfPasswordModal((prev) => ({
        ...prev,
        error: "Please select whether this file contains a password or not.",
      }));
      return;
    }

    if (pdfPasswordModal.hasPasswordChoice === "yes" && !pdfPasswordModal.password.trim()) {
      setPdfPasswordModal((prev) => ({
        ...prev,
        error: "Password is required for password-protected files.",
      }));
      return;
    }

    const password = pdfPasswordModal.hasPasswordChoice === "yes" ? (pdfPasswordModal.password || "").trim() : "";
    const resolver = pdfPasswordModal.resolver;

    setPdfPasswordModal({
      open: false,
      title: "",
      text: "",
      placeholder: "",
      confirmText: "Continue",
      cancelText: "Skip",
      hasPasswordChoice: null,
      password: "",
      showPassword: false,
      error: "",
      resolver: null,
    });

    if (resolver) {
      resolver(password);
    }
  };

  /**
   * Unified Bank Statement Validation, Analysis & Upload Handler
   * 1. Calls analyze API
   * 2. Validates underwriting decision, salary detection, tamper assessment & name match
   * 3. Upon validation success, uploads statement document
   * 4. Fetches verified salary amount from GET /borrower/:userId/salary
   * 5. Updates profile salary & displays verified salary details
   */
  const processBankStatementValidationAndUpload = async (file, password = "", uploadEvent = null) => {
    const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
    if (!userId) {
      Swal.fire("Session Expired", "Please login again to continue.", "error");
      return false;
    }

    let activePass = password || secureInfo?.bankStatementPassword || "";

    // 1. CALL ANALYZE API FIRST
    let analyzeRes = null;
    try {
      analyzeRes = await analyzeBorrowerBankStatement(userId, file, activePass);
    } catch (err) {
      const errMsg = err?.response?.data?.errorMessage || err?.response?.data?.message || err?.message || "";
      const isPasswordError =
        errMsg.toLowerCase().includes("password") ||
        errMsg.toLowerCase().includes("protected") ||
        errMsg.toLowerCase().includes("encrypted") ||
        errMsg.toLowerCase().includes("decrypt") ||
        err?.response?.status === 400 ||
        err?.response?.status === 422;

      if (isPasswordError) {
        const retryPass = await promptForPdfPassword({
          title: "Password Required",
          text: errMsg || "The uploaded bank statement PDF is password-protected. Please enter the password:",
          placeholder: "Enter Bank Statement Password",
          confirmText: "Submit & Analyze",
          cancelText: "Cancel",
          validationMessage: "Password is required to decrypt statement PDF!",
        });

        if (retryPass === null) {
          return false;
        }

        activePass = retryPass;
        setSecureInfo((prev) => ({ ...prev, bankStatementPassword: retryPass }));

        try {
          analyzeRes = await analyzeBorrowerBankStatement(userId, file, retryPass);
        } catch (retryErr) {
          const rMsg = retryErr?.response?.data?.errorMessage || retryErr?.response?.data?.message || retryErr?.message || "Failed to analyze bank statement with provided password.";
          Swal.fire("Analysis Error", rMsg, "error");
          return false;
        }
      } else {
        Swal.fire({
          title: "Bank Statement Analysis Failed",
          text: errMsg || "Failed to analyze bank statement. Please ensure the file is an authentic bank statement PDF.",
          icon: "error",
          confirmButtonColor: "var(--oxy-primary)",
        });
        return false;
      }
    }

    const resData = analyzeRes?.data || {};

    // 2. VALIDATE ANALYSIS RESPONSE
    const validation = validateBankStatementAnalysis(resData, profileData);

    // 2a. Check for blocking errors (e.g. Underwriter REJECT or Tamper detected)
    if (!validation.isValid) {
      const errContent = validation.errors.join("<br/><br/>");
      Swal.fire({
        title: "Bank Statement Verification Failed",
        html: `<div>We could not accept this bank statement:</div>
               <div class="mt-3 p-3 rounded text-start" style="background-color: #fef2f2 !important; border: 1px solid #fca5a5 !important; color: #991b1b !important; font-size: 13px; line-height: 1.6;">
                 ${errContent}
               </div>`,
        icon: "error",
        confirmButtonText: "Upload Different Statement",
        confirmButtonColor: "var(--oxy-primary)",
      });
      return false;
    }

    // 2b. Name mismatch confirmation
    if (!validation.isNameMatch && validation.needsNameConfirmation) {
      const borrowerFullName = `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim();
      const confirmName = await Swal.fire({
        title: "Bank Account Ownership Check",
        html: `<div class="text-start" style="font-size: 13.5px; line-height: 1.6;">
                 <div class="mb-2">Your profile name: <strong class="text-primary">${borrowerFullName}</strong></div>
                 <div class="mb-3">Account holder on statement: <strong class="text-success">${validation.customerName}</strong></div>
                 <div class="p-3 rounded" style="background:#f8fafc; border:1px solid #e2e8f0;">
                   Is this bank statement for your personal or joint bank account?
                 </div>
               </div>`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: `Yes, Confirm (${validation.customerName})`,
        cancelButtonText: "No, Re-upload Statement",
        confirmButtonColor: "var(--oxy-primary)",
      });

      if (!confirmName.isConfirmed) {
        return false;
      }
    }

    // 2c. Salaried borrower warning if no salary detected or statement period is short
    if (validation.warnings.length > 0) {
      const warnContent = validation.warnings.join("<br/><br/>");
      const confirmWarn = await Swal.fire({
        title: "Statement Notice",
        html: `<div class="text-start" style="font-size: 13.5px; line-height: 1.6;">
                 <div class="p-3 rounded mb-3" style="background:#fffbeb; border:1px solid #fde68a; color:#92400e;">
                   ${warnContent}
                 </div>
                 <div>Do you wish to proceed with this statement?</div>
               </div>`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Proceed",
        cancelButtonText: "Upload Another Statement",
        confirmButtonColor: "var(--oxy-primary)",
      });

      if (!confirmWarn.isConfirmed) {
        return false;
      }
    }

    // 3. ALL CHECKS PASSED -> UPLOAD KYC DOCUMENT
    const eventToUpload = uploadEvent || {
      target: {
        name: "BANKSTATEMENT",
        files: [file],
      },
    };

    try {
      await uploadkyc(eventToUpload, activePass);
    } catch (uErr) {
      console.log("Kyc upload notice:", uErr);
    }

    // 4. FETCH VERIFIED SALARY AMOUNT FROM GET /borrower/:userId/salary (API-only, no localStorage)
    let salaryDetails = null;
    try {
      const salaryRes = await getBorrowerSalaryDetails(userId);
      const sData = salaryRes?.data?.data || salaryRes?.data || {};
      const sList = Array.isArray(sData.salaryDetails) ? sData.salaryDetails : Array.isArray(sData) ? sData : [];
      if (sList.length > 0) {
        salaryDetails = sList[0];
        setBorrowerSalaryData(salaryDetails);

        if (salaryDetails.monthlyAmount > 0 && !profileData.salary) {
          setProfileData((prev) => ({ ...prev, salary: salaryDetails.monthlyAmount }));
        }
      }
    } catch (sErr) {
      console.log("Fetch verified salary notice:", sErr);
    }

    // 5. UPDATE SALARY VERIFICATION & SYNC UI (in-memory state)
    const statementData = resData?.data || resData || {};
    const salaryCheck = verifySalaryFromBankStatement(profileData.salary, statementData);
    setSalaryVerification(salaryCheck);

    await fetchKycFiles();
    await fetchBorrowerAnalysisData();

    // 6. SHOW SUCCESS POPUP WITH VERIFIED SALARY AMOUNT
    const verifiedSalary = salaryDetails?.monthlyAmount != null
      ? salaryDetails.monthlyAmount
      : validation.detectedSalary;

    let trendText = "";
    if (typeof salaryDetails?.salaryTrend === "string") {
      trendText = salaryDetails.salaryTrend;
    } else if (Array.isArray(salaryDetails?.salaryTrend)) {
      trendText = salaryDetails.salaryTrend
        .map((item) => (typeof item === "object" ? `${item.month || item.date || "M"}: ₹${Number(item.amount || 0).toLocaleString("en-IN")}` : String(item)))
        .join(", ");
    }

    Swal.fire({
      title: "Bank Statement Verified & Uploaded",
      html: `<div>Bank statement uploaded and analyzed successfully!</div>
             <div class="mt-3 p-3 rounded text-start" style="background:#f0fdf4; border:1px solid #bbf7d0; font-size:13px; line-height:1.7;">
               ${verifiedSalary > 0 ? `
                 <div class="d-flex justify-content-between mb-1 pb-1 border-bottom">
                   <span class="text-muted">Verified Monthly Salary:</span>
                   <span class="fw-bold text-success" style="font-size: 15px;">₹ ${Number(verifiedSalary).toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                 </div>
               ` : ""}
               ${(salaryDetails?.bankName || validation.bankName) ? `
                 <div class="d-flex justify-content-between mb-1">
                   <span class="text-muted">Bank Name:</span>
                   <span class="fw-semibold">${salaryDetails?.bankName || validation.bankName} ${salaryDetails?.accountNumberMasked || validation.accountNumberMasked || ""}</span>
                 </div>
               ` : ""}
               ${(salaryDetails?.employer || validation.rawOverview?.employerHint) ? `
                 <div class="d-flex justify-content-between mb-1">
                   <span class="text-muted">Employer / Narration:</span>
                   <span class="fw-semibold text-truncate ms-2" style="max-width:180px;" title="${salaryDetails?.employer || validation.rawOverview?.employerHint}">
                     ${salaryDetails?.employer || validation.rawOverview?.employerHint}
                   </span>
                 </div>
               ` : ""}
               ${((salaryDetails?.periodStart && salaryDetails?.periodEnd) || (validation.periodStart && validation.periodEnd)) ? `
                 <div class="d-flex justify-content-between mb-1">
                   <span class="text-muted">Statement Period:</span>
                   <span class="fw-semibold">${salaryDetails?.periodStart || validation.periodStart} to ${salaryDetails?.periodEnd || validation.periodEnd}</span>
                 </div>
               ` : ""}
               ${trendText ? `
                 <div class="d-flex justify-content-between">
                   <span class="text-muted">Salary Trend:</span>
                   <span class="badge bg-success-subtle text-success py-1 px-2 fw-semibold">${trendText}</span>
                 </div>
               ` : ""}
             </div>`,
      icon: "success",
      confirmButtonText: "Done",
      confirmButtonColor: "var(--oxy-primary)",
    });

    return true;
  };

  // Upload File handler
  const handleFileUploadInput = async (e) => {
    if (profileCompletionPct < 75) {
      Swal.fire("Incomplete Profile", "Personal details must be at least 75% complete before files can be uploaded.", "warning");
      return;
    }

    const file = e.target.files?.[0];

    if (e.target.name === "BANKSTATEMENT" && file) {
      let pass = secureInfo?.bankStatementPassword || "";
      setProcessingDocument((prev) => ({ ...prev, bankStatement: true }));

      const enteredPass = await promptForPdfPassword({
        title: "Bank Statement Password",
        text: "Enter the password if this PDF is protected. Leave it blank if the document is not password protected.",
        placeholder: "Enter PDF Password (optional)",
        confirmText: "Verify & Upload",
        cancelText: "Cancel",
        validationMessage: "Password can be left blank if the file is not protected.",
        initialPassword: pass,
      });

      if (enteredPass === null) {
        setProcessingDocument((prev) => ({ ...prev, bankStatement: false }));
        return;
      }

      pass = enteredPass || "";
      if (pass) {
        setSecureInfo((prev) => ({ ...prev, bankStatementPassword: pass }));
      }

      setAnalyzingBankStatement(true);
      try {
        await processBankStatementValidationAndUpload(file, pass, e);
      } finally {
        setAnalyzingBankStatement(false);
        setProcessingDocument((prev) => ({ ...prev, bankStatement: false }));
      }
      return;
    }

    if (
      (e.target.name === "CREDITREPORT" || e.target.name === "creditReport") &&
      file
    ) {
      setProcessingDocument((prev) => ({ ...prev, creditReport: true }));
      let pass =
        secureInfo?.creditReportPassword ||
        secureInfo?.cibilPassword ||
        "";

      const enteredPass = await promptForPdfPassword({
        title: "Credit Report Password",
        text: "Enter the password if this report is protected. Leave blank if the PDF is not password protected.",
        placeholder: "Enter Credit Report Password (optional)",
        confirmText: "Verify & Upload",
        cancelText: "Cancel",
        validationMessage: "Password can be left blank if the file is not protected.",
        initialPassword: pass,
      });

      if (enteredPass === null) {
        setProcessingDocument((prev) => ({ ...prev, creditReport: false }));
        return;
      }

      pass = enteredPass || "";
      if (pass) {
        setSecureInfo((prev) => ({
          ...prev,
          cibilPassword: pass,
          creditReportPassword: pass,
        }));
      }

      try {
        const res = await uploadkyc(e, pass);

        if (res?.request?.status === 200 || res?.status === 200) {
          await Swal.fire({
            title: "Upload Successful",
            text: "Credit Bureau Report has been uploaded and processed successfully.",
            icon: "success",
          });

          await fetchKycFiles();
        } else {
          await Swal.fire({
            title: "Upload Failed",
            text:
              res?.data?.errorMessage ||
              "Credit report cannot be uploaded.",
            icon: "error",
          });
        }
      } catch (err) {
        const errMsg =
          err?.response?.data?.errorMessage ||
          err?.message ||
          "";

        const isPasswordError =
          errMsg.toLowerCase().includes("password") ||
          errMsg.toLowerCase().includes("protected") ||
          errMsg.toLowerCase().includes("encrypted") ||
          errMsg.toLowerCase().includes("decrypt") ||
          err?.response?.status === 400 ||
          err?.response?.status === 422;

        if (isPasswordError) {
          const retryPass = await promptForPdfPassword({
            title: "Password Required",
            text: errMsg || "The uploaded Credit Report PDF is password-protected.",
            placeholder: "Enter Credit Report Password",
            confirmText: "Submit & Upload",
            cancelText: "Cancel",
            validationMessage: "Password is required!",
          });

          if (retryPass === null) {
            setProcessingDocument((prev) => ({ ...prev, creditReport: false }));
            return;
          }

          setSecureInfo((prev) => ({
            ...prev,
            cibilPassword: retryPass,
            creditReportPassword: retryPass,
          }));

          try {
            const retryRes = await uploadkyc(e, retryPass);

            if (
              retryRes?.request?.status === 200 ||
              retryRes?.status === 200
            ) {
              await Swal.fire({
                title: "Upload Successful",
                text: "Credit Bureau Report uploaded successfully.",
                icon: "success",
              });

              await fetchKycFiles();
            } else {
              await Swal.fire({
                title: "Upload Failed",
                text:
                  retryRes?.data?.errorMessage ||
                  "Credit report cannot be uploaded.",
                icon: "error",
              });
            }
          } catch (retryErr) {
            await Swal.fire({
              title: "Upload Failed",
              text:
                retryErr?.response?.data?.errorMessage ||
                "Failed to upload credit report.",
              icon: "error",
            });
          }
        } else {
          await Swal.fire({
            title: "Upload Failed",
            text: errMsg || "An error occurred during upload.",
            icon: "error",
          });
        }
      } finally {
        setProcessingDocument((prev) => ({ ...prev, creditReport: false }));
      }

      return;
    }

    if ((e.target.name === "PAYSLIPS" || e.target.name === "paySlips") && file) {
      let pass = secureInfo?.payslipsPassword || "";

      const enteredPass = await promptForPdfPassword({
        title: "Payslip PDF Password",
        text: "Is your payslip password-protected? Enter the password below (leave blank if unencrypted).",
        placeholder: "Enter Payslip Password (optional)",
        confirmText: "Verify & Upload",
        cancelText: "Cancel",
        validationMessage: "Password can be left blank if not protected.",
        initialPassword: pass,
      });

      if (enteredPass === null) {
        if (e.target) e.target.value = "";
        return;
      }
      pass = enteredPass || "";
      if (pass) {
        setSecureInfo((prev) => ({ ...prev, payslipsPassword: pass }));
      }

      setProcessingDocument((prev) => ({ ...prev, paySlips: true }));

      try {
        // 1. Analyze payslip via POST payslip/analyze1 (multipart/form-data with file & userId)
        const currentUserId = profileData?.userId || localStorage.getItem("userId") || sessionStorage.getItem("userId");
        const analyzeRes = await analyzePayslipApi(file, currentUserId);
        const resData = analyzeRes?.data?.data || analyzeRes?.data || {};

        let declaredCompany = (profileData.companyName || "").trim();
        const borrowerFirstName = (profileData.firstName || "").trim();

        // 2. Validate against past 6 months, company name, user first name, and salary
        let validation = await validatePayslipDocument(resData, declaredCompany, file, borrowerFirstName);

        // 2a. If company didn't match directly, check with borrower if it's the parent company / legal entity
        if (!validation.isCompanyMatch && validation.needsParentConfirmation) {
          const confirmParent = await Swal.fire({
            title: "Employer / Legal Entity Check",
            html: `<div class="text-start" style="font-size: 13.5px; line-height: 1.6;">
                     <div class="mb-2">Your profile employer is: <strong class="text-primary">${declaredCompany}</strong></div>
                     <div class="mb-3">Employer detected on payslip: <strong class="text-success">${validation.detectedCompany}</strong></div>
                     <div class="p-3 rounded" style="background:#f8fafc; border:1px solid #e2e8f0;">
                       Is <strong>${validation.detectedCompany}</strong> the legal entity, parent company, or payroll partner for <strong>${declaredCompany}</strong>?
                     </div>
                   </div>`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Yes, Confirm (${validation.detectedCompany})`,
            cancelButtonText: "No, Re-upload Different Payslip",
            confirmButtonColor: "var(--oxy-primary)",
          });

          if (confirmParent.isConfirmed) {
            validation.isCompanyMatch = true;
            validation.errors = validation.errors.filter((err) => !err.includes("Employer mismatch"));
            validation.isValid = validation.isDateValid && validation.detectedSalary > 0;
            const updatedCompany = `${declaredCompany} (${validation.detectedCompany})`;
            setProfileData((prev) => ({ ...prev, companyName: updatedCompany }));
            declaredCompany = updatedCompany;
          }
        }

        // 2b. If date was not readable by OCR, prompt borrower to confirm pay month from recent 3 months
        if (!validation.isDateValid && validation.needsDateConfirmation) {
          const options = {};
          const mNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          const curr = new Date();
          for (let i = 0; i < 3; i++) {
            const d = new Date(curr.getFullYear(), curr.getMonth() - i, 1);
            const key = `${mNames[d.getMonth()]} ${d.getFullYear()}`;
            options[key] = i === 0 ? `${key} (Current Month)` : key;
          }
          options["OLDER"] = "Older than 3 months";

          const { value: selectedMonth } = await Swal.fire({
            title: "Confirm Payslip Month",
            text: "We could not automatically detect the pay date from this document. Please select the month this payslip covers:",
            input: "select",
            inputOptions: options,
            inputPlaceholder: "Select Pay Month",
            showCancelButton: true,
            confirmButtonText: "Confirm Month",
            cancelButtonText: "Cancel",
            confirmButtonColor: "var(--oxy-primary)",
            inputValidator: (val) => (!val ? "Please select a month!" : null),
          });

          if (selectedMonth && selectedMonth !== "OLDER") {
            validation.isDateValid = true;
            validation.detectedDate = selectedMonth;
            validation.errors = validation.errors.filter((err) => !err.includes("date") && !err.includes("month"));
            validation.isValid = validation.isCompanyMatch && validation.isNameMatch && validation.detectedSalary > 0;
          }
        }

        // 2c. If name was not readable by OCR, prompt borrower to confirm ownership
        if (!validation.isNameMatch && validation.needsNameConfirmation) {
          const confirmName = await Swal.fire({
            title: "Confirm Payslip Ownership",
            html: `<div class="text-start" style="font-size: 13.5px; line-height: 1.6;">
                     <div class="mb-2">Your profile first name: <strong class="text-primary">${borrowerFirstName}</strong></div>
                     <div class="p-3 rounded" style="background:#f8fafc; border:1px solid #e2e8f0;">
                       We could not automatically detect your first name from the document text. Please confirm: Is this payslip officially issued to you (<strong>${borrowerFirstName}</strong>)?
                     </div>
                   </div>`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Yes, Confirm My Payslip`,
            cancelButtonText: "No, Re-upload My Payslip",
            confirmButtonColor: "var(--oxy-primary)",
          });

          if (confirmName.isConfirmed) {
            validation.isNameMatch = true;
            validation.errors = validation.errors.filter((err) => !err.toLowerCase().includes("name"));
            validation.isValid = validation.isDateValid && validation.isCompanyMatch && validation.detectedSalary > 0;
          }
        }

        if (!validation.isValid) {
          // Reset file input so user can reupload
          if (e.target) e.target.value = "";

          const errContent = validation.errors?.length > 0
            ? validation.errors.join("<br/><br/>")
            : (validation.errorMessage || "Please upload your current payslip issued by your employer.");

          Swal.fire({
            title: "Payslip Verification Failed",
            html: `<div>We could not accept this payslip due to the following issue(s):</div>
                   <div class="mt-3 p-3 rounded text-start" style="background-color: #fef2f2 !important; border: 1px solid #fca5a5 !important; color: #991b1b !important; font-size: 13px; line-height: 1.6;">
                     ${errContent}
                   </div>
                   <div class="mt-3 text-muted small">Please upload your <b>current payslip</b> issued by <b>${declaredCompany || "your declared company"}</b>.</div>`,
            icon: "error",
            confirmButtonText: "Re-upload Payslip",
            confirmButtonColor: "var(--oxy-primary)",
          });
          return;
        }

        // 3. ALL CHECKS PASSED -> Update salary in profile based on payslip
        const newSalary = validation.detectedSalary;
        setProfileData((prev) => ({ ...prev, salary: newSalary }));

        try {
          const userProfilePayload = {
            ...profileData,
            salary: newSalary,
          };
          const formDataPayload = {
            totalExperience: profileData.workExperience,
            company: profileData.companyName,
            salary: newSalary,
            designation: profileData.designation,
            officeAddress: profileData.officeAddress,
            officeMailId: profileData.officeMailId,
            officeLandLine: profileData.officeLandLine,
            country: profileData.country,
            universityName: profileData.universityName,
            universityLocation: profileData.location,
          };
          await profileupadate(userProfilePayload, formDataPayload, category);
        } catch (updateErr) {
          console.warn("Notice: could not persist salary update immediately", updateErr);
        }

        // 4. ONLY NOW UPLOAD TO S3 via uploadkyc
        await uploadkyc(e, pass);
        await fetchKycFiles();
        await loadAllProfileData();

        const payslipRecord = {
          verified: true,
          companyName: validation.detectedCompany,
          declaredCompany,
          detectedName: validation.detectedName || borrowerFirstName,
          detectedSalary: newSalary,
          detectedDate: validation.detectedDate,
          nameMatch: true,
          salaryMatch: true,
          companyMatch: true,
          message: `Payslip verified for ${validation.detectedCompany} (${validation.detectedDate}).`,
          analysisData: resData,
        };

        setPayslipVerification(payslipRecord);

        Swal.fire({
          title: "Payslip Verified & Uploaded",
          html: `<div>Your payslip was successfully verified and uploaded to S3!</div>
                 <div class="mt-3 p-3 rounded text-start" style="background:#f8fafc; border:1px solid #e2e8f0; font-size:13px;">
                   <div class="mb-1"><b>Employer:</b> ${declaredCompany} <span class="badge bg-success ms-1">Matched</span></div>
                   <div class="mb-1"><b>Pay Period:</b> ${validation.detectedDate} <span class="badge bg-success ms-1">Within Last 6 Months</span></div>
                   <div class="mb-1"><b>Monthly Salary:</b> ₹${newSalary.toLocaleString("en-IN")} <span class="badge bg-success ms-1">Profile Updated</span></div>
                   <div class="mt-2 text-success fw-bold">
                     <i class="fa-solid fa-circle-check text-success me-1"></i>
                     Document verified and synced with profile.
                   </div>
                 </div>`,
          icon: "success",
          confirmButtonColor: "var(--oxy-primary)",
        });
      } catch (err) {
        console.error("Payslip analyze error:", err);
        if (e.target) e.target.value = "";
        const errMsg = err?.response?.data?.errorMessage || err?.response?.data?.message || err?.message || "Failed to analyze payslip.";

        Swal.fire({
          title: "Payslip Analysis Failed",
          html: `<div>${errMsg}</div><div class="mt-2 text-muted small">Please verify the document is a readable PDF or image and try again.</div>`,
          icon: "error",
          confirmButtonText: "Re-upload Payslip",
          confirmButtonColor: "var(--oxy-primary)",
        });
      } finally {
        setProcessingDocument((prev) => ({ ...prev, paySlips: false }));
      }
      return;
    }

    try {
      const res = await uploadkyc(e);
      if (res?.request?.status === 200 || res?.status === 200) {
        Swal.fire(
          "Upload Successful",
          `${documentNames[e.target.name] || "Document"} has been uploaded and processed successfully.`,
          "success"
        );
        await fetchKycFiles();
      } else {
        Swal.fire("Upload Failed", res?.data?.errorMessage || "File cannot be uploaded.", "error");
      }
    } catch {
      Swal.fire("Upload Failed", "An error occurred during upload.", "error");
    }
  };

  

  // Send Whatsapp OTP
  const handleSendWhatsappOtp = async () => {
    if (!whatsappVal) {
      Swal.fire("Invalid Number", "Enter a valid number.", "warning");
      return;
    }
    try {
      const res = await sendWhatsappOtpapi({ whatapp: whatsappVal }, whatsappVal);
      if (res) {
        setWhatsappSubmitted(true);
        Swal.fire("OTP Dispatched", "Enter OTP sent to your WhatsApp number.", "info");
      }
    } catch {
      Swal.fire("OTP Error", "Failed to dispatch verification OTP.", "error");
    }
  };

  const handleVerifyWhatsappOtp = async () => {
    if (!whatsappOtp) return;
    try {
      const res = await verifyWhatsappOtpapi({ whatapp: whatsappVal, otp: whatsappOtp });
      if (res) {
        Swal.fire("Verified", "WhatsApp number updated successfully.", "success");
        setProfileData((prev) => ({ ...prev, whatsAppNumber: whatsappVal }));
        setWhatsappSubmitted(false);
        setWhatsappOtp("");
        setEditSection(null);
      }
    } catch {
      Swal.fire("Verification Error", "Verification OTP mismatch.", "error");
    }
  };

  // distance
    const triggersavingGoogleCordinates = async (userId) => {
        try {
          await axios.post(
            `${base_url}savingGoogleCordinates`,
            {
              userId: String(userId),
            },
            {
              headers: {
                accessToken: sessionStorage.getItem("accessToken"),
              },
            },
          );
        } catch (error) {
          // Silent background call - no user popup required.
          console.log("savingGoogleCordinates api failed", error);
        }
      };

  // Save Personal Details form
  const savePersonalDetails = async () => {
    const effectiveMaritalStatus = profileData.maritalStatus || "Single";
    const isMarried = effectiveMaritalStatus === "Married";
    const effectiveSpouseName = isMarried ? (profileData.spouseName || "") : "";
    const rawSpouseDob = isMarried ? profileData.spouseDob : null;
    const effectiveSpouseDob = isMarried && rawSpouseDob && rawSpouseDob.toString().trim()
      ? rawSpouseDob.toString().trim()
      : null;

    const dataToValidate = {
      ...profileData,
      maritalStatus: effectiveMaritalStatus,
      spouseName: effectiveSpouseName,
      spouseDob: effectiveSpouseDob,
    };

    // Run comprehensive borrower validation rule
    console.log("Validating borrower personal details before save...", dataToValidate);
    const validationResult = validateBorrowerPersonalDetails(dataToValidate, category);
    if (!validationResult.valid) {
      Swal.fire("Validation Error", validationResult.message, "warning");
      return;
    }

    setSubmitting(true);
    try {
      // Inline verify PAN card details if not verified
      let updatedFirstName = profileData.firstName;
      if (!isPanVerified) {
        setIsVerifyingPan(true);
        setPanVerificationStatus("");
        try {
          const verifyRes = await axios.get(
            `${base_url}verifyPan?name=${encodeURIComponent(profileData.firstName)}&pan=${encodeURIComponent(profileData.panNumber)}`,
            {
              headers: {
                accessToken: sessionStorage.getItem("accessToken"),
              },
            }
          );
          if (verifyRes.status === 200 && (verifyRes.data?.valid === "true" || verifyRes.data?.valid === true || verifyRes.data?.valid === undefined)) {
            setIsPanVerified(true);
            setPanVerificationStatus("PAN card verified successfully!");
            const panName = verifyRes.data?.registered_name || verifyRes.data?.name || verifyRes.data?.panName || verifyRes.data?.registeredName || verifyRes.data?.fullName;
            if (panName) {
              updatedFirstName = panName;
              setProfileData((prev) => ({ ...prev, firstName: panName }));
            }
          } else {
            setIsPanVerified(false);
            Swal.fire({
              title: "PAN Verification Failed",
              text: "Check PAN number and Name. Must match registered tax record. Please edit your PAN number.",
              icon: "error",
              showCancelButton: true,
              confirmButtonText: "Edit PAN Number",
              cancelButtonText: "Cancel",
            }).then((result) => {
              if (result.isConfirmed) {
                setEditSection("personal");
              }
            });
            setSubmitting(false);
            return;
          }
        } catch (err) {
          setIsPanVerified(false);
          Swal.fire({
            title: "PAN Verification Failed",
            text: "Unable to verify PAN card at this time. Please edit your PAN number.",
            icon: "error",
            showCancelButton: true,
            confirmButtonText: "Edit PAN Number",
            cancelButtonText: "Cancel",
          }).then((result) => {
            if (result.isConfirmed) {
              setEditSection("personal");
            }
          });
          setSubmitting(false);
          return;
        } finally {
          setIsVerifyingPan(false);
        }
      }

      const userProfilePayload = {
        firstName: updatedFirstName,
        lastName: profileData.lastName,
        middleName: profileData.middleName,
        fatherName: profileData.fatherName,
        motherName: profileData.motherName,
        maritalStatus: effectiveMaritalStatus,
        spouseName: effectiveSpouseName,
        spouseDob: effectiveSpouseDob,
        dob: profileData.dob,
        gender: profileData.gender,
        panNumber: profileData.panNumber,
        residenceAddress: profileData.residenceAddress,
        permanentAddress: profileData.permanentAddress,
        pinCode: profileData.pinCode,
        city: profileData.city,
        state: profileData.state,
        locality: profileData.locality,
        facebookUrl: profileData.facebookUrl,
        linkedinUrl: profileData.linkedinUrl,
        twitterUrl: profileData.twitterUrl,
        whatsAppNumber: profileData.whatsAppNumber,
        aadharNumber: profileData.aadharNumber,
        designation: profileData.designation,
        officeAddress: profileData.officeAddress,
        officeMailId: profileData.officeMailId,
        officeLandLine: profileData.officeLandLine,
      };

      const formDataPayload = {
        totalExperience: profileData.workExperience,
        company: profileData.companyName,
        salary: profileData.salary,
        designation: profileData.designation,
        officeAddress: profileData.officeAddress,
        officeMailId: profileData.officeMailId,
        officeLandLine: profileData.officeLandLine,
        country: profileData.country,
        universityName: profileData.universityName,
        universityLocation: profileData.location,
      };

      const response = await profileupadate(userProfilePayload, formDataPayload, category);
      if (response?.status === 200 || response?.request?.status === 200) {
        try {
          await setLatLong();
           triggersavingGoogleCordinates(response.data.userId);
        } catch (error) {
          console.error("Failed to update google distance", error);
        }
        Swal.fire("Success", "Personal details & PAN verification saved successfully.", "success");
        setEditSection(null);
        loadAllProfileData();
      } else {
        Swal.fire("Save Failure", response?.data?.errorMessage || "Update failed.", "error");
      }
    } catch (e) {
      Swal.fire("Save Failure", "Update failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Save Nominee details
  const saveNomineeDetails = async () => {
    const valRes = validateNomineeDetails(nominee, profileData);
    if (!valRes.valid) {
      Swal.fire("Validation Error", valRes.message, "warning");
      return;
    }

    setSubmitting(true);
    try {
      const res = await savenomineeDeatailsApi(nominee);
      if (res?.status === 200 || res?.request?.status === 200) {
        Swal.fire("Success", "Nominee details updated successfully.", "success");
        setEditSection(null);
      } else {
        Swal.fire("Save Failure", "Unable to update nominee details.", "error");
      }
    } catch {
      Swal.fire("Save Failure", "Unable to update nominee details.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Save reference details
  const saveReferenceDetails = async () => {
    const valRes = validateReferenceDetails(referenceList, profileData.mobileNumber);
    if (!valRes.valid) {
      Swal.fire("Validation Error", valRes.message, "warning");
      return;
    }

    setSubmitting(true);
    try {
      const currentUserId = Number(profileData.userId || sessionStorage.getItem("userId"));
      const payload = {
        userId: currentUserId,
        updateReferenceDetails: true,
        referenceDto: valRes.sanitizedDto,
      };
      const res = await saveBorrowerReferenceDetails(payload);
      if (res?.status === 200 || res?.request?.status === 200) {
        Swal.fire("Success", "Reference contacts updated successfully.", "success");
        setEditSection(null);
        // Refresh reference details from GET API
        try {
          const refRes = await getBorrowerReferenceDetails(currentUserId);
          if (refRes?.data) {
            const parsed = normalizeReferenceList(refRes.data);
            while (parsed.length < 2) {
              parsed.push({ name: "", referenceNumber: "", address: "", landMark: "" });
            }
            setReferenceList(parsed);
          }
        } catch {
          // ignore
        }
      } else {
        const msg = res?.data?.errorMessage || "Unable to update reference details.";
        Swal.fire("Save Failure", msg, "error");
      }
    } catch (err) {
      console.error("Error saving reference details:", err);
      const msg = err?.response?.data?.errorMessage || "Unable to update reference details.";
      Swal.fire("Save Failure", msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const openKYCModal = (docType, mode = null) => {
    if (!docType) return;
    const docKeyMap = {
      pan: "PanCard",
      PanCard: "PanCard",
      CREDITREPORT: "creditReport",
      creditReport: "creditReport",
      CHEQUELEAF: "CHEQUELEAF",
      BANKSTATEMENT: "bankStatement",
      bankStatement: "bankStatement",
      AADHAR: "aadhar",
      aadhar: "aadhar",
      DRIVINGLICENCE: "DRIVINGLICENCE",
      VOTERID: "VOTERID",
      PASSPORT: "Passport",
      Passport: "Passport",
      PAYSLIPS: "paySlips",
      paySlips: "paySlips",
      INTER: "intermediate",
      intermediate: "intermediate",
      TENTH: "tenth",
      tenth: "tenth",
      GRADUATION: "graduation",
      graduation: "graduation",
      OFFERLETTER: "universityOfferLetter",
      offerletter: "universityOfferLetter",
      FEERECEIPT: "feeReceipt",
      feereceipt: "feeReceipt",
    };
    const kycKey = docKeyMap[docType] || docType;
    const docObj = kycDocs?.[kycKey];
    const downloadUrl = docObj?.downloadUrl || "";
    const fileName = docObj?.fileName || "";
    const title = documentNames[docType] || docType;

    setKycModal({
      open: true,
      mode: mode || (downloadUrl ? "preview" : "upload"),
      documentType: docType,
      fileUrl: downloadUrl,
      title: title,
      fileName: fileName,
    });
  };

  const closeKYCModal = () => {
    setKycModal((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const viewKYCFile = (fileUrl, title = "", docType = "", fileName = "") => {
    if (!fileUrl) {
      if ((docType === "PAYSLIPS" || docType === "paySlips") && (payslipVerification || kycDocs?.paySlips)) {
        const ps = payslipVerification || kycDocs?.paySlips;
        const netSal = ps.netSalary || ps.detectedSalary || 0;
        const grossSal = ps.grossSalary || 0;
        const ded = ps.totalDeductions || 0;
        const comp = ps.companyName || ps.employerName || "";
        const empName = ps.detectedName || ps.employeeName || "";
        const payMo = ps.detectedDate || ps.payPeriod || "";
        const fName = ps.fileName || fileName || "Payslip Document";

        Swal.fire({
          title: "Payslip Verification Details",
          html: `
            <div class="text-start" style="font-size: 13.5px; line-height: 1.6;">
              <div class="p-2.5 mb-2.5 rounded" style="background: #f0fdf4; border: 1px solid #bbf7d0;">
                <div class="d-flex align-items-center gap-2">
                  <i class="fa-solid fa-circle-check text-success" style="font-size: 16px;"></i>
                  <strong class="text-success">Verified Document Analyzed</strong>
                </div>
                <div class="text-muted small mt-1">File: <b>${fName}</b></div>
              </div>
              <table class="table table-sm table-bordered mt-2 mb-0" style="font-size: 12.5px;">
                <tbody>
                  ${empName ? `<tr><td class="text-muted">Employee</td><td><strong>${empName}</strong></td></tr>` : ""}
                  ${comp ? `<tr><td class="text-muted">Employer</td><td><strong>${comp}</strong></td></tr>` : ""}
                  ${payMo ? `<tr><td class="text-muted">Period / Month</td><td><strong>${payMo}</strong></td></tr>` : ""}
                  ${grossSal ? `<tr><td class="text-muted">Gross Salary</td><td class="text-dark">₹${Number(grossSal).toLocaleString("en-IN")}</td></tr>` : ""}
                  ${ded ? `<tr><td class="text-muted">Deductions</td><td class="text-danger">- ₹${Number(ded).toLocaleString("en-IN")}</td></tr>` : ""}
                  ${netSal ? `<tr><td class="text-muted"><b>Net Salary</b></td><td class="text-success fw-bold">₹${Number(netSal).toLocaleString("en-IN")}</td></tr>` : ""}
                </tbody>
              </table>
            </div>
          `,
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Upload / Replace Payslip",
          cancelButtonText: "Close",
          confirmButtonColor: "var(--oxy-primary)",
        }).then((result) => {
          if (result.isConfirmed) {
            openKYCModal("PAYSLIPS", "upload");
          }
        });
        return;
      }
      Swal.fire("File Not Found", "The requested KYC file is not available.", "error");
      return;
    }
    setKycModal({
      open: true,
      mode: "preview",
      documentType: docType,
      fileUrl: fileUrl,
      title: title || (docType && documentNames[docType]) || "Document Preview",
      fileName: fileName,
    });
  };

  const handleModalUploadFile = async (file, docType, password) => {
    setModalUploading(true);
    try {
      const syntheticEvent = {
        target: {
          name: docType,
          files: [file],
        },
      };

      if (docType === "BANKSTATEMENT" || docType === "bankStatement") {
        if (password) {
          setSecureInfo((prev) => ({ ...prev, bankStatementPassword: password }));
        }
        await processBankStatementValidationAndUpload(file, password || "", syntheticEvent);
        setKycModal((prev) => ({ ...prev, open: false }));
        return;
      } else if (docType === "PAYSLIPS" || docType === "paySlips") {
        let analyzeRes = null;
        let resData = {};
        try {
          const currentUserId = profileData?.userId || localStorage.getItem("userId") || sessionStorage.getItem("userId");
          analyzeRes = await analyzePayslipApi(file, currentUserId);
          resData = analyzeRes?.data?.data || analyzeRes?.data || {};
        } catch (aErr) {
          console.error("Payslip analyze error:", aErr);
          const errMsg = aErr?.response?.data?.errorMessage || aErr?.response?.data?.message || aErr?.message || "Failed to analyze payslip.";
          Swal.fire({
            title: "Payslip Analysis Failed",
            html: `<div>${errMsg}</div><div class="mt-2 text-muted small">Please verify the document is a readable PDF or image and try again.</div>`,
            icon: "error",
            confirmButtonText: "Re-upload Payslip",
            confirmButtonColor: "var(--oxy-primary)",
          });
          return;
        }

        let declaredCompany = (profileData.companyName || "").trim();
        const borrowerFirstName = (profileData.firstName || "").trim();

        // 2. Validate against past 6 months, company name, user first name, and salary
        let validation = await validatePayslipDocument(resData, declaredCompany, file, borrowerFirstName);

        // 2a. If company didn't match directly, check with borrower if it's the parent company / legal entity
        if (!validation.isCompanyMatch && validation.needsParentConfirmation) {
          const confirmParent = await Swal.fire({
            title: "Employer / Legal Entity Check",
            html: `<div class="text-start" style="font-size: 13.5px; line-height: 1.6;">
                     <div class="mb-2">Your profile employer is: <strong class="text-primary">${declaredCompany}</strong></div>
                     <div class="mb-3">Employer detected on payslip: <strong class="text-success">${validation.detectedCompany}</strong></div>
                     <div class="p-3 rounded" style="background:#f8fafc; border:1px solid #e2e8f0;">
                       Is <strong>${validation.detectedCompany}</strong> the legal entity, parent company, or payroll partner for <strong>${declaredCompany}</strong>?
                     </div>
                   </div>`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Yes, Confirm (${validation.detectedCompany})`,
            cancelButtonText: "No, Re-upload Different Payslip",
            confirmButtonColor: "var(--oxy-primary)",
          });

          if (confirmParent.isConfirmed) {
            validation.isCompanyMatch = true;
            validation.errors = validation.errors.filter((err) => !err.includes("Employer mismatch"));
            validation.isValid = validation.isDateValid && validation.detectedSalary > 0;
            const updatedCompany = `${declaredCompany} (${validation.detectedCompany})`;
            setProfileData((prev) => ({ ...prev, companyName: updatedCompany }));
            declaredCompany = updatedCompany;
          }
        }

        // 2b. If date was not readable by OCR, prompt borrower to confirm pay month from recent 3 months
        if (!validation.isDateValid && validation.needsDateConfirmation) {
          const options = {};
          const mNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          const curr = new Date();
          for (let i = 0; i < 3; i++) {
            const d = new Date(curr.getFullYear(), curr.getMonth() - i, 1);
            const key = `${mNames[d.getMonth()]} ${d.getFullYear()}`;
            options[key] = i === 0 ? `${key} (Current Month)` : key;
          }
          options["OLDER"] = "Older than 3 months";

          const { value: selectedMonth } = await Swal.fire({
            title: "Confirm Payslip Month",
            text: "We could not automatically detect the pay date from this document. Please select the month this payslip covers:",
            input: "select",
            inputOptions: options,
            inputPlaceholder: "Select Pay Month",
            showCancelButton: true,
            confirmButtonText: "Confirm Month",
            cancelButtonText: "Cancel",
            confirmButtonColor: "var(--oxy-primary)",
            inputValidator: (val) => (!val ? "Please select a month!" : null),
          });

          if (selectedMonth && selectedMonth !== "OLDER") {
            validation.isDateValid = true;
            validation.detectedDate = selectedMonth;
            validation.errors = validation.errors.filter((err) => !err.includes("date") && !err.includes("month"));
            validation.isValid = validation.isCompanyMatch && validation.isNameMatch && validation.detectedSalary > 0;
          }
        }

        // 2c. If name was not readable by OCR, prompt borrower to confirm ownership
        if (!validation.isNameMatch && validation.needsNameConfirmation) {
          const confirmName = await Swal.fire({
            title: "Confirm Payslip Ownership",
            html: `<div class="text-start" style="font-size: 13.5px; line-height: 1.6;">
                     <div class="mb-2">Your profile first name: <strong class="text-primary">${borrowerFirstName}</strong></div>
                     <div class="p-3 rounded" style="background:#f8fafc; border:1px solid #e2e8f0;">
                       We could not automatically detect your first name from the document text. Please confirm: Is this payslip officially issued to you (<strong>${borrowerFirstName}</strong>)?
                     </div>
                   </div>`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: `Yes, Confirm My Payslip`,
            cancelButtonText: "No, Re-upload My Payslip",
            confirmButtonColor: "var(--oxy-primary)",
          });

          if (confirmName.isConfirmed) {
            validation.isNameMatch = true;
            validation.errors = validation.errors.filter((err) => !err.toLowerCase().includes("name"));
            validation.isValid = validation.isDateValid && validation.isCompanyMatch && validation.detectedSalary > 0;
          }
        }

        if (!validation.isValid) {
          const errContent = validation.errors?.length > 0
            ? validation.errors.join("<br/><br/>")
            : (validation.errorMessage || "Please upload your current payslip issued by your employer.");

          Swal.fire({
            title: "Payslip Verification Failed",
            html: `<div>We could not accept this payslip due to the following issue(s):</div>
                   <div class="mt-3 p-3 rounded text-start" style="background-color: #fef2f2 !important; border: 1px solid #fca5a5 !important; color: #991b1b !important; font-size: 13px; line-height: 1.6;">
                     ${errContent}
                   </div>
                   <div class="mt-3 text-muted small">Please upload your <b>current payslip</b> issued by <b>${declaredCompany || "your declared company"}</b>.</div>`,
            icon: "error",
            confirmButtonText: "Re-upload Payslip",
            confirmButtonColor: "var(--oxy-primary)",
          });
          return;
        }

        // ALL CHECKS PASSED -> Update salary in profile based on payslip
        const newSalary = validation.detectedSalary;
        setProfileData((prev) => ({ ...prev, salary: newSalary }));

        try {
          const userProfilePayload = {
            ...profileData,
            salary: newSalary,
          };
          const formDataPayload = {
            totalExperience: profileData.workExperience,
            company: profileData.companyName,
            salary: newSalary,
            designation: profileData.designation,
            officeAddress: profileData.officeAddress,
            officeMailId: profileData.officeMailId,
            officeLandLine: profileData.officeLandLine,
            country: profileData.country,
            universityName: profileData.universityName,
            universityLocation: profileData.location,
          };
          await profileupadate(userProfilePayload, formDataPayload, category);
        } catch (updateErr) {
          console.warn("Notice: could not persist salary update immediately", updateErr);
        }

        if (password) {
          setSecureInfo((prev) => ({ ...prev, payslipsPassword: password }));
        }

        // ONLY NOW UPLOAD TO S3
        await uploadkyc(syntheticEvent, password || "");
        await fetchKycFiles();
        await loadAllProfileData();

        const payslipRecord = {
          verified: true,
          companyName: validation.detectedCompany,
          declaredCompany,
          detectedName: validation.detectedName || borrowerFirstName,
          detectedSalary: newSalary,
          detectedDate: validation.detectedDate,
          nameMatch: true,
          salaryMatch: true,
          companyMatch: true,
          message: `Payslip verified for ${validation.detectedCompany} (${validation.detectedDate}).`,
          analysisData: resData,
        };

        setPayslipVerification(payslipRecord);

        Swal.fire({
          title: "Payslip Verified & Uploaded",
          html: `<div>Your payslip was successfully verified and uploaded to S3!</div>
                 <div class="mt-3 p-3 rounded text-start" style="background:#f8fafc; border:1px solid #e2e8f0; font-size:13px;">
                   <div class="mb-1"><b>Employer:</b> ${declaredCompany} <span class="badge bg-success ms-1">Matched</span></div>
                   <div class="mb-1"><b>Pay Period:</b> ${validation.detectedDate} <span class="badge bg-success ms-1">Within Last 6 Months</span></div>
                   <div class="mb-1"><b>Monthly Salary:</b> ₹${newSalary.toLocaleString("en-IN")} <span class="badge bg-success ms-1">Profile Updated</span></div>
                   <div class="mt-2 text-success fw-bold">
                     <i class="fa-solid fa-circle-check text-success me-1"></i>
                     Document verified and synced with profile.
                   </div>
                 </div>`,
          icon: "success",
          confirmButtonColor: "var(--oxy-primary)",
        });
      } else if (docType === "CREDITREPORT" || docType === "creditReport") {
        if (password) {
          setSecureInfo((prev) => ({ ...prev, creditReportPassword: password, cibilPassword: password }));
        }
        await uploadkyc(syntheticEvent, password || "");
        Swal.fire("Upload Successful", "Credit Bureau Report uploaded successfully.", "success");
        await fetchKycFiles();
      } else {
        await uploadkyc(syntheticEvent, password || "");
        Swal.fire("Upload Successful", `${documentNames[docType] || "Document"} uploaded successfully.`, "success");
        await fetchKycFiles();
      }

      closeKYCModal();
    } catch (err) {
      console.error("KYC modal upload failed:", err);
      Swal.fire("Upload Failed", err?.response?.data?.errorMessage || "An error occurred during upload.", "error");
    } finally {
      setModalUploading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <BorrowerHeader />
      <BorrowerSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid py-4" style={{ backgroundColor: "var(--oxy-background)" }}>
          
          {/* Active Running Loans Lock Banner */}
          {/* {hasRunningLoans && (
            <div className="alert alert-warning border border-warning shadow-sm rounded-4 mb-4 p-3 d-flex align-items-center gap-3 bg-warning bg-opacity-10">
              <div className="rounded-circle bg-warning text-dark p-3 d-flex align-items-center justify-content-center" style={{ width: "45px", height: "45px" }}>
                <i className="fa-solid fa-lock fs-5"></i>
              </div>
              <div>
                <h6 className="fw-bold text-dark mb-1">Active Loans Lock Policy Active</h6>
                <span className="text-dark small">
                  Because you have running loans, verified profile details and bank account information are locked and cannot be edited until your active loans are completed.
                </span>
              </div>
            </div>
          )} */}
          
          {loading ? (
            <LoadingState count={2} type="card" />
          ) : (
            <>
              {/* TOP HEADER BANNER CARD */}
              <div className="profile-banner mb-4">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="profile-avatar-circle">
                      <i className="fa-regular fa-user"></i>
                    </div>
                    <div>
                      <h4 className="fw-bold mb-1 text-white text-capitalize">
                        {profileData.firstName || "—"}
                      </h4>
                      <p className="text-white-50 mb-2 small">Borrower ID: BR{profileData.userId}</p>
                      
                      <div className="d-flex gap-2 flex-wrap">
                        {/* PAN Pending warning badge */}
                        {!isPanVerified ? (
                          <span className="badge px-3 py-1.5 rounded text-dark font-bold d-inline-flex align-items-center gap-1" style={{ backgroundColor: "#ffd60a", fontSize: "12px" }}>
                            <i className="fa-solid fa-triangle-exclamation"></i> PAN Pending
                          </span>
                        ) : (
                          <span className="badge px-3 py-1.5 rounded text-white font-bold d-inline-flex align-items-center gap-1" style={{ backgroundColor: "#38b000", fontSize: "12px" }}>
                            <i className="fa-solid fa-circle-check"></i> PAN Linked
                          </span>
                        )}

                        {/* KYC Verification badge */}
                        {profileData.kycStatus === true ? (
                          <span className="badge px-3 py-1.5 rounded text-white font-bold d-inline-flex align-items-center gap-1" style={{ backgroundColor: "#38b000", fontSize: "12px" }}>
                            <i className="fa-solid fa-user-shield"></i> KYC Verified
                          </span>
                        ) : (
                          <span className="badge px-3 py-1.5 rounded text-white font-bold d-inline-flex align-items-center gap-1" style={{ backgroundColor: "#0284c7", fontSize: "12px" }}>
                            <i className="fa-solid fa-clock-rotate-left"></i> KYC Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    className="btn edit-profile-btn"
                    onClick={() => handleOpenEditSection("personal")}
                  >
                    <i className="fa-regular fa-edit me-2"></i> Edit Profile
                  </button>
                </div>
              </div>

              {/* PROFILE COMPLETION PROGRESS & CHECKLIST CARD */}
              <div className="card border-0 shadow-sm rounded-4 mb-4 bg-white p-4">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div>
                    <h6 className="fw-bold mb-1 text-dark d-flex align-items-center gap-2">
                      <i className="fa-solid fa-sliders text-primary"></i> Profile Completeness
                    </h6>
                    <span className="text-muted small">
                      You must achieve at least <strong>90% Profile Completeness</strong> to raise a loan request.
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    {profileCompletionPct >= 90 ? (
                      <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-bold">
                        <i className="fa-solid fa-check-circle me-1"></i> Loan Request Eligible ({profileCompletionPct}%)
                      </span>
                    ) : (
                      <span className="badge bg-warning-subtle text-dark px-3 py-2 rounded-pill fw-bold">
                        <i className="fa-solid fa-triangle-exclamation me-1 text-warning"></i> {profileCompletionPct}% Completed (90% Required)
                      </span>
                    )}
                  </div>
                </div>

                <div className="progress mb-3" style={{ height: "10px", borderRadius: "10px" }}>
                  <div 
                    className={`progress-bar rounded-pill ${profileCompletionPct >= 90 ? "bg-success" : "bg-warning"}`} 
                    role="progressbar" 
                    style={{ width: `${profileCompletionPct}%`, transition: "width 0.4s ease" }}
                  />
                </div>

                {/* Checklist Chips */}
                <div className="d-flex flex-wrap gap-2 pt-2 border-top">
                  <span 
                    className={`badge p-2 px-3 rounded-pill fw-semibold border ${profileData.firstName && profileData.pinCode ? "bg-success-subtle text-success border-success-subtle" : "bg-light text-muted"}`}
                    onClick={() => handleOpenEditSection("personal")}
                    style={{ cursor: "pointer" }}
                  >
                    <i className={`fa-solid ${profileData.firstName && profileData.pinCode ? "fa-circle-check" : "fa-circle-dot"} me-1`}></i> Personal & Address
                  </span>

                  <span 
                    className={`badge p-2 px-3 rounded-pill fw-semibold border ${isPanVerified ? "bg-success-subtle text-success border-success-subtle" : "bg-light text-muted"}`}
                    onClick={() => handleOpenEditSection("personal")}
                    style={{ cursor: "pointer" }}
                  >
                    <i className={`fa-solid ${isPanVerified ? "fa-circle-check" : "fa-circle-dot"} me-1`}></i> PAN Verified
                  </span>

                  <span 
                    className={`badge p-2 px-3 rounded-pill fw-semibold border ${referenceList.filter(r => r.name?.trim() && r.referenceNumber?.trim()).length >= 2 ? "bg-success-subtle text-success border-success-subtle" : "bg-light text-muted"}`}
                    onClick={() => setEditSection("references")}
                    style={{ cursor: "pointer" }}
                  >
                    <i className={`fa-solid ${referenceList.filter(r => r.name?.trim() && r.referenceNumber?.trim()).length >= 2 ? "fa-circle-check" : "fa-circle-dot"} me-1`}></i> 2 Emergency References
                  </span>

                  <span 
                    className={`badge p-2 px-3 rounded-pill fw-semibold border ${(getCompletionGroup("KYC Documents")?.earned || 0) >= 15 ? "bg-success-subtle text-success border-success-subtle" : "bg-light text-muted"}`}
                    onClick={() => handleOpenEditSection("kyc")}
                    style={{ cursor: "pointer" }}
                  >
                    <i className={`fa-solid ${(getCompletionGroup("KYC Documents")?.earned || 0) >= 15 ? "fa-circle-check" : "fa-circle-dot"} me-1`}></i> KYC Documents
                  </span>
                </div>

                {/* Category percentage summary and incomplete requirements */}
                {profileCompletenessInfo.completionGroups?.length > 0 && (
                  <div className="mt-4 pt-3 border-top d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm rounded-pill px-3"
                      onClick={() => setShowCompletionDetails(true)}
                    >
                      <i className="fa-solid fa-list-check me-1"></i> View Completion Details
                    </button>
                  </div>
                )}
              </div>

              <Modal
                show={showCompletionDetails}
                onHide={() => setShowCompletionDetails(false)}
                centered
                size="lg"
              >
                <Modal.Header closeButton>
                  <Modal.Title className="fw-bold">Completion Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                    <span className="text-muted">Complete the items below to reach the required 90%.</span>
                    <span className={`badge rounded-pill px-3 py-2 ${profileCompletenessInfo.pointsRemainingToEligibility > 0 ? "bg-warning-subtle text-dark" : "bg-success-subtle text-success"}`}>
                      {profileCompletenessInfo.pointsRemainingToEligibility > 0
                        ? `${profileCompletenessInfo.pointsRemainingToEligibility}% more needed`
                        : "90% requirement completed"}
                    </span>
                  </div>

                  <div className="d-flex flex-wrap gap-2 mb-4">
                    {profileCompletenessInfo.completionGroups.map((group) => {
                      const complete = group.earned >= group.points;
                      return (
                        <span
                          className={`badge rounded-pill border px-3 py-2 ${complete ? "bg-success-subtle text-success border-success-subtle" : "bg-warning-subtle text-dark border-warning-subtle"}`}
                          key={group.label}
                        >
                          <i className={`fa-solid ${complete ? "fa-circle-check" : "fa-circle-exclamation"} me-1`}></i>
                          {group.label}: {group.earned}% / {group.points}%
                        </span>
                      );
                    })}
                  </div>

                  {profileCompletenessInfo.completionBreakdown.some((item) => !item.completed) ? (
                    <div className="border rounded-3 p-3 bg-warning bg-opacity-10">
                      <div className="fw-bold text-dark mb-2">Incomplete details</div>
                      <div className="d-flex flex-column gap-2">
                        {profileCompletenessInfo.completionBreakdown
                          .filter((item) => !item.completed)
                          .map((item) => (
                            <div className="d-flex justify-content-between align-items-center gap-2 small" key={item.label}>
                              <span><i className="fa-solid fa-circle-exclamation text-warning me-2"></i>{item.label}</span>
                              <span className="text-danger fw-semibold">{item.points - item.earned}% available</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div className="alert alert-success mb-0">Your profile has completed the required 90% threshold.</div>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCompletionDetails(false)}>Close</button>
                </Modal.Footer>
              </Modal>

              {/* MAIN LAYOUT: TWO COLUMNS */}
              <div className="row g-4">
                
                {/* LEFT COLUMN: PERSONAL INFO CARD */}
                <div className="col-lg-6">
                  <div className="card border-0 shadow-sm rounded-4 h-100">
                    <div className="card-header bg-transparent border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <h5 className="fw-bold mb-0 text-dark">PERSONAL INFO</h5>
                        {getCompletionGroup("Personal & Identity") && (
                          <span className="badge bg-primary-subtle text-primary rounded-pill">
                            {getCompletionGroup("Personal & Identity").earned}% / 30%
                          </span>
                        )}
                      </div>
                      <button 
                        className="btn btn-link text-primary p-0 fw-semibold text-decoration-none d-flex align-items-center gap-1"
                        onClick={() => handleOpenEditSection("personal")}
                        style={{ fontSize: "14px" }}
                      >
                        <i className="fa-regular fa-edit"></i> Edit
                      </button>
                    </div>
                    
                    <div className="card-body px-4 pb-4">
                      <div className="space-y-1">
                        <div className="personal-info-row">
                          <span className="personal-info-label">Full Name as for PAN</span>
                          <span className="personal-info-value text-capitalize">{profileData.firstName} {profileData.lastName}</span>
                        </div>
                        <div className="personal-info-row">
                          <span className="personal-info-label">Date of Birth</span>
                          <span className="personal-info-value">{profileData.dob || "—"}</span>
                        </div>
                        <div className="personal-info-row">
                          <span className="personal-info-label">Gender</span>
                          <span className="personal-info-value">{profileData.gender || "—"}</span>
                        </div>
                        <div className="personal-info-row">
                          <span className="personal-info-label">Email Address</span>
                          <span className="personal-info-value">{profileData.email || "—"}</span>
                        </div>
                        <div className="personal-info-row">
                          <span className="personal-info-label">WhatsApp Number</span>
                          <span className="personal-info-value">{profileData.whatsAppNumber || "—"}</span>
                        </div>
                        <div className="personal-info-row" style={{ alignItems: "flex-start" }}>
                          <span className="personal-info-label pt-1">Address</span>
                          <span className="personal-info-value text-end" style={{ maxWidth: "280px", lineHeight: "1.4" }}>
                            {profileData.residenceAddress || "—"}
                          </span>
                        </div>
                        <div className="personal-info-row">
                          <span className="personal-info-label">Pincode</span>
                          <span className="personal-info-value d-flex align-items-center gap-1">
                            {profileData.pinCode || "—"}
                            {profileData.pinCode && validatePincode(profileData.pinCode).valid ? (
                              <span className="text-success small ms-1" title="Valid Pincode"><i className="fa-solid fa-circle-check"></i></span>
                            ) : profileData.pinCode ? (
                              <span className="badge bg-danger text-white ms-1">Invalid</span>
                            ) : null}
                          </span>
                        </div>
                        <div className="personal-info-row">
                          <span className="personal-info-label">City / State</span>
                          <span className="personal-info-value">
                            {profileData.city && profileData.state ? `${profileData.city}, ${profileData.state}` : (profileData.city || profileData.state || "—")}
                          </span>
                        </div>
                        <div className="personal-info-row">
                          <span className="personal-info-label">Mother's Name</span>
                          <span className="personal-info-value">{profileData.motherName || "—"}</span>
                        </div>
                        <div className="personal-info-row">
                          <span className="personal-info-label">Marital Status</span>
                          <span className="personal-info-value">{profileData.maritalStatus || "—"}</span>
                        </div>
                        {profileData.maritalStatus === "Married" && profileData.spouseName && (
                          <>
                            <div className="personal-info-row">
                              <span className="personal-info-label">Spouse Name</span>
                              <span className="personal-info-value">{profileData.spouseName || "—"}</span>
                            </div>
                            <div className="personal-info-row">
                              <span className="personal-info-label">Spouse DOB</span>
                              <span className="personal-info-value">{profileData.spouseDob || "—"}</span>
                            </div>
                          </>
                        )}
                        <div className="personal-info-row">
                          <span className="personal-info-label">Occupation Category</span>
                          <span className="personal-info-value" style={{ fontSize: "12px" }}>{category}</span>
                        </div>
                        {category !== "STUDENT" ? (
                          <>
                            <div className="personal-info-row">
                              <span className="personal-info-label">Experience</span>
                              <span className="personal-info-value">{profileData.workExperience ? `${profileData.workExperience} Years` : "—"}</span>
                            </div>
                            <div className="personal-info-row">
                              <span className="personal-info-label">Company Name</span>
                              <span className="personal-info-value">{profileData.companyName || "—"}</span>
                            </div>
                            <div className="personal-info-row">
                              <span className="personal-info-label">Designation</span>
                              <span className="personal-info-value">{profileData.designation || "—"}</span>
                            </div>
                            <div className="personal-info-row" style={{ alignItems: "flex-start" }}>
                              <span className="personal-info-label pt-1">Office Address</span>
                              <span className="personal-info-value text-end" style={{ maxWidth: "280px", lineHeight: "1.4" }}>
                                {profileData.officeAddress || "—"}
                              </span>
                            </div>
                            <div className="personal-info-row">
                              <span className="personal-info-label">Office Email</span>
                              <span className="personal-info-value">{profileData.officeMailId || "—"}</span>
                            </div>
                            <div className="personal-info-row">
                              <span className="personal-info-label">Office Landline</span>
                              <span className="personal-info-value">{profileData.officeLandLine || "—"}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="personal-info-row">
                              <span className="personal-info-label">University</span>
                              <span className="personal-info-value">{profileData.universityName || "—"}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: STACKED PANEL CARDS */}
                <div className="col-lg-6">
                  <div className="d-flex flex-column gap-4">

                    {/* CREDIT BUREAU SCORE & HEALTH CARD */}
                    {/* <div className="card border-0 shadow-sm rounded-4">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded p-2 d-flex align-items-center justify-content-center text-white" style={{ width: "38px", height: "38px", backgroundColor: "#059669" }}>
                              <i className="fa-solid fa-chart-line"></i>
                            </div>
                            <div>
                              <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "15px", letterSpacing: "0.5px" }}>CREDIT BUREAU REPORT</h6>
                              <span className="text-muted" style={{ fontSize: "11px" }}>Official Bureau Analysis</span>
                            </div>
                          </div>
                          {creditBureauData?.score ? (
                            <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1 rounded-pill small">
                              Verified
                            </span>
                          ) : (
                            <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1 rounded-pill small">
                              Pending
                            </span>
                          )}
                        </div>

                        {creditBureauData?.score ? (
                          <div className="p-3 bg-light rounded-3 border mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <span className="text-muted small">Bureau Score</span>
                              <div className="d-flex align-items-baseline gap-1">
                                <span className="fw-bold text-success fs-5">{creditBureauData.score}</span>
                                <span className="text-muted small">/ 900</span>
                              </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center small">
                              <span className="text-muted">Rating & Status</span>
                              <span className="fw-semibold text-dark">
                                {creditBureauData.scoreTier?.tier || "Standard"}
                                {creditBureauData.scoreTier?.badge ? ` (${creditBureauData.scoreTier.badge})` : ""}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center small mt-1">
                              <span className="text-muted">Accounts Track</span>
                              <span className="text-muted">
                                {creditBureauData.metrics?.totalAccountsCount ?? 0} reported ({creditBureauData.metrics?.activeAccountsCount ?? 0} active)
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-light rounded-3 border mb-3 text-center">
                            <p className="text-muted small mb-0">No credit report fetched yet.</p>
                          </div>
                        )}

                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm flex-fill rounded-3"
                            onClick={() => setShowCreditModal(true)}
                          >
                            <i className="fa-solid fa-arrows-rotate me-1"></i> {creditBureauData?.score ? "Refresh" : "Fetch Report"}
                          </button>
                          {creditBureauData?.score && (
                            <Link
                              to="/instant-borrower-credit-report"
                              className="btn btn-primary btn-sm flex-fill rounded-3 text-white text-decoration-none d-flex align-items-center justify-content-center"
                              style={{ backgroundColor: "#0040e0", borderColor: "#0040e0" }}
                            >
                              Full Report <i className="fa-solid fa-arrow-right ms-1"></i>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div> */}

                    {/* PAN CARD CARD */}
                    <div className="card border-0 shadow-sm rounded-4">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded bg-primary bg-opacity-10 text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: "38px", height: "38px" }}>
                              <i className="fa-solid fa-credit-card"></i>
                            </div>
                            <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "15px", letterSpacing: "0.5px" }}>PAN CARD</h6>
                          </div>
                          <button 
                            className="btn btn-link text-primary p-0 fw-semibold text-decoration-none d-flex align-items-center gap-1"
                            onClick={() => {
                              setIsPanVerified(false);
                              handleOpenEditSection("personal");
                            }}
                            style={{ fontSize: "14px" }}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> {isPanVerified ? "Edit / Re-verify" : "Verify / Edit"}
                          </button>
                        </div>
                        {isPanVerified ? (
                          <div className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                            <div>
                              <span className="text-muted d-block small">PAN Number</span>
                              <span className="fw-bold text-dark">{profileData.panNumber}</span>
                            </div>
                            <span className="text-success small fw-semibold"><i className="fa-solid fa-circle-check"></i> Verified</span>
                          </div>
                        ) : (
                          <div>
                            <div className="p-3 bg-danger bg-opacity-10 rounded-3 border border-danger border-opacity-25 mb-2 d-flex justify-content-between align-items-center">
                              <div>
                                <span className="text-muted d-block small">PAN Number</span>
                                <span className="fw-bold text-danger">{profileData.panNumber || "Not Provided"}</span>
                              </div>
                              <span className="badge bg-danger text-white">Unverified / Invalid</span>
                            </div>
                            {(!profileData.panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(profileData.panNumber)) && (
                              <p className="text-danger small mb-2">
                                <i className="fa-solid fa-circle-exclamation me-1"></i>
                                {!profileData.panNumber
                                  ? "PAN number is missing. Please edit your profile to add a valid 10-character PAN."
                                  : "Invalid PAN format (must be 10 characters: e.g. ABCDE1234F). Please edit your PAN."}
                              </p>
                            )}
                            <button
                              className="btn btn-sm btn-outline-primary mt-1 d-inline-flex align-items-center gap-1"
                              onClick={() => {
                                setIsPanVerified(false);
                                handleOpenEditSection("personal");
                              }}
                            >
                              <i className="fa-solid fa-pen-to-square"></i> Edit PAN Number
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* KYC & SECURE DOCUMENTS CARD */}
                    <div className="card border-0 shadow-sm rounded-4">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <div className="rounded p-2 d-flex align-items-center justify-content-center" style={{ width: "38px", height: "38px", backgroundColor: "#fffbeb", color: "#d97706" }}>
                              <i className="fa-solid fa-folder-open"></i>
                            </div>
                            <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "15px", letterSpacing: "0.5px" }}>KYC & DOCUMENT SECURE VAULT</h6>
                            {getCompletionGroup("KYC Documents") && (
                              <span
                                className={`badge rounded-pill ${
                                  getCompletionGroup("KYC Documents").earned >= 15
                                    ? "bg-success-subtle text-success border border-success-subtle"
                                    : getCompletionGroup("KYC Documents").earned > 0
                                    ? "bg-warning-subtle text-dark border border-warning-subtle"
                                    : "bg-light text-muted border"
                                }`}
                              >
                                {getCompletionGroup("KYC Documents").earned}% / 15%
                              </span>
                            )}
                          </div>
                          <button 
                            className="btn btn-link text-primary p-0 fw-semibold text-decoration-none d-flex align-items-center gap-1"
                            onClick={() => handleOpenEditSection("kyc")}
                            style={{ fontSize: "14px" }}
                          >
                            <i className="fa-solid fa-cloud-arrow-up me-1"></i> Upload
                          </button>
                        </div>
                        
                        <div className="row g-2 text-start">
                          <div className="col-6">
                            <span className="text-muted d-block small">Uploaded Files</span>
                            <span className="fw-bold text-dark" style={{ fontSize: "15px" }}>
                              {Object.values(kycDocs).filter((v) => isKycDocUploaded(v)).length} Files
                            </span>
                          </div>
                          <div className="col-6">
                            <span className="text-muted d-block small">OxyScore</span>
                            <span className="fw-bold text-success" style={{ fontSize: "15px" }}>{profileData.profileScore || profileData.cibilScore || "—"}</span>
                          </div>
                        </div>

                        {/* Verification Badges Section */}
                        <div className="mt-3 pt-2 border-top">
                          <div className="d-flex flex-column gap-2" style={{ fontSize: "12px" }}>
                            {/* <div className="d-flex justify-content-between align-items-center">
                              <span className="text-muted">
                                <i className="fa-solid fa-file-invoice-dollar me-1 text-primary"></i>Employer Match:
                              </span>
                              {payslipVerification?.verified ? (
                                <span className="badge bg-success-subtle text-success py-1 px-2">
                                  <i className="fa-solid fa-check me-1"></i>Verified ({payslipVerification.companyName || profileData.companyName || "Employer"})
                                </span>
                              ) : (
                                <span className="badge bg-light text-muted py-1 px-2 border">Pending Upload</span>
                              )}
                            </div> */}
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-muted">
                                <i className="fa-solid fa-building-columns me-1 text-primary"></i>Salary Inflow:
                              </span>
                              {borrowerSalaryData?.monthlyAmount > 0 ? (
                                <span className="badge bg-success-subtle text-success py-1 px-2">
                                  <i className="fa-solid fa-check me-1"></i>Verified (₹{Number(borrowerSalaryData.monthlyAmount).toLocaleString("en-IN", { maximumFractionDigits: 2 })})
                                </span>
                              ) : salaryVerification?.isMatch ? (
                                <span className="badge bg-success-subtle text-success py-1 px-2">
                                  <i className="fa-solid fa-check me-1"></i>Verified (₹{Number(salaryVerification.detectedSalary || profileData.salary || 0).toLocaleString("en-IN")})
                                </span>
                              ) : salaryVerification?.status === "VARIANCE" ? (
                                <span className="badge bg-warning-subtle text-warning py-1 px-2">
                                  Variance Review
                                </span>
                              ) : (
                                <span className="badge bg-light text-muted py-1 px-2 border">Pending Bank Statement</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* NOMINEE INFO CARD */}
                    <div className="card border-0 shadow-sm rounded-4">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <div 
                              className="rounded p-2 d-flex align-items-center justify-content-center" 
                              style={{ width: "38px", height: "38px", backgroundColor: "#f3e8ff", color: "#9333ea" }}
                            >
                              <i className="fa-solid fa-user-shield"></i>
                            </div>
                            <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "15px", letterSpacing: "0.5px" }}>NOMINEE INFO</h6>
                            {getCompletionGroup("Nominee") && (
                              <span 
                                className="badge rounded-pill"
                                style={{ 
                                  backgroundColor: getCompletionGroup("Nominee").earned > 0 ? "#f3e8ff" : "#f1f5f9", 
                                  color: getCompletionGroup("Nominee").earned > 0 ? "#7e22ce" : "#64748b" 
                                }}
                              >
                                {getCompletionGroup("Nominee").earned}% / 10%
                              </span>
                            )}
                          </div>
                          <button 
                            className="btn btn-link text-primary p-0 fw-semibold text-decoration-none d-flex align-items-center gap-1"
                            onClick={() => handleOpenEditSection("nominee")}
                            style={{ fontSize: "14px" }}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> {nominee?.nomineeName?.trim() ? "Edit" : "+ Add Nominee"}
                          </button>
                        </div>

                        {nominee?.nomineeName?.trim() ? (
                          <div className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                            <div>
                              <span className="text-muted d-block small">Nominee Details</span>
                              <div className="d-flex align-items-center gap-2 mt-1">
                                <span className="fw-bold text-dark" style={{ fontSize: "15px" }}>{nominee.nomineeName}</span>
                                {nominee.relation && (
                                  <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-0.5" style={{ fontSize: "11px" }}>
                                    {nominee.relation}
                                  </span>
                                )}
                              </div>
                              {nominee.nomineeMobile && (
                                <span className="text-muted small d-block mt-1">
                                  <i className="fa-solid fa-phone me-1 text-primary" style={{ fontSize: "11px" }}></i>
                                  {nominee.nomineeMobile}
                                </span>
                              )}
                            </div>
                            <span className="security-badge-yes flex-shrink-0">Added</span>
                          </div>
                        ) : (
                          <div className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                            <div>
                              <span className="text-muted d-block small">Nominee Status</span>
                              <span className="text-muted fst-italic small">Not Nominated</span>
                            </div>
                            <span 
                              className="security-badge-no flex-shrink-0" 
                              onClick={() => handleOpenEditSection("nominee")}
                              style={{ cursor: "pointer" }}
                            >
                              Add
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* EMERGENCY REFERENCES CARD */}
                    <div className="card border-0 shadow-sm rounded-4">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <div 
                              className="rounded p-2 d-flex align-items-center justify-content-center" 
                              style={{ width: "38px", height: "38px", backgroundColor: "#ccfbf1", color: "#0f766e" }}
                            >
                              <i className="fa-solid fa-users"></i>
                            </div>
                            <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "15px", letterSpacing: "0.5px" }}>EMERGENCY REFERENCES</h6>
                            {getCompletionGroup("Emergency References") && (
                              <span 
                                className="badge rounded-pill"
                                style={{ 
                                  backgroundColor: getCompletionGroup("Emergency References").earned > 0 ? "#ccfbf1" : "#f1f5f9", 
                                  color: getCompletionGroup("Emergency References").earned > 0 ? "#0f766e" : "#64748b" 
                                }}
                              >
                                {getCompletionGroup("Emergency References").earned}% / 15%
                              </span>
                            )}
                          </div>
                          <button 
                            className="btn btn-link text-primary p-0 fw-semibold text-decoration-none d-flex align-items-center gap-1"
                            onClick={() => handleOpenEditSection("references")}
                            style={{ fontSize: "14px" }}
                          >
                            <i className="fa-solid fa-pen-to-square"></i> {
                              referenceList.filter((r) => r.name?.trim() && r.referenceNumber?.trim()).length >= 2 
                                ? "Edit" 
                                : "Add References"
                            }
                          </button>
                        </div>

                        {(() => {
                          const validRefs = (referenceList || []).filter((r) => r?.name?.trim() && r?.referenceNumber?.trim());
                          const ref1 = validRefs[0] || null;
                          const ref2 = validRefs[1] || null;

                          return (
                            <div className="d-flex flex-column gap-2">
                              {/* Reference #1 (Primary) */}
                              <div className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                                <div className="overflow-hidden me-2">
                                  <span className="text-muted d-block small">Reference #1 (Primary)</span>
                                  {ref1 ? (
                                    <div className="mt-1">
                                      <span className="fw-bold text-dark" style={{ fontSize: "14px" }}>{ref1.name}</span>
                                      <span className="text-muted small d-block">
                                        <i className="fa-solid fa-phone me-1 text-primary" style={{ fontSize: "11px" }}></i>
                                        {ref1.referenceNumber}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-muted fst-italic small">Not Provided</span>
                                  )}
                                </div>
                                {ref1 ? (
                                  <span className="security-badge-yes flex-shrink-0">Added</span>
                                ) : (
                                  <span 
                                    className="security-badge-no flex-shrink-0" 
                                    onClick={() => handleOpenEditSection("references")} 
                                    style={{ cursor: "pointer" }}
                                  >
                                    Add
                                  </span>
                                )}
                              </div>

                              {/* Reference #2 (Secondary) */}
                              <div className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
                                <div className="overflow-hidden me-2">
                                  <span className="text-muted d-block small">Reference #2 (Secondary)</span>
                                  {ref2 ? (
                                    <div className="mt-1">
                                      <span className="fw-bold text-dark" style={{ fontSize: "14px" }}>{ref2.name}</span>
                                      <span className="text-muted small d-block">
                                        <i className="fa-solid fa-phone me-1 text-primary" style={{ fontSize: "11px" }}></i>
                                        {ref2.referenceNumber}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-muted fst-italic small">Not Provided</span>
                                  )}
                                </div>
                                {ref2 ? (
                                  <span className="security-badge-yes flex-shrink-0">Added</span>
                                ) : (
                                  <span 
                                    className="security-badge-no flex-shrink-0" 
                                    onClick={() => handleOpenEditSection("references")} 
                                    style={{ cursor: "pointer" }}
                                  >
                                    Add
                                  </span>
                                )}
                              </div>

                              {validRefs.length > 2 && (
                                <div className="text-end pt-1">
                                  <span className="text-muted small">+{validRefs.length - 2} more reference(s)</span>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* ACCOUNT SECURITY CARD */}
                    <div className="card border-0 shadow-sm rounded-4">
                      <div className="card-body p-4">
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <div className="rounded p-2 d-flex align-items-center justify-content-center" style={{ width: "38px", height: "38px", backgroundColor: "#ecfdf5", color: "#059669" }}>
                            <i className="fa-solid fa-shield-halved"></i>
                          </div>
                          <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "15px", letterSpacing: "0.5px" }}>ACCOUNT SECURITY</h6>
                        </div>

                        <div className="space-y-3">
                          <div className="d-flex justify-content-between align-items-center pb-2 border-bottom">
                            <span className="text-muted small">Email verified</span>
                            {profileData.emailVerified ? (
                              <span className="security-badge-yes">Yes</span>
                            ) : (
                              <span className="security-badge-no">No</span>
                            )}
                          </div>
                          <div className="d-flex justify-content-between align-items-center pt-2">
                            <span className="text-muted small">WhatsApp verified</span>
                            {profileData.whatsappVerified ? (
                              <span className="security-badge-yes">Yes</span>
                            ) : (
                              <span className="security-badge-no" onClick={() => setEditSection("whatsapp")} style={{ cursor: "pointer" }}>
                                Verify Now
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* EDIT MODAL DIALOGS */}
      {/* ========================================================================= */}

      {/* 1. PERSONAL DETAILS EDIT MODAL */}
      <Modal show={editSection === "personal"} onHide={() => setEditSection(null)} size="lg" centered enforceFocus={false}>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-dark h5">Edit Profile Information</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label text-muted small">Name As PAN Card <span className="text-danger">*</span></label>
              <input type="text" className="form-control rounded-3" name="firstName" value={profileData.firstName} onChange={handleprofileInput} />
            </div>
            {/* <div className="col-md-4">
              <label className="form-label text-muted small">Middle Name</label>
              <input type="text" className="form-control rounded-3" name="middleName" value={profileData.middleName} onChange={handleprofileInput} />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small">Last Name</label>
              <input type="text" className="form-control rounded-3" name="lastName" value={profileData.lastName} onChange={handleprofileInput} />
            </div> */}
            <div className="col-md-6">
              <label className="form-label text-muted small">Father's Name <span className="text-danger">*</span></label>
              <input type="text" className="form-control rounded-3" name="fatherName" value={profileData.fatherName} onChange={handleprofileInput} />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">Mother's Name <span className="text-danger">*</span></label>
              <input type="text" className="form-control rounded-3" name="motherName" value={profileData.motherName} onChange={handleprofileInput} placeholder="Enter Mother's Name" />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">Date of Birth (YYYY-MM-DD) <span className="text-danger">*</span></label>
              <input type="text" className="form-control rounded-3" name="dob" value={profileData.dob} onChange={handleprofileInput} placeholder="YYYY-MM-DD" />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">Gender <span className="text-danger">*</span></label>
              <select className="form-select rounded-3" name="gender" value={profileData.gender || ""} onChange={handleprofileInput} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">Marital Status <span className="text-danger">*</span></label>
              <select className="form-select rounded-3" name="maritalStatus" value={profileData.maritalStatus || "Single"} onChange={handleprofileInput} required>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
            {(profileData.maritalStatus || "Single") === "Married" && (
              <>
                <div className="col-md-6">
                  <label className="form-label text-muted small">Spouse Name <span className="text-danger">*</span></label>
                  <input type="text" className="form-control rounded-3" name="spouseName" value={profileData.spouseName || ""} onChange={handleprofileInput} placeholder="Enter spouse full name" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small">Spouse Date of Birth</label>
                  <input type="text" className="form-control rounded-3" name="spouseDob" value={profileData.spouseDob || ""} onChange={handleprofileInput} placeholder="DD/MM/YYYY or YYYY-MM-DD" />
                </div>
              </>
            )}
            <div className="col-md-6">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label text-muted small mb-0">PAN Card Number <span className="text-danger">*</span></label>
                {isPanVerified && (
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-primary text-decoration-none small"
                    onClick={() => setIsPanVerified(false)}
                  >
                    <i className="fa-solid fa-pen-to-square me-1"></i>Unlock to Edit
                  </button>
                )}
              </div>
              <input
                type="text"
                className={`form-control rounded-3 ${profileData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(profileData.panNumber) ? "is-invalid" : ""}`}
                name="panNumber"
                value={profileData.panNumber}
                onChange={handleprofileInput}
                maxLength={10}
                placeholder="ABCDE1234F"
                disabled={isPanVerified}
              />
              {profileData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(profileData.panNumber) ? (
                <div className="invalid-feedback d-block small mt-1">
                  <i className="fa-solid fa-circle-exclamation me-1"></i>
                  Invalid PAN format (must be 10 characters: 5 letters, 4 digits, 1 letter, e.g. ABCDE1234F).
                </div>
              ) : isPanVerified ? (
                <div className="text-success small mt-1">
                  <i className="fa-solid fa-circle-check me-1"></i>Verified PAN Card
                </div>
              ) : null}
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">Aadhaar Number</label>
              <input type="text" className="form-control rounded-3" name="aadharNumber" value={profileData.aadharNumber} onChange={handleprofileInput} />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">WhatsApp Number <span className="text-danger">*</span></label>
              <input type="text" className="form-control rounded-3" name="whatsAppNumber" value={profileData.whatsAppNumber} onChange={handleprofileInput} />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">Mobile Number <span className="text-danger">*</span></label>
              <input type="text" className="form-control rounded-3" name="mobileNumber" value={profileData.mobileNumber} onChange={handleprofileInput} />
            </div>
            <div className="col-12">
              <label className="form-label text-muted small">Residential Address <span className="text-danger">*</span></label>
              <input type="text" className="form-control rounded-3" name="residenceAddress" value={profileData.residenceAddress} onChange={handleprofileInput} />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small">Pincode <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control rounded-3 ${profileData.pinCode && !validatePincode(profileData.pinCode).valid ? "is-invalid" : ""}`}
                name="pinCode"
                value={profileData.pinCode}
                onChange={handleprofileInput}
                maxLength={6}
                placeholder="e.g. 500072"
              />
              {profileData.pinCode && !validatePincode(profileData.pinCode).valid ? (
                <div className="invalid-feedback d-block small mt-1">
                  <i className="fa-solid fa-triangle-exclamation me-1"></i>
                  {validatePincode(profileData.pinCode).message}
                </div>
              ) : profileData.pinCode && profileData.pinCode.length === 6 && validatePincode(profileData.pinCode).valid ? (
                <div className="text-success small mt-1">
                  <i className="fa-solid fa-circle-check me-1"></i>Valid Pincode
                </div>
              ) : null}
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small">City <span className="text-danger">*</span></label>
              {displayCityOptions && displayCityOptions.length > 0 ? (
                <select
                  className={`form-select rounded-3 ${profileData.city && !validateName(profileData.city, "City").valid ? "is-invalid" : ""}`}
                  name="city"
                  value={profileData.city}
                  onChange={handleprofileInput}
                >
                  <option value="">Select City</option>
                  {displayCityOptions.map((c, index) => (
                    <option key={index} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className={`form-control rounded-3 ${profileData.city && !validateName(profileData.city, "City").valid ? "is-invalid" : ""}`}
                  name="city"
                  value={profileData.city}
                  onChange={handleprofileInput}
                  placeholder="e.g. Hyderabad"
                />
              )}
              {profileData.city && !validateName(profileData.city, "City").valid && (
                <div className="invalid-feedback d-block small mt-1">
                  <i className="fa-solid fa-triangle-exclamation me-1"></i>
                  {validateName(profileData.city, "City").message}
                </div>
              )}
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small">State <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control rounded-3 ${profileData.state && !validateName(profileData.state, "State").valid ? "is-invalid" : ""}`}
                name="state"
                value={profileData.state}
                onChange={handleprofileInput}
                placeholder="e.g. Telangana"
              />
              {profileData.state && !validateName(profileData.state, "State").valid && (
                <div className="invalid-feedback d-block small mt-1">
                  <i className="fa-solid fa-triangle-exclamation me-1"></i>
                  {validateName(profileData.state, "State").message}
                </div>
              )}
            </div>
            {localityOptions && localityOptions.length > 0 && (
              <div className="col-md-4">
                <label className="form-label text-muted small">Locality</label>
                <select
                  className="form-select rounded-3"
                  name="locality"
                  value={profileData.locality}
                  onChange={handleprofileInput}
                >
                  <option value="">Select Locality</option>
                  {localityOptions.map((loc, index) => (
                    <option key={index} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <hr className="my-3 opacity-10" />
            <h6 className="fw-bold text-dark">Occupation & Category Details</h6>
            <div className="col-md-6">
              <label className="form-label text-muted small">Employment Category <span className="text-danger">*</span></label>
              <select className="form-select rounded-3" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="SALARIED">Salaried Employee</option>
                <option value="SELFEMPLOYED">Self-Employed</option>
                <option value="STUDENT">Student Profile</option>
              </select>
            </div>
            {category !== "STUDENT" ? (
              <>
                <div className="col-md-6">
                  <label className="form-label text-muted small">Work Experience (Years) <span className="text-danger">*</span></label>
                  <input type="text" className="form-control rounded-3" name="workExperience" value={profileData.workExperience} onChange={handleprofileInput} placeholder="Years of experience" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small">Company Name <span className="text-danger">*</span></label>
                  <input type="text" className="form-control rounded-3" name="companyName" value={profileData.companyName} onChange={handleprofileInput} placeholder="Enter company name" required />
                </div>
                <div className="col-md-6">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label text-muted small mb-0">Monthly Net Salary (₹) <span className="text-danger">*</span></label>
                    {borrowerSalaryData?.monthlyAmount > 0 && (
                      <span className="badge bg-success-subtle text-success py-1 px-2" style={{ fontSize: "11px" }}>
                        <i className="fa-solid fa-circle-check me-1"></i>Verified: ₹{Number(borrowerSalaryData.monthlyAmount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                  <input type="text" className="form-control rounded-3" name="salary" value={profileData.salary} onChange={handleprofileInput} placeholder="Enter monthly net salary" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small">Designation / Role <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className={`form-control rounded-3 ${profileData.designation && !validateDesignation(profileData.designation, category).valid ? "is-invalid" : ""}`}
                    name="designation"
                    value={profileData.designation}
                    onChange={handleprofileInput}
                    placeholder="Enter designation / role"
                    required
                  />
                  {profileData.designation && !validateDesignation(profileData.designation, category).valid && (
                    <div className="invalid-feedback d-block small mt-1">
                      <i className="fa-solid fa-triangle-exclamation me-1"></i>
                      {validateDesignation(profileData.designation, category).message}
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small">Official / Work Email</label>
                  <input type="email" className="form-control rounded-3" name="officeMailId" value={profileData.officeMailId} onChange={handleprofileInput} placeholder="e.g. name@company.com" />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small">Office Landline No. <span className="text-muted">(Optional)</span></label>
                  <input type="text" className="form-control rounded-3" name="officeLandLine" value={profileData.officeLandLine} onChange={handleprofileInput} placeholder="e.g. 04012345678" />
                </div>
                <div className="col-12">
                  <label className="form-label text-muted small">Office / Company Address <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className={`form-control rounded-3 ${profileData.officeAddress && !validateOfficeAddress(profileData.officeAddress, category).valid ? "is-invalid" : ""}`}
                    name="officeAddress"
                    value={profileData.officeAddress}
                    onChange={handleprofileInput}
                    placeholder="Enter office / company address"
                    required
                  />
                  {profileData.officeAddress && !validateOfficeAddress(profileData.officeAddress, category).valid && (
                    <div className="invalid-feedback d-block small mt-1">
                      <i className="fa-solid fa-triangle-exclamation me-1"></i>
                      {validateOfficeAddress(profileData.officeAddress, category).message}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="col-md-6">
                  <label className="form-label text-muted small">Target Study Country</label>
                  <input type="text" className="form-control rounded-3" name="country" value={profileData.country} onChange={handleprofileInput} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small">University Name</label>
                  <input type="text" className="form-control rounded-3" name="universityName" value={profileData.universityName} onChange={handleprofileInput} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small">University Location</label>
                  <input type="text" className="form-control rounded-3" name="location" value={profileData.location} onChange={handleprofileInput} />
                </div>
              </>
            )}
            
            <hr className="my-3 opacity-10" />
            <h6 className="fw-bold text-dark">Social Media Profiles</h6>
            <div className="col-md-4">
              <label className="form-label text-muted small">Facebook URL</label>
              <input type="text" className="form-control rounded-3" name="facebookUrl" value={profileData.facebookUrl} onChange={handleprofileInput} />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small">LinkedIn URL</label>
              <input type="text" className="form-control rounded-3" name="linkedinUrl" value={profileData.linkedinUrl} onChange={handleprofileInput} />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small">Twitter URL</label>
              <input type="text" className="form-control rounded-3" name="twitterUrl" value={profileData.twitterUrl} onChange={handleprofileInput} />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="oxy-btn-secondary" onClick={() => setEditSection(null)}>Cancel</button>
          <button className="oxy-btn-primary" onClick={savePersonalDetails} disabled={submitting}>
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* 3. NOMINEE DETAILS MODAL */}
      <Modal show={editSection === "nominee"} onHide={() => setEditSection(null)} size="lg" centered enforceFocus={false}>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-dark h5">Nominee details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label text-muted small">Nominee Name</label>
              <input type="text" className="form-control rounded-3" name="nomineeName" value={nominee.nomineeName} onChange={handleNomineeInput} maxLength={50} required />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small">Relation</label>
              <input type="text" className="form-control rounded-3" name="relation" value={nominee.relation} onChange={handleNomineeInput} maxLength={40} required />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small">Nominee Mobile</label>
              <input type="text" className="form-control rounded-3" name="nomineeMobile" value={nominee.nomineeMobile} onChange={handleNomineeInput} maxLength={10} required />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">Nominee Email</label>
              <input type="email" className="form-control rounded-3" name="nomineeEmail" value={nominee.nomineeEmail} onChange={handleNomineeInput} />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">Nominee Account No</label>
              <input type="text" className="form-control rounded-3" name="accountNo" value={nominee.accountNo} onChange={handleNomineeInput} />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small">Nominee IFSC Code</label>
              <input type="text" className="form-control rounded-3" name="nomineeIfsc" value={nominee.nomineeIfsc} onChange={handleNomineeInput} />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small">Nominee Bank Name</label>
              <input type="text" className="form-control rounded-3" name="bank" value={nominee.bank} onChange={handleNomineeInput} />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small">Nominee Bank City</label>
              <input type="text" className="form-control rounded-3" name="nomineecity" value={nominee.nomineecity} onChange={handleNomineeInput} />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="oxy-btn-secondary" onClick={() => setEditSection(null)}>Cancel</button>
          <button className="oxy-btn-primary" onClick={saveNomineeDetails} disabled={submitting}>
            {submitting ? "Saving..." : "Save Nominee Info"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* 4. REFERENCES EDIT MODAL */}
      <Modal show={editSection === "references"} onHide={() => setEditSection(null)} size="lg" centered enforceFocus={false}>
        <Modal.Header closeButton>
          <div>
            <Modal.Title className="fw-bold text-dark h5 mb-0">Emergency Reference Contacts</Modal.Title>
            <small className="text-muted">
              Any two reference contact numbers are mandatory (<span className="text-danger">*</span>).
            </small>
          </div>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <div className="alert alert-light border d-flex align-items-center gap-2 py-2 px-3 mb-4 rounded-3 text-secondary small">
            <i className="fa-solid fa-circle-info text-primary fs-6"></i>
            <span>
              Please provide at least <strong>2 valid reference contacts</strong> with their name, 10-digit mobile number, address, and landmark.
            </span>
          </div>

          <div className="d-flex flex-column gap-3">
            {referenceList.map((ref, index) => {
              const isMandatory = index < 2;
              return (
                <div key={index} className="card border rounded-3 p-3 bg-light-subtle shadow-none">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-primary rounded-pill px-2 py-1 small">
                        #{index + 1}
                      </span>
                      <strong className="text-dark">
                        Reference Contact {index + 1}
                      </strong>
                      {isMandatory ? (
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle small">
                          Mandatory Contact
                        </span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary small">
                          Additional Contact
                        </span>
                      )}
                    </div>
                    {referenceList.length > 2 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm py-0 px-2"
                        onClick={() => handleRemoveReference(index)}
                        title="Remove contact"
                      >
                        <i className="fa-solid fa-trash-can small me-1"></i> Remove
                      </button>
                    )}
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted small mb-1">
                        Contact Name {isMandatory && <span className="text-danger">*</span>}
                      </label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="Enter contact full name"
                        value={ref.name}
                        onChange={(e) => handleReferenceChange(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small mb-1">
                        Mobile Number {isMandatory && <span className="text-danger">*</span>}
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        className="form-control rounded-3"
                        placeholder="10-digit mobile number"
                        value={ref.referenceNumber}
                        onChange={(e) => handleReferenceChange(index, "referenceNumber", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="Enter house no., street, area"
                        value={ref.address}
                        onChange={(e) => handleReferenceChange(index, "address", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small mb-1">
                        Landmark
                      </label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="Enter nearby landmark (optional)"
                        value={ref.landMark}
                        onChange={(e) => handleReferenceChange(index, "landMark", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {referenceList.length < 8 && (
            <div className="mt-3 text-end">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm rounded-pill px-3"
                onClick={handleAddReference}
              >
                <i className="fa-solid fa-plus me-1"></i> Add Another Reference
              </button>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="oxy-btn-secondary" onClick={() => setEditSection(null)}>Cancel</button>
          <button className="oxy-btn-primary" onClick={saveReferenceDetails} disabled={submitting}>
            {submitting ? "Saving..." : "Save References"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* 5. KYC & PASSWORDS EDIT MODAL */}
      <Modal show={editSection === "kyc" && !kycModal.open} onHide={() => setEditSection(null)} size="xl" centered enforceFocus={false}>
        <style>{`
          @keyframes kycCardEntrance {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes kycPulseDot {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { transform: scale(1.05); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
          .kyc-pulse-dot {
            width: 8px;
            height: 8px;
            background-color: #10b981;
            border-radius: 50%;
            display: inline-block;
            animation: kycPulseDot 2s infinite;
          }
          .kyc-doc-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
            transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
          }
          .kyc-doc-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 14px 28px -6px rgba(15, 23, 42, 0.09), 0 6px 10px -4px rgba(15, 23, 42, 0.04);
            border-color: #cbd5e1;
          }
          .kyc-doc-card.card-uploaded {
            border-left: 4.5px solid #10b981 !important;
          }
          .kyc-doc-card.card-pending {
            border-left: 4.5px solid #f59e0b !important;
          }
          .kyc-badge-pending {
            background-color: #fffbeb !important;
            color: #b45309 !important;
            border: 1px solid #fde68a !important;
            font-size: 11px !important;
            font-weight: 600 !important;
            padding: 3px 8px !important;
            border-radius: 6px !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 5px !important;
          }
          .kyc-badge-uploaded {
            background-color: #ecfdf5 !important;
            color: #047857 !important;
            border: 1px solid #a7f3d0 !important;
            font-size: 11px !important;
            font-weight: 600 !important;
            padding: 3px 8px !important;
            border-radius: 6px !important;
            display: inline-flex !important;
            align-items: center !important;
            gap: 5px !important;
            cursor: pointer !important;
            max-width: 220px !important;
          }
          .kyc-badge-uploaded:hover {
            background-color: #d1fae5 !important;
            color: #065f46 !important;
          }
          .kyc-tab-btn {
            border: 1px solid #e2e8f0;
            background: #ffffff;
            color: #475569;
            padding: 7px 16px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
          .kyc-tab-btn:hover {
            background: #f1f5f9;
            color: #1e293b;
            border-color: #cbd5e1;
          }
          .kyc-tab-btn.active {
            background: linear-gradient(135deg, #0040e0 0%, #2e5bff 100%);
            color: #ffffff !important;
            border-color: #0040e0;
            box-shadow: 0 4px 12px rgba(0, 64, 224, 0.25);
          }
          .kyc-tab-btn.active .kyc-tab-badge {
            background: rgba(255, 255, 255, 0.25) !important;
            color: #ffffff !important;
          }
          .kyc-tab-badge {
            background: #f1f5f9;
            color: #64748b;
            border-radius: 999px;
            padding: 1px 7px;
            font-size: 10.5px;
            font-weight: 700;
          }
          .kyc-btn-view {
            background: #f8fafc;
            color: #334155;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 5px 12px;
            font-size: 11.5px;
            font-weight: 600;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
          }
          .kyc-btn-view:hover {
            background: #e2e8f0;
            color: #0f172a;
            transform: translateY(-1px);
          }
          .kyc-btn-upload {
            background: linear-gradient(135deg, #0040e0 0%, #2e5bff 100%);
            color: #ffffff !important;
            border: none;
            border-radius: 8px;
            padding: 5px 14px;
            font-size: 11.5px;
            font-weight: 600;
            box-shadow: 0 2px 6px rgba(0, 64, 224, 0.22);
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
          }
          .kyc-btn-upload:hover {
            background: linear-gradient(135deg, #0036bd 0%, #1a49f5 100%);
            box-shadow: 0 4px 12px rgba(0, 64, 224, 0.35);
            transform: translateY(-1px);
            color: #ffffff;
          }
          .kyc-btn-report {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 5px 12px;
            font-size: 11.5px;
            font-weight: 600;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            cursor: pointer;
          }
          .kyc-btn-report:hover {
            background: #fee2e2;
            color: #b91c1c;
            border-color: #fca5a5;
            transform: translateY(-1px);
          }
          .kyc-intel-box {
            background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 14px;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.02);
          }
          .kyc-tile {
            background: #ffffff;
            border: 1px solid #edf2f7;
            border-radius: 9px;
            padding: 8px 10px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.02);
            transition: all 0.15s ease;
          }
          .kyc-tile:hover {
            border-color: #cbd5e1;
            background: #fafafa;
          }
          .kyc-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 10px;
          }
          .kyc-card-actions {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
          }
          .kyc-tabs-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .kyc-vault-header {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }
          .kyc-vault-progress-wrapper {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          @media (max-width: 575.98px) {
            .kyc-card-header {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 12px !important;
            }
            .kyc-card-actions {
              width: 100% !important;
              display: flex !important;
              gap: 6px !important;
            }
            .kyc-card-actions > button {
              flex: 1 1 0 !important;
              justify-content: center !important;
              text-align: center !important;
              min-height: 36px !important;
              padding: 7px 10px !important;
              font-size: 11.5px !important;
            }
            .kyc-tabs-container {
              overflow-x: auto !important;
              flex-wrap: nowrap !important;
              -webkit-overflow-scrolling: touch !important;
              scrollbar-width: none !important;
              padding-bottom: 6px !important;
              margin-bottom: 12px !important;
            }
            .kyc-tabs-container::-webkit-scrollbar {
              display: none !important;
            }
            .kyc-tab-btn {
              flex-shrink: 0 !important;
              white-space: nowrap !important;
            }
            .kyc-vault-header {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 10px !important;
            }
            .kyc-vault-progress-wrapper {
              width: 100% !important;
              display: flex !important;
              justify-content: space-between !important;
              align-items: center !important;
            }
            .kyc-vault-progress-bar {
              flex: 1 !important;
              max-width: none !important;
              margin-left: 12px !important;
            }
            .kyc-badge-uploaded {
              max-width: 100% !important;
            }
            .kyc-doc-title {
              white-space: normal !important;
            }
          }
        `}</style>
        <Modal.Header closeButton className="px-3 px-sm-4 py-3 border-bottom bg-white">
          <div>
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Modal.Title className="fw-bold text-dark h5 mb-0 d-flex align-items-center gap-2">
                <i className="fa-solid fa-folder-open text-primary"></i>
                KYC Document Vault
              </Modal.Title>
            </div>
            <p className="text-muted small mb-0 mt-1" style={{ fontSize: "12px" }}>
              Upload, verify, and manage your official identity, financial intelligence, and educational records.
            </p>
          </div>
        </Modal.Header>
        <Modal.Body className="p-3 p-sm-4" style={{ maxHeight: "78vh", overflowY: "auto", backgroundColor: "#f8fafc" }}>
          {(() => {
            const allKycDocs = [
              {
                label: "PAN Card Document",
                name: "pan",
                category: "identity",
                categoryLabel: "Identity",
                value: kycDocs.PanCard,
                passwordField: "panPassword",
                downloadUrl: kycDocs.PanCard?.downloadUrl,
                icon: "fa-solid fa-id-card",
                iconBg: "#e0f2fe",
                iconColor: "#0284c7",
              },
              {
                label: "Credit Bureau Report",
                name: "CREDITREPORT",
                category: "financial",
                categoryLabel: "Credit",
                value: kycDocs.creditReport,
                passwordField: "creditReportPassword",
                downloadUrl: kycDocs.creditReport?.downloadUrl,
                icon: "fa-solid fa-chart-line",
                iconBg: "#fef3c7",
                iconColor: "#d97706",
              },
              {
                label: "Cancelled Cheque Leaf",
                name: "CHEQUELEAF",
                category: "financial",
                categoryLabel: "Banking",
                value: kycDocs.CHEQUELEAF,
                downloadUrl: kycDocs.CHEQUELEAF?.downloadUrl,
                icon: "fa-solid fa-money-check",
                iconBg: "#f3e8ff",
                iconColor: "#9333ea",
              },
              {
                label: "Bank Statement (3-6 Months)",
                name: "BANKSTATEMENT",
                category: "financial",
                categoryLabel: "Banking",
                value: kycDocs.bankStatement,
                passwordField: "bankStatementPassword",
                downloadUrl: kycDocs.bankStatement?.downloadUrl,
                icon: "fa-solid fa-building-columns",
                iconBg: "#dcfce7",
                iconColor: "#16a34a",
              },
              {
                label: "Registered Aadhaar Card",
                name: "AADHAR",
                category: "identity",
                categoryLabel: "Identity",
                value: kycDocs.aadhar,
                passwordField: "aadharPassword",
                downloadUrl: kycDocs.aadhar?.downloadUrl,
                icon: "fa-solid fa-fingerprint",
                iconBg: "#fee2e2",
                iconColor: "#dc2626",
              },
              {
                label: "Driving Licence Scan",
                name: "DRIVINGLICENCE",
                category: "identity",
                categoryLabel: "Address / ID",
                value: kycDocs.DRIVINGLICENCE,
                downloadUrl: kycDocs.DRIVINGLICENCE?.downloadUrl,
                icon: "fa-solid fa-id-badge",
                iconBg: "#e0e7ff",
                iconColor: "#4f46e5",
              },
              {
                label: "Voter Identity Card",
                name: "VOTERID",
                category: "identity",
                categoryLabel: "Identity",
                value: kycDocs.VOTERID,
                downloadUrl: kycDocs.VOTERID?.downloadUrl,
                icon: "fa-solid fa-address-card",
                iconBg: "#ccfbf1",
                iconColor: "#0d9488",
              },
              {
                label: "Official Passport Page",
                name: "PASSPORT",
                category: "identity",
                categoryLabel: "Passport",
                value: kycDocs.Passport,
                downloadUrl: kycDocs.Passport?.downloadUrl,
                icon: "fa-solid fa-passport",
                iconBg: "#ffedd5",
                iconColor: "#ea580c",
              },
              {
                label: "Current Payslip",
                name: "PAYSLIPS",
                category: "financial",
                categoryLabel: "Income",
                value: kycDocs.paySlips,
                passwordField: "payslipsPassword",
                downloadUrl: kycDocs.paySlips?.downloadUrl,
                icon: "fa-solid fa-file-invoice-dollar",
                iconBg: "#ecfdf5",
                iconColor: "#059669",
              },

              ...(category === "STUDENT"
                ? [
                    {
                      label: "Intermediate Marksheet",
                      name: "INTER",
                      category: "academic",
                      categoryLabel: "Academic",
                      value: kycDocs.inter,
                      downloadUrl: kycDocs.inter?.downloadUrl,
                      icon: "fa-solid fa-graduation-cap",
                      iconBg: "#f0fdf4",
                      iconColor: "#16a34a",
                    },
                    {
                      label: "10th Grade Marksheet",
                      name: "TENTH",
                      category: "academic",
                      categoryLabel: "Academic",
                      value: kycDocs.tenth,
                      downloadUrl: kycDocs.tenth?.downloadUrl,
                      icon: "fa-solid fa-book-open",
                      iconBg: "#fef9c3",
                      iconColor: "#ca8a04",
                    },
                    {
                      label: "Graduation Marksheet",
                      name: "GRADUATION",
                      category: "academic",
                      categoryLabel: "Academic",
                      value: kycDocs.graduation,
                      downloadUrl: kycDocs.graduation?.downloadUrl,
                      icon: "fa-solid fa-user-graduate",
                      iconBg: "#ede9fe",
                      iconColor: "#7c3aed",
                    },
                    {
                      label: "Offer Letter",
                      name: "UNIVERSITYOFFERLETTER",
                      category: "academic",
                      categoryLabel: "Academic",
                      value: kycDocs.universityOfferLetter,
                      downloadUrl: kycDocs.universityOfferLetter?.downloadUrl,
                      icon: "fa-solid fa-envelope-open-text",
                      iconBg: "#e0f2fe",
                      iconColor: "#0284c7",
                    },
                    {
                      label: "Fee Receipt",
                      name: "FEE",
                      category: "academic",
                      categoryLabel: "Academic",
                      value: kycDocs.feeReceipt,
                      downloadUrl: kycDocs.feeReceipt?.downloadUrl,
                      icon: "fa-solid fa-receipt",
                      iconBg: "#fae8ff",
                      iconColor: "#c026d3",
                    },
                  ]
                : []),
            ];

            const isDocUploaded = (d) => {
              if (d.downloadUrl != null) return true;
              if (d.name === "PAYSLIPS" && (d.value?.payslipAnalysisId || d.value?.fileName || d.value?.netSalary || payslipVerification)) {
                return true;
              }
              return false;
            };

            const totalDocsCount = allKycDocs.length;
            const uploadedDocsCount = allKycDocs.filter(isDocUploaded).length;
            const completionPercent = totalDocsCount > 0 ? Math.round((uploadedDocsCount / totalDocsCount) * 100) : 0;

            const tabs = [
              { id: "all", label: "All Documents", count: allKycDocs.length, icon: "fa-solid fa-layer-group" },
              { id: "identity", label: "Identity & Address", count: allKycDocs.filter((d) => d.category === "identity").length, icon: "fa-solid fa-id-card" },
              { id: "financial", label: "Income & Banking", count: allKycDocs.filter((d) => d.category === "financial").length, icon: "fa-solid fa-wallet" },
              ...(category === "STUDENT"
                ? [{ id: "academic", label: "Academic Records", count: allKycDocs.filter((d) => d.category === "academic").length, icon: "fa-solid fa-graduation-cap" }]
                : []),
            ];

            const filteredDocs = kycActiveTab === "all" ? allKycDocs : allKycDocs.filter((d) => d.category === kycActiveTab);

            const renderDocItem = (doc, idx) => {
              const isUploaded = isDocUploaded(doc);

              return (
                <div
                  key={doc.name}
                  className={`kyc-doc-card p-3.5 ${isUploaded ? "card-uploaded" : "card-pending"}`}
                  style={{
                    animation: "kycCardEntrance 0.35s ease-out backwards",
                    animationDelay: `${idx * 0.05}s`,
                  }}
                >
                  {/* Top Header Row */}
                  <div className="kyc-card-header">
                    <div className="d-flex align-items-center gap-2.5" style={{ minWidth: 0, flex: 1 }}>
                      {/* 3D Squircle Icon Tile */}
                      <div
                        className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                        style={{
                          width: "42px",
                          height: "42px",
                          backgroundColor: doc.iconBg || "#f1f5f9",
                          color: doc.iconColor || "#475569",
                          fontSize: "17px",
                          boxShadow: `0 3px 8px ${doc.iconBg || "#f1f5f9"}`,
                        }}
                      >
                        <i className={doc.icon || "fa-solid fa-file-lines"}></i>
                      </div>

                      {/* Title & Badge */}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div className="d-flex align-items-center gap-1.5 flex-wrap">
                          <span className="fw-bold text-dark kyc-doc-title" style={{ fontSize: "13.5px" }} title={doc.label}>
                            {doc.label}
                          </span>
                          <span className="badge bg-light text-muted border py-0 px-1.5" style={{ fontSize: "9.5px", fontWeight: 500 }}>
                            {doc.categoryLabel || "Doc"}
                          </span>
                        </div>

                        {isUploaded ? (
                          <div className="mt-1 d-flex align-items-center gap-1.5">
                            <span
                              onClick={() => viewKYCFile(doc.downloadUrl, doc.label, doc.name, doc.value?.fileName)}
                              className="kyc-badge-uploaded text-truncate"
                              title={doc.value?.fileName || "Uploaded (Click to preview document)"}
                            >
                              <span className="kyc-pulse-dot flex-shrink-0"></span>
                              <span className="text-truncate">{doc.value?.fileName || "Uploaded"}</span>
                            </span>
                          </div>
                        ) : (
                          <div className="mt-1">
                            <span className="kyc-badge-pending">
                              <i className="fa-regular fa-clock" style={{ fontSize: "11px", color: "#d97706" }}></i>
                              Upload Required
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="kyc-card-actions">
                      {doc.name === "BANKSTATEMENT" && (borrowerSalaryData || bankAnalysisData) && (
                        <button
                          type="button"
                          className="kyc-btn-report"
                          onClick={handleDownloadBankReportPdf}
                          disabled={downloadingBankReport}
                          title="Download Statement Analysis PDF Report"
                        >
                          {downloadingBankReport ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                          ) : (
                            <i className="fa-solid fa-file-pdf"></i>
                          )}
                          <span>Report</span>
                        </button>
                      )}

                      {isUploaded && (
                        <button
                          type="button"
                          className="kyc-btn-view"
                          onClick={() => viewKYCFile(doc.downloadUrl, doc.label, doc.name, doc.value?.fileName)}
                          title="Preview Document"
                        >
                          <i className="fa-solid fa-eye"></i>
                          <span>View</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="kyc-btn-upload"
                        onClick={() => openKYCModal(doc.name, "upload")}
                        title={isUploaded ? "Re-upload this document" : "Upload this document"}
                      >
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        <span>{isUploaded ? "Re-upload" : "Upload"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Bank Statement Financial Intelligence Widget */}
                  {doc.name === "BANKSTATEMENT" && (
                    <div className="mt-3 pt-2.5 border-top">
                      {borrowerSalaryData ? (
                        <div className="kyc-intel-box">
                          {/* Top Header: Badge + Monthly Amount */}
                          <div className="d-flex align-items-center justify-content-between pb-2 mb-2.5 border-bottom">
                            <div className="d-flex align-items-center gap-1.5">
                              <div
                                className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                                style={{ width: "24px", height: "24px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "#fff", fontSize: "11px" }}
                              >
                                <i className="fa-solid fa-check"></i>
                              </div>
                              <div>
                                <span className="fw-bold text-dark d-block" style={{ fontSize: "11.5px" }}>AI Salary Verified</span>
                                <span className="text-muted" style={{ fontSize: "9.5px" }}>Bank Statement Analysis</span>
                              </div>
                            </div>
                            {borrowerSalaryData.monthlyAmount != null && (
                              <div className="text-end">
                                <span className="text-muted d-block" style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>Monthly Salary</span>
                                <span className="fw-bold text-success" style={{ fontSize: "16px", lineHeight: 1 }}>
                                  ₹ {Number(borrowerSalaryData.monthlyAmount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Metric Tiles Grid */}
                          <div className="row g-2 mb-2">
                            {borrowerSalaryData.bankName && (
                              <div className="col-sm-6">
                                <div className="kyc-tile">
                                  <span className="text-muted d-block" style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.4px", fontWeight: 600 }}>Bank & Account</span>
                                  <span className="fw-semibold text-dark text-truncate d-flex align-items-center gap-1.5 mt-0.5" style={{ fontSize: "11.5px" }} title={`${borrowerSalaryData.bankName} ${borrowerSalaryData.accountNumberMasked || ""}`}>
                                    <i className="fa-solid fa-building-columns text-primary" style={{ fontSize: "11px" }}></i>
                                    <span className="text-truncate">{borrowerSalaryData.bankName} {borrowerSalaryData.accountNumberMasked || ""}</span>
                                  </span>
                                </div>
                              </div>
                            )}
                            {borrowerSalaryData.periodStart && borrowerSalaryData.periodEnd && (
                              <div className="col-sm-6">
                                <div className="kyc-tile">
                                  <span className="text-muted d-block" style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.4px", fontWeight: 600 }}>Statement Period</span>
                                  <span className="fw-semibold text-secondary d-flex align-items-center gap-1.5 mt-0.5" style={{ fontSize: "11.5px" }}>
                                    <i className="fa-regular fa-calendar text-primary" style={{ fontSize: "11px" }}></i>
                                    <span>{borrowerSalaryData.periodStart} – {borrowerSalaryData.periodEnd}</span>
                                  </span>
                                </div>
                              </div>
                            )}
                            {borrowerSalaryData.employer && (
                              <div className="col-12">
                                <div className="kyc-tile">
                                  <span className="text-muted d-block" style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.4px", fontWeight: 600 }}>Employer / Narration</span>
                                  <span className="fw-semibold text-dark text-truncate d-flex align-items-center gap-1.5 mt-0.5" style={{ fontSize: "11.5px" }} title={borrowerSalaryData.employer}>
                                    <i className="fa-solid fa-briefcase text-info" style={{ fontSize: "11px" }}></i>
                                    <span className="text-truncate">{borrowerSalaryData.employer}</span>
                                  </span>
                                </div>
                              </div>
                            )}
                            {(bankAnalysisData?.averageMonthlyBalance != null || bankAnalysisData?.avgMonthlyBalance != null) && (
                              <div className="col-sm-6">
                                <div className="kyc-tile">
                                  <span className="text-muted d-block" style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.4px", fontWeight: 600 }}>Avg Monthly Balance</span>
                                  <span className="fw-bold text-dark d-block mt-0.5" style={{ fontSize: "11.5px" }}>
                                    ₹ {Number(bankAnalysisData.averageMonthlyBalance || bankAnalysisData.avgMonthlyBalance || 0).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Salary Credit Monthly Trends */}
                          {borrowerSalaryData.salaryTrend && (
                            <div className="pt-2 mt-2 border-top">
                              <div className="d-flex align-items-center justify-content-between mb-1.5">
                                <span className="text-muted small fw-semibold" style={{ fontSize: "10.5px" }}>
                                  <i className="fa-solid fa-arrow-trend-up text-success me-1"></i> Salary Credits Detected:
                                </span>
                                <span className="badge bg-white text-secondary border px-2 py-0.5 shadow-xs" style={{ fontSize: "9.5px", fontWeight: 600 }}>
                                  {typeof borrowerSalaryData.salaryTrend === "string"
                                    ? borrowerSalaryData.salaryTrend
                                    : Array.isArray(borrowerSalaryData.salaryTrend)
                                    ? `${borrowerSalaryData.salaryTrend.length} Months Tracked`
                                    : "Verified"}
                                </span>
                              </div>
                              {Array.isArray(borrowerSalaryData.salaryTrend) && borrowerSalaryData.salaryTrend.length > 0 && (
                                <div className="d-flex flex-wrap gap-1.5">
                                  {borrowerSalaryData.salaryTrend.map((item, index) => (
                                    <div
                                      key={index}
                                      className="badge bg-white text-dark border py-1 px-2 d-inline-flex align-items-center gap-1.5 shadow-xs"
                                      style={{ fontSize: "10.5px", fontWeight: "normal", borderRadius: "7px" }}
                                    >
                                      <span className="text-muted">{typeof item === "object" ? item.month || item.date || `M${index + 1}` : `M${index + 1}`}:</span>
                                      <span className="fw-bold text-success">
                                        ₹{Number(typeof item === "object" ? item.amount || 0 : item || 0).toLocaleString("en-IN")}
                                      </span>
                                      <i className="fa-solid fa-circle-check text-success" style={{ fontSize: "9px" }}></i>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : bankAnalysisData ? (
                        <div className="kyc-intel-box">
                          <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
                            <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 fw-semibold d-inline-flex align-items-center gap-1" style={{ fontSize: "11px" }}>
                              <i className="fa-solid fa-circle-check"></i>
                              {bankAnalysisData.status || bankAnalysisData.analysisStatus || "Analysis Completed"}
                            </span>
                            {bankAnalysisData.riskRating && (
                              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 fw-semibold" style={{ fontSize: "11px" }}>
                                Risk Rating: {bankAnalysisData.riskRating}
                              </span>
                            )}
                          </div>
                          <div className="row g-2" style={{ fontSize: "11.5px" }}>
                            {(bankAnalysisData.averageMonthlyBalance != null || bankAnalysisData.avgMonthlyBalance != null) && (
                              <div className="col-sm-6">
                                <div className="kyc-tile">
                                  <span className="text-muted d-block" style={{ fontSize: "9.5px", textTransform: "uppercase", fontWeight: 600 }}>Avg Monthly Bal</span>
                                  <span className="fw-bold text-dark d-block mt-0.5">
                                    ₹ {Number(bankAnalysisData.averageMonthlyBalance || bankAnalysisData.avgMonthlyBalance || 0).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              </div>
                            )}
                            {(bankAnalysisData.totalTurnover != null || bankAnalysisData.turnover != null) && (
                              <div className="col-sm-6">
                                <div className="kyc-tile">
                                  <span className="text-muted d-block" style={{ fontSize: "9.5px", textTransform: "uppercase", fontWeight: 600 }}>Total Turnover</span>
                                  <span className="fw-bold text-dark d-block mt-0.5">
                                    ₹ {Number(bankAnalysisData.totalTurnover || bankAnalysisData.turnover || 0).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Current Payslip Intelligence Widget */}
                  {doc.name === "PAYSLIPS" && payslipVerification && (
                    <div className="mt-3 pt-2.5 border-top">
                      <div className="kyc-intel-box">
                        <div className="d-flex align-items-center justify-content-between pb-2 mb-2.5 border-bottom">
                          <div className="d-flex align-items-center gap-1.5">
                            <div
                              className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                              style={{ width: "24px", height: "24px", background: payslipVerification.verified ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "linear-gradient(135deg, #0040e0 0%, #2e5bff 100%)", color: "#fff", fontSize: "11px" }}
                            >
                              <i className="fa-solid fa-check"></i>
                            </div>
                            <div>
                              <span className="fw-bold text-dark d-block" style={{ fontSize: "11.5px" }}>
                                {payslipVerification.verified ? "Payslip Verified" : "Payslip Analyzed"}
                              </span>
                              <span className="text-muted" style={{ fontSize: "9.5px" }}>Cross-referenced with Profile</span>
                            </div>
                          </div>
                          {payslipVerification.detectedSalary != null && (
                            <div className="text-end">
                              <span className="text-muted d-block" style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>Detected Net Pay</span>
                              <span className="fw-bold text-success" style={{ fontSize: "16px", lineHeight: 1 }}>
                                ₹ {Number(typeof payslipVerification.detectedSalary === "object" ? payslipVerification.detectedSalary?.amount || 0 : payslipVerification.detectedSalary).toLocaleString("en-IN")}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="row g-2" style={{ fontSize: "11.5px" }}>
                          {payslipVerification.grossSalary != null && payslipVerification.totalDeductions != null && (
                            <div className="col-12">
                              <div className="d-flex align-items-center justify-content-between p-2 rounded" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                                <div className="text-start">
                                  <span className="text-muted d-block" style={{ fontSize: "9px", textTransform: "uppercase", fontWeight: 600 }}>Gross Pay</span>
                                  <span className="fw-semibold text-dark">₹{Number(payslipVerification.grossSalary).toLocaleString("en-IN")}</span>
                                </div>
                                <div className="text-center">
                                  <span className="text-muted d-block" style={{ fontSize: "9px", textTransform: "uppercase", fontWeight: 600 }}>Total Deductions</span>
                                  <span className="fw-semibold text-danger">- ₹{Number(payslipVerification.totalDeductions).toLocaleString("en-IN")}</span>
                                </div>
                                <div className="text-end">
                                  <span className="text-muted d-block" style={{ fontSize: "9px", textTransform: "uppercase", fontWeight: 600 }}>Net Pay</span>
                                  <span className="fw-bold text-success">₹{Number(payslipVerification.netSalary || payslipVerification.detectedSalary).toLocaleString("en-IN")}</span>
                                </div>
                              </div>
                            </div>
                          )}
                          {payslipVerification.detectedDate && (
                            <div className="col-sm-6">
                              <div className="kyc-tile">
                                <span className="text-muted d-block" style={{ fontSize: "9.5px", textTransform: "uppercase", fontWeight: 600 }}>Pay Period</span>
                                <span className="fw-semibold text-secondary d-flex align-items-center gap-1.5 mt-0.5">
                                  <i className="fa-regular fa-calendar text-primary" style={{ fontSize: "11px" }}></i>
                                  <span>
                                    {typeof payslipVerification.detectedDate === "string"
                                      ? payslipVerification.detectedDate
                                      : payslipVerification.detectedDate?.month
                                      ? `${payslipVerification.detectedDate.month}`
                                      : String(payslipVerification.detectedDate)}
                                  </span>
                                </span>
                              </div>
                            </div>
                          )}
                          {payslipVerification.detectedName && (
                            <div className="col-sm-6">
                              <div className="kyc-tile">
                                <span className="text-muted d-block" style={{ fontSize: "9.5px", textTransform: "uppercase", fontWeight: 600 }}>Employee Name</span>
                                <span className="fw-semibold text-dark text-truncate d-flex align-items-center gap-1.5 mt-0.5" title={typeof payslipVerification.detectedName === "string" ? payslipVerification.detectedName : ""}>
                                  <i className="fa-solid fa-user-check text-success" style={{ fontSize: "11px" }}></i>
                                  <span className="text-truncate">{typeof payslipVerification.detectedName === "string" ? payslipVerification.detectedName : ""}</span>
                                </span>
                              </div>
                            </div>
                          )}
                          {payslipVerification.companyName && (
                            <div className="col-12">
                              <div className="kyc-tile">
                                <span className="text-muted d-block" style={{ fontSize: "9.5px", textTransform: "uppercase", fontWeight: 600 }}>Employer Name</span>
                                <span className="fw-semibold text-dark text-truncate d-flex align-items-center gap-1.5 mt-0.5" title={typeof payslipVerification.companyName === "string" ? payslipVerification.companyName : ""}>
                                  <i className="fa-solid fa-building text-primary" style={{ fontSize: "11px" }}></i>
                                  <span className="text-truncate">{typeof payslipVerification.companyName === "string" ? payslipVerification.companyName : ""}</span>
                                  {payslipVerification.companyMatch && <i className="fa-solid fa-circle-check text-success ms-1"></i>}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            };

            return (
              <div>
                {/* Vault Completeness Bar */}
                <div className="p-2.5 p-sm-3 mb-3 rounded-3" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)", border: "1px solid #dbeafe" }}>
                  <div className="kyc-vault-header">
                    <div className="d-flex align-items-center gap-2.5">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                        style={{ width: "38px", height: "38px", background: "linear-gradient(135deg, #0040e0 0%, #2e5bff 100%)", color: "#fff", boxShadow: "0 4px 10px rgba(0, 64, 224, 0.25)" }}
                      >
                        <i className="fa-solid fa-shield-halved" style={{ fontSize: "16px" }}></i>
                      </div>
                      <div>
                        <div className="d-flex align-items-center gap-2 flex-wrap">
                          <span className="fw-bold text-dark" style={{ fontSize: "13.5px" }}>Vault Completeness</span>
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5 fw-semibold" style={{ fontSize: "10px" }}>
                            <span className="kyc-pulse-dot me-1"></span> {completionPercent === 100 ? "All Verified" : "Encrypted Vault"}
                          </span>
                        </div>
                        <p className="text-muted small mb-0 mt-0.5" style={{ fontSize: "11px" }}>
                          {uploadedDocsCount} of {totalDocsCount} documents uploaded &middot; {totalDocsCount - uploadedDocsCount} pending
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar & Badges */}
                    <div className="kyc-vault-progress-wrapper">
                      <div className="text-end">
                        <span className="fw-bold text-dark d-block" style={{ fontSize: "13.5px", lineHeight: 1 }}>{completionPercent}%</span>
                        <span className="text-muted" style={{ fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>Completed</span>
                      </div>
                      <div className="kyc-vault-progress-bar" style={{ width: "130px", height: "10px", backgroundColor: "#e2e8f0", borderRadius: "999px", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${completionPercent}%`,
                            height: "100%",
                            background: completionPercent === 100 ? "linear-gradient(90deg, #10b981, #059669)" : "linear-gradient(90deg, #0040e0, #2e5bff)",
                            borderRadius: "999px",
                            transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Tabs with animated pills */}
                <div className="kyc-tabs-container mb-3 pb-2 border-bottom">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={`kyc-tab-btn ${kycActiveTab === tab.id ? "active" : ""}`}
                      onClick={() => setKycActiveTab(tab.id)}
                    >
                      <i className={tab.icon}></i>
                      <span>{tab.label}</span>
                      <span className="kyc-tab-badge">{tab.count}</span>
                    </button>
                  ))}
                </div>

                {/* Document Cards Grid */}
                {filteredDocs.length === 0 ? (
                  <div className="text-center py-5 bg-white rounded-3 border">
                    <i className="fa-solid fa-folder-open text-muted mb-2" style={{ fontSize: "32px" }}></i>
                    <p className="text-muted mb-0 small">No documents in this category.</p>
                  </div>
                ) : (
                  <div className="row g-3">
                    <div className="col-lg-6 col-12 d-flex flex-column gap-3">
                      {filteredDocs.filter((_, idx) => idx % 2 === 0).map((doc, idx) => renderDocItem(doc, idx * 2))}
                    </div>
                    <div className="col-lg-6 col-12 d-flex flex-column gap-3">
                      {filteredDocs.filter((_, idx) => idx % 2 === 1).map((doc, idx) => renderDocItem(doc, idx * 2 + 1))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </Modal.Body>
        <Modal.Footer className="border-top px-3 px-sm-4 py-2.5 py-sm-3 bg-white d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
          <div className="d-flex align-items-center gap-2 text-muted small text-center text-sm-start" style={{ fontSize: "11.5px" }}>
            <i className="fa-solid fa-shield-halved text-success"></i>
            <span>All documents are encrypted, watermark-protected, and securely archived.</span>
          </div>
          <button type="button" className="btn btn-secondary px-4 fw-semibold w-100 w-sm-auto" onClick={() => setEditSection(null)}>
            Close
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={pdfPasswordModal.open} onHide={handlePdfPasswordModalClose} centered enforceFocus={false}>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-dark h5">{pdfPasswordModal.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p className="text-muted small mb-3">{pdfPasswordModal.text}</p>

          <div className="p-3 bg-light rounded-3 border mb-3">
            <label className="fw-semibold small d-block mb-2 text-dark">
              Does this file contain a password? <span className="text-danger">*</span>
            </label>
            <div className="d-flex align-items-center gap-4 mb-2">
              <div className="form-check form-check-inline d-flex align-items-center gap-2 mb-0" style={{ cursor: "pointer" }}>
                <input
                  className="form-check-input"
                  type="radio"
                  name="pdfModalHasPassword"
                  id="pdfModalHasPasswordYes"
                  value="yes"
                  checked={pdfPasswordModal.hasPasswordChoice === "yes"}
                  onChange={() => setPdfPasswordModal((prev) => ({ ...prev, hasPasswordChoice: "yes", error: "" }))}
                  style={{ cursor: "pointer", width: "16px", height: "16px" }}
                />
                <label className="form-check-label small fw-semibold text-dark mb-0" htmlFor="pdfModalHasPasswordYes" style={{ cursor: "pointer" }}>
                  Yes, file is password-protected
                </label>
              </div>
              <div className="form-check form-check-inline d-flex align-items-center gap-2 mb-0" style={{ cursor: "pointer" }}>
                <input
                  className="form-check-input"
                  type="radio"
                  name="pdfModalHasPassword"
                  id="pdfModalHasPasswordNo"
                  value="no"
                  checked={pdfPasswordModal.hasPasswordChoice === "no"}
                  onChange={() => setPdfPasswordModal((prev) => ({ ...prev, hasPasswordChoice: "no", password: "", error: "" }))}
                  style={{ cursor: "pointer", width: "16px", height: "16px" }}
                />
                <label className="form-check-label small fw-semibold text-dark mb-0" htmlFor="pdfModalHasPasswordNo" style={{ cursor: "pointer" }}>
                  No, unencrypted file
                </label>
              </div>
            </div>

            {pdfPasswordModal.hasPasswordChoice === "yes" && (
              <div className="mt-3">
                <label className="small text-muted mb-1 d-block">
                  Enter File Password <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    type={pdfPasswordModal.showPassword ? "text" : "password"}
                    className="form-control rounded-start-3"
                    placeholder={pdfPasswordModal.placeholder || "Enter file password (letters, numbers, symbols)"}
                    value={pdfPasswordModal.password}
                    onChange={handlePdfPasswordModalChange}
                    autoFocus
                    autoComplete="off"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handlePdfPasswordModalSubmit();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setPdfPasswordModal((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
                    title={pdfPasswordModal.showPassword ? "Hide password" : "Show password"}
                  >
                    <i className={`fa-solid ${pdfPasswordModal.showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                  </button>
                </div>
              </div>
            )}

            {pdfPasswordModal.error && (
              <div className="text-danger small mt-2 d-flex align-items-center gap-1 fw-medium">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{pdfPasswordModal.error}</span>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="oxy-btn-secondary" onClick={handlePdfPasswordModalClose}>
            {pdfPasswordModal.cancelText}
          </button>
          <button className="oxy-btn-primary" onClick={handlePdfPasswordModalSubmit}>
            {pdfPasswordModal.confirmText}
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={editSection === "whatsapp"} onHide={() => setEditSection(null)} centered enforceFocus={false}>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-dark h5">Verify WhatsApp Number</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p className="text-muted small mb-2">To verify your WhatsApp number, please click the button below to receive a verification code on your registered WhatsApp.</p>
          <PhoneInput
            className="phoneinputfiled form-control"
            value={whatsappVal}
            onChange={setWhatsappVal}
            defaultCountry="IN"
            maxLength={15}
          />
          {!whatsappSubmitted && (
          <Button type="primary" className="mt-4 mb-3" onClick={handleSendWhatsappOtp} disabled={submitting}>
            {submitting ? "Sending..." : "Send Verification Code"}
          </Button>
          )}
          {whatsappSubmitted && (
            <p className="text-success small mb-2">A verification code has been sent to your WhatsApp. Please enter it below.</p>
          )}
          {whatsappSubmitted && (
            <>
            <input type="text" className="form-control mb-3" placeholder="Enter 6-digit code" value={whatsappOtp} onChange={(e) => setWhatsappOtp(e.target.value)} />
          <Button type="primary"  onClick={handleVerifyWhatsappOtp} disabled={submitting}>
            {submitting ? "Verifying..." : "Verify Code"}
          </Button>
          {}
          <Button type="secondary" className="ms-2" onClick={handleSendWhatsappOtp} disabled={submitting}>
            {submitting ? "Resending..." : "Resend Code"}
          </Button>
          </>
            )}
        </Modal.Body>
        <Modal.Footer>
          <button className="oxy-btn-secondary" onClick={() => setEditSection(null)}>Close</button>
        </Modal.Footer>
      </Modal>
 
      {/* 6. Production-Grade KYC Document Viewer & Manager Modal */}
      <KYCModal
        isOpen={kycModal.open}
        onClose={closeKYCModal}
        mode={kycModal.mode}
        documentType={kycModal.documentType}
        fileUrl={kycModal.fileUrl}
        fileName={kycModal.fileName}
        title={kycModal.title}
        companyName={profileData.companyName}
        declaredSalary={profileData.salary}
        onUploadFile={handleModalUploadFile}
        isUploading={modalUploading}
      />

      {/* 7. Official Credit Bureau Instant Fetch & Review Modal */}
      <CreditScoreModal
        show={showCreditModal}
        onHide={() => setShowCreditModal(false)}
        onSuccess={(res) => {
          setCreditBureauData(parseCreditReportData(res));
          fetchKycFiles();
        }}
        initialData={profileData}
      />

    </div>
  );
};

export default Profile;
