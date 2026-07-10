import React, { useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Link } from "react-router-dom";
import { money, number } from "./adminAIDashboardShared";

export const FY_MONTH_LABELS = [
  "April", "May", "June", "July", "August", "September",
  "October", "November", "December", "January", "February", "March",
];

export const fyLabel = (fy) => (fy ? `Financial Year ${fy}–${String(fy + 1).slice(2)}` : "Financial Year");

/** Colored KPI card — green / orange / blue / red themes */
export const KpiCard = ({ label, value, sub, tone = "blue", icon, onClick, className = "" }) => {
  const inner = (
    <div className={`ai-kpi-card ai-kpi-card--${tone} ${onClick ? "ai-kpi-card--clickable" : ""} ${className}`}>
      {icon && (
        <div className="ai-kpi-card-icon">
          <i className={icon} />
        </div>
      )}
      <div className="ai-kpi-card-body">
        <span className="ai-kpi-card-val">{value ?? "—"}</span>
        <span className="ai-kpi-card-lbl">{label}</span>
        {sub && <span className="ai-kpi-card-sub">{sub}</span>}
      </div>
      {onClick && <i className="fas fa-arrow-right ai-kpi-card-arrow" />}
    </div>
  );
  if (onClick) {
    return (
      <button type="button" className="ai-kpi-card-btn" onClick={onClick}>
        {inner}
      </button>
    );
  }
  return inner;
};

export const KpiGrid = ({ children, className = "" }) => (
  <div className={`ai-kpi-grid ${className}`}>{children}</div>
);

export const ExportBar = ({ onExportCsv, onPrint, disabled }) => (
  <div className="ai-export-bar">
    <button type="button" className="btn btn-sm btn-outline-success" onClick={onExportCsv} disabled={disabled}>
      <i className="fas fa-file-excel me-1" />
      Export Excel (CSV)
    </button>
    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onPrint} disabled={disabled}>
      <i className="fas fa-file-pdf me-1" />
      Print / PDF
    </button>
  </div>
);

