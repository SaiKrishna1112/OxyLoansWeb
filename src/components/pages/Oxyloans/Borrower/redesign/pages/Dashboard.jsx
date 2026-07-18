import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import {Modal,Button} from "react-bootstrap";

// Header/Footer/Sidebar imports from standard codebase
import BorrowerHeader from "../../../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../../../SideBar/BorrowerSidebar";
import Footer from "../../../../../Footer/Footer";

// Redesign Component imports
import LoanProgress from "../components/LoanProgress";
import LoanSummary from "../components/LoanSummary";
import QuickActions from "../components/QuickActions";
import Timeline from "../components/Timeline";
import EmptyState from "../components/EmptyState";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

// HTTP Requests from codebase
import { 
  base_url, 
  getLenderListNearByRedius1, 
  getListOfBorrowerLoansInitiated, 
  getDisbursementAmount, 
  getBorrowerEligibleAmount, 
  getBorrowerRequestAmount 
} from "../../../../../HttpRequest/afterlogin";

// Leaflet Map Imports
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../redesign.css";

const LENDER_PIN_COLOR = "#0040e0";
const PRIMARY = "#0040e0";

const createLenderPinIcon = () =>
  L.divIcon({
    className: "custom-map-pin-wrapper",
    html: `
      <div class="custom-map-pin" style="--pin-color:${LENDER_PIN_COLOR}">
        <div class="pin-circle" style="background: linear-gradient(135deg, #0040e0 0%, #2e5bff 100%); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); width: 28px; height: 28px; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" style="transform: rotate(45deg);">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 44],
    iconAnchor: [16, 42],
    popupAnchor: [0, -40],
  });

const lenderPinIcon = createLenderPinIcon();

const youLocationIcon = L.divIcon({
  className: "you-marker-outer",
  html: `
    <div class="you-marker-inner">
      <div class="you-pin-circle" style="background: linear-gradient(135deg, #006242 0%, #007d55 100%); border-radius: 50% 50% 50% 0; transform: rotate(-45deg); width: 34px; height: 34px; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="white" style="transform: rotate(45deg);">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [40, 54],
  iconAnchor: [20, 52],
  popupAnchor: [0, -50],
});

