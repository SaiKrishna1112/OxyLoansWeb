import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import BorrowerHeader from "../../../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../../../SideBar/BorrowerSidebar";
import Footer from "../../../../../Footer/Footer";

import StatusBadge from "../components/StatusBadge";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

import BASE_URL from "../../../../../../config";
import "../redesign.css";

const Repayment = () => {
  const { loanRequestId } = useParams();
  const navigate = useNavigate();

  const [repayment, setRepayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");

  useEffect(() => {
    document.body.classList.add("oxy-redesign-active");
    fetchRepaymentRecord();
    return () => {
      document.body.classList.remove("oxy-redesign-active");
    };
  }, [loanRequestId]);

  const fetchRepaymentRecord = () => {
    if (!loanRequestId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMessage("");
    axios
      .get(`${BASE_URL}/v1/marketplace/repayment/loan/${loanRequestId}`, {
        headers: { userId },
      })
      .then((response) => {
        setRepayment(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading repayment schedule", error);
        setErrorMessage("Could not load your repayment schedule. Please try again.");
        setLoading(false);
      });
  };

  const handlePay = async () => {
    if (!repayment?.id) return;
    
    const totalAmount = repayment.totalRepaymentAmount + (repayment.penaltyAmount || 0);
    const confirm = await Swal.fire({
      title: "Authorize EMI Payment",
      text: `Do you want to authorize a payment of ₹ ${totalAmount.toLocaleString("en-IN")} for Loan #${loanRequestId}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Authorize Payment",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#006242",
    });

    if (!confirm.isConfirmed) return;

    setPaying(true);
    setErrorMessage("");
    try {
      await axios.post(
        `${BASE_URL}/v1/marketplace/repayment/${repayment.id}/pay`,
        {},
        { headers: { userId } }
      );
      setSuccess(true);
      setRepayment((prev) => ({
        ...prev,
        repaymentStatus: "PAID",
        paidAt: new Date().toISOString(),
      }));
      Swal.fire("Payment Recorded", "Your repayment has been successfully processed.", "success");
    } catch (e) {
      const errText = e.response?.data?.error || "Payment failed. Please verify bank balance.";
      setErrorMessage(errText);
      Swal.fire("Payment Failed", errText, "error");
    } finally {
      setPaying(false);
    }
  };

  const fmt = (n) =>
    Number(n || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
  };

  const isPaid = repayment?.repaymentStatus === "PAID";

  return (
    <div className="main-wrapper">
      <BorrowerHeader />
      <BorrowerSidebar />

      <div className="page-wrapper">
        <div className="content container-fluid py-4" style={{ backgroundColor: "var(--oxy-background)" }}>
          
          <div className="mb-4">
            <h3 className="fw-bold mb-1 text-dark">Repayment Schedule</h3>
            <span className="text-muted small">Manage outstanding balances, view interest charges, and clear loan obligations.</span>
          </div>

          {loading ? (
            <LoadingState count={1} type="card" />
          ) : errorMessage && !repayment ? (
            <ErrorState message={errorMessage} onRetry={fetchRepaymentRecord} />
          ) : !repayment ? (
            <EmptyState 
              title="No Repayment Schedules Ready" 
              description="This loan application does not have an active repayment card. Payouts are pending."
              icon="fa-calendar-days"
            />
          ) : (
            <div className="row g-4">
              
              {/* Left Column: Principal/Interest details */}
              <div className="col-lg-7">
                <div className="oxy-card">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Loan ID: #{loanRequestId}</h5>
                    <span className={`badge ${isPaid ? "bg-success" : "bg-warning text-dark"} px-3 py-2 rounded-pill fw-bold`}>
                      {repayment.repaymentStatus || "PENDING"}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="info-row">
                      <span className="info-label">Principal Amount</span>
                      <span className="info-value text-dark">₹ {fmt(repayment.principalAmount)}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Interest Charges</span>
                      <span className="info-value text-dark">₹ {fmt(repayment.interestAmount)}</span>
                    </div>
                    {repayment.penaltyAmount > 0 && (
                      <div className="info-row bg-danger bg-opacity-10 p-2 rounded">
                        <span className="info-label text-danger">Bounce Penalty Fee</span>
                        <span className="info-value text-danger">₹ {fmt(repayment.penaltyAmount)}</span>
                      </div>
                    )}
                    <hr className="opacity-10 my-3" />
                    <div className="info-row">
                      <span className="info-label fw-bold text-dark fs-6">Total Due Amount</span>
                      <span className="info-value text-primary fw-bold fs-6">
                        ₹ {fmt(repayment.totalRepaymentAmount + (repayment.penaltyAmount || 0))}
                      </span>
                    </div>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-6">
                      <div className="p-3 bg-light rounded-3">
                        <span className="text-muted d-block small mb-1">Due Start</span>
                        <span className="fw-bold text-dark">{formatDate(repayment.dueDateStart)}</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-3 bg-light rounded-3">
                        <span className="text-muted d-block small mb-1">Due End</span>
                        <span className="fw-bold text-dark">{formatDate(repayment.dueDateEnd)}</span>
                      </div>
                    </div>
                  </div>

                  {repayment.bounceReason && (
                    <div className="alert alert-danger py-2 px-3 small mb-4">
                      <strong>Auto-pay Bounced:</strong> {repayment.bounceReason}
                    </div>
                  )}

                  <div className="border-top pt-4 text-center">
                    {isPaid ? (
                      <div className="alert alert-success d-flex align-items-center gap-2 justify-content-center mb-0">
                        <i className="fa-solid fa-circle-check"></i>
                        <span>Repayment fully cleared. Thank you for using OxyLoans!</span>
                      </div>
                    ) : (
                      <button 
                        className="oxy-btn-primary w-100 py-3 font-bold"
                        onClick={handlePay}
                        disabled={paying}
                        style={{ backgroundColor: "var(--oxy-tertiary)" }}
                      >
                        {paying ? "Authorizing Payment..." : `Authorize Payment: ₹ ${fmt(repayment.totalRepaymentAmount + (repayment.penaltyAmount || 0))}`}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Splits breakdown */}
              <div className="col-lg-5">
                {repayment.lenderSplits && repayment.lenderSplits.length > 0 && (
                  <div className="oxy-card">
                    <h6 className="fw-bold mb-4">Lender Repayment Splits</h6>
                    <div className="space-y-3">
                      {repayment.lenderSplits.map((s, idx) => (
                        <div key={idx} className="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center mb-2">
                          <div>
                            <span className="fw-bold d-block text-dark" style={{ fontSize: "13px" }}>
                              {s.lenderName || `Lender #${s.lenderUserId}`}
                            </span>
                            <span className="text-muted small" style={{ fontSize: "11px" }}>Transfer Ratio Split</span>
                          </div>
                          <div className="text-end">
                            <span className="fw-bold d-block text-dark" style={{ fontSize: "13px" }}>₹ {fmt(s.amount)}</span>
                            <span className={`badge ${s.status === "PAID" ? "bg-success" : "bg-warning text-dark"} small`} style={{ fontSize: "9px" }}>
                              {s.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Repayment;
