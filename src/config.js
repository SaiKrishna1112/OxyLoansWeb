
// =====================================
const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";

const BASE_URL =
  hostname === "localhost" || hostname === "127.0.0.1"
    ? "http://localhost:8181/oxyloans"
    : hostname === "15.207.239.145" || hostname.includes("ap-south-1.compute.amazonaws.com")
    ? "http://ec2-15-207-239-145.ap-south-1.compute.amazonaws.com:8080/oxyloans"
    : "https://fintech.oxyloans.com/oxyloans";

const ENV =
  hostname === "localhost" || hostname === "127.0.0.1"
    ? "local"
    : hostname === "15.207.239.145" || hostname.includes("ap-south-1.compute.amazonaws.com")
    ? "test"
    : "production";

export const API_USER_URL = BASE_URL + "/v1/user/";
export const MARKETPLACE_URL = BASE_URL;

// Firebase Web Push (same Firebase project as Android google-services.json)
export const FCM_WEB_CONFIG = {
  apiKey: "AIzaSyBlUH7WWkfkTC-b9awVhf97kPHMdIhtdmc",
  authDomain: "oxyloans-293d0.firebaseapp.com",
  projectId: "oxyloans-293d0",
  storageBucket: "oxyloans-293d0.appspot.com",
  messagingSenderId: "876676602395",
  appId: "1:876676602395:web:71a77d0faf4729278d76be",
};

// Paste from Firebase Console -> Project Settings -> Cloud Messaging -> Web Push certificates
export const FCM_VAPID_KEY = "BNG4vn_7cjDaEX35WMn-4xInGKXlSUGXrezre3Bf5kJn1wUEYCXWDBwCwjW8n33PTymHAhkScpDH5BGlBrYcZsk" || "";


export default BASE_URL;
export { ENV, BASE_URL };
