import React, { useCallback, useEffect, useState } from "react";
import { FaArrowLeft, FaTimes, FaUserFriends } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAdminAIActiveLenderLentUsers } from "../../../HttpRequest/admin";
import "./AdminAIDashboard.css";

const PAGE_SIZE = 20;
const PORTFOLIO_PATH = "/adminAIActiveLendersReferralPortfolio";
const fmtNum = (value) => Number(value || 0).toLocaleString("en-IN");
const fmtMoney = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);
const pickNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const responseData = (payload) => payload?.data || payload || {};

const AdminAILentUsersDetailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lenderId = pickNumber(searchParams.get("lenderId"));
  const returnTo = searchParams.get("returnTo") || PORTFOLIO_PATH;

  const [detail, setDetail] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const goBack = () => {
    navigate(returnTo.startsWith("/") ? returnTo : PORTFOLIO_PATH);
  };

  const loadDetail = useCallback(async (nextPage = 1) => {
    if (!lenderId) {
      setError("Lender ID is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = responseData(await getAdminAIActiveLenderLentUsers(lenderId, nextPage, PAGE_SIZE));
      setDetail(data);
      setPage(pickNumber(data.pageNo) || nextPage);
    } catch (requestError) {
      setDetail(null);
      setError(requestError?.response?.data?.message || requestError?.message || "Failed to load Lent user details.");
    } finally {
      setLoading(false);
    }
  }, [lenderId]);

  useEffect(() => {
    loadDetail(1);
  }, [loadDetail]);

  const summary = detail?.summary || {};
  const rows = Array.isArray(detail?.rows) ? detail.rows : [];
  const totalCount = pickNumber(detail?.totalCount);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="admin-ai-page-shell">
      <div className="admin-ai-dashboard-wrap admin-ai-lent-users-page">
        <header className="admin-ai-ref-portfolio-head">
          <div>
            <button type="button" className="admin-ai-referral-back" onClick={goBack}>
              <FaArrowLeft /> Back to referral portfolio
            </button>
            <h2>Lent Users Details</h2>
            <p>
              {valueOrDash(detail?.name)} · {valueOrDash(detail?.lenderCode || (lenderId ? `LR${lenderId}` : "-"))}
              {" · "}Lender ID {valueOrDash(lenderId)}
            </p>
          </div>
          <button type="button" className="admin-ai-close-btn" onClick={goBack}>
            <FaTimes /> Close
          </button>
        </header>

        {error ? <div className="alert alert-danger">{error}</div> : null}
        {loading && !detail ? <div className="admin-ai-empty-state">Loading Lent user details...</div> : null}

        {detail ? (
          <>
            <section className="admin-ai-lent-users-summary">
              <div className="earned">
                <small>TOTAL EARNING</small>
                <strong>{fmtMoney(summary.totalEarned)}</strong>
              </div>
              <div className="paid">
                <small>PAID AMOUNT</small>
                <strong>{fmtMoney(summary.amountPaid)}</strong>
              </div>
              <div className="unpaid">
                <small>UNPAID AMOUNT</small>
                <strong>{fmtMoney(summary.amountNotPaid)}</strong>
              </div>
              <div className="participation">
                <small>SUM OF LENT USERS AMOUNT</small>
                <strong>{fmtMoney(summary.lentUsersParticipationAmount)}</strong>
              </div>
              <div className="lent">
                <small>LENT USERS</small>
                <strong>{fmtNum(summary.lentCount || totalCount)}</strong>
              </div>
              <div className="referrals">
                <small>TOTAL REFERRALS</small>
                <strong>{fmtNum(summary.totalReferrals)}</strong>
              </div>
            </section>

            <section className="admin-ai-lent-users-table-wrap">
              <div className="admin-ai-ref-portfolio-list-head">
                <strong>{fmtNum(totalCount)} Lent users</strong>
                <span>Page {page} of {totalPages}</span>
              </div>
              <div className="admin-ai-lent-users-table-scroll">
                <table className="admin-ai-lent-users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Code</th>
                      <th>Mobile</th>
                      <th>Status</th>
                      <th>Participation</th>
                      <th>Paid</th>
                      <th>Unpaid</th>
                      <th>Total referrals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.refereeId}>
                        <td>
                          <strong>{valueOrDash(row.refereeName)}</strong>
                          <em>ID {valueOrDash(row.refereeId)}</em>
                        </td>
                        <td>{valueOrDash(row.refereeCode)}</td>
                        <td>{valueOrDash(row.refereeMobileNumber)}</td>
                        <td>{valueOrDash(row.status)}</td>
                        <td>{fmtMoney(row.participationAmount)}</td>
                        <td>{fmtMoney(row.amountPaid)}</td>
                        <td>{fmtMoney(row.amountNotPaid)}</td>
                        <td>{fmtNum(row.totalReferrals)}</td>
                      </tr>
                    ))}
                    {!rows.length ? (
                      <tr>
                        <td colSpan={8}>
                          <div className="admin-ai-empty-state">
                            <FaUserFriends />
                            <p>No Lent users found for this lender.</p>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
              <div className="admin-ai-referral-users-pager">
                <button type="button" disabled={page <= 1 || loading} onClick={() => loadDetail(page - 1)}>Previous</button>
                <span>{page} / {totalPages}</span>
                <button type="button" disabled={page >= totalPages || loading} onClick={() => loadDetail(page + 1)}>Next</button>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AdminAILentUsersDetailPage;
