import React from "react";
import "../redesign.css";

const LoadingState = ({ count = 3, type = "card" }) => {
  const renderCardSkeleton = (key) => (
    <div className="oxy-card" key={key}>
      <div className="d-flex align-items-center gap-3 mb-3">
        <div className="oxy-skeleton" style={{ width: "40px", height: "40px", borderRadius: "50%" }}></div>
        <div style={{ flex: 1 }}>
          <div className="oxy-skeleton mb-2" style={{ width: "40%", height: "16px" }}></div>
          <div className="oxy-skeleton" style={{ width: "20%", height: "12px" }}></div>
        </div>
      </div>
      <div className="oxy-skeleton mb-2" style={{ width: "85%", height: "14px" }}></div>
      <div className="oxy-skeleton mb-3" style={{ width: "60%", height: "14px" }}></div>
      <div className="d-flex justify-content-between pt-2 border-top">
        <div className="oxy-skeleton" style={{ width: "30%", height: "16px" }}></div>
        <div className="oxy-skeleton" style={{ width: "20%", height: "16px" }}></div>
      </div>
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="oxy-card">
      <div className="oxy-skeleton mb-4" style={{ width: "30%", height: "24px" }}></div>
      <div className="d-flex gap-3 mb-3 border-bottom pb-2">
        <div className="oxy-skeleton" style={{ flex: 1, height: "16px" }}></div>
        <div className="oxy-skeleton" style={{ flex: 1, height: "16px" }}></div>
        <div className="oxy-skeleton" style={{ flex: 1, height: "16px" }}></div>
        <div className="oxy-skeleton" style={{ flex: 1, height: "16px" }}></div>
      </div>
      {[...Array(count)].map((_, i) => (
        <div className="d-flex gap-3 mb-3" key={i}>
          <div className="oxy-skeleton" style={{ flex: 1, height: "14px" }}></div>
          <div className="oxy-skeleton" style={{ flex: 1, height: "14px" }}></div>
          <div className="oxy-skeleton" style={{ flex: 1, height: "14px" }}></div>
          <div className="oxy-skeleton" style={{ flex: 1, height: "14px" }}></div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      {type === "table" ? (
        renderTableSkeleton()
      ) : (
        <div className="row">
          {[...Array(count)].map((_, idx) => (
            <div className="col-md-6 col-lg-4" key={idx}>
              {renderCardSkeleton(idx)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LoadingState;
