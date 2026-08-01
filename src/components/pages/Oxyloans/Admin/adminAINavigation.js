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
export const OXYINSIGHTS_PATH = "/adminAIOXYInsights";

/** Always open main Admin AI Dashboard (avoids history back to nested pages). */
export const goToAdminAIDashboard = (navigate) => {
  navigate(ADMIN_AI_DASHBOARD_PATH);
};