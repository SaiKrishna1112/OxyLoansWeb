import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import { BsWhatsapp } from "react-icons/bs";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

import { loginHeroLeft, loginPlantCoin } from "../../imagepath";
import { Admlog, userloginSection, warnApiError } from "../../HttpRequest/beforelogin";
import { saveLoginSession } from "../../HttpRequest/aiAdminApi";
import BASE_URL from "../../../config";
import { toastrSuccess, toastrWarning } from "../Base UI Elements/Toast";
import { WarningBackendApi } from "../Base UI Elements/SweetAlert";
import { getPostLoginRedirectUrl } from "../../../utils/redirectUtils";
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

const Login = () => {
  const history = useNavigate();
  const staticAdminEmail = "admin@oxyloans.com";
  const staticAdminPassword = "Radha@1234";

  const [userLogInInfo, setUserLoginInfo] = useState({
    email: "",
    password: "",
    emailerror: "",
    passworderror: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isloading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleModal, setGoogleModal] = useState(null); // { status, email }

  const handlechange = (event) => {
    const { name, value } = event.target;
    setUserLoginInfo((prev) => ({
      ...prev,
      [name]: value,
      [`${name}error`]: "",
    }));
  };

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

  const submitloginhandler = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!userLogInInfo.email || !userLogInInfo.password) {
      setUserLoginInfo((prevState) => ({
        ...prevState,
        emailerror: !userLogInInfo.email ? "Please enter your Email or Mobile Number" : "",
        passworderror: !userLogInInfo.password ? "Please enter your Password" : "",
      }));
      return;
    }

    const { email, password } = userLogInInfo;

    // Static Admin shortcut
    if (email === staticAdminEmail && password === staticAdminPassword) {
      setLoading(true);
      try {
        const retriveresponse = await Admlog("6680", "SUPERADMIN");
        if (retriveresponse?.status === 200) {
          toastrSuccess("Login Success !");
          history("/oxyloansadmindashboard");
        } else {
          toastrWarning(
            retriveresponse?.response?.data?.errorMessage ||
              retriveresponse?.message ||
              "Static admin shortcut could not get backend token. Confirm backend is up on :8181 and retry."
          );
        }
      } catch (err) {
        WarningBackendApi("Admin Login Failed", err?.message || "Could not complete admin login.");
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const retriveresponse = await userloginSection(email, password);

      if (retriveresponse?.request?.status === 200) {
        toastrSuccess("Login Success !");
        localStorage.setItem("primaryType", retriveresponse.data.primaryType);
        sessionStorage.setItem("email", retriveresponse.data.email);
        saveLoginSession(retriveresponse);

        const pType = retriveresponse.data.primaryType;
        let defaultPath = "/borrowerDashboard";
        if (pType === "LENDER") {
          defaultPath = "/lenderAIDashboard/" + retriveresponse.data.id;
        } else if (["ADMIN", "HELPDESKADMIN", "SUPERADMIN", "PRIMARYADMIN"].includes(pType)) {
          defaultPath = "/oxyloansadmindashboard";
        }
        history(getPostLoginRedirectUrl(defaultPath, pType));
      } else {
        const { title, message } = warnApiError(retriveresponse, "Login failed", "Invalid credentials");
        const step2 = /step 2 is pending\s*=\s*(\d+)\s*=/i.exec(message || "");
        if (step2) {
          toastrSuccess("Please complete your registration to continue.");
          history(`/register_active_proceed?id=${step2[1]}&time=${Date.now()}`);
          return;
        }
        toastrWarning(message);
        WarningBackendApi(title, message);
      }
    } catch (err) {
      WarningBackendApi("Login Failed", err?.message || "Unexpected error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
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
          <div className="loginotp-card-header">
            <div className="loginotp-header-left">
              <h1 className="loginotp-welcome-title">
                Welcome to <span className="oxy-blue">Oxy</span>
                <span className="oxy-green">Loans</span>
              </h1>
              <p className="loginotp-welcome-sub">
                Login with your email and password
              </p>
            </div>
            <div className="loginotp-sprout-wrap">
              <img src={loginPlantCoin} alt="OxyLoans Sprout" />
            </div>
          </div>

          <div className="loginotp-section-heading">
            <h2 className="loginotp-step-title">Login with Password</h2>
            <p className="loginotp-step-desc">
              Enter your registered email or mobile number
            </p>
          </div>

          <form onSubmit={submitloginhandler} className="loginotp-form-stack">
            {/* Email / Mobile Input */}
            <div>
              <div className={`loginotp-input-box ${userLogInInfo.emailerror ? "has-error" : ""}`}>
                <span className="loginotp-phone-icon">
                  <FeatherIcon icon="mail" size={17} />
                </span>
                <span className="loginotp-input-divider" />
                <input
                  className="loginotp-native-input"
                  type="text"
                  value={userLogInInfo.email}
                  name="email"
                  placeholder="Email or Mobile Number *"
                  onChange={handlechange}
                  id="userloginusername"
                  autoComplete="username"
                  required
                />
              </div>
              {userLogInInfo.emailerror && (
                <div className="loginotp-field-error">
                  <FeatherIcon icon="alert-circle" size={13} />
                  {userLogInInfo.emailerror}
                </div>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className={`loginotp-input-box ${userLogInInfo.passworderror ? "has-error" : ""}`}>
                <span className="loginotp-phone-icon">
                  <FeatherIcon icon="lock" size={17} />
                </span>
                <span className="loginotp-input-divider" />
                <input
                  className="loginotp-native-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="userpassword"
                  placeholder="Enter Password *"
                  value={userLogInInfo.password}
                  onChange={handlechange}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="loginotp-pw-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <FeatherIcon icon={showPassword ? "eye-off" : "eye"} size={16} />
                </button>
              </div>
              {userLogInInfo.passworderror && (
                <div className="loginotp-field-error">
                  <FeatherIcon icon="alert-circle" size={13} />
                  {userLogInInfo.passworderror}
                </div>
              )}
            </div>

            {/* Links Row: Login with OTP & Forgot Password */}
            <div className="loginotp-links-row">
              <Link to="/loginotp" className="loginotp-text-link">
                <FeatherIcon icon="smartphone" size={13} /> Login with OTP
              </Link>
              <Link to="/forgotpassword" className="loginotp-text-link">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
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
                  Login <FeatherIcon icon="arrow-right" size={16} className="btn-arrow-icon" />
                </>
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div className="loginotp-divider">
            <span>OR</span>
          </div>

          {/* Alt Login Buttons */}
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

            <Link to="/whatsapplogin" className="loginotp-alt-btn">
              <BsWhatsapp size={17} style={{ color: "#25D366" }} />
              Login with WhatsApp OTP
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
        </div>
      </div>

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
    </div>
  );
};

export default Login;
