import React, { useCallback, useEffect, useState } from "react";
import { FaArrowLeft, FaDownload, FaEye, FaProjectDiagram, FaSearch, FaSync, FaTimes, FaUser, FaUserFriends } from "react-icons/fa";
import { saveAs } from "file-saver";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  downloadAdminAIActiveLendersReferralPortfolioExcel,
  getAdminAIActiveLendersReferralPortfolio,
  parseAdminAIExportError,
} from "../../../HttpRequest/admin";
import {
  goBackOrAdminAI,
  goToAdminAIDashboard,
  YEAR_WISE_REFERRALS_PATH,
} from "./adminAINavigation";
import "./AdminAIDashboard.css";

const PAGE_SIZE = 20;
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

const AdminAIActiveLendersReferralPortfolioPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = ["all", "withReferrals", "withoutReferrals", "fromReferrers", "noParentReferrer"].includes(searchParams.get("filter"))
    ? searchParams.get("filter")
    : "all";

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totals, setTotals] = useState({
    activeLenders: 0,
    withReferrals: 0,
    withLentReferrals: 0,
    withoutReferrals: 0,
    fromReferrers: 0,
    noParentReferrer: 0,
  });
  const [lenderIdSearch, setLenderIdSearch] = useState(searchParams.get("lenderId") || "");
  const [mobileSearch, setMobileSearch] = useState(searchParams.get("mobile") || "");
  const [appliedSearch, setAppliedSearch] = useState(searchParams.get("search") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [openProfileId, setOpenProfileId] = useState(null);

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
      const data = responseData(await getAdminAIActiveLendersReferralPortfolio(nextPage, PAGE_SIZE, {
        filter: nextFilter,
        search: nextSearch,
      }));
      setRows(Array.isArray(data.rows) ? data.rows : []);
      setPage(pickNumber(data.pageNo) || nextPage);
      setTotalCount(pickNumber(data.totalCount));
      setTotals(data.totals || {
        activeLenders: 0,
        withReferrals: 0,
        withLentReferrals: 0,
        withoutReferrals: 0,
        fromReferrers: 0,
        noParentReferrer: 0,
      });
    } catch (requestError) {
      setRows([]);
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

  const downloadExcel = async () => {
    setExporting(true);
    setError("");
    try {
      const response = await downloadAdminAIActiveLendersReferralPortfolioExcel(filter);
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
      saveAs(blob, `active-lenders-referral-portfolio-${filter}-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (requestError) {
      const parsed = await parseAdminAIExportError(requestError);
      setError(parsed || requestError?.message || "Failed to download Excel.");
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

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
            <button type="button" className="admin-ai-search-btn" disabled={exporting} onClick={downloadExcel}>
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

        <section className="admin-ai-ref-portfolio-totals admin-ai-ref-portfolio-totals--highlight admin-ai-ref-portfolio-totals--five">
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
          <button
            type="button"
            className={`from admin-ai-ref-portfolio-total-card is-highlight${filter === "fromReferrers" ? " is-active" : ""}`}
            onClick={() => selectFilter("fromReferrers")}
            title="Show lenders who came through a referrer"
          >
            <small>FROM REFERRERS</small>
            <strong>{fmtNum(totals.fromReferrers)}</strong>
            <em>Came through a parent referrer</em>
          </button>
          <button
            type="button"
            className={`direct admin-ai-ref-portfolio-total-card is-highlight${filter === "noParentReferrer" ? " is-active" : ""}`}
            onClick={() => selectFilter("noParentReferrer")}
            title="Show direct / organic lenders with no parent referrer"
          >
            <small>DIRECT LENDERS</small>
            <strong>{fmtNum(totals.noParentReferrer)}</strong>
            <em>Joined with no parent referrer</em>
          </button>
          <button
            type="button"
            className={`with admin-ai-ref-portfolio-total-card is-highlight${filter === "withReferrals" ? " is-active" : ""}`}
            onClick={() => selectFilter("withReferrals")}
            title="Show lenders who actively referred at least one user"
          >
            <small>ACTIVE REFERRALS</small>
            <strong>{fmtNum(totals.withReferrals)}</strong>
            <em>Lenders who actively referred at least one user</em>
          </button>
          <button
            type="button"
            className={`without admin-ai-ref-portfolio-total-card${filter === "withoutReferrals" ? " is-active" : ""}`}
            onClick={() => selectFilter("withoutReferrals")}
            title="Show lenders not actively referring anyone"
          >
            <small>NOT ACTIVELY REFERRING</small>
            <strong>{fmtNum(totals.withoutReferrals)}</strong>
            <em>Lenders with zero referrals made</em>
          </button>
        </section>

        <section className="admin-ai-ref-portfolio-toolbar admin-ai-ref-portfolio-toolbar--official">
          <div className="admin-ai-ref-portfolio-filters">
            {[
              { key: "all", label: "All active" },
              { key: "fromReferrers", label: "From referrers" },
              { key: "noParentReferrer", label: "Direct lenders" },
              { key: "withReferrals", label: "Active referrals" },
              { key: "withoutReferrals", label: "Not actively referring" },
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
              <span>Lender ID</span>
              <input
                value={lenderIdSearch}
                onChange={(event) => setLenderIdSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") applySearch();
                }}
                placeholder="e.g. 34447 or LR34447"
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
        {!loading ? (
          <section className="admin-ai-ref-portfolio-list admin-ai-ref-portfolio-list--full">
            <div className="admin-ai-ref-portfolio-list-head">
              <strong>{fmtNum(totalCount)} lenders</strong>
              <span>Page {page} of {totalPages}</span>
            </div>
            <div className="admin-ai-ref-portfolio-rows admin-ai-ref-portfolio-rows--grid">
              {rows.map((row) => {
                const profileOpen = openProfileId === row.lenderId;
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
                          className={`admin-ai-ref-portfolio-icon-btn${profileOpen ? " is-open" : ""}`}
                          onClick={() => setOpenProfileId(profileOpen ? null : row.lenderId)}
                          title="View mobile & email"
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

                    {profileOpen ? (
                      <div className="admin-ai-ref-portfolio-profile-panel">
                        <span><b>Mobile</b> {valueOrDash(row.mobileNumber)}</span>
                        <span><b>Email</b> {valueOrDash(row.email)}</span>
                      </div>
                    ) : null}

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
    </div>
  );
};

export default AdminAIActiveLendersReferralPortfolioPage;
