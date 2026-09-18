import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaArrowLeft, FaSync } from "react-icons/fa";
import OxyloansAdminSidebar from "../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../Header/OxyloansAdminHeader";
import Footer from "../../../Footer/Footer";
import { goBackOrAdminAI, goToAdminAIDashboard } from "./adminAINavigation";
import { getAdminAILifetimeFeeWaiver } from "../../../HttpRequest/admin";
import "./AdminAIDashboard.css";

const pageSize = 20;
const fmtNum = (value) => Number(value || 0).toLocaleString("en-IN");
const fmtMoney = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);
const responseData = (payload) => payload?.data || payload || {};

const SEGMENT_GROUPS = [
  {
    title: "Waiver path",
    items: [
      { key: "all", label: "All Members", countKey: "totalCount", description: "All lifetime waiver members (Per Deal users excluded)." },
      { key: "paid", label: "Paid LIFETIME", countKey: "paidLifetimeCount", description: "Paid LIFETIME membership fee — waiver from direct payment." },
      { key: "deal", label: "Deal Offer", countKey: "dealWaiverCount", description: "Waiver from deal participation offers (no LIFETIME payment)." },
      { key: "stopped", label: "Not Participating", countKey: "participationStoppedCount", description: "No deal participation after waiver grant date." },
      { key: "multiple", label: "Taken 2+ Times", countKey: "multipleWaiverCount", description: "2+ waiver deals or waiver span over 15 years." },
    ],
  },
  {
    title: "Membership plan paid",
    items: [
      { key: "peryear", label: "1 Year", countKey: "peryearCount", description: "Latest paid plan: 1 Year (PERYEAR)." },
      { key: "fiveyears", label: "5 Years", countKey: "fiveyearsCount", description: "Latest paid plan: 5 Years (FIVEYEARS)." },
      { key: "tenyears", label: "10 Years", countKey: "tenyearsCount", description: "Latest paid plan: 10 Years (TENYEARS)." },
      { key: "lifetime", label: "14 Years", countKey: "fourteenYearPlanCount", description: "Paid 14-year LIFETIME plan (direct LIFETIME fee or latest plan is LIFETIME)." },
    ],
  },
];

const ALL_SEGMENTS = SEGMENT_GROUPS.flatMap((group) => group.items);

const AdminAILifetimeFeeWaiverPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const segment = searchParams.get("segment") || "all";
  const [summary, setSummary] = useState({});
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const activeSegment = ALL_SEGMENTS.find((item) => item.key === segment) || ALL_SEGMENTS[0];

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(Number(totalCount || 0) / pageSize)),
    [totalCount]
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = responseData(await getAdminAILifetimeFeeWaiver(pageNo, pageSize, segment));
      setSummary(data.summary || {});
      setMembers(Array.isArray(data.members) ? data.members : []);
      setTotalCount(Number(data.totalCount) || 0);
      if (data.backendError) {
        setError(data.backendError);
      }
    } catch (requestError) {
      setSummary({});
      setMembers([]);
      setTotalCount(0);
      const backendMessage = requestError?.response?.data?.backendError
        || requestError?.response?.data?.message
        || requestError?.response?.data?.errorMessage;
      const isNetwork = !requestError?.response
        && /network error|econnaborted|timeout/i.test(String(requestError?.message || ""));
      setError(
        backendMessage
          || (isNetwork
            ? "Lifetime waiver request did not reach the backend. Restart the local API on :8181, wait until /oxyloans/healthCheck is OK, then click Retry."
            : "")
          || requestError?.message
          || "Failed to load lifetime fee waiver members."
      );
    } finally {
      setLoading(false);
    }
  }, [pageNo, segment]);

  useEffect(() => {
    setPageNo(1);
  }, [segment]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const changeSegment = (nextSegment) => {
    setSearchParams({ segment: nextSegment }, { replace: true });
  };

  const openLenderProfile = (member) => {
    if (!member?.lenderId) {
      return;
    }
    const returnTo = `/adminAILifetimeFeeWaiver?segment=${segment}`;
    navigate(`/adminAIUserProfile?userId=${member.lenderId}&returnTo=${encodeURIComponent(returnTo)}`);
  };

  const pager = totalPages > 1 ? (
    <div className="admin-ai-pagination admin-ai-waiver-pager">
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        disabled={pageNo <= 1 || loading}
        onClick={() => setPageNo((current) => Math.max(1, current - 1))}
      >
        Previous
      </button>
      <span>Page {pageNo} of {totalPages}</span>
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        disabled={pageNo >= totalPages || loading}
        onClick={() => setPageNo((current) => Math.min(totalPages, current + 1))}
      >
        Next
      </button>
    </div>
  ) : null;

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid admin-ai-page">
          <div className="admin-ai-waiver-report-head">
            <div className="sba-nav-actions">
              <button type="button" className="sba-back" onClick={() => goBackOrAdminAI(navigate)}>
                <FaArrowLeft /> Back
              </button>
              <button type="button" className="sba-dash-btn" onClick={() => goToAdminAIDashboard(navigate)}>
                Admin AI Dashboard
              </button>
            </div>
            <div className="admin-ai-waiver-report-title">
              <div>
                <h2>Lifetime Fee Waiver</h2>
                <p>{activeSegment.label} · {fmtNum(totalCount)} lenders · Per Deal excluded</p>
              </div>
              <button type="button" className="admin-ai-waiver-refresh" onClick={loadData} disabled={loading}>
                <FaSync /> {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {error ? (
            <div className="alert alert-danger d-flex justify-content-between align-items-center">
              <span>{error}</span>
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={loadData}>
                Retry
              </button>
            </div>
          ) : null}

          <section className="admin-ai-waiver-report-card">
            {SEGMENT_GROUPS.map((group) => (
              <div key={group.title} className="admin-ai-lifetime-waiver-filter-group">
                <h6 className="admin-ai-lifetime-waiver-filter-title">{group.title}</h6>
                <div className="admin-ai-lifetime-waiver-filters">
                  {group.items.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={segment === item.key ? "active" : ""}
                      onClick={() => changeSegment(item.key)}
                    >
                      {item.label} ({fmtNum(summary[item.countKey])})
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {pager}

            {loading ? (
              <div className="admin-ai-empty-state">Loading lenders...</div>
            ) : members.length ? (
              <div className="table-responsive admin-ai-table-wrap">
                <table className="table table-sm table-hover admin-ai-table">
                  <thead>
                    <tr>
                      <th>Lender</th>
                      <th>Waiver Path</th>
                      <th>Latest Plan</th>
                      <th>Granted On</th>
                      <th>Waiver End</th>
                      <th>Years</th>
                      <th>2+ Times</th>
                      <th>Waiver Deals</th>
                      <th>Lifetime Fee</th>
                      <th>Stopped</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.lenderId || member.userCode}>
                        <td>
                          <button
                            type="button"
                            className="btn btn-link btn-sm p-0"
                            onClick={() => openLenderProfile(member)}
                          >
                            {valueOrDash(member.userCode)}
                          </button>
                          <div>{valueOrDash(member.name)}</div>
                          <div className="small text-muted">{valueOrDash(member.mobileNumber)}</div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              member.hasPaidLifetimeMembership ? "bg-primary" : "bg-info text-dark"
                            }`}
                          >
                            {valueOrDash(member.waiverPathLabel || member.waiverSource)}
                          </span>
                        </td>
                        <td>{valueOrDash(member.latestMembershipPaidLabel || member.membershipPlanLabel)}</td>
                        <td>{valueOrDash(member.waiverGrantedOn)}</td>
                        <td>{valueOrDash(member.waiverEndDate)}</td>
                        <td>{fmtNum(member.waiverYearsTotal)}</td>
                        <td>
                          <span className={`badge ${member.waiverTakenMultipleTimes ? "bg-danger" : "bg-secondary"}`}>
                            {member.waiverTakenMultipleTimes ? "Yes" : "No"}
                          </span>
                        </td>
                        <td>{fmtNum(member.lifetimeWaiverDealCount)}</td>
                        <td>{fmtMoney(member.paidAmount)}</td>
                        <td>
                          <span className={`badge ${member.participationStoppedAfterWaiver ? "bg-warning text-dark" : "bg-success"}`}>
                            {member.participationStoppedAfterWaiver ? "Yes" : "No"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-ai-empty-state">No lenders found in this category.</div>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminAILifetimeFeeWaiverPage;