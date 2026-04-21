import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../../../config";
import AdminSidebar from "../../../SideBar/AdminSidebar";

const SETTING_LABELS = {
  disbursalWindowStart: { label: "Disbursal Window Start (day)", desc: "Day of month disbursal starts" },
  disbursalWindowEnd: { label: "Disbursal Window End (day)", desc: "Day of month disbursal ends" },
  repaymentWindowStart: { label: "Repayment Window Start (day)", desc: "Day of month repayment window starts" },
  repaymentWindowEnd: { label: "Repayment Window End (day)", desc: "Day of month repayment window ends" },
  firstLoanDBRPercent: { label: "First Loan DBR % (eligibility)", desc: "% of eligible amount for first loan" },
  maxLenderAmountPerBorrower: { label: "Max Lender Amount Per Borrower (₹)", desc: "Max ₹ a lender can lend to one borrower" },
  processingFeePercent: { label: "Processing Fee %", desc: "Processing fee on loan amount" },
  minOxyScore: { label: "Min OxyScore to be funded", desc: "Minimum OxyScore required" },
  bouncePenaltyPercent: { label: "Bounce Penalty % per day", desc: "Daily penalty on bounce" },
  partialFundingWaitDays: { label: "Partial Funding Wait Days", desc: "Extra days after deadline for partial funding" },
  dbrLimitPercent: { label: "DBR Limit %", desc: "Max % of monthly income for EMI obligations" },
  fundingDeadlineDays: { label: "Funding Deadline (days)", desc: "Days from posting until funding deadline" },
  gstPercent: { label: "GST % on Processing Fee", desc: "GST applied on processing fee" },
};

export default function AdminSettings() {
  const [settings, setSettings] = useState([]);
  const [editValues, setEditValues] = useState({});
  const [changelog, setChangelog] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("settings");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchSettings();
    fetchChangelog();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/v1/admin/settings`, {
        headers: { userId },
      });
      setSettings(res.data);
      const vals = {};
      res.data.forEach((s) => (vals[s.settingKey] = s.settingValue));
      setEditValues(vals);
    } catch (e) {
      setMessage("Failed to load settings");
    }
  };

  const fetchChangelog = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/v1/admin/settings/changelog`, {
        headers: { userId },
      });
      setChangelog(res.data);
    } catch (_) {}
  };

  const handleChange = (key, val) => {
    setEditValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setMessage("");
    try {
      await axios.put(
        `${BASE_URL}/v1/admin/settings`,
        {
          settings: editValues,
          adminName: localStorage.getItem("userName") || "Admin",
          remarks: "Bulk update from Admin Settings page",
        },
        { headers: { userId } }
      );
      setMessage("✅ Settings saved successfully!");
      fetchSettings();
      fetchChangelog();
    } catch (e) {
      setMessage("❌ Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOne = async (key) => {
    setSaving(true);
    setMessage("");
    try {
      await axios.put(
        `${BASE_URL}/v1/admin/settings/${key}`,
        {
          value: editValues[key],
          adminName: localStorage.getItem("userName") || "Admin",
          remarks: "Updated from Admin Settings page",
        },
        { headers: { userId } }
      );
      setMessage(`✅ ${key} updated`);
      fetchChangelog();
    } catch (e) {
      setMessage(`❌ Failed to update ${key}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="d-flex">
      <AdminSidebar />
      <div className="flex-grow-1 p-4" style={{ background: "#f8f9fa", minHeight: "100vh" }}>
        <h3 className="mb-1" style={{ color: "#1a237e" }}>Admin Settings</h3>
        <p className="text-muted mb-4">Configure global platform settings. Changes take effect immediately.</p>

        {message && (
          <div className={`alert ${message.startsWith("✅") ? "alert-success" : "alert-danger"} py-2`}>
            {message}
          </div>
        )}

        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => setActiveTab("settings")}
            >Settings</button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "changelog" ? "active" : ""}`}
              onClick={() => setActiveTab("changelog")}
            >Change Log</button>
          </li>
        </ul>

        {activeTab === "settings" && (
          <div className="card shadow-sm">
            <div className="card-body">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Setting</th>
                    <th>Description</th>
                    <th style={{ width: 160 }}>Value</th>
                    <th style={{ width: 80 }}>Save</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(SETTING_LABELS).map((key) => {
                    const meta = SETTING_LABELS[key];
                    return (
                      <tr key={key}>
                        <td><strong>{meta.label}</strong></td>
                        <td className="text-muted small">{meta.desc}</td>
                        <td>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={editValues[key] || ""}
                            onChange={(e) => handleChange(key, e.target.value)}
                          />
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleSaveOne(key)}
                            disabled={saving}
                          >
                            Save
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="text-end mt-3">
                <button
                  className="btn btn-primary px-4"
                  onClick={handleSaveAll}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save All Settings"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "changelog" && (
          <div className="card shadow-sm">
            <div className="card-body">
              <table className="table table-sm table-striped">
                <thead className="table-dark">
                  <tr>
                    <th>Setting</th>
                    <th>Old Value</th>
                    <th>New Value</th>
                    <th>Changed By</th>
                    <th>When</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {changelog.length === 0 ? (
                    <tr><td colSpan="6" className="text-center text-muted">No changes yet</td></tr>
                  ) : changelog.map((log, i) => (
                    <tr key={i}>
                      <td>{log.settingKey}</td>
                      <td className="text-danger">{log.oldValue}</td>
                      <td className="text-success">{log.newValue}</td>
                      <td>{log.changedByName || log.changedBy}</td>
                      <td>{log.changedAt ? new Date(log.changedAt).toLocaleString() : ""}</td>
                      <td>{log.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
