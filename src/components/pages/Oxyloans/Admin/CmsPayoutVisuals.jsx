import React from "react";
import {
  cmsReturnsTypeLabel,
  cmsTypeColorClass,
  dealNotPaidCount,
  dealPaidCount,
  oprStatusTone,
  paidPct,
} from "./adminCmsPayoutUtils";
import { money, number } from "./adminAIDashboardShared";

export const CmsTypeFilter = ({ value, onChange, counts = {}, className = "" }) => {
  const tabs = [
    { id: "ALL", label: "All", tone: "all" },
    { id: "LENDERINTEREST", label: "Interest", tone: "interest" },
    { id: "LENDERPRINCIPAL", label: "Principal", tone: "principal" },
    { id: "PRINCIPALINTEREST", label: "Principal + Interest", tone: "combo" },
  ];
  return (
    <div className={`ai-cms-type-filter ${className}`}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`ai-cms-type-filter-btn ai-cms-type-filter-btn--${t.tone} ${
            value === t.id ? "ai-cms-type-filter-btn--active" : ""
          }`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {counts[t.id] != null ? ` (${counts[t.id]})` : ""}
        </button>
      ))}
    </div>
  );
};

/** Premium gradient hero stats row */
export const CmsHeroStats = ({ data, byType = {} }) => {
  const initiated = data?.totalLenders ?? 0;
  const paid = data?.paidLenders ?? 0;
  const notPaid = data?.pendingLenders ?? 0;
  const files = data?.dealCount ?? 0;
  const paidAmt = data?.paidAmount ?? 0;
  const notPaidAmt = data?.pendingAmount ?? 0;
  const pct = initiated > 0 ? Math.round((paid / initiated) * 100) : 0;

  return (
    <div className="ai-cms-hero">
      <div className="ai-cms-hero-main">
        <div className="ai-cms-hero-card ai-cms-hero-card--files">
          <div className="ai-cms-hero-card-glow" />
          <div className="ai-cms-hero-card-icon">
            <i className="fas fa-file-upload" />
          </div>
          <div className="ai-cms-hero-card-body">
            <span className="ai-cms-hero-val">{number(initiated)}</span>
            <span className="ai-cms-hero-lbl">Lenders initiated</span>
            <span className="ai-cms-hero-sub">{number(files)} CMS files</span>
          </div>
        </div>
        <div className="ai-cms-hero-card ai-cms-hero-card--paid">
          <div className="ai-cms-hero-card-glow" />
          <div className="ai-cms-hero-card-icon">
            <i className="fas fa-check-double" />
          </div>
          <div className="ai-cms-hero-card-body">
            <span className="ai-cms-hero-val">{number(paid)}</span>
            <span className="ai-cms-hero-lbl">Lenders paid</span>
            <span className="ai-cms-hero-sub">{money(paidAmt)}</span>
          </div>
        </div>
        <div className="ai-cms-hero-card ai-cms-hero-card--pending">
          <div className="ai-cms-hero-card-glow" />
          <div className="ai-cms-hero-card-icon">
            <i className="fas fa-hourglass-half" />
          </div>
          <div className="ai-cms-hero-card-body">
            <span className="ai-cms-hero-val">{number(notPaid)}</span>
            <span className="ai-cms-hero-lbl">Not paid yet</span>
            <span className="ai-cms-hero-sub">{money(notPaidAmt)}</span>
          </div>
        </div>
        <div className="ai-cms-hero-card ai-cms-hero-card--files">
          <div className="ai-cms-hero-card-glow" />
          <div className="ai-cms-hero-card-icon">
            <i className="fas fa-file-invoice" />
          </div>
          <div className="ai-cms-hero-card-body">
            <span className="ai-cms-hero-val">{number(files)}</span>
            <span className="ai-cms-hero-lbl">CMS files</span>
            <span className="ai-cms-hero-sub">{pct}% paid overall</span>
          </div>
        </div>
      </div>
      <div className="ai-cms-hero-types">
        {[
          { id: "LENDERINTEREST", icon: "fa-percent", label: "Interest" },
          { id: "LENDERPRINCIPAL", icon: "fa-landmark", label: "Principal" },
          { id: "PRINCIPALINTEREST", icon: "fa-coins", label: "Principal + Interest" },
        ].map((t) => {
          const s = byType[t.id] || {};
          const initiated = s.initiated || 0;
          const pct = initiated > 0 ? Math.round(((s.paid || 0) / initiated) * 100) : 0;
          return (
            <div key={t.id} className={`ai-cms-hero-type ai-cms-hero-type--${t.id.toLowerCase()}`}>
              <div className="ai-cms-hero-type-head">
                <i className={`fas ${t.icon}`} />
                <span>{t.label}</span>
                <span className="ai-cms-hero-type-pct">{pct}% paid</span>
              </div>
              <div className="ai-cms-hero-type-bar">
                <div className="ai-cms-hero-type-bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="ai-cms-hero-type-stats">
                <span className="ai-cms-hero-type-stat">{number(initiated)} initiated</span>
                <span className="ai-cms-hero-type-stat ai-cms-hero-type-stat--paid">{number(s.paid || 0)} paid</span>
                <span className="ai-cms-hero-type-stat ai-cms-hero-type-stat--pending">{number(s.notPaid || 0)} pending</span>
                <span className="ai-cms-hero-type-stat">{number(s.count || 0)} files</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Compact flow legend for principal closure */
export const CmsPrincipalFlowHint = () => (
  <div className="ai-cms-flow-hint">
    <span className="ai-cms-flow-hint-title">
      <i className="fas fa-route me-1" />
      Principal / P+I flow (<code>oxy_principal_return</code>)
    </span>
    <div className="ai-cms-flow-hint-steps">
      <span className="ai-cms-flow-chip ai-cms-flow-chip--init">INITIATED</span>
      <i className="fas fa-chevron-right ai-cms-flow-arrow" />
      <span className="ai-cms-flow-chip ai-cms-flow-chip--before">BEFORE</span>
      <span className="text-muted small">file sent</span>
      <i className="fas fa-chevron-right ai-cms-flow-arrow" />
      <span className="ai-cms-flow-chip ai-cms-flow-chip--after">AFTER</span>
      <span className="text-muted small">at ICICI</span>
      <i className="fas fa-chevron-right ai-cms-flow-arrow" />
      <span className="ai-cms-flow-chip ai-cms-flow-chip--executed">EXECUTED</span>
      <span className="text-muted small">= credited</span>
    </div>
  </div>
);

export const CmsPaidProgress = ({ deal }) => {
  const total = deal?.totalLenders || 0;
  const paid = dealPaidCount(deal);
  const notPaid = dealNotPaidCount(deal);
  const paidW = total > 0 ? (paid / total) * 100 : 0;
  const notPaidW = total > 0 ? (notPaid / total) * 100 : 0;
  const pct = paidPct(deal);
  return (
    <div className="ai-cms-progress-wrap">
      <div className="ai-cms-progress-meta">
        <span className="text-success">{number(paid)} paid</span>
        <span className="ai-cms-progress-pct">{pct}%</span>
        <span className="text-warning">{number(notPaid)} pending</span>
      </div>
      <div className="ai-cms-stacked-progress" title={`${paid} paid · ${notPaid} not paid`}>
        {paidW > 0 && (
          <div className="ai-cms-stacked-seg ai-cms-stacked-seg--paid" style={{ width: `${paidW}%` }} />
        )}
        {notPaidW > 0 && (
          <div className="ai-cms-stacked-seg ai-cms-stacked-seg--awaiting" style={{ width: `${notPaidW}%` }} />
        )}
      </div>
    </div>
  );
};

export const CmsTypeBadge = ({ type }) => (
  <span className={`ai-cms-type-badge ${cmsTypeColorClass(type)}`}>{cmsReturnsTypeLabel(type)}</span>
);

export const CmsPaidBadge = ({ paid }) => (
  <span className={`ai-cms-outcome-badge ${paid ? "ai-cms-outcome-badge--paid" : "ai-cms-outcome-badge--awaiting"}`}>
    {paid ? "Paid" : "Not paid"}
  </span>
);

export const CmsOprStatusBadge = ({ status }) => {
  const tone = oprStatusTone(status);
  return (
    <span className={`ai-cms-opr-badge ai-cms-opr-badge--${tone}`}>
      {status || "—"}
    </span>
  );
};
