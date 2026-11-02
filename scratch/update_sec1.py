# -*- coding: utf-8 -*-
file_path = 'src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Card 1 and Card 3 monospace
content = content.replace('Verified Inflow: <strong className="text-dark font-monospace">{formatINR(verifiedInflow)}</strong>', 'Verified Inflow: <strong className="text-dark fw-bold">{formatINR(verifiedInflow)}</strong>')
content = content.replace('Safe EMI Limit: <strong className="text-dark font-monospace">{formatINR(affordability.maxSafeNewEmi)}/mo</strong>', 'Safe EMI Limit: <strong className="text-dark fw-bold">{formatINR(affordability.maxSafeNewEmi)}/mo</strong>')
content = content.replace('Net Monthly Surplus: <strong className="text-dark font-monospace">{formatINR(surplus.monthlySurplus)}</strong>', 'Net Monthly Surplus: <strong className="text-dark fw-bold">{formatINR(surplus.monthlySurplus)}</strong>')
content = content.replace('Optimal Limit: <strong className="text-dark font-monospace">{formatINR(maxCap)}</strong>', 'Optimal Limit: <strong className="text-dark fw-bold">{formatINR(maxCap)}</strong>')
content = content.replace('<strong className="text-dark font-monospace">{formatINR(requestedAmount)}</strong>', '<strong className="text-dark fw-bold">{formatINR(requestedAmount)}</strong>')
content = content.replace('<strong className="text-dark font-monospace">{formatINR(maxCap)}</strong>', '<strong className="text-dark fw-bold">{formatINR(maxCap)}</strong>')

# 2. Find Section 1 markers
start_marker = '{/* 3. Numbered Circle 1: Select Your Preferred Repayment Plan */}'
end_marker = '{/* 4. Numbered Circle 2: Choose a Repayment Plan */}'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print('ERROR: markers not found!', start_idx, end_idx)
    exit(1)

