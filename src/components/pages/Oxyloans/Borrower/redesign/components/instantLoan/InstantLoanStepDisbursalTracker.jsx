import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatINR, maskAccountNumber } from "../creditReportUtils";

const InstantLoanStepDisbursalTracker = ({
  applicationId = "41682",
  selectedOffer,
  profileData,
  bankData,
  onReset,
}) => {
  const navigate = useNavigate();

  const netDisbursal = selectedOffer?.netDisbursal || 43672;
  const principal = selectedOffer?.principal || 45000;
  const accNo = bankData?.accountNumber || "02529657461119";
  const bankName = bankData?.bankName || "State Bank of India";

  // Simulated countdown timer (1 hr 52 mins)
  const [secondsLeft, setSecondsLeft] = useState(6720);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="fintech-card">
      {/* Top Banner Status */}
      <div className="fintech-hero-dark mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge badge-fintech-warning px-3 py-1 rounded-pill small d-inline-flex align-items-center gap-2">
                <span className="pulse-beacon"></span>
                WAITING FOR DISBURSAL
              </span>
              <span className="text-white text-opacity-75 small">Application #{applicationId}</span>
            </div>

            <h1 className="display-6 fw-bold text-white mb-1">
              Disbursal in Progress: {formatINR(netDisbursal)}
            </h1>

            <p className="text-white text-opacity-80 small mb-0" style={{ maxWidth: "540px" }}>
              Escrow funds have been successfully locked and authorized for direct NEFT/IMPS credit to your verified bank account.
            </p>
          </div>

          <div className="text-md-end p-3 rounded-4 bg-white bg-opacity-10 border border-white border-opacity-10">
            <span className="text-white text-opacity-75 small d-block">Estimated Account Credit</span>
            <h3 className="fw-bold text-success mb-0 font-monospace">
              {formatCountdown(secondsLeft)}
            </h3>
            <span className="text-white text-opacity-75 small" style={{ fontSize: "11px" }}>
              Direct IMPS Switch Queue: #1
            </span>
          </div>
        </div>
      </div>

      {/* Disbursal Destination Summary */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="p-3 bg-light rounded-4 border h-100">
            <span className="text-muted small d-block mb-1">Crediting Bank Account</span>
            <h6 className="fw-bold text-dark mb-1">{bankName}</h6>
            <span className="text-muted small font-monospace">
              A/C: <strong>{maskAccountNumber(accNo)}</strong>
            </span>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-3 bg-light rounded-4 border h-100">
            <span className="text-muted small d-block mb-1">Matched P2P Escrow Pool</span>
            <h6 className="fw-bold text-dark mb-1">OxyLoans Escrow #{applicationId}</h6>
            <span className="text-success small fw-semibold">
              <i className="fa-solid fa-circle-check me-1"></i> 100% Capital Committed
            </span>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-3 bg-light rounded-4 border h-100">
            <span className="text-muted small d-block mb-1">Repayment Schedule</span>
            <h6 className="fw-bold text-dark mb-1">
              {selectedOffer?.selectedOfferType === "BULLET" ? "Single Bullet (30 Days)" : "3 Monthly EMIs"}
            </h6>
            <span className="text-primary small fw-semibold">
              <i className="fa-solid fa-bolt me-1"></i> NPCI eNACH Active
            </span>
          </div>
        </div>
      </div>

      {/* Live Banking Transfer Rail Tracker */}
      <div className="mb-4">
        <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <i className="fa-solid fa-timeline text-primary"></i>
          Live Banking Transfer Rail Tracker
        </h6>

        <div className="p-4 bg-white rounded-4 border shadow-xs">
          <div className="d-flex flex-column gap-3">
            {/* Step 1 */}
            <div className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle badge-fintech-success p-2 d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }}>
                  <i className="fa-solid fa-check small"></i>
                </div>
                <div>
                  <strong className="text-dark small d-block">1. Profile & Emergency References</strong>
                  <span className="text-muted small" style={{ fontSize: "11px" }}>
                    Verified borrower profile with 2 distinct emergency contacts
                  </span>
                </div>
              </div>
              <span className="badge badge-fintech-success-soft small px-3 py-1 rounded-pill">
                Completed ✓
              </span>
            </div>

            {/* Step 2 */}
            <div className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle badge-fintech-success p-2 d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }}>
                  <i className="fa-solid fa-check small"></i>
                </div>
                <div>
                  <strong className="text-dark small d-block">2. Platform Assessment Fee Paid (₹150)</strong>
                  <span className="text-muted small" style={{ fontSize: "11px" }}>
                    Txn verified via UPI switch • Bureau pipeline unlocked
                  </span>
                </div>
              </div>
              <span className="badge badge-fintech-success-soft small px-3 py-1 rounded-pill">
                Paid ₹150 ✓
              </span>
            </div>

            {/* Step 3 */}
            <div className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle badge-fintech-success p-2 d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }}>
                  <i className="fa-solid fa-check small"></i>
                </div>
                <div>
                  <strong className="text-dark small d-block">3. PaySprint Bureau & PAN/DOB Cross-Verification</strong>
                  <span className="text-muted small" style={{ fontSize: "11px" }}>
                    Score: 802 Prime+ • 100% Identity Match with NSDL records
                  </span>
                </div>
              </div>
              <span className="badge badge-fintech-success-soft small px-3 py-1 rounded-pill">
                Score 802 ✓
              </span>
            </div>

            {/* Step 4 */}
            <div className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle badge-fintech-success p-2 d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }}>
                  <i className="fa-solid fa-check small"></i>
                </div>
                <div>
                  <strong className="text-dark small d-block">4. Aadhaar Digital eSign & NPCI eNACH Mandate</strong>
                  <span className="text-muted small" style={{ fontSize: "11px" }}>
                    Legally executed under IT Act 2000 & NPCI auto-debit framework
                  </span>
                </div>
              </div>
              <span className="badge badge-fintech-success-soft small px-3 py-1 rounded-pill">
                Executed ✓
              </span>
            </div>

            {/* Step 5 */}
            <div className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle badge-fintech-success p-2 d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }}>
                  <i className="fa-solid fa-check small"></i>
                </div>
                <div>
                  <strong className="text-dark small d-block">5. Penny-Drop Account Authentication</strong>
                  <span className="text-muted small" style={{ fontSize: "11px" }}>
                    ₹1.00 IMPS deposit confirmed to: <strong>BALIJEPALLI NARENDRA</strong>
                  </span>
                </div>
              </div>
              <span className="badge badge-fintech-success-soft small px-3 py-1 rounded-pill">
                Verified ✓
              </span>
            </div>

            {/* Step 6: Live In Progress */}
            <div className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-primary bg-opacity-10 border border-primary border-opacity-25">
              <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle badge-fintech-primary p-2 d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }}>
                  <i className="fa-solid fa-paper-plane fa-fade small"></i>
                </div>
                <div>
                  <strong className="text-primary small d-block">
                    6. Escrow Fund Disbursal to {bankName}
                  </strong>
                  <span className="text-muted small" style={{ fontSize: "11px" }}>
                    IMPS batch queued with ICICI Escrow Trustee • Expected credit within 2 hours
                  </span>
                </div>
              </div>
              <span className="badge badge-fintech-primary small px-3 py-2 rounded-pill fw-bold">
                In Transit ⚡
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Documentation Kit */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="p-3 bg-light rounded-4 border d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-file-pdf text-danger fs-4"></i>
              <div>
                <strong className="text-dark small d-block">Digitally Signed Loan Agreement</strong>
                <span className="text-muted small" style={{ fontSize: "11px" }}>PDF • 342 KB • UIDAI Timestamped</span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary rounded-pill px-3"
              onClick={() => window.print()}
            >
              <i className="fa-solid fa-download me-1"></i> Download
            </button>
          </div>
        </div>

        <div className="col-md-6">
          <div className="p-3 bg-light rounded-4 border d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-file-invoice text-primary fs-4"></i>
              <div>
                <strong className="text-dark small d-block">Official Key Fact Statement (KFS)</strong>
                <span className="text-muted small" style={{ fontSize: "11px" }}>PDF • 180 KB • RBI Transparency Compliant</span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary rounded-pill px-3"
              onClick={() => window.print()}
            >
              <i className="fa-solid fa-download me-1"></i> Download
            </button>
          </div>
        </div>
      </div>

      {/* Support Strip & Restart Controls */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-3 border-top">
        <div className="text-muted small d-flex align-items-center gap-2">
          <i className="fa-solid fa-headset text-primary fs-5"></i>
          <div>
            <strong className="text-dark">Need assistance regarding your disbursal?</strong>
            <span className="d-block" style={{ fontSize: "11px" }}>
              Call our dedicated Escrow Desk at 1800-OXY-LOANS or email support@oxyloans.com
            </span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary rounded-3 px-3 py-2 small fw-semibold"
            onClick={onReset}
          >
            <i className="fa-solid fa-rotate-left me-1"></i> Restart Demo Journey
          </button>

          <button
            type="button"
            className="btn btn-primary rounded-3 px-4 py-2 small fw-bold text-white shadow-sm"
            onClick={() => navigate("/borrowerDashboard")}
            style={{ backgroundColor: "#0040e0", borderColor: "#0040e0" }}
          >
            Go to Dashboard
            <i className="fa-solid fa-arrow-right ms-2"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstantLoanStepDisbursalTracker;
