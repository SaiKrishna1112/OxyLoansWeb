import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table } from "antd";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import { getBorrowerRequestAmount,getBorrowerEligibleAmount } from "../../../HttpRequest/afterlogin";

const formatLoanRequestStatus = (status) => {
  const normalized = String(status || "").trim().toUpperCase();
  if (!normalized) return "-";

  const labels = {
    REQUEST: "Request submitted",
    PARTIALLYPROCESSING: "Partially processing",
    FULLYPROCESSING: "Fully processing",
    COMPLETED: "Completed",
    CLOSED: "Closed",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
  };

  return labels[normalized] || normalized.replace(/_/g, " ");
};

const BorrowerRequestAmount = () => {
  const navigate = useNavigate();
  const [requestAmountInfo, setRequestAmountInfo] = useState({
    apiData: [],
    hasData: false,
    loading: true,
    errorMessage: "",
  });
  const [eligibleAmount, setEligibleAmount] = useState(0);

  useEffect(() => {
    const getApiErrorMessage = (response) => {
      return (
        response?.response?.data?.errorMessage ||
        response?.response?.data?.message ||
        response?.data?.errorMessage ||
        response?.data?.message ||
        "We could not load your loan requests. Please try again."
      );
    };

    const fetchRequestAmount = async () => {
      try {
        const response = await getBorrowerRequestAmount();

        if (response?.status == 200) {
          const data = Array.isArray(response.data) ? response.data : [];
          setRequestAmountInfo({
            apiData: data,
            hasData: data.length > 0,
            loading: false,
            errorMessage: "",
          });
          return;
        }

        setRequestAmountInfo({
          apiData: [],
          hasData: false,
          loading: false,
          errorMessage: getApiErrorMessage(response),
        });
      } catch (error) {
        setRequestAmountInfo({
          apiData: [],
          hasData: false,
          loading: false,
          errorMessage: getApiErrorMessage(error),
        });
      }
    };

    const fetchEligibleAmount = async () => {
      try {
        const response = await getBorrowerEligibleAmount();
        if (response?.status == 200) {
          const amount = Number(response.data?.amount || 0);
          setEligibleAmount(amount);
          return;
        }
      } catch (error) {
        console.error("Error fetching eligible amount:", error);
      }
    };

    fetchRequestAmount();
    fetchEligibleAmount();
  }, []);

  const latestLoanRequest = useMemo(() => {
    if (
      !Array.isArray(requestAmountInfo.apiData) ||
      !requestAmountInfo.apiData.length
    ) {
      return null;
    }

    return [...requestAmountInfo.apiData].sort(
      (a, b) => Number(b?.id || 0) - Number(a?.id || 0),
    )[0];
  }, [requestAmountInfo.apiData]);

  const latestLoanRequestStatus = useMemo(() => {
    return String(latestLoanRequest?.loanRequestStatus || "")
      .trim()
      .toUpperCase();
  }, [latestLoanRequest]);

  const statusBanner = useMemo(() => {
    if (requestAmountInfo.loading) return null;
    if (!latestLoanRequestStatus) return null;

    if (latestLoanRequestStatus === "REQUEST") return null;

    if (latestLoanRequestStatus === "CLOSED") {
      return (
        <div className="alert alert-info d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
          <div>
            <div className="fw-semibold">Your previous request is closed</div>
            <div className="small">
              You can raise a new request by entering the amount again.
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/borrowerLoanRequestCreate")}
          >
            Raise New Request
          </button>
        </div>
      );
    }

    return (
      <div
      //  className="alert alert-light border d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3"
      >
        {/* <div>
          <div className="fw-semibold">Current status</div>
          <div className="small">
            {formatLoanRequestStatus(latestLoanRequestStatus)}
          </div>
        </div> */}
        {/* <button
          type="button"
          className="btn btn-outline-primary"
          onClick={() => navigate("/borrowerLoansInitiated")}
        >
          View Offers
        </button> */}
      </div>
    );
  }, [latestLoanRequestStatus, navigate, requestAmountInfo.loading]);

  const dataSource = requestAmountInfo.apiData.map((data, index) => ({
    key: data.id || index,
    serialNumber: index + 1,
    borrowerName: data.borrowerName || "-",
    borrowerId: data.borrowerId || "-",
    requestAmount: data.requestAmount ?? "-",
    loanRequestStatus: data.loanRequestStatus || "-",
    partiallyPendingAmount: data.partiallyPendingAmount ?? "-",
  }));

  const totalRequestedAmount = useMemo(() => {
    return requestAmountInfo.apiData.reduce((sum, item) => {
      const value = Number(item?.requestAmount || 0);
      return sum + (Number.isNaN(value) ? 0 : value);
    }, 0);
  }, [requestAmountInfo.apiData]);

  const requestSummary = useMemo(() => {
    return requestAmountInfo.apiData.reduce(
      (summary, item) => {
        const status = String(item?.loanRequestStatus || "")
          .trim()
          .toUpperCase();
        const requestAmount = Number(item?.requestAmount || 0);
        const pendingAmount = Number(item?.partiallyPendingAmount || 0);

        if (status === "PARTIALLYPROCESSING") {
          summary.partiallyProcessingCount += 1;
          summary.totalPendingAmount += Number.isNaN(pendingAmount)
            ? 0
            : pendingAmount;
        }

        if (status === "COMPLETED") {
          summary.completedCount += 1;
          summary.completedAmount += Number.isNaN(requestAmount)
            ? 0
            : requestAmount;
        }

        return summary;
      },
      {
        partiallyProcessingCount: 0,
        totalPendingAmount: 0,
        completedCount: 0,
        completedAmount: 0,
      },
    );
  }, [requestAmountInfo.apiData]);

  const columns = [
    // {
    //   title: "S.No",
    //   dataIndex: "serialNumber",
    // },
    {
      title: "Borrower Name",
      dataIndex: "borrowerName",
      align: "center",
    },
    {
      title: "Borrower ID",
      dataIndex: "borrowerId",
      align: "center",
    },
    {
      title: "Requested amount",
      dataIndex: "requestAmount",
      align: "center",
      render: (value) => (value === "-" ? value : `₹ ${value}`),
    },
    {
      title: "Pending amount",
      dataIndex: "partiallyPendingAmount",
      align: "center",
      render: (value) => (value === "-" ? value : `₹ ${value}`),
    },
    {
      title: "Status",
      dataIndex: "loanRequestStatus",
      align: "center",
      render: (value) => value,
    },
    {
      title: "Action",
      dataIndex: "action",
      align: "center",
      render: (value) => (
        <button
          type="button"
          className="btn btn-success"
          onClick={() => navigate("/borrowerLoansInitiated")}
        >
          View Lender Offers
        </button>
      ),
    },
  ];

  return (
    <>
      <div className="main-wrapper">
        <BorrowerHeader />
        <BorrowerSidebar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title">My Loan Requests </h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/borrowerDashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">My Loan Requests </li>
                  </ul>
                </div>
              </div>
              <span className="text-muted">View and track all your loan requests, check their status, and review offers from lenders. </span>
            </div>

            <div className="row mb-3">
              {/* <div className="col-12 col-md-6 col-xl-3 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <p className="text-muted mb-1">Total Loan Request Amount</p>
                    <h4 className="mb-0">
                      ₹ {totalRequestedAmount.toFixed(2)}
                    </h4>
                    <span className="text-muted small "> Eligible Loan Amount: ₹ {eligibleAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div> */}
              <div className="card border-0 shadow-sm h-100 rounded-4">
  <div className="card-body p-4">

    <p className="text-uppercase text-muted fw-semibold small mb-2">
      Total Loan Request
    </p>

    <h2 className="fw-bold text-dark mb-2">
      ₹ {totalRequestedAmount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      })}
    </h2>

    <div className="d-inline-flex align-items-center bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill mt-2">
      <i className="bi bi-check-circle-fill me-2"></i>
      <span className="fw-semibold text-white small">
        Eligible Amount:
      </span>
      <span className="ms-2 fw-bold text-white">
        ₹ {eligibleAmount.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
        })}
      </span>
    </div>

  </div>
