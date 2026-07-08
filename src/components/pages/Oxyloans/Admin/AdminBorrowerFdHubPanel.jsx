import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import { money, number } from "./adminAIDashboardShared";
import { buildBorrowerLifecycleSnapshot, normalizeFdStatistics } from "./adminBusinessMetrics";

const MiniStat = ({ label, value, sub, tone }) => (
  <div className={`ai-wow-mini-stat ai-wow-mini-stat--${tone}`}>
    <span className="ai-wow-mini-stat-val">{value}</span>
    {sub && <span className="ai-wow-mini-stat-sub">{sub}</span>}
    <span className="ai-wow-mini-stat-lbl">{label}</span>
  </div>
);

const AdminBorrowerFdHubPanel = ({ borrowerSummary, loading, compact = false }) => {
  const fd = borrowerSummary?.fdStatistics || normalizeFdStatistics(borrowerSummary);
  const life = buildBorrowerLifecycleSnapshot(borrowerSummary || {});
  const dash = loading ? "—" : null;
  const totalFd = fd?.valueOfFd ?? life.totalFdAmount;

  const pieSeries = useMemo(
    () => [fd?.noOfActiveFdsAmount || 0, fd?.closedFdAmount || 0].filter((v) => v > 0),
    [fd]
  );

  const pieOpts = {
    chart: { type: "pie" },
    labels: ["Active FD", "Closed"],
    colors: ["#059669", "#94a3b8"],
    legend: { show: !compact, position: "bottom", fontSize: "10px" },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (v) => money(v) } },
  };

  const bankSplit = [
    { label: "HDFC", value: fd?.amountReceivedToHdfc, color: "#004c8f" },
    { label: "ICICI", value: fd?.amountReceivedToIcici, color: "#f58220" },
  ].filter((i) => Number(i.value) > 0);

  return (
    <section className={`ai-wow-panel ai-wow-panel--fd${compact ? " ai-wow-panel--compact" : ""}`}>
      <header className="ai-wow-panel-head">
        <div className="ai-wow-panel-head-main">
          <h6 className="mb-0">
            <i className="fas fa-shield-alt me-1" />
            Borrower FD collateral
          </h6>
          {!compact && (
            <p className="mb-0 small text-muted">Fixed deposits, fees, running vs closed borrowers</p>
          )}
        </div>
        {compact && (
          <div className="ai-wow-head-balance ai-wow-head-balance--fd">
            <strong>{dash || money(totalFd)}</strong>
            <span>total FD</span>
          </div>
        )}
        <Link to="/adminAIDashboard/borrower-collateral" className="btn btn-sm btn-light py-0 px-2">
          {compact ? "More" : "Full FD report"}
        </Link>
      </header>

      {!compact && (
        <div className="ai-wow-panel-hero ai-wow-panel-hero--fd">
          <span className="ai-wow-hero-val">{dash || money(totalFd)}</span>
          <span className="ai-wow-hero-lbl">Total FD collateral value</span>
          {!loading && (
            <span className="ai-wow-hero-meta">
              {number(fd?.noOfFdsDone ?? life.runningCount + life.closedCount)} loans with FD · Interest {money(life.fdInterestEarned)}
            </span>
          )}
        </div>
      )}

      <div className={`ai-wow-panel-body${compact ? " ai-wow-panel-body--compact" : ""}`}>
        {compact ? (
          <>
            <div className="ai-wow-mini-stat-grid">
              <MiniStat
                tone="green"
                label="Active FDs"
                value={dash || number(fd?.noOfActiveFds)}
                sub={!loading ? money(fd?.noOfActiveFdsAmount) : null}
              />
              <MiniStat
                tone="muted"
                label="Closed FDs"
                value={dash || number(fd?.noOfClosedFds)}
                sub={!loading ? money(fd?.closedFdAmount) : null}
              />
              <MiniStat tone="blue" label="Fees" value={dash || money(life.totalBorrowerFees)} />
              <MiniStat tone="teal" label="Disbursed" value={dash || money(life.disbursed)} />
            </div>
            {!loading && (
              <div className="ai-wow-fd-inline-meta">
                <span className="ai-wow-fd-tag ai-wow-fd-tag--run">
                  Running <strong>{number(life.runningCount)}</strong> · {money(life.runningFdAmount)}
                </span>
                <span className="ai-wow-fd-tag ai-wow-fd-tag--closed">
                  Closed <strong>{number(life.closedCount)}</strong> · {money(life.closedFdAmount)}
                </span>
                {bankSplit.map((b) => (
                  <span key={b.label} className="ai-wow-fd-tag" style={{ borderColor: b.color, color: b.color }}>
                    {b.label} {money(b.value)}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="row g-2">
            <div className="col-lg-5">
              {pieSeries.length > 0 && !loading ? (
                <ReactApexChart options={pieOpts} series={pieSeries} type="pie" height={220} />
              ) : (
                <p className="text-muted small mb-0 py-2">Chart loads with FD data.</p>
              )}
            </div>
            <div className="col-lg-7">
              <div className="ai-wow-mini-stat-grid">
                <MiniStat
                  tone="green"
                  label="Active FDs"
                  value={dash || number(fd?.noOfActiveFds)}
                  sub={!loading ? money(fd?.noOfActiveFdsAmount) : null}
                />
                <MiniStat
                  tone="muted"
                  label="Closed FDs"
                  value={dash || number(fd?.noOfClosedFds)}
                  sub={!loading ? money(fd?.closedFdAmount) : null}
                />
                <MiniStat tone="blue" label="Borrower fees" value={dash || money(life.totalBorrowerFees)} />
                <MiniStat tone="teal" label="Disbursed" value={dash || money(life.disbursed)} />
              </div>
              {bankSplit.length > 0 && (
                <div className="ai-wow-bank-split mt-2">
                  {bankSplit.map((b) => (
                    <div key={b.label} className="ai-wow-bank-chip" style={{ borderColor: b.color }}>
                      <strong style={{ color: b.color }}>{b.label}</strong> {money(b.value)}
                    </div>
                  ))}
                </div>
              )}
              <div className="ai-wow-fd-running-closed mt-2">
                <div className="ai-wow-fd-pill ai-wow-fd-pill--run">
                  <span>Running</span>
                  <strong>{number(life.runningCount)}</strong>
                  <em>{money(life.runningFdAmount)}</em>
                </div>
                <div className="ai-wow-fd-pill ai-wow-fd-pill--closed">
                  <span>Closed</span>
                  <strong>{number(life.closedCount)}</strong>
                  <em>{money(life.closedFdAmount)}</em>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminBorrowerFdHubPanel;
