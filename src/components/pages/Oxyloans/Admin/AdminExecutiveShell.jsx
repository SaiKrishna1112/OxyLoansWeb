import React, { useMemo, useState } from "react";
import AdminActiveLendersPanel from "./AdminActiveLendersPanel";
import AdminPrioritiesPanel from "./AdminPrioritiesPanel";
import AdminFdStatistics from "./AdminFdStatistics";
import { AdminDealRoiTable } from "./AdminDealRoiTable";
import {
  CapitalFlowDiagram,
  DealPipelineChart,
  WalletCompositionChart,
  FdCollateralChart,
  MonthlyPayoutChart,
  RevenueFlowChart,
} from "./AdminVisualCharts";
import {
  mergeFeeSummary,
  buildBorrowerLifecycleSnapshot,
  buildWalletFlowSnapshot,
  buildPlatformPlSnapshot,
} from "./adminBusinessMetrics";
import { money, number, fyOptions } from "./adminAIDashboardShared";

const TABS = [
  { id: "summary", label: "Overview", icon: "fas fa-gauge-high" },
  { id: "lenders", label: "Lenders", icon: "fas fa-users" },
  { id: "borrowers", label: "Borrowers", icon: "fas fa-piggy-bank" },
  { id: "deals", label: "Deals", icon: "fas fa-briefcase" },
  { id: "reports", label: "FY Reports", icon: "fas fa-calendar-alt" },
  { id: "tools", label: "Tools", icon: "fas fa-th-large" },
];

const KpiRow = ({ items, loading }) => (
  <div className="ai-dash-kpi-row">
    {items.map(({ label, value, icon }) => (
      <div key={label} className="ai-dash-kpi">
        <div className="ai-dash-kpi-icon">
          <i className={icon} />
        </div>
        <div className="ai-dash-kpi-text">
          <span className="ai-dash-kpi-val">{loading ? "—" : value}</span>
          <span className="ai-dash-kpi-lbl">{label}</span>
        </div>
      </div>
    ))}
  </div>
);

const DealFunnel = ({ open, active, closed, loading }) => (
  <div className="ai-dash-funnel">
    <div className="ai-dash-funnel-item ai-dash-funnel-item--open">
      <span className="ai-dash-funnel-num">{loading ? "—" : number(open)}</span>
      <span className="ai-dash-funnel-txt">Open</span>
    </div>
    <div className="ai-dash-funnel-line" />
    <div className="ai-dash-funnel-item ai-dash-funnel-item--active">
      <span className="ai-dash-funnel-num">{loading ? "—" : number(active)}</span>
      <span className="ai-dash-funnel-txt">Active</span>
    </div>
    <div className="ai-dash-funnel-line" />
    <div className="ai-dash-funnel-item ai-dash-funnel-item--closed">
      <span className="ai-dash-funnel-num">{loading ? "—" : number(closed)}</span>
      <span className="ai-dash-funnel-txt">Closed</span>
    </div>
  </div>
);

const Section = ({ title, subtitle, action, children, tone = "default" }) => (
  <section className={`ai-dash-section ai-dash-section--${tone}`}>
    {(title || action) && (
      <header className="ai-dash-section-head">
        <div>
          {title && <h5 className="ai-dash-section-title">{title}</h5>}
          {subtitle && <p className="ai-dash-section-sub">{subtitle}</p>}
        </div>
        {action}
      </header>
    )}
    <div className="ai-dash-section-body">{children}</div>
  </section>
);

