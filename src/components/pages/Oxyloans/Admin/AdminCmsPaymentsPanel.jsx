import React, { useCallback, useEffect, useRef, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  loadCmsInterestPaymentsInRange,
  loadCmsInterestPaymentsToday,
  isLoggedIn,
  AI_DASHBOARD_USE_STATIC,
} from "../../../HttpRequest/aiAdminApi";
import { MARKETPLACE_URL } from "../../../../config";

import { DataTable, money, number, LoadingBlock } from "./adminAIDashboardShared";

import {

  KpiCard,

  KpiGrid,

  ExportBar,

  exportRowsToCsv,

  printReport,

} from "./adminReportKit";

import { buildCmsLenderListPath } from "./AdminCmsDealLendersPage";
import {
  cmsReturnsTypeLabel,
  dealPaidAmount,
  dealPaidCount,
  dealNotPaidAmount,
  dealNotPaidCount,
  paidPct,
  aggregateByType,
} from "./adminCmsPayoutUtils";
import {
  CmsTypeFilter,
  CmsPaidProgress,
  CmsTypeBadge,
  CmsHeroStats,
} from "./CmsPayoutVisuals";

import { statusBadge } from "./adminFullReports";



const EMPTY_CMS = { dealCount: 0, deals: [], unpaidLenders: [] };



const toInputDate = (d = new Date()) => {

  const y = d.getFullYear();

  const m = String(d.getMonth() + 1).padStart(2, "0");

  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;

};

/** Full page opens on Today (fastest). Use presets + Fetch for wider ranges. */
const cmsDefaultDateRange = () => {
  const today = toInputDate();
  return { from: today, to: today };
};

const cmsYearPresets = () => {
  const y = new Date().getFullYear();
  const today = toInputDate();
  return [
    { label: "Today", from: today, to: today },
    { label: `Jun–Jul ${y - 1}`, from: `${y - 1}-06-01`, to: `${y - 1}-07-31` },
    { label: `Jun–Jul ${y}`, from: `${y}-06-01`, to: `${y}-07-31` },
    { label: "Last 12 months", from: toInputDate(new Date(Date.now() - 365 * 86400000)), to: today },
  ];
};

const CmsDealCard = ({ deal, onOpen }) => {
  const total = deal.totalLenders || 0;
  const paid = dealPaidCount(deal);
  const notPaid = dealNotPaidCount(deal);
  const pct = paidPct(deal);
  const typeClass = (deal.lenderReturnsType || "").toUpperCase();

  return (
    <button
      type="button"
      className={`ai-cms-deal-card ai-cms-deal-card--${typeClass.toLowerCase()}`}
      onClick={() =>
        onOpen({
          dealId: deal.dealId,
          dealName: deal.dealName,
          paymentDate: deal.paymentDate,
          cmsPaymentId: deal.cmsPaymentId,
          returnsType: deal.lenderReturnsType,
        })
      }
    >
      <div className="ai-cms-deal-card-head">
        <div className="ai-cms-deal-card-title">
          <h6>{deal.dealName || `Deal #${deal.dealId}`}</h6>
          <span className="ai-cms-deal-card-meta">
            <span>#{deal.dealId}</span>
            <span>{deal.paymentDate || "—"}</span>
            <CmsTypeBadge type={deal.lenderReturnsType} />
          </span>
        </div>
        <span className={`ai-cms-deal-pct ${pct === 100 ? "ai-cms-deal-pct--done" : ""}`}>{pct}%</span>
      </div>
      <CmsPaidProgress deal={deal} />
      <div className="ai-cms-deal-counts">
        <span className="ai-cms-pill ai-cms-pill--total">{number(total)} initiated</span>
        <span className="ai-cms-pill ai-cms-pill--paid">{number(paid)} paid</span>
        <span className="ai-cms-pill ai-cms-pill--pending">{number(notPaid)} pending</span>
      </div>
      <div className="ai-cms-deal-amounts">
        <span className="ai-cms-amt-paid">Paid {money(dealPaidAmount(deal))}</span>
        <span className="ai-cms-amt-pending">Pending {money(dealNotPaidAmount(deal))}</span>
      </div>
      {deal.fileName && (
        <div className="ai-cms-deal-file" title={deal.fileName}>
          <i className="fas fa-file-excel" />
          <span>{deal.fileName}</span>
        </div>
      )}
      <span className="ai-cms-deal-card-cta">
        View lender list
        <i className="fas fa-arrow-right" />
      </span>
    </button>
  );
};

const AdminCmsPaymentsPanel = ({
  defaultDays,
  fullPage = false,
  compact = false,
  loggedIn = false,
}) => {
  const rangeDefault = defaultDays != null
    ? { from: toInputDate(new Date(Date.now() - defaultDays * 86400000)), to: toInputDate() }
    : cmsDefaultDateRange();

  const [fromDate, setFromDate] = useState(rangeDefault.from);
  const [toDate, setToDate] = useState(rangeDefault.to);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [data, setData] = useState(null);

  const navigate = useNavigate();

  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState("ALL");

  const fetchGen = useRef(0);
  const mountedFetch = useRef(false);

  const ready = AI_DASHBOARD_USE_STATIC || loggedIn || isLoggedIn();

  const openLenderList = (deal) => {
    if (!deal?.dealId) return;
    navigate(
      buildCmsLenderListPath({
        dealId: deal.dealId,
        dealName: deal.dealName,
        paymentDate: deal.paymentDate,
        cmsPaymentId: deal.cmsPaymentId,
        returnsType: deal.returnsType || deal.lenderReturnsType,
      })
    );
  };

  const runFetch = useCallback(async (from, to, { unpaid = showUnpaidOnly, preferToday = false } = {}) => {
    if (!ready) {
      setError("");
      setData(null);
      setLoading(false);
      return;
    }

    const gen = ++fetchGen.current;
    setLoading(true);
    setError("");

    const today = toInputDate();
    const isToday = (from === today && to === today) || preferToday;

    try {
      const res = isToday && !unpaid
        ? await loadCmsInterestPaymentsToday()
        : await loadCmsInterestPaymentsInRange(from, to, { includeUnpaid: unpaid });
      if (gen !== fetchGen.current) return;
      setData(res || EMPTY_CMS);
    } catch (e) {
      if (gen !== fetchGen.current) return;
      const raw = e?.response?.data?.error || e?.message || "Could not load CMS payouts.";
      let msg = raw;
      if (raw.includes("SQLGrammarException") || raw.includes("could not extract ResultSet")) {
        msg = "CMS query failed on backend. Rebuild: mvn install -pl oxyloans-service,oxyloans-rest -am";
      }
      if (e?.code === "ERR_NETWORK" || (!e?.response && String(raw).toLowerCase().includes("network"))) {
        msg = `Cannot connect to API (${MARKETPLACE_URL || "/oxyloans"}). Ensure backend runs on port 8181, then restart npm start so the dev proxy picks it up.`;
      }
      setError(
        msg.includes("login") || e?.code === "NO_TOKEN"
          ? "Session expired or not logged in. Please login at /admlogin."
          : msg
      );
      setData(null);
    } finally {
      if (gen === fetchGen.current) setLoading(false);
    }
  }, [ready, showUnpaidOnly]);

  const fetchData = useCallback(() => {
    runFetch(fromDate, toDate, { unpaid: showUnpaidOnly });
  }, [fromDate, toDate, showUnpaidOnly, runFetch]);

  useEffect(() => {
    if (!ready || mountedFetch.current) return;
    mountedFetch.current = true;
    const today = toInputDate();
    runFetch(today, today, { preferToday: true });
  }, [ready, runFetch]);



  const unpaid = data?.unpaidLenders || [];



  const dealRows = (data?.deals || []).map((d) => ({
    dealId: d.dealId,
    dealName: d.dealName,
    paymentDate: d.paymentDate,
    fileName: d.fileName,
    fileStatus: d.fileExecutionStatus,
    fileExecutionStatus: d.fileExecutionStatus,
    lenderReturnsType: d.lenderReturnsType,
    totalLenders: d.totalLenders,
    paidLenders: d.walletPaidLenders ?? d.paidLenders,
    failedLenders: d.walletFailedLenders ?? d.failedLenders,
    pendingLenders: d.walletPendingLenders ?? d.pendingLenders,
    walletPaidLenders: d.walletPaidLenders,
    walletFailedLenders: d.walletFailedLenders,
    walletAwaitingLenders: d.walletAwaitingLenders,
    walletPendingLenders: d.walletPendingLenders,
    initiatedLenders: d.initiatedLenders,
    approvedLenders: d.approvedLenders,
    successLenders: d.successLenders,
    totalAmount: d.totalAmount,
    paidAmount: d.walletPaidAmount ?? d.paidAmount,
    failedAmount: d.walletFailedAmount,
    awaitingAmount: d.walletAwaitingAmount,
    pendingAmount: d.walletPendingAmount ?? d.pendingAmount,
    cmsPaymentId: d.cmsPaymentId,
  }));

  const filteredDealRows =
    typeFilter === "ALL"
      ? dealRows
      : dealRows.filter((d) => (d.lenderReturnsType || "").toUpperCase() === typeFilter);

  const typeCounts = dealRows.reduce((acc, d) => {
    const t = (d.lenderReturnsType || "OTHER").toUpperCase();
    acc[t] = (acc[t] || 0) + 1;
    acc.ALL = dealRows.length;
    return acc;
  }, { ALL: 0 });

  const byType = aggregateByType(dealRows);



  const unpaidCols = [
    ["lenderId", "User ID"],
    ["lenderName", "Lender"],
    ["lenderReturnsType", "Type", (v) => cmsReturnsTypeLabel(v)],
    ["dealId", "Deal ID"],
    ["dealName", "Deal"],
    ["paymentDate", "Pay date"],
    ["amount", "Amount", money],
    ["transactionStatus", "Sheet status", (v) => statusBadge(v)],
  ];

  const dealCols = [
    ["dealName", "Deal"],
    ["paymentDate", "Pay date"],
    ["lenderReturnsType", "Type", (v) => cmsReturnsTypeLabel(v)],
    ["fileName", "CMS file"],
    ["fileStatus", "File status"],
    ["totalLenders", "Initiated", number],
    ["paidLenders", "Paid", number],
    ["pendingLenders", "Pending", number],
    ["approvedLenders", "Sheet APPROVED", number],
    ["totalAmount", "Total", money],
    ["paidAmount", "Paid amt", money],
    ["pendingAmount", "Pending amt", money],
  ];

  const applyPreset = (preset) => {
    setFromDate(preset.from);
    setToDate(preset.to);
    runFetch(preset.from, preset.to, { unpaid: showUnpaidOnly });
  };



  const summaryCards = fullPage ? (
    <CmsHeroStats data={data} byType={byType} />
  ) : (
    <KpiGrid className={compact ? "ai-kpi-grid--compact ai-kpi-grid--cms-compact" : ""}>
      <KpiCard
        tone="green"
        icon="fas fa-check-circle"
        label="Paid"
        value={number(data?.paidLenders)}
        sub={money(data?.paidAmount)}
      />
      <KpiCard
        tone="orange"
        icon="fas fa-exclamation-circle"
        label="Not paid"
        value={number(data?.pendingLenders)}
        sub={money(data?.pendingAmount)}
      />
      <KpiCard
        tone="blue"
        icon="fas fa-briefcase"
        label="CMS files"
        value={number(data?.dealCount)}
        sub="Interest · Principal · P+I"
      />
    </KpiGrid>
  );



  if (compact) {

    return (

      <div className="ai-cms-summary-compact">

        {!ready && (

          <div className="alert alert-light py-2 small mb-2">

            Login required for CMS data.{" "}

            <Link to="/admlogin">Admin Login</Link>

          </div>

        )}

        {ready && loading && (

          <div className="ai-cms-loading-inline">

            <i className="fas fa-spinner fa-spin me-1" />

            Loading CMS payouts…

          </div>

        )}

        {ready && !loading && error && (

          <div className="alert alert-warning py-2 small mb-2">{error}</div>

        )}

        {ready && !loading && !error && data && (
          <>
            {summaryCards}
            {data.dealCount > 0 ? (
              <div className="ai-cms-today-deals mt-2">
                <p className="ai-cms-today-head mb-1">
                  <i className="fas fa-calendar-day me-1" />
                  Today — {number(data.dealCount)} deal{data.dealCount !== 1 ? "s" : ""} ·{" "}
                  {number(data.totalLenders)} lenders ·{" "}
                  <span className="text-success">{number(data?.paidLenders)} paid</span> ·{" "}
                  <span className="text-warning">{number(data?.pendingLenders)} not paid</span>
                </p>
                {(data.deals || []).slice(0, 8).map((d) => (
                  <div key={`${d.cmsPaymentId}-${d.dealId}`} className="ai-cms-today-deal-row">
                    <span className="ai-cms-today-deal-name" title={`Deal #${d.dealId}`}>
                      {d.dealName || `Deal #${d.dealId}`}
                    </span>
                    <span className="ai-cms-today-deal-stats">
                      <span className="ai-cms-pill ai-cms-pill--total">{number(d.totalLenders)} lenders</span>
                      <span className="ai-cms-pill ai-cms-pill--paid">{number(dealPaidCount(d))} paid</span>
                      <span className="ai-cms-pill ai-cms-pill--pending">{number(dealNotPaidCount(d))} not paid</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small mb-0 mt-1">
                No CMS payouts initiated today yet (Interest / Principal / Principal+Interest).
              </p>
            )}
          </>
        )}

        <Link to="/adminAIDashboard/cms-lender-payouts" className="btn btn-sm btn-success mt-2">

          <i className="fas fa-external-link-alt me-1" />

          Full CMS report

        </Link>

      </div>

    );

  }



  return (

    <div className={`ai-board-table-block ai-cms-range-panel ${fullPage ? "ai-cms-range-panel--full" : ""}`}>

      {!fullPage && (

        <header className="ai-board-table-head ai-board-table-head--cms">
          <div>
            <span>
              <i className="fas fa-money-check-alt me-2" />
              Lender payments — paid / not paid
            </span>
            <div className="text-muted small">Interest: lenders_returns · Principal/P+I: oxy_principal_return</div>
          </div>
          <Link to="/adminAIDashboard/cms-lender-payouts" className="ai-board-link">

            Full report

          </Link>

        </header>

      )}



      <div className="ai-cms-toolbar">
        <div className="ai-cms-toolbar-dates">
          <label className="ai-cms-filter-field">
            <span>From</span>
            <input type="date" className="form-control form-control-sm" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </label>
          <label className="ai-cms-filter-field">
            <span>To</span>
            <input type="date" className="form-control form-control-sm" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </label>
          <button type="button" className="btn btn-success ai-cms-fetch-btn" onClick={fetchData} disabled={loading || !ready}>
            <i className={`fas fa-search ${loading ? "fa-spin" : ""}`} />
            Fetch
          </button>
        </div>
        <div className="ai-cms-presets">
          {cmsYearPresets().map((p) => {
            const active = fromDate === p.from && toDate === p.to;
            return (
              <button
                key={p.label}
                type="button"
                className={`ai-cms-preset-btn ${active ? "ai-cms-preset-btn--active" : ""}`}
                onClick={() => applyPreset(p)}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <label className="ai-cms-filter-check">
          <input type="checkbox" checked={showUnpaidOnly} onChange={(e) => setShowUnpaidOnly(e.target.checked)} />
          Unpaid list
        </label>
      </div>

      {!fullPage && (
        <CmsTypeFilter value={typeFilter} onChange={setTypeFilter} counts={typeCounts} className="mb-2" />
      )}

      {!ready && (

        <div className="alert alert-light py-2 px-3 mb-0 small">

          Admin login required. <Link to="/admlogin">Login</Link>

        </div>

      )}



      {ready && loading && <LoadingBlock label="Loading CMS payouts…" />}



      {ready && !loading && error && (

        <div className="alert alert-warning py-2 px-3 mb-0 small">

          <strong>CMS data unavailable.</strong> {error}

          {String(error).includes("mvn install") && (

            <p className="mb-0 mt-1 text-muted">Backend fix: run <code>mvn install -pl oxyloans-service,oxyloans-rest -am</code> then restart on port 8181.</p>

          )}

        </div>

      )}



      {ready && !loading && !error && data && (
        <>
          {summaryCards}
          {!compact && <CmsTypeFilter value={typeFilter} onChange={setTypeFilter} counts={typeCounts} />}

          {dealRows.length === 0 ? (
            <p className="text-muted small mb-0 px-1 mt-3">
              No CMS payouts for {fromDate}
              {fromDate !== toDate ? ` – ${toDate}` : ""}. Try <strong>Jun–Jul</strong> or widen the date range.
            </p>
          ) : fullPage ? (
            <section className="ai-cms-deals-section">
              <div className="ai-cms-deals-section-head">
                <h4>Deal payouts</h4>
                <span>{filteredDealRows.length} file{filteredDealRows.length === 1 ? "" : "s"}</span>
              </div>
              <div className="ai-cms-deal-cards ai-cms-deal-cards-grid">
                {filteredDealRows.map((d) => (
                  <CmsDealCard
                    key={`${d.cmsPaymentId || "opr"}-${d.dealId}-${d.lenderReturnsType}-${d.paymentDate}`}
                    deal={d}
                    onOpen={openLenderList}
                  />
                ))}
              </div>
            </section>
          ) : (
            <DataTable
              rows={filteredDealRows}
              initialLimit={8}
              columns={[
                ...dealCols,
                [
                  "dealId",
                  "",
                  (_, row) => (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success"
                      onClick={() =>
                        openLenderList({
                          dealId: row.dealId,
                          dealName: row.dealName,
                          paymentDate: row.paymentDate,
                          cmsPaymentId: row.cmsPaymentId,
                          returnsType: row.lenderReturnsType,
                        })
                      }
                    >
                      Details
                    </button>
                  ),
                ],
              ]}
              emptyText="No deals in range."
            />
          )}

          {showUnpaidOnly && unpaid.length > 0 && (
            <div className="ai-cms-unpaid-block mt-3">
              <header className="ai-board-table-head ai-board-table-head--cms-unpaid">
                <span>
                  <i className="fas fa-user-clock me-2" />
                  Not paid lenders — regenerate bank file ({unpaid.length})
                </span>
                <ExportBar
                  onExportCsv={() => exportRowsToCsv(unpaid, unpaidCols, `cms-unpaid-${fromDate}-${toDate}.csv`)}
                  onPrint={printReport}
                  disabled={!unpaid.length}
                />
              </header>
              <DataTable rows={unpaid} initialLimit={50} columns={unpaidCols} emptyText="No unpaid lenders." />
            </div>
          )}

          {showUnpaidOnly && unpaid.length === 0 && (
            <p className="text-muted small mt-3 mb-0">All lenders paid to wallet in this range.</p>
          )}
        </>
      )}

    </div>

  );

};



export default AdminCmsPaymentsPanel;

