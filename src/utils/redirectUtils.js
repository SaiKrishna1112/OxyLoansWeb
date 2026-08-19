// Utility to handle redirecting users back to their last visited step/process upon login
// Excludes public auth pages, registration screens, home page, as well as eSign and eNACH steps.
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
 * Checks whether a given path is an authentication, registration, public, or excluded path.
 * @param {string} pathname 
 * @returns {boolean}
 */
export const isAuthOrExcludedPath = (pathname) => {
  if (!pathname || typeof pathname !== "string") return true;

  let clean = pathname.trim();
  try {
    if (clean.startsWith("http://") || clean.startsWith("https://")) {
      clean = new URL(clean).pathname;
    }
  } catch (e) {
    // ignore
  }

  clean = clean.split("?")[0].split("#")[0].trim().toLowerCase();
  clean = clean.replace(/\/+/g, "/");
  if (clean.length > 1 && clean.endsWith("/")) {
    clean = clean.slice(0, -1);
  }

  if (!clean || clean === "/" || clean === "") return true;

  const excludedPrefixes = [
    "/login",
    "/loginotp",
    "/admlogin",
    "/partnerlogin",
    "/whatsapplogin",
    "/register",
    "/borrower_register",
    "/partnerregister",
    "/register_active_proceed",
    "/usertype",
    "/oxyintro",
    "/forgotpassword",
    "/forgotpassword2",
    "/forgotpassword3",
    "/whatsappuser",
    "/whatappuser",
    "/testimonials",
    "/top-lenders",
    "/escrowdeals",
    "/regularescrowdeals",
  ];

  if (
    excludedPrefixes.some(
      (p) => clean === p || clean.startsWith(p + "/") || clean.startsWith(p + "?")
    )
  ) {
    return true;
  }

  if (
    clean.includes("login") ||
    clean.includes("register") ||
    clean.includes("usertype") ||
    clean.includes("oxyintro") ||
    clean.includes("forgotpassword") ||
    clean.includes("whatsappuser") ||
    clean.includes("whatappuser") ||
    clean.includes("esign") ||
    clean.includes("enach")
  ) {
    return true;
  }

  return false;
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
 * Gets default home/dashboard path for a canonical role.
 * @param {string} role 
 * @returns {string}
 */
export const getDefaultDashboardForRole = (role) => {
  const norm = normalizeRole(role);
  if (norm === "ADMIN") return "/oxyloansadmindashboard";
  if (norm === "LENDER") return "/ai/portfolio";
  if (norm === "PARTNER") return "/patnerdashboard";
  return "/borrowerDashboard";
};

/**
 * Identifies expected role for a given URL path.
 * @param {string} pathname 
 * @returns {string|null} Expected canonical role ("BORROWER", "LENDER", "ADMIN", "PARTNER") or null if generic/auth/public
 */
export const getRoleFromPath = (pathname) => {
  if (!pathname || isAuthOrExcludedPath(pathname)) return null;

  let clean = pathname.trim();
  try {
    if (clean.startsWith("http://") || clean.startsWith("https://")) {
      clean = new URL(clean).pathname;
    }
  } catch (e) {
    // ignore
  }
  clean = clean.split("?")[0].split("#")[0].trim().toLowerCase();

  // Admin routes
  if (
    clean.includes("admin") ||
    clean.startsWith("/emi") ||
    clean.startsWith("/addborrower") ||
    clean.startsWith("/cicreports") ||
    clean.startsWith("/lenderqueries") ||
    clean.startsWith("/borrowerqueries") ||
    clean.startsWith("/resolvedlender") ||
    clean.startsWith("/resolvedborrower") ||
    clean.startsWith("/participatedsix") ||
    clean.startsWith("/walletloadednot") ||
    clean.startsWith("/notparticipated") ||
    clean.startsWith("/onlyonce") ||
    clean.startsWith("/onlytwice") ||
    clean.startsWith("/morethan") ||
    clean.startsWith("/emailwhatsapp") ||
    clean.startsWith("/viewstudent") ||
    clean.startsWith("/viewequity") ||
    clean.startsWith("/viewescrows") ||
    clean.startsWith("/viewtests") ||
    clean.startsWith("/viewsalaried") ||
    clean.startsWith("/lenderloanapplications") ||
    clean.startsWith("/borrowerloanapplications") ||
    clean.startsWith("/updateuserdetails") ||
    clean.startsWith("/assignedusers") ||
    clean.startsWith("/radhadashboard") ||
    clean.startsWith("/usercommentdetails") ||
    clean.startsWith("/mycalls") ||
    clean.startsWith("/participatedamountinfo") ||
    clean.startsWith("/uploadfile") ||
    clean.startsWith("/monthlyinterest") ||
    clean.startsWith("/interestdetailstable") ||
    clean.startsWith("/participationlist") ||
    clean.startsWith("/userparticipationlist") ||
    clean.startsWith("/toplendersinfo") ||
    clean.startsWith("/allreferredetails") ||
    clean.startsWith("/monthlyreturnedinterest") ||
    clean.startsWith("/activelendersparticipation") ||
    clean.startsWith("/failedborrowers") ||
    clean.startsWith("/dealsinfo") ||
    clean.startsWith("/mainadmindashboard") ||
    clean.startsWith("/borrowerdocuments") ||
    clean.startsWith("/lendernearbyborrowers") ||
    clean.startsWith("/borrowernearbylenders")
  ) {
    return "ADMIN";
  }

  // Partner routes
  if (
    clean.includes("partner") ||
    clean.includes("patner") ||
    clean.startsWith("/getlistofborrowerdetails")
  ) {
    return "PARTNER";
  }

  // Borrower routes
  if (
    clean.includes("borrower") ||
    clean.startsWith("/loanrequest") ||
    clean.startsWith("/updatekyc") ||
    clean.startsWith("/post-loan-request") ||
    clean.startsWith("/my-marketplace-loans") ||
    clean.startsWith("/my-oxyscore") ||
    clean.startsWith("/my-loans") ||
    clean.startsWith("/nearbyleders") ||
    clean.startsWith("/agreement")
  ) {
    return "BORROWER";
  }

  // Lender routes
  if (
    clean.includes("lender") ||
    clean === "/dashboard" ||
    clean.startsWith("/ai/portfolio") ||
    clean.startsWith("/ai/plans") ||
    clean.startsWith("/lender-upgrade") ||
    clean.startsWith("/oxai-upgrade") ||
    clean.startsWith("/loadwale") ||
    clean.startsWith("/loadwallet") ||
    clean.startsWith("/withdraw") ||
    clean.startsWith("/spining") ||
    clean.startsWith("/transferwallet") ||
    clean.startsWith("/mywithdrawal") ||
    clean.startsWith("/participatedeal") ||
    clean.startsWith("/todaydeal") ||
    clean.startsWith("/testdeals") ||
    clean.startsWith("/viewcurrentdaydeals") ||
    clean.startsWith("/emicalculator") ||
    clean.startsWith("/configautoinvest") ||
    clean.startsWith("/membership") ||
    clean.startsWith("/referalearings") ||
    clean.startsWith("/viewautohistory") ||
    clean.startsWith("/regularrunningdeal") ||
    clean.startsWith("/myrunningdeals") ||
    clean.startsWith("/mycloseddeals") ||
    clean.startsWith("/myholdamount") ||
    clean.startsWith("/mypartiallcloseddeal") ||
    clean.startsWith("/tickethistory") ||
    clean.startsWith("/fileconvension") ||
    clean.startsWith("/myinterestearning") ||
    clean.startsWith("/myhighvaluedeals") ||
    clean.startsWith("/earningcertificate") ||
    clean.startsWith("/myloansstatement") ||
    clean.startsWith("/referafriend") ||
    clean.startsWith("/myreferalstatus") ||
    clean.startsWith("/wallettowallethistory") ||
    clean.startsWith("/myearnings") ||
    clean.startsWith("/loanlistings") ||
    clean.startsWith("/proximityloans") ||
    clean.startsWith("/offergivenlist") ||
    clean.startsWith("/disbourseloans") ||
    clean.startsWith("/disburseloans") ||
    clean.startsWith("/wallettowallet") ||
    clean.startsWith("/autoinvesthistory") ||
    clean.startsWith("/dashboardtransactions") ||
    clean.startsWith("/interestsdatewise") ||
    clean.startsWith("/marketplace-loans") ||
    clean.startsWith("/negotiation") ||
    clean.startsWith("/nearby-borrowers") ||
    clean.startsWith("/smart-match") ||
    clean.startsWith("/smart-loan-match")
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
  if (!savedUrl || isAuthOrExcludedPath(savedUrl)) return false;
  
  const pathRole = getRoleFromPath(savedUrl);
  if (!pathRole) {
    // Generic protected page (e.g., /notifications, /profile)
    return true;
  }

  const normTarget = normalizeRole(userRole);
  if (!normTarget) return false;

  return pathRole === normTarget;
};

/**
 * Clears all stored last-visited redirection keys.
 */
export const clearLastVisitedUrls = () => {
  try {
    removeItemSafely("localStorage", LAST_VISITED_URL_KEY);
    removeItemSafely("localStorage", LAST_VISITED_ROLE_KEY);
    ["BORROWER", "LENDER", "ADMIN", "PARTNER"].forEach((r) => {
      removeItemSafely("localStorage", `${LAST_VISITED_URL_KEY}_${r}`);
    });
  } catch (e) {
    // ignore
  }
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
      if (savedGlobalUrl && !isAuthOrExcludedPath(savedGlobalUrl)) {
        this.setItem(LAST_VISITED_URL_KEY, savedGlobalUrl);
        if (savedGlobalRole) {
          this.setItem(LAST_VISITED_ROLE_KEY, savedGlobalRole);
        }
      }
      Object.keys(roleUrls).forEach((r) => {
        if (roleUrls[r] && !isAuthOrExcludedPath(roleUrls[r])) {
          this.setItem(`${LAST_VISITED_URL_KEY}_${r}`, roleUrls[r]);
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
  if (!pathname || isAuthOrExcludedPath(pathname)) return;

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
    clearLastVisitedUrls();

    if (savedUrl && !isAuthOrExcludedPath(savedUrl)) {
      if (isUrlCompatibleWithRole(savedUrl, activeRole)) {
        return savedUrl;
      }
    }
  } catch (e) {
    console.error("Error retrieving last visited URL", e);
  }

  if (defaultPath && !isAuthOrExcludedPath(defaultPath)) {
    return defaultPath;
  }

  return getDefaultDashboardForRole(userRole);
};
