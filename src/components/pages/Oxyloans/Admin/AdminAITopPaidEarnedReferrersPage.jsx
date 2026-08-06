import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaDownload, FaEye, FaTimes, FaTrophy } from "react-icons/fa";
import { saveAs } from "file-saver";
import { useNavigate, useSearchParams } from "react-router-dom";
import { goBackOrAdminAI, YEAR_WISE_REFERRALS_PATH } from "./adminAINavigation";
import { getAdminAITopPaidEarnedReferrers, getAdminAIEarnersAtLeast } from "../../../HttpRequest/admin";
import "./AdminAIDashboard.css";

const PAGE_SIZE = 50;
const fmtNum = (value) => Number(value || 0).toLocaleString("en-IN");
const fmtMoney = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);
const pickNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const responseData = (payload) => payload?.data || payload || {};

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const buildTopPaidEarnedExcelXml = (rows, limit) => {
  const headers = [
    "Rank",
    "Referrer Code",
    "Referrer ID",
    "Name",
    "Mobile",
    "Email",
    "Paid Amount",
    "Total Earned",
    "Unpaid Amount",
    "Referral Count",
    "Registered Count",
    "Lent Count",
    "Invited Count",
    "Total Investment",
  ];
  const headerXml = headers
    .map((title) => `<Cell><Data ss:Type="String">${escapeXml(title)}</Data></Cell>`)
    .join("");
  const numericCols = new Set([0, 2, 6, 7, 8, 9, 10, 11, 12, 13]);
  const rowXml = (rows || [])
    .map((row) => {
      const cells = [
        pickNumber(row.rank),
        row.referrerCode || (row.referrerId ? `LR${row.referrerId}` : ""),
        pickNumber(row.referrerId),
        row.name || "",
        row.mobileNumber || "",
        row.email || "",
        pickNumber(row.amountPaid),
        pickNumber(row.totalEarned),
        pickNumber(row.amountNotPaid),
        pickNumber(row.referralCount),
        pickNumber(row.registeredCount),
        pickNumber(row.lentCount),
        pickNumber(row.invitedCount),
        pickNumber(row.totalInvestment),
      ];
      const cellXml = cells
        .map((cell, index) => {
          const type = numericCols.has(index) ? "Number" : "String";
          return `<Cell><Data ss:Type="${type}">${escapeXml(cell)}</Data></Cell>`;
        })
        .join("");
      return `<Row>${cellXml}</Row>`;
    })
    .join("");
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
<Worksheet ss:Name="${escapeXml(typeof limit === "string" ? limit : `Top ${limit} Paid Earned`)}">
<Table>
<Row>${headerXml}</Row>
${rowXml}
</Table>
</Worksheet>
</Workbook>`;
};

export const downloadTopPaidEarnedExcel = (rows, limit, { filePrefix = "top", sheetLabel } = {}) => {
  const count = Array.isArray(rows) ? rows.length : 0;
  const safeLimit = Math.max(1, pickNumber(limit) || count || 10);
  const sheetName = String(sheetLabel || `Top ${Math.min(safeLimit, 50)} Paid Earned`).slice(0, 31);
  const xml = buildTopPaidEarnedExcelXml(rows, sheetName);
  const blob = new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const stamp = new Date().toISOString().slice(0, 10);
  const prefix = filePrefix === "at-least-1" ? "lenders-at-least-1-rupee-earned" : `top-${safeLimit}-paid-earned-referrers`;
  saveAs(blob, `${prefix}-${stamp}.xls`);
};

const AdminAITopPaidEarnedReferrersPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "atLeastOne" ? "atLeastOne" : "top";
  const isAtLeastOne = mode === "atLeastOne";
  const limit = Math.min(50, Math.max(10, pickNumber(searchParams.get("limit")) || 10));
  const page = Math.max(1, pickNumber(searchParams.get("page")) || 1);

  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const closePage = () => goBackOrAdminAI(navigate, YEAR_WISE_REFERRALS_PATH);
  const totalPages = Math.max(1, Math.ceil(Math.max(totalCount, 1) / PAGE_SIZE));

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        if (isAtLeastOne) {
          const data = responseData(await getAdminAIEarnersAtLeast(page, PAGE_SIZE, 1));
          if (!cancelled) {
            setRows(Array.isArray(data.referrers) ? data.referrers : []);
            setTotalCount(pickNumber(data.totalCount, data.earnersAtLeastOneRupeeCount));
          }
        } else {
          const data = responseData(await getAdminAITopPaidEarnedReferrers(limit));
          if (!cancelled) {
            const list = Array.isArray(data.referrers) ? data.referrers : [];
            setRows(list);
            setTotalCount(pickNumber(data.earnersAtLeastOneRupeeCount, list.length));
          }
        }
      } catch (requestError) {
        if (!cancelled) {
          setRows([]);
          setTotalCount(0);
          setError(requestError?.response?.data?.message || requestError?.message || "Failed to load earned referrers.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isAtLeastOne, limit, page]);

  const setLimit = (nextLimit) => {
    const next = new URLSearchParams(searchParams);
    next.delete("mode");
    next.delete("page");
    next.set("limit", String(nextLimit));
    setSearchParams(next);
  };

  const openAtLeastOneMode = () => {
    const next = new URLSearchParams(searchParams);
    next.set("mode", "atLeastOne");
    next.set("page", "1");
    next.delete("limit");
    setSearchParams(next);
  };

  const setPage = (nextPage) => {
    const next = new URLSearchParams(searchParams);
    next.set("mode", "atLeastOne");
    next.set("page", String(Math.max(1, nextPage)));
    setSearchParams(next);
  };

  const openPaidHistory = (row) => {
    const params = new URLSearchParams({
      referrerId: String(row.referrerId),
      referrerCode: row.referrerCode || `LR${row.referrerId}`,
      name: row.name || "",
      rank: String(row.rank || ""),
      limit: String(isAtLeastOne ? 10 : limit),
    });
    navigate(`/adminAITopPaidEarnedHistory?${params.toString()}`);
  };

  const handleDownloadExcel = async () => {
    setExporting(true);
    setError("");
    try {
      if (isAtLeastOne) {
        const allRows = [];
        let pageNo = 1;
        let knownTotal = totalCount;
        while (pageNo <= 50) {
          const data = responseData(await getAdminAIEarnersAtLeast(pageNo, 200, 1));
          const batch = Array.isArray(data.referrers) ? data.referrers : [];
          knownTotal = pickNumber(data.totalCount, knownTotal);
          allRows.push(...batch);
          if (!batch.length || allRows.length >= knownTotal) break;
          pageNo += 1;
        }
        if (!allRows.length) throw new Error("No lenders with at least ₹1 earned found.");
        downloadTopPaidEarnedExcel(allRows, allRows.length, {
          filePrefix: "at-least-1",
          sheetLabel: "Earners >= 1 INR",
        });
      } else {
        if (!rows.length) throw new Error("No rankers available to download.");
        downloadTopPaidEarnedExcel(rows, limit);
      }
    } catch (exportError) {
      setError(exportError?.message || "Failed to download Excel.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="admin-ai-page-shell">
      <div className="admin-ai-dashboard-wrap admin-ai-top-paid-page">
        <header className="admin-ai-top-paid-page-head">
          <div>
            <button type="button" className="admin-ai-referral-back" onClick={closePage}>
              <FaArrowLeft /> Back to YearWise referrals
            </button>
            <h2>
              <FaTrophy />{" "}
              {isAtLeastOne
                ? "Lenders with at least ₹1 earned"
                : `Top ${limit} Paid Earned Referrers`}
            </h2>
            <p>
              {isAtLeastOne
                ? "All-time list of lenders whose total referral earnings are at least ₹1."
                : "All-time ranking by paid referral earnings. History opens paid date records on a new page."}
            </p>
          </div>
          <div className="admin-ai-top-paid-page-actions">
            <div className="admin-ai-top-paid-limit-tabs" role="tablist" aria-label="Ranking limit">
              <button type="button" className={!isAtLeastOne && limit === 10 ? "is-active" : ""} onClick={() => setLimit(10)}>Top 10</button>
              <button type="button" className={!isAtLeastOne && limit === 50 ? "is-active" : ""} onClick={() => setLimit(50)}>Top 50</button>
              <button type="button" className={isAtLeastOne ? "is-active" : ""} onClick={openAtLeastOneMode}>₹1+ earners</button>
            </div>
            <button
              type="button"
              className="admin-ai-search-btn"
              disabled={loading || exporting || (!isAtLeastOne && !rows.length)}
              onClick={handleDownloadExcel}
              title={isAtLeastOne ? "Download Excel for all ₹1+ earners" : `Download Excel for Top ${limit}`}
            >
              <FaDownload /> {exporting ? "Downloading..." : (isAtLeastOne ? "Excel ₹1+" : `Excel Top ${limit}`)}
            </button>
            <button type="button" className="admin-ai-close-btn" onClick={closePage}>
              <FaTimes /> Close
            </button>
          </div>
        </header>

        {error ? <div className="alert alert-danger">{error}</div> : null}
        {loading ? <div className="admin-ai-empty-state">Loading earned referrers...</div> : null}

        {!loading ? (
          <section className="admin-ai-top-paid-board">
            <div className="admin-ai-top-paid-board-meta">
              <strong>
                {isAtLeastOne
                  ? `${fmtNum(totalCount)} lenders with ≥ ₹1 earned`
                  : `${fmtNum(rows.length)} referrers`}
              </strong>
              <span>
                {isAtLeastOne
                  ? `Sorted by Total Earned · Page ${page} of ${totalPages}`
                  : "Sorted by Paid amount (highest first)"}
                {!isAtLeastOne && totalCount > 0 ? ` · ${fmtNum(totalCount)} lenders earned ≥ ₹1 overall` : ""}
              </span>
            </div>

            <div className="admin-ai-top-paid-table" role="table">
              <div className="admin-ai-top-paid-table-head" role="row">
                <span>Rank</span>
                <span>Referrer</span>
                <span>Paid</span>
                <span>Total Earned</span>
                <span>Unpaid</span>
                <span>Counts</span>
                <span>Contact</span>
                <span>Action</span>
              </div>

              <div className="admin-ai-top-paid-table-body">
                {rows.map((row) => (
                  <div key={row.referrerId} className="admin-ai-top-paid-row" role="row">
                    <div className="admin-ai-top-paid-rank">
                      <em>#{row.rank}</em>
                    </div>

                    <div className="admin-ai-top-paid-person">
                      <strong>{valueOrDash(row.referrerCode)}</strong>
                      <span>{valueOrDash(row.name)}</span>
                    </div>

                    <div className="admin-ai-top-paid-money is-paid">
                      <small>Paid</small>
                      <strong>{fmtMoney(row.amountPaid)}</strong>
                    </div>

                    <div className="admin-ai-top-paid-money is-earned">
                      <small>Earned</small>
                      <strong>{fmtMoney(row.totalEarned)}</strong>
                    </div>

                    <div className="admin-ai-top-paid-money is-unpaid">
                      <small>Unpaid</small>
                      <strong>{fmtMoney(row.amountNotPaid)}</strong>
                    </div>

                    <div className="admin-ai-top-paid-counts">
                      <span><b>{fmtNum(row.referralCount)}</b> referrals</span>
                      <span><b>{fmtNum(row.lentCount)}</b> lent</span>
                    </div>

                    <div className="admin-ai-top-paid-contact">
                      <span>{valueOrDash(row.mobileNumber)}</span>
                      <small title={valueOrDash(row.email)}>{valueOrDash(row.email)}</small>
                    </div>

                    <div className="admin-ai-top-paid-action">
                      <button type="button" onClick={() => openPaidHistory(row)}>
                        <FaEye /> History
                      </button>
                    </div>
                  </div>
                ))}
                {!rows.length ? (
                  <div className="admin-ai-empty-state">
                    {isAtLeastOne ? "No lenders with at least ₹1 earned found." : "No paid earned referrers found."}
                  </div>
                ) : null}
              </div>
            </div>

            {isAtLeastOne && totalCount > PAGE_SIZE ? (
              <div className="admin-ai-referral-users-pager">
                <button type="button" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>Previous</button>
                <span>{page} / {totalPages}</span>
                <button type="button" disabled={page >= totalPages || loading} onClick={() => setPage(page + 1)}>Next</button>
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default AdminAITopPaidEarnedReferrersPage;
