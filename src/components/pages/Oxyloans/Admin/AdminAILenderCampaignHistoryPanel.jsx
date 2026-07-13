import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaEnvelope, FaFileExcel, FaHistory, FaTimes, FaWhatsapp } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { saveAs } from "file-saver";
import {
  fetchAllCampaignFailedDeliveries,
  getAdminAILenderCampaignBatchDeliveries,
  getAdminAILenderCampaignHistory,
  isCampaignDeliveryFailed,
  sendAdminAILenderCampaignAdminReport,
} from "../../../HttpRequest/admin";

const fmtNum = (n) => (n == null ? "0" : Number(n).toLocaleString("en-IN"));

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 19).replace("T", " ");
  return date.toLocaleString("en-IN");
};

const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const buildFailedDeliveriesExcelXml = (rows) => {
  const headers = ["Sent At", "Lender ID", "Lender Name", "Email", "Mobile", "Recipient", "Channel", "Status", "Error"];
  const headerXml = headers.map((title) => `<Cell><Data ss:Type="String">${escapeXml(title)}</Data></Cell>`).join("");
  const rowXml = rows
    .map((row) => {
      const cells = [
        formatDateTime(row.sentAt),
        row.lenderId ? `LR${row.lenderId}` : "",
        row.lenderName || "",
        row.email || "",
        row.mobileNumber || "",
        row.recipient || row.email || row.mobileNumber || "",
        row.channel || "",
        row.status || "",
        row.errorMessage || "",
      ];
      return `<Row>${cells.map((cell) => `<Cell><Data ss:Type="String">${escapeXml(cell)}</Data></Cell>`).join("")}</Row>`;
    })
    .join("");
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
<Worksheet ss:Name="Failed Users">
<Table>
<Row>${headerXml}</Row>
${rowXml}
</Table>
</Worksheet>
</Workbook>`;
};

const statusClass = (status) => {
  const value = String(status || "").toUpperCase();
  if (value === "SUCCESS" || value === "COMPLETED") return "is-success";
  if (value === "FAILED") return "is-failed";
  if (value === "PARTIAL" || value === "PROCESSING") return "is-partial";
  if (value === "PENDING" || value === "SCHEDULED") return "is-pending";
  return "";
};

const ChannelBadge = ({ channel }) => {
  const value = String(channel || "").toLowerCase();
  if (value === "whatsapp") {
    return (
      <span className="admin-ai-campaign-channel-badge admin-ai-campaign-channel-badge--whatsapp">
        <FaWhatsapp /> WhatsApp
      </span>
    );
  }
  return (
    <span className="admin-ai-campaign-channel-badge admin-ai-campaign-channel-badge--email">
      <FaEnvelope /> Email
    </span>
  );
};

const AdminAILenderCampaignHistoryPanel = ({ segment, segmentLabel, onClose }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const batchIdFromQuery = searchParams.get("batchId") || "";
  const filterFromQuery = searchParams.get("filter") || "";
  const batchDetailMode = Boolean(batchIdFromQuery);
  const [channelFilter, setChannelFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [runs, setRuns] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pageNo, setPageNo] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);
  const [deliveriesError, setDeliveriesError] = useState("");
  const [deliveryPageNo, setDeliveryPageNo] = useState(1);
  const [deliveryTotalCount, setDeliveryTotalCount] = useState(0);
  const [batchFailedTotal, setBatchFailedTotal] = useState(0);
  const [cachedFailedDeliveries, setCachedFailedDeliveries] = useState([]);
  const [cachedFailedBatchId, setCachedFailedBatchId] = useState("");
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState(
    filterFromQuery === "failed" ? "failed" : ""
  );
  const [exportingFailed, setExportingFailed] = useState(false);
  const [sendingAdminReport, setSendingAdminReport] = useState(false);
  const [adminReportStatus, setAdminReportStatus] = useState("");
  const [reportTargetChoice, setReportTargetChoice] = useState(null);
  const detailSectionRef = useRef(null);

  const effectiveDeliveryFilter = filterFromQuery === "failed" ? "failed" : deliveryStatusFilter;

  const pageSize = 10;
  const deliveryPageSize = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const deliveryTotalPages = Math.max(1, Math.ceil(deliveryTotalCount / deliveryPageSize));

  const titleSuffix = segmentLabel || segment || "All segments";

  const buildHistoryUrl = (run, failedOnly = false) => {
    const params = new URLSearchParams();
    if (segment) params.set("segment", segment);
    params.set("segmentLabel", titleSuffix);
    if (run?.batchId) params.set("batchId", run.batchId);
    if (run?.campaignTitle) params.set("campaignTitle", run.campaignTitle);
    if (run?.failedCount != null) params.set("failedCount", String(run.failedCount));
    if (run?.successCount != null) params.set("successCount", String(run.successCount));
    if (run?.totalCount != null) params.set("totalCount", String(run.totalCount));
    if (failedOnly) params.set("filter", "failed");
    return `/adminAICampaignHistory?${params.toString()}`;
  };

  const openBatchDetail = (run, failedOnly = false) => {
    navigate(buildHistoryUrl(run, failedOnly));
  };

  const closeBatchDetail = () => {
    if (onClose) {
      onClose();
      return;
    }
    navigate("/adminAIDashboard");
  };

  const backToHistoryList = () => {
    const params = new URLSearchParams();
    if (segment) params.set("segment", segment);
    params.set("segmentLabel", titleSuffix);
    navigate(`/adminAICampaignHistory?${params.toString()}`);
  };

  const loadHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminAILenderCampaignHistory(segment, {
        channel: channelFilter || undefined,
        pageNo,
        pageSize,
      });
      if (data?.status === "FAILED") {
        throw new Error(data?.message || "Failed to load campaign history.");
      }
      setRuns(Array.isArray(data?.runs) ? data.runs : []);
      setSummary(data?.summary || null);
      setTotalCount(Number(data?.totalCount) || 0);
    } catch (err) {
      setRuns([]);
      setSummary(null);
      setTotalCount(0);
      setError(err?.message || "Failed to load campaign history.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendAdminReport = async (batchId, target) => {
    const targetBatchId = batchId || selectedBatch?.batchId || "";
    if (!target || (target !== "personal" && target !== "group")) {
      setReportTargetChoice({ batchId: targetBatchId });
      return;
    }

    const targetLabel = target === "group" ? "WhatsApp group" : "personal admin number";
    const confirmText = targetBatchId
      ? `Send WhatsApp campaign report for batch ${targetBatchId} to ${targetLabel}?`
      : `Send today's campaign summary report to ${targetLabel}?`;
    if (!window.confirm(confirmText)) {
      return;
    }

    setReportTargetChoice(null);
    setSendingAdminReport(true);
    setAdminReportStatus("");
    try {
      const data = await sendAdminAILenderCampaignAdminReport({
        batchId: targetBatchId || undefined,
        target,
      });
      if (data?.status === "SUCCESS" || data?.status === "PARTIAL") {
        const sentTo = target === "group" ? "WhatsApp group only" : "personal admin number only";
        const deliveredTo = data?.deliveryResults
          ? Object.keys(data.deliveryResults).join(", ")
          : "";
        setAdminReportStatus(
          data?.message || `WhatsApp report sent to ${sentTo}.${deliveredTo ? ` (${deliveredTo})` : ""}`
        );
      } else if (data?.status === "SKIPPED") {
        setAdminReportStatus(data?.message || "Report skipped (disabled in server config).");
      } else {
        throw new Error(data?.message || "Failed to send WhatsApp report.");
      }
    } catch (err) {
      const serverMessage = err?.response?.data?.message || err?.response?.data?.errorMessage;
      setAdminReportStatus(serverMessage || err?.message || "Failed to send WhatsApp report.");
    } finally {
      setSendingAdminReport(false);
    }
  };

  const loadDeliveries = async (batchId, page = 1, statusFilter = effectiveDeliveryFilter) => {
    if (!batchId) return;
    setDeliveriesLoading(true);
    setDeliveriesError("");
    const wantFailed = statusFilter === "failed";
    try {
      if (wantFailed) {
        let failedRows = [];
        try {
          failedRows = (await fetchAllCampaignFailedDeliveries(batchId)).filter(isCampaignDeliveryFailed);
        } catch (fetchErr) {
          setDeliveriesError(fetchErr?.message || "Failed to load failed delivery details.");
          return;
        }
        setCachedFailedDeliveries(failedRows);
        setCachedFailedBatchId(batchId);
        setDeliveries(failedRows);
        setDeliveryTotalCount(failedRows.length);
        setBatchFailedTotal(failedRows.length);
        setDeliveryPageNo(1);
        const expectedFailed = Number(selectedBatch?.failedCount) || Number(searchParams.get("failedCount")) || 0;
        if (!failedRows.length && expectedFailed > 0) {
          setDeliveriesError(
            `Expected ${fmtNum(expectedFailed)} failed users, but none were found in email_tracking for batch ${batchId}. Deploy the latest backend and try again.`
          );
        }
        return;
      }

      setCachedFailedDeliveries([]);
      setCachedFailedBatchId("");

      const data = await getAdminAILenderCampaignBatchDeliveries(batchId, {
        pageNo: page,
        pageSize: deliveryPageSize,
      });
      if (data?.status === "FAILED") {
        throw new Error(data?.message || "Failed to load delivery details.");
      }
      const rows = Array.isArray(data?.deliveries) ? data.deliveries : [];
      setDeliveries(rows);
      setDeliveryTotalCount(Number(data?.totalCount) || 0);
      setBatchFailedTotal(Number(data?.batchFailedTotal) || 0);
      setDeliveryPageNo(page);
    } catch (err) {
      setDeliveries([]);
      setDeliveryTotalCount(0);
      setBatchFailedTotal(0);
      setDeliveriesError(err?.message || "Failed to load delivery details.");
    } finally {
      setDeliveriesLoading(false);
    }
  };

  const downloadFailedAsExcel = async () => {
    if (!selectedBatch?.batchId) return;
    setExportingFailed(true);
    setDeliveriesError("");
    try {
      setCachedFailedDeliveries([]);
      setCachedFailedBatchId("");
      const failedRows = (await fetchAllCampaignFailedDeliveries(selectedBatch.batchId)).filter(isCampaignDeliveryFailed);
      if (!failedRows.length) {
        setDeliveriesError(
          Number(selectedBatch?.failedCount) > 0
            ? `Expected ${fmtNum(selectedBatch.failedCount)} failed users, but no failure logs were found. Restart the backend and try again.`
            : "No failed users found for this batch."
        );
        return;
      }
      const xml = buildFailedDeliveriesExcelXml(failedRows);
      const fileName = `campaign-failed-${selectedBatch.batchId}.xls`;
      saveAs(new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8;" }), fileName);
      setDeliveryTotalCount(failedRows.length);
      setBatchFailedTotal(failedRows.length);
      setCachedFailedDeliveries(failedRows);
      setCachedFailedBatchId(selectedBatch.batchId);
    } catch (err) {
      setDeliveriesError(err?.message || "Failed to download failed users.");
    } finally {
      setExportingFailed(false);
    }
  };

  useEffect(() => {
    setCachedFailedDeliveries([]);
    setCachedFailedBatchId("");
    setDeliveryPageNo(1);
  }, [batchIdFromQuery]);

  useEffect(() => {
    setDeliveryStatusFilter(filterFromQuery === "failed" ? "failed" : "");
  }, [filterFromQuery]);

  useEffect(() => {
    if (batchDetailMode) return;
    setPageNo(1);
    setSelectedBatch(null);
    setDeliveries([]);
    setChannelFilter("");
  }, [segment, segmentLabel, batchDetailMode]);

  useEffect(() => {
    if (!batchIdFromQuery) {
      return;
    }
    const match = runs.find((run) => String(run.batchId) === String(batchIdFromQuery));
    if (match) {
      setSelectedBatch(match);
      return;
    }
    setSelectedBatch({
      batchId: batchIdFromQuery,
      segment,
      segmentLabel: titleSuffix,
      campaignTitle: searchParams.get("campaignTitle") || batchIdFromQuery,
      failedCount: Number(searchParams.get("failedCount")) || 0,
      successCount: Number(searchParams.get("successCount")) || 0,
      totalCount: Number(searchParams.get("totalCount")) || 0,
    });
  }, [runs, batchIdFromQuery, segment, titleSuffix, searchParams]);

  useEffect(() => {
    if (batchDetailMode) return;
    loadHistory();
  }, [segment, channelFilter, pageNo, batchDetailMode]);

  useEffect(() => {
    if (!batchDetailMode) return;
    loadHistory();
  }, [segment, channelFilter, batchDetailMode]);

  useEffect(() => {
    if (!selectedBatch?.batchId) return;
    loadDeliveries(selectedBatch.batchId, 1, effectiveDeliveryFilter);
  }, [selectedBatch?.batchId, selectedBatch?.failedCount, effectiveDeliveryFilter]);

  useEffect(() => {
    if (!batchDetailMode || deliveriesLoading) return;
    detailSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [batchDetailMode, selectedBatch?.batchId, deliveriesLoading]);

  const headerStats = useMemo(() => {
    const success = Number(summary?.successDeliveries) || 0;
    const failed = Number(summary?.failedDeliveries) || 0;
    const runsCount = Number(summary?.totalRuns) || totalCount;
    return { success, failed, runsCount };
  }, [summary, totalCount]);

  const visibleDeliveries = useMemo(() => {
    if (effectiveDeliveryFilter !== "failed") {
      return deliveries;
    }
    return deliveries.filter(isCampaignDeliveryFailed);
  }, [deliveries, effectiveDeliveryFilter]);

  const actualFailedCount = useMemo(
    () => visibleDeliveries.length,
    [visibleDeliveries]
  );

  const failedUsersTotal = useMemo(() => {
    if (effectiveDeliveryFilter === "failed") {
      if (actualFailedCount > 0) {
        return actualFailedCount;
      }
      return batchFailedTotal || Number(selectedBatch?.failedCount) || Number(searchParams.get("failedCount")) || 0;
    }
    return Number(selectedBatch?.failedCount) || batchFailedTotal || 0;
  }, [
    actualFailedCount,
    batchFailedTotal,
    effectiveDeliveryFilter,
    searchParams,
    selectedBatch?.failedCount,
  ]);

  const goToDeliveryPage = (page) => {
    if (!selectedBatch?.batchId) return;
    if (effectiveDeliveryFilter === "failed") {
      return;
    }
    loadDeliveries(selectedBatch.batchId, page, effectiveDeliveryFilter);
  };

  const updateDeliveryFilter = (nextFilter) => {
    setDeliveryStatusFilter(nextFilter);
    const params = new URLSearchParams(searchParams);
    if (nextFilter === "failed") {
      params.set("filter", "failed");
    } else {
      params.delete("filter");
    }
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="admin-ai-campaign-history-section admin-ai-campaign-history-section--inline">
      <div className="admin-ai-campaign-history-header-box">
        <div className="admin-ai-campaign-history-header-main">
          <span className="admin-ai-campaign-history-icon">
            <FaHistory />
          </span>
          <div>
            <h5>
              {batchDetailMode
                ? `Campaign Run — ${selectedBatch?.campaignTitle || batchIdFromQuery}`
                : `Campaign History — ${titleSuffix}`}
            </h5>
            <p>
              {batchDetailMode
                ? "Per-recipient delivery status for this campaign batch. Filter failed users or download Excel."
                : "Loaded from email_tracking (and scheduled campaigns). Click View to open delivery details on the next page."}
            </p>
          </div>
        </div>
        <div className="admin-ai-campaign-history-header-stats">
          {!batchDetailMode ? (
            <>
              <div className="admin-ai-campaign-header-stat">
                <small>Runs</small>
                <strong>{fmtNum(headerStats.runsCount)}</strong>
              </div>
              <div className="admin-ai-campaign-header-stat">
                <small>Success</small>
                <strong className="is-success">{fmtNum(headerStats.success)}</strong>
              </div>
              <div className="admin-ai-campaign-header-stat">
                <small>Failed</small>
                <strong className="is-failed">{fmtNum(headerStats.failed)}</strong>
              </div>
              <button type="button" className="admin-ai-campaign-header-refresh" onClick={loadHistory}>
                Refresh
              </button>
              <button
                type="button"
                className="admin-ai-campaign-header-refresh"
                onClick={() => handleSendAdminReport()}
                disabled={sendingAdminReport}
              >
                <FaWhatsapp /> {sendingAdminReport ? "Sending..." : "Send daily report"}
              </button>
              {reportTargetChoice && !reportTargetChoice.batchId ? (
                <div className="admin-ai-campaign-report-target-pick">
                  <span>Send daily report to:</span>
                  <button type="button" onClick={() => handleSendAdminReport("", "personal")} disabled={sendingAdminReport}>
                    Personal number
                  </button>
                  <button type="button" onClick={() => handleSendAdminReport("", "group")} disabled={sendingAdminReport}>
                    WhatsApp group
                  </button>
                  <button type="button" className="admin-ai-reset-btn" onClick={() => setReportTargetChoice(null)}>
                    Cancel
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <button type="button" className="admin-ai-reset-btn" onClick={backToHistoryList}>
                Back to list
              </button>
              <button type="button" className="admin-ai-close-btn" onClick={closeBatchDetail}>
                Close
              </button>
            </>
          )}
          {onClose && !batchDetailMode ? (
            <button type="button" className="admin-ai-icon-close-btn" onClick={onClose} aria-label="Close campaign history">
              <FaTimes />
            </button>
          ) : null}
        </div>
      </div>

      {!batchDetailMode ? (
      <div className="admin-ai-campaign-report-filters">
        <button
          type="button"
          className={channelFilter === "" ? "active" : ""}
          onClick={() => {
            setChannelFilter("");
            setPageNo(1);
          }}
        >
          All channels
        </button>
        <button
          type="button"
          className={channelFilter === "email" ? "active" : ""}
          onClick={() => {
            setChannelFilter("email");
            setPageNo(1);
          }}
        >
          <FaEnvelope /> Email
        </button>
        <button
          type="button"
          className={channelFilter === "whatsapp" ? "active" : ""}
          onClick={() => {
            setChannelFilter("whatsapp");
            setPageNo(1);
          }}
        >
          <FaWhatsapp /> WhatsApp
        </button>
      </div>
      ) : null}

      {!batchDetailMode && error ? <div className="admin-ai-inline-error">{error}</div> : null}
      {!batchDetailMode && adminReportStatus ? <div className="admin-ai-inline-status">{adminReportStatus}</div> : null}
      {!batchDetailMode && loading ? <div className="admin-ai-inline-loading">Loading campaign history...</div> : null}

      {!batchDetailMode && !loading && !error && runs.length === 0 ? (
        <div className="admin-ai-empty-state">
          {segment ? "No campaigns sent for this segment yet." : "No campaign runs found in email_tracking yet."}
        </div>
      ) : null}

      {!batchDetailMode && !loading && runs.length > 0 ? (
        <div className="admin-ai-advanced-table-wrap">
          <table className="admin-ai-campaign-report-table">
            <thead>
              <tr>
                <th>Sent at</th>
                <th>Channel</th>
                <th>Campaign</th>
                <th>Segment</th>
                <th>Status</th>
                <th className="admin-ai-campaign-col-num">Success</th>
                <th className="admin-ai-campaign-col-num">Failed</th>
                <th className="admin-ai-campaign-col-num">Total</th>
                <th className="admin-ai-campaign-col-action" />
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr
                  key={`${run.batchId}-${run.sentAt}`}
                  className={selectedBatch?.batchId === run.batchId ? "is-selected" : ""}
                >
                  <td>
                    <div>{formatDateTime(run.sentAt)}</div>
                    {run.scheduledAt ? (
                      <small className="admin-ai-campaign-subtext">
                        Scheduled {formatDateTime(run.scheduledAt)}
                        {run.scheduleDateIst && run.scheduleTimeIst
                          ? ` (${run.scheduleDateIst} ${run.scheduleTimeIst} IST)`
                          : ""}
                      </small>
                    ) : null}
                  </td>
                  <td>
                    <ChannelBadge channel={run.channel} />
                    {run.testMode ? <small className="admin-ai-campaign-test-pill">Test</small> : null}
                  </td>
                  <td>{run.campaignTitle || "-"}</td>
                  <td>{run.segmentLabel || run.segment || "-"}</td>
                  <td>
                    <span className={`admin-ai-campaign-status-pill ${statusClass(run.status)}`}>
                      {run.status || "-"}
                    </span>
                  </td>
                  <td className="admin-ai-campaign-col-num">{fmtNum(run.successCount)}</td>
                  <td className="admin-ai-campaign-col-num">
                    {Number(run.failedCount) > 0 ? (
                      <button
                        type="button"
                        className="admin-ai-campaign-failed-link"
                        onClick={() => openBatchDetail(run, true)}
                      >
                        {fmtNum(run.failedCount)}
                      </button>
                    ) : (
                      fmtNum(run.failedCount)
                    )}
                  </td>
                  <td className="admin-ai-campaign-col-num">{fmtNum(run.totalCount)}</td>
                  <td className="admin-ai-campaign-col-action">
                    <button
                      type="button"
                      className="admin-ai-campaign-detail-btn"
                      onClick={() => openBatchDetail(run, Number(run.failedCount) > 0)}
                    >
                      {Number(run.failedCount) > 0 ? "View failed" : "View"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!batchDetailMode && totalPages > 1 ? (
        <div className="admin-ai-pager">
          <button type="button" disabled={pageNo <= 1} onClick={() => setPageNo((p) => Math.max(1, p - 1))}>
            Previous
          </button>
          <span>
            Page {pageNo} of {totalPages}
          </span>
          <button
            type="button"
            disabled={pageNo >= totalPages}
            onClick={() => setPageNo((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      ) : null}

      {(selectedBatch || batchDetailMode) ? (
        <div className="admin-ai-campaign-report" ref={detailSectionRef}>
          <div className="admin-ai-campaign-report-head">
            <h6>Delivery details — {selectedBatch?.campaignTitle || selectedBatch?.batchId || batchIdFromQuery}</h6>
            <p>
              Batch {selectedBatch?.batchId || batchIdFromQuery} · {selectedBatch?.segmentLabel || selectedBatch?.segment || titleSuffix}
              {effectiveDeliveryFilter === "failed"
                ? ` · ${fmtNum(failedUsersTotal)} failed user(s)`
                : ""}
            </p>
            <div className="admin-ai-campaign-report-filters">
              <button
                type="button"
                className={effectiveDeliveryFilter === "" ? "active" : ""}
                onClick={() => updateDeliveryFilter("")}
              >
                All users
              </button>
              <button
                type="button"
                className={effectiveDeliveryFilter === "failed" ? "active" : ""}
                onClick={() => updateDeliveryFilter("failed")}
              >
                Failed ({fmtNum(failedUsersTotal || selectedBatch?.failedCount || 0)})
              </button>
              <button
                type="button"
                className="admin-ai-campaign-header-refresh"
                onClick={downloadFailedAsExcel}
                disabled={exportingFailed || !(failedUsersTotal || selectedBatch?.failedCount)}
              >
                <FaFileExcel /> {exportingFailed ? "Preparing..." : `Download failed Excel (${fmtNum(failedUsersTotal || selectedBatch?.failedCount || 0)})`}
              </button>
              <button
                type="button"
                className="admin-ai-campaign-header-refresh"
                onClick={() => handleSendAdminReport(selectedBatch?.batchId || batchIdFromQuery)}
                disabled={sendingAdminReport || !(selectedBatch?.batchId || batchIdFromQuery)}
              >
                <FaWhatsapp /> {sendingAdminReport ? "Sending..." : "Send WhatsApp report"}
              </button>
            </div>
            {reportTargetChoice?.batchId ? (
              <div className="admin-ai-campaign-report-target-pick">
                <span>
                  Send batch report{reportTargetChoice.batchId ? ` (${reportTargetChoice.batchId})` : ""} to:
                </span>
                <button
                  type="button"
                  onClick={() => handleSendAdminReport(reportTargetChoice.batchId, "personal")}
                  disabled={sendingAdminReport}
                >
                  Personal number
                </button>
                <button
                  type="button"
                  onClick={() => handleSendAdminReport(reportTargetChoice.batchId, "group")}
                  disabled={sendingAdminReport}
                >
                  WhatsApp group
                </button>
                <button type="button" className="admin-ai-reset-btn" onClick={() => setReportTargetChoice(null)}>
                  Cancel
                </button>
              </div>
            ) : null}
          </div>
          {adminReportStatus ? <div className="admin-ai-inline-status">{adminReportStatus}</div> : null}
          {deliveriesError ? <div className="admin-ai-inline-error">{deliveriesError}</div> : null}
          {deliveriesLoading ? (
            <div className="admin-ai-inline-loading">
              {effectiveDeliveryFilter === "failed"
                ? `Loading all failed users${selectedBatch?.failedCount ? ` (${fmtNum(selectedBatch.failedCount)} expected)...` : "..."}`
                : "Loading deliveries..."}
            </div>
          ) : null}
          {!deliveriesLoading && deliveries.length === 0 && !deliveriesError ? (
            <div className="admin-ai-empty-state">
              {effectiveDeliveryFilter === "failed"
                ? selectedBatch?.source === "scheduled"
                  ? `This campaign reported ${fmtNum(selectedBatch?.failedCount || 0)} failures, but no per-user failure logs are stored in email_tracking yet.`
                  : Number(selectedBatch?.failedCount) > 0
                    ? `Expected ${fmtNum(selectedBatch?.failedCount)} failed users, but none were loaded. Restart the backend and open this batch again.`
                    : "No failed users found for this batch."
                : selectedBatch?.source === "scheduled" && selectedBatch?.status === "PENDING"
                ? "Campaign is scheduled and has not been sent yet."
                : "No per-recipient delivery logs for this batch."}
            </div>
          ) : null}
          {deliveryTotalCount > 0 ? (
            <div className="admin-ai-campaign-report-summary">
              {effectiveDeliveryFilter === "failed"
                ? `Showing all ${fmtNum(failedUsersTotal)} failed user(s) at once`
                : (
                  <>
                    Showing {fmtNum(((deliveryPageNo - 1) * deliveryPageSize) + 1)}–
                    {fmtNum(Math.min(deliveryPageNo * deliveryPageSize, deliveryTotalCount))} of{" "}
                    {fmtNum(deliveryTotalCount)} deliveries
                  </>
                )}
            </div>
          ) : null}
          {!deliveriesLoading && visibleDeliveries.length > 0 ? (
            <div className="admin-ai-advanced-table-wrap">
              <table className="admin-ai-campaign-report-table">
                <thead>
                  <tr>
                    <th>Sent at</th>
                    <th>Lender</th>
                    <th>Recipient</th>
                    <th>Channel</th>
                    <th>Status</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleDeliveries.map((row) => (
                    <tr key={row.id || `${row.batchId}-${row.recipient}-${row.sentAt}`}>
                      <td>{formatDateTime(row.sentAt)}</td>
                      <td>
                        {row.lenderName || "-"}
                        {row.lenderId ? <small className="admin-ai-campaign-subtext">LR{row.lenderId}</small> : null}
                      </td>
                      <td>{row.recipient || row.email || row.mobileNumber || "-"}</td>
                      <td>
                        <ChannelBadge channel={row.channel} />
                      </td>
                      <td>
                        <span className={`admin-ai-campaign-status-pill ${statusClass(row.status)}`}>
                          {row.status || "-"}
                        </span>
                      </td>
                      <td>{row.errorMessage || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {effectiveDeliveryFilter !== "failed" && (deliveryTotalPages > 1 || deliveryTotalCount > deliveryPageSize) ? (
            <div className="admin-ai-pager">
              <button
                type="button"
                disabled={deliveryPageNo <= 1}
                onClick={() => goToDeliveryPage(deliveryPageNo - 1)}
              >
                Previous
              </button>
              <span>
                Page {deliveryPageNo} of {deliveryTotalPages}
              </span>
              <button
                type="button"
                disabled={deliveryPageNo >= deliveryTotalPages}
                onClick={() => goToDeliveryPage(deliveryPageNo + 1)}
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default AdminAILenderCampaignHistoryPanel;
