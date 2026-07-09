import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import Sidebar from "../../../SideBar/SideBar";
import { getUserReactivationOffers } from "../../../HttpRequest/afterlogin";

const OFFER_TYPE_LABELS = {
  FIRST_DEAL_FREE: "First Deal Free",
  FEE_WAIVER: "Fee Waiver",
  CASHBACK: "Cashback",
  BONUS_INTEREST: "Bonus Interest",
  MEMBERSHIP_DISCOUNT: "Membership Discount",
};

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function OfferCard({ offer }) {
  const isRedeemed = Boolean(offer.redeemed);
  const typeLabel = OFFER_TYPE_LABELS[offer.offerType] || offer.offerType || "Special Offer";

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className={`card h-100 shadow-sm border-0 ${isRedeemed ? "opacity-75" : ""}`}>
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <span className="badge bg-light text-primary border">{typeLabel}</span>
            <span className={`badge ${isRedeemed ? "bg-secondary" : "bg-success"}`}>
              {isRedeemed ? "Redeemed" : offer.status || "ACTIVE"}
            </span>
          </div>

          <h5 className="card-title mb-2">{offer.title || "Personalized Offer"}</h5>
          <p className="card-text text-muted flex-grow-1">
            {offer.description || offer.benefitSummary || "Exclusive offer for you."}
          </p>

          {offer.benefitSummary && offer.description && (
            <p className="small text-success mb-2">
              <i className="fa fa-gift me-1" />
              {offer.benefitSummary}
            </p>
          )}

          <div className="small text-muted mb-3">
            <div>
              <i className="fa fa-clock me-1" />
              Expires: {formatDate(offer.expiresAt)}
            </div>
            <div>
              <i className="fa fa-calendar-check me-1" />
              Assigned: {formatDate(offer.assignedAt)}
            </div>
          </div>

          {!isRedeemed && (
            <Link
              to={offer.ctaUrl?.startsWith("/") ? offer.ctaUrl : "/participatedeal"}
              className="btn btn-primary btn-sm mt-auto"
            >
              Explore Deals
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReactivationMyOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOffers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await getUserReactivationOffers();
      setOffers(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e.message || "Failed to load your offers.");
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const activeCount = offers.filter((o) => !o.redeemed).length;

  return (
    <div className="main-wrapper">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title">My Offers</h3>
                  <p className="text-muted mb-0">
                    Personalized promotions assigned to you after admin approval.
                  </p>
                </div>
                <div className="col-auto">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={loadOffers}
                    disabled={loading}
                  >
                    <i className="fa fa-refresh me-1" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            {!loading && !error && (
              <div className="row mb-3">
                <div className="col-md-4">
                  <div className="card bg-success text-white">
                    <div className="card-body py-3">
                      <h4 className="mb-0">{activeCount}</h4>
                      <small>Active offers available</small>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2">Loading your offers...</p>
              </div>
            )}

            {!loading && error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {!loading && !error && offers.length === 0 && (
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="fa fa-tags fa-3x text-muted mb-3" />
                  <h5>No active offers right now</h5>
                  <p className="text-muted mb-0">
                    When an admin approves an offer for your profile, it will appear here.
                  </p>
                </div>
              </div>
            )}

            {!loading && !error && offers.length > 0 && (
              <div className="row">
                {offers.map((offer) => (
                  <OfferCard key={offer.offerId} offer={offer} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
