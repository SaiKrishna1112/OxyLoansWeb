import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import { money, number } from "./adminAIDashboardShared";
import { buildWalletFlowSnapshot } from "./adminBusinessMetrics";

const MiniStat = ({ label, value, tone }) => (
  <div className={`ai-wow-mini-stat ai-wow-mini-stat--${tone}`}>
    <span className="ai-wow-mini-stat-val">{value}</span>
    <span className="ai-wow-mini-stat-lbl">{label}</span>
  </div>
);

const AdminWalletHubPanel = ({ walletSummary, kpis, loading, compact = false }) => {
  const flow = useMemo(() => buildWalletFlowSnapshot(walletSummary, kpis), [walletSummary, kpis]);
  const dash = loading ? "—" : null;

  const donutSeries = useMemo(
    () => [flow.totalParticipated, flow.totalWithdrawn, Math.max(0, flow.currentBalance)].filter((v) => v > 0),
    [flow]
  );

  const donutOpts = {
    chart: { type: "donut", sparkline: { enabled: compact } },
    labels: ["In deals", "Withdrawn", "Free"],
    colors: ["#6366f1", "#f97316", "#059669"],
    legend: { show: !compact, position: "bottom", fontSize: "10px" },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: compact ? "72%" : "68%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Balance",
              formatter: () => money(flow.currentBalance),
            },
          },
        },
      },
    },
    tooltip: { y: { formatter: (v) => money(v) } },
  };

  const flowBars = [
    { label: "Loaded", value: flow.totalLoaded, color: "#2563eb" },
    { label: "In deals", value: flow.totalParticipated, color: "#6366f1" },
    { label: "Returned", value: flow.totalReturnedFromDeals, color: "#059669" },
    { label: "Withdrawn", value: flow.totalWithdrawn, color: "#f97316" },
  ].filter((i) => Number(i.value) > 0);

  const maxBar = Math.max(...flowBars.map((x) => x.value), 1);

  return (
    <section className={`ai-wow-panel ai-wow-panel--wallet${compact ? " ai-wow-panel--compact" : ""}`}>
      <header className="ai-wow-panel-head">
        <div className="ai-wow-panel-head-main">
          <h6 className="mb-0">
            <i className="fas fa-wallet me-1" />
            Lender wallet
          </h6>
          {!compact && (
            <p className="mb-0 small text-muted">Escrow balance, load, deploy, withdraw & returns</p>
          )}
        </div>
        {compact && (
          <div className="ai-wow-head-balance">
            <strong>{dash || money(flow.currentBalance)}</strong>
            <span>total balance</span>
          </div>
        )}
        <Link to="/adminAIDashboard/capital-liquidity" className="btn btn-sm btn-light py-0 px-2">
          {compact ? "More" : "Full wallet report"}
        </Link>
      </header>

      {!compact && (
        <div className="ai-wow-panel-hero ai-wow-panel-hero--wallet">
          <span className="ai-wow-hero-val">{dash || money(flow.currentBalance)}</span>
          <span className="ai-wow-hero-lbl">Total lender wallet balance</span>
          {!loading && (
            <span className="ai-wow-hero-meta">
              {number(flow.lendersWithWallet)} lenders · Credit {money(flow.totalCredited)} · Debit {money(flow.totalDebited)}
            </span>
          )}
        </div>
      )}

      <div className={`ai-wow-panel-body${compact ? " ai-wow-panel-body--compact" : ""}`}>
        {compact ? (
          <>
            <div className="ai-wow-mini-stat-grid">
              <MiniStat tone="blue" label="Loaded" value={dash || money(flow.totalLoaded)} />
              <MiniStat tone="indigo" label="In deals" value={dash || money(flow.totalParticipated)} />
              <MiniStat tone="green" label="Returned" value={dash || money(flow.totalReturnedFromDeals)} />
              <MiniStat tone="orange" label="Withdrawn" value={dash || money(flow.totalWithdrawn)} />
            </div>
            {flowBars.length > 0 && !loading && (
              <div className="ai-wow-mini-bars ai-wow-mini-bars--tight">
                {flowBars.slice(0, 3).map((b) => (
                  <div key={b.label} className="ai-wow-mini-bar-row">
                    <span className="ai-wow-mini-bar-lbl">{b.label}</span>
                    <div className="ai-wow-mini-bar-track">
                      <div
                        className="ai-wow-mini-bar-fill"
                        style={{ width: `${Math.max(8, (b.value / maxBar) * 100)}%`, background: b.color }}
                      />
                    </div>
                    <span className="ai-wow-mini-bar-val">{money(b.value)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="row g-2">
            <div className="col-lg-5">
              {donutSeries.length > 0 && !loading ? (
                <ReactApexChart options={donutOpts} series={donutSeries} type="donut" height={220} />
              ) : (
                <p className="text-muted small mb-0 py-2">Chart loads with wallet data.</p>
              )}
            </div>
            <div className="col-lg-7">
              <div className="ai-wow-mini-stat-grid">
                <MiniStat tone="blue" label="Loaded" value={dash || money(flow.totalLoaded)} />
                <MiniStat tone="indigo" label="In deals" value={dash || money(flow.totalParticipated)} />
                <MiniStat tone="green" label="Returned" value={dash || money(flow.totalReturnedFromDeals)} />
                <MiniStat tone="orange" label="Withdrawn" value={dash || money(flow.totalWithdrawn)} />
              </div>
              {flowBars.length > 0 && !loading && (
                <div className="ai-wow-mini-bars ai-wow-mini-bars--tight mt-2">
                  {flowBars.map((b) => (
                    <div key={b.label} className="ai-wow-mini-bar-row">
                      <span className="ai-wow-mini-bar-lbl">{b.label}</span>
                      <div className="ai-wow-mini-bar-track">
                        <div
                          className="ai-wow-mini-bar-fill"
                          style={{ width: `${Math.max(8, (b.value / maxBar) * 100)}%`, background: b.color }}
                        />
                      </div>
                      <span className="ai-wow-mini-bar-val">{money(b.value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminWalletHubPanel;
