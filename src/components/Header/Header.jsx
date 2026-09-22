import React, { useEffect, useState,useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

import {
  getUserDetails1,
    getToken,
} from "../HttpRequest/afterlogin";

import { useSelector, useDispatch } from "react-redux";
import { fetchData } from "../Redux/Slice";
import { fetchDatadashboard } from "../Redux/SliceDashboard";

import { headericon04, oxylogomobile, oxylogodashboard } from "../imagepath";
import { Tag } from "antd";
// import NotificationBell from "../NotificationBell";
import { MARKETPLACE_URL } from "../../config";
import { initWebPush } from "../../utils/fcmWebPush";

const Header = (profile) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const reduxStoreData = useSelector((data) => data.counter.userProfile);
  const [dashboarddata, setdashboarddata] = useState({
    profileData: "",
    iswhatAppLogin: sessionStorage.getItem("whatAppLoginMultipleUser"),
  });

  const [currentPage, setCurrentPage] = useState("");

  const isTestRecording = !!process.env.REACT_APP_REFERENCE_DATE;
  const displayLenderId = (isTestRecording && reduxStoreData?.userId === 27127) ? 72271 : reduxStoreData?.userId;
  const displayFirstName = (isTestRecording && reduxStoreData?.userId === 27127) ? "Pradeep Chakravarthy" : (reduxStoreData?.firstName ? reduxStoreData.firstName.charAt(0).toUpperCase() + reduxStoreData.firstName.slice(1).toLowerCase() : "");

   // In-app notification bell
    const [bellOpen, setBellOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const bellRef = useRef(null);

     const fetchNotifications = () => {
        const token = getToken();
        const userId = sessionStorage.getItem("userId") || reduxStoreData?.userId;
        if (!token || !userId) return;
        axios.get(`${MARKETPLACE_URL}/v1/ai/notifications?userId=${userId}&size=20`, { headers: { accessToken: token } })
          .then(res => {
            const raw = res.data?.data?.content || res.data?.content || [];
            const list = raw.map(n => ({
              ...n,
              read: n.readStatus === true,
              createdAt: n.createdDate || n.createdAt,
            }));
            setNotifications(list);
            setUnreadCount(list.filter(n => !n.read).length);
          }).catch(() => {});
        axios.get(`${MARKETPLACE_URL}/v1/ai/notifications/count/unread?userId=${userId}`, { headers: { accessToken: token } })
          .then(res => {
            if (typeof res.data?.data === "number") setUnreadCount(res.data.data);
          }).catch(() => {});
      };
    
      useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
      }, []);
    
      useEffect(() => {
        const userId = sessionStorage.getItem("userId") || reduxStoreData?.userId;
        const token = getToken();
        if (userId && token) {
          initWebPush(userId, token).catch(() => {});
        }
      }, [reduxStoreData?.userId]);
    
      useEffect(() => {
        const handler = (e) => { if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
      }, []);
    
      const markAllRead = () => {
        const token = getToken();
        const userId = sessionStorage.getItem("userId") || reduxStoreData?.userId;
        if (!token || !userId) return;
        axios.put(`${MARKETPLACE_URL}/v1/ai/notifications/read-all?userId=${userId}`, {}, { headers: { accessToken: token } })
          .then(() => { setUnreadCount(0); setNotifications(prev => prev.map(n => ({ ...n, read: true, readStatus: true }))); }).catch(() => {});
      };
    
      const markOneRead = (id) => {
        const token = getToken();
        const userId = sessionStorage.getItem("userId") || reduxStoreData?.userId;
        if (!token || !userId) return;
        axios.put(`${MARKETPLACE_URL}/v1/ai/notifications/${id}/read?userId=${userId}`, {}, { headers: { accessToken: token } })
          .then(() => { setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, readStatus: true } : n)); setUnreadCount(prev => Math.max(0, prev - 1)); }).catch(() => {});
      };
    
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
    getUserDetails1().then((data) => {
      if (data && data.status == 200) {
        localStorage.setItem("groupName", data.data.groupName);
        setdashboarddata({
          ...dashboarddata,
          profileData: data,
        });
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (currentPage == "") {
      setCurrentPage(location.pathname);
      if (document.body.classList.contains("slide-nav")) {
        document.body.classList.remove("slide-nav");
      }
    }
  }, [location.pathname]);

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
            <img src={oxylogomobile} alt="Logo" width={40} height={40} />
          </Link>
        </div>
        {/* /Logo */}
        <div className="menu-toggle">
          <Link to="#" id="toggle_btn" onClick={handlesidebar}>
            <i className="fas fa-bars" />
          </Link>
        </div>
        {/* Search Bar */}
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
          {/* <Link to="/todaydeal">
        <Tag      style={{height:'1.8rem' ,display:'flex',alignItems:'center'}} className="badge bg-info mx-2">Today
        Deals</Tag>
        </Link>
        <Link to="/myRunningDeals">
        <Tag      style={{height:'1.8rem' ,display:'flex',alignItems:'center' , backgroundColor: '#008f64',}}   className="badge bg-success-dark mx-2">My Participated Deals</Tag>
        </Link>
        <Link to="/membership">
        <Tag      style={{height:'1.8rem' ,display:'flex',alignItems:'center'}} className="badge bg-success mx-2">Get Membership</Tag>
        </Link> */}
          <li className="nav-item  has-arrow dropdown-heads ">
            <Link to="#" className="win-maximize maximize-icon">
              <img src={headericon04} alt="" />
            </Link>
          </li>

          {/* Notification Bell */}
          <li className="nav-item" ref={bellRef} style={{ position: "relative" }}>
            <button
              onClick={() => { setBellOpen(o => !o); if (!bellOpen) fetchNotifications(); }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 10px", position: "relative" }}
              title="Notifications"
            >
              <i className="far fa-bell" style={{ fontSize: 18, color: "#555" }} />
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: 4, right: 4,
                  background: "#ff4d4f", color: "#fff", borderRadius: "50%",
                  width: 16, height: 16, fontSize: 10, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1
                }}>{unreadCount > 9 ? "9+" : unreadCount}</span>
              )}
            </button>
            {bellOpen && (
              <div style={{
                position: "absolute", right: 0, top: "100%", zIndex: 9999,
                background: "#fff", borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                width: 340, maxHeight: 440, overflowY: "auto", border: "1px solid #f0f0f0"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid #f0f0f0" }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ background: "none", border: "none", color: "#1890ff", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: 24, textAlign: "center", color: "#8c8c8c", fontSize: 13 }}>No notifications yet</div>
                ) : (
                  notifications.slice(0, 20).map(n => (
                    <div
                      key={n.id}
                      onClick={() => { if (!n.read) markOneRead(n.id); }}
                      style={{
                        padding: "10px 14px", borderBottom: "1px solid #f5f5f5", cursor: "pointer",
                        background: n.read ? "#fff" : "#f0f7ff",
                        transition: "background 0.2s"
                      }}
                    >
                      <div style={{ fontWeight: n.read ? 500 : 700, fontSize: 13, color: "#262626", marginBottom: 2 }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: "#595959", lineHeight: 1.4 }}>{n.message}</div>
                      <div style={{ fontSize: 11, color: "#bfbfbf", marginTop: 4 }}>
                        {n.createdAt ? new Date(n.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </li>
          {/* /Notification Bell */}

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
                    {displayFirstName}
                    {reduxStoreData?.firstName
                      ? localStorage.setItem("userName", displayFirstName) ?? ""
                      : ""}
                    <h6>   LR {reduxStoreData?.length != 0
                      ? displayLenderId
                      : ""}</h6>
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
                    LR
                    {reduxStoreData?.length !== 0
                      ? displayLenderId ?? 0
                      : ""}
                  </p>

                  <p className="text-muted mb-0">
                    {reduxStoreData?.length !== 0
                      ? reduxStoreData?.groupName == "OXYMARCH09" ||
                        reduxStoreData?.groupName == "OxyPremiuimLenders"
                        ? "Oxy Founding"
                        : "NewLender"
                      : ""}
                  </p>
                  <p className="text-muted mb-0">
                    Wallet :
                    {((reduxStoreData?.lenderWalletAmount || 0) -
                      (reduxStoreData?.holdAmountInDealParticipation || 0) -
                      (reduxStoreData?.equityAmount || 0)).toFixed(2)}
                  </p>
                </div>
              </div>
              <Link className="dropdown-item" to="/profile">
                My Profile
              </Link>
              <Link className="dropdown-item" to="/myRunningDeals">
                My Deals
              </Link>
              {/* {dashboarddata.iswhatAppLogin == "true" && (
                <Link className="dropdown-item" to="/whatappuser">
                  Log out from LR43165
                </Link>
              )} */}

              {dashboarddata.iswhatAppLogin == "true" && (
                <Link className="dropdown-item" to="/whatappuser">
                  Logout as {displayFirstName}
                </Link>
              )}

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

export default React.memo(Header);
