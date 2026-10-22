import React from "react";
import { Navigate } from "react-router-dom";
import { isInstantLoanBorrower } from "../../../../utils/redirectUtils";

/**
 * Route guard for pages exclusive to Instant Loan flow (borrower ID 41682).
 * Normal borrowers are safely redirected to the standard /borrowerDashboard.
 */
export const InstantLoanGuard = ({ element: Component }) => {
  const currentUserId =
    sessionStorage.getItem("userId") || localStorage.getItem("userId");

  if (!isInstantLoanBorrower(currentUserId)) {
    return <Navigate to="/borrowerDashboard" replace />;
  }

  return Component;
};

/**
 * Switch route for /borrowerDashboard:
 * - If borrower is 41682: redirects to /instant-borrower-dashboard.
 * - If normal borrower: renders the original / standard BorrowerDashboard.
 */
export const BorrowerDashboardSwitch = ({
  standardElement,
  instantElement,
}) => {
  const currentUserId =
    sessionStorage.getItem("userId") || localStorage.getItem("userId");

  if (isInstantLoanBorrower(currentUserId)) {
    return <Navigate to="/instant-borrower-dashboard" replace />;
  }

  return standardElement;
};

/**
 * Switch route for /borrowerProfile:
 * - If borrower is 41682: redirects to /instant-borrower-profile.
 * - If normal borrower: renders the original / standard BorrowerProfile.
 */
export const BorrowerProfileSwitch = ({
  standardElement,
  instantElement,
}) => {
  const currentUserId =
    sessionStorage.getItem("userId") || localStorage.getItem("userId");

  if (isInstantLoanBorrower(currentUserId)) {
    return <Navigate to="/instant-borrower-profile" replace />;
  }

  return standardElement;
};

/**
 * Guard for Borrower Profile:
 * - If borrower 41682 hasn't completed all steps yet (currentStep < 7 and !isCompleted),
 *   redirects them to /instant-borrower-dashboard so they complete the flow first.
 * - Once completed, allows viewing profile with unlocked sidebar.
 */
export const InstantLoanProfileGuard = ({ element: Component }) => {
  const currentUserId =
    sessionStorage.getItem("userId") || localStorage.getItem("userId");

  if (!isInstantLoanBorrower(currentUserId)) {
    return <Navigate to="/borrowerDashboard" replace />;
  }

  try {
    const raw = localStorage.getItem(`oxy_instant_loan_${currentUserId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.isCompleted || (parsed?.currentStep && parsed.currentStep >= 7)) {
        return Component;
      }
    }
  } catch (e) {
    // ignore
  }

  // Flow is in progress -> redirect to Instant Loan Flow
  return <Navigate to="/instant-borrower-dashboard" replace />;
};

export default InstantLoanGuard;
