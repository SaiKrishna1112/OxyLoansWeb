import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";

const fmtNum = (n) => (n == null ? "0" : Number(n).toLocaleString("en-IN"));
const pickNumber = (...values) => {
  for (const value of values) {
    if (value != null && value !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return 0;
};

const formatMonthLabel = (monthKey) => {
  const text = String(monthKey || "");
  if (!/^\d{4}-\d{2}$/.test(text)) {
    return text;
  }
  const [year, month] = text.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
};

const AdminAIMonthlyRegistrationChart = ({ monthlyRows = [], platformStats = {} }) => {
  const monthly = useMemo(() => {
    const rows = Array.isArray(monthlyRows) ? monthlyRows : [];
    return rows.map((row) => ({
      month: row?.month || "",
      lenders: pickNumber(row?.lenders),
      borrowers: pickNumber(row?.borrowers),
      total: pickNumber(row?.total, row?.lenders + row?.borrowers),
    }));
  }, [monthlyRows]);

  const totals = useMemo(
    () =>
      monthly.reduce(
        (acc, row) => ({
          lenders: acc.lenders + row.lenders,
          borrowers: acc.borrowers + row.borrowers,
          total: acc.total + row.total,
        }),
        { lenders: 0, borrowers: 0, total: 0 }
      ),
    [monthly]
  );

  const chartLenderSignups = totals.lenders;
  const chartBorrowerSignups = totals.borrowers;
  const chartRegistrationTotal = totals.total || chartLenderSignups + chartBorrowerSignups;

  const allTimeLenders = pickNumber(
    platformStats?.rawLenders,
    platformStats?.allLenders,
    platformStats?.goodLenders
  );
  const dealActiveLenders = pickNumber(platformStats?.allActiveLenders);
  const allTimeBorrowers = pickNumber(
    platformStats?.allBorrowers,
    platformStats?.borrowersCount
  );

  const chart = useMemo(
    () => ({
      series: [
        { name: "Lenders", type: "area", data: monthly.map((row) => row.lenders) },
        { name: "Borrowers", type: "area", data: monthly.map((row) => row.borrowers) },
      ],
      options: {
        chart: {
          toolbar: { show: false },
          fontFamily: "inherit",
          animations: { enabled: true },
        },
        colors: ["#22c55e", "#0ea5e9"],
        stroke: { curve: "smooth", width: 3 },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 0.35,
            opacityFrom: 0.55,
            opacityTo: 0.08,
            stops: [0, 90, 100],
          },
        },
        dataLabels: { enabled: false },
        xaxis: {
          categories: monthly.map((row) => formatMonthLabel(row.month)),
          labels: { rotate: -20, style: { fontSize: "12px", fontWeight: 700 } },
        },
        yaxis: {
          labels: { formatter: (value) => fmtNum(value) },
        },
        legend: { position: "top", horizontalAlign: "left", fontWeight: 700 },
        grid: { borderColor: "#e2e8f0", strokeDashArray: 4 },
        tooltip: { shared: true, y: { formatter: (value) => fmtNum(value) } },
      },
    }),
    [monthly]
  );

  const hasData = monthly.length > 0;

  return (
    <section className="admin-ai-panel admin-ai-monthly-reg-panel admin-ai-monthly-reg-panel-magic">
      <div className="admin-ai-monthly-reg-layout">
        <aside className="admin-ai-monthly-reg-side">
          <p className="admin-ai-monthly-reg-side-heading">Last 12 months (chart period)</p>
          <div className="admin-ai-monthly-reg-side-card lender">
            <span className="side-letter">L</span>
            <div>
              <small>New lender sign-ups</small>
              <strong>{fmtNum(chartLenderSignups)}</strong>
            </div>
          </div>
          <div className="admin-ai-monthly-reg-side-card borrower">
            <span className="side-letter">B</span>
            <div>
              <small>New borrower sign-ups</small>
              <strong>{fmtNum(chartBorrowerSignups)}</strong>
            </div>
          </div>
          <div className="admin-ai-monthly-reg-side-card total">
            <span className="side-letter">Σ</span>
            <div>
              <small>Chart sign-ups total</small>
              <strong>{fmtNum(chartRegistrationTotal)}</strong>
            </div>
          </div>
          <div className="admin-ai-monthly-reg-side-card months">
            <span className="side-letter">12</span>
            <div>
              <small>Months on chart</small>
              <strong>{fmtNum(monthly.length)}</strong>
            </div>
          </div>

          <p className="admin-ai-monthly-reg-side-heading admin-ai-monthly-reg-side-heading--platform">Platform all-time (UserRepo)</p>
          <div className="admin-ai-monthly-reg-side-card platform lender">
            <span className="side-letter">∞</span>
            <div>
              <small>Registered lenders</small>
              <strong>{fmtNum(allTimeLenders)}</strong>
            </div>
          </div>
          <div className="admin-ai-monthly-reg-side-card platform active">
            <span className="side-letter">✓</span>
            <div>
              <small>Deal-active lenders</small>
              <strong>{fmtNum(dealActiveLenders)}</strong>
            </div>
          </div>
          <div className="admin-ai-monthly-reg-side-card platform borrower">
            <span className="side-letter">∞</span>
            <div>
              <small>Registered borrowers</small>
              <strong>{fmtNum(allTimeBorrowers)}</strong>
            </div>
          </div>
        </aside>

        <div className="admin-ai-monthly-reg-chart-card">
          {hasData ? (
            <ReactApexChart type="area" height={360} series={chart.series} options={chart.options} />
          ) : (
            <div className="admin-ai-empty-state">
              Monthly lender/borrower chart will appear after backend restart loads monthlyRegistrationByType.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminAIMonthlyRegistrationChart;
