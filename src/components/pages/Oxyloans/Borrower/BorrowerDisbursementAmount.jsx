import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Table } from "antd";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import {
  getDisbursementAmount,
  generateBorrowerAgreement1,
} from "../../../HttpRequest/afterlogin";

const BorrowerDisbursementAmount = () => {
  const [disbursementInfo, setDisbursementInfo] = useState({
    apiData: [],
    hasData: false,
    loading: true,
    errorMessage: "",
  });
  const [generatingInvoice, setGeneratingInvoice] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const getApiErrorMessage = (response) =>
      response?.response?.data?.errorMessage ||
      response?.response?.data?.message ||
      response?.data?.errorMessage ||
      response?.data?.message ||
      "We could not load disbursements. Please try again.";

    const fetchDisbursementAmount = async () => {
      try {
        const response = await getDisbursementAmount();
        if (response?.status == 200) {
          const data = Array.isArray(response.data) ? response.data : [];
          setDisbursementInfo({ apiData: data, hasData: data.length > 0, loading: false, errorMessage: "" });
          return;
        }
        setDisbursementInfo({ apiData: [], hasData: false, loading: false, errorMessage: getApiErrorMessage(response) });
      } catch (error) {
        setDisbursementInfo({ apiData: [], hasData: false, loading: false, errorMessage: getApiErrorMessage(error) });
      }
    };

    fetchDisbursementAmount();
  }, []);

  const dataSource = disbursementInfo.apiData.map((data, index) => ({
    key: data.id || `${data.borrowerId || "borrower"}-${index}`,
    id: data.id ?? null,
    serialNumber: index + 1,
    loanRequestId: data.loanRequestId ?? "-",
    borrowerId: data.borrowerId ?? "-",
    loanId: data.loanRequestId ?? null,
    createdAt: data.createdAt || "-",
    disbursedAmount: data.disbursedAmount ?? "-",
    processingFee:data.processingFee ?? "-",
    debitAmount: data.debitAmount ?? "-",
    borrowerStatus: data.borrowerStatus || "-",
    paymentStatus: data.paymentStatus,
    invoiceUrl: data.invoiceUrl,
    rawData: data,
  }));

  const totalDisbursedAmount = useMemo(() => {
    return disbursementInfo.apiData.reduce((sum, item) => {
      const value = Number(item?.disbursedAmount || 0);
      return sum + (Number.isNaN(value) ? 0 : value);
    }, 0);
  }, [disbursementInfo.apiData]);

  const disbursementSummary = useMemo(() => {
    return disbursementInfo.apiData.reduce(
      (summary, item) => {
        const borrowerStatus = String(item?.borrowerStatus || "").trim().toUpperCase();
        const paymentStatus = String(item?.paymentStatus || "").trim().toUpperCase();
        const debitAmount = Number(item?.debitAmount || 0);
        if (borrowerStatus === "PROCESSING") summary.processingCount += 1;
        if (borrowerStatus === "COMPLETED") summary.completedCount += 1;
        if (paymentStatus === "PAID") summary.paidCount += 1;
        summary.totalDebitAmount += Number.isNaN(debitAmount) ? 0 : debitAmount;
        return summary;
      },
      { processingCount: 0, completedCount: 0, paidCount: 0, totalDebitAmount: 0 },
    );
  }, [disbursementInfo.apiData]);

  const handleGenerateInvoice = async (row) => {
    const { rawData } = row;
    const borrowerId = rawData.borrowerId;
    const loanId = rawData.loanRequestId;
    const id = rawData.id;
    if (!borrowerId || !loanId || !id) return;
    setGeneratingInvoice((prev) => ({ ...prev, [row.key]: true }));
    try {
      const response = await generateBorrowerAgreement1({ borrowerId, loanId, id });
      if (response?.status === 200 && response?.data?.invoiceUrl) {
        window.open(response.data.invoiceUrl, "_blank");
      }
    } catch (error) {
      console.error("Failed to generate invoice:", error);
    } finally {
      setGeneratingInvoice((prev) => ({ ...prev, [row.key]: false }));
    }
  };

  const handleViewBreakup = (row) => {
    const borrowerId = Number(row.borrowerId);
    const loanId = row.loanId ? Number(row.loanId) : null;
    const id = Number(row.id);
    if (Number.isNaN(borrowerId) || Number.isNaN(id)) return;
    navigate(`/borrowerDisbursementInterestAmount/${borrowerId}/${loanId}/${id}`);
  };

  const columns = [
    {
      title: "Borrower ID",
      dataIndex: "borrowerId",
      align: "center",
    },
    {
      title: "Disbursed Amount",
      dataIndex: "disbursedAmount",
      align: "center",
      render: (value) => (value === "-" ? value : `₹ ${value}`),
    },
    {
      title: "Processing Fee",
      dataIndex: "processingFee",
      align: "center",
      render: (value) => (value === "-" ? value : `₹ ${value}`),
    },
    // {
    //   title: "Debit amount",
    //   dataIndex: "debitAmount",
    //   align: "center",
    //   render: (value) => (value === "-" ? value : `₹ ${value}`),
    // },
    {
      title: "Borrower Status",
      align: "center",
      dataIndex: "borrowerStatus",
      render: (value) => {
        const status = (value || "").toUpperCase();
        let badgeClass = "bg-secondary";
        if (status === "PROCESSING") badgeClass = "bg-warning text-dark";
        if (status === "COMPLETED") badgeClass = "bg-success";
        if (status === "FAILED" || status === "REJECTED")
          badgeClass = "bg-danger";
        return <span className={`badge ${badgeClass}`}>{value || "-"}</span>;
      },
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      align: "center",
      render: (value) => {
        if (!value || value === "-") return "-";
        const date = new Date(value.replace(" ", "T"));
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "2-digit",
        });
      },
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      align: "center",
      render: (value) => {
        const status = (value || "").toUpperCase();
        let badgeClass = "bg-secondary";
        if (status === "PAID") badgeClass = "bg-success";
        if (status === "PENDING") badgeClass = "bg-warning text-dark";
        if (status === "FAILED") badgeClass = "bg-danger";
        return <span className={`badge ${badgeClass}`}>{value || "-"}</span>;
      },
    },
    {
      title: "Interest Charges",
      dataIndex: "action",
      align: "center",
      render: (_, row) => (
        <Button
          type="default"
          size="small"
          onClick={() => handleViewBreakup(row)}
          disabled={row.borrowerId === "-" || !row.loanId}
          style={{
            backgroundColor: "#008cba",
            borderColor: "#008cba",
            color: "#fff",
            fontWeight: 600,
            borderRadius: "6px",
          }}
        >
          View Interest Charges
        </Button>
      ),
    },
    {
      title: "Loan Agreement",
      dataIndex: "invoice",
      align: "center",
      render: (_, row) => {
        const isPaid = row.paymentStatus === "Paid";
        return (
          <Button
            type="default"
            size="small"
            onClick={() => handleGenerateInvoice(row)}
            disabled={!isPaid || !!generatingInvoice[row.key]}
            loading={!!generatingInvoice[row.key]}
            style={{
              backgroundColor: isPaid ? "#28a745" : "#6c757d",
              borderColor: isPaid ? "#28a745" : "#6c757d",
              color: "#fff",
              fontWeight: 600,
              borderRadius: "6px",
              opacity: isPaid ? 1 : 0.6,
            }}
          >
            {generatingInvoice[row.key]
              ? "Generating..."
              : "Generate Loan Agreement"}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="main-wrapper">
      <BorrowerHeader />
      <BorrowerSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Loan Disbursements</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/borrowerDashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">Loan Disbursements</li>
                </ul>
              </div>
            </div>
            <span className="text-muted">Track your loan disbursements, payment status, and related charges.</span>
          </div>

          {/* Repayment Marquee */}
          <div className="mb-3" style={{ background: "#fdecea",  borderRadius: 6 }}>
            <marquee behavior="scroll" direction="left" scrollamount="2" style={{  color: "#7a1a1a", padding: "6px 0", fontSize: 12, fontWeight: 500, textAlign: "center"  }}>
              ⚠️&nbsp;&nbsp;<strong>Repayment Reminder:</strong>&nbsp; Loan repayment is scheduled for the <strong>5th of each month</strong>. Ensure timely payment to avoid additional charges.
            </marquee>
          </div>

          <div className="row mb-3">
            <div className="col-12 col-md-6 col-xl-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <p className="text-muted mb-1">Loan Amount Agreed to Be Disbursed</p>
                  <h4 className="mb-0">₹ {totalDisbursedAmount.toFixed(2)}</h4>
                </div>
              </div>
            </div>
            {/* <div className="col-12 col-md-6 col-xl-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <p className="text-muted mb-1">Processing disbursements</p>
                  <h4 className="mb-0">{disbursementSummary.processingCount}</h4>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <p className="text-muted mb-1">Completed disbursements</p>
                  <h4 className="mb-0">{disbursementSummary.completedCount}</h4>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-3 mb-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <p className="text-muted mb-1">Total debit amount</p>
                  <h4 className="mb-0">₹ {disbursementSummary.totalDebitAmount.toFixed(2)}</h4>
                </div>
              </div>
            </div> */}
          </div>

          <div className="row">
            <div className="col-sm-12">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="mb-3">
                    <h5 className="mb-1">Disbursement List</h5>
                    <span className="text-muted">View your loan disbursements and their key details.</span>
                  </div>
                  {disbursementInfo.errorMessage ? (
                    <div className="alert alert-danger" role="alert">
                      {disbursementInfo.errorMessage}
                    </div>
                  ) : null}
                  <Table
                    className="table-responsive table-responsive-md table-responsive-lg table-responsive-xs"
                    columns={columns}
                    dataSource={disbursementInfo.hasData ? dataSource : []}
                    loading={disbursementInfo.loading}
                    bordered
                    size="middle"
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    locale={{ emptyText: "No disbursements to display yet." }}
                    scroll={{ x: true }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowerDisbursementAmount;
