import React, { useState } from "react";
import { Table, Tag } from "antd";
import "bootstrap/dist/css/bootstrap.min.css";

const fmt = (n) =>
  n != null ? Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

const fmtDate = (d) => {
  if (!d) return "—";
  const dateOnly = d.split(" ")[0];
  const parts = dateOnly.includes("-") ? dateOnly.split("-") : dateOnly.split("/");
  if (parts.length !== 3) return d;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  // Auto-detect: YYYY-MM-DD (parts[0].length===4) vs DD-MM-YYYY (parts[2].length===4)
  const [day, month, year] = parts[0].length === 4
    ? [parts[2], parts[1], parts[0]]
    : [parts[0], parts[1], parts[2]];
  const m = parseInt(month, 10);
  return `${day} ${months[m - 1]} ${year}`;
};

// Parse "DD-MM-YYYY HH:mm:ss" or "DD/MM/YYYY" into a Date object (keeps time)
const parseDateTime = (s) => {
  if (!s) return null;
  const dtMatch = s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})\s*(\d{2}:\d{2}:\d{2})?/);
  if (dtMatch) {
    const [, d, m, y, time] = dtMatch;
    return new Date(`${y}-${m}-${d}T${time || "00:00:00"}`);
  }
  return null;
};

// Format "DD-MM-YYYY HH:mm:ss" → "01 Apr 2026, 02:05 AM"
const fmtDateTime = (s) => {
  if (!s) return "—";
  const dt = parseDateTime(s);
  if (!dt || isNaN(dt)) return s;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const h = dt.getHours(), min = dt.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${String(dt.getDate()).padStart(2,"0")} ${months[dt.getMonth()]} ${dt.getFullYear()}, ${String(h12).padStart(2,"0")}:${String(min).padStart(2,"0")} ${ampm}`;
};

// Human-readable time difference: "3 days", "2 hours 15 minutes", "within minutes"
const timeDiff = (from, to) => {
  if (!from || !to) return null;
  const ms = to - from;
  if (ms < 0) return null;
  const mins = Math.floor(ms / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days >= 1) return `${days} day${days > 1 ? "s" : ""}`;
  if (hours >= 1) return `${hours} hour${hours > 1 ? "s" : ""} ${mins % 60 > 0 ? `${mins % 60} min` : ""}`.trim();
  if (mins >= 1) return `${mins} minute${mins > 1 ? "s" : ""}`;
  return "within minutes";
};

const StatTile = ({ label, value, sub, color }) => (
  <div style={{
    background: "#fff",
    border: `1.5px solid ${color || "#e0e0e0"}`,
    borderRadius: 10,
    padding: "12px 16px",
    flex: 1,
    minWidth: 120,
  }}>
    <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 700, color: color || "#222" }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{sub}</div>}
  </div>
);

const FirstMonthCalcBreakdown = ({ row, dealInfo }) => {
  const {
    differenceInDaysForFirstParticipation,
    firstParticipationAmount,
    rateOfInterest,
    singleDayInterestAmount,
    firstParticipationInterest,
    rawCalendarDays,
  } = row;

  const principal = dealInfo?.paticipatedAmount ?? firstParticipationAmount;
  const roi = dealInfo?.rateOfInterest ?? rateOfInterest;
  const partDate = dealInfo?.firstParticipationDate ?? dealInfo?.registeredDate;
  const firstEmiDate = dealInfo?.firstInterestDate;
  const returnType = dealInfo?.lederReturnType || "";
  const isMonthly = !returnType || returnType === "MONTHLY";

  if (!differenceInDaysForFirstParticipation) return null;

  const monthlyRate = roi ? (roi > 5 ? roi / 12 : roi) : null;
  const computedDailyInterest =
    singleDayInterestAmount != null
      ? singleDayInterestAmount
      : principal && monthlyRate
      ? (principal * monthlyRate) / 100 / 30
      : null;
  const computedMonthlyInterest = computedDailyInterest != null ? computedDailyInterest * 30 : null;
  const effectiveDays = differenceInDaysForFirstParticipation;
  const calDays = isMonthly ? (rawCalendarDays ?? (effectiveDays + 2)) : null;

  return (
    <div style={{
      background: "#f0f7ff",
      border: "1px solid #b8d4f0",
      borderRadius: 8,
      padding: "14px 18px",
      marginBottom: 12,
      fontSize: 13,
    }}>
      <div style={{ fontWeight: 600, marginBottom: 10, color: "#1a5f9e", fontSize: 13 }}>
        {isMonthly ? "First Month Interest Calculation" : "Interest Calculation for Your Participation Period"}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {partDate && (
            <tr>
              <td style={{ padding: "4px 8px", color: "#555", width: "60%" }}>Participation Date</td>
              <td style={{ padding: "4px 8px", fontWeight: 500 }}>{fmtDate(partDate)}</td>
            </tr>
          )}
          {firstEmiDate && (
            <tr>
              <td style={{ padding: "4px 8px", color: "#555" }}>{isMonthly ? "First EMI Date" : "Payment / Maturity Date"}</td>
              <td style={{ padding: "4px 8px", fontWeight: 500 }}>{fmtDate(firstEmiDate)}</td>
            </tr>
          )}
          {isMonthly && calDays && (
            <>
              <tr>
                <td style={{ padding: "4px 8px", color: "#555" }}>Days between dates</td>
                <td style={{ padding: "4px 8px", fontWeight: 500 }}>{calDays}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 8px", color: "#555" }}>Less: Both dates excluded (−2)</td>
                <td style={{ padding: "4px 8px", fontWeight: 500, color: "#c0392b" }}>−2</td>
              </tr>
            </>
          )}
          <tr style={{ background: "#ddeeff" }}>
            <td style={{ padding: "4px 8px", fontWeight: 700 }}>Days for Calculation</td>
            <td style={{ padding: "4px 8px", fontWeight: 700 }}>{effectiveDays}</td>
          </tr>
          <tr>
            <td style={{ padding: "4px 8px", paddingTop: 8, color: "#555" }}>Participation Amount</td>
            <td style={{ padding: "4px 8px", paddingTop: 8, fontWeight: 500 }}>₹{fmt(principal)}</td>
          </tr>
          {monthlyRate && (
            <tr>
              <td style={{ padding: "4px 8px", color: "#555" }}>Monthly ROI ({roi > 5 ? `${roi}% p.a. ÷ 12` : `${roi}% monthly`})</td>
              <td style={{ padding: "4px 8px", fontWeight: 500 }}>{monthlyRate.toFixed(4)}%</td>
            </tr>
          )}
          {computedMonthlyInterest != null && (
            <tr>
              <td style={{ padding: "4px 8px", color: "#555" }}>Monthly Interest</td>
              <td style={{ padding: "4px 8px", fontWeight: 500 }}>₹{fmt(computedMonthlyInterest)}</td>
            </tr>
          )}
          {computedDailyInterest != null && (
            <tr>
              <td style={{ padding: "4px 8px", color: "#555" }}>Daily Interest (÷ 30)</td>
              <td style={{ padding: "4px 8px", fontWeight: 500 }}>₹{fmt(computedDailyInterest)}</td>
            </tr>
          )}
          <tr style={{ background: "#d4edda", borderTop: "2px solid #28a745" }}>
            <td style={{ padding: "6px 8px", fontWeight: 700 }}>
              {isMonthly
                ? `First Month Interest (${effectiveDays} days × ₹${fmt(computedDailyInterest)}/day)`
                : `Interest for ${effectiveDays} days`}
            </td>
            <td style={{ padding: "6px 8px", fontWeight: 700, color: "#155724" }}>₹{fmt(firstParticipationInterest)}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 6, color: "#888", fontSize: 11 }}>
        * Every month is treated as 30 days. Both participation date and first EMI date are excluded from the count.
      </div>
    </div>
  );
};

const DealSummaryCard = ({ dealInfo, apiData }) => {
  const dealOpenDate = apiData?.dealOpenDate;
  const dealStartDate = apiData?.dealStartDate;
  const dealName = apiData?.dealName || dealInfo?.dealName;
  const returnType = dealInfo?.lederReturnType || "";
  const roi = dealInfo?.rateOfInterest;
  const amount = dealInfo?.paticipatedAmount;
  const duration = apiData?.duration;
  // Use IST participation datetime from statement API (accurate); fall back to list API value
  const firstPartDate = apiData?.firstParticipationDatetime || dealInfo?.firstParticipationDate;
  const lastPartDate = dealInfo?.lastParticipationDate;

  // "You participated X after deal opened" — both times now in IST from backend
  const dealOpenDt = parseDateTime(dealOpenDate);
  const partDt = parseDateTime(firstPartDate);
  const diff = timeDiff(dealOpenDt, partDt);

  const typeColors = {
    MONTHLY: { bg: "#e8f4fd", color: "#1a5f9e", label: "Monthly" },
    YEARLY: { bg: "#fef9e7", color: "#b7950b", label: "Yearly" },
    QUARTERLY: { bg: "#e8f8f5", color: "#1a8a6f", label: "Quarterly" },
    HALFYEARLY: { bg: "#fdf2f8", color: "#884ea0", label: "Half-Yearly" },
  };
  const typeStyle = typeColors[returnType] || { bg: "#f2f3f4", color: "#555", label: returnType };

  const displayRoi = returnType === "YEARLY"
    ? `${(roi * 12).toFixed(2)}% p.a.`
    : returnType === "QUARTERLY"
    ? `${(roi * 3).toFixed(2)}% p.q.`
    : returnType === "HALFYEARLY"
    ? `${(roi * 6).toFixed(2)}% p.h.`
    : `${roi?.toFixed(2) || "—"}% p.m.`;

  return (
    <div style={{
      background: "linear-gradient(135deg, #1a3a5c 0%, #2471a3 100%)",
      borderRadius: 12,
      padding: "18px 20px",
      color: "#fff",
      marginBottom: 14,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{dealName || "Deal Statement"}</div>
          <span style={{
            background: typeStyle.bg,
            color: typeStyle.color,
            borderRadius: 20,
            padding: "2px 10px",
            fontSize: 11,
            fontWeight: 600,
          }}>{typeStyle.label}</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>₹{amount ? Number(amount).toLocaleString("en-IN") : "—"}</div>
          <div style={{ fontSize: 11, opacity: 0.8 }}>Your Participation</div>
        </div>
      </div>

      {/* Date grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "8px 16px",
        background: "rgba(255,255,255,0.1)",
        borderRadius: 8,
        padding: "10px 14px",
        marginBottom: 10,
        fontSize: 12,
      }}>
        {dealOpenDate && (
          <div>
            <div style={{ opacity: 0.7 }}>Deal Opened</div>
            <div style={{ fontWeight: 600 }}>{fmtDateTime(dealOpenDate)}</div>
          </div>
        )}
        {dealStartDate && (
          <div>
            <div style={{ opacity: 0.7 }}>First Payment Date</div>
            <div style={{ fontWeight: 600 }}>{fmtDate(dealStartDate)}</div>
          </div>
        )}
        {firstPartDate && (
          <div>
            <div style={{ opacity: 0.7 }}>Your Participation</div>
            <div style={{ fontWeight: 600 }}>{fmtDateTime(firstPartDate)}</div>
          </div>
        )}
        {(duration > 0) && (
          <div>
            <div style={{ opacity: 0.7 }}>Duration</div>
            <div style={{ fontWeight: 600 }}>{duration} months · {displayRoi}</div>
          </div>
        )}
      </div>

      {/* Participation timing message */}
      {diff && (
        <div style={{
          background: "rgba(255,255,255,0.15)",
          borderRadius: 6,
          padding: "6px 12px",
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          <span>⚡</span>
          <span>
            You participated <strong>{diff}</strong> after this deal opened
            {lastPartDate && lastPartDate !== firstPartDate && (
              <> · Last top-up: <strong>{lastPartDate}</strong></>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

const MyParticipateStatementTable = ({ data, dealInfo }) => {
  const [breakupRows, setBreakupRows] = useState([]);
  const [showBreakup, setShowBreakup] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  const apiData = data?.data;
  const emiCard = apiData?.dealLevelLoanEmiCard || [];

  // Financial summary
  const totalInterest = emiCard.reduce((s, r) => s + (r.interestAmount || 0), 0);
  const paidInterest = emiCard.filter(r => r.interestPaidDate).reduce((s, r) => s + (r.interestAmount || 0), 0);
  const paidCount = emiCard.filter(r => r.interestPaidDate).length;
  const totalCount = emiCard.length;

  const newData = emiCard.map((dataItem, index) => {
    const isPaid = !!dataItem.interestPaidDate;
    const isFirst = index === 0;
    return {
      key: index,
      sno: index + 1,
      scheduledDate: fmtDate(dataItem.date),
      paidDate: isPaid ? fmtDate(dataItem.interestPaidDate) : null,
      status: isPaid ? "paid" : "upcoming",
      interestAmount: dataItem.interestAmount,
      days: isFirst ? dataItem.differenceInDaysForFirstParticipation : 30,
      _raw: dataItem,
      isFirst,
    };
  });

  const columns = [
    {
      title: "#",
      dataIndex: "sno",
      width: 45,
      render: (v) => <span style={{ color: "#888", fontSize: 12 }}>{v}</span>,
    },
    {
      title: "Scheduled Date",
      dataIndex: "scheduledDate",
      render: (v) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: "Paid On",
      dataIndex: "paidDate",
      render: (v) => v ? <span style={{ color: "#27ae60", fontWeight: 500 }}>{v}</span> : <span style={{ color: "#aaa" }}>Pending</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 90,
      render: (v) => v === "paid"
        ? <Tag color="success" style={{ borderRadius: 20, fontSize: 11 }}>Paid</Tag>
        : <Tag color="processing" style={{ borderRadius: 20, fontSize: 11 }}>Upcoming</Tag>,
    },
    {
      title: "Interest (₹)",
      dataIndex: "interestAmount",
      render: (v, rec) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600 }}>₹{Number(v || 0).toLocaleString("en-IN")}</span>
          {rec.isFirst && (
            <button
              className="btn btn-sm btn-outline-info"
              style={{ fontSize: 10, padding: "1px 6px" }}
              onClick={() => setShowCalc(p => !p)}
            >
              {showCalc ? "Hide" : "How?"}
            </button>
          )}
          {rec.isFirst && rec._raw.listOfPaticipatedInfo && (
            <button
              className="btn btn-sm btn-outline-primary"
              style={{ fontSize: 10, padding: "1px 6px" }}
              onClick={() => { setBreakupRows(rec._raw.listOfPaticipatedInfo); setShowBreakup(p => !p); }}
            >
              {showBreakup ? "Hide Breakup" : "Breakup"}
            </button>
          )}
        </div>
      ),
    },
  ];

  const firstItem = emiCard[0];

  return (
    <div style={{ maxHeight: "90vh", overflowY: "auto", padding: "4px 2px" }}>

      {/* Deal summary card */}
      <DealSummaryCard dealInfo={dealInfo} apiData={apiData} />

      {/* Financial snapshot tiles */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <StatTile
          label="Your Principal"
          value={`₹${Number(dealInfo?.paticipatedAmount || 0).toLocaleString("en-IN")}`}
          color="#2471a3"
        />
        <StatTile
          label="Interest Paid"
          value={`₹${Math.round(paidInterest).toLocaleString("en-IN")}`}
          sub={`${paidCount} of ${totalCount} EMIs`}
          color="#27ae60"
        />
        <StatTile
          label="Total Expected"
          value={`₹${Math.round(totalInterest).toLocaleString("en-IN")}`}
          sub="full term"
          color="#8e44ad"
        />
      </div>

      {/* First month calc */}
      {showCalc && firstItem && <FirstMonthCalcBreakdown row={firstItem} dealInfo={dealInfo} />}

      {/* Breakup view */}
      {showBreakup && breakupRows.length > 0 && (
        <div style={{ background: "#f9f9f9", border: "1px solid #e0e0e0", borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 13, color: "#333" }}>First Month Breakup (All Participations)</div>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                {["Date", "Amount (₹)", "Days", "ROI", "Interest (₹)"].map(h => (
                  <th key={h} style={{ padding: "6px 10px", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #ddd" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {breakupRows.map((item, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "6px 10px" }}>{item.upatedDate || "—"}</td>
                  <td style={{ padding: "6px 10px" }}>₹{Number(item.amount || 0).toLocaleString("en-IN")}</td>
                  <td style={{ padding: "6px 10px" }}>{item.differenceInDays}</td>
                  <td style={{ padding: "6px 10px" }}>{item.roi ? `${item.roi}%` : "—"}</td>
                  <td style={{ padding: "6px 10px", fontWeight: 600 }}>₹{Math.round(item.interestAmount || 0).toLocaleString("en-IN")}</td>
                </tr>
              ))}
              <tr style={{ background: "#f0f7ff", fontWeight: 700 }}>
                <td colSpan={4} style={{ padding: "6px 10px", textAlign: "right" }}>Total</td>
                <td style={{ padding: "6px 10px" }}>₹{Math.round(breakupRows.reduce((s, r) => s + (r.interestAmount || 0), 0)).toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* EMI schedule table */}
      <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #e8e8e8" }}>
        <Table
          columns={columns}
          dataSource={newData}
          pagination={false}
          scroll={{ x: true }}
          size="small"
          rowClassName={(rec) => rec.status === "paid" ? "row-paid" : "row-upcoming"}
          rowStyle={(rec) => rec.status === "paid" ? { background: "#f0fff4" } : {}}
        />
      </div>

      <style>{`
        .row-paid td { background: #f0fff4 !important; }
        .row-upcoming td { background: #fff !important; }
      `}</style>
    </div>
  );
};

export default MyParticipateStatementTable;
