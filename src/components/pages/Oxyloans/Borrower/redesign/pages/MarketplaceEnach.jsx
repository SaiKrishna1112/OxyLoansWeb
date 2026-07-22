import React, { useEffect, useState, useRef } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import BorrowerHeader from "../../../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../../../SideBar/BorrowerSidebar";
import Footer from "../../../../../Footer/Footer";
import {
  listBorrowerLoanEnachMandates,
  startCashfreeEnachAuthorization,
  getCashfreeEnachStatus,
  cancelCashfreeEnach,
} from "../../../../../HttpRequest/afterlogin";
import "../redesign.css";

const MarketplaceEnach = () => {
  const { loanRequestId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryMandateId = searchParams.get("mandateId") || searchParams.get("mandate_id");

  const [step, setStep] = useState("check"); // check | authorize | success
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [mandates, setMandates] = useState([]);
  const [selectedMandate, setSelectedMandate] = useState(null);
  const [authData, setAuthData] = useState(null);
  const [statusResponse, setStatusResponse] = useState(null);

  const pollIntervalRef = useRef(null);

  useEffect(() => {
    // Preserve authentication state when returning from external eNACH redirect
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
    if (token) {
      sessionStorage.setItem("accessToken", token);
      localStorage.setItem("accessToken", token);
    }
    if (userId) {
      sessionStorage.setItem("userId", userId);
      localStorage.setItem("userId", userId);
    }

    document.body.classList.add("oxy-redesign-active");
    fetchMandates();
    return () => {
      document.body.classList.remove("oxy-redesign-active");
      stopPolling();
    };
  }, [loanRequestId, queryMandateId]);

  const cashfree = window.Cashfree({ mode: "sandbox" });

  const fetchMandates = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listBorrowerLoanEnachMandates(loanRequestId);
      const list = res?.data || [];
      setMandates(list);
      
      if (list.length > 0) {
        // If we have a queryMandateId from URL, find it in the list or use list[0]
        const mandateFromQuery = queryMandateId ? list.find(m => String(m.id) === String(queryMandateId)) : null;
        const currentMandate = mandateFromQuery || list[0];
        setSelectedMandate(currentMandate);
        
        // If already success/active, jump to success step
        if (
          currentMandate.mandateStatus === "SUCCESS" || 
          currentMandate.mandateStatus === "ACTIVE"
        ) {
          setStep("success");
        } else if (queryMandateId) {
          // If returning from redirect with a mandateId, set step to "authorize" and start polling
          setStep("authorize");
          startPolling(currentMandate.id);
          checkMandateStatus(currentMandate.id);
        } else {
          setStep("check");
        }
      } else {
        setError("No eNACH mandate found. Please ensure your eSign is completed successfully.");
      }
    } catch (e) {
      setError("Failed to retrieve eNACH mandates. Please check back later.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEnach = async () => {
    if (!selectedMandate) return;
    setLoading(true);
    setError("");
    console.log('enach started..........')

    try {
      const res = await startCashfreeEnachAuthorization(selectedMandate.id);
      if (res?.data && res?.data?.subscriptionSessionId) {
        setAuthData(res.data);
        setStep("authorize");
        
        // Open the authorizationUrl in a new tab
        // window.open(res.data.authorizationUrl, "_blank");
        console.log(res.data)
         // Start polling for status
        startPolling(selectedMandate.id);
        
        cashfree.subscriptionsCheckout({
          subsSessionId: res.data.subscriptionSessionId,
          redirectTarget: `https://user.oxyloans.com/enach/${loanRequestId}?mandateId=${selectedMandate.id}`
        }).then(function (result) {
          if (result && result.error) {
            console.error(result.error.message || result.error);
          }
        });
        
      } else {
        setError(res?.data?.message || "Failed to initiate Cashfree eNACH authorization.");
      }
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Error starting eNACH authorization.");
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (mandateId) => {
    stopPolling();
    pollIntervalRef.current = setInterval(() => {
      checkMandateStatus(mandateId, true);
    }, 5000); // Check status every 5 seconds
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const checkMandateStatus = async (mandateId, isPoll = false) => {
    if (!isPoll) setLoading(true);
    try {
      const res = await getCashfreeEnachStatus(mandateId);
      if (res?.data) {
        const data = res.data;
        setStatusResponse(data);
        
        if (data.subscription_status === "ACTIVE") {
          stopPolling();
          setStep("success");
          Swal.fire({
            title: "Mandate Active",
            text: "Your eNACH mandate has been successfully registered and is ACTIVE!",
            icon: "success",
            confirmButtonColor: "var(--oxy-primary)"
          });
        }
      }
    } catch (e) {
      // If manually checking, show error, otherwise ignore polling network hiccups
      if (!isPoll) {
        setError("Could not update eNACH status. Please check your bank authorization.");
      }
    } finally {
      if (!isPoll) setLoading(false);
    }
  };

  const handleCancelMandate = async () => {
    if (!selectedMandate) return;
    setLoading(true);
    try {
      const res = await cancelCashfreeEnach(selectedMandate.id);
      // Catalog expects: "allowed", "loanStillDue", "message", "mandateStatus"
      // "Show message that cancel is not allowed from app"
      const msg = res?.data?.message || "eNACH cancellation requests are not permitted directly by borrowers while loan obligations remain active.";
      Swal.fire({
        title: "Cancellation Request Denied",
        text: msg,
        icon: "warning",
        confirmButtonColor: "var(--oxy-primary)"
      });
    } catch (e) {
      const msg = e?.response?.data?.message || "Mandate cancellation cannot be performed from the borrower application.";
      Swal.fire({
        title: "Action Restricted",
        text: msg,
        icon: "error",
        confirmButtonColor: "var(--oxy-primary)"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <BorrowerHeader />
      <BorrowerSidebar />

      <div className="page-wrapper">
        <div className="content container-fluid py-4" style={{ backgroundColor: "var(--oxy-background)" }}>
          
          <div className="mb-4">
            <h3 className="fw-bold mb-1 text-dark">eNACH Auto-Debit Setup</h3>
            <span className="text-muted small">Authorize automatic monthly repayments for your active loan using NetBanking or Debit Card.</span>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8">

              {/* Stepper */}
              <div className="oxy-stepper-container d-flex justify-content-between align-items-center mb-4">
                {[
                  { key: "check", label: "1. Mandate Review", active: step === "check", done: step === "authorize" || step === "success" },
                  { key: "authorize", label: "2. Bank Authorization", active: step === "authorize", done: step === "success" },
                  { key: "success", label: "3. Mandate Active", active: step === "success", done: false },
                ].map((s, i) => (
                  <React.Fragment key={s.key}>
                    <div className={`oxy-step-item ${s.active ? "active" : ""} ${s.done ? "completed" : ""}`}>
                      <div className="oxy-step-circle">
                        {s.done ? "✓" : i + 1}
                      </div>
                      <span className="oxy-step-title d-block">{s.label}</span>
                    </div>
                    {i < 2 && (
                      <div style={{ flex: 1, height: 2, backgroundColor: "#e2e8f0", margin: "0 16px" }} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Error Box */}
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4 rounded-3">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span className="small">{error}</span>
                </div>
              )}

              {/* Loading Indicator */}
              {loading && step === "check" && (
                <div className="text-center py-5">
                  <span className="spinner-border text-primary spinner-border-lg"></span>
                  <p className="text-muted mt-3">Fetching mandate details, please wait...</p>
                </div>
              )}

              {/* Step 1: Review Mandate */}
              {!loading && step === "check" && selectedMandate && (
                <div className="oxy-card animate__animated animate__fadeIn">
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                      <h5 className="fw-bold text-dark mb-1">Repayment Account Authorization</h5>
                      <span className="text-muted small">Confirm details before redirecting to bank mandate authorization portal.</span>
                    </div>
                    <span className="oxy-badge-status oxy-badge-warning">
                      <i className="fa-solid fa-hourglass-start"></i>
                      {selectedMandate.mandateStatus || "PENDING"}
                    </span>
                  </div>

                  <div className="bg-light p-3 rounded-3 mb-4">
                    <div className="info-row">
                      <span className="info-label">Mandate Ref ID</span>
                      <span className="info-value text-dark">{selectedMandate.id}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Transaction ID</span>
                      <span className="info-value text-muted">{selectedMandate.mandateTransactionId || "—"}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Mandate Type</span>
                      <span className="info-value text-uppercase">{selectedMandate.mandateType || "CASHFREE"}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Maximum Debit Limit</span>
                      <span className="info-value text-success">₹ {Number(selectedMandate.maxAmount || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Loan Request ID</span>
                      <span className="info-value text-dark">{loanRequestId}</span>
                    </div>
                  </div>

                  <div className="alert alert-warning py-3 rounded-3 mb-4">
                    <div className="d-flex gap-2">
                      <i className="fa-solid fa-circle-info text-warning mt-1"></i>
                      <div className="small text-muted">
                        <strong>Security Note:</strong> Your account will not be charged instantly. This mandate establishes automated debits up to the maximum limit to satisfy repayments only on the EMI due dates.
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-3">
                    <button
                      className="oxy-btn-primary d-flex align-items-center gap-2"
                      onClick={handleStartEnach}
                    >
                      <i className="fa-solid fa-university"></i>
                      Configure Auto-Debit (eNACH)
                    </button>
                    {/* <button
                      className="oxy-btn-secondary text-danger"
                      onClick={handleCancelMandate}
                    >
                      <i className="fa-solid fa-ban me-1"></i>
                      Cancel Mandate
                    </button> */}
                    <Link to="/borrowerLoansInitiated" className="oxy-btn-secondary">
                      Go Back
                    </Link>
                  </div>
                </div>
              )}

              {/* Step 2: Verification / Authorize State */}
              {step === "authorize" && (
                <div className="oxy-card text-center py-4 animate__animated animate__fadeIn">
                  <div
                    className="mb-4 d-flex align-items-center justify-content-center bg-light rounded-circle mx-auto"
                    style={{ width: 80, height: 80 }}
                  >
                    <span className="spinner-border text-primary spinner-border-lg" style={{ width: "3rem", height: "3rem" }}></span>
                  </div>
                  
                  <h5 className="fw-bold text-dark mb-2">Awaiting Bank Approval</h5>
                  <p className="text-muted mx-auto" style={{ maxWidth: 500 }}>
                    We have redirected you to your bank's eNACH gateway in a new tab. Netbanking or Debit card OTP verification is required to finalize the auto-pay configuration.
                  </p>

                  <div className="d-flex justify-content-center gap-2 my-4">
                    <button
                      className="oxy-btn-primary d-flex align-items-center gap-2"
                      onClick={() => checkMandateStatus(selectedMandate.id)}
                      disabled={loading}
                    >
                      {loading && <span className="spinner-border spinner-border-sm"></span>}
                      <i className="fa-solid fa-arrows-rotate"></i>
                      Check Mandate Status
                    </button>
                  </div>

                  <span className="text-muted small">Status checks are automated. This page will update once the bank responds.</span>
                  
                  {statusResponse && (
                    <div className="mt-3 text-start mx-auto p-3 bg-light rounded-3" style={{ maxWidth: 500, fontSize: "12px" }}>
                      <span className="fw-bold text-dark d-block mb-1">Status Log:</span>
                      <span className="text-muted">Subscription: {statusResponse.subscription_status || "PENDING"}</span>
                      <span className="text-muted d-block">Message: {statusResponse.message || "Checking bank approval..."}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Success Screen */}
              {step === "success" && (
                <div className="oxy-card text-center py-5 animate__animated animate__fadeIn">
                  <div
                    className="mb-4 d-flex align-items-center justify-content-center bg-success text-white rounded-circle mx-auto"
                    style={{ width: 80, height: 80 }}
                  >
                    <i className="fa-solid fa-check fs-1"></i>
                  </div>
                  <h4 className="fw-bold text-success mb-2">eNACH Registered Successfully!</h4>
                  <p className="text-muted mx-auto mb-4" style={{ maxWidth: 500 }}>
                    Auto-debit setup is complete. Repayments for loan <strong>{loanRequestId}</strong> will be debited automatically from your linked bank account on scheduled EMI dates.
                  </p>

                  <div className="d-flex justify-content-center gap-3">
                    <button
                      className="oxy-btn-primary"
                      onClick={() => navigate("/borrowerDashboard")}
                    >
                      <i className="fa-solid fa-house me-2"></i>
                      Go to Dashboard
                    </button>
                    <Link to="/borrowerLoansInitiated" className="oxy-btn-secondary">
                      View My Loans
                    </Link>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MarketplaceEnach;
