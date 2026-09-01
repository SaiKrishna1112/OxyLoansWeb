import React, { useState } from "react";
import { Table } from "antd";
import "bootstrap/dist/css/bootstrap.min.css";

const fmt = (n) =>
  n != null ? Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

const fmtDate = (d) => {
  if (!d) return "—";
  // accepts yyyy-MM-dd or dd/MM/yyyy
  const parts = d.includes("-") ? d.split("-") : d.split("/").reverse();
  if (parts.length !== 3) return d;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const m = parseInt(parts[1], 10);
  return `${parts[2]} ${months[m - 1]} ${parts[0]}`;
};

const labelStyle = { padding: "5px 8px", color: "#555", width: "60%" };
const valStyle = { padding: "5px 8px", fontWeight: 500 };

const FirstMonthCalcBreakdown = ({ row, dealInfo }) => {
  const {
    participatedDate,
    firstInterestDate,
    rawCalendarDays,
    differenceInDaysForFirstParticipation,
    firstParticipationAmount,
    rateOfInterest,
    singleDayInterestAmount,
    firstParticipationInterest,
  } = row;

  // Prefer dealInfo fields (from deal card) as they're always populated; fall back to EMI row fields
  const principal = dealInfo?.paticipatedAmount ?? firstParticipationAmount;
  const roi = dealInfo?.rateOfInterest ?? rateOfInterest;
  const partDate = dealInfo?.registeredDate ?? participatedDate;
  const firstEmiDate = dealInfo?.firstInterestDate ?? firstInterestDate;
  const returnType = dealInfo?.lederReturnType || "";
  const isMonthly = !returnType || returnType === "MONTHLY";

  if (!differenceInDaysForFirstParticipation) return null;

  const monthlyRate = roi ? (roi > 5 ? roi / 12 : roi) : null;

  // Use backend value if available; otherwise compute from principal × monthly ROI / 30
  const computedDailyInterest =
    singleDayInterestAmount != null
      ? singleDayInterestAmount
      : principal && monthlyRate
      ? (principal * monthlyRate) / 100 / 30
      : null;
  const computedMonthlyInterest = computedDailyInterest != null ? computedDailyInterest * 30 : null;

  const effectiveDays = differenceInDaysForFirstParticipation;
  // For MONTHLY: show calendarDays / -2 rows. For YEARLY/QUARTERLY/HALFYEARLY: backend uses
  // its own convention (360-day year etc.), so -2 exclusion does not apply — show days directly.
  const calDays = isMonthly ? (rawCalendarDays ?? (effectiveDays + 2)) : null;

  const title = isMonthly ? "First Month Interest Calculation" : "Interest Calculation for Your Participation Period";
  const paymentDateLabel = isMonthly ? "First EMI Date" : "Payment / Maturity Date";
  const summaryLabel = isMonthly
    ? `Your First Month Interest (${effectiveDays} days × ₹${fmt(computedDailyInterest)}/day)`
    : `Your Interest for ${effectiveDays} days (₹${fmt(computedDailyInterest)}/day)`;
  const footnote = isMonthly
    ? "* All months treated as 30 days. Both participation date and first EMI date are excluded from day count."
    : "* Interest computed using 30-day month convention for the period from your participation date to deal maturity.";

  return (
    <div
      style={{
        background: "#f0f7ff",
        border: "1px solid #b8d4f0",
        borderRadius: 8,
        padding: "14px 18px",
        marginBottom: 12,
        fontSize: 13,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 10, color: "#1a5f9e", fontSize: 14 }}>
        {title}
        {dealInfo?.dealName && (
          <span style={{ fontWeight: 400, color: "#555", marginLeft: 8, fontSize: 12 }}>
            — {dealInfo.dealName}
          </span>
        )}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={labelStyle}>Participation Date</td>
            <td style={valStyle}>{fmtDate(partDate)}</td>
          </tr>
          <tr>
            <td style={labelStyle}>{paymentDateLabel}</td>
            <td style={valStyle}>{fmtDate(firstEmiDate)}</td>
          </tr>
          {isMonthly && calDays && (
            <>
              <tr>
                <td style={labelStyle}>Calendar Days (between dates)</td>
                <td style={valStyle}>{calDays}</td>
              </tr>
              <tr>
                <td style={labelStyle}>Less: Both dates excluded (−2)</td>
                <td style={{ ...valStyle, color: "#c0392b" }}>−2</td>
              </tr>
            </>
          )}
          <tr style={{ background: "#ddeeff" }}>
            <td style={{ ...labelStyle, fontWeight: 700 }}>Days for Calculation</td>
            <td style={{ ...valStyle, fontWeight: 700 }}>{effectiveDays}</td>
          </tr>
          <tr>
            <td style={{ ...labelStyle, paddingTop: 10 }}>Your Participation Amount</td>
            <td style={{ ...valStyle, paddingTop: 10 }}>₹{fmt(principal)}</td>
          </tr>
          {monthlyRate && (
            <tr>
              <td style={labelStyle}>
                Monthly ROI ({roi > 5 ? `${roi}% p.a. ÷ 12` : `${roi}% monthly`})
              </td>
              <td style={valStyle}>{monthlyRate.toFixed(4)}%</td>
            </tr>
          )}
          {computedMonthlyInterest != null && (
            <tr>
              <td style={labelStyle}>Monthly Interest (Amount × Monthly ROI)</td>
              <td style={valStyle}>₹{fmt(computedMonthlyInterest)}</td>
            </tr>
          )}
          {computedDailyInterest != null && (
            <tr>
              <td style={labelStyle}>Daily Interest (Monthly ÷ 30 days)</td>
              <td style={valStyle}>₹{fmt(computedDailyInterest)}</td>
            </tr>
          )}
          <tr style={{ background: "#d4edda", borderTop: "2px solid #28a745" }}>
            <td style={{ ...labelStyle, fontWeight: 700 }}>
              {summaryLabel}
            </td>
            <td style={{ ...valStyle, fontWeight: 700, color: "#155724" }}>
              ₹{fmt(firstParticipationInterest)}
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 8, color: "#666", fontSize: 11 }}>
        {footnote}
      </div>
    </div>
  );
};

