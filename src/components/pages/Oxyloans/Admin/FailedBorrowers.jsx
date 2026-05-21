import React, { useState, useEffect, useMemo } from "react";
import Header from "../../../Header/OxyloansAdminHeader";
import {
  getPendingBorrowerList,
  updateBorrowerComment,
} from "../../../HttpRequest/admin";
import Footer from "../../../Footer/Footer";
import OxyloansAdminSidebar from "../../../SideBar/OxyloansAdminSidebar";
import Swal from "sweetalert2";

const defaultNames = ["Swathi", "Aruna", "Hema", "Jyothi"];
const PAGE_SIZE = 50;
const DISPLAY_SIZE = 30;

const CALLING_STATUS_OPTIONS = [
  "Reachable",
  "Not Reachable",
  "Invalid Number",
  "Call Not Answered",
  "Switched Off",
  "Network Connectivity Issue",
  "Line Busy",
  "Out of Network Coverage",
  "Call Not Connected",
  "Call Back Later",
  "Call Rejected",
  "Other",
];

const FailedBorrowers = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [selectedName, setSelectedName] = useState("Swathi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [apiPage, setApiPage] = useState(1);
  const [displayPage, setDisplayPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [activeTab, setActiveTab] = useState("all");

  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [otherComment, setOtherComment] = useState("");
  const [commentError, setCommentError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedDocumentsBorrower, setSelectedDocumentsBorrower] =
    useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const isValidComment = (value) => {
    if (value === null || value === undefined) return false;
    const text = String(value).trim();
    return text !== "" && text.toLowerCase() !== "null";
  };

  const getDocumentUrl = (doc) => {
    const values = Object.values(doc || {});
    return values.find(
      (value) => typeof value === "string" && value.startsWith("http"),
    );
  };

  const fetchBorrowers = async (name, pageNo = 1, resetDisplay = true) => {
    setLoading(true);
    setError(null);

    if (resetDisplay) setDisplayPage(1);

    try {
      const response = await getPendingBorrowerList(pageNo, PAGE_SIZE, name);
      const data = response?.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.content)
            ? data.content
            : Array.isArray(data?.borrowers)
              ? data.borrowers
              : [];

      setBorrowers(list);
      setHasNextPage(list.length === PAGE_SIZE);
    } catch (err) {
      setError("Failed to fetch borrowers");
      setBorrowers([]);
      setHasNextPage(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowers(selectedName, apiPage);
  }, [selectedName, apiPage]);

  const handleNameChange = (name) => {
    setSelectedName(name);
    setSearchTerm("");
    setActiveTab("all");
    setApiPage(1);
    setDisplayPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    setDisplayPage(1);
  };

  const handleCommentClick = (borrower) => {
    setSelectedBorrower(borrower);

    const existing = isValidComment(borrower.comments)
      ? String(borrower.comments).trim()
      : "";

    const isOther =
      existing && !CALLING_STATUS_OPTIONS.slice(0, -1).includes(existing);

    setComment(isOther ? "Other" : existing);
    setOtherComment(isOther ? existing : "");
    setCommentError(null);
    setShowCommentModal(true);
  };

  const closeCommentModal = () => {
    setShowCommentModal(false);
    setComment("");
    setOtherComment("");
    setCommentError(null);
    setSelectedBorrower(null);
  };

  const handleDocumentsClick = (borrower) => {
    setSelectedDocumentsBorrower(borrower);
  };

  const closeDocumentsView = () => {
    setSelectedDocumentsBorrower(null);
  };

  const handleSaveComment = async () => {
    if (!selectedBorrower) return;

    const finalComment =
      comment === "Other" ? otherComment.trim() : comment.trim();

    if (!finalComment) {
      setCommentError(
        comment === "Other"
          ? "Please enter a comment."
          : "Please select calling status.",
      );
      return;
    }

    setSavingComment(true);
    setCommentError(null);

    try {
      await updateBorrowerComment(selectedBorrower.id, finalComment);

      setBorrowers((prev) =>
        prev.map((item) =>
          item.id === selectedBorrower.id
            ? { ...item, comments: finalComment }
            : item,
        ),
      );

      closeCommentModal();
      Swal.fire({
        title: "Success!",
        text: "Comment updated successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      setCommentError("Failed to save comment. Please try again.");
    } finally {
      setSavingComment(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setDisplayPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setDisplayPage(1);
  };

  const pendingBorrowers = useMemo(
    () => borrowers.filter((b) => !isValidComment(b.comments)),
    [borrowers],
  );

  const allBorrowers = useMemo(() => borrowers, [borrowers]);

  const updatedBorrowers = useMemo(
    () => borrowers.filter((b) => isValidComment(b.comments)),
    [borrowers],
  );

  const tabBorrowers =
    activeTab === "all"
      ? allBorrowers
      : activeTab === "updated"
        ? updatedBorrowers
        : pendingBorrowers;

  const filteredBorrowers = searchTerm.trim()
    ? tabBorrowers.filter(
        (b) =>
          b.borrowerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(b.borrowerId || "").includes(searchTerm) ||
          String(b.phone || "").includes(searchTerm),
      )
    : tabBorrowers;

  const safeFixed = (val) =>
    val !== null && val !== undefined && !isNaN(val)
      ? Number(val).toFixed(2)
      : "0.00";

  const totalDisplayPages = Math.max(
    1,
    Math.ceil(filteredBorrowers.length / DISPLAY_SIZE),
  );

  const displayStart = (displayPage - 1) * DISPLAY_SIZE;
  const displayedBorrowers = filteredBorrowers.slice(
    displayStart,
    displayStart + DISPLAY_SIZE,
  );

  const startRecord = filteredBorrowers.length === 0 ? 0 : displayStart + 1;

  const endRecord = Math.min(
    displayStart + DISPLAY_SIZE,
    filteredBorrowers.length,
  );

  const pageNumbers = Array.from({ length: totalDisplayPages }, (_, i) => i + 1)
    .filter(
      (p) =>
        p === 1 || p === totalDisplayPages || Math.abs(p - displayPage) <= 1,
    )
    .reduce((acc, p, i, arr) => {
      if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  const handleApiPrevious = () => {
    if (apiPage > 1) {
      setApiPage((p) => p - 1);
      setDisplayPage(1);
    }
  };

  const handleApiNext = () => {
    setApiPage((p) => p + 1);
    setDisplayPage(1);
  };

  return (
    <div className="main-wrapper">
      <Header />
      <OxyloansAdminSidebar />

      <div className="page-wrapper">
        <div className="content">
           {!selectedDocumentsBorrower && (
            <>
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col-6">
                <h3 className="page-title mb-0">Pending Borrowers</h3>
              </div>

              <div className="col-6">
                <div className="d-flex flex-column align-items-end">
                  <label
                    className="mb-1"
                    style={{ fontWeight: "600", fontSize: "13px" }}
                  >
                    Select Allocator Name
                  </label>

                  <select
                    className="form-control form-control-sm"
                    style={{ maxWidth: "200px" }}
                    value={selectedName}
                    onChange={(e) => handleNameChange(e.target.value)}
                  >
                    {defaultNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <div className="card-body px-0 py-2">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center gap-3">
                <div className="d-flex flex-column flex-sm-row gap-2 flex-wrap">
                  <button
                    className={`btn btn-sm px-4 py-2 d-flex align-items-center justify-content-center shadow-md rounded-md fw-semibold ${
                      activeTab === "all"
                        ? "text-dark border-0"
                        : "btn-light border text-dark"
                    }`}
                    onClick={() => handleTabChange("all")}
                    style={{
                      background:
                        activeTab === "all"
                          ? "linear-gradient(135deg, #f8f9fa, #ffffff)"
                          : "#ffffff",
                      minWidth: "140px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <span className="me-1">ALL</span>
                    <span
                      className="badge rounded-pill ml-1"
                      style={{
                        background: activeTab === "all" ? "#212529" : "#f1f3f5",
                        color: activeTab === "all" ? "#ffffff" : "#212529",
                        fontSize: "11px",
                        padding: "5px 8px",
                        fontWeight: "600",
                      }}
                    >
                      {borrowers.length}
                    </span>
                  </button>

                  <button
                    className={`btn btn-sm px-4 py-2 d-flex align-items-center justify-content-center shadow-md rounded-md fw-semibold transition-all ${
                      activeTab === "updated"
                        ? "text-white border-0"
                        : "btn-light border text-success"
                    }`}
                    onClick={() => handleTabChange("updated")}
                    style={{
                      background:
                        activeTab === "updated"
                          ? "linear-gradient(135deg, #198754, #157347)"
                          : "#fff",
                      minWidth: "190px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <span className="me-1">Comments Updated</span>
                    <span
                      className="badge rounded-pill ml-2"
                      style={{
                        background:
                          activeTab === "updated" ? "#ffffff" : "#198754",
                        color: activeTab === "updated" ? "#198754" : "#ffffff",
                        fontSize: "11px",
                        padding: "5px 8px",
                      }}
                    >
                      {updatedBorrowers.length}
                    </span>
                  </button>

                  <button
                    className={`btn btn-sm px-4 py-2 d-flex align-items-center justify-content-center shadow-md rounded-md fw-semibold transition-all ${
                      activeTab === "pending"
                        ? "text-white border-0"
                        : "btn-light border text-primary"
                    }`}
                    onClick={() => handleTabChange("pending")}
                    style={{
                      background:
                        activeTab === "pending"
                          ? "linear-gradient(135deg, #0d6efd, #0b5ed7)"
                          : "#fff",
                      minWidth: "190px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <span className="me-1">Comments Pending</span>
                    <span
                      className="badge rounded-pill ml-2"
                      style={{
                        background:
                          activeTab === "pending" ? "#ffffff" : "#0d6efd",
                        color: activeTab === "pending" ? "#0d6efd" : "#ffffff",
                        fontSize: "11px",
                        padding: "5px 8px",
                      }}
                    >
                      {pendingBorrowers.length}
                    </span>
                  </button>
                </div>

                <div className="d-flex align-items-center justify-content-center justify-content-md-end gap-2 flex-wrap">
                  <button
                    className="btn btn-sm btn-outline-secondary px-3 py-2"
                    disabled={apiPage === 1 || loading}
                    onClick={handleApiPrevious}
                  >
                    <i className="fa-solid fa-angle-left me-1"></i>
                    Previous
                  </button>

                  <div
                    className="px-3 py-2 rounded-pill border text-dark"
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      minWidth: "90px",
                      textAlign: "center",
                    }}
                  >
                    Page {apiPage}
                  </div>

                  <button
                    className="btn btn-sm btn-outline-primary px-3 py-2"
                    disabled={loading}
                    onClick={handleApiNext}
                  >
                    Next
                    <i className="fa-solid fa-angle-right ms-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {selectedDocumentsBorrower ? (
            <div className="card shadow-sm border-0 animate__animated animate__fadeIn">
              <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <button
                    className="btn btn-sm btn-outline-secondary rounded-pill"
                    onClick={closeDocumentsView}
                    title="Back to List"
                  >
                    <i className="fa-solid fa-arrow-left me-1"></i> Back
                  </button>
                  <h4 className="mb-0 fw-bold text-primary">
                    Borrower Documents
                  </h4>
                </div>
                <div className="text-end">
                  <span className="badge badge-info py-2 px-3">
                    {selectedDocumentsBorrower.borrowerName} (
                    {selectedDocumentsBorrower.borrowerId})
                  </span>
                </div>
              </div>

              <div className="card-body bg-light-50">
                <div className="row g-4">
                  <div className="col-12">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <div
                        className="bg-primary rounded"
                        style={{ width: "4px", height: "24px" }}
                      ></div>
                      <h5 className="mb-0 fw-bold">All Uploaded Documents</h5>
                    </div>

                    <div className="row g-3">
                      {selectedDocumentsBorrower.list &&
                      selectedDocumentsBorrower.list.length > 0 ? (
                        selectedDocumentsBorrower.list.map((doc, idx) => {
                          const url = getDocumentUrl(doc);
                          const fileName = url
                            ? url.split("/").pop()
                            : "Not Uploaded";

                          return (
                            <div className="col-md-6 col-lg-4" key={idx}>
                              <div className="card h-100 border-0 shadow-sm hover-shadow-md transition-all">
                                <div className="card-body p-3">
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h6 className="fw-bold mb-0 text-uppercase">
                                      {String(
                                        doc.documentType || "Document",
                                      ).replace(/_/g, " ")}
                                    </h6>
                                    <span
                                      className={`badge ${
                                        url
                                          ? "badge-soft-success"
                                          : "badge-soft-secondary"
                                      } small`}
                                      style={{
                                        backgroundColor: url
                                          ? "#e6fffa"
                                          : "#f8f9fa",
                                        color: url ? "#38b2ac" : "#6c757d",
                                        fontSize: "10px",
                                        padding: "4px 8px",
                                      }}
                                    >
                                      {url ? "UPLOADED" : "PENDING"}
                                    </span>
                                  </div>
                                  
                                  <button
                                    className="btn btn-sm btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                                    disabled={!url}
                                    onClick={() => {
                                      setPreviewUrl(url);
                                      setShowPreviewModal(true);
                                    }}
                                  >
                                    <i className="fa-solid fa-eye"></i>
                                    View Document
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-12">
                          <div className="alert alert-info text-center py-4">
                            <i className="fa-solid fa-folder-open mb-2 d-block fs-3"></i>
                            No documents found for this borrower.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {loading && (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" />
                  <p className="mt-2 text-muted mb-0">Loading borrowers...</p>
                </div>
              )}

              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation"></i> {error}
                </div>
              )}

              {!loading && (
                <div className="card shadow-sm border-0">
                  <div className="card-body p-0">
                    <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-white flex-wrap gap-2">
                      <small className="text-muted">
                        Showing <strong>{startRecord}</strong>–
                        <strong>{endRecord}</strong> of{" "}
                        <strong>{filteredBorrowers.length}</strong>
                      </small>

                      <div
                        className="position-relative"
                        style={{ minWidth: "280px" }}
                      >
                        <i
                          className="fa-solid fa-magnifying-glass"
                          style={{
                            position: "absolute",
                            left: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#aaa",
                            fontSize: "13px",
                            zIndex: 1,
                          }}
                        />

                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Search by Name, ID or Phone..."
                          value={searchTerm}
                          onChange={handleSearchChange}
                          style={{ paddingLeft: "30px", paddingRight: "30px" }}
                        />

                        {searchTerm && (
                          <i
                            className="fa-solid fa-xmark"
                            onClick={handleClearSearch}
                            style={{
                              position: "absolute",
                              right: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              color: "#999",
                              cursor: "pointer",
                              fontSize: "13px",
                            }}
                            title="Clear search"
                          />
                        )}
                      </div>
                    </div>

                    {displayedBorrowers.length > 0 ? (
                      <>
                        <div className="table-responsive">
                          <table className="table table-striped table-hover mb-0">
                            <thead className="thead-dark">
                              <tr>
                                <th>Borrower Info</th>
                                <th>Loan Details</th>
                                <th>Pending Details</th>
                               
                                <th>Comments</th>
                                <th>Action</th>
                              </tr>
                            </thead>

                            <tbody>
                              {displayedBorrowers.map((borrower) => (
                                <tr key={borrower.id}>
                                  <td>
                                    <div style={{ fontSize: "15px" }}>
                                      <div>
                                        <strong>Name:</strong>{" "}
                                        <strong>{borrower.borrowerName}</strong>
                                      </div>
                                      <div>
                                        <strong>ID:</strong> {borrower.borrowerId}
                                      </div>
                                      <div>
                                        <strong>Phone:</strong> {borrower.phone}
                                      </div>
                                      <div>
                                        <strong>Email:</strong>{" "}
                                        {borrower.emailId}
                                      </div>
                                      <div>
                                        <strong>Location:</strong>{" "}
                                        {borrower.location}
                                      </div>
                                    </div>
                                  </td>

                                  <td>
                                    <div style={{ fontSize: "15px" }}>
                                      <div>
                                        <strong>Loan Amt:</strong>{" "}
                                        <strong>
                                          ₹{safeFixed(borrower.loanAmount)}
                                        </strong>
                                      </div>
                                      <div>
                                        <strong>EMI Amt:</strong> ₹
                                        {safeFixed(borrower.emiAmt)}
                                      </div>
                                      <div>
                                        <strong>Tenure:</strong>{" "}
                                        {borrower.tenure} mo
                                      </div>
                                    </div>
                                  </td>

                                  <td>
                                    <div style={{ fontSize: "15px" }}>
                                      <div>
                                        <strong>Amt Pending:</strong> ₹
                                        {safeFixed(borrower.amountPending)}
                                      </div>
                                      <div>
                                        <strong>Penalty:</strong> ₹
                                        {safeFixed(borrower.totalPenalty)}
                                      </div>
                                      <div>
                                        <strong>Total Pending:</strong> ₹
                                        {safeFixed(
                                          borrower.totalAmountPendingWithPenalty,
                                        )}
                                      </div>
                                    </div>
                                  </td>


                                  <td>
                                    <div style={{ fontSize: "15px" }}>
                                      {isValidComment(borrower.comments) ? (
                                        <div className="text-dark">
                                          {borrower.comments}
                                        </div>
                                      ) : (
                                        <div className="text-muted small italic">
                                          No Comments
                                        </div>
                                      )}
                                    </div>
                                  </td>

                                  <td>
                                    <div className="d-flex flex-column gap-2">
                                      <button
                                        className="btn btn-sm btn-info text-white"
                                        onClick={() =>
                                          handleCommentClick(borrower)
                                        }
                                      >
                                        <i className="fa-solid fa-comment me-1"></i>
                                        {isValidComment(borrower.comments)
                                          ? "Edit"
                                          : "Add"}
                                      </button>

                                      <button
                                        className="btn btn-sm btn-primary text-white"
                                        onClick={() =>
                                          handleDocumentsClick(borrower)
                                        }
                                      >
                                        <i className="fa-solid fa-file-lines me-1"></i>
                                        Borrower Documents
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    ) : (
                      <div className="alert alert-warning text-center m-3">
                        No borrowers found.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {showCommentModal && (
            <div
              className="modal fade show"
              style={{
                display: "block",
                backgroundColor: "rgba(0,0,0,0.5)",
              }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      Comments — {selectedBorrower?.borrowerName}
                    </h5>

                    <button
                      type="button"
                      className="close"
                      onClick={closeCommentModal}
                      disabled={savingComment}
                    >
                      <span>&times;</span>
                    </button>
                  </div>

                  <div className="modal-body">
                    <select
                      className={`form-control ${
                        commentError ? "is-invalid" : ""
                      }`}
                      value={comment}
                      onChange={(e) => {
                        setComment(e.target.value);
                        if (commentError) setCommentError(null);
                      }}
                    >
                      <option value="">Select Calling Status</option>
                      {CALLING_STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    {comment === "Other" && (
                      <input
                        className={`form-control ${
                          commentError ? "is-invalid" : ""
                        } mt-3`}
                        type="text"
                        placeholder="Enter your comment..."
                        value={otherComment}
                        onChange={(e) => {
                          setOtherComment(e.target.value);
                          if (commentError) setCommentError(null);
                        }}
                      />
                    )}

                    {commentError && (
                      <div className="invalid-feedback d-block">
                        {commentError}
                      </div>
                    )}
                  </div>

                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={closeCommentModal}
                      disabled={savingComment}
                    >
                      Cancel
                    </button>

                    <button
                      className="btn btn-primary"
                      onClick={handleSaveComment}
                      disabled={savingComment}
                    >
                      {savingComment ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showPreviewModal && (
            <div
              className="modal fade show"
              style={{
                display: "block",
                backgroundColor: "rgba(0,0,0,0.8)",
                zIndex: 1060,
              }}
            >
              <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="modal-content border-0 shadow-lg">
                  <div className="modal-header bg-dark text-white border-0">
                    <h5 className="modal-title text-white fw-bold">
                      <i className="fa-solid fa-file-invoice me-2"></i>
                      Document Preview
                    </h5>
                    <button
                      type="button"
                      className="close text-white border-0 bg-transparent"
                      onClick={() => setShowPreviewModal(false)}
                      style={{ fontSize: "30px", opacity: "0.8" }}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div
                    className="modal-body p-0 bg-secondary"
                    style={{ height: "80vh", overflow: "hidden" }}
                  >
                    {previewUrl ? (
                      previewUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/) ? (
                        <div className="h-100 d-flex align-items-center justify-content-center p-3">
                          <img
                            src={previewUrl}
                            alt="Document Preview"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "contain",
                              borderRadius: "4px",
                            }}
                          />
                        </div>
                      ) : (
                        <iframe
                          src={previewUrl}
                          title="Document Preview"
                          width="100%"
                          height="100%"
                          style={{ border: "none" }}
                        />
                      )
                    ) : (
                      <div className="h-100 d-flex align-items-center justify-content-center text-white">
                        <p>No preview available for this document.</p>
                      </div>
                    )}
                  </div>
                  {/* <div className="modal-footer bg-light border-0">
                    <button
                      className="btn btn-secondary px-4"
                      onClick={() => setShowPreviewModal(false)}
                    >
                      Close
                    </button>
                    <a
                      href={previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary px-4"
                    >
                      <i className="fa-solid fa-download me-2"></i>
                      Download
                    </a>
                  </div> */}
                </div>
              </div>
            </div>
          )}

        </div>

        <Footer />
      </div>
    </div>
  );
};

export default FailedBorrowers;