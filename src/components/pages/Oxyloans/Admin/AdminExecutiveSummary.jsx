import React from "react";
import { money, number } from "./adminAIDashboardShared";
import { buildAdminBusinessKpis } from "./adminBusinessMetrics";

/** Grouped executive KPI layout — clearer for admin daily use */
const AdminExecutiveSummary = ({ previewCtx, loading }) => {
  const tiles = buildAdminBusinessKpis(previewCtx || {});
  const borrower = previewCtx?.borrowerSummary || {};
  const fees = previewCtx?.feeSummary || {};
  const recon = previewCtx?.reconciliation || {};

  const groups = [
    {
      title: "Capital & lenders",
      icon: "fas fa-landmark",
      color: "#6366f1",
      keys: ["participation", "wallet", "activeAmount"],
    },
    {
      title: "Borrower revenue",
      icon: "fas fa-user-graduate",
      color: "#2563eb",
      keys: ["borrowerFees", "interestPaid", "spread"],
    },
    {
      title: "Operations",
      icon: "fas fa-sliders",
      color: "#0891b2",
      keys: ["cms", "deals"],
    },
  ];

  const tileMap = Object.fromEntries(tiles.map((t) => [t.key, t]));

  const enrichTile = (tile) => {
    if (tile.key === "borrowerFees" && borrower.totalCombinedFees > 0 && !fees.borrowerFeesCollected) {
      return { ...tile, value: money(borrower.totalCombinedFees) };
    }
    if (tile.key === "spread" && borrower.avgBorrowerRoi > 0 && fees.avgSpreadPercent == null) {
      const lender = fees.avgLenderRoi ?? 1.65;
      const spread = Math.round((borrower.avgBorrowerRoi - lender) * 100) / 100;
      return { ...tile, value: `${spread}%` };
    }
    if (tile.key === "cms" && recon.totalPending == null && recon.totalInitiated != null) {
      return { ...tile, value: money(recon.totalInitiated - (recon.totalConfirmed || 0)) };
    }
    return tile;
  };

  return (
    <div className="ai-exec-summary">
      {groups.map((group) => (
        <div key={group.title} className="ai-exec-group">
          <div className="ai-exec-group-head">
            <i className={group.icon} style={{ color: group.color }} />
            <span>{group.title}</span>
          </div>
          <div className="ai-exec-group-tiles">
            {group.keys.map((key) => {
              const tile = enrichTile(tileMap[key]);
              if (!tile) return null;
              return (
                <div key={key} className="ai-exec-tile" title={tile.hint}>
                  <span className="ai-exec-tile-val">{loading ? "…" : tile.value}</span>
                  <span className="ai-exec-tile-lbl">{tile.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminExecutiveSummary;
