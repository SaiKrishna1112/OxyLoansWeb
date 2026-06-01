import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";
import { getBorrowerDocuments } from "../../../../HttpRequest/afterlogin";
import { verifyDocument } from "../../../../HttpRequest/admin";

const PRIMARY = "#3d5ee1";

const DOC_LABELS = {
  AADHAR: "Aadhaar Card",
  PAN: "PAN Card",
  PASSPORT: "Passport",
  DRIVINGLICENCE: "Driving License",
  VOTERID: "Voter ID",
  UTILITYBILL: "Utility Bill",
  RENTALAGGREEMENT: "Rental / Lease Agreement",
  PAYSLIPS: "Salary Slips (Last 3 Months)",
  BANKSTATEMENT: "Bank Statement (Last 6 Months)",
  FORM16: "Form 16",
  EMPLOYEEID: "Employee ID / Offer Letter",
  ITR: "Income Tax Returns",
  GSTCERTIFICATE: "GST Registration Certificate",
  BUSINESSREG: "Business Registration Proof",
  PLSTATEMENT: "Profit & Loss Statement",
  CURRENTACCSTMT: "Bank Statement (Current Account)",
  CHEQUELEAF: "Cancelled Cheque",
  BANKPASSBOOK: "Bank Passbook Copy",
  CIBILREPORT: "CIBIL Report",
  CREDITREPORT: "Credit Report",
  EXISTINGLOAN: "Existing Loan Statements",
  PROPERTYDOC: "Property Documents",
  BUILDERAPPROVAL: "Builder Approval Documents",
  VEHICLEINVOICE: "Vehicle Invoice / Quotation",
  COMPANYINCORP: "Company Incorporation Certificate",
  MOAAOA: "MOA / AOA / Partnership Deed",
  TENTH: "10th Certificate",
  INTER: "Intermediate Certificate",
  GRADUATION: "Graduation Certificate",
};

const DOC_CATEGORIES = [
  {
    label: "1. Identity Verification",
    description: "Proof of borrower identity (KYC compliance)",
    icon: "fa-id-card",
    keys: ["AADHAR", "PAN", "PASSPORT", "DRIVINGLICENCE", "VOTERID"],
  },
  {
    label: "2. Address Verification",
    description: "Proof of current residential address",
    icon: "fa-home",
    keys: ["UTILITYBILL", "RENTALAGGREEMENT"],
  },
  {
    label: "3. Income Proof (Salaried)",
    description: "Verification of stable monthly income",
    icon: "fa-briefcase",
    keys: ["PAYSLIPS", "BANKSTATEMENT", "FORM16", "EMPLOYEEID"],
  },
  {
    label: "4. Income Proof (Self-Employed)",
    description: "Verification of business or professional income",
    icon: "fa-building",
    keys: ["ITR", "GSTCERTIFICATE", "BUSINESSREG", "PLSTATEMENT", "CURRENTACCSTMT"],
  },
  {
    label: "5. Bank Details",
    description: "Verification of active bank account",
    icon: "fa-university",
    keys: ["CHEQUELEAF", "BANKPASSBOOK"],
  },
  {
    label: "6. Credit Information",
    description: "Assessment of creditworthiness",
    icon: "fa-bar-chart",
    keys: ["CIBILREPORT", "CREDITREPORT", "EXISTINGLOAN"],
  },
  {
    label: "7. Loan-Specific Documents",
    description: "Documents based on loan type",
    icon: "fa-file-text",
    keys: ["PROPERTYDOC", "BUILDERAPPROVAL", "VEHICLEINVOICE", "COMPANYINCORP", "MOAAOA"],
  },
  {
    label: "8. Education Documents",
    description: "Academic qualification proof",
    icon: "fa-graduation-cap",
    keys: ["TENTH", "INTER", "GRADUATION"],
  },
];

const DOC_ORDER = DOC_CATEGORIES.flatMap((c) => c.keys);
const isImage = (f = "") => /\.(jpg|jpeg|png|gif|webp)$/i.test(f);
const isPdf = (f = "") => /\.pdf$/i.test(f);

