import React, { useState, useEffect } from "react";
import Header from "../../../Header/OxyloansAdminHeader";
import { getPendingBorrowerList, updateBorrowerComment } from "../../../HttpRequest/admin";
import Footer from "../../../Footer/Footer";
import OxyloansAdminSidebar from "../../../SideBar/OxyloansAdminSidebar";

const defaultNames = ["Swathi", "Aruna", "Hema", "Jyothi"];
const DISPLAY_SIZE = 50;
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
  const [displayPage, setDisplayPage] = useState(1);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState({});
  const [savingComment, setSavingComment] = useState(false);
  const [otherComment, setOtherComment] = useState("");
  const [commentError, setCommentError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBorrowers(selectedName);
  }, [selectedName]);

  const fetchBorrowers = async (name) => {
    setLoading(true);
    setError(null);
    setDisplayPage(1);
    try {
      const response = await getPendingBorrowerList(1, 1000, name);
      const data = response?.data;
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setBorrowers(list);
    } catch (err) {
      setError("Failed to fetch borrowers");
      setBorrowers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (name) => { setSelectedName(name); setSearchTerm(""); };

  const handleCommentClick = (borrower) => {
    setSelectedBorrower(borrower);
    const existing = comments[borrower.id] ?? borrower.comments ?? "";
    const isOther = existing && !CALLING_STATUS_OPTIONS.slice(0, -1).includes(existing);
    setComment(isOther ? "Other" : existing);
    setOtherComment(isOther ? existing : "");
    setCommentError(null);
    setShowCommentModal(true);
  };

  const handleSaveComment = async () => {
    if (!selectedBorrower) return;
    const finalComment = comment === "Other" ? otherComment.trim() : comment.trim();
    if (!finalComment) {
      setCommentError(comment === "Other" ? "Please enter a comment." : "Comment cannot be empty.");
      return;
    }
    setSavingComment(true);
    setCommentError(null);
    try {
      await updateBorrowerComment(selectedBorrower.id, finalComment);
      setComments({ ...comments, [selectedBorrower.id]: finalComment });
      setShowCommentModal(false);
      setComment("");
      setOtherComment("");
      setSelectedBorrower(null);
    } catch (err) {
      setCommentError("Failed to save comment. Please try again.");
    } finally {
      setSavingComment(false);
    }
  };

  const handleSearchChange = (e) => { setSearchTerm(e.target.value); setDisplayPage(1); };
  const handleClearSearch = () => { setSearchTerm(""); setDisplayPage(1); };

  const filteredBorrowers = searchTerm.trim()
    ? borrowers.filter(
        (b) =>
          b.borrowerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(b.borrowerId).includes(searchTerm)
      )
    : borrowers;

  const safeFixed = (val) =>
    val != null && !isNaN(val) ? Number(val).toFixed(2) : "0.00";

  const totalDisplayPages = Math.max(1, Math.ceil(filteredBorrowers.length / DISPLAY_SIZE));
  const displayStart = (displayPage - 1) * DISPLAY_SIZE;
  const displayedBorrowers = filteredBorrowers.slice(displayStart, displayStart + DISPLAY_SIZE);
  const startRecord = filteredBorrowers.length === 0 ? 0 : displayStart + 1;
  const endRecord = Math.min(displayStart + DISPLAY_SIZE, filteredBorrowers.length);

  const pageNumbers = Array.from({ length: totalDisplayPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalDisplayPages || Math.abs(p - displayPage) <= 1)
    .reduce((acc, p, i, arr) => {
      if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="main-wrapper">
      <Header />
      <OxyloansAdminSidebar />
      <div className="page-wrapper">
        <div className="content">
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

          {!loading && borrowers.length > 0 && (
            <div className="card shadow-sm border-0">
              <div className="card-body p-0">
                {/* Top bar */}

                {/* Top bar: search + record info */}
                <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-white flex-wrap gap-2">
                  <small className="text-muted">
                    Showing <strong>{startRecord}</strong>–
                    <strong>{endRecord}</strong> of{" "}
                    <strong>{filteredBorrowers.length}</strong>
                    {searchTerm && (
                      <>
                        {" "}
                        results &nbsp;
                        <span className="badge badge-secondary">
                          {borrowers.length} total
                        </span>
                      </>
                    )}
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
                      placeholder="Search by Borrower Name or ID..."
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
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead className="thead-dark">
                      <tr>
                        {/* <th style={{ width: "45px" }}>#</th> */}
                        <th>Borrower Info</th>
                        <th>Loan Details</th>
                        <th>Pending Details</th>
                        <th>Tenure & Location</th>
                        <th>Comments</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedBorrowers.map((borrower, idx) => (
                        <tr key={borrower.id}>
                          {/* <td>{displayStart + idx + 1}</td> */}
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
                                <strong>Email:</strong> {borrower.emailId}
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
                              <div>
                                <strong>Tenure:</strong> {borrower.tenure} mo
                              </div>
                              <div>
                                <strong>Location:</strong> {borrower.location}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: "15px" }}>
                              {comments[borrower.id] || borrower.comments ? (
                                <span>
                                  {comments[borrower.id] || borrower.comments}
                                </span>
                              ) : (
                                <span className="text-muted">No comments</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-info text-white"
                              onClick={() => handleCommentClick(borrower)}
                              title="Add/View Comments"
                            >
                              <i className="fa-solid fa-comment me-1"></i>
                              {comments[borrower.id] || borrower.comments
                                ? "Edit"
                                : "Add"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer */}
                {totalDisplayPages > 1 && (
                  <div
                    className="d-flex justify-content-between align-items-center px-3 py-3 border-top bg-white flex-wrap gap-2"
                    style={{ minHeight: "64px" }}
                  >
                    <small className="text-muted">
                      Page <strong>{displayPage}</strong> of{" "}
                      <strong>{totalDisplayPages}</strong>
                    </small>
                    <nav>
                      <ul className="pagination pagination-sm mb-0">
                        <li
                          className={`page-item ${displayPage === 1 ? "disabled" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setDisplayPage(1)}
                          >
                            «
                          </button>
                        </li>
                        <li
                          className={`page-item ${displayPage === 1 ? "disabled" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setDisplayPage((p) => p - 1)}
                          >
                            ‹
                          </button>
                        </li>
                        {pageNumbers.map((p, i) =>
                          p === "..." ? (
                            <li key={`e-${i}`} className="page-item disabled">
                              <span className="page-link">…</span>
                            </li>
                          ) : (
                            <li
                              key={p}
                              className={`page-item ${p === displayPage ? "active" : ""}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => setDisplayPage(p)}
                              >
                                {p}
                              </button>
                            </li>
                          ),
                        )}
                        <li
                          className={`page-item ${displayPage === totalDisplayPages ? "disabled" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setDisplayPage((p) => p + 1)}
                          >
                            ›
                          </button>
                        </li>
                        <li
                          className={`page-item ${displayPage === totalDisplayPages ? "disabled" : ""}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setDisplayPage(totalDisplayPages)}
                          >
                            »
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && borrowers.length === 0 && !error && (
            <div className="alert alert-warning text-center">
              <i className="fa-solid fa-circle-info me-2"></i>
              No borrowers found for <strong>{selectedName}</strong>.
            </div>
          )}

          {/* Comments Modal */}
          {showCommentModal && (
            <div
              className="modal fade show"
              style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      <i className="fa-solid fa-comment me-2 text-info"></i>
                      Comments — {selectedBorrower?.borrowerName}
                    </h5>
                    <button
                      type="button"
                      className="close"
                      onClick={() => { setShowCommentModal(false); setOtherComment(""); }}
                    >
                      <span>&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    {selectedBorrower?.comments &&
                      !comments[selectedBorrower.id] && (
                        <div
                          className="alert alert-info py-2 px-3 mb-2"
                          style={{ fontSize: "13px" }}
                        >
                          <span className="text-muted">Existing:</span>{" "}
                          {selectedBorrower.comments}
                        </div>
                      )}
                    <select
                      className={`form-control ${commentError ? "is-invalid" : ""}`}
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
                        className={`form-control ${commentError ? "is-invalid" : ""} mt-3`}
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
                      <div
                        className="invalid-feedback d-block"
                        style={{ fontSize: "13px" }}
                      >
                        <i className="fa-solid fa-circle-exclamation me-1"></i>
                        {commentError}
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => { setShowCommentModal(false); setOtherComment(""); }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveComment}
                      disabled={savingComment}
                    >
                      {savingComment ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-1"
                            role="status"
                          />{" "}
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-floppy-disk me-1"></i> Save
                        </>
                      )}
                    </button>
                  </div>
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
