import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import Header from "../../Header/Header";
import SideBar from "../../SideBar/SideBar";
import Footer from "../../Footer/Footer";
import { MARKETPLACE_URL } from "../../../config";
import { getToken, getUserId } from "../../HttpRequest/afterlogin";
import axios from "axios";

const fmt = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const churnColor = (level) => {
  if (!level) return "#8c8c8c";
  const l = level.toUpperCase();
  if (l === "HIGH") return "#ff4d4f";
  if (l === "MEDIUM") return "#faad14";
  return "#52c41a";
};

const reinvestColor = (classification) => {
  const c = (classification || "").toUpperCase();
  if (c === "ALWAYS REINVESTS") return "#52c41a";
  if (c === "LOYAL REINVESTOR") return "#73d13d";
  if (c === "PARTIAL REINVESTOR") return "#faad14";
  if (c === "OCCASIONAL REINVESTOR") return "#fa8c16";
  return "#ff4d4f";
};

const StarRating = ({ rating }) => {
  const count = parseInt((rating || "1").split(" ")[0]) || 1;
  return (
    <span>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= count ? "#faad14" : "#d9d9d9", fontSize: 20 }}>★</span>
      ))}
      <span style={{ fontSize: 12, color: "#8c8c8c", marginLeft: 6 }}>{rating}</span>
    </span>
  );
};

const ProgressBar = ({ pct, color }) => (
  <div style={{ background: "#f0f0f0", borderRadius: 6, height: 10, overflow: "hidden", width: "100%" }}>
    <div
      style={{
        width: `${Math.min(100, Math.max(0, pct || 0))}%`,
        height: "100%",
        background: color || "#1890ff",
        borderRadius: 6,
        transition: "width 0.8s ease",
      }}
    />
  </div>
);

const StatCard = ({ label, value, color, sub, onClick, badge }) => (
  <div className="col-6 col-md mb-3">
    <div
      className="card text-center h-100"
      onClick={onClick}
      style={{
        borderRadius: 12,
        border: onClick ? `1.5px solid ${color || "#1890ff"}30` : "1px solid #f0f0f0",
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.2s, transform 0.15s",
      }}
      onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
      onMouseLeave={(e) => { if (onClick) { e.currentTarget.style.boxShadow = ""; e.currentTarget.style.transform = ""; }}}
    >
      <div className="card-body py-3 px-2">
        <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#8c8c8c", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          {label}
          {onClick && <span style={{ fontSize: 9, color: color || "#1890ff", opacity: 0.7 }}>↓</span>}
        </p>
        <h4 style={{ fontWeight: 700, color: color || "#262626", margin: 0 }}>{value}</h4>
        {badge && <span style={{ display: "inline-block", marginTop: 4, background: `${color || "#1890ff"}18`, color: color || "#1890ff", borderRadius: 4, fontSize: 10, padding: "1px 6px", fontWeight: 600 }}>{badge}</span>}
        {sub && <p style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4, marginBottom: 0 }}>{sub}</p>}
      </div>
    </div>
  </div>
);

