import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import {
  FaArrowDown,
  FaArrowUp,
  FaCalendarAlt,
  FaCalendarWeek,
  FaClock,
  FaEye,
  FaSync,
  FaTimes,
} from "react-icons/fa";
import {
  getAdminAIOXYInsightsDetails,
  getAdminAIOXYInsightsLoginHistory,
} from "../../../HttpRequest/admin";

const fmtNum = (value) => Number(value || 0).toLocaleString("en-IN");
const n = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};
const valueOrDash = (value) => (value == null || String(value).trim() === "" ? "-" : String(value));

const startOfLocalDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const toISODate = (date = new Date()) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const shiftISODate = (iso, days) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
};

const formatDayBadge = (iso) => {
  const today = toISODate();
  if (iso === today) return "TODAY";
  if (iso === shiftISODate(today, -1)) return "YESTERDAY";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }).toUpperCase();
};

const formatDayTitle = (iso) => {
  const today = toISODate();
  if (iso === today) return "Today";
  if (iso === shiftISODate(today, -1)) return "Yesterday";
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const clockAmPm = (hour) => {
  if (hour === 0) return "12 Midnight";
  if (hour === 12) return "12 Noon";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
};

const parseBucket = (raw) => {
  const text = String(raw || "").trim();
  if (!text || text === "-") {
    return { sortKey: "", displayLabel: "-", dayTag: "" };
  }

  const full = text.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2})(?::(\d{2}))?/);
  if (full) {
    const year = Number(full[1]);
    const month = Number(full[2]) - 1;
    const day = Number(full[3]);
    const hour = Number(full[4]);
    const bucketDate = new Date(year, month, day, hour, 0, 0, 0);
    const todayStart = startOfLocalDay();
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const bucketDay = startOfLocalDay(bucketDate);
    let dayTag = bucketDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (bucketDay.getTime() === todayStart.getTime()) dayTag = "Today";
    else if (bucketDay.getTime() === yesterdayStart.getTime()) dayTag = "Yesterday";
    return {
      sortKey: bucketDate.getTime(),
      displayLabel: `${dayTag} ${clockAmPm(hour)}`,
      dayTag,
      hour,
    };
  }

  const hourOnly = text.match(/^(\d{1,2})(?::(\d{2}))?$/);
  if (hourOnly) {
    const hour = Number(hourOnly[1]);
    return {
      sortKey: hour,
      displayLabel: clockAmPm(hour),
      dayTag: "",
      hour,
    };
  }

  const dateOnly = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    const date = new Date(`${dateOnly[1]}-${dateOnly[2]}-${dateOnly[3]}T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      return {
        sortKey: date.getTime(),
        displayLabel: date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        dayTag: "",
      };
    }
  }

  if (/^\d{4}$/.test(text)) {
    return { sortKey: Number(text), displayLabel: `Year ${text}`, dayTag: "" };
  }

  return { sortKey: text, displayLabel: text, dayTag: "" };
};

const formatClockLabel = (raw) => parseBucket(raw).displayLabel;

const friendlySeries = (rows = []) =>
  (Array.isArray(rows) ? rows : []).map((row) => {
    const parsed = parseBucket(row.label);
    return {
      ...row,
      displayLabel: parsed.displayLabel,
      dayTag: parsed.dayTag,
      sortKey: parsed.sortKey,
    };
  });

const VIEWS = [
  {
    id: "hourly",
    label: "Day",
    icon: FaClock,
    unit: "hour",
    rangePlain: "selected day",
    priorPlain: "the previous day",
    listTitle: "Logins hour by hour",
    listHint: "Click an hour to see who logged in on the selected day.",
    chartHint: "Login trend by hour for the selected day",
  },
  {
    id: "weekly",
    label: "Weekly",
    icon: FaCalendarWeek,
    unit: "week",
    rangePlain: "last 12 weeks",
    priorPlain: "the 12 weeks before that",
    listTitle: "How many logins in each week",
    listHint: "Click a week to see who logged in",
    chartHint: "Login count week by week",
  },
  {
    id: "yearly",
    label: "Yearly",
    icon: FaCalendarAlt,
    unit: "year",
    rangePlain: "all years on record",
    priorPlain: "the previous year",
    listTitle: "How many logins in each year",
    listHint: "Click a year to see who logged in",
    chartHint: "Login count year by year",
  },
];

const viewMeta = (viewId) => VIEWS.find((item) => item.id === viewId) || VIEWS[0];

const LoginTrendChart = ({ seriesRows = [], height = 300, mode = "login" }) => {
  const isRegister = mode === "register";
  const categories = seriesRows.map((row) => row.displayLabel || formatClockLabel(row.label));
  const logins = seriesRows.map((row) => n(row.logins));
  const uniqueUsers = seriesRows.map((row) => n(row.uniqueUsers));

  const options = useMemo(
    () => ({
      chart: {
        type: "area",
        toolbar: { show: false },
        zoom: { enabled: false },
        sparkline: { enabled: false },
      },
      colors: isRegister ? ["#059669", "#6EE7B7"] : ["#2563EB", "#93C5FD"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 2 },
      fill: {
        type: "gradient",
        gradient: { shadeIntensity: 1, opacityFrom: 0.32, opacityTo: 0.04, stops: [0, 90, 100] },
      },
      grid: {
        borderColor: "#EEF2F7",
        strokeDashArray: 3,
        padding: { left: 4, right: 4, top: 0, bottom: 0 },
      },
      xaxis: {
        categories,
        labels: {
          style: { colors: "#64748B", fontSize: "10px", fontWeight: 600 },
          rotate: categories.length > 8 ? -40 : 0,
          hideOverlappingLabels: true,
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: "#94A3B8", fontSize: "10px" },
          formatter: (value) => fmtNum(value),
        },
      },
      legend: {
        show: !isRegister,
        position: "top",
        horizontalAlign: "left",
        fontSize: "12px",
        itemMargin: { horizontal: 8, vertical: 0 },
      },
      tooltip: {
        y: { formatter: (value) => fmtNum(value) },
      },
    }),
    [categories, isRegister]
  );

  const series = useMemo(
    () =>
      isRegister
        ? [{ name: "New registrations", data: logins }]
        : [
            { name: "Times people logged in", data: logins },
            { name: "Different users", data: uniqueUsers },
          ],
    [isRegister, logins, uniqueUsers]
  );

  if (!categories.length) {
    return (
      <div className="admin-ai-oxy-empty">
        {isRegister ? "No registrations in this range yet." : "No login history in this range."}
      </div>
    );
  }

  return <ReactApexChart type="area" height={height} series={series} options={options} />;
};

const sortSeriesChronologically = (rows = []) =>
  [...(Array.isArray(rows) ? rows : [])].sort((a, b) => {
    const ak = a.sortKey != null ? a.sortKey : parseBucket(a.label).sortKey;
    const bk = b.sortKey != null ? b.sortKey : parseBucket(b.label).sortKey;
    if (typeof ak === "number" && typeof bk === "number") return ak - bk;
    return String(ak).localeCompare(String(bk));
  });

const BucketLoginList = ({ seriesRows = [], viewId = "hourly", mode = "login", onSelect }) => {
  const meta = viewMeta(viewId);
  const max = Math.max(1, ...seriesRows.map((row) => n(row.logins)));
  const ordered = sortSeriesChronologically(seriesRows);
  const actionWord = mode === "register" ? "registered" : "logged in";
  const emptyText = mode === "register" ? "No registrations in this range yet." : "No login hours/weeks found yet.";

  if (!ordered.length) {
    return <div className="admin-ai-oxy-empty">{emptyText}</div>;
  }

  return (
    <div className="admin-ai-oxy-bucket-list">
      {ordered.map((row) => {
        const logins = n(row.logins);
        const uniques = n(row.uniqueUsers);
        const width = Math.max(3, Math.round((logins / max) * 100));
        const when = row.displayLabel || formatClockLabel(row.label);
        const whenLine =
          viewId === "hourly" ? when : viewId === "weekly" ? `Week of ${when}` : when;
        const clickable = typeof onSelect === "function";
        const RowTag = clickable ? "button" : "div";
        return (
          <RowTag
            key={`${mode}-${String(row.label)}`}
            type={clickable ? "button" : undefined}
            className={`admin-ai-oxy-bucket-row${clickable ? " is-clickable" : ""}`}
            onClick={clickable ? () => onSelect(row) : undefined}
          >
            <div className="admin-ai-oxy-bucket-meta">
              <strong>{whenLine}</strong>
              <span>
                {fmtNum(logins)} people {actionWord} during this {meta.unit}
                {mode === "login" && uniques > 0 ? ` · ${fmtNum(uniques)} different users` : ""}
                {clickable ? " · open details" : ""}
              </span>
            </div>
            <div className="admin-ai-oxy-bucket-track" aria-hidden="true">
              <div className="admin-ai-oxy-bucket-fill" style={{ width: `${width}%` }} />
            </div>
            <em>{fmtNum(logins)}</em>
          </RowTag>
        );
      })}
    </div>
  );
};

const TrendEm = ({ pct, priorPlain }) => {
  const value = n(pct);
  if (!Number.isFinite(Number(pct))) return null;
  const up = value >= 0;
  const abs = Math.abs(value).toFixed(1);
  return (
    <em className={up ? "is-up" : "is-down"}>
      {up ? <FaArrowUp /> : <FaArrowDown />}{" · "}
      {up ? `${abs}% more` : `${abs}% fewer`} than {priorPlain || "the previous period"}
    </em>
  );
};

const ClickableCard = ({ className, onClick, children }) => (
  <button type="button" className={`${className} is-clickable`} onClick={onClick}>
    {children}
    <span className="admin-ai-oxy-view-btn" aria-hidden="true">
      <FaEye /> View
    </span>
  </button>
);

const DetailsDrawer = ({
  open,
  title,
  loading,
  error,
  rows,
  totalCount,
  pageNo,
  pageSize,
  mode,
  onClose,
  onPage,
}) => {
  if (!open) return null;
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / (pageSize || 50)));
  const isReg = mode === "registrations";

  return (
    <div className="admin-ai-oxy-drawer-backdrop" onClick={onClose} role="presentation">
      <aside
        className="admin-ai-oxy-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title || "Insight details"}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-ai-oxy-drawer-head">
          <div>
            <h3>{title || "Insight details"}</h3>
            <p>
              {fmtNum(totalCount)} {isReg ? "registrations" : "people"}
              {loading ? " · Loading…" : ""}
            </p>
          </div>
          <button type="button" className="admin-ai-oxy-drawer-close" onClick={onClose} title="Close">
            <FaTimes />
          </button>
        </div>

        {error ? <div className="admin-ai-oxy-error">{error}</div> : null}

        <div className="admin-ai-oxy-drawer-table-wrap">
          {loading && !rows.length ? (
            <div className="admin-ai-oxy-empty">Loading people…</div>
          ) : !rows.length ? (
            <div className="admin-ai-oxy-empty">No people found for this insight.</div>
          ) : (
            <table className="admin-ai-oxy-drawer-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  {isReg ? <th>Registered</th> : <th>Logins</th>}
                  {isReg ? null : <th>Last login</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${row.userId}-${index}`}>
                    <td>{(pageNo - 1) * pageSize + index + 1}</td>
                    <td>
                      <strong>{valueOrDash(row.userCode)}</strong>
                      <div className="admin-ai-oxy-muted">ID {fmtNum(row.userId)}</div>
                    </td>
                    <td>{valueOrDash(row.name)}</td>
                    <td>{valueOrDash(row.primaryType)}</td>
                    <td>{valueOrDash(row.mobileNumber)}</td>
                    <td>{valueOrDash(row.email)}</td>
                    {isReg ? (
                      <td>{valueOrDash(String(row.registeredOn || "").slice(0, 19))}</td>
                    ) : (
                      <td>
                        <strong>{fmtNum(row.loginCount)}</strong>
                      </td>
                    )}
                    {isReg ? null : <td>{valueOrDash(String(row.lastLoginAt || "").slice(0, 19))}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-ai-oxy-drawer-foot">
          <button type="button" className="admin-ai-reset-btn" disabled={pageNo <= 1 || loading} onClick={() => onPage(pageNo - 1)}>
            Previous
          </button>
          <span>
            Page {pageNo} / {totalPages}
          </span>
          <button
            type="button"
            className="admin-ai-search-btn"
            disabled={pageNo >= totalPages || loading}
            onClick={() => onPage(pageNo + 1)}
          >
            Next
          </button>
        </div>
      </aside>
    </div>
  );
};

