import React from "react";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import { Link } from "react-router-dom";

const RunningLoan = () => {
  return (
    <div className="main-wrapper">
      <BorrowerHeader />
      <BorrowerSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Running Loans</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/borrowerDashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">Running Loans</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body text-center py-5">
              <i className="fa fa-money-bill-wave fa-3x text-muted mb-3" />
              <h5>Running Loans</h5>
              <p className="text-muted">
                Your active disbursed loans will appear here once they are processed.
              </p>
              <Link to="/my-marketplace-loans" className="btn btn-primary">
                View Marketplace Loans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunningLoan;
