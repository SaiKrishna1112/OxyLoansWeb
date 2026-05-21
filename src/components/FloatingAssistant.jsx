import React, { useState } from "react";
import ChatDrawer from "./ChatDrawer";
import "./FloatingAssistant.css";

const ROLE_PREVIEW = {
  LENDER: {
    tooltip: "💬 Chat with Lender Assistant",
    miniMessages: [
      { from: "bot",  text: "Need help with your investments?" },
      { from: "user", text: "Show my active deals." },
      { from: "bot",  text: "You have deals currently running." },
    ],
    quickReplies: [
      "How much interest did I earn this financial year?",
      "Show my wallet balance",
    ],
  },
  BORROWER: {
    tooltip: "💬 Chat with Borrower Assistant",
    miniMessages: [
      { from: "bot",  text: "Need help with your loan?" },
      { from: "user", text: "What is my EMI schedule?" },
      { from: "bot",  text: "I can pull up your upcoming EMIs." },
    ],
    quickReplies: [
      "What is the status of my loan application?",
      "What is my EMI schedule?",
    ],
  },
  Admin: {
    tooltip: "💬 Chat with Admin Assistant",
    miniMessages: [
      { from: "bot",  text: "Admin tools ready." },
      { from: "user", text: "Show pending disbursals." },
      { from: "bot",  text: "Fetching disbursal queue…" },
    ],
    quickReplies: [
      "Show pending disbursal loans",
      "How many active lenders are there?",
    ],
  },
};

export default function FloatingAssistant({ avatarSrc }) {
  const ROLE = localStorage.getItem("primaryType") || "LENDER";
  const preview = ROLE_PREVIEW[ROLE] || ROLE_PREVIEW.LENDER;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const openDrawerWith = (initialMessage) => {
    setShowBubble(false);
    setDrawerOpen({ initialMessage });
  };

  return (
    <>
      <div className="floating-assistant" aria-live="polite">

        {showBubble && (
          <div className="assistant-mini-panel">
            <div className="mini-chat">
              {preview.miniMessages.map((m, i) => (
                <div key={i} className={`mini-msg ${m.from === "bot" ? "mini-bot" : "mini-user"}`}>
                  {m.text}
                </div>
              ))}
            </div>

            <div className="mini-quick-replies">
              {preview.quickReplies.map((q, i) => (
                <button key={i} className="mini-quick-btn" onClick={() => openDrawerWith(q)} data-hover={q}>
                  {q}
                </button>
              ))}
            </div>

            <button className="mini-hide-btn" aria-label="Close preview" onClick={() => setShowBubble(false)} title="Close preview">
              ✕
            </button>
          </div>
        )}

        <div className="tooltip-container">
          <button
            className={`assistant-avatar-btn ${isHovered ? "hovered" : ""}`}
            aria-label="Open assistant"
            onClick={() => openDrawerWith(null)}
            onMouseEnter={() => { setIsHovered(true); setTimeout(() => setShowTooltip(true), 200); }}
            onMouseLeave={() => { setIsHovered(false); setShowTooltip(false); }}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
          >
            <img src={avatarSrc} alt="Assistant" className="assistant-avatar-img" />
          </button>

          {showTooltip && (
            <div className="tooltip-box">{preview.tooltip}</div>
          )}
        </div>

      </div>

      <ChatDrawer
        open={!!drawerOpen}
        initialMessage={drawerOpen?.initialMessage ?? null}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
