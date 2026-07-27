import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaEye, FaTimes, FaTrophy } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { goBackOrAdminAI, YEAR_WISE_REFERRALS_PATH } from "./adminAINavigation";
import { getAdminAITopPaidEarnedReferrers } from "../../../HttpRequest/admin";
import "./AdminAIDashboard.css";

const fmtNum = (value) => Number(value || 0).toLocaleString("en-IN");
const fmtMoney = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);
const pickNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const responseData = (payload) => payload?.data || payload || {};

const AdminAITopPaidEarnedReferrersPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const limit = Math.min(50, Math.max(10, pickNumber(searchParams.get("limit")) || 10));

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const closePage = () => goBackOrAdminAI(navigate, YEAR_WISE_REFERRALS_PATH);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = responseData(await getAdminAITopPaidEarnedReferrers(limit));
        if (!cancelled) setRows(Array.isArray(data.referrers) ? data.referrers : []);
      } catch (requestError) {
        if (!cancelled) {
          setRows([]);
          setError(requestError?.response?.data?.message || requestError?.message || "Failed to load top paid earned referrers.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  const setLimit = (nextLimit) => {
    const next = new URLSearchParams(searchParams);
    next.set("limit", String(nextLimit));
    setSearchParams(next);
  };

  const openPaidHistory = (row) => {
    const params = new URLSearchParams({
      referrerId: String(row.referrerId),
      referrerCode: row.referrerCode || `LR${row.referrerId}`,
      name: row.name || "",
      rank: String(row.rank || ""),
      limit: String(limit),
    });
    navigate(`/adminAITopPaidEarnedHistory?${params.toString()}`);
  };

  return (
    <div className="admin-ai-page-shell">
      <div className="admin-ai-dashboard-wrap admin-ai-top-paid-page">
        <header className="admin-ai-top-paid-page-head">
          <div>
            <button type="button" className="admin-ai-referral-back" onClick={closePage}>
              <FaArrowLeft /> Back to YearWise referrals
            </button>
            <h2><FaTrophy /> Top {limit} Paid Earned Referrers</h2>
            <p>All-time ranking by paid referral earnings. History opens paid date records on a new page.</p>
          </div>
          <div className="admin-ai-top-paid-page-actions">
            <div className="admin-ai-top-paid-limit-tabs" role="tablist" aria-label="Ranking limit">
              <button type="button" className={limit === 10 ? "is-active" : ""} onClick={() => setLimit(10)}>Top 10</button>
              <button type="button" className={limit === 50 ? "is-active" : ""} onClick={() => setLimit(50)}>Top 50</button>
            </div>
            <button type="button" className="admin-ai-close-btn" onClick={closePage}>
              <FaTimes /> Close
            </button>
          </div>
        </header>

        {error ? <div className="alert alert-danger">{error}</div> : null}
        {loading ? <div className="admin-ai-empty-state">Loading top paid earned referrers...</div> : null}

        {!loading ? (
          <section className="admin-ai-top-paid-board">
            <div className="admin-ai-top-paid-board-meta">
              <strong>{fmtNum(rows.length)} referrers</strong>
              <span>Sorted by Paid amount (highest first)</span>
            </div>

            <div className="admin-ai-top-paid-table" role="table">
              <div className="admin-ai-top-paid-table-head" role="row">
                <span>Rank</span>
                <span>Referrer</span>
                <span>Paid</span>
                <span>Total Earned</span>
                <span>Unpaid</span>
                <span>Counts</span>
                <span>Contact</span>
                <span>Action</span>
              </div>

              <div className="admin-ai-top-paid-table-body">
                {rows.map((row) => (
                  <div key={row.referrerId} className="admin-ai-top-paid-row" role="row">
                    <div className="admin-ai-top-paid-rank">
                      <em>#{row.rank}</em>
                    </div>

                    <div className="admin-ai-top-paid-person">
                      <strong>{valueOrDash(row.referrerCode)}</strong>
                      <span>{valueOrDash(row.name)}</span>
                    </div>

                    <div className="admin-ai-top-paid-money is-paid">
                      <small>Paid</small>
                      <strong>{fmtMoney(row.amountPaid)}</strong>
                    </div>

                    <div className="admin-ai-top-paid-money is-earned">
                      <small>Earned</small>
                      <strong>{fmtMoney(row.totalEarned)}</strong>
                    </div>

                    <div className="admin-ai-top-paid-money is-unpaid">
                      <small>Unpaid</small>
                      <strong>{fmtMoney(row.amountNotPaid)}</strong>
                    </div>

                    <div className="admin-ai-top-paid-counts">
                      <span><b>{fmtNum(row.referralCount)}</b> referrals</span>
                      <span><b>{fmtNum(row.lentCount)}</b> lent</span>
                    </div>

                    <div className="admin-ai-top-paid-contact">
                      <span>{valueOrDash(row.mobileNumber)}</span>
                      <small title={valueOrDash(row.email)}>{valueOrDash(row.email)}</small>
                    </div>

                    <div className="admin-ai-top-paid-action">
                      <button type="button" onClick={() => openPaidHistory(row)}>
                        <FaEye /> History
                      </button>
                    </div>
                  </div>
                ))}
                {!rows.length ? <div className="admin-ai-empty-state">No paid earned referrers found.</div> : null}
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default AdminAITopPaidEarnedReferrersPage;
