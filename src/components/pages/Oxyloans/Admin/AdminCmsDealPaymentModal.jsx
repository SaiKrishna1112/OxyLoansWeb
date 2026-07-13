import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  loadDealCmsInterestPayments,
  loadDealCmsInterestPaymentHistory,
} from "../../../HttpRequest/aiAdminApi";
import { DataTable, money, number, LoadingBlock } from "./adminAIDashboardShared";
import { exportRowsToCsv } from "./adminReportKit";
import {
  cmsReturnsTypeLabel,
  cmsPaidSourceLabel,
  isLenderPaid,
  dealPaidCount,
  dealNotPaidCount,
  dealPaidAmount,
  dealNotPaidAmount,
  paidPct,
} from "./adminCmsPayoutUtils";
import { CmsPaidProgress, CmsTypeBadge, CmsPaidBadge, CmsOprStatusBadge, CmsPrincipalFlowHint } from "./CmsPayoutVisuals";

const sheetStatusBadge = (status) => {
  const st = (status || "INITIATED").toUpperCase();
  const map = {
    SUCCESS: "ai-stage ai-stage--success",
    APPROVED: "ai-stage ai-stage--info",
    INITIATED: "ai-stage ai-stage--muted",
  };
  return <span className={map[st] || "ai-stage"}>{st}</span>;
};

