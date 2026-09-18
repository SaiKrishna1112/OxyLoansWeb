import React, { useEffect, useState, useMemo, useCallback } from "react";
import offerAdminApi from "../../../../../HttpRequest/offerAdminApi";
import useOfferApi from "../hooks/useOfferApi";
import OfferPageHeader from "../components/OfferPageHeader";
import OfferLoadingSpinner from "../components/OfferLoadingSpinner";
import OfferErrorAlert from "../components/OfferErrorAlert";
import OfferTable from "../components/OfferTable";
import SegmentFilter from "../components/SegmentFilter";
import SearchBar from "../components/SearchBar";
import { getOfferTypeLabel, normalizeOfferTypeCode } from "../utils/offerConstants";

const ApprovedOffers = () => {
  const { loading, error, execute, clearError } = useOfferApi();
  const [offers, setOffers] = useState([]);
  const [segment, setSegment] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async (seg) => {
    try {
      const data = await execute(offerAdminApi.getApprovedOffers, seg || undefined);
      setOffers(data || []);
    } catch {
      /* handled */
    }
  }, [execute]);

  useEffect(() => {
    load(segment);
  }, [load, segment]);

  const filtered = useMemo(() => {
    if (!search.trim()) return offers;
    const q = search.toLowerCase();
    return offers.filter(
      (o) =>
        String(o.id).includes(q) ||
        o.title?.toLowerCase().includes(q) ||
        getOfferTypeLabel(o.offerType).toLowerCase().includes(q) ||
        normalizeOfferTypeCode(o.offerType).toLowerCase().includes(q)
    );
  }, [offers, search]);

  return (
    <div>
      <OfferPageHeader
        title="Approved Offers"
        subtitle="New/Inactive: deal fee free · Regular: membership % off — visible to mapped lenders"
      >
        <button type="button" className="btn btn-outline-success btn-sm" onClick={() => load(segment)} disabled={loading}>
          Refresh
        </button>
      </OfferPageHeader>
      <OfferErrorAlert message={error} onDismiss={clearError} />

      <div className="row g-2 mb-3">
        <div className="col-md-6"><SearchBar value={search} onChange={setSearch} placeholder="Search offers..." /></div>
        <div className="col-md-4"><SegmentFilter value={segment} onChange={setSegment} /></div>
        <div className="col-md-2 d-flex align-items-center">
          <span className="badge bg-success fs-6">{filtered.length} approved</span>
        </div>
      </div>

      {loading ? (
        <OfferLoadingSpinner fullPage />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <OfferTable
              offers={filtered}
              columns={["id", "title", "segment", "offerType", "benefit", "status", "approvedAt", "generatedAt"]}
              emptyMessage="No approved offers yet."
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedOffers;
