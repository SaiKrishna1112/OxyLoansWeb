import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../../Header/Header";
import Sidebar from "../../../SideBar/SideBar";
import {
  getUserReactivationOffers,
  lenderfeeamountdetailsapi,
} from "../../../HttpRequest/afterlogin";
import {
  getFinalSubscriptionAmount,
  hasUnclaimedDealFeeFreeOffer,
  isLenderMembershipPlan,
  formatRupee,
  normalizeOfferType,
  resolveDiscountPercent,
} from "./subscriptionOfferUtils";
import {
  isAssignedUnclaimedDealFeeFree,
  isDeferredDealFeeFreeOffer,
  shouldHideMembershipOffers,
  syncDealFeeFreeGateFromOffers,
} from "./dealFeeFreeGate";
import "./ReactivationMyOffers.css";

const OFFER_TYPE_LABELS = {
  FIRST_DEAL_FREE: "Deal Fee Free",
  SUBSCRIPTION_DISCOUNT: "Membership Discount",
};

const SEGMENT_LABELS = {
  NEW_LENDER: "New Lender",
  INACTIVE_LENDER: "Inactive Lender",
  REGULAR_PARTICIPANT: "Regular Participant",
};

const PLAN_LABELS = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  HALFYEARLY: "Half Yearly",
  PERYEAR: "Annual",
  FIVEYEARS: "Five Years",
  TENYEARS: "Ten Years",
  LIFETIME: "Lifetime",
};

