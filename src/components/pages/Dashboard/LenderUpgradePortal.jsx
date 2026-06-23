import React, { useState, useEffect } from "react";
import axios from "axios";
import { MARKETPLACE_URL, API_USER_URL, ENV } from "../../../config";

const PLANS = [
  {
    key: "FREE",
    label: "Free",
    price: 0,
    color: "#8c8c8c",
    features: [
      "Portfolio overview (totals)",
      "Active & closed deal counts",
      "Basic wallet balance",
    ],
    locked: [
      "AI narrative & insights",
      "Earnings breakdown & FY filter",
      "Churn risk & reinvestment score",
      "Payment timing analysis",
      "Upcoming payouts",
      "Referral earnings",
    ],
  },
  {
    key: "SMART",
    label: "Smart",
    price: 500,
    color: "#1890ff",
    badge: "Popular",
    features: [
      "Everything in Free",
      "Earnings breakdown & FY filter",
      "Upcoming payouts",
      "Referral earnings tracker",
      "Deal participation history",
    ],
    locked: [
      "AI narrative & portfolio story",
      "Churn risk score",
      "Reinvestment intelligence",
      "Payment timing deep-dive",
    ],
  },
  {
    key: "PRO",
    label: "Pro",
    price: 1000,
    color: "#722ed1",
    badge: "Full AI",
    features: [
      "Everything in Smart",
      "AI-generated portfolio narrative",
      "Churn risk score & alerts",
      "Reinvestment classification",
      "Payment timing deep-dive",
      "Claude AI model access",
    ],
    locked: [],
  },
];

