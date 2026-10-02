import React, { useState } from "react";
import { formatINR } from "../creditReportUtils";
import { calculateLoanOffers } from "./instantLoanService";

const InstantLoanStepOfferSelection = ({
  profileData,
  creditScore = 802,
  onOfferSelected,
  onBack,
}) => {
  const salary = Number(profileData.monthlySalary || 65000);
  const maxCap = Math.round(salary * 0.9);

  // Dynamic loan amount slider (default ₹45,000)
  const [requestedAmount, setRequestedAmount] = useState(45000);
  const [selectedOfferType, setSelectedOfferType] = useState("EMI"); // "BULLET" | "EMI"
  const [dynamicTenure, setDynamicTenure] = useState(3); // 3 or 6 months
  const [showKfsModal, setShowKfsModal] = useState(false);

  // Calculate dynamic offers for current requestedAmount & score
  const { annualRoi } = calculateLoanOffers(salary, creditScore);

  // Dynamic Calculations based on chosen amount
  const processingFeeRate = 0.025; // 2.5%
  const processingFee = Math.round(requestedAmount * processingFeeRate);
  const gst = Math.round(processingFee * 0.18);
  const netDisbursal = requestedAmount - processingFee - gst;

  // Bullet Calculation (1 Month / 30 Days)
  const bulletMonthlyRate = 0.015; // 1.5%
  const bulletInterest = Math.round(requestedAmount * bulletMonthlyRate);
  const bulletTotalPayable = requestedAmount + bulletInterest;

  // EMI Calculation (Reducing Balance)
  const monthlyRate = (annualRoi / 100) / 12;
  const n = dynamicTenure;
  const emiNumerator = requestedAmount * monthlyRate * Math.pow(1 + monthlyRate, n);
  const emiDenominator = Math.pow(1 + monthlyRate, n) - 1;
  const monthlyEmi = Math.round(emiNumerator / emiDenominator);
  const emiTotalPayable = monthlyEmi * n;
  const emiTotalInterest = emiTotalPayable - requestedAmount;

  const handleConfirmOffer = () => {
    const isBullet = selectedOfferType === "BULLET";
    const chosenPlan = {
      title: isBullet ? "Single Bullet Repayment" : `${dynamicTenure}-Month EMI Plan`,
      selectedOfferType,
      principal: requestedAmount,
      tenureMonths: isBullet ? 1 : dynamicTenure,
      interestRate: isBullet ? 1.5 : annualRoi,
      interest: isBullet ? bulletInterest : emiTotalInterest,
      processingFee,
      gst,
      netDisbursal,
      totalPayable: isBullet ? bulletTotalPayable : emiTotalPayable,
      monthlyEmi: isBullet ? bulletTotalPayable : monthlyEmi,
      matchedLender: "OxyLoans Certified Escrow Lending Pool #41682",
    };
    onOfferSelected(chosenPlan);
  };

  return (
    <div className="fintech-card">
      {/* Step Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge badge-fintech-success-soft px-3 py-1 rounded-pill small">
              Phase 4 • Dynamic Loan Offers & Repayment Modeling
            </span>
            <span className="badge badge-fintech-neutral px-2 py-1 rounded-pill small">
              Step 4 of 6
            </span>
          </div>
          <h4 className="fw-bold text-dark mb-1">Select Your Preferred Loan Structure</h4>
          <p className="text-muted small mb-0">
            Tailored according to your verified CIR Score of <strong>{creditScore} (Prime+)</strong> and monthly salary of {formatINR(salary)}.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="btn btn-sm btn-outline-secondary rounded-3 px-3"
        >
          <i className="fa-solid fa-arrow-left me-1"></i> Back to Bureau Check
        </button>
      </div>

      {/* Interactive Loan Amount Customizer Slider */}
      <div className="p-4 rounded-4 bg-light border mb-4 shadow-xs">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <span className="text-muted small fw-bold text-uppercase letter-spacing-1">
              Select Desired Loan Amount
            </span>
            <div className="d-flex align-items-baseline gap-2 mt-1">
              <h2 className="fw-bold text-primary mb-0">{formatINR(requestedAmount)}</h2>
              <span className="badge badge-fintech-primary-soft small">
                Pre-Approved Cap: {formatINR(maxCap)}
              </span>
            </div>
          </div>

          {/* Quick preset chips */}
          <div className="d-flex align-items-center gap-2">
            {[25000, 35000, 45000, maxCap].map((amt) => (
              <button
                key={amt}
                type="button"
                className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold ${
                  requestedAmount === amt
                    ? "btn-primary"
                    : "btn-outline-secondary bg-white"
                }`}
                onClick={() => setRequestedAmount(amt)}
              >
                {amt === maxCap ? `Max (${formatINR(amt)})` : formatINR(amt)}
              </button>
            ))}
          </div>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min={10000}
          max={maxCap}
          step={1000}
          value={requestedAmount}
          onChange={(e) => setRequestedAmount(Number(e.target.value))}
          className="fintech-slider mb-2"
        />

        <div className="d-flex justify-content-between text-muted small" style={{ fontSize: "11px" }}>
          <span>Min: ₹10,000</span>
          <span>Matched P2P Escrow Pool: OxyLoans Escrow #41682</span>
          <span>Max Cap: {formatINR(maxCap)}</span>
        </div>
      </div>

      {/* Two Offer Tier Cards Side by Side */}
      <div className="row g-4 mb-4">
        {/* OFFER 1: One-Time Bullet Repayment */}
        <div className="col-lg-6">
          <div
            className={`offer-tier-card h-100 ${
              selectedOfferType === "BULLET" ? "offer-tier-card-selected" : ""
            }`}
            onClick={() => setSelectedOfferType("BULLET")}
          >
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <span className="badge badge-fintech-neutral px-3 py-1 rounded-pill small mb-2">
                  Option 1 • Single Bullet Repayment
                </span>
                <h5 className="fw-bold text-dark mb-0">30-Day Payday Settlement</h5>
              </div>
              <input
                type="radio"
                name="offerSelection"
                checked={selectedOfferType === "BULLET"}
                onChange={() => setSelectedOfferType("BULLET")}
                className="form-check-input fs-5"
              />
            </div>

            <p className="text-muted small mb-3" style={{ fontSize: "12px", minHeight: "36px" }}>
              Pay back in full after 30 days on your next salary credit. Zero recurring monthly EMI commitments.
            </p>

            <div className="p-3 bg-light rounded-4 border mb-3">
              <div className="d-flex justify-content-between align-items-baseline mb-2">
                <span className="text-muted small">Sanctioned Principal</span>
                <h4 className="fw-bold text-dark mb-0">{formatINR(requestedAmount)}</h4>
              </div>

              <div className="d-flex justify-content-between text-muted small mb-2">
                <span>Repayment Tenure</span>
                <span className="fw-semibold text-dark">30 Days (Single Bullet)</span>
              </div>

              <div className="d-flex justify-content-between text-muted small mb-2">
                <span>Flat Monthly Interest (1.5%/mo)</span>
                <span className="fw-semibold text-dark">{formatINR(bulletInterest)}</span>
              </div>

              <div className="d-flex justify-content-between text-muted small mb-2">
                <span>Platform & Origination Fee (2.5% + GST)</span>
                <span className="fw-semibold text-dark">{formatINR(processingFee + gst)}</span>
              </div>

              <div className="d-flex justify-content-between text-muted small border-top pt-2 mt-2">
                <span>Net Disbursal in Bank Account</span>
                <strong className="text-success fs-6">{formatINR(netDisbursal)}</strong>
              </div>
            </div>

            <div className="p-3 bg-primary bg-opacity-10 rounded-3 d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small d-block">Total Due on Day 30</span>
                <span className="badge badge-fintech-primary rounded-pill small" style={{ fontSize: "10px" }}>
                  Zero Ongoing EMIs
                </span>
              </div>
              <h4 className="fw-bold text-primary mb-0">{formatINR(bulletTotalPayable)}</h4>
            </div>
          </div>
        </div>

        {/* OFFER 2: Dynamic 3-Month EMI Plan (Recommended) */}
        <div className="col-lg-6">
          <div
            className={`offer-tier-card h-100 ${
              selectedOfferType === "EMI" ? "offer-tier-card-selected" : ""
            }`}
            onClick={() => setSelectedOfferType("EMI")}
          >
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <span className="badge badge-fintech-success px-3 py-1 rounded-pill small mb-2">
                  <i className="fa-solid fa-star me-1"></i> Recommended • Split in EMIs
                </span>
                <h5 className="fw-bold text-dark mb-0">{dynamicTenure}-Month Dynamic EMI Plan</h5>
              </div>
              <input
                type="radio"
                name="offerSelection"
                checked={selectedOfferType === "EMI"}
                onChange={() => setSelectedOfferType("EMI")}
                className="form-check-input fs-5"
              />
            </div>

            <p className="text-muted small mb-2" style={{ fontSize: "12px" }}>
              Spread your repayments comfortably over multiple months with reducing balance interest.
            </p>

            {/* Dynamic Tenure Selector */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <span className="text-muted small fw-semibold">Select Tenure:</span>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 ${
                  dynamicTenure === 3 ? "btn-primary" : "btn-outline-secondary bg-white"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setDynamicTenure(3);
                }}
              >
                3 Months (Fast)
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 ${
                  dynamicTenure === 6 ? "btn-primary" : "btn-outline-secondary bg-white"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setDynamicTenure(6);
                }}
              >
                6 Months (Lowest EMI)
              </button>
            </div>

            <div className="p-3 bg-light rounded-4 border mb-3">
              <div className="d-flex justify-content-between align-items-baseline mb-2">
                <span className="text-muted small">Sanctioned Principal</span>
                <h4 className="fw-bold text-dark mb-0">{formatINR(requestedAmount)}</h4>
              </div>

              <div className="d-flex justify-content-between text-muted small mb-2">
                <span>Annual ROI (Prime+ Tier)</span>
                <span className="fw-semibold text-dark">{annualRoi}% p.a. (Reducing)</span>
              </div>

              <div className="d-flex justify-content-between text-muted small mb-2">
                <span>Total Interest ({dynamicTenure} Mos)</span>
                <span className="fw-semibold text-dark">{formatINR(emiTotalInterest)}</span>
              </div>

              <div className="d-flex justify-content-between text-muted small mb-2">
                <span>Platform & Origination Fee (2.5% + GST)</span>
                <span className="fw-semibold text-dark">{formatINR(processingFee + gst)}</span>
              </div>

              <div className="d-flex justify-content-between text-muted small border-top pt-2 mt-2">
                <span>Net Disbursal in Bank Account</span>
                <strong className="text-success fs-6">{formatINR(netDisbursal)}</strong>
              </div>
            </div>

            <div className="p-3 bg-success bg-opacity-10 rounded-3 d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small d-block">Monthly EMI Amount</span>
                <span className="badge badge-fintech-success rounded-pill small" style={{ fontSize: "10px" }}>
                  {dynamicTenure} Equal Monthly Payments
                </span>
              </div>
              <h4 className="fw-bold text-success mb-0">{formatINR(monthlyEmi)} / mo</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Matched Lender & Regulatory Disclosure Strip */}
      <div className="p-3 rounded-4 bg-white border mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3 shadow-xs">
        <div className="d-flex align-items-center gap-3">
          <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: "42px", height: "42px" }}>
            <i className="fa-solid fa-building-shield fs-5"></i>
          </div>
          <div>
            <strong className="text-dark small d-block">
              Matched P2P Escrow Pool: OxyLoans Escrow #41682
            </strong>
            <span className="text-muted small" style={{ fontSize: "11px" }}>
              Escrow Account Managed under RBI P2P Guidelines • 100% Capital Committed
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-outline-primary rounded-pill px-3"
          onClick={() => setShowKfsModal(true)}
        >
          <i className="fa-solid fa-file-contract me-1"></i> View Key Fact Statement (KFS)
        </button>
      </div>

      {/* KFS Modal Sheet */}
      {showKfsModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 p-3">
              <div className="modal-header border-0 pb-0">
                <div>
                  <h5 className="modal-title fw-bold text-dark">Key Fact Statement (KFS)</h5>
                  <span className="text-muted small">RBI Mandatory Digital Lending Disclosure</span>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowKfsModal(false)}></button>
              </div>

              <div className="modal-body small">
                <table className="table table-bordered mb-0">
                  <tbody>
                    <tr>
                      <td className="text-muted">Loan Principal</td>
                      <td className="fw-bold text-end">{formatINR(requestedAmount)}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Annual Percentage Rate (APR)</td>
                      <td className="fw-bold text-end">{annualRoi}% p.a.</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Net Disbursed Amount</td>
                      <td className="fw-bold text-success text-end">{formatINR(netDisbursal)}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Origination & Processing Fee</td>
                      <td className="fw-bold text-end">{formatINR(processingFee)} (+ ₹{gst} GST)</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Prepayment / Foreclosure Fee</td>
                      <td className="fw-bold text-success text-end">₹ 0 (Nil)</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Escrow Account Trustee</td>
                      <td className="fw-bold text-end">ICICI Bank Escrow Pool #41682</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-primary rounded-3 w-100 fw-bold" onClick={() => setShowKfsModal(false)}>
                  I Acknowledge KFS Disclosures
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-3 border-top">
        <div>
          <span className="text-muted small d-block">Selected Repayment Plan</span>
          <strong className="text-dark">
            {selectedOfferType === "BULLET"
              ? `Single Bullet Settlement (${formatINR(bulletTotalPayable)} on Day 30)`
              : `${dynamicTenure}-Month Plan (${formatINR(monthlyEmi)} / month)`}
          </strong>
        </div>

        <button
          type="button"
          onClick={handleConfirmOffer}
          className="btn btn-primary px-4 py-3 rounded-3 fw-bold text-white shadow-sm"
          style={{ backgroundColor: "#0040e0", borderColor: "#0040e0" }}
        >
          Confirm Offer & Proceed to eSign / eNACH
          <i className="fa-solid fa-arrow-right ms-2"></i>
        </button>
      </div>
    </div>
  );
};

export default InstantLoanStepOfferSelection;
