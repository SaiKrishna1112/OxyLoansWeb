import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminAILenderCampaignHistoryPanel from "./AdminAILenderCampaignHistoryPanel";

const AdminAILenderCampaignHistoryPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const segment = searchParams.get("segment") || "";
  const segmentLabel = searchParams.get("segmentLabel") || "All segments";
  const batchId = searchParams.get("batchId") || "";

  return (
    <div className="admin-ai-page-shell">
      <div className="admin-ai-dashboard-wrap">
        {!batchId ? (
          <div className="admin-ai-page-head">
            <button type="button" className="admin-ai-reset-btn" onClick={() => navigate("/adminAIDashboard")}>
              Back to Dashboard
            </button>
          </div>
        ) : null}
        <AdminAILenderCampaignHistoryPanel
          segment={segment}
          segmentLabel={segmentLabel}
          onClose={() => navigate("/adminAIDashboard")}
        />
      </div>
    </div>
  );
};

export default AdminAILenderCampaignHistoryPage;