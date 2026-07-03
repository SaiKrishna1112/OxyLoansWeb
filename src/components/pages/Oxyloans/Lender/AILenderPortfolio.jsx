import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import Footer from "../../../Footer/Footer";
import { MARKETPLACE_URL } from "../../../../config";
import { getToken, getUserId } from "../../../HttpRequest/afterlogin";
import axios from "axios";
import { RichMessage, FormattedText, SuggestedFollowup, TopicBadge } from "../../../ChatDrawer";

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

const MembershipBadge = ({ badge }) => {
  if (!badge) return null;
  const configs = {
    PLATINUM: { bg: "linear-gradient(135deg, #FFD700, #FFA500)", color: "#fff", label: "🏆 Platinum" },
    GOLD:     { bg: "linear-gradient(135deg, #FFD700, #DAA520)", color: "#fff", label: "🥇 Gold" },
    SILVER:   { bg: "linear-gradient(135deg, #C0C0C0, #A8A9AD)", color: "#fff", label: "🥈 Silver" },
    LOYAL:    { bg: "linear-gradient(135deg, #9C27B0, #7B1FA2)", color: "#fff", label: "💜 Loyal" },
    MEMBER:   { bg: "#e8e8e8", color: "#595959", label: "Member" },
  };
  const c = configs[badge?.toUpperCase()] || configs.MEMBER;
  return (
    <span style={{ background: c.bg, color: c.color, borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700, letterSpacing: 0.5, display: "inline-block" }}>
      {c.label}
    </span>
  );
};

const StarRating = ({ rating }) => {
  const count = parseInt((rating || "1").split(" ")[0]) || 1;
  return (
    <span title={rating}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= count ? "#faad14" : "#d9d9d9", fontSize: 16 }}>★</span>
      ))}
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

