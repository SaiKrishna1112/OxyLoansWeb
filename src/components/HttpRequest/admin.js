import axios from "axios";
import { API_USER_URL as API_BASE_URL, BASE_URL } from "../../config";
const userisIn = "local"; //local or production
// const API_BASE_URL =
//   userisIn == "local"
//     ? "http://ec2-15-207-239-145.ap-south-1.compute.amazonaws.com:8080/oxynew/v1/user/"
//     : "https://fintech.oxyloans.com/oxyloans/v1/user/"; 

const AI_BASE_URL = `${BASE_URL}/v1/ai/`;

const getToken = () => {
  return sessionStorage.getItem("accessToken");
};

export const base_url=API_BASE_URL;
export const getUserId = () => {
  return sessionStorage.getItem("userId");
};

export const getEmail = () => {
  return sessionStorage.getItem("email");
};
export const getUserSessionTime = () => {
  return sessionStorage.getItem("tokenTime");
};

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

    if (response && response.data) {
      const resData = response.data;
      if (
        resData.errorCode === "100" ||
        resData.errorCode === 100 ||
        (resData.errorMessage &&
          resData.errorMessage.toLowerCase().includes("session has expired"))
      ) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/";
        return response;
      }
    }

    // Add your common logic here
    if (response.status == 200) {
      return response;
    }
  } catch (error) {
    if (error && error.response && error.response.data) {
      const errData = error.response.data;
      if (
        errData.errorCode === "100" ||
        errData.errorCode === 100 ||
        (errData.errorMessage &&
          errData.errorMessage.toLowerCase().includes("session has expired"))
      ) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "/";
      }
    }
    return error;
  }
};

export const handleBorrowerEmiRequest = async (value) => {
  console.log("Fetching borrower EMI requests...",value);
  try {
    // Get token and user ID from session storage
    const token = getToken();
    const userId = getUserId();
    let data;
    data={
      inputType: "all"   
    }
    // Perform API request using a generic request handler
    const response = await handleApiRequestAfterLoginService(
      API_BASE_URL,
      `getAndSentPendingUsersDetails`,
      "post",
      token,
      data
    );

    return response;
  } catch (error) {
    console.error("Error fetching borrower EMI requests:", error);
    throw error;
  }
};

export const getcommentsHistory = async (value) => {
  try{
    const token = getToken();
    const response = await handleApiRequestAfterLoginService(
      API_BASE_URL,
      `commentHistory/${value.userDisplayId || value.lenderId}`,
      "get",
      token,
      // data
    );
    return response;
  } catch (error) {
    console.error("Error fetching comments history:", error);
    throw error;
  }
};


// NOFICATIONS API CALLS

export const handleSendMessageNotification=async(value)=>{
  try {
    // Get token and user ID from session storage
    const token = getToken();
    const userId = getUserId();
    let data;
    data={
      inputType: "message",
      pendingUsersDto:value
    }
    console.log({data})
    // Perform API request using a generic request handler
    const response = await handleApiRequestAfterLoginService(
      API_BASE_URL,
      `getAndSentPendingUsersDetails`,
      "post",
      token,
      data
    );

    return response;
  } catch (error) {
    console.error("Error fetching borrower EMI requests:", error);
    throw error;
  }
}




export const handleAddBorrowerRequest = async (submissionData) => {
  const token = getToken();
  const userId = getUserId();
  const data = {
    email:submissionData.email,
    fullName:submissionData.fullName,
    userId:submissionData.userId ,
    loanAmount: submissionData.loanAmount,
    paidAmount:submissionData.paidAmount,
    pendingAmount: submissionData.pendingAmount,
    loanCreatedDate: submissionData.loanCreatedDate,
    loanExpireDate: submissionData.loanExpiryDate,
    mobileNumber: submissionData.mobileNumber
    };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `savePendingLoanUsresInfo`,
    "POST",
    token,
    data
  );
  return response;
};

export const handleBorrowerMessageRequest = async (submissionData) => {
  const token = getToken();
  const userId = getUserId();
  const data = {
    email:submissionData.email,
    fullName:submissionData.fullName,
    userId:submissionData.userId ,
    loanAmount: submissionData.loanAmount,
    paidAmount:submissionData.paidAmount,
    pendingAmount: submissionData.pendingAmount,
    loanCreatedDate: submissionData.loanCreatedDate,
    loanExpireDate: submissionData.loanExpiryDate,
    mobileNumber: submissionData.mobileNumber
    };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `savePendingLoanUsresInfo`,
    "POST",
    token,
    data
  );
  return response;
};


export const handleDashboardUsersData = async () => {
  // console.log("Handle Dashboard Data...",value);
  try {
    // Get token and user ID from session storage
    const token = getToken();
    const userId = getUserId();

    // Perform API request using a generic request handler
    const response = await handleApiRequestAfterLoginService(
      API_BASE_URL,
      `${userId}/dashboard/ADMIN?current=false`,
      "GET",
      token
    );

    return response;
  } catch (error) {
    console.error("Error fetching dashboard count1:", error.response);
    throw error;
  }
};

