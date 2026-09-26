import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";
import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
import {
  getAdminUpdateProcessingFees,
  adminUpdateProcessingFee,
  radiusBasedFee,
  getRadiusBasedFee,
  updateBorrowerScore,
  getBorrowerCibilScore,
} from "../../../../HttpRequest/admin.js";
import Swal from "sweetalert2";
import Footer from "../../../../Footer/Footer";

const PRIMARY = "#3d5ee1";

const FIELD_CONFIG = [
  { key: "salaryPercenatge", label: "Salary Percentage (%)", min: 0, max: 100, step: "0.01" },
  { key: "feePercentage",    label: "Fee Percentage (%)",    min: 0, max: 100, step: "0.01" },
  { key: "redius",           label: "Radius (km)",           min: 0,           step: "1"    },
];

const EMPTY_FORM = {
  salaryPercenatge: "",
  feePercentage:    "",
  redius:           "",
};

const RADIUS_FIELD_CONFIG = [
  { key: "startKm",        label: "Start KM",           min: 0, step: "1"    },
  { key: "endKm",          label: "End KM",             min: 0, step: "1"    },
  { key: "feePercantages", label: "Fee Percentage (%)", min: 0, max: 100, step: "0.01" },
];

const EMPTY_RADIUS_FORM = { startKm: "", endKm: "", feePercantages: "" };

const CIBIL_FIELD_CONFIG = [
  { key: "startScore",    label: "Start Score",        min: 0, step: "1"    },
  { key: "endScore",      label: "End Score",          min: 0, step: "1"    },
  { key: "feePercentage", label: "Fee Percentage (%)", min: 0, max: 100, step: "0.01" },
];

const EMPTY_CIBIL_FORM = { startScore: "", endScore: "", feePercentage: "" };

