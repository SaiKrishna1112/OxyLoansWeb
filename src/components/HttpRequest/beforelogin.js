import axios from "axios";
import { ENV as userisIn, API_USER_URL as API_BASE_URL } from "../../config";

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
      timeout: 5000, // 5-second timeout so local mock kicks in quickly
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status == 200) {
      return response;
    }
  } catch (error) {
    // Ensure callers can always safely read error.response.data
    if (!error.response) {
      error.response = {
        data: {
          errorCode: "NETWORK_ERROR",
          errorMessage: "Unable to reach server. Please check your connection.",
        },
      };
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

export const Admlog = async (userid, password) => {
  const data = {
    id: userid,
    primaryType: password,
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
    sessionStorage.setItem("userId", response.data.id);
    sessionStorage.setItem("tokenTime", response.data.tokenGeneratedTime);
    return response;
  } else {
    return response;
  }
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
    sessionStorage.setItem("userId", response.data.id);
    sessionStorage.setItem("tokenTime", response.data.tokenGeneratedTime);
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

  if (response.status == 200) { 
    const accessTokenFromHeader = response.headers["accesstoken"];
    console.log(accessTokenFromHeader)
    sessionStorage.setItem("accessToken", accessTokenFromHeader);
    sessionStorage.setItem("userId", response.data.id);
    sessionStorage.setItem("tokenTime", response.data.tokenGeneratedTime);
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
    "sendWhatsappOtp",
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
  // Local dev fallback: if API is unreachable, simulate OTP sent successfully
  if (userisIn === "local" && response && !response.status) {
    console.warn("LOCAL MODE: sendOtp API unreachable — using mock. OTP is: 1234");
    return {
      status: 200,
      data: { id: "LOCAL_TEST_USER_001" },
      request: { status: 200 },
    };
  }
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
  // Local dev fallback: if API is unreachable and OTP is 1234, simulate login success
  if (userisIn === "local" && response && !response.status) {
    if (password === "1234") {
      console.warn("LOCAL MODE: login API unreachable — using mock login for OTP 1234");
      return {
        status: 200,
        data: {
          id: "LOCAL_TEST_USER_001",
          primaryType: "BORROWER",
          tokenGeneratedTime: Date.now(),
        },
        headers: { accesstoken: "LOCAL_MOCK_TOKEN_" + Date.now() },
        request: { status: 200 },
      };
    }
    // Wrong OTP in local mock
    if (!response.response) {
      response.response = {
        data: {
          errorCode: "INVALID_OTP",
          errorMessage: "Invalid OTP. In local mode use: 1234",
        },
      };
    }
  }
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
    "verifyWhatsappOtp",
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
