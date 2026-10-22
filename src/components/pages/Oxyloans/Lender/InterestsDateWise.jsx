import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { DatePicker, Spin, message } from "antd";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import { getLendersInterestsDateWiseapi } from "../../../HttpRequest/afterlogin";
import "./InterestsDateWise.css";

// React Icons
import {
  FaHome,
  FaSearch,
  FaCoins,
  FaRupeeSign,
  FaHandshake,
  FaCalendarAlt,
  FaCheckCircle,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import { BsCalendarCheck, BsBarChartFill } from "react-icons/bs";
import { FiDownload } from "react-icons/fi";

// Currency formatter for Indian rupee standard
const formatCurrency = (amt) => {
  const num = Number(amt) || 0;
  return num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Date formatter to DD/MM/YYYY
const formatDisplayDate = (d) => {
  if (!d) return "-";
  if (Array.isArray(d)) {
    const year = d[0];
    const month = String(d[1]).padStart(2, "0");
    const day = String(d[2]).padStart(2, "0");
    return `${day}/${month}/${year}`;
  }
  if (typeof d === "string") {
    if (d.includes("/")) return d;
    if (d.includes("-")) {
      const parts = d.split("T")[0].split("-");
      if (parts.length === 3 && parts[0].length === 4) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
  }
  return String(d);
};

// Helper to convert DD/MM/YYYY into sortable timestamp
const parseDateToTimestamp = (dateStr) => {
  if (!dateStr) return 0;
  if (typeof dateStr === "string" && dateStr.includes("/")) {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day).getTime();
  }
  return new Date(dateStr).getTime() || 0;
};

const InterestsDateWise = () => {
  // Present month initialized dynamically (current date)
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [activeMonthLabel, setActiveMonthLabel] = useState(dayjs().format("MMMM YYYY"));
  const [tabledata, settabledata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Fetch API data for the specified month
  const fetchMonthWiseData = async (targetMonth) => {
    const monthToFetch = targetMonth || selectedMonth;
    if (!monthToFetch) {
      message.warning("Please select a month");
      return;
    }

    setLoading(true);
    const formattedMonth = monthToFetch.format("MMMM YYYY");
    setActiveMonthLabel(formattedMonth);

    try {
      // API expects { date1: "YYYY-MM-DD" } or "YYYY-MM"
      const datePayload = {
        date1: monthToFetch.format("YYYY-MM-15"),
      };

      const response = await getLendersInterestsDateWiseapi(datePayload);
      const apiRecords = Array.isArray(response?.data)
        ? response.data
        : response?.data?.data ||
          response?.data?.lendersInterests ||
          response?.data?.list ||
          [];

      if (Array.isArray(apiRecords) && apiRecords.length > 0) {
        settabledata(apiRecords);
        message.success(`Found ${apiRecords.length} records for ${formattedMonth}`);
      } else {
        settabledata([]);
        message.info(`No interest records found for ${formattedMonth}`);
      }
    } catch (err) {
      console.error("Failed to fetch lenders interest records:", err);
      settabledata([]);
      message.error("Failed to fetch records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Automatically fetch present month data on component mount
  useEffect(() => {
    fetchMonthWiseData(dayjs());
  }, []);

  // Handle month picker change
  const handleMonthChange = (date) => {
    setSelectedMonth(date);
  };

  // Submit button click handler
  const handleFetchData = () => {
    fetchMonthWiseData(selectedMonth);
  };

  // Metrics calculations strictly based on API table data
  const totalRecords = tabledata.length;

  const totalInterestReceived = useMemo(() => {
    return tabledata.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [tabledata]);

  const activeDealsCount = useMemo(() => {
    if (!tabledata || tabledata.length === 0) return 0;
    const activeItems = tabledata.filter(
      (item) => String(item.dealStatus || item.status || "").toUpperCase() === "ACTIVE"
    );
    if (activeItems.length > 0) return activeItems.length;
    return new Set(tabledata.map((item) => item.dealId || item.dealName)).size;
  }, [tabledata]);

  // Column Sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      setSortConfig({ key: null, direction: "asc" });
      return;
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return tabledata;

    const dataCopy = [...tabledata];
    return dataCopy.sort((a, b) => {
      if (sortConfig.key === "paidDate") {
        const timeA = parseDateToTimestamp(a.paidDate);
        const timeB = parseDateToTimestamp(b.paidDate);
        return sortConfig.direction === "asc" ? timeA - timeB : timeB - timeA;
      }
      if (sortConfig.key === "amount") {
        const amtA = Number(a.amount) || 0;
        const amtB = Number(b.amount) || 0;
        return sortConfig.direction === "asc" ? amtA - amtB : amtB - amtA;
      }
      return 0;
    });
  }, [tabledata, sortConfig]);

  // Download table as CSV
  const handleDownloadCsv = () => {
    if (!tabledata || tabledata.length === 0) {
      message.warning("No data available to download.");
      return;
    }

    const headers = [
      "#",
      "Deal ID",
      "Deal Name",
      "Paid Date",
      "Interest Amount (Rs)",
      "Amount Type",
      "Status",
    ];

    const rows = sortedData.map((item, index) => [
      index + 1,
      item.dealId || "",
      `"${String(item.dealName || "").replace(/"/g, '""')}"`,
      formatDisplayDate(item.paidDate),
      (Number(item.amount) || 0).toFixed(2),
      item.amountType || "LENDERINTEREST",
      item.status || "Credited",
    ]);

    const totalRow = [
      "",
      "",
      "Total Interest Received",
      "",
      totalInterestReceived.toFixed(2),
      "",
      "",
    ];

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(",")), totalRow.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const cleanLabel = activeMonthLabel.replace(/[^a-zA-Z0-9]/g, "_");
    saveAs(blob, `OxyLoans_Interests_Month_Wise_${cleanLabel}.csv`);
    message.success("Download started!");
  };

  // Render sort indicator
  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return (
        <span className="sort-icon-wrapper">
          <FaSort />
        </span>
      );
    }
    return (
      <span className="sort-icon-wrapper active">
        {sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />}
      </span>
    );
  };

  return (
    <div className="main-wrapper">
      {/* Header */}
      <Header />

      {/* Sidebar */}
      <SideBar />

      {/* Page Content Wrapper */}
      <div className="page-wrapper">
        <div className="content container-fluid">
          {/* Top Page Header */}
          <div className="interests-page-header d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              {/* <h2 className="interests-main-title">Interests Month Wise</h2>
              <p className="interests-main-subtitle">
                View the lenders interest received month-wise for your deals.
              </p> */}
            </div>
            <div className="interests-breadcrumb">
              <Link to="/dashboard" className="interests-breadcrumb-link">
                <FaHome className="interests-breadcrumb-home-icon" /> Dashboard
              </Link>
              <span className="interests-breadcrumb-sep">/</span>
              <span className="interests-breadcrumb-active">Month-wise Interest</span>
            </div>
          </div>

          {/* Month Selection / Filter Card */}
          <div className="interests-filter-card">
            <div className="interests-filter-header">
              <div className="interests-filter-icon-box">
                <BsCalendarCheck />
              </div>
              <div>
                <h3 className="interests-filter-title">Month-wise Interest</h3>
                <p className="interests-filter-desc">
                  Select a month to view the lenders interest received for your deals.
                </p>
              </div>
            </div>

            <div className="interests-filter-form">
              <div className="interests-input-group">
                <label className="interests-input-label">
                  Select month <span className="interests-input-required">*</span>
                </label>
                <DatePicker
                  picker="month"
                  format="MMMM YYYY"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  allowClear={false}
                  placeholder="Select month"
                  className="interests-month-picker"
                />
              </div>

              <button
                type="button"
                className="interests-submit-btn"
                onClick={handleFetchData}
                disabled={loading}
              >
                <FaSearch size={14} />
                <span>Submit</span>
              </button>
            </div>
          </div>

          {/* Summary / Metrics Cards Grid */}
          <div className="interests-metrics-grid">
            {/* Card 1: Total Records */}
            <div className="interests-stat-card stat-records">
              <div className="interests-stat-icon-box">
                <FaCoins />
              </div>
              <div className="interests-stat-content">
                <span className="interests-stat-label">Total Records</span>
                <span className="interests-stat-value">{totalRecords}</span>
              </div>
            </div>

            {/* Card 2: Total Interest Received */}
            <div className="interests-stat-card stat-interest">
              <div className="interests-stat-icon-box">
                <FaRupeeSign />
              </div>
              <div className="interests-stat-content">
                <span className="interests-stat-label">Total Interest Received</span>
                <span className="interests-stat-value">
                  ₹ {formatCurrency(totalInterestReceived)}
                </span>
              </div>
            </div>

            {/* Card 3: Active Deals */}
            <div className="interests-stat-card stat-deals">
              <div className="interests-stat-icon-box">
                <FaHandshake />
              </div>
              <div className="interests-stat-content">
                <span className="interests-stat-label">Active Deals</span>
                <span className="interests-stat-value">{activeDealsCount}</span>
              </div>
            </div>

            {/* Card 4: Selected Month */}
            <div className="interests-stat-card stat-month">
              <div className="interests-stat-icon-box">
                <FaCalendarAlt />
              </div>
              <div className="interests-stat-content">
                <span className="interests-stat-label">Selected Month</span>
                <span className="interests-stat-value">{activeMonthLabel}</span>
              </div>
            </div>
          </div>

          {/* Table Card Section */}
          <div className="interests-table-card">
            <div className="interests-table-header">
              <div className="interests-table-header-left">
                <span className="interests-table-header-icon">
                  <BsBarChartFill />
                </span>
                <h3 className="interests-table-header-title">
                    Month-wise Interest Records
                </h3>
              </div>
            </div>

            <div className="interests-table-wrapper">
              {loading ? (
                <div className="interests-loading-state">
                  <Spin size="large" />
                  <p className="mt-3 text-muted">Loading interests data...</p>
                </div>
              ) : sortedData.length === 0 ? (
                <div className="interests-empty-state">
                  <p className="mb-0">No records found for {activeMonthLabel}.</p>
                </div>
              ) : (
                <table className="interests-table">
                  <thead>
                    <tr>
                      <th className="interests-col-index">#</th>
                      <th>Deal ID</th>
                      <th>Deal Name</th>
                      <th
                        className="sortable-th"
                        onClick={() => handleSort("paidDate")}
                      >
                        Paid Date {renderSortIcon("paidDate")}
                      </th>
                      <th
                        className="sortable-th"
                        onClick={() => handleSort("amount")}
                      >
                        Interest Amount (₹) {renderSortIcon("amount")}
                      </th>
                      <th>Amount Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.map((item, index) => (
                      <tr key={item.dealId || index}>
                        <td className="interests-col-index">{index + 1}</td>
                        <td className="interests-col-deal-id">{item.dealId || "-"}</td>
                        <td className="interests-col-deal-name">{item.dealName || "-"}</td>
                        <td className="interests-col-paid-date">
                          {formatDisplayDate(item.paidDate)}
                        </td>
                        <td className="interests-col-amount">
                          {formatCurrency(item.amount)}
                        </td>
                        <td>
                          <span className="interests-badge-amount-type">
                            {item.amountType || "LENDERINTEREST"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestsDateWise;
