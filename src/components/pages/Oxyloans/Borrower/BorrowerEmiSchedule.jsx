import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Table, Tag, Collapse, Progress } from "antd";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import { onShowSizeChange } from "../../../Pagination";
import { getBorrowerEmiSchedule } from "../../../HttpRequest/afterlogin";

const { Panel } = Collapse;

const formatINR = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const statusColor = (s) => {
  if (!s) return "default";
  s = s.toUpperCase();
  if (s === "PAID" || s === "ACTIVE") return "green";
  if (s === "UPCOMING") return "orange";
  if (s === "OVERDUE") return "red";
  if (s === "CONSENT_PENDING") return "orange";
  if (s === "CLOSED" || s === "CLOSEDBYPLATFORM") return "blue";
  return "default";
};

const emiScheduleColumns = [
  { title: "EMI #", dataIndex: "emiNo", width: 70 },
  { title: "Due Date", dataIndex: "dueDate" },
  {
    title: "EMI Amount (₹)",
    dataIndex: "emiAmount",
    render: (v) => <strong>₹{formatINR(v)}</strong>,
  },
  {
    title: "Principal (₹)",
    dataIndex: "principal",
    render: (v) => `₹${formatINR(v)}`,
  },
  {
    title: "Interest (₹)",
    dataIndex: "interest",
    render: (v) => `₹${formatINR(v)}`,
  },
  {
    title: "Outstanding Balance (₹)",
    dataIndex: "balance",
    render: (v) => `₹${formatINR(v)}`,
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (v) => <Tag color={statusColor(v)}>{v}</Tag>,
  },
];

