/** Exactly 3 lender reactivation segments (1:1 with backend enum). */
export const OFFER_SEGMENTS = [
  {
    value: "NEW_LENDER",
    label: "New Lender",
    description: "Zero deal participations — first deal participation fee waived",
    defaultOfferType: "FIRST_DEAL_FREE",
  },
  {
    value: "INACTIVE_LENDER",
    label: "Inactive Lender",
    description: "Has deals but inactive 30+ days — next deal participation fee waived",
    defaultOfferType: "FIRST_DEAL_FREE",
  },
  {
    value: "REGULAR_PARTICIPANT",
    label: "Regular Participant",
    description:
      "Active (inactive < 30 days) — subscription % off for lenders at/above median participation rate",
    defaultOfferType: "SUBSCRIPTION_DISCOUNT",
  },
];

export const OFFER_TYPES = {
  FIRST_DEAL_FREE: {
    label: "Deal Fee Free",
    description: "Participation fee waived on first/next deal; grants 1 free month membership after claim",
  },
  SUBSCRIPTION_DISCOUNT: {
    label: "Subscription Discount",
    description: "Membership plan % off (from admin SUBSCRIPTION_OFF fee setting)",
  },
};

export const OFFER_STATUSES = {
  GENERATED: { label: "Pending", variant: "warning" },
  PENDING: { label: "Pending", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  ACTIVE: { label: "Active", variant: "success" },
  REJECTED: { label: "Rejected", variant: "danger" },
  SENT: { label: "Sent", variant: "info" },
  FAILED: { label: "Failed", variant: "dark" },
  CONVERTED: { label: "Converted", variant: "primary" },
  CLAIMED: { label: "Claimed", variant: "secondary" },
};

export const getSegmentMeta = (value) =>
  OFFER_SEGMENTS.find((s) => s.value === value) || null;

export const getSegmentLabel = (value) =>
  getSegmentMeta(value)?.label || value || "—";

export const getSegmentDescription = (value) =>
  getSegmentMeta(value)?.description || "";

export const getDefaultOfferType = (segment) =>
  getSegmentMeta(segment)?.defaultOfferType || null;

export const getOfferTypeLabel = (offerType) => {
  if (!offerType) return "—";
  const code = typeof offerType === "string" ? offerType : offerType.name || String(offerType);
  return OFFER_TYPES[code]?.label || code;
};

/** Normalize API offerType (string or enum object) to upper-case code. */
export const normalizeOfferTypeCode = (offerType) => {
  if (!offerType) return "";
  if (typeof offerType === "string") return offerType.trim().toUpperCase();
  if (typeof offerType === "object" && offerType.name) {
    return String(offerType.name).trim().toUpperCase();
  }
  return String(offerType).trim().toUpperCase();
};

/** True only for the two active offer types (legacy comeback codes are ignored). */
export const isActiveOfferType = (offerType) => {
  const code = normalizeOfferTypeCode(offerType);
  return code === "FIRST_DEAL_FREE" || code === "SUBSCRIPTION_DISCOUNT";
};

export const formatOfferDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

export const formatRupee = (amount) => {
  if (amount == null || amount === "") return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercent = (value) => {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return `${n % 1 === 0 ? n : n.toFixed(1)}%`;
};
