import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postMarketplaceLoanRequest, calculateFees } from "../../../HttpRequest/afterlogin";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";

const LOAN_PURPOSES = ["Personal", "Medical", "Education", "Business", "Home Renovation", "Wedding", "Travel", "Other"];
const DURATIONS = [3, 6, 12, 18, 24, 36, 48, 60];

function formatIndian(num) {
  if (!num) return "";
  return Number(num).toLocaleString("en-IN");
}

function calcEmi(amount, months, rate) {
  if (!amount || !months || !rate) return 0;
  const r = rate / 100 / 12;
  const n = months;
  const emi = (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
}

export default function PostLoanRequest() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    loanAmount: "",
    loanPurpose: "Personal",
    durationMonths: 12,
    preferredMinRate: 12,
    preferredMaxRate: 18,
    description: "",
    repaymentMethod: "PI",
  });
  const [fees, setFees] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (form.loanAmount && Number(form.loanAmount) >= 10000) {
      calculateFees(form.loanAmount, "MARKETPLACE")
        .then((res) => { if (res && res.data) setFees(res.data); })
        .catch(() => {});
    } else {
      setFees(null);
    }
  }, [form.loanAmount]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const validate = () => {
    const amt = Number(form.loanAmount);
    if (!amt || amt < 10000 || amt > 5000000) return "Loan amount must be between ₹10,000 and ₹50,00,000";
    if (!form.loanPurpose) return "Please select a loan purpose";
    if (!form.durationMonths) return "Please select a duration";
    if (Number(form.preferredMinRate) < 10) return "Minimum rate must be at least 10%";
    if (Number(form.preferredMaxRate) > 36) return "Maximum rate cannot exceed 36%";
    if (Number(form.preferredMinRate) > Number(form.preferredMaxRate)) return "Min rate cannot be greater than max rate";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      const res = await postMarketplaceLoanRequest({
        loanAmount: Number(form.loanAmount),
        loanPurpose: form.loanPurpose,
        durationMonths: Number(form.durationMonths),
        preferredMinRate: Number(form.preferredMinRate),
        preferredMaxRate: Number(form.preferredMaxRate),
        description: form.description,
        repaymentMethod: form.repaymentMethod,
      });
      if (res && res.data) {
        setSuccess("Loan request posted successfully! Lenders near you will be notified.");
        setTimeout(() => navigate("/my-marketplace-loans"), 2000);
      }
    } catch (e) {
      setError(e?.response?.data?.error || "Failed to post loan request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const midRate = (Number(form.preferredMinRate) + Number(form.preferredMaxRate)) / 2;
  const emi = calcEmi(Number(form.loanAmount), Number(form.durationMonths), midRate);

  return (
    <div className="main-wrapper">
      <BorrowerHeader />
      <BorrowerSidebar />
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Post Open Market Loan Request</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">Borrower</li>
                <li className="breadcrumb-item active">Post Loan Request</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h4 className="card-title">Loan Details</h4>
              </div>
              <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Loan Amount (₹) <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      name="loanAmount"
                      className="form-control"
                      placeholder="e.g. 100000"
                      min={10000}
                      max={5000000}
                      value={form.loanAmount}
                      onChange={handleChange}
                    />
                    {form.loanAmount && <small className="text-muted">₹{formatIndian(form.loanAmount)}</small>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Loan Purpose <span className="text-danger">*</span></label>
                    <select name="loanPurpose" className="form-control" value={form.loanPurpose} onChange={handleChange}>
                      {LOAN_PURPOSES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Duration <span className="text-danger">*</span></label>
                    <select name="durationMonths" className="form-control" value={form.durationMonths} onChange={handleChange}>
                      {DURATIONS.map((d) => <option key={d} value={d}>{d} Months</option>)}
                    </select>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Min Rate (%) <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      name="preferredMinRate"
                      className="form-control"
                      min={10}
                      max={36}
                      step={0.5}
                      value={form.preferredMinRate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">Max Rate (%) <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      name="preferredMaxRate"
                      className="form-control"
                      min={10}
                      max={36}
                      step={0.5}
                      value={form.preferredMaxRate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Repayment Method</label>
                    <select name="repaymentMethod" className="form-control" value={form.repaymentMethod} onChange={handleChange}>
                      <option value="PI">PI — Principal + Interest (EMI)</option>
                      <option value="I">I — Interest Only</option>
                    </select>
                  </div>

                  <div className="col-md-12 mb-3">
                    <label className="form-label">Description (optional)</label>
                    <textarea
                      name="description"
                      className="form-control"
                      rows={3}
                      maxLength={500}
                      placeholder="Brief note about why you need this loan..."
                      value={form.description}
                      onChange={handleChange}
                    />
                    <small className="text-muted">{form.description.length}/500</small>
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-lg w-100"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Posting..." : "Post Loan Request to Marketplace"}
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            {form.loanAmount > 0 && (
              <div className="card border-info">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">EMI Preview</h5>
                </div>
                <div className="card-body">
                  <p className="mb-1">At mid-rate ({midRate.toFixed(1)}%)</p>
                  <h4 className="text-primary">₹{formatIndian(emi)} / month</h4>
                  <hr />
                  <p className="mb-1"><strong>Rate Range:</strong> {form.preferredMinRate}% – {form.preferredMaxRate}%</p>
                  <p className="mb-1"><strong>Duration:</strong> {form.durationMonths} months</p>
                  <p className="mb-0"><strong>Total Payable:</strong> ₹{formatIndian(emi * form.durationMonths)}</p>
                </div>
              </div>
            )}

            {fees && (
              <div className="card border-warning mt-3">
                <div className="card-header bg-warning">
                  <h5 className="mb-0">Processing Fee</h5>
                </div>
                <div className="card-body">
                  <p className="mb-1"><strong>Borrower Fee:</strong> ₹{formatIndian(fees.borrowerFee)}</p>
                  <p className="mb-1"><strong>Lender Fee:</strong> ₹{formatIndian(fees.lenderFee)}</p>
                  <hr />
                  <p className="mb-0"><strong>Net Disbursement:</strong> ₹{formatIndian(fees.netDisbursementToBorrower)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
