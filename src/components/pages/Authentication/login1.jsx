import React, { useEffect, useRef, useState } from "react";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import ReactPasswordToggleIcon from "react-password-toggle-icon";
import { login } from "../../imagepath";

import { Link } from "react-router-dom";
import axios from "axios";
import FeatherIcon from "feather-icons-react";
import "./login.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
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

  const [username, setUsername] = useState("");
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [password, setPassword] = useState("");
  const history = useNavigate();
  const [passworderror, setPassworderror] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [dataIpv6, setdataIpv6] = useState({});
  const [dataIpv4, setdataIpv4] = useState("");

  const handleipv6 = () => {
    axios({
      method: "get",
      url: "https://ipapi.co/json/",
    })
      .then((res) => {
        setdataIpv6(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleip4 = () => {
    axios({
      method: "get",
      url: "https://api.ipify.org/?format=json",
    })
      .then((res) => {
        setdataIpv4(res.data.ip);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    handleipv6();
    handleip4();
  }, []);

  const validateEmail = (username) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(username);
  };

  const validateMobile = (username) => {
    const mobileRegex = /^\d{10}$/;
    return mobileRegex.test(username);
  };

  const handleLogin = () => {
    if (username.trim() === "@") {
      // Use () after trim to call the function
      if (!validateEmail(username)) {
        setEmailError("Invalid email address.");
        return;
      }
    } else {
      // Check if the input is a number
      if (username === Number) {
        if (!validateMobile(username)) {
          setMobileError("Invalid mobile number.");
          return;
        }
      }
    }
    if (password.trim() === "") {
      setPassworderror("Password cannot be empty");
    } else if (password.length <= 7) {
      setPassworderror("password should be minimum 8 characters");
    } else {
      const data = {
        password: password,
        email: username, // Use the correct variable here
        ipAddress: dataIpv4,
        ipAddressResponse: dataIpv6,
        loginType: "WEB",
      };

      axios({
        method: "post",
        url: "http://ec2-15-207-239-145.ap-south-1.compute.amazonaws.com:8080/oxyloans/v1/user/login?grantType=PWD",
        data: data,
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          const accessTokenFromHeader = response.headers["accesstoken"];
          localStorage.setItem("accessToken", accessTokenFromHeader);

          setAccessToken(accessTokenFromHeader);
          history("/admindashboard");
        })
        .catch((error) => {
          setPassworderror(error.response.data.errorMessage);
          // passworderror(error.errorMessage)
          console.error("Error:", error);
        });
    }
  };

  return (
    <>
      <div className="main-wrapper login-body">
        <div className="login-wrapper">
          <div className="container">
            <div className="loginbox">
              <div className="login-left">
                <img className="img-fluid" src={login} alt="Logo" />
              </div>
              <div className="login-right">
                <div className="login-right-wrap">
                  <h1>Welcome to Preskool</h1>
                  <p className="account-subtitle">
                    Need an account? <Link to="/register">Sign Up</Link>
                  </p>
                  <h2>Sign in</h2>
                  {accessToken ? (
                    <p>Access Token: {accessToken}</p>
                  ) : (
                    <p>Loading...</p>
                  )}
                  {/* Form */}
                  {/* <form > */}

                  <div className="form-group">
                    <label>
                      Username <span className="login-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      value={username}
                      name="username"
                      onChange={(event) => setUsername(event.target.value)}
                    />
                    <span className="profile-views">
                      <i className="fas fa-user-circle" />
                    </span>
                    {emailError && (
                      <div className="errormessage">{emailError} </div>
                    )}
                    {mobileError && (
                      <div className="errormessage">{mobileError} </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>
                      Password <span className="login-danger">*</span>
                    </label>
                    <input
                      ref={inputRef}
                      className="form-control pass-input"
                      type="password"
                      name="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />

                    {passworderror && (
                      <div className="errormessage">{passworderror} </div>
                    )}
                    <ReactPasswordToggleIcon
                      inputRef={inputRef}
                      showIcon={showIcon}
                      hideIcon={hideIcon}
                    />
                    {/* <span className="profile-views feather-eye toggle-password" >
                      <FeatherIcon icon="eye"/>
                      </span> */}
                  </div>
                  <div className="forgotpass">
                    <div className="remember-me">
                      <label className="custom_check mr-2 mb-0 d-inline-flex remember-me">
                        {" "}
                        Remember me
                        <input type="checkbox" name="radio" />
                        <span className="checkmark" />
                      </label>
                    </div>
                    <Link to="/forgotpassword">Forgot Password?</Link>
                  </div>
                  <div className="form-group">
                    <button
                      className="btn btn-primary btn-block"
                      onClick={handleLogin}
                      type="submit"
                    >
                      Login
                    </button>
                  </div>

                  {/* </form> */}
                  {/* /Form */}
                  <div className="login-or">
                    <span className="or-line" />
                    <span className="span-or">or</span>
                  </div>
                  {/* Social Login */}
                  <div className="social-login">
                    <Link to="#">
                      <i className="fab fa-google-plus-g" />
                    </Link>
                    <Link to="/whatsapplogin">
                      <i className="fa fa-whatsapp  " />
                    </Link>
                    <Link to="#">
                      <i className="fab fa-facebook-f" />
                    </Link>
                    <Link to="#">
                      <i className="fab fa-twitter" />
                    </Link>
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

export default Login;
