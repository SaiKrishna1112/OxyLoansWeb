import React, { useEffect, useRef, useState } from "react";
import { registerImage } from "../../imagepath";

import { passwordupdated } from "../../HttpRequest/beforelogin";
import ReactPasswordToggleIcon from "react-password-toggle-icon";
import { registersuccess } from "../Base UI Elements/SweetAlert";
import FeatherIcon from "feather-icons-react/build/FeatherIcon";
import { toastrError } from "../Base UI Elements/Toast";

const ForgotPassword = () => {
  const [email, setemail] = useState({
    emailid: "",
    error: "",
    data: {},
    emailvaild: false,
    emailToken: "",
    email: "",
    password: "",
    passworderror: "",
    isvaild: true,
    confirmpassword: "",

  });
  const [emailisvaild, setemailisvaild] = useState(true);
  const handlechange = (event) => {
    const { name, value } = event.target; // Correct the typo: event.target instead of event.traget
    setemail({
      ...email,
      [name]: value,
    });
  };

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

  let inputRef1 = useRef();
  const showIcon1 = () => (
    <i className="feather feather-eye" aria-hidden="true">
      <FeatherIcon icon="eye" />
    </i>
  );
  const hideIcon1 = () => (
    <i className="feather feather-eye-slash" aria-hidden="true">
      <FeatherIcon icon="eye-off" />
    </i>
  );

  useEffect(() => {
    const urlemail = new URLSearchParams(window.location.search);
    const email = urlemail.get("email");

    const emailToken = urlemail.get("emailToken");

    setemail((prestate) => ({
      ...prestate,
      email: email,
      emailToken: emailToken,
    }));
  }, []);

  const handlepassword = async () => {
    // if(email.password === "" && email.confirmpassword ===""){

    // }
    if (email.password === email.confirmpassword) {
      try {
        const response = await passwordupdated(
          email.emailToken,
          email.email,
          email.password,
          email.confirmpassword
        );

        console.log(response); // Log the response

        if (response.status === 200) {
          registersuccess("Password is successfully updated.");
        } else {
          // If the update fails, set the error message received from the server

          toastrError(response.response.data.errorMessage);
        }
      } catch (error) {
        // Log and handle errors
        // console.log(error.response.data.errorMessage);
        toastrError(error.response.data.errorMessage);
        // console.error(error);
      }
    } else {
      // If passwords don't match, set an error message
      // setemail({
      //   ...email,
      //   error: "Password and confirm password must be the same",
      // });
      toastrError("Password and confirm password must be the same");
    }
  };

  useEffect(() => {
    if (email.password === "" || email.confirmpassword === "") {
      setemail((prestate) => ({
        ...prestate,
        isvaild: true
      }))
    } else {
      setemail((prestate) => ({
        ...prestate,
        isvaild: false
      }))
    }
  }, [email.password, email.confirmpassword])

  return (
    <>
      {/* Main Wrapper */}
      <div className="main-wrapper login-body">
        <div className="login-wrapper">
          <div className="container">
            <div className="loginbox">
              <div className="login-left">
                <img
                  className="img-fluid  h-100"
                  src={registerImage}
                  alt="Logo"
                />
              </div>
              <div className="login-right">
                <div className="login-right-wrap">
                  {/* Form */}
                  {/* <form action="./login"> */}

                  <div>
                    <h1 className="text-center">Reset Password.   </h1>
                    <p></p>
                    {/* <p className="account-subtitle">
                      Enter the email address associated with your account and
                      we'll send you a link to reset your password
                    </p> */}
                    <p></p>
                    {/* Form */}
                    {/* <form action="./login"> */}
                    <div className="form-group">
                      <label>
                        Email address <span className="login-danger">*</span>
                      </label>
                      <input
                        className="form-control"
                        type="email"
                        name="emailid"
                        value={email.email}
                      />
                      <span className="profile-views">
                        <i className="fas fa-envelope" />
                      </span>
                    </div>
                    <div className="form-group">
                      <label>
                        Password <span className="login-danger">*</span>
                      </label>
                      <input
                        className="form-control"
                        ref={inputRef}
                        type="text"
                        name="password"
                        onChange={handlechange}
                      />
                      {/* <span className="profile-views">
                        <i className="fas fa-envelope" />
                      </span> */}
                      <ReactPasswordToggleIcon
                        inputRef={inputRef}
                        showIcon={showIcon}
                        hideIcon={hideIcon}
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        Confirm password <span className="login-danger">*</span>
                      </label>
                      <input
                        className="form-control"
                        ref={inputRef1}
                        type="text"
                        name="confirmpassword"
                        onChange={handlechange}
                      />

                      <ReactPasswordToggleIcon
                        inputRef={inputRef1}
                        showIcon={showIcon1}
                        hideIcon={hideIcon1}
                      />
                      {/* <span className="profile-views">
                        <i className="fas fa-envelope" />
                      </span> */}
                    </div>
                    {email.error && (
                      <div className="errormessage">{email.error}</div>
                    )}
                    {email.passworderror && (
                      <div className="errormessage">{email.passworderror}</div>
                    )}
                    <div className="form-group">
                      <button
                        className="btn btn-primary btn-block"
                        type="submit"
                        onClick={handlepassword}
                        disabled={email.isvaild}
                      >
                        Reset My Password
                      </button>
                    </div>
                  </div>

                  {/* </form> */}
                  {/* /Form */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
