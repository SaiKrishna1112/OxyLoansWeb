import React, { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams, useParams, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaCalendarAlt,
  FaClock,
  FaUserTie,
  FaShareAlt,
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
  FaWhatsapp,
  FaLink,
  FaCheck,
  FaChevronRight,
  FaChevronLeft,
  FaTimes,
  FaNewspaper,
  FaTag,
  FaExternalLinkAlt,
  FaArrowRight,
  FaShieldAlt,
  FaBookOpen,
} from "react-icons/fa";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";
import {
  BLOG_POSTS,
  BLOG_CATEGORIES,
  getBlogBySlug,
} from "../../../data/blogData";
import oxyTitleDivider from "../../../assets/img/landing/oxy_title_divider.png";
import "./BlogPage.css";

const POSTS_PER_PAGE = 4;

const BlogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { slug } = useParams();
  const navigate = useNavigate();

  // Search, Category, and Pagination state
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    return isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  });

  // Modal reader state
  const [readingPost, setReadingPost] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // If a slug is in URL params, automatically open that post
  useEffect(() => {
    if (slug) {
      const found = getBlogBySlug(slug);
      if (found) {
        setReadingPost(found);
      }
    }
  }, [slug]);

  // Sync scroll on initial mount or page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Handle ESC key to close reader modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setReadingPost(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtered posts based on search query and category
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      // Category match
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;

      // Search match
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q)) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.paragraphs.some((p) => p.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));

  // Current page items
  const paginatedPosts = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const startIdx = (safePage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(startIdx, startIdx + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage, totalPages]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: BLOG_POSTS.length };
    BLOG_POSTS.forEach((post) => {
      counts[post.category] = (counts[post.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Update query params when filters change
  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    if (cat === "All") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    if (!val) {
      params.delete("search");
    } else {
      params.set("search", val);
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 380, behavior: "smooth" });
  };

  // Quick link copy
  const handleCopyLink = (post, e) => {
    e.stopPropagation();
    const url = post.externalUrl || window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="oxy-blog-page-wrapper">
      {/* 1. Universal Landing Header */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Top Hero Banner */}
      <section className="oxy-blog-hero">
        <div className="oxy-blog-hero-inner">
          <div className="oxy-blog-hero-badge">
            <FaBookOpen className="badge-icon" />
            <span>OXYLOANS PERSPECTIVE &amp; INSIGHTS</span>
          </div>
          <h1 className="oxy-blog-hero-title">OxyLoans Official Blog</h1>
          <img
            src={oxyTitleDivider}
            alt="Divider"
            className="oxy-blog-title-divider"
          />
          <p className="oxy-blog-hero-subtitle">
            Thought leadership, regulatory clarity, and actionable insights on
            peer-to-peer lending, SME financing, blockchain credit, and wealth
            creation from India's premier RBI-registered NBFC-P2P platform.
          </p>

          <div className="oxy-blog-hero-stats">
            <div className="hero-stat-pill">
              <strong>{BLOG_POSTS.length}</strong> Articles Published
            </div>
            <div className="hero-stat-pill">
              <strong>{BLOG_CATEGORIES.length - 1}</strong> Knowledge Categories
            </div>
            <div className="hero-stat-pill">
              <span className="dot-green"></span> RBI Registered NBFC-P2P
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Content Section (2-Column Grid) */}
      <section className="oxy-blog-content-section">
        <div className="oxy-blog-container">
          <div className="oxy-blog-layout-row">
            {/* Left Column: Blog Posts Feed */}
            <main className="oxy-blog-posts-col">
              {/* Active Filter Bar if user searched or filtered */}
              {(selectedCategory !== "All" || searchQuery) && (
                <div className="oxy-blog-active-filter-bar">
                  <div className="active-filter-tags">
                    {selectedCategory !== "All" && (
                      <span className="filter-chip">
                        Category: <strong>{selectedCategory}</strong>
                        <button
                          type="button"
                          onClick={() => handleCategorySelect("All")}
                        >
                          &times;
                        </button>
                      </span>
                    )}
                    {searchQuery && (
                      <span className="filter-chip">
                        Search: <strong>"{searchQuery}"</strong>
                        <button
                          type="button"
                          onClick={() => handleSearchChange("")}
                        >
                          &times;
                        </button>
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="clear-all-filters-btn"
                    onClick={() => {
                      setSelectedCategory("All");
                      handleSearchChange("");
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              )}

              {/* Feed Header info */}
              <div className="oxy-blog-feed-header">
                <span className="posts-counter-text">
                  Showing{" "}
                  <strong>
                    {filteredPosts.length === 0
                      ? 0
                      : (currentPage - 1) * POSTS_PER_PAGE + 1}
                    -
                    {Math.min(
                      currentPage * POSTS_PER_PAGE,
                      filteredPosts.length
                    )}
                  </strong>{" "}
                  of <strong>{filteredPosts.length}</strong> articles
                </span>
                {totalPages > 1 && (
                  <span className="page-indicator-text">
                    Page <strong>{currentPage}</strong> of{" "}
                    <strong>{totalPages}</strong>
                  </span>
                )}
              </div>

              {/* Posts Cards Grid */}
              {paginatedPosts.length > 0 ? (
                <div className="oxy-blog-posts-list">
                  {paginatedPosts.map((post) => (
                    <article
                      key={post.id}
                      className="oxy-blog-card"
                      onClick={() => setReadingPost(post)}
                    >
                      {/* Post Thumbnail */}
                      <div className="oxy-blog-card-media">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="oxy-blog-card-img"
                          loading="lazy"
                        />
                        <span className="oxy-blog-card-cat-tag">
                          {post.category}
                        </span>
                        <span className="oxy-blog-card-read-time">
                          <FaClock className="icon" /> {post.readTime}
                        </span>
                      </div>

                      {/* Post Content */}
                      <div className="oxy-blog-card-body">
                        {/* Meta Row */}
                        <div className="oxy-blog-card-meta">
                          <span className="meta-item">
                            <FaCalendarAlt className="meta-icon" />
                            {post.publishDate}
                          </span>
                          <span className="meta-sep">&bull;</span>
                          <span className="meta-item author">
                            <FaUserTie className="meta-icon" />
                            {post.author}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="oxy-blog-card-title">
                          <a
                            href={post.externalUrl}
                            onClick={(e) => {
                              e.preventDefault();
                              setReadingPost(post);
                            }}
                          >
                            {post.title}
                          </a>
                        </h2>

                        {/* Excerpt */}
                        <p className="oxy-blog-card-excerpt">
                          {post.excerpt}
                        </p>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="oxy-blog-card-tags">
                            {post.tags.slice(0, 3).map((tag, tIdx) => (
                              <span key={tIdx} className="blog-tag-pill">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Card Action Footer */}
                        <div className="oxy-blog-card-footer">
                          <button
                            type="button"
                            className="btn-read-full-post"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReadingPost(post);
                            }}
                          >
                            <span>Read Article</span>
                            <FaChevronRight className="arrow-icon" />
                          </button>

                          {/* Quick Share Links */}
                          <div
                            className="oxy-blog-card-share"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="share-label">Share:</span>
                            <a
                              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                                post.externalUrl
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="share-btn fb"
                              title="Share on Facebook"
                            >
                              <FaFacebookF />
                            </a>
                            <a
                              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                                post.externalUrl
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="share-btn in"
                              title="Share on LinkedIn"
                            >
                              <FaLinkedinIn />
                            </a>
                            <a
                              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                                post.externalUrl
                              )}&text=${encodeURIComponent(post.title)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="share-btn tw"
                              title="Share on Twitter"
                            >
                              <FaTwitter />
                            </a>
                            <a
                              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                                post.title + " - " + post.externalUrl
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="share-btn wa"
                              title="Share via WhatsApp"
                            >
                              <FaWhatsapp />
                            </a>
                            <button
                              type="button"
                              className={`share-btn copy ${
                                copiedId === post.id ? "copied" : ""
                              }`}
                              onClick={(e) => handleCopyLink(post, e)}
                              title="Copy Article Link"
                            >
                              {copiedId === post.id ? (
                                <FaCheck />
                              ) : (
                                <FaLink />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="oxy-blog-no-results">
                  <FaNewspaper className="no-results-icon" />
                  <h3>No Articles Found</h3>
                  <p>
                    We couldn't find any articles matching your search query "
                    <strong>{searchQuery}</strong>" in category "
                    <strong>{selectedCategory}</strong>".
                  </p>
                  <button
                    type="button"
                    className="btn-reset-search"
                    onClick={() => {
                      setSelectedCategory("All");
                      handleSearchChange("");
                    }}
                  >
                    View All Articles
                  </button>
                </div>
              )}

              {/* 4. Pagination Component */}
              {totalPages > 1 && (
                <nav
                  className="oxy-blog-pagination"
                  aria-label="Blog Pagination"
                >
                  <button
                    type="button"
                    className="pagination-nav-btn prev"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <FaChevronLeft className="icon" />
                    <span>Previous Page</span>
                  </button>

                  <div className="pagination-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (num) => (
                        <button
                          key={num}
                          type="button"
                          className={`pagination-num-btn ${
                            currentPage === num ? "active" : ""
                          }`}
                          onClick={() => handlePageChange(num)}
                        >
                          {num}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    className="pagination-nav-btn next"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <span>Next Page</span>
                    <FaChevronRight className="icon" />
                  </button>
                </nav>
              )}
            </main>

            {/* Right Column: Blog Sidebar */}
            <aside className="oxy-blog-sidebar-col">
              {/* 1. Search Box Widget */}
              <div className="oxy-sidebar-widget search-widget">
                <h3 className="widget-title">Search Articles</h3>
                <div className="search-input-wrap">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search blogs, keywords..."
                    className="sidebar-search-input"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="clear-search-btn"
                      onClick={() => handleSearchChange("")}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Categories Widget */}
              <div className="oxy-sidebar-widget categories-widget">
                <h3 className="widget-title">Categories</h3>
                <ul className="categories-list">
                  {BLOG_CATEGORIES.map((cat) => {
                    const count = categoryCounts[cat] || 0;
                    const isActive = selectedCategory === cat;
                    return (
                      <li key={cat}>
                        <button
                          type="button"
                          className={`cat-list-btn ${
                            isActive ? "active" : ""
                          }`}
                          onClick={() => handleCategorySelect(cat)}
                        >
                          <span className="cat-name">{cat}</span>
                          <span className="cat-count">{count}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* 3. Top / Recent Articles Widget */}
              <div className="oxy-sidebar-widget popular-widget">
                <h3 className="widget-title">Recent Articles</h3>
                <div className="recent-posts-list">
                  {BLOG_POSTS.slice(0, 4).map((post) => (
                    <div
                      key={post.id}
                      className="recent-post-item"
                      onClick={() => setReadingPost(post)}
                    >
                      <img
                        src={post.image}
                        alt={post.title}
                        className="recent-post-thumb"
                      />
                      <div className="recent-post-info">
                        <span className="recent-post-date">
                          {post.publishDate}
                        </span>
                        <h4 className="recent-post-title">{post.title}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Social Media Connect (from WordPress template) */}
              <div className="oxy-sidebar-widget social-connect-widget">
                <h3 className="widget-title">Connect With Us</h3>
                <p className="widget-subtitle">
                  Follow OxyLoans across our official social channels for daily
                  market updates, lending tips, and announcements.
                </p>
                <div className="social-links-grid">
                  <a
                    href="https://www.facebook.com/oxyloans/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-tile fb"
                  >
                    <FaFacebookF className="icon" />
                    <span>Facebook</span>
                  </a>
                  <a
                    href="https://twitter.com/oxyloans"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-tile tw"
                  >
                    <FaTwitter className="icon" />
                    <span>Twitter</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/oxyloans"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-tile in"
                  >
                    <FaLinkedinIn className="icon" />
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href="https://www.youtube.com/@oxyloans"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-tile yt"
                  >
                    <FaExternalLinkAlt className="icon" />
                    <span>YouTube</span>
                  </a>
                  <a
                    href="https://api.whatsapp.com/send?phone=919966888825"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-tile wa"
                  >
                    <FaWhatsapp className="icon" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* 5. Direct Lending CTA Box */}
              <div className="oxy-sidebar-widget cta-widget">
                <div className="cta-icon-wrap">
                  <FaShieldAlt />
                </div>
                <h4>Start Lending on OxyLoans</h4>
                <p>
                  Earn up to <strong>1.75% Monthly ROI</strong> with
                  RBI-regulated P2P non-banking financial facilitation.
                </p>
                <div className="cta-buttons">
                  <Link to="/register" className="btn-cta-lend">
                    <span>Lend Money</span>
                    <FaArrowRight className="icon" />
                  </Link>
                  <Link to="/borrower_register" className="btn-cta-borrow">
                    Borrow Money
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 5. Full Post Reading Modal */}
      {readingPost && (
        <div
          className="oxy-blog-modal-backdrop"
          onClick={() => setReadingPost(null)}
        >
          <div
            className="oxy-blog-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="oxy-blog-modal-header">
              <div className="modal-header-badges">
                <span className="modal-cat-badge">
                  {readingPost.category}
                </span>
                <span className="modal-read-time">
                  <FaClock className="icon" /> {readingPost.readTime}
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setReadingPost(null)}
                aria-label="Close article modal"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="oxy-blog-modal-body">
              <h1 className="modal-post-title">{readingPost.title}</h1>

              <div className="modal-post-meta">
                <div className="author-details">
                  <div className="author-avatar-badge">
                    <FaUserTie />
                  </div>
                  <div>
                    <span className="author-name">{readingPost.author}</span>
                    <span className="author-role">{readingPost.authorRole}</span>
                  </div>
                </div>
                <div className="date-details">
                  <FaCalendarAlt className="icon" />
                  <span>{readingPost.publishDate}</span>
                </div>
              </div>

              {/* Featured Image */}
              {readingPost.image && (
                <div className="modal-featured-media">
                  <img
                    src={readingPost.image}
                    alt={readingPost.title}
                    className="modal-featured-img"
                  />
                </div>
              )}

              {/* Paragraphs */}
              <div className="modal-post-content">
                {readingPost.paragraphs && readingPost.paragraphs.length > 0 ? (
                  readingPost.paragraphs.map((p, idx) => (
                    <p key={idx} className="modal-para">
                      {p}
                    </p>
                  ))
                ) : (
                  <p className="modal-para">{readingPost.excerpt}</p>
                )}
              </div>

              {/* Tags inside modal */}
              {readingPost.tags && readingPost.tags.length > 0 && (
                <div className="modal-tags-row">
                  <span className="tags-label">
                    <FaTag className="icon" /> Tags:
                  </span>
                  {readingPost.tags.map((t, idx) => (
                    <span key={idx} className="modal-tag-pill">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Modal Footer Share Bar */}
              <div className="modal-footer-share">
                <span className="share-title">Share this article:</span>
                <div className="share-icons-wrap">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      readingPost.externalUrl
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-share-btn fb"
                  >
                    <FaFacebookF /> Facebook
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      readingPost.externalUrl
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-share-btn in"
                  >
                    <FaLinkedinIn /> LinkedIn
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                      readingPost.externalUrl
                    )}&text=${encodeURIComponent(readingPost.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-share-btn tw"
                  >
                    <FaTwitter /> Twitter
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      readingPost.title + " - " + readingPost.externalUrl
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-share-btn wa"
                  >
                    <FaWhatsapp /> WhatsApp
                  </a>
                  <button
                    type="button"
                    className="modal-share-btn copy"
                    onClick={(e) => handleCopyLink(readingPost, e)}
                  >
                    {copiedId === readingPost.id ? (
                      <>
                        <FaCheck /> Copied!
                      </>
                    ) : (
                      <>
                        <FaLink /> Copy Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="oxy-blog-modal-bottom-bar">
              <a
                href={readingPost.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="external-read-link"
              >
                <span>View on OxyLoans.com</span>
                <FaExternalLinkAlt className="icon" />
              </a>
              <button
                type="button"
                className="btn-modal-close"
                onClick={() => setReadingPost(null)}
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Universal Landing Footer */}
      <LandingFooter showDisclaimerTicker={false} />
    </div>
  );
};

export default BlogPage;
