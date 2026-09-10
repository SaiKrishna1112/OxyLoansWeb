import React, { useState, useEffect } from "react";

const fmt = (n) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

function toDateInput(dateStr) {
  if (!dateStr) return "";
  // handles "DD/MM/YYYY HH:mm:ss", "DD/MM/YYYY", "YYYY-MM-DD"
  const parts = dateStr.split(" ")[0];
  if (parts.includes("/")) {
    const [d, m, y] = parts.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return parts;
}

function calcFirst(participationDateStr, paymentDateStr, amount, monthlyRate) {
  if (!participationDateStr || !paymentDateStr || !amount || !monthlyRate)
    return { days: 0, interest: 0 };
  const p = new Date(participationDateStr);
  const e = new Date(paymentDateStr);
  if (isNaN(p) || isNaN(e)) return { days: 0, interest: 0 };

  const partDay = Math.min(p.getDate(), 30);
  const partMonth = p.getMonth() + 1;
  const partYear = p.getFullYear();

  const emiDay = Math.min(e.getDate(), 30);
  const emiMonth = e.getMonth() + 1;
  const emiYear = e.getFullYear();

  const days =
    (emiYear - partYear) * 360 +
    (emiMonth - partMonth) * 30 +
    (emiDay - partDay);

  const firstDays = days > 0 ? days - 2 : 0;
  const monthly = (amount * monthlyRate) / 100;
  const daily = monthly / 30;
  return { days: firstDays, interest: Math.round(firstDays * daily) };
}

const today = new Date().toISOString().split("T")[0];

const DealReturnCalculator = ({ deal, onClose }) => {
  const minAmt = Number(deal.minimumAmountInDeal) || 0;
  const maxAmt = Number(deal.lenderPaticipationLimit) || 0;
  const rate = deal.rateOfInterest || 0;
  const duration = deal.duration || 12;
  // use deal close date as proxy for first payment date
  const defaultPaymentDate = toDateInput(deal.fundsAcceptanceEndDate) || today;

  const [amount, setAmount] = useState(minAmt);
  const [customInput, setCustomInput] = useState(minAmt);
  const [activeTab, setActiveTab] = useState("min");
  const [participationDate, setParticipationDate] = useState(today);
  const [paymentDate, setPaymentDate] = useState(defaultPaymentDate);

  useEffect(() => {
    if (activeTab === "min") setAmount(minAmt);
    else if (activeTab === "max") setAmount(maxAmt);
    else setAmount(customInput);
  }, [activeTab, customInput, minAmt, maxAmt]);

  const monthly = Math.round((amount * rate) / 100);
  const { days: firstDays, interest: firstInterest } = calcFirst(
    participationDate,
    paymentDate,
    amount,
    rate
  );
  const remainingPayments = duration - 1;
  const totalInterest = firstInterest + monthly * remainingPayments;
  const totalReturns = amount + totalInterest;

  const tabBtn = (id, label) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: "7px 18px",
        borderRadius: 8,
        border: activeTab === id ? "2px solid #4f46e5" : "1.5px solid #e5e7eb",
        background: activeTab === id ? "#4f46e5" : "#fff",
        color: activeTab === id ? "#fff" : "#374151",
        fontWeight: 600,
        fontSize: 13,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff", borderRadius: 16, width: "100%",
          maxWidth: 560, maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg,#1a1a2e,#16213e)",
            borderRadius: "16px 16px 0 0",
            padding: "20px 24px",
            display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ color: "#f0a500", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
              Return Calculator
            </div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{deal.dealName}</div>
            <div style={{ color: "#9ca3af", fontSize: 13, marginTop: 4 }}>
              {rate}% / month &nbsp;·&nbsp; {duration} months
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 8, width: 32, height: 32, fontSize: 16, cursor: "pointer", lineHeight: "32px" }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Amount selector tabs */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Investment Amount
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {tabBtn("min", `Min — ${fmt(minAmt)}`)}
              {tabBtn("max", `Max — ${fmt(maxAmt)}`)}
              {tabBtn("custom", "Custom")}
            </div>
            {activeTab === "custom" && (
              <div style={{ marginTop: 10 }}>
                <input
                  type="number"
                  value={customInput}
                  min={minAmt}
                  max={maxAmt}
                  step={1000}
                  onChange={(e) => setCustomInput(Number(e.target.value))}
                  style={{
                    width: "100%", padding: "9px 14px",
                    border: "1.5px solid #e5e7eb", borderRadius: 8,
                    fontSize: 15, fontWeight: 600, outline: "none",
                  }}
                  placeholder={`Enter amount (${fmt(minAmt)} – ${fmt(maxAmt)})`}
                />
                {customInput < minAmt && (
                  <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                    Minimum participation is {fmt(minAmt)}
                  </div>
                )}
                {customInput > maxAmt && (
                  <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                    Maximum per lender is {fmt(maxAmt)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Date inputs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>
                Your Participation Date
              </label>
              <input
                type="date"
                value={participationDate}
                onChange={(e) => setParticipationDate(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>
                First Payment Date
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13 }}
              />
            </div>
          </div>

          {/* Results */}
          <div style={{ background: "#f9fafb", borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>First Payment <span style={{ color: "#9ca3af" }}>({firstDays} days counted)</span></div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
                  {firstDays} days × {fmt(Math.round((amount * rate) / 100 / 30))}/day
                </div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>{fmt(firstInterest)}</div>
            </div>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>Monthly Interest (from 2nd month)</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
                  {fmt(amount)} × {rate}% = every month
                </div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>{fmt(monthly)}</div>
            </div>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>Total Interest Earned</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>
                  First + ({remainingPayments} × {fmt(monthly)})
                </div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#059669" }}>{fmt(totalInterest)}</div>
            </div>
            <div
              style={{
                padding: "16px 18px",
                background: "linear-gradient(135deg,#1a1a2e,#16213e)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Total Returns (Principal + Interest)</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>
                  {fmt(amount)} + {fmt(totalInterest)}
                </div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#f0a500" }}>{fmt(totalReturns)}</div>
            </div>
          </div>

          {/* Payment schedule summary */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Payment Schedule
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={{ padding: "8px 12px", textAlign: "left", color: "#374151", fontWeight: 600 }}>Payment</th>
                  <th style={{ padding: "8px 12px", textAlign: "right", color: "#374151", fontWeight: 600 }}>Interest</th>
                  <th style={{ padding: "8px 12px", textAlign: "right", color: "#374151", fontWeight: 600 }}>Principal</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "8px 12px", color: "#374151" }}>1st payment <span style={{ color: "#9ca3af", fontSize: 11 }}>({firstDays} days)</span></td>
                  <td style={{ padding: "8px 12px", textAlign: "right", color: "#374151" }}>{fmt(firstInterest)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", color: "#9ca3af" }}>—</td>
                </tr>
                {Array.from({ length: Math.min(3, remainingPayments) }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "8px 12px", color: "#374151" }}>Month {i + 2}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: "#374151" }}>{fmt(monthly)}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: "#9ca3af" }}>—</td>
                  </tr>
                ))}
                {remainingPayments > 3 && (
                  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td colSpan={3} style={{ padding: "6px 12px", color: "#9ca3af", fontSize: 12, textAlign: "center" }}>
                      · · · {remainingPayments - 3} more monthly payments of {fmt(monthly)} · · ·
                    </td>
                  </tr>
                )}
                <tr style={{ background: "#fef3c7" }}>
                  <td style={{ padding: "8px 12px", color: "#92400e", fontWeight: 600 }}>Last month ({duration})</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", color: "#92400e", fontWeight: 600 }}>{fmt(monthly)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", color: "#92400e", fontWeight: 600 }}>{fmt(amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 16, fontSize: 11, color: "#9ca3af", lineHeight: 1.6 }}>
            * First payment calculated using 30/360 day convention. Actual payout dates follow the deal's fixed payment schedule.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealReturnCalculator;
