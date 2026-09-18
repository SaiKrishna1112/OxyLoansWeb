import React, { useState, useEffect } from "react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const GUIDE_URL = "/first-interest-guide.html";

const fmt = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const fmtExact = (n) => {
  const r = Math.round(n * 100) / 100;
  return "₹" + r.toFixed(2);
};

function toDateInput(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split(" ")[0];
  if (parts.includes("/")) {
    const [d, m, y] = parts.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return parts;
}

function fmtDateLabel(isoStr) {
  if (!isoStr) return "";
  const [y, m, d] = isoStr.split("-");
  return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]} ${y}`;
}

function calcFirst(participationDateStr, paymentDateStr, amount, monthlyRate) {
  const empty = { days: 0, interest: 0, rawDays: 0, daily: 0, monthly: 0, partDay: 0, emiDay: 0, partDayOrig: 0, emiDayOrig: 0, partMonth: 0, emiMonth: 0, partYear: 0, emiYear: 0 };
  if (!participationDateStr || !paymentDateStr || !amount || !monthlyRate) return empty;
  const p = new Date(participationDateStr);
  const e = new Date(paymentDateStr);
  if (isNaN(p) || isNaN(e)) return empty;

  const partDayOrig = p.getDate();
  const partDay = Math.min(partDayOrig, 30);
  const partMonth = p.getMonth() + 1;
  const partYear = p.getFullYear();

  const emiDayOrig = e.getDate();
  const emiDay = Math.min(emiDayOrig, 30);
  const emiMonth = e.getMonth() + 1;
  const emiYear = e.getFullYear();

  const rawDays =
    (emiYear - partYear) * 360 +
    (emiMonth - partMonth) * 30 +
    (emiDay - partDay);

  const firstDays = rawDays > 0 ? rawDays - 2 : 0;
  const monthly = (amount * monthlyRate) / 100;
  const daily = monthly / 30;
  const interest = firstDays * daily;
  return { days: firstDays, interest, rawDays, daily, monthly, partDay, emiDay, partDayOrig, emiDayOrig, partMonth, emiMonth, partYear, emiYear };
}

const today = new Date().toISOString().split("T")[0];

const DealReturnCalculator = ({ deal, onClose }) => {
  const minAmt = Number(deal.minimumAmountInDeal) || 0;
  const maxAmt = Number(deal.lenderPaticipationLimit) || 0;
  const rate = deal.rateOfInterest || 0;
  const duration = deal.duration || 12;
  const dealStartDate = toDateInput(deal.fundsAcceptanceStartDate) || today;
  const paymentDate = toDateInput(deal.fundsAcceptanceEndDate) || today;

  const [amount, setAmount] = useState(minAmt);
  const [customInput, setCustomInput] = useState(minAmt);
  const [activeTab, setActiveTab] = useState("min");
  const [participationDate, setParticipationDate] = useState(
    dealStartDate > today ? dealStartDate : today
  );

  useEffect(() => {
    if (activeTab === "min") setAmount(minAmt);
    else if (activeTab === "max") setAmount(maxAmt);
    else setAmount(customInput);
  }, [activeTab, customInput, minAmt, maxAmt]);

  const calc = calcFirst(participationDate, paymentDate, amount, rate);
  const { days: firstDays, interest: firstInterest, rawDays, daily, monthly: firstMonthly, partDay, emiDay, partDayOrig, emiDayOrig } = calc;
  const monthly = Math.round((amount * rate) / 100);
  const remainingPayments = duration - 1;
  const totalInterest = firstInterest + monthly * remainingPayments;
  const totalReturns = amount + totalInterest;

  const yearDiff = calc.emiYear - calc.partYear;
  const monthDiff = calc.emiMonth - calc.partMonth;
  const dayDiff = emiDay - partDay;

  const tabBtn = (id, label) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: "6px 14px", borderRadius: 7, fontSize: 12,
        border: activeTab === id ? "2px solid #1d4ed8" : "1.5px solid #e2e8f0",
        background: activeTab === id ? "#1d4ed8" : "#fff",
        color: activeTab === id ? "#fff" : "#374151",
        fontWeight: 600, cursor: "pointer",
      }}
    >{label}</button>
  );

  // Build formula strings dynamically
  const partDayCap = partDayOrig > 30 ? `min(${partDayOrig},30)=30` : `${partDayOrig}`;
  const emiDayCap = emiDayOrig > 30 ? `min(${emiDayOrig},30)=30` : `${emiDayOrig}`;

  const StepRow = ({ n, title, lines, result }) => (
    <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
      <div style={{ minWidth: 22, height: 22, borderRadius: "50%", background: "#1d4ed8", color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{n}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#1e40af", marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.3 }}>{title}</div>
        {lines.map((l, i) => (
          <div key={i} style={{ fontFamily: "monospace", fontSize: 12, color: "#374151", background: "#f1f5f9", borderRadius: 5, padding: "3px 8px", marginBottom: 2, lineHeight: 1.5 }}>{l}</div>
        ))}
        {result && <div style={{ fontSize: 13, fontWeight: 800, color: "#1d4ed8", marginTop: 4 }}>{result}</div>}
      </div>
    </div>
  );

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 860, maxHeight: "94vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column" }}>

        {/* Header — prominent blue */}
        <div style={{ background: "linear-gradient(135deg,#1e3a8a,#1d4ed8)", borderRadius: "16px 16px 0 0", padding: "16px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase", color: "#93c5fd", marginBottom: 3 }}>🧮 Return Calculator</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{deal.dealName}</div>
            <div style={{ color: "#bfdbfe", fontSize: 12, marginTop: 2 }}>{rate}% / month &nbsp;·&nbsp; {duration} months tenure</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 8, width: 32, height: 32, fontSize: 18, cursor: "pointer", lineHeight: "32px", flexShrink: 0 }}>×</button>
        </div>

        {/* Two-column body */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", flex: 1, minHeight: 0 }}>

          {/* LEFT: Inputs + Results */}
          <div style={{ padding: "18px 18px 18px 20px", borderRight: "1px solid #e2e8f0", overflowY: "auto" }}>
            {/* Amount tabs */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#64748b", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.8 }}>Investment Amount</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {tabBtn("min", `Min ${fmt(minAmt)}`)}
                {tabBtn("max", `Max ${fmt(maxAmt)}`)}
                {tabBtn("custom", "Custom")}
              </div>
              {activeTab === "custom" && (
                <div style={{ marginTop: 8 }}>
                  <input
                    type="number" value={customInput} min={minAmt} max={maxAmt} step={1000}
                    onChange={(e) => setCustomInput(Number(e.target.value))}
                    style={{ width: "100%", padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontWeight: 600, outline: "none" }}
                    placeholder={`${fmt(minAmt)} – ${fmt(maxAmt)}`}
                  />
                  {customInput < minAmt && <div style={{ color: "#ef4444", fontSize: 11, marginTop: 3 }}>Min is {fmt(minAmt)}</div>}
                  {customInput > maxAmt && <div style={{ color: "#ef4444", fontSize: 11, marginTop: 3 }}>Max is {fmt(maxAmt)}</div>}
                </div>
              )}
            </div>

            {/* Date inputs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 800, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Your Participation Date</label>
                <input
                  type="date"
                  value={participationDate}
                  min={dealStartDate}
                  max={paymentDate}
                  onChange={(e) => setParticipationDate(e.target.value)}
                  style={{ width: "100%", padding: "7px 8px", border: "1.5px solid #1d4ed8", borderRadius: 7, fontSize: 12 }}
                />
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Between {fmtDateLabel(dealStartDate)} – {fmtDateLabel(paymentDate)}</div>
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 800, color: "#64748b", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>First Payment Date</label>
                <div style={{ padding: "7px 10px", background: "#f1f5f9", border: "1.5px solid #e2e8f0", borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#1d4ed8" }}>
                  {fmtDateLabel(paymentDate)}
                </div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Fixed by deal — set by OxyLoans</div>
              </div>
            </div>

            {/* Results */}
            <div style={{ borderRadius: 10, overflow: "hidden", border: "1.5px solid #dbeafe", marginBottom: 14 }}>
              <div style={{ background: "#1d4ed8", padding: "6px 12px" }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#bfdbfe", letterSpacing: 1, textTransform: "uppercase" }}>Your Returns</span>
              </div>
              <div style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>First Payment</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{firstDays} days × ₹{daily.toFixed(4)}/day</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1d4ed8" }}>{fmtExact(firstInterest)}</div>
              </div>
              <div style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>Monthly (months 2–{duration})</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{fmt(amount)} × {rate}%</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#1d4ed8" }}>{fmt(monthly)}/mo</div>
              </div>
              <div style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9", background: "#f0fdf4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>Total Interest</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#059669" }}>{fmtExact(totalInterest)}</div>
              </div>
              <div style={{ padding: "12px 12px", background: "linear-gradient(135deg,#1e3a8a,#1d4ed8)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12, color: "#bfdbfe", fontWeight: 700 }}>Total Returns</div>
                  <div style={{ fontSize: 10, color: "#93c5fd", marginTop: 1 }}>{fmt(amount)} + {fmtExact(totalInterest)}</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fbbf24" }}>{fmtExact(totalReturns)}</div>
              </div>
            </div>

            {/* Payment schedule */}
            <div style={{ fontSize: 10, fontWeight: 800, color: "#1d4ed8", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>Payment Schedule</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, borderRadius: 8, overflow: "hidden", border: "1.5px solid #e2e8f0" }}>
              <thead>
                <tr style={{ background: "#1d4ed8" }}>
                  <th style={{ padding: "7px 10px", textAlign: "left", color: "#fff", fontWeight: 600 }}>Payment</th>
                  <th style={{ padding: "7px 10px", textAlign: "right", color: "#fff", fontWeight: 600 }}>Interest</th>
                  <th style={{ padding: "7px 10px", textAlign: "right", color: "#fff", fontWeight: 600 }}>Principal</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "7px 10px", color: "#374151" }}>1st payment <span style={{ color: "#94a3b8", fontSize: 10 }}>({firstDays}d)</span></td>
                  <td style={{ padding: "7px 10px", textAlign: "right", color: "#1d4ed8", fontWeight: 700 }}>{fmtExact(firstInterest)}</td>
                  <td style={{ padding: "7px 10px", textAlign: "right", color: "#94a3b8" }}>—</td>
                </tr>
                {Array.from({ length: Math.min(3, remainingPayments) }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                    <td style={{ padding: "7px 10px", color: "#374151" }}>Month {i + 2}</td>
                    <td style={{ padding: "7px 10px", textAlign: "right", color: "#1d4ed8", fontWeight: 700 }}>{fmt(monthly)}</td>
                    <td style={{ padding: "7px 10px", textAlign: "right", color: "#94a3b8" }}>—</td>
                  </tr>
                ))}
                {remainingPayments > 3 && (
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td colSpan={3} style={{ padding: "5px 10px", color: "#94a3b8", fontSize: 11, textAlign: "center" }}>
                      · · · {remainingPayments - 3} more @ {fmt(monthly)}/mo · · ·
                    </td>
                  </tr>
                )}
                <tr style={{ background: "linear-gradient(90deg,#fef3c7,#fde68a)" }}>
                  <td style={{ padding: "7px 10px", color: "#92400e", fontWeight: 700 }}>Month {duration} (last)</td>
                  <td style={{ padding: "7px 10px", textAlign: "right", color: "#92400e", fontWeight: 700 }}>{fmt(monthly)}</td>
                  <td style={{ padding: "7px 10px", textAlign: "right", color: "#b45309", fontWeight: 700 }}>{fmt(amount)} ↩</td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: 10, fontSize: 10, color: "#94a3b8", lineHeight: 1.5 }}>
              * 30/360 day convention. Returns are indicative.
            </div>
          </div>

          {/* RIGHT: Theory / How it's calculated */}
          <div style={{ padding: "18px 20px 18px 18px", background: "#f8fafc", overflowY: "auto" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#1e40af", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>📐 How your first payment is calculated</div>
            <a
              href={GUIDE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "11px 14px", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", borderRadius: 10, textDecoration: "none", marginBottom: 12, boxShadow: "0 3px 10px rgba(217,119,6,0.35)" }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 1 }}>📄 First Interest Payment Guide</div>
                <div style={{ fontSize: 10, opacity: 0.9 }}>Full explanation with worked examples — tap to open PDF</div>
              </div>
              <div style={{ fontSize: 20, flexShrink: 0 }}>↗</div>
            </a>
            <div style={{ fontSize: 11, color: "#475569", marginBottom: 14, lineHeight: 1.5, padding: "8px 10px", background: "#eff6ff", borderRadius: 8, borderLeft: "3px solid #1d4ed8" }}>
              OxyLoans uses the <strong style={{ color: "#1d4ed8" }}>30/360 day convention</strong> — every month = 30 days, year = 360 days. Your first payment covers the exact days between your participation date and the first payout date. This can be <strong>less than a full month</strong> (if you join close to the payout date) or <strong>more than a full month</strong> (if the gap spans over 30 days). From the 2nd month onwards, every payment is always a fixed full month's interest.
            </div>

            <StepRow
              n={1}
              title="Cap each date's day at 30"
              lines={[
                `Join date:  ${fmtDateLabel(participationDate)} → Day ${partDayCap}`,
                `1st payment: ${fmtDateLabel(paymentDate)} → Day ${emiDayCap}`,
              ]}
              result={partDayOrig > 30 || emiDayOrig > 30 ? "Any day 31+ is treated as 30" : "Days 1–30 used as-is"}
            />

            <StepRow
              n={2}
              title="Count gross days (30/360 formula)"
              lines={[
                ...(yearDiff > 0 ? [`${yearDiff} yr × 360 = ${yearDiff * 360} days`] : []),
                ...(monthDiff > 0 ? [`${monthDiff} mo × 30 = ${monthDiff * 30} days`] : []),
                `Day ${emiDay} − Day ${partDay} = ${dayDiff} days`,
                `Gross total = ${rawDays} days`,
              ]}
            />

            <StepRow
              n={3}
              title="Subtract 2 days (convention)"
              lines={[`${rawDays} − 2 = ${firstDays} days counted`]}
              result="First & last day excluded (standard P2P rule)"
            />

            <StepRow
              n={4}
              title="Calculate daily interest rate"
              lines={[
                `${fmt(amount)} × ${rate}% = ₹${firstMonthly.toFixed(2)}/month`,
                `₹${firstMonthly.toFixed(2)} ÷ 30 = ₹${daily.toFixed(4)}/day`,
              ]}
            />

            <StepRow
              n={5}
              title="Days × daily rate = first payment"
              lines={[`${firstDays} days × ₹${daily.toFixed(4)}/day`]}
              result={`= ${fmtExact(firstInterest)}`}
            />

            {/* Rounding note */}
            <div style={{ background: "#fefce8", border: "1px solid #fde047", borderRadius: 8, padding: "9px 11px", marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#713f12", marginBottom: 3 }}>💡 Why shown to paise, not rupees?</div>
              <div style={{ fontSize: 11, color: "#78350f", lineHeight: 1.5 }}>
                For small investments, each day = only ₹{daily.toFixed(4)}. Rounding to rupees can make different dates look identical. We show paise so changing your date always shows a visibly different result.
              </div>
            </div>

            {/* Monthly note */}
            <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "9px 11px", marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#065f46", marginBottom: 2 }}>From 2nd month — full monthly interest</div>
              <div style={{ fontSize: 11, color: "#047857", lineHeight: 1.5 }}>
                {fmt(amount)} × {rate}% = <strong>{fmt(monthly)}/month</strong> (no pro-rating)<br/>
                Principal {fmt(amount)} returned in month {duration} with last interest.
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DealReturnCalculator;
