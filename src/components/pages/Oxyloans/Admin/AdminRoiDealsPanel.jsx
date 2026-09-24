import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { loadRoiDeals, loadDealRoiLenders, isLoggedIn } from "../../../HttpRequest/aiAdminApi";
import { money, number, LoadingBlock } from "./adminAIDashboardShared";
import { ExportBar, exportRowsToCsv } from "./adminReportKit";

const DEAL_EXPORT_COLS = [
  ["dealId", "Deal ID"],
  ["dealName", "Deal name"],
  ["borrowerName", "Borrower"],
  ["roi", "Lender ROI", (v) => fmtRoi(v)],
  ["active", "Status", (v) => (v ? "Running" : "Closed")],
  ["lendersCount", "Total users"],
  ["participatedAmount", "Total amount"],
  ["activeLendersCount", "Current users"],
  ["activeParticipationAmount", "Current amount"],
  ["closedLendersCount", "Closed users"],
  ["closedParticipationAmount", "Closed amount"],
  ["dealAmount", "Deal size"],
  ["duration", "Tenure"],
];

const LENDER_EXPORT_COLS = [
  ["lenderId", "Lender ID"],
  ["lenderName", "Lender name"],
  ["mobileNumber", "Mobile"],
  ["email", "Email"],
  ["totalParticipationAmount", "Amount"],
  ["lenderReturnsType", "Payout"],
  ["participatedOn", "Joined on"],
  ["active", "Status", (v) => (v ? "Running" : "Closed")],
];

