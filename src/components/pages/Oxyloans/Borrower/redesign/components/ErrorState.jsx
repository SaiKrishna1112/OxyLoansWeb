import React from "react";
import "../redesign.css";

const ErrorState = ({ message, onRetry }) => {
  return (
    <div 
      className="oxy-card border-danger text-center py-5 d-flex flex-column align-items-center justify-content-center"
      style={{ borderStyle: "dashed" }}
    >
      <div 
        className="d-flex align-items-center justify-content-center mb-3"
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "var(--oxy-error-container)",
          color: "var(--oxy-error)"
        }}
      >
        <i className="fa-solid fa-triangle-exclamation fa-xl"></i>
      </div>
      <h5 className="fw-bold mb-2 text-danger">Something went wrong</h5>
      <p className="text-muted mb-4" style={{ fontSize: "14px", maxWidth: "400px" }}>
        {message || "We encountered an issue while loading details. Please check your internet connection or try again."}
      </p>
      {onRetry && (
        <button className="oxy-btn-primary bg-danger" onClick={onRetry}>
          <i className="fa-solid fa-arrows-rotate me-2"></i>Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;
