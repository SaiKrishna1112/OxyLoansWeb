import React, { useEffect, useState } from "react";
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
  getBorrowerActiveLoans,
  getBorrowerEmiScheduleForLoan,
} from "../../../../../HttpRequest/afterlogin";
import "../redesign.css";

const LoanCard = ({ loan }) => {
  const [schedule, setSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const loadSchedule = () => {
    if (!loan.internalId || schedule.length > 0) return;
    setLoadingSchedule(true);
    getBorrowerEmiScheduleForLoan(loan.internalId)
      .then((res) => {
        if (res.status === 200) setSchedule(res.data || []);
      })
      .catch(() => {})
      .finally(() => setLoadingSchedule(false));
  };

  const paidCount = schedule.filter((e) => e.emiPaidOn || e.status === "COMPLETED").length;
  const totalCount = schedule.length || loan.duration || 0;
  const progressPct = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  const nextEmi = schedule.find((e) => !e.emiPaidOn && e.status !== "COMPLETED");
  const outstandingPrincipal = schedule
    .filter((e) => !e.emiPaidOn && e.status !== "COMPLETED")
    .reduce((sum, e) => sum + (e.emiPrincipalAmount || 0), 0);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) loadSchedule();
  };

  const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="oxy-card">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h5 className="fw-bold mb-0">Loan ID: {loan.loanId || "—"}</h5>
        <StatusBadge status={loan.loanStatus} />
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="p-3 bg-light rounded-3 text-center border">
            <span className="text-muted d-block small mb-1">Principal Amount</span>
            <h5 className="fw-bold text-dark mb-0">₹ {fmt(loan.amount)}</h5>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 bg-light rounded-3 text-center border">
            <span className="text-muted d-block small mb-1">Interest Rate (ROI)</span>
            <h5 className="fw-bold text-dark mb-0">{loan.rateOfInterest || "—"}% p.a.</h5>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="p-3 bg-light rounded-3 text-center border">
            <span className="text-muted d-block small mb-1">Tenure / Duration</span>
            <h5 className="fw-bold text-dark mb-0">{loan.duration || "—"} Months</h5>
          </div>
        </div>
        <div className="col-6 col-md-3">
          {nextEmi ? (
            <div className="p-3 rounded-3 text-center border bg-warning bg-opacity-10 border-warning">
              <span className="text-warning d-block small mb-1">Next EMI Due</span>
              <h5 className="fw-bold text-dark mb-0">₹ {fmt(nextEmi.emiAmount)}</h5>
              <span className="text-muted small" style={{ fontSize: "10px" }}>
                {nextEmi.emiDueOn ? new Date(nextEmi.emiDueOn).toLocaleDateString("en-IN") : "—"}
              </span>
            </div>
          ) : (
            <div className="p-3 bg-light rounded-3 text-center border">
              <span className="text-muted d-block small mb-1">Remaining Bal</span>
              <h5 className="fw-bold text-dark mb-0">₹ {fmt(outstandingPrincipal)}</h5>
            </div>
          )}
        </div>
      </div>

      {totalCount > 0 && (
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted small">Repayment Progress</span>
            <span className="fw-bold text-primary small">{paidCount} of {totalCount} EMIs Cleared</span>
          </div>
          <div className="progress" style={{ height: "8px" }}>
            <div 
              className={`progress-bar ${progressPct === 100 ? "bg-success" : "bg-primary"}`} 
              role="progressbar" 
              style={{ width: `${progressPct}%` }}
              aria-valuenow={progressPct}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>
      )}

      {/* Accordion toggle for schedules */}
      <button 
        className="oxy-btn-secondary w-100 text-center text-xs py-2 d-flex align-items-center justify-content-center gap-2"
        onClick={toggleOpen}
      >
        <span>{isOpen ? "Collapse Repayment Schedule" : "Inspect EMI Repayment Schedule"}</span>
        <i className={`fa-solid ${isOpen ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
      </button>

      {isOpen && (
        <div className="border-top pt-4 mt-4">
          {loadingSchedule ? (
            <div className="text-center py-4">
              <span className="spinner-border spinner-border-sm text-primary me-2"></span>
              <span className="text-muted small">Retrieving EMI schedule details...</span>
            </div>
          ) : schedule.length === 0 ? (
            <span className="text-muted small d-block text-center py-3">No schedule generated yet.</span>
          ) : (
            <div className="space-y-3">
              {/* Header labels */}
              <div className="d-none d-md-flex justify-content-between p-2 border-bottom fw-bold text-muted small text-uppercase">
                <span>No.</span>
                <span>Due Date</span>
                <span>Principal</span>
                <span>Interest</span>
                <span>Total EMI</span>
                <span>Status</span>
              </div>
              
              {schedule.map((item, idx) => (
                <div 
                  key={item.id || idx} 
                  className={`p-3 rounded border mb-2 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 ${item.emiPaidOn ? "bg-success bg-opacity-5 border-success" : "bg-light"}`}
                >
                  <div className="d-flex justify-content-between d-md-block">
                    <span className="text-muted d-md-none small">EMI No. </span>
                    <span className="fw-bold text-dark">#{item.emiNumber}</span>
                  </div>
                  
                  <div className="d-flex justify-content-between d-md-block">
                    <span className="text-muted d-md-none small">Due Date </span>
                    <span>{item.emiDueOn ? new Date(item.emiDueOn).toLocaleDateString("en-IN") : "—"}</span>
                  </div>

                  <div className="d-flex justify-content-between d-md-block">
                    <span className="text-muted d-md-none small">Principal </span>
                    <span>₹ {fmt(item.emiPrincipalAmount)}</span>
                  </div>

                  <div className="d-flex justify-content-between d-md-block">
                    <span className="text-muted d-md-none small">Interest </span>
                    <span>₹ {fmt(item.emiInterstAmount)}</span>
                  </div>

                  <div className="d-flex justify-content-between d-md-block">
                    <span className="text-muted d-md-none small">Total EMI </span>
                    <span className="fw-bold text-primary">₹ {fmt(item.emiAmount)}</span>
                  </div>

                  <div className="d-flex justify-content-between d-md-block">
                    <span className="text-muted d-md-none small">Status </span>
                    <span className={`badge ${item.emiPaidOn || item.status === "COMPLETED" ? "bg-success" : item.status === "ADMINREJECTED" ? "bg-danger" : "bg-warning text-dark"} rounded-pill px-3`}>
                      {item.emiPaidOn || item.status === "COMPLETED" ? "Paid" : item.status === "ADMINREJECTED" ? "Bounced" : item.status || "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const LoanDetails = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.classList.add("oxy-redesign-active");
    fetchLoans();
    return () => {
      document.body.classList.remove("oxy-redesign-active");
    };
  }, []);

  const fetchLoans = () => {
    setLoading(true);
    getBorrowerActiveLoans()
      .then((res) => {
        if (res.status === 200) setLoans(res.data || []);
      })
      .catch(() => setError("Failed to retrieve loan profile listings. please try again."))
      .finally(() => setLoading(false));
  };

  const activeLoans = loans.filter((l) => ["ACTIVE", "Active"].includes(l.loanStatus));
  const pendingLoans = loans.filter((l) => !["ACTIVE", "Active", "CLOSED", "Closed"].includes(l.loanStatus));
  const closedLoans = loans.filter((l) => ["CLOSED", "Closed"].includes(l.loanStatus));

  const totalBorrowedVal = useMemo(() => {
    return loans.reduce((sum, l) => sum + Number(l.amount || 0), 0);
  }, [loans]);

  return (
    <div className="main-wrapper">
      <BorrowerHeader />
      <BorrowerSidebar />

      <div className="page-wrapper">
        <div className="content container-fluid py-4" style={{ backgroundColor: "var(--oxy-background)" }}>
          
          <div className="mb-4">
            <h3 className="fw-bold mb-1 text-dark">My Active Loans</h3>
            <span className="text-muted small">Monitor active repayment tracks, verify EMI history, and download agreements.</span>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <LoadingState count={2} type="card" />
          ) : loans.length === 0 ? (
            <EmptyState 
              title="No Loans Processed" 
              description="You do not have any active loans linked to your account. File a new request to find lenders."
              icon="fa-wallet"
              actionText="Apply Now"
              onAction={() => navigate("/borrowerLoanRequestCreate")}
            />
          ) : (
            <>
              {/* Summary Strip */}
              <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                  <div className="oxy-card mb-0 text-center py-3 border-success border-2">
                    <span className="text-muted d-block small mb-1">Active Loans</span>
                    <h4 className="fw-bold text-success mb-0">{activeLoans.length}</h4>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="oxy-card mb-0 text-center py-3 border-warning border-2">
                    <span className="text-muted d-block small mb-1">In Progress</span>
                    <h4 className="fw-bold text-warning mb-0">{pendingLoans.length}</h4>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="oxy-card mb-0 text-center py-3 border-info border-2">
                    <span className="text-muted d-block small mb-1">Closed / Settled</span>
                    <h4 className="fw-bold text-info mb-0">{closedLoans.length}</h4>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="oxy-card mb-0 text-center py-3 border-primary border-2">
                    <span className="text-muted d-block small mb-1">Total Borrowed</span>
                    <h5 className="fw-bold text-primary mb-0">₹ {totalBorrowedVal.toLocaleString("en-IN")}</h5>
                  </div>
                </div>
              </div>

              {activeLoans.length > 0 && (
                <div className="mb-4">
                  <h5 className="fw-bold text-dark mb-3"><i className="fa-solid fa-circle-play text-success me-2"></i>Active Loans</h5>
                  {activeLoans.map((l) => <LoanCard key={l.loanId} loan={l} />)}
                </div>
              )}

              {pendingLoans.length > 0 && (
                <div className="mb-4">
                  <h5 className="fw-bold text-dark mb-3"><i className="fa-solid fa-spinner text-warning me-2 animate-spin"></i>In Progress</h5>
                  {pendingLoans.map((l) => <LoanCard key={l.loanId} loan={l} />)}
                </div>
              )}

              {closedLoans.length > 0 && (
                <div className="mb-4">
                  <h5 className="fw-bold text-dark mb-3"><i className="fa-solid fa-circle-check text-info me-2"></i>Closed Loans</h5>
                  {closedLoans.map((l) => <LoanCard key={l.loanId} loan={l} />)}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoanDetails;
