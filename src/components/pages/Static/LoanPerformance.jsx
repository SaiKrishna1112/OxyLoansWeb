import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaDownload,
  FaSyncAlt,
} from "react-icons/fa";
import LandingHeader from "../../Header/LandingHeader";
import LandingFooter from "../../Footer/LandingFooter";
import oxyTitleDivider from "../../../assets/img/landing/oxy_title_divider.png";
import loanPerformanceData from "../../../data/loanPerformanceData.json";
import "./LoanPerformance.css";

const LoanPerformance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Format currency with Indian formatting
  const formatINR = (val) => {
    const num = Math.round(Number(val) || 0);
    return num.toLocaleString("en-IN");
  };

  // Filter and sort the dataset
  const filteredAndSortedData = useMemo(() => {
    let result = [...loanPerformanceData];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (item) => item.loanStatus.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.borrowerId.toLowerCase().includes(q) ||
          item.lenderId.toLowerCase().includes(q) ||
          String(item.amount).includes(q) ||
          item.loanStatus.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === "amount-asc") {
      result.sort((a, b) => a.amount - b.amount);
    } else if (sortBy === "amount-desc") {
      result.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === "roi-asc") {
      result.sort((a, b) => a.roi - b.roi);
    } else if (sortBy === "roi-desc") {
      result.sort((a, b) => b.roi - a.roi);
    } else if (sortBy === "duration-asc") {
      result.sort((a, b) => a.duration - b.duration);
    } else if (sortBy === "duration-desc") {
      result.sort((a, b) => b.duration - a.duration);
    } else if (sortBy === "status") {
      result.sort((a, b) => a.loanStatus.localeCompare(b.loanStatus));
    } else if (sortBy === "borrower") {
      result.sort((a, b) => a.borrowerId.localeCompare(b.borrowerId));
    } else if (sortBy === "lender") {
      result.sort((a, b) => a.lenderId.localeCompare(b.lenderId));
    } else {
      // Default natural order by S.No
      result.sort((a, b) => a.sNo - b.sNo);
    }

    return result;
  }, [searchTerm, sortBy, statusFilter]);

  // Pagination calculation
  const totalRecords = filteredAndSortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  // Auto-adjust current page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const currentRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  // Page numbers for pagination bar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    return pages;
  };

  // Helper for status styling class
  const getStatusClass = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("fully paid") || s.includes("closed")) {
      return "status-paid";
    }
    if (s.includes("ontime") || s.includes("paying")) {
      return "status-ontime";
    }
    if (s.includes("new")) {
      return "status-new";
    }
    if (s.includes("default")) {
      return "status-defaulter";
    }
    return "status-default";
  };

  // Download filtered data as CSV
  const handleDownloadCSV = () => {
    const headers = [
      "S.No",
      "Borrower ID",
      "Lender ID",
      "Amount",
      "ROI in %",
      "Duration",
      "Loan Status",
    ];
    const rows = filteredAndSortedData.map((r) => [
      r.sNo,
      r.borrowerId,
      r.lenderId,
      r.amount,
      r.roi,
      r.duration,
      `"${r.loanStatus}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "oxyloans_loan_performance.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="oxy-loan-perf-page">
      {/* 1. Header */}
      <LandingHeader
        standalone={true}
        showProgressBar={false}
        showSocialDock={false}
      />

      {/* 2. Main Content */}
      <main className="oxy-loan-perf-main">
        <div className="container">
          <div className="oxy-loan-perf-card">
            {/* Title: Green uppercase matching exact user screenshot */}
            <h1 className="oxy-loan-perf-title">LOAN PERFORMANCE DETAILS</h1>

            {/* Subtitle verbatim from screenshot */}
            <p className="oxy-loan-perf-subtitle">
              The below table represents the Loan performance live registered borrowers with OxyLoans.
            </p>

            {/* Cyan Swirl Divider */}
            <div className="oxy-title-divider-wrap">
              <img
                src={oxyTitleDivider}
                alt="Divider"
                className="oxy-title-divider-img"
              />
            </div>

            {/* Controls Bar: Search & Sort matching screenshot layout */}
            <div className="oxy-perf-controls-bar">
              <div className="oxy-perf-left-controls">
                <div className="oxy-perf-search-box">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search Borrower / Lender ID..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      className="search-clear-btn"
                      onClick={() => setSearchTerm("")}
                    >
                      ×
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className="oxy-perf-csv-btn"
                  onClick={handleDownloadCSV}
                  title="Export to CSV"
                >
                  <FaDownload /> Export CSV
                </button>
              </div>

              {/* Exact --Sort by-- Dropdown from Screenshot */}
              <div className="oxy-perf-sort-box">
                <select
                  className="oxy-perf-sort-select"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Sort table"
                >
                  <option value="">--Sort by--</option>
                  <option value="amount-desc">Amount: High to Low</option>
                  <option value="amount-asc">Amount: Low to High</option>
                  <option value="roi-desc">ROI: High to Low</option>
                  <option value="roi-asc">ROI: Low to High</option>
                  <option value="duration-desc">Duration: Long to Short</option>
                  <option value="duration-asc">Duration: Short to Long</option>
                  <option value="borrower">Borrower ID (A-Z)</option>
                  <option value="lender">Lender ID (A-Z)</option>
                  <option value="status">Loan Status</option>
                </select>
              </div>
            </div>

            {/* Table Container */}
            <div className="oxy-perf-table-wrap">
              <table className="oxy-perf-table">
                <thead>
                  <tr>
                    <th className="col-sno">S.No</th>
                    <th className="col-borrower">
                      <span>Borrower</span>
                      <span className="th-sub">ID</span>
                    </th>
                    <th className="col-lender">Lender ID</th>
                    <th className="col-amount">Amount</th>
                    <th className="col-roi">
                      <span>ROI in</span>
                      <span className="th-sub">%</span>
                    </th>
                    <th className="col-duration">Duration</th>
                    <th className="col-status">Loan Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.length > 0 ? (
                    currentRecords.map((item, idx) => (
                      <tr key={`${item.sNo}-${idx}`}>
                        <td className="cell-sno">{item.sNo}</td>
                        <td className="cell-borrower">{item.borrowerId}</td>
                        <td className="cell-lender">{item.lenderId}</td>
                        <td className="cell-amount">
                          {item.amountFormatted || formatINR(item.amount)}
                        </td>
                        <td className="cell-roi">{item.roi}</td>
                        <td className="cell-duration">{item.duration}</td>
                        <td className={`cell-status ${getStatusClass(item.loanStatus)}`}>
                          {item.loanStatus}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-records-cell">
                        No matching loan performance records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Summary Bar */}
            <div className="oxy-perf-pagination-bar">
              <div className="oxy-perf-entries-info">
                Showing{" "}
                <strong>
                  {totalRecords === 0
                    ? 0
                    : (currentPage - 1) * pageSize + 1}
                </strong>{" "}
                to{" "}
                <strong>
                  {Math.min(currentPage * pageSize, totalRecords)}
                </strong>{" "}
                of <strong>{totalRecords.toLocaleString("en-IN")}</strong> registered loans
              </div>

              <div className="oxy-perf-page-controls">
                <button
                  type="button"
                  className="pag-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  title="First Page"
                >
                  <FaAngleDoubleLeft />
                </button>
                <button
                  type="button"
                  className="pag-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  title="Previous Page"
                >
                  <FaChevronLeft />
                </button>

                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`pag-btn pag-num ${
                      currentPage === page ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  className="pag-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  title="Next Page"
                >
                  <FaChevronRight />
                </button>
                <button
                  type="button"
                  className="pag-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  title="Last Page"
                >
                  <FaAngleDoubleRight />
                </button>
              </div>

              {/* Rows per page selector */}
              <div className="oxy-perf-pagesize-box">
                <label htmlFor="pageSizeSelect">Show:</label>
                <select
                  id="pageSizeSelect"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Footer */}
      <LandingFooter />
    </div>
  );
};

export default LoanPerformance;
