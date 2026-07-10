import React from "react";
import { DEAL_LIFECYCLE_ORDER } from "./dealLifecycleHelpers";

/** Simple deal status counts for Deals Directory only */
const DealLifecycleGuide = ({ activeStage, summary, compact = false }) => (
  <div className={`ai-lifecycle-guide ${compact ? "ai-lifecycle-guide--compact" : ""}`}>
    <div className="ai-lifecycle-flow">
      {DEAL_LIFECYCLE_ORDER.map((stage, idx) => {
        const count =
          summary?.[
            stage.id === "OPEN_FOR_PARTICIPATION"
              ? "openForParticipationCount"
              : stage.id === "ACTIVE_LOAN"
                ? "activeLoanCount"
                : "borrowerClosedCount"
          ] ?? summary?.runningCount;
        const isActive = activeStage === stage.id;
        return (
          <React.Fragment key={stage.id}>
            {idx > 0 && <div className="ai-lifecycle-arrow" aria-hidden="true">→</div>}
            <div
              className={`ai-lifecycle-card ${isActive ? "ai-lifecycle-card--active" : ""}`}
              style={{ borderColor: isActive ? stage.color : undefined }}
            >
              <div className="ai-lifecycle-card-head">
                <i className={`${stage.icon} me-1`} style={{ color: stage.color }} />
                <strong>{stage.label}</strong>
                {count != null && (
                  <span className="badge rounded-pill ms-auto" style={{ background: stage.color }}>
                    {count}
                  </span>
                )}
              </div>
              {!compact && <p className="ai-lifecycle-desc">{stage.description}</p>}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  </div>
);

export default DealLifecycleGuide;
