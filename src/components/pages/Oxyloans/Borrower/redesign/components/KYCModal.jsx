import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import "./KYCModal.css";

// Document Metadata Dictionary
const DOC_META = {
  pan: { label: "PAN Card Document", icon: "fa-id-card", hasPassword: false },
  PanCard: { label: "PAN Card Document", icon: "fa-id-card", hasPassword: false },
  AADHAR: {
    label: "Registered Aadhaar Card",
    icon: "fa-address-card",
    hasPassword: true,
    pwdHint: "First 4 letters of name in CAPITAL + birth year (e.g. SAIV1995)",
  },
  aadhar: {
    label: "Registered Aadhaar Card",
    icon: "fa-address-card",
    hasPassword: true,
    pwdHint: "First 4 letters of name in CAPITAL + birth year (e.g. SAIV1995)",
  },
  BANKSTATEMENT: {
    label: "6-Month Bank Statement",
    icon: "fa-building-columns",
    hasPassword: true,
    pwdHint: "Netbanking password or registered mobile / account number",
  },
  bankStatement: {
    label: "6-Month Bank Statement",
    icon: "fa-building-columns",
    hasPassword: true,
    pwdHint: "Netbanking password or registered mobile / account number",
  },
  CREDITREPORT: {
    label: "Credit Bureau Report",
    icon: "fa-chart-pie",
    hasPassword: true,
    pwdHint: "Decryption password if file is protected",
  },
  creditReport: {
    label: "Credit Bureau Report",
    icon: "fa-chart-pie",
    hasPassword: true,
    pwdHint: "Decryption password if file is protected",
  },
  CHEQUELEAF: { label: "Cancelled Cheque Leaf", icon: "fa-money-check", hasPassword: false },
  PASSPORT: { label: "Official Passport Page", icon: "fa-passport", hasPassword: false },
  Passport: { label: "Official Passport Page", icon: "fa-passport", hasPassword: false },
  DRIVINGLICENCE: { label: "Driving Licence Scan", icon: "fa-id-badge", hasPassword: false },
  VOTERID: { label: "Voter Identity Card", icon: "fa-check-to-slot", hasPassword: false },
  PAYSLIPS: {
    label: "Latest 6-Month Payslips",
    icon: "fa-file-invoice-dollar",
    hasPassword: true,
    pwdHint: "Company salary slip password (e.g., Employee ID or DOB)",
  },
  paySlips: {
    label: "Latest 6-Month Payslips",
    icon: "fa-file-invoice-dollar",
    hasPassword: true,
    pwdHint: "Company salary slip password (e.g., Employee ID or DOB)",
  },
  INTERMEDIATE: { label: "Intermediate Marksheet", icon: "fa-graduation-cap", hasPassword: false },
  intermediate: { label: "Intermediate Marksheet", icon: "fa-graduation-cap", hasPassword: false },
  TENTH: { label: "10th Grade Marksheet", icon: "fa-certificate", hasPassword: false },
  tenth: { label: "10th Grade Marksheet", icon: "fa-certificate", hasPassword: false },
  GRADUATION: { label: "Graduation Marksheet", icon: "fa-user-graduate", hasPassword: false },
  graduation: { label: "Graduation Marksheet", icon: "fa-user-graduate", hasPassword: false },
  OFFERLETTER: { label: "Offer Letter", icon: "fa-envelope-open-text", hasPassword: false },
  offerletter: { label: "Offer Letter", icon: "fa-envelope-open-text", hasPassword: false },
  FEERECEIPT: { label: "Fee Receipt", icon: "fa-receipt", hasPassword: false },
  feereceipt: { label: "Fee Receipt", icon: "fa-receipt", hasPassword: false },
};

/**
 * Format bytes to readable size string (KB / MB)
 */
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Determine if a URL or filename points to a PDF document
 */
const isPdfFile = (url = "", name = "") => {
  const combined = `${url} ${name}`.toLowerCase();
  return combined.includes(".pdf") || combined.includes("application/pdf");
};

/**
 * Production-Grade KYC Modal Component
 * Supports rich preview (image/PDF, zoom, rotate, fullscreen, download)
 * and interactive upload (drag-drop, format validation, password handling).
 */
