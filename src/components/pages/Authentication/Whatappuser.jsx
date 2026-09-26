import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import { BsWhatsapp } from "react-icons/bs";

import "./user.css";
import { handelapidata } from "../../HttpRequest/beforelogin";
import { saveLoginSession } from "../../HttpRequest/aiAdminApi";
import { getPostLoginRedirectUrl } from "../../../utils/redirectUtils";
import { toastrError, toastrSuccess } from "../Base UI Elements/Toast";

const Whatappuser = ({ data }) => {
  const [data1, setAppData] = useState(data);
  const [loadingId, setLoadingId] = useState(null);
  const history = useNavigate();

  useEffect(() => {
    const iswhatsAppLogin = sessionStorage.getItem("whatAppLoginMultipleUser");
    if (iswhatsAppLogin) {
      try {
        const getdata = JSON.parse(sessionStorage.getItem("whatsAppLoginUsers"));
        if (getdata && Array.isArray(getdata) && getdata.length > 0) {
          setAppData(getdata);
        }
      } catch (err) {
        console.error("Error parsing stored multiple users:", err);
      }
    }
  }, []);

  const handelapi = async (userId) => {
    setLoadingId(userId);
    try {
      const response = await handelapidata(userId);
      const resData = response.data;
      const accessToken = response.headers?.accesstoken;

      if (accessToken) {
        sessionStorage.setItem("accessToken", accessToken);
        localStorage.setItem("accessToken", accessToken);
        sessionStorage.setItem("userId", resData.id);
        localStorage.setItem("userId", resData.id);
        sessionStorage.setItem("tokenTime", resData.tokenGeneratedTime);
        localStorage.setItem("primaryType", resData.primaryType);
        sessionStorage.setItem("primaryType", resData.primaryType);
        sessionStorage.setItem("whatAppLoginMultipleUser", true);
        sessionStorage.setItem("whatsAppLoginUsers", JSON.stringify(data1));
        saveLoginSession(response);
        toastrSuccess("Login Success!");

        const pType = resData.primaryType;
        if (pType === "LENDER") {
          history(getPostLoginRedirectUrl(`/lenderAIDashboard/${resData.id}`, pType));
        } else if (["ADMIN", "SUPERADMIN", "HELPDESKADMIN", "PRIMARYADMIN"].includes(pType)) {
          history(getPostLoginRedirectUrl("/oxyloansadmindashboard", pType));
        } else if (pType === "BORROWER") {
          history(getPostLoginRedirectUrl("/borrowerDashboard", pType));
        } else {
          history("/");
        }
      } else {
        const errMsg = response.response?.data?.errorMessage || "Login failed for selected account";
        toastrError(errMsg);
      }
    } catch (error) {
      toastrError(error?.message || "An error occurred during account login");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="whatappuser-wrap">
      <div className="whatappuser-header">
        <div className="whatappuser-phone-pill">
          <BsWhatsapp size={14} color="#25D366" />
          <span>Multiple Accounts Linked</span>
        </div>
        <h2 className="whatappuser-title">Select Your Account</h2>
        <p className="whatappuser-sub">
          Multiple profiles are registered with your WhatsApp number. Choose the profile you wish to log into.
        </p>
      </div>

      <div className="whatappuser-grid">
        {data1 && data1.length > 0 ? (
          data1.map((userData, index) => {
            const isLender =
              userData.primaryType === "LENDER" ||
              (userData.userId && userData.userId.toUpperCase().startsWith("LR"));
            const isBorrower =
              userData.primaryType === "BORROWER" ||
              (userData.userId && userData.userId.toUpperCase().startsWith("BR"));
            const roleClass = isLender ? "lender" : isBorrower ? "borrower" : "admin";
            const roleName = isLender ? "Lender" : isBorrower ? "Borrower" : "Admin";
            const isLoading = loadingId === userData.userId;

            return (
              <div
                key={index}
                className={`whatappuser-card is-${roleClass}`}
              >
                <div>
                  <div className="whatappuser-card-top">
                    <span className={`whatappuser-role-badge ${roleClass}`}>
                      <FeatherIcon
                        icon={isLender ? "trending-up" : isBorrower ? "user" : "shield"}
                        size={11}
                      />
                      {roleName}
                    </span>
                    <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>
                      #{index + 1}
                    </span>
                  </div>

                  <h3 className="whatappuser-id">{userData.userId}</h3>

                  <div className="whatappuser-details">
                    <div className="whatappuser-detail-row" title={userData.name}>
                      <FeatherIcon icon="user" size={13} />
                      <span className="whatappuser-detail-text bold">
                        {userData.name}
                      </span>
                    </div>

                    <div className="whatappuser-detail-row" title={userData.email}>
                      <FeatherIcon icon="mail" size={13} />
                      <span className="whatappuser-detail-text">
                        {userData.email}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className={`whatappuser-login-btn ${roleClass}-btn`}
                  disabled={loadingId !== null}
                  onClick={() => handelapi(userData.userId)}
                >
                  {isLoading ? (
                    <div className="spinner-border spinner-border-sm text-light" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <>
                      Login as {roleName} <FeatherIcon icon="arrow-right" size={14} />
                    </>
                  )}
                </button>
              </div>
            );
          })
        ) : (
          <div className="text-center text-muted p-4">No accounts found.</div>
        )}
      </div>

      <div className="whatappuser-footer">
        <button
          type="button"
          className="whatappuser-back-link"
          onClick={() => {
            sessionStorage.removeItem("whatAppLoginMultipleUser");
            sessionStorage.removeItem("whatsAppLoginUsers");
            window.location.reload();
          }}
        >
          <FeatherIcon icon="arrow-left" size={14} />
          Use a different WhatsApp number
        </button>
      </div>
    </div>
  );
};

export default Whatappuser;
