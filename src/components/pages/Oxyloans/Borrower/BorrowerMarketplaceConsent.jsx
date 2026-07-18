import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { submitBorrowerConsent, getMarketplaceLoanDetail, calculateFees, getNegotiationOffers } from "../../../HttpRequest/afterlogin";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";

const REQUIRED_KEYS = [
  "MARKETPLACE_DISCLAIMER",
  "LEGAL_NOTICE_CONSENT",
  "CASE_FILING_CONSENT",
  "VIDEO_RELEASE_CONSENT",
  "SOCIAL_MEDIA_CONSENT",
  "REPAYMENT_AGREEMENT",
];

const CHECKBOX_LABELS = {
  MARKETPLACE_DISCLAIMER:
    "I acknowledge that OxyLoans is a marketplace platform only and bears NO responsibility for loan repayment by the borrower.",
  LEGAL_NOTICE_CONSENT:
    "I consent to receiving legal notices via registered post and email if I miss any EMI payment.",
  CASE_FILING_CONSENT:
    "I consent to legal case filing in appropriate courts in case of default or non-payment.",
  VIDEO_RELEASE_CONSENT:
    "I consent to OxyLoans retaining my consent video and releasing it to the lender in case of extended default beyond 90 days.",
  SOCIAL_MEDIA_CONSENT:
    "I consent to social media disclosure of my default status on platforms including Instagram and WhatsApp groups in case of default exceeding 90 days.",
  REPAYMENT_AGREEMENT:
    "I agree to the repayment schedule, EMI dates, and penalty charges of 2% per month on overdue amounts.",
};

export default function BorrowerMarketplaceConsent() {
  const { loanRequestId } = useParams();
  const navigate = useNavigate();
  const [checked, setChecked] = useState({});
  const [loan, setLoan] = useState(null);
  const [acceptedOfferAmount, setAcceptedOfferAmount] = useState(null);
  const [fees, setFees] = useState(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setLoadingPage(true);
    setLoadError("");
    Promise.all([
      getMarketplaceLoanDetail(loanRequestId),
      getNegotiationOffers(loanRequestId),
    ])
      .then(([loanRes, offersRes]) => {
        if (loanRes?.data) {
          const loanData = loanRes.data;
          setLoan(loanData);
          // If consent already done, redirect to fee disclosure (next step)
          const alreadyConsented =
            loanData.borrowerConsentDone === true ||
            loanData.loanStatus === "ESIGN_PENDING" ||
            loanData.loanStatus === "ESIGN_DONE" ||
            loanData.loanStatus === "ENACH_INITIATED" ||
            loanData.loanStatus === "ENACH_APPROVED" ||
            loanData.loanStatus === "DISBURSAL_PENDING" ||
            loanData.loanStatus === "DISBURSED";
          if (alreadyConsented) {
            navigate(`/borrower/fee-disclosure/${loanRequestId}`, { replace: true });
            return;
          }
        } else {
          setLoadError("Could not load loan details.");
        }
        const offers = offersRes?.data || [];
        const accepted = offers.find((o) => o.status === "ACCEPTED");
        const effectiveAmount = accepted?.offeredAmount || loanRes?.data?.loanAmount;
        if (accepted?.offeredAmount) setAcceptedOfferAmount(accepted.offeredAmount);
        if (effectiveAmount) {
          calculateFees(effectiveAmount, "MARKETPLACE")
            .then((fr) => { if (fr?.data) setFees(fr.data); })
            .catch(() => {});
        }
      })
      .catch((e) => {
        const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || "Failed to load consent page.";
        setLoadError(`Error: ${msg}`);
      })
      .finally(() => setLoadingPage(false));
  }, [loanRequestId]);

  const allChecked = REQUIRED_KEYS.every((k) => checked[k]);

  const toggle = (key) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = async () => {
    if (!allChecked) { setError("Please check all boxes to proceed."); return; }
    setSubmitting(true);
    setError("");
    try {
      const checkedBoxes = REQUIRED_KEYS.filter((k) => checked[k]);
      await submitBorrowerConsent(loanRequestId, checkedBoxes);
      setSuccess("Consent recorded. Redirecting to eSign...");
      navigate(`/esign/${loanRequestId}`);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to submit consent. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-wrapper">
      <BorrowerHeader />
      <BorrowerSidebar />
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header">
          <h3 className="page-title">Marketplace Lending Agreement &amp; Consent</h3>
          <p className="text-muted">Please read each item carefully and check all boxes to proceed.</p>
        </div>

        {loadingPage && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
            <p className="mt-2 text-muted">Loading consent details...</p>
          </div>
        )}

        {!loadingPage && loadError && (
          <div className="alert alert-danger">
            <strong>Could not load this page.</strong> {loadError}
          </div>
        )}

        {!loadingPage && !loadError && loan && (
          <div className="card border-info mb-3">
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <strong>Loan Amount:</strong> ₹{Number(acceptedOfferAmount || loan.loanAmount).toLocaleString("en-IN")}
                  {acceptedOfferAmount && acceptedOfferAmount !== loan.loanAmount && (
                    <small className="text-muted d-block">Requested: ₹{Number(loan.loanAmount).toLocaleString("en-IN")}</small>
                  )}
                </div>
                <div className="col-md-3"><strong>Purpose:</strong> {loan.loanPurpose}</div>
                <div className="col-md-3"><strong>Duration:</strong> {loan.durationMonths} months</div>
                {fees && <div className="col-md-3"><strong>Processing Fee:</strong> ₹{Number(fees.borrowerFee).toLocaleString("en-IN")}</div>}
              </div>
            </div>
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {!loadingPage && !loadError && <div className="card">
          <div className="card-body">
            {REQUIRED_KEYS.map((key) => (
              <div key={key} className={`p-3 mb-3 rounded border ${checked[key] ? "border-success bg-light" : "border-secondary"}`}>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={key}
                    checked={!!checked[key]}
                    onChange={() => toggle(key)}
                  />
                  <label className="form-check-label" htmlFor={key}>
                    {CHECKBOX_LABELS[key]}
                  </label>
                </div>
              </div>
            ))}

            <div className="border rounded p-3 mb-4 bg-light" style={{ maxHeight: 200, overflowY: "auto" }}>
              <h6>Legal Terms</h6>
              <p className="small text-muted">
                This agreement ("Agreement") is entered into between the Borrower and the Lender, facilitated by OxyLoans
                (NBFC-P2P Registration No: N-13.02268), hereinafter referred to as the "Platform". The Platform acts solely
                as a facilitator and does not guarantee repayment. The Borrower agrees to all terms and conditions set forth
                herein including EMI schedules, penalty clauses, legal recovery mechanisms, and disclosure norms as per
                RBI NBFC-P2P Master Directions 2017 and amendments thereof. This consent is digitally signed and legally
                binding under the Information Technology Act, 2000.
              </p>
            </div>

            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleSubmit}
                disabled={!allChecked || submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Submitting...
                  </>
                ) : (
                  "I Agree & Proceed to eSign"
                )}
              </button>
              {!allChecked && (
                <span className="text-danger small">
                  {REQUIRED_KEYS.filter((k) => !checked[k]).length} checkbox(es) remaining
                </span>
              )}
            </div>
          </div>
        </div>}
      </div>
    </div>
    </div>
  );
}
