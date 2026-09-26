import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import { BsWhatsapp } from "react-icons/bs";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import "react-phone-number-input/style.css";
import PhoneInput, { getCountryCallingCode } from "react-phone-number-input";

import {
  loginHeroLeft,
  loginPlantCoin,
  oxylogodashboard,
} from "../../imagepath";
import {
  sendwhatappotp,
  verifywhatappotp,
  warnApiError,
} from "../../HttpRequest/beforelogin";
import { saveLoginSession } from "../../HttpRequest/aiAdminApi";
import BASE_URL from "../../../config";
import { getPostLoginRedirectUrl } from "../../../utils/redirectUtils";
import { toastrError, toastrSuccess } from "../Base UI Elements/Toast";
import { WarningBackendApi } from "../Base UI Elements/SweetAlert";
import Whatappuser from "./Whatappuser";
import "./loginotp.css";

const CountrySelectWithCallingCode = ({
  value,
  onChange,
  options,
  iconComponent: Icon,
  disabled,
  name,
  "aria-label": ariaLabel,
}) => {
  let callingCode = "";
  try {
    if (value && value !== "ZZ") {
      callingCode = getCountryCallingCode(value);
    }
  } catch (e) {}

  return (
    <div className="PhoneInputCountry">
      <select
        className="PhoneInputCountrySelect"
        value={value || "ZZ"}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === "ZZ" ? undefined : val);
        }}
        disabled={disabled}
        name={name}
        aria-label={ariaLabel}
      >
        {options.map((option, idx) => {
          if (option.divider) {
            return (
              <option key={idx} disabled value="">
                ──────────
              </option>
            );
          }
          let dial = "";
          try {
            if (option.value && option.value !== "ZZ") {
              dial = ` (+${getCountryCallingCode(option.value)})`;
            }
          } catch (e) {}
          return (
            <option key={option.value || idx} value={option.value}>
              {option.label}{dial}
            </option>
          );
        })}
      </select>

      {Icon && value && (
        <div className="PhoneInputCountryIcon">
          <Icon country={value} label={value} aspectRatio={1.5} />
        </div>
      )}

      <div className="PhoneInputCountrySelectArrow" />

      {callingCode && (
        <span className="loginotp-calling-code">
          +{callingCode}
        </span>
      )}
    </div>
  );
};

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

