import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import { WarningBackendApi } from "../Base UI Elements/SweetAlert";
import { BsWhatsapp } from "react-icons/bs";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

import { loginHeroLeft, loginPlantCoin } from "../../imagepath";
import { handlesenOtp, usersubmitotp, isApiSuccess, warnApiError } from "../../HttpRequest/beforelogin";
import { saveLoginSession } from "../../HttpRequest/aiAdminApi";
import BASE_URL, { ENV, DEV_ADMIN_MOBILE, DEV_OTP } from "../../../config";
import { toastrSuccess, toastrWarning } from "../Base UI Elements/Toast";
import { getPostLoginRedirectUrl } from "../../../utils/redirectUtils";
import Swal from "sweetalert2";
import "./loginotp.css";

const cleanGoogleLoginError = (msg) => {
  if (msg && msg.includes("Registration step 2 is pending")) {
    return "Your registration is incomplete. Please complete Step 2 (personal details) to activate your account.";
  }
  return msg;
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l6-6C34.5 6.5 29.6 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c11 0 20.5-8 20.5-19.5 0-1.3-.1-2.7-.5-4z"/>
    <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3.1 0 5.8 1.1 8 2.9l6-6C34.5 6.5 29.6 4.5 24 4.5c-7.7 0-14.3 4.4-17.7 10.2z"/>
    <path fill="#FBBC05" d="M24 43.5c5.8 0 10.8-1.9 14.5-5.2l-6.7-5.5C29.8 34.7 27 35.5 24 35.5c-6 0-10.7-3.9-11.7-9.1l-7 5.4C8.5 39.5 15.7 43.5 24 43.5z"/>
    <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-.6 2.7-2.2 4.9-4.4 6.4l6.7 5.5C41.8 36.7 44.5 30.8 44.5 24c0-1.3-.1-2.7-.5-4z"/>
  </svg>
);

