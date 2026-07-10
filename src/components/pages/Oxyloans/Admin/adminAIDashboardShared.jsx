import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OxyloansAdminHeader from "../../../Header/OxyloansAdminHeader";
import OxyloansAdminSidebar from "../../../SideBar/OxyloansAdminSidebar";
import Footer from "../../../Footer/Footer";
import "./AdminAIDashboard.css";

export const money = (n) =>
  n == null ? "—" : "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

export const number = (n) =>
  n == null ? "—" : Number(n).toLocaleString("en-IN");

export const currentFy = () => {
  const now = new Date();
  return now.getMonth() + 1 >= 4 ? now.getFullYear() : now.getFullYear() - 1;
};

export const fyOptions = () => {
  const start = currentFy();
  return Array.from({ length: 6 }, (_, i) => start - i);
};

export const PageShell = ({ title, breadcrumb, actions, children, compact = false, withAiNav = false }) => (
  <div className={`main-wrapper ai-dash ${compact ? "ai-dash-page" : ""}`}>
    <OxyloansAdminHeader />
    <OxyloansAdminSidebar />
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header mb-3">
          <div className="row align-items-center">
            <div className="col">
              {title ? <h3 className="page-title">{title}</h3> : null}
              {breadcrumb && (
                <ul className="breadcrumb mb-0">
                  <li className="breadcrumb-item">Admin</li>
                  {breadcrumb}
                </ul>
              )}
            </div>
            {actions && <div className="col-auto d-flex align-items-center gap-2">{actions}</div>}
          </div>
        </div>
        <div className={withAiNav ? "ai-dash-layout" : "ai-dash-main"}>{children}</div>
      </div>
      <Footer />
    </div>
  </div>
);

export const BackToHub = () => (
  <Link to="/adminAIDashboard" className="btn btn-outline-secondary btn-sm ai-back-btn">
    <i className="fas fa-arrow-left me-1" />
    All features
  </Link>
);

export const StatTile = ({ label, value, color }) => (
  <div className="ai-stat-tile ai-stat-tile--square" style={{ "--tile-color": color }}>
    <div className="label">{label}</div>
    <div className="value">{value}</div>
  </div>
);

export const DataTable = ({
  rows,
  columns,
  emptyText = "No records found",
  initialLimit = 10,
  showMoreLabel = "Show more rows",
}) => {
  const [visibleCount, setVisibleCount] = useState(initialLimit);
  const visible = rows.slice(0, visibleCount);
  const hasMore = rows.length > visibleCount;

  useEffect(() => {
    setVisibleCount(initialLimit);
  }, [rows, initialLimit]);

  return (
    <div className="ai-table-panel">
      <div className="ai-table-wrap">
        <table className="ai-table ai-table--modern">
          <thead>
            <tr>
              {columns.map(([, label]) => (
                <th key={label}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center text-muted py-4">
                  {emptyText}
                </td>
              </tr>
            ) : (
              visible.map((row, i) => (
                <tr key={row.borrowerPaymentId || row.lenderId || row.dealId || row.userId || i}>
                  {columns.map(([key, label, format]) => (
                    <td key={label}>{format ? format(row[key], row) : row[key] ?? "—"}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <div className="ai-table-footer">
          <button
            type="button"
            className="btn btn-sm btn-outline-success ai-show-more-btn"
            onClick={() => setVisibleCount((n) => n + initialLimit)}
          >
            <i className="fas fa-plus-circle me-1" />
            {showMoreLabel} ({rows.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export const TrendChart = ({ rows }) => {
  if (!rows?.length) return null;
  const max = Math.max(...rows.map((r) => Number(r.totalPaid) || Number(r.interestPaid) || 0), 1);
  return (
    <div className="ai-trend-bar mb-3">
      {rows.map((r, i) => {
        const val = Number(r.totalPaid) || Number(r.interestPaid) || 0;
        const pct = Math.max(4, (val / max) * 100);
        return (
          <div key={i} className="ai-trend-bar-item" title={money(val)}>
            <div className="ai-trend-bar-fill" style={{ height: `${pct}%` }} />
            <span className="ai-trend-bar-label">{r.monthLabel}</span>
          </div>
        );
      })}
    </div>
  );
};

/** Horizontal bar chart for money / count comparisons */
export const HBarChart = ({ items = [] }) => {
  if (!items.length) return null;
  const max = Math.max(...items.map((i) => Number(i.value) || 0), 1);
  return (
    <div className="ai-hbar-chart">
      {items.map(({ label, value, color }) => {
        const n = Number(value) || 0;
        const pct = Math.max(6, (n / max) * 100);
        return (
          <div key={label} className="ai-hbar-row">
            <span className="ai-hbar-label">{label}</span>
            <div className="ai-hbar-track">
              <div
                className="ai-hbar-fill"
                style={{ width: `${pct}%`, background: color || "#2563eb" }}
                title={money(n)}
              />
            </div>
            <span className="ai-hbar-val">{money(n)}</span>
          </div>
        );
      })}
    </div>
  );
};

export const FyControls = ({ fy, onFyChange, onRefresh, loading }) => (
  <>
    <select
      className="form-select form-select-sm"
      value={fy}
      onChange={(e) => onFyChange(Number(e.target.value))}
      disabled={loading}
      style={{ width: 140 }}
    >
      {fyOptions().map((year) => (
        <option key={year} value={year}>
          FY {year}–{String(year + 1).slice(2)}
        </option>
      ))}
    </select>
    <button type="button" className="btn btn-success btn-sm" onClick={onRefresh} disabled={loading}>
      <i className={`fas fa-sync-alt me-1 ${loading ? "fa-spin" : ""}`} />
      {loading ? "Loading…" : "Refresh"}
    </button>
  </>
);

export const LoadingBlock = ({ label = "Loading data…" }) => (
  <div className="text-center py-5">
    <div className="spinner-border text-success" role="status" />
    <p className="mt-2 text-muted mb-0">{label}</p>
  </div>
);

export const useFeatureLoader = (loadFn, deps = []) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await loadFn();
        if (!cancelled) setPayload(data);
      } catch (err) {
        if (!cancelled) {
          const detail = err?.response?.data?.error || err?.message || "Failed to load data.";
          setError(detail);
          setPayload(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, deps);

  const reload = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await loadFn();
      setPayload(data);
    } catch (err) {
      const detail = err?.response?.data?.error || err?.message || "Failed to load data.";
      setError(detail);
      setPayload(null);
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, payload, reload };
};
