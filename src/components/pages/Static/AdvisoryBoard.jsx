import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaLinkedin,
  FaSearch,
  FaShieldAlt,
  FaUserCheck,
  FaCoins,
  FaAward,
  FaHandHoldingUsd,
  FaArrowRight,
  FaUsers,
  FaUserTie,
  FaExternalLinkAlt,
  FaInfoCircle,
} from "react-icons/fa";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";
import oxyTitleDivider from "../../../assets/img/landing/oxy_title_divider.png";
import { advisoryTeamData } from "../../../data/teamManagementData";
import "./AdvisoryBoard.css";

const AdvisoryBoard = () => {
  const [advisors] = useState(advisoryTeamData);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedAdvisor(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Categories list for Advisory Board
  const categories = useMemo(() => {
    return [
      { key: "all", label: "All Advisors", count: advisors.length },
      {
        key: "Banking & Finance",
        label: "Banking & Finance",
        count: advisors.filter((m) => m.category === "Banking & Finance").length,
      },
      {
        key: "Technology & IT",
        label: "Technology & IT",
        count: advisors.filter((m) => m.category === "Technology & IT").length,
      },
      {
        key: "Corporate & Global Strategy",
        label: "Corporate & Strategy",
        count: advisors.filter(
          (m) => m.category === "Corporate & Global Strategy"
        ).length,
      },
      {
        key: "Infrastructure & Logistics",
        label: "Infrastructure & Logistics",
        count: advisors.filter(
          (m) => m.category === "Infrastructure & Logistics"
        ).length,
      },
      {
        key: "Healthcare & Marketing",
        label: "Healthcare & Marketing",
        count: advisors.filter(
          (m) => m.category === "Healthcare & Marketing"
        ).length,
      },
    ];
  }, [advisors]);

  // Filtered advisors based on category and search query
  const filteredAdvisors = useMemo(() => {
    return advisors.filter((m) => {
      let matchCat = true;
      if (activeCategory !== "all") {
        matchCat = m.category === activeCategory;
      }

      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        (m.company && m.company.toLowerCase().includes(q)) ||
        (m.summary && m.summary.toLowerCase().includes(q)) ||
        (m.advisoryFocus && m.advisoryFocus.toLowerCase().includes(q));

      return matchCat && matchQuery;
    });
  }, [advisors, activeCategory, searchQuery]);

  return (
    <div className="oxy-advisory-page">
      {/* 1. OxyLoans Header */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Main Advisory Board Section */}
      <main className="oxy-advisory-main">
        <div className="container">
          {/* Section Hero Header */}
          <div className="oxy-advisory-hero">
            <div className="oxy-advisory-pill">
              <span className="oxy-pulse-dot" />
              <span>STRATEGIC GOVERNANCE &amp; ADVISORY</span>
            </div>

            <h1 className="oxy-advisory-heading">
              OUR <span className="oxy-advisory-highlight">ADVISORY TEAM</span>
            </h1>

            <p className="oxy-advisory-subtitle">
              Distinguished global industry leaders, commercial banking veterans,
              and technology pioneers providing strategic mentorship, credit
              governance, and market vision for OxyLoans.
            </p>

            <div className="oxy-advisory-divider">
              <img
                src={oxyTitleDivider}
                alt="Divider"
                className="oxy-divider-image"
              />
            </div>
          </div>

          {/* 3. Neat Advisory Cards Grid */}
          {filteredAdvisors.length > 0 ? (
            <div className="oxy-advisory-grid">
              {filteredAdvisors.map((advisor) => (
                <div key={advisor.id} className="advisory-card">
                  <div>
                    {/* Top Row: Domain Badge & LinkedIn Quick Icon */}
                    <div className="advisory-card-top-row">
                      <span
                        className={`advisory-domain-badge ${
                          advisor.badgeColor || "blue"
                        }`}
                      >
                        {advisor.badge || advisor.category}
                      </span>
                      {advisor.linkedin && (
                        <a
                          href={advisor.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="advisory-top-linkedin"
                          title={`${advisor.name} LinkedIn Profile`}
                          aria-label={`${advisor.name} LinkedIn`}
                        >
                          <FaLinkedin />
                        </a>
                      )}
                    </div>

                    {/* Profile Row: Photo Frame & Name/Designation */}
                    <div className="advisory-card-profile">
                      <div
                        className="advisory-photo-frame"
                        onClick={() => setSelectedAdvisor(advisor)}
                        title={`Click to view ${advisor.name}'s biography`}
                      >
                        {advisor.image ? (
                          <img
                            src={advisor.image}
                            alt={advisor.name}
                            className="advisory-photo-img"
                          />
                        ) : (
                          <div className="advisory-fallback-avatar">
                            <span>{advisor.fallbackInitials}</span>
                          </div>
                        )}
                      </div>

                      <div className="advisory-profile-info">
                        <h3
                          className="advisory-name"
                          onClick={() => setSelectedAdvisor(advisor)}
                          title={advisor.name}
                        >
                          {advisor.name}
                        </h3>
                        <p className="advisory-role" title={advisor.role}>
                          {advisor.role}
                        </p>
                        {advisor.advisoryFocus && (
                          <span className="advisory-focus-tag">
                            {advisor.advisoryFocus}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Excerpt / Work Summary */}
                    <div className="advisory-card-summary">
                      <p>{advisor.summary}</p>
                    </div>
                  </div>

                  {/* Card Footer: See More Modal Trigger & LinkedIn Link */}
                  <div className="advisory-card-footer">
                    <button
                      type="button"
                      className="btn-see-more"
                      onClick={() => setSelectedAdvisor(advisor)}
                    >
                      <span>Read Full Bio</span>
                      <FaArrowRight />
                    </button>

                    {advisor.linkedin && (
                      <a
                        href={advisor.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="advisory-linkedin-link"
                      >
                        <FaLinkedin />
                        <span>Profile</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="oxy-advisory-empty">
              <FaSearch className="empty-icon" />
              <h3>No advisors found</h3>
              <p>
                No results match "{searchQuery}". Try a different keyword or reset
                filters.
              </p>
              <button
                type="button"
                className="reset-filter-btn"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("all");
                }}
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* 4. Institutional Trust Pillars Strip */}
          <div className="oxy-advisory-stats-strip">
            <div className="stat-item">
              <div className="stat-icon-wrap green-icon">
                <FaAward />
              </div>
              <div className="stat-text">
                <strong>10+ Years</strong>
                <span>P2P Track Record</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon-wrap blue-icon">
                <FaShieldAlt />
              </div>
              <div className="stat-text">
                <strong>RBI NBFC-P2P</strong>
                <span>Regulated Intermediary</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon-wrap emerald-icon">
                <FaCoins />
              </div>
              <div className="stat-text">
                <strong>100% Escrow Flow</strong>
                <span>ICICI Regulated Escrow</span>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon-wrap orange-icon">
                <FaHandHoldingUsd />
              </div>
              <div className="stat-text">
                <strong>1,00,000+</strong>
                <span>Active Participants</span>
              </div>
            </div>
          </div>

          {/* 5. Bottom Institutional Callout */}
          <div className="oxy-advisory-callout">
            <div className="callout-icon">
              <FaUserCheck />
            </div>
            <div className="callout-content">
              <h3>Institutional Governance &amp; Advisory Oversight</h3>
              <p>
                Our Advisory Team brings distinguished expertise from top-tier
                global institutions such as Bank Muscat, PwC, and Aldar
                Properties. They guide OxyLoans in risk management, SME credit
                growth, and technological resilience.
              </p>
            </div>
            <Link to="/team-management" className="callout-btn">
              <span>View Management Team</span>
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </main>

      {/* 6. Interactive Executive Biography Modal */}
      {selectedAdvisor && (
        <div
          className="advisory-modal-overlay"
          onClick={() => setSelectedAdvisor(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="advisory-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedAdvisor(null)}
              aria-label="Close modal"
            >
              ×
            </button>

            {/* Modal Header */}
            <div className="modal-advisor-header">
              <div className="modal-advisor-photo">
                {selectedAdvisor.image ? (
                  <img
                    src={selectedAdvisor.image}
                    alt={selectedAdvisor.name}
                  />
                ) : (
                  <div className="advisory-fallback-avatar">
                    <span>{selectedAdvisor.fallbackInitials}</span>
                  </div>
                )}
              </div>

              <div className="modal-advisor-details">
                <div className="modal-badge-row">
                  <span
                    className={`advisory-domain-badge ${
                      selectedAdvisor.badgeColor || "blue"
                    }`}
                  >
                    {selectedAdvisor.badge || selectedAdvisor.category}
                  </span>
                </div>
                <h2 className="modal-advisor-name">{selectedAdvisor.name}</h2>
                <p className="modal-advisor-role">{selectedAdvisor.role}</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="modal-advisor-body">
              <div className="modal-section-title">
                <FaInfoCircle />
                <span>Executive Biography &amp; Background</span>
              </div>
              <p className="modal-bio-text">{selectedAdvisor.fullBio}</p>

              {selectedAdvisor.advisoryFocus && (
                <div className="modal-advisory-callout">
                  <h4>Advisory Domain at OxyLoans</h4>
                  <p>{selectedAdvisor.advisoryFocus}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="modal-advisor-footer">
              {selectedAdvisor.linkedin ? (
                <a
                  href={selectedAdvisor.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-linkedin-btn"
                >
                  <FaLinkedin />
                  <span>View LinkedIn Profile</span>
                  <FaExternalLinkAlt style={{ fontSize: "11px" }} />
                </a>
              ) : (
                <span />
              )}

              <button
                type="button"
                className="modal-dismiss-btn"
                onClick={() => setSelectedAdvisor(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. OxyLoans Footer */}
      <LandingFooter />
    </div>
  );
};

export default AdvisoryBoard;
