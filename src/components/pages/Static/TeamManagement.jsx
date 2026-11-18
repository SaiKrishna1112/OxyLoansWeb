import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  FaLinkedin,
  FaEnvelope,
  FaTwitter,
  FaSearch,
  FaShieldAlt,
  FaUserCheck,
  FaCoins,
  FaAward,
  FaHandHoldingUsd,
  FaUsers,
  FaUserTie,
  FaArrowRight,
} from "react-icons/fa";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";
import oxyTitleDivider from "../../../assets/img/landing/oxy_title_divider.png";
import { initialTeamData } from "../../../data/teamManagementData";
import "./TeamManagement.css";

const TeamManagement = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [teamMembers] = useState(initialTeamData);
  const [activeCategory, setActiveCategory] = useState("Management");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const lower = tabParam.toLowerCase();
      if (lower.includes("advisory") || lower.includes("board")) {
        navigate("/advisory-team", { replace: true });
        return;
      } else if (lower.includes("tech") || lower.includes("product")) {
        setActiveCategory("Technology & Product");
      } else if (lower.includes("exec") || lower.includes("board")) {
        setActiveCategory("Executive Board");
      } else if (lower.includes("mgt") || lower.includes("management")) {
        setActiveCategory("Management");
      } else if (lower.includes("all")) {
        setActiveCategory("all");
      }
    }
  }, [searchParams, navigate]);

  // Categories list for Controls Bar pills
  const categories = useMemo(() => {
    return [
      {
        key: "Management",
        label: "Management Team",
        count: teamMembers.filter((m) => m.teamType === "Management").length,
      },
      {
        key: "Advisory Board",
        label: "Advisory Board",
        count: teamMembers.filter((m) => m.teamType === "Advisory Board").length,
      },
      {
        key: "Executive Board",
        label: "Executive Board",
        count: teamMembers.filter((m) => m.department === "Executive Board").length,
      },
      {
        key: "Technology & Product",
        label: "Technology & Product",
        count: teamMembers.filter((m) => m.department === "Technology & Product").length,
      },
      {
        key: "all",
        label: "All Members",
        count: teamMembers.length,
      },
    ];
  }, [teamMembers]);

  // Filtered members based on category and search query
  const filteredMembers = useMemo(() => {
    return teamMembers.filter((m) => {
      let matchCat = true;
      if (activeCategory === "Management") {
        matchCat = m.teamType === "Management";
      } else if (activeCategory === "Advisory Board") {
        matchCat = m.teamType === "Advisory Board";
      } else if (activeCategory !== "all") {
        matchCat = m.department === activeCategory;
      }

      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [teamMembers, activeCategory, searchQuery]);

  // Dynamic header titles based on whether Advisory or Management is active
  const isAdvisoryActive = activeCategory === "Advisory Board";
  const heroBadge = isAdvisoryActive
    ? "ADVISORY & STRATEGY"
    : "LEADERSHIP & MANAGEMENT";
  const heroHeadingFirst = isAdvisoryActive ? "OUR" : "MEET OUR";
  const heroHeadingHighlight = isAdvisoryActive
    ? "ADVISORY TEAM"
    : "LEADERSHIP TEAM";
  const heroSubtitle = isAdvisoryActive
    ? "Distinguished global industry leaders, strategists, and domain experts guiding OxyLoans' vision and growth."
    : "Pioneering RBI-regulated peer-to-peer lending and financial innovation across India.";

  return (
    <div className="oxy-team-page">
      {/* 1. OxyLoans Header */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Main Team Section (Sleek, Screen-Fit Layout) */}
      <main className="oxy-team-main">
        <div className="container">
          {/* Compact Section Header */}
          <div className="oxy-team-hero-header">
            <div className="oxy-hero-pill-badge">
              <span className="pill-pulse-dot" />
              <span>{heroBadge}</span>
            </div>

            <h1 className="oxy-team-main-heading">
              {heroHeadingFirst}{" "}
              <span className="oxy-heading-highlight">
                {heroHeadingHighlight}
              </span>
            </h1>

            <p className="oxy-team-main-subtitle">{heroSubtitle}</p>

            <div className="oxy-divider-container">
              <img
                src={oxyTitleDivider}
                alt="Divider"
                className="oxy-divider-image"
              />
            </div>

          </div>

          {/* 3. Leadership & Advisory Cards Grid: Exact 3-column layout with Synchronized Baselines */}
          {filteredMembers.length > 0 ? (
            <div className="oxy-leadership-grid" id="leadership-grid">
              {filteredMembers.map((member) => (
                <div key={member.id} className="oxy-leader-card">
                  {/* Left Column: Portrait Photo Box */}
                  <div className="leader-photo-column">
                    <div className="leader-photo-frame">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className={`leader-photo-img ${
                            member.fitMode === "contain"
                              ? "photo-contain"
                              : ""
                          }`}
                        />
                      ) : (
                        <div
                          className={`leader-fallback-avatar ${member.badgeColor}`}
                        >
                          <span>{member.fallbackInitials}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Name, Designation & Social Actions (Synchronized Baselines) */}
                  <div className="leader-details-column">
                    <div className="leader-info-top">
                      {/* Department / Category Tag at Top */}
                      <div className="leader-tag-row">
                        <span
                          className={`leader-dept-badge ${member.badgeColor}`}
                        >
                          {member.badge}
                        </span>
                      </div>

                      {/* Leader Name (Fixed 2-line height for baseline synchronization) */}
                      <div className="leader-name-wrap">
                        <h3 className="leader-name" title={member.name}>
                          {member.name}
                        </h3>
                      </div>

                      {/* Leader Designation / Role (Fixed height for baseline synchronization) */}
                      <div className="leader-role-wrap">
                        <p className="leader-role" title={member.role}>
                          {member.role}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Strip: Direct Social Links */}
                    <div className="leader-actions-strip">
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="leader-circle-btn linkedin"
                          title="LinkedIn Profile"
                          aria-label="LinkedIn"
                        >
                          <FaLinkedin />
                        </a>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="leader-circle-btn email"
                          title={`Email ${member.name}`}
                          aria-label="Email"
                        >
                          <FaEnvelope />
                        </a>
                      )}
                      {member.twitter && (
                        <a
                          href={member.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="leader-circle-btn twitter"
                          title="Twitter"
                          aria-label="Twitter"
                        >
                          <FaTwitter />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="oxy-team-empty-state">
              <FaSearch className="empty-icon" />
              <h3>No team members found</h3>
              <p>
                No results match "{searchQuery}". Try a different search term
                or category.
              </p>
              <button
                type="button"
                className="reset-filter-btn"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory(
                    isAdvisoryActive ? "Advisory Board" : "Management"
                  );
                }}
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Quick Jump Bar to Advisory Team */}
          <div className="oxy-team-switch-bar">
            <span>Looking for our global advisory board?</span>
            <Link to="/advisory-team" className="switch-team-link">
              <span>View Advisory Team</span>
              <FaArrowRight />
            </Link>
          </div>

          {/* Institutional Trust Highlights Strip */}
          <div className="oxy-team-stats-strip">
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
                <strong>100% Escrow</strong>
                <span>ICICI Regulated Flow</span>
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

          {/* Bottom Callout: RBI & Institutional Governance */}
          <div className="oxy-team-callout-card">
            <div className="callout-icon">
              <FaUserCheck />
            </div>
            <div className="callout-content">
              <h3>Institutional Governance &amp; Board Oversight</h3>
              <p>
                OxyLoans operates under strict compliance with Reserve Bank of
                India (RBI) Master Directions for NBFC-P2P entities. Our management
                team and advisory board oversee automated escrow custody,
                bilateral lender-borrower contracting, and independent quarterly
                statutory reviews.
              </p>
            </div>
            <Link to="/transparency" className="callout-btn">
              View Disclosures
            </Link>
          </div>
        </div>
      </main>

      {/* OxyLoans Footer */}
      <LandingFooter />
    </div>
  );
};

export default TeamManagement;
