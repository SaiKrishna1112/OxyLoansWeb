import React, { useState } from "react";
import Swal from "sweetalert2";
import { formatINR } from "../creditReportUtils";
import { submitEmergencyReferences } from "./instantLoanService";

const RELATIONSHIPS = [
  "Parent",
  "Spouse",
  "Sibling",
  "Friend",
  "Colleague",
  "Relative",
];

const InstantLoanStepProfile = ({ initialData = {}, onNext }) => {
  const initialMaritalStatus = initialData.maritalStatus || "Single";
  const [formData, setFormData] = useState({
    name: initialData.name || "narendra kumar b",
    mobile: initialData.mobile || "9492902990",
    panNumber: initialData.panNumber || initialData.documentId || "CDBPB2737H",
    dateOfBirth: initialData.dateOfBirth || initialData.dob || "1994-08-08",
    motherName: initialData.motherName || "abc",
    maritalStatus: initialMaritalStatus,
    spouseName: initialMaritalStatus === "Married" ? (initialData.spouseName || "") : "",
    spouseDob: initialMaritalStatus === "Married" ? (initialData.spouseDob || "") : "",
    monthlySalary: initialData.monthlySalary || initialData.salary || "65000",
    employmentType: initialData.employmentType || "SALARIED",
    companyName: initialData.companyName || "SRS Fintech Labs Pvt Ltd",
    designation: initialData.designation || "Senior Software Engineer",
    officeAddress: initialData.officeAddress || "oxyloans",
    officeMailId: initialData.officeMailId || "nanan@gmail.com",
    officeLandLine: initialData.officeLandLine || "12254655",
    address: initialData.address || "KPHB, Hyderabad",
    pincode: initialData.pincode || "500072",
  });

  const [ref1, setRef1] = useState(
    initialData.ref1 || {
      name: "Balijepalli Venkata",
      mobile: "9848022338",
      relation: "Parent",
    }
  );

  const [ref2, setRef2] = useState(
    initialData.ref2 || {
      name: "Kiran Sharma",
      mobile: "9121234567",
      relation: "Colleague",
    }
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const salaryNum = Number(formData.monthlySalary) || 0;
  const estimatedCap = Math.round(salaryNum * 0.9);

  // Age calculation helper
  const calculateAge = (dob) => {
    if (!dob) return null;
    const diff = Date.now() - new Date(dob).getTime();
    const ageDt = new Date(diff);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };
  const borrowerAge = calculateAge(formData.dateOfBirth);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "maritalStatus") {
      setFormData((prev) => ({
        ...prev,
        maritalStatus: value,
        ...(value !== "Married" ? { spouseName: "", spouseDob: "" } : {}),
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: name === "panNumber" ? value.toUpperCase().slice(0, 10) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim()) {
      setErrorMessage("Please enter borrower legal name.");
      return;
    }
    if (!formData.mobile || formData.mobile.replace(/\D/g, "").length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }
    const cleanPan = formData.panNumber.trim().toUpperCase();
    if (!cleanPan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      setErrorMessage("Please enter a valid 10-character Indian PAN (e.g. CDBPB2737H).");
      return;
    }
    if (salaryNum < 10000) {
      setErrorMessage("Minimum monthly income requirement is ₹10,000.");
      return;
    }
    if (!ref1.name.trim() || ref1.mobile.replace(/\D/g, "").length < 10) {
      setErrorMessage("Please provide valid details for Emergency Reference 1.");
      return;
    }
    if (!ref2.name.trim() || ref2.mobile.replace(/\D/g, "").length < 10) {
      setErrorMessage("Please provide valid details for Emergency Reference 2.");
      return;
    }
    if (ref1.mobile.replace(/\D/g, "") === ref2.mobile.replace(/\D/g, "")) {
      setErrorMessage("Reference 1 and Reference 2 must have distinct contact numbers.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitEmergencyReferences(ref1, ref2);

      Swal.fire({
        icon: "success",
        title: "Profile & References Verified",
        text: "Moving to instant salary-based eligibility assessment.",
        timer: 1400,
        showConfirmButton: false,
      });

      onNext({
        ...formData,
        spouseName: formData.maritalStatus === "Married" ? formData.spouseName : "",
        spouseDob: formData.maritalStatus === "Married" ? formData.spouseDob : "",
        panNumber: cleanPan,
        ref1,
        ref2,
      });
    } catch (err) {
      setErrorMessage("Failed to save references. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="fintech-card">
      {/* Step Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge badge-fintech-primary-soft px-3 py-1 rounded-pill small">
              Phase 1 • Basic KYC & Emergency Contacts
            </span>
            <span className="badge badge-fintech-neutral px-2 py-1 rounded-pill small">
              Step 1 of 6
            </span>
          </div>
          <h4 className="fw-bold text-dark mb-1">Borrower Profile & Emergency References</h4>
          <p className="text-muted small mb-0">
            Enter your primary employment data and 2 verified references to unlock instant escrow matching.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="badge badge-fintech-success-soft px-3 py-2 rounded-pill small">
            <i className="fa-solid fa-shield-check me-1"></i>
            Bank-Grade 256-bit Encryption
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="alert alert-danger border-0 rounded-4 p-3 small mb-4 d-flex align-items-center gap-3 shadow-xs">
          <div className="rounded-circle bg-danger bg-opacity-10 text-danger p-2">
            <i className="fa-solid fa-triangle-exclamation fs-5"></i>
          </div>
          <div>
            <strong className="d-block">Submission Requirement</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Dynamic Pre-Approval Potential Banner */}
      <div
        className="p-3 rounded-4 mb-4 text-white d-flex flex-wrap justify-content-between align-items-center gap-3 shadow-xs"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)" }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-circle bg-white bg-opacity-15 d-flex align-items-center justify-content-center text-white"
            style={{ width: "46px", height: "46px" }}
          >
            <i className="fa-solid fa-bolt-lightning fs-5 text-warning"></i>
          </div>
          <div>
            <span className="text-white text-opacity-75 small d-block">
              Estimated Instant Loan Capacity
            </span>
            <h4 className="fw-bold text-white mb-0">
              Up to {formatINR(estimatedCap)}
            </h4>
          </div>
        </div>

        <div className="text-md-end">
          <span className="badge badge-fintech-white-translucent rounded-pill px-3 py-1 small">
            90% of Monthly Salary ({formatINR(salaryNum)})
          </span>
          <div className="text-white text-opacity-75 small mt-1" style={{ fontSize: "11px" }}>
            *Final limit calculated after PaySprint Bureau pull
          </div>
        </div>
      </div>

      {/* Part A: Professional & Employment Profile */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
            <i className="fa-solid fa-user small"></i>
          </div>
          <h6 className="fw-bold text-dark mb-0">Borrower Identity & Employment</h6>
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-bold text-dark mb-1">
              Full Legal Name <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 rounded-start-3 text-muted">
                <i className="fa-solid fa-signature"></i>
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                className="form-control instant-form-control border-start-0 rounded-end-3"
                placeholder="e.g. Narendra Kumar B"
                required
              />
            </div>
            <small className="text-muted" style={{ fontSize: "11px" }}>
              Must match your PAN Card and Bank Account.
            </small>
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-bold text-dark mb-1">
              Mobile Number (Aadhaar linked) <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 rounded-start-3 fw-bold text-muted">
                +91
              </span>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleFormChange}
                maxLength="10"
                className="form-control instant-form-control border-start-0 rounded-end-3"
                placeholder="10-digit mobile number"
                required
              />
            </div>
            <small className="text-muted" style={{ fontSize: "11px" }}>
              Used for Bureau CIR retrieval and Aadhaar OTP.
            </small>
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              PAN Number <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 rounded-start-3 text-muted">
                <i className="fa-solid fa-id-card"></i>
              </span>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleFormChange}
                maxLength="10"
                className="form-control instant-form-control border-start-0 rounded-end-3 text-uppercase fw-bold letter-spacing-1"
                placeholder="ABCDE1234F"
                required
              />
            </div>
            <small className="text-success fw-semibold" style={{ fontSize: "11px" }}>
              <i className="fa-solid fa-circle-check me-1"></i>
              Verified in Phase 3 with PaySprint CIR
            </small>
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              Date of Birth <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 rounded-start-3 text-muted">
                <i className="fa-solid fa-calendar-day"></i>
              </span>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleFormChange}
                className="form-control instant-form-control border-start-0 rounded-end-3"
                required
              />
            </div>
            {borrowerAge && (
              <small className="text-muted" style={{ fontSize: "11px" }}>
                Current Age: <strong>{borrowerAge} Years</strong> (Eligible: 21-58 yrs)
              </small>
            )}
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              Mother's Full Name <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 rounded-start-3 text-muted">
                <i className="fa-solid fa-person-breastfeeding"></i>
              </span>
              <input
                type="text"
                name="motherName"
                value={formData.motherName}
                onChange={handleFormChange}
                className="form-control instant-form-control border-start-0 rounded-end-3"
                placeholder="e.g. abc"
                required
              />
            </div>
            <small className="text-muted" style={{ fontSize: "11px" }}>
              Required for Bureau security verification.
            </small>
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              Marital Status <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 rounded-start-3 text-muted">
                <i className="fa-solid fa-heart"></i>
              </span>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleFormChange}
                className="form-select instant-form-control border-start-0 rounded-end-3"
                required
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
          </div>

          {formData.maritalStatus === "Married" && (
            <>
              <div className="col-md-4">
                <label className="form-label small fw-bold text-dark mb-1">
                  Spouse Full Name
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 rounded-start-3 text-muted">
                    <i className="fa-solid fa-user-group"></i>
                  </span>
                  <input
                    type="text"
                    name="spouseName"
                    value={formData.spouseName}
                    onChange={handleFormChange}
                    className="form-control instant-form-control border-start-0 rounded-end-3"
                    placeholder="Enter spouse full name"
                  />
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold text-dark mb-1">
                  Spouse Date of Birth
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 rounded-start-3 text-muted">
                    <i className="fa-solid fa-calendar"></i>
                  </span>
                  <input
                    type="text"
                    name="spouseDob"
                    value={formData.spouseDob}
                    onChange={handleFormChange}
                    className="form-control instant-form-control border-start-0 rounded-end-3"
                    placeholder="e.g. 20/10/2003"
                  />
                </div>
              </div>
            </>
          )}

          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              Net Monthly Salary (in INR) <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 rounded-start-3 text-muted fw-bold">
                ₹
              </span>
              <input
                type="number"
                name="monthlySalary"
                value={formData.monthlySalary}
                onChange={handleFormChange}
                step="1000"
                className="form-control instant-form-control border-start-0 rounded-end-3 fw-bold text-dark"
                placeholder="65000"
                required
              />
            </div>
            <small className="text-primary fw-semibold" style={{ fontSize: "11px" }}>
              Capacity: {formatINR(estimatedCap)}
            </small>
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              Employer / Organization Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleFormChange}
              className="form-control instant-form-control"
              placeholder="e.g. SRS Fintech Labs Pvt Ltd"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              Designation / Role
            </label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleFormChange}
              className="form-control instant-form-control"
              placeholder="e.g. Senior Software Engineer"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              Official Work Email
            </label>
            <input
              type="email"
              name="officeMailId"
              value={formData.officeMailId}
              onChange={handleFormChange}
              className="form-control instant-form-control"
              placeholder="e.g. nanan@gmail.com"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              Office Landline No.
            </label>
            <input
              type="text"
              name="officeLandLine"
              value={formData.officeLandLine}
              onChange={handleFormChange}
              className="form-control instant-form-control"
              placeholder="e.g. 12254655"
            />
          </div>

          <div className="col-md-8">
            <label className="form-label small fw-bold text-dark mb-1">
              Office / Workplace Address
            </label>
            <input
              type="text"
              name="officeAddress"
              value={formData.officeAddress}
              onChange={handleFormChange}
              className="form-control instant-form-control"
              placeholder="e.g. oxyloans"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              Current City / Locality
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleFormChange}
              className="form-control instant-form-control"
              placeholder="e.g. KPHB, Hyderabad"
            />
          </div>

          <div className="col-md-2">
            <label className="form-label small fw-bold text-dark mb-1">
              Pincode
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleFormChange}
              maxLength="6"
              className="form-control instant-form-control"
              placeholder="500072"
            />
          </div>
        </div>
      </div>

      {/* Part B: Emergency References (Mandatory 2 Contacts) */}
      <div className="mb-4 pt-3 border-top">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
              <i className="fa-solid fa-users-viewfinder small"></i>
            </div>
            <div>
              <h6 className="fw-bold text-dark mb-0">Emergency References (Minimum 2 Required)</h6>
              <span className="text-muted small" style={{ fontSize: "11px" }}>
                Mandatory for P2P underwriting risk assessment. No spam or marketing calls.
              </span>
            </div>
          </div>
          <span className="badge badge-fintech-success-soft px-2 py-1 rounded-pill small">
            2 Distinct Contacts Required
          </span>
        </div>

        <div className="row g-3">
          {/* Reference 1 */}
          <div className="col-lg-6">
            <div className="p-3 rounded-4 border bg-light h-100 position-relative">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="badge badge-fintech-primary small px-2 py-1 rounded-pill">
                  Reference 1 (Immediate Family)
                </span>
                <span className="text-muted small" style={{ fontSize: "11px" }}>Primary</span>
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold text-dark mb-1">Full Name</label>
                <input
                  type="text"
                  value={ref1.name}
                  onChange={(e) => setRef1({ ...ref1, name: e.target.value })}
                  className="form-control form-control-sm instant-form-control"
                  placeholder="e.g. Balijepalli Venkata"
                  required
                />
              </div>

              <div className="row g-2">
                <div className="col-7">
                  <label className="form-label small fw-bold text-dark mb-1">Contact Mobile</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white border-end-0">+91</span>
                    <input
                      type="tel"
                      value={ref1.mobile}
                      onChange={(e) => setRef1({ ...ref1, mobile: e.target.value })}
                      maxLength="10"
                      className="form-control form-control-sm instant-form-control border-start-0"
                      placeholder="10 digits"
                      required
                    />
                  </div>
                </div>

                <div className="col-5">
                  <label className="form-label small fw-bold text-dark mb-1">Relationship</label>
                  <select
                    value={ref1.relation}
                    onChange={(e) => setRef1({ ...ref1, relation: e.target.value })}
                    className="form-select form-select-sm instant-form-control"
                  >
                    {RELATIONSHIPS.map((rel) => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Reference 2 */}
          <div className="col-lg-6">
            <div className="p-3 rounded-4 border bg-light h-100 position-relative">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="badge badge-fintech-neutral small px-2 py-1 rounded-pill">
                  Reference 2 (Work / Colleague)
                </span>
                <span className="text-muted small" style={{ fontSize: "11px" }}>Secondary</span>
              </div>

              <div className="mb-2">
                <label className="form-label small fw-bold text-dark mb-1">Full Name</label>
                <input
                  type="text"
                  value={ref2.name}
                  onChange={(e) => setRef2({ ...ref2, name: e.target.value })}
                  className="form-control form-control-sm instant-form-control"
                  placeholder="e.g. Kiran Sharma"
                  required
                />
              </div>

              <div className="row g-2">
                <div className="col-7">
                  <label className="form-label small fw-bold text-dark mb-1">Contact Mobile</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white border-end-0">+91</span>
                    <input
                      type="tel"
                      value={ref2.mobile}
                      onChange={(e) => setRef2({ ...ref2, mobile: e.target.value })}
                      maxLength="10"
                      className="form-control form-control-sm instant-form-control border-start-0"
                      placeholder="10 digits"
                      required
                    />
                  </div>
                </div>

                <div className="col-5">
                  <label className="form-label small fw-bold text-dark mb-1">Relationship</label>
                  <select
                    value={ref2.relation}
                    onChange={(e) => setRef2({ ...ref2, relation: e.target.value })}
                    className="form-select form-select-sm instant-form-control"
                  >
                    {RELATIONSHIPS.map((rel) => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-3 border-top">
        <div className="text-muted small d-flex align-items-center gap-2">
          <i className="fa-solid fa-lock text-success fs-6"></i>
          <span>PAN & DOB are cross-verified in Step 3 via PaySprint CIR bureau API.</span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary px-4 py-2 rounded-3 fw-bold text-white shadow-sm"
          style={{ backgroundColor: "#0040e0", borderColor: "#0040e0" }}
        >
          {isSubmitting ? (
            <>
              <i className="fa-solid fa-spinner fa-spin me-2"></i>
              Saving Profile...
            </>
          ) : (
            <>
              Continue to Salary Assessment Fee
              <i className="fa-solid fa-arrow-right ms-2"></i>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default InstantLoanStepProfile;