const fmtRoi = (v) => {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}%`;
};

const parseRoiInput = (raw) => {
  if (raw == null) return null;
  const cleaned = String(raw).trim().replace(/%/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
};

const StatusBadge = ({ active }) =>
  active ? (
    <span className="ai-roi-badge ai-roi-badge--running">Running</span>
  ) : (
    <span className="ai-roi-badge ai-roi-badge--closed">Closed</span>
  );

const StatCard = ({ tone, label, users, amount }) => (
  <div className={`ai-roi-stat-card ai-roi-stat-card--${tone}`}>
    <span className="ai-roi-stat-card-label">{label}</span>
    <strong className="ai-roi-stat-card-users">{number(users)} users</strong>
    <span className="ai-roi-stat-card-amount">{money(amount)}</span>
  </div>
);

/** Deal detail modal — total / current / closed + lender names */
const DealDetailModal = ({ deal, onClose }) => {
  const [lenders, setLenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    loadDealRoiLenders(deal.dealId, "ALL")
      .then((data) => {
        if (!cancelled) setLenders(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Could not load lenders.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [deal.dealId]);

  return (
    <div className="ai-modal-backdrop" onClick={onClose} role="presentation">
      <div className="ai-modal-dialog ai-modal-dialog--roi-deal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="ai-modal-header ai-roi-modal-header">
          <div>
            <h5 className="ai-modal-title mb-0">
              Deal #{deal.dealId} — {deal.dealName || "Unnamed deal"}
            </h5>
            <p className="ai-modal-subtitle mb-0">
              {deal.borrowerName || "—"} · ROI {fmtRoi(deal.roi)} · <StatusBadge active={!!deal.active} />
            </p>
          </div>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="ai-modal-body ai-roi-modal-body">
          <div className="ai-roi-stat-grid mb-3">
            <StatCard tone="total" label="Total users & amount" users={deal.lendersCount} amount={deal.participatedAmount} />
            <StatCard tone="running" label="Current users & amount" users={deal.activeLendersCount} amount={deal.activeParticipationAmount} />
            <StatCard tone="closed" label="Closed users & amount" users={deal.closedLendersCount} amount={deal.closedParticipationAmount} />
          </div>

          <div className="ai-roi-deal-detail-grid">
            <div className="ai-roi-mini-table-wrap ai-roi-mini-table-wrap--info">
              <h6 className="ai-roi-mini-table-title">Deal details</h6>
              <table className="ai-roi-mini-table">
                <tbody>
                  {[
                    ["Deal ID", `#${deal.dealId}`],
                    ["Deal name", deal.dealName || "—"],
                    ["Borrower", deal.borrowerName || "—"],
                    ["Lender ROI", fmtRoi(deal.roi)],
                    ["Status", <StatusBadge key="s" active={!!deal.active} />],
                    ["Deal size", money(deal.dealAmount)],
                    ["Tenure", deal.duration || "—"],
                    ["Payout type", deal.payoutType || "—"],
                  ].map(([label, value]) => (
                    <tr key={String(label)}>
                      <th>{label}</th>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ai-roi-mini-table-wrap ai-roi-mini-table-wrap--summary">
              <h6 className="ai-roi-mini-table-title">Participation summary</h6>
              <table className="ai-roi-mini-table ai-roi-mini-table--grid">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Users</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="ai-roi-mini-row--total">
                    <th>Total</th>
                    <td>{number(deal.lendersCount)}</td>
                    <td>{money(deal.participatedAmount)}</td>
                  </tr>
                  <tr className="ai-roi-mini-row--running">
                    <th>Current</th>
                    <td>{number(deal.activeLendersCount)}</td>
                    <td>{money(deal.activeParticipationAmount)}</td>
                  </tr>
                  <tr className="ai-roi-mini-row--closed">
                    <th>Closed</th>
                    <td>{number(deal.closedLendersCount)}</td>
                    <td>{money(deal.closedParticipationAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="ai-roi-mini-table-wrap ai-roi-mini-table-wrap--lenders mt-3">
            <div className="ai-roi-mini-table-head">
              <h6 className="ai-roi-mini-table-title mb-0">Lenders in this deal</h6>
              {!loading && lenders.length > 0 && (
                <ExportBar
                  onExportCsv={() =>
                    exportRowsToCsv(lenders, LENDER_EXPORT_COLS, `deal-${deal.dealId}-lenders.csv`)
                  }
                  disabled={!lenders.length}
                />
              )}
            </div>
            {loading && <LoadingBlock label="Loading lenders…" />}
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            {!loading && !error && (
              <div className="ai-roi-mini-table-scroll">
                <table className="ai-roi-mini-table ai-roi-mini-table--lenders">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Lender name</th>
                      <th>ID</th>
                      <th>Mobile</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lenders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-3">
                          No lenders found for this deal.
                        </td>
                      </tr>
                    ) : (
                      lenders.map((r, i) => (
                        <tr key={r.lenderId || i} className={r.active ? "ai-roi-mini-row--running" : "ai-roi-mini-row--closed"}>
                          <td>{i + 1}</td>
                          <td>
                            <strong>{r.lenderName || "—"}</strong>
                          </td>
                          <td>{r.lenderId ?? "—"}</td>
                          <td>{r.mobileNumber || "—"}</td>
                          <td>
                            <strong>{money(r.totalParticipationAmount)}</strong>
                          </td>
                          <td>
                            <StatusBadge active={!!r.active} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminRoiDealsPanel = ({ fullPage = false }) => {
  const loggedIn = isLoggedIn();
  const [roiInput, setRoiInput] = useState("");
  const [searchedRoi, setSearchedRoi] = useState(null);
  const [deals, setDeals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [dealFilter, setDealFilter] = useState("ALL");

  const fetchDeals = useCallback(
    async (roiValue, status = "ALL") => {
      if (!loggedIn) {
        setError("Please sign in as admin.");
        return;
      }
      const parsed = parseRoiInput(roiValue);
      if (parsed == null) {
        setError("Enter a valid ROI (e.g. 2 or 1.55).");
        return;
      }
      setLoading(true);
      setError("");
      setSelectedDeal(null);
      try {
        const res = await loadRoiDeals({
          roi: parsed,
          dealStatus: status,
          includeDeals: true,
          includeLenders: false,
        });
        const list = Array.isArray(res?.deals) ? res.deals : [];
        setDeals(list);
        setSummary(res?.selectedSummary || null);
        setSearchedRoi(res?.selectedRoi ?? parsed);
        setSearched(true);
        if (!list.length) {
          setError(`No deals found for ${fmtRoi(parsed)} ROI.`);
        }
      } catch (err) {
        setDeals([]);
        setSummary(null);
        setError(err?.message || "Failed to load deals for this ROI.");
      } finally {
        setLoading(false);
      }
    },
    [loggedIn]
  );

  const onSearch = (e) => {
    e.preventDefault();
    setDealFilter("ALL");
    fetchDeals(roiInput, "ALL");
  };

  const onFilterChange = (status) => {
    setDealFilter(status);
    if (searchedRoi != null) fetchDeals(searchedRoi, status);
  };

  const filteredDeals = useMemo(() => deals, [deals]);

  if (!loggedIn) {
    return (
      <div className="alert alert-warning">
        Admin login required. <Link to="/admlogin">Sign in</Link>
      </div>
    );
  }

  return (
    <div className={`ai-roi-page ai-roi-page--simple ${fullPage ? "ai-roi-page--full" : ""}`}>
      <header className="ai-roi-page-header">
        <div>
          <p className="ai-roi-page-eyebrow">Admin</p>
          <h3 className="ai-roi-page-title">Lender ROI portfolio</h3>
          <p className="ai-roi-page-desc">Enter an ROI to load deals for that rate only. Click a Deal ID for users and amounts.</p>
        </div>
      </header>

      <form className="ai-roi-search-only" onSubmit={onSearch}>
        <div className="ai-roi-search-only-field">
          <label htmlFor="roiInput">Search ROI (%)</label>
          <input
            id="roiInput"
            type="text"
            inputMode="decimal"
            placeholder="Enter ROI e.g. 1.55"
            value={roiInput}
            onChange={(e) => setRoiInput(e.target.value)}
            autoFocus
          />
        </div>
        <button type="submit" className="btn btn-success" disabled={loading}>
          <i className={`fas fa-search me-1 ${loading ? "fa-spin" : ""}`} />
          {loading ? "Loading…" : "Search"}
        </button>
      </form>

      {error && (
        <div className="alert alert-warning py-2 small mb-3">
          <i className="fas fa-info-circle me-1" />
          {error}
        </div>
      )}

      {!searched && !loading && (
        <div className="ai-roi-empty-hint">
          <i className="fas fa-search" />
          <p>
            Enter ROI above and click <strong>Search</strong>. Only deals for that ROI will open.
          </p>
        </div>
      )}

      {loading && <LoadingBlock label="Loading deals…" />}

      {searched && !loading && (
        <>
          <div className="ai-roi-result-banner">
            <strong>{number(filteredDeals.length)}</strong> deal{filteredDeals.length === 1 ? "" : "s"} for{" "}
            <strong>{fmtRoi(searchedRoi)}</strong> ROI
            {summary && (
              <span className="ai-roi-result-banner-meta">
                {" "}
                · {number(summary.activeDealCount)} running · {number(summary.closedDealCount)} closed
              </span>
            )}
          </div>

          {summary && (
            <div className="ai-roi-stat-grid mb-3">
              <StatCard tone="total" label="Total users & amount" users={summary.totalLenders} amount={summary.totalParticipationAmount} />
              <StatCard tone="running" label="Current users & amount" users={summary.activeLenders} amount={summary.activeParticipationAmount} />
              <StatCard tone="closed" label="Closed users & amount" users={summary.closedLenders} amount={summary.closedParticipationAmount} />
            </div>
          )}

          <div className="ai-roi-deal-filters mb-2">
            {[
              { id: "ALL", label: "All deals" },
              { id: "ACTIVE", label: "Running" },
              { id: "CLOSED", label: "Closed" },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`ai-roi-deal-filter ${dealFilter === f.id ? "ai-roi-deal-filter--active" : ""}`}
                onClick={() => onFilterChange(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <section className="ai-roi-table-section">
            <div className="ai-roi-mini-table-wrap ai-roi-mini-table-wrap--deals">
              <div className="ai-roi-mini-table-head">
                <h6 className="ai-roi-mini-table-title mb-0">Deals at {fmtRoi(searchedRoi)} — click Deal ID</h6>
                {filteredDeals.length > 0 && (
                  <ExportBar
                    onExportCsv={() =>
                      exportRowsToCsv(
                        filteredDeals,
                        DEAL_EXPORT_COLS,
                        `roi-${searchedRoi}-deals.csv`
                      )
                    }
                    disabled={!filteredDeals.length}
                  />
                )}
              </div>
              <div className="ai-roi-mini-table-scroll">
                <table className="ai-roi-mini-table ai-roi-mini-table--deals">
                  <thead>
                    <tr>
                      <th>Deal ID</th>
                      <th>Deal name</th>
                      <th>Borrower</th>
                      <th>Status</th>
                      <th>Total users</th>
                      <th>Total amount</th>
                      <th>Current users</th>
                      <th>Current amount</th>
                      <th>Closed users</th>
                      <th>Closed amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeals.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center text-muted py-4">
                          No deals for this ROI.
                        </td>
                      </tr>
                    ) : (
                      filteredDeals.map((d) => (
                        <tr
                          key={d.dealId}
                          className={d.active ? "ai-roi-mini-row--running" : "ai-roi-mini-row--closed"}
                        >
                          <td>
                            <button type="button" className="ai-roi-deal-link" onClick={() => setSelectedDeal(d)}>
                              #{d.dealId}
                            </button>
                          </td>
                          <td>
                            <strong>{d.dealName || "—"}</strong>
                          </td>
                          <td>{d.borrowerName || "—"}</td>
                          <td>
                            <StatusBadge active={!!d.active} />
                          </td>
                          <td>{number(d.lendersCount)}</td>
                          <td>{money(d.participatedAmount)}</td>
                          <td className="ai-roi-cell--running">{number(d.activeLendersCount)}</td>
                          <td className="ai-roi-cell--running">{money(d.activeParticipationAmount)}</td>
                          <td className="ai-roi-cell--closed">{number(d.closedLendersCount)}</td>
                          <td className="ai-roi-cell--closed">{money(d.closedParticipationAmount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}

      {selectedDeal && <DealDetailModal deal={selectedDeal} onClose={() => setSelectedDeal(null)} />}
    </div>
  );
};

export default AdminRoiDealsPanel;
