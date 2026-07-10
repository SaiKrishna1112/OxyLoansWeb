/** lender_cms_payments.lender_returns_type */
export const CMS_TYPES = ["LENDERINTEREST", "LENDERPRINCIPAL", "PRINCIPALINTEREST"];

export const cmsReturnsTypeLabel = (type) => {
  const t = (type || "").toUpperCase();
  if (t === "LENDERINTEREST") return "Interest";
  if (t === "LENDERPRINCIPAL") return "Principal";
  if (t === "PRINCIPALINTEREST") return "Principal + Interest";
  return type || "—";
};

export const cmsTypeColorClass = (type) => {
  const t = (type || "").toUpperCase();
  if (t === "LENDERINTEREST") return "ai-cms-type--interest";
  if (t === "LENDERPRINCIPAL") return "ai-cms-type--principal";
  if (t === "PRINCIPALINTEREST") return "ai-cms-type--combo";
  return "ai-cms-type--default";
};

export const cmsPaidSourceLabel = (type) => {
  const t = (type || "").toUpperCase();
  if (t === "LENDERINTEREST") return "lenders_returns";
  if (t === "LENDERPRINCIPAL" || t === "PRINCIPALINTEREST") return "oxy_principal_return";
  return "lenders_returns / oxy_principal_return";
};

/** OPR leg status for display */
export const oprLegStatus = (row, returnsType) => {
  const t = (returnsType || "").toUpperCase();
  if (t === "LENDERPRINCIPAL") return row?.principalStatus || "—";
  if (t === "PRINCIPALINTEREST") return row?.interestStatus || "—";
  return null;
};

export const oprStatusTone = (status) => {
  const s = (status || "").toUpperCase();
  if (s === "EXECUTED") return "executed";
  if (s === "AFTER") return "after";
  if (s === "BEFORE") return "before";
  if (s === "INITIATED") return "initiated";
  return "muted";
};

/** Paid: Interest → lenders_returns Paid; Principal/P+I → oxy_principal_return EXECUTED or lr Paid */
export const isLenderPaid = (row, returnsType) => {
  if (row?.walletCredited === true || row?.paymentOutcome === "PAID") return true;
  if ((row?.iciciStatus || "").toLowerCase() === "paid") return true;
  const t = (returnsType || row?.lenderReturnsType || "").toUpperCase();
  if (t === "LENDERPRINCIPAL" && (row?.principalStatus || "").toUpperCase() === "EXECUTED") return true;
  if (t === "PRINCIPALINTEREST" && (row?.interestStatus || "").toUpperCase() === "EXECUTED") return true;
  return false;
};

export const dealPaidCount = (deal) => deal?.walletPaidLenders ?? deal?.paidLenders ?? 0;

export const dealNotPaidCount = (deal) => {
  const total = deal?.totalLenders ?? 0;
  const paid = dealPaidCount(deal);
  if (deal?.walletPendingLenders != null) return deal.walletPendingLenders;
  if (deal?.pendingLenders != null) return deal.pendingLenders;
  return Math.max(0, total - paid);
};

export const dealPaidAmount = (deal) => deal?.walletPaidAmount ?? deal?.paidAmount ?? 0;

export const dealNotPaidAmount = (deal) => {
  if (deal?.walletPendingAmount != null) return deal.walletPendingAmount;
  if (deal?.pendingAmount != null) return deal.pendingAmount;
  const total = deal?.totalAmount ?? 0;
  return Math.max(0, total - dealPaidAmount(deal));
};

export const paidPct = (deal) => {
  const total = deal?.totalLenders || 0;
  return total > 0 ? Math.round((dealPaidCount(deal) / total) * 100) : 0;
};

/** Aggregate stats by CMS type from deal rows (payment_date from lender_cms_payments). */
export const aggregateByType = (deals = []) => {
  const base = {
    LENDERINTEREST: { count: 0, initiated: 0, paid: 0, notPaid: 0, amount: 0, paidAmount: 0, pendingAmount: 0 },
    LENDERPRINCIPAL: { count: 0, initiated: 0, paid: 0, notPaid: 0, amount: 0, paidAmount: 0, pendingAmount: 0 },
    PRINCIPALINTEREST: { count: 0, initiated: 0, paid: 0, notPaid: 0, amount: 0, paidAmount: 0, pendingAmount: 0 },
  };
  deals.forEach((d) => {
    const t = (d.lenderReturnsType || "").toUpperCase();
    if (!base[t]) return;
    base[t].count += 1;
    base[t].initiated += d.totalLenders ?? 0;
    base[t].paid += dealPaidCount(d);
    base[t].notPaid += dealNotPaidCount(d);
    base[t].amount += d.totalAmount || 0;
    base[t].paidAmount += dealPaidAmount(d);
    base[t].pendingAmount += dealNotPaidAmount(d);
  });
  return base;
};
