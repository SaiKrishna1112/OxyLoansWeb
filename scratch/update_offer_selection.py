import re

file_path = "src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Update props to include onProceedToOffers
old_props = """const InstantLoanStepOfferSelection = ({
  profileData = {},
  creditScore = 802,
  onOfferSelected,
  onProceedToEsign,
  onBack,
}) => {"""

new_props = """const InstantLoanStepOfferSelection = ({
  profileData = {},
  creditScore = 802,
  onOfferSelected,
  onProceedToOffers,
  onProceedToEsign,
  onBack,
}) => {"""

assert old_props in code, "Could not find old_props"
code = code.replace(old_props, new_props, 1)

# 2. Replace lines from lenderList through handleSelectLenderOffer with clean handleRaiseLoanRequest
pattern_handlers = re.compile(
    r"  // Lender offers list formatted for Section 3 table\n  const lenderList = useMemo\([\s\S]*?  \};\n\n  // Cashflow waterfall percentages",
    re.MULTILINE
)

new_raise_handler = """  // Raise loan request in P2P market (Borrower requests the loan)
  const handleRaiseLoanRequest = async () => {
    const borrowerId = profileData.userId || sessionStorage.getItem("userId") || localStorage.getItem("userId") || "41682";
    const amountToRequest = requestedAmount || 31500;

    const confirmResult = await Swal.fire({
      title: "Raise Loan Request in P2P Market",
      html: `
        <div class="text-start small">
          <p class="mb-2">Submit your loan request into the OxyLoans P2P network:</p>
          <div class="p-3 bg-light rounded-3 border mb-2">
            <div class="d-flex justify-content-between mb-1">
              <span>Requested Amount:</span>
              <strong class="text-primary fs-6">${formatINR(amountToRequest)}</strong>
            </div>
            <div class="d-flex justify-content-between mb-1">
              <span>Repayment Plan:</span>
              <span class="text-dark fw-bold">${selectedOfferType === "BULLET" ? "30-Day Payday Bullet" : `${selectedTenure} Months EMI`}</span>
            </div>
            <div class="d-flex justify-content-between">
              <span>Indicative Benchmark ROI:</span>
              <span class="text-success fw-bold">${confirmedLenderRoi || 16.5}% p.a.</span>
            </div>
          </div>
          <p class="text-muted mb-0" style="font-size: 11px;">
            Nearby certified peer lenders will review your request and submit competing loan offers.
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Raise Request",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#0040e0",
      cancelButtonColor: "#6c757d",
    });

    if (!confirmResult.isConfirmed) return;

    setIsSubmittingLoanRequest(true);
    const payload = {
      borrowerId: Number(borrowerId),
      requestAmount: Number(amountToRequest),
    };

    try {
      const response = await submitBorrowerLoanRequest(payload);
      const isSuccess = response?.status === 200 || response?.status === 201;

      if (isSuccess) {
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

        const chosenPlan = {
          title: isBullet ? "30-Day Payday Bullet" : `${selectedTenure}-Month EMI Plan`,
          selectedOfferType: isBullet ? "BULLET" : "EMI",
          principal: amountToRequest,
          tenureMonths: isBullet ? 1 : selectedTenure,
          interestRate: confirmedLenderRoi || 16.5,
          monthlyEmi: currentPricing.emi,
          totalPayable: currentPricing.totalPayable,
          processingFee: currentPricing.processingFee,
          netDisbursal: currentPricing.netDisbursal,
        };

        await Swal.fire({
          icon: "success",
          title: "Loan Request Raised!",
          text: `Your loan request for ${formatINR(amountToRequest)} is now active in the OxyLoans marketplace. Lenders will review and submit offers.`,
          confirmButtonColor: "#0040e0",
          confirmButtonText: "View Matched Offers",
        });

        if (onProceedToOffers) {
          onProceedToOffers(chosenPlan);
        } else if (onProceedToEsign) {
          onProceedToEsign(chosenPlan);
        } else if (onOfferSelected) {
          onOfferSelected(chosenPlan);
        }
      } else {
        const errMsg =
          response?.response?.data?.errorMessage ||
          response?.response?.data?.message ||
          response?.data?.errorMessage ||
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
        err?.response?.data?.errorMessage ||
        err?.response?.data?.message ||
        err?.data?.errorMessage ||
        err?.data?.message ||
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

  // Cashflow waterfall percentages"""

