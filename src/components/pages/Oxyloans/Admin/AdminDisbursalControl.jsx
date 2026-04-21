import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Table, Tag, Modal, Input, DatePicker, Select, InputNumber, Tooltip, Checkbox } from "antd";
import dayjs from "dayjs";
import Header from "../../../Header/OxyloansAdminHeader";
import Sidebar from "../../../SideBar/OxyloansAdminSidebar";
import {
  getAdminPendingDisbursalLoans,
  setDisbursalDate,
  setRepaymentDate,
  triggerDisbursal,
  bulkUpdateDisbursalDates,
  getDisbursalAuditLog,
  getDisbursalChecklist,
  approveAndDisburse,
} from "../../../HttpRequest/afterlogin";

const { Option } = Select;

const formatINR = (n) =>
  Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

const statusColor = (s) => {
  if (!s) return "default";
  s = s.toUpperCase();
  if (s === "ENACH_APPROVED") return "green";
  if (s === "DISBURSAL_PENDING") return "blue";
  return "default";
};

const AdminDisbursalControl = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState([]);

  // Date-set modal
  const [dateModal, setDateModal] = useState({ visible: false, loan: null });
  const [dateForm, setDateForm] = useState({ disbursalDate: null, firstRepaymentDate: null, emiDayOfMonth: null, gracePeriodDays: 3, remarks: "" });
  const [saving, setSaving] = useState(false);

  // Trigger disbursal confirm
  const [triggerModal, setTriggerModal] = useState({ visible: false, loan: null, remarks: "" });
  const [triggering, setTriggering] = useState(false);

  // Audit log modal
  const [auditModal, setAuditModal] = useState({ visible: false, logs: [], loanId: null, loading: false });

  // Bulk update modal
  const [bulkModal, setBulkModal] = useState({ visible: false });
  const [bulkForm, setBulkForm] = useState({ disbursalDate: null, firstRepaymentDate: null });
  const [bulkSaving, setBulkSaving] = useState(false);

  // Checklist modal
  const [checklistModal, setChecklistModal] = useState({ visible: false, loanId: null, data: null, loading: false });
  const [approving, setApproving] = useState(false);
  const [approveMsg, setApproveMsg] = useState("");

  const loadLoans = useCallback(() => {
    setLoading(true);
    setError("");
    getAdminPendingDisbursalLoans()
      .then((res) => { if (res.status === 200) setLoans(res.data || []); })
      .catch(() => setError("Failed to load loans."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadLoans(); }, [loadLoans]);

  const openDateModal = (loan) => {
    setDateForm({
      disbursalDate: loan.disbursalDate ? dayjs(loan.disbursalDate) : null,
      firstRepaymentDate: loan.firstRepaymentDate ? dayjs(loan.firstRepaymentDate) : null,
      emiDayOfMonth: loan.emiDayOfMonth || null,
      gracePeriodDays: loan.gracePeriodDays || 3,
      remarks: "",
    });
    setDateModal({ visible: true, loan });
  };

  const saveDates = async () => {
    const { loan } = dateModal;
    setSaving(true);
    try {
      if (dateForm.disbursalDate) {
        await setDisbursalDate(loan.internalId, dateForm.disbursalDate.format("YYYY-MM-DD"), dateForm.remarks);
      }
      if (dateForm.firstRepaymentDate || dateForm.emiDayOfMonth != null || dateForm.gracePeriodDays != null) {
        const payload = { remarks: dateForm.remarks };
        if (dateForm.firstRepaymentDate) payload.firstRepaymentDate = dateForm.firstRepaymentDate.format("YYYY-MM-DD");
        if (dateForm.emiDayOfMonth != null) payload.emiDayOfMonth = dateForm.emiDayOfMonth;
        if (dateForm.gracePeriodDays != null) payload.gracePeriodDays = dateForm.gracePeriodDays;
        await setRepaymentDate(loan.internalId, payload);
      }
      setDateModal({ visible: false, loan: null });
      loadLoans();
    } catch (e) {
      alert("Error saving dates: " + (e?.response?.data?.error || e.message));
    } finally {
      setSaving(false);
    }
  };

  const openTrigger = (loan) => setTriggerModal({ visible: true, loan, remarks: "" });

  const doTrigger = async () => {
    const { loan, remarks } = triggerModal;
    setTriggering(true);
    try {
      await triggerDisbursal(loan.internalId, remarks);
      setTriggerModal({ visible: false, loan: null, remarks: "" });
      loadLoans();
    } catch (e) {
      alert("Error: " + (e?.response?.data?.error || e.message));
    } finally {
      setTriggering(false);
    }
  };

  const openAuditLog = async (loan) => {
    setAuditModal({ visible: true, logs: [], loanId: loan.loanId, loading: true });
    try {
      const res = await getDisbursalAuditLog(loan.internalId);
      setAuditModal((prev) => ({ ...prev, logs: res.data || [], loading: false }));
    } catch {
      setAuditModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const openChecklist = async (loan) => {
    setChecklistModal({ visible: true, loanId: loan.loanId, data: null, loading: true });
    setApproveMsg("");
    try {
      const res = await getDisbursalChecklist(loan.internalId);
      setChecklistModal((prev) => ({ ...prev, data: res.data, loading: false, internalId: loan.internalId }));
    } catch {
      setChecklistModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const doApproveAndDisburse = async () => {
    setApproving(true);
    setApproveMsg("");
    try {
      await approveAndDisburse(checklistModal.internalId);
      setApproveMsg("success");
      loadLoans();
    } catch (e) {
      setApproveMsg(e?.response?.data?.error || "Failed to disburse");
    } finally {
      setApproving(false);
    }
  };

  const doBulkUpdate = async () => {
    if (selected.length === 0) { alert("Select loans first"); return; }
    setBulkSaving(true);
    try {
      const loanIds = selected.map((id) => loans.find((l) => l.loanId === id)?.internalId).filter(Boolean);
      await bulkUpdateDisbursalDates(
        loanIds,
        bulkForm.disbursalDate ? bulkForm.disbursalDate.format("YYYY-MM-DD") : undefined,
        bulkForm.firstRepaymentDate ? bulkForm.firstRepaymentDate.format("YYYY-MM-DD") : undefined
      );
      setBulkModal({ visible: false });
      setSelected([]);
      loadLoans();
    } catch (e) {
      alert("Bulk update error: " + (e?.response?.data?.error || e.message));
    } finally {
      setBulkSaving(false);
    }
  };

  const columns = [
    {
      title: <Checkbox onChange={(e) => setSelected(e.target.checked ? loans.map((l) => l.loanId) : [])} />,
      width: 50,
      render: (_, r) => (
        <Checkbox
          checked={selected.includes(r.loanId)}
          onChange={(e) => setSelected((prev) => e.target.checked ? [...prev, r.loanId] : prev.filter((x) => x !== r.loanId))}
        />
      ),
    },
    { title: "Loan ID", dataIndex: "loanId", key: "loanId" },
    { title: "Borrower", dataIndex: "borrowerName", key: "borrowerName", render: (v) => v || "—" },
    { title: "Lender", dataIndex: "lenderName", key: "lenderName", render: (v) => v || "—" },
    { title: "Amount (₹)", dataIndex: "amount", key: "amount", render: (v) => "₹" + formatINR(v) },
    {
      title: "Status",
      dataIndex: "loanStatus",
      key: "loanStatus",
      render: (s) => <Tag color={statusColor(s)}>{s}</Tag>,
    },
    {
      title: "eNACH",
      key: "enach",
      render: (_, r) => (
        <Tag color={r.loanStatus === "ENACH_APPROVED" ? "green" : "orange"}>
          {r.loanStatus === "ENACH_APPROVED" ? "Approved" : "Pending"}
        </Tag>
      ),
    },
    {
      title: "Disbursal Date",
      dataIndex: "disbursalDate",
      key: "disbursalDate",
      render: (v) => v || <span className="text-muted">Not set</span>,
    },
    {
      title: "First Repayment",
      dataIndex: "firstRepaymentDate",
      key: "firstRepaymentDate",
      render: (v) => v || <span className="text-muted">Not set</span>,
    },
    {
      title: "EMI (₹)",
      dataIndex: "emiAmount",
      key: "emiAmount",
      render: (v) => v ? "₹" + formatINR(v) : "—",
    },
    {
      title: "Grace Days",
      dataIndex: "gracePeriodDays",
      key: "gracePeriodDays",
      render: (v) => v ?? 3,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, r) => (
        <div className="d-flex gap-2 flex-wrap">
          <button className="btn btn-sm btn-outline-primary" onClick={() => openDateModal(r)}>
            Set Dates
          </button>
          <Tooltip title={!r.disbursalDate || !r.firstRepaymentDate ? "Set disbursal & repayment dates first" : "Trigger Disbursal"}>
            <button
              className="btn btn-sm btn-success"
              onClick={() => openTrigger(r)}
              disabled={!r.disbursalDate || !r.firstRepaymentDate}
            >
              Disburse
            </button>
          </Tooltip>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => openAuditLog(r)}>
            Audit ({r.auditLogCount || 0})
          </button>
          <button className="btn btn-sm btn-outline-info" onClick={() => openChecklist(r)}>
            Checklist
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="page-header">
            <div className="row align-items-center">
              <div className="col">
                <h3 className="page-title">Disbursal Control Panel</h3>
                <ul className="breadcrumb">
                  <li className="breadcrumb-item"><Link to="/mainadmindashboard">Dashboard</Link></li>
                  <li className="breadcrumb-item active">Disbursal Control</li>
                </ul>
              </div>
              <div className="col-auto d-flex gap-2">
                {selected.length > 0 && (
                  <button className="btn btn-warning btn-sm" onClick={() => setBulkModal({ visible: true })}>
                    Bulk Update ({selected.length} loans)
                  </button>
                )}
                <button className="btn btn-outline-primary btn-sm" onClick={loadLoans}>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="row mb-3">
            <div className="col-md-4">
              <div className="card border-success">
                <div className="card-body py-3 text-center">
                  <h6 className="text-muted mb-1">eNACH Approved</h6>
                  <h3 className="text-success mb-0">
                    {loans.filter((l) => l.loanStatus === "ENACH_APPROVED").length}
                  </h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-primary">
                <div className="card-body py-3 text-center">
                  <h6 className="text-muted mb-1">Disbursal Pending</h6>
                  <h3 className="text-primary mb-0">
                    {loans.filter((l) => l.loanStatus === "DISBURSAL_PENDING").length}
                  </h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-info">
                <div className="card-body py-3 text-center">
                  <h6 className="text-muted mb-1">Total Amount Pending</h6>
                  <h3 className="text-info mb-0">
                    ₹{formatINR(loans.reduce((s, l) => s + (l.amount || 0), 0))}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body p-0">
              <Table
                dataSource={loans}
                columns={columns}
                rowKey="loanId"
                loading={loading}
                scroll={{ x: 1200 }}
                pagination={{ pageSize: 20, showSizeChanger: true }}
                size="small"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Set Dates Modal */}
      <Modal
        title={`Set Dates — ${dateModal.loan?.loanId || ""}`}
        open={dateModal.visible}
        onCancel={() => setDateModal({ visible: false, loan: null })}
        onOk={saveDates}
        confirmLoading={saving}
        okText="Save"
      >
        <div className="mb-3">
          <label className="form-label">Disbursal Date</label>
          <DatePicker
            className="w-100"
            value={dateForm.disbursalDate}
            onChange={(d) => setDateForm((f) => ({ ...f, disbursalDate: d }))}
            format="DD-MMM-YYYY"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">First Repayment Date</label>
          <DatePicker
            className="w-100"
            value={dateForm.firstRepaymentDate}
            onChange={(d) => setDateForm((f) => ({ ...f, firstRepaymentDate: d }))}
            format="DD-MMM-YYYY"
          />
        </div>
        <div className="row mb-3">
          <div className="col-6">
            <label className="form-label">EMI Day of Month</label>
            <InputNumber
              className="w-100"
              min={1} max={28}
              value={dateForm.emiDayOfMonth}
              onChange={(v) => setDateForm((f) => ({ ...f, emiDayOfMonth: v }))}
              placeholder="e.g. 15"
            />
          </div>
          <div className="col-6">
            <label className="form-label">Grace Period (days)</label>
            <InputNumber
              className="w-100"
              min={0} max={30}
              value={dateForm.gracePeriodDays}
              onChange={(v) => setDateForm((f) => ({ ...f, gracePeriodDays: v }))}
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Remarks (optional)</label>
          <Input.TextArea
            value={dateForm.remarks}
            onChange={(e) => setDateForm((f) => ({ ...f, remarks: e.target.value }))}
            rows={2}
          />
        </div>
      </Modal>

      {/* Trigger Disbursal Modal */}
      <Modal
        title={`Confirm Disbursal — ${triggerModal.loan?.loanId || ""}`}
        open={triggerModal.visible}
        onCancel={() => setTriggerModal({ visible: false, loan: null, remarks: "" })}
        onOk={doTrigger}
        confirmLoading={triggering}
        okText="Disburse Now"
        okButtonProps={{ danger: false }}
      >
        <p>
          You are about to disburse <strong>₹{formatINR(triggerModal.loan?.amount)}</strong> for loan{" "}
          <strong>{triggerModal.loan?.loanId}</strong>.
        </p>
        <p>
          Disbursal date: <strong>{triggerModal.loan?.disbursalDate || "—"}</strong>
          <br />
          First repayment: <strong>{triggerModal.loan?.firstRepaymentDate || "—"}</strong>
        </p>
        <p className="text-danger">
          This will mark the loan as DISBURSED and generate the EMI schedule. This cannot be undone.
        </p>
        <Input.TextArea
          placeholder="Remarks (optional)"
          value={triggerModal.remarks}
          onChange={(e) => setTriggerModal((m) => ({ ...m, remarks: e.target.value }))}
          rows={2}
        />
      </Modal>

      {/* Audit Log Modal */}
      <Modal
        title={`Audit Log — ${auditModal.loanId || ""}`}
        open={auditModal.visible}
        onCancel={() => setAuditModal({ visible: false, logs: [], loanId: null, loading: false })}
        footer={null}
        width={700}
      >
        {auditModal.loading ? (
          <div className="text-center py-3">Loading…</div>
        ) : auditModal.logs.length === 0 ? (
          <div className="text-muted text-center py-3">No audit entries found.</div>
        ) : (
          <table className="table table-sm table-hover">
            <thead>
              <tr>
                <th>Change Type</th>
                <th>Old Value</th>
                <th>New Value</th>
                <th>Remarks</th>
                <th>Changed At</th>
              </tr>
            </thead>
            <tbody>
              {auditModal.logs.map((log) => (
                <tr key={log.id}>
                  <td><Tag>{log.changeType}</Tag></td>
                  <td>{log.oldValue || "—"}</td>
                  <td>{log.newValue || "—"}</td>
                  <td>{log.remarks || "—"}</td>
                  <td style={{ fontSize: 12 }}>{log.changedAt ? new Date(log.changedAt).toLocaleString("en-IN") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Modal>

      {/* Checklist Modal */}
      <Modal
        title={`Disbursal Checklist — ${checklistModal.loanId || ""}`}
        open={checklistModal.visible}
        onCancel={() => { setChecklistModal({ visible: false, loanId: null, data: null, loading: false }); setApproveMsg(""); }}
        footer={null}
        width={520}
      >
        {checklistModal.loading ? (
          <div className="text-center py-4"><div className="spinner-border" /></div>
        ) : !checklistModal.data ? (
          <div className="text-muted text-center py-3">Failed to load checklist</div>
        ) : (
          <>
            {[
              { key: "kycComplete", label: "KYC Complete" },
              { key: "cibilUploaded", label: "CIBIL Uploaded" },
              { key: "borrowerEsigned", label: "Borrower eSigned" },
              { key: "lenderEsigned", label: "Lender eSigned" },
              { key: "enachApproved", label: "eNACH Approved" },
              { key: "feeCollected", label: "Fee Collected" },
              { key: "allLenderWalletsSufficient", label: "All Lender Wallets Sufficient" },
              { key: "feeDisclosureAccepted", label: "Fee Disclosure Accepted" },
            ].map(({ key, label }) => {
              const ok = checklistModal.data[key];
              return (
                <div key={key} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <span>{label}</span>
                  <span className={`badge ${ok ? "bg-success" : "bg-danger"}`}>
                    {ok ? "✓ Done" : "✗ Pending"}
                  </span>
                </div>
              );
            })}
            <div className="mt-3 p-3 rounded" style={{ background: checklistModal.data.allGreen ? "#e8f5e9" : "#fff3e0" }}>
              <strong>Overall: </strong>
              {checklistModal.data.allGreen
                ? <span className="text-success">All checks passed — Ready to disburse</span>
                : <span className="text-warning">Pending items must be completed first</span>
              }
            </div>
            {approveMsg === "success" ? (
              <div className="alert alert-success mt-3">Loan disbursed successfully!</div>
            ) : approveMsg ? (
              <div className="alert alert-danger mt-3">{approveMsg}</div>
            ) : null}
            <div className="mt-3 d-grid">
              <button
                className="btn btn-success btn-lg"
                disabled={!checklistModal.data.allGreen || approving}
                onClick={doApproveAndDisburse}
              >
                {approving ? "Processing…" : "Approve & Disburse"}
              </button>
            </div>
          </>
        )}
      </Modal>

      {/* Bulk Update Modal */}
      <Modal
        title={`Bulk Update Dates (${selected.length} loans)`}
        open={bulkModal.visible}
        onCancel={() => setBulkModal({ visible: false })}
        onOk={doBulkUpdate}
        confirmLoading={bulkSaving}
        okText="Update All"
      >
        <div className="mb-3">
          <label className="form-label">Disbursal Date (leave blank to skip)</label>
          <DatePicker
            className="w-100"
            value={bulkForm.disbursalDate}
            onChange={(d) => setBulkForm((f) => ({ ...f, disbursalDate: d }))}
            format="DD-MMM-YYYY"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">First Repayment Date (leave blank to skip)</label>
          <DatePicker
            className="w-100"
            value={bulkForm.firstRepaymentDate}
            onChange={(d) => setBulkForm((f) => ({ ...f, firstRepaymentDate: d }))}
            format="DD-MMM-YYYY"
          />
        </div>
        <p className="text-warning mb-0">
          WhatsApp and Email notifications will be sent to all borrowers and lenders.
        </p>
      </Modal>
    </div>
  );
};

export default AdminDisbursalControl;
