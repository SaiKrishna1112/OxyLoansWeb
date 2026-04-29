import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import { getLoanAmountDeducted, showingInterestAmountToLender } from "../../../HttpRequest/afterlogin";
import Swal from "sweetalert2";

const PRIMARY = "#3d5ee1";
const PAGE_SIZE = 10;

const DisburseLoans = () => {
  const [loans, setLoans]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount]   = useState(0);
  const [confirmModal, setConfirmModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [interestModal, setInterestModal] = useState(null);   // { loan, data: [], deducted: [] }
  const [interestLoading, setInterestLoading] = useState(false);

  useEffect(() => { fetchLoans(); }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res  = await getLoanAmountDeducted();
      const data = Array.isArray(res?.data)
        ? res.data
        : res?.data?.loanRequests || res?.data?.loans || res?.data?.data || [];
      const list = Array.isArray(data) ? data : [];
      setLoans(list);
      setTotalCount(
        res?.data?.totalCount ?? res?.data?.totalElements ?? res?.data?.total ?? list.length
      );
    } catch {
      setLoans([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDisburse = async () => {
    if (!confirmModal) return;
    setActionLoading(true);
    try {
      const res = await getLoanAmountDeducted();
      const status = res?.status || res?.response?.status;
      if (!res || status >= 400) throw new Error();

      await Swal.fire({
        icon: "success",
        title: "Disbursed!",
        text: "Loan amount has been transferred to the borrower successfully.",
        confirmButtonColor: PRIMARY,
      });
      setConfirmModal(null);
      fetchLoans();
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Could not disburse the loan. Please try again.",
        confirmButtonColor: PRIMARY,
      });
      setConfirmModal(null);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchInterestDetails = async (loan) => {
    const borrowerId = loan.borrowerId || loan.borrowerUserId;
    const loanId     = loan.loanId || loan.id || loan.loanRequestId || null;
    setInterestLoading(true);
    setInterestModal({ loan, data: [], deducted: [] });
    try {
      const [interestRes, deductedRes] = await Promise.allSettled([
        showingInterestAmountToLender(borrowerId, loanId),
        getLoanAmountDeducted(),
      ]);
      const data     = interestRes.status === "fulfilled"
        ? (Array.isArray(interestRes.value?.data) ? interestRes.value.data : interestRes.value?.data ? [interestRes.value.data] : [])
        : [];
      // Filter deducted list to this borrower only
      const allDeducted = deductedRes.status === "fulfilled"
        ? (Array.isArray(deductedRes.value?.data) ? deductedRes.value.data : [])
        : [];
      const deducted = allDeducted.filter(d => String(d.borrowerId) === String(borrowerId));
      setInterestModal({ loan, data, deducted });
    } catch {
      setInterestModal({ loan, data: [], deducted: [] });
    } finally {
      setInterestLoading(false);
    }
  };

  const totalPages  = Math.ceil(totalCount / PAGE_SIZE);  const paginated   = loans.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

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
                <h3 className="page-title">Disbursed Loans</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
                  <li className="breadcrumb-item active">Disbursed Loans</li>
                </ul>
              </div>
            </div>
            <span className="text-muted">Track and manage all loans you have disbursed and monitor their performance.</span>
          </div>

          {/* Repayment Marquee */}
          <div className="mb-2" style={{ background: "#fffdf0", borderRadius: 6 }}>
            <marquee behavior="scroll" direction="left" scrollamount="2" style={{ padding: "6px 0", fontSize: 12, color: "#7a5c00", fontWeight: 500, textAlign: "center" }}>
              📅&nbsp;&nbsp;<strong>Repayment Reminder:</strong>&nbsp; Borrower repayment is scheduled for the <strong>5th of each month</strong>. Timely payment ensures consistent returns on your investment.
            </marquee>
          </div>

          {/* Summary Cards */}
          {!loading && totalCount > 0 && (
            <div className="row mb-3 g-3">
              {[
                { label: "Total Loans",       value: totalCount,                                                                icon: "fa-list" },
                { label: "Total Disbursed",   value: loans.reduce((s, l) => s + Number(l.amount || 0), 0).toLocaleString("en-IN"), icon: "fa-rupee", prefix: "₹" },
                { label: "Unique Borrowers",  value: new Set(loans.map(l => l.borrowerId)).size,                               icon: "fa-users" },
              ].map(({ label, value, icon, prefix = "" }) => (
                <div className="col-6 col-md-4" key={label}>
                  <div className="card mb-0" style={{ borderLeft: `4px solid ${PRIMARY}` }}>
                    <div className="card-body py-3 d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{ width: 44, height: 44, background: "#eef1fd", flexShrink: 0 }}>
                        <i className={`fa ${icon}`} style={{ color: PRIMARY, fontSize: 18 }} />
                      </div>
                      <div>
                        <div className="fw-bold" style={{ fontSize: 20, lineHeight: 1 }}>{prefix}{value}</div>
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
              <h5 className="mb-0 fw-bold">Disbursed Loans List</h5>
              <p className="text-muted">View all your disbursed loans and their key details.</p>
              {totalCount > 0 && (
                <small className="text-muted">Total <strong>{totalCount}</strong> loan{totalCount !== 1 ? "s" : ""}</small>
              )}
               
            </div>
           

            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" style={{ color: PRIMARY }} />
                  <p className="mt-2 text-muted">Loading loans...</p>
                </div>
              ) : paginated.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fa fa-inbox fa-3x mb-3" style={{ color: "#d0d5dd" }} />
                  <p className="text-muted mb-1">No loans available for disbursement.</p>
                  <Link to="/offerGivenList" className="btn btn-sm mt-2"
                    style={{ background: PRIMARY, color: "#fff", borderRadius: 6 }}>
                    View Offers Given
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                    <thead style={{ background: "#f8f9fb" }}>
                      <tr>
                        <th className="ps-4">#</th>
                        <th>Borrower</th>
                        <th>Borrower ID</th>
                        <th>Loan ID</th>
                        <th>Amount</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((loan, idx) => {
                        const serialNo = (currentPage - 1) * PAGE_SIZE + idx + 1;
                        return (
                          <tr key={loan.loanId || loan.borrowerId || idx}>
                            <td className="ps-4 text-muted">{serialNo}</td>

                            {/* Borrower */}
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div className="d-flex align-items-center justify-content-center rounded-circle"
                                  style={{ width: 34, height: 34, background: "#eef1fd", flexShrink: 0 }}>
                                  <i className="fa fa-user" style={{ color: PRIMARY, fontSize: 14 }} />
                                </div>
                                <div className="fw-semibold" style={{ lineHeight: 1.2 }}>
                                  {loan.borrowerName || "—"}
                                </div>
                              </div>
                            </td>

                            <td className="text-muted">{loan.borrowerId ?? "—"}</td>
                            <td className="text-muted">{loan.loanId ?? "—"}</td>

                            <td className="fw-semibold" style={{ color: "#1a7a4a" }}>
                              ₹{Number(loan.amount || 0).toLocaleString("en-IN")}
                            </td>

                            {/* Action */}
                            <td className="text-center">
                              <div className="d-flex align-items-center justify-content-center gap-2">
                                <button
                                  className="btn btn-sm"
                                  style={{ background: "#17a2b8", color: "#fff", borderRadius: 6, padding: "4px 12px", fontSize: 12 }}
                                  onClick={() => fetchInterestDetails(loan)}
                                  title="View Interest Details"
                                >
                                  {/* <i className="fa fa-percent me-1" /> */}
                                  Interest
                                </button>
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
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalCount)} of <strong>{totalCount}</strong> loans
                </small>
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => goToPage(1)}><i className="fa fa-angle-double-left" /></button>
                  </li>
                  <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => goToPage(currentPage - 1)}><i className="fa fa-chevron-left" /></button>
                  </li>
                  {pageNumbers().map((page, i) =>
                    page === "..." ? (
                      <li key={`e-${i}`} className="page-item disabled"><span className="page-link">&hellip;</span></li>
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
                    <button className="page-link" onClick={() => goToPage(currentPage + 1)}><i className="fa fa-chevron-right" /></button>
                  </li>
                  <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => goToPage(totalPages)}><i className="fa fa-angle-double-right" /></button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Disburse Modal */}
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
            <div style={{ background: PRIMARY, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h5 className="mb-0 text-white" style={{ fontWeight: 600 }}>
                <i className="fa fa-paper-plane me-2" /> Confirm Disbursement
              </h5>
              <button className="btn btn-sm"
                style={{ color: "#fff", background: "transparent", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 6, padding: "4px 10px", fontSize: 16 }}
                onClick={() => setConfirmModal(null)}>✕</button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "20px 24px" }}>
              <p className="mb-3" style={{ fontSize: 14 }}>
                Are you sure you want to disburse the loan to{" "}
                <strong>{confirmModal.loan.borrowerName || "this borrower"}</strong>?
              </p>
              <div className="rounded p-3 mb-0" style={{ background: "#f8f9fb", fontSize: 13 }}>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Loan Amount</span>
                  <strong>₹{Number(confirmModal.loan.amount || 0).toLocaleString("en-IN")}</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Loan ID</span>
                  <strong>{confirmModal.loan.loanId ?? "—"}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Borrower ID</span>
                  <strong>{confirmModal.loan.borrowerId ?? "—"}</strong>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "0 24px 20px", display: "flex", gap: 10 }}>
              <button
                className="btn"
                style={{ background: PRIMARY, color: "#fff", fontWeight: 600, borderRadius: 6, padding: "8px 22px", flex: 1 }}
                onClick={handleDisburse}
                disabled={actionLoading}
              >
                {actionLoading
                  ? <><span className="spinner-border spinner-border-sm me-1" />Processing...</>
                  : <><i className="fa fa-paper-plane me-1" />Yes, Disburse</>
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
      {/* Interest Details Modal */}
      {interestModal && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => !interestLoading && setInterestModal(null)}
        >
          <div
            style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 680, maxHeight: "90vh", boxShadow: "0 8px 40px rgba(0,0,0,0.18)", overflow: "hidden", display: "flex", flexDirection: "column" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #0f7490 0%, #17a2b8 100%)", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <h5 className="mb-0 text-white fw-bold" style={{ fontSize: 16 }}>
                  {/* <i className="fa fa-percent me-2" /> */}
                  Interest Details
                </h5>
                <small style={{ color: "rgba(255,255,255,0.8)" }}>
                  {interestModal.loan.borrowerName || interestModal.loan.firstName || "Borrower"}
                </small>
              </div>
              <button
                className="btn btn-sm"
                style={{ color: "#fff", background: "transparent", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 6, padding: "4px 10px" }}
                onClick={() => setInterestModal(null)}
              >✕</button>
            </div>

            {/* Body */}
            <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>
              {interestLoading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" style={{ color: "#17a2b8" }} />
                  <p className="mt-2 text-muted">Loading interest details...</p>
                </div>
              ) : interestModal.data.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fa fa-info-circle fa-3x mb-3" style={{ color: "#d0d5dd" }} />
                  <p className="text-muted">No interest details available for this loan.</p>
                </div>
              ) : (
                interestModal.data.map((item, idx) => (
                  <div key={idx} className={idx > 0 ? "mt-4 pt-4" : ""} style={idx > 0 ? { borderTop: "1px solid #e9ecef" } : {}}>
                    {/* Borrower + Loan summary */}
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#e0f7fa", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <i className="fa fa-user" style={{ color: "#17a2b8", fontSize: 18 }} />
                      </div>
                      <div>
                        <div className="fw-bold" style={{ fontSize: 15, color: "#1a1f36" }}>
                          {item.borrowerName || interestModal.loan.borrowerName || "—"}
                        </div>
                        {item.loanId && <small className="text-muted">Loan ID: {item.loanId}</small>}
                      </div>
                    </div>

                    {/* Key metrics row */}
                    <div className="row g-3 mb-3">
                      {(() => {
                        const lenderAmt   = item.lenderAmount ?? 0;
                        const interestAmt = item.interestAmount ?? 0;
                        const extraAmt    = item.extraInterestAmount ?? 0;
                        const computedTotal = lenderAmt + interestAmt + extraAmt;
                        return [
                          { label: "Loan Amount",     value: `₹${Number(lenderAmt).toLocaleString("en-IN")}`,      icon: "fa-rupee",      bg: "#e8f0ff", color: PRIMARY },
                          { label: "Interest Amount", value: `₹${Number(interestAmt).toFixed(2)}`,                  icon: "fa-percent",    bg: "#e0f7fa", color: "#17a2b8" },
                          { label: "Total Amount",    value: `₹${Number(computedTotal).toFixed(2)}`,                icon: "fa-calculator", bg: "#e8f5e9", color: "#1a7a4a" },
                          { label: "Loan Days",       value: item.days != null ? `${item.days} days` : "—",         icon: "fa-calendar",   bg: "#fff8e1", color: "#b45309" },
                        ];
                      })().map(({ label, value, icon, bg, color }) => (
                        <div className="col-6 col-md-3" key={label}>
                          <div className="rounded-3 p-3 text-center h-100" style={{ background: bg, border: `1px solid ${color}20` }}>
                            <i className={`fa ${icon} mb-1`} style={{ color, fontSize: 18 }} />
                            <div className="fw-bold mt-1" style={{ fontSize: 15, color: "#1a1f36" }}>{value}</div>
                            <small style={{ color: "#6c757d", fontSize: 11 }}>{label}</small>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Detail rows */}
                    <div className="rounded-3 overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
                      {[
                        { label: "ROI",                       value: item.roi != null ? `${item.roi}% per month` : "—" },
                        { label: "Per Day Interest",          value: item.perDayInterest != null ? `₹${Number(item.perDayInterest).toFixed(4)}` : "—" },
                        { label: "Extra Interest Days",       value: item.extraInterestDays != null ? `${item.extraInterestDays} days` : "—" },
                        { label: "Extra Interest Amount",     value: item.extraInterestAmount != null ? `₹${Number(item.extraInterestAmount).toFixed(2)}` : "—" },
                        { label: "Total = Principal + Interest + Extra", value: `₹${Number((item.lenderAmount ?? 0) + (item.interestAmount ?? 0) + (item.extraInterestAmount ?? 0)).toFixed(2)}` },
                        { label: "Payment Due Date",          value: item.borrowerPaymentDate || "—" },
                        { label: "Late Payment Date",         value: item.latePaymentDate || "—" },
                        { label: "Borrower Paid Date",        value: item.borrowerPaidDate || "Not paid yet" },
                        { label: "Late Payment Penalty Date", value: item.borrowerLatePaymentDate || "—" },
                      ].map(({ label, value }, i, arr) => (
                        <div
                          key={label}
                          className="d-flex align-items-center justify-content-between px-3 py-2"
                          style={{ background: i % 2 === 0 ? "#f8f9fb" : "#fff", borderBottom: i < arr.length - 1 ? "1px solid #e9ecef" : "none" }}
                        >
                          <span style={{ fontSize: 13, color: "#6c757d" }}>{label}</span>
                          <span className="fw-semibold" style={{ fontSize: 13, color: "#1a1f36" }}>{value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Deducted amount section */}
                    {interestModal.deducted && interestModal.deducted.length > 0 && (
                      <div className="mt-3">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <div style={{ width: 4, height: 18, background: "#e67e22", borderRadius: 2 }} />
                          <span className="fw-bold" style={{ fontSize: 13, color: "#1a1f36" }}>Amount Deducted from Lender</span>
                        </div>
                        <div className="rounded-3 overflow-hidden" style={{ border: "1px solid #fde8cc" }}>
                          {interestModal.deducted.map((d, di) => (
                            <div key={di} className="d-flex align-items-center justify-content-between px-3 py-2"
                              style={{ background: di % 2 === 0 ? "#fff8f0" : "#fff", borderBottom: di < interestModal.deducted.length - 1 ? "1px solid #fde8cc" : "none" }}>
                              <div>
                                <div className="fw-semibold" style={{ fontSize: 13, color: "#1a1f36" }}>{d.borrowerName || "—"}</div>
                                <small className="text-muted">Loan ID: {d.loanId ?? "—"}</small>
                              </div>
                              <div className="fw-bold" style={{ fontSize: 14, color: "#e67e22" }}>
                                ₹{Number(d.amount ?? 0).toLocaleString("en-IN")}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "12px 24px", borderTop: "1px solid #e9ecef", background: "#f8f9fa", display: "flex", justifyContent: "flex-end" }}>
              <button
                className="btn btn-outline-secondary"
                style={{ borderRadius: 6, padding: "7px 22px", fontSize: 13 }}
                onClick={() => setInterestModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisburseLoans;
