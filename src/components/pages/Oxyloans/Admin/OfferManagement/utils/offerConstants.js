export const OFFER_SEGMENTS = [
  { value: "NEVER_INVESTED", label: "Never Invested" },
  { value: "ONE_DEAL_DORMANT", label: "One Deal — Dormant" },
  { value: "TWO_TO_THREE_DEALS_DORMANT", label: "2–3 Deals — Dormant" },
  { value: "INACTIVE_1_MONTH", label: "Inactive 1 Month" },
  { value: "INACTIVE_2_TO_6_MONTHS", label: "Inactive 2–6 Months" },
  { value: "INACTIVE_OVER_1_YEAR", label: "Inactive 1+ Year" },
  { value: "ACTIVE_RECENT", label: "Active Recent" },
  { value: "REPEAT_LOYAL", label: "Repeat Loyal" },
];

export const OFFER_STATUSES = {
  GENERATED: { label: "Pending", variant: "warning" },
  PENDING: { label: "Pending", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  ACTIVE: { label: "Active", variant: "success" },
  REJECTED: { label: "Rejected", variant: "danger" },
  SENT: { label: "Sent", variant: "info" },
  FAILED: { label: "Failed", variant: "dark" },
  CONVERTED: { label: "Converted", variant: "primary" },
};

export const getSegmentLabel = (value) =>
  OFFER_SEGMENTS.find((s) => s.value === value)?.label || value;

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