const InterestBreakdownCard = ({ data }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="col-6 col-md mb-3">
      <div
        className="card text-center h-100"
        style={{ borderRadius: 12, border: "1px solid #f0f0f0", cursor: "pointer", transition: "box-shadow 0.2s" }}
        onClick={() => setOpen((o) => !o)}
        title="Click to see breakdown"
      >
        <div className="card-body py-3 px-2">
          <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#8c8c8c", marginBottom: 6 }}>
            Interest Earned
            <span style={{ marginLeft: 6, fontSize: 10, color: "#1890ff" }}>{open ? "▲" : "▼"}</span>
          </p>
          <h4 style={{ fontWeight: 700, color: "#52c41a", margin: 0 }}>₹{fmt(data.totalInterestEarned)}</h4>
          {open && (
            <div style={{ borderTop: "1px solid #f0f0f0", marginTop: 8, paddingTop: 8, textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                <span style={{ color: "#52c41a", fontWeight: 600 }}>● Monthly payouts</span>
                <span style={{ fontWeight: 700 }}>₹{fmt(data.lenderInterest)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: data.withdrawalInterest > 0 ? 5 : 0 }}>
                <span style={{ color: "#1890ff", fontWeight: 600 }}>● Closure interest</span>
                <span style={{ fontWeight: 700 }}>₹{fmt(data.closureInterest)}</span>
              </div>
              {data.withdrawalInterest > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "#fa8c16", fontWeight: 600 }}>● On exit</span>
                  <span style={{ fontWeight: 700 }}>₹{fmt(data.withdrawalInterest)}</span>
                </div>
              )}
              <div style={{ fontSize: 10, color: "#8c8c8c", marginTop: 6, borderTop: "1px dashed #f0f0f0", paddingTop: 4 }}>
                Monthly = regular payouts · Closure = final settlement on deal close
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SectionCard = ({ title, badge, children }) => (
  <div className="card mb-4" style={{ borderRadius: 14, border: "1px solid #f0f0f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
    <div className="card-header" style={{ background: "#fafafa", borderBottom: "1px solid #f0f0f0", borderRadius: "14px 14px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <h6 style={{ margin: 0, fontWeight: 700, color: "#262626" }}>{title}</h6>
      {badge}
    </div>
    <div className="card-body">{children}</div>
  </div>
);

// ── AI CHAT WIDGET ─────────────────────────────────────────────────────────
const AIChatWidget = ({ lenderId, lenderName }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: `Hi ${lenderName || "there"}! I'm your OxyLoans AI assistant. Ask me anything about your investments — earnings, deals, wallet, ROI and more.` }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setSending(true);
    try {
      const token = getToken();
      const res = await axios.post(
        `${MARKETPLACE_URL}/v1/ai/chat`,
        { message: text, userId: lenderId },
        { headers: { accessToken: token, "Content-Type": "application/json" } }
      );
      const reply = res.data?.response || res.data?.message || res.data?.reply
        || (typeof res.data === "string" ? res.data : "I couldn't find an answer for that.");
      setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 9999,
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg, #1a237e, #6a1b9a)",
          border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(106,27,154,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 24,
        }}
        title="Ask AI"
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: "fixed", bottom: 96, right: 24, zIndex: 9998,
          width: 360, maxWidth: "calc(100vw - 48px)",
          background: "#fff", borderRadius: 16,
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column",
          border: "1px solid #e8e8e8", overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ background: "linear-gradient(135deg, #1a237e, #6a1b9a)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🤖</span>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>OxyLoans AI Assistant</div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>Ask about your investments</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px", maxHeight: 340, minHeight: 200 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 12, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "80%", padding: "10px 14px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: m.role === "user" ? "linear-gradient(135deg, #1a237e, #6a1b9a)" : "#f5f5f5",
                  color: m.role === "user" ? "#fff" : "#262626",
                  fontSize: 13, lineHeight: 1.5,
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {sending && (
              <div style={{ display: "flex", gap: 6, padding: "8px 14px" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#6a1b9a", animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid #f0f0f0", display: "flex", gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about your deals, earnings…"
              style={{ flex: 1, border: "1px solid #e8e8e8", borderRadius: 24, padding: "8px 14px", fontSize: 13, outline: "none" }}
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              style={{
                background: sending || !input.trim() ? "#d9d9d9" : "linear-gradient(135deg, #1a237e, #6a1b9a)",
                border: "none", borderRadius: 24, padding: "8px 16px",
                color: "#fff", cursor: sending || !input.trim() ? "default" : "pointer", fontSize: 13, fontWeight: 600,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }`}</style>
    </>
  );
};

// ── DEAL ANALYTICS CHARTS ──────────────────────────────────────────────────
// ── FY FILTER BAR ──────────────────────────────────────────────────────────
const buildFyTabs = () => {
  const now = new Date();
  const curFyStart = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1; // 0-indexed month
  return [curFyStart - 2, curFyStart - 1, curFyStart].map((y) => ({
    label: `FY ${String(y).slice(2)}-${String(y + 1).slice(2)}`,
    fyYear: y,
  }));
};

const FyFilterBar = ({ fyFilter, setFyFilter, loading }) => {
  const tabs = buildFyTabs();
  const [customFrom, setCustomFrom] = useState(fyFilter.from || "");
  const [customTo,   setCustomTo]   = useState(fyFilter.to   || "");

  const isActive = (mode, fyYear) => {
    if (mode === "all")    return fyFilter.mode === "all";
    if (mode === "fy")     return fyFilter.mode === "fy" && fyFilter.fyYear === fyYear;
    if (mode === "custom") return fyFilter.mode === "custom";
    return false;
  };

  const tabStyle = (active) => ({
    padding: "7px 18px",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    background: active ? "linear-gradient(135deg, #1a237e, #6a1b9a)" : "transparent",
    color: active ? "#fff" : "#595959",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  });

  const applyCustom = () => {
    if (customFrom && customTo && customFrom <= customTo) {
      setFyFilter({ mode: "custom", fyYear: null, from: customFrom, to: customTo });
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: "14px 18px", marginBottom: 20, border: "1px solid #f0f0f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 12, color: "#8c8c8c", textTransform: "uppercase", letterSpacing: 1, marginRight: 4, whiteSpace: "nowrap" }}>Earnings Period</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, background: "#fafafa", borderRadius: 24, padding: "4px 6px", border: "1px solid #f0f0f0" }}>
          <button style={tabStyle(isActive("all"))} onClick={() => setFyFilter({ mode: "all", fyYear: null, from: "", to: "" })}>
            All Time
          </button>
          {tabs.map((t) => (
            <button key={t.fyYear} style={tabStyle(isActive("fy", t.fyYear))}
              onClick={() => setFyFilter({ mode: "fy", fyYear: t.fyYear, from: "", to: "" })}>
              {t.label}
            </button>
          ))}
          <button style={tabStyle(isActive("custom"))} onClick={() => setFyFilter((f) => ({ ...f, mode: "custom" }))}>
            Custom
          </button>
        </div>
        {loading && <span style={{ fontSize: 12, color: "#1890ff", marginLeft: 8 }}>Updating…</span>}
      </div>

      {fyFilter.mode === "custom" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
          <div>
            <label style={{ fontSize: 11, color: "#8c8c8c", display: "block", marginBottom: 3 }}>From</label>
            <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)}
              style={{ border: "1px solid #d9d9d9", borderRadius: 8, padding: "6px 10px", fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#8c8c8c", display: "block", marginBottom: 3 }}>To</label>
            <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)}
              style={{ border: "1px solid #d9d9d9", borderRadius: 8, padding: "6px 10px", fontSize: 13 }} />
          </div>
          <button onClick={applyCustom} disabled={!customFrom || !customTo || customFrom > customTo}
            style={{ marginTop: 14, padding: "7px 20px", background: customFrom && customTo && customFrom <= customTo ? "linear-gradient(135deg, #1a237e, #6a1b9a)" : "#d9d9d9", color: "#fff", border: "none", borderRadius: 8, cursor: customFrom && customTo && customFrom <= customTo ? "pointer" : "default", fontWeight: 600, fontSize: 13 }}>
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

// ── EARNINGS PERIOD SUMMARY ────────────────────────────────────────────────
const EarningsPeriodSummary = ({ earningsData, loading }) => {
  if (!earningsData) return null;
  const interest   = earningsData.fyInterestEarned   || 0;
  const principal  = earningsData.fyPrincipalReturned || 0;
  const total      = earningsData.fyTotalReceived     || 0;
  const upcoming   = earningsData.upcomingTotal       || 0;
  const label      = earningsData.fyLabel             || "Period";
  const narrative  = earningsData.narrative           || "";

  return (
    <div style={{ background: "linear-gradient(135deg, #f0f5ff, #f9f0ff)", borderRadius: 14, padding: "18px 20px", marginBottom: 20, border: "1px solid #d6e4ff", position: "relative" }}>
      {loading && (
        <div style={{ position: "absolute", top: 12, right: 16, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#1890ff" }}>
          <div className="spinner-border spinner-border-sm" role="status" style={{ width: 14, height: 14, borderWidth: 2 }} />
          Refreshing
        </div>
      )}
      <div style={{ fontWeight: 700, fontSize: 14, color: "#1a237e", marginBottom: 14 }}>
        {label} Earnings Summary
      </div>
      <div className="row g-3 mb-3">
        {[
          { label: "Interest Earned", value: `₹${fmt(interest)}`, color: "#52c41a", bg: "#f6ffed" },
          { label: "Principal Returned", value: `₹${fmt(principal)}`, color: "#1890ff", bg: "#e6f7ff" },
          { label: "Total Received", value: `₹${fmt(total)}`, color: "#722ed1", bg: "#f9f0ff" },
          { label: "Upcoming (60 days)", value: `₹${fmt(upcoming)}`, color: "#fa8c16", bg: "#fff7e6" },
        ].map((item) => (
          <div key={item.label} className="col-6 col-md-3">
            <div style={{ background: item.bg, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: item.color }}>{item.value}</div>
            </div>
          </div>
        ))}
      </div>
      {narrative && (
        <div style={{ borderTop: "1px solid rgba(114,46,209,0.15)", paddingTop: 12 }}>
          {narrative.split("\n").map((line) => line.trim()).filter((l) => l.length > 0).map((line, idx) => (
            <div key={idx} style={{ fontSize: 13, color: "#391085", lineHeight: 1.7, marginBottom: 4 }}>
              {line.replace(/^[•\-\*]+\s*/, "• ")}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ReferralBonusCard = ({ data }) => {
  const [open, setOpen] = React.useState(false);
  const total   = data.referralEarnings   ?? 0;
  const paid    = data.referralPaidAmount  ?? 0;
  const unpaid  = data.referralUnpaidAmount ?? 0;
  const count   = data.referredLendersCount ?? 0;
  const deployed = data.totalReferredAmount ?? 0;
  return (
    <div className="col-6 col-md mb-3">
      <div
        className="card text-center h-100"
        style={{ borderRadius: 12, border: "1px solid #f0f0f0", cursor: count > 0 ? "pointer" : "default", transition: "box-shadow 0.2s" }}
        onClick={() => count > 0 && setOpen((o) => !o)}
        title={count > 0 ? "Click to see breakdown" : undefined}
      >
        <div className="card-body py-3 px-2">
          <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#8c8c8c", marginBottom: 6 }}>
            Referral Bonus
            {count > 0 && <span style={{ marginLeft: 6, fontSize: 10, color: "#f759ab" }}>{open ? "▲" : "▼"}</span>}
          </p>
          <h4 style={{ fontWeight: 700, color: "#f759ab", margin: 0 }}>₹{fmt(total)}</h4>
          <p style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4, marginBottom: 0 }}>
            {count > 0 ? `${count} referral${count > 1 ? "s" : ""} · ₹${fmt(deployed)} deployed` : "No referrals yet"}
          </p>
          {open && (
            <div style={{ borderTop: "1px solid #f0f0f0", marginTop: 8, paddingTop: 8, textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                <span style={{ color: "#52c41a", fontWeight: 600 }}>● Paid</span>
                <span style={{ fontWeight: 700 }}>₹{fmt(paid)}</span>
              </div>
              {unpaid > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "#faad14", fontWeight: 600 }}>● Pending</span>
                  <span style={{ fontWeight: 700 }}>₹{fmt(unpaid)}</span>
                </div>
              )}
              <div style={{ fontSize: 10, color: "#8c8c8c", marginTop: 6, borderTop: "1px dashed #f0f0f0", paddingTop: 4 }}>
                Paid = credited to wallet · Pending = accumulated, awaiting 28th
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DealAnalyticsCharts = ({ data, earningsData }) => {
  const allDeals = data?.allDeals || data?.deals || [];

  // Short-term (<= 3 months), Medium (4–6 months), Long-term (> 6 months)
  const tenureCounts = { "Short (≤3m)": 0, "Medium (4–6m)": 0, "Long (>6m)": 0 };
  const tenureGroups = { short: [], medium: [], long: [] };
  allDeals.forEach((d) => {
    const start = d.startDate ? new Date(d.startDate) : null;
    const end = d.endDate ? new Date(d.endDate) : null;
    const months = start && end ? Math.round((end - start) / (1000 * 60 * 60 * 24 * 30)) : 0;
    const annualRoi = (d.rateOfInterest || 0) < 5 ? (d.rateOfInterest || 0) * 12 : (d.rateOfInterest || 0);
    const entry = { roi: annualRoi, interest: d.interestEarned || 0, amount: d.amount || 0 };
    if (months <= 3) { tenureCounts["Short (≤3m)"]++; tenureGroups.short.push(entry); }
    else if (months <= 6) { tenureCounts["Medium (4–6m)"]++; tenureGroups.medium.push(entry); }
    else { tenureCounts["Long (>6m)"]++; tenureGroups.long.push(entry); }
  });

  // Short vs Long ROI analysis
  const calcAvg = (arr, key) => arr.length ? arr.reduce((s, x) => s + x[key], 0) / arr.length : 0;
  const shortAvgRoi = calcAvg(tenureGroups.short, "roi");
  const longAvgRoi  = calcAvg(tenureGroups.long,  "roi");
  const shortTotalInterest = tenureGroups.short.reduce((s, x) => s + x.interest, 0);
  const longTotalInterest  = tenureGroups.long.reduce((s, x) => s + x.interest, 0);
  const shortTotalAmount   = tenureGroups.short.reduce((s, x) => s + x.amount, 0);
  const longTotalAmount    = tenureGroups.long.reduce((s, x) => s + x.amount, 0);

  // ROI distribution buckets — annualize monthly rates (< 5 = monthly %)
  const roiBuckets = { "<12%": 0, "12–15%": 0, "15–18%": 0, "18–24%": 0, ">24%": 0 };
  allDeals.forEach((d) => {
    const raw = d.rateOfInterest || 0;
    const roi = raw < 5 ? raw * 12 : raw;
    if (roi < 12) roiBuckets["<12%"]++;
    else if (roi < 15) roiBuckets["12–15%"]++;
    else if (roi < 18) roiBuckets["15–18%"]++;
    else if (roi < 24) roiBuckets["18–24%"]++;
    else roiBuckets[">24%"]++;
  });

  // Monthly earnings trend from earnings endpoint
  const monthlyEarnings = (earningsData?.monthlyEarnings || []).slice(0, 12).reverse();
  const earnLabels = monthlyEarnings.map((m) => m.monthLabel || `${m.month}/${m.year}`);
  const earnInterest = monthlyEarnings.map((m) => Math.round(m.interestAmount || 0));
  const earnPrincipal = monthlyEarnings.map((m) => Math.round(m.principalReturned || 0));

  // Active vs Closed
  const activeCount = data?.activeDeals || 0;
  const closedCount = data?.closedDeals || 0;

  const pieOptions = {
    chart: { type: "donut", fontFamily: "inherit" },
    legend: { position: "bottom" },
    plotOptions: { pie: { donut: { size: "60%" } } },
    colors: ["#52c41a", "#8c8c8c"],
    dataLabels: { style: { fontSize: "13px" } },
  };

  const tenureOptions = {
    chart: { type: "donut", fontFamily: "inherit" },
    labels: Object.keys(tenureCounts),
    legend: { position: "bottom" },
    plotOptions: { pie: { donut: { size: "60%" } } },
    colors: ["#1890ff", "#722ed1", "#f759ab"],
    dataLabels: { style: { fontSize: "12px" } },
  };

  const roiBarOptions = {
    chart: { type: "bar", fontFamily: "inherit", toolbar: { show: false } },
    xaxis: { categories: Object.keys(roiBuckets) },
    yaxis: { title: { text: "Number of Deals" } },
    colors: ["#722ed1"],
    plotOptions: { bar: { borderRadius: 6, columnWidth: "55%" } },
    dataLabels: { enabled: true },
    title: { text: "ROI Distribution", align: "left", style: { fontSize: "13px", fontWeight: 700 } },
  };

  const earningsBarOptions = {
    chart: { type: "bar", stacked: false, fontFamily: "inherit", toolbar: { show: false } },
    xaxis: { categories: earnLabels, labels: { rotate: -45, style: { fontSize: "11px" } } },
    yaxis: { title: { text: "Amount (₹)" }, labels: { formatter: (v) => `₹${(v / 1000).toFixed(0)}K` } },
    colors: ["#52c41a", "#1890ff"],
    plotOptions: { bar: { borderRadius: 4, columnWidth: "60%" } },
    dataLabels: { enabled: false },
    legend: { position: "top" },
    title: { text: "Monthly Earnings Trend", align: "left", style: { fontSize: "13px", fontWeight: 700 } },
    tooltip: { y: { formatter: (v) => `₹${v.toLocaleString("en-IN")}` } },
  };

  return (
    <SectionCard title="Investment Analytics" badge={<span style={{ background: "#f9f0ff", color: "#722ed1", border: "1px solid #d3adf7", borderRadius: 6, padding: "2px 10px", fontSize: 12 }}>Charts</span>}>
      <div className="row">
        {/* Earnings trend */}
        {earnLabels.length > 0 && (
          <div className="col-12 mb-4">
            <ReactApexChart
              options={earningsBarOptions}
              series={[
                { name: "Interest Earned", data: earnInterest },
                { name: "Principal Returned", data: earnPrincipal },
              ]}
              type="bar"
              height={260}
            />
          </div>
        )}

        {/* Active vs Closed donut */}
        <div className="col-12 col-md-4 mb-4">
          <div style={{ textAlign: "center", marginBottom: 8, fontWeight: 700, fontSize: 13, color: "#595959" }}>
            Deal Status
          </div>
          <ReactApexChart
            options={{ ...pieOptions, labels: ["Active", "Closed"] }}
            series={[activeCount, closedCount]}
            type="donut"
            height={220}
          />
        </div>

        {/* Short vs Long tenure */}
        <div className="col-12 col-md-4 mb-4">
          <div style={{ textAlign: "center", marginBottom: 8, fontWeight: 700, fontSize: 13, color: "#595959" }}>
            Short-term vs Long-term Deals
          </div>
          <ReactApexChart
            options={tenureOptions}
            series={Object.values(tenureCounts)}
            type="donut"
            height={220}
          />
        </div>

        {/* ROI distribution bar */}
        <div className="col-12 col-md-4 mb-4">
          <ReactApexChart
            options={roiBarOptions}
            series={[{ name: "Deals", data: Object.values(roiBuckets) }]}
            type="bar"
            height={220}
          />
        </div>

        {/* Short-term vs Long-term ROI insight */}
        {(tenureGroups.short.length > 0 || tenureGroups.long.length > 0) && (
          <div className="col-12 mb-4">
            <div style={{ background: "linear-gradient(135deg, #fff7e6, #ffe7ba)", borderRadius: 12, padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#ad4e00", marginBottom: 12 }}>
                Short-term vs Long-term Strategy Analysis
              </div>
              <div className="row">
                <div className="col-12 col-md-4 mb-3 mb-md-0">
                  <div style={{ textAlign: "center", background: "rgba(255,255,255,0.6)", borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase", letterSpacing: 1 }}>Short-term (≤3m)</div>
                    <div style={{ fontWeight: 700, fontSize: 22, color: "#fa8c16" }}>{shortAvgRoi.toFixed(1)}% p.a.</div>
                    <div style={{ fontSize: 12, color: "#8c8c8c" }}>{tenureGroups.short.length} deals · ₹{(shortTotalInterest / 1000).toFixed(0)}K earned</div>
                  </div>
                </div>
                <div className="col-12 col-md-4 mb-3 mb-md-0">
                  <div style={{ textAlign: "center", background: "rgba(255,255,255,0.6)", borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase", letterSpacing: 1 }}>Long-term (&gt;6m)</div>
                    <div style={{ fontWeight: 700, fontSize: 22, color: "#1890ff" }}>{longAvgRoi.toFixed(1)}% p.a.</div>
                    <div style={{ fontSize: 12, color: "#8c8c8c" }}>{tenureGroups.long.length} deals · ₹{(longTotalInterest / 1000).toFixed(0)}K earned</div>
                  </div>
                </div>
                <div className="col-12 col-md-4">
                  <div style={{ fontSize: 13, color: "#7c3900", lineHeight: 1.7, padding: "8px 4px" }}>
                    {shortAvgRoi > longAvgRoi
                      ? `Short-term deals offer ${(shortAvgRoi - longAvgRoi).toFixed(1)}% higher ROI. Rolling short-term deals can maximise returns if you reinvest quickly.`
                      : longAvgRoi > shortAvgRoi
                      ? `Long-term deals lock in ${(longAvgRoi - shortAvgRoi).toFixed(1)}% higher ROI. Fewer reinvestment cycles needed — good for passive investors.`
                      : "Your short and long-term deal ROIs are similar — your strategy is well diversified."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* India's Largest Bank FD comparison inline */}
        {data?.fdComparison && (
          <div className="col-12">
            <ReactApexChart
              options={{
                chart: { type: "bar", fontFamily: "inherit", toolbar: { show: false } },
                xaxis: { categories: ["Your OxyLoans ROI", "Bank FD (avg)"] },
                yaxis: { title: { text: "Rate (%)" }, max: Math.max(data.fdComparison.oxyloansReturnPct || 0, 8) + 2 },
                colors: ["#52c41a", "#8c8c8c"],
                plotOptions: { bar: { borderRadius: 6, columnWidth: "35%", distributed: true } },
                dataLabels: { enabled: true, formatter: (v) => `${v}%` },
                legend: { show: false },
                title: { text: "Your Returns vs Bank FD", align: "left", style: { fontSize: "13px", fontWeight: 700 } },
              }}
              series={[{ name: "Rate", data: [data.fdComparison.oxyloansReturnPct || 0, data.fdComparison.sbiFdRate || 6.8] }]}
              type="bar"
              height={200}
            />
          </div>
        )}
      </div>
    </SectionCard>
  );
};

// ── MAIN DASHBOARD ─────────────────────────────────────────────────────────
const LenderPortfolioDashboard = () => {
  const { lenderId: paramLenderId } = useParams();
  const resolvedLenderId = paramLenderId || getUserId();

  const [data, setData] = useState(null);
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dealsShown, setDealsShown] = useState(10);
  const [fyFilter, setFyFilter] = useState({ mode: "all", fyYear: null, from: "", to: "" });
  const [selectedModel, setSelectedModel] = useState(null);
  const [maturityFilter, setMaturityFilter] = useState("all"); // 'all' | 'thisMonth' | 'next90'
  const [closedDealsOpen, setClosedDealsOpen] = useState(false);

  const activeDealsRef  = useRef(null);
  const maturityRef     = useRef(null);
  const safetyRef       = useRef(null);
  const closedDealsRef  = useRef(null);

  const scrollTo = (ref, filter) => {
    if (filter) filter();
    setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  // Portfolio — reloads when lender or model changes
  useEffect(() => {
    if (!resolvedLenderId) return;
    const token = getToken();
    setLoading(true);
    setError(null);
    const qs = selectedModel ? `?model=${selectedModel}` : "";
    axios.get(`${MARKETPLACE_URL}/v1/ai/lender/${resolvedLenderId}/portfolio${qs}`, { headers: { accessToken: token } })
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.error || err.message || "Failed to load portfolio"))
      .finally(() => setLoading(false));
  }, [resolvedLenderId, selectedModel]);

  // Earnings — reloads when lender, FY filter, or model changes
  useEffect(() => {
    if (!resolvedLenderId) return;
    const token = getToken();
    setEarningsLoading(true);
    const params = new URLSearchParams();
    if (fyFilter.mode === "fy" && fyFilter.fyYear) {
      params.append("fy", fyFilter.fyYear);
    } else if (fyFilter.mode === "custom" && fyFilter.from && fyFilter.to) {
      params.append("from", fyFilter.from);
      params.append("to", fyFilter.to);
    }
    if (selectedModel) params.append("model", selectedModel);
    const qs = params.toString();
    const url = `${MARKETPLACE_URL}/v1/ai/lender/${resolvedLenderId}/earnings${qs ? "?" + qs : ""}`;
    axios.get(url, { headers: { accessToken: token } })
      .then((res) => setEarningsData(res.data))
      .catch(() => {/* keep previous data on error */})
      .finally(() => setEarningsLoading(false));
  }, [resolvedLenderId, fyFilter, selectedModel]);

  return (
    <div className="main-wrapper">
      <Header />
      <SideBar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header mb-4">
            <h3 className="page-title">My Investment Portfolio</h3>
            <p className="text-muted mb-0">AI-powered personal wealth summary</p>
          </div>

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-3 text-muted">Preparing your portfolio narrative…</p>
            </div>
          )}

          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && data && (
            <>
              {/* ── 1. HERO NARRATIVE ──────────────────────────────────────── */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card" style={{ background: "linear-gradient(135deg, #1a237e 0%, #4a148c 60%, #6a1b9a 100%)", border: "none", borderRadius: 16 }}>
                    <div className="card-body p-4">
                      <div className="d-flex align-items-start mb-3" style={{ flexWrap: "wrap", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ color: "#fff", margin: 0, fontWeight: 700, fontSize: 22 }}>{data.lenderName}</h4>
                          {data.email && <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{data.email}</span>}
                          <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
                            {[
                              { label: "Member Since", value: data.memberSince ? new Date(data.memberSince).getFullYear() : "—" },
                              { label: "Years Active", value: `${data.memberSinceYears ?? "—"} yrs` },
                              data.city && { label: "City", value: data.city },
                            ].filter(Boolean).map((item) => (
                              <div key={item.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: "6px 14px" }}>
                                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>{item.label}</div>
                                <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{item.value}</div>
                              </div>
                            ))}
                            {data.churnRiskLevel && (
                              <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: "6px 14px" }}>
                                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Engagement</div>
                                <div style={{ color: churnColor(data.churnRiskLevel), fontWeight: 700, fontSize: 14 }}>{data.churnRiskLevel} RISK</div>
                              </div>
                            )}
                          </div>
                        </div>
                        {data.reinvestmentStarRating && (
                          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 16px", textAlign: "center" }}>
                            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, textTransform: "uppercase", marginBottom: 4 }}>Reinvestment</div>
                            <StarRating rating={data.reinvestmentStarRating} />
                          </div>
                        )}
                      </div>
                      {/* ── Model selector ── */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>AI Model</span>
                        {[
                          { key: null,     label: "Auto",   color: "#8c8c8c" },
                          { key: "claude", label: "Claude", color: "#a78bfa" },
                          { key: "groq",   label: "Groq",   color: "#60a5fa" },
                          { key: "gemini", label: "Gemini", color: "#34d399" },
                        ].map(({ key, label, color }) => {
                          const active = selectedModel === key;
                          return (
                            <button
                              key={String(key)}
                              onClick={() => setSelectedModel(key)}
                              style={{
                                padding: "5px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                                fontSize: 12, fontWeight: active ? 700 : 500,
                                background: active ? color : "rgba(255,255,255,0.1)",
                                color: active ? "#fff" : "rgba(255,255,255,0.65)",
                                transition: "all 0.2s",
                              }}
                            >
                              {label}
                            </button>
                          );
                        })}
                        {loading && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginLeft: 6 }}>Regenerating…</span>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {(data.narrative || data.aiNarrative || "").split("\n").map((line) => line.trim()).filter((line) => line.length > 0).map((line, idx) => {
                          const icons = ["🎯", "💰", "♻️", "📈", "💡"];
                          const text = line.replace(/^[•\-\*#]+\s*/, "").replace(/\*\*/g, "");
                          return (
                            <div key={idx} style={{ background: "rgba(255,255,255,0.09)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 12, border: "1px solid rgba(255,255,255,0.12)" }}>
                              <span style={{ fontSize: 20, lineHeight: 1 }}>{icons[idx] || "•"}</span>
                              <span style={{ color: "#fff", fontSize: 15, lineHeight: 1.6 }}>{text}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 2. STATS — 2 rows × 4 boxes ────────────────────────────── */}
              <div className="row mb-2">
                <StatCard label="Total Invested" value={`₹${fmt(data.totalInvested)}`} color="#1890ff"
                  sub={data.totalWithdrawn > 0 ? `Net deployed ₹${fmt(data.netInvested)}` : null} />
                <InterestBreakdownCard data={data} />
                <StatCard label="Principal Returned" value={`₹${fmt(data.totalPrincipalReturned)}`} color="#13c2c2"
                  sub={data.closedDeals > 0 ? `Across ${data.closedDeals} closed deals` : null}
                  onClick={() => scrollTo(closedDealsRef, () => setClosedDealsOpen(true))} />
                <StatCard label="Wallet Balance" value={`₹${fmt(data.walletBalance)}`} color="#722ed1"
                  sub={data.walletIdleDays > 0 ? `Idle ${Math.round(data.walletIdleDays)} days` : "Active"} />
              </div>
              <div className="row mb-4">
                <StatCard label="Active Deals" value={data.activeDeals ?? "—"} color="#52c41a"
                  sub={`${data.closedDeals ?? 0} closed · ${data.totalDeals ?? 0} total`}
                  onClick={() => scrollTo(activeDealsRef)} />
                <StatCard
                  label="Maturing This Month"
                  value={data.maturingThisMonthCount ?? 0}
                  color={data.maturingThisMonthCount > 0 ? "#fa8c16" : "#8c8c8c"}
                  badge={data.maturingThisMonthCount > 0 ? "Action needed" : null}
                  sub={data.maturingThisMonthCount > 0 ? "Click to view & plan" : "None this month"}
                  onClick={() => scrollTo(maturityRef, () => setMaturityFilter("thisMonth"))} />
                <StatCard
                  label="Payout Reliability"
                  value={`${data.onTimePaymentRate ?? 100}%`}
                  color={data.onTimePaymentRate >= 95 ? "#52c41a" : data.onTimePaymentRate >= 80 ? "#faad14" : "#ff4d4f"}
                  sub={`${data.successfulPayments ?? 0} of ${data.totalPayments ?? 0} on time`}
                  onClick={() => scrollTo(safetyRef)} />
                <StatCard
                  label="Closed Deals"
                  value={data.closedDeals ?? 0}
                  color="#8c8c8c"
                  sub={data.closedDeals > 0 ? `₹${fmt(data.totalPrincipalReturned)} returned` : "No closed deals yet"}
                  onClick={() => scrollTo(closedDealsRef, () => setClosedDealsOpen(true))} />
              </div>

              {/* ── 3. INVESTMENT ANALYTICS (CHARTS) ──────────────────────── */}
              <FyFilterBar fyFilter={fyFilter} setFyFilter={setFyFilter} loading={earningsLoading} />
              <EarningsPeriodSummary earningsData={earningsData} loading={earningsLoading} />
              <DealAnalyticsCharts data={data} earningsData={earningsData} />

              {/* ── 4. ACTIVE DEALS WITH PROGRESS BARS ────────────────────── */}
              {(data.activeDealsWithProgress || []).length > 0 && (
                <div ref={activeDealsRef}>
                <SectionCard
                  title={`Active Deals (${data.activeDeals ?? (data.activeDealsWithProgress || []).length})`}
                  badge={<span style={{ background: "#f6ffed", color: "#52c41a", border: "1px solid #b7eb8f", borderRadius: 6, padding: "2px 10px", fontSize: 12 }}>Live</span>}
                >
                  <div className="row">
                    {[...(data.activeDealsWithProgress || [])].sort((a, b) => (b.dealId || 0) - (a.dealId || 0)).map((deal, idx) => (
                      <div key={idx} className="col-12 col-md-6 mb-3">
                        <div style={{ background: "#fafafa", borderRadius: 10, padding: 16, border: "1px solid #f0f0f0" }}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span style={{ fontWeight: 700, color: "#262626" }}>Deal #{deal.dealId}</span>
                            <span style={{ color: "#1890ff", fontWeight: 600 }}>₹{fmt(deal.amount)}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-1">
                            <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                              {deal.rateOfInterest < 5
                                ? `${(deal.rateOfInterest * 12).toFixed(1)}% p.a. (${deal.rateOfInterest}%/mo)`
                                : `${deal.rateOfInterest}% p.a.`}
                            </span>
                            <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                              {deal.daysTotal > 0
                                ? `${deal.daysPassed || 0} / ${deal.daysTotal} days`
                                : (deal.startDate || deal.endDate)
                                  ? `${fmtDate(deal.startDate)} – ${fmtDate(deal.endDate)}`
                                  : "Dates N/A"}
                            </span>
                          </div>
                          <ProgressBar pct={deal.progressPct} color={deal.progressPct >= 75 ? "#52c41a" : deal.progressPct >= 40 ? "#1890ff" : "#faad14"} />
                          <div className="d-flex justify-content-between mt-2">
                            <span style={{ fontSize: 12, color: "#52c41a" }}>Earned: ₹{fmt(deal.interestEarned)}</span>
                            <span style={{ fontSize: 12, color: deal.daysToMaturity > 0 && deal.daysToMaturity <= 30 ? "#ff4d4f" : "#8c8c8c" }}>
                              {deal.daysToMaturity > 0
                                ? `${deal.daysToMaturity}d to maturity`
                                : deal.endDate
                                  ? `Matures ${fmtDate(deal.endDate)}`
                                  : "Active"}
                            </span>
                          </div>
                          {deal.nextPayoutDate && (
                            <div style={{ marginTop: 6, fontSize: 12, color: "#722ed1" }}>
                              Next payout: {fmtDate(deal.nextPayoutDate)} — ₹{fmt(deal.nextPayoutAmount)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
                </div>
              )}

              {/* ── 5. REINVESTMENT PROFILE ────────────────────────────────── */}
              {data.reinvestmentDetails && (() => {
                const rd = data.reinvestmentDetails;
                const firstName = (data.lenderName || "").split(" ")[0];
                const reinvestedCount = rd.reinvestedCount ?? rd.totalReturns ?? 0;
                const totalReturns = rd.totalReturns ?? reinvestedCount;
                const ratio = Math.round(rd.reinvestRatioPct || 0);
                const delay = rd.avgReinvestmentDelayDays || 0;
                const tenure = rd.preferredTenure || "short-term";
                const prob = rd.reinvestmentProbabilityPct || 0;
                const avgSize = fmt(rd.avgInvestmentAmount || data.avgInvestmentAmount);
                const summaryText = `${firstName} reinvests ${ratio}% of the time — ${reinvestedCount} out of ${totalReturns} returns were put back to work, typically within ${delay} day${delay === 1 ? "" : "s"}. ${rd.sameDayReinvestFlag ? "Same-day reinvestment detected. " : ""}Preferred deal tenure is ${tenure} with an average deal size of ₹${avgSize}. Probability of reinvesting next return: ${prob}%.`;
                return (
                  <SectionCard title="Reinvestment Profile" badge={<StarRating rating={data.reinvestmentStarRating || rd.starRating} />}>
                    {/* Plain-English summary */}
                    <div style={{ background: "linear-gradient(135deg, #f9f0ff, #efdbff)", borderRadius: 10, padding: "14px 18px", marginBottom: 16, fontSize: 14, color: "#391085", lineHeight: 1.7 }}>
                      {summaryText}
                    </div>
                    <div className="row">
                      <div className="col-12 col-md-4 mb-3">
                        <div style={{ textAlign: "center", padding: 16, background: "#fafafa", borderRadius: 10 }}>
                          <div style={{ fontSize: 13, color: "#8c8c8c", marginBottom: 6 }}>Classification</div>
                          <div style={{ fontWeight: 700, fontSize: 16, color: reinvestColor(rd.classification), background: reinvestColor(rd.classification) + "18", borderRadius: 8, padding: "6px 12px" }}>
                            {rd.classification || "—"}
                          </div>
                        </div>
                      </div>
                      <div className="col-12 col-md-4 mb-3">
                        <div style={{ textAlign: "center", padding: 16, background: "#fafafa", borderRadius: 10 }}>
                          <div style={{ fontSize: 13, color: "#8c8c8c", marginBottom: 6 }}>Reinvestment Ratio</div>
                          <div style={{ fontWeight: 700, fontSize: 22, color: "#1890ff" }}>{ratio}%</div>
                          <div style={{ fontSize: 12, color: "#8c8c8c" }}>{reinvestedCount} out of {totalReturns} returns reinvested</div>
                        </div>
                      </div>
                      <div className="col-12 col-md-4 mb-3">
                        <div style={{ textAlign: "center", padding: 16, background: "#fafafa", borderRadius: 10 }}>
                          <div style={{ fontSize: 13, color: "#8c8c8c", marginBottom: 6 }}>Reinvest Probability</div>
                          <div style={{ fontWeight: 700, fontSize: 22, color: "#52c41a" }}>{prob}%</div>
                          <div style={{ fontSize: 12, color: "#8c8c8c" }}>Average {delay} days to reinvest</div>
                        </div>
                      </div>
                      <div className="col-6 col-md-3 mb-2">
                        <div style={{ fontSize: 12, color: "#8c8c8c" }}>Preferred Tenure</div>
                        <div style={{ fontWeight: 600 }}>{tenure}</div>
                      </div>
                      <div className="col-6 col-md-3 mb-2">
                        <div style={{ fontSize: 12, color: "#8c8c8c" }}>Avg Deal Size</div>
                        <div style={{ fontWeight: 600 }}>₹{avgSize}</div>
                      </div>
                      <div className="col-6 col-md-3 mb-2">
                        <div style={{ fontSize: 12, color: "#8c8c8c" }}>Same-Day Reinvest</div>
                        <div style={{ fontWeight: 600, color: rd.sameDayReinvestFlag ? "#52c41a" : "#8c8c8c" }}>
                          {rd.sameDayReinvestFlag ? "Yes — reinvests immediately" : "No"}
                        </div>
                      </div>
                      <div className="col-6 col-md-3 mb-2">
                        <div style={{ fontSize: 12, color: "#8c8c8c" }}>Returns Received</div>
                        <div style={{ fontWeight: 600 }}>{totalReturns} interest payments</div>
                      </div>
                    </div>
                  </SectionCard>
                );
              })()}

              {/* ── 6. SMART MATURITY PLANNER ──────────────────────────────── */}
              {(data.upcomingMaturities || []).length > 0 && (() => {
                const now = new Date();
                const curMonth = now.getMonth();
                const curYear  = now.getFullYear();
                const allMat   = data.upcomingMaturities || [];
                const filtered = maturityFilter === "thisMonth"
                  ? allMat.filter((m) => { const d = m.maturityDate ? new Date(m.maturityDate) : null; return d && d.getMonth() === curMonth && d.getFullYear() === curYear; })
                  : maturityFilter === "next90"
                  ? allMat.filter((m) => m.daysToMaturity >= 0 && m.daysToMaturity <= 90)
                  : allMat;
                const thisMonthCount = allMat.filter((m) => { const d = m.maturityDate ? new Date(m.maturityDate) : null; return d && d.getMonth() === curMonth && d.getFullYear() === curYear; }).length;
                return (
                  <div ref={maturityRef}>
                  <SectionCard
                    title="Smart Maturity Planner"
                    badge={thisMonthCount > 0 ? <span style={{ background: "#fff7e6", color: "#fa8c16", border: "1px solid #ffd591", borderRadius: 6, padding: "2px 10px", fontSize: 12 }}>{thisMonthCount} maturing this month</span> : null}
                  >
                    {/* Filter tabs */}
                    <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                      {[
                        { key: "all",       label: `All (${allMat.length})` },
                        { key: "thisMonth", label: `This Month (${thisMonthCount})` },
                        { key: "next90",    label: "Next 90 Days" },
                      ].map(({ key, label }) => (
                        <button key={key} onClick={() => setMaturityFilter(key)}
                          style={{
                            padding: "5px 14px", borderRadius: 20, border: "none", cursor: "pointer",
                            fontSize: 12, fontWeight: maturityFilter === key ? 700 : 500,
                            background: maturityFilter === key ? "linear-gradient(135deg, #fa8c16, #d46b08)" : "#f5f5f5",
                            color: maturityFilter === key ? "#fff" : "#595959",
                          }}>
                          {label}
                        </button>
                      ))}
                    </div>
                    {filtered.length === 0 ? (
                      <div style={{ textAlign: "center", color: "#8c8c8c", padding: "24px 0", fontSize: 14 }}>
                        No deals maturing {maturityFilter === "thisMonth" ? "this month" : "in this period"}.{" "}
                        <button onClick={() => setMaturityFilter("all")} style={{ background: "none", border: "none", color: "#1890ff", cursor: "pointer", fontSize: 14 }}>View all</button>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm mb-0">
                          <thead className="thead-light">
                            <tr>
                              <th>Deal</th><th>Maturity Date</th><th>Principal</th><th>Days Left</th><th>Projected Reinvest Earning</th><th>Nudge Date</th><th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((m, idx) => (
                              <tr key={idx} style={m.actionNeeded ? { background: "#fff7e6" } : {}}>
                                <td><strong>#{m.dealId}</strong></td>
                                <td>{fmtDate(m.maturityDate)}</td>
                                <td>₹{fmt(m.principalAmount)}</td>
                                <td><span style={{ color: m.daysToMaturity <= 30 ? "#ff4d4f" : m.daysToMaturity <= 60 ? "#faad14" : "#52c41a", fontWeight: 600 }}>{m.daysToMaturity} days</span></td>
                                <td style={{ color: "#722ed1", fontWeight: 600 }}>₹{fmt(m.projectedEarningIfReinvested)}</td>
                                <td style={{ fontSize: 12, color: "#8c8c8c" }}>{fmtDate(m.nudgeSendDate)}</td>
                                <td>{m.actionNeeded ? <span style={{ background: "#fff1f0", color: "#ff4d4f", border: "1px solid #ffa39e", borderRadius: 4, padding: "2px 8px", fontSize: 11 }}>Plan now</span> : <span style={{ color: "#8c8c8c", fontSize: 11 }}>Monitor</span>}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </SectionCard>
                  </div>
                );
              })()}

              {/* ── 7. EARNINGS INTELLIGENCE ──────────────────────────────── */}
              <SectionCard title="Earnings Intelligence">
                <div className="row">
                  {/* FY Forecast — explained clearly */}
                  <div className="col-12 col-md-6 mb-3">
                    {(() => {
                      const forecast = data.forecastThisFinancialYear || data.earningsForecast?.forecastThisFinancialYear || 0;
                      const roi      = data.earningsForecast?.weightedAvgRoi || 0;
                      const active   = data.earningsForecast?.totalActiveAmount || 0;
                      const fyEnd    = data.earningsForecast?.financialYearEnd;
                      const needed   = data.amountNeededForOneLakhTarget || data.earningsForecast?.amountNeededToReachOneLakh || 0;
                      const monthsLeft = fyEnd ? Math.max(0, Math.round((new Date(fyEnd) - new Date()) / (1000 * 60 * 60 * 24 * 30))) : 0;
                      return (
                        <div style={{ background: "linear-gradient(135deg, #e6f7ff, #bae7ff)", borderRadius: 12, padding: 20, height: "100%" }}>
                          <div style={{ fontSize: 13, color: "#0050b3", fontWeight: 700, marginBottom: 12 }}>
                            This Financial Year — Forecast
                          </div>
                          <div style={{ fontSize: 36, fontWeight: 800, color: "#1890ff", lineHeight: 1 }}>
                            ₹{fmt(forecast)}
                          </div>
                          <div style={{ fontSize: 12, color: "#0050b3", marginTop: 6, marginBottom: 14 }}>
                            Expected by {fyEnd ? fmtDate(fyEnd) : "31 Mar"} ({monthsLeft} months remaining)
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <div style={{ background: "rgba(24,144,255,0.1)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#0050b3" }}>
                              <strong>₹{fmt(active)}</strong> actively deployed at avg <strong>{roi}% p.a.</strong> weighted ROI
                            </div>
                            {needed > 0 && (
                              <div style={{ background: "rgba(24,144,255,0.08)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#0050b3" }}>
                                To earn <strong>₹1 Lakh</strong> this FY: invest <strong>₹{fmt(needed)}</strong> more at your current avg ROI for the remaining {monthsLeft} months
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  {/* FD Comparison — no bank name */}
                  <div className="col-12 col-md-6 mb-3">
                    {data.fdComparison && (
                      <div style={{ background: "linear-gradient(135deg, #f6ffed, #d9f7be)", borderRadius: 12, padding: 20, height: "100%" }}>
                        <div style={{ fontSize: 13, color: "#135200", fontWeight: 700, marginBottom: 12 }}>
                          How You Compare — Bank FD vs OxyLoans
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 14 }}>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 11, color: "#8c8c8c", marginBottom: 2 }}>Bank FD (avg)</div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: "#8c8c8c" }}>{data.fdComparison.sbiFdRate || 6.8}%</div>
                          </div>
                          <div style={{ flex: 1, borderTop: "2px dashed #b7eb8f" }} />
                          <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 11, color: "#52c41a", marginBottom: 2 }}>Your OxyLoans ROI</div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: "#52c41a" }}>{data.fdComparison.oxyloansReturnPct || 0}%</div>
                          </div>
                        </div>
                        {data.fdComparison.extraEarningsVsFd > 0 && (
                          <div style={{ background: "#52c41a", color: "#fff", borderRadius: 8, padding: "8px 14px", fontSize: 14, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>
                            +{data.fdComparison.extraEarningsVsFd}% more than a bank FD
                          </div>
                        )}
                        <div style={{ fontSize: 12, color: "#135200" }}>
                          Bank FD benchmark is the average of India's top public sector banks. OxyLoans is RBI-registered NBFC-P2P.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>

              {/* ── 8. SAFETY & COMPLIANCE ────────────────────────────────── */}
              {(data.safetyNarrativeDetails || data.safetyNarrative) && (
                <SectionCard title="Safety & Compliance" badge={<span style={{ background: "#f6ffed", color: "#52c41a", border: "1px solid #b7eb8f", borderRadius: 6, padding: "2px 10px", fontSize: 12 }}>RBI Registered</span>}>
                  <div className="row align-items-center">
                    <div className="col-12 col-md-8">
                      <p style={{ fontSize: 14, color: "#595959", margin: 0 }}>{data.safetyNarrativeDetails?.message || data.safetyNarrative}</p>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="row text-center mt-3 mt-md-0">
                        <div className="col-6">
                          <div style={{ fontSize: 11, color: "#8c8c8c" }}>Payment Success</div>
                          <div style={{ fontSize: 22, fontWeight: 700, color: "#52c41a" }}>{data.onTimePaymentRate || data.safetyNarrativeDetails?.onTimePaymentRate || 0}%</div>
                          <div style={{ fontSize: 10, color: "#bfbfbf" }}>of receipts processed OK</div>
                        </div>
                        <div className="col-6">
                          <div style={{ fontSize: 11, color: "#8c8c8c" }}>Successful Receipts</div>
                          <div style={{ fontSize: 22, fontWeight: 700, color: "#1890ff" }}>{data.successfulPayments || data.safetyNarrativeDetails?.successfulPayments || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* ── 9. DEAL HISTORY TABLE ─────────────────────────────────── */}
              {(() => {
                const allDeals = [...(data.deals || data.allDeals || [])].sort((a, b) => (b.dealId || 0) - (a.dealId || 0));
                const visibleDeals = allDeals.slice(0, dealsShown);
                return (
                  <SectionCard title="Deal History" badge={<span style={{ fontSize: 12, color: "#8c8c8c" }}>{allDeals.length} deals</span>}>
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="thead-light">
                          <tr>
                            <th>Deal ID</th><th>Amount</th><th>ROI (p.a.)</th><th>Status</th><th>Start Date</th><th>Maturity Date</th><th>Interest Earned</th><th>Est. Next Payout</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allDeals.length === 0 && (
                            <tr><td colSpan={8} className="text-center text-muted py-4">No deals found</td></tr>
                          )}
                          {visibleDeals.map((deal, idx) => {
                            const isActive = (deal.status || "").toUpperCase() === "ACTIVE";
                            const annualRoi = deal.rateOfInterest < 5
                              ? (deal.rateOfInterest * 12).toFixed(1)
                              : deal.rateOfInterest;
                            return (
                              <tr key={idx} style={isActive ? { background: "#f6ffed" } : {}}>
                                <td><strong>#{deal.dealId}</strong></td>
                                <td>₹{fmt(deal.amount)}</td>
                                <td>{annualRoi}%</td>
                                <td>
                                  <span style={{ color: isActive ? "#52c41a" : "#8c8c8c", fontWeight: 600, background: isActive ? "#f6ffed" : "#f5f5f5", borderRadius: 4, padding: "2px 8px", fontSize: 12 }}>
                                    {deal.status || "—"}
                                  </span>
                                </td>
                                <td style={{ fontSize: 13 }}>{fmtDate(deal.startDate)}</td>
                                <td style={{ fontSize: 13, color: "#8c8c8c" }}>{fmtDate(deal.endDate)}</td>
                                <td style={{ color: "#52c41a", fontWeight: 600 }}>₹{fmt(deal.interestEarned)}</td>
                                <td style={{ fontSize: 13 }}>{deal.nextPayoutDate ? fmtDate(deal.nextPayoutDate) : <span style={{ color: "#bfbfbf" }}>—</span>}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {allDeals.length > dealsShown && (
                      <div className="text-center mt-3">
                        <button
                          onClick={() => setDealsShown((n) => n + 20)}
                          style={{ background: "none", border: "1px solid #d9d9d9", borderRadius: 6, padding: "6px 20px", cursor: "pointer", fontSize: 13, color: "#595959" }}
                        >
                          Show more ({allDeals.length - dealsShown} remaining)
                        </button>
                      </div>
                    )}
                    {dealsShown > 10 && allDeals.length <= dealsShown && (
                      <div className="text-center mt-3">
                        <button
                          onClick={() => setDealsShown(10)}
                          style={{ background: "none", border: "1px solid #d9d9d9", borderRadius: 6, padding: "6px 20px", cursor: "pointer", fontSize: 13, color: "#8c8c8c" }}
                        >
                          Collapse
                        </button>
                      </div>
                    )}
                  </SectionCard>
                );
              })()}

              {/* ── 10. REFERRAL ─────────────────────────────────────────── */}
              {(data.referredLendersCount > 0 || data.referralEarnings > 0) && (
                <SectionCard title="Referral Summary">
                  <div className="row text-center">
                    <div className="col-4">
                      <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase" }}>Lenders Referred</div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: "#722ed1" }}>{data.referredLendersCount || 0}</div>
                    </div>
                    <div className="col-4">
                      <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase" }}>Referred Amount</div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: "#1890ff" }}>₹{fmt(data.totalReferredAmount)}</div>
                    </div>
                    <div className="col-4">
                      <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase" }}>Referral Earnings</div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: "#52c41a" }}>₹{fmt(data.referralEarnings)}</div>
                    </div>
                  </div>
                </SectionCard>
              )}

              <div className="row mb-2">
                <div className="col-12">
                  <small className="text-muted">Generated at: {data.generatedAt ? new Date(data.generatedAt).toLocaleString("en-IN") : "—"}</small>
                </div>
              </div>
            </>
          )}
        </div>
        <Footer />
      </div>

      {/* ── AI CHAT WIDGET ──────────────────────────────────────────────── */}
      {data && <AIChatWidget lenderId={resolvedLenderId} lenderName={data.lenderName?.split(" ")[0]} />}
    </div>
  );
};

export default LenderPortfolioDashboard;
