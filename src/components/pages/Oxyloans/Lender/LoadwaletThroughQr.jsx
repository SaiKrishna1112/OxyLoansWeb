import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import Footer from "../../../Footer/Footer";
import { bottomCenter } from "../../Base UI Elements/Toast";
import { QRCode } from "antd";
import { WarningAlertWalltTran } from "../../Base UI Elements/SweetAlert";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import {
  LoadwalletThroughQrScan,
  checkqrcodetransaction,
} from "../../../HttpRequest/afterlogin";
import { qrPhoneClean } from "../../../imagepath";
import "./LoadwaletThroughQr.css";

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];
const QR_EXPIRY_SECONDS = 300; // 5 minutes

const LoadwaletThroughQr = () => {
  const reduxStoreData = useSelector((data) => data.counter.userProfile);
  const totalWalletBalance = Number(reduxStoreData?.lenderWalletAmount) || 0;
  const heldWalletBalance =
    (Number(reduxStoreData?.holdAmountInDealParticipation) || 0) +
    (Number(reduxStoreData?.equityAmount) || 0);
  const availableWalletBalance = Math.max(
    totalWalletBalance - heldWalletBalance,
    0
  );

  const formatCurrency = (val) =>
    `₹${Number(val || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatAmountDisplay = (val) =>
    `₹${Number(val || 0).toLocaleString("en-IN")}`;

  // Step 1 vs Step 2 state
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState("");
  const [activeChip, setActiveChip] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // QR & Transaction states
  const [qrUrlpath, setQrUrlpath] = useState("");
  const [qrTableId, setQrTableId] = useState("");
  const [qrcodeImageStatus, setqrcodeImageStatus] = useState("active");
  const [timerSeconds, setTimerSeconds] = useState(QR_EXPIRY_SECONDS);

  const pollingRef = useRef(null);

  // Validation: integer between 1 and 100,000
  const parsedAmount = parseInt(amount, 10);
  const isValidAmount =
    !isNaN(parsedAmount) && parsedAmount >= 1 && parsedAmount <= 100000;

  // Handle amount typing
  const handleAmountChange = (e) => {
    const val = e.target.value.replace(/\D/g, ""); // Digits only
    if (val.length <= 6) {
      setAmount(val);
      setActiveChip(Number(val));
    }
  };

  // Quick chips
  const handleSelectChip = (chipVal) => {
    setAmount(String(chipVal));
    setActiveChip(chipVal);
  };

  // Step 1 -> Step 2: Generate QR
  const handleGetQr = async () => {
    if (!amount || !isValidAmount) {
      bottomCenter("Please enter an amount between ₹1 and ₹1,00,000");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await LoadwalletThroughQrScan(amount);
      if (response?.request?.status === 200 || response?.status === 200) {
        const resData = response.data;
        setQrUrlpath(resData?.qrGenerationString || "");
        setQrTableId(resData?.qrTableId || "");
        setqrcodeImageStatus("active");
        setTimerSeconds(QR_EXPIRY_SECONDS);
        setStep(2);
      } else {
        bottomCenter("Failed to generate QR code. Please try again.");
      }
    } catch (err) {
      console.error("QR Generation error:", err);
      bottomCenter("Error generating QR code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Countdown Timer (5 Minutes)
  useEffect(() => {
    let timerInterval = null;
    if (step === 2 && timerSeconds > 0) {
      timerInterval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            setqrcodeImageStatus("expired");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [step, timerSeconds]);

  // Format MM:SS for countdown
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Step 2: Refresh QR Code
  const handleRefreshQr = useCallback(() => {
    if (amount && isValidAmount) {
      handleGetQr();
    }
  }, [amount, isValidAmount]);

  // Step 2 -> Step 1: Edit / Change Amount
  const handleBackToStep1 = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setStep(1);
    setqrcodeImageStatus("active");
  };

  // Background Transaction Polling (runs quietly without blurring QR code)
  useEffect(() => {
    if (step === 2 && qrTableId && qrcodeImageStatus === "active") {
      pollingRef.current = setInterval(async () => {
        try {
          const qRStatusresponse = await checkqrcodetransaction(qrTableId);
          if (
            qRStatusresponse?.request?.status === 200 ||
            qRStatusresponse?.status === 200
          ) {
            if (qRStatusresponse.data?.status === "SUCCESS") {
              if (pollingRef.current) clearInterval(pollingRef.current);
              Swal.fire({
                icon: "success",
                title: "Congratulations!",
                text: "Your transaction was successful and the amount has been credited to your wallet.",
                confirmButtonText: "OK",
                confirmButtonColor: "var(--oxy-primary, #2563eb)",
                buttonsStyling: false,
                customClass: {
                  confirmButton: "btn btn-primary",
                },
              }).then((result) => {
                if (result.isConfirmed) {
                  window.location.reload();
                }
              });
            }
          } else if (
            qRStatusresponse?.response?.data?.errorCode &&
            qRStatusresponse?.response?.data?.errorCode !== "200"
          ) {
            setqrcodeImageStatus("expired");
            WarningAlertWalltTran(
              (qRStatusresponse.response.data.errorMessage ||
                "Transaction failed") + ". Please try again."
            );
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 2000);

      return () => {
        if (pollingRef.current) clearInterval(pollingRef.current);
      };
    }
  }, [step, qrTableId, qrcodeImageStatus]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  return (
    <>
      <div className="main-wrapper">
        <Header />
        <SideBar />

        <div className="page-wrapper">
          <div className="content container-fluid">
            {/* Page Title & Breadcrumb */}
            <div className="qr-page-header">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h3 className="qr-page-title">
                    Top Up Your Wallet with a QR Scanner
                  </h3>
                  <p className="qr-page-subtitle">
                    Add money to your wallet instantly and securely using any
                    UPI app.
                  </p>
                </div>
                <div className="col-md-4 text-md-end mt-2 mt-md-0">
                  <ul className="breadcrumb mb-0 justify-content-md-end">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">
                        <i className="fas fa-home me-1" />
                        Dashboard
                      </Link>
                    </li>
                    <li className="breadcrumb-item active">QR Scanner</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* ==========================================================
                MAIN CONTENT ROW (2 COLUMNS)
                ========================================================== */}
            <div className="row">
              {/* Left Column: Step 1 or Step 2 Card */}
              <div className="col-lg-7 mb-4">
                <div className="qr-main-card">
                  {/* Card Header */}
                  <div className="qr-card-header">
                    <div className="qr-card-title-group">
                      <div className="qr-title-icon-box">
                        <i className="fa-solid fa-qrcode" />
                      </div>
                      <div>
                        <h4 className="qr-card-title">
                          {step === 1
                            ? "Load Your wallet with a QR Scanner"
                            : "Step 2: Scan QR to Load Your Wallet"}
                        </h4>
                        <p className="qr-card-subtitle">
                          {step === 1
                            ? "Enter the amount you want to add to your wallet and scan the QR code."
                            : "Scan this QR code using any UPI app and pay the amount to add to your wallet."}
                        </p>
                      </div>
                    </div>

                    {/* Step Indicator on top right of Step 2 */}
                    {step === 2 && (
                      <div className="qr-stepper">
                        <div className="qr-step-pill completed">
                          <span className="qr-step-num">
                            <i className="fa-solid fa-check" />
                          </span>
                          <span>1. Enter Amount</span>
                        </div>
                        <div className="qr-stepper-connector" />
                        <div className="qr-step-pill active">
                          <span className="qr-step-num">2</span>
                          <span>2. Scan &amp; Pay</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="qr-card-body">
                    {/* ─────────────────────────────────────────────
                        STEP 1 CONTENT: ENTER AMOUNT & PHONE ARTWORK
                        ───────────────────────────────────────────── */}
                    {step === 1 && (
                      <>
                        {/* Simple & Clean Wallet Balance Display */}
                        <div className="qr-wallet-balance-box">
                          <div className="qr-wallet-balance-left">
                            <div className="qr-wallet-balance-icon">
                              <i className="fa-solid fa-wallet" />
                            </div>
                            <div>
                              <div className="qr-wallet-balance-label">
                                Available Wallet Balance
                              </div>
                              <div className="qr-wallet-balance-amount">
                                {formatCurrency(availableWalletBalance)}
                              </div>
                            </div>
                          </div>
                          <div className="qr-wallet-balance-badge">
                            <i className="fa-solid fa-shield-halved me-1" />
                            <span>100% Secure &amp; Instant</span>
                          </div>
                        </div>

                        <div className="qr-step1-grid">
                          {/* Left: Input, Chips, Button */}
                          <div>
                            <div className="qr-input-group-wrapper">
                              <div className="qr-amount-input-group">
                                <span className="qr-currency-symbol">₹</span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  className="qr-amount-input"
                                  placeholder="Enter the Amount"
                                  value={amount}
                                  onChange={handleAmountChange}
                                  autoFocus
                                />
                              </div>
                            </div>

                            {/* Quick Amount Chips */}
                            <div className="qr-quick-chips-row">
                              {QUICK_AMOUNTS.map((val) => (
                                <button
                                  key={val}
                                  type="button"
                                  className={`qr-quick-chip-btn ${
                                    activeChip === val ? "active" : ""
                                  }`}
                                  onClick={() => handleSelectChip(val)}
                                >
                                  {formatAmountDisplay(val)}
                                </button>
                              ))}
                            </div>

                            {/* CTA: Get QR */}
                            <div>
                              <button
                                type="button"
                                className="qr-submit-btn"
                                disabled={!isValidAmount || isSubmitting}
                                onClick={handleGetQr}
                              >
                                {isSubmitting ? (
                                  <>
                                    <i className="fa-solid fa-spinner fa-spin" />
                                    <span>Generating...</span>
                                  </>
                                ) : (
                                  <>
                                    <i className="fa-solid fa-qrcode" />
                                    <span>Get QR</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Right: Phone Vector Illustration */}
                          <div className="qr-step1-illustration-box">
                            <img
                              src={qrPhoneClean}
                              alt="UPI QR Scanner Illustration"
                              className="qr-step1-phone-img"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* ─────────────────────────────────────────────
                        STEP 2 CONTENT: LARGE QR CODE & PAYMENT METRICS
                        ───────────────────────────────────────────── */}
                    {step === 2 && (
                      <>
                        {/* Simple & Clean Wallet Balance Display */}
                        <div className="qr-wallet-balance-box">
                          <div className="qr-wallet-balance-left">
                            <div className="qr-wallet-balance-icon">
                              <i className="fa-solid fa-wallet" />
                            </div>
                            <div>
                              <div className="qr-wallet-balance-label">
                                Available Wallet Balance
                              </div>
                              <div className="qr-wallet-balance-amount">
                                {formatCurrency(availableWalletBalance)}
                              </div>
                            </div>
                          </div>
                          <div className="qr-wallet-balance-badge">
                            <i className="fa-solid fa-clock me-1" />
                            <span>QR Valid for 5 Mins</span>
                          </div>
                        </div>

                        <div className="qr-step2-grid">
                          {/* Left: Large Centered QR Code Box */}
                          <div className="qr-code-display-card">
                            <div className="qr-code-inner">
                              <QRCode
                                value={qrUrlpath || "https://oxyloans.com"}
                                size={200}
                                status={qrcodeImageStatus}
                                onRefresh={handleRefreshQr}
                              />
                            </div>
                          </div>

                          {/* Right: Payment details, UPI Apps, Countdown, Actions */}
                          <div className="qr-step2-details">
                            {/* UPI Apps Row */}
                            <div>
                              <div className="qr-upi-apps-section-title">
                                Pay using any UPI app
                              </div>
                              <div className="qr-upi-badges-row">
                                <div className="qr-upi-app-chip">
                                  <div className="qr-upi-logo-circle logo-phonepe">
                                    <span>पे</span>
                                  </div>
                                  <span className="qr-upi-app-name">
                                    PhonePe
                                  </span>
                                </div>

                                <div className="qr-upi-app-chip">
                                  <div className="qr-upi-logo-circle logo-paytm">
                                    <span>paytm</span>
                                  </div>
                                  <span className="qr-upi-app-name">Paytm</span>
                                </div>

                                <div className="qr-upi-app-chip">
                                  <div className="qr-upi-logo-circle logo-gpay">
                                    <svg
                                      viewBox="0 0 24 24"
                                      width="19"
                                      height="19"
                                    >
                                      <path
                                        fill="#4285F4"
                                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                                      />
                                      <path
                                        fill="#34A853"
                                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                                      />
                                      <path
                                        fill="#FBBC05"
                                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                                      />
                                      <path
                                        fill="#EA4335"
                                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                                      />
                                    </svg>
                                  </div>
                                  <span className="qr-upi-app-name">
                                    Google Pay
                                  </span>
                                </div>

                                <div className="qr-upi-app-chip">
                                  <div className="qr-upi-logo-circle logo-anyupi">
                                    <i className="fa-solid fa-building-columns" />
                                  </div>
                                  <span className="qr-upi-app-name">
                                    Any UPI app
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Timer Box */}
                            <div className="qr-timer-box">
                              <div className="qr-timer-left">
                                <div className="qr-timer-clock-icon">
                                  <i className="fa-regular fa-clock" />
                                </div>
                                <div>
                                  <div className="qr-timer-text-heading">
                                    {timerSeconds > 0
                                      ? "QR code expires in"
                                      : "QR code has expired"}
                                  </div>
                                  <div className="qr-timer-text-sub">
                                    For your security, this QR code is valid for
                                    5 minutes.
                                  </div>
                                </div>
                              </div>
                              <div className="qr-timer-countdown">
                                {formatTime(timerSeconds)}
                              </div>
                            </div>

                            {/* Actions: Refresh QR & Change Amount */}
                            <div className="qr-actions-row">
                              <button
                                type="button"
                                className="qr-outline-btn"
                                onClick={handleRefreshQr}
                              >
                                <i className="fa-solid fa-arrows-rotate" />
                                <span>Refresh QR Code</span>
                              </button>

                              <button
                                type="button"
                                className="qr-outline-btn"
                                onClick={handleBackToStep1}
                              >
                                <i className="fa-solid fa-pen" />
                                <span>Reset Amount</span>
                              </button>
                            </div>

                            {/* Amount Summary */}
                            <div className="qr-amount-summary-box">
                              <div>
                                <div className="qr-amount-summary-label">
                                  Amount to be paid
                                </div>
                                <div className="qr-amount-summary-value">
                                  {formatAmountDisplay(amount)}
                                </div>
                              </div>
                              <button
                                type="button"
                                className="qr-edit-amount-btn"
                                onClick={handleBackToStep1}
                              >
                                <i className="fa-solid fa-pen" />
                                <span>Edit Amount</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Bottom Alert Banner: Transaction Limit Note */}
                    <div className="qr-note-banner">
                      <div className="qr-note-icon">!</div>
                      <div className="qr-note-content">
                        <div className="qr-note-title">Note:</div>
                        <ul className="qr-note-list">
                          <li>1. Transaction limit is INR 1,00,000 Only.</li>
                          <li>
                            2. If you want to load more than a lakh, you have
                            to scan multiple times.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Tutorial Video & Quick Tips Card */}
              <div className="col-lg-5 mb-4">
                <div className="qr-main-card">
                  <div className="qr-card-header">
                    <div className="qr-card-title-group">
                      <div className="qr-title-icon-box icon-play">
                        <i className="fa-solid fa-play" />
                      </div>
                      <div>
                        <h4 className="qr-card-title">
                          How to load the wallet through UPI
                        </h4>
                        <p className="qr-card-subtitle">
                          Watch the video below to learn how to add money to
                          your wallet using any UPI app.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="qr-card-body">
                    {/* 16:9 YouTube Video Embed */}
                    <div className="qr-video-wrapper">
                      <iframe
                        className="qr-video-iframe"
                        src="https://www.youtube.com/embed/RUg_WsZ-90g?rel=0"
                        title="Load Wallet through UPI | OxyLoans"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>

                    {/* Quick Tips Box (Always cleanly placed below video) */}
                    <div className="qr-quick-tips-box">
                      <div className="qr-quick-tips-icon">
                        <i className="fa-regular fa-lightbulb" />
                      </div>
                      <div className="qr-quick-tips-content">
                        <div className="qr-quick-tips-title">Quick Tips</div>
                        <ul className="qr-quick-tips-list">
                          <li>
                            1. Open any UPI app (PhonePe, Paytm, Google Pay or
                            any UPI app).
                          </li>
                          <li>2. Scan the QR code and pay the exact amount.</li>
                          <li>
                            3. Amount will be added to your wallet instantly
                            after successful payment.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ==========================================================
                3. BOTTOM ROW: 4 FEATURE VALUE CARDS
                ========================================================== */}
            <div className="row qr-features-row">
              {/* Feature 1: Instant Credit */}
              <div className="col-xl-3 col-sm-6 mb-3">
                <div className="qr-feature-card">
                  <div className="qr-feature-icon-box theme-green">
                    <i className="fa-solid fa-wallet" />
                  </div>
                  <div>
                    <h5 className="qr-feature-title">Instant Credit</h5>
                    <p className="qr-feature-desc">
                      Money will be added to your wallet instantly after
                      successful payment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2: Secure Transactions */}
              <div className="col-xl-3 col-sm-6 mb-3">
                <div className="qr-feature-card">
                  <div className="qr-feature-icon-box theme-purple">
                    <i className="fa-solid fa-shield-halved" />
                  </div>
                  <div>
                    <h5 className="qr-feature-title">Secure Transactions</h5>
                    <p className="qr-feature-desc">
                      Bank-grade security with encrypted UPI payments.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 3: Multiple UPI Apps */}
              <div className="col-xl-3 col-sm-6 mb-3">
                <div className="qr-feature-card">
                  <div className="qr-feature-icon-box theme-orange">
                    <i className="fa-solid fa-mobile-screen-button" />
                  </div>
                  <div>
                    <h5 className="qr-feature-title">Multiple UPI Apps</h5>
                    <p className="qr-feature-desc">
                      Works with all major UPI apps like PhonePe, Paytm, GPay and
                      more.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 4: Available 24/7 */}
              <div className="col-xl-3 col-sm-6 mb-3">
                <div className="qr-feature-card">
                  <div className="qr-feature-icon-box theme-blue">
                    <i className="fa-regular fa-clock" />
                  </div>
                  <div>
                    <h5 className="qr-feature-title">Available 24/7</h5>
                    <p className="qr-feature-desc">
                      Top up your wallet anytime, anywhere.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </>
  );
};

export default LoadwaletThroughQr;
