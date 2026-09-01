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

const FirstMonthCalcBreakdown = ({ row }) => {
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

  if (!rawCalendarDays && !differenceInDaysForFirstParticipation) return null;

  const monthlyRate = rateOfInterest
    ? (rateOfInterest > 5 ? rateOfInterest / 12 : rateOfInterest)
    : null;
  const monthlyInterest = singleDayInterestAmount
    ? singleDayInterestAmount * 30
    : null;

  return (
    <div
      style={{
        background: "#f0f7ff",
        border: "1px solid #b8d4f0",
        borderRadius: 8,
        padding: "14px 18px",
        marginTop: 12,
        fontSize: 13,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 10, color: "#1a5f9e", fontSize: 14 }}>
        First Month Interest Calculation
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={labelStyle}>Participation Date</td>
            <td style={valStyle}>{fmtDate(participatedDate)}</td>
          </tr>
          <tr>
            <td style={labelStyle}>First EMI Date</td>
            <td style={valStyle}>{fmtDate(firstInterestDate)}</td>
          </tr>
          <tr>
            <td style={labelStyle}>Calendar Days (between dates)</td>
            <td style={valStyle}>{rawCalendarDays ?? differenceInDaysForFirstParticipation + 2}</td>
          </tr>
          <tr>
            <td style={labelStyle}>Less: Both dates excluded (−2)</td>
            <td style={{ ...valStyle, color: "#c0392b" }}>−2</td>
          </tr>
          <tr style={{ background: "#ddeeff" }}>
            <td style={{ ...labelStyle, fontWeight: 700 }}>Days for Calculation</td>
            <td style={{ ...valStyle, fontWeight: 700 }}>{differenceInDaysForFirstParticipation}</td>
          </tr>
          <tr>
            <td style={{ ...labelStyle, paddingTop: 10 }}>Principal Amount</td>
            <td style={{ ...valStyle, paddingTop: 10 }}>₹{fmt(firstParticipationAmount)}</td>
          </tr>
          {monthlyRate && (
            <tr>
              <td style={labelStyle}>
                Monthly ROI ({rateOfInterest > 5 ? `${rateOfInterest}% p.a. ÷ 12` : `${rateOfInterest}% monthly`})
              </td>
              <td style={valStyle}>{monthlyRate.toFixed(4)}%</td>
            </tr>
          )}
          {monthlyInterest != null && (
            <tr>
              <td style={labelStyle}>Monthly Interest (Principal × Monthly ROI)</td>
              <td style={valStyle}>₹{fmt(monthlyInterest)}</td>
            </tr>
          )}
          {singleDayInterestAmount != null && (
            <tr>
              <td style={labelStyle}>Daily Interest (Monthly ÷ 30)</td>
              <td style={valStyle}>₹{fmt(singleDayInterestAmount)}</td>
            </tr>
          )}
          <tr style={{ background: "#d4edda", borderTop: "2px solid #28a745" }}>
            <td style={{ ...labelStyle, fontWeight: 700 }}>
              First Month Interest ({differenceInDaysForFirstParticipation} days × ₹{fmt(singleDayInterestAmount)}/day)
            </td>
            <td style={{ ...valStyle, fontWeight: 700, color: "#155724" }}>
              ₹{fmt(firstParticipationInterest)}
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ marginTop: 8, color: "#666", fontSize: 11 }}>
        * All months treated as 30 days. Both participation date and EMI date are excluded from the count.
      </div>
    </div>
  );
};

const labelStyle = { padding: "5px 8px", color: "#555", width: "60%" };
const valStyle = { padding: "5px 8px", fontWeight: 500 };

const MyParticipateStatementTable = ({ data }) => {
  const [content, setContent] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showCalc, setShowCalc] = useState(false);
  const [firstRowData, setFirstRowData] = useState(null);

  const handleBreakupClick = (participationData) => {
    setContent(participationData);
    setIsCollapsed(false);
  };

  const newData = [];
  if (data?.data?.dealLevelLoanEmiCard) {
    data.data.dealLevelLoanEmiCard.forEach((dataItem, index) => {
      const isFirstRow = index === 0;

      if (isFirstRow && firstRowData === null) {
        setFirstRowData(dataItem);
      }

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
      <Table
        columns={columns}
        dataSource={newData}
        pagination={false}
        scroll={{ x: true }}
        sticky
      />
      {showCalc && firstItem && <FirstMonthCalcBreakdown row={firstItem} />}
      {!isCollapsed && expandedRowRender()}
    </div>
  );
};

export default MyParticipateStatementTable;
