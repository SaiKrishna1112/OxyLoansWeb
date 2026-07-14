import React from "react";
import {
  OFFER_STATUSES,
  getSegmentLabel,
  getOfferTypeLabel,
  formatOfferDate,
  formatRupee,
} from "../utils/offerConstants";

const OfferTable = ({
  offers = [],
  columns = ["id", "title", "segment", "offerType", "status", "generatedAt"],
  onApprove,
  onReject,
  actionLoadingId = null,
  emptyMessage = "No offers found.",
}) => {
  if (!offers.length) {
    return <div className="text-center py-5 text-muted">{emptyMessage}</div>;
  }

  const renderCell = (offer, col) => {
    switch (col) {
      case "id":
        return offer.id;
      case "title":
        return (
          <div>
            <div className="fw-semibold">{offer.title || "—"}</div>
            <small className="text-muted">{offer.benefitSummary}</small>
          </div>
        );
      case "segment":
        return getSegmentLabel(offer.segment) || offer.segment || "—";
      case "offerType":
        return (
          <span className="badge bg-light text-dark">
            {getOfferTypeLabel(offer.offerType)}
          </span>
        );
      case "status": {
        const cfg = OFFER_STATUSES[offer.status] || { label: offer.status, variant: "secondary" };
        return <span className={`badge bg-${cfg.variant}`}>{cfg.label}</span>;
      }
      case "minimumInvestment":
        return formatRupee(offer.minimumInvestment);
      case "participationFeeSaved":
        return formatRupee(offer.participationFeeSaved);
      case "subscriptionDiscountPercent":
        return offer.subscriptionDiscountPercent != null
          ? `${offer.subscriptionDiscountPercent}% off`
          : "—";
      case "generatedAt":
        return formatOfferDate(offer.generatedAt);
      case "approvedAt":
        return formatOfferDate(offer.approvedAt);
      case "rejectedAt":
        return formatOfferDate(offer.rejectedAt);
      case "actions":
        return (
          <div className="d-flex gap-1">
            {onApprove && (
              <button
                type="button"
                className="btn btn-success btn-sm"
                disabled={actionLoadingId === offer.id}
                onClick={() => onApprove(offer.id)}
              >
                Approve
              </button>
            )}
            {onReject && (
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                disabled={actionLoadingId === offer.id}
                onClick={() => onReject(offer.id)}
              >
                Reject
              </button>
            )}
          </div>
        );
      default:
        return offer[col] ?? "—";
    }
  };

  const headers = {
    id: "Offer ID",
    title: "Offer Name",
    segment: "Segment",
    offerType: "Offer Type",
    status: "Status",
    minimumInvestment: "Min Investment",
    participationFeeSaved: "Fee Saved",
    subscriptionDiscountPercent: "Discount",
    generatedAt: "Generated",
    approvedAt: "Approved Date",
    rejectedAt: "Rejected Date",
    actions: "Actions",
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            {columns.map((col) => (
              <th key={col} scope="col">
                {headers[col] || col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <tr key={offer.id}>
              {columns.map((col) => (
                <td key={col}>{renderCell(offer, col)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OfferTable;
