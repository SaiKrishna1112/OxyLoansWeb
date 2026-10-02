import React, { useEffect, useState } from "react";
import { getScoreTier } from "./creditReportUtils";

const CreditScoreGauge = ({ score = 802, size = 260, animated = true }) => {
  const [displayScore, setDisplayScore] = useState(animated ? 300 : score);
  const tier = getScoreTier(score);

  useEffect(() => {
    if (!animated) {
      setDisplayScore(score);
      return;
    }
    const targetScore = Math.max(300, Math.min(900, score || 802));
    const duration = 1200; // ms
    const startTime = performance.now();

    const animateNumber = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutCubic curve
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(300 + (targetScore - 300) * easeOut);
      setDisplayScore(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      }
    };

    const animId = requestAnimationFrame(animateNumber);
    return () => cancelAnimationFrame(animId);
  }, [score, animated]);

  // Gauge calculations for 240 degree arc
  // Radius & dimensions
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2 + 10;
  
  // Angle range: from 150 deg to 390 deg (240 deg total arc)
  const startAngle = 150;
  const totalAngle = 240;
  const scoreRatio = Math.max(0, Math.min(1, (displayScore - 300) / 600));
  const currentAngle = startAngle + scoreRatio * totalAngle;

  // Polar to Cartesian conversion
  const polarToCartesian = (centerX, centerY, r, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x, y, r, sAngle, eAngle) => {
    const start = polarToCartesian(x, y, r, eAngle);
    const end = polarToCartesian(x, y, r, sAngle);
    const largeArcFlag = eAngle - sAngle <= 180 ? "0" : "1";
    return ["M", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y].join(" ");
  };

  const bgPath = describeArc(cx, cy, radius, startAngle, startAngle + totalAngle);
  const activePath = describeArc(cx, cy, radius, startAngle, Math.max(startAngle + 0.1, currentAngle));
  const indicatorPos = polarToCartesian(cx, cy, radius, currentAngle);

  return (
    <div className="credit-score-gauge-container d-flex flex-column align-items-center position-relative">
      <svg
        width={size}
        height={size * 0.85}
        viewBox={`0 0 ${size} ${size * 0.9}`}
        className="credit-score-gauge-svg"
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="scoreTrackGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <linearGradient id="needleGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor={tier.color} />
          </linearGradient>
        </defs>

        {/* Outer subtle shadow track */}
        <path
          d={bgPath}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Colored Segment Guide Markers */}
        <path
          d={activePath}
          fill="none"
          stroke="url(#scoreTrackGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          filter="url(#gaugeGlow)"
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />

        {/* Glow indicator dot at head of progress */}
        <circle
          cx={indicatorPos.x}
          cy={indicatorPos.y}
          r={strokeWidth * 0.65}
          fill="#ffffff"
          stroke={tier.color}
          strokeWidth="3.5"
          filter="drop-shadow(0 2px 6px rgba(0,0,0,0.25))"
          style={{ transition: "all 0.1s linear" }}
        />

        {/* Scale labels */}
        <text
          x={polarToCartesian(cx, cy, radius + 20, startAngle).x}
          y={polarToCartesian(cx, cy, radius + 20, startAngle).y + 12}
          fill="#94a3b8"
          fontSize="11"
          fontWeight="600"
          textAnchor="middle"
        >
          300
        </text>

        <text
          x={polarToCartesian(cx, cy, radius + 20, startAngle + totalAngle * 0.33).x}
          y={polarToCartesian(cx, cy, radius + 20, startAngle + totalAngle * 0.33).y - 2}
          fill="#94a3b8"
          fontSize="10"
          fontWeight="500"
          textAnchor="middle"
        >
          650
        </text>

        <text
          x={polarToCartesian(cx, cy, radius + 20, startAngle + totalAngle * 0.75).x}
          y={polarToCartesian(cx, cy, radius + 20, startAngle + totalAngle * 0.75).y - 2}
          fill="#94a3b8"
          fontSize="10"
          fontWeight="500"
          textAnchor="middle"
        >
          750
        </text>

        <text
          x={polarToCartesian(cx, cy, radius + 20, startAngle + totalAngle).x}
          y={polarToCartesian(cx, cy, radius + 20, startAngle + totalAngle).y + 12}
          fill="#94a3b8"
          fontSize="11"
          fontWeight="600"
          textAnchor="middle"
        >
          900
        </text>
      </svg>

      {/* Numerical score & badge display positioned in the center arc */}
      <div
        className="gauge-center-content text-center position-absolute"
        style={{
          top: "40%",
          transform: "translateY(-20%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div className="d-flex align-items-baseline justify-content-center">
          <span
            className="score-number fw-bold"
            style={{
              fontSize: "44px",
              lineHeight: "1",
              letterSpacing: "-1px",
              color: tier.color,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {displayScore}
          </span>
          <span className="text-muted fw-bold ms-1" style={{ fontSize: "14px" }}>
            / 900
          </span>
        </div>

        <div
          className="tier-pill mt-2 px-3 py-1 rounded-pill d-inline-flex align-items-center gap-1 shadow-sm"
          style={{
            backgroundColor: tier.badgeBg,
            border: `1px solid ${tier.badgeBorder}`,
            color: tier.color,
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "0.4px",
          }}
        >
          <span
            className="pulse-dot rounded-circle me-1"
            style={{
              width: "8px",
              height: "8px",
              backgroundColor: tier.color,
              display: "inline-block",
            }}
          />
          {tier.tier} Rating
        </div>

        <span className="text-muted mt-2 small" style={{ fontSize: "11px" }}>
          Bureau Scale: 300 - 900
        </span>
      </div>
    </div>
  );
};

export default CreditScoreGauge;
