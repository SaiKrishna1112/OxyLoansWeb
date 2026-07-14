import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import offerAdminApi from "../../../../../HttpRequest/offerAdminApi";
import OfferLoadingSpinner from "../components/OfferLoadingSpinner";
import OfferErrorAlert from "../components/OfferErrorAlert";
import OfferPageHeader from "../components/OfferPageHeader";
import { OFFER_SEGMENTS, getSegmentLabel, getDefaultOfferType, getOfferTypeLabel } from "../utils/offerConstants";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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
        // Load independently so one slow/failing call does not zero the whole dashboard
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

  const segmentChart = {
    labels: orderedStats.map((s) => getSegmentLabel(s.segment)),
    datasets: [
      {
        label: "Lenders",
        data: orderedStats.map((s) => s.lenderCount || 0),
        backgroundColor: ["#0d6efd", "#fd7e14", "#198754"],
      },
    ],
  };

  const ratioChart = {
    labels: ["Approved", "Rejected", "Pending"],
    datasets: [
      {
        data: [counts.approved, counts.rejected, counts.pending],
        backgroundColor: ["#198754", "#dc3545", "#ffc107"],
      },
    ],
  };

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
            <div className="card-body" style={{ height: 320 }}>
              {stats.length ? (
                <Bar
                  data={segmentChart}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                />
              ) : (
                <p className="text-muted text-center py-5">No segment data</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">Approved vs Rejected vs Pending</div>
            <div className="card-body d-flex justify-content-center" style={{ height: 320 }}>
              <div style={{ maxWidth: 280 }}>
                <Doughnut data={ratioChart} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDashboard;
