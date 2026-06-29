<<<<<<< HEAD
const ENV = "local"; // "local" | "test" | "production"

const BASE_URL =
  ENV === "local"
    ? "http://localhost:8181/oxyloans"
    : ENV === "test"
=======
// ================================================================
// SINGLE SOURCE OF TRUTH FOR API URLs — auto-detects environment
// ================================================================
// Local dev:   http://localhost:8182/oxyloans
// Test server: http://ec2-15-207-239-145.ap-south-1.compute.amazonaws.com:8080/oxyloans
// Production:  https://fintech.oxyloans.com/oxyloans
// ================================================================

const hostname = typeof window !== "undefined" ? window.location.hostname : "localhost";

const BASE_URL =
  hostname === "localhost" || hostname === "127.0.0.1"
    ? "http://localhost:8182/oxyloans"
    : hostname === "15.207.239.145" || hostname.includes("ap-south-1.compute.amazonaws.com")
>>>>>>> 5c6465d21d62b3d4655bb66e268b110b90c7c780
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

export default BASE_URL;
export { ENV, BASE_URL };
