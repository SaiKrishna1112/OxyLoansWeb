import React from "react";
import "../redesign.css";

const Timeline = ({ activities = [] }) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-4 text-muted small">
        <i className="fa-solid fa-bell-slash d-block mb-2"></i>
        No recent activities recorded.
      </div>
    );
  }

  return (
    <div className="position-relative ps-3" style={{ borderLeft: "2px solid #e2e8f0" }}>
      {activities.map((act, index) => {
        let iconClass = "fa-solid fa-circle-info text-primary";
        let bgClass = "bg-primary";
        const type = String(act?.type || "").toUpperCase();

        if (type === "SUCCESS" || type === "APPROVED" || type === "DISBURSED") {
          iconClass = "fa-solid fa-circle-check text-success";
          bgClass = "bg-success";
        } else if (type === "WARNING" || type === "PENDING" || type === "ACTION_REQUIRED") {
          iconClass = "fa-solid fa-circle-exclamation text-warning";
          bgClass = "bg-warning";
        } else if (type === "ERROR" || type === "REJECTED") {
          iconClass = "fa-solid fa-circle-xmark text-danger";
          bgClass = "bg-danger";
        }

        return (
          <div className="mb-4 position-relative" key={index}>
            {/* Timeline Dot */}
            <div 
              className={`position-absolute rounded-circle ${bgClass}`} 
              style={{ 
                left: "-21px", 
                top: "3px", 
                width: "10px", 
                height: "10px", 
                border: "2px solid #ffffff" 
              }}
            />
            
            <div className="d-flex align-items-start gap-3">
              <div 
                className="d-flex align-items-center justify-content-center rounded-3" 
                style={{ 
                  width: "32px", 
                  height: "32px", 
                  backgroundColor: "var(--oxy-surface-low)",
                  flexShrink: 0
                }}
              >
                <i className={iconClass} style={{ fontSize: "14px" }}></i>
              </div>
              <div>
                <h6 className="fw-bold mb-1" style={{ fontSize: "13.5px", color: "var(--oxy-on-surface)" }}>
                  {act.title}
                </h6>
                <p className="text-muted mb-1" style={{ fontSize: "12px" }}>
                  {act.description}
                </p>
                <span className="text-muted small d-block" style={{ fontSize: "10px" }}>
                  {act.time}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
