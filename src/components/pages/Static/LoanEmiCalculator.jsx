import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FaCalculator,
  FaRupeeSign,
  FaCalendarAlt,
  FaPercentage,
  FaChartPie,
  FaListAlt,
  FaArrowRight,
  FaShieldAlt,
  FaHandHoldingUsd,
  FaHandshake,
  FaCheckCircle,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
  FaDownload,
  FaPrint,
} from "react-icons/fa";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";
import "./LoanEmiCalculator.css";

const formatINR = (val) => {
  if (isNaN(val) || val === null || val === undefined) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(val));
};

const LoanEmiCalculator = () => {
  // Calculator inputs
  const [loanAmount, setLoanAmount] = useState(300000);
  const [interestRate, setInterestRate] = useState(15);
  const [tenureMonths, setTenureMonths] = useState(24);
  const [tenureUnit, setTenureUnit] = useState("months"); // "months" | "years"
  const [calculationMethod, setCalculationMethod] = useState("reducing"); // "reducing" | "flat"

  // Table pagination/view state
  const [viewMode, setViewMode] = useState("monthly"); // "monthly" | "yearly"
  const [tableExpanded, setTableExpanded] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Quick preset handlers
  const amountPresets = [
    { label: "₹50K", value: 50000 },
    { label: "₹1L", value: 100000 },
    { label: "₹3L", value: 300000 },
    { label: "₹5L", value: 500000 },
    { label: "₹10L", value: 1000000 },
    { label: "₹25L", value: 2500000 },
  ];

  const ratePresets = [12, 14, 15, 18, 21, 24, 30];
  const tenurePresets = [6, 12, 18, 24, 36, 48, 60];

  // Core calculations
  const calculationResults = useMemo(() => {
    const P = Number(loanAmount) || 0;
    const annualRate = Number(interestRate) || 0;
    const n = Math.max(1, Number(tenureMonths) || 1);

    if (P <= 0) {
      return {
        monthlyEmi: 0,
        totalInterest: 0,
        totalPayable: 0,
        principalPercent: 100,
        interestPercent: 0,
        schedule: [],
        yearlySchedule: [],
      };
    }

    let monthlyEmi = 0;
    let totalInterest = 0;
    let totalPayable = 0;
    const schedule = [];

    if (calculationMethod === "reducing") {
      const r = annualRate / (12 * 100);
      if (r === 0) {
        monthlyEmi = P / n;
        totalInterest = 0;
        totalPayable = P;
      } else {
        const factor = Math.pow(1 + r, n);
        monthlyEmi = (P * r * factor) / (factor - 1);
        totalPayable = monthlyEmi * n;
        totalInterest = totalPayable - P;
      }

      let currentBalance = P;
      for (let m = 1; m <= n; m++) {
        const openingBalance = currentBalance;
        let interestPayment = openingBalance * (annualRate / (12 * 100));
        let principalPayment = monthlyEmi - interestPayment;

        if (m === n || principalPayment > currentBalance) {
          principalPayment = currentBalance;
          interestPayment = Math.max(0, monthlyEmi - principalPayment);
        }

        const closingBalance = Math.max(0, currentBalance - principalPayment);
        currentBalance = closingBalance;

        schedule.push({
          month: m,
          openingBalance,
          emi: principalPayment + interestPayment,
          principal: principalPayment,
          interest: interestPayment,
          closingBalance,
        });
      }
    } else {
      // Flat Rate Method
      totalInterest = (P * annualRate * (n / 12)) / 100;
      totalPayable = P + totalInterest;
      monthlyEmi = totalPayable / n;
      const monthlyPrincipal = P / n;
      const monthlyInterest = totalInterest / n;

      let currentBalance = P;
      for (let m = 1; m <= n; m++) {
        const openingBalance = currentBalance;
        const principalPayment = Math.min(monthlyPrincipal, currentBalance);
        const closingBalance = Math.max(0, currentBalance - principalPayment);
        currentBalance = closingBalance;

        schedule.push({
          month: m,
          openingBalance,
          emi: monthlyEmi,
          principal: principalPayment,
          interest: monthlyInterest,
          closingBalance,
        });
      }
    }

    // Yearly Aggregation
    const yearlyMap = {};
    schedule.forEach((row) => {
      const year = Math.ceil(row.month / 12);
      if (!yearlyMap[year]) {
        yearlyMap[year] = {
          year,
          openingBalance: row.openingBalance,
          totalEmi: 0,
          totalPrincipal: 0,
          totalInterest: 0,
          closingBalance: 0,
        };
      }
      yearlyMap[year].totalEmi += row.emi;
      yearlyMap[year].totalPrincipal += row.principal;
      yearlyMap[year].totalInterest += row.interest;
      yearlyMap[year].closingBalance = row.closingBalance;
    });

    const yearlySchedule = Object.values(yearlyMap);
    const principalPercent = totalPayable > 0 ? (P / totalPayable) * 100 : 100;
    const interestPercent = 100 - principalPercent;

    return {
      monthlyEmi,
      totalInterest,
      totalPayable,
      principalPercent,
      interestPercent,
      schedule,
      yearlySchedule,
    };
  }, [loanAmount, interestRate, tenureMonths, calculationMethod]);

  const handleTenureChange = (val, unit = tenureUnit) => {
    let num = Number(val) || 1;
    if (unit === "years") {
      setTenureMonths(num * 12);
    } else {
      setTenureMonths(num);
    }
  };

  const currentTenureDisplay =
    tenureUnit === "years"
      ? (tenureMonths / 12).toFixed(1).replace(".0", "")
      : tenureMonths;

  // SVG Donut calculation
  const donutRadius = 75;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const principalStroke =
    (calculationResults.principalPercent / 100) * donutCircumference;
  const interestStroke =
    (calculationResults.interestPercent / 100) * donutCircumference;

  return (
    <div className="oxy-emi-calc-page">
      {/* 1. Header (Standalone variant with landing branding) */}
      <LandingHeader standalone={true} />

      {/* 2. Hero Section */}
      <section className="oxy-emi-hero">
        <div className="oxy-emi-hero-container">
          <div className="oxy-emi-hero-badge">
            <FaCalculator className="hero-badge-icon" />
            <span>OXYLOANS FINANCIAL TOOLKIT</span>
          </div>
          <h1 className="oxy-emi-hero-title">Loan EMI Calculator</h1>
          <p className="oxy-emi-hero-desc">
            Calculate your exact monthly installments, interest breakdown, and complete repayment
            amortization schedule. Plan personal, business, SME, or motor loans with complete transparency.
          </p>

          <div className="oxy-emi-hero-highlights">
            <div className="highlight-pill">
              <FaCheckCircle className="check-icon" />
              <span>100% Free &amp; Instant</span>
            </div>
            <div className="highlight-pill">
              <FaCheckCircle className="check-icon" />
              <span>Reducing Balance &amp; Flat Rate</span>
            </div>
            <div className="highlight-pill">
              <FaCheckCircle className="check-icon" />
              <span>Complete Amortization Table</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Calculator Interactive Workspace */}
      <main className="oxy-emi-workspace-wrap">
        <div className="oxy-emi-workspace-container">
          <div className="oxy-emi-grid">
            {/* Left Card: Interactive Controls */}
            <div className="oxy-emi-card controls-card">
              <div className="card-header-bar">
                <div className="header-title-wrap">
                  <h2 className="calc-card-title">Customize Your Loan</h2>
                  <p className="calc-card-subtitle">
                    Adjust the sliders or type in your required amounts
                  </p>
                </div>

                {/* Method Switcher */}
                <div className="method-switcher">
                  <button
                    type="button"
                    className={`method-btn ${
                      calculationMethod === "reducing" ? "active" : ""
                    }`}
                    onClick={() => setCalculationMethod("reducing")}
                  >
                    Reducing Balance
                  </button>
                  <button
                    type="button"
                    className={`method-btn ${
                      calculationMethod === "flat" ? "active" : ""
                    }`}
                    onClick={() => setCalculationMethod("flat")}
                  >
                    Flat Rate
                  </button>
                </div>
              </div>

              {/* Control 1: Loan Amount */}
              <div className="control-group">
                <div className="control-label-row">
                  <label htmlFor="emi-loan-amount" className="control-label">
                    <FaRupeeSign className="ctrl-icon" /> Loan Amount
                  </label>
                  <div className="control-input-wrap currency">
                    <span className="input-prefix">₹</span>
                    <input
                      id="emi-loan-amount"
                      type="number"
                      min="10000"
                      max="10000000"
                      step="5000"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value) || 0)}
                      className="control-number-input"
                    />
                  </div>
                </div>

                <input
                  type="range"
                  min="10000"
                  max="5000000"
                  step="5000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="oxy-range-slider"
                  aria-label="Loan Amount Slider"
                />

                <div className="control-minmax-row">
                  <span>₹10,000</span>
                  <span className="val-display">{formatINR(loanAmount)}</span>
                  <span>₹50,00,000</span>
                </div>

                <div className="presets-row">
                  {amountPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      className={`preset-chip ${loanAmount === preset.value ? "active" : ""}`}
                      onClick={() => setLoanAmount(preset.value)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Control 2: Interest Rate (% p.a.) */}
              <div className="control-group">
                <div className="control-label-row">
                  <label htmlFor="emi-interest-rate" className="control-label">
                    <FaPercentage className="ctrl-icon" /> Interest Rate (per annum)
                  </label>
                  <div className="control-input-wrap percentage">
                    <input
                      id="emi-interest-rate"
                      type="number"
                      min="6"
                      max="36"
                      step="0.25"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
                      className="control-number-input"
                    />
                    <span className="input-suffix">%</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="6"
                  max="36"
                  step="0.25"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="oxy-range-slider roi"
                  aria-label="Interest Rate Slider"
                />

                <div className="control-minmax-row">
                  <span>6% p.a.</span>
                  <span className="val-display roi-color">{interestRate}% p.a.</span>
                  <span>36% p.a.</span>
                </div>

                <div className="presets-row">
                  {ratePresets.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`preset-chip ${interestRate === r ? "active" : ""}`}
                      onClick={() => setInterestRate(r)}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Control 3: Loan Tenure */}
              <div className="control-group">
                <div className="control-label-row">
                  <label htmlFor="emi-tenure" className="control-label">
                    <FaCalendarAlt className="ctrl-icon" /> Loan Tenure
                  </label>
                  <div className="tenure-unit-toggle">
                    <button
                      type="button"
                      className={`unit-btn ${tenureUnit === "months" ? "active" : ""}`}
                      onClick={() => setTenureUnit("months")}
                    >
                      Months
                    </button>
                    <button
                      type="button"
                      className={`unit-btn ${tenureUnit === "years" ? "active" : ""}`}
                      onClick={() => setTenureUnit("years")}
                    >
                      Years
                    </button>
                  </div>
                  <div className="control-input-wrap tenure">
                    <input
                      id="emi-tenure"
                      type="number"
                      min={tenureUnit === "years" ? 1 : 3}
                      max={tenureUnit === "years" ? 5 : 60}
                      step={tenureUnit === "years" ? 0.5 : 1}
                      value={currentTenureDisplay}
                      onChange={(e) => handleTenureChange(e.target.value)}
                      className="control-number-input"
                    />
                    <span className="input-suffix">
                      {tenureUnit === "years" ? "Yrs" : "Mo"}
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min="3"
                  max="60"
                  step="1"
                  value={tenureMonths}
                  onChange={(e) => handleTenureChange(e.target.value, "months")}
                  className="oxy-range-slider tenure"
                  aria-label="Tenure Slider"
                />

                <div className="control-minmax-row">
                  <span>3 Months</span>
                  <span className="val-display">
                    {tenureMonths} Months ({Math.floor(tenureMonths / 12)}Y{" "}
                    {tenureMonths % 12}M)
                  </span>
                  <span>60 Months (5Y)</span>
                </div>

                <div className="presets-row">
                  {tenurePresets.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`preset-chip ${tenureMonths === t ? "active" : ""}`}
                      onClick={() => handleTenureChange(t, "months")}
                    >
                      {t} Months
                    </button>
                  ))}
                </div>
              </div>

              {/* Method Explainer Callout */}
              <div className="method-info-box">
                <FaInfoCircle className="info-icon" />
                <div className="info-text">
                  <strong>
                    {calculationMethod === "reducing"
                      ? "Reducing Balance Calculation:"
                      : "Flat Rate Calculation:"}
                  </strong>{" "}
                  {calculationMethod === "reducing"
                    ? "Interest is calculated each month only on the remaining outstanding principal. As you repay principal, monthly interest cost reduces."
                    : "Interest is calculated on the full initial loan amount throughout the entire tenure. This represents a fixed interest model."}
                </div>
              </div>
            </div>

            {/* Right Card: Summary & Visual Breakdown */}
            <div className="oxy-emi-card results-card">
              <div className="results-header">
                <h2 className="results-title">Calculation Summary</h2>
                <span className="results-badge">Instant Preview</span>
              </div>

              {/* Monthly EMI Highlight Box */}
              <div className="emi-highlight-box">
                <span className="emi-box-label">Monthly EMI Payment</span>
                <div className="emi-box-amount">
                  {formatINR(calculationResults.monthlyEmi)}
                  <span className="emi-frequency">/ month</span>
                </div>
                <div className="emi-box-footer">
                  <span>
                    Tenure: <strong>{tenureMonths} months</strong>
                  </span>
                  <span>
                    Rate: <strong>{interestRate}% p.a.</strong>
                  </span>
                </div>
              </div>

              {/* Visual SVG Donut & Ratio */}
              <div className="emi-chart-section">
                <div className="chart-svg-wrap">
                  <svg
                    width="180"
                    height="180"
                    viewBox="0 0 180 180"
                    className="donut-svg"
                    aria-label="Principal vs Interest Ratio Chart"
                  >
                    {/* Background Circle */}
                    <circle
                      cx="90"
                      cy="90"
                      r={donutRadius}
                      fill="transparent"
                      stroke="#e2e8f0"
                      strokeWidth="20"
                    />
                    {/* Principal Stroke (Cyan/Blue) */}
                    <circle
                      cx="90"
                      cy="90"
                      r={donutRadius}
                      fill="transparent"
                      stroke="#0284c7"
                      strokeWidth="20"
                      strokeDasharray={`${principalStroke} ${donutCircumference}`}
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      transform="rotate(-90 90 90)"
                    />
                    {/* Interest Stroke (Green/Emerald) */}
                    <circle
                      cx="90"
                      cy="90"
                      r={donutRadius}
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="20"
                      strokeDasharray={`${interestStroke} ${donutCircumference}`}
                      strokeDashoffset={-principalStroke}
                      strokeLinecap="round"
                      transform="rotate(-90 90 90)"
                    />
                  </svg>
                  <div className="donut-center-text">
                    <span className="donut-center-label">Total Payable</span>
                    <span className="donut-center-amount">
                      {formatINR(calculationResults.totalPayable)}
                    </span>
                  </div>
                </div>

                <div className="chart-legend">
                  <div className="legend-item principal">
                    <span className="legend-dot principal" />
                    <div className="legend-info">
                      <span className="legend-label">Principal Amount</span>
                      <strong className="legend-amount">{formatINR(loanAmount)}</strong>
                      <span className="legend-percent">
                        ({calculationResults.principalPercent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  <div className="legend-item interest">
                    <span className="legend-dot interest" />
                    <div className="legend-info">
                      <span className="legend-label">Total Interest</span>
                      <strong className="legend-amount">
                        {formatINR(calculationResults.totalInterest)}
                      </strong>
                      <span className="legend-percent">
                        ({calculationResults.interestPercent.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat Rows */}
              <div className="results-stats-list">
                <div className="stat-row">
                  <span className="stat-label">Principal Loan Amount</span>
                  <strong className="stat-val">{formatINR(loanAmount)}</strong>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Total Interest Payable</span>
                  <strong className="stat-val text-interest">
                    {formatINR(calculationResults.totalInterest)}
                  </strong>
                </div>
                <div className="stat-row total-row">
                  <span className="stat-label">Total Payment (Principal + Interest)</span>
                  <strong className="stat-val text-total">
                    {formatINR(calculationResults.totalPayable)}
                  </strong>
                </div>
              </div>

              {/* Fast Action CTAs */}
              <div className="results-cta-group">
                <Link to="/borrower" className="btn-results-cta apply">
                  <FaHandshake className="btn-icon" />
                  <span>Apply for Loan</span>
                  <FaArrowRight className="arrow-icon" />
                </Link>
                <Link to="/lender" className="btn-results-cta lend">
                  <FaHandHoldingUsd className="btn-icon" />
                  <span>Start Lending (Up to 36% ROI)</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 4. Complete Repayment Amortization Schedule Table */}
          <section className="amortization-section" id="amortization-schedule">
            <div className="amortization-header-bar">
              <div>
                <h3 className="amortization-title">
                  <FaListAlt className="sec-icon" /> Loan Repayment Amortization Schedule
                </h3>
                <p className="amortization-sub">
                  Month-by-month breakdown of principal recovery, interest cost, and outstanding balance
                </p>
              </div>

              <div className="amortization-view-toggles">
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === "monthly" ? "active" : ""}`}
                  onClick={() => setViewMode("monthly")}
                >
                  Monthly Breakdown
                </button>
                <button
                  type="button"
                  className={`view-toggle-btn ${viewMode === "yearly" ? "active" : ""}`}
                  onClick={() => setViewMode("yearly")}
                >
                  Yearly Summary
                </button>
              </div>
            </div>

            <div className="table-responsive-container">
              {viewMode === "monthly" ? (
                <table className="oxy-amortization-table">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Opening Balance</th>
                      <th>Monthly EMI</th>
                      <th>Principal</th>
                      <th>Interest</th>
                      <th>Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tableExpanded
                      ? calculationResults.schedule
                      : calculationResults.schedule.slice(0, 12)
                    ).map((row) => (
                      <tr key={row.month}>
                        <td className="col-month">Month {row.month}</td>
                        <td>{formatINR(row.openingBalance)}</td>
                        <td className="col-emi">{formatINR(row.emi)}</td>
                        <td className="col-principal">{formatINR(row.principal)}</td>
                        <td className="col-interest">{formatINR(row.interest)}</td>
                        <td className="col-balance">{formatINR(row.closingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="oxy-amortization-table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Opening Balance</th>
                      <th>Total EMI Paid</th>
                      <th>Total Principal</th>
                      <th>Total Interest</th>
                      <th>Ending Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculationResults.yearlySchedule.map((yr) => (
                      <tr key={yr.year}>
                        <td className="col-month">Year {yr.year}</td>
                        <td>{formatINR(yr.openingBalance)}</td>
                        <td className="col-emi">{formatINR(yr.totalEmi)}</td>
                        <td className="col-principal">{formatINR(yr.totalPrincipal)}</td>
                        <td className="col-interest">{formatINR(yr.totalInterest)}</td>
                        <td className="col-balance">{formatINR(yr.closingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {viewMode === "monthly" && calculationResults.schedule.length > 12 && (
              <div className="table-expand-bar">
                <button
                  type="button"
                  className="btn-table-expand"
                  onClick={() => setTableExpanded(!tableExpanded)}
                >
                  {tableExpanded ? (
                    <>
                      <FaChevronUp /> Show First 12 Months
                    </>
                  ) : (
                    <>
                      <FaChevronDown /> View All {calculationResults.schedule.length} Months
                    </>
                  )}
                </button>
              </div>
            )}
          </section>

          {/* 5. Educational FAQ & Loan Guide */}
          <section className="calculator-faq-section">
            <h3 className="calc-faq-title">Frequently Asked Questions on Loan EMI</h3>
            <div className="calc-faq-grid">
              <div className="faq-card">
                <h4>What is an Equated Monthly Installment (EMI)?</h4>
                <p>
                  An EMI is a fixed amount payable every month to the lender over the loan tenure.
                  Each EMI consists of a principal component (which repays the borrowed amount) and an
                  interest component (which covers the borrowing cost).
                </p>
              </div>

              <div className="faq-card">
                <h4>What is the difference between Reducing Balance and Flat Rate?</h4>
                <p>
                  In a <strong>Reducing Balance</strong> loan, interest is calculated only on the remaining
                  principal balance each month. In a <strong>Flat Rate</strong> loan, interest is charged
                  on the full initial principal throughout the tenure, making the effective interest rate
                  significantly higher.
                </p>
              </div>

              <div className="faq-card">
                <h4>Can I prepay or foreclose my OxyLoans loan early?</h4>
                <p>
                  Yes! OxyLoans encourages responsible borrower habits. Depending on the agreed terms
                  between you and your lenders, you can prepay part or all of your loan with zero or minimal
                  prepayment penalties.
                </p>
              </div>

              <div className="faq-card">
                <h4>How can I start lending or borrowing on OxyLoans?</h4>
                <p>
                  You can register online in under 3 minutes with basic KYC documents (PAN &amp; Aadhaar).
                  Lenders can start investing with as little as ₹500, while verified borrowers gain direct
                  access to low-interest, transparent peer financing.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* 6. Public Footer */}
      <LandingFooter />
    </div>
  );
};

export default LoanEmiCalculator;
