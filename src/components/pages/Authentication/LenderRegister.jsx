import React, { useEffect, useRef, useState } from "react";
import { lenderRegisterHero, lenderShieldBadge } from "../../imagepath";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import "./loginotp.css";
import * as api from "./api";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import OtpInput from "./OtpInput";
import { toastrSuccess, toastrWarning } from "../Base UI Elements/Toast";
import Swal from "sweetalert2";
import { API_USER_URL } from "../../../config";
import axios from "axios";
import { referrerdata, isApiSuccess } from "../../HttpRequest/beforelogin";
import { clearLastVisitedUrls } from "../../../utils/redirectUtils";
import { useGoogleLogin } from "@react-oauth/google";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.79l7.97-6.2z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

export default function LenderRegister() {
  const inputRef = useRef();
  const navigate = useNavigate();

  const [field, setfield] = useState(true);
  const [submitotp, setsubmitotp] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [isGrOtpVerifying, setIsGrOtpVerifying] = useState(false);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
  const [gmailPrefill, setGmailPrefill] = useState(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [loadingResend, setLoadingResend] = useState(false);
  const [trackingId, setTrackingId] = useState(null);
  const [relationshipId, setRelationshipId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const [registrationField, setRegistrationField] = useState({
    email: "",
    pancard: "",
    password: "",
    referrerId: "",
    moblie: "",
    emailerror: "",
    pancarderror: "",
    passworderror: "",
    referrerIderror: "",
    uniqueNumber: "",
    moblieerror: "",
    mobileOTPNew: "",
  });

  // Google Sign-up Flow States (integrated from Signup.jsx)
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleStage, setGoogleStage] = useState(null); // null | "mobile" | "otp"
  const [googleToken, setGoogleToken] = useState(null);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");
  const [grMobile, setGrMobile] = useState("");
  const [grMobileError, setGrMobileError] = useState("");
  const [grOtp, setGrOtp] = useState("");
  const [grOtpError, setGrOtpError] = useState("");
  const [grLoading, setGrLoading] = useState(false);
  const [grResendTimer, setGrResendTimer] = useState(30);

  useEffect(() => {
    let interval = null;
    if (!field && !submitotp && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [field, submitotp, resendTimer]);

  useEffect(() => {
    let interval = null;
    if (googleStage === "otp" && grResendTimer > 0) {
      interval = setInterval(() => {
        setGrResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [googleStage, grResendTimer]);

  const handleResendOtp = async () => {
    setLoadingResend(true);
    try {
      const RegisterResponse = await api.RegisterUser(registrationField.moblie);
      localStorage.setItem("seesion", RegisterResponse);
      toastrSuccess("OTP resent successfully!");
      setError("");
      setResendTimer(30);
    } catch (err) {
      const errMsg = err.response?.data?.errorMessage || "Failed to resend OTP";
      setError(errMsg);
      toastrWarning(errMsg);
    } finally {
      setLoadingResend(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Geolocation not available:", error);
        }
      );
    }
    // Check for Gmail pre-fill from Gmail signup flow
    try {
      const raw = sessionStorage.getItem("gmail_prefill");
      if (raw) {
        const prefill = JSON.parse(raw);
        // Discard stale/incomplete prefill (email or mobile missing)
        if (prefill.role === "LENDER" && prefill.emailVerified && prefill.email && prefill.mobile) {
          setGmailPrefill(prefill);
          setRegistrationField((prev) => ({
            ...prev,
            email: prefill.email || "",
            moblie: prefill.mobile || "",
            pancard: prefill.name || "",
          }));
        } else {
          sessionStorage.removeItem("gmail_prefill");
        }
      }
    } catch (e) { /* ignore */ }
  }, []);

  const validateReferrerId = async (refValue) => {
    let val = String(refValue || "").trim().toUpperCase();

    if (!val || val === "0") {
      setRegistrationField((prev) => ({
        ...prev,
        referrerIderror: "",
        uniqueNumber: "0",
      }));
      localStorage.setItem("uniqnumber", "0");
      return true;
    }

    // Normalize LR1040972 -> LR40972
    if (val.startsWith("LR10")) {
      val = "LR" + val.substring(4);
    }

    try {
      const response = await referrerdata(val);

      if (response && (response.status === 200 || isApiSuccess(response))) {
        const fetchedUniqueNumber =
          response?.data?.uniqueNumber ||
          (typeof response?.data === "string" ? response.data : val);

        setRegistrationField((prev) => ({
          ...prev,
          referrerIderror: "",
          uniqueNumber: fetchedUniqueNumber,
        }));

        localStorage.setItem("uniqnumber", fetchedUniqueNumber);
        return true;
      } else {
        const errMsg =
          response?.response?.data?.errorMessage ||
          response?.data?.errorMessage ||
          "Invalid Referrer ID";

        setRegistrationField((prev) => ({
          ...prev,
          referrerIderror: errMsg,
          uniqueNumber: "0",
        }));

        localStorage.setItem("uniqnumber", "0");
        return false;
      }
    } catch (err) {
      setRegistrationField((prev) => ({
        ...prev,
        referrerIderror: "Invalid Referrer ID",
        uniqueNumber: "0",
      }));

      localStorage.setItem("uniqnumber", "0");
      return false;
    }
  };

  const handlechange = (event) => {
    const { name, value } = event.target;
    setError("");
    setRegistrationField((prev) => ({
      ...prev,
      [name]: value,
      [`${name}error`]: "",
    }));
  };

  const setwhatsappotphandler = (OTP) => {
    const output = String(OTP.join(""));

    setRegistrationField({
      ...registrationField,
      mobileOTPNew: output,
    });
  };

  const handleKeyPressNumber = (event) => {
    const inputChar = event.key;
    const allowedKeys = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Enter"];
    if (!/^[0-9]$/.test(inputChar) && !allowedKeys.includes(inputChar)) {
      event.preventDefault();
    }
  };

  // Google Sign-Up Integration (ported from Signup.jsx)
  const handleGoogleSuccess = async (tokenResponse) => {
    setGoogleLoading(true);
    setError("");
    try {
      const res = await axios.post(
        `${API_USER_URL}checkGoogleEmail`,
        { accessToken: tokenResponse.access_token },
        { headers: { "Content-Type": "application/json" } }
      );
      const { phoneNumberRequiredOrNot: status, signInUrl } = res.data;

      if (status === "NOT_FOUND") {
        // New user - Google verified email
        const gEmail = signInUrl || "";
        const gName = res.data?.googleName || "";
        setGoogleToken(tokenResponse.access_token);
        setGoogleEmail(gEmail);
        setGoogleName(gName);

        // Pre-fill name and email in registrationField
        setRegistrationField((prev) => ({
          ...prev,
          email: gEmail,
          pancard: prev.pancard || gName,
        }));

        // Check if a valid 10-digit mobile number is already typed in form
        const currentMobile = registrationField.moblie ? String(registrationField.moblie).trim() : "";
        if (/^\d{10}$/.test(currentMobile)) {
          setGrMobile(currentMobile);
          await sendGoogleRegMobileOtp(currentMobile);
        } else {
          setGoogleStage("mobile");
        }
      } else if (status === "LINKED" || status === "FOUND" || status === "STEP2_PENDING") {
        // Already registered on OxyLoans
        Swal.fire({
          title: "Already Registered",
          html: `<p><strong>${signInUrl || "This Google account"}</strong> already has an OxyLoans account.</p><p style="color:#64748b;font-size:13.5px;margin-top:8px;">Please log in with OTP to access your account.</p>`,
          icon: "info",
          showCancelButton: true,
          confirmButtonColor: "#2563eb",
          confirmButtonText: "Go to Login",
          cancelButtonText: "Cancel",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate("/loginotp");
          }
        });
      } else {
        toastrWarning("Unexpected response from Google verification. Please try again.");
      }
    } catch (e) {
      const msg = e?.response?.data?.errorMessage || "Google sign-up failed. Please try again.";
      setError(msg);
      toastrWarning(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toastrWarning("Google sign-in was cancelled or failed."),
  });

  const sendGoogleRegMobileOtp = async (mobileToUse) => {
    const mob = mobileToUse || grMobile;
    if (!/^\d{10}$/.test(mob)) {
      setGrMobileError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setGrLoading(true);
    setGrMobileError("");
    try {
      const res = await axios.post(`${API_USER_URL}sendGoogleRegMobileOtp`, { mobileNumber: mob });
      const status = res.data?.phoneNumberRequiredOrNot;
      if (status === "OTP_SENT") {
        setGoogleStage("otp");
        setGrResendTimer(30);
        toastrSuccess("OTP sent to " + mob);
      } else if (status === "ALREADY_REGISTERED") {
        setGrMobileError("This mobile number is already registered. Please login instead.");
        toastrWarning("This mobile number is already registered. Please login instead.");
      } else {
        const msg = res.data?.errorMessage || "Could not send OTP. Please try again.";
        setGrMobileError(msg);
        toastrWarning(msg);
      }
    } catch (e) {
      const msg = e?.response?.data?.errorMessage || "Failed to send OTP. Please try again.";
      setGrMobileError(msg);
      toastrWarning(msg);
    } finally {
      setGrLoading(false);
    }
  };

  const verifyGoogleRegMobileOtp = async () => {
    if (!grOtp || grOtp.trim().length < 4) {
      setGrOtpError("Please enter the OTP.");
      return;
    }
    setGrLoading(true);
    setGrOtpError("");
    try {
      const verifyRes = await axios.post(`${API_USER_URL}verifyGoogleRegMobileOtp`, {
        mobileNumber: grMobile,
        mobileOtp: grOtp.trim(),
        googleAccessToken: googleToken,
      });
      if (!verifyRes.data?.valid) {
        setGrOtpError("Invalid OTP. Please try again.");
        toastrWarning("Invalid OTP. Please try again.");
        return;
      }
      // Successfully verified Google + Mobile
      setIsGrOtpVerifying(true);
      setTimeout(() => {
        setIsGrOtpVerifying(false);
        const prefill = {
          email: googleEmail,
          mobile: grMobile,
          name: googleName,
          emailVerified: true,
          role: "LENDER",
        };
        sessionStorage.setItem("gmail_prefill", JSON.stringify(prefill));
        setGmailPrefill(prefill);
        setRegistrationField((prev) => ({
          ...prev,
          email: googleEmail,
          moblie: grMobile,
          pancard: prev.pancard || googleName,
        }));
        setGoogleStage(null);
        toastrSuccess("Google account and Mobile verified!");
      }, 2200);
    } catch (e) {
      const msg = e?.response?.data?.errorMessage || "Failed to verify OTP. Please try again.";
      setGrOtpError(msg);
      toastrWarning(msg);
    } finally {
      setGrLoading(false);
    }
  };

  const handleCancelGoogleFlow = () => {
    setGoogleStage(null);
    setGoogleToken(null);
    setGoogleEmail("");
    setGoogleName("");
    setGrMobile("");
    setGrMobileError("");
    setGrOtp("");
    setGrOtpError("");
    setGmailPrefill(null);
    sessionStorage.removeItem("gmail_prefill");
    setRegistrationField((prev) => ({
      ...prev,
      email: "",
      moblie: "",
    }));
  };

  const handleLenderRegister = async () => {
    // Validate name
    if (!registrationField.pancard || registrationField.pancard.trim().length < 2) {
      setRegistrationField((prev) => ({
        ...prev,
        pancarderror: !registrationField.pancard ? "Please enter the Name" : "Name must be at least 2 characters",
      }));
      toastrWarning("Please enter your name as per PAN card");
      return;
    }

    if (/\d/.test(registrationField.pancard)) {
      setRegistrationField((prev) => ({ ...prev, pancarderror: "Enter characters only!" }));
      toastrWarning("Name must contain characters only");
      return;
    }

    // Referrer ID validation if entered
    if (
      registrationField.referrerId &&
      String(registrationField.referrerId).trim() !== "" &&
      String(registrationField.referrerId).trim() !== "0"
    ) {
      const isValidRef = await validateReferrerId(registrationField.referrerId);
      if (!isValidRef) {
        const refErrMsg = registrationField.referrerIderror || "Invalid Referrer ID";
        setError(refErrMsg);
        toastrWarning(refErrMsg);
        return;
      }
    }

    // Gmail one-shot registration — email + mobile already verified, skip OTP
    if (gmailPrefill) {
      try {
        const res = await axios.post(API_USER_URL + "registerLenderWithGoogle", {
          mobileNumber: gmailPrefill.mobile,
          nameAsPan: registrationField.pancard,
          password: registrationField.password || "",
          referrerId: registrationField.referrerId || "",
          userType: "LENDER",
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        });
        // Save session and redirect to step 2 (DOB / WhatsApp / address)
        const token = res.headers?.accesstoken || res.headers?.accessToken || res.headers?.["access-token"];
        if (token && res.data?.id) {
          sessionStorage.setItem("accessToken", token);
          sessionStorage.setItem("userId", String(res.data.id));
          sessionStorage.setItem("tokenTime", res.data.tokenGeneratedTime || "");
          sessionStorage.setItem("email", res.data.email || "");
          localStorage.setItem("primaryType", res.data.primaryType || "");
          localStorage.setItem("id", String(res.data.id));
          sessionStorage.removeItem("gmail_prefill");
          navigate("/register_active_proceed?id=" + res.data.id + "&time=" + Date.now());
        } else {
          toastrWarning("Registration succeeded but login failed. Please login.");
          navigate("/loginotp");
        }
      } catch (err) {
        const errMsg = err?.response?.data?.errorMessage || "Registration failed. Please try again.";
        setError(errMsg);
        toastrWarning(errMsg);
      }
      return;
    }

    // Normal OTP registration flow
    setRegistrationField((prevState) => ({
      ...prevState,
      emailerror: registrationField.email === "" ? "Please enter the Email" : "",
      pancarderror: registrationField.pancard === "" ? "Please enter the Name" : "",
      moblieerror: registrationField.moblie === "" ? "Please enter the Mobile Number" : "",
      passworderror: registrationField.password === "" ? "Please enter the Password" : "",
    }));

    const validationError = api.validateRegisterInput(
      registrationField.email,
      registrationField.password,
      registrationField.moblie
    );

    if (!registrationField.pancard || registrationField.pancard.trim().length < 2) {
      setRegistrationField((prev) => ({
        ...prev,
        pancarderror: !registrationField.pancard ? "Please enter the Name" : "Name must be at least 2 characters",
      }));
      return;
    }

    if (validationError) {
      setError(validationError);
      toastrWarning(validationError);
      return;
    }

    if (
      registrationField.referrerId &&
      String(registrationField.referrerId).trim() !== "" &&
      String(registrationField.referrerId).trim() !== "0"
    ) {
      const isValidRef = await validateReferrerId(registrationField.referrerId);
      if (!isValidRef) {
        const refErrMsg = registrationField.referrerIderror || "Invalid Referrer ID";
        setError(refErrMsg);
        toastrWarning(refErrMsg);
        return;
      }
    }

    if (
      registrationField.emailerror === "" &&
      registrationField.pancarderror === "" &&
      registrationField.moblieerror === "" &&
      registrationField.passworderror === "" &&
      registrationField.referrerIderror === ""
    ) {
      try {
        const RegisterResponse = await api.RegisterUser(
          registrationField.moblie
        );
        localStorage.setItem("seesion", RegisterResponse);
        if (registrationField.referrerId !== 0 && registrationField.referrerId) {
          const finalUniq = registrationField.uniqueNumber || registrationField.referrerId;
          localStorage.setItem("uniqnumber", finalUniq);
        }
        setfield(false);
        setError(null);
      } catch (error) {
        console.error("Error:", error.response?.data?.errorMessage);
        const errData = error.response?.data;
        if (errData && (errData.errorCode === "113" || String(errData.errorCode) === "113")) {
          const errMsg = errData.errorMessage || "";
          const idMatch = errMsg.match(/id=(\d+)/);
          const userId = idMatch ? idMatch[1] : null;
          const emailMatch = errMsg.match(/email=([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          const email = emailMatch ? emailMatch[1] : registrationField.email;

          Swal.fire({
            title: "Email Verification Required",
            html: `Your email <strong>${email}</strong> has not been verified yet.<br/><br/>Would you like us to resend the activation link?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, resend link",
            cancelButtonText: "Cancel",
          }).then((result) => {
            if (result.isConfirmed && userId) {
              axios
                .post(API_USER_URL + "sendingEmailActivationLink", { userId })
                .then(() => Swal.fire("Sent!", "Email activation link has been resent successfully.", "success"))
                .catch((err) => Swal.fire("Error!", err.response?.data?.errorMessage || "Failed to resend.", "error"));
            }
          });
        } else {
          const errMsg = errData?.errorMessage || "Registration failed";
          setError(errMsg);
          toastrWarning(errMsg);
        }
      }
    }
  };

  const Otpverify = async () => {
    try {
      let session = localStorage.getItem("seesion");

      if (registrationField.mobileOTPNew.length === 6) {
        const response = await api.vaildateotp(
          registrationField.email,
          registrationField.moblie,
          registrationField.mobileOTPNew,
          registrationField.pancard,
          registrationField.password,
          session,
          registrationField.referrerId,
          "Lender",
          userLocation.latitude,
          userLocation.longitude,
          trackingId,
          relationshipId
        );
        setIsOtpVerifying(true);
        localStorage.setItem("id", response.responseData.userId);
        const mill1 = new Date().getTime();
        localStorage.setItem("timemilll", mill1);
        setTimeout(() => {
          setIsOtpVerifying(false);
          setfield(false);
          setsubmitotp(true);
        }, 2200);
      } else {
        setError("Please enter a valid OTP");
        toastrWarning("Please enter a valid OTP");
      }
    } catch (error) {
      console.log("enter error");
      console.error(
        "Error:",
        error.response ? error.response.data.errorMessage : error.message
      );
      const errMsg = error.response
        ? error.response.data.errorMessage
        : "An error occurred during OTP validation";
      setError(errMsg);
      toastrWarning(errMsg);
    }
  };

  const handleSwitchToBorrower = (e) => {
    e.preventDefault();
    if (gmailPrefill) {
      sessionStorage.setItem("gmail_prefill", JSON.stringify({ ...gmailPrefill, role: "BORROWER" }));
    }
    navigate("/borrower_register");
  };

  useEffect(() => {
    if (/\d/.test(registrationField.pancard)) {
      setRegistrationField((prev) => ({ ...prev, pancarderror: "Enter characters only!" }));
    } else {
      setRegistrationField((prev) => ({ ...prev, pancarderror: "" }));
    }
  }, [registrationField.pancard]);

  useEffect(() => {
    clearLastVisitedUrls();
    const searchParams = new URLSearchParams(window.location.search);
    const refParam = searchParams.get("ref");
    const trackingIdParam = searchParams.get("trackingId");
    const relationshipIdParam = searchParams.get("relationshipId");
    if (trackingIdParam) localStorage.setItem("trackingId", trackingIdParam);
    if (relationshipIdParam) localStorage.setItem("relationshipId", relationshipIdParam);
    if (trackingIdParam) setTrackingId(trackingIdParam);
    if (relationshipIdParam) setRelationshipId(relationshipIdParam);

    if (refParam) {
      setRegistrationField((prev) => ({
        ...prev,
        referrerId: refParam,
      }));
      validateReferrerId(refParam);
    } else {
      setRegistrationField((prev) => ({
        ...prev,
        referrerId: "",
      }));
      localStorage.setItem("uniqnumber", "0");
    }
  }, []);

  return (
    <div className="lender-register-page">
      <div className="lender-register-shell">
        {/* LEFT HERO PANEL */}
        <div className="lender-hero-panel">
          <img
            className="lender-hero-img-full"
            src={lenderRegisterHero}
            alt="Quick Loans - The Right Way"
          />
          <div className="hero-animated-overlay">
            <div className="hero-light-sweep" />
            <div className="hero-coin-glow left-coin" />
            <div className="hero-coin-glow right-coin" />
            <div className="hero-sparkle sp-1" />
            <div className="hero-sparkle sp-2" />
            <div className="hero-sparkle sp-3" />
            <div className="hero-card-glow" />
            <div className="hero-bottom-glass-glow" />
          </div>
        </div>

        {/* RIGHT REGISTRATION FORM PANEL */}
        <div className="lender-form-panel">
          <div className="lender-form-wrap">
            <div className="reg-header-row">
              <div className="reg-title-wrap">
                <h2 className="reg-title">Register as a Lender</h2>
                <p className="reg-subtitle">
                  Create your account and start earning attractive returns through our lending platform.
                </p>
              </div>
              <div className="reg-shield-badge-wrap">
                <img
                  src={lenderShieldBadge}
                  alt="Verified Shield"
                  className="reg-shield-img"
                />
              </div>
            </div>

            {googleStage === "mobile" ? (
              <div className="reg-google-flow-box">
                <div className="reg-gmail-badge">
                  <span className="reg-gmail-badge-icon">
                    <GoogleIcon />
                  </span>
                  <div className="reg-gmail-badge-content">
                    <span className="reg-gmail-badge-title">Google Account Verified</span>
                    <span className="reg-gmail-badge-email">{googleEmail}</span>
                  </div>
                </div>

                <h3 className="reg-google-step-title">Verify Mobile Number</h3>
                <p className="reg-google-step-desc">
                  Please enter your 10-digit mobile number to link with your Google account.
                </p>

                <div
                  className={`reg-input-shell ${
                    focusedField === "grMobile" ? "focused" : ""
                  } ${grMobileError ? "has-error" : ""}`}
                >
                  <span className="reg-field-icon">
                    <FeatherIcon icon="phone" size={17} />
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit mobile number *"
                    value={grMobile}
                    onFocus={() => setFocusedField("grMobile")}
                    onBlur={() => setFocusedField("")}
                    onChange={(e) => {
                      setGrMobile(e.target.value.replace(/\D/g, ""));
                      setGrMobileError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendGoogleRegMobileOtp(grMobile);
                    }}
                    className="reg-field-input"
                    autoFocus
                  />
                </div>
                {grMobileError && (
                  <div className="reg-field-error">
                    <FeatherIcon icon="alert-circle" size={13} />
                    <span>{grMobileError}</span>
                  </div>
                )}

                <button
                  type="button"
                  className="reg-next-btn"
                  disabled={grLoading}
                  onClick={() => sendGoogleRegMobileOtp(grMobile)}
                >
                  <span>{grLoading ? "Sending OTP..." : "Send Verification OTP"}</span>
                  <span className="reg-btn-arrow">→</span>
                </button>

                <button
                  type="button"
                  className="reg-back-text-btn"
                  onClick={handleCancelGoogleFlow}
                >
                  ← Cancel and use standard registration
                </button>
              </div>
            ) : googleStage === "otp" ? (
              isGrOtpVerifying ? (
                <div className="loginotp-success-state" style={{ minHeight: "260px", justifyContent: "center" }}>
                  <div className="loginotp-success-icon-wrap">
                    <FeatherIcon icon="check" size={32} />
                  </div>
                  <h2 className="loginotp-success-title">Verified Successfully!</h2>
                  <p className="loginotp-success-desc">
                    Proceeding to registration...
                  </p>
                  <div className="loginotp-redirect-progress-bar">
                    <div className="loginotp-redirect-progress-fill" />
                  </div>
                </div>
              ) : (
                <div className="reg-google-flow-box">
                  <div
                    className="reg-otp-icon-circle"
                    style={{ width: "52px", height: "52px", margin: "0 auto 10px", fontSize: "20px" }}
                  >
                    <FeatherIcon icon="shield" size={24} />
                  </div>

                  <h3 className="reg-google-step-title" style={{ textAlign: "center" }}>
                    Enter Verification Code
                  </h3>
                  <p className="reg-google-step-desc" style={{ textAlign: "center" }}>
                    OTP sent to <strong>+91 {grMobile}</strong>
                  </p>

                  <div
                    className={`reg-input-shell ${
                      focusedField === "grOtp" ? "focused" : ""
                    } ${grOtpError ? "has-error" : ""}`}
                  >
                    <input
                      type="tel"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={grOtp}
                      onFocus={() => setFocusedField("grOtp")}
                      onBlur={() => setFocusedField("")}
                      onChange={(e) => {
                        setGrOtp(e.target.value.replace(/\D/g, ""));
                        setGrOtpError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") verifyGoogleRegMobileOtp();
                      }}
                      className="reg-field-input"
                      style={{ textAlign: "center", letterSpacing: "6px", fontSize: "18px", fontWeight: "700" }}
                      autoFocus
                    />
                  </div>
                  {grOtpError && (
                    <div className="reg-field-error" style={{ justifyContent: "center" }}>
                      <FeatherIcon icon="alert-circle" size={13} />
                      <span>{grOtpError}</span>
                    </div>
                  )}

                  <div className="reg-resend-box" style={{ textAlign: "center", margin: "10px 0" }}>
                    {grResendTimer > 0 ? (
                      <span style={{ color: "#64748b", fontSize: "12px" }}>
                        Resend OTP in <strong>{grResendTimer}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="reg-resend-link"
                        onClick={() => sendGoogleRegMobileOtp(grMobile)}
                        disabled={grLoading}
                      >
                        {grLoading ? "Sending..." : "Resend OTP"}
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    className="reg-next-btn"
                    disabled={grLoading}
                    onClick={verifyGoogleRegMobileOtp}
                    style={{ marginTop: "4px" }}
                  >
                    <span>{grLoading ? "Verifying..." : "Verify & Continue"}</span>
                    <span className="reg-btn-arrow">→</span>
                  </button>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "14px" }}>
                    <button
                      type="button"
                      className="reg-text-link-btn"
                      onClick={() => {
                        setGoogleStage("mobile");
                        setGrOtp("");
                        setGrOtpError("");
                      }}
                    >
                      Change mobile
                    </button>
                    <button
                      type="button"
                      className="reg-text-link-btn"
                      onClick={handleCancelGoogleFlow}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )
            ) : field ? (
              <>
                {/* Google Continue Button (only show if not already verified with Gmail) */}
                {!gmailPrefill ? (
                  <>
                    <button
                      className="reg-google-btn"
                      type="button"
                      disabled={googleLoading}
                      onClick={() => googleLogin()}
                    >
                      <span className="reg-google-icon-box">
                        <GoogleIcon />
                      </span>
                      <span className="reg-google-text">
                        {googleLoading ? "Connecting to Google..." : "Continue with Google"}
                      </span>
                      <span className="reg-google-arrow">→</span>
                    </button>

                    {/* OR Divider */}
                    <div className="reg-divider">
                      <span>OR</span>
                    </div>
                  </>
                ) : (
                  <div className="reg-gmail-notice" style={{ marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <FeatherIcon icon="check-circle" size={16} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "12px" }}>Google &amp; Mobile Verified</div>
                          <div style={{ fontSize: "11px", opacity: 0.85 }}>{gmailPrefill.email} • {gmailPrefill.mobile}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCancelGoogleFlow}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#065f46",
                          textDecoration: "underline",
                          fontSize: "11px",
                          cursor: "pointer",
                          padding: 0
                        }}
                        title="Clear and switch to standard registration"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}

                {/* Form Fields Stack */}
                <div className="reg-field-stack">
                  {/* Name as per PAN card */}
                  <div
                    className={`reg-input-shell ${
                      focusedField === "pancard" ? "focused" : ""
                    } ${registrationField.pancarderror ? "has-error" : ""}`}
                  >
                    <span className="reg-field-icon">
                      <FeatherIcon icon="user" size={17} />
                    </span>
                    <input
                      type="text"
                      name="pancard"
                      className="reg-field-input"
                      placeholder="Name as per PAN card *"
                      maxLength={100}
                      value={registrationField.pancard}
                      onFocus={() => setFocusedField("pancard")}
                      onBlur={() => setFocusedField("")}
                      onChange={handlechange}
                    />
                    <div className="reg-field-info-wrap">
                      <span className="reg-info-icon">
                        <FeatherIcon icon="info" size={16} />
                      </span>
                      <div className="reg-tooltip">
                        Please enter your full name exactly as printed on your PAN card
                      </div>
                    </div>
                  </div>
                  {registrationField.pancarderror && (
                    <div className="reg-field-error">
                      <FeatherIcon icon="alert-circle" size={13} />
                      <span>{registrationField.pancarderror}</span>
                    </div>
                  )}

                  {gmailPrefill && (
                    <div className="reg-gmail-notice">
                      <FeatherIcon icon="check-circle" size={15} />
                      <span>Gmail verified — email and mobile are pre-filled and locked.</span>
                    </div>
                  )}

                  {/* Email */}
                  <div
                    className={`reg-input-shell ${
                      focusedField === "email" ? "focused" : ""
                    } ${registrationField.emailerror ? "has-error" : ""} ${
                      gmailPrefill ? "disabled" : ""
                    }`}
                  >
                    <span className="reg-field-icon">
                      <FeatherIcon icon="mail" size={17} />
                    </span>
                    <input
                      type="email"
                      name="email"
                      className="reg-field-input"
                      placeholder="Email *"
                      maxLength={100}
                      value={registrationField.email}
                      readOnly={!!gmailPrefill}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField("")}
                      onChange={gmailPrefill ? () => {} : handlechange}
                    />
                  </div>
                  {registrationField.emailerror && (
                    <div className="reg-field-error">
                      <FeatherIcon icon="alert-circle" size={13} />
                      <span>{registrationField.emailerror}</span>
                    </div>
                  )}

                  {/* Password */}
                  <div
                    className={`reg-input-shell ${
                      focusedField === "password" ? "focused" : ""
                    } ${registrationField.passworderror ? "has-error" : ""}`}
                  >
                    <span className="reg-field-icon">
                      <FeatherIcon icon="lock" size={17} />
                    </span>
                    <input
                      ref={inputRef}
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="reg-field-input"
                      placeholder={gmailPrefill ? "Password (optional)" : "Password *"}
                      maxLength={15}
                      value={registrationField.password}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField("")}
                      onChange={handlechange}
                    />
                    <button
                      type="button"
                      className="reg-pw-toggle-btn"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <FeatherIcon icon={showPassword ? "eye" : "eye-off"} size={17} />
                    </button>
                  </div>
                  {registrationField.passworderror && (
                    <div className="reg-field-error">
                      <FeatherIcon icon="alert-circle" size={13} />
                      <span>{registrationField.passworderror}</span>
                    </div>
                  )}

                  {/* Referrer Hint */}
                  <div className="reg-referrer-hint">
                    If you are referred by an existing lender, please enter his/her referrer id
                  </div>

                  {/* Referrer ID */}
                  <div
                    className={`reg-input-shell ${
                      focusedField === "referrerId" ? "focused" : ""
                    } ${registrationField.referrerIderror ? "has-error" : ""}`}
                  >
                    <span className="reg-field-icon">
                      <FeatherIcon icon="users" size={17} />
                    </span>
                    <input
                      type="text"
                      name="referrerId"
                      className="reg-field-input"
                      placeholder="Enter the referrer ID (Ex : LR100001)"
                      value={registrationField.referrerId}
                      onFocus={() => setFocusedField("referrerId")}
                      onBlur={(e) => {
                        setFocusedField("");
                        validateReferrerId(e.target.value);
                      }}
                      onChange={handlechange}
                    />
                  </div>
                  {registrationField.referrerIderror && (
                    <div className="reg-field-error">
                      <FeatherIcon icon="alert-circle" size={13} />
                      <span>{registrationField.referrerIderror}</span>
                    </div>
                  )}

                  {/* Mobile Number */}
                  <div
                    className={`reg-input-shell ${
                      focusedField === "moblie" ? "focused" : ""
                    } ${registrationField.moblieerror ? "has-error" : ""} ${
                      gmailPrefill ? "disabled" : ""
                    }`}
                  >
                    <span className="reg-field-icon">
                      <FeatherIcon icon="phone" size={17} />
                    </span>
                    <input
                      type="tel"
                      name="moblie"
                      className="reg-field-input"
                      placeholder="Enter mobile Number *"
                      maxLength={10}
                      value={registrationField.moblie}
                      readOnly={!!gmailPrefill}
                      onFocus={() => setFocusedField("moblie")}
                      onBlur={() => setFocusedField("")}
                      onKeyDown={gmailPrefill ? undefined : handleKeyPressNumber}
                      onChange={gmailPrefill ? () => {} : handlechange}
                    />
                  </div>
                  {registrationField.moblieerror && (
                    <div className="reg-field-error">
                      <FeatherIcon icon="alert-circle" size={13} />
                      <span>{registrationField.moblieerror}</span>
                    </div>
                  )}
                </div>

                {/* Global Error Banner */}
                {error && (
                  <div className="reg-global-error">
                    <FeatherIcon icon="alert-triangle" size={15} />
                    <span>{error}</span>
                  </div>
                )}

                {/* Next Step CTA */}
                <button
                  className="reg-next-btn"
                  type="button"
                  onClick={handleLenderRegister}
                >
                  <span>{gmailPrefill ? "Complete Registration" : "Next Step"}</span>
                  <span className="reg-btn-arrow">→</span>
                </button>

                {/* Footnote: Already Registered? Login */}
                <div className="reg-footnote">
                  Already Registered?{" "}
                  <Link to="/" className="reg-link">
                    Login
                  </Link>
                </div>

                {/* Small OR Divider */}
                <div className="reg-divider reg-small-divider">
                  <span>OR</span>
                </div>

                {/* Footnote: Register as a Borrower */}
                <div className="reg-borrower-row">
                  Looking for a loan? Register as a{" "}
                  <a href="/borrower_register" onClick={handleSwitchToBorrower} className="reg-link">
                    Borrower
                  </a>
                </div>
              </>
            ) : (
              <>
                {/* OTP Verification / Success State */}
                {isOtpVerifying ? (
                  <div className="loginotp-success-state" style={{ minHeight: "360px", justifyContent: "center" }}>
                    <div className="loginotp-success-icon-wrap">
                      <FeatherIcon icon="check" size={32} />
                    </div>
                    <h2 className="loginotp-success-title">OTP Verified Successfully!</h2>
                    <p className="loginotp-success-desc">
                      Finalizing your Lender registration...
                    </p>
                    <div className="loginotp-redirect-progress-bar">
                      <div className="loginotp-redirect-progress-fill" />
                    </div>
                  </div>
                ) : submitotp ? (
                  <div className="reg-success-container">
                    <div className="reg-success-icon">
                      <FeatherIcon icon="check" size={38} />
                    </div>
                    <h2 className="reg-success-title">
                      You are one step away from completing registration.
                    </h2>
                    <p className="reg-success-desc">
                      An activation link has been sent to your registered e-mail. Please check your inbox and activate your OxyLoans account to start Lending.
                    </p>
                    <Link to="/" className="reg-next-btn" style={{ textDecoration: "none" }}>
                      <span>Back to Login</span>
                      <span className="reg-btn-arrow">→</span>
                    </Link>
                  </div>
                ) : (
                  <div className="reg-otp-container">
                    <div className="reg-otp-icon-circle">
                      <FeatherIcon icon="shield" size={30} />
                    </div>
                    <h3 className="reg-otp-title">Enhanced Security Verification</h3>
                    <p className="reg-otp-subtitle">
                      Enter the 6-digit verification code sent to your mobile number.
                    </p>

                    <div className="reg-otp-inputs">
                      <OtpInput data={6} setwhatsappotphandler={setwhatsappotphandler} />
                    </div>

                    <div className="reg-resend-box">
                      {resendTimer > 0 ? (
                        <span style={{ color: "#64748b" }}>
                          Resend OTP in <strong>{resendTimer}s</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="reg-resend-link"
                          onClick={handleResendOtp}
                          disabled={loadingResend}
                        >
                          {loadingResend ? "Sending..." : "Resend OTP"}
                        </button>
                      )}
                    </div>

                    {error && (
                      <div className="reg-global-error" style={{ marginBottom: "12px", width: "100%" }}>
                        <FeatherIcon icon="alert-triangle" size={15} />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      className="reg-next-btn"
                      type="button"
                      onClick={() => Otpverify()}
                      style={{ marginTop: 0 }}
                    >
                      <span>Submit OTP</span>
                      <span className="reg-btn-arrow">→</span>
                    </button>

                    <div className="reg-footnote" style={{ marginTop: "16px" }}>
                      Already Registered?{" "}
                      <Link to="/" className="reg-link">
                        Login
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
