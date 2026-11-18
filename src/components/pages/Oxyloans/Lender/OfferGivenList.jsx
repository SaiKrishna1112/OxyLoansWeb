import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Modal } from "antd";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import {
  aggrementGenerationforLenderSide,
  brLoanStatusApprovalByLr,
  getOfferGivenList,
  loanAmountApproval,
  completeEsign,
  getUserDetails,
  lenderBorrowerEsign,
  completeCashfreeEsign,
} from "../../../HttpRequest/afterlogin";
import Swal from "sweetalert2";
import { personalDetails } from "../../Base UI Elements/SweetAlert";

const PRIMARY   = "#3d5ee1";
const PAGE_SIZE = 10;

const STATUS_STYLES = {
  PENDING:   { bg: "#fff8e1", color: "#b45309" },
  INITIATED: { bg: "#e8f0ff", color: "#3d5ee1" },
  ACCEPTED:  { bg: "#e8f5e9", color: "#1a7a4a" },
  REJECTED:  { bg: "#fdecea", color: "#c0392b" },
  EXPIRED:   { bg: "#f0f0f0", color: "#6c757d" },
};
const statusStyle = (s = "") => STATUS_STYLES[(s || "").toUpperCase()] || STATUS_STYLES.EXPIRED;
const getApiErrorMessage = (responseOrError) =>
  responseOrError?.response?.data?.errorMessage ||
  responseOrError?.response?.data?.message ||
  responseOrError?.data?.errorMessage ||
  responseOrError?.data?.message ||
  "Could not generate agreement.";

