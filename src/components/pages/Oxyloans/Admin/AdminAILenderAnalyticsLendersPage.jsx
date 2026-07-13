import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaRobot, FaArrowLeft, FaUsers, FaFileExcel, FaEnvelope, FaWhatsapp } from "react-icons/fa";
import { saveAs } from "file-saver";
import OxyloansAdminSidebar from "../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../Header/OxyloansAdminHeader";
import Footer from "../../../Footer/Footer";
import {
  getAdminAILenderAnalyticsLenders,
  getOldDashboardActiveLendersCount,
  downloadAdminAILenderAnalyticsExcel,
  fetchAllLenderAnalyticsForExport,
  parseAdminLenderIdSearch,
} from "../../../HttpRequest/admin";
import AdminAILenderCampaignModal from "./AdminAILenderCampaignModal";
import "./AdminAIDashboard.css";

const pageSize = 20;

const SEGMENT_LABELS = {
  allTime: "All Time Active",
  last3Months: "Last 3 Months Active",
  last6Months: "Last 6 Months Active",
  last1Year: "Last 1 Year Active",
  inactive3Months: "Inactive 3+ Months",
  inactive6Months: "Inactive 6+ Months",
  inactive1Year: "Inactive 1+ Year",
  oneTime: "1 Deal Participated",
  twoToNine: "2-9 Deals",
  tenToFortyNine: "10-49 Deals",
  fiftyToNinetyNine: "50-99 Deals",
  hundredPlus: "100+ Deals",
};

