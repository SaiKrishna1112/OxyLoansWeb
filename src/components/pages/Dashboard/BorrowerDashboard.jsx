import React, { useState, useEffect, useMemo } from "react";
import Chart from "react-apexcharts";
import BorrowerHeader from "../../Header/BorrowerHeader";
import BorrowerSidebar from "../../SideBar/BorrowerSidebar";
import ReactApexChart from "react-apexcharts";
import FloatingAssistant from "../../FloatingAssistant";
import logo from "../../../assets/img/avtarimage.png";

import { Link } from "react-router-dom";
import "../Oxyloans/Lender/table.css";
import { invoicesicon5 } from "../../imagepath";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import axios from "axios";
import { base_url, getLenderListNearByRedius1, getMyOxyScore } from "../../HttpRequest/afterlogin";
import Swal from "sweetalert2";
import {
  dashboard1,
  dashboard2,
  dashboard3,
  dashboard4,
} from "../../imagepath";
import Footer from "../../Footer/Footer";

import { personalDetails } from "../Base UI Elements/SweetAlert";

// Antd and Leaflet imports for OxyScore and Map visualizer
import { Progress, Tag } from "antd";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const LENDER_PIN_COLOR = "#2563eb";
const BORROWER_MARKER_COLOR = "#16a34a";
const PRIMARY = "#3d5ee1";

