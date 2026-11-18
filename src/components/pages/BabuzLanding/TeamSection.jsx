import React, { useState } from "react";
import { Link } from "react-router-dom";

const TeamSection = () => {
  const [slideOffset, setSlideOffset] = useState(0);

  const teamMembers = [
    {
      name: "Amanda Jones",
      role: "Customer Support Specialist",
      img: "/assets/images/babuz/home-one-team-1.e0dadc48.png",
    },
    {
      name: "Charles S. Brown",
      role: "CEO & Founder",
      img: "/assets/images/babuz/home-one-team-2.365585d0.png",
    },
    {
      name: "Jennifer White",
      role: "COO",
      img: "/assets/images/babuz/home-one-team-3.0212e381.png",
    },
    {
      name: "Robert Johnson",
      role: "CFO",
      img: "/assets/images/babuz/home-one-team-4.c3bf5dc0.png",
    },
    {
      name: "Olivia Smith",
      role: "CTO",
      img: "/assets/images/babuz/home-one-team-5.4ac8fec8.png",
    },
    {
      name: "Eva Green",
      role: "Head of Marketing",
      img: "/assets/images/babuz/home-one-team-6.9b5e03ce.png",
    },
  ];

  const visibleMembers = teamMembers.slice(slideOffset, slideOffset + 3);

  const nextSlide = () => {
    if (slideOffset + 3 < teamMembers.length) {
      setSlideOffset(slideOffset + 1);
    } else {
      setSlideOffset(0);
    }
  };

  const prevSlide = () => {
    if (slideOffset > 0) {
      setSlideOffset(slideOffset - 1);
    } else {
      setSlideOffset(teamMembers.length - 3);
    }
  };

  return (
    <section id="team" className="b-team-section">
      <div className="b-container">
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px" }}>
          <div>
            <div style={{ color: "#005655", fontSize: "16px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>
              OUR TEAM
            </div>
            <h2 style={{ fontSize: "44px", fontWeight: 700, color: "#111111", lineHeight: 1.2, margin: 0 }}>
              We are Business Consulting<br />Professionals
            </h2>
          </div>

          <Link to="/usertype" className="b-circle-btn b-circle-btn-white">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
            <span style={{ fontSize: "15px" }}>Explore Now</span>
          </Link>
        </div>

        {/* 3 Team Cards */}
        <div className="b-team-grid">
          {visibleMembers.map((m, idx) => (
            <div key={idx} className="b-team-card">
              <div className="b-team-card-image">
                <img src={m.img} alt={m.name} />
                <div className="b-team-plus-badge">+</div>
              </div>
              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <h4 style={{ fontSize: "22px", fontWeight: 700, color: "#111111", margin: "0 0 6px 0" }}>
                  {m.name}
                </h4>
                <p style={{ color: "#777777", fontSize: "15px", margin: 0 }}>
                  {m.role}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Slider Controls */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", marginTop: "40px" }}>
          <button
            onClick={prevSlide}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "1px solid #d0d0d0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            &larr;
          </button>
          <button
            onClick={nextSlide}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              border: "1px solid #d0d0d0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            &rarr;
          </button>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
