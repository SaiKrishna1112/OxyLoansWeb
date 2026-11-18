import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import {
  lenderBorrowerEsign,
  completeCashfreeEsign,
  getUserDetails,
} from "../../../HttpRequest/afterlogin";

const LenderEsign = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract loanRequestId handling trailing slashes and query strings:
  // e.g. /lender_esign/1040972 or /lender_esign/1040972/ or ?loanId=1040972
  const getLoanRequestId = () => {
    let rawId = params.loanRequestId || params["*"] || "";
    if (rawId) {
      rawId = rawId.replace(/\/+$/, "").trim();
      const parts = rawId.split("/").filter(Boolean);
      if (parts.length > 0 && parts[0] !== "lender_esign") {
        return parts[0];
      }
    }

    const queryLoanId =
      searchParams.get("loanId") ||
      searchParams.get("loan_id") ||
      searchParams.get("loanRequestId") ||
      searchParams.get("loan_request_id");
    if (queryLoanId) {
      return queryLoanId.trim();
    }

    const pathname = window.location.pathname || "";
    const match = pathname.match(/\/lender_esign\/([^\/?#]+)/i);
    if (match && match[1]) {
      return match[1].replace(/\/+$/, "").trim();
    }

    return "";
  };

  const loanRequestId = getLoanRequestId();

  const getAssignmentId = () => {
    if (params.assignmentId) {
      return params.assignmentId.replace(/\/+$/, "").trim();
    }
    const queryAssignmentId =
      searchParams.get("assignmentId") ||
      searchParams.get("assignment_id") ||
      searchParams.get("id") ||
      searchParams.get("assignment");
    if (queryAssignmentId) {
      return queryAssignmentId.trim();
    }
    const pathname = window.location.pathname || "";
    const parts = pathname.split("?")[0].split("/").filter(Boolean);
    const index = parts.indexOf("lender_esign");
    if (index !== -1 && parts[index + 2]) {
      return parts[index + 2].replace(/\/+$/, "").trim();
    }
    return "";
  };

  const assignmentId = getAssignmentId();

  // Verification mode check:
  // Detects if `verification_id` or `verificationId` parameter is present in URL (returning from Cashfree)
  const hasVerificationIdParam =
    searchParams.has("verification_id") ||
    searchParams.has("verificationId") ||
    searchParams.has("verification_status") ||
    searchParams.has("status") ||
    window.location.search.includes("verification_id") ||
    window.location.search.includes("verificationId");

  const verificationId =
    searchParams.get("verification_id") ||
    searchParams.get("verificationId") ||
    searchParams.get("verification_status") ||
    searchParams.get("status");

  const isVerificationMode = Boolean(hasVerificationIdParam || verificationId);

  const [step, setStep] = useState(isVerificationMode ? "redirect" : "review"); // "review" | "redirect" | "success"
  const [aadharNumber, setAadharNumber] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");

  // Preserve authentication across external eSign redirection
  useEffect(() => {
    const token =
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken");
    const userId =
      localStorage.getItem("userId") || sessionStorage.getItem("userId");
    if (token) {
      sessionStorage.setItem("accessToken", token);
      localStorage.setItem("accessToken", token);
    }
    if (userId) {
      sessionStorage.setItem("userId", userId);
      localStorage.setItem("userId", userId);
    }
  }, []);

  // Pre-fill Aadhaar number from lender user profile
  useEffect(() => {
    if (!isVerificationMode) {
      getUserDetails()
        .then((res) => {
          if (res?.status === 200 || res?.data) {
            const num = res.data?.aadharNumber || res.data?.aadhaarNumber || "";
            if (num) setAadharNumber(num);
          }
        })
        .catch(() => {});
    }
  }, [isVerificationMode]);

  // If returning with verification parameter, run automatic verification
  useEffect(() => {
    if (isVerificationMode && loanRequestId) {
      handleVerifyCompletion();
    }
  }, [isVerificationMode, loanRequestId, assignmentId]);

  // Start Cashfree eSign
  const handleStartEsign = async () => {
    if (!loanRequestId) {
      setError("Invalid Loan Request ID. Please return to your loan offers list.");
      return;
    }
    if (!agreed) {
      setError("Please check the consent box to authorize eSign.");
      return;
    }
    if (!aadharNumber || aadharNumber.length < 4) {
      setError("Please enter a valid 12-digit Aadhaar number (at least 4 digits required).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const targetUrl = assignmentId
        ? `${window.location.origin}/lender_esign/${loanRequestId}/${assignmentId}`
        : `${window.location.origin}/lender_esign/${loanRequestId}`;

      const res = await lenderBorrowerEsign(
        loanRequestId,
        aadharNumber,
        assignmentId,
        targetUrl
      );

      const data = res?.data;
      if (data && (data.redirect_url || data.redirectUrl)) {
        const url = data.redirect_url || data.redirectUrl;
        setRedirectUrl(url);
        setStep("redirect");

        // Preserve session tokens before navigation
        const token =
          sessionStorage.getItem("accessToken") ||
          localStorage.getItem("accessToken");
        const userId =
          sessionStorage.getItem("userId") || localStorage.getItem("userId");
        if (token) localStorage.setItem("accessToken", token);
        if (userId) localStorage.setItem("userId", userId);

        // Open Cashfree NSDL eSign window
        window.open(url, "_self");
      } else if (res?.status === 200 || res?.request?.status === 200) {
        setStep("success");
        Swal.fire({
          title: "eSign Completed",
          text: "Lender digital signature has been recorded successfully!",
          icon: "success",
          confirmButtonColor: "#3d5ee1",
        });
      } else {
        const msg =
          res?.data?.message ||
          res?.data?.errorMessage ||
          "Failed to initiate Cashfree eSign session. Please try again.";
        setError(msg);
      }
    } catch (e) {
      const msg =
        e?.response?.data?.errorMessage ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to initiate eSign. Please verify your connection and try again.";
      setError(msg);
      Swal.fire({
        title: "eSign Initiation Failed",
        text: msg,
        icon: "error",
        confirmButtonColor: "#dc3545",
      });
    } finally {
      setLoading(false);
    }
  };

  // Verify Cashfree eSign Completion
  const handleVerifyCompletion = async () => {
    if (!loanRequestId) return;
    setLoading(true);
    setError("");

    try {
      const res = await completeCashfreeEsign(loanRequestId, assignmentId);
      if (res?.status === 200 || res?.data) {
        setStep("success");
        Swal.fire({
          title: "eSign Verified",
          text: "Your digital signature has been successfully verified and affixed to the loan agreement!",
          icon: "success",
          confirmButtonColor: "#3d5ee1",
        });
      } else {
        setError(
          "Verification pending. Please ensure you have completed the eSign in the opened window."
        );
      }
    } catch (e) {
      const msg =
        e?.response?.data?.errorMessage ||
        e?.response?.data?.message ||
        e?.message ||
        "Failed to verify signature with Cashfree. Please make sure the eSign was completed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <Header />
      <SideBar />

      <div className="page-wrapper">
        <div
          className="content container-fluid py-4"
          style={{ backgroundColor: "#f8f9ff", minHeight: "90vh" }}
        >
          {/* Page Heading */}
          <div className="mb-4">
            <h3 className="fw-bold mb-1 text-dark">Lender Aadhaar eSign</h3>
            <span className="text-muted small">
              Legally countersign the Peer-to-Peer Loan Agreement via Cashfree & UIDAI OTP verification.
            </span>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-8">
              {/* Custom Stepper */}
              <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded-3 shadow-xs">
                {[
                  {
                    key: "review",
                    label: "1. Review & Consent",
                    active: step === "review",
                    done: step === "redirect" || step === "success",
                  },
                  {
                    key: "redirect",
                    label: "2. NSDL eSign Portal",
                    active: step === "redirect",
                    done: step === "success",
                  },
                  {
                    key: "success",
                    label: "3. Agreement Signed",
                    active: step === "success",
                    done: false,
                  },
                ].map((s, i) => (
                  <React.Fragment key={s.key}>
                    <div
                      className={`d-flex align-items-center gap-2 ${
                        s.active
                          ? "text-primary fw-bold"
                          : s.done
                          ? "text-success fw-semibold"
                          : "text-muted"
                      }`}
                    >
                      <div
                        className={`d-inline-flex align-items-center justify-content-center rounded-circle ${
                          s.active
                            ? "bg-primary text-white shadow-xs"
                            : s.done
                            ? "bg-success text-white"
                            : "bg-light text-muted border"
                        }`}
                        style={{ width: 28, height: 28, fontSize: 13 }}
                      >
                        {s.done ? "✓" : i + 1}
                      </div>
                      <span className="small d-none d-sm-inline">{s.label}</span>
                    </div>
                    {i < 2 && (
                      <div
                        style={{
                          flex: 1,
                          height: 2,
                          backgroundColor: s.done ? "#28a745" : "#e2e8f0",
                          margin: "0 12px",
                        }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Error Alert */}
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4 rounded-3 shadow-xs">
                  <i className="fa-solid fa-triangle-exclamation text-danger fs-5"></i>
                  <span className="small flex-grow-1">{error}</span>
                </div>
              )}

              {/* Step 1: Review & Consent */}
              {step === "review" && (
                <div className="card border-0 shadow-sm rounded-4 p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0">
                      Peer-to-Peer Lending Agreement
                    </h5>
                    <span className="badge bg-primary-subtle text-primary px-3 py-1.5 rounded-pill small">
                      Loan Request #{loanRequestId || "—"}
                    </span>
                  </div>

                  <div
                    className="p-3 mb-4 rounded-3"
                    style={{
                      background: "#f8fafd",
                      border: "1px solid #e2e8f0",
                      maxHeight: 260,
                      overflowY: "auto",
                      fontSize: 13,
                      lineHeight: 1.8,
                    }}
                  >
                    <h6 className="fw-bold text-dark mb-2">
                      LEGAL P2P LENDING CONTRACT
                    </h6>
                    <p className="mb-2">
                      This peer-to-peer agreement is entered between the Lender and the Borrower
                      through <strong>OxyLoans</strong> (an RBI-regulated NBFC-P2P lending platform).
                    </p>
                    <p className="mb-2">
                      <strong>Loan Request Reference ID:</strong> {loanRequestId || "—"}
                      {assignmentId ? ` (Assignment #${assignmentId})` : ""}
                    </p>
                    <p className="mb-2">
                      By digitally signing this agreement using Aadhaar authentication, you confirm
                      participation and commitment of the allocated funds toward this loan. Repayments
                      will be routed via RBI Escrow directly to your designated lender account.
                    </p>
                    <p className="text-muted small mb-0">
                      This digital signature is legally valid under the Information Technology Act,
                      2000 and Section 65B of the Indian Evidence Act.
                    </p>
                  </div>

                  <div className="form-group mb-3">
                    <label className="form-label fw-semibold text-dark small">
                      Enter 12-Digit Aadhaar Number / VID <span className="text-danger">*</span>
                    </label>
                    <div className="input-group" style={{ maxWidth: 360 }}>
                      <span className="input-group-text bg-light text-muted">
                        <i className="fa-solid fa-id-card"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter 12-digit Aadhaar number"
                        maxLength={12}
                        value={aadharNumber}
                        onChange={(e) =>
                          setAadharNumber(e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </div>
                    <span
                      className="text-muted small d-block mt-1"
                      style={{ fontSize: "11px" }}
                    >
                      Used to initialize an official Aadhaar eSign session with Cashfree / UIDAI.
                    </span>
                  </div>

                  <div className="form-check mb-4">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="lenderConsentCheck"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <label
                      className="form-check-label text-muted small"
                      htmlFor="lenderConsentCheck"
                    >
                      I authorize OxyLoans to initiate the eSign transaction and verify my
                      credentials against my Aadhaar records via NSDL.
                    </label>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-primary px-4 fw-bold rounded-pill d-flex align-items-center gap-2"
                      onClick={handleStartEsign}
                      disabled={loading || !agreed || aadharNumber.length < 4}
                      style={{ backgroundColor: "#3d5ee1", borderColor: "#3d5ee1" }}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                          />
                          <span>Connecting to Cashfree...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-signature"></i>
                          <span>Proceed to Cashfree eSign</span>
                        </>
                      )}
                    </button>

                    <Link
                      to="/offerGivenList"
                      className="btn btn-outline-secondary rounded-pill px-4"
                    >
                      Cancel
                    </Link>
                  </div>
                </div>
              )}

              {/* Step 2: NSDL eSign Portal Redirect */}
              {step === "redirect" && (
                <div className="card border-0 shadow-sm rounded-4 p-4 text-center">
                  <div
                    className="mx-auto bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mb-3"
                    style={{ width: 70, height: 70, fontSize: 26 }}
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">
                    Cashfree Aadhaar eSign Portal Opened
                  </h5>
                  <p className="text-muted small mx-auto mb-3" style={{ maxWidth: 500 }}>
                    We have redirected you to Cashfree's Aadhaar eSign interface. Please enter
                    your Aadhaar details, request OTP, and verify your signature on the official portal.
                  </p>

                  <div
                    className="bg-light p-3 rounded-3 mb-4 mx-auto text-start"
                    style={{ maxWidth: 500, fontSize: 13 }}
                  >
                    <div className="d-flex gap-2 align-items-start mb-2">
                      <span className="badge bg-primary rounded-circle p-1">1</span>
                      <span className="text-muted">
                        Enter your Aadhaar details on the Cashfree/NSDL portal.
                      </span>
                    </div>
                    <div className="d-flex gap-2 align-items-start mb-2">
                      <span className="badge bg-primary rounded-circle p-1">2</span>
                      <span className="text-muted">
                        Enter and verify the 6-digit OTP sent to your Aadhaar-linked mobile.
                      </span>
                    </div>
                    <div className="d-flex gap-2 align-items-start">
                      <span className="badge bg-primary rounded-circle p-1">3</span>
                      <span className="text-muted">
                        Once done, click the verification button below to record the signature.
                      </span>
                    </div>
                  </div>

                  <div className="d-flex flex-column gap-2 justify-content-center align-items-center">
                    <button
                      type="button"
                      className="btn btn-success fw-bold rounded-pill px-4 d-flex align-items-center gap-2"
                      onClick={handleVerifyCompletion}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                          />
                          <span>Verifying Signature...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-circle-check"></i>
                          <span>I Have Completed eSign (Verify)</span>
                        </>
                      )}
                    </button>

                    {redirectUrl && (
                      <a
                        href={redirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-link text-primary text-decoration-none small mt-1"
                      >
                        <i className="fa-solid fa-redo me-1"></i> Relaunch eSign Portal
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Success */}
              {step === "success" && (
                <div className="card border-0 shadow-sm rounded-4 p-5 text-center">
                  <div
                    className="mx-auto bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center mb-3"
                    style={{ width: 72, height: 72, fontSize: 30 }}
                  >
                    <i className="fa-solid fa-circle-check"></i>
                  </div>
                  <h4 className="fw-bold text-success mb-2">
                    Lender Agreement Signed Successfully!
                  </h4>
                  <p className="text-muted small mx-auto mb-4" style={{ maxWidth: 500 }}>
                    Your digital signature has been permanently affixed to the loan agreement
                    for Loan Request ID <strong>#{loanRequestId}</strong> via Cashfree & UIDAI.
                    The contract is now legally enforceable.
                  </p>

                  <div className="d-flex justify-content-center flex-wrap gap-3">
                    <Link
                      to="/offerGivenList"
                      className="btn btn-primary rounded-pill px-4 fw-semibold"
                      style={{ backgroundColor: "#3d5ee1", borderColor: "#3d5ee1" }}
                    >
                      <i className="fa-solid fa-list me-1.5"></i> Return to My Offers
                    </Link>
                    <Link
                      to="/disburseLoans"
                      className="btn btn-outline-success rounded-pill px-4 fw-semibold"
                    >
                      <i className="fa-solid fa-money-bill-transfer me-1.5"></i> Disbursement Tracker
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LenderEsign;
