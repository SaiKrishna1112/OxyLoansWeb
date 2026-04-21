import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { submitLenderConsent, getMarketplaceLoanDetail, calculateFees, getNegotiationOffers } from "../../../HttpRequest/afterlogin";
import Header from "../../../Header/Header";
import Sidebar from "../../../SideBar/SideBar";

const REQUIRED_KEYS = [
  "NO_GUARANTEE_ACKNOWLEDGMENT",
  "MARKETPLACE_ONLY_ACKNOWLEDGMENT",
  "LEGAL_RECOVERY_RESPONSIBILITY",
  "INTEREST_RATE_AGREEMENT",
];

const CHECKBOX_LABELS = {
  NO_GUARANTEE_ACKNOWLEDGMENT:
    "I acknowledge that OxyLoans is a marketplace platform and does NOT guarantee loan repayment by the borrower.",
  MARKETPLACE_ONLY_ACKNOWLEDGMENT:
    "I understand that OxyLoans only facilitates the connection between lenders and borrowers and bears no financial liability.",
  LEGAL_RECOVERY_RESPONSIBILITY:
    "I understand that in case of borrower default, legal recovery is my own responsibility and OxyLoans will only provide support via the escalation dashboard.",
  INTEREST_RATE_AGREEMENT:
    "I agree to the negotiated interest rate, loan amount, duration, and repayment schedule with the borrower.",
};

export default function LenderMarketplaceConsent() {
  const { loanRequestId } = useParams();
  const navigate = useNavigate();
  const [checked, setChecked] = useState({});
  const [loan, setLoan] = useState(null);
  const [acceptedOfferAmount, setAcceptedOfferAmount] = useState(null);
  const [acceptedOfferRate, setAcceptedOfferRate] = useState(null);
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
          setLoan(loanRes.data);
        } else {
          setLoadError("Could not load loan details.");
        }
        const offers = offersRes?.data || [];
        const accepted = offers.find((o) => o.status === "ACCEPTED");
        const effectiveAmount = accepted?.offeredAmount || loanRes?.data?.loanAmount;
        if (accepted?.offeredAmount) setAcceptedOfferAmount(accepted.offeredAmount);
        if (accepted?.offeredRate) setAcceptedOfferRate(accepted.offeredRate);
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
      await submitLenderConsent(loanRequestId, checkedBoxes);
      setSuccess("Consent recorded successfully! Both parties have consented. The loan is now ready for disbursement.");
      setTimeout(() => navigate("/marketplace-loans"), 2000);
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to submit consent. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-wrapper">
      <Sidebar />
      <div style={{ flex: 1 }}>
      <Header />
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header">
          <h3 className="page-title">Marketplace Lending Acknowledgment</h3>
          <p className="text-muted">Please read and acknowledge all terms before proceeding.</p>
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
          <div className="card border-primary mb-3">
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <strong>Loan Amount:</strong> ₹{Number(acceptedOfferAmount || loan.loanAmount).toLocaleString("en-IN")}
                  {acceptedOfferAmount && acceptedOfferAmount !== loan.loanAmount && (
                    <small className="text-muted d-block">Requested: ₹{Number(loan.loanAmount).toLocaleString("en-IN")}</small>
                  )}
                </div>
                <div className="col-md-2"><strong>Duration:</strong> {loan.durationMonths} months</div>
                <div className="col-md-2">
                  <strong>Interest Rate:</strong> {acceptedOfferRate ? `${acceptedOfferRate}%` : `${loan.preferredMinRate || "—"}%`}
                </div>
                <div className="col-md-2"><strong>Purpose:</strong> {loan.loanPurpose}</div>
                {fees && <div className="col-md-3"><strong>Lender Fee (deducted from wallet):</strong> ₹{Number(fees.lenderFee).toLocaleString("en-IN")}</div>}
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

            <div className="d-flex align-items-center gap-3 mt-3">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleSubmit}
                disabled={!allChecked || submitting}
              >
                {submitting ? "Submitting..." : "I Agree & Submit Consent"}
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
    </div>
  );
}
