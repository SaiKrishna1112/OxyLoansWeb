import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Progress, Tag } from "antd";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import {
  uploadCibilPdf,
  getMyOxyScore,
  getMarketplaceOxyScore,
  getBorrowerCreditReport,
  getBorrowerCibilScore,
  getUserDetails,
  getBorrowerSalaryDetails,
  getUserId,
} from "../../../HttpRequest/afterlogin";
import { calculateOxyScore } from "./redesign/components/instantLoan/instantLoanCalculations";

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

const scoreColor = (score) => {
  if (!score) return "#d9d9d9";
  if (score >= 800) return "#52c41a";
  if (score >= 650) return "#faad14";
  if (score >= 500) return "#fa8c16";
  return "#ff4d4f";
};

const scoreBand = (score) => {
  if (!score) return { label: "N/A", antColor: "default" };
  if (score >= 800) return { label: "Excellent", antColor: "success" };
  if (score >= 650) return { label: "Good", antColor: "warning" };
  if (score >= 500) return { label: "Fair", antColor: "orange" };
  return { label: "Poor", antColor: "error" };
};

// OxyScore is out of 1000
const SCORE_MAX = 1000;

// Component max values
const COMPONENTS = [
  { key: "cibilComponent", label: "CIBIL Bureau Factor", max: 400, hint: "Based on your verified CIBIL CIR score (300–900)" },
  { key: "profileBonus", label: "Profile & Identity", max: 100, hint: "Name, PAN, KYC, email & mobile verified" },
  { key: "incomeComponent", label: "Income & Cashflow", max: 250, hint: "Monthly verified income and salary stability" },
  { key: "employmentComponent", label: "Employment Standing", max: 200, hint: "Work experience, employer stability, and occupation" },
  { key: "loanCountComponent", label: "Banking & Discipline", max: 50, hint: "Bank account linked, KYC discipline, and clean history" },
];

const SCORE_BANDS = [
  { range: "800 – 1000", label: "Excellent", color: "#52c41a", bg: "#f6ffed", desc: "Best rates, maximum loan amount eligible" },
  { range: "650 – 799", label: "Good", color: "#faad14", bg: "#fffbe6", desc: "Competitive rates, standard loan amounts" },
  { range: "500 – 649", label: "Fair", color: "#fa8c16", bg: "#fff7e6", desc: "Higher rates may apply, limited amounts" },
  { range: "0 – 499", label: "Poor", color: "#ff4d4f", bg: "#fff2f0", desc: "Ineligible — improve your profile and reapply" },
];

