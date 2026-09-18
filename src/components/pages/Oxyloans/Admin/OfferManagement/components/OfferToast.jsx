import React, { useEffect } from "react";

const OfferToast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  const bg = type === "success" ? "success" : type === "danger" ? "danger" : "info";

  return (
    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1100 }}>
      <div className={`toast show align-items-center text-white bg-${bg} border-0`} role="alert">
        <div className="d-flex">
          <div className="toast-body">{message}</div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            onClick={onClose}
            aria-label="Close"
          />
        </div>
      </div>
    </div>
  );
};

export default OfferToast;
