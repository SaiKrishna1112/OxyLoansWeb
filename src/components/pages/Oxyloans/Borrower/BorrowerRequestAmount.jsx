import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Table } from "antd";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import { getBorrowerRequestAmount } from "../../../HttpRequest/afterlogin";

const BorrowerRequestAmount = () => {
  const [requestAmountInfo, setRequestAmountInfo] = useState({
    apiData: [],
    hasData: false,
    loading: true,
    errorMessage: "",
  });

  useEffect(() => {
    const getApiErrorMessage = (response) => {
      return (
        response?.response?.data?.errorMessage ||
        response?.response?.data?.message ||
        response?.data?.errorMessage ||
        response?.data?.message ||
        "We could not load your funding requests. Please try again."
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

    fetchRequestAmount();
  }, []);

  const formatLoanRequestStatus = (value) => {
    if (!value) return "-";
    const normalized = String(value).trim().toUpperCase();
    if (normalized === "PARTIALLYPROCESSING") return "Partially Processing";
    if (normalized === "PROCESSING") return "Processing";
    if (normalized === "COMPLETED") return "Completed";
    if (normalized === "PENDING") return "Pending";
    if (normalized === "REJECTED") return "Rejected";
    return value;
  };

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
      render: (value) => formatLoanRequestStatus(value),
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
                  <h3 className="page-title">Funding Request</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/borrowerDashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Funding Request</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-12 col-md-6 col-xl-3 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <p className="text-muted mb-1">Total requested amount</p>
                    <h4 className="mb-0">
                      ₹ {totalRequestedAmount.toFixed(2)}
                    </h4>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6 col-xl-3 mb-3">
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
              </div>
            </div>

            <div className="row">
              <div className="col-sm-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
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
                        emptyText: "No funding requests to display yet.",
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
