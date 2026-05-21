import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Table, Tag, Progress, Collapse } from "antd";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import {
  getBorrowerActiveLoans,
  getBorrowerEmiScheduleForLoan,
} from "../../../HttpRequest/afterlogin";

const { Panel } = Collapse;

const fmt = (n) => Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const statusColor = (s) => {
  if (!s) return "default";
  const u = s.toUpperCase();
  if (u === "ACTIVE") return "green";
  if (u === "DISBURSED") return "cyan";
  if (u === "DISBURSAL_PENDING") return "blue";
  if (u === "ENACH_APPROVED") return "geekblue";
  if (u === "ENACH_INITIATED") return "purple";
  if (u === "ESIGN_DONE") return "orange";
  if (u === "ESIGN_PENDING") return "gold";
  if (u === "CONSENTED") return "lime";
  if (u === "NEGOTIATING") return "processing";
  if (u === "OFFER_MADE") return "volcano";
  if (u === "POSTED") return "default";
  if (u === "CLOSED") return "success";
  if (u === "DEFAULTED") return "error";
  return "default";
};

const statusLabel = (s) => {
  const map = {
    POSTED: "Posted",
    OFFER_MADE: "Offer Made",
    NEGOTIATING: "Negotiating",
    CONSENTED: "Consented",
    ESIGN_PENDING: "eSign Pending",
    ESIGN_DONE: "eSign Done",
    ENACH_INITIATED: "eNACH Submitted",
    ENACH_APPROVED: "eNACH Approved",
    DISBURSAL_PENDING: "Disbursal Pending",
    DISBURSED: "Disbursed",
    ACTIVE: "Active",
    CLOSED: "Closed",
    DEFAULTED: "Defaulted",
  };
  return map[s?.toUpperCase()] || s;
};

const emiStatusColor = (s) => {
  if (!s) return "default";
  const u = s.toUpperCase();
  if (u === "COMPLETED") return "success";
  if (u === "INPROCESS") return "processing";
  if (u === "ADMINREJECTED") return "error";
  return "default";
};

