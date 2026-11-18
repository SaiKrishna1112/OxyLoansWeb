import React from "react";
import { Link } from "react-router-dom";

const BlogSection = () => {
  const blogs = [
    {
      img: "/assets/images/babuz/home-one-recent-blog-1.3fab76d3.png",
      date: "Latest News December 12, 2023",
      title: "The future of fraud protection.",
      desc: "Morbi eget venenatis lorem, id viverra massa. Etiam congue efficitur velit vel pharetra.",
    },
    {
      img: "/assets/images/babuz/home-one-recent-blog-2.7ec13838.png",
      date: "Latest News December 12, 2023",
      title: "Digital Banking Services",
      desc: "Morbi eget venenatis lorem, id viverra massa. Etiam congue efficitur velit vel pharetra.",
    },
  ];

  return (
    <section id="blog" className="b-blog-section">
      {/* Background runner lines */}
      <div className="b-runner-lines">
        <div className="b-runner-line" style={{ left: "10%" }}></div>
        <div className="b-runner-line" style={{ left: "30%" }}></div>
        <div className="b-runner-line" style={{ left: "50%" }}></div>
        <div className="b-runner-line" style={{ left: "70%" }}></div>
        <div className="b-runner-line" style={{ left: "90%" }}></div>
      </div>

      <div className="b-container">
        {/* Top Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px" }}>
          <div>
            <div style={{ color: "#005655", fontSize: "16px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>
              RECENT BLOG
            </div>
            <h2 style={{ fontSize: "44px", fontWeight: 700, color: "#111111", lineHeight: 1.2, margin: 0 }}>
              Read update<br />Journal
            </h2>
          </div>

          <p style={{ color: "#666666", fontSize: "16px", lineHeight: 1.6, maxWidth: "420px", margin: 0 }}>
            Read our blog and try to see passion kesin making everything accessible andaesthetic for everyone.
          </p>
        </div>

        {/* 2 Blog Cards */}
        <div className="b-blog-grid">
          {blogs.map((b, idx) => (
            <div
              key={idx}
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid #ebebeb",
                backgroundColor: "#ffffff",
                transition: "all 0.3s ease",
              }}
            >
              <img
                src={b.img}
                alt={b.title}
                style={{ width: "100%", height: "280px", objectFit: "cover", display: "block" }}
              />
              <div style={{ padding: "32px 28px" }}>
                <div style={{ color: "#888888", fontSize: "13px", fontWeight: 500, marginBottom: "10px" }}>
                  {b.date}
                </div>
                <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#111111", margin: "0 0 12px 0" }}>
                  {b.title}
                </h3>
                <p style={{ color: "#666666", fontSize: "15px", lineHeight: 1.6, margin: "0 0 24px 0" }}>
                  {b.desc}
                </p>
                <Link
                  to="/usertype"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#005655",
                    fontWeight: 600,
                    fontSize: "15px",
                  }}
                >
                  <span>Read More</span>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "6px",
                      backgroundColor: "#005655",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M7 17L17 7" />
                      <path d="M7 7h10v10" />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom All Blog Button */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>
          <Link to="/usertype" className="b-circle-btn b-circle-btn-white">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
            <span style={{ fontSize: "15px" }}>All Blog</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
