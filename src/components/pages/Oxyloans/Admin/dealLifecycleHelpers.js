/** Admin deal lifecycle — how OxyLoans stages differ */

export const DEAL_LIFECYCLE_STAGES = {
  OPEN_FOR_PARTICIPATION: {
    id: "OPEN_FOR_PARTICIPATION",
    legacyDealType: "RUNNING",
    label: "Open for participation",
    shortLabel: "Open",
    badgeClass: "bg-primary",
    color: "#2563eb",
    icon: "fas fa-door-open",
    description:
      "Lenders can still join. Deal amount is not fully matched and/or the participation window (funds acceptance end date) has not ended.",
    adminAction: "Monitor fill %, ROI band, and WhatsApp outreach to lenders.",
  },
  ACTIVE_LOAN: {
    id: "ACTIVE_LOAN",
    legacyDealType: "ACTIVE_LOAN",
    label: "Active loan",
    shortLabel: "Loan running",
    badgeClass: "bg-success",
    color: "#059669",
    icon: "fas fa-hand-holding-usd",
    description:
      "Participation target is achieved. Borrower is on monthly interest; principal may still be outstanding.",
    adminAction: "Track interest payouts, ENACH, spread, and maturity / close timing.",
  },
  BORROWER_CLOSED: {
    id: "BORROWER_CLOSED",
    legacyDealType: "BORROWER_CLOSED",
    label: "Borrower closed",
    shortLabel: "Closed",
    badgeClass: "bg-secondary",
    color: "#64748b",
    icon: "fas fa-flag-checkered",
    description:
      "Borrower obligation on this deal is closed. Lenders have received (or are receiving) final principal return.",
    adminAction: "Archive, reconcile final CMS entries, and plan relaunch if lenders reinvest.",
  },
};

export const DEAL_LIFECYCLE_ORDER = [
  DEAL_LIFECYCLE_STAGES.OPEN_FOR_PARTICIPATION,
  DEAL_LIFECYCLE_STAGES.ACTIVE_LOAN,
  DEAL_LIFECYCLE_STAGES.BORROWER_CLOSED,
];

const normalizeClosing = (value) => {
  const v = String(value || "").trim().toUpperCase();
  if (v === "CLOSED") return "CLOSED";
  return "NOTYETCLOSED";
};

const normalizeParticipation = (fundingStatus) => {
  const v = String(fundingStatus || "").toLowerCase();
  if (v.includes("achieved") && !v.includes("yet")) return "ACHIEVED";
  if (v.includes("future")) return "OPENINFUTURE";
  return "NOTATACHIEVED";
};

export const parseDealDate = (value) => {
  if (!value || value === " ") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const isParticipationWindowOpen = (deal) => {
  const end = parseDealDate(deal?.fundsAcceptanceEndDate);
  if (end) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    if (end >= today) return true;
  }
  const fill = Number(deal?.fillPercent);
  return fill > 0 && fill < 100;
};

export const classifyDealLifecycle = (deal) => {
  const closing = normalizeClosing(
    deal?.borrowerClosingStatus || deal?.borrowerDealClosingStatus
  );
  const participation = normalizeParticipation(deal?.fundingStatus);

  if (closing === "CLOSED") return "BORROWER_CLOSED";
  if (participation === "ACHIEVED") return "ACTIVE_LOAN";
  return "OPEN_FOR_PARTICIPATION";
};

export const lifecycleStageMeta = (stageId) =>
  DEAL_LIFECYCLE_STAGES[stageId] || DEAL_LIFECYCLE_STAGES.OPEN_FOR_PARTICIPATION;

export const categoryToLegacyDealType = (category) => {
  const stage = DEAL_LIFECYCLE_STAGES[category];
  if (stage) return stage.legacyDealType;
  if (category === "PARTICIPATION_CLOSED") return "CLOSED";
  if (category === "RUNNING") return "RUNNING";
  return "RUNNING";
};

export const enrichDealRow = (deal) => {
  const dealAmount = Number(deal?.dealAmount) || 0;
  const participated = Number(deal?.dealPaticipatedAmount ?? deal?.participatedAmount) || 0;
  const fillPercent = dealAmount > 0 ? Math.round((participated / dealAmount) * 100) : 0;
  const fundingStatus = deal?.fundingStatus || "";
  const borrowerClosingStatus = normalizeClosing(
    deal?.borrowerDealClosingStatus || deal?.borrowerClosingStatus
  );
  const base = {
    dealId: deal?.dealId,
    dealName: deal?.dealName || "",
    borrowerName: deal?.borrowerName || "",
    dealAmount,
    participatedAmount: participated,
    currentAmount: Number(deal?.dealCurrentAmount) || 0,
    participationCount: deal?.participationCount ?? 0,
    rateOfInterest: Number(deal?.rateOfInterest) || 0,
    lenderRoi: Number(deal?.rateOfInterest) || 0,
    borrowerRateOfInterest: Number(deal?.borrowerRateOfInterest) || 0,
    borrowerRoi: Number(deal?.borrowerRateOfInterest) || 0,
    loanActiveDate: deal?.loanActiveDate || "",
    emiEndDate: deal?.emiEndDate || "",
    fundsAcceptanceStartDate: deal?.fundsAcceptanceStartDate || "",
    fundsAcceptanceEndDate: deal?.fundsAcceptanceEndDate || "",
    fundingStatus,
    borrowerClosingStatus,
    agreementsStatus:
      deal?.agreementsGenerationStatus || deal?.AgreementsGenerationStatus || "PENDING",
    fillPercent,
  };
  const lifecycleStage = classifyDealLifecycle(base);
  return {
    ...base,
    lifecycleStage,
    lifecycleLabel: lifecycleStageMeta(lifecycleStage).label,
    participationWindowOpen: isParticipationWindowOpen(base),
  };
};

export const filterDealsForCategory = (deals, category) => {
  if (!category || category === "PARTICIPATION_CLOSED") return deals;
  const stage = DEAL_LIFECYCLE_STAGES[category];
  if (!stage) return deals;
  return deals.filter((d) => d.lifecycleStage === stage.id);
};

export const summaryCountForStage = (summary, stageId) => {
  if (!summary) return null;
  switch (stageId) {
    case "OPEN_FOR_PARTICIPATION":
      return summary.openForParticipationCount ?? summary.runningCount;
    case "ACTIVE_LOAN":
      return summary.activeLoanCount;
    case "BORROWER_CLOSED":
      return summary.borrowerClosedCount;
    default:
      return null;
  }
};
