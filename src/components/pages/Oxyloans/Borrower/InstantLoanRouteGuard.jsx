import React from "react";
import { Navigate } from "react-router-dom";
import { isInstantLoanBorrower } from "../../../../utils/redirectUtils";

/**
 * Route guard for pages in Instant Loan flow.
 * Accessible for any authenticated borrower testing or using Instant Loan.
 */
export const InstantLoanGuard = ({ element: Component }) => {
  const currentUserId =
    sessionStorage.getItem("userId") || localStorage.getItem("userId");

  // In sandbox / testing, mark active session as instant loan flow
  if (currentUserId) {
    try {
      sessionStorage.setItem("oxy_flow_type", "INSTANT_LOAN");
      localStorage.setItem("oxy_flow_type", "INSTANT_LOAN");
      sessionStorage.setItem("isInstantLoanUser", "true");
      localStorage.setItem("isInstantLoanUser", "true");
    } catch (e) {
      // ignore
    }
  }

  return Component;
};

/**
 * Switch route for /borrowerDashboard:
 * - If borrower is in instant loan flow: redirects to /instant-borrower-dashboard or /borrower/instant-loan/:id.
 * - If normal borrower: renders the original / standard BorrowerDashboard.
 */
export const BorrowerDashboardSwitch = ({
  standardElement,
  instantElement,
}) => {
  const currentUserId =
    sessionStorage.getItem("userId") || localStorage.getItem("userId");

  if (isInstantLoanBorrower(currentUserId)) {
    return <Navigate to={currentUserId ? `/borrower/instant-loan/${currentUserId}` : "/instant-borrower-dashboard"} replace />;
  }

  return standardElement;
};

/**
 * Switch route for /borrowerProfile:
 * - If borrower is in instant loan flow: redirects to /instant-borrower-profile.
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
 * - If borrower hasn't completed all steps yet (currentStep < 7 and !isCompleted),
 *   redirects them to Instant Loan Flow so they complete the flow first.
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
  return <Navigate to={currentUserId ? `/borrower/instant-loan/${currentUserId}` : "/instant-borrower-dashboard"} replace />;
};

/**
 * Switch route for /borrowerLoansInitiated:
 * - If borrower is in instant loan flow: redirects to /borrower/instant-loan/:id.
 * - If normal borrower: renders standard BorrowerLoansInitiated.
 */
export const BorrowerLoansInitiatedSwitch = ({
  standardElement,
}) => {
  const currentUserId =
    sessionStorage.getItem("userId") || localStorage.getItem("userId");

  if (isInstantLoanBorrower(currentUserId)) {
    return <Navigate to={currentUserId ? `/borrower/instant-loan/${currentUserId}` : "/borrower/instant-loan"} replace />;
  }

  return standardElement;
};

export default InstantLoanGuard;
