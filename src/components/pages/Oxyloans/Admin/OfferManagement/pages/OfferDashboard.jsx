import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import offerAdminApi from "../../../../../HttpRequest/offerAdminApi";
import useOfferApi from "../hooks/useOfferApi";
import OfferLoadingSpinner from "../components/OfferLoadingSpinner";
import OfferErrorAlert from "../components/OfferErrorAlert";
import OfferPageHeader from "../components/OfferPageHeader";
import { getSegmentLabel } from "../utils/offerConstants";

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
  const { loading, error, execute, clearError } = useOfferApi();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [summary, pendingList, approvedList, rejectedList] = await Promise.all([
          execute(offerAdminApi.getSegmentSummary),
          execute(offerAdminApi.getAllPendingOffers),
          execute(offerAdminApi.getApprovedOffers),
          execute(offerAdminApi.getRejectedOffers),
        ]);
        setStats(summary);
        setPending(pendingList || []);
        setApproved(approvedList || []);
        setRejected(rejectedList || []);
      } catch {
        /* error handled by hook */
      }
    };
    load();
  }, [execute]);

  const totalLenders = stats?.reduce((s, seg) => s + (seg.lenderCount || 0), 0) || 0;
  const inactiveLenders =
    stats
      ?.filter((s) => !["ACTIVE_RECENT", "REPEAT_LOYAL"].includes(s.segment))
      .reduce((s, seg) => s + (seg.lenderCount || 0), 0) || 0;

  const segmentChart = {
    labels: (stats || []).map((s) => getSegmentLabel(s.segment)),
    datasets: [
      {
        label: "Lenders",
        data: (stats || []).map((s) => s.lenderCount),
        backgroundColor: [
          "#0d6efd", "#6610f2", "#6f42c1", "#d63384",
          "#fd7e14", "#ffc107", "#198754", "#20c997",
        ],
      },
    ],
  };

  const ratioChart = {
    labels: ["Approved", "Rejected", "Pending"],
    datasets: [
      {
        data: [approved.length, rejected.length, pending.length],
        backgroundColor: ["#198754", "#dc3545", "#ffc107"],
      },
    ],
  };

  if (loading && !stats) {
    return <OfferLoadingSpinner fullPage message="Loading dashboard..." />;
  }

  return (
    <div>
      <OfferPageHeader
        title="Dashboard"
        subtitle="Lender reactivation & offer generation overview"
      />
      <OfferErrorAlert message={error} onDismiss={clearError} />

      <div className="row g-3 mb-4">
        <StatCard title="Total Lenders" value={totalLenders} color="primary" />
        <StatCard title="Inactive Lenders" value={inactiveLenders} color="warning" />
        <StatCard
          title="Offers Generated"
          value={pending.length + approved.length + rejected.length}
          subtitle="All time (loaded)"
          color="info"
        />
        <StatCard title="Pending Approval" value={pending.length} color="warning" />
        <StatCard title="Approved Offers" value={approved.length} color="success" />
        <StatCard title="Rejected Offers" value={rejected.length} color="danger" />
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold">Inactive Lender Segments</div>
            <div className="card-body" style={{ height: 320 }}>
              {stats?.length ? (
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
