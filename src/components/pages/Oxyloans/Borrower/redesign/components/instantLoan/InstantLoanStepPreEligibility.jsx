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
  getCashfreeInstance,
  recordFeePaymentOutcome,
} from "./instantLoanApi";
import { getpaymentorder } from "../../../../../../HttpRequest/afterlogin";

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
  payslipVerification,
  bankStatementVerification,
  onPaymentSuccess,
  onBack,
}) => {
  const salary = Number(
    profileData.verifiedSalary ||
    profileData.monthlySalary ||
    payslipVerification?.detectedSalary ||
    bankStatementVerification?.detectedSalary ||
    25000
  );
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


  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Fetch borrower eligibility and cibil ROI
  useEffect(() => {
    const userId = sessionStorage.getItem("userId") || localStorage.getItem("userId") || "";
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

  // Complete Payment handler (used by Cashfree modal callback, redirect verification, or direct flow)
  const handleCompletePayment = (txnId = null) => {
    setIsProcessingPayment(false);
    setPaymentSuccess(true);
    const resolvedTxn = txnId || `OXYCF_${Date.now()}`;

    Swal.fire({
      icon: "success",
      title: "References Verified & Fee Paid! (₹150.00)",
      html: `
        <div class="text-center py-2">
          <span class="badge bg-success px-3 py-2 rounded-pill fs-6 mb-2">Cashfree Payment Confirmed ✓</span>
          <p class="text-muted small mb-1">Transaction Ref: <strong>${resolvedTxn}</strong></p>
          <p class="text-muted small mb-0">Initiating instant OxyLoans Credit Bureau query & PAN verification...</p>
        </div>
      `,
      timer: 1600,
      showConfirmButton: false,
    });

    setTimeout(() => {
      onPaymentSuccess({
        paymentId: resolvedTxn,
        amount: 1,
        paidAt: new Date().toISOString(),
        paymentMethod: "CASHFREE_GATEWAY",
        payType: "CREDITREPORTFEE",
        eligibleEstimate,
        indicativeRoi,
        ref1,
        ref2,
      });
    }, 1700);
  };

  // Verify Cashfree payment if redirected back with myorder parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const myorder = urlParams.get("myorder") || urlParams.get("order_id");
    const uId = sessionStorage.getItem("userId") || localStorage.getItem("userId") || "";
    if (myorder && myorder !== "{order_id}") {
      getpaymentorder(myorder)
        .then(async (orderRes) => {
          const status = String(orderRes?.data?.order_status || orderRes?.data?.status || "").toUpperCase();
          if (status === "PAID" || status === "SUCCESS") {
            // SUCCESS time: hit API with payType = CREDITREPORTFEE
            try {
              await recordFeePaymentOutcome({
                userId: uId,
                status: "success",
                orderId: myorder,
                payType: "CREDITREPORTFEE",
              });
            } catch (e) {}
            handleCompletePayment(myorder);
          } else {
            // FAILURE time: hit API with payType = CREDITREPORTFEE
            try {
              await recordFeePaymentOutcome({
                userId: uId,
                status: "failure",
                orderId: myorder,
                payType: "CREDITREPORTFEE",
              });
            } catch (e) {}
            Swal.fire({
              icon: "error",
              title: "Payment Incomplete",
              text: "Platform assessment fee payment could not be confirmed. Please try again.",
              confirmButtonColor: "#0052ff",
            });
          }
        })
        .catch((e) => console.warn("Notice checking Cashfree return_url myorder:", e));
    }
  }, []);

  // Fetch reference contacts exclusively from dedicated references API: GET /v1/user/{userId}/borrowerReferenceDetails
  useEffect(() => {
    const userId = sessionStorage.getItem("userId") || localStorage.getItem("userId") || "";
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
      const uId = sessionStorage.getItem("userId") || localStorage.getItem("userId") || "";
      // 1. Save references directly to dedicated references API: PATCH /v1/user/borrowerReferenceDetails
      await saveBorrowerReferences(ref1, ref2, uId);

      // 2. Generate Cashfree Order for Platform Assessment Fee (₹150) - without payType
      const currentUrl = `${window.location.origin}${window.location.pathname}?myorder={order_id}`;
      const feeRes = await processPlatformAssessmentFee({
        userId: uId,
        amount: 1,
        paymentMethod: "CASHFREE_CHECKOUT",
        returnUrl: currentUrl,
      });

      const paymentSessionId = feeRes?.paymentSessionId;
      const orderId = feeRes?.orderId || `OXYCF_${Date.now()}`;

      // 3. Launch Cashfree Gateway checkout (Strict payment enforcement - no bypass)
      if (!paymentSessionId) {
        setIsProcessingPayment(false);
        Swal.fire({
          icon: "error",
          title: "Payment Order Failed",
          text: feeRes?.error || "Could not generate Cashfree payment session. Successful payment is mandatory to proceed.",
          confirmButtonColor: "#0040e0",
        });
        return;
      }

      const cashfree = getCashfreeInstance();
      if (!cashfree) {
        setIsProcessingPayment(false);
        Swal.fire({
          icon: "error",
          title: "Payment Gateway Error",
          text: "Cashfree SDK is not available. Please refresh the page and try again.",
          confirmButtonColor: "#0040e0",
        });
        return;
      }

      cashfree
        .checkout({
          paymentSessionId,
          redirectTarget: "_modal",
        })
        .then(async (result) => {
          if (result?.error) {
            console.warn("Cashfree checkout closed or failed:", result.error);
            setIsProcessingPayment(false);
            try {
              await recordFeePaymentOutcome({
                userId: uId,
                status: "failure",
                orderId,
                payType: "CREDITREPORTFEE",
              });
            } catch (e) {}
            Swal.fire({
              icon: "error",
              title: "Payment Not Completed",
              text: result.error?.message || "Payment was cancelled or failed. You cannot proceed to the next step without successful payment.",
              confirmButtonColor: "#0040e0",
            });
            return;
          }

          // Payment successfully completed via Cashfree
          try {
            await recordFeePaymentOutcome({
              userId: uId,
              status: "success",
              orderId,
              payType: "CREDITREPORTFEE",
            });
          } catch (e) {}
          handleCompletePayment(orderId);
        })
        .catch((modalErr) => {
          console.warn("Cashfree modal trigger notice, falling back to redirect:", modalErr);
          cashfree.checkout({
            paymentSessionId,
            redirectTarget: "_self",
          });
        });
      return;
    } catch (err) {
      setIsProcessingPayment(false);
      try {
        const uId = sessionStorage.getItem("userId") || localStorage.getItem("userId") || "";
        await recordFeePaymentOutcome({
          userId: uId,
          status: "failure",
          payType: "CREDITREPORTFEE",
        });
      } catch (e) {}
      setReferencesError("Failed to save references or initiate Cashfree payment. Please verify details and try again.");
    }
  };

  return (
    <div className="fintech-card step-view-enter">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge badge-fintech-primary-soft px-3 py-1 rounded-pill small">
              Phase 3 • References & Assessment Fee
            </span>
            <span className="badge badge-fintech-neutral px-2 py-1 rounded-pill small">
              Step 3 of 7
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
          <i className="fa-solid fa-arrow-left me-1"></i> Back to Income Verification
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

            {(bankStatementVerification?.verified || payslipVerification?.verified) ? (
              <div className="d-inline-flex flex-wrap align-items-center gap-2 px-3 py-1 rounded-pill bg-white text-dark small fw-bold mb-2 shadow-xs">
                <i className="fa-solid fa-circle-check text-success"></i>
                <span>
                  Income Authenticated: {formatINR(salary)}/mo
                  {bankStatementVerification?.verified && ` • Bank Inflow (${bankStatementVerification.bankName || "Bank"})`}
                  {payslipVerification?.verified && ` • Payslip (${payslipVerification.companyName || profileData.companyName || "Employer"})`}
                </span>
              </div>
            ) : null}
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
              <h5 className="fw-bold text-white mb-1">OxyLoans Escrow Pool</h5>
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
              <strong className="text-dark small d-block">
                Transparent Pre-Approval Calculation {
                  (bankStatementVerification?.verified || payslipVerification?.verified) && (
                    <span className="text-success ms-1">
                      ({bankStatementVerification?.verified ? "Bank Inflow" : ""}
                      {bankStatementVerification?.verified && payslipVerification?.verified ? " & " : ""}
                      {payslipVerification?.verified ? "Payslip OCR" : ""} Authenticated ✓)
                    </span>
                  )
                }:
              </strong>
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

      {/* Platform Assessment Fee Banner - Streamlined Cashfree PG */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 position-relative" style={{ border: "1px solid #e2e8f0" }}>
        {/* Top Accent Gradient Bar */}
        <div style={{ height: "4px", background: "linear-gradient(90deg, #0040e0 0%, #00d2ff 100%)" }} />

        <div className="card-body p-4">
          {/* Header Row: Title & Amount Pill */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-primary flex-shrink-0"
                style={{ width: "44px", height: "44px", backgroundColor: "rgba(0, 64, 224, 0.08)" }}
              >
                <i className="fa-solid fa-receipt fs-5"></i>
              </div>
              <div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <h6 className="fw-bold text-dark mb-0 fs-6">Platform Assessment Fee</h6>
                  <span className="badge rounded-pill px-2.5 py-1 text-primary fw-semibold" style={{ backgroundColor: "rgba(0, 64, 224, 0.1)", fontSize: "11px" }}>
                    One-Time Only
                  </span>
                  <span className="badge rounded-pill bg-danger-subtle text-danger fw-semibold px-2 py-1" style={{ fontSize: "11px" }}>
                    Non-Refundable
                  </span>
                  <span className="badge rounded-pill bg-success-subtle text-success fw-semibold px-2 py-1" style={{ fontSize: "11px" }}>
                    <i className="fa-solid fa-check me-1"></i> RBI Regulated
                  </span>
                </div>
                <small className="text-muted d-block mt-0.5" style={{ fontSize: "12px" }}>
                  Credit Bureau pull, PAN/DOB authenticity check &amp; instant escrow capital allocation.
                </small>
              </div>
            </div>

            {/* Total Fee Badge */}
            <div className="d-flex align-items-baseline gap-2 bg-light border px-3 py-2 rounded-3 ms-md-auto">
              <span className="text-muted small">Total Fee:</span>
              <span className="fs-5 fw-bold text-primary">₹150.00</span>
              <span className="text-muted" style={{ fontSize: "10px" }}>(incl. 18% GST)</span>
            </div>
          </div>

          {/* Fee Breakdown & Trust Badges Strip */}
          <div className="row g-2 mb-3">
            <div className="col-6 col-sm-3">
              <div className="p-2.5 rounded-3 bg-light border text-center">
                <span className="text-muted d-block" style={{ fontSize: "11px" }}>Bureau Pull &amp; PAN</span>
                <span className="fw-bold text-dark small">₹ 127.12</span>
              </div>
            </div>
            <div className="col-6 col-sm-3">
              <div className="p-2.5 rounded-3 bg-light border text-center">
                <span className="text-muted d-block" style={{ fontSize: "11px" }}>GST (18%)</span>
                <span className="fw-bold text-dark small">₹ 22.88</span>
              </div>
            </div>
            <div className="col-6 col-sm-3">
              <div className="p-2.5 rounded-3 bg-light border text-center">
                <span className="text-muted d-block" style={{ fontSize: "11px" }}>Security &amp; Escrow</span>
                <span className="fw-bold text-success small">
                  <i className="fa-solid fa-shield-check me-1"></i> 256-Bit SSL
                </span>
              </div>
            </div>
            <div className="col-6 col-sm-3">
              <div className="p-2.5 rounded-3 bg-light border text-center">
                <span className="text-muted d-block" style={{ fontSize: "11px" }}>Fee Policy</span>
                <span className="fw-bold text-danger small">Non-Refundable</span>
              </div>
            </div>
          </div>

          {/* Action Footer: Payment Info & Direct Checkout CTA */}
          <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-3 pt-3 border-top">
            <div className="d-flex flex-column gap-1">
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="badge bg-dark text-white rounded-pill px-2.5 py-1" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>
                  <i className="fa-solid fa-bolt text-warning me-1"></i> CASHFREE PG
                </span>
                <span className="text-muted small" style={{ fontSize: "12px" }}>
                  Accepts <strong>Google Pay • PhonePe • Paytm • Any UPI QR • Cards • NetBanking</strong>
                </span>
              </div>
              <span className="text-muted" style={{ fontSize: "11px" }}>
                🔒 256-bit bank-grade encryption • Instant webhook confirmation • Non-refundable assessment fee
              </span>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handlePayFee}
              className="btn btn-primary px-4 py-3 rounded-3 fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2 flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #0040e0 0%, #002db3 100%)",
                border: "none",
                fontSize: "15px",
                minWidth: "250px",
                boxShadow: "0 4px 14px rgba(0, 64, 224, 0.25)",
              }}
            >
              {isProcessingPayment ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Connecting to Cashfree...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-lock"></i>
                  <span>Pay ₹150 via Cashfree &amp; Proceed</span>
                  <i className="fa-solid fa-arrow-right ms-1"></i>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstantLoanStepPreEligibility;
