import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { buildFeatureLoader, FeatureContent, PREVIEW_FEATURES } from "./adminAIFeatureContent";
import { currentFy, FyControls, LoadingBlock, useFeatureLoader } from "./adminAIDashboardShared";

const AdminAIFeatureModalInner = ({ feature, onClose, cache, initialFy, onOpenModule }) => {
  const [fy, setFy] = useState(initialFy ?? currentFy());
  const loadFn = useMemo(
    () => buildFeatureLoader(feature, fy, cache),
    [feature, fy, cache]
  );
  const { loading, error, payload, reload } = useFeatureLoader(loadFn, [feature.id, fy]);

  useEffect(() => {
    setFy(initialFy ?? currentFy());
  }, [feature.id, initialFy]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.body.classList.add("ai-modal-open");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("ai-modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const scopeLabel = feature.usesFy
    ? `Financial year ${fy}–${String(fy + 1).slice(2)}`
    : "Live / all-time data";

  const showContent = !loading && !error && payload;
  const isPanelFeature = PREVIEW_FEATURES.has(feature.id);

  return createPortal(
    <div className="ai-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="ai-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ai-modal-header">
          <div className="ai-modal-title-wrap">
            <div className="ai-modal-icon" style={{ background: feature.color }}>
              <i className={feature.icon} />
            </div>
            <div>
              <h5 id="ai-modal-title" className="ai-modal-title mb-0">
                {feature.title}
              </h5>
              <p className="ai-modal-subtitle mb-0">{feature.description}</p>
              <span className={`ai-modal-scope ${feature.usesFy ? "ai-modal-scope--fy" : "ai-modal-scope--live"}`}>
                {scopeLabel}
              </span>
            </div>
          </div>
          <div className="ai-modal-actions">
            {feature.usesFy ? (
              <FyControls fy={fy} onFyChange={setFy} onRefresh={reload} loading={loading} />
            ) : (
              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={reload}
                disabled={loading}
              >
                <i className={`fas fa-sync-alt me-1 ${loading ? "fa-spin" : ""}`} />
                Refresh
              </button>
            )}
            <button
              type="button"
              className="btn btn-light btn-sm ai-modal-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <i className="fas fa-times" />
            </button>
          </div>
        </div>

        <div className="ai-modal-body">
          {loading && !isPanelFeature && <LoadingBlock label={`Loading ${feature.title}…`} />}
          {!loading && error && (
            <div className="alert alert-danger mb-0">
              <strong>Could not load data.</strong>
              <div className="small mt-1">{error}</div>
              {String(error).toLowerCase().includes("login") && (
                <Link to="/admlogin" className="btn btn-sm btn-primary mt-2">
                  Admin Login
                </Link>
              )}
            </div>
          )}
          {(showContent || isPanelFeature) && (
            <FeatureContent
              featureId={feature.id}
              fy={fy}
              platform={payload?.platform}
              reconciliation={payload?.reconciliation}
              lenderRisk={payload?.lenderRisk}
              lenderRiskError={payload?.lenderRiskError}
              paymentsData={payload?.paymentsData}
              dealIntelligence={payload?.dealIntelligence}
              previewCtx={cache}
              onOpenModule={onOpenModule}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

const AdminAIFeatureModal = ({ feature, onClose, cache, initialFy, onOpenModule }) => {
  if (!feature) return null;
  return (
    <AdminAIFeatureModalInner
      feature={feature}
      onClose={onClose}
      cache={cache}
      initialFy={initialFy}
      onOpenModule={onOpenModule}
    />
  );
};

export default AdminAIFeatureModal;