export const AssignedDataforUser = async (pageValue) => {
  // console.log("Handle Dashboard Data...",value);
  try {
    // Get token and user ID from session storage
    const token = getToken();
    const userId = getUserId();
// console.log({pageValue})
    // Perform API request using a generic request handler
    const response = await handleApiRequestAfterLoginService(
      API_BASE_URL,
      `assigned-users/${userId}`,
      "POST",
      token,
      pageValue
    );
    return response;
  } catch (error) {
    console.error("Error fetching dashboard count1:", error.response);
    throw error;
  }
};

export const fetchActiveLendersData = async () => {
  // console.log("Handle Dashboard Data...",value);
  try {
    // Get token and user ID from session storage
    const token = getToken();
    const userId = getUserId();
    const data={
              pageNo: 1,
              pageSize: 10
              }
    // Perform API request using a generic request handler
    const response = await handleApiRequestAfterLoginService(
      API_BASE_URL,
      `activLendersParicipationAmountAndCount`,
      "POST",
      token,
      data,
      
    );

    return response;
  } catch (error) {
    console.error("Error fetching Active lenders count:", error);
    throw error;
  }
};

// export const handleGetCICReports = async (value) => {
//   console.log("Fetching CIC reports...",value);
//   const data={
//     reportsType:value,
//   }
//   try {
//     // Get token and user ID from session storage
//     const token = getToken();
//     const userId = getUserId();

//     // Perform API request using a generic request handler
//     const response = await handleApiRequestAfterLoginService(
//       API_BASE_URL,
//       `getCICReports`,
//       "POST",
//       token,
//       data
//     );

//     return response;
//   } catch (error) {
//     console.log("getting");
    
//     console.error("Error fetching borrower EMI requests:", error);
//     throw error;
//   }
// };

export const handleGetCICReports = async (value,month,year) => {
  console.log("Fetching CIC reports...",value,month,year);
  let data
  if(value=="all"){
  data={
    reportsType:value,
  }  
}
else{
  console.log("sreeja")
}
// else{
//   data={
//     setNo:Number(value),
//     monthName:month,
//     year:year,
//   }  
// }
  const token = getToken();
  const userId = getUserId();
 
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `getCICReports`,
    "POST",
    token,
    data
  );
  return response;
};

export const searchCallLender = async (data) => {
  const token = getToken();
  const userId = getUserId();
  console.log("data",data)
   const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userisIn=="local"?1:6680}/loan/ADMIN/request/search`,
    "POST",
    token,
    data
  );

  return response;
};

export const commentsAdminApiCall = async (data) => {
  const admincomment  = localStorage.getItem("admincomment")
  const token = getToken();
  const userId = getUserId();
  // console.log(data)
  const patchdatastring = data
  //JSON.stringify({"location":"","locationResidence":"","companyName":"","companyResidence":"","role":"","loanRequirement":"","emi":"","salary":"","eligibility":"","cibilPassword":"","comments":"Test","commentedBy":"","aadharPassword":"","panPassword":"","bankPassword":"","payslipsPassword":""});

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/loan/ADMIN/request/${admincomment}/comment`, // updated
    "PATCH",
    token,
    patchdatastring
  );
  
  return response;
}

export const searchCall = async (data) => {
  const token = getToken();
  const userId = getUserId();
  console.log("data",data)
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/loan/ADMIN/request/search`,
    "POST",
    token,
    data
  );

  return response;
};


export const handleLenderLoanApplication=async()=>{
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userisIn=="local"?1:6680}/loan/ADMIN/request/search`,
    "POST",
    token,
    // postdatastring
  );

  return response;
}

export const handleChangePrimaryType=async(value,type)=>{
  const token = getToken();
  const userId = getUserId();
  console.log("value",value.userDisplayId,type)

   const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${value.userDisplayId}/changeprimarytype/${type}`,
    "PATCH",
    token,
    // postdatastring
  );

   return response;
}

export const handleChangeToTestUser=async(value)=>{
  const token = getToken();
  const userId = getUserId();
  console.log("value",value.userDisplayId)

   const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${value.userDisplayId}/testUser`,
    "PATCH",
    token,
    // postdatastring
  );

   return response;
}

export const handleInterestStatus=async(value)=>{
  const token = getToken();
  const userId = getUserId();
  // console.log("value",value.userDisplayId)

  let data={
    id: value.userDisplayId, 
    status: "ACTIVE"
  }

   const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userisIn=="local"?1:6680}/loan/ADMIN/updateuserstatus`,
    "PATCH",
    token,
    data
    // postdatastring
  );

   return response;
}

export const handleComments=async(value1,value2,formattedDate)=>{
  const token = getToken();
  const userId = getUserId();
  const email=getEmail()
  console.log("handleComments value",value1)
  // console.log(value1.lenderUser.mobileNumber)
  // console.log(email.split("@")[0])

  let data = {
    loanRequestId: value1.loanRequestId || 0,
    updatedByUserId: Number(value1.userDisplayId ?? value1.lenderId ?? 0),
    updatedByName: email?.split("@")[0] || "",
    comment: value2,
    created_at: formattedDate,
    telecallinguserid: userId,
    userName: value1.user?.firstName || value1.lenderName,
    userMobileNumber: value1.lenderUser?.mobileNumber || value1.mobileNumber,
  };
  console.log({data})

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `commentshistory`,
    "POST",
    token,
    data
    // postdatastring
  );

   return response;
}

export const handlegetComments=async(value)=>{
  const token = getToken();
  const userId = getUserId();
  console.log("value",value.userDisplayId  || value.lenderId)
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `commentshistorygetting/${value.userDisplayId || value.lenderId}`,
    "get",
    token,
    // data
    // postdatastring
  );

  return response;

}


export const handleupdatedob=async(value1,value2)=>{
  const token = getToken();
  const userId = getUserId();
  // console.log("value",value1.userDisplayId)

  let data={
    orginalDob:value2,
    userId:value1.userDisplayId
  }
  console.log({data})

   const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `user_dob`,
    "PATCH",
    token,
    data
    // postdatastring
  );

   return response;
}

export const handleSendStatement=async(value)=>{
  const token = getToken();
  const userId = getUserId();
  // console.log("value",value1.userDisplayId)

  // let data={
  //   orginalDob:value2,
  //   userId:value1.userDisplayId
  // }
  // console.log({data})

   const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${value.userDisplayId}/sendpdf/LENDER`,
    "GET",
    token,
    // postdatastring
  );

   return response;
}

export const handleEmiUpdateComments=async(value)=>{
  const token = getToken();
  const userId = getUserId();
  // console.log("value",value1.userDisplayId)

  // let data={
  //   orginalDob:value2,
  //   userId:value1.userDisplayId
  // }
  // console.log({data})

   const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${value.userDisplayId}/updateemicomments`,
    "GET",
    token,
    // postdatastring
  );

   return response;
}

export const handlefetchDownloadReport=async()=>{
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `paticipatedsixmothsago`,
    "POST",
    token,
    // postdatastring
  );

  return response;
}

export const handleWalletloadednotpaticipatedDownloadReport=async()=>{
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `walletloadednotpatcipated`,
    "POST",
    token,
    // postdatastring
  );

  return response;
}

export const handleNotParticipatedLendersindeal=async(startDate,endDate)=>{
  const token = getToken();
  const userId = getUserId();
  console.log("value",startDate,endDate)
  const data={
    startDate:startDate,
    endDate:endDate
  }
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `notparticipatedlendersindeal`,
    "POST",
    token,
    data
  );

  return response;
}

export const fetchonlyonceparticipatedusers=async()=>{
  const token = getToken();
  const userId = getUserId();
  const data={
    pageNo:1,
    pageSize:10
  }
 
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `only_once_participated_lenders`,
    "POST",
    token,
    data
  );
return response
}

export const handletwiceparticipated=async()=>{
  const token = getToken();
  const userId = getUserId();
  let data={
    pageNo:1,
    pageSize:10
  }
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `only-twice-paticipated-lenders`,
    "POST",
    token,
    data
  );

  return response;
}

export const handlemorethanhundreddealsparticipated=async()=>{
  const token = getToken();
  const userId = getUserId();
  let data={
    pageNo:1,
    pageSize:10
  }
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `morethan-hundred-deals-paticipated-lenders`,
    "POST",
    token,
    data
  );

  return response;
}

export const handleEmailwhatsappverified=async()=>{
  const token = getToken();
  const userId = getUserId();
  let data={
    pageNo:1,
    pageSize:10
  }
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `email-whatsapp-not-verified-lenders`,
    "POST",
    token,
    data
  );

  return response;
}

export const handleMorethantenlakhs=async()=>{
  const token = getToken();
  const userId = getUserId();
  let data={
    pageNo:1,
    pageSize:10
  }
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `more-than-ten-lakhs-interest-earned-lenders`,
    "POST",
    token,
    data
  );

  return response;
}

export const handleHelpDeskTestDeals=async(dealType, pageNo, pageSize)=>{
  const token = getToken();
  const userId = getUserId();
  let data={
    "pageNo":pageNo,
    "pageSize":pageSize,
    "dealType":dealType,
    "dealName":"TEST"
  }
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/listOfDealsInformationForEquityDeals`,
    "POST",
    token,
    data
  );

  return response;
}

