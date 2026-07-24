import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserReactivationOffers } from "../../../HttpRequest/afterlogin";
import { normalizeOfferType } from "./subscriptionOfferUtils";
import "./ActiveOfferPopup.css";

const DEFAULT_DISMISS_KEY = "oxy_active_offer_popup_dismissed";
/** Sidebar "My Offers" page (ReactivationMyOffers). */
const MY_OFFERS_PATH = "/my-reactivation-offers";

const isActiveOffer = (offer) => {
  if (!offer || offer.eligible !== true) return false;
  if (offer.redeemed === true || offer.redeemed === "true") return false;
  const status = String(offer.status || "").toUpperCase();
  const claimStatus = String(offer.claimStatus || "").toUpperCase();
  return status !== "CLAIMED" && claimStatus !== "CLAIMED";
};

const GiftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

/**
 * Self-contained prompt shown when the lender has at least one matching active offer.
 * Does not reveal offer details — only invites the user to explore.
 *
 * @param {string} [offerTypeFilter] - If set (e.g. SUBSCRIPTION_DISCOUNT), only that offer type triggers the popup.
 * @param {string} [dismissKey] - sessionStorage key so pages can show independently when needed.
 */
const ActiveOfferPopup = ({
  offerTypeFilter = null,
  dismissKey = DEFAULT_DISMISS_KEY,
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (sessionStorage.getItem(dismissKey) === "1") {
      return undefined;
    }

    const checkOffers = async () => {
      try {
        const list = await getUserReactivationOffers();
        if (cancelled) return;
        const hasMatch =
          Array.isArray(list) &&
          list.some((offer) => {
            if (!isActiveOffer(offer)) return false;
            if (!offerTypeFilter) return true;
            return normalizeOfferType(offer) === String(offerTypeFilter).toUpperCase();
          });
        if (hasMatch) {
          sessionStorage.setItem(dismissKey, "1");
          setOpen(true);
        }
      } catch {
        /* silent — popup is optional UX */
      }
    };

    checkOffers();
    return () => {
      cancelled = true;
    };
  }, [offerTypeFilter, dismissKey]);

  const dismiss = () => {
    setOpen(false);
  };

  const handleExploreNow = () => {
    setOpen(false);
    navigate(MY_OFFERS_PATH);
  };

  if (!open) return null;

  return (
    <div
      className="active-offer-popup-backdrop"
      role="presentation"
      onClick={dismiss}
    >
      <div
        className="active-offer-popup"
        role="dialog"
        aria-modal="true"
        aria-labelledby="active-offer-popup-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="active-offer-popup-hero">
          <div className="active-offer-popup-glow" aria-hidden="true" />
          <div className="active-offer-popup-icons" aria-hidden="true">
            <span className="active-offer-popup-icon-badge is-gift">
              <GiftIcon />
            </span>
          </div>
        </div>
        <div className="active-offer-popup-body">
          <h2 id="active-offer-popup-title" className="active-offer-popup-title">
            You have special offers waiting
          </h2>
          <p className="active-offer-popup-text">
            Exclusive benefits are ready for you. Explore them when you&apos;re
            ready — it only takes a moment.
          </p>
          <div className="active-offer-popup-actions">
            <button
              type="button"
              className="active-offer-popup-btn active-offer-popup-btn-primary"
              onClick={handleExploreNow}
            >
              Explore now
            </button>
            <button
              type="button"
              className="active-offer-popup-btn active-offer-popup-btn-secondary"
              onClick={dismiss}
            >
              View later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveOfferPopup;
