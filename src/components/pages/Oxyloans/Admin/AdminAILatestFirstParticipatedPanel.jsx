import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaDownload,
  FaSearch,
  FaSync,
  FaTimes,
  FaUserCheck,
  FaUserFriends,
} from "react-icons/fa";
import { saveAs } from "file-saver";
import {
  downloadAdminAILatestFirstParticipationsExcel,
  getAdminAILatestFirstParticipations,
  parseAdminAIExportError,
} from "../../../HttpRequest/admin";

const fmtNum = (value) => Number(value || 0).toLocaleString("en-IN");
const fmtMoney = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);
const responseData = (payload) => payload?.data || payload || {};

const toISODate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const shiftISODate = (iso, days) => {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toISODate(date);
};

const formatDisplayDateTime = (value) => {
  const text = String(value || "").trim();
  if (!text) return "-";
  const date = new Date(text.includes("T") ? text : text.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return text;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminAILatestFirstParticipatedPanel = ({ onOpenLender, onClose }) => {
  const todayISO = useMemo(() => toISODate(new Date()), []);
  const yesterdayISO = useMemo(() => shiftISODate(todayISO, -1), [todayISO]);

  const [mode, setMode] = useState("latest"); // latest | today | yesterday | range
  const [fromDate, setFromDate] = useState(todayISO);
  const [toDate, setToDate] = useState(todayISO);
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const queryParams = useMemo(() => {
    if (mode === "latest") {
      return { limit: 12 };
    }
    if (mode === "today") {
      return { fromDate: todayISO, toDate: todayISO, limit: 500 };
    }
    if (mode === "yesterday") {
      return { fromDate: yesterdayISO, toDate: yesterdayISO, limit: 500 };
    }
    if (mode === "range" && appliedFrom && appliedTo) {
      return { fromDate: appliedFrom, toDate: appliedTo, limit: 2000 };
    }
    return { limit: 12 };
  }, [mode, todayISO, yesterdayISO, appliedFrom, appliedTo]);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = responseData(await getAdminAILatestFirstParticipations(queryParams));
      setRows(Array.isArray(data.rows) ? data.rows : []);
    } catch (requestError) {
      setRows([]);
      setError(
        requestError?.response?.data?.message
          || requestError?.response?.data?.errorMessage
          || requestError?.message
          || "Failed to load first-time participations."
      );
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    if (!collapsed) {
      loadRows();
    }
  }, [loadRows, collapsed]);

  const applyRangeSearch = () => {
    if (!fromDate || !toDate) {
      setError("Please select both From date and To date.");
      return;
    }
    let start = fromDate;
    let end = toDate;
    if (start > end) {
      const swap = start;
      start = end;
      end = swap;
      setFromDate(start);
      setToDate(end);
    }
    setAppliedFrom(start);
    setAppliedTo(end);
    setMode("range");
    setError("");
  };

  const clearAndClose = () => {
    setMode("latest");
    setAppliedFrom("");
    setAppliedTo("");
    setFromDate(todayISO);
    setToDate(todayISO);
    setError("");
    if (typeof onClose === "function") {
      onClose();
      return;
    }
    setCollapsed(true);
  };

  const reopenPanel = () => {
    setCollapsed(false);
    setMode("latest");
  };

  const downloadExcel = async () => {
    setExporting(true);
    setError("");
    try {
      const response = await downloadAdminAILatestFirstParticipationsExcel({
        ...queryParams,
        limit: mode === "latest" ? 12 : 2000,
      });
      const blob = response?.data;
      if (!blob) throw new Error("Empty export response.");
      if (blob.type && String(blob.type).includes("json")) {
        const text = await blob.text();
        let message = "Export failed.";
        try {
          message = JSON.parse(text)?.errorMessage || message;
        } catch {
          message = text || message;
        }
        throw new Error(message);
      }
      const scope = mode === "latest"
        ? "latest-12"
        : mode === "range"
          ? `${appliedFrom}_to_${appliedTo}`
          : mode === "today"
            ? todayISO
            : yesterdayISO;
      saveAs(blob, `latest-first-participations-${scope}-${todayISO}.xlsx`);
    } catch (requestError) {
      const parsed = await parseAdminAIExportError(requestError);
      setError(parsed || requestError?.message || "Failed to download Excel.");
    } finally {
      setExporting(false);
    }
  };

  const subtitle = mode === "latest"
    ? "Last 12 lenders whose first-ever deal participation is the newest"
    : mode === "range"
      ? `First-time participations from ${appliedFrom} to ${appliedTo}`
      : mode === "today"
        ? `First-time participations on ${todayISO}`
        : `First-time participations on ${yesterdayISO}`;

  if (collapsed) {
    return (
      <section className="admin-ai-pro-section admin-ai-pro-section--first-time admin-ai-latest-first-panel is-collapsed">
        <div className="admin-ai-pro-section-head">
          <div className="admin-ai-pro-section-icon admin-ai-pro-section-icon--filter">
            <FaUserCheck />
          </div>
          <div>
            <h2>Latest First-Time Participations</h2>
            <p>Panel closed. Reopen to view last 12 or date-range search.</p>
          </div>
          <div className="admin-ai-pro-section-head-actions">
            <button type="button" className="admin-ai-pro-section-export-btn" onClick={reopenPanel}>
              <FaUserCheck /> Open
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="admin-ai-pro-section admin-ai-pro-section--first-time admin-ai-latest-first-panel"
      aria-label="Latest first-time participations"
    >
      <div className="admin-ai-pro-section-head">
        <div className="admin-ai-pro-section-icon admin-ai-pro-section-icon--filter">
          <FaUserCheck />
        </div>
        <div>
          <h2>Latest First-Time Participations</h2>
          <p>{subtitle}</p>
        </div>
        <div className="admin-ai-pro-section-head-actions">
          <button
            type="button"
            className="admin-ai-pro-section-export-btn"
            disabled={loading}
            onClick={loadRows}
            title="Refresh list"
          >
            <FaSync /> Refresh
          </button>
          <button
            type="button"
            className="admin-ai-pro-section-export-btn"
            disabled={exporting || loading || !rows.length}
            onClick={downloadExcel}
            title="Download Excel"
          >
            <FaDownload /> {exporting ? "Exporting..." : "Excel"}
          </button>
          <button
            type="button"
            className="admin-ai-pro-section-export-btn admin-ai-latest-first-close-btn"
            onClick={clearAndClose}
            title="Close this panel"
          >
            <FaTimes /> Close
          </button>
        </div>
      </div>

      <div className="admin-ai-oxy-datebar admin-ai-latest-first-datebar" aria-label="Participation date selection">
        <button
          type="button"
          className={mode === "latest" ? "is-active" : ""}
          onClick={() => {
            setMode("latest");
            setAppliedFrom("");
            setAppliedTo("");
          }}
        >
          Last 12
        </button>
        <button
          type="button"
          className={mode === "today" ? "is-active" : ""}
          onClick={() => {
            setMode("today");
            setFromDate(todayISO);
            setToDate(todayISO);
            setAppliedFrom(todayISO);
            setAppliedTo(todayISO);
          }}
        >
          Today
        </button>
        <button
          type="button"
          className={mode === "yesterday" ? "is-active" : ""}
          onClick={() => {
            setMode("yesterday");
            setFromDate(yesterdayISO);
            setToDate(yesterdayISO);
            setAppliedFrom(yesterdayISO);
            setAppliedTo(yesterdayISO);
          }}
        >
          Yesterday
        </button>

        <div className={`admin-ai-latest-first-range${mode === "range" ? " is-active" : ""}`}>
          <label>
            <span>From</span>
            <input
              type="date"
              value={fromDate}
              max={todayISO}
              onChange={(event) => {
                setFromDate(event.target.value || todayISO);
              }}
            />
          </label>
          <label>
            <span>To</span>
            <input
              type="date"
              value={toDate}
              max={todayISO}
              onChange={(event) => {
                setToDate(event.target.value || todayISO);
              }}
            />
          </label>
          <button type="button" className="admin-ai-latest-first-search-btn" onClick={applyRangeSearch}>
            <FaSearch /> Search
          </button>
          <button
            type="button"
            className="admin-ai-latest-first-search-btn is-refresh"
            disabled={loading}
            onClick={loadRows}
            title="Refresh current selection"
          >
            <FaSync /> Refresh
          </button>
          <button
            type="button"
            className="admin-ai-latest-first-search-btn is-close"
            onClick={clearAndClose}
            title="Close panel"
          >
            <FaTimes /> Close
          </button>
        </div>

        <span className="admin-ai-latest-first-count">
          <FaUserFriends /> {fmtNum(rows.length)} members
        </span>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {loading ? <div className="admin-ai-empty-state">Loading first-time participations...</div> : null}

      {!loading ? (
        <div className="admin-ai-latest-first-table-wrap">
          <table className="admin-ai-advanced-table admin-ai-latest-first-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Lender</th>
                <th>Mobile</th>
                <th>Registered On</th>
                <th>First Participation</th>
                <th>First Amount</th>
                <th>Updation</th>
                <th>First Deal Total</th>
                <th>Referred By</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const lenderId = Number(row.lenderId) || 0;
                const firstAmount = Number(row.firstParticipationAmount) || 0;
                const firstUpdation = Number(row.firstUpdationAmount) || 0;
                const firstDealTotal = Number(row.firstDealTotalAmount) || (firstAmount + firstUpdation);
                const referredLabel = row.referredByName || row.referredByCode
                  ? `${row.referredByName || "-"}${row.referredByCode ? ` · ${row.referredByCode}` : ""}`
                  : "-";
                return (
                  <tr key={`${lenderId}-${row.firstParticipationOn}`}>
                    <td>{fmtNum(row.rank)}</td>
                    <td>
                      {onOpenLender && lenderId ? (
                        <button
                          type="button"
                          className="admin-ai-linkish-btn"
                          onClick={() => onOpenLender(row)}
                          title={`Open ${row.lenderCode || lenderId}`}
                        >
                          <strong>{valueOrDash(row.name)}</strong>
                          <small>{valueOrDash(row.lenderCode || `LR${lenderId}`)}</small>
                        </button>
                      ) : (
                        <>
                          <strong>{valueOrDash(row.name)}</strong>
                          <div><small>{valueOrDash(row.lenderCode || `LR${lenderId}`)}</small></div>
                        </>
                      )}
                    </td>
                    <td>{valueOrDash(row.mobileNumber)}</td>
                    <td>{formatDisplayDateTime(row.registeredOn)}</td>
                    <td>{formatDisplayDateTime(row.firstParticipationOn)}</td>
                    <td>{fmtMoney(firstAmount)}</td>
                    <td>{fmtMoney(firstUpdation)}</td>
                    <td><strong>{fmtMoney(firstDealTotal)}</strong></td>
                    <td>
                      <span className="admin-ai-latest-first-referred" title={referredLabel}>
                        {referredLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!rows.length ? (
                <tr>
                  <td colSpan={9}>
                    <div className="admin-ai-empty-state">
                      No first-time participations found for this selection.
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
};

export default AdminAILatestFirstParticipatedPanel;