export const handleHelpDeskSalariedDeals=async(dealType, pageNo, pageSize)=>{
  const token = getToken();
  const userId = getUserId();
  let data={
    "pageNo":pageNo,
    "pageSize":pageSize,
    "dealType":dealType,
    "dealName":"PERSONAL"
  }
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${userId}/listOfDealsInformationForEquityDeals`,
    "POST",
    token,
    data
  );

  return response;
}

export const updateUserDetails=async(valueId,email,mobileNumber)=>{
  const token = getToken();
  const userId = getUserId();
  let data={
    "email":email,
    "id":valueId,
    "mobileNumber":mobileNumber,
  }
  console.log({data})
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `updateMobileNumberAndEmail`,
    "PATCH",
    token,
    data
  );

  return response;
}

export const InterestDetailsTableApi = async (actualDate, status = "INITIATED") => {
  const token = getToken();
  const data = {
    actualDate, 
    status,      
  };

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    "getAllInterestUsersDeatils",
    "POST",
    token,
    data
  );

  return response;
};


export const ParticipationListApi = async (pageNo = 1, pageSize = 10, status = "ACTIVE") => {
  const token = getToken();

  const data = {
    pageNo,
    pageSize,
    partcipationStatus: status, 
  };

  try {
    return await handleApiRequestAfterLoginService(
      API_BASE_URL,
      "listOfPaticipations", 
      "POST",
      token,
      data
    );
  } catch (error) {
    console.error("API Call Failed:", error?.response?.data || error.message);
    throw error;
  }
};


export const MonthlyInterestLendersapi = async (month, year, startDate) => {
  const token = getToken();
  const endpoint = `MonthlyLevelInterestPaymentsInfo/${month}/${year}?startDate=${startDate}`;

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    endpoint,
    "GET",
    token
  );

  return response;
};

export const fetchTopLenders = async ()=>{
  const token = getToken();
  const response = await handleApiRequestAfterLoginService (
    API_BASE_URL,
    `getTopLendersInfo`,
    "GET",
    token,
  );
  return response;
}

export const getBorrowerCharges = async () => {
  const token = getToken();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `getBorrowerCharges`,
    "GET",
    token
  );
  return response;
};

export const updateBorrowerCharges = async (payload) => {
  const token = getToken();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `updateBorrowerCharges`,
    "PATCH",
    token,
    payload
  );
  return response;
};

export const getAdminUpdateProcessingFees = async () => {
  const token = getToken();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `getAdminUpdateProcessingFees`,
    "GET",
    token
  );
  return response;
};

export const adminUpdateProcessingFee = async (payload) => {
  const token = getToken();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `adminUpdateProcessingFee`,
    "PATCH",
    token,
    payload
  );
  return response;
};

export const radiusBasedFee = async (payload) => {
  const token = getToken();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `radiusBasedFee`,
    "PATCH",
    token,
    payload
  );
  return response;
};

export const getRadiusBasedFee = async () => {
  const token = getToken();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `getRadiusBasedfee`,
    "GET",
    token
  );
  return response;
};

export const updateBorrowerScore = async (payload) => {
  const token = getToken();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `updateBorrowerScore`,
    "PATCH",
    token,
    payload
  );
  return response;
};

export const getBorrowerCibilScore = async () => {
  const token = getToken();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `getBorrowerCibilScore`,
    "GET",
    token
  );
  return response;
};

export const adminBorrowerSecureInfo = async (payload) => {
  const token = getToken();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `borrowerSecureInfo`,
    "PATCH",
    token,
    payload
  );
  return response;
};

export const getAdminCreditReport = async (borrowerUserId) => {
  const token = getToken();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `${borrowerUserId}/adminCreditReport`,
    "GET",
    token
  );
  return response;
};

export const updateOxyScore = async (borrowerId, oxyScore, comments) => {
  const token = getToken();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `updateOxyScore`,
    "PATCH",
    token,
    { borrowerId, oxyScore, comments }
  );
  return response;
};

export const calculateRoiBasedOnCibilScore = async (cibilScore, userId) => {
  const token = getToken();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `calculateRoiBasedOnCibilScore`,
    "PATCH",
    token,
    { cibilScore: String(cibilScore), userId: String(userId) }
  );
  return response;
};

export const verifyDocument = async (userId, id, status) => {
  const token = getToken();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `verifyDocuments`,
    "PATCH",
    token,
    { userId: String(userId), id: String(id), status }
  );
  return response;
};

export const updateBorrowerComment = async (id, comments) => {
  const token = getToken();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    "updateComments",
    "PATCH",
    token,
    { id, comments }
  );
  return response;
};

export const getPendingBorrowerList = async (pageNo, pageSize, name) => {
  const token = getToken();
  
  const data = {
    pageNo: pageNo,
    pageSize: pageSize,
    name: name,
  };

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    "getPendingBorrowerList",
    "POST",
    token,
    data
  );

  return response;
};

export const getFailedBorrowerDocuments = async (borrowerId) => {
  const token = getToken();
  const response = await axios({
    method: "GET",
    url: `${API_BASE_URL}getFailedBorrowerDocuments/${borrowerId}`,
    headers: { accessToken: token },
  });
  return response;
};

export const uploadBorrowerDocument = async (borrowerId, file) => {
  const token = getToken();
  const formData = new FormData();
  formData.append("AADHAR", file);
  const response = await axios({
    method: "POST",
    url: `${API_BASE_URL}borrowerFileUpload/${borrowerId}`,
    data: formData,
    headers: { accessToken: token },
  });
  return response;
};

const buildAdminNotificationPayload = (payload) => {
  const adminId = Number(sessionStorage.getItem("userId"));
  return {
    ...payload,
    adminCreated: true,
    adminId: Number.isFinite(adminId) ? adminId : null,
    sendInApp: true,
    sendPush: true,
  };
};

const adminNotificationHeaders = () => {
  const token = getToken();
  if (!token) {
    throw new Error("Admin accessToken missing. Please log out and log in again.");
  }
  return {
    headers: {
      accessToken: token,
      accesstoken: token,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };
};

export const sendAdminNotificationAll = async (payload) => {
  return axios.post(
    `${AI_BASE_URL}admin/notifications/send-all`,
    buildAdminNotificationPayload(payload),
    adminNotificationHeaders()
  );
};

export const sendAdminNotificationSegment = async (payload) => {
  return axios.post(
    `${AI_BASE_URL}admin/notifications/send-segment`,
    buildAdminNotificationPayload(payload),
    adminNotificationHeaders()
  );
};

export const sendAdminNotificationLimited = async (payload) => {
  return axios.post(
    `${AI_BASE_URL}admin/notifications/send-limited`,
    buildAdminNotificationPayload(payload),
    adminNotificationHeaders()
  );
};

export const sendAdminNotificationIndividual = async (payload) => {
  return axios.post(
    `${AI_BASE_URL}admin/notifications/send-individual`,
    buildAdminNotificationPayload(payload),
    adminNotificationHeaders()
  );
};

export const getAdminNotifications = async (page = 0, size = 10) => {
  return axios.get(
    `${AI_BASE_URL}admin/notifications/getAllAdminNotifications?page=${page}&size=${size}`,
    adminNotificationHeaders()
  );
};

export const getAdminNotificationDispatchStatus = async (notificationId) => {
  return axios.get(
    `${AI_BASE_URL}admin/notifications/${notificationId}/dispatch-status`,
    adminNotificationHeaders()
  );
};

export const getAdminNotificationAnalytics = async (notificationId) => {
  return axios.get(
    `${AI_BASE_URL}admin/notifications/${notificationId}/analytics`,
    adminNotificationHeaders()
  );
};

export const deleteAdminNotification = async (notificationId) => {
  return axios.delete(
    `${AI_BASE_URL}admin/notifications/${notificationId}`,
    adminNotificationHeaders()
  );
};

export const duplicateAdminNotification = async (notificationId) => {
  return axios.post(
    `${AI_BASE_URL}admin/notifications/${notificationId}/duplicate`,
    {},
    adminNotificationHeaders()
  );
};

export const getAdminNotificationStatistics = async () => {
  return axios.get(
    `${AI_BASE_URL}admin/notifications/analytics/statistics`,
    adminNotificationHeaders()
  );
};

export const getAdminNotificationAvgReadPercentage = async () => {
  return axios.get(
    `${AI_BASE_URL}admin/notifications/analytics/avg-read-percentage`,
    adminNotificationHeaders()
  );
};
const adminRegisteredUsersHeaders = () => {
  const token = getToken();
  return token ? { accessToken: token } : {};
};

export const getRegisteredUsersSummary = async () => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/summary`, {
    headers: adminRegisteredUsersHeaders(),
    timeout: 120000,
  });
  return response.data;
};

