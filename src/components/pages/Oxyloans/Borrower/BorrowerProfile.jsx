import moment from "moment";
import React from "react";
import { Link } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import PhoneInput from "react-phone-number-input";
import { useState, useEffect, useMemo } from "react";
import { Success, WarningBackendApi } from "../../Base UI Elements/SweetAlert";
import {
  notifications1,
  notificationssucces,
  toastrSuccess,
  toastrWarning,
} from "../../Base UI Elements/Toast";
import axios from "axios";
import Swal from "sweetalert2";
import { API_USER_URL } from "../../../../config";


import {
  profileupadate,
  getUserDetails,
  sendMoblieOtp,
  loadlendernomineeDetails,
  savenomineeDeatailsApi,
  verifyBankAccountAndIfsc,
  updatebankDetails,
  uploadkyc,
  getPanDoc,
  getdataPassport,
  getdatachequeLeaf,
  getdataDrivingLicence,
  getdataVoterId,
  getdataAadhar,
  handlepincodeapicall,
  sendWhatsappOtpapi,
  verifyWhatsappOtpapi,
  getuploadCredit,
  getdataBankStatement,
  getdatatenth,
  getdataintermediate,
  getdatagraduation,
  getdataofferletter,
  getdatafeereceipt,
  getdatapayslips,
  getPCreditReportDoc,
  borrowerSecureInfo,
  getBorrowerSecureInfo,
  saveBorrowerReferenceDetails,
  base_url,
} from "../../../HttpRequest/afterlogin";

import { useSelector } from "react-redux";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import { error } from "jquery";

