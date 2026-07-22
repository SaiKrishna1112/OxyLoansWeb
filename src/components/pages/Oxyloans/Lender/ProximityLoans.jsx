import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../../Header/Header";
import SideBar from "../../../SideBar/SideBar";
import {
  getBorrowerListNearByRedius,
  getUserDetailsForBorrower,
  getBorrowerDocuments,
  lenderInterestedBorrowers,
  getBorrowerLoanDetails,
} from "../../../HttpRequest/afterlogin";
import Swal from "sweetalert2";
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

// Fix Leaflet default icon paths broken by webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const PRIMARY = "#3d5ee1";
const LOAD_SIZE = 50;
const PAGE_FETCH_SIZE = 1000;

// ── Custom Leaflet marker icons ───────────────────────────────────
const borrowerIcon = new L.DivIcon({
  className: "",
  html: '<div style="width:32px;height:32px;background:#28a745;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2.5px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><i class="fa fa-user" style="color:#fff;font-size:12px;transform:rotate(45deg);"></i></div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -34],
});

const lenderIcon = new L.DivIcon({
  className: "",
  html: '<div style="position:relative;"><div style="width:46px;height:46px;background:#3d5ee1;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 4px rgba(61,94,225,0.28),0 6px 16px rgba(0,0,0,0.28);display:flex;align-items:center;justify-content:center;"><i class="fa fa-home" style="color:#fff;font-size:18px;"></i></div><div style="position:absolute;top:49px;left:50%;transform:translateX(-50%);background:#3d5ee1;color:#fff;font-size:10px;font-weight:800;letter-spacing:0.2px;border-radius:6px;padding:3px 8px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.22);">YOUR LOCATION</div></div>',
  iconSize: [46, 66],
  iconAnchor: [23, 23],
  popupAnchor: [0, -26],
});

// Fly map to lender position on first load
const MapFlyTo = ({ center, zoom }) => {
  const map = useMap();
  const didFly = React.useRef(false);
  useEffect(() => {
    if (center && !didFly.current) {
      map.flyTo(center, zoom, { animate: true, duration: 1 });
      didFly.current = true;
    }
  }, [center, zoom, map]);
  return null;
};

// ── Inline Map View ───────────────────────────────────────────────
const MapView = ({
  borrowers,
  allBorrowers,
  distanceFilter,
  searchQuery,
  onDistanceChange,
  onSearchChange,
  onSelect,
  DISTANCE_OPTIONS,
  totalCount,
}) => {
  const [hoveredId, setHoveredId] = useState(null);

  const lenderPos = useMemo(() => {
    const src = allBorrowers[0];
    if (src?.lenderLat && src?.lenderLng) return [src.lenderLat, src.lenderLng];
    return null;
  }, [allBorrowers]);

  const mapCenter = lenderPos ?? [20.5937, 78.9629];
  const mapZoom = lenderPos ? 13 : 5;

  // Show ALL filtered borrowers on map (not just current sidebar page)
  const mapBorrowers = useMemo(() => {
    let list = allBorrowers;
    if (distanceFilter !== "ALL")
      list = list.filter(
        (b) => b.distance != null && b.distance <= distanceFilter,
      );
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (b) =>
          (b.borrowerName && b.borrowerName.toLowerCase().includes(q)) ||
          (b.borrowerId && String(b.borrowerId).toLowerCase().includes(q)),
      );
    }
    return list;
  }, [allBorrowers, distanceFilter, searchQuery]);

  return (
    <>
      {/* Filter bar */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e9ecef",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          flexShrink: 0,
        }}
      >
        <div style={{ position: "relative", minWidth: 200, flex: "0 1 240px" }}>
          <i
            className="fa fa-search"
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#aaa",
              fontSize: 13,
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            placeholder="Search borrower name or ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: "100%",
              paddingLeft: 30,
              paddingRight: 10,
              height: 34,
              border: "1px solid #ddd",
              borderRadius: 20,
              fontSize: 12,
              outline: "none",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 12, color: "#666", whiteSpace: "nowrap" }}>
            <i className="fa fa-map-marker me-1" style={{ color: PRIMARY }} />
            Distance:
          </span>
          {DISTANCE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className="btn btn-sm"
              style={{
                borderRadius: 20,
                padding: "3px 12px",
                fontSize: 11,
                fontWeight: 600,
                background: distanceFilter === opt.value ? PRIMARY : "#f0f0f0",
                color: distanceFilter === opt.value ? "#fff" : "#555",
                border:
                  distanceFilter === opt.value
                    ? `1px solid ${PRIMARY}`
                    : "1px solid #ddd",
              }}
              onClick={() => onDistanceChange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <small className="text-muted ms-auto" style={{ whiteSpace: "nowrap" }}>
          <strong>{totalCount}</strong> borrower{totalCount !== 1 ? "s" : ""}{" "}
          found
        </small>
      </div>

      {/* Map + Sidebar */}
      <div
        style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}
      >
        {/* Leaflet Map */}
        <div style={{ flex: 1, position: "relative" }}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ width: "100%", height: "100%" }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapFlyTo center={lenderPos} zoom={13} />

            {/* Lender marker + distance ring */}
            {lenderPos && (
              <>
                <Marker position={lenderPos} icon={lenderIcon}>
                  <Popup>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      Your Location
                    </div>
                  </Popup>
                </Marker>
                {distanceFilter !== "ALL" && (
                  <Circle
                    center={lenderPos}
                    radius={distanceFilter * 1000}
                    pathOptions={{
                      color: PRIMARY,
                      fillColor: PRIMARY,
                      fillOpacity: 0.05,
                      weight: 1.5,
                      dashArray: "6 4",
                    }}
                  />
                )}
              </>
            )}

            {/* Borrower markers */}
            {mapBorrowers.map((borrower, idx) => {
              if (!borrower.borrowerLat || !borrower.borrowerLng) return null;
              const isHighlighted = hoveredId === (borrower.borrowerId || idx);
              const icon = isHighlighted
                ? new L.DivIcon({
                    className: "",
                    html: '<div style="width:38px;height:38px;background:#1a7a4a;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 4px 12px rgba(40,167,69,0.5);display:flex;align-items:center;justify-content:center;"><i class="fa fa-user" style="color:#fff;font-size:14px;transform:rotate(45deg);"></i></div>',
                    iconSize: [38, 38],
                    iconAnchor: [19, 38],
                    popupAnchor: [0, -40],
                  })
                : borrowerIcon;
              return (
                <Marker
                  key={borrower.borrowerId || idx}
                  position={[borrower.borrowerLat, borrower.borrowerLng]}
                  icon={icon}
                  eventHandlers={{
                    mouseover: () => setHoveredId(borrower.borrowerId || idx),
                    mouseout: () => setHoveredId(null),
                    click: () => onSelect(borrower),
                  }}
                >
                  {/* Hover tooltip — rich borrower card */}
                  <Tooltip
                    direction="top"
                    offset={[0, -36]}
                    opacity={1}
                    permanent={false}
                  >
                    <div style={{ minWidth: 180, padding: "2px 0" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: PRIMARY,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <i
                            className="fa fa-user"
                            style={{ color: "#fff", fontSize: 13 }}
                          />
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: 13,
                              color: "#1a1f36",
                              lineHeight: 1.2,
                            }}
                          >
                            {borrower.borrowerName || `Borrower #${idx + 1}`}
                          </div>
                          <div style={{ fontSize: 11, color: "#6c757d" }}>
                            ID: {borrower.borrowerId ? `••••${String(borrower.borrowerId).slice(-2)}` : "—"}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 12,
                          color: "#555",
                          marginBottom: 4,
                        }}
                      >
                        <i
                          className="fa fa-map-marker"
                          style={{ color: "#dc3545", fontSize: 11 }}
                        />
                        {borrower.distance != null
                          ? `${Number(borrower.distance).toFixed(2)} km away`
                          : "Distance N/A"}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#888",
                          borderTop: "1px solid #eee",
                          paddingTop: 4,
                          marginTop: 2,
                        }}
                      >
                        Click marker to view full details
                      </div>
                    </div>
                  </Tooltip>
                  {/* Click popup — action button */}
                  <Popup>
                    <div style={{ minWidth: 160 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          marginBottom: 4,
                        }}
                      >
                        {borrower.borrowerName || `Borrower #${idx + 1}`}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#666", marginBottom: 6 }}
                      >
                        <i
                          className="fa fa-map-marker me-1"
                          style={{ color: "#dc3545" }}
                        />
                        {borrower.distance != null
                          ? `${Number(borrower.distance).toFixed(2)} km away`
                          : "Distance N/A"}
                      </div>
                      <button
                        className="btn btn-sm w-100"
                        style={{
                          background: PRIMARY,
                          color: "#fff",
                          fontSize: 12,
                          borderRadius: 6,
                        }}
                        onClick={() => onSelect(borrower)}
                      >
                        <i className="fa fa-eye me-1" />
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Sidebar */}
        <div
          style={{
            width: 300,
            background: "#fff",
            borderLeft: "1px solid #e9ecef",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: "14px 16px 10px",
              borderBottom: "1px solid #e9ecef",
              background: "#f8f9fa",
            }}
          >
            <h6
              className="mb-0 fw-bold"
              style={{ color: "#1a1f36", fontSize: 14 }}
            >
              <i className="fa fa-users me-1" style={{ color: "#28a745" }} />
              Nearby Borrowers
            </h6>
            <small className="text-muted">
              Explore and invest in loan opportunities from borrowers in your vicinity.
            </small>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
            {borrowers.length === 0 ? (
              <div
                className="text-center py-4 text-muted"
                style={{ fontSize: 13 }}
              >
                <i className="fa fa-search fa-2x mb-2 d-block" />
                No borrowers match your filters.
              </div>
            ) : (
              borrowers.map((borrower, idx) => {
                const isActive = hoveredId === (borrower.borrowerId || idx);
                return (
                  <div
                    key={borrower.borrowerId || idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 10px",
                      marginBottom: 6,
                      borderRadius: 8,
                      background: isActive ? PRIMARY + "12" : "#f8f9fa",
                      border: `1.5px solid ${isActive ? PRIMARY + "50" : "#e9ecef"}`,
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                      transform: isActive ? "translateX(3px)" : "none",
                    }}
                    onMouseEnter={() =>
                      setHoveredId(borrower.borrowerId || idx)
                    }
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => onSelect(borrower)}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: isActive ? PRIMARY : PRIMARY + "20",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "background 0.18s",
                      }}
                    >
                      <i
                        className="fa fa-user"
                        style={{
                          color: isActive ? "#fff" : PRIMARY,
                          fontSize: 14,
                        }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="fw-semibold text-truncate"
                        style={{ fontSize: 13, color: "#1a1f36" }}
                      >
                        {borrower.borrowerName || `Borrower #${idx + 1}`}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#6c757d",
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        <i
                          className="fa fa-map-marker"
                          style={{ color: "#dc3545", fontSize: 10 }}
                        />
                        {borrower.distance != null
                          ? `${Number(borrower.distance).toFixed(1)} km`
                          : "N/A"}
                      </div>
                    </div>
                    <i
                      className="fa fa-chevron-right"
                      style={{
                        color: isActive ? PRIMARY : "#ccc",
                        fontSize: 10,
                        transition: "color 0.18s",
                      }}
                    />
                  </div>
                );
              })
            )}
          </div>
          {/* Footer: legend */}
          <div style={{ padding: "10px 16px", borderTop: "1px solid #e9ecef", background: "#f8f9fa" }}>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, background: "#28a745", borderRadius: "50%" }} />
                <small className="text-muted" style={{ fontSize: 11 }}>Borrower</small>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, background: "#3d5ee1", borderRadius: "50%" }} />
                <small className="text-muted" style={{ fontSize: 11 }}>You</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Lender Consent Items ──────────────────────────────────────────
