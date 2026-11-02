import re

target_file = 'src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx'

with open(target_file, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update columns action column
old_action_block = '''          <div className="d-flex gap-2 flex-wrap align-items-center">
            {canShowAcceptButton ? (
              <button
                type="button"
                className="btn btn-sm btn-success fw-bold px-3 rounded-pill shadow-xs"
                disabled={isLoading}
                onClick={() => handleAcceptLenderOffer(record)}
              >
                {isUpdating ? "Please wait..." : <><i className="fa-solid fa-check me-1"></i> Accept</>}
              </button>
            ) : null}
            {showRejectButton ? (
              <div className="d-flex flex-column align-items-start">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger px-2.5 rounded-pill"
                  disabled={isLoading || isProcessing}
                  title={isProcessing ? "Cannot reject while processing" : ""}
                  onClick={() => handleDeclineLenderOffer(record)}
                >
                  {isUpdating ? "Please wait..." : "Reject"}
                </button>
                {isProcessing && (
                  <RemainingTime createdAt={record.createdAt} duration={record.duration} />
                )}
              </div>
            ) : null}
            {borrowerStatus === "LOANACCEPTED" && (
              <button
                type="button"
                className="btn btn-xs btn-outline-danger rounded-pill px-2.5 py-1"
                disabled={isLoading}
                onClick={() => handleDeclineLenderOffer(record)}
                title="Decline this accepted offer and release borrowing capacity"
              >
                <i className="fa-solid fa-xmark me-1"></i> Decline
              </button>
            )}
            {borrowerStatus === "LOANACCEPTED" && !record.borrowerEsigned && record.borrowerAggrement ? (
              <button
                type="button"
                onClick={() => {
                  if (onProceedToEsign) onProceedToEsign();
                }}
                className="btn btn-sm btn-warning text-dark fw-bold rounded-pill px-3"
              >
                <i className="fa-solid fa-signature me-1"></i> eSign Agreement
              </button>
            ) : borrowerStatus === "LOANACCEPTED" && !record.borrowerAggrement ? (
              <span className="badge bg-warning-subtle text-warning border border-warning px-2.5 py-1.5 rounded-pill small" title="Lender must sign agreement first">
                <i className="fa-solid fa-clock me-1"></i> Waiting for Lender Signature
              </span>
            ) : null}
            {record.borrowerAggrement && (
              <a
                href={record.borrowerAggrement}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-info rounded-pill px-2.5"
              >
                <i className="fa-solid fa-file-pdf me-1"></i> View Agreement
              </a>
            )}
            {record.borrowerEsigned && (
              <span className="badge bg-success-subtle text-success p-2 small rounded-pill">
                <i className="fa-solid fa-circle-check me-2"></i> eSigned
              </span>
            )}
            {canShowExecuteButton ? (
              <button
                type="button"
                className="btn btn-sm btn-primary rounded-pill px-3 fw-bold"
                disabled={isLoading}
                onClick={() => handleLoanExecute(record)}
              >
                {isExecuting ? "Please wait..." : "Execute loan"}
              </button>
            ) : null}
            {!canShowAcceptButton && !showRejectButton && !canShowExecuteButton && !record.borrowerEsigned && !record.borrowerAggrement && borrowerStatus !== "LOANACCEPTED" ? (
              <span className="text-muted small">No actions available</span>
            ) : null}
          </div>'''

new_action_block = '''          <div className="d-flex gap-2 flex-wrap align-items-center">
            {canShowAcceptButton ? (
              <button
                type="button"
                className="btn btn-sm btn-success fw-semibold px-3 py-1.5 rounded-pill shadow-xs"
                disabled={isLoading}
                onClick={() => handleBorrowerAction(record, "LOANACCEPTED")}
              >
                {isUpdating ? "Please wait..." : <><i className="fa-solid fa-check me-1.5"></i> Accept</>}
              </button>
            ) : null}
            {showRejectButton ? (
              <div className="d-flex flex-column align-items-start">
                <button
                  type="button"
                  className="btn btn-sm btn-danger fw-semibold px-3 py-1.5 rounded-pill"
                  disabled={isLoading || isProcessing}
                  title={isProcessing ? "Cannot reject while processing" : ""}
                  onClick={() => handleBorrowerAction(record, "BORROWER_REJECTED")}
                >
                  {isUpdating ? "Please wait..." : <><i className="fa-solid fa-xmark me-1.5"></i> Reject</>}
                </button>
                {isProcessing && (
                  <RemainingTime createdAt={record.createdAt} duration={record.duration} />
                )}
              </div>
            ) : null}
            {borrowerStatus === "LOANACCEPTED" && !record.borrowerEsigned && record.borrowerAggrement ? (
              <Link
                to={`/esign/${record.loanRequestId || record.id}?assignmentId=${record.id}`}
                className="btn btn-sm btn-warning text-dark fw-bold px-3 py-1.5 rounded-pill"
                onClick={() => {
                  if (onProceedToEsign) onProceedToEsign();
                }}
              >
                <i className="fa-solid fa-signature me-1.5"></i> eSign Agreement
              </Link>
            ) : null}
            {record.borrowerAggrement && (
              <a
                href={record.borrowerAggrement}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-info fw-semibold px-3 py-1.5 rounded-pill"
              >
                <i className="fa-solid fa-file-pdf me-1.5"></i> View Agreement
              </a>
            )}
            {record.borrowerEsigned && (
              <span className="badge bg-success-subtle text-success p-2 small rounded-pill">
                <i className="fa-solid fa-circle-check me-1.5"></i> eSigned
              </span>
            )}
            {canShowExecuteButton ? (
              <button
                type="button"
                className="btn btn-sm btn-primary fw-bold px-3 py-1.5 rounded-pill shadow-xs"
                disabled={isLoading}
                onClick={() => handleLoanExecute(record)}
              >
                {isExecuting ? "Please wait..." : <><i className="fa-solid fa-bolt me-1.5"></i> Execute loan</>}
              </button>
            ) : null}
            {!canShowAcceptButton && !showRejectButton && !canShowExecuteButton && !record.borrowerEsigned && !record.borrowerAggrement ? (
              <span className="text-muted small">No actions available</span>
            ) : null}
          </div>'''

assert old_action_block in content, "Could not find old_action_block"
content = content.replace(old_action_block, new_action_block, 1)
print("1. Action column in Table updated to match BorrowerLoansInitiated")

# 2. Add if (viewMode === 'OFFERS_RECEIVED') return block before main return
offers_received_return = '''  // =========================================================================
  // VIEW MODE: OFFERS RECEIVED (Continues identical flow to BorrowerLoansInitiated)
  // =========================================================================
  if (viewMode === "OFFERS_RECEIVED") {
    return (
      <div className="fintech-card step-view-enter">
        {/* Header & Navigation */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3 pb-3 border-bottom">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1.5 flex-wrap">
              <span className="badge bg-primary text-white px-3 py-1 rounded-pill small fw-bold">
                <i className="fa-solid fa-hand-holding-dollar me-1.5"></i> Step 5 • Loan Offers Received From Lenders
              </span>
              {activeLoanRequest && (
                <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 rounded-pill small fw-semibold">
                  <i className="fa-solid fa-circle-check me-1"></i> Request ID: {activeLoanRequest.loanRequestId || "LR41682"}
                </span>
              )}
            </div>
            <h4 className="fw-bold text-dark mb-1" style={{ fontSize: "22px" }}>
              Offers Received from Certified Lenders
            </h4>
            <p className="text-secondary small mb-0" style={{ fontSize: "12.5px" }}>
              Compare offers from lenders and choose the best option for your needs.
            </p>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              onClick={() => setViewMode("PLAN_SELECTION")}
              title="Adjust loan amount, tenure or see detailed underwriting metrics"
            >
              <i className="fa-solid fa-sliders me-1.5"></i> Repayment Plan Configurator
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary rounded-pill px-3"
              onClick={() => fetchLoansInitiated()}
            >
              <i className="fa-solid fa-rotate me-1.5"></i> Refresh Offers
            </button>
            {onBack && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                onClick={onBack}
              >
                <i className="fa-solid fa-arrow-left me-1.5"></i> Back to Step 4
              </button>
            )}
          </div>
        </div>

        {/* Total Amount of Offers Received & Eligible Amount Summary Cards (from BorrowerLoansInitiated) */}
        <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}>
          <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <p className="text-uppercase text-muted fw-semibold small mb-1" style={{ fontSize: "11.5px", letterSpacing: "0.5px" }}>
                  Total Amount of Offers Received
                </p>
                <h2 className="fw-bold text-dark mb-2" style={{ fontSize: "30px" }}>
                  ₹ {totalInitiatedAmount.toFixed(2)}
                </h2>
                <div className="d-inline-flex align-items-center bg-success bg-opacity-10 text-success px-3 py-1.5 rounded-pill">
                  <i className="fa-solid fa-circle-check me-2"></i>
                  <span className="fw-semibold text-dark small">Eligible Amount:</span>
                  <span className="ms-2 fw-bold text-success">
                    ₹ {Number(eligibleAmount || 31500).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="d-flex gap-2.5 flex-wrap">
                <div className="text-center p-3 rounded-3 bg-light border shadow-2xs" style={{ minWidth: "115px" }}>
                  <span className="text-muted small d-block mb-1" style={{ fontSize: "11px" }}>Pending Actions</span>
                  <h4 className="fw-bold text-warning mb-0">{loanSummary.pendingActionCount}</h4>
                </div>
                <div className="text-center p-3 rounded-3 bg-light border shadow-2xs" style={{ minWidth: "115px" }}>
                  <span className="text-muted small d-block mb-1" style={{ fontSize: "11px" }}>Accepted Offers</span>
                  <h4 className="fw-bold text-success mb-0">{loanSummary.acceptedOffersCount}</h4>
                </div>
                <div className="text-center p-3 rounded-3 bg-light border shadow-2xs" style={{ minWidth: "115px" }}>
                  <span className="text-muted small d-block mb-1" style={{ fontSize: "11px" }}>Executed Loans</span>
                  <h4 className="fw-bold text-primary mb-0">{loanSummary.executedLoansCount}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Offers Received Table Card (matching BorrowerLoansInitiated) */}
        <div className="card border-0 shadow-sm rounded-4 mb-4" style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}>
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <h6 className="fw-bold text-dark mb-0 fs-6">
                <i className="fa-solid fa-list-check text-primary me-2"></i>
                Lender Offers Received
              </h6>
              <span className="text-muted small" style={{ fontSize: "11.5px" }}>
                Accept offers up to your loan limit or reject non-suitable offers.
              </span>
            </div>

            {loanInitiatedInfo.errorMessage ? (
              <div className="alert alert-danger" role="alert">
                {loanInitiatedInfo.errorMessage}
              </div>
            ) : null}

            <Table
              className="table-responsive table-responsive-md table-responsive-lg table-responsive-xs"
              columns={columns}
              dataSource={loanInitiatedInfo.hasData ? dataSource : []}
              loading={loanInitiatedInfo.loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
              }}
              locale={{
                emptyText: (
                  <div className="p-4 text-center">
                    <i className="fa-solid fa-hourglass-half text-muted fs-2 mb-2"></i>
                    <p className="text-dark fw-semibold mb-1">No offered amount to display yet.</p>
                    <p className="text-muted small mb-0">
                      Your loan request for ₹ {Number(requestedLoanAmount).toLocaleString("en-IN")} is active in the marketplace.
                      Certified peer lenders are reviewing your profile.
                    </p>
                  </div>
                ),
              }}
              scroll={{ x: true }}
            />
          </div>
        </div>

        {/* Bottom Bar in Offers Received */}
        <div
          className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4"
          style={{ border: "1.5px solid #e2e8f0", backgroundColor: "#ffffff" }}
        >
          <div className="card-body p-3.5">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 text-primary shadow-2xs"
                  style={{ width: "42px", height: "42px", minWidth: "42px" }}
                >
                  <i className="fa-solid fa-receipt fs-5"></i>
                </div>
                <div>
                  <span className="text-muted small d-block" style={{ fontSize: "11px", fontWeight: "600" }}>
                    Active Request Summary
                  </span>
                  <strong className="text-dark fs-6 d-block mb-0.5">
                    Requested: ₹ {Number(requestedLoanAmount).toLocaleString("en-IN")} • {selectedOfferType === "EMI" ? "3-Month EMI Plan" : "30-Day Payday Bullet"}
                  </strong>
                  <span className="text-muted small" style={{ fontSize: "11.5px" }}>
                    Accepted Offers: <strong className="text-success">{loanSummary.acceptedOffersCount}</strong> (₹ {totalAcceptedAmount.toLocaleString("en-IN")}) • Pending Actions: <strong className="text-warning">{loanSummary.pendingActionCount}</strong>
                  </span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setViewMode("PLAN_SELECTION")}
                  className="btn btn-outline-secondary rounded-pill px-3 py-2 fw-semibold"
                >
                  <i className="fa-solid fa-sliders me-1.5"></i> Modify Repayment Plan
                </button>

                {loanSummary.acceptedOffersCount > 0 && acceptedLenderOffers.some((r) => r.borrowerEsigned) ? (
                  <button
                    type="button"
                    onClick={() => {
                      const execRecord = acceptedLenderOffers.find((r) => r.borrowerEsigned);
                      if (execRecord) handleLoanExecute(execRecord);
                    }}
                    className="btn btn-primary px-4 py-2 rounded-pill fw-bold text-white shadow-sm"
                    style={{ backgroundColor: "#0040e0", borderColor: "#0040e0" }}
                  >
                    <i className="fa-solid fa-bolt me-1.5"></i> Execute Accepted Loan
                  </button>
                ) : loanSummary.acceptedOffersCount > 0 && acceptedLenderOffers.some((r) => r.borrowerAggrement && !r.borrowerEsigned) ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (onProceedToEsign) onProceedToEsign();
                    }}
                    className="btn btn-warning text-dark px-4 py-2 rounded-pill fw-bold shadow-sm"
                  >
                    <i className="fa-solid fa-signature me-1.5"></i> Proceed to Step 6: eSign Agreement
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return ('''

assert '  return (' in content, "Could not find return ("
content = content.replace('  return (', offers_received_return, 1)
print("2. OFFERS_RECEIVED full return block added")

# 3. Replace Section 3 table (lines 2706-2788) with Ant Design Table
old_section3_target = '''          {/* Clean Lender Offers Table */}
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
          </div>'''

new_section3_replacement = '''          {/* Live Offers Table matching BorrowerLoansInitiated */}
          <div className="table-responsive">
            <Table
              className="table-responsive table-responsive-md table-responsive-lg table-responsive-xs"
              columns={columns}
              dataSource={loanInitiatedInfo.hasData ? dataSource : []}
              loading={loanInitiatedInfo.loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
              }}
              locale={{
                emptyText: "No offered amount to display yet.",
              }}
              scroll={{ x: true }}
            />
          </div>'''

assert old_section3_target in content, "Could not find old_section3_target"
content = content.replace(old_section3_target, new_section3_replacement, 1)
print("3. Section 3 Table replaced with Ant Design Table using columns & dataSource")

# 4. Update the bottom bar in PLAN_SELECTION to add View Offers Received button if activeLoanRequest exists
old_bottom_button = '''            {/* Center: Blue Raise a Request Button with 2 lines */}
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
            </div>'''

new_bottom_button = '''            {/* Center: Blue Raise a Request Button or View Offers */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              {activeLoanRequest && (
                <button
                  type="button"
                  onClick={() => setViewMode("OFFERS_RECEIVED")}
                  className="btn btn-outline-primary px-3.5 py-2 rounded-pill fw-semibold shadow-xs"
                >
                  <i className="fa-solid fa-list-check me-1.5"></i> View Offers Received ({loanInitiatedInfo.apiData.length})
                </button>
              )}
              <button
                type="button"
                onClick={handleRaiseLoanRequest}
                disabled={isSubmittingLoanRequest}
                className="btn btn-primary px-4 py-2 rounded-pill fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2"
                style={{
                  backgroundColor: "#0040e0",
                  borderColor: "#0040e0",
                  minWidth: activeLoanRequest ? "230px" : "270px",
                  boxShadow: "0 4px 14px rgba(0, 64, 224, 0.3)",
                }}
              >
                {isSubmittingLoanRequest ? (
                  <><i className="fa-solid fa-spinner fa-spin"></i> Submitting Request...</>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane" style={{ transform: "rotate(-15deg)", fontSize: "14px" }}></i>
                    <div className="text-center" style={{ lineHeight: "1.2" }}>
                      <div style={{ fontSize: "13.5px", fontWeight: "700" }}>
                        {activeLoanRequest ? `Update Request (${formatINR(requestedAmount)})` : `Raise a Request (${formatINR(requestedAmount)})`}
                      </div>
                      <div style={{ fontSize: "11px", fontWeight: "500", opacity: "0.9" }}>to View Final Offers</div>
                    </div>
                  </>
                )}
              </button>
            </div>'''

assert old_bottom_button in content, "Could not find old_bottom_button"
content = content.replace(old_bottom_button, new_bottom_button, 1)
print("4. Bottom Bar updated with View Offers Received button")

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("All Part 2 modifications applied successfully!")
