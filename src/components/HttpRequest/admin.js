import axios from "axios";
import { API_USER_URL as API_BASE_URL, BASE_URL } from "../../config";
const userisIn = "local"; //local or production
// const API_BASE_URL =
//   userisIn == "local"
//     ? "http://ec2-15-207-239-145.ap-south-1.compute.amazonaws.com:8080/oxynew/v1/user/"
//     : "https://fintech.oxyloans.com/oxyloans/v1/user/"; 



const getToken = () => {
  return sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
};

export const base_url=API_BASE_URL;
export const getUserId = () => {
  return sessionStorage.getItem("userId") || localStorage.getItem("userId");
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
    // Add your common logic here
    if (response.status == 200) {
      return response;
    }
  } catch (error) {
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

/** Legacy admin dashboard active-lender total (totalCoutOfactiveLenders). */
export const getOldDashboardActiveLendersCount = async () => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}activLendersParicipationAmountAndCount`,
      { pageNo: 1, pageSize: 10 },
      {
        headers: {
          "Content-Type": "application/json",
          ...adminRegisteredUsersHeaders(),
        },
        timeout: 120000,
      }
    );
    const totalCount = response?.data?.totalCount;
    if (totalCount == null || totalCount === "" || Number.isNaN(Number(totalCount))) {
      return null;
    }
    return Number(totalCount);
  } catch {
    return null;
  }
};

/** Paginate legacy active-lender participation rows for client-side band counts. */
export const fetchParticipationAmountsForBandCounts = async () => {
  const requestPageSize = 100;
  const rows = [];
  let pageNo = 1;
  let totalCount = 0;

  while (pageNo <= 50) {
    const response = await axios.post(
      `${API_BASE_URL}activLendersParicipationAmountAndCount`,
      { pageNo, pageSize: requestPageSize },
      {
        headers: {
          "Content-Type": "application/json",
          ...adminRegisteredUsersHeaders(),
        },
        timeout: 180000,
      }
    );
    const batch = Array.isArray(response?.data?.activeLendersResponse)
      ? response.data.activeLendersResponse
      : [];
    if (pageNo === 1) {
      totalCount = Number(response?.data?.totalCount) || 0;
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

  return { rows, totalCount: totalCount || rows.length };
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
  console.log(value1.lenderUser.mobileNumber)
  // console.log(email.split("@")[0])

  let data={
    // comments: value2
    loanRequestId: value1.loanRequestId,
    updatedByUserId: Number(value1.userDisplayId),
    updatedByName: email.split("@")[0],
    comment: value2,
    created_at:formattedDate,
    telecallinguserid:userId,
    userName:value1.user.firstName,
    userMobileNumber:value1.lenderUser.mobileNumber,

  }
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
console.log("value",value.userDisplayId )
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `commentshistorygetting/${value.userDisplayId}`,
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
      minParticipationAmount: filters.minParticipationAmount || undefined,
      maxParticipationAmount: filters.maxParticipationAmount || undefined,
      lenderView: filters.lenderView || undefined,
      participationDate: filters.participationDate || undefined,
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

export const getAdminAIInactiveReactivatedLenders = async (
  participationDate,
  inactiveInterval = "1 year"
) => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/lender-analytics/inactive-reactivated`, {
    headers: adminRegisteredUsersHeaders(),
    params: {
      participationDate: participationDate || defaultParticipationDate(),
      inactiveInterval,
    },
    timeout: 120000,
    validateStatus: (status) => status < 500,
  });
  return response.data;
};

export const INACTIVE_REACTIVATION_REPORT_START = "2026-06-30";

export const getAdminAIInactiveReactivatedWeekSummary = async (
  endDate,
  startDate = INACTIVE_REACTIVATION_REPORT_START,
  inactiveInterval = "1 year"
) => {
  const response = await axios.get(
    `${API_BASE_URL}admin/registered-users/lender-analytics/inactive-reactivated/week-summary`,
    {
      headers: adminRegisteredUsersHeaders(),
      params: {
        endDate: endDate || defaultParticipationDate(),
        startDate: startDate || INACTIVE_REACTIVATION_REPORT_START,
        inactiveInterval,
      },
      timeout: 180000,
      validateStatus: (status) => status < 600,
    }
  );
  return response.data;
};

