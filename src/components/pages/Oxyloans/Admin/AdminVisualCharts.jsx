import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { money, number } from "./adminAIDashboardShared";

const chartFont = "Inter, system-ui, sans-serif";

const baseChartOpts = {
  chart: { fontFamily: chartFont, toolbar: { show: false }, animations: { speed: 400 } },
  dataLabels: { enabled: false },
  legend: { position: "bottom", fontSize: "11px", fontWeight: 500 },
};

/** Capital movement: Lenders → Escrow → Deals → Borrowers → Revenue */
export const CapitalFlowDiagram = ({ steps = [], loading, showTitle = false }) => {
  if (!steps.length && !loading) return null;
  return (
    <div className="ai-flow-diagram ai-flow-diagram--inline" aria-label="Capital flow">
      {showTitle && <p className="ai-flow-diagram-title">Capital flow</p>}
      <div className="ai-flow-track">
        {(loading
          ? [
              { label: "…", value: "—", icon: "fas fa-circle" },
              { label: "…", value: "—", icon: "fas fa-circle" },
              { label: "…", value: "—", icon: "fas fa-circle" },
              { label: "…", value: "—", icon: "fas fa-circle" },
            ]
          : steps
        ).map((step, i, arr) => (
            <React.Fragment key={step.label}>
              <div className="ai-flow-node">
                <i className={`${step.icon || "fas fa-circle"} ai-flow-node-icon`} />
                <span className="ai-flow-node-val">{step.value}</span>
                <span className="ai-flow-node-lbl">{step.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className="ai-flow-arrow" aria-hidden="true">
                  <i className="fas fa-chevron-right" />
                </div>
              )}
            </React.Fragment>
          )
        )}
      </div>
    </div>
  );
};

/** Deal lifecycle funnel — Open → Active → Closed */
export const DealPipelineChart = ({ open = 0, active = 0, closed = 0, loading }) => {
  const series = [{ name: "Deals", data: [Number(open) || 0, Number(active) || 0, Number(closed) || 0] }];
  const options = useMemo(
    () => ({
      ...baseChartOpts,
      chart: { ...baseChartOpts.chart, type: "bar" },
      plotOptions: {
        bar: { borderRadius: 6, columnWidth: "55%", distributed: true },
      },
      colors: ["#008f64", "#0d9488", "#64748b"],
      xaxis: {
        categories: ["Open for participation", "Active loans", "Closed"],
        labels: { style: { fontSize: "11px", colors: "#64748b" } },
      },
      yaxis: {
        labels: { formatter: (v) => number(v), style: { fontSize: "11px" } },
      },
      tooltip: { y: { formatter: (v) => `${number(v)} deals` } },
      grid: { borderColor: "#f1f5f9", strokeDashArray: 4 },
    }),
    [open, active, closed]
  );

  if (!open && !active && !closed && !loading) return null;

  return (
    <div className="ai-chart-card">
      <p className="ai-chart-card-title">Deal pipeline</p>
      {loading ? (
        <div className="ai-chart-skeleton" />
      ) : (
        <ReactApexChart options={options} series={series} type="bar" height={220} />
      )}
    </div>
  );
};

/** Wallet: idle balance vs deployed in live deals */
export const WalletCompositionChart = ({ idle = 0, deployed = 0, loading }) => {
  const idleN = Number(idle) || 0;
  const depN = Number(deployed) || 0;
  if (idleN <= 0 && depN <= 0 && !loading) return null;

  const options = useMemo(
    () => ({
      ...baseChartOpts,
      chart: { ...baseChartOpts.chart, type: "donut" },
      labels: ["Escrow balance", "Deployed in deals"],
      colors: ["#008f64", "#1a2e44"],
      plotOptions: {
        pie: {
          donut: {
            size: "62%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Total",
                formatter: () => money(idleN + depN),
              },
            },
          },
        },
      },
      tooltip: { y: { formatter: (v) => money(v) } },
    }),
    [idleN, depN]
  );

  return (
    <div className="ai-chart-card">
      <p className="ai-chart-card-title">Lender wallet split</p>
      {loading ? (
        <div className="ai-chart-skeleton ai-chart-skeleton--round" />
      ) : (
        <ReactApexChart options={options} series={[idleN, depN]} type="donut" height={220} />
      )}
    </div>
  );
};

