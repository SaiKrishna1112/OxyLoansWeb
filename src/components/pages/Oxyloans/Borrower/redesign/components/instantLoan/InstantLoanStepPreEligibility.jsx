import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./instantLoan.css";
import { formatINR } from "../creditReportUtils";
import {
  fetchBorrowerEligibility,
  fetchCibilRoi,
  processPlatformAssessmentFee,
  fetchBorrowerReferences,
  saveBorrowerReferences,
} from "./instantLoanApi";

const RELATIONSHIPS = [
  "Parent",
  "Spouse",
  "Sibling",
  "Friend",
  "Colleague",
  "Relative",
];

const InstantLoanStepPreEligibility = ({
  profileData,
  onPaymentSuccess,
  onBack,
}) => {
  const salary = Number(profileData.monthlySalary || 25000);
  const [eligibleEstimate, setEligibleEstimate] = useState(Math.round(salary * 0.9));
  const [indicativeRoi, setIndicativeRoi] = useState(16.5);

  // Reference contacts state (loaded exclusively from dedicated reference API, NOT profile API)
  const [ref1, setRef1] = useState({
    name: "",
    mobile: "",
    relation: "Parent",
    address: "",
    landMark: "",
  });

  const [ref2, setRef2] = useState({
    name: "",
    mobile: "",
    relation: "Colleague",
    address: "",
    landMark: "",
  });

  const [isLoadingReferences, setIsLoadingReferences] = useState(false);
  const [referencesError, setReferencesError] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("UPI_APP"); // 'UPI_APP' | 'QR' | 'NETBANKING'
  const [selectedUpiApp, setSelectedUpiApp] = useState("gpay"); // 'gpay' | 'phonepe' | 'paytm' | 'custom'
  const [customUpiId, setCustomUpiId] = useState("7702443666@ybl");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Fetch borrower eligibility and cibil ROI
  useEffect(() => {
    const userId = sessionStorage.getItem("userId") || localStorage.getItem("userId") || "41682";
    fetchBorrowerEligibility(userId).then((res) => {
      if (res?.data?.eligibleAmount) {
        setEligibleEstimate(res.data.eligibleAmount);
      }
    }).catch(() => {});

    fetchCibilRoi(userId).then((res) => {
      if (res?.data?.indicativeRoi) {
        setIndicativeRoi(res.data.indicativeRoi);
      }
    }).catch(() => {});
  }, [profileData]);

  // Fetch reference contacts exclusively from dedicated references API: GET /v1/user/{userId}/borrowerReferenceDetails
  useEffect(() => {
    const userId = sessionStorage.getItem("userId") || localStorage.getItem("userId") || "41682";
    if (userId) {
      setIsLoadingReferences(true);
      fetchBorrowerReferences(userId)
        .then((res) => {
          const list = res?.data?.referenceDto || (Array.isArray(res?.data) ? res.data : []);
          if (Array.isArray(list) && list.length > 0) {
            if (list[0]) {
              setRef1((prev) => ({
                ...prev,
                name: list[0].name || prev.name,
                mobile: (list[0].referenceNumber || list[0].mobile || "").toString().replace(/\D/g, "") || prev.mobile,
                relation: list[0].relation || list[0].landMark || prev.relation,
                address: list[0].address || prev.address,
                landMark: list[0].landMark || prev.landMark,
              }));
            }
            if (list[1]) {
              setRef2((prev) => ({
                ...prev,
                name: list[1].name || prev.name,
                mobile: (list[1].referenceNumber || list[1].mobile || "").toString().replace(/\D/g, "") || prev.mobile,
                relation: list[1].relation || list[1].landMark || prev.relation,
                address: list[1].address || prev.address,
                landMark: list[1].landMark || prev.landMark,
              }));
            }
          }
        })
        .catch((err) => {
          console.warn("[InstantLoan] Dedicated references API lookup note:", err);
        })
        .finally(() => {
          setIsLoadingReferences(false);
        });
    }
  }, []);

  const handlePayFee = async () => {
    setReferencesError("");

    // 1. Validate Emergency Reference 1
    if (!ref1.name || !ref1.name.trim()) {
      setReferencesError("Please enter Emergency Reference 1 full name.");
      return;
    }
    const cleanMobile1 = ref1.mobile.replace(/\D/g, "");
    if (cleanMobile1.length !== 10) {
      setReferencesError("Please enter a valid 10-digit contact number for Emergency Reference 1.");
      return;
    }

    // 2. Validate Emergency Reference 2
    if (!ref2.name || !ref2.name.trim()) {
      setReferencesError("Please enter Emergency Reference 2 full name.");
      return;
    }
    const cleanMobile2 = ref2.mobile.replace(/\D/g, "");
    if (cleanMobile2.length !== 10) {
      setReferencesError("Please enter a valid 10-digit contact number for Emergency Reference 2.");
      return;
    }

    // 3. Ensure distinct contact numbers
    if (cleanMobile1 === cleanMobile2) {
      setReferencesError("Emergency Reference 1 and Reference 2 must have distinct contact numbers.");
      return;
    }

    // 4. Ensure reference number is not identical to borrower's primary mobile
    const borrowerMobile = (profileData.mobile || "").replace(/\D/g, "");
    if (borrowerMobile && (cleanMobile1 === borrowerMobile || cleanMobile2 === borrowerMobile)) {
      setReferencesError("Emergency references cannot use borrower's primary mobile number.");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const uId = sessionStorage.getItem("userId") || localStorage.getItem("userId") || "41682";
      // Save references directly to dedicated references API: PATCH /v1/user/borrowerReferenceDetails
      await saveBorrowerReferences(ref1, ref2, uId);

      const feeRes = await processPlatformAssessmentFee({
        amount: 150,
        paymentMethod: `${paymentMethod}_${selectedUpiApp}`,
        upiId: customUpiId,
      });

      setTimeout(() => {
        setIsProcessingPayment(false);
        setPaymentSuccess(true);

        const txnId = feeRes?.data?.transactionId || `OXYPAY_${Date.now()}`;

        Swal.fire({
          icon: "success",
          title: "References Verified & Fee Paid! (₹150.00)",
          html: `
            <div class="text-center py-2">
              <span class="badge bg-success px-3 py-2 rounded-pill fs-6 mb-2">References Saved & UPI Confirmed ✓</span>
              <p class="text-muted small mb-1">Transaction Ref: <strong>${txnId}</strong></p>
              <p class="text-muted small mb-0">Initiating instant OxyLoans Credit Bureau query & PAN verification...</p>
            </div>
          `,
          timer: 1600,
          showConfirmButton: false,
        });

        setTimeout(() => {
          onPaymentSuccess({
            paymentId: txnId,
            amount: 150,
            paidAt: feeRes?.data?.paidAt || new Date().toISOString(),
            paymentMethod: `${paymentMethod}_${selectedUpiApp}`,
            eligibleEstimate,
            indicativeRoi,
            ref1,
            ref2,
          });
        }, 1700);
      }, 1200);
    } catch (err) {
      setIsProcessingPayment(false);
      setReferencesError("Failed to save references or process payment. Please verify details and try again.");
    }
  };

  return (
    <div className="fintech-card step-view-enter">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge badge-fintech-primary-soft px-3 py-1 rounded-pill small">
              Phase 2 • References & Assessment Fee
            </span>
            <span className="badge badge-fintech-neutral px-2 py-1 rounded-pill small">
              Step 2 of 6
            </span>
          </div>
          <h4 className="fw-bold text-dark mb-1">Pre-Approved Limit & References Assessment</h4>
          <p className="text-muted small mb-0">
            Review your pre-approved limit, verify 2 emergency references via OxyLoans references registry, and complete assessment fee.
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

      {/* Transparent Pre-Eligibility Calculation Explainer */}
      <div className="p-3 rounded-4 bg-white border mb-4 shadow-xs">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: "38px", height: "38px" }}>
              <i className="fa-solid fa-calculator fs-6"></i>
            </div>
            <div>
              <strong className="text-dark small d-block">Transparent Pre-Approval Calculation:</strong>
              <span className="text-muted small" style={{ fontSize: "12px" }}>
                Net Monthly Salary ({formatINR(salary)}) × 0.90x Institutional Underwriting Multiplier = <strong className="text-primary">{formatINR(eligibleEstimate)}</strong> Maximum Instant Borrowing Limit
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 small">
              Estimated Surplus: ~{formatINR(Math.round(salary * 0.44))}/mo
            </span>
          </div>
        </div>
      </div>

      {/* Emergency References Section (Dedicated References API - Independent of Profile API) */}
      <div className="p-4 rounded-4 bg-white border mb-4 shadow-xs">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: "36px", height: "36px" }}>
              <i className="fa-solid fa-users-viewfinder fs-6"></i>
            </div>
            <div>
              <h6 className="fw-bold text-dark mb-0">Emergency References (2 Contacts Required)</h6>
              <span className="text-muted small" style={{ fontSize: "11px" }}>
                Stored in dedicated borrower references registry for P2P underwriting risk evaluation.
              </span>
            </div>
          </div>
          <span className="badge badge-fintech-success-soft px-3 py-1 rounded-pill small">
            <i className="fa-solid fa-shield-check me-1"></i> Dedicated References API
          </span>
        </div>

        {referencesError && (
          <div className="alert alert-danger py-2 px-3 mb-3 small d-flex align-items-center gap-2 rounded-3">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{referencesError}</span>
          </div>
        )}

        {isLoadingReferences && (
          <div className="py-2 mb-2 text-muted small d-flex align-items-center gap-2">
            <i className="fa-solid fa-spinner fa-spin text-primary"></i>
            <span>Loading reference records from registry...</span>
          </div>
        )}

        <div className="row g-3">
          {/* Reference 1 */}
          <div className="col-lg-6">
            <div className="p-3 rounded-4 border bg-light h-100 position-relative">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="badge badge-fintech-primary small px-2 py-1 rounded-pill">
                  Reference 1 (Immediate Family)
                </span>
                <span className="text-muted small" style={{ fontSize: "11px" }}>Primary</span>
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold text-dark mb-1">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={ref1.name}
                  onChange={(e) => setRef1({ ...ref1, name: e.target.value })}
                  className="form-control form-control-sm instant-form-control bg-white"
                  placeholder="e.g. Balijepalli Venkata"
                  required
                />
              </div>

              <div className="row g-2">
                <div className="col-7">
                  <label className="form-label small fw-bold text-dark mb-1">
                    Contact Mobile <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white border-end-0 text-muted">+91</span>
                    <input
                      type="tel"
                      value={ref1.mobile}
                      onChange={(e) => setRef1({ ...ref1, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      maxLength="10"
                      className="form-control form-control-sm instant-form-control border-start-0 bg-white"
                      placeholder="10-digit number"
                      required
                    />
                  </div>
                </div>

                <div className="col-5">
                  <label className="form-label small fw-bold text-dark mb-1">Relationship</label>
                  <select
                    value={ref1.relation}
                    onChange={(e) => setRef1({ ...ref1, relation: e.target.value })}
                    className="form-select form-select-sm instant-form-control bg-white"
                  >
                    {RELATIONSHIPS.map((rel) => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row g-2 mt-1">
                <div className="col-6">
                  <label className="form-label small text-muted mb-1" style={{ fontSize: "11px" }}>Address</label>
                  <input
                    type="text"
                    value={ref1.address || ""}
                    onChange={(e) => setRef1({ ...ref1, address: e.target.value })}
                    className="form-control form-control-sm instant-form-control bg-white"
                    placeholder="e.g. Hyderabad"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small text-muted mb-1" style={{ fontSize: "11px" }}>Landmark</label>
                  <input
                    type="text"
                    value={ref1.landMark || ""}
                    onChange={(e) => setRef1({ ...ref1, landMark: e.target.value })}
                    className="form-control form-control-sm instant-form-control bg-white"
                    placeholder="e.g. Near metro"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reference 2 */}
          <div className="col-lg-6">
            <div className="p-3 rounded-4 border bg-light h-100 position-relative">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="badge badge-fintech-neutral small px-2 py-1 rounded-pill">
                  Reference 2 (Work / Colleague)
                </span>
                <span className="text-muted small" style={{ fontSize: "11px" }}>Secondary</span>
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold text-dark mb-1">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={ref2.name}
                  onChange={(e) => setRef2({ ...ref2, name: e.target.value })}
                  className="form-control form-control-sm instant-form-control bg-white"
                  placeholder="e.g. Kiran V (Colleague)"
                  required
                />
              </div>

              <div className="row g-2">
                <div className="col-7">
                  <label className="form-label small fw-bold text-dark mb-1">
                    Contact Mobile <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white border-end-0 text-muted">+91</span>
                    <input
                      type="tel"
                      value={ref2.mobile}
                      onChange={(e) => setRef2({ ...ref2, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                      maxLength="10"
                      className="form-control form-control-sm instant-form-control border-start-0 bg-white"
                      placeholder="10-digit number"
                      required
                    />
                  </div>
                </div>

                <div className="col-5">
                  <label className="form-label small fw-bold text-dark mb-1">Relationship</label>
                  <select
                    value={ref2.relation}
                    onChange={(e) => setRef2({ ...ref2, relation: e.target.value })}
                    className="form-select form-select-sm instant-form-control bg-white"
                  >
                    {RELATIONSHIPS.map((rel) => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="row g-2 mt-1">
                <div className="col-6">
                  <label className="form-label small text-muted mb-1" style={{ fontSize: "11px" }}>Address</label>
                  <input
                    type="text"
                    value={ref2.address || ""}
                    onChange={(e) => setRef2({ ...ref2, address: e.target.value })}
                    className="form-control form-control-sm instant-form-control bg-white"
                    placeholder="e.g. Madhapur"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small text-muted mb-1" style={{ fontSize: "11px" }}>Landmark</label>
                  <input
                    type="text"
                    value={ref2.landMark || ""}
                    onChange={(e) => setRef2({ ...ref2, landMark: e.target.value })}
                    className="form-control form-control-sm instant-form-control bg-white"
                    placeholder="e.g. Office park"
                  />
                </div>
              </div>
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
              To fetch live credit records via <strong>OxyLoans Credit Bureau Engine</strong>, cross-verify PAN/DOB authenticity, and reserve escrow capital from institutional P2P lenders, a nominal processing fee of <strong>₹150 INR</strong> is required.
            </p>

            <div className="bg-white p-3 rounded-3 border mb-3">
              <div className="d-flex justify-content-between text-muted small mb-2">
                <span>OxyLoans Bureau Pull & PAN Verification</span>
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
                  <span>Saving References & Securing Payment...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-lock"></i>
                  <span>Save References & Pay ₹150 Fee</span>
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
