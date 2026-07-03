import React, { useState, useEffect } from "react";
import OxyloansAdminSidebar from "../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../Header/OxyloansAdminHeader";
import Footer from "../../../Footer/Footer";
import { getAdminAIPlatformStats } from "../../../HttpRequest/afterlogin";
import AdminNotificationPanel from "./Notification/AdminNotificationPanel";

const fmt = (n) =>
  n == null ? "—" : "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
const fmtNum = (n) =>
  n == null ? "—" : Number(n).toLocaleString("en-IN");

const AdminAIDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAdminAIPlatformStats()
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load AI platform stats.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />

      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">AI Platform Stats</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item">Admin</li>
                  <li className="breadcrumb-item active">AI Platform Stats</li>
                </ul>
              </div>
            </div>
          </div>

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2">Loading platform stats…</p>
            </div>
          )}
          {error && <div className="alert alert-danger">{error}</div>}

          {!loading && <AdminNotificationPanel />}

          {data && (
            <>
              {/* Platform summary */}
              {data.users && (
                <div className="row">
                  <StatCard label="Total Lenders"   value={fmtNum(data.users.totalLenders)}   color="#6366f1" />
                  <StatCard label="Active Lenders"  value={fmtNum(data.users.activeLenders)}  color="#22c55e" />
                  <StatCard label="Total Borrowers" value={fmtNum(data.users.totalBorrowers)} color="#0ea5e9" />
                  <StatCard label="Total Deployed"  value={fmt(data.users.totalDeployed)}     color="#f59e0b" />
                </div>
              )}

              {/* FY History Table */}
              {data.fyHistory && data.fyHistory.length > 0 && (
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header"><h5 className="mb-0">Financial Year History</h5></div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead className="thead-light">
                              <tr>
                                <th>FY</th>
                                <th>Lenders</th>
                                <th>Interest Paid</th>
                                <th>Principal Returned</th>
                                <th>Total Paid</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.fyHistory.map((fy, i) => (
                                <tr key={i}>
                                  <td><strong>{fy.fyLabel}</strong></td>
                                  <td>{fmtNum(fy.lendersCount)}</td>
                                  <td>{fmt(fy.interestPaid)}</td>
                                  <td>{fmt(fy.principalReturned)}</td>
                                  <td>{fmt(fy.totalPaid)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Lenders */}
              {data.topLenders && data.topLenders.length > 0 && (
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header"><h5 className="mb-0">Top Lenders (Current FY)</h5></div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead className="thead-light">
                              <tr>
                                <th>#</th>
                                <th>Lender</th>
                                <th>City</th>
                                <th>Total Invested</th>
                                <th>Interest Earned</th>
                                <th>Active Deals</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.topLenders.map((l, i) => (
                                <tr key={i}>
                                  <td>{i + 1}</td>
                                  <td>{l.lenderName}</td>
                                  <td>{l.city || "—"}</td>
                                  <td>{fmt(l.totalInvested)}</td>
                                  <td>{fmt(l.totalInterestEarned)}</td>
                                  <td>{l.activeDeals}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Monthly Trend */}
              {data.monthlyTrend && data.monthlyTrend.length > 0 && (
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header"><h5 className="mb-0">Monthly Trend (Last 12 Months)</h5></div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead className="thead-light">
                              <tr>
                                <th>Month</th>
                                <th>Interest Paid</th>
                                <th>Principal Returned</th>
                                <th>Total Paid</th>
                                <th>Lenders</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.monthlyTrend.map((m, i) => (
                                <tr key={i}>
                                  <td><strong>{m.monthLabel}</strong></td>
                                  <td>{fmt(m.interestPaid)}</td>
                                  <td>{fmt(m.principalReturned)}</td>
                                  <td>{fmt(m.totalPaid)}</td>
                                  <td>{fmtNum(m.lendersCount)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="col-md-3 col-sm-6 mb-3">
    <div className="card h-100" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="card-body py-3">
        <p className="text-muted mb-1" style={{ fontSize: 12 }}>{label}</p>
        <h4 className="mb-0" style={{ color, fontWeight: 700 }}>{value}</h4>
      </div>
    </div>
  </div>
);

export default AdminAIDashboard;
