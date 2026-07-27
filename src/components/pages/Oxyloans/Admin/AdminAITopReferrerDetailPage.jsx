import React, { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaEye, FaProjectDiagram, FaTimes, FaUserFriends } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { goBackOrAdminAI, YEAR_WISE_REFERRALS_PATH } from "./adminAINavigation";
import { getAdminAIActiveLenderReferrals } from "../../../HttpRequest/admin";
import "./AdminAIDashboard.css";

const fmtNum = (value) => Number(value || 0).toLocaleString("en-IN");
const fmtMoney = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);
const pickNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const responseData = (payload) => payload?.data || payload || {};

const normalizeStatus = (status) => String(status || "").trim().toLowerCase();

const matchesStatusFilter = (status, filter) => {
  const value = normalizeStatus(status);
  if (filter === "all") return true;
  if (filter === "registered") return value === "registered";
  if (filter === "invited") return value === "invited";
  if (filter === "lent") return value === "lent" || value === "disbursed";
  return true;
};

const statusLabel = (filter) => {
  if (filter === "registered") return "Registered users";
  if (filter === "invited") return "Invited users";
  if (filter === "lent") return "Lent users";
  return "All referral users";
};

const AdminAITopReferrerDetailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referrerId = pickNumber(searchParams.get("referrerId"));
  const referrerCode = searchParams.get("referrerCode") || (referrerId ? `LR${referrerId}` : "-");
  const referrerName = searchParams.get("name") || "";
  const rank = searchParams.get("rank") || "";
  const limit = pickNumber(searchParams.get("limit")) || 10;
  const returnTo = `/adminAITopReferrer?${searchParams.toString()}`;

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userFilter, setUserFilter] = useState(null);

  const closePage = () => {
    goBackOrAdminAI(navigate, YEAR_WISE_REFERRALS_PATH);
  };

  useEffect(() => {
    if (!referrerId) {
      setError("Referrer id is missing.");
      return undefined;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const first = responseData(await getAdminAIActiveLenderReferrals(referrerId, 1, 100));
        const total = pickNumber(first.totalCount);
        let allReferrals = Array.isArray(first.referrals) ? [...first.referrals] : [];
        if (total > allReferrals.length) {
          const pages = Math.ceil(total / 100);
          for (let pageNo = 2; pageNo <= pages && pageNo <= 10; pageNo += 1) {
            const next = responseData(await getAdminAIActiveLenderReferrals(referrerId, pageNo, 100));
            const rows = Array.isArray(next.referrals) ? next.referrals : [];
            if (!rows.length) break;
            allReferrals = allReferrals.concat(rows);
          }
        }
        if (!cancelled) {
          setDetail({
            ...first,
            referrals: allReferrals,
          });
        }
      } catch (requestError) {
        if (!cancelled) {
          setDetail(null);
          setError(requestError?.response?.data?.message || requestError?.message || "Failed to load referrer details.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [referrerId]);

  const earnings = detail?.earningsSummary || detail?.referralSummary || {};
  const referralSummary = detail?.referralSummary || {};
  const referrals = Array.isArray(detail?.referrals) ? detail.referrals : [];
  const lentCount = pickNumber(referralSummary.lent) + pickNumber(referralSummary.disbursed);
  const referralUsersCount = pickNumber(earnings.refCount ?? detail?.totalCount ?? referralSummary.total);

  const filteredUsers = useMemo(() => {
    if (!userFilter) return [];
    return referrals.filter((row) => matchesStatusFilter(row.status, userFilter));
  }, [referrals, userFilter]);

  const openUsers = (filter) => {
    setUserFilter((current) => (current === filter ? null : filter));
  };

  const openLentUsersPage = () => {
    navigate(`/adminAILentUsersDetail?lenderId=${referrerId}&returnTo=${encodeURIComponent(returnTo)}`);
  };

  const openTreeMapPage = () => {
    navigate(`/adminAILentReferralTreeMap?lenderId=${referrerId}&returnTo=${encodeURIComponent(returnTo)}`);
  };

  return (
    <div className="admin-ai-page-shell">
      <div className="admin-ai-dashboard-wrap admin-ai-top-referrer-page">
        <header className="admin-ai-top-referrer-page-head">
          <div>
            <button type="button" className="admin-ai-referral-back" onClick={closePage}>
              <FaArrowLeft /> Back to YearWise referrals
            </button>
            <h2>
              {rank ? `#${rank} · ` : ""}
              {referrerCode}
              {referrerName ? ` · ${referrerName}` : ""}
            </h2>
            <p>Top {limit} Lent ranking · referrer performance and earnings</p>
          </div>
          <div className="admin-ai-top-referrer-page-head-actions">
            <button type="button" className="admin-ai-search-btn" onClick={openLentUsersPage} title="Open full Lent users page">
              <FaEye /> Lent users
            </button>
            <button type="button" className="admin-ai-search-btn" onClick={openTreeMapPage} title="Open Lent referral tree">
              <FaProjectDiagram /> Tree
            </button>
            <button type="button" className="admin-ai-close-btn" onClick={closePage}>
              <FaTimes /> Close
            </button>
          </div>
        </header>

        {loading ? <div className="admin-ai-empty-state">Loading referrer details...</div> : null}
        {error ? <div className="alert alert-danger">{error}</div> : null}

        {!loading && !error ? (
          <section className="admin-ai-top-referrer-page-body">
            <div className="admin-ai-top-referrer-page-meta">
              <div>
                <small>REFERRER CODE</small>
                <strong>{valueOrDash(referrerCode)}</strong>
              </div>
              <div>
                <small>NAME</small>
                <strong>{valueOrDash(referrerName)}</strong>
              </div>
              <div>
                <small>RANK BY LENT</small>
                <strong>{rank ? `#${rank}` : "-"}</strong>
              </div>
            </div>

            <div className="admin-ai-top-referrer-status-grid admin-ai-top-referrer-status-grid--clickable">
              <div className={`admin-ai-top-referrer-status-card registered${userFilter === "registered" ? " is-active" : ""}`}>
                <small>REGISTERED</small>
                <strong>{fmtNum(referralSummary.registered)}</strong>
                <button
                  type="button"
                  className="admin-ai-top-referrer-card-view"
                  onClick={() => openUsers("registered")}
                  title="Show Registered users"
                >
                  <FaEye /> View
                </button>
              </div>
              <div className={`admin-ai-top-referrer-status-card lent${userFilter === "lent" ? " is-active" : ""}`}>
                <small>LENT</small>
                <strong>{fmtNum(lentCount)}</strong>
                <button
                  type="button"
                  className="admin-ai-top-referrer-card-view"
                  onClick={() => openUsers("lent")}
                  title="Show Lent users"
                >
                  <FaEye /> View
                </button>
              </div>
              <div className={`admin-ai-top-referrer-status-card invited${userFilter === "invited" ? " is-active" : ""}`}>
                <small>INVITED</small>
                <strong>{fmtNum(referralSummary.invited)}</strong>
                <button
                  type="button"
                  className="admin-ai-top-referrer-card-view"
                  onClick={() => openUsers("invited")}
                  title="Show Invited users"
                >
                  <FaEye /> View
                </button>
              </div>
            </div>

            <div className="admin-ai-top-referrer-amount-grid">
              <div className="earned">
                <small>TOTAL EARNED</small>
                <strong>{fmtMoney(earnings.totalEarned ?? earnings.refEarnings)}</strong>
              </div>
              <div className="paid">
                <small>PAID AMOUNT</small>
                <strong>{fmtMoney(earnings.amountPaid ?? earnings.refPaid)}</strong>
              </div>
              <div className="unpaid">
                <small>UNPAID AMOUNT</small>
                <strong>{fmtMoney(earnings.amountNotPaid ?? earnings.refUnpaid)}</strong>
              </div>
              <div className="investment">
                <small>REFERRED INVESTMENT</small>
                <strong>{fmtMoney(earnings.totalInvestment ?? earnings.refAmt)}</strong>
              </div>
              <button
                type="button"
                className={`count admin-ai-top-referrer-count-card${userFilter === "all" ? " is-active" : ""}`}
                onClick={() => openUsers("all")}
                title="Show all referral users"
              >
                <small>REFERRAL USERS</small>
                <strong>{fmtNum(referralUsersCount)}</strong>
                <span>Click to view users</span>
              </button>
            </div>

            {userFilter ? (
              <div className="admin-ai-top-referrer-users-panel">
                <header>
                  <div>
                    <small><FaUserFriends /> {statusLabel(userFilter)}</small>
                    <h3>{fmtNum(filteredUsers.length)} users</h3>
                  </div>
                  <button type="button" className="admin-ai-close-btn" onClick={() => setUserFilter(null)}>
                    <FaTimes /> Close list
                  </button>
                </header>
                {filteredUsers.length ? (
                  <div className="admin-ai-top-referrer-users-list">
                    <div className="admin-ai-top-referrer-users-head">
                      <span>Name</span>
                      <span>ID / Code</span>
                      <span>Status</span>
                      <span>Mobile</span>
                      <span>Email</span>
                    </div>
                    {filteredUsers.map((row) => {
                      const id = pickNumber(row.refereeId);
                      return (
                        <div key={`${id}-${row.status}-${row.referredOn || ""}`} className="admin-ai-top-referrer-users-row">
                          <strong>{valueOrDash(row.refereeName)}</strong>
                          <span>{id ? `LR${id}` : "-"} · {valueOrDash(id)}</span>
                          <em className={`status-${normalizeStatus(row.status)}`}>{valueOrDash(row.status)}</em>
                          <span>{valueOrDash(row.refereeMobileNumber || row.mobileNumber)}</span>
                          <span>{valueOrDash(row.refereeEmail || row.email)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="admin-ai-empty-state">No users found for this status.</div>
                )}
              </div>
            ) : (
              <p className="admin-ai-referral-filter-hint">
                Use View on Registered, Lent, or Invited to list those people.
              </p>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default AdminAITopReferrerDetailPage;
