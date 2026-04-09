import axios from "axios";
const userisIn = "production"; //local or production
const API_BASE_URL =
  userisIn == "local"
    ? "http://ec2-15-207-239-145.ap-south-1.compute.amazonaws.com:8080/oxynew/v1/user/"
    : "https://fintech.oxyloans.com/oxyloans/v1/user/";

const getToken = () => {
  return sessionStorage.getItem("accessToken");
};
export const base_url=API_BASE_URL;

export const getUserId = () => {
  return sessionStorage.getItem("userId");
};

export const getUserSessionTime = () => {
  return sessionStorage.getItem("tokenTime");
};

export const loadVirtualAccount = () => {
  const userId = getUserId();
  return {
    userId,
  };
};

const getuserLoginId = getUserId();
const getUserLoginToken = getToken();

const handleApiRequestAfterLoginService = async (
  baseurl,
  endpoint,
  method,
  accessToken = null,
  data = null,
  headers = {}
) => {
  try {
    const response = await axios({
      method,
      url: `${baseurl}${endpoint}`,
      data,
      headers: {
        "Content-Type": "application/json",
        accessToken,
        ...headers,
      },
    });
    // Add your common logic here
    if (response.status == 200) {
      return response;
    }
  } catch (error) {
    return error;
  }
};

export const handledetail = async (dealId) => {
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/${dealId}/singleDeal`,
    "GET",
    token
  );
  return response;
};
export const sendWhatsappOtpapi = async (whatappdata, value) => {
  const value1 = value.slice(1);
  const token = getToken();
  const userId = getUserId();
  const data = {
    whatsappNumber: value1,
    id: userId,
  };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `sendWhatsappOtp`,
    "POST",
    token,
    data
  );
  return response;
};

export const verifyWhatsappOtpapi = async (whatappdata) => {
  const token = getToken();
  const userId = getUserId();
  const data = {
    id: userId,
    whatsappOtp: whatappdata.otp,
  };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `verifyWhatsappOtp`,
    "POST",
    token,
    data
  );
  return response;
};
export const sendInvait = async (email, mailContent, mailSubject) => {
  const token = getToken();
  const userId = getUserId();
  const data = {
    email: email,
    referrerId: userId,
    mailContent: mailContent,
    mailSubject: mailSubject,
    inviteType: "BulkInvite",
    userInvite: "NO",
  };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `lenderReferring`,
    "POST",
    token,
    data
  );
  return response;
};

export const handleprincipalreturnaccounttypeapi = async (
  dealId,
  accountType1
) => {
  const token = getToken();
  const userId = getUserId();

  const data = {
    userId: userId,
    dealId: dealId,
    accountType: accountType1,
  };

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `principal_return_account_type`,
    "PATCH",
    token,
    data
  );
  return response;
};

export const handletocancelticketapi1 = async (id) => {
  const token = getToken();
  const userId = getUserId();

  const data = {
    id: id,
    userId: userId,
    status: "CANCELLED",
  };

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `to-cancel-ticket`,
    "PATCH",
    token,
    data
  );
  return response;
};
export const handlePaymembershipapi = async (member, no, feeAmountWithGst) => {
  const token = getToken();
  const userId = getUserId();
  // const membershipfiled = {
  //   MONTHLY: 1000,
  //   QUARTERLY: 2900,
  //   HALFYEARLY: 5600,
  //   PERYEAR: 9800,
  //   LIFETIME: 100000,
  //   FIVEYEARS: 50000,
  //   TENYEARS: 90000,
  // };
  // const calculatedfee = (membershipfiled[member] * 118) / 100;
  const data = {
    userId,
    type: "Wallet",
    feeAmount: feeAmountWithGst,
    lenderFeePayments: member,
    paidFrom: "WEB",
  };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `deducting_lender_fee_from_wallet`,
    "POST",
    token,
    data
  );
  return response;
};

export const lenderfeeamountdetailsapi = async () => {
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `lender_fee_amount_details`,
    "GET",
    token
  );
  return response;
};
export const cashfreemembershipamount = async (member) => {
  const membershipfiled = {
    MONTHLY: 1000,
    QUARTERLY: 2900,
    HALFYEARLY: 5600,
    PERYEAR: 9800,
    LIFETIME: 100000,
    FIVEYEARS: 50000,
    TENYEARS: 90000,
  };

  //   const membershipfiled = {
  //   MONTHLY: 500,
  //   QUARTERLY: 1500,
  //   HALFYEARLY: 3000,
  //   PERYEAR: 5000,
  //   LIFETIME: 26000,
  //   FIVEYEARS: 15000,
  //   TENYEARS: 25000,
  // };
  const calculatedfee = (membershipfiled[member] * 118) / 100;
  return calculatedfee;
};

export const getuserMembershipValidity = async () => {
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/dealsStatistics`,
    "GET",
    token
  );

  return response;
};

export const bulkinvitegmailLink = async () => {
  const token = getToken();
  const userId = getUserId();
  let userType;
  if (userId.trim().toUpperCase().startsWith("LR")) {
    userType = "LENDER";
  } else {
    userType = "BORROWER";
  }
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `getGmailAuthorization/gmailcontacts/${userType}/REACT`,
    "GET",
    token
  );
  return response;
};

export const getUserDetails = async () => {
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `personal/${userId}`,
    "GET",
    token
  );
  return response;
};

export const getUserDetails1 = async () => {
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `lender/personal/${userId}`,
    "GET",
    token
  );
  return response;
};

export const loadlendernomineeDetails = async () => {
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `nominee/${userId}`,
    "GET",
    token
  );
  return response;
};
export const LoadwalletThroughQrScan = async (amount) => {
  const token = getToken();
  const userId = getUserId();
  var data = {
    userId: userId,
    amount: amount,
  };

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `QRTransactionInitiation`,
    "POST",
    token,
    data
  );

  return response;
};

export const handlecashapi = async (groupId, amount) => {
  const token = getToken();
  const userId = getUserId();

  const data = {
    amount: amount,
    dealId: groupId,
  };

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/cashfree`,
    "POST",
    token,
    data
  );
  return response;
};
export const viewdealamountemi = async (dealId) => {
  const token = getToken();
  const userId = getUserId();

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/${dealId}/dealLevelLoanEmiCard`,
    "GET",
    token
  );
  return response;
};

