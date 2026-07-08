import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AI_DASHBOARD_USE_STATIC,
  devAutoLogin,
  isLoggedIn,
  isSessionExpiredMessage,
  isAuthError,
  clearAdminSession,
  loadDealsDirectorySummary,
  loadPlatformKpis,
  loadWalletSummary,
  loadBorrowerPaymentsSummary,
  loadDealIntelligence,
  loadFyStats,
  loadTopLendersInvestment,
  loadFdStatistics,
} from "../../../HttpRequest/aiAdminApi";
import { getAdminAIReconciliationSummary } from "../../../HttpRequest/afterlogin";
import DashboardErrorBoundary from "./DashboardErrorBoundary";
import AdminPlatformInsights from "./AdminPlatformInsights";
import AdminFyReportsStrip from "./AdminFyReportsStrip";
import { FY_FEATURES, LIVE_FEATURES, getFeatureById } from "./adminAIDashboardFeatures";
import { buildPreviewContext, getFeaturePreviewStats } from "./adminAIFeatureContent";
import { enrichBorrowerWithFdStatistics } from "./adminBusinessMetrics";
import { currentFy, FyControls, PageShell } from "./adminAIDashboardShared";
import "./AdminAIDashboard.css";

const FeatureHubCards = ({ features, previewCtx, fy, loading, openingId, onOpen }) => (
  <div className="ai-hub-grid ai-hub-grid--compact">
    {features.map((f) => {
      const stats = getFeaturePreviewStats(f.id, previewCtx, fy);
      return (
        <button
          key={f.id}
          type="button"
          className={`ai-hub-card ai-hub-card--compact ${f.isNew ? "ai-hub-card--new" : ""}`}
          onClick={() => onOpen(f)}
          disabled={openingId === f.id}
        >
          <div className="ai-hub-card-top">
            <span className="ai-hub-card-icon" style={{ background: f.color }}>
              <i className={f.icon} />
            </span>
            {f.isNew && <span className="ai-hub-card-badge ai-hub-card-badge--new">NEW</span>}
            {f.scope === "fy" && <span className="ai-hub-card-badge ai-hub-card-badge--live">FY</span>}
          </div>
          <div className="ai-hub-card-title">{f.title}</div>
          <div className="ai-hub-card-desc">{f.description}</div>
          <div className="ai-hub-card-stats">
            {stats.map((s) => (
              <span key={s.label} className="ai-hub-stat">
                <span className="ai-hub-stat-lbl">{s.label}</span>
                <span className="ai-hub-stat-val">{loading ? "…" : s.value}</span>
              </span>
            ))}
          </div>
          <span className="ai-hub-card-cta">Open full report →</span>
        </button>
      );
    })}
  </div>
);

