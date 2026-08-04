import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FaMapMarkedAlt, FaSearch, FaUserFriends } from "react-icons/fa";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getAdminAIActiveLendersByState } from "../../../HttpRequest/admin";

const fmtNum = (n) => (n == null ? "0" : Number(n).toLocaleString("en-IN"));
const fmtMoney = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN")}`;
const pickNumber = (...values) => {
  for (const value of values) {
    if (value != null && value !== "" && !Number.isNaN(Number(value))) return Number(value);
  }
  return 0;
};
const responseData = (payload) => payload?.data || payload || {};

const normalizeStateKey = (state) =>
  String(state || "unknown")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const titleCaseState = (state) => {
  const raw = String(state || "").trim();
  if (!raw || raw === "-" || normalizeStateKey(raw) === "unknown") return "Unknown";
  return raw
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const INDIA_STATE_COORDS = {
  "andhra pradesh": [15.9129, 79.74],
  arunachal: [28.218, 94.7278],
  "arunachal pradesh": [28.218, 94.7278],
  assam: [26.2006, 92.9376],
  bihar: [25.0961, 85.3131],
  chhattisgarh: [21.2787, 81.8661],
  goa: [15.2993, 74.124],
  gujarat: [22.2587, 71.1924],
  haryana: [29.0588, 76.0856],
  "himachal pradesh": [31.1048, 77.1734],
  jharkhand: [23.6102, 85.2799],
  karnataka: [15.3173, 75.7139],
  kerala: [10.8505, 76.2711],
  "madhya pradesh": [22.9734, 78.6569],
  maharashtra: [19.7515, 75.7139],
  manipur: [24.6637, 93.9063],
  meghalaya: [25.467, 91.3662],
  mizoram: [23.1645, 92.9376],
  nagaland: [26.1584, 94.5624],
  odisha: [20.9517, 85.0985],
  orissa: [20.9517, 85.0985],
  punjab: [31.1471, 75.3412],
  rajasthan: [27.0238, 74.2179],
  sikkim: [27.533, 88.5122],
  "tamil nadu": [11.1271, 78.6569],
  telangana: [17.1232, 79.2088],
  tripura: [23.9408, 91.9882],
  "uttar pradesh": [26.8467, 80.9462],
  uttarakhand: [30.0668, 79.0193],
  "west bengal": [22.9868, 87.855],
  delhi: [28.7041, 77.1025],
  "nct of delhi": [28.7041, 77.1025],
  "jammu and kashmir": [33.7782, 76.5762],
  ladakh: [34.1526, 77.577],
  puducherry: [11.9416, 79.8083],
  chandigarh: [30.7333, 76.7794],
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
  if (!maxCount) return 34;
  const ratio = Math.sqrt(count / maxCount);
  return Math.round(30 + ratio * 28);
};

const createStateBubbleIcon = (count, maxCount, isActive, rank) => {
  const size = bubbleSize(count, maxCount);
  return L.divIcon({
    className: "admin-ai-gov-map-bubble-shell",
    html: `<div class="admin-ai-gov-map-bubble ${isActive ? "is-active" : ""}" style="--bubble:${size}px">
      <span class="admin-ai-gov-map-bubble-rank">#${rank}</span>
      <strong>${fmtNum(count)}</strong>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

const MapFlyTo = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2) {
      map.flyTo(center, zoom || 5, { animate: true, duration: 0.55 });
    }
  }, [center, zoom, map]);
  return null;
};

const normalizeStateRows = (rows) => {
  const merged = new Map();
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const state = titleCaseState(row?.state);
    const key = normalizeStateKey(state);
    const count = pickNumber(row?.count, row?.total, row?.lenders);
    const existing = merged.get(key) || { state, count: 0 };
    existing.state = state;
    existing.count += count;
    merged.set(key, existing);
  });
  return Array.from(merged.values())
    .sort((a, b) => b.count - a.count)
    .map((row, index) => ({ ...row, rank: index + 1 }));
};

const AdminAIUserGeographyPanel = ({ stateRows = [], platformStats = {} }) => {
  const [selectedState, setSelectedState] = useState("");
  const [stateQuery, setStateQuery] = useState("");
  const [lenders, setLenders] = useState([]);
  const [lendersPage, setLendersPage] = useState(1);
  const [lendersTotal, setLendersTotal] = useState(0);
  const [lendersLoading, setLendersLoading] = useState(false);
  const [lendersError, setLendersError] = useState("");

  const states = useMemo(() => normalizeStateRows(stateRows), [stateRows]);
  const maxCount = useMemo(() => Math.max(...states.map((row) => row.count), 1), [states]);
  const totalActive = useMemo(() => states.reduce((sum, row) => sum + row.count, 0), [states]);
  const platformActive = pickNumber(platformStats?.allActiveLenders, totalActive);

  const filteredStates = useMemo(() => {
    const q = stateQuery.trim().toLowerCase();
    if (!q) return states;
    return states.filter((row) => row.state.toLowerCase().includes(q));
  }, [states, stateQuery]);

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

  const loadStateLenders = useCallback(async (stateName, page = 1) => {
    if (!stateName) return;
    setLendersLoading(true);
    setLendersError("");
    try {
      const data = responseData(await getAdminAIActiveLendersByState(stateName, page, 20));
      if (data.status === "FAILED") {
        throw new Error(data.message || "Failed to load lenders for this state.");
      }
      setLenders(Array.isArray(data.rows) ? data.rows : []);
      setLendersTotal(pickNumber(data.totalCount));
      setLendersPage(pickNumber(data.pageNo, page) || page);
    } catch (error) {
      setLenders([]);
      setLendersTotal(0);
      setLendersError(error?.response?.data?.message || error?.message || "Failed to load lenders.");
    } finally {
      setLendersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeState?.state) {
      loadStateLenders(activeState.state, 1);
    }
  }, [activeState?.state, loadStateLenders]);

  const selectState = (stateName) => {
    setSelectedState(stateName);
  };

  const totalPages = Math.max(1, Math.ceil(lendersTotal / 20));

  return (
    <section className="admin-ai-gov-geo">
      <div className="admin-ai-gov-geo-head">
        <div className="admin-ai-gov-geo-head-main">
          <span className="admin-ai-gov-geo-kicker">National coverage · Active lenders</span>
          <h4>Active Lenders by State</h4>
          <p>
            Official state-wise distribution of lenders with at least one deal participation.
            Click a state bubble or list row to inspect lender records.
          </p>
        </div>
        <div className="admin-ai-gov-geo-head-stats">
          <div>
            <small>Platform active</small>
            <strong>{fmtNum(platformActive)}</strong>
          </div>
          <div>
            <small>States mapped</small>
            <strong>{fmtNum(states.length)}</strong>
          </div>
          <div>
            <small>On map</small>
            <strong>{fmtNum(totalActive)}</strong>
          </div>
        </div>
      </div>

      <div className="admin-ai-gov-geo-layout">
        <div className="admin-ai-gov-geo-map-col">
          <div className="admin-ai-gov-geo-map-shell">
            <MapContainer
              center={[22.5937, 78.9629]}
              zoom={5}
              minZoom={4}
              maxZoom={10}
              maxBounds={[
                [6.5, 66.5],
                [37.5, 98.5],
              ]}
              maxBoundsViscosity={0.85}
              className="admin-ai-gov-geo-map"
              scrollWheelZoom
            >
              <TileLayer
                attribution='&copy; OpenStreetMap &copy; CARTO'
                url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
              />
              <TileLayer
                attribution=""
                url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                pane="overlayPane"
              />
              <MapFlyTo center={mapCenter} zoom={activeState?.state === "Unknown" ? 5 : 6} />
              {states.map((row) => (
                <Marker
                  key={row.state}
                  position={resolveStateCoords(row.state)}
                  icon={createStateBubbleIcon(row.count, maxCount, selectedState === row.state, row.rank)}
                  eventHandlers={{ click: () => selectState(row.state) }}
                  title={`${row.state}: ${fmtNum(row.count)} active lenders`}
                />
              ))}
            </MapContainer>
          </div>
          {activeState ? (
            <div className="admin-ai-gov-geo-selected">
              <div>
                <span>Selected state</span>
                <h5>{activeState.state}</h5>
              </div>
              <div className="admin-ai-gov-geo-selected-metrics">
                <div>
                  <small>Active lenders</small>
                  <strong>{fmtNum(activeState.count)}</strong>
                </div>
                <div>
                  <small>National share</small>
                  <strong>
                    {platformActive > 0
                      ? `${((activeState.count / platformActive) * 100).toFixed(1)}%`
                      : "—"}
                  </strong>
                </div>
                <div>
                  <small>Rank</small>
                  <strong>#{activeState.rank}</strong>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <aside className="admin-ai-gov-geo-side">
          <div className="admin-ai-gov-geo-side-block">
            <div className="admin-ai-gov-geo-side-head">
              <FaMapMarkedAlt />
              <strong>State ranking</strong>
            </div>
            <label className="admin-ai-gov-geo-search">
              <FaSearch />
              <input
                type="search"
                value={stateQuery}
                onChange={(event) => setStateQuery(event.target.value)}
                placeholder="Search state"
              />
            </label>
            <div className="admin-ai-gov-geo-rank-list">
              {filteredStates.map((row) => (
                <button
                  key={row.state}
                  type="button"
                  className={`admin-ai-gov-geo-rank-row ${selectedState === row.state ? "is-active" : ""}`}
                  onClick={() => selectState(row.state)}
                >
                  <span className="rank">#{row.rank}</span>
                  <span className="name">{row.state}</span>
                  <span className="count">{fmtNum(row.count)}</span>
                </button>
              ))}
              {!filteredStates.length ? (
                <div className="admin-ai-gov-geo-empty">No states match your search.</div>
              ) : null}
            </div>
          </div>

          <div className="admin-ai-gov-geo-side-block admin-ai-gov-geo-users">
            <div className="admin-ai-gov-geo-side-head">
              <FaUserFriends />
              <strong>
                Lenders in {activeState?.state || "state"}
              </strong>
              <em>{fmtNum(lendersTotal)}</em>
            </div>
            {lendersError ? <div className="admin-ai-gov-geo-error">{lendersError}</div> : null}
            {lendersLoading ? (
              <div className="admin-ai-gov-geo-empty">Loading lender records...</div>
            ) : (
              <div className="admin-ai-gov-geo-user-list">
                {lenders.map((row) => (
                  <article key={row.lenderId} className="admin-ai-gov-geo-user-card">
                    <div className="admin-ai-gov-geo-user-card-top">
                      <strong>{row.name || `Lender ${row.lenderId}`}</strong>
                      <span>{row.lenderCode || `LR${row.lenderId}`}</span>
                    </div>
                    <div className="admin-ai-gov-geo-user-card-meta">
                      <span>ID {row.lenderId}</span>
                      <span>{row.mobileNumber || "—"}</span>
                      <span>{row.city || "—"}</span>
                    </div>
                    <div className="admin-ai-gov-geo-user-card-foot">
                      <span>{fmtNum(row.dealsCount)} deals</span>
                      <span>{fmtMoney(row.participatedAmount)}</span>
                    </div>
                  </article>
                ))}
                {!lenders.length && !lendersError ? (
                  <div className="admin-ai-gov-geo-empty">No lender records found for this state.</div>
                ) : null}
              </div>
            )}
            {lendersTotal > 20 ? (
              <div className="admin-ai-gov-geo-pager">
                <button
                  type="button"
                  disabled={lendersPage <= 1 || lendersLoading}
                  onClick={() => loadStateLenders(activeState.state, lendersPage - 1)}
                >
                  Previous
                </button>
                <span>
                  {lendersPage}/{totalPages}
                </span>
                <button
                  type="button"
                  disabled={lendersPage >= totalPages || lendersLoading}
                  onClick={() => loadStateLenders(activeState.state, lendersPage + 1)}
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
};

export default AdminAIUserGeographyPanel;