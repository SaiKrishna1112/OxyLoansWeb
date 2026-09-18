import React, { useState } from "react";

const fmtNum = (value) => Number(value || 0).toLocaleString("en-IN");
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);
const pickNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

/** Map DB source enum to display label: ReferralLink → Invite, BulkInvite → BulkInvite. */
export const inviteSourceMeta = (source) => {
  const value = String(source || "").trim();
  if (/^bulkinvite$/i.test(value)) return { label: "BulkInvite", kind: "bulk" };
  if (/^partner$/i.test(value)) return { label: "Partner", kind: "partner" };
  if (/^referrallink$/i.test(value) || /^invite$/i.test(value) || !value) {
    return { label: "Invite", kind: "invite" };
  }
  return { label: value, kind: "other" };
};

export const refereeTypeMeta = (referee) => {
  const code = String(referee?.refereeCode || "").trim().toUpperCase();
  const primary = String(
    referee?.userPrimaryType || referee?.primaryType || referee?.refereePrimaryType || ""
  ).trim().toUpperCase();
  if (code.startsWith("BR") || primary.includes("BORROWER")) {
    return { kind: "borrower", label: "Borrowers", codePrefix: "BR" };
  }
  if (code.startsWith("LR") || primary.includes("LENDER")) {
    return { kind: "lender", label: "Lenders", codePrefix: "LR" };
  }
  if (pickNumber(referee?.refereeId) > 0) {
    return { kind: "lender", label: "Lenders", codePrefix: "LR" };
  }
  return { kind: "other", label: "Other", codePrefix: "" };
};

export const splitRefereesByType = (referees = []) => {
  const lenders = [];
  const borrowers = [];
  const other = [];
  (referees || []).forEach((referee) => {
    const kind = refereeTypeMeta(referee).kind;
    if (kind === "borrower") borrowers.push(referee);
    else if (kind === "lender") lenders.push(referee);
    else other.push(referee);
  });
  return { lenders, borrowers, other };
};

export const SourceTypeBadges = ({ inviteCount = 0, bulkInviteCount = 0, partnerCount = 0 }) => {
  const invite = pickNumber(inviteCount);
  const bulk = pickNumber(bulkInviteCount);
  const partner = pickNumber(partnerCount);
  if (invite <= 0 && bulk <= 0 && partner <= 0) return null;
  return (
    <div className="admin-ai-ref-portfolio-source-badges">
      {invite > 0 ? <span className="admin-ai-ref-source-pill is-invite">Invite {fmtNum(invite)}</span> : null}
      {bulk > 0 ? <span className="admin-ai-ref-source-pill is-bulk">BulkInvite {fmtNum(bulk)}</span> : null}
      {partner > 0 ? <span className="admin-ai-ref-source-pill is-partner">Partner {fmtNum(partner)}</span> : null}
    </div>
  );
};

export const RefereeTypeCountBadges = ({ lenders = 0, borrowers = 0, other = 0 }) => {
  const lr = pickNumber(lenders);
  const br = pickNumber(borrowers);
  const ot = pickNumber(other);
  if (lr <= 0 && br <= 0 && ot <= 0) return null;
  return (
    <div className="admin-ai-ref-portfolio-type-badges" aria-label="Registered by user type">
      {lr > 0 ? <span className="admin-ai-ref-type-pill is-lender">LR {fmtNum(lr)}</span> : null}
      {br > 0 ? <span className="admin-ai-ref-type-pill is-borrower">BR {fmtNum(br)}</span> : null}
      {ot > 0 ? <span className="admin-ai-ref-type-pill is-other">Other {fmtNum(ot)}</span> : null}
    </div>
  );
};