const MyParticipateStatementTable = ({ data, dealInfo }) => {
  const [content, setContent] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showCalc, setShowCalc] = useState(false);

  const handleBreakupClick = (participationData) => {
    setContent(participationData);
    setIsCollapsed(false);
  };

  const newData = [];
  if (data?.data?.dealLevelLoanEmiCard) {
    data.data.dealLevelLoanEmiCard.forEach((dataItem, index) => {
      const isFirstRow = index === 0;

      newData.push({
        key: index,
        Sno: index + 1,
        ActualPaymentDate: dataItem.date,
        InterestPaidDate: dataItem.interestPaidDate || "Yet to be paid",
        InterestAmount: (
          <>
            ₹{dataItem.interestAmount?.toLocaleString("en-IN")}
            {isFirstRow && (
              <button
                className="btn btn-sm btn-outline-info ms-2"
                style={{ fontSize: 11 }}
                onClick={() => setShowCalc((v) => !v)}
              >
                {showCalc ? "Hide Calc" : "How calculated?"}
              </button>
            )}
            {isFirstRow && dataItem.listOfPaticipatedInfo && (
              <button
                className="btn btn-sm btn-outline-primary ms-1"
                style={{ fontSize: 11 }}
                onClick={() => handleBreakupClick(dataItem.listOfPaticipatedInfo)}
              >
                Breakup View
              </button>
            )}
          </>
        ),
        Noofdays: isFirstRow ? dataItem.differenceInDaysForFirstParticipation : 30,
        _raw: dataItem,
      });
    });
  }

  const columns = [
    { title: "S.No", dataIndex: "Sno", sorter: (a, b) => a.Sno - b.Sno, width: 60 },
    {
      title: "Scheduled Payment Date",
      dataIndex: "ActualPaymentDate",
      sorter: (a, b) => new Date(a.ActualPaymentDate) - new Date(b.ActualPaymentDate),
    },
    {
      title: "Interest Paid Date",
      dataIndex: "InterestPaidDate",
    },
    { title: "Interest Amount", dataIndex: "InterestAmount" },
    { title: "No of Days", dataIndex: "Noofdays", width: 90 },
  ];

  const expandedRowRender = () => {
    if (!content || content.length === 0) return null;
    const totalAmount = content.reduce((acc, item) => acc + (item.interestAmount || 0), 0);
    return (
      <div className="table-responsive mt-3">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Participation Date</th>
              <th>Amount</th>
              <th>Days</th>
              <th>ROI</th>
              <th>Interest Amount</th>
            </tr>
          </thead>
          <tbody>
            {content.map((item, index) => (
              <tr key={index}>
                <td>{item.upatedDate}</td>
                <td>₹{item.amount?.toLocaleString("en-IN")}</td>
                <td>{item.differenceInDays}</td>
                <td>{item.roi}%</td>
                <td>₹{item.interestAmount?.toLocaleString("en-IN")}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="4" className="text-end fw-bold">Total Amount</td>
              <td className="fw-bold">₹{totalAmount.toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const firstItem = data?.data?.dealLevelLoanEmiCard?.[0];

  return (
    <div style={{ maxHeight: "85vh", overflowY: "auto" }}>
      {showCalc && firstItem && <FirstMonthCalcBreakdown row={firstItem} dealInfo={dealInfo} />}
      <Table
        columns={columns}
        dataSource={newData}
        pagination={false}
        scroll={{ x: true }}
        sticky
      />
      {!isCollapsed && expandedRowRender()}
    </div>
  );
};

export default MyParticipateStatementTable;
