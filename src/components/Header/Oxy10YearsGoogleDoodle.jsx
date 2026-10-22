import React, { useState } from "react";
import "./Oxy10YearsGoogleDoodle.css";

const Oxy10YearsGoogleDoodle = ({ onClick }) => {
  const [animKey, setAnimKey] = useState(0);

  const handleReplay = (e) => {
    // Increment animKey on click/tap to trigger a fresh celebration replay
    setAnimKey((prev) => prev + 1);
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className="oxy-doodle-wrapper"
      onClick={handleReplay}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleReplay(e);
        }
      }}
      title="Celebrate 10 Years of OxyLoans! Tap or click to view anniversary note"
      aria-label="Celebrate 10 Years of OxyLoans! Tap or click to view anniversary note"
    >
      {/* ===================================================================
          1. DESKTOP & TABLET GOOGLE DOODLE (> 767px)
          Panoramic layout: Boy + 3D Golden 10 + Gift + "Years of OxyLoans"
          =================================================================== */}
      <div className="oxy-doodle-desktop" key={`desktop-${animKey}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 250 44"
          className="oxy-doodle-svg"
          aria-hidden="true"
        >
          <defs>
            {/* 3D Gold Gradient for '10' */}
            <linearGradient id="doodleGold" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="25%" stopColor="#fde047" />
              <stop offset="65%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            {/* 3D Gold Shadow */}
            <linearGradient id="doodleGoldShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            {/* Specular Highlight */}
            <linearGradient id="doodleHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Character Shirt Gradient */}
            <linearGradient id="doodleShirt" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>

            {/* Drop Shadow Filter */}
            <filter id="doodleSoftShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.1" />
            </filter>

            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#f59e0b" floodOpacity="0.25" />
            </filter>
          </defs>

          <g filter="url(#doodleSoftShadow)">
            {/* Confetti (Background) */}
            <g className="doodle-confetti-group">
              <path d="M 6 12 C 4 9 7 6 10 7 C 12 8 10 11 8 13" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
              <polygon points="18,5 23,8 19,11" fill="#ec4899" />
              <circle cx="44" cy="7" r="2.2" fill="#10b981" />
              <polygon points="56,4 59,7 56,10 53,7" fill="#f59e0b" />
              <circle cx="98" cy="6" r="2" fill="#3b82f6" />
              <polygon points="152,3 155,6 152,9 149,6" fill="#a855f7" />
              <rect x="188" y="4" width="4" height="4" rx="0.8" fill="#ef4444" transform="rotate(15 190 6)" />
              <path d="M 238 9 C 242 11 240 15 244 17" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
              <polygon points="234,26 236,30 240,30 237,33 238,37 234,34 230,37 231,33 228,30 232,30" fill="#f59e0b" transform="scale(0.65) translate(120 -5)" />
              <circle cx="95" cy="40" r="2.2" fill="#10b981" />
              <circle cx="168" cy="41" r="2" fill="#facc15" />
            </g>

            {/* Cartoon Boy with Party Hat */}
            <g className="doodle-character-group" transform="translate(4, 2)">
              <circle cx="8" cy="35" r="3.2" fill="#fed7aa" stroke="#ea580c" strokeWidth="0.6" />
              <path d="M 10 32 L 26 32 C 28 32 30 35 30 40 L 6 40 C 6 35 8 32 10 32 Z" fill="url(#doodleShirt)" />
              <polygon points="14,32 18,36 22,32 20,32 18,34 16,32" fill="#ffffff" />
              <line x1="18" y1="36" x2="18" y2="40" stroke="#1e3a8a" strokeWidth="1.2" strokeLinecap="round" />

              <g className="doodle-waving-arm">
                <path d="M 24 33 Q 32 28 35 21" fill="none" stroke="#2563eb" strokeWidth="4.5" strokeLinecap="round" />
                <circle cx="35" cy="20" r="3.4" fill="#fed7aa" stroke="#ea580c" strokeWidth="0.6" />
                <circle cx="36" cy="18" r="1.2" fill="#fed7aa" />
                <circle cx="38" cy="20" r="1.1" fill="#fed7aa" />
              </g>

              <rect x="9" y="16" width="18" height="18" rx="7" fill="#fed7aa" stroke="#ea580c" strokeWidth="0.7" />
              <circle cx="9" cy="25" r="2.5" fill="#fed7aa" stroke="#ea580c" strokeWidth="0.6" />
              <circle cx="27" cy="25" r="2.5" fill="#fed7aa" stroke="#ea580c" strokeWidth="0.6" />
              <path d="M 8 20 C 8 13 15 12 18 12 C 23 12 28 14 28 20 C 27 17 24 16 21 16 C 18 16 16 18 14 17 C 12 16 9 18 8 20 Z" fill="#451a03" />

              <ellipse cx="14" cy="23" rx="1.6" ry="2" fill="#1e293b" />
              <circle cx="14.6" cy="22.2" r="0.6" fill="#ffffff" />
              <ellipse cx="22" cy="23" rx="1.6" ry="2" fill="#1e293b" />
              <circle cx="22.6" cy="22.2" r="0.6" fill="#ffffff" />

              <circle cx="12" cy="26" r="1.8" fill="#fb7185" opacity="0.45" />
              <circle cx="24" cy="26" r="1.8" fill="#fb7185" opacity="0.45" />

              <path d="M 15.5 26.5 Q 18 30 20.5 26.5" fill="#b91c1c" stroke="#b91c1c" strokeWidth="0.8" strokeLinecap="round" />
              <ellipse cx="18" cy="28" rx="1.6" ry="0.9" fill="#f87171" />

              <g className="doodle-party-hat">
                <polygon points="12,14 24,14 18,2" fill="#ef4444" />
                <polygon points="14,11 22,11 20,8 16,8" fill="#facc15" />
                <polygon points="16,6 20,6 18,3 18,3" fill="#10b981" />
                <polygon points="17.5,3.5 18.5,3.5 18,2" fill="#3b82f6" />
                <circle cx="18" cy="1.8" r="2.2" fill="#f59e0b" />
                <circle cx="18" cy="1.8" r="1.2" fill="#fef08a" />
              </g>
            </g>

            {/* 3D Golden "10" */}
            <g className="doodle-gold-ten" filter="url(#goldGlow)" transform="translate(46, 6)">
              <path d="M 5 6 L 12 1 L 18 1 L 18 32 L 8 32 L 8 28 L 12 28 L 12 7 L 6 10 Z" fill="url(#doodleGoldShadow)" transform="translate(0.8, 1)" />
              <path d="M 5 6 L 12 1 L 18 1 L 18 32 L 8 32 L 8 28 L 12 28 L 12 7 L 6 10 Z" fill="url(#doodleGold)" stroke="#d97706" strokeWidth="0.6" strokeLinejoin="round" />
              <path d="M 12 2 L 17 2 L 17 18 L 15 18 L 15 5 L 12 6 Z" fill="url(#doodleHighlight)" opacity="0.65" />

              <path d="M 33 1 C 24 1 20 8 20 17 C 20 26 24 33 33 33 C 42 33 46 26 46 17 C 46 8 42 1 33 1 Z M 33 8 C 37 8 38 12 38 17 C 38 22 37 26 33 26 C 29 26 28 22 28 17 C 28 12 29 8 33 8 Z" fill="url(#doodleGoldShadow)" transform="translate(0.8, 1)" />
              <path d="M 33 1 C 24 1 20 8 20 17 C 20 26 24 33 33 33 C 42 33 46 26 46 17 C 46 8 42 1 33 1 Z M 33 8 C 37 8 38 12 38 17 C 38 22 37 26 33 26 C 29 26 28 22 28 17 C 28 12 29 8 33 8 Z" fill="url(#doodleGold)" stroke="#d97706" strokeWidth="0.6" />
              <path d="M 27 6 C 30 3 36 3 39 6 C 41 8 42 11 41 12 C 40 10 38 8 35 7 C 32 6 29 7 28 9 C 27 8 27 7 27 6 Z" fill="url(#doodleHighlight)" opacity="0.75" />
            </g>

            {/* Gift Box */}
            <g className="doodle-gift-box" transform="translate(94, 25)">
              <rect x="0" y="4" width="13" height="11" rx="1.8" fill="#ec4899" stroke="#db2777" strokeWidth="0.6" />
              <rect x="-0.8" y="2.5" width="14.6" height="3" rx="1" fill="#f43f5e" stroke="#e11d48" strokeWidth="0.5" />
              <rect x="5" y="2.5" width="3" height="12.5" fill="#f59e0b" />
              <ellipse cx="4.5" cy="1.6" rx="2.5" ry="1.6" fill="#fde047" stroke="#d97706" strokeWidth="0.5" />
              <ellipse cx="8.5" cy="1.6" rx="2.5" ry="1.6" fill="#fde047" stroke="#d97706" strokeWidth="0.5" />
              <circle cx="6.5" cy="2" r="1.2" fill="#f59e0b" />
            </g>

            {/* Typography */}
            <g className="doodle-text-group" transform="translate(112, 0)">
              <text x="0" y="20" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif" fontSize="12.5" fontWeight="800" fill="#1d4ed8" letterSpacing="-0.01em">
                Years of
              </text>
              <text x="0" y="37" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif" fontSize="17" fontWeight="900" fill="#059669" letterSpacing="-0.02em">
                OxyLoans
              </text>
              <path d="M 0 41 Q 38 43 78 41 Q 50 44 0 41 Z" fill="#f59e0b" opacity="0.85" />
            </g>

            {/* Sparkles */}
            <g className="doodle-sparkle-star sparkle-anim-1" transform="translate(24, 2)">
              <polygon points="0,-3.5 1,-1 3.5,0 1,1 0,3.5 -1,1 -3.5,0 -1,-1" fill="#f59e0b" />
            </g>
            <g className="doodle-sparkle-star sparkle-anim-2" transform="translate(78, 4)">
              <polygon points="0,-4 1.2,-1.2 4,0 1.2,1.2 0,4 -1.2,1.2 -4,0 -1.2,-1.2" fill="#fbbf24" />
            </g>
            <g className="doodle-sparkle-star sparkle-anim-3" transform="translate(196, 18)">
              <polygon points="0,-3.5 1,-1 3.5,0 1,1 0,3.5 -1,1 -3.5,0 -1,-1" fill="#10b981" />
            </g>
          </g>
        </svg>
      </div>

      {/* ===================================================================
          2. STANDARD MOBILE GOOGLE DOODLE (381px - 767px)
          Compact vector illustration: Boy + 3D Golden 10 + "Years of OxyLoans"
          =================================================================== */}
      <div className="oxy-doodle-mobile-standard" key={`mob-std-${animKey}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 148 34"
          className="oxy-doodle-svg-mob-standard"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="mobGold" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="25%" stopColor="#fde047" />
              <stop offset="65%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="mobGoldShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="mobHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="mobShirt" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <filter id="mobSoftShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#0f172a" floodOpacity="0.12" />
            </filter>
            <filter id="mobGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#f59e0b" floodOpacity="0.25" />
            </filter>
          </defs>

          <g filter="url(#mobSoftShadow)">
            {/* Confetti & Streamers */}
            <g className="doodle-confetti-group-mob">
              <path d="M 4 8 C 2 6 5 4 7 5" fill="none" stroke="#06b6d4" strokeWidth="1.6" strokeLinecap="round" />
              <polygon points="14,3 17,5 15,7" fill="#ec4899" />
              <circle cx="30" cy="4" r="1.6" fill="#10b981" />
              <polygon points="67,4 69,6 67,8 65,6" fill="#f59e0b" />
              <circle cx="80" cy="4" r="1.5" fill="#3b82f6" />
              <polygon points="122,2 124,4 122,6 120,4" fill="#a855f7" />
              <circle cx="140" cy="6" r="1.6" fill="#ef4444" />
              <circle cx="75" cy="30" r="1.5" fill="#10b981" />
            </g>

            {/* Cartoon Boy with Party Hat */}
            <g className="doodle-character-group-mob" transform="translate(1, 1)">
              {/* Left Hand */}
              <circle cx="4.5" cy="25" r="2.5" fill="#fed7aa" stroke="#ea580c" strokeWidth="0.5" />

              {/* Shirt */}
              <path d="M 6 22 L 20 22 C 22 22 23 25 23 29 L 3 29 C 3 25 4 22 6 22 Z" fill="url(#mobShirt)" />
              <polygon points="10,22 13,25 16,22 15,22 13,24 11,22" fill="#ffffff" />
              <line x1="13" y1="25" x2="13" y2="29" stroke="#1e3a8a" strokeWidth="1" strokeLinecap="round" />

              {/* Waving Arm */}
              <g className="doodle-waving-arm-mob">
                <path d="M 18.5 23 Q 25 19 27 13" fill="none" stroke="#2563eb" strokeWidth="3.6" strokeLinecap="round" />
                <circle cx="27" cy="12" r="2.7" fill="#fed7aa" stroke="#ea580c" strokeWidth="0.5" />
                <circle cx="27.8" cy="10.5" r="1" fill="#fed7aa" />
                <circle cx="29.2" cy="12" r="0.9" fill="#fed7aa" />
              </g>

              {/* Head Base */}
              <rect x="5.5" y="9.5" width="15" height="15" rx="5.5" fill="#fed7aa" stroke="#ea580c" strokeWidth="0.6" />
              {/* Ears */}
              <circle cx="5.5" cy="17" r="2" fill="#fed7aa" stroke="#ea580c" strokeWidth="0.5" />
              <circle cx="20.5" cy="17" r="2" fill="#fed7aa" stroke="#ea580c" strokeWidth="0.5" />

              {/* Hair */}
              <path d="M 5 13 C 5 7 10.5 6 13 6 C 17 6 21 8 21 13 C 20 10.5 17.5 9.5 15 9.5 C 13 9.5 11.5 11 10 10 C 8.5 9 6 11 5 13 Z" fill="#451a03" />

              {/* Eyes */}
              <ellipse cx="9.5" cy="15.5" rx="1.3" ry="1.6" fill="#1e293b" />
              <circle cx="10" cy="14.9" r="0.5" fill="#ffffff" />
              <ellipse cx="16.5" cy="15.5" rx="1.3" ry="1.6" fill="#1e293b" />
              <circle cx="17" cy="14.9" r="0.5" fill="#ffffff" />

              {/* Rosy Cheeks */}
              <circle cx="8" cy="18" r="1.5" fill="#fb7185" opacity="0.45" />
              <circle cx="18" cy="18" r="1.5" fill="#fb7185" opacity="0.45" />

              {/* Smile */}
              <path d="M 11 18.5 Q 13 21.2 15 18.5" fill="#b91c1c" stroke="#b91c1c" strokeWidth="0.7" strokeLinecap="round" />
              <ellipse cx="13" cy="19.8" rx="1.3" ry="0.7" fill="#f87171" />

              {/* Party Hat */}
              <g className="doodle-party-hat-mob">
                <polygon points="8,8 18,8 13,-2" fill="#ef4444" />
                <polygon points="9.5,5.5 16.5,5.5 15,3 11,3" fill="#facc15" />
                <polygon points="11,1.5 15,1.5 13,-1 13,-1" fill="#10b981" />
                <circle cx="13" cy="-2.2" r="1.8" fill="#f59e0b" />
                <circle cx="13" cy="-2.2" r="0.9" fill="#fef08a" />
              </g>
            </g>

            {/* 3D Golden "10" */}
            <g className="doodle-gold-ten-mob" filter="url(#mobGoldGlow)" transform="translate(32, 4)">
              {/* Digit 1 */}
              <path d="M 4 5 L 9.5 1 L 14 1 L 14 25 L 6 25 L 6 22 L 9.5 22 L 9.5 5.5 L 5 8 Z" fill="url(#mobGoldShadow)" transform="translate(0.6, 0.8)" />
              <path d="M 4 5 L 9.5 1 L 14 1 L 14 25 L 6 25 L 6 22 L 9.5 22 L 9.5 5.5 L 5 8 Z" fill="url(#mobGold)" stroke="#d97706" strokeWidth="0.5" strokeLinejoin="round" />
              <path d="M 9.5 1.8 L 13 1.8 L 13 14 L 11.5 14 L 11.5 4 L 9.5 4.8 Z" fill="url(#mobHighlight)" opacity="0.65" />

              {/* Digit 0 */}
              <path d="M 25 1 C 18 1 15 6 15 13.5 C 15 21 18 26 25 26 C 32 26 35 21 35 13.5 C 35 6 32 1 25 1 Z M 25 6.5 C 28 6.5 29 9.5 29 13.5 C 29 17.5 28 20.5 25 20.5 C 22 20.5 21 17.5 21 13.5 C 21 9.5 22 6.5 25 6.5 Z" fill="url(#mobGoldShadow)" transform="translate(0.6, 0.8)" />
              <path d="M 25 1 C 18 1 15 6 15 13.5 C 15 21 18 26 25 26 C 32 26 35 21 35 13.5 C 35 6 32 1 25 1 Z M 25 6.5 C 28 6.5 29 9.5 29 13.5 C 29 17.5 28 20.5 25 20.5 C 22 20.5 21 17.5 21 13.5 C 21 9.5 22 6.5 25 6.5 Z" fill="url(#mobGold)" stroke="#d97706" strokeWidth="0.5" />
              <path d="M 20 4.8 C 22.5 2.5 27 2.5 29.5 4.8 C 31 6.5 31.8 8.8 31 9.5 C 30 8 28.5 6.5 26.5 5.8 C 24 5 21.5 5.8 20.8 7.2 C 20 6.5 20 5.6 20 4.8 Z" fill="url(#mobHighlight)" opacity="0.75" />
            </g>

            {/* Tiny Gift Box */}
            <g className="doodle-gift-box-mob" transform="translate(68, 17)">
              <rect x="0" y="3" width="10" height="9" rx="1.4" fill="#ec4899" stroke="#db2777" strokeWidth="0.5" />
              <rect x="-0.6" y="1.8" width="11.2" height="2.4" rx="0.8" fill="#f43f5e" stroke="#e11d48" strokeWidth="0.4" />
              <rect x="3.8" y="1.8" width="2.4" height="10.2" fill="#f59e0b" />
              <ellipse cx="3.5" cy="1.1" rx="2" ry="1.2" fill="#fde047" stroke="#d97706" strokeWidth="0.4" />
              <ellipse cx="6.5" cy="1.1" rx="2" ry="1.2" fill="#fde047" stroke="#d97706" strokeWidth="0.4" />
            </g>

            {/* Typography */}
            <g className="doodle-text-group-mob" transform="translate(82, 0)">
              <text x="0" y="15" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif" fontSize="10.5" fontWeight="800" fill="#1d4ed8" letterSpacing="-0.01em">
                Years of
              </text>
              <text x="0" y="28" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif" fontSize="13.8" fontWeight="900" fill="#059669" letterSpacing="-0.02em">
                OxyLoans
              </text>
              <path d="M 0 31 Q 30 33 60 31" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.85" fill="none" />
            </g>

            {/* Sparkles */}
            <g className="doodle-sparkle-star-mob sparkle-anim-1" transform="translate(16, 2)">
              <polygon points="0,-2.8 0.8,-0.8 2.8,0 0.8,0.8 0,2.8 -0.8,0.8 -2.8,0 -0.8,-0.8" fill="#f59e0b" />
            </g>
            <g className="doodle-sparkle-star-mob sparkle-anim-2" transform="translate(65, 3)">
              <polygon points="0,-3.2 0.9,-0.9 3.2,0 0.9,0.9 0,3.2 -0.9,0.9 -3.2,0 -0.9,-0.9" fill="#fbbf24" />
            </g>
            <g className="doodle-sparkle-star-mob sparkle-anim-3" transform="translate(141, 18)">
              <polygon points="0,-2.8 0.8,-0.8 2.8,0 0.8,0.8 0,2.8 -0.8,0.8 -2.8,0 -0.8,-0.8" fill="#10b981" />
            </g>
          </g>
        </svg>
      </div>

      {/* ===================================================================
          3. ULTRA-COMPACT MOBILE GOOGLE DOODLE (<= 380px)
          Designed specifically for narrow screens (e.g. 360px Android, iPhone SE):
          Boy + 3D Golden 10 + Sparkles + Confetti (zero overlap with center logo)
          =================================================================== */}
      <div className="oxy-doodle-mobile-compact" key={`mob-cmp-${animKey}`}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 74 34"
          className="oxy-doodle-svg-mob-compact"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="cmpGold" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fffbeb" />
              <stop offset="25%" stopColor="#fde047" />
              <stop offset="65%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="cmpGoldShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="cmpHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="cmpShirt" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <filter id="cmpSoftShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#0f172a" floodOpacity="0.12" />
            </filter>
            <filter id="cmpGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#f59e0b" floodOpacity="0.25" />
            </filter>
          </defs>

          <g filter="url(#cmpSoftShadow)">
            {/* Confetti */}
            <g className="doodle-confetti-group-mob">
              <path d="M 4 8 C 2 6 5 4 7 5" fill="none" stroke="#06b6d4" strokeWidth="1.6" strokeLinecap="round" />
              <polygon points="14,3 17,5 15,7" fill="#ec4899" />
              <circle cx="30" cy="4" r="1.6" fill="#10b981" />
              <polygon points="67,4 69,6 67,8 65,6" fill="#f59e0b" />
              <circle cx="71" cy="28" r="1.5" fill="#3b82f6" />
            </g>

            {/* Cartoon Boy with Party Hat */}
            <g className="doodle-character-group-mob" transform="translate(1, 1)">
              <circle cx="4.5" cy="25" r="2.5" fill="#fed7aa" stroke="#ea580c" strokeWidth="0.5" />
              <path d="M 6 22 L 20 22 C 22 22 23 25 23 29 L 3 29 C 3 25 4 22 6 22 Z" fill="url(#cmpShirt)" />
              <polygon points="10,22 13,25 16,22 15,22 13,24 11,22" fill="#ffffff" />
              <line x1="13" y1="25" x2="13" y2="29" stroke="#1e3a8a" strokeWidth="1" strokeLinecap="round" />

              <g className="doodle-waving-arm-mob">
                <path d="M 18.5 23 Q 25 19 27 13" fill="none" stroke="#2563eb" strokeWidth="3.6" strokeLinecap="round" />
                <circle cx="27" cy="12" r="2.7" fill="#fed7aa" stroke="#ea580c" strokeWidth="0.5" />
                <circle cx="27.8" cy="10.5" r="1" fill="#fed7aa" />
                <circle cx="29.2" cy="12" r="0.9" fill="#fed7aa" />
              </g>

              <rect x="5.5" y="9.5" width="15" height="15" rx="5.5" fill="#fed7aa" stroke="#ea580c" strokeWidth="0.6" />
              <circle cx="5.5" cy="17" r="2" fill="#fed7aa" stroke="#ea580c" strokeWidth="0.5" />
              <circle cx="20.5" cy="17" r="2" fill="#fed7aa" stroke="#ea580c" strokeWidth="0.5" />
              <path d="M 5 13 C 5 7 10.5 6 13 6 C 17 6 21 8 21 13 C 20 10.5 17.5 9.5 15 9.5 C 13 9.5 11.5 11 10 10 C 8.5 9 6 11 5 13 Z" fill="#451a03" />

              <ellipse cx="9.5" cy="15.5" rx="1.3" ry="1.6" fill="#1e293b" />
              <circle cx="10" cy="14.9" r="0.5" fill="#ffffff" />
              <ellipse cx="16.5" cy="15.5" rx="1.3" ry="1.6" fill="#1e293b" />
              <circle cx="17" cy="14.9" r="0.5" fill="#ffffff" />

              <circle cx="8" cy="18" r="1.5" fill="#fb7185" opacity="0.45" />
              <circle cx="18" cy="18" r="1.5" fill="#fb7185" opacity="0.45" />

              <path d="M 11 18.5 Q 13 21.2 15 18.5" fill="#b91c1c" stroke="#b91c1c" strokeWidth="0.7" strokeLinecap="round" />
              <ellipse cx="13" cy="19.8" rx="1.3" ry="0.7" fill="#f87171" />

              <g className="doodle-party-hat-mob">
                <polygon points="8,8 18,8 13,-2" fill="#ef4444" />
                <polygon points="9.5,5.5 16.5,5.5 15,3 11,3" fill="#facc15" />
                <polygon points="11,1.5 15,1.5 13,-1 13,-1" fill="#10b981" />
                <circle cx="13" cy="-2.2" r="1.8" fill="#f59e0b" />
                <circle cx="13" cy="-2.2" r="0.9" fill="#fef08a" />
              </g>
            </g>

            {/* 3D Golden "10" */}
            <g className="doodle-gold-ten-mob" filter="url(#cmpGoldGlow)" transform="translate(32, 4)">
              <path d="M 4 5 L 9.5 1 L 14 1 L 14 25 L 6 25 L 6 22 L 9.5 22 L 9.5 5.5 L 5 8 Z" fill="url(#cmpGoldShadow)" transform="translate(0.6, 0.8)" />
              <path d="M 4 5 L 9.5 1 L 14 1 L 14 25 L 6 25 L 6 22 L 9.5 22 L 9.5 5.5 L 5 8 Z" fill="url(#cmpGold)" stroke="#d97706" strokeWidth="0.5" strokeLinejoin="round" />
              <path d="M 9.5 1.8 L 13 1.8 L 13 14 L 11.5 14 L 11.5 4 L 9.5 4.8 Z" fill="url(#cmpHighlight)" opacity="0.65" />

              <path d="M 25 1 C 18 1 15 6 15 13.5 C 15 21 18 26 25 26 C 32 26 35 21 35 13.5 C 35 6 32 1 25 1 Z M 25 6.5 C 28 6.5 29 9.5 29 13.5 C 29 17.5 28 20.5 25 20.5 C 22 20.5 21 17.5 21 13.5 C 21 9.5 22 6.5 25 6.5 Z" fill="url(#cmpGoldShadow)" transform="translate(0.6, 0.8)" />
              <path d="M 25 1 C 18 1 15 6 15 13.5 C 15 21 18 26 25 26 C 32 26 35 21 35 13.5 C 35 6 32 1 25 1 Z M 25 6.5 C 28 6.5 29 9.5 29 13.5 C 29 17.5 28 20.5 25 20.5 C 22 20.5 21 17.5 21 13.5 C 21 9.5 22 6.5 25 6.5 Z" fill="url(#cmpGold)" stroke="#d97706" strokeWidth="0.5" />
              <path d="M 20 4.8 C 22.5 2.5 27 2.5 29.5 4.8 C 31 6.5 31.8 8.8 31 9.5 C 30 8 28.5 6.5 26.5 5.8 C 24 5 21.5 5.8 20.8 7.2 C 20 6.5 20 5.6 20 4.8 Z" fill="url(#cmpHighlight)" opacity="0.75" />
            </g>

            {/* Sparkles */}
            <g className="doodle-sparkle-star-mob sparkle-anim-1" transform="translate(16, 2)">
              <polygon points="0,-2.8 0.8,-0.8 2.8,0 0.8,0.8 0,2.8 -0.8,0.8 -2.8,0 -0.8,-0.8" fill="#f59e0b" />
            </g>
            <g className="doodle-sparkle-star-mob sparkle-anim-2" transform="translate(67, 3)">
              <polygon points="0,-3.2 0.9,-0.9 3.2,0 0.9,0.9 0,3.2 -0.9,0.9 -3.2,0 -0.9,-0.9" fill="#fbbf24" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default Oxy10YearsGoogleDoodle;
