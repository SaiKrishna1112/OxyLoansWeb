import axios from "axios";
import { API_USER_URL as API_BASE_URL } from "../../config";
import { initWebPush } from "../../utils/fcmWebPush";
// const userisIn = "local"; //local or production
// let API_BASE_URL =
//   userisIn == "local"
//     ? "http://ec2-15-207-239-145.ap-south-1.compute.amazonaws.com:8080/oxynew/v1/user/"
//     : "https://fintech.oxyloans.com/oxyloans/v1/user/";

function registerFcmAfterLogin(userId, accessToken) {
  if (userId && accessToken) {
    initWebPush(userId, accessToken).catch(() => {});
  }
}
/** True when axios returned HTTP 200 (not an error object). */
export const isApiSuccess = (response) => {
  if (!response) return false;
  const status = response.status ?? response.response?.status;
  return status === 200;
};

/** User-facing title + message from API error or axios error. */
export const warnApiError = (response, title = "Error", fallback = "Request failed") => {
  const data = response?.response?.data ?? response?.data;
  const message =
    (typeof data === "string" && data.trim()) ||
    data?.errorMessage ||
    data?.error ||
    response?.message ||
    fallback;
  return { title, message };
};

const handleApiRequestBeforeLogin = async (
  method,
  BASE_URL,
  End_Url,
  POSTDATA
) => {
  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${End_Url}`,
      data: POSTDATA,
      timeout: 20000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status == 200) {
      return response;
    }
  } catch (error) {
    if (!error?.response) {
      const netErr = new Error(
        `Cannot reach API at ${BASE_URL}. Start backend on port 8181 (test profile), then restart npm start.`
      );
      netErr.code = "ERR_NETWORK";
      return netErr;
    }
    return error;
  }
};

export const sendotpemail = async (email) => {
  const data = {
    email: email,
    projectType: "REACT",
  };
  const response = handleApiRequestBeforeLogin(
    "POST",
    API_BASE_URL,
    "resetpassword",
    data
  );
  return response;
};

/** Parse LR55573, BR123, or plain numeric admin user id */
export const parseAdminUserId = (raw) => {
  const s = String(raw || "").trim();
  if (!s) return null;
  const match = s.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
};

export const Admlog = async (userid, password) => {
  const trimmedId = String(userid || "").trim();
  const trimmedPwd = String(password || "").trim();

  if (trimmedId.includes("@")) {
    return userloginSection(trimmedId, trimmedPwd);
  }

  const id = parseAdminUserId(trimmedId);
  if (!id) {
    return {
      response: {
        status: 400,
        data: { errorMessage: "Enter a valid user ID (e.g. LR55573 or 55573) or admin email." },
      },
    };
  }

  const data = {
    id,
    primaryType: trimmedPwd.toUpperCase(),
  };
  const response = await handleApiRequestBeforeLogin(
    "POST",
    API_BASE_URL,
    "login?grantType=PWD",
    data
  );

  if (response?.status === 200) {
    const accessTokenFromHeader = response.headers["accesstoken"];
    sessionStorage.setItem("accessToken", accessTokenFromHeader);
    localStorage.setItem("accessToken", accessTokenFromHeader);
    localStorage.setItem("primaryType", response.data.primaryType);
    sessionStorage.setItem("primaryType", response.data.primaryType);
    sessionStorage.setItem("userId", response.data.id);
    localStorage.setItem("userId", response.data.id);
    sessionStorage.setItem("tokenTime", response.data.tokenGeneratedTime);
    registerFcmAfterLogin(response.data.id, accessTokenFromHeader);
    return response;
  } else {
    sessionStorage.setItem("email", response.data.email || "");
    localStorage.setItem("primaryType", response.data.primaryType || "");
    return response;
  }
  return response;
};
export const partnerlogin = async (userid, password) => {
  const data = {
    partnerUtmName: userid,
    partnerPassword: password,
  };
  const response = await handleApiRequestBeforeLogin(
    "POST",
    API_BASE_URL,
    "login?grantType=PWD",
    data
  );

  if (response.status == 200) {
    const accessTokenFromHeader = response.headers["accesstoken"];
    sessionStorage.setItem("accessToken", accessTokenFromHeader);
    localStorage.setItem("accessToken", accessTokenFromHeader);
    sessionStorage.setItem("userId", response.data.id);
    localStorage.setItem("userId", response.data.id);
    sessionStorage.setItem("tokenTime", response.data.tokenGeneratedTime);
    registerFcmAfterLogin(response.data.id, accessTokenFromHeader);
    return response;
  } else {
    return response;
  }
};
export const userloginSection = async (email, password) => {
  const checkLoginMode = email.includes("@") == true ? true : false;
  const postdata =
    checkLoginMode === true
      ? JSON.stringify({ password: password, email: email })
      : JSON.stringify({
          password: password,
          mobileNumber: email,
        });

  const response = await handleApiRequestBeforeLogin(
    "POST",
    API_BASE_URL,
    "login?grantType=PWD",
    postdata
  );

  if (response?.status === 200) { 
    const accessTokenFromHeader = response.headers["accesstoken"];
    sessionStorage.setItem("accessToken", accessTokenFromHeader);
    localStorage.setItem("accessToken", accessTokenFromHeader);
    sessionStorage.setItem("userId", response.data.id);
    localStorage.setItem("userId", response.data.id);
    sessionStorage.setItem("tokenTime", response.data.tokenGeneratedTime);
    registerFcmAfterLogin(response.data.id, accessTokenFromHeader);
    sessionStorage.setItem("email", response.data.email || "");
    localStorage.setItem("primaryType", response.data.primaryType || "");
    return response;
  } else {
    return response;
  }
};
export const sendwhatappotp = async (value1) => {
  const value = value1.replace("+", "");
  const data = {
    whatsappNumber: value,
  };
  const response = await handleApiRequestBeforeLogin(
    "POST",
    API_BASE_URL,
    "whatsapp-login-otp",
    data
  );
  return response;
};
export const referrerdata = (referrerId, refParam) => {
  const numericPart = referrerId.match(/\d+$/);

  if (referrerId !== "") {
    const response = handleApiRequestBeforeLogin(
      "GET",
      API_BASE_URL,

      `${numericPart}/user-uniquenumber`
    );
    return response;
  } else {
    const response = handleApiRequestBeforeLogin(
      "GET",
      API_BASE_URL,

      `${refParam}/user-uniquenumber`
    );
    return response;
  }
};

export const handlesenOtp = async (moblie) => {
  var data = {
    mobileNumber: moblie,
  };
  const response = await handleApiRequestBeforeLogin(
    "POST",
    API_BASE_URL,
    `sendOtp`,
    data
  );
  return response;
};

export const usersubmitotp = async (email, password) => {
  const data = {
    mobileNumber: email,
    mobileOtpValue: password,
  };
  const response = await handleApiRequestBeforeLogin(
    "POST",
    API_BASE_URL,
    `login?grantType=PWD`,
    data
  );
  return response;
};

export const handelapidata = async (userId) => {
  const userid = userId.substring(2);
  const data = {};
  const response = await handleApiRequestBeforeLogin(
    "POST",
    API_BASE_URL,
    `whatsapp-login-after-otp-verification/${userid}`,
    data
  );
  return response;
};


export const verifywhatappotp = async (api, whatsapploginotp) => {
  const otpString = whatsapploginotp; // Concatenate the array elements into a single string
  const otpNumber = parseInt(otpString, 10);
  const data = {
    whatsappNumber: api.whatsappNumber,
    session: api.session,
    otp: otpNumber,
    id: api.id,
    otpGeneratedTime: api.otpGeneratedTime,
  };
  const response = await handleApiRequestBeforeLogin(
    "POST",
    API_BASE_URL,
    "whatsapp-login-otp-verification",
    data
  );
  return response;
};


// export const handleip4 = () => {
//   return handleApiRequestBeforeLogin(
//     "get",
//     "https://api.ipify.org/?format=json"
//   );
// };
// export const handleipv6 = () => {
//   return handleApiRequestBeforeLogin("get", "https://ipapi.co/json/");
// };

export const passwordupdated = async (
  emailToken,
  email,
  password,
  confirmPassword
) => {
  const data = {
    password: password,
    confirmPassword: confirmPassword,
  };
  const response = handleApiRequestBeforeLogin(
    "POST",
    API_BASE_URL,
    `resetpassword/${emailToken}`,
    data
  );
  return response;
};
