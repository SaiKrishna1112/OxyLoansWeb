import React, { useMemo } from "react";
import { money, number, HBarChart, TrendChart } from "./adminAIDashboardShared";
import { buildWalletFlowSnapshot, ADMIN_METRIC_HELP } from "./adminBusinessMetrics";

/**
 * Lender wallet flow — loaded, debited, participated, withdrawn, returned from deals.
 * Data from lender_scrow_wallet (APPROVED) + deal participation tables.
 */
const AdminWalletBreakdown = ({ walletSummary, kpis = {}, loading, compact = false, onOpenModule }) => {
  const flow = useMemo(
    () => buildWalletFlowSnapshot(walletSummary, kpis),
    [walletSummary, kpis]
  );

  const balance = flow.currentBalance;
  const hasData =
    balance > 0 ||
    flow.totalCredited > 0 ||
    flow.totalLoaded > 0 ||
    flow.totalParticipated > 0 ||
    flow.totalDebited > 0;

  if (!hasData && !loading) {
    return (
      <p className="text-muted small mb-0">
        Wallet flow data not loaded yet. Open Wallet &amp; Deployment for details.
      </p>
    );
  }

  const flowBars = flow.flowChartItems.filter((i) => Number(i.value) > 0);
  const monthlyRows = (walletSummary?.monthlyFlow || []).map((m) => ({
    monthLabel: m.monthLabel,
    totalPaid: Number(m.loadedToWallet) + Number(m.returnedFromDeals),
    interestPaid: Number(m.withdrawn),
    principalReturned: Number(m.otherDebits),
  }));

  if (compact) {
    return (
      <div className="ai-wallet-compact">
        <div className="ai-board-metrics ai-board-metrics--inline">
          <div className="ai-metric ai-metric--soft">
            <span className="ai-metric-val">{loading ? "…" : money(balance)}</span>
            <span className="ai-metric-lbl">Balance now</span>
          </div>
          <div className="ai-metric ai-metric--soft">
            <span className="ai-metric-val">{loading ? "…" : money(flow.totalLoaded)}</span>
            <span className="ai-metric-lbl">Loaded</span>
          </div>
          <div className="ai-metric ai-metric--soft">
            <span className="ai-metric-val">{loading ? "…" : money(flow.totalParticipated)}</span>
            <span className="ai-metric-lbl">In deals</span>
          </div>
        </div>
        {flowBars.length > 0 && (
          <div className="ai-board-chart ai-board-chart--split mt-2">
            <HBarChart items={flowBars.slice(0, 5)} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="ai-wallet-breakdown">
      <header className="ai-wallet-breakdown-head">
        <div>
          <h5 className="mb-0">
            <i className="fas fa-wallet me-2 text-warning" />
            Lender wallet flow
          </h5>
          <p className="text-muted small mb-0">
            Money loaded into escrow · debited · deployed in deals · withdrawn · returned from closed deals
          </p>
        </div>
        {onOpenModule && (
          <button type="button" className="ai-board-link" onClick={() => onOpenModule("capital-liquidity")}>
            Full report
          </button>
        )}
      </header>

      <div className="ai-wallet-balance-hero">
        <span className="ai-wallet-balance-val">{loading ? "…" : money(balance)}</span>
        <span className="ai-wallet-balance-lbl">Current wallet balance (all lenders)</span>
        <span className="ai-wallet-formula" title={ADMIN_METRIC_HELP.walletBalance}>
          {loading ? "" : `Credit ${money(flow.totalCredited)} − Debit ${money(flow.totalDebited)} = Balance`}
        </span>
        {!loading && flow.lendersWithWallet > 0 && (
          <span className="ai-wallet-balance-meta">
            {number(flow.lendersWithWallet)} lenders · {number(flow.creditTransactionCount)} credits ·{" "}
            {number(flow.debitTransactionCount)} debits
          </span>
        )}
      </div>

      {(flow.creditDebitItems.length > 0 || flow.debitSplitItems.length > 0) && (
        <div className="ai-wallet-ledger mb-3">
          <p className="ai-board-chart-title" title={`${ADMIN_METRIC_HELP.walletCredit} ${ADMIN_METRIC_HELP.walletDebit}`}>
            lender_scrow_wallet — credit vs debit (APPROVED)
          </p>
          <div className="ai-wallet-ledger-grid">
            <div className="ai-wallet-ledger-col ai-wallet-ledger-col--credit">
              <span className="ai-wallet-ledger-head">CREDIT (money in)</span>
              <span className="ai-wallet-ledger-total">{loading ? "…" : money(flow.totalCredited)}</span>
              {flow.creditSplitItems.length > 0 && <HBarChart items={flow.creditSplitItems} />}
            </div>
            <div className="ai-wallet-ledger-col ai-wallet-ledger-col--debit">
              <span className="ai-wallet-ledger-head">DEBIT (money out)</span>
              <span className="ai-wallet-ledger-total">{loading ? "…" : money(flow.totalDebited)}</span>
              {flow.debitSplitItems.length > 0 && <HBarChart items={flow.debitSplitItems} />}
            </div>
          </div>
        </div>
      )}

      <div className="ai-stat-grid ai-stat-grid--wallet mb-3">
        <div className="ai-wallet-stat ai-wallet-stat--credit">
          <span className="ai-wallet-stat-val">{loading ? "…" : money(flow.totalCredited)}</span>
          <span className="ai-wallet-stat-lbl">Total credited</span>
          <span className="ai-wallet-stat-hint">All credit rows in lender_scrow_wallet</span>
        </div>
        <div className="ai-wallet-stat ai-wallet-stat--load">
          <span className="ai-wallet-stat-val">{loading ? "…" : money(flow.totalLoaded)}</span>
          <span className="ai-wallet-stat-lbl">Loaded to wallet</span>
          <span className="ai-wallet-stat-hint">Bank / CMS credits (deal_id = 0)</span>
        </div>
        <div className="ai-wallet-stat ai-wallet-stat--debit">
          <span className="ai-wallet-stat-val">{loading ? "…" : money(flow.totalDebited)}</span>
          <span className="ai-wallet-stat-lbl">Total debited</span>
          <span className="ai-wallet-stat-hint">All approved debits from wallet</span>
        </div>
        <div className="ai-wallet-stat ai-wallet-stat--deploy">
          <span className="ai-wallet-stat-val">{loading ? "…" : money(flow.totalParticipated)}</span>
          <span className="ai-wallet-stat-lbl">Participated in deals</span>
          <span className="ai-wallet-stat-hint">All-time lender participation</span>
        </div>
        <div className="ai-wallet-stat ai-wallet-stat--live">
          <span className="ai-wallet-stat-val">{loading ? "…" : money(flow.activeInDeals)}</span>
          <span className="ai-wallet-stat-lbl">In live deals now</span>
          <span className="ai-wallet-stat-hint">Running deals (NOTYETCLOSED)</span>
        </div>
        <div className="ai-wallet-stat ai-wallet-stat--withdraw">
          <span className="ai-wallet-stat-val">{loading ? "…" : money(flow.totalWithdrawn)}</span>
          <span className="ai-wallet-stat-lbl">Withdrawn</span>
          <span className="ai-wallet-stat-hint">Funds sent out via withdrawal</span>
        </div>
        <div className="ai-wallet-stat ai-wallet-stat--return">
          <span className="ai-wallet-stat-val">{loading ? "…" : money(flow.totalReturnedFromDeals)}</span>
          <span className="ai-wallet-stat-lbl">Returned from deals</span>
          <span className="ai-wallet-stat-hint">
            Principal {money(flow.principalReturned)} · Interest {money(flow.interestReturned)}
          </span>
        </div>
      </div>

      {flowBars.length > 0 && (
        <div className="ai-board-chart-block mb-3">
          <p className="ai-board-chart-title">Where the money went (all-time)</p>
          <HBarChart items={flowBars} />
        </div>
      )}

      {monthlyRows.length > 1 && (
        <div className="ai-board-chart-block">
          <p className="ai-board-chart-title">Monthly wallet movement (last 13 months)</p>
          <p className="text-muted small mb-2">
            Bars: loaded + returned (in) vs withdrawn + other debits (out)
          </p>
          <TrendChart rows={monthlyRows} />
        </div>
      )}
    </div>
  );
};

export default AdminWalletBreakdown;
