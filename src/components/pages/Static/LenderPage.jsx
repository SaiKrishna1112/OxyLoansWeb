import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaShieldAlt,
  FaPercentage,
  FaArrowRight,
  FaPlayCircle,
  FaUserCheck,
  FaChartLine,
  FaHandHoldingUsd,
  FaCoins,
  FaQuoteLeft,
  FaIdCard,
  FaFileInvoiceDollar,
  FaCalendarCheck,
  FaRegLightbulb,
} from "react-icons/fa";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";

// Assets
import investor11 from "../../../assets/img/lender/investor11.png";
import investor31 from "../../../assets/img/lender/investor31.png";
import investor41 from "../../../assets/img/lender/investor41.png";
import saveImg from "../../../assets/img/lender/save.png";
import investImg from "../../../assets/img/lender/invest.png";
import growImg from "../../../assets/img/lender/grow.png";
import lenderCriteriaBg from "../../../assets/img/lender/lender_criteria.jpg";
import padminiImg from "../../../assets/img/lender/test_padmini.jpg";
import vinodImg from "../../../assets/img/lender/test_vinod.jpg";
import manojImg from "../../../assets/img/lender/test_manoj.jpg";

import "./LenderPage.css";

const LenderPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const whyLendCards = [
    {
      img: investor11,
      title: "High Returns",
      desc: "Earn returns as high as 36% p.a. from curated borrower deals with monthly repayments.",
    },
    {
      img: investor31,
      title: "High Quality P2P Loan Projects",
      desc: "Thorough physical and financial underwriting ensures verified creditworthy borrowers.",
    },
    {
      img: investor41,
      title: "Hassle Free, Transparent & Secure",
      desc: "RBI NBFC-P2P compliant escrow mechanisms with zero hidden charges and complete digital tracking.",
    },
  ];

  const trustSteps = [
    {
      tag: "SAVE",
      img: saveImg,
      subtitle: "Capital Preservation",
      desc: "Preserve capital with disciplined risk assessment and bank-promoted escrow custody.",
    },
    {
      tag: "INVEST",
      img: investImg,
      subtitle: "Direct Allocation",
      desc: "Distribute your funds across diverse borrowers and risk grades to balance yield and safety.",
    },
    {
      tag: "GROW",
      img: growImg,
      subtitle: "Compounding Wealth",
      desc: "Reinvest monthly interest and principal payouts automatically to maximize portfolio growth.",
    },
  ];

  const criteriaList = [
    {
      title: "Age Requirement",
      desc: "Be over 21 years of age",
      docs: "Passport / Voter ID Card / Driving License",
    },
    {
      title: "Indian Citizenship",
      desc: "Be an Indian Citizen or eligible NRI",
      docs: "Passport / Voter ID Card / Aadhaar Card",
    },
    {
      title: "Active Bank Account",
      desc: "Holds a Valid Bank Account in India",
      docs: "Last 6 Months Bank Statement",
    },
    {
      title: "Identity Proof",
      desc: "Government of India recognized Identity Proof",
      docs: "Aadhaar Card / Passport / Voter ID",
    },
    {
      title: "Address Proof",
      desc: "Government of India approved Address Proof",
      docs: "Utility Bill / Aadhaar / Passport",
    },
    {
      title: "Income & Tax Compliance",
      desc: "Valid PAN Card",
      docs: "Mandatory for KYC and regulatory reporting",
    },
  ];

  const testimonials = [
    {
      name: "Padmini Bollineni",
      role: "CEO",
      img: padminiImg,
      quote:
        "My journey with Oxyloans has been excellent. I refer Oxyloans to my friends to approach for seamless alternative investments with reliable returns and complete transparency.",
    },
    {
      name: "Vinod Kumar .N",
      role: "CEO",
      img: vinodImg,
      quote:
        "Being a Peer-to-Peer Lender is Being Human! Mr. Vinod believes in creating opportunities. All these days Mr. Vinod is helping students to attain good GMAT scores to enter into Business Schools, but now by becoming a Lender at www.oxyloans.com he is going to help businesses and individuals to fulfill their dreams. I request lenders and borrowers to register and help create alternative opportunities to each other—all our transactions are 100% online.",
    },
    {
      name: "Manoj Bisht",
      role: "First P2P Lender",
      img: manojImg,
      quote:
        "OxyLoans congratulates Manoj Bisht, our first Peer-to-Peer Lender on www.oxyloans.com – An Alternative Lending Platform. We invite individual and institutional lenders to join us in earning better returns with direct lender-borrower transparency.",
    },
  ];

  return (
    <div className="oxy-lender-page">
      {/* 1. Modular Header */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Top Hero Banner */}
      <section className="oxy-lender-hero">
        <div className="oxy-lender-hero-inner">
          <div className="oxy-lender-badge-top">
            <FaChartLine className="badge-icon" />
            <span>RBI REGULATED NBFC-P2P PLATFORM</span>
          </div>
          <h1 className="oxy-lender-hero-title">Lend &amp; Grow Your Wealth</h1>
          <p className="oxy-lender-hero-subhead">
            Earn returns as high as <strong>36% p.a.</strong> by investing directly
            in verified borrowers across India. Enjoy monthly returns, bank-promoted
            escrow security, and full diversification control.
          </p>
          <div className="oxy-lender-hero-actions">
            <Link to="/register" className="oxy-lender-btn btn-lender-primary">
              <FaHandHoldingUsd />
              START LENDING
              <FaArrowRight />
            </Link>
            <Link to="/know-your-earnings" className="oxy-lender-btn btn-lender-secondary">
              <FaCoins />
              KNOW YOUR EARNINGS
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Main Overview & Video Section (borrower-video-wrap) */}
      <section className="borrower-video-wrap oxy-lender-overview-section">
        <div className="container">
          <div className="borrower-head oxy-lender-head">
            <span className="oxy-lender-sub-badge">INVESTMENT OVERVIEW</span>
            <h2>Lender</h2>
            <div className="oxy-lender-divider">
              <span className="dot" />
            </div>
          </div>

          <div className="row clearfix oxy-lender-video-row">
            {/* Left Column: Explanatory Content & Bullets */}
            <div className="col-6 oxy-lender-info-col">
              <div className="borrower-list oxy-lender-list">
                <div className="oxy-lender-callout-card">
                  <div className="callout-icon-box">
                    <FaPercentage />
                  </div>
                  <div className="callout-text">
                    <strong>Earn Up to 36% Annualized Returns</strong>
                    <p>
                      Individual investment tranches provide industry-leading
                      yields compared to traditional fixed deposits or debt instruments.
                    </p>
                  </div>
                </div>

                <p className="oxy-lender-intro-p">
                  Lenders on our platform can earn returns as high as 36% from individual
                  tranches of investments. However, we encourage them to diversify the risk
                  by investing in multiple customers across different risk classes such that
                  risk remains low and returns are maximized, which in turn depends on the risk
                  appetite of customers.
                </p>

                <p className="oxy-lender-intro-p">
                  The criteria for Lender onboarding follows policies similar to those
                  followed for Borrowers. It includes physical verification of location and
                  income &amp; expense statements.
                </p>

                <div className="oxy-lender-bullets-wrap">
                  <h4 className="bullets-title">Key Lender Privileges:</h4>
                  <ul className="oxy-lender-bullets">
                    <li>
                      <FaCheckCircle className="check-ico" />
                      <span>All Indian citizens and eligible entities are eligible.</span>
                    </li>
                    <li>
                      <FaCheckCircle className="check-ico" />
                      <span>Lenders are free to choose their preferred Borrowers.</span>
                    </li>
                    <li>
                      <FaCheckCircle className="check-ico" />
                      <span>
                        They can quote the rate of interest they want on their principal.
                      </span>
                    </li>
                    <li>
                      <FaCheckCircle className="check-ico" />
                      <span>
                        They can distribute the principal among Borrowers to minimize the risk.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="oxy-lender-col-action">
                  <Link to="/register" className="oxy-lender-btn btn-action-pill">
                    Register as Lender Now
                    <FaArrowRight />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: HTML5 Video Player */}
            <div className="col-6 fright oxy-lender-video-col">
              <div className="oxy-video-card-container">
                <div className="oxy-video-header-bar">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                  <span className="title">OxyLoans Lender Explainer Video</span>
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
                  <span>
                    Watch how peer-to-peer lending empowers investors to maximize returns
                    safely.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Why Lend at Oxyloans Section (why-borrow-wrap lender-wrap) */}
      <section className="why-borrow-wrap lender-wrap oxy-why-lend-section">
        <div className="container">
          <div className="oxy-section-header-center">
            <span className="oxy-lender-sub-badge">KEY ADVANTAGES</span>
            <h2>Why Lend at Oxyloans</h2>
            <div className="oxy-lender-divider">
              <span className="dot" />
            </div>
            <p className="oxy-section-subtitle">
              Engineered for smart investors who seek superior risk-adjusted yields,
              ironclad compliance, and complete portfolio control.
            </p>
          </div>

          <div className="row clearfix oxy-why-grid">
            {whyLendCards.map((card, idx) => (
              <div className="col-4 oxy-why-col" key={idx}>
                <div className="why-list oxy-why-card">
                  <div className="oxy-card-figure-wrap">
                    <figure>
                      <img src={card.img} alt={card.title} />
                    </figure>
                  </div>
                  <h5 className="oxy-why-title">{card.title}</h5>
                  <p className="oxy-why-desc">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Trusted Partner Section (trusted-partners-wrap) */}
      <section className="trusted-partners-wrap oxy-trusted-section">
        <div className="container">
          <div className="clearfix trust-head oxy-trust-headline">
            <span className="oxy-trust-motto-tag">SEAMLESS WEALTH CREATION</span>
            <p>
              <em>A trusted partner to fulfill your requirements</em>
            </p>
          </div>

          <div className="trust-list trust-invest3 oxy-trust-grid">
            {trustSteps.map((step, idx) => (
              <div className="trust-loans oxy-trust-card" key={idx}>
                <div className="loan-type oxy-loan-step-inner">
                  <div className="step-tag-badge">{step.tag}</div>
                  <figure className="step-figure">
                    <img src={step.img} alt={step.tag} />
                  </figure>
                  <h5 className="step-title">{step.subtitle}</h5>
                  <p className="step-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Lender Criteria Section (eligible-borrower-wrap) */}
      <section
        className="eligible-borrower-wrap oxy-criteria-section"
        style={{ backgroundImage: `url(${lenderCriteriaBg})` }}
      >
        <div className="oxy-criteria-overlay">
          <div className="container">
            <div className="oxy-criteria-header">
              <span className="criteria-badge-gold">
                <FaUserCheck /> ONBOARDING REQUIREMENTS
              </span>
              <h2>Lender Criteria</h2>
              <div className="oxy-lender-divider light">
                <span className="dot" />
              </div>
              <p className="criteria-intro">
                Simple, transparent eligibility criteria as mandated by the Reserve Bank of India.
              </p>
            </div>

            <div className="clearfix row oxy-criteria-row">
              <div className="col-12 oxy-eligibility-content">
                <div className="oxy-criteria-cards-grid">
                  {criteriaList.map((item, idx) => (
                    <div className="oxy-criteria-card" key={idx}>
                      <div className="card-num-badge">0{idx + 1}</div>
                      <div className="card-body-content">
                        <h4 className="criteria-item-title">{item.title}</h4>
                        <p className="criteria-item-main">{item.desc}</p>
                        <div className="criteria-item-docs">
                          <span className="doc-label">Accepted Docs:</span>
                          <span className="doc-value">{item.docs}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="oxy-criteria-footer-note">
              <FaShieldAlt className="shield-icon" />
              <span>
                All documents submitted are encrypted and verified under strict NBFC-P2P KYC guidelines.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Lenders Testimonials Section (borrower-testimonials) */}
      <section className="loan-experts-wrap borrower-testimonials oxy-testimonials-section">
        <div className="container">
          <div className="experts-head oxy-testimonials-head">
            <span className="oxy-lender-sub-badge">INVESTOR EXPERIENCES</span>
            <h2>Lenders Testimonials</h2>
            <div className="oxy-lender-divider">
              <span className="dot" />
            </div>
            <p className="testimonials-subtext">
              Real stories from lenders who have funded projects and multiplied their wealth on OxyLoans.
            </p>
          </div>

          <div className="borrower-testi-slider oxy-testimonials-grid">
            {testimonials.map((testi, idx) => (
              <div className="borrower-testi oxy-testimonial-card" key={idx}>
                <div className="gleoon-img-block">
                  <div className="testi-card-header">
                    <div className="gleoon-img">
                      <img src={testi.img} alt={testi.name} />
                    </div>
                    <div className="gleoon-details">
                      <h4 className="testi-author-name">{testi.name}</h4>
                      <span className="testi-author-role">{testi.role}</span>
                    </div>
                    <div className="quote-icon-decor">
                      <FaQuoteLeft />
                    </div>
                  </div>

                  <div className="testi-card-quote">
                    <p>{testi.quote}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Modern Call-to-Action Banner */}
      <section className="oxy-lender-cta-banner">
        <div className="container">
          <div className="oxy-cta-inner">
            <div className="oxy-cta-content">
              <h3>Start Your Peer-to-Peer Lending Journey Today</h3>
              <p>
                Sign up in 3 minutes, complete instant digital KYC, and start
                allocating capital to verified high-yield borrowers.
              </p>
            </div>
            <div className="oxy-cta-actions">
              <Link to="/register" className="oxy-cta-btn btn-cta-primary">
                Register as Lender
                <FaArrowRight />
              </Link>
              <Link to="/know-your-earnings" className="oxy-cta-btn btn-cta-secondary">
                Calculate Earnings
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Landing Footer */}
      <LandingFooter />
    </div>
  );
};

export default LenderPage;
