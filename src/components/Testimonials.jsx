import React, { useState, useEffect } from "react";
import { oxylogodashboard } from "./imagepath";

const CheckBadge = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B8935A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PlayGlyph = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" style={{ transform: "translateX(2px)" }}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

const ChevronLeft = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#B8935A" stroke="#B8935A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "2px" }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const QuoteIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="rgba(184, 147, 90, 0.08)">
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
  </svg>
);

const VIDEOS = [
  "1nJrUkMdTJLi4VsHPTg0Pj-sbJVSsYMaL",
  "1pwgUnIJjzbOEwrRhkf9ETHlBHUuDnqN0",
  "1sJpWDG8JS_1gtqTH9MxQmPV6z48zdz2t",
  "1DtlWjNwxGzIKP5xkR8qxjLcP3BDR-vml",
  "12qfYMtpYOSNbl9vBC4SNLjG8uU37rxf3",
  "15MfwiHhOGV4ULyk70JOAz_xbR94fdu2Y",
  "1oqLf8xS_q-arf0VxRZHq2ag1RnBeXAbI",
  "1c1d3PyIk6cNO-W5rzF95fH63Ghp6WziT",
  "1mlR9tWt7f5Vev1V8x7xrWyKejWLC5gOy",
  "1wruWMLzazVN-90v2MW9UmW5HT9GYIoxD",
  "1hcp_o3pWQKcs87c0BU3SnRiCgDZHszUN",
  "1CqqNqAj-B1VElkKZ-jdx63PWHq53tsX3",
  "1rFmxDHLmWmzfI0ddqT-Di_hD9oDEx9pO",
  "1pVsvQ4iB_zZcE4hbwUBV6NuS1KWg-zht",
  "1YbAKgkIpp4oZ8WCAoF_DaIWT9Ir-oQ6b",
  "19m4NmYVTrN1HTExRWA_6RZsOpLfATYdI",
  "1_iAsYApD9hTa1cPQhNpqutGo1u620i-g",
  "1pVJp4j59xaHargL2wk8TbCyVoTXRKjfi",
  "1vjqhZo7rENY-mC9CApxScQik_Njk8Dpw",
  "1RDHq3fsVj67FEXKhzy3TmzzRMRj6NUN3",
  "12nhFreFfDE3Mk84CKiy3iL0FCaMeGDwd",
  "1yoOrji9bWgxUaZefgUXc7iTF1OP0LL4G",
  "1yje-Qv6P0vyUTfoEthF70FHXn7r3YLHL",
  "1cVQ3SOpggsghOYsy5pSUkckH7g98Vj-G",
  "1Sk1TRgb2pYzSqbPr8KBYT7XTGx5qmZ-S",
  "1sX8-l6_pvpvk4RwABRSgpqRcl1LIZ30m",
  "10Gr7o5PIyfqiMtuJEG7Ew0yVbbjp8yZZ",
  "1ejP_TnQDR_xJHjP2v_6Z3oi8cWSNrvbd",
  "1skNORxHvju0rC-LJwJizSt4giEoDY1zJ",
  "1m8Gdcnw3gp12NvK4PjP2OvbgH828W9_A",
  "14HfvKxPc82vMELRX3qLEBWNaI_9VU-HF",
  "1V3CPztV4_QUIOommUUgDerktmSEgI8AZ",
  "1HSe9zsKaf8D0mwWVPAGQfHpmD8vBKxAv",
  "1E-_G0PxoNzsoyghfxu5Gwt8IDOKBoDPh",
  "13rb19rSRu9T0gP4WXLIdpLM43BYj9WFb",
  "1iBmC1FyEECd9NvE5b7_NSnfNERhJqX95",
  "1_uEGf7-O4ce0i5I_ENydHGNIvyhVQP98",
  "1UGeN9-iM8Y3oXdr7dzp1Q2U7aL7MoTpn",
  "1tVXzPaUasUOY1dN_pB0Jssg_VJpMc0c5",
  "1rK3PFYAHYZptbtk-VlVfPfm7DkoW0IAY",
  "17GPm_yiIfO1CzPFzKPm9tBcItfJF8kOu",
  "199LZ_Nxj9Env5Tcb_0968hxteJcQbgW_",
  "1p4NDyxfnXW2iJCn6nT9cPuv4fc3QLBun",
  "1z8Y3DHK73sIbSJrUB37kNTBZJWfkkvEL",
  "1FesVvvaN6qB5KzC2RFPJ6dPCH_NHvvFj",
  "1jYxc2tLcQSkZESqs96-2_nBOx0HG3eFs",
  "1XOYnh34XUeRpuEC-RR9OalCYfNukYwN5",
  "1mvbuhWFN_lhQHIdJepGtjgHCCQV9PyPm",
  "18bruD0hqihHpb0cIl7lmzE-q8IlL8I1P",
  "1wB5omE5f7sERbPA4NoRBh0BpRjt4VWwQ",
];

