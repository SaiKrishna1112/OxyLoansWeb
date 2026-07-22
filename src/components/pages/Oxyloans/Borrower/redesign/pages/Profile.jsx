import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Modal from "react-bootstrap/Modal";
import PhoneInput from "react-phone-number-input";

import BorrowerHeader from "../../../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../../../SideBar/BorrowerSidebar";
import Footer from "../../../../../Footer/Footer";

import {
  base_url,
  profileupadate,
  setLatLong,
  loadlendernomineeDetails,
  savenomineeDeatailsApi,
  saveBorrowerReferenceDetails,
  uploadkyc,
  getuploadCredit,
  getBorrowerSecureInfo,
  borrowerSecureInfo,
  sendWhatsappOtpapi,
  verifyWhatsappOtpapi,
  updatebankDetails,
  sendMoblieOtp,
  verifyBankAccountAndIfsc,
  getUserDetails,
  getPanDoc,
  getdataPassport,
  getdatachequeLeaf,
  getdataDrivingLicence,
  getdataVoterId,
  getdataAadhar,
  getdataBankStatement,
  getdatatenth,
  getdataintermediate,
  getdatagraduation,
  getdataofferletter,
  getdatafeereceipt,
  getdatapayslips,
  getPCreditReportDoc,
} from "../../../../../HttpRequest/afterlogin";

import LoadingState from "../components/LoadingState";
import "../redesign.css";
import { Button } from "antd";

