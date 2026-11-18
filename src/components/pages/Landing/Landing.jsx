import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaWhatsapp,
  FaEnvelope,
  FaPhoneAlt,
  FaLock,
  FaSignInAlt,
  FaBalanceScale,
  FaUsers,
  FaUser,
  FaWallet,
  FaFileContract,
  FaChevronDown,
  FaChevronUp,
  FaCheckCircle,
  FaArrowRight,
  FaLightbulb,
  FaBrain,
  FaQuestionCircle,
  FaShieldAlt,
  FaUserCheck,
  FaHandshake,
  FaUserTie,
  FaFileAlt,
  FaFileSignature,
  FaFileUpload,
  FaTasks,
  FaTimes,
  FaInfoCircle,
  FaSearch,
  FaSlidersH,
  FaAward,
  FaUserCircle,
  FaCoins,
  FaBolt,
} from "react-icons/fa";

import bgImgMan from "../../../assets/img/landing/bg-img-man.png";
import logoWhite from "../../../assets/img/landing/oxylogodashboard_white.png";
import oxyLogoDash from "../../../assets/img/oxylogodashboard.png";
import ceoPhoto from "../../../assets/img/rk_CPO.png";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";
import LandingLenderStories from "./LandingLenderStories";
import "./Landing.css";

// Smooth Ease-Out Animated Counter Hook
const useAnimatedCounter = (end, duration = 1800, shouldStart = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!shouldStart) return;
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out exponential curve
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(ease * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    const animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [end, duration, shouldStart]);

  return count;
};

