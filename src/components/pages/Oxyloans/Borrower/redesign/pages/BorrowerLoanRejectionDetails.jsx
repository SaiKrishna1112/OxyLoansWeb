import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BorrowerHeader from "../../../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../../../SideBar/BorrowerSidebar";
import { getUserRejectOrApprove, getUserId } from "../../../../../HttpRequest/afterlogin";
import { isRejectedLoanStatus } from "../components/BorrowerLoanDecisionStatus";
import "../redesign.css";

const BorrowerLoanRejectionDetails = () => {
  const [state, setState] = useState({ loading: true, status: "", reason: "", error: "" });

  useEffect(() => {
    const userId = getUserId();
    if (!userId) {
      setState({ loading: false, status: "", reason: "", error: "Your session does not contain a borrower ID." });
      return;
    }

    getUserRejectOrApprove(userId)
      .then((response) => {
        const payload = response?.data && typeof response.data === "object" ? response.data : {};
        setState({
          loading: false,
          status: payload.status || "",
          reason: payload.reason || "",
          error: response?.status >= 400 || response?.response?.status >= 400 ? "We could not load the rejection details." : "",
        });
      })
      .catch(() => setState({ loading: false, status: "", reason: "", error: "We could not load the rejection details." }));
  }, []);

  return (
    <div className="main-wrapper">
      <BorrowerHeader />
      <BorrowerSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid py-4" style={{ backgroundColor: "var(--oxy-background)" }}>
          <div className="mb-4"><Link to="/borrowerDashboard" className="text-decoration-none">← Back to Dashboard</Link></div>
          {state.loading ? <div className="oxy-card"><span className="spinner-border spinner-border-sm text-primary me-2" /> Loading rejection details...</div> : null}
          {state.error ? <div className="alert alert-danger">{state.error}</div> : null}
          {!state.loading && !state.error ? (
            <div className={`oxy-card oxy-loan-status-card ${isRejectedLoanStatus(state.status) ? "oxy-loan-status-card-rejected" : ""}`}>
              <span className="badge bg-danger mb-3">{state.status || "Status unavailable"}</span>
              <h3 className="fw-bold mb-3">Loan application status</h3>
              <p className="mb-3">This page shows the status returned for your borrower account by OxyLoans.</p>
              {state.reason ? <div className="border rounded p-3 mb-4"><strong>Rejection reason</strong><p className="mb-0 mt-2">{state.reason}</p></div> : <p className="text-muted">The API did not provide a rejection reason.</p>}
              <div className="d-flex gap-2 flex-wrap"><a className="btn btn-outline-primary" href="mailto:support@oxyloans.com">Contact Support</a><Link className="btn btn-primary" to="/borrowerRequestAmount">My Loan Applications</Link></div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default BorrowerLoanRejectionDetails;
