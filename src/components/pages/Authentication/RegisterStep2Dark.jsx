import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "./api";
import { sendwhatappotp, verifywhatappotp } from "../../HttpRequest/beforelogin";
import { registerImage } from "../../imagepath";
import { toastrWarning, toastrSuccess } from "../Base UI Elements/Toast";
import { registersuccess } from "../Base UI Elements/SweetAlert";
import { clearLastVisitedUrls } from "../../../utils/redirectUtils";
import "./RegisterStep2Dark.css";

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const RegisterStep2Dark = () => {
  const history = useNavigate();
  const [id, setId] = useState("");
  const [time, setTime] = useState("");
  const [date1, setDate1] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    pannumber: "",
    address: "",
    date: "",
    whatsapp: "",
  });
  const [panError, setPanError] = useState("");
  const [panVerified, setPanVerified] = useState(false);

  const [wpStep, setWpStep] = useState("idle"); // idle | sending | otp | verifying | done | error
  const [wpOtp, setWpOtp] = useState("");
  const [wpSession, setWpSession] = useState(null);
  const wpOtpRef = useRef();

  useEffect(() => {
    clearLastVisitedUrls();
    const params = new URLSearchParams(window.location.search);
    setId(params.get("id") || "");
    setTime(params.get("time") || "");
  }, []);

  useEffect(() => {
    if (!form.date) return;
    const [y, m, d] = form.date.split("-");
    const dt = new Date(y, m - 1, d);
    setDate1(
      String(dt.getDate()).padStart(2, "0") + "/" +
      String(dt.getMonth() + 1).padStart(2, "0") + "/" +
      dt.getFullYear()
    );
  }, [form.date]);

  const maxDob = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split("T")[0];
  })();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "pannumber") {
      const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
      setForm((p) => ({ ...p, pannumber: clean }));
      if (clean.length === 10) {
        if (!PAN_REGEX.test(clean)) {
          setPanError("Invalid format — expected ABCDE1234F");
          setPanVerified(false);
        } else {
          setPanError("");
        }
      } else {
        setPanError("");
        setPanVerified(false);
      }
      return;
    }
    if (name === "whatsapp") {
      setWpStep("idle");
      setWpOtp("");
    }
    setForm((p) => ({ ...p, [name]: value }));
  };

  const sendWhatsAppOtp = async () => {
    const num = form.whatsapp.replace(/\D/g, "");
    if (num.length < 10) {
      toastrWarning("Enter a valid 10-digit WhatsApp number");
      return;
    }
    setWpStep("sending");
    try {
      const res = await sendwhatappotp("+" + (num.length === 10 ? "91" : "") + num);
      if (res?.data?.session || res?.response?.data?.session) {
        const session = res?.data?.session || res?.response?.data?.session;
        setWpSession(session);
        setWpStep("otp");
        setTimeout(() => wpOtpRef.current?.focus(), 100);
      } else {
        setWpStep("error");
        toastrWarning("Could not send OTP. Try again.");
      }
    } catch {
      setWpStep("error");
      toastrWarning("Could not send OTP. Check the number and try again.");
    }
  };

  const verifyWhatsAppOtp = async () => {
    if (wpOtp.length < 4) {
      toastrWarning("Enter the 4-digit OTP");
      return;
    }
    setWpStep("verifying");
    try {
      const num = form.whatsapp.replace(/\D/g, "");
      const fullNum = "+" + (num.length === 10 ? "91" : "") + num;
      await verifywhatappotp({ whatsappNumber: fullNum, session: wpSession }, wpOtp);
      setWpStep("done");
      toastrSuccess("WhatsApp verified!");
    } catch {
      setWpStep("otp");
      toastrWarning("Wrong OTP. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!form.date || !form.pannumber || !form.address) {
      toastrWarning("Please fill in all required fields");
      return;
    }
    if (!PAN_REGEX.test(form.pannumber)) {
      toastrWarning("Invalid PAN format — expected ABCDE1234F");
      return;
    }
    if (panError) {
      toastrWarning(panError);
      return;
    }
    setIsSubmitting(true);
    try {
      await api.verifypannumber(form.pannumber, form.address, time, id, date1);
      registersuccess("Registration successfully completed");
      history("/");
    } catch (error) {
      const msg = error?.response?.data?.errorMessage || "Submission failed. Try again.";
      toastrWarning(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const panStatus = () => {
    if (!form.pannumber) return null;
    if (form.pannumber.length < 10) return <span className="rs2d-hint">Enter 10 characters</span>;
    if (panError) return <span className="rs2d-error">{panError}</span>;
    return <span className="rs2d-ok">✓ Format valid</span>;
  };

  return (
    <div className="rs2d-root">
      <div className="rs2d-card">
        <div className="rs2d-left">
          <img src={registerImage} alt="OxyLoans" className="rs2d-img" />
        </div>
        <div className="rs2d-right">
          <div className="rs2d-header">
            <div className="rs2d-badge">STEP 2 OF 2</div>
            <h2 className="rs2d-title">Complete Your Profile</h2>
            <p className="rs2d-sub">Just a few more details to verify your identity</p>
          </div>

          {/* PAN Number */}
          <div className="rs2d-field">
            <label className="rs2d-label">PAN Number <span className="rs2d-req">*</span></label>
            <input
              className={`rs2d-input ${panError ? "rs2d-input-err" : form.pannumber.length === 10 && !panError ? "rs2d-input-ok" : ""}`}
              type="text"
              name="pannumber"
              value={form.pannumber}
              onChange={handleChange}
              placeholder="ABCDE1234F"
              maxLength={10}
              autoComplete="off"
            />
            <div className="rs2d-field-hint">{panStatus()}</div>
          </div>

          {/* Date of Birth */}
          <div className="rs2d-field">
            <label className="rs2d-label">Date of Birth <span className="rs2d-req">*</span></label>
            <input
              className="rs2d-input"
              type="date"
              name="date"
              value={form.date}
              max={maxDob}
              onChange={handleChange}
            />
            <div className="rs2d-field-hint"><span className="rs2d-hint">Must be 18+</span></div>
          </div>

          {/* Address */}
          <div className="rs2d-field">
            <label className="rs2d-label">Address <span className="rs2d-req">*</span></label>
            <textarea
              className="rs2d-input rs2d-textarea"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter your full address"
              rows={3}
            />
          </div>

          {/* WhatsApp */}
          <div className="rs2d-field">
            <label className="rs2d-label">
              WhatsApp Number
              <span className="rs2d-optional"> (recommended for notifications)</span>
            </label>
            <div className="rs2d-wp-row">
              <input
                className="rs2d-input rs2d-wp-input"
                type="tel"
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                placeholder="10-digit mobile"
                maxLength={10}
                disabled={wpStep === "done"}
              />
              {wpStep === "done" ? (
                <span className="rs2d-wp-badge-done">✓ Verified</span>
              ) : (
                <button
                  className="rs2d-wp-btn"
                  onClick={sendWhatsAppOtp}
                  disabled={wpStep === "sending" || wpStep === "verifying"}
                >
                  {wpStep === "sending" ? "Sending…" : wpStep === "otp" || wpStep === "verifying" ? "Resend" : "Send OTP"}
                </button>
              )}
            </div>

            {(wpStep === "otp" || wpStep === "verifying") && (
              <div className="rs2d-otp-row">
                <input
                  ref={wpOtpRef}
                  className="rs2d-input rs2d-otp-input"
                  type="text"
                  inputMode="numeric"
                  value={wpOtp}
                  onChange={(e) => setWpOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter OTP"
                  maxLength={6}
                />
                <button
                  className="rs2d-verify-btn"
                  onClick={verifyWhatsAppOtp}
                  disabled={wpStep === "verifying"}
                >
                  {wpStep === "verifying" ? "Verifying…" : "Verify"}
                </button>
              </div>
            )}
          </div>

          <button
            className="rs2d-submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting…" : "Complete Registration"}
          </button>

          <div className="rs2d-test-banner">
            🧪 TEST PAGE — Changes here are safe; they do not affect the live signup flow
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterStep2Dark;
