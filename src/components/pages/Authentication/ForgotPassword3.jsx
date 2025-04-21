import React, { useState } from "react";
import { login, registerImage } from "../../imagepath";
import * as api from "./api";
import { sendotpemail } from "../../HttpRequest/beforelogin";
import { toastrError, toastrSuccess } from "../Base UI Elements/Toast";
import { Link } from "react-router-dom";

const ForgotPassword3 = () => {
  const [email, setEmail] = useState({
    emailid: "",
    error: "",
    data: {},
  });

  const handlechange = (event) => {
    const { name, value } = event.target;
    setEmail({
      ...email,
      [name]: value,
    });
  };

  const handleresetpassword = async () => {
    const vaildatebu = api.vaildateemail(email.emailid);
    if (vaildatebu) {
      setEmail({
        ...email,
        error: vaildatebu,
      });
      return;
    }
    try {
      const sendOtpEmail = await sendotpemail(email.emailid);

      if (sendOtpEmail.status === 200) {
        setEmail({
          ...email,
          data: sendOtpEmail,
        });
        toastrSuccess("We've sent an email to reset the password.");
      } else {
        console.log(sendOtpEmail)
        toastrError(sendOtpEmail.response.data.errorMessage);
      }
    } catch (error) {
      setEmail({
        ...email,
        error: error.response.data.errorMessage,
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
                <img
                  className="img-fluid h-100"
                  src={registerImage}
                  alt="Logo"
                />
              </div>
              <div className="login-right">
                <div className="login-right-wrap">
                  <h1>Reset Password</h1>
                  <p className="account-subtitle">
                    Enter the email address associated with your account and
                    we'll send you a link to reset your password ?{" "}
                    <Link to="/">Login</Link>
                  </p>

                  <div className="form-group">
                    <label>
                      Email address
                      <span className="login-danger">*</span>
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      name="emailid"
                      onChange={handlechange}
                    />
                    <span className="profile-views">
                      <i className="fas fa-envelope" />
                    </span>
                  </div>
                  {email.error && (
                    <div className="text-danger">{email.error}</div>
                  )}
                  <div className="form-group">
                    <button
                      className="btn btn-primary btn-block"
                      type="submit"
                      onClick={handleresetpassword}
                    >
                      Reset My Password
                    </button>
                  </div>
                  <div className="form-group mb-0"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword3;
