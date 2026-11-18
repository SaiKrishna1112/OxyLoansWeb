import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaGlobeAmericas,
  FaFileContract,
  FaCheckCircle,
  FaHandshake,
  FaBuilding,
  FaUserTie,
  FaArrowRight,
  FaPhoneAlt,
  FaShieldAlt,
} from "react-icons/fa";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";

// Downloaded original assets
import investBorrower from "../../../assets/img/landing/products/invest2-1-1.png";
import investLender from "../../../assets/img/landing/products/invest_1.png";
import agreementImg from "../../../assets/img/landing/products/agreement.png";
import oxyTitleDivider from "../../../assets/img/landing/oxy_title_divider.png";

import "./InternationalBusinessExpansion.css";

const InternationalBusinessExpansion = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="oxy-expansion-loan-page">
      {/* 1. Modular Header */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Top Hero Section */}
      <section className="oxy-expansion-hero">
        <div className="oxy-expansion-hero-inner">
          <div className="oxy-expansion-badge-top">
            <FaGlobeAmericas className="badge-icon" />
            <span>GLOBAL P2P CROSS-BORDER FINANCING &amp; NRI INVESTMENTS</span>
          </div>
          <h1 className="oxy-expansion-hero-title">
            International Business Expansion Loans
          </h1>
          <p className="oxy-expansion-hero-subhead">
            Empowering ambitious Indian businesses to enter lucrative global
            markets with direct capital from Non-Resident Indian (NRI) investors.
            Transparent terms, robust escrow safety, and legally binding bilateral agreements.
          </p>
        </div>
      </section>

      {/* 3. User's Exact Specification Section: borrower-video-wrap business-exp-wrap */}
      <section className="borrower-video-wrap business-exp-wrap">
        <div className="container">
          <div className="borrower-head">
            <h2>International Business Expansion Loans</h2>
            <div className="oxy-title-divider-wrap">
              <img
                src={oxyTitleDivider}
                alt="Divider"
                className="oxy-title-divider-img"
              />
            </div>
          </div>

          {/* Cards for Borrower and Lender */}
          <div className="row clearfix invest-lender-row">
            {/* Borrower Card */}
            <div className="col-3 invest-card-col">
              <div className="invest-lender">
                <span>
                  <img src={investBorrower} alt="Borrower" />
                </span>
                <h5>Borrower</h5>
                <Link to="/borrower_register" className="btn2">
                  Start Borrowing
                </Link>

                <div className="invest-desc">
                  <ul>
                    <li>All Indian citizens are eligible.</li>
                    <li>Borrowers can apply for a loan online.</li>
                    <li>Our platform carefully screens each borrower.</li>
                    <li>We encourage Borrowers with valid documents.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Lender Card */}
            <div className="col-3 invest-card-col">
              <div className="invest-lender">
                <span>
                  <img src={investLender} alt="Lender" />
                </span>
                <h5>Lender</h5>
                <Link to="/register" className="btn2">
                  Start lending
                </Link>

                <div className="invest-desc">
                  <ul>
                    <li>All Indian citizens are eligible.</li>
                    <li>Lenders are free to choose their preferred Borrowers.</li>
                    <li>They can quote the rate of interest they want on their principal.</li>
                    <li>They can distribute the principal among Borrowers to minimize the risk.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. User's Exact Specification Section: agreement-wrap */}
      <section className="agreement-wrap">
        <div className="container">
          <h2>OxyLoans - Enables Agreement</h2>
          <p className="agreement-subhead">
            Every transaction is backed by a digitally signed, legally enforceable
            bilateral loan agreement between the enterprise and verified investors.
          </p>
          <div className="agreement-block">
            <figure>
              <img
                src={agreementImg}
                alt="OxyLoans Enables Agreement"
                className="agreement-img"
              />
            </figure>
          </div>
        </div>
      </section>

      {/* 5. User's Exact Specification Section: borrower-video-wrap with islamic-loans */}
      <section className="borrower-video-wrap expansion-details-wrap">
        <div className="container">
          <div className="islamic-loans">
            {/* Section 1 */}
            <div className="islamic-list">
              <h6>Interested in International Business Expansion?</h6>
              <p>
                The world is filled with business opportunities, meaning that
                Indian businesses can reap rich rewards by entering international
                markets. However, it is important to note that successful
                expansion needs sufficient funding as well as both expertise and
                experience. Fortunately for Indian businesses that need a source
                of funding to fuel their international expansion, there is a
                perfect solution in the form of OxyLoans.
              </p>
            </div>

            {/* Section 2 */}
            <div className="islamic-list">
              <h6>
                Come to OxyLoans for Both Investments and Investment
                Opportunities!
              </h6>
              <p>
                In short, OxyLoans provides a platform for Indian businesses
                interested in international expansion to make contact with NRIs
                interested in providing funding for such businesses. By using
                our services, Indian businesses can post their expansion plans,
                which will attract NRIs who believe in their chances of success.
                Likewise, NRIs can post their investment criteria, which can be
                used to filter out most investment opportunities to leave those
                that fit their investing interests. In this manner, we strive to
                eliminate the most complicated and time-consuming parts of the
                investment process, thus facilitating NRI investments in Indian
                businesses interested in international expansion.
              </p>
            </div>

            {/* Section 3 */}
            <div className="islamic-list">
              <h6>What Do You Need to Remember?</h6>
              <p>
                With that said, both Indian businesses and NRI investors should
                make sure to exercise an appropriate level of care and
                consideration when seeking either investments or investment
                opportunities, which will provide them with what they want
                without taking on too much risk. Here are some examples of
                things to remember when using our platform:
              </p>
              <ul className="islamic-checklist">
                <li>
                  Indian businesses need to remember that NRI investors can be
                  interested in various forms of compensation, ranging from the
                  standard principal plus interest package to a percentage of the
                  controlling shares that would provide them with a say in their
                  revenue-earning operations.
                </li>
                <li>
                  NRI investors should remember that while most of the investment
                  opportunities that they come across will make a perfect fit for
                  their investment criteria, they can still make worthwhile
                  investment opportunities so long as they are willing to be a
                  little bit flexible when it comes to their investment
                  portfolios.
                </li>
                <li>
                  Both sides in the investment process should give some serious
                  thought to collateral in the form of land, buildings, bonds,
                  shares, and other financial instruments, which can provide
                  Indian businesses with better financing terms and NRI
                  investors with increased assurance that their investments will
                  be safe and sound.
                </li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="islamic-list contact-list-item">
              <h6>Contact Us</h6>
              <p>
                On a concluding note, OxyLoans would like to state that we welcome
                a wide range of Indian businesses interested in seeking financing
                from NRI investors, whether they are in education, general
                services, IT, manufacturing, or any other sector. As a result,
                they should not hesitate to seek us out, whether they are
                interested in making use of our platform or want to speak with us
                before taking a final decision.
              </p>
              <div className="expansion-contact-actions">
                <Link to="/contact-us" className="btn-expansion-contact">
                  <FaPhoneAlt /> Speak to Our Advisory Desk
                </Link>
                <Link to="/borrower_register" className="btn-expansion-apply">
                  Apply for Business Expansion <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Modular Footer */}
      <LandingFooter />
    </div>
  );
};

export default InternationalBusinessExpansion;
