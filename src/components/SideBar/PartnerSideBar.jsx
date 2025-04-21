import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Scrollbars } from "react-custom-scrollbars";

const PartnerSideBar = (props) => {
  const [isSideMenu, setSideMenu] = useState("");
  const [isSideMenuLevel, setSideMenuLevel] = useState("");
  const [isSideMenuLevel2, setSideMenuLevel2] = useState("");

  const toggleSidebar = (value) => {
    setSideMenu(value);
  };
  const toggleSidebar1 = (value) => {
    setSideMenuLevel(value);
  };
  const toggleSidebar2 = (value) => {
    setSideMenuLevel2(value);
  };

  useEffect(() => {
    function handleMouseOver(e) {
      e.stopPropagation();
      if (
        document.body.classList.contains("mini-sidebar") &&
        document.querySelector("#toggle_btn").offsetParent !== null
      ) {
        var targ = e.target.closest(".sidebar");
        if (targ) {
          document.body.classList.add("expand-menu");
          document
            .querySelectorAll(".subdrop + ul")
            .forEach((ul) => (ul.style.display = "block"));
        } else {
          document.body.classList.remove("expand-menu");
          document
            .querySelectorAll(".subdrop + ul")
            .forEach((ul) => (ul.style.display = "none"));
        }
        return false;
      }
    }

    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  useEffect(() => {
    $(document).on("change", ".sidebar-type-four input", function () {
      if ($(this).is(":checked")) {
        $(".sidebar").addClass("sidebar-eight");
        $(".sidebar-menu").addClass("sidebar-menu-eight");
        $(".menu-title").addClass("menu-title-eight");
        $(".header").addClass("header-eight");
        $(".header-left-two").addClass("header-left-eight");
        $(".user-menu").addClass("user-menu-eight");
        $(".dropdown-toggle").addClass("dropdown-toggle-eight");
        $(".white-logo").addClass("show-logo");
        $(
          ".header-one .header-left-one .logo:not(.logo-small), .header-five .header-left-five .logo:not(.logo-small)"
        ).addClass("hide-logo");
        $(".header-two .header-left-two .logo:not(.logo-small)").removeClass(
          "hide-logo"
        );
        $(".header-two .header-left-two .dark-logo").removeClass("show-logo");
      } else {
        $(".sidebar").removeClass("sidebar-eight");
        $(".sidebar-menu").removeClass("sidebar-menu-eight");
        $(".menu-title").removeClass("menu-title-eight");
        $(".header").removeClass("header-eight");
        $(".header-left-two").removeClass("header-left-eight");
        $(".user-menu").removeClass("user-menu-eight");
        $(".dropdown-toggle").removeClass("dropdown-toggle-eight");
        $(".white-logo").removeClass("show-logo");
        $(
          ".header-one .header-left-one .logo:not(.logo-small), .header-five .header-left-five .logo:not(.logo-small)"
        ).removeClass("hide-logo");
      }
    });
    return () => {};
  }, []);

  let pathName = useLocation().pathname;

  return (
    <>
      <div className="sidebar" id="sidebar">
        <Scrollbars
          autoHide
          autoHideTimeout={1000}
          autoHideDuration={200}
          autoHeight={true}
          autoHeightMin={0}
          autoHeightMax="95vh"
          thumbSize={300}
          universal={false}
          hideTracksWhenNotNeeded={true}
        >
          <div className="sidebar-inner slimscroll">
            <div id="sidebar-menu" className="sidebar-menu">
              {/* Main Menu */}
              <ul>
                <li className={`${"/patnerdashboard" === pathName ? "active" : ""}`}>
                  <Link to="/patnerdashboard">
                    <i className="fa-solid fa-gauge"></i>{" "}
                    <span> Dashboard </span>
                  </Link>
                </li>

                <li
                  className={`${
                    "/referaFriend" === pathName ||
                    "/myreferalStatus" === pathName ||
                    "/myreferalStatus" === pathName
                      ? "active submenu"
                      : "submenu"
                  }`}
                >
                  <Link
                    to="#"
                    className={isSideMenu == "Deals" ? "subdrop" : ""}
                    onClick={() =>
                      toggleSidebar(isSideMenu == "Deals" ? "" : "Deals")
                    }
                  >
                    <i className="fa-solid fa-network-wired"></i>
                    <span> Registred Users</span> <span className="menu-arrow" />
                  </Link>

                  
                  {isSideMenu == "Deals" ? (
                    <ul
                      style={{
                        display: isSideMenu == "Deals" ? "block" : "none",
                      }}
                    >
                      <li>
                        <Link
                          to="/referaFriend"
                          className={`${
                            "/reatenewdeal" === pathName ? "active" : ""
                          }`}
                        >
                        Registered Borrowers
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/myreferalStatus"
                          className={`${
                            "/myreferalStatus" === pathName ? "active" : ""
                          }`}
                        >
                       Registered Lenders
                        </Link>
                      </li>
                    </ul>
                  ) : (
                    ""
                  )}
                </li>

  <li className={`${"/GetListOfBorrowerDetails" === pathName ? "active" : ""}`}>
                  <Link to="/GetListOfBorrowerDetails">
                    <i className="fa-solid fa-gauge"></i>{" "}
                    <span> List Of Borrower </span>
               
                  </Link>
                </li>
                   <li className={`${"/Partneraccept" === pathName ? "active" : ""}`}>
                  <Link to="/Partneraccept">
                    <i className="fa-solid fa-user"></i>
                    <span> Partneraccept </span>
                    <span className="menu-arrow"></span>
                  </Link>
                </li>


                    <li className={`${"/partnerrequestInfo" === pathName ? "active" : ""}`}>
                  <Link to="/partnerrequestInfo">
                    <i className="fa-solid fa-user"></i>
                    <span> Request  Borrower </span>
                    <span className="menu-arrow"></span>
                  </Link>
                </li>

                {/* <li className={`${"/profile" === pathName ? "active" : ""}`}>
                  <Link to="/profile">
                    <i className="fa-solid fa-user"></i>
                    <span> Running Loans by Partner </span>
                    <span className="menu-arrow"></span>
                  </Link>
                </li> */}

                {/* <li className="menu-title">
                  <span></span>
                </li> */}
                <li
                  className={`${
                    "/loadwaletThroughQr" === pathName ||
                    "/loadwalletThroughVirtualAccount" === pathName
                      ? "active submenu"
                      : "submenu"
                  }`}
                >
                  {/* <Link
                    to="#"
                    className={isSideMenu == "LoadYourWallet" ? "subdrop" : ""}
                    onClick={() =>
                      toggleSidebar(
                        isSideMenu == "LoadYourWallet" ? "" : "LoadYourWallet"
                      )
                    }
                  >
                    <i className="fa-solid fa-qrcode"></i>
                    <span> Borrowers Loan Status </span>
                    <span className="menu-arrow"></span>
                  </Link> */}
                  {isSideMenu == "LoadYourWallet" ? (
                    <ul
                      style={{
                        display:
                          isSideMenu == "LoadYourWallet" ? "block" : "none",
                      }}
                    >
                      <li>
                        <Link
                          to="/loadwaletThroughQr"
                          className={`${
                            "/loadwaletThroughQr" === pathName ? "active" : ""
                          }`}
                        >
                        Approved
                            borrowers
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/loadwalletThroughVirtualAccount"
                          className={`${
                            "/loadwalletThroughVirtualAccount" === pathName
                              ? "active"
                              : ""
                          }`}
                        >
                      Rejected
                            borrowers
                        </Link>
                                          </li>
                                             <li>
                        <Link
                          to="/loadwalletThroughVirtualAccount"
                          className={`${
                            "/loadwalletThroughVirtualAccount" === pathName
                              ? "active"
                              : ""
                          }`}
                        >
                      Rejected
                            borrowers
                        </Link>
                      </li>
                  
                    </ul>
                  ) : (
                    ""
                  )}
                </li>


                <li
                  className={`${
                    "/myinterestEarning" === pathName ||
                    "/myhighvalueDeals" === pathName ||
                    "/myRunningDeals" === pathName ||
                    "/myholdamount" === pathName ||
                    "/earningCertificate" === pathName ||
                    "/loansStatement" === pathName ||
                    "/myclosedDeals" === pathName
                      ? "active submenu"
                      : "submenu"
                  }`}
                >
                  <Link
                    to="#"
                    className={isSideMenu == "Invoices" ? "subdrop" : ""}
                    onClick={() =>
                      toggleSidebar(isSideMenu == "Invoices" ? "" : "Invoices")
                    }
                  >
                    <i className="fas fa-clipboard" /> <span> Generate NDA & MOU</span>
                    <span className="menu-arrow" />
                  </Link>
          
                </li>
            

              </ul>
              {/* /Main Menu*/}
              {/* Management */}
              <ul>
                {/* <li className="menu-title">
                  <span>Refer A Friend</span>
                </li> */}
                <li
                  className={`${
                    "/referaFriend" === pathName ||
                    "/myreferalStatus" === pathName ||
                    "/myreferalStatus" === pathName
                      ? "active submenu"
                      : "submenu"
                  }`}
                >
                  <Link
                    to="#"
                    className={isSideMenu == "MyNetwork" ? "subdrop" : ""}
                    onClick={() =>
                      toggleSidebar(
                        isSideMenu == "MyNetwork" ? "" : "MyNetwork"
                      )
                    }
                  >
                    <i className="fa-solid fa-network-wired"></i>
                    <span> My Network</span> <span className="menu-arrow" />
                  </Link>
                  {isSideMenu == "MyNetwork" ? (
                    <ul
                      style={{
                        display: isSideMenu == "MyNetwork" ? "block" : "none",
                      }}
                    >
                      <li>
                        <Link
                          to="/referaFriend"
                          className={`${
                            "/referaFriend" === pathName ? "active" : ""
                          }`}
                        >
                          Refer A friend
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/myreferalStatus"
                          className={`${
                            "/myreferalStatus" === pathName ? "active" : ""
                          }`}
                        >
                          Referal Status
                        </Link>
                      </li>
       
                      <li>
                        <Link
                          to="/myEarnings"
                          className={`${
                            "/myEarnings" === pathName ? "active" : ""
                          }`}
                        >
                          My Earnings
                        </Link>
                      </li>
                    </ul>
                  ) : (
                    ""
                  )}
                </li>

                <li className={`${"/" === pathName ? "active" : ""}`}>
                  <Link to="/">
                    <i className="fa-solid fa-right-from-bracket"></i>
                    <span>Sign Out</span>
                  </Link>
                </li>
              </ul>
              {/* /UI Interface */}
            </div>
          </div>
        </Scrollbars>
      </div>
    </>
  );
};
export default PartnerSideBar;