const AdminCmsDealPaymentModal = ({
  dealId,
  dealName,
  onClose,
  onSummaryLoaded,
  initialPaymentDate,
  initialCmsPaymentId,
  initialReturnsType,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [selectedCycleKey, setSelectedCycleKey] = useState("");
  const [data, setData] = useState(null);
  const [view, setView] = useState("all");
  const [copyMsg, setCopyMsg] = useState("");

  const cycleKey = (h) => `${h.cmsPaymentId || ""}-${h.lenderReturnsType || ""}`;

  const loadCycle = useCallback(
    async (cycle) => {
      if (!dealId || !cycle) return;
      setLoading(true);
      setError("");
      try {
        const res = await loadDealCmsInterestPayments(dealId, cycle.paymentDate || null, {
          cmsPaymentId: cycle.cmsPaymentId,
          returnsType: cycle.lenderReturnsType || cycle.returnsType,
        });
        setData(res || null);
        setSelectedCycleKey(cycleKey(res || cycle));
        if (res?.cmsPaymentId && onSummaryLoaded) onSummaryLoaded(dealId, res);
      } catch (e) {
        setError(e?.message || "Could not load lender payments.");
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [dealId, onSummaryLoaded]
  );

  const pickInitialCycle = useCallback(
    (cycles) => {
      if (initialCmsPaymentId) {
        const byId = cycles.find((h) => h.cmsPaymentId === initialCmsPaymentId);
        if (byId) return byId;
      }
      if (initialPaymentDate && initialReturnsType) {
        const byBoth = cycles.find(
          (h) => h.paymentDate === initialPaymentDate && h.lenderReturnsType === initialReturnsType
        );
        if (byBoth) return byBoth;
      }
      return cycles[0] || null;
    },
    [initialCmsPaymentId, initialPaymentDate, initialReturnsType]
  );

  useEffect(() => {
    if (!dealId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const oprType = (initialReturnsType || "").toUpperCase();
        const isOprLeg = oprType === "LENDERPRINCIPAL" || oprType === "PRINCIPALINTEREST";

        if (isOprLeg) {
          const res = await loadDealCmsInterestPayments(dealId, initialPaymentDate || null, {
            cmsPaymentId: initialCmsPaymentId,
            returnsType: oprType,
          });
          if (cancelled) return;
          setData(res || null);
          setSelectedCycleKey(cycleKey(res || { lenderReturnsType: oprType, cmsPaymentId: initialCmsPaymentId }));
          if (res && onSummaryLoaded) onSummaryLoaded(dealId, res);
          return;
        }

        const list = await loadDealCmsInterestPaymentHistory(dealId);
        if (cancelled) return;
        const cycles = Array.isArray(list) ? list : [];
        setHistory(cycles);
        const initial = pickInitialCycle(cycles);
        const res = await loadDealCmsInterestPayments(dealId, initial?.paymentDate || initialPaymentDate || null, {
          cmsPaymentId: initial?.cmsPaymentId || initialCmsPaymentId,
          returnsType: initial?.lenderReturnsType || initialReturnsType,
        });
        if (cancelled) return;
        setData(res || null);
        setSelectedCycleKey(cycleKey(res || initial || {}));
        if (res && onSummaryLoaded) onSummaryLoaded(dealId, res);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Could not load lender payments.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dealId, onSummaryLoaded, initialPaymentDate, initialCmsPaymentId, initialReturnsType, pickInitialCycle]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.body.classList.add("ai-modal-open");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("ai-modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const lenders = data?.lenders || [];
  const returnsType = data?.lenderReturnsType || "";
  const isPrincipalType = ["LENDERPRINCIPAL", "PRINCIPALINTEREST"].includes(returnsType.toUpperCase());
  const paidRows = useMemo(() => lenders.filter((l) => isLenderPaid(l, returnsType)), [lenders, returnsType]);
  const notPaidRows = useMemo(() => lenders.filter((l) => !isLenderPaid(l, returnsType)), [lenders, returnsType]);

  const paidCount = data ? dealPaidCount(data) : paidRows.length;
  const notPaidCount = data ? dealNotPaidCount(data) : notPaidRows.length;
  const totalLenders = data?.totalLenders ?? lenders.length;
  const pct = data ? paidPct(data) : 0;
  const typeLabel = cmsReturnsTypeLabel(data?.lenderReturnsType);

  const visibleRows = view === "paid" ? paidRows : view === "notpaid" ? notPaidRows : lenders;

  const lenderCols = useMemo(() => {
    const cols = [
      ["lenderId", "Lender ID"],
      ["lenderName", "Name"],
      ["amount", "Amount", money],
    ];
    if (isPrincipalType) {
      cols.push(
        ["oprStatus", "OPR status", (v) => <CmsOprStatusBadge status={v} />],
        [
          returnsType.toUpperCase() === "LENDERPRINCIPAL" ? "principalStatus" : "interestStatus",
          returnsType.toUpperCase() === "LENDERPRINCIPAL" ? "Principal leg" : "Interest leg",
          (v) => <CmsOprStatusBadge status={v} />,
        ]
      );
    } else {
      cols.push(["transactionStatus", "CMS sheet", (v) => sheetStatusBadge(v)]);
      cols.push(["iciciStatus", "ICICI", (v) => v || "—"]);
    }
    cols.push([
      "paymentOutcome",
      "Paid?",
      (_, row) => <CmsPaidBadge paid={isLenderPaid(row, returnsType)} />,
    ]);
    cols.push(["walletPaidDate", "Date", (v) => v || "—"]);
    return cols;
  }, [isPrincipalType, returnsType]);

  const regenCols = [
    ["lenderId", "Lender ID"],
    ["lenderName", "Name"],
    ["amount", "Amount", money],
  ];

  const copyNotPaidIds = () => {
    const ids = notPaidRows.map((r) => r.lenderId).filter(Boolean);
    if (!ids.length) return;
    navigator.clipboard?.writeText(ids.join(", ")).then(() => {
      setCopyMsg(`Copied ${ids.length} lender IDs`);
      setTimeout(() => setCopyMsg(""), 2500);
    });
  };

  if (!dealId) return null;
  const hasPayment = Boolean(data) && (data?.lenders?.length > 0 || data?.cmsPaymentId || isPrincipalType);

  return createPortal(
    <div className="ai-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="ai-modal-dialog ai-modal-dialog--cms"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ai-modal-header">
          <div className="ai-modal-title-wrap">
            <div className="ai-modal-icon" style={{ background: "#059669" }}>
              <i className="fas fa-money-check-alt" />
            </div>
            <div>
              <h5 className="ai-modal-title mb-0">
                {typeLabel} — {dealName || `Deal #${dealId}`}
              </h5>
              <p className="ai-modal-subtitle mb-0">
                {data?.paymentDate || "—"}
                {data?.lenderReturnsType ? (
                  <>
                    {" "}
                    · <CmsTypeBadge type={data.lenderReturnsType} />
                  </>
                ) : null}
              </p>
            </div>
          </div>
          <div className="ai-modal-actions">
            {history.length > 1 && (
              <select
                className="form-select form-select-sm ai-cms-date-select"
                value={selectedCycleKey}
                onChange={(e) => {
                  const match = history.find((h) => cycleKey(h) === e.target.value);
                  setView("all");
                  if (match) {
                    setData(match);
                    setSelectedCycleKey(cycleKey(match));
                  } else {
                    loadCycle({ paymentDate: e.target.value });
                  }
                }}
                disabled={loading}
              >
                {history.map((h) => (
                  <option key={cycleKey(h)} value={cycleKey(h)}>
                    {h.paymentDate} · {cmsReturnsTypeLabel(h.lenderReturnsType)} · {money(h.totalAmount)}
                  </option>
                ))}
              </select>
            )}
            <button type="button" className="btn btn-light btn-sm" onClick={onClose}>
              <i className="fas fa-times" />
            </button>
          </div>
        </div>

        <div className="ai-modal-body">
          {loading && <LoadingBlock label="Loading lender payments…" />}
          {!loading && error && (
            <div className="alert alert-danger mb-0">
              {error}
              {String(error).toLowerCase().includes("login") && (
                <Link to="/admlogin" className="btn btn-sm btn-primary mt-2 d-block">
                  Admin Login
                </Link>
              )}
            </div>
          )}
          {!loading && !error && hasPayment && (
            <>
              <div className="ai-cms-payout-summary">
                <div className="ai-cms-payout-summary-head">
                  <div>
                    <span className="ai-cms-payout-summary-label">
                      {typeLabel} — lenders paid or not paid
                    </span>
                    <div className="ai-cms-payout-summary-value">
                      <strong className="text-success">{number(paidCount)}</strong>
                      <span className="text-muted"> paid · </span>
                      <strong className="text-warning">{number(notPaidCount)}</strong>
                      <span className="text-muted"> not paid</span>
                      <span className="ai-cms-payout-pct">{pct}%</span>
                    </div>
                  </div>
                  <div className="ai-cms-payout-summary-amt text-end small">
                    <div className="text-success">Paid {money(dealPaidAmount(data))}</div>
                    <div className="text-warning">Not paid {money(dealNotPaidAmount(data))}</div>
                  </div>
                </div>
                <CmsPaidProgress deal={data} />
                {isPrincipalType && <CmsPrincipalFlowHint />}
                <p className="ai-cms-payout-hint mb-0">
                  Source: <code>{cmsPaidSourceLabel(returnsType)}</code>
                  {isPrincipalType ? (
                    <>
                      {" "}
                      — paid when <strong>{returnsType === "LENDERPRINCIPAL" ? "principal_status" : "interest_status"}</strong>{" "}
                      is <strong>EXECUTED</strong> (ICICI success file read for deal {dealId} + lender).
                    </>
                  ) : (
                    <>
                      {" "}
                      — icici_status <strong>Paid</strong> for deal {dealId}, payment date {data.paymentDate}.
                    </>
                  )}
                </p>
              </div>

              {notPaidRows.length > 0 && (
                <div className="ai-cms-regen-block">
                  <div className="ai-cms-regen-head">
                    <strong>{number(notPaidRows.length)} lenders not paid — regenerate file</strong>
                    <div className="ai-cms-regen-actions">
                      <button type="button" className="btn btn-outline-secondary btn-sm" onClick={copyNotPaidIds}>
                        Copy IDs
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-success btn-sm"
                        onClick={() =>
                          exportRowsToCsv(notPaidRows, regenCols, `not-paid-${dealId}-${data.paymentDate}.csv`)
                        }
                      >
                        Export CSV
                      </button>
                    </div>
                  </div>
                  {copyMsg && <p className="text-success small mb-1">{copyMsg}</p>}
                </div>
              )}

              <div className="ai-cms-lender-tabs">
                <button
                  type="button"
                  className={`ai-cms-lender-tab ${view === "all" ? "ai-cms-lender-tab--active" : ""}`}
                  onClick={() => setView("all")}
                >
                  All ({number(totalLenders)})
                </button>
                <button
                  type="button"
                  className={`ai-cms-lender-tab ${view === "paid" ? "ai-cms-lender-tab--active" : ""}`}
                  onClick={() => setView("paid")}
                >
                  Paid ({number(paidCount)})
                </button>
                <button
                  type="button"
                  className={`ai-cms-lender-tab ${view === "notpaid" ? "ai-cms-lender-tab--active" : ""}`}
                  onClick={() => setView("notpaid")}
                >
                  Not paid ({number(notPaidCount)})
                </button>
              </div>

              <DataTable rows={visibleRows} initialLimit={30} columns={lenderCols} emptyText="No lenders." />
            </>
          )}
          {!loading && !error && !hasPayment && (
            <p className="text-muted mb-0">No CMS payment for this deal and type yet.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AdminCmsDealPaymentModal;