export const exportRowsToCsv = (rows, columns, filename = "report.csv") => {
  if (!rows?.length) return;
  const escape = (v) => {
    const s = v == null ? "" : String(v).replace(/"/g, '""');
    return `"${s}"`;
  };
  const header = columns.map(([, label]) => escape(label)).join(",");
  const lines = rows.map((row) =>
    columns.map(([key, , format]) => {
      const raw = format ? format(row[key], row) : row[key];
      if (React.isValidElement(raw)) return escape(row[key]);
      return escape(raw);
    }).join(",")
  );
  const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const printReport = () => window.print();

export const ReportSection = ({ title, icon, actions, children }) => (
  <section className="ai-report-section">
    {(title || actions) && (
      <header className="ai-report-section-head">
        {title && (
          <h6 className="mb-0">
            {icon && <i className={`${icon} me-2`} />}
            {title}
          </h6>
        )}
        {actions}
      </header>
    )}
    {children}
  </section>
);

export const SearchableDataTable = ({
  rows = [],
  columns,
  emptyText = "No records found",
  initialLimit = 15,
  searchPlaceholder = "Search…",
  searchKeys,
}) => {
  const [q, setQ] = useState("");
  const keys = searchKeys || columns.map(([k]) => k).filter(Boolean);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      keys.some((k) => String(row[k] ?? "").toLowerCase().includes(term))
    );
  }, [rows, q, keys]);

  return (
    <div className="ai-search-table">
      <div className="ai-search-table-toolbar">
        <input
          type="search"
          className="form-control form-control-sm ai-search-input"
          placeholder={searchPlaceholder}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <span className="text-muted small">{filtered.length} rows</span>
      </div>
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center text-muted py-4">
                  {emptyText}
                </td>
              </tr>
            ) : (
              filtered.slice(0, Math.max(initialLimit, filtered.length)).map((row, i) => (
                <tr key={row.id || row.lenderId || row.dealId || row.borrowerRef || i}>
                  {columns.map(([key, label, format]) => (
                    <td key={label}>{format ? format(row[key], row) : row[key] ?? "—"}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const parseDdMmYyyy = (s) => {
  if (!s) return null;
  const parts = String(s).split("-");
  if (parts.length === 3 && parts[0].length === 2) {
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  return null;
};

export const sumOverdueFromUnpaid = (unpaid = []) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return unpaid.reduce((sum, r) => {
    const d = parseDdMmYyyy(r.paymentDate);
    if (d && d < today) return sum + (Number(r.amount) || 0);
    return sum;
  }, 0);
};

/** FY monthly bar + line chart (Apr–Mar) */
export const FyMonthlyPayoutChart = ({ monthlyTrend = [], fy, chartType = "bar" }) => {
  const mapped = useMemo(() => {
    const byKey = {};
    (monthlyTrend || []).forEach((m) => {
      const label = (m.monthLabel || "").toLowerCase();
      FY_MONTH_LABELS.forEach((full, idx) => {
        if (label.includes(full.slice(0, 3).toLowerCase())) {
          byKey[idx] = m;
        }
      });
    });
    return FY_MONTH_LABELS.map((_, idx) => byKey[idx] || {});
  }, [monthlyTrend]);

  const categories = FY_MONTH_LABELS.map((m) => m.slice(0, 3));
  const interest = mapped.map((m) => Number(m.interestPaid || m.totalPaid) || 0);
  const principal = mapped.map((m) => Number(m.principalReturned) || 0);
  const total = mapped.map((m) => Number(m.totalPaid) || interest[mapped.indexOf(m)] || 0);

  const series =
    chartType === "line"
      ? [{ name: "Total payout", data: total }]
      : chartType === "area"
        ? [{ name: "Total payout", data: total }]
        : [
            { name: "Interest", data: interest },
            { name: "Principal", data: principal },
          ];

  const options = {
    chart: {
      type: chartType === "area" ? "area" : chartType === "line" ? "line" : "bar",
      toolbar: { show: true, tools: { download: true } },
      fontFamily: "Inter, system-ui, sans-serif",
    },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "55%" } },
    colors: chartType === "bar" ? ["#2563eb", "#059669"] : ["#0891b2"],
    xaxis: { categories, title: { text: fyLabel(fy) } },
    yaxis: {
      labels: {
        formatter: (v) => (v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${Math.round(v)}`),
      },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: chartType === "bar" ? 0 : 2 },
    fill: chartType === "area" ? { type: "gradient", gradient: { opacityFrom: 0.45, opacityTo: 0.05 } } : {},
    legend: { position: "top" },
    tooltip: {
      y: { formatter: (v) => money(v) },
    },
  };

  if (!monthlyTrend?.length) {
    return <p className="text-muted small mb-0">No monthly payout data for this financial year.</p>;
  }

  return (
    <div className="ai-fy-month-chart">
      <ReactApexChart options={options} series={series} type={options.chart.type} height={320} />
    </div>
  );
};

export const ReportPageHeader = ({ title, description, backTo = "/adminAIDashboard" }) => (
  <div className="ai-report-page-header">
    <Link to={backTo} className="btn btn-outline-secondary btn-sm ai-back-btn">
      <i className="fas fa-arrow-left me-1" />
      Dashboard
    </Link>
    <div>
      <h4 className="mb-1">{title}</h4>
      {description && <p className="text-muted small mb-0">{description}</p>}
    </div>
  </div>
);

export const PriorityTier = ({ tier, title, items, onOpen }) => {
  const toneMap = {
    critical: "critical",
    high: "high",
    medium: "medium",
    info: "info",
  };
  if (!items?.length) return null;
  return (
    <div className={`ai-alert-tier ai-alert-tier--${toneMap[tier] || "info"}`}>
      <h6 className="ai-alert-tier-title">{title}</h6>
      <ul className="ai-alert-tier-list">
        {items.map((item) => (
          <li key={item.title} className="ai-alert-tier-item">
            <i className={`${item.icon} me-2`} />
            <div>
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
            </div>
            {item.module && onOpen && (
              <button type="button" className="btn btn-sm btn-light" onClick={() => onOpen(item.module)}>
                View
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
