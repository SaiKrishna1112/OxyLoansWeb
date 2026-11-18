import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaWhatsapp,
  FaEnvelope,
  FaPhoneAlt,
  FaSignInAlt,
  FaUserCircle,
  FaHandHoldingUsd,
  FaHandshake,
  FaCalculator,
  FaHeadset,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
  FaExternalLinkAlt,
  FaTachometerAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUsers,
  FaUserTie,
  FaLayerGroup,
  FaBookOpen,
} from "react-icons/fa";
import { clearLastVisitedUrls } from "../../utils/redirectUtils";

import logoWhite from "../../assets/img/landing/oxylogodashboard_white.png";
import LoginDisclaimerTicker from "../pages/Authentication/LoginDisclaimerTicker";
import "./LandingHeader.css";

/**
 * LandingHeader Component
 * 
 * Modular public header matching the present OxyLoans landing design:
 * - Fixed statutory RBI NBFC-P2P disclaimer marquee ticker across the top
 * - Dynamic scroll progress line
 * - Floating social dock (left edge)
 * - Glassmorphic fixed-on-scroll navigation bar with 5 navigation sections
 * - Mobile-responsive navigation with sleek top navbar and modern slide-out drawer
 * - Self-contained regulatory disclosure modal and smooth scroll navigation
 */