const BorrowerProfile = () => {
  const reduxStoreData = useSelector((data) => data.counter.userProfile);
  const reduxStoreDataDashboard = useSelector(
    (data) => data.dashboard.fetchDashboard
  );
  const BASE_URL = API_USER_URL.replace(/\/$/, ""); // strip trailing slash for compatibility
  
  const [dashboarddata, setdashboarddata] = useState({
    sendotpbtn: true,
    sendotpbtnText: "Send OTP",
    sendOtpsession: "",
    verifyotp: true,
    verifyotpText: "Verify IFSC",
    submitbankdeatail: false,
    profileData: null,
    isValid: false,
  });

  const [whatappnumber, setwhatappnumber] = useState({
    whatapp: "",
    otp: "",
    submit: true,
    whatapperror: "",
    otperror: "",
  });


  const [referenceDetails, setReferenceDetails] = useState({
    reference1: "",
    reference2: "",
    reference3: "",
    reference4: "",
    reference5: "",
    reference6: "",
    reference7: "",
    reference8: "",
    loading: false,
    errors: {}
  });

  const [value, setValue] = useState("");

  const [userProfile, setUserProfile] = useState({
    address: "",
    city: "",
    dob: "",
    facebookUrl: "",
    fatherName: "",
    firstName: "",
    lastName: "",
    linkedinUrl: "",
    locality: "",
    middleName: "",
    panNumber: "",
    residenceAddress:"",
    permanentAddress: "",
    pinCode: "",
    state: "",
    twitterUrl: "",
    whatsAppNumber: "",
    aadharNumber: "",
    aadharerror: "",
    mobileNumber: "",
    email: "",
    addresserror: "",
    cityer: "",
    doberror: "",
    fatherNameerror: "",
    firstNamrror: "",
    lastNamerror: "",
    panNumbererror: "",
    residenceAddresserror:"",
    permanentAddresserror: "",
    pinCodeerror: "",
    localityerror:"",
    stateerror: "",
    whatsAppNumbererror: "",
    aadhaarNumbererror: "",
    aadhaarNumbererror: "",
    mobileNumbererror: "",
    emailerror: "",
    studentOrNot: "",
  });

  const profileCompletionPct = useMemo(() => {
    if (!userProfile) return 0;
    const fields = [
      userProfile.firstName,
      userProfile.lastName,
      userProfile.panNumber,
      userProfile.aadharNumber,
      userProfile.city,
      userProfile.state,
      userProfile.address || userProfile.residenceAddress,
      userProfile.whatsAppNumber || userProfile.mobileNumber,
    ];
    const filledFields = fields.filter((f) => f && String(f).trim() !== "" && String(f) !== "0");
    return Math.round((filledFields.length / fields.length) * 100);
  }, [userProfile]);
  const [localityOptions, setLocalityOptions] = useState([]);
  const [isVerifyingPan, setIsVerifyingPan] = useState(false);
  const [isPanVerified, setIsPanVerified] = useState(false);
  const [panVerificationStatus, setPanVerificationStatus] = useState("");
  const [addressGeoStatus, setAddressGeoStatus] = useState({ loading: false, lat: null, lng: null, message: "", valid: null });
  const [bankaccountprofile, setBankaccountProfile] = useState({
    sendMobileOtp: "",
    moblieNumber: "",
    bankAccount: "",
    accountNumber: "",
    bankAddress: "",
    bankName: "",
    branchName: "",
    confirmAccountNumber: "",
    ifscCode: "",
    mobileOtp: "",
    mobileOtpSession: "",
    bankAccountError: "",
    updateBankDetails: true,
    nameAtBank: "",
    bankCity: "",
    moblieNumbererror: "",
    bankAccounterror: "",
    accountNumbererror: "",
    bankAddresserror: "",
    bankNameerror: "",
    branchNameerror: "",
    confirmAccountNumbererror: "",
    ifscCodeerror: "",
    mobileOtperror: "",
    mobileOtpSessionerror: "",
    bankAccountError: "",
    nameAtBankerror: "",
    bankCityerror: "",
    isbankprofilevaild: true,
  });


  const [valid, setvalid] = useState(true)
  const [nomineeDetails, setnomineeDetails] = useState({
    nomineeName: "",
    relation: "",
    nomineeEmail: "",
    nomineeMobile: "",
    accountNo: "",
    nomineeNameerror: "",
    relationerror: "",
    nomineeEmaileeror: "",
    nomineeMobileerror: "",
    accountNoerror: "",
    nomineeIfsc: "",
    bank: "",
    branch: "",
    nomineecity: "",
    bankerror: "",
    brancherror: "",
    nomineeIfscerror: "",
    nomineecityerror: "",
    copyerror: "",
    isdeatail: false,
    isbtndisable: true,
  });

  const [kyc, setKyc] = useState({
    aadhar: "",
    Passport: "",
    PanCard: "",
    creditReport: "",
    CHEQUELEAF: "",
    DRIVINGLICENCE: "",
    VOTERID: "",
    bankStatement: "",
    paySlips:'',
    tenth:'',
    intermediate:'',
    graduation:'',
    offerletter:'',
    feereceipt:'',
    isValid: true,
  });


  const [uploddata, setuploaddata] = useState([]);
  const [viewdocment, setviewdocment] = useState(false);
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    totalExperience: "",
    company: "",
    salary: "",
    // occupation: "",
    // income: "",
    country: "",
    universityName: "",
    universityLocation: "",
  });
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
  });
  const [secureInfoVisibility, setSecureInfoVisibility] = useState({
    aadharPassword: false,
    panPassword: false,
    bankStatementPassword: false,
    cibilPassword: false,
    payslipsPassword: false,
  });

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    // console.log({category})
    setError(""); // clear error on select
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleSecureInfoChange = (event) => {
    const { name, value } = event.target;
    setSecureInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const toggleSecureInfoVisibility = (fieldName) => {
    setSecureInfoVisibility((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const saveSecureInfo = async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      WarningBackendApi("warning", "Session expired. Please login again.");
      return;
    }

    const payload = {
      userId: String(userId),
      userType: "USER",
    };

    Object.keys(secureInfo).forEach((key) => {
      const value = secureInfo[key];
      if (value !== null && value !== undefined && String(value).trim() !== "") {
        payload[key] = value;
      }
    });

    const response = await borrowerSecureInfo(payload);
    if (response?.status == 200) {
      Success("success", "Secure Info saved successfully.");
    } else {
      WarningBackendApi(
        "warning",
        response?.response?.data?.errorMessage || "Unable to save secure info."
      );
    }
  };

  const handleReferenceChange = (e) => {
    const { name, value } = e.target;
    if (value !== "" && (!/^\d+$/.test(value) || value.length > 10)) {
      return;
    }
    setReferenceDetails(prev => ({
      ...prev,
      [name]: value,
      errors: { ...prev.errors, [name]: "" }
    }));
  };

  const handleReferenceSave = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    const refKeys = [
      { key: "reference1", label: "Father Mobile Number" },
      { key: "reference2", label: "Mother Mobile Number" },
      { key: "reference3", label: "Brother Mobile Number" },
      { key: "reference4", label: "Sister Mobile Number" },
      { key: "reference5", label: "Wife Mobile Number" },
      { key: "reference6", label: "First Friend Mobile Number" },
      { key: "reference7", label: "Second Friend Mobile Number" },
      { key: "reference8", label: "Third Friend Mobile Number" }
    ];

    refKeys.forEach(ref => {
      const val = referenceDetails[ref.key];
      if (!val || val.trim() === "") {
        newErrors[ref.key] = `${ref.label} is required`;
      } else if (val.length !== 10) {
        newErrors[ref.key] = `${ref.label} must be exactly 10 digits`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setReferenceDetails(prev => ({ ...prev, errors: newErrors }));
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter valid 10-digit mobile numbers for all references.",
        confirmButtonColor: "#3d5ee1"
      });
      return;
    }

    setReferenceDetails(prev => ({ ...prev, loading: true }));
    try {
      const payload = {
        reference1: referenceDetails.reference1,
        reference2: referenceDetails.reference2,
        reference3: referenceDetails.reference3,
        reference4: referenceDetails.reference4,
        reference5: referenceDetails.reference5,
        reference6: referenceDetails.reference6,
        reference7: referenceDetails.reference7,
        reference8: referenceDetails.reference8,
        userId: sessionStorage.getItem("userId")
      };

      const res = await saveBorrowerReferenceDetails(payload);
      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Given Details Saved Successfully",
          confirmButtonColor: "#3d5ee1"
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: res.data?.errorMessage || "Failed to save details. Please try again.",
          confirmButtonColor: "#3d5ee1"
        });
      }
    } catch (error) {
      console.error("Error saving reference details:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.response?.data?.errorMessage || "Failed to save details. Please try again.",
        confirmButtonColor: "#3d5ee1"
      });
    } finally {
      setReferenceDetails(prev => ({ ...prev, loading: false }));
    }
  };

  const handlebankchange = (event) => {
    const { value, name } = event.target;
    setBankaccountProfile({
      ...bankaccountprofile,
      [name]: value,
    });
  };


  useEffect(() => {
    if (value === "" || value === null) {
      setvalid(true);
    } else {
      setvalid(false);
    }
  }, [value]);
  const handlechangewhatapp = (event) => {
    const { value, name } = event.target;
    setwhatappnumber({
      ...whatappnumber,
      [name]: value,
    });
  };




  const handleviewCredit = () => {
    setviewdocment(!viewdocment)
  }
  const sendWhatsappOtpapi1 = () => {

    console.log(typeof (value))
    if (value && value !== "" && value.length >= 13) {

      console.log("whatapp pass")
      console.log(value)
      const response = sendWhatsappOtpapi(whatappnumber, value);
      console.log(response);

      if (response.status === 200) {
        notificationssucces()
      }

      response.then((data) => {
        if (data.request.status == 200) {
          setwhatappnumber({
            ...whatappnumber,
            submit: !whatappnumber.submit,
          });
          notificationssucces();
        } else if (data.response.data.errorCode != "200") {
          WarningBackendApi("warning", data.response.data.errorMessage);
        }
      });
    } else {
      console.log("success")
      setwhatappnumber({
        ...whatappnumber,
        whatapperror: "Please enter a valid WhatsApp number."
      })
    }

  };




  useEffect(() => {
    const getuploadCredit1 = () => {
      const response = getuploadCredit();
      response.then((data) => {
        console.log(data.data)
        setuploaddata(data.data)
      }).catch((error) => {
        console.log(error)
      })
    }
    getuploadCredit1()
  }, [])




  const verifyWhatsappOtp = () => {
    console.log(typeof (whatappnumber.otp))
    if (whatappnumber.otp && whatappnumber.otp !== "" && whatappnumber.otp.length === 4) {
      const response = verifyWhatsappOtpapi(whatappnumber);
      console.log(response);
      // if(response.status === 200){

      //   notifications1()
      // }

      response.then((data) => {
        if (data.request.status == 200) {
          notifications1();
        } else if (data.response.data.errorCode != "200") {
          WarningBackendApi("warning", data.response.data.errorMessage);
        }
      });
    } else {
      setwhatappnumber({
        ...whatappnumber,
        otperror: "Please enter a valid OTP"
      })
    }
  };
  useEffect(() => {
    if (userProfile.aadharerror >= 12) {
      setUserProfile({
        ...userProfile,
        aadharerror: "aadhaar Number must be 12 digit",
      });
    } else {
      setUserProfile({
        ...userProfile,
        aadharerror: "",
      });
    }
  }, [userProfile.aadharerror]);
  const handlerNominee = (event) => {
    const { value, name } = event.target;
    setnomineeDetails({
      ...nomineeDetails,
      [name]: value,
    });
  };

  useEffect(() => {
    const isvalid =
      nomineeDetails.accountNo != "" &&
      nomineeDetails.bank != "" &&
      nomineeDetails.branch != "" &&
      nomineeDetails.nomineeEmail != "" &&
      nomineeDetails.nomineeIfsc != "" &&
      nomineeDetails.nomineeMobile != "" &&
      nomineeDetails.nomineeName != "" &&
      nomineeDetails.relation != "" &&
      nomineeDetails.city != "";
    if (isvalid) {
      setnomineeDetails({
        ...nomineeDetails,
        isbtndisable: false,
        isdeatail: true,
      });
    } else {
      setnomineeDetails({
        ...nomineeDetails,
        isbtndisable: true,
      });
    }
  }, [
    nomineeDetails.accountNo,
    nomineeDetails.bank,
    nomineeDetails.branch,
    nomineeDetails.nomineeEmail,
    nomineeDetails.nomineeIfsc,
    nomineeDetails.nomineeMobile,
    nomineeDetails.nomineeName,
    nomineeDetails.relation,
    nomineeDetails.city,
  ]);

  const handleKeyPress = (event) => {
    const inputChar = event.key;
    const regex = /^[a-zA-Z\s]*$/;

    if (!regex.test(inputChar) && inputChar !== "Backspace") {
      event.preventDefault();
    }
  };
  useEffect(() => {
    if (
      bankaccountprofile.accountNumber ===
      bankaccountprofile.confirmAccountNumber
      // bankaccountprofile.confirmAccountNumber !== "" &&
      // bankaccountprofile.accountNumber !== ""
    ) {
      setBankaccountProfile({
        ...bankaccountprofile,
        confirmAccountNumbererror: "",
        isbankprofilevaild: false,
      });
    } else {
      setBankaccountProfile({
        ...bankaccountprofile,
        confirmAccountNumbererror: "Account numbers do not match!",
        isbankprofilevaild: true,
      });
    }
  }, [
    bankaccountprofile.accountNumber,
    bankaccountprofile.confirmAccountNumber,
  ]);
  const savebankdetailsProfile = () => {
    if (dashboarddata.isValid === true) {
      if (bankaccountprofile.mobileOtp === "") {
        setBankaccountProfile({
          ...bankaccountprofile,
          mobileOtperror: "Enter the OTP",
        });
      }
    }
    const response = updatebankDetails(bankaccountprofile);
    response.then((data) => {
      if (data.request.status == 200) {
        Success("success", "Bank Details Saved Successfully");
      } else if (data.response.data.errorCode != "200") {
        WarningBackendApi("warning", data.response.data.errorMessage);
      }
    });
  };

  const handleNomineeclick = async (event) => {
    event.preventDefault();
    setnomineeDetails({
      ...nomineeDetails,
      nomineeNameerror:
        nomineeDetails.nomineeName === "" ? "Enter the nomineeName" : "",
      relationerror: nomineeDetails.relation === "" ? "Enter the Relation" : "",
      nomineeEmaileeror:
        nomineeDetails.nomineeEmail === "" ? "Enter the Nominee Email" : "",
      nomineeMobileerror:
        nomineeDetails.nomineeMobile === ""
          ? "Enter the Nominee Mobile Number"
          : "",
      accountNoerror:
        nomineeDetails.accountNo === "" ? "Enter the   Account No" : "",
      emailerror: nomineeDetails.nomineeEmail === "" ? "Enter the Email" : "",
      bankerror: nomineeDetails.bank === "" ? "Enter the bank" : "",
      brancherror: nomineeDetails.branch === "" ? "Enter the accountNo" : "",
      nomineeIfscerror: nomineeDetails.nomineeIfsc === "" ? "Enter the Ifsc" : "",
      nomineecityerror:
        nomineeDetails.nomineecity === "" ? "Enter the nomineecity" : "",
    });

    if (
      nomineeDetails.nomineeName !== "" &&
      nomineeDetails.nomineeName !== null &&
      nomineeDetails.nomineeIfsc !== "" &&
      nomineeDetails.nomineeIfsc !== null &&
      nomineeDetails.relation !== "" &&
      nomineeDetails.relation !== null &&
      nomineeDetails.nomineeEmail !== "" &&
      nomineeDetails.nomineeEmail !== null &&
      nomineeDetails.nomineeMobile !== "" &&
      nomineeDetails.nomineeMobile !== null &&
      nomineeDetails.accountNo !== "" &&
      nomineeDetails.accountNo !== null &&
      nomineeDetails.nomineeEmail !== "" &&
      nomineeDetails.nomineeEmail !== null &&
      nomineeDetails.bank !== "" &&
      nomineeDetails.bank !== null &&
      nomineeDetails.branch !== "" &&
      nomineeDetails.branch !== null &&
      nomineeDetails.nomineecity !== "" &&
      nomineeDetails.nomineecity !== null &&
      nomineeDetails.nomineeNameerror === "" &&
      nomineeDetails.relationerror === "" &&
      nomineeDetails.nomineeEmaileeror === "" &&
      nomineeDetails.nomineeMobileerror === "" &&
      nomineeDetails.accountNoerror === "" &&
      nomineeDetails.emailerror === "" &&
      nomineeDetails.bankerror === "" &&
      nomineeDetails.nomineecityerror === ""
    ) {
      const response = savenomineeDeatailsApi(nomineeDetails);
      response.then((data) => {
        if (data.request.status == 200) {
          Success("success", "Nominee Details Save Successfully");
        } else if (data.response.data.errorCode != "200") {
          WarningBackendApi("warning", data.response.data.errorMessage);
        }
      });
    } else {
    }
  };
  const submitNomineeDetails = (event) => {
    event.preventDefault();
    if (nomineeDetails.isdeatail == true) {
      const response = savenomineeDeatailsApi(nomineeDetails);
      response.then((data) => {
        if (data.request.status == 200) {
          Success("success", "Nominee Details Save Successfully");
        } else if (data.response.data.errorCode != "200") {
          WarningBackendApi("warning", data.response.data.errorMessage);
        }
      });
    } else {
      WarningBackendApi("warning");
    }
  };

  const verifybankAccountCashfree = () => {
    setBankaccountProfile((bankaccountprofile) => ({
      ...bankaccountprofile,
      nameAtBankerror:
        bankaccountprofile.nameAtBank === "" ? "Enter the Name" : "",
      moblieNumbererror:
        bankaccountprofile.moblieNumber === "" ||
          bankaccountprofile.moblieNumber.length != 10
          ? "Enter 10 Digit Mobile Number "
          : "",
      accountNumbererror:
        bankaccountprofile.accountNumber === ""
          ? "Enter the Account Number"
          : "",
      confirmAccountNumbererror:
        bankaccountprofile.confirmAccountNumber === "" ||
          bankaccountprofile.confirmAccountNumber !==
          bankaccountprofile.accountNumber
          ? "Enter the Confirm Account Number"
          : "",
      ifscCodeerror:
        bankaccountprofile.ifscCode === "" ? "Enter the IFSC Code" : "",
      bankNameerror:
        bankaccountprofile.bankName === "" ? "Enter the Bank Name" : "",
      branchNameerror:
        bankaccountprofile.branchName === "" ? "Enter the Branch Name" : "",
      bankCityerror:
        bankaccountprofile.bankCity === "" ? "Enter the Bank City" : "",
    }));

    // if (
    //   bankaccountprofile.moblieNumber !== null &&
    //   bankaccountprofile.moblieNumber !== "" &&
    //   bankaccountprofile.accountNumber !== null &&
    //   bankaccountprofile.accountNumber !== "" &&
    //   bankaccountprofile.confirmAccountNumber !== null &&
    //   bankaccountprofile.confirmAccountNumber !== "" &&
    //   bankaccountprofile.ifscCode !== null &&
    //   bankaccountprofile.ifscCode !== "" &&
    //   bankaccountprofile.bankName !== null &&
    //   bankaccountprofile.bankName !== "" &&
    //   bankaccountprofile.branchName !== null &&
    //   bankaccountprofile.branchName !== "" &&
    //   bankaccountprofile.confirmAccountNumbererror === "" &&
    //   bankaccountprofile.moblieNumber.length === 10 &&
    //   bankaccountprofile.bankCity !== null &&
    //   bankaccountprofile.bankCity !== ""
    // ) {
    //   const response = verifyBankAccountAndIfsc(bankaccountprofile);
    //   response.then((data) => {
    //     if (data.request.status == 200) {
    //       if (data.data.status == "SUCCESS") {
    //         setdashboarddata({
    //           ...dashboarddata,
    //           verifyotpText: "Verifed IFSC",
    //           // submitbankdeatail: true,
    //           sendotpbtn: true,
    //         });

    //         setBankaccountProfile({
    //           ...bankaccountprofile,
    //           nameAtBank: data.data.data.nameAtBank,
    //           bankName: data.data.data.bankName,
    //           bankCity: data.data.data.city,
    //           branchName: data.data.data.branch,
    //         });
    //         toastrSuccess("Verifed BankAccount Ifsc");
    //       } else {
    //         WarningBackendApi("warning", data.data.message);
    //       }
    //     } else if (data.response.data.errorCode != "200") {
    //       WarningBackendApi("warning", data.response.data.errorMessage);
    //     }
    //   });
    // } else {
    // }
  };

  useEffect(() => {
    const inputDate = moment(
      userProfile.dob,
      ["DD/MM/YYYY", "YYYY-MM-DD"],
      true
    );

    // Calculate today's date
    const today = moment();

    // Calculate the minimum date for someone to be 18 years old
    const minDate = moment().subtract(18, "years");

    // Check if the input date is valid and the user is at least 18 years old
    setUserProfile((prevProfile) => {
      if (inputDate.isValid() && inputDate.isSameOrBefore(minDate)) {
        return {
          ...prevProfile,
          doberror: "", // Clear error message
        };
      } else {
        return {
          ...prevProfile,
          doberror: "You must be at least 18 years old",
        };
      }
    });
  }, [userProfile.dob]);
  const handlefileupload = (event) => {
    if (profileCompletionPct < 75) {
      Swal.fire({
        icon: "warning",
        title: "Profile Completion Under 75%",
        text: `Your profile is only ${profileCompletionPct}% complete. Please complete at least 75% of your profile details before uploading KYC.`,
        confirmButtonText: "Okay",
        confirmButtonColor: "#3d5ee1",
      });
      if (event.target) {
        event.target.value = "";
      }
      return;
    }
    const response = uploadkyc(event);
    response
      .then((data) => {
        if (data && data.request && data.request.status === 200) {
          setKyc((prevKyc) => ({
            ...prevKyc,
            isValid: !prevKyc.isValid,
          }));
          Success("success", `${event.target.name} Uploaded Successfully`);
        } else if (
          data &&
          data.response &&
          data.response.data &&
          data.response.data.errorCode !== "200"
        ) {
          WarningBackendApi("warning", data.response.data.errorMessage);
        } else {
        }
      })
      .catch((error) => {
        console.error("Error during file upload:", error);
      });
  };

  useEffect(() => {
    // Check state for numbers
    if (/\d/.test(userProfile.state)) {
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        stateerror: "Enter characters only!",
      }));
    } else {
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        stateerror: "",
      }));
    }

    // Check city for numbers
    if (/\d/.test(userProfile.city)) {
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        cityerror: "Enter characters only!",
      }));
    } else {
      setUserProfile((prevProfile) => ({
        ...prevProfile,
        cityerror: "",
      }));
    }

    if (/\d/.test(nomineeDetails.nomineeName)) {
      setnomineeDetails((prevDetails) => ({
        ...prevDetails,
        nomineeNameerror: "Enter characters only!",
      }));
    } else {
      setnomineeDetails((prevDetails) => ({
        ...prevDetails,
        nomineeNameerror: "",
      }));
    }

    if (/\d/.test(nomineeDetails.relation)) {
      setnomineeDetails((prevDetails) => ({
        ...prevDetails,
        relationerror: "Enter characters only!",
      }));
    } else {
      setnomineeDetails((prevDetails) => ({
        ...prevDetails,
        relationerror: "",
      }));
    }

    if (/\d/.test(nomineeDetails.bank)) {
      setnomineeDetails((prevDetails) => ({
        ...prevDetails,
        bankerror: "Enter characters only!",
      }));
    } else {
      setnomineeDetails((prevDetails) => ({
        ...prevDetails,
        bankerror: "",
      }));
    }

    if (/\d/.test(nomineeDetails.nomineecity)) {
      setnomineeDetails((prevDetails) => ({
        ...prevDetails,
        nomineecityerror: "Enter characters only!",
      }));
    } else {
      setnomineeDetails((prevDetails) => ({
        ...prevDetails,
        nomineecityerror: "",
      }));
    }

    if (/\d/.test(userProfile.lastName)) {
      setUserProfile((prevDetails) => ({
        ...prevDetails,
        lastNamerror: "Enter characters only!",
      }));
    } else {
      setnomineeDetails((prevDetails) => ({
        ...prevDetails,
        lastNamerror: "",
      }));
    }
    if (userProfile.sameAsResidence) {
    setUserProfile((prev) => ({
      ...prev,
      permanentAddress: prev.residenceAddress,
    }));
  }

    if (
      /^\d+$/.test(userProfile.mobileNumber) ||
      userProfile.mobileNumber === "" ||
      userProfile.mobileNumber === null
    ) {
      setUserProfile((prevDetails) => ({
        ...prevDetails,
        mobileNumbererror: "",
      }));
    } else {
      setUserProfile((prevDetails) => ({
        ...prevDetails,

        mobileNumbererror: "Enter digits only!",
      }));
    }

    if (
      /^\d+$/.test(userProfile.whatsAppNumber) ||
      userProfile.whatsAppNumber === "" ||
      userProfile.whatsAppNumber === null
    ) {
      setUserProfile((prevDetails) => ({
        ...prevDetails,
        whatsAppNumbererror: "",
      }));
    } else {
      setUserProfile((prevDetails) => ({
        ...prevDetails,

        whatsAppNumbererror: "Enter digits only!",
      }));
    }
    if (
      /^\d+$/.test(userProfile.aadharNumber) ||
      userProfile.aadharNumber === "" ||
      userProfile.aadharNumber === null
    ) {
      setUserProfile((prevDetails) => ({
        ...prevDetails,
        aadhaarNumbererror: "",
      }));
    } else {
      setUserProfile((prevDetails) => ({
        ...prevDetails,

        aadhaarNumbererror: "Enter digits only!",
      }));
    }

    if (/\d/.test(userProfile.fatherName)) {
      setUserProfile((prevDetails) => ({
        ...prevDetails,
        fatherNameerror: "Enter characters only!",
      }));
    } else {
      setUserProfile((prevDetails) => ({
        ...prevDetails,
        fatherNameerror: "",
      }));
    }

    if (/\d/.test(userProfile.city)) {
      setUserProfile((prevDetails) => ({
        ...prevDetails,
        cityer: "Enter characters only!",
      }));
    } else {
      setUserProfile((prevDetails) => ({
        ...prevDetails,
        cityer: "",
      }));
    }

    if (/\d/.test(bankaccountprofile.bankCity)) {
      setUserProfile((prevDetails) => ({
        ...prevDetails,
        bankCityerror: "Enter characters only!",
      }));
    } else {
      setUserProfile((prevDetails) => ({
        ...prevDetails,
        bankCityerror: "",
      }));
    }

    if (/\d/.test(bankaccountprofile.branchName)) {
      setUserProfile((prevDetails) => ({
        ...prevDetails,
        branchNameerror: "Enter characters only!",
      }));
    } else {
      setUserProfile((prevDetails) => ({
        ...prevDetails,
        branchNameerror: "",
      }));
    }

    if (
      /^\d+$/.test(nomineeDetails.nomineeMobile) ||
      nomineeDetails.nomineeMobile === "" ||
      nomineeDetails.nomineeMobile === null
    ) {
      // Nominee mobile contains only digits or is empty or null

      setnomineeDetails((prevDetails) => ({
        ...prevDetails,
        nomineeMobileerror: "", // No error
      }));
    } else {
      // Nominee mobile contains non-digit characters

      setnomineeDetails((prevDetails) => ({
        ...prevDetails,
        nomineeMobileerror: "Enter digits only!",
      }));
    }

    if (
      /^\d+$/.test(nomineeDetails.accountNo) ||
      nomineeDetails.accountNo === "" ||
      nomineeDetails.accountNo === null
    ) {
      // Nominee mobile contains only digits or is empty or null
      setnomineeDetails((prevDetails) => ({
        ...prevDetails,
        accountNoerror: "", // No error
      }));
    } else {
      // Nominee mobile contains non-digit characters
      setnomineeDetails((prevDetails) => ({
        ...prevDetails,
        accountNoerror: "Enter digits only!",
      }));
    }

    if (
      /^\d+$/.test(bankaccountprofile.moblieNumber) ||
      bankaccountprofile.moblieNumber === "" ||
      bankaccountprofile.moblieNumber === null
    ) {
      setBankaccountProfile((prevDetails) => ({
        ...prevDetails,
        moblieNumbererror: "",
      }));
    } else {
      setBankaccountProfile((prevDetails) => ({
        ...prevDetails,
        moblieNumbererror: "Enter digits only!",
      }));
    }

    if (/\d/.test(bankaccountprofile.bankCity)) {
      setBankaccountProfile((prevDetails) => ({
        ...prevDetails,
        bankCityerror: "Enter characters only!",
      }));
    } else {
      setBankaccountProfile((prevDetails) => ({
        ...prevDetails,
        bankCityerror: "",
      }));
    }

    if (/\d/.test(nomineeDetails.branch)) {
      setnomineeDetails((prevDetails) => ({
        ...prevDetails,
        brancherror: "Enter characters only!",
      }));
    } else {
      setnomineeDetails((prevDetails) => ({
        ...prevDetails,
        brancherror: "",
      }));
    }
  }, [
    userProfile.state,
    userProfile.lastName,
    userProfile.aadharNumber,
    userProfile.fatherName,
    userProfile.city,
    nomineeDetails.nomineeName,
    nomineeDetails.relation,
    bankaccountprofile.moblieNumber,
    userProfile.whatsAppNumber,
    userProfile.address,
    nomineeDetails.accountNo,
    nomineeDetails.bank,
    nomineeDetails.nomineecity,
    userProfile.mobileNumber,
    userProfile.city,
    nomineeDetails.nomineeMobile,
    nomineeDetails.branch,
    nomineeDetails.accountNo,
    bankaccountprofile.bankCity,
  ]);



  const handlePinCodeChange = async (name, value) => {
  if (name === "pinCode" && value.length === 6) {
    try {
      const res = await axios.get(`${BASE_URL}/${value}/pincode`);
      const blocks = res.data.pinresults
        .map((item) => item.block)
        .filter((block, index, self) => block && self.indexOf(block) === index); // Get unique non-null blocks

      setLocalityOptions(blocks);

      // Set the first locality as default if blocks are available
      setUserProfile((prev) => ({
        ...prev,
        locality: blocks.length > 0 ? blocks[0] : "", // Select first option or empty string
        localityerror: blocks.length > 0 ? "" : "No localities found for this pin code",
      }));
    } catch (error) {
      console.error("Failed to fetch pincode info", error);
      setLocalityOptions([]);
      setUserProfile((prev) => ({
        ...prev,
        locality: "",
        localityerror: "Failed to fetch localities",
      }));
    }
  } else if (name === "pinCode" && value.length < 6) {
    // Clear locality options and reset locality if pin code is invalid
    setLocalityOptions([]);
    setUserProfile((prev) => ({
      ...prev,
      locality: "",
      localityerror: "",
    }));
  }
};
  const handlechange = async(event) => {
    let { name, value } = event.target;
    if (name === "panNumber" && value) {
      value = value.toUpperCase();
    }

    // if (name === "pinCode") {
    //   // Validate input to allow only numeric characters
    //   const numericValue = value.replace(/\D/g, ""); // Remove non-numeric characters
    //   // Limit the input to 6 digits
    //   const updatedValue = numericValue.slice(0, 6);
    //   if (updatedValue.length !== 6) {
    //     // Check against the expected length of 6 digits
    //     setUserProfile({
    //       ...userProfile,
    //       pinCodeError: "PIN code must be exactly 6 digits long",
    //       [name]: updatedValue,
    //     });
    //     return; // Exit the function early to prevent setting state again
    //   }

    //   // Only proceed with API call if pin code is exactly 6 digits long
    // }



    // if (name === "pinCode" && value.length === 6) {
    //   try {
    //     const res = await axios.get(BASE_URL+`/${value}/pincode`);

    //     const blocks = res.data.pinresults
    //       .map((item) => item.block)
    //       .filter((block, index, self) => block && self.indexOf(block) === index); // get unique non-null blocks

    //     setLocalityOptions(blocks);

    //     // clear existing selected address if not in list
    //     if (!blocks.includes(userProfile.locality)) {
    //       setUserProfile((prev) => ({ ...prev, locality: "" }));
    //     }
    //   } catch (error) {
    //     console.error("Failed to fetch pincode info", error);
    //     setLocalityOptions([]);
    //   }
    // }

   

    // Calculate today's date
    const today = new Date();

    // Calculate the minimum date for someone to be 18 years old
    const minDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );

    // Convert the input value to a Date object
    const inputDate = new Date(value);

    // Check if the input date is valid and the user is at least 18 years old
    if (!isNaN(inputDate.getTime()) && inputDate <= minDate) {
      setUserProfile({
        ...userProfile,
        [name]: value,
        doberror: "", // Clear error message
      });
    } else {
      setUserProfile({
        ...userProfile,
        [name]: value,
        doberror: "You must be at least 18 years old",
      });
    }

    setUserProfile({
      ...userProfile,
      [name]: value,
    });

    setUserProfile((prev) => ({
    ...prev,
    [name]: value,
    ...(name === "locality" && { localityerror: "" }), // Clear locality error on selection
  }));

  if (name === "panNumber" || name === "firstName") {
    setIsPanVerified(false);
    setPanVerificationStatus("");
    setUserProfile((prev) => ({
      ...prev,
      panNumbererror: "",
      firstNamrror: "",
    }));
  }

  // Handle pin code changes to fetch localities
  if (name === "pinCode") {
    handlePinCodeChange(name, value);
  }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    // alert('Copying and pasting is disabled for this field.');
    setnomineeDetails({
      ...nomineeDetails,
      copyerror: "Copying and pasting is disabled for this field.",
    });
  };

  const handleCopy = (event) => {
    event.preventDefault();
    // alert('Copying and pasting is disabled for this field.');
    setnomineeDetails({
      ...nomineeDetails,
      copyerror: "Copying and pasting is disabled for this field.",
    });
  };


  const handleKeyPressNumber = (event) => {
    const inputChar = event.key;
    const regex = /^[0-9]*$/;

    if (!regex.test(inputChar) && inputChar !== "Backspace") {
      event.preventDefault();
    }
  };

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

  const handleprofileUpdate = () => {
    console.log("userProfile", userProfile);
    setUserProfile({
      ...userProfile,
      cityer: userProfile.city === ("" || null) ? "Please enter the city" : "",
      doberror: userProfile.dob === "" ? "Please enter the dob" : "",
      fatherNameerror:
        userProfile.fatherName === "" ? "Please enter the father Name" : "",
      firstNamrror:
        userProfile.firstName === "" ? "Please enter the first Name" : "",
      panNumbererror:
        userProfile.panNumber === "" ? "Please enter the panNumber" : "",
      panNumbererror:
        userProfile.panNumber.length !== 10 ? "Invalid panNumber" : "",
      residenceAddresserror: userProfile.residenceAddress === null ? "Please enter Residence Address" : "",
      permanentAddresserror: userProfile.permanentAddress === "" ? "Please Enter The Permenant Address" : "",
      cityer: userProfile.city === "" ? "Please Enter The city" : "",
      pinCodeerror:
        userProfile.pinCode === "" ? "Please Enter The Pincode" : "",
      stateerror: userProfile.state === "" ? "Please Enter The State" : "",
      whatsAppNumbererror:
        userProfile.whatsAppNumber === "" ||
          userProfile.whatsAppNumber === null 
          // || userProfile.whatsAppNumber.length < 10
          ? " WhatsApp Number should be 10 digits"
          : "",

      mobileNumbererror:
        userProfile.mobileNumber === "" || userProfile.mobileNumber.length < 10
          ? " MobileNumber should be 10 digits"
          : "",
      emailerror: userProfile.email === "" ? "Please Enter The Email" : "",
    });

    if (!category) {
      setError("Please select a category.");
      return;
    }
  
    // Step 2: Validate based on category
    if (category === "SALARIED" || category === "SELFEMPLOYED") {
      if (!formData.totalExperience || !formData.company || !formData.salary) {
        setError("Please fill all the fields for " + category.toLowerCase() + " category.");
        return;
      }
    }
  
    if (category === "STUDENT") {
      if (!formData.country || !formData.universityName || !formData.universityLocation) {
        setError("Please fill all the fields for student category.");
        return;
      }
    }
  
    // If everything is valid
    setError("");
    // Proceed with API call or other logic
    console.log("Submitting form:", category, formData);

    if (
      userProfile.email !== null &&
      userProfile.email !== "" &&
      userProfile.firstName !== null &&
      userProfile.firstName !== "" &&
      userProfile.doberror === "" &&
      userProfile.mobileNumber !== null &&
      userProfile.mobileNumber !== "" &&
      userProfile.mobileNumber?.length >= 10 &&
      userProfile.whatsAppNumber !== null &&
      userProfile.whatsAppNumber !== "" &&
      userProfile.pinCode !== null &&
      userProfile.pinCode !== "" &&
      userProfile.fatherName !== null &&
      userProfile.residenceAddress !== null &&
      userProfile.residenceAddress !== "" &&
      userProfile.permanentAddress !== null &&
      userProfile.permanentAddress !== "" &&
      userProfile.whatsAppNumber?.length >= 10 &&
      userProfile.fatherName !== "" &&
      userProfile.state !== null &&
      userProfile.state !== "" &&
      userProfile.panNumber !== null &&
      userProfile.panNumber !== "" &&
      userProfile.panNumber.length === 10 &&
      userProfile.city !== null &&
      userProfile.city !== ""
    ) {
      const response = profileupadate(userProfile,formData,category);
      response.then((data) => {
        console.log({data})
        if (data.request.status == 200) {
          Success("success", "Personal Details Saved Successfully");
          // save distance
          triggerSavingGoogleDistance(data.data.userId);
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else if (data.response.data.errorCode != "200") {
          WarningBackendApi("warning", data.response.data.errorMessage);
        }
      });
    } else {
      // console.log(
      //   userProfile.email,
      //   userProfile.firstName,
      //   userProfile.doberror,
      //   userProfile.mobileNumber,
      //   userProfile.mobileNumber?.length,
      //   userProfile.whatsAppNumber,
      //   userProfile.whatsAppNumber?.length,
      //   userProfile.pinCode,
      //   userProfile.fatherName,
      //   userProfile.state,
      //   userProfile.panNumber,
      //   userProfile.address,
      //   userProfile.city)
      console.log( userProfile.email !== null &&
      userProfile.email !== "" &&
      userProfile.firstName !== null &&
      userProfile.firstName !== "" &&
      userProfile.doberror === "" &&
      userProfile.mobileNumber !== null &&
      userProfile.mobileNumber !== "" &&
      userProfile.mobileNumber?.length >= 10 &&
      userProfile.whatsAppNumber !== null &&
      userProfile.whatsAppNumber !== "" &&
      userProfile.pinCode !== null &&
      userProfile.pinCode !== "" &&
      userProfile.fatherName !== null &&
      userProfile.residenceAddress !== null &&
      userProfile.residenceAddress !== "" &&
      userProfile.permanentAddress !== null &&
      userProfile.permanentAddress !== "" &&
      userProfile.whatsAppNumber?.length >= 10 &&
      userProfile.fatherName !== "" &&
      userProfile.state !== null &&
      userProfile.state !== "" &&
      userProfile.panNumber !== null &&
      userProfile.panNumber !== "" &&
      userProfile.panNumber.length === 10 &&
      userProfile.address !== null &&
      userProfile.address !== "" &&
      userProfile.city !== null &&
      userProfile.city !== "")
        console.log("fill the mandatory fields", userProfile)
      toastrWarning("fill the mandatory fields");
    }
  };

  useEffect(() => {
    const address = (userProfile.residenceAddress || "").trim();
    const pinCode = String(userProfile.pinCode || "").trim();
    const city = (userProfile.city || "").trim();
    const state = (userProfile.state || "").trim();

    if (!address || pinCode.length < 6 || !city || !state) {
      setAddressGeoStatus({ loading: false, lat: null, lng: null, message: "", valid: null });
      return;
    }

    setAddressGeoStatus({ loading: true, lat: null, lng: null, message: "Verifying address...", valid: null });

    const timer = setTimeout(async () => {
      try {
        const query = encodeURIComponent(`${address}, ${pinCode}, ${city}, ${state}, India`);
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=in`,
          { headers: { "Accept-Language": "en" } }
        );
        if (res.data && res.data.length > 0) {
          const { lat, lon, display_name } = res.data[0];
          setAddressGeoStatus({
            loading: false,
            lat: parseFloat(lat),
            lng: parseFloat(lon),
            message: `✓ Address verified — Lat: ${parseFloat(lat).toFixed(5)}, Lng: ${parseFloat(lon).toFixed(5)}`,
            valid: true,
            displayName: display_name,
          });
        } else {
          setAddressGeoStatus({ loading: false, lat: null, lng: null, message: "Address not found. Please check the address and pin code.", valid: false });
        }
      } catch (err) {
        console.error("Address geocoding failed", err);
        setAddressGeoStatus({ loading: false, lat: null, lng: null, message: "Failed to verify address. Please try again.", valid: false });
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [userProfile.residenceAddress, userProfile.pinCode, userProfile.city, userProfile.state]);

  const handleVerifyPan = async () => {
    if (!userProfile.panNumber || userProfile.panNumber.length !== 10) {
      setUserProfile((prev) => ({
        ...prev,
        panNumbererror: "Please enter a valid 10-digit PAN number",
      }));
      return;
    }
    if (!userProfile.firstName) {
      setUserProfile((prev) => ({
        ...prev,
        firstNamrror: "First name is required to verify PAN",
      }));
      return;
    }

    setIsVerifyingPan(true);
    setPanVerificationStatus("");
    try {
      const response = await axios.get(
        `${BASE_URL}/verifyPan?name=${encodeURIComponent(userProfile.firstName)}&pan=${encodeURIComponent(userProfile.panNumber)}`,
        {
          headers: {
            accessToken: sessionStorage.getItem("accessToken"),
          },
        }
      );
      if (response.status === 200 && (response.data?.valid === "true" || response.data?.valid === true || response.data?.valid === undefined)) {
        setIsPanVerified(true);
        setPanVerificationStatus("PAN card verified successfully!");
        if (response.data && response.data.registered_name) {
          setUserProfile((prev) => ({
            ...prev,
            firstName: response.data.registered_name,
            firstNamrror: "",
          }));
        }
        Swal.fire({
          icon: "success",
          title: "PAN Verified!",
          text: "Your PAN details are verified successfully.",
        });
      } else {
        setIsPanVerified(false);
        const errMsg = response.data?.message || response.data?.errorMessage || "PAN verification failed. Please check name and PAN.";
        setPanVerificationStatus(errMsg);
        Swal.fire({
          icon: "error",
          title: "PAN Verification Failed",
          text: errMsg,
        });
      }
    } catch (err) {
      console.log("Error verifying PAN", err);
      setIsPanVerified(false);
      const errMsg = err.response?.data?.errorMessage || "Error verifying PAN. Please try again.";
      setPanVerificationStatus(errMsg);
      Swal.fire({
        icon: "error",
        title: "PAN Verification Error",
        text: errMsg,
      });
    } finally {
      setIsVerifyingPan(false);
    }
  };

  const sendotp = async () => {
    verifybankAccountCashfree()
    setBankaccountProfile((bankaccountprofile) => ({
      ...bankaccountprofile,
      moblieNumbererror:
        bankaccountprofile.moblieNumber === "" ||
          bankaccountprofile.moblieNumber.length != 10
          ? "Enter 10 Digit Mobile Number "
          : "",

    }));

    if (
      bankaccountprofile.moblieNumber !== null &&
      bankaccountprofile.moblieNumber !== "" &&
      bankaccountprofile.moblieNumber.length == 10 &&
      bankaccountprofile.moblieNumber !== null &&
      bankaccountprofile.moblieNumber !== "" &&
      bankaccountprofile.accountNumber !== null &&
      bankaccountprofile.nameAtBank !== "" &&
      bankaccountprofile.nameAtBank !== null &&
      bankaccountprofile.accountNumber !== "" &&
      bankaccountprofile.confirmAccountNumber !== null &&
      bankaccountprofile.confirmAccountNumber !== "" &&
      bankaccountprofile.ifscCode !== null &&
      bankaccountprofile.ifscCode !== "" &&
      bankaccountprofile.bankName !== null &&
      bankaccountprofile.bankName !== "" &&
      bankaccountprofile.branchName !== null &&
      bankaccountprofile.branchName !== "" &&
      bankaccountprofile.confirmAccountNumbererror === "" &&
      bankaccountprofile.moblieNumber.length === 10 &&
      bankaccountprofile.bankCity !== null &&
      bankaccountprofile.bankCity !== ""
    ) {


      console.log(bankaccountprofile.moblieNumber,
        bankaccountprofile.moblieNumber,
        bankaccountprofile.accountNumber,
        bankaccountprofile.accountNumber,
        bankaccountprofile.confirmAccountNumber,
        bankaccountprofile.confirmAccountNumber,
        bankaccountprofile.ifscCode,
        bankaccountprofile.ifscCode,
        bankaccountprofile.bankName,
        bankaccountprofile.bankName,
        bankaccountprofile.branchName,
        bankaccountprofile.branchName,
        bankaccountprofile.confirmAccountNumbererror,
        bankaccountprofile.moblieNumber.length,
        bankaccountprofile.bankCity,
        bankaccountprofile.bankCity)
      const response = await sendMoblieOtp(bankaccountprofile);
      if (response.request.status === 200) {
        setdashboarddata({
          ...dashboarddata,
          sendotpbtn: true,
          verifyotp: true,
          sendotpbtnText: "ReSend OTP",
          sendOtpsession: response.data.mobileOtpSession,
          isValid: true,
          submitbankdeatail: true,
        });

        setBankaccountProfile({
          ...bankaccountprofile,
          mobileOtpSession: response.data.mobileOtpSession,
        });

        toastrSuccess("Otp Sent Successfully!", "top-right");
      } else {
        toastrWarning(response.response.data.errorMessage);
      }
    } else {
      console.log("fill bank profile")
      console.log(bankaccountprofile.moblieNumber,
        bankaccountprofile.moblieNumber,
        bankaccountprofile.accountNumber,
        bankaccountprofile.accountNumber,
        bankaccountprofile.confirmAccountNumber,
        bankaccountprofile.confirmAccountNumber,
        bankaccountprofile.ifscCode,
        bankaccountprofile.ifscCode,
        bankaccountprofile.bankName,
        bankaccountprofile.bankName,
        bankaccountprofile.branchName,
        bankaccountprofile.branchName,
        bankaccountprofile.confirmAccountNumbererror,
        bankaccountprofile.moblieNumber.length,
        bankaccountprofile.bankCity,
        bankaccountprofile.bankCity)
    }

    // verifybankAccountCashfree();
  };

  useEffect(() => {
    if (userProfile.pinCode.length == 6) {
      const response = handlepincodeapicall(userProfile.pinCode);
      response
        .then((data) => {
          if (data.request.status === 200 && data.data !== "") {
            setUserProfile({
              ...userProfile,
              state: data.data.state,
              city: data.data.city,
            });
          }
        })
        .catch((error) => {
          // Handle error if necessary
        });
    }
  }, [userProfile.pinCode]);
  const openTheActiveTabs = (type) => {
    if (type === "Kyc" && profileCompletionPct < 75) {
      Swal.fire({
        icon: "warning",
        title: "Profile Completion Under 75%",
        text: `Your profile is only ${profileCompletionPct}% complete. Please complete at least 75% of your profile details before uploading KYC.`,
        confirmButtonText: "Okay",
        confirmButtonColor: "#3d5ee1",
      });
      return;
    }
    var i, j;
    let tablinks = document.getElementsByClassName("nav-link");
    let tapPan = document.getElementsByClassName("tab-pane");

    for (i = 0; i < tablinks.length; i++) {
      if (tablinks[i].classList.contains(type)) {
        tablinks[i].classList.add("active");
      } else {
        tablinks[i].classList.remove("active");
      }
    }

    for (j = 0; j < tapPan.length; j++) {
      if (tapPan[j].classList.contains(type)) {
        tapPan[j].classList.add("active");
        tapPan[j].classList.add("show");
      } else {
        tapPan[j].classList.remove("active");
        tapPan[j].classList.remove("show");
      }
    }
  };

  useEffect(() => {
    const nomineresponse = loadlendernomineeDetails();
    nomineresponse.then((data) => {
      if (data.request.status == 200) {
        setnomineeDetails({
          ...nomineeDetails,
          nomineeName: data.data.name == null ? "" : data.data.name,
          relation: data.data.relation == null ? "" : data.data.relation,
          nomineeEmail: data.data.emial == null ? "" : data.data.emial,
          nomineeMobile:
            data.data.mobileNumber == null ? "" : data.data.mobileNumber,
          accountNo:
            data.data.accountNumber == null ? "" : data.data.accountNumber,
          nomineeIfsc: data.data.ifscCode == null ? "" : data.data.ifscCode,
          bank: data.data.bankName == null ? "" : data.data.bankName,
          branch: data.data.branchName == null ? "" : data.data.branchName,
          nomineecity: data.data.city == null ? "" : data.data.city,
        });
      }
    });
  }, []);

  useEffect(() => {
    getUserDetails().then((data) => {

      if (data.status == 200) {
      localStorage.setItem("userType", data.data.userDisplayId);
      console.log("data",data.data);
      setdashboarddata({
        ...dashboarddata,
        profileData: data,
      });
      
      // console.log("data",data.status);
      setUserProfile({
        ...userProfile,
        address: data.data.address,
        residenceAddress: data.data.address,
        city: data.data.city,
        dob: data.data.dob,
        facebookUrl: data.data.urlsDto.faceBookUrl,
        fatherName: data.data.fatherName,
        firstName: data.data.firstName,
        lastName: data.data.lastName,
        linkedinUrl: data.data.urlsDto.linkdinUrl,
        locality: data.data.locality,
        middleName: data.data.middleName,
        panNumber: data.data.panNumber,
        // residenceAddress:data.data.residenceAddress,
        permanentAddress: data.data.permanentAddress,
        pinCode: data.data.pinCode,
        state: data.data.state,
        twitterUrl: data.data.urlsDto.twitterUrl,
        whatsAppNumber: data.data.whatsAppNumber,
        aadharNumber: data.data.aadharNumber,
        mobileNumber: data.data.mobileNumber,
        email: data.data.email,
        studentOrNot: data.data.studentOrNot,
      

      });
      if (data.data.panStatus && data.data.panStatus.toUpperCase() === "VERIFIED") {
        setIsPanVerified(true);
        setPanVerificationStatus("PAN card verified successfully!");
      }
      console.log("Employemnt",data.data.employment)
      setCategory(data.data.studentOrNot==true?"STUDENT":data.data.employment);
      setFormData
({
        totalExperience: data.data.workExperience,
        company: data.data.companyName,
        salary: data.data.salary,
        country: data.data.country,
        universityName: data.data.universityName,
        universityLocation: data.data.location,
        // degree: data.data.degree,
      });
      setBankaccountProfile({
        ...bankaccountprofile,
        accountNumber: data.data.accountNumber,
        bankAddress: data.data.bankAddress,
        bankName: data.data.bankName,
        branchName: data.data.branchName,
        confirmAccountNumber: data.data.accountNumber,
        ifscCode: data.data.ifscCode,
        nameAtBank: data.data.userName,
        bankCity: data.data.bankAddress,
        moblieNumber: data.data.mobileNumber,
      });
      if (data.data.referenceDetailsResponseDto) {
        setReferenceDetails({
          reference1: data.data.referenceDetailsResponseDto.reference1 || "",
          reference2: data.data.referenceDetailsResponseDto.reference2 || "",
          reference3: data.data.referenceDetailsResponseDto.reference3 || "",
          reference4: data.data.referenceDetailsResponseDto.reference4 || "",
          reference5: data.data.referenceDetailsResponseDto.reference5 || "",
          reference6: data.data.referenceDetailsResponseDto.reference6 || "",
          reference7: data.data.referenceDetailsResponseDto.reference7 || "",
          reference8: data.data.referenceDetailsResponseDto.reference8 || "",
          loading: false,
          errors: {}
        });
      }
    }
    else{
console.log("data",data.status);
 if (data.status == 401) {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: response.response.data.errorMessage,
              confirmButtonText: "Go to Login",
            }).then((result) => {
              if (result.isConfirmed) {
                navigate("/");
              }
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: response.response.data.errorMessage,
              confirmButtonText: "OK",
            });
          }
    }
    });
  }, []);

  useEffect(() => {
    const loadSecureInfo = async () => {
      const response = await getBorrowerSecureInfo();
      if (response?.status == 200 && response?.data) {
        setSecureInfo((prev) => ({
          ...prev,
          aadharPassword: response.data.aadharPassword || "",
          panPassword: response.data.panPassword || "",
          bankStatementPassword: response.data.bankStatementPassword || "",
          companyAddress: response.data.companyAddress || "",
          designation: response.data.designation || "",
          cibilScore:
            response.data.cibilScore === null ||
            response.data.cibilScore === undefined
              ? ""
              : String(response.data.cibilScore),
          comments: response.data.comments || "",
          cibilPassword: response.data.cibilPassword || "",
          payslipsPassword: response.data.payslipsPassword || "",
        }));
      }
    };

    loadSecureInfo();
  }, []);

  useEffect(() => {
    const fetchApiData1 = () => {
      return getPanDoc();
    };
    const fetchApiData2 = () => {
      return getdataPassport();
    };
    const fetchApiData3 = () => {
      return getdatachequeLeaf();
    };
    const fetchApiData4 = () => {
      return getdataDrivingLicence();
    };
    const fetchApiData5 = () => {
      return getdataVoterId();
    };
    const fetchApiData6 = () => {
      return getdataAadhar();
    };
    const fetchApiData7=()=>{
      return getdataBankStatement();
    }

     const fetchApiData8=()=>{
      return getdatatenth();
    }
 const fetchApiData9=()=>{
      return getdataintermediate();
    }
     const fetchApiData10=()=>{
      return getdatagraduation();
    }
     const fetchApiData11=()=>{
      return getdataofferletter();
    }
     const fetchApiData12=()=>{
      return getdatafeereceipt();
    }
      const fetchApiData13=()=>{
        return getdatapayslips();
      }
      const fetchApiData14=()=>{
        return getPCreditReportDoc();
    }

    Promise.allSettled([
      fetchApiData1(),
      fetchApiData2(),
      fetchApiData3(),
      fetchApiData4(),
      fetchApiData5(),
      fetchApiData6(),
      fetchApiData7(),
      fetchApiData8(),
      fetchApiData9(),
      fetchApiData10(),
      fetchApiData11(),
      fetchApiData12(),
      fetchApiData13(),
      fetchApiData14(),
    ])
      .then((responses) => {
        console.log(responses[11].value.data);
        setKyc({
          ...kyc,
          PanCard: responses[0].value.data,
          Passport: responses[1].value.data,
          CHEQUELEAF: responses[2].value.data,
          DRIVINGLICENCE: responses[3].value.data,
          VOTERID: responses[4].value.data,
          aadhar: responses[5].value.data,
          bankStatement: responses[6].value.data,
          tenth: responses[7].value.data,
          intermediate: responses[8].value.data,
          graduation: responses[9].value.data,
          offerletter: responses[10].value.data,
          feereceipt: responses[11].value.data,
          paySlips: responses[12].value.data,
          creditReport: responses[13].value.data,
        });
      })
      .catch((error) => { });
  }, [kyc.isValid]);

  return (
    <>
      <div className="main-wrapper">
        {/* Header */}
        <BorrowerHeader />

        {/* Sidebar */}
        <BorrowerSidebar />

        {/* Page Wrapper */}

        <div className="page-wrapper">
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row">
                <div className="col">
                  <h3 className="page-title">Profile</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/borrowerDashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Profile</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* /Page Header */}
            <div className="row">
              <div className="col-md-12">
                <div className="profile-header">
                  <div className="row align-items-center">
                    <div className="col-auto profile-image">
                      <Link to="#">
                        <img
                          className="rounded-circle"
                          alt="User Image"
                          src="https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-512.png"
                        />
                      </Link>
                    </div>
                    <div className="col ms-md-n2 profile-user-info">
                      <h4 className="user-name mb-0">
                        {reduxStoreData.length != 0
                          ? reduxStoreData.firstName
                          : dashboarddata.profileData != null
                            ? dashboarddata.profileData.data.firstName
                            : ""}
                      </h4>
                      <h6 className="text-muted">
                        BR
                        {reduxStoreData.length != 0
                          ? reduxStoreData.userId
                          : dashboarddata.profileData != null
                            ? dashboarddata.profileData.data.userId
                            : "BR18"}
                        {`, ${
                          // reduxStoreData.length != 0
                          //   ? reduxStoreData.groupName
                          //   :
                             dashboarddata.profileData != null
                              ? dashboarddata.profileData.data.primaryType === "LENDER"
                                ? dashboarddata.profileData.data.groupName
                                : dashboarddata.profileData.data.primaryType
                              : ""
                        }`}
                      </h6>
                      <div className="user-Location">
                        <i className="fas fa-map-marker-alt" />{" "}
                        {reduxStoreData.length != 0
                          ? reduxStoreData.city
                          : dashboarddata.profileData != null
                            ? dashboarddata.profileData.data.city
                            : ""}
                      </div>
                      <div className="about-text">
                        {reduxStoreData.length != 0
                          ? reduxStoreData.address
                          : dashboarddata.profileData != null
                            ? dashboarddata.profileData.data.address
                            : ""}
                      </div>

                      {reduxStoreData.groupName != "NewLender" &&
                      reduxStoreDataDashboard?.validityDate != null ? (
                        <div className="user-Location my-1">
                          <i className="fa-solid fa-calendar-days" /> Validity :
                          {reduxStoreDataDashboard.validityDate}
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                    <div className="col-auto profile-btn">
                      <Link
                        className="btn btn-primary"
                        to="#"
                        onClick={(e) => {
                          openTheActiveTabs("Personal");
                        }}
                      >
                        <i className="far fa-edit me-1" /> Edit
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="profile-menu">
                  <ul className="nav nav-tabs nav-tabs-solid">
                    <li className="nav-item">
                      <Link
                        className="nav-link About active"
                        data-bs-toggle="tab"
                        to="#per_details_tab"
                      >
                        <i className="fa-regular fa-address-card"></i> About
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        className="nav-link Personal"
                        data-bs-toggle="tab"
                        to="#profile_tab"
                      >
                        <i className="fa-regular fa-user"></i> Profile Details
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link Bank"
                        data-bs-toggle="tab"
                        to="#bankAccount_tab"
                      >
                        <i className="fa-solid fa-building-columns"></i> Bank
                        Account Details
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        className="nav-link Nominee"
                        data-bs-toggle="tab"
                        to="#nominee_tab"
                      >
                        <i className="fa-solid fa-user-plus"></i> Nominee
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        className="nav-link Kyc"
                        data-bs-toggle={profileCompletionPct >= 75 ? "tab" : undefined}
                        to={profileCompletionPct >= 75 ? "#uploadKyc_tab" : "#"}
                        onClick={(e) => {
                          if (profileCompletionPct < 75) {
                            e.preventDefault();
                            Swal.fire({
                              icon: "warning",
                              title: "Profile Completion Under 75%",
                              text: `Your profile is only ${profileCompletionPct}% complete. Please complete at least 75% of your profile details before uploading KYC.`,
                              confirmButtonText: "Okay",
                              confirmButtonColor: "#3d5ee1",
                            });
                          }
                        }}
                      >
                        <i className="fa-solid fa-upload"></i> Upload KYC
                      </Link>
                    </li>

                    <li className="nav-item">
                      <Link
                        className="nav-link Kyc"
                        data-bs-toggle="tab"
                        to="#whatapp1"
                      >
                        <i class="fa fa-whatsapp"></i> Update Your Number
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link Secure"
                        data-bs-toggle="tab"
                        to="#secure_info_tab"
                      >
                        <i className="fa-solid fa-user-shield"></i> Secure Info
                      </Link>
                    </li>
                    <li className="nav-item">
                      <Link
                        className="nav-link References"
                        data-bs-toggle="tab"
                        to="#references_tab"
                      >
                        <i className="fa-solid fa-users"></i> Reference Details
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="tab-content profile-tab-cont">
                  {/* Personal Details Tab */}
                  <div
                    className="tab-pane fade show active"
                    id="per_details_tab"
                  >
                    {/* Personal Details */}
                    <div className="row">
                      <div className="col-lg-9">
                        <div className="card">
                          <div className="card-body">
                            <h5 className="card-title d-flex justify-content-between">
                              <span>Personal Details</span>

                              <Link
                                className="edit-link"
                                to="#"
                                onClick={(e) => {
                                  openTheActiveTabs("Personal");
                                }}
                              >
                                <i className="far fa-edit me-1" />
                                Edit
                              </Link>
                            </h5>
                            <div className="row">
                              <p className="col-sm-3 text-muted text-sm-end mb-0 mb-sm-3">
                                Name
                              </p>
                              <p className="col-sm-9">
                                {reduxStoreData.firstName}
                              </p>
                            </div>
                            <div className="row">
                              <p className="col-sm-3 text-muted text-sm-end mb-0 mb-sm-3">
                                Date of Birth
                              </p>
                              <p className="col-sm-9">{reduxStoreData.dob}</p>
                            </div>
                            <div className="row">
                              <p className="col-sm-3 text-muted text-sm-end mb-0 mb-sm-3">
                                Email ID
                              </p>
                              <p className="col-sm-9">{reduxStoreData.email}</p>
                            </div>
                            <div className="row">
                              <p className="col-sm-3 text-muted text-sm-end mb-0 mb-sm-3">
                                Mobile
                              </p>
                              <p className="col-sm-9">
                                {reduxStoreData.mobileNumber}
                              </p>
                            </div>
                            <div className="row">
                              <p className="col-sm-3 text-muted text-sm-end mb-0">
                                Address
                              </p>
                              <p className="col-sm-9 mb-0">
                                {reduxStoreData.address}
                                <br />

                                {reduxStoreData.city}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-3">
                        {/* Account Status */}
                        <div className="card">
                          <div className="card-body profile-blog">
                            <h5 className="card-title d-flex justify-content-between">
                              <span>Bank Account</span>
                              <Link
                                className="edit-link"
                                to="#"
                                onClick={(e) => {
                                  openTheActiveTabs("Bank");
                                }}
                              >
                                <i className="far fa-edit me-1" /> Edit
                              </Link>
                            </h5>
                          </div>
                        </div>
                        {/* /Account Status */}
                        {/* Skills */}
                        <div className="card">
                          <div className="card-body">
                            <h5 className="card-title d-flex justify-content-between">
                              <span>KYC </span>
                              <Link
                                className="edit-link"
                                to="#"
                                onClick={(e) => {
                                  openTheActiveTabs("Kyc");
                                }}
                              >
                                <i className="far fa-edit me-1" />
                                Edit
                              </Link>
                            </h5>
                          </div>
                        </div>
                        {/* /Skills */}
                        <div className="card">
                          <div className="card-body">
                            <h5 className="card-title d-flex justify-content-between">
                              <span>Nominee </span>
                              <Link
                                className="edit-link"
                                to="#"
                                onClick={(e) => {
                                  openTheActiveTabs("Nominee");
                                }}
                              >
                                <i className="far fa-edit me-1" />
                                Edit
                              </Link>
                            </h5>
                          </div>
                        </div>
                        <div className="card">
                          <div className="card-body">
                            <h5 className="card-title d-flex justify-content-between">
                              <span>Secure Info</span>
                              <Link
                                className="edit-link"
                                  to="#"
                                  onClick={(e) => {
                                    openTheActiveTabs("Secure");
                                  }}
                                >
                                  <i className="far fa-edit me-1" />
                                  Edit
                                </Link>
                              </h5>
                            </div>
                          </div>
                          <div className="card">
                            <div className="card-body">
                              <h5 className="card-title d-flex justify-content-between">
                                <span>Reference Details</span>
                                <Link
                                  className="edit-link"
                                  to="#"
                                  onClick={(e) => {
                                    openTheActiveTabs("References");
                                  }}
                                >
                                  <i className="far fa-edit me-1" />
                                  Edit
                                </Link>
                              </h5>
                            </div>
                          </div>
                      </div>
                    </div>
                    {/* /Personal Details */}
                  </div>
                  {/* /Personal Details Tab */}
                  {/* Change Password Tab */}
                  <div id="bankAccount_tab" className="tab-pane fade Bank">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title mb-4">Bank Account Details</h5>
                        <div className="row">
                          <div className="col-md-12 col-lg-12">
                            <div className="row g-3">
                              <div className="form-group col-12 col-md-4 local-forms mb-3">
                                <label>
                                  Name as Per Bank
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder=" Enter your Name"
                                  name="nameAtBank"
                                  onKeyPress={handleKeyPress}
                                  onChange={handlebankchange}
                                  value={bankaccountprofile.nameAtBank}
                                />
                                {bankaccountprofile.nameAtBankerror && (
                                  <div className="text-danger">
                                    {bankaccountprofile.nameAtBankerror}
                                  </div>
                                )}
                              </div>
                              <div className="form-group col-12 col-md-4 local-forms mb-3">
                                <label>
                                  Account Number
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="tel"
                                  className="form-control"
                                  name="accountNumber"
                                  onChange={handlebankchange}
                                  onKeyPress={handleKeyPressNumber}
                                  placeholder=" Enter your Account Number"
                                  maxLength={16}
                                  value={bankaccountprofile.accountNumber}
                                />
                                {bankaccountprofile.accountNumbererror && (
                                  <div className="text-danger">
                                    {bankaccountprofile.accountNumbererror}
                                  </div>
                                )}
                              </div>

                              <div className="form-group col-12 col-md-4 local-forms mb-3">
                                <label>
                                  Confirm Account Number
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="tel"
                                  className="form-control"
                                  name="confirmAccountNumber"
                                  onChange={handlebankchange}
                                  onKeyPress={handleKeyPressNumber}
                                  placeholder="Enter Confirm Account Number"
                                  onPaste={handlePaste}
                                  maxLength={16}
                                  onCopy={handleCopy}
                                  value={
                                    bankaccountprofile.confirmAccountNumber
                                  }
                                />
                                {bankaccountprofile.bankAccountError && (
                                  <span className="login-danger">
                                    {bankaccountprofile.bankAccountError}
                                  </span>
                                )}
                                {nomineeDetails.copyerror && (
                                  <span className="login-danger">
                                    {nomineeDetails.copyerror}
                                  </span>
                                )}
                                {bankaccountprofile.confirmAccountNumbererror && (
                                  <div className="text-danger">
                                    {
                                      bankaccountprofile.confirmAccountNumbererror
                                    }
                                  </div>
                                )}
                              </div>

                              <div className="form-group col-12 col-md-4 local-forms mb-3">
                                <label>
                                  IFSC Code
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="ifscCode"
                                  onChange={handlebankchange}
                                  placeholder=" Enter your IFSC Code"
                                  maxLength={12}
                                  value={bankaccountprofile.ifscCode}
                                />
                                {bankaccountprofile.ifscCodeerror && (
                                  <div className="text-danger">
                                    {bankaccountprofile.ifscCodeerror}
                                  </div>
                                )}
                              </div>

                              <div className="form-group col-12 col-md-4 local-forms mb-3">
                                <label>
                                  Bank Name
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="bankName"
                                  onChange={handlebankchange}
                                  onKeyPress={handleKeyPress}
                                  placeholder=" Enter your Bank Name"
                                  value={bankaccountprofile.bankName}
                                />
                                {bankaccountprofile.bankNameerror && (
                                  <div className="text-danger">
                                    {bankaccountprofile.bankNameerror}
                                  </div>
                                )}
                              </div>

                              <div className="form-group col-12 col-md-4 local-forms mb-3">
                                <label>
                                  Branch
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="branchName"
                                  placeholder=" Enter your Branch"
                                  onKeyPress={handleKeyPress}
                                  onChange={handlebankchange}
                                  value={bankaccountprofile.branchName}
                                />
                                {bankaccountprofile.branchNameerror && (
                                  <div className="text-danger">
                                    {bankaccountprofile.branchNameerror}
                                  </div>
                                )}
                              </div>

                              <div className="form-group col-12 col-md-4 local-forms mb-3">
                                <label>
                                  Bank city{" "}
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="bankCity"
                                  placeholder=" Enter your Bank City"
                                  onChange={handlebankchange}
                                  onKeyPress={handleKeyPress}
                                  value={bankaccountprofile.bankCity}
                                />
                                {bankaccountprofile.bankCityerror && (
                                  <div className="text-danger">
                                    {bankaccountprofile.bankCityerror}
                                  </div>
                                )}
                              </div>

                              <div className="form-group col-12 col-md-4 local-forms mb-3">
                                <label>
                                  Mobile Number
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="tel"
                                  className="form-control"
                                  name="moblieNumber"
                                  placeholder=" Enter your Mobile Number"
                                  onChange={handlebankchange}
                                  maxLength={10}
                                  onKeyPress={handleKeyPressNumber}
                                  value={bankaccountprofile.moblieNumber}
                                />
                                {bankaccountprofile.moblieNumbererror && (
                                  <div className="text-danger">
                                    {bankaccountprofile.moblieNumbererror}
                                  </div>
                                )}
                              </div>

                              {dashboarddata.isValid && (
                                <div className="form-group col-12 col-md-4 local-forms mb-3">
                                  <label>
                                    Otp <span className="login-danger">*</span>
                                  </label>
                                  <input
                                    type="tel"
                                    className="form-control"
                                    name="mobileOtp"
                                    placeholder=" Enter your Mobile otp"
                                    onChange={handlebankchange}
                                    value={bankaccountprofile.mobileOtp}
                                    maxLength={6}
                                  />
                                </div>
                              )}

                              <div className="col-12 row">
                                {/* {dashboarddata.verifyotp && (
                                  <>
                                    <button
                                      className="btn btn-warning col-md-2 mx-2"
                                      style={{ color: "white" }}
                                      type="submit"
                                      onClick={verifybankAccountCashfree}
                                    > */}
                                {/* {dashboarddata.verifyotpText} */}
                                {/* Verify IFSC */}
                                {/* </button>
                                  </>
                                )}     */}
                                {dashboarddata.sendotpbtn && (
                                  <button
                                    className="btn btn-secondary col-md-2 mx-2"
                                    type="submit"
                                    onClick={sendotp}
                                  >
                                    {dashboarddata.sendotpbtnText}
                                  </button>
                                )}

                                {dashboarddata.submitbankdeatail && (
                                  <button
                                    className="btn btn-success col-md-2 mx-2"
                                    type="submit"
                                    onClick={savebankdetailsProfile}
                                  >
                                    Save Details
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* /Change Password Tab */}
                  {/* Change Nominee Tab */}
                  <div id="nominee_tab" className="tab-pane fade Nominee">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">Nominee Details</h5>
                        <br />
                        <div className="row">
                          <div className="col-md-12 col-lg-12">
                            <form action="#">
                              <div className="row">
                                <div className="form-group col-12 col-md-4 local-forms">
                                  <label>
                                    Nominee Name
                                    <span className="login-danger">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder=" Enter your Nominee Name"
                                    onKeyPress={handleKeyPress}
                                    value={nomineeDetails.nomineeName}
                                    name="nomineeName"
                                    onChange={handlerNominee}
                                  />
                                  {nomineeDetails.nomineeNameerror && (
                                    <div className="error">
                                      {nomineeDetails.nomineeNameerror}
                                    </div>
                                  )}
                                </div>
                                <div className="form-group col-12 col-md-4 local-forms">
                                  <label>
                                    Relation
                                    <span className="login-danger">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder=" Enter your  Relation"
                                    onKeyPress={handleKeyPress}
                                    value={nomineeDetails.relation}
                                    name="relation"
                                    onChange={handlerNominee}
                                  />
                                  {nomineeDetails.relationerror && (
                                    <div className="error">
                                      {nomineeDetails.relationerror}
                                    </div>
                                  )}
                                </div>
                                <div className="form-group col-12 col-md-4 local-forms">
                                  <label>
                                    Nominee Email
                                    <span className="login-danger">*</span>
                                  </label>
                                  <input
                                    type="email"
                                    className="form-control"
                                    placeholder=" Enter  Nominee Email"
                                    value={nomineeDetails.nomineeEmail}
                                    name="nomineeEmail"
                                    onChange={handlerNominee}
                                  />
                                  {nomineeDetails.nomineeEmaileeror && (
                                    <div className="error">
                                      {nomineeDetails.nomineeEmaileeror}
                                    </div>
                                  )}
                                </div>
                                <div className="form-group col-12 col-md-4 local-forms">
                                  <label>
                                    Nominee Mobile Number
                                    <span className="login-danger">*</span>
                                  </label>
                                  <input
                                    type="tel"
                                    maxLength={10}
                                    className="form-control"
                                    placeholder=" Enter  Nominee mobile no "
                                    value={nomineeDetails.nomineeMobile}
                                    name="nomineeMobile"
                                    onKeyPress={handleKeyPressNumber}
                                    onChange={handlerNominee}
                                  />

                                  {nomineeDetails.nomineeMobileerror && (
                                    <div className="error">
                                      {nomineeDetails.nomineeMobileerror}
                                    </div>
                                  )}
                                </div>

                                <div className="form-group col-12 col-md-4 local-forms">
                                  <label>
                                    Nominee Account No
                                    <span className="login-danger">*</span>
                                  </label>
                                  <input
                                    type="tel"
                                    className="form-control"
                                    placeholder="  Nominee Name Account No"
                                    value={nomineeDetails.accountNo}
                                    name="accountNo"
                                    onKeyPress={handleKeyPressNumber}
                                    maxLength={18}
                                    onChange={handlerNominee}
                                  />
                                  {nomineeDetails.accountNoerror && (
                                    <div className="error">
                                      {nomineeDetails.accountNoerror}
                                    </div>
                                  )}
                                </div>
                                <div className="form-group col-12 col-md-4 local-forms">
                                  <label>
                                    Nominee IFSC Code
                                    <span className="login-danger">*</span>
                                  </label>
                                  <input
                                    type="tel"
                                    className="form-control"
                                    placeholder="Nominee IFSC Code"
                                    value={nomineeDetails.nomineeIfsc}
                                    name="nomineeIfsc"
                                    maxLength={11}
                                    onChange={handlerNominee}
                                  />

                                  {nomineeDetails.nomineeIfscerror && (
                                    <div className="error">
                                      {nomineeDetails.nomineeIfscerror}
                                    </div>
                                  )}
                                </div>
                                <div className="form-group col-12 col-md-4 local-forms">
                                  <label>
                                    Nominee Bank Name
                                    <span className="login-danger">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder=" Nominee Bank Name"
                                    onKeyPress={handleKeyPress}
                                    value={nomineeDetails.bank}
                                    name="bank"
                                    onChange={handlerNominee}
                                  />

                                  {nomineeDetails.bankerror && (
                                    <div className="error">
                                      {nomineeDetails.bankerror}
                                    </div>
                                  )}
                                </div>

                                <div className="form-group col-12 col-md-4 local-forms">
                                  <label>
                                    Nominee City
                                    <span className="login-danger">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder=" Nominee City Name"
                                    onKeyPress={handleKeyPress}
                                    value={nomineeDetails.nomineecity}
                                    name="nomineecity"
                                    onChange={handlerNominee}
                                  />
                                  {nomineeDetails.nomineecityerror && (
                                    <div className="error">
                                      {nomineeDetails.nomineecityerror}
                                    </div>
                                  )}
                                </div>
                                <div className="form-group col-12 col-md-4 local-forms">
                                  <label>
                                    Branch
                                    <span className="login-danger">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nominee Branch"
                                    onKeyPress={handleKeyPress}
                                    value={nomineeDetails.branch}
                                    name="branch"
                                    onChange={handlerNominee}
                                  />
                                  {nomineeDetails.brancherror && (
                                    <div className="error">
                                      {nomineeDetails.brancherror}
                                    </div>
                                  )}
                                </div>

                                <div className="row col-12">
                                  <button
                                    className="btn btn-success col-12 col-md-2"
                                    type="submit"
                                    // disabled={nomineeDetails.isbtndisable}

                                    onClick={() => handleNomineeclick(event)}
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Change Nominee Tab */}
                  {/* ///profile Tab */}
                  <div id="profile_tab" className="tab-pane fade Personal">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">Personal Details</h5>
                        <div className="row">
                          <div className="col-md-12 col-lg-12 row">
                            <div className="row mt-3">
                              <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                  First Name
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Enter First Name"
                                  onKeyPress={handleKeyPress}
                                  onChange={handlechange}
                                  value={userProfile.firstName}
                                  name="firstName"
                                />
                                {userProfile.firstNamrror && (
                                  <div className="text-danger">
                                    {userProfile.firstNamrror}
                                  </div>
                                )}
                              </div>
                              <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                  Last Name
                                  <span className="login-danger"></span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Enter Last Name"
                                  onKeyPress={handleKeyPress}
                                  onChange={handlechange}
                                  value={userProfile.lastName}
                                  name="lastName"
                                />
                                {userProfile.lastNamerror && (
                                  <div className="text-danger">
                                    {userProfile.lastNamerror}
                                  </div>
                                )}
                              </div>
                              <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                  Pan Number
                                  <span className="login-danger">*</span>
                                </label>
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter PAN Number"
                                    onChange={handlechange}
                                    value={userProfile.panNumber}
                                    maxLength={10}
                                    readOnly={isPanVerified}
                                    name="panNumber"
                                    style={{ textTransform: "uppercase" }}
                                  />
                                  <button
                                    className={`btn ${isPanVerified ? "btn-success" : "btn-primary"}`}
                                    type="button"
                                    onClick={handleVerifyPan}
                                    disabled={isVerifyingPan || isPanVerified}
                                    style={{ zIndex: 100 }}
                                  >
                                    {isVerifyingPan ? (
                                      <>
                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                        Verifying...
                                      </>
                                    ) : isPanVerified ? (
                                      "Verified"
                                    ) : (
                                      "Verify"
                                    )}
                                  </button>
                                </div>

                                {userProfile.panNumbererror && (
                                  <div className="text-danger mt-1 small">
                                    {userProfile.panNumbererror}
                                  </div>
                                )}
                                {panVerificationStatus && (
                                  <div className={`mt-1 small ${isPanVerified ? "text-success" : "text-danger"}`}>
                                    {panVerificationStatus}
                                  </div>
                                )}
                              </div>
                              <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                  Aadhaar Number
                                  <span className="login-danger"></span>
                                </label>
                                <input
                                  type="tel"
                                  className="form-control"
                                  placeholder="Enter Aadhaar Number"
                                  onChange={handlechange}
                                  value={userProfile.aadharNumber}
                                  maxLength={12}
                                  name="aadharNumber"
                                />
                                {userProfile.aadhaarNumbererror && (
                                  <div className="text-danger">
                                    {userProfile.aadhaarNumbererror}
                                  </div>
                                )}
                                {/* {userProfile.aadharerror != "" ? (
                                  <div className="error">
                                    {userProfile.aadharerror}
                                  </div>
                                ) : (
                                  <></>
                                )} */}
                              </div>

                              <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                  Date of Birth
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type={userProfile.dob == "" ? "date" : "text"}
                                  className="form-control "
                                  // onChange={handlechange}
                                  value={userProfile.dob}
                                  maxLength={10}
                                  name="dob"
                                  max={new Date().toISOString().split("T")[0]}
                                />

                                {userProfile.doberror && (
                                  <div className="text-danger">
                                    {userProfile.doberror}
                                  </div>
                                )}
                              </div>

                              <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                  Father Name
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  onKeyPress={handleKeyPress}
                                  placeholder="Enter Father Name"
                                  onChange={handlechange}
                                  value={userProfile.fatherName}
                                  name="fatherName"
                                />
                                {userProfile.fatherNameerror && (
                                  <div className="text-danger">
                                    {userProfile.fatherNameerror}
                                  </div>
                                )}
                              </div>
                              <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                  Mobile No
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="tel"
                                  maxLength={10}
                                  className="form-control"
                                  placeholder="Enter Mobile Name"
                                  // onChange={handlechange}
                                  onKeyPress={handleKeyPressNumber}
                                  value={userProfile.mobileNumber}
                                  name="mobileNumber"
                                />
                                {userProfile.mobileNumbererror && (
                                  <div className="text-danger">
                                    {userProfile.mobileNumbererror}
                                  </div>
                                )}
                              </div>
                              <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                  WhatsApp No
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="tel"
                                  maxLength={12}
                                  className="form-control"
                                  placeholder="Enter WhatsApp "
                                  onChange={handlechange}
                                  onKeyPress={handleKeyPressNumber}
                                  value={userProfile.whatsAppNumber}
                                  name="whatsAppNumber"
                                />
                                {userProfile.whatsAppNumbererror && (
                                  <div className="text-danger">
                                    {userProfile.whatsAppNumbererror}
                                  </div>
                                )}
                              </div>
                              <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                  Email ID
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="email"
                                  className="form-control"
                                  placeholder="Enter Email Id"
                                  // onChange={handlechange}
                                  value={userProfile.email}
                                  name="email"
                                />

                                {userProfile.emailerror && (
                                  <div className="text-danger">
                                    {userProfile.emailerror}
                                  </div>
                                )}
                              </div>

                              <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                  Residence Address
                                  <span className="login-danger"> *</span>
                                </label>
                                <textarea
                                  type="text"
                                  className="form-control"
                                  placeholder="Enter Residence Address"
                                  onChange={handlechange}
                                  value={userProfile.residenceAddress}
                                  name="residenceAddress"
                                />
                                {userProfile.residenceAddresserror && (
                                  <div className="text-danger">
                                    {userProfile.residenceAddresserror}
                                  </div>
                                )}
                                {addressGeoStatus.loading && (
                                  <div className="text-muted small mt-1">
                                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                    Verifying address...
                                  </div>
                                )}
                                {!addressGeoStatus.loading && addressGeoStatus.message && (
                                  <div className={`mt-1 small ${addressGeoStatus.valid === true ? "text-success" : "text-danger"}`}>
                                    {addressGeoStatus.message}
                                    {addressGeoStatus.valid === true && addressGeoStatus.displayName && (
                                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>{addressGeoStatus.displayName}</div>
                                    )}
                                  </div>
                                )}

                                {/* ✅ Checkbox */}
                                <div className="form-check mt-2">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="sameAddress"
                                    checked={userProfile.sameAsResidence}
                                    onChange={(e) => {
                                      const isChecked = e.target.checked;
                                      setUserProfile((prev) => ({
                                        ...prev,
                                        sameAsResidence: isChecked,
                                        permanentAddress: isChecked
                                          ? prev.residenceAddress
                                          : "",
                                      }));
                                    }}
                                  />
                                  same as Residence address
                                </div>
                              </div>

                              <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                  Permanent Address
                                  <span className="login-danger">*</span>
                                </label>
                                <textarea
                                  type="text"
                                  className="form-control"
                                  placeholder="Enter Permanent Address"
                                  onChange={handlechange}
                                  value={userProfile.permanentAddress}
                                  name="permanentAddress"
                                  disabled={userProfile.sameAsResidence} // Disable if checkbox is checked
                                />
                                {userProfile.permanentAddresserror && (
                                  <div className="text-danger">
                                    {userProfile.permanentAddresserror}
                                  </div>
                                )}
                              </div>

                              {/* <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                  Pin Code
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Enter Pincode"
                                  maxLength={6}
                                  onChange={handlechange}
                                  value={userProfile.pinCode}
                                  name="pinCode"
                                />
                                {userProfile.pinCodeerror && (
                                  <div className="text-danger">
                                    {userProfile.pinCodeerror}
                                  </div>
                                )}
                              </div>
                              <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                  Locality
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Enter Locality "
                                  onChange={handlechange}
                                  value={userProfile.address}
                                  name="address"
                                />
                                {userProfile.addresserror && (
                                  <div className="text-danger">
                                    {userProfile.addresserror}
                                  </div>
                                )}
                              </div> */}

                              <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                  Pin Code{" "}
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Enter Pincode"
                                  maxLength={6}
                                  onKeyPress={handleKeyPressNumber}
                                  onChange={handlechange}
                                  value={userProfile.pinCode}
                                  name="pinCode"
                                />
                                {userProfile.pinCodeerror && (
                                  <div className="text-danger">
                                    {userProfile.pinCodeerror}
                                  </div>
                                )}
                              </div>

                              {/* Locality Dropdown */}
                              <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                  Locality{" "}
                                  <span className="login-danger">*</span>
                                </label>
                                <select
                                  className="form-control"
                                  name="locality"
                                  value={userProfile.locality}
                                  onChange={handlechange}
                                >
                                  <option value="">Select Locality</option>
                                  {localityOptions.map((loc, index) => (
                                    <option key={index} value={loc}>
                                      {loc}
                                    </option>
                                  ))}
                                </select>
                                {userProfile.localityerror && (
                                  <div className="text-danger">
                                    {userProfile.localityerror}
                                  </div>
                                )}
                              </div>
                              <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                  City <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Enter City "
                                  onKeyPress={handleKeyPress}
                                  onChange={handlechange}
                                  value={userProfile.city}
                                  name="city"
                                />
                                {userProfile.cityer && (
                                  <div className="text-danger">
                                    {userProfile.cityer}
                                  </div>
                                )}
                              </div>
                              <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                  State
                                  <span className="login-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Enter State"
                                  onChange={handlechange}
                                  onKeyPress={handleKeyPress}
                                  value={userProfile.state}
                                  name="state"
                                />
                                {userProfile.stateerror && (
                                  <div className="text-danger">
                                    {userProfile.stateerror}
                                  </div>
                                )}
                              </div>
                              <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                  Facebook URL
                                  <span className="login-danger"></span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Enter Facebook Url"
                                  onChange={handlechange}
                                  value={userProfile.facebookUrl}
                                  name="facebookUrl"
                                />
                              </div>

                              <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                  Twitter URL
                                  <span className="login-danger"></span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Enter Twitter Url"
                                  onChange={handlechange}
                                  value={userProfile.twitterUrl}
                                  name="twitterUrl"
                                />
                              </div>

                              <div className="form-group col-12 col-sm-4 local-forms">
                                <label>
                                  Linkedin URL
                                  <span className="login-danger"></span>
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Enter Linkedin  Url"
                                  onChange={handlechange}
                                  value={userProfile.linkedinUrl}
                                  name="linkedinUrl"
                                />
                              </div>

                              <div className="form-group">
                                <label>
                                  <strong>Borrower Category</strong>
                                </label>

                                {/* Radio Buttons Row */}
                                <div className="d-flex gap-4 mb-3">
                                  <div className="form-check">
                                    <input
                                      type="radio"
                                      name="category"
                                      value="SALARIED"
                                      className="form-check-input"
                                      id="salaried"
                                      onChange={handleCategoryChange}
                                      checked={category === "SALARIED"}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor="salaried"
                                    >
                                      Salaried
                                    </label>
                                  </div>
                                  <div className="form-check">
                                    <input
                                      type="radio"
                                      name="category"
                                      value="SELFEMPLOYED"
                                      className="form-check-input"
                                      id="selfEmployed"
                                      onChange={handleCategoryChange}
                                      checked={category === "SELFEMPLOYED"}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor="selfEmployed"
                                    >
                                      Self Employed
                                    </label>
                                  </div>
                                  <div className="form-check">
                                    <input
                                      type="radio"
                                      name="category"
                                      value="STUDENT"
                                      className="form-check-input"
                                      id="student"
                                      onChange={handleCategoryChange}
                                      checked={category === "STUDENT"}
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor="student"
                                    >
                                      Student
                                    </label>
                                  </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                  <div className="text-danger mb-3">
                                    {error}
                                  </div>
                                )}

                                {/* Conditional Input Fields in a Row */}
                                <div className="row">
                                  {category === "SALARIED" && (
                                    <>
                                      <div className="col-md-4 mb-2">
                                        <input
                                          type="text"
                                          name="totalExperience"
                                          placeholder="Total Experience"
                                          className="form-control"
                                          onChange={handleChange}
                                          onKeyPress={handleKeyPressNumber}
                                          value={formData.totalExperience}
                                        />
                                      </div>
                                      <div className="col-md-4 mb-2">
                                        <input
                                          type="text"
                                          name="company"
                                          placeholder="Company"
                                          className="form-control"
                                          onChange={handleChange}
                                          value={formData.company}
                                        />
                                      </div>
                                      <div className="col-md-4 mb-2">
                                        <input
                                          type="text"
                                          name="salary"
                                          placeholder="Salary"
                                          className="form-control"
                                          onChange={handleChange}
                                          onKeyPress={handleKeyPressNumber}
                                          value={formData.salary}
                                        />
                                      </div>
                                    </>
                                  )}

                                  {category === "SELFEMPLOYED" && (
                                    <>
                                      <div className="col-md-4 mb-2">
                                        <input
                                          type="text"
                                          name="totalExperience"
                                          placeholder="Total Experience"
                                          className="form-control"
                                          onChange={handleChange}
                                          onKeyPress={handleKeyPressNumber}
                                          value={formData.totalExperience}
                                        />
                                      </div>
                                      <div className="col-md-4 mb-2">
                                        <input
                                          type="text"
                                          name="company"
                                          placeholder="Organization"
                                          className="form-control"
                                          onChange={handleChange}
                                          value={formData.company}
                                        />
                                      </div>
                                      <div className="col-md-4 mb-2">
                                        <input
                                          type="text"
                                          name="salary"
                                          placeholder="Income"
                                          className="form-control"
                                          onChange={handleChange}
                                          onKeyPress={handleKeyPressNumber}
                                          value={formData.salary}
                                        />
                                      </div>
                                    </>
                                  )}

                                  {category === "STUDENT" && (
                                    <>
                                      <div className="col-md-4 mb-2">
                                        <input
                                          type="text"
                                          name="country"
                                          placeholder="Country"
                                          className="form-control"
                                          onChange={handleChange}
                                          value={formData.country}
                                        />
                                      </div>
                                      <div className="col-md-4 mb-2">
                                        <input
                                          type="text"
                                          name="universityName"
                                          placeholder="University Name"
                                          className="form-control"
                                          onChange={handleChange}
                                          value={formData.universityName}
                                        />
                                      </div>
                                      <div className="col-md-4 mb-2">
                                        <input
                                          type="text"
                                          name="universityLocation"
                                          placeholder="University Location"
                                          className="form-control"
                                          onChange={handleChange}
                                          value={formData.universityLocation}
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>

                                {/* <button className="btn btn-primary mt-3" onClick={handleSubmit}>Submit</button> */}
                              </div>
                              <div className="col-12 ">
                                <button
                                  className="btn btn-primary col-md-4 col-12"
                                  type="submit"
                                  onClick={handleprofileUpdate}
                                >
                                  Save Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* ///profile Tab */}

                  {/* KycTab */}

                  <div id="uploadKyc_tab" className="tab-pane fade Kyc">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">Upload KYC</h5>
                        <div className="row">
                          <div className="col-md-12 col-lg-12 row">
                            <div className="row mt-3">
                              <div className="form-group col-12 col-md-6">
                                <p className="settings-label">
                                  Pan Card <span className="star-red">*</span>
                                </p>
                                <div className="settings-btn">
                                  <input
                                    type="file"
                                    name="pan"
                                    id="pan"
                                    className="hide-input"
                                    onChange={handlefileupload}
                                  />
                                  <label htmlFor="pan" className="upload">
                                    <i className="feather-upload">
                                      <FeatherIcon icon="upload" />
                                    </i>
                                  </label>
                                </div>

                                {kyc.PanCard != undefined &&
                                kyc.PanCard != "" ? (
                                  <h6 className="settings-size text-success">
                                    <i className="fa-solid fa-check mx-lg-1 "></i>
                                    <small>{kyc.PanCard.fileName}</small>
                                  </h6>
                                ) : (
                                  <h6 className="settings-size text-warning">
                                    <i className="fa-solid fa-upload mx-lg-1 "></i>
                                    <small>Upload Pan</small>
                                  </h6>
                                )}
                              </div>
                              <div className="form-group col-12 col-md-6">
                                <p className="settings-label">
                                  Credit Report <span className="star-red">*</span>
                                </p>
                                <div className="settings-btn">
                                  <input
                                    type="file"
                                    name="creditReport"
                                    id="creditReport"
                                    className="hide-input"
                                    onChange={handlefileupload}
                                  />
                                  <label htmlFor="creditReport" className="upload">
                                    <i className="feather-upload">
                                      <FeatherIcon icon="upload" />
                                    </i>
                                  </label>
                                </div>

                                {kyc.creditReport != undefined &&
                                kyc.creditReport != "" ? (
                                  <h6 className="settings-size text-success">
                                    <i className="fa-solid fa-check mx-lg-1 "></i>
                                    <small>{kyc.creditReport.fileName}</small>
                                  </h6>
                                ) : (
                                  <h6 className="settings-size text-warning">
                                    <i className="fa-solid fa-upload mx-lg-1 "></i>
                                    <small>Upload Credit Report</small>
                                  </h6>
                                )}
                              </div>

                              <div className="form-group col-12 col-md-6">
                                <p className="settings-label">
                                  Cheque Leaf
                                  <span className="star-red">*</span>
                                </p>
                                <div className="settings-btn">
                                  <input
                                    type="file"
                                    name="CHEQUELEAF"
                                    accept="image/*"
                                    id="CHEQUELEAF"
                                    className="hide-input"
                                    onChange={handlefileupload}
                                  />
                                  <label
                                    htmlFor="CHEQUELEAF"
                                    className="upload"
                                  >
                                    <i className="feather-upload">
                                      <FeatherIcon icon="upload" />
                                    </i>
                                  </label>
                                </div>
                                {kyc.CHEQUELEAF != undefined &&
                                kyc.CHEQUELEAF != "" ? (
                                  <h6 className="settings-size text-success">
                                    <i className="fa-solid fa-check mx-lg-1 "></i>
                                    <small>{kyc.CHEQUELEAF.fileName}</small>
                                  </h6>
                                ) : (
                                  <h6 className="settings-size text-warning">
                                    <i className="fa-solid fa-upload mx-lg-1 "></i>
                                    <small>Upload Cheque Leaf</small>
                                  </h6>
                                )}
                              </div>

                              <div className="form-group col-12 col-md-6">
                                <p className="settings-label">
                                  Bank Statement (6 Months)
                                  <span className="star-red">*</span>
                                </p>
                                <div className="settings-btn">
                                  <input
                                    type="file"
                                    name="BANKSTATEMENT"
                                    id="bankStatment"
                                    className="hide-input"
                                    onChange={handlefileupload}
                                  />
                                  <label
                                    htmlFor="bankStatment"
                                    className="upload"
                                  >
                                    <i className="feather-upload">
                                      <FeatherIcon icon="upload" />
                                    </i>
                                  </label>
                                </div>

                                {kyc.bankStatement != undefined &&
                                <kyc className="bankStatement"></kyc> != "" ? (
                                  <h6 className="settings-size text-success">
                                    <i className="fa-solid fa-check mx-lg-1 "></i>
                                    <small>{kyc.bankStatement.fileName}</small>
                                  </h6>
                                ) : (
                                  <h6 className="settings-size text-warning">
                                    <i className="fa-solid fa-upload mx-lg-1 "></i>
                                    <small>Upload Bank Statment</small>
                                  </h6>
                                )}
                              </div>

                              <div className="form-group col-12 col-md-6">
                                <p className="settings-label">
                                  Latest Pay slips (latest payslips 6 months)
                                  <span className="star-red">*</span>
                                </p>
                                <div className="settings-btn">
                                  <input
                                    type="file"
                                    name="PAYSLIPS"
                                    id="paySlips"
                                    className="hide-input"
                                    onChange={handlefileupload}
                                  />
                                  <label htmlFor="paySlips" className="upload">
                                    <i className="feather-upload">
                                      <FeatherIcon icon="upload" />
                                    </i>
                                  </label>
                                </div>
                                {kyc.paySlips != undefined &&
                                kyc.paySlips != "" ? (
                                  <h6 className="settings-size text-success">
                                    <i className="fa-solid fa-check mx-lg-1 "></i>
                                    <small>{kyc.paySlips.fileName}</small>
                                  </h6>
                                ) : (
                                  <h6 className="settings-size text-warning">
                                    <i className="fa-solid fa-upload mx-lg-1 "></i>
                                    <small>Upload Pay Slips</small>
                                  </h6>
                                )}
                              </div>

                              {/* <div className="form-group col-12 col-md-3">
                                <button className="btn btn-success" onClick={() => handleviewCredit()}>View Credit Report</button>
                              </div>
                              {viewdocment && <>

                                <h6>OxyScore : <span style={{ fontWeight: '300' }}> {uploddata.oxyScore}</span></h6>
                                <h6>Credit Report Link : <a href={uploddata.experianFilePath}  ><span className="badge btn-primary" style={{ fontWeight: '300' }}>Download Credit Report</span></a></h6>
                                <h6>Review Comments : <span style={{ fontWeight: '300' }}> {uploddata.comments}</span></h6>
                                <h6>Document Password : <span style={{ fontWeight: '300' }}> {uploddata.password}</span></h6>
                                <h6>Risk Category : <span style={{ fontWeight: '300' }}> {uploddata.riskCategory != null ? uploddata.riskCategory : "D"}</span></h6>
                              </>} */}
                            </div>
                          </div>
                        </div>

                        <h5 className="card-title">Address Proof Documents</h5>
                        <span className="settings-label">
                          (NOTE: Upload any one of the documents given below)
                        </span>

                        <div className="row">
                          <div className="col-md-12 col-lg-12 row">
                            <div className="row mt-3">
                              <div className="form-group col-12 col-md-6">
                                <p className="settings-label">
                                  Driving Licence{" "}
                                  <span className="star-red">*</span>
                                </p>
                                <div className="settings-btn">
                                  <input
                                    type="file"
                                    name="DRIVINGLICENCE"
                                    id="drivingLicence"
                                    className="hide-input"
                                    onChange={handlefileupload}
                                  />
                                  <label
                                    htmlFor="drivingLicence"
                                    className="upload"
                                  >
                                    <i className="feather-upload">
                                      <FeatherIcon icon="upload" />
                                    </i>
                                  </label>
                                </div>

                                {kyc.DRIVINGLICENCE != undefined &&
                                kyc.DRIVINGLICENCE != "" ? (
                                  <h6 className="settings-size text-success">
                                    <i className="fa-solid fa-check mx-lg-1 "></i>
                                    <small>{kyc.DRIVINGLICENCE.fileName}</small>
                                  </h6>
                                ) : (
                                  <h6 className="settings-size text-warning">
                                    <i className="fa-solid fa-upload mx-lg-1 "></i>
                                    <small>Upload Driving Licence</small>
                                  </h6>
                                )}
                              </div>

                              <div className="form-group col-12 col-md-6">
                                <p className="settings-label">
                                  Voter Id
                                  <span className="star-red">*</span>
                                </p>
                                <div className="settings-btn">
                                  <input
                                    type="file"
                                    name="VOTERID"
                                    accept="image/*"
                                    id="VOTERID"
                                    className="hide-input"
                                    onChange={handlefileupload}
                                  />
                                  <label htmlFor="VOTERID" className="upload">
                                    <i className="feather-upload">
                                      <FeatherIcon icon="upload" />
                                    </i>
                                  </label>
                                </div>
                                {kyc.VOTERID != undefined &&
                                kyc.VOTERID != "" ? (
                                  <h6 className="settings-size text-success">
                                    <i className="fa-solid fa-check mx-lg-1 "></i>
                                    <small>{kyc.VOTERID.fileName}</small>
                                  </h6>
                                ) : (
                                  <h6 className="settings-size text-warning">
                                    <i className="fa-solid fa-upload mx-lg-1 "></i>
                                    <small>Upload VoterId</small>
                                  </h6>
                                )}
                              </div>

                              {userProfile.studentOrNot == true ? (
                                <>
                                  <h5 className="card-title">
                                    Educational and University Documents
                                  </h5>
                                  <span className="settings-label">
                                    (NOTE: All the documents are mandotary and
                                    are in pdf only.)
                                  </span>
                                </>
                              ) : null}

                              <div className="form-group col-12 col-md-6">
                                <p className="settings-label">
                                  Aadhar Card{" "}
                                  <span className="star-red">*</span>
                                </p>
                                <div className="settings-btn">
                                  <input
                                    type="file"
                                    name="AADHAR"
                                    id="AADHAR"
                                    className="hide-input"
                                    onChange={handlefileupload}
                                  />
                                  <label htmlFor="AADHAR" className="upload">
                                    <i className="feather-upload">
                                      <FeatherIcon icon="upload" />
                                    </i>
                                  </label>
                                </div>

                                {kyc.aadhar != undefined && kyc.aadhar != "" ? (
                                  <h6 className="settings-size text-success">
                                    <i className="fa-solid fa-check mx-lg-1 "></i>
                                    <small>{kyc.aadhar.fileName}</small>
                                  </h6>
                                ) : (
                                  <h6 className="settings-size text-warning">
                                    <i className="fa-solid fa-upload mx-lg-1 "></i>
                                    <small>Upload Aadhar</small>
                                  </h6>
                                )}
                              </div>

                              <div className="form-group col-12 col-md-6">
                                <p className="settings-label">
                                  Passport <span className="star-red">*</span>
                                </p>
                                <div className="settings-btn">
                                  <input
                                    type="file"
                                    name="PASSPORT"
                                    id="Passport"
                                    className="hide-input"
                                    onChange={handlefileupload}
                                  />
                                  <label htmlFor="Passport" className="upload">
                                    <i className="feather-upload">
                                      <FeatherIcon icon="upload" />
                                    </i>
                                  </label>
                                </div>

                                {kyc.Passport != undefined &&
                                kyc.Passport != "" ? (
                                  <h6 className="settings-size text-success">
                                    <i className="fa-solid fa-check mx-lg-1 "></i>
                                    <small>{kyc.Passport.fileName}</small>
                                  </h6>
                                ) : (
                                  <h6 className="settings-size text-warning">
                                    <i className="fa-solid fa-upload mx-lg-1 "></i>
                                    <small>Upload Passport</small>
                                  </h6>
                                )}
                              </div>

                              {userProfile.studentOrNot == true ? (
                                <>
                                  <div className="form-group col-12 col-md-6">
                                    <p className="settings-label">
                                      Tenth <span className="star-red">*</span>
                                    </p>
                                    <div className="settings-btn">
                                      <input
                                        type="file"
                                        name="TENTH"
                                        id="tenth"
                                        className="hide-input"
                                        onChange={handlefileupload}
                                      />
                                      <label htmlFor="tenth" className="upload">
                                        <i className="feather-upload">
                                          <FeatherIcon icon="upload" />
                                        </i>
                                      </label>
                                    </div>

                                    {kyc.tenth != undefined &&
                                    kyc.tenth != "" ? (
                                      <h6 className="settings-size text-success">
                                        <i className="fa-solid fa-check mx-lg-1 "></i>
                                        <small>{kyc.tenth.fileName}</small>
                                      </h6>
                                    ) : (
                                      <h6 className="settings-size text-warning">
                                        <i className="fa-solid fa-upload mx-lg-1 "></i>
                                        <small>Upload Tenth</small>
                                      </h6>
                                    )}
                                  </div>

                                  <div className="form-group col-12 col-md-6">
                                    <p className="settings-label">
                                      Intermediate{" "}
                                      <span className="star-red">*</span>
                                    </p>
                                    <div className="settings-btn">
                                      <input
                                        type="file"
                                        name="INTER"
                                        id="inter"
                                        className="hide-input"
                                        onChange={handlefileupload}
                                      />
                                      <label htmlFor="inter" className="upload">
                                        <i className="feather-upload">
                                          <FeatherIcon icon="upload" />
                                        </i>
                                      </label>
                                    </div>

                                    {kyc.intermediate != undefined &&
                                    kyc.intermediate != "" ? (
                                      <h6 className="settings-size text-success">
                                        <i className="fa-solid fa-check mx-lg-1 "></i>
                                        <small>
                                          {kyc.intermediate.fileName}
                                        </small>
                                      </h6>
                                    ) : (
                                      <h6 className="settings-size text-warning">
                                        <i className="fa-solid fa-upload mx-lg-1 "></i>
                                        <small>Upload Intermediate</small>
                                      </h6>
                                    )}
                                  </div>

                                  <div className="form-group col-12 col-md-6">
                                    <p className="settings-label">
                                      Graduation{" "}
                                      <span className="star-red">*</span>
                                    </p>
                                    <div className="settings-btn">
                                      <input
                                        type="file"
                                        name="GRADUATION"
                                        id="graduation"
                                        className="hide-input"
                                        onChange={handlefileupload}
                                      />
                                      <label
                                        htmlFor="graduation"
                                        className="upload"
                                      >
                                        <i className="feather-upload">
                                          <FeatherIcon icon="upload" />
                                        </i>
                                      </label>
                                    </div>

                                    {kyc.graduation != undefined &&
                                    kyc.graduation != "" ? (
                                      <h6 className="settings-size text-success">
                                        <i className="fa-solid fa-check mx-lg-1 "></i>
                                        <small>{kyc.graduation.fileName}</small>
                                      </h6>
                                    ) : (
                                      <h6 className="settings-size text-warning">
                                        <i className="fa-solid fa-upload mx-lg-1 "></i>
                                        <small>Upload Graduation</small>
                                      </h6>
                                    )}
                                  </div>

                                  <div className="form-group col-12 col-md-6">
                                    <p className="settings-label">
                                      University of Offer letter{" "}
                                      <span className="star-red">*</span>
                                    </p>
                                    <div className="settings-btn">
                                      <input
                                        type="file"
                                        name="UNIVERSITYOFFERLETTER"
                                        id="offerletter"
                                        className="hide-input"
                                        onChange={handlefileupload}
                                      />
                                      <label
                                        htmlFor="offerletter"
                                        className="upload"
                                      >
                                        <i className="feather-upload">
                                          <FeatherIcon icon="upload" />
                                        </i>
                                      </label>
                                    </div>

                                    {kyc.offerletter != undefined &&
                                    kyc.offerletter != "" ? (
                                      <h6 className="settings-size text-success">
                                        <i className="fa-solid fa-check mx-lg-1 "></i>
                                        <small>
                                          {kyc.offerletter.fileName}
                                        </small>
                                      </h6>
                                    ) : (
                                      <h6 className="settings-size text-warning">
                                        <i className="fa-solid fa-upload mx-lg-1 "></i>
                                        <small>
                                          Upload University of Offer letter
                                        </small>
                                      </h6>
                                    )}
                                  </div>

                                  <div className="form-group col-12 col-md-6">
                                    <p className="settings-label">
                                      University of fee receipt{" "}
                                      <span className="star-red">*</span>
                                    </p>
                                    <div className="settings-btn">
                                      <input
                                        type="file"
                                        name="FEE"
                                        id="feereceipt"
                                        className="hide-input"
                                        onChange={handlefileupload}
                                      />
                                      <label
                                        htmlFor="feereceipt"
                                        className="upload"
                                      >
                                        <i className="feather-upload">
                                          <FeatherIcon icon="upload" />
                                        </i>
                                      </label>
                                    </div>

                                    {kyc.feereceipt != undefined &&
                                    kyc.feereceipt != "" ? (
                                      <h6 className="settings-size text-success">
                                        <i className="fa-solid fa-check mx-lg-1 "></i>
                                        <small>{kyc.feereceipt.fileName}</small>
                                      </h6>
                                    ) : (
                                      <h6 className="settings-size text-warning">
                                        <i className="fa-solid fa-upload mx-lg-1 "></i>
                                        <small>
                                          Upload University of Fee receipt
                                        </small>
                                      </h6>
                                    )}
                                  </div>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="whatapp1" className="tab-pane fade Kyc">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title">
                          {" "}
                          Update Your Whatapp Number
                        </h5>
                        <div className="row">
                          <div className="col-md-12 col-lg-12">
                            {whatappnumber.submit ? (
                              <>
                                {" "}
                                <div className="form-group  col-md-6 col-lg-4">
                                  {/* <input
                  className="form-control"
                  type="number"
                  name="whatapp"
                  placeholder="Enter whatapp number"
                  onChange={handlechangewhatapp}
                /> */}
                                  <PhoneInput
                                    className="phoneinputfiled form-control"
                                    value={value}
                                    onChange={setValue}
                                    defaultCountry="IN"
                                    maxLength={11}
                                  />

                                  {whatappnumber.whatapperror && (
                                    <div className="error">
                                      {whatappnumber.whatapperror}
                                    </div>
                                  )}
                                  <div className="form-group mt-2">
                                    <button
                                      className="btn btn-primary btn-block"
                                      type="submit"
                                      onClick={() => sendWhatsappOtpapi1()}
                                      disabled={valid}
                                    >
                                      SEND OTP
                                    </button>
                                  </div>
                                </div>{" "}
                              </>
                            ) : (
                              <>
                                <div className="form-group  col-md-6 col-lg-4">
                                  <input
                                    className="form-control"
                                    type="tel"
                                    name="otp"
                                    maxLength={4}
                                    placeholder="Enter 4 Digit otp"
                                    onChange={handlechangewhatapp}
                                  />
                                  {whatappnumber.otperror && (
                                    <div className="error">
                                      {whatappnumber.otperror}
                                    </div>
                                  )}

                                  <div className="form-group mt-2 formdisplay">
                                    <button
                                      className="btn btn-secondary btn-block"
                                      type="submit"
                                      onClick={sendWhatsappOtpapi1}
                                    >
                                      RESEND OTP
                                    </button>
                                    <button
                                      className="btn btn-primary btn-block"
                                      type="submit"
                                      onClick={() => verifyWhatsappOtp()}
                                    >
                                      VERIFY OTP
                                    </button>
                                  </div>
                                </div>{" "}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="secure_info_tab" className="tab-pane fade Secure">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title mb-4">Secure Info</h5>
                        <div className="row g-3">
                          <div className="form-group col-12 col-md-4 local-forms mb-3">
                            <label>Aadhar Password</label>
                            <div className="position-relative">
                              <input
                                type={
                                  secureInfoVisibility.aadharPassword
                                    ? "text"
                                    : "password"
                                }
                                className="form-control pe-5"
                                name="aadharPassword"
                                value={secureInfo.aadharPassword}
                                onChange={handleSecureInfoChange}
                                placeholder="Enter aadhar password"
                                autoComplete="new-password"
                              />
                              <button
                                type="button"
                                className="btn position-absolute end-0 top-50 translate-middle-y p-0 pe-2 text-secondary border-0 bg-transparent shadow-none"
                                onClick={() =>
                                  toggleSecureInfoVisibility("aadharPassword")
                                }
                                aria-label={
                                  secureInfoVisibility.aadharPassword
                                    ? "Hide Aadhar password"
                                    : "Show Aadhar password"
                                }
                              >
                                <FeatherIcon
                                  icon={
                                    secureInfoVisibility.aadharPassword
                                      ? "eye"
                                      : "eye-off"
                                  }
                                  size={20}
                                />
                              </button>
                            </div>
                          </div>
                          <div className="form-group col-12 col-md-4 local-forms mb-3">
                            <label>PAN Password</label>
                            <div className="position-relative">
                              <input
                                type={
                                  secureInfoVisibility.panPassword
                                    ? "text"
                                    : "password"
                                }
                                className="form-control pe-5"
                                name="panPassword"
                                value={secureInfo.panPassword}
                                onChange={handleSecureInfoChange}
                                placeholder="Enter PAN password"
                                autoComplete="new-password"
                              />
                              <button
                                type="button"
                                className="btn position-absolute end-0 top-50 translate-middle-y p-0 pe-2 text-secondary border-0 bg-transparent shadow-none"
                                onClick={() =>
                                  toggleSecureInfoVisibility("panPassword")
                                }
                                aria-label={
                                  secureInfoVisibility.panPassword
                                    ? "Hide PAN password"
                                    : "Show PAN password"
                                }
                              >
                                <FeatherIcon
                                  icon={
                                    secureInfoVisibility.panPassword
                                      ? "eye"
                                      : "eye-off"
                                  }
                                  size={20}
                                />
                              </button>
                            </div>
                          </div>
                          <div className="form-group col-12 col-md-4 local-forms mb-3">
                            <label>Bank Statement Password</label>
                            <div className="position-relative">
                              <input
                                type={
                                  secureInfoVisibility.bankStatementPassword
                                    ? "text"
                                    : "password"
                                }
                                className="form-control pe-5"
                                name="bankStatementPassword"
                                value={secureInfo.bankStatementPassword}
                                onChange={handleSecureInfoChange}
                                placeholder="Enter bank statement password"
                                autoComplete="new-password"
                              />
                              <button
                                type="button"
                                className="btn position-absolute end-0 top-50 translate-middle-y p-0 pe-2 text-secondary border-0 bg-transparent shadow-none"
                                onClick={() =>
                                  toggleSecureInfoVisibility(
                                    "bankStatementPassword"
                                  )
                                }
                                aria-label={
                                  secureInfoVisibility.bankStatementPassword
                                    ? "Hide bank statement password"
                                    : "Show bank statement password"
                                }
                              >
                                <FeatherIcon
                                  icon={
                                    secureInfoVisibility.bankStatementPassword
                                      ? "eye"
                                      : "eye-off"
                                  }
                                  size={20}
                                />
                              </button>
                            </div>
                          </div>
                          <div className="form-group col-12 col-md-4 local-forms mb-3">
                            <label>Company Address</label>
                            <input
                              type="text"
                              className="form-control"
                              name="companyAddress"
                              value={secureInfo.companyAddress}
                              onChange={handleSecureInfoChange}
                              placeholder="Enter company address"
                            />
                          </div>
                          <div className="form-group col-12 col-md-4 local-forms mb-3">
                            <label>Designation</label>
                            <input
                              type="text"
                              className="form-control"
                              name="designation"
                              value={secureInfo.designation}
                              onChange={handleSecureInfoChange}
                              placeholder="Enter designation"
                            />
                          </div>
                          <div className="form-group col-12 col-md-4 local-forms mb-3">
                            <label>CIBIL Score</label>
                            <input
                              type="text"
                              className="form-control"
                              name="cibilScore"
                              value={secureInfo.cibilScore}
                              onChange={handleSecureInfoChange}
                              placeholder="Enter CIBIL score"
                            />
                          </div>
                          <div className="form-group col-12 col-md-4 local-forms mb-3">
                            <label>CIBIL Password</label>
                            <div className="position-relative">
                              <input
                                type={
                                  secureInfoVisibility.cibilPassword
                                    ? "text"
                                    : "password"
                                }
                                className="form-control pe-5"
                                name="cibilPassword"
                                value={secureInfo.cibilPassword}
                                onChange={handleSecureInfoChange}
                                placeholder="Enter CIBIL password"
                                autoComplete="new-password"
                              />
                              <button
                                type="button"
                                className="btn position-absolute end-0 top-50 translate-middle-y p-0 pe-2 text-secondary border-0 bg-transparent shadow-none"
                                onClick={() =>
                                  toggleSecureInfoVisibility("cibilPassword")
                                }
                                aria-label={
                                  secureInfoVisibility.cibilPassword
                                    ? "Hide CIBIL password"
                                    : "Show CIBIL password"
                                }
                              >
                                <FeatherIcon
                                  icon={
                                    secureInfoVisibility.cibilPassword
                                      ? "eye"
                                      : "eye-off"
                                  }
                                  size={20}
                                />
                              </button>
                            </div>
                          </div>
                          <div className="form-group col-12 col-md-4 local-forms mb-3">
                            <label>Payslips Password</label>
                            <div className="position-relative">
                              <input
                                type={
                                  secureInfoVisibility.payslipsPassword
                                    ? "text"
                                    : "password"
                                }
                                className="form-control pe-5"
                                name="payslipsPassword"
                                value={secureInfo.payslipsPassword}
                                onChange={handleSecureInfoChange}
                                placeholder="Enter payslips password"
                                autoComplete="new-password"
                              />
                              <button
                                type="button"
                                className="btn position-absolute end-0 top-50 translate-middle-y p-0 pe-2 text-secondary border-0 bg-transparent shadow-none"
                                onClick={() =>
                                  toggleSecureInfoVisibility("payslipsPassword")
                                }
                                aria-label={
                                  secureInfoVisibility.payslipsPassword
                                    ? "Hide payslips password"
                                    : "Show payslips password"
                                }
                              >
                                <FeatherIcon
                                  icon={
                                    secureInfoVisibility.payslipsPassword
                                      ? "eye"
                                      : "eye-off"
                                  }
                                  size={20}
                                />
                              </button>
                            </div>
                          </div>
                          <div className="form-group col-12 col-md-8 local-forms mb-3">
                            <label>Comments</label>
                            <textarea
                              className="form-control"
                              name="comments"
                              rows={3}
                              value={secureInfo.comments}
                              onChange={handleSecureInfoChange}
                              placeholder="Enter comments"
                            />
                          </div>
                        </div>

                        <div className="text-start mt-3">
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={saveSecureInfo}
                          >
                            Save Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="references_tab" className="tab-pane fade References">
                    <div className="card">
                      <div className="card-body">
                        <h5 className="card-title mb-4">Reference Details</h5>
                        <form onSubmit={handleReferenceSave}>
                          <div className="row g-3">
                            <div className="form-group col-12 col-md-4 local-forms mb-3">
                              <label>Father Mobile Number <span className="login-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control"
                                name="reference1"
                                value={referenceDetails.reference1}
                                onChange={handleReferenceChange}
                                placeholder="Enter Father Number"
                              />
                              {referenceDetails.errors.reference1 && (
                                <div className="text-danger small">{referenceDetails.errors.reference1}</div>
                              )}
                            </div>

                            <div className="form-group col-12 col-md-4 local-forms mb-3">
                              <label>Mother Mobile Number <span className="login-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control"
                                name="reference2"
                                value={referenceDetails.reference2}
                                onChange={handleReferenceChange}
                                placeholder="Enter Mother Number"
                              />
                              {referenceDetails.errors.reference2 && (
                                <div className="text-danger small">{referenceDetails.errors.reference2}</div>
                              )}
                            </div>

                            <div className="form-group col-12 col-md-4 local-forms mb-3">
                              <label>Brother Mobile Number <span className="login-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control"
                                name="reference3"
                                value={referenceDetails.reference3}
                                onChange={handleReferenceChange}
                                placeholder="Enter Brother Number"
                              />
                              {referenceDetails.errors.reference3 && (
                                <div className="text-danger small">{referenceDetails.errors.reference3}</div>
                              )}
                            </div>

                            <div className="form-group col-12 col-md-4 local-forms mb-3">
                              <label>Sister Mobile Number <span className="login-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control"
                                name="reference4"
                                value={referenceDetails.reference4}
                                onChange={handleReferenceChange}
                                placeholder="Enter Sister Number"
                              />
                              {referenceDetails.errors.reference4 && (
                                <div className="text-danger small">{referenceDetails.errors.reference4}</div>
                              )}
                            </div>

                            <div className="form-group col-12 col-md-4 local-forms mb-3">
                              <label>Wife Mobile Number <span className="login-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control"
                                name="reference5"
                                value={referenceDetails.reference5}
                                onChange={handleReferenceChange}
                                placeholder="Enter Wife Number"
                              />
                              {referenceDetails.errors.reference5 && (
                                <div className="text-danger small">{referenceDetails.errors.reference5}</div>
                              )}
                            </div>

                            <div className="form-group col-12 col-md-4 local-forms mb-3">
                              <label>First Friend Mobile Number <span className="login-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control"
                                name="reference6"
                                value={referenceDetails.reference6}
                                onChange={handleReferenceChange}
                                placeholder="Enter First Friend Number"
                              />
                              {referenceDetails.errors.reference6 && (
                                <div className="text-danger small">{referenceDetails.errors.reference6}</div>
                              )}
                            </div>

                            <div className="form-group col-12 col-md-4 local-forms mb-3">
                              <label>Second Friend Mobile Number <span className="login-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control"
                                name="reference7"
                                value={referenceDetails.reference7}
                                onChange={handleReferenceChange}
                                placeholder="Enter Second Friend Number"
                              />
                              {referenceDetails.errors.reference7 && (
                                <div className="text-danger small">{referenceDetails.errors.reference7}</div>
                              )}
                            </div>

                            <div className="form-group col-12 col-md-4 local-forms mb-3">
                              <label>Third Friend Mobile Number <span className="login-danger">*</span></label>
                              <input
                                type="text"
                                className="form-control"
                                name="reference8"
                                value={referenceDetails.reference8}
                                onChange={handleReferenceChange}
                                placeholder="Enter Third Friend Number"
                              />
                              {referenceDetails.errors.reference8 && (
                                <div className="text-danger small">{referenceDetails.errors.reference8}</div>
                              )}
                            </div>
                          </div>

                          <div className="text-start mt-3">
                            <button
                              type="submit"
                              className="btn btn-primary"
                              disabled={referenceDetails.loading}
                            >
                              {referenceDetails.loading ? "Saving..." : "Save Reference Details"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Kyc Tab End */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Main Wrapper */}
    </>
  );
};

export default BorrowerProfile;