</div>
              {/* <div className="col-12 col-md-6 col-xl-3 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <p className="text-muted mb-1">Partially processing</p>
                    <h4 className="mb-0">
                      {requestSummary.partiallyProcessingCount}
                    </h4>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6 col-xl-3 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <p className="text-muted mb-1">Total pending amount</p>
                    <h4 className="mb-0">
                      ₹ {requestSummary.totalPendingAmount.toFixed(2)}
                    </h4>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6 col-xl-3 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <p className="text-muted mb-1">Completed requests</p>
                    <h4 className="mb-0">{requestSummary.completedCount}</h4>
                  </div>
                </div>
              </div> */}
            </div>

            {statusBanner}

            <div className="row">
              <div className="col-sm-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    {/* <div className="d-flex align-items-center justify-content-end mb-3">
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => navigate("/borrowerLoansInitiated")}
                      >
                        View Lender Offers
                      </button>
                    </div> */}
                    {requestAmountInfo.errorMessage ? (
                      <div className="alert alert-danger" role="alert">
                        {requestAmountInfo.errorMessage}
                      </div>
                    ) : null}
                    <Table
                      className="table-responsive table-responsive-md table-responsive-lg table-responsive-xs"
                      columns={columns}
                      dataSource={requestAmountInfo.hasData ? dataSource : []}
                      loading={requestAmountInfo.loading}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: false,
                      }}
                      locale={{
                        emptyText: "No loan requests to display yet.",
                      }}
                      scroll={{ x: true }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BorrowerRequestAmount;
