import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";

import { handlesenOtp, usersubmitotp, isApiSuccess, warnApiError } from "../../HttpRequest/beforelogin";
import { saveLoginSession } from "../../HttpRequest/aiAdminApi";
import BASE_URL, { ENV, DEV_ADMIN_MOBILE, DEV_OTP } from "../../../config";
import { toastrSuccess, toastrWarning } from "../Base UI Elements/Toast";
import { WarningBackendApi } from "../Base UI Elements/SweetAlert";

// Detect whether the user typed a mobile number or an email address
const detectInputType = (val) => {
  if (!val) return null;
  const trimmed = val.trim();
  if (/^\d{10}$/.test(trimmed)) return "mobile";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "email";
  return null;
};

const OTP_LENGTH = 6;

const cardStyle = {
  background: "#fff",
  borderRadius: 16,
  boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
  padding: "40px 36px",
  maxWidth: 420,
  width: "100%",
  margin: "auto",
};

const btnPrimary = {
  display: "block",
  width: "100%",
  padding: "13px 0",
  background: "#1a73e8",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  marginTop: 4,
  letterSpacing: 0.2,
};

const btnOutline = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  width: "100%",
  padding: "11px 0",
  background: "#fff",
  border: "1.5px solid #dadce0",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  color: "#3c4043",
  cursor: "pointer",
  marginBottom: 10,
};

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  border: "1.5px solid #dadce0",
  borderRadius: 8,
  fontSize: 16,
  outline: "none",
  marginTop: 6,
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

const dividerStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  margin: "20px 0",
  color: "#aaa",
  fontSize: 13,
};