const LENDER_CONSENTS = [
  {
    id: "loan_processing",
    title: "1. Loan Processing Consent",
    subtitle: "Consent to evaluate and process borrower's loan request",
    text: "I hereby confirm that I have reviewed the borrower's loan application and supporting documents. I consent to proceed with the evaluation, processing, and decision-making for this loan request in accordance with applicable policies and guidelines.",
  },
  {
    id: "credit_assessment",
    title: "2. Credit Assessment Consent",
    subtitle: "Consent to assess borrower's creditworthiness",
    text: "I authorize the platform to access and evaluate the borrower's credit profile, including credit bureau data such as CIBIL score, repayment history, and outstanding obligations, for the purpose of making an informed lending decision.",
  },
  {
    id: "doc_verification",
    title: "3. Document Verification Consent",
    subtitle: "Consent to verify submitted documents",
    text: "I consent to the verification and validation of all documents submitted by the borrower, including identity, address, income, and financial records, through authorized third-party verification agencies if required.",
  },
  {
    id: "loan_approval",
    title: "4. Loan Approval Consent",
    subtitle: "Consent to approve and sanction loan",
    text: "I confirm that based on the available information and risk assessment, I approve the loan for the borrower under the agreed terms and conditions, subject to final documentation and compliance checks.",
  },
  {
    id: "disbursement",
    title: "5. Disbursement Consent",
    subtitle: "Consent to release loan funds",
    text: "I authorize the disbursement of the approved loan amount to the borrower's designated bank account after successful completion of all required checks and formalities.",
  },
  {
    id: "data_sharing",
    title: "6. Data Sharing Consent",
    subtitle: "Consent for sharing borrower data",
    text: "I agree that the borrower's information may be securely shared with relevant financial institutions, credit bureaus, and regulatory authorities as required for loan processing, reporting, and compliance purposes.",
  },
  {
    id: "risk_acknowledgment",
    title: "7. Risk Acknowledgment",
    subtitle: "Lender acknowledges financial risk",
    text: "I understand and acknowledge that lending involves financial risk, including the possibility of delayed payments or default, and I accept full responsibility for my lending decision.",
  },
  {
    id: "compliance",
    title: "8. Compliance & Regulatory Consent",
    subtitle: "Adherence to legal and regulatory requirements",
    text: "I confirm that this lending decision complies with all applicable laws, regulations, and internal risk policies, and I agree to adhere to ongoing compliance requirements.",
  },
];
// ── Helpers ───────────────────────────────────────────────────────
const DOC_LABELS = {
  // 1. Identity Verification
  AADHAR: "Aadhaar Card",
  PAN: "PAN Card",
  PASSPORT: "Passport",
  DRIVINGLICENCE: "Driving License",
  VOTERID: "Voter ID",
  // 2. Address Verification
  UTILITYBILL: "Utility Bill",
  RENTALAGGREEMENT: "Rental / Lease Agreement",
  // 3. Income Proof – Salaried
  PAYSLIPS: "Salary Slips (Last 3 Months)",
  BANKSTATEMENT: "Bank Statement (Last 6 Months)",
  FORM16: "Form 16",
  EMPLOYEEID: "Employee ID / Offer Letter",
  // 4. Income Proof – Self-Employed
  ITR: "Income Tax Returns",
  GSTCERTIFICATE: "GST Registration Certificate",
  BUSINESSREG: "Business Registration Proof",
  PLSTATEMENT: "Profit & Loss Statement",
  CURRENTACCSTMT: "Bank Statement (Current Account)",
  // 5. Bank Details
  CHEQUELEAF: "Cancelled Cheque",
  BANKPASSBOOK: "Bank Passbook Copy",
  // 6. Credit Information
  CIBILREPORT: "CIBIL Report",
  CREDITREPORT: "Credit Report",
  EXISTINGLOAN: "Existing Loan Statements",
  // 7. Loan-Specific
  PROPERTYDOC: "Property Documents",
  BUILDERAPPROVAL: "Builder Approval Documents",
  VEHICLEINVOICE: "Vehicle Invoice / Quotation",
  COMPANYINCORP: "Company Incorporation Certificate",
  MOAAOA: "MOA / AOA / Partnership Deed",
  // Education (legacy)
  TENTH: "10th Certificate",
  INTER: "Intermediate Certificate",
  GRADUATION: "Graduation Certificate",
};

