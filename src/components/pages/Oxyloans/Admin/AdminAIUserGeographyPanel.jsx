import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const fmtNum = (n) => (n == null ? "0" : Number(n).toLocaleString("en-IN"));
const pickNumber = (...values) => {
  for (const value of values) {
    if (value != null && value !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return 0;
};

const normalizeStateKey = (state) =>
  String(state || "unknown")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const INDIA_STATE_COORDS = {
  "andhra pradesh": [15.9129, 79.74],
  assam: [26.2006, 92.9376],
  bihar: [25.0961, 85.3131],
  chhattisgarh: [21.2787, 81.8661],
  goa: [15.2993, 74.124],
  gujarat: [22.2587, 71.1924],
  haryana: [29.0588, 76.0856],
  jharkhand: [23.6102, 85.2799],
  karnataka: [15.3173, 75.7139],
  kerala: [10.8505, 76.2711],
  "madhya pradesh": [22.9734, 78.6569],
  maharashtra: [19.7515, 75.7139],
  odisha: [20.9517, 85.0985],
  punjab: [31.1471, 75.3412],
  rajasthan: [27.0238, 74.2179],
  "tamil nadu": [11.1271, 78.6569],
  telangana: [17.1232, 79.2088],
  "uttar pradesh": [26.8467, 80.9462],
  "west bengal": [22.9868, 87.855],
  delhi: [28.7041, 77.1025],
  india: [22.5937, 78.9629],
  unknown: [21.5, 79.2],
};

const resolveStateCoords = (state) => {
  const key = normalizeStateKey(state);
  if (INDIA_STATE_COORDS[key]) return INDIA_STATE_COORDS[key];
  const fuzzy = Object.keys(INDIA_STATE_COORDS).find(
    (candidate) => key.includes(candidate) || candidate.includes(key)
  );
  return fuzzy ? INDIA_STATE_COORDS[fuzzy] : INDIA_STATE_COORDS.india;
};

const bubbleSize = (count, maxCount) => {
  if (!maxCount) return 32;
  const ratio = Math.sqrt(count / maxCount);
  return Math.round(28 + ratio * 22);
};

const createStateBubbleIcon = (count, maxCount, isActive) => {
  const size = bubbleSize(count, maxCount);
  return L.divIcon({
    className: "admin-ai-state-bubble-shell",
    html: `<div class="admin-ai-state-bubble ${isActive ? "is-active" : ""}" style="width:${size}px;height:${size}px;font-size:${size > 38 ? "0.72rem" : "0.65rem"}">${fmtNum(count)}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2)],
  });
};

const MapFlyTo = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2) {
      map.flyTo(center, zoom || 5, { animate: true, duration: 0.6 });
    }
  }, [center, zoom, map]);
  return null;
};

const normalizeStateLabel = (state) => {
  const value = String(state || "").trim();
  if (!value || value === "-") return "Unknown";
  return value;
};

const normalizeStateRows = (rows) => {
  const merged = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const state = normalizeStateLabel(row?.state);
    const count = pickNumber(row?.count, row?.total, row?.lenders);
    const existing = merged.get(state) || { state, count: 0 };
    existing.count += count;
    merged.set(state, existing);
  });
  return Array.from(merged.values()).sort((a, b) => b.count - a.count);
};

const AdminAIUserGeographyPanel = ({ stateRows = [], platformStats = {} }) => {
  const [selectedState, setSelectedState] = useState("");

  const states = useMemo(() => normalizeStateRows(stateRows), [stateRows]);
  const maxCount = useMemo(() => Math.max(...states.map((row) => row.count), 1), [states]);
  const totalActive = useMemo(
    () => states.reduce((sum, row) => sum + row.count, 0),
    [states]
  );
  const platformActive = pickNumber(platformStats?.allActiveLenders, totalActive);

  useEffect(() => {
    if (!selectedState && states.length > 0) {
      setSelectedState(states[0].state);
    }
  }, [states, selectedState]);

  const activeState = useMemo(
    () => states.find((row) => row.state === selectedState) || states[0] || null,
    [states, selectedState]
  );

  const mapCenter = useMemo(
    () => (activeState ? resolveStateCoords(activeState.state) : [22.5937, 78.9629]),
    [activeState]
  );

  return (
    <section className="admin-ai-panel admin-ai-map-panel admin-ai-geo-panel admin-ai-geo-panel-compact">
      <div className="admin-ai-panel-head">
        <div>
          <h4>Active Lenders by State</h4>
          <p>
            Lenders who participated in at least one deal, grouped by state.
            {" "}
            <strong>{fmtNum(platformActive)}</strong> active lenders platform-wide.
          </p>
        </div>
        <div className="admin-ai-geo-legend-head">
          <span className="admin-ai-geo-legend-chip lender">Bubble = active lender count</span>
        </div>
      </div>

      <div className="admin-ai-geo-state-ribbon-wrap">
        <div className="admin-ai-geo-state-ribbon admin-ai-geo-state-ribbon-compact">
          {states.map((row) => (
            <button
              key={row.state}
              type="button"
              className={`admin-ai-geo-state-chip admin-ai-geo-state-chip-active-only ${row.state === "Unknown" ? "unknown" : ""} ${selectedState === row.state ? "active" : ""}`}
              onClick={() => setSelectedState(row.state)}
            >
              <strong>{row.state}</strong>
              <span className="l">{fmtNum(row.count)}</span>
            </button>
          ))}
        </div>
        {platformActive > 0 ? (
          <div className="admin-ai-geo-platform-total">
            States mapped: <strong>{fmtNum(states.length)}</strong>
            {" · "}
            Active lenders on map: <strong>{fmtNum(totalActive)}</strong>
            {totalActive < platformActive ? (
              <span> (of {fmtNum(platformActive)} total)</span>
            ) : null}
          </div>
        ) : null}
      </div>

      {activeState ? (
        <div className="admin-ai-geo-state-hero admin-ai-geo-state-hero-compact">
          <div className="admin-ai-geo-state-hero-main">
            <h5>{activeState.state}</h5>
            <p>Active lenders with deal participation in this state</p>
          </div>
          <div className="admin-ai-geo-state-hero-metrics">
            <div className="metric lender">
              <small>Active Lenders</small>
              <strong>{fmtNum(activeState.count)}</strong>
            </div>
            <div className="metric total">
              <small>Share of Platform</small>
              <strong>
                {platformActive > 0
                  ? `${((activeState.count / platformActive) * 100).toFixed(1)}%`
                  : "—"}
              </strong>
            </div>
          </div>
        </div>
      ) : null}

      <div className="admin-ai-geo-map-shell admin-ai-geo-map-shell-compact">
        <MapContainer
          center={[22.5937, 78.9629]}
          zoom={5}
          minZoom={4}
          maxZoom={8}
          className="admin-ai-geo-map admin-ai-geo-map-compact"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapFlyTo center={mapCenter} zoom={activeState?.state === "Unknown" ? 5 : 6} />
          {states.map((row) => (
            <Marker
              key={row.state}
              position={resolveStateCoords(row.state)}
              icon={createStateBubbleIcon(row.count, maxCount, selectedState === row.state)}
              eventHandlers={{ click: () => setSelectedState(row.state) }}
            >
              <Popup>
                <div className="admin-ai-geo-popup">
                  <strong>{row.state}</strong>
                  <div>Active lenders: {fmtNum(row.count)}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
};

export default AdminAIUserGeographyPanel;
