import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import BorrowerHeader from "../../../../../Header/BorrowerHeader";
import BorrowerSidebar from "../../../../../SideBar/BorrowerSidebar";
import Footer from "../../../../../Footer/Footer";

import DocumentChecklist from "../components/DocumentChecklist";
import LoadingState from "../components/LoadingState";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

import { getMyMarketplaceLoans, base_url } from "../../../../../HttpRequest/afterlogin";
import "../redesign.css";

const Documents = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState(null);

  useEffect(() => {
    document.body.classList.add("oxy-redesign-active");
    fetchLoans();
    return () => {
      document.body.classList.remove("oxy-redesign-active");
    };
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyMarketplaceLoans();
      const list = res?.data || [];
      setLoans(list);
      
      // Auto select the first loan that has active paperwork pending
      const activePaperworkLoan = list.find(l => 
        ["CONSENT_PENDING", "CONSENTED", "ESIGN_PENDING", "ESIGN_DONE", "ENACH_INITIATED", "ENACH_APPROVED"].includes(l.loanStatus)
      );
      if (activePaperworkLoan) {
        setSelectedLoanId(activePaperworkLoan.loanRequestId);
      } else if (list.length > 0) {
        setSelectedLoanId(list[0].loanRequestId);
      }
    } catch (e) {
      setError("Unable to retrieve marketplace loan documents.");
    } finally {
      setLoading(false);
    }
  };

  const selectedLoan = loans.find(l => l.loanRequestId === selectedLoanId);

  const handleEsign = () => {
    if (selectedLoan) navigate(`/esign/${selectedLoan.loanRequestId}`);
  };

  const handleEnach = () => {
    if (selectedLoan) navigate(`/enach/${selectedLoan.loanRequestId}`);
  };

  const handleDownload = () => {
    if (selectedLoan) {
      const url = `${base_url}agreement/download/${selectedLoan.loanRequestId}`;
      window.open(url, "_blank");
    }
  };

  // Maps statuses to simple document checklist state values
  const documentStates = (() => {
    if (!selectedLoan) return { agreementGenerated: false, esignedStatus: false, enachStatus: false };
    const status = String(selectedLoan.loanStatus).toUpperCase().trim();
    
    const isConsentDone = ["CONSENTED", "ESIGN_PENDING", "ESIGN_DONE", "ENACH_INITIATED", "ENACH_APPROVED", "DISBURSAL_PENDING", "DISBURSED"].includes(status);
    const isEsignDone = ["ESIGN_DONE", "ENACH_INITIATED", "ENACH_APPROVED", "DISBURSAL_PENDING", "DISBURSED"].includes(status);
    const isEnachDone = ["ENACH_APPROVED", "DISBURSAL_PENDING", "DISBURSED"].includes(status);

    return {
      agreementGenerated: isConsentDone,
      esignedStatus: isEsignDone,
      enachStatus: isEnachDone
    };
  })();

  return (
    <div className="main-wrapper">
      <BorrowerHeader />
      <BorrowerSidebar />

      <div className="page-wrapper">
        <div className="content container-fluid py-4" style={{ backgroundColor: "var(--oxy-background)" }}>
          
          <div className="mb-4">
            <h3 className="fw-bold mb-1 text-dark">Document Signing</h3>
            <span className="text-muted small">Verify and sign your loan agreements securely using Aadhaar eSign and eNACH auto-pay mandates.</span>
          </div>

          {loading ? (
            <LoadingState count={1} type="table" />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchLoans} />
          ) : loans.length === 0 ? (
            <EmptyState 
              title="No Documents Outstanding" 
              description="You do not have any active loan requests in the signing phase. Please accept a proposal from the offers tab first."
              icon="fa-file-shield"
              actionText="View Offers"
              onAction={() => navigate("/borrowerLoansInitiated")}
            />
          ) : (
            <div className="row g-4">
              
              {/* Left Column: Loan Selector list */}
              <div className="col-lg-4">
                <div className="oxy-card">
                  <h6 className="fw-bold mb-3 text-dark">Active Applications</h6>
                  <div className="space-y-2">
                    {loans.map((l) => (
                      <div 
                        key={l.loanRequestId}
                        className={`p-3 border rounded-3 cursor-pointer transition-all mb-2 ${selectedLoanId === l.loanRequestId ? "border-primary bg-primary bg-opacity-5" : "bg-light"}`}
                        onClick={() => setSelectedLoanId(l.loanRequestId)}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="d-flex justify-content-between mb-2">
                          <span className="fw-bold text-dark">₹ {Number(l.loanAmount).toLocaleString("en-IN")}</span>
                          <span className="badge bg-secondary-container text-secondary small text-xs">{l.loanStatus}</span>
                        </div>
                        <span className="text-muted small d-block" style={{ fontSize: "11px" }}>LR ID: {l.loanRequestId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Reusable DocumentChecklist component */}
              <div className="col-lg-8">
                {selectedLoan ? (
                  <DocumentChecklist 
                    esignedStatus={documentStates.esignedStatus}
                    enachStatus={documentStates.enachStatus}
                    agreementGenerated={documentStates.agreementGenerated}
                    agreementDownloadUrl={true} // trigger download button if agreement generated
                    onEsign={handleEsign}
                    onEnach={handleEnach}
                    onDownload={handleDownload}
                  />
                ) : (
                  <div className="oxy-card text-center py-5">
                    <span className="text-muted">Select an application from the sidebar to inspect signing checklist status.</span>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Documents;
