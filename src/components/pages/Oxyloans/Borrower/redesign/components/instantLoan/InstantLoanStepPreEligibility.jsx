import React, { useState } from "react";
import Swal from "sweetalert2";
import { formatINR } from "../creditReportUtils";

const InstantLoanStepPreEligibility = ({
  profileData,
  onPaymentSuccess,
  onBack,
}) => {
  const salary = Number(profileData.monthlySalary || 65000);
  const eligibleEstimate = Math.round(salary * 0.9);

  const [paymentMethod, setPaymentMethod] = useState("UPI_APP"); // 'UPI_APP' | 'QR' | 'NETBANKING'
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay"); // 'gpay' | 'phonepe' | 'paytm' | 'custom'
  const [customUpiId, setCustomUpiId] = useState("9492902990@ybl");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePayFee = () => {
    setIsProcessingPayment(true);

    // Realistic multi-stage visual payment simulator
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);

      const txnId = `OXYPAY_${Date.now()}`;

      Swal.fire({
        icon: "success",
        title: "Platform Fee Paid! (₹150.00)",
        html: `
          <div class="text-center py-2">
            <span class="badge bg-success px-3 py-2 rounded-pill fs-6 mb-2">UPI Transaction Confirmed ✓</span>
            <p class="text-muted small mb-1">Transaction Ref: <strong>${txnId}</strong></p>
            <p class="text-muted small mb-0">Initiating instant PaySprint Credit Bureau query & PAN verification...</p>
          </div>
        `,
        timer: 1600,
        showConfirmButton: false,
      });

      setTimeout(() => {
        onPaymentSuccess({
          paymentId: txnId,
          amount: 150,
          paidAt: new Date().toISOString(),
          paymentMethod: `${paymentMethod}_${selectedUpiApp}`,
        });
      }, 1700);
    }, 1300);
  };

  return (
    <div className="fintech-card">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge badge-fintech-success-soft px-3 py-1 rounded-pill small">
              Phase 2 • Salary Eligibility & Platform Fee
            </span>
            <span className="badge badge-fintech-neutral px-2 py-1 rounded-pill small">
              Step 2 of 6
            </span>
          </div>
          <h4 className="fw-bold text-dark mb-1">Pre-Approved Limit & Assessment Checkout</h4>
          <p className="text-muted small mb-0">
            Instant credit line estimation calculated for <strong>{profileData.name}</strong> based on {formatINR(salary)} monthly income.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="btn btn-sm btn-outline-secondary rounded-3 px-3"
        >
          <i className="fa-solid fa-arrow-left me-1"></i> Edit Profile
        </button>
      </div>

      {/* Hero Pre-Eligibility Card */}
      <div className="fintech-hero-indigo mb-4">
        <div className="row align-items-center g-3">
          <div className="col-lg-8">
            <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill badge-fintech-white-translucent small fw-bold mb-3">
              <i className="fa-solid fa-sparkles text-warning"></i>
              Pre-Approved Instant Credit Line
            </div>

            <h1 className="display-6 fw-bold text-white mb-2">
              Eligible for up to {formatINR(eligibleEstimate)}
            </h1>

            <p className="text-white text-opacity-90 small mb-3" style={{ maxWidth: "560px" }}>
              Based on your monthly salary at <strong>{profileData.companyName || "SRS Fintech Labs Pvt Ltd"}</strong>. Zero paperwork, zero collateral, instant disbursal upon credit bureau underwriting.
            </p>

            <div className="d-flex flex-wrap gap-2">
              <span className="banking-seal">
                <i className="fa-solid fa-clock text-warning"></i> Disbursal in 2 Hours
              </span>
              <span className="banking-seal">
                <i className="fa-solid fa-percent text-success"></i> Rates from 1.37%/mo
              </span>
              <span className="banking-seal">
                <i className="fa-solid fa-ban text-info"></i> No Prepayment Penalties
              </span>
            </div>
          </div>

          <div className="col-lg-4 text-lg-end">
            <div className="d-inline-flex flex-column align-items-lg-end p-3 rounded-4 bg-white bg-opacity-10 border border-white border-opacity-20">
              <span className="text-white text-opacity-75 small">Matched Escrow Pool</span>
              <h5 className="fw-bold text-white mb-1">OxyLoans Escrow #41682</h5>
              <span className="badge badge-fintech-success small rounded-pill px-2 py-1">
                100% Capital Guaranteed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Fee Assessment Box */}
      <div className="row g-4 mb-4">
        {/* Left: Fee Breakdown & Purpose */}
        <div className="col-lg-5">
          <div className="p-4 rounded-4 bg-light border h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i className="fa-solid fa-receipt text-primary"></i>
                Platform Assessment Fee
              </h6>
              <span className="badge badge-fintech-primary rounded-pill px-2 py-1 small">
                One-Time
              </span>
            </div>

            <p className="text-muted small mb-3" style={{ fontSize: "12px", lineHeight: "1.6" }}>
              To fetch live credit records via <strong>PaySprint CIR Engine</strong>, cross-verify PAN/DOB authenticity, and reserve escrow capital from institutional P2P lenders, a nominal processing fee of <strong>₹150 INR</strong> is required.
            </p>

            <div className="bg-white p-3 rounded-3 border mb-3">
              <div className="d-flex justify-content-between text-muted small mb-2">
                <span>PaySprint Bureau Pull & PAN Verification</span>
                <span className="fw-bold text-dark">₹ 127.12</span>
              </div>
              <div className="d-flex justify-content-between text-muted small mb-2">
                <span>Goods & Services Tax (GST 18%)</span>
                <span className="fw-bold text-dark">₹ 22.88</span>
              </div>
              <div className="d-flex justify-content-between align-items-center border-top pt-2 mt-2">
                <strong className="text-dark">Total Fee Payable</strong>
                <h4 className="fw-bold text-primary mb-0">₹ 150.00</h4>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 text-muted small" style={{ fontSize: "11px" }}>
              <i className="fa-solid fa-shield-halved text-success fs-6"></i>
              <span>Authorized under RBI Master Directions for P2P Lending Platforms.</span>
            </div>
          </div>
        </div>

        {/* Right: Payment Method Selector */}
        <div className="col-lg-7">
          <div className="p-4 rounded-4 bg-white border h-100 shadow-xs">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold text-dark mb-0">Select Payment Method</h6>
              <span className="badge badge-fintech-success-soft small">
                Instant Confirmation
              </span>
            </div>

            {/* Method Tabs */}
            <div className="btn-group w-100 mb-3" role="group">
              <button
                type="button"
                className={`btn btn-sm rounded-start-3 ${
                  paymentMethod === "UPI_APP" ? "btn-primary" : "btn-outline-secondary"
                }`}
                onClick={() => setPaymentMethod("UPI_APP")}
              >
                <i className="fa-solid fa-mobile-screen-button me-1"></i> Instant UPI Apps
              </button>

              <button
                type="button"
                className={`btn btn-sm ${
                  paymentMethod === "QR" ? "btn-primary" : "btn-outline-secondary"
                }`}
                onClick={() => setPaymentMethod("QR")}
              >
                <i className="fa-solid fa-qrcode me-1"></i> Scan UPI QR
              </button>

              <button
                type="button"
                className={`btn btn-sm rounded-end-3 ${
                  paymentMethod === "NETBANKING" ? "btn-primary" : "btn-outline-secondary"
                }`}
                onClick={() => setPaymentMethod("NETBANKING")}
              >
                <i className="fa-solid fa-building-columns me-1"></i> NetBanking / Card
              </button>
            </div>

            {/* Tab 1: UPI Apps */}
            {paymentMethod === "UPI_APP" && (
              <div>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div
                      className={`upi-method-btn ${selectedUpiApp === "gpay" ? "selected" : ""}`}
                      onClick={() => setSelectedUpiApp("gpay")}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <i className="fa-brands fa-google text-danger fs-5"></i>
                        <span className="fw-bold text-dark small">Google Pay</span>
                      </div>
                      <input
                        type="radio"
                        checked={selectedUpiApp === "gpay"}
                        onChange={() => setSelectedUpiApp("gpay")}
                        className="form-check-input"
                      />
                    </div>
                  </div>

                  <div className="col-6">
                    <div
                      className={`upi-method-btn ${selectedUpiApp === "phonepe" ? "selected" : ""}`}
                      onClick={() => setSelectedUpiApp("phonepe")}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <i className="fa-solid fa-wallet text-primary fs-5"></i>
                        <span className="fw-bold text-dark small">PhonePe</span>
                      </div>
                      <input
                        type="radio"
                        checked={selectedUpiApp === "phonepe"}
                        onChange={() => setSelectedUpiApp("phonepe")}
                        className="form-check-input"
                      />
                    </div>
                  </div>

                  <div className="col-6">
                    <div
                      className={`upi-method-btn ${selectedUpiApp === "paytm" ? "selected" : ""}`}
                      onClick={() => setSelectedUpiApp("paytm")}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <i className="fa-solid fa-credit-card text-info fs-5"></i>
                        <span className="fw-bold text-dark small">Paytm UPI</span>
                      </div>
                      <input
                        type="radio"
                        checked={selectedUpiApp === "paytm"}
                        onChange={() => setSelectedUpiApp("paytm")}
                        className="form-check-input"
                      />
                    </div>
                  </div>

                  <div className="col-6">
                    <div
                      className={`upi-method-btn ${selectedUpiApp === "custom" ? "selected" : ""}`}
                      onClick={() => setSelectedUpiApp("custom")}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <i className="fa-solid fa-at text-secondary fs-5"></i>
                        <span className="fw-bold text-dark small">Other UPI ID</span>
                      </div>
                      <input
                        type="radio"
                        checked={selectedUpiApp === "custom"}
                        onChange={() => setSelectedUpiApp("custom")}
                        className="form-check-input"
                      />
                    </div>
                  </div>
                </div>

                {selectedUpiApp === "custom" && (
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">Enter VPA / UPI ID</label>
                    <input
                      type="text"
                      value={customUpiId}
                      onChange={(e) => setCustomUpiId(e.target.value)}
                      placeholder="mobile@upi or user@okhdfcbank"
                      className="form-control form-control-sm instant-form-control"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Scan QR */}
            {paymentMethod === "QR" && (
              <div className="text-center py-2 mb-3">
                <div className="qr-frame mb-2 shadow-xs">
                  <i className="fa-solid fa-qrcode fs-1 text-primary" style={{ fontSize: "5rem" }}></i>
                </div>
                <strong className="text-dark small d-block">Scan with any UPI App</strong>
                <span className="text-muted small" style={{ fontSize: "11px" }}>
                  GPay • PhonePe • Paytm • CRED • Amazon Pay
                </span>
              </div>
            )}

            {/* Tab 3: NetBanking */}
            {paymentMethod === "NETBANKING" && (
              <div className="py-2 mb-3">
                <label className="form-label small fw-bold text-dark">Select Primary Bank</label>
                <select className="form-select form-select-sm instant-form-control mb-2">
                  <option>State Bank of India (SBI)</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                </select>
                <small className="text-muted" style={{ fontSize: "11px" }}>
                  You will be securely redirected to your bank's 3D-Secure gateway.
                </small>
              </div>
            )}

            {/* Pay Button CTA */}
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handlePayFee}
              className="btn btn-primary w-100 py-3 rounded-3 fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2"
              style={{ backgroundColor: "#0040e0", borderColor: "#0040e0" }}
            >
              {isProcessingPayment ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Securing Payment & Querying Bureau...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-lock"></i>
                  <span>Pay ₹150 & Proceed to Instant Bureau Check</span>
                  <i className="fa-solid fa-arrow-right ms-1"></i>
                </>
              )}
            </button>

            <div className="text-center mt-2">
              <span className="text-muted" style={{ fontSize: "11px" }}>
                🔒 128-bit SSL Secured • Instant Webhook Confirmation
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstantLoanStepPreEligibility;
