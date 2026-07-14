import React from "react";
import { Outlet } from "react-router-dom";
import { PageShell } from "../adminAIDashboardShared";
import "./OfferManagement.css";

const OfferManagementLayout = () => (
  <PageShell
    title="Offer Management"
    breadcrumb={<li className="breadcrumb-item active">3-segment lender reactivation</li>}
  >
    <div className="offer-management-module">
      <Outlet />
    </div>
  </PageShell>
);

export default OfferManagementLayout;
