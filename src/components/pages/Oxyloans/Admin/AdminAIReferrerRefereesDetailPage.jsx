import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaDownload,
  FaEnvelope,
  FaTimes,
  FaUser,
  FaUserFriends,
  FaWhatsapp,
} from "react-icons/fa";
import { saveAs } from "file-saver";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  downloadAdminAIActiveLendersReferralPortfolioExcel,
  getAdminAIActiveLendersReferralPortfolioReferees,
  parseAdminAIExportError,
} from "../../../HttpRequest/admin";
import AdminAILenderCampaignModal from "./AdminAILenderCampaignModal";
import {
  inviteSourceMeta,
  RefereeRowsTable,
  RefereeTypeCountBadges,
  RefereeTypeSplitPanel,
  SourceTypeBadges,
  splitRefereesByType,
} from "./AdminAIReferralRefereeTypeSplit";
import "./AdminAIDashboard.css";

const PORTFOLIO_PATH = "/adminAIActiveLendersReferralPortfolio";
const fmtNum = (value) => Number(value || 0).toLocaleString("en-IN");
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);
const pickNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const responseData = (payload) => payload?.data || payload || {};

const AdminAIReferrerRefereesDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const referrerId = pickNumber(searchParams.get("referrerId"));
  const filter = searchParams.get("filter") === "invitedUsers" ? "invitedUsers" : "registeredUsers";
  const status = filter === "registeredUsers" ? "Registered" : "Invited";
  const statusVerb = filter === "registeredUsers" ? "registered" : "invited";
  const returnTo = searchParams.get("returnTo")
    || `${PORTFOLIO_PATH}?filter=${filter}`;
  const seedRow = location.state?.referrerRow || null;

  const [row, setRow] = useState(seedRow && pickNumber(seedRow.referrerId) === referrerId ? seedRow : null);
  const [loading, setLoading] = useState(!row);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [campaignState, setCampaignState] = useState(null);

  const goBack = () => {
    navigate(returnTo.startsWith("/") ? returnTo : `${PORTFOLIO_PATH}?filter=${filter}`);
  };

  const loadReferrer = useCallback(async () => {
    if (!referrerId) {
      setError("Referrer ID is required.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = responseData(
        await getAdminAIActiveLendersReferralPortfolioReferees(1, 50, {
          status,
          search: String(referrerId),
          groupBy: "referrer",
        })
      );
      const rows = Array.isArray(data.rows) ? data.rows : [];
      const match = rows.find((item) => pickNumber(item.referrerId) === referrerId) || rows[0] || null;
      if (!match) {
        setRow(null);
        setError("No referees found for this referrer.");
      } else {
        setRow(match);
      }
    } catch (requestError) {
      setRow(null);
      setError(requestError?.response?.data?.message || requestError?.message || "Failed to load referrer list.");
    } finally {
      setLoading(false);
    }
  }, [referrerId, status]);

  useEffect(() => {
    if (seedRow && pickNumber(seedRow.referrerId) === referrerId && Array.isArray(seedRow.referees)) {
      setRow(seedRow);
      setLoading(false);
      return;
    }
    loadReferrer();
  }, [referrerId, seedRow, loadReferrer]);

  const referees = useMemo(
    () => (Array.isArray(row?.referees) ? row.referees : []),
    [row]
  );
  const typeSplit = useMemo(() => splitRefereesByType(referees), [referees]);

  const sourceCounts = useMemo(() => {
    let inviteCount = pickNumber(row?.inviteCount);
    let bulkInviteCount = pickNumber(row?.bulkInviteCount);
    let partnerCount = pickNumber(row?.partnerCount);
    if (inviteCount + bulkInviteCount + partnerCount <= 0 && referees.length) {
      inviteCount = 0;
      bulkInviteCount = 0;
      partnerCount = 0;
      referees.forEach((referee) => {
        const kind = inviteSourceMeta(referee.source).kind;
        if (kind === "bulk") bulkInviteCount += 1;
        else if (kind === "partner") partnerCount += 1;
        else inviteCount += 1;
      });
    }
    return { inviteCount, bulkInviteCount, partnerCount };
  }, [row, referees]);

  const downloadExcel = async () => {
    if (!referrerId) return;
    setExporting(true);
    setError("");
    try {
      const response = await downloadAdminAIActiveLendersReferralPortfolioExcel(filter, { referrerId });
      const blob = response?.data;
      if (!blob) throw new Error("Empty export response.");
      if (blob.type && String(blob.type).includes("json")) {
        const text = await blob.text();
        let message = "Export failed.";
        try {
          message = JSON.parse(text)?.errorMessage || message;
        } catch {
          message = text || message;
        }
        throw new Error(message);
      }
      const slug = filter === "registeredUsers" ? "registered-users" : "invited-users";
      saveAs(
        blob,
        `active-lenders-portfolio-${slug}-LR${referrerId}-${new Date().toISOString().slice(0, 10)}.xlsx`
      );
    } catch (exportError) {
      const parsed = await parseAdminAIExportError(exportError);
      setError(parsed || exportError?.message || "Failed to download Excel.");
    } finally {
      setExporting(false);
    }
  };

  const openCampaign = (channel) => {
    const base = filter === "registeredUsers"
      ? "activeLenderRegisteredReferees"
      : "activeLenderInvitedReferees";
    setCampaignState({
      channel,
      segment: `${base}_r${referrerId}`,
      label: `${row?.referrerName || row?.referrerCode || `LR${referrerId}`} — ${status} referees`,
      recipientCount: pickNumber(row?.refereeCount) || referees.length,
    });
  };

  const openReferrerProfile = () => {
    if (!referrerId) return;
    const code = row?.referrerCode || `LR${referrerId}`;
    const params = new URLSearchParams({
      userId: String(referrerId),
      view: "referralRegistered",
      label: `Referrer ${code}`,
      returnTo: typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : `/adminAIReferrerRefereesDetail?referrerId=${referrerId}&filter=${filter}`,
    });
    navigate(`/adminAIUserProfile?${params.toString()}`);
  };

  const referrerCode = valueOrDash(row?.referrerCode || (referrerId ? `LR${referrerId}` : "-"));
  const refereeCount = pickNumber(row?.refereeCount) || referees.length;

  return (
    <div className="admin-ai-page-shell">
      <div className={`admin-ai-dashboard-wrap admin-ai-referrer-referees-page admin-ai-ref-portfolio-list--referee-official ${filter === "registeredUsers" ? "is-registered-view" : "is-invited-view"}`}>
        <header className="admin-ai-ref-portfolio-head admin-ai-referrer-referees-head">
          <div>
            <button type="button" className="admin-ai-referral-back" onClick={goBack}>
              <FaArrowLeft /> Back to {statusVerb} users
            </button>
            <h2>{status} users list</h2>
            <p>
              Referrer {valueOrDash(row?.referrerName)} · {referrerCode}
              {" · "}{fmtNum(refereeCount)} {statusVerb}
            </p>
          </div>
          <button type="button" className="admin-ai-close-btn" onClick={goBack}>
            <FaTimes /> Close
          </button>
        </header>

        {error ? <div className="alert alert-danger">{error}</div> : null}
        {loading ? <div className="admin-ai-loading-inline">Loading referee list…</div> : null}

        {!loading && row ? (
          <>
            <section className="admin-ai-referrer-referees-summary">
              <div className="admin-ai-referrer-referees-summary-who">
                <small>Referrer</small>
                <button
                  type="button"
                  className="admin-ai-ref-portfolio-referrer-profile-btn"
                  title={`Open profile for ${referrerCode}`}
                  onClick={openReferrerProfile}
                >
                  <strong>
                    {valueOrDash(row.referrerName)}
                    <span className="admin-ai-ref-portfolio-referrer-code">{referrerCode}</span>
                  </strong>
                  <span className="admin-ai-ref-portfolio-referrer-profile-hint">
                    <FaUser /> View profile
                  </span>
                </button>
                <SourceTypeBadges
                  inviteCount={sourceCounts.inviteCount}
                  bulkInviteCount={sourceCounts.bulkInviteCount}
                  partnerCount={sourceCounts.partnerCount}
                />
                {filter === "registeredUsers" ? (
                  <RefereeTypeCountBadges
                    lenders={typeSplit.lenders.length}
                    borrowers={typeSplit.borrowers.length}
                    other={typeSplit.other.length}
                  />
                ) : null}
                <em>
                  <b>{fmtNum(refereeCount)}</b> {statusVerb}
                  {filter === "registeredUsers"
                    ? ` · ${fmtNum(typeSplit.lenders.length)} lenders (LR) · ${fmtNum(typeSplit.borrowers.length)} borrowers (BR)`
                    : ""}
                </em>
              </div>
              <div className="admin-ai-referrer-referees-summary-actions">
                <button type="button" className="admin-ai-ref-portfolio-campaign-btn" onClick={() => openCampaign("email")}>
                  <FaEnvelope /> Email
                </button>
                <button type="button" className="admin-ai-ref-portfolio-campaign-btn is-whatsapp" onClick={() => openCampaign("whatsapp")}>
                  <FaWhatsapp /> WhatsApp
                </button>
                <button
                  type="button"
                  className="admin-ai-ref-portfolio-campaign-btn is-excel"
                  disabled={exporting}
                  onClick={downloadExcel}
                >
                  <FaDownload /> {exporting ? "..." : "Excel"}
                </button>
                <button type="button" className="admin-ai-referrer-referees-close-inline" onClick={goBack}>
                  <FaTimes /> Close
                </button>
              </div>
              <div className="admin-ai-referrer-referees-summary-count">
                <b>{fmtNum(refereeCount)}</b>
                <span>Total</span>
              </div>
            </section>

            <section className="admin-ai-referrer-referees-body">
              {filter === "registeredUsers" ? (
                <RefereeTypeSplitPanel referees={referees} statusVerb={statusVerb} />
              ) : (
                <div className="admin-ai-table-wrap admin-ai-referrer-referees-table">
                  {referees.length ? (
                    <RefereeRowsTable referees={referees} />
                  ) : (
                    <div className="admin-ai-empty-state">
                      <FaUserFriends />
                      <p>No invited users listed for this referrer.</p>
                    </div>
                  )}
                </div>
              )}
            </section>
          </>
        ) : null}

        {!loading && !row && !error ? (
          <div className="admin-ai-empty-state">
            <FaUserFriends />
            <p>No data for this referrer.</p>
            <button type="button" className="admin-ai-close-btn" onClick={goBack}>
              <FaTimes /> Close
            </button>
          </div>
        ) : null}
      </div>

      {campaignState ? (
        <AdminAILenderCampaignModal
          open={Boolean(campaignState)}
          onClose={() => setCampaignState(null)}
          segment={campaignState.segment}
          segmentLabel={campaignState.label}
          recipientCount={campaignState.recipientCount}
          initialChannel={campaignState.channel}
          onSent={(result, meta) => {
            if (meta?.dryRun) return;
            setCampaignState(null);
          }}
        />
      ) : null}
    </div>
  );
};

export default AdminAIReferrerRefereesDetailPage;
