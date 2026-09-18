import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaCalendarAlt, FaEye, FaTimes, FaUserClock } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { goBackOrAdminAI, YEAR_WISE_REFERRALS_PATH } from "./adminAINavigation";
import {
  defaultParticipationDate,
  getAdminAIActiveLenderDeals,
  getAdminAIActiveLenderProfile,
  getAdminAIActiveLenderWallet,
  getAdminAIInactiveReactivatedLenders,
  getAdminAIInactiveReactivatedWeekSummary,
  getAdminAIUsers,
  INACTIVE_REACTIVATION_REPORT_START,
} from "../../../HttpRequest/admin";
import { BASE_URL } from "../../../../config";
import "./AdminAIDashboard.css";

const fmtNum = (n) => (n == null ? "0" : Number(n).toLocaleString("en-IN"));
const fmtMoney = (n) => `Rs ${fmtNum(Math.round(Number(n) || 0))}`;
const formatDate = (value) => String(value || "").slice(0, 10) || "-";
const formatDisplayDate = (value) => {
  const text = String(value || "").slice(0, 10);
  if (!text || text === "-") return "-";
  const date = new Date(`${text}T00:00:00`);
  if (Number.isNaN(date.getTime())) return text;
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
const formatWeekday = (value) => {
  const text = String(value || "").slice(0, 10);
  if (!text || text === "-") return "-";
  const date = new Date(`${text}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", { weekday: "long" });
};
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);
const pickNumber = (...values) => {
  for (const value of values) {
    if (value != null && value !== "" && !Number.isNaN(Number(value))) return Number(value);
  }
  return 0;
};
const responseData = (payload) => (payload && payload.data ? payload.data : payload);
const participationGapDays = (previousDate, selectedDate) => {
  const prev = new Date(`${String(previousDate).slice(0, 10)}T00:00:00`);
  const sel = new Date(`${String(selectedDate).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(prev.getTime()) || Number.isNaN(sel.getTime())) return 0;
  return Math.floor((sel - prev) / 86400000);
};
const isInactiveReactivatedUser = (user, participationDate, minGapDays = 366) => {
  const previous = String(user?.lastParticipationOn || user?.previousLastActivityOn || "").slice(0, 10);
  const selected = String(participationDate || "").slice(0, 10);
  if (!previous || previous === "-" || !selected || selected === "-") return false;
  return participationGapDays(previous, selected) >= minGapDays;
};
const mapUserToInactiveReactivated = (user) => ({
  lenderId: user.lenderId || user.userId,
  userCode: user.userCode || (user.userId ? `LR${user.userId}` : ""),
  name: user.name,
  email: user.email,
  mobileNumber: user.mobileNumber,
  dealId: user.dealId || user.todayDealId,
  dealName: user.dealName || user.todayDealName,
  participationAmount: user.participationAmount ?? user.todayParticipationAmount,
  previousDealId: user.previousDealId || user.lastDealId,
  previousDealName: user.previousDealName || user.lastDealName,
  previousDealAmount: user.previousDealAmount ?? user.lastDealParticipationAmount,
  previousLastActivityOn: user.previousLastActivityOn || user.lastParticipationOn,
  participationOn: user.participationOn || user.todayParticipationOn,
});
const deriveInactiveReactivatedUsers = (users = [], participationDate) =>
  (users || []).filter((user) => isInactiveReactivatedUser(user, participationDate)).map(mapUserToInactiveReactivated);
const lenderToProfileUser = (lender) => ({
  userId: lender?.lenderId,
  lenderId: lender?.lenderId,
  userCode: lender?.userCode || (lender?.lenderId ? `LR${lender.lenderId}` : ""),
  name: lender?.name,
  email: lender?.email,
  mobileNumber: lender?.mobileNumber,
  primaryType: "LENDER",
});
const fetchParticipatedUsersForDate = async (participationDate) => {
  const rows = [];
  let pageNo = 1;
  let totalCount = 0;
  while (pageNo <= 50) {
    const data = responseData(await getAdminAIUsers(pageNo, 100, "todayParticipated", { participationDate }));
    const batch = Array.isArray(data?.users) ? data.users : [];
    if (pageNo === 1) totalCount = Number(data?.totalCount) || 0;
    if (!batch.length) break;
    rows.push(...batch);
    if (totalCount > 0 && rows.length >= totalCount) break;
    if (batch.length < 100) break;
    pageNo += 1;
  }
  return rows;
};
const shiftParticipationDate = (dateStr, deltaDays) => {
  const date = new Date(`${String(dateStr).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return defaultParticipationDate();
  date.setDate(date.getDate() + deltaDays);
  return date.toISOString().slice(0, 10);
};
const buildInactiveWeekSummaryClient = async (endDate, startDate = INACTIVE_REACTIVATION_REPORT_START) => {
  const safeEndDate = String(endDate || defaultParticipationDate()).slice(0, 10);
  const safeStartDate = String(startDate || INACTIVE_REACTIVATION_REPORT_START).slice(0, 10);
  const dailyBreakdown = [];
  const uniqueLenders = new Map();
  let totalDailySum = 0;
  let cursor = safeStartDate;
  while (cursor <= safeEndDate) {
    const dateStr = cursor;
    const data = responseData(await getAdminAIInactiveReactivatedLenders(dateStr, "1 year"));
    const lenders = Array.isArray(data?.lenders) ? data.lenders : [];
    totalDailySum += lenders.length;
    dailyBreakdown.push({ date: dateStr, count: lenders.length, lenders, cumulativeUniqueCount: 0 });
    lenders.forEach((lender) => {
      const lenderId = pickNumber(lender.lenderId);
      if (!lenderId) return;
      if (!uniqueLenders.has(lenderId)) {
        uniqueLenders.set(lenderId, { ...lender, participationDates: [dateStr] });
        return;
      }
      const existing = uniqueLenders.get(lenderId);
      if (!existing.participationDates.includes(dateStr)) existing.participationDates.push(dateStr);
    });
    dailyBreakdown[dailyBreakdown.length - 1].cumulativeUniqueCount = uniqueLenders.size;
    cursor = shiftParticipationDate(cursor, 1);
  }
  return {
    endDate: safeEndDate,
    startDate: safeStartDate,
    days: dailyBreakdown.length,
    inactiveInterval: "1 year",
    totalUniqueCount: uniqueLenders.size,
    totalDailySum,
    dailyBreakdown,
    lenders: [...uniqueLenders.values()],
  };
};

const AdminAIInactiveReactivatedReportPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDate = String(searchParams.get("date") || defaultParticipationDate()).slice(0, 10);

  const [reactivationDate, setReactivationDate] = useState(initialDate);
  const [showDayList, setShowDayList] = useState(!!searchParams.get("date"));
  const [weekSummary, setWeekSummary] = useState(null);
  const [weekLoading, setWeekLoading] = useState(false);
  const [weekError, setWeekError] = useState("");
  const [lenders, setLenders] = useState([]);
  const [lendersCount, setLendersCount] = useState(0);
  const [lendersLoading, setLendersLoading] = useState(false);
  const [lendersError, setLendersError] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileDeals, setProfileDeals] = useState(null);

  const goBack = () => {
    goBackOrAdminAI(navigate);
  };

  const loadWeekSummary = async (endDate = defaultParticipationDate()) => {
    setWeekLoading(true);
    setWeekError("");
    try {
      try {
        const data = responseData(
          await getAdminAIInactiveReactivatedWeekSummary(endDate, INACTIVE_REACTIVATION_REPORT_START)
        );
        if (!data.backendError && Array.isArray(data.dailyBreakdown)) {
          setWeekSummary(data);
          return;
        }
        if (data.backendError) throw new Error(data.backendError);
      } catch (apiError) {
        setWeekSummary(await buildInactiveWeekSummaryClient(endDate, INACTIVE_REACTIVATION_REPORT_START));
        return;
      }
      setWeekSummary(await buildInactiveWeekSummaryClient(endDate, INACTIVE_REACTIVATION_REPORT_START));
    } catch (error) {
      setWeekSummary(null);
      const message =
        error?.response?.data?.backendError ||
        error?.response?.data?.errorMessage ||
        error?.message ||
        "Failed to load reactivation summary.";
      setWeekError(
        /network error|econnrefused|failed to fetch/i.test(message)
          ? `Cannot reach backend at ${BASE_URL}. Start oxyloans-rest on port 8181, then refresh.`
          : message
      );
    } finally {
      setWeekLoading(false);
    }
  };

  const loadDayLenders = async (participationDate = reactivationDate) => {
    setLendersLoading(true);
    setLendersError("");
    try {
      try {
        const data = responseData(await getAdminAIInactiveReactivatedLenders(participationDate, "1 year"));
        if (!data.backendError && Array.isArray(data.lenders)) {
          setLenders(data.lenders);
          setLendersCount(pickNumber(data.totalCount, data.lenders.length));
          return;
        }
        if (data.backendError) throw new Error(data.backendError);
      } catch (apiError) {
        try {
          const participatedUsers = await fetchParticipatedUsersForDate(participationDate);
          const derived = deriveInactiveReactivatedUsers(participatedUsers, participationDate);
          setLenders(derived);
          setLendersCount(derived.length);
          return;
        } catch {
          throw apiError;
        }
      }
      setLenders([]);
      setLendersCount(0);
    } catch (error) {
      setLenders([]);
      setLendersCount(0);
      const message =
        error?.response?.data?.backendError ||
        error?.response?.data?.errorMessage ||
        error?.message ||
        "Failed to load inactive 1+ year reactivated lenders for this date.";
      setLendersError(
        /network error/i.test(message)
          ? `Cannot reach backend at ${BASE_URL}. Start oxyloans-rest on port 8181, then refresh.`
          : message
      );
    } finally {
      setLendersLoading(false);
    }
  };

  const selectDay = (dateStr) => {
    const safeDate = String(dateStr || "").slice(0, 10);
    if (!safeDate) return;
    setReactivationDate(safeDate);
    setShowDayList(true);
    setSelectedProfile(null);
    setProfileDeals(null);
    setSearchParams({ date: safeDate });
  };

  const openProfile = async (lender) => {
    const user = lenderToProfileUser(lender);
    const lenderId = pickNumber(user.lenderId);
    if (!lenderId) return;
    setSelectedProfile(user);
    setProfileLoading(true);
    setProfileError("");
    setProfileDeals(null);
    try {
      const [profileData, walletData, dealsData] = await Promise.all([
        getAdminAIActiveLenderProfile(lenderId).catch(() => null),
        getAdminAIActiveLenderWallet(lenderId).catch(() => null),
        getAdminAIActiveLenderDeals(lenderId).catch(() => null),
      ]);
      const profile = responseData(profileData)?.profile || responseData(profileData) || {};
      const wallet = responseData(walletData) || {};
      const deals = responseData(dealsData) || {};
      setSelectedProfile({
        ...user,
        ...profile,
        email: profile.email || user.email,
        mobileNumber: profile.mobileNumber || user.mobileNumber,
        city: profile.city,
        state: profile.state,
        walletAmount: wallet.walletAmount ?? profile.walletAmount,
        dealsCount: profile.dealsCount,
        totalInvestment: profile.totalInvestment ?? profile.totalParticipationAmount,
      });
      setProfileDeals(deals);
    } catch (error) {
      setProfileError(error?.message || "Failed to load lender profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    loadWeekSummary(defaultParticipationDate());
  }, []);

  useEffect(() => {
    if (showDayList && reactivationDate) {
      loadDayLenders(reactivationDate);
    }
  }, [showDayList, reactivationDate]);

  const fromDate = formatDisplayDate(weekSummary?.startDate || INACTIVE_REACTIVATION_REPORT_START);
  const toDate = formatDisplayDate(weekSummary?.endDate || defaultParticipationDate());

  return (
    <div className="admin-ai-page-shell">
      <div className="admin-ai-dashboard-wrap admin-ai-inactive-report-page">
        <header className="admin-ai-ref-portfolio-head">
          <div>
            <button type="button" className="admin-ai-referral-back" onClick={goBack}>
              <FaArrowLeft /> Back to Lender Analytics
            </button>
            <h2>
              <FaUserClock /> Inactive 1+ Year — Participated Again
            </h2>
            <p>Date-wise reactivation after 366+ days of inactivity · {fromDate} – {toDate}</p>
          </div>
          <button type="button" className="admin-ai-close-btn" onClick={goBack}>
            <FaTimes /> Close
          </button>
        </header>

        <section className="admin-ai-inactive-reactivation-body admin-ai-inactive-reactivation-body--page">
          <div className="admin-ai-inactive-reactivated-toolbar-row">
            <label className="admin-ai-inactive-reactivated-date">
              <FaCalendarAlt aria-hidden="true" />
              <span>Selected date</span>
              <input
                type="date"
                value={reactivationDate}
                max={defaultParticipationDate()}
                min={INACTIVE_REACTIVATION_REPORT_START}
                onChange={(e) => selectDay(e.target.value)}
              />
            </label>
            <span className="admin-ai-count-pill admin-ai-inactive-week-total-pill">
              {weekLoading ? "..." : `${fmtNum(weekSummary?.totalUniqueCount)} unique lenders`}
            </span>
            <span className="admin-ai-count-pill admin-ai-inactive-date-pill">
              {showDayList
                ? (lendersLoading ? "..." : `${fmtNum(lendersCount)} on ${formatDisplayDate(reactivationDate)}`)
                : "Pick a day to list lenders"}
            </span>
          </div>

          <p className="admin-ai-analytics-hint admin-ai-inactive-reactivated-hint">
            Daily report from 30 Jun 2026 through today. Click <strong>View lenders</strong> on a day to open that date’s reactivated lenders.
          </p>

          <div className="admin-ai-inactive-week-summary admin-ai-inactive-week-summary--open">
            <div className="admin-ai-inactive-week-summary-head">
              <div>
                <h6 className="admin-ai-inactive-week-title">Daily reactivation count (from 30 Jun 2026)</h6>
                <div className="admin-ai-inactive-week-range-row">
                  <span><strong>From:</strong> {fromDate}</span>
                  <span className="admin-ai-inactive-week-range-sep" aria-hidden="true">·</span>
                  <span><strong>To:</strong> {toDate}</span>
                </div>
              </div>
              <span className="admin-ai-count-pill admin-ai-inactive-week-total-pill">
                {weekLoading ? "..." : `${fmtNum(weekSummary?.totalUniqueCount)} unique lenders`}
              </span>
            </div>
            {weekError ? <div className="alert alert-warning mb-0 mt-2">{weekError}</div> : null}
            {weekLoading ? (
              <div className="admin-ai-empty-state">Loading reactivation summary...</div>
            ) : (
              <div className="admin-ai-advanced-table-wrap admin-ai-inactive-week-table-wrap">
                <table className="admin-ai-advanced-table admin-ai-inactive-week-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Date</th>
                      <th>Day</th>
                      <th>Lenders reactivated</th>
                      <th>Cumulative unique</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(weekSummary?.dailyBreakdown || []).map((day, index) => (
                      <tr
                        key={day.date}
                        className={reactivationDate === day.date && showDayList ? "active" : ""}
                      >
                        <td>{index + 1}</td>
                        <td><strong>{formatDate(day.date)}</strong></td>
                        <td>{formatWeekday(day.date)}</td>
                        <td><strong>{fmtNum(day.count)}</strong></td>
                        <td><strong>{fmtNum(day.cumulativeUniqueCount)}</strong></td>
                        <td>
                          <button
                            type="button"
                            className={`admin-ai-inactive-day-btn${reactivationDate === day.date && showDayList ? " is-active" : ""}`}
                            onClick={() => selectDay(day.date)}
                          >
                            <FaEye /> {reactivationDate === day.date && showDayList ? "Selected" : "View lenders"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3}><strong>Period unique total</strong></td>
                      <td><strong>{fmtNum(weekSummary?.totalDailySum)}</strong></td>
                      <td><strong>{fmtNum(weekSummary?.totalUniqueCount)}</strong></td>
                      <td><small>{fmtNum(weekSummary?.days)} days</small></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {showDayList ? (
            <div className="admin-ai-inactive-selected-day-panel">
              <div className="admin-ai-inactive-selected-day-head">
                <div className="admin-ai-inactive-selected-day-title">
                  <h6>Lenders on {formatDisplayDate(reactivationDate)}</h6>
                  <p>
                    {fmtNum(lendersCount)} reactivated lender{lendersCount === 1 ? "" : "s"} on this day
                  </p>
                </div>
                <div className="admin-ai-inactive-selected-day-actions">
                  <span className="admin-ai-count-pill admin-ai-inactive-selected-count-pill">
                    {lendersLoading ? "..." : `${fmtNum(lendersCount)} lenders`}
                  </span>
                  <button
                    type="button"
                    className="admin-ai-icon-close-btn"
                    onClick={() => {
                      setShowDayList(false);
                      setSelectedProfile(null);
                      setSearchParams({});
                    }}
                    title="Close lender list"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>

              {lendersError ? <div className="alert alert-warning mb-2">{lendersError}</div> : null}
              {lendersLoading ? (
                <div className="admin-ai-empty-state">Loading reactivated lenders...</div>
              ) : lendersCount === 0 ? (
                <div className="admin-ai-empty-state">No inactive 1+ year lenders participated on this date.</div>
              ) : (
                <div className="admin-ai-advanced-table-wrap">
                  <table className="admin-ai-advanced-table admin-ai-inactive-reactivated-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Mobile</th>
                        <th>Deal (Selected Day)</th>
                        <th>Amount</th>
                        <th>Previous Deal</th>
                        <th>Previous Last Active</th>
                        <th>Gap (Days)</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lenders.map((lender) => (
                        <tr
                          key={`${lender.lenderId}-${lender.dealId}`}
                          className={selectedProfile?.lenderId === lender.lenderId ? "active" : ""}
                        >
                          <td>
                            <button
                              type="button"
                              className="admin-ai-link-btn admin-ai-lender-name-btn"
                              onClick={() => openProfile(lender)}
                            >
                              <strong>{valueOrDash(lender.userCode || (lender.lenderId ? `LR${lender.lenderId}` : "-"))}</strong>
                            </button>
                            <div className="admin-ai-top-lender-name">{valueOrDash(lender.name)}</div>
                          </td>
                          <td>{valueOrDash(lender.mobileNumber)}</td>
                          <td>
                            <strong>{lender.dealId ? `#${lender.dealId}` : "-"}</strong>
                            <div className="admin-ai-top-lender-name">{valueOrDash(lender.dealName)}</div>
                          </td>
                          <td><strong>{fmtMoney(lender.participationAmount)}</strong></td>
                          <td>
                            <strong>{lender.previousDealId ? `#${lender.previousDealId}` : "-"}</strong>
                            <div className="admin-ai-top-lender-name">{valueOrDash(lender.previousDealName)}</div>
                          </td>
                          <td>{formatDate(lender.previousLastActivityOn)}</td>
                          <td>{participationGapDays(lender.previousLastActivityOn, reactivationDate) || "-"}</td>
                          <td>
                            <button className="admin-ai-link-btn" type="button" onClick={() => openProfile(lender)}>
                              View Profile
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}

          {selectedProfile ? (
            <div className="admin-ai-profile-box admin-ai-inactive-reactivated-profile">
              <div className="admin-ai-panel-head">
                <div>
                  <h5>
                    {valueOrDash(selectedProfile.userCode || `LR${selectedProfile.lenderId}`)}{" "}
                    {valueOrDash(selectedProfile.name)}
                  </h5>
                  <p>Reactivated after 1+ year on {formatDate(reactivationDate)}.</p>
                </div>
                <button
                  className="admin-ai-icon-close-btn admin-ai-icon-close-btn--profile"
                  type="button"
                  onClick={() => {
                    setSelectedProfile(null);
                    setProfileDeals(null);
                    setProfileError("");
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              {profileLoading ? <div className="admin-ai-empty-state">Loading lender profile...</div> : null}
              {profileError ? <div className="alert alert-danger">{profileError}</div> : null}
              {!profileLoading && !profileError ? (
                <div className="admin-ai-user-row">
                  <div><small>EMAIL</small><strong>{valueOrDash(selectedProfile.email)}</strong></div>
                  <div><small>MOBILE</small><strong>{valueOrDash(selectedProfile.mobileNumber)}</strong></div>
                  <div><small>LOCATION</small><strong>{valueOrDash(selectedProfile.city)}, {valueOrDash(selectedProfile.state)}</strong></div>
                  <div><small>WALLET</small><strong>{fmtMoney(selectedProfile.walletAmount)}</strong></div>
                  <div><small>DEALS</small><strong>{fmtNum(selectedProfile.dealsCount)}</strong></div>
                  <div><small>TOTAL INVESTMENT</small><strong>{fmtMoney(selectedProfile.totalInvestment)}</strong></div>
                </div>
              ) : null}
              {profileDeals ? (
                <p className="admin-ai-analytics-hint mb-0">
                  Active deals: {fmtNum(profileDeals.activeDeals?.length || 0)} · Closed deals: {fmtNum(profileDeals.closedDeals?.length || 0)}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default AdminAIInactiveReactivatedReportPage;
