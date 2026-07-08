import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../../../config";

export default function FundingProgressBar({ loanRequestId, onFund }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [funding, setFunding] = useState(false);
  const [msg, setMsg] = useState("");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!loanRequestId) return;
    fetchStatus();
  }, [loanRequestId]);

  const fetchStatus = async () => {
    try {
      const r = await axios.get(`${BASE_URL}/v1/marketplace/funding/${loanRequestId}`, {
        headers: { userId },
      });
      setStatus(r.data);
    } catch (_) {}
  };

  const handleFund = async () => {
    if (!fundAmount || parseFloat(fundAmount) <= 0) return;
    setFunding(true);
    setMsg("");
    try {
      const r = await axios.post(
        `${BASE_URL}/v1/marketplace/funding/${loanRequestId}/commit`,
        { amount: parseFloat(fundAmount) },
        { headers: { userId } }
      );
      setStatus(r.data);
      setMsg("✅ Funding committed!");
      setFundAmount("");
      if (onFund) onFund(r.data);
    } catch (e) {
      setMsg("❌ " + (e.response?.data?.error || "Failed to commit funding"));
    } finally {
      setFunding(false);
    }
  };

  if (!status) return null;

  const pct = Math.min(100, status.fundingPercentage || 0);
  const barColor =
    pct >= 100 ? "#2e7d32" : pct >= 50 ? "#f57c00" : "#1565c0";

  return (
    <div style={{ padding: "12px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>
          Funded: ₹{(status.totalFundedAmount || 0).toLocaleString("en-IN")} of ₹{(status.totalRequestedAmount || 0).toLocaleString("en-IN")}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: barColor }}>{pct.toFixed(0)}%</span>
      </div>
      <div style={{ background: "#e0e0e0", borderRadius: 6, height: 10, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, background: barColor, height: "100%", transition: "width 0.5s" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 11, color: "#666" }}>
          Status: <strong>{status.fundingStatus}</strong>
        </span>
        {status.fundingDeadline && (
          <span style={{ fontSize: 11, color: "#666" }}>
            Deadline: {new Date(status.fundingDeadline).toLocaleDateString("en-IN")}
          </span>
        )}
      </div>

      {status.fundingStatus !== "FULLY_FUNDED" && status.fundingStatus !== "EXPIRED" && (
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <input
            type="number"
            placeholder="Amount to fund (₹)"
            className="form-control form-control-sm"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            style={{ maxWidth: 180 }}
          />
          <button
            className="btn btn-sm btn-success"
            onClick={handleFund}
            disabled={funding}
          >
            {funding ? "…" : "Fund This Loan"}
          </button>
        </div>
      )}
      {msg && <div style={{ marginTop: 6, fontSize: 12, color: msg.startsWith("✅") ? "green" : "red" }}>{msg}</div>}

      {status.lenders && status.lenders.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Lenders:</div>
          {status.lenders.map((l, i) => (
            <div key={i} style={{ fontSize: 12, display: "flex", justifyContent: "space-between" }}>
              <span>{l.lenderName || `Lender #${l.lenderUserId}`}</span>
              <span>₹{(l.amount || 0).toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
