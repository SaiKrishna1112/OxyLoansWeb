import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Circle,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import BorrowerHeader from "../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../SideBar/BorrowerSidebar";
import { getLenderListNearByRedius1 } from "../../../HttpRequest/afterlogin";

const LENDER_PIN_COLOR = "#2563eb";
const BORROWER_MARKER_COLOR = "#16a34a";
const PRIMARY = "#3d5ee1";

const createLenderPinIcon = () =>
  L.divIcon({
    className: "custom-map-pin-wrapper",
    html: `
      <div class="custom-map-pin" style="--pin-color:${LENDER_PIN_COLOR}">
        <span class="pin-head"></span>
        <span class="pin-tail"></span>
        <span class="pin-glow"></span>
      </div>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
  });

const lenderPinIcon = createLenderPinIcon();

const youLocationIcon = L.divIcon({
  className: "you-marker-outer",
  html: `
    <div class="you-marker-inner">
      <span class="you-marker-label">YOU</span>
    </div>
  `,
  iconSize: [48, 40],
  iconAnchor: [24, 40],
  popupAnchor: [0, -36],
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

const BorrowerNearbyLendersPage = () => {
  const [nearbyInfo, setNearbyInfo] = useState({
    apiData: [],
    loading: true,
    errorMessage: "",
  });
  const [pageInfo, setPageInfo] = useState({
    hasNextPage: false,
    rawCount: 0,
  });
  const [pagination, setPagination] = useState({
    pageNo: 1,
    pageSize: 100,
  });
  const [maxPageReached, setMaxPageReached] = useState(1);
  const [selectedRadiusKm, setSelectedRadiusKm] = useState(25);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLenderId, setSelectedLenderId] = useState(null);

  const DISTANCE_OPTIONS = [
    { label: "All", value: "ALL" },
    { label: "5 km", value: 5 },
    { label: "10 km", value: 10 },
    { label: "25 km", value: 25 },
    { label: "50 km", value: 50 },
    { label: "100 km", value: 100 },
  ];

  useEffect(() => {
    setMaxPageReached((previous) => Math.max(previous, pagination.pageNo));
  }, [pagination.pageNo]);

  useEffect(() => {
    const getApiErrorMessage = (response) => {
      return (
        response?.response?.data?.errorMessage ||
        response?.response?.data?.message ||
        response?.data?.errorMessage ||
        response?.data?.message ||
        "We could not load nearby lenders. Please try again."
      );
    };

    const fetchNearbyLenders = async () => {
      setNearbyInfo((previousState) => ({
        ...previousState,
        loading: true,
        errorMessage: "",
      }));

      try {
        const response = await getLenderListNearByRedius1(
          pagination.pageNo,
          pagination.pageSize,
        );

        if (response?.status === 200) {
          const pageData = Array.isArray(response?.data) ? response.data : [];
          setPageInfo({
            hasNextPage: pageData.length === pagination.pageSize,
            rawCount: pageData.length,
          });
          const uniqueLenders = pageData.filter(
            (item, index, self) =>
              index ===
              self.findIndex(
                (candidate) =>
                  String(candidate?.lenderId) === String(item?.lenderId) &&
                  String(candidate?.lenderLat) === String(item?.lenderLat) &&
                  String(candidate?.lenderLng) === String(item?.lenderLng),
              ),
          );

          setNearbyInfo({
            apiData: uniqueLenders,
            loading: false,
            errorMessage: "",
          });
          return;
        }

        setNearbyInfo({
          apiData: [],
          loading: false,
          errorMessage: getApiErrorMessage(response),
        });
        setPageInfo({
          hasNextPage: false,
          rawCount: 0,
        });
      } catch (error) {
        setNearbyInfo({
          apiData: [],
          loading: false,
          errorMessage: getApiErrorMessage(error),
        });
        setPageInfo({
          hasNextPage: false,
          rawCount: 0,
        });
      }
    };

    fetchNearbyLenders();
  }, [pagination.pageNo, pagination.pageSize]);

  const pageDropdownOptions = useMemo(() => {
    const maxOption = Math.max(
      maxPageReached,
      pagination.pageNo + (pageInfo.hasNextPage ? 1 : 0),
    );
    const count = Math.max(1, maxOption);
    return Array.from({ length: count }, (_, index) => index + 1);
  }, [maxPageReached, pagination.pageNo, pageInfo.hasNextPage]);

  const safePageLenders = useMemo(
    () =>
      nearbyInfo.apiData.filter(
        (item) =>
          Number.isFinite(Number(item?.lenderLat)) &&
          Number.isFinite(Number(item?.lenderLng)) &&
          Number.isFinite(Number(item?.distance)),
      ),
    [nearbyInfo.apiData],
  );

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
  const borrowerLat = Number(borrowerSample?.borrowerLat);
  const borrowerLng = Number(borrowerSample?.borrowerLng);

  const hasMapCoordinates =
    Number.isFinite(borrowerLat) && Number.isFinite(borrowerLng);

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

  return (
    <div className="main-wrapper">
      <style>
        {`
          .custom-map-pin-wrapper {
            background: transparent;
            border: none;
          }

          .custom-map-pin {
            position: relative;
            width: 30px;
            height: 42px;
            transform-origin: 50% 100%;
            transition: transform 180ms ease, filter 220ms ease;
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25));
          }

          .custom-map-pin .pin-head {
            display: block;
            width: 22px;
            height: 22px;
            margin: 0 auto;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            background: var(--pin-color);
            border: 2px solid #ffffff;
            box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.1);
          }

          .custom-map-pin .pin-tail {
            position: absolute;
            left: 50%;
            top: 16px;
            width: 4px;
            height: 18px;
            transform: translateX(-50%);
            border-radius: 6px;
            background: var(--pin-color);
            opacity: 0.95;
          }

          .custom-map-pin .pin-glow {
            position: absolute;
            left: 50%;
            bottom: 0;
            width: 20px;
            height: 10px;
            transform: translateX(-50%);
            border-radius: 50%;
            background: color-mix(in srgb, var(--pin-color) 75%, transparent);
            filter: blur(5px);
            opacity: 0.7;
          }

          .leaflet-marker-icon:hover .custom-map-pin {
            transform: translateY(-3px) scale(1.04);
            filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.28));
          }

          .you-marker-outer {
            background: transparent;
            border: none;
          }

          .you-marker-inner {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 44px;
            height: 28px;
            padding: 0 10px;
            background: ${BORROWER_MARKER_COLOR};
            color: #fff;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.06em;
            border-radius: 6px;
            border: 2px solid #fff;
            box-shadow: 0 4px 12px rgba(22, 163, 74, 0.45);
          }

          .you-marker-inner::after {
            content: "";
            position: absolute;
            left: 50%;
            bottom: -8px;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 8px solid ${BORROWER_MARKER_COLOR};
          }

          .radius-options {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 14px;
          }
          .radius-chip {
            border: 1px solid #dbe2ef;
            background: #fff;
            color: #334155;
            border-radius: 999px;
            padding: 6px 14px;
            font-weight: 600;
            transition: all 0.2s ease;
            cursor: pointer;
          }
          .radius-chip.active {
            background: #2563eb;
            color: #fff;
            border-color: #2563eb;
          }

          .map-hover-name {
            background: rgba(255, 255, 255, 0.96);
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
            color: #1e293b;
            font-size: 12px;
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

          .nearby-map-help {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 12px;
            line-height: 1.5;
          }

          .nearby-lenders-map {
            width: 100%;
            min-height: 320px;
            height: min(560px, 70vh);
            border-radius: 8px;
          }

          .map-placeholder {
            min-height: 220px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            border-radius: 8px;
            background: rgba(37, 99, 235, 0.08);
            color: #1d4ed8;
            font-weight: 600;
            text-align: center;
          }

          .map-placeholder .spinner-border {
            width: 1.3rem;
            height: 1.3rem;
            border-width: 0.18rem;
          }
        `}
      </style>
      <BorrowerHeader />
      <BorrowerSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Nearby lenders</h3>

                <ul className="breadcrumb mb-0">
                  <li className="breadcrumb-item">
                    <Link to="/borrowerDashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">Nearby lenders</li>
                </ul>
              </div>
            </div>
          </div>

          {nearbyInfo.errorMessage && (
            <div
              className="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              <i className="fa-solid fa-circle-exclamation me-2"></i>
              {nearbyInfo.errorMessage}
              <button
                type="button"
                className="btn-close"
                onClick={() =>
                  setNearbyInfo((prev) => ({ ...prev, errorMessage: "" }))
                }
                aria-label="Close"
              ></button>
            </div>
          )}

          <div className="card border-0 shadow-sm">
            <div
              style={{
                borderBottom: "1px solid #e9ecef",
                padding: "12px 16px",
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
                alignItems: "center",
              }}
            >
              <div style={{ position: "relative", minWidth: 220, flex: "0 1 260px" }}>
                <i
                  className="fa fa-search"
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#aaa",
                    fontSize: 12,
                  }}
                />
                <input
                  type="text"
                  placeholder="Search lender name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    paddingLeft: 30,
                    height: 34,
                    border: "1px solid #ddd",
                    borderRadius: 20,
                    fontSize: 12,
                    outline: "none",
                  }}
                />
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <small className="text-muted fw-semibold">Distance:</small>
                {DISTANCE_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    className="btn btn-sm"
                    style={{
                      borderRadius: 16,
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 10px",
                      background: selectedRadiusKm === option.value ? PRIMARY : "#f0f0f0",
                      color: selectedRadiusKm === option.value ? "#fff" : "#555",
                      border:
                        selectedRadiusKm === option.value
                          ? `1px solid ${PRIMARY}`
                          : "1px solid #ddd",
                    }}
                    onClick={() => setSelectedRadiusKm(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <small className="text-muted ms-auto">
                <strong>{filteredLenders.length}</strong> lender
                {filteredLenders.length !== 1 ? "s" : ""} found
              </small>
            </div>
            <div style={{ display: "flex", height: "calc(100vh - 230px)", minHeight: 440 }}>
              <div style={{ flex: 1, position: "relative" }}>
                {nearbyInfo.loading ? (
                  <div className="map-placeholder mb-0 h-100" role="status">
                    <span
                      className="spinner-border text-primary"
                      role="status"
                      aria-hidden="true"
                    />
                    <span>Loading the map and nearby lenders…</span>
                  </div>
                ) : hasMapCoordinates ? (
                  <MapContainer
                    center={mapCenter}
                    zoom={12}
                    closePopupOnClick
                    scrollWheelZoom
                    className="nearby-lenders-map"
                    style={{ height: "100%", borderRadius: 0 }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapFlyTo center={selectedLenderPosition} />
                    <Marker
                      position={[borrowerLat, borrowerLng]}
                      icon={youLocationIcon}
                    >
                      <Tooltip
                        direction="top"
                        offset={[0, -36]}
                        opacity={1}
                        className="map-hover-name"
                      >
                        You
                      </Tooltip>
                      <Popup>
                        <div style={{ minWidth: "200px" }}>
                          <strong>Your location</strong>
                          <div className="small text-muted mt-1">
                            Lat: {borrowerLat}
                            <br />
                            Lng: {borrowerLng}
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
                          fillOpacity: 0.06,
                          weight: 1.5,
                          dashArray: "6 4",
                        }}
                      />
                    )}
                    {filteredLenders.map((lender, index) => {
                      const lenderLat = Number(lender?.lenderLat);
                      const lenderLng = Number(lender?.lenderLng);
                      if (!Number.isFinite(lenderLat) || !Number.isFinite(lenderLng)) return null;
                      const markerKey = `${lender?.lenderId || "lender"}-${index}`;
                      const displayName = lender?.lenderName?.trim() || "Lender";
                      return (
                        <Marker
                          key={markerKey}
                          position={[lenderLat, lenderLng]}
                          icon={lenderPinIcon}
                          eventHandlers={{
                            click: () => setSelectedLenderId(lender?.lenderId),
                          }}
                        >
                          <Tooltip
                            direction="top"
                            offset={[0, -34]}
                            opacity={1}
                            className="map-hover-name"
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <span
                                className={`map-avatar map-avatar-${getGenderType(lender)}`}
                              />
                              {displayName}
                            </span>
                          </Tooltip>
                          <Popup>
                            <div style={{ minWidth: "200px" }}>
                              <strong>{displayName}</strong>
                              <div className="mt-2 small">
                                <div>
                                  <strong>Distance</strong>{" "}
                                  {lender?.distance !== null && lender?.distance !== undefined
                                    ? `${Number(lender.distance).toFixed(2)} km`
                                    : "—"}
                                </div>
                                <div className="text-muted mt-1">
                                  Lender ID {lender?.lenderId ?? "—"}
                                </div>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                ) : (
                  <div
                    className="alert alert-warning alert-dismissible fade show mb-0"
                    role="alert"
                  >
                    <i className="fa-solid fa-triangle-exclamation me-2"></i>
                    <strong>Map unavailable.</strong> Your location was not returned
                    in the response. Update your profile location and try again.
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() =>
                        setNearbyInfo((prev) => ({
                          ...prev,
                          errorMessage: "Location data unavailable",
                        }))
                      }
                      aria-label="Close"
                    ></button>
                  </div>
                )}
              </div>
              <div
                style={{
                  width: 320,
                  borderLeft: "1px solid #e9ecef",
                  display: "flex",
                  flexDirection: "column",
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid #e9ecef",
                    background: "#f8f9fa",
                  }}
                >
                  <h6 className="mb-0 fw-bold" style={{ fontSize: 14 }}>
                    <i className="fa fa-users me-1" style={{ color: PRIMARY }} />
                    Nearby Lenders
                  </h6>
                  <small className="text-muted">Click to focus on map</small>
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
                  {filteredLenders.length === 0 ? (
                    <div className="text-center text-muted py-4" style={{ fontSize: 13 }}>
                      <i className="fa fa-search fa-2x mb-2 d-block" />
                      No lenders match your filters.
                    </div>
                  ) : (
                    filteredLenders.map((lender, idx) => {
                      const lenderId = lender?.lenderId ?? idx;
                      const isSelected = String(selectedLenderId) === String(lenderId);
                      return (
                        <div
                          key={`${lenderId}-${idx}`}
                          style={{
                            padding: "10px",
                            borderRadius: 8,
                            border: `1px solid ${isSelected ? PRIMARY : "#e9ecef"}`,
                            background: isSelected ? `${PRIMARY}14` : "#f8f9fa",
                            marginBottom: 8,
                            cursor: "pointer",
                          }}
                          onClick={() => setSelectedLenderId(lenderId)}
                        >
                          <div className="fw-semibold text-truncate" style={{ fontSize: 13 }}>
                            {lender?.lenderName || "Lender"}
                          </div>
                          <div className="text-muted" style={{ fontSize: 11 }}>
                            ID: {lender?.lenderId ?? "—"}
                          </div>
                          <div className="text-muted mt-1" style={{ fontSize: 11 }}>
                            <i className="fa fa-map-marker me-1" style={{ color: "#dc3545" }} />
                            {lender?.distance !== null && lender?.distance !== undefined
                              ? `${Number(lender.distance).toFixed(2)} km`
                              : "Distance N/A"}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div
                  style={{
                    borderTop: "1px solid #e9ecef",
                    padding: 10,
                    background: "#f8f9fa",
                  }}
                >
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <label className="small text-muted mb-0">Page</label>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: "84px" }}
                      value={pagination.pageNo}
                      disabled={nearbyInfo.loading}
                      onChange={(event) =>
                        setPagination((prev) => ({
                          ...prev,
                          pageNo: Number(event.target.value),
                        }))
                      }
                    >
                      {pageDropdownOptions.map((pageNumber) => (
                        <option key={pageNumber} value={pageNumber}>
                          {pageNumber}
                        </option>
                      ))}
                    </select>
                    <label className="small text-muted mb-0">Rows</label>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: "86px" }}
                      value={pagination.pageSize}
                      disabled={nearbyInfo.loading}
                      onChange={(event) => {
                        setMaxPageReached(1);
                        setPagination({
                          pageNo: 1,
                          pageSize: Number(event.target.value),
                        });
                      }}
                    >
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={150}>150</option>
                      <option value={200}>200</option>
                    </select>
                  </div>
                  <small className="text-muted d-block mt-2">
                    API page count: {pageInfo.rawCount}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowerNearbyLendersPage;
