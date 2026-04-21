import axios from "axios";
import { API_USER_URL as API_BASE_URL } from "../../config";



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