import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaArrowRight,
  FaVideo,
} from "react-icons/fa";
import "./LandingLenderStories.css";

// Comprehensive Fallback list matching /testimonials (42 videos)
const FALLBACK_VIDEOS = [
  { name: "lendertest.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_lendertest.mp4" },
  { name: "test(10).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(10).mp4" },
  { name: "test(12).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(12).mp4" },
  { name: "test(13).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(13).mp4" },
  { name: "test(14).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(14).mp4" },
  { name: "test(15).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(15).mp4" },
  { name: "test(18).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(18).mp4" },
  { name: "test(19).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(19).mp4" },
  { name: "test(2).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(2).mp4" },
  { name: "test(1).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(1).mp4" },
  { name: "test(20).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(20).mp4" },
  { name: "test(21).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(21).mp4" },
  { name: "test(22).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(22).mp4" },
  { name: "test(23).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(23).mp4" },
  { name: "test(24).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(24).mp4" },
  { name: "test(25).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(25).mp4" },
  { name: "test(28).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(28).mp4" },
  { name: "test(29).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(29).mp4" },
  { name: "test(3).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(3).mp4" },
  { name: "test(30).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(30).mp4" },
  { name: "test(31).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(31).mp4" },
  { name: "test(32).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(32).mp4" },
  { name: "test(33).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(33).mp4" },
  { name: "test(34).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(34).mp4" },
  { name: "test(4).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(4).mp4" },
  { name: "test(5).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(5).mp4" },
  { name: "test(6).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(6).mp4" },
  { name: "test(7).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(7).mp4" },
  { name: "test(8).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(8).mp4" },
  { name: "test(9).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(9).mp4" },
  { name: "test(11).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(11).mp4" },
  { name: "test(16).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(16).mp4" },
  { name: "test(17).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(17).mp4" },
  { name: "test(26).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(26).mp4" },
  { name: "test(27).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(27).mp4" },
  { name: "test(35).mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_test(35).mp4" },
  { name: "WhatsAppVideo1.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_WhatsAppVideo2026-07-20at7.29.55PM.mp4" },
  { name: "WhatsAppVideo2.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_WhatsAppVideo2026-07-28at11.19.14AM.mp4" },
  { name: "WhatsAppVideo3.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_WhatsAppVideo2026-07-29at3.50.47PM.mp4" },
  { name: "WhatsAppVideo4.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_WhatsAppVideo2026-08-03at1.54.11PM.mp4" },
  { name: "WhatsAppVideo5.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_WhatsAppVideo2026-08-04at12.02.24PM.mp4" },
  { name: "WhatsAppVideo6.mp4", path: "https://d15sy6qj2uhi5q.cloudfront.net/14996e93-46c9-46cb-a5fb-8050b8af17ab/kyc_WhatsAppVideo2026-08-08at12.15.10PM.mp4" },
];

/**
 * Single Video Card Component matching the Landing Page Glassmorphism style
 */
