import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Table, Tag, Collapse } from "antd";
import Header from "../../../Header/Header";
import Sidebar from "../../../SideBar/SideBar";
import { onShowSizeChange } from "../../../Pagination";
import { getLenderEmiDashboard } from "../../../HttpRequest/afterlogin";

const { Panel } = Collapse;

const statusColor = (s) => {
  if (!s) return "default";
  s = s.toUpperCase();
  if (s === "ACTIVE" || s === "UPCOMING") return "green";
  if (s === "OVERDUE") return "red";
  if (s === "CONSENT_PENDING" || s === "NEGOTIATING") return "orange";
  if (s === "CLOSED" || s === "CLOSEDBYPLATFORM") return "blue";
  return "default";
};

const formatINR = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const emiScheduleColumns = [
  { title: "EMI #", dataIndex: "emiNo", width: 70 },
  { title: "Due Date", dataIndex: "dueDate" },
  {
    title: "EMI Amount (₹)",
    dataIndex: "emiAmount",
    render: (v) => `₹${formatINR(v)}`,
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
    title: "Balance (₹)",
    dataIndex: "balance",
    render: (v) => `₹${formatINR(v)}`,
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (v) => <Tag color={statusColor(v)}>{v}</Tag>,
  },
];

const LenderEmiDashboard = () => {
  const [state, setState] = useState({
    loans: [],
    loading: true,
    error: "",
    pageNo: 1,
    pageSize: 10,
  });

  useEffect(() => {
    getLenderEmiDashboard()
      .then((res) => {
        if (res.status === 200) {
          setState((prev) => ({
            ...prev,
            loans: res.data || [],
            loading: false,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            error: "Failed to load EMI dashboard.",
            loading: false,
          }));
        }
      })
      .catch(() => {
        setState((prev) => ({
          ...prev,
          error: "Failed to load EMI dashboard.",
          loading: false,
        }));
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
      render: (v) => <strong>₹{formatINR(v)}</strong>,
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
  ];

  const datasource = state.loans.map((loan) => ({
    key: loan.offerId || loan.loanRequestId,
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
                  <h3 className="page-title">My Marketplace EMI Dashboard</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Lender EMI Dashboard</li>
                  </ul>
                </div>
              </div>
            </div>

            {state.error && (
              <div className="alert alert-danger">{state.error}</div>
            )}

            {!state.loading && state.loans.length === 0 && !state.error && (
              <div className="text-center py-5">
                <h5 className="text-muted">No active marketplace loans found.</h5>
                <p className="text-muted">
                  Your accepted marketplace loan offers and their EMI schedules will appear here.
                </p>
                <Link to="/marketplace-loans" className="btn btn-primary">
                  Browse Loan Listings
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
                    <div className="card text-center border-success">
                      <div className="card-body">
                        <h6 className="text-muted">Total Deployed (₹)</h6>
                        <h3 className="text-success">
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
                        <h6 className="text-muted">Total Monthly EMI (₹)</h6>
                        <h3 className="text-info">
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
                        <h6 className="text-muted">Total Interest Earning (₹)</h6>
                        <h3 className="text-warning">
                          ₹{formatINR(
                            state.loans.reduce((sum, l) => sum + (l.totalInterest || 0), 0)
                          )}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Loan Summary Table */}
                <div className="row mb-4">
                  <div className="col-sm-12">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Loan Summary</h5>
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
                        <h5 className="mb-0">EMI Schedules (click to expand)</h5>
                      </div>
                      <div className="card-body p-0">
                        <Collapse accordion>
                          {state.loans.map((loan) => (
                            <Panel
                              key={loan.offerId || loan.loanRequestId}
                              header={
                                <span>
                                  <strong>{loan.loanId}</strong>
                                  {" — "}₹{formatINR(loan.loanAmount)} @ {loan.annualRoi}% p.a.
                                  {" — "}Monthly EMI:{" "}
                                  <strong>₹{formatINR(loan.monthlyEmi)}</strong>
                                </span>
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
                                scroll={{ x: 700 }}
                              />
                            </Panel>
                          ))}
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

export default LenderEmiDashboard;
