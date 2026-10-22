import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getUserRejectOrApprove, getUserId } from "../../../../../HttpRequest/afterlogin";

const normalizeStatus = (value) => String(value || "").trim().toUpperCase();

export const isRejectedLoanStatus = (value) => {
  const status = normalizeStatus(value);
  return status === "REJECTED" || status === "DECLINED" || status === "DENIED" || status.includes("REJECT");
};

const getStatusLabel = (value) => {
  const status = normalizeStatus(value);
  if (isRejectedLoanStatus(status)) return "Loan application rejected";
  if (status.includes("APPROV") || status.includes("ACCEPT")) return "Loan application approved";
  if (status.includes("PEND") || status.includes("PROCESS") || status.includes("REVIEW")) return "Loan application under review";
  return value;
};

const getErrorMessage = (error) =>
  error?.response?.data?.errorMessage ||
  error?.response?.data?.message ||
  error?.data?.errorMessage ||
  error?.data?.message ||
  "We could not load the latest loan application status.";

const BorrowerLoanDecisionStatus = () => {
  const [state, setState] = useState({ loading: true, status: "", reason: "", error: "" });
  const userId = getUserId();

  useEffect(() => {
    let active = true;

    if (!userId) {
      setState({ loading: false, status: "", reason: "", error: "Your session does not contain a borrower ID." });
      return () => { active = false; };
    }

    getUserRejectOrApprove(userId)
      .then((response) => {
        if (!active) return;
        const body = response?.data;
        const payload = body && typeof body === "object" && !Array.isArray(body) ? body : {};
        setState({
          loading: false,
          status: payload.status || "",
          reason: payload.reason || "",
          error: response?.status >= 400 || response?.response?.status >= 400 ? getErrorMessage(response) : "",
        });
      })
      .catch((error) => {
        if (active) setState({ loading: false, status: "", reason: "", error: getErrorMessage(error) });
      });

    return () => { active = false; };
  }, [userId]);

  const rejected = useMemo(() => isRejectedLoanStatus(state.status), [state.status]);
  if (state.loading) {
    return <div className="oxy-card mb-4" role="status"><span className="spinner-border spinner-border-sm text-primary me-2" /> Loading loan application status...</div>;
  }
  if (state.error) return <div className="alert alert-warning mb-4" role="alert">{state.error}</div>;
  if (!state.status) return null;

  return (
    <div className={`oxy-card mb-4 ${rejected ? "oxy-loan-status-card oxy-loan-status-card-rejected" : "oxy-loan-status-card"}`} role="status">
      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
        <div>
          <span className={`badge ${rejected ? "bg-danger" : "bg-primary"} mb-2`}>{normalizeStatus(state.status)}</span>
          <h5 className="fw-bold mb-2">{getStatusLabel(state.status)}</h5>
          <p className="text-muted mb-0">Your latest borrower loan decision is available from OxyLoans.</p>
          {state.reason ? <p className="mb-0 mt-2"><strong>Reason:</strong> {state.reason}</p> : null}
        </div>
        {rejected ? (
          <Link className="btn btn-outline-danger" to="/borrower-loan-rejection-details">View Details</Link>
        ) : null}
      </div>
    </div>
  );
};

export default BorrowerLoanDecisionStatus;
