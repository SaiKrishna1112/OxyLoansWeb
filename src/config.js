// ================================================================
// SINGLE SOURCE OF TRUTH FOR API URLs
// ================================================================
// To switch environments, change ONE value: LOCAL_IP (local) or ENV ("production")
//
// Local:      http://<LOCAL_IP>:8182
// Production: https://fintech.oxyloans.com/oxyloans
// ================================================================

const LOCAL_IP = "192.168.0.151"; // LAN IP — team members access backend at this address

const ENV = "local"; // "local" | "production"

const BASE_URL =
  ENV === "local"
    ? `http://${LOCAL_IP}:8182`
    : "https://fintech.oxyloans.com/oxyloans";

export const API_USER_URL = BASE_URL + "/v1/user/";
export const MARKETPLACE_URL = BASE_URL;

export default BASE_URL;
export { ENV, BASE_URL, LOCAL_IP };
