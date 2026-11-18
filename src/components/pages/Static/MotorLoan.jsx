import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaMotorcycle,
  FaCar,
  FaTruck,
  FaCheckCircle,
  FaFileAlt,
  FaCalculator,
  FaArrowRight,
  FaArrowLeft,
  FaChargingStation,
  FaCarSide,
  FaShippingFast,
  FaTruckMoving,
  FaExchangeAlt,
  FaEye,
  FaTimes,
  FaInfoCircle,
  FaCheck,
  FaPercentage,
  FaLock,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";
import oxyTitleDivider from "../../../assets/img/landing/oxy_title_divider.png";

import "./MotorLoan.css";

const MotorLoan = () => {
  // Motor Loan Calculator State
  const [loanAmount, setLoanAmount] = useState(250000);
  const [tenure, setTenure] = useState(24); // months
  const [annualRoi, setAnnualRoi] = useState(14); // 14% p.a.

  // Category filter state for multipurpose motor loan tiles
  const [activeCategory, setActiveCategory] = useState("All Vehicles");

  // Quick Action Modal State (Informational / Simulator modal)
  const [selectedPurpose, setSelectedPurpose] = useState(null);
  const [modalTab, setModalTab] = useState("details"); // "details" | "calculator"
  const [modalAmount, setModalAmount] = useState(300000);
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

  // Standard Reducing EMI calculation
  const monthlyRate = annualRoi / 12 / 100;
  const emiAmount =
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
    (Math.pow(1 + monthlyRate, tenure) - 1);
  const totalRepayment = emiAmount * tenure;
  const totalInterest = totalRepayment - loanAmount;

  // Domain-Specific Motor & Vehicle Loan Purposes
  const purposes = [
    {
      id: "two-wheeler",
      icon: <FaMotorcycle className="purpose-vector-icon" />,
      title: "New & Used Two Wheelers (Bikes & Scooters)",
      category: "Two Wheelers",
      tag: "Fast Track",
      tagColor: "blue",
      rate: "11.5% p.a.",
      roiNumber: 11.5,
      maxAmount: "₹2.5 Lakhs",
      maxNumeric: 250000,
      defaultAmount: 120000,
      tenure: "6 - 36 Months",
      defaultTenure: 24,
      desc: "Finance commuter motorcycles, sports bikes, and automatic scooters with up to 95% on-road funding.",
      highlights: [
        "Up to 95% on-road financing covering insurance & RTO charges",
        "Approval within 2 hours with minimal KYC documentation",
        "Flexible tenures from 6 up to 36 months",
        "Direct invoice settlement with authorized bike dealers",
      ],
      suitableFor: "Salaried employees, students with co-borrowers, and daily city commuters",
    },
    {
      id: "four-wheeler",
      icon: <FaCar className="purpose-vector-icon" />,
      title: "Personal Four Wheelers (Hatchback, Sedan, SUV)",
      category: "Four Wheelers",
      tag: "Most Popular",
      tagColor: "emerald",
      rate: "9.5% p.a.",
      roiNumber: 9.5,
      maxAmount: "₹25 Lakhs",
      maxNumeric: 2500000,
      defaultAmount: 800000,
      tenure: "12 - 84 Months",
      defaultTenure: 48,
      desc: "Purchase your family car with low interest rates, minimal paperwork, and zero hidden dealership margins.",
      highlights: [
        "Competitive P2P interest starting from 9.5% per annum",
        "Financing for all leading car brands across India",
        "Digital paperwork with e-KYC and doorstep assistance",
        "Zero prepayment penalty after initial 6 months",
      ],
      suitableFor: "Families, salaried professionals, and business executives buying passenger cars",
    },
    {
      id: "commercial-vehicles",
      icon: <FaTruck className="purpose-vector-icon" />,
      title: "Commercial Transport Vehicles (Tempo, Vans, Autos)",
      category: "Commercial & Cargo",
      tag: "Income Driver",
      tagColor: "amber",
      rate: "12.0% p.a.",
      roiNumber: 12.0,
      maxAmount: "₹15 Lakhs",
      maxNumeric: 1500000,
      defaultAmount: 600000,
      tenure: "12 - 48 Months",
      defaultTenure: 36,
      desc: "Own small commercial vehicles, passenger autos, and delivery vans to boost your transport income.",
      highlights: [
        "Structured EMIs aligned with monthly commercial earnings",
        "Covers chassis, body fabrication, and permit expenses",
        "Fast disbursal directly to vehicle dealership",
        "Co-borrower and guarantor options for easy approval",
      ],
      suitableFor: "Transport operators, local logistics providers, and self-employed drivers",
    },
    {
      id: "electric-vehicles",
      icon: <FaChargingStation className="purpose-vector-icon" />,
      title: "Electric Vehicles (EV Bikes, Scooters & Cars)",
      category: "Electric (EV)",
      tag: "Green Drive",
      tagColor: "teal",
      rate: "10.0% p.a.",
      roiNumber: 10.0,
      maxAmount: "₹20 Lakhs",
      maxNumeric: 2000000,
      defaultAmount: 400000,
      tenure: "12 - 60 Months",
      defaultTenure: 36,
      desc: "Adopt eco-friendly mobility with subsidized interest rates for electric two-wheelers and four-wheelers.",
      highlights: [
        "Special green loan concessions on interest rates",
        "Financing for battery packs and certified fast chargers",
        "Eligible for government EV subsidies and tax exemptions",
        "Rapid online approval with paperless documentation",
      ],
      suitableFor: "Eco-conscious urban commuters, delivery fleets, and modern riders",
    },
    {
      id: "used-car",
      icon: <FaCarSide className="purpose-vector-icon" />,
      title: "Certified Pre-Owned & Used Car Financing",
      category: "Four Wheelers",
      tag: "Value Deal",
      tagColor: "purple",
      rate: "11.0% p.a.",
      roiNumber: 11.0,
      maxAmount: "₹15 Lakhs",
      maxNumeric: 1500000,
      defaultAmount: 500000,
      tenure: "12 - 60 Months",
      defaultTenure: 36,
      desc: "Buy quality second-hand cars with valuation assistance, clear title checks, and quick loan sanction.",
      highlights: [
        "Loan up to 85% of certified car valuation",
        "Free RTO ownership transfer guidance and verification",
        "Financing for cars up to 10 years old",
        "Low processing fees with zero hidden inspection costs",
      ],
      suitableFor: "First-time car buyers, budget-conscious drivers, and second-vehicle owners",
    },
    {
      id: "fleet-expansion",
      icon: <FaShippingFast className="purpose-vector-icon" />,
      title: "Fleet Expansion for Logistics & Deliveries",
      category: "Commercial & Cargo",
      tag: "Business Scale",
      tagColor: "indigo",
      rate: "12.5% p.a.",
      roiNumber: 12.5,
      maxAmount: "₹50 Lakhs",
      maxNumeric: 5000000,
      defaultAmount: 2000000,
      tenure: "12 - 60 Months",
      defaultTenure: 48,
      desc: "Scale your courier, grocery, or freight delivery business with multiple vehicle purchases simultaneously.",
      highlights: [
        "Single umbrella loan limit for multiple vehicle units",
        "Attractive ROI concessions on pooled fleet financing",
        "GST and income-tax depreciation write-off eligibility",
        "Dedicated P2P account manager for logistics partners",
      ],
      suitableFor: "Logistics enterprises, courier aggregators, and fleet contractors",
    },
    {
      id: "heavy-transport",
      icon: <FaTruckMoving className="purpose-vector-icon" />,
      title: "Heavy Goods Transport & Commercial Trucks",
      category: "Commercial & Cargo",
      tag: "Heavy Duty",
      tagColor: "rose",
      rate: "13.0% p.a.",
      roiNumber: 13.0,
      maxAmount: "₹40 Lakhs",
      maxNumeric: 4000000,
      defaultAmount: 1800000,
      tenure: "12 - 60 Months",
      defaultTenure: 48,
      desc: "Financing for multi-axle trucks, tippers, trailers, and cargo containers for inter-state transit.",
      highlights: [
        "Institutional and HNI lender backing for large tickets",
        "Body building and national permit financing included",
        "Flexible moratorium periods on initial transit runs",
        "Fast document verification tailored to transport firms",
      ],
      suitableFor: "National permit carriers, construction contractors, and haulage firms",
    },
    {
      id: "refinancing",
      icon: <FaExchangeAlt className="purpose-vector-icon" />,
      title: "Vehicle Loan Refinancing & Balance Transfer",
      category: "Four Wheelers",
      tag: "Save On EMI",
      tagColor: "emerald",
      rate: "10.5% p.a.",
      roiNumber: 10.5,
      maxAmount: "₹20 Lakhs",
      maxNumeric: 2000000,
      defaultAmount: 600000,
      tenure: "12 - 60 Months",
      defaultTenure: 36,
      desc: "Switch your existing high-cost vehicle loan to OxyLoans for lower monthly EMIs and extra cash top-up.",
      highlights: [
        "Reduce monthly interest payments significantly",
        "Instant additional cash top-up limit up to 150% of car value",
        "Hassle-free digital NOC and hypothecation transfer",
        "Simple online statement verification with no bank queues",
      ],
      suitableFor: "Existing car owners seeking liquidity or lower interest burden",
    },
  ];

  const categories = [
    "All Vehicles",
    "Two Wheelers",
    "Four Wheelers",
    "Commercial & Cargo",
    "Electric (EV)",
  ];

  const filteredPurposes =
    activeCategory === "All Vehicles"
      ? purposes
      : purposes.filter((p) => p.category === activeCategory);

  // Quick Action Modal handlers
  const handleOpenQuickModal = (purpose, defaultTab = "details") => {
    setSelectedPurpose(purpose);
    setModalTab(defaultTab);
    setModalAmount(purpose.defaultAmount || 300000);
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
    <div className="oxy-motor-loan-page">
      {/* 1. Modular Header */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Top Hero Banner */}
      <section className="oxy-motor-hero">
        <div className="oxy-motor-hero-inner">
          <div className="oxy-motor-badge-top">
            <FaCar className="badge-icon" />
            <span>P2P VEHICLE &amp; MOTOR LOAN FINANCING</span>
          </div>
          <h1 className="oxy-motor-hero-title">Motor Loans</h1>
          <p className="oxy-motor-hero-subhead">
            Fulfill your dream of owning a Two Wheeler, Four Wheeler, or Commercial Vehicle.
            Peer-to-peer vehicle loans directly connecting you with verified lenders at competitive interest rates.
          </p>
        </div>
      </section>

      {/* 3. User's Exact Specification Section: borrower-video-wrap */}
      <section className="borrower-video-wrap">
        <div className="container">
          <div className="borrower-head">
            <h2>Motor loans</h2>
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
                  Everyone wants comfort and ease in their life. Getting from place to place in the busy city via public transport is very difficult.
                </p>
              </li>
              <li>
                <p>
                  OxyLoans.com gives its community an opportunity where they can fulfill their dream of owning a vehicle of their own.
                </p>
              </li>
              <li>
                <p>
                  OxyLoans.com brings lenders and borrowers together via this platform.
                </p>
              </li>
              <li>
                <p>
                  The borrower can request for a loan for purchasing a Two Wheeler, Three Wheeler, Four Wheeler and any other large commercial vehicles.
                </p>
              </li>
              <li>
                <p>
                  The terms and conditions of the loans i.e. loan amount, rate of interest and term of loan is decided between the borrower and lender directly within a few parameters which are set by OxyLoans.com
                </p>
              </li>
            </ul>
          </div>

          {/* Video + Documentation Row */}
          <div className="row clearfix motor-video-docs-row">
            <div className="col-6 fright video-col">
              <div className="video-player-card">
                <video controls preload="metadata">
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
                  <strong>Documentation required for Motor Loans</strong>
                </p>
                <ul className="docs-list">
                  <li>Aadhar Card</li>
                  <li>Pan Card</li>
                  <li>2 Photos</li>
                  <li>Latest 3 PaySlips</li>
                  <li>Latest 6 Months Bank Statements</li>
                  <li>Employee ID Card</li>
                  <li>Current Address (rental agreement, electricity bill)</li>
                  <li>Show Room Invoice Copy</li>
                </ul>

                <div className="motor-apply-actions">
                  <Link to="/borrower_register" className="btn-motor-apply">
                    Apply for Motor Loan <FaArrowRight />
                  </Link>
                  <Link to="/register" className="btn-motor-lend">
                    Fund Motor Loans
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Motor Loan EMI Calculator */}
      <section className="oxy-motor-calc-section">
        <div className="container">
          <div className="motor-calc-card">
            <div className="calc-header-title">
              <FaCalculator className="calc-title-icon" />
              <div>
                <h3>Motor Loan EMI Calculator</h3>
                <p>Plan your vehicle finance with transparent monthly installment estimates</p>
              </div>
            </div>

            <div className="calc-layout-grid">
              <div className="calc-controls">
                <div className="calc-field">
                  <div className="field-label-row">
                    <span>Vehicle Loan Amount:</span>
                    <strong>₹{formatINR(loanAmount)}</strong>
                  </div>
                  <input
                    type="range"
                    min="30000"
                    max="2000000"
                    step="10000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="calc-range-slider"
                  />
                  <div className="slider-limits">
                    <span>₹30,000</span>
                    <span>₹10 Lakhs</span>
                    <span>₹20 Lakhs</span>
                  </div>
                </div>

                <div className="calc-field">
                  <div className="field-label-row">
                    <span>Tenure (Months):</span>
                    <strong>{tenure} Months</strong>
                  </div>
                  <div className="tenure-chips-row">
                    {[6, 12, 18, 24, 36, 48, 60].map((t) => (
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
                    min="9"
                    max="24"
                    step="0.5"
                    value={annualRoi}
                    onChange={(e) => setAnnualRoi(Number(e.target.value))}
                    className="calc-range-slider"
                  />
                  <div className="slider-limits">
                    <span>9% p.a.</span>
                    <span>16% p.a.</span>
                    <span>24% p.a.</span>
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
                  Apply for Vehicle Loan <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Multipurpose Motor Loan Tiles with Quick Action Buttons & Interactive Modal */}
      <section className="why-borrow-wrap">
        <div className="container">
          <h2>Motor Loans Can Be Used For Many Vehicle Categories</h2>
          <div className="oxy-title-divider-wrap">
            <img
              src={oxyTitleDivider}
              alt="Divider"
              className="oxy-title-divider-img"
            />
          </div>
          <p className="why-borrow-intro-text">
            Fulfill your dream of owning a Two Wheeler, Four Wheeler, or Commercial Vehicle.
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
                {cat === "All Vehicles" && ` (${purposes.length})`}
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
                    Direct P2P vehicle financing with negotiated rates and zero middleman margins
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
                <FaInfoCircle /> Vehicle Overview &amp; Perks
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
                        <span className="doc-pill">Aadhaar Card &amp; PAN Card</span>
                        <span className="doc-pill">Valid Driving License</span>
                        <span className="doc-pill">Latest 3 Months Salary Slips / ITR</span>
                        <span className="doc-pill">6 Months Bank Statement</span>
                        <span className="doc-pill">Vehicle Proforma / Quotation</span>
                      </div>

                      <div className="feature-info-card">
                        <h5>P2P Motor Financing Highlights</h5>
                        <ul className="feature-sub-list">
                          <li>Direct negotiation between lenders &amp; borrowers</li>
                          <li>Zero hidden dealership commissions or markups</li>
                          <li>Transparent hypothecation &amp; quick digital NOC</li>
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
                          min="30000"
                          max={selectedPurpose.maxNumeric || 2500000}
                          step="10000"
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
                          {[6, 12, 18, 24, 36, 48, 60, 84].map((m) => (
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

export default MotorLoan;
