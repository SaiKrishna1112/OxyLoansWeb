import React, { useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { FaChartLine, FaUserClock, FaUsers, FaLayerGroup, FaFileExcel } from "react-icons/fa";
import { saveAs } from "file-saver";
import {
  getAdminAILenderAnalyticsSummary,
  getAdminAILenderAnalyticsLenders,
  downloadAdminAILenderAnalyticsExcel,
  fetchAllLenderAnalyticsForExport,
} from "../../../HttpRequest/admin";

const fmtNum = (n) => (n == null ? "0" : Number(n).toLocaleString("en-IN"));
const pickNumber = (...values) => {
  for (const value of values) {
    if (value != null && value !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return 0;
};

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const cellValue = (value) => (value == null || value === "" ? "" : value);

const buildLenderAnalyticsExcelXml = (rows) => {
  const headers = [
    "Lender ID",
    "Lender Name",
    "Email",
    "Mobile Number",
    "Pincode",
    "Address",
    "Participation Amount",
    "Deals Count",
    "Last Active",
  ];
  const headerXml = headers
    .map((title) => `<Cell><Data ss:Type="String">${escapeXml(title)}</Data></Cell>`)
    .join("");
  const rowXml = rows
    .map((lender) => {
      const cells = [
        pickNumber(lender.lenderId),
        cellValue(lender.name),
        cellValue(lender.email),
        cellValue(lender.mobileNumber),
        cellValue(lender.pincode),
        cellValue(lender.address),
        Math.round(pickNumber(lender.totalParticipationAmount)),
        pickNumber(lender.dealsCount),
        String(lender.lastActivityOn || lender.lastParticipationOn || "").slice(0, 10),
      ];
      return `<Row>${cells
        .map((cell, index) =>
          index === 0 || index === 6 || index === 7
            ? `<Cell><Data ss:Type="Number">${escapeXml(cell)}</Data></Cell>`
            : `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`
        )
        .join("")}</Row>`;
    })
    .join("");
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
<Worksheet ss:Name="Lenders">
<Table>
<Row>${headerXml}</Row>
${rowXml}
</Table>
</Worksheet>
</Workbook>`;
};

const segmentExportFileName = (segment, label) => {
  const stamp = new Date().toISOString().slice(0, 10);
  const safe = String(segment || label || "lenders")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `lenders-${safe}-${stamp}.xls`;
};

const fmtMoney = (n) => `Rs ${fmtNum(Math.round(Number(n) || 0))}`;
const responseData = (payload) => (payload && payload.data ? payload.data : payload);
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);

const ADMIN_AI_ACCENT = "#1e40af";

const SEGMENT_LABELS = {
  allTime: "All Active Lenders",
  last3Months: "Last 3 Months Active",
  last6Months: "Last 6 Months Active",
  last1Year: "Last 1 Year Active",
  inactive6Months: "Inactive (6+ Months)",
  inactive1Year: "Inactive (1+ Year)",
  oneTime: "1 Deal Participated",
  twoToNine: "2–9 Deals",
  tenToFortyNine: "10–49 Deals",
  fiftyToNinetyNine: "50–99 Deals",
  hundredPlus: "100+ Deals",
};

const MetricCard = ({ label, value, purpose, subMeta, accent = "blue", active, onClick, onExport, exporting }) => (
  <div className={`admin-ai-pro-kpi admin-ai-pro-kpi-metric admin-ai-pro-kpi--${accent} ${active ? "is-active" : ""}`}>
    <div className="admin-ai-pro-kpi-header admin-ai-pro-kpi-header--metric">
      <span className="admin-ai-pro-kpi-label">{label}</span>
    </div>
    <button type="button" className="admin-ai-pro-kpi-metric-body" onClick={onClick}>
      <strong className="admin-ai-pro-kpi-value">{fmtNum(value)}</strong>
      {purpose ? <small className="admin-ai-pro-kpi-purpose">{purpose}</small> : null}
      {subMeta ? <small className="admin-ai-pro-kpi-meta">{subMeta}</small> : null}
    </button>
    <button
      type="button"
      className="admin-ai-pro-kpi-export-btn"
      title="Download Excel"
      disabled={exporting}
      onClick={(event) => {
        event.stopPropagation();
        onExport?.();
      }}
    >
      <FaFileExcel /> {exporting ? "..." : "Excel"}
    </button>
  </div>
);

const Pager = ({ page, pageSize, total, loading, onPrevious, onNext }) => (
  <div className="admin-ai-pager">
    <button type="button" className="admin-ai-reset-btn" disabled={loading || page <= 1} onClick={onPrevious}>
      Previous
    </button>
    <span>
      Page {page} · {fmtNum(total)} lenders
    </span>
    <button type="button" className="admin-ai-search-btn" disabled={loading || page * pageSize >= total} onClick={onNext}>
      Next
    </button>
  </div>
);

const AdminAILenderAnalyticsPanel = ({ onOpenLender }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState("");
  const [lenders, setLenders] = useState([]);
  const [lendersPage, setLendersPage] = useState(1);
  const [lendersTotal, setLendersTotal] = useState(0);
  const [lendersLoading, setLendersLoading] = useState(false);
  const [exportingSegment, setExportingSegment] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const pageSize = 20;

  const loadSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const data = responseData(await getAdminAILenderAnalyticsSummary());
      setAnalytics(data);
    } catch {
      setAnalytics(null);
      setError("Failed to load lender analytics.");
    } finally {
      setLoading(false);
    }
  };

  const loadLenders = async (segment, pageNo = 1, label = selectedLabel) => {
    if (!segment) return;
    setLendersLoading(true);
    try {
      const data = responseData(await getAdminAILenderAnalyticsLenders(segment, pageNo, pageSize));
      setLenders(data.activeLenders || []);
      setLendersPage(pickNumber(data.pageNo, pageNo) || 1);
      setLendersTotal(pickNumber(data.totalCount));
      setSelectedSegment(segment);
      setSelectedLabel(label || SEGMENT_LABELS[segment] || segment);
    } catch {
      setLenders([]);
      setLendersTotal(0);
    } finally {
      setLendersLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const rolling = analytics?.rollingWindows || {};
  const inactive = analytics?.inactiveWindows || {};
  const buckets = analytics?.participationBuckets || {};
  const monthly = analytics?.monthlyActiveLenders || [];
  const financialYears = analytics?.financialYearActiveLenders || [];

  const monthlyChart = useMemo(
    () => ({
      series: [{ name: "Active Lenders", data: monthly.map((row) => pickNumber(row.count)) }],
      options: {
        chart: { toolbar: { show: false }, fontFamily: "inherit" },
        colors: [ADMIN_AI_ACCENT],
        stroke: { curve: "smooth", width: 3 },
        dataLabels: { enabled: false },
        xaxis: { categories: monthly.map((row) => row.label || row.month) },
        yaxis: { labels: { formatter: (v) => fmtNum(v) } },
      },
    }),
    [monthly]
  );

  const openSegment = (segment, label) => {
    loadLenders(segment, 1, label);
  };

  const downloadSegmentExcel = async (segment, label) => {
    if (!segment || exportingSegment) return;
    setExportingSegment(segment);
    setExportMessage("");
    const fileName = segmentExportFileName(segment, label);
    try {
      try {
        const response = await downloadAdminAILenderAnalyticsExcel(segment);
        const blob = response?.data;
        if (blob && blob.size > 0) {
          saveAs(blob, fileName.replace(/\.xls$/, ".xlsx"));
          setExportMessage(`Downloaded Excel for ${label || segment}`);
          return;
        }
      } catch {
        // Fall back to paginated client export.
      }

      const { rows, totalCount } = await fetchAllLenderAnalyticsForExport(segment);
      if (!rows.length) {
        setExportMessage("No lenders found to export.");
        return;
      }
      if (totalCount > 0 && rows.length < totalCount) {
        setExportMessage(`Export incomplete: ${rows.length} of ${totalCount} lenders.`);
        return;
      }
      const xml = buildLenderAnalyticsExcelXml(rows);
      saveAs(new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" }), fileName);
      setExportMessage(`Downloaded ${rows.length} lenders for ${label || segment}`);
    } catch {
      setExportMessage("Failed to download Excel. Please try again.");
    } finally {
      setExportingSegment("");
    }
  };

  if (loading) {
    return <div className="admin-ai-empty-state">Loading lender analytics...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex justify-content-between align-items-center">
        <span>{error}</span>
        <button type="button" className="btn btn-sm btn-outline-danger" onClick={loadSummary}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="admin-ai-pro-section admin-ai-pro-section-analytics admin-ai-pro-section--analytics">
      <div className="admin-ai-pro-section-head">
        <div className="admin-ai-pro-section-icon admin-ai-pro-section-icon--analytics"><FaChartLine /></div>
        <div>
          <h2>Lender Participation Analytics</h2>
          <p>How many lenders participated in deals — by time window, inactivity, month, FY, and deal count.</p>
        </div>
        <span className="admin-ai-pro-badge">Excludes test users &amp; admin #6680</span>
      </div>

      <div className="admin-ai-pro-note">
        <strong>What this section shows:</strong> Counts of <em>real lenders</em> (not borrowers) who accepted or updated
        deal participation. Data from <code>oxy_lenders_accepted_deals</code> and{" "}
        <code>lenders_paticipation_updation</code>. Indian FY runs Apr 1 – Mar 31.
        Click a card to see lender list, or <strong>Excel</strong> to download full details.
      </div>
      {exportMessage ? <div className="admin-ai-pro-export-msg">{exportMessage}</div> : null}

      <div className="admin-ai-analytics-section">
        <h5><FaUsers /> Active Lender Windows</h5>
        <p className="admin-ai-analytics-hint">Lenders with deal participation in each rolling time period.</p>
        <div className="admin-ai-pro-grid admin-ai-pro-grid-analytics">
          <MetricCard label="All Time Active" value={rolling.allTime} purpose="Lenders who participated in at least one deal, ever" accent="teal" active={selectedSegment === "allTime"} onClick={() => openSegment("allTime", "All Time Active")} onExport={() => downloadSegmentExcel("allTime", "All Time Active")} exporting={exportingSegment === "allTime"} />
          <MetricCard label="Last 3 Months" value={rolling.last3Months} purpose="Participated in any deal in the last 90 days" accent="cyan" active={selectedSegment === "last3Months"} onClick={() => openSegment("last3Months", "Last 3 Months Active")} onExport={() => downloadSegmentExcel("last3Months", "Last 3 Months Active")} exporting={exportingSegment === "last3Months"} />
          <MetricCard label="Last 6 Months" value={rolling.last6Months} purpose="Participated in any deal in the last 6 months" accent="blue" active={selectedSegment === "last6Months"} onClick={() => openSegment("last6Months", "Last 6 Months Active")} onExport={() => downloadSegmentExcel("last6Months", "Last 6 Months Active")} exporting={exportingSegment === "last6Months"} />
          <MetricCard label="Last 1 Year" value={rolling.last1Year} purpose="Participated in any deal in the last 12 months" accent="indigo" active={selectedSegment === "last1Year"} onClick={() => openSegment("last1Year", "Last 1 Year Active")} onExport={() => downloadSegmentExcel("last1Year", "Last 1 Year Active")} exporting={exportingSegment === "last1Year"} />
        </div>
      </div>

      <div className="admin-ai-analytics-section">
        <h5><FaUserClock /> Inactive Lenders</h5>
        <p className="admin-ai-analytics-hint">Previously active lenders with no recent deal participation.</p>
        <div className="admin-ai-pro-grid admin-ai-pro-grid-analytics admin-ai-pro-grid-compact">
          <MetricCard label="Inactive 6+ Months" value={inactive.inactive6Months} purpose="No participation in last 6 months, but participated before" accent="amber" active={selectedSegment === "inactive6Months"} onClick={() => openSegment("inactive6Months", "Inactive 6+ Months")} onExport={() => downloadSegmentExcel("inactive6Months", "Inactive 6+ Months")} exporting={exportingSegment === "inactive6Months"} />
          <MetricCard label="Inactive 1+ Year" value={inactive.inactive1Year} purpose="No participation in last 1 year, but participated before" accent="orange" active={selectedSegment === "inactive1Year"} onClick={() => openSegment("inactive1Year", "Inactive 1+ Year")} onExport={() => downloadSegmentExcel("inactive1Year", "Inactive 1+ Year")} exporting={exportingSegment === "inactive1Year"} />
        </div>
      </div>

      <div className="admin-ai-analytics-section">
        <h5>Monthly Active Lenders</h5>
        <p className="admin-ai-analytics-hint">Distinct lenders who participated in at least one deal each calendar month. Click a month chip to view details.</p>
        {monthly.length > 0 ? (
          <>
            <ReactApexChart type="area" height={260} series={monthlyChart.series} options={monthlyChart.options} />
            <div className="admin-ai-month-chips">
              {[...monthly].reverse().slice(0, 12).map((row) => (
                <button
                  key={row.month}
                  type="button"
                  className={`admin-ai-month-chip ${selectedSegment === row.segment ? "active" : ""}`}
                  onClick={() => openSegment(row.segment, row.label)}
                >
                  {row.label} <strong>{fmtNum(row.count)}</strong>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="admin-ai-empty-state">No monthly active lender data.</div>
        )}
      </div>

      <div className="admin-ai-analytics-section">
        <h5>Financial Year Active Lenders (Apr–Mar)</h5>
        <p className="admin-ai-analytics-hint">Unique lenders active during each Indian financial year (1 Apr – 31 Mar).</p>
        <div className="admin-ai-pro-grid admin-ai-pro-grid-analytics admin-ai-pro-grid-fy">
          {financialYears.map((row, index) => {
            const fyAccents = ["violet", "indigo", "blue", "cyan", "teal", "emerald", "green"];
            return (
            <MetricCard
              key={row.fyLabel}
              label={`FY ${row.fyLabel}`}
              value={row.count}
              purpose="Lenders with deal participation in this FY"
              subMeta={`${row.startDate} → ${row.endDate}`}
              accent={fyAccents[index % fyAccents.length]}
              active={selectedSegment === row.segment}
              onClick={() => openSegment(row.segment, `FY ${row.fyLabel}`)}
              onExport={() => downloadSegmentExcel(row.segment, `FY ${row.fyLabel}`)}
              exporting={exportingSegment === row.segment}
            />
            );
          })}
        </div>
      </div>

      <div className="admin-ai-analytics-section">
        <h5><FaLayerGroup /> Participation Frequency (by distinct deals)</h5>
        <p className="admin-ai-analytics-hint">How many separate deals each lender has participated in (lifetime count).</p>
        <div className="admin-ai-pro-grid admin-ai-pro-grid-analytics">
          <MetricCard label="1 Deal Only" value={buckets.oneTime} purpose="Participated in exactly 1 distinct deal" accent="slate" active={selectedSegment === "oneTime"} onClick={() => openSegment("oneTime", "1 Deal Participated")} onExport={() => downloadSegmentExcel("oneTime", "1 Deal Participated")} exporting={exportingSegment === "oneTime"} />
          <MetricCard label="2–9 Deals" value={buckets.twoToNine} purpose="Participated in 2 to 9 distinct deals" accent="teal" active={selectedSegment === "twoToNine"} onClick={() => openSegment("twoToNine", "2–9 Deals")} onExport={() => downloadSegmentExcel("twoToNine", "2–9 Deals")} exporting={exportingSegment === "twoToNine"} />
          <MetricCard label="10–49 Deals" value={buckets.tenToFortyNine} purpose="Participated in 10 to 49 distinct deals" accent="blue" active={selectedSegment === "tenToFortyNine"} onClick={() => openSegment("tenToFortyNine", "10–49 Deals")} onExport={() => downloadSegmentExcel("tenToFortyNine", "10–49 Deals")} exporting={exportingSegment === "tenToFortyNine"} />
          <MetricCard label="50–99 Deals" value={buckets.fiftyToNinetyNine} purpose="Participated in 50 to 99 distinct deals" accent="indigo" active={selectedSegment === "fiftyToNinetyNine"} onClick={() => openSegment("fiftyToNinetyNine", "50–99 Deals")} onExport={() => downloadSegmentExcel("fiftyToNinetyNine", "50–99 Deals")} exporting={exportingSegment === "fiftyToNinetyNine"} />
          <MetricCard label="100+ Deals" value={buckets.hundredPlus} purpose="Participated in 100 or more distinct deals" accent="violet" active={selectedSegment === "hundredPlus"} onClick={() => openSegment("hundredPlus", "100+ Deals")} onExport={() => downloadSegmentExcel("hundredPlus", "100+ Deals")} exporting={exportingSegment === "hundredPlus"} />
        </div>
      </div>

      {selectedSegment && (
        <div className="admin-ai-analytics-detail">
          <div className="admin-ai-panel-head">
            <div>
              <h5>{selectedLabel}</h5>
              <p>{fmtNum(lendersTotal)} lenders in this segment</p>
            </div>
            <div className="admin-ai-analytics-detail-actions">
              <button
                type="button"
                className="admin-ai-pro-kpi-export-btn admin-ai-pro-kpi-export-btn-lg"
                disabled={!!exportingSegment}
                onClick={() => downloadSegmentExcel(selectedSegment, selectedLabel)}
              >
                <FaFileExcel /> {exportingSegment === selectedSegment ? "Exporting..." : "Download Excel"}
              </button>
              <button type="button" className="admin-ai-close-btn" onClick={() => { setSelectedSegment(null); setLenders([]); }}>
                Close
              </button>
            </div>
          </div>
          {lendersLoading && <div className="admin-ai-empty-state">Loading lenders...</div>}
          {!lendersLoading && (
            <div className="admin-ai-advanced-table-wrap">
              <table className="admin-ai-advanced-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Pincode</th>
                    <th>Address</th>
                    <th>Deals</th>
                    <th>Total Participation</th>
                    <th>Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {lenders.length === 0 && (
                    <tr><td colSpan={9} className="admin-ai-empty-cell">No lenders found.</td></tr>
                  )}
                  {lenders.map((lender) => (
                    <tr key={lender.lenderId}>
                      <td>
                        <button type="button" className="admin-ai-lender-id-badge" onClick={() => onOpenLender?.(lender)}>
                          {lender.lenderId}
                        </button>
                      </td>
                      <td>{valueOrDash(lender.name)}</td>
                      <td>{valueOrDash(lender.email)}</td>
                      <td>{valueOrDash(lender.mobileNumber)}</td>
                      <td>{valueOrDash(lender.pincode)}</td>
                      <td>{valueOrDash(lender.address)}</td>
                      <td>{fmtNum(lender.dealsCount)}</td>
                      <td>{fmtMoney(lender.totalParticipationAmount)}</td>
                      <td>{String(lender.lastActivityOn || lender.lastParticipationOn || "").slice(0, 10) || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pager
            page={lendersPage}
            pageSize={pageSize}
            total={lendersTotal}
            loading={lendersLoading}
            onPrevious={() => loadLenders(selectedSegment, lendersPage - 1)}
            onNext={() => loadLenders(selectedSegment, lendersPage + 1)}
          />
        </div>
      )}
    </section>
  );
};

export default AdminAILenderAnalyticsPanel;
