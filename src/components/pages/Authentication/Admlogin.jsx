import React, { useEffect, useRef, useState } from "react";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import ReactPasswordToggleIcon from "react-password-toggle-icon";
import { registerImage } from "../../imagepath";
import { Link, useNavigate } from "react-router-dom";
import FeatherIcon from "feather-icons-react";

import { Admlog, isApiSuccess, warnApiError } from "../../HttpRequest/beforelogin";
import { toastrSuccess, toastrWarning } from "../Base UI Elements/Toast";
import { useDispatch } from "react-redux";

const Admlogin = () => {
  const dispatch = useDispatch();
  const history = useNavigate();
  const [userLogInInfo, setUserLoginInfo] = useState({
    email: "",
    moblie: "",
    loginwithotp: false,
    password: "",
    response: null,
    dataIpv4: "",
    oftermoblieotp: false,
    otp: "",
    dataIpv6: "",
    error: null,
    errormessage: "",
    isvalid: true,
    userid: "",

    loading: true,
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

  useEffect(() => {
    if (userLogInInfo.userid != "" && userLogInInfo.password != "") {
      setUserLoginInfo({
        ...userLogInInfo,
        isvalid: false,
      });
    } else {
      setUserLoginInfo({
        ...userLogInInfo,
        isvalid: true,
      });
    }
  }, [userLogInInfo.userid, userLogInInfo.password]);

  const loginhandler = async () => {
    const { userid, password } = userLogInInfo;
    if (!userid?.trim() || !password?.trim()) {
      toastrWarning("Enter user ID and password.");
      return;
    }
    try {
      const retriveresponse = await Admlog(userid.trim(), password);
      if (isApiSuccess(retriveresponse)) {
        toastrSuccess("Login Success!");
        const role = retriveresponse.data.primaryType;
        localStorage.setItem("primaryType", role || "");
        if (role === "LENDER") {
          history("/dashboard");
        } else if (
          role === "ADMIN" ||
          role === "HELPDESKADMIN" ||
          role === "SUPERADMIN" ||
          role === "PRIMARYADMIN"
        ) {
          history("/adminAIDashboard");
        } else {
          history("/borrowerDashboard");
        }
      } else {
        const { message } = warnApiError(
          retriveresponse,
          "Login failed",
          "Login failed. Use admin email + password, or user ID with SUPERADMIN."
        );
        const hint =
          retriveresponse?.code === "ERR_NETWORK" || String(message).toLowerCase().includes("network")
            ? " Start backend on port 8181, then restart npm start (proxy needs restart after config change)."
            : "";
        toastrWarning(message + hint);
      }
    } catch (err) {
      toastrWarning(
        (err?.message || "Cannot reach backend.") +
          " Start Spring Boot on port 8181 and restart npm start."
      );
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
                  <h2>Admin Login</h2>
                  <p className="account-subtitle small text-muted mb-3">
                    Admin email + password, or user ID (LR55573) with access key SUPERADMIN.
                    Backend: {process.env.NODE_ENV === "development" ? "see src/config.js ENV" : "configured server"}.
                  </p>

                  <form className="needs-validation" noValidate>
                    <div className="form-group">
                      <label htmlFor="userid">
                        Admin email or user ID (LR55573)
                        <span className="login-danger">*</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        value={userLogInInfo.userid}
                        name="userid"
                        onChange={handlechange}
                        id="userid"
                        required
                      />
                      <span className="profile-views">
                        <i className="fas fa-user-circle" />
                      </span>
                    </div>
                    <div className="form-group">
                      <label htmlFor="userpassword">
                        Password <span className="login-danger">*</span>
                      </label>
                      <input
                        ref={inputRef}
                        className="form-control pass-input"
                        type="password"
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
                      )}
                      <ReactPasswordToggleIcon
                        inputRef={inputRef}
                        showIcon={showIcon}
                        hideIcon={hideIcon}
                      />
                    </div>
                    <div className="forgotpass">
                      <div className="remember-me">
                        <label className="custom_check mr-2 mb-0 d-inline-flex remember-me">
                          Remember me
                          <input type="checkbox" name="remember" />
                          <span className="checkmark" />
                        </label>
                      </div>
                      <Link to="/forgotpassword">Forgot Password?</Link>
                    </div>
                    <div className="form-group">
                      <button
                        className="btn btn-primary btn-block"
                        type="button"
                        disabled={userLogInInfo.isvalid}
                        onClick={loginhandler}
                      >
                        Login
                      </button>
                    </div>
                  </form>

                  <div className="login-or">
                    <span className="or-line" />
                    <span className="span-or">or</span>
                  </div>

                  <div className="social-login">
                    {/* <Link to="#">
                      <i className="fab fa-google-plus-g" />
                    </Link> */}
                    <Link to="/whatsapplogin" className="bg-success text-white">
                      <i className="fa fa-whatsapp" />{" "}
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

export default Admlogin;

//   return (
//     <div>Admlogin</div>
//   )
// }
