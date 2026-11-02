import sys

file_path = r"E:\Oxyloans\Oxyloans web\OxyloansReact\src\components\pages\Oxyloans\Borrower\redesign\components\instantLoan\InstantLoanStepOfferSelection.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "      {/* Optional: Deep Customizer Studio & Advanced Underwriting Telemetry */}"
end_marker = "      {/* 12. Monthly Amortization Schedule Modal */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1:
    print("ERROR: start_marker not found")
    sys.exit(1)

if end_idx == -1:
    print("ERROR: end_marker not found")
    sys.exit(1)

replacement = """      {/* 5. Numbered Circle 3: Lender Offers for Your Selected Plan */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2.5">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold shadow-xs"
                style={{ width: "32px", height: "32px", minWidth: "32px", backgroundColor: "#0040e0", fontSize: "15px" }}
              >
                3
              </div>
              <div>
                <h6 className="fw-bold text-dark mb-0 fs-6">
                  Lender Offers for Your Selected Plan
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
              <label
                className="form-check-label small fw-semibold text-dark"
                htmlFor="onlyRbiRegulatedCheckbox"
                style={{ cursor: "pointer", fontSize: "12px" }}
              >
                Show only RBI regulated lenders
              </label>
            </div>
          </div>

          {/* Clean Lender Offers Table */}
          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ fontSize: "12.5px" }}>
              <thead style={{ backgroundColor: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
                <tr className="text-secondary small" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  <th className="py-2.5 px-3 text-center" style={{ width: "40px" }}>#</th>
                  <th className="py-2.5 px-3">Lender</th>
                  <th className="py-2.5 px-3">Interest Rate</th>
                  <th className="py-2.5 px-3">Monthly EMI</th>
                  <th className="py-2.5 px-3">Total Repayment</th>
                  <th className="py-2.5 px-3">Processing Fee</th>
                  <th className="py-2.5 px-3">Tenure</th>
                  <th className="py-2.5 px-3 text-end" style={{ width: "130px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {lenderList.map((lender, idx) => (
                  <tr key={lender.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td className="text-center text-muted fw-bold py-3 px-3">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle text-white shadow-2xs"
                          style={{
                            width: "28px",
                            height: "28px",
                            backgroundColor: lender.logoBg,
                            fontSize: "12px",
                            fontWeight: "700",
                          }}
                        >
                          <i className={lender.icon}></i>
                        </div>
                        <span className="fw-bold text-dark">{lender.name}</span>
                        <span
                          className="badge rounded-pill px-2 py-0.5 fw-semibold"
                          style={{
                            backgroundColor: lender.badgeBg,
                            color: lender.badgeColor,
                            border: `1px solid ${lender.badgeBorder}`,
                            fontSize: "10.5px",
                          }}
                        >
                          <i className="fa-solid fa-check me-1" style={{ fontSize: "9px" }}></i>
                          {lender.badgeText}
                        </span>
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
                      <button
                        type="button"
                        onClick={() => handleSelectLenderOffer(lender)}
                        className="btn btn-sm btn-primary rounded-pill px-3 py-1.5 fw-bold shadow-xs"
                        style={{
                          backgroundColor: "#0040e0",
                          borderColor: "#0040e0",
                          fontSize: "11.5px",
                        }}
                      >
                        Select Offer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
            <div className="d-flex align-items-center gap-2.5">
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

            {/* Center: Blue Raise a Request Button */}
            <div>
              <button
                type="button"
                onClick={handleRaiseLoanRequest}
                disabled={isSubmittingLoanRequest}
                className="btn btn-primary px-4 py-2.5 rounded-pill fw-bold text-white shadow-sm d-flex align-items-center gap-2"
                style={{
                  backgroundColor: "#0040e0",
                  borderColor: "#0040e0",
                  fontSize: "13.5px",
                  boxShadow: "0 4px 14px rgba(0, 64, 224, 0.3)",
                }}
              >
                {isSubmittingLoanRequest ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i> Submitting Request...</>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane" style={{ transform: "rotate(-15deg)" }}></i>
                    <span>Raise a Request ({formatINR(requestedAmount)}) to View Final Offers</span>
                  </>
                )}
              </button>
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

"""

new_content = content[:start_idx] + replacement + content[end_idx:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("SUCCESS: file updated cleanly")
