import React, { useEffect, useState } from "react";
import offerAdminApi from "../../../../../HttpRequest/offerAdminApi";
import OfferLoadingSpinner from "../components/OfferLoadingSpinner";
import OfferErrorAlert from "../components/OfferErrorAlert";
import OfferPageHeader from "../components/OfferPageHeader";
import {
  OFFER_SEGMENTS,
  getSegmentLabel,
  getDefaultOfferType,
  getOfferTypeLabel,
} from "../utils/offerConstants";

const StatCard = ({ title, value, subtitle, color = "primary" }) => (
  <div className="col-sm-6 col-xl-4 col-xxl-2">
    <div className={`card border-0 shadow-sm h-100 border-start border-4 border-${color}`}>
      <div className="card-body">
        <p className="text-muted small text-uppercase mb-1">{title}</p>
        <h2 className="fw-bold mb-0">{value ?? "—"}</h2>
        {subtitle && <small className="text-muted">{subtitle}</small>}
      </div>
    </div>
  </div>
);

const SEGMENT_COLORS = {
  NEW_LENDER: "#0d6efd",
  INACTIVE_LENDER: "#fd7e14",
  REGULAR_PARTICIPANT: "#198754",
};

const SegmentBars = ({ rows }) => {
  const max = Math.max(1, ...rows.map((r) => Number(r.lenderCount) || 0));
  return (
    <div className="offer-segment-bars">
      {rows.map((row) => {
        const count = Number(row.lenderCount) || 0;
        const pct = Math.round((count / max) * 100);
        const color = SEGMENT_COLORS[row.segment] || "#0d6efd";
        return (
          <div key={row.segment} className="offer-segment-bar-row mb-3">
            <div className="d-flex justify-content-between mb-1">
              <span className="fw-semibold">{getSegmentLabel(row.segment)}</span>
              <span className="text-muted">{count.toLocaleString("en-IN")}</span>
            </div>
            <div className="offer-segment-bar-track">
              <div
                className="offer-segment-bar-fill"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const RatioPills = ({ counts }) => {
  const total = Math.max(1, counts.approved + counts.rejected + counts.pending);
  const items = [
    { label: "Approved", value: counts.approved, color: "#198754" },
    { label: "Rejected", value: counts.rejected, color: "#dc3545" },
    { label: "Pending", value: counts.pending, color: "#ffc107" },
  ];
  return (
    <div>
      <div className="offer-ratio-stack mb-3">
        {items.map((item) => (
          <div
            key={item.label}
            title={`${item.label}: ${item.value}`}
            style={{
              width: `${(item.value / total) * 100}%`,
              background: item.color,
              minWidth: item.value > 0 ? 8 : 0,
            }}
          />
        ))}
      </div>
      <div className="d-flex flex-wrap gap-3">
        {items.map((item) => (
          <div key={item.label} className="d-flex align-items-center gap-2">
            <span
              className="offer-ratio-dot"
              style={{ background: item.color }}
            />
            <span className="small">
              {item.label}: <strong>{item.value}</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const OfferDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryResult, countsResult] = await Promise.allSettled([
          offerAdminApi.getSegmentSummary(false),
          offerAdminApi.getOfferCounts(),
        ]);

        if (cancelled) return;

        if (summaryResult.status === "fulfilled") {
          setStats(Array.isArray(summaryResult.value) ? summaryResult.value : []);
        } else {
          setStats([]);
          setError(summaryResult.reason?.message || "Failed to load segment summary");
        }

        if (countsResult.status === "fulfilled" && countsResult.value) {
          setCounts({
            pending: Number(countsResult.value.pending) || 0,
            approved: Number(countsResult.value.approved) || 0,
            rejected: Number(countsResult.value.rejected) || 0,
            total: Number(countsResult.value.total) || 0,
          });
        } else if (summaryResult.status === "fulfilled" && countsResult.status === "rejected") {
          setError((prev) => prev || countsResult.reason?.message || "Failed to load offer counts");
        }
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalLenders = stats.reduce((s, seg) => s + (seg.lenderCount || 0), 0);
  const countFor = (code) =>
    stats
      .filter((s) => s.segment === code)
      .reduce((s, seg) => s + (seg.lenderCount || 0), 0);

  const orderedStats = OFFER_SEGMENTS.map((meta) => {
    const found = stats.find((s) => s.segment === meta.value);
    return found || { segment: meta.value, lenderCount: 0 };
  });

  if (loading && stats.length === 0 && counts.total === 0) {
    return <OfferLoadingSpinner fullPage message="Loading dashboard..." />;
  }

  return (
    <div>
      <OfferPageHeader
        title="Dashboard"
        subtitle="3-segment reactivation — New & Inactive: deal fee free · Regular: subscription % off"
      />
      <OfferErrorAlert message={error} onDismiss={() => setError(null)} />

      <div className="row g-3 mb-4">
        <StatCard title="Total Lenders" value={totalLenders} color="primary" />
        <StatCard
          title="New Lenders"
          value={countFor("NEW_LENDER")}
          subtitle={getOfferTypeLabel(getDefaultOfferType("NEW_LENDER"))}
          color="info"
        />
        <StatCard
          title="Inactive Lenders"
          value={countFor("INACTIVE_LENDER")}
          subtitle={getOfferTypeLabel(getDefaultOfferType("INACTIVE_LENDER"))}
          color="warning"
        />
        <StatCard
          title="Regular Participants"
          value={countFor("REGULAR_PARTICIPANT")}
          subtitle={getOfferTypeLabel(getDefaultOfferType("REGULAR_PARTICIPANT"))}
          color="success"
        />
        <StatCard title="Pending Approval" value={counts.pending} color="warning" />
        <StatCard title="Approved Offers" value={counts.approved} color="success" />
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">Lender Segments</div>
            <div className="card-body" style={{ minHeight: 280 }}>
              {stats.length ? (
                <SegmentBars rows={orderedStats} />
              ) : (
                <p className="text-muted text-center py-5">No segment data</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">Approved vs Rejected vs Pending</div>
            <div className="card-body" style={{ minHeight: 280 }}>
              <RatioPills counts={counts} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDashboard;
