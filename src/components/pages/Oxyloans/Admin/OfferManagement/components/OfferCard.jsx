import React from "react";
import {
  OFFER_STATUSES,
  getSegmentLabel,
  formatOfferDate,
  formatRupee,
} from "../utils/offerConstants";

const StatusBadge = ({ status }) => {
  const cfg = OFFER_STATUSES[status] || { label: status, variant: "secondary" };
  return <span className={`badge bg-${cfg.variant}`}>{cfg.label}</span>;
};

const OfferCard = ({
  offer,
  showActions = false,
  onApprove,
  onReject,
  actionLoading = false,
}) => (
  <div className="card h-100 shadow-sm border-0">
    <div className="card-header bg-white d-flex justify-content-between align-items-start">
      <div>
        <span className="badge bg-light text-dark me-2">#{offer.id}</span>
        <StatusBadge status={offer.status} />
      </div>
      <small className="text-muted">{offer.offerType}</small>
    </div>
    <div className="card-body">
      <h6 className="card-title">{offer.title || "Untitled Offer"}</h6>
      <p className="card-text text-muted small">{offer.message}</p>
      <dl className="row small mb-0">
        <dt className="col-5 text-muted">Segment</dt>
        <dd className="col-7">{getSegmentLabel(offer.segment) || offer.segment || "—"}</dd>
        {offer.minimumInvestment != null && (
          <>
            <dt className="col-5 text-muted">Min investment</dt>
            <dd className="col-7">{formatRupee(offer.minimumInvestment)}</dd>
          </>
        )}
        {offer.participationFeeSaved != null && (
          <>
            <dt className="col-5 text-muted">Fee saved</dt>
            <dd className="col-7 text-success">{formatRupee(offer.participationFeeSaved)}</dd>
          </>
        )}
        {offer.cashbackAmount != null && (
          <>
            <dt className="col-5 text-muted">Cashback</dt>
            <dd className="col-7">{formatRupee(offer.cashbackAmount)}</dd>
          </>
        )}
        <dt className="col-5 text-muted">Generated</dt>
        <dd className="col-7">{formatOfferDate(offer.generatedAt)}</dd>
        {offer.approvedAt && (
          <>
            <dt className="col-5 text-muted">Approved</dt>
            <dd className="col-7">{formatOfferDate(offer.approvedAt)}</dd>
          </>
        )}
      </dl>
    </div>
    {showActions && (
      <div className="card-footer bg-white d-flex gap-2">
        <button
          type="button"
          className="btn btn-success btn-sm flex-fill"
          disabled={actionLoading}
          onClick={() => onApprove(offer.id)}
        >
          Approve
        </button>
        <button
          type="button"
          className="btn btn-outline-danger btn-sm flex-fill"
          disabled={actionLoading}
          onClick={() => onReject(offer.id)}
        >
          Reject
        </button>
      </div>
    )}
  </div>
);

export default OfferCard;
