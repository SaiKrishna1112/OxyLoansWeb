import React, { useEffect, useRef, useState, useCallback } from "react";
import { chatbotapicall } from "./HttpRequest/afterlogin";

const QUICK_REPLIES = {
  LENDER: [
    "Show my wallet balance",
    "Which deal earned me the highest ROI?",
    "Compare my earnings this month vs last month",
    "How much will I earn in the next 30 days?",
    "What is my total interest earned this year?",
    "How long have I been investing with OxyLoans?",
    "What is my average ROI across all deals?",
    "How much have I invested in total?",
    "In which deal did I invest recently?",
    "Show my active deals",
    "How much principal has been returned to me?",
    "Show my upcoming interest payments",
    "Show my referral bonus history",
    "Which deals can I participate in today?",
  ],
  BORROWER: [
    "What is the status of my loan application?",
    "How do I apply for a loan on OxyLoans?",
    "What documents are required for loan approval?",
    "What is my EMI schedule?",
    "What interest rate will I be charged?",
    "How long does loan approval take?",
    "What is the RBI limit for P2P borrowing?",
    "What happens after a lender accepts my request?",
    "How does the repayment process work?",
    "Who is the CEO of OxyLoans?",
  ],
  Admin: [
    "How many active lenders are there?",
    "Show pending disbursal loans",
    "What is the total platform lending volume?",
    "How does the disbursal process work?",
    "What are the RBI compliance requirements?",
  ],
};

const ROLE_CONFIG = {
  LENDER:   { label: "Lender Assistant",   color: "#0ea5a1", bg: "linear-gradient(135deg, #0ea5a1 0%, #059890 100%)" },
  BORROWER: { label: "Borrower Assistant", color: "#6366f1", bg: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" },
  Admin:    { label: "Admin Assistant",    color: "#f97316", bg: "linear-gradient(135deg, #f97316 0%, #ea6c00 100%)" },
};

const FOLLOWUP = {
  LENDER_PROFILE:           ["Show my active deals", "What interest did I earn this year?", "Show my upcoming payments"],
  DEALS_STATISTICS:         ["Show my running deals", "Show upcoming payments", "Show interest history"],
  LENDER_LATEST_DEAL:       ["Show my active deals", "Which deal earned me highest ROI?", "Show my wallet balance"],
  LENDER_RUNNING_DEALS:     ["Show my wallet balance", "Show upcoming interest payments", "Which deal has the highest rate?"],
  OPEN_DEALS:               ["Show my wallet balance", "Show my active deals", "What interest did I earn?"],
  INTEREST_HISTORY:         ["Show my principal returned", "Show upcoming payments", "How much is in my wallet?"],
  PRINCIPAL_HISTORY:        ["Show my wallet balance", "Show my referral earnings", "Show my active deals"],
  LENDER_UPCOMING_INTEREST: ["Show my wallet balance", "What interest have I earned?", "Show active deals"],
  REFERRAL_HISTORY:         ["Show my wallet balance", "Show my active deals", "What interest did I earn?"],
  EMI_SCHEDULE:             ["Show my active loans", "What interest rate am I paying?", "How does repayment work?"],
  LOAN_APPLICATIONS:        ["Show my active loans", "How long does loan approval take?", "What documents are required?"],
  ACTIVE_LOANS:             ["Show my EMI schedule", "What interest rate am I paying?", "How does repayment work?"],
};

const TYPE_META = {
  LENDER_PROFILE:           { icon: "💰", label: "Wallet", color: "#16a34a" },
  LENDER_LATEST_DEAL:       { icon: "🆕", label: "Latest Deal", color: "#2563eb" },
  LENDER_RUNNING_DEALS:     { icon: "📊", label: "Deals",  color: "#2563eb" },
  OPEN_DEALS:               { icon: "🎯", label: "Marketplace", color: "#7c3aed" },
  INTEREST_HISTORY:         { icon: "💵", label: "Earnings", color: "#0ea5a1" },
  PRINCIPAL_HISTORY:        { icon: "🏦", label: "Principal", color: "#16a34a" },
  LENDER_UPCOMING_INTEREST: { icon: "📅", label: "Upcoming", color: "#f97316" },
  REFERRAL_HISTORY:         { icon: "🎁", label: "Referral", color: "#7c3aed" },
  DEALS_STATISTICS:         { icon: "📈", label: "Stats",  color: "#2563eb" },
  EMI_SCHEDULE:             { icon: "📅", label: "EMI",    color: "#f97316" },
  LOAN_APPLICATIONS:        { icon: "📋", label: "Applications", color: "#6366f1" },
  ACTIVE_LOANS:             { icon: "🏠", label: "Loans",  color: "#2563eb" },
};

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_COLOR = {
  DISBURSED:              { bg: "#dcfce7", text: "#15803d", border: "#86efac" },
  DISBURSED_MARKETPLACE:  { bg: "#dcfce7", text: "#15803d", border: "#86efac" },
  CONSENTED:              { bg: "#dbeafe", text: "#1d4ed8", border: "#93c5fd" },
  ESIGN_DONE:             { bg: "#e0f2fe", text: "#0369a1", border: "#7dd3fc" },
  DISBURSAL_PENDING:      { bg: "#ffedd5", text: "#c2410c", border: "#fdba74" },
  CONSENT_PENDING:        { bg: "#fef9c3", text: "#a16207", border: "#fde047" },
  MARKET_LISTED:          { bg: "#ede9fe", text: "#6d28d9", border: "#c4b5fd" },
  NEGOTIATING:            { bg: "#e0f2fe", text: "#0369a1", border: "#7dd3fc" },
  REJECTED:               { bg: "#fee2e2", text: "#b91c1c", border: "#fca5a5" },
};

const STATUS_BORDER = {
  DISBURSED:             "#16a34a",
  DISBURSED_MARKETPLACE: "#16a34a",
  CONSENTED:             "#2563eb",
  ESIGN_DONE:            "#0891b2",
  DISBURSAL_PENDING:     "#ea580c",
  CONSENT_PENDING:       "#ca8a04",
  MARKET_LISTED:         "#7c3aed",
  NEGOTIATING:           "#0891b2",
  REJECTED:              "#dc2626",
};

const STATUS_GROUPS = {
  all:      null,
  listed:   ["MARKET_LISTED"],
  active:   ["CONSENTED", "ESIGN_DONE", "CONSENT_PENDING", "NEGOTIATING"],
  disbursed:["DISBURSED", "DISBURSED_MARKETPLACE"],
  pending:  ["DISBURSAL_PENDING"],
};

function StatusBadge({ status }) {
  const key = (status || "").toUpperCase();
  const c = STATUS_COLOR[key] || { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" };
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      whiteSpace: "nowrap", letterSpacing: "0.02em", textTransform: "uppercase",
    }}>
      {status || "—"}
    </span>
  );
}

