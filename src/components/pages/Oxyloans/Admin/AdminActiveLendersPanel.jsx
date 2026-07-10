import React, { useCallback, useEffect, useMemo, useState } from "react";
import { loadActiveLendersPage, isAuthError, isSessionExpiredMessage } from "../../../HttpRequest/aiAdminApi";
import { DataTable, LoadingBlock, money, number } from "./adminAIDashboardShared";
import {
  LENDER_PERIOD_PRESETS,
  resolveLenderPeriod,
  toIsoDate,
} from "./adminLenderPeriodUtils";

/**
 * Active lenders with period filter — GET /v1/ai/admin/active-lenders
 * (participation in oxy_lenders_accepted_deals by received_on).
 */
const AdminActiveLendersPanel = ({ compact = false, initialPreset = "ALL" }) => {
  const [preset, setPreset] = useState(initialPreset);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState(toIsoDate(new Date()));
  const [pageNo, setPageNo] = useState(1);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const period = useMemo(
    () => resolveLenderPeriod(preset, customStart, customEnd),
    [preset, customStart, customEnd]
  );

  const load = useCallback(
    async (pg = 1, append = false) => {
      if (preset === "CUSTOM" && (!period.startDate || !period.endDate)) {
        setError("Select both start and end dates for custom range.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await loadActiveLendersPage(pg, {
          startDate: period.startDate,
          endDate: period.endDate,
        });
        const data = res?.data || {};
        const list = data.activeLenders || [];
        setRows((prev) => (append ? [...prev, ...list] : list));
        setSummary({
          totalCount: data.totalCount ?? list.length,
          totalInvestment: data.totalInvestment,
          startDate: data.startDate,
          endDate: data.endDate,
          pageNo: data.pageNo || pg,
          pageSize: data.pageSize,
          fallbackNote: data.fallbackNote,
        });
        setPageNo(pg);
      } catch (err) {
        const status = err?.response?.status;
        let msg = err?.message || "Failed to load active lenders.";
        if (err?.code === "NO_TOKEN" || isAuthError(err) || isSessionExpiredMessage(msg)) {
          msg = "Session expired or not logged in. Open /admlogin and sign in again.";
        } else if (status === 404) {
          msg = "Active lenders API not deployed yet — showing legacy data when available. Restart backend if this persists.";
        }
        setError(msg);
        if (!append) setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [period.startDate, period.endDate, preset]
  );

  useEffect(() => {
    load(1, false);
  }, [load]);

  const totalCount = summary?.totalCount ?? rows.length;
  const hasMore = rows.length < totalCount;

  const columns = compact
    ? [
        ["lenderId", "ID", (v) => `LR${v}`],
        ["lenderName", "Name"],
        ["totalParticipationAmount", "Investment", money],
        ["currentWalletAmount", "Wallet", money],
      ]
    : [
        ["lenderId", "ID", (v) => `LR${v}`],
        ["lenderName", "Name"],
        ["mobileNumber", "Mobile"],
        ["email", "Email"],
        ["city", "City"],
        ["state", "State"],
        ["totalParticipationAmount", "Participation", money],
        ["currentWalletAmount", "Wallet now", money],
      ];

  return (
    <div className="ai-active-lenders-panel">
      <div className="ai-lender-period-bar">
        <div className="ai-lender-period-presets">
          {LENDER_PERIOD_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`ai-lender-period-btn ${preset === p.id ? "ai-lender-period-btn--active" : ""}`}
              onClick={() => {
                setPreset(p.id);
                setPageNo(1);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        {preset === "CUSTOM" && (
          <div className="ai-lender-period-custom">
            <label>
              From
              <input
                type="date"
                className="form-control form-control-sm"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
            </label>
            <label>
              To
              <input
                type="date"
                className="form-control form-control-sm"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              disabled={loading}
              onClick={() => load(1, false)}
            >
              Apply
            </button>
          </div>
        )}
      </div>

      <div className="ai-lender-period-summary">
        <span className="ai-lender-period-chip">
          <i className="fas fa-calendar-alt me-1" />
          {period.label}
        </span>
        <span>
          <strong>{loading ? "…" : number(totalCount)}</strong> active lenders
        </span>
        <span>
          Total participation: <strong>{loading ? "…" : money(summary?.totalInvestment)}</strong>
        </span>
        <span className="text-muted small">Based on deal participation dates (received_on)</span>
        {summary?.fallbackNote && (
          <span className="text-warning small">
            <i className="fas fa-exclamation-triangle me-1" />
            {summary.fallbackNote}
          </span>
        )}
      </div>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      {loading && rows.length === 0 ? (
        <LoadingBlock label="Loading active lenders…" />
      ) : (
        <>
          <DataTable
            rows={rows}
            initialLimit={compact ? 10 : 20}
            showMoreLabel="Show more lenders"
            columns={columns}
            emptyText="No lenders with participation in this period."
          />
          {hasMore && (
            <div className="text-center mt-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-success"
                disabled={loading}
                onClick={() => load(pageNo + 1, true)}
              >
                {loading
                  ? "Loading…"
                  : `Load more (${number(totalCount - rows.length)} left)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminActiveLendersPanel;
