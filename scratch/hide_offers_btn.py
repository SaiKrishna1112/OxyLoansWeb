file_path = "src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update import
old_imp = """import {
  submitBorrowerLoanRequest,
  borrowerLoanAcceptOrReject,
  getListOfBorrowerLoansInitiated,
} from "../../../../../../HttpRequest/afterlogin";"""

new_imp = """import {
  submitBorrowerLoanRequest,
  borrowerLoanAcceptOrReject,
  getListOfBorrowerLoansInitiated,
  getBorrowerRequestAmount,
} from "../../../../../../HttpRequest/afterlogin";"""

assert old_imp in text, "old_imp not found"
text = text.replace(old_imp, new_imp, 1)

# 2. Update useEffect to fetch borrower request status
old_eff = """  useEffect(() => {
    fetchLoansInitiated();
  }, [profileData.userId]);"""

new_eff = """  useEffect(() => {
    fetchLoansInitiated();
    getBorrowerRequestAmount()
      .then((res) => {
        if (res?.status === 200 && Array.isArray(res.data) && res.data.length > 0) {
          const latest = [...res.data].sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))[0];
          const st = String(latest?.loanRequestStatus || "").toUpperCase();
          if (st && st !== "CLOSED") {
            setActiveLoanRequest(latest);
            setHasSubmittedLoanRequest(true);
          }
        }
      })
      .catch(() => {});
  }, [profileData.userId]);"""

assert old_eff in text, "old_eff not found"
text = text.replace(old_eff, new_eff, 1)

# 3. Only show View Lender Offers button if loan request is raised
old_btn = """              <button
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
              </button>"""

new_btn = """              {(hasSubmittedLoanRequest || activeLoanRequest) && (
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
              )}"""

assert old_btn in text, "old_btn not found"
text = text.replace(old_btn, new_btn, 1)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Updated InstantLoanStepOfferSelection.jsx successfully!")
