import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPlane,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
  FaCalculator,
  FaPercent,
  FaMoneyBillWave,
  FaUserCheck,
  FaPlaneDeparture,
  FaUmbrellaBeach,
  FaGraduationCap,
  FaHeart,
  FaSun,
  FaShip,
  FaPassport,
  FaSuitcaseRolling,
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

import "./TravelLoan.css";

const TravelLoan = () => {
  // Quick travel loan calculator
  const [loanAmount, setLoanAmount] = useState(100000); // Up to 2 Lakhs
  const [tenure, setTenure] = useState(12); // months
  const [monthlyRoi, setMonthlyRoi] = useState(1.5); // 1% to 4% per month

  // Category filter state for multipurpose travel loan tiles
  const [activeCategory, setActiveCategory] = useState("All Travel Needs");

  // Quick Action Modal State (Informational / Simulator modal)
  const [selectedPurpose, setSelectedPurpose] = useState(null);
  const [modalTab, setModalTab] = useState("details"); // "details" | "calculator"
  const [modalAmount, setModalAmount] = useState(150000);
  const [modalTenure, setModalTenure] = useState(12);

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

  // Monthly interest & EMI for calculator section
  const monthlyInterest = loanAmount * (monthlyRoi / 100);
  const totalInterest = monthlyInterest * tenure;
  const emiAmount = (loanAmount + totalInterest) / tenure;

  // Domain-Specific Travel & Vacation Loan Purposes
  const purposes = [
    {
      id: "international-vacations",
      icon: <FaPlaneDeparture className="purpose-vector-icon" />,
      title: "International Vacations & Tour Packages",
      category: "International",
      tag: "Popular Choice",
      tagColor: "blue",
      rate: "12.0% p.a.",
      roiNumber: 12.0,
      maxAmount: "₹5 Lakhs",
      maxNumeric: 500000,
      defaultAmount: 200000,
      tenure: "6 - 24 Months",
      defaultTenure: 12,
      desc: "Explore Europe, Dubai, Southeast Asia, or the USA with hassle-free flight, visa, and hotel financing.",
      highlights: [
        "Covers flight tickets, hotel stays, visa fees, and currency forex",
        "Disbursal within 24 hours directly into your bank account",
        "Convenient monthly repayments starting after you return",
        "Zero foreign exchange markup penalty on card transactions",
      ],
      suitableFor: "Solo travelers, couples, and families planning foreign leisure holidays",
    },
    {
      id: "domestic-tours",
      icon: <FaUmbrellaBeach className="purpose-vector-icon" />,
      title: "Domestic Family Tours & Luxury Resorts",
      category: "Domestic & Holidays",
      tag: "Weekend Getaway",
      tagColor: "emerald",
      rate: "11.0% p.a.",
      roiNumber: 11.0,
      maxAmount: "₹2 Lakhs",
      maxNumeric: 200000,
      defaultAmount: 80000,
      tenure: "3 - 18 Months",
      defaultTenure: 12,
      desc: "Relax in Goa, Kerala, Himachal, or Kashmir with family package stays and zero upfront burden.",
      highlights: [
        "100% paperless instant sanction with digital Aadhaar eKYC",
        "Pocket-friendly monthly EMIs starting from just ₹2,500/month",
        "Partner discounts with leading travel portals & luxury resorts",
        "No foreclosure fees if closed ahead of schedule",
      ],
      suitableFor: "Families, professionals, and groups planning holiday breaks across India",
    },
    {
      id: "study-abroad",
      icon: <FaGraduationCap className="purpose-vector-icon" />,
      title: "Higher Education & Study Abroad Travel",
      category: "International",
      tag: "Student Career",
      tagColor: "purple",
      rate: "10.5% p.a.",
      roiNumber: 10.5,
      maxAmount: "₹5 Lakhs",
      maxNumeric: 500000,
      defaultAmount: 250000,
      tenure: "12 - 36 Months",
      defaultTenure: 24,
      desc: "Finance student flights, initial campus relocation, hostel deposits, and orientation travel expenses.",
      highlights: [
        "Special concession on interest rates for certified students",
        "Co-borrower option with parents or working guardians",
        "Funds relocation baggage, initial living stipend & health cover",
        "Fast approvals matching university intake & visa deadlines",
      ],
      suitableFor: "Students and parents relocating for international university admissions",
    },
    {
      id: "honeymoon",
      icon: <FaHeart className="purpose-vector-icon" />,
      title: "Destination Weddings & Honeymoon Trips",
      category: "Special Occasions",
      tag: "Romance & Luxury",
      tagColor: "rose",
      rate: "11.5% p.a.",
      roiNumber: 11.5,
      maxAmount: "₹4 Lakhs",
      maxNumeric: 400000,
      defaultAmount: 180000,
      tenure: "6 - 24 Months",
      defaultTenure: 12,
      desc: "Celebrate your special milestone in Maldives, Bali, Switzerland, or Udaipur with luxury experiences.",
      highlights: [
        "Covers private villas, candle-light packages, and domestic flights",
        "Transparent P2P interest rates with no surprise fine-print",
        "Direct bank credit so you book reservations on your own terms",
        "Flexible tenure to ensure EMIs fit newlyweds' budget",
      ],
      suitableFor: "Couples and newlyweds planning romantic getaways and wedding tours",
    },
    {
      id: "pilgrimage",
      icon: <FaSun className="purpose-vector-icon" />,
      title: "Pilgrimage & Spiritual Journeys",
      category: "Domestic & Holidays",
      tag: "Spiritual Peace",
      tagColor: "amber",
      rate: "10.0% p.a.",
      roiNumber: 10.0,
      maxAmount: "₹2 Lakhs",
      maxNumeric: 200000,
      defaultAmount: 75000,
      tenure: "6 - 24 Months",
      defaultTenure: 12,
      desc: "Fulfill sacred pilgrimages to Char Dham, Kashi, Varanasi, Tirupati, or Haj with comfort for senior family members.",
      highlights: [
        "Senior-friendly funding for helicopter transit & VIP darshan",
        "Lowest interest margins for pilgrimage purposes",
        "Simple documentation with verified P2P community lenders",
        "Quick disbursal directly into your savings account",
      ],
      suitableFor: "Families sponsoring pilgrimage and holy yatras for elderly parents",
    },
    {
      id: "cruises-adventure",
      icon: <FaShip className="purpose-vector-icon" />,
      title: "Luxury Cruises & Himalayan Treks",
      category: "Cruises & Treks",
      tag: "Adventure Pick",
      tagColor: "teal",
      rate: "12.5% p.a.",
      roiNumber: 12.5,
      maxAmount: "₹3.5 Lakhs",
      maxNumeric: 350000,
      defaultAmount: 150000,
      tenure: "6 - 24 Months",
      defaultTenure: 12,
      desc: "Experience ocean liner cruises across Singapore or expedition treks in Ladakh and Nepal.",
      highlights: [
        "Covers cabin upgrades, expedition permits, and adventure gear",
        "Quick online approval with instant pre-qualification",
        "Fixed manageable EMIs with zero floating rate surprises",
        "No collateral or asset hypothecation required",
      ],
      suitableFor: "Adventure seekers, youth groups, and cruise vacationers",
    },
    {
      id: "advance-bookings",
      icon: <FaPassport className="purpose-vector-icon" />,
      title: "Flight Tickets & Advance Hotel Bookings",
      category: "Special Occasions",
      tag: "Early Bird",
      tagColor: "indigo",
      rate: "11.0% p.a.",
      roiNumber: 11.0,
      maxAmount: "₹1.5 Lakhs",
      maxNumeric: 150000,
      defaultAmount: 60000,
      tenure: "3 - 12 Months",
      defaultTenure: 6,
      desc: "Lock in early-bird airfare sales and festival season hotel suites months in advance at peak discounts.",
      highlights: [
        "Grab flash sales before airline ticket prices escalate",
        "Short repayment duration with low cumulative interest",
        "Same-day disbursal directly to your account",
        "High approval rate for salaried borrowers",
      ],
      suitableFor: "Frequent flyers, festive festival travelers, and smart holiday planners",
    },
    {
      id: "emergency-travel",
      icon: <FaSuitcaseRolling className="purpose-vector-icon" />,
      title: "Emergency & Family Medical Travel",
      category: "Special Occasions",
      tag: "Instant Support",
      tagColor: "emerald",
      rate: "12.0% p.a.",
      roiNumber: 12.0,
      maxAmount: "₹3 Lakhs",
      maxNumeric: 300000,
      defaultAmount: 100000,
      tenure: "3 - 18 Months",
      defaultTenure: 12,
      desc: "Immediate emergency funding for urgent inter-city or international medical visits and family crises.",
      highlights: [
        "Priority express processing within 2 hours",
        "Zero physical bank branch visits required",
        "Direct instant bank IMPS transfer upon P2P lender match",
        "Comfortable tenure so emergencies don't strain monthly cashflow",
      ],
      suitableFor: "Individuals facing urgent emergency travel for healthcare or family needs",
    },
  ];

  const categories = [
    "All Travel Needs",
    "International",
    "Domestic & Holidays",
    "Special Occasions",
    "Cruises & Treks",
  ];

  const filteredPurposes =
    activeCategory === "All Travel Needs"
      ? purposes
      : purposes.filter((p) => p.category === activeCategory);

  // Quick Action Modal handlers
  const handleOpenQuickModal = (purpose, defaultTab = "details") => {
    setSelectedPurpose(purpose);
    setModalTab(defaultTab);
    setModalAmount(purpose.defaultAmount || 150000);
    setModalTenure(purpose.defaultTenure || 12);
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
    <div className="oxy-travel-loan-page">
      {/* 1. Modular Header */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Top Hero Banner */}
      <section className="oxy-travel-hero">
        <div className="oxy-travel-hero-inner">
          <div className="oxy-travel-badge-top">
            <FaPlane className="badge-icon" />
            <span>P2P PERSONAL &amp; TRAVEL FINANCING</span>
          </div>
          <h1 className="oxy-travel-hero-title">Travel Loans</h1>
          <p className="oxy-travel-hero-subhead">
            Quick, paperless peer-to-peer travel loans up to INR 2 Lakhs. Fund your dream vacation,
            holiday trip, or family getaway with low monthly interest rates starting from 1% per month.
          </p>
        </div>
      </section>

      {/* 3. User's Exact Specification Section: borrower-video-wrap */}
      <section className="borrower-video-wrap">
        <div className="container">
          <div className="borrower-head">
            <h2>Travel loans</h2>
            <div className="oxy-title-divider-wrap">
              <img
                src={oxyTitleDivider}
                alt="Divider"
                className="oxy-title-divider-img"
              />
            </div>
          </div>

          {/* User's Exact bullet points */}
          <div className="borrower-list sme-list">
            <ul>
              <li>
                <p>
                  A travel loan is a personal loan taken by borrowers who are looking for quick and
                  easy loans with manageable interest rate and minimum documentation. You can use a
                  travel loan as per your holiday, vacation, or ticket booking convenience.
                </p>
              </li>
              <li>
                <p>
                  OxyLoans.com brings borrowers and lenders to this platform, where they are free
                  to negotiate their terms and condition within a few preset parameters to keep
                  transaction values under control.
                </p>
              </li>
              <li>
                <p>
                  Any India resident, with valid proof, can lend and borrow at OxyLoans.com.
                </p>
              </li>
              <li>
                <p>
                  Interest rates are purely dependent on the Lender and Borrower. It starts from
                  12 % Per Year, i.e. 1% per month, to a restricted maximum of 4% per month and 48% Per Year.
                </p>
              </li>
              <li>
                <p>
                  OxyLoans.com is giving both the lender and borrower a unique opportunity, where
                  the lender can put his money to his best use and the borrower can get the best
                  rate of interest on his loan.
                </p>
              </li>
            </ul>
          </div>

          {/* Video + Documentation Row */}
          <div className="row clearfix travel-video-docs-row">
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
                  <strong>Documentation required for Travel Loans</strong>
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

                <div className="travel-apply-actions">
                  <Link to="/borrower_register" className="btn-travel-apply">
                    Apply for Travel Loan <FaArrowRight />
                  </Link>
                  <Link to="/register" className="btn-travel-lend">
                    Fund Travel Loans
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Travel Loan EMI Calculator */}
      <section className="oxy-travel-calc-section">
        <div className="container">
          <div className="travel-calc-card">
            <div className="calc-header-title">
              <FaCalculator className="calc-title-icon" />
              <div>
                <h3>Travel Loan EMI Calculator</h3>
                <p>Calculate your easy monthly installments for holidays and travel</p>
              </div>
            </div>

            <div className="calc-layout-grid">
              <div className="calc-controls">
                <div className="calc-field">
                  <div className="field-label-row">
                    <span>Travel Loan Amount:</span>
                    <strong>₹{formatINR(loanAmount)}</strong>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="200000"
                    step="5000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    className="calc-range-slider"
                  />
                  <div className="slider-limits">
                    <span>₹10,000</span>
                    <span>₹1,00,000</span>
                    <span>₹2,00,000</span>
                  </div>
                </div>

                <div className="calc-field">
                  <div className="field-label-row">
                    <span>Tenure (Months):</span>
                    <strong>{tenure} Months</strong>
                  </div>
                  <div className="tenure-chips-row">
                    {[3, 6, 9, 12, 18, 24].map((t) => (
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
                    <span>Monthly Interest Rate:</span>
                    <strong>{monthlyRoi}% per month ({monthlyRoi * 12}% p.a.)</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.25"
                    value={monthlyRoi}
                    onChange={(e) => setMonthlyRoi(Number(e.target.value))}
                    className="calc-range-slider"
                  />
                  <div className="slider-limits">
                    <span>1% / mo</span>
                    <span>2.5% / mo</span>
                    <span>4% / mo</span>
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
                    <strong>₹{formatINR(loanAmount + totalInterest)}</strong>
                  </div>
                </div>

                <Link to="/borrower_register" className="btn-get-travel-loan">
                  Apply for Travel Loan <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Multipurpose Travel Loan Tiles with Quick Action Buttons & Interactive Modal */}
      <section className="why-borrow-wrap">
        <div className="container">
          <h2>Travel Loans Can Be Used For Many Travel Needs</h2>
          <div className="oxy-title-divider-wrap">
            <img
              src={oxyTitleDivider}
              alt="Divider"
              className="oxy-title-divider-img"
            />
          </div>
          <p className="why-borrow-intro-text">
            Fund your dream holiday, family vacation, or higher studies abroad without draining your savings.
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
                {cat === "All Travel Needs" && ` (${purposes.length})`}
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
                    Instant P2P travel financing with low monthly interest rates and zero hidden charges
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
                <FaInfoCircle /> Travel Overview &amp; Perks
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
                        <span className="doc-pill">Aadhaar Card (Instant eKYC)</span>
                        <span className="doc-pill">PAN Card</span>
                        <span className="doc-pill">Latest 3 Months Salary Slips</span>
                        <span className="doc-pill">6 Months Bank Statement</span>
                        <span className="doc-pill">Travel / Ticket Booking Itinerary</span>
                      </div>

                      <div className="feature-info-card">
                        <h5>P2P Travel Financing Highlights</h5>
                        <ul className="feature-sub-list">
                          <li>Direct negotiation with verified P2P lenders</li>
                          <li>100% digital, instant sanction without collateral</li>
                          <li>No early repayment penalty if settled post-vacation</li>
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
                          min="10000"
                          max={selectedPurpose.maxNumeric || 500000}
                          step="5000"
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
                          {[3, 6, 9, 12, 18, 24, 36].map((m) => (
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

export default TravelLoan;
