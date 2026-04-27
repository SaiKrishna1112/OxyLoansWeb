import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import {
  aggrementGenerationforLenderSide,
  brLoanStatusApprovalByLr,
  getOfferGivenList,
  loanAmountApproval,
} from "../../../HttpRequest/afterlogin";
import Swal from "sweetalert2";

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
        title: "Agreement Generated",
        text: "Agreement generated successfully.",
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
    // ✅ Handle both axios + custom responses
    const status = res?.status || res?.response?.status;
    console.log("API response for action", action, ":", res);
    if (!res || status >= 400) {
      throw new Error(`API Error: ${status}`);
    }

    // ✅ Clean message mapping
    const actionMap = {
      ACCEPTED: {
        title: "Offer Accepted!",
        text: "The offer has been accepted successfully.",
        icon: "success",
      },
      REJECTED: {
        title: "Offer Rejected",
        text: "The offer has been rejected.",
        icon: "info",
      },
      LOANPROCESSED: {
        title: "Loan Processed!",
        text: "The loan has been processed successfully.",
        icon: "success",
      },
    };

    const config = actionMap[action] || {
      title: "Success",
      text: "Action completed successfully.",
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
                <h3 className="page-title">Offers Given</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                  <li className="breadcrumb-item active">Offers Given</li>
                </ul>
              </div>
            </div>
            <div className="col-auto d-flex justify-content-end mt-2">
                <Link to="/proximityLoans" className="btn"
                  style={{ background: PRIMARY, color: "#fff", fontWeight: 600, borderRadius: 8, padding: "8px 20px" }}>
                  <i className="fa fa-plus me-1" /> New Offer
                </Link>
              </div>
          </div>

          {/* Summary Cards */}
          {!loading && totalCount > 0 && (
            <div className="row mb-3 g-3">
              {[
                { label: "Total Offers", value: totalCount, icon: "fa-paper-plane" },
                { label: "Initiated",    value: offers.filter(o => (o.lenderStatus || "").toUpperCase() === "INITIATED").length,  icon: "fa-clock-o" },
                { label: "Accepted",     value: offers.filter(o => (o.lenderStatus || "").toUpperCase() === "LOANACCEPTED" || (o.borrowerStatus || "").toUpperCase() === "LOANACCEPTED").length,   icon: "fa-check-circle" },
                { label: "Rejected",     value: offers.filter(o => (o.lenderStatus || "").toUpperCase() === "LENDER_REJECTED" || (o.borrowerStatus || "").toUpperCase() === "BORROWER_REJECTED").length,   icon: "fa-times-circle" },
              ].map(({ label, value, icon }) => (
                <div className="col-6 col-md-3" key={label}>
                  <div className="card mb-0" style={{ borderLeft: `4px solid ${PRIMARY}` }}>
                    <div className="card-body py-3 d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{ width: 44, height: 44, background: "#eef1fd", flexShrink: 0 }}>
                        <i className={`fa ${icon}`} style={{ color: PRIMARY, fontSize: 18 }} />
                      </div>
                      <div>
                        <div className="fw-bold" style={{ fontSize: 20, lineHeight: 1 }}>{value}</div>
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
                <small className="text-muted">Total <strong>{totalCount}</strong> offer{totalCount !== 1 ? "s" : ""}</small>
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
                  <i className="fa fa-paper-plane fa-3x mb-3" style={{ color: "#d0d5dd" }} />
                  <p className="text-muted mb-1">No offers given yet.</p>
                  <Link to="/proximityLoans" className="btn btn-sm mt-2"
                    style={{ background: PRIMARY, color: "#fff", borderRadius: 6 }}>
                    Browse Borrowers
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
                    <thead style={{ background: "#f5f7fb" }}>
                      <tr>
                        <th className="ps-4 py-3 text-uppercase text-muted" style={{ fontSize: 11, letterSpacing: 0.5 }}>#</th>
                        <th className="py-3 text-uppercase text-muted" style={{ fontSize: 11, letterSpacing: 0.5 }}>Borrower</th>
                        <th className="py-3 text-uppercase text-muted" style={{ fontSize: 11, letterSpacing: 0.5 }}>Offer Amount</th>
                        <th className="py-3 text-uppercase text-muted" style={{ fontSize: 11, letterSpacing: 0.5 }}>Tenure</th>
                        <th className="py-3 text-uppercase text-muted" style={{ fontSize: 11, letterSpacing: 0.5 }}>ROI (%)</th>
                        <th className="py-3 text-uppercase text-muted" style={{ fontSize: 11, letterSpacing: 0.5 }}>Status</th>
                        <th className="py-3 text-uppercase text-muted" style={{ fontSize: 11, letterSpacing: 0.5 }}>Agreement</th>
                        <th className="text-center py-3 text-uppercase text-muted" style={{ fontSize: 11, letterSpacing: 0.5 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offers.map((offer, idx) => {
                        const lenderStatus = (offer.lenderStatus || "").toUpperCase();
                        const borrowerStatus = (offer.borrowerStatus || "").toUpperCase();
                        const status = lenderStatus=== "INITIATED" ? "INITIATED" : lenderStatus === "PROCESSING" ? "Processing" : lenderStatus=== "LOANACCEPTED" ?"Loan_Accepted" : lenderStatus;
                        const { bg, color } = statusStyle(status);
                        const isInitiated = lenderStatus === "INITIATED";
                        const canAccept = isInitiated && borrowerStatus === "LOANACCEPTED";
                        const serialNo  = (currentPage - 1) * PAGE_SIZE + idx + 1;
                        const canProcess = lenderStatus === "PROCESSING" && borrowerStatus === "PROCESSING";
                        const walletDebited = (offer.walletStatus || "").toUpperCase() === "DEBITED";
                        const hasInvoiceUrl = Boolean((offer.invoiceUrl || "").toString().trim());
                        const rowId = String(offer?.id ?? "");
                        const isAgreementLoading = Boolean(agreementLoadingById[rowId]);
                        return (
                          <tr key={offer.id || offer.offerId || idx}>
                            <td className="ps-4 text-muted py-3">{serialNo}</td>

                            {/* Borrower */}
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div className="d-flex align-items-center justify-content-center rounded-circle"
                                  style={{ width: 34, height: 34, background: "#eef1fd", flexShrink: 0 }}>
                                  <i className="fa fa-user" style={{ color: PRIMARY, fontSize: 14 }} />
                                </div>
                                <div>
                                  <div className="fw-semibold" style={{ lineHeight: 1.2 }}>
                                    {offer.borrowerName || offer.firstName || "—"}
                                  </div>
                                  <small className="text-muted">{offer.borrowerId || offer.borrowerUserId || ""}</small>
                                </div>
                              </div>
                            </td>

                            <td className="fw-semibold py-3">
                              ₹{Number(offer.lenderInterestedAmount || offer.offerAmount || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="py-3">{offer.duration ? `${offer.duration} Days` : "—"}</td>
                            <td className="py-3">{offer.roi ? `${offer.roi}%` : "—"}</td>
                            {/* <td className="text-muted">{offer.offerDate || offer.createdDate || offer.offeredOn || "—"}</td> */}

                            {/* Status badge */}
                            <td className="py-3">
                              <span className="rounded-pill px-3 py-1"
                                style={{ background: bg, color, fontWeight: 600, fontSize: 11 }}>
                                {status}
                              </span>
                            </td>
                            <td className="py-3">
                              {hasInvoiceUrl ? (
                                <a
                                  href={offer.invoiceUrl}
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
                              ) : (
                                <small className="text-muted">Pending wallet debit</small>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="text-center py-3">
                              <div className="d-flex align-items-center justify-content-center gap-2">
                                {canAccept && (
                                  <button
                                    className="btn btn-sm"
                                    title="Accept"
                                    style={{ background: "#198754", color: "#fff", borderRadius: 6, padding: "4px 10px", fontSize: 12 }}
                                    onClick={() => setConfirmModal({ offer, action: "LOANACCEPTED" })}
                                  >
                                    <i className="fa fa-check me-1" /> Accept
                                  </button>
                                )}
                                {isInitiated && (
                                  <button
                                    className="btn btn-sm"
                                    title="Reject"
                                    style={{ background: "#dc3545", color: "#fff", borderRadius: 6, padding: "4px 10px", fontSize: 12 }}
                                    onClick={() => setConfirmModal({ offer, action: "LENDER_REJECTED" })}
                                  >
                                    <i className="fa fa-times me-1" /> Reject
                                  </button>
                                )}
                                {canProcess && (
                                  <button
                                    className="btn btn-sm"
                                    title="Accept"
                                    style={{ background: "#0d6efd", color: "#fff", borderRadius: 6, padding: "4px 10px", fontSize: 12 }}
                                    onClick={() => setConfirmModal({ offer, action: "LOANPROCESSED" })}
                                  >
                                    <i className="fa fa-check me-1" /> Process & Disburse Loan
                                  </button>
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
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalCount)} of <strong>{totalCount}</strong> offers
                </small>
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => goToPage(1)} title="First">
                      <i className="fa fa-angle-double-left" />
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => goToPage(currentPage - 1)} title="Previous">
                      <i className="fa fa-chevron-left" />
                    </button>
                  </li>
                  {pageNumbers().map((page, i) =>
                    page === "..." ? (
                      <li key={`e-${i}`} className="page-item disabled">
                        <span className="page-link">&hellip;</span>
                      </li>
                    ) : (
                      <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                        <button className="page-link"
                          style={currentPage === page ? { background: PRIMARY, borderColor: PRIMARY, color: "#fff" } : {}}
                          onClick={() => goToPage(page)}>
                          {page}
                        </button>
                      </li>
                    )
                  )}
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => goToPage(currentPage + 1)} title="Next">
                      <i className="fa fa-chevron-right" />
                    </button>
                  </li>
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => goToPage(totalPages)} title="Last">
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
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => !actionLoading && setConfirmModal(null)}
        >
          <div
            style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 420, boxShadow: "0 8px 40px rgba(0,0,0,0.18)", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              background: confirmModal.action === "LOANACCEPTED" || confirmModal.action === "LOANPROCESSED" ? "#1a7a4a" : "#c0392b",
              padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <h5 className="mb-0 text-white" style={{ fontWeight: 600 }}>
                <i className={`fa ${confirmModal.action === "LOANACCEPTED" ? "fa-check-circle" : confirmModal.action === "LOANPROCESSED" ? "fa-cogs" : "fa-times-circle"} me-2`} />
                {confirmModal.action === "LOANACCEPTED" ? "Accept Offer" : confirmModal.action === "LOANPROCESSED" ? "Process & Disburse Loan" : "Reject Offer"}
              </h5>
              <button className="btn btn-sm"
                style={{ color: "#fff", background: "transparent", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 6, padding: "4px 10px", fontSize: 16 }}
                onClick={() => setConfirmModal(null)}>✕</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "20px 24px" }}>
              <p className="mb-3" style={{ fontSize: 14 }}>
                Are you sure you want to <strong>{confirmModal.action === "LOANACCEPTED" ? "accept" : confirmModal.action === "LOANPROCESSED" ? "process" : "reject"}</strong> the offer for{" "}
                <strong>{confirmModal.offer.borrowerName || confirmModal.offer.firstName || "this borrower"}</strong>?
              </p>
              <div className="rounded p-3 mb-0" style={{ background: "#f8f9fb", fontSize: 13 }}>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Offer Amount</span>
                  <strong>₹{Number(confirmModal.offer.lenderInterestedAmount || confirmModal.offer.offerAmount || 0).toLocaleString("en-IN")}</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Duration</span>
                  <strong>{confirmModal.offer.duration ? `${confirmModal.offer.duration} Days` : "—"}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">ROI</span>
                  <strong>{confirmModal.offer.roi ? `${confirmModal.offer.roi}%` : "—"}</strong>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "0 24px 20px", display: "flex", gap: 10 }}>
              <button
                className="btn"
                style={{
                  background: confirmModal.action === "LOANACCEPTED" || confirmModal.action === "LOANPROCESSED" ? "#1a7a4a" : "#c0392b",
                  color: "#fff", fontWeight: 600, borderRadius: 6, padding: "8px 22px", flex: 1
                }}
                onClick={handleAction}
                disabled={actionLoading}
              >
                {actionLoading
                  ? <><span className="spinner-border spinner-border-sm me-1" />Processing...</>
                  : <><i className={`fa ${confirmModal.action === "LOANACCEPTED" || confirmModal.action === "LOANPROCESSED" ? "fa-check" : "fa-times"} me-1`} />{confirmModal.action === "LOANACCEPTED" ? "Yes, Accept" : confirmModal.action === "LOANPROCESSED" ? "Yes, Process & Disburse" : "Yes, Reject"}</>
                }
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
    </div>
  );
};

export default OfferGivenList;
