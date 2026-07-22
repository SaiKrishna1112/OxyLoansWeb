import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaUniversity, FaUserGraduate } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAdminAIReferralRegistrations } from "../../../HttpRequest/admin";
import "./AdminAIDashboard.css";

const PAGE_SIZE = 20;
const fmtNum = (value) => Number(value || 0).toLocaleString("en-IN");
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);
const referralUserId = (userId, userCode) => {
  const numericId = Number(userId);
  if (numericId > 0) return numericId;
  const digits = String(userCode || "").replace(/^(LR|BR|PR)\s*/i, "").replace(/\D/g, "");
  return Number(digits) || 0;
};

const AdminAIReferralUsersPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const year = Number(searchParams.get("year")) || new Date().getFullYear();
  const status = searchParams.get("status") || "Registered";
  const selectedType = ["Lender", "Borrower"].includes(searchParams.get("userType"))
    ? searchParams.get("userType")
    : "";
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ all: 0, lenders: 0, borrowers: 0, unclassified: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = async (userType, nextPage = 1) => {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminAIReferralRegistrations(nextPage, PAGE_SIZE, {
        year,
        status,
        userType,
      });
      const data = response?.data || response || {};
      setRows(userType && Array.isArray(data.referees) ? data.referees : []);
      setPage(Number(data.pageNo) || nextPage);
      setTotal(userType ? Number(data.totalCount) || 0 : Number(data.allTypeCount) || 0);
      setCounts({
        all: Number(data.allTypeCount) || 0,
        lenders: Number(data.lenderCount) || 0,
        borrowers: Number(data.borrowerCount) || 0,
        unclassified: Number(data.unclassifiedCount) || 0,
      });
    } catch (requestError) {
      setRows([]);
      setTotal(0);
      setError(requestError?.response?.data?.message || requestError?.message || "Failed to load registered users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRows([]);
    setTotal(0);
    setPage(1);
    loadUsers(selectedType || null, 1);
  }, [year, status, selectedType]);

  const selectType = (userType) => {
    const next = new URLSearchParams(searchParams);
    next.set("year", String(year));
    next.set("status", status);
    next.set("userType", userType);
    setSearchParams(next);
  };

  const openReferrerProfile = (row) => {
    const userId = referralUserId(row?.referrerId, row?.referrerCode);
    if (!userId) return;
    const returnTo = `/adminAIReferralUsers?${searchParams.toString()}`;
    const params = new URLSearchParams({
      userId: String(userId),
      view: "referralRegistered",
      label: `Referrer ${row?.referrerCode || `LR${userId}`}`,
      returnTo,
    });
    navigate(`/adminAIUserProfile?${params.toString()}`);
  };

  return (
    <div className="admin-ai-page-shell">
      <div className="admin-ai-dashboard-wrap admin-ai-referral-users-page">
        <header className="admin-ai-referral-users-header">
          <div>
            <button type="button" className="admin-ai-referral-back" onClick={() => navigate("/adminAIDashboard?panel=yearWiseReferrals") }>
              <FaArrowLeft /> Back to YearWise referrals
            </button>
            <h2>{year} Registered Referral Users</h2>
            <p>Select Lenders or Borrowers to show the registered users.</p>
          </div>
          <span className="admin-ai-count-pill">
            {counts.all ? `${fmtNum(counts.all)} Registered Users` : "Registered Users"}
          </span>
        </header>

        <section className="admin-ai-referral-type-filter" aria-label="Filter registered referral users">
          <div className="admin-ai-referral-type-copy">
            <small>FILTER USERS</small>
            <strong>Who do you want to view?</strong>
            <span>Choose one category before user data is displayed.</span>
          </div>
          <div className="admin-ai-referral-type-actions">
            <button
              type="button"
              className={selectedType === "Lender" ? "is-active" : ""}
              aria-pressed={selectedType === "Lender"}
              onClick={() => selectType("Lender")}
            >
              <FaUniversity />
              <span><strong>Lenders ({fmtNum(counts.lenders)})</strong><small>Primary type: LENDER</small></span>
            </button>
            <button
              type="button"
              className={selectedType === "Borrower" ? "is-active" : ""}
              aria-pressed={selectedType === "Borrower"}
              onClick={() => selectType("Borrower")}
            >
              <FaUserGraduate />
              <span><strong>Borrowers ({fmtNum(counts.borrowers)})</strong><small>Primary type: BORROWER</small></span>
            </button>
          </div>
        </section>

        {!selectedType && !loading ? (
          <div className="admin-ai-referral-users-prompt">
            <strong>{fmtNum(counts.all)} registered referral users:</strong>{" "}
            {fmtNum(counts.lenders)} lenders and {fmtNum(counts.borrowers)} borrowers.
            {counts.unclassified ? ` ${fmtNum(counts.unclassified)} users have no recognized primary type.` : ""}
            <br />Select Lenders or Borrowers above to show those users.
          </div>
        ) : null}
        {error ? <div className="alert alert-danger">{error}</div> : null}
        {loading ? <div className="admin-ai-empty-state">Loading {selectedType.toLowerCase()} users...</div> : null}

        {!loading && selectedType ? (
          <section className="admin-ai-referral-users-results">
            <div className="admin-ai-referral-results-head">
              <div><small>SELECTED FILTER</small><h3>{selectedType}s</h3></div>
              <strong>{fmtNum(total)} registered in {year}</strong>
            </div>
            {rows.length ? (
              <div className="admin-ai-lender-list">
                {rows.map((row) => (
                  <div className="admin-ai-lender-row" key={row.id || `${row.refereeId}-${row.referrerId}`}>
                    <div><small>REFEREE</small><strong>{valueOrDash(row.refereeCode)} {valueOrDash(row.refereeName)}</strong></div>
                    <div><small>MOBILE</small><strong>{valueOrDash(row.refereeMobileNumber)}</strong></div>
                    <div><small>EMAIL</small><strong>{valueOrDash(row.refereeEmail)}</strong></div>
                    <div><small>TYPE</small><strong>{valueOrDash(row.primaryType)}</strong></div>
                    <div><small>STATUS</small><strong>{valueOrDash(row.status)}</strong></div>
                    <div className="admin-ai-referral-referrer-cell">
                      <small>REFERRER — VIEW PROFILE</small>
                      <button
                        type="button"
                        className="admin-ai-link-btn admin-ai-referral-referrer-btn"
                        onClick={() => openReferrerProfile(row)}
                        disabled={!referralUserId(row.referrerId, row.referrerCode)}
                        title={`Open ${valueOrDash(row.referrerCode)} personal profile`}
                      >
                        {valueOrDash(row.referrerCode)}
                      </button>
                      {row.referrerName ? <span>{row.referrerName}</span> : null}
                    </div>
                    <div><small>REFERRED ON</small><strong>{String(row.referredOn || "").slice(0, 19) || "-"}</strong></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="admin-ai-empty-state">No registered {selectedType.toLowerCase()} users found for {year}.</div>
            )}
            <div className="admin-ai-referral-users-pager">
              <button type="button" disabled={loading || page <= 1} onClick={() => loadUsers(selectedType, page - 1)}>Previous</button>
              <span>Page {page} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}</span>
              <button type="button" disabled={loading || page * PAGE_SIZE >= total} onClick={() => loadUsers(selectedType, page + 1)}>Next</button>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default AdminAIReferralUsersPage;
