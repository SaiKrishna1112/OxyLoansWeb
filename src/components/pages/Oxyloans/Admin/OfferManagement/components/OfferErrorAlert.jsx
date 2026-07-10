import React from "react";

const OfferErrorAlert = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <div className="alert alert-danger alert-dismissible fade show" role="alert">
      <strong>Error:</strong> {message}
      {onDismiss && (
        <button type="button" className="btn-close" onClick={onDismiss} aria-label="Close" />
      )}
    </div>
  );
};

export default OfferErrorAlert;
