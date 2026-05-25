import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Table } from "antd";
import Swal from "sweetalert2";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import {
  HandleWithFooter,
  WarningBackendApi,
} from "../../Base UI Elements/SweetAlert";
import {
  borrowerLoanAcceptOrReject,
  borrowerLoanExcute,
  getListOfBorrowerLoansInitiated,
} from "../../../HttpRequest/afterlogin";

const BorrowerLoansInitiated = () => {
  const [loanInitiatedInfo, setLoanInitiatedInfo] = useState({
    apiData: [],
    hasData: false,
    loading: true,
    errorMessage: "",
  });
  const [updatingRowId, setUpdatingRowId] = useState(null);
  const [executingRowId, setExecutingRowId] = useState(null);

  const normalizeStatus = (status) =>
    String(status || "")
      .trim()
      .toUpperCase();

  const isAcceptedStatus = (status) => {
    const normalizedStatus = normalizeStatus(status);
    return (
      normalizedStatus === "LOANACCEPTED" ||
      normalizedStatus === "ACCEPTED" ||
      normalizedStatus === "APPROVED"
    );
  };

  const isAcceptedOrProcessingStatus = (status) => {
    const normalizedStatus = normalizeStatus(status);
    return (
      isAcceptedStatus(normalizedStatus) ||
      normalizedStatus === "PROCESSING" ||
      normalizedStatus === "IN_PROGRESS"
    );
  };

  const isOpenForRejectStatus = (status) => {
    const normalizedStatus = normalizeStatus(status);
    return (
      normalizedStatus === "INITIATED" ||
      normalizedStatus === "PENDING" ||
      normalizedStatus === "PROCESSING" ||
      normalizedStatus === "IN_PROGRESS" ||
      isAcceptedStatus(normalizedStatus)
    );
  };

  const isRejectedStatus = (status) => {
    const normalizedStatus = normalizeStatus(status);
    return (
      normalizedStatus === "BORROWER_REJECTED" ||
      normalizedStatus === "REJECTED" ||
      normalizedStatus === "DECLINED"
    );
  };

  const isExecutedStatus = (status) => {
    const normalizedStatus = normalizeStatus(status);
    return (
      normalizedStatus === "EXECUTED" ||
      normalizedStatus === "COMPLETED" ||
      normalizedStatus === "LOANEXECUTED" ||
      normalizedStatus === "DISBURSED" ||
      normalizedStatus === "CLOSED"
    );
  };

  const getActionAvailability = (record) => {
    const borrowerStatus = normalizeStatus(record?.borrowerStatus);
    const lenderStatus = normalizeStatus(record?.lenderStatus);
    const loanStatus = normalizeStatus(record?.loanStatus);
    const isExecuted = isExecutedStatus(loanStatus);
    const isRejected = isRejectedStatus(borrowerStatus);

    const canShowAcceptButton =
      !isExecuted &&
      !isRejected &&
      (borrowerStatus === "INITIATED" || borrowerStatus === "PENDING");
    // Borrower can reject until loan is executed/completed.
    const canShowRejectButton =
      !isExecuted && !isRejected && isOpenForRejectStatus(borrowerStatus);
    const canShowExecuteButton =
      isAcceptedStatus(borrowerStatus) &&
      isAcceptedStatus(lenderStatus) &&
      (isAcceptedStatus(loanStatus) || loanStatus === "PROCESSING");

    return {
      canShowAcceptButton,
      canShowRejectButton,
      canShowExecuteButton,
      isExecuted,
    };
  };

  const getApiErrorMessage = (response, fallbackMessage) => {
    return (
      response?.response?.data?.errorMessage ||
      response?.response?.data?.message ||
      response?.data?.errorMessage ||
      response?.data?.message ||
      fallbackMessage
    );
  };

  const fetchLoansInitiated = async () => {
    try {
      const response = await getListOfBorrowerLoansInitiated();

      if (response?.status == 200) {
        const data = Array.isArray(response.data) ? response.data : [];
        setLoanInitiatedInfo({
          apiData: data,
          hasData: data.length > 0,
          loading: false,
          errorMessage: "",
        });
        return;
      }

      setLoanInitiatedInfo({
        apiData: [],
        hasData: false,
        loading: false,
        errorMessage: getApiErrorMessage(
          response,
          "We could not load your active applications. Please try again.",
        ),
      });
    } catch (error) {
      setLoanInitiatedInfo({
        apiData: [],
        hasData: false,
        loading: false,
        errorMessage: getApiErrorMessage(
          error,
          "We could not load your active applications. Please try again.",
        ),
      });
    }
  };

  useEffect(() => {
    fetchLoansInitiated();
  }, []);

  const handleBorrowerAction = async (record, borrowerStatus) => {
    const isAcceptAction = borrowerStatus === "LOANACCEPTED";
    const confirmationResult = await Swal.fire({
      title: "Confirm Loan Offer",
      text: isAcceptAction
        ? "Are you sure you want to accept this loan offer?"
        : "Are you sure you want to reject this loan offer? ",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: isAcceptAction ? "#28a745" : "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: isAcceptAction ? "Accept Offer" : "Reject Offer",
      cancelButtonText: "Cancel",
    });

    if (!confirmationResult.isConfirmed) {
      return;
    }

    const payload = {
      id: record.id,
      loanRequestId: record.loanRequestId,
      borrowerId: record.borrowerId,
      borrowerStatus,
    };

    setUpdatingRowId(record.id);
    try {
      const response = await borrowerLoanAcceptOrReject(payload);
      if (response?.status == 200) {
        HandleWithFooter(
          borrowerStatus === "LOANACCEPTED"
            ? "Your selected loan offer has been accepted successfully "
            : "Your selected loan offer has been rejected successfully ",
        );
        await fetchLoansInitiated();
      } else {
        WarningBackendApi(
          "Action Failed",
          getApiErrorMessage(
            response,
            "Unable to update status right now. Please try again.",
          ),
        );
      }
    } catch (error) {
      WarningBackendApi(
        "Action Failed",
        getApiErrorMessage(
          error,
          "Unable to update status right now. Please try again.",
        ),
      );
    } finally {
      setUpdatingRowId(null);
    }
  };

  const handleLoanExecute = async (record) => {
    const confirmationResult = await Swal.fire({
      title: "Confirm Loan Execution ",
      text: "Are you sure you want to proceed with executing this loan?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0d6efd",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Execute Loan",
      cancelButtonText: "Cancel",
    });

    if (!confirmationResult.isConfirmed) {
      return;
    }

    const payload = {
      loanRequestId: record.loanRequestId,
      borrowerId: record.borrowerId,
    };

    setExecutingRowId(record.id);
    try {
      const response = await borrowerLoanExcute(payload);
      if (response?.status == 200) {
        HandleWithFooter(
          "Your loan has been successfully executed in accordance with the agreed terms. You may track its status and updates in the Disbursements section.",
        );
        await fetchLoansInitiated();
      } else {
        WarningBackendApi(
          "Execution Failed",
          getApiErrorMessage(
            response,
            "Unable to execute this loan right now. Please try again.",
          ),
        );
      }
    } catch (error) {
      WarningBackendApi(
        "Execution Failed",
        getApiErrorMessage(
          error,
          "Unable to execute this loan right now. Please try again.",
        ),
      );
    } finally {
      setExecutingRowId(null);
    }
  };

  const dataSource = loanInitiatedInfo.apiData.map((data, index) => ({
    key: data.id || index,
    id: data.id,
    serialNumber: index + 1,
    loanRequestId: data.loanRequestId || "-",
    borrowerId: data.borrowerId || "-",
    lenderId: data.lenderId || "-",
    lenderName: data.lenderName || "-",
    lenderInterestedAmount: data.lenderInterestedAmount ?? "-",
    roi: data.roi ?? "-",
    duration: data.duration ?? "-",
    loanStatus: data.loanStatus || "-",
    lenderStatus: data.lenderStatus || "-",
    borrowerStatus: data.borrowerStatus || "-",
    createdAt: data.createdAt || null,
  }));

  const RemainingTime = ({ createdAt, duration }) => {
    const calcRemaining = () => {
      if (!createdAt || !duration || duration === "-") return null;
      const start = new Date(String(createdAt).replace(" ", "T"));
      if (isNaN(start.getTime())) return null;
      const end = new Date(start.getTime() + Number(duration) * 24 * 60 * 60 * 1000);
      const diff = end - Date.now();
      if (diff <= 0) return "Expired";
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`;
    };
    const [remaining, setRemaining] = useState(calcRemaining);
    const timerRef = useRef(null);
    useEffect(() => {
      timerRef.current = setInterval(() => setRemaining(calcRemaining()), 60000);
      return () => clearInterval(timerRef.current);
    }, [createdAt, duration]);
    if (!remaining) return null;
    return (
      <div className="text-muted small mt-1">
        <span className={remaining === "Expired" ? "text-danger" : "text-warning fw-semibold"}>
          ⏱ {remaining === "Expired" ? "Expired" : `Expires in: ${remaining}`}
        </span>
      </div>
    );
  };

  const columns = [
    // {
    //   title: "S.No",
    //   dataIndex: "serialNumber",
    // },
    // {
    //   title: "LR ID",
    //   dataIndex: "loanRequestId",
    // },
    // {
    //   title: "Borrower ID",
    //   dataIndex: "borrowerId",
    // },
    {
      title: "Lender ID",
      dataIndex: "lenderId",
    },
    {
      title: "Lender Name",
      dataIndex: "lenderName",
    },
    {
      title: "Offered Amount",
      dataIndex: "lenderInterestedAmount",
      render: (value) => (value === "-" ? value : `₹ ${value}`),
    },
    {
      title: "ROI",
      dataIndex: "roi",
      render: (value) => (value === "-" ? value : `${value}%`),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      render: (value) => (value === "-" ? value : `${value} Days`),
    },
    {
      title: "Loan Status",
      dataIndex: "loanStatus",
    },
    {
      title: "Lender Status",
      dataIndex: "lenderStatus",
    },
    {
      title: "Borrower Status",
      dataIndex: "borrowerStatus",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        const { canShowAcceptButton, canShowRejectButton, canShowExecuteButton } =
          getActionAvailability(record);
        const borrowerStatus = normalizeStatus(record?.borrowerStatus);
        const loanStatus = normalizeStatus(record?.loanStatus);
        const forceShowRejectForProcessing =
          borrowerStatus === "PROCESSING" || loanStatus === "PROCESSING";
        const showRejectButton =
          (canShowRejectButton || forceShowRejectForProcessing) &&
          !isRejectedStatus(borrowerStatus) &&
          !isExecutedStatus(loanStatus);
        const isProcessing = borrowerStatus === "PROCESSING" || loanStatus === "PROCESSING";
        const isUpdating = updatingRowId === record.id;
        const isExecuting = executingRowId === record.id;
        const isLoading = isUpdating || isExecuting;

        return (
          <div className="d-flex gap-2 flex-wrap">
            {canShowAcceptButton ? (
              <button
                type="button"
                className="btn btn-sm btn-success"
                disabled={isLoading}
                onClick={() => handleBorrowerAction(record, "LOANACCEPTED")}
              >
                {isUpdating ? "Please wait..." : "Accept"}
              </button>
            ) : null}
            {showRejectButton ? (
              <div className="d-flex flex-column align-items-start">
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  disabled={isLoading || isProcessing}
                  title={isProcessing ? "Cannot reject while processing" : ""}
                  onClick={() =>
                    handleBorrowerAction(record, "BORROWER_REJECTED")
                  }
                >
                  {isUpdating ? "Please wait..." : "Reject"}
                </button>
                {isProcessing && (
                  <RemainingTime createdAt={record.createdAt} duration={record.duration} />
                )}
              </div>
            ) : null}
            {canShowExecuteButton ? (
              <button
                type="button"
                className="btn btn-sm btn-primary"
                disabled={isLoading}
                onClick={() => handleLoanExecute(record)}
              >
                {isExecuting ? "Please wait..." : "Execute loan"}
              </button>
            ) : null}
            {!canShowAcceptButton && !showRejectButton && !canShowExecuteButton ? (
              <span className="text-muted small">No actions available</span>
            ) : null}
          </div>
        );
      },
    },
  ];

  const totalInitiatedAmount = useMemo(() => {
    return loanInitiatedInfo.apiData.reduce((sum, item) => {
      const value = Number(item?.lenderInterestedAmount || 0);
      return sum + (Number.isNaN(value) ? 0 : value);
    }, 0);
  }, [loanInitiatedInfo.apiData]);

  const loanSummary = useMemo(() => {
    return loanInitiatedInfo.apiData.reduce(
      (summary, item) => {
        const { canShowAcceptButton, canShowRejectButton, isExecuted } =
          getActionAvailability(item);
        const isLoanAcceptedOrProcessing = isAcceptedOrProcessingStatus(
          item?.loanStatus,
        );
        const isAcceptedByBorrowerAndLender =
          isAcceptedOrProcessingStatus(item?.borrowerStatus) &&
          isAcceptedOrProcessingStatus(item?.lenderStatus);

        if (canShowAcceptButton || canShowRejectButton) {
          summary.pendingActionCount += 1;
        }
        if ((isAcceptedByBorrowerAndLender || isLoanAcceptedOrProcessing) && !isExecuted) {
          summary.acceptedOffersCount += 1;
        }
        if (isExecuted) {
          summary.executedLoansCount += 1;
        }

        return summary;
      },
      {
        pendingActionCount: 0,
        acceptedOffersCount: 0,
        executedLoansCount: 0,
      },
    );
  }, [loanInitiatedInfo.apiData]);

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
                  <h3 className="page-title">Offers Received</h3>
                  <ul className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/borrowerDashboard">Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item active">Offers Received</li>
                  </ul>
                </div>
              </div>
              <span className="text-muted">Compare offers from lenders and choose the best option for your needs.</span>
            </div>

            <div className="row mb-3">
              <div className="col-12 col-md-6 col-xl-3 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <p className="text-muted mb-1">
                      Total Amount of Offers Received
                    </p>
                    <h4 className="mb-0">
                      ₹ {totalInitiatedAmount.toFixed(2)}
                    </h4>
                  </div>
                </div>
              </div>
              {/* <div className="col-12 col-md-6 col-xl-3 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <p className="text-muted mb-1">Pending your action</p>
                    <h4 className="mb-0">{loanSummary.pendingActionCount}</h4>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6 col-xl-3 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <p className="text-muted mb-1">Accepted offers</p>
                    <h4 className="mb-0">{loanSummary.acceptedOffersCount}</h4>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-6 col-xl-3 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body">
                    <p className="text-muted mb-1">Executed loans</p>
                    <h4 className="mb-0">{loanSummary.executedLoansCount}</h4>
                  </div>
                </div>
              </div> */}
            </div>

            <div className="row">
              <div className="col-sm-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-body">
                    {loanInitiatedInfo.errorMessage ? (
                      <div className="alert alert-danger" role="alert">
                        {loanInitiatedInfo.errorMessage}
                      </div>
                    ) : null}
                    <Table
                      className="table-responsive table-responsive-md table-responsive-lg table-responsive-xs"
                      columns={columns}
                      dataSource={loanInitiatedInfo.hasData ? dataSource : []}
                      loading={loanInitiatedInfo.loading}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: false,
                      }}
                      locale={{
                        emptyText: "No offered amount to display yet.",
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

export default BorrowerLoansInitiated;
