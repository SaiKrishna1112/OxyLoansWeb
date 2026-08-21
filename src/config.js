function trimTrailingSlash(url) {
  return typeof url === "string" ? url.replace(/\/+$/, "") : url;
}

function isLocalHostUrl(url) {
  try {
    const { hostname: urlHost } = new URL(url);
    return urlHost === "localhost" || urlHost === "127.0.0.1";
  } catch {
    return false;
  }
}

const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";
const envBaseUrl = trimTrailingSlash(process.env.REACT_APP_BASE_URL || "");
const envAiChatUrl = trimTrailingSlash(process.env.REACT_APP_AI_CHAT_URL || "");
const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
const isTestHost =
  hostname === "15.207.239.145" ||
  hostname === "ec2-15-207-239-145.ap-south-1.compute.amazonaws.com" ||
  hostname.includes("ap-south-1.compute.amazonaws.com");

// Hostname wins over .env.production so test builds never call a stale IP (e.g. 35.154.108.71).
const BASE_URL = isLocalHost
  ? "http://localhost:8181/oxyloans"
  : isTestHost
    ? "http://15.207.239.145:8080/oxyloans"
    : envBaseUrl
      ? envBaseUrl
      : "https://fintech.oxyloans.com/oxyloans";

const ENV = isLocalHost ? "local" : isTestHost ? "test" : "production";
export const API_USER_URL = `${BASE_URL}/v1/user/`;
export const MARKETPLACE_URL = BASE_URL;
export const OFFER_ADMIN_API_URL = `${MARKETPLACE_URL}/v1/ai/admin/reactivation`;
export const AI_CHAT_URL =
  envAiChatUrl
    ? envAiChatUrl
    : process.env.REACT_APP_AI_CHAT_URL && isLocalHostUrl(process.env.REACT_APP_AI_CHAT_URL)
      ? trimTrailingSlash(process.env.REACT_APP_AI_CHAT_URL)
      : `${BASE_URL}/v1/ai/chat`;

export const DEV_BYPASS_TOKEN = "";

export default BASE_URL;
export { ENV, BASE_URL };
export const AI_DASHBOARD_USE_STATIC = false;
export const DEV_ADMIN_MOBILE = "";
export const DEV_OTP = "";
