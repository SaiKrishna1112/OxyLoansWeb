import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";
import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
import {
  getBorrowerCharges,
  updateBorrowerCharges,
} from "../../../../HttpRequest/admin.js";
import Swal from "sweetalert2";

const PRIMARY = "#3d5ee1";

const FIELD_CONFIG = [
  { key: "platFormFee",       label: "Platform Fee (₹)",        min: 0 },
  { key: "fixedPenalty",      label: "Fixed Penalty (₹)",       min: 0 },
  { key: "emiBounceCharges",  label: "EMI Bounce Charges (₹)",  min: 0 },
  { key: "technicalCharges",  label: "Technical Charges (₹)",   min: 0 },
  { key: "recoveryCharges",   label: "Recovery Charges (₹)",    min: 0 },
];

const EMPTY_FORM = {
  platFormFee: "",
  fixedPenalty: "",
  emiBounceCharges: "",
  technicalCharges: "",
  recoveryCharges: "",
  id: "",
};

const BorrowerCharges = () => {
  const [charges, setCharges]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editRow, setEditRow]     = useState(null);   // row being edited
  const [form, setForm]           = useState(EMPTY_FORM);
  const [errors, setErrors]       = useState({});
  const [saving, setSaving]       = useState(false);

  useEffect(() => { fetchCharges(); }, []);

  const fetchCharges = async () => {
    setLoading(true);
    try {
      const res  = await getBorrowerCharges();
      const data = Array.isArray(res?.data) ? res.data : res?.data ? [res.data] : [];
      setCharges(data);
    } catch {
      setCharges([]);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (row) => {
    setEditRow(row);
    setForm({
      platFormFee:      row.platFormFee      ?? "",
      fixedPenalty:     row.fixedPenalty     ?? "",
      emiBounceCharges: row.emiBounceCharges ?? "",
      technicalCharges: row.technicalCharges ?? "",
      recoveryCharges:  row.recoveryCharges  ?? "",
      id:               row.id               ?? "",
    });
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
        platFormFee:      Number(form.platFormFee),
        fixedPenalty:     Number(form.fixedPenalty),
        emiBounceCharges: Number(form.emiBounceCharges),
        technicalCharges: Number(form.technicalCharges),
        recoveryCharges:  Number(form.recoveryCharges),
        id:               Number(form.id),
      };
      const res = await updateBorrowerCharges(payload);
      if (res?.status === 200 || res?.status === 201) {
        Swal.fire({ icon: "success", title: "Updated!", text: "Borrower charges updated successfully.", confirmButtonColor: PRIMARY });
        setEditRow(null);
        fetchCharges();
      } else {
        throw new Error();
      }
    } catch {
      Swal.fire({ icon: "error", title: "Failed", text: "Could not update charges. Please try again.", confirmButtonColor: PRIMARY });
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
                <h3 className="page-title">Borrower Charges</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><Link to="/OxyloansAdminDashboard">Dashboard</Link></li>
                  <li className="breadcrumb-item"><Link to="#">Borrower Fees</Link></li>
                  <li className="breadcrumb-item active">Borrower Charges</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between py-3">
              <h5 className="mb-0 fw-bold">Borrower Charges Configuration</h5>
              <small className="text-muted">Manage platform and penalty charges for borrowers</small>
            </div>

            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" style={{ color: PRIMARY }} />
                  <p className="mt-2 text-muted">Loading charges...</p>
                </div>
              ) : charges.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fa fa-inbox fa-3x mb-3" style={{ color: "#d0d5dd" }} />
                  <p className="text-muted">No charge configurations found.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0" style={{ fontSize: 13 }}>
                    <thead style={{ background: "#f8f9fb" }}>
                      <tr>
                        <th className="ps-4">#</th>
                        <th>Platform Fee</th>
                        <th>Fixed Penalty</th>
                        <th>EMI Bounce Charges</th>
                        <th>Technical Charges</th>
                        <th>Recovery Charges</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {charges.map((row, idx) => (
                        <tr key={row.id || idx}>
                          <td className="ps-4 text-muted">{idx + 1}</td>
                          <td>₹{Number(row.platFormFee      ?? 0).toLocaleString("en-IN")}</td>
                          <td>₹{Number(row.fixedPenalty     ?? 0).toLocaleString("en-IN")}</td>
                          <td>₹{Number(row.emiBounceCharges ?? 0).toLocaleString("en-IN")}</td>
                          <td>₹{Number(row.technicalCharges ?? 0).toLocaleString("en-IN")}</td>
                          <td>₹{Number(row.recoveryCharges  ?? 0).toLocaleString("en-IN")}</td>
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

      {/* Edit Modal */}
      {editRow && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={() => !saving && setEditRow(null)}
        >
          <div
            style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 560, boxShadow: "0 8px 40px rgba(0,0,0,0.18)", overflow: "hidden", display: "flex", flexDirection: "column" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ background: PRIMARY, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h5 className="mb-0 text-white fw-bold" style={{ fontSize: 16 }}>
                <i className="fa fa-pencil me-2" />Edit Borrower Charges
              </h5>
              <button
                className="btn btn-sm"
                style={{ color: "#fff", background: "transparent", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 6, padding: "4px 10px" }}
                onClick={() => setEditRow(null)}
              >✕</button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 24px", overflowY: "auto" }}>
              <div className="row g-3">
                {FIELD_CONFIG.map(({ key, label }) => (
                  <div className="col-md-6" key={key}>
                    <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                      {label} <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="number"
                        min="0"
                        className={`form-control ${errors[key] ? "is-invalid" : ""}`}
                        value={form[key]}
                        onChange={e => {
                          setForm({ ...form, [key]: e.target.value });
                          setErrors({ ...errors, [key]: "" });
                        }}
                      />
                      {errors[key] && <div className="invalid-feedback">{errors[key]}</div>}
                    </div>
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
                {saving ? <><span className="spinner-border spinner-border-sm me-1" />Saving...</> : <><i className="fa fa-save me-1" />Save Changes</>}
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

export default BorrowerCharges;