/** Existing control panel — overview + sidebar. Each card opens its own page. */
const AdminAIDashboard = () => {
  const navigate = useNavigate();
  const [fy, setFy] = useState(currentFy());
  const [sessionExpired, setSessionExpired] = useState(false);
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [booting, setBooting] = useState(true);
  const [openingId, setOpeningId] = useState(null);

  const [loadingHub, setLoadingHub] = useState(true);
  const [loadingFy, setLoadingFy] = useState(true);

  const [fySections, setFySections] = useState(null);
  const [overviewSections, setOverviewSections] = useState(null);
  const [dealsSummary, setDealsSummary] = useState(null);
  const [reconData, setReconData] = useState(null);
  const [dealIntel, setDealIntel] = useState(null);
  const [borrowerSummary, setBorrowerSummary] = useState(null);
  const [walletSummary, setWalletSummary] = useState(null);
  const [topLendersLive, setTopLendersLive] = useState([]);

  const openFeature = useCallback(
    (feature) => {
      const f = typeof feature === "string" ? getFeatureById(feature) : feature;
      if (!f) return;
      setOpeningId(f.id);
      navigate(`/adminAIDashboard/${f.id}`);
      setTimeout(() => setOpeningId(null), 400);
    },
    [navigate]
  );

  const previewCtx = useMemo(() => {
    const base = buildPreviewContext(
      fySections,
      overviewSections,
      dealsSummary,
      reconData,
      dealIntel,
      borrowerSummary,
      walletSummary
    );
    if (topLendersLive.length > 0) {
      return {
        ...base,
        platform: { ...base.platform, topLenders: topLendersLive },
      };
    }
    return base;
  }, [
    fySections,
    overviewSections,
    dealsSummary,
    reconData,
    dealIntel,
    borrowerSummary,
    walletSummary,
    topLendersLive,
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!AI_DASHBOARD_USE_STATIC) await devAutoLogin();
        if (!cancelled) setLoggedIn(AI_DASHBOARD_USE_STATIC || isLoggedIn());
      } catch (err) {
        if (!cancelled && (isSessionExpiredMessage(err?.message) || isAuthError(err))) {
          clearAdminSession();
          setLoggedIn(false);
          setSessionExpired(true);
        }
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loggedIn && !AI_DASHBOARD_USE_STATIC) {
      setLoadingHub(false);
      setLoadingFy(false);
      return;
    }

    let cancelled = false;

    const loadHub = async () => {
      setLoadingHub(true);
      try {
        const [dealsSum, reconRes, kpis] = await Promise.all([
          loadDealsDirectorySummary().catch(() => null),
          getAdminAIReconciliationSummary().catch(() => ({ data: {} })),
          loadPlatformKpis().catch(() => ({})),
        ]);
        if (cancelled) return;
        setDealsSummary(dealsSum);
        setReconData(reconRes?.data || {});
        setOverviewSections({ platformKpis: { data: { kpis } } });
        setLoadingHub(false);

        const [walletRes, borrowerRes] = await Promise.all([
          loadWalletSummary().catch(() => null),
          loadBorrowerPaymentsSummary().catch(() => null),
        ]);
        if (cancelled) return;
        setWalletSummary(walletRes?.data || null);
        const borrowerBase = borrowerRes?.data
          ? { ...borrowerRes.data, error: borrowerRes.error }
          : borrowerRes?.error
            ? { error: borrowerRes.error, recentAccounts: [] }
            : null;
        setBorrowerSummary(borrowerBase);

        loadFdStatistics("ALL")
          .catch(() => null)
          .then((fdRes) => {
            if (cancelled || !borrowerBase) return;
            setBorrowerSummary(
              enrichBorrowerWithFdStatistics(borrowerBase, fdRes?.data, fdRes?.error)
            );
          });

        const [intelRes, topSec] = await Promise.all([
          loadDealIntelligence().catch(() => null),
          loadTopLendersInvestment(fy, 25).catch(() => null),
        ]);
        if (cancelled) return;
        const intel = intelRes?.data || intelRes || {};
        setDealIntel({ ...intel, dealRows: intel.runningDeals || [] });
        setTopLendersLive(topSec?.data?.topLenders || []);
      } catch (err) {
        if (!cancelled && (isSessionExpiredMessage(err?.message) || isAuthError(err))) {
          clearAdminSession();
          setLoggedIn(false);
          setSessionExpired(true);
        }
        if (!cancelled) setLoadingHub(false);
      }
    };

    const loadFy = async () => {
      setLoadingFy(true);
      try {
        const result = await loadFyStats(fy);
        if (!cancelled) setFySections(result?.sections || null);
      } catch {
        if (!cancelled) setFySections(null);
      } finally {
        if (!cancelled) setLoadingFy(false);
      }
    };

    loadHub();
    loadFy();

    return () => {
      cancelled = true;
    };
  }, [loggedIn, fy]);

  const reloadFy = useCallback(async () => {
    setLoadingFy(true);
    try {
      const result = await loadFyStats(fy);
      setFySections(result?.sections || null);
    } finally {
      setLoadingFy(false);
    }
  }, [fy]);

  return (
    <PageShell
      title="Admin Control Panel"
      breadcrumb={<li className="breadcrumb-item active">Control Panel</li>}
      actions={
        <FyControls fy={fy} onFyChange={setFy} onRefresh={reloadFy} loading={loadingFy} />
      }
    >
      {!AI_DASHBOARD_USE_STATIC && (sessionExpired || (!loggedIn && !booting)) && (
        <div className="alert alert-warning d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <span>
            <i className="fas fa-lock me-2" />
            {sessionExpired ? "Session expired." : "Admin login required."}
          </span>
          <Link to="/admlogin" className="btn btn-sm btn-primary">
            Admin Login
          </Link>
        </div>
      )}

      <DashboardErrorBoundary>
        <AdminPlatformInsights
          previewCtx={previewCtx}
          fy={fy}
          loading={loadingHub}
          loadingFy={loadingFy}
          onOpenModule={openFeature}
          loggedIn={loggedIn}
        />

        <section className="ai-hub ai-hub--modules mt-4">
          <div className="ai-hub-head">
            <h5 className="mb-0">
              <i className="fas fa-bolt me-2 text-success" />
              Live reports
            </h5>
            <p className="text-muted small mb-0">Each card opens its own full report page</p>
          </div>
          <FeatureHubCards
            features={LIVE_FEATURES}
            previewCtx={previewCtx}
            fy={fy}
            loading={loadingHub}
            openingId={openingId}
            onOpen={openFeature}
          />
        </section>

        <section className="ai-hub ai-hub--fy mt-4">
          <AdminFyReportsStrip
            platform={previewCtx.platform}
            fy={fy}
            loading={loadingFy}
            onOpenModule={openFeature}
          />
          <div className="ai-hub-head mt-3">
            <h5 className="mb-0">
              <i className="fas fa-calendar-alt me-2 text-primary" />
              Financial year reports
            </h5>
          </div>
          <FeatureHubCards
            features={FY_FEATURES}
            previewCtx={previewCtx}
            fy={fy}
            loading={loadingFy}
            openingId={openingId}
            onOpen={openFeature}
          />
        </section>
      </DashboardErrorBoundary>
    </PageShell>
  );
};

export default AdminAIDashboard;