new_sec1 = '''{/* 3. Numbered Circle 1: Select Your Preferred Repayment Plan */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2.5">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold shadow-xs"
                style={{ width: "30px", height: "30px", minWidth: "30px", backgroundColor: "#0040e0", fontSize: "14px" }}
              >
                1
              </div>
              <div>
                <h6 className="fw-bold text-dark mb-0 fs-6">
                  Select Your Preferred Repayment Plan
                </h6>
                <span className="text-secondary small d-block" style={{ fontSize: "12px" }}>
                  Choose how you want to repay your loan of <strong className="text-dark">{formatINR(requestedAmount)}</strong>
                </span>
              </div>
            </div>

            <span className="badge rounded-pill px-3 py-1.5 fw-semibold text-secondary bg-white border shadow-2xs" style={{ fontSize: "11px", borderColor: "#e2e8f0" }}>
              <i className="fa-regular fa-calendar-check text-primary me-1.5"></i> Available Tenures: 30 Days, 3 Months, 6 Months
            </span>
          </div>

          {/* Interactive Desired Loan Amount & Live EMI Calibrator Bar (Seamless, unboxed) */}
          <div id="loan-amount-calibrator" className="pt-2 pb-1">
            <div className="row align-items-center g-3 g-lg-4">
              {/* Stepper on left */}
              <div className="col-12 col-md-4 col-lg-3">
                <span className="text-secondary small d-block mb-1.5" style={{ fontSize: "12px", fontWeight: "600" }}>Loan Amount</span>
                <div className="d-flex align-items-center gap-2.5">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => handleStepAmount(-1000)}
                    disabled={requestedAmount <= minCap}
                    title="Decrease amount by ₹1,000"
                    style={{
                      width: "34px",
                      height: "34px",
                      minWidth: "34px",
                      borderRadius: "50%",
                      border: "1.5px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#334155",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: requestedAmount <= minCap ? "not-allowed" : "pointer",
                      opacity: requestedAmount <= minCap ? 0.35 : 1,
                      transition: "all 0.18s ease",
                    }}
                  >
                    <i className="fa-solid fa-minus" style={{ fontSize: "11px" }}></i>
                  </button>

                  <span
                    style={{
                      fontSize: "28px",
                      fontWeight: "800",
                      color: "#0040e0",
                      letterSpacing: "-0.6px",
                      lineHeight: "1",
                      minWidth: "120px",
                      textAlign: "center",
                      display: "inline-block",
                      userSelect: "none",
                    }}
                  >
                    {formatINR(requestedAmount)}
                  </span>

                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => handleStepAmount(1000)}
                    disabled={requestedAmount >= maxCap}
                    title="Increase amount by ₹1,000"
                    style={{
                      width: "34px",
                      height: "34px",
                      minWidth: "34px",
                      borderRadius: "50%",
                      border: "1.5px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#334155",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: requestedAmount >= maxCap ? "not-allowed" : "pointer",
                      opacity: requestedAmount >= maxCap ? 0.35 : 1,
                      transition: "all 0.18s ease",
                    }}
                  >
                    <i className="fa-solid fa-plus" style={{ fontSize: "11px" }}></i>
                  </button>
                </div>
              </div>

              {/* Slider in center */}
              <div className="col-12 col-md-4 col-lg-5">
                <div className="px-1">
                  <input
                    type="range"
                    className="fintech-slider w-100"
                    min={minCap}
                    max={maxCap}
                    step={1000}
                    value={requestedAmount}
                    style={{
                      background: `linear-gradient(to right, #0040e0 0%, #0040e0 ${Math.max(0, Math.min(100, Math.round(((requestedAmount - minCap) / (maxCap - minCap || 1)) * 100)))}%, #e2e8f0 ${Math.max(0, Math.min(100, Math.round(((requestedAmount - minCap) / (maxCap - minCap || 1)) * 100)))}%, #e2e8f0 100%)`
                    }}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setRequestedAmount(val);
                      setTempAmountInput(val);
                    }}
                  />
                  <div className="d-flex justify-content-between text-secondary mt-2 fw-semibold" style={{ fontSize: "11.5px" }}>
                    <span>Min - {formatINR(minCap)}</span>
                    <span>Max - {formatINR(maxCap)}</span>
                  </div>
                </div>
              </div>

              {/* Badges and live notice on right */}
              <div className="col-12 col-md-4 col-lg-4 text-md-end">
                <div className="d-flex align-items-center justify-content-md-end gap-1.5 mb-1.5 flex-wrap">
                  <span className="badge rounded-pill px-3 py-1.5 fw-bold text-white shadow-xs" style={{ backgroundColor: "#0040e0", fontSize: "11.5px" }}>
                    Desired Loan Amount
                  </span>
                  <span className="badge rounded-pill px-3 py-1.5 fw-semibold text-secondary bg-white border shadow-2xs" style={{ fontSize: "11.5px", borderColor: "#e2e8f0" }}>
                    Live EMI Recalculation
                  </span>
                  <i className="fa-solid fa-circle-info text-muted ms-1" style={{ fontSize: "13px" }} title="EMI recalculates live as you change loan amount"></i>
                </div>
                <span className="text-secondary small d-block" style={{ fontSize: "12px" }}>
                  Adjust borrowing amount to instantly see your EMI and lender offers.
                </span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="d-flex flex-wrap align-items-center gap-2 pt-3 mt-3 border-top" style={{ borderColor: "#f1f5f9" }}>
              {[5000, 8000, 10000, 12000, 15000, 20000, 25000, maxCap].map((amt) => {
                const isSelected = requestedAmount === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    className={`preset-chip-btn ${isSelected ? "active" : ""}`}
                    style={{
                      padding: "5px 16px",
                      borderRadius: "9999px",
                      fontSize: "12px",
                      fontWeight: isSelected ? "700" : "600",
                      backgroundColor: isSelected ? "#0040e0" : "#ffffff",
                      color: isSelected ? "#ffffff" : "#334155",
                      border: isSelected ? "1.5px solid #0040e0" : "1.5px solid #e2e8f0",
                      cursor: "pointer",
                      boxShadow: isSelected ? "0 3px 10px rgba(0, 64, 224, 0.28)" : "0 1px 2px rgba(0, 0, 0, 0.03)",
                      transition: "all 0.18s ease",
                    }}
                    onClick={() => {
                      setRequestedAmount(amt);
                      setTempAmountInput(amt);
                    }}
                  >
                    {formatINR(amt)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      '''

content = content[:start_idx] + new_sec1 + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Section 1 updated successfully!')
