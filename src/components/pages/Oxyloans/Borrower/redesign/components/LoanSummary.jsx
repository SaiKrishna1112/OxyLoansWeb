import React from "react";
import "../redesign.css";

const LoanSummary = ({ 
  requestedAmount = 0, 
  eligibleAmount = 0, 
  disbursedAmount = 0, 
  outstandingBalance = 0, 
  roi = 0, 
  tenure = 0, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="oxy-card">
        <div className="oxy-skeleton mb-3" style={{ width: "40%", height: "20px" }}></div>
        <div className="row g-3">
          {[...Array(4)].map((_, i) => (
            <div className="col-6 col-md-3" key={i}>
              <div className="oxy-skeleton mb-2" style={{ width: "60%", height: "14px" }}></div>
              <div className="oxy-skeleton" style={{ width: "80%", height: "24px" }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="oxy-card oxy-card-lg">
      <h5 className="fw-bold mb-4 text-dark">
        <i className="fa-solid fa-chart-pie text-primary me-2"></i>
        Loan Portfolio Overview
      </h5>
      <div className="row g-4">
        {/* Requested */}
        <div className="col-6 col-md-4 col-lg-2">
          <div className="border-start border-primary border-3 ps-3">
            <span className="text-muted d-block small mb-1 uppercase text-uppercase">Requested</span>
            <h4 className="fw-bold text-dark mb-0">₹ {Number(requestedAmount).toLocaleString("en-IN")}</h4>
          </div>
        </div>

        {/* Eligible */}
        <div className="col-6 col-md-4 col-lg-2">
          <div className="border-start border-success border-3 ps-3">
            <span className="text-muted d-block small mb-1 uppercase text-uppercase">Eligible</span>
            <h4 className="fw-bold text-success mb-0">₹ {Number(eligibleAmount).toLocaleString("en-IN")}</h4>
          </div>
        </div>

        {/* Disbursed */}
        <div className="col-6 col-md-4 col-lg-2">
          <div className="border-start border-info border-3 ps-3">
            <span className="text-muted d-block small mb-1 uppercase text-uppercase">Disbursed</span>
            <h4 className="fw-bold text-info mb-0">₹ {Number(disbursedAmount).toLocaleString("en-IN")}</h4>
          </div>
        </div>

        {/* Outstanding */}
        <div className="col-6 col-md-4 col-lg-2">
          <div className="border-start border-warning border-3 ps-3">
            <span className="text-muted d-block small mb-1 uppercase text-uppercase">Outstanding</span>
            <h4 className="fw-bold text-warning mb-0">₹ {Number(outstandingBalance).toLocaleString("en-IN")}</h4>
          </div>
        </div>

        {/* Interest */}
        <div className="col-6 col-md-4 col-lg-2">
          <div className="border-start border-secondary border-3 ps-3">
            <span className="text-muted d-block small mb-1 uppercase text-uppercase">Avg Interest</span>
            <h4 className="fw-bold text-dark mb-0">{roi}% p.a.</h4>
          </div>
        </div>

        {/* Tenure */}
        <div className="col-6 col-md-4 col-lg-2">
          <div className="border-start border-secondary border-3 ps-3">
            <span className="text-muted d-block small mb-1 uppercase text-uppercase">Tenure</span>
            <h4 className="fw-bold text-dark mb-0">{tenure} Days</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanSummary;