const Landing = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to section if hash is present in URL
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  // Fixed Navbar on scroll & rich dynamic scroll progress
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 40);
      setShowBackToTop(scrollY > 350);

      const winHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (winHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollY / winHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // IntersectionObserver for smooth scroll-reveal animations across sections
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const elements = document.querySelectorAll(".oxy-reveal-on-scroll");
    if (!elements || elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("oxy-revealed");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Stats Visibility & Number Animation trigger
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    if ("IntersectionObserver" in window && statsRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setStatsVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );
      observer.observe(statsRef.current);
      return () => observer.disconnect();
    } else {
      const t = setTimeout(() => setStatsVisible(true), 350);
      return () => clearTimeout(t);
    }
  }, []);

  const [aboutVisible, setAboutVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById("about-section");
    if (!el) {
      setAboutVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setAboutVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    const t = setTimeout(() => setAboutVisible(true), 800);
    return () => {
      observer.disconnect();
      clearTimeout(t);
    };
  }, []);

  const countDisbursal = useAnimatedCounter(1000000000, 2000, statsVisible);
  const countBorrowers = useAnimatedCounter(270000, 1800, statsVisible);
  const countLenders = useAnimatedCounter(30000, 1600, statsVisible);
  const countSatisfied = useAnimatedCounter(5342, 1600, aboutVisible);
  const satisfiedDigits = aboutVisible
    ? String(countSatisfied).padStart(5, "0").split("")
    : ["0", "5", "3", "4", "2"];

  // FAQ accordion state (null by default so neither is expanded initially)
  const [activeFaq, setActiveFaq] = useState(null);

  // Newsletter state
  const [newsEmail, setNewsEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Regulatory disclosure modal state
  const [disclosureModal, setDisclosureModal] = useState(null);

  // Top Nav Dropdown state
  const [openDropdown, setOpenDropdown] = useState(null);

  // Proven Process Active Node State & Dynamic Sliding Content Data
  const [activeHex, setActiveHex] = useState("overview");

  const processStepsData = {
    overview: {
      category: "P2P NBFC ECOSYSTEM",
      badgeClass: "badge-gold",
      title: "PROCESS OF LENDING",
      subtitle: "India's Premier RBI Registered Peer-to-Peer Lending Platform",
      description:
        "The lender can review different loan requests submitted by the borrower. He is free to choose the suitable loan requests and extend the Loan offer to the same.",
      points: [
        "RBI Registered NBFC-P2P (Certificate dated Feb 06, 2019)",
        "Over ₹1,000+ Crores disbursed to 270,000+ satisfied borrowers",
        "Independent Trustee Escrow protection for 100% investor safety",
        "Proprietary AI credit underwriting and transparent disclosures",
      ],
      primaryBtnText: "START LENDING",
      primaryBtnLink: "/register",
      primaryBtnTheme: "btn-blue",
      secondaryBtnText: "START BORROWING",
      secondaryBtnLink: "/borrower_register",
      secondaryBtnTheme: "btn-green",
    },
    "lender-partner": {
      category: "INVESTOR ONBOARDING",
      badgeClass: "badge-green",
      title: "LENDER INVESTOR PARTNER",
      subtitle: "Direct High-Yield Peer-to-Peer Investment Opportunities",
      description:
        "Individual investors, NRIs, and institutional partners can register as lenders to earn superior monthly returns ranging from 12% to 36% p.a. without banking middleman spreads.",
      points: [
        "Earn up to 1.75% monthly ROI (12% – 36% annual yield)",
        "Diversify across multiple borrowers starting from just ₹500",
        "Funds held in RBI-mandated Escrow monitored by independent Trustee",
        "Direct monthly repayments (Principal + Interest) to your bank",
      ],
      primaryBtnText: "START LENDING NOW",
      primaryBtnLink: "/register",
      primaryBtnTheme: "btn-blue",
      secondaryBtnText: "START BORROWING",
      secondaryBtnLink: "/borrower_register",
      secondaryBtnTheme: "btn-green",
    },
    "lender-reviews": {
      category: "LOAN CURATION & SELECTION",
      badgeClass: "badge-green",
      title: "REVIEWS LOANS & EXTEND OFFERS",
      subtitle: "Transparent Borrower Screening & Algorithmic Underwriting",
      description:
        "The lender can review different loan requests submitted by verified borrowers. Choose suitable loan requests, evaluate credit risk profiles, and extend competitive loan offers.",
      points: [
        "Instant access to curated borrower listings and financial records",
        "AI-backed risk grading, income stability, and repayment capacity",
        "Verified credit bureau scores (CIBIL, Experian, Equifax, CRIF)",
        "Choose loan terms, funding percentages, and approval limits",
      ],
      primaryBtnText: "EXPLORE LOAN REQUESTS",
      primaryBtnLink: "/register",
      primaryBtnTheme: "btn-blue",
      secondaryBtnText: "START BORROWING",
      secondaryBtnLink: "/borrower_register",
      secondaryBtnTheme: "btn-green",
    },
    "lender-negotiate": {
      category: "FLEXIBLE INTEREST & TENURE",
      badgeClass: "badge-green",
      title: "NEGOTIATES RATE % TERMS",
      subtitle: "Direct Consensus on Interest Rates & Comfortable Tenures",
      description:
        "Lenders and borrowers enjoy direct negotiation freedom. Settle on a mutually beneficial interest rate and comfortable tenure with zero hidden costs or predatory terms.",
      points: [
        "Dynamic rate negotiation directly between lender and borrower",
        "Flexible repayment tenures from 3 months up to 36 months",
        "Zero hidden fees and transparent fee disclosures",
        "Legally binding digital loan agreement signed via Aadhaar OTP",
      ],
      primaryBtnText: "START INVESTING",
      primaryBtnLink: "/register",
      primaryBtnTheme: "btn-blue",
      secondaryBtnText: "APPLY FOR LOAN",
      secondaryBtnLink: "/borrower_register",
      secondaryBtnTheme: "btn-green",
    },
    "borrower-main": {
      category: "BORROWER PORTAL",
      badgeClass: "badge-blue",
      title: "BORROWER PORTAL",
      subtitle: "Instant Digital Loans at Fair & Affordable Interest Rates",
      description:
        "All citizens of India resident can apply for a loan online. Access instant funds from ₹25,000 to ₹10,00,000 for personal, medical, business, or education needs.",
      points: [
        "100% digital KYC and rapid loan approvals within 24 hours",
        "No collateral or security deposit required",
        "Flexible EMI repayment tenures tailored to your income",
        "Improve credit score with prompt statutory bureau reporting",
      ],
      primaryBtnText: "START BORROWING NOW",
      primaryBtnLink: "/borrower_register",
      primaryBtnTheme: "btn-green",
      secondaryBtnText: "START LENDING",
      secondaryBtnLink: "/register",
      secondaryBtnTheme: "btn-blue",
    },
    "borrower-apply": {
      category: "5-MINUTE APPLICATION",
      badgeClass: "badge-blue",
      title: "SUBMITS LOAN APPLICATION",
      subtitle: "Seamless Paperless Digital Loan Onboarding",
      description:
        "Borrowers submit their loan application online in minutes. Enter your required amount, select repayment tenure, and upload basic KYC documents for immediate processing.",
      points: [
        "Simple 3-step digital application completed from mobile or PC",
        "Instant preliminary eligibility check with automated risk scoring",
        "Upload PAN, Aadhaar, and recent bank statements securely",
        "Bank-grade 256-bit encryption ensuring complete data privacy",
      ],
      primaryBtnText: "SUBMIT APPLICATION",
      primaryBtnLink: "/borrower_register",
      primaryBtnTheme: "btn-green",
      secondaryBtnText: "BECOME A LENDER",
      secondaryBtnLink: "/register",
      secondaryBtnTheme: "btn-blue",
    },
    "borrower-offers": {
      category: "MULTIPLE OFFERS MARKETPLACE",
      badgeClass: "badge-blue",
      title: "SELECT BEST OFFER FROM MULTIPLE",
      subtitle: "Compare Competing Offers & Receive Instant Disbursement",
      description:
        "Multiple verified lenders review your listing and submit competitive loan offers. Select the offer with the lowest interest rate and most convenient EMI schedule for rapid funding.",
      points: [
        "Multiple lenders compete to offer you the lowest interest rate",
        "Transparent comparison of ROI, EMI schedules, and fees",
        "E-sign legal agreement digitally via Aadhaar OTP",
        "Disbursement directly to your bank account via Escrow in 24–48 hours",
      ],
      primaryBtnText: "APPLY & COMPARE OFFERS",
      primaryBtnLink: "/borrower_register",
      primaryBtnTheme: "btn-green",
      secondaryBtnText: "START LENDING",
      secondaryBtnLink: "/register",
      secondaryBtnTheme: "btn-blue",
    },
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsEmail || !newsEmail.includes("@")) {
      alert("Please enter a valid email address.");
      return;
    }
    setSubscribed(true);
    setTimeout(() => {
      setNewsEmail("");
      setSubscribed(false);
    }, 4000);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="oxy-landing-page">
      {/* Modular Present-Style Landing Header */}
      <LandingHeader
        isScrolled={isScrolled}
        onOpenDisclosure={(title) => setDisclosureModal(title)}
        onScrollToSection={(id) => scrollToSection(id)}
      />

      {/* ====================================================================
          1. HERO & CAMPAIGNS SECTION (TOP)
          ==================================================================== */}
      <header
        className="oxy-landing-hero-section"
        style={{ backgroundImage: `url(${bgImgMan})` }}
      >
        <div className="oxy-landing-hero-container">
          {/* Hero Grid */}
          <div className="oxy-landing-hero-grid">
            {/* Left Column: Campaigns Overlay positioned over background man */}
            <div className="oxy-landing-hero-left">
              <div className="oxy-landing-campaigns-content">
                <div className="oxy-landing-campaigns-title">
                  OUR NEW CAMPAIGNS
                </div>
                <div className="oxy-landing-campaigns-amount">
                  7000 CRORES P2P LOANS
                </div>
                <nav className="oxy-landing-campaigns-links" aria-label="Campaign disclosures">
                  <Link to="/transparency">
                    TRANSPARENCY AND DISCLOSURE
                  </Link>
                  <span>|</span>
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      setDisclosureModal("Fair Practices Code");
                    }}
                  >
                    FAIR PRACTICES CODE
                  </a>
                  <span>|</span>
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      setDisclosureModal("Grievances Redressal Mechanism");
                    }}
                  >
                    GRIEVANCES REDRESSAL
                  </a>
                </nav>
              </div>
            </div>

            {/* Right Column: Lending Pitch & RBI Badge */}
            <div className="oxy-landing-hero-right">
              <div className="oxy-landing-hero-question">
                Why should I Lend @ OxyLoans.com?
              </div>
              <h1 className="oxy-landing-hero-headline">
                QUICK LOANS. THE RIGHT WAY.
              </h1>
              <div className="oxy-landing-hero-subhead">
                Peer 2 Peer Lending | Directly from Lender to Borrower
              </div>
              <Link
                to="/rbi-directions"
                className="oxy-landing-rbi-badge"
              >
                RBI Directions
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ====================================================================
          2. NUMBERS BAR & DUAL GATEWAY CARDS
          ==================================================================== */}
      {/* Stats Bar with Number Animation */}
      <section className="oxy-landing-stats-bar oxy-reveal-on-scroll" ref={statsRef} aria-label="Platform Statistics">
        <div className="oxy-landing-stats-grid">
          <div className="oxy-landing-stat-item">
            <div className="oxy-landing-stat-value">
              ₹{countDisbursal}+
            </div>
            <div className="oxy-landing-stat-label">DISBURSAL</div>
          </div>
          <div className="oxy-landing-stat-item">
            <div className="oxy-landing-stat-value">
              {countBorrowers}+
            </div>
            <div className="oxy-landing-stat-label">BORROWERS</div>
          </div>
          <div className="oxy-landing-stat-item">
            <div className="oxy-landing-stat-value">
              {countLenders}+
            </div>
            <div className="oxy-landing-stat-label">LENDERS</div>
          </div>
        </div>
      </section>

      {/* Dual Registration Gateway (Lender / Borrower) - Impressive New Cards Design */}
      <section className="oxy-landing-dual-gateway-section oxy-reveal-on-scroll" aria-label="Registration Portals">
        <div className="oxy-landing-dual-gateway-container">
          {/* Card 1: START LENDING (INVESTOR) */}
          <div className="oxy-gateway-card lender-theme">
            <div className="oxy-gateway-card-top">
              <span className="oxy-gateway-badge lender-badge">★ INVESTOR PORTAL</span>
              <div className="oxy-gateway-icon-wrap lender-icon-bg">
                <FaCoins className="oxy-gateway-icon" />
              </div>
            </div>

            <div className="oxy-gateway-content">
              <h3 className="oxy-gateway-title">Start Lending</h3>
              <div className="oxy-gateway-highlight lender-highlight">
                Earn Up to 1.75% Monthly ROI (12% – 36% p.a.)
              </div>
              <p className="oxy-gateway-desc">
                All citizens of India &amp; Non-Resident Indians (NRIs) are eligible
              </p>

              <ul className="oxy-gateway-features">
                <li>
                  <FaCheckCircle className="feat-check" />
                  <span>Direct monthly interest returns to your bank</span>
                </li>
                <li>
                  <FaCheckCircle className="feat-check" />
                  <span>Escrow account monitored by independent Trustee</span>
                </li>
                <li>
                  <FaCheckCircle className="feat-check" />
                  <span>Choose borrowers with AI-backed credit scores</span>
                </li>
              </ul>
            </div>

            <div className="oxy-gateway-footer">
              <Link to="/register" className="oxy-gateway-cta btn-lender">
                <span>START LENDING</span>
                <FaArrowRight className="cta-arrow" />
              </Link>
            </div>
          </div>

          {/* Card 2: START BORROWING (BORROWER) */}
          <div className="oxy-gateway-card borrower-theme">
            <div className="oxy-gateway-card-top">
              <span className="oxy-gateway-badge borrower-badge">★ BORROWER PORTAL</span>
              <div className="oxy-gateway-icon-wrap borrower-icon-bg">
                <FaBolt className="oxy-gateway-icon" />
              </div>
            </div>

            <div className="oxy-gateway-content">
              <h3 className="oxy-gateway-title">Start Borrowing</h3>
              <div className="oxy-gateway-highlight borrower-highlight">
                Instant Loans from ₹25,000 to ₹10,00,000
              </div>
              <p className="oxy-gateway-desc">
                All citizens of Indian resident can apply for a loan online
              </p>

              <ul className="oxy-gateway-features">
                <li>
                  <FaCheckCircle className="feat-check" />
                  <span>100% digital KYC &amp; hassle-free rapid approval</span>
                </li>
                <li>
                  <FaCheckCircle className="feat-check" />
                  <span>Transparent interest rates with zero hidden charges</span>
                </li>
                <li>
                  <FaCheckCircle className="feat-check" />
                  <span>Direct loan disbursement into bank account</span>
                </li>
              </ul>
            </div>

            <div className="oxy-gateway-footer">
              <Link to="/borrower_register" className="oxy-gateway-cta btn-borrower">
                <span>START BORROWING</span>
                <FaArrowRight className="cta-arrow" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. MAKE A SMART MOVE. CHOOSE US.
          ==================================================================== */}
      <section className="oxy-landing-smart-move-section oxy-reveal-on-scroll">
        <h2 className="oxy-landing-section-title">
          MAKE A SMART MOVE. CHOOSE US.
        </h2>
        <div className="oxy-landing-divider-dotline">
          <span className="dot" />
        </div>

        <div className="oxy-landing-features-grid">
          <div className="oxy-landing-feature-card">
            <div className="oxy-landing-feature-icon-wrap">
              <FaBalanceScale />
            </div>
            <div className="oxy-landing-feature-title">EASY COMPARE</div>
          </div>

          <div className="oxy-landing-feature-card">
            <div className="oxy-landing-feature-icon-wrap">
              <FaUsers />
            </div>
            <div className="oxy-landing-feature-title">EXPERT ASSISTANCE</div>
          </div>

          <div className="oxy-landing-feature-card">
            <div className="oxy-landing-feature-icon-wrap">
              <FaWallet />
            </div>
            <div className="oxy-landing-feature-title">SAVE MONEY</div>
          </div>

          <div className="oxy-landing-feature-card">
            <div className="oxy-landing-feature-icon-wrap">
              <FaFileContract />
            </div>
            <div className="oxy-landing-feature-title">CLAIM ASSISTANCE</div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. PROVEN PROCESS PRODUCES RESULTS (HONEYCOMB & PROCESS OF LENDING)
          ==================================================================== */}
      <section className="oxy-landing-process-section oxy-reveal-on-scroll" id="proven-process">
        {/* Section Header with Green Divider */}
        <div className="oxy-process-header">
          <h2 className="oxy-process-title">PROVEN PROCESS PRODUCES RESULTS</h2>
          <div className="oxy-process-divider">
            <span className="dot" />
          </div>
        </div>

        {/* Mobile Touch-Friendly Step Pills (Visible <= 991px) */}
        <div className="oxy-process-mobile-nav" role="tablist" aria-label="Process steps">
          {[
            { id: "overview", label: "Overview", icon: FaBrain, tag: "all" },
            { id: "lender-partner", label: "1. Lender Partner", icon: FaUsers, tag: "lender" },
            { id: "lender-reviews", label: "2. Review Loans", icon: FaFileSignature, tag: "lender" },
            { id: "lender-negotiate", label: "3. Negotiate Terms", icon: FaHandshake, tag: "lender" },
            { id: "borrower-main", label: "4. Borrower Portal", icon: FaUser, tag: "borrower" },
            { id: "borrower-apply", label: "5. Application", icon: FaFileUpload, tag: "borrower" },
            { id: "borrower-offers", label: "6. Select Offer", icon: FaTasks, tag: "borrower" },
          ].map((step) => {
            const Icon = step.icon;
            const isActive = activeHex === step.id;
            return (
              <button
                key={step.id}
                type="button"
                className={`oxy-process-pill-tab ${isActive ? "active" : ""} tab-${step.tag}`}
                onClick={() => setActiveHex(step.id)}
                role="tab"
                aria-selected={isActive}
              >
                <Icon className="tab-pill-icon" />
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>

        <div className="oxy-landing-process-grid">
          {/* Left: 7-Hexagon Honeycomb Diagram (Bigger Interactive Circles) */}
          <div className="oxy-landing-hexagons-container">
            <div className="oxy-landing-hex-cluster-wrapper">
              <div className="oxy-landing-hex-cluster">
                {/* 1. Center: OxyLoans Logo (White) */}
                <div
                  className={`oxy-hex-item hex-center ${activeHex === "overview" ? "active" : ""}`}
                  onClick={() => setActiveHex("overview")}
                  title="Click to view OxyLoans Platform Overview"
                >
                  <div className="hex-content">
                    <img src={oxyLogoDash} alt="OxyLoans" className="hex-center-logo" />
                    <span className="hex-center-subtext">Lend • Borrow • Invest</span>
                  </div>
                </div>

                {/* 2. Top-Left: Lender Investor Partner (Green) */}
                <div
                  className={`oxy-hex-item hex-top-left hex-green ${activeHex === "lender-partner" ? "active" : ""}`}
                  onClick={() => setActiveHex("lender-partner")}
                  title="Click to explore Lender Investor Partner Process"
                >
                  <div className="hex-content">
                    <FaUsers className="hex-icon" />
                    <span className="hex-label">Lender Investor<br />Partner</span>
                  </div>
                </div>

                {/* 3. Middle-Left: Reviews Loans & Extend Offers (Green) */}
                <div
                  className={`oxy-hex-item hex-mid-left hex-green ${activeHex === "lender-reviews" ? "active" : ""}`}
                  onClick={() => setActiveHex("lender-reviews")}
                  title="Click to explore Reviews Loans & Extend Offers"
                >
                  <div className="hex-content">
                    <FaFileSignature className="hex-icon" />
                    <span className="hex-label">Reviews Loans &amp;<br />Extend Offers</span>
                  </div>
                </div>

                {/* 4. Bottom-Left: Negotiates Rate % Terms (Green) */}
                <div
                  className={`oxy-hex-item hex-bot-left hex-green ${activeHex === "lender-negotiate" ? "active" : ""}`}
                  onClick={() => setActiveHex("lender-negotiate")}
                  title="Click to explore Negotiates Rate % Terms"
                >
                  <div className="hex-content">
                    <FaHandshake className="hex-icon" />
                    <span className="hex-label">Negotiates Rate %<br />Terms</span>
                  </div>
                </div>

                {/* 5. Top-Right: Borrower (Blue) */}
                <div
                  className={`oxy-hex-item hex-top-right hex-blue ${activeHex === "borrower-main" ? "active" : ""}`}
                  onClick={() => setActiveHex("borrower-main")}
                  title="Click to explore Borrower Process"
                >
                  <div className="hex-content">
                    <FaUser className="hex-icon" />
                    <span className="hex-label">Borrower</span>
                  </div>
                </div>

                {/* 6. Middle-Right: Submits Loan Application (Blue) */}
                <div
                  className={`oxy-hex-item hex-mid-right hex-blue ${activeHex === "borrower-apply" ? "active" : ""}`}
                  onClick={() => setActiveHex("borrower-apply")}
                  title="Click to explore Submits Loan Application"
                >
                  <div className="hex-content">
                    <FaFileUpload className="hex-icon" />
                    <span className="hex-label">Submits Loan<br />Application</span>
                  </div>
                </div>

                {/* 7. Bottom-Right: Select Best offer from Multiple (Blue) */}
                <div
                  className={`oxy-hex-item hex-bot-right hex-blue ${activeHex === "borrower-offers" ? "active" : ""}`}
                  onClick={() => setActiveHex("borrower-offers")}
                  title="Click to explore Select Best offer from Multiple"
                >
                  <div className="hex-content">
                    <FaTasks className="hex-icon" />
                    <span className="hex-label">Select Best offer<br />from Multiple</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Dynamic Sliding Pitch & Details (Slides in on Circle Click) */}
          <div className="oxy-landing-process-pitch">
            {(() => {
              const currentStep = processStepsData[activeHex] || processStepsData["overview"];
              return (
                <div key={activeHex} className="oxy-process-slide-content">
                  <div className="oxy-process-slide-header">
                    <span className={`oxy-process-node-badge ${currentStep.badgeClass}`}>
                      {currentStep.category}
                    </span>
                  </div>

                  <h3 className="oxy-landing-process-title">{currentStep.title}</h3>
                  <div className="oxy-landing-process-subtitle">{currentStep.subtitle}</div>
                  <p className="oxy-landing-process-desc">{currentStep.description}</p>

                  <ul className="oxy-process-highlights-list">
                    {currentStep.points.map((point, idx) => (
                      <li key={idx}>
                        <FaCheckCircle className="feat-check-icon" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="oxy-landing-process-buttons">
                    <Link
                      to={currentStep.primaryBtnLink}
                      className={`oxy-pill-btn ${currentStep.primaryBtnTheme}`}
                    >
                      <span>{currentStep.primaryBtnText}</span>
                      <FaArrowRight className="pill-arrow" />
                    </Link>

                    {currentStep.secondaryBtnText && (
                      <Link
                        to={currentStep.secondaryBtnLink}
                        className={`oxy-pill-btn ${currentStep.secondaryBtnTheme}`}
                      >
                        <span>{currentStep.secondaryBtnText}</span>
                        <FaArrowRight className="pill-arrow" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="oxy-process-interactive-hint">
              <span>💡 Click any circle on the left to slide in its dedicated details</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. QUICK LOANS. THE RIGHT WAY. (DUAL BLUE CARDS)
          ==================================================================== */}
      <section className="oxy-landing-quick-loans-section" id="quick-loans">
        <h2 className="oxy-landing-section-title">
          QUICK LOANS. THE RIGHT WAY.
        </h2>
        <div className="oxy-landing-divider-dotline">
          <span className="dot" />
        </div>

        <div className="oxy-landing-cards-row">
          {/* Card 1: BORROWER */}
          <div className="oxy-landing-blue-card borrower-card-theme" id="borrower-section">
            <div className="oxy-landing-card-icon">
              <FaWallet />
            </div>
            <div className="oxy-landing-card-heading">BORROWER</div>
            <Link to="/borrower_register" className="oxy-landing-card-btn">
              Start Borrowing
            </Link>
            <ul className="oxy-landing-card-list">
              <li>All Indian citizens are eligible</li>
              <li>Borrowers can apply for a loan online.</li>
              <li>Our platform carefully screens each borrower.</li>
              <li>We encourage Borrowers with valid documents.</li>
            </ul>
          </div>

          {/* Card 2: LENDER */}
          <div className="oxy-landing-blue-card lender-card-theme" id="lender-section">
            <div className="oxy-landing-card-icon">
              <FaUserTie />
            </div>
            <div className="oxy-landing-card-heading">LENDER</div>
            <Link to="/register" className="oxy-landing-card-btn">
              Start lending
            </Link>
            <ul className="oxy-landing-card-list">
              <li>All Indian citizens are eligible.</li>
              <li>Lenders are free to choose their preferred Borrowers.</li>
              <li>They can quote the rate of interest they want on their principal.</li>
              <li>They can distribute the principal among Borrowers to minimize the risk.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. KNOWLEDGE CENTER
          ==================================================================== */}
      <section className="oxy-landing-knowledge-section oxy-reveal-on-scroll" id="knowledge-center">
        <div className="oxy-landing-knowledge-grid">
          {/* Left Column: Icon + Title + Divider */}
          <div className="oxy-landing-knowledge-left">
            <div className="oxy-landing-knowledge-badge">
              <FaBrain className="kc-brain-icon" />
            </div>
            <h2 className="oxy-landing-section-title">KNOWLEDGE CENTER</h2>
            <div className="oxy-landing-divider-dotline">
              <span className="dot" />
            </div>
          </div>

          {/* Right Column: Interactive FAQs & Action Buttons */}
          <div className="oxy-landing-knowledge-right">
            <div className="oxy-kc-faq-list">
              {/* Category 1: Lender FAQs */}
              <div className={`oxy-kc-faq-group ${activeFaq === "lender" ? "active" : ""}`}>
                <div
                  className="oxy-kc-faq-trigger"
                  onClick={() => setActiveFaq(activeFaq === "lender" ? null : "lender")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="oxy-kc-faq-trigger-left">
                    <FaQuestionCircle className="kc-question-icon" />
                    <span className="kc-question-title">Lender Frequently Asked Questions</span>
                  </div>
                  <FaChevronDown className="kc-chevron-icon" />
                </div>

                {activeFaq === "lender" && (
                  <div className="oxy-kc-faq-dropdown">
                    <div className="oxy-kc-qa-item">
                      <h4 className="qa-question">Do I need to register with OxyLoans.com?</h4>
                      <p className="qa-answer">
                        Yes, OxyLoans encourages you to complete the registration process. Upon 60% of completion of your profile, you are eligible to lend money.
                      </p>
                    </div>

                    <div className="oxy-kc-qa-item">
                      <h4 className="qa-question">What is the minimum amount I can lend?</h4>
                      <p className="qa-answer">
                        INR 5,000 is the minimum amount to start lending. We suggest you lend small amounts to many people so that the risk is minimized.
                      </p>
                    </div>

                    <div className="oxy-kc-qa-item">
                      <h4 className="qa-question">What is the rate of interest that I can ask for?</h4>
                      <p className="qa-answer">
                        We suggest you lend to more people and charge the rate of interest based on their profile strength. We suggest you to charge starting from 12% per year to 36% per year and maintain 24% average returns across loans.
                      </p>
                    </div>

                    {/* Corner View More for Lender FAQs */}
                    <div className="oxy-kc-card-corner-wrap">
                      <Link to="/faqs?category=lender" className="oxy-kc-card-corner-btn btn-corner-lender">
                        <span>View All 16 Lender FAQs</span>
                        <FaArrowRight className="corner-arrow" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Category 2: Borrower FAQs */}
              <div className={`oxy-kc-faq-group ${activeFaq === "borrower" ? "active" : ""}`}>
                <div
                  className="oxy-kc-faq-trigger"
                  onClick={() => setActiveFaq(activeFaq === "borrower" ? null : "borrower")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="oxy-kc-faq-trigger-left">
                    <FaQuestionCircle className="kc-question-icon" />
                    <span className="kc-question-title">Borrower Frequently Asked Questions</span>
                  </div>
                  <FaChevronDown className="kc-chevron-icon" />
                </div>

                {activeFaq === "borrower" && (
                  <div className="oxy-kc-faq-dropdown">
                    <div className="oxy-kc-qa-item">
                      <h4 className="qa-question">Do I need to register?</h4>
                      <p className="qa-answer">
                        Yes, OxyLoans encourages every borrower to complete the registration process. Upon 60% completion of the profile, the borrower is eligible to apply for a loan.
                      </p>
                    </div>

                    <div className="oxy-kc-qa-item">
                      <h4 className="qa-question">What are the minimum and maximum amounts I can borrow?</h4>
                      <p className="qa-answer">
                        INR 5,000 is the minimum amount you can borrow and maximum amount is ₹10,00,000 with flexible tenures from 1 to 36 months negotiable with lenders.
                      </p>
                    </div>

                    <div className="oxy-kc-qa-item">
                      <h4 className="qa-question">Can I choose to pay only interest month-on-month and clear Principal later?</h4>
                      <p className="qa-answer">
                        Yes! The platform offers both Month-on-Month Interest + principal at the end of the loan term, standard Flat EMI, and Reduced Balance methods based on mutual agreement.
                      </p>
                    </div>

                    <div className="oxy-kc-qa-item">
                      <h4 className="qa-question">May I know the charges involved?</h4>
                      <p className="qa-answer">
                        There is absolutely no fee to the borrower if the bank is lending. In peer-to-peer lending, the borrower is charged 2.5% of the loan amount with zero hidden charges.
                      </p>
                    </div>

                    {/* Corner View More for Borrower FAQs */}
                    <div className="oxy-kc-card-corner-wrap">
                      <Link to="/faqs?category=borrower" className="oxy-kc-card-corner-btn btn-corner-borrower">
                        <span>View All 22 Borrower FAQs</span>
                        <FaArrowRight className="corner-arrow" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Outlined Pill Buttons Matching Original Design */}
            <div className="oxy-landing-knowledge-actions">
              <Link to="/register" className="oxy-kc-outline-pill btn-pill-blue">
                <span>START LENDING</span>
                <FaArrowRight className="btn-arrow" />
              </Link>
              <Link to="/borrower_register" className="oxy-kc-outline-pill btn-pill-green">
                <span>START BORROWING</span>
                <FaArrowRight className="btn-arrow" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. WORD FROM CEO & ABOUT SRS FINTECHLABS (OXYLOANS)
          ==================================================================== */}
      <section className="oxy-landing-about-section oxy-reveal-on-scroll" id="about-section">
        <div className="oxy-landing-about-grid">
          {/* Left: Word From CEO */}
          <div className="oxy-landing-ceo-box">
            {/* Mobile Executive Header (Visible only on mobile <= 991px) */}
            <div className="oxy-ceo-mobile-header">
              <div className="oxy-ceo-avatar-frame">
                <img
                  src={ceoPhoto}
                  alt="Mr. Radhakrishna Thatavarti"
                  className="oxy-ceo-avatar-img"
                />
              </div>
              <div className="oxy-ceo-profile-meta">
                <span className="oxy-ceo-kicker">FOUNDER &amp; MANAGING DIRECTOR</span>
                <h3 className="oxy-ceo-mobile-name">Mr. Radhakrishna Thatavarti</h3>
                <span className="oxy-ceo-mobile-role">CEO, OxyLoans (SRS Fintechlabs Pvt Ltd)</span>
              </div>
            </div>

            <div className="oxy-ceo-left-stack">
              {/* Header & Callout Pointer Line */}
              <div className="oxy-ceo-header-callout">
                <div className="oxy-ceo-text-group">
                  <span className="oxy-ceo-kicker desktop-only">LEADERSHIP VISION</span>
                  <h3 className="oxy-landing-ceo-title">Word From CEO</h3>
                  <div className="oxy-landing-ceo-name">Mr. Radhakrishna Thatavarti</div>
                  <span className="oxy-ceo-sub-role">Founder &amp; Managing Director</span>
                </div>
                <svg className="oxy-ceo-callout-svg" width="52" height="36" viewBox="0 0 52 36" fill="none">
                  <circle cx="44" cy="8" r="5" stroke="#94a3b8" strokeWidth="1.8" fill="none" />
                  <circle cx="44" cy="8" r="2" fill="#94a3b8" />
                  <line x1="38" y1="12" x2="18" y2="30" stroke="#94a3b8" strokeWidth="1.5" />
                  <line x1="18" y1="30" x2="0" y2="30" stroke="#94a3b8" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Direct Reach CEO & Connect Links */}
              <div className="oxy-landing-ceo-reach">
                <span className="reach-label">Reach Our CEO:</span>
                <div className="reach-actions-row">
                  <a href="mailto:radhakrishna.t@oxyloans.com" className="reach-email-pill">
                    <FaEnvelope className="reach-btn-icon" />
                    <span>radhakrishna.t@oxyloans.com</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/oxyradhakrishna"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="reach-linkedin-pill"
                    aria-label="Connect with Mr. Radhakrishna Thatavarti on LinkedIn"
                  >
                    <FaLinkedinIn className="reach-btn-icon" />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Desktop Free-Standing Cutout Photo */}
            <div className="oxy-ceo-photo-wrap">
              <img
                src={ceoPhoto}
                alt="Mr. Radhakrishna Thatavarti, CEO OxyLoans"
                className="oxy-landing-ceo-photo"
              />
            </div>
          </div>

          {/* Right: About SRS Fintechlabs */}
          <div className="oxy-landing-about-right">
            <h2 className="oxy-landing-about-title">
              <span>ABOUT SRS FINTECHLABS</span>
              <span>(OXYLOANS)</span>
            </h2>

            <div className="oxy-about-green-divider">
              <span className="green-line" />
              <span className="green-node">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="8" stroke="#689f38" strokeWidth="2" fill="none" />
                  <circle cx="12" cy="12" r="3" fill="#689f38" />
                </svg>
              </span>
              <span className="green-line" />
            </div>

            <p className="oxy-landing-about-text">
              OxyLoans.com is a revolutionary FinTech platform. We encourage
              Peer- to-Peer Lending (P2PL) and Peer-to-Peer Investing (P2PI).We
              invite Tax Paying Individuals, HNIS as Lenders. We enable lender,
              investor exchange funds directly with Borrowers. Our proprietary
              algorithms include Credit Scoring, Underwriting and Agreement
              Preparation.
            </p>

            {/* Satisfied Customers Counter */}
            <div className="oxy-landing-counter-row">
              <div className="oxy-landing-counter-badge">
                <FaUserCheck className="oxy-counter-user-icon" />
                <div className="oxy-counter-label-stack">
                  <span>SATISFIED</span>
                  <span>CUSTOMERS</span>
                </div>
              </div>

              <div className="oxy-landing-digit-boxes" aria-label="05342 Satisfied Customers">
                {satisfiedDigits.map((digit, idx) => (
                  <span key={idx} className="oxy-landing-digit-box">
                    {digit}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. SUCCESS STORIES & LENDER TESTIMONIALS (Option 1 Split Spotlight)
          ==================================================================== */}
      <LandingLenderStories />

      {/* ====================================================================
          9. NEWSLETTER / LOAN OFFER BAR
          ==================================================================== */}
      <section className="oxy-landing-newsletter-bar oxy-reveal-on-scroll">
        <div className="oxy-landing-newsletter-inner">
          <div className="oxy-landing-newsletter-title">
            Get in touch with exciting loan offers
          </div>
          <form className="oxy-landing-newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              className="oxy-landing-newsletter-input"
              placeholder="Enter your email"
              value={newsEmail}
              onChange={(e) => setNewsEmail(e.target.value)}
              required
            />
            <button type="submit" className="oxy-landing-newsletter-btn">
              {subscribed ? (
                <>
                  <FaCheckCircle /> SUBMITTED
                </>
              ) : (
                <>
                  SUBMIT <FaArrowRight />
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      {/* ====================================================================
          10. COMPREHENSIVE FOOTER & REGULATORY DISCLAIMER
          ==================================================================== */}
      <LandingFooter
        onOpenDisclosure={(title) => setDisclosureModal(title)}
        onScrollToSection={(id) => scrollToSection(id)}
      />



      {/* ====================================================================
          REGULATORY DISCLOSURE MODAL
          ==================================================================== */}
      {disclosureModal && (
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
          onClick={() => setDisclosureModal(null)}
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <h4 style={{ margin: 0, fontSize: "18px", color: "#0077c8" }}>{disclosureModal}</h4>
              <button
                onClick={() => setDisclosureModal(null)}
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
                <strong>RBI Compliance &amp; Regulatory Overview:</strong><br />
                M/S SRS FINTECHLABS PVT. LTD. operates the P2P lending platform OxyLoans under Certificate of Registration dated Feb 06, 2019, issued by the Reserve Bank of India under Section 45 IA of the Reserve Bank of India Act, 1934.
              </p>
              <p style={{ marginTop: "10px" }}>
                <strong>Key Principles:</strong><br />
                • 100% transparency in interest rates and fee structures.<br />
                • Strict adherence to RBI Fair Practices Code for transparent disclosures.<br />
                • Independent Escrow Account Trustee oversight for seamless fund movement.<br />
                • Robust grievance redressal mechanism with dedicated nodal officers.
              </p>
            </div>
            <button
              onClick={() => setDisclosureModal(null)}
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
      {/* Floating Smooth Back-To-Top Button */}
      <button
        type="button"
        className={`oxy-back-to-top ${showBackToTop ? "visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to Top"
        title="Back to Top"
      >
        <FaChevronUp />
      </button>
    </div>
  );
};

export default Landing;
