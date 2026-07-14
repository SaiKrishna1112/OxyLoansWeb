import React, { useEffect, useState, useCallback } from "react";
import offerAdminApi from "../../../../../HttpRequest/offerAdminApi";
import useOfferApi from "../hooks/useOfferApi";
import OfferPageHeader from "../components/OfferPageHeader";
import OfferLoadingSpinner from "../components/OfferLoadingSpinner";
import OfferErrorAlert from "../components/OfferErrorAlert";
import OfferToast from "../components/OfferToast";
import ConfirmModal from "../components/ConfirmModal";
import OfferCard from "../components/OfferCard";
import {
  OFFER_SEGMENTS,
  getSegmentLabel,
  getSegmentDescription,
  getDefaultOfferType,
  getOfferTypeLabel,
} from "../utils/offerConstants";

const PendingOffers = () => {
  const { loading, error, execute, clearError } = useOfferApi();
  const [segment, setSegment] = useState("NEW_LENDER");
  const [offers, setOffers] = useState([]);
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState(null);

  const loadOffers = useCallback(async () => {
    if (!segment) return;
    try {
      const data = await execute(offerAdminApi.getPendingOffers, segment);
      setOffers(data || []);
    } catch {
      setOffers([]);
    }
  }, [execute, segment]);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  const approveHint = (offer) => {
    const type = offer?.offerType || getDefaultOfferType(segment);
    if (type === "FIRST_DEAL_FREE") {
      return " Approving links eligible users. After they claim via fee-waived participation, they receive 1 free month membership.";
    }
    if (type === "SUBSCRIPTION_DISCOUNT") {
      return " Approving links Regular lenders at/above median rate so they can use the membership % discount.";
    }
    return "";
  };

  const handleAction = async () => {
    if (!modal) return;
    setActionLoading(true);
    try {
      if (modal.action === "approve") {
        const result = await offerAdminApi.approveOffer(modal.offerId);
        const count = result?.assignedUsersCount ?? 0;
        setToast(`Offer #${modal.offerId} approved — linked to ${count} eligible users`);
      } else {
        await offerAdminApi.rejectOffer(modal.offerId);
        setToast(`Offer #${modal.offerId} rejected`);
      }
      setModal(null);
      await loadOffers();
    } catch {
      setToast(null);
      clearError();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <OfferPageHeader
        title="Pending Approval"
        subtitle="Review fixed segment offers — one offer type per segment"
      >
        <button type="button" className="btn btn-outline-primary btn-sm" onClick={loadOffers} disabled={loading}>
          Refresh
        </button>
      </OfferPageHeader>
      <OfferErrorAlert message={error} onDismiss={clearError} />
      <OfferToast message={toast} onClose={() => setToast(null)} />

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-6">
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
              <div className="form-text">{getSegmentDescription(segment)}</div>
              <div className="small mt-1">
                Expected offer:{" "}
                <span className="badge bg-light text-dark border">
                  {getOfferTypeLabel(getDefaultOfferType(segment))}
                </span>
              </div>
            </div>
            <div className="col-md-6 d-flex align-items-center">
              <span className="badge bg-warning text-dark fs-6">
                {offers.length} pending in {getSegmentLabel(segment)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        show={!!modal}
        title={modal?.action === "approve" ? "Approve Offer" : "Reject Offer"}
        message={
          modal
            ? `Are you sure you want to ${modal.action} offer #${modal.offerId}?${
                modal.action === "approve" ? approveHint(modal.offer) : ""
              }`
            : ""
        }
        confirmLabel={modal?.action === "approve" ? "Approve" : "Reject"}
        confirmVariant={modal?.action === "approve" ? "success" : "danger"}
        onConfirm={handleAction}
        onCancel={() => setModal(null)}
        loading={actionLoading}
      />

      {loading ? (
        <OfferLoadingSpinner fullPage message={`Loading pending offers for ${getSegmentLabel(segment)}...`} />
      ) : offers.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <h5>No pending offers for this segment</h5>
          <p>Generate offers for {getSegmentLabel(segment)} from the Generate Offers page.</p>
        </div>
      ) : (
        <div className="row g-3">
          {offers.map((offer) => (
            <div key={offer.id} className="col-md-6 col-xl-4">
              <OfferCard
                offer={{ ...offer, segment: offer.segment || segment, status: offer.status || "GENERATED" }}
                showActions
                actionLoading={actionLoading}
                onApprove={(id) => setModal({ action: "approve", offerId: id, offer })}
                onReject={(id) => setModal({ action: "reject", offerId: id, offer })}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingOffers;
