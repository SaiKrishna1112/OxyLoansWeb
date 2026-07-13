import React, { useEffect, useMemo, useState } from "react";
import { money, DataTable } from "./adminAIDashboardShared";
import { enrichDealForAdmin } from "./adminBusinessMetrics";
import { loadDealCmsInterestPayments } from "../../../HttpRequest/aiAdminApi";
import AdminCmsDealPaymentModal from "./AdminCmsDealPaymentModal";

const riskBadge = (level) => {
  const map = {
    HIGH: "ai-stage ai-stage--danger",
    MEDIUM: "ai-stage ai-stage--warn",
    LOW: "ai-stage ai-stage--info",
    OK: "ai-stage ai-stage--success",
  };
  return <span className={map[level] || "ai-stage"}>{level || "—"}</span>;
};

const CmsPayoutCell = ({ row, summary, onOpen }) => {
  const hasData = summary?.cmsPaymentId;
  const paid = summary?.successLenders ?? 0;
  const total = summary?.totalLenders ?? 0;
  const pending = summary?.pendingLenders ?? 0;

  let label = "CMS payout";
  let title = "View CMS interest payout by lender";
  if (hasData && total > 0) {
    label = `${paid}/${total} paid`;
    title = `${paid} paid (SUCCESS), ${pending} pending (INITIATED/APPROVED) — click for details`;
  } else if (hasData) {
    label = "No lenders";
    title = "CMS record exists but no lender rows";
  }

  return (
    <button
      type="button"
      className="btn btn-sm btn-outline-success ai-cms-payout-btn"
      title={title}
      onClick={() => onOpen(row)}
    >
      <i className="fas fa-money-check-alt me-1" />
      {label}
    </button>
  );
};

export const AdminDealRoiTable = ({ deals = [], limit = 12, compact = false }) => {
  const rows = useMemo(() => (deals || []).map(enrichDealForAdmin), [deals]);
  const [cmsDeal, setCmsDeal] = useState(null);
  const [cmsSummaries, setCmsSummaries] = useState({});

  const prefetchIds = useMemo(() => {
    const ids = rows
      .slice(0, limit)
      .map((r) => r.dealId)
      .filter((id) => id != null);
    return [...new Set(ids)];
  }, [rows, limit]);

  useEffect(() => {
    let cancelled = false;
    prefetchIds.forEach((dealId) => {
      if (cmsSummaries[dealId] !== undefined) return;
      loadDealCmsInterestPayments(dealId)
        .then((data) => {
          if (!cancelled) {
            setCmsSummaries((prev) => ({ ...prev, [dealId]: data || null }));
          }
        })
        .catch(() => {
          if (!cancelled) {
            setCmsSummaries((prev) => ({ ...prev, [dealId]: null }));
          }
        });
    });
    return () => {
      cancelled = true;
    };
  }, [prefetchIds]);

  const onCmsSummaryLoaded = (dealId, data) => {
    setCmsSummaries((prev) => ({ ...prev, [dealId]: data }));
  };

  const cmsColumn = [
    "cmsPayout",
    "CMS interest",
    (_, row) => (
      <CmsPayoutCell
        row={row}
        summary={cmsSummaries[row.dealId]}
        onOpen={(r) => setCmsDeal({ dealId: r.dealId, dealName: r.dealName })}
      />
    ),
  ];

  return (
    <>
      <DataTable
        rows={rows}
        initialLimit={limit}
        columns={
          compact
            ? [
                ["dealName", "Deal"],
                ["fdAmount", "FD", money],
                ["borrowerFeesCollected", "Borrower fee", money],
                ["lenderRoi", "Lender ROI", (v) => (v ? `${v}%` : "—")],
                ["borrowerRoi", "Borrower ROI", (v) => (v ? `${v}%` : "—")],
                ["spreadPercent", "Spread", (v) => (v != null ? `${v}%` : "—")],
                ["platformProfitEstimate", "Est. profit", money],
                cmsColumn,
                ["riskLevel", "Risk", (v) => riskBadge(v)],
              ]
            : [
                ["dealId", "ID"],
                ["dealName", "Deal"],
                ["borrowerName", "Borrower"],
                ["statusLabel", "Status"],
                ["dealAmount", "Deal amount", money],
                ["participatedAmount", "Participated", money],
                ["fillPercent", "Fill %", (v) => `${v ?? 0}%`],
                ["fdAmount", "FD amount", money],
                ["borrowerFeesCollected", "Borrower fee", money],
                ["lenderRoi", "Lender ROI", (v) => (v ? `${v}%` : "—")],
                ["borrowerRoi", "Borrower ROI", (v) => (v ? `${v}%` : "—")],
                ["spreadPercent", "Spread", (v) => (v != null ? `${v}%` : "—")],
                ["platformProfitEstimate", "Est. profit", money],
                cmsColumn,
                ["riskLevel", "Risk", (v, row) => (
                  <span title={row.riskReason || ""}>{riskBadge(v)}</span>
                )],
              ]
        }
        emptyText="No deal data loaded."
      />

      {cmsDeal && (
        <AdminCmsDealPaymentModal
          dealId={cmsDeal.dealId}
          dealName={cmsDeal.dealName}
          onClose={() => setCmsDeal(null)}
          onSummaryLoaded={onCmsSummaryLoaded}
        />
      )}
    </>
  );
};

export default AdminDealRoiTable;
