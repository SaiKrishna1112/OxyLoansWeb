import React, { useEffect, useRef, useState } from "react";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import ReactPasswordToggleIcon from "react-password-toggle-icon";
import { registerImage } from "../../imagepath";
import { Link, useNavigate } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import { WarningBackendApi } from "../Base UI Elements/SweetAlert";
import { BsWhatsapp } from "react-icons/bs";

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

  const [isloading, setLoading] = useState(false)

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

        const role = retriveresponse.data.primaryType;
        if (role === "LENDER") {
          history("/ai/portfolio");
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
                      <BsWhatsapp />{" "}
                    </Link>
                    {/* <Link onClick={() => {}} to="#">
                      <i className="fab fa-facebook-f" />
                    </Link>
                    <Link to="#">
                      <i className="fab fa-twitter" />
                    </Link> */}
                  </div>
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
