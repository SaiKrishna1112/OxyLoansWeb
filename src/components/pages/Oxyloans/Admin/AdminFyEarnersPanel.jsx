import React from "react";
import { money, number, DataTable } from "./adminAIDashboardShared";

export const AdminFyEarnersPanel = ({ rows = [], fy }) => (
  <>
    <p className="text-muted small mb-3">
      Lenders who received the most interest in FY {fy}–{String(fy + 1).slice(2)}.
    </p>
    <DataTable
      rows={rows}
      initialLimit={10}
      columns={[
        ["name", "Lender"],
        ["fyInterestEarned", "FY interest", money],
        ["fyPrincipalReturned", "FY principal", money],
        ["payoutCount", "Payouts", number],
      ]}
      emptyText="No FY payout data yet."
    />
  </>
);

export default AdminFyEarnersPanel;
