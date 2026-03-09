import React, { useState, useEffect } from "react";
import ChatDrawer from "./ChatDrawer";
import "./FloatingAssistant.css";

export default function FloatingAssistant({ avatarSrc }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Updated "recent chat" preview messages
  const miniMessages = [
    { from: "bot", text: "Need help with investments?" },
    { from: "user", text: "Yes, I want to invest monthly." },
    { from: "bot", text: "Would you prefer high return or low risk?" }
  ];

  // Updated quick replies for investment & lending
  const quickReplies = [
    "How much interest did I earn this financial year?",
    "Show my wallet transactions?"
  ];

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
              {miniMessages.map((m, i) => (
                <div
                  key={i}
                  className={`mini-msg ${m.from === "bot" ? "mini-bot" : "mini-user"}`}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <div className="mini-quick-replies">
              {quickReplies.map((q, i) => (
                <button
                  key={i}
                  className="mini-quick-btn"
                  onClick={() => openDrawerWith(q)}
                  data-hover={q}
                >
                  {q}
                </button>
              ))}
            </div>

            <button
              className="mini-hide-btn"
              aria-label="Close preview"
              onClick={() => setShowBubble(false)}
              title="Close preview"
            >
              ✕
            </button>
          </div>
        )}

        {/* Avatar with tooltip */}
        <div className="tooltip-container">
          <button
            className={`assistant-avatar-btn ${isHovered ? 'hovered' : ''}`}
            aria-label="Open assistant"
            onClick={() => openDrawerWith(null)}
            onMouseEnter={() => {
              setIsHovered(true);
              setTimeout(() => setShowTooltip(true), 200);
            }}
            onMouseLeave={() => {
              setIsHovered(false);
              setShowTooltip(false);
            }}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
          >
            <img src={avatarSrc} alt="Assistant" className="assistant-avatar-img" />
          </button>

          {/* Enhanced tooltip with conditional rendering */}
          {showTooltip && (
            <div className="tooltip-box">
              💬 Chat with Investment Assistant
            </div>
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