const Whatapplog = () => {
  const history = useNavigate();
  const [handlewhatapp, sethandlewhatapp] = useState(true);
  const [value, setValue] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [isVerified, setIsVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [isloading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleModal, setGoogleModal] = useState(null); // { status, email }

  const [whatappotp, setwhatappotp] = useState({
    successMessage: "",
    errorMessage: "",
    otpdata: "",
    responsedata: null,
  });

  const [data, setdata] = useState("");
  const [datavalid, setdatavaild] = useState(false);
  const otpBoxRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

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
      const raw = err?.response?.data?.errorMessage || "Could not verify Google account. Please try standard login.";
      WarningBackendApi("Google Login Failed", cleanGoogleLoginError(raw));
    } finally {
      setGoogleLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => WarningBackendApi("Google Login Failed", "Google authentication was cancelled or failed."),
  });

  const handleResendWhatsappOtp = async () => {
    if (isResending || resendTimer > 0) return;
    if (!value || value.trim() === "") {
      toastrError("Please enter your WhatsApp number");
      return;
    }

    setIsResending(true);
    try {
      const response = await sendwhatappotp(value);
      if (response.request?.status === 200 || response.status === 200) {
        setwhatappotp((prev) => ({
          ...prev,
          otpdata: response.data,
          successMessage: "WhatsApp OTP resent successfully!",
          errorMessage: "",
        }));
        toastrSuccess("WhatsApp OTP resent successfully!");
        setResendTimer(30);
      } else {
        const errMsg = response.response?.data?.errorMessage || "Failed to resend WhatsApp OTP";
        setwhatappotp((prev) => ({
          ...prev,
          errorMessage: errMsg,
          successMessage: "",
        }));
        toastrError(errMsg);
      }
    } catch (error) {
      toastrError("Failed to resend WhatsApp OTP");
    } finally {
      setIsResending(false);
    }
  };

  const verifyotp = async (overrideOtp) => {
    const code = typeof overrideOtp === "string" ? overrideOtp : otpDigits.join("");
    if (!code || code.length !== 4) {
      toastrError("Please enter the 4-digit WhatsApp OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await verifywhatappotp(whatappotp.otpdata, code);
      const accessToken = response.headers?.accesstoken;

      if (accessToken) {
        setwhatappotp((prev) => ({
          ...prev,
          responsedata: response,
          errorMessage: "",
        }));
        sessionStorage.setItem("accessToken", accessToken);
        localStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("userId", response.data.id);
        localStorage.setItem("userId", response.data.id);
        sessionStorage.setItem("tokenTime", response.data.tokenGeneratedTime);
        localStorage.setItem("primaryType", response.data.primaryType);
        sessionStorage.setItem("primaryType", response.data.primaryType);
        saveLoginSession(response);
        toastrSuccess("Login Success!");

        const pType = response.data.primaryType;
        let redirectPath = "/borrowerDashboard";
        if (pType === "LENDER") {
          redirectPath = `/lenderAIDashboard/${response.data.id}`;
        } else if (pType === "ADMIN" || pType === "SUPERADMIN" || pType === "HELPDESKADMIN") {
          redirectPath = "/oxyloansadmindashboard";
        }

        setIsVerified(true);
        setTimeout(() => {
          history(getPostLoginRedirectUrl(redirectPath, pType));
        }, 2200);
      } else if (response.response?.status === 400) {
        const errMsg = response.response?.data?.errorMessage || "Invalid WhatsApp OTP entered";
        toastrError(errMsg);
        setwhatappotp((prev) => ({ ...prev, errorMessage: errMsg }));
      } else if (response?.data?.whatsappLoginResponse) {
        setdata(response);
        setdatavaild(true);
      } else {
        const errMsg = response.response?.data?.errorMessage || "Verification failed";
        toastrError(errMsg);
        setwhatappotp((prev) => ({ ...prev, errorMessage: errMsg }));
      }
    } catch (err) {
      toastrError(err?.message || "WhatsApp OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const sethandlewhatappclick = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!value || value.trim() === "") {
      toastrError("Please enter your WhatsApp number");
      return;
    }
    const digitsOnly = value.replace(/\D/g, "");
    if (digitsOnly.length < 7) {
      toastrError("Please enter a valid WhatsApp number");
      return;
    }

    setLoading(true);
    try {
      const response = await sendwhatappotp(value);
      if (response.request?.status === 200 || response.status === 200) {
        sethandlewhatapp(false);
        setwhatappotp({
          ...whatappotp,
          otpdata: response.data,
          successMessage: "WhatsApp OTP sent successfully!",
          errorMessage: "",
        });
        toastrSuccess("WhatsApp OTP sent!");
        setResendTimer(30);
        setOtpDigits(["", "", "", ""]);
        setTimeout(() => {
          otpBoxRefs.current[0]?.focus();
        }, 150);
      } else {
        const errMsg = response.response?.data?.errorMessage || "Failed to send WhatsApp OTP";
        setwhatappotp({
          ...whatappotp,
          errorMessage: errMsg,
          successMessage: "",
        });
        toastrError(errMsg);
      }
    } catch (err) {
      toastrError(err?.message || "Failed to send WhatsApp OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpBoxChange = (index, char) => {
    if (char.length > 1) {
      const clean = char.replace(/\D/g, "").slice(0, 4);
      if (!clean) return;
      const newDigits = [...otpDigits];
      for (let i = 0; i < clean.length && index + i < 4; i++) {
        newDigits[index + i] = clean[i];
      }
      setOtpDigits(newDigits);
      const fullOtp = newDigits.join("");
      const nextIdx = Math.min(index + clean.length, 3);
      otpBoxRefs.current[nextIdx]?.focus();
      if (fullOtp.length === 4) {
        verifyotp(fullOtp);
      }
      return;
    }

    if (!/^\d*$/.test(char)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);
    const fullOtp = newDigits.join("");

    if (char !== "" && index < 3) {
      otpBoxRefs.current[index + 1]?.focus();
    }

    if (char !== "" && fullOtp.length === 4) {
      verifyotp(fullOtp);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        otpBoxRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpBoxRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      otpBoxRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    const newDigits = ["", "", "", ""];
    for (let i = 0; i < pasted.length && i < 4; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    const fullOtp = newDigits.join("");
    const focusIdx = Math.min(pasted.length, 3);
    otpBoxRefs.current[focusIdx]?.focus();
    if (fullOtp.length === 4) {
      verifyotp(fullOtp);
    }
  };

  return (
    <>
      {datavalid ? (
        <div className="loginotp-page" style={{ height: "auto", minHeight: "100vh", padding: "24px 16px", overflowY: "auto", }}>
          <div style={{ width: "100%", maxWidth: "960px", margin: "0 auto" }}>
            <div className="loginotp-right-card" style={{ width: "100%", maxWidth: "100%", height: "auto", minHeight: "auto", padding: "28px 24px" }}>
              <div className="d-flex justify-content-center mb-3">
                <img src={oxylogodashboard} className="imagelo11" alt="OxyLoans" style={{ height: "42px", objectFit: "contain" }} />
              </div>
              <Whatappuser data={data?.data?.whatsappLoginResponse} />
            </div>
          </div>
        </div>
      ) : (
        <div className="loginotp-page">
          <div className="loginotp-two-cards-wrap">
            {/* Left Card - Hero Artwork with Micro-Animations */}
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
                <div className="loginotp-success-state">
                  <div
                    className="loginotp-success-icon-wrap"
                    style={{
                      background: "#25D366",
                      backgroundImage: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                      boxShadow: "0 10px 25px rgba(37, 211, 102, 0.35)",
                    }}
                  >
                    <FeatherIcon icon="check" size={32} />
                  </div>
                  <h2 className="loginotp-success-title">Verified Successfully!</h2>
                  <p className="loginotp-success-desc">
                    WhatsApp verification complete. Redirecting you to your dashboard...
                  </p>
                  <div className="loginotp-redirect-progress-bar">
                    <div
                      className="loginotp-redirect-progress-fill"
                      style={{ background: "#25D366" }}
                    />
                  </div>
                </div>
              ) : handlewhatapp ? (
                /* Step 1: Enter WhatsApp Number */
                <>
                  <div className="loginotp-card-header">
                    <div className="loginotp-header-left">
                      <h1 className="loginotp-welcome-title">
                        Welcome to <span className="oxy-blue">Oxy</span>
                        <span className="oxy-green">Loans</span>
                      </h1>
                      <p className="loginotp-welcome-sub">
                        Login with your registered WhatsApp number
                      </p>
                    </div>
                    <div className="loginotp-sprout-wrap">
                      <img src={loginPlantCoin} alt="OxyLoans Sprout" />
                    </div>
                  </div>

                  <div className="loginotp-section-heading">
                    <h2 className="loginotp-step-title">WhatsApp Login</h2>
                    <p className="loginotp-step-desc">
                      Enter your WhatsApp number to receive an OTP
                    </p>
                  </div>

                  <form onSubmit={sethandlewhatappclick}>
                    <div className="loginotp-phone-input-wrap">
                      <PhoneInput
                        value={value}
                        onChange={setValue}
                        defaultCountry="IN"
                        countrySelectComponent={CountrySelectWithCallingCode}
                        placeholder="Enter WhatsApp number *"
                      />
                    </div>

                    {whatappotp.errorMessage && (
                      <div className="loginotp-field-error">
                        <FeatherIcon icon="alert-circle" size={13} />
                        {whatappotp.errorMessage}
                      </div>
                    )}

                    <button
                      className="loginotp-send-btn whatsapp-btn"
                      type="submit"
                      disabled={isloading}
                    >
                      {isloading ? (
                        <div className="spinner-border spinner-border-sm text-light" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      ) : (
                        <>
                          <BsWhatsapp size={15} style={{ marginRight: "3px" }} /> Send WhatsApp OTP <FeatherIcon icon="arrow-right" size={16} className="btn-arrow-icon" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="loginotp-divider">
                    <span>OR</span>
                  </div>

                  {/* Alternative Login Buttons */}
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

                    <Link to="/loginotp" className="loginotp-alt-btn">
                      <FeatherIcon icon="smartphone" size={16} style={{ color: "#0066f6" }} />
                      Login with Mobile OTP
                    </Link>

                    <Link to="/login" className="loginotp-alt-btn">
                      <FeatherIcon icon="mail" size={16} style={{ color: "#1e293b" }} />
                      Login with Email
                    </Link>
                  </div>

                  {/* Features / Sign Up Dual-Card */}
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

                  {/* Bottom Footnote */}
                  <div className="loginotp-bottom-footnote">
                    <span>Don't have an account? </span>
                    <Link to="/register">Sign Up Now →</Link>
                  </div>
                </>
              ) : (
                /* Step 2: 4-digit WhatsApp OTP Verification */
                <div className="loginotp-verify-view">
                  <div className="loginotp-card-header">
                    <div className="loginotp-header-left">
                      <h1 className="loginotp-welcome-title">Verify WhatsApp OTP</h1>
                      <p className="loginotp-verify-sub">
                        We've sent a 4-digit code to your WhatsApp. It will auto-verify once entered.
                      </p>
                      <div className="loginotp-phone-pill">
                        <BsWhatsapp size={13} style={{ color: "#25D366" }} />
                        <span>{value}</span>
                        <button
                          type="button"
                          className="loginotp-edit-phone-btn"
                          onClick={() => {
                            sethandlewhatapp(true);
                            setOtpDigits(["", "", "", ""]);
                            setwhatappotp((prev) => ({ ...prev, errorMessage: "", successMessage: "" }));
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
                        style={{ width: "52px", height: "52px" }}
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

                  {whatappotp.errorMessage && (
                    <div className="loginotp-field-error justify-content-center text-center">
                      <FeatherIcon icon="alert-circle" size={14} />
                      {whatappotp.errorMessage}
                    </div>
                  )}

                  {whatappotp.successMessage && (
                    <div className="text-success text-center small mb-2">
                      {whatappotp.successMessage}
                    </div>
                  )}

                  <div className="loginotp-resend-row">
                    <span>Didn't receive WhatsApp OTP?</span>
                    {resendTimer > 0 ? (
                      <span>
                        Resend in <strong className="loginotp-countdown">{resendTimer}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="loginotp-resend-link"
                        onClick={handleResendWhatsappOtp}
                        disabled={isResending}
                      >
                        {isResending ? "Resending..." : "Resend OTP"}
                      </button>
                    )}
                  </div>

                  <button
                    className="loginotp-send-btn whatsapp-btn"
                    type="button"
                    onClick={() => verifyotp()}
                    disabled={isloading}
                  >
                    {isloading ? (
                      <div className="spinner-border spinner-border-sm text-light" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    ) : (
                      <>
                        Verify &amp; Login <FeatherIcon icon="arrow-right" size={16} className="btn-arrow-icon" />
                      </>
                    )}
                  </button>

                  <div className="loginotp-bottom-footnote" style={{ marginTop: "14px" }}>
                    <button
                      type="button"
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0066f6",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        padding: 0,
                      }}
                      onClick={() => {
                        sethandlewhatapp(true);
                        setOtpDigits(["", "", "", ""]);
                        setwhatappotp((prev) => ({ ...prev, errorMessage: "", successMessage: "" }));
                      }}
                    >
                      ← Back to WhatsApp number
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Google Unlinked Modal */}
      {googleModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 24,
              maxWidth: 400,
              width: "100%",
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.3)",
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <GoogleIcon />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 6px" }}>
              Account Not Found
            </h3>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px", lineHeight: 1.4 }}>
              The Google account <strong>{googleModal.email}</strong> is not registered with OxyLoans yet.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link
                to="/register"
                className="loginotp-send-btn"
                style={{ textDecoration: "none", marginTop: 0 }}
                onClick={() => setGoogleModal(null)}
              >
                Sign Up as Lender
              </Link>
              <Link
                to="/borrower_register"
                className="loginotp-alt-btn"
                style={{ textDecoration: "none" }}
                onClick={() => setGoogleModal(null)}
              >
                Sign Up as Borrower
              </Link>
              <button
                type="button"
                className="loginotp-alt-btn"
                style={{ border: "none", color: "#64748b" }}
                onClick={() => setGoogleModal(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Whatapplog;
