// Utility to handle redirecting users back to their last visited step/process upon login
// Excludes public auth pages, home page, as well as eSign and eNACH steps.
// Prevents cross-role redirection (e.g. Borrower being redirected to Lender screen or vice versa).

const LAST_VISITED_URL_KEY = "oxy_last_visited_url";
const LAST_VISITED_ROLE_KEY = "oxy_last_visited_role";

const getItemSafely = (storageType, key) => {
  try {
    if (typeof window !== "undefined" && window[storageType]) {
      return window[storageType].getItem(key);
    }
  } catch (e) {
    // ignore
  }
  return null;
};

const setItemSafely = (storageType, key, value) => {
  try {
    if (typeof window !== "undefined" && window[storageType]) {
      window[storageType].setItem(key, value);
    }
  } catch (e) {
    // ignore
  }
};

const removeItemSafely = (storageType, key) => {
  try {
    if (typeof window !== "undefined" && window[storageType]) {
      window[storageType].removeItem(key);
    }
  } catch (e) {
    // ignore
  }
};

/**
 * Normalizes a role string to a canonical role name ("BORROWER", "LENDER", "ADMIN", "PARTNER").
 * @param {string} role 
 * @returns {string|null} Canonical role or upper string
 */
export const normalizeRole = (role) => {
  if (!role || typeof role !== "string") return null;
  const upper = role.trim().toUpperCase();
  if (
    upper === "ADMIN" ||
    upper === "HELPDESKADMIN" ||
    upper === "SUPERADMIN" ||
    upper === "PRIMARYADMIN"
  ) {
    return "ADMIN";
  }
  if (upper === "BORROWER") return "BORROWER";
  if (upper === "LENDER") return "LENDER";
  if (upper === "PARTNER") return "PARTNER";
  return upper;
};

/**
 * Identifies expected role for a given URL path.
 * @param {string} pathname 
 * @returns {string|null} Expected canonical role ("BORROWER", "LENDER", "ADMIN", "PARTNER") or null if generic/auth/public
 */
