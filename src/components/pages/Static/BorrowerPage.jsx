import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaShieldAlt,
  FaPercentage,
  FaArrowRight,
  FaPlayCircle,
  FaUserCheck,
  FaHandHoldingUsd,
  FaQuoteLeft,
  FaBolt,
  FaFileInvoiceDollar,
  FaClock,
  FaBuilding,
  FaHome,
  FaUser,
  FaBriefcase,
} from "react-icons/fa";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";

// Assets
import borrow11 from "../../../assets/img/borrower/borrow11.png";
import borrow21 from "../../../assets/img/borrower/borrow21.png";
import borrow41 from "../../../assets/img/borrower/borrow41.png";
import tloan1 from "../../../assets/img/borrower/tloan1.png";
import tloan2 from "../../../assets/img/borrower/tloan2.png";
import tloan3 from "../../../assets/img/borrower/tloan3.png";
import tloan4 from "../../../assets/img/borrower/tloan4.png";
import borrowerElbBg from "../../../assets/img/borrower/borrower_elb.jpg";

import testSai from "../../../assets/img/borrower/test_sai.jpg";
import testSreekanth from "../../../assets/img/borrower/test_sreekanth.jpg";
import testPadmini from "../../../assets/img/borrower/test_padmini.jpg";
import testSomasekhar from "../../../assets/img/borrower/test_somasekhar.jpg";
import testSanjib from "../../../assets/img/borrower/test_sanjib.jpg";
import testReddy from "../../../assets/img/borrower/test_reddy.jpg";
import testRamachandra from "../../../assets/img/borrower/test_ramachandra.jpg";
import testCustomer from "../../../assets/img/borrower/test_customer.jpg";
import testAnusha from "../../../assets/img/borrower/test_anusha.jpg";
import testMurali from "../../../assets/img/borrower/test_murali.jpg";

import "./BorrowerPage.css";

const BorrowerPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const whyBorrowCards = [
    {
      img: borrow11,
      title: "Low Interest Rates",
      desc: "Borrow directly from individual and institutional lenders at competitive interest rates negotiated transparently on the platform.",
    },
    {
      img: borrow21,
      title: "Quick and Hassle Free",
      desc: "100% paperless digital onboarding, quick document verification, and zero branch visits required.",
    },
    {
      img: borrow41,
      title: "Funding in a Few Days",
      desc: "Get your loan proposal funded quickly by active lenders with streamlined disbursal directly into your bank account.",
    },
  ];

  const loanTypes = [
    {
      title: "Business Loans",
      img: tloan1,
      link: "/sme-loans",
      desc: "Working capital and growth funding for registered enterprises.",
    },
    {
      title: "Home Loans",
      img: tloan2,
      link: "/personal-loans",
      desc: "Affordable financing for renovation, repair, or property purchase.",
    },
    {
      title: "Personal Loans",
      img: tloan3,
      link: "/personal-loans",
      desc: "Flexible personal credit for medical, travel, wedding, or education.",
    },
    {
      title: "SME Loans",
      img: tloan4,
      link: "/sme-loans",
      desc: "Tailored micro and small business lending with transparent terms.",
    },
  ];

  const eligibilityCriteria = [
    {
      title: "Indian Citizenship",
      desc: "Only Indian Citizens are eligible to borrow on OxyLoans.",
      docs: "Passport / Voter ID Card / Aadhaar Card",
    },
    {
      title: "Platform Registration",
      desc: "Borrower must register their authentic profile on Oxyloans.com.",
      docs: "Mobile number, verified email ID & KYC details",
    },
    {
      title: "Valid Bank Account",
      desc: "Must hold an operational Indian savings or current bank account.",
      docs: "Last 6 Months Bank Statement / Net Banking",
    },
    {
      title: "Identity & Address Proof",
      desc: "Government of India recognized ID and address proof.",
      docs: "PAN Card (mandatory) & Aadhaar / Driving License",
    },
    {
      title: "Verifiable Income Stream",
      desc: "Salaried employee or self-employed professional with steady earnings.",
      docs: "Recent salary slips / Form 16 / ITR filings",
    },
    {
      title: "Credit Assessment",
      desc: "Platform screens each borrower to match with willing lenders.",
      docs: "Automated Bureau evaluation & risk categorization",
    },
  ];

  const testimonials = [
    {
      name: "Sai Krishna",
      company: "Steelwedge Technologies",
      img: testSai,
      quote:
        "My journey with OxyLoans has been excellent. I refer OxyLoans to my friends to approach for their financial needs. The process is smooth and hassle free.",
    },
    {
      name: "Sreekanth Suram",
      company: "Dell",
      img: testSreekanth,
      quote:
        "Thanks to OxyLoans for providing me the loan at the right time. The process of lending money is very fast and transparent.",
    },
    {
      name: "Padmini Bollineni",
      company: "CEO, PurpleGlossy",
      img: testPadmini,
      quote:
        "My heartfelt thanks to OxyLoans for arranging Cash on time. Really a right time help to our business, PurpleGlossy.",
    },
    {
      name: "Somasekhar",
      company: "Verified Borrower",
      img: testSomasekhar,
      quote:
        "I saw oxyloans.com news on social media and applied for a loan. My loan got sanctioned within 3 days.",
    },
    {
      name: "Sanjib Naskar",
      company: "Jacobs Engn (I) P Ltd.",
      img: testSanjib,
      quote:
        "I really loved and satisfied by the way the whole process of the peer-to-peer loan was executed.",
    },
    {
      name: "Lakshmi Narasimha Reddy",
      company: "DUPONT",
      img: testReddy,
      quote:
        "I want to thank OxyLoans, a p2p services company for helping me in choosing a Right Lender, with a loan at low interest rate irrespective of my CIBIL score.",
    },
    {
      name: "Ramachandra Naidu",
      company: "Dairy Unit Owner",
      img: testRamachandra,
      quote:
        "I was seriously looking for a loan to build infrastructure in my dairy unit. Thanks to the peer-to-peer loans concept, which enabled me to get my loan amount within a week.",
    },
    {
      name: "Customer",
      company: "Verified Borrower",
      img: testCustomer,
      quote:
        "Oxyloans helps people who are really in need with its quick and simple process by providing funds in time. I experienced this as a customer and to my surprise, everything is online including documentation.",
    },
    {
      name: "Anusha",
      company: "First P2P Borrower",
      img: testAnusha,
      quote:
        "Congratulations to our first peer-to-peer borrower on OxyLoans. Seamless experience from application to disbursal.",
    },
    {
      name: "Murali Krishna",
      company: "Satra Infra",
      img: testMurali,
      quote:
        "Thanks to OxyLoans for enabling the peer-to-peer loan at the right time for paying my children's school fees. The process is very fast.",
    },
  ];

  return (
    <div className="oxy-borrower-page">
      {/* 1. Header */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Top Hero Banner */}
      <section className="oxy-borrower-hero">
        <div className="oxy-borrower-hero-inner">
          <div className="oxy-borrower-badge-top">
            <FaBolt className="badge-icon" />
            <span>RBI REGULATED NBFC-P2P BORROWER ECOSYSTEM</span>
          </div>
          <h1 className="oxy-borrower-hero-title">Borrow Smarter at Lower Interest</h1>
          <p className="oxy-borrower-hero-subhead">
            Connect directly with verified lenders across India to secure personalized
            loan terms, competitive interest rates, and accelerated funding with 100% digital KYC.
          </p>
          <div className="oxy-borrower-hero-actions">
            <Link to="/borrower_register" className="oxy-borrower-btn btn-hero-primary">
              <FaHandHoldingUsd />
              APPLY FOR LOAN
              <FaArrowRight />
            </Link>
            <Link to="/how-it-works" className="oxy-borrower-btn btn-hero-secondary">
              <FaPlayCircle />
              HOW IT WORKS
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Main Overview & Video Section (borrower-video-wrap) */}
      <section className="borrower-video-wrap oxy-borrower-overview-section">
        <div className="container">
          <div className="borrower-head oxy-borrower-head">
            <span className="oxy-borrower-sub-badge">BORROWER OVERVIEW</span>
            <h2>Borrower</h2>
            <div className="oxy-borrower-divider">
              <span className="dot" />
            </div>
          </div>

          <div className="row clearfix oxy-borrower-video-row">
            {/* Left Column: Details & Privileges */}
            <div className="col-6 oxy-borrower-info-col">
              <div className="borrower-list oxy-borrower-list">
                <div className="oxy-borrower-callout-card">
                  <div className="callout-icon-box">
                    <FaPercentage />
                  </div>
                  <div className="callout-text">
                    <strong>Direct Borrower-Lender Negotiation</strong>
                    <p>
                      Cut out the banking middleman and agree on fair interest rates, tenure,
                      and repayment cycles directly with retail and institutional lenders.
                    </p>
                  </div>
                </div>

                <div className="oxy-borrower-bullets-wrap">
                  <h4 className="bullets-title">Key Borrower Advantages:</h4>
                  <ul className="oxy-borrower-bullets">
                    <li>
                      <FaCheckCircle className="check-ico" />
                      <span>
                        Our focus in India is to enable P2P Loans; Indian Borrowers can avail
                        dedicated P2P loans tailored to their unique profile.
                      </span>
                    </li>
                    <li>
                      <FaCheckCircle className="check-ico" />
                      <span>
                        Borrowers can negotiate with Lenders directly through the OxyLoans platform
                        about the interest rates, tenure, and repayment cycles.
                      </span>
                    </li>
                    <li>
                      <FaCheckCircle className="check-ico" />
                      <span>
                        Our platform carefully screens each Borrower using advanced credit scoring,
                        ensuring fair terms and higher lender trust.
                      </span>
                    </li>
                    <li>
                      <FaCheckCircle className="check-ico" />
                      <span>
                        We encourage borrowers with valid documents to achieve faster approvals and
                        favorable lending offers.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="oxy-borrower-col-action">
                  <Link to="/borrower_register" className="oxy-borrower-btn btn-action-pill">
                    Register as Borrower Now
                    <FaArrowRight />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: HTML5 Explainer Video */}
            <div className="col-6 fright oxy-borrower-video-col">
              <div className="oxy-video-card-container">
                <div className="oxy-video-header-bar">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                  <span className="title">OxyLoans Borrower Explainer Video</span>
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
                    Watch how peer-to-peer lending connects you directly to investors with lower
                    borrowing rates.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Why Borrow at Oxyloans (why-borrow-wrap borrower-wraps) */}
      <section className="why-borrow-wrap borrower-wraps oxy-why-borrow-section">
        <div className="container">
          <div className="oxy-section-header-center">
            <span className="oxy-borrower-sub-badge">KEY BENEFITS</span>
            <h2>Why Borrow at Oxyloans</h2>
            <div className="oxy-borrower-divider">
              <span className="dot" />
            </div>
            <p className="oxy-section-subtitle">
              Designed to help individuals and businesses achieve their financial goals faster
              without traditional banking barriers.
            </p>
          </div>

          <div className="row clearfix oxy-why-grid">
            {whyBorrowCards.map((card, idx) => (
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

      {/* 5. Trusted Partner & Loan Products (trusted-partners-wrap) */}
      <section className="trusted-partners-wrap oxy-trusted-section">
        <div className="container">
          <div className="clearfix trust-head oxy-trust-headline">
            <span className="oxy-trust-motto-tag">DIVERSE LOAN PRODUCTS</span>
            <p>
              <em>A trusted partner to fulfill your requirements</em>
            </p>
          </div>

          <div className="trust-list oxy-loan-products-grid">
            {loanTypes.map((loan, idx) => (
              <div className="trust-loans oxy-loan-product-col" key={idx}>
                <Link to={loan.link} className="loan-type oxy-loan-product-card">
                  <div className="step-tag-badge">LOAN PRODUCT</div>
                  <figure className="step-figure">
                    <img src={loan.img} alt={loan.title} />
                  </figure>
                  <h5 className="step-title">{loan.title}</h5>
                  <p className="step-desc">{loan.desc}</p>
                  <span className="learn-more-link">
                    Explore Product <FaArrowRight />
                  </span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Borrowers Eligibility (eligible-borrower-wrap) */}
      <section
        className="eligible-borrower-wrap oxy-borrower-eligibility-section"
        style={{ backgroundImage: `url(${borrowerElbBg})` }}
      >
        <div className="oxy-eligibility-overlay">
          <div className="container">
            <div className="oxy-eligibility-header">
              <span className="eligibility-badge-gold">
                <FaUserCheck /> ONBOARDING REQUIREMENTS
              </span>
              <h2>Borrowers Eligibility</h2>
              <div className="oxy-borrower-divider light">
                <span className="dot" />
              </div>
              <p className="eligibility-intro">
                OxyLoans is a platform for people with a non-traditional approach to borrowing,
                which ultimately results in lower interest rates on the financing amount. All borrowers
                on OxyLoans must meet the following criteria to be eligible to be listed on our platform:
              </p>
            </div>

            <div className="clearfix row oxy-eligibility-row">
              <div className="col-12 oxy-eligibility-content">
                <div className="oxy-eligibility-cards-grid">
                  {eligibilityCriteria.map((item, idx) => (
                    <div className="oxy-eligibility-card" key={idx}>
                      <div className="card-num-badge">0{idx + 1}</div>
                      <div className="card-body-content">
                        <h4 className="eligibility-item-title">{item.title}</h4>
                        <p className="eligibility-item-main">{item.desc}</p>
                        <div className="eligibility-item-docs">
                          <span className="doc-label">Accepted Docs:</span>
                          <span className="doc-value">{item.docs}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="oxy-eligibility-footer-note">
              <FaShieldAlt className="shield-icon" />
              <span>
                100% digital KYC verification powered by RBI guidelines and bank-level data encryption.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Borrowers Testimonials (loan-experts-wrap borrower-testimonials) */}
      <section className="loan-experts-wrap borrower-testimonials oxy-testimonials-section">
        <div className="container">
          <div className="experts-head oxy-testimonials-head">
            <span className="oxy-borrower-sub-badge">BORROWER EXPERIENCES</span>
            <h2>Borrowers Testimonials</h2>
            <div className="oxy-borrower-divider">
              <span className="dot" />
            </div>
            <p className="testimonials-subtext">
              Real stories from borrowers who funded their businesses, family needs, and life dreams on OxyLoans.
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
                      <span className="testi-author-role">{testi.company}</span>
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

      {/* 8. Call to Action Banner */}
      <section className="oxy-borrower-cta-banner">
        <div className="container">
          <div className="oxy-cta-inner">
            <div className="oxy-cta-content">
              <h3>Ready to Get Funded at Lower Interest Rates?</h3>
              <p>
                Apply in 3 minutes, complete instant digital verification, and get
                matched with hundreds of verified retail &amp; institutional lenders.
              </p>
            </div>
            <div className="oxy-cta-actions">
              <Link to="/borrower_register" className="oxy-cta-btn btn-cta-primary">
                Apply for Loan
                <FaArrowRight />
              </Link>
              <Link to="/how-it-works" className="oxy-cta-btn btn-cta-secondary">
                Learn How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <LandingFooter />
    </div>
  );
};

export default BorrowerPage;