const GiftIcon = () => (
  <svg
    className="my-offer-cta-icon"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 8h16v4H4V8zM12 8v13M12 8H8.5a2.5 2.5 0 1 1 0-5C11 3 12 8 12 8zM12 8h3.5a2.5 2.5 0 1 0 0-5C13 3 12 8 12 8z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function formatRupeeAmount(amount) {
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

function formatPlanName(plan) {
  const code = String(plan || "").toUpperCase();
  return PLAN_LABELS[code] || code;
}

/** Deal-fee-free (and other non-membership) offer card. */
function OfferCard({ offer }) {
  const isRedeemed =
    Boolean(offer.redeemed) ||
    offer.status === "CLAIMED" ||
    offer.claimStatus === "CLAIMED";
  const isDeferred = isDeferredDealFeeFreeOffer(offer);
  const isEligible = !isRedeemed && !isDeferred && offer.eligible !== false;
  const isDisabled = !isRedeemed && !isEligible;
  const typeCode = normalizeOfferType(offer);
  const typeLabel = OFFER_TYPE_LABELS[typeCode] || typeCode || "Special Offer";
  const statusLabel = isRedeemed
    ? "CLAIMED"
    : isDeferred
      ? "AFTER SUBSCRIPTION"
      : isEligible
        ? "AVAILABLE"
        : "LOCKED";
  const isDealFree = typeCode === "FIRST_DEAL_FREE";
  const membershipValidity = formatDay(offer.subscriptionValidityDate);
  const segmentLabel =
    offer.segmentLabel || SEGMENT_LABELS[offer.segment] || offer.segment || null;
  const minInvest =
    offer.minimumInvestment != null ? Number(offer.minimumInvestment) : 10000;
  const dealFreeTitle = `Participation Fee Free (Min ${formatRupeeAmount(minInvest)})`;
  const dealFreeDesc =
    `Participate with ${formatRupeeAmount(minInvest)} or more and get a 100% waiver on the ` +
    `total participation fee for that amount (1% + 18% GST). You save the full fee on whatever ` +
    `you participate — not a fixed amount.`;

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div
        className={`my-offer-card h-100 ${isRedeemed ? "is-claimed" : ""} ${
          isDisabled || isDeferred ? "is-disabled" : ""
        } is-deal-free`}
        aria-disabled={isDisabled || isDeferred}
      >
        <div className="my-offer-card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
            <span className="my-offer-type-badge">{typeLabel}</span>
            <span
              className={`my-offer-status-badge ${
                isRedeemed ? "claimed" : isEligible ? "active" : "locked"
              }`}
            >
              {statusLabel}
            </span>
          </div>

          {segmentLabel && (
            <div className="my-offer-segment mb-2">{segmentLabel}</div>
          )}

          <h5 className="my-offer-title">
            {isDealFree ? dealFreeTitle : offer.title || "Personalized Offer"}
          </h5>
          <p className="my-offer-desc flex-grow-1">
            {isDealFree
              ? dealFreeDesc
              : offer.description || offer.benefitSummary || "Exclusive offer for you."}
          </p>

          {isRedeemed && (
            <div className="my-offer-claimed-box" role="status">
              <div className="fw-semibold mb-1">Offer claimed</div>
              <div className="small mb-0">
                {offer.claimedAt
                  ? `You claimed this offer on ${formatDay(offer.claimedAt)}.`
                  : "This one-time offer has been used and is no longer active."}
              </div>
              {membershipValidity && (
                <div className="small text-success mt-2 mb-0">
                  Subscription validity: Active until {membershipValidity}
                </div>
              )}
            </div>
          )}

          {isDeferred && (
            <div className="my-offer-locked-box" role="status">
              <div className="fw-semibold mb-1">Reserved — after subscription</div>
              <div className="small mb-0">
                {offer.disabledReason ||
                  "This offer will be applicable after your current subscription ends."}
              </div>
              <div className="small mt-2 mb-0">
                Note: Complete your current subscription period, then participate with at least{" "}
                {formatRupeeAmount(minInvest)} to claim this offer.
              </div>
            </div>
          )}

          {isDisabled && !isDeferred && (
            <div className="my-offer-locked-box" role="status">
              <div className="fw-semibold mb-1">Not available for you yet</div>
              <div className="small mb-0">
                {offer.disabledReason ||
                  "This approved offer is for a different lender segment."}
              </div>
            </div>
          )}

          {!isRedeemed && (
            <div className="my-offer-perks mb-3">
              {isDealFree && (
                <>
                  <div className="my-offer-perk">
                    Min investment to claim: <strong>{formatRupeeAmount(minInvest)}</strong>
                  </div>
                  <div className="my-offer-perk highlight">
                    Save the full participation fee (1% + 18% GST) on your amount
                  </div>
                </>
              )}
              {!isDealFree &&
                offer.participationFeeSaved != null &&
                Number(offer.participationFeeSaved) > 0 && (
                  <div className="my-offer-perk">
                    Fee saved: <strong>{formatRupeeAmount(offer.participationFeeSaved)}</strong>
                  </div>
                )}
            </div>
          )}

          {isEligible && (
            <Link to="/regularRunningDeal" className="btn my-offer-cta mt-auto">
              <GiftIcon />
              Explore
            </Link>
          )}
          {(isDisabled || isDeferred) && (
            <button type="button" className="btn my-offer-cta is-disabled mt-auto" disabled>
              {isDeferred ? "After subscription" : "Not eligible"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Bonus card shown with Deal Fee Free — free 1-month membership after claiming (≥ ₹10,000).
 */
function FreeMembershipBonusCard({ offer, deferred = false }) {
  const minAmount = Number(offer.minimumInvestment) > 0 ? Number(offer.minimumInvestment) : 10000;
  const freeMonths =
    offer.freeSubscriptionMonths != null
      ? Number(offer.freeSubscriptionMonths)
      : 1;
  const monthsLabel = freeMonths > 1 ? `${freeMonths} months` : "1 month";
  const segmentLabel =
    offer.segmentLabel || SEGMENT_LABELS[offer.segment] || offer.segment || null;

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className={`my-offer-card h-100 is-deal-free ${deferred ? "is-disabled" : ""}`}>
        <div className="my-offer-card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
            <span className="my-offer-type-badge">Free Membership</span>
            <span className={`my-offer-status-badge ${deferred ? "locked" : "bonus"}`}>
              {deferred ? "AFTER SUBSCRIPTION" : "BONUS"}
            </span>
          </div>

          {segmentLabel && (
            <div className="my-offer-segment mb-2">{segmentLabel}</div>
          )}

          <h5 className="my-offer-title">
            {monthsLabel.charAt(0).toUpperCase() + monthsLabel.slice(1)} subscription free
          </h5>
          <p className="my-offer-desc flex-grow-1">
            Participate with {formatRupeeAmount(minAmount)} or greater to unlock a free{" "}
            {monthsLabel} membership with your Deal Fee Free offer.
          </p>

          {deferred && (
            <div className="my-offer-locked-box mb-3" role="status">
              <div className="fw-semibold mb-1">Reserved — after subscription</div>
              <div className="small mb-0">
                This bonus will be applicable after your current subscription ends, when you
                claim Deal Fee Free.
              </div>
            </div>
          )}

          <div className="my-offer-perks mb-3">
            <div className="my-offer-perk">
              Min investment to claim: <strong>{formatRupeeAmount(minAmount)}</strong>
            </div>
            <div className="my-offer-perk highlight">
              Participate ≥ {formatRupeeAmount(minAmount)} → {monthsLabel} Subscription FREE
            </div>
          </div>

          {deferred ? (
            <button type="button" className="btn my-offer-cta is-disabled mt-auto" disabled>
              After subscription
            </button>
          ) : (
            <Link to="/regularRunningDeal" className="btn my-offer-cta mt-auto">
              <GiftIcon />
              Explore
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/** One membership plan card under an active SUBSCRIPTION_DISCOUNT offer. */
function MembershipPlanOfferCard({ offer, plan }) {
  const pricing = getFinalSubscriptionAmount(plan, offer);
  const planCode = String(plan.lenderFeePayments || "").toUpperCase();
  const planLabel = formatPlanName(planCode);
  const discountPct =
    pricing.discountPercent || resolveDiscountPercent(offer) || 0;
  const segmentLabel =
    offer.segmentLabel || SEGMENT_LABELS[offer.segment] || offer.segment || null;

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="my-offer-card h-100 is-discount">
        <div className="my-offer-card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
            <span className="my-offer-type-badge">Membership Discount</span>
            <span className="my-offer-status-badge active">AVAILABLE</span>
          </div>

          {segmentLabel && (
            <div className="my-offer-segment mb-2">{segmentLabel}</div>
          )}

          <h5 className="my-offer-title">
            {discountPct > 0
              ? `${discountPct}% Off ${planLabel} Plan`
              : `${planLabel} Plan — Offer Applied`}
          </h5>
          <p className="my-offer-desc">
            {discountPct > 0
              ? `With your membership offer, pay ${formatRupee(
                  pricing.finalWithGst
                )} instead of ${formatRupee(
                  pricing.originalWithGst
                )} (incl. GST) on this plan. Pick any one plan — this offer can be used only once.`
              : "Special membership pricing is available on this plan. You can use this offer on any one plan."}
          </p>

          <div className="my-offer-perks mb-3">
            {discountPct > 0 && (
              <div className="my-offer-perk highlight">{discountPct}% off membership</div>
            )}
            <div className="my-offer-perk">
              You pay: <strong>₹{formatRupee(pricing.finalBase)}</strong> + 18% GST ={" "}
              <strong>₹{formatRupee(pricing.finalWithGst)}</strong>
            </div>
            {pricing.offerApplied && (
              <div className="my-offer-perk">
                <del className="text-muted">
                  Was ₹{formatRupee(pricing.originalWithGst)} with GST
                </del>
              </div>
            )}
          </div>

          <Link to="/membership" className="btn my-offer-cta mt-auto">
            <GiftIcon />
            Explore
          </Link>
        </div>
      </div>
    </div>
  );
}

const isOfferClaimed = (o) => {
  if (!o) return false;
  const status = String(o.status || "").toUpperCase();
  const claimStatus = String(o.claimStatus || "").toUpperCase();
  return (
    o.redeemed === true ||
    o.redeemed === "true" ||
    status === "CLAIMED" ||
    claimStatus === "CLAIMED"
  );
};

const isActiveOffer = (o) =>
  o &&
  !isOfferClaimed(o) &&
  o.eligible === true;

/** Assigned Deal Fee Free must stay visible/claimable even after segment conversion. */
const isDisplayableDealFeeFree = (o) =>
  isAssignedUnclaimedDealFeeFree(o) || isDeferredDealFeeFreeOffer(o);

export default function ReactivationMyOffers() {
  const [offers, setOffers] = useState([]);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hideMembershipCards, setHideMembershipCards] = useState(false);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await getUserReactivationOffers();
      const allOffers = Array.isArray(list) ? list : [];
      setOffers(allOffers);

      const blockMembership = syncDealFeeFreeGateFromOffers(allOffers);
      setHideMembershipCards(blockMembership || shouldHideMembershipOffers(allOffers));

      const activeList = allOffers.filter(isActiveOffer);
      const hasMembershipDiscount =
        !blockMembership &&
        !shouldHideMembershipOffers(allOffers) &&
        activeList.some((o) => normalizeOfferType(o) === "SUBSCRIPTION_DISCOUNT");

      if (hasMembershipDiscount) {
        try {
          const plansRes = await lenderfeeamountdetailsapi();
          const plans = Array.isArray(plansRes?.data) ? plansRes.data : [];
          setMembershipPlans(plans.filter(isLenderMembershipPlan));
        } catch {
          setMembershipPlans([]);
        }
      } else {
        setMembershipPlans([]);
      }
    } catch (e) {
      setError(e.message || "Failed to load your offers.");
      setOffers([]);
      setMembershipPlans([]);
      setHideMembershipCards(shouldHideMembershipOffers([]));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const activeOffers = useMemo(() => offers.filter(isActiveOffer), [offers]);

  const dealFeeOffers = useMemo(() => {
    const fromActive = activeOffers.filter(
      (o) => normalizeOfferType(o) !== "SUBSCRIPTION_DISCOUNT"
    );
    const assignedDealFee = offers.filter(isDisplayableDealFeeFree);
    const byId = new Map();
    [...fromActive, ...assignedDealFee].forEach((o) => {
      const key = o.offerId || o.id;
      if (key != null) byId.set(key, o);
    });
    return Array.from(byId.values());
  }, [activeOffers, offers]);

  const membershipDiscountOffer = useMemo(() => {
    // Hard frontend block — never render membership cards while Deal Fee Free is unclaimed.
    if (hideMembershipCards || shouldHideMembershipOffers(offers)) return null;
    if (hasUnclaimedDealFeeFreeOffer(offers)) return null;
    return (
      activeOffers.find((o) => normalizeOfferType(o) === "SUBSCRIPTION_DISCOUNT") || null
    );
  }, [activeOffers, offers, hideMembershipCards]);

  const hasAnyCards =
    dealFeeOffers.length > 0 ||
    (membershipDiscountOffer && membershipPlans.length > 0) ||
    (membershipDiscountOffer && membershipPlans.length === 0);

  const discountPct = membershipDiscountOffer
    ? resolveDiscountPercent(membershipDiscountOffer) || 50
    : 0;

  const heroSummary = (() => {
    if (membershipDiscountOffer && dealFeeOffers.length > 0) {
      return `Special offers ready for you — including ${discountPct}% off membership.`;
    }
    if (membershipDiscountOffer) {
      return `Exclusive ${discountPct}% membership discount is waiting for you.`;
    }
    if (dealFeeOffers.length > 0) {
      return "You have a special deal-fee offer ready to use.";
    }
    return "Active offers available for you right now.";
  })();

  return (
    <div className="main-wrapper">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header />
        <div className="page-wrapper">
          <div className="content container-fluid my-offers-page">
            <div className="my-offers-hero">
              <div className="my-offers-hero-content">
                <div className="my-offers-hero-icon" aria-hidden="true">
                  <GiftIcon />
                </div>
                <div className="my-offers-hero-copy">
                  <p className="my-offers-hero-eyebrow mb-1">Exclusive for you</p>
                  <h3 className="page-title my-offers-title mb-1">My Offers</h3>
                  <p className="my-offers-subtitle mb-0">{heroSummary}</p>
                  {!loading && !error && hasAnyCards && (
                    <div className="my-offers-hero-chips mt-3">
                      {membershipDiscountOffer && (
                        <span className="my-offers-hero-chip is-discount">
                          {discountPct}% Membership OFF
                        </span>
                      )}
                      {dealFeeOffers.length > 0 && (
                        <span className="my-offers-hero-chip is-deal">
                          Deal Fee Free
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="btn my-offers-refresh"
                onClick={loadOffers}
                disabled={loading}
              >
                <i className="fa fa-refresh me-1" />
                Refresh
              </button>
            </div>

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

            {!loading && !error && !hasAnyCards && (
              <div className="my-offers-empty">
                <i className="fa fa-tags fa-3x mb-3" />
                <h5>No active offers right now</h5>
                <p className="text-muted mb-0">Check back soon....</p>
              </div>
            )}

            {!loading && !error && hasAnyCards && (
              <>
                {dealFeeOffers.length > 0 && (
                  <div className="row">
                    {dealFeeOffers.map((offer) => {
                      // Claimed offers are never shown (main card or bonus card).
                      if (isOfferClaimed(offer)) return null;

                      const key = offer.offerId || offer.id;
                      const showMembershipBonus =
                        normalizeOfferType(offer) === "FIRST_DEAL_FREE";
                      const deferred = isDeferredDealFeeFreeOffer(offer);
                      return (
                        <React.Fragment key={key}>
                          <OfferCard offer={offer} />
                          {showMembershipBonus && (
                            <FreeMembershipBonusCard offer={offer} deferred={deferred} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}

                {membershipDiscountOffer && (
                  <section className="my-offers-membership-section">
                    <div className="my-offers-soft-note" role="note">
                      <div className="my-offers-soft-note-title">
                        🎉 You have an exclusive {discountPct > 0 ? `${discountPct}%` : ""} OFF
                        membership offer!
                      </div>
                      <p className="my-offers-soft-note-text mb-0">
                        Choose any membership plan below. Your{" "}
                        {discountPct > 0 ? `${discountPct}% ` : ""}
                        discount will be automatically applied to the plan you select. This
                        special offer can be used only once.
                      </p>
                    </div>

                    {membershipPlans.length > 0 ? (
                      <div className="row">
                        {membershipPlans.map((plan) => (
                          <MembershipPlanOfferCard
                            key={`${membershipDiscountOffer.offerId}-${plan.lenderFeePayments}`}
                            offer={membershipDiscountOffer}
                            plan={plan}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="row">
                        <div className="col-md-6 col-lg-4 mb-4">
                          <div className="my-offer-card h-100 is-discount">
                            <div className="my-offer-card-body d-flex flex-column">
                              <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
                                <span className="my-offer-type-badge">
                                  Membership Discount
                                </span>
                                <span className="my-offer-status-badge active">
                                  AVAILABLE
                                </span>
                              </div>
                              <h5 className="my-offer-title">
                                {membershipDiscountOffer.title ||
                                  "Membership discount available"}
                              </h5>
                              <p className="my-offer-desc flex-grow-1">
                                Head to membership plans and pick any one plan to use this
                                discount.
                              </p>
                              <Link to="/membership" className="btn my-offer-cta mt-auto">
                                <GiftIcon />
                                Explore
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
