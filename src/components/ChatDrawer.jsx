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

  const allQuickReplies = [
    "Show my interest earnings dashboard",
    "What interest have I earned so far?",
    "Show my lender interest summary",
    "Display my interest income details",
    "What is my interest earned from lending?",
    "Show interest earned between 01-01-2024 and 31-03-2024",
    "What was my interest income in February 2024?",
    "Give my interest report from Jan to March",
    "Show earnings between 2023-04-01 and 2024-03-31",
    "How much interest did I earn last quarter?",
    "Download my financial year interest report",
    "Generate interest earning PDF",
    "I want my yearly interest report",
    "Show FY 2024-2025 interest report",
    "Give me my annual interest statement",
    "Show my yearly earnings",
    "Financial year wise interest summary",
    "Annual interest breakdown",
    "Show interest earned per financial year",
    "What is my yearly lending income?",
    "How much principal was returned?",
    "Show principal credited back",
    "Total principal from closed deals",
    "Show my returned investment amount",
    "Principal repayment history",
    "Show upcoming interest",
    "Next month interest earnings",
    "Future interest amount",
    "Pending interest for my deals",
    "Upcoming interest details",
    "Show my interest dashboard",
    "Show principal returned history",
    "Download my yearly interest report",
    "Show my participated deals",
    "List all the deals I have invested in",
    "What are my active loan deals?",
    "Show details of my investments",
    "How many deals am I currently participating in?",
    "What is the total amount I invested in those deals?",
    "What is the repayment status of my deals?",
    "Which deal has highest ROI?",
    "Check my wallet balance",
    "Show my wallet amount",
    "How much money is available in my wallet?",
    "What is my current wallet summary?",
    "Verify my bank account",
    "Check if my account is valid",
    "Is my bank account verified?",
    "Validate my bank details",
    "How can I apply for a personal loan?",
    "What is the minimum loan amount?",
    "What documents are required for loan approval?",
    "Show RBI rules for P2P lending",
    "Is Oxyloans regulated by RBI?",
    "What compliance guidelines does Oxyloans follow?",
    "What is Oxyloans?",
    "How does Oxyloans work?",
    "What are the eligibility criteria?",
    "Explain how the lending process works",
    "How does borrower get funds?",
    "What happens after loan approval?",
    "What is my wallet balance now?"
  ];

  const [quickReplies, setQuickReplies] = useState(allQuickReplies.slice(0, 4));

  useEffect(() => {
    if (isTyping) return;
    
    const interval = setInterval(() => {
      setQuickReplies(prev => {
        const currentIndex = allQuickReplies.indexOf(prev[0]);
        const nextIndex = (currentIndex + 4) % allQuickReplies.length;
        return [
          allQuickReplies[nextIndex],
          allQuickReplies[(nextIndex + 1) % allQuickReplies.length],
          allQuickReplies[(nextIndex + 2) % allQuickReplies.length],
          allQuickReplies[(nextIndex + 3) % allQuickReplies.length]
        ];
      });
    }, Math.random() * 2000 + 3000);

    return () => clearInterval(interval);
  }, [isTyping]);

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Format structured messages
  const formatMessage = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    const lines = text.split('\n');
    const parts = [];
    let i = 0;
    
    while (i < lines.length) {
      const line = lines[i].trim();
      
      // Check for numbered list item
      const numberedMatch = line.match(/^(\d+)\s*\.\s*(.*)/);
      
      if (numberedMatch) {
        const [, num, firstPart] = numberedMatch;
        let content = firstPart;
        
        // Check if next line is continuation
        if (i + 1 < lines.length && lines[i + 1].trim() && !/^\d+\./.test(lines[i + 1].trim())) {
          content += ' ' + lines[i + 1].trim();
          i++;
        }
        
        parts.push({ type: 'numbered', num, content });
      } else if (line) {
        parts.push({ type: 'text', content: line });
      }
      i++;
    }
    
    const hasNumbered = parts.some(p => p.type === 'numbered');
    
    if (hasNumbered) {
      const intro = [];
      const items = [];
      const outro = [];
      let section = 'intro';
      
      parts.forEach(part => {
        if (part.type === 'numbered') {
          section = 'items';
          items.push(part);
        } else if (section === 'intro') {
          intro.push(part.content);
        } else {
          outro.push(part.content);
          section = 'outro';
        }
      });
      
      return (
        <div className="default-message">
          {intro.length > 0 && (
            <div style={{marginBottom: '16px', lineHeight: '1.8', color: '#1e293b', fontWeight: '500'}}>
              {renderRichText(intro.join(' '))}
            </div>
          )}
          <div style={{background: '#f8fafc', borderRadius: '8px', padding: '12px'}}>
            {items.map((item, idx) => (
              <div key={idx} style={{
                marginBottom: idx < items.length - 1 ? '10px' : '0',
                paddingBottom: idx < items.length - 1 ? '10px' : '0',
                borderBottom: idx < items.length - 1 ? '1px solid #e2e8f0' : 'none',
                display: 'flex',
                gap: '12px'
              }}>
                <span style={{
                  color: '#0ea5a1',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  minWidth: '24px',
                  flexShrink: 0
                }}>{item.num}.</span>
                <div style={{flex: 1, color: '#334155', fontSize: '14px', lineHeight: '1.6'}}>
                  {renderRichText(item.content)}
                </div>
              </div>
            ))}
          </div>
          {outro.length > 0 && (
            <div style={{
              marginTop: '16px',
              lineHeight: '1.6',
              color: '#64748b',
              fontStyle: 'italic',
              fontSize: '14px'
            }}>
              {renderRichText(outro.join(' '))}
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="default-message" style={{lineHeight: '1.7', color: '#334155', whiteSpace: 'pre-wrap'}}>
        {renderRichText(text)}
      </div>
    );
  };
  
  // Helper to render rich text with bold, links, and currency symbols
  const renderRichText = (text) => {
    if (!text) return null;
    
    // Split by bold markers (**text**), URLs, and preserve other content
    const parts = [];
    let remaining = text;
    let key = 0;
    
    while (remaining) {
      // Check for bold text
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      // Check for URLs
      const urlMatch = remaining.match(/(https?:\/\/[^\s]+)/);
      
      let nextMatch = null;
      let matchType = null;
      
      if (boldMatch && (!urlMatch || boldMatch.index < urlMatch.index)) {
        nextMatch = boldMatch;
        matchType = 'bold';
      } else if (urlMatch) {
        nextMatch = urlMatch;
        matchType = 'url';
      }
      
      if (nextMatch) {
        // Add text before match
        if (nextMatch.index > 0) {
          parts.push(<span key={key++}>{remaining.substring(0, nextMatch.index)}</span>);
        }
        
        // Add matched content
        if (matchType === 'bold') {
          parts.push(
            <strong key={key++} style={{color: '#0f172a', fontWeight: '600'}}>
              {nextMatch[1]}
            </strong>
          );
        } else if (matchType === 'url') {
          parts.push(
            <a key={key++} href={nextMatch[1]} target="_blank" rel="noopener noreferrer" 
               style={{color: '#0ea5a1', textDecoration: 'underline', fontWeight: '500'}}>
              {nextMatch[1]}
            </a>
          );
        }
        
        remaining = remaining.substring(nextMatch.index + nextMatch[0].length);
      } else {
        parts.push(<span key={key++}>{remaining}</span>);
        break;
      }
    }
    
    return parts.length > 0 ? parts : text;
  };

  // Append helper
  const appendMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  // Send Function with normal flow
  const handleSend = useCallback(async (text) => {
    if (!text || text.trim() === "") return;

    const trimmed = text.trim();
    const userMsg = { id: Date.now(), from: "user", text: trimmed, timestamp: new Date() };
    appendMessage(userMsg);

    setInput("");
    setIsTyping(true);

    try {
      const res = await chatbotapicall(trimmed);
      console.log("Full API Response:", res);
      console.log("Response data:", res.data);
      
      let responseText = "";
      
      // Check different possible response structures
      if (typeof res.data === 'string') {
        responseText = res.data;
      } else if (res.data?.answer) {
        responseText = res.data.answer;
      } else if (res.data?.response) {
        responseText = res.data.response;
      } else if (res.data?.data) {
        responseText = res.data.data;
      } else if (res.data?.message) {
        responseText = res.data.message;
      }
      
      if (!responseText || responseText.trim() === "") {
        responseText = "💡 I'm here to help with investments. Please try again.";
      }
      
      console.log("Extracted responseText:", responseText);
      
      const botMsg = {
        id: Date.now() + 1,
        from: "bot",
        text: responseText,
        timestamp: new Date()
      };
      appendMessage(botMsg);

    } catch (error) {
      console.error("Chat API error:", error);
      
      let errorMessage = "⚠️ Sorry, something went wrong. Please try again.";
      
      if (error.response?.status === 401) {
        errorMessage = "🔒 Authentication failed. Please login again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      const botMsg = {
        id: Date.now() + 1,
        from: "bot",
        text: errorMessage,
        timestamp: new Date()
      };
      appendMessage(botMsg);
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
          {messages.filter(m => m.text !== "" || m.from === "user").map((m, index) => (
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
          {quickReplies.map((question, index) => (
            <button 
              key={index} 
              className="suggest-btn" 
              onClick={() => handleSend(question)}
              disabled={isTyping}
            >
              {question}
            </button>
          ))}
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
