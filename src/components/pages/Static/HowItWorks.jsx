import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaShieldAlt,
  FaPercentage,
  FaUserCheck,
  FaArrowRight,
  FaPlayCircle,
  FaCoins,
} from "react-icons/fa";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";
import workflowImg from "../../../assets/img/landing/work-flow.png";
import "./HowItWorks.css";

const HowItWorks = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="oxy-how-it-works-page">
      {/* 1. Unified Modular Header */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Top Hero Banner */}
      <section className="oxy-hiw-hero">
        <div className="oxy-hiw-hero-inner">
          <div className="oxy-hiw-badge-top">
            <FaPlayCircle className="badge-icon" />
            <span>PLATFORM WORKFLOW &amp; OVERVIEW</span>
          </div>
          <h1 className="oxy-hiw-hero-title">How OxyLoans Works</h1>
          <p className="oxy-hiw-hero-subhead">
            A seamless, transparent peer-to-peer ecosystem connecting verified borrowers
            with retail &amp; HNI lenders through proprietary credit scoring and RBI-mandated Escrow mechanisms.
          </p>

          <div className="oxy-hiw-hero-actions">
            <Link to="/register" className="oxy-hiw-btn btn-hero-lender">
              START LENDING
              <FaArrowRight />
            </Link>
            <Link to="/borrower_register" className="oxy-hiw-btn btn-hero-borrower">
              START BORROWING
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. User's Exact Specification Section */}
      <section className="why-borrow-wrap how-it-works wbg" style={{ background: "white" }}>
        <div className="container">
          <div className="oxy-hiw-section-header">
            <h2>How It Works</h2>
            <div className="oxy-hiw-divider-line">
              <span className="dot" />
            </div>
          </div>

          <div className="row clearfix oxy-hiw-overview-row">
            {/* Video Column (Right side on desktop) */}
            <div className="col-6 fright oxy-hiw-video-col">
              <div className="oxy-video-card-container">
                <div className="oxy-video-header-bar">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                  <span className="title">OxyLoans FinTech P2P Explainer Video</span>
                </div>
                <div className="oxy-video-wrapper">
                  <video
                    controls
                    preload="metadata"
                    className="oxy-html5-video"
                  >
                    <source
                      src="https://oxyloans.com/wp-content/uploads/2017/03/1.mp4"
                      type="video/mp4"
                    />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="oxy-video-caption">
                  <FaPlayCircle className="caption-icon" />
                  <span>Watch: OxyLoans FinTech P2P Ecosystem in Action</span>
                </div>
              </div>
            </div>

            {/* Content Column (Left side on desktop) */}
            <div className="col-6">
              <div className="borrower-list">
                <p className="lead-description">
                  OxyLoans.com is a revolutionary FinTech platform. We encourage Peer-to-Peer
                  Lending (P2PL) and Peer-to-Peer Investing (P2PI). We enable Lender, Investor
                  exchange funds directly with Borrowers. Our proprietary algorithms include
                  Credit Scoring, Underwriting and Agreement Preparation.
                </p>

                <ul className="benefit-bullets">
                  <li>
                    <FaCheckCircle className="bullet-icon" />
                    <span>
                      OxyLoans.com is a revolutionary FinTech platform where Borrowers and Lenders
                      register Online and get connected.
                    </span>
                  </li>
                  <li>
                    <FaCheckCircle className="bullet-icon" />
                    <span>
                      We help Borrowers with low-interest rates and Lender with high returns.
                    </span>
                  </li>
                  <li>
                    <FaPercentage className="bullet-icon" />
                    <span>
                      For Lender, We charge <strong>1.5%</strong> on the transaction value.
                    </span>
                  </li>
                  <li>
                    <FaPercentage className="bullet-icon" />
                    <span>
                      For Borrower, we charge <strong>4%*</strong> on the transaction value.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Workflow Diagram Banner */}
          <div className="work-flow-image">
            <div className="workflow-title-wrap">
              <h3>End-to-End P2P Lending Process</h3>
              <p>Transparent funds flow from registration to automated repayments</p>
            </div>
            <div className="workflow-img-container">
              <img
                src={workflowImg}
                alt="work-flow"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://s3.amazonaws.com/oxyloanswordpress/wp-content/uploads/2017/06/24105615/work-flow.png";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Four Core Pillars / Step-by-Step Breakdown */}
      <section className="oxy-hiw-steps-section">
        <div className="container">
          <div className="oxy-hiw-section-header">
            <h2>The 4-Step OxyLoans Journey</h2>
            <p className="subtitle">
              How funds move safely between lenders and borrowers under RBI regulatory compliance
            </p>
          </div>

          <div className="oxy-hiw-steps-grid">
            {/* Step 1 */}
            <div className="oxy-hiw-step-card">
              <div className="step-number-badge">01</div>
              <div className="step-icon-wrap icon-blue">
                <FaUserCheck />
              </div>
              <h4 className="step-title">Register &amp; Profile Verification</h4>
              <p className="step-desc">
                Borrowers and Lenders register online with PAN and Aadhaar OTP e-KYC.
                Upon reaching 60% profile completeness, lenders can fund loans and borrowers can post loan requests.
              </p>
            </div>

            {/* Step 2 */}
            <div className="oxy-hiw-step-card">
              <div className="step-number-badge">02</div>
              <div className="step-icon-wrap icon-green">
                <FaShieldAlt />
              </div>
              <h4 className="step-title">AI Credit Underwriting</h4>
              <p className="step-desc">
                Proprietary algorithmic credit assessment grades borrower strength across salary,
                banking stability, and bureau credit records (CIBIL/Experian), ensuring transparent risk pricing.
              </p>
            </div>

            {/* Step 3 */}
            <div className="oxy-hiw-step-card">
              <div className="step-number-badge">03</div>
              <div className="step-icon-wrap icon-purple">
                <FaCoins />
              </div>
              <h4 className="step-title">Escrow Fund Transfer</h4>
              <p className="step-desc">
                Once Aadhaar e-Sign agreement is executed, lender funds move strictly through an independent
                ICICI Bank Trustee Escrow account directly to the borrower's verified bank account.
              </p>
            </div>

            {/* Step 4 */}
            <div className="oxy-hiw-step-card">
              <div className="step-number-badge">04</div>
              <div className="step-icon-wrap icon-amber">
                <FaPercentage />
              </div>
              <h4 className="step-title">Repayments &amp; Monthly ROI</h4>
              <p className="step-desc">
                EMIs are collected via automated e-NACH/auto-debit. Lenders receive up to 1.75% monthly returns
                (12%–36% p.a.) with options for bullet principal return or reducing-balance EMIs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bottom Ready to Start CTA Banner */}
      <section className="oxy-hiw-cta-banner">
        <div className="container">
          <div className="cta-banner-card">
            <h2>Ready to Experience Revolutionary P2P FinTech?</h2>
            <p>
              Join thousands of satisfied lenders earning consistent monthly income and borrowers accessing low-interest capital.
            </p>
            <div className="cta-banner-buttons">
              <Link to="/register" className="btn-cta-lender">
                Start Lending (Earn Up to 1.75% / Month)
              </Link>
              <Link to="/borrower_register" className="btn-cta-borrower">
                Start Borrowing (Fast Loan Disbursement)
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Unified Modular Footer */}
      <LandingFooter />
    </div>
  );
};

export default HowItWorks;
