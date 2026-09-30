import React, { useCallback, useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf, FaHourglassHalf } from "react-icons/fa";
import { loadRunningExtendedDeals, isLoggedIn } from "../../../HttpRequest/aiAdminApi";

const STATUS_OPTIONS = [
  { id: "NOTYETCLOSED", label: "Not closed", title: "Running (not closed) extended deals" },
  { id: "CLOSED", label: "Closed", title: "Closed extended deals" },
];

const inr = (n) =>
  n == null ? "—" : "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

/** jsPDF's default fonts have no ₹ glyph, so the PDF uses "Rs." instead. */
const pdfMoney = (n) =>
  n == null ? "-" : "Rs. " + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const fmtRoi = (v) => (v == null ? "—" : `${Number(v).toFixed(2).replace(/\.00$/, "")}%`);
const fmtTenure = (v) => (v == null ? "—" : `${v} M`);

const sum = (rows, key) => rows.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);

const downloadPdf = (rows, totals, statusOption) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const generatedAt = new Date().toLocaleString("en-IN");

  doc.setFontSize(15);
  doc.text(`OxyLoans - ${statusOption.title}`, 40, 36);
  doc.setFontSize(9);
  doc.setTextColor(90);
  doc.text(
    `Generated: ${generatedAt}   |   Deals: ${rows.length}   |   Total extensions: ${totals.extendedTimes}`,
    40,
    52
  );
  doc.text(
    `Deal value: ${pdfMoney(totals.dealValue)}   |   Participation: ${pdfMoney(totals.totalParticipation)}   |   ` +
      `Returned: ${pdfMoney(totals.totalReturned)}   |   Current active: ${pdfMoney(totals.currentActiveAmount)}`,
    40,
    65
  );
  doc.setTextColor(0);

  autoTable(doc, {
    startY: 78,
    head: [[
      "S.No", "Deal ID", "Deal Name", "Actual Tenure", "Extended Tenure", "ROI",
      "Extended Times", "Deal Value", "Total Participation", "Total Returned", "Current Active Amount",
    ]],
    body: rows.map((r) => [
      r.sNo,
      r.dealId,
      r.dealName || "-",
      r.actualTenure ?? "-",
      r.extendedTenure ?? "-",
      r.roi != null ? `${r.roi}%` : "-",
      r.extendedTimes,
      pdfMoney(r.dealValue),
      pdfMoney(r.totalParticipation),
      pdfMoney(r.totalReturned),
      pdfMoney(r.currentActiveAmount),
    ]),
    foot: [[
      "", "", "TOTAL", "", "", "", totals.extendedTimes,
      pdfMoney(totals.dealValue),
      pdfMoney(totals.totalParticipation),
      pdfMoney(totals.totalReturned),
      pdfMoney(totals.currentActiveAmount),
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
      const pageCount = doc.internal.getNumberOfPages();
      const { width, height } = doc.internal.pageSize;
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`Page ${pageCount}`, width - 70, height - 16);
      doc.setTextColor(0);
    },
  });

  const suffix = statusOption.id === "CLOSED" ? "closed" : "not-closed";
  doc.save(`extended-deals-${suffix}-${new Date().toISOString().slice(0, 10)}.pdf`);
};

