import axios from "axios";
import { API_USER_URL as API_BASE_URL } from "../../../config";

const API_URL = API_BASE_URL + "login?grantType=PWD";
const API_URL_otp = API_BASE_URL + "sendOtp";
// Function to perform the login API request
export const loginUser = async (email, password, dataIpv4, dataIpv6) => {
  var data = {
    password: password,
    email: email,
    ipAddress: dataIpv4,
    ipAddressResponse: dataIpv6,
    loginType: "WEB",
  };
  try {
    const response = await axios.post(API_URL, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const accessTokenFromHeader = response.headers["accesstoken"];
    console.log("Access Token API:", accessTokenFromHeader);
    localStorage.setItem("token", accessTokenFromHeader);

    if (!accessTokenFromHeader) {
      throw new Error("Access token not found in response headers");
    }

    return {
      accessToken: accessTokenFromHeader,
      responseData: response.data,
    };
  } catch (error) {
    throw error;
  }
};

export const validateInput = (email, password) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !email.match(emailRegex)) {
    return "Please enter a valid email address";
  }

  if (!password || password.length < 6) {
    return "Password must be at least 6 characters long";
  }
  return null;
};

export const sendotpemail = async (email) => {
  var data = {
    email: email,
  };
  try {
    const response = await axios.post(API_BASE_URL + "/resetpassword", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return {
      responseData: response.data,
    };
  } catch (error) {
    throw error;
  }
};

export const verifypannumber = async (pannumber, address, time, id, date) => {
  var data = {
    address: address,
    dob: date,
    panNumber: pannumber,
    timeInMilliSeconds: time,
    emailOtp: null,
    emailOtpSession: null,
    userId: id,
  };
  try {
    const response = await axios.patch(
      API_BASE_URL + "/emailVerification",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      responseData: response.data,
    };
  } catch (error) {
    throw error;
  }
};

export const vaildateemail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !email.match(emailRegex)) {
    return "Please enter a valid email address";
  }
  return null;
};
export const validateRegisterInput = (email, password, moblie) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !email.match(emailRegex)) {
    return "Please enter a valid email address";
  }

  if (!password || password.length < 6) {
    return "Password must be at least 6 characters long";
  }

  const phoneNumberRegex = /^\d{10}$/;
  if (!moblie || !moblie.match(phoneNumberRegex)) {
    return "Please enter a valid 10-digit phone number";
  }

  return null; // No validation error
};

export const validatemoblie = (moblie) => {
  const phoneNumberRegex = /^\d{10}$/;
  if (!moblie || !moblie.match(phoneNumberRegex)) {
    return "Please enter a valid 10-digit phone number";
  } else {
    return null;
  }
};

export const moblieloginotp = async (moblie) => {
  var data = {
    mobileNumber: moblie,
  };
  try {
    const response = await axios.post(API_URL_otp, data);
    return {
      responseData: response.data,
    };
  } catch (error) {
    throw error;
  }
};

export const validateotpsubmit = async (moblie, otp) => {
  var data = {
    mobileNumber: moblie,
    mobileOtpValue: otp,
  };
  try {
    const response = await axios.post(
      API_BASE_URL + "/login?grantType=PWD",
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return {
      responseData: response.data,
    };
  } catch (error) {
    throw error;
  }
};

export const RegisterUser = async (moblie) => {
  var data = {
    citizenship: "NONNRI",
    mobileNumber: moblie,
  };
  try {
    const response = await axios.post(
      API_BASE_URL + "/newUserRegistration",
      data
    );
    return response.data.mobileOtpSession;
  } catch (error) {
    throw error;
  }
};
// a

export const vaildateotp = async (
  email,
  moblie,
  otp_data,
  name,
  password,
  session,
  referrerId,
  userType,
  latitude,
  longitude
) => {
  const uniqnumber = localStorage.getItem("uniqnumber");
  const utmForPartner = localStorage.getItem("type");

  if (uniqnumber === null) {
    var data = {
      mobileNumber: moblie,
      mobileOtpSession: session,
      mobileOtpValue: otp_data,
      primaryType: "LENDER",
      name: name,
      email: email,
      password: password,
      citizenship: "NONNRI",
      projectType: "REACT",
      uniqueNumber: "0",
      utm: "WEB",
      // uuid: "asdfghjkl",
      cifNumber: null,
      finoEmployeeMobileNumber: "0",
      latitude: latitude || null,
      longitude: longitude || null,
    };
  } else {
    var data = {
      mobileNumber: moblie,
      mobileOtpSession: session,
      mobileOtpValue: otp_data,
      primaryType: "LENDER",
      name: name,
      email: email,
      password: password,
      citizenship: "NONNRI",
      uniqueNumber: uniqnumber,
      projectType: "REACT",
      utmForPartner: "",
      utm: "WEB",
      cifNumber: null,
      finoEmployeeMobileNumber: null,
      // uuid: "asdfghjkl",
      latitude: latitude || null,
      longitude: longitude || null,
    };
  }
  if (utmForPartner === "Borrower") {
    data.utmForPartner = "";
    data.primaryType = "BORROWER";
    // localStorage.setItem("type", "")
  }
  try {
    const response = await axios.post(
      API_BASE_URL + "/newUserRegistration",
      data
    );

    return {
      responseData: response.data,
    };
  } catch (error) {
    throw error;
  }
};
