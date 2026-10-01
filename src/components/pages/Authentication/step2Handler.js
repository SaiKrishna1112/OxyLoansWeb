import axios from "axios";
import Swal from "sweetalert2";
import { API_USER_URL } from "../../../config";
import { toastrSuccess, toastrWarning } from "../Base UI Elements/Toast";

/**
 * Handles Step 2 Pending error from login API.
 * Expected backend message format:
 * "User Registration step 2 is pending =69460=manasaparvathala28@gmail.com=EMAIL"
 * errorCode: "113"
 *
 * - For EMAIL: sends email activation link via API (sendingEmailActivationLink) and notifies the user.
 * - For GOOGLE: redirects to /register_active_proceed?id=...&time=...&signupType=GOOGLE.
 *
 * @param {object} errData - The error response data from API (containing errorMessage and/or errorCode)
 * @param {string} fallbackMsg - Fallback error message if errData has no errorMessage
 * @param {function} navigate - React Router navigate/history function
 * @returns {Promise<boolean>} - true if this error was a Step 2 pending error and was handled, false otherwise
 */
export const handleStep2PendingFromLogin = async (errData, fallbackMsg, navigate) => {
  const msg =
    (typeof errData === "string" ? errData : errData?.errorMessage) ||
    fallbackMsg ||
    "";
  const errCode = String(errData?.errorCode || "");

  const isStep2 =
    errCode === "113" ||
    /step 2 is pending/i.test(msg) ||
    /Registration step 2/i.test(msg);

  if (!isStep2) return false;

  // Tokenize string separated by "="
  const tokens = msg
    .split("=")
    .map((s) => s.trim())
    .filter(Boolean);

  let userId = null;
  let userEmail = null;
  let signupType = "GOOGLE"; // default if not EMAIL

  for (const token of tokens) {
    if (/^\d{3,10}$/.test(token) && !userId) {
      userId = token;
    } else if (/@/.test(token) && !userEmail) {
      userEmail = token;
    } else if (/^(EMAIL|GOOGLE|MOBILE)$/i.test(token)) {
      signupType = token.toUpperCase();
    }
  }

  // Explicit check for =EMAIL or =GOOGLE in the message
  if (/=EMAIL\b/i.test(msg)) {
    signupType = "EMAIL";
  } else if (/=GOOGLE\b/i.test(msg)) {
    signupType = "GOOGLE";
  }

  // Fallback for userId if not captured by token
  if (!userId) {
    const idMatch = msg.match(/(?:id=|userId=|\b)(\d{3,8})\b/);
    if (idMatch) userId = idMatch[1];
  }

  // Case 1: EMAIL Registration Step 2 Pending
  if (signupType === "EMAIL" && userId) {
    try {
      await axios.post(`${API_USER_URL}sendingEmailActivationLink`, {
        userId: userId,
      });

      Swal.fire({
        title: "Email Verification Required",
        html: `Your registration Step 2 is pending.<br/><br/>An activation link has been sent to <strong>${
          userEmail || "your registered email"
        }</strong>.<br/>Please check your inbox (and spam folder) to complete registration.`,
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Resend Link",
        cancelButtonText: "Close",
      }).then((result) => {
        if (result.isConfirmed) {
          axios
            .post(`${API_USER_URL}sendingEmailActivationLink`, { userId })
            .then(() => toastrSuccess("Activation link resent successfully!"))
            .catch((e) =>
              toastrWarning(
                e?.response?.data?.errorMessage || "Failed to resend activation link."
              )
            );
        }
      });
    } catch (err) {
      const errText =
        err?.response?.data?.errorMessage ||
        "Could not send email activation link automatically.";
      Swal.fire({
        title: "Email Verification Required",
        html: `Your registration Step 2 is pending for <strong>${
          userEmail || "your email"
        }</strong>.<br/><br/>${errText}`,
        icon: "warning",
        confirmButtonColor: "#2563eb",
        confirmButtonText: "Okay",
      });
    }
    return true;
  }

  // Case 2: GOOGLE Sign In / other direct Step 2
  toastrSuccess("Please complete your registration to continue.");
  navigate(
    `/register_active_proceed?id=${userId || ""}&time=${Date.now()}&signupType=GOOGLE`
  );
  return true;
};
