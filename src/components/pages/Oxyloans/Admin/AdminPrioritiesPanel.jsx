import React from "react";
import { buildAdminPriorities } from "./adminBusinessMetrics";

const severityClass = {
  warning: "ai-priority--warning",
  success: "ai-priority--success",
  primary: "ai-priority--primary",
  info: "ai-priority--info",
  muted: "ai-priority--muted",
};

const AdminPrioritiesPanel = ({ previewCtx, onOpenModule, compact = false }) => {
  const items = buildAdminPriorities(previewCtx);
  const urgent = items.filter((i) => i.severity !== "muted").slice(0, compact ? 4 : 20);

  return (
    <div className={`ai-admin-priorities ${compact ? "ai-admin-priorities--compact" : ""}`}>
      <div className="ai-admin-priorities-head">
        <h6 className="mb-0">
          <i className="fas fa-bell me-2" />
          Priority alerts
        </h6>
        {compact && onOpenModule && (
          <button type="button" className="btn btn-sm btn-outline-warning" onClick={() => onOpenModule("operations-alerts")}>
            All alerts
          </button>
        )}
      </div>
      <ul className="ai-priority-list">
        {(compact ? urgent : items).map((item) => (
          <li key={item.title} className={`ai-priority ${severityClass[item.severity] || ""}`}>
            <i className={`${item.icon} ai-priority-icon`} />
            <div className="ai-priority-body">
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
            </div>
            {item.module && onOpenModule && !compact && (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary ai-priority-btn"
                onClick={() => onOpenModule(item.module)}
              >
                Open
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPrioritiesPanel;
