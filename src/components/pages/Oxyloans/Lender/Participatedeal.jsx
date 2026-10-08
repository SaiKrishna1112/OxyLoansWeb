import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import Footer from "../../../Footer/Footer";
import "./InvoiceGrid.css";
import "./Participatedeal.css";
import { handledetail, withdrawriaseapipay } from "../../../HttpRequest/afterlogin";
import { toastrError } from "../../Base UI Elements/Toast";
import { participatedapi } from "../../Base UI Elements/SweetAlert";
import Spining from "./Spining";
import { useDispatch, useSelector } from "react-redux";

const Participatedeal = () => {
  const [dealparticipationStatus, setDealparticipationStatus] = useState({
    status: false,
    message: "",
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const reduxStoreData = useSelector((data) => data.counter.userProfile);

  const [deal, setDeal] = useState({
    apidata: "",
    transactionNumber: "",
    accountType: "",
    lenderFeeId: "",
    feeParticipate: true,
    lenderReturnType: "",
    transferPrincipal: "",
    participatedAmount: "",
    bank: "BANKACCOUNT",
    wallet: "",
    urldealId: "",
    amountfromurl: "",
    spining: false,
    lenderRemainingPanLimit: 0,
    lenderTotalParticipationAmount: 0,
    lenderRemainingWalletAmount: 0,
    dealParticipatedAmount: 0,
    lenderParticipated: false,
    dealfeestatus: "",
    uservalidity: "",
    groupName: "",
    dealId: 0,
    currentUserWallet: 0,
  });

  useEffect(() => {
    const handledealinfo = async () => {
      const token =
        sessionStorage.getItem("accessToken") ||
        localStorage.getItem("accessToken");
      const urlparam = new URLSearchParams(window.location.search);
      const dealId = urlparam.get("dealId");

      // If user stops here without an active session or dealId, navigate directly to dashboard
      if (!token || !dealId) {
        navigate("/dashboard");
        return;
      }

      try {
        const response = await handledetail(dealId);

        if (!response || response.request?.status === 500 || !response.data) {
          navigate("/dashboard");
          return;
        }

        const newObj = { ...response.data };
        if (newObj.monthlyInterest != 0) {
          newObj.rateOfInterest = `${newObj.monthlyInterest}% PM`;
          newObj["payout"] = "MONTHLY";
          localStorage.setItem("choosenPayOutOption", "MONTHLY");
        } else if (newObj.quartlyInterest != 0) {
          newObj.rateOfInterest = `${newObj.quartlyInterest * 3}% PA`;
          newObj["payout"] = "QUARTERLY";
          localStorage.setItem("choosenPayOutOption", "QUARTELY");
        } else if (newObj.halfInterest != 0) {
          newObj.rateOfInterest = `${newObj.halfInterest * 6}% PA`;
          newObj["payout"] = "HALFYEARLY";
          localStorage.setItem("choosenPayOutOption", "HALFLY");
        } else if (newObj.yearlyInterest != 0) {
          newObj.rateOfInterest = `${newObj.yearlyInterest * 12}% PA`;
          newObj["payout"] = "YEARLY";
          localStorage.setItem("choosenPayOutOption", "YEARLY");
        } else if (newObj.endofthedealInterest != 0) {
          newObj.rateOfInterest = `${newObj.endofthedealInterest * 12}% PA`;
          newObj["payout"] = "ENDOFTHEDEAL";
          localStorage.setItem("choosenPayOutOption", "ENDOFTHEDEAL");
        } else if (newObj.perDayInterestRoi != 0 || newObj.perDayInterestAmount != null) {
          newObj.rateOfInterest =
            newObj.perDayInterestRoi == 0.0
              ? `${newObj.perDayInterestAmount} PD`
              : `${newObj.perDayInterestRoi}% PD`;
          newObj["payout"] = "PERDAY";
          localStorage.setItem("choosenPayOutOption", "PERDAY");
        }

        const participatedTotal = Number(newObj.lenderParticipationTotal || 0);
        setDeal((prev) => ({
          ...prev,
          apidata: newObj,
          urldealId: dealId,
          lenderRemainingPanLimit: newObj.lenderRemainingPanLimit,
          lenderTotalParticipationAmount: newObj.lenderTotalParticipationAmount,
          lenderRemainingWalletAmount: newObj.lenderRemainingWalletAmount,
          dealParticipatedAmount: participatedTotal,
          lenderParticipated:
            participatedTotal > 0 && newObj.lenderParticipationTotal != null,
          dealfeestatus: newObj.feeStatusToParticipate,
          uservalidity: newObj.lenderValidityStatus,
          groupName: newObj.groupName,
        }));
      } catch (err) {
        navigate("/dashboard");
      }
    };

    handledealinfo();
  }, [navigate]);

  const [withdrawriaseapi, setWithdrawriaseapi] = useState({
    message: "",
    status: null,
    amount: "",
  });

  useEffect(() => {
    const withdrawriase = async () => {
      const response = await withdrawriaseapipay(withdrawriaseapi.status);

      if (response.status === 200) {
        setWithdrawriaseapi((prev) => ({
          message: response.data.status,
          amount: response.data.amount,
          status: prev.status,
        }));
      } else {
        setWithdrawriaseapi((prev) => ({
          message: null,
          amount: "",
          status: prev.status,
        }));
      }
    };

    withdrawriase();
  }, [withdrawriaseapi.status]);

  useEffect(() => {
    const urlparam = new URLSearchParams(window.location.search);
    const amountFromURL = urlparam.get("amount");

    if (parseInt(amountFromURL) !== parseInt(withdrawriaseapi.amount)) {
      urlparam.set("amount", withdrawriaseapi.amount);
      window.history.replaceState({}, "", `${window.location.pathname}?${urlparam.toString()}`);
    }
  }, [withdrawriaseapi.amount]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDeal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Calculations for limits and already participated amount
  const alreadyParticipated = Number(deal.apidata?.lenderParticipationTotal || deal.dealParticipatedAmount || 0);
  const maxParticipationLimit = Number(deal.apidata?.lenderParticiptionLimit || 0);
  const dealAvailableLimit = Number(deal.apidata?.remainingAmountInDeal || 0);
  const minParticipationAmount = Number(deal.apidata?.minimumPaticipationAmount || 0);
  const hasAlreadyParticipated = alreadyParticipated > 0;

  // Remaining capacity the user can participate within their max limit
  const userRemainingCapacity = Math.max(0, maxParticipationLimit - alreadyParticipated);

  // Maximum amount the user can participate right now (bounded by remaining deal available limit and user limit)
  const maxAllowedToParticipate = Math.min(userRemainingCapacity, dealAvailableLimit);

  // Available wallet balance from Redux
  const availableWalletBalance =
    reduxStoreData && typeof reduxStoreData === "object"
      ? Number(reduxStoreData.lenderWalletAmount || 0) -
        Number(reduxStoreData.holdAmountInDealParticipation || 0) -
        Number(reduxStoreData.equityAmount || 0)
      : 0;

  const displayWalletBalance =
    availableWalletBalance > 0
      ? availableWalletBalance.toLocaleString("en-IN")
      : withdrawriaseapi.amount
      ? Number(withdrawriaseapi.amount).toLocaleString("en-IN")
      : deal.apidata?.remainingAmountInDeal
      ? Number(deal.apidata.remainingAmountInDeal).toLocaleString("en-IN")
      : "67,950";

  const enteredAmount = Number(deal.participatedAmount || 0);

  // Live validation function
  const getValidationWarning = () => {
    if (!deal.participatedAmount || enteredAmount <= 0) return null;

    if (availableWalletBalance > 0 && enteredAmount > availableWalletBalance) {
      return `Amount exceeds your available wallet balance of ₹ ${availableWalletBalance.toLocaleString("en-IN")}.`;
    }
    if (dealAvailableLimit > 0 && enteredAmount > dealAvailableLimit) {
      return `Amount exceeds the deal available limit of ₹ ${dealAvailableLimit.toLocaleString("en-IN")}.`;
    }
    if (maxParticipationLimit > 0 && enteredAmount + alreadyParticipated > maxParticipationLimit) {
      return `Total participation cannot exceed your maximum limit of ₹ ${maxParticipationLimit.toLocaleString(
        "en-IN"
      )} (You can participate up to ₹ ${userRemainingCapacity.toLocaleString("en-IN")} more).`;
    }
    if (
      !hasAlreadyParticipated &&
      minParticipationAmount > 0 &&
      dealAvailableLimit >= minParticipationAmount &&
      enteredAmount < minParticipationAmount
    ) {
      return `Minimum participation amount is ₹ ${minParticipationAmount.toLocaleString("en-IN")}.`;
    }
    return null;
  };

  const validationWarning = getValidationWarning();
  const isInputValid =
    enteredAmount > 0 &&
    validationWarning === null &&
    (availableWalletBalance <= 0 || enteredAmount <= availableWalletBalance);

  const dealparticipate = async () => {
    if (
      !deal.participatedAmount ||
      isNaN(enteredAmount) ||
      enteredAmount <= 0
    ) {
      toastrError("Please enter the amount that you wish to lend in this deal.");
      return false;
    }

    if (availableWalletBalance > 0 && enteredAmount > availableWalletBalance) {
      toastrError("Your participation amount is greater than your wallet balance.");
      return false;
    }

    if (dealAvailableLimit > 0 && enteredAmount > dealAvailableLimit) {
      toastrError(
        `Your participation amount (₹ ${enteredAmount.toLocaleString(
          "en-IN"
        )}) exceeds the Deal available limit of ₹ ${dealAvailableLimit.toLocaleString("en-IN")}.`
      );
      return false;
    }

    if (maxParticipationLimit > 0 && enteredAmount + alreadyParticipated > maxParticipationLimit) {
      toastrError(
        `Participation limit exceeded. Your maximum limit is ₹ ${maxParticipationLimit.toLocaleString(
          "en-IN"
        )}. You already participated ₹ ${alreadyParticipated.toLocaleString(
          "en-IN"
        )}, so you can participate up to ₹ ${userRemainingCapacity.toLocaleString("en-IN")} more.`
      );
      return false;
    }

    if (!hasAlreadyParticipated && minParticipationAmount > 0) {
      if (dealAvailableLimit >= minParticipationAmount && enteredAmount < minParticipationAmount) {
        toastrError(
          `Minimum investment is INR ${minParticipationAmount.toLocaleString("en-IN")}.`
        );
        return false;
      }
    }

    if (dealAvailableLimit === 0) {
      toastrError("Deal Is Closed");
      return false;
    }

    setDealparticipationStatus({
      status: true,
      message: "Participating in the deal...",
    });

    await participatedapi(deal, navigate);
  };

  // Quick fill maximum allowed
  const handleFillMaxAllowed = () => {
    const maxToFill =
      availableWalletBalance > 0
        ? Math.min(maxAllowedToParticipate, availableWalletBalance)
        : maxAllowedToParticipate;

    if (maxToFill > 0) {
      setDeal((prev) => ({
        ...prev,
        participatedAmount: maxToFill,
      }));
    }
  };

  // Navigate directly to Dashboard as per session management
  const handleGoBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="main-wrapper participate-shell">
      <Header />
      <SideBar />
      <div className="page-wrapper">
        <div className="content container-fluid participate-deal-page-container">
          <div className="participate-deal-wrapper">
            {/* Page Header (No outer border, clean spacing) */}
            <div className="deal-page-header">
              <div className="deal-page-header-left">
                <div className="deal-header-icon-box">
                  {/* Document Contract SVG Icon */}
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                      stroke="#2563eb"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 2V8H20"
                      stroke="#2563eb"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 13H8"
                      stroke="#2563eb"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 17H8"
                      stroke="#2563eb"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 9H8"
                      stroke="#2563eb"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="deal-header-title">Deal Info</h1>
                  <p className="deal-header-sub">
                    Review the deal details and enter your participation amount.
                  </p>
                </div>
              </div>

              {/* Breadcrumb on right with back to dashboard action */}
              <div className="deal-breadcrumb">
                <button
                  type="button"
                  className="deal-breadcrumb-back-btn"
                  onClick={handleGoBack}
                  title="Back to Dashboard"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                  <span>Back to Dashboard</span>
                </button>

                <span className="deal-breadcrumb-sep">/</span>

                <Link to="/dashboard" className="deal-breadcrumb-link">
                  <svg
                    className="deal-breadcrumb-home-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <span>Dashboard</span>
                </Link>

                <span className="deal-breadcrumb-sep">/</span>

                <span className="deal-breadcrumb-current">Deal Info</span>
              </div>
            </div>

            {deal.spining ? (
              <Spining />
            ) : (
              <div className="deal-main-card">
                {/* Hero Row: Deal Name + Badges (Left) & Wallet Card (Right) */}
                <div className="deal-hero-row">
                  <div className="deal-hero-left">
                    <div className="deal-hero-icon-circle">
                      {/* Hand holding coins SVG */}
                      <svg
                        width="34"
                        height="34"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#16a34a"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17" />
                        <path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
                        <circle cx="18" cy="6" r="3" />
                        <circle cx="14" cy="4" r="2" />
                      </svg>
                    </div>
                    <div className="deal-hero-meta">
                      <div className="deal-title-badge-row">
                        <h2 className="deal-hero-name">
                          {deal.apidata?.dealName || "minmax test"}
                        </h2>
                        <span className="deal-active-badge">Active</span>

                        {/* Show if user already participated */}
                        {hasAlreadyParticipated && (
                          <span className="deal-already-participated-badge">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            Already Participated: ₹ {alreadyParticipated.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      {/* <p className="deal-hero-desc">
                        A great opportunity to grow together with secure and transparent returns.
                      </p> */}
                    </div>
                  </div>

                  {/* Wallet Balance Card */}
                  <div className="deal-wallet-card">
                    <div className="deal-wallet-icon-box">
                      {/* Filled Blue Wallet SVG */}
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="5" width="20" height="15" rx="3" fill="#2563eb" />
                        <path
                          d="M2 9h20"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          strokeOpacity="0.4"
                        />
                        <rect x="15" y="11" width="5" height="4" rx="1.5" fill="#ffffff" />
                      </svg>
                    </div>
                    <div className="deal-wallet-info">
                      <p className="deal-wallet-label">Your Wallet Balance</p>
                      <p className="deal-wallet-amount">₹ {displayWalletBalance}</p>
                    </div>
                    <button
                      type="button"
                      className="deal-load-wallet-btn"
                      onClick={() => navigate("/loadwaletThroughQr")}
                    >
                      Load Wallet &rarr;
                    </button>
                  </div>
                </div>

                {/* 6 Metrics Cards Grid */}
                <div className="deal-metrics-grid">
                  {/* ROI */}
                  <div className="deal-metric-card metric-theme-roi">
                    <div className="deal-metric-icon-circle">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#ea580c"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="19" y1="5" x2="5" y2="19"></line>
                        <circle cx="6.5" cy="6.5" r="2.5"></circle>
                        <circle cx="17.5" cy="17.5" r="2.5"></circle>
                      </svg>
                    </div>
                    <div className="deal-metric-details">
                      <span className="deal-metric-label">ROI</span>
                      <strong className="deal-metric-value">
                        {deal.apidata?.rateOfInterest || "0.5%"}
                      </strong>
                    </div>
                  </div>

                  {/* Deal Value */}
                  <div className="deal-metric-card metric-theme-dealvalue">
                    <div className="deal-metric-icon-circle">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <ellipse cx="12" cy="5" rx="8" ry="3"></ellipse>
                        <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5"></path>
                        <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"></path>
                      </svg>
                    </div>
                    <div className="deal-metric-details">
                      <span className="deal-metric-label">Deal Value</span>
                      <strong className="deal-metric-value">
                        ₹{" "}
                        {deal.apidata?.dealAmount
                          ? Number(deal.apidata.dealAmount).toLocaleString("en-IN")
                          : "1,00,000"}
                      </strong>
                    </div>
                  </div>

                  {/* Available Limit */}
                  <div className="deal-metric-card metric-theme-available">
                    <div className="deal-metric-icon-circle">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="5" width="18" height="14" rx="3" fill="#16a34a" />
                        <rect x="6" y="8" width="4" height="3" rx="0.8" fill="#ffffff" />
                        <circle cx="16" cy="14" r="1.5" fill="#ffffff" />
                      </svg>
                    </div>
                    <div className="deal-metric-details">
                      <span className="deal-metric-label">Available Limit</span>
                      <strong className="deal-metric-value">
                        ₹{" "}
                        {deal.apidata?.remainingAmountInDeal
                          ? Number(deal.apidata.remainingAmountInDeal).toLocaleString("en-IN")
                          : "66,450"}
                      </strong>
                    </div>
                  </div>

                  {/* Tenure */}
                  <div className="deal-metric-card metric-theme-tenure">
                    <div className="deal-metric-icon-circle">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                        <circle cx="8" cy="15" r="1" fill="#7c3aed"></circle>
                        <circle cx="12" cy="15" r="1" fill="#7c3aed"></circle>
                        <circle cx="16" cy="15" r="1" fill="#7c3aed"></circle>
                      </svg>
                    </div>
                    <div className="deal-metric-details">
                      <span className="deal-metric-label">Tenure</span>
                      <strong className="deal-metric-value">
                        {deal.apidata?.duration
                          ? `${deal.apidata.duration} ${
                              localStorage.getItem("choosenPayOutOption") === "PERDAY"
                                ? "D"
                                : "M"
                            }`
                          : "1 M"}
                      </strong>
                    </div>
                  </div>

                  {/* Min Amount */}
                  <div className="deal-metric-card metric-theme-minamount">
                    <div className="deal-metric-icon-circle">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#e11d48"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <polyline points="19 12 12 19 5 12"></polyline>
                      </svg>
                    </div>
                    <div className="deal-metric-details">
                      <span className="deal-metric-label">Min Amount</span>
                      <strong className="deal-metric-value">
                        ₹{" "}
                        {deal.apidata?.minimumPaticipationAmount
                          ? Number(deal.apidata.minimumPaticipationAmount).toLocaleString("en-IN")
                          : "500"}
                      </strong>
                    </div>
                  </div>

                  {/* Max Amount */}
                  <div className="deal-metric-card metric-theme-maxamount">
                    <div className="deal-metric-icon-circle">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="19" x2="12" y2="5"></line>
                        <polyline points="5 12 12 5 19 12"></polyline>
                      </svg>
                    </div>
                    <div className="deal-metric-details">
                      <span className="deal-metric-label">Max Amount</span>
                      <strong className="deal-metric-value">
                        ₹{" "}
                        {deal.apidata?.lenderParticiptionLimit
                          ? Number(deal.apidata.lenderParticiptionLimit).toLocaleString("en-IN")
                          : "1,00,000"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* RBI Note Banner */}
                <div className="deal-rbi-note-banner">
                  <div className="deal-note-exclamation-icon">!</div>
                  <div className="deal-note-text-content">
                    <span className="deal-note-text-title">Note:</span>
                    By the RBI Guidelines, we are returning the principal amount to your
                    registered bank account.
                  </div>
                </div>

                {/* Processing Fee / Validity Alert (if applicable) */}
                {deal.apidata?.lenderValidityStatus === true && (
                  <div className="deal-validity-banner">
                    {deal.apidata.feeStatusToParticipate === "OPTIONAL" ? (
                      <div>
                        <strong>Note:</strong> Processing Fee is waived for this deal.
                      </div>
                    ) : deal.apidata.groupName !== "NewLender" ? (
                      <div>
                        <strong>Note:</strong> Your validity has expired. Please pay to
                        continue your participation.
                      </div>
                    ) : (
                      <div>
                        <strong>Note:</strong> You are requested to pay a 1% processing fee
                        on your investment.
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom 2-Grid Row: Left is Status Stats, Right is Participation Form */}
                <div className="deal-bottom-row-grid">
                  {/* Grid 1: Already Participated & Remaining Limit */}
                  <div className="deal-status-summary-card">
                    <h4 className="deal-status-card-title">Your Participation Status</h4>
                    <div className="deal-status-boxes-list">
                      {/* Stat 1: Already Participated */}
                      <div className="deal-status-stat-box">
                        <div className="deal-status-stat-icon status-icon-blue">
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <div className="deal-status-stat-meta">
                          <span className="deal-status-stat-label">Already Participated</span>
                          <strong className="deal-status-stat-value status-val-blue">
                            ₹ {alreadyParticipated.toLocaleString("en-IN")}
                          </strong>
                        </div>
                      </div>

                      {/* Stat 2: Your Remaining Limit */}
                      <div className="deal-status-stat-box">
                        <div className="deal-status-stat-icon status-icon-green">
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect x="2" y="5" width="20" height="15" rx="3" />
                            <path d="M2 10h20" />
                            <circle cx="16" cy="15" r="1.5" fill="currentColor" />
                          </svg>
                        </div>
                        <div className="deal-status-stat-meta">
                          <span className="deal-status-stat-label">Remaining Limit</span>
                          <strong className="deal-status-stat-value status-val-green">
                            ₹ {userRemainingCapacity.toLocaleString("en-IN")}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grid 2: Participation Form Card */}
                  <div className="deal-participation-box">
                    <h3 className="deal-participation-heading">
                      Your participation to this deal is
                    </h3>

                    <div className={`deal-input-group ${validationWarning ? "has-error" : ""}`}>
                      <div className="deal-input-currency-addon">₹</div>
                      <input
                        className="deal-amount-input"
                        type="number"
                        placeholder="Enter amount here..."
                        onWheel={(e) => e.target.blur()}
                        name="participatedAmount"
                        value={deal.participatedAmount}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Quick limit helpers */}
                    <div className="deal-quick-limit-helper">
                      <span>
                        Max allowed: ₹ {maxAllowedToParticipate.toLocaleString("en-IN")}
                      </span>
                      {maxAllowedToParticipate > 0 && (
                        <button
                          type="button"
                          className="deal-fill-max-btn"
                          onClick={handleFillMaxAllowed}
                        >
                          Fill Max Allowed
                        </button>
                      )}
                    </div>

                    {/* Live validation error */}
                    {validationWarning && (
                      <div className="deal-live-error-box">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span>{validationWarning}</span>
                      </div>
                    )}

                    {/* Dynamic fee notice */}
                    {enteredAmount > 0 &&
                      !validationWarning &&
                      deal.dealfeestatus !== "OPTIONAL" &&
                      deal.uservalidity === true && (
                        <div className="deal-fee-msg">
                          This deal has a fee (1% + 18% GST) of ₹{" "}
                          {Math.round(enteredAmount * 0.01 * 1.18)}.
                        </div>
                      )}

                    {withdrawriaseapi.amount !== "" &&
                      withdrawriaseapi.amount !== null && (
                        <div className="deal-feedback-msg">
                          Actual wallet amount after withdrawal request: ₹{" "}
                          {withdrawriaseapi.amount}.
                        </div>
                      )}

                    <button
                      type="button"
                      className="deal-participate-submit-btn"
                      disabled={!isInputValid || dealparticipationStatus.status}
                      onClick={dealparticipate}
                    >
                      {dealparticipationStatus.status ? (
                        "Participating..."
                      ) : (
                        <>
                          Participate &rarr;
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>

      <style>
        {`
        /* Remove inner spinner from number inputs */
        input::-webkit-inner-spin-button,
        input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
          appearance: textfield;
        }
        input[type=number]:focus,
        input[type=number]:hover {
          -moz-appearance: textfield;
        }
        `}
      </style>
    </div>
  );
};

export default Participatedeal;
