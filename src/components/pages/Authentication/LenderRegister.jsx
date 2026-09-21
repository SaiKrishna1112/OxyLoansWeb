import React, { useEffect, useRef, useState } from "react";
import { registerImage } from "../../imagepath";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import ReactPasswordToggleIcon from "react-password-toggle-icon";
import * as api from "./api";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import OtpInput from "./OtpInput";
import { toastrWarning } from "../Base UI Elements/Toast";
import Swal from "sweetalert2";
import { API_USER_URL } from "../../../config";
import axios from "axios";

export default function LenderRegister() {
  let inputRef = useRef();
  let inputRef2 = useRef();
  const navigate = useNavigate();

  const [field, setfield] = useState(true);
  const [submitotp, setsubmitotp] = useState(false);
  const [error, setError] = useState("");
  const [response1, setResponse] = useState({});
  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
  const [gmailPrefill, setGmailPrefill] = useState(null);

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
          setRegistrationField(prev => ({
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

  const [registrationField, setRegistrationField] = useState({
    email: "",
    pancard: "",
    password: "",
    referrerId: "",
    moblie: "",
    emailerror: "",
    pancarderror: "",
    passworderror: "",
    eamilerror: "",
    referrerIderror: "",
    uniqueNumber: "",
    moblieerror: "",
    mobileOTPNew: "",
  });

  const handlechange = (event) => {
    const { name, value } = event.target;
    setError("");
    if (event.target.value.trim() === "LR100001") {
      setRegistrationField({
        ...registrationField,
        referrerIderror: "Invaild Referrer Id"
      })

    } else {
      setRegistrationField({
        ...registrationField,
        [name]: value,
      });
    }

  };

  const setwhatsappotphandler = (OTP) => {
    const output = String(OTP.join(""));

    setRegistrationField({
      ...registrationField,
      mobileOTPNew: output,
    });
  };

  const hideIcon = () => (
    <i className="feather feather-eye" aria-hidden="true">
      <FeatherIcon icon="eye" />
    </i>
  );
  const showIcon = () => (
    <i className="feather feather-eye-slash" aria-hidden="true">
      <FeatherIcon icon="eye-off" />
    </i>
  );
  const handleKeyPress = (event) => {
    console.log("Key pressed:", event.key); // Check if the function is triggered
    const inputChar = event.key;
    const regex = /^[a-zA-Z]*$/; // Regular expression to allow only alphabets

    // Check if the pressed key is an alphabetic character or backspace
    if (!regex.test(inputChar) && inputChar !== "Backspace") {
      event.preventDefault();
    }
  };


  const handleKeyPressNumberCapital = (event) => {
    const inputChar = event.key;
    const regex = /^[A-Za-z]*$/;

    if (!regex.test(inputChar) && inputChar !== "Backspace") {
      event.preventDefault();
    }
  };
  const handleKeyPressNumber = (event) => {
    const inputChar = event.key;
    const regex = /^[0-9]*$/;

    if (!regex.test(inputChar) && inputChar !== "Backspace") {
      event.preventDefault();
    }
  };
  const handleLenderRegister = async () => {
    // Validate name
    if (!registrationField.pancard) {
      setRegistrationField(prev => ({ ...prev, pancarderror: "Please enter the Name" }));
      toastrWarning("Please enter your name as per PAN card");
      return;
    }

    // Gmail one-shot registration — email + mobile already verified, skip OTP
    if (gmailPrefill) {
      try {
        const res = await axios.post(API_USER_URL + "registerLenderWithGoogle", {
          googleAccessToken: gmailPrefill.googleAccessToken,
          mobileNumber: gmailPrefill.mobile,
          email: gmailPrefill.email,
          nameAsPan: registrationField.pancard,
          password: registrationField.password || "",
          referrerId: registrationField.referrerId || "",
          userType: "LENDER",
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        });
        // Save session and redirect to KYC / dashboard
        const token = res.headers?.accesstoken || res.headers?.accessToken || res.headers?.["access-token"];
        if (token && res.data?.id) {
          sessionStorage.setItem("accessToken", token);
          sessionStorage.setItem("userId", String(res.data.id));
          sessionStorage.setItem("tokenTime", res.data.tokenGeneratedTime || "");
          sessionStorage.setItem("email", res.data.email || "");
          localStorage.setItem("primaryType", res.data.primaryType || "");
          localStorage.setItem("id", String(res.data.id));
          sessionStorage.removeItem("gmail_prefill");
          navigate("/profile");
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

    if (validationError) {
      setError(validationError);
      toastrWarning(validationError);
      return;
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
        setResponse(RegisterResponse);
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

      if (registrationField.mobileOTPNew.length == 6) {
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
          userLocation.longitude
        );
        setfield(false);
        setsubmitotp(true);
        localStorage.setItem("id", response.responseData.userId);
        const mill1 = new Date().getTime();
        localStorage.setItem("timemilll", mill1);
        // navigate("/register_active_proceed");
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

  useEffect(
    () => {
      if (/\d/.test(registrationField.pancard)) {
        setRegistrationField(prev => ({ ...prev, pancarderror: "Enter characters only!" }));
      } else {
        setRegistrationField(prev => ({ ...prev, pancarderror: "" }));
      }
    },
    [registrationField.pancard]
  );
  // useEffect(() => {
  //   setTimeout(() => {
  //     setError("");
  //   }, 1000);
  // }, [error]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    // Get the value of the 'ref' parameter
    const refParam = searchParams.get("ref");
   localStorage.setItem("uniqnumber", refParam || 0);
    // console.log({refParam})

    if (refParam) {
      setRegistrationField(prev => ({
        ...prev,
        referrerId: refParam,
      }));
    }
  }, []);

  return (
    <div>
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
                  {submitotp ? (
                    <>
                      {" "}
                      <div className="maincircle">
                        <div className="circle">
                          <i className="fa-solid fa-user-check"></i>
                        </div>
                      </div>
                      <div className="cend">
                        <h2 className="textcenter">
                          You are one step away from completing registration.
                        </h2>{" "}
                        <hr />
                        <p className="textcent">
                          An activation link has been sent to your registered
                          e-mail. Please check your inbox and activate your
                          OxyLoans account to start Lending
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {" "}
                      {field ? (
                        <>
                          {" "}
                          <h1>Register as a Lender </h1>
                        </>
                      ) : (
                        <>
                          <h1 className="center">Please Enter the OTP </h1>
                        </>
                      )}{" "}
                    </>
                  )}

                  <p className="account-subtitle">
                    {/* Register as a Lender */}
                  </p>
                  {/* Form */}
                  {/* <form >  */}
                  <div>
                    {field ? (
                      <>
                        <div className="form-group">
                          <label>
                            Name as per PAN card
                            <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            name="pancard"
                            maxLength={30}
                            // onKeyPress={handleKeyPressNumberCapital}
                            onChange={handlechange}
                          />
                          <span className="profile-views">
                            <i className="fas fa-user-circle" />
                          </span>
                          {registrationField.pancarderror && (
                            <div className="error">
                              {registrationField.pancarderror}
                            </div>
                          )}
                        </div>
                        {gmailPrefill && (
                          <div style={{ background: "#e8f5e9", border: "1px solid #4caf50", borderRadius: 6, padding: "8px 12px", marginBottom: 12, fontSize: 13, color: "#2e7d32" }}>
                            ✅ Gmail verified — email and mobile are pre-filled and locked.
                          </div>
                        )}
                        <div className="form-group">
                          <label>
                            Email <span className="login-danger">*</span>
                          </label>
                          <input
                            className="form-control"
                            type="email"
                            name="email"
                            maxLength={35}
                            value={registrationField.email}
                            readOnly={!!gmailPrefill}
                            onChange={gmailPrefill ? undefined : handlechange}
                            style={gmailPrefill ? { background: "#f5f5f5", cursor: "not-allowed" } : {}}
                          />
                          <span className="profile-views">
                            <i className="fas fa-envelope" />
                          </span>
                          {registrationField.emailerror && (
                            <div className="error">
                              {registrationField.emailerror}
                            </div>
                          )}
                        </div>
                        <div className="form-group">
                          <label>
                            Password {gmailPrefill ? <span style={{color:"#888",fontWeight:"normal",fontSize:"0.85em"}}>(optional — you'll sign in with Google)</span> : <span className="login-danger">*</span>}
                          </label>
                          <input
                            ref={inputRef}
                            className="form-control pass-input"
                            type="password"
                            name="password"
                            maxLength={15}
                            onChange={handlechange}
                          />
                          <ReactPasswordToggleIcon
                            inputRef={inputRef}
                            showIcon={showIcon}
                            hideIcon={hideIcon}
                          />
                          {registrationField.passworderror && (
                            <div className="error">
                              {registrationField.passworderror}
                            </div>
                          )}
                        </div>
                        <p className="reffertext">
                          If you are referred by an existing lender,Please enter
                          his/her referrer id ( EX : LR100001)
                        </p>
                        <div className="form-group">
                          <label>Enter the referrer ID</label>
                          <input
                            ref={inputRef2}
                            className="form-control pass-confirm"
                            type="text"
                            name="referrerId"
                            value={registrationField.referrerId}
                            onChange={handlechange}
                          />
                          {/* <span className="profile-views">
                            <i className="fas fa-phone" />
                          </span>{" "} */}
                          {registrationField.referrerIderror && (
                            <div className="error">
                              {registrationField.referrerIderror}
                            </div>
                          )}
                        </div>
                        <div className="form-group">
                          <label>
                            Enter mobile Number
                            <span className="login-danger">*</span>
                          </label>
                          {/* <input className="form-control pass-confirm" type="text" /> */}
                          <input
                            ref={inputRef2}
                            className="form-control pass-confirm"
                            type="tel"
                            name="moblie"
                            maxLength={10}
                            value={registrationField.moblie}
                            readOnly={!!gmailPrefill}
                            onKeyPress={gmailPrefill ? undefined : handleKeyPressNumber}
                            onChange={gmailPrefill ? undefined : handlechange}
                            style={gmailPrefill ? { background: "#f5f5f5", cursor: "not-allowed" } : {}}
                          />
                          <span className="profile-views">
                            <i className="fas fa-phone" />
                          </span>{" "}
                          {registrationField.moblieerror && (
                            <div className="error">
                              {registrationField.moblieerror}
                            </div>
                          )}
                        </div>
                        {error && (
                          <div className="errormessage">
                            {error}
                          </div>
                        )}

                        <div className="dont-have">
                          Already Registered ? <Link to="/">Login</Link>
                        </div>
                        <div className="form-group mb-0">
                          <button
                            className="btn btn-primary btn-block"
                            type="submit"
                            onClick={handleLenderRegister}
                          >
                            {/* //  onClick={()=>{setfield(false);handleLenderRegister()}}> */}
                            Next Step
                          </button>
                        </div>{" "}
                      </>
                    ) : (
                      <>
                        {submitotp ? (
                          <></>
                        ) : (
                          <>
                            {" "}
                            <div className="maincircle">
                              <div className="circle">
                                {" "}
                                <i className="fa-solid fa-user-lock"></i>
                              </div>
                            </div>
                            <p>Enhanced Security for Registering on OxyLoans</p>
                            <hr />
                            <div className="otpfiled">
                              <OtpInput
                                data={6}
                                setwhatsappotphandler={setwhatsappotphandler}
                              />
                            </div>
                            <div className=" dont-have">
                              Already Registered? <Link to="/">Login</Link>
                            </div>
                            {error && <p className="errormessage">{error}</p>}
                            <div className="form-group mb-0">
                              <button
                                className="btn btn-primary btn-block"
                                type="submit"
                                // onClick={()=>{Otpverify();setsubmitotp(true)}}>
                                onClick={() => Otpverify()}
                              >
                                Submit
                              </button>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  {/* </form> */}
                  {/* /Form */}
                  <div className="login-or">
                    <span className="or-line" />
                    <span className="span-or">or</span>
                  </div>
                  {/* Social Login */}
                  <div className="social-login">
                    {/* <Link to="#">
                      <i className="fab fa-google-plus-g" />
                    </Link> */}
                    <div className="dont-have">
                      Register as a{" "}
                      <Link to="/borrower_register">
                        Borrower
                      </Link></div>
                    {/* <Link to="/whatsapplogin" className="bg-success text-white">
                      <i className="fa fa-whatsapp" />{" "}
                    </Link> */}
                    {/* <Link onClick={() => {}} to="#">
                      <i className="fab fa-facebook-f" />
                    </Link>
                    <Link to="#">
                      <i className="fab fa-twitter" />
                    </Link> */}
                  </div>
                  {/* /Social Login */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
