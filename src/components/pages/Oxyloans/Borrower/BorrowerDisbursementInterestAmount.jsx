import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Table, Spin } from "antd";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import { showingInterestAmountToBorrower } from "../../../HttpRequest/afterlogin";

const feeRows = [
  { key: "platFormFeeIncludingGst", label: "Platform Fee (incl. GST)" },
  { key: "totalPenalty", label: "Total Penalty" },
  { key: "perDayPenalty", label: "Per Day Penalty" },
  { key: "emiBounceCharges", label: "EMI Bounce Charges" },
  { key: "technicalCharges", label: "Technical Charges" },
  { key: "recoveryCharges", label: "Recovery Charges" },
  { key: "extraInterestDays", label: "Extra Interest Days", isDay: true },
];

const BorrowerDisbursementInterestAmount = () => {
  const { borrowerId: bId, loanId: lId, id: rId } = useParams();
  const borrowerId = Number(bId);
  const loanId = lId !== "null" ? Number(lId) : null;
  const id = Number(rId);

  const [interestBreakup, setInterestBreakup] = useState({ loading: true, errorMessage: "", data: null });

  const fmt = (value) => {
    const n = Number(value);
    return Number.isNaN(n) ? "-" : `₹ ${n.toFixed(2)}`;
  };

  const fmtNum = (value, d = 2) => {
    const n = Number(value);
    return Number.isNaN(n) ? "-" : n.toFixed(d);
  };

  const fmtDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  };

  const getErr = (r) =>
    r?.response?.data?.errorMessage || r?.response?.data?.message ||
    r?.data?.errorMessage || r?.data?.message ||
    "We could not load charges breakup. Please try again.";

  useEffect(() => {
    if (Number.isNaN(borrowerId) || Number.isNaN(id)) {
      setInterestBreakup({ loading: false, errorMessage: "Missing details. Please go back and try again.", data: null });
      return;
    }
    const load = async () => {
      try {
        const res = await showingInterestAmountToBorrower({ borrowerId, loanId, id });
        if (res?.status == 200) {
          const raw = res.data;
          setInterestBreakup({ loading: false, errorMessage: "", data: Array.isArray(raw) ? raw[0] || null : raw });
        } else {
          setInterestBreakup({ loading: false, errorMessage: getErr(res), data: null });
        }
      } catch (e) {
        setInterestBreakup({ loading: false, errorMessage: getErr(e), data: null });
      }
    };
    load();
  }, [borrowerId, loanId, id]);

  const tableColumns = [
    {
      title: "Lender Name",
      dataIndex: "lenderName",
      align: "center",
      render: (v) => <span style={{ fontWeight: 600 }}>{v || "-"}</span>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      align: "center",
      render: (_, row) => fmt(row.amount ?? row.lenderAmount),
    },
    {
      title: "Interest Amount",
      dataIndex: "interestAmount",
      align: "center",
      render: (v) => fmt(v),
    },
    // { title: "Extra Interest", dataIndex: "extraInterestAmount", align: "center", render: (v) => fmt(v) },
    {
      title: "Days",
      dataIndex: "days",
      align: "center",
      render: (v) => v ?? "-",
    },
    {
      title: "Per Day Interest",
      dataIndex: "perDayInterest",
      align: "center",
      render: (v) => fmtNum(v, 4),
    },
    {
      title: "ROI (%)",
      dataIndex: "roi",
      align: "center",
      render: (v) => `${fmtNum(v, 2)}%`,
    },
    {
      title: "Loan Taken Date",
      dataIndex: "borrowerLoanTakenDate",
      align: "center",
      render: (v) => fmtDate(v),
    },
    {
      title: "Payment Date",
      dataIndex: "borrowerPaymentDate",
      align: "center",
      render: (v) => fmtDate(v),
    },
  ];

  const tableData = useMemo(() => {
    if (!Array.isArray(interestBreakup.data?.list)) return [];
    return interestBreakup.data.list.map((item, i) => ({ ...item, key: `${item.loanId || "loan"}-${i}` }));
  }, [interestBreakup.data]);

  const renderContent = () => {
    if (interestBreakup.loading)
      return (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <Spin size="large" />
          <p style={{ color: "#64748b", marginTop: 12 }}>Loading charges...</p>
        </div>
      );

    if (interestBreakup.errorMessage)
      return <div className="alert alert-danger">Interest details are unavailable as the loan disbursement has not been completed.</div>;

    if (!interestBreakup.data)
      return <p className="text-muted mb-0">No breakup data available for this disbursement.</p>;

    const { data } = interestBreakup;

    return (
      <>
        {/* Header */}
        <div
          style={{
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: 10,
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 13, color: "#64748b" }}>
            Borrower ID: <strong>{borrowerId}</strong> &nbsp;|&nbsp; Loan ID:{" "}
            <strong>{loanId}</strong>
          </div>
        </div>

        {/* Fee Breakdown */}
        <div style={{ border: "1px solid #e2e8f0", marginBottom: 16 }}>
          <div
            style={{
              padding: "8px 14px",
              borderBottom: "1px solid #e2e8f0",
              background: "#f8fafc",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>
              Charges Breakdown
            </span>
            <br/>
            <p style={{   color: "#1e293b" }}>
              Review all applicable charges, including platform fees, penalties,
              and interest
            </p>
          </div>
          {feeRows.map(({ key, label, isDay }, idx) => {
            const raw = data[key];
            const value = isDay ? `${raw ?? 0} days` : fmt(raw);
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 14px",
                  borderBottom:
                    idx < feeRows.length - 1 ? "1px solid #f1f5f9" : "none",
                }}
              >
                <span style={{ fontSize: 13, color: "#334155" }}>{label}</span>
                <span
                  style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}
                >
                  {value}
                </span>
              </div>
            );
          })}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              borderTop: "2px solid #e2e8f0",
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
              Grand Total
            </span>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#1e293b" }}>
              {fmt(data.grandTotal)}
            </span>
          </div>
        </div>

        {/* Lender Table */}
        <div style={{ border: "1px solid #e2e8f0" }}>
          <div
            style={{
              padding: "8px 14px",
              borderBottom: "1px solid #e2e8f0",
              background: "#f8fafc",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>
              Lender-wise Interest Details
            </span>{" "}<br/>
            <p style={{  color: "#1e293b" }}>
              View interest calculations for each lender based on amount,
              duration, and rate.
            </p>
          </div>
          <Table
            columns={tableColumns}
            dataSource={tableData}
            bordered={false}
            size="small"
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll={{ x: true }}
            locale={{ emptyText: "No lender breakup found." }}
            style={{ borderRadius: 0 }}
          />
        </div>
      </>
    );
  };

  return (
    <div className="main-wrapper">
      <BorrowerHeader />
      <BorrowerSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Interest Charges</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/borrowerDashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link to="/borrowerDisbursementAmount">Disbursements</Link>
                  </li>
                  <li className="breadcrumb-item active">Interest Charges</li>
                </ul>
              </div>
              <p className="">View a detailed breakdown of interest, fees, and charges applied to your loan. </p>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  {renderContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowerDisbursementInterestAmount;
