const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";

const BASE_URL =
  hostname === "localhost" || hostname === "127.0.0.1"
    ? "/oxyloans"
    : hostname === "15.207.239.145" || hostname.includes("ap-south-1.compute.amazonaws.com")
      ? "http://15.207.239.145:8080/oxyloans"
      : "https://fintech.oxyloans.com/oxyloans";

const ENV =
  hostname === "localhost" || hostname === "127.0.0.1"
    ? "local"
    : hostname === "15.207.239.145" || hostname.includes("ap-south-1.compute.amazonaws.com")
      ? "test"
      : "production";

export const API_USER_URL = BASE_URL + "/v1/user/";
export const MARKETPLACE_URL = BASE_URL;

export const DEV_BYPASS_TOKEN = "";

export default BASE_URL;
export { ENV, BASE_URL };

export const AI_DASHBOARD_USE_STATIC = false;
export const DEV_ADMIN_MOBILE = "";
export const DEV_OTP = "";
