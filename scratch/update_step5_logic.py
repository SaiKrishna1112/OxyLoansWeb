# -*- coding: utf-8 -*-
path = 'src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx'

with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Replace handleRaiseLoanRequest and handleSelectLenderOffer
old_handlers_start = '    setIsSubmittingLoanRequest(true);\n    const payload = {'
old_handlers_end = '  // Cashflow waterfall percentages'

s_idx = c.find(old_handlers_start)
e_idx = c.find(old_handlers_end)

if s_idx == -1 or e_idx == -1:
    print("Could not find handler markers:", s_idx, e_idx)
    exit(1)

new_handlers = '''    setIsSubmittingLoanRequest(true);
    const payload = {
      borrowerId: Number(borrowerId),
      requestAmount: Number(amountToRequest),
    };

    try {
      const response = await submitBorrowerLoanRequest(payload);
      if (response?.status === 200 || response?.status === 201) {
        const newReq = {
          id: response?.data?.id || Date.now(),
          loanRequestId: response?.data?.loanRequestId || `LR${borrowerId}${Date.now().toString().slice(-4)}`,
          borrowerId,
          requestAmount: amountToRequest,
          loanRequestStatus: "REQUEST",
          createdAt: new Date().toISOString(),
        };
        setActiveLoanRequest(newReq);
        setHasSubmittedLoanRequest(true);

        Swal.fire({
          icon: "success",
          title: "Loan Request Raised!",
          text: `Your loan request for ${formatINR(amountToRequest)} is now active in the OxyLoans marketplace. Lenders will review and submit offers.`,
          confirmButtonColor: "#0040e0",
        });

        await fetchLoansInitiated();
      } else {
        const errMsg =
          response?.data?.message ||
          response?.message ||
          "Could not submit your loan request at this time. Please try again.";
        Swal.fire({
          icon: "error",
          title: "Unable to Submit Loan Request",
          text: errMsg,
          confirmButtonColor: "#0040e0",
        });
      }
    } catch (err) {
      console.error("handleRaiseLoanRequest error:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not submit your loan request at this time. Please try again.";
      Swal.fire({
        icon: "error",
        title: "Loan Request Failed",
        text: errMsg,
        confirmButtonColor: "#0040e0",
      });
    } finally {
      setIsSubmittingLoanRequest(false);
    }
  };

  // Normal borrower flow: Directly navigate to Step 6 (individual agreement eSign)
  const handleSelectLenderOffer = (lender) => {
    const isBullet = selectedTenure === 1 || selectedOfferType === "BULLET";
    const plan = {
      title: isBullet ? "30-Day Payday Bullet" : `${selectedTenure}-Month EMI Plan`,
      selectedOfferType: isBullet ? "BULLET" : "EMI",
      principal: requestedAmount,
      tenureMonths: isBullet ? 1 : selectedTenure,
      interestRate: lender.roi,
      monthlyEmi: lender.emi,
      totalPayable: lender.totalRepayment,
      processingFee: lender.processingFee,
      lenderName: lender.name,
      lenderId: lender.id,
      rawOffer: lender.raw,
    };

    if (lender.raw?.id && lender.raw?.loanRequestId) {
      borrowerLoanAcceptOrReject({
        id: lender.raw.id,
        loanRequestId: lender.raw.loanRequestId,
        borrowerId: lender.raw.borrowerId || profileData.userId || "41682",
        borrowerStatus: "LOANACCEPTED",
      }).catch((e) => console.warn("borrowerLoanAcceptOrReject notice:", e));
    }

    setAcceptedOffer(plan);

    // Directly navigate to individual Agreement eSign step (Step 6)
    if (onProceedToEsign) {
      onProceedToEsign(plan);
    } else if (onOfferSelected) {
      onOfferSelected(plan);
    }
  };

'''

c = c[:s_idx] + new_handlers + c[e_idx:]

# 2. Update Table Action Column to simply show "Select Offer"
old_table_btn = '''                      <td className="py-3 px-3 text-end">
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
                      </td>'''

new_table_btn = '''                      <td className="py-3 px-3 text-end">
                        <button
                          type="button"
                          onClick={() => handleSelectLenderOffer(lender)}
                          className="btn btn-sm btn-primary rounded-pill px-3.5 py-1.5 fw-bold shadow-xs d-inline-flex align-items-center gap-1.5"
                          style={{
                            backgroundColor: "#0040e0",
                            borderColor: "#0040e0",
                            fontSize: "11.5px",
                          }}
                        >
                          Select Offer
                        </button>
                      </td>'''

c = c.replace(old_table_btn, new_table_btn)

# 3. Update bottom sticky bar to remove "Processed to esign & enach" button
old_bottom_btn = '''            {/* Center: Action Button */}
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
            </div>'''

new_bottom_btn = '''            {/* Center: Action Button */}
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
            </div>'''

c = c.replace(old_bottom_btn, new_bottom_btn)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Updated InstantLoanStepOfferSelection.jsx successfully!')