export const principal_return_account_type = async (dealId, transfermethod) => {
  const token = getToken();
  const userId = getUserId();

  var data = {
    userId: userId,
    dealId: dealId,
    accountType: transfermethod,
  };

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `principal_return_account_type`,
    "PATCH",
    token,
    data
  );
  return response;
};
export const myrunnig = async (props) => {
  const token = getToken();
  const userId = getUserId();

  const data = {
    pageNo: props.pageNo,
    pageSize: 10,
  };

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/runningDealsInfoBasedOnPagination`,
    "POST",
    token,
    data
  );
  return response;
};
export const sendMoblieOtp = async (bankaccountprofile) => {
  const token = getToken();
  const userId = getUserId();
  const data = {
    mobileNumber: bankaccountprofile.moblieNumber,
  };

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `sendMobileOtp `,
    "POST",
    token,
    data
  );
  return response;
};
export const profileupadate = async (userProfile, formData, category) => {
  const token = getToken();
  const userId = getUserId();

  // Format date
  let formattedDate = userProfile.dob;
  if (userProfile.dob.includes("-")) {
    const dateComponents = userProfile.dob.split("-");
    formattedDate = `${dateComponents[2]}/${dateComponents[1]}/${dateComponents[0]}`;
    if (formattedDate.includes("undefined/undefined/")) {
      const startIndex =
        formattedDate.indexOf("undefined/undefined/") +
        "undefined/undefined/".length;
      formattedDate = formattedDate.substring(startIndex);
    }
  }

  console.log("Primary Type :", localStorage.getItem("primaryType"));
  if(localStorage.getItem("primaryType")=="BORROWER"){
 // Prepare personal API payload
   var personalData = JSON.stringify({
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    middleName: userProfile.middleName,
    fatherName: userProfile.fatherName,
    dob: formattedDate,
    panNumber: userProfile.panNumber,
    address: userProfile.residenceAddress,
    permanentAddress: userProfile.permanentAddress,
    pinCode: userProfile.pinCode,
    city: userProfile.city,
    state: userProfile.state,
    locality: userProfile.locality,
    facebookUrl: userProfile.facebookUrl,
    linkedinUrl: userProfile.linkedinUrl,
    twitterUrl: userProfile.twitterUrl,
    whatsAppNumber: userProfile.whatsAppNumber,
    aadharNumber: userProfile.aadharNumber,
    employment: category === "SELFEMPLOYED" ? "SELFEMPLOYED" : "SALARIED",
    ...(category !== "STUDENT" && {
      workExperience: formData.totalExperience,
      salary: formData.salary,
      companyName: formData.company,
    }),
    studentOrNot: category === "STUDENT",
  });
  }
  else{
      var personalData = JSON.stringify ({
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    middleName: userProfile.middleName,
    fatherName: userProfile.fatherName,
    dob: formattedDate,
    panNumber: userProfile.panNumber,
    address: userProfile.residenceAddress,
    permanentAddress: userProfile.permanentAddress,
    pinCode: userProfile.pinCode,
    city: userProfile.city,
    state: userProfile.state,
    locality: userProfile.locality,
    facebookUrl: userProfile.facebookUrl,
    linkedinUrl: userProfile.linkedinUrl,
    twitterUrl: userProfile.twitterUrl,
    whatsAppNumber: userProfile.whatsAppNumber,
    aadharNumber: userProfile.aadharNumber,
   
  });
  }
 
  // Always call personal API first
  const personalResponse = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `personal/${userId}`,
    "PATCH",
    token,
    personalData
  );

  // Conditionally call student_info API (no need to return its response)
  if (category === "STUDENT") {
    const studentBody = JSON.stringify({
      userId: userId,
      country: formData.country,
      universityName: formData.universityName,
      location: formData.universityLocation,
    });

    handleApiRequestAfterLoginService(
      API_BASE_URL,
      `student_info`,
      "PATCH",
      token,
      studentBody
    ).catch((err) => {
      console.error("Student info update failed:", err);
    });
  }

  // Return only personal API response
  return personalResponse;
};

export const getLendersInterestsDateWiseapi = async (date) => {
  const token = getToken();
  const userId = getUserId();

  function getMonthNameFromDate(dateObj) {
    const date = new Date(dateObj.date1); // Convert date string to Date object
    const monthNumber = date.getMonth() + 1; // getMonth() returns 0-11, so add 1

    switch (monthNumber) {
      case 1:
        return "January";
      case 2:
        return "February";
      case 3:
        return "March";
      case 4:
        return "April";
      case 5:
        return "May";
      case 6:
        return "June";
      case 7:
        return "July";
      case 8:
        return "August";
      case 9:
        return "September";
      case 10:
        return "October";
      case 11:
        return "November";
      case 12:
        return "December";
      default:
        return "Invalid month number";
    }
  }

  // Extract month name and year from the date
  const monthName = getMonthNameFromDate(date);
  const year = new Date(date.date1).getFullYear();

  // Prepare the data object with dynamic month name and year
  const data = {
    userId: userId,
    monthName: monthName,
    year: year.toString(),
  };

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `getLendersInterestsDateWise`,
    "POST",
    token,
    data
  );

  return response;
};

// Example usage:
const dateObj = { date1: "2024-10-02" };
// getLendersInterestsDateWiseapi(dateObj);
// .then((response) => console.log(response))
// .catch((error) => console.error(error));

export const checkqrcodetransaction = async (qrid) => {
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${qrid}/qrStatusCheck`,
    "PATCH",
    token
  );

  return response;
};

export const paticipationChanges1 = async (dealId) => {
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/${dealId}/paticipationChanges`,
    "GET",
    token
  );

  return response;
};

export const handelapi = async (dealId) => {
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/${dealId}/closedDealsInterest`,
    "GET",
    token
  );
  return response;
};