const StatusBadge = ({ status }) => {
  const map = {
    ACCEPTED: { color: "#28a745", label: "Accepted" },
    UPLOADED: { color: PRIMARY, label: "Uploaded" },
    REJECTED: { color: "#dc3545", label: "Rejected" },
    PENDING: { color: "#f0ad4e", label: "Pending" },
  };
  const { color, label } = map[status] || { color: "#6c757d", label: status };
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        color,
        background: color + "18",
        borderRadius: 20,
        padding: "2px 9px",
        border: `1px solid ${color}30`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
};

const BorrowerDocuments = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewDoc, setViewDoc] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("ALL");
  const [verifying, setVerifying] = useState({});

  const handleVerify = async (doc, status) => {
    const key = `${doc.id}-${status}`;
    setVerifying((prev) => ({ ...prev, [key]: true }));
    try {
      await verifyDocument(userId, doc.id, status);
      setDocs((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, status } : d))
      );
      if (viewDoc?.id === doc.id) setViewDoc((v) => ({ ...v, status }));
    } finally {
      setVerifying((prev) => ({ ...prev, [key]: false }));
    }
  };

  const fetchDocs = () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    getBorrowerDocuments(userId)
      .then((res) => {
        const data = res?.data;
        setDocs(Array.isArray(data) ? data : []);
      })
      .catch(() => setError("Failed to load documents. Please try again."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDocs();
  }, [userId]);

  // Sort docs by DOC_ORDER
  const sorted = [...docs].sort((a, b) => {
    const ai = DOC_ORDER.indexOf(a.documentSubType);
    const bi = DOC_ORDER.indexOf(b.documentSubType);
    return (ai === -1 ? DOC_ORDER.length : ai) - (bi === -1 ? DOC_ORDER.length : bi);
  });

  // Group into categories — include all categories (even empty ones for overview)
  const grouped = DOC_CATEGORIES.map((cat) => ({
    ...cat,
    docs: sorted.filter((d) => cat.keys.includes(d.documentSubType)),
  }));

  const uncategorised = sorted.filter(
    (d) => !DOC_CATEGORIES.some((cat) => cat.keys.includes(d.documentSubType))
  );

  const acceptedCount = docs.filter((d) => d.status === "ACCEPTED").length;
  const uploadedCount = docs.filter((d) => d.status === "UPLOADED").length;
  const rejectedCount = docs.filter((d) => d.status === "REJECTED").length;
  const categoriesWithDocs = grouped.filter((c) => c.docs.length > 0).length;

  // Filter categories based on active filter
  const visibleCategories =
    activeCategoryFilter === "ALL"
      ? grouped.filter((c) => c.docs.length > 0)
      : grouped.filter((c) => c.label === activeCategoryFilter && c.docs.length > 0);

  const renderDocCard = (doc) => (
    <div className="col-md-6 col-xl-4" key={doc.id || `${doc.documentSubType}-${doc.fileName}`}>
      <div
        className="rounded-3 p-3 h-100 d-flex flex-column"
        style={{
          border: `1.5px solid ${PRIMARY}25`,
          background: "#fff",
          boxShadow: "0 1px 4px rgba(61,94,225,0.07)",
          transition: "box-shadow 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(61,94,225,0.15)")}
        onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(61,94,225,0.07)")}
      >
        {/* Doc type icon + name + badge */}
        <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
          <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: PRIMARY + "12",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <i
                className={`fa ${isPdf(doc.fileName) ? "fa-file-pdf-o" : isImage(doc.fileName) ? "fa-file-image-o" : "fa-file-o"}`}
                style={{ color: PRIMARY, fontSize: 14 }}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                className="fw-semibold"
                style={{ fontSize: 12, color: "#1a1f36", lineHeight: 1.3 }}
              >
                {DOC_LABELS[doc.documentSubType] || doc.documentSubType}
              </div>
              <div
                className="text-muted"
                style={{
                  fontSize: 10,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: 160,
                }}
                title={doc.fileName}
              >
                {doc.fileName}
              </div>
            </div>
          </div>
          <StatusBadge status={doc.status} />
        </div>

        {/* Meta info */}
        {doc.uploadedDate && (
          <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 8 }}>
            <i className="fa fa-calendar me-1" />
            {doc.uploadedDate}
          </div>
        )}

        {/* View button + Verify buttons */}
        <div className="mt-auto pt-2 d-flex flex-column gap-1">
          <button
            className="btn btn-sm w-100"
            style={{
              background: PRIMARY,
              color: "#fff",
              fontSize: 12,
              borderRadius: 6,
              fontWeight: 600,
              padding: "6px 0",
            }}
            onClick={() => setViewDoc(doc)}
          >
            <i className="fa fa-eye me-1" /> View Document
          </button>
          {doc.status === null && (
            <div className="d-flex gap-1">
              <button
                className="btn btn-sm flex-fill"
                style={{ background: "#28a745", color: "#fff", fontSize: 11, borderRadius: 6, fontWeight: 600, padding: "5px 0" }}
                disabled={verifying[`${doc.id}-ACCEPTED`]}
                onClick={() => handleVerify(doc, "ACCEPTED")}
              >
                {verifying[`${doc.id}-ACCEPTED`] ? <span className="spinner-border spinner-border-sm" /> : <><i className="fa fa-check me-1" />Accept</>}
              </button>
              <button
                className="btn btn-sm flex-fill"
                style={{ background: "#dc3545", color: "#fff", fontSize: 11, borderRadius: 6, fontWeight: 600, padding: "5px 0" }}
                disabled={verifying[`${doc.id}-REJECTED`]}
                onClick={() => handleVerify(doc, "REJECTED")}
              >
                {verifying[`${doc.id}-REJECTED`] ? <span className="spinner-border spinner-border-sm" /> : <><i className="fa fa-times me-1" />Reject</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">

          {/* ── Page Header ── */}
          <div className="page-header mb-3">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">KYC Documents</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link to="/OxyloansAdminDashboard">Dashboard</Link>
                  </li>
                  <li className="breadcrumb-item active">KYC Documents</li>
                </ul>
              </div>
              <div className="col-auto d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm"
                  style={{
                    border: "1px solid #d0d5dd",
                    color: "#374151",
                    background: "#fff",
                    fontWeight: 500,
                    borderRadius: 6,
                    padding: "6px 16px",
                  }}
                  onClick={() => navigate(-1)}
                >
                  <i className="fa fa-arrow-left me-1" /> Back
                </button>
              </div>
            </div>
          </div>

          {/* ── Borrower ID Banner ── */}
          <div
            className="d-flex align-items-center gap-3 mb-4 p-3 rounded-3"
            style={{ background: "linear-gradient(135deg, #1a1f36 0%, #2d3561 100%)" }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <i className="fa fa-user" style={{ color: "#fff", fontSize: 18 }} />
            </div>
            <div>
              <div className="fw-bold text-white" style={{ fontSize: 15 }}>
                Borrower Documents
              </div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
                User ID: <span style={{ color: "#7eb3ff", fontWeight: 600 }}>{userId}</span>
              </div>
            </div>
            {!loading && docs.length > 0 && (
              <div className="ms-auto d-flex gap-3 flex-wrap">
                {[
                  { label: "Total", value: docs.length, color: "#fff" },
                  { label: "Accepted", value: acceptedCount, color: "#28a745" },
                  { label: "Uploaded", value: uploadedCount, color: "#7eb3ff" },
                  { label: "Rejected", value: rejectedCount, color: "#ff6b6b" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center">
                    <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>{label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: PRIMARY, width: 40, height: 40 }} />
              <p className="mt-3 text-muted fw-semibold">Loading documents...</p>
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <i className="fa fa-exclamation-circle fa-3x mb-3" style={{ color: "#dc3545" }} />
                <p className="text-danger fw-semibold mb-3">{error}</p>
                <button
                  className="btn btn-sm"
                  style={{ background: PRIMARY, color: "#fff", borderRadius: 6, padding: "8px 24px" }}
                  onClick={fetchDocs}
                >
                  <i className="fa fa-refresh me-1" /> Retry
                </button>
              </div>
            </div>
          )}

          {/* ── Empty ── */}
          {!loading && !error && docs.length === 0 && (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <i className="fa fa-folder-open fa-3x mb-3" style={{ color: "#d1d5db" }} />
                <p className="fw-semibold" style={{ color: "#6b7280" }}>
                  No documents found for this borrower.
                </p>
                <small className="text-muted">
                  The borrower has not uploaded any KYC documents yet.
                </small>
              </div>
            </div>
          )}

          {/* ── Documents ── */}
          {!loading && !error && docs.length > 0 && (
            <>
              {/* Category Overview Cards */}
              <div className="row g-3 mb-4">
                {grouped.map((cat) => (
                  <div className="col-6 col-md-3 col-xl-2" key={cat.label}>
                    <div
                      className="rounded-3 p-3 text-center"
                      style={{
                        border: `1.5px solid ${cat.docs.length > 0 ? PRIMARY + "40" : "#e9ecef"}`,
                        background: cat.docs.length > 0 ? PRIMARY + "08" : "#f8f9fa",
                        cursor: cat.docs.length > 0 ? "pointer" : "default",
                        transition: "all 0.18s",
                      }}
                      onClick={() =>
                        cat.docs.length > 0 &&
                        setActiveCategoryFilter(
                          activeCategoryFilter === cat.label ? "ALL" : cat.label
                        )
                      }
                    >
                      <i
                        className={`fa ${cat.icon} mb-1`}
                        style={{
                          fontSize: 20,
                          color: cat.docs.length > 0 ? PRIMARY : "#d1d5db",
                          display: "block",
                        }}
                      />
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: cat.docs.length > 0 ? "#1a1f36" : "#9ca3af",
                          lineHeight: 1.3,
                          marginBottom: 4,
                        }}
                      >
                        {cat.label.replace(/^\d+\.\s/, "")}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: cat.docs.length > 0 ? PRIMARY : "#d1d5db",
                        }}
                      >
                        {cat.docs.length} doc{cat.docs.length !== 1 ? "s" : ""}
                      </div>
                      {activeCategoryFilter === cat.label && (
                        <div
                          style={{
                            marginTop: 4,
                            fontSize: 9,
                            color: PRIMARY,
                            fontWeight: 700,
                          }}
                        >
                          ● FILTERED
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Filter bar */}
              <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1f36" }}>
                  {activeCategoryFilter === "ALL"
                    ? `All Documents (${docs.length})`
                    : `${activeCategoryFilter} (${grouped.find((c) => c.label === activeCategoryFilter)?.docs.length ?? 0})`}
                </div>
                {activeCategoryFilter !== "ALL" && (
                  <button
                    className="btn btn-sm"
                    style={{
                      border: `1px solid ${PRIMARY}`,
                      color: PRIMARY,
                      background: "#fff",
                      borderRadius: 20,
                      fontSize: 11,
                      padding: "3px 14px",
                    }}
                    onClick={() => setActiveCategoryFilter("ALL")}
                  >
                    <i className="fa fa-times me-1" /> Clear Filter
                  </button>
                )}
              </div>

              {/* Document sections */}
              {visibleCategories.map((cat) => (
                <div key={cat.label} className="mb-4">
                  {/* Section header */}
                  <div
                    className="d-flex align-items-center gap-2 mb-3 p-2 rounded-2"
                    style={{ background: PRIMARY + "08", border: `1px solid ${PRIMARY}20` }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: PRIMARY,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <i className={`fa ${cat.icon}`} style={{ color: "#fff", fontSize: 14 }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="fw-bold" style={{ fontSize: 13, color: "#1a1f36" }}>
                        {cat.label}
                      </div>
                      <div style={{ fontSize: 11, color: "#6c757d" }}>{cat.description}</div>
                    </div>
                    <span
                      style={{
                        background: PRIMARY,
                        color: "#fff",
                        borderRadius: 20,
                        padding: "2px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {cat.docs.length} doc{cat.docs.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="row g-3">{cat.docs.map(renderDocCard)}</div>
                </div>
              ))}

              {/* Uncategorised */}
              {uncategorised.length > 0 && activeCategoryFilter === "ALL" && (
                <div className="mb-4">
                  <div
                    className="d-flex align-items-center gap-2 mb-3 p-2 rounded-2"
                    style={{ background: "#f8f9fa", border: "1px solid #e9ecef" }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: "#6c757d",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <i className="fa fa-folder" style={{ color: "#fff", fontSize: 14 }} />
                    </div>
                    <div>
                      <div className="fw-bold" style={{ fontSize: 13, color: "#1a1f36" }}>
                        Other Documents
                      </div>
                      <div style={{ fontSize: 11, color: "#6c757d" }}>
                        Documents not mapped to a standard category
                      </div>
                    </div>
                    <span
                      style={{
                        background: "#6c757d",
                        color: "#fff",
                        borderRadius: 20,
                        padding: "2px 10px",
                        fontSize: 11,
                        fontWeight: 700,
                        marginLeft: "auto",
                      }}
                    >
                      {uncategorised.length}
                    </span>
                  </div>
                  <div className="row g-3">{uncategorised.map(renderDocCard)}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Document Viewer Modal ── */}
      {viewDoc && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setViewDoc(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              width: "100%",
              maxWidth: 860,
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #1a1f36 0%, #2d3561 100%)",
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i
                  className={`fa ${isPdf(viewDoc.fileName) ? "fa-file-pdf-o" : isImage(viewDoc.fileName) ? "fa-file-image-o" : "fa-file-o"}`}
                  style={{ color: "#fff", fontSize: 16 }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="fw-bold text-white" style={{ fontSize: 14 }}>
                  {DOC_LABELS[viewDoc.documentSubType] || viewDoc.documentSubType}
                </div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontSize: 11,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {viewDoc.fileName}
                </div>
              </div>
              <StatusBadge status={viewDoc.status} />
              <button
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "#fff",
                  borderRadius: 6,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: 16,
                  flexShrink: 0,
                }}
                onClick={() => setViewDoc(null)}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                flex: 1,
                background: "#f4f6fb",
                overflow: "auto",
                minHeight: 460,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isImage(viewDoc.fileName) ? (
                <div style={{ padding: 24, width: "100%", textAlign: "center" }}>
                  <img
                    src={`https://oxyloansv1.s3.ap-south-1.amazonaws.com/${viewDoc.filePath}`}
                    alt={viewDoc.fileName}
                    style={{
                      maxWidth: "100%",
                      maxHeight: 560,
                      borderRadius: 8,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
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
                  height="560"
                  style={{ border: "none", display: "block" }}
                />
              ) : (
                <div className="text-center p-5">
                  <i className="fa fa-file-o" style={{ fontSize: 72, color: "#d1d5db" }} />
                  <p className="text-muted mt-3 mb-0 fw-semibold">
                    Preview not available for this file type.
                  </p>
                  <small className="text-muted">{viewDoc.fileName}</small>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "12px 20px",
                background: "#f8f9fa",
                borderTop: "1px solid #e0e4ef",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <small className="text-muted">
                <i className="fa fa-lock me-1" style={{ color: PRIMARY }} />
                View only — downloading is disabled
              </small>
              <div className="d-flex gap-2 align-items-center">
                {viewDoc.status === null && (
                  <>
                    <button
                      className="btn btn-sm"
                      style={{ background: "#28a745", color: "#fff", borderRadius: 6, padding: "5px 16px", fontWeight: 600, fontSize: 12 }}
                      disabled={verifying[`${viewDoc.id}-ACCEPTED`]}
                      onClick={() => handleVerify(viewDoc, "ACCEPTED")}
                    >
                      {verifying[`${viewDoc.id}-ACCEPTED`] ? <span className="spinner-border spinner-border-sm" /> : <><i className="fa fa-check me-1" />Accept</>}
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ background: "#dc3545", color: "#fff", borderRadius: 6, padding: "5px 16px", fontWeight: 600, fontSize: 12 }}
                      disabled={verifying[`${viewDoc.id}-REJECTED`]}
                      onClick={() => handleVerify(viewDoc, "REJECTED")}
                    >
                      {verifying[`${viewDoc.id}-REJECTED`] ? <span className="spinner-border spinner-border-sm" /> : <><i className="fa fa-times me-1" />Reject</>}
                    </button>
                  </>
                )}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  style={{ borderRadius: 6, padding: "5px 18px" }}
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
  );
};

export default BorrowerDocuments;
