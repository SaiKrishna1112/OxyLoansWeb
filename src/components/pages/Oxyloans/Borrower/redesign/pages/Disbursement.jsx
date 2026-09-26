import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import BorrowerHeader from "../../../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../../../SideBar/BorrowerSidebar";
import Footer from "../../../../../Footer/Footer";

import StatusBadge from "../components/StatusBadge";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

import {
  getDisbursementAmount,
  generateBorrowerAgreement1,
  getBorrowerEligibleAmount,
} from "../../../../../HttpRequest/afterlogin";
import "../redesign.css";

const Disbursement = () => {
  const navigate = useNavigate();
  const [disbursementInfo, setDisbursementInfo] = useState({
    apiData: [],
    loading: true,
    errorMessage: "",
  });
  const [generatingInvoice, setGeneratingInvoice] = useState({});
  const [eligibleAmount, setEligibleAmount] = useState(null);

  useEffect(() => {
    document.body.classList.add("oxy-redesign-active");
    fetchEligibleAmount();
    fetchDisbursements();
    return () => {
      document.body.classList.remove("oxy-redesign-active");
    };
  }, []);

  const fetchEligibleAmount = () => {
    getBorrowerEligibleAmount()
      .then((res) => {
        if (res?.status === 200) setEligibleAmount(res.data?.amount ?? null);
      })
      .catch(() => {});
  };

  const fetchDisbursements = async () => {
    setDisbursementInfo((prev) => ({ ...prev, loading: true, errorMessage: "" }));
    try {
      const response = await getDisbursementAmount();
      if (response?.status === 200) {
        setDisbursementInfo({
          apiData: Array.isArray(response.data) ? response.data : [],
          loading: false,
          errorMessage: "",
        });
      } else {
        const errMsg = response?.response?.data?.errorMessage || response?.data?.errorMessage || "";
        const isNoData = errMsg.toLowerCase().includes("no data") || 
                         errMsg.toLowerCase().includes("no record") || 
                         errMsg.toLowerCase().includes("no disbursement") ||
                         response?.response?.status === 400; // Treat 400 as empty list safely
        setDisbursementInfo({
          apiData: [],
          loading: false,
          errorMessage: isNoData ? "" : (errMsg || "Unable to retrieve disbursement listings."),
        });
      }
    } catch (error) {
      setDisbursementInfo({
        apiData: [],
        loading: false,
        errorMessage: "Unable to retrieve disbursement listings.",
      });
    }
  };

  const handleGenerateInvoice = async (row) => {
    const borrowerId = row.borrowerId;
    const loanId = row.loanRequestId;
    const id = row.id;
    if (!borrowerId || !loanId || !id) return;
    
    setGeneratingInvoice((prev) => ({ ...prev, [row.id]: true }));
    try {
      const response = await generateBorrowerAgreement1({ borrowerId, loanId, id });
      if (response?.status === 200 && response?.data?.invoiceUrl) {
        window.open(response.data.invoiceUrl, "_blank");
      } else {
        Swal.fire("Failure", "Unable to download agreement invoice PDF.", "error");
      }
    } catch (error) {
      Swal.fire("Failure", "Unable to download agreement invoice PDF.", "error");
    } finally {
      setGeneratingInvoice((prev) => ({ ...prev, [row.id]: false }));
    }
  };

  const handleViewBreakup = (row) => {
    const borrowerId = Number(row.borrowerId);
    const loanId = row.loanRequestId ? Number(row.loanRequestId) : null;
    const id = Number(row.id);
    if (isNaN(borrowerId) || isNaN(id)) return;
    navigate(`/borrowerDisbursementInterestAmount/${borrowerId}/${loanId}/${id}`);
  };

  const totalDisbursedAmount = useMemo(() => {
    return disbursementInfo.apiData.reduce((sum, item) => sum + Number(item.disbursedAmount || 0), 0);
  }, [disbursementInfo.apiData]);

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "-") return "-";
    const date = new Date(dateStr.replace(" ", "T"));
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="main-wrapper">
      <BorrowerHeader />
      <BorrowerSidebar />

      <div className="page-wrapper">
        <div className="content container-fluid py-4" style={{ backgroundColor: "var(--oxy-background)" }}>
          
          <div className="mb-4">
            <h3 className="fw-bold mb-1 text-dark">Loan Disbursements</h3>
            <span className="text-muted small">Monitor your disbursed principal accounts, auto-debits, and processing invoices.</span>
          </div>

          {/* Warning Marquee */}
          <div className="alert alert-warning py-2 mb-4 d-flex align-items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span className="small font-bold" style={{ fontSize: "11px" }}>
              <strong>Repayment Rule:</strong> Repayment auto-debits are triggered on the <strong>5th of every month</strong>. Ensure your linked bank account holds sufficient funds to avoid default penalties.
            </span>
          </div>

          {/* Summary Strip */}
          <div className="oxy-metrics-banner mb-4">
            <div className="row align-items-center g-3">
              <div className="col-md-6">
                <span className="text-white-50 d-block small uppercase text-uppercase" style={{ letterSpacing: "0.5px" }}>Total Disbursed Principal</span>
                <h2 className="fw-bold mb-0">₹ {totalDisbursedAmount.toLocaleString("en-IN")}</h2>
              </div>
              <div className="col-md-6 text-md-end">
                <span className="badge rounded-pill px-3 py-2">
                  Maximum limit: ₹ {eligibleAmount ? eligibleAmount.toLocaleString("en-IN") : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Content conditional states */}
          {disbursementInfo.loading ? (
            <LoadingState count={3} type="card" />
          ) : disbursementInfo.errorMessage ? (
            <ErrorState message={disbursementInfo.errorMessage} onRetry={fetchDisbursements} />
          ) : disbursementInfo.apiData.length === 0 ? (
            <EmptyState 
              title="No Disbursements Transferred Yet" 
              description="Your approved requests are undergoing signing or auto-pay validation. Check back once agreements are processed."
              icon="fa-money-bill-transfer"
            />
          ) : (
            <div className="row g-4">
              {disbursementInfo.apiData.map((d, index) => {
                const isPaid = d.paymentStatus === "Paid";
                return (
                  <div className="col-md-6 col-lg-4 d-flex" key={d.id || index}>
                    <div className="oxy-card w-100 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <span className="text-muted d-block small uppercase text-uppercase">Date</span>
                            <span className="fw-bold text-dark">{formatDate(d.createdAt)}</span>
                          </div>
                          <span className={`badge ${d.paymentStatus === "Paid" ? "bg-success" : "bg-warning text-dark"} rounded-pill px-3 py-1`}>
                            {d.paymentStatus || "Pending"}
                          </span>
                        </div>

                        <div className="bg-light p-3 rounded-3 mb-4">
                          <span className="text-muted d-block small">Disbursed Principal</span>
                          <h4 className="fw-bold mb-0 text-dark">₹ {Number(d.disbursedAmount || 0).toLocaleString("en-IN")}</h4>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="info-row">
                            <span className="info-label">Processing Fee</span>
                            <span className="info-value">₹ {Number(d.processingFee || 0).toFixed(2)}</span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Borrower Status</span>
                            <span className="info-value"><StatusBadge status={d.borrowerStatus} /></span>
                          </div>
                          <div className="info-row">
                            <span className="info-label">Loan Request ID</span>
                            <span className="info-value text-dark">{d.loanRequestId || "—"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex gap-2 w-100 pt-3 border-top mt-auto">
                        <button 
                          className="oxy-btn-secondary flex-fill text-xs" 
                          onClick={() => handleViewBreakup(d)}
                          disabled={d.borrowerId === "-" || !d.loanRequestId}
                        >
                          View Charges
                        </button>
                        <button 
                          className="oxy-btn-primary flex-fill text-xs"
                          onClick={() => handleGenerateInvoice(d)}
                          disabled={!isPaid || !!generatingInvoice[d.id]}
                        >
                          {generatingInvoice[d.id] ? "Generating..." : "Get Agreement"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Disbursement;
