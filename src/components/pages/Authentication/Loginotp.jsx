import React, { useEffect, useRef, useState } from "react";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import ReactPasswordToggleIcon from "react-password-toggle-icon";
import { registerImage } from "../../imagepath";
import { Link, useNavigate } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import { WarningBackendApi } from "../Base UI Elements/SweetAlert";
import { BsWhatsapp } from "react-icons/bs";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

import { handlesenOtp, usersubmitotp, isApiSuccess, warnApiError } from "../../HttpRequest/beforelogin";
import { saveLoginSession } from "../../HttpRequest/aiAdminApi";
import BASE_URL, { ENV, DEV_ADMIN_MOBILE, DEV_OTP } from "../../../config";
import { toastrSuccess, toastrWarning } from "../Base UI Elements/Toast";
import { useDispatch } from "react-redux";

const Loginotp = () => {
  const dispatch = useDispatch();
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

  const [isloading, setLoading] = useState(false);
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
      const { phoneNumberRequiredOrNot: status, signInUrl: email, mobileNumber } = res.data;
      if (status === "LINKED" || status === "FOUND") {
        // Email found in OxyLoans — auto-link (if needed) and login directly
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
      } else {
        // NOT_FOUND — redirect to home so user can register or login with mobile OTP
        window.location.href = "https://www.user.oxyloans.com/";
      }
    } catch (err) {
      const msg = err?.response?.data?.errorMessage || "Could not verify Google account. Please try OTP login.";
      WarningBackendApi("Google Login Failed", msg);
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
        // FOUND — pre-fill mobile and auto-send OTP via SMS
        const mobile = googleModal.mobileNumber || "";
        setGoogleModal(prev => ({ ...prev, pendingLink: true }));
        if (mobile) {
          setUserLoginInfo(prev => ({ ...prev, email: mobile, emailerror: "" }));
          try {
            const otpRes = await handlesenOtp(mobile);
            if (isApiSuccess(otpRes)) {
              if (otpRes.data?.id) sessionStorage.setItem("userId", otpRes.data.id);
              setUserLoginInfo(prev => ({ ...prev, email: mobile, sentotp: true, emailerror: "" }));
              toastrSuccess("OTP sent! Enter it below to link your Google account.");
            }
          } catch (e) { /* user can send OTP manually */ }
        }
      }
    } catch (err) {
      const msg = err?.response?.data?.errorMessage || "Google login failed. Please use mobile OTP.";
      WarningBackendApi("Google Login Failed", msg);
    } finally {
      setGoogleLoading(false);
      if (googleModal?.status === "LINKED") setGoogleModal(null);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => WarningBackendApi("Google Login Failed", "Google authentication was cancelled or failed."),
  });

  let inputRef = useRef();
  const showIcon = () => (
    <i className="feather feather-eye" aria-hidden="true">
      <FeatherIcon icon="eye" />
    </i>
  );
  const hideIcon = () => (
    <i className="feather feather-eye-slash" aria-hidden="true">
      <FeatherIcon icon="eye-off" />
    </i>
  );

  const handlechange = (event) => {
    const { name, value } = event.target;
    setUserLoginInfo({
      ...userLogInInfo,
      [name]: value,
    });
  };

  const submitloginhandler = async () => {
    if (userLogInInfo.password === "") {
      setUserLoginInfo((prevState) => ({
        ...prevState,
        passworderror:
          userLogInInfo.password === "" ? "Please enter the OTP" : "",
      }));
      return;
    }

    const { email, password } = userLogInInfo;
    setLoading(true);
    try {
      const retriveresponse = await usersubmitotp(email, password);

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
        toastrSuccess("Login Success!");
        // Link Google account if user came via Google flow (non-blocking)
        if (googleModal?.pendingLink && googleModal?.accessToken) {
          try {
            await axios.post(
              `${BASE_URL}/v1/user/${retriveresponse.data?.id}/linkGoogleAccount`,
              { accessToken: googleModal.accessToken },
              { headers: { "Content-Type": "application/json", accessToken: sessionStorage.getItem("accessToken") } }
            );
            toastrSuccess("Google account linked! Next time you can login with Google directly.");
          } catch (e) { /* non-blocking */ }
          setGoogleModal(null);
        }
        const role = retriveresponse.data.primaryType;
        if (role === "LENDER") {
          history("/lenderAIDashboard/" + retriveresponse.data.id);
        } else if (role === "ADMIN" || role === "HELPDESKADMIN" || role === "SUPERADMIN" || role === "PRIMARYADMIN") {
          history("/oxyloansadmindashboard");
        } else {
          history("/borrowerDashboard");
        }
      } else {
        const { title, message } = warnApiError(retriveresponse, "Login failed", "Invalid OTP or mobile number");
        toastrWarning(message);
        WarningBackendApi(title, message);
      }
    } catch (e) {
      WarningBackendApi("Login failed", e?.message || "Unexpected error during login");
    } finally {
      setLoading(false);
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
  }, []);

  const sendtheOtp = async () => {
    if (userLogInInfo.email === "") {
      setUserLoginInfo((prevState) => ({
        ...prevState,
        emailerror:
          userLogInInfo.email === "" ? "Please enter the Mobile Number" : "",
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
    <>
      <div className="main-wrapper login-body">
        <div className="login-wrapper">
          <div className="container">
            <div className="loginbox">
              <div className="login-left">
                <img
                  className="img-fluid h-100"
                  src={registerImage}
                  alt="Logo"
                />
              </div>
              <div className="login-right">
                <div className="login-right-wrap">
                  <h1>Welcome to Oxyloans</h1>

                  <p className="account-subtitle">
                    Need an account? <Link to="/register">Sign Up</Link>
                  </p>
                  <h2>Login With OTP</h2>

                  <div className="form-group">
                    <label htmlFor="userloginusername">
                      Enter Mobile Number{" "}
                      <span className="login-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={userLogInInfo.email}
                      name="email"
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setUserLoginInfo({ ...userLogInInfo, email: digits, emailerror: "" });
                      }}
                      maxLength={10}
                      id="userloginusername"
                      required
                    />
                    <span className="profile-views">
                      <i className="fas fa-user-circle" />
                    </span>
                    {userLogInInfo.emailerror && (
                      <div className="text-danger">
                        {" "}
                        {userLogInInfo.emailerror}
                      </div>
                    )}
                  </div>
                  {userLogInInfo.sentotp && (
                    <>
                      {" "}
                      <div className="form-group">
                        <label htmlFor="userpassword">
                          Enter OTP <span className="login-danger">*</span>
                        </label>
                        <input
                          ref={inputRef}
                          className="form-control pass-input"
                          type="number"
                          name="password"
                          id="userpassword"
                          value={userLogInInfo.password}
                          onChange={handlechange}
                          required
                        />
                        {userLogInInfo.error && (
                          <div className="text-danger">
                            {userLogInInfo.errormessage}
                          </div>
                        )}{" "}
                        {userLogInInfo.passworderror && (
                          <div className="text-danger">
                            {" "}
                            {userLogInInfo.passworderror}
                          </div>
                        )}
                        <ReactPasswordToggleIcon
                          inputRef={inputRef}
                          showIcon={showIcon}
                          hideIcon={hideIcon}
                        />
                      </div>{" "}
                    </>
                  )}

                  <div className="forgotpass">
                    <div className="remember-me">
                      {/* <label className="custom_check mr-2 mb-0 d-inline-flex remember-me">
                        Remember me
                        <input type="checkbox" name="remember" />
                        <span className="checkmark" />
                      </label> */}
                      <Link to="/" >Login ?</Link>
                    </div>
                    <Link to="/forgotpassword">Forgot Password?</Link>
                  </div>
                  <div className="form-group">
                    {userLogInInfo.sentotp ? (
                      <>
                        {" "}
                        {isloading ? <> <button
                          className="btn btn-primary btn-block"
                          type="button"
                        // onClick={submitloginhandler}
                        >
                          <div class="spinner-border text-light" role="status">
                            <span class="visually-hidden">Loading...</span>
                          </div>
                        </button></> : <><button
                          className="btn btn-primary btn-block"
                          type="button"
                          onClick={submitloginhandler}
                        >
                          Login
                        </button></>}
                      </>
                    ) : (
                      <>


                        {isloading ? <> <button
                          className="btn btn-primary btn-block"
                          type="button"
                        // onClick={submitloginhandler}
                        >
                          <div class="spinner-border text-light" role="status">
                            <span class="visually-hidden">Loading...</span>
                          </div>
                        </button></> : <> <button
                          className="btn btn-primary btn-block"
                          type="button"
                          onClick={sendtheOtp}
                        >
                          Send OTP
                        </button></>}

                      </>
                    )}
                  </div>

                  <div className="login-or">
                    <span className="or-line" />
                    <span className="span-or">or</span>
                  </div>

                  <div className="social-login">
                    <Link to="/" className="bg-success text-white">
                      <i className="fab fa-at" />
                    </Link>
                    <Link to="/whatsapplogin" className="bg-success text-white">
                      <BsWhatsapp />
                    </Link>
                    <button
                      type="button"
                      onClick={() => googleLogin()}
                      disabled={googleLoading}
                      style={{ background: "#fff", border: "1px solid #ddd", borderRadius: "50%", width: 38, height: 38, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      title="Sign in with Google"
                    >
                      {googleLoading
                        ? <span className="spinner-border spinner-border-sm text-danger" />
                        : <i className="fab fa-google" style={{ color: "#DB4437", fontSize: 16 }} />}
                    </button>
                  </div>

                  {/* Google Login Modal Overlay */}
                  {googleModal && (
                    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ background: "#fff", borderRadius: 12, padding: "28px 32px", maxWidth: 400, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", textAlign: "center" }}>
                        {googleModal.status === "NOT_FOUND" ? (
                          <>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>❌</div>
                            <h5 style={{ fontWeight: 700, marginBottom: 8 }}>Not Registered</h5>
                            <p style={{ color: "#555", fontSize: 14, marginBottom: 20 }}>
                              <strong>{googleModal.email}</strong> is not registered on OxyLoans. Please login with your registered mobile number.
                            </p>
                            <button className="btn btn-primary btn-block mb-2" onClick={() => setGoogleModal(null)}>
                              Login with Mobile OTP
                            </button>
                            <Link to="/whatsapplogin" className="btn btn-outline-success btn-block" onClick={() => setGoogleModal(null)}>
                              Login with WhatsApp OTP
                            </Link>
                          </>
                        ) : (
                          <>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                            <h5 style={{ fontWeight: 700, marginBottom: 4 }}>OxyLoans Account Found</h5>
                            <p style={{ color: "#555", fontSize: 13, marginBottom: 4 }}>{googleModal.email}</p>
                            {googleModal.mobileNumber && (
                              <p style={{ fontSize: 14, marginBottom: 20 }}>
                                Registered mobile: <strong>{googleModal.mobileNumber.slice(0, -4).replace(/\d/g, "X") + googleModal.mobileNumber.slice(-4)}</strong>
                              </p>
                            )}
                            <button
                              className="btn btn-primary btn-block mb-2"
                              onClick={handleGoogleAllow}
                              disabled={googleLoading}
                            >
                              {googleLoading ? <span className="spinner-border spinner-border-sm mr-2" /> : null}
                              Send OTP via SMS
                            </button>
                            <Link
                              to="/whatsapplogin"
                              className="btn btn-outline-success btn-block mb-2"
                              onClick={() => {
                                if (googleModal.mobileNumber) sessionStorage.setItem("prefill_mobile", googleModal.mobileNumber);
                                setGoogleModal(null);
                              }}
                            >
                              Send OTP via WhatsApp
                            </Link>
                            <button className="btn btn-outline-secondary btn-block" onClick={() => {
                              if (googleModal.mobileNumber) setUserLoginInfo(prev => ({ ...prev, email: googleModal.mobileNumber, emailerror: "" }));
                              setGoogleModal(null);
                            }}>
                              Enter OTP Manually
                            </button>
                          </>
                        )}
                        <button style={{ marginTop: 14, background: "none", border: "none", color: "#999", fontSize: 13, cursor: "pointer" }} onClick={() => setGoogleModal(null)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loginotp;
