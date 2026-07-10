import React, { useMemo } from "react";
import { money, HBarChart } from "./adminAIDashboardShared";
import { buildAdminProfitPlaybook, ADMIN_METRIC_HELP } from "./adminBusinessMetrics";

/** Platform economics — borrower vs lender vs platform profit, deal launch guide */
const AdminPlPanel = ({ previewCtx, loading, onOpenModule }) => {
  const playbook = useMemo(() => buildAdminProfitPlaybook(previewCtx || {}), [previewCtx]);
  const {
    pl,
    borrowerSideItems,
    lenderSideItems,
    platformProfitItems,
    borrowerSplitItems,
    launchGuide,
    actions,
    theory,
  } = playbook;

  return (
    <div className="ai-pl-panel">
      <header className="ai-pl-panel-head">
        <div>
          <h5 className="mb-0">
            <i className="fas fa-scale-balanced me-2 text-primary" />
            Platform economics &amp; profit
          </h5>
          <p className="text-muted small mb-0">
            Borrower fees · FD interest · lender payouts · spread margin — shown separately
          </p>
        </div>
        {onOpenModule && (
          <button type="button" className="ai-board-link" onClick={() => onOpenModule("fees-revenue")}>
            Full report
          </button>
        )}
      </header>

      <div className="ai-pl-theory">
        <p className="ai-pl-theory-title">How OxyLoans makes money (plain language)</p>
        <ul className="ai-pl-theory-list">
          {theory.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      {/* Three pillars — no misleading subtraction */}
      <div className="ai-economics-grid">
        <section className="ai-economics-col ai-economics-col--borrower">
          <h6 className="ai-economics-col-title">
            <i className="fas fa-user-graduate me-1" /> Borrower side
          </h6>
          <div className="ai-economics-metrics">
            <div className="ai-economics-metric">
              <span className="ai-economics-val">{loading ? "…" : money(pl.borrowerFees)}</span>
              <span className="ai-economics-lbl" title={ADMIN_METRIC_HELP.borrowerFee}>
                Borrower fees → platform cash
              </span>
            </div>
            <div className="ai-economics-metric">
              <span className="ai-economics-val">
                {loading
                  ? "…"
                  : money(pl.borrowerFdInterestRecorded || pl.borrowerFdInterestEstAnnual)}
              </span>
              <span className="ai-economics-lbl" title={ADMIN_METRIC_HELP.borrowerFdInterest}>
                {pl.borrowerFdInterestRecorded > 0 ? "FD interest earned (recorded)" : `FD interest est. @ ${pl.avgBorrowerRoi}% ROI`}
              </span>
            </div>
            <div className="ai-economics-metric">
              <span className="ai-economics-val">{loading ? "…" : money(pl.runningFdAmount)}</span>
              <span className="ai-economics-lbl" title={ADMIN_METRIC_HELP.fdStatistics}>Running FD principal</span>
            </div>
            <div className="ai-economics-metric">
              <span className="ai-economics-val">{loading ? "…" : money(pl.closedFdAmount)}</span>
              <span className="ai-economics-lbl">Closed FD principal</span>
            </div>
          </div>
          {borrowerSideItems.length > 0 && <HBarChart items={borrowerSideItems.slice(0, 5)} />}
        </section>

        <section className="ai-economics-col ai-economics-col--lender">
          <h6 className="ai-economics-col-title">
            <i className="fas fa-users me-1" /> Lender side
          </h6>
          <div className="ai-economics-metrics">
            <div className="ai-economics-metric">
              <span className="ai-economics-val">{loading ? "…" : money(pl.interestPaidToLenders)}</span>
              <span className="ai-economics-lbl" title={ADMIN_METRIC_HELP.lenderInterest}>
                Interest paid to lenders (all-time)
              </span>
            </div>
            <div className="ai-economics-metric">
              <span className="ai-economics-val">{loading ? "…" : money(pl.lenderInterestOnRunningDeals)}</span>
              <span className="ai-economics-lbl">Interest on running deals only</span>
            </div>
            <div className="ai-economics-metric">
              <span className="ai-economics-val">{loading ? "…" : money(pl.principalReturnedToLenders)}</span>
              <span className="ai-economics-lbl">Principal returned (pass-through)</span>
            </div>
            {pl.avgLenderRoi != null && (
              <div className="ai-economics-metric ai-economics-metric--roi">
                <span className="ai-economics-val">{pl.avgLenderRoi}%</span>
                <span className="ai-economics-lbl">Avg lender ROI on deals</span>
              </div>
            )}
          </div>
          {lenderSideItems.length > 0 && <HBarChart items={lenderSideItems} />}
        </section>

        <section className="ai-economics-col ai-economics-col--platform">
          <h6 className="ai-economics-col-title">
            <i className="fas fa-building me-1" /> Platform profit
          </h6>
          <div className="ai-economics-metrics">
            <div className="ai-economics-metric">
              <span className="ai-economics-val">{loading ? "…" : money(pl.platformCashRevenue)}</span>
              <span className="ai-economics-lbl">Cash from borrower fees</span>
            </div>
            <div className="ai-economics-metric">
              <span className="ai-economics-val">{loading ? "…" : money(pl.platformSpreadMargin)}</span>
              <span className="ai-economics-lbl" title={ADMIN_METRIC_HELP.estProfit}>
                Est. spread margin (live deals)
              </span>
            </div>
            <div className="ai-economics-metric ai-economics-metric--highlight">
              <span className="ai-economics-val">{loading ? "…" : money(pl.totalEstPlatformProfit)}</span>
              <span className="ai-economics-lbl" title={ADMIN_METRIC_HELP.platformProfit}>
                Total est. profit = fees + spread
              </span>
            </div>
            {pl.avgSpread != null && (
              <div className="ai-economics-metric ai-economics-metric--roi">
                <span className="ai-economics-val">{pl.avgSpread}%</span>
                <span className="ai-economics-lbl">Avg spread (borrower − lender ROI)</span>
              </div>
            )}
          </div>
          {platformProfitItems.length > 0 && <HBarChart items={platformProfitItems} />}
        </section>
      </div>

      {borrowerSplitItems.length > 0 && (
        <div className="ai-board-chart-block mt-3">
          <p className="ai-board-chart-title" title={ADMIN_METRIC_HELP.runningClosed}>
            Borrower FD &amp; fees — running vs closed
          </p>
          <HBarChart items={borrowerSplitItems} />
        </div>
      )}

      {/* Deal launch guide */}
      <div className="ai-launch-guide">
        <h6 className="ai-launch-guide-title">
          <i className="fas fa-rocket me-1 text-success" />
          Which deals to launch &amp; why
        </h6>
        <div className="ai-launch-guide-grid">
          <div className="ai-launch-guide-box">
            <p className="ai-launch-guide-label">Why launch now</p>
            <ul className="ai-launch-guide-list">
              {launchGuide.whyLaunch.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
          <div className="ai-launch-guide-box">
            <p className="ai-launch-guide-label">Suggested next deal</p>
            <p className="ai-launch-guide-val">{loading ? "…" : money(launchGuide.suggestedSize)}</p>
            <p className="ai-launch-guide-meta">
              Lender ROI {launchGuide.suggestedLenderRoi} · Borrower ROI {launchGuide.suggestedBorrowerRoi}%
            </p>
            <p className="ai-launch-guide-meta">
              Preferred type: <strong>{launchGuide.preferredDealType}</strong> — {launchGuide.preferredDealWhy}
            </p>
            {launchGuide.rationale && (
              <p className="ai-launch-guide-rationale text-muted small">{launchGuide.rationale}</p>
            )}
          </div>
          <div className="ai-launch-guide-box">
            <p className="ai-launch-guide-label">ROI bands (target)</p>
            <ul className="ai-launch-guide-list ai-launch-guide-list--compact">
              <li>Lender: {launchGuide.roiBands.lender}</li>
              <li>Borrower: {launchGuide.roiBands.borrower}</li>
              <li>Spread: {launchGuide.roiBands.spread}</li>
              {launchGuide.roiBands.currentAvgSpread != null && (
                <li>
                  Current avg spread: <strong>{launchGuide.roiBands.currentAvgSpread}%</strong>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="ai-launch-profit-tips">
          <p className="ai-launch-guide-label">How to increase profit</p>
          <ul className="ai-launch-guide-list">
            {launchGuide.increaseProfit.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ai-pl-actions">
        <p className="ai-pl-actions-title">
          <i className="fas fa-lightbulb me-1 text-warning" />
          Admin actions
        </p>
        <ul className="ai-pl-action-list">
          {actions.map((a) => (
            <li key={a.title} className="ai-pl-action-item">
              <i className={`${a.icon} ai-pl-action-icon`} />
              <div>
                <strong>{a.title}</strong>
                <span>{a.detail}</span>
              </div>
              {a.module && onOpenModule && (
                <button type="button" className="ai-board-link" onClick={() => onOpenModule(a.module)}>
                  Open
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminPlPanel;
