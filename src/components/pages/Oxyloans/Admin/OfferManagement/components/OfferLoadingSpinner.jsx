import React from "react";

const OfferLoadingSpinner = ({ message = "Loading...", fullPage = false }) => (
  <div
    className={`d-flex flex-column align-items-center justify-content-center ${
      fullPage ? "min-vh-50 py-5" : "py-4"
    }`}
  >
    <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
      <span className="visually-hidden">Loading...</span>
    </div>
    {message && <p className="text-muted mt-3 mb-0">{message}</p>}
  </div>
);

export default OfferLoadingSpinner;
