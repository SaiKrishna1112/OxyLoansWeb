import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

import BorrowerHeader from "../../../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../../../SideBar/BorrowerSidebar";
import Footer from "../../../../../Footer/Footer";

import OfferCard from "../components/OfferCard";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

import {
  borrowerLoanAcceptOrReject,
  borrowerLoanExcute,
  getListOfBorrowerLoansInitiated,
  getRadiusBasedFee,
  getBorrowerEligibleAmount,
} from "../../../../../HttpRequest/afterlogin";
import "../redesign.css";

const Offers = () => {
  const [loanInitiatedInfo, setLoanInitiatedInfo] = useState({
    apiData: [],
    loading: true,
    errorMessage: "",
  });
  const [updatingRowId, setUpdatingRowId] = useState(null);
  const [executingRowId, setExecutingRowId] = useState(null);
  const [processingFees, setProcessingFees] = useState({});
  const [feeSlabs, setFeeSlabs] = useState([]);
  const [eligibleAmount, setEligibleAmount] = useState(null);

  useEffect(() => {
    document.body.classList.add("oxy-redesign-active");
    fetchEligibleAmount();
    fetchLoansInitiated();
    return () => {
      document.body.classList.remove("oxy-redesign-active");
    };
  }, []);

  const fetchEligibleAmount = () => {
    getBorrowerEligibleAmount()
      .then((res) => {
        if (res?.status === 200) setEligibleAmount(res.data?.amount ?? null);
      })
      .catch(() => {});
  };

  const getMatchingSlab = (slabs, distance) =>
    slabs.find((s) => distance >= s.startingKm && distance <= s.endingKm) || null;

  const fetchProcessingFees = async (loans) => {
    try {
      const res = await getRadiusBasedFee();
      const slabs = res?.status === 200 && Array.isArray(res.data) ? res.data : [];
      setFeeSlabs(slabs);
      const fees = {};
      loans.forEach((loan) => {
        const slab = getMatchingSlab(slabs, loan.distance ?? 0);
        fees[loan.id] = slab
          ? ((loan.lenderInterestedAmount ?? 0) * slab.feePercentage) / 100
          : null;
      });
      setProcessingFees(fees);
    } catch {
      setProcessingFees({});
    }
  };

  const fetchLoansInitiated = async () => {
    setLoanInitiatedInfo((prev) => ({ ...prev, loading: true, errorMessage: "" }));
    try {
      const response = await getListOfBorrowerLoansInitiated();
      if (response?.status === 200) {
        const data = Array.isArray(response.data) ? response.data : [];
        setLoanInitiatedInfo({
          apiData: data,
          loading: false,
          errorMessage: "",
        });
        if (data.length > 0) fetchProcessingFees(data);
      } else {
        const errMsg = response?.response?.data?.errorMessage || response?.data?.errorMessage || "";
        const isNoData = errMsg.toLowerCase().includes("no data") || 
                         errMsg.toLowerCase().includes("no record") || 
                         errMsg.toLowerCase().includes("no loan") || 
                         errMsg.toLowerCase().includes("no offer") ||
                         response?.response?.status === 400; // Treat 400 as empty list for offers safely
        setLoanInitiatedInfo({
          apiData: [],
          loading: false,
          errorMessage: isNoData ? "" : (errMsg || "Unable to retrieve loan proposals."),
        });
      }
    } catch (error) {
      setLoanInitiatedInfo({
        apiData: [],
        loading: false,
        errorMessage: "Unable to retrieve loan proposals.",
      });
    }
  };

  const handleAccept = async (offer) => {
    const confirmation = await Swal.fire({
      title: "Accept Offer",
      text: `Do you want to accept the offer of ₹ ${offer.lenderInterestedAmount} from ${offer.lenderName || "Lender"}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Accept Offer",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#006242",
    });

    if (!confirmation.isConfirmed) return;

    setUpdatingRowId(offer.id);
    try {
      const payload = {
        id: offer.id,
        loanRequestId: offer.loanRequestId,
        borrowerId: offer.borrowerId,
        borrowerStatus: "LOANACCEPTED",
      };
      const response = await borrowerLoanAcceptOrReject(payload);
      if (response?.status === 200) {
        Swal.fire("Offer Accepted", "The offer has been accepted. Legal agreement generation is initiated.", "success");
        await fetchLoansInitiated();
      } else {
        Swal.fire("Failed", response?.data?.errorMessage || "Could not accept the offer.", "error");
      }
    } catch (error) {
      Swal.fire("Failed", "An error occurred while accepting the offer.", "error");
    } finally {
      setUpdatingRowId(null);
    }
  };

  const handleReject = async (offer) => {
    const confirmation = await Swal.fire({
      title: "Reject Offer",
      text: `Are you sure you want to decline this proposal?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reject Offer",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ba1a1a",
    });

    if (!confirmation.isConfirmed) return;

    setUpdatingRowId(offer.id);
    try {
      const payload = {
        id: offer.id,
        loanRequestId: offer.loanRequestId,
        borrowerId: offer.borrowerId,
        borrowerStatus: "BORROWER_REJECTED",
      };
      const response = await borrowerLoanAcceptOrReject(payload);
      if (response?.status === 200) {
        Swal.fire("Decline Recorded", "The proposal has been rejected successfully.", "success");
        await fetchLoansInitiated();
      } else {
        Swal.fire("Failed", response?.data?.errorMessage || "Could not reject proposal.", "error");
      }
    } catch (error) {
      Swal.fire("Failed", "An error occurred while rejecting the proposal.", "error");
    } finally {
      setUpdatingRowId(null);
    }
  };

  const handleExecute = async (offer) => {
    const confirmation = await Swal.fire({
      title: "Execute Loan",
      text: "Do you want to confirm and proceed to sign the agreement?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Execute",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#0040e0",
    });

    if (!confirmation.isConfirmed) return;

    setExecutingRowId(offer.id);
    try {
      const payload = {
        loanRequestId: offer.loanRequestId,
        borrowerId: offer.borrowerId,
      };
      const response = await borrowerLoanExcute(payload);
      if (response?.status === 200) {
        Swal.fire("Agreement Prepared", "Execution successful! Please check your document checklist.", "success");
        await fetchLoansInitiated();
      } else {
        Swal.fire("Failed", response?.data?.errorMessage || "Unable to execute loan.", "error");
      }
    } catch (error) {
      Swal.fire("Failed", "An error occurred while executing the loan.", "error");
    } finally {
      setExecutingRowId(null);
    }
  };

  const totalOffersVal = useMemo(() => {
    return loanInitiatedInfo.apiData.reduce((sum, item) => sum + Number(item.lenderInterestedAmount || 0), 0);
  }, [loanInitiatedInfo.apiData]);

  return (
    <div className="main-wrapper">
      <BorrowerHeader />
      <BorrowerSidebar />

      <div className="page-wrapper">
        <div className="content container-fluid py-4" style={{ backgroundColor: "var(--oxy-background)" }}>
          
          <div className="mb-4">
            <h3 className="fw-bold mb-1 text-dark">Lender Offers</h3>
            <span className="text-muted small">Compare offers from lenders and select the best one for your loan.</span>
          </div>

          {/* Metrics summary card */}
          <div className="oxy-metrics-banner mb-4">
            <div className="row align-items-center g-3">
              <div className="col-md-6">
                <span className="text-white-50 d-block small uppercase text-uppercase" style={{ letterSpacing: "0.5px" }}>Total Offers Received</span>
                <h2 className="fw-bold mb-0">₹ {totalOffersVal.toLocaleString("en-IN")}</h2>
              </div>
              <div className="col-md-6 text-md-end">
                <span className="badge rounded-pill px-3 py-2">
                  Eligible Limit: ₹ {eligibleAmount ? eligibleAmount.toLocaleString("en-IN") : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Conditional rendering of states */}
          {loanInitiatedInfo.loading ? (
            <LoadingState count={3} type="card" />
          ) : loanInitiatedInfo.errorMessage ? (
            <ErrorState message={loanInitiatedInfo.errorMessage} onRetry={fetchLoansInitiated} />
          ) : loanInitiatedInfo.apiData.length === 0 ? (
            <EmptyState 
              title="No Offers Matching Yet" 
              description="Lenders are currently evaluating your loan request details. You will receive real-time bids shortly."
              icon="fa-hand-holding-hand"
            />
          ) : (
            <div className="row g-4">
              {loanInitiatedInfo.apiData.map((offer) => (
                <OfferCard 
                  key={offer.id} 
                  offer={offer} 
                  processingFee={processingFees[offer.id]}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onExecute={handleExecute}
                  updatingRowId={updatingRowId}
                  executingRowId={executingRowId}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Offers;