export const getRoleFromPath = (pathname) => {
  if (!pathname) return null;
  const lower = pathname.toLowerCase();

  // Public/Auth/eSign/eNACH exclusions
  const excludedPaths = [
    "/",
    "/login",
    "/loginotp",
    "/admlogin",
    "/register",
    "/usertype",
    "/borrower_register",
    "/register_active_proceed",
    "/oxyintro",
    "/forgotpassword",
    "/forgotpassword2",
    "/whatsappuser",
    "/whatsapplogin",
    "/whatappuser",
    "/partnerregister",
    "/partnerlogin",
  ];

  if (
    excludedPaths.includes(lower) ||
    lower.includes("esign") ||
    lower.includes("enach")
  ) {
    return null;
  }

  // Admin routes
  if (
    lower.includes("admin") ||
    lower.startsWith("/emi") ||
    lower.startsWith("/addborrower") ||
    lower.startsWith("/cicreports") ||
    lower.startsWith("/lenderqueries") ||
    lower.startsWith("/borrowerqueries") ||
    lower.startsWith("/resolvedlender") ||
    lower.startsWith("/resolvedborrower") ||
    lower.startsWith("/participatedsix") ||
    lower.startsWith("/walletloadednot") ||
    lower.startsWith("/notparticipated") ||
    lower.startsWith("/onlyonce") ||
    lower.startsWith("/onlytwice") ||
    lower.startsWith("/morethan") ||
    lower.startsWith("/emailwhatsapp") ||
    lower.startsWith("/viewstudent") ||
    lower.startsWith("/viewequity") ||
    lower.startsWith("/viewescrows") ||
    lower.startsWith("/viewtests") ||
    lower.startsWith("/viewsalaried") ||
    lower.startsWith("/lenderloanapplications") ||
    lower.startsWith("/borrowerloanapplications") ||
    lower.startsWith("/updateuserdetails") ||
    lower.startsWith("/assignedusers") ||
    lower.startsWith("/radhadashboard") ||
    lower.startsWith("/usercommentdetails") ||
    lower.startsWith("/mycalls") ||
    lower.startsWith("/participatedamountinfo") ||
    lower.startsWith("/uploadfile") ||
    lower.startsWith("/monthlyinterest") ||
    lower.startsWith("/interestdetailstable") ||
    lower.startsWith("/participationlist") ||
    lower.startsWith("/userparticipationlist") ||
    lower.startsWith("/toplendersinfo") ||
    lower.startsWith("/allreferredetails") ||
    lower.startsWith("/monthlyreturnedinterest") ||
    lower.startsWith("/activelendersparticipation") ||
    lower.startsWith("/failedborrowers") ||
    lower.startsWith("/dealsinfo") ||
    lower.startsWith("/mainadmindashboard") ||
    lower.startsWith("/borrowerdocuments") ||
    lower.startsWith("/lendernearbyborrowers") ||
    lower.startsWith("/borrowernearbylenders")
  ) {
    return "ADMIN";
  }

  // Partner routes
  if (
    lower.includes("partner") ||
    lower.includes("patner") ||
    lower.startsWith("/getlistofborrowerdetails")
  ) {
    return "PARTNER";
  }

  // Borrower routes
  if (
    lower.includes("borrower") ||
    lower.startsWith("/loanrequest") ||
    lower.startsWith("/updatekyc") ||
    lower.startsWith("/post-loan-request") ||
    lower.startsWith("/my-marketplace-loans") ||
    lower.startsWith("/my-oxyscore") ||
    lower.startsWith("/my-loans") ||
    lower.startsWith("/nearbyleders") ||
    lower.startsWith("/agreement")
  ) {
    return "BORROWER";
  }

  // Lender routes
  if (
    lower.includes("lender") ||
    lower === "/dashboard" ||
    lower.startsWith("/ai/portfolio") ||
    lower.startsWith("/ai/plans") ||
    lower.startsWith("/lender-upgrade") ||
    lower.startsWith("/oxai-upgrade") ||
    lower.startsWith("/loadwale") ||
    lower.startsWith("/loadwallet") ||
    lower.startsWith("/withdraw") ||
    lower.startsWith("/spining") ||
    lower.startsWith("/transferwallet") ||
    lower.startsWith("/mywithdrawal") ||
    lower.startsWith("/participatedeal") ||
    lower.startsWith("/todaydeal") ||
    lower.startsWith("/testdeals") ||
    lower.startsWith("/viewcurrentdaydeals") ||
    lower.startsWith("/emicalculator") ||
    lower.startsWith("/configautoinvest") ||
    lower.startsWith("/membership") ||
    lower.startsWith("/referalearings") ||
    lower.startsWith("/viewautohistory") ||
    lower.startsWith("/regularrunningdeal") ||
    lower.startsWith("/myrunningdeals") ||
    lower.startsWith("/mycloseddeals") ||
    lower.startsWith("/myholdamount") ||
    lower.startsWith("/mypartiallcloseddeal") ||
    lower.startsWith("/tickethistory") ||
    lower.startsWith("/fileconvension") ||
    lower.startsWith("/myinterestearning") ||
    lower.startsWith("/myhighvaluedeals") ||
    lower.startsWith("/earningcertificate") ||
    lower.startsWith("/myloansstatement") ||
    lower.startsWith("/referafriend") ||
    lower.startsWith("/myreferalstatus") ||
    lower.startsWith("/wallettowallethistory") ||
    lower.startsWith("/myearnings") ||
    lower.startsWith("/loanlistings") ||
    lower.startsWith("/proximityloans") ||
    lower.startsWith("/offergivenlist") ||
    lower.startsWith("/disbourseloans") ||
    lower.startsWith("/disburseloans") ||
    lower.startsWith("/wallettowallet") ||
    lower.startsWith("/autoinvesthistory") ||
    lower.startsWith("/dashboardtransactions") ||
    lower.startsWith("/interestsdatewise") ||
    lower.startsWith("/marketplace-loans") ||
    lower.startsWith("/negotiation") ||
    lower.startsWith("/nearby-borrowers") ||
    lower.startsWith("/smart-match") ||
    lower.startsWith("/smart-loan-match") ||
    lower.startsWith("/escrowdeals") ||
    lower.startsWith("/regularescrowdeals") ||
    lower.startsWith("/top-lenders")
  ) {
    return "LENDER";
  }

  return null;
};

/**
 * Checks if a target URL is compatible with the given role.
 * @param {string} savedUrl 
 * @param {string} userRole 
 * @returns {boolean}
 */
export const isUrlCompatibleWithRole = (savedUrl, userRole) => {
  if (!savedUrl) return false;
  const pathRole = getRoleFromPath(savedUrl);
  if (!pathRole) return true; // Generic page (e.g., /notifications), allowed for any role

  const normTarget = normalizeRole(userRole);
  if (!normTarget) return false;

  return pathRole === normTarget;
};

