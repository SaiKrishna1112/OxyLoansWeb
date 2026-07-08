import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMyLenderOffers } from "../../../HttpRequest/afterlogin";
import Header from "../../../Header/Header";
import Sidebar from "../../../SideBar/SideBar";

const STATUS_CONFIG = {
  PENDING: { color: "warning", label: "Awaiting Borrower Response" },
  COUNTER_OFFERED: { color: "info", label: "Borrower Countered" },
  ACCEPTED: { color: "success", label: "Accepted" },
  REJECTED: { color: "danger", label: "Rejected" },
  EXPIRED: { color: "secondary", label: "Expired" },
};

function fmt(n) {
  return Number(n).toLocaleString("en-IN");
}

export default function MyOffers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyLenderOffers();
      setOffers(res?.data || []);
    } catch (e) {
      setError("Failed to load your offers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const filtered = filter === "ALL" ? offers : offers.filter((o) => o.status === filter);

  const counts = offers.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="main-wrapper">
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Header />
        <div className="page-wrapper">
          <div className="content container-fluid">
            <div className="page-header">
              <div className="row align-items-center">
                <div className="col">
                  <h3 className="page-title">My Offers</h3>
                  <p className="text-muted">Track all offers you have made on marketplace loan requests.</p>
                </div>
                <div className="col-auto">
                  <button className="btn btn-outline-primary btn-sm" onClick={fetchOffers}>
                    <i className="fa fa-refresh me-1" /> Refresh
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="row mb-3">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <div key={key} className="col-6 col-md-2 mb-2">
                  <div
                    className={`card border-${cfg.color} text-center py-2 cursor-pointer`}
                    style={{ cursor: "pointer" }}
                    onClick={() => setFilter(filter === key ? "ALL" : key)}
                  >
                    <div className={`card-body p-2`}>
                      <h4 className={`text-${cfg.color} mb-0`}>{counts[key] || 0}</h4>
                      <small className="text-muted">{cfg.label}</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filter bar */}
            <div className="mb-3 d-flex gap-2 flex-wrap">
              {["ALL", "PENDING", "COUNTER_OFFERED", "ACCEPTED", "REJECTED", "EXPIRED"].map((f) => (
                <button
                  key={f}
                  className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline-secondary"}`}
                  onClick={() => setFilter(f)}
                >
                  {f === "ALL" ? `All (${offers.length})` : `${STATUS_CONFIG[f]?.label || f} (${counts[f] || 0})`}
                </button>
              ))}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="card">
                <div className="card-body text-center py-5">
                  <i className="fa fa-handshake fa-3x text-muted mb-3" />
                  <h5>{filter === "ALL" ? "No offers made yet" : `No ${filter} offers`}</h5>
                  <p className="text-muted">Browse marketplace loans and make offers to borrowers.</p>
                  <button className="btn btn-primary" onClick={() => navigate("/marketplace-loans")}>
                    Browse Loans
                  </button>
                </div>
              </div>
            ) : (
              <div className="card">
                <div className="card-body p-0">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Loan Request</th>
                        <th>My Offered Rate</th>
                        <th>Amount</th>
                        <th>Borrower Counter</th>
                        <th>Status</th>
                        <th>Expires</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((offer) => {
                        const cfg = STATUS_CONFIG[offer.status] || { color: "secondary", label: offer.status };
                        return (
                          <tr key={offer.id}>
                            <td>
                              <strong>Loan #{offer.loanRequestId}</strong>
                            </td>
                            <td><strong>{offer.offeredRate}%</strong></td>
                            <td>₹{fmt(offer.offeredAmount)}</td>
                            <td>
                              {offer.counterRate ? (
                                <span className="text-info fw-bold">{offer.counterRate}%</span>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge bg-${cfg.color}`}>{cfg.label}</span>
                            </td>
                            <td>
                              <small className="text-muted">
                                {offer.expiresAt ? new Date(offer.expiresAt).toLocaleDateString("en-IN") : "—"}
                              </small>
                            </td>
                            <td>
                              {offer.status === "ACCEPTED" ? (
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => navigate(`/lender-consent/${offer.loanRequestId}`)}
                                >
                                  Give Consent
                                </button>
                              ) : offer.status === "COUNTER_OFFERED" ? (
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => navigate(`/negotiation/${offer.loanRequestId}`)}
                                >
                                  View &amp; Respond
                                </button>
                              ) : (
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => navigate(`/negotiation/${offer.loanRequestId}`)}
                                >
                                  View
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
