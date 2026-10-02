import React, { useState } from "react";
import Swal from "sweetalert2";
import { formatINR } from "../creditReportUtils";

const InstantLoanStepAgreementEnach = ({
  selectedOffer,
  profileData,
  applicationId = "41682",
  onComplete,
  onBack,
}) => {
  const [esignDone, setEsignDone] = useState(false);
  const [enachDone, setEnachDone] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isMandating, setIsMandating] = useState(false);
  const [aadhaarOtp, setAadhaarOtp] = useState("123456");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [mandateMode, setMandateMode] = useState("NETBANKING"); // NETBANKING | DEBITCARD

  const principal = selectedOffer?.principal || 45000;
  const emiAmount = selectedOffer?.monthlyEmi || selectedOffer?.totalPayable || 15340;

  const handleStartEsign = () => {
    setShowOtpInput(true);
  };

  const handleVerifyEsignOtp = () => {
    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      setShowOtpInput(false);
      setEsignDone(true);

      Swal.fire({
        icon: "success",
        title: "Aadhaar eSign Completed!",
        html: `
          <div class="text-center py-2">
            <span class="badge bg-success px-3 py-2 rounded-pill fs-6 mb-2">UIDAI Digital Seal Affixed ✓</span>
            <p class="text-muted small mb-0">Legal P2P Borrower Agreement digitally countersigned by UIDAI eSign service.</p>
          </div>
        `,
        timer: 1600,
        showConfirmButton: false,
      });
    }, 1200);
  };

  const handleSetupEnach = () => {
    setIsMandating(true);
    setTimeout(() => {
      setIsMandating(false);
      setEnachDone(true);

      Swal.fire({
        icon: "success",
        title: "NPCI eNACH Mandate Active!",
        html: `
          <div class="text-center py-2">
            <span class="badge bg-success px-3 py-2 rounded-pill fs-6 mb-2">UMRN: NACH_${Date.now().toString().slice(-8)}</span>
            <p class="text-muted small mb-0">Automated repayment mandate authorized through NPCI banking gateway.</p>
          </div>
        `,
        timer: 1600,
        showConfirmButton: false,
      });
    }, 1300);
  };

  const canProceed = esignDone && enachDone;

  return (
    <div className="fintech-card">
      {/* Step Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge badge-fintech-primary-soft px-3 py-1 rounded-pill small">
              Phase 5 • Digital Paperwork & Repayment Mandate
            </span>
            <span className="badge badge-fintech-neutral px-2 py-1 rounded-pill small">
              Step 5 of 6
            </span>
          </div>
          <h4 className="fw-bold text-dark mb-1">Aadhaar eSign & NPCI eNACH Mandate</h4>
          <p className="text-muted small mb-0">
            Application: <strong>#{applicationId}</strong> • Complete 2 instant digital steps to unlock escrow disbursement.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="btn btn-sm btn-outline-secondary rounded-3 px-3"
        >
          <i className="fa-solid fa-arrow-left me-1"></i> Back to Offers
        </button>
      </div>

      {/* Progress Pill Bar */}
      <div className="p-3 bg-light rounded-4 border mb-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <span className="badge badge-fintech-neutral px-3 py-2 rounded-pill small">
            Requirements Completed: {esignDone && enachDone ? "2 of 2" : esignDone || enachDone ? "1 of 2" : "0 of 2"}
          </span>
          {canProceed && (
            <span className="badge badge-fintech-success px-3 py-2 rounded-pill small fw-bold">
              Ready for Bank Disbursal ✓
            </span>
          )}
        </div>

        <div className="d-none d-sm-block text-muted small">
          Legally binding under IT Act 2000 & NPCI NACH Framework
        </div>
      </div>

      {/* Two Execution Cards Side by Side */}
      <div className="row g-4 mb-4">
        
        {/* Step 5A: Aadhaar eSign */}
        <div className="col-lg-6">
          <div
            className={`p-4 rounded-4 border h-100 transition-all ${
              esignDone ? "bg-success bg-opacity-10 border-success" : "bg-white shadow-xs"
            }`}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge badge-fintech-primary small px-2 py-1 rounded-pill">
                Action 1 of 2
              </span>
              {esignDone ? (
                <span className="badge badge-fintech-success small px-3 py-1 rounded-pill">
                  <i className="fa-solid fa-circle-check me-1"></i> Legally Signed
                </span>
              ) : (
                <span className="badge badge-fintech-warning-soft small px-2 py-1 rounded-pill">
                  Action Pending
                </span>
              )}
            </div>

            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className={`rounded-circle p-2 d-flex align-items-center justify-content-center ${
                  esignDone ? "badge-fintech-success" : "badge-fintech-primary"
                }`}
                style={{ width: "46px", height: "46px" }}
              >
                <i className="fa-solid fa-file-signature fs-5"></i>
              </div>
              <div>
                <h6 className="fw-bold text-dark mb-0">Aadhaar Digital eSign</h6>
                <small className="text-muted">UIDAI Timestamped Borrower Agreement</small>
              </div>
            </div>

            {/* Document preview snippet */}
            <div className="p-3 bg-light rounded-3 border mb-3 small" style={{ fontSize: "12px", maxHeight: "110px", overflowY: "auto" }}>
              <div className="d-flex justify-content-between text-muted mb-1">
                <span>Borrower:</span>
                <strong className="text-dark">{profileData.name}</strong>
              </div>
              <div className="d-flex justify-content-between text-muted mb-1">
                <span>Loan Principal:</span>
                <strong className="text-dark">{formatINR(principal)}</strong>
              </div>
              <div className="d-flex justify-content-between text-muted mb-1">
                <span>Escrow Pool:</span>
                <strong className="text-dark">OxyLoans Escrow #{applicationId}</strong>
              </div>
              <div className="d-flex justify-content-between text-muted">
                <span>IT Act 2000:</span>
                <span className="text-success fw-semibold">Digitally Enforceable</span>
              </div>
            </div>

            {showOtpInput && !esignDone && (
              <div className="p-3 bg-white rounded-3 border mb-3 shadow-xs">
                <label className="form-label small fw-bold text-dark mb-1">
                  Enter 6-Digit Aadhaar OTP (Demo: 123456)
                </label>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control form-control-sm text-center fw-bold letter-spacing-1 instant-form-control"
                    value={aadhaarOtp}
                    onChange={(e) => setAadhaarOtp(e.target.value)}
                    maxLength="6"
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm text-nowrap px-3 rounded-3 fw-bold"
                    onClick={handleVerifyEsignOtp}
                    disabled={isSigning}
                  >
                    {isSigning ? (
                      <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                      "Verify & Sign"
                    )}
                  </button>
                </div>
              </div>
            )}

            {!esignDone ? (
              !showOtpInput && (
                <button
                  type="button"
                  className="btn btn-primary w-100 rounded-3 py-2 fw-semibold text-white shadow-sm"
                  onClick={handleStartEsign}
                  style={{ backgroundColor: "#0040e0", borderColor: "#0040e0" }}
                >
                  <i className="fa-solid fa-fingerprint me-2"></i>
                  Sign Agreement via Aadhaar OTP
                </button>
              )
            ) : (
              <div className="alert alert-success border-0 rounded-3 p-2 small mb-0 text-center">
                <i className="fa-solid fa-stamp text-success me-1"></i>
                UIDAI eSign Authenticated • Ref: ESD_{applicationId}_OK
              </div>
            )}
          </div>
        </div>

        {/* Step 5B: NPCI eNACH Mandate */}
        <div className="col-lg-6">
          <div
            className={`p-4 rounded-4 border h-100 transition-all ${
              enachDone ? "bg-success bg-opacity-10 border-success" : "bg-white shadow-xs"
            }`}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="badge badge-fintech-primary small px-2 py-1 rounded-pill">
                Action 2 of 2
              </span>
              {enachDone ? (
                <span className="badge badge-fintech-success small px-3 py-1 rounded-pill">
                  <i className="fa-solid fa-circle-check me-1"></i> Mandate Active
                </span>
              ) : (
                <span className="badge badge-fintech-warning-soft small px-2 py-1 rounded-pill">
                  Action Pending
                </span>
              )}
            </div>

            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className={`rounded-circle p-2 d-flex align-items-center justify-content-center ${
                  enachDone ? "badge-fintech-success" : "badge-fintech-primary"
                }`}
                style={{ width: "46px", height: "46px" }}
              >
                <i className="fa-solid fa-building-columns fs-5"></i>
              </div>
              <div>
                <h6 className="fw-bold text-dark mb-0">NPCI eNACH Auto-Debit</h6>
                <small className="text-muted">Seamless Repayment Authorization</small>
              </div>
            </div>

            {/* Mandate Details */}
            <div className="p-3 bg-light rounded-3 border mb-3 small" style={{ fontSize: "12px" }}>
              <div className="d-flex justify-content-between text-muted mb-1">
                <span>Maximum Mandate Cap:</span>
                <strong className="text-dark">{formatINR(emiAmount * 1.2)} / mo</strong>
              </div>
              <div className="d-flex justify-content-between text-muted mb-1">
                <span>Scheduled Installment:</span>
                <strong className="text-dark">{formatINR(emiAmount)}</strong>
              </div>
              <div className="d-flex justify-content-between text-muted">
                <span>Authorized Switch:</span>
                <span className="text-primary fw-semibold">NPCI eNACH / NetBanking</span>
              </div>
            </div>

            {!enachDone ? (
              <div>
                {/* Method selector */}
                <div className="btn-group w-100 mb-2" role="group">
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      mandateMode === "NETBANKING" ? "btn-outline-primary active" : "btn-outline-secondary"
                    }`}
                    onClick={() => setMandateMode("NETBANKING")}
                  >
                    NetBanking
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      mandateMode === "DEBITCARD" ? "btn-outline-primary active" : "btn-outline-secondary"
                    }`}
                    onClick={() => setMandateMode("DEBITCARD")}
                  >
                    Debit Card
                  </button>
                </div>

                <button
                  type="button"
                  className="btn btn-outline-primary w-100 rounded-3 py-2 fw-semibold"
                  onClick={handleSetupEnach}
                  disabled={isMandating}
                >
                  {isMandating ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin me-2"></i>
                      Connecting to NPCI Gateway...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-bolt me-2"></i>
                      Authorize Auto-Debit Mandate
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="alert alert-success border-0 rounded-3 p-2 small mb-0 text-center">
                <i className="fa-solid fa-circle-check text-success me-1"></i>
                NPCI Mandate Registered • UMRN: NACH_8941291
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-3 border-top">
        <div className="text-muted small">
          {canProceed ? (
            <span className="text-success fw-bold">
              <i className="fa-solid fa-circle-check me-1"></i>
              Both legal execution steps completed. Proceed to verify receiving bank account.
            </span>
          ) : (
            <span className="text-muted">
              Please complete both Aadhaar eSign and eNACH Auto-Debit to continue.
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={!canProceed}
          onClick={onComplete}
          className="btn btn-primary px-4 py-3 rounded-3 fw-bold text-white shadow-sm"
          style={{ backgroundColor: "#0040e0", borderColor: "#0040e0" }}
        >
          Proceed to Bank Details & Disbursal
          <i className="fa-solid fa-arrow-right ms-2"></i>
        </button>
      </div>
    </div>
  );
};

export default InstantLoanStepAgreementEnach;
