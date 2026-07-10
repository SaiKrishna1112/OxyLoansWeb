import React from "react";
import { money, number } from "./adminAIDashboardShared";
import { buildAdminBusinessKpis } from "./adminBusinessMetrics";

const AdminBusinessKpis = ({ previewCtx, loading, onOpenModule }) => {
  const tiles = buildAdminBusinessKpis(previewCtx || {});

  return (
    <div className="ai-business-kpis">
      {tiles.map((t) => (
        <div key={t.key} className="ai-business-kpi" title={t.hint}>
          <div className="ai-business-kpi-icon" style={{ background: t.color }}>
            <i className={t.icon} />
          </div>
          <div className="ai-business-kpi-body">
            <span className="ai-business-kpi-val">{loading ? "…" : t.value}</span>
            <span className="ai-business-kpi-lbl">{t.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminBusinessKpis;
