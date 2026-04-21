import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import { completeEsign } from "../../../HttpRequest/afterlogin";

const MarketplaceEsign = () => {
  const { loanRequestId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState("review"); // review | otp | success
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreementUrl, setAgreementUrl] = useState(null);
  const [agreed, setAgreed] = useState(false);

  // In local/dev mode OTP is always 1234
  const LOCAL_OTP = "1234";

  const sendOtp = () => {
    setLoading(true);
    setError("");
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
      setStep("otp");
    }, 800);
  };

  const verifyOtp = () => {
    if (otp !== LOCAL_OTP) {
      setError("Invalid OTP. (Local mode: use 1234)");
      return;
    }
    setLoading(true);
    setError("");
    completeEsign(loanRequestId)
      .then(() => {
        setStep("success");
      })
      .catch((e) => {
        const msg = e?.response?.data?.error || e?.message || "Failed to record eSign. Please try again.";
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <div className="main-wrapper">
        <BorrowerHeader />
        <BorrowerSidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="page-header">
              <div className="row">
                <div className="col">
                  <h3 className="page-title">eSign Loan Agreement</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/borrowerDashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="/my-marketplace-loans">My Loans</Link>
                    </li>
                    <li className="breadcrumb-item active">eSign</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="row justify-content-center">
              <div className="col-md-8">
                {/* Stepper */}
                <div className="d-flex align-items-center mb-4">
                  {[
                    { key: "review", label: "1. Review Agreement" },
                    { key: "otp", label: "2. Verify OTP" },
                    { key: "success", label: "3. Signed" },
                  ].map((s, i) => (
                    <React.Fragment key={s.key}>
                      <div
                        className="d-flex align-items-center"
                        style={{ opacity: step === s.key || (step === "success" && i < 3) ? 1 : 0.4 }}
                      >
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background:
                              step === s.key
                                ? "#1890ff"
                                : step === "success"
                                ? "#52c41a"
                                : "#d9d9d9",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: "bold",
                            flexShrink: 0,
                          }}
                        >
                          {step === "success" && i < 3 ? "✓" : i + 1}
                        </div>
                        <span className="ms-2" style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                          {s.label}
                        </span>
                      </div>
                      {i < 2 && (
                        <div
                          style={{
                            flex: 1,
                            height: 2,
                            background: "#e8e8e8",
                            margin: "0 12px",
                          }}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Step: Review */}
                {step === "review" && (
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">Loan Agreement Review</h5>
                    </div>
                    <div className="card-body">
                      <div
                        style={{
                          background: "#fafafa",
                          border: "1px solid #e8e8e8",
                          borderRadius: 6,
                          padding: 24,
                          minHeight: 300,
                          fontSize: 13,
                          lineHeight: 1.8,
                        }}
                      >
                        <p>
                          <strong>PEER-TO-PEER LENDING AGREEMENT</strong>
                        </p>
                        <p>
                          This agreement is entered into between the Borrower and the Lender
                          through OxyLoans (NBFC-P2P) as a facilitating platform, in accordance
                          with RBI Master Directions for NBFC-P2P Lending Platforms, 2017.
                        </p>
                        <p>
                          <strong>Loan Request ID:</strong> {loanRequestId || "—"}
                        </p>
                        <p>
                          By signing this agreement, the Borrower agrees to repay the loan amount
                          with agreed interest via EMIs on the scheduled due dates. Failure to pay
                          may result in escalation as per platform policy and RBI guidelines.
                        </p>
                        <p>
                          The Lender agrees to disburse the agreed loan amount to the Borrower's
                          registered bank account within the platform's disbursement timeline.
                        </p>
                        <p className="text-muted" style={{ fontSize: 11 }}>
                          This is a digitally-signed legally binding document. Both parties
                          consent to electronic execution under the IT Act, 2000.
                        </p>
                      </div>

                      <div className="form-check mt-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="agreeCheck"
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="agreeCheck">
                          I have read and agree to the terms of this Loan Agreement
                        </label>
                      </div>

                      {error && <div className="alert alert-danger mt-3">{error}</div>}

                      <div className="mt-4 d-flex gap-3">
                        <button
                          id="proceedBtn"
                          className="btn btn-primary"
                          disabled={!agreed || loading}
                          onClick={sendOtp}
                        >
                          {loading ? (
                            <span className="spinner-border spinner-border-sm me-2"></span>
                          ) : (
                            <i className="fa-solid fa-shield-halved me-2"></i>
                          )}
                          Proceed to OTP Verification
                        </button>
                        <Link to="/my-marketplace-loans" className="btn btn-outline-secondary">
                          Cancel
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step: OTP */}
                {step === "otp" && (
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">OTP Verification</h5>
                    </div>
                    <div className="card-body text-center py-5">
                      <i
                        className="fa-solid fa-mobile-screen mb-3"
                        style={{ fontSize: 48, color: "#1890ff" }}
                      ></i>
                      <p className="text-muted mb-4">
                        An OTP has been sent to your registered mobile number.
                        <br />
                        <span className="text-muted" style={{ fontSize: 12 }}>
                          (Local/dev mode: use <strong>1234</strong>)
                        </span>
                      </p>

                      <div className="row justify-content-center">
                        <div className="col-md-6">
                          <input
                            type="text"
                            className="form-control text-center mb-3"
                            placeholder="Enter 4-digit OTP"
                            maxLength={4}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            style={{ fontSize: 24, letterSpacing: 8, fontWeight: "bold" }}
                          />

                          {error && <div className="alert alert-danger">{error}</div>}

                          <button
                            className="btn btn-success w-100"
                            onClick={verifyOtp}
                            disabled={loading || otp.length < 4}
                          >
                            {loading ? (
                              <span className="spinner-border spinner-border-sm me-2"></span>
                            ) : (
                              <i className="fa-solid fa-pen-to-square me-2"></i>
                            )}
                            Verify & Sign Agreement
                          </button>

                          <button
                            className="btn btn-link btn-sm mt-2"
                            onClick={sendOtp}
                          >
                            Resend OTP
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step: Success */}
                {step === "success" && (
                  <div className="card text-center">
                    <div className="card-body py-5">
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: "50%",
                          background: "#f6ffed",
                          border: "3px solid #52c41a",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 20px",
                        }}
                      >
                        <i
                          className="fa-solid fa-check"
                          style={{ fontSize: 36, color: "#52c41a" }}
                        ></i>
                      </div>
                      <h4 className="text-success mb-2">Agreement Signed Successfully!</h4>
                      <p className="text-muted">
                        Your loan agreement for Loan Request ID{" "}
                        <strong>{loanRequestId}</strong> has been digitally signed.
                        <br />
                        The lender will be notified to proceed with disbursement.
                      </p>
                      <div className="mt-4 d-flex justify-content-center gap-3 flex-wrap">
                        <button
                          className="btn btn-success"
                          onClick={() => navigate(`/enach/${loanRequestId}`)}
                        >
                          <i className="fa-solid fa-arrow-right me-2"></i>
                          Proceed to eNACH Setup
                        </button>
                        <Link to="/my-marketplace-loans" className="btn btn-outline-primary">
                          <i className="fa-solid fa-list me-2"></i>
                          View My Loans
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MarketplaceEsign;