export const getNotAchievedDealsapi = async (prama) => {
  const token = getToken();
  const userId = getUserId();
  const data = {
    dealType: prama,
  };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `getNotAchievedDeals`,
    "POST",
    token,
    data
  );
  return response;
};
export const regular_Api = async (dealType, urldealname, pageNo = 1) => {
  const token = getToken();
  const userId = getUserId();

  if (urldealname == "ESCROW" || urldealname == "ESCROW/") {
    var url = "listOfDealsInformationForEquityDeals";
    var data = {
      pageNo: pageNo,
      pageSize: 10,
      dealName: "ESCROW",
      dealType: dealType,
    };
  } else if (urldealname == "PERSONAL" || urldealname == "PERSONAL/") {
    var url = "listOfDealsInformationForEquityDeals";
    var data = {
      pageNo: pageNo,
      pageSize: 10,
      dealName: "PERSONAL",
      dealType: dealType,
    };
  } else if (
    urldealname == "regularRunningDeal" ||
    urldealname == "regularRunningDeal/"
  ) {
    var url = "listOfDealsInformationToLender";
    var data = {
      pageNo: pageNo,
      pageSize: 10,
      dealType: dealType,
    };
  } else if (
    urldealname == "viewCurrentDayDeals" ||
    urldealname == "viewCurrentDayDeals/"
  ) {
    var url = "listOfDealsInformationToLender";
    var data = {
      pageNo: pageNo,
      pageSize: 10,
      dealType: "CURRENT",
    };
  } else if (urldealname == "Todaydeal" || urldealname == "Todaydeal/") {
    var url = "listOfDealsInformationToLender";
    var data = {
      pageNo: pageNo,
      pageSize: 10,
      dealType: "CURRENT",
    };
  } else if (urldealname == "testDeal" || "TestDeal") {
    var url = "listOfDealsInformationForEquityDeals";
    var data = {
      dealName: "TEST",
      pageNo: pageNo,
      pageSize: 10,
      dealType: "HAPPENING",
    };
  }

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/${url}`,
    "POST",
    token,
    data
  );
  return response;
};
export const verifyBankAccountAndIfsc = async (bankaccountprofile) => {
  const token = getToken();
  const userId = getUserId();

  const data = {
    bankAccount: bankaccountprofile.accountNumber,
    ifscCode: bankaccountprofile.ifscCode.toUpperCase(),
  };
  
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    "verifyBankAccountAndIfsc",
    "POST",
    token,
    data
  );
  return response;
};

export const feeApicall = async (calculatedfee, choosenmembership) => {
  const token = getToken();
  const userId = getUserId();
  const choose = choosenmembership; // Replace someValue with your actual variable or value
  const uppercaseMembership = choose.toUpperCase();

  const data = {
    userId,
    type: "Wallet",
    feeAmount: calculatedfee,
    lenderFeePayments: uppercaseMembership,
    paidFrom: "WEB",
  };

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `deducting_lender_fee_from_wallet`,
    "POST",
    token,
    data
  );
  return response;
};

export const feeapicallforonedeal = async (calculatedfee, dealId) => {
  const token = getToken();
  const userId = getUserId();
  const data = {
    userId,
    type: "Wallet",
    feeAmount: calculatedfee,
    dealId: dealId,
    lenderFeePayments: "PERDEAL",
    paidFrom: "WEB",
  };

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `deducting_lender_fee_from_wallet`,
    "POST",
    token,
    data
  );
  return response;
};

export const Earning = async (status) => {
  const token = getToken();
  const userId = getUserId();
  const data = JSON.stringify({
    userId: userId,
    paymentStatus: "",
  });

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `downLoadLinkForBonusAmount`,
    "POST",
    token,
    data
  );
  return response;
};

export const handeldisplayMonthlyReferrersAmountapi = async (data) => {
  const token = getToken();
  const userId = getUserId();
  const data2 = {
    pageNo: data.pageNo,
    pageSize: data.pageSize,
    userId: userId,
    month: data.month,
    year: data.year,
  };

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `displayMonthlyReferrersAmount`,
    "POST",
    token,
    data2
  );
  return response;
};

export const fetchFinancialEarnings = async (body) => {
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/fyFeePaidPdfs`,
    "POST",
    token,
    body
  );
  return response;
};

export const summaryFinancialEarnings = async (body) => {
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/fyPdfForLenders`,
    "POST",
    token,
    body
  );
  return response;
};

export const uploadkyc = async (event) => {
  const token = getToken();
  const userId = getUserId();
  var fd = new FormData();
  var files = event.target.files[0];
  fd.append(event.target.name, files);
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/upload/kyc`,
    "POST",
    token,
    fd,
    {
      "Content-Type": "multipart/form-data",
    }
  );
  return response;
};

export const uploadqueryImage = async (file) => {
  const token = getToken();
  const userId = getUserId();
  var fd = new FormData();
  // var files = event.target.files[0];
  fd.append("USERQUERYSCREENSHOT", file);
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/userQueryScreenshot`,
    "POST",
    token,
    fd,
    {
      "Content-Type": "multipart/form-data",
    }
  );
  return response;
};
export const updatebankDetails = async (bankaccountprofile) => {
  const token = getToken();
  const userId = getUserId();
  const mobileOtpSession = localStorage.getItem("OtpSeesion");
  const data = {
    accountNumber: bankaccountprofile.accountNumber,
    bankAddress: bankaccountprofile.bankCity,
    bankName: bankaccountprofile.bankName,
    branchName: bankaccountprofile.branchName,
    confirmAccountNumber: bankaccountprofile.confirmAccountNumber,
    ifscCode: bankaccountprofile.ifscCode.toUpperCase(),
    mobileOtp: bankaccountprofile.mobileOtp,
    mobileOtpSession: bankaccountprofile.mobileOtpSession,
    userName: bankaccountprofile.nameAtBank,
    updateBankDetails: true,
  };

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `personal/${userId}`,
    "PATCH",
    token,
    data
  );

  return response;
};
export const Myreferal = async (pageNo = 1, pageSize = 10) => {
  const token = getToken();
  const userId = getUserId();
  const postdata = JSON.stringify({
    pageNo,
    pageSize,
  });
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/displayingReferrerInfo`,
    "POST",
    token,
    postdata
  );
  return response;
};

