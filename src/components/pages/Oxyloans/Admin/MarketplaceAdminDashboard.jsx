import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Table, Tag, Select, Modal, Input } from "antd";
import Header from "../../../Header/OxyloansAdminHeader";
import Sidebar from "../../../SideBar/OxyloansAdminSidebar";
import { onShowSizeChange } from "../../../Pagination";
import {
  getMarketplaceAdminStats,
  getMarketplaceAdminLoans,
  getMarketplacePendingApproval,
  approveMarketplaceLoan,
  rejectMarketplaceLoan,
} from "../../../HttpRequest/afterlogin";

const { Option } = Select;

const formatINR = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const statusColor = (s) => {
  if (!s) return "default";
  s = s.toUpperCase();
  if (s === "ACTIVE" || s === "MARKET_LISTED") return "green";
  if (s === "NEGOTIATING" || s === "CONSENT_PENDING") return "orange";
  if (s === "CLOSED" || s === "CLOSEDBYPLATFORM") return "blue";
  if (s === "ADMINREJECTED" || s === "REJECTED") return "red";
  return "default";
};

const StatCard = ({ title, value, color, prefix }) => (
  <div className={`card text-center border-${color}`}>
    <div className="card-body py-3">
      <h6 className="text-muted mb-1">{title}</h6>
      <h3 className={`text-${color} mb-0`}>
        {prefix || ""}
        {value}
      </h3>
    </div>
  </div>
);

const MarketplaceAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [pendingState, setPendingState] = useState({
    data: [],
    loading: false,
    error: "",
  });
  const [actionModal, setActionModal] = useState({ visible: false, type: "", loan: null, remarks: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const [loansState, setLoansState] = useState({
    data: [],
    total: 0,
    loading: true,
    error: "",
    page: 0,
    size: 20,
    statusFilter: "",
  });

  // Fetch aggregate stats
  useEffect(() => {
    getMarketplaceAdminStats()
      .then((res) => {
        if (res.request.status === 200) {
          setStats(res.data);
        } else {
          setStatsError("Failed to load statistics.");
        }
        setStatsLoading(false);
      })
      .catch(() => {
        setStatsError("Failed to load statistics.");
        setStatsLoading(false);
      });
  }, []);

  // Fetch loan list
  const fetchLoans = useCallback(
    (page = 0, statusFilter = "") => {
      setLoansState((prev) => ({ ...prev, loading: true, error: "" }));
      getMarketplaceAdminLoans(statusFilter, page, loansState.size)
        .then((res) => {
          if (res.request.status === 200) {
            setLoansState((prev) => ({
              ...prev,
              data: res.data.loans || [],
              total: res.data.total || 0,
              loading: false,
              page,
            }));
          } else {
            setLoansState((prev) => ({
              ...prev,
              loading: false,
              error: "Failed to load loans.",
            }));
          }
        })
        .catch(() => {
          setLoansState((prev) => ({
            ...prev,
            loading: false,
            error: "Failed to load loans.",
          }));
        });
    },
    [loansState.size]
  );

  useEffect(() => {
    fetchLoans(0, loansState.statusFilter);
  }, [loansState.statusFilter]);

  const fetchPending = useCallback(() => {
    setPendingState({ data: [], loading: true, error: "" });
    getMarketplacePendingApproval()
      .then((res) => {
        if (res.status === 200) {
          setPendingState({ data: res.data || [], loading: false, error: "" });
        } else {
          setPendingState({ data: [], loading: false, error: "Failed to load." });
        }
      })
      .catch(() =>
        setPendingState({ data: [], loading: false, error: "Failed to load." })
      );
  }, []);

  useEffect(() => {
    if (activeTab === "pending") fetchPending();
  }, [activeTab]);

  const handleAction = () => {
    const { type, loan, remarks } = actionModal;
    if (!loan) return;
    setActionLoading(true);
    const call =
      type === "approve"
        ? approveMarketplaceLoan(loan.loanRequestId, remarks)
        : rejectMarketplaceLoan(loan.loanRequestId, remarks);
    call
      .then(() => {
        setActionModal({ visible: false, type: "", loan: null, remarks: "" });
        setActionLoading(false);
        fetchPending();
      })
      .catch(() => setActionLoading(false));
  };

  const loanColumns = [
    {
      title: "Loan ID",
      dataIndex: "loanId",
      render: (v) => <span className="text-primary fw-bold">{v}</span>,
    },
    {
      title: "Borrower ID",
      dataIndex: "borrowerUserId",
    },
    {
      title: "Lender ID",
      dataIndex: "lenderUserId",
      render: (v) => v || <span className="text-muted">—</span>,
    },
    {
      title: "Amount (₹)",
      dataIndex: "loanAmount",
      render: (v) => `₹${formatINR(v)}`,
    },
    {
      title: "Duration",
      dataIndex: "duration",
      render: (v) => (v ? `${v}M` : "—"),
    },
    {
      title: "Agreed ROI",
      dataIndex: "agreedRate",
      render: (v) => (v ? `${v}%` : "—"),
    },
    {
      title: "Monthly EMI (₹)",
      dataIndex: "monthlyEmi",
      render: (v) => (v ? `₹${formatINR(v)}` : "—"),
    },
    {
      title: "Offers",
      dataIndex: "totalOffers",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (v) => <Tag color={statusColor(v)}>{v}</Tag>,
    },
    {
      title: "Consent",
      dataIndex: "consentStatus",
      render: (v) => (
        <Tag color={v === "COMPLETED" ? "green" : v ? "orange" : "default"}>
          {v || "—"}
        </Tag>
      ),
    },
  ];

  const loanDatasource = loansState.data.map((loan) => ({
    key: loan.loanRequestId,
    ...loan,
  }));

  return (
    <>
      <div className="main-wrapper">
        <Header />
        <Sidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="page-header">
              <div className="row">
                <div className="col">
                  <h3 className="page-title">Marketplace Admin Dashboard</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">
                      Marketplace Overview
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {statsError && (
              <div className="alert alert-danger">{statsError}</div>
            )}

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
              {[
                { key: "overview", label: "Overview & All Loans" },
                { key: "pending", label: `Pending Approval${pendingState.data.length > 0 ? ` (${pendingState.data.length})` : ""}` },
              ].map((tab) => (
                <li key={tab.key} className="nav-item">
                  <button
                    className={`nav-link${activeTab === tab.key ? " active" : ""}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* ===== OVERVIEW TAB ===== */}
            {activeTab === "overview" && <>

            {/* Stats Cards */}
            {!statsLoading && stats && (
              <>
                <div className="row mb-3">
                  <div className="col-md-2">
                    <StatCard
                      title="Total Listings"
                      value={stats.totalListings}
                      color="primary"
                    />
                  </div>
                  <div className="col-md-2">
                    <StatCard
                      title="Active Listings"
                      value={stats.activeListings}
                      color="success"
                    />
                  </div>
                  <div className="col-md-2">
                    <StatCard
                      title="Consent Pending"
                      value={stats.consentPending}
                      color="warning"
                    />
                  </div>
                  <div className="col-md-2">
                    <StatCard
                      title="Disbursed Loans"
                      value={stats.disbursedLoans}
                      color="info"
                    />
                  </div>
                  <div className="col-md-2">
                    <StatCard
                      title="Escalations"
                      value={stats.activeEscalations}
                      color="danger"
                    />
                  </div>
                  <div className="col-md-2">
                    <StatCard
                      title="Closed Loans"
                      value={stats.closedLoans}
                      color="secondary"
                    />
                  </div>
                </div>

                <div className="row mb-4">
                  <div className="col-md-3">
                    <StatCard
                      title="Total Disbursed (₹)"
                      value={formatINR(stats.totalDisbursedAmount)}
                      color="success"
                      prefix="₹"
                    />
                  </div>
                  <div className="col-md-3">
                    <StatCard
                      title="Total Offers Made"
                      value={stats.totalOffers}
                      color="primary"
                    />
                  </div>
                  <div className="col-md-3">
                    <StatCard
                      title="Accepted Offers"
                      value={stats.acceptedOffers}
                      color="success"
                    />
                  </div>
                  <div className="col-md-3">
                    <StatCard
                      title="Agreements Generated"
                      value={stats.agreementsGenerated}
                      color="info"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Loan List */}
            <div className="row">
              <div className="col-sm-12">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">All Marketplace Loans</h5>
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted me-2">Filter by status:</span>
                      <Select
                        style={{ width: 200 }}
                        value={loansState.statusFilter || "ALL"}
                        onChange={(val) =>
                          setLoansState((prev) => ({
                            ...prev,
                            statusFilter: val === "ALL" ? "" : val,
                          }))
                        }
                      >
                        <Option value="ALL">All Statuses</Option>
                        <Option value="MARKET_LISTED">Market Listed</Option>
                        <Option value="NEGOTIATING">Negotiating</Option>
                        <Option value="CONSENT_PENDING">Consent Pending</Option>
                        <Option value="Active">Active / Disbursed</Option>
                        <Option value="Closed">Closed</Option>
                        <Option value="ADMINREJECTED">Rejected</Option>
                      </Select>
                    </div>
                  </div>
                  <div className="card-body">
                    {loansState.error && (
                      <div className="alert alert-danger">{loansState.error}</div>
                    )}
                    <Table
                      className="table-responsive"
                      columns={loanColumns}
                      dataSource={loanDatasource}
                      loading={loansState.loading}
                      pagination={{
                        total: loansState.total,
                        pageSize: loansState.size,
                        current: loansState.page + 1,
                        showTotal: (total, range) =>
                          `Showing ${range[0]} to ${range[1]} of ${total} loans`,
                        position: ["topRight"],
                        showSizeChanger: false,
                        onShowSizeChange: onShowSizeChange,
                        onChange: (pg) =>
                          fetchLoans(pg - 1, loansState.statusFilter),
                      }}
                      rowKey="key"
                      scroll={{ x: 1000 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            </> /* end overview tab */}

            {/* ===== PENDING APPROVAL TAB ===== */}
            {activeTab === "pending" && (
              <div className="row">
                <div className="col-sm-12">
                  <div className="card">
                    <div className="card-header d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Loans Pending Admin Approval</h5>
                      <button className="btn btn-sm btn-outline-primary" onClick={fetchPending}>
                        <i className="fa-solid fa-rotate-right me-1"></i> Refresh
                      </button>
                    </div>
                    <div className="card-body">
                      {pendingState.error && (
                        <div className="alert alert-danger">{pendingState.error}</div>
                      )}
                      <Table
                        className="table-responsive"
                        columns={[
                          {
                            title: "Loan ID",
                            dataIndex: "loanId",
                            render: (v) => <span className="text-primary fw-bold">{v}</span>,
                          },
                          { title: "Borrower ID", dataIndex: "borrowerUserId" },
                          { title: "Lender ID", dataIndex: "lenderUserId", render: (v) => v || "—" },
                          {
                            title: "Amount (₹)",
                            dataIndex: "loanAmount",
                            render: (v) => `₹${formatINR(v)}`,
                          },
                          { title: "Duration", dataIndex: "duration", render: (v) => v ? `${v}M` : "—" },
                          { title: "Rate", dataIndex: "agreedRate", render: (v) => v ? `${v}%` : "—" },
                          {
                            title: "Status",
                            dataIndex: "status",
                            render: (v) => <Tag color={statusColor(v)}>{v}</Tag>,
                          },
                          {
                            title: "Consent",
                            dataIndex: "consentStatus",
                            render: (v) => (
                              <Tag color={v === "COMPLETED" ? "green" : v ? "orange" : "default"}>
                                {v || "—"}
                              </Tag>
                            ),
                          },
                          {
                            title: "Action",
                            render: (_, record) => (
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() =>
                                    setActionModal({
                                      visible: true,
                                      type: "approve",
                                      loan: record,
                                      remarks: "",
                                    })
                                  }
                                >
                                  Approve
                                </button>
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() =>
                                    setActionModal({
                                      visible: true,
                                      type: "reject",
                                      loan: record,
                                      remarks: "",
                                    })
                                  }
                                >
                                  Reject
                                </button>
                              </div>
                            ),
                          },
                        ]}
                        dataSource={pendingState.data.map((d) => ({
                          key: d.loanRequestId,
                          ...d,
                        }))}
                        loading={pendingState.loading}
                        pagination={{ pageSize: 20, showSizeChanger: false }}
                        rowKey="key"
                        scroll={{ x: 900 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Approve/Reject Modal */}
            <Modal
              open={actionModal.visible}
              title={
                actionModal.type === "approve"
                  ? `Approve Loan ${actionModal.loan?.loanId || ""}`
                  : `Reject Loan ${actionModal.loan?.loanId || ""}`
              }
              okText={actionModal.type === "approve" ? "Approve" : "Reject"}
              okButtonProps={{
                danger: actionModal.type === "reject",
                loading: actionLoading,
              }}
              onOk={handleAction}
              onCancel={() =>
                setActionModal({ visible: false, type: "", loan: null, remarks: "" })
              }
            >
              <p>
                {actionModal.type === "approve"
                  ? `This will mark Loan ${actionModal.loan?.loanId} as DISBURSED_MARKETPLACE. The borrower and lender will be notified.`
                  : `This will reject Loan ${actionModal.loan?.loanId} and set status to ADMINREJECTED.`}
              </p>
              <Input.TextArea
                rows={3}
                placeholder="Remarks (optional)"
                value={actionModal.remarks}
                onChange={(e) =>
                  setActionModal((prev) => ({ ...prev, remarks: e.target.value }))
                }
              />
            </Modal>

          </div>
        </div>
      </div>
    </>
  );
};

export default MarketplaceAdminDashboard;