export default function LenderUpgradePortal() {
  // auth state
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // session
  const [token, setToken] = useState(() => sessionStorage.getItem("accessToken"));
  const [userId, setUserId] = useState(() => sessionStorage.getItem("userId"));

  // plans state
  const [currentTier, setCurrentTier] = useState("FREE");
  const [validUntil, setValidUntil] = useState(null);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [plansLoading, setPlansLoading] = useState(false);
  const [paying, setPaying] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [planError, setPlanError] = useState(null);

  useEffect(() => {
    if (token && userId) {
      loadSubscription(token, userId);
    }
  }, [token, userId]);

  const loadSubscription = (tok, uid) => {
    setPlansLoading(true);
    axios
      .get(`${MARKETPLACE_URL}/v1/ai/lender/${uid}/subscription`, {
        headers: { accessToken: tok },
      })
      .then((r) => {
        setCurrentTier(r.data.tier || "FREE");
        setValidUntil(r.data.validUntil);
        if (r.data.pendingOrderId) setPendingOrderId(r.data.pendingOrderId);
      })
      .catch(() => {})
      .finally(() => setPlansLoading(false));
  };

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(mobile)) {
      setAuthError("Enter a valid 10-digit mobile number");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      await axios.post(`${API_USER_URL}sendOtp`, { mobileNumber: mobile });
      setOtpSent(true);
    } catch {
      setAuthError("Failed to send OTP. Check mobile number and try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setAuthError("Enter the OTP you received");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await axios.post(
        `${API_USER_URL}login?grantType=PWD`,
        { mobileNumber: mobile, mobileOtpValue: otp },
        { headers: { "Content-Type": "application/json" } }
      );
      const tok = res.headers?.accesstoken;
      const uid = res.data?.id;
      if (!tok || !uid) throw new Error("Login failed");
      sessionStorage.setItem("accessToken", tok);
      sessionStorage.setItem("userId", uid);
      sessionStorage.setItem("tokenTime", res.data?.tokenGeneratedTime || "");
      setToken(tok);
      setUserId(uid);
    } catch {
      setAuthError("Invalid OTP or session expired. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyPending = async () => {
    if (!pendingOrderId) return;
    setVerifying(true);
    setPlanError(null);
    try {
      const res = await axios.post(
        `${MARKETPLACE_URL}/v1/ai/lender/${userId}/subscription/verify?orderId=${pendingOrderId}`,
        {},
        { headers: { accessToken: token } }
      );
      if (res.data.success) {
        setCurrentTier(res.data.tier);
        setPendingOrderId(null);
      } else {
        setPlanError("Payment not confirmed yet by Cashfree. Wait a moment and try again.");
      }
    } catch {
      setPlanError("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleUpgrade = async (planKey) => {
    setPaying(planKey);
    setPlanError(null);
    try {
      const res = await axios.post(
        `${MARKETPLACE_URL}/v1/ai/lender/${userId}/subscribe?plan=${planKey}`,
        {},
        { headers: { accessToken: token } }
      );
      const sessionId = res.data?.payment_session_id;
      if (!sessionId) throw new Error("Could not initiate payment");

      if (sessionId === "BYPASS_SESSION") {
        window.location.reload();
        return;
      }

      const cashfree = window.Cashfree({ mode: ENV === "production" ? "production" : "sandbox" });
      cashfree.checkout({ paymentSessionId: sessionId, redirectTarget: "_self" });
    } catch (e) {
      setPlanError(e?.response?.data?.error || e.message || "Payment initiation failed");
    } finally {
      setPaying(null);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("tokenTime");
    setToken(null);
    setUserId(null);
    setMobile("");
    setOtp("");
    setOtpSent(false);
    setCurrentTier("FREE");
  };

  // ── Login Screen ──────────────────────────────────────────────
  if (!token || !userId) {
    return (
      <div style={styles.page}>
        <div style={styles.loginCard}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <img
              src="/assets/img/logo.png"
              alt="OxyLoans"
              style={{ height: 40, marginBottom: 12 }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <h4 style={{ fontWeight: 700, margin: 0 }}>OxyLoans AI — Upgrade Portal</h4>
            <p style={{ color: "#8c8c8c", fontSize: 13, marginTop: 6 }}>
              Login with your registered lender mobile number
            </p>
          </div>

          {authError && (
            <div style={styles.errorBox}>{authError}</div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={styles.label}>Mobile Number</label>
            <input
              type="tel"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              placeholder="10-digit mobile"
              disabled={otpSent}
              style={styles.input}
            />
          </div>

          {!otpSent ? (
            <button
              onClick={handleSendOtp}
              disabled={authLoading}
              style={styles.primaryBtn}
            >
              {authLoading ? "Sending…" : "Send OTP"}
            </button>
          ) : (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={styles.label}>Enter OTP</label>
                <input
                  type="tel"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="OTP received on your phone"
                  style={styles.input}
                  autoFocus
                />
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={authLoading}
                style={styles.primaryBtn}
              >
                {authLoading ? "Verifying…" : "Verify & Continue"}
              </button>
              <button
                onClick={() => { setOtpSent(false); setOtp(""); setAuthError(null); }}
                style={styles.linkBtn}
              >
                Change mobile number
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Plans Screen ──────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "30px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img
            src="/assets/img/logo.png"
            alt="OxyLoans"
            style={{ height: 36, marginBottom: 10 }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <h3 style={{ fontWeight: 700, marginBottom: 6 }}>OxyLoans AI Dashboard Plans</h3>
          <p style={{ color: "#8c8c8c", fontSize: 14 }}>
            Unlock AI-powered insights on your lending portfolio
          </p>

          {currentTier !== "FREE" && validUntil && (
            <span style={{
              background: currentTier === "PRO" ? "#f0e6ff" : "#e6f4ff",
              color: currentTier === "PRO" ? "#722ed1" : "#1890ff",
              borderRadius: 20, padding: "4px 16px", fontSize: 13, fontWeight: 600,
            }}>
              Current: {currentTier} · Valid until{" "}
              {new Date(validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          )}

          <div style={{ marginTop: 8 }}>
            <button onClick={handleLogout} style={styles.linkBtn}>Logout</button>
          </div>
        </div>

        {planError && <div style={styles.errorBox}>{planError}</div>}

        {pendingOrderId && currentTier === "FREE" && (
          <div style={{ background: "#fff7e6", border: "1px solid #ffa940", borderRadius: 12, padding: "14px 20px", textAlign: "center", marginBottom: 24 }}>
            <strong>Payment detected!</strong> You have a recent payment pending verification.{" "}
            <button
              onClick={handleVerifyPending}
              disabled={verifying}
              style={{ background: "#fa8c16", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, padding: "4px 16px", cursor: "pointer", marginLeft: 8 }}
            >
              {verifying ? "Verifying…" : "Activate Subscription"}
            </button>
          </div>
        )}

        {plansLoading ? (
          <p style={{ textAlign: "center", color: "#8c8c8c" }}>Loading your plan…</p>
        ) : (
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
            {PLANS.map((plan) => {
              const isCurrent = currentTier === plan.key;
              const isDowngrade =
                (currentTier === "PRO" && plan.key !== "PRO") ||
                (currentTier === "SMART" && plan.key === "FREE");

              return (
                <div key={plan.key} style={{
                  flex: "1 1 260px", maxWidth: 300,
                  background: "#fff", borderRadius: 16,
                  border: isCurrent ? `2px solid ${plan.color}` : "1px solid #f0f0f0",
                  boxShadow: isCurrent ? `0 4px 20px ${plan.color}33` : "0 2px 8px rgba(0,0,0,0.06)",
                  padding: 24, display: "flex", flexDirection: "column",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <h5 style={{ fontWeight: 700, color: plan.color, margin: 0 }}>{plan.label}</h5>
                    {plan.badge && (
                      <span style={{ background: plan.color + "22", color: plan.color, borderRadius: 12, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    {plan.price === 0 ? (
                      <span style={{ fontSize: 28, fontWeight: 800 }}>Free</span>
                    ) : (
                      <>
                        <span style={{ fontSize: 28, fontWeight: 800 }}>₹{plan.price}</span>
                        <span style={{ fontSize: 13, color: "#8c8c8c", marginLeft: 4 }}>/year</span>
                      </>
                    )}
                  </div>

                  <ul style={{ listStyle: "none", padding: 0, flex: 1, margin: 0 }}>
                    {plan.features.map((f, i) => (
                      <li key={i} style={{ fontSize: 13, marginBottom: 6, display: "flex", alignItems: "flex-start" }}>
                        <span style={{ color: "#52c41a", marginRight: 8 }}>✓</span>{f}
                      </li>
                    ))}
                    {plan.locked.map((f, i) => (
                      <li key={`l${i}`} style={{ fontSize: 13, marginBottom: 6, color: "#bfbfbf", display: "flex", alignItems: "flex-start" }}>
                        <span style={{ marginRight: 8 }}>🔒</span>{f}
                      </li>
                    ))}
                  </ul>

                  <div style={{ marginTop: 16 }}>
                    {isCurrent ? (
                      <button disabled style={{ ...styles.planBtn, background: plan.color + "22", color: plan.color }}>
                        Current Plan
                      </button>
                    ) : isDowngrade || plan.key === "FREE" ? (
                      <button disabled style={{ ...styles.planBtn, background: "#f5f5f5", color: "#bfbfbf" }}>
                        {plan.key === "FREE" ? "Default" : "Downgrade not available"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan.key)}
                        disabled={paying === plan.key}
                        style={{ ...styles.planBtn, background: plan.color, color: "#fff", cursor: "pointer" }}
                      >
                        {paying === plan.key ? "Processing…"
                          : plan.key === "PRO" && currentTier === "SMART"
                            ? "Upgrade to Pro — ₹500 more/yr"
                            : `Upgrade to ${plan.label} — ₹${plan.price}/yr`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fa",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: 60,
    fontFamily: "'Segoe UI', sans-serif",
  },
  loginCard: {
    background: "#fff",
    borderRadius: 16,
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    padding: 36,
    width: "100%",
    maxWidth: 400,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 6,
    color: "#262626",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #d9d9d9",
    borderRadius: 8,
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
  },
  primaryBtn: {
    width: "100%",
    padding: "11px 0",
    background: "#722ed1",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: 8,
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#722ed1",
    fontSize: 13,
    cursor: "pointer",
    padding: "4px 0",
    display: "block",
    margin: "0 auto",
  },
  errorBox: {
    background: "#fff2f0",
    border: "1px solid #ffccc7",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#cf1322",
    fontSize: 13,
    marginBottom: 16,
  },
  planBtn: {
    width: "100%",
    padding: "10px 0",
    border: "none",
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 14,
  },
};
