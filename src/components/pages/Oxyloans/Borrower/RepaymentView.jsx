import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../../../config";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusBadge = (s) => {
  const map = { PAID: "success", PENDING: "warning", BOUNCED: "danger", OVERDUE: "danger" };
  return `badge bg-${map[s] || "secondary"}`;
};

export default function RepaymentView() {
  const { loanRequestId } = useParams();
  const [repayment, setRepayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [msg, setMsg] = useState("");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!loanRequestId) return;
    axios
      .get(`${BASE_URL}/v1/marketplace/repayment/loan/${loanRequestId}`, {
        headers: { userId },
      })
      .then((r) => { setRepayment(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [loanRequestId]);

  const handlePay = async () => {
    if (!repayment?.id) return;
    setPaying(true);
    setMsg("");
    try {
      await axios.post(
        `${BASE_URL}/v1/marketplace/repayment/${repayment.id}/pay`,
        {},
        { headers: { userId } }
      );
      setMsg("success");
      setRepayment((prev) => ({ ...prev, repaymentStatus: "PAID", paidAt: new Date().toISOString() }));
    } catch (e) {
      setMsg(e.response?.data?.error || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="text-center p-5"><div className="spinner-border" /></div>;
  if (!repayment) return (
    <div className="container-fluid p-4">
      <div className="alert alert-info">No repayment record found for this loan yet.</div>
    </div>
  );

  const isPaid = repayment.repaymentStatus === "PAID";

  return (
    <div className="container-fluid" style={{ background: "#f5f5f5", minHeight: "100vh", padding: "24px" }}>
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card shadow">
            <div className="card-header text-white text-center" style={{ background: "#1a237e" }}>
              <h5 className="mb-0">Repayment Schedule</h5>
              <small>Loan #{loanRequestId}</small>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <div className="text-muted small">Status</div>
                  <span className={statusBadge(repayment.repaymentStatus)} style={{ fontSize: 14 }}>
                    {repayment.repaymentStatus}
                  </span>
                </div>
                {repayment.paidAt && (
                  <div className="text-end">
                    <div className="text-muted small">Paid On</div>
                    <strong>{new Date(repayment.paidAt).toLocaleDateString("en-IN")}</strong>
                  </div>
                )}
              </div>

              <table className="table table-bordered mb-0">
                <tbody>
                  <tr>
                    <td className="fw-semibold bg-light">Principal</td>
                    <td className="text-end fw-bold">₹{fmt(repayment.principalAmount)}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold bg-light">Interest</td>
                    <td className="text-end">₹{fmt(repayment.interestAmount)}</td>
                  </tr>
                  <tr className="table-danger">
                    <td className="fw-bold">Total Repayment</td>
                    <td className="text-end fw-bold text-danger fs-5">₹{fmt(repayment.totalRepaymentAmount)}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold bg-light">Due Date (From)</td>
                    <td className="text-end">
                      {repayment.dueDateStart
                        ? new Date(repayment.dueDateStart).toLocaleDateString("en-IN")
                        : "TBD"}
                    </td>
                  </tr>
                  <tr>
                    <td className="fw-semibold bg-light">Due Date (To)</td>
                    <td className="text-end">
                      {repayment.dueDateEnd
                        ? new Date(repayment.dueDateEnd).toLocaleDateString("en-IN")
                        : "TBD"}
                    </td>
                  </tr>
                  {repayment.penaltyAmount > 0 && (
                    <tr className="table-warning">
                      <td className="fw-semibold">Bounce Penalty</td>
                      <td className="text-end text-danger">₹{fmt(repayment.penaltyAmount)}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {repayment.bounceReason && (
                <div className="alert alert-danger mt-3 mb-0 py-2">
                  <strong>Bounce Reason:</strong> {repayment.bounceReason}
                </div>
              )}
            </div>

            <div className="card-footer">
              {msg === "success" ? (
                <div className="alert alert-success text-center mb-0">
                  Payment recorded successfully.
                </div>
              ) : msg ? (
                <div className="alert alert-danger py-2 mb-3">{msg}</div>
              ) : null}

              {!isPaid && (
                <div className="d-grid">
                  <button
                    className="btn btn-success btn-lg"
                    onClick={handlePay}
                    disabled={paying}
                  >
                    {paying ? "Processing…" : `Pay ₹${fmt(repayment.totalRepaymentAmount + (repayment.penaltyAmount || 0))}`}
                  </button>
                </div>
              )}

              {isPaid && (
                <div className="alert alert-success text-center mb-0">
                  Repayment complete. Thank you!
                </div>
              )}
            </div>
          </div>

          {repayment.lenderSplits && repayment.lenderSplits.length > 0 && (
            <div className="card mt-3 shadow-sm">
              <div className="card-header fw-semibold">Lender Repayment Breakdown</div>
              <div className="card-body p-0">
                <table className="table table-sm mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Lender</th>
                      <th className="text-end">Amount</th>
                      <th className="text-end">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {repayment.lenderSplits.map((s, i) => (
                      <tr key={i}>
                        <td>{s.lenderName || `Lender #${s.lenderUserId}`}</td>
                        <td className="text-end">₹{fmt(s.amount)}</td>
                        <td className="text-end">
                          <span className={statusBadge(s.status)}>{s.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
