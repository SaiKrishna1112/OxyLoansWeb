import React, { useRef, useState } from "react";
import axios from "axios";
import { login } from "../../imagepath";
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { MARKETPLACE_URL } from "../../../config";

// Replace with your real site key from https://www.google.com/recaptcha/admin
// Use env var for prod (real key). Falls back to Google's test key (always passes, for dev/test servers).
const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

const PartnerRegister = () => {
  let inputRef = useRef();
  let inputRef2 = useRef();
  const captchaRef = useRef(null);
  const showIcon = () => (
    <i class="feather feather-eye" aria-hidden="true">
      <FeatherIcon icon="eye" />
    </i>
  );
  const hideIcon = () => (
    <i class="feather feather-eye-slash" aria-hidden="true">
      <FeatherIcon icon="eye-off" />
    </i>
  );
  const [field, setfield] = useState(true);
  const [data, setdata] = useState({
    partnername: "",
    partneremail: "",
    phonenumber: "",
    smobilenumber: "",
    sname: "",
    semail: "",
    error: "",
    partnernameerror: "",
    partneremailerror: "",
    phonenumbererror: "",
    smobilenumbererror: "",
    snameerror: "",
    semailerror: "",
    captchaerror: "",
  });
  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const dispatch = useDispatch();

  const reduxStoreData = useSelector((data) => data.counter.userProfile);
  const handlechange = (event) => {
    const { name, value } = event.target;
    setdata({
      ...data,
      [name]: value,
      [name + "error"]: "",
    });
  };

  const submitformone = () => {
    const errors = {};

    if (data.partnername === "") {
      errors.partnernameerror = "Please enter The Partner Name";
    }
    if (data.partneremail === "") {
      errors.partneremailerror = "Please enter The Partner email";
    }
    if (data.phonenumber === "") {
      errors.phonenumbererror = "Please enter The Partner number";
    }

    setdata({
      ...data,
      ...errors,
    });

    if (Object.keys(errors).length === 0) {
      setfield(false);
    }
  };
  const handlesubmit1 = async () => {
    const errors = {};

    if (data.smobilenumber === "") {
      errors.smobilenumbererror = "Please enter The Partner number";
    }
    if (data.semail === "") {
      errors.semailerror = "Please enter The Partner email";
    }
    if (data.sname === "") {
      errors.snameerror = "Please enter The Partner name";
    }
    if (!captchaToken) {
      errors.captchaerror = "Please complete the CAPTCHA verification";
    }

    setdata({ ...data, ...errors });
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setSubmitError("");
    try {
      await axios.post(
        `${MARKETPLACE_URL}/v1/user/partnerRegistrationFlow`,
        {
          partnerName: data.partnername,
          partnerEmail: data.partneremail,
          partnermobileNumber: data.phonenumber,
          pocName: data.sname,
          listOfPoCEmail: data.semail,
          listOfPoCMobileNumber: data.smobilenumber,
          captchaToken: captchaToken,
        }
      );
      setSubmitted(true);
    } catch (err) {
      const msg =
        err.response?.data?.errorMessage ||
        err.response?.data?.message ||
        "Registration failed. Please try again.";
      setSubmitError(msg);
      if (captchaRef.current) captchaRef.current.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {/* Main Wrapper */}
      <div className="main-wrapper login-body">
        <div className="login-wrapper">
          <div className="container">
            <div className="loginbox">
              <div className="login-left">
                <img className="img-fluid" src={login} alt="Logo" />
              </div>
              <div className="login-right">
                <div className="login-right-wrap">
                  <h1 style={{ marginBottom: "1rem" }}>
                    Register as a Partner
                  </h1>

                  {submitted && (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <div style={{ fontSize: "48px", color: "#28a745" }}>✓</div>
                      <h3 style={{ color: "#28a745" }}>Registration Successful!</h3>
                      <p>Thank you! Your partner registration has been received. You will receive an email with your login credentials shortly.</p>
                      <Link to="/login" className="btn btn-primary">Go to Login</Link>
                    </div>
                  )}

                  {!submitted && submitError && (
                    <div style={{ color: "red", marginBottom: "12px", padding: "10px", background: "#fff3f3", borderRadius: "4px", border: "1px solid #ffcccc" }}>
                      {submitError}
                    </div>
                  )}

                  {/* Form */}
                  {!submitted && field ? (
                    <>
                      <div className="form-group">
                        <label>
                          Partner Name <span className="login-danger">*</span>
                        </label>
                        <input
                          className="form-control"
                          type="text "
                          name="partnername"
                          onChange={handlechange}
                        />
                        <span className="profile-views">
                          <i className="fas fa-user-circle" />
                        </span>
                        {data.partnernameerror && (
                          <div className="error">{data.partnernameerror}</div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>
                          Partner Email <span className="login-danger">*</span>
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          name="partneremail"
                          onChange={handlechange}
                        />
                        <span className="profile-views">
                          <i className="fas fa-envelope" />
                        </span>{" "}
                        {data.partneremailerror && (
                          <div className="error">{data.partneremailerror}</div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>
                          Phone number <span className="login-danger">*</span>
                        </label>
                        <input
                          ref={inputRef}
                          className="form-control pass-input"
                          name="phonenumber"
                          type="password"
                          onChange={handlechange}
                        />
                        <span className="profile-views">
                          <i className="fas fa-phone" />
                        </span>
                        {/* <input className="form-control pass-input" type="text" />
                                            <span className="profile-views feather-eye toggle-password">
                                                <FeatherIcon icon="eye" />
                                            </span> */}
                        {data.phonenumbererror && (
                          <div className="error">{data.phonenumbererror}</div>
                        )}
                      </div>

                      <div className=" dont-have">
                        Already Registered? <Link to="/login">Login</Link>
                      </div>
                      <div className="form-group mb-0">
                        <button
                          className="btn btn-primary btn-block"
                          type="submit"
                          onClick={submitformone}
                        >
                          Next Step
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {" "}
                      <div className="form-group">
                        <label>
                          SPOC Mobile number
                          <span className="login-danger">*</span>
                        </label>
                        {/* <input className="form-control pass-confirm" type="text" /> */}
                        <input
                          ref={inputRef2}
                          className="form-control pass-confirm"
                          type="number"
                          name="smobilenumber"
                          onChange={handlechange}
                        />

                        <span className="profile-views">
                          <i className="fas fa-phone" />
                        </span>
                        {data.smobilenumbererror && (
                          <div className="error">{data.smobilenumbererror}</div>
                        )}
                      </div>
                      <p style={{ fontSize: "12px" }}>
                        {" "}
                        SPOC (Single Point of Contact)
                      </p>
                      <div className="form-group">
                        <label>
                          SPOC Name<span className="login-danger">*</span>
                        </label>
                        {/* <input className="form-control pass-confirm" type="text" /> */}
                        <input
                          ref={inputRef2}
                          className="form-control pass-confirm"
                          type="text"
                          name="sname"
                          onChange={handlechange}
                        />
                        <span className="profile-views">
                          <i className="fas fa-user-circle" />
                        </span>{" "}
                        {data.snameerror && (
                          <div className="error">{data.snameerror}</div>
                        )}
                      </div>
                      <div className="form-group">
                        <label>
                          SPOC Email<span className="login-danger">*</span>
                        </label>
                        {/* <input className="form-control pass-confirm" type="text" /> */}
                        <input
                          ref={inputRef2}
                          className="form-control pass-confirm"
                          type="email"
                          name="semail"
                          onChange={handlechange}
                        />
                        <span className="profile-views">
                          <i className="fas fa-envelope" />
                        </span>{" "}
                        {data.semailerror && (
                          <div className="error">{data.semailerror}</div>
                        )}
                      </div>
                      {/* <div className=" dont-have">
                      Already Registered? <Link to="/login">Login</Link>
                    </div> */}
                      <div className="form-group">
                        <ReCAPTCHA
                          ref={captchaRef}
                          sitekey={RECAPTCHA_SITE_KEY}
                          onChange={(token) => {
                            setCaptchaToken(token);
                            setdata((prev) => ({ ...prev, captchaerror: "" }));
                          }}
                          onExpired={() => setCaptchaToken(null)}
                        />
                        {data.captchaerror && (
                          <div className="error" style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                            {data.captchaerror}
                          </div>
                        )}
                      </div>
                      <div className="form-group mb-0">
                        <button
                          className="btn btn-primary btn-block"
                          type="submit"
                          onClick={handlesubmit1}
                          disabled={loading}
                        >
                          {loading ? "Submitting..." : "Submit"}
                        </button>
                      </div>
                    </>
                  )}

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
                    <Link to="#">
                      <i className="fab fa-facebook-f" />
                    </Link>
                    <Link to="#">
                      <i className="fab fa-twitter" />
                    </Link>
                    <Link to="#">
                      <i className="fab fa-linkedin-in" />
                    </Link>
                  </div>
                  {/* /Social Login */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PartnerRegister;
