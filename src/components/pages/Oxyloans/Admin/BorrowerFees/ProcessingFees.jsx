import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";
import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
import {
  getAdminUpdateProcessingFees,
  adminUpdateProcessingFee,
} from "../../../../HttpRequest/admin.js";
import Swal from "sweetalert2";

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

const ProcessingFees = () => {
  const [fees, setFees]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);

  useEffect(() => { fetchFees(); }, []);

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
              <div className="col-auto">
                <button
                  className="btn"
                  style={{ background: PRIMARY, color: "#fff", fontWeight: 600, borderRadius: 8, padding: "8px 20px", fontSize: 13 }}
                  onClick={openAdd}
                >
                  <i className="fa fa-plus me-1" />Add Configuration
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          {!loading && fees.length > 0 && (
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
          )}

          {/* Table Card */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between py-3">
              <h5 className="mb-0 fw-bold">Processing Fee Configuration</h5>
              <small className="text-muted">Salary %, fee %, and proximity radius settings</small>
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
        </div>
      </div>

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
    </div>
  );
};

export default ProcessingFees;