// Category groups — drives section headers and sort order in the KYC tab
const DOC_CATEGORIES = [
  {
    label: "1. Identity Verification",
    description: "Proof of borrower identity (KYC compliance)",
    keys: ["AADHAR", "PAN", "PASSPORT", "DRIVINGLICENCE", "VOTERID"],
  },
  {
    label: "2. Address Verification",
    description: "Proof of current residential address",
    keys: ["UTILITYBILL", "RENTALAGGREEMENT"],
  },
  {
    label: "3. Income Proof (Salaried)",
    description: "Verification of stable monthly income",
    keys: ["PAYSLIPS", "BANKSTATEMENT", "FORM16", "EMPLOYEEID"],
  },
  {
    label: "4. Income Proof (Self-Employed)",
    description: "Verification of business or professional income",
    keys: [
      "ITR",
      "GSTCERTIFICATE",
      "BUSINESSREG",
      "PLSTATEMENT",
      "CURRENTACCSTMT",
    ],
  },
  {
    label: "5. Bank Details",
    description: "Verification of active bank account",
    keys: ["CHEQUELEAF", "BANKPASSBOOK"],
  },
  {
    label: "6. Credit Information",
    description: "Assessment of creditworthiness",
    keys: ["CIBILREPORT", "CREDITREPORT", "EXISTINGLOAN"],
  },
  {
    label: "7. Loan-Specific Documents",
    description: "Documents based on loan type",
    keys: [
      "PROPERTYDOC",
      "BUILDERAPPROVAL",
      "VEHICLEINVOICE",
      "COMPANYINCORP",
      "MOAAOA",
    ],
  },
  {
    label: "8. Education Documents",
    description: "Academic qualification proof",
    keys: ["TENTH", "INTER", "GRADUATION"],
  },
];

// Flat ordered list derived from categories (for simple sort fallback)
const DOC_ORDER = DOC_CATEGORIES.flatMap((c) => c.keys);

const isImage = (fileName = "") => /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
const isPdf = (fileName = "") => /\.pdf$/i.test(fileName);
const getApiErrorMessage = (responseOrError) =>
  responseOrError?.response?.data?.errorMessage ||
  responseOrError?.response?.data?.message ||
  responseOrError?.data?.errorMessage ||
  responseOrError?.data?.message ||
  "Could not send offer.";

const StatusBadge = ({ status }) => {
  const color =
    status === "ACCEPTED"
      ? "#28a745"
      : status === "UPLOADED"
        ? PRIMARY
        : "#6c757d";
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        color,
        background: color + "18",
        borderRadius: 4,
        padding: "2px 7px",
      }}
    >
      {status}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────
