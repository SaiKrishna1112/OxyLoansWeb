import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import BorrowerHeader from "../../../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../../../SideBar/BorrowerSidebar";
import Footer from "../../../../../Footer/Footer";
import { startCashfreeEsign, completeCashfreeEsign } from "../../../../../HttpRequest/afterlogin";
import "../redesign.css";

const MarketplaceEsign = () => {
  const { loanRequestId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verificationId = searchParams.get("verification_id") || searchParams.get("verificationId");

  const [step, setStep] = useState(verificationId ? "redirect" : "review"); // review | redirect | success
  const [aadharNumber, setAadharNumber] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");

  const handleVerifyCompletion = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await completeCashfreeEsign(loanRequestId);
      // Expected response contains userId, loanRequestId. If successful, proceed.
      if (res?.status === 200 || res?.data) {
        setStep("success");
        Swal.fire({
          title: "eSign Successful",
          text: "Your Aadhaar eSign has been recorded! Now proceed to setup eNACH auto-debit.",
          icon: "success",
          confirmButtonColor: "var(--oxy-primary)"
        });
      } else {
        setError("Verification pending. Please ensure you have completed the eSign in the opened window.");
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Verification failed. Please make sure you completed the signing process on Cashfree first.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.body.classList.add("oxy-redesign-active");
    if (verificationId) {
      handleVerifyCompletion();
    }
    return () => {
      document.body.classList.remove("oxy-redesign-active");
    };
  }, [loanRequestId, verificationId]);

  const handleStartEsign = async () => {
    if (!agreed) {
      setError("Please check the consent box to proceed.");
      return;
    }
    if (!aadharNumber || aadharNumber.length < 4) {
      setError("Please enter a valid Aadhaar number (at least 4 digits).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await startCashfreeEsign(loanRequestId, aadharNumber);
      if (res?.data && res?.data?.redirect_url) {
        const url = res.data.redirect_url;
        setRedirectUrl(url);
        setStep("redirect");
        
        // Try to open it in the same window/tab to ensure redirection back to /esign/:id works
        window.open(url, "_self");
      } else {
        const msg = res?.data?.message || "Failed to start eSign. Cashfree API did not return redirect URL.";
        setError(msg);
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to start eSign. Please try again.";
      setError(msg);
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
            <h3 className="fw-bold mb-1 text-dark">Aadhaar eSign</h3>
            <span className="text-muted small">Sign your loan agreement electronically using Aadhaar OTP verification via Cashfree.</span>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8">
              
              {/* Custom Stepper */}
              <div className="oxy-stepper-container d-flex justify-content-between align-items-center mb-4">
                {[
                  { key: "review", label: "1. Review & Consent", active: step === "review", done: step === "redirect" || step === "success" },
                  { key: "redirect", label: "2. NSDL eSign Portal", active: step === "redirect", done: step === "success" },
                  { key: "success", label: "3. Agreement Signed", active: step === "success", done: false },
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

              {/* Step 1: Review */}
              {step === "review" && (
                <div className="oxy-card">
                  <h5 className="fw-bold text-dark mb-3">Lending Agreement Verification</h5>
                  
                  <div
                    style={{
                      background: "var(--oxy-background)",
                      border: "1px solid var(--oxy-outline-variant)",
                      borderRadius: "var(--oxy-radius-sm)",
                      padding: 24,
                      maxHeight: 280,
                      overflowY: "auto",
                      fontSize: 13,
                      lineHeight: 1.8,
                      marginBottom: 20
                    }}
                  >
                    <h6 className="fw-bold text-dark mb-2">PEER-TO-PEER LENDING AGREEMENT</h6>
                    <p>
                      This agreement is digitally entered between the Borrower and the Lender
                      through OxyLoans (NBFC-P2P) as a facilitating platform, governed by the RBI Master 
                      Directions for NBFC-P2P Lending Platforms.
                    </p>
                    <p>
                      <strong>Loan Request ID:</strong> {loanRequestId || "—"}
                    </p>
                    <p>
                      By electronically signing this agreement using Aadhaar OTP, you accept full liability
                      to repay the principal and accrued interest through scheduled EMI auto-debits. 
                      Any default will be reported to credit information companies (CIBIL, etc.) and is subject 
                      to recovery action under applicable lending frameworks.
                    </p>
                    <p className="text-muted small">
                      This electronic signature is legally binding under Section 65B of the Indian Evidence Act 
                      and the Information Technology Act, 2000.
                    </p>
                  </div>

                  <div className="form-group mb-4">
                    <label className="form-label fw-semibold text-dark">
                      Enter Aadhaar Number / Virtual ID <span className="text-danger">*</span>
                    </label>
                    <div className="input-group" style={{ maxWidth: 350 }}>
                      <span className="input-group-text bg-light text-muted">
                        <i className="fa-solid fa-id-card"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="12-digit Aadhaar Number"
                        maxLength={12}
                        value={aadharNumber}
                        onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, ""))}
                      />
                    </div>
                    <span className="text-muted small d-block mt-1">We request this to verify your identity for signing.</span>
                  </div>

                  <div className="form-check mb-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="agreeTerms"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <label className="form-check-label text-muted small" htmlFor="agreeTerms">
                      I authorize OxyLoans to initiate the eSign transaction and verify my credentials against my Aadhaar records via NSDL.
                    </label>
                  </div>

                  <div className="d-flex gap-3">
                    <button
                      className="oxy-btn-primary d-flex align-items-center gap-2"
                      onClick={handleStartEsign}
                      disabled={loading || !agreed || aadharNumber.length < 4}
                    >
                      {loading && <span className="spinner-border spinner-border-sm"></span>}
                      <i className="fa-solid fa-signature"></i>
                      Proceed to eSign
                    </button>
                    <Link to="/my-marketplace-loans" className="oxy-btn-secondary">
                      Cancel
                    </Link>
                  </div>
                </div>
              )}

              {/* Step 2: Redirect Instructions */}
              {step === "redirect" && (
                <div className="oxy-card text-center py-4">
                  <div
                    className="mb-4 d-flex align-items-center justify-content-center bg-light rounded-circle mx-auto"
                    style={{ width: 80, height: 80 }}
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square text-primary fs-2"></i>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">NSDL Aadhaar Signing Window Opened</h5>
                  <p className="text-muted mx-auto" style={{ maxWidth: 500 }}>
                    We have redirected you to Cashfree's Aadhaar eSign interface in a new window. Please enter your Aadhaar card number, request OTP, and verify your signature.
                  </p>

                  <div className="bg-light p-3 rounded-3 mb-4 mx-auto text-start" style={{ maxWidth: 500, fontSize: 13 }}>
                    <div className="d-flex gap-2 align-items-start mb-2">
                      <span className="badge bg-primary rounded-circle p-1">1</span>
                      <span className="text-muted">Enter your Aadhaar details on the eSign portal.</span>
                    </div>
                    <div className="d-flex gap-2 align-items-start mb-2">
                      <span className="badge bg-primary rounded-circle p-1">2</span>
                      <span className="text-muted">Retrieve and verify the 6-digit OTP sent to your Aadhaar-linked mobile.</span>
                    </div>
                    <div className="d-flex gap-2 align-items-start">
                      <span className="badge bg-primary rounded-circle p-1">3</span>
                      <span className="text-muted">Once done, return to this tab and click the verification button below.</span>
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-2 justify-content-center align-items-center mb-3">
                    <button
                      className="oxy-btn-primary d-flex align-items-center gap-2"
                      onClick={handleVerifyCompletion}
                      disabled={loading}
                    >
                      {loading && <span className="spinner-border spinner-border-sm"></span>}
                      <i className="fa-solid fa-circle-check"></i>
                      I Have Completed eSign
                    </button>
                    
                    <a
                      href={redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-link text-primary text-decoration-none mt-2"
                    >
                      <i className="fa-solid fa-redo me-1"></i> Relaunch eSign Portal
                    </a>
                  </div>
                </div>
              )}

              {/* Step 3: Success */}
              {step === "success" && (
                <div className="oxy-card text-center py-5">
                  <div
                    className="mb-4 d-flex align-items-center justify-content-center bg-success text-white rounded-circle mx-auto"
                    style={{ width: 80, height: 80 }}
                  >
                    <i className="fa-solid fa-check fs-1"></i>
                  </div>
                  <h4 className="fw-bold text-success mb-2">Agreement Signed Successfully!</h4>
                  <p className="text-muted mx-auto mb-4" style={{ maxWidth: 500 }}>
                    Your loan agreement for Loan Request ID <strong>{loanRequestId}</strong> has been legally signed using digital Aadhaar authentication.
                  </p>

                  <div className="d-flex justify-content-center gap-3">
                    <button
                      className="oxy-btn-primary d-flex align-items-center gap-2"
                      onClick={() => navigate(`/enach/${loanRequestId}`)}
                    >
                      Proceed to eNACH Setup
                      <i className="fa-solid fa-arrow-right"></i>
                    </button>
                    <Link to="/my-marketplace-loans" className="oxy-btn-secondary">
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

export default MarketplaceEsign;
