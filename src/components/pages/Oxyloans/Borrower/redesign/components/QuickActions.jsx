import React from "react";
import { Link } from "react-router-dom";
import "../redesign.css";

const QuickActions = () => {
  const actions = [
    {
      title: "Active Offers",
      icon: "fa-solid fa-hand-holding-dollar",
      path: "/borrowerLoansInitiated",
      color: "var(--oxy-primary)",
      bgColor: "rgba(0, 64, 224, 0.08)",
      desc: "Accept matched bids"
    },
    {
      title: "New Request",
      icon: "fa-solid fa-file-invoice-dollar",
      path: "/borrowerLoanRequestCreate",
      color: "var(--oxy-tertiary)",
      bgColor: "rgba(0, 98, 66, 0.08)",
      desc: "Apply for a new loan limit"
    },
    {
      title: "Agreed Loans",
      icon: "fa-solid fa-file-contract",
      path: "/borrowerDisbursementAmount",
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.08)",
      desc: "Check agreement paperwork"
    },
    {
      title: "Nearby Lenders",
      icon: "fa-solid fa-location-dot",
      path: "/nearbyleders",
      color: "#6366f1",
      bgColor: "rgba(99, 102, 241, 0.08)",
      desc: "Explore local lenders"
    }
  ];

  return (
    <div className="row g-3 mb-4">
      {actions.map((act, index) => (
        <div className="col-6 col-md-3" key={index}>
          <Link 
            to={act.path} 
            className="oxy-card text-decoration-none d-flex flex-column h-100 mb-0 align-items-start"
            style={{ padding: "20px" }}
          >
            <div 
              className="d-flex align-items-center justify-content-center rounded-3 mb-3"
              style={{
                width: "44px",
                height: "44px",
                backgroundColor: act.bgColor,
                color: act.color
              }}
            >
              <i className={`${act.icon} fa-lg`}></i>
            </div>
            <h6 className="fw-bold mb-1 text-dark" style={{ fontSize: "14px" }}>{act.title}</h6>
            <span className="text-muted small" style={{ fontSize: "11px" }}>{act.desc}</span>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default QuickActions;