export const downloadreferal = async () => {
  const token = getToken();
  const userId = getUserId();

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/referralBonusAmountLink`,
    "GET",
    token
  );

  return response;
};
export const getcontactdeatils = async () => {
  const token = getToken();
  const userId = getUserId();

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    // user/getLenderStoredEmailContacts/${suserId}
    `getLenderStoredEmailContacts/${userId}`,
    "GET",
    token
  );
  return response;
};

export const fetchGamilCode = async (gmailcode) => {
  const token = getToken();
  const userId = getUserId();

  const postdata = {
    gmailCode: gmailcode,
    userType: "LENDER",
    projectType: "REACT",
  };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `getContactsFromGmailAccount/${userId}`,
    "POST",
    token,
    postdata
  );
  return response;
};
export const fetchGamilCode1 = async (gmailcode) => {
  const token = getToken();
  const userId = getUserId();

  const postdata = {
    gmailCode: gmailcode,
    userType: "LENDER",
    projectType: "REACT",
  };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `getAllContactsFromGmailAccount/${userId}`,
    "POST",
    token,
    postdata
  );
  return response;
};

export const handleapicall = async (
  dealId,
  roi,
  participatedamount,
  requestedamount,
  withdrawalamount
) => {
  const token = getToken();
  const userId = getUserId();

  const data1 = {
    userId: userId,
    dealId: dealId,
    currentAmount: participatedamount,
    requestedAmount: requestedamount,
    withDrawalFunds: withdrawalamount,
  };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    // user/getLenderStoredEmailContacts/${suserId}
    `withdrawalFundsFromDeals`,
    "POST",
    token,
    data1
  );
  return response;
};
export const writequery = async (userdata) => {
  const token = getToken();
  const userId = getUserId();

  if (userdata.id == null) {
    var postwritequerydata = {
      query: userdata.query + userdata.urlquery,
      documentId: userdata.documentId,
      email: userdata.profiledata.email,
      mobileNumber: userdata.profiledata.mobileNumber,
    };
  } else {
    if(userdata.status !== null ){
      var postwritequerydata = {
        query: userdata.query + userdata.urlquery,
        documentId: userdata.documentId,
        email: userdata.profiledata.email,
        mobileNumber: userdata.profiledata.mobileNumber,
        id: userdata.id,
        respondedBy: "USER",
        reOpenStatus: "REOPEN"
      };
    }else{
    var postwritequerydata = {
      query: userdata.query + userdata.urlquery,
      documentId: userdata.documentId,
      email: userdata.profiledata.email,
      mobileNumber: userdata.profiledata.mobileNumber,
      id: userdata.id,
      respondedBy: "USER",
    };
   }
  }

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/readingQueriesFromUsers`,
    "POST",
    token,
    postwritequerydata
  );

  return response;
};
export const fileuploads = async (files) => {
  const token = getToken();
  const userId = getUserId();
  const formData = new FormData();
  formData.append("USERQUERYSCREENSHOT", files);
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/userQueryScreenshot`,
    "POST",
    token,
    formData
  );

  return response;
};

export const getuploadCredit = async () => {
  const token = getToken();
  const userId = getUserId();

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/getData`,
    "GET",
    token
  );

  return response;
};
export const submitWithdrawalRequestFromWallet = async (postdate, status) => {
  const token = getToken();
  const userId = getUserId();

  const withdrawAmount = postdate.withdrawAmount;
  const withdrawRating = postdate.withdrawRating;

  const postdata =
    status == "first"
      ? {
          userId,
          userType: "LENDER",
          amount: parseInt(withdrawAmount),
          amountRequiredDate: postdate.setGivendate,
          withdrawalReason: postdate.withdraReason,
          rating: JSON.stringify(withdrawRating),
          feedBack: postdate.withdrawFeedback,
          adminComments: "",
          status: "INITIATED",
        }
      : {
          userId,
          userType: "LENDER",
          amount: parseInt(withdrawAmount),
          amountRequiredDate: postdate.setGivendate,
          withdrawalReason: postdate.withdraReason,
          rating: JSON.stringify(withdrawRating),
          feedBack: postdate.withdrawFeedback,
          adminComments: "",
          status: "INITIATED",
          type: status,
        };

  const postdatastring = JSON.stringify(postdata);

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `savewithdrawalfundsinfo`,
    "POST",
    token,
    postdatastring
  );

  return response;
};

export const submitWalletToWallet = async (postdata) => {
  const token = getToken();

  const postdatastring = JSON.stringify({
    senderId: postdata.senderId,
    receiverId: postdata.receiverId.substring(2),
    amount: postdata.amount,
  });
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `wallet_amount_transfer`,
    "POST",
    token,
    postdatastring
  );

  return response;
};

export const profilesubmit = async (profile) => {
  const token = getToken();
  const userId = getUserId();

  let referrercountryCode = "91";
  var data = {
    email: profile.email,
    mobileNumber: referrercountryCode + profile.mobileNumber,
    name: profile.name,
    mailContent: profile.mailContent,
    mailSubject: profile.mailSubject,
    referrerId: userId,
    primaryType: profile.primaryType,
    citizenType: profile.citizenType,
    seekerRequestedId: "0",
    inviteType: "SingleInvite",
    userType: null,
    userInvite: profile.userinviteType,
  };

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `lenderReferring`,
    "POST",
    token,
    data
  );

  return response;
};
export const handelnomeeclickapi = async (nomineeDetails) => {
  const token = getToken();
  const userId = getUserId();

  var data = {
    userId: userId,
    relation: nomineeDetails.relation,
    name: nomineeDetails.nomineeName,
    mobileNumber: nomineeDetails,
    email: nomineeDetails.nomineeEmail,
    accountNumber: nomineeDetails.accountNo,
    ifscCode: nomineeDetails.nomineeIfsc,
    bankName: nomineeDetails.bank,
    branchName: nomineeDetails.branch,
    city: nomineeDetails.nomineecity,
  };

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `nominee`,
    "POST",
    token,
    data
  );

  return response;
};
export const TicketHistoryapi = async () => {
  const token = getToken();
  const userId = getUserId();
  const data = {
    pageNo: 1,
    pageSize: 10,
    status: "",
    userId: userId,
  };

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `queryDetailsBasedOnUserId`,
    "POST",
    token,
    data
  );

  return response;
};

export const uploadapicall = async (event, emailcontentdata) => {
  const token = getToken();
  const userId = getUserId();
  var fd = new FormData();

  var files = event.target.files[0];
  fd.append("BULKINVITE", files);
  fd.append("content", emailcontentdata);
  fd.append("userInvite", "NO");

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `sendBulkInviteThroughExcel/${userId}`,
    "POST",
    token,
    fd,
    {
      "Content-Type": "multipart/form-data",
    }
  );

  return response;
};
export const ticketcommentapi = async (id) => {
  const token = getToken();
  const userId = getUserId();

  const response = handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${id}/pendingQueriesBasedOnId`,
    "GET",
    token
  );

  return response;
};

export const handelListOfQueriesHisoryapi = async (id) => {
  const token = getToken();
  const userId = getUserId();

  const data = {
    id: id,
    userId: userId,
  };
  const response = handleApiRequestAfterLoginService(
    API_BASE_URL,
    `listOfQueriesHisory`,
    "POST",
    token,
    data
  );

  return response;
};

export const getemailcontent = async () => {
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `mailContentShowingToLender`,
    "GET",
    token
  );
  return response;
};

export const highvalueDeals = async (pageNo = 1, pageSize = 10) => {
  const token = getToken();
  const postdatastring = JSON.stringify({
    pageNo,
    pageSize,
  });
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `assert_based_closed_deals`,
    "POST",
    token,
    postdatastring
  );
  return response;
};

export const getMyWalletTowalletHistory = async (pageNo = 1) => {
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/wallet-to-wallet-debit-history`,
    "GET",
    token
  );
  return response;
};

