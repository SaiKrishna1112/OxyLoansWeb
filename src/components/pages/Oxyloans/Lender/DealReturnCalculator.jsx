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

const CalcStep = ({ n, label, val, note }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
    <div style={{ minWidth: 24, height: 24, borderRadius: "50%", background: "#2563eb", color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0 }}>{n}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#1e40af" }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginTop: 3, fontFamily: "monospace", lineHeight: 1.7, background: "#f1f5f9", padding: "6px 10px", borderRadius: 6 }}>{val}</div>
      {note && <div style={{ fontSize: 11, color: "#64748b", marginTop: 4, lineHeight: 1.4 }}>{note}</div>}
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
  const partDayCap = partDayOrig > 30 ? `min(${partDayOrig}, 30) = 30` : `${partDayOrig}`;
  const emiDayCap = emiDayOrig > 30 ? `min(${emiDayOrig}, 30) = 30` : `${emiDayOrig}`;

  const tabBtn = (id, label) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: "7px 16px", borderRadius: 8,
        border: activeTab === id ? "2px solid #2563eb" : "1.5px solid #e2e8f0",
        background: activeTab === id ? "#2563eb" : "#fff",
        color: activeTab === id ? "#fff" : "#374151",
        fontWeight: 600, fontSize: 13, cursor: "pointer",
      }}
    >{label}</button>
  );

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 580, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.22)" }}>

        {/* Header — white with blue top accent */}
        <div style={{ borderRadius: "16px 16px 0 0", borderTop: "5px solid #2563eb", padding: "18px 24px 16px", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #e2e8f0" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#2563eb", marginBottom: 4 }}>🧮 Return Calculator</div>
            <div style={{ color: "#0f172a", fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{deal.dealName}</div>
            <div style={{ color: "#64748b", fontSize: 12 }}>{rate}% / month &nbsp;·&nbsp; {duration} months tenure</div>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", color: "#374151", borderRadius: 8, width: 32, height: 32, fontSize: 18, cursor: "pointer", lineHeight: "32px", flexShrink: 0 }}>×</button>
        </div>

        <div style={{ padding: "18px 24px" }}>
          {/* Amount tabs */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.5 }}>Investment Amount</div>
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
                  style={{ width: "100%", padding: "9px 14px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 15, fontWeight: 600, outline: "none" }}
                  placeholder={`Enter amount (${fmt(minAmt)} – ${fmt(maxAmt)})`}
                />
                {customInput < minAmt && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>Minimum is {fmt(minAmt)}</div>}
                {customInput > maxAmt && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>Maximum per lender is {fmt(maxAmt)}</div>}
              </div>
            )}
          </div>

          {/* Date inputs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>Your Participation Date</label>
              <input type="date" value={participationDate} onChange={(e) => setParticipationDate(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13 }} />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 4 }}>First Payment Date</label>
              <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} style={{ width: "100%", padding: "8px 10px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13 }} />
            </div>
          </div>

          {/* Calculation breakdown — shown FIRST so it's immediately visible */}
          <div style={{ background: "#f8fafc", borderRadius: 12, border: "1.5px solid #dbeafe", padding: "16px 16px 12px", marginBottom: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1e40af", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
              📐 How your first payment is calculated (30/360 day convention)
            </div>

            <div style={{ fontSize: 12, color: "#475569", marginBottom: 14, lineHeight: 1.5, padding: "8px 12px", background: "#eff6ff", borderRadius: 8, borderLeft: "3px solid #3b82f6" }}>
              OxyLoans uses the <strong style={{ color: "#1d4ed8" }}>30/360 rule</strong> — every month = 30 days. Your first EMI covers only the days you actually participated before the first payment date.
            </div>

            <CalcStep
              n={1}
              label="Cap each date's day at 30"
              val={<>
                Join date {fmtDateLabel(participationDate)} → Day {partDayCap}<br/>
                First payment {fmtDateLabel(paymentDate)} → Day {emiDayCap}
              </>}
              note={partDayOrig > 30 || emiDayOrig > 30 ? "Days 31+ are treated as 30 in this system" : "Days 1–30 are used as-is"}
            />

            <CalcStep
              n={2}
              label="Count gross days (30/360 formula)"
              val={<>
                {yearDiff > 0 && <>{yearDiff} yr × 360 = {yearDiff * 360} days &nbsp;+&nbsp;</>}
                {monthDiff > 0 && <>{monthDiff} mo × 30 = {monthDiff * 30} days &nbsp;+&nbsp;</>}
                Day {emiDay} − Day {partDay} = {dayDiff} days<br/>
                <strong>Gross days = {rawDays}</strong>
              </>}
              note="(years × 360) + (months × 30) + (day difference)"
            />

            <CalcStep
              n={3}
              label="Subtract 2 days (first & last day excluded)"
              val={<>{rawDays} − 2 = <strong>{firstDays} days counted</strong></>}
              note="Standard P2P convention: your participation day and the payment day itself are not counted"
            />

            <CalcStep
              n={4}
              label="Daily interest rate"
              val={<>
                {fmt(amount)} × {rate}% = ₹{firstMonthly.toFixed(2)}/month<br/>
                ₹{firstMonthly.toFixed(2)} ÷ 30 = <strong>₹{daily.toFixed(4)}/day</strong>
              </>}
              note="Monthly interest divided by 30 = daily rate"
            />

            <CalcStep
              n={5}
              label="First payment = days × daily rate"
              val={<>
                {firstDays} × ₹{daily.toFixed(4)} = <strong style={{ color: "#1d4ed8", fontSize: 14 }}>{fmtExact(firstInterest)}</strong>
              </>}
            />

            {/* Rounding explanation */}
            <div style={{ background: "#fefce8", border: "1px solid #fde047", borderRadius: 8, padding: "10px 12px", marginTop: 4, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#713f12", marginBottom: 3 }}>💡 Why the first payment changes when you change your date</div>
              <div style={{ fontSize: 11, color: "#78350f", lineHeight: 1.5 }}>
                Each day difference = ₹{daily.toFixed(4)} more or less. We show the result to the paise (e.g. ₹{fmtExact(firstInterest).replace("₹","")} not ₹{Math.round(firstInterest)}) so you can see the effect clearly. For small investment amounts, rounding to the nearest rupee can make different dates look the same.
              </div>
            </div>

            <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#065f46", marginBottom: 2 }}>From 2nd month onwards — full monthly interest, no pro-rating</div>
              <div style={{ fontSize: 11, color: "#047857" }}>{fmt(amount)} × {rate}% = <strong>{fmt(monthly)}/month</strong> &nbsp;·&nbsp; Principal returned in month {duration}</div>
            </div>

            <a
              href={GUIDE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, padding: "8px 14px", background: "#2563eb", color: "#fff", borderRadius: 8, textDecoration: "none", fontSize: 12, fontWeight: 700 }}
            >
              📄 Complete First Interest Payment Guide &nbsp;↗
            </a>
          </div>

          {/* Results summary */}
          <div style={{ borderRadius: 12, overflow: "hidden", border: "1.5px solid #e2e8f0", marginBottom: 16 }}>
            <div style={{ padding: "4px 14px", background: "#2563eb" }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: "#bfdbfe", letterSpacing: 1, textTransform: "uppercase" }}>Your Returns Summary</span>
            </div>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>First Payment <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: 11 }}>({firstDays} days × ₹{daily.toFixed(2)}/day)</span></div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#2563eb" }}>{fmtExact(firstInterest)}</div>
            </div>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>Monthly Interest <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: 11 }}>(months 2–{duration})</span></div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#2563eb" }}>{fmt(monthly)}/mo</div>
            </div>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", background: "#f0fdf4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>Total Interest Earned</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#059669" }}>{fmtExact(totalInterest)}</div>
            </div>
            <div style={{ padding: "14px 16px", background: "linear-gradient(135deg,#1e40af,#2563eb)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, color: "#bfdbfe", fontWeight: 700 }}>Total Returns (Principal + Interest)</div>
                <div style={{ fontSize: 11, color: "#93c5fd", marginTop: 1 }}>{fmt(amount)} + {fmtExact(totalInterest)}</div>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#fbbf24" }}>{fmtExact(totalReturns)}</div>
            </div>
          </div>

          {/* Payment schedule */}
          <div style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 }}>Payment Schedule</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, borderRadius: 10, overflow: "hidden", border: "1.5px solid #e2e8f0" }}>
              <thead>
                <tr style={{ background: "#2563eb" }}>
                  <th style={{ padding: "9px 12px", textAlign: "left", color: "#fff", fontWeight: 600 }}>Payment</th>
                  <th style={{ padding: "9px 12px", textAlign: "right", color: "#fff", fontWeight: 600 }}>Interest</th>
                  <th style={{ padding: "9px 12px", textAlign: "right", color: "#fff", fontWeight: 600 }}>Principal</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px 12px", color: "#374151" }}>1st payment <span style={{ color: "#94a3b8", fontSize: 11 }}>({firstDays} days)</span></td>
                  <td style={{ padding: "8px 12px", textAlign: "right", color: "#2563eb", fontWeight: 600 }}>{fmtExact(firstInterest)}</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", color: "#94a3b8" }}>—</td>
                </tr>
                {Array.from({ length: Math.min(3, remainingPayments) }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                    <td style={{ padding: "8px 12px", color: "#374151" }}>Month {i + 2}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: "#2563eb", fontWeight: 600 }}>{fmt(monthly)}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", color: "#94a3b8" }}>—</td>
                  </tr>
                ))}
                {remainingPayments > 3 && (
                  <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td colSpan={3} style={{ padding: "6px 12px", color: "#94a3b8", fontSize: 12, textAlign: "center" }}>
                      · · · {remainingPayments - 3} more monthly payments of {fmt(monthly)} · · ·
                    </td>
                  </tr>
                )}
                <tr style={{ background: "linear-gradient(90deg,#fef3c7,#fde68a)" }}>
                  <td style={{ padding: "9px 12px", color: "#92400e", fontWeight: 700 }}>Month {duration} (last)</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", color: "#92400e", fontWeight: 700 }}>{fmt(monthly)}</td>
                  <td style={{ padding: "9px 12px", textAlign: "right", color: "#b45309", fontWeight: 700 }}>{fmt(amount)} ↩</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 12, fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
            * 30/360 day convention. Actual payout dates per deal schedule. Returns are indicative.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealReturnCalculator;
