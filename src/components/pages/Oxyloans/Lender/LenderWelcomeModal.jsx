import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { lenderWelcome10Years } from "../../../imagepath";
import "./LenderWelcomeModal.css";

const DEFAULT_DISMISS_KEY = "oxy_lender_welcome_dismissed";

/**
 * Global helper to manually open the lender welcome modal from anywhere in the application.
 */
export const openLenderWelcomeModal = () => {
  window.dispatchEvent(new CustomEvent("open-lender-welcome"));
};

/**
 * Verifies whether the current user is strictly a LENDER.
 * Never allows borrowers, admins, partners, or unauthenticated guests.
 */
export const isLenderOnly = () => {
  try {
    // 1. Must be authenticated
    const token =
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken");
    if (!token || token === "null" || token === "undefined") {
      return false;
    }

    // 2. Reject public / auth / registration screens
    const pathname = (window.location.pathname || "").toLowerCase();
    const publicPages = [
      "/login",
      "/loginotp",
      "/signup",
      "/admlogin",
      "/partnerlogin",
      "/register",
      "/borrower_register",
      "/register_active_proceed",
      "/register-step2-test",
      "/dark-login",
      "/dark-signup",
      "/oxyintro",
      "/forgotpassword",
      "/forgotpassword2",
      "/forgotpassword3",
      "/whatsappuser",
      "/whatappuser",
      "/top-lenders",
      "/testimonials",
      "/escrowdeals",
      "/regularescrowdeals"
    ];
    if (
      pathname === "/" ||
      pathname === "" ||
      publicPages.some((p) => pathname === p || pathname.startsWith(p + "/"))
    ) {
      return false;
    }

    // 3. User role check
    const primaryType = (
      sessionStorage.getItem("primaryType") ||
      localStorage.getItem("primaryType") ||
      ""
    ).trim().toUpperCase();

    const groupName = (
      sessionStorage.getItem("groupName") ||
      localStorage.getItem("groupName") ||
      ""
    ).trim().toUpperCase();

    // If explicit borrower, admin, partner, etc. - NEVER show!
    if (
      primaryType.includes("BORROWER") ||
      primaryType.includes("ADMIN") ||
      primaryType.includes("PARTNER") ||
      groupName.includes("BORROWER") ||
      groupName.includes("ADMIN") ||
      groupName.includes("PARTNER")
    ) {
      return false;
    }

    // Must be lender
    if (primaryType === "LENDER" || groupName === "LENDER") {
      return true;
    }

    // Fallback: If role is not yet stored, infer only from distinct lender routes
    const lenderRoutes = [
      "/lenderaidashboard",
      "/lender-portfolio",
      "/ai/portfolio",
      "/dashboard",
      "/todaydeal",
      "/myrunningdeals",
      "/participatedeal",
      "/mycloseddeals",
      "/myoffers",
      "/myinterestearning",
      "/myloansstatement",
      "/myearnings",
      "/transferwallettowallet",
      "/mywithdrawalhistory",
      "/viewcurrentdaydeals",
      "/loadwallet"
    ];
    if (
      lenderRoutes.some(
        (lr) =>
          pathname === lr ||
          pathname.startsWith(lr + "/") ||
          pathname.startsWith(lr + "?")
      )
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

/**
 * LenderWelcomeModal
 * 
 * Celebratory 10th Anniversary Welcome Modal strictly for Lenders.
 * Shows upon lender login across any landing page (even if last path was not dashboard).
 * "Continue to Dashboard" seamlessly navigates them to their dashboard.
 * Close (X) dismisses the modal while keeping them on their current page.
 */
const LenderWelcomeModal = ({
  forceOpen = false,
  autoOpen = true,
  storageKey = DEFAULT_DISMISS_KEY,
  onClose,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const navigate = useNavigate();
  const location = useLocation();

  // Check display conditions
  useEffect(() => {
    // If not a lender, never open automatically
    if (!forceOpen && !isLenderOnly()) {
      return;
    }

    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    if (!autoOpen) return;

    // Check URL parameters for explicit override (?welcome=true or ?anniversary=true)
    const searchParams = new URLSearchParams(window.location.search);
    const hasQueryOverride =
      searchParams.get("welcome") === "true" ||
      searchParams.get("welcome") === "1" ||
      searchParams.get("anniversary") === "true" ||
      searchParams.get("anniversary") === "1";

    if (hasQueryOverride) {
      setIsOpen(true);
      return;
    }

    // Check if already dismissed in this session
    const isDismissed = sessionStorage.getItem(storageKey) === "1";
    if (!isDismissed) {
      // Delay slightly for smooth page entrance transition
      const timer = setTimeout(() => {
        if (isLenderOnly()) {
          setIsOpen(true);
        }
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [forceOpen, autoOpen, storageKey, location.pathname]);

  // Listen for programmatic open events (e.g. from Header button)
  useEffect(() => {
    const handleCustomOpen = () => {
      if (isLenderOnly()) {
        setIsOpen(true);
      }
    };

    window.addEventListener("open-lender-welcome", handleCustomOpen);
    return () => {
      window.removeEventListener("open-lender-welcome", handleCustomOpen);
    };
  }, []);

  // Dismiss without navigating (stay on current page)
  const handleDismiss = useCallback(() => {
    sessionStorage.setItem(storageKey, "1");
    setIsOpen(false);
    if (onClose) onClose();
  }, [storageKey, onClose]);

  // Auto-close modal after 10 seconds
  useEffect(() => {
    if (!isOpen) return;

    setTimeLeft(10);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, handleDismiss]);

  // "Continue to Dashboard" action: Dismiss & navigate to dashboard if on another page
  const handleContinueToDashboard = useCallback(() => {
    sessionStorage.setItem(storageKey, "1");
    setIsOpen(false);
    if (onClose) onClose();

    const pathname = (location?.pathname || window.location.pathname || "").toLowerCase();
    const isAlreadyOnDashboard =
      pathname.startsWith("/lenderaidashboard") ||
      pathname === "/dashboard" ||
      pathname.startsWith("/lender-portfolio") ||
      pathname.startsWith("/ai/portfolio");

    if (!isAlreadyOnDashboard) {
      const userId =
        sessionStorage.getItem("userId") ||
        localStorage.getItem("userId") ||
        "";
      const target = userId ? `/lenderAIDashboard/${userId}` : "/lenderAIDashboard";
      navigate(target);
    }
  }, [storageKey, onClose, location, navigate]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleDismiss();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleDismiss]);

  if (!isOpen) return null;

  return (
    <div
      className="lender-welcome-backdrop"
      role="presentation"
      onClick={handleDismiss}
    >
      <div
        className="lender-welcome-container"
        role="dialog"
        aria-modal="true"
        aria-label="Welcome Back - 10 Years of Oxyloans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Celebration Sparkles around card */}
        <div className="lender-welcome-sparkles" aria-hidden="true">
          <div className="lender-sparkle sp-gold-1" />
          <div className="lender-sparkle sp-gold-2" />
          <div className="lender-sparkle sp-green-1" />
          <div className="lender-sparkle sp-green-2" />
          <div className="lender-sparkle sp-circle-1" />
          <div className="lender-sparkle sp-circle-2" />
        </div>

        {/* Modal Card */}
        <div className="lender-welcome-card">
          {/* 10s Auto-Close Progress Bar Track & Fill */}
          <div className="lender-welcome-progress-bar-track" aria-hidden="true">
            <div className="lender-welcome-progress-bar-fill" />
          </div>

          {/* 10s Auto-Close Countdown Pill */}
          <div
            className="lender-welcome-countdown-pill"
            aria-label={`Auto-closing in ${timeLeft} seconds`}
            title={`Auto-closing in ${timeLeft} seconds`}
          >
            <svg viewBox="0 0 24 24" fill="none" className="timer-icon" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <polyline points="12 7 12 12 15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Auto-closes in {timeLeft}s</span>
          </div>

          <img
            src={lenderWelcome10Years}
            alt="Welcome Back to Oxyloans - Celebrating 10 Years"
            className="lender-welcome-img"
          />

          {/* Accessible Close Button */}
          <button
            type="button"
            className="lender-welcome-close-btn"
            onClick={handleDismiss}
            aria-label="Close welcome message"
            title="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Interactive Feature Badges Tooltips */}
          <div
            className="lender-welcome-badge-hotspot badge-pos-1"
            title="Secure Investments - RBI-regulated escrow & verified borrower profiles"
          >
            <span className="lender-welcome-badge-tooltip">
              RBI Regulated &amp; Verified Escrow
            </span>
          </div>

          <div
            className="lender-welcome-badge-hotspot badge-pos-2"
            title="Attractive Returns - Earn up to 1.75% monthly ROI"
          >
            <span className="lender-welcome-badge-tooltip">
              Earn up to 1.75% Monthly ROI
            </span>
          </div>

          <div
            className="lender-welcome-badge-hotspot badge-pos-3"
            title="Transparent Process - 100% clear portfolio tracking"
          >
            <span className="lender-welcome-badge-tooltip">
              100% Real-Time Tracking
            </span>
          </div>

          <div
            className="lender-welcome-badge-hotspot badge-pos-4"
            title="Together for a Brighter Tomorrow - Empowering financial growth for 10 proud years"
          >
            <span className="lender-welcome-badge-tooltip">
              10 Years of Trust &amp; Growth
            </span>
          </div>

          {/* Continue to Dashboard Call-to-Action */}
          <button
            type="button"
            className="lender-welcome-cta-btn"
            onClick={handleContinueToDashboard}
            aria-label="Continue to Dashboard"
            title="Continue to Dashboard"
          />
        </div>
      </div>
    </div>
  );
};

export default LenderWelcomeModal;
