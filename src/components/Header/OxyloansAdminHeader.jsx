import React, { useEffect, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";



import { useSelector, useDispatch } from "react-redux";
import { fetchData } from "../Redux/Slice";
import { fetchDatadashboard } from "../Redux/SliceDashboard";

import { WarningAlert } from "../pages/Base UI Elements/SweetAlert";
import { headericon04, oxylogomobile, oxylogodashboard } from "../imagepath";
import { Tag } from "antd";

const OxyloansAdminHeader = (profile) => {
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const reduxStoreData = useSelector((data) => data.counter.userProfile);
//   const [dashboarddata, setdashboarddata] = useState({
//     profileData: "",
//     iswhatAppLogin: sessionStorage.getItem("whatAppLoginMultipleUser"),
//   });

//   const [currentPage, setCurrentPage] = useState("");
const userId=sessionStorage.getItem("userId")
const primaryType = localStorage.getItem("primaryType");
const displayRole = primaryType === "ADMIN" || userId == "6680" ? "ADMIN" : "HELP DESK ADMIN";

  const handlesidebar = () => {
    document.body.classList.toggle("mini-sidebar");
  };

  const handlesidebarmobilemenu = () => {
    document.body.classList.toggle("slide-nav");
  };

//   useEffect(() => {
//     const handleClick = () => {
//       if (!document.fullscreenElement) {
//         document.documentElement.requestFullscreen();
//       } else {
//         if (document.exitFullscreen) {
//           document.exitFullscreen();
//         }
//       }
//     };

//     const maximizeBtn = document.querySelector(".win-maximize");
//     maximizeBtn.addEventListener("click", handleClick);

//     return () => {
//       maximizeBtn.removeEventListener("click", handleClick);
//     };
//   }, []);

//   useEffect(() => {
//     dispatch(fetchData());
//     dispatch(fetchDatadashboard());
//     getUserDetails1().then((data) => {
//       if (data.request.status == 200) {
//         console.log("header", data.data);
//         // localStorage.setItem("userType", data.data.userDisplayId);
//         localStorage.setItem("groupName", data.data.groupName);
//         setdashboarddata({
//           ...dashboarddata,
//           profileData: data,
//         });
//       } else if (data.response.data.errorCode != "200") {
//         WarningAlert(data.response.data.errorMessage, "/");
//       }
//     });
//   }, []);

//   useMemo(() => {
//     const sessionsExpire = getSessionExpireTime();
//     if (sessionsExpire) {
//       WarningAlert("Your session is expiring in 5 minutes.", "/dashboard");
//     }
//   }, []);

//   useEffect(() => {
//     if (currentPage == "") {
//       setCurrentPage(location.pathname);
//       if (document.body.classList.contains("slide-nav")) {
//         document.body.classList.remove("slide-nav");
//       }
//     }
//   }, [location.pathname]);

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
          <Link to="#" id="toggle_btn"
            onClick={handlesidebar}
          >
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
          {/* <li className="nav-item  has-arrow dropdown-heads ">
            <Link to="#" className="win-maximize maximize-icon">
              <img src={headericon04} alt="" />
            </Link>
          </li> */}
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
                    {/* {reduxStoreData?.length != 0
                      ? reduxStoreData?.firstName.charAt(0).toUpperCase() +
                          reduxStoreData?.firstName.slice(1).toLowerCase() ?? ""
                      : ""} */}
                    {/* {reduxStoreData?.length != 0
                      ? localStorage.setItem(
                          "userName",
                          reduxStoreData?.firstName.charAt(0).toUpperCase() +
                            reduxStoreData?.firstName.slice(1).toLowerCase()
                        ) ?? ""
                      : ""} */}
                    <h6>
                      {" "}
                      {displayRole}{" "}
                      {/* {reduxStoreData?.length != 0
                        ? reduxStoreData?.userId
                        : ""} */}
                    </h6>
                  </h6>
                </div>
              </span>
            </Link>
            <div className="dropdown-menu">
          
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

export default React.memo(OxyloansAdminHeader);
