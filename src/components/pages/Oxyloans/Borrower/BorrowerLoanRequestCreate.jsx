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
  getCibilBasedRoi,
  getUserDetails,
  getBorrowerReferenceDetails,
  loadlendernomineeDetails,
} from "../../../HttpRequest/afterlogin";
import FeeConfigInfo from "./FeeConfigInfo";
import BorrowerConsentSection, { BORROWER_CONSENTS } from "./BorrowerConsentSection";
import { calculateBorrowerProfileCompleteness } from "../../../../utils/borrowerValidation";

const formatCurrency = (amount) => {
  const numericValue = Number(amount || 0);
  return `₹ ${numericValue.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const normalizeStatus = (status) => {
  return String(status || "").trim().toUpperCase();
};

const normalizeNomineeDetails = (nominee) => {
  if (!nominee || typeof nominee !== "object") return null;

  return {
    ...nominee,
    nomineeName: nominee.nomineeName || nominee.name || "",
    relation: nominee.relation || "",
    nomineeMobile: nominee.nomineeMobile || nominee.mobileNumber || "",
  };
};

const BorrowerLoanRequestCreate = () => {
  const navigate = useNavigate();
  const [requestAmount, setRequestAmount] = useState("");
  const [consentItems, setConsentItems] = useState(new Array(BORROWER_CONSENTS.length).fill(false));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eligibleAmount, setEligibleAmount] = useState({
    amount: null,
    processingFee: 0,
    verifiedMonthlyIncome: 0,
  });
  const [isEligibleLoading, setIsEligibleLoading] = useState(true);
  const [eligibleErrorMessage, setEligibleErrorMessage] = useState("");
  const [requestStatusInfo, setRequestStatusInfo] = useState({
    loading: true,
    status: "",
    pendingAmount: 0,
    message: "",
  });
  const hasShownBlockedAlertRef = useRef(false);
  const [cibilInfo, setCibilInfo] = useState({ loading: true, data: null });
  const [profileCompleteness, setProfileCompleteness] = useState({
    percentage: 100,
    isEligibleToRaiseLoan: true,
    missingRequirements: [],
    loading: true,
  });

  useEffect(() => {
    const checkProfileAndKyc = async () => {
      try {
        const uId = getUserId() || sessionStorage.getItem("userId");
        const [res, refRes, nomineeRes] = await Promise.allSettled([
          getUserDetails(),
          uId ? getBorrowerReferenceDetails(uId) : Promise.resolve(null),
          loadlendernomineeDetails(),
        ]);

        const profileData = res.status === "fulfilled" ? res.value?.data : null;
        const refData = refRes.status === "fulfilled" ? refRes.value?.data : null;
        const nomineeData = normalizeNomineeDetails(
          nomineeRes.status === "fulfilled" ? nomineeRes.value?.data : null
        );

        if (profileData) {
          const comp = calculateBorrowerProfileCompleteness(
            profileData,
            refData || profileData.referenceDetailsResponseDto,
            nomineeData
          );
          setProfileCompleteness({
            percentage: comp.percentage,
            isEligibleToRaiseLoan: comp.isEligibleToRaiseLoan,
            missingRequirements: comp.missingRequirements,
            loading: false,
          });

          if (!comp.isEligibleToRaiseLoan && !hasShownBlockedAlertRef.current) {
            hasShownBlockedAlertRef.current = true;
            Swal.fire({
              icon: "warning",
              title: "Profile Incomplete (90% Required)",
              html: `Your Profile Completeness is currently <strong>${comp.percentage}%</strong>.<br/>You must achieve at least <strong>90% Profile Completeness</strong> before you can raise a loan request.<br/><br/><div style="font-size:13px; text-align:left; background:#f8fafc; padding:12px 16px; border-radius:8px; border:1px solid #e2e8f0;"><strong>Pending items to complete:</strong><br/>• ${comp.missingRequirements.join("<br/>• ")}</div>`,
              confirmButtonText: "Complete Profile Now",
              confirmButtonColor: "#3d5ee1",
              allowOutsideClick: false,
            }).then(() => {
              navigate("/borrowerProfile");
            });
          }
        }
      } catch (err) {
        console.error("Error checking profile requirements:", err);
        setProfileCompleteness((prev) => ({ ...prev, loading: false }));
      }
    };
    checkProfileAndKyc();
  }, [navigate]);

  const borrowerId = getUserId() || "";
  useEffect(() => {
    const fetchCibilRoi = async () => {
      if (!borrowerId) { setCibilInfo({ loading: false, data: null }); return; }
      try {
        const res = await getCibilBasedRoi();
        setCibilInfo({ loading: false, data: res?.status == 200 ? res.data : null });
      } catch {
        setCibilInfo({ loading: false, data: null });
      }
    };
    fetchCibilRoi();
  }, [borrowerId]);

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
          const processingFee = Number(response?.data?.processingfee ?? 0);
          const verifiedMonthlyIncome = Number(
            response?.data?.verifiedMonthlyIncome ?? 0,
          );
          setEligibleAmount({
            amount: Number.isNaN(limitAmount) ? 0 : limitAmount,
            processingFee: Number.isNaN(processingFee) ? 0 : processingFee,
            verifiedMonthlyIncome: Number.isNaN(verifiedMonthlyIncome)
              ? 0
              : verifiedMonthlyIncome,
          });
          setEligibleErrorMessage("");
        } else {
          setEligibleAmount({
            amount: null,
            processingFee: 0,
            verifiedMonthlyIncome: 0,
          });
          setEligibleErrorMessage(
            getApiErrorMessage(
              response,
              "Unable to fetch your eligible amount. Please refresh and try again.",
            ),
          );
        }
      } catch (error) {
        setEligibleAmount({
          amount: null,
          processingFee: 0,
          verifiedMonthlyIncome: 0,
        });
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
          const requestList = Array.isArray(response?.data)
            ? response.data
            : [];
          const latestRequest = requestList.length
            ? [...requestList].sort(
                (a, b) => Number(b?.id || 0) - Number(a?.id || 0),
              )[0]
            : null;

          const latestStatus = normalizeStatus(
            latestRequest?.loanRequestStatus,
          );
          const pendingAmount = Number(
            latestRequest?.partiallyPendingAmount || 0,
          );
          const hasBlockedStatus = !!latestStatus && latestStatus !== "CLOSED";

          setRequestStatusInfo({
            loading: false,
            status: latestStatus,
            pendingAmount: Number.isNaN(pendingAmount) ? 0 : pendingAmount,
            message: hasBlockedStatus
              ? "Your previous loan request is still active. You can raise a fresh request after the current request is closed."
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

  const eligibleAmountValue = eligibleAmount.amount;
  const verifiedMonthlyIncome = Number(
    eligibleAmount.verifiedMonthlyIncome || 0,
  );
  const processingFeePercentage = Number(eligibleAmount.processingFee || 0);
  const eligibleCalculationAmount =
    (verifiedMonthlyIncome * processingFeePercentage) / 100;
  const isPartiallyProcessing =
    requestStatusInfo.status === "PARTIALLYPROCESSING";
  const isFullyProcessing = requestStatusInfo.status === "FULLYPROCESSING";
  const isClosedRequest = requestStatusInfo.status === "CLOSED";
  const isFormBlockedByStatus =
    !!requestStatusInfo.status && requestStatusInfo.status !== "CLOSED";
  
 
    
  const hasEligibilityData =
    !isEligibleLoading && !eligibleErrorMessage && eligibleAmountValue !== null;
  
  const allConsentsChecked = consentItems.every(Boolean);

  const isSubmitDisabled =
    isSubmitting ||
    isEligibleLoading ||
    requestStatusInfo.loading ||
    !!eligibleErrorMessage ||
    !hasEligibilityData ||
    isFormBlockedByStatus ||
    !allConsentsChecked ||
    (!profileCompleteness.loading && !profileCompleteness.isEligibleToRaiseLoan);

  const submitButtonText = isSubmitting
    ? "Submitting..."
    : requestStatusInfo.loading
      ? "Checking request status..."
      : !profileCompleteness.loading && !profileCompleteness.isEligibleToRaiseLoan
        ? `Profile Incomplete (${profileCompleteness.percentage}% / 90%)`
        : isEligibleLoading
          ? "Loading eligibility..."
          : eligibleErrorMessage
            ? "Eligibility required"
            : "Submit Loan Request";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!borrowerId) {
      WarningBackendApi(
        "Session Expired",
        "Your session has expired. Please sign in again to continue.",
      );
      return;
    }

    if (!profileCompleteness.isEligibleToRaiseLoan) {
      Swal.fire({
        icon: "warning",
        title: "Profile Incomplete (90% Required)",
        html: `Your Profile Completeness is currently <strong>${profileCompleteness.percentage}%</strong>.<br/>You must achieve at least <strong>90% Profile Completeness</strong> before you can raise a loan request.<br/><br/><div style="font-size:13px; text-align:left; background:#f8fafc; padding:12px 16px; border-radius:8px; border:1px solid #e2e8f0;"><strong>Pending items to complete:</strong><br/>• ${profileCompleteness.missingRequirements.join("<br/>• ")}</div>`,
        confirmButtonText: "Complete Profile Now",
        confirmButtonColor: "#3d5ee1",
        showCancelButton: true,
        cancelButtonText: "Close",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/borrowerProfile");
        }
      });
      return;
    }

    if (isFormBlockedByStatus) {
      WarningBackendApi(
        "Request Not Allowed",
        "You already have a loan request in progress. You can submit a new request only after it is closed.",
      );
      return;
    }

    if (!allConsentsChecked) {
      WarningBackendApi(
        "Consent Required",
        "Please read and acknowledge all 8 consent items before submitting your loan request.",
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

    if (
      eligibleAmountValue !== null &&
      normalizedAmount > eligibleAmountValue
    ) {
      WarningBackendApi(
        "Amount Exceeds Your Limit",
        `Your maximum eligible amount is ${formatCurrency(eligibleAmountValue)}. Please request an amount within your limit.`,
      );
      return;
    }

    const payload = {
      borrowerId: Number(borrowerId),
      requestAmount: normalizedAmount,
    };

    const confirmation = await Swal.fire({
      title: " Confirm Your Loan Request",
      text: `You are requesting a loan amount of ₹ ${normalizedAmount}. This request will be shared with nearby lenders for review.This is a pure P2P platform; we are not responsible for lender response. You may receive loan offers based on your profile.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm & Continue",
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
          title: "🎉 Congratulations! Your Loan Request is Submitted",
          text: " Nearby lenders will review your request and send you offers soon.",
          icon: "success",
          confirmButtonText: "View Loan Status",
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
          ),
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
                <h3 className="page-title">Apply for a Loan </h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/borrowerDashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">Apply for a Loan </li>
                </ul>
              </div>
            </div>
            <span className="text-muted">
              Request loan from trusted lenders near you
            </span>
          </div>

          {/* 5 Summary Cards Row */}
          <div
            className="mb-4"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
            }}
          >
            <div
              style={{
                background: "#eef4ff",
                borderLeft: "3px solid #1a56db",
                borderRadius: 8,
                padding: "12px 16px",
              }}
            >
              <div className="text-muted small mb-1">Monthly Income</div>
              <div className="fw-bold fs-5" style={{ color: "#1a3c6e" }}>
                {isEligibleLoading
                  ? "Loading..."
                  : formatCurrency(verifiedMonthlyIncome)}
              </div>
            </div>
            <div
              style={{
                background: "#f3eeff",
                borderLeft: "3px solid #6f42c1",
                borderRadius: 8,
                padding: "12px 16px",
              }}
            >
              <div className="text-muted small mb-1">Fixed Obligation to Income Ratio</div>
              <div className="fw-bold fs-5" style={{ color: "#3d1a7a" }}>
                {isEligibleLoading
                  ? "Loading..."
                  : `${processingFeePercentage}%`}
              </div>
            </div>
            <div
              style={{
                background: "#edfaf3",
                borderLeft: "3px solid #198754",
                borderRadius: 8,
                padding: "12px 16px",
              }}
            >
              <div className="text-muted small mb-1">Eligible Loan Amount</div>
              <div className="fw-bold fs-5 text-primary">
                {isEligibleLoading
                  ? "Loading..."
                  : formatCurrency(eligibleCalculationAmount)}
              </div>
              {!isEligibleLoading ? (
                <div className="small text-muted mt-1">
                  Based on {formatCurrency(verifiedMonthlyIncome)} x{" "}
                  {processingFeePercentage}% ={" "}
                  {formatCurrency(eligibleCalculationAmount)}
                </div>
              ) : null}
            </div>
            <div
              style={{
                background: "#e6faf6",
                borderLeft: "3px solid #0d9e78",
                borderRadius: 8,
                padding: "12px 16px",
              }}
            >
              <div className="text-muted small mb-1">CIBIL Score</div>
              <div className="fw-bold fs-5 text-success">
                {cibilInfo.loading
                  ? "Loading..."
                  : (cibilInfo.data?.cibilScore ?? "--")}
              </div>
            </div>
            <div
              style={{
                background: "#fff4e6",
                borderLeft: "3px solid #fd7e14",
                borderRadius: 8,
                padding: "12px 16px",
              }}
            >
              <div className="text-muted small mb-1">
                Applicable Interest Rate
              </div>
              <div className="fw-bold fs-5 text-primary">
                {cibilInfo.loading
                  ? "Loading..."
                  : cibilInfo.data?.roi != null
                    ? `${cibilInfo.data.roi}%`
                    : "--"}
              </div>
            </div>
          </div>

          {/* Fee Configuration Info */}
          <FeeConfigInfo />

          {/* Profile Completeness Warning Banner (< 90%) */}
          {!profileCompleteness.loading && !profileCompleteness.isEligibleToRaiseLoan && (
            <div className="alert alert-warning border border-warning-subtle rounded-3 p-4 mb-4 shadow-sm bg-warning bg-opacity-10">
              <div className="d-flex align-items-start gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: "46px", height: "46px", backgroundColor: "#fef3c7", color: "#d97706" }}
                >
                  <i className="fa-solid fa-triangle-exclamation fs-5"></i>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-1">
                    <h5 className="fw-bold text-dark mb-0">
                      Profile Completeness: {profileCompleteness.percentage}% (90% Required)
                    </h5>
                    <span className="badge bg-warning text-dark px-3 py-1 rounded-pill fw-bold">
                      {profileCompleteness.percentage}% / 90%
                    </span>
                  </div>
                  <p className="text-muted small mb-2" style={{ lineHeight: "1.5" }}>
                    You cannot raise a loan request until your profile reaches at least <strong>90% Profile Completeness</strong>. Please complete the remaining mandatory profile sections to unlock loan requests.
                  </p>
                  <div className="progress mb-3" style={{ height: "8px", maxWidth: "340px", borderRadius: "10px" }}>
                    <div
                      className="progress-bar bg-warning rounded-pill"
                      role="progressbar"
                      style={{ width: `${profileCompleteness.percentage}%` }}
                    />
                  </div>
                  {profileCompleteness.missingRequirements?.length > 0 && (
                    <div className="small text-secondary mb-3">
                      <strong>Pending Profile Sections: </strong>
                      {profileCompleteness.missingRequirements.join(", ")}
                    </div>
                  )}
                  <button
                    type="button"
                    className="btn btn-warning btn-sm fw-bold px-3 py-2 rounded-pill shadow-sm"
                    onClick={() => navigate("/borrowerProfile")}
                  >
                    <i className="fa-solid fa-user-pen me-1"></i> Complete Profile Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {eligibleErrorMessage ? (
            <div className="row">
              <div className="col-12">
                <div
                  className="rounded-3 p-5 text-center"
                  style={{
                    background: "#fff5f5",
                    border: "1.5px solid #f5c6cb",
                  }}
                >
                  <div style={{ fontSize: 42, marginBottom: 12 }}>⚠️</div>
                  <h4
                    className="fw-bold mb-2"
                    style={{ color: "#721c24" }}
                  >
                    Verification Required / Pending
                  </h4>
                  <p className="text-muted mb-4 mx-auto" style={{ fontSize: 14, maxWidth: 500, lineHeight: "1.6" }}>
                    {eligibleErrorMessage}
                  </p>
                  <button
                    type="button"
                    className="btn btn-danger px-4 py-2 fw-semibold"
                    onClick={() => navigate("/borrowerProfile")}
                  >
                    Go to Borrower Profile
                  </button>
                </div>
              </div>
            </div>
          ) : isFormBlockedByStatus ? (
            <div className="row">
              <div className="col-12">
                <div
                  className="rounded-3 p-4 text-center"
                  style={{
                    background: "#f0f6ff",
                    border: "1.5px solid #b8d4f8",
                  }}
                >
                  <div style={{ fontSize: 38, marginBottom: 8 }}>⏳</div>
                  <div
                    className="fw-bold mb-1"
                    style={{ fontSize: 15, color: "#1a3c6e" }}
                  >
                    Your loan request has been successfully shared with lenders.
                  </div>
                  <div className="text-muted mb-3" style={{ fontSize: 13 }}>
                    Lenders will review your request and provide loan offers
                    shortly.
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary px-4"
                    onClick={() => navigate("/borrowerLoansInitiated")}
                  >
                    View Offers
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="col-12">
                <div className="card shadow-sm border-0">
                  <div className="card-body p-3 p-md-4">
                    <h5 className="mb-2 fw-bold">Loan Amount Details</h5>
                    <p className="text-muted mb-4 small">
                      Enter the amount you would like to borrow. Your request
                      will be shared with eligible lenders for review.
                    </p>

                    {requestStatusInfo.loading ? (
                      <div
                        className="alert alert-info py-2 px-3 mb-3"
                        role="status"
                      >
                        Checking whether you already have an active loan
                        request...
                      </div>
                    ) : null}

                    {eligibleErrorMessage ? (
                      <div
                        className="alert alert-danger py-2 px-3 mb-3"
                        role="alert"
                      >
                        {eligibleErrorMessage}
                      </div>
                    ) : null}

                    {hasEligibilityData ? (
                      <div
                        className="alert alert-success mt-3 d-flex justify-content-center align-items-center text-center"
                        role="alert"
                      >
                        <div className="fs-6 fw-semibold mb-0">
                          Based on your profile, you are eligible to request up
                          to {formatCurrency(eligibleAmountValue)}.
                        </div>
                      </div>
                    ) : null}

                    {isClosedRequest ? (
                      <div
                        className="alert alert-info py-2 px-3 mb-3"
                        role="alert"
                      >
                        Your previous request is closed. You can enter a new
                        loan amount and submit a fresh request.
                      </div>
                    ) : null}

                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label fw-semibold">
                          Enter Loan Required Amount
                          <span className="text-danger">*</span>
                        </label>

                        {eligibleErrorMessage ? (
                          <div
                            className="alert alert-warning py-2 px-3 mb-2 small"
                            role="alert"
                          >
                            ⚠️ Please resolve the eligibility issue before
                            submitting.
                          </div>
                        ) : null}

                        <div className="input-group">
                          <input
                            type="number"
                            className="form-control"
                            min="1"
                            step="0.01"
                            max={
                              eligibleAmountValue !== null
                                ? eligibleAmountValue
                                : undefined
                            }
                            value={requestAmount}
                            placeholder="Enter the amount you wish to borrow"
                            onChange={(event) =>
                              setRequestAmount(event.target.value)
                            }
                            required
                            disabled={isFormBlockedByStatus}
                            aria-label="Loan amount"
                          />
                        </div>

                        <small className="form-text text-muted mt-2 d-block">
                          {eligibleAmountValue !== null
                            ? `Maximum eligible loan amount: ${formatCurrency(eligibleAmountValue)}`
                            : "Loading your eligibility..."}
                        </small>
                      </div>

                      {/* 8-Point Borrower Consent Section */}
                      <BorrowerConsentSection
                        consentItems={consentItems}
                        onChange={(updated) => setConsentItems(updated)}
                      />

                      <div className="d-grid d-md-flex justify-content-md-end mt-4 gap-2">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setRequestAmount("");
                            setConsentItems(new Array(BORROWER_CONSENTS.length).fill(false));
                          }}
                          disabled={isFormBlockedByStatus}
                        >
                          Reset
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary px-4"
                          disabled={isSubmitDisabled}
                        >
                          {submitButtonText}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BorrowerLoanRequestCreate;
