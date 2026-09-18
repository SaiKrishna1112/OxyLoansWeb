import React from "react";

const ConfirmModal = ({
  show,
  title,
  message,
  confirmLabel = "Confirm",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onCancel} disabled={loading} />
            </div>
            <div className="modal-body">{message}</div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
                Cancel
              </button>
              <button
                type="button"
                className={`btn btn-${confirmVariant}`}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Processing...
                  </>
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
};

export default ConfirmModal;
