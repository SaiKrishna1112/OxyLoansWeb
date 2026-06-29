import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaRobot,
  FaArrowLeft,
  FaHandshake,
  FaChevronDown,
  FaChevronUp,
  FaUsers,
} from "react-icons/fa";
import OxyloansAdminSidebar from "../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../Header/OxyloansAdminHeader";
import Footer from "../../../Footer/Footer";
import {
  getAdminAICreatedDeals,
  getAdminAICreatedDealParticipants,
  getRegisteredUsersSummary,
} from "../../../HttpRequest/admin";
import "./AdminAIDashboard.css";

const pageSize = 20;

const dealTabMeta = {
  all: { label: "All Deals", description: "Every deal created on the platform." },
  regular: { label: "Regular Deals", description: "Non-test deals across all statuses." },
  active: { label: "Active Deals", description: "Deals that are not yet closed." },
  closed: { label: "Closed Deals", description: "Deals completed by the borrower." },
  test: { label: "Test Deals", description: "Test deal records only." },
};

const fmtNum = (n) => (n == null ? "0" : Number(n).toLocaleString("en-IN"));
const fmtMoney = (n) => `Rs ${fmtNum(n)}`;
const pickNumber = (...values) => {
  for (const value of values) {
    if (value != null && value !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return 0;
};
const responseData = (payload) => (payload && payload.data ? payload.data : payload);
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);
const formatDate = (value) => String(value || "").slice(0, 10) || "-";

const statusLabel = (status) => {
  const value = String(status || "").toUpperCase();
  if (value.includes("NOTYET")) return "Active";
  if (value.includes("CLOSED")) return "Closed";
  return valueOrDash(status);
};

const formatTenure = (deal) => {
  const tenure = String(deal?.tenure || "").trim();
  if (tenure && tenure !== "-") {
    return tenure;
  }
  const duration = pickNumber(deal?.duration);
  if (duration <= 0) {
    return "-";
  }
  const durationType = String(deal?.durationType || "Months").trim() || "Months";
  return `${duration} ${durationType}`;
};

const formatPayoutType = (deal) => {
  const label = String(deal?.payoutTypeLabel || "").trim();
  if (label && label !== "-") {
    return label;
  }
  const raw = String(deal?.payoutType || "MONTHLY").trim().toUpperCase();
  if (raw.includes("YEAR")) return "Yearly";
  if (raw.includes("QUARTER")) return "Quarterly";
  if (raw.includes("HALF")) return "Half-Yearly";
  if (raw.includes("END")) return "End Of Deal";
  return raw ? raw.charAt(0) + raw.slice(1).toLowerCase() : "Monthly";
};

const dealAchievedAmount = (deal) =>
  pickNumber(deal?.dealAchievedAmount, deal?.totalParticipationAmount, deal?.collectedAmount);

const statusClass = (status) => {
  const value = String(status || "").toUpperCase();
  if (value.includes("NOTYET")) return "open";
  if (value.includes("CLOSED")) return "closed";
  return "neutral";
};

const AdminAICreatedDealsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "all";
  const [summary, setSummary] = useState({
    allDeals: 0,
    regularDeals: 0,
    activeDeals: 0,
    closedDeals: 0,
    testDeals: 0,
  });
  const [dealTab, setDealTab] = useState(initialTab);
  const [deals, setDeals] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState({ dealId: "", dealName: "" });
  const [expandedDealId, setExpandedDealId] = useState(null);
  const [participantsByDeal, setParticipantsByDeal] = useState({});
  const [participantsLoadingId, setParticipantsLoadingId] = useState(null);

  const loadSummary = async () => {
    try {
      const data = responseData(await getRegisteredUsersSummary());
      setSummary({
        allDeals: pickNumber(data.allDealsCreatedCount),
        regularDeals: pickNumber(data.regularDealsCount),
        activeDeals: pickNumber(data.activeDealsCount),
        closedDeals: pickNumber(data.closedDealsCount),
        testDeals: pickNumber(data.testDealsCount),
      });
    } catch {
      setSummary({ allDeals: 0, regularDeals: 0, activeDeals: 0, closedDeals: 0, testDeals: 0 });
    }
  };

  const loadDeals = async (nextPage = page, tab = dealTab, filters = search) => {
    setLoading(true);
    setError("");
    try {
      const data = responseData(await getAdminAICreatedDeals(nextPage, pageSize, tab, filters));
      setDeals(data.deals || []);
      setPage(pickNumber(data.pageNo, nextPage) || 1);
      setTotalCount(pickNumber(data.totalCount));
      setDealTab(data.dealView || tab);
    } catch {
      setDeals([]);
      setError("Failed to load created deals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  useEffect(() => {
    const tab = searchParams.get("tab") || "all";
    if (dealTabMeta[tab] && tab !== dealTab) {
      setDealTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    loadDeals(1, dealTab, search);
    setExpandedDealId(null);
  }, [dealTab]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const tabCount = useMemo(
    () => ({
      all: summary.allDeals,
      regular: summary.regularDeals,
      active: summary.activeDeals,
      closed: summary.closedDeals,
      test: summary.testDeals,
    }),
    [summary]
  );

  const currentTab = dealTabMeta[dealTab] || dealTabMeta.all;
  const currentCount = tabCount[dealTab] ?? totalCount;

  const toggleParticipants = async (deal) => {
    const dealId = deal.dealId;
    if (expandedDealId === dealId) {
      setExpandedDealId(null);
      return;
    }
    setExpandedDealId(dealId);
    if (participantsByDeal[dealId]?.length) {
      return;
    }
    setParticipantsLoadingId(dealId);
    try {
      const data = responseData(await getAdminAICreatedDealParticipants(dealId));
      setParticipantsByDeal((current) => ({
        ...current,
        [dealId]: data.participants || [],
      }));
    } catch {
      setParticipantsByDeal((current) => ({ ...current, [dealId]: [] }));
    } finally {
      setParticipantsLoadingId(null);
    }
  };

  const submitSearch = (event) => {
    event.preventDefault();
    loadDeals(1, dealTab, search);
  };

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid admin-ai-page">
          <section className="admin-ai-hero admin-ai-hero-glow">
            <div>
              <span className="admin-ai-pill"><FaRobot /> AI Operations</span>
              <h2>{currentTab.label}</h2>
              <p className="admin-ai-subtitle">{currentTab.description}</p>
            </div>
            <strong>Admin / AI Dashboard / {currentTab.label}</strong>
          </section>

          <div className="admin-ai-summary-bar">
            <div className="admin-ai-summary-card admin-ai-summary-card-glow">
              <FaHandshake />
              <div>
                <span>{currentTab.label}</span>
                <strong>{fmtNum(currentCount)}</strong>
              </div>
            </div>
            <button className="admin-ai-close-btn" type="button" onClick={() => navigate("/adminAIDashboard")}>
              <FaArrowLeft /> Back to Dashboard
            </button>
          </div>

          <section className="admin-ai-panel admin-ai-panel-premium">
            <div className="admin-ai-panel-head">
              <div>
                <h5>{currentTab.label}</h5>
                <p>Click a deal row to view lenders who participated from oxy_lenders_accepted_deals.</p>
              </div>
              <span className="admin-ai-count-pill">{fmtNum(totalCount)} deals</span>
            </div>

            <form className="admin-ai-search-grid admin-ai-search-grid-clear" onSubmit={submitSearch}>
              <label>
                Deal ID
                <input
                  value={search.dealId}
                  onChange={(event) => setSearch((current) => ({ ...current, dealId: event.target.value }))}
                  placeholder="1289 or #1289"
                />
              </label>
              <label>
                Deal Name
                <input
                  value={search.dealName}
                  onChange={(event) => setSearch((current) => ({ ...current, dealName: event.target.value }))}
                  placeholder="Search by deal name"
                />
              </label>
              <div className="admin-ai-search-actions">
                <button className="admin-ai-search-btn" type="submit">Search</button>
                <button
                  className="admin-ai-clear-btn"
                  type="button"
                  onClick={() => {
                    const cleared = { dealId: "", dealName: "" };
                    setSearch(cleared);
                    loadDeals(1, dealTab, cleared);
                  }}
                >
                  Clear All
                </button>
              </div>
            </form>

            {error && <div className="admin-ai-empty-state admin-ai-error-text">{error}</div>}
            {loading && <div className="admin-ai-empty-state">Loading deals...</div>}

            {!loading && !error && (
              <div className="admin-ai-advanced-table-wrap">
                <table className="admin-ai-advanced-table admin-ai-created-deals-table">
                  <thead>
                    <tr>
                      <th />
                      <th>Deal ID</th>
                      <th>Deal Name</th>
                      <th>Created Date</th>
                      <th>Tenure</th>
                      <th>Duration</th>
                      <th>Deal Amount</th>
                      <th>Payout Type</th>
                      <th>Status</th>
                      <th className="admin-ai-participant-count-col">Lenders</th>
                      <th className="admin-ai-deal-achieved-col">Deal Achieved Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deals.length === 0 && (
                      <tr>
                        <td colSpan={11} className="admin-ai-empty-state">No deals found for this filter.</td>
                      </tr>
                    )}
                    {deals.map((deal) => {
                      const expanded = expandedDealId === deal.dealId;
                      const participants = participantsByDeal[deal.dealId] || [];
                      return (
                        <React.Fragment key={deal.dealId}>
                          <tr
                            className={`admin-ai-created-deal-row ${expanded ? "expanded" : ""}`}
                            onClick={() => toggleParticipants(deal)}
                          >
                            <td className="admin-ai-expand-cell">
                              {expanded ? <FaChevronUp /> : <FaChevronDown />}
                            </td>
                            <td>
                              <span className="admin-ai-deal-id-highlight">#{deal.dealId}</span>
                            </td>
                            <td>{valueOrDash(deal.dealName)}</td>
                            <td>{formatDate(deal.createdOn)}</td>
                            <td>{formatTenure(deal)}</td>
                            <td>{valueOrDash(deal.duration)}</td>
                            <td>{fmtMoney(deal.dealAmount)}</td>
                            <td>{formatPayoutType(deal)}</td>
                            <td>
                              <span className={`admin-ai-status-pill ${statusClass(deal.status)}`}>
                                {statusLabel(deal.status)}
                              </span>
                            </td>
                            <td className="admin-ai-participant-count-col">
                              <span className="admin-ai-participant-count-badge admin-ai-participant-count-badge--highlight">
                                <FaUsers /> {fmtNum(deal.lendersParticipated)}
                              </span>
                            </td>
                            <td className="admin-ai-deal-achieved-col">
                              <span className="admin-ai-deal-achieved-amount">
                                {fmtMoney(dealAchievedAmount(deal))}
                              </span>
                            </td>
                          </tr>
                          {expanded ? (
                            <tr className="admin-ai-created-deal-participants-row">
                              <td colSpan={11}>
                                <div className="admin-ai-created-deal-participants-wrap">
                                  <div className="admin-ai-created-deal-participants-head">
                                    <strong>
                                      Lenders Participated in Deal{" "}
                                      <span className="admin-ai-deal-id-highlight">#{deal.dealId}</span>
                                    </strong>
                                    <div className="admin-ai-created-deal-participants-meta">
                                      <span className="admin-ai-participant-count-badge admin-ai-participant-count-badge--highlight">
                                        <FaUsers /> {fmtNum(deal.lendersParticipated)} lenders
                                      </span>
                                      <span className="admin-ai-deal-achieved-amount admin-ai-deal-achieved-amount--inline">
                                        Deal Achieved: {fmtMoney(dealAchievedAmount(deal))}
                                      </span>
                                    </div>
                                  </div>
                                  {participantsLoadingId === deal.dealId ? (
                                    <div className="admin-ai-empty-state">Loading participants...</div>
                                  ) : participants.length === 0 ? (
                                    <div className="admin-ai-empty-state">No lender participation found for this deal.</div>
                                  ) : (
                                    <table className="admin-ai-advanced-table admin-ai-participants-table">
                                      <thead>
                                        <tr>
                                          <th>Lender ID</th>
                                          <th>Lender Name</th>
                                          <th>Participated Amount</th>
                                          <th>Updation Amount</th>
                                          <th>Total Participation</th>
                                          <th>ROI</th>
                                          <th>Payout Type</th>
                                          <th>Received On</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {participants.map((participant) => (
                                          <tr key={`${deal.dealId}-${participant.userId}`}>
                                            <td>LR {participant.userId}</td>
                                            <td>{valueOrDash(participant.lenderName)}</td>
                                            <td>{fmtMoney(participant.participatedAmount)}</td>
                                            <td>{fmtMoney(participant.updationAmount)}</td>
                                            <td><strong>{fmtMoney(participant.totalParticipationAmount)}</strong></td>
                                            <td>{valueOrDash(participant.roi)}%</td>
                                            <td>{valueOrDash(participant.payoutTypeLabel || participant.lenderReturnsType)}</td>
                                            <td>{formatDate(participant.receivedOn)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && totalPages > 1 ? (
              <div className="admin-ai-pagination">
                <button type="button" disabled={page <= 1} onClick={() => loadDeals(page - 1, dealTab, search)}>
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button type="button" disabled={page >= totalPages} onClick={() => loadDeals(page + 1, dealTab, search)}>
                  Next
                </button>
              </div>
            ) : null}
          </section>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default AdminAICreatedDealsPage;
