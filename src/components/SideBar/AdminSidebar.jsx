import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Scrollbars } from "react-custom-scrollbars";

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
                <li className={`${"/dashboard" === pathName ? "active" : ""}`}>
                  <Link to="/dashboard">
                    <i className="fa-solid fa-gauge"></i>{" "}
                    <span> Dashboard </span>
                    <span className="menu-arrow"></span>
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
                    <span> Deals</span> <span className="menu-arrow" />
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
                          Create New Deal
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/myreferalStatus"
                          className={`${
                            "/myreferalStatus" === pathName ? "active" : ""
                          }`}
                        >
                          View & Edit Deals
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/lendercontacts"
                          className={`${
                            "/lendercontacts" === pathName ? "active" : ""
                          }`}
                        >
                          View Equity Deals
                        </Link>
                      </li>

                      <li>
                        <Link
                          to="/myEarnings"
                          className={`${
                            "/myEarnings" === pathName ? "active" : ""
                          }`}
                        >
                          View Escrow Deals
                        </Link>
                      </li>

                      <li>
                        <Link
                          to="/myEarnings"
                          className={`${
                            "/myEarnings" === pathName ? "active" : ""
                          }`}
                        >
                          View Test Deals
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/myEarnings"
                          className={`${
                            "/myEarnings" === pathName ? "active" : ""
                          }`}
                        >
                          View Personal Deals
                        </Link>
                      </li>
                    </ul>
                  ) : (
                    ""
                  )}
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
                        isSideMenu == "LoadYourWallet" ? "" : "LoadYourWallet"
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
                          Through QR
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
                          Through Virtual Account
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
                    "/regularPersonalDeal" === pathName
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
                    <i className="fas fa-book-reader" />{" "}
                    <span> Ongoing Deals</span> <span className="menu-arrow" />
                  </Link>
                  {isSideMenu == "Subjects" ? (
                    <ul
                      style={{
                        display: isSideMenu == "Subjects" ? "block" : "none",
                      }}
                    >
                      <li>
                        <Link
                          to="/regularRunningDeal"
                          className={`${
                            "/regularRunningDeal" === pathName ? "active" : ""
                          }`}
                        >
                          Regular Running Deals
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/regularEscrowDeals"
                          className={`${
                            "/regularEscrowDeals" === pathName ? "active" : ""
                          }`}
                        >
                          Regular Escrow Deals
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/regularPersonalDeal"
                          className={`${
                            "/regularPersonalDeal" === pathName ? "active" : ""
                          }`}
                        >
                          Personal Deals
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
                          Running Deals
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
                          My Interest Earning
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
                          Earning Certificate
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
                        isSideMenu == "WithdrawFunds" ? "" : "WithdrawFunds"
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
                          From Deals
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/withdrawalFromWallet"
                          className={`${
                            "/withdrawalFromWallet" === pathName ? "active" : ""
                          }`}
                        >
                          From Wallet
                        </Link>
                      </li>

                      <li>
                        <Link
                          to="/MywithdrawalHistory"
                          className={`${
                            "/MywithdrawalHistory" === pathName ? "active" : ""
                          }`}
                        >
                          My Withdraw History
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
                    "/membershipHistory" === pathName ||
                    "/walletToWalletHistory" === pathName ||
                    "/WalletToWallet" === pathName
                      ? "active submenu"
                      : "submenu"
                  }`}
                >
                  <Link
                    to="#"
                    className={isSideMenu == "WalletTrans" ? "subdrop" : ""}
                    onClick={() =>
                      toggleSidebar(
                        isSideMenu == "WalletTrans" ? "" : "WalletTrans"
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
                      <li>
                        <Link
                          to="/WalletToWallet"
                          className={`${
                            "/WalletToWallet" === pathName ? "active" : ""
                          }`}
                        >
                          Wallet To Wallet
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
                          Wallet To Wallet History
                        </Link>
                      </li>

                      <li>
                        <Link
                          to="/mytransactions"
                          className={`${
                            "/mytransactions" === pathName ? "active" : ""
                          }`}
                        >
                          Wallet Transactions
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
                          Write To us
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/ticketHistory"
                          className={`${
                            "/ticketHistory" === pathName ? "active" : ""
                          }`}
                        >
                          View Ticket History
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
                >
                  <Link
                    to="#"
                    style={{ display: "none" }}
                    className={isSideMenu == "AutoInvest" ? "subdrop" : ""}
                    onClick={() =>
                      toggleSidebar(
                        isSideMenu == "AutoInvest" ? "" : "AutoInvest"
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
                          to="/lendercontacts"
                          className={`${
                            "/lendercontacts" === pathName ? "active" : ""
                          }`}
                        >
                          My contacts
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
                    "/adminBorrowerCharges" === pathName ||
                    "/adminProcessingFees" === pathName
                      ? "active submenu"
                      : "submenu"
                  }`}
                >
                  <Link
                    to="#"
                    className={isSideMenu === "BorrowerFees" ? "subdrop" : ""}
                    onClick={() =>
                      toggleSidebar(
                        isSideMenu === "BorrowerFees" ? "" : "BorrowerFees"
                      )
                    }
                  >
                    <i className="fa fa-rupee" />
                    <span> Borrower Fees</span>{" "}
                    <span className="menu-arrow" />
                  </Link>
                  {isSideMenu === "BorrowerFees" ? (
                    <ul
                      style={{
                        display:
                          isSideMenu === "BorrowerFees" ? "block" : "none",
                      }}
                    >
                      <li>
                        <Link
                          to="/adminBorrowerCharges"
                          className={`${
                            "/adminBorrowerCharges" === pathName ? "active" : ""
                          }`}
                        >
                          Borrower Charges
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/adminProcessingFees"
                          className={`${
                            "/adminProcessingFees" === pathName ? "active" : ""
                          }`}
                        >
                          Processing Fees
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
export default Sidebar;
