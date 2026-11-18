import React from "react";
import "./LoginDisclaimerTicker.css";

/**
 * LoginDisclaimerTicker
 * 
 * Statutory RBI NBFC-P2P registration notice and regulatory disclaimer ticker
 * displayed across the top of OxyLoans customer authentication / login screens.
 * Pauses marquee scrolling on mouse hover for ease of reading.
 */
const LoginDisclaimerTicker = () => {
  const disclaimerText = (
    <>
      M/S SRS FINTECHLABS PVT. LTD (OxyLoans) is now registered as an{" "}
      <strong>NBFC-P2P</strong> with <strong>RBI</strong>.{" "}
      <strong>Disclaimer:</strong> The company is having a valid certificate of
      Registration dated Feb 06 2019 issued by the Reserve Bank of India under
      Section 45 IA of the Reserve Bank of India Act, 1934. However, the RBI does
      not accept any responsibility or guarantee about the present position as
      to the financial soundness of the company or for the correctness of any of
      the statements or representations made or opinions expressed by the
      company and for repayment of deposits/discharge of liabilities by the
      company.
    </>
  );

  return (
    <aside
      className="login-disclaimer-ticker"
      aria-label="Reserve Bank of India statutory NBFC-P2P disclaimer"
      role="region"
    >
      <div className="login-disclaimer-inner">
        <marquee
          behavior="scroll"
          direction="left"
          scrollamount="5"
          onMouseEnter={(e) => e.currentTarget.stop()}
          onMouseLeave={(e) => e.currentTarget.start()}
        >
          <span className="login-disclaimer-text">
            {disclaimerText}
            <span className="login-disclaimer-sep" aria-hidden="true">
              &nbsp;&nbsp;&nbsp;&nbsp;&bull;&bull;&bull;&nbsp;&nbsp;&nbsp;&nbsp;
            </span>
            {disclaimerText}
          </span>
        </marquee>
      </div>
    </aside>
  );
};

export default LoginDisclaimerTicker;
