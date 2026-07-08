// "test" = live backend on test server (recommended for admin AI dashboard)
// "local" = Spring Boot on port 8181 — npm start proxies /oxyloans → localhost:8181 (no CORS issues)
const ENV = "test"; // "local" | "test" | "production" — use local when backend runs on this machine

const BASE_URL =
  ENV === "local"
    ? "/oxyloans"
    : ENV === "test"
      ? "http://15.207.239.145:8080/oxyloans"
      : "https://fintech.oxyloans.com/oxyloans";

export const API_USER_URL = BASE_URL + "/v1/user/";
export const MARKETPLACE_URL = BASE_URL;

// Dev bypass token: when present in local env, frontend will auto-login (dev only)
export const DEV_BYPASS_TOKEN = "";

export default BASE_URL;
export { ENV, BASE_URL };

/** Admin dashboard: set true to use demo data without login */
export const AI_DASHBOARD_USE_STATIC = false;
export const DEV_ADMIN_MOBILE = "";
export const DEV_OTP = "";