export const getAdminAIUserMapPins = async (state = "all", limit = 500) => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/geography/user-pins`, {
    headers: adminRegisteredUsersHeaders(),
    params: { state: state || "all", limit },
    timeout: 30000,
  });
  return response.data;
};

export const getAdminAIActiveLenderStates = async () => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/geography/active-lender-states`, {
    headers: adminRegisteredUsersHeaders(),
    timeout: 30000,
  });
  return response.data;
};

export const getAdminAITopLenders = async (limit = 10) => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/top-lenders`, {
    headers: adminRegisteredUsersHeaders(),
    params: { limit },
    timeout: 120000,
  });
  return response.data;
};

export const getAdminAIMonthlyTopLenders = async (yearMonth, limit = 10) => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/top-lenders/monthly`, {
    headers: adminRegisteredUsersHeaders(),
    params: { yearMonth, limit },
    timeout: 120000,
  });
  return response.data;
};

export const getAdminAITopLendersMonthlyTrend = async (months = 12) => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/top-lenders/monthly-trend`, {
    headers: adminRegisteredUsersHeaders(),
    params: { months },
    timeout: 120000,
  });
  return response.data;
};

export const getAdminAIActiveLenders = async (pageNo = 1, pageSize = 10, filters = {}) => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/active-lenders/profiles`, {
    headers: adminRegisteredUsersHeaders(),
    params: {
      pageNo,
      pageSize,
      lenderId: filters.lenderId || undefined,
      mobileNumber: filters.mobileNumber || undefined,
      includeBankDetails: filters.includeBankDetails === false ? false : undefined,
    },
    timeout: 180000,
  });
  return response.data;
};

