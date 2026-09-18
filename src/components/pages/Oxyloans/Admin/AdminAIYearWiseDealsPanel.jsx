import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaDownload, FaSync, FaTimes } from "react-icons/fa";
import { saveAs } from "file-saver";
import {
  downloadAdminAIDealsYearWiseExcel,
  getAdminAIDealsYearlySummary,
  parseAdminAIExportError,
} from "../../../HttpRequest/admin";
import { buildYearWiseDealsListPath } from "./adminAINavigation";

const fmtNum = (value) => Number(value || 0).toLocaleString("en-IN");
const fmtMoney = (value) => `₹ ${fmtNum(Math.round(Number(value) || 0))}`;
const n = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const ALL_YEARS = 0;
const REGULAR_TYPES = ["ALL", "NORMAL", "EQUITY", "ESCROW"];
const STATUS_FILTERS = [
  { id: "ALL", label: "All statuses" },
  { id: "ACTIVE", label: "Not closed" },
  { id: "CLOSED", label: "Closed" },
];

/**
 * Year-wise deals summary panel. Click counts to open deal list on a separate page.
 */
const AdminAIYearWiseDealsPanel = ({ onClose }) => {
  const navigate = useNavigate();
  const [section, setSection] = useState("regular");
  const [dealType, setDealType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [year, setYear] = useState(ALL_YEARS);
  const [years, setYears] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const apiDealType = section === "test" ? "TEST" : dealType;
  const isAllYears = n(year) <= 0;

  const loadSummary = useCallback(async (nextType = apiDealType) => {
    setLoadingSummary(true);
    setError("");
    try {
      const data = await getAdminAIDealsYearlySummary(2018, nextType);
      const yearRows = Array.isArray(data?.years) ? data.years : [];
      setYears(yearRows);
      setSummary(data || null);
      if (!isAllYears && yearRows.length) {
        const hasSelected = yearRows.some((row) => n(row.year) === n(year));
        if (!hasSelected) {
          setYear(ALL_YEARS);
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load year-wise deal summary");
    } finally {
      setLoadingSummary(false);
    }
  }, [apiDealType, year, isAllYears]);

  useEffect(() => {
    loadSummary(apiDealType);
  }, [apiDealType, loadSummary]);

  const onExport = async () => {
    setExporting(true);
    setError("");
    try {
      const blob = await downloadAdminAIDealsYearWiseExcel(year, { dealType: apiDealType, status });
      const label = isAllYears ? "all-years" : String(year);
      const typeLabel = section === "test" ? "test" : "regular";
      saveAs(blob, `admin-ai-yearwise-deals-${typeLabel}-${label}.xlsx`);
    } catch (err) {
      const message = await parseAdminAIExportError(err).catch(() => null);
      setError(message || err?.message || "Excel download failed");
    } finally {
      setExporting(false);
    }
  };

  const openSection = (nextSection) => {
    setSection(nextSection);
    setDealType("ALL");
    setStatus("ALL");
    setYear(ALL_YEARS);
  };

  const openDealsList = (tenureCategory, event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    navigate(
      buildYearWiseDealsListPath({
        year,
        dealType: apiDealType,
        tenureCategory,
        section,
      })
    );
  };

  const selectedYearMeta = useMemo(() => {
    if (isAllYears) {
      return {
        year: ALL_YEARS,
        dealsCount: summary?.grandTotalDeals,
        dealAmountSum: summary?.grandDealAmount,
        participatedAmountSum: summary?.grandParticipatedAmount,
        principalReturnedSum: summary?.grandPrincipalReturned,
        withdrawalAmountSum: summary?.grandWithdrawnAmount,
        closedCount: summary?.grandClosedCount,
        activeCount: summary?.grandActiveCount,
        onTimeClosedCount: summary?.grandOnTimeClosedCount,
        closedExtendedCount: summary?.grandClosedExtendedCount,
        activeNoExtensionCount: summary?.grandActiveNoExtensionCount,
        activeExtendedCount: summary?.grandActiveExtendedCount,
        activeNearEndCount: summary?.grandActiveNearEndCount,
        activeOverdueCount: summary?.grandActiveOverdueCount,
        activeExtendedShortCount: summary?.grandActiveExtendedShortCount,
        activeExtendedLongCount: summary?.grandActiveExtendedLongCount,
        activeExtendedMediumCount: summary?.grandActiveExtendedMediumCount,
        closedExtendedShortCount: summary?.grandClosedExtendedShortCount,
        closedExtendedLongCount: summary?.grandClosedExtendedLongCount,
        closedExtendedMediumCount: summary?.grandClosedExtendedMediumCount,
        shortTermBasicExtensionMonths: summary?.shortTermBasicExtensionMonths,
        longTermBasicExtensionMonths: summary?.longTermBasicExtensionMonths,
        mediumTermBasicExtensionMonths: summary?.mediumTermBasicExtensionMonths,
        closedShortTermBasicExtensionMonths: summary?.closedShortTermBasicExtensionMonths,
        closedLongTermBasicExtensionMonths: summary?.closedLongTermBasicExtensionMonths,
        closedMediumTermBasicExtensionMonths: summary?.closedMediumTermBasicExtensionMonths,
        extendedDealsCount: summary?.grandExtendedDealsCount,
        remainingPrincipalSum: summary?.grandRemainingPrincipal,
      };
    }
    return years.find((row) => n(row.year) === n(year)) || null;
  }, [isAllYears, summary, years, year]);

  const yearLabel = isAllYears ? "All years" : String(year);

  const clarityCounts = useMemo(() => {
    const meta = selectedYearMeta || {};
    const closedTotal = n(meta.closedCount);
    const activeTotal = n(meta.activeCount);
    const extendedTotal = n(meta.extendedDealsCount);
    let closedOnTime = n(meta.onTimeClosedCount);
    let closedExtended = n(meta.closedExtendedCount);
    let activeNoExtension = n(meta.activeNoExtensionCount);
    let activeExtended = n(meta.activeExtendedCount);
    const activeNearEnd = n(meta.activeNearEndCount);
    const activeOverdue = n(meta.activeOverdueCount);

    if (closedExtended <= 0 && closedTotal > closedOnTime) {
      closedExtended = closedTotal - closedOnTime;
    }
    if (activeNoExtension <= 0 && activeExtended <= 0 && activeTotal > 0) {
      activeExtended = Math.max(0, extendedTotal - closedExtended);
      activeNoExtension = Math.max(0, activeTotal - activeExtended);
    } else if (activeNoExtension + activeExtended !== activeTotal && activeTotal > 0) {
      if (activeExtended <= 0) {
        activeExtended = Math.max(0, activeTotal - activeNoExtension);
      } else if (activeNoExtension <= 0) {
        activeNoExtension = Math.max(0, activeTotal - activeExtended);
      }
    }

    return {
      closedTotal,
      activeTotal,
      closedOnTime,
      closedExtended,
      activeNoExtension,
      activeExtended,
      activeNearEnd,
      activeOverdue,
    };
  }, [selectedYearMeta]);

  const {
    closedTotal,
    activeTotal,
    closedOnTime,
    closedExtended,
    activeNoExtension,
    activeExtended,
    activeNearEnd,
    activeOverdue,
  } = clarityCounts;

  const extensionInfo = useMemo(() => {
    const meta = selectedYearMeta || {};
    const shortExtended = n(meta.activeExtendedShortCount);
    const longExtended = n(meta.activeExtendedLongCount);
    let mediumExtended = n(meta.activeExtendedMediumCount);
    const shortBasic = n(meta.shortTermBasicExtensionMonths) || 3;
    const longBasic = n(meta.longTermBasicExtensionMonths);
    const mediumBasic = n(meta.mediumTermBasicExtensionMonths);
    if (mediumExtended <= 0 && activeExtended > 0) {
      mediumExtended = Math.max(0, activeExtended - shortExtended - longExtended);
    }
    const breakdownTotal = shortExtended + mediumExtended + longExtended;

    const closedShortExtended = n(meta.closedExtendedShortCount);
    const closedLongExtended = n(meta.closedExtendedLongCount);
    let closedMediumExtended = n(meta.closedExtendedMediumCount);
    const closedShortBasic = n(meta.closedShortTermBasicExtensionMonths);
    const closedLongBasic = n(meta.closedLongTermBasicExtensionMonths);
    const closedMediumBasic = n(meta.closedMediumTermBasicExtensionMonths);
    if (closedMediumExtended <= 0 && closedExtended > 0) {
      closedMediumExtended = Math.max(0, closedExtended - closedShortExtended - closedLongExtended);
    }
    const closedBreakdownTotal = closedShortExtended + closedMediumExtended + closedLongExtended;

    return {
      shortExtended,
      mediumExtended,
      longExtended,
      shortBasic,
      mediumBasic,
      longBasic,
      breakdownTotal,
      closedShortExtended,
      closedMediumExtended,
      closedLongExtended,
      closedShortBasic,
      closedMediumBasic,
      closedLongBasic,
      closedBreakdownTotal,
    };
  }, [selectedYearMeta, activeExtended, closedExtended]);

  const {
    shortExtended,
    mediumExtended,
    longExtended,
    shortBasic,
    mediumBasic,
    longBasic,
    breakdownTotal,
    closedShortExtended,
    closedMediumExtended,
    closedLongExtended,
    closedShortBasic,
    closedMediumBasic,
    closedLongBasic,
    closedBreakdownTotal,
  } = extensionInfo;

  return (
    <section className="admin-ai-panel admin-ai-yearwise-deals-panel" id="admin-ai-yearwise-deals">
      <div className="admin-ai-ywd-section-tabs" role="tablist">
        <button
          type="button"
          className={section === "regular" ? "is-active" : ""}
          onClick={() => openSection("regular")}
        >
          YearWise Deals
          <small>All years / year filter · TEST excluded</small>
        </button>
        <button
          type="button"
          className={section === "test" ? "is-active is-test" : "is-test"}
          onClick={() => openSection("test")}
        >
          Test Deals
          <small>Separate TEST deals only</small>
        </button>
      </div>

      <div className="admin-ai-panel-head">
        <div>
          <h5>{section === "test" ? "Test Deals" : "YearWise Deals"}</h5>
          <p>
            Summary only — click any count below to open the full deal list on a separate page.
          </p>
        </div>
        <div className="admin-ai-panel-actions">
          <button type="button" className="admin-ai-search-btn" disabled={exporting} onClick={onExport}>
            <FaDownload /> {exporting ? "Exporting..." : "Download Excel"}
          </button>
          <button
            type="button"
            className="admin-ai-reset-btn"
            disabled={loadingSummary}
            onClick={() => loadSummary(apiDealType)}
          >
            <FaSync /> {loadingSummary ? "Refreshing..." : "Refresh"}
          </button>
          {onClose ? (
            <button type="button" className="admin-ai-close-btn" onClick={onClose}>
              <FaTimes /> Close
            </button>
          ) : null}
        </div>
      </div>

      {error ? <div className="admin-ai-oxy-error">{error}</div> : null}

      <div className="admin-ai-ywd-filters">
        {section === "regular" ? (
          <div className="admin-ai-ywd-type-tabs" role="tablist">
            {REGULAR_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={dealType === type ? "is-active" : ""}
                onClick={() => setDealType(type)}
              >
                {type === "ALL" ? "All types" : type}
              </button>
            ))}
          </div>
        ) : (
          <div className="admin-ai-ywd-type-tabs">
            <button type="button" className="is-active is-test-pill">TEST only</button>
          </div>
        )}
        <div className="admin-ai-ywd-type-tabs" role="tablist">
          {STATUS_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={status === item.id ? "is-active" : ""}
              onClick={() => setStatus(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-ai-ywd-year-strip">
        <button
          type="button"
          className={`admin-ai-ywd-year-card admin-ai-ywd-year-card--all${isAllYears ? " is-active" : ""}`}
          onClick={() => setYear(ALL_YEARS)}
        >
          <small>RANGE</small>
          <strong>All years</strong>
          <span>{fmtNum(summary?.grandTotalDeals)} deals</span>
          <em>{fmtMoney(summary?.grandParticipatedAmount)}</em>
        </button>
        {loadingSummary && !years.length ? (
          <div className="admin-ai-oxy-empty">Loading years...</div>
        ) : null}
        {years.map((item) => (
          <button
            key={item.year}
            type="button"
            className={`admin-ai-ywd-year-card${n(item.year) === n(year) ? " is-active" : ""}`}
            onClick={() => setYear(n(item.year))}
          >
            <small>YEAR</small>
            <strong>{item.year}</strong>
            <span>{fmtNum(item.dealsCount)} deals</span>
            <em>{fmtMoney(item.participatedAmountSum)}</em>
          </button>
        ))}
        {!loadingSummary && !years.length ? (
          <div className="admin-ai-oxy-empty">No deals found for this filter.</div>
        ) : null}
      </div>

      <div className="admin-ai-ywd-kpi-row">
        <article className="admin-ai-ywd-kpi admin-ai-ywd-kpi--deals">
          <small>Deals · {yearLabel}</small>
          <strong>{fmtNum(selectedYearMeta?.dealsCount)}</strong>
        </article>
        <article className="admin-ai-ywd-kpi admin-ai-ywd-kpi--amount">
          <small>Deal amount</small>
          <strong>{fmtMoney(selectedYearMeta?.dealAmountSum)}</strong>
        </article>
        <article className="admin-ai-ywd-kpi admin-ai-ywd-kpi--participation">
          <small>Participation</small>
          <strong>{fmtMoney(selectedYearMeta?.participatedAmountSum)}</strong>
        </article>
        <article className="admin-ai-ywd-kpi admin-ai-ywd-kpi--returned">
          <small>Principal returned</small>
          <strong>{fmtMoney(selectedYearMeta?.principalReturnedSum)}</strong>
        </article>
        <article className="admin-ai-ywd-kpi admin-ai-ywd-kpi--remaining">
          <small>Principal to return</small>
          <strong>{fmtMoney(selectedYearMeta?.remainingPrincipalSum)}</strong>
        </article>
        <article className="admin-ai-ywd-kpi admin-ai-ywd-kpi--withdrawals">
          <small>Withdrawals</small>
          <strong>{fmtMoney(selectedYearMeta?.withdrawalAmountSum)}</strong>
        </article>
        <article className="admin-ai-ywd-kpi admin-ai-ywd-kpi--status">
          <small>Closed / Active</small>
          <strong>
            {fmtNum(closedTotal)} / {fmtNum(activeTotal)}
          </strong>
        </article>
      </div>

      <div className="admin-ai-ywd-clarity">
        <header>
          <h6>Closed &amp; active clarity · {yearLabel}</h6>
          <p>Click any count to open the filtered deal list on a separate page.</p>
        </header>
        <div className="admin-ai-ywd-clarity-grid">
          <section className="admin-ai-ywd-clarity-group admin-ai-ywd-clarity-group--closed">
            <h6>
              Closed deals · {fmtNum(closedTotal)}
              <em>
                {fmtNum(closedOnTime)} no ext + {fmtNum(closedExtended)} with ext
              </em>
            </h6>
            <div className="admin-ai-ywd-clarity-cards">
              <button
                type="button"
                className="admin-ai-ywd-clarity-card admin-ai-ywd-clarity-card--link admin-ai-ywd-clarity-card--closed-on-time"
                onClick={(event) => openDealsList("CLOSED_ON_TIME", event)}
              >
                <small>Closed without extension</small>
                <strong>{fmtNum(closedOnTime)}</strong>
              </button>
              <button
                type="button"
                className="admin-ai-ywd-clarity-card admin-ai-ywd-clarity-card--link admin-ai-ywd-clarity-card--closed-ext"
                onClick={(event) => openDealsList("CLOSED_EXTENDED", event)}
              >
                <small>Closed with extension</small>
                <strong>{fmtNum(closedExtended)}</strong>
              </button>
            </div>
            <div className="admin-ai-ywd-extension-info">
              <h6>Extension breakdown · short / medium / long term</h6>
              <p>
                Short-term = original tenure &lt;= 3 months · Medium-term = 4–6 months · Long-term = original tenure &gt; 6 months
              </p>
              <div className="admin-ai-ywd-extension-info-grid admin-ai-ywd-extension-info-grid--three">
                <button
                  type="button"
                  className="admin-ai-ywd-extension-info-card admin-ai-ywd-extension-info-card--short"
                  onClick={(event) => openDealsList("CLOSED_EXTENDED_SHORT", event)}
                >
                  <small>Short-term deals extended</small>
                  <strong>{fmtNum(closedShortExtended)}</strong>
                  <span>
                    Basic extension period:{" "}
                    {closedShortBasic > 0 ? `${fmtNum(closedShortBasic)} month(s)` : "Not recorded yet"}
                  </span>
                </button>
                <button
                  type="button"
                  className="admin-ai-ywd-extension-info-card admin-ai-ywd-extension-info-card--medium"
                  onClick={(event) => openDealsList("CLOSED_EXTENDED_MEDIUM", event)}
                >
                  <small>Medium-term deals extended (4–6m)</small>
                  <strong>{fmtNum(closedMediumExtended)}</strong>
                  <span>
                    Basic extension period:{" "}
                    {closedMediumBasic > 0 ? `${fmtNum(closedMediumBasic)} month(s)` : "Not recorded yet"}
                  </span>
                </button>
                <button
                  type="button"
                  className="admin-ai-ywd-extension-info-card admin-ai-ywd-extension-info-card--long"
                  onClick={(event) => openDealsList("CLOSED_EXTENDED_LONG", event)}
                >
                  <small>Long-term deals extended</small>
                  <strong>{fmtNum(closedLongExtended)}</strong>
                  <span>
                    Basic extension period:{" "}
                    {closedLongBasic > 0 ? `${fmtNum(closedLongBasic)} month(s)` : "Not recorded yet"}
                  </span>
                </button>
              </div>
              <p className="admin-ai-ywd-extension-total">
                Total extended closed deals: {fmtNum(closedShortExtended)} + {fmtNum(closedMediumExtended)} + {fmtNum(closedLongExtended)} = {fmtNum(closedBreakdownTotal)}
                {closedBreakdownTotal === closedExtended
                  ? " (matches Closed with extension above)"
                  : ` (Closed with extension: ${fmtNum(closedExtended)})`}
              </p>
            </div>
          </section>
          <section className="admin-ai-ywd-clarity-group admin-ai-ywd-clarity-group--active">
            <h6>
              Active deals · {fmtNum(activeTotal)}
              <em>
                {fmtNum(activeNoExtension)} no ext + {fmtNum(activeExtended)} with ext
              </em>
            </h6>
            <div className="admin-ai-ywd-clarity-cards">
              <button
                type="button"
                className="admin-ai-ywd-clarity-card admin-ai-ywd-clarity-card--link admin-ai-ywd-clarity-card--active-no-ext"
                onClick={(event) => openDealsList("ACTIVE_NO_EXTENSION", event)}
              >
                <small>Active without extension</small>
                <strong>{fmtNum(activeNoExtension)}</strong>
              </button>
              <button
                type="button"
                className="admin-ai-ywd-clarity-card admin-ai-ywd-clarity-card--link admin-ai-ywd-clarity-card--active-ext"
                onClick={(event) => openDealsList("ACTIVE_EXTENDED", event)}
              >
                <small>Active with extension</small>
                <strong>{fmtNum(activeExtended)}</strong>
              </button>
              <button
                type="button"
                className="admin-ai-ywd-clarity-card admin-ai-ywd-clarity-card--near admin-ai-ywd-clarity-card--link"
                onClick={(event) => openDealsList("ACTIVE_NEAR_END", event)}
              >
                <small>End date nearing (90 days)</small>
                <strong>{fmtNum(activeNearEnd)}</strong>
              </button>
              <button
                type="button"
                className="admin-ai-ywd-clarity-card admin-ai-ywd-clarity-card--overdue admin-ai-ywd-clarity-card--link"
                onClick={(event) => openDealsList("ACTIVE_OVERDUE", event)}
              >
                <small>Past end date (not closed)</small>
                <strong>{fmtNum(activeOverdue)}</strong>
              </button>
            </div>
            <div className="admin-ai-ywd-extension-info">
              <h6>Extension breakdown · short / medium / long term</h6>
              <p>
                Short-term = original tenure &lt;= 3 months · Medium-term = 4–6 months · Long-term = original tenure &gt; 6 months
              </p>
              <div className="admin-ai-ywd-extension-info-grid admin-ai-ywd-extension-info-grid--three">
                <button
                  type="button"
                  className="admin-ai-ywd-extension-info-card admin-ai-ywd-extension-info-card--short"
                  onClick={(event) => openDealsList("ACTIVE_EXTENDED_SHORT", event)}
                >
                  <small>Short-term deals extended</small>
                  <strong>{fmtNum(shortExtended)}</strong>
                  <span>Basic extension period: {fmtNum(shortBasic)} month(s)</span>
                </button>
                <button
                  type="button"
                  className="admin-ai-ywd-extension-info-card admin-ai-ywd-extension-info-card--medium"
                  onClick={(event) => openDealsList("ACTIVE_EXTENDED_MEDIUM", event)}
                >
                  <small>Medium-term deals extended (4–6m)</small>
                  <strong>{fmtNum(mediumExtended)}</strong>
                  <span>
                    Basic extension period:{" "}
                    {mediumBasic > 0 ? `${fmtNum(mediumBasic)} month(s)` : "Not recorded yet"}
                  </span>
                </button>
                <button
                  type="button"
                  className="admin-ai-ywd-extension-info-card admin-ai-ywd-extension-info-card--long"
                  onClick={(event) => openDealsList("ACTIVE_EXTENDED_LONG", event)}
                >
                  <small>Long-term deals extended</small>
                  <strong>{fmtNum(longExtended)}</strong>
                  <span>
                    Basic extension period:{" "}
                    {longBasic > 0 ? `${fmtNum(longBasic)} month(s)` : "Not recorded yet"}
                  </span>
                </button>
              </div>
              <p className="admin-ai-ywd-extension-total">
                Total extended active deals: {fmtNum(shortExtended)} + {fmtNum(mediumExtended)} + {fmtNum(longExtended)} = {fmtNum(breakdownTotal)}
                {breakdownTotal === activeExtended ? " (matches Active with extension above)" : ` (Active with extension: ${fmtNum(activeExtended)})`}
              </p>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
};

export default AdminAIYearWiseDealsPanel;