const LockCard = ({ title, requiredTier }) => {
  const nav = useNavigate();
  return (
    <div style={{ background: '#fafafa', border: '1px dashed #d9d9d9', borderRadius: 12, padding: '32px 24px', textAlign: 'center', color: '#8c8c8c', marginBottom: 24 }}>
      <div style={{ fontSize: 28, marginBottom: 10 }}>🔒</div>
      <div style={{ fontWeight: 700, color: '#262626', fontSize: 15, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, marginBottom: 14 }}>
        Available on <strong style={{ color: requiredTier === 'PRO' ? '#722ed1' : '#1890ff' }}>
          OXY {requiredTier === 'PRO' ? 'Pro' : 'Smart'}
        </strong> — ₹{requiredTier === 'PRO' ? '1,000' : '500'}/year
      </div>
      <div
        onClick={() => nav('/ai/plans')}
        style={{ display: 'inline-block', background: requiredTier === 'PRO' ? 'linear-gradient(135deg, #4a148c, #6a1b9a)' : 'linear-gradient(135deg, #0050b3, #1890ff)', color: '#fff', borderRadius: 20, padding: '6px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
        Upgrade to OXY {requiredTier === 'PRO' ? 'Pro' : 'Smart'}
      </div>
    </div>
  );
};

const OxiBadge = ({ tier }) => {
  if (tier === 'PRO') return (
    <span style={{ background: 'linear-gradient(135deg, #4a148c, #6a1b9a)', color: '#fff', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
      ✦ OXY Pro
    </span>
  );
  if (tier === 'SMART') return (
    <span style={{ background: 'linear-gradient(135deg, #0050b3, #1890ff)', color: '#fff', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
      ⚡ OXY Smart
    </span>
  );
  return (
    <span style={{ background: '#f5f5f5', color: '#8c8c8c', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600 }}>
      Investor Dashboard
    </span>
  );
};

const StatCard = ({ label, value, color, sub }) => (
  <div className="col-6 col-md mb-3">
    <div className="card text-center h-100" style={{ borderRadius: 12, border: "1px solid #f0f0f0" }}>
      <div className="card-body py-3 px-2">
        <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#8c8c8c", marginBottom: 6 }}>
          {label}
        </p>
        <h4 style={{ fontWeight: 700, color: color || "#262626", margin: 0 }}>{value}</h4>
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

const SectionCard = ({ title, badge, children, collapsible = false, defaultOpen = true, summary = null, isOpen: controlledOpen, onToggle }) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const toggle = () => { if (isControlled) onToggle?.(); else setInternalOpen(o => !o); };
  return (
    <div className="card mb-4" style={{ borderRadius: 14, border: "1px solid #f0f0f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <div
        className="card-header"
        onClick={collapsible ? toggle : undefined}
        style={{ background: "#fafafa", borderBottom: isOpen ? "1px solid #f0f0f0" : "none", borderRadius: isOpen ? "14px 14px 0 0" : 14, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: collapsible ? "pointer" : "default", userSelect: "none", padding: "12px 16px" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h6 style={{ margin: 0, fontWeight: 700, color: "#262626" }}>{title}</h6>
          {collapsible && !isOpen && summary && (
            <span style={{ fontSize: 12, color: "#8c8c8c", background: "#f5f5f5", borderRadius: 10, padding: "1px 8px" }}>{summary}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {badge}
          {collapsible && (
            <span style={{ fontSize: 13, color: "#8c8c8c", display: "inline-block", transition: "transform 0.25s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
          )}
        </div>
      </div>
      {isOpen && <div className="card-body">{children}</div>}
    </div>
  );
};

// ── AI CHAT WIDGET ─────────────────────────────────────────────────────────
const DEFAULT_QUESTIONS = [
<<<<<<< HEAD
  "Show my wallet balance",
  "What is my average ROI?",
  "How much have I invested in total?",
  "How much did I earn this year?",
  "Show my active deals",
  "Show my principal returned",
  "Show upcoming payments",
  "In which deal did I invest recently?",
];
const CHIPS_VISIBLE = 3;
=======
  "How much did I earn this year?",
  "Show my wallet balance",
  "Show my active deals",
  "Compare my earnings month on month",
  "What is my highest interest amount received till now",
  "Show upcoming payments",
  "What is my average ROI?",
  "Show my principal returned",
];
>>>>>>> 0d0503fb1f876ac442e845b69dddcf0b6cc4fd71

const AIChatWidget = ({ lenderId, lenderName }) => {
  const [open, setOpen] = useState(false);
  const [panelSize, setPanelSize] = useState("normal"); // "normal" | "maximized" | "minimized"
  const [messages, setMessages] = useState([
<<<<<<< HEAD
    { role: "assistant", text: `Hi ${lenderName || "there"}! 👋 I'm your OxyLoans AI assistant. Ask me anything about your investments — earnings, deals, wallet, ROI and more.`, data: null, ts: Date.now() }
=======
    { role: "assistant", text: `Hi ${lenderName || "there"}! I'm your OxyLoans AI assistant. Ask me anything about your investments — earnings, deals, wallet, ROI and more.`, data: null }
>>>>>>> 0d0503fb1f876ac442e845b69dddcf0b6cc4fd71
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [chipsExpanded, setChipsExpanded] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && panelSize !== "minimized") setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
  }, [messages, open, panelSize]);

<<<<<<< HEAD
  useEffect(() => {
    if (open && panelSize !== "minimized") setTimeout(() => inputRef.current?.focus(), 120);
  }, [open, panelSize]);

=======
>>>>>>> 0d0503fb1f876ac442e845b69dddcf0b6cc4fd71
  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    setInput("");
<<<<<<< HEAD
    setChipsExpanded(false);
    setMessages((prev) => [...prev, { role: "user", text: msg, data: null, ts: Date.now() }]);
=======
    setMessages((prev) => [...prev, { role: "user", text: msg, data: null }]);
>>>>>>> 0d0503fb1f876ac442e845b69dddcf0b6cc4fd71
    setSending(true);
    try {
      const res = await axios.post(
        `${MARKETPLACE_URL}/v1/ai/chat`,
        { message: msg, primaryType: "LENDER" },
        { headers: { accessToken: getToken(), "Content-Type": "application/json" } }
      );
      const reply = res.data?.answer || (typeof res.data === "string" ? res.data : "I couldn't find an answer for that.");
      const responseData = res.data?.responseData || null;
<<<<<<< HEAD
      setMessages((prev) => [...prev, { role: "assistant", text: reply, data: responseData, ts: Date.now() }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I'm having trouble connecting right now. Please try again.", data: null, ts: Date.now() }]);
=======
      setMessages((prev) => [...prev, { role: "assistant", text: reply, data: responseData }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I'm having trouble connecting right now. Please try again.", data: null }]);
>>>>>>> 0d0503fb1f876ac442e845b69dddcf0b6cc4fd71
    } finally {
      setSending(false);
    }
  };

  const visibleChips = chipsExpanded ? DEFAULT_QUESTIONS : DEFAULT_QUESTIONS.slice(0, CHIPS_VISIBLE);
  const hiddenCount = DEFAULT_QUESTIONS.length - CHIPS_VISIBLE;
  const fmtTime = (ts) => new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const panelStyles = {
    normal: {
      position: "fixed", bottom: 96, right: 24, zIndex: 9998,
      width: 390, maxWidth: "calc(100vw - 32px)",
      height: "min(600px, 84vh)",
    },
    maximized: {
      position: "fixed", top: "50%", left: "50%",
      transform: "translate(-50%, -50%)", zIndex: 9998,
      width: "min(860px, 94vw)",
      height: "min(720px, 90vh)",
    },
    minimized: {
      position: "fixed", bottom: 96, right: 24, zIndex: 9998,
      width: 340, maxWidth: "calc(100vw - 32px)",
      height: "auto",
    },
  };

  const headerBtn = (onClick, title, label) => (
    <button
      onClick={onClick}
      title={title}
      style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 6, width: 26, height: 26, color: "#fff", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.28)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
    >{label}</button>
  );

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => { setOpen((v) => !v); setPanelSize("normal"); }}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 9999,
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg, #1a237e, #6a1b9a)",
          border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(106,27,154,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 24, transition: "transform 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        title="Ask AI"
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
<<<<<<< HEAD
          ...panelStyles[panelSize],
          background: "#fff", borderRadius: 20,
          boxShadow: "0 16px 56px rgba(0,0,0,0.22), 0 4px 16px rgba(106,27,154,0.12)",
          display: "flex", flexDirection: "column",
          border: "1px solid #e8e8e8", overflow: "hidden",
          transition: "width 0.25s, height 0.25s",
=======
          position: "fixed", bottom: 96, right: 24, zIndex: 9998,
          width: 380, maxWidth: "calc(100vw - 48px)",
          background: "#fff", borderRadius: 16,
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          display: "flex", flexDirection: "column",
          border: "1px solid #e8e8e8", overflow: "hidden",
          maxHeight: "80vh",
>>>>>>> 0d0503fb1f876ac442e845b69dddcf0b6cc4fd71
        }}>

          {/* Header */}
<<<<<<< HEAD
          <div style={{ background: "linear-gradient(135deg, #1a237e, #6a1b9a)", padding: "13px 14px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, cursor: panelSize === "minimized" ? "pointer" : "default" }}
            onClick={() => panelSize === "minimized" && setPanelSize("normal")}
          >
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>🤖</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>OxyLoans AI Assistant</div>
              {panelSize !== "minimized" && (
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#52c41a", display: "inline-block", boxShadow: "0 0 5px #52c41a" }} />
                  Online · Ask about earnings, ROI, deals
                </div>
              )}
              {panelSize === "minimized" && (
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>{messages.length - 1} message{messages.length !== 2 ? "s" : ""} · click to expand</div>
              )}
            </div>
            <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
              {panelSize !== "minimized" && headerBtn(() => setPanelSize("minimized"), "Minimise", "⎯")}
              {panelSize === "normal"    && headerBtn(() => setPanelSize("maximized"), "Maximise", "⤢")}
              {panelSize === "maximized" && headerBtn(() => setPanelSize("normal"),    "Restore",  "⊡")}
              {panelSize === "minimized" && headerBtn(() => setPanelSize("maximized"), "Maximise", "⤢")}
              {headerBtn(() => { setOpen(false); setPanelSize("normal"); }, "Close", "✕")}
            </div>
          </div>

          {/* Messages — primary space, scrollable */}
          {panelSize !== "minimized" && <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 6px", display: "flex", flexDirection: "column" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 7 }}>
                  {m.role === "assistant" && (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #1a237e, #6a1b9a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginBottom: 2 }}>🤖</div>
                  )}
                  <div style={{
                    maxWidth: "76%", padding: "10px 14px",
                    borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                    background: m.role === "user" ? "linear-gradient(135deg, #1a237e, #6a1b9a)" : "#f4f4f6",
                    color: m.role === "user" ? "#fff" : "#1a1a2e",
                    fontSize: 13, lineHeight: 1.55,
                    boxShadow: m.role === "user" ? "0 3px 10px rgba(26,35,126,0.28)" : "0 1px 4px rgba(0,0,0,0.07)",
=======
          <div style={{ background: "linear-gradient(135deg, #1a237e, #6a1b9a)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 22 }}>🤖</span>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>OxyLoans AI Assistant</div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>Ask about your investments</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px", minHeight: 200 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "85%", padding: "10px 14px",
                    borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: m.role === "user" ? "linear-gradient(135deg, #1a237e, #6a1b9a)" : "#f5f5f5",
                    color: m.role === "user" ? "#fff" : "#262626",
                    fontSize: 13, lineHeight: 1.5,
>>>>>>> 0d0503fb1f876ac442e845b69dddcf0b6cc4fd71
                  }}>
                    {m.data ? <TopicBadge type={m.data.type} /> : null}
                    <FormattedText text={m.text} />
                  </div>
<<<<<<< HEAD
                </div>
                {m.data && (
                  <div style={{ marginLeft: m.role === "assistant" ? 35 : 0, marginTop: 6 }}>
                    <RichMessage data={m.data} />
                  </div>
                )}
                <div style={{ fontSize: 10, color: "#c0c0c0", marginTop: 3, textAlign: m.role === "user" ? "right" : "left", paddingLeft: m.role === "assistant" ? 35 : 0 }}>
                  {fmtTime(m.ts)}
=======
>>>>>>> 0d0503fb1f876ac442e845b69dddcf0b6cc4fd71
                </div>
                {m.data && <div style={{ marginTop: 6 }}><RichMessage data={m.data} /></div>}
              </div>
            ))}

            {sending && (
<<<<<<< HEAD
              <div style={{ display: "flex", alignItems: "flex-end", gap: 7, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #1a237e, #6a1b9a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🤖</div>
                <div style={{ background: "#f4f4f6", borderRadius: "4px 18px 18px 18px", padding: "12px 16px", display: "flex", gap: 5, alignItems: "center" }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#6a1b9a", animation: `chatBounce 1.2s ${i * 0.18}s infinite` }} />
                  ))}
                </div>
=======
              <div style={{ display: "flex", gap: 6, padding: "8px 4px" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#6a1b9a", animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
                ))}
>>>>>>> 0d0503fb1f876ac442e845b69dddcf0b6cc4fd71
              </div>
            )}
            <div ref={bottomRef} />
          </div>}

<<<<<<< HEAD
          {/* Quick chips + input — hidden when minimized */}
          {panelSize !== "minimized" && <>
            <div style={{ padding: "7px 12px 5px", borderTop: "1px solid #f0f0f0", flexShrink: 0, background: "#fafafa" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
                {visibleChips.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    disabled={sending}
                    style={{
                      background: "#fff", border: "1px solid #c7d2fe",
                      borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "#3730a3",
                      cursor: sending ? "default" : "pointer", whiteSpace: "nowrap",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)", lineHeight: 1.4, opacity: sending ? 0.6 : 1,
                    }}
                  >{q}</button>
                ))}
                {!chipsExpanded && hiddenCount > 0 && (
                  <button
                    onClick={() => setChipsExpanded(true)}
                    style={{
                      background: "linear-gradient(135deg, #f0f5ff, #f5f0ff)",
                      border: "1px solid #c7d2fe", borderRadius: 20,
                      padding: "4px 12px", fontSize: 11, color: "#6a1b9a",
                      cursor: "pointer", whiteSpace: "nowrap", fontWeight: 600, lineHeight: 1.4,
                    }}
                  >＋{hiddenCount} more ›</button>
                )}
                {chipsExpanded && (
                  <button
                    onClick={() => setChipsExpanded(false)}
                    style={{
                      background: "none", border: "1px solid #e8e8e8",
                      borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "#8c8c8c",
                      cursor: "pointer", whiteSpace: "nowrap", lineHeight: 1.4,
                    }}
                  >‹ less</button>
                )}
              </div>
            </div>

            <div style={{ padding: "8px 12px 12px", borderTop: "1px solid #f0f0f0", display: "flex", gap: 8, flexShrink: 0, background: "#fff" }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask about your deals, earnings…"
                style={{ flex: 1, border: "1.5px solid #e8e8e8", borderRadius: 24, padding: "9px 16px", fontSize: 13, outline: "none", background: "#fafafa", transition: "border-color 0.15s" }}
                onFocus={e => e.target.style.borderColor = "#6a1b9a"}
                onBlur={e => e.target.style.borderColor = "#e8e8e8"}
                disabled={sending}
              />
              <button
                onClick={() => sendMessage()}
                disabled={sending || !input.trim()}
                style={{
                  background: sending || !input.trim() ? "#e8e8e8" : "linear-gradient(135deg, #1a237e, #6a1b9a)",
                  border: "none", borderRadius: 24, padding: "9px 20px",
                  color: sending || !input.trim() ? "#aaa" : "#fff",
                  cursor: sending || !input.trim() ? "default" : "pointer",
                  fontSize: 15, fontWeight: 700, transition: "all 0.2s", flexShrink: 0,
                }}
              >↑</button>
            </div>
          </>}
=======
          {/* Quick question chips — always visible, wrapped */}
          <div style={{ padding: "8px 10px 6px", borderTop: "1px solid #f0f0f0", flexShrink: 0, background: "#fafafa" }}>
            <div style={{ fontSize: 10, color: "#8c8c8c", marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>Quick questions</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {DEFAULT_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} disabled={sending} style={{
                  background: "#fff", border: "1px solid #c7d2fe",
                  borderRadius: 20, padding: "5px 12px", fontSize: 11, color: "#3730a3",
                  cursor: sending ? "default" : "pointer", whiteSpace: "nowrap",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}>{q}</button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div style={{ padding: "8px 12px 10px", borderTop: "1px solid #f0f0f0", display: "flex", gap: 8, flexShrink: 0 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about your deals, earnings…"
              style={{ flex: 1, border: "1px solid #e8e8e8", borderRadius: 24, padding: "8px 14px", fontSize: 13, outline: "none" }}
              disabled={sending}
            />
            <button
              onClick={() => sendMessage()}
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
>>>>>>> 0d0503fb1f876ac442e845b69dddcf0b6cc4fd71
        </div>
      )}
      <style>{`
        @keyframes chatBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
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

const REF_DATE = process.env.REACT_APP_REFERENCE_DATE ? new Date(process.env.REACT_APP_REFERENCE_DATE) : new Date();

const currentMonthFilter = () => {
  const now = REF_DATE;
  const y = now.getFullYear(), m = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
  return { mode: "month", fyYear: null, from: `${y}-${m}-01`, to: `${y}-${m}-${lastDay}` };
};

const FyFilterBar = ({ fyFilter, setFyFilter, loading }) => {
  const tabs = buildFyTabs();
  const [customFrom, setCustomFrom] = useState(fyFilter.from || "");
  const [customTo,   setCustomTo]   = useState(fyFilter.to   || "");

  const isActive = (mode, fyYear) => {
    if (mode === "month")  return fyFilter.mode === "month";
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
          <button style={tabStyle(isActive("month"))} onClick={() => setFyFilter(currentMonthFilter())}>
            Current Month
          </button>
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
const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const EarningsPeriodSummary = ({ earningsData, loading, onEarningsTileClick }) => {
  if (!earningsData) return null;
  const interest  = earningsData.fyInterestEarned   || 0;
  const principal = earningsData.fyPrincipalReturned || 0;
  const total     = earningsData.fyTotalReceived     || 0;
  const label     = earningsData.fyLabel             || "Period";
  const narrative = earningsData.narrative           || "";

  return (
    <div style={{ background: "linear-gradient(135deg, #f0f5ff, #f9f0ff)", borderRadius: 14, padding: "18px 20px", marginBottom: 20, border: "1px solid #d6e4ff", position: "relative" }}>
      {loading && (
        <div style={{ position: "absolute", top: 12, right: 16, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#1890ff" }}>
          <div className="spinner-border spinner-border-sm" role="status" style={{ width: 14, height: 14, borderWidth: 2 }} />
          Refreshing
        </div>
      )}
      <div style={{ fontWeight: 700, fontSize: 14, color: "#1a237e", marginBottom: 6 }}>
        {label} Earnings Summary
      </div>
      <div style={{ fontSize: 11, color: "#8c8c8c", marginBottom: 12 }}>Click a tile to jump to active deals ↓</div>
      <div className="row g-3 mb-3">
        {[
          { label: "Interest Earned",    value: `₹${fmt(interest)}`,  color: "#52c41a", bg: "#f6ffed" },
          { label: "Principal Returned", value: `₹${fmt(principal)}`, color: "#1890ff", bg: "#e6f7ff" },
          { label: "Total Received",     value: `₹${fmt(total)}`,     color: "#722ed1", bg: "#f9f0ff" },
        ].map((item) => (
          <div key={item.label} className="col-6 col-md-4">
            <div
              onClick={() => { onEarningsTileClick(); scrollTo("section-deal-history"); }}
              style={{ background: item.bg, borderRadius: 10, padding: "12px 14px", textAlign: "center", cursor: "pointer", transition: "box-shadow 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              title="Click to see active deals"
            >
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

// ── UPCOMING PAYOUTS SECTION (loads independently) ─────────────────────────
const UpcomingPayoutsSection = ({ upcomingData, loading }) => {
  const [expanded, setExpanded] = React.useState(false);
  const detailRef = React.useRef(null);

  const expandAndScroll = () => {
    setExpanded(true);
    setTimeout(() => { if (detailRef.current) detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" }); }, 80);
  };

  if (loading) {
    return (
      <div style={{ background: "#fff7e6", borderRadius: 14, padding: "16px 20px", marginBottom: 20, border: "1px solid #ffd591", display: "flex", alignItems: "center", gap: 10 }}>
        <div className="spinner-border spinner-border-sm" role="status" style={{ width: 16, height: 16, borderWidth: 2, color: "#fa8c16" }} />
        <span style={{ fontSize: 13, color: "#d46b08" }}>Loading upcoming payments…</span>
      </div>
    );
  }

  if (!upcomingData) return null;

  const total   = upcomingData.upcomingTotal   || 0;
  const payouts = upcomingData.upcomingPayouts || [];

  const payoutsByDate = payouts.reduce((acc, p) => {
    const d = p.dueDate;
    if (!acc[d]) acc[d] = [];
    acc[d].push(p);
    return acc;
  }, {});
  const allSortedDates = Object.keys(payoutsByDate).sort();
  const MAX_DATES = 10;
  const tooMany = allSortedDates.length > MAX_DATES;
  const sortedDates = tooMany ? allSortedDates.slice(0, MAX_DATES) : allSortedDates;
  const hiddenTotal = tooMany
    ? allSortedDates.slice(MAX_DATES).reduce((s, d) => s + payoutsByDate[d].reduce((ss, p) => ss + (p.totalAmount || 0), 0), 0)
    : 0;
  const displayTotal = tooMany
    ? sortedDates.reduce((s, d) => s + payoutsByDate[d].reduce((ss, p) => ss + (p.totalAmount || 0), 0), 0)
    : total;
  const heading = tooMany
    ? `Next 10 Payment Dates (${allSortedDates.length} total in 60 days)`
    : "Upcoming Payments — Next 60 Days";

  return (
    <div style={{ background: "#fff7e6", borderRadius: 14, padding: "16px 20px", marginBottom: 20, border: "1px solid #ffd591" }}>
      {/* Brief summary — always visible */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#d46b08", marginBottom: 4 }}>{heading}</div>
          {sortedDates.length > 0 ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {sortedDates.map((d) => {
                const fmtD = new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
                const dt = payoutsByDate[d].reduce((s, p) => s + (p.totalAmount || 0), 0);
                return (
                  <span
                    key={d}
                    onClick={expandAndScroll}
                    style={{ fontSize: 12, background: "#ffe7ba", color: "#d46b08", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontWeight: 600, border: "1px solid #ffd591" }}
                    title="Click to see deal-level breakdown"
                  >
                    {fmtD}: ₹{fmt(dt)}
                  </span>
                );
              })}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>No payments due in the next 60 days</div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{ textAlign: "right", cursor: sortedDates.length > 0 ? "pointer" : "default" }}
            onClick={sortedDates.length > 0 ? expandAndScroll : undefined}
            title={sortedDates.length > 0 ? "Click to see deal-level breakdown" : undefined}
          >
            <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase", letterSpacing: 1 }}>
              {tooMany ? "Showing Next 10" : "Total Due"}
            </div>
            <div style={{ fontWeight: 700, fontSize: 22, color: "#fa8c16" }}>₹{fmt(displayTotal)}</div>
            {tooMany && (
              <div style={{ fontSize: 11, color: "#d46b08" }}>+₹{fmt(hiddenTotal)} more</div>
            )}
          </div>
          {sortedDates.length > 0 && (
            <button
              onClick={() => setExpanded((e) => !e)}
              style={{ background: expanded ? "#fff2e8" : "#fa8c16", color: expanded ? "#fa8c16" : "#fff", border: "1px solid #fa8c16", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              {expanded ? "Hide ▲" : "View Details ▼"}
            </button>
          )}
        </div>
      </div>

      {/* Deal-level detail — expands on toggle or tile click */}
      {expanded && sortedDates.length > 0 && (
        <div ref={detailRef} style={{ marginTop: 14, borderTop: "1px solid #ffd591", paddingTop: 12 }}>
          {sortedDates.map((date) => {
            const ps = payoutsByDate[date];
            const dayInterest  = ps.reduce((s, p) => s + (p.interestAmount  || 0), 0);
            const dayPrincipal = ps.reduce((s, p) => s + (p.principalAmount || 0), 0);
            const dayTotal     = ps.reduce((s, p) => s + (p.totalAmount     || 0), 0);
            const fmtD = new Date(date + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
            return (
              <div key={date} style={{ marginBottom: 10, background: "#fffbe6", borderRadius: 8, padding: "10px 12px", border: "1px solid #ffd591" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, color: "#d46b08", fontSize: 13 }}>{fmtD} — {ps.length} deal{ps.length > 1 ? "s" : ""}</span>
                  <span style={{ fontWeight: 700, color: "#d46b08", fontSize: 13 }}>₹{fmt(dayTotal)}</span>
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  {dayInterest > 0 && (
                    <span style={{ fontSize: 11, background: "#f6ffed", color: "#389e0d", borderRadius: 4, padding: "2px 8px", border: "1px solid #b7eb8f" }}>
                      Interest ₹{fmt(dayInterest)}
                    </span>
                  )}
                  {dayPrincipal > 0 && (
                    <span style={{ fontSize: 11, background: "#e6f7ff", color: "#0958d9", borderRadius: 4, padding: "2px 8px", border: "1px solid #91d5ff" }}>
                      Principal ₹{fmt(dayPrincipal)}
                    </span>
                  )}
                </div>
                {ps.map((p, i) => (
                  <div key={i} style={{ fontSize: 11, color: "#595959", display: "flex", justifyContent: "space-between", paddingLeft: 8, borderLeft: "2px solid #ffd591", marginBottom: 3 }}>
                    <span><span style={{ fontWeight: 700, color: "#8c8c8c" }}>#{p.dealId}</span> {p.dealName || ""}</span>
                    <span style={{ fontWeight: 600 }}>₹{fmt(p.totalAmount)}</span>
                  </div>
                ))}
              </div>
            );
          })}
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

const DealAnalyticsCharts = ({ data, earningsData, collapsible = false, defaultOpen = true }) => {
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
    <SectionCard title="Investment Analytics" badge={<span style={{ background: "#f9f0ff", color: "#722ed1", border: "1px solid #d3adf7", borderRadius: 6, padding: "2px 10px", fontSize: 12 }}>Charts</span>} collapsible={collapsible} defaultOpen={defaultOpen} summary="ROI charts & deal analytics">
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

// ── TIER PREVIEW BANNER ────────────────────────────────────────────────────
const TIER_INFO = {
  FREE: {
    label: "Free",
    icon: "📊",
    color: "#595959",
    bg: "#fafafa",
    border: "#d9d9d9",
    activeBg: "#f5f5f5",
    activeText: "#262626",
    features: ["Portfolio stats", "Active & closed deals", "Payout history"],
    locked: ["AI insights", "Earnings intelligence", "Charts & analytics", "Maturity planner"],
  },
  SMART: {
    label: "Smart",
    icon: "⚡",
    color: "#0050b3",
    bg: "#e6f7ff",
    border: "#91d5ff",
    activeBg: "linear-gradient(135deg, #0d2b6e, #0050b3)",
    activeText: "#fff",
    features: ["Everything in Free", "AI narrative insights", "Current FY earnings", "Reinvestment profile", "Referral tracking"],
    locked: ["FY filter & custom range", "Investment charts", "Smart maturity planner", "Earnings intelligence"],
    price: "₹500/year",
  },
  PRO: {
    label: "Pro",
    icon: "✦",
    color: "#722ed1",
    bg: "#f9f0ff",
    border: "#d3adf7",
    activeBg: "linear-gradient(135deg, #4a148c, #6a1b9a)",
    activeText: "#fff",
    features: ["Everything in Smart", "FY filter & custom range", "Investment analytics charts", "Smart maturity planner", "Full earnings intelligence"],
    price: "₹1,000/year",
  },
};

const TierPreviewBanner = ({ activeTier, onSelect, actualTier }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0f0f0", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 24, overflow: "hidden" }}>
      {/* Top bar */}
      <div
        onClick={() => setExpanded(v => !v)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", cursor: "pointer", background: "#fafafa", borderBottom: expanded ? "1px solid #f0f0f0" : "none" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>🎯</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#262626" }}>Experience All Plans</div>
            <div style={{ fontSize: 12, color: "#8c8c8c" }}>Click a plan below to preview its features — your account is currently on <strong style={{ color: "#722ed1" }}>OXY Pro (trial)</strong></div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Mini tier pill indicators */}
          {["FREE", "SMART", "PRO"].map(t => (
            <span
              key={t}
              onClick={e => { e.stopPropagation(); onSelect(t); if (!expanded) setExpanded(true); }}
              style={{
                padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", border: `1px solid ${TIER_INFO[t].border}`,
                background: activeTier === t ? (t === "PRO" ? "#722ed1" : t === "SMART" ? "#0050b3" : "#595959") : TIER_INFO[t].bg,
                color: activeTier === t ? "#fff" : TIER_INFO[t].color,
                transition: "all 0.15s",
              }}
            >
              {TIER_INFO[t].icon} {TIER_INFO[t].label}
            </span>
          ))}
          <span style={{ fontSize: 13, color: "#8c8c8c", marginLeft: 4 }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Expanded comparison cards */}
      {expanded && (
        <div style={{ padding: "16px 20px" }}>
          <div className="row g-3">
            {["FREE", "SMART", "PRO"].map(t => {
              const info = TIER_INFO[t];
              const isActive = activeTier === t;
              return (
                <div key={t} className="col-12 col-md-4">
                  <div
                    onClick={() => onSelect(t)}
                    style={{
                      borderRadius: 12, padding: "18px 16px", cursor: "pointer", transition: "all 0.2s",
                      border: isActive ? `2px solid ${info.color}` : `1px solid ${info.border}`,
                      background: isActive ? info.bg : "#fff",
                      boxShadow: isActive ? `0 4px 16px ${info.color}22` : "none",
                      position: "relative",
                    }}
                  >
                    {isActive && (
                      <div style={{ position: "absolute", top: -1, right: 12, background: info.color, color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: "0 0 8px 8px", padding: "2px 10px", letterSpacing: 0.5 }}>
                        PREVIEWING
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: info.color }}>{info.icon} OXY {info.label}</div>
                      {info.price ? (
                        <span style={{ fontSize: 12, fontWeight: 700, color: info.color, background: info.bg, border: `1px solid ${info.border}`, borderRadius: 20, padding: "2px 10px" }}>{info.price}</span>
                      ) : (
                        <span style={{ fontSize: 12, color: "#8c8c8c" }}>Free</span>
                      )}
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      {info.features.map(f => (
                        <div key={f} style={{ fontSize: 12, color: "#389e0d", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700 }}>✓</span> {f}
                        </div>
                      ))}
                      {info.locked?.map(f => (
                        <div key={f} style={{ fontSize: 12, color: "#bfbfbf", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span>🔒</span> {f}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); onSelect(t); }}
                      style={{
                        width: "100%", padding: "8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                        background: isActive ? info.color : info.bg,
                        color: isActive ? "#fff" : info.color,
                        border: `1px solid ${info.border}`,
                        transition: "all 0.15s",
                      }}
                    >
                      {isActive ? "Currently Previewing" : `Preview ${info.label}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14, padding: "10px 14px", background: "#fffbe6", borderRadius: 8, border: "1px solid #ffe58f", fontSize: 12, color: "#614700" }}>
            💡 <strong>Limited time trial:</strong> All lenders can experience OXY Pro features for free. Subscribe before the trial ends to keep your AI insights.
          </div>
        </div>
      )}
    </div>
  );
};

// ── MAIN DASHBOARD ─────────────────────────────────────────────────────────
const LenderPortfolioDashboard = () => {
  const { lenderId: paramLenderId } = useParams();
  const resolvedLenderId = paramLenderId || getUserId();
  // ?tier=FREE|SMART|PRO — demo/testing override (bypasses backend tier)
  const tierOverride = new URLSearchParams(window.location.search).get("tier")?.toUpperCase() || null;

  const earningsCache = useRef({});
  const [data, setData] = useState(null);
  const [earningsData, setEarningsData] = useState(null);
  const [upcomingData, setUpcomingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [upcomingLoading, setUpcomingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dealsShown, setDealsShown] = useState(10);
  const [fyFilter, setFyFilter] = useState(currentMonthFilter());
  const [showAllMaturities, setShowAllMaturities] = useState(false);
  const [showAllDeals, setShowAllDeals] = useState(false);
  const [dealHistoryFilter, setDealHistoryFilter] = useState("ALL");
  const [dealSectionOpen, setDealSectionOpen] = useState(false);
  const [refMonthsShown, setRefMonthsShown] = useState(10);
  const [refFilter, setRefFilter] = useState("ALL"); // ALL | PAID | PENDING
  const [previewTier, setPreviewTier] = useState(null);
  const [interestExpanded, setInterestExpanded] = useState(false);
  const [principalExpanded, setPrincipalExpanded] = useState(false);
  const [maturingExpanded, setMaturingExpanded] = useState(false);
  const [dealParticipationExpanded, setDealParticipationExpanded] = useState(false);
  const [maturityFilter, setMaturityFilter] = useState("all");
  const [maturitySectionOpen, setMaturitySectionOpen] = useState(false);
  const [narrativeExpanded, setNarrativeExpanded] = useState(false);
  const [timingBucket, setTimingBucket] = useState(null);   // which bucket panel is open
  const [timingDetail, setTimingDetail] = useState({});     // { EARLY: {records,page,total,hasMore,loading} }
  const [remindedDeals, setRemindedDeals] = useState(new Set()); // dealIds where reminder was sent
  const [momFilter, setMomFilter] = useState("6M");
  const [momData, setMomData] = useState(null);

  // Default PRO view; lender can switch via tier pills; ?tier= URL override for testing
  const effectiveTier = (tierOverride || previewTier || 'PRO').toUpperCase();
  const isPro   = effectiveTier === 'PRO';
  const isSmart = effectiveTier === 'PRO' || effectiveTier === 'SMART';

  // Portfolio
  useEffect(() => {
    if (!resolvedLenderId) return;
    setLoading(true);
    setError(null);
    axios.get(`${MARKETPLACE_URL}/v1/ai/lender/${resolvedLenderId}/portfolio`, { headers: { accessToken: getToken() } })
      .then((res) => {
        const d = res.data;
        if (String(resolvedLenderId) === "77221" || String(resolvedLenderId) === "27127") {
          d.lenderName = "Pradeep Chakravarthy";
          d.email      = "pradeepchk@gmail.com";
        }
        setData(d);
      })
      .catch((err) => setError(err?.response?.data?.error || err.message || "Failed to load portfolio"))
      .finally(() => setLoading(false));
  }, [resolvedLenderId]);

  // All lenders are PRO — no SMART-tier FY auto-set needed

  // Earnings — reloads when lender or FY filter changes; results cached by filter key
  useEffect(() => {
    if (!resolvedLenderId) return;
    if (fyFilter.mode === "custom" && (!fyFilter.from || !fyFilter.to)) return;
    const params = new URLSearchParams();
    if (fyFilter.mode === "fy" && fyFilter.fyYear) {
      params.append("fy", fyFilter.fyYear);
    } else if ((fyFilter.mode === "custom" || fyFilter.mode === "month") && fyFilter.from && fyFilter.to) {
      params.append("from", fyFilter.from);
      params.append("to", fyFilter.to);
    }
    const qs = params.toString();
    const cacheKey = `${resolvedLenderId}:${qs}`;
    if (earningsCache.current[cacheKey]) {
      setEarningsData(earningsCache.current[cacheKey]);
      return;
    }
    // Only show spinner after 600ms — fast Redis hits never show a loading indicator
    const spinnerTimer = setTimeout(() => setEarningsLoading(true), 600);
    axios.get(`${MARKETPLACE_URL}/v1/ai/lender/${resolvedLenderId}/earnings${qs ? "?" + qs : ""}`, { headers: { accessToken: getToken() } })
      .then((res) => { earningsCache.current[cacheKey] = res.data; setEarningsData(res.data); })
      .catch(() => {})
      .finally(() => { clearTimeout(spinnerTimer); setEarningsLoading(false); });
  }, [resolvedLenderId, fyFilter]);

  // M-o-M: always fetch all-time earnings (no date filter) independently of fyFilter
  useEffect(() => {
    if (!resolvedLenderId) return;
    axios.get(`${MARKETPLACE_URL}/v1/ai/lender/${resolvedLenderId}/earnings`, { headers: { accessToken: getToken() } })
      .then((res) => setMomData(res.data))
      .catch(() => {});
  }, [resolvedLenderId]);

  // Upcoming payouts — loads once on mount, independent of FY filter
  useEffect(() => {
    if (!resolvedLenderId) return;
    setUpcomingLoading(true);
    axios.get(`${MARKETPLACE_URL}/v1/ai/lender/${resolvedLenderId}/upcoming-payouts`, { headers: { accessToken: getToken() } })
      .then((res) => setUpcomingData(res.data))
      .catch(() => {})
      .finally(() => setUpcomingLoading(false));
  }, [resolvedLenderId]);

  const fetchTimingDetail = (bucket, page = 0) => {
    setTimingDetail(prev => ({
      ...prev,
      [bucket]: { ...(prev[bucket] || {}), loading: true, error: null }
    }));
    axios.get(
      `${MARKETPLACE_URL}/v1/ai/lender/${resolvedLenderId}/payment-timing?bucket=${bucket}&page=${page}&size=20`,
      { headers: { accessToken: getToken() } }
    ).then(res => {
      const json = res.data;
      setTimingDetail(prev => {
        const existing = prev[bucket] || {};
        const allRecords = page === 0 ? json.records : [...(existing.records || []), ...(json.records || [])];
        return { ...prev, [bucket]: { records: allRecords, page: json.page, total: json.total, hasMore: json.hasMore, loading: false } };
      });
    }).catch(() => {
      setTimingDetail(prev => ({ ...prev, [bucket]: { ...(prev[bucket] || {}), loading: false, error: 'Failed to load' } }));
    });
  };

  const handleTimingClick = (bucket) => {
    if (timingBucket === bucket) { setTimingBucket(null); return; }
    setTimingBucket(bucket);
    if (!timingDetail[bucket] || !timingDetail[bucket].records) fetchTimingDetail(bucket, 0);
  };

  const heroBg = isPro
    ? "linear-gradient(135deg, #1a237e 0%, #4a148c 60%, #6a1b9a 100%)"
    : isSmart
    ? "linear-gradient(135deg, #0d2b6e 0%, #0050b3 100%)"
    : "linear-gradient(135deg, #262626 0%, #434343 100%)";

  const DEAL_LIMIT = isSmart ? 10 : 5;

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
              <p className="mt-3 text-muted">Preparing your portfolio…</p>
            </div>
          )}

          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && data && (
            <>
              {/* ── 0. TIER PREVIEW BANNER ── */}
              <TierPreviewBanner
                activeTier={effectiveTier}
                actualTier={(data?.membershipTier || 'PRO').toUpperCase()}
                onSelect={(t) => setPreviewTier(t)}
              />

              {/* ── 1. HERO ── */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card" style={{ background: heroBg, border: "none", borderRadius: 16 }}>
                    <div className="card-body p-4">
                      <div className="d-flex align-items-start mb-3" style={{ flexWrap: "wrap", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                            <h4 style={{ color: "#fff", margin: 0, fontWeight: 700, fontSize: 22 }}>{data.lenderName}</h4>
                            {data.membershipBadge && <MembershipBadge badge={data.membershipBadge} />}
                          </div>
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
                            {isPro && data.churnRiskLevel && (
                              <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: "6px 14px" }}>
                                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>Engagement</div>
                                <div style={{ color: churnColor(data.churnRiskLevel), fontWeight: 700, fontSize: 14 }}>{data.churnRiskLevel} RISK</div>
                                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, marginTop: 2, maxWidth: 160 }}>
                                  {(data.churnRiskLevel || '').toUpperCase() === 'LOW'
                                    ? 'Actively reinvesting — strong platform loyalty'
                                    : (data.churnRiskLevel || '').toUpperCase() === 'MEDIUM'
                                    ? 'Occasional gaps in reinvestment activity'
                                    : 'No recent reinvestment — may need re-engagement'}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        {isSmart && data.reinvestmentStarRating && (
                          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 16px", textAlign: "center" }}>
                            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, textTransform: "uppercase", marginBottom: 4 }}>Reinvestment</div>
                            <StarRating rating={data.reinvestmentStarRating} />
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
                        <OxiBadge tier={effectiveTier} />
                        {isSmart && (
                          <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
                            {isPro ? "Full AI intelligence active — updated live" : "AI insights enabled — portfolio analysis active"}
                          </span>
                        )}
                      </div>
                      {(() => {
                          const firstName = (data.lenderName || "").split(" ")[0];
                          const allLines = (data.narrative || data.aiNarrative || "").split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
                          const visibleLines = narrativeExpanded ? allLines : allLines.slice(0, 3);
                          const icons = isPro ? ["🎯", "💰", "♻️", "📈", "💡", "⚠️"] : ["📊", "💰", "♻️", "📈", "💡"];
                          return (
                            <div>
                              {firstName && (
                                <div style={{ color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                                  Hi {firstName}! 👋
                                </div>
                              )}
                              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {visibleLines.map((line, idx) => {
                                  const text = line.replace(/^[•\-\*#]+\s*/, "").replace(/\*\*/g, "");
                                  return (
                                    <div key={idx} style={{ background: "rgba(255,255,255,0.09)", borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 12, border: "1px solid rgba(255,255,255,0.12)" }}>
                                      <span style={{ fontSize: 20, lineHeight: 1 }}>{icons[idx] || "•"}</span>
                                      <span style={{ color: "#fff", fontSize: 15, lineHeight: 1.6 }}>{text}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              {allLines.length > 3 && (
                                <button onClick={() => setNarrativeExpanded(v => !v)}
                                  style={{ marginTop: 10, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", borderRadius: 20, padding: "5px 18px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                                  {narrativeExpanded ? "Show less ▲" : `Show more (${allLines.length - 3} more) ▼`}
                                </button>
                              )}
                            </div>
                          );
                        })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── 2. STATS — all tiers see basic numbers ── */}
              <div className="row mb-2">
                <StatCard label="Total Invested" value={`₹${fmt(data.totalInvested)}`} color="#1890ff"
                  sub={data.totalWithdrawn > 0 ? `Net deployed ₹${fmt(data.netInvested)}` : null} />
                <InterestBreakdownCard data={data} />
                <StatCard label="Principal Returned" value={`₹${fmt(data.totalPrincipalReturned)}`} color="#13c2c2"
                  sub={data.closedDeals > 0 ? `Across ${data.closedDeals} closed deals` : null} />
                <StatCard label="Wallet Balance" value={`₹${fmt(data.walletBalance)}`} color="#722ed1"
                  sub={data.walletIdleDays > 0 ? `Idle ${Math.round(data.walletIdleDays)} days` : "Active"} />
              </div>
              <div className="row mb-4">
                <StatCard label="Active Deals" value={data.activeDeals ?? "—"} color="#52c41a"
                  sub={`${data.closedDeals ?? 0} closed · ${data.totalDeals ?? 0} total`} />
                <StatCard label="Payments Received" value={fmt(data.emisPaid ?? 0)} color="#faad14"
                  sub={data.lastPaidDate && data.lastPaidDate !== "N/A" ? `Last: ${fmtDate(data.lastPaidDate)}` : null} />
                {/* Referral stat: SMART+ gets the expandable card, FREE gets a locked tile */}
                {isSmart ? (
                  <ReferralBonusCard data={data} />
                ) : (
                  <div className="col-6 col-md mb-3">
                    <div className="card text-center h-100" style={{ borderRadius: 12, border: "1px dashed #d9d9d9", background: "#fafafa" }}>
                      <div className="card-body py-3 px-2 d-flex flex-column align-items-center justify-content-center">
                        <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#8c8c8c", marginBottom: 6 }}>Referral Bonus</p>
                        <div style={{ fontSize: 18 }}>🔒</div>
                        <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 4 }}>OXY Smart</div>
                      </div>
                    </div>
                  </div>
                )}
                <StatCard label="Payout Reliability"
                  value={(() => {
                    const timed = (data.creditsPaidEarly ?? 0) + (data.creditsPaidSameDay ?? 0) + (data.creditsPaidNextDay ?? 0) + (data.creditsPaidLate ?? 0);
                    const late  = data.creditsPaidLate ?? 0;
                    if (timed === 0) return `${data.creditsDeliveredTotal ?? data.successfulPayments ?? 0}`;
                    return `${Math.round(((timed - late) / timed) * 100)}%`;
                  })()}
                  color="#52c41a"
                  sub={(() => {
                    const early = data.creditsPaidEarly ?? 0;
                    const same  = data.creditsPaidSameDay ?? 0;
                    const next  = data.creditsPaidNextDay ?? 0;
                    const late  = data.creditsPaidLate ?? 0;
                    if (early > 0) return `⚡ ${early} early · ✅ ${same + next} on time · ⏰ ${late} late`;
                    if (same + next > 0) return `✅ ${same} same day · +1d: ${next}${late > 0 ? ` · ⏰ ${late} late` : ''}`;
                    return `${data.successfulPayments ?? 0} payments delivered`;
                  })()} />
              </div>

<<<<<<< HEAD
              {/* ── RBI ₹50L Lending Limit Bar ── */}
              {(() => {
                const RBI_LIMIT = 5000000;
                const active = data.earningsForecast?.totalActiveAmount ?? data.totalInvested ?? 0;
                const remaining = Math.max(RBI_LIMIT - active, 0);
                const usedPct = Math.min((active / RBI_LIMIT) * 100, 100);
                const toLakhs = (v) => (v / 100000).toFixed(2);
                const barColor = usedPct >= 90 ? "#e53935" : usedPct >= 70 ? "#fa8c16" : "#52c41a";
                return (
                  <div className="row mb-4">
                    <div className="col-12">
                      <div style={{ background: "#fff", borderRadius: 12, border: `1.5px solid ${barColor}`, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#222" }}>RBI Lending Limit</div>
                            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>Max ₹50 Lakhs per lender as per RBI P2P guidelines</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontWeight: 800, fontSize: 22, color: barColor }}>₹{toLakhs(remaining)} L</div>
                            <div style={{ fontSize: 11, color: "#888" }}>remaining to invest</div>
                          </div>
                        </div>
                        <div style={{ background: "#f0f0f0", borderRadius: 8, height: 12, overflow: "hidden" }}>
                          <div style={{ width: `${usedPct}%`, background: barColor, height: "100%", borderRadius: 8, transition: "width 0.6s ease" }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12, color: "#888" }}>
                          <span>Deployed: ₹{toLakhs(active)} L</span>
                          <span>{usedPct.toFixed(1)}% used of ₹50 L limit</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

=======
>>>>>>> 0d0503fb1f876ac442e845b69dddcf0b6cc4fd71
              {/* ── 3. MONTH-ON-MONTH EARNINGS — always visible ── */}
              {(() => {
                const allMonths = momData ? [...(momData.monthlyEarnings || [])].reverse() : [];

                // Apply filter to allMonths (already sorted oldest→newest after reverse)
<<<<<<< HEAD
                const now = REF_DATE;
=======
                const now = new Date();
>>>>>>> 0d0503fb1f876ac442e845b69dddcf0b6cc4fd71
                const curYear  = now.getFullYear();
                const curMonth = now.getMonth() + 1; // 1-based
                // FY starts April of current or previous year
                const fyStartYear = curMonth >= 4 ? curYear : curYear - 1;

                const months = (() => {
                  if (momFilter === "3M") return allMonths.slice(-3);
                  if (momFilter === "6M") return allMonths.slice(-6);
                  if (momFilter === "FY") return allMonths.filter(m =>
                    (m.year > fyStartYear) ||
                    (m.year === fyStartYear && m.month >= 4)
                  );
                  return allMonths; // All
                })();

                const labels    = months.map(m => m.monthLabel || `${m.month}/${m.year}`);
                const interest  = months.map(m => Math.round(m.interestAmount || 0));
                const principal = months.map(m => Math.round(m.principalReturned || 0));
                const totalInterest = interest.reduce((s,v) => s+v, 0);

                const momOptions = {
                  chart: { type: "bar", stacked: false, fontFamily: "inherit", toolbar: { show: false }, zoom: { enabled: false } },
                  plotOptions: { bar: { borderRadius: 4, columnWidth: "55%" } },
                  colors: ["#0ea5a1", "#2563eb"],
                  dataLabels: { enabled: false },
                  xaxis: { categories: labels, labels: { style: { fontSize: "11px" } } },
                  yaxis: { labels: { formatter: v => v >= 1000 ? `₹${(v/1000).toFixed(0)}K` : `₹${v}` } },
                  legend: { position: "top", fontSize: "12px" },
                  tooltip: { y: { formatter: v => `₹${v.toLocaleString("en-IN")}` } },
                  grid: { borderColor: "#f0f0f0" },
                };

                const filterBtnStyle = (f) => ({
                  padding: "3px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
                  background: momFilter === f ? "#0ea5a1" : "#f0f0f0",
                  color: momFilter === f ? "#fff" : "#595959",
                  transition: "background 0.15s",
                });

                return (
                  <SectionCard
                    title="Month-on-Month Earnings"
                    badge={<span style={{ background: "#e6f7ff", color: "#096dd9", border: "1px solid #91d5ff", borderRadius: 6, padding: "2px 10px", fontSize: 12 }}>Trend</span>}
                    collapsible defaultOpen={true}
                    summary={allMonths.length > 0 ? `₹${fmt(totalInterest)} interest · ${months.length} months` : "Loading…"}
                  >
                    {!momData && (
                      <div style={{ textAlign: "center", padding: "32px 0", color: "#8c8c8c", fontSize: 14 }}>Loading earnings data…</div>
                    )}
                    {momData && allMonths.length === 0 && (
                      <div style={{ textAlign: "center", padding: "32px 0", color: "#8c8c8c", fontSize: 14 }}>No earnings records found for this account.</div>
                    )}
                    {allMonths.length > 0 && (
                      <>
                        {/* Filter tabs */}
                        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                          {["3M","6M","FY","All"].map(f => (
                            <button key={f} style={filterBtnStyle(f)} onClick={() => setMomFilter(f)}>{f === "FY" ? `FY ${fyStartYear}-${String(fyStartYear+1).slice(2)}` : f}</button>
                          ))}
                        </div>

                        {/* Recent month tiles — top 3 from filtered set */}
                        <div style={{ marginBottom: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
                          {[...months].reverse().slice(0, 3).map((m, i) => (
                            <div key={i} style={{ background: i === 0 ? "#e6f7ff" : "#fafafa", border: `1px solid ${i === 0 ? "#91d5ff" : "#f0f0f0"}`, borderRadius: 8, padding: "8px 14px", minWidth: 110 }}>
                              <div style={{ fontSize: 11, color: "#8c8c8c", marginBottom: 2 }}>{m.monthLabel}</div>
                              <div style={{ fontSize: 16, fontWeight: 700, color: "#0ea5a1" }}>₹{fmt(m.interestAmount)}</div>
                              <div style={{ fontSize: 11, color: "#595959" }}>interest</div>
                            </div>
                          ))}
                        </div>

                        {months.length === 0 ? (
                          <div style={{ textAlign: "center", padding: "24px 0", color: "#8c8c8c", fontSize: 13 }}>No data for this period. Try a wider filter.</div>
                        ) : (
                          <ReactApexChart
                            key={momFilter}
                            options={momOptions}
                            series={[
                              { name: "Interest Earned", data: interest },
                              { name: "Principal Returned", data: principal },
                            ]}
                            type="bar"
                            height={240}
                          />
                        )}
                      </>
                    )}
                  </SectionCard>
                );
              })()}

              {/* ── 4. EARNINGS SECTION ── */}
              {/* FREE: locked */}
              {!isSmart && (
                <LockCard title="Earnings Intelligence — Interest, Principal & Period Summary" requiredTier="SMART" />
              )}
              {/* SMART: current FY 3-tile summary only — no filter, no narrative, no upcoming */}
              {isSmart && !isPro && earningsData && (
                <div className="card mb-4" style={{ borderRadius: 14, border: "1px solid #f0f0f0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <div className="card-header" style={{ background: "#fafafa", borderBottom: "1px solid #f0f0f0", borderRadius: "14px 14px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h6 style={{ margin: 0, fontWeight: 700, color: "#262626" }}>{earningsData.fyLabel || "Current FY"} Earnings Summary</h6>
                    {earningsLoading && <span style={{ fontSize: 12, color: "#1890ff" }}>Updating…</span>}
                  </div>
                  <div className="card-body">
                    <div className="row g-3 mb-3">
                      {[
                        { label: "Interest Earned", value: `₹${fmt(earningsData.fyInterestEarned)}`, color: "#52c41a", bg: "#f6ffed" },
                        { label: "Principal Returned", value: `₹${fmt(earningsData.fyPrincipalReturned)}`, color: "#1890ff", bg: "#e6f7ff" },
                        { label: "Total Received", value: `₹${fmt(earningsData.fyTotalReceived)}`, color: "#722ed1", bg: "#f9f0ff" },
                      ].map((item) => (
                        <div key={item.label} className="col-12 col-md-4">
                          <div style={{ background: item.bg, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                            <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{item.label}</div>
                            <div style={{ fontWeight: 700, fontSize: 20, color: item.color }}>{item.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "#f9f0ff", borderRadius: 10, padding: "12px 16px", textAlign: "center", border: "1px dashed #d3adf7" }}>
                      <div style={{ fontSize: 13, color: "#722ed1", fontWeight: 600, marginBottom: 4 }}>📊 Month-by-month chart, FY selector &amp; forecast available in OXY Pro</div>
                      <div style={{ fontSize: 12, color: "#8c8c8c" }}>Upgrade to see earning trends, ROI analysis &amp; ₹1L target planner</div>
                    </div>
                  </div>
                </div>
              )}
              {/* PRO: full FY filter + earnings summary + upcoming payouts */}
              {isPro && (
                <>
                  <FyFilterBar fyFilter={fyFilter} setFyFilter={setFyFilter} loading={earningsLoading} />

                  {/* Platform deal stats — always visible */}
                  {data.platformHealth && (() => {
                    const isTestMode = !!process.env.REACT_APP_REFERENCE_DATE;
                    const lastMonthCount = data.platformHealth.dealsAnnouncedLastMonth || (isTestMode ? 2 : 0);
                    const lastMonthValue = data.platformHealth.dealsValueLastMonth    || (isTestMode ? 1500000 : 0);
                    const thisMonthCount = data.platformHealth.dealsAnnouncedThisMonth || (isTestMode ? 1 : 0);
                    const thisMonthValue = data.platformHealth.dealsValueThisMonth    || (isTestMode ? 500000 : 0);
                    if (lastMonthCount === 0 && thisMonthCount === 0) return null;
                    return (
                      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                        {lastMonthCount > 0 && (
                          <div style={{ background: "#fff7e6", border: "1px solid #ffd591", borderRadius: 20, padding: "4px 14px", fontSize: 13, color: "#873800", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                            <span>🏦</span><span>{lastMonthCount} Deal{lastMonthCount > 1 ? "s" : ""} Launched Last Month · ₹{lastMonthValue.toLocaleString("en-IN")}</span>
                          </div>
                        )}
                        {thisMonthCount > 0 && (
                          <div style={{ background: "#f6ffed", border: "1px solid #b7eb8f", borderRadius: 20, padding: "4px 14px", fontSize: 13, color: "#237804", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                            <span>🏦</span><span>{thisMonthCount} Deal{thisMonthCount > 1 ? "s" : ""} Launched This Month · ₹{thisMonthValue.toLocaleString("en-IN")}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Current Month tiles — 3 up + 3 down, no Wallet */}
                  {fyFilter.mode === "month" ? (() => {
                    // Use earningsData (filtered by selected month) so the reference date override works correctly
                    const earned         = (earningsData?.fyInterestEarned    ?? data.currentMonthInterestEarned)    || 0;
                    const projected      = data.currentMonthInterestProjected || 0;
                    const total          = earned + projected;
                    const earnedPct      = total > 0 ? Math.round((earned / total) * 100) : 0;
                    const interestByDeal = (data.currentMonthInterestByDeal || []).filter(d => d.payoutFrequency !== "YEARLY");
                    const principalByDeal = data.currentMonthPrincipalByDeal || [];
                    const principalThisMonth = (earningsData?.fyPrincipalReturned ?? data.currentMonthPrincipalReturned) || 0;
                    const maturingCount  = data.maturingThisMonthCount || 0;
                    const refCredited    = data.referralThisMonthCredited || 0;
                    const monthLabel = REF_DATE.toLocaleString("en-IN", { month: "long", year: "numeric" });
                    return (
                      <SectionCard title={`This Month — ${monthLabel}`} collapsible defaultOpen={true}
                        summary={`₹${fmt(earned + projected)} interest · ${maturingCount} maturing · ${data.activeDeals ?? 0} active deals`}>
                      <>
                      {/* Row 1: Interest, Principal, Active Deals */}
                      <div className="row mb-3 g-3">
                        {/* Tile 1: Interest This Month */}
                        <div className="col-12 col-md-4">
                          <div
                            style={{ background: interestExpanded ? "linear-gradient(135deg, #d9f7be, #b7eb8f)" : "linear-gradient(135deg, #f6ffed, #d9f7be)", borderRadius: 14, padding: "16px 18px", border: interestExpanded ? "2px solid #52c41a" : "1px solid #b7eb8f", height: "100%", cursor: interestByDeal.length > 0 ? "pointer" : "default", transition: "all 0.2s" }}
                            onClick={() => { if (interestByDeal.length > 0) { setPrincipalExpanded(false); setMaturingExpanded(false); setInterestExpanded(v => !v); } }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                              <span style={{ fontSize: 20 }}>📈</span>
                              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#389e0d", fontWeight: 700 }}>Interest This Month</div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 18, color: "#237804", marginBottom: 2 }}>₹{fmt(earned)} earned</div>
                            <div style={{ fontSize: 12, color: "#52c41a", marginBottom: 6 }}>+ ₹{fmt(projected)} projected</div>
                            {total > 0 && (
                              <>
                                <div style={{ background: "#f0f0f0", borderRadius: 4, height: 6, overflow: "hidden" }}>
                                  <div style={{ width: `${earnedPct}%`, height: "100%", background: "#52c41a", borderRadius: 4, transition: "width 0.8s ease" }} />
                                </div>
                                <div style={{ fontSize: 10, color: "#8c8c8c", marginTop: 3 }}>{earnedPct}% earned of month total</div>
                              </>
                            )}
                            {projected > 0 && <div style={{ fontSize: 10, color: "#8c8c8c", marginTop: 3 }}>Annual payout deals excluded from projection</div>}
                            {interestByDeal.length > 0 && (
                              <div style={{ fontSize: 11, color: "#389e0d", marginTop: 6 }}>{interestExpanded ? "▲ hide breakdown" : "▼ view per deal"}</div>
                            )}
                          </div>
                        </div>

                        {/* Tile 2: Principal This Month */}
                        <div className="col-12 col-md-4">
                          <div
                            style={{ background: principalExpanded ? "linear-gradient(135deg, #d6e4ff, #adc6ff)" : "linear-gradient(135deg, #f0f5ff, #d6e4ff)", borderRadius: 14, padding: "16px 18px", border: principalExpanded ? "2px solid #1677ff" : "1px solid #adc6ff", height: "100%", cursor: principalByDeal.length > 0 ? "pointer" : "default", transition: "all 0.2s" }}
                            onClick={() => { if (principalByDeal.length > 0) { setInterestExpanded(false); setMaturingExpanded(false); setPrincipalExpanded(v => !v); } }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                              <span style={{ fontSize: 20 }}>🏦</span>
                              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#1d39c4", fontWeight: 700 }}>Principal This Month</div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 18, color: "#10239e", marginBottom: 4 }}>
                              {principalThisMonth > 0 ? `₹${fmt(principalThisMonth)} returned` : "₹0"}
                            </div>
                            <div style={{ fontSize: 12, color: "#1d39c4" }}>
                              {principalThisMonth > 0 ? "Closed deals — principal credited" : "No deals closed this month"}
                            </div>
                            {principalByDeal.length > 0 && (
                              <div style={{ fontSize: 11, color: "#1d39c4", marginTop: 6 }}>{principalExpanded ? "▲ hide breakdown" : "▼ view per deal"}</div>
                            )}
                          </div>
                        </div>

                        {/* Tile 3: Active Deals */}
                        <div className="col-12 col-md-4">
                          <div
                            style={{ background: "linear-gradient(135deg, #f6ffed, #d9f7be)", borderRadius: 14, padding: "16px 18px", border: "1px solid #b7eb8f", height: "100%", cursor: "pointer", transition: "all 0.2s" }}
                            onClick={() => { setDealHistoryFilter("ACTIVE"); setDealSectionOpen(true); scrollTo("section-deal-history"); }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 14px rgba(82,196,26,0.2)"}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = ""}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                              <span style={{ fontSize: 20 }}>📊</span>
                              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#389e0d", fontWeight: 700 }}>Active Deals</div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 28, color: "#237804", marginBottom: 2 }}>{data.activeDeals ?? 0}</div>
                            <div style={{ fontSize: 12, color: "#389e0d", marginBottom: 4 }}>₹{fmt(data.earningsForecast?.totalActiveAmount)} deployed</div>
                            <div style={{ fontSize: 11, color: "#52c41a" }}>▼ view active deals</div>
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Maturing, Referral, Deal Participation */}
                      <div className="row mb-4 g-3">
                        {/* Tile 4: Maturing This Month */}
                        <div className="col-12 col-md-4">
                          <div
                            style={{ background: "linear-gradient(135deg, #fff7e6, #ffe7ba)", borderRadius: 14, padding: "16px 18px", border: "1px solid #ffd591", height: "100%", cursor: maturingCount > 0 ? "pointer" : "default", transition: "all 0.2s" }}
                            onClick={() => { if (maturingCount > 0) { setInterestExpanded(false); setPrincipalExpanded(false); setDealParticipationExpanded(false); setMaturityFilter("thisMonth"); setShowAllMaturities(true); setMaturitySectionOpen(true); scrollTo("section-maturity"); } }}
                            onMouseEnter={e => { if (maturingCount > 0) e.currentTarget.style.boxShadow = "0 4px 14px rgba(250,140,22,0.25)"; }}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = ""}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                              <span style={{ fontSize: 20 }}>📅</span>
                              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#d46b08", fontWeight: 700 }}>Maturing This Month</div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 28, color: "#ad4e00", marginBottom: 4 }}>{maturingCount}</div>
                            <div style={{ fontSize: 12, color: "#d46b08" }}>
                              {maturingCount === 0 ? "No deals maturing" : `deal${maturingCount > 1 ? "s" : ""} ↓ view in planner`}
                            </div>
                          </div>
                        </div>

                        {/* Tile 5: Referral This Month */}
                        <div className="col-12 col-md-4">
                          <div style={{ background: "linear-gradient(135deg, #fff0f6, #ffd6e7)", borderRadius: 14, padding: "16px 18px", border: "1px solid #ffadd2", height: "100%" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                              <span style={{ fontSize: 20 }}>🎁</span>
                              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#c41d7f", fontWeight: 700 }}>Referral This Month</div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 18, color: "#9e1068", marginBottom: 4 }}>₹{fmt(refCredited)} credited</div>
                            <div style={{ fontSize: 12, color: "#c41d7f" }}>{refCredited === 0 ? "₹0 this month" : "Referral bonus paid this month"}</div>
                          </div>
                        </div>

                        {/* Tile 6: Deal Participation */}
                        {(() => {
                          const mine     = data.myDealsThisMonth || 0;
                          const launched = data.platformHealth?.dealsAnnouncedThisMonth || 0;
                          const pct      = launched > 0 ? Math.round((mine / launched) * 100) : null;
                          return (
                            <div className="col-12 col-md-4">
                              <div
                                style={{ background: dealParticipationExpanded ? "linear-gradient(135deg, #d6e4ff, #adc6ff)" : "linear-gradient(135deg, #f0f5ff, #e8f4fd)", borderRadius: 14, padding: "16px 18px", border: dealParticipationExpanded ? "2px solid #1677ff" : "1px solid #91caff", height: "100%", cursor: mine > 0 ? "pointer" : "default", transition: "all 0.2s" }}
                                onClick={() => { if (mine > 0) { setInterestExpanded(false); setPrincipalExpanded(false); setDealParticipationExpanded(v => !v); } }}
                              >
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                  <span style={{ fontSize: 20 }}>🏹</span>
                                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#0958d9", fontWeight: 700 }}>Deal Participation</div>
                                </div>
                                <div style={{ fontWeight: 700, fontSize: 18, color: "#003eb3", marginBottom: 2 }}>{mine} deal{mine !== 1 ? "s" : ""} this month</div>
                                {launched > 0 && pct !== null ? (
                                  <>
                                    <div style={{ fontSize: 12, color: "#0958d9", marginBottom: 6 }}>{mine} of {launched} platform deals</div>
                                    <div style={{ background: "#e6f4ff", borderRadius: 4, height: 6, overflow: "hidden" }}>
                                      <div style={{ width: `${pct}%`, height: "100%", background: "#1677ff", borderRadius: 4, transition: "width 0.8s ease" }} />
                                    </div>
                                    <div style={{ fontSize: 10, color: "#8c8c8c", marginTop: 3 }}>{pct}% of this month's deals</div>
                                  </>
                                ) : (
                                  <div style={{ fontSize: 12, color: "#8c8c8c" }}>{mine === 0 ? "No new investments this month" : "Invested this month"}</div>
                                )}
                                {mine > 0 && <div style={{ fontSize: 11, color: "#1677ff", marginTop: 6 }}>{dealParticipationExpanded ? "▲ hide details" : "▼ view deals"}</div>}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Breakdown panel — shown below tiles when a tile is clicked */}
                      {(interestExpanded || principalExpanded || dealParticipationExpanded) && (() => {
                        const activeTitle  = interestExpanded ? "📈 Interest This Month — Per Deal" : principalExpanded ? "🏦 Principal This Month — Per Deal" : "🏹 Deal Participation This Month";
                        const borderColor  = interestExpanded ? "#52c41a" : principalExpanded ? "#1677ff" : "#1677ff";
                        const headerColor  = interestExpanded ? "#237804" : principalExpanded ? "#10239e" : "#003eb3";
                        const nowD = new Date();
                        const thisMonthDeals = (data.deals || data.allDeals || []).filter(d => {
                          if (!d.startDate) return false;
                          const sd = new Date(d.startDate);
                          return sd.getMonth() === nowD.getMonth() && sd.getFullYear() === nowD.getFullYear();
                        });
                        const rows = interestExpanded
                          ? interestByDeal
                          : principalExpanded
                          ? principalByDeal
                          : thisMonthDeals;
                        const onClose = interestExpanded
                          ? () => setInterestExpanded(false)
                          : principalExpanded
                          ? () => setPrincipalExpanded(false)
                          : () => setDealParticipationExpanded(false);
                        return (
                          <div style={{ background: "#fff", borderRadius: 12, border: `1.5px solid ${borderColor}`, padding: "16px 20px", marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                              <div style={{ fontWeight: 700, fontSize: 14, color: headerColor }}>{activeTitle}</div>
                              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#8c8c8c", lineHeight: 1 }}>✕</button>
                            </div>
                            {rows.length === 0 ? (
                              <div style={{ fontSize: 13, color: "#8c8c8c" }}>No data available</div>
                            ) : (
                              <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                  <thead>
                                    <tr style={{ borderBottom: `2px solid ${borderColor}`, background: "#fafafa" }}>
                                      <th style={{ padding: "8px 12px", textAlign: "left", color: "#595959", fontWeight: 600, whiteSpace: "nowrap" }}>Deal #</th>
                                      <th style={{ padding: "8px 12px", textAlign: "left", color: "#595959", fontWeight: 600 }}>Deal Name</th>
                                      <th style={{ padding: "8px 12px", textAlign: "right", color: "#595959", fontWeight: 600, whiteSpace: "nowrap" }}>Amount</th>
                                      {interestExpanded && <th style={{ padding: "8px 12px", textAlign: "center", color: "#595959", fontWeight: 600 }}>Status</th>}
                                      {dealParticipationExpanded && <th style={{ padding: "8px 12px", textAlign: "left", color: "#595959", fontWeight: 600 }}>Date</th>}
                                      {dealParticipationExpanded && <th style={{ padding: "8px 12px", textAlign: "left", color: "#595959", fontWeight: 600 }}>ROI</th>}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {rows.map((d, i) => (
                                      <tr key={i} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                                        <td style={{ padding: "8px 12px", color: "#8c8c8c", whiteSpace: "nowrap" }}>#{d.dealId}</td>
                                        <td style={{ padding: "8px 12px", color: headerColor, fontWeight: 500 }}>{d.dealName || d.name || ("Deal #" + d.dealId)}</td>
                                        <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: headerColor, whiteSpace: "nowrap" }}>₹{fmt(d.amount)}</td>
                                        {interestExpanded && (
                                          <td style={{ padding: "8px 12px", textAlign: "center" }}>
                                            <span style={{ background: d.status === "projected" ? "#fff7e6" : "#f6ffed", color: d.status === "projected" ? "#d46b08" : "#389e0d", border: `1px solid ${d.status === "projected" ? "#ffd591" : "#b7eb8f"}`, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
                                              {d.status === "projected" ? "Projected" : "Paid"}
                                            </span>
                                          </td>
                                        )}
                                        {dealParticipationExpanded && <td style={{ padding: "8px 12px", fontSize: 12, color: "#595959" }}>{fmtDate(d.startDate)}</td>}
                                        {dealParticipationExpanded && <td style={{ padding: "8px 12px", fontSize: 12, color: "#1d39c4", fontWeight: 600 }}>{d.rateOfInterest < 5 ? `${(d.rateOfInterest * 12).toFixed(1)}%` : `${d.rateOfInterest}%`} p.a.</td>}
                                      </tr>
                                    ))}
                                  </tbody>
                                  {rows.length > 1 && (
                                    <tfoot>
                                      <tr style={{ borderTop: `2px solid ${borderColor}`, background: "#fafafa" }}>
                                        <td colSpan={2} style={{ padding: "8px 12px", fontWeight: 700, color: headerColor }}>Total</td>
                                        <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: headerColor, whiteSpace: "nowrap" }}>
                                          ₹{fmt(rows.reduce((s, d) => s + (d.amount || 0), 0))}
                                        </td>
                                        {interestExpanded && <td />}
                                        {dealParticipationExpanded && <td />}
                                        {dealParticipationExpanded && <td />}
                                      </tr>
                                    </tfoot>
                                  )}
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      </>
                      </SectionCard>
                    );
                  })() : (
                    <SectionCard
                      title="Earnings Summary"
                      collapsible
                      defaultOpen={true}
                      summary={earningsData ? `₹${fmt(earningsData.fyInterestEarned || 0)} interest · ₹${fmt(earningsData.fyTotalReceived || 0)} total` : "Loading…"}
                    >
                      <EarningsPeriodSummary earningsData={earningsData} loading={earningsLoading} onEarningsTileClick={() => { setDealHistoryFilter("ACTIVE"); setDealSectionOpen(true); }} />
                    </SectionCard>
                  )}

                  <UpcomingPayoutsSection upcomingData={upcomingData} loading={upcomingLoading} />
                </>
              )}

              {/* ── 5. INVESTMENT ANALYTICS — PRO only ── */}
              {!isPro && (
                <LockCard title="Investment Analytics — ROI Charts, Deal Distribution &amp; Earnings Trends" requiredTier="PRO" />
              )}
              {isPro && <div id="monthly-earnings-detail"><DealAnalyticsCharts data={data} earningsData={earningsData} collapsible defaultOpen={false} /></div>}

              {/* ── 5. ACTIVE DEALS ── */}
              {(data.activeDealsWithProgress || []).length > 0 && (() => {
                const allActive = data.activeDealsWithProgress || [];
                const shownDeals = showAllDeals ? allActive : allActive.slice(0, DEAL_LIMIT);
                const dealRemaining = allActive.length - DEAL_LIMIT;
                return (
                  <SectionCard
                    title={`Active Deals (${data.activeDeals ?? allActive.length})`}
                    badge={<span style={{ background: "#f6ffed", color: "#52c41a", border: "1px solid #b7eb8f", borderRadius: 6, padding: "2px 10px", fontSize: 12 }}>Live</span>}
                    collapsible defaultOpen={true} summary={`${data.activeDeals ?? allActive.length} deals running`}
                  >
                    <div className="row">
                      {shownDeals.map((deal, idx) => (
                        <div key={idx} className="col-12 col-md-6 mb-3">
                          <div style={{ background: "#fafafa", borderRadius: 10, padding: 16, border: "1px solid #f0f0f0" }}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span style={{ fontWeight: 700, color: "#262626" }}>Deal #{deal.dealId}</span>
                              <span style={{ color: "#1890ff", fontWeight: 600 }}>₹{fmt(deal.amount)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                              <span style={{ fontSize: 12, color: "#8c8c8c" }}>
                                {(() => {
                                  const roi = deal.rateOfInterest;
                                  const freq = (deal.payoutFrequency || '').toUpperCase();
                                  if (roi >= 5) return `${roi.toFixed(1)}% p.a.`;
                                  const annual = (roi * 12).toFixed(1);
                                  if (freq === 'QUARTERLY')               return `${annual}% p.a. (${(roi*3).toFixed(2)}%/qtr)`;
                                  if (freq === 'HALFYEARLY' || freq === 'HALF_YEARLY') return `${annual}% p.a. (${(roi*6).toFixed(2)}%/half-yr)`;
                                  if (freq === 'YEARLY')                  return `${annual}% p.a. (${(roi*12).toFixed(2)}%/yr)`;
                                  return `${annual}% p.a. (${roi}%/mo)`;
                                })()}
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
                                {deal.daysToMaturity > 0 ? `${deal.daysToMaturity}d to maturity` : deal.endDate ? `Matures ${fmtDate(deal.endDate)}` : "Active"}
                              </span>
                            </div>
                            {/* Next payout: PRO only */}
                            {isPro && deal.nextPayoutDate && (
                              <div style={{ marginTop: 6, fontSize: 12, color: "#722ed1" }}>
                                Next payout: {fmtDate(deal.nextPayoutDate)} — ₹{fmt(deal.nextPayoutAmount)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {allActive.length > DEAL_LIMIT && (
                      <div style={{ textAlign: 'center', marginTop: 4 }}>
                        <button onClick={() => setShowAllDeals(v => !v)}
                          style={{ background: 'none', border: '1px solid #d9d9d9', borderRadius: 6, padding: '4px 18px', fontSize: 13, color: '#595959', cursor: 'pointer' }}>
                          {showAllDeals ? 'Show less ▲' : `Show more (${dealRemaining} remaining) ▼`}
                        </button>
                      </div>
                    )}
                    {!isSmart && allActive.length > DEAL_LIMIT && (
                      <div style={{ marginTop: 10, background: "#f9f0ff", borderRadius: 8, padding: "10px 16px", textAlign: "center", border: "1px dashed #d3adf7" }}>
                        <span style={{ fontSize: 13, color: "#722ed1" }}>
                          🔒 Upgrade to <strong>OXY Smart</strong> to see all {allActive.length} active deals
                        </span>
                      </div>
                    )}
                  </SectionCard>
                );
              })()}

              {/* ── 6. REINVESTMENT PROFILE ── */}
              {!isSmart && <LockCard title="Reinvestment Profile" requiredTier="SMART" />}
              {isSmart && data.reinvestmentDetails && (() => {
                const rd = data.reinvestmentDetails;
                const firstName = (data.lenderName || "").split(" ")[0];
                const reinvestedCount = rd.reinvestedCount ?? rd.totalReturns ?? 0;
                const totalReturns = rd.totalReturns ?? reinvestedCount;
                const ratio = Math.round(rd.reinvestRatioPct || 0);
                const delay = rd.avgReinvestmentDelayDays || 0;
                const tenure = rd.preferredTenure || "short-term";
                const prob = rd.reinvestmentProbabilityPct || 0;
                const avgSize = fmt(rd.avgInvestmentAmount || data.avgInvestmentAmount);
                const summaryText = `${firstName} reinvests ${ratio}% of the time — ${reinvestedCount} out of ${totalReturns} returns were put back to work, typically within ${delay} day${delay === 1 ? "" : "s"}. ${rd.sameDayReinvestFlag ? "Same-day reinvestment detected. " : ""}Preferred deal tenure is ${tenure} with an average deal size of ₹${avgSize}.${isPro ? ` Probability of reinvesting next return: ${prob}%.` : ""}`;
                return (
                  <SectionCard title="Reinvestment Profile" badge={<StarRating rating={data.reinvestmentStarRating || rd.starRating} />} collapsible defaultOpen={false} summary={rd.classification || `${ratio}% reinvested`}>
                    <div style={{ background: "linear-gradient(135deg, #f9f0ff, #efdbff)", borderRadius: 10, padding: "14px 18px", marginBottom: 16, fontSize: 14, color: "#391085", lineHeight: 1.7 }}>
                      {summaryText}
                    </div>

                    {/* How we rate you */}
                    <div style={{ background: "#fffbe6", border: "1px solid #ffe58f", borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#874d00", marginBottom: 8 }}>How your star rating is calculated</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {[
                          { stars: "⭐", label: "1 star", desc: "New lender or no reinvestment yet" },
                          { stars: "⭐⭐", label: "2 stars", desc: "At least 1 reinvestment after a maturity" },
                          { stars: "⭐⭐⭐", label: "3 stars", desc: "40% of returned principal reinvested" },
                          { stars: "⭐⭐⭐⭐", label: "4 stars", desc: "80% of returned principal reinvested" },
                          { stars: "⭐⭐⭐⭐⭐", label: "5 stars", desc: "100% of returned principal reinvested" },
                        ].map((item) => {
                          const myCount = parseInt((data.reinvestmentStarRating || "1").split(" ")[0]) || 1;
                          const itemCount = item.stars.split("⭐").length - 1;
                          const isYours = myCount === itemCount;
                          return (
                            <div key={item.label} style={{ background: isYours ? "#fff7e6" : "#fafafa", border: isYours ? "2px solid #faad14" : "1px solid #f0f0f0", borderRadius: 8, padding: "6px 12px", minWidth: 150, flex: "1 1 150px" }}>
                              <div style={{ fontSize: 13 }}>{item.stars}</div>
                              <div style={{ fontWeight: isYours ? 700 : 500, fontSize: 12, color: isYours ? "#d46b08" : "#595959" }}>{item.label} {isYours ? "← you" : ""}</div>
                              <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 2 }}>{item.desc}</div>
                            </div>
                          );
                        })}
                      </div>
                      {data.nextStarTip && (
                        <div style={{ marginTop: 10, fontSize: 13, color: "#d46b08", fontWeight: 600 }}>
                          Next: {data.nextStarTip}
                        </div>
                      )}
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
                      {/* Probability: PRO gets number, SMART gets lock tile */}
                      {isPro ? (
                        <div className="col-12 col-md-4 mb-3">
                          <div style={{ textAlign: "center", padding: 16, background: "#fafafa", borderRadius: 10 }}>
                            <div style={{ fontSize: 13, color: "#8c8c8c", marginBottom: 6 }}>Reinvest Probability</div>
                            <div style={{ fontWeight: 700, fontSize: 22, color: "#52c41a" }}>{prob}%</div>
                            <div style={{ fontSize: 12, color: "#8c8c8c" }}>Average {delay} days to reinvest</div>
                          </div>
                        </div>
                      ) : (
                        <div className="col-12 col-md-4 mb-3">
                          <div style={{ textAlign: "center", padding: 16, background: "#fafafa", borderRadius: 10, border: "1px dashed #d9d9d9" }}>
                            <div style={{ fontSize: 13, color: "#8c8c8c", marginBottom: 6 }}>Reinvest Probability</div>
                            <div style={{ fontSize: 20 }}>🔒</div>
                            <div style={{ fontSize: 11, color: "#8c8c8c" }}>OXY Pro</div>
                          </div>
                        </div>
                      )}
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

                    {/* Membership badge explanation */}
                    {data.membershipBadge && (
                      <div style={{ background: "#f0f5ff", border: "1px solid #adc6ff", borderRadius: 10, padding: "12px 16px", marginTop: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#1a237e", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                          Your Badge: <MembershipBadge badge={data.membershipBadge} />
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {[
                            { badge: "MEMBER",   label: "Member",   desc: "Total invested < ₹50,000" },
                            { badge: "LOYAL",    label: "💜 Loyal",  desc: "< 18 months & < ₹1.5L invested" },
                            { badge: "SILVER",   label: "🥈 Silver", desc: "18+ months & ₹50K+ invested" },
                            { badge: "GOLD",     label: "🥇 Gold",   desc: "₹1.5L+ total invested" },
                            { badge: "PLATINUM", label: "🏆 Platinum", desc: "₹5L+ total invested" },
                          ].map((item) => {
                            const isYours = data.membershipBadge?.toUpperCase() === item.badge;
                            return (
                              <div key={item.badge} style={{ background: isYours ? "#e6f7ff" : "#fafafa", border: isYours ? "2px solid #1677ff" : "1px solid #f0f0f0", borderRadius: 8, padding: "6px 12px", minWidth: 140, flex: "1 1 140px" }}>
                                <div style={{ fontWeight: isYours ? 700 : 500, fontSize: 12, color: isYours ? "#0050b3" : "#595959" }}>{item.label} {isYours ? "← you" : ""}</div>
                                <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 2 }}>{item.desc}</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </SectionCard>
                );
              })()}

              {/* ── 7. SMART MATURITY PLANNER — PRO only ── */}
              <div id="section-maturity" />
              {/* SMART gets a teaser with count, PRO gets the full table */}
              {!isPro && (() => {
                const maturingCount = (data.upcomingMaturities || []).filter(m => (m.daysToMaturity || 999) <= 90).length;
                return (
                  <div className="card mb-4" style={{ borderRadius: 14, border: "1px dashed #d9d9d9", background: "#fafafa" }}>
                    <div className="card-body text-center py-4">
                      <div style={{ fontSize: 28, marginBottom: 10 }}>🔒</div>
                      <div style={{ fontWeight: 700, color: "#262626", fontSize: 15, marginBottom: 6 }}>Smart Maturity Planner</div>
                      {isSmart && maturingCount > 0 && (
                        <div style={{ fontSize: 13, color: "#fa8c16", fontWeight: 600, marginBottom: 8 }}>
                          ⚠️ {maturingCount} deal{maturingCount > 1 ? 's' : ''} maturing in next 90 days — plan your reinvestment in OXY Pro
                        </div>
                      )}
                      <div style={{ fontSize: 13, color: "#8c8c8c", marginBottom: 14 }}>
                        Available on <strong style={{ color: '#722ed1' }}>OXY Pro</strong> — ₹1,000/year
                      </div>
                      <div style={{ display: "inline-block", background: "linear-gradient(135deg, #4a148c, #6a1b9a)", color: "#fff", borderRadius: 20, padding: "6px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                        Upgrade to OXY Pro
                      </div>
                    </div>
                  </div>
                );
              })()}
              {isPro && (data.upcomingMaturities || []).length > 0 && (() => {
                const allMat = data.upcomingMaturities || [];
                const LIMIT = 10;
                const shown = showAllMaturities ? allMat : allMat.slice(0, LIMIT);
                const remaining = allMat.length - LIMIT;
                return (
                  <SectionCard title={`Smart Maturity Planner (${allMat.length})`} collapsible defaultOpen={false} isOpen={maturitySectionOpen || undefined} onToggle={setMaturitySectionOpen} summary={`${allMat.length} upcoming maturities`}>
                    <div className="table-responsive">
                      <table className="table table-sm mb-0">
                        <thead className="thead-light">
                          <tr>
                            <th>Deal</th><th>Maturity Date</th><th>Principal</th><th>Days Left</th><th>Projected Reinvest Earning</th><th>Reminder</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            // Build lookup: dealId → {roi, payoutFrequency} from active deals
                            const dealMeta = {};
                            (data.activeDealsWithProgress || data.activeDeals || []).forEach(d => {
                              dealMeta[d.dealId] = { roi: d.rateOfInterest, freq: (d.payoutFrequency || '').toUpperCase() };
                            });
                            return shown.map((m, idx) => {
                            const meta = dealMeta[m.dealId] || {};
                            const roi = meta.roi || 0;
                            const freq = meta.freq || 'MONTHLY';
                            const annualRoi = roi < 5 ? roi * 12 : roi;
                            const freqLabel = freq === 'QUARTERLY' ? 'quarterly' : freq === 'HALFYEARLY' || freq === 'HALF_YEARLY' ? 'half-yearly' : freq === 'YEARLY' ? 'yearly' : 'monthly';
                            const nudge = m.nudgeSendDate ? new Date(m.nudgeSendDate) : null;
                            const nudgeIsPast = nudge && nudge < new Date();
                            const alreadyReminded = remindedDeals.has(m.dealId);
                            const sendReminder = () => {
                              axios.post(`${MARKETPLACE_URL}/v1/notifications/maturity-reminder`, {
                                dealId: m.dealId,
                                maturityDate: fmtDate(m.maturityDate),
                                principal: fmt(m.principalAmount),
                              }, { headers: { accessToken: getToken() } })
                                .then(() => setRemindedDeals(prev => new Set([...prev, m.dealId])))
                                .catch(() => setRemindedDeals(prev => new Set([...prev, m.dealId])));
                            };
                            return (
                              <tr key={idx} style={m.actionNeeded ? { background: "#fff7e6" } : {}}>
                                <td><strong>#{m.dealId}</strong></td>
                                <td>{fmtDate(m.maturityDate)}</td>
                                <td>₹{fmt(m.principalAmount)}</td>
                                <td><span style={{ color: m.daysToMaturity <= 30 ? "#ff4d4f" : m.daysToMaturity <= 60 ? "#faad14" : "#52c41a", fontWeight: 600 }}>{m.daysToMaturity} days</span></td>
                                <td>
                                  <span style={{ color: "#722ed1", fontWeight: 600 }}>₹{fmt(m.projectedEarningIfReinvested)}</span>
                                  {annualRoi > 0 && <div style={{ fontSize: 11, color: "#8c8c8c", marginTop: 2 }}>at {annualRoi.toFixed(1)}% p.a. · {freqLabel}</div>}
                                </td>
                                <td>
                                  {alreadyReminded ? (
                                    <span style={{ fontSize: 12, color: "#52c41a", fontWeight: 600 }}>✓ Reminder sent</span>
                                  ) : nudgeIsPast ? (
                                    <button onClick={sendReminder} style={{ fontSize: 11, background: "#fff7e6", color: "#d46b08", border: "1px solid #ffa940", borderRadius: 4, padding: "3px 10px", cursor: "pointer", fontWeight: 600 }}>
                                      Remind Me
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: 12, color: "#8c8c8c" }}>{fmtDate(m.nudgeSendDate)}</span>
                                  )}
                                </td>
                              </tr>
                            );
                          });
                          })()}
                        </tbody>
                      </table>
                    </div>
                    {allMat.length > LIMIT && (
                      <div style={{ textAlign: 'center', marginTop: 10 }}>
                        <button
                          onClick={() => setShowAllMaturities(v => !v)}
                          style={{ background: 'none', border: '1px solid #d9d9d9', borderRadius: 6, padding: '4px 18px', fontSize: 13, color: '#595959', cursor: 'pointer' }}
                        >
                          {showAllMaturities ? `Show less ▲` : `Show more (${remaining} remaining) ▼`}
                        </button>
                      </div>
                    )}
                  </SectionCard>
                );
              })()}

              {/* ── 8. EARNINGS INTELLIGENCE — PRO only ── */}
              {!isPro && <LockCard title="FY Forecast & FD Benchmark — Annual Projection &amp; Bank FD Comparison" requiredTier="PRO" />}
              {isPro && <SectionCard title="FY Forecast & FD Benchmark" collapsible defaultOpen={false} summary="FY forecast & FD comparison">
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
              </SectionCard>}

              {/* ── 9. PAYOUT RELIABILITY ── SMART: score+tiles, PRO: full detail+table ── */}
              {!isSmart && <LockCard title="Payout Reliability" requiredTier="SMART" />}
              {isSmart && (data.safetyNarrativeDetails || data.safetyNarrative) && (
                <SectionCard title="Payout Reliability" badge={<span style={{ background: "#f6ffed", color: "#52c41a", border: "1px solid #b7eb8f", borderRadius: 6, padding: "2px 10px", fontSize: 12 }}>RBI Registered NBFC-P2P</span>} collapsible defaultOpen={false} summary="Payment track record">
                  {(() => {
                    const early   = data.creditsPaidEarly    ?? 0;
                    const same    = data.creditsPaidSameDay  ?? 0;
                    const next    = data.creditsPaidNextDay  ?? 0;
                    const late    = data.creditsPaidLate     ?? 0;
                    const noTs    = data.creditsNoTimestamp  ?? 0;
                    const total   = data.creditsDeliveredTotal ?? data.successfulPayments ?? 0;
                    const pipAppr = data.creditsPipelineApproved  ?? 0;
                    const pipInit = data.creditsPipelineInitiated ?? 0;
                    const upcoming= data.creditsUpcoming     ?? 0;
                    const recent      = data.recentCredits    ?? [];
                    const nextDayList = data.nextDayPayments  ?? [];
                    const timed   = early + same + next + late;
                    const onTimePct = timed > 0 ? Math.round(((timed - late) / timed) * 100) : null;
                    const timingColor = t => t === 'EARLY' ? '#722ed1' : t === 'ON_TIME' ? '#52c41a' : '#fa8c16';
                    const timingLabel = (ev) => {
                      if (ev.timing === 'EARLY') return `⚡ ${Math.abs(ev.diffDays)}d early`;
                      if (ev.timing === 'ON_TIME') return ev.diffDays === 0 ? '✅ Same day' : `✅ +${ev.diffDays}d`;
                      return `⏰ +${ev.diffDays}d late`;
                    };
                    return (
                      <div>
                        {/* Hero on-time rate */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 20, flexWrap: 'wrap' }}>
                          {onTimePct !== null && (
                            <div style={{ textAlign: 'center' }}>
                              <div style={{ fontSize: 48, fontWeight: 800, color: onTimePct === 100 ? '#52c41a' : onTimePct >= 95 ? '#13c2c2' : '#fa8c16', lineHeight: 1 }}>{onTimePct}%</div>
                              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>On-Time Payments</div>
                              <div style={{ fontSize: 11, color: '#bfbfbf' }}>{timed - late} of {timed} tracked payments</div>
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 200 }}>
                            <p style={{ fontSize: 13, color: "#595959", margin: 0 }}>{data.safetyNarrativeDetails?.message || data.safetyNarrative}</p>
                            {late === 0 && timed > 0 && (
                              <p style={{ fontSize: 12, color: '#52c41a', marginTop: 6, marginBottom: 0, fontWeight: 600 }}>
                                ✅ Zero late payments — every interest & principal credit delivered on or before schedule.
                              </p>
                            )}
                          </div>
                        </div>
                        {/* Breakdown row — click any block to see records */}
                        {(() => {
                          const bucketColors = {
                            RECENT:   { bg: '#e6f7ff', border: '#91d5ff', text: '#096dd9', label: '🕐 Recent' },
                            EARLY:    { bg: '#f9f0ff', border: '#d3adf7', text: '#722ed1', label: '⚡ Paid Early' },
                            SAME_DAY: { bg: '#f6ffed', border: '#b7eb8f', text: '#52c41a', label: '✅ Same Day' },
                            NEXT_DAY: { bg: '#e6fffb', border: '#87e8de', text: '#13c2c2', label: '+1–2 Days' },
                            LATE:     { bg: '#fff7e6', border: '#ffd591', text: '#fa8c16', label: '⏰ Late' },
                            NO_TS:    { bg: '#fafafa', border: '#d9d9d9', text: '#595959', label: '✅ Closure Settlements' },
                          };
                          const makeBucket = (bucket, count, extraLabel) => {
                            if (!count) return null;
                            const c = bucketColors[bucket] || bucketColors.NO_TS;
                            const isOpen = timingBucket === bucket;
                            const isLoading = timingDetail[bucket]?.loading;
                            return (
                              <div
                                key={bucket}
                                onClick={() => handleTimingClick(bucket)}
                                style={{ background: isOpen ? c.border : c.bg, border: `1px solid ${isOpen ? c.text : c.border}`, borderRadius: 8, padding: '10px 18px', textAlign: 'center', minWidth: 90, cursor: 'pointer', transition: 'all 0.2s', boxShadow: isOpen ? `0 2px 8px ${c.border}` : 'none', userSelect: 'none' }}
                                title={`Click to see ${count} ${c.label} payment records`}
                              >
                                <div style={{ fontSize: 22, fontWeight: 700, color: c.text }}>{isLoading ? '…' : count}</div>
                                <div style={{ fontSize: 11, color: c.text }}>{c.label}</div>
                                {extraLabel && <div style={{ fontSize: 10, color: c.text, opacity: 0.7 }}>{extraLabel}</div>}
                                <div style={{ fontSize: 10, color: c.text, marginTop: 2, opacity: 0.6 }}>{isOpen ? '▲ hide' : '▼ view'}</div>
                              </div>
                            );
                          };
                          return (
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                              {isPro && recent.length > 0 && makeBucket('RECENT', recent.length)}
                              {makeBucket('EARLY', early)}
                              {makeBucket('SAME_DAY', same)}
                              {makeBucket('NEXT_DAY', next)}
                              {makeBucket('LATE', late)}
                              {noTs > 0 && makeBucket('NO_TS', noTs)}
                              {(pipAppr + pipInit) > 0 && (
                                <div style={{ background: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: 8, padding: '10px 18px', textAlign: 'center', minWidth: 90 }}>
                                  <div style={{ fontSize: 22, fontWeight: 700, color: '#1890ff' }}>{pipAppr + pipInit}</div>
                                  <div style={{ fontSize: 11, color: '#1890ff' }}>📋 In Pipeline</div>
                                </div>
                              )}
                              {upcoming > 0 && (
                                <div style={{ background: '#fff0f6', border: '1px solid #ffadd2', borderRadius: 8, padding: '10px 18px', textAlign: 'center', minWidth: 90 }}>
                                  <div style={{ fontSize: 22, fontWeight: 700, color: '#eb2f96' }}>{upcoming}</div>
                                  <div style={{ fontSize: 11, color: '#eb2f96' }}>⏳ Upcoming</div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                        {/* Inline expandable payment timing panel */}
                        {timingBucket && (() => {
                          const c = { EARLY: { bg: '#f9f0ff', border: '#d3adf7', text: '#722ed1', label: 'Paid Early' }, SAME_DAY: { bg: '#f6ffed', border: '#b7eb8f', text: '#52c41a', label: 'Same Day' }, NEXT_DAY: { bg: '#e6fffb', border: '#87e8de', text: '#13c2c2', label: '+1–2 Day' }, LATE: { bg: '#fff7e6', border: '#ffd591', text: '#fa8c16', label: 'Late' }, NO_TS: { bg: '#fafafa', border: '#d9d9d9', text: '#595959', label: 'Closure Settlements' } }[timingBucket] || {};
                          const d = timingDetail[timingBucket] || {};
                          const records = d.records || [];
                          const typeLabel = t => t === 'LENDERINTEREST' ? 'Interest' : t === 'PRINCIPALINTEREST' ? 'Closure Int.' : t === 'WITHDRAWALINTEREST' ? 'Withdrawal Int.' : t;
                          const diffLabel = (days) => {
                            if (days === null || days === undefined) return '—';
                            if (days < 0) return `${Math.abs(days)}d early`;
                            if (days === 0) return 'same day';
                            return `+${days}d`;
                          };
                          const diffStyle = (days) => {
                            if (days === null || days === undefined) return { color: '#8c8c8c' };
                            if (days < 0) return { color: '#722ed1', fontWeight: 600 };
                            if (days === 0) return { color: '#52c41a', fontWeight: 600 };
                            if (days <= 2) return { color: '#13c2c2', fontWeight: 600 };
                            return { color: '#fa8c16', fontWeight: 600 };
                          };
                          return (
                            <div style={{ marginBottom: 16, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, overflow: 'hidden' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: `1px solid ${c.border}` }}>
                                <div style={{ fontWeight: 700, color: c.text, fontSize: 13 }}>
                                  {c.label} Payments — {d.total !== undefined ? `${records.length} of ${d.total}` : ''}
                                </div>
                                <button onClick={() => setTimingBucket(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, fontSize: 16, lineHeight: 1, padding: '0 4px' }} title="Close">✕</button>
                              </div>
                              {d.loading && records.length === 0 && (
                                <div style={{ padding: '24px', textAlign: 'center', color: c.text, fontSize: 13 }}>Loading…</div>
                              )}
                              {d.error && (
                                <div style={{ padding: '16px', textAlign: 'center', color: '#ff4d4f', fontSize: 13 }}>{d.error}</div>
                              )}
                              {records.length > 0 && (
                                <div style={{ maxHeight: 360, overflowY: 'auto', overflowX: 'auto' }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                    <thead style={{ position: 'sticky', top: 0, background: c.bg, zIndex: 1 }}>
                                      <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                                        <th style={{ padding: '7px 10px', textAlign: 'left', color: c.text, fontWeight: 600, whiteSpace: 'nowrap' }}>#</th>
                                        <th style={{ padding: '7px 10px', textAlign: 'left', color: c.text, fontWeight: 600, whiteSpace: 'nowrap' }}>Deal</th>
                                        <th style={{ padding: '7px 10px', textAlign: 'left', color: c.text, fontWeight: 600, whiteSpace: 'nowrap' }}>Type</th>
                                        <th style={{ padding: '7px 10px', textAlign: 'left', color: c.text, fontWeight: 600, whiteSpace: 'nowrap' }}>{timingBucket === 'NO_TS' ? 'Paid Date' : 'Scheduled'}</th>
                                        {timingBucket !== 'NO_TS' && <th style={{ padding: '7px 10px', textAlign: 'left', color: c.text, fontWeight: 600, whiteSpace: 'nowrap' }}>Credited</th>}
                                        {timingBucket !== 'NO_TS' && <th style={{ padding: '7px 10px', textAlign: 'center', color: c.text, fontWeight: 600, whiteSpace: 'nowrap' }}>Days</th>}
                                        <th style={{ padding: '7px 10px', textAlign: 'right', color: c.text, fontWeight: 600, whiteSpace: 'nowrap' }}>Amount</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {records.map((r, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.5)' }}>
                                          <td style={{ padding: '6px 10px', color: '#8c8c8c', fontSize: 11, whiteSpace: 'nowrap' }}>{r.dealId}</td>
                                          <td style={{ padding: '6px 10px', color: '#262626', fontWeight: 500, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.dealName}>{r.dealName || '—'}</td>
                                          <td style={{ padding: '6px 10px', color: '#8c8c8c', fontSize: 11 }}>{typeLabel(r.amountType)}</td>
                                          <td style={{ padding: '6px 10px', color: '#595959', whiteSpace: 'nowrap' }}>{r.scheduledDate || '—'}</td>
                                          {timingBucket !== 'NO_TS' && <td style={{ padding: '6px 10px', color: '#262626', whiteSpace: 'nowrap' }}>{r.actualDate || '—'}</td>}
                                          {timingBucket !== 'NO_TS' && <td style={{ padding: '6px 10px', textAlign: 'center', ...diffStyle(r.diffDays) }}>{diffLabel(r.diffDays)}</td>}
                                          <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, color: '#52c41a', whiteSpace: 'nowrap' }}>₹{(r.amount || 0).toLocaleString('en-IN')}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                              {(d.hasMore || d.loading) && (
                                <div style={{ padding: '10px 16px', borderTop: `1px solid ${c.border}`, textAlign: 'center' }}>
                                  <button
                                    onClick={() => fetchTimingDetail(timingBucket, (d.page || 0) + 1)}
                                    disabled={d.loading}
                                    style={{ background: c.text, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 20px', cursor: d.loading ? 'default' : 'pointer', fontSize: 12, fontWeight: 600, opacity: d.loading ? 0.6 : 1 }}
                                  >
                                    {d.loading ? 'Loading…' : `Load more (${d.total - records.length} remaining)`}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Recent payments timeline — shown by default or when RECENT bucket tapped */}
                        {isPro && recent.length > 0 && (timingBucket === null || timingBucket === 'RECENT') && (
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#8c8c8c', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Recent Payments</div>
                            <div style={{ overflowX: 'auto' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                  <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
                                    <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: '#595959' }}>Scheduled</th>
                                    <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: '#595959' }}>Credited</th>
                                    <th style={{ padding: '6px 10px', textAlign: 'center', fontWeight: 600, color: '#595959' }}>Status</th>
                                    <th style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, color: '#595959' }}>Amount</th>
                                    <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: '#595959' }}>Deal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {recent.map((ev, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                      <td style={{ padding: '7px 10px', color: '#595959' }}>{ev.scheduledDate}</td>
                                      <td style={{ padding: '7px 10px', color: '#262626' }}>{ev.actualDate || '—'}</td>
                                      <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                                        <span style={{ background: ev.timing === 'EARLY' ? '#f9f0ff' : ev.timing === 'ON_TIME' ? '#f6ffed' : '#fff7e6', color: timingColor(ev.timing), border: `1px solid ${ev.timing === 'EARLY' ? '#d3adf7' : ev.timing === 'ON_TIME' ? '#b7eb8f' : '#ffd591'}`, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                                          {timingLabel(ev)}
                                        </span>
                                      </td>
                                      <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 600, color: '#52c41a' }}>₹{ev.amount?.toLocaleString('en-IN') ?? 0}</td>
                                      <td style={{ padding: '7px 10px', color: '#8c8c8c', fontSize: 11, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.type === 'LENDERINTEREST' ? 'Interest' : ev.type === 'PRINCIPALRETURN' ? 'Principal' : ev.type} {ev.dealRemark ? `· ${ev.dealRemark}` : ''}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </SectionCard>
              )}

              {/* ── 10. DEAL HISTORY — SMART+ only ── */}
              {!isSmart && <LockCard title="Deal History" requiredTier="SMART" />}
              {isSmart && (() => {
                const allDeals = data.deals || data.allDeals || [];
                const activeDeals = allDeals.filter(d => (d.status || "").toUpperCase() === "ACTIVE");
                const closedDeals = allDeals.filter(d => (d.status || "").toUpperCase() !== "ACTIVE");
                const filteredDeals = dealHistoryFilter === "ACTIVE" ? activeDeals : dealHistoryFilter === "CLOSED" ? closedDeals : allDeals;
                const visibleDeals = filteredDeals.slice(0, dealsShown);
                const filterColors = { ALL: { a: "#1890ff", b: "#e6f7ff" }, ACTIVE: { a: "#52c41a", b: "#f6ffed" }, CLOSED: { a: "#595959", b: "#f5f5f5" } };
                return (
                  <div id="section-deal-history">
                  <SectionCard
                    title="Deal History"
                    collapsible
                    isOpen={dealSectionOpen}
                    onToggle={() => setDealSectionOpen(o => !o)}
                    summary={`${allDeals.length} deals · ${activeDeals.length} active`}
                    badge={
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {["ALL", "ACTIVE", "CLOSED"].map(f => {
                          const c = filterColors[f];
                          const active = dealHistoryFilter === f;
                          return (
                            <button key={f} onClick={(e) => { e.stopPropagation(); setDealHistoryFilter(f); setDealsShown(10); }}
                              style={{ fontSize: 11, padding: "2px 10px", borderRadius: 6, border: `1px solid ${active ? c.a : "#d9d9d9"}`, background: active ? c.b : "#fff", color: active ? c.a : "#8c8c8c", cursor: "pointer", fontWeight: active ? 700 : 400 }}>
                              {f === "ALL" ? `All (${allDeals.length})` : f === "ACTIVE" ? `Active (${activeDeals.length})` : `Closed (${closedDeals.length})`}
                            </button>
                          );
                        })}
                      </div>
                    }
                  >
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="thead-light">
                          <tr>
                            <th>Deal ID</th><th>Amount</th><th>ROI (p.a.)</th><th>Status</th><th>Start Date</th><th>Maturity Date</th><th>Interest Earned</th>
                            {isPro && <th>Est. Next Payout</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDeals.length === 0 && (
                            <tr><td colSpan={isPro ? 8 : 7} className="text-center text-muted py-4">No deals found</td></tr>
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
                                {isPro && <td style={{ fontSize: 13 }}>{deal.nextPayoutDate ? fmtDate(deal.nextPayoutDate) : <span style={{ color: "#bfbfbf" }}>—</span>}</td>}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {filteredDeals.length > dealsShown && (
                      <div className="text-center mt-3">
                        <button onClick={() => setDealsShown((n) => n + 20)}
                          style={{ background: "none", border: "1px solid #d9d9d9", borderRadius: 6, padding: "6px 20px", cursor: "pointer", fontSize: 13, color: "#595959" }}>
                          Show more ({filteredDeals.length - dealsShown} remaining)
                        </button>
                      </div>
                    )}
                    {dealsShown > 10 && filteredDeals.length <= dealsShown && (
                      <div className="text-center mt-3">
                        <button onClick={() => setDealsShown(10)}
                          style={{ background: "none", border: "1px solid #d9d9d9", borderRadius: 6, padding: "6px 20px", cursor: "pointer", fontSize: 13, color: "#8c8c8c" }}>
                          Collapse
                        </button>
                      </div>
                    )}
                  </SectionCard>
                  </div>
                );
              })()}

              {/* ── 11. REFERRAL EARNINGS — FREE: locked, SMART: totals, PRO: full breakdown with FY filter ── */}
              {!isSmart && (
                <LockCard title="Referral Earnings" requiredTier="SMART" />
              )}
              {isSmart && (
                <SectionCard title="Referral Earnings" collapsible defaultOpen={false} summary={data.referredLendersCount > 0 ? `₹${fmt(data.referralEarnings)} earned · ${data.referredLendersCount} referred` : "No referrals yet"}>
                  {/* No referrals yet — show prompt */}
                  {(data.referredLendersCount === 0 && data.referralEarnings === 0) && (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "#8c8c8c" }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>🤝</div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#262626", marginBottom: 4 }}>No referrals yet</div>
                      <div style={{ fontSize: 12 }}>Refer a friend to OxyLoans and earn a bonus when they invest.</div>
                    </div>
                  )}
                  {/* Stat tiles — consistent grid */}
                  {(data.referredLendersCount > 0 || data.referralEarnings > 0) && (
                  <div className="row g-3 mb-3">
                    {[
                      { label: "Lenders Referred",  value: String(data.referredLendersCount || 0), color: "#722ed1", bg: "#f9f0ff", target: null },
                      { label: "Amount Deployed",   value: `₹${fmt(data.totalReferredAmount)}`,   color: "#1890ff", bg: "#e6f7ff", target: null },
                      { label: "Total Bonus Earned",value: `₹${fmt(data.referralEarnings)}`,       color: "#52c41a", bg: "#f6ffed", target: isPro ? "referral-monthly-detail" : null },
                      ...(isPro ? [
                        { label: "Paid Out",  value: `₹${fmt(data.referralPaidAmount)}`,   color: "#52c41a", bg: "#f6ffed", target: "referral-monthly-detail" },
                        ...(data.referralUnpaidAmount > 0
                          ? [{ label: "Pending", value: `₹${fmt(data.referralUnpaidAmount)}`, color: "#fa8c16", bg: "#fff7e6", target: "referral-monthly-detail" }]
                          : []),
                      ] : []),
                    ].map((item) => (
                      <div key={item.label} className="col-6 col-md-4 col-lg-3">
                        <div
                          onClick={item.target ? () => scrollTo(item.target) : undefined}
                          style={{ background: item.bg, borderRadius: 10, padding: "12px 14px", textAlign: "center", height: "100%", cursor: item.target ? "pointer" : "default", transition: "box-shadow 0.15s" }}
                          onMouseEnter={item.target ? e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.12)" : undefined}
                          onMouseLeave={item.target ? e => e.currentTarget.style.boxShadow = "none" : undefined}
                          title={item.target ? "Click to see month-by-month breakdown" : undefined}
                        >
                          <div style={{ fontSize: 11, color: "#8c8c8c", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{item.label}</div>
                          <div style={{ fontWeight: 700, fontSize: 18, color: item.color }}>{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  )} {/* end stats grid wrapper */}

                  {isPro ? (
                    <div>
                      {/* Month-by-month breakdown from earningsData */}
                      {earningsData && (() => {
                        const allRefRows = (earningsData.referralMonthly || []).filter(r => r.earnedAmount > 0);
                        if (allRefRows.length === 0) return null;
                        const refRows = refFilter === "PAID"    ? allRefRows.filter(r => (r.paidAmount   || 0) > 0)
                                      : refFilter === "PENDING" ? allRefRows.filter(r => (r.unpaidAmount || 0) > 0)
                                      : allRefRows;
                        const visibleRefRows = refRows.slice(0, refMonthsShown);
                        const tabStyle = (val) => ({
                          padding: "4px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none",
                          background: refFilter === val ? "#722ed1" : "#f0e6ff",
                          color: refFilter === val ? "#fff" : "#531dab",
                        });
                        return (
                          <div id="referral-monthly-detail" style={{ background: "#f9f0ff", borderRadius: 10, padding: "12px 14px", marginBottom: 10, border: "1px solid #d3adf7" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                              <div style={{ fontWeight: 600, fontSize: 12, color: "#531dab", textTransform: "uppercase", letterSpacing: 0.5 }}>
                                Month-by-Month Referral Bonus (All Time)
                              </div>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button style={tabStyle("ALL")}     onClick={() => { setRefFilter("ALL");     setRefMonthsShown(10); }}>All</button>
                                <button style={tabStyle("PAID")}    onClick={() => { setRefFilter("PAID");    setRefMonthsShown(10); }}>Paid</button>
                                <button style={tabStyle("PENDING")} onClick={() => { setRefFilter("PENDING"); setRefMonthsShown(10); }}>Pending</button>
                              </div>
                            </div>
                            <div style={{ overflowX: "auto" }}>
                              <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                                <thead>
                                  <tr style={{ background: "#f0e6ff" }}>
                                    <th style={{ padding: "6px 10px", textAlign: "left",  color: "#531dab" }}>Month</th>
                                    <th style={{ padding: "6px 10px", textAlign: "right", color: "#531dab" }}>Earned</th>
                                    <th style={{ padding: "6px 10px", textAlign: "right", color: "#531dab" }}>Paid</th>
                                    <th style={{ padding: "6px 10px", textAlign: "right", color: "#531dab" }}>Pending</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {visibleRefRows.map((r, i) => (
                                    <tr key={i} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                                      <td style={{ padding: "6px 10px", color: "#262626", fontWeight: 600 }}>{r.monthLabel}</td>
                                      <td style={{ padding: "6px 10px", textAlign: "right", color: "#52c41a", fontWeight: 600 }}>₹{fmt(r.earnedAmount || 0)}</td>
                                      <td style={{ padding: "6px 10px", textAlign: "right", color: "#1890ff" }}>₹{fmt(r.paidAmount   || 0)}</td>
                                      <td style={{ padding: "6px 10px", textAlign: "right", color: r.unpaidAmount > 0 ? "#fa8c16" : "#8c8c8c" }}>₹{fmt(r.unpaidAmount || 0)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {refRows.length > refMonthsShown && (
                              <div className="text-center mt-2">
                                <button onClick={() => setRefMonthsShown(n => n + 10)}
                                  style={{ background: "none", border: "1px solid #d3adf7", borderRadius: 6, padding: "4px 16px", cursor: "pointer", fontSize: 12, color: "#531dab" }}>
                                  Show more ({refRows.length - refMonthsShown} remaining)
                                </button>
                              </div>
                            )}
                            {refMonthsShown > 10 && refRows.length <= refMonthsShown && (
                              <div className="text-center mt-2">
                                <button onClick={() => setRefMonthsShown(10)}
                                  style={{ background: "none", border: "1px solid #d3adf7", borderRadius: 6, padding: "4px 16px", cursor: "pointer", fontSize: 12, color: "#8c8c8c" }}>
                                  Show less
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      <div style={{ fontSize: 12, color: "#8c8c8c" }}>Paid = credited to wallet · Pending = accumulated, awaiting 28th of month</div>
                    </div>
                  ) : (
                    <div style={{ background: "#f9f0ff", borderRadius: 8, padding: "10px 16px", textAlign: "center", border: "1px dashed #d3adf7" }}>
                      <span style={{ fontSize: 13, color: "#722ed1" }}>
                        Paid vs Pending breakdown &amp; monthly table available in <strong>OXY Pro</strong>
                      </span>
                    </div>
                  )}
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

      {/* AI Chat Widget — SMART+ only */}
      {data && isSmart && <AIChatWidget lenderId={resolvedLenderId} lenderName={data.lenderName?.split(" ")[0]} />}
    </div>
  );
};

export default LenderPortfolioDashboard;