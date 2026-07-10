import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserId } from "./HttpRequest/afterlogin";
import { MARKETPLACE_URL as BASE } from "../config";

// Derive the route to navigate to when a notification is clicked
function getNotificationRoute(n) {
  // Backend field is actionUrl, not link
  if (n.actionUrl && n.actionUrl.startsWith("/")) return n.actionUrl;

  const type = (n.type || "").toUpperCase();
  const primaryType = localStorage.getItem("primaryType") || sessionStorage.getItem("primaryType") || "";
  const isBorrower = primaryType === "BORROWER";

  const refId = n.loanRequestId || null;
  const msgMatch = n.message && n.message.match(/LRQ-[\w-]+/);
  const lrqId = refId || (msgMatch ? msgMatch[0] : null);

  // Maturity reminders always go to the AI portfolio maturity section
  if (type === "MATURITY_REMINDER") return "/ai/portfolio";

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
  // Use exact prefix to avoid "REMINDER" accidentally matching "EMI"
  if (type.startsWith("EMI") || type === "LOAN_DISBURSED" || type === "LOAN_CLOSED") {
    return isBorrower ? "/borrower-emi-schedule" : "/lender-emi-dashboard";
  }
  if (type.includes("OXYSCORE")) return "/my-oxyscore";
  if (type.includes("ESCALATION")) return "/escalation-dashboard";

  return null;
}

const NotificationBell = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const dropdownRef = useRef(null);

  const headers = (includeContentType = false) => ({
    ...(includeContentType ? { "Content-Type": "application/json" } : {}),
    accessToken:
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("accessToken") ||
      "",
    userId: sessionStorage.getItem("activeLenderId") || getUserId(),
  });

  const fetchCount = () => {
    const userId = getUserId();
    const token = sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");
    if (!userId || !token || token === "null" || token === "undefined") return;
    // axios
    //   .get(`${BASE}/v1/notifications/count`, { headers: headers() })
    //   .then((res) => {
    //     if (res.status === 200) setUnreadCount(res.data?.unreadCount || 0);
    //   })
    //   .catch(() => {});
  };

  const fetchNotifications = () => {
    const userId = sessionStorage.getItem("activeLenderId") || getUserId();
    if (!userId) return;
    setLoading(true);
    setFetchError(null);
    axios
      .get(`${BASE}/v1/notifications/my`, { headers: headers() })
      .then((res) => {
        if (res.status === 200) {
          const list = Array.isArray(res.data) ? res.data : [];
          setNotifications(list.slice(0, 10));
          setUnreadCount(list.filter((n) => !n.read).length);
        }
        setLoading(false);
      })
      .catch((err) => {
        const status = err?.response?.status;
        setFetchError(status === 401 ? "Session expired — please log in again" : `Error ${status || "network"}`);
        setLoading(false);
      });
  };

  const markRead = (id) => {
    axios
      .put(`${BASE}/v1/notifications/${id}/read`, {}, { headers: headers(true) })
      .then(() => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      })
      .catch(() => {});
  };

  const markAllRead = () => {
    axios
      .put(`${BASE}/v1/notifications/read-all`, {}, { headers: headers(true) })
      .then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      })
      .catch(() => {});
  };

  // Poll every 30 seconds
  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleBellClick = () => {
    if (!open) fetchNotifications();
    setOpen((prev) => !prev);
  };

  const handleNotificationClick = (n) => {
    if (!n.read) markRead(n.id);
    setOpen(false);
    const route = getNotificationRoute(n);
    if (route) navigate(route);
  };

  const typeIcon = (type) => {
    if (!type) return "fa-bell";
    const t = type.toUpperCase();
    if (t.includes("OFFER")) return "fa-handshake";
    if (t.includes("CONSENT")) return "fa-file-signature";
    if (t.includes("OXYSCORE")) return "fa-chart-line";
    if (t.includes("ESCALATION")) return "fa-exclamation-triangle";
    if (t.includes("EMI")) return "fa-calendar-check";
    if (t.includes("LOAN")) return "fa-money-bill-wave";
    return "fa-bell";
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = (Date.now() - new Date(dateStr)) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <li
      className="nav-item dropdown"
      ref={dropdownRef}
      style={{ position: "relative" }}
    >
      <button
        className="nav-link btn btn-link p-0"
        onClick={handleBellClick}
        style={{ position: "relative", fontSize: 20, color: "#666" }}
        title="Notifications"
      >
        <i className="fa fa-bell"></i>
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -6,
              right: -6,
              background: "#ff4d4f",
              color: "#fff",
              borderRadius: "50%",
              fontSize: 10,
              minWidth: 18,
              height: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              padding: "0 4px",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="dropdown-menu dropdown-menu-end show"
          style={{
            minWidth: 360,
            maxHeight: 480,
            overflowY: "auto",
            padding: 0,
            right: 0,
            left: "auto",
            zIndex: 9999,
          }}
        >
          {/* Header */}
          <div
            className="d-flex justify-content-between align-items-center px-3 py-2"
            style={{ borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}
          >
            <strong style={{ fontSize: 14 }}>
              Notifications{" "}
              {unreadCount > 0 && (
                <span className="badge bg-danger ms-1">{unreadCount}</span>
              )}
            </strong>
            {unreadCount > 0 && (
              <button
                className="btn btn-link btn-sm p-0"
                style={{ fontSize: 12 }}
                onClick={markAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Body */}
          {loading ? (
            <div className="text-center py-3 text-muted" style={{ fontSize: 13 }}>
              Loading...
            </div>
          ) : fetchError ? (
            <div className="text-center py-4" style={{ color: "#ff4d4f", fontSize: 13 }}>
              {fetchError}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="fa fa-bell-slash mb-2" style={{ fontSize: 24 }}></i>
              <p style={{ fontSize: 13 }}>No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => {
              const route = getNotificationRoute(n);
              return (
                <div
                  key={n.id}
                  className="d-flex px-3 py-2"
                  style={{
                    borderBottom: "1px solid #f5f5f5",
                    background: n.read ? "#fff" : "#f0f7ff",
                    cursor: "pointer",
                    gap: 10,
                  }}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: n.read ? "#e8e8e8" : "#1890ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <i
                      className={`fa-solid ${typeIcon(n.type)}`}
                      style={{ color: n.read ? "#999" : "#fff", fontSize: 13 }}
                    ></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: n.read ? "normal" : "600",
                        color: "#222",
                        marginBottom: 2,
                      }}
                    >
                      {n.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#666",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {n.message}
                    </div>
                    <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>
                      {timeAgo(n.createdAt)}
                      {route && (
                        <span style={{ marginLeft: 6, color: "#1890ff" }}>
                          → View
                        </span>
                      )}
                    </div>
                  </div>
                  {!n.read && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        background: "#1890ff",
                        borderRadius: "50%",
                        flexShrink: 0,
                        marginTop: 6,
                      }}
                    />
                  )}
                </div>
              );
            })
          )}

          {/* Footer */}
          <div
            className="text-center py-2"
            style={{ borderTop: "1px solid #f0f0f0" }}
          >
            <Link
              to="/notifications"
              style={{ fontSize: 12, color: "#1890ff" }}
              onClick={() => setOpen(false)}
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </li>
  );
};

export default NotificationBell;
