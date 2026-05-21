import React, { useEffect, useState } from "react";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import { Link } from "react-router-dom";
import { Table, Tag, Modal, Progress } from "antd";
import { getBorrowerEmiSchedule, payMarketplaceEmi } from "../../../HttpRequest/afterlogin";

const formatINR = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const statusColor = (s) => {
  if (!s) return "default";
  s = s.toUpperCase();
  if (s === "UPCOMING") return "green";
  if (s === "OVERDUE") return "red";
  if (s === "PAID") return "blue";
  return "default";
};

const PayEmi = () => {
  const [state, setState] = useState({ loans: [], loading: true, error: "" });
  const [payModal, setPayModal] = useState({ visible: false, emi: null, loan: null });
  const [paySuccess, setPaySuccess] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    getBorrowerEmiSchedule()
      .then((res) => {
        if (res.status === 200) {
          setState({ loans: res.data || [], loading: false, error: "" });
        } else {
          setState({ loans: [], loading: false, error: "Failed to load EMI data." });
        }
      })
      .catch(() =>
        setState({ loans: [], loading: false, error: "Failed to load EMI data." })
      );
  }, []);

  // Flatten all EMIs across all loans, keeping only upcoming/overdue
  const allDueEmis = [];
  state.loans.forEach((loan) => {
    (loan.emiSchedule || []).forEach((emi) => {
      if (emi.status === "OVERDUE" || emi.status === "UPCOMING") {
        allDueEmis.push({ ...emi, loanId: loan.loanId, loanRequestId: loan.loanRequestId, _loan: loan });
      }
    });
  });

  const overdueCount = allDueEmis.filter((e) => e.status === "OVERDUE").length;
  const totalDue = allDueEmis
    .filter((e) => e.status === "OVERDUE")
    .reduce((s, e) => s + (e.emiAmount || 0), 0);

  const nextUpcoming = allDueEmis.find((e) => e.status === "UPCOMING");

  const columns = [
    {
      title: "Loan ID",
      dataIndex: "loanId",
      render: (v) => <span className="text-primary fw-bold">{v}</span>,
    },
    { title: "EMI #", dataIndex: "emiNo", width: 70 },
    { title: "Due Date", dataIndex: "dueDate" },
    {
      title: "EMI Amount",
      dataIndex: "emiAmount",
      render: (v) => <strong>₹{formatINR(v)}</strong>,
    },
    {
      title: "Principal",
      dataIndex: "principal",
      render: (v) => `₹${formatINR(v)}`,
    },
    {
      title: "Interest",
      dataIndex: "interest",
      render: (v) => `₹${formatINR(v)}`,
    },
    {
      title: "Balance After",
      dataIndex: "balance",
      render: (v) => `₹${formatINR(v)}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (v) => <Tag color={statusColor(v)}>{v}</Tag>,
    },
    {
      title: "Action",
      render: (_, record) => (
        <button
          className={`btn btn-sm ${record.status === "OVERDUE" ? "btn-danger" : "btn-primary"}`}
          onClick={() => setPayModal({ visible: true, emi: record, loan: record._loan })}
        >
          Pay Now
        </button>
      ),
    },
  ];

  const handlePay = async () => {
    const { emi, loan } = payModal;
    setPayError("");
    setPaying(true);
    try {
      await payMarketplaceEmi(loan.loanRequestId, emi.emiNo);
      setPaySuccess(true);
      // Refresh EMI list after payment
      const res = await getBorrowerEmiSchedule();
      if (res.status === 200) setState({ loans: res.data || [], loading: false, error: "" });
      setTimeout(() => {
        setPayModal({ visible: false, emi: null, loan: null });
        setPaySuccess(false);
      }, 2000);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "Payment failed. Please try again.";
      setPayError(msg);
    } finally {
      setPaying(false);
    }
  };

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
                  <h3 className="page-title">Pay EMI</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/borrowerDashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Pay EMI</li>
                  </ul>
                </div>
              </div>
            </div>

            {state.error && <div className="alert alert-danger">{state.error}</div>}

            {!state.loading && state.loans.length === 0 && !state.error && (
              <div className="text-center py-5">
                <i className="fa-solid fa-calendar-check mb-3" style={{ fontSize: 48, color: "#d9d9d9" }}></i>
                <h5 className="text-muted">No marketplace loan EMIs found.</h5>
                <p className="text-muted">
                  Once your marketplace loan is funded and disbursed, your EMIs will appear here.
                </p>
                <Link to="/my-marketplace-loans" className="btn btn-primary">
                  View My Loans
                </Link>
              </div>
            )}

            {state.loans.length > 0 && (
              <>
                {/* Alert banner for overdue */}
                {overdueCount > 0 && (
                  <div className="alert alert-danger d-flex align-items-center mb-4">
                    <i className="fa-solid fa-triangle-exclamation me-3" style={{ fontSize: 24 }}></i>
                    <div>
                      <strong>
                        {overdueCount} overdue EMI{overdueCount > 1 ? "s" : ""}
                      </strong>{" "}
                      — Total overdue amount:{" "}
                      <strong>₹{formatINR(totalDue)}</strong>. Please pay immediately to avoid
                      escalation.
                    </div>
                  </div>
                )}

                {/* Summary cards */}
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
                    <div className={`card text-center ${overdueCount > 0 ? "border-danger" : "border-success"}`}>
                      <div className="card-body">
                        <h6 className="text-muted">Overdue EMIs</h6>
                        <h3 className={overdueCount > 0 ? "text-danger" : "text-success"}>
                          {overdueCount > 0 ? `${overdueCount} (₹${formatINR(totalDue)})` : "None"}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card text-center border-warning">
                      <div className="card-body">
                        <h6 className="text-muted">Next EMI Due</h6>
                        <h3 className="text-warning" style={{ fontSize: 16 }}>
                          {nextUpcoming
                            ? `₹${formatINR(nextUpcoming.emiAmount)} on ${nextUpcoming.dueDate}`
                            : "—"}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card text-center border-info">
                      <div className="card-body">
                        <h6 className="text-muted">Total Monthly EMI</h6>
                        <h3 className="text-info">
                          ₹{formatINR(state.loans.reduce((s, l) => s + (l.monthlyEmi || 0), 0))}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Per-loan summary with progress */}
                {state.loans.map((loan) => {
                  const scheduleLen = (loan.emiSchedule || []).length;
                  const overdueEmis = (loan.emiSchedule || []).filter((e) => e.status === "OVERDUE").length;
                  const paid = scheduleLen - (loan.emiSchedule || []).filter((e) => e.status !== "PAID").length;
                  return (
                    <div className="card mb-3" key={loan.loanRequestId}>
                      <div className="card-header d-flex justify-content-between align-items-center">
                        <span>
                          <strong>{loan.loanId}</strong> — ₹{formatINR(loan.loanAmount)} @ {loan.annualRoi}% p.a.
                          — Monthly EMI: <strong className="text-danger">₹{formatINR(loan.monthlyEmi)}</strong>
                        </span>
                        <div className="d-flex align-items-center gap-3">
                          <Tag color={loan.loanStatus === "DISBURSED_MARKETPLACE" || loan.loanStatus === "ACTIVE" ? "green" : "orange"}>
                            {loan.loanStatus}
                          </Tag>
                          {overdueEmis > 0 && (
                            <Tag color="red">{overdueEmis} Overdue</Tag>
                          )}
                        </div>
                      </div>
                      <div className="card-body">
                        <Table
                          size="small"
                          columns={columns}
                          dataSource={(loan.emiSchedule || [])
                            .filter((e) => e.status === "OVERDUE" || e.status === "UPCOMING")
                            .slice(0, 3)
                            .map((r, i) => ({ ...r, key: i, loanId: loan.loanId, loanRequestId: loan.loanRequestId, _loan: loan }))}
                          pagination={false}
                          scroll={{ x: 900 }}
                          locale={{ emptyText: "All EMIs paid or none due yet" }}
                          onRow={(record) => ({
                            style: record.status === "OVERDUE"
                              ? { background: "#fff1f0", borderLeft: "3px solid #ff4d4f" }
                              : {},
                          })}
                        />
                        <div className="mt-2 text-end">
                          <Link
                            to="/borrower-emi-schedule"
                            className="btn btn-sm btn-outline-primary"
                          >
                            View Full Schedule
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Pay Modal */}
            <Modal
              open={payModal.visible}
              title={`Pay EMI — ${payModal.loan?.loanId || ""}`}
              okText={paySuccess ? "Paid!" : paying ? "Processing..." : "Confirm Payment"}
              okButtonProps={{ type: "primary", disabled: paySuccess || paying }}
              onOk={handlePay}
              onCancel={() => { setPayModal({ visible: false, emi: null, loan: null }); setPayError(""); }}
            >
              {paySuccess ? (
                <div className="text-center py-3">
                  <i className="fa-solid fa-check-circle text-success" style={{ fontSize: 48 }}></i>
                  <p className="mt-3 text-success">Payment successful!</p>
                </div>
              ) : payModal.emi ? (
                <div>
                  {payError && <div className="alert alert-danger mb-3">{payError}</div>}
                  <table className="table table-borderless table-sm" style={{ fontSize: 13 }}>
                    <tbody>
                      <tr>
                        <td className="text-muted">Loan ID</td>
                        <td><strong>{payModal.loan?.loanId}</strong></td>
                      </tr>
                      <tr>
                        <td className="text-muted">EMI #</td>
                        <td>{payModal.emi.emiNo}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Due Date</td>
                        <td>{payModal.emi.dueDate}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Principal</td>
                        <td>₹{formatINR(payModal.emi.principal)}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">Interest</td>
                        <td>₹{formatINR(payModal.emi.interest)}</td>
                      </tr>
                      <tr style={{ borderTop: "2px solid #f0f0f0" }}>
                        <td><strong>Total EMI Amount</strong></td>
                        <td><strong className="text-danger">₹{formatINR(payModal.emi.emiAmount)}</strong></td>
                      </tr>
                    </tbody>
                  </table>
                  <div
                    className="p-3 mt-2"
                    style={{ background: "#fffbe6", border: "1px solid #ffe58f", borderRadius: 6, fontSize: 12 }}
                  >
                    <strong>Payment Method:</strong> Amount will be debited from your registered
                    bank account via eNACH mandate. Ensure sufficient balance before confirming.
                  </div>
                </div>
              ) : null}
            </Modal>
          </div>
        </div>
      </div>
    </>
  );
};

export default PayEmi;
