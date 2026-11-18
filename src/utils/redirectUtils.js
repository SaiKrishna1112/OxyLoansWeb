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
    // Auth & Onboarding
    "/login",
    "/loginotp",
    "/admlogin",
    "/partnerlogin",
    "/whatsapplogin",
    "/whatapplog",
    "/register",
    "/borrower_register",
    "/borrower-register",
    "/borrowerregister",
    "/instant-register",
    "/partnerregister",
    "/register_active_proceed",
    "/register-step2-test",
    "/dark-login",
    "/dark-signup",
    "/usertype",
    "/oxyintro",
    "/forgotpassword",
    "/forgotpassword2",
    "/forgotpassword3",
    "/whatsappuser",
    "/whatappuser",
    "/otplogin",
    "/glogin-test",
    "/signup",

    // Landing & Public Marketing / Static Screens
    "/landing",
    "/home",
    "/team",
    "/management",
    "/team-management",
    "/our-team",
    "/advisory-team",
    "/advisory-board",
    "/advisory",
    "/our-advisory-team",
    "/blogs",
    "/blog",
    "/faqs",
    "/faq",
    "/lender-faq",
    "/borrower-faq",
    "/lender-faqs",
    "/borrower-faqs",
    "/how-it-works",
    "/howitworks",
    "/rbi-directions",
    "/rbidirections",
    "/transparency",
    "/transparency-and-disclosure-requirements",
    "/transparency-and-disclosures",
    "/know-your-earnings",
    "/knowyourearnings",
    "/know-my-earnings",
    "/know-your-tax",
    "/knowyourtax",
    "/know-your-fees",
    "/knowyourfees",
    "/know-your-fee",
    "/knowyourfee",
    "/contact-us",
    "/contactus",
    "/contact",
    "/privacy-policy",
    "/privacypolicy",
    "/terms-and-conditions",
    "/terms",
    "/terms-of-use",
    "/grievance-redressal-mechanism",
    "/grievances-redressal-mechanism",
    "/grievance-redressal",
    "/grievances-redressal",
    "/grievance",
    "/grievances",
    "/latest-egm-notice",
    "/latestegmnotice",
    "/latest-egm",
    "/latestegm",
    "/egm-notice",
    "/loan-performance",
    "/loanperformance",
    "/loan-performance-details",
    "/travel-loans",
    "/travelloans",
    "/travel-loan",
    "/travelloan",
    "/motor-loans",
    "/motorloans",
    "/motor-loan",
    "/motorloan",
    "/personal-loans",
    "/personalloans",
    "/personal-loan",
    "/personalloan",
    "/sme-loans",
    "/smeloans",
    "/sme-loan",
    "/smeloan",
    "/international-business-expansion-loans",
    "/international-business-expansion",
    "/international-business-loans",
    "/business-loans",
    "/businessloans",
    "/business-loan",
    "/businessloan",
    "/testimonials",
    "/top-lenders",
    "/why-lend",
    "/why-lend-at-oxyloans",
    "/why-borrow",
    "/why-borrow-at-oxyloans",
    "/escrowdeals",
    "/regularescrowdeals"
  ];

  if (
    clean === "/lender" ||
    clean === "/lenders" ||
    clean.startsWith("/lender?") ||
    clean.startsWith("/lenders?") ||
    clean === "/borrower" ||
    clean === "/borrowers" ||
    clean.startsWith("/borrower?") ||
    clean.startsWith("/borrowers?")
  ) {
    return true;
  }

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
    clean.includes("enach") ||
    clean.includes("landing") ||
    clean.includes("team-management") ||
    clean.includes("advisory") ||
    clean.includes("faq") ||
    clean.includes("how-it-works") ||
    clean.includes("howitworks") ||
    clean.includes("transparency") ||
    clean.includes("rbi-direction") ||
    clean.includes("contact") ||
    clean.includes("privacy-policy") ||
    clean.includes("terms") ||
    clean.includes("grievance")
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
export const getDefaultDashboardForRole = (role, userId = null) => {
  const norm = normalizeRole(role);
  const resolvedId =
    userId ||
    getItemSafely("sessionStorage", "userId") ||
    getItemSafely("localStorage", "userId");

  if (norm === "ADMIN") return "/oxyloansadmindashboard";
  if (norm === "LENDER") return resolvedId ? `/lenderAIDashboard/${resolvedId}` : "/ai/portfolio";
  if (norm === "PARTNER") return "/patnerdashboard";
  if (norm === "BORROWER") {
    if (isInstantLoanBorrower(resolvedId)) return "/instant-borrower-dashboard";
    return "/borrowerDashboard";
  }
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
    clean.startsWith("/borrowerslist") ||
    clean.startsWith("/borrowerdocumentslist") ||
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
    clean.startsWith("/deal-consent") ||
    clean.startsWith("/dealconsent") ||
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
    clean.startsWith("/Month-wise-interest") ||
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
  const normTarget = normalizeRole(userRole);
  if (!normTarget) return false;

  if (pathRole) {
    return pathRole === normTarget;
  }

  // If pathRole is null, ONLY allow explicit generic protected user routes
  const clean = savedUrl.split("?")[0].split("#")[0].trim().toLowerCase();
  const allowedGenericProtected = [
    "/notifications",
    "/profile",
    "/userprofile",
    "/myprofile"
  ];

  return allowedGenericProtected.some((p) => clean === p || clean.startsWith(p + "/"));
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

// Note: Storage.prototype.clear is kept clean so that logout completely resets sessions and redirect targets.

/**
 * Saves the current path as the last visited URL if it is a valid process/step page.
 * @param {string} pathname 
 * @param {string} search 
 */
export const saveLastVisitedUrl = (pathname, search = "") => {
  if (!pathname || isAuthOrExcludedPath(pathname)) return;

  // IMPORTANT: Only save last visited URL for authenticated sessions!
  // Unauthenticated guests browsing landing or marketing pages must NEVER set redirect targets.
  const hasAuth = !!(
    getItemSafely("sessionStorage", "accessToken") ||
    getItemSafely("localStorage", "accessToken")
  );
  if (!hasAuth) return;

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
 * Checks if a given user is designated or navigating within the instant loan flow.
 * @param {string|number|null} userId 
 * @returns {boolean}
 */
export const isInstantLoanBorrower = (userId = null) => {
  // 1. Persistent flow flag stored during registration or tester entry
  if (
    getItemSafely("localStorage", "oxy_flow_type") === "INSTANT_LOAN" ||
    getItemSafely("sessionStorage", "oxy_flow_type") === "INSTANT_LOAN" ||
    getItemSafely("localStorage", "isInstantLoanUser") === "true" ||
    getItemSafely("sessionStorage", "isInstantLoanUser") === "true"
  ) {
    return true;
  }

  // 3. Dynamic check on current browser window URL (e.g. ?type=instant or ?flow=instant)
  if (typeof window !== "undefined" && window.location) {
    try {
      const search = window.location.search || "";
      const pathname = (window.location.pathname || "").toLowerCase();
      const params = new URLSearchParams(search);
      const flowParam = (
        params.get("type") ||
        params.get("flow") ||
        params.get("flowType") ||
        params.get("mode") ||
        ""
      ).toLowerCase();

      if (
        flowParam === "instant" ||
        flowParam === "instant_loan" ||
        flowParam === "instantloan" ||
        flowParam === "instant-loan" ||
        pathname.includes("instant-borrower") ||
        pathname.includes("instant-loan") ||
        pathname.includes("instant-register")
      ) {
        setItemSafely("localStorage", "oxy_flow_type", "INSTANT_LOAN");
        setItemSafely("sessionStorage", "oxy_flow_type", "INSTANT_LOAN");
        setItemSafely("localStorage", "isInstantLoanUser", "true");
        setItemSafely("sessionStorage", "isInstantLoanUser", "true");
        return true;
      }
    } catch (e) {
      // ignore
    }
  }

  return false;
};

/**
 * Retrieves the saved redirect URL after login and clears it from storage.
 * Ensures that the saved URL matches the logging-in user's role.
 * Falls back to defaultPath if no valid/compatible saved URL exists.
 * @param {string} defaultPath 
 * @param {string|null} userRole 
 * @param {string|number|null} userId 
 * @returns {string} Target URL to navigate to
 */
export const getPostLoginRedirectUrl = (defaultPath = "/borrowerDashboard", userRole = null, userId = null) => {
  let effectiveDefaultPath = defaultPath;
  try {
    let activeRole =
      userRole ||
      getItemSafely("localStorage", "primaryType") ||
      getItemSafely("sessionStorage", "primaryType") ||
      getRoleFromPath(defaultPath);

    activeRole = normalizeRole(activeRole);

    if (activeRole === "BORROWER") {
      if (isInstantLoanBorrower(userId)) {
        if (effectiveDefaultPath === "/borrowerDashboard" || effectiveDefaultPath === "/borrowerDashboard/admin$") {
          effectiveDefaultPath = "/instant-borrower-dashboard";
        }
      } else {
        if (effectiveDefaultPath.startsWith("/instant-borrower-dashboard") || effectiveDefaultPath.startsWith("/borrower/instant-dashboard")) {
          effectiveDefaultPath = "/borrowerDashboard";
        }
      }
    }

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
        if (activeRole === "BORROWER") {
          if (isInstantLoanBorrower(userId)) {
            if (savedUrl === "/borrowerDashboard" || savedUrl === "/borrowerDashboard/admin$") {
              savedUrl = "/instant-borrower-dashboard";
            } else if (savedUrl === "/borrowerProfile") {
              savedUrl = "/instant-borrower-profile";
            }
          } else {
            if (savedUrl.startsWith("/instant-borrower-") || savedUrl.startsWith("/borrower/instant-")) {
              savedUrl = "/borrowerDashboard";
            }
          }
        }
        // If last visit screen params have lenderId where /lenderAIDashboard/:lenderId,
        // check the id with the present login id (just for lenderid only)
        const lenderPathMatch = savedUrl.match(/\/lenderAIDashboard\/([^\/\?#]+)/i);
        let lastVisitLenderId = lenderPathMatch ? lenderPathMatch[1] : null;
        let isQueryParam = false;

        if (!lastVisitLenderId && savedUrl.toLowerCase().includes("/lenderaidashboard")) {
          try {
            const searchIndex = savedUrl.indexOf("?");
            if (searchIndex !== -1) {
              const qParams = new URLSearchParams(savedUrl.slice(searchIndex));
              const qId = qParams.get("lenderId") || qParams.get("id");
              if (qId) {
                lastVisitLenderId = qId;
                isQueryParam = true;
              }
            }
          } catch {
            // ignore
          }
        }

        if (lastVisitLenderId) {
          const presentLoginId =
            getItemSafely("sessionStorage", "userId") ||
            getItemSafely("localStorage", "userId") ||
            (defaultPath ? defaultPath.match(/\/lenderAIDashboard\/([^\/\?#]+)/i)?.[1] : null);

          const ID_ALIASES = { "72271": "27127" };
          const resolvedLastVisitId = ID_ALIASES[lastVisitLenderId] || lastVisitLenderId;
          const resolvedPresentId = presentLoginId
            ? (ID_ALIASES[String(presentLoginId)] || String(presentLoginId))
            : null;

          if (resolvedPresentId && String(resolvedLastVisitId) !== String(resolvedPresentId)) {
            // Last visit screen param id does not match present login id:
            // Update to use the present login id
            if (isQueryParam) {
              const [base, query] = savedUrl.split("?");
              const qParams = new URLSearchParams(query);
              if (qParams.has("lenderId")) qParams.set("lenderId", resolvedPresentId);
              if (qParams.has("id")) qParams.set("id", resolvedPresentId);
              savedUrl = `${base}?${qParams.toString()}`;
            } else {
              savedUrl = savedUrl.replace(
                new RegExp(`/lenderAIDashboard/${lastVisitLenderId}`, "i"),
                `/lenderAIDashboard/${resolvedPresentId}`
              );
            }
          }
        }

        return savedUrl;
      }
    }
  } catch (e) {
    console.error("Error retrieving last visited URL", e);
  }

  if (effectiveDefaultPath && !isAuthOrExcludedPath(effectiveDefaultPath)) {
    return effectiveDefaultPath;
  }

  return getDefaultDashboardForRole(userRole);
};