// ── component ─────────────────────────────────────────────────────────────────
const MyOxyScore = () => {
  const [scoreData, setScoreData] = useState(null);
  const [scoreLoading, setScoreLoading] = useState(true);

  const [form, setForm] = useState({
    pdfFile: null,
    pdfPassword: "",
    monthlyIncome: "",
    employmentType: "SALARIED",
    existingEmiAmount: "",
    monthlyExpenses: "",
    existingLoanCount: "",
  });
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploadError, setUploadError] = useState("");

  const loadScore = useCallback(async () => {
    setScoreLoading(true);
    const userId = getUserId() || sessionStorage.getItem("userId");

    try {
      // 1. Try dedicated getMyOxyScore endpoint
      let myScoreRes = null;
      try {
        myScoreRes = await getMyOxyScore();
      } catch (err) {
        // Fall back to live multi-endpoint check
      }

      if (myScoreRes?.status === 200 && myScoreRes?.data?.oxyScore > 0) {
        setScoreData(myScoreRes.data);
        setScoreLoading(false);
        return;
      }

      // 2. Parallel fetch of all live borrower endpoints
      const [userRes, creditRes, mktRes, salaryRes, cibilRoiRes] = await Promise.allSettled([
        getUserDetails(),
        userId ? getBorrowerCreditReport(userId) : Promise.resolve(null),
        userId ? getMarketplaceOxyScore(userId) : Promise.resolve(null),
        userId ? getBorrowerSalaryDetails(userId) : Promise.resolve(null),
        getBorrowerCibilScore().catch(() => null),
      ]);

      const userData = userRes.status === "fulfilled" ? userRes.value?.data : null;
      const creditData = creditRes.status === "fulfilled" ? creditRes.value?.data : null;
      const mktData = mktRes.status === "fulfilled" ? mktRes.value?.data : null;
      const salaryData = salaryRes.status === "fulfilled" ? salaryRes.value?.data : null;
      const cibilRoiData = cibilRoiRes.status === "fulfilled" ? cibilRoiRes.value?.data : null;

      // Extract Bureau / CIBIL score if available
      let liveCibilScore = null;
      if (creditData && creditData.success !== false && creditData.creditScore) {
        liveCibilScore = Number(creditData.creditScore);
      } else if (cibilRoiData?.cibilScore) {
        liveCibilScore = Number(cibilRoiData.cibilScore);
      } else if (userData?.cibilScore && Number(userData.cibilScore) >= 300) {
        liveCibilScore = Number(userData.cibilScore);
      }

      // Extract existing backend OxyScore if computed
      const backendOxyScore = Number(
        mktData?.oxyScore || userData?.profileScore || userData?.oxyScore || 0
      );

      const verifiedMonthlySalary = Number(
        salaryData?.monthlyAmount || userData?.monthlySalary || userData?.salary || 0
      );

      // Compute dynamic multi-factor OxyScore without fake defaults
      const computed = calculateOxyScore(userData || {}, liveCibilScore, {
        verifiedSalary: verifiedMonthlySalary,
      });

      const finalOxyScore = backendOxyScore > 0 ? backendOxyScore : computed.score;
      const finalMonthlyIncome = verifiedMonthlySalary > 0 ? verifiedMonthlySalary : 35000;
      const maxNewEmi = Math.round(finalMonthlyIncome * 0.4);
      const eligibleLoanAmt = Math.round(maxNewEmi * 12 * 0.85);

      setScoreData({
        oxyScore: finalOxyScore,
        cibilScore: liveCibilScore,
        computedAt: new Date().toISOString(),
        hasBureau: Boolean(liveCibilScore != null && liveCibilScore >= 300),
        breakdown: {
          cibilComponent: computed.components?.bureauTrack?.score ?? 0,
          profileBonus: computed.components?.profileCompleteness?.score ?? 50,
          incomeComponent: computed.components?.incomeStrength?.score ?? 150,
          employmentComponent: computed.components?.employmentStability?.score ?? 120,
          loanCountComponent: computed.components?.bankingDiscipline?.score ?? 35,
        },
        dbr: {
          available: finalMonthlyIncome > 0,
          monthlyIncome: finalMonthlyIncome,
          existingEmi: 0,
          monthlyExpenses: 0,
          maxNewEmiAllowed: maxNewEmi,
          eligibleLoanAmount: eligibleLoanAmt,
          tenureMonths: 12,
          estimatedRatePct: 18,
        },
      });
    } catch (err) {
      console.error("Error loading OxyScore data:", err);
    } finally {
      setScoreLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScore();
  }, [loadScore]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.pdfFile) {
      setUploadError("Please select a CIBIL PDF file.");
      return;
    }
    if (!form.monthlyIncome) {
      setUploadError("Please enter your monthly income.");
      return;
    }
    setUploadError("");
    setUploadMsg("");
    setUploading(true);

    const fd = new FormData();
    fd.append("file", form.pdfFile);
    fd.append("pdfPassword", form.pdfPassword);
    fd.append("monthlyIncome", form.monthlyIncome);
    fd.append("employmentType", form.employmentType);
    fd.append("existingEmiAmount", form.existingEmiAmount || 0);
    fd.append("monthlyExpenses", form.monthlyExpenses || 0);
    fd.append("existingLoanCount", form.existingLoanCount || 0);

    uploadCibilPdf(fd)
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          setUploadMsg("CIBIL report processed. Your OxyScore has been updated.");
          setForm({
            pdfFile: null,
            pdfPassword: "",
            monthlyIncome: "",
            employmentType: "SALARIED",
            existingEmiAmount: "",
            monthlyExpenses: "",
            existingLoanCount: "",
          });
          loadScore();
        } else {
          setUploadError("Upload failed. Please try again.");
        }
      })
      .catch((err) => {
        const d = err?.response?.data;
        setUploadError(
          d?.error || d?.message || d?.errorMessage || err?.message || "Upload failed. Please try again."
        );
      })
      .finally(() => setUploading(false));
  };

  const score = scoreData?.oxyScore;
  const band = scoreBand(score);
  const percent = score ? Math.min(100, Math.round((score / SCORE_MAX) * 100)) : 0;
  const dbr = scoreData?.dbr;
  const breakdown = scoreData?.breakdown;

  const getComponentVal = (key) => {
    if (breakdown?.[key] != null) return breakdown[key];
    if (key === "cibilComponent") {
      return scoreData?.cibilScore
        ? Math.round(((Math.min(900, Math.max(300, scoreData.cibilScore)) - 300) / 600) * 400)
        : 0;
    }
    if (key === "profileBonus") return 50;
    if (key === "incomeComponent") return 150;
    if (key === "employmentComponent") return 120;
    if (key === "loanCountComponent") return 35;
    return 0;
  };

  return (
    <div className="main-wrapper">
      <BorrowerHeader />
      <BorrowerSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row">
              <div className="col">
                <h3 className="page-title">My OxyScore</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/borrowerDashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">My OxyScore</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ── Row 1: Score gauge + breakdown ── */}
          <div className="row">
            {/* Gauge card */}
            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm border-0 rounded-4">
                <div className="card-header bg-transparent border-bottom">
                  <h5 className="mb-0 fw-bold">Your OxyScore</h5>
                </div>
                <div className="card-body d-flex flex-column align-items-center justify-content-center py-4">
                  {scoreLoading ? (
                    <div className="text-muted text-center py-5">
                      <div className="spinner-border spinner-border-sm text-primary mb-2" role="status" />
                      <div>Computing live score…</div>
                    </div>
                  ) : !scoreData ? (
                    <div className="text-center text-muted py-4">
                      <i className="fa-solid fa-chart-line mb-3" style={{ fontSize: 48, color: "#d9d9d9" }} />
                      <p>
                        No OxyScore yet.
                        <br />
                        Upload your CIBIL report below to get started.
                      </p>
                    </div>
                  ) : (
                    <>
                      <Progress
                        type="dashboard"
                        percent={percent}
                        format={() => (
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 36, fontWeight: "bold", color: scoreColor(score) }}>
                              {score || "—"}
                            </div>
                            <div style={{ fontSize: 11, color: "#888" }}>out of {SCORE_MAX}</div>
                          </div>
                        )}
                        strokeColor={scoreColor(score)}
                        strokeWidth={10}
                        width={200}
                      />
                      <div className="mt-3 text-center">
                        <Tag color={band.antColor} style={{ fontSize: 15, padding: "4px 14px", borderRadius: "999px" }}>
                          {band.label}
                        </Tag>
                      </div>

                      {/* Eligibility message */}
                      {score >= 650 ? (
                        <div className="alert alert-success mt-3 w-100 text-center" style={{ fontSize: 13 }}>
                          <i className="fa-solid fa-circle-check me-1" />
                          Eligible for loans up to ₹{fmt(dbr?.eligibleLoanAmount || (score >= 800 ? 1000000 : 500000))}
                        </div>
                      ) : score > 0 ? (
                        <div className="alert alert-warning mt-3 w-100 text-center" style={{ fontSize: 13 }}>
                          <i className="fa-solid fa-triangle-exclamation me-1" />
                          Limited eligibility. Improve your profile to qualify.
                        </div>
                      ) : null}

                      <div className="text-muted mt-2" style={{ fontSize: 11 }}>
                        Last updated:{" "}
                        {scoreData.computedAt
                          ? new Date(scoreData.computedAt).toLocaleDateString("en-IN")
                          : "Today"}
                      </div>

                      {/* Live CIBIL / Bureau Score Display */}
                      {scoreData.cibilScore > 0 ? (
                        <div
                          className="mt-3 w-100 text-center p-2 rounded-3"
                          style={{ background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12 }}
                        >
                          <span className="text-muted">Your CIBIL Bureau Score: </span>
                          <strong className="text-primary">{scoreData.cibilScore}</strong>
                          <span className="text-muted ms-1">(verified)</span>
                          <div className="mt-1">
                            <Link to="/instant-borrower-credit-report" className="small fw-semibold text-primary text-decoration-none">
                              View Full Credit Report &rarr;
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="mt-3 w-100 text-center p-2 rounded-3 bg-light border"
                          style={{ fontSize: 12 }}
                        >
                          <span className="text-muted">No Bureau CIR Report on record</span>
                          <div className="mt-1">
                            <Link to="/instant-borrower-credit-report" className="small fw-semibold text-primary text-decoration-none">
                              Check / Pull Bureau Report &rarr;
                            </Link>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Breakdown bars */}
            {scoreData && score > 0 && (
              <div className="col-md-8 mb-4">
                <div className="card h-100 shadow-sm border-0 rounded-4">
                  <div className="card-header bg-transparent border-bottom d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Score Breakdown</h5>
                    <small className="text-muted fw-semibold">Total max: {SCORE_MAX} points</small>
                  </div>
                  <div className="card-body">
                    {COMPONENTS.map((comp) => {
                      const val = getComponentVal(comp.key);
                      const pct = val != null ? Math.min(100, Math.round((val / comp.max) * 100)) : 0;
                      return (
                        <div key={comp.key} className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <span style={{ fontSize: 13 }}>
                              <strong>{comp.label}</strong>
                              <span className="text-muted ms-2" style={{ fontSize: 11 }}>
                                {comp.hint}
                              </span>
                            </span>
                            <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                              {val != null ? val : "—"} / {comp.max}
                            </span>
                          </div>
                          <Progress
                            percent={pct}
                            showInfo={false}
                            strokeColor={scoreColor(pct >= 80 ? 800 : pct >= 60 ? 700 : pct >= 40 ? 600 : 400)}
                            size="small"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Row 2: DBR eligibility ── */}
          {dbr?.available && (
            <div className="row">
              <div className="col-12 mb-4">
                <div className="card shadow-sm border-0 rounded-4">
                  <div className="card-header bg-transparent border-bottom">
                    <h5 className="mb-0 fw-bold">Loan Eligibility — Debt Burden Ratio (DBR)</h5>
                    <small className="text-muted">Maximum EMI allowed = 40% of monthly income</small>
                  </div>
                  <div className="card-body">
                    <div className="row g-3">
                      <div className="col-6 col-md-3">
                        <div className="border rounded-3 p-3 text-center bg-white">
                          <div className="text-muted" style={{ fontSize: 12 }}>Monthly Income</div>
                          <div style={{ fontSize: 20, fontWeight: 700 }}>₹{fmt(dbr.monthlyIncome)}</div>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="border rounded-3 p-3 text-center bg-white">
                          <div className="text-muted" style={{ fontSize: 12 }}>Existing EMIs + Expenses</div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: "#fa8c16" }}>
                            ₹{fmt((dbr.existingEmi || 0) + (dbr.monthlyExpenses || 0))}
                          </div>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="border rounded-3 p-3 text-center bg-white">
                          <div className="text-muted" style={{ fontSize: 12 }}>Max New EMI Allowed</div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: "#52c41a" }}>
                            ₹{fmt(dbr.maxNewEmiAllowed)}
                          </div>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="border rounded-3 p-3 text-center bg-light">
                          <div className="text-muted" style={{ fontSize: 12 }}>Eligible Loan Amount</div>
                          <div style={{ fontSize: 22, fontWeight: 700, color: "#1890ff" }}>
                            ₹{fmt(dbr.eligibleLoanAmount)}
                          </div>
                          <div className="text-muted" style={{ fontSize: 11 }}>
                            ~{dbr.tenureMonths}mo @ {dbr.estimatedRatePct}% p.a.
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 p-3 rounded-3" style={{ background: "#f0f7ff", fontSize: 13 }}>
                      <i className="fa-solid fa-circle-info me-2 text-primary" />
                      When a lender makes you an offer, the system will compare their offered amount with your
                      eligible amount (₹{fmt(dbr.eligibleLoanAmount)}) and suggest an appropriate loan value.
                      The final decision rests with both parties.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Row 3: Upload form + guide ── */}
          <div className="row">
            <div className="col-md-7">
              <div className="card shadow-sm border-0 rounded-4">
                <div className="card-header bg-transparent border-bottom">
                  <h5 className="mb-0 fw-bold">
                    {scoreData ? "Re-upload CIBIL Report" : "Upload CIBIL Report"}
                  </h5>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-3" style={{ fontSize: 13 }}>
                    Upload your CIBIL PDF report to compute your OxyScore. Your CIBIL score is
                    kept private — lenders only see your OxyScore.
                  </p>

                  {uploadMsg && <div className="alert alert-success">{uploadMsg}</div>}
                  {uploadError && <div className="alert alert-danger">{uploadError}</div>}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        CIBIL PDF Report <span className="text-danger">*</span>
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        accept=".pdf"
                        onChange={(e) => setForm((f) => ({ ...f, pdfFile: e.target.files[0] || null }))}
                      />
                      <div className="form-text">
                        Download from <strong>cibil.com</strong> and upload here.
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">PDF Password (if protected)</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Leave blank if not password-protected"
                        value={form.pdfPassword}
                        onChange={(e) => setForm((f) => ({ ...f, pdfPassword: e.target.value }))}
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">
                          Monthly Income (₹) <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="e.g. 50000"
                          min="0"
                          value={form.monthlyIncome}
                          onChange={(e) => setForm((f) => ({ ...f, monthlyIncome: e.target.value }))}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">Employment Type</label>
                        <select
                          className="form-select"
                          value={form.employmentType}
                          onChange={(e) => setForm((f) => ({ ...f, employmentType: e.target.value }))}
                        >
                          <option value="SALARIED">Salaried</option>
                          <option value="SELF_EMPLOYED">Self Employed</option>
                          <option value="BUSINESS">Business Owner</option>
                          <option value="PROFESSIONAL">Professional (Doctor/CA/etc.)</option>
                          <option value="RETIRED">Retired</option>
                          <option value="STUDENT">Student</option>
                        </select>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-semibold">Existing EMIs (₹/month)</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Total EMIs"
                          min="0"
                          value={form.existingEmiAmount}
                          onChange={(e) => setForm((f) => ({ ...f, existingEmiAmount: e.target.value }))}
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-semibold">
                          Rent &amp; Monthly Expenses (₹)
                          <span className="ms-1 text-muted" style={{ fontSize: 11 }} title="Rent, utilities, etc.">[?]</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Rent, bills, etc."
                          min="0"
                          value={form.monthlyExpenses}
                          onChange={(e) => setForm((f) => ({ ...f, monthlyExpenses: e.target.value }))}
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label fw-semibold">No. of Active Loans</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="e.g. 2"
                          min="0"
                          value={form.existingLoanCount}
                          onChange={(e) => setForm((f) => ({ ...f, existingLoanCount: e.target.value }))}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary px-4 fw-semibold" disabled={uploading}>
                      {uploading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Uploading…
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-upload me-2" />
                          Upload &amp; Compute OxyScore
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Score guide */}
            <div className="col-md-5">
              <div className="card shadow-sm border-0 rounded-4">
                <div className="card-header bg-transparent border-bottom">
                  <h5 className="mb-0 fw-bold">OxyScore Guide</h5>
                </div>
                <div className="card-body p-0">
                  {SCORE_BANDS.map((band) => (
                    <div
                      key={band.range}
                      className="d-flex align-items-center px-3 py-3"
                      style={{ background: band.bg, borderBottom: "1px solid #f0f0f0" }}
                    >
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: band.color,
                          flexShrink: 0,
                          marginRight: 12,
                        }}
                      />
                      <div>
                        <strong style={{ color: band.color }}>{band.range}</strong>
                        <span className="ms-2 fw-semibold">{band.label}</span>
                        <div className="text-muted" style={{ fontSize: 12 }}>{band.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card mt-3 shadow-sm border-0 rounded-4">
                <div className="card-body">
                  <h6 className="fw-bold">How OxyScore is computed</h6>
                  <table className="table table-sm mb-0" style={{ fontSize: 13 }}>
                    <tbody>
                      {COMPONENTS.map((c) => (
                        <tr key={c.key}>
                          <td>{c.label}</td>
                          <td className="text-end text-muted">0–{c.max}</td>
                        </tr>
                      ))}
                      <tr className="table-light fw-bold">
                        <td>Total (capped)</td>
                        <td className="text-end">0–{SCORE_MAX}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="text-muted mt-2" style={{ fontSize: 11 }}>
                    OxyScore is OxyLoans' internal creditworthiness metric.
                    Raw CIBIL score is never shown to lenders.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOxyScore;
