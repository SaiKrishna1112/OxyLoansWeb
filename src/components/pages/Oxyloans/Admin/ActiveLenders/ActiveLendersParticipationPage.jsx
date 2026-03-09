import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
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

// ---- Status Normalizer (handles case differences safely) ----
function normalizeStatus(s) {
  const v = (s || "").toString().trim().toUpperCase();
  if (!v) return "";
  if (v.includes("REGISTER")) return "REGISTERED";
  if (v.includes("LENT")) return "LENT";
  if (v.includes("INVITE")) return "INVITED";
  return v;
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

  // Status filter inside referral modal
  const [selectedStatus, setSelectedStatus] = useState("TOTAL"); // TOTAL | REGISTERED | LENT | INVITED

  // Deal details pagination (inside modal)
  const [dealPage, setDealPage] = useState(1);
  const dealPageSize = 10;

  // Bonus modal (for "View all bonus" per single referee row)
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [bonusModalTitle, setBonusModalTitle] = useState("");
  const [bonusRows, setBonusRows] = useState([]);

  const accessToken = sessionStorage.getItem("accessToken") || "";

  // ✅ NEW: store per-lender summary counts for Action column
  // shape: { [lenderId]: { loading, error, total, registered, lent, invited, earned } }
  const [summaryByLenderId, setSummaryByLenderId] = useState({});
  const inFlightSummaryRef = useRef(new Set());

  const fetchList = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      if (!accessToken) throw new Error("accessToken not found. Please login first.");

      const res = await fetch(LIST_API, {
        method: "GET",
        headers: { accessToken },
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`List API failed (${res.status}): ${t || res.statusText}`);
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
      if (!accessToken) throw new Error("accessToken not found. Please login first.");

      const res = await fetch(SEARCH_API(id), {
        method: "GET",
        headers: { accessToken },
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Search API failed (${res.status}): ${t || res.statusText}`);
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

  // Referral rows
  const refRows = useMemo(() => {
    return Array.isArray(refData?.listOfLenderReferenceResponseDto)
      ? refData.listOfLenderReferenceResponseDto
      : [];
  }, [refData]);

  const refTotalCount = refData?.count ?? refRows.length ?? 0;
  const refTotalPages = Math.max(1, Math.ceil(refTotalCount / refPageSize));

  // ---- Status summary counts (REGISTERED, LENT, INVITED) ----
  const statusSummary = useMemo(() => {
    let registered = 0;
    let lent = 0;
    let invited = 0;

    for (const r of refRows) {
      const st = normalizeStatus(r?.status);
      if (st === "REGISTERED") registered += 1;
      else if (st === "LENT") lent += 1;
      else if (st === "INVITED") invited += 1;
    }

    const total = registered + lent + invited;
    return { total, registered, lent, invited };
  }, [refRows]);

  // ✅ Use ALL-time totals (not paginated page totals) for modal boxes
  const modalSummary = useMemo(() => {
    const sid = referForLenderId;
    if (sid && summaryByLenderId && summaryByLenderId[sid]) {
      const s = summaryByLenderId[sid];
      const total = s?.total ?? null;
      const registered = s?.registered ?? null;
      const lent = s?.lent ?? null;
      const invited = s?.invited ?? null;
      return {
        total: total === null ? statusSummary.total : total,
        registered: registered === null ? statusSummary.registered : registered,
        lent: lent === null ? statusSummary.lent : lent,
        invited: invited === null ? statusSummary.invited : invited,
        loading: !!s?.loading,
      };
    }
    return { ...statusSummary, loading: false };
  }, [referForLenderId, summaryByLenderId, statusSummary]);

  // ---- Filtered referral rows based on selected status ----
  const filteredRefRows = useMemo(() => {
    if (selectedStatus === "TOTAL") {
      return refRows.filter((r) => {
        const st = normalizeStatus(r?.status);
        return st === "REGISTERED" || st === "LENT" || st === "INVITED";
      });
    }
    return refRows.filter((r) => normalizeStatus(r?.status) === selectedStatus);
  }, [refRows, selectedStatus]);

  // ---- Flatten deals for the selected status (Deals + Earnings) ----
  const filteredDeals = useMemo(() => {
    const out = [];
    for (const r of filteredRefRows) {
      const bonus = Array.isArray(r?.lenderReferenceAmountResponse)
        ? r.lenderReferenceAmountResponse
        : [];

      for (const b of bonus) {
        out.push({
          refereeName: r?.refereeName,
          refereeNewId: r?.refereeNewId,
          referrerNewId: r?.referrerNewId,
          status: normalizeStatus(r?.status),
          dealId: b?.dealId,
          participatedOn: b?.participatedOn,
          participatedAmount: b?.participatedAmount,
          bonusAmount: b?.amount,
          paymentStatus: b?.paymentStatus,
          transferredOn: b?.transferredOn,
        });
      }
    }
    return out;
  }, [filteredRefRows]);

  const dealTotalPages = Math.max(1, Math.ceil(filteredDeals.length / dealPageSize));

  const dealPageData = useMemo(() => {
    const start = (dealPage - 1) * dealPageSize;
    return filteredDeals.slice(start, start + dealPageSize);
  }, [filteredDeals, dealPage]);

  useEffect(() => {
    setDealPage(1);
  }, [selectedStatus]);

  // ✅ NEW: fetch summary counts for action column (Total/Registered/Lent/Invited)
  const fetchReferralSummary = useCallback(
    async (lenderId) => {
      if (!lenderId) return;
      if (!accessToken) return;

      // avoid duplicate calls per lenderId
      if (inFlightSummaryRef.current.has(lenderId)) return;

      // if already loaded (and not errored), skip
      const existing = summaryByLenderId[lenderId];
      if (existing && !existing.loading && !existing.error) return;

      inFlightSummaryRef.current.add(lenderId);

      setSummaryByLenderId((prev) => ({
        ...prev,
        [lenderId]: {
          ...(prev[lenderId] || {}),
          loading: true,
          error: "",
        },
      }));

      try {
        // Use big pageSize so we can compute accurate counts in the table
        const payload = { pageNo: 1, pageSize: 5000, primaryType: "LENDER" };

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
          throw new Error(`Referral summary failed (${res.status}): ${t || res.statusText}`);
        }

        const json = await res.json();

        const rows = Array.isArray(json?.listOfLenderReferenceResponseDto)
          ? json.listOfLenderReferenceResponseDto
          : [];

        let registered = 0;
        let lent = 0;
        let invited = 0;

        for (const r of rows) {
          const st = normalizeStatus(r?.status);
          if (st === "REGISTERED") registered += 1;
          else if (st === "LENT") lent += 1;
          else if (st === "INVITED") invited += 1;
        }

        const total = registered + lent + invited;

        setSummaryByLenderId((prev) => ({
          ...prev,
          [lenderId]: {
            loading: false,
            error: "",
            total,
            registered,
            lent,
            invited,
            earned:
              json?.sumOfEarnedAmount !== null && json?.sumOfEarnedAmount !== undefined
                ? Number(json.sumOfEarnedAmount).toFixed(2)
                : "-",
            apiCount: json?.count ?? rows.length,
          },
        }));
      } catch (e) {
        setSummaryByLenderId((prev) => ({
          ...prev,
          [lenderId]: {
            loading: false,
            error: e?.message || "Failed to load",
            total: 0,
            registered: 0,
            lent: 0,
            invited: 0,
            earned: "-",
            apiCount: 0,
          },
        }));
      } finally {
        inFlightSummaryRef.current.delete(lenderId);
      }
    },
    [accessToken, summaryByLenderId]
  );

  // ✅ NEW: prefetch summaries whenever table page changes
  useEffect(() => {
    const ids = (currentPageData || [])
      .map((x) => x?.lenderId)
      .filter((id) => id !== null && id !== undefined);

    ids.forEach((id) => {
      fetchReferralSummary(id);
    });
  }, [currentPageData, fetchReferralSummary]);

  // Referral API (modal paging)
  const fetchReferralDetails = async (lenderId, pageNo) => {
    setRefLoading(true);
    setRefErr("");
    try {
      if (!accessToken) throw new Error("accessToken not found. Please login first.");

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
        throw new Error(`Referral API failed (${res.status}): ${t || res.statusText}`);
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

  // ✅ UPDATED: allow opening modal directly for a specific status
  const openReferModal = async (lender, initialStatus = "TOTAL") => {
    setIsReferModalOpen(true);
    setReferForLenderId(lender.lenderId);
    setReferForLenderName(lender.lenderName || "");
    setRefPage(1);
    setRefData(null);
    setRefErr("");
    setSelectedStatus(initialStatus);
    setDealPage(1);

    // Preload ALL-time totals for modal boxes
    fetchReferralSummary(lender.lenderId);

    await fetchReferralDetails(lender.lenderId, 1);
  };

  const closeReferModal = () => {
    setIsReferModalOpen(false);
    setReferForLenderId(null);
    setReferForLenderName("");
    setRefData(null);
    setRefErr("");
    setRefPage(1);
    setSelectedStatus("TOTAL");
    setDealPage(1);
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

  // Bonus modal (per referee)
  const openBonusModal = (ref) => {
    const rows = Array.isArray(ref.lenderReferenceAmountResponse)
      ? ref.lenderReferenceAmountResponse
      : [];
    setBonusRows(rows);
    setBonusModalTitle(`${safeText(ref.refereeName)} (${safeText(ref.refereeNewId)})`);
    setIsBonusModalOpen(true);
  };

  const closeBonusModal = () => {
    setIsBonusModalOpen(false);
    setBonusModalTitle("");
    setBonusRows([]);
  };

  // ---------- Color themes ----------
  const STAT_THEME = {
    TOTAL: { border: "#fb923c", bg: "#fff7ed", text: "#9a3412" }, // orange
    REGISTERED: { border: "#22c55e", bg: "#f0fdf4", text: "#166534" }, // green
    LENT: { border: "#3b82f6", bg: "#eff6ff", text: "#1d4ed8" }, // blue
    INVITED: { border: "#eab308", bg: "#fefce8", text: "#854d0e" }, // yellow
  };

  // Compact clickable chip for Action column (main table)
  const StatChip = ({ label, value, tone = "TOTAL", onClick, disabled, title }) => {
    const t = STAT_THEME[tone] || STAT_THEME.TOTAL;
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        style={{
          border: `1px solid ${t.border}`,
          background: t.bg,
          color: t.text,
          padding: "6px 10px",
          borderRadius: "999px",
          cursor: disabled ? "not-allowed" : "pointer",
          fontSize: "12px",
          lineHeight: 1,
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          whiteSpace: "nowrap",
          opacity: disabled ? 0.65 : 1,
        }}
      >
        <span style={{ fontWeight: 800 }}>{label}</span>
        <span
          style={{
            fontWeight: 900,
            color: "#0f172a",
            background: "#ffffff",
            border: "1px solid rgba(15,23,42,0.08)",
            padding: "3px 8px",
            borderRadius: "999px",
          }}
        >
          {value}
        </span>
      </button>
    );
  };

  // Status box in modal (shows ALL-time totals, not page totals)
  const StatusCard = ({ label, value, tone = "TOTAL", active, onClick }) => {
    const t = STAT_THEME[tone] || STAT_THEME.TOTAL;
    return (
      <button
        onClick={onClick}
        style={{
          border: active ? `2px solid ${t.border}` : `1px solid rgba(15,23,42,0.10)`,
          background: active ? t.bg : "#fff",
          padding: "10px 12px",
          borderRadius: "12px",
          minWidth: "150px",
          textAlign: "left",
          cursor: "pointer",
          boxShadow: "0 1px 0 rgba(15,23,42,0.04)",
        }}
        title={`Show ${label} details`}
      >
        <div style={{ fontSize: "12px", color: t.text, fontWeight: 800 }}>{label}</div>
        <div style={{ fontSize: "20px", color: "#0f172a", fontWeight: 900 }}>{value}</div>
      </button>
    );
  };

  return (
    <div className="main-wrapper">
      <OxyloansAdminSidebar />
      <OxyloansAdminHeader />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="active-lenders-container">
            <div className="content-wrapper">
              <h1 className="page-title">Active lenders</h1>
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

                <button onClick={searchByLenderId} className="btn-search">
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
                  <div className="card-title">Lenders info</div>

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
                          className={`btn-page ${p === page ? "active" : ""}`}
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
                        <th style={{ width: "110px" }}>Lender ID</th>
                        <th style={{ width: "320px" }}>Name</th>
                        <th style={{ width: "300px" }}>Address Info</th>
                        <th style={{ width: "180px" }}>Total Participation Amount</th>
                        <th style={{ width: "280px" }}>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan={5}
                            style={{
                              textAlign: "center",
                              padding: "2rem",
                              color: "#475569",
                            }}
                          >
                            Loading...
                          </td>
                        </tr>
                      ) : currentPageData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            style={{
                              textAlign: "center",
                              padding: "2rem",
                              color: "#475569",
                            }}
                          >
                            No records found.
                          </td>
                        </tr>
                      ) : (
                        currentPageData.map((x) => {
                          const sid = x?.lenderId;
                          const s = sid ? summaryByLenderId[sid] : null;
                          const isSumLoading = !!s?.loading;
                          const sumErr = s?.error;

                          const totalVal = isSumLoading ? "…" : safeText(s?.total ?? 0);
                          const regVal = isSumLoading ? "…" : safeText(s?.registered ?? 0);
                          const lentVal = isSumLoading ? "…" : safeText(s?.lent ?? 0);
                          const invVal = isSumLoading ? "…" : safeText(s?.invited ?? 0);

                          return (
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

                              <td
                                className="text-wrap"
                                style={{ width: "300px", maxWidth: "300px" }}
                              >
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

                              {/* ✅ Compact colored chips (no odd buttons) */}
                              <td>
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "8px",
                                    maxWidth: "260px",
                                  }}
                                >
                                  <StatChip
                                    label="Total"
                                    value={totalVal}
                                    tone="TOTAL"
                                    disabled={!sid}
                                    title={sumErr ? sumErr : "Open Total referrals"}
                                    onClick={() => openReferModal(x, "TOTAL")}
                                  />
                                  <StatChip
                                    label="Registered"
                                    value={regVal}
                                    tone="REGISTERED"
                                    disabled={!sid}
                                    title={
                                      sumErr ? sumErr : "Open Registered referrals"
                                    }
                                    onClick={() =>
                                      openReferModal(x, "REGISTERED")
                                    }
                                  />
                                  <StatChip
                                    label="Lent"
                                    value={lentVal}
                                    tone="LENT"
                                    disabled={!sid}
                                    title={sumErr ? sumErr : "Open Lent referrals"}
                                    onClick={() => openReferModal(x, "LENT")}
                                  />
                                  <StatChip
                                    label="Invited"
                                    value={invVal}
                                    tone="INVITED"
                                    disabled={!sid}
                                    title={
                                      sumErr ? sumErr : "Open Invited referrals"
                                    }
                                    onClick={() => openReferModal(x, "INVITED")}
                                  />
                                </div>

                                {sumErr ? (
                                  <div
                                    style={{
                                      marginTop: "6px",
                                      fontSize: "11px",
                                      color: "#b91c1c",
                                    }}
                                  >
                                    {sumErr}
                                  </div>
                                ) : null}
                              </td>
                            </tr>
                          );
                        })
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
                      <div className="modal-title">Referral Details</div>
                      <div className="modal-subtitle">
                        Lender:{" "}
                        <span style={{ fontWeight: 600, color: "#1e293b" }}>
                          {safeText(referForLenderName)}
                        </span>
                      </div>

                      {/* ✅ ALL-time totals (not pagination totals) */}
                      <div
                        style={{
                          marginTop: "0.5rem",
                          fontSize: "0.75rem",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        <span
                          className="badge-info"
                          style={{
                            border: `1px solid ${STAT_THEME.TOTAL.border}`,
                            background: STAT_THEME.TOTAL.bg,
                            color: STAT_THEME.TOTAL.text,
                          }}
                        >
                          Total:{" "}
                          <span style={{ fontWeight: 800 }}>
                            {modalSummary.loading
                              ? "…"
                              : safeText(modalSummary.total)}
                          </span>
                        </span>

                        <span
                          className="badge-info"
                          style={{
                            border: `1px solid ${STAT_THEME.REGISTERED.border}`,
                            background: STAT_THEME.REGISTERED.bg,
                            color: STAT_THEME.REGISTERED.text,
                          }}
                        >
                          Registered:{" "}
                          <span style={{ fontWeight: 800 }}>
                            {modalSummary.loading
                              ? "…"
                              : safeText(modalSummary.registered)}
                          </span>
                        </span>

                        <span
                          className="badge-info"
                          style={{
                            border: `1px solid ${STAT_THEME.LENT.border}`,
                            background: STAT_THEME.LENT.bg,
                            color: STAT_THEME.LENT.text,
                          }}
                        >
                          Lent:{" "}
                          <span style={{ fontWeight: 800 }}>
                            {modalSummary.loading
                              ? "…"
                              : safeText(modalSummary.lent)}
                          </span>
                        </span>

                        <span
                          className="badge-info"
                          style={{
                            border: `1px solid ${STAT_THEME.INVITED.border}`,
                            background: STAT_THEME.INVITED.bg,
                            color: STAT_THEME.INVITED.text,
                          }}
                        >
                          Invited:{" "}
                          <span style={{ fontWeight: 800 }}>
                            {modalSummary.loading
                              ? "…"
                              : safeText(modalSummary.invited)}
                          </span>
                        </span>

                        <span className="badge-info">
                          Earned:{" "}
                          <span style={{ fontWeight: 800 }}>
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
                      <div
                        className="error-message"
                        style={{ marginBottom: "1rem", marginTop: 0 }}
                      >
                        <div style={{ fontWeight: 600 }}>Error</div>
                        <div style={{ marginTop: "0.25rem" }}>{refErr}</div>
                      </div>
                    ) : null}

                    {/* Status summary boxes (ALL-time totals) */}
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        marginBottom: "10px",
                      }}
                    >
                      <StatusCard
                        label="Total"
                        value={modalSummary.loading ? "…" : safeText(modalSummary.total)}
                        tone="TOTAL"
                        active={selectedStatus === "TOTAL"}
                        onClick={() => setSelectedStatus("TOTAL")}
                      />
                      <StatusCard
                        label="Registered"
                        value={modalSummary.loading ? "…" : safeText(modalSummary.registered)}
                        tone="REGISTERED"
                        active={selectedStatus === "REGISTERED"}
                        onClick={() => setSelectedStatus("REGISTERED")}
                      />
                      <StatusCard
                        label="Lent"
                        value={modalSummary.loading ? "…" : safeText(modalSummary.lent)}
                        tone="LENT"
                        active={selectedStatus === "LENT"}
                        onClick={() => setSelectedStatus("LENT")}
                      />
                      <StatusCard
                        label="Invited"
                        value={modalSummary.loading ? "…" : safeText(modalSummary.invited)}
                        tone="INVITED"
                        active={selectedStatus === "INVITED"}
                        onClick={() => setSelectedStatus("INVITED")}
                      />
                    </div>

                    {/* Pagination (API page) */}
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
                            className={`btn-page ${p === refPage ? "active" : ""}`}
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

                    {/* Filter info */}
                    <div style={{ fontSize: "12px", color: "#475569" }}>
                      Showing status:{" "}
                      <span style={{ fontWeight: 800, color: "#0f172a" }}>
                        {selectedStatus}
                      </span>{" "}
                      | Referrals:{" "}
                      <span style={{ fontWeight: 800, color: "#0f172a" }}>
                        {filteredRefRows.length}
                      </span>{" "}
                      | Deals:{" "}
                      <span style={{ fontWeight: 800, color: "#0f172a" }}>
                        {filteredDeals.length}
                      </span>
                    </div>

                    {/* FILTERED REFERRALS TABLE */}
                    <div
                      className="table-responsive"
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.25rem",
                        marginTop: "10px",
                      }}
                    >
                      <table className="data-table" style={{ minWidth: "980px" }}>
                        <thead>
                          <tr>
                            <th>Referee</th>
                            <th>Contact</th>
                            <th>Status</th>
                            <th>Referred On</th>
                            <th>Total Earned</th>
                            <th>Deals / Bonus</th>
                          </tr>
                        </thead>

                        <tbody>
                          {refLoading ? (
                            <tr>
                              <td
                                colSpan={6}
                                style={{
                                  textAlign: "center",
                                  padding: "2rem",
                                  color: "#475569",
                                }}
                              >
                                Loading referral details...
                              </td>
                            </tr>
                          ) : filteredRefRows.length === 0 ? (
                            <tr>
                              <td
                                colSpan={6}
                                style={{
                                  textAlign: "center",
                                  padding: "2rem",
                                  color: "#475569",
                                }}
                              >
                                No referral records found for this status.
                              </td>
                            </tr>
                          ) : (
                            filteredRefRows.map((r, idx) => {
                              const bonus = Array.isArray(r.lenderReferenceAmountResponse)
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
                                    <div
                                      style={{
                                        fontSize: "0.75rem",
                                        color: "#475569",
                                      }}
                                    >
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

                                  <td>{safeText(r.referredOn)}</td>

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
                                        {bonus.slice(0, 2).map((b, i) => (
                                          <div key={i} className="bonus-item">
                                            <div className="bonus-row-grid">
                                              <span>
                                                <span className="label-bold">Deal:</span>{" "}
                                                {safeText(b.dealId)}
                                              </span>
                                              <span>
                                                <span className="label-bold">
                                                  Bonus:
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

                                        <button
                                          onClick={() => openBonusModal(r)}
                                          className="btn-view-all-bonus"
                                        >
                                          View all deals ({bonus.length})
                                        </button>
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

                    {/* DEAL DETAILS TABLE (flattened) */}
                    <div style={{ marginTop: "14px" }}>
                      <div
                        style={{
                          fontWeight: 900,
                          color: "#0f172a",
                          marginBottom: "6px",
                        }}
                      >
                        Deal Details & Earning Amounts (Status: {selectedStatus})
                      </div>

                      <div
                        className="table-responsive"
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: "0.25rem",
                        }}
                      >
                        <table className="data-table" style={{ minWidth: "980px" }}>
                          <thead>
                            <tr>
                              <th>Referee</th>
                              <th>Deal ID</th>
                              <th>Participated On</th>
                              <th>Participated Amount</th>
                              <th>Bonus Amount</th>
                              <th>Payment Status</th>
                              <th>Transferred On</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredDeals.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={7}
                                  style={{
                                    textAlign: "center",
                                    padding: "1.5rem",
                                    color: "#475569",
                                  }}
                                >
                                  No deals found for this status.
                                </td>
                              </tr>
                            ) : (
                              dealPageData.map((d, i) => (
                                <tr key={`${d.dealId ?? "x"}-${i}`}>
                                  <td>
                                    <div style={{ fontWeight: 700 }}>
                                      {safeText(d.refereeName)}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "12px",
                                        color: "#475569",
                                      }}
                                    >
                                      {safeText(d.refereeNewId)}
                                    </div>
                                  </td>
                                  <td>{safeText(d.dealId)}</td>
                                  <td>{safeText(d.participatedOn)}</td>
                                  <td>{formatNumber(d.participatedAmount ?? null)}</td>
                                  <td>{safeText(d.bonusAmount ?? "-")}</td>
                                  <td>{safeText(d.paymentStatus ?? "-")}</td>
                                  <td>{safeText(d.transferredOn ?? "-")}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {filteredDeals.length > 0 ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: "8px",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          <div style={{ fontSize: "12px", color: "#475569" }}>
                            Page{" "}
                            <span style={{ fontWeight: 800, color: "#0f172a" }}>
                              {dealPage}
                            </span>{" "}
                            /{" "}
                            <span style={{ fontWeight: 800, color: "#0f172a" }}>
                              {dealTotalPages}
                            </span>
                          </div>

                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              className="btn-page"
                              disabled={dealPage <= 1}
                              onClick={() => setDealPage(1)}
                              title="First"
                            >
                              «
                            </button>
                            <button
                              className="btn-page"
                              disabled={dealPage <= 1}
                              onClick={() => setDealPage((p) => Math.max(1, p - 1))}
                              title="Prev"
                            >
                              ←
                            </button>
                            <button
                              className="btn-page"
                              disabled={dealPage >= dealTotalPages}
                              onClick={() =>
                                setDealPage((p) =>
                                  Math.min(dealTotalPages, p + 1)
                                )
                              }
                              title="Next"
                            >
                              →
                            </button>
                            <button
                              className="btn-page"
                              disabled={dealPage >= dealTotalPages}
                              onClick={() => setDealPage(dealTotalPages)}
                              title="Last"
                            >
                              »
                            </button>
                          </div>
                        </div>
                      ) : null}
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
                <div
                  className="modal-content-wrapper"
                  style={{ maxWidth: "900px", maxHeight: "75vh" }}
                >
                  <div className="modal-header">
                    <div>
                      <div className="modal-title">All Deals</div>
                      <div className="modal-subtitle">{bonusModalTitle}</div>
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
                    <div
                      className="table-responsive"
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.25rem",
                      }}
                    >
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
                              <td
                                colSpan={6}
                                style={{
                                  textAlign: "center",
                                  padding: "2rem",
                                  color: "#475569",
                                }}
                              >
                                No deals found.
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

                    <div
                      style={{
                        marginTop: "0.5rem",
                        fontSize: "0.75rem",
                        color: "#475569",
                      }}
                    >
                      Total Deals:{" "}
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