import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/OxyloansAdminHeader";
import Sidebar from "../../../SideBar/OxyloansAdminSidebar";
import axios from "axios";
import { MARKETPLACE_URL } from "../../../../config";

const BASE = MARKETPLACE_URL;
const getHeaders = () => ({
  accessToken: sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken"),
  userId: sessionStorage.getItem("userId") || localStorage.getItem("userId"),
});

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const fmtCr = (n) => {
  const v = Number(n || 0);
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  return `₹${fmt(v)}`;
};

const Metric = ({ label, value, sub, color = "primary", link }) => (
  <div className="col-md-3 col-sm-6 mb-3">
    <div className={`card border-${color} h-100`}>
      <div className="card-body text-center py-3">
        <div className="text-muted mb-1" style={{ fontSize: 12 }}>{label}</div>
        <h3 className={`text-${color} mb-0`}>{value}</h3>
        {sub && <small className="text-muted">{sub}</small>}
        {link && <div className="mt-1"><Link to={link} style={{ fontSize: 11 }}>View details →</Link></div>}
      </div>
    </div>
  </div>
);

const CeoDashboard = () => {
  const [marketStats, setMarketStats] = useState(null);
  const [collectionStats, setCollectionStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      axios.get(`${BASE}/v1/marketplace/admin/stats`, { headers: getHeaders() }),
      axios.get(`${BASE}/v1/collections/stats`, { headers: getHeaders() }),
    ]).then(([marketRes, collRes]) => {
      if (marketRes.status === "fulfilled") setMarketStats(marketRes.value.data);
      if (collRes.status === "fulfilled") setCollectionStats(collRes.value.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="main-wrapper">
        <Header /><Sidebar />
        <div className="page-wrapper">
          <div className="content text-center py-5"><div className="spinner-border" /></div>
        </div>
      </div>
    );
  }

  const ms = marketStats || {};
  const cs = collectionStats || {};

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">CEO Dashboard — Marketplace Overview</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><Link to="/mainadmindashboard">Admin</Link></li>
                  <li className="breadcrumb-item active">CEO Dashboard</li>
                </ul>
              </div>
              <div className="col-auto text-muted" style={{ fontSize: 12 }}>
                Last updated: {new Date().toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Marketplace KPIs */}
          <h5 className="mb-3">Marketplace Activity</h5>
          <div className="row">
            <Metric label="Total Loan Requests" value={fmt(ms.totalLoanRequests)} color="primary" link="/admin/marketplace" />
            <Metric label="Active Marketplace Loans" value={fmt(ms.activeMarketplaceLoans)} color="success" link="/admin/marketplace" />
            <Metric label="Total Disbursed" value={fmtCr(ms.totalDisbursedAmount)} color="info" link="/admin/disbursal-control" />
            <Metric label="Pending Disbursal" value={fmt(ms.pendingDisbursalCount)} sub="loans awaiting disbursal" color="warning" link="/admin/disbursal-control" />
          </div>
          <div className="row">
            <Metric label="Active Borrowers" value={fmt(ms.activeBorrowers)} color="primary" />
            <Metric label="Active Lenders" value={fmt(ms.activeLenders)} color="success" />
            <Metric label="Avg Loan Amount" value={fmtCr(ms.avgLoanAmount)} color="info" />
            <Metric label="Avg Interest Rate" value={`${(ms.avgInterestRate || 0).toFixed(1)}%`} sub="p.a." color="secondary" />
          </div>

          <hr />

          {/* Collections KPIs */}
          <h5 className="mb-3">Collections & Risk</h5>
          <div className="row">
            <Metric label="Total Overdue Cases" value={fmt(cs.totalCases)} color="danger" link="/admin/collections" />
            <Metric label="Open Cases" value={fmt(cs.openCases)} color="warning" link="/admin/collections" />
            <Metric label="Critical Cases" value={fmt(cs.criticalCases)} sub="90+ days overdue" color="danger" link="/admin/collections" />
            <Metric label="Total Overdue Amount" value={fmtCr(cs.totalOverdueAmount)} color="danger" link="/admin/collections" />
          </div>
          <div className="row">
            <Metric label="In Progress" value={fmt(cs.inProgressCases)} color="info" />
            <Metric label="Resolved" value={fmt(cs.resolvedCases)} color="success" />
            <Metric label="Legal Cases" value={fmt(cs.legalCases)} color="dark" />
            <div className="col-md-3 col-sm-6 mb-3">
              <div className="card border-secondary h-100">
                <div className="card-body text-center py-3">
                  <div className="text-muted mb-1" style={{ fontSize: 12 }}>Collection Rate</div>
                  <h3 className="text-secondary mb-0">
                    {cs.totalCases > 0
                      ? `${Math.round((cs.resolvedCases / cs.totalCases) * 100)}%`
                      : "—"}
                  </h3>
                  <small className="text-muted">resolved / total</small>
                </div>
              </div>
            </div>
          </div>

          <hr />

          {/* Quick Links */}
          <h5 className="mb-3">Quick Actions</h5>
          <div className="row">
            {[
              { label: "Disbursal Control", link: "/admin/disbursal-control", color: "primary", icon: "fe fe-send" },
              { label: "Collections Dashboard", link: "/admin/collections", color: "danger", icon: "fe fe-alert-circle" },
              { label: "Agent Portal", link: "/admin/agent-portal", color: "warning", icon: "fe fe-users" },
              { label: "Marketplace Admin", link: "/admin/marketplace", color: "info", icon: "fe fe-bar-chart-2" },
              { label: "Admin Settings", link: "/admin/settings", color: "secondary", icon: "fe fe-settings" },
              { label: "Escalation Tracker", link: "/escalation-dashboard", color: "dark", icon: "fe fe-alert-triangle" },
            ].map(({ label, link, color, icon }) => (
              <div key={label} className="col-md-2 col-sm-4 mb-2">
                <Link to={link} className={`btn btn-outline-${color} w-100`} style={{ fontSize: 12 }}>
                  <i className={`${icon} me-1`}></i>{label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CeoDashboard;