export const getMyWalletTowalletTransactionHistory = async () => {
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/wallet_to_wallet_request_list`,
    "GET",
    token
  );
  return response;
};

export const getMembershiphistory = async (pageNo = 1, pageSize = 10) => {
  const token = getToken();
  const userId = getUserId();
  const postdatastring = JSON.stringify({
    pageNo,
    pageSize,
  });
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/lender_fee_paid_type`,
    "POST",
    token,
    postdatastring
  );
  return response;
};
export const getMyfinancialEarnings = async () => {
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/financial_year_data`,
    "GET",
    token
  );
  return response;
};

export const getMyToatlInterestEarnings = async () => {
  const token = getToken();
  const userId = getUserId();

  const postdatastring = JSON.stringify({
    userId,
  });

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `monthly_interest_earnings`,
    "POST",
    token,
    postdatastring
  );
  return response;
};

export const getMyWithdrawalHistory = async (pageNo = 1, pageSize = 10) => {
  const token = getToken();
  const userId = getUserId();
  const postdatastring = JSON.stringify({
    page: {
      pageNo,
      pageSize,
    },
    firstName: "",
    lastName: "",
    userId: userId,
  });

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `lenderwithdrawalfundssearch`,
    "POST",
    token,
    postdatastring
  );
  return response;
};

export const chatapi = async () => {
  const token = getToken();
  const userId = getUserId();
  const response = handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/lendertotalInvestmentData`,
    "GET",
    token
  );
  return response;
};

export const lenderTotalInvestmentsAndReturns = async () => {
  const token = getToken();
  const userId = getUserId();

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/lenderTotalInvestmentsAndReturns`,
    "GET",
    token
  );

  return response;
};
export const nofreeParticipationapi = async (
  apidata,
  groupId,
  dealId,
  accountType,
  lenderReturnType,
  deal
) => {
  const token = getToken();
  const userId = getUserId();

  if (deal.monthlyInterest !== 0) {
    var lenderReturnType = "MONTHLY";
  } else if (deal.quarterlyDisplay !== 0) {
    var lenderReturnType = "QUARTELY";
  } else if (deal.yearlyInterest !== 0) {
    var lenderReturnType = "YEARLY";
  }
  const data = {
    userId: userId,
    groupId: groupId,
    dealId: dealId,
    participatedAmount: deal.participatedAmount,
    lenderReturnType: lenderReturnType,
    processingFee: 0,
    lenderFeeId: "0",
    accountType: accountType,
    feeStatus: "COMPLETED",
  };
  let userconfirmed = "NO";

  // if(participationStatus === true){
  // 	      userconfirmed = "YES";
  // 		var participationStatus = "UPDATE";
  // }else{
  //   var participationStatus = status;
  // }

  var lenderRemainingWalletAmount = localStorage.getItem(
    "lenderRemainingWalletAmount"
  );
  const data1 = {
    userId: userId,
    groupId: groupId,
    dealId: dealId,
    participatedAmount: deal.participatedAmount,
    lenderReturnType: lenderReturnType,
    // rateofInterest: choosenRateofInterest,
    processingFee: 0,
    paticipationStatus:
      deal.lenderParticipationTotal !== null || 0 ? "ADD" : "UPDATE",
    accountType: accountType,
    lenderRemainingWalletAmount: lenderRemainingWalletAmount,
    ExtensionConsents: userisIn === "local" ? "INTERESTED" : "NOTINTERESTED",
    feeStatus: "COMPLETED",
    // lenderTotalPanLimit:userPanLimit,
    // totalParticipatedAmount:userTotalParticipation
    lenderTotalPanLimit: deal.apidata.lenderRemainingPanLimit,
    lenderParticipationFrom: "WEB",
    totalParticipatedAmount: deal.apidata.lenderTotalParticipationAmount,
  };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    "updatingLenderDeal",
    "PATCH",
    token,
    data1
  );
  return response;
};

export const dealparticipationValidityUser = async (deal) => {
  const token = getToken();
  const userId = getUserId();

  const data1 = {
    userId: userId,
    groupId: deal.apidata.groupId,
    dealId: deal.urldealId,
    participatedAmount: deal.participatedAmount,
    lenderReturnType: deal.apidata.payout,
    processingFee: 0,
    paticipationStatus:
      deal.apidata.lenderParticipationTotal !== null || 0 ? "ADD" : "UPDATE",
    accountType: deal.bank,
    feeStatus: "COMPLETED",
    lenderTotalPanLimit: deal.apidata.lenderRemainingPanLimit,
    totalParticipatedAmount: deal.apidata.lenderTotalParticipationAmount,
    lenderRemainingWalletAmount: deal.apidata.lenderRemainingWalletAmount,
    lenderParticipationFrom: "WEB",
    ExtensionConsents: userisIn === "local" ? "INTERESTED" : "NOTINTERESTED",
  };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    "updatingLenderDeal",
    "PATCH",
    token,
    data1
  );
  return response;
};

export const newlenderdealparticipation = async (deal) => {
  const token = getToken();
  const userId = getUserId();

  var newLenderFeePercentage = (parseInt(deal.participatedAmount) * 1) / 100;
  var newLenderGstAndFeeCalculation = (newLenderFeePercentage * 118) / 100;

  const data = {
    userId: userId,
    groupId: deal.apidata.groupId,
    dealId: deal.urldealId,
    participatedAmount: deal.participatedAmount,
    lenderReturnType: deal.apidata.payout,
    processingFee: newLenderGstAndFeeCalculation,
    paticipationStatus:
      deal.apidata.lenderParticipationTotal !== null || 0 ? "ADD" : "UPDATE",
    accountType: deal.bank,
    feeStatus: "PENDING",
    lenderTotalPanLimit: deal.apidata.lenderRemainingPanLimit,
    totalParticipatedAmount: deal.apidata.lenderTotalParticipationAmount,
    lenderRemainingWalletAmount: deal.apidata.lenderRemainingWalletAmount,
    lenderParticipationFrom: "WEB",
    ExtensionConsents: userisIn === "local" ? "INTERESTED" : "NOTINTERESTED",
  };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    "updatingLenderDeal",
    "PATCH",
    token,
    data
  );
  return response;
};

export const allQueriesCount1 = async () => {
  const token = getToken();
  const userId = getUserId();

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/allQueriesCount`,
    "GET",
    token
  );

  return response;
};
export const getMyTransactions = async (pageNo = 1, pageSize = 10) => {
  const token = getToken();
  const userId = getUserId();

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/lenderHistory`,
    "GET",
    token
  );
  return response;
};

export const getWithdrawaFromDeal = async (
  pageNo = 1,
  pageSize = 10,
  dealtype
) => {
  const token = getToken();
  const userId = getUserId();

  const postdatastring = JSON.stringify({
    pageNo,
    pageSize,
    dealType: dealtype,
  });

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/lenderPaticipatedDealBasedOnDealType`,
    "POST",
    token,
    postdatastring
  );
  return response;
};

