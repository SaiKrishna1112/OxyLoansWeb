import sys

file_path = r"E:\Oxyloans\Oxyloans web\OxyloansReact\src\components\pages\Oxyloans\Borrower\redesign\components\instantLoan\InstantLoanStepOfferSelection.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

start_marker = "      {/* 2. Top 3 Summary Cards */}"
end_marker = "      {/* 12. Monthly Amortization Schedule Modal */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1:
    print("ERROR: start_marker not found")
    sys.exit(1)

if end_idx == -1:
    print("ERROR: end_marker not found")
    sys.exit(1)

replacement = """      {/* 2. Top 3 Summary Cards */}
      <div className="row g-3 mb-4">
        {/* Card 1: Underwriting Verified */}
        <div className="col-12 col-lg-4">
          <div
            className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden"
            style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}
          >
            <div className="card-body p-3.5 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center gap-2.5 mb-2.5">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle text-primary"
                    style={{ width: "36px", height: "36px", minWidth: "36px", backgroundColor: "#eff6ff" }}
                  >
                    <i className="fa-solid fa-calculator fs-6"></i>
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "14px" }}>
                      Underwriting Verified
                    </h6>
                    <span
                      className="badge rounded-pill px-2 py-0.5 mt-0.5 fw-semibold"
                      style={{ backgroundColor: "rgba(0, 64, 224, 0.08)", color: "#0040e0", fontSize: "10.5px" }}
                    >
                      Prime+ Tier (16.5% p.a)
                    </span>
                  </div>
                </div>

                <div className="row g-2" style={{ fontSize: "11.5px" }}>
                  <div className="col-6">
                    <span className="text-secondary d-flex align-items-center gap-1.5">
                      <i className="fa-solid fa-check text-success" style={{ fontSize: "11px" }}></i>
                      <span>Verified Inflow: <strong className="text-dark font-monospace">{formatINR(verifiedInflow)}</strong></span>
                    </span>
                  </div>
                  <div className="col-6">
                    <span className="text-secondary d-flex align-items-center gap-1.5">
                      <i className="fa-solid fa-check text-success" style={{ fontSize: "11px" }}></i>
                      <span>Safe EMI Limit: <strong className="text-dark font-monospace">{formatINR(affordability.maxSafeNewEmi)}/mo</strong></span>
                    </span>
                  </div>
                  <div className="col-6">
                    <span className="text-secondary d-flex align-items-center gap-1.5">
                      <i className="fa-solid fa-check text-success" style={{ fontSize: "11px" }}></i>
                      <span>Net Monthly Surplus: <strong className="text-dark font-monospace">{formatINR(surplus.monthlySurplus)}</strong></span>
                    </span>
                  </div>
                  <div className="col-6">
                    <span className="text-secondary d-flex align-items-center gap-1.5">
                      <i className="fa-solid fa-check text-success" style={{ fontSize: "11px" }}></i>
                      <span>Optimal Limit: <strong className="text-dark font-monospace">{formatINR(maxCap)}</strong></span>
                    </span>
                  </div>
                  <div className="col-12 mt-1">
                    <span className="text-secondary d-flex align-items-center gap-1.5">
                      <i className="fa-solid fa-check text-success" style={{ fontSize: "11px" }}></i>
                      <span>0% Prepayment Penalty</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Credit Health */}
        <div className="col-12 col-lg-4">
          <div
            className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden"
            style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}
          >
            <div className="card-body p-3.5 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center gap-2.5 mb-1.5">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-circle text-success"
                    style={{ width: "36px", height: "36px", minWidth: "36px", backgroundColor: "#ecfdf5" }}
                  >
                    <i className="fa-solid fa-clock-rotate-left fs-6"></i>
                  </div>
                  <div className="d-flex align-items-center justify-content-between flex-grow-1">
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "14px" }}>
                      Credit Health
                    </h6>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between mb-1.5">
                  <h3 className="fw-extrabold text-dark mb-0" style={{ fontSize: "26px", letterSpacing: "-0.5px" }}>
                    {creditScore}
                  </h3>
                  <span
                    className="badge rounded-pill px-2.5 py-1 fw-bold"
                    style={{ backgroundColor: "#dcfce7", color: "#15803d", fontSize: "11px" }}
                  >
                    Excellent
                  </span>
                </div>

                <div className="progress rounded-pill mb-2.5" style={{ height: "6px", backgroundColor: "#f1f5f9" }}>
                  <div
                    className="progress-bar rounded-pill"
                    role="progressbar"
                    style={{ width: "90%", backgroundColor: "#10b981" }}
                  />
                </div>

                <div className="row g-1.5" style={{ fontSize: "11px" }}>
                  <div className="col-6">
                    <span className="text-secondary d-flex align-items-center gap-1.5">
                      <i className="fa-solid fa-check text-success" style={{ fontSize: "11px" }}></i>
                      <span>Good repayment history</span>
                    </span>
                  </div>
                  <div className="col-6">
                    <span className="text-secondary d-flex align-items-center gap-1.5">
                      <i className="fa-solid fa-check text-success" style={{ fontSize: "11px" }}></i>
                      <span>No critical defaults</span>
                    </span>
                  </div>
                  <div className="col-6">
                    <span className="text-secondary d-flex align-items-center gap-1.5">
                      <i className="fa-solid fa-check text-success" style={{ fontSize: "11px" }}></i>
                      <span>Low credit utilisation</span>
                    </span>
                  </div>
                  <div className="col-6">
                    <span className="text-secondary d-flex align-items-center gap-1.5">
                      <i className="fa-solid fa-check text-success" style={{ fontSize: "11px" }}></i>
                      <span>Stable income profile</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Loan Summary */}
        <div className="col-12 col-lg-4">
          <div
            className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden"
            style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}
          >
            <div className="card-body p-3.5 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle text-primary"
                      style={{ width: "36px", height: "36px", minWidth: "36px", backgroundColor: "#eff6ff" }}
                    >
                      <i className="fa-solid fa-receipt fs-6"></i>
                    </div>
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "14px" }}>
                      Loan Summary
                    </h6>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary bg-white rounded-pill px-2.5 py-1 fw-semibold d-flex align-items-center gap-1 shadow-2xs"
                    style={{ fontSize: "11px", borderColor: "#bfdbfe" }}
                    onClick={() => setShowCalculationModal(true)}
                  >
                    <span>View Calculation Breakdown</span>
                    <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "10px" }}></i>
                  </button>
                </div>

                <div className="d-flex flex-column gap-1.5" style={{ fontSize: "11.5px" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">
                      <i className="fa-solid fa-user me-1 text-muted" style={{ fontSize: "10.5px" }}></i>
                      Requested Loan
                    </span>
                    <strong className="text-dark font-monospace">{formatINR(requestedAmount)}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">
                      <i className="fa-solid fa-landmark me-1 text-muted" style={{ fontSize: "10.5px" }}></i>
                      Recommended Limit
                    </span>
                    <strong className="text-dark font-monospace">{formatINR(maxCap)}</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">
                      <i className="fa-solid fa-shield-halved me-1 text-muted" style={{ fontSize: "10.5px" }}></i>
                      Processing Fee
                    </span>
                    <strong className="text-dark">3.0% + 18% GST</strong>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary">
                      <i className="fa-solid fa-clock me-1 text-muted" style={{ fontSize: "10.5px" }}></i>
                      Tenure Options
                    </span>
                    <strong className="text-dark">3 to 12 Months</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Numbered Circle 1: Select Your Preferred Repayment Plan */}
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

            <span className="badge rounded-pill px-3 py-1.5 fw-semibold text-secondary bg-white border shadow-2xs" style={{ fontSize: "11px" }}>
              <i className="fa-regular fa-calendar-check text-primary me-1.5"></i> Available Tenures: 30 Days, 3 Months, 6 Months
            </span>
          </div>

          {/* Interactive Desired Loan Amount & Live EMI Calibrator Bar */}
          <div
            id="loan-amount-calibrator"
            className="p-3.5 rounded-4 mb-2 border shadow-xs bg-white"
            style={{ border: "1.5px solid #e2e8f0" }}
          >
            <div className="row align-items-center g-3">
              {/* Stepper on left */}
              <div className="col-12 col-md-3">
                <span className="text-muted small d-block mb-1.5" style={{ fontSize: "11px", fontWeight: "600" }}>Loan Amount</span>
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="stepper-btn shadow-2xs"
                    onClick={() => handleStepAmount(-1000)}
                    disabled={requestedAmount <= minCap}
                    title="Decrease amount by ₹1,000"
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      border: "1.5px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#334155",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <i className="fa-solid fa-minus" style={{ fontSize: "11px" }}></i>
                  </button>

                  <span
                    className="fw-extrabold text-primary font-monospace text-center px-1"
                    style={{ fontSize: "24px", letterSpacing: "-0.5px", minWidth: "110px", display: "inline-block" }}
                  >
                    {formatINR(requestedAmount)}
                  </span>

                  <button
                    type="button"
                    className="stepper-btn shadow-2xs"
                    onClick={() => handleStepAmount(1000)}
                    disabled={requestedAmount >= maxCap}
                    title="Increase amount by ₹1,000"
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      border: "1.5px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#334155",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <i className="fa-solid fa-plus" style={{ fontSize: "11px" }}></i>
                  </button>
                </div>
              </div>

              {/* Slider in center */}
              <div className="col-12 col-md-5">
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
                  <div className="d-flex justify-content-between text-muted mt-1.5" style={{ fontSize: "11px" }}>
                    <span>Min - {formatINR(minCap)}</span>
                    <span>Max - {formatINR(maxCap)}</span>
                  </div>
                </div>
              </div>

              {/* Badges and live notice on right */}
              <div className="col-12 col-md-4 text-md-end">
                <div className="d-flex align-items-center justify-content-md-end gap-1.5 mb-1 flex-wrap">
                  <span className="badge rounded-pill px-3 py-1.5 fw-bold text-white shadow-xs" style={{ backgroundColor: "#0040e0", fontSize: "11px" }}>
                    Desired Loan Amount
                  </span>
                  <span className="badge rounded-pill px-2.5 py-1.5 fw-semibold text-secondary bg-white border shadow-2xs" style={{ fontSize: "11px" }}>
                    Live EMI Recalculation
                  </span>
                  <i className="fa-solid fa-circle-info text-muted ms-1" style={{ fontSize: "13px" }} title="EMI recalculates live as you change loan amount"></i>
                </div>
                <span className="text-secondary small d-block" style={{ fontSize: "11.5px" }}>
                  Adjust borrowing amount to instantly see your EMI and lender offers.
                </span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="d-flex flex-wrap align-items-center gap-2 pt-2.5 mt-2 border-top">
              {[5000, 8000, 10000, 12000, 15000, 20000, 25000, maxCap].map((amt) => {
                const isSelected = requestedAmount === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    style={{
                      padding: "4px 14px",
                      borderRadius: "9999px",
                      fontSize: "11.5px",
                      fontWeight: isSelected ? "700" : "600",
                      backgroundColor: isSelected ? "#0040e0" : "#ffffff",
                      color: isSelected ? "#ffffff" : "#334155",
                      border: isSelected ? "1px solid #0040e0" : "1px solid #cbd5e1",
                      cursor: "pointer",
                      boxShadow: isSelected ? "0 2px 8px rgba(0, 64, 224, 0.28)" : "none",
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

      {/* 4. Numbered Circle 2: Choose a Repayment Plan */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-2.5 mb-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold shadow-xs"
              style={{ width: "30px", height: "30px", minWidth: "30px", backgroundColor: "#0040e0", fontSize: "14px" }}
            >
              2
            </div>
            <div>
              <h6 className="fw-bold text-dark mb-0 fs-6">
                Choose a Repayment Plan
              </h6>
              <span className="text-secondary small d-block" style={{ fontSize: "12px" }}>
                Select a plan based on your monthly budget and repayment preference
              </span>
            </div>
          </div>

          <div className="row g-3">
            {/* Option A: 3-Month EMI Plan */}
            <div className="col-12 col-md-6">
              <div
                className={`repayment-plan-card ${selectedTenure === 3 && selectedOfferType === "EMI" ? "active" : ""}`}
                style={{
                  border: (selectedTenure === 3 && selectedOfferType === "EMI") ? "2px solid #0052ff" : "1.5px solid #e2e8f0",
                }}
                onClick={() => {
                  setSelectedTenure(3);
                  setSelectedOfferType("EMI");
                }}
              >
                <div>
                  {/* Header: Recommended badge & Selected indicator */}
                  <div className="d-flex justify-content-between align-items-center mb-2.5">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-10 text-primary"
                        style={{ width: "32px", height: "32px" }}
                      >
                        <i className="fa-solid fa-arrows-split-up-and-left fs-6"></i>
                      </div>
                      <span className="badge rounded-pill px-2.5 py-1 small fw-bold text-white" style={{ backgroundColor: "#10b981" }}>
                        Recommended
                      </span>
                    </div>

                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: "24px",
                        height: "24px",
                        backgroundColor: (selectedTenure === 3 && selectedOfferType === "EMI") ? "#0040e0" : "#ffffff",
                        border: (selectedTenure === 3 && selectedOfferType === "EMI") ? "none" : "2px solid #cbd5e1",
                        color: "#ffffff",
                      }}
                    >
                      {(selectedTenure === 3 && selectedOfferType === "EMI") ? <i className="fa-solid fa-check" style={{ fontSize: "11px" }}></i> : null}
                    </div>
                  </div>

                  {/* Title and installment badge */}
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <div>
                      <h5 className="fw-bold text-dark mb-0.5">3-Month Equal EMI</h5>
                      <span className="text-muted small" style={{ fontSize: "11.5px" }}>Lower monthly impact, easy to manage</span>
                    </div>
                    <span className="badge rounded-pill px-2.5 py-1 small fw-semibold" style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", fontSize: "11px" }}>
                      For 3 installments
                    </span>
                  </div>

                  {/* Big Installment Amount */}
                  <div className="d-flex align-items-baseline gap-1.5 mt-2 mb-1">
                    <h2 className="fw-extrabold text-primary mb-0" style={{ fontSize: "2rem", letterSpacing: "-0.5px" }}>
                      {formatINR(option3M.emi)}
                    </h2>
                    <span className="text-dark fw-bold small">/ month</span>
                  </div>

                  <span className="text-muted small d-block mb-3" style={{ fontSize: "11.5px" }}>
                    Calculated on loan of <strong className="text-dark">{formatINR(requestedAmount)}</strong>
                  </span>

                  {/* Cashflow & Surplus Advisory Box */}
                  <div
                    className="p-3 rounded-3 mb-3"
                    style={{
                      backgroundColor: "#fffdf5",
                      border: "1px solid #fde68a",
                    }}
                  >
                    <div className="d-flex align-items-center gap-1.5 fw-bold mb-1" style={{ color: "#92400e", fontSize: "12px" }}>
                      <i className="fa-solid fa-triangle-exclamation text-warning"></i>
                      <span>Cashflow & Surplus Advisory</span>
                    </div>
                    <div style={{ fontSize: "11.5px", lineHeight: "1.55", color: "#92400e" }}>
                      Your baseline monthly surplus is estimated at <strong>{formatINR(surplus.monthlySurplus)}</strong> (Plan EMI is <strong>{formatINR(option3M.emi)}/mo</strong>).
                      <div className="mt-2 d-flex align-items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          className="advisory-reduce-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStepAmount(-2000);
                          }}
                          title="Reduce loan amount to lower monthly EMI"
                        >
                          <i className="fa-solid fa-star me-1"></i>
                          Reduce Amount
                        </button>
                        <button
                          type="button"
                          className="advisory-finetune-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            Swal.fire({
                              title: "Extend Tenure Option",
                              text: "Tenure up to 6 months unlocks automatically after completing your first on-time loan cycle.",
                              icon: "info",
                              confirmButtonColor: "#0040e0",
                            });
                          }}
                        >
                          <i className="fa-solid fa-clock-rotate-left me-1"></i>
                          Extend Tenure
                        </button>
                        <button
                          type="button"
                          className="advisory-finetune-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCalculationModal(true);
                          }}
                        >
                          <i className="fa-solid fa-gear me-1"></i>
                          Fine-tune Expenses
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Feature Highlights Row */}
                  <div className="d-flex flex-wrap gap-1.5 mb-3">
                    <span className="repayment-feature-tag">
                      <i className="fa-solid fa-shield-check text-info"></i> Low Monthly Impact
                    </span>
                    <span className="repayment-feature-tag">
                      <i className="fa-solid fa-star text-primary"></i> Preserves Cash Cushion
                    </span>
                    <span className="repayment-feature-tag">
                      <i className="fa-solid fa-bolt text-warning"></i> 0% Prepayment Penalty
                    </span>
                  </div>
                </div>

                {/* Clean Financial Breakdown Box */}
                <div className="card-data-box mt-auto">
                  <div className="card-data-row">
                    <span className="card-data-label">
                      <i className="fa-solid fa-money-bill-wave text-muted"></i> Loan Principal
                    </span>
                    <span className="card-data-value">{formatINR(requestedAmount)}</span>
                  </div>
                  <div className="card-data-row">
                    <span className="card-data-label">
                      <i className="fa-solid fa-coins text-muted"></i> Total Interest (3 Mo @ 16.5% p.a.)
                    </span>
                    <span className="card-data-value">{formatINR(option3M.totalInterest)}</span>
                  </div>
                  <div className="card-data-row">
                    <span className="card-data-label">
                      <i className="fa-solid fa-receipt text-muted"></i> Platform Fee (3.0% + 18% GST)
                    </span>
                    <span className="card-data-value">{formatINR(option3M.processingFee + option3M.gst)}</span>
                  </div>
                  <div className="card-disbursal-highlight">
                    <div>
                      <span className="small d-block fw-bold text-success">
                        <i className="fa-solid fa-circle-check me-1"></i> Net Cash Disbursal
                      </span>
                      <span className="text-muted" style={{ fontSize: "11px" }}>Direct IMPS transfer post e-Sign & eNACH</span>
                    </div>
                    <strong className="text-success fw-extrabold fs-4">{formatINR(option3M.netDisbursal)}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Option B: 30-Day Payday Bullet */}
            <div className="col-12 col-md-6">
              <div
                className={`repayment-plan-card ${(selectedTenure === 1 || selectedOfferType === "BULLET") ? "active" : ""}`}
                style={{
                  border: (selectedTenure === 1 || selectedOfferType === "BULLET") ? "2px solid #0052ff" : "1.5px solid #e2e8f0",
                }}
                onClick={() => {
                  setSelectedTenure(1);
                  setSelectedOfferType("BULLET");
                }}
              >
                <div>
                  {/* Header: Gray icon & Radio */}
                  <div className="d-flex justify-content-between align-items-center mb-2.5">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle bg-secondary bg-opacity-10 text-secondary"
                        style={{ width: "32px", height: "32px" }}
                      >
                        <i className="fa-solid fa-calendar-day fs-6"></i>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span className="badge rounded-pill px-2.5 py-1 small fw-semibold" style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", fontSize: "11px" }}>
                        Due at Day 30
                      </span>
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{
                          width: "22px",
                          height: "22px",
                          border: "2px solid #cbd5e1",
                          backgroundColor: "#ffffff",
                        }}
                      >
                      </div>
                    </div>
                  </div>

                  {/* Title and subtitle */}
                  <div className="mb-1">
                    <h5 className="fw-bold text-dark mb-0.5">30-Day Payday Bullet</h5>
                    <span className="text-muted small" style={{ fontSize: "11.5px" }}>Single payment at maturity</span>
                  </div>

                  {/* Big Settlement Amount */}
                  <div className="d-flex align-items-baseline gap-2 mt-2 mb-1 flex-wrap">
                    <h2 className="fw-extrabold text-dark mb-0" style={{ fontSize: "2rem", letterSpacing: "-0.5px" }}>
                      {formatINR(optionPayday.totalPayable)}
                    </h2>
                    <span className="text-dark fw-bold small">single payment</span>
                    <span className="text-muted small">(due at maturity on Day 30)</span>
                  </div>

                  <span className="text-muted small d-block mb-3" style={{ fontSize: "11.5px" }}>
                    Calculated on loan of <strong className="text-dark">{formatINR(requestedAmount)}</strong>
                  </span>

                  {/* Payday Bullet Cashflow Advisory Box */}
                  <div
                    className="p-3 rounded-3 mb-3"
                    style={{
                      backgroundColor: "#f0f7ff",
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <div className="d-flex align-items-center gap-1.5 fw-bold text-primary" style={{ fontSize: "12px" }}>
                        <i className="fa-solid fa-calendar-check"></i>
                        <span>Payday Bullet Cashflow Advisory</span>
                      </div>
                      <span className="badge rounded-pill px-2 py-0.5 small fw-semibold" style={{ background: "#ffffff", color: "#1d4ed8", border: "1px solid #bfdbfe", fontSize: "10px" }}>
                        Due Day 30: {formatINR(optionPayday.totalPayable)}
                      </span>
                    </div>
                    <div style={{ fontSize: "11.5px", lineHeight: "1.55", color: "#1e3a8a" }}>
                      Full lump-sum settlement of <strong>{formatINR(optionPayday.totalPayable)}</strong> on Day 30 is deducted from your upcoming salary credit.
                      <div className="mt-1 text-secondary">
                        ⚡ <strong>Option A (3-Month EMI)</strong> is recommended to spread repayment comfortably across 3 paychecks.
                      </div>
                    </div>
                  </div>

                  {/* Feature Highlights Row */}
                  <div className="d-flex flex-wrap gap-1.5 mb-3">
                    <span className="repayment-feature-tag">
                      <i className="fa-solid fa-ban text-danger"></i> Zero Multi-Month Dues
                    </span>
                    <span className="repayment-feature-tag">
                      <i className="fa-solid fa-money-bill-1-wave text-success"></i> Minimal Interest ({formatINR(optionPayday.totalInterest)})
                    </span>
                    <span className="repayment-feature-tag">
                      <i className="fa-solid fa-clock-rotate-left text-primary"></i> 30-Day Payday Credit
                    </span>
                  </div>
                </div>

                {/* Clean Financial Breakdown Box */}
                <div className="card-data-box mt-auto">
                  <div className="card-data-row">
                    <span className="card-data-label">
                      <i className="fa-solid fa-money-bill-wave text-muted"></i> Loan Principal
                    </span>
                    <span className="card-data-value">{formatINR(requestedAmount)}</span>
                  </div>
                  <div className="card-data-row">
                    <span className="card-data-label">
                      <i className="fa-solid fa-coins text-muted"></i> Total Interest (1 Mo @ 15.6% p.a.)
                    </span>
                    <span className="card-data-value">{formatINR(optionPayday.totalInterest)}</span>
                  </div>
                  <div className="card-data-row">
                    <span className="card-data-label">
                      <i className="fa-solid fa-receipt text-muted"></i> Platform Fee (3.0% + 18% GST)
                    </span>
                    <span className="card-data-value">{formatINR(optionPayday.processingFee + optionPayday.gst)}</span>
                  </div>
                  <div className="card-disbursal-highlight">
                    <div>
                      <span className="small d-block fw-bold text-success">
                        <i className="fa-solid fa-circle-check me-1"></i> Net Cash Disbursal
                      </span>
                      <span className="text-muted" style={{ fontSize: "11px" }}>Direct IMPS transfer post e-Sign & eNACH</span>
                    </div>
                    <strong className="text-success fw-extrabold fs-4">{formatINR(optionPayday.netDisbursal)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Numbered Circle 3: Lender Offers for Your Selected Plan */}
      <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2.5">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle text-white fw-bold shadow-xs"
                style={{ width: "30px", height: "30px", minWidth: "30px", backgroundColor: "#0040e0", fontSize: "14px" }}
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
                <tr className="text-secondary small" style={{ fontSize: "11px", letterSpacing: "0.2px" }}>
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

            {/* Center: Blue Raise a Request Button with 2 lines */}
            <div>
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
                  <><i className="fa-solid fa-spinner fa-spin"></i> Submitting Request...</>
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
            </div>

            {/* Right: 3 Trust Badges */}
            <div className="d-flex align-items-center gap-3 text-secondary">
              <div className="d-flex align-items-center gap-1.5">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: "26px", height: "26px", backgroundColor: "#eff6ff", color: "#0040e0" }}
                >
                  <i className="fa-solid fa-shield-halved" style={{ fontSize: "12px" }}></i>
                </div>
                <div style={{ lineHeight: "1.15" }}>
                  <span className="d-block fw-bold text-dark" style={{ fontSize: "11px" }}>100% RBI</span>
                  <span className="text-muted" style={{ fontSize: "10px" }}>Compliant</span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-1.5">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle fw-bold"
                  style={{ width: "26px", height: "26px", backgroundColor: "#eff6ff", color: "#0040e0", fontSize: "12px" }}
                >
                  %
                </div>
                <div style={{ lineHeight: "1.15" }}>
                  <span className="d-block fw-bold text-dark" style={{ fontSize: "11px" }}>Zero Upfront</span>
                  <span className="text-muted" style={{ fontSize: "10px" }}>Charges</span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-1.5">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: "26px", height: "26px", backgroundColor: "#eff6ff", color: "#0040e0" }}
                >
                  <i className="fa-solid fa-lock" style={{ fontSize: "12px" }}></i>
                </div>
                <div style={{ lineHeight: "1.15" }}>
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

print("SUCCESS: file updated cleanly with all UI polish")
