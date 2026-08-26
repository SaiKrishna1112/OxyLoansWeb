import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaEye, FaHome, FaSearch, FaSync } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getAdminAICreatedDealParticipants,
  getAdminAIDealsYearWise,
} from "../../../HttpRequest/admin";
import {
  goToAdminAIDashboard,
  goToYearWiseDeals,
} from "./adminAINavigation";
import "./AdminAIDashboard.css";

const PAGE_SIZE = 20;

const TENURE_CATEGORY_LABELS = {
  CLOSED_ON_TIME: "Closed without extension",
  CLOSED_EXTENDED: "Closed with extension",
  CLOSED_EXTENDED_SHORT: "Closed short-term deals extended (<=3m)",
  CLOSED_EXTENDED_MEDIUM: "Closed medium-term deals extended (4-6m)",
  CLOSED_EXTENDED_LONG: "Closed long-term deals extended (>6m)",
  ACTIVE_NO_EXTENSION: "Active without extension",
  ACTIVE_EXTENDED: "Active with extension",
  ACTIVE_EXTENDED_SHORT: "Active short-term deals extended (<=3m)",
  ACTIVE_EXTENDED_MEDIUM: "Active medium-term deals extended (4-6m)",
  ACTIVE_EXTENDED_LONG: "Active long-term deals extended (>6m)",
  ACTIVE_NEAR_END: "Active - end date in next 90 days",
  ACTIVE_OVERDUE: "Active - past end date (not closed)",
  WITHDRAWAL: "Deals with lender withdrawal",
  PRINCIPAL_RETURNED: "Deals with principal returned",
  PRINCIPAL_REMAINING: "Deals with principal to return",
  CLOSED_ALL: "All closed deals",
  ACTIVE_ALL: "All active deals",
  ALL: "All deals",
};

const fmtNum = (value) => Number(value || 0).toLocaleString("en-IN");
const fmtMoney = (value) => `Rs ${fmtNum(Math.round(Number(value) || 0))}`;
const n = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const AdminAIYearWiseDealsListPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const year = n(searchParams.get("year"));
  const tenureCategory = (searchParams.get("tenureCategory") || "ALL").toUpperCase();
  const dealType = searchParams.get("dealType") || "ALL";
  const section = searchParams.get("section") || "regular";
  const apiDealType = section === "test" ? "TEST" : dealType;

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [dealId, setDealId] = useState(searchParams.get("dealId") || "");
  const [dealName, setDealName] = useState(searchParams.get("dealName") || "");
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState("");
  const [expandedDealId, setExpandedDealId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const yearLabel = year <= 0 ? "All years" : String(year);
  const filterLabel = TENURE_CATEGORY_LABELS[tenureCategory] || tenureCategory;

  const loadList = useCallback(async (nextPage = 1) => {
    setLoadingList(true);
    setError("");
    try {
      const data = await getAdminAIDealsYearWise(year, nextPage, PAGE_SIZE, {
        dealType: apiDealType,
        status: "ALL",
        dealId: dealId.trim(),
        dealName: dealName.trim(),
        tenureCategory,
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
  }, [year, apiDealType, tenureCategory, dealId, dealName]);

  useEffect(() => {
    setPage(1);
    loadList(1);
  }, [year, apiDealType, tenureCategory, loadList]);

  const pageTitle = useMemo(() => {
    if (tenureCategory !== "ALL") {
      return `${filterLabel} - ${yearLabel}`;
    }
    return `YearWise deals - ${yearLabel}`;
  }, [filterLabel, tenureCategory, yearLabel]);

  const onSearch = (event) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (dealId.trim()) next.set("dealId", dealId.trim());
    else next.delete("dealId");
    if (dealName.trim()) next.set("dealName", dealName.trim());
    else next.delete("dealName");
    setSearchParams(next);
    loadList(1);
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

  return (
    <div className="admin-ai-page-shell admin-ai-ywd-list-page">
      <div className="admin-ai-dashboard-wrap">
        <header className="admin-ai-ywd-list-head">
          <div>
            <button
              type="button"
              className="admin-ai-referral-back"
              onClick={() => goToYearWiseDeals(navigate)}
            >
              <FaArrowLeft /> Back to YearWise Deals summary
            </button>
            <h2>{pageTitle}</h2>
            <p>
              Deal portfolio map · {section === "test" ? "TEST deals only" : "Regular deals (TEST excluded)"} ·{" "}
              {fmtNum(totalCount)} deals
            </p>
          </div>
          <div className="admin-ai-ywd-list-actions">
            <button type="button" className="admin-ai-reset-btn" disabled={loadingList} onClick={() => loadList(page)}>
              <FaSync /> {loadingList ? "Refreshing..." : "Refresh"}
            </button>
            <button type="button" className="admin-ai-search-btn" onClick={() => goToAdminAIDashboard(navigate)}>
              <FaHome /> Homepage
            </button>
          </div>
        </header>

        {error ? <div className="admin-ai-oxy-error">{error}</div> : null}

        <div className="admin-ai-ywd-results-banner admin-ai-ywd-list-banner">
          <strong>{filterLabel}</strong>
          <span>
            {yearLabel} - {dealType === "ALL" && section !== "test" ? "All types" : apiDealType} - Page {page} /{" "}
            {totalPages}
          </span>
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
              const next = new URLSearchParams(searchParams);
              next.delete("dealId");
              next.delete("dealName");
              setSearchParams(next);
              loadList(1);
            }}
          >
            Clear
          </button>
        </form>

        <div className="admin-ai-ywd-table-wrap">
          {loadingList ? <div className="admin-ai-oxy-empty">Loading deals...</div> : null}
          {!loadingList && !rows.length ? (
            <div className="admin-ai-oxy-empty">No deals found for this filter.</div>
          ) : null}
          {rows.length ? (
            <table className="admin-ai-ywd-table">
              <thead>
                <tr>
                  <th>Deal</th>
                  <th>ROI</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Closure timing</th>
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
                        <td>
                          <span className={`admin-ai-ywd-timing admin-ai-ywd-timing--${deal.closed ? "closed" : "active"}`}>
                            {deal.closureTimingLabel || "-"}
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
                            {fmtNum(deal.lendersWithWithdrawal)} users - {fmtNum(deal.withdrawalCount)} txns
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
                          <td colSpan={14}>
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
                                      ROI {p.roi != null ? `${Number(p.roi).toFixed(2)}%` : "-"} -{" "}
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
          <button type="button" disabled={page <= 1 || loadingList} onClick={() => loadList(page - 1)}>
            Previous
          </button>
          <span>
            {page} / {totalPages} - {fmtNum(totalCount)} deals
          </span>
          <button type="button" disabled={page >= totalPages || loadingList} onClick={() => loadList(page + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAIYearWiseDealsListPage;
