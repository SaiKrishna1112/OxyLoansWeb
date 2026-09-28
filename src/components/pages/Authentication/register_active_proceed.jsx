import React, { useEffect, useState } from "react";
import * as api from "./api";
import { registerActiveHero } from "../../imagepath";
import "./loginotp.css";
import { useNavigate } from "react-router-dom";
import { toastrWarning } from "../Base UI Elements/Toast";
import { registersuccess } from "../Base UI Elements/SweetAlert";
import { clearLastVisitedUrls } from "../../../utils/redirectUtils";
import FeatherIcon from "feather-icons-react";

const Register_active_proceed = () => {
  const history = useNavigate();

  const [date1, setdate1] = useState("");
  const [id, setid] = useState("318");
  const [time, settime] = useState("");
  const [data, setdata] = useState({
    pannumber: "",
    address: "",
    date: "",
    doberror: "",
    panerror: "",
    addresserror: "",
  });
  const [isloading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    clearLastVisitedUrls();
    const urlemail = new URLSearchParams(window.location.search);
    const idParam = urlemail.get("id") || localStorage.getItem("id");
    const timeParam = urlemail.get("time") || localStorage.getItem("time");
    if (idParam) setid(idParam);
    if (timeParam) settime(timeParam);
  }, []);

  const today = new Date();
  today.setFullYear(today.getFullYear() - 18);
  const minDate = today.toISOString().split("T")[0];

  useEffect(() => {
    if (data.date) {
      const parts = data.date.split("-");
      if (parts.length === 3) {
        const [year, month, day] = parts;
        setdate1(`${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`);
      }
    } else {
      setdate1("");
    }
  }, [data.date]);

  const handleKeyPressPannumber = (event) => {
    const inputChar = event.key;
    const regex = /^[A-Za-z0-9]*$/;
    if (!regex.test(inputChar) && inputChar !== "Backspace") {
      event.preventDefault();
    }
  };

  const handlechanges = (event) => {
    const { name, value } = event.target;

    if (name === "pannumber") {
      const upperValue = value.toUpperCase().slice(0, 10);
      const cleanedValue = upperValue.replace(/[^A-Z0-9]/g, "");
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

      let panerror = "";
      if (cleanedValue.length === 10 && !panRegex.test(cleanedValue)) {
        panerror = "Invalid PAN format. Expected: ABCDE1234F";
      }

      setdata((prev) => ({
        ...prev,
        pannumber: cleanedValue,
        panerror: panerror,
      }));
      return;
    }

    setdata((prev) => ({
      ...prev,
      [name]: value,
      [`${name}error`]: "",
      ...(name === "date" ? { doberror: "" } : {}),
    }));
  };

  const handlesubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    let hasError = false;
    const newErrors = {
      doberror: "",
      panerror: "",
      addresserror: "",
    };

    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!data.pannumber || data.pannumber.trim() === "") {
      newErrors.panerror = "Enter PAN Number";
      hasError = true;
    } else if (data.pannumber.length < 10 || !panRegex.test(data.pannumber)) {
      newErrors.panerror = "Invalid PAN format. Expected: ABCDE1234F";
      hasError = true;
    }

    if (!data.date || data.date.trim() === "") {
      newErrors.doberror = "Enter Date of Birth";
      hasError = true;
    }

    if (!data.address || data.address.trim() === "") {
      newErrors.addresserror = "Enter your address";
      hasError = true;
    }

    if (hasError) {
      setdata((prev) => ({
        ...prev,
        ...newErrors,
      }));
      if (newErrors.panerror) toastrWarning(newErrors.panerror);
      else if (newErrors.doberror) toastrWarning(newErrors.doberror);
      else if (newErrors.addresserror) toastrWarning(newErrors.addresserror);
      return;
    }

    // Determine formatted date (DD/MM/YYYY)
    let formattedDate = date1;
    if (!formattedDate && data.date) {
      const parts = data.date.split("-");
      if (parts.length === 3) {
        formattedDate = `${parts[2].padStart(2, "0")}/${parts[1].padStart(2, "0")}/${parts[0]}`;
      }
    }

    setLoading(true);
    setCurrentStep(2); // Step 2: Verification

    try {
      await api.verifypannumber(
        data.pannumber,
        data.address,
        time,
        id,
        formattedDate
      );

      setCurrentStep(3); // Step 3: Complete
      setIsVerified(true);

      setTimeout(() => {
        registersuccess("Registration successfully completed");
        history("/");
        setLoading(false);
      }, 2200);
    } catch (error) {
      setCurrentStep(1);
      setLoading(false);
      const errMsg =
        error?.response?.data?.errorMessage ||
        "An error occurred during registration. Please check your details.";
      toastrWarning(errMsg);
    }
  };

  return (
    <div className="loginotp-page">
      <div className="loginotp-two-cards-wrap reg-active-two-cards-wrap">
        {/* Left Card - Hero Artwork with Dynamic Micro-Animations */}
        <div className="loginotp-left-card reg-active-left-card">
          <img
            src={registerActiveHero}
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

        {/* Right Card - Registration Form */}
        <div className="loginotp-right-card reg-active-right-card">
          {isVerified ? (
            /* Verified Successfully View with Animation */
            <div className="loginotp-success-state">
              <div className="loginotp-success-icon-wrap">
                <FeatherIcon icon="check" size={32} />
              </div>
              <h2 className="loginotp-success-title">Verified Successfully!</h2>
              <p className="loginotp-success-desc">
                Registration completed successfully. Redirecting to login...
              </p>
              <div className="loginotp-redirect-progress-bar">
                <div className="loginotp-redirect-progress-fill" />
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="reg-active-header">
                <h1 className="reg-active-title">
                  Complete <span className="oxy-blue">Registration</span>
                </h1>
                <p className="reg-active-subtitle">
                  Please provide your details to complete your registration.
                </p>
              </div>

              {/* Stepper Component matching Figma/ChatGPT Design */}
              <div className="reg-active-stepper">
                <div className="reg-active-track">
                  <div
                    className="reg-active-track-fill"
                    style={{
                      width:
                        currentStep === 1
                          ? "0%"
                          : currentStep === 2
                          ? "50%"
                          : "100%",
                    }}
                  />
                </div>

                {/* Step 1: Basic Details */}
                <div
                  className={`reg-active-step-item ${
                    currentStep >= 1 ? "active" : ""
                  } ${currentStep > 1 ? "completed" : ""}`}
                >
                  <div className="reg-active-step-circle">
                    {currentStep > 1 ? (
                      <FeatherIcon icon="check" size={14} />
                    ) : (
                      "1"
                    )}
                  </div>
                  <span className="reg-active-step-label">Basic Details</span>
                </div>

                {/* Step 2: Verification */}
                <div
                  className={`reg-active-step-item ${
                    currentStep >= 2 ? "active" : ""
                  } ${currentStep > 2 ? "completed" : ""}`}
                >
                  <div className="reg-active-step-circle">
                    {currentStep > 2 ? (
                      <FeatherIcon icon="check" size={14} />
                    ) : (
                      "2"
                    )}
                  </div>
                  <span className="reg-active-step-label">Verification</span>
                </div>

                {/* Step 3: Complete */}
                <div
                  className={`reg-active-step-item ${
                    currentStep >= 3 ? "active" : ""
                  } ${currentStep === 3 ? "completed" : ""}`}
                >
                  <div className="reg-active-step-circle">
                    {currentStep === 3 ? (
                      <FeatherIcon icon="check" size={14} />
                    ) : (
                      "3"
                    )}
                  </div>
                  <span className="reg-active-step-label">Complete</span>
                </div>
              </div>

              {/* Form Fields */}
              <form className="reg-active-form" onSubmit={handlesubmit}>
                {/* 1. PAN Number */}
                <div className="reg-active-field-group">
                  <label className="reg-active-label">
                    Pan Number <span className="reg-active-required">*</span>
                  </label>
                  <div
                    className={`reg-active-input-shell ${
                      data.panerror ? "has-error" : ""
                    }`}
                  >
                    <span className="reg-active-field-icon">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <circle cx="9" cy="10" r="2" />
                        <path d="M15 8h2" />
                        <path d="M15 12h2" />
                        <path d="M7 16h10" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      className="reg-active-native-input"
                      placeholder="Enter PAN Number"
                      name="pannumber"
                      value={data.pannumber}
                      maxLength={10}
                      onKeyPress={handleKeyPressPannumber}
                      onChange={handlechanges}
                      autoComplete="off"
                    />
                  </div>
                  {data.panerror && (
                    <div className="reg-active-error-text">
                      <FeatherIcon icon="alert-circle" size={12} />
                      <span>{data.panerror}</span>
                    </div>
                  )}
                </div>

                {/* 2. Date of Birth */}
                <div className="reg-active-field-group">
                  <label className="reg-active-label">
                    Date of Birth <span className="reg-active-required">*</span>
                  </label>
                  <div
                    className={`reg-active-input-shell ${
                      data.doberror ? "has-error" : ""
                    }`}
                  >
                    <span className="reg-active-field-icon">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          x="3"
                          y="4"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </span>
                    <input
                      type="date"
                      className="reg-active-native-input reg-active-date-input"
                      name="date"
                      value={data.date}
                      onChange={handlechanges}
                      max={minDate}
                    />
                  </div>
                  {data.doberror && (
                    <div className="reg-active-error-text">
                      <FeatherIcon icon="alert-circle" size={12} />
                      <span>{data.doberror}</span>
                    </div>
                  )}
                </div>

                {/* 3. Address */}
                <div className="reg-active-field-group">
                  <label className="reg-active-label">
                    Address <span className="reg-active-required">*</span>
                  </label>
                  <div
                    className={`reg-active-textarea-shell ${
                      data.addresserror ? "has-error" : ""
                    }`}
                  >
                    <span className="reg-active-field-icon reg-active-textarea-icon">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </span>
                    <textarea
                      className="reg-active-native-textarea"
                      placeholder="Enter your complete address"
                      name="address"
                      value={data.address}
                      onChange={handlechanges}
                      rows={2}
                    />
                  </div>
                  {data.addresserror && (
                    <div className="reg-active-error-text">
                      <FeatherIcon icon="alert-circle" size={12} />
                      <span>{data.addresserror}</span>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="reg-active-submit-btn"
                  disabled={isloading}
                >
                  {isloading ? (
                    <div
                      className="spinner-border spinner-border-sm text-light"
                      role="status"
                    >
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <span>Submit</span>
                      <FeatherIcon icon="arrow-right" size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Security Footnote */}
              <div className="reg-active-security-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="11" fill="#10b981" />
                  <path
                    d="M7.5 12.5l3 3 6-6"
                    stroke="#ffffff"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Your information is safe and secure with us.</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register_active_proceed;