const fmtNum = (n) => (n == null ? "0" : Number(n).toLocaleString("en-IN"));
const fmtMoney = (n) => `Rs ${fmtNum(Math.round(Number(n) || 0))}`;
const pickNumber = (...values) => {
  for (const value of values) {
    if (value != null && value !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return 0;
};
const responseData = (payload) => (payload && payload.data ? payload.data : payload);
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);

const segmentExportFileName = (segment, label) => {
  const stamp = new Date().toISOString().slice(0, 10);
  const safe = String(segment || label || "lenders")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return `lenders-${safe}-${stamp}.xls`;
};

const AdminAILenderAnalyticsLendersPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const segment = searchParams.get("segment") || "allTime";
  const segmentLabel = searchParams.get("label") || SEGMENT_LABELS[segment] || segment;
  const urlLenderId = searchParams.get("lenderId") || "";

  const [lenders, setLenders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [segmentTotalCount, setSegmentTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lenderIdSearch, setLenderIdSearch] = useState(urlLenderId);
  const [appliedLenderIdSearch, setAppliedLenderIdSearch] = useState(urlLenderId);
  const [searchInSegment, setSearchInSegment] = useState(true);
  const [searchedLenderDealsCount, setSearchedLenderDealsCount] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [campaignState, setCampaignState] = useState(null);
  const [campaignNotice, setCampaignNotice] = useState("");

  const loadLenders = async (nextPage = 1, lenderId = urlLenderId) => {
    setLoading(true);
    setError("");
    const searchId = parseAdminLenderIdSearch(lenderId);
    try {
      const data = responseData(await getAdminAILenderAnalyticsLenders(segment, nextPage, pageSize, searchId || ""));
      let rows = data.activeLenders || [];
      if (searchId > 0) {
        rows = rows.filter((row) => pickNumber(row.lenderId) === searchId);
      }
      setLenders(rows);
      setPage(pickNumber(data.pageNo, nextPage) || 1);
      let resolvedTotal = searchId > 0 ? rows.length : pickNumber(data.totalCount);
      if (!searchId && segment === "allTime") {
        const legacyCount = await getOldDashboardActiveLendersCount();
        resolvedTotal = pickNumber(legacyCount, data.totalCount, resolvedTotal);
      }
      setTotalCount(resolvedTotal);
      setSegmentTotalCount(
        !searchId && segment === "allTime"
          ? resolvedTotal
          : pickNumber(data.segmentTotalCount, data.totalCount)
      );
      setSearchInSegment(data.inSegment !== false);
      setSearchedLenderDealsCount(pickNumber(data.searchedLenderDealsCount));
    } catch {
      setLenders([]);
      setTotalCount(0);
      setSegmentTotalCount(0);
      setError("Failed to load lenders for this segment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLenderIdSearch(urlLenderId);
    setAppliedLenderIdSearch(urlLenderId);
    setPage(1);
    loadLenders(1, urlLenderId);
  }, [segment, urlLenderId]);

  const applyLenderIdSearch = () => {
    const lenderId = String(lenderIdSearch || "").trim();
    const params = { segment, label: segmentLabel };
    if (lenderId) {
      params.lenderId = lenderId;
    }
    setSearchParams(params, { replace: true });
  };

  const clearLenderIdSearch = () => {
    setSearchParams({ segment, label: segmentLabel }, { replace: true });
  };

  const downloadExcel = async () => {
    if (exporting) return;
    setExporting(true);
    setExportMessage("");
    const fileName = segmentExportFileName(segment, segmentLabel);
    try {
      const response = await downloadAdminAILenderAnalyticsExcel(segment);
      const blob = response?.data;
      if (blob && blob.size > 0) {
        saveAs(blob, fileName.replace(/\.xls$/, ".xlsx"));
        setExportMessage(`Downloaded Excel for ${segmentLabel}`);
        return;
      }
    } catch {
      // Fall back below.
    }
    try {
      const { rows, totalCount: exportTotal } = await fetchAllLenderAnalyticsForExport(segment);
      if (!rows.length) {
        setExportMessage("No lenders found to export.");
        return;
      }
      if (exportTotal > 0 && rows.length < exportTotal) {
        setExportMessage(`Export incomplete: ${rows.length} of ${exportTotal} lenders.`);
      }
    } catch {
      setExportMessage("Failed to download Excel.");
    } finally {
      setExporting(false);
    }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(totalCount / pageSize)), [totalCount]);
  const summaryCount = appliedLenderIdSearch ? totalCount : (segmentTotalCount || totalCount);
  const listTitle = appliedLenderIdSearch
    ? totalCount > 0
      ? searchInSegment
        ? `Found lender #${appliedLenderIdSearch} in ${segmentLabel}`
        : `Lender #${appliedLenderIdSearch} has ${fmtNum(searchedLenderDealsCount || lenders[0]?.dealsCount)} deals (not in ${segmentLabel})`
      : `Lender #${appliedLenderIdSearch} not found`
    : `${fmtNum(summaryCount)} lenders in this segment`;

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid admin-ai-page">
          <section className="admin-ai-hero admin-ai-hero-glow">
            <div>
              <span className="admin-ai-pill"><FaRobot /> AI Operations</span>
              <h2>{segmentLabel}</h2>
              <p>Lenders in this analytics segment - search by lender ID, export, or run campaigns.</p>
            </div>
            <strong>Admin / AI Dashboard / Lender Analytics / {segmentLabel}</strong>
          </section>

          <div className="admin-ai-summary-bar">
            <div className="admin-ai-summary-card admin-ai-summary-card-glow">
              <FaUsers />
              <div>
                <span>{segmentLabel}</span>
                <strong>{appliedLenderIdSearch ? fmtNum(totalCount) : fmtNum(summaryCount)}</strong>
              </div>
            </div>
            <button className="admin-ai-close-btn" type="button" onClick={() => navigate("/adminAIDashboard")}>
              <FaArrowLeft /> Back to Dashboard
            </button>
          </div>

          {campaignNotice ? (
            <div className="admin-ai-pro-export-msg admin-ai-campaign-test-ok">{campaignNotice}</div>
          ) : null}

          <section className="admin-ai-panel admin-ai-panel-premium admin-ai-analytics-lenders-page">
            <div className="admin-ai-panel-head">
              <div>
                <h5>{segmentLabel}</h5>
                <p>{listTitle}</p>
                {appliedLenderIdSearch && segmentTotalCount > 0 ? (
                  <p className="admin-ai-analytics-search-note">{fmtNum(segmentTotalCount)} lenders total in this segment</p>
                ) : null}
              </div>
              <div className="admin-ai-analytics-detail-actions">
                <button
                  type="button"
                  className="admin-ai-pro-kpi-campaign-btn admin-ai-pro-kpi-campaign-btn-lg"
                  onClick={() => setCampaignState({ channel: "email" })}
                >
                  <FaEnvelope /> Email Campaign
                </button>
                <button
                  type="button"
                  className="admin-ai-pro-kpi-campaign-btn admin-ai-pro-kpi-campaign-btn-lg admin-ai-pro-kpi-campaign-btn--whatsapp"
                  onClick={() => setCampaignState({ channel: "whatsapp" })}
                >
                  <FaWhatsapp /> WhatsApp Campaign
                </button>
                <button
                  type="button"
                  className="admin-ai-pro-kpi-export-btn admin-ai-pro-kpi-export-btn-lg"
                  disabled={exporting}
                  onClick={downloadExcel}
                >
                  <FaFileExcel /> {exporting ? "Exporting..." : "Download Excel"}
                </button>
              </div>
            </div>

            {exportMessage ? <div className="admin-ai-pro-export-msg">{exportMessage}</div> : null}

            <form
              className="admin-ai-analytics-lender-search"
              onSubmit={(event) => {
                event.preventDefault();
                applyLenderIdSearch();
              }}
            >
              <label>
                Search by Lender ID
                <input
                  type="text"
                  placeholder="e.g. LR55015 or 55015"
                  value={lenderIdSearch}
                  onChange={(event) => setLenderIdSearch(event.target.value)}
                />
              </label>
              <button type="submit" className="admin-ai-search-btn" disabled={loading}>
                Search
              </button>
              <button
                type="button"
                className="admin-ai-reset-btn"
                onClick={clearLenderIdSearch}
                disabled={loading || (!lenderIdSearch && !appliedLenderIdSearch)}
              >
                Clear
              </button>
              {appliedLenderIdSearch ? (
                <span className="admin-ai-analytics-search-note">
                  {totalCount > 0
                    ? searchInSegment
                      ? `Found lender #${appliedLenderIdSearch} in ${segmentLabel}`
                      : `Lender #${appliedLenderIdSearch} has ${fmtNum(searchedLenderDealsCount || lenders[0]?.dealsCount)} deals (belongs in a different segment)`
                    : `No lender found for ID #${appliedLenderIdSearch}`}
                </span>
              ) : null}
            </form>

            {error && <div className="admin-ai-empty-state admin-ai-error-text">{error}</div>}
            {loading && <div className="admin-ai-empty-state">Loading lenders...</div>}

            {!loading && !error && appliedLenderIdSearch && lenders.length === 0 && (
              <div className="admin-ai-empty-state">
                No lender found for ID <strong>#{appliedLenderIdSearch}</strong>.
                {segmentTotalCount > 0 ? ` ${fmtNum(segmentTotalCount)} lenders are in ${segmentLabel}.` : ""}
                {" "}Check the ID or try another segment.
              </div>
            )}

            {!loading && !error && appliedLenderIdSearch && lenders.length > 0 && !searchInSegment && (
              <div className="alert alert-warning admin-ai-search-note">
                Lender <strong>#{appliedLenderIdSearch}</strong> has <strong>{fmtNum(searchedLenderDealsCount || lenders[0]?.dealsCount)} deals</strong> and is not in <strong>{segmentLabel}</strong>.
                Showing their profile below.
              </div>
            )}

            {!loading && !error && lenders.length > 0 && (
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
                        <td><span className="admin-ai-lender-id-badge">{lender.lenderId}</span></td>
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

            {!loading && !error && !appliedLenderIdSearch && totalCount > 0 && (
              <div className="admin-ai-pager">
                <button
                  type="button"
                  className="admin-ai-reset-btn"
                  disabled={loading || page <= 1}
                  onClick={() => loadLenders(page - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {page} of {totalPages} - {fmtNum(totalCount)} lenders
                </span>
                <button
                  type="button"
                  className="admin-ai-search-btn"
                  disabled={loading || page >= totalPages}
                  onClick={() => loadLenders(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
        <Footer />
      </div>

      <AdminAILenderCampaignModal
        open={Boolean(campaignState)}
        onClose={() => setCampaignState(null)}
        segment={segment}
        segmentLabel={segmentLabel}
        recipientCount={appliedLenderIdSearch ? totalCount : (segmentTotalCount || totalCount)}
        initialChannel={campaignState?.channel}
        onSent={(result) => {
          if (result?.status === "SCHEDULED" && result?.message) {
            setCampaignNotice(result.message);
          }
        }}
      />
    </div>
  );
};

export default AdminAILenderAnalyticsLendersPage;