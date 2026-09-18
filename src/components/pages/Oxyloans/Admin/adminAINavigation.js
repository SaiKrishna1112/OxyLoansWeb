/**
 * Close / back navigation for Admin AI pages.
 * Prefer browser history so we don't remount Admin AI Dashboard and wait ~1 min.
 */
export const goBackOrAdminAI = (navigate, fallback = "/adminAIDashboard") => {
  if (typeof window !== "undefined" && window.history.length > 1) {
    navigate(-1);
    return;
  }
  navigate(fallback);
};

export const ADMIN_AI_DASHBOARD_PATH = "/adminAIDashboard";
export const YEAR_WISE_REFERRALS_PATH = "/adminAIDashboard?panel=yearWiseReferrals";
export const YEAR_WISE_DEALS_PATH = "/adminAIDashboard?panel=yearWiseDeals";
export const OXYINSIGHTS_PATH = "/adminAIOXYInsights";

export const buildYearWiseDealsListPath = ({
  year = 0,
  dealType = "ALL",
  tenureCategory = "ALL",
  section = "regular",
} = {}) => {
  const params = new URLSearchParams();
  params.set("year", String(year == null || Number(year) <= 0 ? 0 : year));
  params.set("dealType", dealType || "ALL");
  if (tenureCategory && tenureCategory !== "ALL") {
    params.set("tenureCategory", tenureCategory);
  }
  params.set("section", section || "regular");
  return `/adminAIYearWiseDealsList?${params.toString()}`;
};

/** Open YearWise Deals summary (not main dashboard home). */
export const goToYearWiseDeals = (navigate) => {
  navigate(YEAR_WISE_DEALS_PATH);
};

/** Always open main Admin AI Dashboard home. */
export const goToAdminAIDashboard = (navigate) => {
  navigate(ADMIN_AI_DASHBOARD_PATH);
};