import React, { useState } from "react";
import axios from "axios";
import { MARKETPLACE_URL, ENV } from "../../../config";
import { getToken } from "../../HttpRequest/afterlogin";

const TIER_COLOR = { FREE: "#6c757d", SMART: "#0d6efd", PRO: "#6f42c1" };
const TIER_BADGE = { FREE: "secondary", SMART: "primary", PRO: "info" };

export default function AITestAdmin() {
  const [mobile, setMobile] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  if (ENV !== "test") {
    return (
      <div className="container py-5 text-center text-muted">
        <h5>This page is only available in test mode.</h5>
      </div>
    );
  }

  const lookup = async () => {
    if (!mobile.trim()) return;
    setLoading(true);
    setMsg(null);
    setUser(null);
    try {
      const res = await axios.get(
        `${MARKETPLACE_URL}/v1/ai/admin/lookup?mobile=${mobile.trim()}`,
        { headers: { accessToken: getToken() } }
      );
      setUser(res.data);
    } catch (e) {
      setMsg({ type: "danger", text: e.response?.data?.error || "Lookup failed" });
    } finally {
      setLoading(false);
    }
  };

  const setTier = async (tier) => {
    if (!user) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await axios.post(
        `${MARKETPLACE_URL}/v1/ai/admin/set-tier?userId=${user.userId}&tier=${tier}`,
        {},
        { headers: { accessToken: getToken() } }
      );
      setUser((prev) => ({ ...prev, tier: res.data.tier }));
      setMsg({ type: "success", text: `${user.name} (${user.userId}) set to ${res.data.tier}` });
    } catch (e) {
      setMsg({ type: "danger", text: e.response?.data?.error || "Failed to set tier" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: 520 }}>
      <div className="d-flex align-items-center gap-2 mb-4">
        <span style={{ fontSize: 22 }}>🧪</span>
        <h5 className="mb-0 fw-bold">AI Subscription — Test Controls</h5>
        <span className="badge bg-warning text-dark ms-1">TEST ONLY</span>
      </div>

      {/* Mobile lookup */}
      <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 12 }}>
        <div className="card-body p-3">
          <label className="form-label fw-semibold text-secondary small mb-1">
            Lender Mobile Number
          </label>
          <div className="input-group">
            <span className="input-group-text">+91</span>
            <input
              className="form-control"
              placeholder="e.g. 9640035218"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              onKeyDown={(e) => e.key === "Enter" && lookup()}
              maxLength={10}
            />
            <button
              className="btn btn-primary px-3"
              onClick={lookup}
              disabled={loading || mobile.length < 10}
            >
              {loading ? <span className="spinner-border spinner-border-sm" /> : "Lookup"}
            </button>
          </div>
        </div>
      </div>

      {/* User card */}
      {user && (
        <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 12 }}>
          <div className="card-body p-3">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <div className="fw-bold" style={{ fontSize: 16 }}>{user.name || "—"}</div>
                <div className="text-muted small">
                  +91 {user.mobile} &nbsp;·&nbsp; ID: {user.userId}
                </div>
              </div>
              <span
                className={`badge bg-${TIER_BADGE[user.tier] || "secondary"} px-3 py-2`}
                style={{ fontSize: 13, borderRadius: 8 }}
              >
                {user.tier}
              </span>
            </div>

            <div className="fw-semibold text-secondary small mb-2">Set Tier</div>
            <div className="d-flex gap-2">
              {["FREE", "SMART", "PRO"].map((t) => (
                <button
                  key={t}
                  className={`btn btn-sm flex-fill fw-semibold ${user.tier === t ? "btn-secondary disabled" : "btn-outline-secondary"}`}
                  style={{
                    borderColor: TIER_COLOR[t],
                    color: user.tier === t ? "#fff" : TIER_COLOR[t],
                    background: user.tier === t ? TIER_COLOR[t] : "transparent",
                    borderRadius: 8,
                  }}
                  onClick={() => setTier(t)}
                  disabled={loading || user.tier === t}
                >
                  {loading ? <span className="spinner-border spinner-border-sm" /> : t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Status message */}
      {msg && (
        <div className={`alert alert-${msg.type} py-2 px-3`} style={{ borderRadius: 8, fontSize: 14 }}>
          {msg.type === "success" ? "✅ " : "❌ "}{msg.text}
        </div>
      )}

      <div className="text-muted" style={{ fontSize: 12, marginTop: 8 }}>
        Changes only affect the test database. Backend endpoint requires <code>subscription.bypass=true</code>.
      </div>
    </div>
  );
}
