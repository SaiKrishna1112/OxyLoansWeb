import React, { useState, useEffect } from "react";
import axios from "axios";
import { MARKETPLACE_URL, API_USER_URL, ENV } from "../../../config";

// Display prices (what lenders pay) — Cashfree charges may differ for test users
const PLANS = [
  {
    key: "PRO",
    label: "Pro",
    displayPrice: 1000,
    color: "#722ed1",
    badge: "Full AI",
    description: "Complete AI-powered portfolio intelligence",
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
  {
    key: "SMART",
    label: "Smart",
    displayPrice: 500,
    color: "#1890ff",
    badge: "Popular",
    description: "Advanced analytics for active lenders",
    features: [
      "Portfolio overview & deal counts",
      "Earnings breakdown & FY filter",
      "Upcoming payouts calendar",
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
];

export default function LenderUpgradePortal() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const [token, setToken] = useState(() => sessionStorage.getItem("accessToken"));
  const [userId, setUserId] = useState(() => sessionStorage.getItem("userId"));

  const [currentTier, setCurrentTier] = useState("FREE");
  const [onTrial, setOnTrial] = useState(false);
  const [trialEndsOn, setTrialEndsOn] = useState("2026-08-01");
  const [validUntil, setValidUntil] = useState(null);
  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [plansLoading, setPlansLoading] = useState(false);
  const [paying, setPaying] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [planError, setPlanError] = useState(null);

  useEffect(() => {
    if (token && userId) loadSubscription(token, userId);
  }, [token, userId]);

  const loadSubscription = (tok, uid) => {
    setPlansLoading(true);
    axios
      .get(`${MARKETPLACE_URL}/v1/ai/lender/${uid}/subscription`, {
        headers: { accessToken: tok },
      })
      .then((r) => {
        setCurrentTier(r.data.tier || "FREE");
        setOnTrial(!!r.data.onTrial);
        if (r.data.trialEndsOn) setTrialEndsOn(r.data.trialEndsOn);
        if (r.data.validUntil) setValidUntil(r.data.validUntil);
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
        setOnTrial(false);
        setPendingOrderId(null);
        if (res.data.validUntil) setValidUntil(res.data.validUntil);
      } else {
        setPlanError("Payment not confirmed yet by Cashfree. Wait a moment and try again.");
      }
    } catch {
      setPlanError("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubscribe = async (planKey) => {
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
    setOnTrial(false);
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
            <h4 style={{ fontWeight: 700, margin: 0 }}>OxyLoans AI — Subscribe</h4>
            <p style={{ color: "#8c8c8c", fontSize: 13, marginTop: 6 }}>
              Login with your registered lender mobile number
            </p>
          </div>

          {authError && <div style={styles.errorBox}>{authError}</div>}

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
            <button onClick={handleSendOtp} disabled={authLoading} style={styles.primaryBtn}>
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
              <button onClick={handleVerifyOtp} disabled={authLoading} style={styles.primaryBtn}>
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

  const isPaidPro = currentTier === "PRO" && !onTrial;
  const isPaidSmart = currentTier === "SMART" && !onTrial;

  // ── Plans Screen ──────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "30px 16px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
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

          {!onTrial && validUntil && (
            <span style={{
              background: isPaidPro ? "#f0e6ff" : "#e6f4ff",
              color: isPaidPro ? "#722ed1" : "#1890ff",
              borderRadius: 20, padding: "4px 16px", fontSize: 13, fontWeight: 600,
              display: "inline-block", marginTop: 8,
            }}>
              {currentTier} Plan · Valid until{" "}
              {new Date(validUntil).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          )}

          <div style={{ marginTop: 8 }}>
            <button onClick={handleLogout} style={styles.linkBtn}>Logout</button>
          </div>
        </div>

        {/* Free trial banner */}
        {onTrial && (
          <div style={{
            background: "linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%)",
            borderRadius: 14, padding: "16px 24px", marginBottom: 24,
            display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
          }}>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
                🎁 Free PRO trial — ends August 1st
              </div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 3 }}>
                Subscribe now and your plan stays valid until <strong>August 1, 2027</strong>
              </div>
            </div>
            <span style={{
              background: "rgba(255,255,255,0.2)", color: "#fff",
              borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600,
            }}>
              Trial ends {new Date(trialEndsOn).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
        )}

        {planError && <div style={styles.errorBox}>{planError}</div>}

        {pendingOrderId && onTrial && (
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
          <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
            {PLANS.map((plan) => {
              const isPaidThisPlan = (plan.key === "PRO" && isPaidPro) || (plan.key === "SMART" && isPaidSmart);
              const isDowngrade = isPaidPro && plan.key === "SMART"; // PRO → Smart = downgrade
              const isUpgradeFromSmart = plan.key === "PRO" && isPaidSmart;
              const isActionable = !isPaidThisPlan && !isDowngrade;

              let btnLabel;
              if (paying === plan.key) {
                btnLabel = "Processing…";
              } else if (isPaidThisPlan) {
                btnLabel = "✓ Current Plan";
              } else if (isDowngrade) {
                btnLabel = "Downgrade not available";
              } else if (onTrial) {
                btnLabel = `Subscribe to OXY ${plan.label} — ₹${plan.displayPrice.toLocaleString("en-IN")}/year`;
              } else if (isUpgradeFromSmart) {
                btnLabel = "Upgrade to Pro — ₹500 more/yr";
              } else {
                btnLabel = `Subscribe to OXY ${plan.label} — ₹${plan.displayPrice.toLocaleString("en-IN")}/year`;
              }

              return (
                <div key={plan.key} style={{
                  flex: "1 1 0", maxWidth: 380,
                  background: "#fff", borderRadius: 18,
                  border: plan.key === "PRO"
                    ? `2px solid ${plan.color}`
                    : isPaidThisPlan
                      ? `2px solid ${plan.color}`
                      : "1px solid #e8e8e8",
                  boxShadow: plan.key === "PRO"
                    ? `0 6px 28px ${plan.color}33`
                    : "0 2px 10px rgba(0,0,0,0.06)",
                  padding: 28, display: "flex", flexDirection: "column",
                }}>
                  {/* Plan header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <h5 style={{ fontWeight: 800, color: plan.color, margin: 0, fontSize: 18 }}>{plan.label}</h5>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {onTrial && plan.key === "PRO" && (
                        <span style={{ background: "#fff3cd", color: "#856404", borderRadius: 10, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>
                          FREE TRIAL
                        </span>
                      )}
                      {plan.badge && (
                        <span style={{ background: plan.color + "22", color: plan.color, borderRadius: 12, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                          {plan.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 32, fontWeight: 800 }}>₹{plan.displayPrice.toLocaleString("en-IN")}</span>
                    <span style={{ fontSize: 13, color: "#8c8c8c", marginLeft: 4 }}>/year</span>
                  </div>

                  {/* Early subscriber note */}
                  {onTrial && (
                    <div style={{ fontSize: 12, color: "#722ed1", fontWeight: 600, marginBottom: 14 }}>
                      Subscribe now → valid until Aug 1, 2027
                    </div>
                  )}

                  {/* Features */}
                  <ul style={{ listStyle: "none", padding: 0, flex: 1, margin: "0 0 16px 0" }}>
                    {plan.features.map((f, i) => (
                      <li key={i} style={{ fontSize: 13, marginBottom: 7, display: "flex", alignItems: "flex-start" }}>
                        <span style={{ color: "#52c41a", marginRight: 8, flexShrink: 0 }}>✓</span>{f}
                      </li>
                    ))}
                    {(plan.locked || []).map((f, i) => (
                      <li key={`l${i}`} style={{ fontSize: 13, marginBottom: 7, color: "#bfbfbf", display: "flex", alignItems: "flex-start" }}>
                        <span style={{ marginRight: 8, flexShrink: 0 }}>🔒</span>{f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA button */}
                  <button
                    onClick={() => isActionable && handleSubscribe(plan.key)}
                    disabled={!isActionable || paying === plan.key}
                    style={{
                      ...styles.planBtn,
                      background: isPaidThisPlan ? plan.color + "22" : isDowngrade ? "#f5f5f5" : plan.color,
                      color: isPaidThisPlan ? plan.color : isDowngrade ? "#bfbfbf" : "#fff",
                      cursor: isActionable ? "pointer" : "default",
                      fontSize: onTrial ? 13 : 14,
                    }}
                  >
                    {btnLabel}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <p style={{ textAlign: "center", color: "#bfbfbf", fontSize: 12, marginTop: 32 }}>
          Annual subscription · Auto-renews on expiry · Cancel anytime before renewal
        </p>
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
    padding: "12px 0",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 14,
  },
};
