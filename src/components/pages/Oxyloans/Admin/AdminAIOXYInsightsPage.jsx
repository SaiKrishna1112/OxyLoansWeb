import React from "react";
import { useNavigate } from "react-router-dom";
import { goBackOrAdminAI } from "./adminAINavigation";
import OxyloansAdminSidebar from "../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../Header/OxyloansAdminHeader";
import Footer from "../../../Footer/Footer";
import AdminAIOXYInsightsPanel from "./AdminAIOXYInsightsPanel";
import "./AdminAIDashboard.css";

const AdminAIOXYInsightsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid admin-ai-page-shell">
          <div className="admin-ai-dashboard-wrap">
            <div className="admin-ai-page-head">
              <button
                type="button"
                className="admin-ai-reset-btn"
                onClick={() => goBackOrAdminAI(navigate)}
              >
                Back to Dashboard
              </button>
              <span className="admin-ai-pro-breadcrumb">Admin / AI Dashboard / OXYINSIGHTS</span>
            </div>
            <AdminAIOXYInsightsPanel />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default AdminAIOXYInsightsPage;