const OfferGivenList = () => {
  const [offers, setOffers]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount]   = useState(0);

  // confirm modal state
  const [confirmModal, setConfirmModal] = useState(null); // { offer, action: "LOANACCEPTED"|"LENDER_REJECTED" }
  const [actionLoading, setActionLoading] = useState(false);
  const [agreementLoadingById, setAgreementLoadingById] = useState({});
  const [esignLoadingById, setEsignLoadingById] = useState({});

  // Cashfree eSign modal state
  const [esignModal, setEsignModal] = useState({
    open: false,
    offer: null,
    step: "review", // "review" | "redirect" | "success"
    aadhaarNumber: "",
    agreed: true,
    redirectUrl: "",
    loading: false,
    error: "",
  });

  useEffect(() => { fetchOffers(1); }, []);
  useEffect(() => { fetchOffers(currentPage); }, [currentPage]);

  const fetchOffers = async (page) => {
    setLoading(true);
    try {
      const res  = await getOfferGivenList(page, PAGE_SIZE);
      const data = Array.isArray(res?.data) ? res.data : res?.data?.loanRequests || res?.data?.loans || res?.data?.data || [];
      setOffers(Array.isArray(data) ? data : []);
      const total = res?.data?.totalCount ?? res?.data?.totalElements ?? res?.data?.total ?? (Array.isArray(data) ? data.length : 0);
      setTotalCount(total);
    } catch {
      setOffers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAgreement = async (offer) => {
    const rowId = String(offer?.id ?? "");
    if (!rowId) return;

    setAgreementLoadingById((prev) => ({ ...prev, [rowId]: true }));
    try {
      // Execute esign API before generating the agreement
      if (offer?.loanRequestId) {
        await completeEsign(offer.loanRequestId, offer?.id);
      }
      
      const response = await aggrementGenerationforLenderSide({
        lenderId: Number(offer?.lenderId),
        loanId: Number(offer?.loanRequestId),
        id: Number(offer?.id),
      });
      const status = response?.status ?? response?.response?.status;
      if (!response || status >= 400) {
        throw response;
      }
      await Swal.fire({
        icon: "success",
        title: "Agreement Generated Successfully",
        text: "The loan agreement is now ready for your review. ",
        confirmButtonColor: PRIMARY,
      });
      fetchOffers(currentPage);
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Failed",
        text: getApiErrorMessage(error),
        confirmButtonColor: PRIMARY,
      });
    } finally {
      setAgreementLoadingById((prev) => ({ ...prev, [rowId]: false }));
    }
  };

  const handleOpenEsignModal = async (offer) => {
    let prefilledAadhar = "";
    try {
      const userDetailsRes = await getUserDetails();
      if (userDetailsRes?.status === 200 || userDetailsRes?.data) {
        prefilledAadhar =
          userDetailsRes.data?.aadharNumber ||
          userDetailsRes.data?.aadhaarNumber ||
          "";
      }
    } catch (err) {
      console.warn("Aadhaar pre-fill notice:", err);
    }

    setEsignModal({
      open: true,
      offer,
      step: "review",
      aadhaarNumber: prefilledAadhar,
      agreed: true,
      redirectUrl: "",
      loading: false,
      error: "",
    });
  };

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
        error: "Please enter a valid 12-digit Aadhaar number (at least 4 digits required).",
      }));
      return;
    }

    setEsignModal((prev) => ({ ...prev, loading: true, error: "" }));

    const offer = esignModal.offer;
    const loanReqId = offer?.loanRequestId || offer?.id;
    const assignmentId = offer?.id;
    const targetUrl = assignmentId
      ? `${window.location.origin}/lender_esign/${loanReqId}/${assignmentId}`
      : `${window.location.origin}/lender_esign/${loanReqId}`;

    try {
      const res = await lenderBorrowerEsign(
        loanReqId,
        esignModal.aadhaarNumber,
        assignmentId,
        targetUrl
      );

      const data = res?.data;
      if (data && (data.redirect_url || data.redirectUrl)) {
        const url = data.redirect_url || data.redirectUrl;
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

        window.open(url, "_blank");
      } else if (res?.status === 200 || res?.request?.status === 200) {
        setEsignModal((prev) => ({ ...prev, loading: false, step: "success" }));
        fetchOffers(currentPage);
      } else {
        const msg =
          res?.data?.message ||
          res?.data?.errorMessage ||
          "Failed to initiate Cashfree eSign session. Please try again.";
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

  const handleVerifyEsignCompletion = async () => {
    setEsignModal((prev) => ({ ...prev, loading: true, error: "" }));
    const offer = esignModal.offer;
    const loanReqId = offer?.loanRequestId || offer?.id;
    const assignmentId = offer?.id;

    try {
      const res = await completeCashfreeEsign(loanReqId, assignmentId);
      if (res?.status === 200 || res?.data) {
        setEsignModal((prev) => ({ ...prev, loading: false, step: "success" }));
        await Swal.fire({
          icon: "success",
          title: "eSign Verified",
          text: "Lender digital signature has been recorded successfully!",
          confirmButtonColor: PRIMARY,
        });
        fetchOffers(currentPage);
      } else {
        setEsignModal((prev) => ({
          ...prev,
          loading: false,
          error:
            "Verification pending. Please ensure you have completed the eSign in the opened window.",
        }));
      }
    } catch (err) {
      fetchOffers(currentPage);
      const msg =
        err?.response?.data?.errorMessage ||
        err?.response?.data?.message ||
        "Verification pending. Please ensure you have completed the eSign in Cashfree.";
      setEsignModal((prev) => ({ ...prev, loading: false, error: msg }));
    }
  };

  const handleEsignAction = (offer) => {
    handleOpenEsignModal(offer);
  };

  const handleAction = async () => {
  if (!confirmModal) return;

  const { offer, action } = confirmModal;
  setActionLoading(true);

  try {
    let res;

    if (action === "LOANPROCESSED") {
      res = await loanAmountApproval(
        offer.loanRequestId,
        offer.id
      );
      console.log("Processing loan for offer:", offer);
    } else {
      res = await brLoanStatusApprovalByLr(offer.id, action,offer.loanRequestId);
    }
    
    const status = res?.status || res?.response?.status;
    console.log("API response for action", action, ":", res);
    if (!res || status >= 400) {
      throw new Error(`API Error: ${status}`);
    }

    // ✅ Clean message mapping
    const actionMap = {
      LOANACCEPTED: {
        title: "Funding Confirmed!",
        text: "Your confirmation has been received. Once the borrower agrees to execute the loan, you will be navigated to the agreement and loan disbursement process.",
        icon: "success",
      },
      LENDER_REJECTED: {
        title: "Offer Rejected",
        text: "The offer has been rejected successfully.",
        icon: "info",
      },
      LOANPROCESSED: {
        title: "🎉 Congratulations!",
        text: "The loan has been successfully disbursed to the borrower in accordance with the agreed terms. You can track this loan and its repayment details in your loan offers.",
        icon: "success",
      },
    };

    const config = actionMap[action] || {
      title: "🎉 Congratulations!",
      text: "The loan has been funded successfully in accordance with the agreed terms.",
      icon: "success",
    };

    await Swal.fire({
      icon: config.icon,
      title: config.title,
      text: config.text,
      confirmButtonText: "OK",
      confirmButtonColor: PRIMARY,
    });

    // ✅ Single place for cleanup
    setConfirmModal(null);
    fetchOffers(currentPage);

  } catch (error) {
    console.error("Action failed:", error);

    await Swal.fire({
      icon: "error",
      title: "Failed",
      text:
        action === "LOANPROCESSED"
          ? "Could not process loan. Please check your wallet balance."
          : "Could not update offer status. Please try again.",
      confirmButtonColor: PRIMARY,
    });

    setConfirmModal(null);
  } finally {
    setActionLoading(false);
  }
};

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const pageNumbers = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  };

  return (
    <div className="main-wrapper">
      <Header />
      <SideBar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">My Loan Offers</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">My Loan Offers</li>
                </ul>
              </div>
            </div>
            <span className="text-muted">
              View & Manage your loan offers and track their status.
            </span>
            <div className="col-auto d-flex justify-content-end mt-2">
              <Link
                to="/proximityLoans"
                className="btn"
                style={{
                  background: PRIMARY,
                  color: "#fff",
                  fontWeight: 600,
                  borderRadius: 8,
                  padding: "8px 20px",
                }}
              >
                <i className="fa fa-plus me-1" /> New Offer
              </Link>
            </div>
          </div>

          {/* Summary Cards */}
          {!loading && totalCount > 0 && (
            <div className="row mb-3 g-3">
              {[
                {
                  label: "Total Offers",
                  value: totalCount,
                  icon: "fa-paper-plane",
                },
                {
                  label: "Initiated",
                  value: offers.filter(
                    (o) => (o.lenderStatus || "").toUpperCase() === "INITIATED",
                  ).length,
                  icon: "fa-clock-o",
                },
                {
                  label: "Accepted",
                  value: offers.filter(
                    (o) =>
                      (o.lenderStatus || "").toUpperCase() === "LOANACCEPTED" ||
                      (o.borrowerStatus || "").toUpperCase() === "LOANACCEPTED",
                  ).length,
                  icon: "fa-check-circle",
                },
                {
                  label: "Rejected",
                  value: offers.filter(
                    (o) =>
                      (o.lenderStatus || "").toUpperCase() ===
                        "LENDER_REJECTED" ||
                      (o.borrowerStatus || "").toUpperCase() ===
                        "BORROWER_REJECTED",
                  ).length,
                  icon: "fa-times-circle",
                },
              ].map(({ label, value, icon }) => (
                <div className="col-6 col-md-3" key={label}>
                  <div
                    className="card mb-0"
                    style={{ borderLeft: `4px solid ${PRIMARY}` }}
                  >
                    <div className="card-body py-3 d-flex align-items-center gap-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{
                          width: 44,
                          height: 44,
                          background: "#eef1fd",
                          flexShrink: 0,
                        }}
                      >
                        <i
                          className={`fa ${icon}`}
                          style={{ color: PRIMARY, fontSize: 18 }}
                        />
                      </div>
                      <div>
                        <div
                          className="fw-bold"
                          style={{ fontSize: 20, lineHeight: 1 }}
                        >
                          {value}
                        </div>
                        <small className="text-muted">{label}</small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table Card */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between py-3">
              <h5 className="mb-0 fw-bold">Offer Given List</h5>
              {totalCount > 0 && (
                <small className="text-muted">
                  Total <strong>{totalCount}</strong> offer
                  {totalCount !== 1 ? "s" : ""}
                </small>
              )}
            </div>

            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" style={{ color: PRIMARY }} />
                  <p className="mt-2 text-muted">Loading offers...</p>
                </div>
              ) : offers.length === 0 ? (
                <div className="text-center py-5">
                  <i
                    className="fa fa-paper-plane fa-3x mb-3"
                    style={{ color: "#d0d5dd" }}
                  />
                  <p className="text-muted mb-1">
                    {" "}
                    You have not submitted any loan offers yet. Explore borrower
                    requests and submit your first offer to get started.{" "}
                  </p>
                  <Link
                    to="/proximityLoans"
                    className="btn btn-sm mt-2"
                    style={{
                      background: PRIMARY,
                      color: "#fff",
                      borderRadius: 6,
                    }}
                  >
                    Browse Borrowers
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table
                    className="table table-hover align-middle mb-0"
                    style={{ fontSize: 13 }}
                  >
                    <thead style={{ background: "#f5f7fb" }}>
                      <tr>
                        <th
                          className="ps-4 py-3 text-uppercase text-muted"
                          style={{ fontSize: 11, letterSpacing: 0.5 }}
                        >
                          #
                        </th>
                        <th
                          className="py-3 text-uppercase text-muted"
                          style={{ fontSize: 11, letterSpacing: 0.5 }}
                        >
                          Borrower
                        </th>
                        <th
                          className="py-3 text-uppercase text-muted"
                          style={{ fontSize: 11, letterSpacing: 0.5 }}
                        >
                          Offer Amount
                        </th>
                        <th
                          className="py-3 text-uppercase text-muted"
                          style={{ fontSize: 11, letterSpacing: 0.5 }}
                        >
                          Tenure
                        </th>
                        <th
                          className="py-3 text-uppercase text-muted"
                          style={{ fontSize: 11, letterSpacing: 0.5 }}
                        >
                          ROI (%)
                        </th>
                        <th
                          className="py-3 text-uppercase text-muted"
                          style={{ fontSize: 11, letterSpacing: 0.5 }}
                        >
                          Repayment Method
                        </th>
                        <th
                          className="py-3 text-uppercase text-muted"
                          style={{ fontSize: 11, letterSpacing: 0.5 }}
                        >
                          Status
                        </th>
                        <th
                          className="py-3 text-uppercase text-muted"
                          style={{ fontSize: 11, letterSpacing: 0.5 }}
                        >
                          Progress
                        </th>
                        <th
                          className="text-center py-3 text-uppercase text-muted"
                          style={{ fontSize: 11, letterSpacing: 0.5 }}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {offers.map((offer, idx) => {
                        const lenderStatus = (
                          offer.lenderStatus || ""
                        ).toUpperCase();
                        const borrowerStatus = (
                          offer.borrowerStatus || ""
                        ).toUpperCase();
                        const status =
                          lenderStatus === "INITIATED"
                            ? "INITIATED"
                            : lenderStatus === "PROCESSING"
                              ? "Processing"
                              : lenderStatus === "LOANACCEPTED"
                                ? "Loan_Accepted"
                                : lenderStatus;
                        const isLoanAcceptedStatus = status === "Loan_Accepted" || lenderStatus === "LOANACCEPTED";
                        const { bg, color } = statusStyle(status);
                        const isInitiated = lenderStatus === "INITIATED";
                        const canAccept =
                          isInitiated && borrowerStatus === "LOANACCEPTED";
                        const serialNo =
                          (currentPage - 1) * PAGE_SIZE + idx + 1;
                        const canProcess =
                          lenderStatus === "PROCESSING" &&
                          borrowerStatus === "PROCESSING";
                        const walletDebited =
                          (offer.walletStatus || "").toUpperCase() ===
                          "DEBITED";
                        const hasLenderAgreement = offer?.lenderAgrrement !== null && offer?.lenderAgrrement !== undefined && offer?.lenderAgrrement !== "";
                        const rowId = String(offer?.id ?? "");
                        const isAgreementLoading = Boolean(
                          agreementLoadingById[rowId],
                        );
                        return (
                          <tr key={offer.id || offer.offerId || idx}>
                            <td className="ps-4 text-muted py-3">{serialNo}</td>

                            {/* Borrower */}
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="d-flex align-items-center justify-content-center rounded-circle"
                                  style={{
                                    width: 34,
                                    height: 34,
                                    background: "#eef1fd",
                                    flexShrink: 0,
                                  }}
                                >
                                  <i
                                    className="fa fa-user"
                                    style={{ color: PRIMARY, fontSize: 14 }}
                                  />
                                </div>
                                <div>
                                  <div
                                    className="fw-semibold"
                                    style={{ lineHeight: 1.2 }}
                                  >
                                    {offer.borrowerName ||
                                      offer.firstName ||
                                      "—"}
                                  </div>
                                  <small className="text-muted">
                                    {offer.borrowerId ? `••••${String(offer.borrowerId).slice(-2)}` : ""}
                                  </small>
                                </div>
                              </div>
                            </td>

                            <td className="fw-semibold py-3">
                              ₹
                              {Number(
                                offer.lenderInterestedAmount ||
                                  offer.offerAmount ||
                                  0,
                              ).toLocaleString("en-IN")}
                            </td>
                            <td className="py-3">
                              {offer.duration
                                ? `${offer.duration} ${offer.durationType || "Days"}`
                                : "—"}
                            </td>
                            <td className="py-3">
                              {offer.roi ? `${offer.roi}%` : "—"}
                            </td>
                            <td className="py-3 fw-semibold text-dark">
                              {offer.repaymentMethodForLender == "PI"
                                ? "Principal + Interest"
                                : "Only Interest"}
                            </td>
                            {/* <td className="text-muted">{offer.offerDate || offer.createdDate || offer.offeredOn || "—"}</td> */}

                            {/* Status badge */}
                            <td className="py-3">
                              <span
                                className="rounded-pill px-3 py-1"
                                style={{
                                  background: bg,
                                  color,
                                  fontWeight: 600,
                                  fontSize: 11,
                                }}
                              >
                                {status}
                              </span>
                            </td>
                            <td className="py-3">
                              {hasLenderAgreement ? (
                                <a
                                  href={offer.lenderAgrrement}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-sm"
                                  style={{
                                    background: "#198754",
                                    color: "#fff",
                                    fontSize: 11,
                                    borderRadius: 6,
                                    padding: "4px 10px",
                                  }}
                                >
                                  <i className="fa fa-check-circle me-1" />
                                  Agreement Generated
                                </a>
                              ) : walletDebited ? (
                                <button
                                  className="btn btn-sm"
                                  style={{
                                    background: "#0d6efd",
                                    color: "#fff",
                                    borderRadius: 6,
                                    fontSize: 11,
                                    padding: "4px 10px",
                                  }}
                                  onClick={() => handleGenerateAgreement(offer)}
                                  disabled={isAgreementLoading}
                                >
                                  {isAgreementLoading ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-1" />
                                      Generating...
                                    </>
                                  ) : (
                                    <>
                                      <i className="fa fa-file-text-o me-1" />
                                      Generate Agreement
                                    </>
                                  )}
                                </button>
                              ) : offer.loanStatus === "REJECTED" ? (
                                <small className="text-muted">
                                  { offer.lenderStatus === "LENDER_REJECTED"
                                      ? "The lender has rejected this loan request."
                                      : offer.borrowerStatus === "BORROWER_REJECTED"
                                      ? "The borrower has rejected this loan offer."
                                      : ""}
                                </small>
                              ):(
                                <small className="text-muted">Pending</small>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="text-center py-3">
                              <div className="d-flex align-items-center justify-content-center gap-2">
                                {canAccept && (
                                  <button
                                    className="btn btn-sm"
                                    title="Accept"
                                    style={{
                                      background: "#198754",
                                      color: "#fff",
                                      borderRadius: 6,
                                      padding: "4px 10px",
                                      fontSize: 12,
                                    }}
                                    onClick={() =>
                                      setConfirmModal({
                                        offer,
                                        action: "LOANACCEPTED",
                                      })
                                    }
                                  >
                                    <i className="fa fa-check me-1" /> Accept
                                  </button>
                                )}
                                {isInitiated && (
                                  <button
                                    className="btn btn-sm"
                                    title="Reject"
                                    style={{
                                      background: "#dc3545",
                                      color: "#fff",
                                      borderRadius: 6,
                                      padding: "4px 10px",
                                      fontSize: 12,
                                    }}
                                    onClick={() =>
                                      setConfirmModal({
                                        offer,
                                        action: "LENDER_REJECTED",
                                      })
                                    }
                                  >
                                    <i className="fa fa-times me-1" /> Reject
                                  </button>
                                )}
                                {/* {canProcess && (
                                  <button
                                    className="btn btn-sm"
                                    title="Accept"
                                    style={{
                                      background: "#0d6efd",
                                      color: "#fff",
                                      borderRadius: 6,
                                      padding: "4px 10px",
                                      fontSize: 12,
                                    }}
                                    onClick={() =>
                                      setConfirmModal({
                                        offer,
                                        action: "LOANPROCESSED",
                                      })
                                    }
                                  >
                                    <i className="fa fa-check me-1" /> Process &
                                    Disburse Loan
                                  </button>
                                )} */}
                                {isLoanAcceptedStatus && (
                                  <div className="d-flex align-items-center gap-1.5 flex-wrap justify-content-center">
                                    {offer.lenderEsigned ? (
                                      <span className="badge bg-success-subtle text-success p-2 small fw-semibold">
                                        <i className="fa-solid fa-circle-check me-1"></i> eSigned
                                      </span>
                                    ) : (
                                      <>
                                        <Link
                                          to={`/lender_esign/${offer.loanRequestId || offer.id}?assignmentId=${offer.id}`}
                                          className="btn btn-sm btn-warning text-dark fw-bold d-inline-flex align-items-center gap-1"
                                          title="Proceed to Aadhaar eSign via Cashfree"
                                          style={{ borderRadius: 6, padding: "4px 10px", fontSize: 12 }}
                                        >
                                          <i className="fa-solid fa-signature"></i>
                                          <span>eSign Agreement</span>
                                        </Link>

                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-warning text-dark fw-semibold d-inline-flex align-items-center gap-1"
                                          onClick={() => handleOpenEsignModal(offer)}
                                          title="Quick Cashfree eSign Gateway Modal"
                                          style={{ borderRadius: 6, padding: "4px 10px", fontSize: 12 }}
                                        >
                                          <i className="fa-solid fa-bolt text-warning"></i>
                                          <span>Quick Sign</span>
                                        </button>
                                      </>
                                    )}
                                  </div>
                                )}
                                {canProcess && (
                                  <div
                                      style={{
                                        backgroundColor: "#FFF3CD",
                                        color: "#856404",
                                        padding: "12px 16px",
                                        border: "1px solid #FFE69C",
                                        borderRadius: "8px",
                                        fontWeight: "600",
                                        textAlign: "center",
                                      }}
                                    >
                                      🚀 Disbursal is in progress.
                                    </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="card-footer d-flex align-items-center justify-content-between flex-wrap gap-2">
                <small className="text-muted">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, totalCount)} of{" "}
                  <strong>{totalCount}</strong> offers
                </small>
                <ul className="pagination mb-0">
                  <li
                    className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => goToPage(1)}
                      title="First"
                    >
                      <i className="fa fa-angle-double-left" />
                    </button>
                  </li>
                  <li
                    className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => goToPage(currentPage - 1)}
                      title="Previous"
                    >
                      <i className="fa fa-chevron-left" />
                    </button>
                  </li>
                  {pageNumbers().map((page, i) =>
                    page === "..." ? (
                      <li key={`e-${i}`} className="page-item disabled">
                        <span className="page-link">&hellip;</span>
                      </li>
                    ) : (
                      <li
                        key={page}
                        className={`page-item ${currentPage === page ? "active" : ""}`}
                      >
                        <button
                          className="page-link"
                          style={
                            currentPage === page
                              ? {
                                  background: PRIMARY,
                                  borderColor: PRIMARY,
                                  color: "#fff",
                                }
                              : {}
                          }
                          onClick={() => goToPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ),
                  )}
                  <li
                    className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => goToPage(currentPage + 1)}
                      title="Next"
                    >
                      <i className="fa fa-chevron-right" />
                    </button>
                  </li>
                  <li
                    className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => goToPage(totalPages)}
                      title="Last"
                    >
                      <i className="fa fa-angle-double-right" />
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accept / Reject Confirmation Modal */}
      {confirmModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => !actionLoading && setConfirmModal(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              width: "100%",
              maxWidth: 420,
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background:
                  confirmModal.action === "LOANACCEPTED" ||
                  confirmModal.action === "LOANPROCESSED"
                    ? "#1a7a4a"
                    : "#c0392b",
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h5 className="mb-0 text-white" style={{ fontWeight: 600 }}>
                <i
                  className={`fa ${confirmModal.action === "LOANACCEPTED" ? "fa-check-circle" : confirmModal.action === "LOANPROCESSED" ? "fa-cogs" : "fa-times-circle"} me-2`}
                />
                {confirmModal.action === "LOANACCEPTED"
                  ? "Confirm Loan Funding"
                  : confirmModal.action === "LOANPROCESSED"
                    ? "Process & Disburse Loan"
                    : "Reject Offer"}
              </h5>
              <button
                className="btn btn-sm"
                style={{
                  color: "#fff",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.4)",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 16,
                }}
                onClick={() => setConfirmModal(null)}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "20px 24px" }}>
              <p className="mb-3" style={{ fontSize: 14 }}>
               <strong>
                  {confirmModal.offer.borrowerName ||
                    confirmModal.offer.firstName ||
                    "this borrower"}
                </strong>
                <strong>
                  {confirmModal.action === "LOANACCEPTED"
                    ? "has accepted your loan offer. Are you ready to proceed with funding this loan?"
                    : confirmModal.action === "LOANPROCESSED"
                      ? "Are you sure you want to process and disburse this loan?"
                      : "Are you sure you want to reject this offer?"}
                </strong>{" "}
              </p>
              <div
                className="rounded p-3 mb-0"
                style={{ background: "#f8f9fb", fontSize: 13 }}
              >
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Offer Amount</span>
                  <strong>
                    ₹
                    {Number(
                      confirmModal.offer.lenderInterestedAmount ||
                        confirmModal.offer.offerAmount ||
                        0,
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Duration</span>
                  <strong>
                    {confirmModal.offer.duration
                      ? `${confirmModal.offer.duration} ${confirmModal.offer.durationType || "Days"}`
                      : "—"}
                  </strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">ROI</span>
                  <strong>
                    {confirmModal.offer.roi
                      ? `${confirmModal.offer.roi}%`
                      : "—"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "0 24px 20px", display: "flex", gap: 10 }}>
              <button
                className="btn"
                style={{
                  background:
                    confirmModal.action === "LOANACCEPTED" ||
                    confirmModal.action === "LOANPROCESSED"
                      ? "#1a7a4a"
                      : "#c0392b",
                  color: "#fff",
                  fontWeight: 600,
                  borderRadius: 6,
                  padding: "8px 22px",
                  flex: 1,
                }}
                onClick={handleAction}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" />
                    Processing...
                  </>
                ) : (
                  <>
                    <i
                      className={`fa ${confirmModal.action === "LOANACCEPTED" || confirmModal.action === "LOANPROCESSED" ? "fa-check" : "fa-times"} me-1`}
                    />
                    {confirmModal.action === "LOANACCEPTED"
                      ? "Proceed to Fund"
                      : confirmModal.action === "LOANPROCESSED"
                        ? "Proceed & Disburse"
                        : "Yes, Reject"}
                  </>
                )}
              </button>
              <button
                className="btn btn-outline-secondary"
                style={{ borderRadius: 6, padding: "8px 22px" }}
                onClick={() => setConfirmModal(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Real Cashfree Aadhaar eSign Gateway Modal for Lender */}
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
                Lender Aadhaar eSign via Cashfree Gateway
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
          {esignModal.offer && (
            <div className="p-3 rounded-3 bg-light border mb-3" style={{ fontSize: "13px" }}>
              <div className="row g-2">
                <div className="col-6">
                  <span className="text-muted d-block small">Loan Request ID</span>
                  <strong>#{esignModal.offer.loanRequestId || esignModal.offer.id}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block small">Borrower Name</span>
                  <strong>{esignModal.offer.borrowerName || esignModal.offer.firstName || "Borrower"}</strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block small">Offered Amount</span>
                  <strong className="text-success">
                    ₹ {Number(esignModal.offer.lenderInterestedAmount || esignModal.offer.offerAmount || 0).toLocaleString("en-IN")}
                  </strong>
                </div>
                <div className="col-6">
                  <span className="text-muted d-block small">Interest Rate (ROI)</span>
                  <strong>{esignModal.offer.roi}% p.a.</strong>
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
                  {esignModal.offer?.lenderAgrrement && (
                    <a
                      href={esignModal.offer.lenderAgrrement}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-link p-0 small text-decoration-none"
                    >
                      <i className="fa-solid fa-arrow-up-right-from-square me-1"></i> Preview PDF
                    </a>
                  )}
                </div>
                <p className="text-muted small mb-0" style={{ fontSize: "12px", lineHeight: "1.6" }}>
                  I hereby authorize OxyLoans to affix my digital signature to the loan contract under the Information Technology Act, 2000. I acknowledge that the loan amount will be disbursed via RBI-regulated Escrow directly to the borrower's verified bank account.
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
                  id="lenderModalConsentCheck"
                  checked={esignModal.agreed}
                  onChange={(e) =>
                    setEsignModal((prev) => ({ ...prev, agreed: e.target.checked }))
                  }
                />
                <label className="form-check-label text-muted small" htmlFor="lenderModalConsentCheck">
                  I agree to electronically sign this P2P loan contract using Aadhaar OTP verification via Cashfree.
                </label>
              </div>

              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pt-2 border-top">
                <Link
                  to={`/lender_esign/${esignModal.offer?.loanRequestId || esignModal.offer?.id}?assignmentId=${esignModal.offer?.id}`}
                  className="btn btn-outline-primary btn-sm rounded-pill px-3"
                  onClick={() => setEsignModal((prev) => ({ ...prev, open: false }))}
                >
                  <i className="fa-solid fa-arrow-up-right-from-square me-1"></i> Open Full eSign Page
                </Link>

                <div className="d-flex gap-2">
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
              <h5 className="fw-bold text-success mb-1">Lender Agreement eSigned Successfully!</h5>
              <p className="text-muted small mb-4">
                Your digital signature seal has been permanently verified and affixed to the loan agreement via Cashfree. The contract is now legally executed.
              </p>
              <div className="d-flex justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-4"
                  onClick={() => setEsignModal((prev) => ({ ...prev, open: false }))}
                >
                  Close & View Offers
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default OfferGivenList;
