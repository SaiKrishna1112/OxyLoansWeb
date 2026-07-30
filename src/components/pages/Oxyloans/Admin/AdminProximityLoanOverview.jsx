import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Table, Tag, Input, Select, Button, Modal, Spin, Card, Tooltip, Badge, Space, message, Tabs } from "antd";
import OxyloansAdminHeader from "../../../Header/OxyloansAdminHeader";
import OxyloansAdminSidebar from "../../../SideBar/OxyloansAdminSidebar";
import Footer from "../../../Footer/Footer";
import {
  getAdminProximityLoanOverview,
  deductBorrowerLoanDisbursementWallet,
  getBorrowerLoanGeneratedFiles,
} from "../../../HttpRequest/afterlogin";

const { Option } = Select;

const fmtINR = (val) =>
  Number(val || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const fmtDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? dateStr
    : d.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

const getStatusTagColor = (status) => {
  if (!status) return "default";
  const s = String(status).toUpperCase();
  if (s.includes("ACCEPTED") || s.includes("DISBURSED") || s === "APPROVED" || s === "COMPLETED" || s === "SUCCESS")
    return "green";
  if (s.includes("PENDING") || s.includes("INITIATED") || s.includes("REQUEST"))
    return "gold";
  if (s.includes("NEGOTIAT") || s.includes("OFFER")) return "blue";
  if (s.includes("REJECT") || s.includes("CANCEL") || s.includes("DEFAULT") || s.includes("FAILED")) return "red";
  return "purple";
};

const AdminProximityLoanOverview = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [responseStats, setResponseStats] = useState({});
  const [loanRequests, setLoanRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // States for Deduct Wallet & Wallet Deducted Users
  const [deductLoadingKey, setDeductLoadingKey] = useState(null);
  const [walletUsersData, setWalletUsersData] = useState([]);
  const [walletUsersLoading, setWalletUsersLoading] = useState(false);
  const [walletSearchTerm, setWalletSearchTerm] = useState("");

  useEffect(() => {
    fetchOverviewData();
    handleFetchWalletDeductedUsers();
  }, []);

  const fetchOverviewData = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (selectedStatus !== "ALL") params.status = selectedStatus;

      const res = await getAdminProximityLoanOverview(params);
      if (res && (res.status === 200 || res.status === 201)) {
        const rawData = res.data || {};
        setResponseStats({
          totalBorrowersRaisedRequests: rawData.totalBorrowersRaisedRequests || 0,
          totalLoanRequests: rawData.totalLoanRequests || 0,
          totalLenderReplies: rawData.totalLenderReplies || 0,
          lenderEsignCompletedCount: rawData.lenderEsignCompletedCount || 0,
          borrowerEsignCompletedCount: rawData.borrowerEsignCompletedCount || 0,
          enachCompletedCount: rawData.enachCompletedCount || 0,
          totalCount: rawData.totalCount || 0,
        });

        const list = Array.isArray(rawData.loanRequests)
          ? rawData.loanRequests
          : Array.isArray(rawData)
          ? rawData
          : rawData.content || [];
        setLoanRequests(list);
      } else {
        setLoanRequests([]);
      }
    } catch (err) {
      console.error("Error fetching proximity loan overview:", err);
      const errMsg =
        err?.response?.data?.errorMessage ||
        err?.response?.data?.message ||
        "Could not load proximity loan overview data.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeductWallet = async (reply, loanRecord) => {
    const loanId = reply?.loanId || loanRecord?.loanRequestId || loanRecord?.loanId || loanRecord?.id;
    const tableId = reply?.assignmentId || reply?.tableId || reply?.id;
    const lenderId = reply?.lenderId;
    const borrowerId = loanRecord?.borrowerId || reply?.borrowerId;

    if (!loanId || !tableId || !lenderId || !borrowerId) {
      message.error("Missing required parameters (loanId, tableId, lenderId, borrowerId) for wallet deduction.");
      return;
    }

    const payload = {
      loanId: Number(loanId),
      tableId: Number(tableId),
      lenderId: Number(lenderId),
      borrowerId: Number(borrowerId),
    };

    const loadingKey = `${loanId}-${tableId}-${lenderId}`;
    setDeductLoadingKey(loadingKey);
    try {
      const res = await deductBorrowerLoanDisbursementWallet(payload);
      if (res && (res.status === 200 || res.status === 201 || res.data?.status === "SUCCESS")) {
        message.success(res?.data?.message || res?.data?.errorMessage || "Wallet deducted successfully!");
        fetchOverviewData();
        handleFetchWalletDeductedUsers();
      } else {
        const errMsg =
          res?.data?.errorMessage ||
          res?.data?.message ||
          res?.response?.data?.errorMessage ||
          "Failed to deduct wallet.";
        message.error(errMsg);
      }
    } catch (err) {
      console.error("Error deducting wallet:", err);
      const errMsg = err?.response?.data?.errorMessage || err?.message || "Failed to deduct wallet.";
      message.error(errMsg);
    } finally {
      setDeductLoadingKey(null);
    }
  };

  const handleFetchWalletDeductedUsers = async () => {
    setWalletUsersLoading(true);
    try {
      const res = await getBorrowerLoanGeneratedFiles();
      if (res && (res.status === 200 || res.status === 201)) {
        const raw = res.data || [];
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw.data)
          ? raw.data
          : Array.isArray(raw.content)
          ? raw.content
          : Array.isArray(raw.borrowerLoanGeneratedFiles)
          ? raw.borrowerLoanGeneratedFiles
          : [raw];
        setWalletUsersData(list);
      } else {
        setWalletUsersData([]);
      }
    } catch (err) {
      console.error("Error fetching borrower loan generated files:", err);
      message.error("Could not fetch wallet deducted users.");
      setWalletUsersData([]);
    } finally {
      setWalletUsersLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (!Array.isArray(loanRequests)) return [];
    return loanRequests.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        String(item.loanRequestId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.borrowerId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.borrowerName || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === "ALL" ||
        String(item.loanRequestStatus || "").toUpperCase() === selectedStatus.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [loanRequests, searchTerm, selectedStatus]);

  const filteredWalletUsers = useMemo(() => {
    if (!Array.isArray(walletUsersData)) return [];
    if (!walletSearchTerm) return walletUsersData;
    const term = walletSearchTerm.toLowerCase();
    return walletUsersData.filter((item) => {
      return (
        String(item.loanId || item.loanRequestId || "").toLowerCase().includes(term) ||
        String(item.tableId || item.id || "").toLowerCase().includes(term) ||
        String(item.lenderId || "").toLowerCase().includes(term) ||
        String(item.lenderName || "").toLowerCase().includes(term) ||
        String(item.borrowerId || "").toLowerCase().includes(term) ||
        String(item.borrowerName || "").toLowerCase().includes(term)
      );
    });
  }, [walletUsersData, walletSearchTerm]);

  const handleInspectLoan = (record) => {
    setSelectedLoan(record);
    setIsModalVisible(true);
  };

  // Outer Table Columns (Loan Requests)
  const columns = [
    {
      title: "Loan Request ID",
      dataIndex: "loanRequestId",
      key: "loanRequestId",
      width: 140,
      render: (v, r) => (
        <span className="fw-bold text-primary cursor-pointer" onClick={() => handleInspectLoan(r)}>
          #{v || "N/A"}
        </span>
      ),
    },
    {
      title: "Borrower Details",
      dataIndex: "borrowerName",
      key: "borrowerName",
      render: (v, r) => (
        <div>
          <strong className="d-block text-dark">{v || `Borrower #${r.borrowerId}`}</strong>
          <span className="text-muted small">ID: {r.borrowerId}</span>
        </div>
      ),
    },
    {
      title: "Requested Amount",
      dataIndex: "requestAmount",
      key: "requestAmount",
      render: (v) => <strong className="text-dark">₹ {fmtINR(v)}</strong>,
    },
    {
      title: "Funded Amount",
      dataIndex: "fundedAmount",
      key: "fundedAmount",
      render: (v, r) => (
        <div>
          <strong className="text-success d-block">₹ {fmtINR(v)}</strong>
          {r.partiallyPendingAmount !== undefined && (
            <span className="text-muted small">
              Pending: ₹ {fmtINR(r.partiallyPendingAmount)}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "eSigns Completed",
      key: "esigns",
      align: "center",
      render: (_, r) => (
        <Space direction="vertical" size={2}>
          <Tag color={r.lenderEsignCompletedCount > 0 ? "green" : "default"}>
            Lenders: {r.lenderEsignCompletedCount || 0}
          </Tag>
          <Tag color={r.borrowerEsignCompletedCount > 0 ? "green" : "default"}>
            Borrower: {r.borrowerEsignCompletedCount || 0}
          </Tag>
        </Space>
      ),
    },
    {
      title: "Request Status",
      dataIndex: "loanRequestStatus",
      key: "loanRequestStatus",
      render: (v) => <Tag color={getStatusTagColor(v)} className="fw-bold">{v || "REQUEST"}</Tag>,
    },
    {
      title: "Created On",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => <span className="small text-muted">{fmtDate(v)}</span>,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, r) => (
        <Button
          type="primary"
          size="small"
          style={{ backgroundColor: "#006242", borderColor: "#006242" }}
          onClick={() => handleInspectLoan(r)}
        >
          Inspect <i className="fa-solid fa-arrow-right ms-1"></i>
        </Button>
      ),
    },
  ];

  // Inner Nested Table (Lender Replies for Expandable Row)
  const expandedRowRender = (record) => {
    const replies = record.lenderReplies || [];
    if (replies.length === 0) {
      return (
        <div className="p-3 bg-light text-center text-muted small border rounded">
          No lender offers or replies submitted for this loan request yet.
        </div>
      );
    }

    const replyColumns = [
      {
        title: "Assignment ID",
        dataIndex: "assignmentId",
        key: "assignmentId",
        render: (v) => <span className="fw-bold">#{v}</span>,
      },
      {
        title: "Lender Name",
        dataIndex: "lenderName",
        key: "lenderName",
        render: (v, r) => (
          <div>
            <strong className="d-block text-dark">{v || `Lender #${r.lenderId}`}</strong>
            <span className="text-muted small">Lender ID: {r.lenderId}</span>
          </div>
        ),
      },
      {
        title: "Interested Amount",
        dataIndex: "lenderInterestedAmount",
        key: "lenderInterestedAmount",
        render: (v) => <strong className="text-success">₹ {fmtINR(v)}</strong>,
      },
      {
        title: "ROI & Duration",
        key: "roiDuration",
        render: (_, r) => (
          <span>
            <strong>{r.roi}% p.a.</strong> ({r.duration} {r.durationType})
          </span>
        ),
      },
      {
        title: "Mandate Status",
        dataIndex: "mandateStatus",
        key: "mandateStatus",
        render: (v, r) => {
          const st = v || (r.enachCompleted ? "ACTIVE" : "NOT_FOUND");
          const color =
            st === "ACTIVE" || st === "APPROVED" || st === "SUCCESS"
              ? "green"
              : st === "NOT_FOUND" || st === "FAILED" || st === "REJECTED"
              ? "volcano"
              : "orange";
          return <Tag color={color}>{st}</Tag>;
        },
      },
      {
        title: "Loan Status",
        dataIndex: "loanStatus",
        key: "loanStatus",
        render: (v) => <Tag color={getStatusTagColor(v)}>{v}</Tag>,
      },
      {
        title: "eSign Status",
        key: "esignStatus",
        render: (_, r) => (
          <div>
            <span className={`badge ${r.lenderEsigned ? "bg-success" : "bg-secondary"} me-1`}>
              Lender: {r.lenderEsigned ? "Done" : "Pending"}
            </span>
            <span className={`badge ${r.borrowerEsigned ? "bg-success" : "bg-secondary"}`}>
              Borrower: {r.borrowerEsigned ? "Done" : "Pending"}
            </span>
          </div>
        ),
      },
      {
        title: "Agreements",
        key: "agreements",
        render: (_, r) => (
          <Space>
            {r.lenderAgreement ? (
              <a href={r.lenderAgreement} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary py-0 px-2">
                <i className="fa-solid fa-file-pdf me-1"></i> Lender PDF
              </a>
            ) : (
              <span className="text-muted small">—</span>
            )}
            {r.borrowerAgreement ? (
              <a href={r.borrowerAgreement} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-success py-0 px-2">
                <i className="fa-solid fa-file-pdf me-1"></i> Borrower PDF
              </a>
            ) : null}
          </Space>
        ),
      },
      {
        title: "Deduct Wallet",
        key: "deductWallet",
        align: "center",
        render: (_, r) => {
          const replyKey = `${record.loanRequestId || record.loanId}-${r.assignmentId || r.tableId || r.id}-${r.lenderId}`;
          return (
            <Button
              type="primary"
              danger
              size="small"
              icon={<i className="fa-solid fa-wallet me-1"></i>}
              loading={deductLoadingKey === replyKey}
              onClick={() => handleDeductWallet(r, record)}
            >
              Deduct Wallet
            </Button>
          );
        },
      },
    ];

    return (
      <div className="p-3 bg-light rounded border">
        <h6 className="fw-bold mb-3 text-dark">
          <i className="fa-solid fa-handshake me-2 text-primary"></i>
          Lender Replies & Offers ({replies.length})
        </h6>
        <Table
          columns={replyColumns}
          dataSource={replies.map((rep, i) => ({ ...rep, key: rep.assignmentId || rep.tableId || i }))}
          pagination={false}
          size="small"
        />
      </div>
    );
  };

  // Columns for Wallet Deducted Users Table
  const walletUserColumns = [
    {
      title: "Loan ID",
      dataIndex: "loanId",
      key: "loanId",
      render: (v, r) => <span className="fw-bold text-primary">#{v || r.loanRequestId || "N/A"}</span>,
    },
    {
      title: "Table ID",
      dataIndex: "tableId",
      key: "tableId",
      render: (v, r) => <span className="fw-bold">#{v || r.id || "N/A"}</span>,
    },
    {
      title: "Lender Details",
      dataIndex: "lenderId",
      key: "lenderId",
      render: (v, r) => (
        <div>
          <strong className="d-block text-dark">{r.lenderName || `Lender #${v}`}</strong>
          <span className="text-muted small">ID: {v}</span>
        </div>
      ),
    },
    {
      title: "Borrower Details",
      dataIndex: "borrowerId",
      key: "borrowerId",
      render: (v, r) => (
        <div>
          <strong className="d-block text-dark">{r.borrowerName || `Borrower #${v}`}</strong>
          <span className="text-muted small">ID: {v}</span>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "disbursementAmount",
      key: "disbursementAmount",
      render: (v, r) => {
        const amt = v || r.amount || r.fundedAmount;
        return amt ? <strong className="text-success">₹ {fmtINR(amt)}</strong> : <span className="text-muted">—</span>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v) => <Tag color={getStatusTagColor(v || "SUCCESS")}>{v || "COMPLETED"}</Tag>,
    },
    {
      title: "Generated File",
      key: "file",
      render: (_, r) => {
        const fileUrl = r.fileUrl || r.disbursementFile || r.filePath || r.agreementUrl;
        return fileUrl ? (
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary py-0 px-2">
            <i className="fa-solid fa-file-pdf me-1"></i> View File
          </a>
        ) : (
          <span className="badge bg-secondary">Generated</span>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v, r) => <span className="small text-muted">{fmtDate(v || r.createdOn || r.disbursementDate)}</span>,
    },
  ];

  const tabItems = [
    {
      key: "1",
      label: (
        <span className="fw-semibold">
          <i className="fa-solid fa-list-check me-2"></i>
          Proximity Loan Overview
          {loanRequests.length > 0 && (
            <Badge
              count={loanRequests.length}
              overflowCount={999}
              style={{ backgroundColor: "#006242", marginLeft: 8 }}
            />
          )}
        </span>
      ),
      children: (
        <div>
          {/* Metric Cards (Response Summary Stats) */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-lg-2">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-4 border-primary">
                <span className="text-muted small d-block">Total Requests</span>
                <h4 className="fw-bold text-dark mb-0">{responseStats.totalLoanRequests || 0}</h4>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-4 border-info">
                <span className="text-muted small d-block">Borrowers Raised</span>
                <h4 className="fw-bold text-info mb-0">{responseStats.totalBorrowersRaisedRequests || 0}</h4>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-4 border-warning">
                <span className="text-muted small d-block">Lender Replies</span>
                <h4 className="fw-bold text-warning mb-0">{responseStats.totalLenderReplies || 0}</h4>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-4 border-success">
                <span className="text-muted small d-block">Lender eSigns</span>
                <h4 className="fw-bold text-success mb-0">{responseStats.lenderEsignCompletedCount || 0}</h4>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-4 border-secondary">
                <span className="text-muted small d-block">Borrower eSigns</span>
                <h4 className="fw-bold text-secondary mb-0">{responseStats.borrowerEsignCompletedCount || 0}</h4>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-lg-2">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-4 border-danger">
                <span className="text-muted small d-block">eNACH Mandates</span>
                <h4 className="fw-bold text-danger mb-0">{responseStats.enachCompletedCount || 0}</h4>
              </div>
            </div>
          </div>

          {/* Search Toolbar */}
          <div className="card border-0 shadow-sm mb-4 rounded-3 bg-white">
            <div className="card-body p-3">
              <div className="row g-3 align-items-center">
                <div className="col-12 col-md-6">
                  <Input
                    placeholder="Search by Loan Request ID, Borrower ID or Name..."
                    prefix={<i className="fa-solid fa-magnifying-glass text-muted me-2"></i>}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    allowClear
                  />
                </div>
                <div className="col-6 col-md-4">
                  <Select
                    className="w-100"
                    value={selectedStatus}
                    onChange={(val) => setSelectedStatus(val)}
                  >
                    <Option value="ALL">All Request Statuses</Option>
                    <Option value="REQUEST">Request</Option>
                    <Option value="PARTIALLYPROCESSING">Partially Processing</Option>
                    <Option value="LOANACCEPTED">Loan Accepted</Option>
                    <Option value="INITIATED">Initiated</Option>
                    <Option value="CLOSED">Closed</Option>
                  </Select>
                </div>
                <div className="col-6 col-md-2 text-end">
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedStatus("ALL");
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Table / Error Display */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4">
              <i className="fa-solid fa-triangle-exclamation me-2 fs-5"></i>
              <div>{error}</div>
            </div>
          )}

          <div className="card border-0 shadow-sm rounded-3 bg-white">
            <div className="card-body p-0">
              <Table
                columns={columns}
                dataSource={filteredData.map((item, idx) => ({
                  ...item,
                  key: item.loanRequestId || idx,
                }))}
                expandable={{ expandedRowRender }}
                loading={loading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "25", "50", "100"],
                  showTotal: (total, range) =>
                    `Showing ${range[0]}-${range[1]} of ${total} loan requests`,
                }}
                scroll={{ x: 1000 }}
                locale={{
                  emptyText: (
                    <div className="text-center py-5">
                      <i className="fa-solid fa-location-crosshairs text-muted fs-1 mb-3 d-block"></i>
                      <h5 className="text-muted fw-bold">No Loan Requests Found</h5>
                      <p className="text-muted small">
                        Try adjusting your search filters.
                      </p>
                    </div>
                  ),
                }}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <span className="fw-semibold">
          <i className="fa-solid fa-wallet me-2"></i>
          Wallet Deducted Users
          {walletUsersData.length > 0 && (
            <Badge
              count={walletUsersData.length}
              overflowCount={999}
              style={{ backgroundColor: "#854d0e", marginLeft: 8 }}
            />
          )}
        </span>
      ),
      children: (
        <div>
          {/* Wallet Search & Action Toolbar */}
          <div className="card border-0 shadow-sm mb-4 rounded-3 bg-white">
            <div className="card-body p-3">
              <div className="row g-3 align-items-center">
                <div className="col-12 col-md-9">
                  <Input
                    placeholder="Search by Loan ID, Table ID, Lender ID, Borrower ID or Name..."
                    prefix={<i className="fa-solid fa-magnifying-glass text-muted me-2"></i>}
                    value={walletSearchTerm}
                    onChange={(e) => setWalletSearchTerm(e.target.value)}
                    allowClear
                  />
                </div>
                <div className="col-12 col-md-3 text-end">
                  <Button
                    icon={<i className="fa-solid fa-rotate me-1"></i>}
                    onClick={handleFetchWalletDeductedUsers}
                    loading={walletUsersLoading}
                  >
                    Refresh List
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Table for Wallet Deducted Users */}
          <div className="card border-0 shadow-sm rounded-3 bg-white">
            <div className="card-body p-0">
              <Table
                columns={walletUserColumns}
                dataSource={filteredWalletUsers.map((item, idx) => ({
                  ...item,
                  key: item.id || item.tableId || idx,
                }))}
                loading={walletUsersLoading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  pageSizeOptions: ["10", "25", "50", "100"],
                  showTotal: (total, range) =>
                    `Showing ${range[0]}-${range[1]} of ${total} wallet deducted records`,
                }}
                scroll={{ x: 800 }}
                locale={{
                  emptyText: (
                    <div className="text-center py-5 text-muted">
                      <i className="fa-solid fa-folder-open fs-1 mb-2 d-block"></i>
                      <h5 className="text-muted fw-bold">No Wallet Deducted Records Found</h5>
                      <p className="text-muted small">
                        No records or generated agreement files exist yet.
                      </p>
                    </div>
                  ),
                }}
              />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />

      <div className="page-wrapper">
        <div className="content container-fluid py-4" style={{ backgroundColor: "#f8fafc", minHeight: "90vh" }}>
          
          {/* Header & Title */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <div>
              <h3 className="fw-bold text-dark mb-1">
                <i className="fa-solid fa-map-location-dot text-success me-2"></i>
                Proximity Loan Overview
              </h3>
              <span className="text-muted small">
                Admin dashboard for location-based loans, lender responses, eSigns, and eNACH mandate tracking.
              </span>
            </div>
            <div className="d-flex gap-2">
              <Button
                type="default"
                icon={<i className="fa-solid fa-rotate me-1"></i>}
                onClick={() => {
                  fetchOverviewData();
                  handleFetchWalletDeductedUsers();
                }}
                loading={loading || walletUsersLoading}
              >
                Refresh All
              </Button>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key)}
            type="card"
            size="large"
            items={tabItems}
          />

        </div>
      </div>

      {/* Proximity Loan Inspection Modal */}
      <Modal
        title={
          <div className="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-info text-success fs-5"></i>
            <span>Loan Request Inspector — #{selectedLoan?.loanRequestId}</span>
          </div>
        }
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsModalVisible(false)} style={{ backgroundColor: "#006242", borderColor: "#006242" }}>
            Close Inspector
          </Button>,
        ]}
        width={800}
      >
        {selectedLoan && (
          <div>
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-4">
                <div className="p-3 bg-light rounded border">
                  <span className="text-muted d-block small">Borrower Name</span>
                  <strong className="text-dark fs-6">{selectedLoan.borrowerName || `Borrower #${selectedLoan.borrowerId}`}</strong>
                </div>
              </div>
              <div className="col-6 col-md-4">
                <div className="p-3 bg-light rounded border">
                  <span className="text-muted d-block small">Request Amount</span>
                  <strong className="text-dark fs-6">₹ {fmtINR(selectedLoan.requestAmount)}</strong>
                </div>
              </div>
              <div className="col-6 col-md-4">
                <div className="p-3 bg-light rounded border">
                  <span className="text-muted d-block small">Funded Amount</span>
                  <strong className="text-success fs-6">₹ {fmtINR(selectedLoan.fundedAmount)}</strong>
                </div>
              </div>
            </div>

            <h6 className="fw-bold mb-3">Lender Replies ({selectedLoan.lenderReplies?.length || 0})</h6>
            {selectedLoan.lenderReplies && selectedLoan.lenderReplies.length > 0 ? (
              selectedLoan.lenderReplies.map((reply, idx) => {
                const replyKey = `${selectedLoan.loanRequestId || selectedLoan.loanId}-${reply.assignmentId || reply.tableId || reply.id}-${reply.lenderId}`;
                const isDeducting = deductLoadingKey === replyKey;
                return (
                  <div key={idx} className="p-3 border rounded mb-3 bg-white shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
                      <span className="fw-bold text-dark fs-6">
                        {reply.lenderName || `Lender #${reply.lenderId}`}
                      </span>
                      <div className="d-flex align-items-center gap-2">
                        <Tag color={getStatusTagColor(reply.loanStatus)}>{reply.loanStatus}</Tag>
                        <Button
                          type="primary"
                          danger
                          size="small"
                          icon={<i className="fa-solid fa-wallet me-1"></i>}
                          loading={isDeducting}
                          onClick={() => handleDeductWallet(reply, selectedLoan)}
                        >
                          Deduct Wallet
                        </Button>
                      </div>
                    </div>
                    <div className="row g-2 text-muted small">
                      <div className="col-6">Amount: <strong className="text-dark">₹ {fmtINR(reply.lenderInterestedAmount)}</strong></div>
                      <div className="col-6">ROI: <strong className="text-dark">{reply.roi}% p.a.</strong></div>
                      <div className="col-6">Duration: <strong className="text-dark">{reply.duration} {reply.durationType}</strong></div>
                      <div className="col-6">Distance: <strong className="text-dark">{reply.distance} km</strong></div>
                      <div className="col-6">Lender eSigned: <strong className="text-dark">{reply.lenderEsigned ? "Yes" : "No"}</strong></div>
                      <div className="col-6">Borrower eSigned: <strong className="text-dark">{reply.borrowerEsigned ? "Yes" : "No"}</strong></div>
                      <div className="col-12">Mandate Status: <strong className="text-dark">{reply.mandateStatus} ({reply.enachMessage})</strong></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="alert alert-info py-2 px-3 small">No lender replies recorded yet.</div>
            )}
          </div>
        )}
      </Modal>

      <Footer />
    </div>
  );
};

export default AdminProximityLoanOverview;

