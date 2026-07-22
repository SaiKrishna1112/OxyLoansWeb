import React, { useEffect, useMemo, useState } from "react";
import { FaEnvelope, FaHistory, FaTimes, FaWhatsapp } from "react-icons/fa";
import {
  getAdminAILenderCampaignBatchDeliveries,
  getAdminAILenderCampaignHistory,
} from "../../../HttpRequest/admin";

const fmtNum = (n) => (n == null ? "0" : Number(n).toLocaleString("en-IN"));

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 19).replace("T", " ");
  return date.toLocaleString("en-IN");
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

const AdminAILenderCampaignHistoryModal = ({ open, onClose, segment, segmentLabel }) => {
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

  const pageSize = 10;
  const deliveryPageSize = 20;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const deliveryTotalPages = Math.max(1, Math.ceil(deliveryTotalCount / deliveryPageSize));

  const loadHistory = async () => {
    if (!segment) return;
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

  const loadDeliveries = async (batchId, page = 1) => {
    if (!batchId) return;
    setDeliveriesLoading(true);
    setDeliveriesError("");
    try {
      const data = await getAdminAILenderCampaignBatchDeliveries(batchId, {
        pageNo: page,
        pageSize: deliveryPageSize,
      });
      if (data?.status === "FAILED") {
        throw new Error(data?.message || "Failed to load delivery details.");
      }
      setDeliveries(Array.isArray(data?.deliveries) ? data.deliveries : []);
      setDeliveryTotalCount(Number(data?.totalCount) || 0);
      setDeliveryPageNo(page);
    } catch (err) {
      setDeliveries([]);
      setDeliveryTotalCount(0);
      setDeliveriesError(err?.message || "Failed to load delivery details.");
    } finally {
      setDeliveriesLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setPageNo(1);
    setSelectedBatch(null);
    setDeliveries([]);
    setChannelFilter("");
  }, [open, segment]);

  useEffect(() => {
    if (!open || !segment) return;
    loadHistory();
  }, [open, segment, channelFilter, pageNo]);

  useEffect(() => {
    if (!selectedBatch?.batchId) return;
    loadDeliveries(selectedBatch.batchId, 1);
  }, [selectedBatch?.batchId]);

  const headerStats = useMemo(() => {
    const success = Number(summary?.successDeliveries) || 0;
    const failed = Number(summary?.failedDeliveries) || 0;
    const runsCount = Number(summary?.totalRuns) || totalCount;
    return { success, failed, runsCount };
  }, [summary, totalCount]);

  if (!open) return null;

  return (
    <div className="admin-ai-modal-overlay" onClick={onClose}>
      <div
        className="admin-ai-modal admin-ai-modal--wide admin-ai-campaign-history-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-ai-campaign-history-section">
          <div className="admin-ai-campaign-history-header-box">
            <div className="admin-ai-campaign-history-header-main">
              <span className="admin-ai-campaign-history-icon">
                <FaHistory />
              </span>
              <div>
                <h5>Campaign History — {segmentLabel || segment}</h5>
                <p>
                  Email and WhatsApp campaigns sent to this segment. Click a run to see per-recipient delivery status.
                </p>
              </div>
            </div>
            <div className="admin-ai-campaign-history-header-stats">
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
              <button type="button" className="admin-ai-modal-close" onClick={onClose} aria-label="Close">
                <FaTimes />
              </button>
            </div>
          </div>

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

          {error ? <div className="admin-ai-inline-error">{error}</div> : null}
          {loading ? <div className="admin-ai-inline-loading">Loading campaign history...</div> : null}

          {!loading && !error && runs.length === 0 ? (
            <div className="admin-ai-empty-state">No campaigns sent for this segment yet.</div>
          ) : null}

          {!loading && runs.length > 0 ? (
            <div className="admin-ai-advanced-table-wrap">
              <table className="admin-ai-campaign-report-table">
                <thead>
                  <tr>
                    <th>Sent at</th>
                    <th>Channel</th>
                    <th>Campaign</th>
                    <th>Segment</th>
                    <th>Status</th>
                    <th>Success</th>
                    <th>Failed</th>
                    <th>Total</th>
                    <th />
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
                      <td>{run.segmentLabel || run.segment || segmentLabel || segment}</td>
                      <td>
                        <span className={`admin-ai-campaign-status-pill ${statusClass(run.status)}`}>
                          {run.status || "-"}
                        </span>
                      </td>
                      <td>{fmtNum(run.successCount)}</td>
                      <td>{fmtNum(run.failedCount)}</td>
                      <td>{fmtNum(run.totalCount)}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-ai-campaign-detail-btn"
                          onClick={() => setSelectedBatch(run)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {totalPages > 1 ? (
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

          {selectedBatch ? (
            <div className="admin-ai-campaign-report">
              <div className="admin-ai-campaign-report-head">
                <h6>
                  Delivery details — {selectedBatch.campaignTitle || selectedBatch.batchId}
                </h6>
                <p>
                  Batch {selectedBatch.batchId} · {selectedBatch.segmentLabel || selectedBatch.segment}
                </p>
              </div>
              {deliveriesError ? <div className="admin-ai-inline-error">{deliveriesError}</div> : null}
              {deliveriesLoading ? <div className="admin-ai-inline-loading">Loading deliveries...</div> : null}
              {!deliveriesLoading && deliveries.length === 0 && !deliveriesError ? (
                <div className="admin-ai-empty-state">
                  {selectedBatch.source === "scheduled" && selectedBatch.status === "PENDING"
                    ? "Campaign is scheduled and has not been sent yet."
                    : "No per-recipient delivery logs for this batch."}
                </div>
              ) : null}
              {!deliveriesLoading && deliveries.length > 0 ? (
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
                      {deliveries.map((row) => (
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
              {deliveryTotalPages > 1 ? (
                <div className="admin-ai-pager">
                  <button
                    type="button"
                    disabled={deliveryPageNo <= 1}
                    onClick={() => loadDeliveries(selectedBatch.batchId, deliveryPageNo - 1)}
                  >
                    Previous
                  </button>
                  <span>
                    Page {deliveryPageNo} of {deliveryTotalPages}
                  </span>
                  <button
                    type="button"
                    disabled={deliveryPageNo >= deliveryTotalPages}
                    onClick={() => loadDeliveries(selectedBatch.batchId, deliveryPageNo + 1)}
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default AdminAILenderCampaignHistoryModal;
