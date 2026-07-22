import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import BorrowerHeader from "../../../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../../../SideBar/BorrowerSidebar";
import Footer from "../../../../../Footer/Footer";

import {
  getBorrowerEligibleAmount,
  getUserId,
  submitBorrowerLoanRequest,
  getBorrowerRequestAmount,
  getUserDetails,
} from "../../../../../HttpRequest/afterlogin";
import FeeConfigInfo from "../../FeeConfigInfo";
import "../redesign.css";

const LoanRequest = () => {
  const navigate = useNavigate();
  const [requestAmount, setRequestAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oxyscore,setOxyScore]=useState()
  
  const [eligibleAmount, setEligibleAmount] = useState({
    amount: null,
    processingFee: 0,
    verifiedMonthlyIncome: 0,
  });
  const [isEligibleLoading, setIsEligibleLoading] = useState(true);
  const [eligibleErrorMessage, setEligibleErrorMessage] = useState("");

  const [requestStatusInfo, setRequestStatusInfo] = useState({
    loading: true,
    status: "",
    pendingAmount: 0,
    requestAmount: 0,
    message: "",
  });

  const [cibilInfo, setCibilInfo] = useState({ loading: true, data: null });

  const borrowerId = getUserId() || "";

  useEffect(() => {
    document.body.classList.add("oxy-redesign-active");
    return () => {
      document.body.classList.remove("oxy-redesign-active");
    };
  }, []);

  useEffect(() => {
    const fetchCibilRoi = async () => {
      if (!borrowerId) { setCibilInfo({ loading: false, data: null }); return; }
      try {
        const res = await getCibilBasedRoi();
        setCibilInfo({ loading: false, data: res?.status === 200 ? res.data : null });
      } catch {
        setCibilInfo({ loading: false, data: null });
      }
    };
    fetchCibilRoi();
    getUserDetails().then(res=>{
      setOxyScore(res.data.profileScore)
    })
  }, [borrowerId]);

  useEffect(() => {
    const fetchEligibleAmount = async () => {
      if (!borrowerId) {
        setEligibleErrorMessage("Your session has expired. Please sign in again.");
        setIsEligibleLoading(false);
        return;
      }

      setIsEligibleLoading(true);
      setEligibleErrorMessage("");
      try {
        const response = await getBorrowerEligibleAmount();
        const status = response?.status ?? response?.request?.status;
        if (status === 200) {
          const limitAmount = Number(response?.data?.amount ?? 0);
          const processingFee = Number(response?.data?.processingfee ?? 0);
          const verifiedMonthlyIncome = Number(response?.data?.verifiedMonthlyIncome ?? 0);
          setEligibleAmount({
            amount: isNaN(limitAmount) ? 0 : limitAmount,
            processingFee: isNaN(processingFee) ? 0 : processingFee,
            verifiedMonthlyIncome: isNaN(verifiedMonthlyIncome) ? 0 : verifiedMonthlyIncome,
          });
        } else {
          const apiErrorMsg =
            response?.data?.errorMessage ||
            response?.response?.data?.errorMessage ||
            response?.data?.message ||
            "Unable to fetch your eligible amount. Please try again.";
          setEligibleErrorMessage(apiErrorMsg);
        }
      } catch (error) {
        const apiErrorMsg =
          error?.response?.data?.errorMessage ||
          error?.data?.errorMessage ||
          error?.response?.data?.message ||
          error?.data?.message ||
          error?.message ||
          "Unable to fetch your eligible amount. Please try again.";
        setEligibleErrorMessage(apiErrorMsg);
      }
      setIsEligibleLoading(false);
    };

    fetchEligibleAmount();
  }, [borrowerId]);

  useEffect(() => {
    const fetchBorrowerRequestStatus = async () => {
      if (!borrowerId) {
        setRequestStatusInfo({
          loading: false,
          status: "",
          pendingAmount: 0,
          message: "Your session has expired. Please sign in again.",
        });
        return;
      }

      try {
        const response = await getBorrowerRequestAmount();
        if (response?.status === 200) {
          const requestList = Array.isArray(response?.data) ? response.data : [];
          const latestRequest = requestList.length
            ? [...requestList].sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))[0]
            : null;

          const latestStatus = String(latestRequest?.loanRequestStatus || "").trim().toUpperCase();
          const pendingAmount = Number(latestRequest?.partiallyPendingAmount || 0);
          const requestAmt = Number(latestRequest?.requestAmount || 0);
          const hasBlockedStatus = !!latestStatus && latestStatus !== "CLOSED" && latestStatus !== "PARTIALLYPROCESSING";

          setRequestStatusInfo({
            loading: false,
            status: latestStatus,
            pendingAmount: isNaN(pendingAmount) ? 0 : pendingAmount,
            requestAmount: isNaN(requestAmt) ? 0 : requestAmt,
            message: hasBlockedStatus
              ? "Your previous loan request is still active. You can raise a fresh request after the current request is closed."
              : "",
          });
          return;
        }
        setRequestStatusInfo({ loading: false, status: "", pendingAmount: 0, requestAmount: 0, message: "" });
      } catch {
        setRequestStatusInfo({ loading: false, status: "", pendingAmount: 0, requestAmount: 0, message: "" });
      }
    };

    fetchBorrowerRequestStatus();
  }, [borrowerId]);

  const formatCurrency = (amount) => {
    const numericValue = Number(amount || 0);
    return `₹ ${numericValue.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const eligibleAmountValue = eligibleAmount.amount;
  const verifiedMonthlyIncome = Number(eligibleAmount.verifiedMonthlyIncome || 0);
  const processingFeePercentage = Number(eligibleAmount.processingFee || 0);
  const eligibleCalculationAmount = (verifiedMonthlyIncome * processingFeePercentage) / 100;
  const isFormBlockedByStatus = !!requestStatusInfo.status && requestStatusInfo.status !== "CLOSED" && requestStatusInfo.status !== "PARTIALLYPROCESSING";
  
  const maxLimit = requestStatusInfo.status === "PARTIALLYPROCESSING"
    ? Math.max(0, (eligibleAmountValue || 0) - (requestStatusInfo.requestAmount || 0))
    : eligibleAmountValue;

  const isSubmitDisabled =
    isSubmitting ||
    isEligibleLoading ||
    requestStatusInfo.loading ||
    !!eligibleErrorMessage ||
    isFormBlockedByStatus;

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!borrowerId) {
      Swal.fire("Session Expired", "Please sign in again to continue.", "warning");
      return;
    }

    if (isFormBlockedByStatus) {
      Swal.fire("Request Not Allowed", "You already have a loan request in progress.", "warning");
      return;
    }

    const normalizedAmount = Number(requestAmount);
    if (!normalizedAmount || normalizedAmount <= 0) {
      Swal.fire("Invalid Amount", "Please enter a valid loan amount.", "warning");
      return;
    }

    if (maxLimit !== null && normalizedAmount > maxLimit) {
      Swal.fire("Limit Exceeded", `Your maximum allowed request amount is ${formatCurrency(maxLimit)}.`, "warning");
      return;
    }

    const confirmation = await Swal.fire({
      title: "Confirm Your Loan Request",
      text: `Are you sure you want to request a loan amount of ₹ ${normalizedAmount}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm Request",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#0040e0",
    });

    if (!confirmation.isConfirmed) return;

    setIsSubmitting(true);
    try {
      const payload = {
        borrowerId: Number(borrowerId),
        requestAmount: normalizedAmount,
      };
      const response = await submitBorrowerLoanRequest(payload);
      if (response?.status === 200 || response?.status === 201) {
        await Swal.fire("Congratulations!", "Your loan request has been successfully submitted.", "success");
        setRequestAmount("");
        navigate("/borrowerRequestAmount");
      } else {
        Swal.fire("Submission Failed", "Unable to submit your loan request. Please try again.", "error");
      }
    } catch (error) {
      Swal.fire("Submission Failed", "Unable to submit your loan request. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main-wrapper">
      <BorrowerHeader />
      <BorrowerSidebar />

      <div className="page-wrapper">
        <div className="content container-fluid py-4" style={{ backgroundColor: "var(--oxy-background)" }}>
          
          <div className="mb-4">
            <h3 className="fw-bold mb-1 text-dark">Apply for a Loan Limit</h3>
            <span className="text-muted small">Submit your request to begin matchmaking with verified lenders.</span>
          </div>

          {/* Quick Metrics Summary */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="oxy-card mb-0 h-100 border-start border-primary border-3" style={{ padding: "16px 20px" }}>
                <span className="text-muted d-block small mb-1 uppercase text-uppercase">Verified Income</span>
                <h5 className="fw-bold text-dark mb-0">
                  {isEligibleLoading ? "..." : formatCurrency(verifiedMonthlyIncome)}
                </h5>
              </div>
            </div>
            {/*<div className="col-md-3">
              <div className="oxy-card mb-0 h-100 border-start border-warning border-3" style={{ padding: "16px 20px" }}>
                <span className="text-muted d-block small mb-1 uppercase text-uppercase"> Limit</span>
                <h5 className="fw-bold text-dark mb-0">
                  {isEligibleLoading ? "..." : `${processingFeePercentage}%`}
                </h5>
              </div>
            </div>*/}
            <div className="col-md-3">
              <div className="oxy-card mb-0 h-100 border-start border-success border-3" style={{ padding: "16px 20px" }}>
                <span className="text-muted d-block small mb-1 uppercase text-uppercase">Max Eligibility Amount</span>
                <h5 className="fw-bold text-success mb-0">
                  {isEligibleLoading ? "..." : formatCurrency(eligibleAmountValue)}
                </h5>
              </div>
            </div>
            <div className="col-md-3">
              <div className="oxy-card mb-0 h-100 border-start border-secondary border-3" style={{ padding: "16px 20px" }}>
                <span className="text-muted d-block small mb-1 uppercase text-uppercase">Oxy Score</span>
                <h5 className="fw-bold text-dark mb-0">
                  {cibilInfo.loading ? "..." : oxyscore != null ? `${oxyscore}` : "—"}
                </h5>
              </div>
            </div> 
          </div>

          <div className="align-items-center justify-content-center">
            <div className="col-lg-8">
              {eligibleErrorMessage ? (
                <div className="oxy-card text-center py-5">
                  <div 
                    className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4"
                    style={{ width: "64px", height: "64px", backgroundColor: "#fef2f2", color: "#dc2626" }}
                  >
                    <i className="fa-solid fa-triangle-exclamation fa-xl"></i>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">Admin Verification Pending</h5>
                  <p className="text-muted small mb-4 mx-auto" style={{ maxWidth: "480px", lineHeight: "1.6" }}>
                    {eligibleErrorMessage}
                  </p>
                  <button className="oxy-btn-primary btn-danger text-white" onClick={() => navigate("/borrowerProfile")}>
                    Go to Borrower Profile
                  </button>
                </div>
              ) : isFormBlockedByStatus || (maxLimit) === 0 ? (
                <div className="oxy-card text-center py-5">
                  <div 
                    className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4 bg-primary bg-opacity-10 text-primary"
                    style={{ width: "64px", height: "64px" }}
                  >
                    <i className="fa-solid fa-clock-rotate-left fa-xl"></i>
                  </div>
                  <h5 className="fw-bold text-dark mb-2">Loan Request in Progress</h5>
                  <p className="text-muted small mb-4 max-w-sm mx-auto" style={{ maxWidth: "340px" }}>
                    You currently have an active loan application. Once this is closed, you can request a fresh limit.
                  </p>
                  <button className="oxy-btn-primary" onClick={() => navigate("/borrowerLoansInitiated")}>
                    View Proposals
                  </button>
                </div>
              ) : (
                <div className="oxy-card">
                  
                  <h5 className="fw-bold mb-3">Request Loan Amount</h5>
                  <span className="text-muted small d-block mb-4">
                    Please key in the amount you would like to raise. We will share this request with our lender group.
                  </span>
                  {requestStatusInfo.status === "PARTIALLYPROCESSING" && !(maxLimit) === 0 &&(
                    <div className="alert alert-info py-2 px-3 small mb-4">
                      <i className="fa-solid fa-circle-info me-2"></i>
                      You have an active request of <strong>{formatCurrency(requestStatusInfo.requestAmount)}</strong> in <strong>PARTIALLY_PROCESSING</strong> status (with <strong>{formatCurrency(requestStatusInfo.pendingAmount)}</strong> still pending match). You can apply for a new loan request for the remaining unused limit: <strong>{formatCurrency(maxLimit)}</strong>.
                    </div>
                  )}

                  {eligibleErrorMessage && (
                    <div className="alert alert-danger py-2 px-3 small mb-4">{eligibleErrorMessage}</div>
                  )}

                  

                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="form-label text-muted small uppercase text-uppercase">Required Amount (₹)</label>
                      <input 
                        type="number" 
                        className="form-control rounded-3 py-3" 
                        min="5000"
                        max={maxLimit || undefined}
                        value={requestAmount} 
                        placeholder="e.g. 50000" 
                        onChange={(e) => setRequestAmount(e.target.value)}
                        required
                      />
                      {maxLimit && (
                        <div className="form-text small text-muted mt-2">
                          Your maximum allowed borrowing cap: <strong>{formatCurrency(maxLimit)}</strong>
                          {requestStatusInfo.status === "PARTIALLYPROCESSING" && (
                            <span className="text-warning ms-1">(Remaining pending amount from partial match)</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="d-flex justify-content-end gap-2 border-top pt-4">
                      <button 
                        type="button" 
                        className="oxy-btn-secondary" 
                        onClick={() => setRequestAmount("")}
                      >
                        Clear
                      </button>
                      <button 
                        type="submit" 
                        className="oxy-btn-primary"
                        disabled={isSubmitDisabled}
                      >
                        {isSubmitting ? "Submitting..." : "Apply For Loan"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            <div className="col-lg-8">
              <FeeConfigInfo />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoanRequest;
