import { getUserReactivationOffers } from "../../../HttpRequest/afterlogin";

const AI_SUBSCRIPTION_TIERS = new Set(["FREE", "SMART", "PRO"]);
const LENDER_MEMBERSHIP_PLANS = new Set([
  "MONTHLY",
  "QUARTERLY",
  "HALFYEARLY",
  "PERYEAR",
  "FIVEYEARS",
  "TENYEARS",
  "LIFETIME",
]);

/** Normalize offerType from API (string or enum object). */
export function normalizeOfferType(offer) {
  const type = offer?.offerType;
  if (typeof type === "string") return type.toUpperCase();
  if (type && typeof type === "object" && type.name) {
    return String(type.name).toUpperCase();
  }
  return String(type || "").toUpperCase();
}

/** Lender membership plans only — excludes AI Dashboard tiers (FREE / SMART / PRO). */
export function isLenderMembershipPlan(planData) {
  const plan = (planData?.lenderFeePayments || "").toUpperCase();
  if (!plan || AI_SUBSCRIPTION_TIERS.has(plan)) {
    return false;
  }
  return LENDER_MEMBERSHIP_PLANS.has(plan);
}

/** Fetch active SUBSCRIPTION_DISCOUNT offer for the logged-in user (single API call). */
export async function fetchSubscriptionOffer() {
  try {
    const offers = await getUserReactivationOffers();
    if (!Array.isArray(offers) || offers.length === 0) {
      return null;
    }
    return pickSubscriptionDiscountOffer(offers);
  } catch (error) {
    console.warn("Subscription offer fetch failed:", error?.message || error);
    return null;
  }
}

export function isActiveSubscriptionOffer(offer) {
  if (!offer) return false;
  if (normalizeOfferType(offer) !== "SUBSCRIPTION_DISCOUNT") return false;
  if (offer.redeemed === true || offer.redeemed === "true") return false;

  const status = (offer.status || "").toUpperCase();
  if (status && status !== "ACTIVE" && status !== "APPROVED") return false;

  if (offer.expiresAt) {
    const expiry = new Date(offer.expiresAt);
    if (!Number.isNaN(expiry.getTime()) && expiry < new Date()) {
      return false;
    }
  }
  return true;
}

/** Pick the best SUBSCRIPTION_DISCOUNT offer when multiple are returned. */
export function pickSubscriptionDiscountOffer(offers) {
  if (!Array.isArray(offers) || offers.length === 0) return null;
  const active = offers.filter((offer) => isActiveSubscriptionOffer(offer));
  if (active.length === 0) return null;
  return active.sort((a, b) => resolveDiscountPercent(b) - resolveDiscountPercent(a))[0];
}

/** Derive discount % from offer fields when percent is missing. */
export function resolveDiscountPercent(offer) {
  let pct = Number(offer?.subscriptionDiscountPercent) || 0;
  const original = Number(offer?.subscriptionOriginalPrice) || 0;
  const discounted = Number(offer?.subscriptionDiscountedPrice) || 0;
  if (pct <= 0 && original > 0 && discounted > 0 && discounted < original) {
    pct = Math.round(((original - discounted) / original) * 100);
  }
  return pct;
}

/** SUBSCRIPTION_DISCOUNT applies to every lender membership plan on this page. */
export function isOfferApplicableToPlan(offer, planData) {
  if (!offer || !planData || !isLenderMembershipPlan(planData)) return false;
  return isActiveSubscriptionOffer(offer);
}

export function calculateDiscount(originalAmount, discountPercentage) {
  const original = Number(originalAmount) || 0;
  const pct = Number(discountPercentage) || 0;
  if (original <= 0 || pct <= 0) return original;
  // Match backend OxyLoansBusinessRules.subscriptionDiscountedPrice (integer rupees)
  return Math.round((original * (100 - pct)) / 100);
}

export function calculateTotalWithGST(baseAmount) {
  const base = Number(baseAmount) || 0;
  // Match backend: round(discountedBase * 1.18)
  return Math.round(base + (base * 18) / 100);
}

export function formatRupee(amount) {
  const value = Number(amount) || 0;
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Resolves display + payment amounts for a membership plan.
 * When offer applies, payment uses discounted base + GST on discounted base.
 */
export function getFinalSubscriptionAmount(planData, subscriptionOffer) {
  const originalBase = Number(planData?.feeAmount) || 0;
  const originalWithGst =
    Number(planData?.feeAmountWithGst) || calculateTotalWithGST(originalBase);

  const offerApplies =
    subscriptionOffer &&
    isActiveSubscriptionOffer(subscriptionOffer) &&
    isOfferApplicableToPlan(subscriptionOffer, planData);

  if (!offerApplies) {
    return {
      offerApplied: false,
      originalBase,
      originalWithGst,
      finalBase: originalBase,
      finalWithGst: originalWithGst,
      discountPercent: 0,
    };
  }

  let discountPercent = resolveDiscountPercent(subscriptionOffer);
  let finalBase = calculateDiscount(originalBase, discountPercent);

  const offerOriginal = Number(subscriptionOffer.subscriptionOriginalPrice) || 0;
  const offerDiscounted = Number(subscriptionOffer.subscriptionDiscountedPrice) || 0;
  if (offerOriginal > 0 && offerDiscounted > 0 && Math.abs(originalBase - offerOriginal) < 1) {
    finalBase = offerDiscounted;
    if (discountPercent <= 0) {
      discountPercent = Math.round(((offerOriginal - offerDiscounted) / offerOriginal) * 100);
    }
  }

  const finalWithGst = calculateTotalWithGST(finalBase);

  return {
    offerApplied: discountPercent > 0 || finalBase < originalBase,
    originalBase,
    originalWithGst: Math.round(originalWithGst),
    finalBase: Math.round(finalBase),
    finalWithGst: Math.round(finalWithGst),
    discountPercent,
    offerId: subscriptionOffer.offerId,
    offerTitle: subscriptionOffer.title,
  };
}
