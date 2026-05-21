import React, { useEffect, useRef, useState } from "react";
import { registerImage } from "../../imagepath";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import ReactPasswordToggleIcon from "react-password-toggle-icon";
import * as api from "./api";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import OtpInput from "./OtpInput";
import { toastrWarning } from "../Base UI Elements/Toast";

export default function BorrowerRegister() {
  const inputRef = useRef();
  let inputRef2 = useRef();

  const navigate = useNavigate();
  const [field, setField] = useState(true);
  const [userLocation, setUserLocation] = useState({ latitude: null, longitude: null });

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
  const [submitotp, setSubmitOtp] = useState(false);
  const [error, setError] = useState("");
  const [response1, setResponse] = useState({});
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

  const handlechange = (event) => {
    const { name, value } = event.target;

    if (name === "referrerId" && value.trim() === "BR100001") {
      setRegistrationField((prev) => ({
        ...prev,
        referrerIderror: "Invalid Referrer Id",
      }));
    } else {
      setRegistrationField((prev) => ({
        ...prev,
        [name]: value,
        [`${name}error`]: "",
      }));
    }
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
    setRegistrationField((prevState) => ({
      ...prevState,
      emailerror: !registrationField.email ? "Please enter the email" : "",
      pancarderror: !registrationField.pancard ? "Please enter the Name" : "",
      mobileerror: !registrationField.mobile ? "Please enter the mobile" : "",
      passworderror: !registrationField.password
        ? "Please enter the password"
        : "",
    }));

    const validationError = api.validateRegisterInput(
      registrationField.email,
      registrationField.password,
      registrationField.mobile
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    if (
      !registrationField.emailerror &&
      !registrationField.pancarderror &&
      !registrationField.mobileerror &&
      !registrationField.passworderror
    ) {
      try {
        const RegisterResponse = await api.RegisterUser(
          registrationField.mobile
        );
        localStorage.setItem("seesion", RegisterResponse);
        localStorage.setItem("type", "Borrower");
        setResponse(RegisterResponse);
        setField(false);
        setError(null);
      } catch (error) {
        console.error("Error:", error.response?.data?.errorMessage);
        setError(error.response?.data?.errorMessage || "Registration failed");
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
          userLocation.longitude
        );

        setField(false);
        setSubmitOtp(true);
        localStorage.setItem("id", response.responseData.userId);
        localStorage.setItem("timemilll", new Date().getTime());
      } else {
        setError("Please enter a valid OTP");
      }
    } catch (error) {
      setError(
        error.response?.data?.errorMessage ||
          "An error occurred during OTP validation"
      );
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
    const searchParams = new URLSearchParams(window.location.search);
    const refParam = searchParams.get("ref");
    localStorage.setItem("uniqnumber", refParam || 0);

    if (refParam) {
      setRegistrationField((prev) => ({
        ...prev,
        referrerId: refParam,
      }));
    }else{
      setRegistrationField((prev) => ({
        ...prev,
        referrerId: 0,
      }));
    }

    if (localData) {
      setRegistrationField((prev) => ({
        ...prev,
        email: localData.email || "",
        mobile: localData.number || "",
        pancard: localData.name || "",
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
                          maxLength={30}
                          onChange={handlechange}
                          value={registrationField.pancard}
                          // onKeyPress={handleKeyPressNumberCapital}
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
                          onChange={handlechange}
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
                          Password <span className="login-danger">*</span>
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
                        {/* <input className="form-control pass-input" type="text" />
                                          <span className="profile-views feather-eye toggle-password">
                                              <FeatherIcon icon="eye" />
                                          </span> */}{" "}
                        {registrationField.passworderror && (
                          <div className="error">
                            {registrationField.passworderror}
                          </div>
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
                          // ref={inputRef2}
                          className="form-control"
                          type="tel"
                          name="mobile"
                          maxLength={10}
                          onChange={handlechange}
                          value={registrationField.mobile}
                          onKeyPress={handleKeyPressNumber}
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