const LenderVideoCard = ({
  video,
  displayIndex,
  isActivePlaying,
  onStartPlay,
  onPause,
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Synchronize playback if another card starts playing
  useEffect(() => {
    if (!isActivePlaying && isPlaying) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      setIsPlaying(false);
    }
  }, [isActivePlaying, isPlaying]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      if (onPause) onPause();
    } else {
      if (onStartPlay) onStartPlay();
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn("Video playback issue:", err));
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e) => {
    e.stopPropagation();
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    const container = videoRef.current.parentElement;
    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className={`oxy-landing-testimonial-card oxy-video-card-item ${isPlaying ? "video-active" : ""}`}>
      {/* Top Header Label */}
      <div className="oxy-landing-t-header">
        <div className="oxy-lender-card-pill">
          <FaCheckCircle className="pill-check-icon" />
          <span>Verified Lender #{String(displayIndex).padStart(2, "0")}</span>
        </div>
      </div>

      {/* Video Viewport */}
      <div className="oxy-card-video-frame">
        <video
          ref={videoRef}
          src={video.path}
          className="oxy-card-video-player"
          playsInline
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) setDuration(videoRef.current.duration);
          }}
          onClick={togglePlay}
        />

        {/* Central Play Button Overlay */}
        {!isPlaying && (
          <div
            className="oxy-card-play-overlay"
            onClick={togglePlay}
            role="button"
            tabIndex={0}
            aria-label={`Play Lender Video #${displayIndex}`}
          >
            <div className="oxy-card-play-btn-circle">
              <FaPlay className="card-play-glyph" />
            </div>
            <span className="oxy-card-watch-tag">Watch Video</span>
          </div>
        )}

        {/* Minimal Control Bar during Playback */}
        <div
          className={`oxy-card-player-controls ${
            isPlaying ? "controls-shown" : ""
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="oxy-card-ctrl-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>

          <div className="oxy-card-seek-container">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="oxy-card-seek-slider"
              aria-label="Seek progress"
            />
          </div>

          <span className="oxy-card-timer">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <button
            type="button"
            className="oxy-card-ctrl-btn"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>

          <button
            type="button"
            className="oxy-card-ctrl-btn"
            onClick={toggleFullscreen}
            aria-label="Fullscreen"
          >
            <FaExpand />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * LandingLenderStories: Synchronized with overall OxyLoans Landing Page
 * - Standard OxyLoans blue gradient section
 * - "SUCCESS STORIES" title + cyan dot-line divider
 * - "LENDER TESTIMONIALS" bold left sidebar
 * - Multi-card video carousel with live Google Sheet loading
 */
const LandingLenderStories = () => {
  const [videos, setVideos] = useState(FALLBACK_VIDEOS);
  const [activePlayingIndex, setActivePlayingIndex] = useState(null);
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const sectionRef = useRef(null);

  // Dynamically fetch from Google Sheet API matching /testimonials
  useEffect(() => {
    let isMounted = true;
    const fetchVideosFromSheet = async () => {
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
          const rows = data?.table?.rows || [];
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

          if (isMounted && parsedVideos.length > 0) {
            setVideos(parsedVideos);
          }
        }
      } catch (err) {
        console.warn("Using fallback video testimonials:", err);
      }
    };

    fetchVideosFromSheet();
    return () => {
      isMounted = false;
    };
  }, []);

  // Responsive visible count calculation (Desktop: 3, Tablet: 2, Mobile: 1)
  const updateVisibleCount = useCallback(() => {
    const width = window.innerWidth;
    if (width >= 1024) {
      setVisibleCount(3);
    } else if (width >= 640) {
      setVisibleCount(2);
    } else {
      setVisibleCount(1);
    }
  }, []);

  useEffect(() => {
    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, [updateVisibleCount]);

  // Pause playback automatically when user scrolls away from this section
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setActivePlayingIndex(null);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Carousel navigation
  const maxStartIndex = Math.max(0, videos.length - visibleCount);

  const goPrev = () => {
    setActivePlayingIndex(null);
    setStartIndex((prev) => (prev <= 0 ? maxStartIndex : Math.max(0, prev - 1)));
  };

  const goNext = () => {
    setActivePlayingIndex(null);
    setStartIndex((prev) => (prev >= maxStartIndex ? 0 : prev + 1));
  };

  const cardStepPercent = 100 / visibleCount;
  const trackTranslate = -(startIndex * cardStepPercent);

  return (
    <section
      ref={sectionRef}
      className="oxy-landing-stories-section oxy-reveal-on-scroll"
      id="success-stories"
      aria-label="Verified Lender Video Testimonials"
    >
      {/* 1. Standard Landing Section Title & Subtitle */}
      <h2 className="oxy-landing-section-title">SUCCESS STORIES</h2>
      <div className="oxy-landing-stories-sub">
        Real Lenders, Real Returns — Hear Directly From Our Verified Investor Community
      </div>
      <div className="oxy-landing-divider-dotline">
        <span className="dot" />
      </div>

      {/* 2. Standard Testimonials Wrap (Sidebar + Carousel Track) */}
      <div className="oxy-landing-testimonials-wrap">
        {/* Left Sidebar matching original layout */}
        <div className="oxy-landing-testimonials-sidebar">
          <div className="oxy-sidebar-title">
            LENDER<br />TESTIMONIALS
          </div>

          <div className="oxy-sidebar-badge">
            <FaCheckCircle className="badge-icon" />
            <span>Verified Investors</span>
          </div>

          <div className="oxy-sidebar-count">
            <FaVideo className="cam-icon" />
            <span>{videos.length}+ Videos</span>
          </div>

          {/* Carousel Arrows in Sidebar */}
          <div className="oxy-sidebar-nav-row">
            <button
              type="button"
              className="oxy-sidebar-arrow-btn"
              onClick={goPrev}
              aria-label="Previous Testimonials"
            >
              <FaChevronLeft />
            </button>
            <button
              type="button"
              className="oxy-sidebar-arrow-btn"
              onClick={goNext}
              aria-label="Next Testimonials"
            >
              <FaChevronRight />
            </button>
          </div>

          <div className="oxy-sidebar-counter-text">
            {startIndex + 1} – {Math.min(startIndex + visibleCount, videos.length)} of {videos.length}
          </div>
        </div>

        {/* Right Carousel Track */}
        <div className="oxy-landing-testimonials-carousel">
          <div className="oxy-carousel-viewport">
            <div
              className="oxy-carousel-track"
              style={{
                transform: `translateX(${trackTranslate}%)`,
              }}
            >
              {videos.map((video, idx) => (
                <div
                  key={video.path || idx}
                  className="oxy-carousel-cell"
                  style={{
                    flex: `0 0 ${cardStepPercent}%`,
                    maxWidth: `${cardStepPercent}%`,
                  }}
                >
                  <LenderVideoCard
                    video={video}
                    displayIndex={idx + 1}
                    isActivePlaying={activePlayingIndex === idx}
                    onStartPlay={() => setActivePlayingIndex(idx)}
                    onPause={() => {
                      if (activePlayingIndex === idx) {
                        setActivePlayingIndex(null);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom CTA Link to full /testimonials page */}
      <div className="oxy-landing-stories-cta-row">
        <Link to="/testimonials" className="oxy-landing-btn-view-testimonials">
          <span>VIEW ALL {videos.length}+ LENDER TESTIMONIALS</span>
          <FaArrowRight className="btn-arrow" />
        </Link>
      </div>
    </section>
  );
};

export default LandingLenderStories;
