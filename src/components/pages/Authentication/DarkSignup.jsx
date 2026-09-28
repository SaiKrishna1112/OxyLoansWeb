import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import * as api from "./api";
import { isApiSuccess } from "../../HttpRequest/beforelogin";
import { saveLoginSession } from "../../HttpRequest/aiAdminApi";
import BASE_URL from "../../../config";
import { registerImage } from "../../imagepath";
import { toastrSuccess, toastrWarning } from "../Base UI Elements/Toast";
import { WarningBackendApi } from "../Base UI Elements/SweetAlert";
import "./DarkAuth.css";

const GoogleIcon = () => (
  <svg className="da-google-icon" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const DarkSignup = () => {
  const history = useNavigate();
  const otpRef = useRef();

  const [form, setForm] = useState({ name: "", mobile: "", email: "", password: "", referrerId: "" });
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("form"); // form | otp | submitting
  const [session, setSession] = useState(null);
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [location, setLocation] = useState({ latitude: null, longitude: null });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
    if (name === "mobile" && step === "otp") {
      setStep("form");
      setSession(null);
      setOtp("");
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    const num = form.mobile.replace(/\D/g, "");
    if (num.length !== 10) errs.mobile = "Enter a valid 10-digit mobile number";
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRe.test(form.email)) errs.email = "Enter a valid email address";
    if (!form.password || form.password.length < 6) errs.password = "Password must be at least 6 characters";
    return errs;
  };

  const sendOtp = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toastrWarning("Please fix the errors above");
      return;
    }
    setSending(true);
    try {
      const num = form.mobile.replace(/\D/g, "");
      const sess = await api.RegisterUser(num);
      setSession(sess);
      setStep("otp");
      setTimeout(() => otpRef.current?.focus(), 100);
      toastrSuccess("OTP sent to " + num);
    } catch (e) {
      const msg = e?.response?.data?.errorMessage || "Could not send OTP. Check the number and try again.";
      toastrWarning(msg);
    } finally {
      setSending(false);
    }
  };

  const verifyAndRegister = async () => {
    if (otp.length < 4) { toastrWarning("Enter the OTP received on your mobile"); return; }
    setVerifying(true);
    try {
      const num = form.mobile.replace(/\D/g, "");
      const result = await api.vaildateotp(
        form.email,
        num,
        otp,
        form.name.trim(),
        form.password,
        session,
        form.referrerId || "0",
        "LENDER",
        location.latitude,
        location.longitude
      );
      const data = result?.responseData;
      const userId = data?.id;
      const tokenTime = data?.tokenGeneratedTime || Date.now();
      if (!userId) {
        toastrWarning("Registration failed. Please try again.");
        return;
      }
      sessionStorage.setItem("userId", String(userId));
      sessionStorage.setItem("tokenTime", String(tokenTime));
      sessionStorage.setItem("email", form.email);
      localStorage.setItem("primaryType", data?.primaryType || "LENDER");
      localStorage.setItem("id", String(userId));
      toastrSuccess("Account created! Complete your profile to continue.");
      history(`/register-step2-test?id=${userId}&time=${tokenTime}&signupType=MOBILE`);
    } catch (e) {
      const msg = e?.response?.data?.errorMessage || "Registration failed. Please try again.";
      toastrWarning(msg);
      setStep("form");
    } finally {
      setVerifying(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setGoogleLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/v1/user/checkGoogleEmail`, { accessToken: tokenResponse.access_token }, { headers: { "Content-Type": "application/json" } });
      const { phoneNumberRequiredOrNot: status, userId, registrationTime } = res.data;
      if (status === "STEP2_PENDING") {
        history(`/register-step2-test?id=${userId}&time=${registrationTime}&signupType=GOOGLE`);
      } else if (status === "LINKED" || status === "FOUND") {
        // Already registered — log them in
        const loginRes = await axios.post(`${BASE_URL}/v1/user/loginWithLinkedGoogle`, { accessToken: tokenResponse.access_token }, { headers: { "Content-Type": "application/json" } });
        if (saveLoginSession(loginRes)) {
          toastrSuccess("Logged in with Google!");
          const role = loginRes.data?.primaryType;
          const uid = loginRes.data?.id;
          if (role === "LENDER") history("/lenderAIDashboard/" + uid);
          else history("/borrowerDashboard");
        }
      } else {
        // New Google user — use their email as prefill
        const email = res.data?.signInUrl || "";
        if (email) setForm((p) => ({ ...p, email }));
        toastrWarning("Google account not found. Fill in the form below and sign up with your mobile number.");
      }
    } catch (e) {
      WarningBackendApi("Google Sign-up Failed", e?.response?.data?.errorMessage || "Could not verify Google account.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => WarningBackendApi("Google Sign-up Failed", "Google authentication was cancelled or failed."),
  });

  return (
    <div className="da-root">
      <div className="da-card">
        <div className="da-left">
          <img src={registerImage} alt="OxyLoans" className="da-logo" />
          <p className="da-left-tagline">Join thousands of lenders earning up to 18% p.a. on verified loans.</p>
        </div>
        <div className="da-right">
          <div className="da-badge">NEW ACCOUNT</div>
          <h2 className="da-title">Create Account</h2>
          <p className="da-sub">Step 1 of 2 — Basic details</p>

          {/* Name */}
          <div className="da-field">
            <label className="da-label">Full Name (as per PAN) <span className="da-req">*</span></label>
            <input
              className={`da-input ${errors.name ? "da-input-err" : form.name ? "da-input-ok" : ""}`}
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="As printed on your PAN card"
              autoComplete="off"
            />
            {errors.name && <div className="da-field-hint"><span className="da-error">{errors.name}</span></div>}
          </div>

          {/* Mobile + Send OTP */}
          <div className="da-field">
            <label className="da-label">Mobile Number <span className="da-req">*</span></label>
            <div className="da-otp-row">
              <div className="da-otp-input-wrap">
                <input
                  className={`da-input ${errors.mobile ? "da-input-err" : ""}`}
                  type="tel"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  placeholder="10-digit mobile"
                  maxLength={10}
                  disabled={verifying}
                />
              </div>
              <button className="da-send-btn" onClick={sendOtp} disabled={sending || verifying}>
                {sending ? "Sending…" : step === "otp" ? "Resend" : "Send OTP"}
              </button>
            </div>
            {errors.mobile && <div className="da-field-hint"><span className="da-error">{errors.mobile}</span></div>}
          </div>

          {/* OTP */}
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
                  onKeyDown={(e) => e.key === "Enter" && verifyAndRegister()}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="da-field">
            <label className="da-label">Email Address <span className="da-req">*</span></label>
            <input
              className={`da-input ${errors.email ? "da-input-err" : form.email && !errors.email ? "da-input-ok" : ""}`}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="off"
            />
            {errors.email && <div className="da-field-hint"><span className="da-error">{errors.email}</span></div>}
          </div>

          {/* Password */}
          <div className="da-field">
            <label className="da-label">Password <span className="da-req">*</span></label>
            <input
              className={`da-input ${errors.password ? "da-input-err" : ""}`}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              autoComplete="new-password"
            />
            {errors.password && <div className="da-field-hint"><span className="da-error">{errors.password}</span></div>}
          </div>

          {/* Referral ID */}
          <div className="da-field">
            <label className="da-label">Referral ID <span className="da-optional">(optional)</span></label>
            <input
              className="da-input"
              type="text"
              name="referrerId"
              value={form.referrerId}
              onChange={handleChange}
              placeholder="Enter referrer's ID if you have one"
              autoComplete="off"
            />
          </div>

          {step === "otp" ? (
            <button className="da-btn-primary" onClick={verifyAndRegister} disabled={verifying}>
              {verifying ? "Registering…" : "Verify OTP & Continue"}
            </button>
          ) : (
            <button className="da-btn-primary" onClick={sendOtp} disabled={sending}>
              {sending ? "Sending OTP…" : "Send OTP to Mobile"}
            </button>
          )}

          <div className="da-divider">or sign up with Google</div>

          <button className="da-google-btn" onClick={() => googleLogin()} disabled={googleLoading}>
            <GoogleIcon />
            {googleLoading ? "Please wait…" : "Continue with Google"}
          </button>

          <div className="da-footer">
            Already have an account? <Link to="/dark-login">Login</Link>
          </div>

          <div className="da-test-banner">
            TEST PAGE — Safe to use; this page will replace the normal signup once approved
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarkSignup;
