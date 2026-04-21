import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../../../config";

const getRatingColor = (score) => {
  if (score >= 850) return "#2e7d32";
  if (score >= 750) return "#388e3c";
  if (score >= 650) return "#f57c00";
  if (score >= 600) return "#e65100";
  return "#c62828";
};

const getRatingEmoji = (score) => {
  if (score >= 850) return "🟢 Excellent";
  if (score >= 750) return "🟢 Very Good";
  if (score >= 650) return "🟡 Good";
  if (score >= 600) return "🟠 Fair";
  return "🔴 Poor";
};

const ScoreBar = ({ score, max, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{ flex: 1, background: "#e0e0e0", borderRadius: 4, height: 8 }}>
      <div style={{
        width: `${Math.min(100, (score / max) * 100)}%`,
        background: color,
        height: "100%",
        borderRadius: 4,
        transition: "width 0.5s"
      }} />
    </div>
    <span style={{ fontSize: 12, minWidth: 60, textAlign: "right" }}>{score}/{max}</span>
  </div>
);

export default function OxyScoreCard({ borrowerUserId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!borrowerUserId) return;
    setLoading(true);
    axios
      .get(`${BASE_URL}/v1/cibil/marketplace-score/${borrowerUserId}`, {
        headers: { userId },
      })
      .then((r) => { setData(r.data); setLoading(false); })
      .catch(() => { setError("Score unavailable"); setLoading(false); });
  }, [borrowerUserId]);

  if (loading) return <div className="text-center p-3"><div className="spinner-border spinner-border-sm" /></div>;
  if (error || !data) return null;

  const color = getRatingColor(data.oxyScore);
  const bd = data.breakdown || {};
  const dbr = data.dbrAnalysis || {};
  const hist = data.repaymentHistory || {};

  return (
    <div style={{
      border: "1px solid #e0e0e0",
      borderRadius: 12,
      padding: 16,
      background: "#fafafa",
      fontSize: 13,
      maxWidth: 340
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 28, fontWeight: 700, color }}>
          {data.oxyScore}<span style={{ fontSize: 14, color: "#666" }}>/1000</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color }}>
          OxyScore: {getRatingEmoji(data.oxyScore)}
        </div>
      </div>

      {/* Breakdown */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontWeight: 600, marginBottom: 6, borderBottom: "1px solid #e0e0e0", paddingBottom: 4 }}>
          Score Breakdown
        </div>
        {[
          { label: "CIBIL Base", val: (bd.cibilBase || {}).score || 0, max: 600 },
          { label: "Employment", val: (bd.employment || {}).score || 0, max: 150 },
          { label: "Income", val: (bd.income || {}).score || 0, max: 200 },
          { label: "Profile", val: (bd.profile || {}).score || 0, max: 50 },
          { label: "Loan History", val: (bd.loanHistory || {}).score || 0, max: 50 },
        ].map(({ label, val, max }) => (
          <div key={label} style={{ marginBottom: 5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span>{label}</span>
            </div>
            <ScoreBar score={val} max={max} color={color} />
          </div>
        ))}
      </div>

      {/* DBR Analysis */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontWeight: 600, marginBottom: 6, borderBottom: "1px solid #e0e0e0", paddingBottom: 4 }}>
          DBR Analysis
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 8px" }}>
          <span style={{ color: "#666" }}>Monthly Income:</span>
          <span>₹{(dbr.monthlyIncome || 0).toLocaleString("en-IN")}</span>
          <span style={{ color: "#666" }}>Existing EMIs:</span>
          <span>₹{(dbr.existingEMIs || 0).toLocaleString("en-IN")}</span>
          <span style={{ color: "#666" }}>Max New EMI:</span>
          <span>₹{(dbr.maxNewEMI || 0).toLocaleString("en-IN")}</span>
          <span style={{ color: "#666" }}>Loan Eligible:</span>
          <span style={{ fontWeight: 600 }}>₹{(dbr.loanEligible || 0).toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Repayment History */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontWeight: 600, marginBottom: 6, borderBottom: "1px solid #e0e0e0", paddingBottom: 4 }}>
          Repayment History
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 8px" }}>
          <span style={{ color: "#666" }}>On-time:</span>
          <span style={{ color: "#2e7d32" }}>{hist.onTimeRepayments || 0} ✅</span>
          <span style={{ color: "#666" }}>Bounced:</span>
          <span style={{ color: hist.bounceCount > 0 ? "#c62828" : "#2e7d32" }}>
            {hist.bounceCount || 0} {hist.bounceCount > 0 ? "⚠️" : "✅"}
          </span>
          <span style={{ color: "#666" }}>Eligibility:</span>
          <span>{hist.eligibilityPct || 50}%</span>
        </div>
      </div>

      {/* Platform Says */}
      <div style={{
        textAlign: "center",
        padding: "6px 12px",
        borderRadius: 8,
        background: data.platformSays?.includes("SAFE") ? "#e8f5e9" : "#fff3e0",
        color: data.platformSays?.includes("SAFE") ? "#2e7d32" : "#e65100",
        fontWeight: 700,
        fontSize: 13
      }}>
        Platform Says: {data.platformSays}
      </div>

      {data.isBlacklisted && (
        <div className="alert alert-danger mt-2 py-1 text-center" style={{ fontSize: 12 }}>
          ⛔ This borrower is blacklisted
        </div>
      )}
      {data.isSuspended && (
        <div className="alert alert-warning mt-2 py-1 text-center" style={{ fontSize: 12 }}>
          ⏸ This borrower is suspended
        </div>
      )}
    </div>
  );
}
