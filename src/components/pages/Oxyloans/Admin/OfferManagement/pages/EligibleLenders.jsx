import React, { useEffect, useState, useMemo } from "react";
import offerAdminApi from "../../../../../HttpRequest/offerAdminApi";
import useOfferApi from "../hooks/useOfferApi";
import OfferPageHeader from "../components/OfferPageHeader";
import OfferLoadingSpinner from "../components/OfferLoadingSpinner";
import OfferErrorAlert from "../components/OfferErrorAlert";
import SearchBar from "../components/SearchBar";
import SegmentFilter from "../components/SegmentFilter";
import {
  getSegmentLabel,
  getOfferTypeLabel,
} from "../utils/offerConstants";

const PAGE_SIZE = 15;

const formatRate = (rate) => {
  if (rate == null || rate === "") return "—";
  const n = Number(rate);
  if (Number.isNaN(n)) return "—";
  return n.toFixed(2);
};

const EligibleLenders = () => {
  const { loading, error, execute, clearError } = useOfferApi();
  const [lenders, setLenders] = useState([]);
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    execute(offerAdminApi.getEligibleLenders)
      .then(setLenders)
      .catch(() => {});
  }, [execute]);

  const filtered = useMemo(() => {
    let list = lenders;
    if (segmentFilter) list = list.filter((l) => l.segment === segmentFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          String(l.userId).includes(q) ||
          l.name?.toLowerCase().includes(q) ||
          l.mobile?.includes(q)
      );
    }
    return list;
  }, [lenders, segmentFilter, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <OfferPageHeader
        title="Eligible Lenders"
        subtitle="Classified by deal count & inactive days — Regular discount only when rate ≥ median"
      />
      <OfferErrorAlert message={error} onDismiss={clearError} />

      <div className="row g-2 mb-3">
        <div className="col-md-6">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by ID, name, mobile..." />
        </div>
        <div className="col-md-4">
          <SegmentFilter value={segmentFilter} onChange={(v) => { setSegmentFilter(v); setPage(1); }} />
        </div>
        <div className="col-md-2 d-flex align-items-center">
          <span className="badge bg-primary fs-6">{filtered.length} lenders</span>
        </div>
      </div>

      {loading ? (
        <OfferLoadingSpinner fullPage />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Segment</th>
                  <th>Deals</th>
                  <th>Inactive days</th>
                  <th>Part. rate</th>
                  <th>Offer</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-5">No lenders found</td>
                  </tr>
                ) : (
                  paged.map((l) => (
                    <tr key={`${l.userId}-${l.segment}`}>
                      <td>{l.userId}</td>
                      <td className="fw-semibold">{l.name}</td>
                      <td>{l.mobile}</td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {getSegmentLabel(l.segment)}
                        </span>
                      </td>
                      <td>{l.dealCount ?? 0}</td>
                      <td>{l.daysInactive ?? "—"}</td>
                      <td>{formatRate(l.participationRate)}</td>
                      <td className="small">
                        {l.segment === "REGULAR_PARTICIPANT" && !l.discountOfferEligible ? (
                          <span className="text-muted">No discount (below median)</span>
                        ) : (
                          getOfferTypeLabel(l.offerType)
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="card-footer bg-white d-flex justify-content-between align-items-center">
              <button type="button" className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <span className="small text-muted">Page {page} of {totalPages}</span>
              <button type="button" className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EligibleLenders;