const Profile = () => {
  const navigate = useNavigate();

  // Loading States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State: null | "personal" | "bank" | "nominee" | "kyc" | "references" | "pan"
  const [editSection, setEditSection] = useState(null);

  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    fatherName: "",
    dob: "",
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

  // Bank Account State
  const [bankaccount, setBankaccount] = useState({
    accountNumber: "",
    confirmAccountNumber: "",
    bankAddress: "",
    bankName: "",
    branchName: "",
    ifscCode: "",
    nameAtBank: "",
    bankCity: "",
    moblieNumber: "",
    mobileOtp: "",
    mobileOtpSession: "",
  });

  const [verifiedBankAccount, setVerifiedBankAccount] = useState({
    accountNumber: "",
    confirmAccountNumber: "",
    bankAddress: "",
    bankName: "",
    branchName: "",
    ifscCode: "",
    nameAtBank: "",
    bankCity: "",
    moblieNumber: "",
  });

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

  // Reference Details State (1 to 8)
  const [references, setReferences] = useState({
    reference1: "",
    reference2: "",
    reference3: "",
    reference4: "",
    reference5: "",
    reference6: "",
    reference7: "",
    reference8: "",
  });

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
    intermediate: null,
    graduation: null,
    offerletter: null,
    feereceipt: null,
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

  useEffect(() => {
    document.body.classList.add("oxy-redesign-active");
    loadAllProfileData();
    return () => {
      document.body.classList.remove("oxy-redesign-active");
    };
  }, []);

  const loadAllProfileData = async () => {
    setLoading(true);
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
          dob: d.dob || "",
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
          facebookUrl: d.urlsDto?.faceBookUrl || "",
          linkedinUrl: d.urlsDto?.linkdinUrl || "",
          twitterUrl: d.urlsDto?.twitterUrl || "",
          kycStatus: d.kycStatus || false,
          bankDetailsInfo: d.bankDetailsInfo || false,
          esignedStatus: d.esignedStatus || false,
          enachStatus: d.enachStatus || false,
          profileScore: d.profileScore || 0,
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

        // Set Bank Details
        const bankInfo = {
          accountNumber: d.accountNumber || "",
          confirmAccountNumber: d.accountNumber || "",
          bankAddress: d.bankAddress || "",
          bankName: d.bankName || "",
          branchName: d.branchName || "",
          ifscCode: d.ifscCode || "",
          nameAtBank: d.userName || "",
          bankCity: d.bankAddress || "",
          moblieNumber: d.mobileNumber || "",
        };
        setBankaccount(bankInfo);
        setVerifiedBankAccount(bankInfo);

        // Set PAN Verified status initially
        if (d.panVerified) {
          setIsPanVerified(true);
          setPanVerificationStatus("PAN card verified successfully!");
        }

        // Set references
        if (d.referenceDetailsResponseDto) {
          const rDto = d.referenceDetailsResponseDto;
          setReferences({
            reference1: rDto.reference1 || "",
            reference2: rDto.reference2 || "",
            reference3: rDto.reference3 || "",
            reference4: rDto.reference4 || "",
            reference5: rDto.reference5 || "",
            reference6: rDto.reference6 || "",
            reference7: rDto.reference7 || "",
            reference8: rDto.reference8 || "",
          });
        }
      }

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

      // 3. Load KYC Files status
      await fetchKycFiles();

      // 4. Load Secure Info
      const secureRes = await getBorrowerSecureInfo();
      if (secureRes?.status === 200 && secureRes.data) {
        const sd = secureRes.data;
        setSecureInfo({
          aadharPassword: sd.aadharPassword || "",
          panPassword: sd.panPassword || "",
          bankStatementPassword: sd.bankStatementPassword || "",
          companyAddress: sd.companyAddress || "",
          designation: sd.designation || "",
          cibilScore: sd.cibilScore ? String(sd.cibilScore) : "",
          comments: sd.comments || "",
          cibilPassword: sd.cibilPassword || "",
          payslipsPassword: sd.payslipsPassword || "",
          userId: sd.userId || profileData.userId || userId,
        });
      }

      // 4. Load KYC Files status
      // await fetchKycFiles();

    } catch (err) {
      console.error("Error populating profile data", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchKycFiles = async () => {
    try {
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
        getdatapayslips(),
        getPCreditReportDoc(),
      ]);

      const docKeys = [
        "PanCard", "Passport", "CHEQUELEAF", "DRIVINGLICENCE", "VOTERID",
        "aadhar", "bankStatement", "tenth", "intermediate", "graduation",
        "offerletter", "feereceipt", "paySlips", "creditReport"
      ];

      const updatedDocs = {};
      docKeys.forEach((key, idx) => {
        if (res[idx]?.status === "fulfilled" && res[idx].value?.data) {
          updatedDocs[key] = res[idx].value.data;
        } else {
          updatedDocs[key] = null;
        }
      });
      setKycDocs(updatedDocs);
    } catch (e) {
      console.error("KYC files status load failed", e);
    }
  };

  const profileCompletionPct = useMemo(() => {
    const fields = [
      profileData.firstName,
      profileData.lastName,
      profileData.panNumber,
      profileData.aadharNumber,
      profileData.city,
      profileData.state,
      profileData.residenceAddress,
      profileData.whatsAppNumber,
    ];
    const filledFields = fields.filter((f) => f && String(f).trim() !== "" && String(f) !== "0");
    return Math.round((filledFields.length / fields.length) * 100);
  }, [profileData]);

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
    if (!profileData.panNumber || profileData.panNumber.length !== 10) {
      Swal.fire("Validation Error", "Valid 10-character PAN required", "warning");
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
        Swal.fire("Success", "PAN verified successfully!", "success");
        setEditSection(null);
      } else {
        setIsPanVerified(false);
        setPanVerificationStatus("PAN record verification failed.");
        Swal.fire("Failed", "PAN verification failed.", "error");
      }
    } catch (err) {
      setPanVerificationStatus("Verification failure.");
      Swal.fire("Failed", "PAN verification failed.", "error");
    } finally {
      setIsVerifyingPan(false);
    }
  };

  const handleprofileInput = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBankInput = (e) => {
    const { name, value } = e.target;
    setBankaccount((prev) => ({ ...prev, [name]: value }));
    if (name === "accountNumber" || name === "confirmAccountNumber" || name === "ifscCode") {
      setIsBankVerified(false);
    }
  };

  const handleNomineeInput = (e) => {
    const { name, value } = e.target;
    setNominee((prev) => ({ ...prev, [name]: value }));
  };

  const handleReferenceInput = (e) => {
    const { name, value } = e.target;
    setReferences((prev) => ({ ...prev, [name]: value }));
  };

  const handleSecureInput = (e) => {
    const { name, value } = e.target;
    setSecureInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Upload File handler
  const handleFileUploadInput = async (e) => {
    if (profileCompletionPct < 75) {
      Swal.fire("Incomplete Profile", "Personal details must be at least 75% complete before files can be uploaded.", "warning");
      return;
    }

    try {
      const res = await uploadkyc(e);
      if (res?.request?.status === 200) {
        Swal.fire("Uploaded Successfully", `${e.target.name} has been processed.`, "success");
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
    if (!whatsappVal || whatsappVal.length < 15) {
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
    const triggerSavingGoogleDistance = async (userId) => {
        try {
          await axios.post(
            `${base_url}savingGoogleDistance`,
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
          console.log("savingGoogleDistance api failed", error);
        }
      };

  // Save Personal Details form
  const savePersonalDetails = async () => {
    if (!profileData.firstName || !profileData.dob || !profileData.panNumber) {
      Swal.fire("Missing Fields", "Please complete all mandatory personal fields.", "warning");
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
            if (verifyRes.data && verifyRes.data.registered_name) {
              updatedFirstName = verifyRes.data.registered_name;
              setProfileData((prev) => ({ ...prev, firstName: verifyRes.data.registered_name }));
            }
          } else {
            setIsPanVerified(false);
            Swal.fire("PAN Verification Failed", "Check PAN number and Name. Must match registered tax record.", "error");
            setSubmitting(false);
            return;
          }
        } catch (err) {
          Swal.fire("PAN Verification Failed", "Unable to verify PAN card at this time.", "error");
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
        dob: profileData.dob,
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
      };

      const formDataPayload = {
        totalExperience: profileData.workExperience,
        company: profileData.companyName,
        salary: profileData.salary,
        country: profileData.country,
        universityName: profileData.universityName,
        universityLocation: profileData.location,
      };

      const response = await profileupadate(userProfilePayload, formDataPayload, category);
      if (response?.status === 200 || response?.request?.status === 200) {
        try {
          await setLatLong();
           triggerSavingGoogleDistance(response.data.userId);
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

  const [isBankVerified, setIsBankVerified] = useState(false);
  const [isVerifyingBank, setIsVerifyingBank] = useState(false);

  useEffect(() => {
    if (editSection === "bank") {
      setBankaccount({
        ...verifiedBankAccount,
        confirmAccountNumber: verifiedBankAccount.accountNumber,
        mobileOtp: "",
        mobileOtpSession: "",
      });
      if (profileData.bankDetailsInfo && verifiedBankAccount.accountNumber && verifiedBankAccount.ifscCode) {
        setIsBankVerified(true);
      } else {
        setIsBankVerified(false);
      }
      setOtpSent(false);
      setOtpButtonText("Send OTP");
    }
  }, [editSection, verifiedBankAccount, profileData.bankDetailsInfo]);

  const verifyBankDetails = async () => {
    if (!bankaccount.accountNumber || !bankaccount.confirmAccountNumber || !bankaccount.ifscCode) {
      Swal.fire("Missing Info", "Account Number, Confirm Account Number, and IFSC Code are required to verify.", "warning");
      return;
    }

    if (bankaccount.accountNumber !== bankaccount.confirmAccountNumber) {
      Swal.fire("Validation Error", "Account numbers do not match!", "warning");
      return;
    }

    setIsVerifyingBank(true);
    try {
      const response = await verifyBankAccountAndIfsc(bankaccount);
      const status = response?.status ?? response?.request?.status;
      if (status === 200) {
        const resData = response.data;
        if (resData.accountStatus === "VALID") {
          Swal.fire("Verified", "Bank Account & IFSC verified successfully via Cashfree.", "success");
          setIsBankVerified(true);
          console.log("Bank Verification Response:", resData);
          setBankaccount((prev) => ({
            ...prev,
            nameAtBank: resData?.nameAtBank || "",
            bankName: resData?.bankName || "",
            bankCity: resData?.city || "",
            branchName: resData?.branch || "",
          }));
        } else {
          Swal.fire("Verification Failed", resData.message || "Failed to verify bank details. Please check your details.", "warning");
        }
      } else {
        const errorMsg = response?.response?.data?.errorMessage || "Failed to verify bank account details.";
        Swal.fire("Error", errorMsg, "error");
      }
    } catch (e) {
      Swal.fire("Error", "Failed to connect to bank verification service.", "error");
    } finally {
      setIsVerifyingBank(false);
    }
  };

  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpButtonText, setOtpButtonText] = useState("Send OTP");

  const sendBankOtp = async () => {
    if (!isBankVerified) {
      Swal.fire("Verification Required", "Please click 'Verify Bank Account' to validate your Account Number & IFSC first.", "warning");
      return;
    }

    console.log("Bank Details for OTP:", bankaccount);

    if (
      !bankaccount.accountNumber ||
      !bankaccount.confirmAccountNumber ||
      !bankaccount.ifscCode ||
      !bankaccount.bankName ||
      !bankaccount.branchName ||
      !bankaccount.nameAtBank ||
      !bankaccount.bankCity ||
      !bankaccount.moblieNumber
    ) {
      Swal.fire("Missing Info", "Please fill all bank details before requesting OTP.", "warning");
      return;
    }

    if (bankaccount.accountNumber !== bankaccount.confirmAccountNumber) {
      Swal.fire("Validation Error", "Account numbers do not match!", "warning");
      return;
    }

    if (bankaccount.moblieNumber.length !== 10) {
      Swal.fire("Validation Error", "Please enter a valid 10-digit mobile number.", "warning");
      return;
    }

    setOtpLoading(true);
    try {
      const response = await sendMoblieOtp(bankaccount);
      if (response?.status === 200 || response?.request?.status === 200) {
        Swal.fire("OTP Sent", "A verification OTP has been sent to your mobile number.", "success");
        setOtpSent(true);
        setOtpButtonText("Resend OTP");
        setBankaccount((prev) => ({
          ...prev,
          mobileOtpSession: response.data.mobileOtpSession,
        }));
      } else {
        const errorMsg = response?.response?.data?.errorMessage || "Failed to send OTP. Please try again.";
        Swal.fire("Error", errorMsg, "error");
      }
    } catch (e) {
      Swal.fire("Error", "Failed to connect to OTP service.", "error");
    } finally {
      setOtpLoading(false);
    }
  };

  // Save Bank Details Form
  const saveBankDetails = async () => {
    if (!isBankVerified) {
      Swal.fire("Verification Required", "Please click 'Verify Bank Account' to validate your details first.", "warning");
      return;
    }

    if (
      !bankaccount.accountNumber ||
      !bankaccount.confirmAccountNumber ||
      !bankaccount.ifscCode ||
      !bankaccount.bankName ||
      !bankaccount.branchName ||
      !bankaccount.nameAtBank ||
      !bankaccount.bankCity ||
      !bankaccount.moblieNumber
    ) {
      Swal.fire("Missing Info", "All bank details fields are mandatory.", "warning");
      return;
    }

    if (bankaccount.accountNumber !== bankaccount.confirmAccountNumber) {
      Swal.fire("Validation Error", "Account numbers do not match!", "warning");
      return;
    }

    if (!bankaccount.mobileOtp) {
      Swal.fire("OTP Required", "Please enter the verification OTP sent to your mobile.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const res = await updatebankDetails(bankaccount);
      if (res?.status === 200 || res?.request?.status === 200) {
        Swal.fire("Success", "Linked bank information updated successfully.", "success");
        setEditSection(null);
        setOtpSent(false);
        setOtpButtonText("Send OTP");
        loadAllProfileData();
      } else {
        const errorMsg = res?.response?.data?.errorMessage || "Unable to update bank account records.";
        Swal.fire("Save Failure", errorMsg, "error");
      }
    } catch {
      Swal.fire("Save Failure", "Unable to update bank account records.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Save Nominee details
  const saveNomineeDetails = async () => {
    if (!nominee.nomineeName || !nominee.relation || !nominee.nomineeMobile) {
      Swal.fire("Missing Fields", "Nominee name, relation, and contact are mandatory.", "warning");
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
    setSubmitting(true);
    try {
      const payload = {
        reference1: references.reference1,
        reference2: references.reference2,
        reference3: references.reference3,
        reference4: references.reference4,
        reference5: references.reference5,
        reference6: references.reference6,
        reference7: references.reference7,
        reference8: references.reference8,
        userId: profileData.userId,
      };
      const res = await saveBorrowerReferenceDetails(payload);
      if (res?.status === 200 || res?.request?.status === 200) {
        Swal.fire("Success", "Reference contacts updated successfully.", "success");
        setEditSection(null);
      } else {
        Swal.fire("Save Failure", "Unable to update reference details.", "error");
      }
    } catch {
      Swal.fire("Save Failure", "Unable to update reference details.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Save Secure metadata
  const saveSecureDetails = async () => {
    setSubmitting(true);
    try {
      const res = await borrowerSecureInfo(secureInfo);
      if (res?.status === 200 || res?.request?.status === 200) {
        Swal.fire("Success", "Secure credentials and file passwords saved.", "success");
        setEditSection(null);
      } else {
        Swal.fire("Save Failure", "Unable to save secure parameters.", "error");
      }
    } catch {
      Swal.fire("Save Failure", "Unable to save secure parameters.", "error");
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="main-wrapper">
      <BorrowerHeader />
      <BorrowerSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid py-4" style={{ backgroundColor: "var(--oxy-background)" }}>
          
          {loading ? (
            <LoadingState count={2} type="card" />
          ) : (
            <>
              {/* TOP HEADER BANNER CARD */}
              <div className="profile-banner">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="profile-avatar-circle">
                      <i className="fa-regular fa-user"></i>
                    </div>
                    <div>
                      <h4 className="fw-bold mb-1 text-white text-capitalize">
                        {profileData.firstName ? `${profileData.firstName} ${profileData.lastName}` : "—"}
                      </h4>
                      <p className="text-white-50 mb-2 small">BR{profileData.userId}</p>
                      
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

                        {/* Bank account Pending badge */}
                        {!profileData.bankDetailsInfo ? (
                          <span className="badge px-3 py-1.5 rounded text-dark font-bold d-inline-flex align-items-center gap-1" style={{ backgroundColor: "#ffd60a", fontSize: "12px" }}>
                            <i className="fa-solid fa-triangle-exclamation"></i> Bank Pending
                          </span>
                        ) : (
                          <span className="badge px-3 py-1.5 rounded text-white font-bold d-inline-flex align-items-center gap-1" style={{ backgroundColor: "#38b000", fontSize: "12px" }}>
                            <i className="fa-solid fa-circle-check"></i> Bank Linked
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    className="btn edit-profile-btn"
                    onClick={() => setEditSection("personal")}
                  >
                    <i className="fa-regular fa-edit me-2"></i> Edit Profile
                  </button>
                </div>
              </div>

              {/* MAIN LAYOUT: TWO COLUMNS */}
              <div className="row g-4">
                
                {/* LEFT COLUMN: PERSONAL INFO CARD */}
                <div className="col-lg-6">
                  <div className="card border-0 shadow-sm rounded-4 h-100">
                    <div className="card-header bg-transparent border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                      <h5 className="fw-bold mb-0 text-dark">PERSONAL INFO</h5>
                      <button 
                        className="btn btn-link text-primary p-0 fw-semibold text-decoration-none d-flex align-items-center gap-1"
                        onClick={() => setEditSection("personal")}
                        style={{ fontSize: "14px" }}
                      >
                        <i className="fa-regular fa-edit"></i> Edit
                      </button>
                    </div>
                    
                    <div className="card-body px-4 pb-4">
                      <div className="space-y-1">
                        <div className="personal-info-row">
                          <span className="personal-info-label">Full Name</span>
                          <span className="personal-info-value text-capitalize">{profileData.firstName} {profileData.lastName}</span>
                        </div>
                        <div className="personal-info-row">
                          <span className="personal-info-label">Date of Birth</span>
                          <span className="personal-info-value">{profileData.dob || "—"}</span>
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
                          <span className="personal-info-value">{profileData.pinCode || "—"}</span>
                        </div>
                        <div className="personal-info-row">
                          <span className="personal-info-label">Occupation Category</span>
                          <span className="personal-info-value" style={{ fontSize: "12px" }}>{category}</span>
                        </div>
                        {category !== "STUDENT" ? (
                          <>
                            <div className="personal-info-row">
                              <span className="personal-info-label">Experience</span>
                              <span className="personal-info-value">{profileData.workExperience || "0"} Years</span>
                            </div>
                            <div className="personal-info-row">
                              <span className="personal-info-label">Company Name</span>
                              <span className="personal-info-value text-lowercase">{profileData.companyName || "—"}</span>
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

                      {/* NOMINEE & REFERENCES SHORTCUT TILES */}
                      <div className="row g-3 mt-4 pt-3">
                        <div className="col-6">
                          <div className="shortcut-box" onClick={() => setEditSection("nominee")} style={{ cursor: "pointer" }}>
                            <span className="text-muted d-block small mb-1">Nominee Info</span>
                            <span className="fw-bold text-primary small d-flex align-items-center gap-1">
                              {nominee.nomineeName ? nominee.nomineeName : "Add Nominee"} <i className="fa-solid fa-arrow-right-long"></i>
                            </span>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="shortcut-box" onClick={() => setEditSection("references")} style={{ cursor: "pointer" }}>
                            <span className="text-muted d-block small mb-1">References</span>
                            <span className="fw-bold text-primary small d-flex align-items-center gap-1">
                              Manage Contacts <i className="fa-solid fa-arrow-right-long"></i>
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: STACKED PANEL CARDS */}
                <div className="col-lg-6">
                  <div className="d-flex flex-column gap-4">
                    
                    {/* BANK ACCOUNT CARD */}
                    <div className="card border-0 shadow-sm rounded-4">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded bg-primary bg-opacity-10 text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: "38px", height: "38px" }}>
                              <i className="fa-solid fa-building-columns"></i>
                            </div>
                            <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "15px", letterSpacing: "0.5px" }}>BANK ACCOUNT</h6>
                          </div>
                          <button 
                            className="btn btn-link text-primary p-0 fw-semibold text-decoration-none d-flex align-items-center gap-1"
                            onClick={() => setEditSection("bank")}
                            style={{ fontSize: "14px" }}
                          >
                            <i className="fa-regular fa-edit"></i> Edit
                          </button>
                        </div>
                        
                        {verifiedBankAccount.accountNumber ? (
                          <div className="bank-details-box">
                            <div className="row g-3 text-start">
                              <div className="col-6">
                                <span className="bank-grid-label">Bank Name - </span>
                                <span className="bank-grid-value">{verifiedBankAccount.bankName}</span>
                              </div>
                              <div className="col-6">
                                <span className="bank-grid-label">Account Number - </span>
                                <span className="bank-grid-value">•••• {verifiedBankAccount.accountNumber.slice(-4)}</span>
                              </div>
                              <div className="col-6">
                                <span className="bank-grid-label">IFSC Code - </span>
                                <span className="bank-grid-value">{verifiedBankAccount.ifscCode}</span>
                              </div>
                              <div className="col-6">
                                <span className="bank-grid-label">Account Holder - </span>
                                <span className="bank-grid-value text-uppercase">{verifiedBankAccount.nameAtBank}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted mb-0 small">No bank account linked. Add one to enable withdrawals.</p>
                        )}
                      </div>
                    </div>

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
                          {!isPanVerified && (
                            <button 
                              className="btn btn-link text-primary p-0 fw-semibold text-decoration-none d-flex align-items-center gap-1"
                              onClick={() => setEditSection("personal")}
                              style={{ fontSize: "14px" }}
                            >
                              Verify
                            </button>
                          )}
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
                          <p className="text-muted mb-0 small">PAN not verified. Verify to unlock full features.</p>
                        )}
                      </div>
                    </div>

                    {/* KYC & SECURE DOCUMENTS CARD */}
                    <div className="card border-0 shadow-sm rounded-4">
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div className="d-flex align-items-center gap-2">
                            <div className="rounded p-2 d-flex align-items-center justify-content-center" style={{ width: "38px", height: "38px", backgroundColor: "#fffbeb", color: "#d97706" }}>
                              <i className="fa-solid fa-folder-open"></i>
                            </div>
                            <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "15px", letterSpacing: "0.5px" }}>KYC & DOCUMENT SECURE VAULT</h6>
                          </div>
                          <button 
                            className="btn btn-link text-primary p-0 fw-semibold text-decoration-none d-flex align-items-center gap-1"
                            onClick={() => setEditSection("kyc")}
                            style={{ fontSize: "14px" }}
                          >
                            <i className="fa-solid fa-cloud-arrow-up me-1"></i> Upload
                          </button>
                        </div>
                        
                        <div className="row g-2 text-start">
                          <div className="col-6">
                            <span className="text-muted d-block small">Uploaded Files</span>
                            <span className="fw-bold text-dark" style={{ fontSize: "15px" }}>
                              {Object.values(kycDocs).filter(v => v !== null).length} Files
                            </span>
                          </div>
                          <div className="col-6">
                            <span className="text-muted d-block small">Bureau OxyScore</span>
                            <span className="fw-bold text-success" style={{ fontSize: "15px" }}>{profileData.profileScore || "—"}</span>
                          </div>
                        </div>
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
      <Modal show={editSection === "personal"} onHide={() => setEditSection(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-dark h5">Edit Profile Information</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label text-muted small">First Name <span className="text-danger">*</span></label>
              <input type="text" className="form-control rounded-3" name="firstName" value={profileData.firstName} onChange={handleprofileInput} />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small">Middle Name</label>
              <input type="text" className="form-control rounded-3" name="middleName" value={profileData.middleName} onChange={handleprofileInput} />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small">Last Name</label>
              <input type="text" className="form-control rounded-3" name="lastName" value={profileData.lastName} onChange={handleprofileInput} />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">Father's Name <span className="text-danger">*</span></label>
              <input type="text" className="form-control rounded-3" name="fatherName" value={profileData.fatherName} onChange={handleprofileInput} />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">Date of Birth (YYYY-MM-DD) <span className="text-danger">*</span></label>
              <input type="text" className="form-control rounded-3" name="dob" value={profileData.dob} onChange={handleprofileInput} placeholder="YYYY-MM-DD" />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">PAN Card Number <span className="text-danger">*</span></label>
              <input type="text" className="form-control rounded-3" name="panNumber" value={profileData.panNumber} onChange={handleprofileInput} maxLength={10} disabled={isPanVerified} />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">Aadhaar Number</label>
              <input type="text" className="form-control rounded-3" name="aadharNumber" value={profileData.aadharNumber} onChange={handleprofileInput} />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">WhatsApp Number</label>
              <input type="text" className="form-control rounded-3" name="whatsAppNumber" value={profileData.whatsAppNumber} onChange={handleprofileInput} />
            </div>
            <div className="col-12">
              <label className="form-label text-muted small">Residential Address <span className="text-danger">*</span></label>
              <input type="text" className="form-control rounded-3" name="residenceAddress" value={profileData.residenceAddress} onChange={handleprofileInput} />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small">City <span className="text-danger">*</span></label>
              <input type="text" className="form-control rounded-3" name="city" value={profileData.city} onChange={handleprofileInput} />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small">State <span className="text-danger">*</span></label>
              <input type="text" className="form-control rounded-3" name="state" value={profileData.state} onChange={handleprofileInput} />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small">Pincode <span className="text-danger">*</span></label>
              <input type="text" className="form-control rounded-3" name="pinCode" value={profileData.pinCode} onChange={handleprofileInput} />
            </div>
            
            <hr className="my-3 opacity-10" />
            <h6 className="fw-bold text-dark">Occupation & Category Details</h6>
            <div className="col-md-6">
              <label className="form-label text-muted small">Employment Category</label>
              <select className="form-select rounded-3" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="SALARIED">Salaried Employee</option>
                <option value="SELFEMPLOYED">Self-Employed</option>
                <option value="STUDENT">Student Profile</option>
              </select>
            </div>
            {category !== "STUDENT" ? (
              <>
                <div className="col-md-6">
                  <label className="form-label text-muted small">Work Experience (Years)</label>
                  <input type="text" className="form-control rounded-3" name="workExperience" value={profileData.workExperience} onChange={handleprofileInput} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small">Company Name</label>
                  <input type="text" className="form-control rounded-3" name="companyName" value={profileData.companyName} onChange={handleprofileInput} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small">Monthly Net Salary (₹)</label>
                  <input type="text" className="form-control rounded-3" name="salary" value={profileData.salary} onChange={handleprofileInput} />
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

      {/* 2. BANK ACCOUNT DETAILS MODAL */}
      <Modal show={editSection === "bank"} onHide={() => { setEditSection(null); setOtpSent(false); setOtpButtonText("Send OTP"); }} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-dark h5">Edit Bank Information</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label text-muted small">Account Number</label>
              <input type="text" className="form-control rounded-3" name="accountNumber" value={bankaccount.accountNumber} onChange={handleBankInput} />
            </div>
            <div className="col-12">
              <label className="form-label text-muted small">Confirm Account Number</label>
              <input type="text" className="form-control rounded-3" name="confirmAccountNumber" value={bankaccount.confirmAccountNumber} onChange={handleBankInput} />
            </div>
            <div className="col-12">
              <label className="form-label text-muted small">IFSC Code</label>
              <input type="text" className="form-control rounded-3" name="ifscCode" value={bankaccount.ifscCode} onChange={handleBankInput} />
            </div>

            {!isBankVerified && (
              <div className="col-12 text-end">
                <button className="btn btn-primary btn-sm rounded-3" type="button" onClick={verifyBankDetails} disabled={isVerifyingBank}>
                  {isVerifyingBank ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                  Verify Bank Account
                </button>
              </div>
            )}

            {isBankVerified && (
              <>
                <div className="col-12 bg-success-subtle p-2 rounded-3 text-success small mb-2 d-flex align-items-center">
                  <i className="fa-solid fa-circle-check me-2"></i> Account Verified Successfully
                </div>
                <div className="col-12">
                  <label className="form-label text-muted small">Name at Bank</label>
                  <input type="text" className="form-control rounded-3 bg-light" name="nameAtBank" value={bankaccount.nameAtBank} readOnly />
                </div>
                <div className="col-12">
                  <label className="form-label text-muted small">Bank Name</label>
                  <input type="text" className="form-control rounded-3 bg-light" name="bankName" value={bankaccount.bankName} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small">Branch Name</label>
                  <input type="text" className="form-control rounded-3 bg-light" name="branchName" value={bankaccount.branchName} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small">Bank City</label>
                  <input type="text" className="form-control rounded-3 bg-light" name="bankCity" value={bankaccount.bankCity} readOnly />
                </div>
                <div className="col-12">
                  <label className="form-label text-muted small">Mobile Number (For Verification)</label>
                  <div className="input-group">
                    <input type="text" className="form-control rounded-3-start" name="moblieNumber" value={bankaccount.moblieNumber} onChange={handleBankInput} maxLength={10} placeholder="Enter 10-digit mobile number" />
                    <button className="btn btn-outline-secondary" type="button" onClick={sendBankOtp} disabled={otpLoading}>
                      {otpLoading ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                      {otpButtonText}
                    </button>
                  </div>
                </div>
                {otpSent && (
                  <div className="col-12">
                    <label className="form-label text-success small fw-bold">Enter Mobile OTP</label>
                    <input type="text" className="form-control rounded-3 border-success" name="mobileOtp" value={bankaccount.mobileOtp} onChange={handleBankInput} maxLength={6} placeholder="Enter 6-digit verification OTP" />
                  </div>
                )}
              </>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="oxy-btn-secondary" onClick={() => { setEditSection(null); setOtpSent(false); setOtpButtonText("Send OTP"); }}>Cancel</button>
          <button className="oxy-btn-primary" onClick={saveBankDetails} disabled={submitting || !isBankVerified}>
            {submitting ? "Saving..." : "Save Bank Info"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* 3. NOMINEE DETAILS MODAL */}
      <Modal show={editSection === "nominee"} onHide={() => setEditSection(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-dark h5">Nominee details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label text-muted small">Nominee Name</label>
              <input type="text" className="form-control rounded-3" name="nomineeName" value={nominee.nomineeName} onChange={handleNomineeInput} />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small">Relation</label>
              <input type="text" className="form-control rounded-3" name="relation" value={nominee.relation} onChange={handleNomineeInput} />
            </div>
            <div className="col-md-4">
              <label className="form-label text-muted small">Nominee Mobile</label>
              <input type="text" className="form-control rounded-3" name="nomineeMobile" value={nominee.nomineeMobile} onChange={handleNomineeInput} />
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
      <Modal show={editSection === "references"} onHide={() => setEditSection(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-dark h5">Reference Contacts</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="row g-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
              <div className="col-md-6" key={num}>
                <label className="form-label text-muted small">Reference Contact {num}</label>
                <input 
                  type="text" 
                  className="form-control rounded-3" 
                  name={`reference${num}`} 
                  placeholder="Name - Mobile Number" 
                  value={references[`reference${num}`]} 
                  onChange={handleReferenceInput} 
                />
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="oxy-btn-secondary" onClick={() => setEditSection(null)}>Cancel</button>
          <button className="oxy-btn-primary" onClick={saveReferenceDetails} disabled={submitting}>
            {submitting ? "Saving..." : "Save References"}
          </button>
        </Modal.Footer>
      </Modal>

      {/* 5. KYC & PASSWORDS EDIT MODAL */}
      <Modal show={editSection === "kyc"} onHide={() => setEditSection(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-dark h5">KYC Documents & PDF Passwords</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <div className="row g-4">
          {[
              { label: "PAN Card Document", name: "pan", value: kycDocs.PanCard, passwordField: "panPassword" },
              { label: "Credit Bureau Report", name: "creditReport", value: kycDocs.creditReport, passwordField: "cibilPassword" },
              { label: "Cancelled Cheque Leaf", name: "CHEQUELEAF", value: kycDocs.CHEQUELEAF },
              { label: "6-Month Bank Statement", name: "BANKSTATEMENT", value: kycDocs.bankStatement, passwordField: "bankStatementPassword" },
              { label: "Registered Aadhaar Card", name: "AADHAR", value: kycDocs.aadhar, passwordField: "aadharPassword" },
              { label: "Driving Licence Scan", name: "DRIVINGLICENCE", value: kycDocs.DRIVINGLICENCE },
              { label: "Voter Identity Card", name: "VOTERID", value: kycDocs.VOTERID },
              { label: "Official Passport Page", name: "PASSPORT", value: kycDocs.Passport },
              { label: "Latest 6-Month Payslips", name: "PAYSLIPS", value: kycDocs.paySlips, passwordField: "payslipsPassword" },

              ...(category
                ? [
                    { label: "Intermediate", name: "INTERMEDIATE", value: kycDocs.intermediate },
                    { label: "10th Grade Marksheet", name: "TENTH", value: kycDocs.tenth },
                    { label: "Graduation Marksheet", name: "GRADUATION", value: kycDocs.graduation },
                    { label: "Offer Letter", name: "OFFERLETTER", value: kycDocs.offerLetter },
                    { label: "Fee Receipt", name: "FEERECEIPT", value: kycDocs.feeReceipt },
                  ]
                : [])
            ].map((doc) => (
              <div className="col-md-6" key={doc.name}>
                <div className="p-3 border rounded-3 bg-light d-flex flex-column justify-content-between h-100">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span className="fw-bold d-block text-dark small">{doc.label}</span>
                      {doc.value ? (
                        <span className="text-success small" style={{ fontSize: "11px" }}>✓ {doc.value.fileName || "Uploaded"}</span>
                      ) : (
                        <span className="text-muted small" style={{ fontSize: "11px" }}>No file uploaded</span>
                      )}
                    </div>
                    <label className="btn btn-outline-primary btn-xs mb-0">
                      <i className="fa-solid fa-cloud-arrow-up"></i>
                      <input type="file" name={doc.name} onChange={handleFileUploadInput} style={{ display: "none" }} />
                    </label>
                  </div>
                  {doc.passwordField && (
                    <div className="mt-2 pt-2 border-top">
                      <label className="form-label text-muted text-xs mb-1" style={{ fontSize: "10px" }}>File Password</label>
                      <input 
                        type="text" 
                        className="form-control form-control-sm rounded-2 text-xs py-1" 
                        name={doc.passwordField}
                        value={secureInfo[doc.passwordField]} 
                        onChange={handleSecureInput} 
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="oxy-btn-secondary" onClick={() => setEditSection(null)}>Cancel</button>
          <button className="oxy-btn-primary" onClick={saveSecureDetails} disabled={submitting}>
            {submitting ? "Saving..." : "Save Credentials"}
          </button>
        </Modal.Footer>
      </Modal>

      <Modal show={editSection === "whatsapp"} onHide={() => setEditSection(null)} centered>
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

    </div>
  );
};

export default Profile;