const LandingHeader = ({
  isScrolled: externalIsScrolled,
  showDisclaimerTicker = true,
  showProgressBar = true,
  showSocialDock = true,
  showTopBlueStrip = true,
  standalone = false,
  onOpenDisclosure,
  onScrollToSection,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [internalIsScrolled, setInternalIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [openDropdown, setOpenDropdown] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      return p.get("dropdown") || null;
    } catch {
      return null;
    }
  });
  const [activeResourceSubmenu, setActiveResourceSubmenu] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      return p.get("resourceTab") || "loans";
    } catch {
      return "loans";
    }
  });
  const [localDisclosureModal, setLocalDisclosureModal] = useState(null);

  // Mobile drawer states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState(null); // 'team' | 'resources' | 'knowledge'

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileAccordion(null);
  }, [location.pathname, location.hash, location.search]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const toggleMobileAccordion = (section) => {
    setMobileAccordion((prev) => (prev === section ? null : section));
  };

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return !!(
        sessionStorage.getItem("accessToken") ||
        localStorage.getItem("accessToken")
      );
    } catch {
      return false;
    }
  });

  const getDashboardUrl = () => {
    try {
      const role = (
        sessionStorage.getItem("primaryType") ||
        localStorage.getItem("primaryType") ||
        ""
      ).toUpperCase();
      const userId =
        sessionStorage.getItem("userId") ||
        localStorage.getItem("userId") ||
        "";

      if (["ADMIN", "HELPDESKADMIN", "SUPERADMIN", "PRIMARYADMIN"].includes(role)) {
        return "/oxyloansadmindashboard";
      }
      if (role === "LENDER") {
        return userId ? `/lenderAIDashboard/${userId}` : "/ai/portfolio";
      }
      if (role === "PARTNER") {
        return "/patnerdashboard";
      }
      if (role === "BORROWER") {
        if (String(userId).trim() === "41682") {
          return "/instant-borrower-dashboard";
        }
        return "/borrowerDashboard";
      }
      return "/dashboard";
    } catch {
      return "/landing";
    }
  };

  const [dashboardUrl, setDashboardUrl] = useState(getDashboardUrl);

  useEffect(() => {
    const syncAuth = () => {
      const authed = !!(
        sessionStorage.getItem("accessToken") ||
        localStorage.getItem("accessToken")
      );
      setIsLoggedIn(authed);
      if (authed) {
        setDashboardUrl(getDashboardUrl());
      }
    };

    syncAuth();
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, [location.pathname]);

  const handleLogout = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    clearLastVisitedUrls();
    try {
      sessionStorage.clear();
      localStorage.clear();
      clearLastVisitedUrls();
    } catch (err) {
      // ignore
    }
    setIsLoggedIn(false);
    navigate("/landing");
  };

  // Sync scroll state if not controlled externally
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setInternalIsScrolled(scrollY > 40);

      const winHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (winHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollY / winHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isScrolled =
    externalIsScrolled !== undefined ? externalIsScrolled : internalIsScrolled;

  const handleOpenDisclosure = (title) => {
    if (onOpenDisclosure) {
      onOpenDisclosure(title);
    } else {
      setLocalDisclosureModal(title);
    }
  };

  const handleScrollToSection = (sectionId) => {
    if (onScrollToSection) {
      onScrollToSection(sectionId);
      return;
    }

    if (location.pathname === "/landing" || location.pathname === "/home" || location.pathname === "/") {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(`/landing#${sectionId}`);
    }
  };

  // Structured multi-tier Resource Categories (Main Name -> Submenu -> Its Submenu)
  const resourceCategories = [
    {
      id: "loans",
      title: "Loan Products",
      shortDesc: "Retail, business & expansion loans",
      icon: <FaHandHoldingUsd />,
      items: [
        {
          label: "Personal Loans",
          path: "/personal-loans",
          desc: "Collateral-free personal financing",
        },
        {
          label: "SME Loans",
          path: "/sme-loans",
          desc: "Working capital for small & medium businesses",
        },
        {
          label: "Business Loans",
          path: "/business-loans",
          desc: "Growth capital for established enterprises",
        },
        {
          label: "International Expansion Loans",
          path: "/international-business-expansion-loans",
          desc: "Global cross-border scaling loans",
        },
        {
          label: "Motor Loans",
          path: "/motor-loans",
          desc: "Two & four-wheeler asset loans",
        },
        {
          label: "Travel Loans",
          path: "/travel-loans",
          desc: "Funding for leisure & corporate travel",
        },
      ],
    },
    {
      id: "partners",
      title: "Partner Network",
      shortDesc: "Registration & partner portal access",
      icon: <FaHandshake />,
      items: [
        {
          label: "Partner Registration",
          path: "/register",
          desc: "Onboard as an authorized partner",
        },
        {
          label: "Partner Login",
          path: "/loginotp",
          desc: "Access your partner dashboard & deals",
        },
      ],
    },
    {
      id: "tools",
      title: "Calculators & Tools",
      shortDesc: "EMI calculation & statutory reports",
      icon: <FaCalculator />,
      items: [
        {
          label: "Loan EMI Calculator",
          path: "/emicalculator",
          desc: "Instant monthly installment calculation",
        },
        {
          label: "Loan Performance",
          path: "/loan-performance",
          desc: "Transparent portfolio track record & stats",
        },
        {
          label: "Latest EGM Notice",
          path: "/latest-egm-notice",
          desc: "Statutory shareholder meeting disclosures",
        },
      ],
    },
    {
      id: "media",
      title: "Media & Support",
      shortDesc: "Guides, videos, FAQ & contact help",
      icon: <FaHeadset />,
      items: [
        {
          label: "How It Works",
          path: "/how-it-works",
          desc: "Step-by-step P2P lending process guide",
        },
        {
          label: "Frequently Asked Questions",
          path: "/faqs",
          desc: "Detailed answers for lenders & borrowers",
        },
        {
          label: "Video Library",
          href: "https://www.youtube.com/@oxyloans",
          external: true,
          desc: "Watch informative product & P2P videos",
        },
        {
          label: "OxyLoans Blog",
          path: "/blogs",
          desc: "Latest fintech articles & market updates",
        },
        {
          label: "Testimonials & Reviews",
          action: () => handleScrollToSection("success-stories"),
          desc: "Real feedback from lenders and borrowers",
        },
        {
          label: "Contact Us",
          path: "/contact-us",
          desc: "Get in touch with customer support",
        },
      ],
    },
  ];

  const currentResourceCategory =
    resourceCategories.find((c) => c.id === activeResourceSubmenu) ||
    resourceCategories[0];

  return (
    <div className={`oxy-header-wrapper ${showDisclaimerTicker ? "has-disclaimer" : ""}`}>
      {/* 1. Statutory RBI NBFC-P2P Top Scrolling Ticker */}
      {showDisclaimerTicker && <LoginDisclaimerTicker />}

      {/* 2. Dynamic Scroll Progress Bar */}
      {showProgressBar && (
        <div
          className="oxy-landing-scroll-progress"
          style={{ width: `${scrollProgress}%` }}
          aria-hidden="true"
        />
      )}

      {/* 3. Floating Social Dock (Left Side) */}
      {showSocialDock && (
        <aside className="oxy-landing-social-dock" aria-label="Social Media Links">
          <a
            href="https://www.facebook.com/OxyLoans/"
            target="_blank"
            rel="noopener noreferrer"
            className="soc-fb"
            title="Facebook"
          >
            <FaFacebookF />
          </a>
          <a
            href="https://twitter.com/oxyloans"
            target="_blank"
            rel="noopener noreferrer"
            className="soc-tw"
            title="Twitter"
          >
            <FaTwitter />
          </a>
          <a
            href="https://www.linkedin.com/company/oxyloans/"
            target="_blank"
            rel="noopener noreferrer"
            className="soc-li"
            title="LinkedIn"
          >
            <FaLinkedinIn />
          </a>
          <a
            href="https://www.youtube.com/@oxyloans"
            target="_blank"
            rel="noopener noreferrer"
            className="soc-yt"
            title="YouTube"
          >
            <FaYoutube />
          </a>
          <a
            href="https://api.whatsapp.com/send?phone=919966888825"
            target="_blank"
            rel="noopener noreferrer"
            className="soc-wa"
            title="WhatsApp"
          >
            <FaWhatsapp />
          </a>
        </aside>
      )}

      {/* 5. Placeholder when navbar is fixed, preventing hero content jump */}
      {isScrolled && <div className="oxy-landing-navbar-placeholder" />}

      {/* 6. Main Header Navbar */}
      <nav
        className={`oxy-landing-main-navbar ${
          isScrolled ? "scrolled fixed-nav" : ""
        } ${standalone ? "standalone-nav" : ""}`}
        aria-label="Main Navigation"
      >
        <div className="oxy-landing-navbar-container">
          {/* Brand Logo + Trade Name */}
          <div className="oxy-landing-navbar-brand">
            <Link to="/landing" className="oxy-landing-logo-link">
              <img src={logoWhite} alt="OxyLoans" className="oxy-landing-nav-logo" />
            </Link>
            <div className="oxy-landing-trade-name">
              TRADE NAME of M/S SRS FINTECHLABS PVT. LTD.
            </div>
          </div>

          {/* Nav Links with 3 Mega Dropdowns */}
          <div className="oxy-landing-nav-menu">
            {/* 1. TEAM Dropdown */}
            <div
              className={`oxy-nav-dropdown-wrap ${openDropdown === "team" ? "open" : ""}`}
              onMouseEnter={() => setOpenDropdown("team")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <a
                href="#about-section"
                className={`oxy-nav-link has-dropdown ${
                  openDropdown === "team" ? "active" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToSection("about-section");
                }}
              >
                TEAM
              </a>
              <div className="oxy-nav-dropdown-menu green-dropdown">
                <Link
                  to="/team-management"
                  className="oxy-dropdown-item"
                  onClick={() => setOpenDropdown(null)}
                >
                  MANAGEMENT
                </Link>
                <Link
                  to="/advisory-team"
                  className="oxy-dropdown-item"
                  onClick={() => setOpenDropdown(null)}
                >
                  ADVISORY BOARD
                </Link>
                {/* <a
                  className="oxy-dropdown-item"
                  onClick={() => {
                    setOpenDropdown(null);
                    handleOpenDisclosure("Media & Gallery");
                  }}
                >
                  MEDIA &amp; GALLERY
                </a> */}
              </div>
            </div>

            {/* 2. LENDER Link */}
            <Link
              to="/lender"
              className={`oxy-nav-link ${location.pathname === "/lender" ? "active" : ""}`}
              onClick={() => {
                if (location.pathname === "/lender") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              LENDER
            </Link>

            {/* 3. BORROWER Link */}
            <Link
              to="/borrower"
              className={`oxy-nav-link ${location.pathname === "/borrower" ? "active" : ""}`}
              onClick={() => {
                if (location.pathname === "/borrower") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              BORROWER
            </Link>

            {/* 4. RESOURCES Dropdown */}
            <div
              className={`oxy-nav-dropdown-wrap ${
                openDropdown === "resources" ? "open" : ""
              }`}
              onMouseEnter={() => setOpenDropdown("resources")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <a
                className={`oxy-nav-link has-dropdown ${
                  openDropdown === "resources" ? "active" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setOpenDropdown(
                    openDropdown === "resources" ? null : "resources"
                  );
                }}
              >
                RESOURCES
              </a>
              <div className="oxy-nav-dropdown-menu blue-dropdown oxy-resources-mega-dropdown">
                {/* 1. Submenu Categories (Left Pane - "Show Limited Names") */}
                <div className="oxy-resources-category-list">
                  <div className="oxy-resources-category-header">
                    <span>CATEGORIES</span>
                  </div>
                  {resourceCategories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`oxy-resource-cat-item ${
                        activeResourceSubmenu === cat.id ? "active" : ""
                      }`}
                      onMouseEnter={() => setActiveResourceSubmenu(cat.id)}
                      onClick={() => setActiveResourceSubmenu(cat.id)}
                    >
                      <span className="oxy-cat-icon-wrap">{cat.icon}</span>
                      <div className="oxy-cat-info">
                        <span className="oxy-cat-title">{cat.title}</span>
                        <span className="oxy-cat-badge">{cat.items.length} items</span>
                      </div>
                      <FaChevronRight className="oxy-cat-arrow" />
                    </button>
                  ))}
                  <div className="oxy-resources-cat-footer">
                    <div className="oxy-cat-footer-badge">
                      <span className="oxy-cat-footer-dot"></span>
                      <span>RBI Registered NBFC-P2P</span>
                    </div>
                  </div>
                </div>

                {/* 2. It's Submenu (Right Pane - Dynamic Child Links) */}
                <div className="oxy-resources-items-pane">
                  <div className="oxy-resources-items-header">
                    <span className="oxy-items-header-title">
                      {currentResourceCategory.title}
                    </span>
                    <span className="oxy-items-header-desc">
                      {currentResourceCategory.shortDesc}
                    </span>
                  </div>

                  <div className="oxy-resources-items-grid">
                    {currentResourceCategory.items.map((item, idx) => {
                      if (item.path) {
                        return (
                          <Link
                            key={idx}
                            to={item.path}
                            className="oxy-resource-sub-item"
                            onClick={() => setOpenDropdown(null)}
                          >
                            <div className="oxy-sub-item-text">
                              <span className="oxy-sub-item-name">{item.label}</span>
                              {item.desc && (
                                <span className="oxy-sub-item-desc">{item.desc}</span>
                              )}
                            </div>
                          </Link>
                        );
                      } else if (item.href) {
                        return (
                          <a
                            key={idx}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="oxy-resource-sub-item"
                            onClick={() => setOpenDropdown(null)}
                          >
                            <div className="oxy-sub-item-text">
                              <span className="oxy-sub-item-name">
                                {item.label}
                                <FaExternalLinkAlt className="external-icon" />
                              </span>
                              {item.desc && (
                                <span className="oxy-sub-item-desc">{item.desc}</span>
                              )}
                            </div>
                          </a>
                        );
                      } else if (item.action) {
                        return (
                          <a
                            key={idx}
                            className="oxy-resource-sub-item"
                            onClick={() => {
                              setOpenDropdown(null);
                              item.action();
                            }}
                          >
                            <div className="oxy-sub-item-text">
                              <span className="oxy-sub-item-name">{item.label}</span>
                              {item.desc && (
                                <span className="oxy-sub-item-desc">{item.desc}</span>
                              )}
                            </div>
                          </a>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. KNOWLEDGE CENTER Dropdown */}
            <div
              className={`oxy-nav-dropdown-wrap ${
                openDropdown === "knowledge" ? "open" : ""
              }`}
              onMouseEnter={() => setOpenDropdown("knowledge")}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <a
                href="#knowledge-center"
                className={`oxy-nav-link has-dropdown ${
                  openDropdown === "knowledge" ? "active" : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToSection("knowledge-center");
                }}
              >
                KNOWLEDGE CENTER
              </a>
              <div className="oxy-nav-dropdown-menu orange-dropdown">
                <Link
                  to="/faqs?category=lender"
                  className="oxy-dropdown-item"
                  onClick={() => setOpenDropdown(null)}
                >
                  LENDER FAQS
                </Link>
                <Link
                  to="/faqs?category=borrower"
                  className="oxy-dropdown-item"
                  onClick={() => setOpenDropdown(null)}
                >
                  BORROWER FAQS
                </Link>
                <Link
                  to="/know-your-fees"
                  className="oxy-dropdown-item"
                  onClick={() => setOpenDropdown(null)}
                >
                  KNOW YOUR FEES
                </Link>
                <Link
                  to="/know-your-tax"
                  className="oxy-dropdown-item"
                  onClick={() => setOpenDropdown(null)}
                >
                  KNOW YOUR TAX
                </Link>
                <Link
                  to="/know-your-earnings"
                  className="oxy-dropdown-item"
                  onClick={() => setOpenDropdown(null)}
                >
                  KNOW YOUR EARNINGS
                </Link>
                <Link
                  to="/transparency"
                  className="oxy-dropdown-item"
                  onClick={() => setOpenDropdown(null)}
                >
                  TRANSPARENCY AND DISCLOSURE REQUIREMENTS
                </Link>
                <Link
                  to="/grievance-redressal-mechanism"
                  className="oxy-dropdown-item"
                  onClick={() => setOpenDropdown(null)}
                >
                  GRIEVANCES REDRESSAL MECHANISM
                </Link>
                <Link
                  to="/rbi-directions"
                  className="oxy-dropdown-item"
                  onClick={() => setOpenDropdown(null)}
                >
                  RBI DIRECTIONS
                </Link>
                <Link
                  to="/privacy-policy"
                  className="oxy-dropdown-item"
                  onClick={() => setOpenDropdown(null)}
                >
                  PRIVACY POLICY
                </Link>
                <a
                  href="https://www.youtube.com/@oxyloans"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="oxy-dropdown-item"
                  onClick={() => setOpenDropdown(null)}
                >
                  YOUTUBE
                </a>
              </div>
            </div>

            {/* AUTH / ACTION BUTTONS */}
            {isLoggedIn ? (
              <>
                <Link to={dashboardUrl} className="oxy-nav-link btn-join-today" title="Go to Dashboard">
                  <FaTachometerAlt className="nav-icon" /> DASHBOARD
                </Link>
                <span className="oxy-nav-separator">|</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="oxy-nav-link btn-login oxy-header-logout-btn"
                  title="Log out of OxyLoans"
                >
                  <FaSignOutAlt className="nav-icon" /> LOGOUT
                </button>
              </>
            ) : (
              <>
                <Link to="/userType" className="oxy-nav-link btn-join-today">
                  <FaSignInAlt className="nav-icon" /> JOIN TODAY
                </Link>
                <span className="oxy-nav-separator">|</span>
                <Link to="/loginotp" className="oxy-nav-link btn-login">
                  <FaUserCircle className="nav-icon" /> LOGIN
                </Link>
              </>
            )}

            {/* EMAIL & PHONE ICONS */}
            <a
              href="mailto:support@oxyloans.com"
              className="oxy-nav-icon-link"
              title="Email Us: support@oxyloans.com"
            >
              <FaEnvelope />
            </a>
            <a
              href="tel:+919966888825"
              className="oxy-nav-icon-link"
              title="Call Us: +91 9966888825"
            >
              <FaPhoneAlt />
            </a>
          </div>

          {/* Mobile Action Cluster: Quick CTA + Hamburger Toggle Button */}
          <div className="oxy-mobile-actions-cluster">
            {isLoggedIn ? (
              <Link
                to={dashboardUrl}
                className="oxy-mobile-pill-btn dashboard"
                title="Go to Dashboard"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaTachometerAlt className="pill-icon" />
                <span>DASHBOARD</span>
              </Link>
            ) : (
              <Link
                to="/userType"
                className="oxy-mobile-pill-btn join"
                title="Join Today"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FaSignInAlt className="pill-icon" />
                <span>JOIN TODAY</span>
              </Link>
            )}
            <button
              type="button"
              className={`oxy-mobile-hamburger-btn ${mobileMenuOpen ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </nav>

      {/* 7. Slide-Out Mobile Navigation Drawer */}
      <div
        className={`oxy-mobile-drawer-backdrop ${mobileMenuOpen ? "active" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`oxy-mobile-drawer ${mobileMenuOpen ? "open" : ""}`}
        aria-label="Mobile Navigation Drawer"
      >
        {/* Drawer Header */}
        <div className="oxy-mobile-drawer-header">
          <div className="oxy-mobile-drawer-brand">
            <img src={logoWhite} alt="OxyLoans" className="oxy-mobile-drawer-logo" />
            <span className="oxy-mobile-drawer-sub">RBI REGISTERED NBFC-P2P</span>
          </div>
          <button
            type="button"
            className="oxy-mobile-drawer-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        {/* Drawer Auth & Action Hero Card */}
        <div className="oxy-mobile-auth-card">
          {isLoggedIn ? (
            <div className="oxy-mobile-auth-logged">
              <div className="oxy-mobile-user-status">
                <FaUserCircle className="user-icon" />
                <div>
                  <div className="status-title">Active Session</div>
                  <div className="status-role">OxyLoans Portal</div>
                </div>
              </div>
              <div className="oxy-mobile-auth-btn-group">
                <Link
                  to={dashboardUrl}
                  className="oxy-mobile-btn btn-dash"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaTachometerAlt /> Dashboard
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleLogout(e);
                  }}
                  className="oxy-mobile-btn btn-logout"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="oxy-mobile-auth-guest">
              <div className="auth-guest-pitch">
                <span className="pitch-tag">RBI NBFC-P2P PLATFORM</span>
                <h4 className="pitch-heading">Earn up to 36% or Borrow Seamlessly</h4>
              </div>
              <div className="oxy-mobile-auth-btn-group">
                <Link
                  to="/userType"
                  className="oxy-mobile-btn btn-join-mobile"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaSignInAlt /> Join Today
                </Link>
                <Link
                  to="/loginotp"
                  className="oxy-mobile-btn btn-login-mobile"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaUserCircle /> Login
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Navigation List */}
        <div className="oxy-mobile-nav-list">
          {/* 1. TEAM Accordion */}
          <div className="oxy-mobile-nav-item">
            <button
              type="button"
              className={`oxy-mobile-nav-trigger ${mobileAccordion === "team" ? "active" : ""}`}
              onClick={() => toggleMobileAccordion("team")}
            >
              <span className="trigger-left">
                <FaUsers className="nav-group-icon" />
                <span>Team</span>
              </span>
              <span className="trigger-arrow">
                {mobileAccordion === "team" ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </button>
            {mobileAccordion === "team" && (
              <div className="oxy-mobile-accordion-body">
                <Link
                  to="/team-management"
                  className="oxy-mobile-sublink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sublink-dot" />
                  <span>Management Team</span>
                </Link>
                <Link
                  to="/advisory-team"
                  className="oxy-mobile-sublink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sublink-dot" />
                  <span>Advisory Board</span>
                </Link>
              </div>
            )}
          </div>

          {/* 2. LENDER Link */}
          <div className="oxy-mobile-nav-item">
            <Link
              to="/lender"
              className={`oxy-mobile-nav-link ${location.pathname === "/lender" ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="link-left">
                <FaHandHoldingUsd className="nav-group-icon icon-green" />
                <span>Lender</span>
              </span>
              <span className="mobile-link-badge green">Up to 36% ROI</span>
            </Link>
          </div>

          {/* 3. BORROWER Link */}
          <div className="oxy-mobile-nav-item">
            <Link
              to="/borrower"
              className={`oxy-mobile-nav-link ${location.pathname === "/borrower" ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="link-left">
                <FaHandshake className="nav-group-icon icon-blue" />
                <span>Borrower</span>
              </span>
              <span className="mobile-link-badge blue">Quick Funding</span>
            </Link>
          </div>

          {/* 4. RESOURCES Accordion */}
          <div className="oxy-mobile-nav-item">
            <button
              type="button"
              className={`oxy-mobile-nav-trigger ${mobileAccordion === "resources" ? "active" : ""}`}
              onClick={() => toggleMobileAccordion("resources")}
            >
              <span className="trigger-left">
                <FaLayerGroup className="nav-group-icon" />
                <span>Resources</span>
              </span>
              <span className="trigger-arrow">
                {mobileAccordion === "resources" ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </button>
            {mobileAccordion === "resources" && (
              <div className="oxy-mobile-accordion-body">
                {resourceCategories.map((cat) => (
                  <div key={cat.id} className="oxy-mobile-resource-category">
                    <div className="oxy-mobile-cat-header">
                      {cat.icon}
                      <span>{cat.title}</span>
                    </div>
                    <div className="oxy-mobile-cat-items">
                      {cat.items.map((item, idx) => {
                        if (item.path) {
                          return (
                            <Link
                              key={idx}
                              to={item.path}
                              className="oxy-mobile-sublink"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <span className="sublink-dot" />
                              <div className="sublink-content">
                                <span className="sublink-title">{item.label}</span>
                                {item.desc && <span className="sublink-desc">{item.desc}</span>}
                              </div>
                            </Link>
                          );
                        } else if (item.href) {
                          return (
                            <a
                              key={idx}
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="oxy-mobile-sublink"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <span className="sublink-dot" />
                              <div className="sublink-content">
                                <span className="sublink-title">
                                  {item.label} <FaExternalLinkAlt className="ext-icon" />
                                </span>
                                {item.desc && <span className="sublink-desc">{item.desc}</span>}
                              </div>
                            </a>
                          );
                        } else if (item.action) {
                          return (
                            <button
                              key={idx}
                              type="button"
                              className="oxy-mobile-sublink btn-sublink"
                              onClick={() => {
                                setMobileMenuOpen(false);
                                item.action();
                              }}
                            >
                              <span className="sublink-dot" />
                              <div className="sublink-content">
                                <span className="sublink-title">{item.label}</span>
                                {item.desc && <span className="sublink-desc">{item.desc}</span>}
                              </div>
                            </button>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. KNOWLEDGE CENTER Accordion */}
          <div className="oxy-mobile-nav-item">
            <button
              type="button"
              className={`oxy-mobile-nav-trigger ${mobileAccordion === "knowledge" ? "active" : ""}`}
              onClick={() => toggleMobileAccordion("knowledge")}
            >
              <span className="trigger-left">
                <FaBookOpen className="nav-group-icon" />
                <span>Knowledge Center</span>
              </span>
              <span className="trigger-arrow">
                {mobileAccordion === "knowledge" ? <FaChevronUp /> : <FaChevronDown />}
              </span>
            </button>
            {mobileAccordion === "knowledge" && (
              <div className="oxy-mobile-accordion-body">
                <Link
                  to="/faqs?category=lender"
                  className="oxy-mobile-sublink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sublink-dot" />
                  <span>Lender FAQs</span>
                </Link>
                <Link
                  to="/faqs?category=borrower"
                  className="oxy-mobile-sublink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sublink-dot" />
                  <span>Borrower FAQs</span>
                </Link>
                <Link
                  to="/know-your-fees"
                  className="oxy-mobile-sublink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sublink-dot" />
                  <span>Know Your Fees</span>
                </Link>
                <Link
                  to="/know-your-tax"
                  className="oxy-mobile-sublink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sublink-dot" />
                  <span>Know Your Tax</span>
                </Link>
                <Link
                  to="/know-your-earnings"
                  className="oxy-mobile-sublink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sublink-dot" />
                  <span>Know Your Earnings</span>
                </Link>
                <Link
                  to="/transparency"
                  className="oxy-mobile-sublink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sublink-dot" />
                  <span>Transparency & Disclosures</span>
                </Link>
                <Link
                  to="/grievance-redressal-mechanism"
                  className="oxy-mobile-sublink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sublink-dot" />
                  <span>Grievances Redressal Mechanism</span>
                </Link>
                <Link
                  to="/rbi-directions"
                  className="oxy-mobile-sublink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sublink-dot" />
                  <span>RBI Directions</span>
                </Link>
                <Link
                  to="/privacy-policy"
                  className="oxy-mobile-sublink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sublink-dot" />
                  <span>Privacy Policy</span>
                </Link>
                <a
                  href="https://www.youtube.com/@oxyloans"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="oxy-mobile-sublink"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sublink-dot" />
                  <span>YouTube Channel <FaExternalLinkAlt className="ext-icon" /></span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Support & Quick Helpline Dock */}
        <div className="oxy-mobile-drawer-support">
          <div className="support-section-label">24/7 DEDICATED ASSISTANCE</div>
          <div className="support-buttons-grid">
            <a href="tel:+919966888825" className="oxy-mobile-support-btn call">
              <FaPhoneAlt className="sup-icon" />
              <div className="sup-info">
                <span className="sup-name">Direct Helpline</span>
                <span className="sup-detail">+91 9966 8888 25</span>
              </div>
            </a>
            <a href="mailto:support@oxyloans.com" className="oxy-mobile-support-btn mail">
              <FaEnvelope className="sup-icon" />
              <div className="sup-info">
                <span className="sup-name">Email Support</span>
                <span className="sup-detail">support@oxyloans.com</span>
              </div>
            </a>
            <a
              href="https://api.whatsapp.com/send?phone=919966888825"
              target="_blank"
              rel="noopener noreferrer"
              className="oxy-mobile-support-btn whatsapp"
            >
              <FaWhatsapp className="sup-icon" />
              <div className="sup-info">
                <span className="sup-name">WhatsApp Help</span>
                <span className="sup-detail">Chat with Specialist</span>
              </div>
            </a>
          </div>

          {/* Social Links */}
          <div className="oxy-mobile-social-row">
            <a href="https://www.facebook.com/OxyLoans/" target="_blank" rel="noopener noreferrer" title="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com/oxyloans" target="_blank" rel="noopener noreferrer" title="Twitter">
              <FaTwitter />
            </a>
            <a href="https://www.linkedin.com/company/oxyloans/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
              <FaLinkedinIn />
            </a>
            <a href="https://www.youtube.com/@oxyloans" target="_blank" rel="noopener noreferrer" title="YouTube">
              <FaYoutube />
            </a>
            <a href="https://api.whatsapp.com/send?phone=919966888825" target="_blank" rel="noopener noreferrer" title="WhatsApp">
              <FaWhatsapp />
            </a>
          </div>

          {/* Statutory Footnote */}
          <div className="oxy-mobile-drawer-footer">
            <p>© {new Date().getFullYear()} M/S SRS FINTECHLABS PVT. LTD.</p>
            <p className="rbi-cert">RBI CoR: Feb 06, 2019 (NBFC-P2P)</p>
          </div>
        </div>
      </aside>

      {/* Built-in Regulatory Disclosure Modal Fallback */}
      {localDisclosureModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setLocalDisclosureModal(null)}
        >
          <div
            style={{
              background: "#ffffff",
              maxWidth: "600px",
              width: "100%",
              borderRadius: "10px",
              padding: "25px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
              color: "#333333",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h4 style={{ margin: 0, fontSize: "18px", color: "#0077c8" }}>
                {localDisclosureModal}
              </h4>
              <button
                onClick={() => setLocalDisclosureModal(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                &times;
              </button>
            </div>
            <div style={{ fontSize: "13px", lineHeight: "1.6", color: "#444" }}>
              <p>
                <strong>RBI Compliance &amp; Regulatory Overview:</strong>
                <br />
                M/S SRS FINTECHLABS PVT. LTD. operates the P2P lending platform OxyLoans
                under Certificate of Registration dated Feb 06, 2019, issued by the
                Reserve Bank of India under Section 45 IA of the Reserve Bank of India
                Act, 1934.
              </p>
              <p style={{ marginTop: "10px" }}>
                <strong>Key Principles:</strong>
                <br />
                • 100% transparency in interest rates and fee structures.
                <br />
                • Strict adherence to RBI Fair Practices Code for transparent disclosures.
                <br />
                • Independent Escrow Account Trustee oversight for seamless fund movement.
                <br />
                • Robust grievance redressal mechanism with dedicated nodal officers.
              </p>
            </div>
            <button
              onClick={() => setLocalDisclosureModal(null)}
              style={{
                marginTop: "15px",
                background: "#0077c8",
                color: "#ffffff",
                border: "none",
                padding: "8px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "700",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingHeader;
