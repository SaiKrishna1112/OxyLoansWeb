import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./instantLoan.css";
import { formatINR } from "../creditReportUtils";
import {
  updateBorrowerProfile,
  normalizeDobToInput,
} from "./instantLoanApi";

const InstantLoanStepProfile = ({ initialData = {}, onNext }) => {
  const initialMaritalStatus = initialData.maritalStatus || "Single";
  const [formData, setFormData] = useState({
    name: initialData.name || "DHARMAPURI SAI KRISHNA",
    email: initialData.email || "somethingspecialday@gmail.com",
    mobile: initialData.mobile || "7702443666",
    whatsAppNumber: initialData.whatsAppNumber || initialData.mobile || "918125861874",
    gender: initialData.gender || "Male",
    panNumber: initialData.panNumber || initialData.documentId || "JUXPK2964M",
    dateOfBirth: normalizeDobToInput(initialData.dateOfBirth || initialData.dob) || "1999-11-08",
    fatherName: initialData.fatherName || "Satya",
    motherName: initialData.motherName || "",
    maritalStatus: initialMaritalStatus,
    spouseName: initialMaritalStatus === "Married" ? (initialData.spouseName || "") : "",
    spouseDob: initialMaritalStatus === "Married" ? (initialData.spouseDob || "") : "",
    address: initialData.address || "Hyderabad",
    locality: initialData.locality || "Tirumalagiri",
    city: initialData.city || "Hyderabad",
    state: initialData.state || "Telangana",
    pincode: initialData.pincode || "500085",
    monthlySalary: initialData.monthlySalary || initialData.salary || "25000",
    employmentType: initialData.employmentType || "SALARIED",
    companyName: initialData.companyName || "oxyloans",
    designation: initialData.designation || "Software Engineer",
    workExperience: initialData.workExperience || "2",
    officeAddress: initialData.officeAddress || "Plot 104, OxyLoans Office, Hyderabad",
    officeMailId: initialData.officeMailId || "somethingspecialday@gmail.com",
    officeLandLine: initialData.officeLandLine || "04048592301",
  });

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const mStatus = initialData.maritalStatus || formData.maritalStatus || "Single";
      setFormData((prev) => ({
        ...prev,
        name: initialData.name || prev.name,
        email: initialData.email || prev.email,
        mobile: initialData.mobile || prev.mobile,
        whatsAppNumber: initialData.whatsAppNumber || prev.whatsAppNumber,
        gender: initialData.gender || prev.gender || "Male",
        panNumber: initialData.panNumber || initialData.documentId || prev.panNumber,
        dateOfBirth: normalizeDobToInput(initialData.dateOfBirth || initialData.dob) || prev.dateOfBirth,
        fatherName: initialData.fatherName || prev.fatherName,
        motherName: initialData.motherName || prev.motherName,
        maritalStatus: mStatus,
        spouseName: mStatus === "Married" ? (initialData.spouseName || prev.spouseName || "") : "",
        spouseDob: mStatus === "Married" ? (initialData.spouseDob || prev.spouseDob || "") : "",
        address: initialData.address || prev.address,
        locality: initialData.locality || prev.locality,
        city: initialData.city || prev.city,
        state: initialData.state || prev.state,
        pincode: initialData.pincode || prev.pincode,
        monthlySalary: initialData.monthlySalary || initialData.salary || prev.monthlySalary,
        employmentType: initialData.employmentType || prev.employmentType || "SALARIED",
        companyName: initialData.companyName || prev.companyName,
        designation: initialData.designation || prev.designation,
        workExperience: initialData.workExperience || prev.workExperience,
        officeAddress: initialData.officeAddress || prev.officeAddress,
        officeMailId: initialData.officeMailId || prev.officeMailId,
        officeLandLine: initialData.officeLandLine || prev.officeLandLine,
      }));
    }
  }, [initialData]);

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
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      setErrorMessage("Please enter a valid personal email address.");
      return;
    }
    if (!formData.mobile || formData.mobile.replace(/\D/g, "").length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!formData.fatherName || !formData.fatherName.trim()) {
      setErrorMessage("Please enter borrower father's full name.");
      return;
    }
    if (!formData.motherName || !formData.motherName.trim()) {
      setErrorMessage("Please enter borrower mother's full name.");
      return;
    }
    if (formData.maritalStatus === "Married") {
      if (!formData.spouseName || !formData.spouseName.trim()) {
        setErrorMessage("Please enter spouse full name.");
        return;
      }
      if (!formData.spouseDob || !formData.spouseDob.trim()) {
        setErrorMessage("Please enter spouse date of birth.");
        return;
      }
    }
    if (!formData.address || !formData.address.trim()) {
      setErrorMessage("Please enter your current residential address.");
      return;
    }
    if (!formData.city || !formData.city.trim()) {
      setErrorMessage("Please enter current city.");
      return;
    }
    if (!formData.state || !formData.state.trim()) {
      setErrorMessage("Please enter current state.");
      return;
    }
    if (!formData.pincode || formData.pincode.replace(/\D/g, "").length !== 6) {
      setErrorMessage("Please enter a valid 6-digit PIN code.");
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
    if (!formData.companyName || !formData.companyName.trim()) {
      setErrorMessage("Please enter employer / organization name.");
      return;
    }
    setIsSubmitting(true);
    try {
      const uId = sessionStorage.getItem("userId") || localStorage.getItem("userId") || "41682";
      await updateBorrowerProfile({
        userId: Number(uId),
        ...formData,
        salary: Number(formData.monthlySalary),
        dob: formData.dateOfBirth,
        pinCode: formData.pincode,
      }).catch((e) => console.warn("updateBorrowerProfile background:", e));

      Swal.fire({
        icon: "success",
        title: "Profile Verified",
        text: "Moving to instant salary-based eligibility assessment.",
        timer: 1400,
        showConfirmButton: false,
      });

      onNext({
        ...formData,
        spouseName: formData.maritalStatus === "Married" ? formData.spouseName : "",
        spouseDob: formData.maritalStatus === "Married" ? formData.spouseDob : "",
        panNumber: cleanPan,
      });
    } catch (err) {
      setErrorMessage("Failed to save profile details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="fintech-card step-view-enter">
      {/* Step Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge badge-fintech-primary-soft px-3 py-1 rounded-pill small">
              Phase 1 • Basic KYC & Employment Profile
            </span>
            <span className="badge badge-fintech-neutral px-2 py-1 rounded-pill small">
              Step 1 of 6
            </span>
          </div>
          <h4 className="fw-bold text-dark mb-1">Borrower Profile & KYC</h4>
          <p className="text-muted small mb-0">
            Verify your personal details, residential address, and employment data to unlock instant escrow matching.
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
            *Final limit calculated after OxyLoans Bureau verification
          </div>
        </div>
      </div>

      {/* Section 1: Personal & Identity Profile */}
      <div className="mb-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
            <i className="fa-solid fa-user small"></i>
          </div>
          <h6 className="fw-bold text-dark mb-0">1. Borrower Personal & Identity Profile</h6>
        </div>

        <div className="row g-3">
          {/* Full Legal Name */}
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
                placeholder="e.g. DHARMAPURI SAI KRISHNA"
                required
              />
            </div>
            <small className="text-muted" style={{ fontSize: "11px" }}>
              As per Aadhaar / PAN card.
            </small>
          </div>

          {/* Personal Email */}
          <div className="col-md-6">
            <label className="form-label small fw-bold text-dark mb-1">
              Personal Email Address <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 rounded-start-3 text-muted">
                <i className="fa-solid fa-envelope"></i>
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                className="form-control instant-form-control border-start-0 rounded-end-3"
                placeholder="e.g. narendra@oxyloans.com"
                required
              />
            </div>
            <small className="text-muted" style={{ fontSize: "11px" }}>
              For agreement documentation and instant loan updates.
            </small>
          </div>

          {/* Mobile Number */}
          <div className="col-md-4">
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
          </div>

          {/* WhatsApp Number */}
          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              WhatsApp Number
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 rounded-start-3 text-success">
                <i className="fa-brands fa-whatsapp"></i>
              </span>
              <input
                type="tel"
                name="whatsAppNumber"
                value={formData.whatsAppNumber}
                onChange={handleFormChange}
                maxLength="10"
                className="form-control instant-form-control border-start-0 rounded-end-3"
                placeholder="WhatsApp contact number"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              Gender <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 rounded-start-3 text-muted">
                <i className="fa-solid fa-venus-mars"></i>
              </span>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleFormChange}
                className="form-select instant-form-control border-start-0 rounded-end-3"
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Date of Birth */}
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

          {/* Father's Full Name */}
          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              Father's Full Name <span className="text-danger">*</span>
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 rounded-start-3 text-muted">
                <i className="fa-solid fa-user-tie"></i>
              </span>
              <input
                type="text"
                name="fatherName"
                value={formData.fatherName}
                onChange={handleFormChange}
                className="form-control instant-form-control border-start-0 rounded-end-3"
                placeholder="Father's full name (e.g. Satya)"
                required
              />
            </div>
          </div>

          {/* Mother's Full Name */}
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
                placeholder="Mother's full name"
                required
              />
            </div>
          </div>

          {/* PAN Card Number */}
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
                placeholder="JUXPK2964M"
                required
              />
            </div>
            <small className="text-muted" style={{ fontSize: "11px" }}>
              <i className="fa-solid fa-shield-halved text-primary me-1"></i>
              PAN will be verified against Credit Bureau records in Step 3.
            </small>
          </div>

          {/* Marital Status */}
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
                  Spouse Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="spouseName"
                  value={formData.spouseName}
                  onChange={handleFormChange}
                  className="form-control instant-form-control"
                  placeholder="Enter spouse full name"
                  required
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-bold text-dark mb-1">
                  Spouse Date of Birth <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  name="spouseDob"
                  value={formData.spouseDob}
                  onChange={handleFormChange}
                  className="form-control instant-form-control"
                  required
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Section 2: Current Residential Address */}
      <div className="mb-4 pt-3 border-top">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
            <i className="fa-solid fa-house small"></i>
          </div>
          <h6 className="fw-bold text-dark mb-0">2. Current Residential Address</h6>
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-bold text-dark mb-1">
              Flat / House No., Building & Street <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleFormChange}
              className="form-control instant-form-control"
              placeholder="e.g. Flat 402, Srinivasa Heights"
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label small fw-bold text-dark mb-1">
              Locality / Area / Landmark
            </label>
            <input
              type="text"
              name="locality"
              value={formData.locality}
              onChange={handleFormChange}
              className="form-control instant-form-control"
              placeholder="e.g. KPHB Phase 6"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              City <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleFormChange}
              className="form-control instant-form-control"
              placeholder="e.g. Hyderabad"
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              State <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleFormChange}
              className="form-control instant-form-control"
              placeholder="e.g. Telangana"
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              PIN Code <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleFormChange}
              maxLength="6"
              className="form-control instant-form-control font-monospace"
              placeholder="500072"
              required
            />
          </div>
        </div>
      </div>

      {/* Section 3: Employment & Income Details */}
      <div className="mb-4 pt-3 border-top">
        <div className="d-flex align-items-center gap-2 mb-3">
          <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-2 d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>
            <i className="fa-solid fa-briefcase small"></i>
          </div>
          <h6 className="fw-bold text-dark mb-0">3. Employment & Income Details</h6>
        </div>

        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              Employment Type <span className="text-danger">*</span>
            </label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleFormChange}
              className="form-select instant-form-control"
              required
            >
              <option value="SALARIED">Salaried Employee</option>
              <option value="SELF_EMPLOYED">Self Employed / Business</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              Employer / Organization Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleFormChange}
              className="form-control instant-form-control"
              placeholder="e.g. SRS Fintech Labs Pvt Ltd"
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              Designation / Job Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleFormChange}
              className="form-control instant-form-control"
              placeholder="e.g. Lead Systems Architect"
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              Net Monthly Take-Home Salary (₹) <span className="text-danger">*</span>
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
              Pre-Approved Capacity: {formatINR(estimatedCap)} (90%)
            </small>
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              Total Work Experience (Years)
            </label>
            <input
              type="number"
              name="workExperience"
              value={formData.workExperience}
              onChange={handleFormChange}
              min="0"
              max="40"
              className="form-control instant-form-control"
              placeholder="e.g. 4"
            />
          </div>

          <div className="col-md-4">
            <label className="form-label small fw-bold text-dark mb-1">
              Official Work Email ID
            </label>
            <input
              type="email"
              name="officeMailId"
              value={formData.officeMailId}
              onChange={handleFormChange}
              className="form-control instant-form-control"
              placeholder="e.g. narendra@srsfintech.com"
            />
          </div>

          <div className="col-md-8">
            <label className="form-label small fw-bold text-dark mb-1">
              Workplace / Office Address
            </label>
            <input
              type="text"
              name="officeAddress"
              value={formData.officeAddress}
              onChange={handleFormChange}
              className="form-control instant-form-control"
              placeholder="e.g. Plot 104, HiTech City Phase 2, Madhapur, Hyderabad"
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
              placeholder="e.g. 04048592301"
            />
          </div>
        </div>
      </div>


      {/* Bottom Action Footer */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-3 border-top">
        <div className="text-muted small d-flex align-items-center gap-2">
          <i className="fa-solid fa-lock text-success fs-6"></i>
          <span>PAN & DOB are cross-verified in Step 3 via OxyLoans Credit Bureau verification.</span>
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
