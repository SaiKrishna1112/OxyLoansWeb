import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import {
  getMyMarketplaceLoans,
  withdrawMarketplaceLoan,
  getNegotiationOffers,
  acceptNegotiationOffer,
  rejectNegotiationOffer,
  counterNegotiationOffer,
} from "../../../HttpRequest/afterlogin";
import Swal from "sweetalert2";

const STATUS_LABELS = {
  POSTED: { label: "Posted", color: "info" },
  OFFER_MADE: { label: "Offer Received", color: "warning" },
  MARKET_LISTED: { label: "Listed", color: "primary" },
  NEGOTIATING: { label: "Negotiating", color: "warning" },
  CONSENT_PENDING: { label: "Consent Pending", color: "info" },
  CONSENTED: { label: "Consented — eSign Required", color: "success" },
  ESIGN_PENDING: { label: "Fee Disclosure Pending", color: "warning" },
  ESIGN_DONE: { label: "eSigned — eNACH Pending", color: "success" },
  ENACH_INITIATED: { label: "eNACH Initiated", color: "info" },
  ENACH_APPROVED: { label: "eNACH Approved — Awaiting Disbursal", color: "success" },
  DISBURSAL_PENDING: { label: "Disbursal Pending", color: "warning" },
  DISBURSED: { label: "Disbursed — Repayment Due", color: "success" },
  DEFAULTED: { label: "Defaulted", color: "danger" },
  DISBURSED_MARKETPLACE: { label: "Disbursed", color: "success" },
  WITHDRAWN: { label: "Withdrawn", color: "secondary" },
};

const OFFER_STATUS_LABELS = {
  PENDING: { label: "Offer Received", color: "warning" },
  COUNTER_OFFERED: { label: "You Countered", color: "info" },
  ACCEPTED: { label: "Accepted", color: "success" },
  REJECTED: { label: "Rejected", color: "danger" },
  EXPIRED: { label: "Expired", color: "secondary" },
};

function fmt(n) {
  return Number(n).toLocaleString("en-IN");
}

