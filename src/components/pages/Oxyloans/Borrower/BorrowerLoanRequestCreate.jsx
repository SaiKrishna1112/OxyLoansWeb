import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import { WarningBackendApi } from "../../Base UI Elements/SweetAlert";
import {
  getBorrowerEligibleAmount,
  getUserId,
  submitBorrowerLoanRequest,
  getBorrowerRequestAmount,
} from "../../../HttpRequest/afterlogin";

const BorrowerLoanRequestCreate = () => {
  const navigate = useNavigate();
  const [requestAmount, setRequestAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eligibleAmount, setEligibleAmount] = useState(null);
  const [isEligibleLoading, setIsEligibleLoading] = useState(true);
  const [eligibleErrorMessage, setEligibleErrorMessage] = useState("");
  const [requestStatusInfo, setRequestStatusInfo] = useState({
    loading: true,
    status: "",
    pendingAmount: 0,
    message: "",
  });
  const hasShownBlockedAlertRef = useRef(false);

  const borrowerId = getUserId() || "";
  const getApiErrorMessage = (response, fallbackMessage) => {
    return (
      response?.response?.data?.errorMessage ||
      response?.response?.data?.message ||
      response?.data?.errorMessage ||
      response?.data?.message ||
      fallbackMessage
    );
  };

  useEffect(() => {
    const fetchEligibleAmount = async () => {
      if (!borrowerId) {
        setEligibleErrorMessage(
          "Your session has expired. Please sign in again.",
        );
        setIsEligibleLoading(false);
        return;
      }

      setIsEligibleLoading(true);
      setEligibleErrorMessage("");
      try {
        const response = await getBorrowerEligibleAmount();
        if (response?.status == 200) {
          const limitAmount = Number(response?.data?.amount ?? 0);
          setEligibleAmount(Number.isNaN(limitAmount) ? 0 : limitAmount);
          setEligibleErrorMessage("");
        } else {
          setEligibleAmount(null);
          setEligibleErrorMessage(
            getApiErrorMessage(
              response,
              "Unable to fetch your eligible amount. Please refresh and try again.",
            ),
          );
        }
      } catch (error) {
        setEligibleAmount(null);
        setEligibleErrorMessage(
          getApiErrorMessage(
            error,
            "Unable to fetch your eligible amount. Please refresh and try again.",
          ),
        );
      }
      setIsEligibleLoading(false);
    };

    fetchEligibleAmount();
  }, [borrowerId]);

  useEffect(() => {
    const fetchBorrowerRequestStatus = async () => {
      if (!borrowerId) {
        setRequestStatusInfo({
          loading: false,
          status: "",
          pendingAmount: 0,
          message: "Your session has expired. Please sign in again.",
        });
        return;
      }

      try {
        const response = await getBorrowerRequestAmount();
        if (response?.status == 200) {
          const requestList = Array.isArray(response?.data) ? response.data : [];
          const latestRequest = requestList.length
            ? [...requestList].sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))[0]
            : null;

          const latestStatus = (latestRequest?.loanRequestStatus || "").toUpperCase();
          const pendingAmount = Number(latestRequest?.partiallyPendingAmount || 0);
          const hasPartialProcessingStatus = latestStatus === "PARTIALLYPROCESSING";

          setRequestStatusInfo({
            loading: false,
            status: latestStatus,
            pendingAmount: Number.isNaN(pendingAmount) ? 0 : pendingAmount,
            message: hasPartialProcessingStatus
              ? "A loan request is already in progress. You can create a new loan request after the current loan request is completed."
              : "",
          });
          return;
        }

        setRequestStatusInfo({
          loading: false,
          status: "",
          pendingAmount: 0,
          message: getApiErrorMessage(
            response,
            "Unable to verify your request status right now.",
          ),
        });
      } catch (error) {
        setRequestStatusInfo({
          loading: false,
          status: "",
          pendingAmount: 0,
          message: getApiErrorMessage(
            error,
            "Unable to verify your request status right now.",
          ),
        });
      }
    };

    fetchBorrowerRequestStatus();
  }, [borrowerId]);

  const isPartiallyProcessing =
    requestStatusInfo.status === "PARTIALLYPROCESSING";
  const isFormBlocked = isPartiallyProcessing;

  useEffect(() => {
    if (!isPartiallyProcessing) {
      hasShownBlockedAlertRef.current = false;
      return;
    }
    if (hasShownBlockedAlertRef.current) return;
    hasShownBlockedAlertRef.current = true;
    WarningBackendApi(
      "Loan Request Already In Progress",
      "A loan request is already in progress. You can create a new loan request after the current loan request is completed.",
    );
  }, [isPartiallyProcessing]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!borrowerId) {
      WarningBackendApi(
        "Session Expired",
        "Your session has expired. Please sign in again to continue.",
      );
      return;
    }

    if (isFormBlocked) {
      WarningBackendApi(
        "Loan Request Not Allowed",
        "A loan request is already in progress. You can create a new loan request after the current loan request is completed.",
      );
      return;
    }

    const normalizedAmount = Number(requestAmount);
    if (!normalizedAmount || normalizedAmount <= 0) {
      WarningBackendApi(
        "Invalid Amount",
        "Please enter a valid loan amount greater than zero.",
      );
      return;
    }

    if (eligibleAmount !== null && normalizedAmount > eligibleAmount) {
      WarningBackendApi(
        "Amount Exceeds Your Limit",
        `Your maximum eligible amount is ₹ ${eligibleAmount}. Please request an amount within your limit.`,
      );
      return;
    }

    const payload = {
      borrowerId: Number(borrowerId),
      requestAmount: normalizedAmount,
    };

    const confirmation = await Swal.fire({
      title: "Confirm application",
      text: `You are requesting ₹ ${normalizedAmount}. Lenders will review this amount.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Submit",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#6c757d",
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitBorrowerLoanRequest(payload);
      if (response?.status == 200 || response?.status == 201) {
        await Swal.fire({
          title: "Application submitted",
          text: "Your loan application has been submitted. You can continue with funding on the next step.",
          icon: "success",
          confirmButtonText: "Continue to funding",
          confirmButtonColor: "#3085d6",
        });
        setRequestAmount("");
        navigate("/borrowerRequestAmount");
      } else {
        WarningBackendApi(
          "Unable to Submit",
          getApiErrorMessage(
            response,
            "We could not submit your loan request at this time. Please try again.",
          )
        );
      }
    } catch (error) {
      WarningBackendApi(
        "Unable to Submit",
        getApiErrorMessage(
          error,
          "We could not submit your loan request at this time. Please try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
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
                <h3 className="page-title">Create Loan Application</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/borrowerDashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">Create Application</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-12 col-lg-10">
              <div className="card shadow-sm border-0">
                <div className="card-body p-3 p-md-4">
                  <h5 className="mb-2 fw-bold">Loan amount</h5>
                  <p className="text-muted mb-4 small">
                    Enter the amount you wish to borrow. Your application will be
                    shared with eligible lenders for review.
                  </p>

                  <div
                    className="alert alert-info py-3 px-3 mb-3 w-100 fw-semibold text-center"
                    role="alert"
                  >
                    {isEligibleLoading
                      ? "Checking your eligible amount..."
                      : eligibleAmount !== null
                        ? `You are eligible to request up to ₹ ${eligibleAmount}.`
                        : "Eligible amount is currently unavailable. Please refresh and try again."}
                  </div>
                  {eligibleErrorMessage ? (
                    <div
                      className="alert alert-danger py-2 px-3 mb-3"
                      role="alert"
                    >
                      {eligibleErrorMessage}
                    </div>
                  ) : null}
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Requested amount <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        {/* <span className="input-group-text">₹</span> */}
                        <input
                          type="number"
                          className="form-control"
                          min="1"
                          step="0.01"
                          max={
                            eligibleAmount !== null ? eligibleAmount : undefined
                          }
                          value={requestAmount}
                          placeholder={
                            isPartiallyProcessing
                              ? "Pending amount under processing"
                              : "Enter requested amount"
                          }
                          onChange={(event) =>
                            setRequestAmount(event.target.value)
                          }
                          disabled={isFormBlocked}
                          required
                          aria-label="Loan amount"
                        />
                      </div>
                      <small className="form-text text-muted mt-2 d-block">
                        {eligibleAmount !== null
                          ? `Maximum eligible amount: ₹ ${eligibleAmount}`
                          : "Loading your eligibility..."}
                      </small>
                    </div>

                    <div className="d-grid d-md-flex justify-content-md-end mt-4 gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setRequestAmount("")}
                        disabled={isFormBlocked}
                      >
                        Clear
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary px-4"
                        disabled={
                          isSubmitting ||
                          isEligibleLoading ||
                          requestStatusInfo.loading
                        }
                      >
                        {isSubmitting
                          ? "Submitting..."
                          : isFormBlocked
                            ? "Request In Processing"
                            : "Submit Request"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowerLoanRequestCreate;
