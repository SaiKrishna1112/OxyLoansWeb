import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import { completeEsign, lenderBorrowerEsign, completeCashfreeEsign } from "../../../HttpRequest/afterlogin";

const LenderEsign = () => {
  const { loanRequestId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verificationId = searchParams.get("verification_id") || searchParams.get("verificationId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (verificationId) {
      verifyLenderEsign();
    } else {
      startLenderEsign();
    }
  }, [loanRequestId, verificationId]);

  const startLenderEsign = async () => {
    setLoading(true);
    setIsStarting(true);
    setError("");
    try {
      const res = await lenderBorrowerEsign(loanRequestId);
      const data = res?.data;
      if (data && (data.redirect_url || data.redirectUrl)) {
        const url = data.redirect_url || data.redirectUrl;
        // Redirect to the Cashfree / NSDL eSign portal
        window.open(url, "_self");
      } else if (res?.status === 200 || res?.request?.status === 200) {
        setSuccess(true);
        Swal.fire({
          title: "eSign Verified",
          text: "Lender eSign has been successfully verified and recorded!",
          icon: "success",
          confirmButtonColor: "#0040e0"
        });
      } else {
        setError("Failed to initiate eSign. Please try again.");
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to start eSign process. Please check your connection and try again.";
      setError(msg);
    } finally {
      setLoading(false);
      setIsStarting(false);
    }
  };

  const verifyLenderEsign = async () => {
    setLoading(true);
    setIsStarting(false);
    setError("");
    try {
      const res = await completeCashfreeEsign(loanRequestId);
      if (res?.status === 200 || res?.data) {
        setSuccess(true);
        Swal.fire({
          title: "eSign Verified",
          text: "Lender eSign has been successfully verified and recorded!",
          icon: "success",
          confirmButtonColor: "#0040e0"
        });
      } else {
        setError("Verification pending. If you completed signing, please click the retry button below.");
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to verify signature with Cashfree. Please make sure the eSign was completed.";
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
        <div className="content container-fluid py-5" style={{ backgroundColor: "#f8f9ff", minHeight: "90vh" }}>
          <div className="row justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <div className="col-md-6 col-lg-5">
              
              <div 
                className="card border-0 shadow-sm rounded-4 p-4 text-center" 
                style={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)" }}
              >
                {loading && (
                  <div className="py-5">
                    <div className="spinner-border text-primary spinner-border-lg mb-4" style={{ width: "3.5rem", height: "3.5rem" }} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <h4 className="fw-bold text-dark mb-2">
                      {isStarting ? "Preparing eSign Portal" : "Verifying eSign Status"}
                    </h4>
                    <p className="text-muted small px-3">
                      {isStarting 
                        ? "We are connecting to Cashfree to prepare your digital eSign agreement portal. You will be redirected shortly." 
                        : "We are communicating with the Cashfree eSign gateway to confirm and record your digital signature. Please do not close or reload this page."}
                    </p>
                  </div>
                )}

                {!loading && error && (
                  <div className="py-4 animate__animated animate__fadeIn">
                    <div 
                      className="mx-auto bg-danger-light text-danger rounded-circle d-flex align-items-center justify-content-center mb-4"
                      style={{ width: "80px", height: "80px", backgroundColor: "rgba(220, 53, 69, 0.1)" }}
                    >
                      <i className="fa-solid fa-triangle-exclamation fs-1"></i>
                    </div>
                    <h4 className="fw-bold text-danger mb-2">Process Interrupted</h4>
                    <p className="text-muted small mb-4 px-3">
                      {error}
                    </p>
                    <div className="d-flex flex-column gap-2 justify-content-center px-4">
                      <button 
                        className="btn btn-primary w-100" 
                        onClick={verificationId ? verifyLenderEsign : startLenderEsign}
                        style={{ backgroundColor: "#0040e0", borderColor: "#0040e0" }}
                      >
                        <i className="fa-solid fa-arrows-rotate me-2"></i> {verificationId ? "Retry Verification" : "Restart eSign Portal"}
                      </button>
                      <Link 
                        to="/offerGivenList" 
                        className="btn btn-outline-secondary w-100"
                      >
                        Back to Offers
                      </Link>
                    </div>
                  </div>
                )}

                {!loading && success && (
                  <div className="py-4 animate__animated animate__fadeIn">
                    <div 
                      className="mx-auto bg-success-light text-success rounded-circle d-flex align-items-center justify-content-center mb-4"
                      style={{ width: "80px", height: "80px", backgroundColor: "rgba(40, 167, 69, 0.1)" }}
                    >
                      <i className="fa-solid fa-circle-check fs-1"></i>
                    </div>
                    <h4 className="fw-bold text-success mb-2">eSign Verified!</h4>
                    <p className="text-muted small mb-4 px-3">
                      Your digital signature has been successfully verified. The peer-to-peer loan agreement is now legally executed.
                    </p>
                    <div className="px-4">
                      <Link 
                        to="/offerGivenList" 
                        className="btn btn-success w-100"
                        style={{ backgroundColor: "#28a745", borderColor: "#28a745" }}
                      >
                        <i className="fa-solid fa-list me-2"></i> Go to My Offers
                      </Link>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LenderEsign;
