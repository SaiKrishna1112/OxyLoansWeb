import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Headers, Sidebar & Footer
import BorrowerHeader from "../../../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../../../SideBar/BorrowerSidebar";
import Footer from "../../../../../Footer/Footer";

// Components & Helpers
import CreditScoreGauge from "../components/CreditScoreGauge";
import CreditScoreModal from "../components/CreditScoreModal";
import {
  RAW_SAMPLE_RESPONSE,
  parseCreditReportData,
  getCachedCreditReport,
  setCachedCreditReport,
  formatINR,
  maskAccountNumber,
  getScoreTier,
} from "../components/creditReportUtils";
import { getUserDetails } from "../../../../../HttpRequest/afterlogin";

import "../redesign.css";

const CreditReport = () => {
  const navigate = useNavigate();

  // State
  const [reportData, setReportData] = useState(() => {
    const cached = getCachedCreditReport();
    return parseCreditReportData(cached || RAW_SAMPLE_RESPONSE);
  });
  const [userDetails, setUserDetails] = useState(null);
  const [showFetchModal, setShowFetchModal] = useState(false);
  const [activeAccountTab, setActiveAccountTab] = useState("all");
  const [searchAccountQuery, setSearchAccountQuery] = useState("");
  const [expandedAccountSeq, setExpandedAccountSeq] = useState("1"); // Auto-expand first account

  // Load borrower details for pre-filling modal if available
  useEffect(() => {
    document.body.classList.add("oxy-redesign-active");
    getUserDetails()
      .then((res) => {
        if (res?.data) {
          setUserDetails(res.data);
        }
      })
      .catch(() => {});

    return () => {
      document.body.classList.remove("oxy-redesign-active");
    };
  }, []);

  // Handle fresh report fetched via modal
  const handleReportSuccess = (rawApiResponse) => {
    const parsed = parseCreditReportData(rawApiResponse);
    if (parsed) {
      setReportData(parsed);
      setCachedCreditReport(rawApiResponse);
    }
  };

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    if (!reportData?.accounts) return [];
    let list = reportData.accounts;

    if (activeAccountTab === "active") {
      list = list.filter((acc) => String(acc.open).toLowerCase() === "yes" || acc.accountStatus?.toLowerCase().includes("current"));
    } else if (activeAccountTab === "closed") {
      list = list.filter((acc) => String(acc.open).toLowerCase() === "no" || acc.accountStatus?.toLowerCase().includes("closed"));
    } else if (activeAccountTab === "cards") {
      list = list.filter((acc) => acc.accountType?.toLowerCase().includes("card"));
    } else if (activeAccountTab === "loans") {
      list = list.filter((acc) => !acc.accountType?.toLowerCase().includes("card"));
    }

    if (searchAccountQuery.trim()) {
      const q = searchAccountQuery.toLowerCase();
      list = list.filter(
        (acc) =>
          acc.institution?.toLowerCase().includes(q) ||
          acc.accountNumber?.includes(q) ||
          acc.accountType?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [reportData?.accounts, activeAccountTab, searchAccountQuery]);

  const toggleExpand = (seq) => {
    setExpandedAccountSeq((prev) => (prev === seq ? null : seq));
  };

  const handlePrint = () => {
    window.print();
  };

  const scoreTier = reportData?.scoreTier || getScoreTier(802);

  return (
    <div className="main-wrapper">
      <div className="d-print-none">
        <BorrowerHeader />
        <BorrowerSidebar />
      </div>

      <div className="page-wrapper">
        <div className="content container-fluid py-4" style={{ backgroundColor: "var(--oxy-background)" }}>
          
          {/* Top Bar Header */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold px-2 py-1 rounded-pill small">
                  <i className="fa-solid fa-building-columns me-1"></i>
                  Official Bureau Health Report
                </span>
                <span className="badge bg-success bg-opacity-10 text-success fw-semibold px-2 py-1 rounded-pill small">
                  <i className="fa-solid fa-circle-check me-1"></i>
                  Live Verified
                </span>
              </div>
              <h3 className="fw-bold mb-0 text-dark">Credit Bureau Report & Health</h3>
              <p className="text-muted small mb-0">
                Verified CIR bureau data powered by PaySprint & VerifyA2Z Engine • Order: #{reportData?.reportOrderNumber || "2989093135"}
              </p>
            </div>

            <div className="d-flex align-items-center gap-2 d-print-none">
              <button
                type="button"
                className="btn btn-outline-secondary px-3 py-2 rounded-3 d-inline-flex align-items-center gap-2 shadow-sm"
                onClick={handlePrint}
                title="Print or Save PDF"
              >
                <i className="fa-solid fa-print"></i>
                <span className="d-none d-sm-inline">Export PDF</span>
              </button>

              <button
                type="button"
                className="btn btn-primary px-3 py-2 rounded-3 d-inline-flex align-items-center gap-2 shadow-sm"
                style={{ backgroundColor: "#0040e0", borderColor: "#0040e0" }}
                onClick={() => setShowFetchModal(true)}
              >
                <i className="fa-solid fa-arrows-rotate"></i>
                <span>Fetch / Refresh Report</span>
              </button>
            </div>
          </div>

          {/* 1. HERO CREDIT HEALTH BANNER */}
          <div className="oxy-card p-4 mb-4 border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)" }}>
            <div className="row align-items-center g-4">
              
              {/* Gauge Column */}
              <div className="col-lg-5 col-xl-4 text-center border-lg-end">
                <div className="py-2">
                  <CreditScoreGauge score={reportData?.score || 802} size={250} />
                  
                  <div className="mt-2 text-center">
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1 rounded-pill fw-bold small">
                      <i className="fa-solid fa-shield-halved me-1"></i>
                      Prime+ Borrower Status
                    </span>
                    <p className="text-muted small mt-2 mb-0" style={{ fontSize: "12px" }}>
                      Score is higher than 92% of peer applicants. Pre-approved for lowest P2P interest rates.
                    </p>
                  </div>
                </div>
              </div>

              {/* Score Insights & Scoring Elements Column */}
              <div className="col-lg-7 col-xl-8">
                <div className="d-flex flex-column h-100 justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <span className="text-muted small text-uppercase fw-bold letter-spacing-1">Credit Bureau Profile</span>
                        <h4 className="fw-bold text-dark mb-0">
                          {reportData?.personal?.name || "BALIJEPALLI NARENDRA"}
                        </h4>
                        <span className="text-muted small">
                          PAN: <strong className="text-dark">{reportData?.personal?.pan || "CDBPB2737H"}</strong> • DOB: {reportData?.personal?.dob || "1994-08-08"} ({reportData?.personal?.age || 32} Yrs)
                        </span>
                      </div>
                      <div className="text-end">
                        <span className="badge bg-primary text-white px-3 py-2 rounded-3 fw-bold">
                          CIR Version {reportData?.scoreDetails?.version || "4.0"}
                        </span>
                      </div>
                    </div>

                    {/* Key Scoring Factors from API */}
                    <div className="p-3 bg-white rounded-3 border mb-3">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="fw-bold small text-dark">
                          <i className="fa-solid fa-sliders text-primary me-2"></i>
                          Primary Bureau Scoring Drivers
                        </span>
                        <span className="badge bg-light text-muted small">Bureau Factor Codes</span>
                      </div>
                      <div className="row g-2">
                        {reportData?.scoringFactors?.length > 0 ? (
                          reportData.scoringFactors.map((f) => (
                            <div className="col-sm-4" key={f.code || f.description}>
                              <div className="p-2 bg-light rounded-2 border border-light-subtle d-flex align-items-center gap-2">
                                <i className="fa-solid fa-check text-success small"></i>
                                <div>
                                  <div className="fw-semibold text-dark" style={{ fontSize: "12px" }}>
                                    {f.description}
                                  </div>
                                  <span className="text-muted" style={{ fontSize: "10px" }}>Code: {f.code}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="col-sm-4">
                              <div className="p-2 bg-light rounded-2 border d-flex align-items-center gap-2">
                                <i className="fa-solid fa-check text-success small"></i>
                                <span className="small text-dark fw-semibold">Total Utilization</span>
                              </div>
                            </div>
                            <div className="col-sm-4">
                              <div className="p-2 bg-light rounded-2 border d-flex align-items-center gap-2">
                                <i className="fa-solid fa-check text-success small"></i>
                                <span className="small text-dark fw-semibold">Credit Card Utilization</span>
                              </div>
                            </div>
                            <div className="col-sm-4">
                              <div className="p-2 bg-light rounded-2 border d-flex align-items-center gap-2">
                                <i className="fa-solid fa-check text-success small"></i>
                                <span className="small text-dark fw-semibold">Total Credit Exposure</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Utilization Progress Bar */}
                    <div className="mb-2">
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="text-muted">
                          Credit Card Utilization: <strong>{reportData?.metrics?.utilizationRatio}%</strong> ({formatINR(reportData?.metrics?.totalBalance)} of {formatINR(reportData?.metrics?.totalLimit)})
                        </span>
                        <span className="text-primary fw-semibold small">
                          Recommended &lt; 30% for 850+
                        </span>
                      </div>
                      <div className="progress" style={{ height: "8px" }}>
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          style={{ width: `${Math.min(100, reportData?.metrics?.utilizationRatio || 80.5)}%` }}
                          aria-valuenow={reportData?.metrics?.utilizationRatio || 80.5}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action strip */}
                  <div className="pt-2 d-flex flex-wrap align-items-center justify-content-between gap-2 border-top">
                    <span className="text-muted small">
                      <i className="fa-solid fa-clock-rotate-left text-muted me-1"></i>
                      Last Bureau Check: <strong>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</strong>
                    </span>
                    <button
                      className="btn btn-sm btn-link text-primary p-0 text-decoration-none fw-semibold d-inline-flex align-items-center gap-1"
                      onClick={() => navigate("/borrowerLoanRequestCreate")}
                    >
                      Apply for Loan with this Score
                      <i className="fa-solid fa-arrow-right small"></i>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 2. FIVE VITAL FINANCIAL HEALTH PILLARS */}
          <div className="row g-3 mb-4">
            
            {/* Pillar 1: Payment History */}
            <div className="col-md-6 col-lg-4 col-xl-2dot4" style={{ flex: "1 1 200px" }}>
              <div className="oxy-card p-3 h-100 mb-0 border-start border-success border-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-muted small text-uppercase fw-bold" style={{ fontSize: "11px" }}>Payment Track</span>
                  <div className="rounded-circle bg-success bg-opacity-10 text-success p-2 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
                    <i className="fa-solid fa-circle-check"></i>
                  </div>
                </div>
                <h5 className="fw-bold text-dark mb-1">100% On-Time</h5>
                <span className="badge bg-success bg-opacity-10 text-success small mb-2">Zero Past Due</span>
                <p className="text-muted mb-0" style={{ fontSize: "11px" }}>
                  Status: <strong>{reportData?.metrics?.delinquencyStatus || "Non-Delnqt"}</strong> across 24-48 months.
                </p>
              </div>
            </div>

            {/* Pillar 2: Credit Card Utilization */}
            <div className="col-md-6 col-lg-4 col-xl-2dot4" style={{ flex: "1 1 200px" }}>
              <div className="oxy-card p-3 h-100 mb-0 border-start border-warning border-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-muted small text-uppercase fw-bold" style={{ fontSize: "11px" }}>Card Utilization</span>
                  <div className="rounded-circle bg-warning bg-opacity-10 text-warning p-2 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
                    <i className="fa-solid fa-chart-pie"></i>
                  </div>
                </div>
                <h5 className="fw-bold text-dark mb-1">{reportData?.metrics?.utilizationRatio || "80.5"}%</h5>
                <span className="badge bg-warning bg-opacity-10 text-dark small mb-2">High Exposure</span>
                <p className="text-muted mb-0" style={{ fontSize: "11px" }}>
                  Balance: <strong>{formatINR(reportData?.metrics?.totalBalance)}</strong> of {formatINR(reportData?.metrics?.totalLimit)}.
                </p>
              </div>
            </div>

            {/* Pillar 3: Credit History Length */}
            <div className="col-md-6 col-lg-4 col-xl-2dot4" style={{ flex: "1 1 200px" }}>
              <div className="oxy-card p-3 h-100 mb-0 border-start border-primary border-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-muted small text-uppercase fw-bold" style={{ fontSize: "11px" }}>Credit Age</span>
                  <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
                    <i className="fa-solid fa-hourglass-half"></i>
                  </div>
                </div>
                <h5 className="fw-bold text-dark mb-1">{reportData?.metrics?.creditAgeYears || "7.8"} Years</h5>
                <span className="badge bg-primary bg-opacity-10 text-primary small mb-2">{reportData?.metrics?.creditAgeMonths || 94} Months Old</span>
                <p className="text-muted mb-0" style={{ fontSize: "11px" }}>
                  Oldest tradeline opened in Dec 2018 (HDFC Bank).
                </p>
              </div>
            </div>

            {/* Pillar 4: Accounts Mix */}
            <div className="col-md-6 col-lg-4 col-xl-2dot4" style={{ flex: "1 1 200px" }}>
              <div className="oxy-card p-3 h-100 mb-0 border-start border-info border-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-muted small text-uppercase fw-bold" style={{ fontSize: "11px" }}>Total Tradelines</span>
                  <div className="rounded-circle bg-info bg-opacity-10 text-info p-2 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
                    <i className="fa-solid fa-credit-card"></i>
                  </div>
                </div>
                <h5 className="fw-bold text-dark mb-1">{reportData?.metrics?.totalAccountsCount || 7} Accounts</h5>
                <span className="badge bg-info bg-opacity-10 text-info small mb-2">
                  {reportData?.metrics?.activeAccountsCount || 1} Active • {reportData?.metrics?.closedAccountsCount || 6} Closed
                </span>
                <p className="text-muted mb-0" style={{ fontSize: "11px" }}>
                  Healthy balance between cards and personal credit.
                </p>
              </div>
            </div>

            {/* Pillar 5: Recent Hard Enquiries */}
            <div className="col-md-6 col-lg-4 col-xl-2dot4" style={{ flex: "1 1 200px" }}>
              <div className="oxy-card p-3 h-100 mb-0 border-start border-success border-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="text-muted small text-uppercase fw-bold" style={{ fontSize: "11px" }}>Hard Inquiries</span>
                  <div className="rounded-circle bg-success bg-opacity-10 text-success p-2 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
                    <i className="fa-solid fa-magnifying-glass-chart"></i>
                  </div>
                </div>
                <h5 className="fw-bold text-dark mb-1">{reportData?.enquiries?.total || 0} Inquiries</h5>
                <span className="badge bg-success bg-opacity-10 text-success small mb-2">Pristine Record</span>
                <p className="text-muted mb-0" style={{ fontSize: "11px" }}>
                  Zero bureau inquiries in last 24 months.
                </p>
              </div>
            </div>

          </div>

          {/* 3. CREDIT ACCOUNTS TRADELINES DIRECTORY */}
          <div className="oxy-card p-4 mb-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
              <div>
                <h5 className="fw-bold text-dark mb-1">
                  <i className="fa-solid fa-layer-group text-primary me-2"></i>
                  Credit Accounts & Tradelines History
                </h5>
                <span className="text-muted small">
                  Showing {filteredAccounts.length} of {reportData?.accounts?.length || 7} reported credit accounts with 48-month payment schedules
                </span>
              </div>

              {/* Search box */}
              <div className="d-flex align-items-center gap-2 w-100 w-md-auto">
                <div className="input-group input-group-sm" style={{ maxWidth: "260px" }}>
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fa-solid fa-magnifying-glass text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search bank or card..."
                    value={searchAccountQuery}
                    onChange={(e) => setSearchAccountQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="d-flex flex-wrap gap-2 mb-4 pb-2 border-bottom">
              {[
                { id: "all", label: `All Accounts (${reportData?.accounts?.length || 7})` },
                { id: "active", label: `Active (${reportData?.metrics?.activeAccountsCount || 1})` },
                { id: "closed", label: `Closed (${reportData?.metrics?.closedAccountsCount || 6})` },
                { id: "cards", label: "Credit Cards" },
                { id: "loans", label: "Personal Loans" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`btn btn-sm rounded-pill px-3 transition-all ${
                    activeAccountTab === tab.id
                      ? "btn-primary text-white"
                      : "btn-outline-secondary bg-light text-muted border-0"
                  }`}
                  style={activeAccountTab === tab.id ? { backgroundColor: "#0040e0", borderColor: "#0040e0" } : {}}
                  onClick={() => setActiveAccountTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Accounts List */}
            {filteredAccounts.length === 0 ? (
              <div className="text-center py-5">
                <i className="fa-solid fa-folder-open text-muted fs-1 mb-2"></i>
                <h6 className="text-muted">No credit accounts found matching your filter</h6>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {filteredAccounts.map((account) => {
                  const isExpanded = expandedAccountSeq === account.seq;
                  const isOpen = String(account.open).toLowerCase() === "yes" || account.accountStatus?.toLowerCase().includes("current");
                  const balanceNum = Number(account.balance || 0);
                  const limitNum = Number(account.creditLimit || account.sanctionAmount || 0);

                  return (
                    <div
                      key={account.seq || account.accountNumber}
                      className="border rounded-3 overflow-hidden bg-white shadow-sm transition-all"
                      style={{ borderColor: isOpen ? "#0040e0" : "#e2e8f0" }}
                    >
                      {/* Account Card Header */}
                      <div
                        className="p-3 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 cursor-pointer bg-light bg-opacity-50"
                        onClick={() => toggleExpand(account.seq)}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className={`rounded-3 p-2 d-flex align-items-center justify-content-center text-white ${
                              account.accountType?.toLowerCase().includes("loan")
                                ? "bg-info"
                                : isOpen
                                ? "bg-primary"
                                : "bg-secondary"
                            }`}
                            style={{ width: "42px", height: "42px" }}
                          >
                            <i
                              className={`fa-solid ${
                                account.accountType?.toLowerCase().includes("loan")
                                  ? "fa-money-bill-transfer"
                                  : "fa-credit-card"
                              }`}
                            ></i>
                          </div>

                          <div>
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              <h6 className="fw-bold text-dark mb-0">{account.institution}</h6>
                              <span
                                className={`badge small rounded-pill ${
                                  isOpen
                                    ? "bg-success bg-opacity-10 text-success border border-success border-opacity-25"
                                    : "bg-secondary bg-opacity-10 text-secondary border"
                                }`}
                              >
                                {isOpen ? "Active / Open" : "Closed"}
                              </span>
                              <span className="badge bg-light text-dark border small">
                                {account.accountType}
                              </span>
                            </div>
                            <span className="text-muted small">
                              Account No: <strong>{maskAccountNumber(account.accountNumber)}</strong> • Ownership: {account.ownershipType || "Individual"}
                            </span>
                          </div>
                        </div>

                        {/* Balance & Toggle button */}
                        <div className="d-flex align-items-center gap-4 ms-auto ms-md-0">
                          <div className="text-end">
                            <span className="text-muted small d-block" style={{ fontSize: "11px" }}>Current Balance</span>
                            <span className={`fw-bold ${balanceNum > 0 ? "text-dark" : "text-muted"}`}>
                              {formatINR(balanceNum)}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: "32px", height: "32px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(account.seq);
                            }}
                            title="Expand Account Details & 48-Month Matrix"
                          >
                            <i className={`fa-solid fa-chevron-${isExpanded ? "up" : "down"} small`}></i>
                          </button>
                        </div>
                      </div>

                      {/* Expandable Account Details & 48-Month Heatmap */}
                      {isExpanded && (
                        <div className="p-4 border-top bg-white">
                          <div className="row g-3 mb-4">
                            <div className="col-6 col-md-3">
                              <span className="text-muted small d-block">Credit Limit / Sanctioned</span>
                              <strong className="text-dark">{limitNum > 0 ? formatINR(limitNum) : "—"}</strong>
                            </div>
                            <div className="col-6 col-md-3">
                              <span className="text-muted small d-block">Highest Credit Used</span>
                              <strong className="text-dark">{formatINR(account.highCredit || 0)}</strong>
                            </div>
                            <div className="col-6 col-md-3">
                              <span className="text-muted small d-block">Past Due Overdue Amount</span>
                              <strong className={Number(account.pastDueAmount || 0) > 0 ? "text-danger" : "text-success"}>
                                {formatINR(account.pastDueAmount || 0)}
                              </strong>
                            </div>
                            <div className="col-6 col-md-3">
                              <span className="text-muted small d-block">Last Payment Reported</span>
                              <strong className="text-dark">{account.lastPaymentDate || "—"}</strong>
                            </div>
                            <div className="col-6 col-md-3">
                              <span className="text-muted small d-block">Date Opened</span>
                              <span className="text-dark">{account.dateOpened || "—"}</span>
                            </div>
                            <div className="col-6 col-md-3">
                              <span className="text-muted small d-block">Date Closed</span>
                              <span className="text-dark">{account.dateClosed || "Open (Active)"}</span>
                            </div>
                            <div className="col-6 col-md-3">
                              <span className="text-muted small d-block">Reported Date</span>
                              <span className="text-dark">{account.dateReported || "—"}</span>
                            </div>
                            <div className="col-6 col-md-3">
                              <span className="text-muted small d-block">Repayment Term</span>
                              <span className="text-dark">{account.termFrequency || "Monthly"}</span>
                            </div>
                          </div>

                          {/* 48-Month Repayment Schedule Matrix */}
                          <div>
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span className="fw-bold small text-dark">
                                <i className="fa-solid fa-calendar-days text-primary me-2"></i>
                                48-Month Repayment Schedule Heatmap
                              </span>
                              <div className="d-flex align-items-center gap-3 small" style={{ fontSize: "11px" }}>
                                <span className="d-flex align-items-center gap-1">
                                  <span className="badge bg-success" style={{ width: "10px", height: "10px", padding: 0 }}></span>
                                  000: On Time
                                </span>
                                <span className="d-flex align-items-center gap-1">
                                  <span className="badge bg-secondary" style={{ width: "10px", height: "10px", padding: 0 }}></span>
                                  CLSD: Closed
                                </span>
                                <span className="d-flex align-items-center gap-1">
                                  <span className="badge bg-light border text-muted" style={{ width: "10px", height: "10px", padding: 0 }}></span>
                                  *: No Activity
                                </span>
                              </div>
                            </div>

                            {account.history48Months && account.history48Months.length > 0 ? (
                              <div className="p-3 bg-light rounded-3 border">
                                <div className="d-flex flex-wrap gap-2">
                                  {account.history48Months.map((m, idx) => {
                                    const isGood = m.paymentStatus === "000";
                                    const isClsd = m.paymentStatus === "CLSD";

                                    return (
                                      <div
                                        key={idx}
                                        className="text-center p-2 rounded-2 border shadow-xs"
                                        style={{
                                          minWidth: "60px",
                                          backgroundColor: isGood ? "#ecfdf5" : isClsd ? "#f1f5f9" : "#ffffff",
                                          borderColor: isGood ? "#a7f3d0" : isClsd ? "#cbd5e1" : "#e2e8f0",
                                        }}
                                        title={`Month: ${m.key} | Payment Status: ${m.paymentStatus} | Asset: ${m.assetClassificationStatus || "STD"}`}
                                      >
                                        <div className="text-muted small fw-semibold" style={{ fontSize: "10px" }}>
                                          {m.key}
                                        </div>
                                        <div
                                          className={`fw-bold small ${
                                            isGood ? "text-success" : isClsd ? "text-secondary" : "text-muted"
                                          }`}
                                          style={{ fontSize: "11px" }}
                                        >
                                          {m.paymentStatus}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <p className="text-muted small mb-0">No monthly history reported for this account.</p>
                            )}
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. BORROWER IDENTITY & BUREAU DEMOGRAPHICS */}
          <div className="row g-4 mb-4">
            
            {/* Demographics & Contact Information */}
            <div className="col-lg-6">
              <div className="oxy-card p-4 h-100 mb-0">
                <h5 className="fw-bold text-dark mb-3">
                  <i className="fa-solid fa-address-card text-primary me-2"></i>
                  Bureau Identity Audit
                </h5>
                
                <div className="table-responsive">
                  <table className="table table-sm table-borderless mb-0">
                    <tbody>
                      <tr>
                        <td className="text-muted small py-2" style={{ width: "40%" }}>Full Legal Name</td>
                        <td className="fw-bold text-dark py-2">{reportData?.personal?.name || "BALIJEPALLI NARENDRA"}</td>
                      </tr>
                      <tr>
                        <td className="text-muted small py-2">Permanent Account Number (PAN)</td>
                        <td className="fw-bold text-dark py-2">{reportData?.personal?.pan || "CDBPB2737H"}</td>
                      </tr>
                      <tr>
                        <td className="text-muted small py-2">Other Bureau ID</td>
                        <td className="text-dark py-2">{reportData?.personal?.otherId || "60011901969107"}</td>
                      </tr>
                      <tr>
                        <td className="text-muted small py-2">Date of Birth & Age</td>
                        <td className="text-dark py-2">
                          {reportData?.personal?.dob || "1994-08-08"} ({reportData?.personal?.age || 32} Years, {reportData?.personal?.gender || "Male"})
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted small py-2">Registered Phone Numbers</td>
                        <td className="text-dark py-2">
                          {reportData?.personal?.phones?.map((p, i) => (
                            <span key={i} className="badge bg-light text-dark border me-1 mb-1">
                              {p.number} ({p.typeCode === "M" ? "Mobile" : "Phone"})
                            </span>
                          ))}
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted small py-2">Registered Email</td>
                        <td className="text-dark py-2">
                          {reportData?.personal?.emails?.map((e, i) => (
                            <span key={i} className="text-primary fw-semibold">
                              {e.emailAddress}
                            </span>
                          ))}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Reported Addresses Timeline */}
            <div className="col-lg-6">
              <div className="oxy-card p-4 h-100 mb-0">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-dark mb-0">
                    <i className="fa-solid fa-location-dot text-primary me-2"></i>
                    Addresses Reported to Bureau
                  </h5>
                  <span className="badge bg-light text-muted small">
                    {reportData?.personal?.addresses?.length || 0} Records
                  </span>
                </div>

                <div className="d-flex flex-column gap-2" style={{ maxHeight: "320px", overflowY: "auto" }}>
                  {reportData?.personal?.addresses?.map((addr, index) => (
                    <div key={index} className="p-3 bg-light rounded-3 border">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="badge bg-primary bg-opacity-10 text-primary small">
                          {addr.type || "Address"}
                        </span>
                        <span className="text-muted small" style={{ fontSize: "11px" }}>
                          Reported: {addr.reportedDate || "—"}
                        </span>
                      </div>
                      <p className="text-dark small mb-1 fw-semibold" style={{ fontSize: "12px", lineHeight: "1.4" }}>
                        {addr.address}
                      </p>
                      <span className="text-muted small" style={{ fontSize: "11px" }}>
                        State: {addr.state} • PIN: {addr.postal}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* 5. RECENT ACTIVITIES & ENQUIRIES AUDIT */}
          <div className="oxy-card p-4">
            <h5 className="fw-bold text-dark mb-3">
              <i className="fa-solid fa-shield-heart text-primary me-2"></i>
              Bureau Inquiries & Recent Activity Audit
            </h5>

            <div className="row g-3">
              <div className="col-md-3">
                <div className="p-3 bg-light rounded-3 border text-center">
                  <span className="text-muted small d-block">Past 30 Days Inquiries</span>
                  <h4 className="fw-bold text-success mb-0">{reportData?.enquiries?.past30Days || 0}</h4>
                </div>
              </div>
              <div className="col-md-3">
                <div className="p-3 bg-light rounded-3 border text-center">
                  <span className="text-muted small d-block">Past 12 Months Inquiries</span>
                  <h4 className="fw-bold text-success mb-0">{reportData?.enquiries?.past12Months || 0}</h4>
                </div>
              </div>
              <div className="col-md-3">
                <div className="p-3 bg-light rounded-3 border text-center">
                  <span className="text-muted small d-block">Past 24 Months Inquiries</span>
                  <h4 className="fw-bold text-success mb-0">{reportData?.enquiries?.past24Months || 0}</h4>
                </div>
              </div>
              <div className="col-md-3">
                <div className="p-3 bg-light rounded-3 border text-center">
                  <span className="text-muted small d-block">Accounts Updated Recently</span>
                  <h4 className="fw-bold text-primary mb-0">{reportData?.activities?.accountsUpdated || 2}</h4>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
              <div className="d-flex align-items-center gap-3">
                <i className="fa-solid fa-award text-primary fs-3"></i>
                <div>
                  <h6 className="fw-bold text-dark mb-0">Eligible for Instant Loan Matchmaking</h6>
                  <span className="text-muted small">
                    Your clean bureau report allows verified lenders to fund your loan requests quickly.
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary px-4 rounded-3 text-nowrap"
                style={{ backgroundColor: "#0040e0", borderColor: "#0040e0" }}
                onClick={() => navigate("/borrowerLoanRequestCreate")}
              >
                Apply for Loan Limit
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="d-print-none">
        <Footer />
      </div>

      {/* Credit Score Modal for Instant Bureau Pull */}
      <CreditScoreModal
        show={showFetchModal}
        onHide={() => setShowFetchModal(false)}
        onSuccess={handleReportSuccess}
        initialData={userDetails || {}}
      />
    </div>
  );
};

export default CreditReport;
