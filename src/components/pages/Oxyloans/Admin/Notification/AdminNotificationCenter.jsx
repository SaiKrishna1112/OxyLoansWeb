import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Table, Tag, Drawer, Progress, Spin, Tooltip, Button as AntButton } from "antd";
import {
  ReloadOutlined,
  SendOutlined,
  EyeOutlined,
  CopyOutlined,
  DeleteOutlined,
  BellOutlined,
  HistoryOutlined,
  BarChartOutlined,
  CloudServerOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import Swal from "sweetalert2";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";
import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
import Footer from "../../../../Footer/Footer";
import {
  sendAdminNotificationAll,
  sendAdminNotificationSegment,
  sendAdminNotificationLimited,
  sendAdminNotificationIndividual,
  getAdminNotifications,
  getAdminNotificationDispatchStatus,
  getAdminNotificationAnalytics,
  deleteAdminNotification,
  duplicateAdminNotification,
  getAdminNotificationStatistics,
  getAdminNotificationAvgReadPercentage,
} from "../../../../HttpRequest/admin";
import {
  NOTIFICATION_TYPES,
  PRIORITIES,
  SEGMENTS,
  AUDIENCE_MODES,
  DISPATCH_STATUS_COLORS,
} from "./notificationConstants";
import "./AdminNotificationCenter.css";
import { BASE_URL } from "../../../../../config";

const TITLE_MAX = 120;
const MESSAGE_MAX = 500;

const parseUserIds = (raw) => {
  if (!raw || !raw.trim()) return [];
  return [...new Set(
    raw
      .split(/[\s,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter((n) => Number.isFinite(n) && n > 0)
  )];
};

const formatDate = (value) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return String(value);
  }
};

const AdminNotificationCenter = () => {
  const [activeTab, setActiveTab] = useState("compose");

  // Compose state
  const [audienceMode, setAudienceMode] = useState("all");
  const [notificationType, setNotificationType] = useState("CAMPAIGN_STARTED");
  const [priority, setPriority] = useState("HIGH");
  const [segment, setSegment] = useState("ACTIVE_LENDERS");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [userId, setUserId] = useState("");
  const [userIdsRaw, setUserIdsRaw] = useState("");
  const [sendInApp, setSendInApp] = useState(true);
  const [sendPush, setSendPush] = useState(true);
  const [sending, setSending] = useState(false);

  // History state
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historySize] = useState(10);
  const [dispatchMap, setDispatchMap] = useState({});

  // Analytics state
  const [statsLoading, setStatsLoading] = useState(false);
  const [avgReadPct, setAvgReadPct] = useState(0);
  const [typeStats, setTypeStats] = useState(null);

  // Detail drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedAnalytics, setSelectedAnalytics] = useState(null);
  const [selectedDispatch, setSelectedDispatch] = useState(null);

  const parsedUserIds = useMemo(() => parseUserIds(userIdsRaw), [userIdsRaw]);

  const loadHistory = useCallback(async (page = historyPage) => {
    setHistoryLoading(true);
    try {
      const res = await getAdminNotifications(page, historySize);
      const data = res.data?.data;
      setHistory(data?.content || []);
      setHistoryTotal(data?.totalElements || 0);
      setHistoryPage(page);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Could not load history",
        text: err.response?.data?.error || err.message,
      });
    } finally {
      setHistoryLoading(false);
    }
  }, [historyPage, historySize]);

  const refreshDispatchForRows = useCallback(async (rows) => {
    const pending = rows.filter((r) => {
      const status = r.dispatchStatus;
      return status === "QUEUED" || status === "PROCESSING";
    });
    if (!pending.length) return;

    const updates = {};
    await Promise.all(
      pending.map(async (row) => {
        try {
          const res = await getAdminNotificationDispatchStatus(row.id);
          updates[row.id] = res.data?.data;
        } catch {
          /* ignore polling errors */
        }
      })
    );
    if (Object.keys(updates).length) {
      setDispatchMap((prev) => ({ ...prev, ...updates }));
      setHistory((prev) =>
        prev.map((row) =>
          updates[row.id]
            ? { ...row, dispatchStatus: updates[row.id].dispatchStatus, processedRecipients: updates[row.id].processedRecipients, totalRecipients: updates[row.id].totalRecipients }
            : row
        )
      );
    }
  }, []);

  const loadAnalyticsSummary = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [avgRes, statsRes] = await Promise.all([
        getAdminNotificationAvgReadPercentage(),
        getAdminNotificationStatistics(),
      ]);
      setAvgReadPct(avgRes.data?.data?.averageReadPercentage ?? 0);
      setTypeStats(statsRes.data?.data || null);
    } catch (err) {
      console.error("Analytics load failed", err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "history") {
      loadHistory(0);
    }
    if (activeTab === "analytics") {
      loadAnalyticsSummary();
    }
  }, [activeTab, loadHistory, loadAnalyticsSummary]);

  useEffect(() => {
    if (activeTab !== "history" || !history.length) return;
    refreshDispatchForRows(history);
    const timer = setInterval(() => refreshDispatchForRows(history), 5000);
    return () => clearInterval(timer);
  }, [activeTab, history, refreshDispatchForRows]);

  const buildPayload = () => ({
    notificationType,
    title: title.trim(),
    message: message.trim(),
    redirectUrl: redirectUrl.trim() || undefined,
    priority,
    campaignId: campaignId.trim() || undefined,
    sendInApp,
    sendPush,
  });

  const validateForm = () => {
    if (!title.trim()) return "Title is required.";
    if (!message.trim()) return "Message is required.";
    if (title.trim().length > TITLE_MAX) return `Title must be under ${TITLE_MAX} characters.`;
    if (message.trim().length > MESSAGE_MAX) return `Message must be under ${MESSAGE_MAX} characters.`;
    if (!sendInApp && !sendPush) return "Enable at least one channel: In-App or Push.";
    if (audienceMode === "individual") {
      const id = Number(userId);
      if (!Number.isFinite(id) || id <= 0) return "Enter a valid user ID.";
    }
    if (audienceMode === "limited" && parsedUserIds.length === 0) {
      return "Enter at least one valid user ID (comma or newline separated).";
    }
    return null;
  };

  const handleSend = async () => {
    const error = validateForm();
    if (error) {
      Swal.fire({ icon: "warning", title: "Check form", text: error });
      return;
    }

    const audienceLabel = AUDIENCE_MODES.find((m) => m.value === audienceMode)?.label || audienceMode;
    const confirm = await Swal.fire({
      icon: "question",
      title: "Send notification?",
      html: `<div style="text-align:left">
        <strong>Audience:</strong> ${audienceLabel}<br/>
        <strong>Title:</strong> ${title.trim()}<br/>
        <strong>Channels:</strong> ${sendInApp ? "In-App" : ""}${sendInApp && sendPush ? " + " : ""}${sendPush ? "Push" : ""}
      </div>`,
      showCancelButton: true,
      confirmButtonText: "Send now",
      confirmButtonColor: "#2563eb",
    });
    if (!confirm.isConfirmed) return;

    setSending(true);
    try {
      const payload = buildPayload();
      let res;

      if (audienceMode === "all") {
        res = await sendAdminNotificationAll(payload);
      } else if (audienceMode === "segment") {
        res = await sendAdminNotificationSegment({ ...payload, recipientSegment: segment });
      } else if (audienceMode === "limited") {
        res = await sendAdminNotificationLimited({
          ...payload,
          recipientUserIds: parsedUserIds,
        });
      } else {
        res = await sendAdminNotificationIndividual({
          ...payload,
          userId: Number(userId),
        });
      }

      const notificationId = res.data?.data?.id;
      const dispatchStatus = res.data?.data?.dispatchStatus;
      const isQueued = dispatchStatus === "QUEUED" || res.status === 202;

      await Swal.fire({
        icon: "success",
        title: isQueued ? "Notification queued" : "Notification sent",
        text: notificationId
          ? `Notification ID: ${notificationId}. Track delivery in the History tab.`
          : "Users will receive in-app and push notifications shortly.",
      });

      setTitle("");
      setMessage("");
      setRedirectUrl("");
      setCampaignId("");
      setUserId("");
      setUserIdsRaw("");
      setActiveTab("history");
      loadHistory(0);
    } catch (err) {
      const status = err.response?.status;
      const serverMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message;
      const text =
        status === 401
          ? `${serverMsg || "Session expired or invalid."} Log out, then log in again at the production URL before sending notifications.`
          : serverMsg;
      Swal.fire({
        icon: "error",
        title: status === 401 ? "Authentication required" : "Send failed",
        text,
      });
    } finally {
      setSending(false);
    }
  };

  const openDetails = async (row) => {
    setSelectedRow(row);
    setDrawerOpen(true);
    setDrawerLoading(true);
    setSelectedAnalytics(null);
    setSelectedDispatch(null);
    try {
      const [dispatchRes, analyticsRes] = await Promise.all([
        getAdminNotificationDispatchStatus(row.id),
        getAdminNotificationAnalytics(row.id),
      ]);
      setSelectedDispatch(dispatchRes.data?.data);
      setSelectedAnalytics(analyticsRes.data?.data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Could not load details",
        text: err.response?.data?.error || err.message,
      });
    } finally {
      setDrawerLoading(false);
    }
  };

  const handleDuplicate = async (row) => {
    try {
      await duplicateAdminNotification(row.id);
      Swal.fire({ icon: "success", title: "Duplicated", timer: 1500, showConfirmButton: false });
      loadHistory(historyPage);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Duplicate failed", text: err.response?.data?.error || err.message });
    }
  };

  const handleDelete = async (row) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "Delete notification?",
      text: "This soft-deletes the campaign record.",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    });
    if (!confirm.isConfirmed) return;
    try {
      await deleteAdminNotification(row.id);
      Swal.fire({ icon: "success", title: "Deleted", timer: 1200, showConfirmButton: false });
      loadHistory(historyPage);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Delete failed", text: err.response?.data?.error || err.message });
    }
  };

  const historyColumns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 70,
    },
    {
      title: "Title",
      dataIndex: "title",
      ellipsis: true,
      render: (text, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{row.notificationType}</div>
        </div>
      ),
    },
    {
      title: "Audience",
      dataIndex: "recipientType",
      width: 120,
      render: (type, row) => (
        <div>
          <Tag>{type || "—"}</Tag>
          {row.recipientSegment && (
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{row.recipientSegment}</div>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "dispatchStatus",
      width: 130,
      render: (status, row) => {
        const live = dispatchMap[row.id]?.dispatchStatus || status;
        return live ? (
          <Tag color={DISPATCH_STATUS_COLORS[live] || "default"}>{live}</Tag>
        ) : (
          <Tag color="success">SENT</Tag>
        );
      },
    },
    {
      title: "Recipients",
      width: 110,
      render: (_, row) => {
        const d = dispatchMap[row.id];
        const processed = d?.processedRecipients ?? row.processedRecipients;
        const total = d?.totalRecipients ?? row.totalRecipients;
        if (total != null) return `${processed ?? 0} / ${total}`;
        return row.userId ? `User ${row.userId}` : "—";
      },
    },
    {
      title: "Created",
      dataIndex: "createdDate",
      width: 160,
      render: (v) => formatDate(v),
    },
    {
      title: "Actions",
      width: 130,
      render: (_, row) => (
        <div style={{ display: "flex", gap: 4 }}>
          <Tooltip title="View details">
            <AntButton size="small" icon={<EyeOutlined />} onClick={() => openDetails(row)} />
          </Tooltip>
          <Tooltip title="Duplicate">
            <AntButton size="small" icon={<CopyOutlined />} onClick={() => handleDuplicate(row)} />
          </Tooltip>
          <Tooltip title="Delete">
            <AntButton size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(row)} />
          </Tooltip>
        </div>
      ),
    },
  ];

  const renderCompose = () => (
    <div className="nc-compose-grid">
      <div className="nc-card">
        <div className="nc-card-header">
          <h5><SendOutlined /> Compose notification</h5>
          <span className="sub">All requests use your admin accessToken</span>
        </div>
        <div className="nc-card-body">
          <div className="nc-form-section">
            <div className="nc-section-label"><span className="num">1</span> Choose audience</div>
          <div className="nc-audience-grid">
            {AUDIENCE_MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                className={`nc-audience-option ${audienceMode === mode.value ? "selected" : ""}`}
                onClick={() => setAudienceMode(mode.value)}
              >
                <div className="icon-wrap">
                  <i className={`fa-solid ${mode.icon}`} />
                </div>
                <div className="title">{mode.label}</div>
                <div className="desc">{mode.description}</div>
              </button>
            ))}
          </div>

          {audienceMode === "segment" && (
            <div className="mt-3">
              <label className="nc-field-label">Segment</label>
              <select className="form-select" value={segment} onChange={(e) => setSegment(e.target.value)}>
                {SEGMENTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <small className="text-muted d-block mt-1">{SEGMENTS.find((s) => s.value === segment)?.description}</small>
            </div>
          )}

          {audienceMode === "individual" && (
            <div className="mt-3">
              <label className="nc-field-label">User ID</label>
              <input
                className="form-control"
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="e.g. 12345"
              />
            </div>
          )}

          {audienceMode === "limited" && (
            <div className="mt-3">
              <label className="nc-field-label">User IDs</label>
              <textarea
                className="form-control"
                rows={3}
                value={userIdsRaw}
                onChange={(e) => setUserIdsRaw(e.target.value)}
                placeholder="12345, 67890, 11111"
              />
              <small className="text-muted">{parsedUserIds.length} valid ID(s) detected</small>
            </div>
          )}
          </div>

          <div className="nc-form-section">
            <div className="nc-section-label"><span className="num">2</span> Notification settings</div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="nc-field-label">Notification type</label>
              <select
                className="form-select"
                value={notificationType}
                onChange={(e) => setNotificationType(e.target.value)}
              >
                {NOTIFICATION_TYPES.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="nc-field-label">Priority</label>
              <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
          </div>

          <div className="nc-form-section">
            <div className="nc-section-label"><span className="num">3</span> Message content</div>
          <div className="mb-3">
            <label className="nc-field-label">Title</label>
            <input
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={TITLE_MAX}
              placeholder="Short headline users see on push and bell"
            />
            <div className="nc-char-count">{title.length}/{TITLE_MAX}</div>
          </div>

          <div className="mb-3">
            <label className="nc-field-label">Message</label>
            <textarea
              className="form-control"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MESSAGE_MAX}
              placeholder="Main notification body"
            />
            <div className="nc-char-count">{message.length}/{MESSAGE_MAX}</div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="nc-field-label">Redirect URL (optional)</label>
              <input
                className="form-control"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="/viewdeals or full URL"
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="nc-field-label">Campaign ID (optional)</label>
              <input
                className="form-control"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                placeholder="CAMP-2026-06"
              />
            </div>
          </div>
          </div>

          <div className="nc-form-section">
            <div className="nc-section-label"><span className="num">4</span> Delivery channels</div>
          <div className="nc-channel-row">
              <label className="nc-channel-pill">
                <input type="checkbox" checked={sendInApp} onChange={(e) => setSendInApp(e.target.checked)} />
                In-app bell
              </label>
              <label className="nc-channel-pill">
                <input type="checkbox" checked={sendPush} onChange={(e) => setSendPush(e.target.checked)} />
                Mobile &amp; web push (FCM)
              </label>
            </div>
          </div>

          <div className="nc-send-row">
            <p className="nc-send-hint mb-0">
              <CheckCircleOutlined style={{ color: "#16a34a", marginRight: 6 }} />
              Sends in-app record plus FCM push for users with registered device tokens.
            </p>
            <button
              type="button"
              className="nc-send-btn"
              disabled={sending}
              onClick={handleSend}
            >
              <SendOutlined />
              {sending ? "Sending…" : "Send notification"}
            </button>
          </div>
        </div>
      </div>

      <div className="nc-preview-sticky">
      <div className="nc-card">
        <div className="nc-card-header">
          <h5><BellOutlined /> Live preview</h5>
          <span className="sub">Updates as you type</span>
        </div>
        <div className="nc-card-body">
          <div className="nc-preview-phone">
            <div className="nc-preview-notch" />
            <div className="nc-preview-screen">
              <div className="nc-preview-statusbar">
                <span>OxyLoans</span>
                <span>now</span>
              </div>
              <div className="nc-preview-push">
                <div className="nc-preview-icon"><i className="fa-solid fa-bell" /></div>
                <div>
                  <div className="nc-preview-title">{title.trim() || "Notification title"}</div>
                  <div className="nc-preview-message">{message.trim() || "Your message preview appears here."}</div>
                  <div className="nc-preview-meta">
                    <span className="nc-preview-tag">{notificationType}</span>
                    <span className="nc-preview-tag">{priority}</span>
                    <span className="nc-preview-tag">
                      {sendPush && sendInApp ? "Push + In-app" : sendPush ? "Push only" : "In-app only"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="nc-preview-inapp">
                <div className="nc-preview-inapp-head">
                  <span>In-app inbox</span>
                  <span className="nc-preview-unread" />
                </div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{title.trim() || "Notification title"}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, lineHeight: 1.4 }}>
                  {message.trim() || "Message body shown in notification center."}
                </div>
                {redirectUrl.trim() && (
                  <div style={{ fontSize: 11, color: "#2563eb", marginTop: 8, fontWeight: 600 }}>Tap → {redirectUrl.trim()}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="nc-card">
      <div className="nc-card-body">
        <div className="nc-history-toolbar">
          <div>
            <h5>Sent notifications</h5>
            <small className="text-muted">Queued jobs auto-refresh every 5 seconds</small>
          </div>
          <AntButton icon={<ReloadOutlined />} onClick={() => loadHistory(historyPage)} loading={historyLoading}>
            Refresh
          </AntButton>
        </div>
        <div className="nc-table-wrap">
        <Table
          rowKey="id"
          loading={historyLoading}
          columns={historyColumns}
          dataSource={history}
          pagination={{
            current: historyPage + 1,
            pageSize: historySize,
            total: historyTotal,
            onChange: (page) => loadHistory(page - 1),
          }}
          locale={{ emptyText: "No notifications sent yet." }}
        />
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => {
    const breakdown = typeStats
      ? [
          { label: "Individual", count: typeStats.individualNotifications ?? 0 },
          { label: "Limited users", count: typeStats.limitedNotifications ?? 0 },
          { label: "All users", count: typeStats.allUsersNotifications ?? 0 },
        ]
      : [];

    return (
    <div>
      <div className="nc-stat-grid">
        <div className="nc-stat-card">
          <div className="label">Average read rate</div>
          <div className="value">{statsLoading ? "…" : `${Number(avgReadPct).toFixed(1)}%`}</div>
        </div>
        <div className="nc-stat-card">
          <div className="label">Total campaigns</div>
          <div className="value">{statsLoading ? "…" : (typeStats?.totalNotifications ?? historyTotal ?? 0)}</div>
        </div>
        <div className="nc-stat-card">
          <div className="label">Total recipients</div>
          <div className="value">{statsLoading ? "…" : (typeStats?.totalRecipients ?? "—")}</div>
        </div>
        <div className="nc-stat-card">
          <div className="label">Total reads</div>
          <div className="value">{statsLoading ? "…" : (typeStats?.totalReads ?? "—")}</div>
        </div>
      </div>
      <div className="nc-card">
        <div className="nc-card-body">
          <h5>Campaigns by audience type</h5>
          {statsLoading ? (
            <div className="text-center py-4"><Spin /></div>
          ) : breakdown.length ? (
            <Table
              rowKey="label"
              pagination={false}
              dataSource={breakdown}
              columns={[
                { title: "Audience type", dataIndex: "label" },
                { title: "Campaign count", dataIndex: "count" },
              ]}
            />
          ) : (
            <div className="nc-empty-state">No aggregate statistics available yet.</div>
          )}
        </div>
      </div>
    </div>
    );
  };

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid nc-page">
          <div className="nc-hero">
            <div>
              <h4>Notification Command Center</h4>
              <p>Send in-app and FCM push messages to lenders and borrowers — individual, segment, or broadcast.</p>
            </div>
            <div className="nc-hero-badges">
              <span className="nc-env-badge">
                <span className="dot" />
                <CloudServerOutlined /> Live API
              </span>
              <span className="nc-env-badge">{BASE_URL}</span>
            </div>
          </div>

          <div className="nc-tabs">
            <button
              type="button"
              className={`nc-tab ${activeTab === "compose" ? "active" : ""}`}
              onClick={() => setActiveTab("compose")}
            >
              <SendOutlined /> Compose
            </button>
            <button
              type="button"
              className={`nc-tab ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              <HistoryOutlined /> History
            </button>
            <button
              type="button"
              className={`nc-tab ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => setActiveTab("analytics")}
            >
              <BarChartOutlined /> Analytics
            </button>
          </div>

          {activeTab === "compose" && renderCompose()}
          {activeTab === "history" && renderHistory()}
          {activeTab === "analytics" && renderAnalytics()}
        </div>
        <Footer />
      </div>

      <Drawer
        title={`Notification #${selectedRow?.id || ""}`}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
        className="nc-detail-drawer"
      >
        {drawerLoading ? (
          <div className="text-center py-5"><Spin /></div>
        ) : (
          <div className="nc-detail-grid">
            <div className="nc-detail-item"><div className="k">Title</div><div className="v">{selectedRow?.title}</div></div>
            <div className="nc-detail-item"><div className="k">Message</div><div className="v">{selectedRow?.message}</div></div>
            <div className="nc-detail-item"><div className="k">Type</div><div className="v">{selectedRow?.notificationType}</div></div>
            <div className="nc-detail-item"><div className="k">Audience</div><div className="v">{selectedRow?.recipientType}{selectedRow?.recipientSegment ? ` · ${selectedRow.recipientSegment}` : ""}</div></div>
            {selectedDispatch && (
              <>
                <div className="nc-detail-item">
                  <div className="k">Dispatch status</div>
                  <div className="v">{selectedDispatch.dispatchStatus || "—"}</div>
                </div>
                <div className="nc-detail-item">
                  <div className="k">Progress</div>
                  <Progress
                    percent={Math.round(selectedDispatch.progressPercent || 0)}
                    status={selectedDispatch.dispatchStatus === "FAILED" ? "exception" : "active"}
                  />
                  <small className="text-muted">
                    {selectedDispatch.processedRecipients ?? 0} / {selectedDispatch.totalRecipients ?? "?"}
                  </small>
                </div>
                {selectedDispatch.dispatchError && (
                  <div className="nc-detail-item">
                    <div className="k">Error</div>
                    <div className="v" style={{ color: "#dc2626" }}>{selectedDispatch.dispatchError}</div>
                  </div>
                )}
              </>
            )}
            {selectedAnalytics && (
              <>
                <div className="nc-detail-item"><div className="k">Total recipients</div><div className="v">{selectedAnalytics.totalRecipients ?? "—"}</div></div>
                <div className="nc-detail-item"><div className="k">Read count</div><div className="v">{selectedAnalytics.readCount ?? "—"}</div></div>
                <div className="nc-detail-item"><div className="k">Read %</div><div className="v">{selectedAnalytics.readPercentage != null ? `${Number(selectedAnalytics.readPercentage).toFixed(1)}%` : "—"}</div></div>
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AdminNotificationCenter;
