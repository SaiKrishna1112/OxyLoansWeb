import React, { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { buildFeatureLoader, FeatureContent } from "./adminAIFeatureContent";
import { getFeatureById } from "./adminAIDashboardFeatures";
import {
  BackToHub,
  currentFy,
  FyControls,
  LoadingBlock,
  PageShell,
  useFeatureLoader,
} from "./adminAIDashboardShared";
import "./AdminAIDashboard.css";

const SELF_LOADING = new Set([
  "cms-lender-payouts",
  "deals-directory",
  "lender-directory",
  "view-payments",
]);

const AdminAIFeaturePageInner = ({ feature }) => {
  const navigate = useNavigate();
  const [fy, setFy] = useState(currentFy());

  const loadFn = useMemo(() => buildFeatureLoader(feature, fy, {}), [feature, fy]);
  const { loading, error, payload, reload } = useFeatureLoader(loadFn, [feature.id, fy]);

  const previewCtx = payload?.previewCtx || {};
  const platform = payload?.platform || previewCtx.platform;
  const reconciliation = payload?.reconciliation || previewCtx.reconciliation;
  const dealIntelligence = payload?.dealIntelligence || previewCtx.dealIntelligence;
  const selfLoading = SELF_LOADING.has(feature.id);
  const showContent = selfLoading || (!loading && !error);

  return (
    <PageShell
      title={feature.title}
      breadcrumb={
        <>
          <li className="breadcrumb-item">
            <Link to="/adminAIDashboard">Control Panel</Link>
          </li>
          <li className="breadcrumb-item active">{feature.title}</li>
        </>
      }
      actions={
        feature.usesFy ? (
          <FyControls fy={fy} onFyChange={setFy} onRefresh={reload} loading={loading} />
        ) : (
          <button type="button" className="btn btn-success btn-sm" onClick={reload} disabled={loading}>
            <i className={`fas fa-sync-alt me-1 ${loading ? "fa-spin" : ""}`} />
            {loading ? "Loading…" : "Refresh"}
          </button>
        )
      }
    >
      <BackToHub />

      <header className="ai-feature-intro">
        <span className="ai-feature-intro-icon" style={{ background: feature.color }}>
          <i className={feature.icon} />
        </span>
        <div className="ai-feature-intro-text">
          <p className="mb-0">{feature.description}</p>
        </div>
      </header>

      {!selfLoading && loading && <LoadingBlock label={`Loading ${feature.title}…`} />}

      {!selfLoading && !loading && error && <div className="alert alert-danger">{error}</div>}

      {showContent && (
        <div className="ai-detail-card ai-report-page-card">
          <FeatureContent
            featureId={feature.id}
            fy={fy}
            platform={platform}
            reconciliation={reconciliation}
            lenderRisk={payload?.lenderRisk}
            lenderRiskError={payload?.lenderRiskError}
            dealIntelligence={dealIntelligence}
            previewCtx={{ ...previewCtx, ...payload }}
            onOpenModule={(id) => navigate(`/adminAIDashboard/${id}`)}
          />
        </div>
      )}
    </PageShell>
  );
};

const AdminAIFeaturePage = () => {
  const { featureId } = useParams();
  const feature = getFeatureById(featureId);

  if (!feature) {
    return <Navigate to="/adminAIDashboard" replace />;
  }

  return <AdminAIFeaturePageInner feature={feature} />;
};

export default AdminAIFeaturePage;
