const ENV = "local"; // "local" | "test" | "production"

const BASE_URL =
  ENV === "local"
    ? "http://localhost:8181/oxyloans"
    : ENV === "test"
    ? "http://ec2-15-207-239-145.ap-south-1.compute.amazonaws.com:8080/oxyloans"
    : "https://fintech.oxyloans.com/oxyloans";

export const API_USER_URL = BASE_URL + "/v1/user/";
export const MARKETPLACE_URL = BASE_URL;

export default BASE_URL;
export { ENV, BASE_URL };
