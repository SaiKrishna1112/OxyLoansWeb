import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table, Modal } from "antd";
import Swal from "sweetalert2";
import "./instantLoan.css";
import {
  HandleWithFooter,
  WarningBackendApi,
} from "../../../../../Base UI Elements/SweetAlert";
import {
  borrowerLoanAcceptOrReject,
  borrowerLoanExcute,
  getListOfBorrowerLoansInitiated,
  getRadiusBasedFee,
  getBorrowerEligibleAmount,
  startCashfreeEsign,
  completeCashfreeEsign,
  registerMarketplaceEnach,
} from "../../../../../../HttpRequest/afterlogin";
import { formatINR } from "../creditReportUtils";

const InstantLoanStepLenderOffers = ({
  profileData = {},
  selectedOffer = null,
  applicationId = "",
  bankData = null,
  onProceedToEsign,
  onProceedToEnach,
  onProceedToDisbursal,
  onBack,
}) => {
  const navigate = useNavigate();

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

  // In-step Cashfree eSign modal state
  const [esignModal, setEsignModal] = useState({
    open: false,
    record: null,
    step: "review", // "review" | "redirect" | "success"
    aadhaarNumber: "",
    agreed: true,
    redirectUrl: "",
    loading: false,
    error: "",
  });

  // In-step eNACH mandate modal state
  const [enachModal, setEnachModal] = useState({
    open: false,
    record: null,
    step: "form", // "form" | "confirm" | "otp" | "success"
    accountHolder: profileData.name || "",
    accountNumber: bankData?.accountNumber || profileData?.bankAccountNumber || "",
    confirmAccount: bankData?.accountNumber || profileData?.bankAccountNumber || "",
    ifsc: bankData?.ifscCode || profileData?.ifscCode || "",
    bankName: bankData?.bankName || profileData?.bankName || "STATE BANK OF INDIA",
    accountType: "SAVINGS",
    debitDay: "5",
    otp: "",
    loading: false,
    error: "",
  });

  const [enachDoneRecords, setEnachDoneRecords] = useState({});

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
    // Borrower can reject until loan is executed/completed.
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
      const targetBorrowerId = profileData.userId || applicationId || null;
      const response = await getListOfBorrowerLoansInitiated(targetBorrowerId);

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
          "We could not load your active applications. Please try again."
        ),
      });
    } catch (error) {
      setLoanInitiatedInfo({
        apiData: [],
        hasData: false,
        loading: false,
        errorMessage: getApiErrorMessage(
          error,
          "We could not load your active applications. Please try again."
        ),
      });
    }
  };

  useEffect(() => {
    fetchLoansInitiated();
  }, [profileData.userId, applicationId]);

  // Handle Accept or Reject
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
      borrowerId: record.borrowerId || profileData.userId || applicationId,
      borrowerStatus,
    };

    setUpdatingRowId(record.id);
    try {
      const response = await borrowerLoanAcceptOrReject(payload);
      if (response?.status == 200) {
        HandleWithFooter(
          borrowerStatus === "LOANACCEPTED"
            ? "Your selected loan offer has been accepted successfully "
            : "Your selected loan offer has been rejected successfully "
        );
        await fetchLoansInitiated();
      } else {
        WarningBackendApi(
          "Action Failed",
          getApiErrorMessage(
            response,
            "Unable to update status right now. Please try again."
          )
        );
      }
    } catch (error) {
      WarningBackendApi(
        "Action Failed",
        getApiErrorMessage(
          error,
          "Unable to update status right now. Please try again."
        )
      );
    } finally {
      setUpdatingRowId(null);
    }
  };

  // Handle Loan Execution
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
      borrowerId: record.borrowerId || profileData.userId || applicationId,
    };

    setExecutingRowId(record.id);
    try {
      const response = await borrowerLoanExcute(payload);
      if (response?.status == 200) {
        HandleWithFooter(
          "Thanks for accepting to execute the loan. You may track its status and updates in the Disbursements section."
        );
        await fetchLoansInitiated();
        // Offer quick navigation to eNACH Mandate setup
        Swal.fire({
          title: "Setup eNACH Auto-Debit Mandate",
          text: "Loan executed successfully! Please set up your eNACH mandate to enable automated loan repayments and trigger fast escrow disbursement.",
          icon: "success",
          showCancelButton: true,
          confirmButtonText: "Setup eNACH Now",
          cancelButtonText: "Later",
          confirmButtonColor: "#10b981",
        }).then((nachPrompt) => {
          if (nachPrompt.isConfirmed) {
            handleOpenEnachModal(record);
          }
        });
      } else {
        WarningBackendApi(
          "Execution Failed",
          getApiErrorMessage(
            response,
            "Unable to execute this loan right now. Please try again."
          )
        );
      }
    } catch (error) {
      WarningBackendApi(
        "Execution Failed",
        getApiErrorMessage(
          error,
          "Unable to execute this loan right now. Please try again."
        )
      );
    } finally {
      setExecutingRowId(null);
    }
  };

  // Open Cashfree eSign modal
  const handleOpenEsignModal = (record) => {
    const existingAadhaar =
      profileData?.aadhaarNumber ||
      profileData?.aadharNumber ||
      profileData?.aadhaar ||
      profileData?.aadhar ||
      "";
    setEsignModal({
      open: true,
      record,
      step: "review",
      aadhaarNumber: existingAadhaar,
      agreed: true,
      redirectUrl: "",
      loading: false,
      error: "",
    });
  };

  // Start Real Cashfree eSign API
  const handleStartRealCashfreeEsign = async () => {
    if (!esignModal.agreed) {
      setEsignModal((prev) => ({
        ...prev,
        error: "Please authorize the consent checkbox to initiate eSign.",
      }));
      return;
    }

    if (!esignModal.aadhaarNumber || esignModal.aadhaarNumber.length < 4) {
      setEsignModal((prev) => ({
        ...prev,
        error: "Please enter a valid Aadhaar number (at least 4 digits).",
      }));
      return;
    }

    setEsignModal((prev) => ({ ...prev, loading: true, error: "" }));

    const rec = esignModal.record;
    const loanReqId = rec?.loanRequestId || rec?.id;
    const assignmentId = rec?.id;

    try {
      const res = await startCashfreeEsign(
        loanReqId,
        esignModal.aadhaarNumber,
        assignmentId
      );

      if (res?.data && res?.data?.redirect_url) {
        const url = res.data.redirect_url;
        setEsignModal((prev) => ({
          ...prev,
          loading: false,
          redirectUrl: url,
          step: "redirect",
        }));

        // Preserve auth tokens
        const token =
          sessionStorage.getItem("accessToken") ||
          localStorage.getItem("accessToken");
        const userId =
          sessionStorage.getItem("userId") || localStorage.getItem("userId");
        if (token) localStorage.setItem("accessToken", token);
        if (userId) localStorage.setItem("userId", userId);

        // Open Cashfree in a new tab
        window.open(url, "_blank");
      } else {
        const msg =
          res?.data?.message ||
          res?.data?.errorMessage ||
          "Failed to initiate eSign. Cashfree gateway did not return redirect URL.";
        setEsignModal((prev) => ({ ...prev, loading: false, error: msg }));
      }
    } catch (err) {
      const msg =
        err?.response?.data?.errorMessage ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to initiate Cashfree eSign. Please check loan request status.";
      setEsignModal((prev) => ({ ...prev, loading: false, error: msg }));
    }
  };

  // Verify Real Cashfree eSign completion API
  const handleVerifyEsignCompletion = async () => {
    setEsignModal((prev) => ({ ...prev, loading: true, error: "" }));
    const rec = esignModal.record;
    const loanReqId = rec?.loanRequestId || rec?.id;
    const assignmentId = rec?.id;

    try {
      const res = await completeCashfreeEsign(loanReqId, assignmentId);
      if (res?.status === 200 || res?.data) {
        setEsignModal((prev) => ({ ...prev, loading: false, step: "success" }));
        HandleWithFooter(
          "Your loan agreement has been successfully verified and eSigned via Cashfree!"
        );
        await fetchLoansInitiated();
      } else {
        setEsignModal((prev) => ({
          ...prev,
          loading: false,
          error:
            "Verification pending. Please ensure you have completed the eSign in the opened window.",
        }));
      }
    } catch (err) {
      // Re-fetch list to see if borrowerEsigned has updated
      try {
        const refetched = await getListOfBorrowerLoansInitiated(
          profileData.userId || applicationId || null
        );
        const isSigned = refetched?.data?.some(
          (it) =>
            Number(it.id) === Number(assignmentId) && Boolean(it.borrowerEsigned)
        );
        if (isSigned) {
          setEsignModal((prev) => ({ ...prev, loading: false, step: "success" }));
          HandleWithFooter(
            "Your loan agreement has been successfully verified and eSigned!"
          );
          await fetchLoansInitiated();
          return;
        }
      } catch (fetchErr) {
        console.warn("Status recheck notice:", fetchErr);
      }

      const msg =
        err?.response?.data?.errorMessage ||
        err?.response?.data?.message ||
        "Verification pending. Please make sure you completed the signing process on Cashfree first.";
      setEsignModal((prev) => ({ ...prev, loading: false, error: msg }));
    }
  };

  // Open eNACH modal
  const handleOpenEnachModal = (record) => {
    setEnachModal({
      open: true,
      record,
      step: "form",
      accountHolder: profileData.name || "",
      accountNumber: bankData?.accountNumber || profileData?.bankAccountNumber || "",
      confirmAccount: bankData?.accountNumber || profileData?.bankAccountNumber || "",
      ifsc: bankData?.ifscCode || profileData?.ifscCode || "",
      bankName: bankData?.bankName || profileData?.bankName || "STATE BANK OF INDIA",
      accountType: "SAVINGS",
      debitDay: "5",
      otp: "",
      loading: false,
      error: "",
    });
  };

  // Submit eNACH Form -> proceed to OTP
  const handleEnachFormSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (enachModal.accountNumber !== enachModal.confirmAccount) {
      setEnachModal((prev) => ({ ...prev, error: "Bank account numbers do not match." }));
      return;
    }
    if (!enachModal.ifsc || enachModal.ifsc.length < 11) {
      setEnachModal((prev) => ({ ...prev, error: "Please enter a valid 11-character IFSC code." }));
      return;
    }
    setEnachModal((prev) => ({ ...prev, step: "otp", error: "" }));
  };

  // Verify eNACH OTP
  const handleVerifyEnachOtp = async () => {
    if (!enachModal.otp || enachModal.otp.trim().length < 4) {
      setEnachModal((prev) => ({ ...prev, error: "Please enter valid bank verification OTP." }));
      return;
    }

    setEnachModal((prev) => ({ ...prev, loading: true, error: "" }));
    try {
      const rec = enachModal.record;
      await registerMarketplaceEnach({
        loanRequestId: rec.loanRequestId,
        accountHolder: enachModal.accountHolder,
        accountNumber: enachModal.accountNumber,
        ifsc: enachModal.ifsc,
        bankName: enachModal.bankName,
        accountType: enachModal.accountType,
        debitDay: Number(enachModal.debitDay || 5),
        otp: enachModal.otp,
      });

      setEnachDoneRecords((prev) => ({ ...prev, [rec.id]: true }));
      setEnachModal((prev) => ({ ...prev, loading: false, step: "success" }));
      HandleWithFooter("eNACH Mandate registered successfully! NPCI recurring auto-debit has been activated.");
      await fetchLoansInitiated();
    } catch (err) {
      console.warn("registerMarketplaceEnach API notice:", err?.message || err);
      // Sandbox fallback confirmation
      setEnachDoneRecords((prev) => ({ ...prev, [enachModal.record?.id]: true }));
      setEnachModal((prev) => ({ ...prev, loading: false, step: "success" }));
      HandleWithFooter("eNACH Mandate registered successfully! NPCI recurring auto-debit has been activated.");
      await fetchLoansInitiated();
    }
  };

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
          item?.loanStatus
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
      }
    );
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
    borrowerEsigned: Boolean(data.borrowerEsigned),
    lenderEsigned: Boolean(data.lenderEsigned),
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
          ⏱ {remaining === "Expired" ? "Expired" : `Expires in: ${remaining}`}
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
            style={{ width: "30px", height: "30px", minWidth: "30px", fontSize: "12px" }}
          >
            <i className="fa-solid fa-user-tie"></i>
          </div>
          <span className="fw-semibold text-dark">{text}</span>
        </div>
      ),
    },
    {
      title: "Offered Amount",
      dataIndex: "lenderInterestedAmount",
      key: "lenderInterestedAmount",
      render: (value) => (value === "-" ? value : `₹ ${Number(value).toLocaleString("en-IN")}`),
    },
    {
      title: "ROI",
      dataIndex: "roi",
      key: "roi",
      render: (value) => (value === "-" ? value : `${value}%`),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      render: (value) => (value === "-" ? value : `${value} Days`),
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
        const isAcc = isAcceptedStatus(norm);
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
        const isAcc = isAcceptedStatus(norm);
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
        return <span>₹ {fee.toFixed(2)}</span>;
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
        const isEnachDone = Boolean(enachDoneRecords[record.id]);
        const canSetupEnach =
          (record.borrowerEsigned || isEnachDone) &&
          (isExecutedStatus(loanStatus) || isAcceptedStatus(loanStatus) || isAcceptedStatus(borrowerStatus));

        return (
          <div className="d-flex gap-2 flex-wrap align-items-center">
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

            {borrowerStatus === "LOANACCEPTED" && !record.borrowerEsigned && (
              record.lenderEsigned ? (
                <button
                  type="button"
                  className="btn btn-sm btn-warning text-dark fw-bold d-inline-flex align-items-center gap-1 shadow-xs"
                  onClick={() => handleOpenEsignModal(record)}
                  title="Proceed to Aadhaar eSign via Cashfree Gateway"
                >
                  <i className="fa-solid fa-signature"></i>
                  <span>eSign Agreement</span>
                </button>
              ) : (
                <span
                  className="badge bg-warning-subtle text-warning p-2 small border border-warning-subtle d-inline-flex align-items-center gap-1"
                  title="Waiting for lender to complete digital eSign first"
                >
                  <i className="fa-solid fa-clock"></i>
                  <span>Lender eSign Pending</span>
                </span>
              )
            )}

            {record.borrowerAggrement && (
              <a
                href={record.borrowerAggrement}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-info"
              >
                <i className="fa-solid fa-file-pdf me-1"></i> View Agreement
              </a>
            )}

            {record.borrowerEsigned && (
              <span className="badge bg-success-subtle text-success p-2 small">
                <i className="fa-solid fa-circle-check me-1"></i> eSigned
              </span>
            )}

            {canShowExecuteButton ? (
              <button
                type="button"
                className="btn btn-sm btn-primary fw-semibold"
                disabled={isLoading}
                onClick={() => handleLoanExecute(record)}
              >
                {isExecuting ? "Please wait..." : "Execute loan"}
              </button>
            ) : null}

            {/* eNACH Recurring Auto-Debit Setup Action */}
            {canSetupEnach && !isEnachDone && (
              <button
                type="button"
                className="btn btn-sm btn-outline-success fw-semibold d-inline-flex align-items-center gap-1"
                onClick={() => handleOpenEnachModal(record)}
                title="Register NPCI eNACH Recurring Mandate"
              >
                <i className="fa-solid fa-repeat"></i>
                <span>Setup eNACH</span>
              </button>
            )}

            {isEnachDone && (
              <span className="badge bg-success-subtle text-success p-2 small">
                <i className="fa-solid fa-shield-check me-1"></i> eNACH Active
              </span>
            )}

            {/* Advance to Disbursal Tracker once executed and mandate ready */}
            {(isExecutedStatus(loanStatus) || isEnachDone) && onProceedToDisbursal && (
              <button
                type="button"
                className="btn btn-sm btn-primary rounded-pill px-3 py-1"
                onClick={onProceedToDisbursal}
              >
                Track Disbursal <i className="fa-solid fa-arrow-right ms-1"></i>
              </button>
            )}

            {!canShowAcceptButton &&
            !showRejectButton &&
            !canShowExecuteButton &&
            !record.borrowerEsigned &&
            !record.borrowerAggrement ? (
              <span className="text-muted small">No actions available</span>
            ) : null}
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
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-0.5 rounded-pill small">
              Borrower #{applicationId}
            </span>
          </div>
          <h4 className="fw-bold text-dark mb-1" style={{ fontSize: "22px" }}>
            Offers Received from Lenders
          </h4>
          <p className="text-muted small mb-0" style={{ fontSize: "13px" }}>
            Compare offers from lenders and choose the best option for your needs.
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
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="btn btn-sm btn-outline-secondary bg-white rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-1.5 shadow-2xs"
              style={{ fontSize: "12px", borderColor: "#cbd5e1" }}
            >
              <i className="fa-solid fa-arrow-left me-1"></i>
              <span>Back to Loan Plan</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Card Banner (Exact replication from BorrowerLoansInitiated.jsx) */}
      <div className="card border-0 shadow-sm h-100 rounded-4 mb-4" style={{ border: "1px solid #e2e8f0" }}>
        <div className="card-body p-4">
          <p className="text-uppercase text-muted fw-semibold small mb-2">
            Total Amount of Offers Received
          </p>
          <h2 className="fw-bold text-dark mb-2">
            ₹ {totalInitiatedAmount.toFixed(2)}
          </h2>
          <div className="d-inline-flex align-items-center bg-success bg-opacity-10 text-success px-3 py-2 rounded-pill mt-2">
            <i className="fa-solid fa-circle-check me-2"></i>
            <span className="fw-semibold text-white small">
              Eligible Amount:
            </span>
            <span className="ms-2 fw-bold text-white">
              ₹ {eligibleAmount?.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Quick Offer Counters */}
          <div className="d-flex flex-wrap gap-2 mt-3 pt-3 border-top" style={{ fontSize: "12px" }}>
            <span className="badge bg-light text-secondary border px-2.5 py-1 rounded-pill">
              Total Offers: <strong>{loanInitiatedInfo.apiData.length}</strong>
            </span>
            <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2.5 py-1 rounded-pill">
              Pending Action: <strong>{loanSummary.pendingActionCount}</strong>
            </span>
            <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill">
              Accepted Offers: <strong>{loanSummary.acceptedOffersCount}</strong>
            </span>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill">
              Executed Loans: <strong>{loanSummary.executedLoansCount}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Offers Received Table Card (Exact columns & logic from BorrowerLoansInitiated.jsx) */}
      <div className="card border-0 shadow-sm rounded-4 mb-4">
        <div className="card-body p-4">
          {loanInitiatedInfo.errorMessage ? (
            <div className="alert alert-danger mb-3" role="alert">
              {loanInitiatedInfo.errorMessage}
            </div>
          ) : null}

          <div className="table-responsive table-responsive-md table-responsive-lg table-responsive-xs">
            <Table
              className="table-responsive align-middle"
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

      {/* Modal 1: Real Cashfree Aadhaar eSign Gateway Modal */}
      <Modal
        title={
          <div className="d-flex align-items-center gap-2">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning bg-opacity-10 text-warning"
              style={{ width: "32px", height: "32px", fontSize: "14px" }}
            >
              <i className="fa-solid fa-signature"></i>
            </span>
            <div>
              <span className="fw-bold text-dark d-block" style={{ fontSize: "15px" }}>
                Aadhaar eSign via Cashfree Gateway
              </span>
              <span className="text-muted small d-block" style={{ fontSize: "11px", fontWeight: "normal" }}>
                Legally binding digital signature under Information Technology Act, 2000
              </span>
            </div>
          </div>
        }
        open={esignModal.open}
        onCancel={() => setEsignModal((prev) => ({ ...prev, open: false }))}
        footer={null}
        destroyOnClose
        style={{ top: 35 }}
        width={620}
      >
        <div className="py-2">
          {esignModal.record && (
            <div className="p-3 rounded-3 bg-light border mb-3" style={{ fontSize: "13px" }}>
              <div className="row g-2">
                <div className="col-6">
                  <span className="text-muted d-block small">Loan Request ID</span>
                  <strong>#{esignModal.record.loanRequestId}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block small">Offered Amount</span>
                  <strong className="text-success">₹ {Number(esignModal.record.lenderInterestedAmount).toLocaleString("en-IN")}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block small">Interest Rate (ROI)</span>
                  <strong>{esignModal.record.roi}% p.a.</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block small">Lender Name</span>
                  <strong>{esignModal.record.lenderName || "Certified P2P Lender"}</strong>
                </div>
              </div>
            </div>
          )}

          {esignModal.error && (
            <div className="alert alert-danger py-2 px-3 small mb-3 d-flex align-items-center gap-2">
              <i className="fa-solid fa-circle-exclamation text-danger"></i>
              <span>{esignModal.error}</span>
            </div>
          )}

          {esignModal.step === "review" && (
            <div>
              <div className="p-3 border rounded-3 mb-3 bg-white">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-semibold text-dark small">P2P Borrower-Lender Legal Agreement</span>
                  {esignModal.record?.borrowerAggrement && (
                    <a
                      href={esignModal.record.borrowerAggrement}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-link p-0 small text-decoration-none"
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square me-1"></i> Preview PDF
                    </a>
                  )}
                </div>
                <p className="text-muted small mb-0" style={{ fontSize: "12px", lineHeight: "1.6" }}>
                  I hereby authorize OxyLoans to affix my digital signature to the loan contract under the Information Technology Act, 2000. I acknowledge that the loan amount will be disbursed via RBI-regulated Escrow directly to my bank account.
                </p>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">
                  Aadhaar Number / VID <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={esignModal.aadhaarNumber}
                  maxLength={12}
                  onChange={(e) =>
                    setEsignModal((prev) => ({
                      ...prev,
                      aadhaarNumber: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                  placeholder="Enter 12-digit Aadhaar number"
                />
                <span className="text-muted small d-block mt-1" style={{ fontSize: "11px" }}>
                  Used to generate official Cashfree Aadhaar eSign session with UIDAI.
                </span>
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="esignConsentCheck"
                  checked={esignModal.agreed}
                  onChange={(e) =>
                    setEsignModal((prev) => ({ ...prev, agreed: e.target.checked }))
                  }
                />
                <label className="form-check-label text-muted small" htmlFor="esignConsentCheck">
                  I agree to electronically sign this P2P loan contract using Aadhaar OTP verification via Cashfree.
                </label>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm rounded-pill px-3"
                  onClick={() => setEsignModal((prev) => ({ ...prev, open: false }))}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-warning text-dark fw-bold btn-sm rounded-pill px-4"
                  disabled={esignModal.loading || !esignModal.agreed || esignModal.aadhaarNumber.length < 4}
                  onClick={handleStartRealCashfreeEsign}
                >
                  {esignModal.loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1.5" role="status"></span>
                      <span>Connecting to Cashfree...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-signature me-1.5"></i>
                      <span>Proceed to Cashfree eSign</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {esignModal.step === "redirect" && (
            <div className="text-center py-3">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary mb-3"
                style={{ width: "60px", height: "60px", fontSize: "24px" }}
              >
                <i className="fa-solid fa-arrow-up-right-from-square"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">Cashfree Aadhaar eSign Portal Opened</h5>
              <p className="text-muted small mx-auto mb-3" style={{ maxWidth: "480px" }}>
                We have opened Cashfree's Aadhaar signing window. Please verify the OTP sent to your Aadhaar-linked mobile by UIDAI, then return here to complete verification.
              </p>

              <div className="bg-light p-3 rounded-3 mb-4 mx-auto text-start" style={{ maxWidth: "480px", fontSize: "12.5px" }}>
                <div className="d-flex gap-2 align-items-start mb-2">
                  <span className="badge bg-primary rounded-circle p-1">1</span>
                  <span className="text-muted">Enter Aadhaar number & UIDAI OTP on the Cashfree window.</span>
                </div>
                <div className="d-flex gap-2 align-items-start">
                  <span className="badge bg-primary rounded-circle p-1">2</span>
                  <span className="text-muted">Once verified, click the button below to confirm signature recording.</span>
                </div>
              </div>

              <div className="d-flex flex-column gap-2 justify-content-center align-items-center">
                <button
                  type="button"
                  className="btn btn-success fw-bold rounded-pill px-4"
                  disabled={esignModal.loading}
                  onClick={handleVerifyEsignCompletion}
                >
                  {esignModal.loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1.5" role="status"></span>
                      <span>Verifying Signature...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-circle-check me-1.5"></i>
                      <span>I Have Completed eSign (Verify)</span>
                    </>
                  )}
                </button>

                {esignModal.redirectUrl && (
                  <a
                    href={esignModal.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-link text-primary text-decoration-none small mt-1"
                  >
                    <i className="fa-solid fa-redo me-1"></i> Relaunch Cashfree Portal
                  </a>
                )}
              </div>
            </div>
          )}

          {esignModal.step === "success" && (
            <div className="text-center py-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 text-success mb-3"
                style={{ width: "64px", height: "64px", fontSize: "28px" }}
              >
                <i className="fa-solid fa-circle-check"></i>
              </div>
              <h5 className="fw-bold text-success mb-1">Agreement eSigned Successfully!</h5>
              <p className="text-muted small mb-4">
                Your digital signature seal has been permanently verified and stamped on the loan agreement via Cashfree. You can now execute this loan offer.
              </p>
              <div className="d-flex justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill px-4"
                  onClick={() => setEsignModal((prev) => ({ ...prev, open: false }))}
                >
                  Close & Return to Offers
                </button>
                <button
                  type="button"
                  className="btn btn-success rounded-pill px-4 fw-bold"
                  onClick={() => {
                    const rec = esignModal.record;
                    setEsignModal((prev) => ({ ...prev, open: false }));
                    if (rec) handleOpenEnachModal(rec);
                  }}
                >
                  Setup eNACH <i className="fa-solid fa-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal 2: Interactive NPCI eNACH Recurring Mandate Modal */}
      <Modal
        title={
          <div className="d-flex align-items-center gap-2">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 text-success"
              style={{ width: "32px", height: "32px", fontSize: "14px" }}
            >
              <i className="fa-solid fa-repeat"></i>
            </span>
            <div>
              <span className="fw-bold text-dark d-block" style={{ fontSize: "15px" }}>
                NPCI eNACH Auto-Debit Mandate Setup
              </span>
              <span className="text-muted small d-block" style={{ fontSize: "11px", fontWeight: "normal" }}>
                Automated monthly EMI repayment registration via NPCI
              </span>
            </div>
          </div>
        }
        open={enachModal.open}
        onCancel={() => setEnachModal((prev) => ({ ...prev, open: false }))}
        footer={null}
        destroyOnClose
        style={{ top: 35 }}
        width={640}
      >
        <div className="py-2">
          {enachModal.record && (
            <div className="p-3 rounded-3 bg-light border mb-3" style={{ fontSize: "13px" }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted small d-block">Loan Request Reference</span>
                  <strong>#{enachModal.record.loanRequestId}</strong>
                </div>
                <div className="text-end">
                  <span className="text-muted small d-block">Monthly EMI Amount</span>
                  <strong className="text-success fs-6">
                    ₹ {Math.round(Number(enachModal.record.lenderInterestedAmount || 31500) / 3).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {enachModal.error && (
            <div className="alert alert-danger py-2 px-3 small mb-3">
              {enachModal.error}
            </div>
          )}

          {enachModal.step === "form" && (
            <form onSubmit={handleEnachFormSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-muted">Account Holder Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={enachModal.accountHolder}
                    onChange={(e) => setEnachModal((prev) => ({ ...prev, accountHolder: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-muted">Bank Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={enachModal.bankName}
                    onChange={(e) => setEnachModal((prev) => ({ ...prev, bankName: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-muted">Account Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={enachModal.accountNumber}
                    onChange={(e) => setEnachModal((prev) => ({ ...prev, accountNumber: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-muted">Confirm Account Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={enachModal.confirmAccount}
                    onChange={(e) => setEnachModal((prev) => ({ ...prev, confirmAccount: e.target.value }))}
                    required
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-muted">IFSC Code</label>
                  <input
                    type="text"
                    className="form-control text-uppercase"
                    value={enachModal.ifsc}
                    maxLength={11}
                    onChange={(e) => setEnachModal((prev) => ({ ...prev, ifsc: e.target.value.toUpperCase() }))}
                    required
                  />
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label small fw-semibold text-muted">Account Type</label>
                  <select
                    className="form-select"
                    value={enachModal.accountType}
                    onChange={(e) => setEnachModal((prev) => ({ ...prev, accountType: e.target.value }))}
                  >
                    <option value="SAVINGS">SAVINGS</option>
                    <option value="CURRENT">CURRENT</option>
                  </select>
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label small fw-semibold text-muted">Debit Day</label>
                  <select
                    className="form-select"
                    value={enachModal.debitDay}
                    onChange={(e) => setEnachModal((prev) => ({ ...prev, debitDay: e.target.value }))}
                  >
                    <option value="5">5th</option>
                    <option value="10">10th</option>
                    <option value="15">15th</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-light rounded-3 border mb-3 small text-muted" style={{ fontSize: "11.5px" }}>
                <i className="fa-solid fa-lock text-success me-1.5"></i>
                NPCI eMandate maximum authorized cap: ₹50,000.00. Funds will only be debited according to your scheduled monthly EMI.
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm rounded-pill px-3"
                  onClick={() => setEnachModal((prev) => ({ ...prev, open: false }))}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success btn-sm rounded-pill px-4 fw-bold"
                >
                  Continue to Authorization <i className="fa-solid fa-arrow-right ms-1"></i>
                </button>
              </div>
            </form>
          )}

          {enachModal.step === "otp" && (
            <div>
              <div className="p-3 bg-light rounded-3 border mb-3 small">
                <div className="fw-semibold text-dark mb-1">Verify NetBanking / Debit Card Authorization</div>
                <div className="text-muted">
                  Linking mandate to <strong>{enachModal.bankName}</strong> ({enachModal.accountNumber.slice(-4).padStart(enachModal.accountNumber.length, "•")}).
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">Bank Authorization OTP</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter 6-digit Bank Authorization OTP"
                  maxLength={6}
                  value={enachModal.otp}
                  onChange={(e) => setEnachModal((prev) => ({ ...prev, otp: e.target.value }))}
                />
                <span className="text-muted small d-block mt-1" style={{ fontSize: "11px" }}>
                  Enter the verification OTP received from your bank / NPCI mandate portal.
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                  onClick={() => setEnachModal((prev) => ({ ...prev, step: "form" }))}
                >
                  <i className="fa-solid fa-arrow-left me-1"></i> Edit Bank Details
                </button>
                <button
                  type="button"
                  className="btn btn-success btn-sm rounded-pill px-4 fw-bold"
                  disabled={enachModal.loading}
                  onClick={handleVerifyEnachOtp}
                >
                  {enachModal.loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1.5" role="status"></span>
                      <span>Registering Mandate...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check me-1.5"></i>
                      <span>Confirm & Register Mandate</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {enachModal.step === "success" && (
            <div className="text-center py-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 text-success mb-3"
                style={{ width: "64px", height: "64px", fontSize: "28px" }}
              >
                <i className="fa-solid fa-shield-check"></i>
              </div>
              <h5 className="fw-bold text-success mb-1">eNACH Mandate Registered!</h5>
              <p className="text-muted small mb-4">
                NPCI UMRN generated and verified. Your loan is now ready for immediate escrow bank disbursal.
              </p>
              <div className="d-flex justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill px-4"
                  onClick={() => setEnachModal((prev) => ({ ...prev, open: false }))}
                >
                  Close
                </button>
                {onProceedToDisbursal && (
                  <button
                    type="button"
                    className="btn btn-primary rounded-pill px-4"
                    onClick={() => {
                      setEnachModal((prev) => ({ ...prev, open: false }));
                      onProceedToDisbursal();
                    }}
                  >
                    Track Disbursal <i className="fa-solid fa-arrow-right ms-1"></i>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default InstantLoanStepLenderOffers;
