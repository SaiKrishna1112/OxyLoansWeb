import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { Scrollbars } from "react-custom-scrollbars";
import ReactGA from "react-ga";

const Sidebar = (props) => {
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

  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [window.location.pathname]);

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
                <li className={`${"/dashboard" === pathName ? "active" : ""}`}>
                  <Link to="/dashboard">
                    <i className="fa-solid fa-gauge"></i>{" "}
                    <span> Dashboard </span>
                    <span className="menu-arrow"></span>
                  </Link>
                </li>

                <li
                  className={`${
                    "/dashboardTransactions" === pathName ? "active" : ""
                  }`}
                >
                  <Link to="/dashboardTransactions">
                    <i className="fa-solid fa-right-to-bracket"></i>
                    <span> Transactions </span>
                    <span className="menu-arrow"></span>
                  </Link>
                </li>
                <li className={`${"/profile" === pathName ? "active" : ""}`}>
                  <Link to="/profile">
                    <i className="fa-solid fa-user"></i>
                    <span> Profile </span>
                    <span className="menu-arrow"></span>
                  </Link>
                </li>

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
                  <Link
                    to="#"
                    className={isSideMenu == "LoadYourWallet" ? "subdrop" : ""}
                    onClick={() =>
                      toggleSidebar(
                        isSideMenu == "LoadYourWallet" ? "" : "LoadYourWallet",
                      )
                    }
                  >
                    <i className="fa-solid fa-qrcode"></i>
                    <span> Load Your Wallet </span>
                    <span className="menu-arrow"></span>
                  </Link>
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
                          QR Scanner
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
                          Virtual Account
                        </Link>
                      </li>
                    </ul>
                  ) : (
                    ""
                  )}
                </li>

                <li
                  className={`${
                    "/regularRunningDeal" === pathName ||
                    "/regularEscrowDeals" === pathName ||
                    "/regularPersonalDeal" === pathName ||
                    "todaydeal" === pathName ||
                    "/viewCurrentDayDeals" === pathName
                      ? "active submenu"
                      : "submenu"
                  }`}
                >
                  <Link
                    to="#"
                    className={isSideMenu == "Subjects" ? "subdrop" : ""}
                    onClick={() =>
                      toggleSidebar(isSideMenu == "Subjects" ? "" : "Subjects")
                    }
                  >
                    <i className="fa-solid fa-chart-simple"></i>
                    <span> Ongoing Deals</span> <span className="menu-arrow" />
                  </Link>
                  {isSideMenu == "Subjects" ? (
                    <ul
                      style={{
                        display: isSideMenu == "Subjects" ? "block" : "none",
                      }}
                    >
                      {/* <li>
                        <Link
                          to="/viewCurrentDayDeals"
                          className={`${
                            "/viewCurrentDayDeals" === pathName ? "active" : ""
                          }`}
                        >
                          Today Deals
                        </Link>
                      </li> */}

                      <li>
                        <Link
                          to="/todaydeal"
                          className={`${
                            "/todaydeal" === pathName ? "active" : ""
                          }`}
                        >
                          Today Deals
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/regularRunningDeal"
                          className={`${
                            "/regularRunningDeal" === pathName ? "active" : ""
                          }`}
                        >
                          Running Deals
                        </Link>
                      </li>

                      <li>
                        <Link
                          to="/regularEscrowDeals"
                          className={`${
                            "/regularEscrowDeals" === pathName ? "active" : ""
                          }`}
                        >
                          Escrow Deals
                        </Link>
                      </li>
                      <li>
                        {/* <Link
                          to="/regularPersonalDeal"
                          className={`${
                            "/regularPersonalDeal" === pathName ? "active" : ""
                          }`}
                        >
                          Personal Deals
                        </Link> */}
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
                    <i className="fas fa-clipboard" /> <span> My Deals</span>
                    <span className="menu-arrow" />
                  </Link>
                  {isSideMenu == "Invoices" ? (
                    <ul
                      style={{
                        display: isSideMenu == "Invoices" ? "block" : "none",
                      }}
                    >
                      <li>
                        <Link
                          to="/myRunningDeals"
                          className={`${
                            "/myRunningDeals" === pathName ? "active" : ""
                          }`}
                        >
                          Participated Deals
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/myclosedDeals"
                          className={`${
                            "/myclosedDeals" === pathName ? "active" : ""
                          }`}
                        >
                          Closed Deals
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/myholdamount"
                          className={`${
                            "/myholdamount" === pathName ? "active" : ""
                          }`}
                        >
                          Hold Amount
                        </Link>
                      </li>

                      <li>
                        <Link
                          to="/myinterestEarning"
                          className={`${
                            "/myinterestEarning" === pathName ? "active" : ""
                          }`}
                        >
                          Interest Earnings
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/interestsDateWise"
                          className={`${
                            "/interestsDateWise" === pathName ? "active" : ""
                          }`}
                        >
                          View Interests Date Wise
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/myhighvalueDeals"
                          className={`${
                            "/myhighvalueDeals" === pathName ? "active" : ""
                          }`}
                        >
                          High Value Deals
                        </Link>
                      </li>

                      <li>
                        <Link
                          to="/earningCertificate"
                          className={`${
                            "/earningCertificate" === pathName ? "active" : ""
                          }`}
                        >
                          Financial Reports
                        </Link>
                      </li>

                      {/* <li>
                        <Link
                          to="/loansStatement"
                          className={`${
                            "/loansStatement" === pathName ? "active" : ""
                          }`}
                        >
                          loans Statement
                        </Link>
                      </li> */}
                    </ul>
                  ) : (
                    ""
                  )}
                </li>
                {/* P2P */}
                <li
                  className={`${
                    "/offerGivenList" === pathName ||
                    "/disburseLoans" === pathName
                      ? "active submenu"
                      : "submenu"
                  }`}
                >
                  <Link
                    to="#"
                    className={isSideMenu == "P2PLoans" ? "subdrop" : ""}
                    onClick={() =>
                      toggleSidebar(isSideMenu == "P2PLoans" ? "" : "P2PLoans")
                    }
                  >
                    <i className="fa-solid fa-hand-holding-dollar"></i>
                    <span> P2P Loans</span> <span className="menu-arrow" />
                  </Link>
                  {isSideMenu == "P2PLoans" ? (
                    <ul style={{ display: "block" }}>
                      <li>
                        <Link
                          to="/proximityLoans"
                          className={`${"/proximityLoans" === pathName ? "active" : ""}`}
                        >
                          Proximity Based Loans
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/offerGivenList"
                          className={`${"/offerGivenList" === pathName ? "active" : ""}`}
                        >
                          My Loan offers
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/disburseLoans"
                          className={`${"/disburseLoans" === pathName ? "active" : ""}`}
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
                    "/WalletToWallet" === pathName ||
                    "/walletToWalletHistory" === pathName ||
                    "/walletToWalletTransactionHistory" === pathName
                      ? "active submenu"
                      : "submenu"
                  }`}
                >
                  <Link
                    to="#"
                    className={isSideMenu == "WalletToWallet" ? "subdrop" : ""}
                    onClick={() =>
                      toggleSidebar(
                        isSideMenu == "WalletToWallet" ? "" : "WalletToWallet",
                      )
                    }
                  >
                    <i className="fa-solid fa-business-time"></i>
                    <span>Wallet to Wallet</span>
                    <span className="menu-arrow" />
                  </Link>
                  {isSideMenu == "WalletToWallet" ? (
                    <ul
                      style={{
                        display:
                          isSideMenu == "WalletToWallet" ? "block" : "none",
                      }}
                    >
                      <li>
                        <Link
                          to="/WalletToWallet"
                          className={`${
                            "/WalletToWallet" === pathName ? "active" : ""
                          }`}
                        >
                          Raise a Request
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/walletToWalletTransactionHistory"
                          className={`${
                            "/walletToWalletTransactionHistory" === pathName
                              ? "active"
                              : ""
                          }`}
                        >
                          View history
                        </Link>
                      </li>

                      <li>
                        <Link
                          to="/walletToWalletHistory"
                          className={`${
                            "/walletToWalletHistory" === pathName
                              ? "active"
                              : ""
                          }`}
                        >
                          Debit history
                        </Link>
                      </li>
                    </ul>
                  ) : (
                    ""
                  )}
                </li>
                <li
                  className={`${
                    "/withdrawdealfromDeal" === pathName ||
                    "/withdrawalFromWallet" === pathName ||
                    "/MywithdrawalHistory" === pathName
                      ? "active submenu"
                      : "submenu"
                  }`}
                >
                  <Link
                    to="#"
                    className={isSideMenu == "WithdrawFunds" ? "subdrop" : ""}
                    onClick={() =>
                      toggleSidebar(
                        isSideMenu == "WithdrawFunds" ? "" : "WithdrawFunds",
                      )
                    }
                  >
                    <i className="fa-solid fa-wallet"></i>
                    <span>Withdraw Funds</span> <span className="menu-arrow" />
                  </Link>
                  {isSideMenu == "WithdrawFunds" ? (
                    <ul
                      style={{
                        display:
                          isSideMenu == "WithdrawFunds" ? "block" : "none",
                      }}
                    >
                      <li>
                        <Link
                          to="/withdrawdealfromDeal"
                          className={`${
                            "/withdrawdealfromDeal" === pathName ? "active" : ""
                          }`}
                        >
                          Raise a Request
                        </Link>
                      </li>
                      {/* <li>
                        <Link
                          to="/withdrawalFromWallet"
                          className={`${
                            "/withdrawalFromWallet" === pathName ? "active" : ""
                          }`}
                        >
                          From Wallet
                        </Link>
                      </li> */}

                      <li>
                        <Link
                          to="/MywithdrawalHistory"
                          className={`${
                            "/MywithdrawalHistory" === pathName ? "active" : ""
                          }`}
                        >
                          My Withdrawal History
                        </Link>
                      </li>
                    </ul>
                  ) : (
                    ""
                  )}
                </li>

                <li
                  className={`${
                    "/mytransactions" === pathName ||
                    "/membershipHistory" === pathName
                      ? "active submenu"
                      : "submenu"
                  }`}
                >
                  <Link
                    to="#"
                    className={isSideMenu == "WalletTrans" ? "subdrop" : ""}
                    onClick={() =>
                      toggleSidebar(
                        isSideMenu == "WalletTrans" ? "" : "WalletTrans",
                      )
                    }
                  >
                    <i className="fa-solid fa-suitcase"></i>
                    <span>Wallet Transactions</span>
                    <span className="menu-arrow" />
                  </Link>
                  {isSideMenu == "WalletTrans" ? (
                    <ul
                      style={{
                        display: isSideMenu == "WalletTrans" ? "block" : "none",
                      }}
                    >
                      {/* <li>
                        <Link
                          to="/WalletToWallet"
                          className={`${
                            "/WalletToWallet" === pathName ? "active" : ""
                          }`}
                        >
                          Wallet To Wallet
                        </Link>
                      </li> */}

                      {/* <li>
                        <Link
                          to="/walletToWalletHistory"
                          className={`${
                            "/walletToWalletHistory" === pathName
                              ? "active"
                              : ""
                          }`}
                        >
                          Wallet To Wallet History
                        </Link>
                      </li> */}

                      <li>
                        <Link
                          to="/mytransactions"
                          className={`${
                            "/mytransactions" === pathName ? "active" : ""
                          }`}
                        >
                          My Transactions
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/membershipHistory"
                          className={`${
                            "/membershipHistory" === pathName ? "active" : ""
                          }`}
                        >
                          Membership History
                        </Link>
                      </li>
                    </ul>
                  ) : (
                    ""
                  )}
                </li>

                <li
                  className={`${
                    "/referaFriend" === pathName ||
                    "/myreferalStatus" === pathName ||
                    "/myreferalStatus" === pathName ||
                    "/lendercontacts" === pathName ||
                    "/myEarnings" === pathName
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
                          to="/referaFriend"
                          className={`${
                            "/referaFriend" === pathName ? "active" : ""
                          }`}
                        >
                          Refer a Friend
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/myreferalStatus"
                          className={`${
                            "/myreferalStatus" === pathName ? "active" : ""
                          }`}
                        >
                          Referral Status
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/lendercontacts"
                          className={`${
                            "/lendercontacts" === pathName ? "active" : ""
                          }`}
                        >
                          My Contacts
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

                <li
                  className={`${
                    "/writetous" === pathName ||
                    "/emicalculator" === pathName ||
                    "/ticketHistory" === pathName
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
                          to="/writetous"
                          className={`${
                            "/writetous" === pathName ? "active" : ""
                          }`}
                        >
                          Write to us
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/ticketHistory"
                          className={`${
                            "/ticketHistory" === pathName ? "active" : ""
                          }`}
                        >
                          Ticket History
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/emicalculator"
                          className={`${
                            "/emicalculator" === pathName ? "active" : ""
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

                <li
                  className={`${
                    "/configautoInvest" === pathName ||
                    "/autoInvestHistory" === pathName
                      ? "active submenu"
                      : "submenu"
                  }`}
                  style={{ display: "none" }}
                >
                  <Link
                    to="#"
                    className={isSideMenu == "AutoInvest" ? "subdrop" : ""}
                    onClick={() =>
                      toggleSidebar(
                        isSideMenu == "AutoInvest" ? "" : "AutoInvest",
                      )
                    }
                  >
                    <i className="fas fa-building" /> <span> Auto Invest</span>
                    <span className="menu-arrow" />
                  </Link>
                  {isSideMenu == "AutoInvest" ? (
                    <ul
                      style={{
                        display: isSideMenu == "AutoInvest" ? "block" : "none",
                      }}
                    >
                      <li>
                        <Link
                          to="/configautoInvest"
                          className={`${
                            "/configautoInvest" === pathName ? "active" : ""
                          }`}
                        >
                          Config Auto Invest
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/autoInvestHistory"
                          className={`${
                            "/autoInvestHistory" === pathName ? "active" : ""
                          }`}
                        >
                          Auto Invest History
                        </Link>
                      </li>
                    </ul>
                  ) : (
                    ""
                  )}
                </li>

                {/* Marketplace Menu Items */}
                {/* <li className={`${"/marketplace-loans" === pathName ? "active" : ""}`}>
                  <Link to="/marketplace-loans">
                    <i className="fa-solid fa-store"></i>
                    <span>Browse Loan Requests</span>
                  </Link>
                </li>
                <li className={`${"/nearby-borrowers" === pathName ? "active" : ""}`}>
                  <Link to="/nearby-borrowers">
                    <i className="fa-solid fa-location-dot"></i>
                    <span>Nearby Borrowers</span>
                  </Link>
                </li>
                <li className={`${"/my-offers" === pathName ? "active" : ""}`}>
                  <Link to="/my-offers">
                    <i className="fa-solid fa-handshake"></i>
                    <span>My Offers</span>
                  </Link>
                </li>
                <li className={`${"/lender-emi-dashboard" === pathName ? "active" : ""}`}>
                  <Link to="/lender-emi-dashboard">
                    <i className="fa-solid fa-calendar-check"></i>
                    <span>EMI Dashboard</span>
                  </Link>
                </li>
                <li className={`${"/escalation-dashboard" === pathName ? "active" : ""}`}>
                  <Link to="/escalation-dashboard">
                    <i className="fa-solid fa-shield-halved"></i>
                    <span>Escalation Tracker</span>
                  </Link>
                </li>
                <li className={`${"/smart-loan-match" === pathName ? "active" : ""}`}>
                  <Link to="/smart-loan-match">
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    <span>AI Smart Match</span>
                  </Link>
                </li> */}
                {/* End Marketplace Menu Items */}

                <li className={`${"/" === pathName ? "active" : ""}`}>
                  <Link
                    to="/"
                    onClick={() => {
                      localStorage.clear();
                      sessionStorage.clear();
                    }}
                  >
                    <i className="fa-solid fa-right-from-bracket"></i>
                    <span>Sign Out</span>
                  </Link>
                </li>
              </ul>
              {/*
              <ul></ul> */}
              {/* /UI Interface */}
            </div>
          </div>
        </Scrollbars>
      </div>
    </>
  );
};
export default React.memo(Sidebar);
