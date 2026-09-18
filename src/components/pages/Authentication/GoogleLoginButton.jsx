import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { Link } from "react-router-dom";
import axios from "axios";
import { WarningBackendApi } from "../Base UI Elements/SweetAlert";
import { toastrSuccess, toastrWarning } from "../Base UI Elements/Toast";
import { saveLoginSession } from "../../HttpRequest/aiAdminApi";
import { handlesenOtp, isApiSuccess } from "../../HttpRequest/beforelogin";
import BASE_URL from "../../../config";

/**
 * Drop-in Google login button + modal.
 * Usage: <GoogleLoginButton />
 * Works on any login page — no props needed.
 */
const GoogleLoginButton = () => {
  const history = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // { status, email, mobileNumber, accessToken }

  const redirectAfterLogin = (data) => {
    const role = data?.primaryType;
    if (role === "LENDER") history("/lenderAIDashboard/" + data.id);
    else if (["ADMIN", "HELPDESKADMIN", "SUPERADMIN", "PRIMARYADMIN"].includes(role)) history("/oxyloansadmindashboard");
    else history("/borrowerDashboard");
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/v1/user/checkGoogleEmail`,
        { accessToken: tokenResponse.access_token },
        { headers: { "Content-Type": "application/json" } }
      );
      const { phoneNumberRequiredOrNot: status, signInUrl: email, mobileNumber, userId, registrationTime } = res.data;

      if (status === "LINKED" || status === "FOUND") {
        const loginRes = await axios.post(
          `${BASE_URL}/v1/user/loginWithLinkedGoogle`,
          { accessToken: tokenResponse.access_token },
          { headers: { "Content-Type": "application/json" } }
        );
        if (saveLoginSession(loginRes)) {
          toastrSuccess("Google login successful!");
          redirectAfterLogin(loginRes.data);
        }
      } else if (status === "STEP2_PENDING") {
        history(`/register_active_proceed?id=${userId}&time=${registrationTime}`);
      } else {
        setModal({ status: "NOT_FOUND", email, accessToken: tokenResponse.access_token });
      }
    } catch (err) {
      const raw = err?.response?.data?.errorMessage || "Could not verify Google account. Please try OTP login.";
      WarningBackendApi("Google Login Failed", raw);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!modal?.mobileNumber) return;
    setLoading(true);
    try {
      const otpRes = await handlesenOtp(modal.mobileNumber);
      if (isApiSuccess(otpRes)) {
        if (otpRes.data?.id) sessionStorage.setItem("userId", otpRes.data.id);
        toastrSuccess("OTP sent to your registered mobile number.");
        setModal(null);
        history("/loginotp");
      }
    } catch (e) {
      toastrWarning("Could not send OTP. Please use mobile OTP login.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => WarningBackendApi("Google Login Failed", "Google authentication was cancelled or failed."),
  });

  return (
    <>
      {/* Google Login Button */}
      <button
        onClick={() => googleLogin()}
        disabled={loading}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          width: "100%",
          padding: "10px 16px",
          background: "#fff",
          border: "1.5px solid #ddd",
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 600,
          color: "#3c4043",
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
          marginBottom: 4,
        }}
      >
        {loading ? (
          <span className="spinner-border spinner-border-sm" style={{ color: "#4285F4" }} />
        ) : (
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l6-6C34.5 6.5 29.6 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c11 0 20.5-8 20.5-19.5 0-1.3-.1-2.7-.5-4z"/>
            <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3.1 0 5.8 1.1 8 2.9l6-6C34.5 6.5 29.6 4.5 24 4.5c-7.7 0-14.3 4.4-17.7 10.2z"/>
            <path fill="#FBBC05" d="M24 43.5c5.8 0 10.8-1.9 14.5-5.2l-6.7-5.5C29.8 34.7 27 35.5 24 35.5c-6 0-10.7-3.9-11.7-9.1l-7 5.4C8.5 39.5 15.7 43.5 24 43.5z"/>
            <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-.6 2.7-2.2 4.9-4.4 6.4l6.7 5.5C41.8 36.7 44.5 30.8 44.5 24c0-1.3-.1-2.7-.5-4z"/>
          </svg>
        )}
        {loading ? "Signing in…" : "Continue with Google"}
      </button>

      {/* Modal Overlay */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: "28px 32px", maxWidth: 400, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
            <h5 style={{ fontWeight: 700, marginBottom: 8 }}>Gmail Not Registered</h5>
            <p style={{ color: "#555", fontSize: 14, marginBottom: 20 }}>
              <strong style={{ color: "#1a1a2e" }}>{modal.email}</strong> is not found on OxyLoans.<br />
              Please login with your mobile number or sign up to create an account.
            </p>
            <button className="btn btn-primary btn-block mb-2" onClick={() => { setModal(null); history("/loginotp"); }}>
              Login with Mobile OTP
            </button>
            <Link to="/register" className="btn btn-success btn-block mb-2" onClick={() => setModal(null)}>
              Sign Up
            </Link>
            <Link to="/whatsapplogin" className="btn btn-outline-success btn-block" onClick={() => setModal(null)}>
              Login with WhatsApp OTP
            </Link>
            <button style={{ marginTop: 14, background: "none", border: "none", color: "#999", fontSize: 13, cursor: "pointer" }} onClick={() => setModal(null)}>
              ✕ Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GoogleLoginButton;
