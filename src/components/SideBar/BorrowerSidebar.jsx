import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Scrollbars } from "react-custom-scrollbars";

const BorrowerSidebar = (props) => {
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
                <li
                  className={`${
                    "/borrowerDashboard" === pathName ? "active" : ""
                  }`}
                >
                  <Link to="/borrowerDashboard">
                    <i className="fa-solid fa-gauge"></i>{" "}
                    <span> Dashboard </span>
                    <span className="menu-arrow"></span>
                  </Link>
                </li>

                <li
                  className={`${
                    "/borrowerProfile" === pathName ? "active" : ""
                  }`}
                >
                  <Link to="/borrowerProfile">
                    <i className="fa-solid fa-user"></i>
                    <span> Profile </span>
                    <span className="menu-arrow"></span>
                  </Link>
                </li>

                <li
                  className={`${
                    "/borrowerLoanRequestCreate" === pathName ||
                    "/borrowerRequestAmount" === pathName ||
                    "/borrowerLoansInitiated" === pathName ||
                    "/borrowerDisbursementAmount" === pathName ||
                    "/borrowerDisbursementInterestAmount" === pathName
                      ? "active submenu"
                      : "submenu"
                  }`}
                >
                  <Link
                    to="#"
                    className={
                      isSideMenu == "borrowerLoanRequests" ? "subdrop" : ""
                    }
                    onClick={() =>
                      toggleSidebar(
                        isSideMenu == "borrowerLoanRequests"
                          ? ""
                          : "borrowerLoanRequests",
                      )
                    }
                  >
                    <i className="fa-solid fa-hand-holding-dollar"></i>
                    <span> Loan Applications </span>
                    <span className="menu-arrow"></span>
                  </Link>
                  {isSideMenu == "borrowerLoanRequests" ? (
                    <ul
                      style={{
                        display:
                          isSideMenu == "borrowerLoanRequests"
                            ? "block"
                            : "none",
                      }}
                    >
                      <li>
                        <Link
                          to="/borrowerLoanRequestCreate"
                          className={`${
                            "/borrowerLoanRequestCreate" === pathName
                              ? "active"
                              : ""
                          }`}
                        >
                          Apply for a Loan
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/borrowerRequestAmount"
                          className={`${
                            "/borrowerRequestAmount" === pathName
                              ? "active"
                              : ""
                          }`}
                        >
                          My Loan Requests
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/borrowerLoansInitiated"
                          className={`${
                            "/borrowerLoansInitiated" === pathName
                              ? "active"
                              : ""
                          }`}
                        >
                          Offers Received Amount
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/borrowerDisbursementAmount"
                          className={`${
                            "/borrowerDisbursementAmount" === pathName
                              ? "active"
                              : ""
                          }`}
                        >
                          Disburse Loans
                        </Link>
                      </li>
                    </ul>
                  ) : (
                    ""
                  )}
                </li>

                <li
                  className={`${
                    "/borrowerenach" === pathName ||
                    "/borrowerloanstatement" === pathName ||
                    "/borrowerAgreedLoans" === pathName ||
                    "/borrowermyloanApplication" === pathName
                      ? "active submenu"
                      : "submenu"
                  }`}
                >
                  <Link
                    to="#"
                    className={isSideMenu == "myborrowings" ? "subdrop" : ""}
                    onClick={() =>
                      toggleSidebar(
                        isSideMenu == "myborrowings" ? "" : "myborrowings",
                      )
                    }
                  >
                    <i className="fa-solid fa-network-wired"></i>
                    <span> My Borrowings </span> <span className="menu-arrow" />
                  </Link>
                  {isSideMenu == "myborrowings" ? (
                    <ul
                      style={{
                        display:
                          isSideMenu == "myborrowings" ? "block" : "none",
                      }}
                    >
                      <li>
                        <Link
                          to="/borrowermyloanApplication"
                          className={`${
                            "/borrowermyloanApplication" === pathName
                              ? "active"
                              : ""
                          }`}
                        >
                          My Running Loans
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/borrowerloanstatement"
                          className={`${
                            "/borrowerloanstatement" === pathName
                              ? "active"
                              : ""
                          }`}
                        >
                          My Loan Status
                        </Link>
                      </li>

                      <li>
                        <Link
                          to="/borrowerAgreedLoans"
                          className={`${
                            "/borrowerAgreedLoans" === pathName ? "active" : ""
                          }`}
                        >
                          Agreed Loans
                        </Link>
                      </li>

                      <li>
                        <Link
                          to="/borrowerenach"
                          className={`${
                            "/borrowerenach" === pathName ? "active" : ""
                          }`}
                        >
                          Enach
                        </Link>
                      </li>
                    </ul>
                  ) : (
                    ""
                  )}
                </li>

                <li
                  className={`${
                    "/borrowerloanListing" === pathName ? "active" : ""
                  }`}
                >
                  <Link to="/borrowerloanListing">
                    <i className="fa-solid fa-user"></i>
                    <span> Loan Listing </span>
                    <span className="menu-arrow"></span>
                  </Link>
                </li>

                <li
                  className={`${
                    "/borrowerpayemi" === pathName ? "active" : ""
                  }`}
                >
                  <Link to="/borrowerpayemi">
                    <i className="fa-solid fa-user"></i>
                    <span> Pay EMI </span>
                    <span className="menu-arrow"></span>
                  </Link>
                </li>

                <li
                  className={`${
                    "/writetous" === pathName ||
                    "/emicalculator" === pathName ||
                    "/ticketHistory" === pathName ||
                    "/borrowerwriteTous" === pathName ||
                    "/borroweremicalculator" === pathName
                      ? "active submenu"
                      : "submenu"
                  }`}
                >
                  <Link
                    to="#"
                    className={isSideMenu == "HelpDesk" ? "subdrop" : ""}
                    onClick={() =>
                      toggleSidebar(isSideMenu == "HelpDesk" ? "" : "HelpDesk")
                    }
                  >
                    <i className="fa-solid fa-handshake-angle"></i>
                    <span> Help Desk</span> <span className="menu-arrow" />
                  </Link>
                  {isSideMenu == "HelpDesk" ? (
                    <ul
                      style={{
                        display: isSideMenu == "HelpDesk" ? "block" : "none",
                      }}
                    >
                      <li>
                        <Link
                          to="/borrowerwriteTous"
                          className={`${
                            "/borrowerwriteTous" === pathName ? "active" : ""
                          }`}
                        >
                          Write To us
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/borrowerTicketHistory"
                          className={`${
                            "/borrowerTicketHistory" === pathName
                              ? "active"
                              : ""
                          }`}
                        >
                          View Ticket History
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/borroweremicalculator"
                          className={`${
                            "/borroweremicalculator" === pathName
                              ? "active"
                              : ""
                          }`}
                        >
                          EMI Calculator
                        </Link>
                      </li>
                    </ul>
                  ) : (
                    ""
                  )}
                </li>
              </ul>
              {/* /Main Menu*/}
              {/* AI Insights */}
              <ul>
                <li className={`${"/ai/borrower-insights" === pathName ? "active" : ""}`}>
                  <Link to="/ai/borrower-insights">
                    <i className="fa-solid fa-brain"></i>
                    <span>AI Loan Insights</span>
                  </Link>
                </li>
              </ul>
              {/* /AI Insights */}
              {/* Management */}
              <ul>
                <li
                  className={`${
                    "/borrowerreferfriend" === pathName ||
                    "/borrowerreferstatus" === pathName ||
                    "/borrowerrunningLoans" === pathName ||
                    "/borrowermycontacts" === pathName ||
                    "/borrowermyearnings" === pathName
                      ? "active submenu"
                      : "submenu"
                  }`}
                >
                  <Link
                    to="#"
                    className={isSideMenu == "MyNetwork" ? "subdrop" : ""}
                    onClick={() =>
                      toggleSidebar(
                        isSideMenu == "MyNetwork" ? "" : "MyNetwork",
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
                          to="/borrowerreferfriend"
                          className={`${
                            "/borrowerreferfriend" === pathName ? "active" : ""
                          }`}
                        >
                          Refer A friend
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/borrowerreferstatus"
                          className={`${
                            "/borrowerreferstatus" === pathName ? "active" : ""
                          }`}
                        >
                          Referal Status
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/borrowermycontacts"
                          className={`${
                            "/borrowermycontacts" === pathName ? "active" : ""
                          }`}
                        >
                          My Contacts
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/borrowermyearnings"
                          className={`${
                            "/borrowermyearnings" === pathName ? "active" : ""
                          }`}
                        >
                          My Earning
                        </Link>
                      </li>
                    </ul>
                  ) : (
                    ""
                  )}
                </li>

                {/* Marketplace Menu Items */}
                <li className={`${"/post-loan-request" === pathName ? "active" : ""}`}>
                  <Link to="/post-loan-request">
                    <i className="fa-solid fa-store"></i>
                    <span>Post Loan Request</span>
                  </Link>
                </li>
                <li className={`${"/my-marketplace-loans" === pathName ? "active" : ""}`}>
                  <Link to="/my-marketplace-loans">
                    <i className="fa-solid fa-list"></i>
                    <span>My Marketplace Loans</span>
                  </Link>
                </li>
                <li className={`${pathName.startsWith("/borrower-consent") ? "active" : ""}`}>
                  <Link to="/my-marketplace-loans">
                    <i className="fa-solid fa-file-signature"></i>
                    <span>Consent Status</span>
                  </Link>
                </li>
                <li className={`${"/borrower-emi-schedule" === pathName ? "active" : ""}`}>
                  <Link to="/borrower-emi-schedule">
                    <i className="fa-solid fa-calendar-check"></i>
                    <span>EMI Schedule</span>
                  </Link>
                </li>
                <li className={`${"/my-oxyscore" === pathName ? "active" : ""}`}>
                  <Link to="/my-oxyscore">
                    <i className="fa-solid fa-chart-line"></i>
                    <span>My OxyScore</span>
                  </Link>
                </li>
                {/* End Marketplace Menu Items */}

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
export default BorrowerSidebar;