export const getAdminAIActiveLendersSheetData = async () => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/active-lenders/sheet-data`, {
    headers: adminRegisteredUsersHeaders(),
    timeout: 300000,
  });
  return response.data;
};

export const getAdminAILenderAnalyticsSummary = async () => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/lender-analytics/summary`, {
    headers: adminRegisteredUsersHeaders(),
    timeout: 120000,
  });
  return response.data;
};

export const getAdminAILenderAnalyticsLenders = async (segment, pageNo = 1, pageSize = 20) => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/lender-analytics/lenders`, {
    headers: adminRegisteredUsersHeaders(),
    params: { segment, pageNo, pageSize },
    timeout: 120000,
  });
  return response.data;
};

export const downloadAdminAILenderAnalyticsExcel = async (segment) => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/lender-analytics/export`, {
    headers: adminRegisteredUsersHeaders(),
    params: { segment },
    responseType: "blob",
    timeout: 300000,
  });
  return response;
};

export const downloadAdminAIDashboardExcel = async (section = "overview") => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/dashboard/export`, {
    headers: adminRegisteredUsersHeaders(),
    params: { section },
    responseType: "blob",
    timeout: 600000,
  });
  return response;
};

export const downloadAdminAIUsersExcel = async (userView = "registered") => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/users/export`, {
    headers: adminRegisteredUsersHeaders(),
    params: { userView },
    responseType: "blob",
    timeout: 600000,
  });
  return response;
};

export const parseAdminAIExportError = async (error) => {
  const blob = error?.response?.data;
  if (blob instanceof Blob) {
    try {
      const text = await blob.text();
      const payload = JSON.parse(text);
      return payload?.errorMessage || text;
    } catch {
      return "Export failed. Restart backend and try again.";
    }
  }
  return error?.response?.data?.errorMessage || error?.message || "Export failed.";
};

export const fetchAllAdminUsersForExport = async (userView = "registered", onProgress) => {
  const requestPageSize = 100;
  const rows = [];
  let pageNo = 1;
  let totalCount = 0;
  let effectivePageSize = requestPageSize;

  while (pageNo <= 500) {
    if (typeof onProgress === "function") {
      onProgress(pageNo, totalCount || rows.length);
    }
    const data = await getAdminAIUsers(pageNo, requestPageSize, userView, {});
    effectivePageSize = Number(data?.pageSize) || effectivePageSize;
    const batch = Array.isArray(data?.users) ? data.users : [];
    if (pageNo === 1) {
      totalCount = Number(data?.totalCount) || 0;
    }
    if (!batch.length) {
      break;
    }
    rows.push(...batch);
    if (totalCount > 0 && rows.length >= totalCount) {
      break;
    }
    if (batch.length < effectivePageSize) {
      break;
    }
    pageNo += 1;
  }

  return { rows, totalCount: totalCount || rows.length };
};

export const fetchAllCreatedDealsForExport = async (dealView = "all", onProgress) => {
  const requestPageSize = 100;
  const rows = [];
  let pageNo = 1;
  let totalCount = 0;
  let effectivePageSize = requestPageSize;

  while (pageNo <= 200) {
    if (typeof onProgress === "function") {
      onProgress(pageNo, totalCount || rows.length);
    }
    const data = await getAdminAICreatedDeals(pageNo, requestPageSize, dealView, {});
    effectivePageSize = Number(data?.pageSize) || effectivePageSize;
    const batch = Array.isArray(data?.deals) ? data.deals : [];
    if (pageNo === 1) {
      totalCount = Number(data?.totalCount) || 0;
    }
    if (!batch.length) {
      break;
    }
    rows.push(...batch);
    if (totalCount > 0 && rows.length >= totalCount) {
      break;
    }
    if (batch.length < effectivePageSize) {
      break;
    }
    pageNo += 1;
  }

  return { rows, totalCount: totalCount || rows.length };
};

export const generateAdminAILenderCampaignMessage = async (payload) => {
  const response = await axios.post(
    `${API_BASE_URL}admin/registered-users/lender-analytics/campaign/generate-message`,
    payload,
    {
      headers: adminRegisteredUsersHeaders(),
      timeout: 120000,
    }
  );
  return response.data;
};

