import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaIndustry,
  FaCalculator,
  FaCheckCircle,
  FaFileInvoiceDollar,
  FaArrowRight,
  FaArrowLeft,
  FaBuilding,
  FaBriefcase,
  FaCoins,
  FaCogs,
  FaBoxes,
  FaStore,
  FaLaptopCode,
  FaChartLine,
  FaEye,
  FaTimes,
  FaInfoCircle,
  FaCheck,
  FaPercentage,
  FaLock,
  FaShieldAlt,
} from "react-icons/fa";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";
import oxyTitleDivider from "../../../assets/img/landing/oxy_title_divider.png";

import "./SMELoan.css";

const SMELoan = () => {
  // SME Loan Calculator State
  const [loanAmount, setLoanAmount] = useState(500000);
  const [tenure, setTenure] = useState(24); // months
  const [annualRoi, setAnnualRoi] = useState(18); // 18% p.a.

  // Category filter state for multipurpose SME loan tiles
  const [activeCategory, setActiveCategory] = useState("All Purposes");

  // Quick Action Modal State (Informational / Simulator modal)
  const [selectedPurpose, setSelectedPurpose] = useState(null);
  const [modalTab, setModalTab] = useState("details"); // "details" | "calculator"
  const [modalAmount, setModalAmount] = useState(800000);
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

  // Domain-Specific SME Business Loan Purposes
  const purposes = [
    {
      id: "working-capital",
      icon: <FaCoins className="purpose-vector-icon" />,
      title: "Working Capital & Cash Flow Management",
      category: "Working Capital",
      tag: "Highest Demand",
      tagColor: "blue",
      rate: "12.0% p.a.",
      roiNumber: 12.0,
      maxAmount: "₹25 Lakhs",
      maxNumeric: 2500000,
      defaultAmount: 800000,
      tenure: "6 - 36 Months",
      defaultTenure: 24,
      desc: "Maintain smooth day-to-day business operations, pay wages, and handle operational liquidity gaps.",
      highlights: [
        "Immediate liquidity injection within 24-48 hours",
        "No collateral required for verified enterprises",
        "Flexible repayment aligned with client collection cycles",
        "Top-up limits available after 6 on-time EMI repayments",
      ],
      suitableFor: "Manufacturing units, traders, and service agencies managing payroll & liquidity",
    },
    {
      id: "machinery-equipment",
      icon: <FaCogs className="purpose-vector-icon" />,
      title: "Machinery & Equipment Purchase",
      category: "Equipment & Machinery",
      tag: "Asset Growth",
      tagColor: "emerald",
      rate: "11.5% p.a.",
      roiNumber: 11.5,
      maxAmount: "₹50 Lakhs",
      maxNumeric: 5000000,
      defaultAmount: 1500000,
      tenure: "12 - 60 Months",
      defaultTenure: 36,
      desc: "Upgrade plants, automation equipment, heavy machinery, or tools to multiply production capacity.",
      highlights: [
        "Fund up to 90% of equipment proforma invoice value",
        "Extended tenure up to 60 months for low EMI pressure",
        "Direct proforma disbursal to certified equipment suppliers",
        "Tax depreciation benefits applicable on purchased machinery",
      ],
      suitableFor: "Factories, processing plants, auto component units, and printing presses",
    },
    {
      id: "inventory-stock",
      icon: <FaBoxes className="purpose-vector-icon" />,
      title: "Bulk Inventory & Stock Procurement",
      category: "Operations",
      tag: "Fast Turnover",
      tagColor: "amber",
      rate: "12.5% p.a.",
      roiNumber: 12.5,
      maxAmount: "₹20 Lakhs",
      maxNumeric: 2000000,
      defaultAmount: 700000,
      tenure: "3 - 24 Months",
      defaultTenure: 12,
      desc: "Stock up for festival peaks, unlock wholesale volume discounts, and prevent supply chain shortages.",
      highlights: [
        "Short-term flexible tranches matching inventory turnaround",
        "Zero prepayment penalty after initial 3 monthly payments",
        "Fast sanction based on GST and bank turnover records",
        "Avail supplier cash discounts by settling invoices upfront",
      ],
      suitableFor: "Retailers, distributors, wholesalers, and e-commerce sellers",
    },
    {
      id: "premises-expansion",
      icon: <FaStore className="purpose-vector-icon" />,
      title: "Premises Expansion & Store Renovation",
      category: "Growth & Expansion",
      tag: "Retail Scale",
      tagColor: "purple",
      rate: "12.0% p.a.",
      roiNumber: 12.0,
      maxAmount: "₹40 Lakhs",
      maxNumeric: 4000000,
      defaultAmount: 1200000,
      tenure: "12 - 48 Months",
      defaultTenure: 36,
      desc: "Renovate retail storefronts, set up new branch locations, or expand warehouse storage spaces.",
      highlights: [
        "Milestone-based fund release matching civil/fit-out progress",
        "High loan quantum for enterprise physical scaling",
        "Minimal property documentation and online vetting",
        "Customizable grace periods on principal during setup",
      ],
      suitableFor: "Franchise outlets, restaurant chains, retail showrooms, and clinics",
    },
    {
      id: "invoice-discounting",
      icon: <FaFileInvoiceDollar className="purpose-vector-icon" />,
      title: "Invoice Discounting & Vendor Payments",
      category: "Working Capital",
      tag: "Instant Cash",
      tagColor: "teal",
      rate: "11.0% p.a.",
      roiNumber: 11.0,
      maxAmount: "₹30 Lakhs",
      maxNumeric: 3000000,
      defaultAmount: 1000000,
      tenure: "1 - 12 Months",
      defaultTenure: 6,
      desc: "Unlock locked cash from outstanding enterprise client invoices without waiting 60 to 90 days.",
      highlights: [
        "Up to 85% advance on approved raised invoices",
        "Direct P2P settlement with zero recourse complexity",
        "Build stronger credibility with tier-1 vendors",
        "Repeat drawing power linked to ongoing business billing",
      ],
      suitableFor: "B2B vendors, IT contractors, logistics contractors, and OEM suppliers",
    },
    {
      id: "tech-upgrade",
      icon: <FaLaptopCode className="purpose-vector-icon" />,
      title: "Technology, Software & POS Upgrades",
      category: "Operations",
      tag: "Modernize",
      tagColor: "indigo",
      rate: "12.5% p.a.",
      roiNumber: 12.5,
      maxAmount: "₹15 Lakhs",
      maxNumeric: 1500000,
      defaultAmount: 500000,
      tenure: "6 - 36 Months",
      defaultTenure: 18,
      desc: "Implement ERP systems, CRM, modern billing kiosks, digital payment gateways, and servers.",
      highlights: [
        "Covers software licensing, hardware, and implementation costs",
        "100% digital paperwork and direct account disbursal",
        "Low EMI burden tailored to lean operating budgets",
        "Fast approval within 24 hours of digital submission",
      ],
      suitableFor: "SaaS startups, retail billing networks, IT consultancies, and digital agencies",
    },
    {
      id: "raw-material",
      icon: <FaIndustry className="purpose-vector-icon" />,
      title: "Raw Material Bulk Financing",
      category: "Operations",
      tag: "Manufacturing",
      tagColor: "rose",
      rate: "11.75% p.a.",
      roiNumber: 11.75,
      maxAmount: "₹35 Lakhs",
      maxNumeric: 3500000,
      defaultAmount: 1500000,
      tenure: "6 - 24 Months",
      defaultTenure: 12,
      desc: "Purchase steel, polymers, chemicals, fabrics, or components in bulk to beat price inflation.",
      highlights: [
        "Hedge raw material price swings with timely bulk purchase",
        "Direct disbursal to certified suppliers on purchase orders",
        "Flexible bullet or monthly interest servicing models",
        "High credibility with verified P2P institutional lenders",
      ],
      suitableFor: "Textile mills, foundries, chemical processors, and auto-part fabricators",
    },
    {
      id: "seasonal-surge",
      icon: <FaChartLine className="purpose-vector-icon" />,
      title: "Seasonal Business Surge & Marketing",
      category: "Growth & Expansion",
      tag: "High ROI",
      tagColor: "emerald",
      rate: "13.0% p.a.",
      roiNumber: 13.0,
      maxAmount: "₹20 Lakhs",
      maxNumeric: 2000000,
      defaultAmount: 600000,
      tenure: "3 - 18 Months",
      defaultTenure: 9,
      desc: "Capitalize on seasonal spikes, wedding seasons, marketing blitzes, or launch campaigns.",
      highlights: [
        "Rapid 24-hour sanction to capture urgent sales windows",
        "Customized repayment terms synced to post-surge collections",
        "No long-term commitment or lock-in penalties",
        "Boost revenue without diluting company equity",
      ],
      suitableFor: "Event planners, seasonal gift businesses, apparel brands, and festive sellers",
    },
  ];

  const categories = [
    "All Purposes",
    "Working Capital",
    "Equipment & Machinery",
    "Growth & Expansion",
    "Operations",
  ];

  const filteredPurposes =
    activeCategory === "All Purposes"
      ? purposes
      : purposes.filter((p) => p.category === activeCategory);

  // Quick Action Modal handlers
  const handleOpenQuickModal = (purpose, defaultTab = "details") => {
    setSelectedPurpose(purpose);
    setModalTab(defaultTab);
    setModalAmount(purpose.defaultAmount || 800000);
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
    <div className="oxy-sme-loan-page">
      {/* 1. Modular Header */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Top Hero Banner */}
      <section className="oxy-sme-hero">
        <div className="oxy-sme-hero-inner">
          <div className="oxy-sme-badge-top">
            <FaIndustry className="badge-icon" />
            <span>P2P SME &amp; BUSINESS FINANCING</span>
          </div>
          <h1 className="oxy-sme-hero-title">SME Loans</h1>
          <p className="oxy-sme-hero-subhead">
            Fueling growth for India&apos;s small and medium enterprises. Quick working
            capital, machinery upgrades, and expansion funding without rigid bank
            formalities. Borrow directly from verified lenders at competitive interest rates.
          </p>
        </div>
      </section>

      {/* 3. User's Exact Specification Section: borrower-video-wrap */}
      <section className="borrower-video-wrap">
        <div className="container">
          <div className="borrower-head">
            <h2>SME loans</h2>
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
                  SME loans is given to small and medium business owners to meet
                  their current financial needs. It is usually taken by business
                  owners who are looking for quick and easy loans with manageable
                  interest rate and minimum documentation. You can use an SME
                  loan as per your business convenience.
                </p>
              </li>
              <li>
                <p>
                  OxyLoans.com brings borrowers and lenders to this platform,
                  where they are free to negotiate their terms and condition
                  within a few preset parameters to keep transaction values under
                  control.
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
                  It starts from 12 % Per Year, i.e. 1% per month, to a
                  restricted maximum of 3% per month and 36% Per Year.
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
          <div className="row clearfix sme-video-docs-row">
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
                  <strong>Documentation required for SME Loans</strong>
                </p>
                <ul className="docs-list">
                  <li>Aadhar Card &amp; PAN Card of Promoters</li>
                  <li>Company / Firm Registration Proof (GST / MSME / Shop Act)</li>
                  <li>Latest 12 Months Current Account Bank Statements</li>
                  <li>Latest 2 Years Audited Financial Statements &amp; ITR</li>
                  <li>Recent 2 Passport Size Photos</li>
                  <li>Business Premises Ownership / Rental Agreement</li>
                </ul>

                <div className="sme-apply-actions">
                  <Link to="/borrower_register" className="btn-sme-apply">
                    Apply for SME Loan <FaArrowRight />
                  </Link>
                  <Link to="/register" className="btn-sme-lend">
                    Fund SME Loans
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive SME Loan EMI Calculator */}
      <section className="oxy-sme-calc-section">
        <div className="container">
          <div className="sme-calc-card">
            <div className="calc-header-title">
              <FaCalculator className="calc-title-icon" />
              <div>
                <h3>SME Loan EMI Calculator</h3>
                <p>
                  Estimate monthly installments &amp; interest charges for your enterprise
                </p>
              </div>
            </div>

            <div className="calc-layout-grid">
              <div className="calc-controls">
                <div className="calc-field">
                  <div className="field-label-row">
                    <span>Business Loan Amount:</span>
                    <strong>₹{formatINR(loanAmount)}</strong>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="5000000"
                    step="50000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="calc-range-slider"
                  />
                  <div className="slider-limits">
                    <span>₹50,000</span>
                    <span>₹25 Lakhs</span>
                    <span>₹50 Lakhs</span>
                  </div>
                </div>

                <div className="calc-field">
                  <div className="field-label-row">
                    <span>Tenure (Months):</span>
                    <strong>{tenure} Months</strong>
                  </div>
                  <div className="tenure-chips-row">
                    {[6, 12, 18, 24, 36, 48].map((t) => (
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
                  Proceed with Loan Application <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Multipurpose SME Business Loan Tiles with Quick Action Buttons & Interactive Modal */}
      <section className="why-borrow-wrap">
        <div className="container">
          <h2>SME Loans Can Be Used For Many Business Purposes</h2>
          <div className="oxy-title-divider-wrap">
            <img
              src={oxyTitleDivider}
              alt="Divider"
              className="oxy-title-divider-img"
            />
          </div>
          <p className="why-borrow-intro-text">
            Empower your enterprise with flexible financing tailored to commercial growth.
            Compare interest rates, explore borrowing limits, and use quick action buttons to explore details or simulate EMIs instantly.
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
                    {p.icon}
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

                {/* Quick Action Buttons */}
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
                  {selectedPurpose.icon}
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
                    P2P business financing with negotiated rates and transparent terms
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
                <span className="ribbon-label">Benchmark ROI</span>
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
                <strong className="ribbon-val text-success-accent">Within 24-48 Hours</strong>
              </div>
            </div>

            {/* Modal Tab Switcher */}
            <div className="modal-tab-bar">
              <button
                type="button"
                className={`modal-tab-btn ${modalTab === "details" ? "active" : ""}`}
                onClick={() => setModalTab("details")}
              >
                <FaInfoCircle /> Business Overview &amp; Perks
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
                        <strong>Ideal Enterprise Profile:</strong>
                        <p>{selectedPurpose.suitableFor}</p>
                      </div>
                    </div>

                    <div className="details-col">
                      <h4 className="details-section-title">
                        <FaFileInvoiceDollar className="title-icon" /> Documents Required
                      </h4>
                      <div className="doc-pills-wrap">
                        <span className="doc-pill">GST Returns (Last 6 Months)</span>
                        <span className="doc-pill">12 Months Current Account Statement</span>
                        <span className="doc-pill">Promoter PAN &amp; Aadhaar</span>
                        <span className="doc-pill">Business Registration / MSME Proof</span>
                        <span className="doc-pill">Latest 2 Years ITR &amp; Computation</span>
                      </div>

                      <div className="feature-info-card">
                        <h5>P2P SME Financing Highlights</h5>
                        <ul className="feature-sub-list">
                          <li>Direct negotiation between lenders &amp; enterprises</li>
                          <li>Zero hidden origination overheads or surprise covenants</li>
                          <li>Transparent schedule of charges &amp; quick digital sanction</li>
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
                          <span>Required Capital:</span>
                          <strong>₹{formatINR(modalAmount)}</strong>
                        </div>
                        <input
                          type="range"
                          min="100000"
                          max={selectedPurpose.maxNumeric || 5000000}
                          step="50000"
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

export default SMELoan;
