import React, { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { handlesenOtp, usersubmitotp, isApiSuccess, warnApiError } from "../../HttpRequest/beforelogin";
import { saveLoginSession } from "../../HttpRequest/aiAdminApi";
import BASE_URL from "../../../config";
import { registerImage } from "../../imagepath";
import { toastrSuccess, toastrWarning } from "../Base UI Elements/Toast";
import { WarningBackendApi } from "../Base UI Elements/SweetAlert";
import { getPostLoginRedirectUrl } from "../../../utils/redirectUtils";
import "./DarkAuth.css";

const GoogleIcon = () => (
  <svg className="da-google-icon" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const DarkLogin = () => {
  const history = useNavigate();
  const otpRef = useRef();

  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("mobile"); // mobile | otp
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [mobileErr, setMobileErr] = useState("");

  const redirectToDashboard = (data) => {
    const role = data?.primaryType;
    const uid = data?.id;
    if (role === "LENDER") history("/lenderAIDashboard/" + uid);
    else if (["ADMIN", "HELPDESKADMIN", "SUPERADMIN", "PRIMARYADMIN"].includes(role)) history("/oxyloansadmindashboard");
    else history("/borrowerDashboard");
  };

  const sendOtp = async () => {
    const num = mobile.replace(/\D/g, "");
    if (num.length !== 10) { setMobileErr("Enter a valid 10-digit mobile number"); return; }
    setMobileErr("");
    setSending(true);
    try {
      const res = await handlesenOtp(num);
      if (isApiSuccess(res)) {
        if (res.data?.id) sessionStorage.setItem("userId", res.data.id);
        setStep("otp");
        setTimeout(() => otpRef.current?.focus(), 100);
        toastrSuccess("OTP sent to " + num);
      } else {
        const { message } = warnApiError(res, "Send OTP failed", "Could not send OTP. Try again.");
        toastrWarning(message);
      }
    } catch (e) {
      toastrWarning(e?.response?.data?.errorMessage || "Could not send OTP. Try again.");
    } finally {
      setSending(false);
    }
  };

  const verifyAndLogin = async () => {
    if (otp.length < 4) { toastrWarning("Enter the OTP"); return; }
    setVerifying(true);
    try {
      const res = await usersubmitotp(mobile.replace(/\D/g, ""), otp);
      if (isApiSuccess(res)) {
        if (!saveLoginSession(res)) {
          toastrWarning("Login succeeded but no session token returned. Please try again.");
          return;
        }
        toastrSuccess("Login successful!");
        const role = res.data?.primaryType;
        const defaultPath = role === "LENDER" ? "/lenderAIDashboard/" + res.data?.id : "/borrowerDashboard";
        history(getPostLoginRedirectUrl(defaultPath, role));
      } else {
        const { message } = warnApiError(res, "Login failed", "Invalid OTP. Please try again.");
        const step2 = /step 2 is pending\s*=\s*(\d+)\s*=/i.exec(message || "");
        if (step2) {
          toastrSuccess("Please complete your registration to continue.");
          history(`/register-step2-test?id=${step2[1]}&time=${Date.now()}&signupType=MOBILE`);
          return;
        }
        toastrWarning(message);
      }
    } catch (e) {
      toastrWarning(e?.response?.data?.errorMessage || "Login failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setGoogleLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/v1/user/checkGoogleEmail`, { accessToken: tokenResponse.access_token }, { headers: { "Content-Type": "application/json" } });
      const { phoneNumberRequiredOrNot: status, userId, registrationTime } = res.data;
      if (status === "LINKED" || status === "FOUND") {
        const loginRes = await axios.post(`${BASE_URL}/v1/user/loginWithLinkedGoogle`, { accessToken: tokenResponse.access_token }, { headers: { "Content-Type": "application/json" } });
        if (saveLoginSession(loginRes)) {
          toastrSuccess("Google login successful!");
          redirectToDashboard(loginRes.data);
        }
      } else if (status === "STEP2_PENDING") {
        history(`/register-step2-test?id=${userId}&time=${registrationTime}&signupType=GOOGLE`);
      } else {
        toastrWarning("No OxyLoans account found for this Google account. Please sign up.");
        history("/dark-signup");
      }
    } catch (e) {
      WarningBackendApi("Google Login Failed", e?.response?.data?.errorMessage || "Could not verify Google account.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => WarningBackendApi("Google Login Failed", "Google authentication was cancelled or failed."),
  });

  return (
    <div className="da-root">
      <div className="da-card">
        <div className="da-left">
          <img src={registerImage} alt="OxyLoans" className="da-logo" />
          <p className="da-left-tagline">India's trusted P2P lending platform. Earn up to 18% returns.</p>
        </div>
        <div className="da-right">
          <div className="da-badge">SECURE LOGIN</div>
          <h2 className="da-title">Welcome Back</h2>
          <p className="da-sub">Login with your registered mobile number</p>

          {/* Mobile + OTP */}
          <div className="da-field">
            <label className="da-label">Mobile Number <span className="da-req">*</span></label>
            <div className="da-otp-row">
              <div className="da-otp-input-wrap">
                <input
                  className={`da-input ${mobileErr ? "da-input-err" : ""}`}
                  type="tel"
                  value={mobile}
                  onChange={(e) => { setMobile(e.target.value.replace(/\D/g, "").slice(0, 10)); setMobileErr(""); if (step === "otp") setStep("mobile"); }}
                  placeholder="10-digit mobile"
                  maxLength={10}
                  disabled={verifying}
                />
              </div>
              <button className="da-send-btn" onClick={sendOtp} disabled={sending || verifying}>
                {sending ? "Sending…" : step === "otp" ? "Resend" : "Send OTP"}
              </button>
            </div>
            {mobileErr && <div className="da-field-hint"><span className="da-error">{mobileErr}</span></div>}
          </div>

          {step === "otp" && (
            <div className="da-field">
              <label className="da-label">Enter OTP <span className="da-req">*</span></label>
              <div className="da-otp-field">
                <input
                  ref={otpRef}
                  className="da-input da-otp-digits"
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="— — — — — —"
                  maxLength={6}
                  onKeyDown={(e) => e.key === "Enter" && verifyAndLogin()}
                />
              </div>
            </div>
          )}

          {step === "otp" && (
            <button className="da-btn-primary" onClick={verifyAndLogin} disabled={verifying}>
              {verifying ? "Verifying…" : "Login"}
            </button>
          )}

          <div className="da-divider">or</div>

          <button className="da-google-btn" onClick={() => googleLogin()} disabled={googleLoading}>
            <GoogleIcon />
            {googleLoading ? "Please wait…" : "Continue with Google"}
          </button>

          <div className="da-footer">
            New to OxyLoans? <Link to="/dark-signup">Create account</Link>
          </div>

          <div className="da-test-banner">
            TEST PAGE — Safe to use; does not affect the live login flow
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarkLogin;
