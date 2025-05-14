import axios from "axios";
const userisIn = "prod";
const API_BASE_URL =
  userisIn == "local"
    ? "http://ec2-15-207-239-145.ap-south-1.compute.amazonaws.com:8080/oxyloans/v1/user/"
    : "https://fintech.oxyloans.com/oxyloans/v1/user/"; 

const getToken = () => {
  return sessionStorage.getItem("accessToken");
};
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
  if(value=="All"){
  data={
    reportsType:value,
  }  
}else{
  data={
    setNo:Number(value),
    monthName:month,
    year:year,
  }  
}
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
  // console.log("data",data)
   const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `6680/loan/ADMIN/request/search`,
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
    `6680/loan/ADMIN/request/search`,
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
    `6680/loan/ADMIN/updateuserstatus`,
    "PATCH",
    token,
    data
    // postdatastring
  );

   return response;
}

export const handleComments=async(value1,value2)=>{
  const token = getToken();
  const userId = getUserId();
  const email=getEmail()
  console.log("handleComments value",value1)
  console.log({value2})
  console.log(email.split("@")[0])

  let data={
    // comments: value2
    loanRequestId: value1.loanRequestId,
    updatedByUserId: Number(value1.userDisplayId),
    updatedByName: email.split("@")[0],
    comment: value2
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
    `paticipatedsixmothsago`,
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