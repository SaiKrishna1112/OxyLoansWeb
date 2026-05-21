import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../../../config";

export default function AgreementPage() {
  const { loanRequestId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!loanRequestId) return;
    axios
      .get(`${BASE_URL}/v1/marketplace/agreement/${loanRequestId}`, {
        headers: { userId },
      })
      .then((r) => { setData(r.data); setLoading(false); })
      .catch((e) => {
        const msg = e.response?.data?.error || "Agreement not yet generated.";
        setError(msg);
        setLoading(false);
      });
  }, [loanRequestId]);

  const handleDownload = () => {
    const role = data?.role || "BORROWER";
    const url = `${BASE_URL}/v1/marketplace/agreement/${loanRequestId}/download?role=${role}`;
    window.open(url, "_blank");
  };

  if (loading) return <div className="text-center p-5"><div className="spinner-border" /></div>;

  return (
    <div className="container-fluid" style={{ background: "#f5f5f5", minHeight: "100vh", padding: "24px" }}>
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-6">
          <div className="card shadow">
            <div className="card-header text-white text-center" style={{ background: "#1a237e" }}>
              <h5 className="mb-0">Loan Agreement</h5>
              <small>Loan #{loanRequestId}</small>
            </div>
            <div className="card-body">
              {error ? (
                <div className="alert alert-warning text-center">
                  <i className="fa fa-clock me-2" />
                  {error}
                  <div className="mt-2 text-muted small">
                    The agreement is generated automatically once both parties complete eSign. Please check back soon.
                  </div>
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <div className="text-muted small">Role</div>
                      <span className="badge bg-primary fs-6">{data?.role}</span>
                    </div>
                    <div className="text-end">
                      <div className="text-muted small">Status</div>
                      <span className={`badge ${data?.status === "GENERATED" ? "bg-success" : "bg-warning"}`}>
                        {data?.status}
                      </span>
                    </div>
                  </div>

                  {data?.generatedAt && (
                    <div className="mb-3 text-muted small">
                      Generated: {new Date(data.generatedAt).toLocaleString("en-IN")}
                    </div>
                  )}

                  {data?.agreementUrl && (
                    <div className="d-grid gap-2">
                      <button className="btn btn-success btn-lg" onClick={handleDownload}>
                        <i className="fa fa-download me-2" />
                        Download Agreement PDF
                      </button>
                    </div>
                  )}

                  {data?.role === "ADMIN" && (
                    <div className="mt-3 d-grid gap-2">
                      {data?.borrowerAgreementUrl && (
                        <a href={data.borrowerAgreementUrl} target="_blank" rel="noreferrer"
                           className="btn btn-outline-primary">
                          Borrower Agreement PDF
                        </a>
                      )}
                      {data?.lenderAgreementUrl && (
                        <a href={data.lenderAgreementUrl} target="_blank" rel="noreferrer"
                           className="btn btn-outline-secondary">
                          Lender Agreement PDF
                        </a>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="card-footer text-center">
              <Link to="/my-marketplace-loans" className="btn btn-outline-secondary btn-sm">
                Back to My Loans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
