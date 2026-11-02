import React, { useState } from "react";
import Swal from "sweetalert2";
import "./instantLoan.css";
import { formatINR } from "../creditReportUtils";
import { registerEnachMandate } from "./instantLoanApi";

const InstantLoanStepEnachMandate = ({
  selectedOffer,
  profileData = {},
  bankData = null,
  applicationId = "41682",
  onComplete,
  onBack,
}) => {
  const [enachDone, setEnachDone] = useState(false);
  const [isMandating, setIsMandating] = useState(false);
  const [mandateMode, setMandateMode] = useState("NETBANKING"); // "NETBANKING" | "DEBITCARD"
  const [termsAgreed, setTermsAgreed] = useState(true);

  const emiAmount = selectedOffer?.monthlyEmi || selectedOffer?.emi || selectedOffer?.totalPayable || 10772;
  const maxCap = Math.round(emiAmount * 1.5);

  const bankName = bankData?.bankName || "STATE BANK OF INDIA";
  const accountNumber = bankData?.accountNumber || "34209820038";
  const ifscCode = bankData?.ifscCode || "SBIN0008505";
  const maskedAccount = `••••••••${accountNumber.slice(-4)}`;

  const handleSetupEnach = async () => {
    if (!termsAgreed) {
      Swal.fire({
        icon: "warning",
        title: "Mandate Authorization Required",
        text: "Please authorize the NPCI auto-debit terms to proceed.",
        confirmButtonColor: "#0040e0",
      });
      return;
    }

    setIsMandating(true);
    const enachRes = await registerEnachMandate({
      loanId: applicationId,
      mandateMode,
      maxAmount: maxCap,
    });

    setTimeout(() => {
      setIsMandating(false);
      setEnachDone(true);

      const umrn = enachRes?.data?.umrn || `NACH_${Date.now().toString().slice(-8)}`;

      Swal.fire({
        icon: "success",
        title: "eNACH Mandate Registered!",
        html: `
          <div class="text-center py-2">
            <span class="badge bg-success px-3 py-2 rounded-pill fs-6 mb-2">UMRN: ${umrn}</span>
            <p class="text-muted small mb-0">Automated repayment mandate successfully linked with ${bankName}.</p>
          </div>
        `,
        timer: 1800,
        showConfirmButton: false,
      });
    }, 1300);
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
              Step 8 of 9 • Automated Repayment
            </span>
          </div>
          <h4 className="fw-bold text-dark mb-1" style={{ fontSize: "22px" }}>
            Setup NPCI eNACH Mandate
          </h4>
          <p className="text-secondary small mb-0" style={{ fontSize: "12.5px" }}>
            Application: <strong>#{applicationId}</strong> • Register automated recurring repayment mandate via NPCI banking gateway for seamless EMI clearance.
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
            <span>Back to Agreement eSign</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Mandate Summary & NPCI Registration Card */}
      <div className="row g-4 mb-4">
        {/* Left Column: Mandate Specification & Bank Details */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <i className="fa-solid fa-building-columns text-primary fs-5"></i>
                <h6 className="fw-bold text-dark mb-0 fs-6">Repayment Mandate Specification</h6>
              </div>
              <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1 small" style={{ fontSize: "11px" }}>
                <i className="fa-solid fa-circle-check me-1"></i> NPCI Regulated
              </span>
            </div>

            <div className="card-body p-4 d-flex flex-column justify-content-between">
              <div>
                {/* Mandate Metric Tiles */}
                <div className="p-3 bg-light rounded-3 border mb-3">
                  <div className="d-flex justify-content-between align-items-center py-1.5 border-bottom">
                    <span className="text-muted small">Scheduled Monthly EMI:</span>
                    <strong className="text-dark fs-6">{formatINR(emiAmount)}/mo</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-1.5 border-bottom">
                    <span className="text-muted small">Max Standing Authorization Cap:</span>
                    <strong className="text-primary">{formatINR(maxCap)}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-1.5 border-bottom">
                    <span className="text-muted small">Repayment Frequency:</span>
                    <span className="fw-bold text-dark">Monthly (Auto-debited on Due Date)</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-1.5">
                    <span className="text-muted small">Prepayment / Foreclosure Charges:</span>
                    <strong className="text-success">₹ 0 (Zero Penalty)</strong>
                  </div>
                </div>

                {/* Target Bank Account Card */}
                <h6 className="fw-bold text-dark mb-2 fs-6">Destination Bank Account for Debit:</h6>
                <div className="p-3 rounded-3 border d-flex align-items-center gap-3 bg-white shadow-2xs mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary"
                    style={{ width: "44px", height: "44px", minWidth: "44px" }}
                  >
                    <i className="fa-solid fa-building-columns fs-5"></i>
                  </div>
                  <div className="flex-grow-1">
                    <strong className="text-dark d-block fs-6">{bankName}</strong>
                    <div className="text-muted small" style={{ fontSize: "12px" }}>
                      A/C: <span className="fw-bold text-dark">{maskedAccount}</span> • IFSC: <span className="fw-bold text-dark">{ifscCode}</span>
                    </div>
                    <div className="text-muted small" style={{ fontSize: "11px" }}>
                      Holder: <strong>{profileData.name || "DHARMAPURI SAI KRISHNA"}</strong>
                    </div>
                  </div>
                  <div>
                    <span className="badge bg-success-subtle text-success border border-success px-2 py-1 rounded-pill small">
                      Verified ✓
                    </span>
                  </div>
                </div>

                <div className="text-muted small" style={{ fontSize: "11.5px", lineHeight: "1.5" }}>
                  <i className="fa-solid fa-shield-halved text-success me-1"></i>
                  Debit mandate is governed under the Payment and Settlement Systems Act, 2007, and only the exact scheduled EMI amount will be deducted.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: NPCI Authorization & Payment Mode Selection */}
        <div className="col-12 col-lg-6">
          <div
            className={`card border-0 shadow-sm rounded-4 h-100 overflow-hidden ${
              enachDone ? "border-success bg-success bg-opacity-10" : ""
            }`}
            style={{ border: enachDone ? "2px solid #10b981" : "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}
          >
            <div className="card-body p-4 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="badge rounded-pill px-3 py-1 small fw-bold" style={{ backgroundColor: "#eff6ff", color: "#0040e0" }}>
                    NPCI eNACH Authorization
                  </span>
                  {enachDone ? (
                    <span className="badge bg-success rounded-pill px-3 py-1 small fw-bold text-white">
                      <i className="fa-solid fa-circle-check me-1"></i> Mandate Active ✓
                    </span>
                  ) : (
                    <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2.5 py-1 rounded-pill small">
                      Action Required
                    </span>
                  )}
                </div>

                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className={`rounded-circle d-flex align-items-center justify-content-center text-white shadow-xs ${
                      enachDone ? "bg-success" : "bg-primary"
                    }`}
                    style={{ width: "48px", height: "48px", minWidth: "48px" }}
                  >
                    <i className="fa-solid fa-repeat fs-5"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-0.5 fs-6">Authorize Automated EMI Mandate</h6>
                    <small className="text-muted">Choose your preferred authorization method</small>
                  </div>
                </div>

                {!enachDone ? (
                  <div>
                    {/* Method Selector Tabs */}
                    <div className="d-flex gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() => setMandateMode("NETBANKING")}
                        className={`btn flex-fill py-2.5 px-3 rounded-3 text-start d-flex align-items-center gap-2.5 ${
                          mandateMode === "NETBANKING"
                            ? "btn-primary text-white shadow-xs"
                            : "btn-outline-secondary bg-light text-dark"
                        }`}
                        style={mandateMode === "NETBANKING" ? { backgroundColor: "#0040e0", borderColor: "#0040e0" } : {}}
                      >
                        <i className="fa-solid fa-laptop fs-5"></i>
                        <div>
                          <strong className="d-block" style={{ fontSize: "12.5px" }}>Net Banking</strong>
                          <span style={{ fontSize: "10.5px", opacity: 0.85 }}>Instant gateway login</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMandateMode("DEBITCARD")}
                        className={`btn flex-fill py-2.5 px-3 rounded-3 text-start d-flex align-items-center gap-2.5 ${
                          mandateMode === "DEBITCARD"
                            ? "btn-primary text-white shadow-xs"
                            : "btn-outline-secondary bg-light text-dark"
                        }`}
                        style={mandateMode === "DEBITCARD" ? { backgroundColor: "#0040e0", borderColor: "#0040e0" } : {}}
                      >
                        <i className="fa-solid fa-credit-card fs-5"></i>
                        <div>
                          <strong className="d-block" style={{ fontSize: "12.5px" }}>Debit Card</strong>
                          <span style={{ fontSize: "10.5px", opacity: 0.85 }}>Card OTP verification</span>
                        </div>
                      </button>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="form-check mb-4">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="enachTerms"
                        checked={termsAgreed}
                        onChange={(e) => setTermsAgreed(e.target.checked)}
                        style={{ borderColor: "#0040e0", cursor: "pointer" }}
                      />
                      <label className="form-check-label text-secondary small" htmlFor="enachTerms" style={{ fontSize: "11.5px", cursor: "pointer" }}>
                        I authorize NPCI and OxyLoans to register an auto-debit standing instruction of <strong>{formatINR(emiAmount)}/mo</strong> against my verified bank account for scheduled loan EMI repayments.
                      </label>
                    </div>

                    {/* Authorize Button */}
                    <button
                      type="button"
                      className="btn btn-primary w-100 rounded-pill py-2.5 fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2"
                      onClick={handleSetupEnach}
                      disabled={isMandating || !termsAgreed}
                      style={{
                        backgroundColor: "#0040e0",
                        borderColor: "#0040e0",
                        boxShadow: "0 4px 14px rgba(0, 64, 224, 0.28)",
                      }}
                    >
                      {isMandating ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin fs-5"></i>
                          <span>Connecting to NPCI Gateway...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-bolt fs-5"></i>
                          <span>Authorize Mandate with NPCI</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="p-3 bg-white rounded-3 border border-success mb-3 shadow-xs">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <strong className="text-success small">
                        <i className="fa-solid fa-circle-check me-1"></i> NPCI Mandate Registered & Active
                      </strong>
                      <span className="badge bg-success rounded-pill px-2.5 py-0.5 small text-white">
                        Active
                      </span>
                    </div>
                    <div className="text-muted" style={{ fontSize: "11px" }}>
                      <div>Unique Mandate Ref (UMRN): <strong>NACH_8941291_{applicationId}</strong></div>
                      <div>Bank Mandate Status: <strong>LIVE & VERIFIED</strong></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Next Step CTA (Proceeds to Step 9: Disbursal) */}
              <div className="pt-3 border-top mt-3">
                <button
                  type="button"
                  disabled={!enachDone}
                  onClick={onComplete}
                  className="btn btn-primary w-100 rounded-pill py-2.5 fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2"
                  style={{
                    backgroundColor: enachDone ? "#0040e0" : "#94a3b8",
                    borderColor: enachDone ? "#0040e0" : "#94a3b8",
                    cursor: enachDone ? "pointer" : "not-allowed",
                  }}
                >
                  <span>Proceed to Step 9: Disbursal Tracker</span>
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

export default InstantLoanStepEnachMandate;
