import React, { useState } from "react";
import { formatINR } from "./instantLoanCalculations";
import {
  DEFAULT_RULES_CONFIG,
  saveAndActivateRules,
  listRuleVersions,
  resetRulesToDefault,
} from "./instantLoanRules";
import Swal from "sweetalert2";

const AdminRulesModal = ({ currentRules, onRulesUpdated, onClose }) => {
  const [formData, setFormData] = useState({ ...currentRules });
  const [selectedVersionId, setSelectedVersionId] = useState(currentRules.versionId);
  const [showCompare, setShowCompare] = useState(false);
  const [compareTarget, setCompareTarget] = useState(DEFAULT_RULES_CONFIG);

  const versions = listRuleVersions();

  const handleFieldChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleNestedChange = (parent, field, val) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: val,
      },
    }));
  };

  const handleSaveAndActivate = (e) => {
    e.preventDefault();
    const updated = saveAndActivateRules({
      ...formData,
      versionId: `RULES_v2.${Date.now().toString().slice(-4)}_CUSTOM`,
    });
    Swal.fire({
      icon: "success",
      title: "Underwriting Rules Activated",
      text: `Version ${updated.versionId} is now actively governing all automated frontend credit evaluations.`,
      timer: 1600,
      showConfirmButton: false,
    });
    onRulesUpdated(updated);
    if (onClose) onClose();
  };

  const handleReset = () => {
    Swal.fire({
      title: "Reset to Default Policies?",
      text: "This will restore the standard baseline underwriting policy v2.4.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Reset to Default",
      cancelButtonText: "Cancel",
    }).then((res) => {
      if (res.isConfirmed) {
        const resetRules = resetRulesToDefault();
        setFormData(resetRules);
        onRulesUpdated(resetRules);
        Swal.fire({
          icon: "success",
          title: "Restored Default Rules",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div className="studio-card mb-4">
      <div className="studio-card-header bg-dark text-white">
        <div className="d-flex align-items-center gap-2">
          <i className="fa-solid fa-sliders text-warning fs-5"></i>
          <div>
            <h5 className="fw-bold mb-0 text-white">Underwriting Rules & Policy Governance Studio</h5>
            <small className="text-light opacity-75">Configure multipliers, risk weights, pricing components, and stress assumptions in localStorage</small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-light rounded-pill px-3"
            onClick={() => setShowCompare(!showCompare)}
          >
            <i className="fa-solid fa-code-compare me-1"></i>
            {showCompare ? "Exit Comparison" : "Compare Versions"}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-warning rounded-pill px-3"
            onClick={handleReset}
          >
            <i className="fa-solid fa-rotate-left me-1"></i> Reset to Default
          </button>
          {onClose && (
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          )}
        </div>
      </div>

      <div className="studio-card-body">
        {/* Version Switcher Bar */}
        <div className="p-3 bg-light rounded-3 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary rounded-pill px-3 py-1 font-monospace">
              Active: {formData.versionId}
            </span>
            <span className="fw-bold text-dark small">{formData.versionName}</span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <label className="text-muted small mb-0 fw-semibold">Saved Versions:</label>
            <select
              className="form-select form-select-sm"
              style={{ width: "220px" }}
              value={selectedVersionId}
              onChange={(e) => {
                const targetVer = versions.find((v) => v.versionId === e.target.value);
                if (targetVer) {
                  setSelectedVersionId(targetVer.versionId);
                  setFormData(targetVer);
                  setCompareTarget(targetVer);
                }
              }}
            >
              {versions.map((v) => (
                <option key={v.versionId} value={v.versionId}>
                  {v.versionId} - {v.versionName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form Inputs for Policy Rules */}
        <form onSubmit={handleSaveAndActivate}>
          <div className="row g-4">
            {/* Section 1: Capacity & Surplus Policy */}
            <div className="col-12 col-lg-6">
              <div className="p-3 border rounded-3 h-100">
                <h6 className="fw-bold text-primary mb-3">
                  <i className="fa-solid fa-scale-balanced me-1"></i> Capacity & Surplus Engine Policy
                </h6>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-dark">Capacity Calculation Mode</label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.capacityPolicyMode}
                    onChange={(e) => handleFieldChange("capacityPolicyMode", e.target.value)}
                  >
                    <option value="SURPLUS_MULTIPLIER">Configurable Surplus Multiplier (e.g. 5x Surplus)</option>
                    <option value="SAFE_EMI_CASHFLOW">Pure Safe EMI Cashflow Amortization</option>
                    <option value="BALANCED_HYBRID">Balanced Hybrid Capacity Model</option>
                  </select>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small text-muted">Surplus Multiplier (x)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="10"
                      className="form-control form-control-sm"
                      value={formData.surplusMultiplier}
                      onChange={(e) => handleFieldChange("surplusMultiplier", Number(e.target.value))}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted">Min Surplus Floor (₹)</label>
                    <input
                      type="number"
                      step="500"
                      className="form-control form-control-sm"
                      value={formData.minSurplusThreshold}
                      onChange={(e) => handleFieldChange("minSurplusThreshold", Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label small text-muted">Max Surplus for EMI (%)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.2"
                      max="0.8"
                      className="form-control form-control-sm"
                      value={formData.maxSurplusAllocationRatio}
                      onChange={(e) => handleFieldChange("maxSurplusAllocationRatio", Number(e.target.value))}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted">Residual Buffer (₹)</label>
                    <input
                      type="number"
                      step="500"
                      className="form-control form-control-sm"
                      value={formData.minSurplusBuffer}
                      onChange={(e) => handleFieldChange("minSurplusBuffer", Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Affordability & Loan Boundaries */}
            <div className="col-12 col-lg-6">
              <div className="p-3 border rounded-3 h-100">
                <h6 className="fw-bold text-primary mb-3">
                  <i className="fa-solid fa-gauge-high me-1"></i> Affordability & Product Bounds
                </h6>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small text-muted">Max Policy FOIR (%)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.3"
                      max="0.8"
                      className="form-control form-control-sm"
                      value={formData.maxFoirLimit}
                      onChange={(e) => handleFieldChange("maxFoirLimit", Number(e.target.value))}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted">Bureau Score Cutoff</label>
                    <input
                      type="number"
                      step="10"
                      min="550"
                      max="750"
                      className="form-control form-control-sm"
                      value={formData.hardCreditScoreCutoff}
                      onChange={(e) => handleFieldChange("hardCreditScoreCutoff", Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label small text-muted">Minimum Loan (₹)</label>
                    <input
                      type="number"
                      step="1000"
                      className="form-control form-control-sm"
                      value={formData.minLoanAmount}
                      onChange={(e) => handleFieldChange("minLoanAmount", Number(e.target.value))}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted">Maximum Loan (₹)</label>
                    <input
                      type="number"
                      step="5000"
                      className="form-control form-control-sm"
                      value={formData.maxLoanAmount}
                      onChange={(e) => handleFieldChange("maxLoanAmount", Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label small text-muted">Max Acceptable PD (%)</label>
                    <input
                      type="number"
                      step="0.005"
                      className="form-control form-control-sm"
                      value={formData.maxAllowedPD}
                      onChange={(e) => handleFieldChange("maxAllowedPD", Number(e.target.value))}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted">Baseline LGD (%)</label>
                    <input
                      type="number"
                      step="0.05"
                      className="form-control form-control-sm"
                      value={formData.baselineLGD}
                      onChange={(e) => handleFieldChange("baselineLGD", Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Pricing Engine Breakdown */}
            <div className="col-12 col-lg-6">
              <div className="p-3 border rounded-3 h-100">
                <h6 className="fw-bold text-primary mb-3">
                  <i className="fa-solid fa-percent me-1"></i> Dynamic Pricing Rate Components (% p.a.)
                </h6>

                <div className="row g-2">
                  <div className="col-4">
                    <label className="form-label small text-muted">Base Rate</label>
                    <input
                      type="number"
                      step="0.25"
                      className="form-control form-control-sm"
                      value={formData.pricingComponents?.baseRate}
                      onChange={(e) => handleNestedChange("pricingComponents", "baseRate", Number(e.target.value))}
                    />
                  </div>
                  <div className="col-4">
                    <label className="form-label small text-muted">Operating Cost</label>
                    <input
                      type="number"
                      step="0.25"
                      className="form-control form-control-sm"
                      value={formData.pricingComponents?.operatingCost}
                      onChange={(e) => handleNestedChange("pricingComponents", "operatingCost", Number(e.target.value))}
                    />
                  </div>
                  <div className="col-4">
                    <label className="form-label small text-muted">Collection Cost</label>
                    <input
                      type="number"
                      step="0.25"
                      className="form-control form-control-sm"
                      value={formData.pricingComponents?.collectionCost}
                      onChange={(e) => handleNestedChange("pricingComponents", "collectionCost", Number(e.target.value))}
                    />
                  </div>
                  <div className="col-4 mt-2">
                    <label className="form-label small text-muted">Capital Cost</label>
                    <input
                      type="number"
                      step="0.25"
                      className="form-control form-control-sm"
                      value={formData.pricingComponents?.capitalCost}
                      onChange={(e) => handleNestedChange("pricingComponents", "capitalCost", Number(e.target.value))}
                    />
                  </div>
                  <div className="col-4 mt-2">
                    <label className="form-label small text-muted">Target Margin</label>
                    <input
                      type="number"
                      step="0.25"
                      className="form-control form-control-sm"
                      value={formData.pricingComponents?.targetMargin}
                      onChange={(e) => handleNestedChange("pricingComponents", "targetMargin", Number(e.target.value))}
                    />
                  </div>
                  <div className="col-4 mt-2">
                    <label className="form-label small text-muted">Processing Fee</label>
                    <input
                      type="number"
                      step="0.005"
                      className="form-control form-control-sm"
                      value={formData.processingFeeRate}
                      onChange={(e) => handleFieldChange("processingFeeRate", Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Institutional Concentration Caps */}
            <div className="col-12 col-lg-6">
              <div className="p-3 border rounded-3 h-100">
                <h6 className="fw-bold text-primary mb-3">
                  <i className="fa-solid fa-shield-cat me-1"></i> Company Safety & Concentration Limits (₹)
                </h6>

                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label small text-muted">Max Single Borrower (₹)</label>
                    <input
                      type="number"
                      step="10000"
                      className="form-control form-control-sm"
                      value={formData.safetyLimits?.maxSingleBorrowerExposure}
                      onChange={(e) => handleNestedChange("safetyLimits", "maxSingleBorrowerExposure", Number(e.target.value))}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small text-muted">Employer Cluster Cap (₹)</label>
                    <input
                      type="number"
                      step="50000"
                      className="form-control form-control-sm"
                      value={formData.safetyLimits?.maxEmployerConcentration}
                      onChange={(e) => handleNestedChange("safetyLimits", "maxEmployerConcentration", Number(e.target.value))}
                    />
                  </div>
                  <div className="col-6 mt-2">
                    <label className="form-label small text-muted">City / Geo Cap (₹)</label>
                    <input
                      type="number"
                      step="100000"
                      className="form-control form-control-sm"
                      value={formData.safetyLimits?.maxGeoConcentration}
                      onChange={(e) => handleNestedChange("safetyLimits", "maxGeoConcentration", Number(e.target.value))}
                    />
                  </div>
                  <div className="col-6 mt-2">
                    <label className="form-label small text-muted">Liquidity Buffer (₹)</label>
                    <input
                      type="number"
                      step="100000"
                      className="form-control form-control-sm"
                      value={formData.safetyLimits?.minLiquidityBuffer}
                      onChange={(e) => handleNestedChange("safetyLimits", "minLiquidityBuffer", Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-4"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary rounded-pill px-4 fw-bold shadow-xs"
            >
              <i className="fa-solid fa-bolt me-1"></i> Save & Activate Policy Version
            </button>
          </div>
        </form>

        {/* Side-by-Side Version Comparison Table */}
        {showCompare && (
          <div className="mt-4 pt-4 border-top">
            <h6 className="fw-bold text-dark mb-3">
              <i className="fa-solid fa-code-compare text-primary me-1"></i> Policy Version Comparison: Current Draft vs {compareTarget.versionId}
            </h6>
            <div className="table-responsive">
              <table className="table table-bordered table-sm small">
                <thead className="table-light">
                  <tr>
                    <th>Policy Parameter</th>
                    <th>Current Active ({formData.versionId})</th>
                    <th>Comparison Baseline ({compareTarget.versionId})</th>
                    <th>Difference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Capacity Mode</td>
                    <td className="fw-bold">{formData.capacityPolicyMode}</td>
                    <td>{compareTarget.capacityPolicyMode}</td>
                    <td>{formData.capacityPolicyMode !== compareTarget.capacityPolicyMode ? "Modified" : "Identical"}</td>
                  </tr>
                  <tr>
                    <td>Surplus Multiplier</td>
                    <td className="fw-bold">{formData.surplusMultiplier}x</td>
                    <td>{compareTarget.surplusMultiplier}x</td>
                    <td>{(formData.surplusMultiplier - compareTarget.surplusMultiplier).toFixed(1)}x</td>
                  </tr>
                  <tr>
                    <td>Max FOIR Limit</td>
                    <td className="fw-bold">{formData.maxFoirLimit * 100}%</td>
                    <td>{compareTarget.maxFoirLimit * 100}%</td>
                    <td>{((formData.maxFoirLimit - compareTarget.maxFoirLimit) * 100).toFixed(0)}%</td>
                  </tr>
                  <tr>
                    <td>Credit Score Hard Cutoff</td>
                    <td className="fw-bold">{formData.hardCreditScoreCutoff}</td>
                    <td>{compareTarget.hardCreditScoreCutoff}</td>
                    <td>{formData.hardCreditScoreCutoff - compareTarget.hardCreditScoreCutoff}</td>
                  </tr>
                  <tr>
                    <td>Max Single Borrower Limit</td>
                    <td className="fw-bold">{formatINR(formData.safetyLimits?.maxSingleBorrowerExposure)}</td>
                    <td>{formatINR(compareTarget.safetyLimits?.maxSingleBorrowerExposure)}</td>
                    <td>{formatINR(formData.safetyLimits?.maxSingleBorrowerExposure - compareTarget.safetyLimits?.maxSingleBorrowerExposure)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRulesModal;