const Loginotp = () => {
  const history = useNavigate();
  const [userLogInInfo, setUserLoginInfo] = useState({
    email: "",
    moblie: "",
    loginwithotp: false,
    password: "",
    emailerror: "",
    passworderror: "",
    sentotp: false,
    response: null,
    dataIpv4: "",
    oftermoblieotp: false,
    otp: "",
    dataIpv6: "",
    error: null,
    errormessage: "",
  });

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [isVerified, setIsVerified] = useState(false);
  const otpBoxRefs = useRef([]);

  const [isloading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleModal, setGoogleModal] = useState(null); // { status, email, accessToken }

  const handleGoogleSuccess = async (tokenResponse) => {
    setGoogleLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/v1/user/checkGoogleEmail`,
        { accessToken: tokenResponse.access_token },
        { headers: { "Content-Type": "application/json" } }
      );
      const { phoneNumberRequiredOrNot: status, signInUrl: email, userId, registrationTime } = res.data;
      if (status === "LINKED" || status === "FOUND") {
        const loginRes = await axios.post(
          `${BASE_URL}/v1/user/loginWithLinkedGoogle`,
          { accessToken: tokenResponse.access_token },
          { headers: { "Content-Type": "application/json" } }
        );
        if (saveLoginSession(loginRes)) {
          toastrSuccess("Google login successful!");
          const role = loginRes.data?.primaryType;
          if (role === "LENDER") history("/lenderAIDashboard/" + loginRes.data.id);
          else if (["ADMIN", "HELPDESKADMIN", "SUPERADMIN", "PRIMARYADMIN"].includes(role)) history("/oxyloansadmindashboard");
          else history("/borrowerDashboard");
        }
      } else if (status === "STEP2_PENDING") {
        history(`/register_active_proceed?id=${userId}&time=${registrationTime}`);
      } else {
        setGoogleModal({ status: "NOT_FOUND", email });
      }
    } catch (err) {
      const raw = err?.response?.data?.errorMessage || "Could not verify Google account. Please try OTP login.";
      WarningBackendApi("Google Login Failed", cleanGoogleLoginError(raw));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleAllow = async () => {
    if (!googleModal) return;
    setGoogleLoading(true);
    try {
      if (googleModal.status === "LINKED") {
        const res = await axios.post(
          `${BASE_URL}/v1/user/loginWithLinkedGoogle`,
          { accessToken: googleModal.accessToken },
          { headers: { "Content-Type": "application/json" } }
        );
        if (saveLoginSession(res)) {
          toastrSuccess("Google login successful!");
          const role = res.data?.primaryType;
          if (role === "LENDER") history("/lenderAIDashboard/" + res.data.id);
          else if (["ADMIN", "HELPDESKADMIN", "SUPERADMIN", "PRIMARYADMIN"].includes(role)) history("/oxyloansadmindashboard");
          else history("/borrowerDashboard");
        }
      } else {
        const mobile = googleModal.mobileNumber || "";
        setGoogleModal((prev) => ({ ...prev, pendingLink: true }));
        if (mobile) {
          setUserLoginInfo((prev) => ({ ...prev, email: mobile, emailerror: "" }));
          try {
            const otpRes = await handlesenOtp(mobile);
            if (isApiSuccess(otpRes)) {
              if (otpRes.data?.id) sessionStorage.setItem("userId", otpRes.data.id);
              setUserLoginInfo((prev) => ({ ...prev, email: mobile, sentotp: true, emailerror: "" }));
              toastrSuccess("OTP sent! Enter it below to link your Google account.");
              setTimeout(() => {
                otpBoxRefs.current[0]?.focus();
              }, 150);
            }
          } catch (e) {
            /* user can send OTP manually */
          }
        }
      }
    } catch (err) {
      const raw = err?.response?.data?.errorMessage || "Google login failed. Please use mobile OTP.";
      WarningBackendApi("Google Login Failed", cleanGoogleLoginError(raw));
    } finally {
      setGoogleLoading(false);
      if (googleModal?.status === "LINKED") setGoogleModal(null);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => WarningBackendApi("Google Login Failed", "Google authentication was cancelled or failed."),
  });

  const submitloginhandler = async (overrideOtp) => {
    const otpToUse = typeof overrideOtp === "string" ? overrideOtp : userLogInInfo.password;
    if (!otpToUse || otpToUse.trim() === "") {
      setUserLoginInfo((prevState) => ({
        ...prevState,
        passworderror: "Please enter the OTP",
      }));
      return;
    }

    const { email } = userLogInInfo;
    setLoading(true);
    try {
      const retriveresponse = await usersubmitotp(email, otpToUse);

      if (isApiSuccess(retriveresponse)) {
        if (!saveLoginSession(retriveresponse)) {
          const { title, message } = warnApiError(
            retriveresponse,
            "Login failed",
            "Login succeeded but no access token was returned. Check backend logs."
          );
          WarningBackendApi(title, message);
          return;
        }
        setIsVerified(true);
        toastrSuccess("Login Success!");
        if (googleModal?.pendingLink && googleModal?.accessToken) {
          try {
            await axios.post(
              `${BASE_URL}/v1/user/${retriveresponse.data?.id}/linkGoogleAccount`,
              { accessToken: googleModal.accessToken },
              { headers: { "Content-Type": "application/json", accessToken: sessionStorage.getItem("accessToken") } }
            );
            toastrSuccess("Google account linked! Next time you can login with Google directly.");
          } catch (e) {
            /* non-blocking */
          }
          setGoogleModal(null);
        }
        const role = retriveresponse.data.primaryType;
        let defaultPath = "/borrowerDashboard/admin$";
        if (role === "LENDER") {
          defaultPath = "/lenderAIDashboard/" + retriveresponse.data.id;
        } else if (["ADMIN", "HELPDESKADMIN", "SUPERADMIN", "PRIMARYADMIN"].includes(role)) {
          defaultPath = "/oxyloansadmindashboard";
        }
        setTimeout(() => {
          history(getPostLoginRedirectUrl(defaultPath, role));
        }, 2200);
      } else {
        const { title, message } = warnApiError(retriveresponse, "Login failed", "Invalid OTP or mobile number");
        const step2 = /step 2 is pending\s*=\s*(\d+)\s*=/i.exec(message || "");
        if (step2) {
          toastrSuccess("Please complete your registration to continue.");
          history(`/register_active_proceed?id=${step2[1]}&time=${Date.now()}`);
          return;
        }
        setUserLoginInfo((prev) => ({
          ...prev,
          passworderror: message || "Invalid OTP entered",
        }));
        toastrWarning(message);
        WarningBackendApi(title, message);
      }
    } catch (e) {
      WarningBackendApi("Login failed", e?.message || "Unexpected error during login");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpBoxChange = (index, value) => {
    if (value.length > 1) {
      const clean = value.replace(/\D/g, "").slice(0, 6);
      if (!clean) return;
      const newDigits = [...otpDigits];
      for (let i = 0; i < clean.length && index + i < 6; i++) {
        newDigits[index + i] = clean[i];
      }
      setOtpDigits(newDigits);
      const fullOtp = newDigits.join("");
      setUserLoginInfo((prev) => ({ ...prev, password: fullOtp, passworderror: "" }));
      const nextIdx = Math.min(index + clean.length, 5);
      otpBoxRefs.current[nextIdx]?.focus();
      if (fullOtp.length === 6) {
        submitloginhandler(fullOtp);
      }
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    const fullOtp = newDigits.join("");
    setUserLoginInfo((prev) => ({ ...prev, password: fullOtp, passworderror: "" }));

    if (value !== "" && index < 5) {
      otpBoxRefs.current[index + 1]?.focus();
    }

    if (value !== "" && fullOtp.length === 6) {
      submitloginhandler(fullOtp);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        otpBoxRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpBoxRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpBoxRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedData) return;
    const newDigits = ["", "", "", "", "", ""];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newDigits[i] = pastedData[i];
    }
    setOtpDigits(newDigits);
    const fullOtp = newDigits.join("");
    setUserLoginInfo((prev) => ({ ...prev, password: fullOtp, passworderror: "" }));
    const focusIdx = Math.min(pastedData.length, 5);
    otpBoxRefs.current[focusIdx]?.focus();
    if (fullOtp.length === 6) {
      submitloginhandler(fullOtp);
    }
  };

  useEffect(() => {
    if (ENV !== "local" || !DEV_ADMIN_MOBILE) return;

    const autoLogin = async () => {
      try {
        const otpRes = await handlesenOtp(DEV_ADMIN_MOBILE);
        if (!isApiSuccess(otpRes)) return;
        const res = await usersubmitotp(DEV_ADMIN_MOBILE, DEV_OTP);
        if (isApiSuccess(res) && saveLoginSession(res)) {
          history("/adminAIDashboard");
        }
      } catch (e) {
        // manual login required
      }
    };
    autoLogin();
  }, [history]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleResendOtp = async () => {
    if (isResending || resendTimer > 0) return;
    if (!userLogInInfo.email || userLogInInfo.email.length !== 10) {
      setUserLoginInfo((prevState) => ({
        ...prevState,
        emailerror: "Please enter a 10 digit mobile number",
      }));
      return;
    }
    setIsResending(true);
    try {
      const response = await handlesenOtp(userLogInInfo.email);
      if (isApiSuccess(response)) {
        if (response.data?.id) {
          sessionStorage.setItem("userId", response.data.id);
        }
        toastrSuccess("OTP resent successfully!");
        setResendTimer(30);
      } else {
        const { title, message } = warnApiError(response, "Resend OTP failed", "Could not resend OTP");
        toastrWarning(message);
        WarningBackendApi(title, message);
      }
    } catch (e) {
      WarningBackendApi("Resend OTP failed", e?.message || "Could not resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  const sendtheOtp = async () => {
    if (userLogInInfo.email === "") {
      setUserLoginInfo((prevState) => ({
        ...prevState,
        emailerror: "Please enter the Mobile Number",
      }));
      return;
    }

    if (userLogInInfo.email.length !== 10) {
      setUserLoginInfo((prevState) => ({
        ...prevState,
        emailerror: "Please enter a 10 digit mobile number",
      }));
      return;
    }

    setLoading(true);
    try {
      const response = await handlesenOtp(userLogInInfo.email);

      if (isApiSuccess(response)) {
        if (response.data?.id) {
          sessionStorage.setItem("userId", response.data.id);
        }
        setUserLoginInfo({ ...userLogInInfo, sentotp: true, emailerror: "" });
        setOtpDigits(["", "", "", "", "", ""]);
        toastrSuccess("OTP sent successfully!");
        setResendTimer(30);
        setTimeout(() => {
          otpBoxRefs.current[0]?.focus();
        }, 200);
      } else {
        const { title, message } = warnApiError(response, "Send OTP failed", "Could not send OTP");
        WarningBackendApi(title, message);
      }
    } catch (e) {
      WarningBackendApi("Send OTP failed", e?.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginotp-page">
      <div className="loginotp-two-cards-wrap">
        {/* Left Card - Hero Artwork with Dynamic Micro-Animations */}
        <div className="loginotp-left-card">
          <img
            src={loginHeroLeft}
            alt="OxyLoans Quick Loans The Right Way"
            className="loginotp-hero-img"
          />
          {/* Dynamic Animated Overlays */}
          <div className="hero-animated-overlay">
            <div className="hero-light-sweep" />
            <div className="hero-coin-pulse" />
            <div className="hero-shield-glow" />
            <div className="hero-sparkle sp-1" />
            <div className="hero-sparkle sp-2" />
            <div className="hero-sparkle sp-3" />
          </div>
        </div>

        {/* Right Card - Auth Form */}
        <div className="loginotp-right-card">
          {isVerified ? (
            /* Verified Successfully View (Video Specification) */
            <div className="loginotp-success-state">
              <div className="loginotp-success-icon-wrap">
                <FeatherIcon icon="check" size={32} />
              </div>
              <h2 className="loginotp-success-title">Verified Successfully!</h2>
              <p className="loginotp-success-desc">
                Your phone number has been verified. Redirecting to your dashboard...
              </p>
              <div className="loginotp-redirect-progress-bar">
                <div className="loginotp-redirect-progress-fill" />
              </div>
            </div>
          ) : !userLogInInfo.sentotp ? (
            /* Initial Phone Input View (Pixel-Perfect ChatGPT Image Design) */
            <>
              <div className="loginotp-card-header">
                <div className="loginotp-header-left">
                  <h1 className="loginotp-welcome-title">
                    Welcome to <span className="oxy-blue">Oxy</span>
                    <span className="oxy-green">Loans</span>
                  </h1>
                  <p className="loginotp-welcome-sub">
                    Login to access your account as a Lender or Borrower
                  </p>
                </div>
                <div className="loginotp-sprout-wrap">
                  <img src={loginPlantCoin} alt="OxyLoans Sprout" />
                </div>
              </div>

              <div className="loginotp-section-heading">
                <h2 className="loginotp-step-title">Login With OTP</h2>
                <p className="loginotp-step-desc">
                  Enter your mobile number to receive an OTP
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendtheOtp();
                }}
              >
                <div className={`loginotp-input-box ${userLogInInfo.emailerror ? "has-error" : ""}`}>
                  <span className="loginotp-phone-icon">
                    <FeatherIcon icon="smartphone" size={17} />
                  </span>
                  <span className="loginotp-input-divider" />
                  <input
                    className="loginotp-native-input"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={userLogInInfo.email}
                    name="email"
                    placeholder="Enter Mobile Number *"
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setUserLoginInfo({ ...userLogInInfo, email: digits, emailerror: "" });
                    }}
                    maxLength={10}
                    id="userloginusername"
                    autoComplete="tel"
                    required
                  />
                </div>
                {userLogInInfo.emailerror && (
                  <div className="loginotp-field-error">
                    <FeatherIcon icon="alert-circle" size={13} />
                    {userLogInInfo.emailerror}
                  </div>
                )}

                <button
                  className="loginotp-send-btn"
                  type="submit"
                  disabled={isloading}
                >
                  {isloading ? (
                    <div className="spinner-border spinner-border-sm text-light" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <>
                      Send OTP <FeatherIcon icon="arrow-right" size={16} className="btn-arrow-icon" />
                    </>
                  )}
                </button>
              </form>

              <div className="loginotp-divider">
                <span>OR</span>
              </div>

              <div className="loginotp-alt-btns">
                <button
                  type="button"
                  className="loginotp-alt-btn"
                  onClick={() => googleLogin()}
                  disabled={googleLoading}
                >
                  {googleLoading ? (
                    <span className="spinner-border spinner-border-sm text-primary" />
                  ) : (
                    <GoogleIcon />
                  )}
                  Continue with Google
                </button>

                <Link to="/login" className="loginotp-alt-btn">
                  <FeatherIcon icon="mail" size={16} style={{ color: "#1e293b" }} />
                  Login with Email
                </Link>

                <Link to="/whatsapplogin" className="loginotp-alt-btn">
                  <BsWhatsapp size={17} style={{ color: "#25D366" }} />
                  Login with WhatsApp OTP
                </Link>
              </div>

              {/* Exact Light Blue Rounded Features Pill Container with Direct Sign Up Links */}
              <div className="loginotp-features-card">
                <Link to="/register" className="loginotp-feature-col">
                  <div className="loginotp-feature-icon green">
                    <FeatherIcon icon="trending-up" size={16} />
                  </div>
                  <span className="loginotp-feature-role">Lender</span>
                  <p className="loginotp-feature-desc">Grow your wealth</p>
                  <span className="loginotp-feature-signup-btn">
                    Sign Up as Lender →
                  </span>
                </Link>
                <Link to="/borrower_register" className="loginotp-feature-col">
                  <div className="loginotp-feature-icon blue">
                    <FeatherIcon icon="users" size={16} />
                  </div>
                  <span className="loginotp-feature-role">Borrower</span>
                  <p className="loginotp-feature-desc">Quick loan access</p>
                  <span className="loginotp-feature-signup-btn borrower">
                    Sign Up as Borrower →
                  </span>
                </Link>
              </div>

              {/* Bottom Sign Up Footnote */}
              <div className="loginotp-bottom-footnote">
                <span>Don't have an account? </span>
                <Link to="/register">Sign Up Now →</Link>
              </div>
            </>
          ) : (
            /* OTP Verification Screen (Video Specification) */
            <div className="loginotp-verify-view">
              <div className="loginotp-card-header">
                <div className="loginotp-header-left">
                  <h1 className="loginotp-welcome-title">Let's verify your number</h1>
                  <p className="loginotp-verify-sub">
                    We've sent a 6-digit code to your phone. It'll auto-verify once entered.
                  </p>
                  <div className="loginotp-phone-pill">
                    <span>+91 {userLogInInfo.email}</span>
                    <button
                      type="button"
                      className="loginotp-edit-phone-btn"
                      onClick={() => {
                        setUserLoginInfo((prev) => ({
                          ...prev,
                          sentotp: false,
                          password: "",
                          passworderror: "",
                        }));
                        setOtpDigits(["", "", "", "", "", ""]);
                      }}
                    >
                      <FeatherIcon icon="edit-2" size={12} />
                      Change
                    </button>
                  </div>
                </div>
                <div className="loginotp-sprout-wrap">
                  <img src={loginPlantCoin} alt="OxyLoans Sprout" />
                </div>
              </div>

              <div className="loginotp-boxes-grid" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpBoxRefs.current[idx] = el)}
                    className={`loginotp-digit-box ${digit ? "is-filled" : ""}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {userLogInInfo.passworderror && (
                <div className="loginotp-field-error justify-content-center text-center">
                  <FeatherIcon icon="alert-circle" size={14} />
                  {userLogInInfo.passworderror}
                </div>
              )}

              <div className="loginotp-resend-row">
                <span>Didn't receive the code?</span>
                {resendTimer > 0 ? (
                  <span>
                    Resend in <strong className="loginotp-countdown">{resendTimer}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    className="loginotp-resend-link"
                    onClick={handleResendOtp}
                    disabled={isResending}
                  >
                    {isResending ? "Resending..." : "Resend"}
                  </button>
                )}
              </div>

              <button
                className="loginotp-send-btn"
                type="button"
                onClick={() => submitloginhandler()}
                disabled={isloading}
              >
                {isloading ? (
                  <div className="spinner-border spinner-border-sm text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <>
                    Verify &amp; Login <FeatherIcon icon="arrow-right" size={16} />
                  </>
                )}
              </button>

              <div className="loginotp-card-footer mt-3">
                Need help? <Link to="/login">Login with Email</Link> or{" "}
                <Link to="/whatsapplogin">WhatsApp</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Google Login Modal Overlay */}
      {googleModal && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.5)",
                backdropFilter: "blur(4px)",
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  padding: "28px 30px",
                  maxWidth: 420,
                  width: "100%",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
                  textAlign: "center",
                }}
              >
                {googleModal.status === "NOT_FOUND" ? (
                  <>
                    <div style={{ fontSize: 38, marginBottom: 12 }}>⚠️</div>
                    <h5 style={{ fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
                      Gmail Not Registered
                    </h5>
                    <p style={{ color: "#64748b", fontSize: 13.5, marginBottom: 20 }}>
                      <strong style={{ color: "#0f172a" }}>{googleModal.email}</strong> is not found on OxyLoans.
                      <br />
                      Please login with your registered mobile number or sign up to create an account.
                    </p>
                    <button
                      className="loginotp-send-btn mb-2"
                      style={{ height: 44 }}
                      onClick={() => setGoogleModal(null)}
                    >
                      Login with Mobile OTP
                    </button>
                    <Link
                      to="/register"
                      className="loginotp-alt-btn mb-2"
                      style={{ background: "#ecfdf5", color: "#059669", borderColor: "#a7f3d0" }}
                      onClick={() => setGoogleModal(null)}
                    >
                      Sign Up New Account
                    </Link>
                    <Link
                      to="/whatsapplogin"
                      className="loginotp-alt-btn"
                      onClick={() => setGoogleModal(null)}
                    >
                      Login with WhatsApp OTP
                    </Link>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 38, marginBottom: 12 }}>✅</div>
                    <h5 style={{ fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>
                      OxyLoans Account Found
                    </h5>
                    <p style={{ color: "#64748b", fontSize: 13, marginBottom: 6 }}>
                      {googleModal.email}
                    </p>
                    {googleModal.mobileNumber && (
                      <p style={{ fontSize: 13.5, color: "#334155", marginBottom: 18 }}>
                        Registered mobile:{" "}
                        <strong>
                          {googleModal.mobileNumber.slice(0, -4).replace(/\d/g, "X") +
                            googleModal.mobileNumber.slice(-4)}
                        </strong>
                      </p>
                    )}
                    <button
                      className="loginotp-send-btn mb-2"
                      style={{ height: 44 }}
                      onClick={handleGoogleAllow}
                      disabled={googleLoading}
                    >
                      {googleLoading ? <span className="spinner-border spinner-border-sm me-2" /> : null}
                      Send OTP via SMS
                    </button>
                    <Link
                      to="/whatsapplogin"
                      className="loginotp-alt-btn mb-2"
                      onClick={() => {
                        if (googleModal.mobileNumber)
                          sessionStorage.setItem("prefill_mobile", googleModal.mobileNumber);
                        setGoogleModal(null);
                      }}
                    >
                      Send OTP via WhatsApp
                    </Link>
                    <button
                      className="loginotp-alt-btn"
                      onClick={() => {
                        if (googleModal.mobileNumber)
                          setUserLoginInfo((prev) => ({
                            ...prev,
                            email: googleModal.mobileNumber,
                            emailerror: "",
                          }));
                        setGoogleModal(null);
                      }}
                    >
                      Enter OTP Manually
                    </button>
                  </>
                )}
                <button
                  style={{
                    marginTop: 14,
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                  onClick={() => setGoogleModal(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
    </div>
  );
};

export default Loginotp;
