import React, { useEffect, useRef, useState } from "react";
import { registerImage } from "../../imagepath";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import ReactPasswordToggleIcon from "react-password-toggle-icon";
import * as api from "./api";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import OtpInput from "./OtpInput";
import { toastrSuccess, toastrWarning } from "../Base UI Elements/Toast";
import Swal from "sweetalert2";
import { API_USER_URL } from "../../../config";
import axios from "axios";
import { referrerdata, isApiSuccess } from "../../HttpRequest/beforelogin";
import { clearLastVisitedUrls } from "../../../utils/redirectUtils";

export default function BorrowerRegister() {
  const inputRef = useRef();
  let inputRef2 = useRef();

  const navigate = useNavigate();
  const [field, setField] = useState(true);
  const [submitotp, setSubmitOtp] = useState(false);
  const [error, setError] = useState("");
  const [response1, setResponse] = useState({});
  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });
  const [gmailPrefill, setGmailPrefill] = useState(null);
  const [resendTimer, setResendTimer] = useState(30);
  const [loadingResend, setLoadingResend] = useState(false);
  const [trackingId, setTrackingId] = useState(null);
  const [relationshipId, setRelationshipId] = useState(null);

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

  const handleResendOtp = async () => {
    setLoadingResend(true);
    try {
      const RegisterResponse = await api.RegisterUser(registrationField.mobile);
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
  }, []);
  const localData = JSON.parse(localStorage.getItem("userData") || "{}");

  const [registrationField, setRegistrationField] = useState({
    email: "",
    pancard: "",
    password: "",
    referrerId: "",
    mobile: "",
    emailerror: "",
    pancarderror: "",
    passworderror: "",
    referrerIderror: "",
    uniqueNumber: "",
    mobileerror: "",
    mobileOTPNew: "",
  });

  const validateReferrerId = async (refValue) => {
    const val = String(refValue || "").trim();
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
    const output = OTP.join("");
    setRegistrationField((prev) => ({
      ...prev,
      mobileOTPNew: output,
    }));
  };

  const hideIcon = () => <FeatherIcon icon="eye" />;
  const showIcon = () => <FeatherIcon icon="eye-off" />;


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
    if (!registrationField.pancard) {
      setRegistrationField(prev => ({ ...prev, pancarderror: "Please enter the Name" }));
      toastrWarning("Please enter your name as per PAN card");
      return;
    }

    // Gmail one-shot registration — email + mobile already verified
    if (gmailPrefill) {
      try {
        const res = await axios.post(API_USER_URL + "registerLenderWithGoogle", {
          mobileNumber: gmailPrefill.mobile,
          nameAsPan: registrationField.pancard,
          password: registrationField.password || "",
          referrerId: registrationField.referrerId || "",
          userType: "BORROWER",
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        });
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

    // Normal OTP flow
    setRegistrationField((prevState) => ({
      ...prevState,
      emailerror: !registrationField.email ? "Please enter the email" : "",
      pancarderror: !registrationField.pancard ? "Please enter the Name" : "",
      mobileerror: !registrationField.mobile ? "Please enter the mobile" : "",
      passworderror: !registrationField.password ? "Please enter the password" : "",
    }));
    if (!registrationField.pancard || registrationField.pancard.trim().length < 2) {
      setRegistrationField((prev) => ({
        ...prev,
        pancarderror: !registrationField.pancard ? "Please enter the Name" : "Name must be at least 2 characters",
      }));
      return;
    }
    const validationError = api.validateRegisterInput(
      registrationField.email,
      registrationField.password,
      registrationField.mobile
    );

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
      !registrationField.emailerror &&
      !registrationField.pancarderror &&
      !registrationField.mobileerror &&
      !registrationField.passworderror &&
      !registrationField.referrerIderror
    ) {
      try {
        const RegisterResponse = await api.RegisterUser(registrationField.mobile);
        localStorage.setItem("seesion", RegisterResponse);
        localStorage.setItem("type", "Borrower");
        if(registrationField.referrerId !== 0 && registrationField.referrerId){
          const finalUniq = registrationField.uniqueNumber || registrationField.referrerId;
          localStorage.setItem("uniqnumber", finalUniq);
        }
        setResponse(RegisterResponse);
        setField(false);
        setError(null);
      } catch (error) {
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
              axios.post(API_USER_URL + "sendingEmailActivationLink", { userId })
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
      const session = localStorage.getItem("seesion");

      if (registrationField.mobileOTPNew.length === 6) {
        const response = await api.vaildateotp(
          registrationField.email,
          registrationField.mobile,
          registrationField.mobileOTPNew,
          registrationField.pancard,
          registrationField.password,
          session,
          registrationField.referrerId,
          "Borrower",
          userLocation.latitude,
          userLocation.longitude,
          trackingId,
          relationshipId
        );

        setField(false);
        setSubmitOtp(true);
        localStorage.setItem("id", response.responseData.userId);
        localStorage.setItem("timemilll", new Date().getTime());
      } else {
        setError("Please enter a valid OTP");
        toastrWarning("Please enter a valid OTP");
      }
    } catch (error) {
      const errMsg = error.response?.data?.errorMessage || "An error occurred during OTP validation";
      setError(errMsg);
      toastrWarning(errMsg);
    }
  };

  useEffect(() => {
    if (/\d/.test(registrationField.pancard)) {
      setRegistrationField((prev) => ({
        ...prev,
        pancarderror: "Enter characters only!",
      }));
    } else {
      setRegistrationField((prev) => ({
        ...prev,
        pancarderror: "",
      }));
    }
  }, [registrationField.pancard]);

  useEffect(() => {
    clearLastVisitedUrls();
    const searchParams = new URLSearchParams(window.location.search);
    const refParam = searchParams.get("ref");
    const trackingId = searchParams.get("trackingId");
    const relationshipId = searchParams.get("relationshipId");
    if (trackingId) localStorage.setItem("trackingId", trackingId);
    if (relationshipId) localStorage.setItem("relationshipId", relationshipId);
    if (trackingId) setTrackingId(trackingId);
    if (relationshipId) setRelationshipId(relationshipId);

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

    // Check for Gmail pre-fill (takes priority over localData)
    try {
      const raw = sessionStorage.getItem("gmail_prefill");
      if (raw) {
        const prefill = JSON.parse(raw);
        if (prefill.role === "BORROWER" && prefill.emailVerified && prefill.email && prefill.mobile) {
          setGmailPrefill(prefill);
          setRegistrationField(prev => ({
            ...prev,
            email: prefill.email || "",
            mobile: prefill.mobile || "",
            pancard: prefill.name || "",
          }));
          return; // skip localData pre-fill
        } else {
          sessionStorage.removeItem("gmail_prefill");
        }
      }
    } catch (e) { /* ignore */ }

    if (localData && Object.keys(localData).length > 0) {
      setRegistrationField((prev) => ({
        ...prev,
        email: localData.email || prev.email,
        mobile: localData.number || prev.mobile,
        pancard: localData.name || prev.pancard,
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
                        OxyLoans account to start borrowing
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {" "}
                    {field ? (
                      <>
                        {" "}
                        <h1>Register as a Borrower </h1>
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
                          maxLength={100}
                          onChange={handlechange}
                          value={registrationField.pancard}
                        />
                        <span className="profile-views">
                          <i className="fas fa-user-circle" />
                        </span>
                        {registrationField.pancarderror && (
                          <div className="error">{registrationField.pancarderror}</div>
                        )}
                      </div>
                      {gmailPrefill && (
                        <div style={{background:"#e8f5e9",border:"1px solid #4caf50",borderRadius:"6px",padding:"10px 14px",marginBottom:"12px",color:"#2e7d32",fontWeight:"500"}}>
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
                          maxLength={100}
                          value={registrationField.email}
                          readOnly={!!gmailPrefill}
                          onChange={gmailPrefill ? undefined : handlechange}
                          style={gmailPrefill ? { background: "#f5f5f5", cursor: "not-allowed" } : {}}
                        />
                        <span className="profile-views">
                          <i className="fas fa-envelope" />
                        </span>
                        {registrationField.emailerror && (
                          <div className="error">{registrationField.emailerror}</div>
                        )}
                      </div>
                      <div className="form-group">
                        <label>
                          Password {gmailPrefill
                            ? <span style={{color:"#888",fontWeight:"normal",fontSize:"0.85em"}}>(optional — you'll sign in with Google)</span>
                            : <span className="login-danger">*</span>}
                        </label>
                        <input
                          ref={inputRef}
                          className="form-control pass-input"
                          type="password"
                          name="password"
                          maxLength={15}
                          value={registrationField.password}
                          onChange={handlechange}
                        />
                        <ReactPasswordToggleIcon
                          inputRef={inputRef}
                          showIcon={showIcon}
                          hideIcon={hideIcon}
                        />
                        {registrationField.passworderror && (
                          <div className="error">{registrationField.passworderror}</div>
                        )}
                      </div>
                      <p className="reffertext">
                        If you are referred by an existing Borrower,Please
                        enter his/her referrer id ( EX : BR100001)
                      </p>
                      <div className="form-group">
                        <label>Enter the referrer ID</label>
                        <input
                          // ref={inputRef2}
                          className="form-control pass-confirm"
                          type="text"
                          name="referrerId"
                          value={registrationField.referrerId}
                          onChange={handlechange}
                          onBlur={(e) => validateReferrerId(e.target.value)}
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
                          Enter Mobile Number
                          <span className="login-danger"> *</span>
                        </label>
                        {/* <input className="form-control pass-confirm" type="text" /> */}
                        <input
                          className="form-control"
                          type="tel"
                          name="mobile"
                          maxLength={10}
                          onChange={gmailPrefill ? undefined : handlechange}
                          onKeyPress={gmailPrefill ? undefined : handleKeyPressNumber}
                          value={registrationField.mobile}
                          readOnly={!!gmailPrefill}
                          style={gmailPrefill ? { background: "#f5f5f5", cursor: "not-allowed" } : {}}
                        />
                        <span className="profile-views">
                          <i className="fas fa-phone" />
                        </span>
                        {registrationField.mobileerror && (
                          <div className="error">
                            {registrationField.mobileerror}
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
                          <div className="dont-have text-center my-2">
                            {resendTimer > 0 ? (
                              <span className="text-muted">
                                Resend OTP in <strong>{resendTimer}s</strong>
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-link p-0 text-primary fw-bold"
                                onClick={handleResendOtp}
                                disabled={loadingResend}
                              >
                                {loadingResend ? "Sending..." : "Resend OTP"}
                              </button>
                            )}
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
                  <div className="dont-have">
                    Register as a <Link to="/register"> Lender</Link>
                  </div>
                  {/* <Link to="#">
                    <i className="fab fa-google-plus-g" />
                  </Link> */}
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
