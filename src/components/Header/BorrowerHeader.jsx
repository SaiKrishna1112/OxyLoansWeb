import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  getUserDetails,
  getSessionExpireTime,
  getSessionRemainingSeconds,
} from "../HttpRequest/afterlogin";
import CountUp from "react-countup";
import { useSelector, useDispatch } from "react-redux";
import { fetchData } from "../Redux/Slice";
import { fetchDatadashboard } from "../Redux/SliceDashboard";

import {
  HandleWithFooter,
  WarningAlert,
  WarningAlertwithdrow,
} from "../pages/Base UI Elements/SweetAlert";
import {
  headericon05,
  avatar02,
  avatar11,
  avatar17,
  avatar13,
  headericon04,
  oxylogomobile,
  oxylogodashboard,
} from "../imagepath";
import NotificationBell from "../NotificationBell";

const BorrowerHeader = (profile) => {
  const dispatch = useDispatch();
  const reduxStoreData = useSelector((data) => data.counter.userProfile);
  const [dashboarddata, setdashboarddata] = useState({
    profileData: "",
  });

  const handlesidebar = () => {
    document.body.classList.toggle("mini-sidebar");
  };

  const handlesidebarmobilemenu = () => {
    document.body.classList.toggle("slide-nav");
  };

  useEffect(() => {
    const handleClick = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    };

    const maximizeBtn = document.querySelector(".win-maximize");
    maximizeBtn.addEventListener("click", handleClick);

    return () => {
      maximizeBtn.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
    const isValidToken = token && token !== "null" && token !== "undefined";
    if (!isValidToken) return;

    dispatch(fetchData());
    dispatch(fetchDatadashboard());
    getUserDetails().then((data) => {
      if (data && data.status == 200) {
        setdashboarddata({
          ...dashboarddata,
          profileData: data,
        });
      }
    }).catch(() => {});
  }, []);

  return (
    <>
      {/* Header */}
      <div className="header">
        {/* Logo */}
        <div className="header-left">
          <Link to="/dashboard" className="logo">
            <img src={oxylogodashboard} alt="Logo" />
          </Link>
          <Link to="/dashboard" className="logo logo-small">
            <img src={oxylogomobile} alt="Logo" width={30} height={30} />
          </Link>
        </div>
        {/* /Logo */}
        <div className="menu-toggle">
          <Link to="#" id="toggle_btn" onClick={handlesidebar}>
            <i className="fas fa-bars" />
          </Link>
        </div>
        {/* Search Bar */}
        <div className="top-nav-search" style={{ display: "none" }}>
          <form>
            <input
              type="text"
              className="form-control"
              placeholder="Search here"
            />
            <button className="btn" type="submit">
              <i className="fas fa-search" />
            </button>
          </form>
        </div>
        {/* /Search Bar */}
        {/* Mobile Menu Toggle */}
        <Link
          to="#"
          className="mobile_btn"
          id="mobile_btn"
          onClick={() => handlesidebarmobilemenu()}
        >
          <i className="fas fa-bars" />
        </Link>
        {/* /Mobile Menu Toggle */}
        {/* Header Right Menu */}

        <ul className="nav user-menu">
          {/* <li className="nav-item dropdown language-drop me-2">
            <div>
              <CountUp start={60} end={0} duration={60} prefix=" 30 : " />
            </div>
          </li> */}
          {/* Notifications */}

          <li className="nav-item dropdown noti-dropdown me-2 d-none">
            <Link
              to="#"
              className="dropdown-toggle nav-link header-nav-list"
              data-bs-toggle="dropdown"
            >
              <img src={headericon05} alt="" />
            </Link>
            <div className="dropdown-menu notifications">
              <div className="topnav-dropdown-header">
                <span className="notification-title">Notifications</span>
                <Link to="#" className="clear-noti">
                  Clear All
                </Link>
              </div>
              <div className="noti-content">
                <ul className="notification-list">
                  <li className="notification-message">
                    <Link to="#">
                      <div className="media d-flex">
                        <span className="avatar avatar-sm flex-shrink-0">
                          <img
                            className="avatar-img rounded-circle"
                            alt="User Image"
                            src={avatar02}
                          />
                        </span>
                        <div className="media-body flex-grow-1">
                          <p className="noti-details">
                            <span className="noti-title">Carlson Tech</span> has
                            approved{" "}
                            <span className="noti-title">your estimate</span>
                          </p>
                          <p className="noti-time">
                            <span className="notification-time">
                              4 mins ago
                            </span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li className="notification-message">
                    <Link to="#">
                      <div className="media d-flex">
                        <span className="avatar avatar-sm flex-shrink-0">
                          <img
                            className="avatar-img rounded-circle"
                            alt="User Image"
                            src={avatar11}
                          />
                        </span>
                        <div className="media-body flex-grow-1">
                          <p className="noti-details">
                            <span className="noti-title">
                              International Software Inc
                            </span>{" "}
                            has sent you a invoice in the amount of{" "}
                            <span className="noti-title">$218</span>
                          </p>
                          <p className="noti-time">
                            <span className="notification-time">
                              6 mins ago
                            </span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li className="notification-message">
                    <Link to="#">
                      <div className="media d-flex">
                        <span className="avatar avatar-sm flex-shrink-0">
                          <img
                            className="avatar-img rounded-circle"
                            alt="User Image"
                            src={avatar17}
                          />
                        </span>
                        <div className="media-body flex-grow-1">
                          <p className="noti-details">
                            <span className="noti-title">John Hendry</span> sent
                            a cancellation request{" "}
                            <span className="noti-title">Apple iPhone XR</span>
                          </p>
                          <p className="noti-time">
                            <span className="notification-time">
                              8 mins ago
                            </span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li className="notification-message">
                    <Link to="#">
                      <div className="media d-flex">
                        <span className="avatar avatar-sm flex-shrink-0">
                          <img
                            className="avatar-img rounded-circle"
                            alt="User Image"
                            src={avatar13}
                          />
                        </span>
                        <div className="media-body flex-grow-1">
                          <p className="noti-details">
                            <span className="noti-title">
                              Mercury Software Inc
                            </span>{" "}
                            added a new product{" "}
                            <span className="noti-title">
                              Apple MacBook Pro
                            </span>
                          </p>
                          <p className="noti-time">
                            <span className="notification-time">
                              12 mins ago
                            </span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="topnav-dropdown-footer">
                <Link to="#">View all Notifications</Link>
              </div>
            </div>
          </li>

          <li className="nav-item  has-arrow dropdown-heads ">
            <Link to="#" className="win-maximize maximize-icon">
              <img src={headericon04} alt="" />
            </Link>
          </li>
          <NotificationBell />
          {/* User Menu */}
          <li className="nav-item dropdown has-arrow new-user-menus">
            <Link
              to="#"
              className="dropdown-toggle nav-link"
              data-bs-toggle="dropdown"
            >
              <span className="user-img">
                <img
                  className="rounded-circle"
                  src="https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-512.png"
                  width={31}
                  alt="Ryan Taylor"
                />
                <div className="user-text text-wrap">
                  <h6>
                    {reduxStoreData?.length != 0
                      ? reduxStoreData?.firstName.charAt(0).toUpperCase() +
                      reduxStoreData?.firstName.slice(1).toLowerCase() ?? ""
                      : ""}
                    {reduxStoreData?.length != 0
                      ? localStorage.setItem(
                        "userName",
                        reduxStoreData?.firstName.charAt(0).toUpperCase() +
                        reduxStoreData?.firstName.slice(1).toLowerCase()
                      ) ?? ""
                      : ""}
                  </h6>
                </div>
              </span>
            </Link>
            <div className="dropdown-menu">
              <div className="user-header">
                <div className="avatar avatar-sm">
                  <img
                    src="https://cdn3.iconfinder.com/data/icons/avatars-flat/33/man_5-512.png"
                    alt="User Image"
                    className="avatar-img rounded-circle"
                  />
                </div>
                <div className="user-text">
                  <p className="text-muted mb-0">
                    BR
                    {reduxStoreData?.length !== 0
                      ? reduxStoreData?.userId ?? 0
                      : ""}
                  </p>

                  <p className="text-muted mb-0">BORROWER</p>
                </div>
              </div>
              <Link className="dropdown-item" to="/borrowerProfile">
                My Profile
              </Link>
              <Link className="dropdown-item" to="/borrowerRequestAmount">
                My Application
              </Link>

              <Link
                className="dropdown-item"
                to="/"
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                }}
              >
                Logout
              </Link>
            </div>
          </li>
          {/* /User Menu */}
        </ul>
        {/* /Header Right Menu */}
      </div>
      {/* /Header */}
    </>
  );
};

export default React.memo(BorrowerHeader);
