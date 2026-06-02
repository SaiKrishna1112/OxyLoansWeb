import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../../Header/Header";
import SideBar from "../../SideBar/SideBar";
import { MARKETPLACE_URL } from "../../../config";
import { getToken, getUserId } from "../../HttpRequest/afterlogin";
import axios from "axios";

const PLANS = [
  {
    key: "FREE",
    label: "Free",
    icon: "🆓",
    model: "Groq (Llama)",
    modelColor: "#595959",
    color: "#595959",
    bg: "#fafafa",
    border: "#d9d9d9",
    headerBg: "#f5f5f5",
    price: "₹0",
    priceSub: "Always free",
    tagline: "Get started with AI-powered portfolio insights",
    features: [
      { text: "AI portfolio narrative (Groq)", included: true },
      { text: "Active & closed deals summary", included: true },
      { text: "Basic earnings view", included: true },
      { text: "Reinvestment profile", included: true },
      { text: "Referral tracking", included: true },
      { text: "FY filter & custom date range", included: false },
      { text: "Investment analytics (6 chart types)", included: false },
      { text: "Smart maturity planner", included: false },
      { text: "Earnings intelligence & forecast", included: false },
      { text: "Investable gap & RBI cap tracker", included: false },
      { text: "Platform health pulse", included: false },
    ],
  },
  {
    key: "SMART",
    label: "Smart",
    icon: "✨",
    model: "Gemini 2.0 Flash",
    modelColor: "#1890ff",
    color: "#0050b3",
    bg: "#ffffff",
    border: "#91d5ff",
    headerBg: "linear-gradient(135deg, #1890ff, #096dd9)",
    price: "₹500",
    priceSub: "per year + GST",
    tagline: "Deeper analysis with Google's Gemini AI",
    badge: "POPULAR",
    features: [
      { text: "Everything in Free", included: true, bold: true },
      { text: "AI portfolio narrative (Gemini)", included: true },
      { text: "FY filter & custom date range", included: true },
      { text: "Investment analytics (6 chart types)", included: true },
      { text: "Smart maturity planner", included: true },
      { text: "Earnings intelligence & forecast", included: true },
      { text: "Bank FD comparison", included: true },
      { text: "Investable gap & RBI cap tracker", included: false },
      { text: "Platform health pulse", included: false },
      { text: "Priority Claude AI access", included: false },
    ],
  },
  {
    key: "PRO",
    label: "Pro",
    icon: "✦",
    model: "Claude (Anthropic)",
    modelColor: "#722ed1",
    color: "#722ed1",
    bg: "#ffffff",
    border: "#d3adf7",
    headerBg: "linear-gradient(135deg, #722ed1, #531dab)",
    price: "₹1,000",
    priceSub: "per year + GST",
    tagline: "Premium Claude AI — the sharpest insights",
    features: [
      { text: "Everything in Smart", included: true, bold: true },
      { text: "AI portfolio narrative (Claude)", included: true },
      { text: "Investable gap & RBI cap tracker", included: true },
      { text: "Platform health pulse", included: true },
      { text: "Premium narrative quality", included: true },
      { text: "Highest accuracy AI model", included: true },
      { text: "Early access to new features", included: true },
      { text: "Priority support", included: true },
    ],
  },
];

const MODEL_LOGOS = {
  FREE:  { emoji: "⚡", name: "Groq",   sub: "Fast & free" },
  SMART: { emoji: "🔷", name: "Gemini", sub: "Google AI" },
  PRO:   { emoji: "🟣", name: "Claude", sub: "Anthropic AI" },
};

