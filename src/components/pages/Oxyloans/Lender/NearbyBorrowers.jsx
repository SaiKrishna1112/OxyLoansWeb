import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getNearbyBorrowers } from "../../../HttpRequest/afterlogin";
import Header from "../../../Header/Header";
import Sidebar from "../../../SideBar/SideBar";

function OxyScoreBadge({ score }) {
  if (!score) return <span className="badge bg-secondary">No Score</span>;
  if (score >= 700) return <span className="badge bg-success">OxyScore {score}</span>;
  if (score >= 500) return <span className="badge bg-warning text-dark">OxyScore {score}</span>;
  return <span className="badge bg-danger">OxyScore {score}</span>;
}

export default function NearbyBorrowers() {
  const navigate = useNavigate();
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locationError, setLocationError] = useState("");
  const [radiusKm, setRadiusKm] = useState(50);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocationError("Location access denied. Enter coordinates manually or allow browser location.")
      );
    } else {
      setLocationError("Geolocation not supported by your browser.");
    }
  }, []);

  const search = useCallback(async () => {
    if (!location.lat || !location.lng) {
      setError("Location is required. Please allow browser location access.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await getNearbyBorrowers(location.lat, location.lng, radiusKm);
      setBorrowers(res?.data || []);
      setSearched(true);
    } catch (e) {
      setError("Failed to fetch nearby borrowers.");
    } finally {
      setLoading(false);
    }
  }, [location, radiusKm]);

  useEffect(() => {
    if (location.lat && location.lng) {
      search();
    }
  }, [location]);

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
                  <h3 className="page-title">Nearby Borrowers</h3>
                  <p className="text-muted">Find borrowers near your location who have active marketplace loan requests.</p>
                </div>
              </div>
            </div>

            {/* Location & Radius Controls */}
            <div className="card mb-3">
              <div className="card-body">
                <div className="row align-items-center g-3">
                  <div className="col-md-3">
                    <label className="form-label fw-bold">Your Location</label>
                    {location.lat ? (
                      <div className="text-success small">
                        <i className="fa fa-location-dot me-1" />
                        {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                      </div>
                    ) : (
                      <div className="text-warning small">
                        <i className="fa fa-spinner fa-spin me-1" />
                        {locationError || "Detecting location..."}
                      </div>
                    )}
                  </div>
                  <div className="col-md-5">
                    <label className="form-label fw-bold">
                      Search Radius: <strong className="text-primary">{radiusKm} km</strong>
                    </label>
                    <input
                      type="range"
                      className="form-range"
                      min={10}
                      max={200}
                      step={10}
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(Number(e.target.value))}
                    />
                    <div className="d-flex justify-content-between">
                      <small className="text-muted">10 km</small>
                      <small className="text-muted">200 km</small>
                    </div>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <button
                      className="btn btn-primary"
                      onClick={search}
                      disabled={loading || !location.lat}
                    >
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2" />Searching...</>
                      ) : (
                        <><i className="fa fa-search me-1" />Search {radiusKm} km</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {/* Manual lat/lng fallback */}
            {locationError && (
              <div className="card border-warning mb-3">
                <div className="card-body py-2">
                  <p className="mb-2 text-warning fw-bold">
                    <i className="fa fa-triangle-exclamation me-1" /> Location not detected automatically
                  </p>
                  <div className="row g-2">
                    <div className="col-5">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Latitude (e.g. 17.385)"
                        step="0.001"
                        onChange={(e) => setLocation((p) => ({ ...p, lat: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div className="col-5">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="Longitude (e.g. 78.487)"
                        step="0.001"
                        onChange={(e) => setLocation((p) => ({ ...p, lng: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div className="col-2">
                      <button className="btn btn-sm btn-warning w-100" onClick={search}>Go</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {searched && !loading && (
              <div>
                <h5 className="mb-3">
                  {borrowers.length === 0
                    ? `No borrowers found within ${radiusKm} km`
                    : `${borrowers.length} borrower${borrowers.length > 1 ? "s" : ""} found within ${radiusKm} km`}
                </h5>

                {borrowers.length === 0 ? (
                  <div className="card">
                    <div className="card-body text-center py-5">
                      <i className="fa fa-users-slash fa-3x text-muted mb-3" />
                      <p className="text-muted">
                        No active borrowers near you. Try increasing the radius or check back later.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="row g-3">
                    {borrowers.map((b) => (
                      <div key={b.userId} className="col-md-4 col-lg-3">
                        <div className="card h-100 border-0 shadow-sm">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <div className="fw-bold text-truncate" style={{ maxWidth: 150 }}>
                                  {b.name || `Borrower #${b.userId}`}
                                </div>
                                <small className="text-muted">
                                  <i className="fa fa-location-dot me-1" />
                                  {b.city || "Unknown location"}
                                </small>
                              </div>
                              <OxyScoreBadge score={b.oxyScore} />
                            </div>

                            <div className="mt-2 mb-3">
                              <span className="badge bg-primary fs-6">
                                <i className="fa fa-road me-1" />
                                {b.distanceKm != null ? `${Number(b.distanceKm).toFixed(1)} km away` : "Nearby"}
                              </span>
                            </div>

                            {b.pinCode && (
                              <div className="text-muted small mb-2">
                                <i className="fa fa-map-pin me-1" />PIN: {b.pinCode}
                              </div>
                            )}

                            <button
                              className="btn btn-sm btn-outline-primary w-100"
                              onClick={() => navigate("/marketplace-loans")}
                            >
                              View Their Loans
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!searched && !loading && location.lat && (
              <div className="text-center py-4 text-muted">
                <i className="fa fa-magnifying-glass-location fa-2x mb-2" />
                <p>Searching for nearby borrowers...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
