import React, { useEffect, useState, useMemo } from "react";
import offerAdminApi from "../../../../../HttpRequest/offerAdminApi";
import useOfferApi from "../hooks/useOfferApi";
import OfferPageHeader from "../components/OfferPageHeader";
import OfferLoadingSpinner from "../components/OfferLoadingSpinner";
import OfferErrorAlert from "../components/OfferErrorAlert";
import OfferTable from "../components/OfferTable";
import SegmentFilter from "../components/SegmentFilter";
import SearchBar from "../components/SearchBar";
import { OFFER_STATUSES } from "../utils/offerConstants";

const PAGE_SIZE = 20;

const OfferHistory = () => {
  const { loading, error, execute, clearError } = useOfferApi();
  const [history, setHistory] = useState([]);
  const [segment, setSegment] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    execute(offerAdminApi.getHistory)
      .then(setHistory)
      .catch(() => {});
  }, [execute]);

  const filtered = useMemo(() => {
    let list = history;
    if (segment) list = list.filter((o) => o.segment === segment);
    if (statusFilter) list = list.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) => String(o.id).includes(q) || o.title?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [history, segment, statusFilter, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <OfferPageHeader
        title="Offer History"
        subtitle="Audit trail for the 3 segments — Deal Fee Free and Subscription Discount only"
      />
      <OfferErrorAlert message={error} onDismiss={clearError} />

      <div className="row g-2 mb-3">
        <div className="col-md-4"><SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} /></div>
        <div className="col-md-3"><SegmentFilter value={segment} onChange={(v) => { setSegment(v); setPage(1); }} /></div>
        <div className="col-md-3">
          <select className="form-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {Object.entries(OFFER_STATUSES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <div className="col-md-2 d-flex align-items-center">
          <span className="badge bg-secondary">{filtered.length} records</span>
        </div>
      </div>

      {loading ? (
        <OfferLoadingSpinner fullPage message="Loading history across all segments..." />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body p-0">
            <OfferTable
              offers={paged}
              columns={["id", "title", "segment", "offerType", "benefit", "status", "generatedAt", "approvedAt"]}
              emptyMessage="No offer history found."
            />
          </div>
          {totalPages > 1 && (
            <div className="card-footer bg-white d-flex justify-content-between">
              <button type="button" className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <span className="small text-muted">Page {page} / {totalPages}</span>
              <button type="button" className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OfferHistory;