const ProcessingFees = () => {
  const [fees, setFees]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);

  const [radiusEditRow, setRadiusEditRow] = useState(null);
  const [radiusForm, setRadiusForm]       = useState(EMPTY_RADIUS_FORM);
  const [radiusErrors, setRadiusErrors]   = useState({});
  const [radiusSaving, setRadiusSaving]   = useState(false);
  const [radiusFees, setRadiusFees]       = useState([]);
  const [radiusLoading, setRadiusLoading] = useState(true);

  const [cibilEditRow, setCibilEditRow] = useState(null);
  const [cibilForm, setCibilForm]       = useState(EMPTY_CIBIL_FORM);
  const [cibilErrors, setCibilErrors]   = useState({});
  const [cibilSaving, setCibilSaving]   = useState(false);
  const [cibilFees, setCibilFees]       = useState([]);
  const [cibilLoading, setCibilLoading] = useState(true);

  useEffect(() => { fetchFees(); fetchRadiusFees(); fetchCibilFees(); }, []);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res  = await getAdminUpdateProcessingFees();
      const data = Array.isArray(res?.data) ? res.data : res?.data ? [res.data] : [];
      setFees(data);
    } catch {
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRadiusFees = async () => {
    setRadiusLoading(true);
    try {
      const res  = await getRadiusBasedFee();
      const data = Array.isArray(res?.data) ? res.data : res?.data ? [res.data] : [];
      setRadiusFees(data);
    } catch {
      setRadiusFees([]);
    } finally {
      setRadiusLoading(false);
    }
  };

  const fetchCibilFees = async () => {
    setCibilLoading(true);
    try {
      const res  = await getBorrowerCibilScore();
      const data = Array.isArray(res?.data) ? res.data : res?.data ? [res.data] : [];
      setCibilFees(data);
    } catch {
      setCibilFees([]);
    } finally {
      setCibilLoading(false);
    }
  };

  const openEdit = (row) => {
    setEditRow(row);
    setForm({
      salaryPercenatge: row.salaryPercenatge ?? "",
      feePercentage:    row.feePercentage    ?? "",
      redius:           row.redius           ?? "",
    });
    setErrors({});
  };

  const openAdd = () => {
    setEditRow({});
    setForm(EMPTY_FORM);
    setErrors({});
  };

  const openRadiusAdd = () => {
    setRadiusEditRow({});
    setRadiusForm(EMPTY_RADIUS_FORM);
    setRadiusErrors({});
  };

  const openRadiusEdit = (row) => {
    setRadiusEditRow(row);
    setRadiusForm({
      startKm:        row.startingKm      ?? "",
      endKm:          row.endingKm        ?? "",
      feePercantages: row.feePercentage   ?? "",
    });
    setRadiusErrors({});
  };

  const openCibilAdd = () => {
    setCibilEditRow({});
    setCibilForm(EMPTY_CIBIL_FORM);
    setCibilErrors({});
  };

  const openCibilEdit = (row) => {
    setCibilEditRow(row);
    setCibilForm({
      startScore:    row.startScore    ?? "",
      endScore:      row.endScore      ?? "",
      feePercentage: row.feePercentage ?? "",
    });
    setCibilErrors({});
  };

  const validateCibil = () => {
    const e = {};
    CIBIL_FIELD_CONFIG.forEach(({ key, label }) => {
      const val = cibilForm[key];
      if (val === "" || val === null || val === undefined) {
        e[key] = `${label} is required`;
      } else if (isNaN(Number(val)) || Number(val) < 0) {
        e[key] = `${label} must be a non-negative number`;
      }
    });
    return e;
  };

  const handleCibilSave = async () => {
    const e = validateCibil();
    if (Object.keys(e).length) { setCibilErrors(e); return; }
    setCibilSaving(true);
    try {
      const payload = {
        startScore:    Number(cibilForm.startScore),
        endScore:      Number(cibilForm.endScore),
        feePercentage: Number(cibilForm.feePercentage),
        ...(cibilEditRow?.id != null && { id: cibilEditRow.id }),
      };
      const res = await updateBorrowerScore(payload);
      if (res?.status === 200 || res?.status === 201) {
        Swal.fire({ icon: "success", title: "Saved!", text: "CIBIL score fee saved successfully.", confirmButtonColor: PRIMARY });
        setCibilEditRow(null);
        fetchCibilFees();
      } else {
        throw new Error();
      }
    } catch {
      Swal.fire({ icon: "error", title: "Failed", text: "Could not save CIBIL score fee. Please try again.", confirmButtonColor: PRIMARY });
    } finally {
      setCibilSaving(false);
    }
  };

  const validateRadius = () => {
    const e = {};
    RADIUS_FIELD_CONFIG.forEach(({ key, label }) => {
      const val = radiusForm[key];
      if (val === "" || val === null || val === undefined) {
        e[key] = `${label} is required`;
      } else if (isNaN(Number(val)) || Number(val) < 0) {
        e[key] = `${label} must be a non-negative number`;
      }
    });
    return e;
  };

  const handleRadiusSave = async () => {
    const e = validateRadius();
    if (Object.keys(e).length) { setRadiusErrors(e); return; }
    setRadiusSaving(true);
    try {
      const payload = {
        startKm:        Number(radiusForm.startKm),
        endKm:          Number(radiusForm.endKm),
        feePercantages: Number(radiusForm.feePercantages),
        ...(radiusEditRow?.id != null && { id: radiusEditRow.id }),
      };
      const res = await radiusBasedFee(payload);
      if (res?.status === 200 || res?.status === 201) {
        Swal.fire({ icon: "success", title: "Saved!", text: "Radius-based fee saved successfully.", confirmButtonColor: PRIMARY });
        setRadiusEditRow(null);
        fetchRadiusFees();
      } else {
        throw new Error();
      }
    } catch {
      Swal.fire({ icon: "error", title: "Failed", text: "Could not save radius-based fee. Please try again.", confirmButtonColor: PRIMARY });
    } finally {
      setRadiusSaving(false);
    }
  };

  const validate = () => {
    const e = {};
    FIELD_CONFIG.forEach(({ key, label }) => {
      const val = form[key];
      if (val === "" || val === null || val === undefined) {
        e[key] = `${label} is required`;
      } else if (isNaN(Number(val)) || Number(val) < 0) {
        e[key] = `${label} must be a non-negative number`;
      }
    });
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      const payload = {
        salaryPercenatge: Number(form.salaryPercenatge),
        feePercentage:    Number(form.feePercentage),
        redius:           Number(form.redius),
        ...(editRow?.id != null && { id: editRow.id }),
      };
      const res = await adminUpdateProcessingFee(payload);
      if (res?.status === 200 || res?.status === 201) {
        Swal.fire({ icon: "success", title: "Updated!", text: "Processing fee configuration saved successfully.", confirmButtonColor: PRIMARY });
        setEditRow(null);
        fetchFees();
      } else {
        throw new Error();
      }
    } catch {
      Swal.fire({ icon: "error", title: "Failed", text: "Could not save configuration. Please try again.", confirmButtonColor: PRIMARY });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">

          {/* Page Header */}
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Processing Fees</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><Link to="/OxyloansAdminDashboard">Dashboard</Link></li>
                  <li className="breadcrumb-item"><Link to="#">Borrower Fees</Link></li>
                  <li className="breadcrumb-item active">Processing Fees</li>
                </ul>
              </div>

            </div>
          </div>

          {/* Summary Cards */}
          {/* {!loading && fees.length > 0 && (
            <div className="row mb-3 g-3">
              {[
                { label: "Salary Percentage", value: `${fees[0]?.salaryPercenatge ?? "—"}%`, icon: "fa-percent" },
                { label: "Fee Percentage",    value: `${fees[0]?.feePercentage    ?? "—"}%`, icon: "fa-tag"     },
                { label: "Radius",            value: `${fees[0]?.redius           ?? "—"} km`, icon: "fa-map-marker" },
              ].map(({ label, value, icon }) => (
                <div className="col-6 col-md-4" key={label}>
                  <div className="card mb-0" style={{ borderLeft: `4px solid ${PRIMARY}` }}>
                    <div className="card-body py-3 d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center justify-content-center rounded-circle"
                        style={{ width: 44, height: 44, background: "#eef1fd", flexShrink: 0 }}>
                        <i className={`fa ${icon}`} style={{ color: PRIMARY, fontSize: 18 }} />
                      </div>
                      <div>
                        <div className="fw-bold" style={{ fontSize: 20, lineHeight: 1 }}>{value}</div>
                        <small className="text-muted">{label}</small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )} */}

          {/* Table Card */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between py-3">
              <div>
                <h5 className="mb-0 fw-bold">Processing Fee Configuration</h5>
                <small className="text-muted">Salary %, fee %, and proximity radius settings</small>
              </div>
              <button
                className="btn btn-sm"
                style={{ background: PRIMARY, color: "#fff", fontWeight: 600, borderRadius: 8, padding: "7px 16px", fontSize: 13 }}
                onClick={openAdd}
              >
                <i className="fa fa-plus me-1" />Add Configuration
              </button>
            </div>

            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" style={{ color: PRIMARY }} />
                  <p className="mt-2 text-muted">Loading configuration...</p>
                </div>
              ) : fees.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fa fa-cog fa-3x mb-3" style={{ color: "#d0d5dd" }} />
                  <p className="text-muted mb-2">No processing fee configuration found.</p>
                  <button
                    className="btn btn-sm"
                    style={{ background: PRIMARY, color: "#fff", borderRadius: 6 }}
                    onClick={openAdd}
                  >
                    <i className="fa fa-plus me-1" />Add Configuration
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                    <thead style={{ background: "#f8f9fb" }}>
                      <tr>
                        <th className="ps-4">#</th>
                        <th>Salary Percentage (%)</th>
                        <th>Fee Percentage (%)</th>
                        <th>Radius (km)</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fees.map((row, idx) => (
                        <tr key={row.id || idx}>
                          <td className="ps-4 text-muted">{idx + 1}</td>
                          <td>
                            <span className="rounded-pill px-3 py-1"
                              style={{ background: "#eef1fd", color: PRIMARY, fontWeight: 600, fontSize: 12 }}>
                              {row.salaryPercenatge ?? "—"}%
                            </span>
                          </td>
                          <td>
                            <span className="rounded-pill px-3 py-1"
                              style={{ background: "#e8f5e9", color: "#1a7a4a", fontWeight: 600, fontSize: 12 }}>
                              {row.feePercentage ?? "—"}%
                            </span>
                          </td>
                          <td>
                            <span className="rounded-pill px-3 py-1"
                              style={{ background: "#fff8e1", color: "#b45309", fontWeight: 600, fontSize: 12 }}>
                              {row.redius ?? "—"} km
                            </span>
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm"
                              style={{ background: PRIMARY, color: "#fff", borderRadius: 6, padding: "4px 14px", fontSize: 12 }}
                              onClick={() => openEdit(row)}
                            >
                              <i className="fa fa-pencil me-1" />Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          {/* Radius-Based Fee Section */}
          <div className="card mt-4">
            <div className="card-header d-flex align-items-center justify-content-between py-3">
              <div>
                <h5 className="mb-0 fw-bold">Radius-Based Fee Configuration</h5>
                <small className="text-muted">Fee percentage based on distance range (km)</small>
              </div>
              <button
                className="btn btn-sm"
                style={{ background: PRIMARY, color: "#fff", fontWeight: 600, borderRadius: 8, padding: "7px 16px", fontSize: 13 }}
                onClick={openRadiusAdd}
              >
                <i className="fa fa-plus me-1" />Add
              </button>
            </div>
            <div className="card-body p-0">
              {radiusLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" style={{ color: PRIMARY }} />
                  <p className="mt-2 text-muted">Loading...</p>
                </div>
              ) : radiusFees.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No radius-based fee entries found.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                    <thead style={{ background: "#f8f9fb" }}>
                      <tr>
                        <th className="ps-4">#</th>
                        <th>Start KM</th>
                        <th>End KM</th>
                        <th>Fee Percentage (%)</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {radiusFees.map((row, idx) => (
                        <tr key={row.id || idx}>
                          <td className="ps-4 text-muted">{idx + 1}</td>
                          <td>
                            <span className="rounded-pill px-3 py-1"
                              style={{ background: "#eef1fd", color: PRIMARY, fontWeight: 600, fontSize: 12 }}>
                              {row.startingKm ?? "—"} km
                            </span>
                          </td>
                          <td>
                            <span className="rounded-pill px-3 py-1"
                              style={{ background: "#fff8e1", color: "#b45309", fontWeight: 600, fontSize: 12 }}>
                              {row.endingKm ?? "—"} km
                            </span>
                          </td>
                          <td>
                            <span className="rounded-pill px-3 py-1"
                              style={{ background: "#e8f5e9", color: "#1a7a4a", fontWeight: 600, fontSize: 12 }}>
                              {row.feePercentage ?? "—"}%
                            </span>
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm"
                              style={{ background: PRIMARY, color: "#fff", borderRadius: 6, padding: "4px 14px", fontSize: 12 }}
                              onClick={() => openRadiusEdit(row)}
                            >
                              <i className="fa fa-pencil me-1" />Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* CIBIL Score-Based Fee Section */}
          <div className="card mt-4 mb-16">
            <div className="card-header d-flex align-items-center justify-content-between py-3">
              <div>
                <h5 className="mb-0 fw-bold">CIBIL Score-Based Fee Configuration</h5>
                <small className="text-muted">Fee percentage based on borrower CIBIL score range</small>
              </div>
              <button
                className="btn btn-sm"
                style={{ background: PRIMARY, color: "#fff", fontWeight: 600, borderRadius: 8, padding: "7px 16px", fontSize: 13 }}
                onClick={openCibilAdd}
              >
                <i className="fa fa-plus me-1" />Add
              </button>
            </div>
            <div className="card-body p-0">
              {cibilLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" style={{ color: PRIMARY }} />
                  <p className="mt-2 text-muted">Loading...</p>
                </div>
              ) : cibilFees.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No CIBIL score fee entries found.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                    <thead style={{ background: "#f8f9fb" }}>
                      <tr>
                        <th className="ps-4">#</th>
                        <th>Start Score</th>
                        <th>End Score</th>
                        <th>Fee Percentage (%)</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cibilFees.map((row, idx) => (
                        <tr key={row.id || idx}>
                          <td className="ps-4 text-muted">{idx + 1}</td>
                          <td>
                            <span className="rounded-pill px-3 py-1"
                              style={{ background: "#eef1fd", color: PRIMARY, fontWeight: 600, fontSize: 12 }}>
                              {row.startScore ?? "—"}
                            </span>
                          </td>
                          <td>
                            <span className="rounded-pill px-3 py-1"
                              style={{ background: "#fff8e1", color: "#b45309", fontWeight: 600, fontSize: 12 }}>
                              {row.endScore ?? "—"}
                            </span>
                          </td>
                          <td>
                            <span className="rounded-pill px-3 py-1"
                              style={{ background: "#e8f5e9", color: "#1a7a4a", fontWeight: 600, fontSize: 12 }}>
                              {row.feePercentage ?? "—"}%
                            </span>
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm"
                              style={{ background: PRIMARY, color: "#fff", borderRadius: 6, padding: "4px 14px", fontSize: 12 }}
                              onClick={() => openCibilEdit(row)}
                            >
                              <i className="fa fa-pencil me-1" />Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CIBIL Score Fee Modal */}
      {cibilEditRow !== null && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => !cibilSaving && setCibilEditRow(null)}
        >
          <div
            style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 480, boxShadow: "0 8px 40px rgba(0,0,0,0.18)", overflow: "hidden", display: "flex", flexDirection: "column" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ background: PRIMARY, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h5 className="mb-0 text-white fw-bold" style={{ fontSize: 16 }}>
                <i className={`fa fa-${cibilEditRow.id ? "pencil" : "plus"} me-2`} />
                {cibilEditRow.id ? "Edit" : "Add"} CIBIL Score Fee
              </h5>
              <button
                className="btn btn-sm"
                style={{ color: "#fff", background: "transparent", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 6, padding: "4px 10px" }}
                onClick={() => setCibilEditRow(null)}
              >✕</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div className="row g-3">
                {CIBIL_FIELD_CONFIG.map(({ key, label, min, max, step }) => (
                  <div className="col-12" key={key}>
                    <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                      {label} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      min={min}
                      max={max}
                      step={step}
                      className={`form-control ${cibilErrors[key] ? "is-invalid" : ""}`}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      value={cibilForm[key]}
                      onChange={e => {
                        setCibilForm({ ...cibilForm, [key]: e.target.value });
                        setCibilErrors({ ...cibilErrors, [key]: "" });
                      }}
                    />
                    {cibilErrors[key] && <div className="invalid-feedback">{cibilErrors[key]}</div>}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: "12px 24px 20px", display: "flex", gap: 10, borderTop: "1px solid #e9ecef", background: "#f8f9fa" }}>
              <button
                className="btn"
                style={{ background: PRIMARY, color: "#fff", fontWeight: 600, borderRadius: 6, padding: "9px 24px" }}
                onClick={handleCibilSave}
                disabled={cibilSaving}
              >
                {cibilSaving ? <><span className="spinner-border spinner-border-sm me-1" />Saving...</> : <><i className="fa fa-save me-1" />Save</>}
              </button>
              <button
                className="btn btn-outline-secondary"
                style={{ borderRadius: 6, padding: "9px 20px" }}
                onClick={() => setCibilEditRow(null)}
                disabled={cibilSaving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Radius-Based Fee Modal */}
      {radiusEditRow !== null && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => !radiusSaving && setRadiusEditRow(null)}
        >
          <div
            style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 480, boxShadow: "0 8px 40px rgba(0,0,0,0.18)", overflow: "hidden", display: "flex", flexDirection: "column" }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ background: PRIMARY, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h5 className="mb-0 text-white fw-bold" style={{ fontSize: 16 }}>
                <i className={`fa fa-${radiusEditRow.id ? "pencil" : "plus"} me-2`} />
                {radiusEditRow.id ? "Edit" : "Add"} Radius-Based Fee
              </h5>
              <button
                className="btn btn-sm"
                style={{ color: "#fff", background: "transparent", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 6, padding: "4px 10px" }}
                onClick={() => setRadiusEditRow(null)}
              >✕</button>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div className="row g-3">
                {/* Optional ID field for update */}
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>ID <span className="text-muted">(optional — for update)</span></label>
                  <input
                    type="number"
                    min={1}
                    step="1"
                    className="form-control"
                    placeholder="Leave blank to create new"
                    value={radiusEditRow.id ?? ""}
                    onChange={e => setRadiusEditRow({ ...radiusEditRow, id: e.target.value === "" ? undefined : Number(e.target.value) })}
                  />
                </div>
                {RADIUS_FIELD_CONFIG.map(({ key, label, min, max, step }) => (
                  <div className="col-12" key={key}>
                    <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                      {label} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      min={min}
                      max={max}
                      step={step}
                      className={`form-control ${radiusErrors[key] ? "is-invalid" : ""}`}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      value={radiusForm[key]}
                      onChange={e => {
                        setRadiusForm({ ...radiusForm, [key]: e.target.value });
                        setRadiusErrors({ ...radiusErrors, [key]: "" });
                      }}
                    />
                    {radiusErrors[key] && <div className="invalid-feedback">{radiusErrors[key]}</div>}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: "12px 24px 20px", display: "flex", gap: 10, borderTop: "1px solid #e9ecef", background: "#f8f9fa" }}>
              <button
                className="btn"
                style={{ background: PRIMARY, color: "#fff", fontWeight: 600, borderRadius: 6, padding: "9px 24px" }}
                onClick={handleRadiusSave}
                disabled={radiusSaving}
              >
                {radiusSaving ? <><span className="spinner-border spinner-border-sm me-1" />Saving...</> : <><i className="fa fa-save me-1" />Save</>}
              </button>
              <button
                className="btn btn-outline-secondary"
                style={{ borderRadius: 6, padding: "9px 20px" }}
                onClick={() => setRadiusEditRow(null)}
                disabled={radiusSaving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {editRow !== null && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => !saving && setEditRow(null)}
        >
          <div
            style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 480, boxShadow: "0 8px 40px rgba(0,0,0,0.18)", overflow: "hidden", display: "flex", flexDirection: "column" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ background: PRIMARY, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h5 className="mb-0 text-white fw-bold" style={{ fontSize: 16 }}>
                <i className={`fa fa-${editRow.id ? "pencil" : "plus"} me-2`} />
                {editRow.id ? "Edit" : "Add"} Processing Fee Config
              </h5>
              <button
                className="btn btn-sm"
                style={{ color: "#fff", background: "transparent", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 6, padding: "4px 10px" }}
                onClick={() => setEditRow(null)}
              >✕</button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 24px" }}>
              <div className="row g-3">
                {FIELD_CONFIG.map(({ key, label, min, max, step }) => (
                  <div className="col-12" key={key}>
                    <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                      {label} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      min={min}
                      max={max}
                      step={step}
                      className={`form-control ${errors[key] ? "is-invalid" : ""}`}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      value={form[key]}
                      onChange={e => {
                        setForm({ ...form, [key]: e.target.value });
                        setErrors({ ...errors, [key]: "" });
                      }}
                    />
                    {errors[key] && <div className="invalid-feedback">{errors[key]}</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "12px 24px 20px", display: "flex", gap: 10, borderTop: "1px solid #e9ecef", background: "#f8f9fa" }}>
              <button
                className="btn"
                style={{ background: PRIMARY, color: "#fff", fontWeight: 600, borderRadius: 6, padding: "9px 24px" }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <><span className="spinner-border spinner-border-sm me-1" />Saving...</> : <><i className="fa fa-save me-1" />Save</>}
              </button>
              <button
                className="btn btn-outline-secondary"
                style={{ borderRadius: 6, padding: "9px 20px" }}
                onClick={() => setEditRow(null)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer/>
    </div>
  );
};

export default ProcessingFees;