const Loginotp = () => {
  const history = useNavigate();

  // === Stages: "entry" | "otp_mobile" | "otp_email" | "not_found" | "gmail_role" | "gmail_register"
  const [stage, setStage] = useState("entry");
  const [inputVal, setInputVal] = useState("");
  const [inputError, setInputError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  // Store for display purposes
  const [maskedContact, setMaskedContact] = useState("");
  const [detectedType, setDetectedType] = useState(null); // "mobile" | "email"
  // Gmail-first registration state
  const [googleToken, setGoogleToken] = useState(null);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");
  const [grRole, setGrRole] = useState(null); // "LENDER" | "BORROWER"
  const [grMobile, setGrMobile] = useState("");
  const [grMobileError, setGrMobileError] = useState("");
  const [grOtpSent, setGrOtpSent] = useState(false);
  const [grOtp, setGrOtp] = useState("");
  const [grOtpError, setGrOtpError] = useState("");

  // Auto-login on local dev
  useEffect(() => {
    if (ENV !== "local" || !DEV_ADMIN_MOBILE) return;
    const autoLogin = async () => {
      try {
        const otpRes = await handlesenOtp(DEV_ADMIN_MOBILE);
        if (!isApiSuccess(otpRes)) return;
        const res = await usersubmitotp(DEV_ADMIN_MOBILE, DEV_OTP);
        if (isApiSuccess(res) && saveLoginSession(res)) history("/adminAIDashboard");
      } catch (e) { /* manual login required */ }
    };
    autoLogin();
  }, []);

  const redirectAfterLogin = (data) => {
    const role = data?.primaryType;
    if (role === "LENDER") history("/lenderAIDashboard/" + data.id);
    else if (["ADMIN", "HELPDESKADMIN", "SUPERADMIN", "PRIMARYADMIN"].includes(role)) history("/oxyloansadmindashboard");
    else history("/borrowerDashboard");
  };

  // ── STEP 1: user clicks Continue ──────────────────────────────────────────
  const handleContinue = async () => {
    const trimmed = inputVal.trim();
    const type = detectInputType(trimmed);

    if (!type) {
      setInputError("Enter a valid 10-digit mobile number or email address.");
      return;
    }
    setInputError("");
    setLoading(true);

    try {
      if (type === "mobile") {
        const res = await handlesenOtp(trimmed);
        if (isApiSuccess(res)) {
          if (res.data?.id) sessionStorage.setItem("userId", res.data.id);
          setMaskedContact("XXXXXX" + trimmed.slice(-4));
          setDetectedType("mobile");
          setStage("otp_mobile");
        } else {
          const { message } = warnApiError(res, "Send OTP failed", "Could not send OTP");
          const isNotFound = /no user exists|not registered|not found/i.test(message);
          if (isNotFound) {
            setStage("not_found");
          } else {
            setInputError(message);
          }
        }
      } else {
        // email — call new sendEmailOtp endpoint
        const res = await axios.post(`${BASE_URL}/v1/user/sendEmailLoginOtp`, { email: trimmed });
        const status = res.data?.phoneNumberRequiredOrNot;
        if (status === "OTP_SENT") {
          setMaskedContact(trimmed.replace(/(.{2}).+(@.+)/, "$1***$2"));
          setDetectedType("email");
          setStage("otp_email");
        } else if (status === "NOT_FOUND") {
          setStage("not_found");
        } else {
          setInputError("Unexpected response. Please try again.");
        }
      }
    } catch (e) {
      const msg = e?.response?.data?.errorMessage || e?.message || "Something went wrong. Please try again.";
      setInputError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2: user submits OTP ───────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (otp.trim().length < 4) {
      setOtpError("Please enter the OTP.");
      return;
    }
    setOtpError("");
    setLoading(true);

    try {
      let loginRes;
      if (detectedType === "mobile") {
        loginRes = await usersubmitotp(inputVal.trim(), otp.trim());
        if (!isApiSuccess(loginRes)) {
          const { message } = warnApiError(loginRes, "Invalid OTP", "Wrong OTP. Please try again.");
          setOtpError(message);
          return;
        }
        if (!saveLoginSession(loginRes)) {
          setOtpError("Login succeeded but session could not be saved. Please retry.");
          return;
        }
        toastrSuccess("Login successful!");
        redirectAfterLogin(loginRes.data);
      } else {
        // email OTP
        const res = await axios.post(`${BASE_URL}/v1/user/verifyEmailLoginOtp`, {
          email: inputVal.trim(),
          otp: otp.trim(),
        });
        if (saveLoginSession(res)) {
          toastrSuccess("Login successful!");
          redirectAfterLogin(res.data);
        } else {
          setOtpError("Login succeeded but session could not be saved. Please retry.");
        }
      }
    } catch (e) {
      const msg = e?.response?.data?.errorMessage || "Invalid OTP. Please try again.";
      setOtpError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Google login ───────────────────────────────────────────────────────────
  const handleGoogleSuccess = async (tokenResponse) => {
    setGoogleLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/v1/user/checkGoogleEmail`,
        { accessToken: tokenResponse.access_token },
        { headers: { "Content-Type": "application/json" } }
      );
      const { phoneNumberRequiredOrNot: status, signInUrl } = res.data;

      if (status === "LINKED" || status === "FOUND" || status === "STEP2_PENDING") {
        // Existing user — log them in
        const loginRes = await axios.post(`${BASE_URL}/v1/user/loginWithLinkedGoogle`,
          { accessToken: tokenResponse.access_token },
          { headers: { "Content-Type": "application/json" } }
        );
        if (saveLoginSession(loginRes)) {
          toastrSuccess("Google login successful!");
          redirectAfterLogin(loginRes.data);
        }
      } else if (status === "NOT_FOUND") {
        // New user — pick role first, then collect mobile
        setGoogleToken(tokenResponse.access_token);
        setGoogleEmail(signInUrl || "");
        setGoogleName(res.data.googleName || "");
        setStage("gmail_role");
      } else {
        WarningBackendApi("Google Sign-In Failed", "Unexpected response. Please try again.");
      }
    } catch (e) {
      const msg = e?.response?.data?.errorMessage || "Google sign-in failed. Please try another method.";
      WarningBackendApi("Google Sign-In Failed", msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => WarningBackendApi("Google Sign-In Failed", "Authentication was cancelled or failed."),
  });

  const handleBack = () => {
    setStage("entry");
    setOtp("");
    setOtpError("");
    setInputError("");
    setGoogleToken(null);
    setGoogleEmail("");
    setGoogleName("");
    setGrRole(null);
    sessionStorage.removeItem("gmail_prefill");
    setGrMobile("");
    setGrMobileError("");
    setGrOtpSent(false);
    setGrOtp("");
    setGrOtpError("");
  };

  // Gmail-first registration handlers
  const handleGmailRegSendOtp = async () => {
    if (!/^\d{10}$/.test(grMobile)) {
      setGrMobileError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/v1/user/sendGoogleRegMobileOtp`, { mobileNumber: grMobile });
      const status = res.data?.phoneNumberRequiredOrNot;
      if (status === "OTP_SENT") {
        setGrOtpSent(true);
      } else if (status === "ALREADY_REGISTERED") {
        setGrMobileError("This mobile number is already registered. Please login instead.");
      } else {
        setGrMobileError("Could not send OTP. Please try again.");
      }
    } catch (e) {
      setGrMobileError(e?.response?.data?.errorMessage || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGmailRegVerifyOtp = async () => {
    if (grOtp.trim().length < 4) {
      setGrOtpError("Please enter the OTP.");
      return;
    }
    setLoading(true);
    try {
      // Verify OTP by calling the check endpoint
      const verifyRes = await axios.post(`${BASE_URL}/v1/user/verifyGoogleRegMobileOtp`, {
        mobileNumber: grMobile,
        mobileOtp: grOtp,
        email: googleEmail,
      });
      if (!verifyRes.data?.valid) {
        setGrOtpError("Invalid OTP. Please try again.");
        return;
      }
      // Store pre-fill for the registration form
      sessionStorage.setItem("gmail_prefill", JSON.stringify({
        email: googleEmail,
        mobile: grMobile,
        name: googleName,
        googleAccessToken: googleToken,
        emailVerified: true,
        role: grRole,
      }));
      // Redirect to the appropriate registration form for full details + KYC
      if (grRole === "BORROWER") {
        history("/borrower_register");
      } else {
        history("/register");
      }
    } catch (e) {
      setGrOtpError(e?.response?.data?.errorMessage || "Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#f5f7fa", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#1a1a2e", letterSpacing: -0.5 }}>
          🏦 OxyLoans
        </div>
        <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>
          RBI-Registered P2P Lending Platform
        </div>
      </div>

      <div style={cardStyle}>

        {/* ── STAGE: entry ── */}
        {stage === "entry" && (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", margin: "0 0 4px" }}>
              Log in or sign up
            </h2>
            <p style={{ color: "#666", fontSize: 14, margin: "0 0 24px" }}>
              Start lending and earning returns today.
            </p>

            {/* Smart input */}
            <label style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>
              Mobile number or email
            </label>
            <input
              style={{ ...inputStyle, borderColor: inputError ? "#e53935" : "#dadce0" }}
              type="text"
              placeholder="9876543210 or you@email.com"
              value={inputVal}
              onChange={(e) => { setInputVal(e.target.value); setInputError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleContinue()}
              autoFocus
            />
            {inputError && <div style={{ color: "#e53935", fontSize: 12, marginTop: 6 }}>{inputError}</div>}

            <button
              style={{ ...btnPrimary, marginTop: 16, opacity: loading ? 0.7 : 1 }}
              onClick={handleContinue}
              disabled={loading}
            >
              {loading ? "Sending OTP…" : "Continue →"}
            </button>

            <div style={dividerStyle}>
              <div style={{ flex: 1, height: 1, background: "#ebebeb" }} />
              or
              <div style={{ flex: 1, height: 1, background: "#ebebeb" }} />
            </div>

            {/* Google */}
            <button style={btnOutline} onClick={() => googleLogin()} disabled={googleLoading}>
              {googleLoading
                ? <span className="spinner-border spinner-border-sm" />
                : (
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l6-6C34.5 6.5 29.6 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c11 0 20.5-8 20.5-19.5 0-1.3-.1-2.7-.5-4z"/>
                    <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3.1 0 5.8 1.1 8 2.9l6-6C34.5 6.5 29.6 4.5 24 4.5c-7.7 0-14.3 4.4-17.7 10.2z"/>
                    <path fill="#FBBC05" d="M24 43.5c5.8 0 10.8-1.9 14.5-5.2l-6.7-5.5C29.8 34.7 27 35.5 24 35.5c-6 0-10.7-3.9-11.7-9.1l-7 5.4C8.5 39.5 15.7 43.5 24 43.5z"/>
                    <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-.6 2.7-2.2 4.9-4.4 6.4l6.7 5.5C41.8 36.7 44.5 30.8 44.5 24c0-1.3-.1-2.7-.5-4z"/>
                  </svg>
                )
              }
              Continue with Google
            </button>

            {/* WhatsApp */}
            <Link to="/whatsapplogin" style={{ ...btnOutline, textDecoration: "none", color: "#3c4043" }}>
              <span style={{ color: "#25D366", fontSize: 18 }}>●</span>
              Continue with WhatsApp
            </Link>

            <p style={{ textAlign: "center", fontSize: 12, color: "#aaa", marginTop: 20, lineHeight: 1.5 }}>
              By continuing, you agree to our{" "}
              <Link to="/termsandconditions" style={{ color: "#1a73e8" }}>Terms</Link>
              {" & "}
              <Link to="/privacy-policy" style={{ color: "#1a73e8" }}>Privacy Policy</Link>
            </p>
          </>
        )}

        {/* ── STAGE: otp (mobile or email) ── */}
        {(stage === "otp_mobile" || stage === "otp_email") && (
          <>
            <button onClick={handleBack} style={{ background: "none", border: "none", color: "#1a73e8", cursor: "pointer", fontSize: 13, padding: 0, marginBottom: 16 }}>
              ← Back
            </button>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px" }}>
              Enter verification code
            </h2>
            <p style={{ color: "#666", fontSize: 14, margin: "0 0 24px" }}>
              We sent a {OTP_LENGTH}-digit code to{" "}
              <strong style={{ color: "#1a1a2e" }}>{maskedContact}</strong>
            </p>

            <label style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>OTP</label>
            <input
              style={{ ...inputStyle, letterSpacing: 8, fontSize: 22, textAlign: "center", borderColor: otpError ? "#e53935" : "#dadce0" }}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={OTP_LENGTH}
              placeholder="______"
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH)); setOtpError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              autoFocus
            />
            {otpError && <div style={{ color: "#e53935", fontSize: 12, marginTop: 6 }}>{otpError}</div>}

            <button
              style={{ ...btnPrimary, marginTop: 16, opacity: loading ? 0.7 : 1 }}
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? "Verifying…" : "Verify & Continue →"}
            </button>

            <button
              onClick={handleBack}
              style={{ display: "block", width: "100%", marginTop: 12, background: "none", border: "none", color: "#888", fontSize: 13, cursor: "pointer" }}
            >
              Didn't receive it? Try a different method
            </button>
          </>
        )}

        {/* ── STAGE: gmail_role (new user — choose Lender or Borrower) ── */}
        {stage === "gmail_role" && (
          <>
            <div style={{ background: "#e8f5e9", border: "1px solid #4caf50", borderRadius: 8, padding: "12px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>✅</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#2e7d32" }}>Gmail verified</div>
                <div style={{ fontSize: 12, color: "#555", wordBreak: "break-all" }}>{googleEmail}</div>
              </div>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1a1a2e", margin: "0 0 6px" }}>
              How do you want to join OxyLoans?
            </h3>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 20px" }}>
              Choose your role to continue registration.
            </p>
            <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
              <button
                onClick={() => { setGrRole("LENDER"); setStage("gmail_register"); }}
                style={{ flex: 1, padding: "18px 12px", border: "2px solid #1a73e8", borderRadius: 10, background: "#f0f6ff", cursor: "pointer", textAlign: "center" }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>💰</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1a73e8" }}>Lender</div>
                <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>Invest &amp; earn returns</div>
              </button>
              <button
                onClick={() => { setGrRole("BORROWER"); setStage("gmail_register"); }}
                style={{ flex: 1, padding: "18px 12px", border: "2px solid #e65100", borderRadius: 10, background: "#fff8f5", cursor: "pointer", textAlign: "center" }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>🏦</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#e65100" }}>Borrower</div>
                <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>Apply for a loan</div>
              </button>
            </div>
            <button
              onClick={handleBack}
              style={{ display: "block", width: "100%", marginTop: 14, background: "none", border: "none", color: "#888", fontSize: 13, cursor: "pointer" }}
            >
              ← Back to sign-in options
            </button>
          </>
        )}

        {/* ── STAGE: gmail_register (role chosen — collect mobile + OTP) ── */}
        {stage === "gmail_register" && (
          <>
            {/* Gmail verified + role badge */}
            <div style={{ background: "#e8f5e9", border: "1px solid #4caf50", borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>✅</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#2e7d32" }}>
                  Gmail verified — registering as <strong>{grRole === "BORROWER" ? "Borrower" : "Lender"}</strong>
                </div>
                <div style={{ fontSize: 12, color: "#555", wordBreak: "break-all" }}>{googleEmail}</div>
              </div>
            </div>

            {!grOtpSent ? (
              <>
                <label style={{ fontWeight: 600, fontSize: 14, color: "#1a1a2e", display: "block", marginBottom: 8 }}>
                  Enter your mobile number to verify
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={grMobile}
                  onChange={e => { setGrMobile(e.target.value.replace(/\D/g, "")); setGrMobileError(""); }}
                  style={{ ...inputStyle, borderColor: grMobileError ? "#d32f2f" : "#dadce0" }}
                  autoFocus
                />
                {grMobileError && <div style={{ color: "#d32f2f", fontSize: 13, marginTop: 6 }}>{grMobileError}</div>}
                <button
                  style={{ ...btnPrimary, marginTop: 16, opacity: loading ? 0.7 : 1 }}
                  disabled={loading}
                  onClick={handleGmailRegSendOtp}
                >
                  {loading ? "Sending OTP…" : "Send OTP →"}
                </button>
                <button
                  onClick={() => { setGrOtpSent(false); setGrMobile(""); setGrMobileError(""); setStage("gmail_role"); }}
                  style={{ display: "block", width: "100%", marginTop: 10, background: "none", border: "none", color: "#888", fontSize: 13, cursor: "pointer" }}
                >
                  ← Change role
                </button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 14, color: "#555", marginBottom: 12 }}>
                  OTP sent to <strong>{grMobile}</strong>
                </div>
                <label style={{ fontWeight: 600, fontSize: 14, color: "#1a1a2e", display: "block", marginBottom: 8 }}>
                  Enter OTP
                </label>
                <input
                  type="tel"
                  maxLength={6}
                  placeholder="______"
                  value={grOtp}
                  onChange={e => { setGrOtp(e.target.value.replace(/\D/g, "")); setGrOtpError(""); }}
                  style={{ ...inputStyle, letterSpacing: 8, fontSize: 22, textAlign: "center", borderColor: grOtpError ? "#d32f2f" : "#dadce0" }}
                  autoFocus
                />
                {grOtpError && <div style={{ color: "#d32f2f", fontSize: 13, marginTop: 6 }}>{grOtpError}</div>}
                <button
                  style={{ ...btnPrimary, marginTop: 16, opacity: loading ? 0.7 : 1 }}
                  disabled={loading}
                  onClick={handleGmailRegVerifyOtp}
                >
                  {loading ? "Verifying…" : "Verify & Continue →"}
                </button>
                <button
                  onClick={() => { setGrOtpSent(false); setGrOtp(""); setGrOtpError(""); }}
                  style={{ display: "block", width: "100%", marginTop: 10, background: "none", border: "none", color: "#1a73e8", fontSize: 13, cursor: "pointer" }}
                >
                  Change mobile number
                </button>
              </>
            )}

            <button
              onClick={handleBack}
              style={{ display: "block", width: "100%", marginTop: 14, background: "none", border: "none", color: "#888", fontSize: 13, cursor: "pointer" }}
            >
              ← Back to sign-in options
            </button>
          </>
        )}

        {/* ── STAGE: not_found (mobile or email not in DB) ── */}
        {stage === "not_found" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🔍</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px" }}>
                Account not found
              </h2>
              <p style={{ color: "#555", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                <strong>{inputVal}</strong> is not registered on OxyLoans yet.
              </p>
              <p style={{ color: "#888", fontSize: 13, marginTop: 6 }}>
                Would you like to create a new account?
              </p>
            </div>
            <Link
              to="/register"
              style={{ ...btnPrimary, textDecoration: "none", textAlign: "center", display: "block" }}
            >
              Create account →
            </Link>
            <button
              onClick={handleBack}
              style={{ display: "block", width: "100%", marginTop: 12, background: "none", border: "none", color: "#1a73e8", fontSize: 14, cursor: "pointer" }}
            >
              ← Try a different number or email
            </button>
          </>
        )}

      </div>

      {/* Trust badges */}
      <div style={{ display: "flex", gap: 20, marginTop: 24, color: "#888", fontSize: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <span>🔒 SSL Secured</span>
        <span>🏦 RBI Registered NBFC</span>
        <span>🛡️ ₹50L Lending Limit</span>
      </div>
    </div>
  );
};

export default Loginotp;
