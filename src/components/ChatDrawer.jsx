// ChatDrawer.jsx (Investment Theme + Improved UI)
import React, { useEffect, useRef, useState, useCallback } from "react";
import "./FloatingAssistant.css";
import { chatbotapicall } from "./HttpRequest/afterlogin";

export default function ChatDrawer({ open, initialMessage, onClose }) {
  const [visible, setVisible] = useState(open);
  const [messages, setMessages] = useState([
    { id: 1, from: "bot", text: "👋 Hello! I'm your Investment & Lending Assistant. How can I help you today?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Format structured messages
  const formatMessage = (text) => {
    // Check for numbered list pattern
    if (/\d+\. \*\*/.test(text)) {
      const items = text.split(/\d+\. /).filter(item => item.trim());
      const intro = items[0]?.split(/\d+\. \*\*/)[0]?.trim();
      
      return (
        <div className="structured-response">
          {intro && <div className="response-intro">{intro}</div>}
          <div className="items-list">
            {items.slice(intro ? 1 : 0).map((item, index) => {
              const lines = item.split(/\n|\- /).filter(line => line.trim());
              const title = lines[0]?.replace(/^\*\*|\*\*$/g, '').trim();
              const details = lines.slice(1);
              
              return (
                <div key={index} className="item-card">
                  <div className="item-title">{title}</div>
                  <div className="item-details">
                    {details.map((detail, i) => (
                      <div key={i} className="detail-row">{detail.trim()}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    // Check for bullet points
    if (text.includes('- ') && text.split('- ').length > 3) {
      const parts = text.split('- ');
      const intro = parts[0]?.trim();
      const bullets = parts.slice(1);
      
      return (
        <div className="bullet-response">
          {intro && <div className="response-intro">{intro}</div>}
          <div className="bullet-list">
            {bullets.map((bullet, index) => (
              <div key={index} className="bullet-item">
                <span className="bullet-icon">•</span>
                <span className="bullet-text">{bullet.trim()}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return text;
  };

  // Append helper
  const appendMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  // Send Function
  const handleSend = useCallback(async (text) => {
    if (!text || text.trim() === "") return;

    const trimmed = text.trim();
    const userMsg = { id: Date.now(), from: "user", text: trimmed, timestamp: new Date() };
    appendMessage(userMsg);

    setInput("");
    setIsTyping(true);

    try {
      console.log("Sending chat request:", trimmed);
      
      const res = await chatbotapicall(trimmed);
      console.log("API Response:", res);

      const data = res.data;
      
      const botReply = {
        id: Date.now() + 1,
        from: "bot",
        text: data.answer || data.response || data.data || "💡 I'm here to help with investments and loans. Please try again.",
        timestamp: new Date()
      };
      appendMessage(botReply);

    } catch (error) {
      console.error("Chat API error:", error);
      
      let errorMessage = "⚠️ Sorry, something went wrong. Please try again.";
      
      if (error.response?.status === 401) {
        errorMessage = "🔒 Authentication failed. Please login again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      appendMessage({ 
        id: Date.now() + 2, 
        from: "bot", 
        text: errorMessage, 
        timestamp: new Date() 
      });
    } finally {
      setIsTyping(false);
    }
  }, [appendMessage]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // When drawer opens & quick reply provided
  useEffect(() => {
    setVisible(open);
    if (open && initialMessage) {
      handleSend(initialMessage);
    }
  }, [open, initialMessage, handleSend]);

  if (!visible) return null;

  return (
    <div className="chat-drawer-backdrop" role="dialog" aria-modal="true">
      <div className="chat-drawer finance-theme">
        
        <div className="chat-header finance-header">
          <div className="header-content">
            <div className="assistant-info">
              <div className="assistant-avatar-small">
                💼
              </div>
              <div>
                <div className="chat-title">Investment Assistant</div>
                <div className="chat-subtitle">Online • Ready to help</div>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => { setVisible(false); onClose(); }} title="Close chat">
              ✕
            </button>
          </div>
        </div>

        <div className="chat-body" ref={scrollRef}>
          {messages.map((m, index) => (
            <div key={m.id} className={`message-container ${m.from}`} style={{animationDelay: `${index * 0.1}s`}}>
              <div className={`chat-msg ${m.from === "bot" ? "finance-bot" : "finance-user"}`}>
                {m.from === "bot" && typeof m.text === "string" ? formatMessage(m.text) : m.text}
              </div>
              <div className="message-time">
                {m.timestamp?.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message-container bot typing-indicator">
              <div className="chat-msg finance-bot">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <em>Analyzing your financial query...</em>
              </div>
            </div>
          )}
        </div>

        <div className="chat-suggest finance-suggest">
          <button className="suggest-btn" onClick={() => handleSend("How many deals can I join?")}>
            📊 How many deals can I join?
          </button>
          <button className="suggest-btn" onClick={() => handleSend("How much money can I keep in my wallet?")}>
            💰 How much money can I keep in my wallet?
          </button>
        </div>

        <div className="chat-footer finance-footer">
          <div className="input-container">
            <input
              className="chat-input"
              placeholder="💬 Ask about investments,deals..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(input); } }}
              disabled={isTyping}
            />
            <button 
              className={`chat-send-btn finance-send ${input.trim() ? 'active' : ''}`} 
              onClick={() => handleSend(input)}
              disabled={isTyping || !input.trim()}
              title="Send message"
            >
              {isTyping ? '⏳' : '🚀'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