// Preserve last visited URL across localStorage.clear() calls (e.g. during logout)
if (typeof window !== "undefined" && window.localStorage) {
  const originalClear = Storage.prototype.clear;
  Storage.prototype.clear = function () {
    let savedGlobalUrl = null;
    let savedGlobalRole = null;
    const roleUrls = {};

    try {
      savedGlobalUrl = this.getItem(LAST_VISITED_URL_KEY);
      savedGlobalRole = this.getItem(LAST_VISITED_ROLE_KEY);
      ["BORROWER", "LENDER", "ADMIN", "PARTNER"].forEach((r) => {
        const val = this.getItem(`${LAST_VISITED_URL_KEY}_${r}`);
        if (val) roleUrls[r] = val;
      });
    } catch (e) {
      // ignore
    }

    originalClear.call(this);

    try {
      if (savedGlobalUrl) {
        const lower = savedGlobalUrl.toLowerCase();
        if (!lower.includes("esign") && !lower.includes("enach") && !lower.includes("/login")) {
          this.setItem(LAST_VISITED_URL_KEY, savedGlobalUrl);
          if (savedGlobalRole) {
            this.setItem(LAST_VISITED_ROLE_KEY, savedGlobalRole);
          }
        }
      }
      Object.keys(roleUrls).forEach((r) => {
        const lower = roleUrls[r].toLowerCase();
        if (!lower.includes("esign") && !lower.includes("enach") && !lower.includes("/login")) {
          this.setItem(`${LAST_VISITED_URL_KEY}_${r}`, lower.includes("esign") || lower.includes("enach") ? "" : roleUrls[r]);
        }
      });
    } catch (e) {
      // ignore
    }
  };
}

/**
 * Saves the current path as the last visited URL if it is a valid process/step page.
 * @param {string} pathname 
 * @param {string} search 
 */
export const saveLastVisitedUrl = (pathname, search = "") => {
  if (!pathname) return;

  const lowerPath = pathname.toLowerCase();
  const excludedPaths = [
    "/",
    "/login",
    "/loginotp",
    "/admlogin",
    "/register",
    "/usertype",
    "/borrower_register",
    "/register_active_proceed",
    "/oxyintro",
    "/forgotpassword",
    "/forgotpassword2",
    "/whatsappuser",
    "/whatsapplogin",
    "/whatappuser",
    "/partnerregister",
    "/partnerlogin",
  ];

  if (
    excludedPaths.includes(lowerPath) ||
    lowerPath.includes("esign") ||
    lowerPath.includes("enach")
  ) {
    return;
  }

  const fullUrl = pathname + (search || "");
  let activeRole =
    getItemSafely("localStorage", "primaryType") ||
    getItemSafely("sessionStorage", "primaryType") ||
    getRoleFromPath(pathname);

  activeRole = normalizeRole(activeRole);

  setItemSafely("localStorage", LAST_VISITED_URL_KEY, fullUrl);
  if (activeRole) {
    setItemSafely("localStorage", LAST_VISITED_ROLE_KEY, activeRole);
    setItemSafely("localStorage", `${LAST_VISITED_URL_KEY}_${activeRole}`, fullUrl);
  }
};

/**
 * Retrieves the saved redirect URL after login and clears it from storage.
 * Ensures that the saved URL matches the logging-in user's role.
 * Falls back to defaultPath if no valid/compatible saved URL exists.
 * @param {string} defaultPath 
 * @param {string|null} userRole 
 * @returns {string} Target URL to navigate to
 */
export const getPostLoginRedirectUrl = (defaultPath = "/borrowerDashboard", userRole = null) => {
  try {
    let activeRole =
      userRole ||
      getItemSafely("localStorage", "primaryType") ||
      getItemSafely("sessionStorage", "primaryType") ||
      getRoleFromPath(defaultPath);

    activeRole = normalizeRole(activeRole);

    let savedUrl = null;

    // 1. Check role-specific storage key first
    if (activeRole) {
      savedUrl = getItemSafely("localStorage", `${LAST_VISITED_URL_KEY}_${activeRole}`);
    }

    // 2. Fallback to global storage key
    if (!savedUrl) {
      savedUrl = getItemSafely("localStorage", LAST_VISITED_URL_KEY);
      const savedRole = normalizeRole(getItemSafely("localStorage", LAST_VISITED_ROLE_KEY));

      // If global savedUrl was recorded under a DIFFERENT role, reject it
      if (savedRole && activeRole && savedRole !== activeRole) {
        savedUrl = null;
      }
    }

    // 3. Clear stored redirect URLs so subsequent logins don't reuse old paths
    if (activeRole) {
      removeItemSafely("localStorage", `${LAST_VISITED_URL_KEY}_${activeRole}`);
    }
    removeItemSafely("localStorage", LAST_VISITED_URL_KEY);
    removeItemSafely("localStorage", LAST_VISITED_ROLE_KEY);

    if (savedUrl) {
      const lower = savedUrl.toLowerCase();
      if (
        !lower.includes("esign") &&
        !lower.includes("enach") &&
        !lower.includes("/login") &&
        !lower.includes("/admlogin")
      ) {
        // Validate URL role compatibility
        if (isUrlCompatibleWithRole(savedUrl, activeRole)) {
          return savedUrl;
        }
      }
    }
  } catch (e) {
    console.error("Error retrieving last visited URL", e);
  }
  return defaultPath;
};
