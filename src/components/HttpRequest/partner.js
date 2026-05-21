import axios from "axios";
import { API_USER_URL as API_BASE_URL } from "../../config";

const handleApiRequestPartnerService = async (
  endpoint,
  method,
  data = null,
  headers = {},
  accessToken = null
) => {
  try {
    const response = await axios({
      method,
      url: `${API_BASE_URL}/${endpoint}`,
      data,
      headers: {
        "Content-Type": "application/json",
        accessToken,
        ...headers,
      },
    });
    if (response.ok) {
      const processedData = response.data;
      return processedData;
    }
  } catch (error) {
    throw error;
  }
};




const getToken = () => {
  return sessionStorage.getItem("accessToken");
};
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




export  const  handelclickapicall = async (partnerdata)=>{
  const token = getToken();
  const userId = getUserId();


  const data = {

partnerId:userId,
adminStatus:partnerdata.Approval ? "ACCEPTED" :""

}
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `ApprovalAcceptReject`,
    "PATCH",
    token,
    data
  );
  return response;
}




export  const  getStatus = async ()=>{
  const token = getToken();
  const userId = getUserId();

  const data = {
    partnerId: userId,
  };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `getStatus`,
    "POST",
    token,
    data
  );
  return response;
}



export const getListOfBorrowerDetailsapi = async(pageNo = 1, pageSize = 10) => {
    const token = getToken();
  const userId = getUserId();

  const data = {
    "pageNo": pageNo,
    "pageSize": pageSize
}

  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `getListOfBorrowerDetails/${userId}`,
    "POST",
    token,
    data
  );
  return response;
}



export const partnerrequestInfoapi = async() => {
  const token = getToken();
  const userId = getUserId();
  const data = {
    comments: "Requesting For Borrower",
    partnerId: userId,
  };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `partnerrequestInfo`,
    "POST",
    token,
    data
  );
  return response;
};

export const getPartnerDashboardStats = async () => {
  const token = getToken();
  const userId = getUserId();
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `partnerDashboard/${userId}`,
    "GET",
    token
  );
  return response;
};

export const getPartnerReferredUsers = async (pageNo = 1, pageSize = 10) => {
  const token = getToken();
  const userId = getUserId();
  const data = { pageNo, pageSize };
  const response = await handleApiRequestAfterLoginService(
    API_BASE_URL,
    `partnerReferredUsers/${userId}`,
    "POST",
    token,
    data
  );
  return response;
};