export const getDashboardInvestment = async (pageNo = 1, pageSize = 10) => {
  const token = getToken();
  const userId = getUserId();

  const postdatastring = JSON.stringify({
    userId,
    requestType: "WALLETCREDITED",
    pageSize,
    pageNo,
    searchType: "DESC",
  });

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `newLenderDashboard`,
    "POST",
    token,
    postdatastring
  );
  return response;
};

export const withdrawriaseapipay = async (status) => {
  const token = getToken();
  const userId = getUserId();

  const postdata = {
    status: status,
    userId: userId,
  };

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `withdrawriase`,
    "PATCH",
    token,
    postdata
  );
  return response;
};
export const getDashboardPrincipalReturned = async (
  pageNo = 1,
  pageSize = 10
) => {
  const token = getToken();
  const userId = getUserId();

  const postdatastring = JSON.stringify({
    userId,
    requestType: "LENDERPRICIPAL",
    pageSize,
    pageNo,
    searchType: "DESC",
  });

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `newLenderDashboard`,
    "POST",
    token,
    postdatastring
  );
  return response;
};

export const getDashboardInterestEarnings = async (
  pageNo = 1,
  pageSize = 10
) => {
  const token = getToken();
  const userId = getUserId();

  const postdatastring = JSON.stringify({
    userId,
    requestType: "LENDERINTEREST",
    pageSize,
    pageNo,
    searchType: "DESC",
  });

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `newLenderDashboard`,
    "POST",
    token,
    postdatastring
  );
  return response;
};

export const getDashboardReferralEarnings = async (
  pageNo = 1,
  pageSize = 10
) => {
  const token = getToken();
  const userId = getUserId();

  const postdatastring = JSON.stringify({
    userId,
    requestType: "REFERRALBONUS",
    pageSize,
    pageNo,
    searchType: "DESC",
  });

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `newLenderDashboard`,
    "POST",
    token,
    postdatastring
  );
  return response;
};

export const getdashboardDealsVsEarnings = async (
  pageNo = 1,
  pageSize = 10
) => {
  const token = getToken();
  const userId = getUserId();

  const postdatastring = JSON.stringify({
    userId,
    requestType: "LENDERPATICIPATION",
    pageSize,
    pageNo,
    searchType: "DESC",
  });

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `newLenderDashboard`,
    "POST",
    token,
    postdatastring
  );
  return response;
};

export const referralEarningsInfo = async (pageNo = 1, pageSize = 10) => {
  const token = getToken();
  const userId = getUserId();
  const postdatastring = JSON.stringify({
    pageNo,
    pageSize,
    paymentStatus: "",
    userId,
  });
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `referralBonusAmountBasedOnStatus`,
    "POST",
    token,
    postdatastring
  );
  return response;
};

export const handelsubmitdatafilter = async (inputserach) => {
  const token = getToken();
  const userId = getUserId();
  const isValidInput =
    typeof inputserach === "string" && inputserach.length > 0;

  const postdatastring = {
    dealId: isValidInput && inputserach.length <= 3 ? parseInt(inputserach) : null,
    userId: parseInt(userId),
    dealName: isValidInput && inputserach.length > 3 ? inputserach : null,
  };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `search_based_on_deal_name`,
    "POST",
    token,
    postdatastring
  );
  return response;
};

export const handelsubmitcanceldatafilter = async (inputserach) => {
  const token = getToken();
  const userId = getUserId();
  const isValidInput =
    typeof inputserach === "string" && inputserach.length > 0;

  const postdatastring = {
    // dealId:
    //   isValidInput && inputserach.length <= 3 ? parseInt(inputserach) : null,
    userId: parseInt(userId),
    dealName: isValidInput && inputserach.length > 3 ? inputserach : null,
  };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `search_based_closed_deals`,
    "POST",
    token,
    postdatastring
  );
  return response;
};


export const referralEarningsInfoparam = async (
  pageNo = 1,
  pageSize = 10,
  param
) => {
  const token = getToken();
  const userId = getUserId();
  const postdatastring = JSON.stringify({
    pageNo,
    pageSize,
    paymentStatus: param,
    userId,
  });
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `referralBonusAmountBasedOnStatus`,
    "POST",
    token,
    postdatastring
  );
  return response;
};
export const handlepincodeapicall = async (code) => {
  const token = getToken();
  const userId = getUserId();

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${code}/pincode`,
    "GET",
    token
  );
  return response;
};

export const getholdamountInfo = async () => {
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/hold-amount-details`,
    "GET",
    token
  );
  return response;
};

export const myclosedDealsInfo = async (pageNo = 1, pageSize = 10) => {
  const token = getToken();
  const userId = getUserId();
  const postdatastring = JSON.stringify({
    pageNo,
    pageSize,
    userId,
  });
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `closedDealsForUserBasedOnPagination`,
    "POST",
    token,
    postdatastring
  );
  return response;
};

export const getEmiTableInformation = async (params) => {
  const token = getToken();
  const userId = getUserId();

  const postdatastring = JSON.stringify({
    loanAmount: params.loanAmount,
    rateOfInterest: params.inputroi,
    tenure: params.inputTenure,
    calculationType: params.emiType,
  });

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `borrowerEmiDetails`,
    "POST",
    token,
    postdatastring
  );
  return response;
};

export const getSessionExpireTime = () => {
  const tokenTimeStamp = getUserSessionTime();
  var addingtime = 1500000;
  var getTime = parseInt(tokenTimeStamp) + addingtime;
  var date = new Date();
  var milliseconds = date.getTime();
  let isNearbySession = false;
  if (milliseconds > getTime) {
    isNearbySession = true;
  }
  return isNearbySession;
};

