import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { goBackOrAdminAI } from "./adminAINavigation";
import { FaArrowLeft, FaWallet } from "react-icons/fa";
import OxyloansAdminSidebar from "../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../Header/OxyloansAdminHeader";
import Footer from "../../../Footer/Footer";
import { getAdminAIWalletLoadedUsers } from "../../../HttpRequest/admin";
import "./AdminAIDashboard.css";

const fmt = (n) => (n == null ? "-" : Number(n).toLocaleString("en-IN"));
const fmtDate = (v) => String(v || "").slice(0, 10) || "-";

const AdminAIWalletLoadedUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [date, setDate] = useState("");

  const load = (d) => {
    setLoading(true);
    setError(null);
    getAdminAIWalletLoadedUsers(d || undefined)
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data || data?.users || [];
        setUsers(list);
      })
      .catch(() => setError("Failed to load wallet-loaded users."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(""); }, []);

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="d-flex align-items-center gap-2 mb-3">
            <button className="btn btn-sm btn-outline-secondary" onClick={() => goBackOrAdminAI(navigate)}>
              <FaArrowLeft />
            </button>
            <FaWallet className="text-primary" />
            <h4 className="mb-0">Wallet Loaded — Not Yet Participated</h4>
          </div>

          <div className="d-flex gap-2 mb-3">
            <input
              type="date"
              className="form-control"
              style={{ maxWidth: 180 }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <button className="btn btn-primary btn-sm" onClick={() => load(date)}>Filter</button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => { setDate(""); load(""); }}>Clear</button>
          </div>

          {loading && <p className="text-muted">Loading…</p>}
          {error && <p className="text-danger">{error}</p>}

          {!loading && !error && (
            <div className="table-responsive">
              <table className="table table-sm table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th>Email</th>
                    <th>Wallet Balance (₹)</th>
                    <th>Loaded On</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={7} className="text-center text-muted">No records found.</td></tr>
                  ) : users.map((u, i) => (
                    <tr key={u.userId || i}>
                      <td>{i + 1}</td>
                      <td>{u.userId || "-"}</td>
                      <td>{u.name || u.fullName || "-"}</td>
                      <td>{u.mobile || u.mobileNumber || "-"}</td>
                      <td>{u.email || "-"}</td>
                      <td>{fmt(u.walletBalance ?? u.balance)}</td>
                      <td>{fmtDate(u.loadedOn ?? u.createdOn)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length > 0 && (
                <p className="text-muted small">{users.length} user{users.length !== 1 ? "s" : ""} found.</p>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminAIWalletLoadedUsers;
