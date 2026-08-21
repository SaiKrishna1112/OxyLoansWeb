import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaDownload, FaEye, FaSearch, FaSync, FaTimes } from "react-icons/fa";
import { saveAs } from "file-saver";
import {
  downloadAdminAIDealsYearWiseExcel,
  getAdminAICreatedDealParticipants,
  getAdminAIDealsYearWise,
  getAdminAIDealsYearlySummary,
  parseAdminAIExportError,
} from "../../../HttpRequest/admin";

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
 * Year-wise deals analytics panel for Admin AI Dashboard.
 * Main view excludes TEST deals; Test Deals has a separate header section.
 */
const AdminAIYearWiseDealsPanel = ({ onClose }) => {
  const currentYear = new Date().getFullYear();
  const [section, setSection] = useState("regular"); // regular | test
  const [dealType, setDealType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [year, setYear] = useState(ALL_YEARS);
  const [years, setYears] = useState([]);
  const [summary, setSummary] = useState(null);
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [dealId, setDealId] = useState("");
  const [dealName, setDealName] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [expandedDealId, setExpandedDealId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
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

  const loadList = useCallback(async (nextPage = page, nextYear = year, nextType = apiDealType) => {
    setLoadingList(true);
    setError("");
    try {
      const data = await getAdminAIDealsYearWise(nextYear, nextPage, pageSize, {
        dealType: nextType,
        status,
        dealId: dealId.trim(),
        dealName: dealName.trim(),
      });
      setRows(Array.isArray(data?.deals) ? data.deals : []);
      setTotalCount(n(data?.totalCount));
      setPage(n(data?.pageNo) || nextPage);
    } catch (err) {
      setRows([]);
      setTotalCount(0);
      setError(err?.response?.data?.message || err?.message || "Failed to load year-wise deals");
    } finally {
      setLoadingList(false);
    }
  }, [page, year, apiDealType, status, dealId, dealName]);

  useEffect(() => {
    loadSummary(apiDealType);
  }, [apiDealType, loadSummary]);

  useEffect(() => {
    loadList(1, year, apiDealType);
  }, [year, apiDealType, status, loadList]);

  const onSearch = (event) => {
    event.preventDefault();
    loadList(1, year, apiDealType);
  };

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
    setPage(1);
    setDealId("");
    setDealName("");
    setExpandedDealId(null);
    setParticipants([]);
  };

  const toggleParticipants = async (dealIdValue) => {
    if (expandedDealId === dealIdValue) {
      setExpandedDealId(null);
      setParticipants([]);
      return;
    }
    setExpandedDealId(dealIdValue);
    setParticipants([]);
    setParticipantsLoading(true);
    try {
      const data = await getAdminAICreatedDealParticipants(dealIdValue);
      setParticipants(Array.isArray(data?.participants) ? data.participants : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load participants");
    } finally {
      setParticipantsLoading(false);
    }
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
      };
    }
    return years.find((row) => n(row.year) === n(year)) || null;
  }, [isAllYears, summary, years, year]);

  const yearLabel = isAllYears ? "All years" : String(year);

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
            {section === "test"
              ? "TEST deals only — year filter, lenders, amounts, returns, withdrawals, tenure, and closed status."
              : "Full deals info by All years or selected year. TEST deals are excluded here and listed under Test Deals."}
          </p>
        </div>
        <div className="admin-ai-panel-actions">
          <button type="button" className="admin-ai-search-btn" disabled={exporting || loadingList} onClick={onExport}>
            <FaDownload /> {exporting ? "Exporting..." : "Download Excel"}
          </button>
          <button
            type="button"
            className="admin-ai-reset-btn"
            disabled={loadingSummary || loadingList}
            onClick={() => {
              loadSummary(apiDealType);
              loadList(page, year, apiDealType);
            }}
          >
            <FaSync /> {loadingSummary || loadingList ? "Refreshing..." : "Refresh"}
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
                onClick={() => {
                  setDealType(type);
                  setPage(1);
                }}
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
              onClick={() => {
                setStatus(item.id);
                setPage(1);
              }}
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
          onClick={() => {
            setYear(ALL_YEARS);
            setPage(1);
          }}
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
            onClick={() => {
              setYear(n(item.year));
              setPage(1);
            }}
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
        <article>
          <small>Deals · {yearLabel}</small>
          <strong>{fmtNum(selectedYearMeta?.dealsCount || totalCount)}</strong>
        </article>
        <article>
          <small>Deal amount</small>
          <strong>{fmtMoney(selectedYearMeta?.dealAmountSum)}</strong>
        </article>
        <article>
          <small>Participation</small>
          <strong>{fmtMoney(selectedYearMeta?.participatedAmountSum)}</strong>
        </article>
        <article>
          <small>Principal returned</small>
          <strong>{fmtMoney(selectedYearMeta?.principalReturnedSum)}</strong>
        </article>
        <article>
          <small>Withdrawals</small>
          <strong>{fmtMoney(selectedYearMeta?.withdrawalAmountSum)}</strong>
        </article>
        <article>
          <small>Closed / Active</small>
          <strong>
            {fmtNum(selectedYearMeta?.closedCount)} / {fmtNum(selectedYearMeta?.activeCount)}
          </strong>
        </article>
      </div>

      <form className="admin-ai-ywd-search" onSubmit={onSearch}>
        <label>
          <span>Deal ID</span>
          <input value={dealId} onChange={(e) => setDealId(e.target.value)} placeholder="e.g. 1201" />
        </label>
        <label>
          <span>Deal name</span>
          <input value={dealName} onChange={(e) => setDealName(e.target.value)} placeholder="Search name" />
        </label>
        <button type="submit" className="admin-ai-search-btn">
          <FaSearch /> Search
        </button>
        <button
          type="button"
          className="admin-ai-reset-btn"
          onClick={() => {
            setDealId("");
            setDealName("");
            setLoadingList(true);
            getAdminAIDealsYearWise(year, 1, pageSize, {
              dealType: apiDealType,
              status,
              dealId: "",
              dealName: "",
            })
              .then((data) => {
                setRows(Array.isArray(data?.deals) ? data.deals : []);
                setTotalCount(n(data?.totalCount));
                setPage(1);
              })
              .catch((err) => {
                setError(err?.response?.data?.message || err?.message || "Failed to load year-wise deals");
              })
              .finally(() => setLoadingList(false));
          }}
        >
          Clear
        </button>
      </form>

      <div className="admin-ai-ywd-table-wrap">
        {loadingList ? <div className="admin-ai-oxy-empty">Loading deals...</div> : null}
        {!loadingList && !rows.length ? (
          <div className="admin-ai-oxy-empty">No deals in {yearLabel}.</div>
        ) : null}
        {rows.length ? (
          <table className="admin-ai-ywd-table">
            <thead>
              <tr>
                <th>Deal</th>
                <th>ROI</th>
                <th>Type</th>
                <th>Status</th>
                <th>Lenders</th>
                <th>Deal amount</th>
                <th>Participation</th>
                <th>Principal / Remaining</th>
                <th>Principal users</th>
                <th>Withdrawal</th>
                <th>Tenure / Extend</th>
                <th>Closed on</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((deal) => {
                const open = expandedDealId === deal.dealId;
                return (
                  <React.Fragment key={deal.dealId}>
                    <tr className={open ? "is-open" : ""}>
                      <td>
                        <div className="admin-ai-ywd-deal-idline">
                          <strong>#{deal.dealId}</strong>
                          <em className="admin-ai-ywd-year-pill">{deal.dealYear || "-"}</em>
                        </div>
                        <span>{deal.dealName || "-"}</span>
                      </td>
                      <td>
                        <span className="admin-ai-ywd-roi">{deal.dealRoiLabel || "-"}</span>
                      </td>
                      <td>
                        <em className={`admin-ai-ywd-type admin-ai-ywd-type--${String(deal.dealType || "").toLowerCase()}`}>
                          {deal.dealType || "-"}
                        </em>
                      </td>
                      <td>
                        <span className={deal.closed ? "is-closed" : "is-open-status"}>
                          {deal.statusLabel || deal.status || "-"}
                        </span>
                      </td>
                      <td>{fmtNum(deal.lendersParticipated)}</td>
                      <td>{fmtMoney(deal.dealAmount)}</td>
                      <td>{fmtMoney(deal.totalParticipationAmount)}</td>
                      <td className="admin-ai-ywd-principal-cell">
                        <span>Returned {fmtMoney(deal.principalReturnedAmount)}</span>
                        <strong>Remain {fmtMoney(deal.remainingPrincipalAmount)}</strong>
                        <small>{deal.partialReturnLabel === "Yes" ? "Partial return" : "Full / none yet"}</small>
                      </td>
                      <td className="admin-ai-ywd-count-cell">
                        <strong>{fmtNum(deal.lendersWithPrincipalReturn)}</strong>
                        <small>got principal</small>
                      </td>
                      <td className="admin-ai-ywd-withdraw-cell">
                        <span>{deal.withdrawalLabel || "No"}</span>
                        <strong>{fmtMoney(deal.withdrawalAmount)}</strong>
                        <small>
                          {fmtNum(deal.lendersWithWithdrawal)} users · {fmtNum(deal.withdrawalCount)} txns
                        </small>
                      </td>
                      <td>
                        <span>{deal.tenure || "-"}</span>
                        <small>{deal.extensionLabel || "No extension"}</small>
                      </td>
                      <td>{deal.borrowerClosedDate || (deal.closed ? "-" : "Still open")}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-ai-search-btn"
                          onClick={() => toggleParticipants(deal.dealId)}
                          title="View participated lenders"
                        >
                          <FaEye /> {open ? "Hide" : "Lenders"}
                        </button>
                      </td>
                    </tr>
                    {open ? (
                      <tr className="admin-ai-ywd-participants-row">
                        <td colSpan={13}>
                          {participantsLoading ? <div>Loading lenders...</div> : null}
                          {!participantsLoading && !participants.length ? <div>No participants found.</div> : null}
                          {participants.length ? (
                            <div className="admin-ai-ywd-participants">
                              {participants.map((p) => (
                                <article key={`${deal.dealId}-${p.lenderId || p.userId}`}>
                                  <strong>LR{p.lenderId || p.userId}</strong>
                                  <span>{p.lenderName || "-"}</span>
                                  <em>{fmtMoney(p.totalParticipationAmount || p.participatedAmount)}</em>
                                  <small>
                                    ROI {p.roi != null ? `${Number(p.roi).toFixed(2)}%` : "-"} ·{" "}
                                    {p.payoutTypeLabel || p.lenderReturnsType || "-"}
                                  </small>
                                </article>
                              ))}
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        ) : null}
      </div>

      <div className="admin-ai-referral-users-pager">
        <button type="button" disabled={page <= 1 || loadingList} onClick={() => loadList(page - 1, year, apiDealType)}>
          Previous
        </button>
        <span>
          {page} / {totalPages} · {fmtNum(totalCount)} deals · {yearLabel}
        </span>
        <button type="button" disabled={page >= totalPages || loadingList} onClick={() => loadList(page + 1, year, apiDealType)}>
          Next
        </button>
      </div>
    </section>
  );
};

export default AdminAIYearWiseDealsPanel;