const BorrowerEmiSchedule = () => {
  const [state, setState] = useState({
    loans: [],
    loading: true,
    error: "",
  });

  useEffect(() => {
    getBorrowerEmiSchedule()
      .then((res) => {
        if (res.status === 200) {
          setState({ loans: res.data || [], loading: false, error: "" });
        } else {
          setState({ loans: [], loading: false, error: "Failed to load EMI schedule." });
        }
      })
      .catch((e) => {
        const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "Failed to load EMI schedule.";
        setState({ loans: [], loading: false, error: msg });
      });
  }, []);

  const summaryColumns = [
    {
      title: "Loan ID",
      dataIndex: "loanId",
      render: (v) => <span className="text-primary fw-bold">{v}</span>,
    },
    {
      title: "Loan Amount (₹)",
      dataIndex: "loanAmount",
      render: (v) => `₹${formatINR(v)}`,
    },
    {
      title: "Annual ROI",
      dataIndex: "annualRoi",
      render: (v) => `${v}% p.a.`,
    },
    { title: "Duration", dataIndex: "durationMonths", render: (v) => `${v} months` },
    {
      title: "Monthly EMI (₹)",
      dataIndex: "monthlyEmi",
      render: (v) => <strong className="text-danger">₹{formatINR(v)}</strong>,
    },
    {
      title: "Total Interest (₹)",
      dataIndex: "totalInterest",
      render: (v) => `₹${formatINR(v)}`,
    },
    {
      title: "Total Payable (₹)",
      dataIndex: "totalPayable",
      render: (v) => `₹${formatINR(v)}`,
    },
    {
      title: "Loan Status",
      dataIndex: "loanStatus",
      render: (v) => <Tag color={statusColor(v)}>{v}</Tag>,
    },
    {
      title: "Consent",
      dataIndex: "consentStatus",
      render: (v) => <Tag color={v === "COMPLETED" ? "green" : "orange"}>{v || "—"}</Tag>,
    },
  ];

  const datasource = state.loans.map((loan) => ({
    key: loan.loanRequestId,
    ...loan,
  }));

  return (
    <>
      <div className="main-wrapper">
        <BorrowerHeader />
        <BorrowerSidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="page-header">
              <div className="row">
                <div className="col">
                  <h3 className="page-title">My EMI Schedule</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/borrowerDashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">EMI Schedule</li>
                  </ul>
                </div>
              </div>
            </div>

            {state.error && (
              <div className="alert alert-danger">{state.error}</div>
            )}

            {!state.loading && state.loans.length === 0 && !state.error && (
              <div className="text-center py-5">
                <h5 className="text-muted">No marketplace loans found.</h5>
                <p className="text-muted">
                  Once your marketplace loan is funded and accepted, your EMI schedule will appear here.
                </p>
                <Link to="/my-marketplace-loans" className="btn btn-primary">
                  View My Loan Listings
                </Link>
              </div>
            )}

            {state.loans.length > 0 && (
              <>
                {/* Summary Stats */}
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="card text-center border-primary">
                      <div className="card-body">
                        <h6 className="text-muted">Active Loans</h6>
                        <h3 className="text-primary">{state.loans.length}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card text-center border-danger">
                      <div className="card-body">
                        <h6 className="text-muted">Total Monthly EMI (₹)</h6>
                        <h3 className="text-danger">
                          ₹{formatINR(
                            state.loans.reduce((sum, l) => sum + (l.monthlyEmi || 0), 0)
                          )}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card text-center border-warning">
                      <div className="card-body">
                        <h6 className="text-muted">Total Borrowed (₹)</h6>
                        <h3 className="text-warning">
                          ₹{formatINR(
                            state.loans.reduce((sum, l) => sum + (l.loanAmount || 0), 0)
                          )}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card text-center border-info">
                      <div className="card-body">
                        <h6 className="text-muted">Total Interest Cost (₹)</h6>
                        <h3 className="text-info">
                          ₹{formatINR(
                            state.loans.reduce((sum, l) => sum + (l.totalInterest || 0), 0)
                          )}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Table */}
                <div className="row mb-4">
                  <div className="col-sm-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Loan Overview</h5>
                      </div>
                      <div className="card-body">
                        <Table
                          className="table-responsive"
                          columns={summaryColumns}
                          dataSource={datasource}
                          loading={state.loading}
                          pagination={{
                            total: datasource.length,
                            showTotal: (total, range) =>
                              `Showing ${range[0]} to ${range[1]} of ${total} loans`,
                            position: ["topRight"],
                            showSizeChanger: false,
                            onShowSizeChange: onShowSizeChange,
                          }}
                          rowKey="key"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Per-Loan EMI Schedules */}
                <div className="row">
                  <div className="col-sm-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Detailed EMI Schedules (click to expand)</h5>
                      </div>
                      <div className="card-body p-0">
                        <Collapse accordion>
                          {state.loans.map((loan) => {
                            const paidCount = (loan.emiSchedule || []).filter(
                              (r) => r.status === "PAID"
                            ).length;
                            const totalCount = (loan.emiSchedule || []).length;
                            const progressPct =
                              totalCount > 0
                                ? Math.round((paidCount / totalCount) * 100)
                                : 0;

                            return (
                              <Panel
                                key={loan.loanRequestId}
                                header={
                                  <div className="d-flex justify-content-between align-items-center w-100 pe-4">
                                    <span>
                                      <strong>{loan.loanId}</strong>
                                      {" — "}₹{formatINR(loan.loanAmount)} @ {loan.annualRoi}% p.a.
                                      {" — "}Monthly EMI:{" "}
                                      <strong className="text-danger">
                                        ₹{formatINR(loan.monthlyEmi)}
                                      </strong>
                                    </span>
                                    <span style={{ width: 150 }}>
                                      <Progress
                                        percent={100 - progressPct}
                                        size="small"
                                        showInfo={false}
                                        strokeColor="#52c41a"
                                      />
                                      <small className="text-muted">
                                        {paidCount}/{totalCount} EMIs paid
                                      </small>
                                    </span>
                                  </div>
                                }
                              >
                                <Table
                                  size="small"
                                  columns={emiScheduleColumns}
                                  dataSource={(loan.emiSchedule || []).map((r, i) => ({
                                    ...r,
                                    key: i,
                                  }))}
                                  pagination={false}
                                  scroll={{ x: 750 }}
                                />
                              </Panel>
                            );
                          })}
                        </Collapse>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BorrowerEmiSchedule;
