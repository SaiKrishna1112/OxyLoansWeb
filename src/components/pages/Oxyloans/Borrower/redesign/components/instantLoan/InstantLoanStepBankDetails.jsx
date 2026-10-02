import React, { useState } from "react";
import Swal from "sweetalert2";
import { formatINR } from "../creditReportUtils";
import { verifyBankAccount } from "./instantLoanService";

const COMMON_BANKS = [
  "State Bank of India",
  "HDFC Bank",
  "ICICI Bank",
  "Kotak Mahindra Bank",
  "Axis Bank",
  "Punjab National Bank",
  "Bank of Baroda",
  "Canara Bank",
  "Union Bank of India",
  "IndusInd Bank",
];

const InstantLoanStepBankDetails = ({
  profileData,
  selectedOffer,
  applicationId = "41682",
  onBankVerified,
  onBack,
}) => {
  const [bankData, setBankData] = useState({
    accountHolderName: profileData.name || "BALIJEPALLI NARENDRA",
    bankName: "State Bank of India",
    accountNumber: "02529657461119",
    confirmAccountNumber: "02529657461119",
    ifscCode: "SBIN0005220",
    accountType: "SAVINGS",
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const netDisbursal = selectedOffer?.netDisbursal || 43672;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBankData((prev) => ({
      ...prev,
      [name]: name === "ifscCode" ? value.toUpperCase().slice(0, 11) : value,
    }));
  };

  const handleVerifyBank = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!bankData.accountNumber || bankData.accountNumber.length < 8) {
      setErrorMessage("Please enter a valid bank account number (min 8 digits).");
      return;
    }
    if (bankData.accountNumber !== bankData.confirmAccountNumber) {
      setErrorMessage("Account Number and Confirm Account Number do not match.");
      return;
    }
    if (!bankData.ifscCode || bankData.ifscCode.length !== 11) {
      setErrorMessage("Please enter an 11-character IFSC code (e.g. SBIN0005220).");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await verifyBankAccount(bankData);
      setIsVerifying(false);
      setVerifiedSuccess(true);

      Swal.fire({
        icon: "success",
        title: "Penny Drop Verification Succeeded! ✓",
        html: `
          <div class="text-center py-2">
            <span class="badge bg-success px-3 py-2 rounded-pill fs-6 mb-2">₹1.00 IMPS Deposit Verified</span>
            <p class="text-muted small mb-1">NPCI Beneficiary Match:</p>
            <h5 class="fw-bold text-dark mb-2">${res.verifiedName || bankData.accountHolderName}</h5>
            <p class="small text-muted mb-0">Account is now authenticated for direct escrow transfer of ${formatINR(netDisbursal)}.</p>
          </div>
        `,
        confirmButtonColor: "#0040e0",
        confirmButtonText: "Proceed to Disbursal Tracker",
      }).then(() => {
        onBankVerified({
          ...bankData,
          verifiedBeneficiaryName: res.verifiedName || bankData.accountHolderName,
          verifiedAt: new Date().toISOString(),
        });
      });
    } catch (err) {
      setIsVerifying(false);
      setErrorMessage("Failed to verify bank account. Please check IFSC and account number.");
    }
  };

  // Mask account number helper for card preview
  const maskAccNumber = (num) => {
    if (!num) return "•••• •••• •••• ••••";
    const clean = num.replace(/\s/g, "");
    if (clean.length <= 4) return clean;
    return `•••• •••• •••• ${clean.slice(-4)}`;
  };

  return (
    <form onSubmit={handleVerifyBank} className="fintech-card">
      {/* Step Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge badge-fintech-primary-soft px-3 py-1 rounded-pill small">
              Phase 6 • Disbursement Bank Verification
            </span>
            <span className="badge badge-fintech-neutral px-2 py-1 rounded-pill small">
              Step 6 of 6
            </span>
          </div>
          <h4 className="fw-bold text-dark mb-1">Disbursement Bank Account & Penny Drop</h4>
          <p className="text-muted small mb-0">
            Specify the bank account where your approved loan amount of <strong>{formatINR(netDisbursal)}</strong> will be credited.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="btn btn-sm btn-outline-secondary rounded-3 px-3"
        >
          <i className="fa-solid fa-arrow-left me-1"></i> Back to eSign/eNACH
        </button>
      </div>

      {errorMessage && (
        <div className="alert alert-danger border-0 rounded-4 p-3 small mb-4 d-flex align-items-center gap-3 shadow-xs">
          <div className="rounded-circle bg-danger bg-opacity-10 text-danger p-2">
            <i className="fa-solid fa-triangle-exclamation fs-5"></i>
          </div>
          <div>
            <strong className="d-block">Bank Verification Error</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* 3D Bank Metallic Card Graphic & Disbursal Callout */}
      <div className="row g-4 mb-4 align-items-center">
        <div className="col-lg-5">
          <div className="bank-metallic-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="fw-bold letter-spacing-1 text-white small">
                {bankData.bankName.toUpperCase()}
              </span>
              <span className="badge badge-fintech-white-translucent rounded-pill px-2 py-1 small" style={{ fontSize: "10px" }}>
                DIRECT DEPOSIT
              </span>
            </div>

            <div className="card-chip mb-3"></div>

            <div className="mb-3">
              <span className="text-white text-opacity-50 small d-block" style={{ fontSize: "10px" }}>
                ACCOUNT NUMBER
              </span>
              <h5 className="font-monospace letter-spacing-1 text-white mb-0">
                {maskAccNumber(bankData.accountNumber)}
              </h5>
            </div>

            <div className="d-flex justify-content-between align-items-end">
              <div>
                <span className="text-white text-opacity-50 small d-block" style={{ fontSize: "9px" }}>
                  BENEFICIARY
                </span>
                <span className="fw-bold small text-white text-uppercase">
                  {bankData.accountHolderName}
                </span>
              </div>
              <div className="text-end">
                <span className="text-white text-opacity-50 small d-block" style={{ fontSize: "9px" }}>
                  IFSC CODE
                </span>
                <span className="font-monospace small text-white">
                  {bankData.ifscCode}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="p-4 rounded-4 bg-light border h-100">
            <span className="badge badge-fintech-success-soft small px-2 py-1 rounded-pill mb-2">
              IMPS Direct Transfer Ready
            </span>
            <div className="d-flex justify-content-between align-items-baseline mb-2">
              <span className="text-muted small">Net Disbursal in Account:</span>
              <h3 className="fw-bold text-success mb-0">{formatINR(netDisbursal)}</h3>
            </div>
            <p className="text-muted small mb-3" style={{ fontSize: "12px" }}>
              Funds are held in <strong>OxyLoans Escrow Pool #{applicationId}</strong>. We perform an instant ₹1.00 Penny-Drop to verify your beneficiary account name before releasing funds.
            </p>
            <div className="d-flex align-items-center gap-2 text-muted small" style={{ fontSize: "11px" }}>
              <i className="fa-solid fa-bolt text-warning fs-6"></i>
              <span>Instant credit within 2 hours of Penny Drop confirmation.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label small fw-bold text-dark mb-1">
            Account Holder Name (As per Bank Records) <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="accountHolderName"
            value={bankData.accountHolderName}
            onChange={handleChange}
            className="form-control instant-form-control fw-bold"
            required
          />
          <small className="text-muted" style={{ fontSize: "11px" }}>
            Must match your verified PAN: <strong>{profileData.panNumber || "CDBPB2737H"}</strong>
          </small>
        </div>

        <div className="col-md-6">
          <label className="form-label small fw-bold text-dark mb-1">
            Bank Name <span className="text-danger">*</span>
          </label>
          <select
            name="bankName"
            value={bankData.bankName}
            onChange={handleChange}
            className="form-select instant-form-control"
          >
            {COMMON_BANKS.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label small fw-bold text-dark mb-1">
            Account Number <span className="text-danger">*</span>
          </label>
          <input
            type="password"
            name="accountNumber"
            value={bankData.accountNumber}
            onChange={handleChange}
            className="form-control instant-form-control font-monospace"
            placeholder="Enter full account number"
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label small fw-bold text-dark mb-1">
            Confirm Account Number <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="confirmAccountNumber"
            value={bankData.confirmAccountNumber}
            onChange={handleChange}
            className="form-control instant-form-control font-monospace"
            placeholder="Re-enter account number"
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label small fw-bold text-dark mb-1">
            Bank IFSC Code <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            name="ifscCode"
            value={bankData.ifscCode}
            onChange={handleChange}
            maxLength="11"
            className="form-control instant-form-control font-monospace text-uppercase fw-bold"
            placeholder="SBIN0005220"
            required
          />
          <small className="text-primary fw-semibold" style={{ fontSize: "11px" }}>
            <i className="fa-solid fa-location-dot me-1"></i>
            State Bank of India, KPHB Branch, Hyderabad
          </small>
        </div>

        <div className="col-md-6">
          <label className="form-label small fw-bold text-dark mb-1">
            Account Type
          </label>
          <select
            name="accountType"
            value={bankData.accountType}
            onChange={handleChange}
            className="form-select instant-form-control"
          >
            <option value="SAVINGS">Savings Account</option>
            <option value="CURRENT">Current Account</option>
          </select>
        </div>
      </div>

      {/* Action CTA */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-3 border-top">
        <div className="d-flex align-items-center gap-2 text-muted small">
          <i className="fa-solid fa-shield-halved text-success fs-6"></i>
          <span>NPCI-authorized Penny Drop. An instant deposit of ₹1.00 will be credited.</span>
        </div>

        <button
          type="submit"
          disabled={isVerifying}
          className="btn btn-primary px-4 py-3 rounded-3 fw-bold text-white shadow-sm"
          style={{ backgroundColor: "#0040e0", borderColor: "#0040e0" }}
        >
          {isVerifying ? (
            <>
              <i className="fa-solid fa-spinner fa-spin me-2"></i>
              Authenticating Penny Drop...
            </>
          ) : (
            <>
              Verify Account & Release Disbursal
              <i className="fa-solid fa-arrow-right ms-2"></i>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default InstantLoanStepBankDetails;
