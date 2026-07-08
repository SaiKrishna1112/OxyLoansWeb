import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMarketplaceLoans } from "../../../HttpRequest/afterlogin";
import Header from "../../../Header/Header";
import Sidebar from "../../../SideBar/SideBar";
import FundingProgressBar from "./FundingProgressBar";
import OxyScoreCard from "./OxyScoreCard";

function OxyScoreBadge({ score }) {
  if (score >= 700) return <span className="badge bg-success">OxyScore {score}</span>;
  if (score >= 500) return <span className="badge bg-warning text-dark">OxyScore {score}</span>;
  return <span className="badge bg-danger">OxyScore {score || "N/A"}</span>;
}

function formatIndian(num) {
  return Number(num).toLocaleString("en-IN");
}

export default function OpenMarketLoanListings() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [radiusKm, setRadiusKm] = useState(50);
  const [pincode, setPincode] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filterPurpose, setFilterPurpose] = useState("");
  const [sortBy, setSortBy] = useState("distance");
  const [expandedScore, setExpandedScore] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const fetchLoans = useCallback(async (pageNum = 0) => {
    setLoading(true);
    setError("");
    try {
      const res = await getMarketplaceLoans(location.lat, location.lng, radiusKm, pageNum, 20);
      const data = res?.data || [];
      if (pageNum === 0) {
        setLoans(data);
      } else {
        setLoans((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === 20);
    } catch (e) {
      console.error("❌ Failed to fetch loans:", e);
      const status = e?.response?.status;
      const msg = e?.response?.data?.message
        || e?.response?.data?.error
        || e?.message
        || "Failed to load loan listings.";

      if (status === 401) {
        setError(`⚠️ Authentication Error (401): Your session may have expired. ${msg}`);
      } else if (status === 403) {
        setError(`⚠️ Permission Denied (403): You don't have access to this feature. ${msg}`);
      } else if (status === 404) {
        setError(`⚠️ Not Found (404): Marketplace endpoint not available. ${msg}`);
      } else {
        setError(`❌ API Error: ${msg} (Status: ${status || "no response"})`);
      }
    } finally {
      setLoading(false);
    }
  }, [location.lat, location.lng, radiusKm]);

  useEffect(() => {
    setPage(0);
    fetchLoans(0);
  }, [fetchLoans]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLoans(nextPage);
  };

  const filtered = loans.filter((l) =>
    !filterPurpose || (l.loanPurpose && l.loanPurpose.toLowerCase().includes(filterPurpose.toLowerCase()))
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "amount") return b.loanAmount - a.loanAmount;
    if (sortBy === "rate") return (a.preferredMinRate || 0) - (b.preferredMinRate || 0);
    return (a.distanceKm || 9999) - (b.distanceKm || 9999);
  });

  return (
    <div className="main-wrapper">
      <Sidebar />
      <div style={{ flex: 1 }}>
      <Header />
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title">Marketplace Loan Listings</h3>
              <ul className="breadcrumb">
                <li className="breadcrumb-item">Lender</li>
                <li className="breadcrumb-item active">Browse Loan Requests</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Location & Filters */}
        <div className="card mb-3">
          <div className="card-body">
            <div className="row align-items-end">
              <div className="col-md-4">
                {location.lat ? (
                  <div className="text-success mb-2">
                    <i className="fe fe-map-pin me-1"></i>
                    Location detected — showing loans within {radiusKm} km
                  </div>
                ) : (
                  <div>
                    <label className="form-label">Enter Pincode (location fallback)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 500001"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <div className="col-md-3">
                <label className="form-label">Search Radius: <strong>{radiusKm} km</strong></label>
                <input
                  type="range"
                  className="form-range"
                  min={10}
                  max={500}
                  step={10}
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Filter Purpose</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Medical"
                  value={filterPurpose}
                  onChange={(e) => setFilterPurpose(e.target.value)}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Sort By</label>
                <select className="form-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="distance">Distance</option>
                  <option value="amount">Amount</option>
                  <option value="rate">Rate</option>
                </select>
              </div>
              <div className="col-md-1">
                <button className="btn btn-primary w-100" onClick={() => fetchLoans(0)}>Go</button>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading && page === 0 ? (
          <div className="row">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="col-md-4 mb-3">
                <div className="card">
                  <div className="card-body">
                    <div className="placeholder-glow">
                      <span className="placeholder col-6"></span>
                      <span className="placeholder col-4 ms-2"></span>
                      <span className="placeholder col-12 mt-2"></span>
                      <span className="placeholder col-8 mt-2"></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-5">
            <h5 className="text-muted">No loan requests found within {radiusKm} km</h5>
            <p className="text-muted">Try increasing the search radius or check back later.</p>
          </div>
        ) : (
          <>
            <div className="row">
              {sorted.map((loan) => (
                <div key={loan.loanRequestId} className="col-md-4 mb-3">
                  <div className="card h-100 border">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="text-primary mb-0">₹{formatIndian(loan.loanAmount)}</h5>
                        <OxyScoreBadge score={loan.oxyScore} />
                      </div>
                      <span className="badge bg-secondary mb-2">{loan.loanPurpose || "—"}</span>
                      <p className="mb-1 text-muted small">
                        <i className="fe fe-clock me-1"></i>{loan.durationMonths} months
                      </p>
                      <p className="mb-1 text-muted small">
                        <i className="fe fe-percent me-1"></i>
                        {loan.preferredMinRate || "?"}% – {loan.preferredMaxRate || "?"}%
                      </p>
                      <p className="mb-1 text-muted small">
                        <i className="fe fe-map-pin me-1"></i>
                        {loan.locality ? `${loan.locality}, ` : ""}{loan.city || "—"}, {loan.state || ""}
                      </p>
                      {loan.distanceKm != null && (
                        <p className="mb-2 text-muted small">
                          <i className="fe fe-navigation me-1"></i>{loan.distanceKm.toFixed(1)} km away
                        </p>
                      )}
                      <FundingProgressBar loanRequestId={loan.loanRequestId} />
                      {expandedScore === loan.loanRequestId && (
                        <div className="mt-2">
                          <OxyScoreCard borrowerUserId={loan.borrowerUserId} />
                        </div>
                      )}
                      <div className="d-flex gap-2 mt-2 flex-wrap">
                        <button
                          className="btn btn-sm btn-success flex-grow-1"
                          onClick={() => navigate(`/negotiation/${loan.loanRequestId}`)}
                        >
                          Make Offer
                        </button>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/negotiation/${loan.loanRequestId}`)}
                        >
                          Details
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setExpandedScore(
                            expandedScore === loan.loanRequestId ? null : loan.loanRequestId
                          )}
                        >
                          {expandedScore === loan.loanRequestId ? "Hide Score" : "OxyScore"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-3">
                <button className="btn btn-outline-primary" onClick={handleLoadMore} disabled={loading}>
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </div>
    </div>
  );
}
