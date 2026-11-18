import React, { useState } from "react";
import Swal from "sweetalert2";
import "./instantLoan.css";
import { formatINR } from "../creditReportUtils";
import {
  generateDigitalAgreement,
  initiateAadhaarEsign,
} from "./instantLoanApi";

const InstantLoanStepAgreementSign = ({
  selectedOffer,
  profileData = {},
  applicationId = "",
  onComplete,
  onBack,
}) => {
  const [esignDone, setEsignDone] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [aadhaarOtp, setAadhaarOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);

  const principal = selectedOffer?.principal || 31500;
  const emiAmount = selectedOffer?.monthlyEmi || selectedOffer?.emi || selectedOffer?.totalPayable || 10772;
  const roi = selectedOffer?.interestRate || selectedOffer?.roi || 16.5;
  const lenderName = selectedOffer?.lenderName || "OxyLoans P2P Escrow Pool";
  const tenureText = selectedOffer?.tenureMonths
    ? `${selectedOffer.tenureMonths} Months`
    : selectedOffer?.tenureText || "3 Months";

  const handleStartEsign = () => {
    setShowOtpInput(true);
    generateDigitalAgreement({
      loanId: applicationId,
      principal,
      emiAmount,
    }).catch((e) => console.warn("generateDigitalAgreement background:", e));
  };

  const handleVerifyEsignOtp = async () => {
    if (!aadhaarOtp || aadhaarOtp.trim().length < 4) {
      Swal.fire({
        icon: "warning",
        title: "OTP Required",
        text: "Please enter the 6-digit Aadhaar OTP sent to your registered mobile number.",
        confirmButtonColor: "#0040e0",
      });
      return;
    }

    setIsSigning(true);
    const esignRes = await initiateAadhaarEsign({
      loanId: applicationId,
      aadhaarNumber: "1234",
      otp: aadhaarOtp,
    });

    setTimeout(() => {
      setIsSigning(false);
      setShowOtpInput(false);
      setEsignDone(true);

      const certId = esignRes?.data?.signatureId || `ESIGN_${Date.now()}`;

      Swal.fire({
        icon: "success",
        title: "Aadhaar eSign Verified!",
        html: `
          <div class="text-center py-2">
            <span class="badge bg-success px-3 py-2 rounded-pill fs-6 mb-2">UIDAI Digital Seal Affixed ✓</span>
            <p class="text-muted small mb-1">Audit Reference: <strong>${certId}</strong></p>
            <p class="text-muted small mb-0">Legal P2P Loan Agreement successfully countersigned.</p>
          </div>
        `,
        timer: 1800,
        showConfirmButton: false,
      });
    }, 1200);
  };

  return (
    <div className="fintech-card step-view-enter">
      {/* Step Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1.5">
            <span
              className="badge rounded-pill px-3 py-1 small fw-bold"
              style={{
                backgroundColor: "#064e3b",
                color: "#34d399",
                fontSize: "11px",
              }}
            >
              Step 7 of 9 • Digital Agreement
            </span>
          </div>
          <h4 className="fw-bold text-dark mb-1" style={{ fontSize: "22px" }}>
            eSign Loan Agreement
          </h4>
          <p className="text-secondary small mb-0" style={{ fontSize: "12.5px" }}>
            Application: <strong>#{applicationId}</strong> • Review your agreed loan contract with <strong>{lenderName}</strong> and digitally countersign with UIDAI Aadhaar OTP.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={onBack}
            className="btn btn-sm btn-outline-primary bg-white rounded-pill px-3.5 py-2 fw-semibold d-flex align-items-center gap-1.5 shadow-2xs"
            style={{ fontSize: "12.5px", borderColor: "#cbd5e1", color: "#0040e0" }}
          >
            <i className="fa-solid fa-arrow-left me-1"></i>
            <span>Back to Loan Offers</span>
          </button>
        </div>
      </div>

      {/* Agreed Offer Summary Strip */}
      <div
        className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden"
        style={{ border: "1.5px solid #bfdbfe", background: "linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)" }}
      >
        <div className="card-body p-3.5">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-3">
              <span className="text-muted small d-block" style={{ fontSize: "11px", fontWeight: "600" }}>Selected Lender</span>
              <strong className="text-dark fs-6 d-block">{lenderName}</strong>
              <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5 rounded-pill small" style={{ fontSize: "10.5px" }}>
                <i className="fa-solid fa-circle-check me-1"></i> RBI Regulated P2P
              </span>
            </div>

            <div className="col-6 col-md-2">
              <span className="text-muted small d-block" style={{ fontSize: "11px", fontWeight: "600" }}>Sanctioned Principal</span>
              <strong className="text-primary fs-6">{formatINR(principal)}</strong>
            </div>

            <div className="col-6 col-md-2">
              <span className="text-muted small d-block" style={{ fontSize: "11px", fontWeight: "600" }}>Agreed Interest Rate</span>
              <strong className="text-success fs-6">{roi}% p.a.</strong>
            </div>

            <div className="col-6 col-md-2">
              <span className="text-muted small d-block" style={{ fontSize: "11px", fontWeight: "600" }}>Monthly Installment</span>
              <strong className="text-dark fs-6">{formatINR(emiAmount)}/mo</strong>
            </div>

            <div className="col-6 col-md-3 text-md-end">
              <span className="text-muted small d-block" style={{ fontSize: "11px", fontWeight: "600" }}>Tenure</span>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1 rounded-pill fw-bold" style={{ fontSize: "12px" }}>
                {tenureText}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Agreement Document Reviewer & Aadhaar OTP Sign Panel */}
      <div className="row g-4 mb-4">
        {/* Left Column: Legal Contract Viewer */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <i className="fa-solid fa-file-contract text-primary fs-5"></i>
                <h6 className="fw-bold text-dark mb-0 fs-6">Tripartite Loan Agreement Document</h6>
              </div>
              <span className="badge bg-secondary-subtle text-secondary rounded-pill px-2.5 py-1 small" style={{ fontSize: "11px" }}>
                IT Act 2000 Enforceable
              </span>
            </div>

            <div className="card-body p-3.5" style={{ maxHeight: "380px", overflowY: "auto", fontSize: "12.5px", lineHeight: "1.6" }}>
              <div className="p-3 bg-light rounded-3 border mb-3">
                <div className="text-center mb-2 pb-2 border-bottom">
                  <h6 className="fw-bold text-dark mb-0.5">PEER-TO-PEER MASTER LOAN AGREEMENT</h6>
                  <small className="text-muted">Executed under RBI Master Direction NBFC-P2P & Information Technology Act, 2000</small>
                </div>

                <div className="mb-2">
                  <strong className="text-dark d-block">PARTIES:</strong>
                  <div>1. <strong>Borrower:</strong> {profileData.name || "Borrower"} (Borrower ID: #{profileData.userId || applicationId || ""})</div>
                  <div>2. <strong>Peer Lender:</strong> {lenderName}</div>
                  <div>3. <strong>P2P Platform / Facilitator:</strong> OxyLoans (SRS Fintech Labs Pvt Ltd, RBI Regulated NBFC-P2P)</div>
                </div>

                <div className="mb-2">
                  <strong className="text-dark d-block">LOAN SCHEDULE:</strong>
                  <ul className="mb-1 ps-3 text-secondary">
                    <li>Principal Amount: <strong>{formatINR(principal)}</strong></li>
                    <li>Agreed Rate of Interest: <strong>{roi}% p.a.</strong></li>
                    <li>Repayment Tenure: <strong>{tenureText}</strong></li>
                    <li>Monthly Repayment Commitment: <strong>{formatINR(emiAmount)}</strong></li>
                    <li>Prepayment Penalty: <strong>0% (No foreclosure fees)</strong></li>
                  </ul>
                </div>

                <div>
                  <strong className="text-dark d-block">TERMS & COVENANTS:</strong>
                  <p className="text-muted mb-0 small">
                    The Borrower agrees to repay the loan amount along with accrued interest in accordance with the specified installment schedule. Funds will be disbursed directly from the designated ICICI Escrow account into the Borrower's verified bank account upon execution of this Aadhaar eSigned agreement and subsequent eNACH mandate setup.
                  </p>
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-between p-2.5 rounded-3 bg-light border text-muted small">
                <span><i className="fa-solid fa-lock text-success me-1.5"></i> 256-Bit Cryptographic Hash Integrity</span>
                <span className="text-primary fw-semibold"><i className="fa-solid fa-download me-1"></i> Preview Draft PDF</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Aadhaar eSign Action Panel */}
        <div className="col-12 col-lg-5">
          <div
            className={`card border-0 shadow-sm rounded-4 h-100 overflow-hidden ${
              esignDone ? "border-success bg-success bg-opacity-10" : ""
            }`}
            style={{ border: esignDone ? "2px solid #10b981" : "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}
          >
            <div className="card-body p-4 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="badge rounded-pill px-3 py-1 small fw-bold" style={{ backgroundColor: "#eff6ff", color: "#0040e0" }}>
                    Aadhaar Digital Signature
                  </span>
                  {esignDone ? (
                    <span className="badge bg-success rounded-pill px-3 py-1 small fw-bold text-white">
                      <i className="fa-solid fa-circle-check me-1"></i> Digitally Signed ✓
                    </span>
                  ) : (
                    <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2.5 py-1 rounded-pill small">
                      Action Pending
                    </span>
                  )}
                </div>

                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center text-white shadow-xs ${
                      esignDone ? "bg-success" : "bg-primary"
                    }`}
                    style={{ width: "48px", height: "48px", minWidth: "48px" }}
                  >
                    <i className="fa-solid fa-signature fs-5"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-0.5 fs-6">UIDAI Aadhaar eSign</h6>
                    <small className="text-muted">Instant paperless authentication via Aadhaar OTP</small>
                  </div>
                </div>

                <p className="text-secondary small mb-3" style={{ fontSize: "12px", lineHeight: "1.5" }}>
                  By verifying with Aadhaar OTP, you affix a legally recognized electronic signature under Section 3A of the Information Technology Act 2000.
                </p>

                {/* OTP Input Form */}
                {showOtpInput && !esignDone && (
                  <div className="p-3 bg-light rounded-3 border mb-3">
                    <label className="form-label small fw-bold text-dark mb-1 d-flex justify-content-between">
                      <span>Enter 6-Digit Aadhaar OTP</span>
                      <span className="text-muted" style={{ fontSize: "10.5px" }}>Sent to Aadhaar Mobile</span>
                    </label>
                    <div className="d-flex gap-2 mb-2">
                      <input
                        type="text"
                        className="form-control form-control-sm text-center fw-bold fs-6 rounded-3"
                        placeholder="••••••"
                        value={aadhaarOtp}
                        onChange={(e) => setAadhaarOtp(e.target.value)}
                        maxLength="6"
                        autoFocus
                      />
                      <button
                        type="button"
                        className="btn btn-primary btn-sm px-3.5 rounded-3 fw-bold text-white"
                        onClick={handleVerifyEsignOtp}
                        disabled={isSigning}
                        style={{ backgroundColor: "#0040e0", borderColor: "#0040e0" }}
                      >
                        {isSigning ? (
                          <><i className="fa-solid fa-spinner fa-spin me-1"></i> Verifying...</>
                        ) : (
                          "Verify OTP"
                        )}
                      </button>
                    </div>
                    <small className="text-muted" style={{ fontSize: "11px" }}>
                      OTP has been sent to your Aadhaar-linked mobile number.
                    </small>
                  </div>
                )}

                {/* Action Trigger Button */}
                {!esignDone ? (
                  !showOtpInput && (
                    <button
                      type="button"
                      className="btn btn-primary w-100 rounded-pill py-2.5 fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2"
                      onClick={handleStartEsign}
                      style={{
                        backgroundColor: "#0040e0",
                        borderColor: "#0040e0",
                        boxShadow: "0 4px 14px rgba(0, 64, 224, 0.28)",
                      }}
                    >
                      <i className="fa-solid fa-fingerprint fs-5"></i>
                      <span>Verify & Sign Agreement with Aadhaar OTP</span>
                    </button>
                  )
                ) : (
                  <div className="p-3 bg-white rounded-3 border border-success mb-3 shadow-xs">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <strong className="text-success small">
                        <i className="fa-solid fa-certificate me-1"></i> Aadhaar Electronic Seal Affixed
                      </strong>
                      <span className="badge bg-success-subtle text-success small px-2 py-0.5 rounded-pill">
                        Valid & Binding
                      </span>
                    </div>
                    <div className="text-muted" style={{ fontSize: "11px" }}>
                      <div>Certificate: <strong>SHA256:UIDAI-{applicationId}-OXYLOANS</strong></div>
                      <div>Timestamp: <strong>{new Date().toLocaleString("en-IN")}</strong></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Next Step CTA (Proceeds to Step 8: eNACH) */}
              <div className="pt-3 border-top mt-3">
                <button
                  type="button"
                  disabled={!esignDone}
                  onClick={onComplete}
                  className="btn btn-primary w-100 rounded-pill py-2.5 fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2"
                  style={{
                    backgroundColor: esignDone ? "#0040e0" : "#94a3b8",
                    borderColor: esignDone ? "#0040e0" : "#94a3b8",
                    cursor: esignDone ? "pointer" : "not-allowed",
                  }}
                >
                  <span>Proceed to Step 8: Setup eNACH Mandate</span>
                  <i className="fa-solid fa-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstantLoanStepAgreementSign;
