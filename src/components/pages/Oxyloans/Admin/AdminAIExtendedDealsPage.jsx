import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { goBackOrAdminAI } from "./adminAINavigation";
import OxyloansAdminSidebar from "../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../Header/OxyloansAdminHeader";
import Footer from "../../../Footer/Footer";
import AdminAIExtendedDealsPanel from "./AdminAIExtendedDealsPanel";
import "./AdminAIDashboard.css";

const AdminAIExtendedDealsPage = () => {
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
                <FaArrowLeft /> Back
              </button>
              <span className="admin-ai-pro-breadcrumb">Admin / AI Dashboard / Extended Deals</span>
            </div>
            <AdminAIExtendedDealsPanel />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default AdminAIExtendedDealsPage;
