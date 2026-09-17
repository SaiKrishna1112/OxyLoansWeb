import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AdminActiveLendersPanel from "./AdminActiveLendersPanel";
import {
  DEALS_DIRECTORY_PAGE_SIZE,
  getViewPayments,
  loadDealsDirectoryPage,
  loadDealsDirectorySummary,
} from "../../../HttpRequest/aiAdminApi";
import { getAdminAILenderMembershipDetails } from "../../../HttpRequest/admin";
import { DataTable, LoadingBlock, money, number } from "./adminAIDashboardShared";
import { ADMIN_AI_DASHBOARD_PATH, goToAdminAIDashboard } from "./adminAINavigation";
import {
  DEAL_LIFECYCLE_ORDER,
  lifecycleStageMeta,
  summaryCountForStage,
} from "./dealLifecycleHelpers";

const formatDate = (v) => {
  if (!v || v === " ") return "â€”";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleDateString("en-IN");
};

const lifecycleBadge = (stageId) => {
  const meta = lifecycleStageMeta(stageId);
  return (
    <span className={`badge ${meta.badgeClass}`} title={meta.description}>
      {meta.shortLabel}
    </span>
  );
};

export const DealsDirectoryPanel = () => {
  const [category, setCategory] = useState("OPEN_FOR_PARTICIPATION");
  const [pageNo, setPageNo] = useState(1);
  const [summary, setSummary] = useState(null);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (cat = category, pg = pageNo) => {
    setLoading(true);
    setError("");
    try {
      const [sum, data] = await Promise.all([
        loadDealsDirectorySummary().catch(() => null),
        loadDealsDirectoryPage(cat, pg, DEALS_DIRECTORY_PAGE_SIZE),
      ]);
      setSummary(sum);
      setPage(data?.data || data);
    } catch (err) {
      setError(err?.message || "Failed to load deals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(category, 1);
    setPageNo(1);
  }, [category]);

  const deals = page?.deals || [];
  const totalCount = page?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / DEALS_DIRECTORY_PAGE_SIZE));

  if (loading && !page) return <LoadingBlock label="Loading dealsâ€¦" />;

  return (
    <>
      {error && <div className="alert alert-danger py-2 small">{error}</div>}
      <div className="ai-deals-tabs mb-3">
        {DEAL_LIFECYCLE_ORDER.map((stage) => (
          <button
            key={stage.id}
            type="button"
            className={`ai-deals-tab ${category === stage.id ? "ai-deals-tab--active" : ""}`}
            onClick={() => setCategory(stage.id)}
            title={stage.description}
          >
            {stage.label}
            <span className="ai-deals-tab-count">
              {summaryCountForStage(summary, stage.id) ?? "â€”"}
            </span>
          </button>
        ))}
      </div>
      <DataTable
        rows={deals}
        initialLimit={DEALS_DIRECTORY_PAGE_SIZE}
        columns={[
          ["dealId", "ID"],
          ["dealName", "Deal"],
          ["borrowerName", "Borrower"],
          ["lifecycleStage", "Stage", lifecycleBadge],
          ["dealAmount", "Amount", money],
          ["participatedAmount", "Participated", money],
          ["fillPercent", "Fill %", (v) => `${v ?? 0}%`],
          ["fundsAcceptanceEndDate", "Participation ends", formatDate],
          ["loanActiveDate", "Loan active", formatDate],
          ["borrowerClosingStatus", "Borrower status"],
          ["rateOfInterest", "Lender ROI %"],
          ["borrowerRateOfInterest", "Borrower ROI %"],
        ]}
        emptyText="No deals in this lifecycle stage."
      />
      {totalPages > 1 && (
        <div className="ai-deals-footer">
          <span className="text-muted small">
            Page {pageNo} of {totalPages} ({number(totalCount)} deals)
          </span>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              disabled={pageNo <= 1 || loading}
              onClick={() => {
                const next = pageNo - 1;
                setPageNo(next);
                load(category, next);
              }}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-success"
              disabled={pageNo >= totalPages || loading}
              onClick={() => {
                const next = pageNo + 1;
                setPageNo(next);
                load(category, next);
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const LenderDirectoryPanel = () => <AdminActiveLendersPanel />;

export const ViewPaymentsPanel = () => {
  const [daysAhead, setDaysAhead] = useState(3);
  const [search, setSearch] = useState("");
  const [normalized, setNormalized] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async (days = daysAhead) => {
    setLoading(true);
    setError("");
    try {
      const res = await getViewPayments({ daysAhead: days });
      setNormalized(normalizeViewPaymentsData(res?.data || res));
    } catch (err) {
      setError(err?.message || "Could not load upcoming payments.");
      setNormalized(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(daysAhead);
  }, [daysAhead]);

  if (loading && !normalized) {
    return <LoadingBlock label="Loading upcoming paymentsâ€¦" />;
  }

  const groups = normalized?.groups || [];
  const summary = normalized?.summary || {};
  const searchTerm = search.trim().toLowerCase();
  const filteredGroups = searchTerm
    ? groups
        .map((day) => ({
          ...day,
          deals: (day.deals || []).filter((d) => {
            const hay = [
              d.dealId,
              d.dealName,
              d.dealStatus,
              d.paymentStatus,
              day.paymentDate,
              day.dateLabel,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            return hay.includes(searchTerm);
          }),
        }))
        .filter((day) => day.deals.length > 0)
    : groups;
  const isDemo =
    normalized?.source === "static" ||
    normalized?.source === "static-demo" ||
    normalized?.source === "static-fallback";

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div>
          {normalized?.windowLabel && (
            <p className="text-muted small mb-0">
              <i className="fas fa-calendar me-1" />
              {normalized.windowLabel}
              {normalized.source && (
                <span className="ms-2 badge bg-light text-dark border">{normalized.source}</span>
              )}
            </p>
          )}
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <label className="small text-muted mb-0">Show next</label>
          <select
            className="form-select form-select-sm"
            style={{ width: 90 }}
            value={daysAhead}
            onChange={(e) => setDaysAhead(Number(e.target.value))}
            disabled={loading}
          >
            <option value={3}>3 days</option>
            <option value={5}>5 days</option>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
          </select>
          <input
            type="search"
            className="form-control form-control-sm"
            style={{ width: 200 }}
            placeholder="Search deal / dateâ€¦"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            className="btn btn-sm btn-outline-success"
            onClick={() => load(daysAhead)}
            disabled={loading}
          >
            <i className={`fas fa-sync-alt ${loading ? "fa-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      {isDemo && !error && (
        <div className="alert alert-info py-2 small mb-3">
          Showing sample payment data
          {normalized?.fallbackReason ? ` (live API unavailable: ${normalized.fallbackReason})` : ""}.
        </div>
      )}

      {!error && groups.length > 0 && (
        <div className="ai-stat-grid mb-3">
          <div className="ai-stat-tile ai-stat-tile--square" style={{ "--tile-color": "#0d9488" }}>
            <div className="label">Total deals</div>
            <div className="value">{number(summary.totalDeals ?? 0)}</div>
          </div>
          <div className="ai-stat-tile ai-stat-tile--square" style={{ "--tile-color": "#2563eb" }}>
            <div className="label">Total interest</div>
            <div className="value">{money(summary.totalAmount)}</div>
          </div>
          {summary.pendingDates != null && (
            <div className="ai-stat-tile ai-stat-tile--square" style={{ "--tile-color": "#d97706" }}>
              <div className="label">Pending dates</div>
              <div className="value">{number(summary.pendingDates)}</div>
            </div>
          )}
          {summary.completedDates != null && (
            <div className="ai-stat-tile ai-stat-tile--square" style={{ "--tile-color": "#059669" }}>
              <div className="label">Completed dates</div>
              <div className="value">{number(summary.completedDates)}</div>
            </div>
          )}
        </div>
      )}

      {!error && filteredGroups.length === 0 && !loading && groups.length > 0 && searchTerm && (
        <p className="text-muted mb-0">No deals match &ldquo;{search.trim()}&rdquo;.</p>
      )}

      {!error && groups.length === 0 && !loading && (
        <p className="text-muted mb-0">
          No upcoming interest payments in the next {daysAhead} day(s).
        </p>
      )}

      {filteredGroups.map((day, i) => (
        <div key={`${day.paymentDate}-${i}`} className="ai-payments-day mb-3">
          <div className="ai-payments-day-head">
            <div>
              <strong>{day.dateLabel || day.paymentDate}</strong>
              {day.dayLabel && <span className="badge bg-info text-dark ms-2">{day.dayLabel}</span>}
            </div>
            <span className="text-muted small">
              {number(day.dealCount)} deals Â· {money(day.totalAmount)}
            </span>
          </div>
          <DataTable
            rows={day.deals || []}
            initialLimit={15}
            showMoreLabel="Show more deals"
            columns={[
              ["dealId", "Deal ID"],
              ["dealName", "Deal Name"],
              ["amount", "Interest", money],
              ["noOfLenders", "Lenders", number],
              ["rateOfInterest", "ROI %", (v) => (v == null ? "â€”" : `${v}%`)],
              ["dealStatus", "Deal Status"],
              ["paymentStatus", "Payment Status"],
            ]}
            emptyText="No deals on this date"
          />
        </div>
      ))}
    </>
  );
};

/** Normalize API / legacy / static payment payloads into grouped day rows */
export const normalizeViewPaymentsData = (raw) => {
  if (!raw) {
    return { groups: [], summary: {}, windowLabel: "", source: "" };
  }

  if (Array.isArray(raw)) {
    raw = { payments: raw, source: "legacy" };
  }

  // Static demo: already grouped with .deals[]
  if (raw.payments?.length && Array.isArray(raw.payments[0]?.deals)) {
    const groups = raw.payments.map((p) => ({
      paymentDate: p.paymentDate,
      dateLabel: p.dateLabel || p.paymentDate,
      dayLabel: null,
      dealCount: p.dealCount ?? p.deals?.length ?? 0,
      totalAmount: p.totalAmount ?? p.deals?.reduce((s, d) => s + (Number(d.amount) || 0), 0),
      deals: (p.deals || []).map(mapPaymentDealRow),
    }));
    return {
      groups,
      summary: {
        totalDeals: raw.totalDeals ?? groups.reduce((s, g) => s + g.dealCount, 0),
        totalAmount: groups.reduce((s, g) => s + (g.totalAmount || 0), 0),
      },
      windowLabel: raw.fromDate && raw.toDate ? `${raw.fromDate} â€“ ${raw.toDate}` : `Next ${raw.daysAhead || 3} days`,
      source: raw.source || "static",
    };
  }

  // Live API: flat upcomingDeals list
  let flatDeals = raw.upcomingDeals || [];

  // Raw payments rows with nested dealLevelInterestPaymentsDto
  if (!flatDeals.length && raw.payments?.length) {
    raw.payments.forEach((row) => {
      (row.dealLevelInterestPaymentsDto || []).forEach((deal) => {
        flatDeals.push({
          paymentDate: row.paymentDate,
          paymentDateLabel: row.paymentDate,
          paymentStatus: row.status,
          dealId: deal.dealId,
          dealName: deal.dealName || deal.DealName,
          totalInterest: deal.totalInterest,
          noOfLenders: deal.noOfLenders,
          dealStatus: deal.dealStatus,
          rateOfInterest: deal.rateOfInterest,
        });
      });
    });
  }

  const groups = groupPaymentDealsByDate(flatDeals);
  const totalAmount =
    raw.summary?.totalInterest ??
    flatDeals.reduce((s, d) => s + (Number(d.totalInterest ?? d.amount) || 0), 0);

  return {
    groups,
    summary: {
      totalDeals: raw.summary?.totalDeals ?? flatDeals.length,
      totalAmount,
      pendingDates: raw.summary?.pendingDates,
      completedDates: raw.summary?.completedDates,
    },
    windowLabel: raw.windowLabel || `Upcoming ${raw.daysAhead || 3} days`,
    source: raw.source || "live",
    fallbackReason: raw.fallbackReason,
  };
};

const mapPaymentDealRow = (deal) => ({
  dealId: deal.dealId,
  dealName: deal.dealName || deal.DealName || `Deal #${deal.dealId}`,
  amount: deal.totalInterest ?? deal.amount ?? deal.interest ?? 0,
  noOfLenders: deal.noOfLenders,
  rateOfInterest: deal.rateOfInterest,
  dealStatus: deal.dealStatus,
  paymentStatus: deal.paymentStatus,
});

const groupPaymentDealsByDate = (flatDeals) => {
  const byDate = new Map();
  (flatDeals || []).forEach((d) => {
    const key = d.paymentDate || d.paymentDateLabel || "Unknown";
    if (!byDate.has(key)) {
      byDate.set(key, {
        paymentDate: key,
        dateLabel: d.paymentDateLabel || d.paymentDate || key,
        dayLabel: d.dayLabel,
        deals: [],
      });
    }
    byDate.get(key).deals.push(mapPaymentDealRow(d));
  });

  return Array.from(byDate.values())
    .map((g) => ({
      ...g,
      dealCount: g.deals.length,
      totalAmount: g.deals.reduce((s, d) => s + (Number(d.amount) || 0), 0),
    }))
    .sort((a, b) => {
      const parse = (s) => {
        const p = String(s || "").split("-");
        if (p.length === 3) return new Date(Number(p[2]), Number(p[1]) - 1, Number(p[0])).getTime();
        return 0;
      };
      return parse(a.paymentDate) - parse(b.paymentDate);
    });
};

const parseLenderUserId = (raw) => {
  const text = String(raw || "").trim().toUpperCase().replace(/^LR/, "").replace(/^BR/, "");
  const id = Number(text);
  return Number.isInteger(id) && id > 0 ? id : 0;
};

const membershipRow = (label, value) => (
  <div className="admin-ai-membership-row">
    <small>{label}</small>
    <strong>{value == null || value === "" ? "-" : String(value)}</strong>
  </div>
);

export const MembershipLookupPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userIdInput, setUserIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [details, setDetails] = useState(null);
  const cameFromPath = (() => {
    const incoming = location.state?.from;
    if (typeof incoming === "string" && incoming.startsWith("/") && !incoming.includes("membership-lookup")) {
      return incoming;
    }
    try {
      const stored = window.sessionStorage.getItem("oxy-ml-from") || "";
      if (stored.startsWith("/") && !stored.includes("membership-lookup")) {
        return stored;
      }
    } catch {
      return ADMIN_AI_DASHBOARD_PATH;
    }
    return ADMIN_AI_DASHBOARD_PATH;
  })();

  useEffect(() => {
    const incoming = location.state?.from;
    if (typeof incoming === "string" && incoming.startsWith("/") && !incoming.includes("membership-lookup")) {
      try {
        window.sessionStorage.setItem("oxy-ml-from", incoming);
      } catch {
        return undefined;
      }
    }
    return undefined;
  }, [location.state]);

  const lookupMembership = async (event) => {
    if (event) {
      event.preventDefault();
    }
    const userId = parseLenderUserId(userIdInput);
    if (!userId) {
      setError("Enter a valid user ID, for example 41389 or LR41389.");
      setDetails(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await getAdminAILenderMembershipDetails(userId);
      if (!data || data.found === false) {
        setDetails(null);
        setError(data?.message || `No lender found for ID ${userId}.`);
        return;
      }
      setDetails(data);
    } catch (err) {
      setDetails(null);
      setError(err?.response?.data?.message || err?.message || "Failed to load membership details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-ai-membership-lookup">
      <div className="sba-nav-actions">
        <button
          type="button"
          className="sba-back"
          onClick={() => navigate(cameFromPath)}
          title={`Back to ${cameFromPath === ADMIN_AI_DASHBOARD_PATH ? "Admin AI Dashboard" : "previous page"}`}
        >
          Back
        </button>
        <button type="button" className="sba-dash-btn" onClick={() => goToAdminAIDashboard(navigate)}>
          Admin AI Dashboard
        </button>
      </div>

      <section className="admin-ai-membership-card">
        <div className="admin-ai-membership-card-head">
          <span className="admin-ai-membership-icon" aria-hidden="true">ID</span>
          <div>
            <h4>Look up lender membership</h4>
            <p>Enter LR ID or user ID to see MONTHLY, QUARTERLY, or LIFETIME plan, validity, and fee status.</p>
          </div>
        </div>
        <form className="admin-ai-membership-form" onSubmit={lookupMembership}>
          <label>
            User ID
            <input
              value={userIdInput}
              placeholder="Example: LR41389 or 41389"
              onChange={(e) => setUserIdInput(e.target.value)}
            />
          </label>
          <button className="admin-ai-membership-submit" type="submit" disabled={loading}>
            {loading ? "Looking up..." : "Lookup membership"}
          </button>
        </form>
      </section>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {details ? (
        <div className="admin-ai-profile-box admin-ai-membership-result">
          <div className="admin-ai-panel-head">
            <div>
              <h5>
                {details.userCode || `LR${details.userId}`} {details.name || ""}
              </h5>
              <p>
                {details.membershipActive
                  ? "Membership is active. New mandatory deals should not ask a fee."
                  : details.message}
              </p>
            </div>
            <span className={`admin-ai-count-pill ${details.membershipActive ? "admin-ai-membership-active" : ""}`}>
              {details.membershipActive ? "ACTIVE" : "EXPIRED / NONE"}
            </span>
          </div>
          <div className="admin-ai-profile-table">
            {membershipRow("User ID", details.userCode || details.userId)}
            {membershipRow("Membership type", details.membershipType || "-")}
            {membershipRow("Plan label", details.membershipPlanLabel || "-")}
            {details.lastPaidMembershipType
              && details.lastPaidMembershipType !== details.membershipType
              ? membershipRow(
                "Last paid plan",
                `${details.lastPaidPlanLabel || details.lastPaidMembershipType} (not current validity)`
              )
              : null}
            {membershipRow("Validity date", details.validityDate || details.validityDateLabel || "-")}
            {membershipRow("Group", details.groupName || "-")}
            {membershipRow("Wallet", details.walletAmount != null
              ? `₹ ${Number(details.walletAmount).toLocaleString("en-IN")}`
              : "-")}
            {membershipRow("Mobile", details.mobileNumber || "-")}
            {membershipRow("Email", details.email || "-")}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export { SharedBankAccountsPanel } from "./SharedBankAccountsPanel";
