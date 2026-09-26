import React, { useCallback, useMemo, useState, useEffect } from "react";
<<<<<<< HEAD
import { Link } from "react-router-dom";
import { loadRoiDeals, loadDealRoiLenders, isLoggedIn } from "../../../HttpRequest/aiAdminApi";
=======
// Deal intelligence lives in this UTF-8 file as AdminDealIntelligencePanel.
import { Link, useSearchParams } from "react-router-dom";
import { loadRoiDeals, loadDealRoiLenders, isLoggedIn, loadDealIntelligence } from "../../../HttpRequest/aiAdminApi";
>>>>>>> feature/ai-lender-chat
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
<<<<<<< HEAD
=======
  const [searchParams] = useSearchParams();
>>>>>>> feature/ai-lender-chat
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

<<<<<<< HEAD
=======
  useEffect(() => {
    const q = searchParams.get("roi");
    if (!q) return;
    setRoiInput(q);
    fetchDeals(q, "ALL");
  }, [searchParams, fetchDeals]);

>>>>>>> feature/ai-lender-chat
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
<<<<<<< HEAD
=======

const INTEL_PAGE_SIZE = 15;

const INTEL_TABS = [
  { id: "close", label: "Close now" },
  { id: "soon", label: "Close soon" },
  { id: "extended", label: "Extended" },
  { id: "relaunch", label: "Relaunch" },
  { id: "risk", label: "Risk / FD" },
  { id: "running", label: "All running" },
];

const isExtendedDeal = (deal) => Number(deal?.extendMonths) > 0 || Number(deal?.extendCount) > 0;

const originalTenureEnded = (deal) => {
  if (deal?.originalEndDate) {
    const end = new Date(`${deal.originalEndDate}T00:00:00`);
    return !Number.isNaN(end.getTime()) && end.getTime() <= Date.now();
  }
  const orig = Number(deal?.originalTenureMonths);
  const start = deal?.startDate || deal?.createdOn;
  if (orig > 0 && start) {
    const d = new Date(`${start}T00:00:00`);
    if (Number.isNaN(d.getTime())) return false;
    d.setMonth(d.getMonth() + orig);
    return d.getTime() <= Date.now();
  }
  return false;
};

/** Close now = current (extended) end date is over. Close soon = that end date within 45 days. Extended deals stay on the Extended tab. */
const closureActionOf = (deal) => {
  const days = deal?.daysToMaturity;
  if (days != null && Number.isFinite(Number(days))) {
    if (Number(days) <= 0) return "CLOSE";
    if (Number(days) <= 45) return "CLOSE_SOON";
    const a = String(deal?.action || "");
    if (a === "CLOSE" || a === "CLOSE_SOON") return "HOLD";
    return a || "HOLD";
  }
  return deal?.action || "HOLD";
};

const suggestionOf = (deal) => {
  if (isExtendedDeal(deal) && originalTenureEnded(deal) && closureActionOf(deal) !== "CLOSE") {
    return "EXTENDED_DUE";
  }
  if (isExtendedDeal(deal) && closureActionOf(deal) === "HOLD") {
    return "EXTENDED";
  }
  return closureActionOf(deal);
};

const isTestDeal = (deal) => String(deal?.dealType || "").toUpperCase() === "TEST";

const lenderRoiOf = (deal) => {
  const n = Number(deal?.lenderRoi);
  if (Number.isFinite(n) && n > 0) return n >= 6 ? n / 12 : n;
  const m = String(deal?.dealName || "").match(/(\d+(?:\.\d+)?)\s*ROI/i);
  return m ? Number(m[1]) : 0;
};

const payoutTypeOf = (deal) => {
  const fromApi = String(deal?.payoutType || "").toUpperCase();
  if (fromApi.includes("YEAR")) return "YEARLY";
  if (fromApi.includes("MONTH")) return "MONTHLY";
  const name = String(deal?.dealName || "").toUpperCase();
  if (name.includes("YEARLY") || name.includes("YLY")) return "YEARLY";
  if (name.includes("MONTHLY") || name.includes("MLY")) return "MONTHLY";
  return "MONTHLY";
};

