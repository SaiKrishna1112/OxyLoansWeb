import React, { useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { goBackOrAdminAI, goToAdminAIDashboard } from "./adminAINavigation";
import { PageShell } from "./adminAIDashboardShared";
import AdminCmsDealPaymentModal from "./AdminCmsDealPaymentModal";
import "./AdminAIDashboard.css";

export const buildCmsLenderListPath = ({
  dealId,
  dealName,
  paymentDate,
  cmsPaymentId,
  returnsType,
} = {}) => {
  const q = new URLSearchParams();
  if (dealName) q.set("name", dealName);
  if (paymentDate) q.set("date", paymentDate);
  if (cmsPaymentId) q.set("cmsPaymentId", String(cmsPaymentId));
  if (returnsType) q.set("type", returnsType);
  const qs = q.toString();
  return `/adminAIDashboard/cms-payments/lenders/${dealId}${qs ? `?${qs}` : ""}`;
};

const AdminCmsDealLendersPage = () => {
  const navigate = useNavigate();
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const [refreshNonce, setRefreshNonce] = useState(0);

  if (!dealId) {
    return <Navigate to="/adminAIDashboard/cms-payments" replace />;
  }

  const dealName = searchParams.get("name") || "";
  const paymentDate = searchParams.get("date") || "";
  const cmsPaymentId = searchParams.get("cmsPaymentId") || "";
  const returnsType = searchParams.get("type") || "";

  return (
    <PageShell
      title={dealName || `Deal #${dealId} lenders`}
      actions={
        <div className="ai-feature-header-nav">
          <button
            type="button"
            className="sba-back"
            onClick={() => goBackOrAdminAI(navigate, "/adminAIDashboard/cms-payments")}
          >
            <i className="fas fa-arrow-left" />
            Back
          </button>
          <button
            type="button"
            className="sba-dash-btn"
            onClick={() => navigate("/adminAIDashboard/cms-payments")}
          >
            CMS Payments
          </button>
          <button type="button" className="sba-dash-btn" onClick={() => goToAdminAIDashboard(navigate)}>
            Admin AI Dashboard
          </button>
          <button
            type="button"
            className="btn btn-success btn-sm"
            onClick={() => setRefreshNonce((n) => n + 1)}
          >
            <i className="fas fa-sync-alt me-1" />
            Refresh
          </button>
        </div>
      }
    >
      <AdminCmsDealPaymentModal
        key={refreshNonce}
        asPage
        dealId={dealId}
        dealName={dealName}
        initialPaymentDate={paymentDate}
        initialCmsPaymentId={cmsPaymentId}
        initialReturnsType={returnsType}
      />
    </PageShell>
  );
};

export default AdminCmsDealLendersPage;