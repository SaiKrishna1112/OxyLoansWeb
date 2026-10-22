import React, { useState } from "react";
import { formatINR } from "./instantLoanCalculations";
import { MONITORING_EVENTS, evaluateMonitoringState } from "./instantLoanMonitoring";

const ContinuousMonitoringView = ({ baseLoan, baseRisk }) => {
  const [activeEventIds, setActiveEventIds] = useState([]);

  const toggleEvent = (eventId) => {
    setActiveEventIds((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  const selectedEvents = MONITORING_EVENTS.filter((e) => activeEventIds.includes(e.id));
  const monitoringState = evaluateMonitoringState(baseLoan, baseRisk, selectedEvents);

  const ewsColor =
    monitoringState.ewsStatus === "RED"
      ? "danger"
      : monitoringState.ewsStatus === "AMBER"
      ? "warning"
      : "success";

  return (
    <div className="studio-card mb-4">
      <div className="studio-card-header">
        <div className="d-flex align-items-center gap-2">
          <i className="fa-solid fa-satellite-dish text-primary fs-5"></i>
          <div>
            <h5 className="fw-bold mb-0 text-dark">Continuous Post-Disbursal Risk Monitoring & Early Warning (EWS)</h5>
            <small className="text-muted">Simulates behavioral drift, cashflow shocks, and credit bureau alerts after loan disbursal</small>
          </div>
        </div>
        <span className="badge bg-light text-muted border small font-monospace">
          SIMULATION DEMO
        </span>
      </div>

      <div className="studio-card-body">
        {/* Active Monitoring Status Banner */}
        <div className={`p-3 rounded-3 mb-4 bg-${ewsColor}-subtle border border-${ewsColor}-subtle d-flex flex-wrap align-items-center justify-content-between gap-3`}>
          <div className="d-flex align-items-center gap-3">
            <span className={`pulse-beacon-live ${monitoringState.ewsStatus === "RED" ? "bg-danger" : monitoringState.ewsStatus === "AMBER" ? "bg-warning" : "bg-success"}`} />
            <div>
              <div className="fw-bold text-dark mb-0">
                EWS Health Status: <span className={`text-${ewsColor} text-uppercase`}>{monitoringState.ewsStatus}</span>
              </div>
              <small className="text-muted">
                {monitoringState.activeEventsCount === 0
                  ? "Loan running normally with zero early warning alerts detected."
                  : `${monitoringState.activeEventsCount} post-disbursement behavioral risk signals active.`}
              </small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3 font-monospace">
            <div className="text-center">
              <span className="text-muted small d-block" style={{ fontSize: "0.72rem" }}>ORIGINAL PD</span>
              <strong>{monitoringState.basePd}%</strong>
            </div>
            <i className="fa-solid fa-arrow-right text-muted small"></i>
            <div className="text-center">
              <span className="text-muted small d-block" style={{ fontSize: "0.72rem" }}>REVISED 12M PD</span>
              <strong className={`fs-5 text-${ewsColor}`}>{monitoringState.currentPd}%</strong>
            </div>
            <div className="border-start ps-3 text-center">
              <span className="text-muted small d-block" style={{ fontSize: "0.72rem" }}>REVISED EXPECTED LOSS</span>
              <strong className="text-danger">{formatINR(monitoringState.revisedExpectedLoss)}</strong>
            </div>
          </div>
        </div>

        {/* Interactive Event Triggers */}
        <div className="mb-4">
          <label className="fw-bold text-dark small mb-2 d-block">
            <i className="fa-solid fa-vial-virus text-warning me-1"></i> Trigger Post-Disbursal Behavioral Events to Test Model Adaptability:
          </label>
          <div className="row g-2">
            {MONITORING_EVENTS.map((ev) => {
              const isActive = activeEventIds.includes(ev.id);
              return (
                <div key={ev.id} className="col-12 col-md-6 col-lg-4">
                  <div
                    className={`p-3 rounded-3 border cursor-pointer h-100 transition-all ${
                      isActive
                        ? `bg-${ev.color}-subtle border-${ev.color} shadow-xs`
                        : "bg-white hover-bg-light"
                    }`}
                    onClick={() => toggleEvent(ev.id)}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <i className={`fa-solid ${ev.icon} text-${ev.color}`}></i>
                        <strong className="small text-dark">{ev.title}</strong>
                      </div>
                      <input
                        type="checkbox"
                        checked={isActive}
                        readOnly
                        className="form-check-input ms-2"
                      />
                    </div>
                    <p className="text-muted small mb-0" style={{ fontSize: "0.75rem" }}>
                      {ev.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Triggered Alerts & Automated Intervention Recommendations */}
        {monitoringState.alerts.length > 0 && (
          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <div className="p-3 bg-light rounded-3 h-100">
                <h6 className="fw-bold text-dark mb-2 small">
                  <i className="fa-solid fa-bell text-danger me-1"></i> Triggered Early Warning Alerts (EWS):
                </h6>
                <div className="d-flex flex-column gap-2">
                  {monitoringState.alerts.map((al, idx) => (
                    <div key={idx} className="p-2 bg-white rounded border-start border-4 border-danger small">
                      <strong className="d-block text-dark">{al.title}</strong>
                      <span className="text-muted">{al.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="p-3 bg-light rounded-3 h-100">
                <h6 className="fw-bold text-dark mb-2 small">
                  <i className="fa-solid fa-robot text-primary me-1"></i> Automated Risk Mitigation Interventions:
                </h6>
                <ul className="mb-0 ps-3 small text-secondary">
                  {monitoringState.recommendedActions.map((act, idx) => (
                    <li key={idx} className="mb-1">{act}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card-footer bg-light p-3 border-top small text-muted">
        <i className="fa-solid fa-circle-info text-primary me-1"></i>
        <strong>Simulation Notice:</strong> This continuous monitoring dashboard demonstrates automated real-time portfolio risk scoring based on simulated client telemetry.
      </div>
    </div>
  );
};

export default ContinuousMonitoringView;