const MapFlyTo = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2) {
      map.flyTo(center, 13, { animate: true, duration: 0.8 });
    }
  }, [center, map]);
  return null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const getdashboardData = useSelector((data) => data.dashboard.fetchDashboard);
  const getreducerprofiledata = useSelector((data) => data.counter.userProfile);

  // States
  const [profileDetails, setProfileDetails] = useState(null);
  const [eligibleInfo, setEligibleInfo] = useState({ amount: 0, loading: true });
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [loanRequests, setLoanRequests] = useState([]);
  const [showCityModal, setShowCityModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");

  const [nearbyInfo, setNearbyInfo] = useState({
    apiData: [],
    loading: true,
    errorMessage: "",
  });
  const [selectedRadiusKm, setSelectedRadiusKm] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLenderId, setSelectedLenderId] = useState(null);

  const [loansData, setLoansData] = useState({ apiData: [], loading: true });
  const [disbursementData, setDisbursementData] = useState({ apiData: [], loading: true });

  const DISTANCE_OPTIONS = [
    { label: "All", value: "ALL" },
    { label: "5 km", value: 5 },
    { label: "10 km", value: 10 },
    { label: "25 km", value: 25 },
    { label: "50 km", value: 50 },
  ];

  useEffect(() => {
    document.body.classList.add("oxy-redesign-active");
    fetchProfile();
    fetchEligibleInfo();
    fetchNearbyLenders();
    fetchLoans();
    fetchDisbursement();

    return () => {
      document.body.classList.remove("oxy-redesign-active");
    };
  }, []);

  const fetchProfile = () => {
    axios
      .get(`${base_url}personal/${sessionStorage.getItem("userId")}`, {
        headers: {
          accessToken: sessionStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        setProfileDetails(response.data);
        if (response.data.city == null || response.data.city === "") {
          setShowCityModal(true);
        }
      })
      .catch((error) => {
        console.error("error", error);
      });
  };

  const fetchEligibleInfo = async () => {
    try {
      const [eligibleRes, requestRes] = await Promise.all([
        getBorrowerEligibleAmount(),
        getBorrowerRequestAmount(),
      ]);
      if (eligibleRes?.status === 200) {
        setEligibleInfo({ amount: Number(eligibleRes.data?.amount || 0), loading: false });
      } else {
        setEligibleInfo({ amount: 0, loading: false });
      }
      if (requestRes?.status === 200) {
        const list = Array.isArray(requestRes.data) ? requestRes.data : [];
        setLoanRequests(list);
        const active = list.some((r) => {
          const s = String(r?.loanRequestStatus || "").trim().toUpperCase();
          return s && s !== "CLOSED";
        });
        setHasActiveRequest(active);
      }
    } catch {
      setEligibleInfo({ amount: 0, loading: false });
    }
  };

  const fetchNearbyLenders = async () => {
    setNearbyInfo((prev) => ({ ...prev, loading: true, errorMessage: "" }));
    try {
      const response = await getLenderListNearByRedius1(1, 1000);
      if (response?.status === 200) {
        const pageData = Array.isArray(response?.data) ? response.data : [];
        const uniqueLenders = pageData.filter(
          (item, index, self) =>
            index === self.findIndex((c) => String(c?.lenderId) === String(item?.lenderId))
        );
        setNearbyInfo({
          apiData: uniqueLenders,
          loading: false,
          errorMessage: "",
        });
      } else {
        setNearbyInfo({
          apiData: [],
          loading: false,
          errorMessage: "Could not load nearby lenders",
        });
      }
    } catch (error) {
      setNearbyInfo({
        apiData: [],
        loading: false,
        errorMessage: "Failed to load nearby lenders",
      });
    }
  };

  const fetchLoans = () => {
    setLoansData((prev) => ({ ...prev, loading: true }));
    getListOfBorrowerLoansInitiated()
      .then((res) => {
        if (res.status === 200) {
          setLoansData({
            apiData: Array.isArray(res.data) ? res.data : [],
            loading: false,
          });
        } else {
          setLoansData({ apiData: [], loading: false });
        }
      })
      .catch(() => {
        setLoansData({ apiData: [], loading: false });
      });
  };

  const fetchDisbursement = () => {
    setDisbursementData((prev) => ({ ...prev, loading: true }));
    getDisbursementAmount()
      .then((res) => {
        if (res.status === 200) {
          setDisbursementData({
            apiData: Array.isArray(res.data) ? res.data : [],
            loading: false,
          });
        } else {
          setDisbursementData({ apiData: [], loading: false });
        }
      })
      .catch(() => {
        setDisbursementData({ apiData: [], loading: false });
      });
  };

  // Nearby Filter Math
  const safePageLenders = useMemo(() => {
    return nearbyInfo.apiData.filter(
      (item) =>
        Number.isFinite(Number(item?.lenderLat)) &&
        Number.isFinite(Number(item?.lenderLng)) &&
        Number.isFinite(Number(item?.distance))
    );
  }, [nearbyInfo.apiData]);

  const filteredLenders = useMemo(() => {
    let list = [...safePageLenders];
    if (selectedRadiusKm !== "ALL") {
      list = list.filter((item) => Number(item?.distance) <= Number(selectedRadiusKm));
    }
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      list = list.filter((item) => {
        const name = item?.lenderName ? String(item.lenderName).toLowerCase() : "";
        const id = item?.lenderId ? String(item.lenderId).toLowerCase() : "";
        return name.includes(query) || id.includes(query);
      });
    }
    return list.sort((a, b) => Number(a?.distance ?? Infinity) - Number(b?.distance ?? Infinity));
  }, [safePageLenders, selectedRadiusKm, searchQuery]);

  const borrowerSample = nearbyInfo.apiData?.[0] || {};
  const borrowerLat = Number(profileDetails?.latitude || borrowerSample?.borrowerLat);
  const borrowerLng = Number(profileDetails?.longitude || borrowerSample?.borrowerLng);
  const hasMapCoordinates = Number.isFinite(borrowerLat) && Number.isFinite(borrowerLng);
  const mapCenter = hasMapCoordinates ? [borrowerLat, borrowerLng] : [17.406498, 78.4772439];

  const selectedLenderPosition = useMemo(() => {
    if (!selectedLenderId) return null;
    const selected = filteredLenders.find((item) => String(item?.lenderId) === String(selectedLenderId));
    if (!selected) return null;
    const lat = Number(selected?.lenderLat);
    const lng = Number(selected?.lenderLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return [lat, lng];
  }, [filteredLenders, selectedLenderId]);

  const totalOutstanding = useMemo(() => {
    return disbursementData.apiData.reduce((sum, d) => sum + Number(d.outstandingAmount || 0), 0);
  }, [disbursementData.apiData]);

  const totalDisbursed = useMemo(() => {
    return disbursementData.apiData.reduce((sum, d) => sum + Number(d.disbursedAmount || 0), 0);
  }, [disbursementData.apiData]);

  const welcomeName = useMemo(() => {
    if (getreducerprofiledata?.firstName) {
      return getreducerprofiledata.firstName.charAt(0).toUpperCase() + getreducerprofiledata.firstName.slice(1).toLowerCase();
    }
    return "Borrower";
  }, [getreducerprofiledata]);

  const saveCity = () => {
    const userId = sessionStorage.getItem("userId");
    axios
      .post(`${base_url}${userId}/city`, { city: selectedCity }, {
        headers: { accessToken: sessionStorage.getItem("accessToken") },
      })
      .then(() => {
        localStorage.setItem("userCity", selectedCity);
        setShowCityModal(false);
        Swal.fire("Success", "City saved successfully", "success").then(() => {
          window.location.reload();
        });
      })
      .catch((error) => {
        Swal.fire("Error", error.response?.data?.errorMessage || "Failed to save city", "error");
      });
  };

  const currentStatusText = useMemo(() => {
    if (totalOutstanding > 0) return "Active Loan Repayments";
    if (loansData.apiData.length > 0) return "Offer Review Pending";
    if (hasActiveRequest) return "Matching Lenders";
    return "Application Phase";
  }, [totalOutstanding, loansData.apiData, hasActiveRequest]);

  // Generate activities list
  const recentActivitiesList = useMemo(() => {
    const list = [];
    if (profileDetails?.kycStatus) {
      list.push({ title: "KYC Completed Successfully", description: "Identity verification approved", time: "Verified Profile Status", type: "SUCCESS" });
    }
    if (hasActiveRequest) {
      list.push({ title: "Loan Application Initiated", description: "Request is broadcast to marketplace", time: "Active", type: "PENDING" });
    }
    if (loansData.apiData.length > 0) {
      list.push({ title: `Received Bids from Lenders`, description: `Total matching offers count: ${loansData.apiData.length}`, time: "Offer matching stage", type: "APPROVED" });
    }
    if (totalDisbursed > 0) {
      list.push({ title: "Loan Disbursed", description: "Funds successfully deposited in bank", time: "Disbursed", type: "SUCCESS" });
    }
    return list;
  }, [profileDetails, hasActiveRequest, loansData.apiData, totalDisbursed]);

  return (
    <>
      <div className="main-wrapper">
        <BorrowerHeader />
        <BorrowerSidebar />
        <div className="page-wrapper">
          <div className="content container-fluid py-4" style={{ backgroundColor: "var(--oxy-background)" }}>
            
            {/* Redesigned Welcome Hero */}
            <div className="oxy-hero-card d-flex justify-content-between align-items-center flex-wrap mb-4">
              <div>
                <h2 className="fw-bold mb-2 text-white">Welcome Back, {welcomeName}! 👋</h2>
                <p className="opacity-95 mb-0" style={{ maxWidth: "480px" }}>
                  Manage your credit line, review proposals from verified local lenders, and monitor repayments instantly.
                </p>
              </div>
              <div className="mt-3 mt-md-0 d-flex gap-2" style={{ position: "relative", zIndex: 2 }}>
                {eligibleInfo.amount > 0 && !hasActiveRequest ? (
                  <Link to="/borrowerLoanRequestCreate" className="btn btn-light text-primary fw-bold px-4 py-2 rounded-3 text-decoration-none">
                    Apply Now →
                  </Link>
                ) : (
                  <Link to="/borrowerLoansInitiated" className="btn btn-light text-primary fw-bold px-4 py-2 rounded-3 text-decoration-none">
                    View Proposals
                  </Link>
                )}
              </div>
            </div>

            <LoanProgress 
              profileDetails={profileDetails}
              loans={loansData.apiData}
              loanRequests={loanRequests}
              disbursementCount={disbursementData.apiData.length}
              hasActiveRequest={hasActiveRequest}
            />

            {/* Loan Portfolio Overview strip */}
            {/* <LoanSummary 
              requestedAmount={hasActiveRequest ? eligibleInfo.amount : 0}
              eligibleAmount={eligibleInfo.amount}
              disbursedAmount={totalDisbursed}
              outstandingBalance={totalOutstanding}
              roi={loansData.apiData?.[0]?.roi || 12}
              tenure={loansData.apiData?.[0]?.duration || 180}
              loading={eligibleInfo.loading}
            /> */}

            {/* Quick Actions grid shortcuts */}
            <QuickActions />

            {/* Bento Grid */}
            <div className="row g-4">
              {/* Next Best Action Card & Recent Activity */}
              {/* <div className="col-lg-7">
                <div className="oxy-card h-100 d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="fw-bold mb-4 text-dark">
                      <i className="fa-solid fa-bolt text-warning me-2"></i>
                      Next Recommended Action
                    </h5>
                    
                    <div className="p-4 rounded-3 d-flex align-items-start gap-3 mb-4" style={{ backgroundColor: "var(--oxy-surface-low)" }}>
                      <div className="p-3 bg-white rounded-3 text-primary shadow-sm" style={{ flexShrink: 0 }}>
                        <i className="fa-solid fa-file-invoice fa-lg"></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1">
                          {profileDetails?.kycStatus !== true 
                            ? "Complete KYC & Aadhaar Verification" 
                            : loansData.apiData.length > 0 
                            ? "Review Received Proposals" 
                            : "Set Up Auto-Pay Mandate"}
                        </h6>
                        <p className="text-muted small mb-3">
                          {profileDetails?.kycStatus !== true 
                            ? "Provide pan and identity details to complete your file verification." 
                            : loansData.apiData.length > 0 
                            ? "Compare interests, accept a bid, and execute agreements online." 
                            : "Configure eNACH auto-pay to handle EMIs without penalties."}
                        </p>
                        
                        <button 
                          className="oxy-btn-primary py-2 px-3 text-xs" 
                          onClick={() => {
                            if (profileDetails?.kycStatus !== true) navigate("/borrowerProfile");
                            else if (loansData.apiData.length > 0) navigate("/borrowerLoansInitiated");
                            else navigate("/my-marketplace-loans");
                          }}
                        >
                          Get Started →
                        </button>
                      </div>
                    </div>

                    <h5 className="fw-bold mb-3 text-dark">Current Application Status</h5>
                    <div className="d-flex justify-content-between align-items-center p-3 border rounded-3 mb-3 bg-white">
                      <div>
                        <span className="text-muted d-block small">Phase</span>
                        <span className="fw-bold text-dark">{currentStatusText}</span>
                      </div>
                      <span className="badge bg-success-light text-success rounded-pill px-3 py-2 fw-semibold">
                        Active Tracker
                      </span>
                    </div>
                  </div>
                </div>
              </div> */}

              {/* Recent Activity Timeline card */}
              {/* <div className="col-lg-5">
                <div className="oxy-card h-100">
                  <h5 className="fw-bold mb-4 text-dark">
                    <i className="fa-solid fa-clock-rotate-left text-primary me-2"></i>
                    Recent Timeline Events
                  </h5>
                  <Timeline activities={recentActivitiesList} />
                </div>
              </div> */}
            </div>

            {/* Map visualizer for nearby lenders */}
            <div className="row mt-4">
              <div className="col-12">
                <div className="oxy-card">
                  <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <div>
                      <h5 className="fw-bold mb-1 text-dark">
                        <i className="fa-solid fa-location-crosshairs text-primary me-2"></i>
                        Find Nearby Lenders
                      </h5>
                      <span className="text-muted small">Connect with verified lenders in your local area for fast offline quotes.</span>
                    </div>
                    <Link to="/nearbyleders" className="btn btn-sm btn-link text-primary fw-bold text-decoration-none">
                      Full Screen Map <i className="fa-solid fa-arrow-right ms-1"></i>
                    </Link>
                  </div>

                  <div className="row g-3">
                    <div className="col-lg-8">
                      {hasMapCoordinates ? (
                        <div style={{ height: "400px", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                          <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={false} style={{ height: "100%" }}>
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapFlyTo center={selectedLenderPosition} />
                            
                            <Marker position={[borrowerLat, borrowerLng]} icon={youLocationIcon}>
                              <Popup><strong>You are here</strong></Popup>
                            </Marker>
                            
                            {selectedRadiusKm !== "ALL" && (
                              <Circle center={[borrowerLat, borrowerLng]} radius={selectedRadiusKm * 1000} pathOptions={{ color: "#0040e0", fillOpacity: 0.05 }} />
                            )}

                            {filteredLenders.map((lender, index) => {
                              const lat = Number(lender.lenderLat);
                              const lng = Number(lender.lenderLng);
                              if (isNaN(lat) || isNaN(lng)) return null;
                              return (
                                <Marker 
                                  key={index} 
                                  position={[lat, lng]} 
                                  icon={lenderPinIcon}
                                  eventHandlers={{
                                    click: () => setSelectedLenderId(lender.lenderId),
                                  }}
                                >
                                  <Popup>
                                    <div className="p-1">
                                      <span className="fw-bold d-block text-primary">{lender.lenderName}</span>
                                      <span className="small text-muted d-block">Distance: {Number(lender.distance).toFixed(2)} km</span>
                                    </div>
                                  </Popup>
                                </Marker>
                              );
                            })}
                          </MapContainer>
                        </div>
                      ) : (
                        <div className="alert alert-warning py-4 text-center">
                          <i className="fa-solid fa-triangle-exclamation fa-2x mb-3 text-warning"></i>
                          <h6>Map Coordinates Incomplete</h6>
                          <p className="text-muted small mb-0">Update your Profile city or state details to access regional listings.</p>
                        </div>
                      )}
                    </div>

                    <div className="col-lg-4">
                      <div className="d-flex flex-column h-100" style={{ maxHeight: "400px" }}>
                        {/* <div className="mb-3">
                          <input 
                            type="text" 
                            className="form-control form-control-sm rounded-pill px-3" 
                            placeholder="Filter lenders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div> */}
                        <div className="overflow-auto flex-grow-1 border rounded-3 p-2 bg-light">
                          {filteredLenders.length === 0 ? (
                            <div className="text-center text-muted py-5 small">No matches found.</div>
                          ) : (
                            filteredLenders.map((l, i) => (
                              <div 
                                className={`p-2 rounded-2 mb-2 cursor-pointer border ${selectedLenderId === l.lenderId ? "border-primary bg-primary bg-opacity-10" : "bg-white"}`} 
                                key={i}
                                onClick={() => setSelectedLenderId(l.lenderId)}
                                style={{ cursor: "pointer" }}
                              >
                                <span className="fw-bold d-block text-dark text-truncate" style={{ fontSize: "12px" }}>{l.lenderName || "Lender"}</span>
                                <span className="text-muted small" style={{ fontSize: "10px" }}>Distance: {Number(l.distance).toFixed(2)} km</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* City Modal */}
      <Modal show={showCityModal} backdrop="static" keyboard={false} centered>
        <Modal.Header>
          <Modal.Title>Update City Location</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small">Please select your primary residential city to access nearby borrower/lender matches.</p>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Enter city name"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={saveCity} disabled={!selectedCity.trim()}>
            Save Location
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Dashboard;
