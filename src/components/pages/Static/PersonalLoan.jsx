import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaUserCheck,
  FaCalculator,
  FaCheckCircle,
  FaFileInvoiceDollar,
  FaArrowRight,
  FaArrowLeft,
  FaUserFriends,
  FaShieldAlt,
  FaCoins,
  FaEye,
  FaTimes,
  FaInfoCircle,
  FaCheck,
  FaPercentage,
  FaCalendarAlt,
  FaClock,
  FaLock,
  FaSlidersH,
  FaHome,
  FaBuilding,
  FaCity,
  FaHammer,
} from "react-icons/fa";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";

// Reusable multipurpose icons downloaded locally
import home1 from "../../../assets/img/landing/travel/home1.png";
import home2 from "../../../assets/img/landing/travel/home2.png";
import home3 from "../../../assets/img/landing/travel/home3.png";
import home4 from "../../../assets/img/landing/travel/home4.png";
import home5 from "../../../assets/img/landing/travel/home5.png";
import home6 from "../../../assets/img/landing/travel/home6-1.png";
import home7 from "../../../assets/img/landing/travel/home7.png";
import home8 from "../../../assets/img/landing/travel/home8.png";
import oxyTitleDivider from "../../../assets/img/landing/oxy_title_divider.png";

import "./PersonalLoan.css";

