import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaBriefcase, FaFilePdf } from "react-icons/fa";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { fetchRunningExtendedDeals } from "../../../HttpRequest/aiAdminApi";

const STATUSES = [
  { id: "NOTYETCLOSED", label: "Not closed", title: "Running (not closed) extended deals" },
  { id: "CLOSED", label: "Closed", title: "Closed extended deals" },
];

const formatInr = (value) =>
  value == null ? "—" : `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const formatInrPdf = (value) =>
  value == null ? "-" : `Rs. ${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const formatTenure = (value) => (value == null ? "—" : `${value} M`);

const formatRoi = (value) => {
  if (value == null) return "—";
  return `${Number(value).toFixed(2).replace(/\.00$/, "")}%`;
};

const sumField = (rows, key) => rows.reduce((total, row) => total + (Number(row[key]) || 0), 0);

const downloadPdf = (rows, totals, status) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const generated = new Date().toLocaleString("en-IN");
  doc.setFontSize(15);
  doc.text(`OxyLoans - ${status.title}`, 40, 36);
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text(`Generated: ${generated}   |   Deals: ${rows.length}   |   Total extensions: ${totals.extendedTimes}`, 40, 52);
  doc.text(
    `Deal value: ${formatInrPdf(totals.dealValue)}   |   Participation: ${formatInrPdf(totals.totalParticipation)}   |   Returned: ${formatInrPdf(totals.totalReturned)}   |   Current active: ${formatInrPdf(totals.currentActiveAmount)}`,
    40,
    65
  );
  doc.setTextColor(0);
  autoTable(doc, {
    startY: 78,
    head: [[
      "S.No",
      "Deal ID",
      "Deal Name",
      "Actual Tenure",
      "Extended Tenure",
      "ROI",
      "Extended Times",
      "Deal Value",
      "Total Participation",
      "Total Returned",
      "Current Active Amount",
    ]],
    body: rows.map((row) => [
      row.sNo,
      row.dealId,
      row.dealName || "-",
      row.actualTenure ?? "-",
      row.extendedTenure ?? "-",
      row.roi != null ? `${row.roi}%` : "-",
      row.extendedTimes,
      formatInrPdf(row.dealValue),
      formatInrPdf(row.totalParticipation),
      formatInrPdf(row.totalReturned),
      formatInrPdf(row.currentActiveAmount),
    ]),
    foot: [[
      "",
      "",
      "TOTAL",
      "",
      "",
      "",
      totals.extendedTimes,
      formatInrPdf(totals.dealValue),
      formatInrPdf(totals.totalParticipation),
      formatInrPdf(totals.totalReturned),
      formatInrPdf(totals.currentActiveAmount),
    ]],
    showFoot: "lastPage",
    styles: { fontSize: 7.5, cellPadding: 3, overflow: "linebreak" },
    headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [236, 253, 245], textColor: [6, 78, 59], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      2: { cellWidth: 150 },
      7: { halign: "right" },
      8: { halign: "right" },
      9: { halign: "right" },
      10: { halign: "right" },
    },
    didDrawPage: () => {
      const page = doc.internal.getNumberOfPages();
      const { width, height } = doc.internal.pageSize;
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`Page ${page}`, width - 70, height - 16);
      doc.setTextColor(0);
    },
  });
  const slug = status.id === "CLOSED" ? "closed" : "not-closed";
  doc.save(`extended-deals-${slug}-${new Date().toISOString().slice(0, 10)}.pdf`);
};

