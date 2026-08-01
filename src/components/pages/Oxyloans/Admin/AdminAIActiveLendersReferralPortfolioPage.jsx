import React, { useCallback, useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaDownload,
  FaEnvelope,
  FaEye,
  FaProjectDiagram,
  FaSearch,
  FaSync,
  FaTimes,
  FaUser,
  FaUserFriends,
  FaWhatsapp,
} from "react-icons/fa";
import { saveAs } from "file-saver";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  downloadAdminAIActiveLendersReferralPortfolioExcel,
  getAdminAIActiveLendersReferralPortfolio,
  getAdminAIActiveLendersReferralPortfolioReferees,
  parseAdminAIExportError,
} from "../../../HttpRequest/admin";
import AdminAILenderCampaignModal from "./AdminAILenderCampaignModal";
import {
  inviteSourceMeta,
  RefereeTypeCountBadges,
  SourceTypeBadges,
  splitRefereesByType,
} from "./AdminAIReferralRefereeTypeSplit";
import {
  goBackOrAdminAI,
  goToAdminAIDashboard,
  YEAR_WISE_REFERRALS_PATH,
} from "./adminAINavigation";
import "./AdminAIDashboard.css";

const PAGE_SIZE = 20;
const PORTFOLIO_PATH = "/adminAIActiveLendersReferralPortfolio";
const LENDER_FILTERS = ["all", "withReferrals", "withLentReferrals", "withoutReferrals", "fromReferrers", "noParentReferrer"];
const REFEREE_VIEWS = ["invitedUsers", "registeredUsers"];
const fmtNum = (value) => Number(value || 0).toLocaleString("en-IN");
const fmtMoney = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);
const pickNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const responseData = (payload) => payload?.data || payload || {};
const paidSharePct = (paid, unpaid) => {
  const p = pickNumber(paid);
  const u = pickNumber(unpaid);
  const total = p + u;
  if (total <= 0) return 0;
  return Math.round((p / total) * 100);
};

const emptyTotals = () => ({
  activeLenders: 0,
  withReferrals: 0,
  withLentReferrals: 0,
  withoutReferrals: 0,
  fromReferrers: 0,
  noParentReferrer: 0,
  invitedUsers: 0,
  registeredUsers: 0,
});

const refereeCampaignSegment = (filter) =>
  (filter === "registeredUsers" ? "activeLenderRegisteredReferees" : "activeLenderInvitedReferees");

const LENDER_AUDIENCE_CAMPAIGNS = {
  fromReferrers: {
    segment: "activeLenderPortfolioFromReferrers",
    label: "Active Lender Portfolio — From Referrers",
    countKey: "fromReferrers",
  },
  noParentReferrer: {
    segment: "activeLenderPortfolioDirectLenders",
    label: "Active Lender Portfolio — Direct Lenders",
    countKey: "noParentReferrer",
  },
  withReferrals: {
    segment: "activeLenderPortfolioActiveReferrals",
    label: "Active Lender Portfolio — Active Referrals",
    countKey: "withReferrals",
  },
  withLentReferrals: {
    segment: "activeLenderPortfolioLentReferrals",
    label: "Active Lender Portfolio — Lent Referral Earners",
    countKey: "withLentReferrals",
  },
  withoutReferrals: {
    segment: "activeLenderPortfolioNotReferring",
    label: "Active Lender Portfolio — Not Actively Referring",
    countKey: "withoutReferrals",
  },
};

const AdminAIActiveLendersReferralPortfolioPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get("filter") || "all";
  const isRefereeView = REFEREE_VIEWS.includes(filterParam);
  const filter = LENDER_FILTERS.includes(filterParam) ? filterParam : isRefereeView ? filterParam : "all";
  const refereeStatus = filter === "registeredUsers" ? "Registered" : "Invited";

  const [rows, setRows] = useState([]);
  const [topReferrers, setTopReferrers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totals, setTotals] = useState(emptyTotals());
  const [lenderIdSearch, setLenderIdSearch] = useState(searchParams.get("lenderId") || "");
  const [mobileSearch, setMobileSearch] = useState(searchParams.get("mobile") || "");
  const [appliedSearch, setAppliedSearch] = useState(searchParams.get("search") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportingReferrerId, setExportingReferrerId] = useState(null);
  const [campaignState, setCampaignState] = useState(null);

  const buildSearchValue = (lenderIdValue, mobileValue) => {
    const id = String(lenderIdValue || "").trim();
    const mobile = String(mobileValue || "").trim();
    if (id) return id;
    return mobile;
  };

  const loadPortfolio = useCallback(async (nextPage = 1, nextFilter = filter, nextSearch = appliedSearch) => {
    setLoading(true);
    setError("");
    try {
      const refereeMode = REFEREE_VIEWS.includes(nextFilter);
      const data = responseData(
        refereeMode
          ? await getAdminAIActiveLendersReferralPortfolioReferees(nextPage, PAGE_SIZE, {
              status: nextFilter === "registeredUsers" ? "Registered" : "Invited",
              search: nextSearch,
              groupBy: "referrer",
            })
          : await getAdminAIActiveLendersReferralPortfolio(nextPage, PAGE_SIZE, {
              filter: nextFilter,
              search: nextSearch,
            })
      );
      setRows(Array.isArray(data.rows) ? data.rows : []);
      setTopReferrers(refereeMode && Array.isArray(data.topReferrers) ? data.topReferrers : []);
      setPage(pickNumber(data.pageNo) || nextPage);
      setTotalCount(pickNumber(data.totalCount));
      setTotals({ ...emptyTotals(), ...(data.totals || {}) });
    } catch (requestError) {
      setRows([]);
      setTopReferrers([]);
      setTotalCount(0);
      setError(requestError?.response?.data?.message || requestError?.message || "Failed to load referral portfolio.");
    } finally {
      setLoading(false);
    }
  }, [filter, appliedSearch]);

  useEffect(() => {
    loadPortfolio(1, filter, appliedSearch);
  }, [filter, appliedSearch, loadPortfolio]);

  const updateParams = (patch) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value == null || value === "") next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  const selectFilter = (nextFilter) => {
    updateParams({ filter: nextFilter });
    setPage(1);
  };

  const applySearch = () => {
    const id = lenderIdSearch.trim();
    const mobile = mobileSearch.trim();
    const value = buildSearchValue(id, mobile);
    setAppliedSearch(value);
    updateParams({
      search: value || null,
      lenderId: id || null,
      mobile: mobile || null,
    });
    setPage(1);
  };

  const clearSearch = () => {
    setLenderIdSearch("");
    setMobileSearch("");
    setAppliedSearch("");
    updateParams({ search: null, lenderId: null, mobile: null });
    setPage(1);
  };

  const openTreeMapPage = (lenderId) => {
    navigate(`/adminAILentReferralTreeMap?lenderId=${lenderId}&returnTo=${encodeURIComponent("/adminAIActiveLendersReferralPortfolio")}`, {
      state: { from: "/adminAIActiveLendersReferralPortfolio" },
    });
  };

  const openLentUsersPage = (lenderId) => {
    navigate(`/adminAILentUsersDetail?lenderId=${lenderId}&returnTo=${encodeURIComponent("/adminAIActiveLendersReferralPortfolio")}`);
  };

  const openLenderProfilePage = (row) => {
    const lenderId = pickNumber(row?.lenderId);
    if (!lenderId) return;
    const returnTo = `${PORTFOLIO_PATH}${filter && filter !== "all" ? `?filter=${filter}` : ""}`;
    const params = new URLSearchParams({
      lenderId: String(lenderId),
      view: "profile",
      returnTo,
    });
    navigate(`/adminAIDeals?${params.toString()}`, {
      state: {
        lender: {
          lenderId,
          name: row?.name || "",
          userCode: row?.lenderCode || `LR${lenderId}`,
          email: row?.email || "",
          mobileNumber: row?.mobileNumber || "",
        },
      },
    });
  };

  const openReferrerListPage = (row) => {
    const referrerId = pickNumber(row?.referrerId);
    if (!referrerId) return;
    const returnTo = `${PORTFOLIO_PATH}?filter=${filter}`;
    navigate(
      `/adminAIReferrerRefereesDetail?referrerId=${referrerId}&filter=${filter}&returnTo=${encodeURIComponent(returnTo)}`,
      { state: { referrerRow: row } }
    );
  };

  const openReferrerProfile = (row) => {
    const referrerId = pickNumber(row?.referrerId);
    if (!referrerId) return;
    const code = row?.referrerCode || `LR${referrerId}`;
    const returnTo = `${PORTFOLIO_PATH}?filter=${filter}`;
    const params = new URLSearchParams({
      userId: String(referrerId),
      view: "referralRegistered",
      label: `Referrer ${code}`,
      returnTo,
    });
    navigate(`/adminAIUserProfile?${params.toString()}`);
  };

  const downloadExcel = async (exportFilter = filter, referrerId = null, referrerCode = "") => {
    const scopedReferrerId = pickNumber(referrerId) || null;
    setExporting(true);
    if (scopedReferrerId) setExportingReferrerId(scopedReferrerId);
    setError("");
    try {
      const response = await downloadAdminAIActiveLendersReferralPortfolioExcel(exportFilter, {
        referrerId: scopedReferrerId || undefined,
      });
      const blob = response?.data;
      if (!blob) throw new Error("Empty export response.");
      if (blob.type && String(blob.type).includes("json")) {
        const text = await blob.text();
        let message = "Export failed.";
        try {
          message = JSON.parse(text)?.errorMessage || message;
        } catch {
          message = text || message;
        }
        throw new Error(message);
      }
      const slug = REFEREE_VIEWS.includes(exportFilter)
        ? (exportFilter === "registeredUsers" ? "registered-users" : "invited-users")
        : exportFilter;
      const referrerSlug = scopedReferrerId
        ? `-${String(referrerCode || `LR${scopedReferrerId}`).replace(/[^a-zA-Z0-9_-]/g, "")}`
        : "";
      saveAs(
        blob,
        `active-lenders-referral-portfolio-${slug}${referrerSlug}-${new Date().toISOString().slice(0, 10)}.xlsx`
      );
    } catch (requestError) {
      const parsed = await parseAdminAIExportError(requestError);
      setError(parsed || requestError?.message || "Failed to download Excel.");
    } finally {
      setExporting(false);
      setExportingReferrerId(null);
    }
  };

  const openCardCampaign = (nextFilter, channel) => {
    const lenderAudience = LENDER_AUDIENCE_CAMPAIGNS[nextFilter];
    if (lenderAudience) {
      setCampaignState({
        segment: lenderAudience.segment,
        segmentLabel: lenderAudience.label,
        recipientCount: pickNumber(totals[lenderAudience.countKey]),
        channel: channel || "email",
      });
      return;
    }
    const isRegistered = nextFilter === "registeredUsers";
    const count = isRegistered ? totals.registeredUsers : totals.invitedUsers;
    setCampaignState({
      segment: refereeCampaignSegment(nextFilter),
      segmentLabel: isRegistered
        ? "Active Lender Portfolio — Registered Users"
        : "Active Lender Portfolio — Invited Users",
      recipientCount: pickNumber(count),
      channel: channel || "email",
    });
  };

  const renderLenderAudienceCard = (key, className, label, count, description, title) => {
    const active = filter === key;
    return (
      <div
        className={`${className} admin-ai-ref-portfolio-total-card is-highlight${active ? " is-active" : ""}`}
        role="button"
        tabIndex={0}
        onClick={() => selectFilter(key)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectFilter(key);
          }
        }}
        title={title}
      >
        <small>{label}</small>
        <strong>{fmtNum(count)}</strong>
        <em>{description}</em>
        {active ? (
          <div
            className="admin-ai-ref-portfolio-card-campaigns"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="admin-ai-ref-portfolio-campaign-btn"
              title={`Email campaign for ${label}`}
              onClick={() => openCardCampaign(key, "email")}
            >
              <FaEnvelope /> Email
            </button>
            <button
              type="button"
              className="admin-ai-ref-portfolio-campaign-btn is-whatsapp"
              title={`WhatsApp campaign for ${label}`}
              onClick={() => openCardCampaign(key, "whatsapp")}
            >
              <FaWhatsapp /> WhatsApp
            </button>
            <button
              type="button"
              className="admin-ai-ref-portfolio-campaign-btn is-excel"
              disabled={exporting}
              title={`Download Excel for ${label}`}
              onClick={() => downloadExcel(key)}
            >
              <FaDownload /> {exporting ? "..." : "Excel"}
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  const openReferrerCampaign = (row, channel) => {
    const referrerId = pickNumber(row?.referrerId);
    if (!referrerId) return;
    const isRegistered = filter === "registeredUsers";
    const base = refereeCampaignSegment(filter);
    const code = row.referrerCode || `LR${referrerId}`;
    const name = row.referrerName ? `${row.referrerName} · ${code}` : code;
    setCampaignState({
      segment: `${base}_r${referrerId}`,
      segmentLabel: isRegistered
        ? `Registered users of ${name}`
        : `Invited users of ${name}`,
      recipientCount: pickNumber(row.refereeCount),
      channel: channel || "email",
    });
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const listLabel = isRefereeView
    ? (filter === "registeredUsers" ? "referrers with registered users" : "referrers with invited users")
    : "lenders";
  const topTitle = filter === "registeredUsers" ? "Top registered" : "Top invited";

  const renderRefereeAudienceCard = (key, label, count, description) => {
    const active = filter === key;
    return (
      <div
        className={`${key === "invitedUsers" ? "invited" : "registered"} admin-ai-ref-portfolio-total-card is-highlight${active ? " is-active" : ""}`}
        role="button"
        tabIndex={0}
        onClick={() => selectFilter(key)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectFilter(key);
          }
        }}
        title={`Show ${label} referred by these active lenders`}
      >
        <small>{label.toUpperCase()}</small>
        <strong>{fmtNum(count)}</strong>
        <em>{description}</em>
        {active ? (
          <div
            className="admin-ai-ref-portfolio-card-campaigns"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="admin-ai-ref-portfolio-campaign-btn"
              title={`Email campaign for ${label}`}
              onClick={() => openCardCampaign(key, "email")}
            >
              <FaEnvelope /> Email
            </button>
            <button
              type="button"
              className="admin-ai-ref-portfolio-campaign-btn is-whatsapp"
              title={`WhatsApp campaign for ${label}`}
              onClick={() => openCardCampaign(key, "whatsapp")}
            >
              <FaWhatsapp /> WhatsApp
            </button>
            <button
              type="button"
              className="admin-ai-ref-portfolio-campaign-btn is-excel"
              disabled={exporting}
              title={`Download Excel for ${label}`}
              onClick={() => downloadExcel(key)}
            >
              <FaDownload /> {exporting ? "..." : "Excel"}
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="admin-ai-page-shell">
      <div className="admin-ai-dashboard-wrap admin-ai-ref-portfolio-page admin-ai-ref-portfolio-page--official admin-ai-ref-portfolio-page--corporate">
        <header className="admin-ai-ref-portfolio-head">
          <div>
            <div className="admin-ai-referral-back-row">
              <button
                type="button"
                className="admin-ai-referral-back"
                onClick={() => goToAdminAIDashboard(navigate)}
                title="Go to main Admin AI Dashboard"
              >
                <FaArrowLeft /> Back to Admin AI Dashboard
              </button>
              <button
                type="button"
                className="admin-ai-referral-back admin-ai-referral-back--secondary"
                onClick={() => goBackOrAdminAI(navigate, YEAR_WISE_REFERRALS_PATH)}
                title="Go to YearWise referrals"
              >
                YearWise referrals
              </button>
            </div>
            <h2>All Active Lenders Referral Portfolio</h2>
            <p>Official active-lender referral report · earnings summary · Lent user & tree map access</p>
          </div>
          <div className="admin-ai-ref-portfolio-head-actions">
            <button type="button" className="admin-ai-search-btn" disabled={exporting} onClick={() => downloadExcel(filter)}>
              <FaDownload /> {exporting ? "Exporting..." : "Download Excel"}
            </button>
            <button
              type="button"
              className="admin-ai-search-btn"
              disabled={loading}
              onClick={() => loadPortfolio(page, filter, appliedSearch)}
              title="Refresh referral portfolio"
            >
              <FaSync /> {loading ? "..." : "Refresh"}
            </button>
            <button
              type="button"
              className="admin-ai-close-btn"
              onClick={() => goToAdminAIDashboard(navigate)}
              title="Close and return to Admin AI Dashboard"
            >
              <FaTimes /> Close
            </button>
          </div>
        </header>

        <section className="admin-ai-ref-portfolio-totals admin-ai-ref-portfolio-totals--highlight admin-ai-ref-portfolio-totals--eight">
          <button
            type="button"
            className={`all admin-ai-ref-portfolio-total-card${filter === "all" ? " is-active" : ""}`}
            onClick={() => selectFilter("all")}
            title="Show all active lenders"
          >
            <small>ACTIVE LENDERS</small>
            <strong>{fmtNum(totals.activeLenders)}</strong>
            <em>Total active lenders in portfolio</em>
          </button>
          {renderLenderAudienceCard(
            "fromReferrers",
            "from",
            "FROM REFERRERS",
            totals.fromReferrers,
            "Came through a parent referrer",
            "Show lenders who came through a referrer"
          )}
          {renderLenderAudienceCard(
            "noParentReferrer",
            "direct",
            "DIRECT LENDERS",
            totals.noParentReferrer,
            "Joined with no parent referrer",
            "Show direct / organic lenders with no parent referrer"
          )}
          {renderLenderAudienceCard(
            "withReferrals",
            "with",
            "ACTIVE REFERRALS",
            totals.withReferrals,
            "Lenders who actively referred at least one user",
            "Show lenders who actively referred at least one user"
          )}
          {renderLenderAudienceCard(
            "withLentReferrals",
            "lent-earned",
            "LENT REFERRAL EARNERS",
            totals.withLentReferrals,
            "Distinct referrers with Lent or Disbursed status",
            "Show all referrers with at least one Lent or Disbursed referral"
          )}
          {renderLenderAudienceCard(
            "withoutReferrals",
            "without",
            "NOT ACTIVELY REFERRING",
            totals.withoutReferrals,
            "Lenders with zero referrals made",
            "Show lenders not actively referring anyone"
          )}
          {renderRefereeAudienceCard(
            "invitedUsers",
            "Invited Users",
            totals.invitedUsers,
            "Invited via referral · not registered yet"
          )}
          {renderRefereeAudienceCard(
            "registeredUsers",
            "Registered Users",
            totals.registeredUsers,
            "Registered via referral · not participated yet"
          )}
        </section>

        <section className="admin-ai-ref-portfolio-toolbar admin-ai-ref-portfolio-toolbar--official">
          <div className="admin-ai-ref-portfolio-filters">
            {[
              { key: "all", label: "All active" },
              { key: "fromReferrers", label: "From referrers" },
              { key: "noParentReferrer", label: "Direct lenders" },
              { key: "withReferrals", label: "Active referrals" },
              { key: "withLentReferrals", label: "Lent referral earners" },
              { key: "withoutReferrals", label: "Not actively referring" },
              { key: "invitedUsers", label: "Invited users" },
              { key: "registeredUsers", label: "Registered users" },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                className={filter === item.key ? "is-active" : ""}
                onClick={() => selectFilter(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="admin-ai-ref-portfolio-search admin-ai-ref-portfolio-search--split">
            <label>
              <span>{isRefereeView ? "Referee / Referrer ID" : "Lender ID"}</span>
              <input
                value={lenderIdSearch}
                onChange={(event) => setLenderIdSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") applySearch();
                }}
                placeholder={isRefereeView ? "e.g. referee or LR id" : "e.g. 34447 or LR34447"}
              />
            </label>
            <label>
              <span>Mobile number</span>
              <input
                value={mobileSearch}
                onChange={(event) => setMobileSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") applySearch();
                }}
                placeholder="e.g. 9290290561"
              />
            </label>
            <button type="button" className="admin-ai-search-btn" onClick={applySearch}>
              <FaSearch /> Search
            </button>
            <button type="button" className="admin-ai-reset-btn" onClick={clearSearch}>
              Clear
            </button>
          </div>
        </section>

        {error ? <div className="alert alert-danger">{error}</div> : null}

        {loading ? <div className="admin-ai-empty-state">Loading active lenders referral portfolio...</div> : null}
        {!loading && isRefereeView ? (
          <section className={`admin-ai-ref-portfolio-list admin-ai-ref-portfolio-list--full admin-ai-ref-portfolio-list--referee-official ${filter === "registeredUsers" ? "is-registered-view" : "is-invited-view"}`}>
            {topReferrers.length ? (
              <div className="admin-ai-ref-portfolio-top-strip is-highlighted">
                <div className="admin-ai-ref-portfolio-top-strip-head">
                  <strong>{topTitle}</strong>
                  <span>
                    Ranked by {filter === "registeredUsers" ? "registered" : "invited"} count · top 10 referrers
                  </span>
                </div>
                <div className="admin-ai-ref-portfolio-top-strip-list">
                  {topReferrers.map((item) => {
                    const rank = pickNumber(item.rank) || 1;
                    const rankClass = rank <= 3 ? `is-rank-${rank}` : "is-rank-rest";
                    return (
                      <button
                        type="button"
                        key={`top-${item.referrerId}`}
                        className={`admin-ai-ref-portfolio-top-chip is-highlight ${rankClass}`}
                        title={`Open profile for ${item.referrerCode || item.referrerId}`}
                        onClick={() => openReferrerProfile(item)}
                      >
                        <div className="admin-ai-ref-portfolio-top-chip-rank">
                          <em>#{rank}</em>
                          <b>{fmtNum(item.refereeCount)}</b>
                        </div>
                        <strong title={valueOrDash(item.referrerName || item.referrerCode)}>
                          {valueOrDash(item.referrerName || item.referrerCode)}
                        </strong>
                        <small>{valueOrDash(item.referrerCode)}</small>
                        <SourceTypeBadges
                          inviteCount={item.inviteCount}
                          bulkInviteCount={item.bulkInviteCount}
                          partnerCount={item.partnerCount}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="admin-ai-ref-portfolio-list-head">
              <strong>{fmtNum(totalCount)} {listLabel}</strong>
              <span>
                Grouped by referrer · Status: {refereeStatus} · scoped to {fmtNum(totals.activeLenders)} active lenders · Page {page} of {totalPages}
              </span>
            </div>

            <div className="admin-ai-ref-portfolio-referrer-groups">
              {rows.map((row) => {
                const referrerId = pickNumber(row.referrerId);
                const referees = Array.isArray(row.referees) ? row.referees : [];
                const previewNames = (row.refereeNamesPreview
                  || referees
                    .slice(0, 3)
                    .map((r) => r.refereeName || r.refereeEmail || r.refereeMobileNumber)
                    .filter(Boolean)
                    .join(", "));
                const previewExtra = Math.max(0, pickNumber(row.refereeCount) - 3);
                const statusVerb = filter === "registeredUsers" ? "registered" : "invited";
                const splitByType = filter === "registeredUsers";
                const typeSplit = splitByType ? splitRefereesByType(referees) : null;
                let inviteCount = pickNumber(row.inviteCount);
                let bulkInviteCount = pickNumber(row.bulkInviteCount);
                let partnerCount = pickNumber(row.partnerCount);
                if (inviteCount + bulkInviteCount + partnerCount <= 0 && referees.length) {
                  inviteCount = 0;
                  bulkInviteCount = 0;
                  partnerCount = 0;
                  referees.forEach((referee) => {
                    const kind = inviteSourceMeta(referee.source).kind;
                    if (kind === "bulk") bulkInviteCount += 1;
                    else if (kind === "partner") partnerCount += 1;
                    else inviteCount += 1;
                  });
                }
                return (
                  <article key={referrerId || row.referrerCode} className="admin-ai-ref-portfolio-referrer-group">
                    <div className="admin-ai-ref-portfolio-referrer-group-head">
                      <div className="admin-ai-ref-portfolio-referrer-group-expand">
                        <div className="admin-ai-ref-portfolio-referrer-group-who">
                          <small>Referrer</small>
                          <button
                            type="button"
                            className="admin-ai-ref-portfolio-referrer-profile-btn"
                            title={`Open profile for ${row.referrerCode || referrerId}`}
                            onClick={() => openReferrerProfile(row)}
                          >
                            <strong>
                              {valueOrDash(row.referrerName)}
                              <span className="admin-ai-ref-portfolio-referrer-code">{valueOrDash(row.referrerCode)}</span>
                            </strong>
                            <span className="admin-ai-ref-portfolio-referrer-profile-hint">
                              <FaUser /> View profile
                            </span>
                          </button>
                          <SourceTypeBadges
                            inviteCount={inviteCount}
                            bulkInviteCount={bulkInviteCount}
                            partnerCount={partnerCount}
                          />
                          {typeSplit ? (
                            <RefereeTypeCountBadges
                              lenders={typeSplit.lenders.length}
                              borrowers={typeSplit.borrowers.length}
                              other={typeSplit.other.length}
                            />
                          ) : null}
                          <em className="admin-ai-ref-portfolio-referrer-preview">
                            <b className="admin-ai-ref-portfolio-preview-count">{fmtNum(row.refereeCount)}</b>
                            {" "}{statusVerb}
                            {previewNames ? ` · ${previewNames}` : ""}
                            {previewExtra > 0 ? ` +${fmtNum(previewExtra)} more` : ""}
                          </em>
                        </div>
                        <button
                          type="button"
                          className="admin-ai-ref-portfolio-referrer-group-meta"
                          title={`Show ${statusVerb} list for ${row.referrerCode || referrerId}`}
                          onClick={() => openReferrerListPage(row)}
                        >
                          <b>{fmtNum(row.refereeCount)}</b>
                          <span>Show list</span>
                        </button>
                      </div>
                      <div className="admin-ai-ref-portfolio-referrer-group-actions">
                        <button
                          type="button"
                          className="admin-ai-ref-portfolio-campaign-btn"
                          title={`Email campaign for ${row.referrerCode || referrerId}`}
                          onClick={() => openReferrerCampaign(row, "email")}
                        >
                          <FaEnvelope /> Email
                        </button>
                        <button
                          type="button"
                          className="admin-ai-ref-portfolio-campaign-btn is-whatsapp"
                          title={`WhatsApp campaign for ${row.referrerCode || referrerId}`}
                          onClick={() => openReferrerCampaign(row, "whatsapp")}
                        >
                          <FaWhatsapp /> WhatsApp
                        </button>
                        <button
                          type="button"
                          className="admin-ai-ref-portfolio-campaign-btn is-excel"
                          disabled={exporting && exportingReferrerId === referrerId}
                          title={`Download Excel for ${row.referrerCode || referrerId}`}
                          onClick={() => downloadExcel(filter, referrerId, row.referrerCode)}
                        >
                          <FaDownload /> {exporting && exportingReferrerId === referrerId ? "..." : "Excel"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
              {!rows.length ? (
                <div className="admin-ai-empty-state">
                  <FaUserFriends />
                  <p>No {listLabel} found for active lenders with this search.</p>
                </div>
              ) : null}
            </div>
            <div className="admin-ai-referral-users-pager">
              <button type="button" disabled={page <= 1 || loading} onClick={() => loadPortfolio(page - 1)}>Previous</button>
              <span>{page} / {totalPages}</span>
              <button type="button" disabled={page >= totalPages || loading} onClick={() => loadPortfolio(page + 1)}>Next</button>
            </div>
          </section>
        ) : null}

        {!loading && !isRefereeView ? (
          <section className="admin-ai-ref-portfolio-list admin-ai-ref-portfolio-list--full">
            <div className="admin-ai-ref-portfolio-list-head">
              <strong>{fmtNum(totalCount)} lenders</strong>
              <span>Page {page} of {totalPages}</span>
            </div>
            <div className="admin-ai-ref-portfolio-rows admin-ai-ref-portfolio-rows--grid">
              {rows.map((row) => {
                const paidPct = paidSharePct(row.amountPaid, row.amountNotPaid);
                const unpaidPct = Math.max(0, 100 - paidPct);
                return (
                  <article key={row.lenderId} className="admin-ai-ref-portfolio-card admin-ai-ref-portfolio-card--mock">
                    <div className="admin-ai-ref-portfolio-mock-head">
                      <div className="admin-ai-ref-portfolio-mock-who">
                        <small>Lender Portfolio</small>
                        <div className="admin-ai-ref-portfolio-mock-name-row">
                          <strong>{valueOrDash(row.name)}</strong>
                          <span className="admin-ai-ref-portfolio-referred-by">
                            <small>Referred by</small>
                            <b>
                              {valueOrDash(row.referredByName || row.referredBy?.referrerName)}
                              {(row.referredByCode || row.referredBy?.referrerCode)
                                ? ` · ${row.referredByCode || row.referredBy?.referrerCode}`
                                : ""}
                            </b>
                          </span>
                        </div>
                        <div className="admin-ai-ref-portfolio-mock-ids">
                          <span>ID: {valueOrDash(row.lenderId)}</span>
                          <span>Ref: {valueOrDash(row.lenderCode)}</span>
                        </div>
                      </div>
                      <div className="admin-ai-ref-portfolio-mock-actions">
                        <button
                          type="button"
                          className="admin-ai-ref-portfolio-icon-btn"
                          onClick={() => openLenderProfilePage(row)}
                          title="Open lender personal details"
                        >
                          <FaUser />
                          <em>Profile</em>
                        </button>
                        <button
                          type="button"
                          className="admin-ai-ref-portfolio-icon-btn is-lent"
                          onClick={() => openLentUsersPage(row.lenderId)}
                          title="View Lent user details"
                        >
                          <FaEye />
                          <em>{fmtNum(row.lentCount)} Lent</em>
                        </button>
                        <button
                          type="button"
                          className="admin-ai-ref-portfolio-icon-btn is-tree"
                          onClick={() => openTreeMapPage(row.lenderId)}
                          title="Open tree map"
                        >
                          <FaProjectDiagram />
                          <em>Tree</em>
                        </button>
                      </div>
                    </div>

                    <div className="admin-ai-ref-portfolio-mock-folio">
                      <p className="admin-ai-ref-portfolio-mock-folio-title">Earnings Folio</p>
                      <div className="admin-ai-ref-portfolio-mock-folio-grid">
                        <div className="admin-ai-ref-portfolio-mock-earn-card">
                          <small>Earnings Overview</small>
                          <strong>{fmtMoney(row.totalEarned)}</strong>
                          <div className="admin-ai-ref-portfolio-mock-pie-row">
                            <span
                              className="admin-ai-ref-portfolio-mock-pie"
                              style={{
                                background: `conic-gradient(#16a34a 0 ${paidPct}%, #b45309 ${paidPct}% 100%)`,
                              }}
                              aria-hidden="true"
                            />
                            <div className="admin-ai-ref-portfolio-mock-pie-legend">
                              <em className="paid">Paid ({paidPct}%)</em>
                              <em className="unpaid">Unpaid ({unpaidPct}%)</em>
                            </div>
                          </div>
                        </div>
                        <div className="admin-ai-ref-portfolio-mock-lent-card">
                          <small>Lent Amt</small>
                          <strong>{fmtMoney(row.lentUsersParticipationAmount)}</strong>
                          <div className="admin-ai-ref-portfolio-mock-lent-split">
                            <em className="paid">Paid: {fmtMoney(row.amountPaid)}</em>
                            <em className="unpaid">Unpaid: {fmtMoney(row.amountNotPaid)}</em>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="admin-ai-ref-portfolio-mock-refs">
                      <em className="lent"><b>{fmtNum(row.lentCount)}</b> Lent</em>
                      <em className="reg"><b>{fmtNum(row.registeredCount)}</b> Registered</em>
                      <em className="invited"><b>{fmtNum(row.invitedCount)}</b> Invited</em>
                      <em className="total"><b>{fmtNum(row.referralTotal)}</b> Total</em>
                    </div>
                  </article>
                );
              })}
              {!rows.length ? (
                <div className="admin-ai-empty-state">
                  <FaUserFriends />
                  <p>No active lenders found for this filter/search.</p>
                </div>
              ) : null}
            </div>
            <div className="admin-ai-referral-users-pager">
              <button type="button" disabled={page <= 1 || loading} onClick={() => loadPortfolio(page - 1)}>Previous</button>
              <span>{page} / {totalPages}</span>
              <button type="button" disabled={page >= totalPages || loading} onClick={() => loadPortfolio(page + 1)}>Next</button>
            </div>
          </section>
        ) : null}
      </div>

      <AdminAILenderCampaignModal
        open={Boolean(campaignState)}
        onClose={() => setCampaignState(null)}
        segment={campaignState?.segment}
        segmentLabel={campaignState?.segmentLabel}
        recipientCount={campaignState?.recipientCount}
        initialChannel={campaignState?.channel}
        onSent={(result, meta) => {
          if (meta?.dryRun) return;
          setCampaignState(null);
        }}
      />
    </div>
  );
};

export default AdminAIActiveLendersReferralPortfolioPage;
