import React, { useState } from "react";
import offerAdminApi from "../../../../../HttpRequest/offerAdminApi";
import useOfferApi from "../hooks/useOfferApi";
import OfferPageHeader from "../components/OfferPageHeader";
import OfferLoadingSpinner from "../components/OfferLoadingSpinner";
import OfferErrorAlert from "../components/OfferErrorAlert";
import OfferToast from "../components/OfferToast";
import OfferTable from "../components/OfferTable";
import { OFFER_SEGMENTS } from "../utils/offerConstants";

const GenerateOffers = () => {
  const { loading, error, execute, clearError } = useOfferApi();
  const [segment, setSegment] = useState("NEVER_INVESTED");
  const [limit, setLimit] = useState(5);
  const [result, setResult] = useState(null);
  const [toast, setToast] = useState(null);

  const handleGenerate = async () => {
    clearError();
    try {
      const data = await execute(offerAdminApi.generateOffers, segment, Number(limit));
      setResult(data);
      setToast(`Generated ${data.generatedOffersCount || 0} offers — pending admin approval`);
    } catch {
      /* hook handles error */
    }
  };

  return (
    <div>
      <OfferPageHeader
        title="Generate Offers"
        subtitle="Create AI-powered segment offer strategies"
      />
      <OfferErrorAlert message={error} onDismiss={clearError} />
      <OfferToast message={toast} onClose={() => setToast(null)} />

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              <label className="form-label fw-semibold">Segment</label>
              <select
                className="form-select"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
              >
                {OFFER_SEGMENTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Number of offers</label>
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
        </div>
      </div>

      {loading && <OfferLoadingSpinner message="Generating offers — this may take a moment..." />}

      {result && (
        <>
          <div className="alert alert-info">
            <strong>{result.totalEligibleLenders}</strong> eligible lenders in segment{" "}
            <code>{result.segment}</code> — generated{" "}
            <strong>{result.generatedOffersCount}</strong> offer strategies (status: GENERATED, awaiting approval).
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
                columns={["id", "title", "segment", "offerType", "minimumInvestment", "participationFeeSaved", "status", "generatedAt"]}
              />
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">
              Eligible Lenders ({result.eligibleLenders?.length || 0})
            </div>
            <div className="card-body p-0">
              <div className="table-responsive" style={{ maxHeight: 400 }}>
                <table className="table table-sm table-hover mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th>User ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>City</th>
                      <th>Deals</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(result.eligibleLenders || []).map((l) => (
                      <tr key={l.lenderId}>
                        <td>{l.lenderId}</td>
                        <td>{l.lenderName}</td>
                        <td>{l.email || "—"}</td>
                        <td>{l.city || "—"}</td>
                        <td>{l.dealCount ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GenerateOffers;
