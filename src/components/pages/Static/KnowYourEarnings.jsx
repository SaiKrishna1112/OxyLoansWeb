import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaCoins,
  FaChartLine,
  FaWallet,
  FaRedo,
} from "react-icons/fa";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";
import oxyTitleDivider from "../../../assets/img/landing/oxy_title_divider.png";
import "./KnowYourEarnings.css";

const KnowYourEarnings = () => {
  // Input form state matching exact user screenshot
  const [loanAmount, setLoanAmount] = useState("");
  const [tenureMonths, setTenureMonths] = useState("");
  const [rateOfInterest, setRateOfInterest] = useState("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Format currency in Indian numbering format
  const formatINR = (val) => {
    const num = Math.round(Number(val) || 0);
    return num.toLocaleString("en-IN");
  };

  // Core calculations
  const stats = useMemo(() => {
    const principal = Math.max(0, Number(loanAmount) || 0);
    const tenure = Math.max(1, parseInt(tenureMonths, 10) || 1);
    const roi = Math.max(0, parseFloat(rateOfInterest) || 0);

    // Monthly interest payout model (flagship OxyLoans model)
    const monthlyRate = roi / 12 / 100;
    const monthlyInterest = principal * monthlyRate;
    const totalInterest = monthlyInterest * tenure;
    const totalMaturity = principal + totalInterest;

    return {
      principal,
      tenure,
      roi,
      monthlyInterest,
      totalInterest,
      totalMaturity,
    };
  }, [loanAmount, tenureMonths, rateOfInterest]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!loanAmount || !tenureMonths || !rateOfInterest) {
      if (!loanAmount) setLoanAmount("100000");
      if (!tenureMonths) setTenureMonths("12");
      if (!rateOfInterest) setRateOfInterest("24");
    }
    setShowResults(true);

    setTimeout(() => {
      const resultsEl = document.getElementById("earnings-results-block");
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleReset = () => {
    setShowResults(false);
  };

  return (
    <div className="oxy-earnings-page">
      {/* 1. Standard Landing Header */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Main Pure-White Content Section Matching Exact User Screenshot */}
      <main className="oxy-earnings-main">
        <div className="container">
          <div className="oxy-earnings-center-card">
            {/* Header: Green text with exact capitalization */}
            <h1 className="oxy-earnings-title">KNOW YOUR EARNINGS</h1>

            {/* Exact OxyLoans decorative cyan swirl divider */}
            <div className="oxy-title-divider-wrap">
              <img
                src={oxyTitleDivider}
                alt="Divider"
                className="oxy-title-divider-img"
              />
            </div>

            {/* Input Form matching exact screenshot layout */}
            <form className="oxy-earnings-form" onSubmit={handleSubmit}>
              <div className="oxy-form-field">
                <input
                  type="number"
                  className="oxy-form-input"
                  placeholder="Amount/Loan"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  min="1000"
                  step="1000"
                />
              </div>

              <div className="oxy-form-field">
                <input
                  type="number"
                  className="oxy-form-input"
                  placeholder="Tenure in months"
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(e.target.value)}
                  min="1"
                  max="60"
                />
              </div>

              <div className="oxy-form-field">
                <input
                  type="number"
                  step="0.1"
                  className="oxy-form-input"
                  placeholder="Rate of Interest"
                  value={rateOfInterest}
                  onChange={(e) => setRateOfInterest(e.target.value)}
                  min="1"
                  max="48"
                />
              </div>

              <button type="submit" className="oxy-form-submit-btn">
                <span className="btn-text">KNOW MY EARNINGS</span>
                <FaArrowRight className="btn-arrow-icon" />
              </button>
            </form>

            {/* 3. Detailed Results Section Displayed Smoothly Below When Submitted */}
            {showResults && (
              <div
                id="earnings-results-block"
                className="oxy-earnings-results-wrapper"
              >
                <div className="results-divider-line" />

                <div className="results-header-row">
                  <div className="results-title-group">
                    <h3>Projected Interest Returns</h3>
                    <p>
                      Estimated earnings for ₹{formatINR(stats.principal)} over{" "}
                      {stats.tenure} months @ {stats.roi}% p.a.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="oxy-recalc-btn"
                    onClick={handleReset}
                    title="Calculate Again"
                  >
                    <FaRedo /> Recalculate
                  </button>
                </div>

                {/* Key Metrics Grid */}
                <div className="earnings-kpi-grid">
                  <div className="kpi-card highlight-green">
                    <div className="kpi-icon">
                      <FaCoins />
                    </div>
                    <div className="kpi-info">
                      <span className="kpi-label">Monthly Interest Payout</span>
                      <strong className="kpi-value">
                        ₹{formatINR(stats.monthlyInterest)}
                      </strong>
                      <span className="kpi-hint">
                        Credited directly every month
                      </span>
                    </div>
                  </div>

                  <div className="kpi-card">
                    <div className="kpi-icon">
                      <FaChartLine />
                    </div>
                    <div className="kpi-info">
                      <span className="kpi-label">Total Interest Earned</span>
                      <strong className="kpi-value">
                        ₹{formatINR(stats.totalInterest)}
                      </strong>
                      <span className="kpi-hint">
                        Over {stats.tenure} months tenure
                      </span>
                    </div>
                  </div>

                  <div className="kpi-card highlight-blue">
                    <div className="kpi-icon">
                      <FaWallet />
                    </div>
                    <div className="kpi-info">
                      <span className="kpi-label">Net Maturity Amount</span>
                      <strong className="kpi-value">
                        ₹{formatINR(stats.totalMaturity)}
                      </strong>
                      <span className="kpi-hint">
                        Principal + Total Interest
                      </span>
                    </div>
                  </div>
                </div>

                <div className="earnings-cta-row">
                  <Link to="/register" className="earnings-start-btn">
                    Start Lending Now <FaArrowRight />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 4. Modular Landing Footer */}
      <LandingFooter />
    </div>
  );
};

export default KnowYourEarnings;
