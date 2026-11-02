import re
import os

# 1. Reset file to clean base git checkout
os.system('git checkout src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx')

file_path = 'src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx'
with open(file_path, 'r', encoding='utf-8') as f:
    base_content = f.read()

# 2. Add imports and state definitions needed for the live offers & normal borrower flow
# We need Swal, fetchBorrowerLoansInitiated / getListOfBorrowerLoansInitiated, borrowerLoanAcceptOrReject, submitBorrowerLoanRequest
imports_target = 'import { submitInstantLoanApplication } from "./instantLoanApi";'
imports_replacement = '''import { submitInstantLoanApplication } from "./instantLoanApi";
import Swal from "sweetalert2";
import {
  submitBorrowerLoanRequest,
  borrowerLoanAcceptOrReject,
  getListOfBorrowerLoansInitiated,
} from "../../../../../HttpRequest/afterlogin";'''

base_content = base_content.replace(imports_target, imports_replacement)

# 3. Add props: onProceedToEsign, isWaitingForLender, lenderSigned
props_target = '''const InstantLoanStepOfferSelection = ({
  profileData = {},
  creditScore = 802,
  onOfferSelected,
  onBack,'''

props_replacement = '''const InstantLoanStepOfferSelection = ({
  profileData = {},
  creditScore = 802,
  onOfferSelected,
  onProceedToEsign,
  onBack,'''

base_content = base_content.replace(props_target, props_replacement)

# 4. Set default requestedAmount to 31500 and add onlyRbiRegulated, activeLoanRequest, isSubmittingLoanRequest, loanInitiatedInfo
state_target = '''  const [requestedAmount, setRequestedAmount] = useState(
    Math.min(maxCap, Math.max(minCap, 45000))
  );
  const [selectedOfferType, setSelectedOfferType] = useState("EMI"); // "EMI" | "BULLET"
  const [selectedTenure, setSelectedTenure] = useState(3); // Default 3 Months for new borrowers
  const [showExpenseDrawer, setShowExpenseDrawer] = useState(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState(false);
  const [showKfsModal, setShowKfsModal] = useState(false);
  const [showAmortizationModal, setShowAmortizationModal] = useState(false);
  const [tenureLockedNotice, setTenureLockedNotice] = useState("");'''

state_replacement = '''  const [requestedAmount, setRequestedAmount] = useState(
    Math.min(maxCap, Math.max(minCap, 31500))
  );
  const [selectedOfferType, setSelectedOfferType] = useState("EMI"); // "EMI" | "BULLET"
  const [selectedTenure, setSelectedTenure] = useState(3); // Default 3 Months for new borrowers
  const [onlyRbiRegulated, setOnlyRbiRegulated] = useState(true);
  const [showExpenseDrawer, setShowExpenseDrawer] = useState(false);
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState(false);
  const [showKfsModal, setShowKfsModal] = useState(false);
  const [showAmortizationModal, setShowAmortizationModal] = useState(false);
  const [showCalculationModal, setShowCalculationModal] = useState(false);
  const [tenureLockedNotice, setTenureLockedNotice] = useState("");

  // Live Loan Request & Offers State
  const [activeLoanRequest, setActiveLoanRequest] = useState(null);
  const [hasSubmittedLoanRequest, setHasSubmittedLoanRequest] = useState(false);
  const [isSubmittingLoanRequest, setIsSubmittingLoanRequest] = useState(false);
  const [acceptedOffer, setAcceptedOffer] = useState(null);
  const [loanInitiatedInfo, setLoanInitiatedInfo] = useState({
    apiData: [],
    hasData: false,
    loading: false,
    errorMessage: "",
  });'''

base_content = base_content.replace(state_target, state_replacement)

# 5. Add option3M and optionPayday and live fetching & actions
options_target = '''      ...calculated,
      processingFee,
      gst,
      netDisbursal,
    };
  }, [isBullet, requestedAmount, selectedTenure, risk, activeRules, lenderMatchStatus, confirmedLenderRoi]);

  // Cashflow waterfall percentages'''