const PersonalLoan = () => {
  // Personal Loan Calculator State (Section 4)
  const [loanAmount, setLoanAmount] = useState(150000);
  const [tenure, setTenure] = useState(12); // months
  const [annualRoi, setAnnualRoi] = useState(18); // 18% p.a.

  // Category filter state for multipurpose loan tiles
  const [activeCategory, setActiveCategory] = useState("All Purposes");

  // Quick Action Modal State (Informational / Simulator modal)
  const [selectedPurpose, setSelectedPurpose] = useState(null);
  const [modalTab, setModalTab] = useState("details"); // "details" | "calculator"
  const [modalAmount, setModalAmount] = useState(500000);
  const [modalTenure, setModalTenure] = useState(24);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Lock body scroll when modal is open and handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && selectedPurpose) {
        handleCloseQuickModal();
      }
    };

    if (selectedPurpose) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPurpose]);

  const formatINR = (val) => {
    return Math.round(Number(val) || 0).toLocaleString("en-IN");
  };

  // Standard Reducing EMI calculation for Section 4
  const monthlyRate = annualRoi / 12 / 100;
  const emiAmount =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1);
  const totalRepayment = emiAmount * tenure;
  const totalInterest = totalRepayment - loanAmount;

  // Purpose Cards Data with rich metadata for interactive Quick Action Modal
  const purposes = [
    {
      id: "construction",
      img: home1,
      title: "For Construction of a New House",
      category: "Construction & Land",
      tag: "High Approval",
      tagColor: "blue",
      rate: "10.5% p.a.",
      roiNumber: 10.5,
      maxAmount: "₹50 Lakhs",
      maxNumeric: 5000000,
      defaultAmount: 2000000,
      tenure: "12 - 60 Months",
      defaultTenure: 36,
      desc: "Build your independent dream home with flexible milestone funding and quick loan sanctions.",
      highlights: [
        "Milestone-based fund release tied to civil stages",
        "Direct negotiation with verified P2P investors",
        "Zero hidden processing charges or appraisal overheads",
        "Fast document verification within 24 hours",
      ],
      suitableFor: "Independent plot owners planning residential civil construction",
    },
    {
      id: "dream-home",
      img: home2,
      title: "Purchase of Dream Home",
      category: "Home Purchase",
      tag: "Most Popular",
      tagColor: "green",
      rate: "9.99% p.a.",
      roiNumber: 9.99,
      maxAmount: "₹1 Crore",
      maxNumeric: 10000000,
      defaultAmount: 3500000,
      tenure: "12 - 84 Months",
      defaultTenure: 48,
      desc: "Turn your dream home into reality with competitive P2P interest rates and minimal documentation.",
      highlights: [
        "Industry-low P2P interest rates starting at 9.99% p.a.",
        "Transparent borrower-lender interaction with zero middleman",
        "Digital KYC onboarding with minimal paperwork",
        "Zero foreclosure or part-prepayment penalties",
      ],
      suitableFor: "First-time home buyers looking for rapid sanctions & flexible tenures",
    },
    {
      id: "interiors",
      img: home3,
      title: "Interiors of Home",
      category: "Renovation & Interiors",
      tag: "Instant Disbursal",
      tagColor: "purple",
      rate: "12.0% p.a.",
      roiNumber: 12.0,
      maxAmount: "₹15 Lakhs",
      maxNumeric: 1500000,
      defaultAmount: 500000,
      tenure: "6 - 36 Months",
      defaultTenure: 24,
      desc: "Revamp your living space, modular kitchens, and contemporary interiors with fast cash disbursal.",
      highlights: [
        "100% paperless approval directly through mobile/web",
        "Fast disbursal straight to your account or contractor",
        "Manageable monthly EMIs suited to salaried professionals",
        "Instant top-up limits available based on repayment track",
      ],
      suitableFor: "Homeowners upgrading kitchens, wardrobes, and designer interiors",
    },
    {
      id: "open-land",
      img: home4,
      title: "Purchase of Open Land",
      category: "Construction & Land",
      tag: "Prime Investment",
      tagColor: "amber",
      rate: "11.5% p.a.",
      roiNumber: 11.5,
      maxAmount: "₹40 Lakhs",
      maxNumeric: 4000000,
      defaultAmount: 1800000,
      tenure: "12 - 48 Months",
      defaultTenure: 36,
      desc: "Invest in approved residential plots or farmland with clear legal verification and trusted investors.",
      highlights: [
        "Clear title & documentation legal scrutiny assistance",
        "Flexible EMI repayment schedules tailored to plot investment",
        "Verified individual and institutional investor participation",
        "Fast approval with minimal bank visits",
      ],
      suitableFor: "Real estate investors purchasing open layouts and approved plots",
    },
    {
      id: "apartment",
      img: home5,
      title: "Buy an Apartment",
      category: "Home Purchase",
      tag: "Fast Track",
      tagColor: "teal",
      rate: "10.25% p.a.",
      roiNumber: 10.25,
      maxAmount: "₹75 Lakhs",
      maxNumeric: 7500000,
      defaultAmount: 2800000,
      tenure: "12 - 72 Months",
      defaultTenure: 48,
      desc: "Secure hassle-free funding for ready-to-move-in or under-construction apartments and flats.",
      highlights: [
        "Seamless builder NOC coordination and fast processing",
        "Doorstep documentation collection & e-sign facility",
        "Customizable monthly installment plans with low burden",
        "High loan-to-value eligibility for verified buyers",
      ],
      suitableFor: "Salaried & self-employed individuals buying gated community flats",
    },
    {
      id: "renovation",
      img: home6,
      title: "Home Renovation",
      category: "Renovation & Interiors",
      tag: "Quick Approval",
      tagColor: "indigo",
      rate: "12.5% p.a.",
      roiNumber: 12.5,
      maxAmount: "₹20 Lakhs",
      maxNumeric: 2000000,
      defaultAmount: 600000,
      tenure: "6 - 36 Months",
      defaultTenure: 18,
      desc: "Repair, paint, waterproof, or expand your existing house with zero collateral requirements.",
      highlights: [
        "No collateral or property mortgaging required",
        "Instant online eligibility check within minutes",
        "Direct bank credit upon peer-to-peer bid acceptance",
        "Transparent schedule of charges with zero surprises",
      ],
      suitableFor: "Home repairs, painting, bathroom fittings, and minor extensions",
    },
    {
      id: "villa",
      img: home7,
      title: "Purchase a New Villa",
      category: "Home Purchase",
      tag: "Premium Club",
      tagColor: "rose",
      rate: "10.5% p.a.",
      roiNumber: 10.5,
      maxAmount: "₹1.5 Crore",
      maxNumeric: 15000000,
      defaultAmount: 5000000,
      tenure: "12 - 84 Months",
      defaultTenure: 60,
      desc: "Luxury villa financing with personalized relationship manager support and flexible terms.",
      highlights: [
        "High quantum loan sanctions for premium properties",
        "Dedicated senior relationship manager for end-to-end support",
        "Attractive interest rate concessions for verified profiles",
        "Priority document processing and rapid closing",
      ],
      suitableFor: "HNIs and executives acquiring independent luxury villas",
    },
    {
      id: "commercial",
      img: home8,
      title: "Construction of Commercial Building",
      category: "Commercial",
      tag: "Business Scale",
      tagColor: "emerald",
      rate: "13.0% p.a.",
      roiNumber: 13.0,
      maxAmount: "₹2 Crore",
      maxNumeric: 20000000,
      defaultAmount: 6000000,
      tenure: "12 - 60 Months",
      defaultTenure: 48,
      desc: "Construct retail spaces, commercial offices, or rental units with pooled peer-to-peer funding.",
      highlights: [
        "Pooled funding from multiple verified institutional lenders",
        "Structured milestone-based tranches matching contractor bills",
        "Co-borrower and co-guarantor support for higher limits",
        "Rapid processing for high-value commercial ventures",
      ],
      suitableFor: "Commercial developers and business owners expanding premises",
    },
  ];

  const categories = [
    "All Purposes",
    "Home Purchase",
    "Construction & Land",
    "Renovation & Interiors",
    "Commercial",
  ];

  const filteredPurposes =
    activeCategory === "All Purposes"
      ? purposes
      : purposes.filter((p) => p.category === activeCategory);

  // Quick Action Modal handlers
  const handleOpenQuickModal = (purpose, defaultTab = "details") => {
    setSelectedPurpose(purpose);
    setModalTab(defaultTab);
    setModalAmount(purpose.defaultAmount || 500000);
    setModalTenure(purpose.defaultTenure || 24);
  };

  const handleCloseQuickModal = () => {
    setSelectedPurpose(null);
  };

  const handleNextPurpose = () => {
    if (!selectedPurpose) return;
    const currentIndex = purposes.findIndex((p) => p.id === selectedPurpose.id);
    const nextIndex = (currentIndex + 1) % purposes.length;
    const nextP = purposes[nextIndex];
    setSelectedPurpose(nextP);
    setModalAmount(nextP.defaultAmount);
    setModalTenure(nextP.defaultTenure);
  };

  const handlePrevPurpose = () => {
    if (!selectedPurpose) return;
    const currentIndex = purposes.findIndex((p) => p.id === selectedPurpose.id);
    const prevIndex = (currentIndex - 1 + purposes.length) % purposes.length;
    const prevP = purposes[prevIndex];
    setSelectedPurpose(prevP);
    setModalAmount(prevP.defaultAmount);
    setModalTenure(prevP.defaultTenure);
  };

  // Modal Live EMI calculation
  const modalAnnualRoi = selectedPurpose?.roiNumber || 12;
  const modalMonthlyRate = modalAnnualRoi / 12 / 100;
  const modalEmi =
    (modalAmount * modalMonthlyRate * Math.pow(1 + modalMonthlyRate, modalTenure)) /
    (Math.pow(1 + modalMonthlyRate, modalTenure) - 1);
  const modalTotalRepayment = modalEmi * modalTenure;
  const modalTotalInterest = modalTotalRepayment - modalAmount;

  return (
    <div className="oxy-personal-loan-page">
      {/* 1. Modular Header */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Top Hero Banner */}
      <section className="oxy-personal-hero">
        <div className="oxy-personal-hero-inner">
          <div className="oxy-personal-badge-top">
            <FaUserCheck className="badge-icon" />
            <span>INSTANT PEER-TO-PEER PERSONAL LOANS</span>
          </div>
          <h1 className="oxy-personal-hero-title">Personal Loans</h1>
          <p className="oxy-personal-hero-subhead">
            Quick, transparent personal loans tailored for your immediate financial needs.
            Direct interaction between borrowers and verified lenders with manageable
            interest rates and zero middlemen.
          </p>
        </div>
      </section>

      {/* 3. User's Exact Specification Section: borrower-video-wrap */}
      <section className="borrower-video-wrap">
        <div className="container">
          <div className="borrower-head">
            <h2>Personal loans</h2>
            <div className="oxy-title-divider-wrap">
              <img
                src={oxyTitleDivider}
                alt="Divider"
                className="oxy-title-divider-img"
              />
            </div>
          </div>

          {/* User's Exact borrower-list sme-list bullet points */}
          <div className="borrower-list sme-list">
            <ul>
              <li>
                <p>
                  A personal loan is a loan to meet your current financial needs.
                  It is usually taken by borrowers who are looking for quick and
                  easy loans with manageable interest rate and minimum documentation.
                  You can use a personal loan as per your convenience.
                </p>
              </li>
              <li>
                <p>
                  OxyLoans.com brings borrowers and lenders to this platform, where
                  they are free to negotiate their terms and condition within a
                  few preset parameters to keep transaction values under control.
                </p>
              </li>
              <li>
                <p>
                  Any India resident, with valid proof, can lend and borrow at
                  OxyLoans.com.
                </p>
              </li>
              <li>
                <p>
                  Interest rates are purely dependent on the Lender and Borrower.
                  It starts from 12 % Per Year, i.e. 1% per month, to a restricted
                  maximum of 4% per month and 48% Per Year.
                </p>
              </li>
              <li>
                <p>
                  OxyLoans.com is giving both the lender and borrower a unique
                  opportunity, where the lender can put his money to his best use
                  and the borrower can get the best rate of interest on his loan.
                </p>
              </li>
            </ul>
          </div>

          {/* Video + Documentation Row */}
          <div className="row clearfix personal-video-docs-row">
            <div className="col-6 fright video-col">
              <div className="video-player-card">
                <video controls preload="metadata">
                  <source
                    src="https://s3.amazonaws.com/oxyloanswordpress/wp-content/uploads/2017/03/17143624/oxyloans-users-video-copy.mp4"
                    type="video/mp4"
                  />
                  <source
                    src="https://oxyloans.com/wp-content/uploads/2017/03/1.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            <div className="col-6 docs-col">
              <div className="eligibility-content">
                <p className="docs-title">
                  <strong>Documentation required for Personal Loans</strong>
                </p>
                <ul className="docs-list">
                  <li>Aadhar Card</li>
                  <li>Pan Card</li>
                  <li>2 Photos</li>
                  <li>Latest 3 PaySlips</li>
                  <li>Latest 6 Months Bank Statements</li>
                  <li>Employee ID Card</li>
                  <li>Current Address (rental agreement, electricity bill)</li>
                </ul>

                <div className="personal-apply-actions">
                  <Link to="/borrower_register" className="btn-personal-apply">
                    Apply for Personal Loan <FaArrowRight />
                  </Link>
                  <Link to="/register" className="btn-personal-lend">
                    Fund Personal Loans
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Personal Loan EMI Calculator */}
      <section className="oxy-personal-calc-section">
        <div className="container">
          <div className="personal-calc-card">
            <div className="calc-header-title">
              <FaCalculator className="calc-title-icon" />
              <div>
                <h3>Personal Loan EMI Calculator</h3>
                <p>
                  Calculate your monthly installments &amp; interest charges
                </p>
              </div>
            </div>

            <div className="calc-layout-grid">
              <div className="calc-controls">
                <div className="calc-field">
                  <div className="field-label-row">
                    <span>Personal Loan Amount:</span>
                    <strong>₹{formatINR(loanAmount)}</strong>
                  </div>
                  <input
                    type="range"
                    min="20000"
                    max="500000"
                    step="10000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="calc-range-slider"
                  />
                  <div className="slider-limits">
                    <span>₹20,000</span>
                    <span>₹2.5 Lakh</span>
                    <span>₹5 Lakh</span>
                  </div>
                </div>

                <div className="calc-field">
                  <div className="field-label-row">
                    <span>Tenure (Months):</span>
                    <strong>{tenure} Months</strong>
                  </div>
                  <div className="tenure-chips-row">
                    {[3, 6, 12, 18, 24, 36].map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`tenure-chip ${tenure === t ? "active" : ""}`}
                        onClick={() => setTenure(t)}
                      >
                        {t} Months
                      </button>
                    ))}
                  </div>
                </div>

                <div className="calc-field">
                  <div className="field-label-row">
                    <span>Interest Rate (ROI):</span>
                    <strong>{annualRoi}% p.a. ({(annualRoi / 12).toFixed(2)}%/mo)</strong>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="36"
                    step="1"
                    value={annualRoi}
                    onChange={(e) => setAnnualRoi(Number(e.target.value))}
                    className="calc-range-slider"
                  />
                  <div className="slider-limits">
                    <span>12% (1%/mo)</span>
                    <span>24% (2%/mo)</span>
                    <span>36% (3%/mo)</span>
                  </div>
                </div>
              </div>

              <div className="calc-summary-panel">
                <div className="calc-metric-box highlight">
                  <span className="metric-label">Estimated Monthly EMI</span>
                  <strong className="metric-amount">
                    ₹{formatINR(emiAmount)}
                  </strong>
                  <span className="metric-sub">per month for {tenure} months</span>
                </div>

                <div className="calc-metric-row">
                  <div className="mini-metric">
                    <span>Total Interest</span>
                    <strong>₹{formatINR(totalInterest)}</strong>
                  </div>
                  <div className="mini-metric">
                    <span>Total Payable</span>
                    <strong>₹{formatINR(totalRepayment)}</strong>
                  </div>
                </div>

                <Link to="/borrower_register" className="calc-cta-apply">
                  Apply for Loan <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Multipurpose Loan Tiles with Quick Action Buttons & Interactive Modal */}
      <section className="why-borrow-wrap">
        <div className="container">
          <h2>Home Loan Can Be Used For Many Purposes</h2>
          <div className="oxy-title-divider-wrap">
            <img
              src={oxyTitleDivider}
              alt="Divider"
              className="oxy-title-divider-img"
            />
          </div>
          <p className="why-borrow-intro-text">
            Explore versatile financing tailored to your life goals. Compare interest rates,
            check loan limits, and use quick action buttons to explore details or simulate EMIs instantly.
          </p>

          {/* Category Filter Pills */}
          <div className="why-borrow-filter-bar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-pill-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
                {cat === "All Purposes" && ` (${purposes.length})`}
              </button>
            ))}
          </div>

          {/* Purpose Cards Grid */}
          <div className="why-purposes-grid">
            {filteredPurposes.map((p) => (
              <div
                key={p.id}
                className="purpose-card"
                onClick={() => handleOpenQuickModal(p, "details")}
              >
                {/* Top Badge & Rate Row */}
                <div className="purpose-card-top">
                  <span className={`purpose-tag tag-${p.tagColor}`}>{p.tag}</span>
                  <span className="purpose-rate-pill">{p.rate}</span>
                </div>

                {/* Card Icon & Title */}
                <div className="purpose-card-main">
                  <div className="purpose-icon-wrapper">
                    <img src={p.img} alt={p.title} loading="lazy" />
                  </div>
                  <h4 className="purpose-card-title">{p.title}</h4>
                  <p className="purpose-card-desc">{p.desc}</p>
                </div>

                {/* Specifications Bar */}
                <div className="purpose-card-specs">
                  <div className="spec-item">
                    <span className="spec-label">Max Limit</span>
                    <strong className="spec-val">{p.maxAmount}</strong>
                  </div>
                  <div className="spec-divider" />
                  <div className="spec-item">
                    <span className="spec-label">Tenure</span>
                    <strong className="spec-val">{p.tenure}</strong>
                  </div>
                </div>

                {/* Quick Action Buttons (Informational / Details & Simulator Trigger) */}
                <div
                  className="purpose-card-actions"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="btn-quick-view"
                    onClick={() => handleOpenQuickModal(p, "details")}
                    title="Quick View"
                  >
                    <FaEye className="btn-action-icon" />
                    <span>Quick View</span>
                  </button>
                  <button
                    type="button"
                    className="btn-quick-calc"
                    onClick={() => handleOpenQuickModal(p, "calculator")}
                    title="Calculate EMI"
                  >
                    <FaCalculator className="btn-action-icon" />
                    <span>EMI Calc</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Quick Action Modal (Informational Overview & Instant EMI Simulator) */}
      {selectedPurpose && (
        <div
          className="purpose-modal-overlay"
          onClick={handleCloseQuickModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="purpose-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="purpose-modal-header">
              <div className="modal-header-left">
                <div className="modal-purpose-icon">
                  <img src={selectedPurpose.img} alt={selectedPurpose.title} />
                </div>
                <div className="modal-header-titles">
                  <div className="modal-badge-row">
                    <span className="modal-quick-badge">
                      <FaInfoCircle /> QUICK OVERVIEW
                    </span>
                    <span className={`modal-status-badge tag-${selectedPurpose.tagColor}`}>
                      {selectedPurpose.tag}
                    </span>
                  </div>
                  <h3 className="purpose-modal-title">{selectedPurpose.title}</h3>
                  <p className="purpose-modal-subtitle">
                    Fast P2P financing with negotiated interest and zero middlemen
                  </p>
                </div>
              </div>

              <div className="modal-header-right">
                <div className="modal-nav-group">
                  <button
                    type="button"
                    className="modal-nav-btn"
                    onClick={handlePrevPurpose}
                    title="Previous Purpose"
                  >
                    <FaArrowLeft />
                  </button>
                  <button
                    type="button"
                    className="modal-nav-btn"
                    onClick={handleNextPurpose}
                    title="Next Purpose"
                  >
                    <FaArrowRight />
                  </button>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={handleCloseQuickModal}
                  aria-label="Close modal"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Quick Metrics Ribbon */}
            <div className="modal-metrics-ribbon">
              <div className="ribbon-item">
                <span className="ribbon-label">Maximum Limit</span>
                <strong className="ribbon-val">{selectedPurpose.maxAmount}</strong>
              </div>
              <div className="ribbon-item">
                <span className="ribbon-label">Interest Rate</span>
                <strong className="ribbon-val text-primary-accent">
                  {selectedPurpose.rate}
                </strong>
              </div>
              <div className="ribbon-item">
                <span className="ribbon-label">Repayment Tenure</span>
                <strong className="ribbon-val">{selectedPurpose.tenure}</strong>
              </div>
              <div className="ribbon-item">
                <span className="ribbon-label">Disbursal Window</span>
                <strong className="ribbon-val text-success-accent">Within 24 Hours</strong>
              </div>
            </div>

            {/* Modal Tab Switcher */}
            <div className="modal-tab-bar">
              <button
                type="button"
                className={`modal-tab-btn ${modalTab === "details" ? "active" : ""}`}
                onClick={() => setModalTab("details")}
              >
                <FaInfoCircle /> Purpose Overview &amp; Perks
              </button>
              <button
                type="button"
                className={`modal-tab-btn ${modalTab === "calculator" ? "active" : ""}`}
                onClick={() => setModalTab("calculator")}
              >
                <FaCalculator /> Instant EMI Simulator
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="modal-body-content">
              {/* TAB 1: Features & Perks */}
              {modalTab === "details" && (
                <div className="modal-tab-pane">
                  <div className="modal-details-layout">
                    <div className="details-col">
                      <h4 className="details-section-title">
                        <FaCheckCircle className="title-icon" /> Key Advantages
                      </h4>
                      <ul className="details-highlights-list">
                        {selectedPurpose.highlights.map((h, i) => (
                          <li key={i}>
                            <FaCheck className="check-bullet" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="suitable-box">
                        <strong>Ideal For:</strong>
                        <p>{selectedPurpose.suitableFor}</p>
                      </div>
                    </div>

                    <div className="details-col">
                      <h4 className="details-section-title">
                        <FaFileInvoiceDollar className="title-icon" /> Minimal Documents Required
                      </h4>
                      <div className="doc-pills-wrap">
                        <span className="doc-pill">Aadhaar Card (eKYC)</span>
                        <span className="doc-pill">PAN Card</span>
                        <span className="doc-pill">Last 3 Months Salary Slips</span>
                        <span className="doc-pill">6 Months Bank Statement</span>
                        <span className="doc-pill">Current Address Proof</span>
                      </div>

                      <div className="feature-info-card">
                        <h5>P2P Loan Highlights</h5>
                        <ul className="feature-sub-list">
                          <li>Direct negotiation between lenders &amp; borrowers</li>
                          <li>100% digital &amp; transparent process</li>
                          <li>Zero foreclosure charges after cooling period</li>
                          <li>RBI-regulated peer-to-peer NBFC network</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Instant Live EMI Simulator */}
              {modalTab === "calculator" && (
                <div className="modal-tab-pane">
                  <div className="modal-calc-layout">
                    <div className="modal-calc-inputs">
                      <div className="calc-group">
                        <div className="group-label-row">
                          <span>Required Amount:</span>
                          <strong>₹{formatINR(modalAmount)}</strong>
                        </div>
                        <input
                          type="range"
                          min="50000"
                          max={selectedPurpose.maxNumeric || 5000000}
                          step="25000"
                          value={modalAmount}
                          onChange={(e) => setModalAmount(Number(e.target.value))}
                          className="calc-range-slider"
                        />
                      </div>

                      <div className="calc-group">
                        <div className="group-label-row">
                          <span>Tenure:</span>
                          <strong>{modalTenure} Months</strong>
                        </div>
                        <div className="tenure-chips-row">
                          {[6, 12, 18, 24, 36, 48, 60].map((m) => (
                            <button
                              key={m}
                              type="button"
                              className={`tenure-chip ${modalTenure === m ? "active" : ""}`}
                              onClick={() => setModalTenure(m)}
                            >
                              {m}M
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="calc-rate-callout">
                        <FaPercentage className="callout-icon" />
                        <div>
                          <span>Estimated P2P Benchmark ROI</span>
                          <strong>
                            {modalAnnualRoi}% p.a. ({(modalAnnualRoi / 12).toFixed(2)}%/month)
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="modal-calc-result">
                      <div className="result-main-card">
                        <span className="result-tag">ESTIMATED INSTALLMENT</span>
                        <h2 className="result-emi">₹{formatINR(modalEmi)}</h2>
                        <span className="result-period">per month for {modalTenure} months</span>
                      </div>

                      <div className="result-details-grid">
                        <div className="result-item">
                          <span>Principal Amount</span>
                          <strong>₹{formatINR(modalAmount)}</strong>
                        </div>
                        <div className="result-item">
                          <span>Total Interest</span>
                          <strong>₹{formatINR(modalTotalInterest)}</strong>
                        </div>
                        <div className="result-item total-repay">
                          <span>Total Repayable</span>
                          <strong>₹{formatINR(modalTotalRepayment)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="purpose-modal-footer">
              <div className="footer-security-note">
                <FaLock className="lock-icon" />
                <span>256-Bit SSL Encrypted • Direct Borrower-Lender P2P Platform</span>
              </div>
              <div className="footer-actions">
                <button
                  type="button"
                  className="btn-modal-footer-close"
                  onClick={handleCloseQuickModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modular Footer */}
      <LandingFooter />
    </div>
  );
};

export default PersonalLoan;
