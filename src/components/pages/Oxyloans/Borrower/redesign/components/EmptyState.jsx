import React from "react";
import "../redesign.css";

const EmptyState = ({ title, description, icon = "fa-folder-open", actionText, onAction }) => {
  return (
    <div className="oxy-card text-center py-5 d-flex flex-column align-items-center justify-content-center">
      <div 
        className="d-flex align-items-center justify-content-center mb-3"
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          backgroundColor: "var(--oxy-surface-low)",
          color: "var(--oxy-primary)"
        }}
      >
        <i className={`fa-solid ${icon} fa-2x`}></i>
      </div>
      <h5 className="fw-bold mb-2" style={{ color: "var(--oxy-on-surface)" }}>{title}</h5>
      <p className="text-muted mb-4 max-w-md" style={{ fontSize: "14px", maxWidth: "420px" }}>{description}</p>
      {actionText && onAction && (
        <button className="oxy-btn-primary" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