const fmtINR = (v) => {
  const n = Number(v);
  if (v == null || v === "" || isNaN(n)) return "—";
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
};

// ─── EMI Schedule component ───────────────────────────────────────────────────

function EmiScheduleView({ loans }) {
  // Auto-expand first DISBURSED loan; everything else collapsed
  const firstDisbursed = loans.findIndex(l =>
    ["DISBURSED", "DISBURSED_MARKETPLACE"].includes((l.loanStatus || "").toUpperCase())
  );
  const [expanded, setExpanded] = useState(
    firstDisbursed >= 0 ? { [firstDisbursed]: true } : {}
  );

  const toggle = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  const totalMonthly = loans.reduce((s, l) => s + (Number(l.monthlyEmi) || 0), 0);

  const nextDue = loans
    .flatMap(l => (l.nextEmis || []).map(e => e.dueDate))
    .filter(Boolean)
    .sort((a, b) => {
      // Parse dd-MMM-yyyy or dd/MM/yyyy
      try {
        return new Date(a.replace(/-(\d{2})-/g, ' $1 ')) - new Date(b.replace(/-(\d{2})-/g, ' $1 '));
      } catch { return 0; }
    })[0];

  return (
    <div style={{ marginTop: 8 }}>
      {/* Summary strip */}
      <div style={{
        display: "flex", justifyContent: "space-around", background: "#f0fdf4",
        border: "1px solid #bbf7d0", borderRadius: 10, padding: "8px 6px", marginBottom: 8,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#16a34a" }}>{loans.length}</div>
          <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Loans</div>
        </div>
        <div style={{ width: 1, background: "#bbf7d0" }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#16a34a" }}>{fmtINR(totalMonthly)}</div>
          <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Monthly Total</div>
        </div>
        <div style={{ width: 1, background: "#bbf7d0" }} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#16a34a" }}>{nextDue || "—"}</div>
          <div style={{ fontSize: 9, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>Next Due</div>
        </div>
      </div>

      {/* Loan cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {loans.map((loan, i) => {
          const key = (loan.loanStatus || "").toUpperCase();
          const borderColor = STATUS_BORDER[key] || "#94a3b8";
          const isOpen = !!expanded[i];
          const hasEmis = (loan.nextEmis || []).length > 0;

          return (
            <div key={i} style={{
              borderRadius: 10, overflow: "hidden", background: "#fff",
              border: "1px solid #e2e8f0", borderLeft: `3px solid ${borderColor}`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              {/* Card header */}
              <div
                onClick={() => hasEmis && toggle(i)}
                style={{
                  padding: "9px 12px", display: "flex", justifyContent: "space-between",
                  alignItems: "center", cursor: hasEmis ? "pointer" : "default",
                  background: isOpen ? "#fafbff" : "#fff",
                  transition: "background 0.15s",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: "#0f172a", marginBottom: 3 }}>
                    {loan.loanId || loan.loanRequestId || `Loan #${i + 1}`}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 10px", fontSize: 11, color: "#64748b" }}>
                    <span>{fmtINR(loan.loanAmount)}</span>
                    <span>EMI {fmtINR(loan.monthlyEmi)}/mo</span>
                    {loan.durationMonths && <span>{loan.durationMonths}m</span>}
                    {loan.annualRoi && <span>{loan.annualRoi}% p.a.</span>}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, marginLeft: 8, flexShrink: 0 }}>
                  <StatusBadge status={loan.loanStatus} />
                  {hasEmis && (
                    <span style={{ fontSize: 9, color: "#94a3b8" }}>
                      {isOpen ? "▲ collapse" : "▼ next EMIs"}
                    </span>
                  )}
                </div>
              </div>

              {/* EMI table */}
              {isOpen && (
                <div style={{ borderTop: "1px solid #e2e8f0", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        {["#", "Due Date", "EMI", "Principal", "Interest"].map(h => (
                          <th key={h} style={emiTh}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loan.nextEmis.map((e, j) => (
                        <tr key={j} style={{
                          borderTop: "1px solid #f1f5f9",
                          background: j % 2 === 0 ? "#fff" : "#fafbff",
                        }}>
                          <td style={emiTd}>{e.emiNo ?? j + 1}</td>
                          <td style={emiTd}>{e.dueDate || "—"}</td>
                          <td style={{ ...emiTd, fontWeight: 600, color: "#0f172a" }}>{fmtINR(e.emiAmount)}</td>
                          <td style={{ ...emiTd, color: "#2563eb" }}>{fmtINR(e.principal)}</td>
                          <td style={{ ...emiTd, color: "#ea580c" }}>{fmtINR(e.interest)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const emiTh = {
  padding: "5px 10px", textAlign: "right", fontWeight: 600, fontSize: 10,
  color: "#64748b", whiteSpace: "nowrap", letterSpacing: "0.02em",
};
const emiTd = {
  padding: "6px 10px", textAlign: "right", color: "#475569", whiteSpace: "nowrap",
};

// ─── Loan Applications component ─────────────────────────────────────────────

function LoanApplicationsView({ loans }) {
  const [filter, setFilter] = useState("all");

  const counts = Object.keys(STATUS_GROUPS).reduce((acc, k) => {
    acc[k] = k === "all"
      ? loans.length
      : loans.filter(l => STATUS_GROUPS[k].includes((l.loanStatus || "").toUpperCase())).length;
    return acc;
  }, {});

  const visible = filter === "all"
    ? loans
    : loans.filter(l => STATUS_GROUPS[filter]?.includes((l.loanStatus || "").toUpperCase()));

  const filterLabels = { all: "All", listed: "Listed", active: "Active", disbursed: "Disbursed", pending: "Pending" };

  return (
    <div style={{ marginTop: 8 }}>
      {/* Filter pills */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
        {Object.keys(STATUS_GROUPS).map(k => {
          const active = filter === k;
          return (
            <button key={k} onClick={() => setFilter(k)} style={{
              fontSize: 10, padding: "3px 9px", borderRadius: 20, border: "1px solid",
              cursor: "pointer", fontWeight: active ? 700 : 400, transition: "all 0.15s",
              background: active ? "#6366f1" : "#f8fafc",
              color: active ? "#fff" : "#64748b",
              borderColor: active ? "#6366f1" : "#e2e8f0",
            }}>
              {filterLabels[k]} {counts[k] > 0 ? `(${counts[k]})` : ""}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e2e8f0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Loan ID", "Amount", "Purpose", "Dur.", "Status"].map(h => (
                <th key={h} style={appTh}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "14px", textAlign: "center", color: "#94a3b8", fontSize: 11 }}>
                  No loans in this category
                </td>
              </tr>
            ) : visible.map((l, i) => {
              const key = (l.loanStatus || "").toUpperCase();
              const borderColor = STATUS_BORDER[key] || "transparent";
              return (
                <tr key={i} style={{
                  borderTop: "1px solid #f1f5f9",
                  background: i % 2 === 0 ? "#fff" : "#fafbff",
                  borderLeft: `3px solid ${borderColor}`,
                }}>
                  <td style={{ ...appTd, fontFamily: "monospace", fontSize: 10, maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {truncId(l.loanId || l.loanRequestId)}
                  </td>
                  <td style={{ ...appTd, fontWeight: 600 }}>{fmtINR(l.loanAmount)}</td>
                  <td style={appTd}>{l.loanPurpose || "—"}</td>
                  <td style={appTd}>{l.durationMonths ? `${l.durationMonths}m` : "—"}</td>
                  <td style={appTd}><StatusBadge status={l.loanStatus} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: 10, color: "#94a3b8", textAlign: "right", marginTop: 4 }}>
        Showing {visible.length} of {loans.length} applications
      </div>
    </div>
  );
}

const appTh = { padding: "6px 10px", textAlign: "left", fontWeight: 600, fontSize: 10, color: "#64748b", whiteSpace: "nowrap" };
const appTd = { padding: "7px 10px", textAlign: "left", color: "#334155", whiteSpace: "nowrap" };

function truncId(id) {
  if (!id) return "—";
  const s = String(id);
  if (s.length <= 14) return s;
  return s.slice(0, 6) + "…" + s.slice(-5);
}

// ─── Active Loans component ───────────────────────────────────────────────────

function ActiveLoansView({ loans }) {
  return (
    <div style={{ marginTop: 8, overflowX: "auto", borderRadius: 10, border: "1px solid #e2e8f0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            {["Loan ID", "Amount", "EMI/mo", "Total Payable", "Status"].map(h => (
              <th key={h} style={appTh}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loans.map((l, i) => (
            <tr key={i} style={{ borderTop: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafbff" }}>
              <td style={{ ...appTd, fontFamily: "monospace", fontSize: 10 }}>{l.loanRequestId || "—"}</td>
              <td style={{ ...appTd, fontWeight: 600 }}>{fmtINR(l.loanAmount)}</td>
              <td style={appTd}>{fmtINR(l.monthlyEmi)}</td>
              <td style={appTd}>{fmtINR(l.totalPayable)}</td>
              <td style={appTd}><StatusBadge status={l.loanStatus} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Lender: Profile card ─────────────────────────────────────────────────────

function LenderProfileView({ data }) {
  const panColor = (data.panStatus || "").toUpperCase() === "VERIFIED"
    ? { bg: "#dcfce7", text: "#15803d", border: "#86efac" }
    : { bg: "#fef9c3", text: "#a16207", border: "#fde047" };
  const memColor = String(data.membershipStatus || "ACTIVE").toUpperCase() === "ACTIVE"
    ? { bg: "#dbeafe", text: "#1d4ed8", border: "#93c5fd" }
    : { bg: "#f1f5f9", text: "#64748b", border: "#e2e8f0" };

  return (
    <div style={{ marginTop: 8 }}>
      {/* Wallet balance hero */}
      <div style={{
        background: "linear-gradient(135deg, #0ea5a1 0%, #059890 100%)",
        borderRadius: 12, padding: "16px 14px", marginBottom: 8, textAlign: "center",
      }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Wallet Balance
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
          {fmtINR(data.walletBalance)}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>
          {data.lenderName || "—"}
        </div>
      </div>

      {/* Info grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {[
          { label: "Email", value: data.email || "—" },
          { label: "Mobile", value: data.mobile || "—" },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: "#f8fafc", borderRadius: 8, padding: "8px 10px",
            border: "1px solid #e2e8f0",
          }}>
            <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 11, color: "#334155", fontWeight: 600, wordBreak: "break-all" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Badges row */}
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        <span style={{
          flex: 1, textAlign: "center", fontSize: 10, fontWeight: 700, padding: "5px 0",
          borderRadius: 8, border: `1px solid ${panColor.border}`,
          background: panColor.bg, color: panColor.text,
        }}>
          PAN {data.panStatus || "Unknown"}
        </span>
        <span style={{
          flex: 1, textAlign: "center", fontSize: 10, fontWeight: 700, padding: "5px 0",
          borderRadius: 8, border: `1px solid ${memColor.border}`,
          background: memColor.bg, color: memColor.text,
        }}>
          Membership {String(data.membershipStatus || "Unknown")}
        </span>
      </div>
    </div>
  );
}

// ─── Lender: Deal statistics ──────────────────────────────────────────────────

function DealStatisticsView({ data }) {
  const totalDeals    = data.totalDeals ?? 0;
  const totalInvested = data.totalInvested ?? 0;
  const activeDeployed = data.activeDeployed ?? 0;
  const completed     = totalInvested - activeDeployed;

  return (
    <div style={{ marginTop: 8 }}>
      {/* Hero stat */}
      <div style={{
        background: "linear-gradient(135deg, #0ea5a1 0%, #059890 100%)",
        borderRadius: 12, padding: "14px 16px", marginBottom: 8,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Lifetime Investment</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{fmtINR(totalInvested)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Deals</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{totalDeals}</div>
        </div>
      </div>

      {/* Active vs Completed */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        <div style={{ background: "#dbeafe", borderRadius: 10, padding: "10px 12px", border: "1px solid #93c5fd30" }}>
          <div style={{ fontSize: 9, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Active Deployed</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#1d4ed8" }}>{fmtINR(activeDeployed)}</div>
        </div>
        <div style={{ background: "#dcfce7", borderRadius: 10, padding: "10px 12px", border: "1px solid #86efac30" }}>
          <div style={{ fontSize: 9, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Completed</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#15803d" }}>{fmtINR(completed > 0 ? completed : 0)}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Lender: Upcoming payout breakdown ───────────────────────────────────────

function UpcomingBreakdownView({ data }) {
  const rows = [
    data.monthly    && { label: "Next Month",    amount: data.monthly,    deals: data.monthlyDeals,    color: "#0ea5a1", icon: "📅" },
    data.quarterly  && { label: "Next Quarter",  amount: data.quarterly,  deals: data.quarterlyDeals,  color: "#2563eb", icon: "🗓️" },
    data.halfYearly && { label: "Next 6 Months", amount: data.halfYearly, deals: data.halfYearlyDeals, color: "#7c3aed", icon: "📆" },
    data.yearly     && { label: "Next Year",     amount: data.yearly,     deals: data.yearlyDeals,     color: "#f97316", icon: "🎯" },
  ].filter(Boolean);

  const totalExpected = rows.reduce((s, r) => s + (r.amount || 0), 0);

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10,
        padding: "8px 12px", marginBottom: 8,
      }}>
        <span style={{ fontSize: 11, color: "#9a3412" }}>Expected Interest Income</span>
        <span style={{ fontSize: 15, fontWeight: 800, color: "#ea580c" }}>{fmtINR(totalExpected)}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px", background: "#fff", borderRadius: 10,
            border: `1.5px solid ${r.color}30`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>{r.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{r.label}</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{r.deals} deal{r.deals > 1 ? "s" : ""}</div>
              </div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: r.color }}>~{fmtINR(r.amount)}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 6, textAlign: "center" }}>
        Estimated based on your active deals · exact dates vary
      </div>
    </div>
  );
}

// ─── Lender: Running/participated deals ──────────────────────────────────────

function LenderRunningDealsView({ deals }) {
  return (
    <div style={{ marginTop: 8, overflowX: "auto", borderRadius: 10, border: "1px solid #e2e8f0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            {["Deal", "Invested", "ROI %", "Status", "Closed"].map(h => (
              <th key={h} style={appTh}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {deals.length === 0 ? (
            <tr><td colSpan={5} style={{ padding: 14, textAlign: "center", color: "#94a3b8" }}>No deals found</td></tr>
          ) : deals.map((d, i) => {
            const key = (d.status || "").toUpperCase();
            const borderColor = STATUS_BORDER[key] || "#e2e8f0";
            return (
              <tr key={i} style={{
                borderTop: "1px solid #f1f5f9",
                background: i % 2 === 0 ? "#fff" : "#fafbff",
                borderLeft: `3px solid ${borderColor}`,
              }}>
                <td style={{ ...appTd, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {d.dealName || "—"}
                </td>
                <td style={{ ...appTd, fontWeight: 600 }}>{fmtINR(d.participatedAmount)}</td>
                <td style={{ ...appTd, color: "#0ea5a1", fontWeight: 700 }}>
                  {d.rateOfInterest != null ? `${d.rateOfInterest}%` : "—"}
                </td>
                <td style={appTd}><StatusBadge status={d.status} /></td>
                <td style={{ ...appTd, fontSize: 10, color: "#94a3b8" }}>{d.closedDate || "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Lender: Open deals to invest ────────────────────────────────────────────

function OpenDealsView({ deals }) {
  return (
    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
      {deals.length === 0 ? (
        <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, padding: 14 }}>
          No open deals available right now
        </div>
      ) : deals.map((d, i) => {
        const target = Number(d.targetAmount) || 0;
        const raised = Number(d.raisedAmount) || 0;
        const pct = target > 0 ? Math.min(100, Math.round((raised / target) * 100)) : 0;
        const barColor = pct >= 80 ? "#ef4444" : pct >= 50 ? "#f97316" : "#0ea5a1";

        return (
          <div key={i} style={{
            borderRadius: 10, background: "#fff", border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden",
          }}>
            {/* Deal header */}
            <div style={{
              padding: "9px 12px", background: "#f0fdfa",
              borderBottom: "1px solid #ccfbf1",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: "#0f172a" }}>{d.dealName || `Deal #${i + 1}`}</div>
              <div style={{
                fontSize: 11, fontWeight: 800, color: "#0ea5a1",
                background: "#ccfbf1", padding: "2px 8px", borderRadius: 20,
                border: "1px solid #5eead4",
              }}>
                {d.rateOfInterest != null ? `${d.rateOfInterest}% p.a.` : "—"}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ padding: "8px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748b", marginBottom: 4 }}>
                <span>Raised: {fmtINR(raised)}</span>
                <span>Target: {fmtINR(target)}</span>
              </div>
              <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${pct}%`, background: barColor,
                  borderRadius: 3, transition: "width 0.5s ease",
                }} />
              </div>
              <div style={{ fontSize: 10, color: barColor, fontWeight: 700, marginTop: 3, textAlign: "right" }}>
                {pct}% funded
              </div>
            </div>

            {/* Closing date */}
            {d.closingDate && (
              <div style={{
                padding: "5px 12px", background: "#fef9c3",
                borderTop: "1px solid #fde047", fontSize: 10, color: "#a16207",
              }}>
                Closes: {d.closingDate}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Lender: Interest / principal / referral history ─────────────────────────

function LenderHistoryView({ items = [], totalLabel, totalValue, accentColor = "#0ea5a1", columns }) {
  return (
    <div style={{ marginTop: 8 }}>
      {/* Total strip */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: `${accentColor}12`, border: `1px solid ${accentColor}30`,
        borderRadius: 10, padding: "8px 12px", marginBottom: 8,
      }}>
        <span style={{ fontSize: 11, color: "#64748b" }}>{totalLabel}</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: accentColor }}>{fmtINR(totalValue)}</span>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e2e8f0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {columns.map(c => <th key={c.key} style={appTh}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ padding: 14, textAlign: "center", color: "#94a3b8" }}>No records found</td></tr>
            ) : items.map((item, i) => (
              <tr key={i} style={{ borderTop: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafbff" }}>
                {columns.map(c => (
                  <td key={c.key} style={{ ...appTd, ...(c.style || {}) }}>
                    {c.fmt ? c.fmt(item[c.key]) : (item[c.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {items.length > 0 && (
        <div style={{ fontSize: 10, color: "#94a3b8", textAlign: "right", marginTop: 4 }}>
          Showing {items.length} records
        </div>
      )}
    </div>
  );
}

// ─── Lender: Upcoming interest ────────────────────────────────────────────────

function LenderUpcomingInterestView({ items = [], totalUpcoming }) {
  return (
    <LenderHistoryView
      items={items}
      totalLabel="Total Upcoming Interest"
      totalValue={totalUpcoming}
      accentColor="#f97316"
      columns={[
        { key: "dealName",  label: "Deal" },
        { key: "dueDate",   label: "Due Date" },
        { key: "amount",    label: "Interest", fmt: fmtINR, style: { fontWeight: 700, color: "#f97316" } },
      ]}
    />
  );
}

// ─── Proactive follow-up suggestions ─────────────────────────────────────────

function SuggestedFollowup({ type, onSend }) {
  const suggestions = FOLLOWUP[type];
  if (!suggestions || suggestions.length === 0) return null;
  return (
    <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px dashed #e2e8f0" }}>
      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 5, fontStyle: "italic" }}>
        💡 You might also ask:
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => onSend(s)} style={{
            fontSize: 10, padding: "3px 9px", borderRadius: 20, cursor: "pointer",
            border: "1px solid #6366f130", background: "#f5f3ff", color: "#6366f1",
            transition: "all 0.15s", fontFamily: "inherit",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#6366f1"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#f5f3ff"; e.currentTarget.style.color = "#6366f1"; }}>
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Topic badge ──────────────────────────────────────────────────────────────

function TopicBadge({ type }) {
  const meta = TYPE_META[type];
  if (!meta) return null;
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
      background: meta.color + "15", color: meta.color,
      border: `1px solid ${meta.color}30`, marginBottom: 6,
      textTransform: "uppercase", letterSpacing: "0.04em",
    }}>
      {meta.icon} {meta.label}
    </div>
  );
}

// ─── Rich message dispatcher ──────────────────────────────────────────────────

function RichMessage({ data }) {
  if (!data) return null;
  const { type } = data;

  // Borrower types
  if (type === "EMI_SCHEDULE")      return <EmiScheduleView loans={data.loans || []} />;
  if (type === "LOAN_APPLICATIONS") return <LoanApplicationsView loans={data.loans || []} />;
  if (type === "ACTIVE_LOANS")      return <ActiveLoansView loans={data.loans || []} />;

  // Lender types
  if (type === "LENDER_PROFILE")    return <LenderProfileView data={data} />;
  if (type === "DEALS_STATISTICS")  return <DealStatisticsView data={data} />;

  if (type === "LENDER_LATEST_DEAL")
    return (
      <div style={{ background: "#f0f9ff", borderRadius: 10, padding: "12px 16px", border: "1.5px solid #bae6fd" }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: "#0369a1" }}>Your Most Recent Deal</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <tbody>
            <tr><td style={{ color: "#64748b", paddingBottom: 4 }}>Deal Name</td><td style={{ fontWeight: 700, textAlign: "right" }}>{data.dealName || "—"}</td></tr>
            <tr><td style={{ color: "#64748b", paddingBottom: 4 }}>Invested</td><td style={{ fontWeight: 700, textAlign: "right", color: "#2563eb" }}>{fmtINR(data.participatedAmount)}</td></tr>
            <tr><td style={{ color: "#64748b", paddingBottom: 4 }}>Rate</td><td style={{ fontWeight: 700, textAlign: "right", color: "#16a34a" }}>{data.rateOfInterest}% p.a.</td></tr>
            <tr><td style={{ color: "#64748b", paddingBottom: 4 }}>Status</td><td style={{ fontWeight: 600, textAlign: "right" }}>{data.status || "—"}</td></tr>
            <tr><td style={{ color: "#64748b" }}>Joined On</td><td style={{ fontWeight: 600, textAlign: "right" }}>{data.joinedOn || "—"}</td></tr>
          </tbody>
        </table>
      </div>
    );

  if (type === "LENDER_RUNNING_DEALS")
    return <LenderRunningDealsView deals={data.deals || []} />;

  if (type === "OPEN_DEALS")
    return <OpenDealsView deals={data.deals || []} />;

  if (type === "LENDER_UPCOMING_INTEREST")
    return <LenderUpcomingInterestView items={data.items || []} totalUpcoming={data.totalUpcoming} />;

  if (type === "LENDER_UPCOMING_BREAKDOWN")
    return <UpcomingBreakdownView data={data} />;

  if (type === "INTEREST_HISTORY")
    return (
      <LenderHistoryView
        items={data.items || []}
        totalLabel={`Total Earned (${data.totalCount ?? ""} transactions)`}
        totalValue={data.totalEarned}
        accentColor="#0ea5a1"
        columns={[
          { key: "dealName",    label: "Deal" },
          { key: "earnedDate",  label: "Date" },
          { key: "amount",      label: "Earned", fmt: fmtINR, style: { fontWeight: 700, color: "#0ea5a1" } },
        ]}
      />
    );

  if (type === "PRINCIPAL_HISTORY")
    return (
      <LenderHistoryView
        items={data.items || []}
        totalLabel="Total Principal Returned"
        totalValue={data.totalReturned}
        accentColor="#16a34a"
        columns={[
          { key: "dealName",     label: "Deal" },
          { key: "returnedDate", label: "Date" },
          { key: "amount",       label: "Returned", fmt: fmtINR, style: { fontWeight: 700, color: "#16a34a" } },
        ]}
      />
    );

  if (type === "REFERRAL_HISTORY")
    return (
      <div style={{ background: "#faf5ff", borderRadius: 10, padding: "12px 16px", border: "1.5px solid #ddd6fe" }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: "#7c3aed" }}>Referral Earnings Timeline</div>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>
          Total Paid: <strong style={{ color: "#7c3aed" }}>{fmtINR(data.totalBonus)}</strong>
        </div>
        {(data.items || []).length === 0
          ? <div style={{ color: "#94a3b8", fontSize: 13 }}>No paid referral bonuses yet.</div>
          : <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1.5px solid #ddd6fe" }}>
                  <th style={{ textAlign: "left", paddingBottom: 6, color: "#7c3aed", fontWeight: 600 }}>Date</th>
                  <th style={{ textAlign: "center", paddingBottom: 6, color: "#7c3aed", fontWeight: 600 }}>Referees</th>
                  <th style={{ textAlign: "right", paddingBottom: 6, color: "#7c3aed", fontWeight: 600 }}>Bonus Paid</th>
                </tr>
              </thead>
              <tbody>
                {(data.items || []).map((it, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #ede9fe" }}>
                    <td style={{ padding: "5px 0", color: "#374151" }}>{it.date || "—"}</td>
                    <td style={{ padding: "5px 0", textAlign: "center", color: "#64748b" }}>{it.refereeCount || 0}</td>
                    <td style={{ padding: "5px 0", textAlign: "right", fontWeight: 700, color: "#7c3aed" }}>{fmtINR(it.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>
    );

  return null;
}

// ─── Text formatter (bold, italic, numbered list) ─────────────────────────────

function FormattedText({ text }) {
  if (!text || typeof text !== "string") return null;

  // Inline markdown: **bold**, _italic_, and ₹amounts highlighted
  const inline = (str) => {
    const parts = str.split(/(\*\*[^*]+\*\*|_[^_]+_|₹[\d,]+(?:\.\d+)?)/g);
    return parts.map((p, i) => {
      if (p.startsWith("**") && p.endsWith("**"))
        return <strong key={i} style={{ color: "#0f172a", fontWeight: 700 }}>{p.slice(2, -2)}</strong>;
      if (p.startsWith("_") && p.endsWith("_"))
        return <em key={i} style={{ color: "#64748b", fontStyle: "italic" }}>{p.slice(1, -1)}</em>;
      if (/^₹[\d,]/.test(p))
        return <span key={i} style={{ color: "#059669", fontWeight: 700 }}>{p}</span>;
      return <span key={i}>{p}</span>;
    });
  };

  // A line "starts with emoji" when its first codePoint is > U+2600 (covers all finance emojis)
  const isEmojiLine = (line) => { const c = line.codePointAt(0); return !!c && c > 0x2600; };

  // Parse numbered list patterns: "intro text 1. item 2. item ..."
  const listMatch = text.match(/^(.*?)\s*1\.\s(.+?)(?:\s*2\.\s(.+?))?(?:\s*3\.\s(.+?))?(?:\s*4\.\s(.+?))?$/s);
  if (listMatch && listMatch[2]) {
    const intro = listMatch[1]?.trim();
    const items = [listMatch[2], listMatch[3], listMatch[4], listMatch[5]].filter(Boolean).map(s => s.trim());
    return (
      <div>
        {intro && <div style={{ marginBottom: 6, lineHeight: 1.5 }}>{inline(intro)}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {items.map((item, i) => (
            <div key={i} style={{
              display: "flex", gap: 8, alignItems: "flex-start",
              padding: "5px 8px", background: "#f8fafc", borderRadius: 8,
              border: "1px solid #e2e8f0", fontSize: 12,
            }}>
              <span style={{
                width: 18, height: 18, borderRadius: "50%", background: "#6366f1",
                color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{i + 1}</span>
              <span style={{ color: "#334155" }}>{inline(item)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Emoji-stat lines: lines starting with an emoji that also contain **bold** get a card treatment
  const lines = text.split("\n");
  const hasEmojiStats = lines.some(l => l.trim() && isEmojiLine(l.trim()) && l.includes("**"));

  if (hasEmojiStats) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={i} style={{ height: 3 }} />;
          if (isEmojiLine(trimmed) && trimmed.includes("**")) {
            return (
              <div key={i} style={{
                padding: "8px 12px",
                background: "linear-gradient(135deg, #f0fdf4, #f0f9ff)",
                borderRadius: 10, border: "1px solid #bae6fd",
                fontSize: 13, lineHeight: 1.6,
              }}>
                {inline(trimmed)}
              </div>
            );
          }
          return (
            <div key={i} style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, paddingLeft: 4 }}>
              {inline(trimmed)}
            </div>
          );
        })}
      </div>
    );
  }

  // Bullet list: lines starting with "- " render as styled bullets
  const hasBullets = lines.some(l => l.trim().startsWith("- "));
  if (hasBullets) {
    return (
      <div>
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={i} style={{ height: 4 }} />;
          if (trimmed.startsWith("- ")) {
            return (
              <div key={i} style={{
                display: "flex", gap: 8, alignItems: "flex-start",
                padding: "5px 10px", marginBottom: 4,
                background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0",
              }}>
                <span style={{ color: "#0ea5a1", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>•</span>
                <span style={{ fontSize: 13, color: "#334155", lineHeight: 1.5 }}>{inline(trimmed.slice(2))}</span>
              </div>
            );
          }
          return (
            <div key={i} style={{ marginBottom: 6, fontSize: 13, lineHeight: 1.5 }}>{inline(trimmed)}</div>
          );
        })}
      </div>
    );
  }

  // Default: inline formatting + newlines as paragraph breaks
  return (
    <div>
      {lines.map((line, i) => (
        <div key={i} style={{ marginBottom: line.trim() ? 3 : 6 }}>
          {line.trim() ? inline(line) : " "}
        </div>
      ))}
    </div>
  );
}

// ─── Keyframe injection ───────────────────────────────────────────────────────

const DOT_KEYFRAME = `
  @keyframes chatDotBounce {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.55; }
    30%           { transform: translateY(-7px); opacity: 1; }
  }
`;

// ─── Main component ───────────────────────────────────────────────────────────

export { RichMessage, FormattedText, SuggestedFollowup, TopicBadge };

export default function ChatDrawer({ open, initialMessage, onClose }) {
  const ROLE = localStorage.getItem("primaryType") || "LENDER";
  const cfg = ROLE_CONFIG[ROLE] || ROLE_CONFIG.LENDER;
  const replies = QUICK_REPLIES[ROLE] || QUICK_REPLIES.LENDER;

  const [visible, setVisible] = useState(open);
  const [messages, setMessages] = useState([
    {
      id: 1, from: "bot",
      text: `👋 Hello! I'm your ${cfg.label}. Ask me anything about your account, deals, or OxyLoans platform.`,
      data: null, timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [quickSet, setQuickSet] = useState(replies.slice(0, 4));
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const qIndex = useRef(0);

  useEffect(() => {
    if (isTyping) return;
    const t = setInterval(() => {
      qIndex.current = (qIndex.current + 4) % replies.length;
      setQuickSet(replies.slice(qIndex.current, qIndex.current + 4));
    }, 5000);
    return () => clearInterval(t);
  }, [isTyping]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => { setVisible(open); }, [open]);
  useEffect(() => {
    if (open && initialMessage) handleSend(initialMessage);
  }, [open, initialMessage]);

  const speak = useCallback((text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-IN"; utt.rate = 1; utt.pitch = 1;
    window.speechSynthesis.speak(utt);
  }, [ttsEnabled]);

  const handleSend = useCallback(async (text) => {
    const trimmed = (text || "").trim();
    if (!trimmed) return;

    setMessages(prev => [...prev, { id: Date.now(), from: "user", text: trimmed, data: null, timestamp: new Date() }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await chatbotapicall(trimmed);
      const answer =
        res.data?.answer || res.data?.response || res.data?.message ||
        (typeof res.data === "string" ? res.data : null) ||
        "I don't have that information right now. Please check your dashboard.";
      const responseData = res.data?.responseData || null;

      setMessages(prev => [...prev, {
        id: Date.now() + 1, from: "bot",
        text: answer, data: responseData, timestamp: new Date(),
      }]);
      speak(answer);
    } catch (err) {
      let msg = "Something went wrong. Please try again.";
      if (err.response?.status === 401) msg = "Session expired. Please log in again.";
      setMessages(prev => [...prev, { id: Date.now() + 1, from: "bot", text: msg, data: null, timestamp: new Date() }]);
    } finally {
      setIsTyping(false);
    }
  }, [speak]);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported. Use Chrome or Edge."); return; }
    const r = new SR();
    r.lang = "en-IN"; r.continuous = false; r.interimResults = true;
    r.onstart = () => setIsListening(true);
    r.onresult = (e) => {
      const t = Array.from(e.results).map(x => x[0].transcript).join("");
      setInput(t);
      if (e.results[e.results.length - 1].isFinal) { setIsListening(false); handleSend(t); }
    };
    r.onerror = r.onend = () => setIsListening(false);
    r.start();
  }, [handleSend]);

  if (!visible) return null;

  return (
    <div style={styles.backdrop}>
      <style dangerouslySetInnerHTML={{ __html: DOT_KEYFRAME }} />
      <div style={styles.drawer}>

        {/* HEADER */}
        <div style={{ ...styles.header, background: cfg.bg }}>
          <div style={styles.headerLeft}>
            <div style={styles.avatar}>🏦</div>
            <div>
              <div style={styles.title}>OxyLoans AI</div>
              <div style={styles.subtitle}>{cfg.label} • Online</div>
            </div>
          </div>
          <div style={styles.headerRight}>
            <button
              title={ttsEnabled ? "Voice output ON" : "Voice output OFF"}
              onClick={() => setTtsEnabled(v => !v)}
              style={{ ...styles.iconBtn, background: ttsEnabled ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)" }}
            >
              🔊
            </button>
            <button onClick={() => { setVisible(false); onClose(); }} style={styles.iconBtn} title="Close">✕</button>
          </div>
        </div>

        {/* ROLE BADGE */}
        <div style={{ ...styles.roleBadge, background: cfg.color + "18", color: cfg.color, borderColor: cfg.color + "40" }}>
          Logged in as <strong>{ROLE}</strong> — responses are tailored to your role
        </div>

        {/* MESSAGES */}
        <div ref={scrollRef} style={styles.body}>
          {messages.map((m) => (
            <div key={m.id} style={{
              ...styles.msgRow,
              justifyContent: m.from === "user" ? "flex-end" : "flex-start",
            }}>
              {m.from === "bot" && <div style={{ ...styles.botDot, background: cfg.color }} />}

              <div style={
                m.from === "bot"
                  ? { ...styles.bubble, ...styles.botBubble, ...(m.data ? styles.richBubble : {}) }
                  : { ...styles.bubble, ...styles.userBubble, background: cfg.color }
              }>
                {/* Topic badge + caption for rich messages */}
                {m.data ? (
                  <>
                    <TopicBadge type={m.data.type} />
                    <div style={styles.richCaption}>{m.text}</div>
                  </>
                ) : (
                  <div style={styles.bubbleText}>
                    <FormattedText text={m.text} />
                  </div>
                )}

                {m.data && <RichMessage data={m.data} />}

                {m.from === "bot" && m.data && (
                  <SuggestedFollowup type={m.data.type} onSend={handleSend} />
                )}

                <div style={styles.time}>
                  {m.timestamp?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ ...styles.msgRow, justifyContent: "flex-start" }}>
              <div style={{ ...styles.botDot, background: cfg.color }} />
              <div style={{ ...styles.bubble, ...styles.botBubble, padding: "8px 13px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={styles.dots}>
                    <span style={{ ...styles.dot, background: cfg.color }} />
                    <span style={{ ...styles.dot, background: cfg.color, animationDelay: "0.2s" }} />
                    <span style={{ ...styles.dot, background: cfg.color, animationDelay: "0.4s" }} />
                  </div>
                  <span style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>AI is thinking…</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* QUICK REPLIES */}
        <div style={styles.chips}>
          {quickSet.map((q, i) => (
            <button key={i} disabled={isTyping} onClick={() => handleSend(q)}
              style={{ ...styles.chip, borderColor: cfg.color + "60", color: cfg.color }}>
              {q}
            </button>
          ))}
        </div>

        {/* INPUT */}
        <div style={styles.footer}>
          <button onClick={startListening} disabled={isTyping || isListening}
            style={{ ...styles.voiceBtn, background: isListening ? "#ef4444" : "#f1f5f9" }}
            title={isListening ? "Listening…" : "Speak"}>
            {isListening ? "🔴" : "🎤"}
          </button>
          <input
            ref={inputRef}
            style={{ ...styles.input, borderColor: cfg.color + "80" }}
            placeholder={isListening ? "🎤 Listening…" : "Ask anything…"}
            value={input}
            disabled={isTyping || isListening}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(input); } }}
          />
          <button onClick={() => handleSend(input)} disabled={isTyping || !input.trim()}
            style={{ ...styles.sendBtn, background: input.trim() ? cfg.color : "#cbd5e1" }}>
            {isTyping ? "⏳" : "➤"}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  backdrop: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
    display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
    padding: "0 24px 24px 0", zIndex: 9999,
  },
  drawer: {
    width: 450, maxHeight: "88vh", borderRadius: 16,
    background: "#fff", display: "flex", flexDirection: "column",
    boxShadow: "0 24px 80px rgba(0,0,0,0.22)", overflow: "hidden",
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
  },
  header: {
    padding: "14px 16px", display: "flex", alignItems: "center",
    justifyContent: "space-between", flexShrink: 0,
  },
  headerLeft: { display: "flex", alignItems: "center", gap: 10 },
  headerRight: { display: "flex", gap: 8 },
  avatar: {
    width: 36, height: 36, borderRadius: "50%",
    background: "rgba(255,255,255,0.25)", display: "flex",
    alignItems: "center", justifyContent: "center", fontSize: 18,
  },
  title: { color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.2 },
  subtitle: { color: "rgba(255,255,255,0.85)", fontSize: 11, marginTop: 2 },
  iconBtn: {
    width: 30, height: 30, borderRadius: 8, border: "none", cursor: "pointer",
    fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", background: "rgba(255,255,255,0.2)", transition: "background 0.2s",
  },
  roleBadge: {
    fontSize: 11, padding: "5px 14px", textAlign: "center",
    borderTop: "1px solid", borderBottom: "1px solid", flexShrink: 0,
  },
  body: {
    flex: 1, overflowY: "auto", padding: "16px 14px",
    display: "flex", flexDirection: "column", gap: 12, background: "#f8fafc",
  },
  msgRow: { display: "flex", alignItems: "flex-end", gap: 6 },
  botDot: { width: 6, height: 6, borderRadius: "50%", marginBottom: 6, flexShrink: 0 },
  bubble: { maxWidth: "82%", borderRadius: 14, padding: "10px 13px", fontSize: 13, lineHeight: 1.6 },
  botBubble: { background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", borderBottomLeftRadius: 4 },
  userBubble: { color: "#fff", borderBottomRightRadius: 4 },
  richBubble: { maxWidth: "97%", padding: "10px 10px 8px" },
  bubbleText: { wordBreak: "break-word" },
  richCaption: {
    fontSize: 12, color: "#475569", marginBottom: 2, fontStyle: "italic",
    paddingBottom: 6, borderBottom: "1px dashed #e2e8f0",
  },
  time: { fontSize: 10, opacity: 0.45, marginTop: 6, textAlign: "right" },
  dots: { display: "flex", gap: 5, padding: "2px 0", alignItems: "center" },
  dot: {
    width: 7, height: 7, borderRadius: "50%", display: "inline-block",
    animation: "chatDotBounce 1.4s ease-in-out infinite",
  },
  chips: {
    display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 12px",
    background: "#f8fafc", borderTop: "1px solid #e2e8f0", flexShrink: 0,
  },
  chip: {
    fontSize: 11, padding: "4px 10px", borderRadius: 20, border: "1px solid",
    background: "#fff", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
  },
  footer: {
    display: "flex", gap: 8, padding: "10px 12px", background: "#fff",
    borderTop: "1px solid #e2e8f0", flexShrink: 0, alignItems: "center",
  },
  voiceBtn: {
    width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer",
    fontSize: 15, flexShrink: 0, display: "flex", alignItems: "center",
    justifyContent: "center", transition: "background 0.2s",
  },
  input: {
    flex: 1, border: "1.5px solid", borderRadius: 10, padding: "8px 12px",
    fontSize: 13, outline: "none", background: "#f8fafc", transition: "border-color 0.2s",
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 10, border: "none", cursor: "pointer",
    color: "#fff", fontSize: 15, flexShrink: 0, display: "flex",
    alignItems: "center", justifyContent: "center", transition: "background 0.2s",
  },
};
