import React, { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { buildFeatureLoader, FeatureContent } from "./adminAIFeatureContent";
import { getFeatureById } from "./adminAIDashboardFeatures";
import { goBackOrAdminAI, goToAdminAIDashboard } from "./adminAINavigation";
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
  "cms-payments",
  "cms-lender-payouts",
  "roi-based-deals",
<<<<<<< HEAD
=======
  "deal-intelligence",
>>>>>>> feature/ai-lender-chat
  "deals-directory",
  "lender-directory",
  "membership-lookup",
  "shared-bank-accounts",
  "view-payments",
]);

const AdminAIFeaturePageInner = ({ feature }) => {
  const navigate = useNavigate();
  const [fy, setFy] = useState(currentFy());
  const [refreshNonce, setRefreshNonce] = useState(0);

  const loadFn = useMemo(() => buildFeatureLoader(feature, fy, {}), [feature, fy]);
  const { loading, error, payload, reload } = useFeatureLoader(loadFn, [feature.id, fy]);

  const previewCtx = payload?.previewCtx || {};
  const platform = payload?.platform || previewCtx.platform;
  const reconciliation = payload?.reconciliation || previewCtx.reconciliation;
  const dealIntelligence = payload?.dealIntelligence || previewCtx.dealIntelligence;
  const selfLoading = SELF_LOADING.has(feature.id);
  const showContent = selfLoading || (!loading && !error);

  const compactChrome =
    feature.id === "shared-bank-accounts" ||
    feature.id === "membership-lookup" ||
    feature.id === "cms-payments" ||
    feature.id === "cms-lender-payouts" ||
<<<<<<< HEAD
    feature.id === "roi-based-deals";
=======
    feature.id === "roi-based-deals" ||
    feature.id === "deal-intelligence";
>>>>>>> feature/ai-lender-chat

  const showDashNav =
    feature.id === "cms-payments" ||
    feature.id === "cms-lender-payouts" ||
<<<<<<< HEAD
    feature.id === "roi-based-deals";
=======
    feature.id === "roi-based-deals" ||
    feature.id === "deal-intelligence";
>>>>>>> feature/ai-lender-chat

  const refreshFeature = () => {
    reload();
    setRefreshNonce((current) => current + 1);
  };

  const backAndRefresh = (
    <div className="ai-feature-header-nav">
      <button
        type="button"
        className="sba-back"
        onClick={() => goBackOrAdminAI(navigate)}
        title="Back to Admin AI Dashboard"
      >
        <i className="fas fa-arrow-left" />
        Back
      </button>
      <button
        type="button"
        className="sba-dash-btn"
        onClick={() => goToAdminAIDashboard(navigate)}
        title="Open Admin AI Dashboard"
      >
        Admin AI Dashboard
      </button>
      <button
        type="button"
        className="btn btn-success btn-sm"
        onClick={refreshFeature}
        disabled={loading}
      >
        <i className={`fas fa-sync-alt me-1 ${loading ? "fa-spin" : ""}`} />
        {loading ? "Loading…" : "Refresh"}
      </button>
    </div>
  );

  return (
    <PageShell
      title={feature.title}
      breadcrumb={
        showDashNav ? null : (
          <>
            <li className="breadcrumb-item">
              <Link to="/adminAIDashboard">Control Panel</Link>
            </li>
            <li className="breadcrumb-item active">{feature.title}</li>
          </>
        )
      }
      actions={
        feature.usesFy ? (
          <FyControls fy={fy} onFyChange={setFy} onRefresh={reload} loading={loading} />
        ) : showDashNav ? (
          backAndRefresh
        ) : (
          <button
            type="button"
            className="btn btn-success btn-sm"
            onClick={refreshFeature}
            disabled={loading}
          >
            <i className={`fas fa-sync-alt me-1 ${loading ? "fa-spin" : ""}`} />
            {loading ? "Loading…" : "Refresh"}
          </button>
        )
      }
    >
      {compactChrome ? null : <BackToHub />}

      {compactChrome ? null : (
        <header className="ai-feature-intro">
          <span className="ai-feature-intro-icon" style={{ background: feature.color }}>
            <i className={feature.icon} />
          </span>
          <div className="ai-feature-intro-text">
            <p className="mb-0">{feature.description}</p>
          </div>
        </header>
      )}

      {!selfLoading && loading && <LoadingBlock label={`Loading ${feature.title}…`} />}

      {!selfLoading && !loading && error && <div className="alert alert-danger">{error}</div>}

      {showContent && (
        <div className={compactChrome ? "sba-feature-wrap" : "ai-detail-card ai-report-page-card"}>
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
            refreshNonce={refreshNonce}
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
