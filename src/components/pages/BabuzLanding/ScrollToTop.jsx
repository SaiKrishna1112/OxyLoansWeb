import React, { useState, useEffect } from "react";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    if (window.__babuz_lenis) {
      window.__babuz_lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!visible) return null;

  const strokeDashoffset = 126 - (126 * scrollProgress) / 100;

  return (
    <div
      className="b-scroll-top"
      onClick={scrollToTop}
      title="Scroll to top"
      style={{
        position: "fixed",
        bottom: "30px",
        right: "30px",
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        backgroundColor: "#ffffff",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 9999,
        transition: "all 0.3s ease",
      }}
    >
      <svg width="44" height="44" viewBox="0 0 44 44" style={{ position: "absolute", transform: "rotate(-90deg)" }}>
        <circle cx="22" cy="22" r="20" fill="none" stroke="#e0e0e0" strokeWidth="2.5" />
        <circle
          cx="22"
          cy="22"
          r="20"
          fill="none"
          stroke="#005655"
          strokeWidth="2.5"
          strokeDasharray="126"
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.1s linear" }}
        />
      </svg>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.5" style={{ position: "relative", zIndex: 2 }}>
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </div>
  );
};

export default ScrollToTop;
