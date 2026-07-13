import React from "react";
import { Link } from "react-router-dom";
import AdminCmsPaymentsPanel from "./AdminCmsPaymentsPanel";
import AdminWalletHubPanel from "./AdminWalletHubPanel";
import AdminBorrowerFdHubPanel from "./AdminBorrowerFdHubPanel";
import AdminPrioritiesPanel from "./AdminPrioritiesPanel";
import { mergeFeeSummary } from "./adminBusinessMetrics";
import { KpiCard, KpiGrid } from "./adminReportKit";
import { money, number } from "./adminAIDashboardShared";

const AdminPlatformInsights = ({
  previewCtx,
  fy,
  loading,
  loadingFy,
  onOpenModule,
  loggedIn = true,
}) => {
  const fees = mergeFeeSummary(
    previewCtx?.feeSummary,
    previewCtx?.borrowerSummary,
    previewCtx?.platform?.kpis
  );
  const kpis = previewCtx?.platform?.kpis || {};
  const recon = previewCtx?.reconciliation || {};

  return (
    <section className="ai-wow-dashboard" aria-label="Admin control panel overview">
      <div className="ai-wow-hero-banner">
        <div className="ai-wow-hero-banner-text">
          <h3 className="mb-1">Admin Control Panel</h3>
          <p className="mb-0">
            Live snapshot — CMS payouts, wallet, borrower FD, portfolio. Click any card below for full detail.
          </p>
        </div>
        <div className="ai-wow-hero-banner-pills">
          {fees.avgLenderRoi != null && (
            <span className="ai-roi-pill ai-roi-pill--lender">Lender ROI {fees.avgLenderRoi}%</span>
          )}
          {fees.avgBorrowerRoi != null && (
            <span className="ai-roi-pill ai-roi-pill--borrower">Borrower {fees.avgBorrowerRoi}%</span>
          )}
          {fees.avgSpreadPercent != null && (
            <span className="ai-roi-pill ai-roi-pill--spread">Spread {fees.avgSpreadPercent}%</span>
          )}
        </div>
      </div>

      <section className="ai-wow-panel ai-wow-panel--cms">
        <header className="ai-wow-panel-head">
          <div>
            <h5 className="mb-0">
              <i className="fas fa-money-check-alt me-2 text-success" />
              CMS lender payouts
            </h5>
            <p className="mb-0 small text-muted">Paid vs not paid from lenders_returns — Interest · Principal · Principal+Interest</p>
          </div>
          <Link to="/adminAIDashboard/cms-lender-payouts" className="btn btn-sm btn-success">
            <i className="fas fa-external-link-alt me-1" />
            Full report
          </Link>
        </header>
        <AdminCmsPaymentsPanel compact loggedIn={loggedIn} />
      </section>

      <KpiGrid className="ai-kpi-grid--dashboard ai-wow-quick-kpis">
        <KpiCard
          tone="green"
          icon="fas fa-coins"
          label="Borrower fees"
          value={loading ? "…" : money(fees.borrowerFeesCollected)}
          onClick={() => onOpenModule?.("borrower-fees")}
        />
        <KpiCard
          tone="teal"
          icon="fas fa-hand-holding-usd"
          label="Participation"
          value={loading ? "…" : money(kpis.totalInvested)}
          onClick={() => onOpenModule?.("participation-insights")}
        />
        <KpiCard
          tone="orange"
          icon="fas fa-university"
          label="CMS pending"
          value={loading ? "…" : money(recon.totalPending)}
          onClick={() => onOpenModule?.("cms-reconciliation")}
        />
        <KpiCard
          tone="indigo"
          icon="fas fa-chart-line"
          label={`FY ${fy} interest`}
          value={loadingFy ? "…" : money(kpis.fyInterestPaid)}
          onClick={() => onOpenModule?.("monthly-payout")}
        />
        <KpiCard
          tone="purple"
          icon="fas fa-layer-group"
          label="Borrower summary"
          value={loading ? "…" : number(previewCtx?.borrowerSummary?.recentAccounts?.length)}
          onClick={() => onOpenModule?.("borrower-summary")}
        />
        <KpiCard
          tone="blue"
          icon="fas fa-chart-pie"
          label="Portfolio"
          value={loading ? "…" : number(previewCtx?.dealsSummary?.activeLoanCount)}
          onClick={() => onOpenModule?.("portfolio-overview")}
        />
      </KpiGrid>

      <div className="row g-3 ai-wow-twin-panels">
        <div className="col-xl-6">
          <AdminWalletHubPanel
            walletSummary={previewCtx?.walletSummary}
            kpis={kpis}
            loading={loading}
            compact
          />
        </div>
        <div className="col-xl-6">
          <AdminBorrowerFdHubPanel
            borrowerSummary={previewCtx?.borrowerSummary}
            loading={loading}
            compact
          />
        </div>
      </div>

      <AdminPrioritiesPanel
        previewCtx={{ ...previewCtx, feeSummary: fees }}
        onOpenModule={onOpenModule}
        compact
      />
    </section>
  );
};

export default AdminPlatformInsights;