export default function LenderAIPlanPage() {
  const [currentTier, setCurrentTier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const userId = getUserId();
    if (!userId) { setLoading(false); return; }
    const numId = userId.replace(/[^0-9]/g, "");
    axios
      .get(`${MARKETPLACE_URL}/v1/ai/lender/${numId}/portfolio`, { headers: { accessToken: token } })
      .then((res) => setCurrentTier(res.data?.membershipTier || "FREE"))
      .catch(() => setCurrentTier("FREE"))
      .finally(() => setLoading(false));
  }, []);

  const currentPlan = PLANS.find((p) => p.key === currentTier) || PLANS[0];

  return (
    <div className="main-wrapper">
      <Header />
      <SideBar />
      <div className="page-wrapper">
        <div className="content container-fluid" style={{ maxWidth: 1100 }}>

          {/* Page header */}
          <div className="page-header mb-2">
            <div className="d-flex align-items-center justify-content-between flex-wrap" style={{ gap: 12 }}>
              <div>
                <h3 className="page-title" style={{ marginBottom: 4 }}>AI Intelligence Plan</h3>
                <p className="text-muted mb-0" style={{ fontSize: 14 }}>
                  Choose the AI model that powers your portfolio insights
                </p>
              </div>
              {!loading && currentTier && (
                <div style={{
                  background: currentPlan.bg,
                  border: `1.5px solid ${currentPlan.border}`,
                  borderRadius: 12, padding: "10px 20px",
                  display: "flex", alignItems: "center", gap: 10,
                }}>
                  <span style={{ fontSize: 22 }}>{currentPlan.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase", letterSpacing: 1 }}>Your Current Plan</div>
                    <div style={{ fontWeight: 700, color: currentPlan.color, fontSize: 18 }}>{currentPlan.label}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Current plan banner */}
          {!loading && currentTier && (
            <div style={{
              background: `linear-gradient(135deg, ${currentPlan.color}18, ${currentPlan.color}08)`,
              border: `1px solid ${currentPlan.border}`,
              borderRadius: 14, padding: "16px 24px", marginBottom: 28,
              display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            }}>
              <div style={{ fontSize: 36 }}>{MODEL_LOGOS[currentTier]?.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: currentPlan.color }}>
                  You're on the {currentPlan.label} plan — powered by {MODEL_LOGOS[currentTier]?.name}
                </div>
                <div style={{ fontSize: 13, color: "#595959", marginTop: 2 }}>
                  {currentPlan.tagline} · {MODEL_LOGOS[currentTier]?.sub}
                </div>
              </div>
              <Link
                to="/ai/portfolio"
                style={{
                  background: currentPlan.color, color: "#fff", borderRadius: 8,
                  padding: "8px 20px", textDecoration: "none", fontWeight: 600, fontSize: 13,
                  whiteSpace: "nowrap",
                }}
              >
                Go to Dashboard →
              </Link>
            </div>
          )}

          {/* Plan cards */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : (
            <div className="row g-4">
              {PLANS.map((plan) => {
                const isCurrent = plan.key === currentTier;
                const isUpgrade = PLANS.indexOf(plan) > PLANS.findIndex((p) => p.key === currentTier);
                return (
                  <div key={plan.key} className="col-12 col-md-4">
                    <div style={{
                      borderRadius: 18,
                      border: `2px solid ${isCurrent ? plan.color : plan.border}`,
                      background: "#fff",
                      boxShadow: isCurrent ? `0 8px 32px ${plan.color}28` : "0 2px 12px rgba(0,0,0,0.06)",
                      height: "100%",
                      display: "flex", flexDirection: "column",
                      transform: isCurrent ? "scale(1.02)" : "scale(1)",
                      transition: "all 0.2s",
                      position: "relative",
                    }}>
                      {/* Badge */}
                      {plan.badge && (
                        <div style={{
                          position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                          background: "#1890ff", color: "#fff", borderRadius: 20,
                          padding: "3px 14px", fontSize: 11, fontWeight: 700, letterSpacing: 1,
                          whiteSpace: "nowrap",
                        }}>
                          {plan.badge}
                        </div>
                      )}
                      {isCurrent && (
                        <div style={{
                          position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                          background: plan.color, color: "#fff", borderRadius: 20,
                          padding: "3px 14px", fontSize: 11, fontWeight: 700, letterSpacing: 1,
                          whiteSpace: "nowrap",
                        }}>
                          ✓ CURRENT PLAN
                        </div>
                      )}

                      {/* Header */}
                      <div style={{
                        background: typeof plan.headerBg === "string" && plan.headerBg.startsWith("linear") ? plan.headerBg : plan.headerBg,
                        borderRadius: "16px 16px 0 0",
                        padding: "22px 24px 18px",
                        color: isCurrent || plan.key !== "FREE" ? "#fff" : "#262626",
                      }}>
                        <div className="d-flex align-items-center" style={{ gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 28 }}>{plan.icon}</span>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 22 }}>{plan.label}</div>
                            <div style={{ fontSize: 12, opacity: 0.8 }}>Powered by {plan.model}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                          <span style={{ fontWeight: 800, fontSize: 30 }}>{plan.price}</span>
                          <span style={{ fontSize: 13, opacity: 0.75 }}>{plan.priceSub}</span>
                        </div>
                      </div>

                      {/* Tagline */}
                      <div style={{ padding: "14px 24px 8px", fontSize: 13, color: "#595959", fontStyle: "italic", borderBottom: "1px solid #f0f0f0" }}>
                        "{plan.tagline}"
                      </div>

                      {/* Features */}
                      <div style={{ padding: "16px 24px", flex: 1 }}>
                        {plan.features.map((f, fi) => (
                          <div key={fi} style={{
                            display: "flex", alignItems: "flex-start", gap: 10,
                            marginBottom: 10, fontSize: 13,
                            fontWeight: f.bold ? 700 : 400,
                            color: f.included ? "#262626" : "#bfbfbf",
                          }}>
                            <span style={{
                              flexShrink: 0, width: 18, height: 18, borderRadius: "50%",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              background: f.included ? (plan.key === "FREE" ? "#f0f0f0" : `${plan.color}18`) : "#f5f5f5",
                              color: f.included ? plan.color : "#d9d9d9",
                              fontSize: 11, fontWeight: 700, marginTop: 1,
                            }}>
                              {f.included ? "✓" : "✗"}
                            </span>
                            {f.text}
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div style={{ padding: "16px 24px 22px" }}>
                        {isCurrent ? (
                          <Link
                            to="/ai/portfolio"
                            style={{
                              display: "block", textAlign: "center",
                              background: plan.color, color: "#fff",
                              borderRadius: 10, padding: "12px", fontWeight: 700, fontSize: 14,
                              textDecoration: "none", transition: "opacity 0.2s",
                            }}
                          >
                            Open Dashboard →
                          </Link>
                        ) : isUpgrade ? (
                          <div style={{
                            display: "block", textAlign: "center",
                            background: "#f5f5f5", color: "#8c8c8c",
                            border: "1px dashed #d9d9d9",
                            borderRadius: 10, padding: "12px", fontWeight: 600, fontSize: 13,
                            cursor: "not-allowed",
                          }}>
                            🔒 Upgrade — Coming Soon
                          </div>
                        ) : (
                          <div style={{
                            display: "block", textAlign: "center",
                            background: "#f6ffed", color: "#52c41a",
                            border: "1px solid #b7eb8f",
                            borderRadius: 10, padding: "12px", fontWeight: 600, fontSize: 13,
                          }}>
                            ✓ You've unlocked this
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* AI Model comparison */}
          <div className="card mt-5 mb-4" style={{ borderRadius: 14, border: "1px solid #f0f0f0" }}>
            <div className="card-header" style={{ background: "#fafafa", borderRadius: "14px 14px 0 0", padding: "16px 24px" }}>
              <h6 style={{ margin: 0, fontWeight: 700 }}>🤖 AI Model Comparison</h6>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {[
                  { plan: "FREE",  model: "Groq (Llama 3)", speed: "Fastest", quality: "Good",     cost: "Free",     color: "#595959", emoji: "⚡", desc: "Fast responses, solid insights for everyday portfolio review." },
                  { plan: "SMART", model: "Gemini 2.0 Flash", speed: "Fast", quality: "Very Good", cost: "₹500/yr",  color: "#1890ff", emoji: "🔷", desc: "Google's latest AI — richer narrative, better pattern recognition." },
                  { plan: "PRO",   model: "Claude (Anthropic)", speed: "Fast", quality: "Best",    cost: "₹1,000/yr", color: "#722ed1", emoji: "🟣", desc: "Most nuanced, detailed, and accurate investment narrative available." },
                ].map((m, i) => (
                  <div key={i} className="col-12 col-md-4">
                    <div style={{
                      borderRadius: 12, border: `1px solid ${m.plan === currentTier ? m.color : "#f0f0f0"}`,
                      padding: "16px 18px",
                      background: m.plan === currentTier ? `${m.color}08` : "#fafafa",
                    }}>
                      <div className="d-flex align-items-center" style={{ gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: 20 }}>{m.emoji}</span>
                        <div>
                          <div style={{ fontWeight: 700, color: m.color, fontSize: 14 }}>{m.model}</div>
                          <div style={{ fontSize: 11, color: "#8c8c8c" }}>{PLANS.find(p => p.key === m.plan)?.label} Plan</div>
                        </div>
                        {m.plan === currentTier && (
                          <span style={{ marginLeft: "auto", background: m.color, color: "#fff", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>YOUR AI</span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: "#595959", lineHeight: 1.6, margin: "0 0 10px" }}>{m.desc}</p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {[{ label: "Speed", val: m.speed }, { label: "Quality", val: m.quality }, { label: "Price", val: m.cost }].map((tag, ti) => (
                          <span key={ti} style={{ background: "#f0f0f0", borderRadius: 6, padding: "2px 8px", fontSize: 11, color: "#595959" }}>
                            <strong>{tag.label}:</strong> {tag.val}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div style={{ background: "#fff7e6", borderRadius: 10, padding: "14px 20px", border: "1px solid #ffd591", marginBottom: 24, fontSize: 13, color: "#873800" }}>
            <strong>Note:</strong> Upgrading your plan changes the AI model that generates your portfolio narrative and insights. All your deal data, earnings, and reports remain the same regardless of plan.
          </div>

        </div>
      </div>
    </div>
  );
}
