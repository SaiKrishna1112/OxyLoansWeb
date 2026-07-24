import React, { useCallback, useEffect, useState } from "react";
import offerAdminApi from "../../../../../HttpRequest/offerAdminApi";
import useOfferApi from "../hooks/useOfferApi";
import OfferPageHeader from "../components/OfferPageHeader";
import OfferLoadingSpinner from "../components/OfferLoadingSpinner";
import OfferErrorAlert from "../components/OfferErrorAlert";
import OfferToast from "../components/OfferToast";
import OfferTable from "../components/OfferTable";
import {
  OFFER_SEGMENTS,
  getSegmentDescription,
  getDefaultOfferType,
  getOfferTypeLabel,
} from "../utils/offerConstants";

const LENDER_PAGE_SIZE = 50;

const formatParticipationRate = (rate) => {
  if (rate == null || rate === "") return "—";
  const n = Number(rate);
  if (Number.isNaN(n)) return "—";
  return n.toFixed(2);
};

const GenerateOffers = () => {
  const { loading, error, execute, clearError } = useOfferApi();
  const [segment, setSegment] = useState("NEW_LENDER");
  const [limit, setLimit] = useState(1);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  const [lenderPage, setLenderPage] = useState(1);
  const [lenderTotal, setLenderTotal] = useState(0);
  const [lenderTotalPages, setLenderTotalPages] = useState(1);
  const [lenders, setLenders] = useState([]);
  const [lendersLoading, setLendersLoading] = useState(false);
  const [lendersError, setLendersError] = useState("");

  const defaultOfferType = getDefaultOfferType(segment);
  const isRegular = segment === "REGULAR_PARTICIPANT";

  const loadLenderPage = useCallback(async (seg, page) => {
    setLendersLoading(true);
    setLendersError("");
    try {
      const data = await offerAdminApi.getEligibleLendersPage(seg, page, LENDER_PAGE_SIZE);
      setLenders(data?.lenders || []);
      setLenderPage(Number(data?.page) || page);
      setLenderTotal(Number(data?.total) || 0);
      setLenderTotalPages(Number(data?.totalPages) || 1);
    } catch (e) {
      setLendersError(e.message || "Failed to load lenders");
      setLenders([]);
    } finally {
      setLendersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!result?.segment) return;
    loadLenderPage(result.segment, lenderPage);
  }, [result?.segment, lenderPage, loadLenderPage]);

  const handleGenerate = async () => {
    clearError();
    setResult(null);
    setLenders([]);
    setLenderPage(1);
    try {
      const data = await execute(offerAdminApi.generateOffers, segment, Number(limit));
      setResult(data);
      setToast(`Generated ${data.generatedOffersCount || 0} offers — pending admin approval`);
      // First page comes from generate response; keep in sync with pagination state
      setLenders(data.eligibleLenders || []);
      setLenderTotal(Number(data.totalEligibleLenders) || 0);
      const total = Number(data.totalEligibleLenders) || 0;
      setLenderTotalPages(Math.max(1, Math.ceil(total / LENDER_PAGE_SIZE)));
      setLenderPage(1);
    } catch {
      /* hook handles error */
    }
  };

  const offerColumns = isRegular
    ? ["id", "title", "segment", "offerType", "subscriptionDiscountPercent", "status", "generatedAt"]
    : ["id", "title", "segment", "offerType", "minimumInvestment", "participationFeeSaved", "status", "generatedAt"];

  return (
    <div>
      <OfferPageHeader title="Generate Offers" />
      <OfferErrorAlert message={error} onDismiss={clearError} />
      <OfferToast message={toast} onClose={() => setToast(null)} />

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              <label className="form-label fw-semibold mb-1">Segment</label>
              <select
                className="form-select"
                value={segment}
                onChange={(e) => {
                  setSegment(e.target.value);
                  setResult(null);
                  setLenders([]);
                  setLenderPage(1);
                }}
              >
                {OFFER_SEGMENTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold mb-1">Number of offers</label>
              <input
                type="number"
                className="form-control"
                min={1}
                max={20}
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Generating...
                  </>
                ) : (
                  "Generate Offers"
                )}
              </button>
            </div>
          </div>
          <div className="form-text mt-2">
            {getSegmentDescription(segment)}
            {" · Offer type: "}
            <span className="badge bg-primary-subtle text-primary border">
              {getOfferTypeLabel(defaultOfferType)}
            </span>
          </div>
        </div>
      </div>

      {loading && <OfferLoadingSpinner message="Generating offers — this may take a moment..." />}

      {result && (
        <>
          <div className="alert alert-info">
            <strong>{result.totalEligibleLenders}</strong> eligible lenders in segment{" "}
            <code>{result.segment}</code>
            {isRegular && " (Regulars at/above median participation rate only)"}
            {" — "}generated <strong>{result.generatedOffersCount}</strong> offer strategies
            (status: GENERATED, awaiting approval).
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white fw-semibold">Generated Offers</div>
            <div className="card-body p-0">
              <OfferTable
                offers={(result.offers || []).map((o) => ({
                  ...o,
                  segment: result.segment,
                  status: o.status || "GENERATED",
                }))}
                columns={offerColumns}
              />
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
              <span className="fw-semibold">
                Eligible Lenders preview
                {lenderTotal > 0
                  ? ` (${Math.min((lenderPage - 1) * LENDER_PAGE_SIZE + 1, lenderTotal)}–${Math.min(lenderPage * LENDER_PAGE_SIZE, lenderTotal)} of ${lenderTotal})`
                  : ""}
              </span>
              {lenderTotalPages > 1 && (
                <span className="small text-muted">Page {lenderPage} of {lenderTotalPages}</span>
              )}
            </div>
            {lendersError && (
              <div className="alert alert-warning mb-0 rounded-0">{lendersError}</div>
            )}
            <div className="card-body p-0">
              {lendersLoading ? (
                <div className="text-center py-4">
                  <span className="spinner-border spinner-border-sm me-2" />
                  Loading lenders...
                </div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: 400 }}>
                  <table className="table table-sm table-hover mb-0">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th>User ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>City</th>
                        <th>Deals</th>
                        <th>Inactive days</th>
                        <th>Participation rate</th>
                        {isRegular && <th>Discount eligible</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {lenders.length === 0 ? (
                        <tr>
                          <td colSpan={isRegular ? 8 : 7} className="text-center text-muted py-4">
                            No lenders on this page
                          </td>
                        </tr>
                      ) : (
                        lenders.map((l) => (
                          <tr key={l.lenderId}>
                            <td>{l.lenderId}</td>
                            <td>{l.lenderName}</td>
                            <td>{l.email || "—"}</td>
                            <td>{l.city || "—"}</td>
                            <td>{l.dealCount ?? 0}</td>
                            <td>{l.daysInactive ?? "—"}</td>
                            <td>{formatParticipationRate(l.participationRate)}</td>
                            {isRegular && (
                              <td>
                                {l.discountOfferEligible ? (
                                  <span className="badge bg-success">Yes</span>
                                ) : (
                                  <span className="badge bg-secondary">No</span>
                                )}
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            {lenderTotalPages > 1 && (
              <div className="card-footer bg-white d-flex justify-content-between align-items-center flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  disabled={lenderPage <= 1 || lendersLoading}
                  onClick={() => setLenderPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="small text-muted">
                    Page {lenderPage} of {lenderTotalPages}
                  </span>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    style={{ width: 72 }}
                    min={1}
                    max={lenderTotalPages}
                    value={lenderPage}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      if (!Number.isNaN(next)) {
                        setLenderPage(Math.min(lenderTotalPages, Math.max(1, next)));
                      }
                    }}
                    aria-label="Go to page"
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  disabled={lenderPage >= lenderTotalPages || lendersLoading}
                  onClick={() => setLenderPage((p) => Math.min(lenderTotalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default GenerateOffers;
