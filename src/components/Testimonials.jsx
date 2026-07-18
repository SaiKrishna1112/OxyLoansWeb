import React, { useState, useEffect, useRef } from "react";
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

const PopoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const PlayMiniIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseMiniIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

const VolumeIcon = ({ isMuted }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {isMuted ? (
      <>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </>
    ) : (
      <>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
      </>
    )}
  </svg>
);

const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const FullscreenIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
  </svg>
);

const FALLBACK_VIDEOS = [
  { name: "lendertest.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_lendertest.mp4" },
  { name: "test10.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test10.mp4" },
  { name: "test11.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test11.mp4" },
  { name: "test12.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test12.mp4" },
  { name: "test13.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test13.mp4" },
  { name: "test14.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test14.mp4" },
  { name: "test15.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test15.mp4" },
  { name: "test16.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test16.mp4" },
  { name: "test19.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test19.mp4" },
  { name: "test2.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test2.mp4" },
  { name: "test20.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test20.mp4" },
  { name: "test21.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test21.mp4" },
  { name: "test22.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test22.mp4" },
  { name: "test23.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test23.mp4" },
  { name: "test24.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test24.mp4" },
  { name: "test25.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test25.mp4" },
  { name: "test26.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test26.mp4" },
  { name: "test29.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test29.mp4" },
  { name: "test3.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test3.mp4" },
  { name: "test30.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test30.mp4" },
  { name: "test31.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test31.mp4" },
  { name: "test32.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test32.mp4" },
  { name: "test4.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test4.mp4" },
  { name: "test5.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test5.mp4" },
  { name: "test6.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test6.mp4" },
  { name: "test7.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test7.mp4" },
  { name: "test8.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test8.mp4" },
  { name: "test9.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test9.mp4" }
];

