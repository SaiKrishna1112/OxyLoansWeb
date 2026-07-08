import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../../Header/Header";
import Sidebar from "../../../SideBar/SideBar";
import {
  getNegotiationOffers,
  makeNegotiationOffer,
  counterNegotiationOffer,
  acceptNegotiationOffer,
  rejectNegotiationOffer,
  getMarketplaceLoanDetail,
} from "../../../HttpRequest/afterlogin";

function StatusBadge({ status }) {
  const map = {
    PENDING: ["primary", "Pending"],
    COUNTER_OFFERED: ["warning", "Counter Offered"],
    ACCEPTED: ["success", "Accepted"],
    REJECTED: ["danger", "Rejected"],
    EXPIRED: ["secondary", "Expired"],
  };
  const [color, label] = map[status] || ["secondary", status];
  return <span className={`badge bg-${color}`}>{label}</span>;
}

function Countdown({ expiresAt }) {
  const [remaining, setRemaining] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) { setRemaining("Expired"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setRemaining(`${h}h ${m}m remaining`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return <small className="text-muted ms-2">{remaining}</small>;
}

export default function InterestRateNegotiation() {
  const { loanRequestId } = useParams();
  const navigate = useNavigate();
  const userType = sessionStorage.getItem("primaryType") || "LENDER";
  const userId = sessionStorage.getItem("userId");

  const [loan, setLoan] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Lender offer form
  const [offerRate, setOfferRate] = useState(14);
  const [offerAmount, setOfferAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Counter offer
  const [counterOfferId, setCounterOfferId] = useState(null);
  const [counterRate, setCounterRate] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [loanRes, offersRes] = await Promise.all([
        getMarketplaceLoanDetail(loanRequestId),
        getNegotiationOffers(loanRequestId),
      ]);
      if (loanRes?.data) setLoan(loanRes.data);
      if (offersRes?.data) setOffers(offersRes.data.slice().reverse());
    } catch (e) {
      setError("Failed to load negotiation data.");
    } finally {
      setLoading(false);
    }
  }, [loanRequestId]);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const handleMakeOffer = async () => {
    if (!offerAmount) { setError("Please enter an offer amount."); return; }
    setSubmitting(true);
    try {
      await makeNegotiationOffer({ loanRequestId, offeredRate: offerRate, offeredAmount: Number(offerAmount) });
      setSuccess("Offer submitted! The borrower will be notified.");
      load();
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to submit offer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async (offerId) => {
    try {
      await acceptNegotiationOffer(offerId);
      setSuccess("Offer accepted! Proceeding to consent.");
      setTimeout(() => navigate(`/borrower-consent/${loanRequestId}`), 1500);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to accept offer.");
    }
  };

  const handleLenderAcceptCounter = async (offerId) => {
    try {
      await acceptNegotiationOffer(offerId);
      setSuccess("Counter accepted! Proceeding to consent stage.");
      setTimeout(() => navigate(`/lender-consent/${loanRequestId}`), 1500);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to accept counter offer.");
    }
  };

  const handleReject = async (offerId) => {
    try {
      await rejectNegotiationOffer(offerId);
      setSuccess("Offer declined.");
      load();
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to decline offer.");
    }
  };

  const handleCounter = async (offerId) => {
    if (!counterRate) { setError("Enter a counter rate."); return; }
    try {
      await counterNegotiationOffer(offerId, Number(counterRate));
      setSuccess("Counter offer submitted!");
      setCounterOfferId(null);
      setCounterRate("");
      load();
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to submit counter offer.");
    }
  };

  return (
    <div className="main-wrapper">
      <Sidebar />
      <div style={{ flex: 1 }}>
      <Header />
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header">
          <h3 className="page-title">Interest Rate Negotiation</h3>
          <ul className="breadcrumb">
            <li className="breadcrumb-item">Marketplace</li>
            <li className="breadcrumb-item active">Negotiation #{loanRequestId}</li>
          </ul>
        </div>

        {error && <div className="alert alert-danger alert-dismissible"><button type="button" className="btn-close" onClick={() => setError("")}></button>{error}</div>}
        {success && <div className="alert alert-success alert-dismissible"><button type="button" className="btn-close" onClick={() => setSuccess("")}></button>{success}</div>}

        {loan && (
          <div className="card mb-3 border-primary">
            <div className="card-body">
              <div className="row">
                <div className="col-md-3"><strong>Amount:</strong> ₹{Number(loan.loanAmount).toLocaleString("en-IN")}</div>
                <div className="col-md-3"><strong>Purpose:</strong> {loan.loanPurpose}</div>
                <div className="col-md-3"><strong>Duration:</strong> {loan.durationMonths} months</div>
                <div className="col-md-3"><strong>Status:</strong> {loan.loanStatus}</div>
              </div>
            </div>
          </div>
        )}

        <div className="row">
          {userType === "LENDER" && (
            <div className="col-md-4">
              <div className="card">
                <div className="card-header"><h5>Make an Offer</h5></div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Interest Rate: <strong>{offerRate}%</strong></label>
                    <input type="range" className="form-range" min={10} max={36} step={0.5} value={offerRate} onChange={(e) => setOfferRate(Number(e.target.value))} />
                    <div className="d-flex justify-content-between"><small>10%</small><small>36%</small></div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Offer Amount (₹)</label>
                    <input type="number" className="form-control" placeholder={loan?.loanAmount || ""} value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} />
                  </div>
                  <button className="btn btn-success w-100" onClick={handleMakeOffer} disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Offer"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={userType === "LENDER" ? "col-md-8" : "col-md-12"}>
            <div className="card">
              <div className="card-header"><h5>Offer History</h5></div>
              <div className="card-body">
                {loading && offers.length === 0 && <p className="text-muted">Loading offers...</p>}
                {!loading && offers.length === 0 && <p className="text-muted">No offers yet. Be the first to make an offer!</p>}
                {offers.map((offer) => (
                  <div key={offer.id} className="border rounded p-3 mb-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>{offer.offeredRate}%</strong> on ₹{Number(offer.offeredAmount).toLocaleString("en-IN")}
                        {offer.counterRate && <span className="ms-2 text-warning">Counter: {offer.counterRate}%</span>}
                        {offer.status === "PENDING" && offer.expiresAt && <Countdown expiresAt={offer.expiresAt} />}
                      </div>
                      <StatusBadge status={offer.status} />
                    </div>
                    <small className="text-muted">Offer #{offer.id} · {new Date(offer.createdAt).toLocaleDateString()}</small>

                    {userType === "BORROWER" && (offer.status === "PENDING" || offer.status === "COUNTER_OFFERED") && (
                      <div className="mt-2 d-flex gap-2 flex-wrap">
                        <button className="btn btn-sm btn-success" onClick={() => handleAccept(offer.id)}>Accept</button>
                        {counterOfferId === offer.id ? (
                          <>
                            <input type="number" className="form-control form-control-sm" style={{ width: 100 }} placeholder="Rate%" value={counterRate} onChange={(e) => setCounterRate(e.target.value)} />
                            <button className="btn btn-sm btn-warning" onClick={() => handleCounter(offer.id)}>Send Counter</button>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setCounterOfferId(null)}>Cancel</button>
                          </>
                        ) : (
                          <button className="btn btn-sm btn-warning" onClick={() => setCounterOfferId(offer.id)}>Counter</button>
                        )}
                        <button className="btn btn-sm btn-danger" onClick={() => handleReject(offer.id)}>Reject</button>
                      </div>
                    )}

                    {userType === "LENDER" && offer.status === "COUNTER_OFFERED" && String(offer.lenderUserId) === String(userId) && (
                      <div className="mt-2 d-flex gap-2 flex-wrap align-items-center">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleLenderAcceptCounter(offer.id)}
                        >
                          Accept {offer.counterRate}%
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleReject(offer.id)}
                        >
                          Decline
                        </button>
                        <small className="text-muted">Borrower countered your {offer.offeredRate}% offer</small>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
  );
}