export const RefereeRowsTable = ({ referees = [] }) => (
  <table className="admin-ai-advanced-table">
    <thead>
      <tr>
        <th>Referee</th>
        <th>Mobile</th>
        <th>Email</th>
        <th>Status</th>
        <th>Source</th>
        <th>Referred On</th>
      </tr>
    </thead>
    <tbody>
      {referees.map((referee) => {
        const sourceMeta = inviteSourceMeta(referee.source);
        return (
          <tr key={referee.id || `${referee.refereeId}-${referee.referredOn}`}>
            <td>
              <strong>{valueOrDash(referee.refereeName)}</strong>
              <div>
                <small>
                  {valueOrDash(referee.refereeCode || (referee.refereeId ? `ID ${referee.refereeId}` : ""))}
                </small>
              </div>
            </td>
            <td>{valueOrDash(referee.refereeMobileNumber)}</td>
            <td>{valueOrDash(referee.refereeEmail)}</td>
            <td>
              <span className={`admin-ai-campaign-status-pill ${referee.status === "Registered" ? "is-success" : ""}`}>
                {valueOrDash(referee.status)}
              </span>
            </td>
            <td>
              <span className={`admin-ai-ref-source-pill is-${sourceMeta.kind}`}>
                {sourceMeta.label}
              </span>
            </td>
            <td>{valueOrDash(referee.referredOn)}</td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

/** Split referees into LR / BR boxes with count-view toggles. */
export const RefereeTypeSplitPanel = ({ referees = [], statusVerb = "registered" }) => {
  const { lenders, borrowers, other } = splitRefereesByType(referees);
  const [typeView, setTypeView] = useState("all");
  const total = referees.length;
  const showLenders = typeView === "all" || typeView === "lender";
  const showBorrowers = typeView === "all" || typeView === "borrower";
  const showOther = (typeView === "all" || typeView === "other") && other.length > 0;

  if (!total) {
    return (
      <div className="admin-ai-empty-state">
        <p>No referees listed for this referrer.</p>
      </div>
    );
  }

  return (
    <div className="admin-ai-ref-portfolio-type-split">
      <div className="admin-ai-ref-portfolio-type-split-toolbar">
        <span className="admin-ai-ref-portfolio-type-split-label">Count view</span>
        <div className="admin-ai-ref-portfolio-type-split-toggles" role="tablist" aria-label="Filter by LR or BR">
          <button
            type="button"
            role="tab"
            aria-selected={typeView === "all"}
            className={`admin-ai-ref-type-toggle${typeView === "all" ? " is-active" : ""}`}
            onClick={() => setTypeView("all")}
          >
            All <b>{fmtNum(total)}</b>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={typeView === "lender"}
            className={`admin-ai-ref-type-toggle is-lender${typeView === "lender" ? " is-active" : ""}`}
            onClick={() => setTypeView("lender")}
            disabled={!lenders.length}
          >
            Lenders (LR) <b>{fmtNum(lenders.length)}</b>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={typeView === "borrower"}
            className={`admin-ai-ref-type-toggle is-borrower${typeView === "borrower" ? " is-active" : ""}`}
            onClick={() => setTypeView("borrower")}
            disabled={!borrowers.length}
          >
            Borrowers (BR) <b>{fmtNum(borrowers.length)}</b>
          </button>
          {other.length > 0 ? (
            <button
              type="button"
              role="tab"
              aria-selected={typeView === "other"}
              className={`admin-ai-ref-type-toggle is-other${typeView === "other" ? " is-active" : ""}`}
              onClick={() => setTypeView("other")}
            >
              Other <b>{fmtNum(other.length)}</b>
            </button>
          ) : null}
        </div>
        <em className="admin-ai-ref-portfolio-type-split-hint">
          {fmtNum(lenders.length)} lenders · {fmtNum(borrowers.length)} borrowers
          {other.length ? ` · ${fmtNum(other.length)} other` : ""} {statusVerb}
        </em>
      </div>

      <div className="admin-ai-ref-portfolio-type-boxes">
        {showLenders ? (
          <section className="admin-ai-ref-portfolio-type-box is-lender">
            <header className="admin-ai-ref-portfolio-type-box-head">
              <div>
                <small>User type</small>
                <strong>Lenders</strong>
                <span className="admin-ai-ref-type-code">LR</span>
              </div>
              <div className="admin-ai-ref-portfolio-type-box-count" aria-label={`${lenders.length} lenders`}>
                <b>{fmtNum(lenders.length)}</b>
                <span>Count</span>
              </div>
            </header>
            {lenders.length ? (
              <div className="admin-ai-table-wrap">
                <RefereeRowsTable referees={lenders} />
              </div>
            ) : (
              <div className="admin-ai-ref-portfolio-type-box-empty">No registered lenders (LR) for this referrer.</div>
            )}
          </section>
        ) : null}

        {showBorrowers ? (
          <section className="admin-ai-ref-portfolio-type-box is-borrower">
            <header className="admin-ai-ref-portfolio-type-box-head">
              <div>
                <small>User type</small>
                <strong>Borrowers</strong>
                <span className="admin-ai-ref-type-code">BR</span>
              </div>
              <div className="admin-ai-ref-portfolio-type-box-count" aria-label={`${borrowers.length} borrowers`}>
                <b>{fmtNum(borrowers.length)}</b>
                <span>Count</span>
              </div>
            </header>
            {borrowers.length ? (
              <div className="admin-ai-table-wrap">
                <RefereeRowsTable referees={borrowers} />
              </div>
            ) : (
              <div className="admin-ai-ref-portfolio-type-box-empty">No registered borrowers (BR) for this referrer.</div>
            )}
          </section>
        ) : null}

        {showOther ? (
          <section className="admin-ai-ref-portfolio-type-box is-other">
            <header className="admin-ai-ref-portfolio-type-box-head">
              <div>
                <small>User type</small>
                <strong>Other</strong>
              </div>
              <div className="admin-ai-ref-portfolio-type-box-count">
                <b>{fmtNum(other.length)}</b>
                <span>Count</span>
              </div>
            </header>
            <div className="admin-ai-table-wrap">
              <RefereeRowsTable referees={other} />
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};