const AdminAIOXYInsightsPanel = () => {
  const [view, setView] = useState("hourly");
  const [selectedDate, setSelectedDate] = useState(() => toISODate());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailTitle, setDetailTitle] = useState("");
  const [detailMetric, setDetailMetric] = useState("uniqueUsers");
  const [detailBucket, setDetailBucket] = useState("");
  const [detailPage, setDetailPage] = useState(1);
  const [detailRows, setDetailRows] = useState([]);
  const [detailTotal, setDetailTotal] = useState(0);
  const [detailMode, setDetailMode] = useState("logins");
  const detailPageSize = 50;

  const load = async (nextView = view, nextDate = selectedDate) => {
    setLoading(true);
    setError("");
    try {
      const payload = await getAdminAIOXYInsightsLoginHistory(
        nextView,
        nextView === "hourly" ? nextDate : undefined
      );
      setData(payload || null);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load OXYINSIGHTS");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = useCallback(
    async ({ metric, bucketLabel = "", pageNo = 1, titleHint = "" } = {}) => {
      setDetailOpen(true);
      setDetailLoading(true);
      setDetailError("");
      setDetailMetric(metric);
      setDetailBucket(bucketLabel || "");
      setDetailPage(pageNo);
      if (titleHint) setDetailTitle(titleHint);
      try {
        const payload = await getAdminAIOXYInsightsDetails({
          view,
          date: view === "hourly" ? selectedDate : undefined,
          metric,
          bucketLabel,
          pageNo,
          pageSize: detailPageSize,
        });
        setDetailTitle(payload?.title || titleHint || "Insight details");
        setDetailRows(Array.isArray(payload?.rows) ? payload.rows : []);
        setDetailTotal(n(payload?.totalCount));
        setDetailMode(payload?.mode === "registrations" ? "registrations" : "logins");
        if (payload?.error) setDetailError(String(payload.error));
      } catch (err) {
        setDetailError(err?.response?.data?.message || err?.message || "Failed to load insight details");
        setDetailRows([]);
        setDetailTotal(0);
      } finally {
        setDetailLoading(false);
      }
    },
    [view, selectedDate]
  );

  const openDetail = (metric, titleHint = "", bucketLabel = "") => {
    loadDetails({ metric, bucketLabel, pageNo: 1, titleHint });
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const payload = await getAdminAIOXYInsightsLoginHistory(
          view,
          view === "hourly" ? selectedDate : undefined
        );
        if (!cancelled) setData(payload || null);
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || err?.message || "Failed to load OXYINSIGHTS");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [view, selectedDate]);

  const meta = viewMeta(view);
  const kpis = data?.kpis || {};
  const registrations = data?.registrations || {};
  const series = sortSeriesChronologically(friendlySeries(Array.isArray(data?.series) ? data.series : []));
  const regSeries = sortSeriesChronologically(
    friendlySeries(Array.isArray(registrations.series) ? registrations.series : [])
  );
  const bucketCount = series.length || 1;
  const avgPerBucket = n(kpis.totalLogins) / bucketCount;
  const peakWhen = formatClockLabel(kpis.peakLabel);
  const todayDateLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const isDayView = view === "hourly";
  const todayISO = toISODate();
  const yesterdayISO = shiftISODate(todayISO, -1);
  const dayLabel = data?.dayLabel || formatDayTitle(selectedDate);
  const dayBadge = formatDayBadge(selectedDate);
  const isTodaySelected = isDayView && selectedDate === todayISO;
  const isYesterdaySelected = isDayView && selectedDate === yesterdayISO;
  const priorPlain = isDayView
    ? isTodaySelected
      ? "all of yesterday"
      : `the day before ${dayLabel}`
    : meta.priorPlain;
  const rangeChip = isDayView
    ? isTodaySelected
      ? "Today - since 12 Midnight"
      : `${dayLabel} - full day`
    : view === "weekly"
      ? "Last 12 weeks"
      : "All years";

  return (
    <section className="admin-ai-oxyinsights" aria-label="OXYINSIGHTS">
      <div className="admin-ai-oxy-head">
        <div className="admin-ai-oxy-title-block">
          <div className="admin-ai-oxy-title-row">
            <h2>OXYINSIGHTS</h2>
            <span className="admin-ai-oxy-today-badge">{isDayView ? dayBadge : view.toUpperCase()}</span>
          </div>
          <p className="admin-ai-oxy-today-date">{isDayView ? formatDayTitle(selectedDate) : todayDateLabel}</p>
          <p>
            {isDayView
              ? `${dayLabel} insights - click any card to open the full people list behind that number.`
              : "Click any card or hour/week/year row to open the people list for that insight."}
          </p>
        </div>
        <div className="admin-ai-oxy-head-actions">
          <div className="admin-ai-oxy-datebar" aria-label="Date selection">
            <button
              type="button"
              className={isTodaySelected ? "is-active" : ""}
              onClick={() => {
                setView("hourly");
                setSelectedDate(todayISO);
              }}
            >
              Today
            </button>
            <button
              type="button"
              className={isYesterdaySelected ? "is-active" : ""}
              onClick={() => {
                setView("hourly");
                setSelectedDate(yesterdayISO);
              }}
            >
              Yesterday
            </button>
            <label className={`admin-ai-oxy-date-pick${isDayView && !isTodaySelected && !isYesterdaySelected ? " is-active" : ""}`}>
              <FaCalendarAlt aria-hidden="true" />
              <input
                type="date"
                max={todayISO}
                value={selectedDate}
                onChange={(e) => {
                  const next = e.target.value || todayISO;
                  setView("hourly");
                  setSelectedDate(next);
                }}
                aria-label="Pick a date"
              />
            </label>
          </div>
          <div className="admin-ai-oxy-view-tabs" role="tablist">
            {VIEWS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={view === item.id}
                  className={view === item.id ? "is-active" : ""}
                  onClick={() => setView(item.id)}
                >
                  <Icon /> {item.label}
                </button>
              );
            })}
          </div>
          <span className="admin-ai-oxy-range">{rangeChip}</span>
          <button
            type="button"
            className="admin-ai-oxy-refresh"
            disabled={loading}
            onClick={() => load(view, selectedDate)}
            title="Refresh insights"
          >
            <FaSync /> {loading ? "..." : "Refresh"}
          </button>
        </div>
      </div>

      {isDayView ? (
        <div className="admin-ai-oxy-today-banner">
          <strong>{dayLabel} insights ready</strong>
          <span>
            Total logins: <b>{fmtNum(kpis.totalLogins)}</b>
            {" · "}
            Unique people: <b>{fmtNum(kpis.uniqueUsers)}</b>
            {" · "}
            Click cards below for full lists
          </span>
        </div>
      ) : null}

      {error ? <div className="admin-ai-oxy-error">{error}</div> : null}

      <div className="admin-ai-oxy-kpi-row admin-ai-oxy-kpi-row--four">
        <ClickableCard className="admin-ai-oxy-kpi-card is-blue" onClick={() => openDetail("logins", "People behind total logins")}>
          <span>{isDayView ? (isTodaySelected ? "Total logins today" : `Total logins · ${dayLabel}`) : `All logins in the ${meta.rangePlain}`}</span>
          <strong>{fmtNum(kpis.totalLogins)}</strong>
          <TrendEm pct={kpis.changePct} priorPlain={priorPlain} />
          {!Number.isFinite(Number(kpis.changePct)) ? (
            <em className="is-neutral">
              {isDayView ? (isTodaySelected ? "From 12 Midnight today until now" : `Full day · compared with ${priorPlain}`) : "Total times anyone logged in during this period"}
            </em>
          ) : null}
        </ClickableCard>
        <ClickableCard className="admin-ai-oxy-kpi-card is-teal" onClick={() => openDetail("uniqueUsers", "Different people who logged in")}>
          <span>{isDayView ? (isTodaySelected ? "Different people logged in today" : `People who logged in · ${dayLabel}`) : "Different people who logged in"}</span>
          <strong>{fmtNum(kpis.uniqueUsers)}</strong>
          <em className="is-neutral">Unique users only (same person logging many times still counts as 1)</em>
        </ClickableCard>
        <ClickableCard className="admin-ai-oxy-kpi-card is-sky" onClick={() => openDetail("logins", "People behind login average")}>
          <span>{isDayView ? `Average logins per hour · ${dayLabel}` : `About how many logins per ${meta.unit}`}</span>
          <strong>{fmtNum(Math.round(avgPerBucket))}</strong>
          <em className="is-neutral">
            Average: {fmtNum(kpis.totalLogins)} logins across {fmtNum(series.length || 0)} {meta.unit}s so far
          </em>
        </ClickableCard>
        <ClickableCard
          className="admin-ai-oxy-kpi-card is-amber"
          onClick={() => openDetail("peak", `Busiest ${meta.unit}: ${peakWhen}`, kpis.peakLabel)}
        >
          <span>{isDayView ? `Busiest hour · ${dayLabel}` : `Busiest ${meta.unit} (most logins)`}</span>
          <strong>{peakWhen}</strong>
          <em className="is-neutral">{fmtNum(kpis.peakLogins)} logins in that {meta.unit}</em>
        </ClickableCard>
      </div>

      <div className="admin-ai-oxy-section-label">Who opened the site (unique people · login times) — click a card</div>
      <div className="admin-ai-oxy-role-summary">
        <ClickableCard className="is-lender-box" onClick={() => openDetail("lenders", "Lenders who logged in")}>
          <small>Lenders</small>
          <strong>{fmtNum(kpis.uniqueLenders)}</strong>
          <span>{fmtNum(kpis.lenderLogins)} login times</span>
        </ClickableCard>
        <ClickableCard className="is-borrower-box" onClick={() => openDetail("borrowers", "Borrowers who logged in")}>
          <small>Borrowers</small>
          <strong>{fmtNum(kpis.uniqueBorrowers)}</strong>
          <span>{fmtNum(kpis.borrowerLogins)} login times</span>
        </ClickableCard>
        <ClickableCard className="is-admin-box" onClick={() => openDetail("admins", "Admins who logged in")}>
          <small>Admins</small>
          <strong>{fmtNum(kpis.uniqueAdmins)}</strong>
          <span>{fmtNum(kpis.adminLogins)} login times · staff / admin accounts</span>
        </ClickableCard>
        <ClickableCard className="is-other-box" onClick={() => openDetail("others", "Other (not Admin) who logged in")}>
          <small>Other (not Admin)</small>
          <strong>{fmtNum(kpis.uniqueOthers)}</strong>
          <span>{fmtNum(kpis.otherLogins)} login times · unknown / blank user type</span>
        </ClickableCard>
      </div>

      <div className="admin-ai-oxy-reg-block">
        <div className="admin-ai-oxy-section-label">
          {isDayView ? `Registration history · ${dayLabel} — click a card` : "Registration history — click a card"}
        </div>
        <p className="admin-ai-oxy-reg-hint">
          {isDayView
            ? "New sign-ups from 12 Midnight today until now (lenders, borrowers, and others)."
            : registrations.rangeLabel || "New sign-ups for the selected range."}
        </p>
        <div className="admin-ai-oxy-role-summary admin-ai-oxy-reg-summary">
          <ClickableCard className="is-reg-total" onClick={() => openDetail("registrations", "All registrations")}>
            <small>{isDayView ? (isTodaySelected ? "Registered today" : `Registered · ${dayLabel}`) : "Registered in range"}</small>
            <strong>{fmtNum(registrations.total)}</strong>
            {isDayView ? (
              <TrendEm pct={registrations.changePct} priorPlain={priorPlain} />
            ) : (
              <span>{registrations.rangeLabel || meta.rangePlain}</span>
            )}
          </ClickableCard>
          <ClickableCard className="is-lender-box" onClick={() => openDetail("regLenders", "New lenders")}>
            <small>New lenders</small>
            <strong>{fmtNum(registrations.lenders)}</strong>
            <span>Lender sign-ups</span>
          </ClickableCard>
          <ClickableCard className="is-borrower-box" onClick={() => openDetail("regBorrowers", "New borrowers")}>
            <small>New borrowers</small>
            <strong>{fmtNum(registrations.borrowers)}</strong>
            <span>Borrower sign-ups</span>
          </ClickableCard>
          <ClickableCard className="is-admin-box" onClick={() => openDetail("regOtherAdmin", "Other / Admin registrations")}>
            <small>Other / Admin</small>
            <strong>{fmtNum(n(registrations.admins) + n(registrations.others))}</strong>
            <span>
              Admins {fmtNum(registrations.admins)} · Other {fmtNum(registrations.others)}
            </span>
          </ClickableCard>
        </div>
      </div>

      <div className="admin-ai-oxy-grid">
        <section className="admin-ai-oxy-panel is-chart">
          <div className="admin-ai-oxy-panel-head">
            <h3>{isDayView ? `${dayLabel} login trend` : "Login trend over time"}</h3>
            <span>{data?.seriesHint || meta.chartHint}</span>
          </div>
          {loading && !series.length ? (
            <div className="admin-ai-oxy-empty">Loading login history…</div>
          ) : (
            <LoginTrendChart seriesRows={series} height={280} />
          )}
        </section>

        <aside className="admin-ai-oxy-panel admin-ai-oxy-panel--list is-list">
          <div className="admin-ai-oxy-panel-head">
            <h3>{meta.listTitle}</h3>
            <span>{meta.listHint}</span>
          </div>
          {loading && !series.length ? (
            <div className="admin-ai-oxy-empty">Loading…</div>
          ) : (
            <BucketLoginList
              seriesRows={series}
              viewId={view}
              mode="login"
              onSelect={(row) =>
                openDetail("loginBucket", `Logins · ${row.displayLabel || formatClockLabel(row.label)}`, row.label)
              }
            />
          )}
        </aside>
      </div>

      <div className="admin-ai-oxy-grid admin-ai-oxy-grid--reg">
        <section className="admin-ai-oxy-panel is-reg-chart">
          <div className="admin-ai-oxy-panel-head">
            <h3>{isDayView ? `${dayLabel} registration trend` : "Registration trend"}</h3>
            <span>{registrations.seriesHint || "New users signing up over time"}</span>
          </div>
          {loading && !regSeries.length ? (
            <div className="admin-ai-oxy-empty">Loading registrations…</div>
          ) : (
            <LoginTrendChart seriesRows={regSeries} height={240} mode="register" />
          )}
        </section>
        <aside className="admin-ai-oxy-panel admin-ai-oxy-panel--list is-reg-list">
          <div className="admin-ai-oxy-panel-head">
            <h3>
              {isDayView
                ? "Registrations hour by hour"
                : view === "weekly"
                  ? "Registrations per week"
                  : "Registrations per year"}
            </h3>
            <span>
              Peak: {formatClockLabel(registrations.peakLabel)} · {fmtNum(registrations.peakCount)} · click a row
            </span>
          </div>
          {loading && !regSeries.length ? (
            <div className="admin-ai-oxy-empty">Loading…</div>
          ) : (
            <BucketLoginList
              seriesRows={regSeries}
              viewId={view}
              mode="register"
              onSelect={(row) =>
                openDetail(
                  "regBucket",
                  `Registrations · ${row.displayLabel || formatClockLabel(row.label)}`,
                  row.label
                )
              }
            />
          )}
        </aside>
      </div>

      <DetailsDrawer
        open={detailOpen}
        title={detailTitle}
        loading={detailLoading}
        error={detailError}
        rows={detailRows}
        totalCount={detailTotal}
        pageNo={detailPage}
        pageSize={detailPageSize}
        mode={detailMode}
        onClose={() => setDetailOpen(false)}
        onPage={(nextPage) =>
          loadDetails({
            metric: detailMetric,
            bucketLabel: detailBucket,
            pageNo: nextPage,
            titleHint: detailTitle,
          })
        }
      />
    </section>
  );
};

export default AdminAIOXYInsightsPanel;