const AdminRunningExtendedDealsPanel = () => {
  const [status, setStatus] = useState("NOTYETCLOSED");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState(false);

  const statusOption = STATUS_OPTIONS.find((o) => o.id === status) || STATUS_OPTIONS[0];
  const statusWord = status === "CLOSED" ? "closed" : "not closed";

  const fetchRows = useCallback(async (nextStatus) => {
    if (!isLoggedIn()) {
      setError("Please log in as admin to view extended deals.");
      return;
    }
    setLoading(true);
    setError("");
    setExpanded(false);
    try {
      setRows(await loadRunningExtendedDeals(nextStatus));
    } catch (e) {
      setError(e?.message || "Could not load extended deals. Please try again.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRows(status);
  }, [status, fetchRows]);

  const totals = useMemo(
    () => ({
      extendedTimes: sum(rows, "extendedTimes"),
      dealValue: sum(rows, "dealValue"),
      totalParticipation: sum(rows, "totalParticipation"),
      totalReturned: sum(rows, "totalReturned"),
      currentActiveAmount: sum(rows, "currentActiveAmount"),
    }),
    [rows]
  );

  const visibleRows = expanded ? rows : rows.slice(0, 10);

  return (
    <section className="admin-ai-pro-section admin-ai-ext-deals">
      <div className="admin-ai-pro-section-head">
        <div className="admin-ai-pro-section-icon admin-ai-pro-section-icon--users">
          <FaHourglassHalf />
        </div>
        <div>
          <h2>Extended Deals</h2>
          <p>Live (non-test) deals whose tenure was extended — extensions, deal value, participation, returned, and current active amount.</p>
        </div>
        <div className="admin-ai-pro-section-head-actions">
          <button
            type="button"
            className="admin-ai-pro-section-export-btn"
            onClick={() => downloadPdf(rows, totals, statusOption)}
            disabled={loading || !rows.length}
            title={`Download ${statusWord} extended deals as PDF`}
          >
            <FaFilePdf /> Download PDF
          </button>
        </div>
      </div>

      <div className="admin-ai-ext-deals-toolbar">
        <div className="admin-ai-ext-deals-toggle" role="group" aria-label="Deal status">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`admin-ai-ext-deals-toggle-btn ${status === opt.id ? "is-active" : ""}`}
              onClick={() => setStatus(opt.id)}
              disabled={loading && status !== opt.id}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <span className="admin-ai-ext-deals-msg">
          {loading
            ? `Loading ${statusWord} extended deals…`
            : error
              ? ""
              : `Showing ${rows.length} ${statusWord} deal${rows.length === 1 ? "" : "s"} with tenure extensions.`}
        </span>
      </div>

      {error ? <div className="alert alert-danger py-2 mb-2">{error}</div> : null}

      <div className="admin-ai-ext-deals-kpis">
        <div className="admin-ai-ext-deals-kpi"><span>Extended deals</span><strong>{rows.length}</strong></div>
        <div className="admin-ai-ext-deals-kpi"><span>Total extensions</span><strong>{totals.extendedTimes}</strong></div>
        <div className="admin-ai-ext-deals-kpi"><span>Deal value</span><strong>{inr(totals.dealValue)}</strong></div>
        <div className="admin-ai-ext-deals-kpi"><span>Participation</span><strong>{inr(totals.totalParticipation)}</strong></div>
        <div className="admin-ai-ext-deals-kpi"><span>Returned</span><strong>{inr(totals.totalReturned)}</strong></div>
        <div className="admin-ai-ext-deals-kpi admin-ai-ext-deals-kpi--accent"><span>Current active</span><strong>{inr(totals.currentActiveAmount)}</strong></div>
      </div>

      {loading && !rows.length ? (
        <div className="admin-ai-empty-state">Loading {statusWord} extended deals…</div>
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
                {visibleRows.map((r) => (
                  <tr key={r.dealId}>
                    <td>{r.sNo}</td>
                    <td>{r.dealId}</td>
                    <td>{r.dealName || "—"}</td>
                    <td>{fmtTenure(r.actualTenure)}</td>
                    <td>{fmtTenure(r.extendedTenure)}</td>
                    <td>{fmtRoi(r.roi)}</td>
                    <td><span className="admin-ai-ext-deals-badge">{r.extendedTimes}×</span></td>
                    <td className="text-end">{inr(r.dealValue)}</td>
                    <td className="text-end">{inr(r.totalParticipation)}</td>
                    <td className="text-end">{inr(r.totalReturned)}</td>
                    <td className="text-end fw-semibold">{inr(r.currentActiveAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 10 ? (
            <button type="button" className="btn btn-link btn-sm px-0 mt-1" onClick={() => setExpanded((v) => !v)}>
              {expanded ? "Show fewer" : `Show all ${rows.length} deals`}
            </button>
          ) : null}
        </>
      ) : !error ? (
        <div className="admin-ai-empty-state">No {statusWord} deals with tenure extensions found.</div>
      ) : null}
    </section>
  );
};

export default AdminRunningExtendedDealsPanel;
