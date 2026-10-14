import React, { useState } from "react";
import { analyzeAdminAIPayslip } from "../../../HttpRequest/admin";

const AdminAIPayslipReader = () => {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const cleanEmployee = (value) => String(value || "").split(/\s+(?:Bank Name|PF UAN|PF No\.?|Aadhar|PAN)\s*:/i)[0].trim();
  const cleanEmployeeId = (value) => String(value || "").split(/\s+(?:Aadhar|PAN|Bank Name|PF UAN)\s*:/i)[0].trim();
  const detail = (key, fallback, cleaner = (value) => value) => {
    const value = result?.details?.[key] || fallback;
    return cleaner(value) || "—";
  };

  const analyze = async (event) => {
    event.preventDefault();
    if (!file) return setError("Choose a payslip PDF first.");
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await analyzeAdminAIPayslip(file, password);
      setResult(response?.data || response);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Payslip analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ai-report-section payslip-reader">
      <div className="payslip-reader__intro">
        <div>
          <span className="payslip-reader__eyebrow">DOCUMENT EXTRACTION</span>
          <h2 className="payslip-reader__title">Upload and read a payslip</h2>
          <p className="payslip-reader__subtitle">Extract employee and salary details from a PDF securely for review.</p>
        </div>
        <div className="payslip-reader__badge"><i className="fas fa-file-invoice" /> PDF reader</div>
      </div>
      <form onSubmit={analyze} className="payslip-reader__upload">
        <div className="payslip-reader__field payslip-reader__field--file">
          <label htmlFor="payslip-file">Payslip PDF</label>
          <input id="payslip-file" className="form-control" type="file" accept=".pdf,application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div className="payslip-reader__field">
          <label htmlFor="payslip-password">PDF password <span>(optional)</span></label>
          <input id="payslip-password" className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password if protected" />
        </div>
        <button className="payslip-reader__submit" type="submit" disabled={loading}>
          <i className="fas fa-wand-magic-sparkles me-2" />{loading ? "Reading…" : "Analyze payslip"}
        </button>
      </form>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      {result && (
        <div className="payslip-reader__result">
          <div className="payslip-reader__result-head">
            <div>
              <span className="payslip-reader__eyebrow">EXTRACTION RESULT</span>
              <h3>Salary summary</h3>
            </div>
            <span className="payslip-reader__status"><i className="fas fa-check-circle me-1" /> Read successfully</span>
          </div>
          <div className="table-responsive">
          <table className="table payslip-reader__table">
            <tbody>
              <tr><th>Employee</th><td>{detail("Employee Name", result.employeeName, cleanEmployee)}</td></tr>
              <tr><th>Employee ID</th><td>{detail("Employee ID", result.employeeId, cleanEmployeeId)}</td></tr>
              <tr><th>Company</th><td>{result.companyName || result.employerName || "—"}</td></tr>
              <tr><th>Pay period</th><td>{result.payPeriod || "—"}</td></tr>
              <tr><th>Generated month</th><td>{result.generatedMonth || result.payPeriod || "—"}</td></tr>
              <tr><th>Pay frequency</th><td>{result.payFrequency || "—"}</td></tr>
              <tr><th>Pay date</th><td>{result.payDate || "—"}</td></tr>
              <tr><th>Currency</th><td>{result.currency || "—"}</td></tr>
              <tr><th>Basic salary</th><td>{result.basicSalary ?? "—"}</td></tr>
              <tr><th>Gross salary</th><td>{result.grossSalary ?? "—"}</td></tr>
              <tr><th>Total deductions</th><td>{result.totalDeductions ?? "—"}</td></tr>
              <tr><th>Net salary</th><td>{result.netSalary ?? "—"}</td></tr>
              <tr><th>Earnings</th><td>{Object.entries(result.earnings || {}).map(([label, value]) => `${label}: ${value}`).join(" · ") || "—"}</td></tr>
              <tr><th>Deductions</th><td>{Object.entries(result.deductions || {}).map(([label, value]) => `${label}: ${value}`).join(" · ") || "—"}</td></tr>
              {Object.entries(result.details || {}).map(([label, value]) => (
                <tr key={label}><th>{label}</th><td>{value || "—"}</td></tr>
              ))}
              <tr><th>Confidence</th><td>{result.confidence == null ? "—" : `${Math.round(result.confidence * 100)}%`}</td></tr>
            </tbody>
          </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminAIPayslipReader;