export const getNewSessionTime = async () => {
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/USER/accessTokenGeneration`,
    "GET",
    token
  );
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("tokenTime");
  const accessTokenFromHeader = response.headers["accesstoken"];
  sessionStorage.setItem("accessToken", accessTokenFromHeader);
  sessionStorage.setItem("tokenTime", response.data.tokenGeneratedTime);
  setTimeout(() => {
    window.location.reload();
  }, 2500);
  return response;
};

export const cancelWithdrawalRequest = async (fromrequest, requestId) => {
  const token = getToken();
  const userId = getUserId();
  var postdata = JSON.stringify({
    id: requestId,
    userId: userId,
    requestFrom: fromrequest,
  });

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `to-cancel-withdrawal-request`,
    "PATCH",
    token,
    postdata
  );
  return response;
};

export const handelexcelsForNewLenderDashboard = async (requestType) => {
  const token = getToken();
  const userId = getUserId();
  var postdata = {
    userId: userId,
    requestType: requestType,
  };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `excelsForNewLenderDashboard`,
    "POST",
    token,
    postdata
  );
  return response;
};

export const confirmthependingamount = async (dealId, amount) => {
  const token = getToken();
  const userId = getUserId();
  var postdata = JSON.stringify({
    userId,
    type: "Wallet",
    feeAmount: amount,
    dealId,
    lenderFeePayments: "PERDEAL",
    paidFrom: "WEB",
  });

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `deducting_lender_fee_from_wallet`,
    "POST",
    token,
    postdata
  );
  return response;
};

export const cancelMyWithdrawWalletRequest = async (requestId) => {
  const token = getToken();
  const userId = getUserId();
  var postdata = JSON.stringify({
    id: requestId,
    status: "REJECTED",
  });
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `wallet_to_wallet_request`,
    "PATCH",
    token,
    postdata
  );
  return response;
};

export const getFinancialReportDownload = async (
  startDate,
  endDate,
  requestTypefromBtn,
  status
) => {
  const token = getToken();
  const userId = getUserId();
  var postdata = JSON.stringify({
    startDate,
    endDate,
    inputType: requestTypefromBtn,
    status: status,
  });

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/lender-income`,
    "POST",
    token,
    postdata
  );
  return response;
};

export const downloadClosedLoanStatement = async (typeoffile = "RUNNING") => {
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/closedDealsDownloadForUser`,
    "GET",
    token
  );

  return response;
};

export const downloadTranactionStatement = async () => {
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/lenderHistoryPdf`,
    "GET",
    token
  );

  return response;
};

export const getMyinterestEarningSearch = async (data) => {
  const token = getToken();
  const userId = getUserId();
  var postdata = JSON.stringify({
    userId: userId,
    startDate: data.searchStartdate,
    endDate: data.searchEndDate,
    sortBasedOn: data.sortbased,
    sortingType: "Asc",
  });

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `monthly_interest_earnings`,
    "POST",
    token,
    postdata
  );
  return response;
};

export const savenomineeDeatailsApi = async (nominee) => {
  const token = getToken();
  const userId = getUserId();

  const data = {
    userId: userId,
    relation: nominee.relation,
    name: nominee.nomineeName,
    mobileNumber: nominee.nomineeMobile,
    email: nominee.nomineeEmail,
    accountNumber: nominee.accountNo,
    ifscCode: nominee.nomineeIfsc,
    bankName: nominee.bank,
    branchName: nominee.branch,
    city: nominee.nomineecity,
  };

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    "nominee",
    "POST",
    token,
    data
  );
  return response;
};

export const getPanDoc = async () => {
  const token = getToken();
  const userId = getUserId();
  const res = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/download/PAN`,
    "GET",
    token
  );
  return res;
};

export const getdataPassport = async () => {
  const token = getToken();
  const userId = getUserId();
  const res = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/download/PASSPORT`,
    "GET",
    token
  );
  return res;
};

export const getdataAadhar = async () => {
  const token = getToken();
  const userId = getUserId();
  const res = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/download/AADHAR`,
    "GET",
    token
  );
  return res;
};

export const getdataVoterId = async () => {
  const token = getToken();
  const userId = getUserId();
  const res = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/download/VOTERID`,
    "GET",
    token
  );
  return res;
};

export const getdataDrivingLicence = async () => {
  const token = getToken();
  const userId = getUserId();
  const res = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/download/DRIVINGLICENCE`,
    "GET",
    token
  );
  return res;
};

export const getdatachequeLeaf = async () => {
  const token = getToken();
  const userId = getUserId();
  const res = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/download/CHEQUELEAF`,
    "GET",
    token
  );
  return res;
};

export const getdataBankStatement = async () => {
  const token = getToken();
  const userId = getUserId();
  const res = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/download/BANKSTATEMENT`,
    "GET",
    token
  );
  return res;
};

export const getdatatenth = async () => {
  const token = getToken();
  const userId = getUserId();
  const res = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/download/TENTH`,
    "GET",
    token
  );
  return res;
};

export const getdataintermediate = async () => {
  const token = getToken();
  const userId = getUserId();
  const res = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/download/INTER`,
    "GET",
    token
  );
  return res;
};

export const getdatagraduation = async () => {
  const token = getToken();
  const userId = getUserId();
  const res = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/download/GRADUATION`,
    "GET",
    token
  );
  return res;
};


export const getdataofferletter = async () => {
  const token = getToken();
  const userId = getUserId();
  const res = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/download/UNIVERSITYOFFERLETTER`,-
    "GET",
    token
  );
  return res;
};

export const getdatafeereceipt = async () => {
  const token = getToken();
  const userId = getUserId();
  const res = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/download/FEE`,
    "GET",
    token
  );
  return res;
};


export const getdatapayslips = async () => {
  const token = getToken();
  const userId = getUserId();
  const res = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/download/PAYSLIPS`,
    "GET",
    token
  );
  return res;
};

export const getactivityApisData = () => {
  const token = getToken();
  const userId = getUserId();
  const res = handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/dealsStatistics`,
    "GET",
    token
  );
  return res;
};

export const getInterestEarnings = () => {
  const token = getToken();
  const userId = getUserId();
  const res = handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/lenderEarnngAndReturn`,
    "GET",
    token
  );
  return res;
};

export const getNoDealsParticipated = () => {
  const token = getToken();
  const userId = getUserId();
  const res = handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/dealAndParticipationCount`,
    "POST",
    token
  );
  return res;
};

//////////borrower apis/////////

