import React, { useEffect, useMemo, useState } from "react";
import { FaArrowLeft, FaRupeeSign, FaTimes } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAdminAITopPaidEarnedReferrerDetail } from "../../../HttpRequest/admin";
import "./AdminAIDashboard.css";

const fmtNum = (value) => Number(value || 0).toLocaleString("en-IN");
const fmtMoney = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);
const pickNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const responseData = (payload) => payload?.data || payload || {};

const AdminAITopPaidEarnedHistoryPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referrerId = pickNumber(searchParams.get("referrerId"));
  const limit = pickNumber(searchParams.get("limit")) || 10;
  const rank = searchParams.get("rank") || "";
  const returnTo = `/adminAITopPaidEarnedReferrers?limit=${limit}`;

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const goBack = () => navigate(returnTo);

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
        const data = responseData(await getAdminAITopPaidEarnedReferrerDetail(referrerId));
        if (!cancelled) setDetail(data);
      } catch (requestError) {
        if (!cancelled) {
          setDetail(null);
          setError(requestError?.response?.data?.message || requestError?.message || "Failed to load paid date history.");
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

  const paidByDate = useMemo(
    () => (Array.isArray(detail?.paidEarningsByDate) ? detail.paidEarningsByDate : []),
    [detail]
  );
  const earnings = detail?.earningsSummary || {};
  const paidTotal = paidByDate.reduce((sum, row) => sum + pickNumber(row.paidAmount), 0);
  const referrerCode = detail?.referrerCode || searchParams.get("referrerCode") || (referrerId ? `LR${referrerId}` : "-");
  const referrerName = detail?.name || searchParams.get("name") || "";

  return (
    <div className="admin-ai-page-shell">
      <div className="admin-ai-dashboard-wrap admin-ai-top-paid-history-page">
        <header className="admin-ai-top-paid-page-head">
          <div>
            <button type="button" className="admin-ai-referral-back" onClick={goBack}>
              <FaArrowLeft /> Back to Top Paid Earned
            </button>
            <h2>
              <FaRupeeSign /> Paid Date History
              {rank ? ` · #${rank}` : ""}
            </h2>
            <p>
              {valueOrDash(referrerCode)}
              {referrerName ? ` · ${referrerName}` : ""}
            </p>
          </div>
          <button type="button" className="admin-ai-close-btn" onClick={goBack}>
            <FaTimes /> Close
          </button>
        </header>

        {error ? <div className="alert alert-danger">{error}</div> : null}
        {loading ? <div className="admin-ai-empty-state">Loading paid date history...</div> : null}

        {!loading && detail ? (
          <section className="admin-ai-top-paid-history-page-body">
            <div className="admin-ai-top-paid-history-summary">
              <div className="paid">
                <small>TOTAL PAID</small>
                <strong>{fmtMoney(earnings.amountPaid ?? earnings.refPaid ?? paidTotal)}</strong>
              </div>
              <div>
                <small>PAID DATES</small>
                <strong>{fmtNum(paidByDate.length)}</strong>
              </div>
              <div>
                <small>MOBILE</small>
                <strong>{valueOrDash(detail.mobileNumber)}</strong>
              </div>
              <div>
                <small>EMAIL</small>
                <strong>{valueOrDash(detail.email)}</strong>
              </div>
            </div>

            <div className="admin-ai-top-paid-history-board">
              <div className="admin-ai-top-paid-board-meta">
                <strong>Paid by date</strong>
                <span>Only paid transfer dates for this referrer</span>
              </div>

              {paidByDate.length ? (
                <div className="admin-ai-top-paid-history-table admin-ai-top-paid-history-table--page">
                  <div className="head">
                    <span>#</span>
                    <span>Paid Date</span>
                    <span>Status</span>
                    <span>Referees</span>
                    <span>Paid Amount</span>
                  </div>
                  {paidByDate.map((row, index) => (
                    <div key={`${row.paidDate}-${index}`} className="row">
                      <span>{index + 1}</span>
                      <strong>{valueOrDash(row.paidDate)}</strong>
                      <em className="pay-paid">{valueOrDash(row.paymentStatus || "Paid")}</em>
                      <span>{fmtNum(row.refereeCount)}</span>
                      <strong className="amount">{fmtMoney(row.paidAmount)}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-ai-empty-state">No paid date history found for this referrer.</div>
              )}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default AdminAITopPaidEarnedHistoryPage;
