// ================================================================
// SINGLE SOURCE OF TRUTH FOR API URLs
// ================================================================
// To switch environments, change ONE value: LOCAL_IP (local) or ENV ("production")
//
// Local:      http://<LOCAL_IP>:8182
// Production: https://fintech.oxyloans.com/oxyloans
// ================================================================

const LOCAL_IP = "15.207.239.145"; // test EC2; change to "localhost" for local dev

const ENV = "test"; // "local" | "test" | "production" — change to "production" before prod deploy

const BASE_URL =
  ENV === "local"
    ? `http://${LOCAL_IP}:8080/oxyloans`
    : ENV === "test"
    ? `http://${LOCAL_IP}:8080/oxyloans`
    : "https://fintech.oxyloans.com/oxyloans";

export const API_USER_URL = BASE_URL + "/v1/user/";
export const MARKETPLACE_URL = BASE_URL;

export default BASE_URL;
export { ENV, BASE_URL };
