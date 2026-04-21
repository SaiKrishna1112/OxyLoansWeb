import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserId } from "../HttpRequest/afterlogin";
import { MARKETPLACE_URL as BASE } from "../../config";

const TYPE_CONFIG = {
  OFFER: { icon: "fa-handshake", color: "#52c41a", label: "Offer" },
  CONSENT: { icon: "fa-file-signature", color: "#722ed1", label: "Consent" },
  LOAN: { icon: "fa-money-bill-wave", color: "#fa8c16", label: "Loan" },
  EMI: { icon: "fa-calendar-check", color: "#13c2c2", label: "EMI" },
  OXYSCORE: { icon: "fa-chart-line", color: "#eb2f96", label: "OxyScore" },
  ESCALATION: { icon: "fa-exclamation-triangle", color: "#f5222d", label: "Escalation" },
  DEFAULT: { icon: "fa-bell", color: "#1890ff", label: "General" },
};

function getTypeConfig(type) {
  if (!type) return TYPE_CONFIG.DEFAULT;
  const t = type.toUpperCase();
  for (const [key, cfg] of Object.entries(TYPE_CONFIG)) {
    if (t.includes(key)) return cfg;
  }
  return TYPE_CONFIG.DEFAULT;
}

function formatGroupDate(dateStr) {
  if (!dateStr) return "Unknown";
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const notifDay = new Date(d);
  notifDay.setHours(0, 0, 0, 0);

  if (notifDay.getTime() === today.getTime()) return "Today";
  if (notifDay.getTime() === yesterday.getTime()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const FILTER_TABS = [
  { key: "All", label: "All" },
  { key: "Unread", label: "Unread" },
  { key: "OFFER", label: "Offers" },
  { key: "CONSENT", label: "Consent" },
  { key: "LOAN", label: "Loan" },
  { key: "EMI", label: "EMI" },
  { key: "ESCALATION", label: "Escalation" },
];

const PAGE_SIZE = 20;

function getNotificationRoute(n) {
  if (n.link) return n.link;

  const type = (n.type || "").toUpperCase();
  const primaryType = localStorage.getItem("primaryType") || sessionStorage.getItem("primaryType") || "";
  const isBorrower = primaryType === "BORROWER";

  const refId = n.referenceId || n.loanRequestId || null;
  const msgMatch = n.message && n.message.match(/LRQ-[\w-]+/);
  const lrqId = refId || (msgMatch ? msgMatch[0] : null);

  if (type.includes("OFFER")) {
    return isBorrower ? "/my-marketplace-loans" : "/my-offers";
  }
  if (type.includes("CONSENT")) {
    if (lrqId) {
      return isBorrower
        ? `/borrower-consent/${lrqId}`
        : `/lender-consent/${lrqId}`;
    }
    return isBorrower ? "/my-marketplace-loans" : "/marketplace-loans";
  }
  if (type.includes("EMI") || type.includes("LOAN")) {
    return isBorrower ? "/borrower-emi-schedule" : "/lender-emi-dashboard";
  }
  if (type.includes("OXYSCORE")) return "/my-oxyscore";
  if (type.includes("ESCALATION")) return "/escalation-dashboard";

  return null;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(0);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    accessToken:
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken") ||
      "",
    userId: getUserId() || "",
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${BASE}/v1/notifications/my`, {
        headers: authHeaders(),
      });
      if (res.status === 200) setNotifications(res.data || []);
    } catch (e) {
      setError("Could not load notifications. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const markRead = (id) => {
    axios
      .put(`${BASE}/v1/notifications/${id}/read`, {}, { headers: authHeaders() })
      .then(() =>
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
      )
      .catch(() => {});
  };

  const markAllRead = () => {
    axios
      .put(`${BASE}/v1/notifications/read-all`, {}, { headers: authHeaders() })
      .then(() =>
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      )
      .catch(() => {});
  };

  // Filter
  const filtered = notifications.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !n.read;
    return (n.type || "").toUpperCase().includes(filter);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Group by date
  const grouped = {};
  pageData.forEach((n) => {
    const key = formatGroupDate(n.createdAt);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(n);
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb" }}>
      {/* Sticky header */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #eaeaea",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          position: "sticky",
          top: 0,
          zIndex: 200,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "1px solid #e8e8e8",
            borderRadius: 8,
            width: 36,
            height: 36,
            cursor: "pointer",
            fontSize: 18,
            color: "#555",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Go back"
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
            Notifications
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: 10,
                  background: "#ff4d4f",
                  color: "#fff",
                  borderRadius: 12,
                  fontSize: 12,
                  padding: "2px 10px",
                  fontWeight: 600,
                  verticalAlign: "middle",
                }}
              >
                {unreadCount} unread
              </span>
            )}
          </h2>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            style={{
              background: "none",
              border: "1px solid #1890ff",
              color: "#1890ff",
              borderRadius: 8,
              padding: "7px 16px",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Mark all read
          </button>
        )}
        <button
          onClick={fetchAll}
          disabled={loading}
          style={{
            background: "none",
            border: "1px solid #e8e8e8",
            borderRadius: 8,
            width: 36,
            height: 36,
            cursor: "pointer",
            fontSize: 18,
            color: loading ? "#bbb" : "#555",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Refresh"
        >
          {loading ? (
            <i className="fa fa-spinner fa-spin" />
          ) : (
            <i className="fa fa-sync-alt" />
          )}
        </button>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 16px" }}>
        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          {FILTER_TABS.map((tab) => {
            const active = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setFilter(tab.key);
                  setPage(0);
                }}
                style={{
                  padding: "6px 18px",
                  borderRadius: 20,
                  border: active ? "none" : "1px solid #d9d9d9",
                  background: active ? "#1890ff" : "#fff",
                  color: active ? "#fff" : "#555",
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: active ? 600 : 400,
                  transition: "all 0.15s",
                }}
              >
                {tab.label}
                {tab.key === "Unread" && unreadCount > 0 && (
                  <span
                    style={{
                      marginLeft: 6,
                      background: active
                        ? "rgba(255,255,255,0.35)"
                        : "#ff4d4f",
                      color: "#fff",
                      borderRadius: 10,
                      fontSize: 11,
                      padding: "1px 6px",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Error banner */}
        {error && (
          <div
            style={{
              background: "#fff2f0",
              border: "1px solid #ffccc7",
              borderRadius: 10,
              padding: "12px 18px",
              marginBottom: 16,
              color: "#cf1322",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <i className="fa fa-exclamation-circle" />
            {error}
            <button
              onClick={fetchAll}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "1px solid #cf1322",
                borderRadius: 6,
                padding: "3px 12px",
                color: "#cf1322",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Count */}
        <p style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>
          {loading
            ? "Loading…"
            : `${filtered.length} notification${filtered.length !== 1 ? "s" : ""}`}
        </p>

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "80px 0",
              color: "#bbb",
            }}
          >
            <i
              className="fa fa-bell-slash"
              style={{ fontSize: 52, marginBottom: 16, display: "block" }}
            />
            <p style={{ fontSize: 16, color: "#aaa" }}>
              {filter === "Unread"
                ? "You're all caught up!"
                : "No notifications yet"}
            </p>
          </div>
        )}

        {/* Grouped list */}
        {!loading &&
          Object.entries(grouped).map(([dateKey, items]) => (
            <div key={dateKey} style={{ marginBottom: 28 }}>
              {/* Date header */}
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 10,
                  paddingLeft: 4,
                }}
              >
                {dateKey}
              </div>

              {items.map((n) => {
                const cfg = getTypeConfig(n.type);
                const route = getNotificationRoute(n);
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (!n.read) markRead(n.id);
                      if (route) navigate(route);
                    }}
                    style={{
                      background: n.read ? "#fff" : "#f0f7ff",
                      border: `1px solid ${n.read ? "#f0f0f0" : "#bae0ff"}`,
                      borderRadius: 14,
                      padding: "14px 18px",
                      marginBottom: 10,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      cursor: route ? "pointer" : "default",
                      transition: "box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (route) e.currentTarget.style.boxShadow = "0 2px 12px rgba(24,144,255,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {/* Icon circle */}
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: "50%",
                        background: n.read ? "#f5f5f5" : cfg.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <i
                        className={`fa-solid ${cfg.icon}`}
                        style={{
                          color: n.read ? "#ccc" : "#fff",
                          fontSize: 17,
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: n.read ? 500 : 700,
                          color: "#0f172a",
                          marginBottom: 4,
                        }}
                      >
                        {n.title || "Notification"}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#475569",
                          lineHeight: 1.55,
                        }}
                      >
                        {n.message}
                      </div>
                      <div
                        style={{
                          marginTop: 8,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>
                          {timeAgo(n.createdAt)}
                        </span>
                        {n.type && (
                          <span
                            style={{
                              background: n.read ? "#f0f0f0" : `${cfg.color}18`,
                              color: n.read ? "#888" : cfg.color,
                              borderRadius: 6,
                              padding: "2px 8px",
                              fontSize: 11,
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                            }}
                          >
                            {cfg.label}
                          </span>
                        )}
                        {route && (
                          <span style={{ fontSize: 11, color: "#1890ff", fontWeight: 500 }}>
                            → View
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!n.read && (
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          background: "#1890ff",
                          borderRadius: "50%",
                          flexShrink: 0,
                          marginTop: 8,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 12,
              marginTop: 28,
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "1px solid #d9d9d9",
                background: "#fff",
                cursor: page === 0 ? "not-allowed" : "pointer",
                color: page === 0 ? "#bbb" : "#333",
                fontSize: 13,
              }}
            >
              ← Prev
            </button>
            <span style={{ fontSize: 13, color: "#555" }}>
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "1px solid #d9d9d9",
                background: "#fff",
                cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                color: page >= totalPages - 1 ? "#bbb" : "#333",
                fontSize: 13,
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
