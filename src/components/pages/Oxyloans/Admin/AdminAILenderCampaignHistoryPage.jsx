import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { goBackOrAdminAI, YEAR_WISE_REFERRALS_PATH } from "./adminAINavigation";
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
            <button type="button" className="admin-ai-reset-btn" onClick={() => goBackOrAdminAI(navigate)}>
              Back to Dashboard
            </button>
          </div>
        ) : null}
        <AdminAILenderCampaignHistoryPanel
          segment={segment}
          segmentLabel={segmentLabel}
          onClose={() => goBackOrAdminAI(navigate)}
        />
      </div>
    </div>
  );
};

export default AdminAILenderCampaignHistoryPage;