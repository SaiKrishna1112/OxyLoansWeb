/**
 * Frontend gate: hide membership/subscription offer cards while Deal Fee Free
 * is still unclaimed for this lender. Survives segment conversion and API lag.
 *
 * Rules:
 * - Active Deal Fee Free + participate ≥ ₹10,000 → claim + 1 month free membership
 * - Active Deal Fee Free + participate < ₹10,000 → offer stays ACTIVE; hide membership
 * - After Regular segment conversion, still hide membership until Deal Fee Free claimed
 * - No active Deal Fee Free → show membership offers as usual
 */
const STORAGE_KEY = "oxy_unclaimed_deal_fee_free";

const normalizeOfferType = (offer) => {
  const type = offer?.offerType ?? offer;
  if (typeof type === "string") return type.toUpperCase();
  if (type && typeof type === "object" && type.name) {
    return String(type.name).toUpperCase();
  }
  return String(type || "").toUpperCase();
};

const isClaimed = (offer) => {
  if (!offer) return false;
  const status = String(offer.status || "").toUpperCase();
  const claimStatus = String(offer.claimStatus || "").toUpperCase();
  return (
    offer.redeemed === true ||
    offer.redeemed === "true" ||
    status === "CLAIMED" ||
    claimStatus === "CLAIMED"
  );
};

/** True when this offer is the lender's assigned/usable Deal Fee Free. */
export const isAssignedUnclaimedDealFeeFree = (offer) => {
  if (!offer || normalizeOfferType(offer) !== "FIRST_DEAL_FREE") return false;
  if (isClaimed(offer)) return false;
  const reason = String(offer.disabledReason || "").toLowerCase();
  // Reserved while membership is active — not claimable yet (still shown as deferred banner/card).
  if (
    reason.includes("after your current subscription") ||
    reason.includes("subscription ends") ||
    reason.includes("membership is already active")
  ) {
    return false;
  }
  if (offer.assignedToUser === true || offer.assignedToUser === "true") return true;
  if (offer.eligible === true || offer.eligible === "true") return true;
  return false;
};

/** Assigned Deal Fee Free reserved until current subscription completes. */
export const isDeferredDealFeeFreeOffer = (offer) => {
  if (!offer || normalizeOfferType(offer) !== "FIRST_DEAL_FREE") return false;
  if (isClaimed(offer)) return false;
  const reason = String(offer.disabledReason || "").toLowerCase();
  const isDeferredReason =
    reason.includes("after your current subscription") ||
    reason.includes("subscription ends") ||
    reason.includes("membership is already active");
  if (!isDeferredReason) return false;
  // Prefer assigned mapping; eligible=false with deferred reason is set for mapped offers.
  return (
    offer.assignedToUser === true ||
    offer.assignedToUser === "true" ||
    offer.eligible === false ||
    offer.eligible === "false"
  );
};

export const markUnclaimedDealFeeFree = (active) => {
  try {
    if (active) {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* ignore storage errors */
  }
};

/**
 * Sync gate from My Offers / offers API.
 * Clears the gate when there is no assigned unclaimed Deal Fee Free so Regular
 * membership offers show normally for lenders who never had (or already claimed) it.
 */
export const syncDealFeeFreeGateFromOffers = (offers) => {
  if (!Array.isArray(offers)) {
    return isUnclaimedDealFeeFreeGateActive();
  }
  const hasUnclaimed = offers.some(isAssignedUnclaimedDealFeeFree);
  if (hasUnclaimed) {
    markUnclaimedDealFeeFree(true);
    return true;
  }
  markUnclaimedDealFeeFree(false);
  return false;
};

export const syncDealFeeFreeGateFromDealApi = (apidata) => {
  if (!apidata) return isUnclaimedDealFeeFreeGateActive();
  const type = normalizeOfferType(
    apidata.activeOfferType || apidata.activeOfferTypeCode || ""
  );
  const claimed =
    apidata.offerClaimed === true ||
    apidata.offerClaimed === "true" ||
    apidata.claimStatus === "CLAIMED" ||
    apidata.offerStatus === "DEACTIVATED";
  const active =
    !claimed &&
    (apidata.offerActive === true ||
      apidata.offerActive === "true" ||
      apidata.offerStatus === "ACTIVE" ||
      !!apidata.activeOfferId) &&
    (type === "FIRST_DEAL_FREE" || !type);

  if (active) {
    markUnclaimedDealFeeFree(true);
    return true;
  }
  if (claimed && (type === "FIRST_DEAL_FREE" || type === "" || !type)) {
    markUnclaimedDealFeeFree(false);
    return false;
  }
  return isUnclaimedDealFeeFreeGateActive();
};

export const isUnclaimedDealFeeFreeGateActive = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * Hide membership discount cards when Deal Fee Free is still unclaimed.
 * When an offers list is provided, trust the API (not a sticky session flag).
 */
export const shouldHideMembershipOffers = (offers) => {
  if (Array.isArray(offers) && offers.length > 0) {
    return offers.some(isAssignedUnclaimedDealFeeFree);
  }
  return isUnclaimedDealFeeFreeGateActive();
};