const AdminAIExtendedDealsPanel = () => {
  const [statusId, setStatusId] = useState("NOTYETCLOSED");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const status = STATUSES.find((item) => item.id === statusId) || STATUSES[0];
  const statusLabel = statusId === "CLOSED" ? "closed" : "not closed";

  const load = useCallback(async (nextStatus) => {
    setLoading(true);
    setError("");
    setShowAll(false);
    try {
      setRows(await fetchRunningExtendedDeals(nextStatus));
    } catch (err) {
      setError(err?.message || "Could not load extended deals. Please try again.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(statusId);
  }, [statusId, load]);

  const totals = useMemo(
    () => ({
      extendedTimes: sumField(rows, "extendedTimes"),
      dealValue: sumField(rows, "dealValue"),
      totalParticipation: sumField(rows, "totalParticipation"),
      totalReturned: sumField(rows, "totalReturned"),
      currentActiveAmount: sumField(rows, "currentActiveAmount"),
    }),
    [rows]
  );

  const visibleRows = showAll ? rows : rows.slice(0, 10);

  return (
    <section className="admin-ai-pro-section admin-ai-ext-deals">
      <div className="admin-ai-pro-section-head">
        <div className="admin-ai-pro-section-icon admin-ai-pro-section-icon--users">
          <FaBriefcase />
        </div>
        <div>
          <h2>Extended Deals</h2>
          <p>
            Live (non-test) deals whose tenure was extended — extensions, deal value,
            participation, returned, and current active amount.
          </p>
        </div>
        <div className="admin-ai-pro-section-head-actions">
          <button
            type="button"
            className="admin-ai-pro-section-export-btn"
            onClick={() => downloadPdf(rows, totals, status)}
            disabled={loading || !rows.length}
            title={`Download ${statusLabel} extended deals as PDF`}
          >
            <FaFilePdf /> Download PDF
          </button>
        </div>
      </div>

      <div className="admin-ai-ext-deals-toolbar">
        <div className="admin-ai-ext-deals-toggle" role="group" aria-label="Deal status">
          {STATUSES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-ai-ext-deals-toggle-btn${statusId === item.id ? " is-active" : ""}`}
              onClick={() => setStatusId(item.id)}
              disabled={loading && statusId !== item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
        <span className="admin-ai-ext-deals-msg">
          {loading
            ? `Loading ${statusLabel} extended deals…`
            : error
              ? ""
              : `Showing ${rows.length} ${statusLabel} deal${rows.length === 1 ? "" : "s"} with tenure extensions.`}
        </span>
      </div>

      {error ? <div className="alert alert-danger py-2 mb-2">{error}</div> : null}

      <div className="admin-ai-ext-deals-kpis">
        <div className="admin-ai-ext-deals-kpi">
          <span>Extended deals</span>
          <strong>{rows.length}</strong>
        </div>
        <div className="admin-ai-ext-deals-kpi">
          <span>Total extensions</span>
          <strong>{totals.extendedTimes}</strong>
        </div>
        <div className="admin-ai-ext-deals-kpi">
          <span>Deal value</span>
          <strong>{formatInr(totals.dealValue)}</strong>
        </div>
        <div className="admin-ai-ext-deals-kpi">
          <span>Participation</span>
          <strong>{formatInr(totals.totalParticipation)}</strong>
        </div>
        <div className="admin-ai-ext-deals-kpi">
          <span>Returned</span>
          <strong>{formatInr(totals.totalReturned)}</strong>
        </div>
        <div className="admin-ai-ext-deals-kpi admin-ai-ext-deals-kpi--accent">
          <span>Current active</span>
          <strong>{formatInr(totals.currentActiveAmount)}</strong>
        </div>
      </div>

      {loading && !rows.length ? (
        <div className="admin-ai-empty-state">Loading {statusLabel} extended deals…</div>
      ) : rows.length ? (
        <>
          <div className="table-responsive admin-ai-ext-deals-table-wrap">
            <table className="table table-sm table-hover align-middle mb-0 admin-ai-ext-deals-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Deal ID</th>
                  <th>Deal Name</th>
                  <th>Actual Tenure</th>
                  <th>Extended Tenure</th>
                  <th>ROI</th>
                  <th>Extended Times</th>
                  <th className="text-end">Deal Value</th>
                  <th className="text-end">Total Participation</th>
                  <th className="text-end">Total Returned</th>
                  <th className="text-end">Current Active Amount</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr key={row.dealId}>
                    <td>{row.sNo}</td>
                    <td>{row.dealId}</td>
                    <td>{row.dealName || "—"}</td>
                    <td>{formatTenure(row.actualTenure)}</td>
                    <td>{formatTenure(row.extendedTenure)}</td>
                    <td>{formatRoi(row.roi)}</td>
                    <td>
                      <span className="admin-ai-ext-deals-badge">{row.extendedTimes}×</span>
                    </td>
                    <td className="text-end">{formatInr(row.dealValue)}</td>
                    <td className="text-end">{formatInr(row.totalParticipation)}</td>
                    <td className="text-end">{formatInr(row.totalReturned)}</td>
                    <td className="text-end fw-semibold">{formatInr(row.currentActiveAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 10 ? (
            <button
              type="button"
              className="btn btn-link btn-sm px-0 mt-1"
              onClick={() => setShowAll((open) => !open)}
            >
              {showAll ? "Show fewer" : `Show all ${rows.length} deals`}
            </button>
          ) : null}
        </>
      ) : error ? null : (
        <div className="admin-ai-empty-state">No {statusLabel} deals with tenure extensions found.</div>
      )}
    </section>
  );
};

export default AdminAIExtendedDealsPanel;