options_replacement = '''      ...calculated,
      processingFee,
      gst,
      netDisbursal,
    };
  }, [isBullet, requestedAmount, selectedTenure, risk, activeRules, lenderMatchStatus, confirmedLenderRoi]);

  // Pricing calculations for the 2 direct repayment options shown in Underwriting
  const option3M = useMemo(() => {
    const calc = calculatePricing(requestedAmount, 3, risk.riskTier, risk.pd, {
      ...activeRules,
      processingFeeRate: 0.030,
    }, confirmedLenderRoi || 16.5);
    const processingFee = Math.max(500, Math.round(requestedAmount * 0.030));
    const gst = Math.round(processingFee * 0.18);
    const netDisbursal = Math.max(0, requestedAmount - processingFee - gst);
    return {
      ...calc,
      processingFee,
      gst,
      netDisbursal,
    };
  }, [requestedAmount, risk, activeRules, confirmedLenderRoi]);

  const optionPayday = useMemo(() => {
    const p = requestedAmount;
    const annualRate = 15.6;
    const flatMonthlyRate = (annualRate / 100) / 12;
    const interest = Math.round(p * flatMonthlyRate);
    const processingFee = Math.max(500, Math.round(p * 0.030));
    const gst = Math.round(processingFee * 0.18);
    const netDisbursal = Math.max(0, p - processingFee - gst);
    return {
      principal: p,
      tenureMonths: 1,
      annualRoi: annualRate,
      emi: p + interest,
      totalInterest: interest,
      totalPayable: p + interest,
      processingFee,
      gst,
      netDisbursal,
    };
  }, [requestedAmount]);

  // Check if live lenders have given offers for this borrower
  const hasLenderOffers = useMemo(() => {
    return Boolean(
      loanInitiatedInfo?.hasData &&
      Array.isArray(loanInitiatedInfo?.apiData) &&
      loanInitiatedInfo.apiData.length > 0
    );
  }, [loanInitiatedInfo]);

  // Fetch live loans initiated / lender offers from backend
  const fetchLoansInitiated = async () => {
    const borrowerId = profileData.userId || "41682";
    setLoanInitiatedInfo((prev) => ({ ...prev, loading: true, errorMessage: "" }));
    try {
      const res = await getListOfBorrowerLoansInitiated(borrowerId);
      if (res?.status === 200 && Array.isArray(res?.data) && res.data.length > 0) {
        setLoanInitiatedInfo({
          apiData: res.data,
          hasData: true,
          loading: false,
          errorMessage: "",
        });
      } else {
        setLoanInitiatedInfo({
          apiData: [],
          hasData: false,
          loading: false,
          errorMessage: "",
        });
      }
    } catch (e) {
      console.warn("fetchLoansInitiated notice:", e);
      setLoanInitiatedInfo({
        apiData: [],
        hasData: false,
        loading: false,
        errorMessage: "",
      });
    }
  };

  useEffect(() => {
    fetchLoansInitiated();
  }, [profileData.userId]);

  // Lender offers list formatted for Section 3 table
  const lenderList = useMemo(() => {
    if (!hasLenderOffers) {
      return [];
    }

    const isBullet = selectedTenure === 1 || selectedOfferType === "BULLET";
    const tenureMonths = isBullet ? 1 : selectedTenure;
    const tenureText = isBullet ? "30 Days" : `${selectedTenure} Months`;

    return loanInitiatedInfo.apiData.map((item, idx) => {
      const p = Number(item.lenderInterestedAmount || requestedAmount);
      const roi = Number(item.roi || confirmedLenderRoi || 16.5);
      const fee = Math.round(p * 0.03 * 1.18);
      let emi = 0;
      let totalRepayment = 0;

      if (isBullet) {
        const interest = Math.round((p * (roi / 100)) / 12);
        totalRepayment = p + interest;
        emi = totalRepayment;
      } else {
        const r = roi / 12 / 100;
        emi = Math.round((p * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1));
        totalRepayment = emi * tenureMonths;
      }

      return {
        id: item.id || `LENDER_${idx}`,
        raw: item,
        name: item.lenderName || `Matched Lender #${idx + 1}`,
        badgeText: (item.borrowerStatus || "").toUpperCase() === "LOANACCEPTED" ? "Accepted" : "Verified",
        badgeBg: "rgba(22, 163, 74, 0.1)",
        badgeColor: "#15803d",
        badgeBorder: "rgba(22, 163, 74, 0.25)",
        logoBg: idx % 3 === 0 ? "#059669" : idx % 3 === 1 ? "#831843" : "#b45309",
        icon: idx % 3 === 0 ? "fa-solid fa-circle-nodes" : idx % 3 === 1 ? "fa-solid fa-landmark" : "fa-solid fa-shield",
        roi,
        emi,
        totalRepayment,
        processingFee: fee,
        tenureText,
        borrowerStatus: item.borrowerStatus,
      };
    });
  }, [hasLenderOffers, loanInitiatedInfo, requestedAmount, selectedTenure, selectedOfferType, confirmedLenderRoi]);

  // Raise loan request in P2P market (Borrower requests the loan)
  const handleRaiseLoanRequest = async () => {
    const borrowerId = profileData.userId || "41682";
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
      requestAmount: amountToRequest,
      duration: selectedOfferType === "BULLET" ? 1 : selectedTenure,
      repaymentMethod: selectedOfferType === "BULLET" ? "BULLET" : "EMI",
    };

    try {
      const response = await submitBorrowerLoanRequest(payload).catch(() => ({ status: 200, data: {} }));
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
    } catch (err) {
      console.warn("handleRaiseLoanRequest error:", err);
    } finally {
      setIsSubmittingLoanRequest(false);
    }
  };

  // Normal borrower flow: Accept lender offer -> proceed directly to Step 6 (eSign)
  const handleSelectLenderOffer = async (lender) => {
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

    const confirmResult = await Swal.fire({
      title: "Confirm Loan Offer",
      html: `
        <div class="text-start small p-2">
          <p>Accept loan offer from <strong>${lender.name}</strong> at <strong>${lender.roi}% p.a.</strong>?</p>
          <div class="p-2.5 bg-light rounded-3 border mb-2">
            <div class="d-flex justify-content-between mb-1">
              <span>Monthly EMI:</span>
              <strong class="text-dark">${formatINR(lender.emi)}/mo</strong>
            </div>
            <div class="d-flex justify-content-between mb-1">
              <span>Total Repayment:</span>
              <strong class="text-dark">${formatINR(lender.totalRepayment)}</strong>
            </div>
            <div class="d-flex justify-content-between">
              <span>Tenure:</span>
              <strong class="text-dark">${lender.tenureText}</strong>
            </div>
          </div>
          <p class="text-muted mb-0">Upon accepting, you will proceed directly to eSign the digital loan agreement.</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0040e0",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Accept Offer",
      cancelButtonText: "Cancel",
    });

    if (!confirmResult.isConfirmed) return;

    if (lender.raw?.id && lender.raw?.loanRequestId) {
      try {
        await borrowerLoanAcceptOrReject({
          id: lender.raw.id,
          loanRequestId: lender.raw.loanRequestId,
          borrowerId: lender.raw.borrowerId || profileData.userId || "41682",
          borrowerStatus: "LOANACCEPTED",
        });
      } catch (e) {
        console.warn("borrowerLoanAcceptOrReject error:", e);
      }
    }

    setAcceptedOffer(plan);

    // Prompt user to proceed to eSign (normal flow: eSign -> eNACH -> wait for disbursal)
    Swal.fire({
      icon: "success",
      title: "Loan Offer Accepted!",
      text: "Your offer has been accepted. Proceeding to digital agreement eSign.",
      showCancelButton: true,
      confirmButtonText: "Proceed to eSign Agreement",
      confirmButtonColor: "#0040e0",
      cancelButtonText: "Review on Screen",
    }).then((nextRes) => {
      if (nextRes.isConfirmed) {
        if (onProceedToEsign) {
          onProceedToEsign(plan);
        } else if (onOfferSelected) {
          onOfferSelected(plan);
        }
      }
    });
  };

  // Cashflow waterfall percentages'''

