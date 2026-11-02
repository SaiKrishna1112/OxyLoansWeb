# -*- coding: utf-8 -*-
file_path = 'src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Locate Section 3 and Bottom Sticky bar
sec3_marker = '{/* 5. Numbered Circle 3: Lender Offers for Your Selected Plan */}'
sec4_marker = '{/* 6. Bottom Sticky Summary & CTA Bar */}'
end_marker = '{/* 12. Monthly Amortization Schedule Modal */}'

s3_idx = content.find(sec3_marker)
s4_idx = content.find(sec4_marker)
end_idx = content.find(end_marker)

if s3_idx == -1 or s4_idx == -1 or end_idx == -1:
    print("Markers not found:", s3_idx, s4_idx, end_idx)
    exit(1)

new_sec3_and_cta = '''{/* 5. Numbered Circle 3: Lender Offers for Your Selected Plan (When offers are received) */}
      {hasLenderOffers ? (
        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}>
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold shadow-xs"
                  style={{ width: "32px", height: "32px", minWidth: "32px", backgroundColor: "#0040e0", fontSize: "15px" }}
                >
                  3
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-0 fs-6">
                    Loan Offers Received from Lenders
                  </h6>
                  <span className="text-secondary small d-block" style={{ fontSize: "12px" }}>
                    Verified lenders competing to finance your loan. Choose the best offer based on interest rate, total cost, and terms.
                  </span>
                </div>
              </div>

              <div className="form-check form-check-inline d-flex align-items-center gap-2 m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="onlyRbiRegulatedCheckbox"
                  checked={onlyRbiRegulated}
                  onChange={(e) => setOnlyRbiRegulated(e.target.checked)}
                  style={{ cursor: "pointer", borderColor: "#0040e0" }}
                />
                <label className="form-check-label text-secondary small fw-medium" htmlFor="onlyRbiRegulatedCheckbox" style={{ cursor: "pointer", fontSize: "12px" }}>
                  Show only RBI regulated lenders
                </label>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive rounded-3 border" style={{ borderColor: "#edf2f7" }}>
              <table className="table table-hover align-middle mb-0" style={{ fontSize: "12.5px" }}>
                <thead style={{ backgroundColor: "#f8fafc", color: "#64748b", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <tr>
                    <th className="py-2.5 px-3 border-0">#</th>
                    <th className="py-2.5 px-3 border-0">Lender</th>
                    <th className="py-2.5 px-3 border-0">Interest Rate</th>
                    <th className="py-2.5 px-3 border-0">Monthly EMI</th>
                    <th className="py-2.5 px-3 border-0">Total Repayment</th>
                    <th className="py-2.5 px-3 border-0">Processing Fee</th>
                    <th className="py-2.5 px-3 border-0">Tenure</th>
                    <th className="py-2.5 px-3 border-0 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lenderList.map((lender, idx) => (
                    <tr key={lender.id || idx} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td className="py-3 px-3 text-secondary">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle text-white shadow-xs"
                            style={{ width: "28px", height: "28px", minWidth: "28px", backgroundColor: lender.logoBg, fontSize: "11px" }}
                          >
                            <i className={lender.icon}></i>
                          </div>
                          <div>
                            <strong className="text-dark d-block" style={{ fontSize: "13px" }}>{lender.name}</strong>
                            <span
                              className="badge px-2 py-0.5 rounded-pill fw-semibold"
                              style={{
                                fontSize: "10px",
                                backgroundColor: lender.badgeBg,
                                color: lender.badgeColor,
                                border: `1px solid ${lender.badgeBorder}`,
                              }}
                            >
                              <i className="fa-solid fa-circle-check me-1"></i> {lender.badgeText}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <strong className="text-success fw-bold">{lender.roi}% p.a.</strong>
                      </td>
                      <td className="py-3 px-3 fw-bold text-dark">
                        {formatINR(lender.emi)}
                      </td>
                      <td className="py-3 px-3 fw-semibold text-dark">
                        {formatINR(lender.totalRepayment)}
                      </td>
                      <td className="py-3 px-3 text-secondary">
                        {formatINR(lender.processingFee)}
                      </td>
                      <td className="py-3 px-3 text-secondary">
                        {lender.tenureText}
                      </td>
                      <td className="py-3 px-3 text-end">
                        {acceptedOffer && acceptedOffer.lenderId === lender.id ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (onProceedToEsign) onProceedToEsign(acceptedOffer);
                              else if (onOfferSelected) onOfferSelected(acceptedOffer);
                            }}
                            className="btn btn-sm btn-warning text-dark fw-bold rounded-pill px-3 py-1.5 shadow-xs d-inline-flex align-items-center gap-1.5"
                            style={{ fontSize: "11.5px" }}
                          >
                            <i className="fa-solid fa-signature"></i>
                            <span>eSign Agreement</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSelectLenderOffer(lender)}
                            className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 fw-bold shadow-xs d-inline-flex align-items-center gap-1.5"
                            style={{
                              backgroundColor: "#0040e0",
                              borderColor: "#0040e0",
                              fontSize: "11.5px",
                            }}
                          >
                            Select Offer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (hasSubmittedLoanRequest || activeLoanRequest) ? (
        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}>
          <div className="card-body p-4 text-center">
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{ width: "48px", height: "48px", backgroundColor: "#eff6ff", color: "#0040e0" }}
            >
              <i className="fa-solid fa-hourglass-half fs-5"></i>
            </div>
            <h6 className="fw-bold text-dark mb-1">
              Loan Request Active • Waiting for Lender Offers
            </h6>
            <p className="text-secondary small mb-3 mx-auto" style={{ maxWidth: "560px", fontSize: "12.5px" }}>
              Your loan requirement of <strong>{formatINR(requestedAmount)}</strong> has been published to verified lenders in the OxyLoans marketplace. When a lender accepts and gives an offer, it will appear here instantly.
            </p>
            <div>
              <button
                type="button"
                onClick={fetchLoansInitiated}
                className="btn btn-sm btn-outline-primary rounded-pill px-3.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-2"
                style={{ fontSize: "12px", borderColor: "#0040e0", color: "#0040e0" }}
              >
                <i className="fa-solid fa-arrows-rotate"></i>
                <span>Refresh Offers</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* 6. Bottom Sticky Summary & CTA Bar */}
      <div
        className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4"
        style={{
          border: "1.5px solid #e2e8f0",
          backgroundColor: "#ffffff",
        }}
      >
        <div className="card-body p-3.5">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            {/* Left: Selected Plan summary */}
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 text-primary shadow-2xs"
                style={{ width: "42px", height: "42px", minWidth: "42px" }}
              >
                <i className="fa-solid fa-file-invoice-dollar fs-5"></i>
              </div>
              <div>
                <span className="text-muted small d-block" style={{ fontSize: "11px", fontWeight: "600" }}>Selected Plan</span>
                <strong className="text-dark fs-6 d-block mb-0.5">
                  {selectedOfferType === "EMI" ? "3-Month EMI Plan" : "30-Day Payday Bullet"} • {formatINR(requestedAmount)}
                </strong>
                <span className="text-muted small" style={{ fontSize: "11px" }}>
                  {selectedOfferType === "EMI"
                    ? `${formatINR(option3M.emi)}/mo • ${formatINR(option3M.totalPayable)} total • 16.5% p.a.`
                    : `${formatINR(optionPayday.totalPayable)} single payment • 15.6% p.a.`}
                </span>
              </div>
            </div>

            {/* Center: Action Button */}
            <div>
              {acceptedOffer ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onProceedToEsign) onProceedToEsign(acceptedOffer);
                    else if (onOfferSelected) onOfferSelected(acceptedOffer);
                  }}
                  className="btn btn-primary px-4 py-2 rounded-pill fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2"
                  style={{
                    backgroundColor: "#0040e0",
                    borderColor: "#0040e0",
                    minWidth: "270px",
                    boxShadow: "0 4px 14px rgba(0, 64, 224, 0.3)",
                  }}
                >
                  <i className="fa-solid fa-signature" style={{ fontSize: "14px" }}></i>
                  <div className="text-center" style={{ lineHeight: "1.2" }}>
                    <div style={{ fontSize: "13.5px", fontWeight: "700" }}>Proceed to Step 6: eSign</div>
                    <div style={{ fontSize: "11px", fontWeight: "500", opacity: "0.9" }}>Digital Agreement & eNACH</div>
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRaiseLoanRequest}
                  disabled={isSubmittingLoanRequest}
                  className="btn btn-primary px-4 py-2 rounded-pill fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2"
                  style={{
                    backgroundColor: "#0040e0",
                    borderColor: "#0040e0",
                    minWidth: "270px",
                    boxShadow: "0 4px 14px rgba(0, 64, 224, 0.3)",
                  }}
                >
                  {isSubmittingLoanRequest ? (
                    <><i className="fa-solid fa-spinner fa-spin me-1.5"></i> Submitting Request...</>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane" style={{ transform: "rotate(-15deg)", fontSize: "14px" }}></i>
                      <div className="text-center" style={{ lineHeight: "1.2" }}>
                        <div style={{ fontSize: "13.5px", fontWeight: "700" }}>Raise a Request ({formatINR(requestedAmount)})</div>
                        <div style={{ fontSize: "11px", fontWeight: "500", opacity: "0.9" }}>to View Final Offers</div>
                      </div>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Right: 3 Trust Badges */}
            <div className="d-flex align-items-center gap-3 text-secondary small">
              <div className="d-flex align-items-center gap-1.5">
                <i className="fa-solid fa-shield-halved text-primary" style={{ fontSize: "14px" }}></i>
                <div style={{ lineHeight: "1.2" }}>
                  <span className="d-block fw-bold text-dark" style={{ fontSize: "11px" }}>100% RBI</span>
                  <span className="text-muted" style={{ fontSize: "10px" }}>Compliant</span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-1.5">
                <i className="fa-solid fa-percent text-primary" style={{ fontSize: "14px" }}></i>
                <div style={{ lineHeight: "1.2" }}>
                  <span className="d-block fw-bold text-dark" style={{ fontSize: "11px" }}>Zero Upfront</span>
                  <span className="text-muted" style={{ fontSize: "10px" }}>Charges</span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-1.5">
                <i className="fa-solid fa-lock text-primary" style={{ fontSize: "14px" }}></i>
                <div style={{ lineHeight: "1.2" }}>
                  <span className="d-block fw-bold text-dark" style={{ fontSize: "11px" }}>Secure &</span>
                  <span className="text-muted" style={{ fontSize: "10px" }}>Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

'''

new_content = content[:s3_idx] + new_sec3_and_cta + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated Section 3 and Bottom CTA cleanly!")