const ProximityLoans = () => {
  const navigate = useNavigate();
  const [borrowers, setBorrowers] = useState([]);
  const [allBorrowers, setAllBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(LOAD_SIZE);
  const [distanceFilter, setDistanceFilter] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("map"); // "map" | "list"

  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const [showOffer, setShowOffer] = useState(false);
  const [offerData, setOfferData] = useState({
    amount: "",
    tenure: "",
    roi: "",
    comments: "",
    durationType: "Days",
    repaymentMethodForLender: "PI",
    consentItems: new Array(LENDER_CONSENTS.length).fill(false),
  });
  const [offerErrors, setOfferErrors] = useState({});
  const [offerLoading, setOfferLoading] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);

  const [viewDoc, setViewDoc] = useState(null);

  const agreeAllConsentsRef = React.useRef(null);
  const allConsentsChecked = offerData.consentItems.every(Boolean);
  const someConsentsChecked = offerData.consentItems.some(Boolean);

  useEffect(() => {
    if (!agreeAllConsentsRef.current) return;
    agreeAllConsentsRef.current.indeterminate =
      someConsentsChecked && !allConsentsChecked;
  }, [someConsentsChecked, allConsentsChecked, showOffer]);

  const DISTANCE_OPTIONS = [
    { label: "All Distances", value: "ALL" },
    { label: "Within 5 km", value: 5 },
    { label: "Within 10 km", value: 10 },
    { label: "Within 25 km", value: 25 },
    { label: "Within 50 km", value: 50 },
    { label: "Within 100 km", value: 100 },
  ];

  // ── Fetch all pages ──────────────────────────────────────────────
  const fetchBorrowers = async () => {
    setLoading(true);
    try {
      const all = [];
      let page = 1;
      while (true) {
        const res = await getBorrowerListNearByRedius(page, PAGE_FETCH_SIZE);
        const batch = Array.isArray(res?.data) ? res.data : [];
        all.push(...batch);
        if (batch.length < PAGE_FETCH_SIZE) break;
        page++;
      }
      setAllBorrowers(all);
    } catch {
      setAllBorrowers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowers();
  }, []);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(LOAD_SIZE);
  }, [distanceFilter, searchQuery]);

  // Distance filter
  useEffect(() => {
    const sorted = (list) =>
      [...list].sort(
        (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity),
      );
    if (distanceFilter === "ALL") {
      setBorrowers(sorted(allBorrowers));
    } else {
      setBorrowers(
        sorted(
          allBorrowers.filter(
            (b) => b.distance != null && b.distance <= distanceFilter,
          ),
        ),
      );
    }
  }, [distanceFilter, allBorrowers]);

  // Search filter on top of distance filter
  const filteredBorrowers = useMemo(() => {
    if (!searchQuery.trim()) return borrowers;
    const q = searchQuery.trim().toLowerCase();
    return borrowers.filter(
      (b) =>
        (b.borrowerName && b.borrowerName.toLowerCase().includes(q)) ||
        (b.borrowerId && String(b.borrowerId).toLowerCase().includes(q)),
    );
  }, [borrowers, searchQuery]);

  const totalCount = filteredBorrowers.length;
  const visibleBorrowers = filteredBorrowers.slice(0, visibleCount);

  // ── Borrower Detail ──────────────────────────────────────────────
  const fetchBorrowerDetail = async (borrower) => {
    setDetailLoading(true);
    setSelectedBorrower({
      ...borrower,
      profileData: null,
      documents: [],
      loanDetails: [],
    });
    setActiveTab("profile");
    setShowOffer(false);
    try {
      const [profileRes, docsRes, loanDetailsRes] = await Promise.allSettled([
        getUserDetailsForBorrower(borrower.borrowerId),
        getBorrowerDocuments(borrower.borrowerId),
        getBorrowerLoanDetails(borrower.borrowerId),
      ]);
      const profileData =
        profileRes.status === "fulfilled"
          ? (profileRes.value?.data ?? null)
          : null;
      const documents =
        docsRes.status === "fulfilled"
          ? Array.isArray(docsRes.value?.data)
            ? docsRes.value.data
            : []
          : [];
      const loanDetails =
        loanDetailsRes.status === "fulfilled"
          ? (loanDetailsRes.value?.data ?? [])
          : [];
      setSelectedBorrower((prev) => ({
        ...prev,
        profileData,
        documents,
        loanDetails,
      }));
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Offer ────────────────────────────────────────────────────────
  const validateOffer = () => {
    const errors = {};
    if (
      !offerData.amount ||
      isNaN(offerData.amount) ||
      Number(offerData.amount) <= 0
    )
      errors.amount = "Enter a valid amount";
    if (
      !offerData.tenure ||
      isNaN(offerData.tenure) ||
      Number(offerData.tenure) <= 0
    )
      errors.tenure = `Enter valid tenure (${offerData.durationType === "Months" ? "months" : "days"})`;
    if (!offerData.roi || isNaN(offerData.roi) || Number(offerData.roi) <= 0)
      errors.roi = "Enter a valid ROI (%)";
    if (!offerData.consentItems.every(Boolean))
      errors.consent =
        "Please read and acknowledge all 8 consent items before proceeding";
    return errors;
  };

  const sendOffer = async () => {
    const errors = validateOffer();
    if (Object.keys(errors).length) {
      setOfferErrors(errors);
      return;
    }
    setOfferLoading(true);
    try {
      const result = await lenderInterestedBorrowers({
        borrowerId: selectedBorrower.borrowerId,
        lenderInterestedAmount: offerData.amount,
        roi: offerData.roi,
        duration: offerData.tenure,
        durationType: offerData.durationType,
        repaymentMethodForLender: offerData.repaymentMethodForLender,
        lenderComments: offerData.comments,
      });
      if (result.status !== 200) {
        const apiMessage = getApiErrorMessage(result);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: apiMessage,
          confirmButtonColor: PRIMARY,
        });
        return;
      }
    Swal.fire({
  icon: "success",
  title: "🎉 Congratulations!",
  text: "Your loan offer has been sent successfully. You will be notified once the borrower reviews and responds.",
  confirmButtonText: "View My Offers",
  showCancelButton: true,
  cancelButtonText: "Close",
  confirmButtonColor: PRIMARY,
}).then((result) => {
  if (result.isConfirmed) {
    navigate("/offerGivenList");
  }
});
      setShowOffer(false);
      setOfferData({
        amount: "",
        tenure: "",
        roi: "",
        comments: "",
        durationType: "Days",
        repaymentMethodForLender: "PI",
        consentItems: new Array(LENDER_CONSENTS.length).fill(false),
      });
    } catch (error) {
      const apiMessage = getApiErrorMessage(error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: apiMessage,
        confirmButtonColor: PRIMARY,
      });
    } finally {
      setOfferLoading(false);
    }
  };

  // ── Detail Screen ────────────────────────────────────────────────
  if (selectedBorrower) {
    const p = selectedBorrower.profileData;
    const docs = selectedBorrower.documents ?? [];
    const loanDetails = selectedBorrower.loanDetails ?? [];

    return (
      <div className="main-wrapper">
        <Header />
        <SideBar />
        <div className="page-wrapper">
          <div className="content container-fluid">
            {/* Back header */}
            <div
              className="page-header"
              style={{
                borderBottom: "1px solid #e9ecef",
                paddingBottom: 16,
                marginBottom: 20,
              }}
            >
              {/* ROW 1 */}
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                {/* Title (Left) */}
                <h4 className="mb-0 fw-bold" style={{ color: "#111827" }}>
                  Borrower Profile & Loan Request
                </h4>

                {/* Buttons (Right) */}
                <div className="d-flex flex-wrap gap-2">
                  {loanDetails.length > 0 && (
                    <button
                      className="btn"
                      style={{
                        background: PRIMARY,
                        color: "#fff",
                        fontWeight: 600,
                        borderRadius: 8,
                        padding: "8px 18px",
                        fontSize: 13,
                        whiteSpace: "nowrap",
                      }}
                      onClick={() => {
                        setShowOffer(true);
                        setOfferErrors({});
                        setOfferData({
                          amount: "",
                          tenure: "",
                          roi: "",
                          comments: "",
                          durationType: "Days",
                          repaymentMethodForLender: "PI",
                          consentItems: new Array(LENDER_CONSENTS.length).fill(
                            false,
                          ),
                        });
                      }}
                    >
                      <i className="fa fa-paper-plane me-1" />
                      Send Loan Offer
                    </button>
                  )}

                  <Link
                    to="/offerGivenList"
                    className="btn btn-outline-secondary"
                    style={{
                      borderRadius: 8,
                      padding: "8px 16px",
                      fontSize: 13,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <i className="fa fa-list-alt me-1" />
                    View My Offers
                  </Link>
                </div>
              </div>

              {/* ROW 2 */}
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-2">
                {/* Subtext (Left) */}
                <span className="text-muted" style={{ fontSize: 13 }}>
                  Review borrower details to assess risk and make a confident
                  lending decision.
                </span>

                {/* Back Button (Right) */}
                <button
                  className="btn btn-sm"
                  style={{
                    border: "1px solid #d0d5dd",
                    color: "#374151",
                    background: "#fff",
                    fontWeight: 500,
                    borderRadius: 8,
                    padding: "6px 14px",
                    whiteSpace: "nowrap",
                  }}
                  onClick={() => setSelectedBorrower(null)}
                >
                  <i className="fa fa-arrow-left me-1" />
                  Back
                </button>
              </div>
            </div>

            {detailLoading && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" />
                <p className="mt-2">Loading borrower details...</p>
              </div>
            )}

            {/* Offer Modal */}
            {showOffer && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.45)",
                  zIndex: 1050,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "20px",
                  overflowY: "auto",
                }}
                onClick={() => setShowOffer(false)}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    width: "100%",
                    maxWidth: 700,
                    maxHeight: "90vh",
                    margin: "auto",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      background: PRIMARY,
                      padding: "14px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexShrink: 0,
                    }}
                  >
                    <h5 className="mb-0 text-white fw-bold">
                      <i className="fa fa-paper-plane me-2" />
                      Send Loan Offer
                    </h5>
                    <button
                      className="btn btn-sm"
                      style={{
                        color: "#fff",
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.4)",
                        borderRadius: 6,
                        padding: "4px 10px",
                      }}
                      onClick={() => setShowOffer(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div
                    style={{
                      padding: "24px 24px 8px",
                      overflowY: "auto",
                      flex: 1,
                    }}
                  >
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label
                          className="form-label fw-semibold"
                          style={{ fontSize: 13 }}
                        >
                          Offer Amount (₹){" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          className={`form-control ${offerErrors.amount ? "is-invalid" : ""}`}
                          placeholder="e.g. 50000"
                          value={offerData.amount}
                          onChange={(e) => {
                            setOfferData({
                              ...offerData,
                              amount: e.target.value,
                            });
                            setOfferErrors({ ...offerErrors, amount: "" });
                          }}
                        />
                        {offerErrors.amount && (
                          <div className="invalid-feedback">
                            {offerErrors.amount}
                          </div>
                        )}
                      </div>
                      {/* <div className="col-md-4">
                        <label
                          className="form-label fw-semibold"
                          style={{ fontSize: 13 }}
                        >
                          Duration <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <input
                            type="number"
                            className={`form-control ${offerErrors.tenure ? "is-invalid" : ""}`}
                            placeholder={offerData.durationType === "Months" ? "e.g. 3" : "e.g. 90"}
                            value={offerData.tenure}
                            onChange={(e) => {
                              setOfferData({
                                ...offerData,
                                tenure: e.target.value,
                              });
                              setOfferErrors({ ...offerErrors, tenure: "" });
                            }}
                          />
                          <select
                            className="form-select"
                            style={{ maxWidth: "110px" }}
                            value={offerData.durationType}
                            onChange={(e) => {
                              setOfferData({
                                ...offerData,
                                durationType: e.target.value,
                              });
                            }}
                          >
                            <option value="Days">Days</option>
                            <option value="Months">Months</option>
                          </select>
                        </div>
                        {offerErrors.tenure && (
                          <div className="text-danger small mt-1" style={{ fontSize: "12px" }}>
                            {offerErrors.tenure}
                          </div>
                        )}
                      </div> */}
                      <div className="input-group">
                        {offerData.durationType === "Months" ? (
                          <select
                            className={`form-select ${offerErrors.tenure ? "is-invalid" : ""}`}
                            value={offerData.tenure}
                            onChange={(e) => {
                              setOfferData({
                                ...offerData,
                                tenure: e.target.value,
                              });
                              setOfferErrors({ ...offerErrors, tenure: "" });
                            }}
                          >
                            <option value="">Select</option>
                            <option value="3">3</option>
                            <option value="6">6</option>
                            <option value="9">9</option>
                            <option value="12">12</option>
                          </select>
                        ) : (
                          <input
                            type="number"
                            className={`form-control ${offerErrors.tenure ? "is-invalid" : ""}`}
                            placeholder="e.g. 90"
                            value={offerData.tenure}
                            onChange={(e) => {
                              setOfferData({
                                ...offerData,
                                tenure: e.target.value,
                              });
                              setOfferErrors({ ...offerErrors, tenure: "" });
                            }}
                          />
                        )}

                        <select
                          className="form-select"
                          style={{ maxWidth: "110px" }}
                          value={offerData.durationType}
                          onChange={(e) => {
                            setOfferData({
                              ...offerData,
                              durationType: e.target.value,
                              tenure: "", // Reset when switching
                            });
                          }}
                        >
                          <option value="Days">Days</option>
                          <option value="Months">Months</option>
                        </select>
                      </div>

                      {offerErrors.tenure && (
                        <div className="text-danger small mt-1" style={{ fontSize: "12px" }}>
                          {offerErrors.tenure}
                        </div>
                      )}
                      <div className="col-md-4">
                        <label
                          className="form-label fw-semibold"
                          style={{ fontSize: 13 }}
                        >
                          ROI (%) <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          className={`form-control ${offerErrors.roi ? "is-invalid" : ""}`}
                          placeholder="e.g. 2"
                          value={offerData.roi}
                          onChange={(e) => {
                            setOfferData({ ...offerData, roi: e.target.value });
                            setOfferErrors({ ...offerErrors, roi: "" });
                          }}
                        />
                        {offerErrors.roi && (
                          <div className="invalid-feedback">
                            {offerErrors.roi}
                          </div>
                        )}
                      </div>
                      <div className="col-12 mt-3">
                        <label
                          className="form-label fw-semibold"
                          style={{ fontSize: 13 }}
                        >
                          Repayment Method <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          value={offerData.repaymentMethodForLender}
                          onChange={(e) => {
                            setOfferData({
                              ...offerData,
                              repaymentMethodForLender: e.target.value,
                            });
                          }}
                        >
                          <option value="PI">Principal + Interest</option>
                          <option value="I">Interest Only</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label
                          className="form-label fw-semibold"
                          style={{ fontSize: 13 }}
                        >
                          Comments
                        </label>
                        <textarea
                          className="form-control"
                          rows={2}
                          placeholder="Optional comments"
                          value={offerData.comments}
                          onChange={(e) =>
                            setOfferData({
                              ...offerData,
                              comments: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-12">
                        {/* Lender Consent Section */}
                        <div
                          style={{
                            border: "1px solid #dee2e6",
                            borderRadius: 10,
                            overflow: "hidden",
                          }}
                        >
                          {/* Header */}
                          <div
                            style={{
                              background:
                                "linear-gradient(135deg, #1a1f36 0%, #2d3561 100%)",
                              padding: "12px 16px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div>
                              <div
                                className="fw-bold text-white"
                                style={{ fontSize: 13 }}
                              >
                                <i
                                  className="fa fa-shield me-2"
                                  style={{ color: "#7eb3ff" }}
                                />
                                Lender Consent &amp; Acknowledgment
                              </div>
                              <small
                                style={{
                                  color: "rgba(255,255,255,0.65)",
                                  fontSize: 11,
                                }}
                              >
                                Read and acknowledge all consents to proceed
                              </small>
                            </div>
                            <div
                              style={{
                                background: offerData.consentItems.every(
                                  Boolean,
                                )
                                  ? "#28a745"
                                  : "#6c757d",
                                color: "#fff",
                                borderRadius: 20,
                                padding: "3px 10px",
                                fontSize: 11,
                                fontWeight: 600,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {offerData.consentItems.filter(Boolean).length} /{" "}
                              {LENDER_CONSENTS.length} done
                            </div>
                          </div>

                          {/* Consent items list */}
                          <div
                            style={{
                              maxHeight: 320,
                              overflowY: "auto",
                              background: "#fafbff",
                            }}
                          >
                            {LENDER_CONSENTS.map((item, i) => {
                              const checked = offerData.consentItems[i];
                              return (
                                <div
                                  key={item.id}
                                  style={{
                                    padding: "12px 16px",
                                    borderBottom:
                                      i < LENDER_CONSENTS.length - 1
                                        ? "1px solid #e9ecef"
                                        : "none",
                                    background: checked ? "#f0fff4" : "#fff",
                                    transition: "background 0.2s",
                                  }}
                                >
                                  <div className="d-flex align-items-start gap-3">
                                    {/* Checkbox — only enabled after reading (always enabled so lender can read then check) */}
                                    <div
                                      style={{ paddingTop: 2, flexShrink: 0 }}
                                    >
                                      <input
                                        type="checkbox"
                                        id={`consent_${item.id}`}
                                        checked={checked}
                                        onChange={(e) => {
                                          const updated = [
                                            ...offerData.consentItems,
                                          ];
                                          updated[i] = e.target.checked;
                                          setOfferData({
                                            ...offerData,
                                            consentItems: updated,
                                          });
                                          if (offerErrors.consent)
                                            setOfferErrors({
                                              ...offerErrors,
                                              consent: "",
                                            });
                                        }}
                                        style={{
                                          width: 16,
                                          height: 16,
                                          cursor: "pointer",
                                          accentColor: PRIMARY,
                                        }}
                                      />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <label
                                        htmlFor={`consent_${item.id}`}
                                        style={{
                                          cursor: "pointer",
                                          display: "block",
                                        }}
                                      >
                                        <div
                                          className="fw-semibold"
                                          style={{
                                            fontSize: 12,
                                            color: "#1a1f36",
                                            marginBottom: 2,
                                          }}
                                        >
                                          {item.title}
                                          {checked && (
                                            <i
                                              className="fa fa-check-circle ms-2"
                                              style={{
                                                color: "#28a745",
                                                fontSize: 11,
                                              }}
                                            />
                                          )}
                                        </div>
                                        <div
                                          style={{
                                            fontSize: 11,
                                            color: "#6c757d",
                                            marginBottom: 4,
                                            fontStyle: "italic",
                                          }}
                                        >
                                          {item.subtitle}
                                        </div>
                                        <div
                                          style={{
                                            fontSize: 11.5,
                                            color: "#374151",
                                            lineHeight: 1.5,
                                          }}
                                        >
                                          {item.text}
                                        </div>
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Master summary */}
                          <div
                            style={{
                              padding: "12px 16px",
                              background: "#f8f9fa",
                              borderTop: "1px solid #dee2e6",
                            }}
                          >
                            <div className="mb-2 d-flex align-items-center gap-2">
                              <input
                                id="agree_all_consents"
                                ref={agreeAllConsentsRef}
                                type="checkbox"
                                checked={allConsentsChecked}
                                onChange={(e) => {
                                  const nextChecked = e.target.checked;
                                  setOfferData({
                                    ...offerData,
                                    consentItems: offerData.consentItems.map(
                                      () => nextChecked,
                                    ),
                                  });
                                  if (offerErrors.consent)
                                    setOfferErrors({
                                      ...offerErrors,
                                      consent: "",
                                    });
                                }}
                                style={{
                                  width: 16,
                                  height: 16,
                                  cursor: "pointer",
                                  accentColor: PRIMARY,
                                }}
                              />
                              <label
                                className="mb-0"
                                htmlFor="agree_all_consents"
                                style={{
                                  cursor: "pointer",
                                  fontSize: 12.5,
                                  fontWeight: 600,
                                  color: "#1a1f36",
                                }}
                              >
                                <span>Agree to All Terms &amp; Conditions</span>
                              </label>
                            </div>
                            {allConsentsChecked ? (
                              <div
                                className="d-flex align-items-center gap-2"
                                style={{
                                  color: "#28a745",
                                  fontSize: 13,
                                  fontWeight: 600,
                                }}
                              >
                                <i
                                  className="fa fa-check-circle"
                                  style={{ fontSize: 16 }}
                                />
                                All consents acknowledged — you may proceed to
                                send the offer.
                              </div>
                            ) : (
                              <div style={{ fontSize: 12, color: "#6c757d" }}>
                                <i
                                  className="fa fa-info-circle me-1"
                                  style={{ color: "#f0ad4e" }}
                                />
                                Please read each consent carefully and check the
                                box to acknowledge it.
                                <strong style={{ color: "#dc3545" }}>
                                  {" "}
                                  {/* {LENDER_CONSENTS.length -
                                    offerData.consentItems.filter(Boolean)
                                      .length}{" "}
                                  remaining. */}
                                </strong>
                              </div>
                            )}
                            {offerErrors.consent && (
                              <div
                                className="mt-1"
                                style={{
                                  fontSize: 12,
                                  color: "#dc3545",
                                  fontWeight: 500,
                                }}
                              >
                                <i className="fa fa-exclamation-circle me-1" />
                                {offerErrors.consent}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: "16px 24px 20px",
                      display: "flex",
                      gap: 10,
                      flexShrink: 0,
                      borderTop: "1px solid #e9ecef",
                      background: "#f8f9fa",
                    }}
                  >
                    <button
                      className="btn"
                      style={{
                        background: offerData.consentItems.every(Boolean)
                          ? PRIMARY
                          : "#adb5bd",
                        color: "#fff",
                        fontWeight: 600,
                        borderRadius: 6,
                        padding: "10px 24px",
                        cursor: offerData.consentItems.every(Boolean)
                          ? "pointer"
                          : "not-allowed",
                      }}
                      onClick={sendOffer}
                      disabled={
                        offerLoading || !offerData.consentItems.every(Boolean)
                      }
                    >
                      {offerLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <i className="fa fa-paper-plane me-1" />
                          Send Loan Offer
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      style={{ borderRadius: 6, padding: "10px 24px" }}
                      onClick={() => setShowOffer(false)}
                    >
                      Cancel
                    </button>
                    {!offerData.consentItems.every(Boolean) && (
                      <small
                        className="text-muted my-auto ms-1"
                        style={{ fontSize: 11 }}
                      >
                        <i className="fa fa-lock me-1" />
                        Acknowledge all consents to enable
                      </small>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <ul className="nav nav-tabs nav-tabs-solid mb-3">
              {["profile", "documents"].map((tab) => (
                <li className="nav-item" key={tab}>
                  <button
                    className="nav-link"
                    style={
                      activeTab === tab
                        ? {
                            background: PRIMARY,
                            color: "#fff",
                            borderColor: PRIMARY,
                          }
                        : {}
                    }
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === "profile" ? (
                      <>
                        <i className="fa fa-user me-1" />
                        Profile
                      </>
                    ) : (
                      <>
                        <i className="fa fa-id-card me-1" />
                        KYC Documents
                      </>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title fw-bold mb-3">Borrower Profile</h5>
                  {p ? (
                    <>
                      <div className="row">
                        {[
                          [
                            "Name",
                            [p.firstName, p.middleName, p.lastName]
                              .filter(Boolean)
                              .join(" "),
                          ],
                          ["Mobile", p.mobileNumber ? `••••••${String(p.mobileNumber).slice(-5)}` : null],
                          ["WhatsApp", p.whatsAppNumber ? `••••••${String(p.whatsAppNumber).slice(-5)}` : null],
                          ["Email", p.email ? p.email.replace(/^(..)[^@]*(@.*)$/, "$1••••$2") : null],
                          ["Date of Birth", p.dob],
                          ["Father Name", p.fatherName],
                          ["PAN Number", p.panNumber ? `••••••${String(p.panNumber).slice(-5)}` : null],
                          ["Aadhaar", p.aadharNumber ? `••••••${String(p.aadharNumber).slice(-5)}` : null],
                          ["Employment", p.employment],
                          ["Company", p.companyName],
                          [
                            "Salary",
                            p.salary
                              ? `₹${Number(p.salary).toLocaleString()}`
                              : null,
                          ],
                          [
                            "Work Experience",
                            p.workExperience ? `${p.workExperience} yrs` : null,
                          ],
                          ["Address", p.address],
                          ["Permanent Address", p.permanentAddress],
                          ["Locality", p.locality],
                          ["City", p.city],
                          ["State", p.state],
                          ["Pin Code", p.pinCode],
                          ["Account Number", p.accountNumber],
                          ["IFSC Code", p.ifscCode],
                        ].map(([label, value]) =>
                          value ? (
                            <div className="col-md-4 mb-3" key={label}>
                              <small className="text-muted d-block">
                                {label}
                              </small>
                              <strong>{value}</strong>
                            </div>
                          ) : null,
                        )}
                      </div>
                      <hr />

                      <div
                        className="mb-3 p-3 rounded"
                        style={{
                          background:
                            "linear-gradient(135deg, #eef4ff 0%, #ffffff 100%)",
                          border: `1.5px solid ${PRIMARY}40`,
                          boxShadow: "0 4px 14px rgba(61, 94, 225, 0.08)",
                        }}
                      >
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                          <div>
                            <h6
                              className="fw-bold mb-1"
                              style={{ color: "#1a1f36" }}
                            >
                              {/* <i className="fa fa-handshake-o me-2" style={{ color: PRIMARY }} /> */}
                              Borrower Loan Request Details
                            </h6>
                            {/* <small className="text-muted ">
         <i className="fa fa-handshake-o me-2" style={{ color: PRIMARY }} />
        This borrower has requested a loan. Review the requested amount and pending amount before sending your offer.
      </small> */}
                          </div>
                        </div>

                        {loanDetails?.length > 0 ? (
                          loanDetails.map((loan, index) => (
                            <div
                              key={loan.id || index}
                              className="mb-2 p-3 rounded"
                              style={{
                                background: "#fff",
                                border: "1px solid #e5e7eb",
                              }}
                            >
                              <div className="row">
                                {[
                                  [
                                    "Requested Loan Amount",
                                    loan.requestAmount
                                      ? `₹${Number(loan.requestAmount).toLocaleString()}`
                                      : null,
                                  ],
                                  [
                                    "Current Loan Status",
                                    loan.loanRequestStatus ===
                                    "PARTIALLYPROCESSING"
                                      ? "Partially Processing"
                                      : loan.loanRequestStatus,
                                  ],
                                  [
                                    "Amount Still Needed",
                                    loan.partiallyPendingAmount
                                      ? `₹${Number(loan.partiallyPendingAmount).toLocaleString()}`
                                      : null,
                                  ],
                                ].map(([label, value]) =>
                                  value ? (
                                    <div className="col-md-4 mb-2" key={label}>
                                      <small className="text-muted d-block">
                                        {label}
                                      </small>
                                      <strong
                                        style={{
                                          color: "#111827",
                                          fontSize: 15,
                                        }}
                                      >
                                        {value}
                                      </strong>
                                    </div>
                                  ) : null,
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted mb-0">
                            No loan request details available.
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    !detailLoading && (
                      <p className="text-muted">Profile data not available.</p>
                    )
                  )}
                  {selectedBorrower.distance != null && (
                    <div className="mt-2">
                      <small className="text-muted d-block">Distance</small>
                      <strong>
                        {Number(selectedBorrower.distance).toFixed(2)} km
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "documents" && (
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title fw-bold mb-3">KYC Documents</h5>
                  {!detailLoading && docs.length === 0 ? (
                    <p className="text-muted">No documents available.</p>
                  ) : (
                    (() => {
                      // Sort docs by DOC_ORDER, unknowns go last
                      const sorted = [...docs].sort((a, b) => {
                        const ai = DOC_ORDER.indexOf(a.documentSubType);
                        const bi = DOC_ORDER.indexOf(b.documentSubType);
                        return (
                          (ai === -1 ? DOC_ORDER.length : ai) -
                          (bi === -1 ? DOC_ORDER.length : bi)
                        );
                      });

                      // Group into categories — only show categories that have docs
                      const grouped = DOC_CATEGORIES.map((cat) => ({
                        ...cat,
                        docs: sorted.filter((d) =>
                          cat.keys.includes(d.documentSubType),
                        ),
                      })).filter((cat) => cat.docs.length > 0);

                      // Docs that don't belong to any category
                      const uncategorised = sorted.filter(
                        (d) =>
                          !DOC_CATEGORIES.some((cat) =>
                            cat.keys.includes(d.documentSubType),
                          ),
                      );

                      const renderDocCard = (doc) => (
                        <div
                          className="col-md-6 col-xl-4"
                          key={doc.id || doc.documentSubType}
                        >
                          <div
                            className="rounded-3 p-3 h-100 d-flex flex-column"
                            style={{
                              border: `1.5px solid ${PRIMARY}30`,
                              background: "#f8f9ff",
                            }}
                          >
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <div
                                className="fw-semibold"
                                style={{ fontSize: 13 }}
                              >
                                {DOC_LABELS[doc.documentSubType] ||
                                  doc.documentSubType}
                              </div>
                              <StatusBadge status={doc.status} />
                            </div>
                            <div
                              className="text-muted mb-3"
                              style={{
                                fontSize: 11,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={doc.fileName}
                            >
                              <i className="fa fa-file-o me-1" />
                              {doc.fileName}
                            </div>
                            <div className="mt-auto">
                              <button
                                className="btn btn-sm w-100"
                                style={{
                                  background: PRIMARY,
                                  color: "#fff",
                                  fontSize: 12,
                                }}
                                onClick={() => setViewDoc(doc)}
                              >
                                <i className="fa fa-eye me-1" /> View Document
                              </button>
                            </div>
                          </div>
                        </div>
                      );

                      return (
                        <>
                          {grouped.map((cat) => (
                            <div key={cat.label} className="mb-4">
                              {/* Category header */}
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <div
                                  style={{
                                    width: 4,
                                    height: 20,
                                    background: PRIMARY,
                                    borderRadius: 2,
                                    flexShrink: 0,
                                  }}
                                />
                                <div>
                                  <div
                                    className="fw-bold"
                                    style={{ fontSize: 13, color: "#1a1f36" }}
                                  >
                                    {cat.label}
                                  </div>
                                  <div
                                    style={{ fontSize: 11, color: "#6c757d" }}
                                  >
                                    {cat.description}
                                  </div>
                                </div>
                              </div>
                              <div className="row g-3 mt-0">
                                {cat.docs.map(renderDocCard)}
                              </div>
                            </div>
                          ))}
                          {uncategorised.length > 0 && (
                            <div className="mb-4">
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <div
                                  style={{
                                    width: 4,
                                    height: 20,
                                    background: "#6c757d",
                                    borderRadius: 2,
                                    flexShrink: 0,
                                  }}
                                />
                                <div
                                  className="fw-bold"
                                  style={{ fontSize: 13, color: "#1a1f36" }}
                                >
                                  Other Documents
                                </div>
                              </div>
                              <div className="row g-3 mt-0">
                                {uncategorised.map(renderDocCard)}
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()
                  )}
                </div>
              </div>
            )}

            {/* Document Viewer Modal */}
            {viewDoc && (
              <div
                className="modal d-block"
                style={{ background: "rgba(0,0,0,0.65)" }}
                onClick={() => setViewDoc(null)}
              >
                <div
                  className="modal-dialog modal-lg modal-dialog-centered"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="modal-content"
                    style={{ borderRadius: 12, overflow: "hidden" }}
                  >
                    <div
                      className="modal-header"
                      style={{ background: "#1a1f36", borderBottom: "none" }}
                    >
                      <div>
                        <h6 className="mb-0 text-white">
                          {DOC_LABELS[viewDoc.documentSubType] ||
                            viewDoc.documentSubType}
                        </h6>
                        <small style={{ color: "#aab" }}>
                          {viewDoc.fileName}
                        </small>
                      </div>
                      <button
                        className="btn btn-sm ms-auto"
                        style={{ color: "#aab", fontSize: 20, lineHeight: 1 }}
                        onClick={() => setViewDoc(null)}
                      >
                        ✕
                      </button>
                    </div>
                    <div
                      className="modal-body p-0"
                      style={{ background: "#f4f6fb", minHeight: 420 }}
                    >
                      {isImage(viewDoc.fileName) ? (
                        <div
                          className="d-flex align-items-center justify-content-center p-4"
                          style={{ minHeight: 420 }}
                        >
                          <img
                            src={`https://oxyloansv1.s3.ap-south-1.amazonaws.com/${viewDoc.filePath}`}
                            alt={viewDoc.fileName}
                            style={{
                              maxWidth: "100%",
                              maxHeight: 520,
                              borderRadius: 8,
                              pointerEvents: "none",
                              userSelect: "none",
                            }}
                            onContextMenu={(e) => e.preventDefault()}
                            draggable={false}
                          />
                        </div>
                      ) : isPdf(viewDoc.fileName) ? (
                        <iframe
                          src={`https://oxyloansv1.s3.ap-south-1.amazonaws.com/${viewDoc.filePath}#toolbar=0&navpanes=0`}
                          title={viewDoc.fileName}
                          width="100%"
                          height="520"
                          style={{ border: "none", display: "block" }}
                        />
                      ) : (
                        <div
                          className="d-flex flex-column align-items-center justify-content-center"
                          style={{ minHeight: 420 }}
                        >
                          <i
                            className="fa fa-file-o"
                            style={{ fontSize: 64, color: "#bbb" }}
                          />
                          <p className="text-muted mt-3">
                            Preview not available for this file type.
                          </p>
                        </div>
                      )}
                    </div>
                    <div
                      className="modal-footer"
                      style={{
                        background: "#f4f6fb",
                        borderTop: "1px solid #e0e4ef",
                      }}
                    >
                      <small className="text-muted me-auto">
                        <i
                          className="fa fa-lock me-1"
                          style={{ color: PRIMARY }}
                        />{" "}
                        View only
                      </small>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setViewDoc(null)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Main View (Map / List) ───────────────────────────────────────
  return (
    <div className="main-wrapper">
      <Header />
      <SideBar />
      <div className="page-wrapper" style={{ marginBottom: 60 }}>
        {/* Page header */}
        <div className="content container-fluid pb-2">
          <div className="page-header mb-2">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Proximity Nearby Loans</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">
                    Proximity Nearby Loans
                  </li>
                </ul>
              </div>
            </div>
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mt-2">
              <span className="text-muted">
                Discover and invest in loan opportunities from borrowers near you.
              </span>

              <div className="d-flex flex-wrap align-items-center gap-2 ms-md-auto">
                <div
                  style={{
                    display: "flex",
                    border: `1px solid ${PRIMARY}`,
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <button
                    className="btn btn-sm"
                    style={{
                      borderRadius: 0,
                      padding: "6px 16px",
                      fontWeight: 600,
                      fontSize: 13,
                      background: viewMode === "map" ? PRIMARY : "#fff",
                      color: viewMode === "map" ? "#fff" : PRIMARY,
                      border: "none",
                    }}
                    onClick={() => setViewMode("map")}
                  >
                    <i className="fa fa-map-marker me-1" />
                    Map View
                  </button>

                  <button
                    className="btn btn-sm"
                    style={{
                      borderRadius: 0,
                      padding: "6px 16px",
                      fontWeight: 600,
                      fontSize: 13,
                      background: viewMode === "list" ? PRIMARY : "#fff",
                      color: viewMode === "list" ? "#fff" : PRIMARY,
                      border: "none",
                      borderLeft: `1px solid ${PRIMARY}`,
                    }}
                    onClick={() => setViewMode("list")}
                  >
                    <i className="fa fa-th-large me-1" />
                    List View
                  </button>
                </div>

                <Link
                  to="/offerGivenList"
                  className="btn"
                  style={{
                    background: PRIMARY,
                    color: "#fff",
                    fontWeight: 600,
                    borderRadius: 8,
                    padding: "7px 18px",
                    fontSize: 13,
                    whiteSpace: "nowrap",
                  }}
                >
                  <i className="fa fa-list-alt me-1" />
                  View My Offers
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Map View ── */}
        {viewMode === "map" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "calc(100vh - 140px)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {loading && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(255,255,255,0.7)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div
                  className="spinner-border text-primary"
                  style={{ width: 32, height: 32 }}
                />
                <small className="text-muted fw-semibold">
                  Loading borrowers...
                </small>
              </div>
            )}
            <MapView
              borrowers={visibleBorrowers}
              allBorrowers={allBorrowers}
              distanceFilter={distanceFilter}
              searchQuery={searchQuery}
              onDistanceChange={(val) => {
                setDistanceFilter(val);
                setVisibleCount(LOAD_SIZE);
              }}
              onSearchChange={setSearchQuery}
              onSelect={(b) => {
                if (!loading) fetchBorrowerDetail(b);
              }}
              DISTANCE_OPTIONS={DISTANCE_OPTIONS}
              totalCount={totalCount}
            />
          </div>
        )}

        {/* ── List View ── */}
        {viewMode === "list" && (
          <div className="content container-fluid">
            {/* Filter bar */}
            <div className="card mb-3">
              <div className="card-body py-3">
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <div
                    style={{
                      position: "relative",
                      minWidth: 200,
                      flex: "0 1 240px",
                    }}
                  >
                    <i
                      className="fa fa-search"
                      style={{
                        position: "absolute",
                        left: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#aaa",
                        fontSize: 13,
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search borrower..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: "100%",
                        paddingLeft: 30,
                        paddingRight: 10,
                        height: 34,
                        border: "1px solid #ddd",
                        borderRadius: 20,
                        fontSize: 12,
                        outline: "none",
                      }}
                    />
                  </div>
                  <label
                    className="fw-semibold mb-0"
                    style={{ fontSize: 13, whiteSpace: "nowrap" }}
                  >
                    <i
                      className="fa fa-map-marker me-1"
                      style={{ color: PRIMARY }}
                    />
                    Distance:
                  </label>
                  <div className="d-flex gap-2 flex-wrap">
                    {DISTANCE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        className="btn btn-sm"
                        style={{
                          borderRadius: 20,
                          padding: "4px 14px",
                          fontSize: 12,
                          fontWeight: 600,
                          background:
                            distanceFilter === opt.value ? PRIMARY : "#f0f0f0",
                          color: distanceFilter === opt.value ? "#fff" : "#555",
                          border:
                            distanceFilter === opt.value
                              ? `1px solid ${PRIMARY}`
                              : "1px solid #ddd",
                        }}
                        onClick={() => {
                          setDistanceFilter(opt.value);
                          setVisibleCount(LOAD_SIZE);
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <small className="text-muted ms-auto">
                    Showing <strong>{filteredBorrowers.length}</strong> borrower
                    {filteredBorrowers.length !== 1 ? "s" : ""}
                  </small>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" />
                <p className="mt-2 text-muted">Loading borrowers...</p>
              </div>
            ) : filteredBorrowers.length === 0 ? (
              <div className="card">
                <div className="card-body text-center py-5">
                  <i className="fa fa-users fa-3x text-muted mb-3" />
                  <p className="text-muted">No borrowers found nearby.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="row">
                  {visibleBorrowers.map((borrower, idx) => (
                    <div
                      className="col-md-6 col-xl-4 mb-4"
                      key={borrower.borrowerId || idx}
                    >
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex align-items-center gap-3 mb-3">
                            <div
                              className="d-flex align-items-center justify-content-center rounded-circle"
                              style={{ width: 46, height: 46, background: PRIMARY + "18", flexShrink: 0 }}
                            >
                              <i className="fa fa-user" style={{ color: PRIMARY, fontSize: 20 }} />
                            </div>
                            <div>
                              <h6 className="mb-0 fw-bold">
                                {borrower.borrowerName || `Borrower #${idx + 1}`}
                              </h6>
                              <small className="text-muted">ID: {borrower.borrowerId ? `••••${String(borrower.borrowerId).slice(-2)}` : "—"}</small>
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: 13 }}>
                            <i className="fa fa-map-marker" style={{ color: PRIMARY }} />
                            <span>
                              {borrower.distance != null
                                ? `${Number(borrower.distance).toFixed(2)} km away`
                                : "Distance N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="card-footer d-flex gap-2">
                          <button
                            className="btn btn-sm flex-fill"
                            style={{ background: PRIMARY, color: "#fff" }}
                            onClick={() => fetchBorrowerDetail(borrower)}
                          >
                            <i className="fa fa-eye me-1" />View Details
                          </button>
                          <button
                            className="btn btn-sm btn-outline-success"
                            style={{ minWidth: "auto", padding: "6px 12px" }}
                            onClick={() => setViewMode("map")}
                            title="View on Map"
                          >
                            <i className="fa fa-map-marker" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {visibleCount < filteredBorrowers.length && (
                  <div className="text-center mt-2 mb-4">
                    <button
                      className="btn btn-outline-primary px-5"
                      onClick={() => setVisibleCount((prev) => prev + LOAD_SIZE)}
                    >
                      Load More ({filteredBorrowers.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProximityLoans;
