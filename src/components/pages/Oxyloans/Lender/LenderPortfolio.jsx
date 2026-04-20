import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Table, Tag, Progress } from "antd";
import Header from "../../../Header/Header";
import Sidebar from "../../../SideBar/SideBar";
import { getLenderPortfolio } from "../../../HttpRequest/afterlogin";

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const riskColor = (score) => {
  if (!score) return "default";
  if (score >= 750) return "success";
  if (score >= 600) return "warning";
  if (score >= 450) return "orange";
  return "error";
};

const riskLabel = (score) => {
  if (!score) return "Unrated";
  if (score >= 750) return "Low Risk";
  if (score >= 600) return "Medium";
  if (score >= 450) return "High Risk";
  return "Very High";
};

const statusColor = (s) => {
  if (!s) return "default";
  const u = s.toUpperCase();
  if (u === "ACTIVE") return "success";
  if (u === "DISBURSED") return "cyan";
  if (u === "DISBURSAL_PENDING") return "blue";
  if (u === "ENACH_APPROVED") return "geekblue";
  if (u === "CLOSED") return "default";
  if (u === "DEFAULTED") return "error";
  return "processing";
};

const LenderPortfolio = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getLenderPortfolio()
      .then((res) => { if (res.status === 200) setData(res.data); })
      .catch(() => setError("Failed to load portfolio. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const loans = data?.loans || [];
  const summary = data?.summary || {};

  const columns = [
    { title: "Loan ID", dataIndex: "loanId", key: "loanId" },
    { title: "Borrower", dataIndex: "borrowerName", key: "borrowerName", render: (v) => v || "—" },
    { title: "Amount (₹)", dataIndex: "amount", key: "amount", render: (v) => "₹" + fmt(v) },
    {
      title: "Status",
      dataIndex: "loanStatus",
      key: "loanStatus",
      render: (s) => <Tag color={statusColor(s)}>{s}</Tag>,
    },
    { title: "Rate", dataIndex: "rateOfInterest", key: "rateOfInterest", render: (v) => v ? v + "%" : "—" },
    { title: "Duration", dataIndex: "duration", key: "duration", render: (v) => v ? v + "mo" : "—" },
    {
      title: "EMI Collected",
      key: "emiPaid",
      render: (_, r) => r.totalEmis > 0
        ? `${r.paidEmis || 0}/${r.totalEmis} (₹${fmt(r.interestEarned)})`
        : "—",
    },
    {
      title: "Expected Return",
      dataIndex: "expectedReturn",
      key: "expectedReturn",
      render: (v) => v ? "₹" + fmt(v) : "—",
    },
    {
      title: "Borrower Risk",
      dataIndex: "oxyScore",
      key: "oxyScore",
      render: (score) => (
        <Tag color={riskColor(score)}>
          {riskLabel(score)} {score ? `(${score})` : ""}
        </Tag>
      ),
    },
    {
      title: "Disbursal Date",
      dataIndex: "disbursalDate",
      key: "disbursalDate",
      render: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—",
    },
  ];

  // EMI calendar: group upcoming EMIs by month
  const upcomingEmis = loans
    .filter((l) => l.nextEmiDate)
    .sort((a, b) => new Date(a.nextEmiDate) - new Date(b.nextEmiDate));

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row">
              <div className="col">
                <h3 className="page-title">Lender Portfolio</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><Link to="/lenderDashboard">Dashboard</Link></li>
                  <li className="breadcrumb-item active">Portfolio</li>
                </ul>
              </div>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div className="text-center py-5">
              <span className="spinner-border text-primary" />
              <p className="mt-2 text-muted">Loading portfolio…</p>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                  <div className="card border-primary">
                    <div className="card-body py-3 text-center">
                      <h6 className="text-muted mb-1">Total Invested</h6>
                      <h4 className="text-primary mb-0">₹{fmt(summary.totalInvested)}</h4>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-success">
                    <div className="card-body py-3 text-center">
                      <h6 className="text-muted mb-1">Total Earned</h6>
                      <h4 className="text-success mb-0">₹{fmt(summary.totalEarned)}</h4>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-warning">
                    <div className="card-body py-3 text-center">
                      <h6 className="text-muted mb-1">Pending Collection</h6>
                      <h4 className="text-warning mb-0">₹{fmt(summary.pendingCollection)}</h4>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-info">
                    <div className="card-body py-3 text-center">
                      <h6 className="text-muted mb-1">Active Loans</h6>
                      <h4 className="text-info mb-0">{summary.activeCount || 0}</h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* Portfolio performance */}
              {summary.totalInvested > 0 && (
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header"><h6 className="mb-0">Portfolio Performance</h6></div>
                      <div className="card-body">
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span style={{ fontSize: 13 }}>Capital Deployed</span>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>₹{fmt(summary.totalInvested)}</span>
                          </div>
                          <Progress
                            percent={100}
                            strokeColor="#1890ff"
                            showInfo={false}
                          />
                        </div>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span style={{ fontSize: 13 }}>Interest Earned</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#52c41a" }}>₹{fmt(summary.totalEarned)}</span>
                          </div>
                          <Progress
                            percent={Math.min(100, Math.round((summary.totalEarned / (summary.totalInvested || 1)) * 100))}
                            strokeColor="#52c41a"
                            showInfo={false}
                          />
                        </div>
                        <div className="text-muted" style={{ fontSize: 12 }}>
                          Overall yield: <strong>{summary.totalInvested > 0 ? ((summary.totalEarned / summary.totalInvested) * 100).toFixed(2) : 0}%</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming EMI calendar */}
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-header"><h6 className="mb-0">Upcoming EMI Collections</h6></div>
                      <div className="card-body p-0">
                        {upcomingEmis.length === 0 ? (
                          <div className="text-muted text-center py-3">No upcoming EMIs.</div>
                        ) : (
                          <table className="table table-sm mb-0">
                            <thead>
                              <tr>
                                <th>Loan</th>
                                <th>Borrower</th>
                                <th>Due Date</th>
                                <th>EMI (₹)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {upcomingEmis.slice(0, 8).map((l) => (
                                <tr key={l.loanId}>
                                  <td style={{ fontSize: 12 }}>{l.loanId}</td>
                                  <td style={{ fontSize: 12 }}>{l.borrowerName || "—"}</td>
                                  <td style={{ fontSize: 12 }}>
                                    {new Date(l.nextEmiDate).toLocaleDateString("en-IN")}
                                  </td>
                                  <td style={{ fontSize: 12, fontWeight: 600 }}>₹{fmt(l.nextEmiAmount)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* All investments table */}
              <div className="card">
                <div className="card-header">
                  <h6 className="mb-0">All Investments ({loans.length})</h6>
                </div>
                <div className="card-body p-0">
                  <Table
                    dataSource={loans}
                    columns={columns}
                    rowKey="loanId"
                    pagination={{ pageSize: 15, showSizeChanger: true }}
                    scroll={{ x: 1100 }}
                    size="small"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LenderPortfolio;