export const sendAdminAILenderSegmentCampaign = async (payload) => {
  const response = await axios.post(
    `${API_BASE_URL}admin/registered-users/lender-analytics/campaign/send`,
    payload,
    {
      headers: adminRegisteredUsersHeaders(),
      timeout: payload?.channel === "whatsapp" ? 3600000 : 600000,
    }
  );
  return response.data;
};

export const uploadAdminAILenderCampaignImage = async (file) => {
  const formData = new FormData();
  formData.append("BULKINVITE", file);
  const response = await axios.post(
    `${API_BASE_URL}admin/registered-users/lender-analytics/campaign/upload-image`,
    formData,
    {
      headers: adminRegisteredUsersHeaders(),
      timeout: 120000,
    }
  );
  const payload = response.data;
  if (payload?.status === "FAILED") {
    throw new Error(payload?.message || "Image upload failed.");
  }
  const url = payload?.downloadUrl || payload?.url;
  if (!url) {
    throw new Error(payload?.message || "Image upload did not return a URL.");
  }
  return url;
};

export const fetchAllLenderAnalyticsForExport = async (segment, onProgress) => {
  const requestPageSize = 100;
  const rows = [];
  let pageNo = 1;
  let totalCount = 0;

  while (pageNo <= 50) {
    if (typeof onProgress === "function") {
      onProgress(pageNo, totalCount);
    }

    const data = await getAdminAILenderAnalyticsLenders(segment, pageNo, requestPageSize);
    const batch = Array.isArray(data?.activeLenders) ? data.activeLenders : [];
    if (pageNo === 1) {
      totalCount = Number(data?.totalCount) || 0;
    }
    if (!batch.length) {
      break;
    }

    rows.push(...batch);

    if (totalCount > 0 && rows.length >= totalCount) {
      break;
    }
    if (batch.length < requestPageSize) {
      break;
    }

    pageNo += 1;
  }

  return { rows, totalCount };
};

export const fetchAllActiveLendersForExport = async (onProgress) => {
  const requestPageSize = 100;
  const rows = [];
  let pageNo = 1;
  let totalCount = 0;
  let effectivePageSize = requestPageSize;

  while (pageNo <= 50) {
    if (typeof onProgress === "function") {
      onProgress(pageNo, totalCount || rows.length);
    }

    const data = await getAdminAIActiveLenders(pageNo, requestPageSize, {
      lenderId: "",
      mobileNumber: "",
      includeBankDetails: false,
    });

    effectivePageSize = Number(data?.pageSize) || effectivePageSize;
    const batch = Array.isArray(data?.activeLenders) ? data.activeLenders : [];
    if (pageNo === 1) {
      totalCount = Number(data?.totalCount) || 0;
    }
    if (!batch.length) {
      break;
    }

    rows.push(...batch);

    if (totalCount > 0 && rows.length >= totalCount) {
      break;
    }
    if (batch.length < effectivePageSize) {
      break;
    }

    pageNo += 1;
  }

  return { rows, totalCount: totalCount || rows.length };
};

export const downloadAdminAIActiveLendersExcel = async () => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/active-lenders/export`, {
    headers: adminRegisteredUsersHeaders(),
    responseType: "blob",
    timeout: 300000,
  });
  return response;
};

export const getAdminAIUsers = async (pageNo = 1, pageSize = 20, userView = "registered", filters = {}) => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/users`, {
    headers: adminRegisteredUsersHeaders(),
    params: {
      pageNo,
      pageSize,
      userView,
      userId: filters.userId || undefined,
      mobileNumber: filters.mobileNumber || undefined,
      email: filters.email || undefined,
      state: filters.state || undefined,
    },
    timeout: 120000,
  });
  return response.data;
};

export const getAdminAIActiveLenderDeals = async (lenderId) => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/active-lenders/${lenderId}/deals`, {
    headers: adminRegisteredUsersHeaders(),
  });
  return response.data;
};

export const getAdminAIActiveLenderProfile = async (lenderId) => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/active-lenders/${lenderId}/profile`, {
    headers: adminRegisteredUsersHeaders(),
  });
  return response.data;
};

export const getAdminAIActiveLenderFullDetails = async (lenderId) => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/active-lenders/${lenderId}/full-details`, {
    headers: adminRegisteredUsersHeaders(),
  });
  return response.data;
};

export const getAdminAIActiveLenderUserRepoProfile = async (lenderId) => {
  const response = await axios.get(
    `${API_BASE_URL}admin/registered-users/active-lenders/${lenderId}/user-repo-profile`,
    {
      headers: adminRegisteredUsersHeaders(),
    }
  );
  return response.data;
};

export const getAdminAIActiveLenderBankDetails = async (lenderId) => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/active-lenders/${lenderId}/bank-details`, {
    headers: adminRegisteredUsersHeaders(),
  });
  return response.data;
};