const LoanCard = ({ loan }) => {
  const [schedule, setSchedule] = useState([]);
  const [schLoading, setSchLoading] = useState(false);

  const loadSchedule = () => {
    if (!loan.internalId || schedule.length > 0) return;
    setSchLoading(true);
    getBorrowerEmiScheduleForLoan(loan.internalId)
      .then((res) => { if (res.status === 200) setSchedule(res.data || []); })
      .catch(() => {})
      .finally(() => setSchLoading(false));
  };

  const paidCount = schedule.filter((e) => e.emiPaidOn || e.status === "COMPLETED").length;
  const totalCount = schedule.length || loan.duration || 0;
  const progressPct = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0;

  const nextEmi = schedule.find((e) => !e.emiPaidOn && e.status !== "COMPLETED");
  const outstandingPrincipal = schedule
    .filter((e) => !e.emiPaidOn && e.status !== "COMPLETED")
    .reduce((s, e) => s + (e.emiPrincipalAmount || 0), 0);

  const emiColumns = [
    { title: "#", dataIndex: "emiNumber", key: "emiNumber", width: 50 },
    { title: "Due Date", dataIndex: "emiDueOn", key: "emiDueOn", render: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
    { title: "Principal (₹)", dataIndex: "emiPrincipalAmount", key: "emiPrincipalAmount", render: (v) => "₹" + fmt(v) },
    { title: "Interest (₹)", dataIndex: "emiInterstAmount", key: "emiInterstAmount", render: (v) => "₹" + fmt(v) },
    { title: "Total EMI (₹)", dataIndex: "emiAmount", key: "emiAmount", render: (v) => "₹" + fmt(v) },
    {
      title: "Status",
      key: "status",
      render: (_, row) => {
        if (row.emiPaidOn) return <Tag color="success">Paid</Tag>;
        if (row.status === "ADMINREJECTED") return <Tag color="error">Bounced</Tag>;
        return <Tag color={emiStatusColor(row.status)}>{row.status || "Pending"}</Tag>;
      },
    },
    { title: "Paid On", dataIndex: "emiPaidOn", key: "emiPaidOn", render: (v) => v ? new Date(v).toLocaleDateString("en-IN") : "—" },
  ];

  return (
    <div className="card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          Loan <strong>{loan.loanId}</strong>
        </h6>
        <Tag color={statusColor(loan.loanStatus)}>{statusLabel(loan.loanStatus)}</Tag>
      </div>
      <div className="card-body">
        <div className="row g-3 mb-3">
          <div className="col-6 col-md-3">
            <div className="border rounded p-2 text-center">
              <div className="text-muted" style={{ fontSize: 11 }}>Loan Amount</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>₹{fmt(loan.amount)}</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="border rounded p-2 text-center">
              <div className="text-muted" style={{ fontSize: 11 }}>Rate of Interest</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{loan.rateOfInterest || "—"}% p.a.</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="border rounded p-2 text-center">
              <div className="text-muted" style={{ fontSize: 11 }}>Duration</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{loan.duration || "—"} months</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            {nextEmi ? (
              <div className="border rounded p-2 text-center" style={{ background: "#fff7e6" }}>
                <div className="text-muted" style={{ fontSize: 11 }}>Next EMI Due</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fa8c16" }}>
                  ₹{fmt(nextEmi.emiAmount)}
                </div>
                <div style={{ fontSize: 11, color: "#fa8c16" }}>
                  {nextEmi.emiDueOn ? new Date(nextEmi.emiDueOn).toLocaleDateString("en-IN") : "—"}
                </div>
              </div>
            ) : (
              <div className="border rounded p-2 text-center">
                <div className="text-muted" style={{ fontSize: 11 }}>Outstanding Principal</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>₹{fmt(outstandingPrincipal)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <span style={{ fontSize: 13 }}>Repayment Progress</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {paidCount} of {totalCount} EMIs paid
              </span>
            </div>
            <Progress
              percent={progressPct}
              strokeColor={progressPct === 100 ? "#52c41a" : "#1890ff"}
              status={progressPct === 100 ? "success" : "active"}
            />
          </div>
        )}

        {/* Outstanding principal */}
        {schedule.length > 0 && (
          <div className="mb-3 text-muted" style={{ fontSize: 13 }}>
            Outstanding principal remaining: <strong>₹{fmt(outstandingPrincipal)}</strong>
          </div>
        )}

        {/* EMI Schedule */}
        <Collapse onChange={(keys) => { if (keys.length > 0) loadSchedule(); }}>
          <Panel header="View Full Repayment Schedule" key="schedule">
            <Table
              dataSource={schedule}
              columns={emiColumns}
              rowKey="id"
              loading={schLoading}
              pagination={false}
              size="small"
              scroll={{ x: 700 }}
              rowClassName={(row) => row.emiPaidOn ? "table-success" : ""}
            />
          </Panel>
        </Collapse>
      </div>
    </div>
  );
};

const MyLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getBorrowerActiveLoans()
      .then((res) => { if (res.status === 200) setLoans(res.data || []); })
      .catch(() => setError("Failed to load your loans. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const activeLoans = loans.filter((l) => ["ACTIVE", "Active"].includes(l.loanStatus));
  const pendingLoans = loans.filter((l) => !["ACTIVE", "Active", "CLOSED", "Closed"].includes(l.loanStatus));
  const closedLoans = loans.filter((l) => ["CLOSED", "Closed"].includes(l.loanStatus));

  return (
    <div className="main-wrapper">
      <BorrowerHeader />
      <BorrowerSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row">
              <div className="col">
                <h3 className="page-title">My Loans</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><Link to="/borrowerDashboard">Dashboard</Link></li>
                  <li className="breadcrumb-item active">My Loans</li>
                </ul>
              </div>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div className="text-center py-5">
              <span className="spinner-border text-primary" />
              <p className="mt-2 text-muted">Loading your loans…</p>
            </div>
          ) : loans.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-5">
                <i className="fa-solid fa-file-invoice-dollar mb-3" style={{ fontSize: 48, color: "#d9d9d9" }} />
                <h5 className="text-muted">No loans found</h5>
                <p className="text-muted">You don't have any active loans yet.</p>
                <Link to="/post-loan-request" className="btn btn-primary">
                  Post a Loan Request
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Summary row */}
              <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                  <div className="card border-success">
                    <div className="card-body py-3 text-center">
                      <h6 className="text-muted mb-1">Active Loans</h6>
                      <h3 className="text-success mb-0">{activeLoans.length}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-warning">
                    <div className="card-body py-3 text-center">
                      <h6 className="text-muted mb-1">In Progress</h6>
                      <h3 className="text-warning mb-0">{pendingLoans.length}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-info">
                    <div className="card-body py-3 text-center">
                      <h6 className="text-muted mb-1">Closed</h6>
                      <h3 className="text-info mb-0">{closedLoans.length}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="card border-primary">
                    <div className="card-body py-3 text-center">
                      <h6 className="text-muted mb-1">Total Borrowed</h6>
                      <h3 className="text-primary mb-0" style={{ fontSize: 18 }}>
                        ₹{fmt(loans.reduce((s, l) => s + (l.amount || 0), 0))}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {activeLoans.length > 0 && (
                <>
                  <h5 className="mb-3">Active Loans</h5>
                  {activeLoans.map((loan) => <LoanCard key={loan.loanId} loan={loan} />)}
                </>
              )}

              {pendingLoans.length > 0 && (
                <>
                  <h5 className="mb-3 mt-4">In Progress</h5>
                  {pendingLoans.map((loan) => <LoanCard key={loan.loanId} loan={loan} />)}
                </>
              )}

              {closedLoans.length > 0 && (
                <>
                  <h5 className="mb-3 mt-4">Closed Loans</h5>
                  {closedLoans.map((loan) => <LoanCard key={loan.loanId} loan={loan} />)}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyLoans;