/** FD collateral — active vs closed */
export const FdCollateralChart = ({ activeAmount = 0, closedAmount = 0, loading }) => {
  const a = Number(activeAmount) || 0;
  const c = Number(closedAmount) || 0;
  if (a <= 0 && c <= 0 && !loading) return null;

  const options = useMemo(
    () => ({
      ...baseChartOpts,
      chart: { ...baseChartOpts.chart, type: "donut" },
      labels: ["Active FD", "Closed FD"],
      colors: ["#10b981", "#64748b"],
      plotOptions: { pie: { donut: { size: "62%" } } },
      tooltip: { y: { formatter: (v) => money(v) } },
    }),
    [a, c]
  );

  return (
    <div className="ai-chart-card">
      <p className="ai-chart-card-title">FD collateral mix</p>
      {loading ? (
        <div className="ai-chart-skeleton ai-chart-skeleton--round" />
      ) : (
        <ReactApexChart options={options} series={[a, c]} type="donut" height={220} />
      )}
    </div>
  );
};

/** Monthly lender payouts — area trend */
export const MonthlyPayoutChart = ({ rows = [], loading, title = "Monthly payouts" }) => {
  const labels = rows.map((r) => r.monthLabel || r.month);
  const interest = rows.map((r) => Number(r.interestPaid ?? r.interest) || 0);
  const principal = rows.map((r) => Number(r.principalReturned ?? r.principal) || 0);
  const total = rows.map((r) => Number(r.totalPaid) || 0);

  const hasData = total.some((v) => v > 0) || interest.some((v) => v > 0);
  if (!hasData && !loading) return null;

  const options = useMemo(
    () => ({
      ...baseChartOpts,
      chart: { ...baseChartOpts.chart, type: "area", stacked: false },
      stroke: { curve: "smooth", width: 2 },
      fill: {
        type: "gradient",
        gradient: { opacityFrom: 0.35, opacityTo: 0.05 },
      },
      colors: ["#008f64", "#0d9488", "#64748b"],
      xaxis: {
        categories: labels,
        labels: { rotate: -35, style: { fontSize: "10px", colors: "#64748b" } },
      },
      yaxis: {
        labels: {
          formatter: (v) => `₹${(v / 100000).toFixed(1)}L`,
          style: { fontSize: "10px" },
        },
      },
      tooltip: { y: { formatter: (v) => money(v) } },
      grid: { borderColor: "#f1f5f9" },
    }),
    [labels.join("|")]
  );

  const series = [
    { name: "Interest", data: interest.length ? interest : total },
    ...(principal.some((v) => v > 0) ? [{ name: "Principal", data: principal }] : []),
  ];

  return (
    <div className="ai-chart-card ai-chart-card--wide">
      <p className="ai-chart-card-title">{title}</p>
      {loading ? (
        <div className="ai-chart-skeleton ai-chart-skeleton--tall" />
      ) : (
        <ReactApexChart options={options} series={series} type="area" height={260} />
      )}
    </div>
  );
};

/** Revenue composition — fees, spread, interest out */
export const RevenueFlowChart = ({ items = [], loading }) => {
  const filtered = items.filter((i) => Number(i.value) > 0);
  if (!filtered.length && !loading) return null;

  const options = useMemo(
    () => ({
      ...baseChartOpts,
      chart: { ...baseChartOpts.chart, type: "bar" },
      plotOptions: { bar: { horizontal: true, borderRadius: 4, barHeight: "55%" } },
      colors: filtered.map((i) => i.color || "#2563eb"),
      xaxis: {
        categories: filtered.map((i) => i.label),
        labels: { formatter: (v) => money(v), style: { fontSize: "10px" } },
      },
      tooltip: { y: { formatter: (v) => money(v) } },
      grid: { borderColor: "#f1f5f9" },
    }),
    [filtered.map((i) => i.label).join("|")]
  );

  return (
    <div className="ai-chart-card">
      <p className="ai-chart-card-title">Platform economics</p>
      {loading ? (
        <div className="ai-chart-skeleton" />
      ) : (
        <ReactApexChart
          options={options}
          series={[{ name: "Amount", data: filtered.map((i) => Number(i.value) || 0) }]}
          type="bar"
          height={Math.max(180, filtered.length * 52)}
        />
      )}
    </div>
  );
};
