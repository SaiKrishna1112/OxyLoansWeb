import React, { useEffect } from "react";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";
import oxyTitleDivider from "../../../assets/img/landing/oxy_title_divider.png";
import "./KnowYourTax.css";

const KnowYourTax = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="oxy-tax-page">
      {/* 1. Header */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Main Pure-White Content Section Matching Exact User Screenshot */}
      <main className="oxy-tax-main">
        <div className="container">
          <div className="oxy-tax-center-card">
            {/* Header: Green text with exact capitalization */}
            <h1 className="oxy-tax-title">KNOW YOUR TAX</h1>

            {/* Exact OxyLoans decorative cyan swirl divider */}
            <div className="oxy-title-divider-wrap">
              <img
                src={oxyTitleDivider}
                alt="Divider"
                className="oxy-title-divider-img"
              />
            </div>

            {/* Verbatim statement from user screenshot */}
            <div className="oxy-tax-statement-box">
              <p className="statement-text">
                All your earnings should be published to your Chartered Accountant and pay TAX accordingly.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Modular Landing Footer */}
      <LandingFooter />
    </div>
  );
};

export default KnowYourTax;
