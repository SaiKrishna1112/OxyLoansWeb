import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../../../config";

export default function FeeDisclosure() {
  const { loanRequestId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [message, setMessage] = useState("");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    axios
      .get(`${BASE_URL}/v1/fees/disclosure/${loanRequestId}`, { headers: { userId } })
      .then((r) => { setData(r.data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [loanRequestId]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await axios.post(
        `${BASE_URL}/v1/fees/disclosure/${loanRequestId}/accept`,
        {},
        { headers: { userId } }
      );
      setMessage("✅ Fee disclosure accepted. You may now proceed to eSign.");
      setData((prev) => ({ ...prev, feeDisclosureAccepted: true }));
    } catch (e) {
      setMessage("❌ Failed to accept fee disclosure");
    } finally {
      setAccepting(false);
    }
  };

  const fmt = (n) =>
    Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (loading) return <div className="text-center p-5"><div className="spinner-border" /></div>;
  if (!data) return <div className="alert alert-danger m-4">Failed to load fee details</div>;

  return (
    <div className="container-fluid" style={{ background: "#f5f5f5", minHeight: "100vh", padding: "24px" }}>
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-header text-white text-center" style={{ background: "#1a237e" }}>
              <h5 className="mb-0">Fee Disclosure</h5>
              <small>Please review before signing</small>
            </div>
            <div className="card-body p-0">
              <table className="table table-bordered mb-0">
                <tbody>
                  <tr>
                    <td className="fw-semibold bg-light">Loan Amount</td>
                    <td className="text-end fw-bold fs-6">₹{fmt(data.loanAmount)}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold bg-light">Interest</td>
                    <td className="text-end">₹{fmt(data.interest)}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold bg-light">
                      Processing Fee ({data.processingFeePct}%)
                    </td>
                    <td className="text-end">₹{fmt(data.processingFee)}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold bg-light">
                      GST on Fee ({data.gstPct}%)
                    </td>
                    <td className="text-end">₹{fmt(data.gstOnFee)}</td>
                  </tr>
                  <tr className="table-warning">
                    <td className="fw-bold">Total Fee</td>
                    <td className="text-end fw-bold">₹{fmt(data.totalFee)}</td>
                  </tr>
                  <tr className="table-success">
                    <td className="fw-bold">You Will Receive</td>
                    <td className="text-end fw-bold text-success fs-5">₹{fmt(data.netDisbursalAmount)}</td>
                  </tr>
                  <tr className="table-danger">
                    <td className="fw-bold">You Will Repay</td>
                    <td className="text-end fw-bold text-danger fs-5">₹{fmt(data.totalRepaymentAmount)}</td>
                  </tr>
                  <tr>
                    <td className="fw-semibold bg-light">Repayment By</td>
                    <td className="text-end">
                      {data.repaymentDateStart} to {data.repaymentDateEnd}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="card-footer">
              {message && (
                <div className={`alert ${message.startsWith("✅") ? "alert-success" : "alert-danger"} py-2 mb-3`}>
                  {message}
                </div>
              )}

              {!data.feeDisclosureAccepted ? (
                <>
                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="agreeCheck"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="agreeCheck">
                      I have read and agree to the fee structure and terms above
                    </label>
                  </div>
                  <div className="d-grid">
                    <button
                      className="btn btn-primary btn-lg"
                      disabled={!agreed || accepting}
                      onClick={handleAccept}
                    >
                      {accepting ? "Processing…" : "Accept & Proceed to eSign"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="alert alert-success text-center mb-0">
                  ✅ Fee disclosure accepted. Proceed to eSign.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