export const getAdminAIActiveLenderReturnsSummary = async (lenderId) => {
  const response = await axios.get(
    `${API_BASE_URL}admin/registered-users/active-lenders/${lenderId}/returns-summary`,
    {
      headers: adminRegisteredUsersHeaders(),
      timeout: 120000,
    }
  );
  return response.data;
};

export const getAdminAIActiveLenderLegacyDetails = async (lenderId) => {
  const response = await axios.get(`${API_BASE_URL}${lenderId}/activLendersParicipationAmountAndCount`, {
    headers: adminRegisteredUsersHeaders(),
  });
  return response.data;
};

export const getAdminAIActiveLenderWallet = async (lenderId) => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/active-lenders/${lenderId}/wallet`, {
    headers: adminRegisteredUsersHeaders(),
    timeout: 120000,
  });
  return response.data;
};

export const getAdminAIActiveLenderWalletTransactions = async (lenderId, pageNo = 1, pageSize = 10) => {
  const response = await axios.get(
    `${API_BASE_URL}admin/registered-users/active-lenders/${lenderId}/wallet/transactions`,
    {
      headers: adminRegisteredUsersHeaders(),
      params: { pageNo, pageSize },
      timeout: 120000,
    }
  );
  return response.data;
};

export const getAdminAIMonthlyInterestEarnings = async (lenderId, startDate = "2020-01-01", endDate = "2030-12-31") => {
  const response = await axios.post(
    `${API_BASE_URL}monthly_interest_earnings`,
    { userId: lenderId, startDate, endDate },
    {
      headers: adminRegisteredUsersHeaders(),
      timeout: 120000,
    }
  );
  return response.data;
};

export const getAdminAIActiveLenderDealInterestDetails = async (lenderId, dealId) => {
  const response = await axios.get(
    `${API_BASE_URL}admin/registered-users/active-lenders/${lenderId}/deals/${dealId}/interest-details`,
    {
      headers: adminRegisteredUsersHeaders(),
      timeout: 120000,
    }
  );
  return response.data;
};

export const getAdminAICreatedDeals = async (pageNo = 1, pageSize = 20, dealView = "regular", filters = {}) => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/deals/created`, {
    headers: adminRegisteredUsersHeaders(),
    params: {
      pageNo,
      pageSize,
      dealView,
      dealId: filters.dealId || undefined,
      dealName: filters.dealName || undefined,
    },
  });
  return response.data;
};

export const getAdminAICreatedDealParticipants = async (dealId) => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/deals/${dealId}/participants`, {
    headers: adminRegisteredUsersHeaders(),
  });
  return response.data;
};

export const getAdminAILenderReferenceDetails = async (lenderId, pageNo = 1, pageSize = 20) => {
  const response = await axios.post(
    `${API_BASE_URL}${lenderId}/allLenderReferenceDetails`,
    {
      pageNo,
      pageSize,
      primaryType: "LENDER",
    },
    {
      headers: {
        ...adminRegisteredUsersHeaders(),
        "Content-Type": "application/json",
      },
      timeout: 120000,
    }
  );
  return response.data;
};

export const getAdminAILenderReferralEarnings = async (lenderId, pageNo = 1, pageSize = 5) => {
  const response = await axios.post(
    `${API_BASE_URL}referralBonusAmountBasedOnStatus`,
    {
      pageNo,
      pageSize,
      paymentStatus: "",
      userId: lenderId,
    },
    {
      headers: {
        ...adminRegisteredUsersHeaders(),
        "Content-Type": "application/json",
      },
      timeout: 120000,
    }
  );
  return response.data;
};

export const getAdminAIActiveLenderReferrals = async (lenderId, pageNo = 1, pageSize = 5) => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/active-lenders/${lenderId}/referrals`, {
    headers: adminRegisteredUsersHeaders(),
    params: { pageNo, pageSize },
    timeout: 120000,
  });
  return response.data;
};

export const getAdminAIActiveLenderReferralDeals = async (lenderId, refereeId) => {
  const response = await axios.get(
    `${API_BASE_URL}admin/registered-users/active-lenders/${lenderId}/referrals/${refereeId}/deals`,
    {
      headers: adminRegisteredUsersHeaders(),
      timeout: 120000,
    }
  );
  return response.data;
};

export const getLenderListNearByRediusForBorrower = async (
  borrowerUserId,
  pageNo = 1,
  pageSize = 10000
) => {
  const token = getToken();
  const payload = {
    pageNo,
    pageSize,
    userId: String(borrowerUserId),
  };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    "getLenderListNearByRedius1",
    "POST",
    token,
    payload
  );
  return response;
};

export const getBorrowerListNearByRediusForLender = async (
  lenderUserId,
  pageNo = 1,
  pageSize = 1000
) => {
  const token = getToken();
  const payload = {
    pageNo,
    pageSize,
    userId: String(lenderUserId),
  };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    "getBorrowerListNearByRedius1",
    "POST",
    token,
    payload
  );
  return response;
};