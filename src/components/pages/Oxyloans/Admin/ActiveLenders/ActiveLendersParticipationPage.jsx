import { useCallback, useEffect, useMemo, useState } from "react";
import "./ActiveLendersParticipationPage.css";
import OxyloansAdminSidebar from "../../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../../Header/OxyloansAdminHeader";

const LIST_API =
  "https://fintech.oxyloans.com/oxyloans/v1/user/activLendersParicipationAmount";

const SEARCH_API = (lenderId) =>
  `https://fintech.oxyloans.com/oxyloans/v1/user/${lenderId}/activLendersParicipationAmountAndCount`;

const REFERRAL_API = (lenderId) =>
  `https://fintech.oxyloans.com/oxyloans/v1/user/${lenderId}/allLenderReferenceDetails`;

function safeText(v) {
  if (v === null || v === undefined || String(v).trim() === "") return "-";
  return String(v);
}

function formatNumber(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "-";
  try {
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
      n
    );
  } catch {
    return String(n);
  }
}

function normalizeLenderId(input) {
  let id = (input || "").trim();
  id = id.replace(/\s+/g, "");
  if (/^[A-Za-z]{2}/.test(id)) id = id.slice(2);
  id = id.replace(/\D/g, "");
  return id;
}

export default function ActiveLendersParticipationPage() {
  const [downloadLink, setDownloadLink] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [lenderIdInput, setLenderIdInput] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Main table per page 20
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Referral modal
  const [isReferModalOpen, setIsReferModalOpen] = useState(false);
  const [referForLenderId, setReferForLenderId] = useState(null);
  const [referForLenderName, setReferForLenderName] = useState("");
  const [refLoading, setRefLoading] = useState(false);
  const [refErr, setRefErr] = useState("");
  const [refData, setRefData] = useState(null);

  // Referral pagination
  const [refPage, setRefPage] = useState(1);
  const refPageSize = 10;

  // Bonus modal (for "View all bonus")
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [bonusModalTitle, setBonusModalTitle] = useState("");
  const [bonusRows, setBonusRows] = useState([]);

  const accessToken = sessionStorage.getItem("accessToken") || "";

  const fetchList = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      if (!accessToken)
        throw new Error("accessToken not found. Please login first.");

      const res = await fetch(LIST_API, {
        method: "GET",
        headers: { accessToken },
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(
          `List API failed (${res.status}): ${t || res.statusText}`
        );
      }

      const json = await res.json();
      setDownloadLink(json?.downloadLink || "");
      setList(Array.isArray(json?.activeUserList) ? json.activeUserList : []);
      setIsSearchMode(false);
      setPage(1);
    } catch (e) {
      setErr(e?.message || "Something went wrong");
      setList([]);
      setDownloadLink("");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const searchByLenderId = async () => {
    const id = normalizeLenderId(lenderIdInput);

    if (!id) {
      setErr("Please enter the Lender ID");
      return;
    }

    setLoading(true);
    setErr("");
    try {
      if (!accessToken)
        throw new Error("accessToken not found. Please login first.");

      const res = await fetch(SEARCH_API(id), {
        method: "GET",
        headers: { accessToken },
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(
          `Search API failed (${res.status}): ${t || res.statusText}`
        );
      }

      const json = await res.json();

      const mapped = {
        lenderId: json?.lenderId,
        lenderName: json?.lenderName,
        totalParticipationAmount: json?.totalParticipationAmount,
        mobileNumber: json?.mobileNumber,
        email: json?.email,
        city: json?.city,
        state: json?.state,
        pincode: json?.pincode,
        address: json?.address,
      };

      setList(mapped?.lenderId ? [mapped] : []);
      setIsSearchMode(true);
      setPage(1);
    } catch (e) {
      setErr(e?.message || "Something went wrong");
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const totalCount = list.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const currentPageData = useMemo(() => {
    if (isSearchMode) return list;
    const start = (page - 1) * pageSize;
    return list.slice(start, start + pageSize);
  }, [list, page, isSearchMode]);

  const goToPage = (p) => setPage(Math.min(Math.max(1, p), totalPages));
  const goPrev = () => goToPage(page - 1);
  const goNext = () => goToPage(page + 1);

  const pageWindow = useMemo(() => {
    const maxButtons = 5;
    if (totalPages <= maxButtons)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    let start = Math.max(1, page - 2);
    let end = start + (maxButtons - 1);

    if (end > totalPages) {
      end = totalPages;
      start = end - (maxButtons - 1);
    }
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [page, totalPages]);

  // Referral data
  const refRows = useMemo(() => {
    return Array.isArray(refData?.listOfLenderReferenceResponseDto)
      ? refData.listOfLenderReferenceResponseDto
      : [];
  }, [refData]);

  const refTotalCount = refData?.count ?? refRows.length ?? 0;
  const refTotalPages = Math.max(1, Math.ceil(refTotalCount / refPageSize));

  const fetchReferralDetails = async (lenderId, pageNo) => {
    setRefLoading(true);
    setRefErr("");
    try {
      if (!accessToken)
        throw new Error("accessToken not found. Please login first.");

      const payload = {
        pageNo,
        pageSize: refPageSize,
        primaryType: "LENDER",
      };

      const res = await fetch(REFERRAL_API(lenderId), {
        method: "POST",
        headers: {
          accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(
          `Referral API failed (${res.status}): ${t || res.statusText}`
        );
      }

      const json = await res.json();
      setRefData(json || null);
    } catch (e) {
      setRefErr(e?.message || "Something went wrong");
      setRefData(null);
    } finally {
      setRefLoading(false);
    }
  };

  const openReferModal = async (lender) => {
    setIsReferModalOpen(true);
    setReferForLenderId(lender.lenderId);
    setReferForLenderName(lender.lenderName || "");
    setRefPage(1);
    setRefData(null);
    setRefErr("");
    await fetchReferralDetails(lender.lenderId, 1);
  };

  const closeReferModal = () => {
    setIsReferModalOpen(false);
    setReferForLenderId(null);
    setReferForLenderName("");
    setRefData(null);
    setRefErr("");
    setRefPage(1);
  };

  const refGoToPage = async (p) => {
    if (!referForLenderId) return;
    const next = Math.min(Math.max(1, p), refTotalPages);
    setRefPage(next);
    await fetchReferralDetails(referForLenderId, next);
  };

  const refPageWindow = useMemo(() => {
    const maxButtons = 5;
    if (refTotalPages <= maxButtons)
      return Array.from({ length: refTotalPages }, (_, i) => i + 1);

    let start = Math.max(1, refPage - 2);
    let end = start + (maxButtons - 1);

    if (end > refTotalPages) {
      end = refTotalPages;
      start = end - (maxButtons - 1);
    }
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [refPage, refTotalPages]);

  const openBonusModal = (ref) => {
    const rows = Array.isArray(ref.lenderReferenceAmountResponse)
      ? ref.lenderReferenceAmountResponse
      : [];
    setBonusRows(rows);
    setBonusModalTitle(
      `${safeText(ref.refereeName)} (${safeText(ref.refereeNewId)})`
    );
    setIsBonusModalOpen(true);
  };

  const closeBonusModal = () => {
    setIsBonusModalOpen(false);
    setBonusModalTitle("");
    setBonusRows([]);
  };

  return (
    <div className="main-wrapper">
      <OxyloansAdminSidebar />
      <OxyloansAdminHeader />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="active-lenders-container">
            <div className="content-wrapper">
              <h1 className="page-title">
                Active lenders
              </h1>
            </div>

            {/* Top Controls */}
            <div className="controls-section">
              <div className="controls-row">
                <div className="search-input-wrapper">
                  <input
                    value={lenderIdInput}
                    onChange={(e) => setLenderIdInput(e.target.value)}
                    placeholder="Enter the lender id"
                    className="search-input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") searchByLenderId();
                    }}
                  />
                </div>

                <button
                  onClick={searchByLenderId}
                  className="btn-search"
                >
                  Search
                </button>

                <button
                  onClick={() => {
                    setLenderIdInput("");
                    fetchList();
                  }}
                  className="btn-reset"
                >
                  Reset
                </button>

                <div className="download-wrapper">
                  {downloadLink ? (
                    <a
                      href={downloadLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-download"
                    >
                      Download Excel
                    </a>
                  ) : null}
                </div>
              </div>

              {err ? (
                <div className="error-message">
                  <div style={{ fontWeight: 600 }}>Error</div>
                  <div style={{ marginTop: "0.25rem" }}>{err}</div>
                </div>
              ) : null}
            </div>

            {/* Lenders info card */}
            <div className="main-card-section">
              <div className="card">
                <div className="card-header">
                  <div className="card-title">
                    Lenders info
                  </div>

                  {!isSearchMode && (
                    <div className="pagination-wrapper">
                      <button
                        onClick={() => goToPage(1)}
                        disabled={page <= 1}
                        className="btn-page"
                        title="First"
                      >
                        «
                      </button>
                      <button
                        onClick={goPrev}
                        disabled={page <= 1}
                        className="btn-page"
                        title="Prev"
                      >
                        ←
                      </button>

                      {pageWindow.map((p) => (
                        <button
                          key={p}
                          onClick={() => goToPage(p)}
                          className={`btn-page ${p === page ? "active" : ""
                            }`}
                        >
                          {p}
                        </button>
                      ))}

                      <button
                        onClick={goNext}
                        disabled={page >= totalPages}
                        className="btn-page"
                        title="Next"
                      >
                        →
                      </button>
                      <button
                        onClick={() => goToPage(totalPages)}
                        disabled={page >= totalPages}
                        className="btn-page"
                        title="Last"
                      >
                        »
                      </button>
                    </div>
                  )}
                </div>

                <div className="table-responsive">
                  <table className="data-table w-100">
                    <thead>
                      <tr>
                        <th>Lender ID</th>
                        <th>Name</th>
                        <th>Address Info</th>
                        <th>Total Participation Amount</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#475569" }}>
                            Loading...
                          </td>
                        </tr>
                      ) : currentPageData.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#475569" }}>
                            No records found.
                          </td>
                        </tr>
                      ) : (
                        currentPageData.map((x) => (
                          <tr key={x.lenderId} style={{ verticalAlign: "top" }}>
                            <td>
                              <div className="lender-id-text">
                                LR{safeText(x.lenderId)}
                              </div>
                            </td>

                            <td>
                              <div className="info-cell">
                                <div className="info-row">
                                  <span className="label-bold">Name:</span>{" "}
                                  <span className="val-medium">
                                    {safeText(x.lenderName)}
                                  </span>
                                </div>
                                <div className="info-row">
                                  <span className="label-bold">Email:</span>{" "}
                                  <span className="val-medium">
                                    {safeText(x.email)}
                                  </span>
                                </div>
                                <div className="info-row">
                                  <span className="label-bold">Mobile:</span>{" "}
                                  <span className="val-medium">
                                    {safeText(x.mobileNumber)}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="text-wrap w-100">
                              <div className="info-cell">
                                <div className="info-row">
                                  <span className="label-bold">Address:</span>{" "}
                                  <span className="val-medium">
                                    {safeText(x.address || x.city)}
                                  </span>
                                </div>
                                <div className="info-row">
                                  <span className="label-bold">City:</span>{" "}
                                  <span className="val-medium">
                                    {safeText(x.city)}
                                  </span>
                                </div>
                                <div className="info-row">
                                  <span className="label-bold">State:</span>{" "}
                                  <span className="val-medium">
                                    {safeText(x.state)}
                                  </span>
                                </div>
                                <div className="info-row">
                                  <span className="label-bold">Pincode:</span>{" "}
                                  <span className="val-medium">
                                    {safeText(x.pincode)}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className="amount-text">
                                {formatNumber(x.totalParticipationAmount)}
                              </div>
                            </td>

                            <td>
                              <button
                                onClick={() => openReferModal(x)}
                                className="btn-refer"
                              >
                                Network
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="card-footer">
                  {isSearchMode ? (
                    <>
                      Search result count:{" "}
                      <span style={{ fontWeight: 600, color: "#1e293b" }}>
                        {totalCount}
                      </span>
                    </>
                  ) : (
                    <>
                      Showing{" "}
                      <span style={{ fontWeight: 600, color: "#1e293b" }}>
                        {totalCount === 0 ? 0 : (page - 1) * pageSize + 1}
                      </span>{" "}
                      to{" "}
                      <span style={{ fontWeight: 600, color: "#1e293b" }}>
                        {Math.min(page * pageSize, totalCount)}
                      </span>{" "}
                      of{" "}
                      <span style={{ fontWeight: 600, color: "#1e293b" }}>
                        {totalCount}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* -------------------- Referral Modal -------------------- */}
            {isReferModalOpen && (
              <div
                className="modal-overlay"
                onClick={(e) => {
                  if (e.target === e.currentTarget) closeReferModal();
                }}
              >
                <div className="modal-content-wrapper">
                  {/* Header */}
                  <div className="modal-header">
                    <div>
                      <div className="modal-title">
                        Referral Details
                      </div>
                      <div className="modal-subtitle">
                        Lender:{" "}
                        <span style={{ fontWeight: 600, color: "#1e293b" }}>
                          {safeText(referForLenderName)}
                        </span>
                      </div>

                      <div style={{ marginTop: "0.5rem", fontSize: "0.75rem" }}>
                        <span className="badge-info">
                          Total:{" "}
                          <span style={{ fontWeight: 600 }}>
                            {safeText(refData?.count ?? "-")}
                          </span>
                        </span>
                        <span className="badge-info">
                          Earned:{" "}
                          <span style={{ fontWeight: 600 }}>
                            {refData?.sumOfEarnedAmount !== null &&
                              refData?.sumOfEarnedAmount !== undefined
                              ? Number(refData.sumOfEarnedAmount).toFixed(2)
                              : "-"}
                          </span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={closeReferModal}
                      className="btn-close-modal"
                      style={{ width: "auto" }}
                    >
                      Close
                    </button>
                  </div>

                  {/* Body */}
                  <div className="modal-body">
                    {refErr ? (
                      <div className="error-message" style={{ marginBottom: "1rem", marginTop: 0 }}>
                        <div style={{ fontWeight: 600 }}>Error</div>
                        <div style={{ marginTop: "0.25rem" }}>{refErr}</div>
                      </div>
                    ) : null}

                    {/* Pagination */}
                    <div className="ref-pagination">
                      <div style={{ fontSize: "0.75rem", color: "#475569" }}>
                        Page{" "}
                        <span style={{ fontWeight: 600, color: "#1e293b" }}>
                          {refPage}
                        </span>{" "}
                        /{" "}
                        <span style={{ fontWeight: 600, color: "#1e293b" }}>
                          {refTotalPages}
                        </span>
                      </div>

                      <div className="pagination-wrapper">
                        <button
                          onClick={() => refGoToPage(1)}
                          disabled={refPage <= 1 || refLoading}
                          className="btn-page"
                          title="First"
                        >
                          «
                        </button>
                        <button
                          onClick={() => refGoToPage(refPage - 1)}
                          disabled={refPage <= 1 || refLoading}
                          className="btn-page"
                          title="Prev"
                        >
                          ←
                        </button>

                        {refPageWindow.map((p) => (
                          <button
                            key={p}
                            onClick={() => refGoToPage(p)}
                            disabled={refLoading}
                            className={`btn-page ${p === refPage ? "active" : ""
                              }`}
                          >
                            {p}
                          </button>
                        ))}

                        <button
                          onClick={() => refGoToPage(refPage + 1)}
                          disabled={refPage >= refTotalPages || refLoading}
                          className="btn-page"
                          title="Next"
                        >
                          →
                        </button>
                        <button
                          onClick={() => refGoToPage(refTotalPages)}
                          disabled={refPage >= refTotalPages || refLoading}
                          className="btn-page"
                          title="Last"
                        >
                          »
                        </button>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="table-responsive" style={{ border: "1px solid #e2e8f0", borderRadius: "0.25rem" }}>
                      <table className="data-table" style={{ minWidth: "980px" }}>
                        <thead>
                          <tr>
                            <th>Referee</th>
                            <th>Contact</th>
                            <th>Status</th>
                            <th>Referred On</th>
                            <th>Total Earned</th>
                            <th>Bonus</th>
                          </tr>
                        </thead>

                        <tbody>
                          {refLoading ? (
                            <tr>
                              <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "#475569" }}>
                                Loading referral details...
                              </td>
                            </tr>
                          ) : refRows.length === 0 ? (
                            <tr>
                              <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "#475569" }}>
                                No referral records found.
                              </td>
                            </tr>
                          ) : (
                            refRows.map((r, idx) => {
                              const bonus = Array.isArray(
                                r.lenderReferenceAmountResponse
                              )
                                ? r.lenderReferenceAmountResponse
                                : [];

                              return (
                                <tr
                                  key={`${r.refereeId ?? "x"}-${idx}`}
                                  style={{ verticalAlign: "top" }}
                                >
                                  <td>
                                    <div className="lender-id-text">
                                      {safeText(r.refereeName)}
                                    </div>
                                    <div style={{ fontSize: "0.75rem", color: "#475569" }}>
                                      {safeText(r.refereeNewId)} |{" "}
                                      {safeText(r.referrerNewId)}
                                    </div>
                                  </td>

                                  <td>
                                    <div className="info-cell">
                                      <div className="info-row">
                                        <span className="label-bold">Email:</span>{" "}
                                        <span className="val-medium">
                                          {safeText(r.refereeEmail)}
                                        </span>
                                      </div>
                                      <div className="info-row">
                                        <span className="label-bold">Mobile:</span>{" "}
                                        <span className="val-medium">
                                          {safeText(r.refereeMobileNumber)}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  <td>
                                    <span className="status-badge">
                                      {safeText(r.status)}
                                    </span>
                                  </td>

                                  <td>
                                    {safeText(r.referredOn)}
                                  </td>

                                  <td>
                                    <span className="amount-text">
                                      {formatNumber(r.totalAmountEarned ?? 0)}
                                    </span>
                                  </td>

                                  <td>
                                    {bonus.length === 0 ? (
                                      <span style={{ color: "#475569" }}>-</span>
                                    ) : (
                                      <div>
                                        {/* Show first 3 directly */}
                                        {bonus.slice(0, 3).map((b, i) => (
                                          <div
                                            key={i}
                                            className="bonus-item"
                                          >
                                            <div className="bonus-row-grid">
                                              <span>
                                                <span className="label-bold">
                                                  Deal:
                                                </span>{" "}
                                                {safeText(b.dealId)}
                                              </span>
                                              <span>
                                                <span className="label-bold">
                                                  On:
                                                </span>{" "}
                                                {safeText(b.participatedOn)}
                                              </span>
                                              <span>
                                                <span className="label-bold">
                                                  Amt:
                                                </span>{" "}
                                                {safeText(b.amount ?? "-")}
                                              </span>
                                              <span>
                                                <span className="label-bold">
                                                  Status:
                                                </span>{" "}
                                                {safeText(b.paymentStatus ?? "-")}
                                              </span>
                                            </div>
                                          </div>
                                        ))}

                                        {/* If more than 3 -> button opens modal */}
                                        {bonus.length > 3 ? (
                                          <button
                                            onClick={() => openBonusModal(r)}
                                            className="btn-view-all-bonus"
                                          >
                                            View all bonus ({bonus.length})
                                          </button>
                                        ) : null}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* -------------------- Bonus Modal -------------------- */}
            {isBonusModalOpen && (
              <div
                className="modal-overlay"
                onClick={(e) => {
                  if (e.target === e.currentTarget) closeBonusModal();
                }}
              >
                <div className="modal-content-wrapper" style={{ maxWidth: "900px", maxHeight: "75vh" }}>
                  <div className="modal-header">
                    <div>
                      <div className="modal-title">
                        All Bonus Rows
                      </div>
                      <div className="modal-subtitle">
                        {bonusModalTitle}
                      </div>
                    </div>

                    <button
                      onClick={closeBonusModal}
                      className="btn-close-modal"
                      style={{ width: "auto" }}
                    >
                      Close
                    </button>
                  </div>

                  <div className="modal-body">
                    <div className="table-responsive" style={{ border: "1px solid #e2e8f0", borderRadius: "0.25rem" }}>
                      <table className="data-table" style={{ minWidth: "760px" }}>
                        <thead>
                          <tr>
                            <th>Deal ID</th>
                            <th>Participated On</th>
                            <th>Participated Amount</th>
                            <th>Bonus Amount</th>
                            <th>Payment Status</th>
                            <th>Transferred On</th>
                          </tr>
                        </thead>

                        <tbody>
                          {bonusRows.length === 0 ? (
                            <tr>
                              <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "#475569" }}>
                                No bonus rows found.
                              </td>
                            </tr>
                          ) : (
                            bonusRows.map((b, i) => (
                              <tr key={i}>
                                <td>{safeText(b.dealId)}</td>
                                <td>{safeText(b.participatedOn)}</td>
                                <td>{formatNumber(b.participatedAmount ?? null)}</td>
                                <td>{safeText(b.amount ?? "-")}</td>
                                <td>{safeText(b.paymentStatus ?? "-")}</td>
                                <td>{safeText(b.transferredOn ?? "-")}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#475569" }}>
                      Total Bonus Rows:{" "}
                      <span style={{ fontWeight: 600 }}>{bonusRows.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* ----------------------------------------------------- */}
          </div>
        </div>
      </div>
    </div>
  );
}