export const getBorrowerRunningloans = async (pageNo = 1, pageSize = 10) => {
  const token = getToken();
  const userId = getUserId();

  const postdatastring = JSON.stringify({
    page: {
      pageNo,
      pageSize,
    },
  });
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/application/loansbyapplication`,
    "POST",
    token,
    postdatastring
  );
  return response;
};

export const fetchcashfree = async (
  membership,
  no,
  feeAmountWithGst,
  url,
  dealId = 0
) => {
  const token = getToken();
  const userId = getUserId();

  let membershipamount = await cashfreemembershipamount(membership);

  const postdatastring = JSON.stringify({
    orderAmount: feeAmountWithGst,
    userId: userId,
    dealId: dealId,
    return_url: url,
    lenderFeePayments: membership,
    paidFrom: "WEB",
  });
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `cashfreeOrderForReact`,
    "POST",
    token,
    postdatastring
  );
  return response;
};

export const borrowerIdMappedToDealIdapi = (dealId) => {
  const token = getToken();
  const userId = getUserId();

  const data = {
    dealId: dealId,
  };
  const res = handleApiRequestAfterLoginService(
    API_BASE_URL,
    `borrowerIdMappedToDealId`,
    "POST",
    token,
    data
  );
  return res;
};
export const knowisalredyrequested = () => {
  const token = getToken();
  const userId = getUserId();
  const res = handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/lenderWithdrawFundsInfo`,
    "GET",
    token
  );
  return res;
};

// export const handelupdatedcible = (data , file) => {
//   const token = getToken();
//   const userId = getUserId();
//   const res = handleApiRequestAfterLoginService(
//     API_BASE_URL,
//     `${data.userId}/${data.oxyScore}/${data.commentId}/${data.passwordLogin}/uploadCreditReport`,
//     "POST",
//     token
//   );
//   return res;
// };
export const getpaymentorder = (myorder) => {
  const token = getToken();
  const userId = getUserId();
  const res = handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${myorder}/getOrderbyIdForReact`,
    "GET",
    token
  );
  return res;
};

export const handellenderFeePaymentsapi = (data) => {
  const token = getToken();
  const userId = getUserId();
  console.log(data);

  console.log(data.data.customer_details.customer_id);
  console.log(data.data.order_status);
  const postData = {
    comments: "LENDER FEE",
    payuTransactionNumber: data.data.customer_details.customer_id,
    payuStatus: data.data.order_status === "PAID" ? "success" : "",
  };
  const res = handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${data.data.customer_details.customer_id}/lenderFeePayments`,
    "PATCH",
    token,
    postData
  );
  return res;
};

export const getBorrowerApplication = async (pageNo = 1, pageSize = 10) => {
  const token = getToken();
  const userId = getUserId();

  const postdatastring = JSON.stringify({
    leftOperand: {
      fieldName: "userId",
      fieldValue: userId,
      operator: "EQUALS",
    },
    logicalOperator: "AND",
    rightOperand: {
      fieldName: "parentRequestId",
      operator: "NULL",
    },
  });
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/loan/ADMIN/request/search`,
    "POST",
    token,
    postdatastring
  );
  return response;
};

export const getExtensionHistoryapicall = async (dealId) => {
  const token = getToken();

  const data = {
    dealId,
  };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `getExtensionHistory`,
    "POST",
    token,
    data
  );
  return response;
};

export const myagreedloanapplication = async (pageNo = 1, pageSize = 10) => {
  const token = getToken();
  const userId = getUserId();

  let fName = "borrowerUserId";

  // if (sprimaryType == "BORROWER") {
  //   fName = "borrowerUserId";
  // }

  const postdatastring = JSON.stringify({
    leftOperand: {
      fieldName: fName,
      fieldValue: userId,
      operator: "EQUALS",
    },

    logicalOperator: "AND",

    rightOperand: {
      fieldName: "loanStatus",
      fieldValues: ["Agreed", "Active", "Closed", "Hold"],
      operator: "IN",
    },
    page: {
      pageNo,
      pageSize,
    },
    sortBy: "loanAcceptedDate",
    sortOrder: "DESC",
  });
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/loan/BORROWER/search`,
    "POST",
    token,
    postdatastring
  );
  return response;
};

export const enachmandate = async (pageNo = 1, pageSize = 10) => {
  const token = getToken();
  const userId = getUserId();

  const postdatastring = JSON.stringify({});
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/loan/BORROWER/searchEnachMandateApplicationLevel`,
    "POST",
    token,
    postdatastring
  );
  return response;
};

export const borrowerloaslistings = async (pageNo = 1, pageSize = 10) => {
  const token = getToken();
  const userId = getUserId();

  var fieldValueUser = "LENDER";
  var userUtm = "WEB";
  const postdatastring = JSON.stringify({
    leftOperand: {
      leftOperand: {
        fieldName: "userPrimaryType",
        fieldValue: fieldValueUser,
        operator: "EQUALS",
      },
      logicalOperator: "AND",
      rightOperand: {
        fieldName: "user.urchinTrackingModule",
        fieldValue: userUtm,
        operator: "EQUALS",
      },
    },
    logicalOperator: "AND",
    rightOperand: {
      fieldName: "parentRequestId",
      operator: "NULL",
    },
    page: {
      pageNo,
      pageSize,
    },
    sortBy: "userId",
    sortOrder: "DESC",
  });
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/loan/BORROWER/request/search`,
    "POST",
    token,
    postdatastring
  );
  return response;
};

export const submitloanRequest = async (postdata) => {
  const token = getToken();
  const userId = getUserId();

  const postdatastring = JSON.stringify({
    duration: postdata.duration,
    durationType: postdata.durationType,
    expectedDate: postdata.expectedDate,
    loanPurpose: postdata.loanpurpose,
    loanRequestAmount: postdata.loanamount,
    rateOfInterest: postdata.roi,
    repaymentMethod: postdata.repayment,
  });
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/loan/BORROWER/newrequest`,
    "POST",
    token,
    postdatastring
  );

  return response;
};

export const editloanNewRequestHold = async (status) => {
  const token = getToken();
  const userId = getUserId();
  const postdatastring = JSON.stringify({
    status: status,
  });
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/loan/BORROWER/updateLoanRequest`,
    "PATCH",
    token,
    postdatastring
  );

  return response;
};

export const chatbotapicall = async (messages) => {
  const token = getToken();
  const postdata = {
    message: messages,
  };
  
  const response = await axios({
    url: `https://meta.oxyloans.com/api/oxyloans-ai/oxyloansChat`,
    method: "POST",
    headers: {
      accessToken: `${token}`,
      "X-API-KEY": "oxy-ai-prod-key",
    },
    data: postdata,
    responseType: 'text',
  });
  
  return response;
};