const AdminExecutiveShell = ({
  previewCtx,
  fy,
  setFy,
  loading,
  loadingFy,
  onOpenModule,
  onRefresh,
  renderModuleCards,
  renderFyModuleCards,
}) => {
  const [tab, setTab] = useState("summary");

  const dealRows = previewCtx?.dealRows || [];
  const monthlyTrend = previewCtx?.platform?.monthlyTrend || [];
  const kpis = previewCtx?.platform?.kpis || {};
  const overview = previewCtx?.overview || {};
  const deals = previewCtx?.dealsSummary || {};
  const borrower = previewCtx?.borrowerSummary || {};
  const fees = mergeFeeSummary(previewCtx?.feeSummary, borrower, kpis);
  const walletFlow = buildWalletFlowSnapshot(previewCtx?.walletSummary, kpis);
  const borrowerLife = buildBorrowerLifecycleSnapshot(borrower);
  const pl = buildPlatformPlSnapshot(previewCtx);

  const spread =
    fees.avgSpreadPercent ??
    (fees.avgBorrowerRoi != null && fees.avgLenderRoi != null
      ? Math.round((fees.avgBorrowerRoi - fees.avgLenderRoi) * 100) / 100
      : null);

  const flowSteps = useMemo(
    () => [
      { label: "Lender capital", value: money(fees.activeParticipationAmount || kpis.totalInvested || overview.totalInvestment), icon: "fas fa-users" },
      { label: "Escrow wallet", value: money(walletFlow.currentBalance), icon: "fas fa-wallet" },
      { label: "In live deals", value: money(walletFlow.activeInDeals || kpis.activeDealsAmount), icon: "fas fa-briefcase" },
      { label: "Platform revenue", value: money(pl.totalEstPlatformProfit || fees.borrowerFeesCollected), icon: "fas fa-chart-line" },
    ],
    [fees, kpis, overview, walletFlow, pl]
  );

  const kpiAll = [
    { label: "Participation", value: money(fees.activeParticipationAmount || kpis.totalInvested), icon: "fas fa-hand-holding-usd" },
    { label: "Escrow balance", value: money(walletFlow.currentBalance), icon: "fas fa-wallet" },
    { label: "Active deals", value: money(walletFlow.activeInDeals || kpis.activeDealsAmount), icon: "fas fa-briefcase" },
    { label: "FD collateral", value: money(borrowerLife.totalFdAmount), icon: "fas fa-university" },
    { label: "Borrower fees", value: money(fees.borrowerFeesCollected), icon: "fas fa-receipt" },
    { label: "Active lenders", value: number(overview.activeLenderCount), icon: "fas fa-users" },
  ];

  const revenueItems = [
    { label: "Borrower fees", value: pl.borrowerFees, color: "#008f64" },
    { label: "Spread margin", value: pl.platformSpreadMargin, color: "#0d9488" },
    { label: "Interest paid", value: pl.interestPaidToLenders, color: "#64748b" },
  ];

  const openLink = (moduleId, label) =>
    onOpenModule ? (
      <button type="button" className="ai-dash-link" onClick={() => onOpenModule(moduleId)}>
        {label} <i className="fas fa-chevron-right ms-1" />
      </button>
    ) : null;

  return (
    <div className="ai-dash-board">
      {/* ── TOP: brand header + ROI ── */}
      <header className="ai-dash-top">
        <div className="ai-dash-top-left">
          <span className="ai-dash-top-brand">OxyLoans Admin</span>
          <h1 className="ai-dash-top-title">Operations Dashboard</h1>
        </div>
        <div className="ai-dash-top-right">
          {fees.avgLenderRoi != null && (
            <span className="ai-dash-badge ai-dash-badge--green">Lender {fees.avgLenderRoi}%</span>
          )}
          {(fees.avgBorrowerRoi != null || borrower.avgBorrowerRoi > 0) && (
            <span className="ai-dash-badge ai-dash-badge--teal">
              Borrower {fees.avgBorrowerRoi ?? borrower.avgBorrowerRoi}%
            </span>
          )}
          {spread != null && <span className="ai-dash-badge ai-dash-badge--gold">Spread {spread}%</span>}
          {onRefresh && (
            <button
              type="button"
              className="ai-dash-refresh-btn"
              onClick={onRefresh}
              disabled={loading || loadingFy}
              title="Refresh dashboard data"
            >
              <i className={`fas fa-sync-alt ${loading || loadingFy ? "fa-spin" : ""}`} />
              Refresh
            </button>
          )}
        </div>
      </header>

      {/* ── TABS ── */}
      <nav className="ai-dash-tabs" aria-label="Dashboard sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`ai-dash-tab ${tab === t.id ? "ai-dash-tab--on" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <i className={t.icon} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {/* ── BODY ── */}
      <div className="ai-dash-body">
        {tab === "summary" && (
          <div className="ai-dash-stack">
            <KpiRow items={kpiAll} loading={loading} />

            <Section title="Capital flow" subtitle="How money moves across the platform">
              <CapitalFlowDiagram steps={flowSteps} loading={loading} />
            </Section>

            <div className="ai-dash-grid-2">
              <DealPipelineChart
                open={deals.openForParticipationCount ?? deals.runningCount}
                active={deals.activeLoanCount}
                closed={deals.borrowerClosedCount}
                loading={loading}
              />
              <WalletCompositionChart
                idle={walletFlow.currentBalance}
                deployed={walletFlow.activeInDeals || kpis.activeDealsAmount}
                loading={loading}
              />
            </div>

            {monthlyTrend.length > 0 && (
              <MonthlyPayoutChart
                rows={monthlyTrend}
                loading={loadingFy}
                title={fy ? `Monthly payouts · FY ${fy}–${String(fy + 1).slice(2)}` : "Monthly payouts"}
              />
            )}

            <Section title="Priority alerts" subtitle="Items that need admin attention today" tone="alert">
              <AdminPrioritiesPanel previewCtx={{ ...previewCtx, feeSummary: fees }} onOpenModule={onOpenModule} compact />
            </Section>
          </div>
        )}

        {tab === "lenders" && (
          <div className="ai-dash-stack">
            <KpiRow
              items={kpiAll.filter((k) => ["Participation", "Escrow balance", "Active lenders"].includes(k.label))}
              loading={loading}
            />
            <div className="ai-dash-grid-2">
              <WalletCompositionChart
                idle={walletFlow.currentBalance}
                deployed={walletFlow.activeInDeals || kpis.activeDealsAmount}
                loading={loading}
              />
              <RevenueFlowChart items={revenueItems} loading={loading} />
            </div>
            <Section
              title="Lender participation"
              subtitle="Filter by period (deal received_on)"
              action={openLink("lender-directory", "Full directory")}
            >
              <AdminActiveLendersPanel initialPreset="3M" />
            </Section>
          </div>
        )}

        {tab === "borrowers" && (
          <div className="ai-dash-stack">
            <KpiRow
              items={[
                { label: "Total FD", value: money(borrowerLife.totalFdAmount), icon: "fas fa-university" },
                { label: "Active FDs", value: number(borrowerLife.runningCount), icon: "fas fa-check-circle" },
                { label: "Closed FDs", value: number(borrowerLife.closedCount), icon: "fas fa-archive" },
                { label: "Fees collected", value: money(borrowerLife.totalBorrowerFees), icon: "fas fa-receipt" },
                { label: "Overdue", value: number(borrowerLife.overdueCount), icon: "fas fa-exclamation-circle" },
                { label: "Running FD", value: money(borrowerLife.runningFdAmount), icon: "fas fa-coins" },
              ]}
              loading={loading}
            />
            <div className="ai-dash-grid-2">
              <FdCollateralChart
                activeAmount={borrowerLife.runningFdAmount}
                closedAmount={borrowerLife.closedFdAmount}
                loading={loading}
              />
              <Section title="FD snapshot" subtitle="Live from fdStatistics API">
                <AdminFdStatistics summary={previewCtx?.borrowerSummary} loading={loading} compact />
              </Section>
            </div>
            <Section
              title="FD collateral detail"
              subtitle="HDFC / ICICI breakdown"
              action={openLink("borrower-accounts", "All accounts")}
            >
              <AdminFdStatistics summary={previewCtx?.borrowerSummary} loading={loading} />
            </Section>
          </div>
        )}

        {tab === "deals" && (
          <div className="ai-dash-stack">
            <Section title="Deal pipeline" subtitle="Open → Active → Closed">
              <DealFunnel
                open={deals.openForParticipationCount ?? deals.runningCount}
                active={deals.activeLoanCount}
                closed={deals.borrowerClosedCount}
                loading={loading}
              />
            </Section>
            <div className="ai-dash-grid-2">
              <DealPipelineChart
                open={deals.openForParticipationCount ?? deals.runningCount}
                active={deals.activeLoanCount}
                closed={deals.borrowerClosedCount}
                loading={loading}
              />
              <Section title="ROI at a glance">
                <div className="ai-dash-roi-grid">
                  <div><span className="ai-dash-roi-lbl">Lender</span><strong>{fees.avgLenderRoi ?? "—"}%</strong></div>
                  <div><span className="ai-dash-roi-lbl">Borrower</span><strong>{fees.avgBorrowerRoi ?? borrower.avgBorrowerRoi ?? "—"}%</strong></div>
                  <div><span className="ai-dash-roi-lbl">Spread</span><strong>{spread ?? "—"}%</strong></div>
                  <div><span className="ai-dash-roi-lbl">Live value</span><strong>{loading ? "—" : money(kpis.activeDealsAmount)}</strong></div>
                </div>
              </Section>
            </div>
            {dealRows.length > 0 && (
              <Section title="Active deals" action={openLink("deal-roi-board", "Full board")}>
                <AdminDealRoiTable deals={dealRows} limit={12} compact />
              </Section>
            )}
            {(previewCtx?.dealIntelligence?.riskDeals?.length ?? 0) > 0 && (
              <Section title="Needs review" tone="warn">
                <AdminDealRoiTable deals={previewCtx.dealIntelligence.riskDeals} limit={8} compact />
              </Section>
            )}
          </div>
        )}

        {tab === "reports" && (
          <div className="ai-dash-stack">
            <div className="ai-dash-fy-bar">
              <div>
                <h5 className="mb-1">Financial year reports</h5>
                <p className="mb-0">Apr–Mar · interest, principal, top performers</p>
              </div>
              <select
                className="form-select form-select-sm"
                value={fy}
                onChange={(e) => setFy(Number(e.target.value))}
                disabled={loadingFy}
              >
                {fyOptions().map((year) => (
                  <option key={year} value={year}>
                    FY {year}–{String(year + 1).slice(2)}
                  </option>
                ))}
              </select>
            </div>
            {monthlyTrend.length > 0 && (
              <MonthlyPayoutChart
                rows={monthlyTrend}
                loading={loadingFy}
                title={`Payout trend · FY ${fy}–${String(fy + 1).slice(2)}`}
              />
            )}
            {loadingFy && (
              <div className="ai-dash-loading">
                <div className="spinner-border spinner-border-sm text-success" />
                <span>Loading FY {fy}…</span>
              </div>
            )}
            <div className="ai-hub-grid">{renderFyModuleCards?.()}</div>
          </div>
        )}

        {tab === "tools" && (
          <div className="ai-dash-stack">
            <Section title="All operations tools" subtitle="Reports, directories, CMS, wallet, and more">
              {loading && (
                <div className="ai-dash-loading mb-3">
                  <div className="spinner-border spinner-border-sm text-success" />
                  <span>Loading…</span>
                </div>
              )}
              <div className="ai-hub-grid">{renderModuleCards?.()}</div>
            </Section>
          </div>
        )}
      </div>

      {/* ── BOTTOM footer strip ── */}
      <footer className="ai-dash-bottom">
        <span><i className="fas fa-circle text-success me-1" style={{ fontSize: 8 }} /> Live data from production DB</span>
        <span>Participation {loading ? "…" : money(fees.activeParticipationAmount || kpis.totalInvested)}</span>
        <span>Escrow {loading ? "…" : money(walletFlow.currentBalance)}</span>
        <span>Deals open {loading ? "…" : number(deals.openForParticipationCount ?? deals.runningCount)}</span>
      </footer>
    </div>
  );
};

export default AdminExecutiveShell;
