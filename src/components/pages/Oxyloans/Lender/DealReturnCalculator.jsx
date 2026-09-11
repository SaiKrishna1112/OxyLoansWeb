import React, { useState, useEffect } from "react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const GUIDE_PDF = "/OxyLoans_First_Interest_Payment_Guide.pdf";

const fmt = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

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
  return { days: firstDays, interest: Math.round(firstDays * daily), rawDays, daily, monthly, partDay, emiDay, partDayOrig, emiDayOrig, partMonth, emiMonth, partYear, emiYear };
}

const today = new Date().toISOString().split("T")[0];

const CalcStep = ({ n, label, val, note }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
    <div style={{ minWidth: 22, height: 22, borderRadius: "50%", background: "#4f46e5", color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0 }}>{n}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e1b4b", marginTop: 2, fontFamily: "monospace", lineHeight: 1.6 }}>{val}</div>
      {note && <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2, lineHeight: 1.4 }}>{note}</div>}
    </div>
  </div>
);

const DealReturnCalculator = ({ deal, onClose }) => {
  const minAmt = Number(deal.minimumAmountInDeal) || 0;
  const maxAmt = Number(deal.lenderPaticipationLimit) || 0;
  const rate = deal.rateOfInterest || 0;
  const duration = deal.duration || 12;
  const defaultPaymentDate = toDateInput(deal.fundsAcceptanceEndDate) || today;

  const [amount, setAmount] = useState(minAmt);
  const [customInput, setCustomInput] = useState(minAmt);
  const [activeTab, setActiveTab] = useState("min");
  const [participationDate, setParticipationDate] = useState(today);
  const [paymentDate, setPaymentDate] = useState(defaultPaymentDate);
  const [showCalcDetail, setShowCalcDetail] = useState(true);

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

  const tabBtn = (id, label) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: "7px 18px", borderRadius: 8,
        border: activeTab === id ? "2px solid #4f46e5" : "1.5px solid #e5e7eb",
        background: activeTab === id ? "#4f46e5" : "#fff",
        color: activeTab === id ? "#fff" : "#374151",
        fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.15s",
      }}
    >{label}</button>
  );

  const partDayCap = partDayOrig > 30 ? `min(${partDayOrig}, 30) = 30` : `${partDayOrig}`;
  const emiDayCap = emiDayOrig > 30 ? `min(${emiDayOrig}, 30) = 30` : `${emiDayOrig}`;
  const yearDiff = calc.emiYear - calc.partYear;
  const monthDiff = calc.emiMonth - calc.partMonth;
  const dayDiff = emiDay - partDay;

  let rawFormulaParts = [];
  if (yearDiff > 0) rawFormulaParts.push(`${yearDiff}×360 = ${yearDiff * 360}`);
  if (monthDiff > 0) rawFormulaParts.push(`${monthDiff}×30 = ${monthDiff * 30}`);
  rawFormulaParts.push(`${emiDay}−${partDay} = ${dayDiff}`);
  const rawFormulaStr = rawFormulaParts.length > 1
    ? rawFormulaParts.join(" + ") + ` = ${rawDays} days`
    : `${emiDay} − ${partDay} = ${rawDays} days`;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 580, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#1a1a2e,#16213e)", borderRadius: "16px 16px 0 0", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ color: "#f0a500", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Return Calculator</div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{deal.dealName}</div>
            <div style={{ color: "#9ca3af", fontSize: 13, marginTop: 4 }}>{rate}% / month &nbsp;·&nbsp; {duration} months</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", borderRadius: 8, width: 32, height: 32, fontSize: 16, cursor: "pointer", lineHeight: "32px" }}>×</button>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Amount tabs */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Investment Amount</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {tabBtn("min", `Min — ${fmt(minAmt)}`)}
              {tabBtn("max", `Max — ${fmt(maxAmt)}`)}
              {tabBtn("custom", "Custom")}
            </div>
            {activeTab === "custom" && (
              <div style={{ marginTop: 10 }}>
                <input
                  type="number" value={customInput} min={minAmt} max={maxAmt} step={1000}
                  onChange={(e) => setCustomInput(Number(e.target.value))}
                  style={{ width: "100%", padding: "9px 14px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 15, fontWeight: 600, outline: "none" }}
                  placeholder={`Enter amount (${fmt(minAmt)} – ${fmt(maxAmt)})`}
                />
                {customInput < minAmt && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>Minimum participation is {fmt(minAmt)}</div>}
                {customInput > maxAmt && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>Maximum per lender is {fmt(maxAmt)}</div>}
              </div>
            )}
          </div>

          {/* Date inputs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>Your Participation Date</label>
              <input type="date" value={participationDate} onChange={(e) => setParticipationDate(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>First Payment Date</label>
              <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e5e7eb", borderRadius: 8, fontSize: 13 }} />
            </div>
          </div>

          {/* Results */}
          <div style={{ background: "#f0f1ff", borderRadius: 12, overflow: "hidden", border: "1.5px solid #c7d2fe" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #c7d2fe", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>First Payment <span style={{ color: "#9ca3af", fontWeight: 400 }}>({firstDays} days counted)</span></div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{firstDays} days × ₹{daily.toFixed(2)}/day</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#4f46e5" }}>{fmt(firstInterest)}</div>
            </div>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #c7d2fe", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>Monthly Interest <span style={{ color: "#9ca3af", fontWeight: 400 }}>(from 2nd month)</span></div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{fmt(amount)} × {rate}% = every month</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#4f46e5" }}>{fmt(monthly)}</div>
            </div>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #c7d2fe", background: "#f0fdf4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>Total Interest Earned</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>First + ({remainingPayments} × {fmt(monthly)})</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#059669" }}>{fmt(totalInterest)}</div>
            </div>
            <div style={{ padding: "18px 18px", background: "linear-gradient(135deg,#1a1a2e,#16213e)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, color: "#c7d2fe", fontWeight: 600 }}>Total Returns</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{fmt(amount)} principal + {fmt(totalInterest)} interest</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#f0a500" }}>{fmt(totalReturns)}</div>
            </div>
          </div>

          {/* Step-by-step calculation breakdown */}
          <div style={{ marginTop: 18, border: "1.5px solid #e0e7ff", borderRadius: 12, overflow: "hidden" }}>
            <button
              onClick={() => setShowCalcDetail(!showCalcDetail)}
              style={{ width: "100%", background: "#eef2ff", border: "none", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", fontWeight: 700, fontSize: 13, color: "#3730a3" }}
            >
              <span>📐 How is your First Payment calculated?</span>
              <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 400 }}>{showCalcDetail ? "▲ hide" : "▼ show"}</span>
            </button>
            {showCalcDetail && (
              <div style={{ padding: "18px 18px", background: "#fafafa" }}>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 16, lineHeight: 1.6, padding: "10px 14px", background: "#eff6ff", borderRadius: 8, borderLeft: "3px solid #3b82f6" }}>
                  OxyLoans uses the <strong style={{ color: "#1d4ed8" }}>30/360 day convention</strong> — each month is treated as 30 days, a full year as 360 days. This is the RBI-accepted standard for P2P lending. Your first EMI is <em>pro-rated</em> based on how many days you actually participated in that first partial month.
                </div>

                <CalcStep
                  n={1}
                  label="Cap each date's day at 30 (30/360 convention)"
                  val={<>
                    Participation: {fmtDateLabel(participationDate)} → Day <strong>{partDayCap}</strong><br/>
                    First payment: {fmtDateLabel(paymentDate)} → Day <strong>{emiDayCap}</strong>
                  </>}
                  note={partDayOrig > 30 || emiDayOrig > 30 ? "Any day past 30 is treated as 30 (e.g. the 31st counts as the 30th)" : "Days 1–30 are used as-is; there are no 31-day months in this system"}
                />

                <CalcStep
                  n={2}
                  label="Count gross days between the two dates"
                  val={<>
                    {yearDiff > 0 && <>{yearDiff} year(s) × 360 = {yearDiff * 360} days<br/></>}
                    {monthDiff > 0 && <>{monthDiff} month(s) × 30 = {monthDiff * 30} days<br/></>}
                    Day {emiDay} − Day {partDay} = {dayDiff} days<br/>
                    <strong>Total gross days = {rawDays}</strong>
                  </>}
                  note="Formula: (year difference × 360) + (month difference × 30) + (day difference)"
                />

                <CalcStep
                  n={3}
                  label="Subtract 2 days (standard P2P convention)"
                  val={<>{rawDays} − 2 = <strong>{firstDays} days counted</strong></>}
                  note="The participation day itself and the last day are excluded. This is standard practice across P2P lenders in India."
                />

                <CalcStep
                  n={4}
                  label="Calculate your daily interest rate"
                  val={<>
                    Monthly interest = {fmt(amount)} × {rate}% = ₹{firstMonthly.toFixed(2)}<br/>
                    Daily rate = ₹{firstMonthly.toFixed(2)} ÷ 30 = <strong>₹{daily.toFixed(4)}/day</strong>
                  </>}
                  note="One full month's interest divided by 30 gives the per-day rate"
                />

                <CalcStep
                  n={5}
                  label="Multiply counted days × daily rate = First Payment"
                  val={<>
                    {firstDays} days × ₹{daily.toFixed(4)}/day = ₹{(firstDays * daily).toFixed(2)}<br/>
                    <strong>≈ {fmt(firstInterest)} (rounded to nearest rupee)</strong>
                  </>}
                />

                <div style={{ background: "#ede9fe", borderRadius: 8, padding: "12px 14px", marginTop: 4, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#5b21b6", marginBottom: 4 }}>From 2nd month onwards — Full monthly interest</div>
                  <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>
                    {fmt(amount)} × {rate}% = <strong>{fmt(monthly)}/month</strong> every month (no pro-rating)<br/>
                    Principal (<strong>{fmt(amount)}</strong>) is returned along with the final interest in month {duration}.
                  </div>
                </div>

                <a
                  href={GUIDE_PDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#1a1a2e", color: "#f0a500", borderRadius: 8, textDecoration: "none", fontSize: 13, fontWeight: 700 }}
                >
                  📄 Read Full Guide — First Interest Payment Explained &nbsp;↗
                </a>
              </div>
            )}
          </div>

          {/* Payment schedule */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#4f46e5", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>Payment Schedule</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, borderRadius: 10, overflow: "hidden", border: "1.5px solid #e0e7ff" }}>
              <thead>
                <tr style={{ background: "#4f46e5" }}>
                  <th style={{ padding: "9px 12px", textAlign: "left", color: "#fff", fontWeight: 600 }}>Payment</th>
                  <th style={{ padding: "9px 12px", textAlign: "right", color: "#fff", fontWeight: 600 }}>Interest</th>
                  <th style={{ padding: "9px 12px", textAlign: "right", color: "#fff", fontWeight: 600 }}>Principal</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #e0e7ff", background: "#fff" }}>
                  <td style={{ padding: "8px 12px", color: "#374151" }}>1st payment <span style={{ color: "#9ca3af", fontSize: 11 }}>({firstDays} days)</span></td>
                  <td style={{ padding: "8px 12px", textAlign: "right", color: "#4f46e5", fontWeight: 600 }}>{fmt(firstInterest)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", color: "#9ca3af" }}>—</td>
                </tr>
                {Array.from({ length: Math.min(3, remainingPayments) }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #e0e7ff", background: i % 2 === 0 ? "#f5f3ff" : "#fff" }}>
                    <td style={{ padding: "8px 12px", color: "#374151" }}>Month {i + 2}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: "#4f46e5", fontWeight: 600 }}>{fmt(monthly)}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: "#9ca3af" }}>—</td>
                  </tr>
                ))}
                {remainingPayments > 3 && (
                  <tr style={{ borderBottom: "1px solid #e0e7ff", background: "#fff" }}>
                    <td colSpan={3} style={{ padding: "6px 12px", color: "#9ca3af", fontSize: 12, textAlign: "center" }}>
                      · · · {remainingPayments - 3} more monthly payments of {fmt(monthly)} · · ·
                    </td>
                  </tr>
                )}
                <tr style={{ background: "linear-gradient(90deg,#fef3c7,#fde68a)" }}>
                  <td style={{ padding: "9px 12px", color: "#92400e", fontWeight: 700 }}>Last month ({duration})</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", color: "#92400e", fontWeight: 700 }}>{fmt(monthly)}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", color: "#b45309", fontWeight: 700 }}>{fmt(amount)} ↩</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 14, fontSize: 11, color: "#9ca3af", lineHeight: 1.6 }}>
            * Calculations use 30/360 day convention. Actual payout dates follow the deal's fixed payment schedule. Returns are indicative; OxyLoans does not guarantee returns.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealReturnCalculator;
