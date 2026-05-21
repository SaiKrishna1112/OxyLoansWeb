import React from "react";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import { Link } from "react-router-dom";

const LoanEligibility = () => {
  return (
    <div className="main-wrapper">
      <BorrowerHeader />
      <BorrowerSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Loan Eligibility</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/borrowerDashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">Loan Eligibility</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">How Eligibility is Calculated</h5>
              <ul className="list-group list-group-flush mb-4">
                <li className="list-group-item">
                  <i className="fa fa-check-circle text-success me-2" />
                  Upload your salary slip to set your monthly income
                </li>
                <li className="list-group-item">
                  <i className="fa fa-check-circle text-success me-2" />
                  Loan eligibility = Monthly salary / 10
                </li>
                <li className="list-group-item">
                  <i className="fa fa-check-circle text-success me-2" />
                  Each referral multiplies your eligibility (max = monthly salary)
                </li>
              </ul>
              <p className="text-muted">
                Example: ₹24,000/month salary → Base eligibility ₹2,400.
                With 50 referrals → ₹1,20,000 (capped at ₹24,000).
              </p>
              <Link to="/post-loan-request" className="btn btn-primary me-2">
                Post Marketplace Loan Request
              </Link>
              <Link to="/borrowerProfile" className="btn btn-outline-secondary">
                Update Profile / Upload Documents
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanEligibility;
