import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import Sidebar from "../../../SideBar/SideBar";
import { getUserReactivationOffers } from "../../../HttpRequest/afterlogin";

const OFFER_TYPE_LABELS = {
  FIRST_DEAL_FREE: "Deal Fee Free",
  SUBSCRIPTION_DISCOUNT: "Membership Discount",
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

function formatRupee(amount) {
  if (amount == null) return null;
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function formatDay(value) {
  if (!value) return null;
  try {
    const s = String(value).slice(0, 10);
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(value);
  }
}

function OfferCard({ offer }) {
  const isRedeemed =
    Boolean(offer.redeemed) ||
    offer.status === "CLAIMED" ||
    offer.claimStatus === "CLAIMED";
  const typeCode =
    typeof offer.offerType === "string"
      ? offer.offerType
      : offer.offerType?.name || offer.offerType;
  const typeLabel = OFFER_TYPE_LABELS[typeCode] || typeCode || "Special Offer";
  const statusLabel = isRedeemed ? "CLAIMED" : "ACTIVE";
  const isDiscount = typeCode === "SUBSCRIPTION_DISCOUNT";
  const isDealFree = typeCode === "FIRST_DEAL_FREE";
  const discountPct = Number(offer.subscriptionDiscountPercent) || 0;
  const freeMonths =
    offer.freeSubscriptionMonths != null
      ? Number(offer.freeSubscriptionMonths)
      : offer.grantsFreeSubscription
        ? 1
        : 0;
  const membershipValidity = formatDay(offer.subscriptionValidityDate);

  const ctaTo = isDiscount ? "/membership" : "/regularRunningDeal";
  const ctaLabel = isDiscount ? "View Membership Plans" : "Explore Deals";

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className={`card h-100 shadow-sm border-0 ${isRedeemed ? "opacity-75" : ""}`}>
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <span className="badge bg-light text-primary border">{typeLabel}</span>
            <span className={`badge ${isRedeemed ? "bg-secondary" : "bg-success"}`}>
              {statusLabel}
            </span>
          </div>

          <h5 className="card-title mb-2">{offer.title || "Personalized Offer"}</h5>
          <p className="card-text text-muted flex-grow-1">
            {offer.description || offer.benefitSummary || "Exclusive offer for you."}
          </p>

          {isRedeemed && (
            <div className="alert alert-secondary py-2 px-3 mb-2" role="status">
              <div className="fw-semibold mb-1">Offer claimed</div>
              <div className="small mb-0">
                {offer.claimedAt
                  ? `You claimed this offer on ${formatDay(offer.claimedAt)}.`
                  : "This one-time offer has been used and is no longer active."}
              </div>
              {membershipValidity && (
                <div className="small text-success mt-2 mb-0">
                  <i className="fa fa-id-card me-1" />
                  Subscription validity: Active until {membershipValidity}
                </div>
              )}
              {!membershipValidity && isDiscount && (
                <div className="small text-muted mt-2 mb-0">
                  Membership was activated at the discounted price (check Dashboard for validity).
                </div>
              )}
              {!membershipValidity && !isDiscount && freeMonths > 0 && (
                <div className="small text-muted mt-2 mb-0">
                  Free membership was granted with this claim (check Dashboard for validity).
                </div>
              )}
            </div>
          )}

          {offer.benefitSummary && offer.description && !isRedeemed && (
            <p className="small text-success mb-2">
              <i className="fa fa-gift me-1" />
              {offer.benefitSummary}
            </p>
          )}

          {!isRedeemed && (
            <div className="small mb-2">
              {isDiscount && discountPct > 0 && (
                <div className="text-success fw-semibold">{discountPct}% off membership</div>
              )}
              {isDiscount && (
                <div className="text-muted">
                  Pay discounted amount on Membership; same validity as a normal plan.
                </div>
              )}
              {isDiscount && offer.subscriptionDiscountedPrice != null && (
                <div>
                  From {formatRupee(offer.subscriptionDiscountedPrice)}
                  {offer.subscriptionOriginalPrice != null && (
                    <span className="text-muted text-decoration-line-through ms-1">
                      {formatRupee(offer.subscriptionOriginalPrice)}
                    </span>
                  )}
                </div>
              )}
              {isDealFree && (
                <div>
                  Min investment to claim:{" "}
                  {formatRupee(offer.minimumInvestment != null ? offer.minimumInvestment : 10000)}
                </div>
              )}
              {isDealFree && offer.participationFeeSaved != null && (
                <div className="text-success">
                  Fee saved: {formatRupee(offer.participationFeeSaved)}
                </div>
              )}
              {isDealFree && freeMonths > 0 && (
                <div className="text-success">
                  Includes {freeMonths} free month{freeMonths > 1 ? "s" : ""} membership after eligible
                  participate (offer stays ACTIVE until then)
                </div>
              )}
            </div>
          )}

          <div className="small text-muted mb-3">
            {offer.expiresAt && !isRedeemed && (
              <div>
                <i className="fa fa-clock me-1" />
                Expires: {formatDate(offer.expiresAt)}
              </div>
            )}
            {offer.assignedAt && (
              <div>
                <i className="fa fa-calendar-check me-1" />
                Assigned: {formatDate(offer.assignedAt)}
              </div>
            )}
            {offer.validityDays != null && !isRedeemed && (
              <div>
                <i className="fa fa-hourglass-half me-1" />
                Validity: {offer.validityDays} days
              </div>
            )}
          </div>

          {!isRedeemed && (
            <Link to={ctaTo} className="btn btn-primary btn-sm mt-auto">
              {ctaLabel}
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

  const activeCount = offers.filter(
    (o) =>
      !o.redeemed &&
      o.status !== "CLAIMED" &&
      o.claimStatus !== "CLAIMED"
  ).length;
  const claimedCount = offers.filter(
    (o) =>
      o.redeemed ||
      o.status === "CLAIMED" ||
      o.claimStatus === "CLAIMED"
  ).length;

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
                    Deal-fee free for New/Inactive, or membership discount for Regulars — after admin approval.
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
                {claimedCount > 0 && (
                  <div className="col-md-4">
                    <div className="card bg-secondary text-white">
                      <div className="card-body py-3">
                        <h4 className="mb-0">{claimedCount}</h4>
                        <small>Claimed offers</small>
                      </div>
                    </div>
                  </div>
                )}
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
                  <OfferCard key={offer.offerId || offer.id} offer={offer} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