export default function BorrowerMarketplaceListings() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [offers, setOffers] = useState({});
  const [expandedLoan, setExpandedLoan] = useState(null);
  const [counterInputs, setCounterInputs] = useState({});

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyMarketplaceLoans();
      setLoans(res?.data || []);
    } catch (e) {
      const msg = e?.response?.data?.message
        || e?.response?.data?.error
        || e?.message
        || "Failed to load your marketplace loans.";
      setError(`API Error: ${msg} (${e?.response?.status || "no response"})`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const loadOffers = async (loanRequestId) => {
    if (expandedLoan === loanRequestId) {
      setExpandedLoan(null);
      return;
    }
    try {
      const res = await getNegotiationOffers(loanRequestId);
      setOffers((prev) => ({ ...prev, [loanRequestId]: res?.data || [] }));
      setExpandedLoan(loanRequestId);
    } catch (e) {
      setError("Could not load offers for this loan.");
    }
  };

  const handleAccept = async (offerId, loanRequestId) => {
    // Step 1: Confirm intent
    const confirm = await Swal.fire({
      title: "Accept this offer?",
      html: "An OTP will be sent to your registered mobile number to verify your identity before the offer is accepted.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Send OTP",
      cancelButtonText: "Cancel",
    });
    if (!confirm.isConfirmed) return;

    // Step 2: OTP verification (dev mode: use 1234)
    // TODO: replace with real OTP call: await sendMoblieOtp({ mobileNumber: user.mobile })
    const { value: enteredOtp } = await Swal.fire({
      title: "Enter OTP",
      html: `
        <p class="text-muted mb-3" style="font-size:14px">
          An OTP has been sent to your registered mobile number.<br/>
          <small style="color:#888">(Test mode: use <strong>1234</strong>)</small>
        </p>
        <input id="otp-input" class="swal2-input" maxlength="6" placeholder="Enter OTP"
          style="letter-spacing:8px;font-size:22px;font-weight:bold;text-align:center;width:200px"/>
      `,
      showCancelButton: true,
      confirmButtonText: "Verify & Accept",
      cancelButtonText: "Cancel",
      focusConfirm: false,
      preConfirm: () => {
        const val = document.getElementById("otp-input")?.value?.trim();
        if (!val || val.length < 4) {
          Swal.showValidationMessage("Please enter the OTP");
          return false;
        }
        return val;
      },
    });

    if (!enteredOtp) return;

    // Step 3: Validate OTP (dev: accept "1234"; production: call verifyWhatsappOtpapi)
    const DEV_OTP = "1234";
    if (enteredOtp !== DEV_OTP) {
      Swal.fire("Invalid OTP", "The OTP you entered is incorrect. Please try again.", "error");
      return;
    }

    // Step 4: Accept the offer
    try {
      await acceptNegotiationOffer(offerId);
      await Swal.fire({
        title: "Offer Accepted!",
        html: "Your OTP has been verified and the offer has been accepted.<br/>"
            + "Please proceed to <strong>submit your consent</strong> to complete the process.",
        icon: "success",
        confirmButtonText: "Go to Consent",
      });
      fetchLoans();
      const res = await getNegotiationOffers(loanRequestId);
      setOffers((prev) => ({ ...prev, [loanRequestId]: res?.data || [] }));
      navigate(`/borrower-consent/${loanRequestId}`);
    } catch (e) {
      Swal.fire("Error", e?.response?.data?.error || "Accept failed", "error");
    }
  };

  const handleReject = async (offerId, loanRequestId) => {
    try {
      await rejectNegotiationOffer(offerId);
      const res = await getNegotiationOffers(loanRequestId);
      setOffers((prev) => ({ ...prev, [loanRequestId]: res?.data || [] }));
    } catch (e) {
      Swal.fire("Error", e?.response?.data?.error || "Reject failed", "error");
    }
  };

  const handleCounter = async (offerId, loanRequestId) => {
    const rate = parseFloat(counterInputs[offerId]);
    if (!rate || rate < 10 || rate > 36) {
      Swal.fire("Invalid Rate", "Counter rate must be between 10% and 36%", "warning");
      return;
    }
    try {
      await counterNegotiationOffer(offerId, rate);
      setCounterInputs((prev) => ({ ...prev, [offerId]: "" }));
      const res = await getNegotiationOffers(loanRequestId);
      setOffers((prev) => ({ ...prev, [loanRequestId]: res?.data || [] }));
    } catch (e) {
      Swal.fire("Error", e?.response?.data?.error || "Counter failed", "error");
    }
  };

  const handleWithdraw = async (loanRequestId) => {
    const result = await Swal.fire({
      title: "Withdraw this listing?",
      text: "Your loan will be removed from the marketplace.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Withdraw",
      confirmButtonColor: "#d33",
    });
    if (!result.isConfirmed) return;
    try {
      await withdrawMarketplaceLoan(loanRequestId);
      Swal.fire("Withdrawn", "Your listing has been removed.", "success");
      fetchLoans();
    } catch (e) {
      Swal.fire("Error", e?.response?.data?.error || "Withdrawal failed", "error");
    }
  };

  const statusInfo = (status) =>
    STATUS_LABELS[status] || { label: status, color: "secondary" };

  const offerStatusInfo = (status) =>
    OFFER_STATUS_LABELS[status] || { label: status, color: "secondary" };

  return (
    <div className="main-wrapper">
      <BorrowerHeader />
      <BorrowerSidebar />
    <div className="page-wrapper">
    <div className="content container-fluid">
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h3 className="page-title">My Marketplace Loans</h3>
            <p className="text-muted">View your posted loan requests, incoming offers, and their status.</p>
          </div>
          <div className="col-auto">
            <button
              className="btn btn-primary"
              onClick={() => navigate("/post-loan-request")}
            >
              + Post New Loan Request
            </button>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : loans.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="fa fa-store fa-3x text-muted mb-3" />
            <h5>No marketplace loan requests yet</h5>
            <p className="text-muted">Post a loan request to get offers from lenders.</p>
            <button className="btn btn-primary" onClick={() => navigate("/post-loan-request")}>
              Post Loan Request
            </button>
          </div>
        </div>
      ) : (
        loans.map((loan) => {
          const si = statusInfo(loan.loanStatus);
          const loanOffers = offers[loan.loanRequestId] || [];
          const pendingOffers = loanOffers.filter((o) => o.status === "PENDING" || o.status === "COUNTER_OFFERED");
          const isExpanded = expandedLoan === loan.loanRequestId;

          return (
            <div key={loan.loanRequestId} className="card mb-3">
              <div className="card-body">
                <div className="row align-items-start">
                  <div className="col-md-8">
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <h5 className="mb-0">₹{fmt(loan.loanAmount)}</h5>
                      <span className={`badge bg-${si.color}`}>{si.label}</span>
                      {pendingOffers.length > 0 && (
                        <span className="badge bg-danger">{pendingOffers.length} offer{pendingOffers.length > 1 ? "s" : ""} waiting</span>
                      )}
                    </div>
                    <div className="row g-2 text-muted small">
                      <div className="col-auto"><strong>Purpose:</strong> {loan.loanPurpose}</div>
                      <div className="col-auto"><strong>Duration:</strong> {loan.durationMonths} months</div>
                      <div className="col-auto"><strong>Rate range:</strong> {loan.preferredMinRate}% – {loan.preferredMaxRate || loan.preferredMinRate}%</div>
                      <div className="col-auto"><strong>Listed:</strong> {loan.listedDate ? new Date(loan.listedDate).toLocaleDateString("en-IN") : "—"}</div>
                    </div>

                    {loan.loanStatus === "CONSENT_PENDING" && (
                      <div className="alert alert-info mt-2 py-2 px-3 mb-0">
                        <strong>Action needed:</strong> Offer accepted. Please{" "}
                        <button
                          className="btn btn-link p-0 align-baseline"
                          onClick={() => navigate(`/borrower-consent/${loan.loanRequestId}`)}
                        >
                          submit your consent
                        </button>{" "}
                        to proceed.
                      </div>
                    )}
                    {loan.loanStatus === "CONSENTED" && (
                      <div className="alert alert-success mt-2 py-2 px-3 mb-0">
                        <strong>Both parties have consented.</strong> Please{" "}
                        <button
                          className="btn btn-link p-0 align-baseline"
                          onClick={() => navigate(`/esign/${loan.loanRequestId}`)}
                        >
                          eSign the loan agreement
                        </button>{" "}
                        to proceed.
                      </div>
                    )}
                  </div>

                  <div className="col-md-4 text-md-end mt-2 mt-md-0 d-flex flex-wrap gap-2 justify-content-md-end">
                    {(loan.loanStatus === "MARKET_LISTED" || loan.loanStatus === "NEGOTIATING") && (
                      <button
                        className={`btn btn-sm btn-outline-warning ${isExpanded ? "active" : ""}`}
                        onClick={() => loadOffers(loan.loanRequestId)}
                      >
                        {isExpanded ? "Hide Offers" : `View Offers`}
                      </button>
                    )}
                    {loan.loanStatus === "MARKET_LISTED" && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleWithdraw(loan.loanRequestId)}
                      >
                        Withdraw
                      </button>
                    )}
                    {loan.loanStatus === "CONSENT_PENDING" && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => navigate(`/borrower-consent/${loan.loanRequestId}`)}
                      >
                        Give Consent
                      </button>
                    )}
                    {loan.loanStatus === "CONSENTED" && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => navigate(`/esign/${loan.loanRequestId}`)}
                      >
                        <i className="fa-solid fa-file-signature me-1"></i>
                        eSign Agreement
                      </button>
                    )}
                    {loan.loanStatus === "ESIGN_PENDING" && (
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => navigate(`/borrower/fee-disclosure/${loan.loanRequestId}`)}
                      >
                        Fee Disclosure
                      </button>
                    )}
                    {(loan.loanStatus === "ESIGN_DONE" || loan.loanStatus === "ENACH_INITIATED" ||
                      loan.loanStatus === "ENACH_APPROVED" || loan.loanStatus === "DISBURSAL_PENDING") && (
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => navigate(`/agreement/${loan.loanRequestId}`)}
                      >
                        View Agreement
                      </button>
                    )}
                    {loan.loanStatus === "DISBURSED" && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => navigate(`/borrower/repayment/${loan.loanRequestId}`)}
                      >
                        Repay Loan
                      </button>
                    )}
                  </div>
                </div>

                {/* Offers panel */}
                {isExpanded && (
                  <div className="mt-3 border-top pt-3">
                    {loanOffers.length === 0 ? (
                      <p className="text-muted mb-0">No offers yet. Lenders can see your listing and send offers.</p>
                    ) : (
                      <table className="table table-sm table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Lender</th>
                            <th>Offered Rate</th>
                            <th>Amount</th>
                            <th>Your Counter</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loanOffers.map((offer) => {
                            const osi = offerStatusInfo(offer.status);
                            const canAct = offer.status === "PENDING";
                            return (
                              <tr key={offer.id}>
                                <td>Lender #{offer.lenderUserId}</td>
                                <td><strong>{offer.offeredRate}%</strong></td>
                                <td>₹{fmt(offer.offeredAmount)}</td>
                                <td>{offer.counterRate ? `${offer.counterRate}%` : "—"}</td>
                                <td>
                                  <span className={`badge bg-${osi.color}`}>{osi.label}</span>
                                </td>
                                <td>
                                  {canAct ? (
                                    <div className="d-flex gap-1 flex-wrap align-items-center">
                                      <button
                                        className="btn btn-xs btn-success"
                                        style={{ fontSize: "12px", padding: "2px 8px" }}
                                        onClick={() => handleAccept(offer.id, loan.loanRequestId)}
                                      >
                                        Accept
                                      </button>
                                      <button
                                        className="btn btn-xs btn-danger"
                                        style={{ fontSize: "12px", padding: "2px 8px" }}
                                        onClick={() => handleReject(offer.id, loan.loanRequestId)}
                                      >
                                        Reject
                                      </button>
                                      <div className="d-flex gap-1">
                                        <input
                                          type="number"
                                          className="form-control form-control-sm"
                                          style={{ width: "80px" }}
                                          placeholder="Rate%"
                                          value={counterInputs[offer.id] || ""}
                                          onChange={(e) =>
                                            setCounterInputs((p) => ({ ...p, [offer.id]: e.target.value }))
                                          }
                                        />
                                        <button
                                          className="btn btn-xs btn-outline-info"
                                          style={{ fontSize: "12px", padding: "2px 8px" }}
                                          onClick={() => handleCounter(offer.id, loan.loanRequestId)}
                                        >
                                          Counter
                                        </button>
                                      </div>
                                    </div>
                                  ) : offer.status === "COUNTER_OFFERED" ? (
                                    <span className="badge bg-secondary">Waiting for Lender</span>
                                  ) : (
                                    <span className="text-muted small">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
    </div>
    </div>
  );
}
