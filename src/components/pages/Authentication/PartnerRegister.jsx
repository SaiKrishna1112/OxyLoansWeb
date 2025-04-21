import React, { useRef, useState } from "react";
import { login } from "../../imagepath";
import { Link } from "react-router-dom";

import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

const PartnerRegister = () => {
  let inputRef = useRef();
  let inputRef2 = useRef();
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
  });

  const dispatch = useDispatch();

  const reduxStoreData = useSelector((data) => data.counter.userProfile);
  const handlechange = (event) => {
    const { name, value } = event.target;
    setdata({
      ...data,
      [name]: value,
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

    // Update the state with all the error messages at once
    setdata({
      ...data,
      ...errors,
    });
  };
  const handlesubmit1 = () => {
    const errors = {};

    if (data.smobilenumber === "") {
      errors.smobilenumbererror = "Please enter The Partner number";
    }
    if (data.partneremail === "") {
      errors.semailerror = "Please enter The Partner email";
    }
    if (data.sname === "") {
      errors.snameerror = "Please enter The Partner name";
    }

    // Update the state with all the error messages at once
    setdata({
      ...data,
      ...errors,
    });
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

                  {/* Form */}
                  {/* <form action="./login"> */}
                  {field ? (
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
                          type="number"
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
                          type="number"
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
                      <div className="form-group mb-0">
                        <button
                          className="btn btn-primary btn-block"
                          type="submit"
                          onClick={handlesubmit1}
                        >
                          Submit
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
