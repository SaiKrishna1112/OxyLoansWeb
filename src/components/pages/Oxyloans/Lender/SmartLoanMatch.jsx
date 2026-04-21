import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../Header/Header";
import Sidebar from "../../../SideBar/SideBar";
import { getSmartLoanMatches } from "../../../HttpRequest/afterlogin";

const PURPOSES = [
  "Any",
  "Medical",
  "Education",
  "Business",
  "Home Renovation",
  "Personal",
  "Vehicle",
  "Agriculture",
];

const DURATIONS = [
  { label: "Any", value: 0 },
  { label: "1–6 months", value: 6 },
  { label: "6–12 months", value: 12 },
  { label: "12–24 months", value: 24 },
  { label: "24–36 months", value: 36 },
];

function MatchScoreBar({ score }) {
  const color =
    score >= 80 ? "#52c41a" : score >= 60 ? "#faad14" : "#ff7a45";
  return (
    <div style={{ marginBottom: 4 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          marginBottom: 4,
        }}
      >
        <span style={{ color: "#888" }}>Match Score</span>
        <strong style={{ color, fontSize: 14 }}>{score}%</strong>
      </div>
      <div
        style={{
          height: 8,
          background: "#f0f0f0",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${score}%`,
            background: color,
            borderRadius: 6,
            transition: "width 0.8s ease",
          }}
        />
      </div>
    </div>
  );
}

function OxyScorePill({ score }) {
  if (!score) return null;
  const color =
    score >= 750
      ? "#52c41a"
      : score >= 650
      ? "#faad14"
      : score >= 550
      ? "#fa8c16"
      : "#ff4d4f";
  return (
    <span
      style={{
        background: `${color}18`,
        color,
        border: `1px solid ${color}40`,
        borderRadius: 20,
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      OxyScore {score}
    </span>
  );
}

export default function SmartLoanMatch() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState("");

  // Preferences form
  const [prefs, setPrefs] = useState({
    minAmount: "",
    maxAmount: "",
    minRoi: "",
    maxRoi: "",
    maxDuration: 0,
    purpose: "Any",
    riskTolerance: "MEDIUM",
  });

  const setPref = (key, val) => setPrefs((p) => ({ ...p, [key]: val }));

  const handleFind = useCallback(async () => {
    setLoading(true);
    setError("");
    setMatches(null);
    try {
      const payload = {
        minAmount: prefs.minAmount ? Number(prefs.minAmount) : null,
        maxAmount: prefs.maxAmount ? Number(prefs.maxAmount) : null,
        minRoi: prefs.minRoi ? Number(prefs.minRoi) : null,
        maxRoi: prefs.maxRoi ? Number(prefs.maxRoi) : null,
        maxDurationMonths: prefs.maxDuration || null,
        purpose: prefs.purpose !== "Any" ? prefs.purpose : null,
        riskTolerance: prefs.riskTolerance,
      };
      const res = await getSmartLoanMatches(payload);
      setMatches(Array.isArray(res.data) ? res.data : res.data?.matches || []);
    } catch (e) {
      if (e?.response?.status === 404) {
        setError(
          "AI Smart Matching is being set up. Check back soon!"
        );
      } else {
        setError(
          e?.response?.data?.message ||
            "Failed to fetch matches. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [prefs]);

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          {/* Page header */}
          <div className="page-header">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                🤖
              </div>
              <div>
                <h3 className="page-title" style={{ margin: 0 }}>
                  AI Smart Loan Matching
                </h3>
                <p style={{ margin: 0, color: "#888", fontSize: 13 }}>
                  Our AI analyzes your lending history and preferences to find the
                  best matching loan requests for you.
                </p>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Preferences Panel */}
            <div className="col-md-4">
              <div className="card">
                <div
                  className="card-header"
                  style={{
                    background: "linear-gradient(135deg, #6366f118, #8b5cf618)",
                    borderBottom: "1px solid #e8e8e8",
                  }}
                >
                  <h5
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      color: "#6366f1",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <i className="fa-solid fa-sliders" /> Preferences
                  </h5>
                </div>
                <div className="card-body">
                  {/* Amount range */}
                  <div style={{ marginBottom: 18 }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#555",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Investment Amount (₹)
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="number"
                        placeholder="Min"
                        value={prefs.minAmount}
                        onChange={(e) => setPref("minAmount", e.target.value)}
                        className="form-control"
                        style={{ fontSize: 13 }}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={prefs.maxAmount}
                        onChange={(e) => setPref("maxAmount", e.target.value)}
                        className="form-control"
                        style={{ fontSize: 13 }}
                      />
                    </div>
                  </div>

                  {/* ROI range */}
                  <div style={{ marginBottom: 18 }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#555",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Preferred ROI (%)
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        type="number"
                        placeholder="Min %"
                        value={prefs.minRoi}
                        onChange={(e) => setPref("minRoi", e.target.value)}
                        className="form-control"
                        style={{ fontSize: 13 }}
                        min={0}
                        max={36}
                      />
                      <input
                        type="number"
                        placeholder="Max %"
                        value={prefs.maxRoi}
                        onChange={(e) => setPref("maxRoi", e.target.value)}
                        className="form-control"
                        style={{ fontSize: 13 }}
                        min={0}
                        max={36}
                      />
                    </div>
                  </div>

                  {/* Duration */}
                  <div style={{ marginBottom: 18 }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#555",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Max Loan Duration
                    </label>
                    <select
                      value={prefs.maxDuration}
                      onChange={(e) =>
                        setPref("maxDuration", Number(e.target.value))
                      }
                      className="form-select form-control"
                      style={{ fontSize: 13 }}
                    >
                      {DURATIONS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Purpose */}
                  <div style={{ marginBottom: 18 }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#555",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Loan Purpose
                    </label>
                    <select
                      value={prefs.purpose}
                      onChange={(e) => setPref("purpose", e.target.value)}
                      className="form-select form-control"
                      style={{ fontSize: 13 }}
                    >
                      {PURPOSES.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Risk tolerance */}
                  <div style={{ marginBottom: 24 }}>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#555",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Risk Tolerance
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["LOW", "MEDIUM", "HIGH"].map((level) => (
                        <button
                          key={level}
                          onClick={() => setPref("riskTolerance", level)}
                          style={{
                            flex: 1,
                            padding: "8px 0",
                            border:
                              prefs.riskTolerance === level
                                ? "2px solid #6366f1"
                                : "1px solid #e0e0e0",
                            borderRadius: 8,
                            background:
                              prefs.riskTolerance === level
                                ? "#6366f118"
                                : "#fff",
                            color:
                              prefs.riskTolerance === level
                                ? "#6366f1"
                                : "#555",
                            fontWeight:
                              prefs.riskTolerance === level ? 700 : 400,
                            cursor: "pointer",
                            fontSize: 12,
                            textTransform: "uppercase",
                          }}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleFind}
                    disabled={loading}
                    style={{
                      width: "100%",
                      padding: "12px",
                      background: loading
                        ? "#d9d9d9"
                        : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 10,
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {loading ? (
                      <>
                        <i className="fa fa-spinner fa-spin" /> Analyzing…
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-wand-magic-sparkles" /> Find Best
                        Matches
                      </>
                    )}
                  </button>

                  <p
                    style={{
                      fontSize: 11,
                      color: "#aaa",
                      textAlign: "center",
                      marginTop: 10,
                    }}
                  >
                    AI analyzes your history + live marketplace data
                  </p>
                </div>
              </div>
            </div>

            {/* Results Panel */}
            <div className="col-md-8">
              {/* Initial state */}
              {matches === null && !loading && !error && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "80px 40px",
                    color: "#bbb",
                  }}
                >
                  <div style={{ fontSize: 60, marginBottom: 20 }}>🤖</div>
                  <h4 style={{ color: "#999" }}>
                    Set your preferences and click
                    <br />
                    "Find Best Matches"
                  </h4>
                  <p style={{ color: "#bbb", maxWidth: 320, margin: "12px auto 0" }}>
                    Our AI will scan the marketplace and rank loan requests most
                    compatible with your investment goals.
                  </p>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "80px 40px",
                    color: "#888",
                  }}
                >
                  <div style={{ fontSize: 50, marginBottom: 20 }}>
                    <i className="fa fa-brain fa-spin" style={{ color: "#6366f1" }} />
                  </div>
                  <h4 style={{ color: "#6366f1" }}>AI is analyzing…</h4>
                  <p style={{ color: "#aaa" }}>
                    Scanning marketplace, reviewing your history and crunching
                    numbers…
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div
                  style={{
                    background: "#fff7e6",
                    border: "1px solid #ffd591",
                    borderRadius: 14,
                    padding: "32px",
                    textAlign: "center",
                    color: "#d46b08",
                  }}
                >
                  <i
                    className="fa-solid fa-triangle-exclamation"
                    style={{ fontSize: 36, marginBottom: 14, display: "block" }}
                  />
                  <h5 style={{ margin: "0 0 8px" }}>Coming Soon</h5>
                  <p style={{ margin: 0, fontSize: 14 }}>{error}</p>
                  <p style={{ margin: "12px 0 0", fontSize: 13, color: "#888" }}>
                    Meanwhile, browse{" "}
                    <button
                      onClick={() => navigate("/marketplace-loans")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#1890ff",
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontSize: 13,
                      }}
                    >
                      all marketplace loan requests
                    </button>
                    .
                  </p>
                </div>
              )}

              {/* Results */}
              {matches !== null && !loading && !error && (
                <>
                  <div
                    style={{
                      marginBottom: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <h5 style={{ margin: 0, fontWeight: 700 }}>
                      {matches.length > 0 ? (
                        <>
                          <i
                            className="fa-solid fa-star"
                            style={{ color: "#faad14", marginRight: 8 }}
                          />
                          {matches.length} matches found
                        </>
                      ) : (
                        "No matches found"
                      )}
                    </h5>
                    <button
                      onClick={handleFind}
                      style={{
                        background: "none",
                        border: "1px solid #6366f1",
                        color: "#6366f1",
                        borderRadius: 8,
                        padding: "6px 14px",
                        cursor: "pointer",
                        fontSize: 13,
                      }}
                    >
                      <i className="fa-solid fa-arrows-rotate" /> Refresh
                    </button>
                  </div>

                  {matches.length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "60px 0",
                        color: "#aaa",
                      }}
                    >
                      <i
                        className="fa-solid fa-magnifying-glass"
                        style={{ fontSize: 40, marginBottom: 14, display: "block" }}
                      />
                      <p>No matching loan requests right now.</p>
                      <p style={{ fontSize: 13 }}>
                        Try relaxing your filters or check back later.
                      </p>
                    </div>
                  )}

                  {matches.map((m, idx) => {
                    const loan = m.loanRequest || m;
                    const score = m.matchScore || m.score || 0;
                    const reason = m.matchReason || m.reason || "";
                    return (
                      <div
                        key={loan.id || idx}
                        className="card"
                        style={{
                          borderRadius: 14,
                          marginBottom: 16,
                          border:
                            score >= 80
                              ? "1px solid #b7eb8f"
                              : "1px solid #e8e8e8",
                          overflow: "hidden",
                        }}
                      >
                        {/* Top rank ribbon */}
                        {idx === 0 && matches.length > 1 && (
                          <div
                            style={{
                              background: "linear-gradient(90deg, #52c41a, #389e0d)",
                              color: "#fff",
                              padding: "4px 16px",
                              fontSize: 12,
                              fontWeight: 700,
                              letterSpacing: 0.5,
                            }}
                          >
                            ⭐ BEST MATCH
                          </div>
                        )}

                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-7">
                              {/* Match score */}
                              <MatchScoreBar score={score} />

                              {/* Borrower / Loan Info */}
                              <div
                                style={{
                                  marginTop: 14,
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 8,
                                  marginBottom: 10,
                                }}
                              >
                                <OxyScorePill score={loan.oxyScore} />
                                {loan.purpose && (
                                  <span
                                    style={{
                                      background: "#f0f5ff",
                                      color: "#2f54eb",
                                      border: "1px solid #adc6ff",
                                      borderRadius: 20,
                                      padding: "2px 10px",
                                      fontSize: 12,
                                    }}
                                  >
                                    {loan.purpose}
                                  </span>
                                )}
                              </div>

                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 1fr",
                                  gap: "8px 16px",
                                  marginBottom: 12,
                                }}
                              >
                                <div>
                                  <div
                                    style={{ fontSize: 11, color: "#888" }}
                                  >
                                    Loan Amount
                                  </div>
                                  <div
                                    style={{
                                      fontWeight: 700,
                                      color: "#0f172a",
                                      fontSize: 15,
                                    }}
                                  >
                                    ₹{" "}
                                    {(
                                      loan.loanAmount ||
                                      loan.loanRequestAmount ||
                                      0
                                    ).toLocaleString("en-IN")}
                                  </div>
                                </div>
                                <div>
                                  <div
                                    style={{ fontSize: 11, color: "#888" }}
                                  >
                                    Requested ROI
                                  </div>
                                  <div
                                    style={{
                                      fontWeight: 700,
                                      color: "#52c41a",
                                      fontSize: 15,
                                    }}
                                  >
                                    {loan.requestedRate ||
                                      loan.rateOfInterest ||
                                      "N/A"}
                                    %
                                  </div>
                                </div>
                                <div>
                                  <div
                                    style={{ fontSize: 11, color: "#888" }}
                                  >
                                    Duration
                                  </div>
                                  <div style={{ fontWeight: 600 }}>
                                    {loan.loanDuration ||
                                      loan.loanTenure ||
                                      "N/A"}{" "}
                                    months
                                  </div>
                                </div>
                                <div>
                                  <div
                                    style={{ fontSize: 11, color: "#888" }}
                                  >
                                    Borrower
                                  </div>
                                  <div style={{ fontWeight: 600 }}>
                                    {loan.borrowerName || `BR${loan.userId || ""}`}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="col-md-5">
                              {/* AI Reason */}
                              {reason && (
                                <div
                                  style={{
                                    background: "#f8f9ff",
                                    border: "1px solid #e0e5ff",
                                    borderRadius: 10,
                                    padding: "12px 14px",
                                    marginBottom: 14,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      color: "#6366f1",
                                      marginBottom: 6,
                                      textTransform: "uppercase",
                                      letterSpacing: 0.5,
                                    }}
                                  >
                                    <i className="fa-solid fa-robot" /> AI Insight
                                  </div>
                                  <p
                                    style={{
                                      margin: 0,
                                      fontSize: 12,
                                      color: "#475569",
                                      lineHeight: 1.55,
                                    }}
                                  >
                                    {reason}
                                  </p>
                                </div>
                              )}

                              <div style={{ display: "flex", gap: 8 }}>
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/negotiation/${
                                        loan.id || loan.loanRequestId
                                      }`
                                    )
                                  }
                                  style={{
                                    flex: 1,
                                    padding: "9px 0",
                                    background:
                                      "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    fontSize: 13,
                                    fontWeight: 600,
                                  }}
                                >
                                  Make Offer
                                </button>
                                <button
                                  onClick={() =>
                                    navigate("/marketplace-loans")
                                  }
                                  style={{
                                    flex: 1,
                                    padding: "9px 0",
                                    background: "#fff",
                                    color: "#6366f1",
                                    border: "1px solid #6366f1",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    fontSize: 13,
                                  }}
                                >
                                  View All
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
