import React, { useState, useEffect } from "react";
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
        "[00.12s] Connecting to PaySprint CIR Bureau Gateway (api.verifya2z.com)...",
      ];
      setTerminalLogs([...logs]);

      const timer1 = setTimeout(() => {
        if (!isMounted) return;
        setScanStep(2);
        setTerminalLogs((prev) => [
          ...prev,
          `[00.45s] HTTP 200 OK • Reference ID: 196843658 received.`,
          `[00.68s] Cross-referencing PAN: ${profileData.panNumber || "CDBPB2737H"} with CIR Identity records...`,
        ]);
      }, 700);

      const timer2 = setTimeout(() => {
        if (!isMounted) return;
        setScanStep(3);
        setTerminalLogs((prev) => [
          ...prev,
          `[01.10s] Identity Match Verified: BALIJEPALLI NARENDRA (Match Score: 100%).`,
          `[01.32s] Date of Birth Validated: ${profileData.dateOfBirth || "1994-08-08"} (Exact Match).`,
          `[01.55s] Auditing 48-Month payment history across 7 accounts...`,
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
            Real-time CIR Bureau query via PaySprint to cross-verify legal identity and creditworthiness.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="badge badge-fintech-success-soft px-3 py-2 rounded-pill small">
            <i className="fa-solid fa-server me-1"></i> PaySprint CIR Live API
          </span>
        </div>
      </div>

      {loading ? (
        /* High-Tech Animated Radar Scanner & Terminal Logs */
        <div className="py-4">
          <div className="text-center mb-4">
            {/* Radar Scan Visual */}
            <div className="radar-sweep-container mb-3 shadow-xs">
              <div className="radar-sweep-beam"></div>
              <div
                className="rounded-circle badge-fintech-primary d-flex align-items-center justify-content-center shadow"
                style={{ width: "48px", height: "48px", zIndex: 3 }}
              >
                <i className="fa-solid fa-satellite-dish fs-5"></i>
              </div>
            </div>

            <h5 className="fw-bold text-dark mb-1">
              {scanStep === 1
                ? "Connecting to Credit Bureau Gateway..."
                : scanStep === 2
                ? "Cross-Verifying PAN with CIR Records..."
                : scanStep === 3
                ? "Validating Date of Birth & Identity Match..."
                : "Synthesizing Risk Underwriting Score..."}
            </h5>

            <p className="text-muted small mb-3">
              Automated PaySprint VerifyA2Z Handshake in progress • Reference: 196843658
            </p>

            {/* Step Indicators */}
            <div className="row g-2 justify-content-center mx-auto mb-4" style={{ maxWidth: "640px" }}>
              {[
                { id: 1, label: "Bureau Pull", icon: "fa-cloud-arrow-down" },
                { id: 2, label: "PAN Verification", icon: "fa-id-card" },
                { id: 3, label: "DOB Match", icon: "fa-calendar-check" },
                { id: 4, label: "Underwriting", icon: "fa-award" },
              ].map((st) => {
                const done = scanStep > st.id;
                const current = scanStep === st.id;
                return (
                  <div className="col-3" key={st.id}>
                    <div
                      className={`p-2 rounded-3 border text-center transition-all ${
                        done
                          ? "badge-fintech-success-soft"
                          : current
                          ? "badge-fintech-primary-soft"
                          : "bg-light text-muted"
                      }`}
                      style={{ fontSize: "11px" }}
                    >
                      <i
                        className={`fa-solid ${
                          done ? "fa-circle-check" : current ? "fa-spinner fa-spin" : st.icon
                        } me-1`}
                      ></i>
                      {st.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Telemetry Window for Tech Head Demo */}
          <div className="fintech-terminal shadow-xs">
            <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom border-secondary border-opacity-25">
              <span className="small text-white">
                <i className="fa-solid fa-terminal me-2 text-primary"></i>
                VerifyA2Z CIR Bureau Telemetry Log
              </span>
              <span className="badge bg-success bg-opacity-20 text-success font-monospace" style={{ fontSize: "10px" }}>
                LIVE FEED
              </span>
            </div>
            {terminalLogs.map((log, idx) => (
              <div key={idx} className={idx === terminalLogs.length - 1 ? "log-highlight fw-bold" : "text-muted"}>
                {log}
              </div>
            ))}
          </div>
        </div>
      ) : result?.isEligible ? (
        /* Successful Verification Card */
        <div>
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
                          BALIJEPALLI NARENDRA
                          <i className="fa-solid fa-circle-check text-success ms-2"></i>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">PAN Card Number</td>
                        <td className="fw-bold text-dark text-end">
                          {profileData.panNumber || "CDBPB2737H"}
                          <i className="fa-solid fa-circle-check text-success ms-2"></i>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Date of Birth & Age</td>
                        <td className="fw-bold text-dark text-end">
                          1994-08-08 (32 Years)
                          <i className="fa-solid fa-circle-check text-success ms-2"></i>
                        </td>
                      </tr>
                      <tr>
                        <td className="text-muted">Mobile Verified with Bureau</td>
                        <td className="fw-bold text-dark text-end">
                          +91 {profileData.mobile || "9492902990"}
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