export default function TestimonialVideos() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    setIsPlaying(false);
  }, [currentIndex]);

  const goPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? VIDEOS.length - 1 : prev - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev === VIDEOS.length - 1 ? 0 : prev + 1));
  };

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const currentId = VIDEOS[currentIndex];
  const displayNum = currentIndex + 1;
  const hasImageError = imageErrors[currentId];

  return (
    <div className="tv-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=IBM+Plex+Mono:wght@500;600&family=Inter:wght@400;500;600;700&display=swap');
        
        * { box-sizing: border-box; }

        .tv-page {
          position: relative;
          min-height: 100vh;
          background: radial-gradient(circle at 50% 50%, #F8FAFC 0%, #E2E8F0 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 24px 80px;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .tv-topbar {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          width: 100%;
          max-width: 1200px;
          margin-bottom: 24px;
        }

        .tv-logo {
          height: 50px;
          object-fit: contain;
        }

        .tv-header {
          text-align: center;
          margin-bottom: 40px;
          max-width: 800px;
        }

        .tv-eyebrow-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .tv-eyebrow-line {
          width: 24px;
          height: 1px;
          background: #C8D2DD;
        }

        .tv-eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #B8935A;
        }

        .tv-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(24px, 3.4vw, 40px);
          font-weight: 700;
          letter-spacing: -0.015em;
          color: #0E2A47;
          margin: 0;
          line-height: 1.25;
        }

        .tv-subtitle {
          font-size: 15px;
          color: #667085;
          margin-top: 12px;
          line-height: 1.6;
        }

        .tv-card-container {
          background: #0E2A47;
          border-radius: 24px;
          display: flex;
          flex-direction: row;
          width: 100%;
          max-width: 960px;
          box-shadow: 0 30px 60px -15px rgba(14, 42, 71, 0.35);
          border: 1px solid rgba(184, 147, 90, 0.2);
          overflow: hidden;
          margin-bottom: 40px;
          animation: cardEntrance 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        @keyframes cardEntrance {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .tv-animated-content {
          display: flex;
          flex-direction: row;
          width: 100%;
          animation: contentSlideIn 0.45s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        @keyframes contentSlideIn {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .tv-left-column {
          width: 45%;
          background: #0A1F35;
          padding: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
        }

        .tv-right-column {
          width: 55%;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }

        .tv-poster-container {
          position: relative;
          width: 100%;
          max-width: 290px;
          aspect-ratio: 9 / 16;
          overflow: hidden;
          background: #12141C;
          border-radius: 16px;
          cursor: pointer;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(184, 147, 90, 0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .tv-poster-container:hover {
          transform: translateY(-4px);
          box-shadow: 0 25px 45px rgba(0, 0, 0, 0.5), 0 0 0 1px #B8935A;
        }

        .tv-poster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .tv-poster-container:hover .tv-poster-img {
          transform: scale(1.05);
        }

        .tv-poster-overlay-shade {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(14, 42, 71, 0) 50%, rgba(14, 42, 71, 0.4) 100%);
          z-index: 1;
        }

        .tv-play-btn {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(1);
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: rgba(14, 42, 71, 0.95);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          z-index: 2;
        }

        .tv-poster-container:hover .tv-play-btn {
          transform: translate(-50%, -50%) scale(1.1);
          background: #B8935A;
          box-shadow: 0 12px 30px -5px rgba(184, 147, 90, 0.6);
        }

        .tv-fallback-card {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #0A1F35 0%, #1e4775 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 24px;
          text-align: center;
          color: #FFF;
          overflow: hidden;
        }

        .tv-fallback-logo {
          font-family: 'Inter', sans-serif;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: 0.15em;
          color: #B8935A;
          text-transform: uppercase;
        }

        .tv-fallback-title {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.7);
          letter-spacing: 0.05em;
        }

        .tv-fallback-number {
          font-family: 'Fraunces', serif;
          font-size: 40px;
          font-weight: 600;
          color: #FFF;
          margin-top: 8px;
        }

        .tv-iframe-container {
          position: relative;
          width: 100%;
          max-width: 290px;
          aspect-ratio: 9 / 16;
          border-radius: 16px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.05);
        }

        .tv-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .tv-quote-container {
          position: absolute;
          top: 10px;
          right: 20px;
          opacity: 0.85;
          pointer-events: none;
          z-index: 0;
        }

        .tv-profile-eyebrow-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          z-index: 1;
          position: relative;
        }

        .tv-profile-eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          color: #B8935A;
          letter-spacing: 0.08em;
        }

        .tv-verified-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(184, 147, 90, 0.12);
          border: 1px solid rgba(184, 147, 90, 0.25);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          color: #FFF;
        }

        .tv-card-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(20px, 2.5vw, 28px);
          font-weight: 700;
          color: #FFF;
          margin: 8px 0 12px;
          z-index: 1;
          position: relative;
        }

        .tv-rating-row {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 24px;
          z-index: 1;
          position: relative;
        }

        .tv-rating-text {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          font-weight: 500;
          margin-left: 4px;
        }

        .tv-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
          margin-bottom: 24px;
          z-index: 1;
          position: relative;
        }

        .tv-quote-text {
          font-size: 15px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 30px;
          z-index: 1;
          position: relative;
          font-style: italic;
        }

        .tv-highlights {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 40px;
          z-index: 1;
          position: relative;
        }

        .tv-highlight-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .tv-highlight-bullet {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #B8935A;
          margin-top: 8px;
          flex-shrink: 0;
        }

        .tv-highlight-title {
          font-size: 13px;
          font-weight: 700;
          color: #FFF;
          display: block;
          margin-bottom: 3px;
        }

        .tv-highlight-desc {
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.65);
          margin: 0;
          line-height: 1.4;
        }

        .tv-controls-section {
          z-index: 1;
          position: relative;
          margin-top: auto;
        }

        .tv-progress-track {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 24px;
        }

        .tv-progress-fill {
          height: 100%;
          background: #B8935A;
          border-radius: 2px;
          transition: width 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .tv-controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .tv-nav-row {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .tv-nav-circle {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #FFF;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .tv-nav-circle:hover {
          background: #B8935A;
          color: #0E2A47;
          border-color: #B8935A;
          transform: scale(1.06);
          box-shadow: 0 6px 15px -3px rgba(184, 147, 90, 0.4);
        }

        .tv-nav-circle:active {
          transform: scale(0.96);
        }

        .tv-pagination-text {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
        }

        .tv-pagination-text strong {
          color: #FFF;
        }

        .tv-select-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tv-select-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          font-weight: 500;
        }

        .tv-select {
          background: #0A1F35;
          color: #FFF;
          border: 1px solid rgba(184, 147, 90, 0.35);
          border-radius: 8px;
          padding: 8px 16px;
          outline: none;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tv-select:focus {
          border-color: #B8935A;
          box-shadow: 0 0 0 2px rgba(184, 147, 90, 0.25);
        }

        @media (max-width: 768px) {
          .tv-card-container {
            flex-direction: column;
            max-width: 480px;
          }
          
          .tv-animated-content {
            flex-direction: column;
          }

          .tv-left-column {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding: 24px;
          }

          .tv-right-column {
            width: 100%;
            padding: 32px 24px;
          }

          .tv-quote-container {
            display: none;
          }

          .tv-card-title {
            margin-bottom: 8px;
          }

          .tv-rating-row {
            margin-bottom: 16px;
          }

          .tv-divider {
            margin-bottom: 16px;
          }

          .tv-quote-text {
            margin-bottom: 20px;
            font-size: 14px;
          }

          .tv-highlights {
            margin-bottom: 24px;
          }

          .tv-controls-row {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .tv-nav-row {
            justify-content: space-between;
          }

          .tv-select-wrapper {
            justify-content: space-between;
          }

          .tv-select {
            flex: 1;
            max-width: 200px;
          }
        }
      `}</style>

      {/* Top Header Bar with Logo */}
      <div className="tv-topbar">
        <img src={oxylogodashboard} alt="OxyLoans Logo" className="tv-logo" />
      </div>

      {/* Main Header Row */}
      <div className="tv-header">
        <div className="tv-eyebrow-row">
          <span className="tv-eyebrow-line" />
          <span className="tv-eyebrow">Client Testimonials</span>
          <span className="tv-eyebrow-line" />
        </div>
        <h1 className="tv-title">Our Trusted Lenders Speak About OxyLoans</h1>
        <p className="tv-subtitle">Real people, real returns — hear it directly from our lending community.</p>
      </div>

      {/* Single Card Presentation Frame */}
      <div className="tv-card-container">
        <div key={currentIndex} className="tv-animated-content">
          
          {/* Left Column: Video Poster or Iframe */}
          <div className="tv-left-column">
            {isPlaying ? (
              <div className="tv-iframe-container">
                <iframe
                  src={`https://drive.google.com/file/d/${currentId}/preview?autoplay=1`}
                  className="tv-iframe"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  title={`Lender testimonial ${displayNum}`}
                />
              </div>
            ) : (
              <div
                className="tv-poster-container"
                onClick={() => setIsPlaying(true)}
              >
                {!hasImageError ? (
                  <>
                    <img
                      src={`https://drive.google.com/thumbnail?id=${currentId}&sz=w640`}
                      alt={`Lender testimonial ${displayNum}`}
                      className="tv-poster-img"
                      onError={() => handleImageError(currentId)}
                      loading="lazy"
                    />
                    <div className="tv-poster-overlay-shade" />
                  </>
                ) : (
                  <div className="tv-fallback-card">
                    <div className="tv-fallback-content">
                      <div className="tv-fallback-logo">OxyLoans</div>
                      <div className="tv-fallback-title">LENDER TESTIMONIAL</div>
                      <div className="tv-fallback-number">#{String(displayNum).padStart(2, "0")}</div>
                    </div>
                  </div>
                )}

                {/* Play Button Overlay */}
                <div className="tv-play-btn">
                  <PlayGlyph />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Profile details & navigation controls */}
          <div className="tv-right-column">
            <div className="tv-quote-container">
              <QuoteIcon />
            </div>

            <div>
              {/* Profile Eyebrow Row */}
              <div className="tv-profile-eyebrow-row">
                <span className="tv-profile-eyebrow">OXYLOANS PARTNER</span>
                <div className="tv-verified-badge">
                  <CheckBadge />
                  <span>Verified Lender</span>
                </div>
              </div>

              {/* Card Title */}
              <h2 className="tv-card-title">
                Lender Video #{String(displayNum).padStart(2, "0")}
              </h2>

              {/* Rating stars */}
              <div className="tv-rating-row">
                <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon />
                <span className="tv-rating-text">5.0 Platform Rating</span>
              </div>

              <div className="tv-divider" />

              {/* Quote Statement */}
              <p className="tv-quote-text">
                "OxyLoans Peer-to-Peer lending offers a transparent model with verified returns. The platform simplifies investment tracking, and support has been stellar. I consistently see monthly interest payouts."
              </p>

              {/* Highlights List */}
              <div className="tv-highlights">
                <div className="tv-highlight-item">
                  <span className="tv-highlight-bullet" />
                  <div>
                    <strong className="tv-highlight-title">Peer-to-Peer Returns</strong>
                    <p className="tv-highlight-desc">Earn up to 18% ROI per annum through secured P2P lending deals.</p>
                  </div>
                </div>
                <div className="tv-highlight-item">
                  <span className="tv-highlight-bullet" />
                  <div>
                    <strong className="tv-highlight-title">Consistent Cash Flow</strong>
                    <p className="tv-highlight-desc">Enjoy interest payouts distributed directly into your account every month.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="tv-controls-section">
              {/* Progress Bar indicator */}
              <div className="tv-progress-track">
                <div
                  className="tv-progress-fill"
                  style={{
                    width: `${(displayNum / VIDEOS.length) * 100}%`
                  }}
                />
              </div>

              {/* Navigation Actions */}
              <div className="tv-controls-row">
                {/* Arrow navigation circles */}
                <div className="tv-nav-row">
                  <button
                    onClick={goPrev}
                    className="tv-nav-circle"
                    aria-label="Previous Testimonial"
                  >
                    <ChevronLeft />
                  </button>

                  <span className="tv-pagination-text">
                    <strong>{String(displayNum).padStart(2, "0")}</strong> / {VIDEOS.length}
                  </span>

                  <button
                    onClick={goNext}
                    className="tv-nav-circle"
                    aria-label="Next Testimonial"
                  >
                    <ChevronRight />
                  </button>
                </div>

                {/* Styled Jump dropdown select */}
                <div className="tv-select-wrapper">
                  <label className="tv-select-label">Jump to:</label>
                  <select
                    value={currentIndex}
                    onChange={(e) => setCurrentIndex(Number(e.target.value))}
                    className="tv-select"
                  >
                    {VIDEOS.map((_, idx) => (
                      <option key={idx} value={idx}>
                        Testimonial #{String(idx + 1).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}