const createLenderPinIcon = () =>
  L.divIcon({
    className: "custom-map-pin-wrapper",
    html: `
      <div class="custom-map-pin" style="--pin-color:${LENDER_PIN_COLOR}">
        <div class="pin-circle">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </div>
        <span class="pin-tail"></span>
        <span class="pin-glow"></span>
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
      <div class="you-pin-circle">
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
        </svg>
      </div>
      <span class="you-pin-tail"></span>
      <span class="you-pin-glow"></span>
    </div>
  `,
  iconSize: [54, 70],
  iconAnchor: [27, 68],
  popupAnchor: [0, -64],
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

const getGenderType = (person) => {
  const rawGender = (
    person?.gender ||
    person?.sex ||
    person?.lenderGender ||
    person?.borrowerGender ||
    ""
  )
    .toString()
    .toLowerCase()
    .trim();

  if (rawGender.startsWith("m")) return "male";
  if (rawGender.startsWith("f")) return "female";
  return "unknown";
};

const scoreColor = (score) => {
  if (!score) return "#d9d9d9";
  if (score >= 800) return "#52c41a";
  if (score >= 650) return "#faad14";
  if (score >= 500) return "#fa8c16";
  return "#ff4d4f";
};

const scoreBand = (score) => {
  if (!score) return { label: "N/A", antColor: "default" };
  if (score >= 800) return { label: "Excellent", antColor: "success" };
  if (score >= 650) return { label: "Good",      antColor: "warning" };
  if (score >= 500) return { label: "Fair",       antColor: "orange"  };
  return               { label: "Poor",            antColor: "error"   };
};

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const SCORE_MAX = 1000;

const BorrowerDashboard = () => {
  const dispatch = useDispatch();
  const getdashboardData = useSelector((data) => data.dashboard.fetchDashboard);
  const getreducerprofiledata = useSelector((data) => data.counter.userProfile);
  const [show, setShow] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCityerror, setSelectedCityerror] = useState(false);
  const [profileDetails, setProfileDetails] = useState();
  const [customCity, setCustomCity] = useState("");

  const navigate = useNavigate();

  // OxyScore state
  const [scoreData, setScoreData] = useState(null);
  const [scoreLoading, setScoreLoading] = useState(true);

  // Nearby Lenders state
  const [nearbyInfo, setNearbyInfo] = useState({
    apiData: [],
    loading: true,
    errorMessage: "",
  });
  const [selectedRadiusKm, setSelectedRadiusKm] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLenderId, setSelectedLenderId] = useState(null);

  // OxyScore breakdown bar chart configuration
  const [breakdownChartData, setBreakdownChartData] = useState({
    series: [
      {
        name: "Your Points",
        data: [0, 0, 0, 0, 0],
      },
      {
        name: "Remaining Potential",
        data: [600, 50, 200, 150, 50],
      }
    ],
    options: {
      chart: {
        type: "bar",
        height: 260,
        stacked: true,
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: "55%",
          borderRadius: 4,
        },
      },
      colors: ["#3d5ee1", "#e2e8f0"],
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        categories: [
          "CIBIL Factor (600)",
          "Profile Bonus (50)",
          "Income Component (200)",
          "Employment Factor (150)",
          "Credit History (50)"
        ],
        max: 600,
      },
      legend: {
        show: true,
        position: "top",
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + " points";
          }
        }
      }
    }
  });

  const DISTANCE_OPTIONS = [
    { label: "All", value: "ALL" },
    { label: "5 km", value: 5 },
    { label: "10 km", value: 10 },
    { label: "25 km", value: 25 },
    { label: "50 km", value: 50 },
    { label: "100 km", value: 100 },
  ];
  useEffect(() => {
    getCall();
    loadOxyScore();
    fetchNearbyLenders();
  }, []);

  const loadOxyScore = () => {
    setScoreLoading(true);
    getMyOxyScore()
      .then((res) => {
        if (res.status === 200) {
          setScoreData(res.data);
        }
      })
      .catch((err) => console.log("Error loading OxyScore:", err))
      .finally(() => setScoreLoading(false));
  };

  const fetchNearbyLenders = async () => {
    setNearbyInfo((prev) => ({ ...prev, loading: true, errorMessage: "" }));
    try {
      const response = await getLenderListNearByRedius1(1, 100);
      if (response?.status === 200) {
        const pageData = Array.isArray(response?.data) ? response.data : [];
        const uniqueLenders = pageData.filter(
          (item, index, self) =>
            index ===
            self.findIndex(
              (candidate) =>
                String(candidate?.lenderId) === String(item?.lenderId),
            ),
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

  useEffect(() => {
    if (scoreData?.breakdown) {
      const breakdown = scoreData.breakdown;
      setBreakdownChartData((prev) => ({
        ...prev,
        series: [
          {
            name: "Your Points",
            data: [
              breakdown.cibilComponent || 0,
              breakdown.profileBonus || 0,
              breakdown.incomeComponent || 0,
              breakdown.employmentComponent || 0,
              breakdown.loanCountComponent || 0,
            ],
          },
          {
            name: "Remaining Potential",
            data: [
              600 - (breakdown.cibilComponent || 0),
              50 - (breakdown.profileBonus || 0),
              200 - (breakdown.incomeComponent || 0),
              150 - (breakdown.employmentComponent || 0),
              50 - (breakdown.loanCountComponent || 0),
            ]
          }
        ]
      }));
    } else {
      setBreakdownChartData((prev) => ({
        ...prev,
        series: [
          {
            name: "Your Points (Mock)",
            data: [0, 10, 0, 0, 0],
          },
          {
            name: "Remaining Potential",
            data: [600, 40, 200, 150, 50],
          }
        ]
      }));
    }
  }, [scoreData]);

  const profileCompletionPct = useMemo(() => {
    if (!getreducerprofiledata) return 0;
    const fields = [
      getreducerprofiledata.firstName,
      getreducerprofiledata.lastName,
      getreducerprofiledata.panNumber,
      getreducerprofiledata.aadharNumber,
      getreducerprofiledata.city,
      getreducerprofiledata.state,
      getreducerprofiledata.address || getreducerprofiledata.residenceAddress,
      getreducerprofiledata.whatsAppNumber || getreducerprofiledata.mobileNumber,
    ];
    const filledFields = fields.filter((f) => f && String(f).trim() !== "" && String(f) !== "0");
    return Math.round((filledFields.length / fields.length) * 100);
  }, [getreducerprofiledata]);

  const hasReferrer = useMemo(() => {
    return getreducerprofiledata?.referredBy && 
           getreducerprofiledata?.referredBy !== "0" && 
           getreducerprofiledata?.referredBy !== 0;
  }, [getreducerprofiledata]);

  const hasCibilUploaded = useMemo(() => {
    return !!(scoreData?.cibilScore && scoreData.cibilScore > 0);
  }, [scoreData]);

  const safePageLenders = useMemo(() => {
    return nearbyInfo.apiData.filter(
      (item) =>
        Number.isFinite(Number(item?.lenderLat)) &&
        Number.isFinite(Number(item?.lenderLng)) &&
        Number.isFinite(Number(item?.distance)),
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

  const hasMapCoordinates = useMemo(() => {
    return Number.isFinite(borrowerLat) && Number.isFinite(borrowerLng);
  }, [borrowerLat, borrowerLng]);

  const mapCenter = useMemo(() => {
    return hasMapCoordinates
      ? [borrowerLat, borrowerLng]
      : [17.406498, 78.4772439];
  }, [borrowerLat, borrowerLng, hasMapCoordinates]);

  const selectedLenderPosition = useMemo(() => {
    if (!selectedLenderId) return null;
    const selected = filteredLenders.find(
      (item) => String(item?.lenderId) === String(selectedLenderId),
    );
    if (!selected) return null;
    const lat = Number(selected?.lenderLat);
    const lng = Number(selected?.lenderLng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return [lat, lng];
  }, [filteredLenders, selectedLenderId]);

   const getCall = () => {
    axios
      .get(`${base_url}personal/${sessionStorage.getItem("userId")}`, {
        headers: {
          accessToken: sessionStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        // console.log("response", response);
        setProfileDetails(response.data);
        if (
          response?.data?.latitude == null ||
          response?.data?.longitude == null
        ) {
          triggerSavingGoogleDistance(
            response?.data?.userId || sessionStorage.getItem("userId"),
          );
        }
        if (response.data.city == null || response.data.city == "") {
          setShow(true);
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const triggerSavingGoogleDistance = async (userId) => {
    try {
      await axios.post(
        `${base_url}savingGoogleDistance`,
        {
          userId: String(userId),
        },
        {
          headers: {
            accessToken: sessionStorage.getItem("accessToken"),
          },
        },
      );
    } catch (error) {
      // Silent background call - no user popup required.
      console.log("savingGoogleDistance api failed", error);
    }
  };

  const handleCityChange = (event) => {
    if (event.target.value.trim() === "") {
      setSelectedCityerror(true);
    } else {
      setSelectedCityerror(false);
    }
    setSelectedCity(event.target.value);
  };

  const handleSave = () => {
    console.log("Selected city:", selectedCity);
    const userId = sessionStorage.getItem("userId");
    console.log("User ID:", userId);
    // handleClose();
    if (selectedCity != "Others") {
      var data = {
        city: selectedCity,
      };
    } else {
      var data = {
        city: customCity,
      };
    }
    var data = {
      city: selectedCity,
    };
    axios
      .post(`${base_url}${userId}/city`, data, {
        headers: {
          accessToken: sessionStorage.getItem("accessToken"),
        },
      })
      .then(function (response) {
        console.log("City saved successfully:", response.data);
        localStorage.setItem("userCity", selectedCity);
        setShow(false);
        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "City updated successfully.",
            confirmButtonText: "OK",
          });
          handleClose();
        }
        window.location.reload(); // Reload the page to reflect changes
        // Close the modal after saving
        setSelectedCity(""); // Reset the selected city
      })
      .catch(function (error) {
        console.error("Error saving city:", error.response);
        if (error.response.status == 401) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.response.data.errorMessage,
            confirmButtonText: "Go to Login",
          }).then((result) => {
            if (result.isConfirmed) {
              navigate("/");
            }
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.response.data.errorMessage,
            confirmButtonText: "OK",
          });
        }
      });
  };

  return (
    <>
      <div className="main-wrapper">
        {/* Header */}
        <BorrowerHeader />

        {/* Sidebar */}
        <BorrowerSidebar />

        {/* Page Wrapper */}
        <div className="page-wrapper">
          <div className="content container-fluid">
            {/* Page Header */}
            <div className="page-header">
              <div className="row">
                <div className="col-sm-12">
                  <div className="page-sub-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <h3 className="page-title">
                        Welcome {""}
                        {getreducerprofiledata?.firstName
                          ? getreducerprofiledata.firstName.charAt(0).toUpperCase() +
                            getreducerprofiledata.firstName.slice(1).toLowerCase()
                          : ""}
                      </h3>
                      <p>Track your loan requests, offers, and repayments</p>
                      {/* <ul className="breadcrumb">
                        <li className="breadcrumb-item active">
                          <Link to="/borrowerDashboard">Home</Link>
                        </li>
                        <li className="breadcrumb-item">
                          {" "}
                          <Link to="/borrowerDashboard">Dashboard</Link>
                        </li>
                      </ul> */}
                    </div>
                    {/* <Link to="/borrower-analytics">
                      <button
                        style={{
                          padding: "6px 16px",
                          borderRadius: 8,
                          background: "#6366f1",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        Analytics
                      </button>
                    </Link> */}
                  </div>
                </div>
              </div>
            </div>

           

            {/* /Page Header */}
            {/* Overview Section */}
            <div className="row">
              <div className="col-xl-3 col-sm-6 col-12 d-flex">
                <div className="card bg-comman w-100">
                  <div className="card-body">
                    <div className="db-widgets d-flex justify-content-between align-items-center">
                      <div className="db-info">
                        <h6>Applications</h6>
                        <h3>
                          {getreducerprofiledata?.length !== 0
                            ? getreducerprofiledata?.lenderWalletAmount -
                              getreducerprofiledata?.holdAmountInDealParticipation -
                              getreducerprofiledata?.equityAmount
                            : ""}
                        </h3>
                      </div>
                      <div className="db-icon">
                        <img
                          src={dashboard3}
                          alt="Dashboard Icon"
                          height={60}
                          width={60}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-sm-6 col-12 d-flex">
                <div className="card bg-comman w-100">
                  <div className="card-body">
                    <div className="db-widgets d-flex justify-content-between align-items-center">
                      <div className="db-info">
                        <h6>Active </h6>
                        <h3>
                          {getdashboardData?.length !== 0
                            ? (getdashboardData?.numberOfActiveDealsCount ?? 0)
                            : ""}
                        </h3>
                      </div>
                      <div className="db-icon">
                        <img
                          src={dashboard2}
                          alt="Dashboard Icon"
                          height={60}
                          width={60}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-sm-6 col-12 d-flex">
                <div className="card bg-comman w-100">
                  <div className="card-body">
                    <div className="db-widgets d-flex justify-content-between align-items-center">
                      <div className="db-info">
                        <h6>Closed </h6>
                        <h3>
                          {getdashboardData?.length !== 0
                            ? (getdashboardData?.numberOfClosedDealsCount ?? 0)
                            : ""}
                        </h3>
                      </div>
                      <div className="db-icon">
                        <img
                          src={dashboard1}
                          alt="Dashboard Icon"
                          height={60}
                          width={60}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-sm-6 col-12 d-flex">
                <div className="card bg-comman w-100">
                  <div className="card-body">
                    <div className="db-widgets d-flex justify-content-between align-items-center">
                      <div className="db-info">
                        <h6> Disbursed</h6>
                        <h3>
                          {getdashboardData?.length !== 0
                            ? getdashboardData?.numberOfClosedDealsCount +
                              getdashboardData?.numberOfActiveDealsCount
                            : ""}
                        </h3>
                      </div>
                      <div className="db-icon">
                        <img
                          src={dashboard4}
                          alt="Dashboard Icon"
                          height={60}
                          width={60}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card report-card">
              <div className="card-body pb-0">
                <div className="row">
                  <div className="col-md-12">
                    <ul className="app-listing">
                      <li>
                        <div className="report-btn">
                          <Link to="/borrowerLoansInitiated" className="btn">
                            <img src={invoicesicon5} alt="" className="me-2" />
                            Active Loans
                          </Link>
                        </div>
                      </li>
                      {/* <li>
                        <div className="report-btn">
                          <Link to="/borrowerAgreedLoans" className="btn">
                            <img src={invoicesicon5} alt="" className="me-2" />
                            Closed Loans
                          </Link>
                        </div>
                      </li> */}

                      <li>
                        <div className="report-btn">
                          <Link to="/borrowerLoanRequestCreate" className="btn">
                            <img src={invoicesicon5} alt="" className="me-2" />
                            New Request
                          </Link>
                        </div>
                      </li>

                      <li>
                        <div className="report-btn">
                          <Link to="/borrowerDisbursementAmount" className="btn">
                            <img src={invoicesicon5} alt="" className="me-2" />
                            Agreed Loans
                          </Link>
                        </div>
                      </li>
                      <li>
                        <div className="report-btn">
                          <Link to="/nearbyleders" className="btn">
                            <i className="fa-solid fa-location-dot me-2"></i>
                            Nearby Lenders
                          </Link>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* OxyScore and Location Analytics Section */}
            {/* <div className="row"> */}
              {/* OxyScore Card */}
              {/* <div className="col-xl-6 col-lg-6 col-md-12 d-flex">
                <div className="card w-100 border-0 shadow-sm">
                  <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold" style={{ fontSize: "16px", color: "#1e293b" }}>
                      <i className="fa-solid fa-chart-line me-2 text-primary" />
                      Your OxyScore
                    </h5>
                    <Link to="/my-oxyscore" className="btn btn-sm btn-outline-primary" style={{ borderRadius: "20px", fontSize: "11px", fontWeight: "600" }}>
                      Manage Score
                    </Link>
                  </div>
                  <div className="card-body">
                    {scoreLoading ? (
                      <div className="text-center py-5 text-muted">
                        <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                        Loading OxyScore...
                      </div>
                    ) : (
                      <div className="row align-items-center">
                        <div className="col-md-5 text-center mb-3 mb-md-0">
                          <Progress
                            type="dashboard"
                            percent={scoreData?.oxyScore ? Math.min(100, Math.round((scoreData.oxyScore / SCORE_MAX) * 100)) : 0}
                            format={() => (
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: "28px", fontWeight: "bold", color: scoreColor(scoreData?.oxyScore) }}>
                                  {scoreData?.oxyScore || "—"}
                                </div>
                                <div style={{ fontSize: "10px", color: "#888" }}>out of {SCORE_MAX}</div>
                              </div>
                            )}
                            strokeColor={scoreColor(scoreData?.oxyScore)}
                            strokeWidth={9}
                            width={140}
                          />
                          <div className="mt-2">
                            <Tag color={scoreBand(scoreData?.oxyScore).antColor} style={{ fontSize: "12px", padding: "2px 10px", borderRadius: "10px" }}>
                              {scoreBand(scoreData?.oxyScore).label}
                            </Tag>
                          </div>
                          {scoreData?.cibilScore > 0 && (
                            <div className="mt-2 text-muted" style={{ fontSize: "11px" }}>
                              CIBIL Bureau: <strong>{scoreData.cibilScore}</strong> (Private)
                            </div>
                          )}
                        </div>
                        <div className="col-md-7">
                          {scoreData?.oxyScore > 0 ? (
                            <>
                              <h6 className="fw-semibold mb-2" style={{ fontSize: "13px" }}>Score breakdown</h6>
                              <Chart
                                options={breakdownChartData.options}
                                series={breakdownChartData.series}
                                type="bar"
                                height={180}
                              />
                            </>
                          ) : (
                            <div className="text-center p-3 rounded" style={{ backgroundColor: "#f8fafc", border: "1px dashed #cbd5e1" }}>
                              <i className="fa-solid fa-cloud-arrow-up text-muted mb-2 d-block" style={{ fontSize: "24px" }} />
                              <p className="small text-muted mb-2">No score computed. Get up to 1000 points by uploading your report.</p>
                              <Link to="/my-oxyscore" className="btn btn-sm btn-primary" style={{ borderRadius: "20px", fontSize: "12px" }}>
                                Upload CIBIL PDF
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div> */}

              {/* OxyScore Explanation / How to Increase */}
              {/* <div className="col-xl-6 col-lg-6 col-md-12 d-flex">
                <div className="card w-100 border-0 shadow-sm">
                  <div className="card-header bg-white py-3 border-0">
                    <h5 className="mb-0 fw-bold" style={{ fontSize: "16px", color: "#1e293b" }}>
                      <i className="fa-solid fa-graduation-cap me-2 text-success" />
                      Improve Your Creditworthiness
                    </h5>
                  </div>
                  <div className="card-body">
                    <p className="text-muted mb-3" style={{ fontSize: "12.5px", lineHeight: "1.5" }}>
                      <strong>OxyScore</strong> is a score from 0–1000 computed internally using your profile, CIBIL, and referrals. Lenders check this score to determine your interest rates and funding speeds.
                    </p>

                    <div className="mb-3">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <span className="fw-semibold" style={{ fontSize: "12.5px" }}>
                          1. Complete Profile Details <span className="text-muted">(Max 50 pts)</span>
                        </span>
                        <span style={{ fontSize: "11px" }}>
                          {profileCompletionPct === 100 ? (
                            <span className="text-success fw-bold"><i className="fa fa-check-circle" /> 100% Filled</span>
                          ) : (
                            <span className="text-warning fw-bold">{profileCompletionPct}% Filled</span>
                          )}
                        </span>
                      </div>
                      <Progress percent={profileCompletionPct} size="small" strokeColor="#10b981" showInfo={false} />
                      <div className="d-flex justify-content-between align-items-center mt-1">
                        <span className="text-muted" style={{ fontSize: "11px" }}>Verify KYC, Address, and PAN card.</span>
                        {profileCompletionPct < 100 && (
                          <Link to="/borrowerProfile" style={{ fontSize: "11.5px", fontWeight: "600", color: "#2563eb" }}>
                            Complete Profile →
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="mb-3 py-2 border-top border-bottom border-light">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <div className="fw-semibold" style={{ fontSize: "12.5px" }}>
                            2. Add Referral Phone / Member ID
                          </div>
                          <span className="text-muted" style={{ fontSize: "11px" }}>Boosts credibility and verification points.</span>
                        </div>
                        <div>
                          {hasReferrer ? (
                            <span className="badge bg-success-light" style={{ padding: "4px 8px", borderRadius: "10px", fontSize: "11px" }}>
                              <i className="fa fa-check me-1" /> Added
                            </span>
                          ) : (
                            <Link to="/borrowerProfile" className="btn btn-xs btn-outline-warning" style={{ borderRadius: "12px", fontSize: "10.5px", padding: "2px 8px" }}>
                              Add in Profile
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <div className="fw-semibold" style={{ fontSize: "12.5px" }}>
                            3. Upload Official CIBIL Report <span className="text-muted">(Max 600 pts)</span>
                          </div>
                          <span className="text-muted" style={{ fontSize: "11px" }}>Upload CIBIL PDF from cibil.com.</span>
                        </div>
                        <div>
                          {hasCibilUploaded ? (
                            <span className="badge bg-success-light" style={{ padding: "4px 8px", borderRadius: "10px", fontSize: "11px" }}>
                              <i className="fa fa-check me-1" /> Uploaded
                            </span>
                          ) : (
                            <Link to="/my-oxyscore" className="btn btn-xs btn-primary" style={{ borderRadius: "12px", fontSize: "10.5px", padding: "2px 8px" }}>
                              Upload PDF
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div> */}

            {/* Nearby Lenders Section */}
            <div className="row">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                      <h5 className="mb-0 fw-bold" style={{ fontSize: "16px", color: "#1e293b" }}>
                        <i className="fa-solid fa-location-dot me-2 text-primary" />
                        Find Nearby Lenders
                      </h5>
                      <p className="text-muted mb-0 mt-1" style={{ fontSize: "11.5px" }}>
                        Connect with verified lenders in your local area for quick loan negotiations.
                      </p>
                    </div>
                    <Link to="/nearbyleders" className="btn btn-sm btn-link text-primary fw-semibold p-0" style={{ fontSize: "12.5px" }}>
                      View Fullscreen Map <i className="fa-solid fa-arrow-right-long ms-1" />
                    </Link>
                  </div>
                  <div style={{ borderTop: "1px solid #f1f5f9" }}>
                    {/* Filter Bar */}
                    <div style={{ padding: "12px 16px", display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", backgroundColor: "#f8fafc" }}>
                      <div style={{ position: "relative", minWidth: 200, flex: "0 1 240px" }}>
                        <i className="fa fa-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#aaa", fontSize: 11 }} />
                        <input
                          type="text"
                          placeholder="Search lender name or ID..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{ width: "100%", paddingLeft: 28, height: 32, border: "1px solid #cbd5e1", borderRadius: 20, fontSize: 11.5, outline: "none", backgroundColor: "#fff" }}
                        />
                      </div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <small className="text-muted fw-semibold" style={{ fontSize: "11.5px" }}>Distance:</small>
                        {DISTANCE_OPTIONS.map((option) => (
                          <button
                            key={option.label}
                            className="btn btn-sm"
                            style={{
                              borderRadius: 16,
                              fontSize: 10.5,
                              fontWeight: 600,
                              padding: "2px 8px",
                              background: selectedRadiusKm === option.value ? PRIMARY : "#fff",
                              color: selectedRadiusKm === option.value ? "#fff" : "#475569",
                              border: selectedRadiusKm === option.value ? `1px solid ${PRIMARY}` : "1px solid #cbd5e1",
                              transition: "all 0.15s"
                            }}
                            onClick={() => setSelectedRadiusKm(option.value)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      <small className="text-muted ms-auto" style={{ fontSize: "11px" }}>
                        <strong>{filteredLenders.length}</strong> lender{filteredLenders.length !== 1 ? "s" : ""} found
                      </small>
                    </div>

                    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", minHeight: 400 }}>
                      {/* Map Container */}
                      <div style={{ flex: "1 1 60%", minWidth: 320, position: "relative", minHeight: 400 }}>
                        {nearbyInfo.loading ? (
                          <div className="map-placeholder-dashboard mb-0" role="status">
                            <span className="spinner-border text-primary spinner-border-sm me-2" role="status" aria-hidden="true" />
                            <span>Loading nearby lenders...</span>
                          </div>
                        ) : hasMapCoordinates ? (
                          <MapContainer
                            center={mapCenter}
                            zoom={11}
                            closePopupOnClick
                            scrollWheelZoom={false}
                            className="nearby-lenders-map-dashboard"
                            style={{ height: "100%", borderRadius: 0, zIndex: 1 }}
                          >
                            <TileLayer
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapFlyTo center={selectedLenderPosition} />
                            <Marker position={[borrowerLat, borrowerLng]} icon={youLocationIcon}>
                              <Tooltip direction="top" offset={[0, -64]} opacity={1} className="map-hover-name">
                                You
                              </Tooltip>
                              <Popup>
                                <div style={{ minWidth: "160px" }}>
                                  <strong>Your location</strong>
                                  <div className="small text-muted mt-1">
                                    Lat: {borrowerLat.toFixed(4)}<br />
                                    Lng: {borrowerLng.toFixed(4)}
                                  </div>
                                </div>
                              </Popup>
                            </Marker>
                            {selectedRadiusKm !== "ALL" && (
                              <Circle
                                center={[borrowerLat, borrowerLng]}
                                radius={Number(selectedRadiusKm) * 1000}
                                pathOptions={{
                                  color: PRIMARY,
                                  fillColor: PRIMARY,
                                  fillOpacity: 0.05,
                                  weight: 1.5,
                                  dashArray: "5 5",
                                }}
                              />
                            )}
                            {filteredLenders.map((lender, index) => {
                              const lLat = Number(lender?.lenderLat);
                              const lLng = Number(lender?.lenderLng);
                              if (!Number.isFinite(lLat) || !Number.isFinite(lLng)) return null;
                              const displayName = lender?.lenderName?.trim() || "Lender";
                              return (
                                <Marker
                                  key={`${lender?.lenderId}-${index}`}
                                  position={[lLat, lLng]}
                                  icon={lenderPinIcon}
                                  eventHandlers={{
                                    click: () => setSelectedLenderId(lender?.lenderId),
                                  }}
                                >
                                  <Tooltip direction="top" offset={[0, -40]} opacity={1} className="map-hover-name">
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                      <span className={`map-avatar map-avatar-${getGenderType(lender)}`} />
                                      {displayName}
                                    </span>
                                  </Tooltip>
                                  <Popup>
                                    <div style={{ minWidth: "180px" }}>
                                      <strong style={{ color: PRIMARY }}>{displayName}</strong>
                                      <div className="mt-1 small">
                                        <div><strong>Distance:</strong> {Number(lender.distance).toFixed(2)} km</div>
                                        <div className="text-muted mt-1">Lender ID: {lender?.lenderId ?? "—"}</div>
                                      </div>
                                    </div>
                                  </Popup>
                                </Marker>
                              );
                            })}
                          </MapContainer>
                        ) : (
                          <div className="alert alert-warning m-3" role="alert" style={{ fontSize: "12.5px" }}>
                            <i className="fa-solid fa-triangle-exclamation me-2" />
                            <strong>Location unavailable.</strong> Please ensure your latitude and longitude details are updated in your profile or click the city update option.
                          </div>
                        )}
                      </div>

                      {/* Lenders List Sidebar */}
                      <div style={{ flex: "1 1 30%", minWidth: 260, borderLeft: "1px solid #e2e8f0", display: "flex", flexDirection: "column", backgroundColor: "#fff", height: 400 }}>
                        <div style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                          <h6 className="mb-0 fw-bold" style={{ fontSize: "12.5px" }}>
                            <i className="fa fa-users me-1 text-primary" /> Lenders Nearby
                          </h6>
                          <small className="text-muted" style={{ fontSize: "10.5px" }}>Click to focus on map</small>
                        </div>
                        <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
                          {filteredLenders.length === 0 ? (
                            <div className="text-center text-muted py-4" style={{ fontSize: "12px" }}>
                              <i className="fa fa-search fa-xl mb-2 d-block text-muted" />
                              No lenders found. Try adjusting radius.
                            </div>
                          ) : (
                            filteredLenders.map((lender, idx) => {
                              const lenderId = lender?.lenderId ?? idx;
                              const isSelected = String(selectedLenderId) === String(lenderId);
                              return (
                                <div
                                  key={`${lenderId}-${idx}`}
                                  style={{
                                    padding: "8px 10px",
                                    borderRadius: 6,
                                    border: `1px solid ${isSelected ? PRIMARY : "#f1f5f9"}`,
                                    background: isSelected ? `${PRIMARY}0c` : "#f8fafc",
                                    marginBottom: 6,
                                    cursor: "pointer",
                                    transition: "all 0.15s",
                                  }}
                                  onClick={() => setSelectedLenderId(lenderId)}
                                >
                                  <div className="d-flex align-items-center gap-2">
                                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: isSelected ? PRIMARY : "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                      <i className="fa fa-user" style={{ color: isSelected ? "#fff" : PRIMARY, fontSize: 11 }} />
                                    </div>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                      <div className="fw-semibold text-truncate" style={{ fontSize: "11.5px", color: isSelected ? PRIMARY : "#1e293b" }}>
                                        {lender?.lenderName || "Lender"}
                                      </div>
                                      <div style={{ fontSize: "9.5px", color: "#64748b" }}>ID: {lender?.lenderId ?? "—"}</div>
                                    </div>
                                    {/* <div className="text-end" style={{ flexShrink: 0 }}>
                                      <div style={{ fontSize: "10.5px", fontWeight: "700", color: lender?.distance <= 5 ? "#10b981" : lender?.distance <= 25 ? "#f59e0b" : "#ef4444" }}>
                                        {lender?.distance != null ? `${Number(lender.distance).toFixed(1)} km` : "N/A"}
                                      </div>
                                      <div style={{ fontSize: "8.5px", color: "#94a3b8" }}>away</div>
                                    </div> */}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Map styles */}
            <style>
              {`
                .custom-map-pin-wrapper {
                  background: transparent;
                  border: none;
                }

                .custom-map-pin {
                  position: relative;
                  width: 32px;
                  height: 44px;
                  transform-origin: 50% 100%;
                  transition: transform 180ms ease, filter 220ms ease;
                  filter: drop-shadow(0 4px 10px rgba(37,99,235,0.45));
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                }

                .custom-map-pin .pin-circle {
                  width: 28px;
                  height: 28px;
                  border-radius: 50% 50% 50% 0;
                  transform: rotate(-45deg);
                  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                  border: 3px solid #ffffff;
                  box-shadow: 0 2px 8px rgba(37,99,235,0.5);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-shrink: 0;
                }

                .custom-map-pin .pin-circle svg {
                  transform: rotate(45deg);
                }

                .custom-map-pin .pin-tail {
                  position: absolute;
                  left: 50%;
                  top: 20px;
                  width: 4px;
                  height: 16px;
                  transform: translateX(-50%);
                  border-radius: 6px;
                  background: linear-gradient(to bottom, #2563eb, #1d4ed8);
                  opacity: 0.9;
                }

                .custom-map-pin .pin-glow {
                  position: absolute;
                  left: 50%;
                  bottom: 0;
                  width: 20px;
                  height: 8px;
                  transform: translateX(-50%);
                  border-radius: 50%;
                  background: rgba(37,99,235,0.35);
                  filter: blur(4px);
                }

                .leaflet-marker-icon:hover .custom-map-pin {
                  transform: translateY(-4px) scale(1.08);
                  filter: drop-shadow(0 10px 16px rgba(37,99,235,0.55));
                }

                .you-marker-outer {
                  background: transparent;
                  border: none;
                }

                .you-marker-inner {
                  position: relative;
                  width: 54px;
                  height: 70px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  filter: drop-shadow(0 5px 12px rgba(22,163,74,0.55));
                }

                .you-pin-circle {
                  width: 46px;
                  height: 46px;
                  border-radius: 50% 50% 50% 0;
                  transform: rotate(-45deg);
                  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
                  border: 3px solid #ffffff;
                  box-shadow: 0 3px 10px rgba(22,163,74,0.55);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-shrink: 0;
                }

                .you-pin-circle svg {
                  transform: rotate(45deg);
                }

                .you-pin-tail {
                  position: absolute;
                  left: 50%;
                  top: 34px;
                  width: 5px;
                  height: 22px;
                  transform: translateX(-50%);
                  border-radius: 6px;
                  background: linear-gradient(to bottom, #16a34a, #15803d);
                  opacity: 0.9;
                }

                .you-pin-glow {
                  position: absolute;
                  left: 50%;
                  bottom: 0;
                  width: 28px;
                  height: 10px;
                  transform: translateX(-50%);
                  border-radius: 50%;
                  background: rgba(22,163,74,0.4);
                  filter: blur(5px);
                }

                .map-hover-name {
                  background: rgba(255, 255, 255, 0.96);
                  border: 1px solid #e2e8f0;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
                  color: #1e293b;
                  font-size: 12.5px;
                  font-weight: 600;
                  padding: 6px 10px;
                  pointer-events: none;
                }

                .map-avatar {
                  width: 18px;
                  height: 18px;
                  border-radius: 50%;
                  background-size: cover;
                  background-position: center;
                  border: 1px solid #ffffff;
                  flex-shrink: 0;
                }

                .map-avatar-male {
                  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='32' fill='%232563eb'/%3E%3Ccircle cx='32' cy='24' r='12' fill='%23ffffff'/%3E%3Cpath d='M12 58c2-10 10-16 20-16s18 6 20 16' fill='%23ffffff'/%3E%3C/svg%3E");
                }

                .map-avatar-female {
                  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='32' fill='%23db2777'/%3E%3Ccircle cx='32' cy='24' r='12' fill='%23ffffff'/%3E%3Cpath d='M10 58c3-10 12-16 22-16s19 6 22 16' fill='%23ffffff'/%3E%3Cpath d='M18 20c2-8 8-12 14-12s12 4 14 12' fill='%23ffffff' opacity='0.85'/%3E%3C/svg%3E");
                }

                .map-avatar-unknown {
                  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='32' fill='%236b7280'/%3E%3Ccircle cx='32' cy='24' r='12' fill='%23ffffff'/%3E%3Cpath d='M12 58c2-10 10-16 20-16s18 6 20 16' fill='%23ffffff'/%3E%3C/svg%3E");
                }

                .nearby-lenders-map-dashboard {
                  width: 100%;
                  height: 400px;
                  border-radius: 0;
                }

                .map-placeholder-dashboard {
                  height: 400px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 12px;
                  border-radius: 0;
                  background: rgba(37, 99, 235, 0.05);
                  color: #1d4ed8;
                  font-weight: 600;
                  text-align: center;
                }
              `}
            </style>
          </div>
          {/* Footer */}
          <Footer />
        </div>
        <Modal
          show={show}
          onHide={() => setShow(false)}
          dialogClassName="custom-small-modal"
        >
          <Modal.Header closeButton className="py-2 px-3">
            <Modal.Title className="h6">Select City</Modal.Title>
          </Modal.Header>

            <Modal.Body className="py-2 px-3">
              <div className="mb-2">
                <label htmlFor="citySelect" className="form-label small mb-1">
                  City
                </label>
                <input
                  id="citySelect"
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Enter city"
                  value={selectedCity}
                  onChange={handleCityChange}
                />

                {selectedCityerror && (
                  <p className="text-danger small mt-1">
                    Please enter a city.
                  </p>
                )}
              </div>
            </Modal.Body>

          <Modal.Footer className="py-2 px-3">
  <Button
    variant="primary"
    onClick={handleSave}
    size="sm"
    disabled={
      !selectedCity.trim()
    }
  >
    Save
  </Button>
</Modal.Footer>

          </Modal>
      </div>
      {/* /Main Wrapper */}
      {/* <FloatingAssistant avatarSrc={logo} /> */}
    </>
  );
};

export default BorrowerDashboard;
