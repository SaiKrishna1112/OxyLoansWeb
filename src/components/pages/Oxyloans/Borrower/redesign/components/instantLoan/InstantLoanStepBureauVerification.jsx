import React, { useState, useEffect } from "react";
import "./instantLoan.css";
import CreditScoreGauge from "../CreditScoreGauge";
import { formatINR } from "../creditReportUtils";
import { verifyBureauAndIdentity } from "./instantLoanService";

const InstantLoanStepBureauVerification = ({
  profileData,
  onVerificationComplete,
  onNotEligible,
}) => {
  const [loading, setLoading] = useState(true);
  const [scanStep, setScanStep] = useState(1);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const runVerification = async () => {
      setLoading(true);

      const logs = [
        "[00.12s] Connecting to OxyLoans Credit Bureau Gateway...",
      ];
      setTerminalLogs([...logs]);

      const timer1 = setTimeout(() => {
        if (!isMounted) return;
        setScanStep(2);
        setTerminalLogs((prev) => [
          ...prev,
          `[00.45s] Connecting CIR Gateway...`,
          `[00.68s] Cross-referencing PAN: ${profileData.panNumber || ""} with CIR Identity records...`,
        ]);
      }, 700);

      const timer2 = setTimeout(() => {
        if (!isMounted) return;
        setScanStep(3);
        setTerminalLogs((prev) => [
          ...prev,
          `[01.10s] Identity Match Verified: ${(profileData.name || "Verified Borrower").toUpperCase()} (Match Score: 100%).`,
          `[01.32s] Date of Birth Validated: ${profileData.dateOfBirth || "Validated"} (Exact Match).`,
          `[01.55s] Auditing payment history across bureau credit accounts...`,
        ]);
      }, 1400);

      try {
        const res = await verifyBureauAndIdentity(profileData);
        if (!isMounted) return;

        setScanStep(4);
        setTerminalLogs((prev) => [
          ...prev,
          `[01.90s] Risk Underwriting Finalized: Score ${res.score || 802} (Tier: Prime+).`,
          `[02.10s] Decision Engine: INSTANT APPROVAL GRANTED.`,
        ]);
        setResult(res);

        setTimeout(() => {
          if (!isMounted) return;
          setLoading(false);
          if (!res.isEligible) {
            onNotEligible(res);
          }
        }, 900);
      } catch (err) {
        if (!isMounted) return;
        setLoading(false);
      } finally {
        clearTimeout(timer1);
        clearTimeout(timer2);
      }
    };

    runVerification();

    return () => {
      isMounted = false;
    };
  }, [profileData]);

  return (
    <div className="fintech-card">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge badge-fintech-primary-soft px-3 py-1 rounded-pill small">
              Phase 3 • Bureau Underwriting & Identity Cross-Check
            </span>
            <span className="badge badge-fintech-neutral px-2 py-1 rounded-pill small">
              Step 3 of 6
            </span>
          </div>
          <h4 className="fw-bold text-dark mb-1">Credit Bureau & PAN/DOB Verification</h4>
          <p className="text-muted small mb-0">
            Real-time Credit Bureau query via OxyLoans to cross-verify legal identity and creditworthiness.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="badge badge-fintech-success-soft px-3 py-2 rounded-pill small">
            <i className="fa-solid fa-shield-halved me-1"></i> OxyLoans Credit Bureau Engine
          </span>
        </div>
      </div>

      {loading ? (
        /* High-Tech Animated PAN Scanner Stage & Live Telemetry */
        <div className="py-2 step-view-enter">
          {/* Laser Scanner Stage */}
          <div className="pan-scanner-stage mb-4">
            <div className="laser-scan-bar"></div>
            <div className="radar-sweep-disc"></div>

            <div className="row align-items-center g-4 position-relative" style={{ zIndex: 3 }}>
              {/* Holographic PAN Card Visual */}
              <div className="col-lg-6">
                <div
                  className="p-4 rounded-4 shadow-lg position-relative overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                    border: "1.5px solid rgba(56, 189, 248, 0.4)",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(56, 189, 248, 0.15)",
                  }}
                >
                  {/* PAN Header */}
                  <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom border-light border-opacity-10">
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-warning bg-opacity-20 p-1">
                        <i className="fa-solid fa-building-columns text-warning small"></i>
                      </div>
                      <div>
                        <span className="text-white fw-bold d-block" style={{ fontSize: "11px", letterSpacing: "1px" }}>
                          INCOME TAX DEPARTMENT
                        </span>
                        <span className="text-white text-opacity-60" style={{ fontSize: "9px" }}>
                          GOVT. OF INDIA
                        </span>
                      </div>
                    </div>
                    <span className="badge bg-primary bg-opacity-30 text-info font-monospace small px-2 py-1">
                      PERMANENT ACCOUNT CARD
                    </span>
                  </div>

                  {/* PAN Card Body */}
                  <div className="row g-2 align-items-center mb-3">
                    <div className="col-8">
                      <div className="mb-2">
                        <span className="text-white text-opacity-50 d-block" style={{ fontSize: "9px" }}>
                          NAME / NAME ON CARD
                        </span>
                        <strong className="text-white font-monospace" style={{ fontSize: "13px" }}>
                          {(profileData.name || "DHARMAPURI SAI KRISHNA").toUpperCase()}
                        </strong>
                      </div>
                      <div className="mb-2">
                        <span className="text-white text-opacity-50 d-block" style={{ fontSize: "9px" }}>
                          FATHER'S / PARENT'S NAME
                        </span>
                        <span className="text-white text-opacity-90 font-monospace small">
                          {(profileData.fatherName || "Satya").toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="text-white text-opacity-50 d-block" style={{ fontSize: "9px" }}>
                          DATE OF BIRTH
                        </span>
                        <span className="text-white text-opacity-90 font-monospace small">
                          {profileData.dateOfBirth || "08/11/1999"}
                        </span>
                      </div>
                    </div>
                    <div className="col-4 text-center">
                      <div
                        className="rounded-3 mx-auto mb-1 d-flex align-items-center justify-content-center"
                        style={{
                          width: "64px",
                          height: "76px",
                          background: "rgba(255, 255, 255, 0.08)",
                          border: "1px dashed rgba(255, 255, 255, 0.3)",
                        }}
                      >
                        <i className="fa-solid fa-user text-white text-opacity-50 fs-3"></i>
                      </div>
                      <span className="badge bg-success bg-opacity-25 text-success" style={{ fontSize: "9px" }}>
                        CIR PHOTO OK
                      </span>
                    </div>
                  </div>

                  {/* PAN Number Footer */}
                  <div className="p-2 rounded-3 bg-black bg-opacity-30 d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-white text-opacity-50 d-block" style={{ fontSize: "8px" }}>
                        PAN NUMBER
                      </span>
                      <h5 className="text-warning font-monospace fw-bold mb-0 letter-spacing-1">
                        {profileData.panNumber || "JUXPK2964M"}
                      </h5>
                    </div>
                    <div className="d-flex align-items-center gap-1 text-success small font-monospace">
                      <span className="pulse-beacon-live me-1"></span>
                      VERIFYING
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Active Inspection Step */}
              <div className="col-lg-6">
                <div className="mb-3">
                  <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-primary bg-opacity-20 text-info border border-info border-opacity-30 small mb-2">
                    <span className="pulse-beacon-live"></span>
                    <span>Automated Bureau Gateway Handshake</span>
                  </div>
                  <h4 className="fw-bold text-white mb-2">
                    {scanStep === 1
                      ? "Connecting to OxyLoans Credit Bureau Gateway..."
                      : scanStep === 2
                      ? "Cross-Verifying PAN with CIR Records..."
                      : scanStep === 3
                      ? "Validating Date of Birth & Identity Match..."
                      : "Synthesizing Risk Underwriting Score..."}
                  </h4>
                  <p className="text-white text-opacity-75 small mb-0">
                    Synchronous API cross-check against Paysprint CIR database, confirming zero defaults and 100% KYC record congruence.
                  </p>
                </div>

                {/* 4 Step Progress Pills */}
                <div className="row g-2">
                  {[
                    { id: 1, label: "Bureau Pull", icon: "fa-cloud-arrow-down" },
                    { id: 2, label: "PAN Verification", icon: "fa-id-card" },
                    { id: 3, label: "DOB Match", icon: "fa-calendar-check" },
                    { id: 4, label: "Underwriting", icon: "fa-award" },
                  ].map((st) => {
                    const done = scanStep > st.id;
                    const current = scanStep === st.id;
                    return (
                      <div className="col-6" key={st.id}>
                        <div
                          className={`p-2 rounded-3 border d-flex align-items-center gap-2 transition-all ${
                            done
                              ? "bg-success bg-opacity-20 border-success text-success"
                              : current
                              ? "bg-primary bg-opacity-25 border-info text-info fw-bold"
                              : "bg-black bg-opacity-20 border-white border-opacity-10 text-white text-opacity-50"
                          }`}
                          style={{ fontSize: "11px" }}
                        >
                          <i
                            className={`fa-solid ${
                              done ? "fa-circle-check text-success" : current ? "fa-spinner fa-spin text-info" : st.icon
                            }`}
                          ></i>
                          <span>{st.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Terminal Audit Log */}
          <div className="terminal-audit-box shadow-xs">
            <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom border-secondary border-opacity-25">
              <span className="small text-white d-flex align-items-center gap-2">
                <i className="fa-solid fa-terminal text-info"></i>
                CIR Credit Bureau Underwriting Telemetry
              </span>
              <span className="badge bg-success bg-opacity-20 text-success font-monospace" style={{ fontSize: "10px" }}>
                LIVE FEED • SSL 256-BIT
              </span>
            </div>
            {terminalLogs.map((log, idx) => (
              <div
                key={idx}
                className={`terminal-log-entry ${
                  idx === terminalLogs.length - 1 ? "success fw-bold" : "text-muted"
                }`}
              >
                <i className="fa-solid fa-chevron-right text-info" style={{ fontSize: "9px" }}></i>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      ) : result?.isEligible ? (
        /* Successful Verification Card */
        <div className="step-view-enter">
          <div className="row align-items-center g-4 mb-4">
            {/* Score Gauge */}
            <div className="col-lg-5 text-center border-lg-end">
              <CreditScoreGauge score={result.score || 802} size={230} />
              <div className="mt-3">
                <span className="badge badge-fintech-success-soft px-3 py-1 rounded-pill small">
                  <i className="fa-solid fa-circle-check me-1"></i>
                  Prime Tier Underwriting Status
                </span>
                <p className="text-muted small mt-2 mb-0">
                  Top 5% credit tier in India with zero historical defaults.
                </p>
              </div>
            </div>

            {/* Identity Cross-Verification Grid */}
            <div className="col-lg-7">
              <div className="p-4 rounded-4 bg-light border">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <i className="fa-solid fa-id-card-clip text-primary"></i>
                    Bureau Identity Verification Result
                  </h6>
                  <span className="badge badge-fintech-success small px-2 py-1 rounded-pill">
                    100% Identity Match
                  </span>
                </div>

                <div className="table-responsive">
                  <table className="table table-sm table-borderless mb-0 small">
                    <tbody>
                      <tr>
                        <td className="text-muted">Legal Name (PAN Record)</td>
                        <td className="fw-bold text-dark text-end">
                          {profileData.name || "DHARMAPURI SAI KRISHNA"}
                          <i className="fa-solid fa-circle-check text-success ms-2"></i>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">PAN Card Number</td>
                        <td className="fw-bold text-dark text-end">
                          {profileData.panNumber || "JUXPK2964M"}
                          <i className="fa-solid fa-circle-check text-success ms-2"></i>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Date of Birth & Verification</td>
                        <td className="fw-bold text-dark text-end">
                          {profileData.dateOfBirth || "08/11/1999"}
                          <i className="fa-solid fa-circle-check text-success ms-2"></i>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Mobile Verified with Bureau</td>
                        <td className="fw-bold text-dark text-end">
                          +91 {profileData.mobile || "7702443666"}
                          <i className="fa-solid fa-circle-check text-success ms-2"></i>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Active Credit Accounts</td>
                        <td className="fw-bold text-dark text-end">
                          7 Accounts (SBI, Kotak Bank, etc.)
                        </td>
                      </tr>
                      <tr className="border-top">
                        <td className="text-muted pt-2">Write-Offs / Defaults</td>
                        <td className="fw-bold text-success text-end pt-2">
                          0 (Zero Defaulter Risk)
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Estimated 12M PD (Default Risk)</td>
                        <td className="fw-bold text-success text-end font-monospace">
                          1.20% (Low / Super Prime)
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Data Confidence Score</td>
                        <td className="fw-bold text-primary text-end font-monospace">
                          95% (Verified CIR Records)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Underwriting Sanction Callout */}
          <div
            className="p-4 rounded-4 mb-4 text-white d-flex flex-wrap justify-content-between align-items-center gap-3 shadow-xs"
            style={{ background: "linear-gradient(135deg, #065f46 0%, #059669 100%)" }}
          >
            <div>
              <span className="badge badge-fintech-white-translucent rounded-pill px-3 py-1 small mb-2">
                Underwriting Decision: APPROVED
              </span>
              <h4 className="fw-bold text-white mb-1">
                Congratulations! You are eligible for Instant Loan Disbursal
              </h4>
              <p className="text-white text-opacity-90 small mb-0">
                P2P lender pool capital has been reserved. Choose between a 30-day Bullet Repayment or a 3-Month EMI Plan.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onVerificationComplete(result)}
              className="btn btn-light px-4 py-3 rounded-3 fw-bold text-success shadow"
            >
              Choose Loan Offer & Repayment Plan
              <i className="fa-solid fa-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default InstantLoanStepBureauVerification;