export default function TestimonialVideos() {
  const [videos, setVideos] = useState(FALLBACK_VIDEOS);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const videoRef = useRef(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(
          "https://docs.google.com/spreadsheets/d/1FL0dQlXZEh4TY4wUYFfesk7FhXlGFR_s9yAIxEbNVq8/gviz/tq?tqx=out:json"
        );
        const text = await response.text();
        const jsonStart = text.indexOf("{");
        const jsonEnd = text.lastIndexOf("}");
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonString = text.substring(jsonStart, jsonEnd + 1);
          const data = JSON.parse(jsonString);
          const rows = data.table.rows;
          const parsedVideos = [];
          
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row || !row.c) continue;
            
            const nameCell = row.c[0];
            const pathCell = row.c[1];
            
            const name = nameCell ? String(nameCell.v || "") : "";
            let path = pathCell ? String(pathCell.v || "") : "";
            
            if (path.includes("askoxy.s3.ap-south-1.amazonaws.com")) {
              path = path.replace(
                "https://askoxy.s3.ap-south-1.amazonaws.com",
                "https://d15sy6qj2uhi5q.cloudfront.net"
              );
            }
            
            if (path && name !== "documentName") {
              parsedVideos.push({ name, path });
            }
          }
          if (parsedVideos.length > 0) {
            setVideos(parsedVideos);
          }
        }
      } catch (error) {
        console.error("Error fetching videos from Google Sheet:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  useEffect(() => {
    setIsPlaying(false);
    setVideoPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setPlaybackSpeed(1);
    setShowSpeedMenu(false);
  }, [currentIndex]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
        setVideoPlaying(false);
      } else {
        videoRef.current.play().catch((err) => console.error("Playback error:", err));
        setVideoPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeekChange = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      const container = videoRef.current.parentElement;
      if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
          container.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? videos.length - 1 : prev - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev === videos.length - 1 ? 0 : prev + 1));
  };

  const handleImageError = (id) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const currentItem = videos[currentIndex] || { name: "", path: "" };
  const currentPath = currentItem.path;
  const displayNum = currentIndex + 1;
  const hasImageError = imageErrors[currentPath];

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

        .tv-player-container {
          position: relative;
          width: 100%;
          max-width: 290px;
          aspect-ratio: 9 / 16;
          border-radius: 16px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          border: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tv-video-element {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }

        .tv-video-element-direct {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .tv-player-popout {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 10;
          background: rgba(14, 42, 71, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 6px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFF;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tv-player-popout:hover {
          background: #B8935A;
          border-color: #B8935A;
          color: #0E2A47;
          transform: scale(1.05);
        }

        .tv-player-bottom-controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 10;
          padding: 16px 12px 20px;
          background: linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tv-player-play-btn {
          background: #FFFFFF;
          color: #000000;
          border: none;
          border-radius: 20px;
          width: 48px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s ease, background-color 0.2s ease;
          flex-shrink: 0;
        }

        .tv-player-play-btn:hover {
          background: #F1F5F9;
          transform: scale(1.05);
        }

        .tv-player-play-btn:active {
          transform: scale(0.95);
        }

        .tv-player-slider-container {
          flex-grow: 1;
          display: flex;
          align-items: center;
        }

        .tv-player-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
          margin: 0;
        }

        .tv-player-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          background: transparent;
        }

        .tv-player-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 3px;
          height: 14px;
          background: #FFFFFF;
          cursor: pointer;
          border-radius: 0;
          margin-top: -5px;
        }

        .tv-player-slider::-moz-range-thumb {
          width: 3px;
          height: 14px;
          background: #FFFFFF;
          cursor: pointer;
          border: none;
          border-radius: 0;
        }

        .tv-player-right-pill {
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(4px);
          border-radius: 20px;
          padding: 3px 6px;
          display: flex;
          align-items: center;
          gap: 6px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        .tv-player-control-icon-btn {
          background: none;
          border: none;
          color: #FFFFFF;
          opacity: 0.85;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: opacity 0.2s ease, transform 0.2s ease;
          position: relative;
          padding: 0;
        }

        .tv-player-control-icon-btn:hover {
          opacity: 1;
          transform: scale(1.1);
        }

        .tv-player-speed-menu {
          position: absolute;
          bottom: 32px;
          right: 0;
          background: rgba(10, 31, 53, 0.95);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(184, 147, 90, 0.3);
          border-radius: 8px;
          padding: 4px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          z-index: 100;
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
          min-width: 60px;
        }

        .tv-player-speed-option {
          background: none;
          border: none;
          color: #FFFFFF;
          font-size: 11px;
          padding: 6px 8px;
          text-align: center;
          cursor: pointer;
          border-radius: 4px;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        .tv-player-speed-option:hover {
          background: rgba(184, 147, 90, 0.15);
          color: #B8935A;
        }

        .tv-player-speed-option.active {
          background: #B8935A;
          color: #0E2A47;
          font-weight: bold;
        }

        .tv-player-container:fullscreen {
          max-width: none;
          width: 100vw;
          height: 100vh;
          border-radius: 0;
          background: #000;
        }

        .tv-player-container:fullscreen .tv-video-element-direct {
          object-fit: contain;
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
              currentPath.startsWith("http") ? (
                <div className="tv-player-container">

                  <video
                    ref={videoRef}
                    src={currentPath}
                    className="tv-video-element-direct"
                    autoPlay
                    onPlay={() => setVideoPlaying(true)}
                    onPause={() => setVideoPlaying(false)}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onClick={togglePlay}
                  />

                  {/* Bottom Custom Control Bar */}
                  <div className="tv-player-bottom-controls">
                    {/* Play/Pause Pill */}
                    <button
                      className="tv-player-play-btn"
                      onClick={togglePlay}
                      aria-label={videoPlaying ? "Pause" : "Play"}
                    >
                      {videoPlaying ? <PauseMiniIcon /> : <PlayMiniIcon />}
                    </button>

                    {/* Progress Seek Slider */}
                    <div className="tv-player-slider-container">
                      <input
                        type="range"
                        min={0}
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeekChange}
                        className="tv-player-slider"
                        aria-label="Seek progress"
                      />
                    </div>

                    {/* Right Control Pill (Mute, Settings, Fullscreen) */}
                    <div className="tv-player-right-pill">
                      {/* Volume Mute Toggle */}
                      <button
                        className="tv-player-control-icon-btn"
                        onClick={toggleMute}
                        aria-label={isMuted ? "Unmute" : "Mute"}
                      >
                        <VolumeIcon isMuted={isMuted} />
                      </button>

                      {/* Settings Speed Trigger */}
                      <div style={{ position: "relative" }}>
                        <button
                          className="tv-player-control-icon-btn"
                          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                          aria-label="Playback speed"
                        >
                          <SettingsIcon />
                        </button>

                        {/* Speed Popover Menu */}
                        {showSpeedMenu && (
                          <div className="tv-player-speed-menu">
                            {[0.5, 1, 1.5, 2].map((speed) => (
                              <button
                                key={speed}
                                className={`tv-player-speed-option ${playbackSpeed === speed ? "active" : ""}`}
                                onClick={() => handleSpeedChange(speed)}
                              >
                                {speed}x
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Fullscreen Toggle */}
                      <button
                        className="tv-player-control-icon-btn"
                        onClick={toggleFullscreen}
                        aria-label="Fullscreen"
                      >
                        <FullscreenIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="tv-player-container">
                  <iframe
                    src={`https://drive.google.com/file/d/${currentPath}/preview?autoplay=1`}
                    className="tv-video-element"
                    allow="autoplay; encrypted-media; fullscreen"
                    allowFullScreen
                    title={`Lender testimonial ${displayNum}`}
                  />
                </div>
              )
            ) : (
              <div
                className="tv-poster-container"
                onClick={() => setIsPlaying(true)}
              >
                {!hasImageError && !currentPath.startsWith("http") ? (
                  <>
                    <img
                      src={`https://drive.google.com/thumbnail?id=${currentPath}&sz=w640`}
                      alt={`Lender testimonial ${displayNum}`}
                      className="tv-poster-img"
                      onError={() => handleImageError(currentPath)}
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
                    width: `${(displayNum / videos.length) * 100}%`
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
                    <strong>{String(displayNum).padStart(2, "0")}</strong> / {videos.length}
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
                    {videos.map((_, idx) => (
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