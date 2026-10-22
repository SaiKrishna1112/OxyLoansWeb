import React, { useState, useMemo, useEffect } from "react";
import { formatINR } from "./instantLoanCalculations";
import {
  runComprehensiveUnderwriting,
} from "./instantLoanCalculations";
import { getActiveRules, saveAndActivateRules } from "./instantLoanRules";
import { CUSTOMER_PERSONAS } from "./instantLoanPersonas";
import { logDecisionAudit } from "./instantLoanAuditService";

import DecisionPipelineProgress from "./DecisionPipelineProgress";
import FinancialHealthDashboard from "./FinancialHealthDashboard";
import OfferSimulator from "./OfferSimulator";
import StressTestMatrix from "./StressTestMatrix";
import CompanySafetyCard from "./CompanySafetyCard";
import ContinuousMonitoringView from "./ContinuousMonitoringView";
import AdminRulesModal from "./AdminRulesModal";
import DecisionAuditView from "./DecisionAuditView";
import UnitTestRunnerModal from "./UnitTestRunnerModal";

import "./instantLoan.css";

const IntelligentLendingStudio = ({ onApplyOffer, onClose }) => {
  // 1. Rules State
  const [rules, setRules] = useState(() => getActiveRules());

  // 2. Active Persona Selection (Default to Persona 1)
  const [activePersonaId, setActivePersonaId] = useState(CUSTOMER_PERSONAS[0].id);

  // 3. Dynamic Inputs State (Initialized from active persona)
  const [inputs, setInputs] = useState({ ...CUSTOMER_PERSONAS[0].inputs });

  // 4. Tab Navigation State
  // "PIPELINE" | "SIMULATOR" | "FINANCIALS" | "STRESS" | "SAFETY" | "MONITORING" | "AUDIT" | "RULES" | "TESTS"
  const [activeTab, setActiveTab] = useState("PIPELINE");

  // 5. Expandable Inputs Drawer toggle
  const [showInputsDrawer, setShowInputsDrawer] = useState(false);

  // Handle Persona Switching
  const handleSelectPersona = (persona) => {
    setActivePersonaId(persona.id);
    setInputs({ ...persona.inputs });
  };

  // Handle Input Changes
  const handleInputChange = (field, value) => {
    setInputs((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 6. Master Synchronous Dynamic Recalculation Engine
  // Whenever inputs OR rules change, this recalculates the ENTIRE underwriting system immediately!
  const underwritingResult = useMemo(() => {
    return runComprehensiveUnderwriting(inputs, rules);
  }, [inputs, rules]);

  // Automatically log decision to audit ledger whenever decision recalculates
  useEffect(() => {
    if (underwritingResult) {
      logDecisionAudit(underwritingResult, rules.versionId);
    }
  }, [underwritingResult?.decisionEvaluation?.decision, underwritingResult?.optimalCandidate?.amount, rules.versionId]);

  const { decisionEvaluation, optimalCandidate, requestedAmount, risk, surplus, affordability } = underwritingResult;
  const decision = decisionEvaluation.decision;

  const decisionCardClass =
    decision === "APPROVE"
      ? "decision-card-approve"
      : decision === "APPROVE_REDUCED_AMOUNT"
      ? "decision-card-reduced"
      : decision === "REVIEW"
      ? "decision-card-review"
      : "decision-card-decline";

  const decisionTitle =
    decision === "APPROVE"
      ? "FULL LOAN SANCTION APPROVED"
      : decision === "APPROVE_REDUCED_AMOUNT"
      ? "APPROVED FOR SAFE REDUCED CAPACITY"
      : decision === "REVIEW"
      ? "FLAGGED FOR UNDERWRITER MANUAL REVIEW"
      : "APPLICATION REJECTED / POLICY VIOLATION";

  return (
    <div className="intelligent-studio-wrapper py-2">
      {/* Top Bar: Studio Header & Navigation Actions */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary text-white rounded-pill px-3 py-1 small">
              <i className="fa-solid fa-microchip me-1"></i> Intelligent Lending Decision Engine
            </span>
            <span className="badge bg-dark text-white rounded-pill px-2 py-1 small font-monospace">
              Rule: {rules.versionId}
            </span>
            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-1 small d-inline-flex align-items-center gap-1">
              <span className="pulse-beacon-live" /> Real-time Simulation
            </span>
          </div>
          <h4 className="fw-extrabold text-dark mb-0">Production Underwriting Studio & Risk Assessment</h4>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold shadow-xs"
            onClick={() => setShowInputsDrawer(!showInputsDrawer)}
          >
            <i className="fa-solid fa-sliders me-1"></i>
            {showInputsDrawer ? "Hide Live Inputs" : "Edit Live Borrower Inputs"}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-dark rounded-pill px-3 fw-bold"
            onClick={() => setActiveTab("RULES")}
          >
            <i className="fa-solid fa-gear me-1"></i> Rules Config
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-success rounded-pill px-3 fw-bold"
            onClick={() => setActiveTab("TESTS")}
          >
            <i className="fa-solid fa-vial me-1"></i> Run Unit Tests
          </button>
          {onClose && (
            <button
              type="button"
              className="btn btn-sm btn-secondary rounded-pill px-3"
              onClick={onClose}
            >
              Exit Studio
            </button>
          )}
        </div>
      </div>

      {/* Persona Quick-Switch Bar */}
      <div className="mb-4">
        <label className="fw-bold text-dark small mb-2 d-flex align-items-center gap-2">
          <i className="fa-solid fa-users text-primary"></i>
          <span>Select Benchmark Customer Persona (1-Click Automated Scenario Demonstrator):</span>
        </label>
        <div className="row g-2">
          {CUSTOMER_PERSONAS.map((p) => {
            const isActive = activePersonaId === p.id;
            return (
              <div key={p.id} className="col-12 col-sm-6 col-lg-4 col-xl-2">
                <div
                  className={`persona-chip ${isActive ? "active" : ""}`}
                  onClick={() => handleSelectPersona(p)}
                >
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className={`badge bg-${p.badgeColor} small py-0 px-1`} style={{ fontSize: "0.68rem" }}>
                      {p.expectedOutcome.split(" ")[0]}
                    </span>
                    {isActive && <i className="fa-solid fa-circle-check text-primary small"></i>}
                  </div>
                  <strong className="text-dark d-block small text-truncate" style={{ fontSize: "0.82rem" }}>
                    {p.name.replace(/Persona \d: /, "")}
                  </strong>
                  <span className="text-muted small text-truncate d-block" style={{ fontSize: "0.70rem" }}>
                    {p.tagline}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collapsible Live Dynamic Inputs Drawer */}
      {showInputsDrawer && (
        <div className="card mb-4 border-primary shadow-sm bg-light">
          <div className="card-header bg-white d-flex justify-content-between align-items-center py-2">
            <strong className="text-primary small">
              <i className="fa-solid fa-pen-to-square me-1"></i> Real-Time Borrower Input Parameters (Instant Recalculation on Change)
            </strong>
            <button
              type="button"
              className="btn-close btn-sm"
              onClick={() => setShowInputsDrawer(false)}
            ></button>
          </div>
          <div className="card-body p-3">
            <div className="row g-3">
              {/* Financial Inputs */}
              <div className="col-12 col-md-3">
                <label className="form-label small text-muted mb-1">Net Monthly Salary (₹)</label>
                <input
                  type="number"
                  step="1000"
                  className="form-control form-control-sm"
                  value={inputs.netSalary}
                  onChange={(e) => handleInputChange("netSalary", Number(e.target.value))}
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label small text-muted mb-1">Salary Verification State</label>
                <select
                  className="form-select form-select-sm"
                  value={inputs.salaryVerificationStatus}
                  onChange={(e) => handleInputChange("salaryVerificationStatus", e.target.value)}
                >
                  <option value="VERIFIED">VERIFIED (100% credit)</option>
                  <option value="DECLARED">DECLARED (15% haircut)</option>
                  <option value="UNVERIFIED">UNVERIFIED (35% haircut)</option>
                </select>
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label small text-muted mb-1">Existing Total EMIs (₹)</label>
                <input
                  type="number"
                  step="500"
                  className="form-control form-control-sm"
                  value={inputs.existingEmi}
                  onChange={(e) => handleInputChange("existingEmi", Number(e.target.value))}
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label small text-muted mb-1">Monthly Rent Outflow (₹)</label>
                <input
                  type="number"
                  step="500"
                  className="form-control form-control-sm"
                  value={inputs.rent}
                  onChange={(e) => handleInputChange("rent", Number(e.target.value))}
                />
              </div>

              {/* Loan Request Inputs */}
              <div className="col-12 col-md-3">
                <label className="form-label small text-muted mb-1">Requested Loan (₹)</label>
                <input
                  type="number"
                  step="5000"
                  className="form-control form-control-sm"
                  value={inputs.requestedAmount}
                  onChange={(e) => handleInputChange("requestedAmount", Number(e.target.value))}
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label small text-muted mb-1">Requested Tenure (Months)</label>
                <select
                  className="form-select form-select-sm"
                  value={inputs.requestedTenure}
                  onChange={(e) => handleInputChange("requestedTenure", Number(e.target.value))}
                >
                  <option value={1}>1 Month (Bullet)</option>
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months</option>
                  <option value={9}>9 Months</option>
                  <option value={12}>12 Months</option>
                  <option value={18}>18 Months</option>
                  <option value={24}>24 Months</option>
                </select>
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label small text-muted mb-1">Bureau Credit Score (300-900)</label>
                <input
                  type="number"
                  min="300"
                  max="900"
                  className="form-control form-control-sm"
                  value={inputs.creditScore}
                  onChange={(e) => handleInputChange("creditScore", Number(e.target.value))}
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label small text-muted mb-1">DPD Delinquency History</label>
                <select
                  className="form-select form-select-sm"
                  value={inputs.dpdHistory}
                  onChange={(e) => handleInputChange("dpdHistory", e.target.value)}
                >
                  <option value="0">0 DPD (Clean History)</option>
                  <option value="30+">30+ DPD in last 12m</option>
                  <option value="60+">60+ DPD in last 12m</option>
                  <option value="90+">90+ DPD (Severe Delinquency)</option>
                </select>
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label small text-muted mb-1">Recent Bounced ECS/Mandates</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  className="form-control form-control-sm"
                  value={inputs.bouncedPaymentsCount}
                  onChange={(e) => handleInputChange("bouncedPaymentsCount", Number(e.target.value))}
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label small text-muted mb-1">Card Utilization Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="form-control form-control-sm"
                  value={inputs.creditUtilizationPct}
                  onChange={(e) => handleInputChange("creditUtilizationPct", Number(e.target.value))}
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label small text-muted mb-1">Living Expenses (Food/Bills)</label>
                <input
                  type="number"
                  step="500"
                  className="form-control form-control-sm"
                  value={inputs.householdExpenses}
                  onChange={(e) => handleInputChange("householdExpenses", Number(e.target.value))}
                />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label small text-muted mb-1">Mandatory Insurance / Tax</label>
                <input
                  type="number"
                  step="500"
                  className="form-control form-control-sm"
                  value={inputs.insurance}
                  onChange={(e) => handleInputChange("insurance", Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Decision Pipeline Progress (11 Stages) */}
      <DecisionPipelineProgress underwritingResult={underwritingResult} />

      {/* Final Decision Hero Card */}
      <div className={`${decisionCardClass} mb-4`}>
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-white text-dark rounded-pill px-3 py-1 font-monospace fw-bold small">
                {decision}
              </span>
              <span className="text-white opacity-90 small">
                Confidence: <strong>{underwritingResult.income.overallConfidence}%</strong>
              </span>
            </div>
            <h3 className="fw-extrabold text-white mb-1">{decisionTitle}</h3>
            <p className="text-white opacity-90 mb-0 small" style={{ maxWidth: "700px" }}>
              {decisionEvaluation.reasons[0]?.detail || "Underwriting evaluation completed successfully against active rules policy."}
            </p>
          </div>

          {/* Key Metrics on the Card */}
          <div className="d-flex align-items-center gap-4 text-white">
            <div className="text-center">
              <span className="text-white opacity-75 small d-block" style={{ fontSize: "0.72rem" }}>REQUESTED</span>
              <span className="fs-5 fw-bold font-monospace">{formatINR(requestedAmount)}</span>
            </div>

            <div className="text-center border-start ps-3">
              <span className="text-white opacity-75 small d-block" style={{ fontSize: "0.72rem" }}>SANCTIONED LIMIT</span>
              <span className="fs-3 fw-extrabold font-monospace text-white">
                {formatINR(optimalCandidate?.amount || 0)}
              </span>
            </div>

            <div className="text-center border-start ps-3">
              <span className="text-white opacity-75 small d-block" style={{ fontSize: "0.72rem" }}>MONTHLY EMI</span>
              <span className="fs-5 fw-bold font-monospace">
                {formatINR(optimalCandidate?.pricing?.emi || 0)}
              </span>
            </div>

            {onApplyOffer && decisionEvaluation.isApproved && (
              <button
                type="button"
                className="btn btn-light text-primary fw-bold rounded-pill px-4 py-2 shadow"
                onClick={() => onApplyOffer(optimalCandidate)}
              >
                Proceed with Offer →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Deep-Dive Views */}
      <div className="studio-nav-container mb-4">
        <button
          type="button"
          className={`studio-tab-btn ${activeTab === "PIPELINE" ? "active" : ""}`}
          onClick={() => setActiveTab("PIPELINE")}
        >
          <i className="fa-solid fa-chart-line"></i> Decision Pipeline
        </button>

        <button
          type="button"
          className={`studio-tab-btn ${activeTab === "SIMULATOR" ? "active" : ""}`}
          onClick={() => setActiveTab("SIMULATOR")}
        >
          <i className="fa-solid fa-sliders"></i> Offer Simulator & Matrix
        </button>

        <button
          type="button"
          className={`studio-tab-btn ${activeTab === "FINANCIALS" ? "active" : ""}`}
          onClick={() => setActiveTab("FINANCIALS")}
        >
          <i className="fa-solid fa-wallet"></i> Financial Health & Surplus
        </button>

        <button
          type="button"
          className={`studio-tab-btn ${activeTab === "STRESS" ? "active" : ""}`}
          onClick={() => setActiveTab("STRESS")}
        >
          <i className="fa-solid fa-bolt-lightning"></i> Stress Testing (6 Scenarios)
        </button>

        <button
          type="button"
          className={`studio-tab-btn ${activeTab === "SAFETY" ? "active" : ""}`}
          onClick={() => setActiveTab("SAFETY")}
        >
          <i className="fa-solid fa-building-shield"></i> Company Safety
        </button>

        <button
          type="button"
          className={`studio-tab-btn ${activeTab === "MONITORING" ? "active" : ""}`}
          onClick={() => setActiveTab("MONITORING")}
        >
          <i className="fa-solid fa-satellite-dish"></i> Post-Disbursal Monitoring
        </button>

        <button
          type="button"
          className={`studio-tab-btn ${activeTab === "AUDIT" ? "active" : ""}`}
          onClick={() => setActiveTab("AUDIT")}
        >
          <i className="fa-solid fa-clock-rotate-left"></i> Decision Audit Log
        </button>

        <button
          type="button"
          className={`studio-tab-btn ${activeTab === "RULES" ? "active" : ""}`}
          onClick={() => setActiveTab("RULES")}
        >
          <i className="fa-solid fa-gear"></i> Rules Governance
        </button>

        <button
          type="button"
          className={`studio-tab-btn ${activeTab === "TESTS" ? "active" : ""}`}
          onClick={() => setActiveTab("TESTS")}
        >
          <i className="fa-solid fa-vial-circle-check"></i> Unit Tests
        </button>
      </div>

      {/* Dynamic Tab Body Routing */}
      {activeTab === "PIPELINE" && (
        <div>
          <FinancialHealthDashboard underwritingResult={underwritingResult} />
          <StressTestMatrix stressTests={underwritingResult.stressTests} proposedLoan={optimalCandidate?.pricing} />
          <CompanySafetyCard portfolioSafety={underwritingResult.portfolioSafety} candidateAmount={optimalCandidate?.amount} />
        </div>
      )}

      {activeTab === "SIMULATOR" && (
        <OfferSimulator
          underwritingResult={underwritingResult}
          rules={rules}
          onSelectOffer={onApplyOffer}
        />
      )}

      {activeTab === "FINANCIALS" && (
        <FinancialHealthDashboard underwritingResult={underwritingResult} />
      )}

      {activeTab === "STRESS" && (
        <StressTestMatrix
          stressTests={underwritingResult.stressTests}
          proposedLoan={optimalCandidate?.pricing}
        />
      )}

      {activeTab === "SAFETY" && (
        <CompanySafetyCard
          portfolioSafety={underwritingResult.portfolioSafety}
          candidateAmount={optimalCandidate?.amount}
        />
      )}

      {activeTab === "MONITORING" && (
        <ContinuousMonitoringView
          baseLoan={optimalCandidate}
          baseRisk={risk}
        />
      )}

      {activeTab === "AUDIT" && (
        <DecisionAuditView />
      )}

      {activeTab === "RULES" && (
        <AdminRulesModal
          currentRules={rules}
          onRulesUpdated={(newR) => setRules(newR)}
          onClose={() => setActiveTab("PIPELINE")}
        />
      )}

      {activeTab === "TESTS" && (
        <UnitTestRunnerModal onClose={() => setActiveTab("PIPELINE")} />
      )}
    </div>
  );
};

export default IntelligentLendingStudio;