match = pattern_handlers.search(code)
assert match is not None, "Could not match pattern_handlers"
code = code[:match.start()] + new_raise_handler + code[match.end():]

# 3. Update Step header badge and titles
old_header = """            <span
              className="badge rounded-pill px-3 py-1 small fw-bold"
              style={{
                backgroundColor: "#064e3b",
                color: "#34d399",
                fontSize: "11px",
              }}
            >
              Step 5 of 7
            </span>
          </div>
          <h4 className="fw-bold text-dark mb-1" style={{ fontSize: "22px" }}>
            Underwriting, Repayment & Matched Loan Offers
          </h4>
          <p className="text-secondary small mb-0" style={{ fontSize: "12.5px" }}>
            Review how your loan amount is calculated based on verified salary and living expenses, choose your repayment plan, and review matched lender offers for <strong>{profileData.name || "DHARMAPURI SAI KRISHNA"}</strong>.
          </p>"""

new_header = """            <span
              className="badge rounded-pill px-3 py-1 small fw-bold"
              style={{
                backgroundColor: "#064e3b",
                color: "#34d399",
                fontSize: "11px",
              }}
            >
              Step 5 of 9 • Choose Loan Plan
            </span>
          </div>
          <h4 className="fw-bold text-dark mb-1" style={{ fontSize: "22px" }}>
            Underwriting & Repayment Plan Selection
          </h4>
          <p className="text-secondary small mb-0" style={{ fontSize: "12.5px" }}>
            Review how your loan amount is calculated based on verified salary and living expenses, choose your repayment plan, and raise your loan request to receive lender offers.
          </p>"""

assert old_header in code, "Could not find old_header"
code = code.replace(old_header, new_header, 1)

# 4. Remove Section 3 (lines 1434 to 1578)
pattern_sec3 = re.compile(
    r"\n      \{\/\* 5\. Numbered Circle 3: Lender Offers for Your Selected Plan[\s\S]*?      \) : null\}\n",
    re.MULTILINE
)
match_sec3 = pattern_sec3.search(code)
assert match_sec3 is not None, "Could not find Section 3 block"
code = code[:match_sec3.start()] + "\n" + code[match_sec3.end():]

# 5. In the bottom CTA bar (around line 1580), update Center Action Button to include "View Lender Offers"
old_cta_center = """            {/* Center: Action Button */}
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
            </div>"""

new_cta_center = """            {/* Center: Action Buttons */}
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleRaiseLoanRequest}
                disabled={isSubmittingLoanRequest}
                className="btn btn-primary px-4 py-2.5 rounded-pill fw-bold text-white shadow-sm d-flex align-items-center justify-content-center gap-2"
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

              <button
                type="button"
                onClick={() => {
                  if (onProceedToOffers) onProceedToOffers();
                  else if (onProceedToEsign) onProceedToEsign();
                  else if (onOfferSelected) onOfferSelected();
                }}
                className="btn btn-outline-primary px-3.5 py-2.5 rounded-pill fw-bold d-inline-flex align-items-center gap-1.5 shadow-2xs"
                style={{ borderColor: "#0040e0", color: "#0040e0", fontSize: "12.5px" }}
              >
                <i className="fa-solid fa-list-check"></i>
                <span>View Lender Offers {hasLenderOffers ? `(${loanInitiatedInfo.apiData.length})` : ""}</span>
              </button>
            </div>"""

assert old_cta_center in code, "Could not find old_cta_center"
code = code.replace(old_cta_center, new_cta_center, 1)

# 6. Remove lines containing "Confirm Offer & Proceed to eSign / eNACH" and the bottom strip
pattern_confirm_strip = re.compile(
    r"\n      \{\/\* 14\. Bottom Sticky CTA Summary Strip[\s\S]*?<\/div>\n",
    re.MULTILINE
)
match_strip = pattern_confirm_strip.search(code)
assert match_strip is not None, "Could not find confirm_strip"
code = code[:match_strip.start()] + "\n" + code[match_strip.end():]

# 7. Remove handleConfirmOffer definition if not used
pattern_confirm_def = re.compile(
    r"\n  \/\/ Handle offer submission to next step \(eSign \/ eNACH\)\n  const handleConfirmOffer = \(\) => \{[\s\S]*?  \};\n",
    re.MULTILINE
)
match_cdef = pattern_confirm_def.search(code)
if match_cdef:
    code = code[:match_cdef.start()] + "\n" + code[match_cdef.end():]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(code)

print("Successfully updated InstantLoanStepOfferSelection.jsx")
