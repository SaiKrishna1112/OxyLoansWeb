import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../Header/Header";
import SideBar from "../../SideBar/SideBar";
import Footer from "../../Footer/Footer";
import { MARKETPLACE_URL } from "../../../config";
import { getToken, getUserId } from "../../HttpRequest/afterlogin";

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

export default function LenderAIPlanPage() {
  const navigate = useNavigate();
  const [currentTier, setCurrentTier] = useState("FREE");
  const [validUntil, setValidUntil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
  const [error, setError] = useState(null);

  const userId = getUserId();
  const token = getToken();

  useEffect(() => {
    if (!userId || !token) { navigate("/loginotp"); return; }
    axios
      .get(`${MARKETPLACE_URL}/v1/ai/lender/${userId}/subscription`, {
        headers: { accessToken: token },
      })
      .then((r) => {
        setCurrentTier(r.data.tier || "FREE");
        setValidUntil(r.data.validUntil);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId, token]);

  const handleUpgrade = async (plan) => {
    setPaying(plan);
    setError(null);
    try {
      const res = await axios.post(
        `${MARKETPLACE_URL}/v1/ai/lender/${userId}/subscribe?plan=${plan}`,
        {},
        { headers: { accessToken: token } }
      );
      const sessionId = res.data?.payment_session_id;
      if (!sessionId) throw new Error("Could not initiate payment");

      const cashfree = Cashfree({ mode: "sandbox" });
      cashfree.checkout({
        paymentSessionId: sessionId,
        redirectTarget: "_self",
      });
    } catch (e) {
      setError(e?.response?.data?.error || e.message || "Payment initiation failed");
    } finally {
      setPaying(null);
    }
  };

  if (loading) {
    return (
      <div className="main-wrapper">
        <Header /><SideBar />
        <div className="page-wrapper" style={{ paddingTop: 80, textAlign: "center" }}>
          <p className="text-muted">Loading your plan…</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="main-wrapper">
      <Header />
      <SideBar />
      <div className="page-wrapper">
        <div className="content container-fluid" style={{ maxWidth: 960, margin: "0 auto", paddingTop: 30 }}>
          <div className="text-center mb-4">
            <h3 style={{ fontWeight: 700 }}>OxyLoans AI Dashboard Plans</h3>
            <p className="text-muted">
              Unlock AI-powered insights on your lending portfolio
            </p>
            {currentTier !== "FREE" && validUntil && (
              <span
                style={{
                  background: currentTier === "PRO" ? "#f0e6ff" : "#e6f4ff",
                  color: currentTier === "PRO" ? "#722ed1" : "#1890ff",
                  borderRadius: 20,
                  padding: "4px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Current: {currentTier} · Valid until{" "}
                {new Date(validUntil).toLocaleDateString("en-IN", {
                  day: "2-digit", month: "short", year: "numeric",
                })}
              </span>
            )}
          </div>

          {error && (
            <div className="alert alert-danger text-center">{error}</div>
          )}

          <div className="row justify-content-center">
            {PLANS.map((plan) => {
              const isCurrent = currentTier === plan.key;
              const isDowngrade =
                (currentTier === "PRO" && plan.key !== "PRO") ||
                (currentTier === "SMART" && plan.key === "FREE");

              return (
                <div key={plan.key} className="col-md-4 mb-4">
                  <div
                    className="card h-100"
                    style={{
                      borderRadius: 16,
                      border: isCurrent
                        ? `2px solid ${plan.color}`
                        : "1px solid #f0f0f0",
                      boxShadow: isCurrent
                        ? `0 4px 20px ${plan.color}33`
                        : "0 2px 8px rgba(0,0,0,0.06)",
                      transition: "box-shadow 0.2s",
                    }}
                  >
                    <div className="card-body d-flex flex-column" style={{ padding: 24 }}>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <h5 style={{ fontWeight: 700, color: plan.color, margin: 0 }}>
                          {plan.label}
                        </h5>
                        {plan.badge && (
                          <span
                            style={{
                              background: plan.color + "22",
                              color: plan.color,
                              borderRadius: 12,
                              padding: "2px 10px",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {plan.badge}
                          </span>
                        )}
                      </div>

                      <div className="mb-3">
                        {plan.price === 0 ? (
                          <span style={{ fontSize: 28, fontWeight: 800, color: "#262626" }}>
                            Free
                          </span>
                        ) : (
                          <>
                            <span style={{ fontSize: 28, fontWeight: 800, color: "#262626" }}>
                              ₹{plan.price}
                            </span>
                            <span style={{ fontSize: 13, color: "#8c8c8c", marginLeft: 4 }}>
                              / year
                            </span>
                          </>
                        )}
                      </div>

                      <ul style={{ listStyle: "none", padding: 0, flex: 1 }}>
                        {plan.features.map((f, i) => (
                          <li key={i} style={{ fontSize: 13, marginBottom: 6, display: "flex", alignItems: "flex-start" }}>
                            <span style={{ color: "#52c41a", marginRight: 8, marginTop: 2 }}>✓</span>
                            {f}
                          </li>
                        ))}
                        {plan.locked.map((f, i) => (
                          <li key={`l${i}`} style={{ fontSize: 13, marginBottom: 6, color: "#bfbfbf", display: "flex", alignItems: "flex-start" }}>
                            <span style={{ marginRight: 8, marginTop: 2 }}>🔒</span>
                            {f}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-3">
                        {isCurrent ? (
                          <button className="btn w-100" disabled
                            style={{ background: plan.color + "22", color: plan.color, fontWeight: 700, borderRadius: 8 }}>
                            Current Plan
                          </button>
                        ) : isDowngrade || plan.key === "FREE" ? (
                          <button className="btn w-100" disabled
                            style={{ background: "#f5f5f5", color: "#bfbfbf", borderRadius: 8 }}>
                            {plan.key === "FREE" ? "Default" : "Downgrade not available"}
                          </button>
                        ) : (
                          <button
                            className="btn w-100"
                            onClick={() => handleUpgrade(plan.key)}
                            disabled={paying === plan.key}
                            style={{
                              background: plan.color,
                              color: "#fff",
                              fontWeight: 700,
                              borderRadius: 8,
                              border: "none",
                            }}
                          >
                            {paying === plan.key ? "Processing…" : `Upgrade to ${plan.label} — ₹${plan.price}/yr`}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-2">
            <button
              className="btn btn-link text-muted"
              onClick={() => navigate(-1)}
              style={{ fontSize: 13 }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