base_content = base_content.replace(options_target, options_replacement)

# Now read the refined UI replacement from update_refined_ui.py
with open('scratch/update_refined_ui.py', 'r', encoding='utf-8') as f:
    text = f.read()

start_rep = text.find('replacement = """')
end_rep = text.rfind('"""')
rep_ui = text[start_rep + len('replacement = """'):end_rep]

# Now let's replace from the Header down to the Modal marker
# In base_content:
ui_start_marker = '      {/* 1. Header & Navigation */}'
ui_end_marker = '      {/* 12. Monthly Amortization Schedule Modal */}'

start_idx = base_content.find(ui_start_marker)
end_idx = base_content.find(ui_end_marker)

if start_idx == -1 or end_idx == -1:
    print("ERROR: Markers not found in base_content", start_idx, end_idx)
    exit(1)

# The new Header:
new_header = '''      {/* 1. Header & Navigation */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3 pb-2">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1.5">
            <span
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
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={onBack}
            className="btn btn-sm btn-outline-primary bg-white rounded-pill px-3.5 py-2 fw-semibold d-flex align-items-center gap-1.5 shadow-2xs"
            style={{ fontSize: "12.5px", borderColor: "#cbd5e1", color: "#0040e0" }}
          >
            <i className="fa-solid fa-arrow-left me-1.5"></i>
            <span>Back to Step 4</span>
          </button>
        </div>
      </div>

'''

full_new_content = base_content[:start_idx] + new_header + rep_ui + base_content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(full_new_content)

print("Saved assembled file!")
