import React from "react";

const OfferPageHeader = ({ title, subtitle, children }) => (
  <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
    <div>
      <h2 className="h4 mb-1 fw-bold">{title}</h2>
      {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
    </div>
    {children && <div className="d-flex gap-2 flex-wrap">{children}</div>}
  </div>
);

export default OfferPageHeader;