const formatDealDate = (raw) => {
  if (!raw) return "—";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const daysLeftLabel = (days) => {
  if (days == null || !Number.isFinite(Number(days))) return "";
  const n = Number(days);
  if (n < 0) return `${Math.abs(n)} days overdue`;
  if (n === 0) return "ends today";
  return `${n} days left`;
};

const tenureBandOf = (deal) => {
  const fromApi = String(deal?.tenureBand || "").toUpperCase();
  if (fromApi === "SHORT" || fromApi === "MEDIUM" || fromApi === "LONG") return fromApi;
  let months = Number(deal?.originalTenureMonths || deal?.durationMonths) || 0;
  if (String(deal?.durationType || "").toUpperCase().includes("DAY") && months > 0) {
    months = Math.max(1, Math.round(months / 30));
  }
  if (months <= 3) return "SHORT";
  if (months <= 6) return "MEDIUM";
  return "LONG";
};

const tenureLabel = (band) => {
  if (band === "SHORT") return "Short-term";
  if (band === "MEDIUM") return "Medium-term";
  return "Long-term";
};

const intelActionClass = (action) => {
  const a = String(action || "");
  if (a === "CLOSE") return "ai-intel-pill ai-intel-pill--close";
  if (a === "EXTENDED_DUE") return "ai-intel-pill ai-intel-pill--close";
  if (a === "EXTENDED") return "ai-intel-pill ai-intel-pill--soon";
  if (a === "CLOSE_SOON") return "ai-intel-pill ai-intel-pill--soon";
  if (a.startsWith("RELAUNCH")) return "ai-intel-pill ai-intel-pill--relaunch";
  if (a === "REVIEW_FD") return "ai-intel-pill ai-intel-pill--risk";
  return "ai-intel-pill";
};

const intelRiskClass = (level) => {
  const l = String(level || "").toUpperCase();
  if (l === "HIGH") return "ai-intel-pill ai-intel-pill--close";
  if (l === "MEDIUM") return "ai-intel-pill ai-intel-pill--soon";
  if (l === "LOW") return "ai-intel-pill ai-intel-pill--hold";
  return "ai-intel-pill";
};

const IntelStat = ({ label, value, hint, tone }) => (
  <div className={`ai-intel-kpi ai-intel-kpi--${tone || "default"}`}>
    <span className="ai-intel-kpi-label">{label}</span>
    <strong className="ai-intel-kpi-value">{value}</strong>
    {hint ? <span className="ai-intel-kpi-hint">{hint}</span> : null}
  </div>
);

const DcKpi = ({ tone, icon, label, value, hint }) => (
  <div className={`ai-dc-kpi ai-dc-kpi--${tone}`}>
    <span className="ai-dc-kpi-icon" aria-hidden="true"><i className={icon} /></span>
    <small>{label}</small>
    <strong>{value}</strong>
    {hint ? <em>{hint}</em> : null}
  </div>
);

const actionLabel = (action) => {
  const a = String(action || "");
  if (a === "CLOSE") return "Close now — matured";
  if (a === "EXTENDED_DUE") return "Extended — original tenure over";
  if (a === "EXTENDED") return "Extended — still in extra tenure";
  if (a === "CLOSE_SOON") return "Close soon — maturing";
  if (a === "RELAUNCH_SIMILAR") return "Relaunch similar";
  if (a === "RELAUNCH_DIFFERENT_ROI") return "Relaunch other ROI";
  if (a === "REVIEW_FD") return "Review FD";
  if (a === "HOLD") return "Running";
  return a || "—";
};

const actionHint = (deal, action) => {
  if (action === "EXTENDED_DUE") {
    return `Original tenure ended ${formatDealDate(deal.originalEndDate)}. Auto-extended ${deal.extendMonths || 0} mo. Review close on the Extended tab — not Close now until the extended end date.`;
  }
  if (action === "EXTENDED") {
    return `Tenure extended ${deal.extendMonths || 0} mo. Original still running until ${formatDealDate(deal.originalEndDate)}.`;
  }
  if (action === "CLOSE") {
    const overdue = deal.daysToMaturity != null ? Math.abs(Number(deal.daysToMaturity)) : 0;
    return overdue > 0
      ? `EMI end date has passed (${overdue} days overdue). Start closure now.`
      : "Tenure is complete. Start closure now.";
  }
  if (action === "CLOSE_SOON") {
    return deal.daysToMaturity != null
      ? `Matures in ${deal.daysToMaturity} days. Prepare principal return — do not close today.`
      : "Last month of tenure. Prepare closure — do not close today.";
  }
  return deal.suggestedNextStep || deal.reason || "—";
};

export const AdminDealIntelligencePanel = () => {
  const [payload, setPayload] = useState(null);
  const [roiBuckets, setRoiBuckets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("close");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    if (!isLoggedIn()) {
      setError("Please log in as admin to load deal suggestions.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [intelRes, roiRes] = await Promise.all([
        loadDealIntelligence(),
        loadRoiDeals({ includeDeals: false }).catch(() => null),
      ]);
      const next = intelRes?.data || intelRes || {};
      setPayload(next);
      setRoiBuckets(Array.isArray(roiRes?.roiBuckets) ? roiRes.roiBuckets : []);
      const running = Array.isArray(next.runningDeals) ? next.runningDeals : [];
      const hasClose = running.some((d) => closureActionOf(d) === "CLOSE");
      const hasSoon = running.some((d) => closureActionOf(d) === "CLOSE_SOON");
      setTab(hasClose ? "close" : hasSoon ? "soon" : "running");
    } catch (err) {
      setPayload(null);
      setError(err?.message || "Could not load deal intelligence.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const fees = payload?.feeSummary || {};
  const launch = payload?.launchSuggestion || {};
  const running = useMemo(
    () => (Array.isArray(payload?.runningDeals) ? payload.runningDeals.filter((d) => !isTestDeal(d)) : []),
    [payload]
  );
  const closeNow = useMemo(() => running.filter((d) => closureActionOf(d) === "CLOSE"), [running]);
  const closeSoon = useMemo(() => running.filter((d) => closureActionOf(d) === "CLOSE_SOON"), [running]);
  const closeCandidates = useMemo(
    () => (Array.isArray(payload?.closeCandidates) && payload.closeCandidates.length
      ? payload.closeCandidates
      : [...closeNow, ...closeSoon]),
    [payload, closeNow, closeSoon]
  );
  const relaunchCandidates = useMemo(
    () => (Array.isArray(payload?.relaunchCandidates) && payload.relaunchCandidates.length
      ? payload.relaunchCandidates
      : running.filter((d) => String(d.action || "").startsWith("RELAUNCH"))),
    [payload, running]
  );
  const riskDeals = useMemo(
    () => (Array.isArray(payload?.riskDeals) && payload.riskDeals.length
      ? payload.riskDeals
      : running.filter((d) => d.riskLevel && d.riskLevel !== "OK")),
    [payload, running]
  );
  const extendedDeals = useMemo(
    () => (Array.isArray(payload?.extendedDeals) && payload.extendedDeals.length
      ? payload.extendedDeals.filter((d) => !isTestDeal(d))
      : running.filter(isExtendedDeal)),
    [payload, running]
  );
  const highestExtended = useMemo(() => {
    if (payload?.highestExtendedDealId && Number(payload.highestExtendedLenderRoi) > 0) {
      return {
        dealId: payload.highestExtendedDealId,
        dealName: payload.highestExtendedDealName,
        roi: Number(payload.highestExtendedLenderRoi),
      };
    }
    return extendedDeals.reduce((best, d) => {
      const roi = lenderRoiOf(d);
      if (!best || roi > best.roi) return { dealId: d.dealId, dealName: d.dealName, roi };
      return best;
    }, null);
  }, [payload, extendedDeals]);

  const tabRows = useMemo(() => {
    let rows = running;
    if (tab === "close") rows = closeNow;
    else if (tab === "soon") rows = closeSoon;
    else if (tab === "extended") rows = extendedDeals;
    else if (tab === "relaunch") rows = relaunchCandidates;
    else if (tab === "risk") rows = riskDeals;
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((d) =>
      [d.dealId, d.dealName, d.borrowerName, d.action, d.reason]
        .some((v) => String(v || "").toLowerCase().includes(q))
    );
  }, [tab, running, closeNow, closeSoon, extendedDeals, relaunchCandidates, riskDeals, query]);

  useEffect(() => {
    setPage(1);
  }, [tab, query]);

  const pageCount = Math.max(1, Math.ceil(tabRows.length / INTEL_PAGE_SIZE));
  const pagedRows = tabRows.slice((page - 1) * INTEL_PAGE_SIZE, page * INTEL_PAGE_SIZE);

  const tabCount = (id) => {
    if (id === "close") return closeNow.length;
    if (id === "soon") return closeSoon.length;
    if (id === "extended") return extendedDeals.length;
    if (id === "relaunch") return relaunchCandidates.length;
    if (id === "risk") return riskDeals.length;
    return running.length;
  };

  const roiLink = (roi) => {
    const n = Number(roi);
    if (!Number.isFinite(n) || n <= 0) return "/adminAIDashboard/roi-based-deals";
    return `/adminAIDashboard/roi-based-deals?roi=${encodeURIComponent(n)}`;
  };

  if (loading && !payload) {
    return <LoadingBlock label="Loading deal closure suggestions…" />;
  }

  const usefulSummary = String(payload?.aiSummary || "").trim();
  const showSummary = usefulSummary && !/temporarily unavailable|unavail/i.test(usefulSummary);
  const statusTotal = closeNow.length + closeSoon.length + extendedDeals.length + relaunchCandidates.length;
  const statusSlice = (n) => (statusTotal ? (n / statusTotal) * 360 : 0);
  const closeDeg = statusSlice(closeNow.length);
  const soonDeg = closeDeg + statusSlice(closeSoon.length);
  const extDeg = soonDeg + statusSlice(extendedDeals.length);

  return (
    <div className="ai-dc-page ai-dc-page--studio">
      <div className="ai-dc-hero">
        <div>
          <p className="ai-dc-hero-kicker">Deal ops</p>
          <h2>Deal Closure &amp; AI Suggestions</h2>
          <p>Welcome back. Live YearWise counts, TEST deals excluded. Close now and Extended are separate lists.</p>
        </div>
        <button type="button" className="ai-dc-hero-btn" onClick={load} disabled={loading}>
          <i className={`fas fa-sync-alt ${loading ? "fa-spin" : ""}`} />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error ? <div className="alert alert-danger py-2">{error}</div> : null}

      <div className="ai-dc-kpi-row">
        <DcKpi tone="closed" icon="fas fa-lock" label="Closed deals" value={number(fees.closedDeals)} />
        <DcKpi tone="active" icon="fas fa-play" label="Active deals" value={number(fees.activeRunningDeals)} />
        <DcKpi tone="close" icon="fas fa-exclamation" label="Close now" value={number(closeNow.length)} hint="Current end date already over" />
        <DcKpi tone="soon" icon="fas fa-clock" label="Close soon" value={number(closeSoon.length)} hint="Matures in ≤45 days" />
        <DcKpi tone="extended" icon="fas fa-expand-arrows-alt" label="Extended deals" value={number(extendedDeals.length)} hint={`${number(extendedDeals.filter(originalTenureEnded).length)} original tenure over`} />
        <DcKpi tone="relaunch" icon="fas fa-redo" label="Relaunch ideas" value={number(relaunchCandidates.length)} />
      </div>

      <div className="ai-dc-overview">
        <div className="ai-dc-panel">
          <h3>Status overview</h3>
          <div className="ai-dc-donut-wrap">
            <div
              className="ai-dc-donut"
              style={{
                background: `conic-gradient(#6366f1 0deg ${closeDeg}deg, #f59e0b ${closeDeg}deg ${soonDeg}deg, #f43f5e ${soonDeg}deg ${extDeg}deg, #22c55e ${extDeg}deg 360deg)`,
              }}
            >
              <span>
                <strong>{number(running.length)}</strong>
                <small>running</small>
              </span>
            </div>
            <ul className="ai-dc-legend-list">
              <li><i style={{ background: "#6366f1" }} /> Close now <b>{number(closeNow.length)}</b></li>
              <li><i style={{ background: "#f59e0b" }} /> Close soon <b>{number(closeSoon.length)}</b></li>
              <li><i style={{ background: "#f43f5e" }} /> Extended <b>{number(extendedDeals.length)}</b></li>
              <li><i style={{ background: "#22c55e" }} /> Relaunch <b>{number(relaunchCandidates.length)}</b></li>
            </ul>
          </div>
        </div>
        <div className="ai-dc-panel ai-dc-panel--launch">
          <h3>Suggested next launch</h3>
          <strong>{launch.suggestedDealSize > 0 ? money(launch.suggestedDealSize) : "—"}</strong>
          <p>
            Lender {fmtRoi(launch.suggestedLenderRoiMin)}–{fmtRoi(launch.suggestedLenderRoiMax)}
            {" · "}Borrower ~{fmtRoi(launch.suggestedBorrowerRoi)}
          </p>
          <div className="ai-dc-insight-chips">
            <span>Active lenders {number(launch.activeLendersCount)} · wallet {money(launch.activeLendersWalletAmount)}</span>
            <span>Highest extended ROI {highestExtended ? `${fmtRoi(highestExtended.roi)} #${highestExtended.dealId}` : "—"}</span>
            <span>Matures in 30 days {money(launch.maturingPrincipalNext30Days)}</span>
          </div>
          <Link className="ai-dc-hero-btn ai-dc-hero-btn--ghost" to={roiLink(launch.suggestedLenderRoiMin)}>
            Open ROI portfolio
          </Link>
        </div>
        <div className="ai-dc-panel">
          <h3>Returns snapshot</h3>
          <ul className="ai-dc-stat-stack">
            <li><span>Avg lender ROI</span><b>{fmtRoi(fees.avgLenderRoi)} / mo</b></li>
            <li><span>Yearly equivalent</span><b>{fmtRoi(Number(fees.avgLenderRoi) * 12)}</b></li>
            <li><span>Avg spread</span><b>{fmtRoi(fees.avgSpreadPercent)}</b></li>
            <li><span>Highest extended</span><b>{highestExtended ? fmtRoi(highestExtended.roi) : "—"}</b></li>
          </ul>
        </div>
      </div>

      <div className="ai-dc-kpi-row ai-dc-kpi-row--money">
        <DcKpi tone="fee" icon="fas fa-receipt" label="Borrower fees" value={money(fees.borrowerFeesCollected)} />
        <DcKpi tone="fd" icon="fas fa-university" label="Borrower FD book" value={money(fees.totalFdAmount)} />
        <DcKpi tone="part" icon="fas fa-users" label="Active participation" value={money(fees.activeParticipationAmount)} />
        <DcKpi tone="int" icon="fas fa-coins" label="Interest paid" value={money(fees.lenderInterestPaid)} />
      </div>

      {showSummary ? (
        <div className="ai-dc-summary">{usefulSummary}</div>
      ) : null}

      <div className="ai-dc-legend">
        <p><strong>Monthly payout</strong> means lenders receive interest every month. <strong>Yearly payout</strong> means interest is paid once a year. Short / medium / long is the tenure, not the payout.</p>
        <p><strong>Close now</strong> = the <em>current</em> end date (after any extension) is already over. <strong>Close soon</strong> = that current end date is within 45 days.</p>
        <p><strong>Extended</strong> is a different list: deals in <code>tenure_extends_history</code>. If only the original tenure is over and extra months were added, it stays here — it is not Close now.</p>
      </div>

      <div className="ai-dc-list-card">
        <div className="ai-dc-list-head">
          <div className="ai-dc-tabs" role="tablist">
            {INTEL_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                className={tab === t.id ? "is-active" : ""}
                onClick={() => setTab(t.id)}
              >
                {t.label}
                <em>{tabCount(t.id)}</em>
              </button>
            ))}
          </div>
          <input
            className="ai-dc-search"
            type="search"
            placeholder="Search deal ID, name or borrower"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="ai-dc-table-wrap">
          <table className="ai-dc-table">
            <thead>
              <tr>
                <th>Deal</th>
                <th>Borrower</th>
                <th>Participation</th>
                <th>Lender ROI</th>
                <th>Deal type</th>
                <th>Suggestion</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="ai-dc-empty">{loading ? "Loading deals…" : "No deals in this view."}</td>
                </tr>
              ) : (
                pagedRows.map((deal) => {
                  const expanded = openId === deal.dealId;
                  const lenderRoi = lenderRoiOf(deal);
                  const payout = payoutTypeOf(deal);
                  const band = tenureBandOf(deal);
                  const action = suggestionOf(deal);
                  return (
                    <React.Fragment key={deal.dealId}>
                      <tr>
                        <td>
                          <button type="button" className="ai-dc-deal-id" onClick={() => setOpenId(expanded ? null : deal.dealId)}>
                            #{deal.dealId}
                          </button>
                          <div className="ai-dc-sub">{deal.dealName || "—"}</div>
                          <Link className="ai-dc-roi-link" to={roiLink(lenderRoi)}>Open ROI list</Link>
                        </td>
                        <td>{deal.borrowerName || "—"}</td>
                        <td>
                          <strong>{money(deal.participatedAmount)}</strong>
                          <div className="ai-dc-sub">
                            of {money(deal.dealAmount)} · {deal.fillPercent != null ? `${deal.fillPercent}% filled` : "—"}
                          </div>
                        </td>
                        <td>
                          <div className="ai-dc-lender-roi">{fmtRoi(lenderRoi)} <span>/ month</span></div>
                          <div className="ai-dc-sub">≈ {fmtRoi(lenderRoi * 12)} / year</div>
                          <div className="ai-dc-sub">Borrower {fmtRoi(deal.borrowerRoi)} · spread {fmtRoi((Number(deal.borrowerRoi) || 0) - lenderRoi)}</div>
                        </td>
                        <td>
                          <span className={`ai-dc-type ${payout === "YEARLY" ? "is-yearly" : "is-monthly"}`}>
                            {payout === "YEARLY" ? "Yearly payout" : "Monthly payout"}
                          </span>
                          <div className="ai-dc-term">{tenureLabel(band)} tenure</div>
                          <div className="ai-dc-sub">
                            Created {formatDealDate(deal.createdOn || deal.startDate)}
                          </div>
                          <div className="ai-dc-sub">
                            Original {deal.originalTenureMonths || deal.durationMonths || "—"} mo
                            {isExtendedDeal(deal)
                              ? ` · extended ${deal.extendMonths || 0} mo${deal.extendCount ? ` (${deal.extendCount} time${deal.extendCount > 1 ? "s" : ""})` : ""}${originalTenureEnded(deal) ? " · original tenure over — close" : ""}`
                              : " · not extended"}
                          </div>
                          <div className="ai-dc-sub">
                            Current {deal.durationMonths || "—"} mo
                            {deal.daysToMaturity != null ? ` · ${daysLeftLabel(deal.daysToMaturity)}` : ""}
                            {deal.plannedEndDate ? ` · ends ${formatDealDate(deal.plannedEndDate)}` : ""}
                          </div>
                        </td>
                        <td>
                          <span className={intelActionClass(action)}>{actionLabel(action)}</span>
                          {deal.riskLevel && deal.riskLevel !== "OK" ? (
                            <span className={`${intelRiskClass(deal.riskLevel)} ms-1`}>{deal.riskLevel}</span>
                          ) : null}
                          <div className="ai-dc-sub">{actionHint(deal, action)}</div>
                        </td>
                      </tr>
                      {expanded ? (
                        <tr className="ai-dc-detail">
                          <td colSpan={6}>
                            Created {formatDealDate(deal.createdOn)}
                            {" · "}Started {formatDealDate(deal.startDate)}
                            {" · "}Planned end {formatDealDate(deal.plannedEndDate)}
                            {" · "}Fees {money(deal.borrowerFeesCollected)}
                            {" · "}FD {money(deal.fdAmount)}
                            {" · "}FD interest {money(deal.fdInterestEarned)}
                            {" · "}Interest paid {money(deal.interestPaidToLenders)}
                            {" · "}Profit est. {money(deal.platformProfitEstimate)}
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {tabRows.length > INTEL_PAGE_SIZE ? (
          <div className="ai-dc-pager">
            <span>{number(tabRows.length)} deals · page {page} of {pageCount}</span>
            <div>
              <button type="button" className="btn btn-sm btn-outline-secondary me-2" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <button type="button" className="btn btn-sm btn-outline-secondary" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
>>>>>>> feature/ai-lender-chat
