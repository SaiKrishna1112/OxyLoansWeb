import React, { useEffect } from "react";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";
import oxyTitleDivider from "../../../assets/img/landing/oxy_title_divider.png";
import "./KnowYourFees.css";

const KnowYourFees = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="oxy-fees-page">
      {/* 1. Header */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Main Pure-White Content Section Matching Exact User Screenshot */}
      <main className="oxy-fees-main">
        <div className="container">
          <div className="oxy-fees-center-card">
            {/* Header: Green text with exact capitalization */}
            <h1 className="oxy-fees-title">KNOW YOUR FEES</h1>

            {/* Exact OxyLoans decorative cyan swirl divider */}
            <div className="oxy-title-divider-wrap">
              <img
                src={oxyTitleDivider}
                alt="Divider"
                className="oxy-title-divider-img"
              />
            </div>

            {/* Exact Table from User's Screenshot */}
            <div className="oxy-fees-table-container">
              <table className="oxy-fees-spec-table">
                <thead>
                  <tr>
                    <th className="col-user">User</th>
                    <th className="col-charges">Transaction Charges in %</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="user-cell">Lender</td>
                    <td className="charges-cell">
                      1.5% on the transaction value + GST
                    </td>
                  </tr>
                  <tr>
                    <td className="user-cell">Borrower</td>
                    <td className="charges-cell">
                      4% on the transaction value + GST *
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Modular Landing Footer */}
      <LandingFooter />
    </div>
  );
};

export default KnowYourFees;