export const parseAdminLenderIdSearch = (value) => {
  const text = String(value || "").trim().toUpperCase().replace(/^LR\s*/i, "");
  const id = Number(text.replace(/[^0-9]/g, ""));
  return Number.isNaN(id) || id <= 0 ? "" : id;
};

export const getAdminAILenderAnalyticsLenders = async (segment, pageNo = 1, pageSize = 20, lenderId = "") => {
  const params = { segment, pageNo, pageSize };
  const parsedLenderId = parseAdminLenderIdSearch(lenderId);
  if (parsedLenderId) {
    params.lenderId = parsedLenderId;
  }
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/lender-analytics/lenders`, {
    headers: adminRegisteredUsersHeaders(),
    params,
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

export const downloadAdminAIUsersExcel = async (userView = "registered", participationDate) => {
  const resolvedParticipationDate =
    userView === "todayParticipated" ? participationDate || defaultParticipationDate() : undefined;
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/users/export`, {
    headers: adminRegisteredUsersHeaders(),
    params: {
      userView,
      participationDate: resolvedParticipationDate,
    },
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

export const fetchAllAdminUsersForExport = async (userView = "registered", onProgress, filters = {}) => {
  const requestPageSize = 100;
  const rows = [];
  let pageNo = 1;
  let totalCount = 0;
  let effectivePageSize = requestPageSize;

  while (pageNo <= 500) {
    if (typeof onProgress === "function") {
      onProgress(pageNo, totalCount || rows.length);
    }
    const data = await getAdminAIUsers(pageNo, requestPageSize, userView, filters);
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
  const isScheduleOnly = Boolean(payload?.scheduleSend);
  const response = await axios.post(
    `${API_BASE_URL}admin/registered-users/lender-analytics/campaign/send`,
    payload,
    {
      headers: adminRegisteredUsersHeaders(),
      timeout: isScheduleOnly ? 180000 : (payload?.channel === "whatsapp" ? 3600000 : 600000),
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

export const getAdminAILenderCampaignHistory = async (segment, { channel, pageNo = 1, pageSize = 10 } = {}) => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/lender-analytics/campaign/history`, {
    headers: adminRegisteredUsersHeaders(),
    params: {
      segment: segment || undefined,
      channel: channel || undefined,
      pageNo,
      pageSize,
    },
    timeout: 120000,
    validateStatus: (status) => status < 500,
  });
  return response.data;
};

export const getAdminAILenderCampaignBatchDeliveries = async (batchId, { pageNo = 1, pageSize = 20, status } = {}) => {
  const response = await axios.get(
    `${API_BASE_URL}admin/registered-users/lender-analytics/campaign/history/deliveries`,
    {
      headers: adminRegisteredUsersHeaders(),
      params: {
        batchId,
        pageNo,
        pageSize,
        status: status || undefined,
      },
      timeout: 120000,
      validateStatus: (status) => status < 500,
    }
  );
  return response.data;
};

export const sendAdminAILenderCampaignAdminReport = async ({ batchId, target } = {}) => {
  const safeTarget = String(target || "").trim().toLowerCase();
  if (safeTarget !== "personal" && safeTarget !== "group") {
    throw new Error("Choose personal or group before sending the WhatsApp report.");
  }
  const response = await axios.post(
    `${API_BASE_URL}admin/registered-users/lender-analytics/campaign/admin-report/send`,
    {
      batchId: batchId || "",
      target: safeTarget,
    },
    {
      headers: adminRegisteredUsersHeaders(),
      timeout: 120000,
      validateStatus: (status) => status < 500,
    }
  );
  return response.data;
};

export const isCampaignDeliverySuccess = (status) => {
  const value = String(status ?? "").trim().toUpperCase();
  return value === "SUCCESS" || value === "SENT" || value === "DELIVERY";
};

export const isCampaignDeliveryFailed = (row) => !isCampaignDeliverySuccess(row?.status);

/** Fetch page 1 to read totalCount, then load every page until all rows are retrieved. */
export const fetchAllCampaignBatchDeliveries = async (batchId, { status, pageSize = 100 } = {}) => {
  if (!batchId) return [];

  const probe = await getAdminAILenderCampaignBatchDeliveries(batchId, {
    pageNo: 1,
    pageSize: 1,
    status: status || undefined,
  });
  if (probe?.status === "FAILED") {
    return [];
  }

  const total = Number(probe?.totalCount) || Number(probe?.batchFailedTotal) || Number(probe?.batchTotal) || 0;
  if (total <= 0) {
    return [];
  }

  const requestPageSize = Math.min(Math.max(pageSize, 1), 5000);
  const rows = [];
  const totalPages = Math.max(1, Math.ceil(total / requestPageSize));
  for (let page = 1; page <= totalPages && page <= 500; page += 1) {
    // eslint-disable-next-line no-await-in-loop
    const data = await getAdminAILenderCampaignBatchDeliveries(batchId, {
      pageNo: page,
      pageSize: requestPageSize,
      status: status || undefined,
    });
    if (data?.status === "FAILED") {
      break;
    }
    const batch = Array.isArray(data?.deliveries) ? data.deliveries : [];
    rows.push(...batch);
    if (rows.length >= total) {
      break;
    }
    if (batch.length < requestPageSize) {
      break;
    }
  }
  return rows;
};

export const fetchAllCampaignFailedDeliveries = async (batchId) => {
  const failedFromApi = await fetchAllCampaignBatchDeliveries(batchId, { status: "failed", pageSize: 5000 });
  const verifiedFailed = failedFromApi.filter(isCampaignDeliveryFailed);
  if (verifiedFailed.length > 0) {
    return verifiedFailed;
  }
  const allRows = await fetchAllCampaignBatchDeliveries(batchId, { pageSize: 5000 });
  return allRows.filter(isCampaignDeliveryFailed);
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

export const fetchAllActiveLendersForExport = async (onProgress, filters = {}) => {
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
      minParticipationAmount: filters.minParticipationAmount,
      maxParticipationAmount: filters.maxParticipationAmount,
      lenderView: filters.lenderView,
      participationDate: filters.lenderView === "newParticipated" ? defaultParticipationDate() : undefined,
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

export const parseAdminUserIdSearch = (value) => {
  const text = String(value || "").trim().toUpperCase().replace(/^(LR|BR)\s*/i, "");
  const id = Number(text.replace(/[^0-9]/g, ""));
  return Number.isNaN(id) || id <= 0 ? undefined : id;
};

export const defaultParticipationDate = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

export const getAdminAIUsers = async (
  pageNo = 1,
  pageSize = 20,
  userView = "registered",
  filters = {},
  options = {}
) => {
  const parsedUserId = parseAdminUserIdSearch(filters.userId);
  const participationDate =
    userView === "todayParticipated"
      ? filters.participationDate || defaultParticipationDate()
      : undefined;
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/users`, {
    headers: adminRegisteredUsersHeaders(),
    params: {
      pageNo,
      pageSize,
      userView,
      userId: parsedUserId || undefined,
      mobileNumber: filters.mobileNumber || undefined,
      email: filters.email || undefined,
      state: filters.state || undefined,
      participationDate,
      includeParticipation: options.includeParticipation === true ? true : undefined,
    },
    timeout: options.timeout || 120000,
  });
  return response.data;
};

export const getAdminAIUserParticipationDetails = async (
  userIds = [],
  userView = "todayParticipated",
  participationDate
) => {
  const ids = (userIds || []).filter((id) => Number(id) > 0);
  if (!ids.length) {
    return { details: [], userView };
  }
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/users/participation-details`, {
    headers: adminRegisteredUsersHeaders(),
    params: {
      userIds: ids.join(","),
      userView,
      participationDate:
        userView === "todayParticipated"
          ? participationDate || defaultParticipationDate()
          : undefined,
    },
    timeout: 60000,
  });
  return response.data;
};

export const getAdminAIActiveLenderDeals = async (lenderId) => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/active-lenders/${lenderId}/deals`, {
    headers: adminRegisteredUsersHeaders(),
  });
  return response.data;
};

export const getAdminAIBorrowerProfile = async (borrowerId) => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/borrowers/${borrowerId}/profile`, {
    headers: adminRegisteredUsersHeaders(),
  });
  return response.data;
};

export const getAdminAIBorrowerDeals = async (borrowerId) => {
  const response = await axios.get(`${API_BASE_URL}admin/registered-users/borrowers/${borrowerId}/deals`, {
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