const KYCModal = ({
  isOpen = false,
  onClose,
  mode = "preview", // "preview" | "upload"
  documentType = "",
  fileUrl = "",
  fileName = "",
  title = "",
  status = "",
  onUploadFile,
  isUploading = false,
}) => {
  // Mounting & Visual Animation Transitions
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  // Active Tab: "preview" | "upload"
  const [activeTab, setActiveTab] = useState("preview");

  // Preview States
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(true);
  const [hasPreviewError, setHasPreviewError] = useState(false);

  // Upload States
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePassword, setFilePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef(null);
  const modalContainerRef = useRef(null);

  // Metadata for current document
  const docMeta = useMemo(() => {
    return (
      DOC_META[documentType] || {
        label: title || "KYC Document",
        icon: "fa-file-shield",
        hasPassword: false,
      }
    );
  }, [documentType, title]);

  const displayTitle = title || docMeta.label;
  const isPdf = isPdfFile(fileUrl, fileName);
  const hasExistingDoc = Boolean(fileUrl);

  // Lifecycle for smooth scale and fade animations
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Reset preview controls on open
      setZoom(1);
      setRotation(0);
      setIsFullscreen(false);
      setIsLoadingPreview(Boolean(fileUrl));
      setHasPreviewError(false);
      setSelectedFile(null);
      setFilePassword("");
      setUploadError("");

      // Set active tab based on requested mode and file availability
      if (mode === "upload" || !fileUrl) {
        setActiveTab("upload");
      } else {
        setActiveTab("preview");
      }

      // Safely lock body scroll without clobbering existing modal state
      const wasModalOpen = document.body.classList.contains("modal-open");
      document.body.style.overflow = "hidden";

      // Trigger CSS transition
      const enterTimer = setTimeout(() => {
        setVisible(true);
      }, 15);

      return () => {
        clearTimeout(enterTimer);
        if (!wasModalOpen && !document.body.classList.contains("modal-open")) {
          document.body.style.overflow = "";
        }
      };
    } else {
      setVisible(false);
      if (!document.body.classList.contains("modal-open")) {
        document.body.style.overflow = "";
      }

      const leaveTimer = setTimeout(() => {
        setMounted(false);
      }, 260);

      return () => clearTimeout(leaveTimer);
    }
  }, [isOpen, fileUrl, mode]);

  // Keyboard navigation & Accessibility (ESC to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen]);

  // Clean close handler with animation
  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 200);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.5));
  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleToggleFullscreen = () => setIsFullscreen((prev) => !prev);

  // Download File Action
  const handleDownload = () => {
    if (!fileUrl) return;
    const anchor = document.createElement("a");
    anchor.href = fileUrl;
    anchor.target = "_blank";
    anchor.download = fileName || `${documentType || "kyc_document"}.${isPdf ? "pdf" : "png"}`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  // Open in new tab
  const handleOpenExternal = () => {
    if (fileUrl) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateAndSelectFile = (file) => {
    setUploadError("");
    if (!file) return;

    // Validate size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError("File size exceeds 10MB limit. Please upload a smaller file.");
      return;
    }

    // Validate type
    const validExtensions = ["pdf", "jpg", "jpeg", "png"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!validExtensions.includes(ext)) {
      setUploadError("Invalid file type. Allowed formats: PDF, JPG, JPEG, PNG.");
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  // Trigger file upload to parent
  const handleExecuteUpload = async () => {
    if (!selectedFile) return;

    if (onUploadFile) {
      try {
        await onUploadFile(selectedFile, documentType, filePassword);
        // Reset local selection after upload
        setSelectedFile(null);
        setFilePassword("");
      } catch (err) {
        console.error("Upload failed in KYCModal:", err);
      }
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className={`kyc-modal-backdrop ${visible ? "is-open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="kyc-modal-title"
    >
      <div
        ref={modalContainerRef}
        className={`kyc-modal-container ${isFullscreen ? "is-fullscreen" : ""}`}
        tabIndex={-1}
      >
        {/* 1. Header */}
        <header className="kyc-modal-header">
          <div className="kyc-modal-header-left">
            <div className="kyc-modal-icon-badge">
              <i className={`fa-solid ${docMeta.icon}`}></i>
            </div>
            <div className="kyc-modal-title-group">
              <h2 id="kyc-modal-title" className="kyc-modal-title">
                {displayTitle}
              </h2>
              <div className="kyc-modal-subtitle">
                {fileName ? (
                  <span>{fileName}</span>
                ) : (
                  <span>Secure Document Verification Vault</span>
                )}
                {hasExistingDoc && (
                  <span className="kyc-status-pill">
                    <i className="fa-solid fa-circle-check"></i>
                    {status || "Uploaded"}
                  </span>
                )}
                {!hasExistingDoc && (
                  <span className="kyc-status-pill pending">
                    <i className="fa-solid fa-clock"></i>
                    Pending Upload
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Header Toolbar Controls */}
          <div className="kyc-modal-toolbar">
            {activeTab === "preview" && hasExistingDoc && !hasPreviewError && (
              <>
                {!isPdf && (
                  <>
                    <button
                      type="button"
                      className="kyc-tool-btn"
                      onClick={handleZoomOut}
                      title="Zoom Out (-25%)"
                      disabled={zoom <= 0.5}
                      aria-label="Zoom Out"
                    >
                      <i className="fa-solid fa-magnifying-glass-minus"></i>
                    </button>

                    <span className="kyc-tool-zoom-text" onClick={handleResetZoom} title="Reset Zoom">
                      {Math.round(zoom * 100)}%
                    </span>

                    <button
                      type="button"
                      className="kyc-tool-btn"
                      onClick={handleZoomIn}
                      title="Zoom In (+25%)"
                      disabled={zoom >= 3}
                      aria-label="Zoom In"
                    >
                      <i className="fa-solid fa-magnifying-glass-plus"></i>
                    </button>

                    <button
                      type="button"
                      className="kyc-tool-btn"
                      onClick={handleRotate}
                      title="Rotate 90° Clockwise"
                      aria-label="Rotate"
                    >
                      <i className="fa-solid fa-rotate-right"></i>
                    </button>

                    <div className="kyc-tool-divider" />
                  </>
                )}

                <button
                  type="button"
                  className="kyc-tool-btn"
                  onClick={handleToggleFullscreen}
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
                  aria-label="Toggle Fullscreen"
                >
                  <i className={`fa-solid ${isFullscreen ? "fa-compress" : "fa-expand"}`}></i>
                </button>

                <button
                  type="button"
                  className="kyc-tool-btn"
                  onClick={handleDownload}
                  title="Download File"
                  aria-label="Download Document"
                >
                  <i className="fa-solid fa-download"></i>
                </button>

                <button
                  type="button"
                  className="kyc-tool-btn"
                  onClick={handleOpenExternal}
                  title="Open in New Tab"
                  aria-label="Open in New Window"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square"></i>
                </button>

                <div className="kyc-tool-divider" />
              </>
            )}

            <button
              type="button"
              className="kyc-close-btn"
              onClick={handleClose}
              title="Close (Esc)"
              aria-label="Close Modal"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </header>

        {/* 2. Navigation Tabs (Preview vs Upload) */}
        <nav className="kyc-modal-tabs">
          <button
            type="button"
            className={`kyc-tab-btn ${activeTab === "preview" ? "is-active" : ""}`}
            onClick={() => setActiveTab("preview")}
          >
            <i className="fa-solid fa-eye"></i>
            Document Preview
          </button>
          <button
            type="button"
            className={`kyc-tab-btn ${activeTab === "upload" ? "is-active" : ""}`}
            onClick={() => setActiveTab("upload")}
          >
            <i className="fa-solid fa-cloud-arrow-up"></i>
            {hasExistingDoc ? "Upload / Replace" : "Upload Document"}
          </button>
        </nav>

        {/* 3. Modal Body Content */}
        <main className="kyc-modal-body">
          {/* TAB 1: PREVIEW */}
          {activeTab === "preview" && (
            <div className="kyc-preview-viewport">
              {/* Loading State Skeleton */}
              {isLoadingPreview && (
                <div className="kyc-loading-state">
                  <div className="kyc-spinner-ring"></div>
                  <span className="kyc-loading-text">Loading document preview...</span>
                </div>
              )}

              {/* Error State */}
              {hasPreviewError ? (
                <div className="kyc-error-state">
                  <div className="kyc-error-icon-box">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  </div>
                  <h4 className="kyc-error-title">Preview Unavailable</h4>
                  <p className="kyc-error-desc">
                    The document preview could not be rendered directly. You can download the file
                    or open it in a secure new browser tab.
                  </p>
                  <div className="d-flex gap-2 mt-2">
                    <button type="button" className="kyc-btn-secondary" onClick={handleDownload}>
                      <i className="fa-solid fa-download me-1"></i> Download File
                    </button>
                    <button type="button" className="kyc-btn-primary" onClick={handleOpenExternal}>
                      <i className="fa-solid fa-arrow-up-right-from-square me-1"></i> Open External
                    </button>
                  </div>
                </div>
              ) : hasExistingDoc ? (
                isPdf ? (
                  <iframe
                    src={`${fileUrl}#toolbar=0&navpanes=0`}
                    title={displayTitle}
                    className="kyc-iframe-viewer"
                    onLoad={() => setIsLoadingPreview(false)}
                    onError={() => {
                      setIsLoadingPreview(false);
                      setHasPreviewError(true);
                    }}
                  />
                ) : (
                  <div className="kyc-preview-img-wrap">
                    <img
                      src={fileUrl}
                      alt={displayTitle}
                      className="kyc-preview-img"
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      }}
                      onLoad={() => setIsLoadingPreview(false)}
                      onError={() => {
                        setIsLoadingPreview(false);
                        setHasPreviewError(true);
                      }}
                    />
                  </div>
                )
              ) : (
                /* Empty state when no document is uploaded yet */
                <div className="kyc-error-state">
                  <div
                    className="kyc-error-icon-box"
                    style={{ background: "#f1f5f9", color: "#64748b" }}
                  >
                    <i className="fa-solid fa-folder-open"></i>
                  </div>
                  <h4 className="kyc-error-title">No Document Uploaded Yet</h4>
                  <p className="kyc-error-desc">
                    You haven’t uploaded your {displayTitle} yet. Upload a clear digital copy or PDF
                    to proceed with KYC verification.
                  </p>
                  <button
                    type="button"
                    className="kyc-btn-primary mt-2"
                    onClick={() => setActiveTab("upload")}
                  >
                    <i className="fa-solid fa-cloud-arrow-up me-1"></i> Upload Document Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD / REPLACE */}
          {activeTab === "upload" && (
            <div className="kyc-upload-container">
              {/* Existing file notification card if file already uploaded */}
              {hasExistingDoc && (
                <div className="kyc-current-doc-card">
                  <div className="kyc-current-doc-info">
                    <div className="kyc-current-doc-icon">
                      <i className={`fa-solid ${isPdf ? "fa-file-pdf" : "fa-file-image"}`}></i>
                    </div>
                    <div className="kyc-current-doc-meta">
                      <span className="kyc-current-doc-name">
                        {fileName || `${displayTitle} (Current Active)`}
                      </span>
                      <span className="kyc-current-doc-date">
                        Uploading a new file will automatically replace this document.
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="kyc-btn-secondary"
                    style={{ height: "34px", padding: "0 12px", fontSize: "12px" }}
                    onClick={() => setActiveTab("preview")}
                  >
                    <i className="fa-solid fa-eye me-1"></i> View Current
                  </button>
                </div>
              )}

              {/* Drag and Drop Zone */}
              <div
                className={`kyc-dropzone ${isDragging ? "is-dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: "none" }}
                  onChange={handleFileInputChange}
                  disabled={isUploading}
                />

                <div className="kyc-dropzone-icon">
                  <i className="fa-solid fa-cloud-arrow-up"></i>
                </div>
                <h4 className="kyc-dropzone-title">
                  Choose a file or <span className="link-accent">browse your device</span>
                </h4>
                <p className="kyc-dropzone-sub">
                  Drag and drop your document here to upload directly
                </p>

                <div className="kyc-dropzone-badges">
                  <span className="kyc-format-tag">PDF</span>
                  <span className="kyc-format-tag">PNG</span>
                  <span className="kyc-format-tag">JPG / JPEG</span>
                  <span className="kyc-format-tag">Max: 10MB</span>
                </div>
              </div>

              {/* Selected File Chip */}
              {selectedFile && (
                <div className="kyc-selected-file-chip">
                  <div className="kyc-file-info-group">
                    <i className="fa-solid fa-circle-check kyc-file-chip-icon"></i>
                    <div>
                      <div className="kyc-file-chip-name">{selectedFile.name}</div>
                      <div className="kyc-file-chip-size">{formatFileSize(selectedFile.size)}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="kyc-remove-file-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    title="Remove selected file"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              )}

              {/* Password Protection input if document requires/supports it */}
              {docMeta.hasPassword && (
                <div className="kyc-password-group">
                  <label className="kyc-label">
                    <i className="fa-solid fa-lock text-muted"></i>
                    File Password (Optional / If Protected)
                  </label>
                  <div className="kyc-input-shell">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="kyc-input-native"
                      placeholder="Enter decryption password"
                      value={filePassword}
                      onChange={(e) => setFilePassword(e.target.value)}
                      disabled={isUploading}
                    />
                    <button
                      type="button"
                      className="kyc-input-toggle-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                    </button>
                  </div>
                  {docMeta.pwdHint && (
                    <span className="kyc-input-hint">
                      <i className="fa-solid fa-circle-info me-1 text-primary"></i>
                      {docMeta.pwdHint}
                    </span>
                  )}
                </div>
              )}

              {/* Validation / Error Notice */}
              {uploadError && (
                <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-0 rounded-3">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          )}
        </main>

        {/* 4. Footer */}
        <footer className="kyc-modal-footer">
          <button type="button" className="kyc-btn-secondary" onClick={handleClose}>
            Close
          </button>

          {activeTab === "upload" ? (
            <button
              type="button"
              className="kyc-btn-primary"
              disabled={!selectedFile || isUploading}
              onClick={handleExecuteUpload}
            >
              {isUploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" />
                  Uploading Document...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-cloud-arrow-up me-1"></i>
                  Upload {selectedFile ? "Selected File" : "Document"}
                </>
              )}
            </button>
          ) : (
            <div className="d-flex align-items-center gap-2">
              {hasExistingDoc && (
                <button type="button" className="kyc-btn-primary" onClick={handleDownload}>
                  <i className="fa-solid fa-download me-1"></i> Download
                </button>
              )}
            </div>
          )}
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default KYCModal;
