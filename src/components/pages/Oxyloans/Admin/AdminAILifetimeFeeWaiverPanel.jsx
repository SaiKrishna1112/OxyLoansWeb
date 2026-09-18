import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaAward, FaSync } from "react-icons/fa";
import { getAdminAILifetimeFeeWaiver } from "../../../HttpRequest/admin";

const fmtNum = (value) => Number(value || 0).toLocaleString("en-IN");
const responseData = (payload) => payload?.data || payload || {};

const SEGMENT_GROUPS = [
  {
    title: "How waiver was earned",
    items: [
      { key: "all", label: "Total", countKey: "totalCount", hint: "All lifetime waiver members (Per Deal excluded)" },
      { key: "paid", label: "Paid LIFETIME", countKey: "paidLifetimeCount", hint: "Paid LIFETIME membership fee directly (not deal offer)" },
      { key: "deal", label: "Deal Offer", countKey: "dealWaiverCount", hint: "Waiver from deal participation offer" },
      { key: "stopped", label: "Not Participating", countKey: "participationStoppedCount", hint: "No deal participation after waiver grant" },
    ],
  },
  {
    title: "Latest membership plan paid",
    items: [
      { key: "peryear", label: "1 Year", countKey: "peryearCount", hint: "Latest completed payment: 1-year plan" },
      { key: "fiveyears", label: "5 Years", countKey: "fiveyearsCount", hint: "Latest completed payment: 5-year plan" },
      { key: "tenyears", label: "10 Years", countKey: "tenyearsCount", hint: "Latest completed payment: 10-year plan" },
      { key: "lifetime", label: "14 Years", countKey: "fourteenYearPlanCount", hint: "Paid 14-year LIFETIME plan (includes direct LIFETIME fee payers)" },
    ],
  },
];

const AdminAILifetimeFeeWaiverPanel = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const openReport = (segment = "all") => {
    navigate(`/adminAILifetimeFeeWaiver?segment=${segment}`);
  };

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = responseData(await getAdminAILifetimeFeeWaiver(1, 1, "all", true));
      setSummary(data.summary || {});
      if (data.backendError) {
        setError(data.backendError);
      }
    } catch (requestError) {
      setSummary({});
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
          || "Failed to load lifetime fee waiver summary."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return (
    <section className="admin-ai-waiver-board">
      <div className="admin-ai-waiver-board-head">
        <span className="admin-ai-waiver-board-icon" aria-hidden="true">
          <FaAward />
        </span>
        <div>
          <h2>Lifetime Fee Waiver Members</h2>
          <p>
            See how the waiver was earned, and which membership plan was last paid.
            Per Deal users are excluded. Click a count to open that list.
          </p>
        </div>
        <div className="admin-ai-waiver-board-actions">
          <button
            type="button"
            className="admin-ai-waiver-refresh"
            onClick={loadSummary}
            disabled={loading}
          >
            <FaSync /> {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button type="button" className="admin-ai-waiver-open-btn" onClick={() => openReport("all")}>
            Open Report
          </button>
        </div>
      </div>

      {error ? (
        <div className="alert alert-danger d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <button type="button" className="btn btn-sm btn-outline-danger" onClick={loadSummary}>
            Retry
          </button>
        </div>
      ) : null}

      <div className="admin-ai-waiver-board-grid">
        {SEGMENT_GROUPS.map((group) => (
          <div key={group.title} className="admin-ai-waiver-group">
            <h3>{group.title}</h3>
            <div className="admin-ai-waiver-tiles">
              {group.items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`admin-ai-waiver-tile admin-ai-waiver-tile--${item.key}`}
                  onClick={() => openReport(item.key)}
                  title={item.hint}
                >
                  <small>{item.label}</small>
                  <strong>{loading ? "..." : fmtNum(summary[item.countKey])}</strong>
                  <em>View list</em>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AdminAILifetimeFeeWaiverPanel;