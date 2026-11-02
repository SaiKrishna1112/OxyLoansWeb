import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Table } from "antd";
import Swal from "sweetalert2";
import "./instantLoan.css";
import {
  borrowerLoanAcceptOrReject,
  borrowerLoanExcute,
  getListOfBorrowerLoansInitiated,
  getRadiusBasedFee,
  getBorrowerEligibleAmount,
} from "../../../../../../HttpRequest/afterlogin";
import { formatINR } from "../creditReportUtils";

const InstantLoanStepLenderOffers = ({
  profileData = {},
  selectedOffer = null,
  applicationId = "41682",
  onProceedToEsign,
  onProceedToEnach,
  onBack,
}) => {
  const [loanInitiatedInfo, setLoanInitiatedInfo] = useState({
    apiData: [],
    hasData: false,
    loading: true,
    errorMessage: "",
  });
  const [updatingRowId, setUpdatingRowId] = useState(null);
  const [executingRowId, setExecutingRowId] = useState(null);
  const [processingFees, setProcessingFees] = useState({});
  const [feeSlabs, setFeeSlabs] = useState([]);
  const [eligibleAmount, setEligibleAmount] = useState(null);

  useEffect(() => {
    getBorrowerEligibleAmount()
      .then((res) => {
        if (res?.status == 200) setEligibleAmount(res.data?.amount ?? null);
      })
      .catch(() => {});
  }, []);

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
    const canShowRejectButton =
      !isExecuted && !isRejected && isOpenForRejectStatus(borrowerStatus);
    const canShowExecuteButton =
      isAcceptedStatus(borrowerStatus) &&
      isAcceptedStatus(lenderStatus) &&
      (isAcceptedStatus(loanStatus) || loanStatus === "PROCESSING") &&
      record?.borrowerEsigned === true;

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

  const getMatchingSlab = (slabs, distance) =>
    slabs.find((s) => distance >= s.startingKm && distance <= s.endingKm) || null;

  const fetchProcessingFees = async (loans) => {
    try {
      const res = await getRadiusBasedFee();
      const slabs = res?.status == 200 && Array.isArray(res.data) ? res.data : [];
      setFeeSlabs(slabs);
      const fees = {};
      loans.forEach((loan) => {
        const slab = getMatchingSlab(slabs, loan.distance ?? 0);
        fees[loan.id] = slab
          ? ((loan.lenderInterestedAmount ?? 0) * slab.feePercentage) / 100
          : null;
      });
      setProcessingFees(fees);
    } catch {
      setProcessingFees({});
    }
  };

  const fetchLoansInitiated = async () => {
    setLoanInitiatedInfo((prev) => ({ ...prev, loading: true, errorMessage: "" }));
    try {
      const response = await getListOfBorrowerLoansInitiated(profileData.userId || applicationId);
      if (response?.status == 200) {
        const data = Array.isArray(response.data) ? response.data : [];
        setLoanInitiatedInfo({
          apiData: data,
          hasData: data.length > 0,
          loading: false,
          errorMessage: "",
        });
        if (data.length > 0) fetchProcessingFees(data);
        return;
      }

      setLoanInitiatedInfo({
        apiData: [],
        hasData: false,
        loading: false,
        errorMessage: getApiErrorMessage(
          response,
          "No loan offers received from lenders yet.",
        ),
      });
    } catch (error) {
      setLoanInitiatedInfo({
        apiData: [],
        hasData: false,
        loading: false,
        errorMessage: getApiErrorMessage(
          error,
          "No loan offers received from lenders yet.",
        ),
      });
    }
  };

  useEffect(() => {
    fetchLoansInitiated();
  }, [profileData.userId, applicationId]);

  const handleBorrowerAction = async (record, borrowerStatus) => {
    const isAcceptAction = borrowerStatus === "LOANACCEPTED";
    const confirmationResult = await Swal.fire({
      title: isAcceptAction ? "Accept Loan Offer?" : "Reject Loan Offer?",
      text: isAcceptAction
        ? `Are you sure you want to accept this loan offer of ₹${record.lenderInterestedAmount || record.loanRequestAmount} from ${record.lenderName || "Lender"}?`
        : "Are you sure you want to reject this loan offer?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: isAcceptAction ? "#16a34a" : "#dc2626",
      cancelButtonColor: "#6c757d",
      confirmButtonText: isAcceptAction ? "Yes, Accept Offer" : "Yes, Reject Offer",
      cancelButtonText: "Cancel",
    });

    if (!confirmationResult.isConfirmed) {
      return;
    }

    const payload = {
      id: record.id,
      loanRequestId: record.loanRequestId,
      borrowerId: record.borrowerId || profileData.userId || applicationId,
      borrowerStatus,
    };

    setUpdatingRowId(record.id);
    try {
      const response = await borrowerLoanAcceptOrReject(payload);
      if (response?.status == 200) {
        Swal.fire({
          icon: "success",
          title: isAcceptAction ? "Offer Accepted!" : "Offer Rejected",
          text: isAcceptAction
            ? "Your selected loan offer has been accepted successfully. Proceed to eSign the digital agreement."
            : "Your selected loan offer has been rejected.",
          timer: 1800,
          showConfirmButton: false,
        });
        await fetchLoansInitiated();
      } else {
        Swal.fire({
          icon: "error",
          title: "Action Failed",
          text: getApiErrorMessage(response, "Unable to update status right now. Please try again."),
          confirmButtonColor: "#0040e0",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Action Failed",
        text: getApiErrorMessage(error, "Unable to update status right now. Please try again."),
        confirmButtonColor: "#0040e0",
      });
    } finally {
      setUpdatingRowId(null);
    }
  };

  const handleLoanExecute = async (record) => {
    const confirmationResult = await Swal.fire({
      title: "Confirm Loan Execution",
      text: "Are you sure you want to proceed with executing this loan?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0040e0",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Execute Loan",
      cancelButtonText: "Cancel",
    });

    if (!confirmationResult.isConfirmed) {
      return;
    }

    const payload = {
      loanRequestId: record.loanRequestId,
      borrowerId: record.borrowerId || profileData.userId || applicationId,
    };

    setExecutingRowId(record.id);
    try {
      const response = await borrowerLoanExcute(payload);
      if (response?.status == 200) {
        Swal.fire({
          icon: "success",
          title: "Loan Executed!",
          text: "Thanks for accepting to execute the loan. Proceeding to eNACH setup.",
          timer: 1800,
          showConfirmButton: false,
        });
        await fetchLoansInitiated();
        if (onProceedToEnach) onProceedToEnach(record);
      } else {
        Swal.fire({
          icon: "error",
          title: "Execution Failed",
          text: getApiErrorMessage(response, "Unable to execute this loan right now. Please try again."),
          confirmButtonColor: "#0040e0",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Execution Failed",
        text: getApiErrorMessage(error, "Unable to execute this loan right now. Please try again."),
        confirmButtonColor: "#0040e0",
      });
    } finally {
      setExecutingRowId(null);
    }
  };

  const totalInitiatedAmount = useMemo(() => {
    return loanInitiatedInfo.apiData.reduce((sum, item) => {
      const value = Number(item?.lenderInterestedAmount || 0);
      return sum + (Number.isNaN(value) ? 0 : value);
    }, 0);
  }, [loanInitiatedInfo.apiData]);

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
    distance: data.distance ?? 0,
    borrowerAggrement: data.borrowerAggrement || null,
    borrowerEsigned: data.borrowerEsigned || false,
    raw: data,
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
      <div className="text-muted small mt-1" style={{ fontSize: "11px" }}>
        <span className={remaining === "Expired" ? "text-danger" : "text-warning fw-semibold"}>
          ⏱ {remaining === "Expired" ? "Expired" : `Expires: ${remaining}`}
        </span>
      </div>
    );
  };

  const columns = [
    {
      title: "Lender ID",
      dataIndex: "lenderId",
      key: "lenderId",
      render: (text) => <strong className="text-dark">{text}</strong>,
    },
    {
      title: "Lender Name",
      dataIndex: "lenderName",
      key: "lenderName",
      render: (text) => (
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary"
            style={{ width: "28px", height: "28px", minWidth: "28px" }}
          >
            <i className="fa-solid fa-user-tie" style={{ fontSize: "11px" }}></i>
          </div>
          <span className="fw-semibold text-dark">{text}</span>
        </div>
      ),
    },
    {
      title: "Offered Amount",
      dataIndex: "lenderInterestedAmount",
      key: "lenderInterestedAmount",
      render: (value) => (
        <strong className="text-primary fs-6">
          {value === "-" ? value : `₹ ${Number(value).toLocaleString("en-IN")}`}
        </strong>
      ),
    },
    {
      title: "ROI",
      dataIndex: "roi",
      key: "roi",
      render: (value) => (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill fw-bold">
          {value === "-" ? value : `${value}% p.a.`}
        </span>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      render: (value) => <span>{value === "-" ? value : `${value} Days`}</span>,
    },
    {
      title: "Loan Status",
      dataIndex: "loanStatus",
      key: "loanStatus",
      render: (status) => (
        <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill small">
          {status}
        </span>
      ),
    },
    {
      title: "Lender Status",
      dataIndex: "lenderStatus",
      key: "lenderStatus",
      render: (status) => {
        const norm = normalizeStatus(status);
        const isAcc = norm === "LOANACCEPTED" || norm === "ACCEPTED";
        return (
          <span className={`badge px-2 py-1 rounded-pill small ${isAcc ? "bg-success text-white" : "bg-light text-secondary border"}`}>
            {status}
          </span>
        );
      },
    },
    {
      title: "Borrower Status",
      dataIndex: "borrowerStatus",
      key: "borrowerStatus",
      render: (status) => {
        const norm = normalizeStatus(status);
        const isAcc = norm === "LOANACCEPTED" || norm === "ACCEPTED";
        return (
          <span className={`badge px-2 py-1 rounded-pill small ${isAcc ? "bg-success text-white" : "bg-warning-subtle text-warning border border-warning"}`}>
            {status}
          </span>
        );
      },
    },
    {
      title: "Processing Fee",
      key: "processingFee",
      render: (_, record) => {
        const fee = processingFees[record.id];
        if (fee === undefined) return <span className="text-muted small">Loading...</span>;
        if (fee === null) return <span className="text-muted small">N/A</span>;
        return <span className="fw-semibold text-secondary">₹ {fee.toFixed(2)}</span>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        const { canShowAcceptButton, canShowRejectButton, canShowExecuteButton } =
          getActionAvailability(record);
        const borrowerStatus = normalizeStatus(record?.borrowerStatus);
        const loanStatus = normalizeStatus(record?.loanStatus);
        const isUpdating = updatingRowId === record.id;
        const isExecuting = executingRowId === record.id;
        const isLoading = isUpdating || isExecuting;

        return (
          <div className="d-flex gap-2 flex-wrap align-items-center">
            {canShowAcceptButton && (
              <button
                type="button"
                className="btn btn-sm btn-success rounded-pill px-3 py-1 fw-bold shadow-xs"
                disabled={isLoading}
                onClick={() => handleBorrowerAction(record, "LOANACCEPTED")}
              >
                {isUpdating ? "Please wait..." : "Accept"}
              </button>
            )}

            {canShowRejectButton && (
              <div className="d-flex flex-column align-items-start">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger rounded-pill px-2.5 py-1"
                  disabled={isLoading}
                  onClick={() => handleBorrowerAction(record, "BORROWER_REJECTED")}
                >
                  {isUpdating ? "Please wait..." : "Reject"}
                </button>
                {(record.loanStatus === "PROCESSING" || record.borrowerStatus === "PROCESSING") && (
                  <RemainingTime createdAt={record.createdAt} duration={record.duration} />
                )}
              </div>
            )}

            {borrowerStatus === "LOANACCEPTED" && !record.borrowerEsigned && (
              <button
                type="button"
                className="btn btn-sm btn-warning text-dark fw-bold rounded-pill px-3 py-1.5 shadow-xs d-inline-flex align-items-center gap-1.5"
                onClick={() => {
                  const offerPayload = {
                    principal: Number(record.lenderInterestedAmount || selectedOffer?.principal || 31500),
                    interestRate: Number(record.roi || 16.5),
                    monthlyEmi: selectedOffer?.monthlyEmi || Math.round((Number(record.lenderInterestedAmount || 31500) * 1.05) / 3),
                    tenureMonths: selectedOffer?.tenureMonths || 3,
                    lenderName: record.lenderName || "Matched Peer Lender",
                    lenderId: record.lenderId,
                    loanRequestId: record.loanRequestId,
                    assignmentId: record.id,
                    raw: record,
                  };
                  if (onProceedToEsign) onProceedToEsign(offerPayload);
                }}
              >
                <i className="fa-solid fa-signature"></i>
                <span>eSign Agreement</span>
              </button>
            )}

            {record.borrowerAggrement && (
              <a
                href={record.borrowerAggrement}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-info rounded-pill px-2.5 py-1"
              >
                <i className="fa-solid fa-file-pdf me-1"></i> View Agreement
              </a>
            )}

            {record.borrowerEsigned && (
              <span className="badge bg-success-subtle text-success p-2 small rounded-pill">
                <i className="fa-solid fa-circle-check me-1"></i> eSigned
              </span>
            )}

            {canShowExecuteButton && (
              <button
                type="button"
                className="btn btn-sm btn-primary rounded-pill px-3 py-1 fw-bold"
                disabled={isLoading}
                onClick={() => handleLoanExecute(record)}
              >
                {isExecuting ? "Please wait..." : "Execute Loan"}
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="fintech-card step-view-enter">
      {/* Step Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1.5">
            <span
              className="badge rounded-pill px-3 py-1 small fw-bold"
              style={{
                backgroundColor: "#064e3b",
                color: "#34d399",
                fontSize: "11px",
              }}
            >
              Step 6 of 9 • Marketplace Matches
            </span>
          </div>
          <h4 className="fw-bold text-dark mb-1" style={{ fontSize: "22px" }}>
            Offers Received from Lenders
          </h4>
          <p className="text-secondary small mb-0" style={{ fontSize: "12.5px" }}>
            Review competing loan offers from verified peer lenders for <strong>{profileData.name || "DHARMAPURI SAI KRISHNA"}</strong>. Accept your preferred offer and proceed to digital agreement eSign.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={fetchLoansInitiated}
            disabled={loanInitiatedInfo.loading}
            className="btn btn-sm btn-outline-primary bg-white rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1.5 shadow-2xs"
            style={{ fontSize: "12px", borderColor: "#cbd5e1", color: "#0040e0" }}
          >
            <i className={`fa-solid fa-arrows-rotate ${loanInitiatedInfo.loading ? "fa-spin" : ""}`}></i>
            <span>Refresh Offers</span>
          </button>
          <button
            type="button"
            onClick={onBack}
            className="btn btn-sm btn-outline-secondary bg-white rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1.5 shadow-2xs"
            style={{ fontSize: "12px", borderColor: "#cbd5e1" }}
          >
            <i className="fa-solid fa-arrow-left me-1"></i>
            <span>Back to Loan Plan</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <div className="card-body p-3.5">
              <span className="text-uppercase text-muted fw-bold small d-block mb-1" style={{ fontSize: "11px" }}>
                Total Offers Received
              </span>
              <h3 className="fw-bold text-dark mb-1">
                ₹ {totalInitiatedAmount.toFixed(2)}
              </h3>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-0.5 rounded-pill small">
                {loanInitiatedInfo.apiData.length} Active Offers
              </span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <div className="card-body p-3.5">
              <span className="text-uppercase text-muted fw-bold small d-block mb-1" style={{ fontSize: "11px" }}>
                Maximum Eligible Limit
              </span>
              <h3 className="fw-bold text-success mb-1">
                {eligibleAmount !== null ? `₹ ${eligibleAmount.toLocaleString("en-IN")}` : formatINR(31500)}
              </h3>
              <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-0.5 rounded-pill small">
                <i className="fa-solid fa-circle-check me-1"></i> Underwriting Verified
              </span>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}>
            <div className="card-body p-3.5">
              <span className="text-uppercase text-muted fw-bold small d-block mb-1" style={{ fontSize: "11px" }}>
                Marketplace Protection
              </span>
              <h6 className="fw-bold text-dark mb-1 fs-6">
                RBI Compliant P2P
              </h6>
              <span className="text-muted small" style={{ fontSize: "11.5px" }}>
                Escrow backed funds directly disbursed to your bank.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Offers Received Table Card (Exact logic & columns from BorrowerLoansInitiated.jsx) */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}>
        <div className="card-body p-4">
          {loanInitiatedInfo.errorMessage ? (
            <div className="alert alert-info d-flex align-items-center gap-2 mb-3" role="alert">
              <i className="fa-solid fa-info-circle"></i>
              <span>{loanInitiatedInfo.errorMessage}</span>
            </div>
          ) : null}

          <div className="table-responsive">
            <Table
              className="align-middle"
              columns={columns}
              dataSource={loanInitiatedInfo.hasData ? dataSource : []}
              loading={loanInitiatedInfo.loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
              }}
              locale={{
                emptyText: (
                  <div className="py-5 text-center">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 text-primary bg-primary bg-opacity-10"
                      style={{ width: "54px", height: "54px" }}
                    >
                      <i className="fa-solid fa-hourglass-half fs-4"></i>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">Waiting for Lender Offers...</h6>
                    <p className="text-muted small mx-auto mb-3" style={{ maxWidth: "460px" }}>
                      Your loan request has been broadcasted into the OxyLoans P2P network. Nearby certified lenders are currently reviewing your profile.
                    </p>
                    <button
                      type="button"
                      onClick={fetchLoansInitiated}
                      className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1.5"
                    >
                      <i className="fa-solid fa-arrows-rotate me-1.5"></i> Check for Incoming Offers
                    </button>
                  </div>
                ),
              }}
              scroll={{ x: true }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstantLoanStepLenderOffers;
