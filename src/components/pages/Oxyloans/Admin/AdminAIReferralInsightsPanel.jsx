import React, { useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import {
  FaArrowDown,
  FaArrowLeft,
  FaArrowUp,
  FaChartLine,
  FaInfoCircle,
  FaUserFriends,
  FaUsers,
  FaUserCheck,
  FaPercentage,
  FaHandshake,
} from "react-icons/fa";

const fmtNum = (value) => Number(value || 0).toLocaleString("en-IN");
const fmtPct = (value) => `${Number(value || 0).toFixed(1)}%`;
const n = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "growth", label: "Growth" },
  { id: "audience", label: "Audience" },
];

const KPI_ICONS = {
  users: FaUsers,
  friends: FaUserFriends,
  check: FaUserCheck,
  percent: FaPercentage,
  handshake: FaHandshake,
  chart: FaChartLine,
};

const HorizontalBars = ({ rows = [], valueKey = "value", labelKey = "label", showPct = false }) => {
  const max = Math.max(1, ...rows.map((row) => n(row[valueKey])));
  const total = rows.reduce((sum, row) => sum + n(row[valueKey]), 0) || 1;
  return (
    <div className="admin-ai-ig-bars">
      {rows.map((row) => {
        const value = n(row[valueKey]);
        const width = Math.max(4, Math.round((value / max) * 100));
        const pct = (value / total) * 100;
        return (
          <div key={String(row[labelKey])} className="admin-ai-ig-bar-row">
            <span className="admin-ai-ig-bar-label">{row[labelKey]}</span>
            <div className="admin-ai-ig-bar-track">
              <div className="admin-ai-ig-bar-fill" style={{ width: `${width}%` }} />
            </div>
            <strong className="admin-ai-ig-bar-value">
              {showPct ? fmtPct(pct) : fmtNum(value)}
            </strong>
          </div>
        );
      })}
    </div>
  );
};

const DonutChart = ({ series = [], labels = [], height = 220, colors }) => {
  const chartColors = colors || ["#7C3AED", "#312E81", "#0095F6", "#7DD3FC"];
  const options = useMemo(
    () => ({
      chart: { type: "donut", toolbar: { show: false }, animations: { enabled: true } },
      labels,
      legend: { position: "bottom", fontSize: "12px" },
      colors: chartColors,
      dataLabels: { enabled: false },
      plotOptions: {
        pie: {
          donut: {
            size: "68%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Total",
                formatter: () => fmtNum(series.reduce((sum, value) => sum + n(value), 0)),
              },
            },
          },
        },
      },
      stroke: { width: 0 },
      tooltip: {
        y: { formatter: (value) => fmtNum(value) },
      },
    }),
    [labels, series, chartColors]
  );
  if (!series.length || series.every((value) => n(value) <= 0)) {
    return null;
  }
  return (
    <ReactApexChart type="donut" height={height} series={series.map((value) => n(value))} options={options} />
  );
};

const GrowthChart = ({
  categories = [],
  registered = [],
  lent = [],
  seriesNames = ["Registered", "Lent"],
  height = 260,
}) => {
  const options = useMemo(
    () => ({
      chart: {
        type: "area",
        toolbar: { show: false },
        zoom: { enabled: false },
        animations: { enabled: true },
      },
      colors: ["#2563EB", "#7DD3FC"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 2.5 },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.35,
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },
      grid: {
        borderColor: "#EFEFEF",
        strokeDashArray: 3,
        padding: { left: 8, right: 8 },
      },
      xaxis: {
        categories,
        labels: { style: { colors: "#8E8E8E", fontSize: "11px" }, rotate: categories.length > 5 ? -35 : 0 },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: "#8E8E8E", fontSize: "11px" },
          formatter: (value) => fmtNum(value),
        },
      },
      legend: { position: "top", horizontalAlign: "left", fontSize: "12px" },
      tooltip: {
        y: { formatter: (value) => fmtNum(value) },
      },
    }),
    [categories]
  );

  const series = useMemo(
    () => [
      { name: seriesNames[0] || "Series A", data: registered.map((value) => n(value)) },
      { name: seriesNames[1] || "Series B", data: lent.map((value) => n(value)) },
    ],
    [registered, lent, seriesNames]
  );

  if (!categories.length) {
    return null;
  }

  return <ReactApexChart type="area" height={height} series={series} options={options} />;
};

const KpiCards = ({ cards = [] }) => (
  <div className="admin-ai-ig-kpi-row">
    {cards.map((card) => {
      const Icon = KPI_ICONS[card.icon] || FaChartLine;
      const trendUp = n(card.trend) >= 0;
      const showTrend = card.trend != null && Number.isFinite(Number(card.trend));
      return (
        <article key={card.label} className="admin-ai-ig-kpi-card">
          <div className="admin-ai-ig-kpi-icon" aria-hidden="true">
            <Icon />
          </div>
          <strong>{card.value}</strong>
          <span>{card.label}</span>
          {showTrend ? (
            <em className={trendUp ? "is-up" : "is-down"}>
              {trendUp ? <FaArrowUp /> : <FaArrowDown />}
              {" "}
              {Math.abs(n(card.trend)).toFixed(0)}% {card.trendLabel || "vs prior year"}
            </em>
          ) : card.hint ? (
            <em className="is-neutral">{card.hint}</em>
          ) : null}
        </article>
      );
    })}
  </div>
);

const InsightsBody = ({ data, tab, setTab, audienceMode, setAudienceMode, compact = false }) => {
  const hero = data.hero || {};
  const growth = data.growth || {};
  const audience = data.audience || {};
  const overviewStats = data.overviewStats || [];
  const growthStats = growth.stats || [];
  const kpiCards = data.kpiCards || [];
  const audienceBars = audienceMode === "leaders"
    ? (audience.leaders || [])
    : (audience.mix || []);

  return (
    <>
      <div className="admin-ai-ig-analytics-head">
        <div className="admin-ai-ig-analytics-title">
          <h3>{data.title || "Referral Insights"}</h3>
          <p>{data.profileHint || "Referral performance overview"}</p>
        </div>
        <div className="admin-ai-ig-analytics-meta">
          <span className="admin-ai-ig-chip">{data.profileName || "Referrals"}</span>
          <span className="admin-ai-ig-chip admin-ai-ig-chip--muted">{data.rangeLabel || "All years"}</span>
        </div>
      </div>

      <div className="admin-ai-ig-underline-tabs" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? "is-active" : ""}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {kpiCards.length ? <KpiCards cards={kpiCards} /> : null}

      <div className={`admin-ai-ig-tab-panels${compact ? " is-compact" : ""}`}>
        {tab === "overview" ? (
          <div className="admin-ai-ig-panel-grid">
            <section className="admin-ai-ig-panel-card">
              <div className="admin-ai-ig-block-head">
                <h4>{growth.chartTitle || "Referral trend"} <FaInfoCircle /></h4>
                <span>{growth.chartHint || "Registered vs Lent over time"}</span>
              </div>
              <GrowthChart
                categories={growth.categories}
                registered={growth.registered}
                lent={growth.lent}
                seriesNames={growth.seriesNames}
                height={compact ? 220 : 280}
              />
            </section>
            <aside className="admin-ai-ig-panel-side">
              <div className="admin-ai-ig-block-head">
                <h4>Snapshot <FaInfoCircle /></h4>
              </div>
              <ul className="admin-ai-ig-stat-list">
                {overviewStats.map((item) => (
                  <li key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </li>
                ))}
              </ul>
              {(audience.donutSeries || []).length ? (
                <>
                  <div className="admin-ai-ig-block-head" style={{ marginTop: 12 }}>
                    <h4>{audience.donutTitle || "Split"} <FaInfoCircle /></h4>
                  </div>
                  <DonutChart series={audience.donutSeries} labels={audience.donutLabels} height={200} />
                </>
              ) : null}
            </aside>
          </div>
        ) : null}

        {tab === "growth" ? (
          <div className="admin-ai-ig-panel-grid">
            <section className="admin-ai-ig-panel-card">
              <div className="admin-ai-ig-block-head">
                <h4>Growth <FaInfoCircle /></h4>
                <span>{hero.deltaLabel || "Compare yearly referral momentum"}</span>
              </div>
              <ul className="admin-ai-ig-stat-list">
                {growthStats.map((item) => (
                  <li key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </li>
                ))}
              </ul>
              <GrowthChart
                categories={growth.categories}
                registered={growth.registered}
                lent={growth.lent}
                seriesNames={growth.seriesNames}
                height={compact ? 220 : 280}
              />
            </section>
            {(growth.yearBars || []).length ? (
              <aside className="admin-ai-ig-panel-side">
                <div className="admin-ai-ig-block-head">
                  <h4>Top years <FaInfoCircle /></h4>
                </div>
                <HorizontalBars rows={growth.yearBars} showPct />
              </aside>
            ) : null}
          </div>
        ) : null}

        {tab === "audience" ? (
          <div className="admin-ai-ig-panel-grid">
            <section className="admin-ai-ig-panel-card">
              <div className="admin-ai-ig-block-head">
                <h4>Audience <FaInfoCircle /></h4>
                <div className="admin-ai-ig-segment">
                  <button
                    type="button"
                    className={audienceMode === "mix" ? "is-active" : ""}
                    onClick={() => setAudienceMode("mix")}
                  >
                    {audience.mixToggleLabel || "Mix"}
                  </button>
                  <button
                    type="button"
                    className={audienceMode === "leaders" ? "is-active" : ""}
                    onClick={() => setAudienceMode("leaders")}
                  >
                    {audience.leadersToggleLabel || "Leaders"}
                  </button>
                </div>
              </div>
              <HorizontalBars rows={audienceBars} showPct />
            </section>
            {(audience.donutSeries || []).length ? (
              <aside className="admin-ai-ig-panel-side">
                <div className="admin-ai-ig-block-head">
                  <h4>{audience.donutTitle || "Split"} <FaInfoCircle /></h4>
                </div>
                <DonutChart
                  series={audience.donutSeries}
                  labels={audience.donutLabels}
                  colors={["#7C3AED", "#312E81"]}
                />
                <div className="admin-ai-ig-gender-legend">
                  {(audience.donutLabels || []).map((label, index) => {
                    const seriesVals = audience.donutSeries || [];
                    const total = seriesVals.reduce((sum, value) => sum + n(value), 0) || 1;
                    const pct = (n(seriesVals[index]) / total) * 100;
                    return (
                      <div key={label}>
                        <i className={index === 0 ? "is-a" : "is-b"} />
                        <strong>{fmtPct(pct)}</strong>
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </aside>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
};

/**
 * Instagram Analytics-style insights header — embed on YearWise / Portfolio pages.
 */
export const AdminAIReferralInsightsHeader = ({ data = null, defaultTab = "overview" }) => {
  const [tab, setTab] = useState(defaultTab);
  const [audienceMode, setAudienceMode] = useState("mix");

  if (!data) {
    return null;
  }

  return (
    <div className="admin-ai-ig-analytics">
      <InsightsBody
        data={data}
        tab={tab}
        setTab={setTab}
        audienceMode={audienceMode}
        setAudienceMode={setAudienceMode}
        compact
      />
    </div>
  );
};

/**
 * Full Insights modal for expanded view.
 */
const AdminAIReferralInsightsPanel = ({ open, data = null, onClose }) => {
  const [tab, setTab] = useState("overview");
  const [audienceMode, setAudienceMode] = useState("mix");

  if (!open || !data) {
    return null;
  }

  return (
    <div className="admin-ai-modal-overlay admin-ai-insights-overlay" onClick={onClose} role="presentation">
      <div
        className="admin-ai-ig-insights admin-ai-ig-insights--wide"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={data.title || "Insights"}
      >
        <header className="admin-ai-ig-insights-top">
          <button type="button" className="admin-ai-ig-back" onClick={onClose} title="Close insights">
            <FaArrowLeft />
          </button>
          <h3>Insights</h3>
          <span className="admin-ai-ig-top-spacer" />
        </header>
        <div className="admin-ai-ig-scroll">
          <InsightsBody
            data={data}
            tab={tab}
            setTab={setTab}
            audienceMode={audienceMode}
            setAudienceMode={setAudienceMode}
          />
        </div>
      </div>
    </div>
  );
};

const pctChange = (current, previous) => {
  const cur = n(current);
  const prev = n(previous);
  if (prev <= 0) {
    return cur > 0 ? 100 : 0;
  }
  return ((cur - prev) / prev) * 100;
};

export const buildYearWiseInsightsData = ({
  yearCards = [],
  grandTotal = 0,
  grandRegistered = 0,
  grandLent = 0,
  topReferrers = [],
} = {}) => {
  const yearsAsc = [...(Array.isArray(yearCards) ? yearCards : [])]
    .map((row) => ({
      year: n(row.year),
      registeredCount: n(row.registeredCount),
      lentCount: n(row.lentCount),
      registeredLenderCount: n(row.registeredLenderCount),
      registeredBorrowerCount: n(row.registeredBorrowerCount),
      totalCount: n(row.totalCount) || (n(row.registeredCount) + n(row.lentCount)),
    }))
    .filter((row) => row.year > 0)
    .sort((a, b) => a.year - b.year);

  const totalRegistered = n(grandRegistered)
    || yearsAsc.reduce((sum, row) => sum + row.registeredCount, 0);
  const totalLent = n(grandLent)
    || yearsAsc.reduce((sum, row) => sum + row.lentCount, 0);
  const totalAll = n(grandTotal) || (totalRegistered + totalLent);
  const lenderReg = yearsAsc.reduce((sum, row) => sum + row.registeredLenderCount, 0);
  const borrowerReg = yearsAsc.reduce((sum, row) => sum + row.registeredBorrowerCount, 0);
  const conversion = totalAll > 0 ? (totalLent / totalAll) * 100 : 0;
  const bestLent = yearsAsc.reduce((best, row) => (row.lentCount > n(best?.lentCount) ? row : best), null);
  const bestRegistered = yearsAsc.reduce(
    (best, row) => (row.registeredCount > n(best?.registeredCount) ? row : best),
    null
  );
  const latest = yearsAsc[yearsAsc.length - 1];
  const previous = yearsAsc[yearsAsc.length - 2];
  const latestDelta = latest && previous
    ? latest.totalCount - previous.totalCount
    : 0;
  const top = (Array.isArray(topReferrers) ? topReferrers : []).slice(0, 8);
  const firstYear = yearsAsc[0]?.year;
  const lastYear = latest?.year;

  return {
    title: "Referral Analytics",
    profileName: "YearWise referrals",
    profileHint: "Discover Registered vs Lent referrals across years",
    rangeLabel: firstYear && lastYear ? `${firstYear} – ${lastYear}` : "All years",
    avatarText: "YR",
    hero: {
      value: totalAll,
      label: "all-time referrals",
      deltaLabel: latest && previous
        ? `${latestDelta >= 0 ? "+" : ""}${fmtNum(latestDelta)} vs ${previous.year} → ${latest.year}`
        : "Based on yearly referral summary",
    },
    kpiCards: [
      {
        label: "All-time referrals",
        value: fmtNum(totalAll),
        icon: "users",
        trend: latest && previous ? pctChange(latest.totalCount, previous.totalCount) : null,
        trendLabel: latest && previous ? `in ${latest.year} vs ${previous.year}` : undefined,
        hint: !previous ? "Lifetime total" : undefined,
      },
      {
        label: "Registered",
        value: fmtNum(totalRegistered),
        icon: "friends",
        trend: latest && previous ? pctChange(latest.registeredCount, previous.registeredCount) : null,
        trendLabel: latest && previous ? `in ${latest.year}` : undefined,
        hint: !previous ? "All registered" : undefined,
      },
      {
        label: "Lent",
        value: fmtNum(totalLent),
        icon: "handshake",
        trend: latest && previous ? pctChange(latest.lentCount, previous.lentCount) : null,
        trendLabel: latest && previous ? `in ${latest.year}` : undefined,
        hint: !previous ? "All lent" : undefined,
      },
      {
        label: "Lent conversion",
        value: fmtPct(conversion),
        icon: "percent",
        hint: "Lent / all-time",
      },
      {
        label: "Reg. lenders",
        value: fmtNum(lenderReg),
        icon: "check",
        hint: "Registered lender referrals",
      },
    ],
    overviewStats: [
      { label: "Registered", value: fmtNum(totalRegistered) },
      { label: "Lent", value: fmtNum(totalLent) },
      { label: "Lent conversion", value: fmtPct(conversion) },
      { label: "Registered lenders", value: fmtNum(lenderReg) },
      { label: "Registered borrowers", value: fmtNum(borrowerReg) },
    ],
    growth: {
      chartTitle: "New referrals by year",
      chartHint: "Registered and Lent counts since the first tracked year",
      categories: yearsAsc.map((row) => String(row.year)),
      registered: yearsAsc.map((row) => row.registeredCount),
      lent: yearsAsc.map((row) => row.lentCount),
      seriesNames: ["Registered", "Lent"],
      stats: [
        { label: "Overall referrals", value: fmtNum(totalAll) },
        { label: "Best Lent year", value: bestLent ? `${bestLent.year} · ${fmtNum(bestLent.lentCount)}` : "-" },
        {
          label: "Best Registered year",
          value: bestRegistered ? `${bestRegistered.year} · ${fmtNum(bestRegistered.registeredCount)}` : "-",
        },
      ],
      yearBars: [...yearsAsc]
        .sort((a, b) => b.lentCount - a.lentCount)
        .slice(0, 8)
        .map((row) => ({ label: String(row.year), value: row.lentCount })),
    },
    audience: {
      mixToggleLabel: "Type",
      leadersToggleLabel: "Top referrers",
      mix: [
        { label: "Registered lenders", value: lenderReg },
        { label: "Registered borrowers", value: borrowerReg },
        { label: "Lent referrals", value: totalLent },
        { label: "Registered referrals", value: totalRegistered },
      ].filter((row) => row.value > 0),
      leaders: top.map((row, index) => ({
        label: `#${index + 1} ${row.referrerCode || row.name || row.referrerId || "Referrer"}`,
        value: n(row.lentCount),
      })),
      donutTitle: "Registered vs Lent",
      donutLabels: ["Registered", "Lent"],
      donutSeries: [totalRegistered, totalLent],
    },
  };
};

export const buildPortfolioInsightsData = ({ totals = {} } = {}) => {
  const active = n(totals.activeLenders);
  const withReferrals = n(totals.withReferrals);
  const withLent = n(totals.withLentReferrals);
  const without = n(totals.withoutReferrals);
  const fromReferrers = n(totals.fromReferrers);
  const direct = n(totals.noParentReferrer);
  const invited = n(totals.invitedUsers);
  const registered = n(totals.registeredUsers);
  const referralRate = active > 0 ? (withReferrals / active) * 100 : 0;
  const lentEarnerRate = active > 0 ? (withLent / active) * 100 : 0;
  const fromShare = active > 0 ? (fromReferrers / active) * 100 : 0;
  const inviteToReg = invited > 0 ? (registered / invited) * 100 : 0;

  return {
    title: "Referral Portfolio Analytics",
    profileName: "Active lenders portfolio",
    profileHint: "Live portfolio mix, referral rate, and invite funnel",
    rangeLabel: "Live totals",
    avatarText: "PF",
    hero: {
      value: active,
      label: "active lenders",
      deltaLabel: `${fmtPct(referralRate)} actively referring · ${fmtPct(fromShare)} from referrers`,
    },
    kpiCards: [
      {
        label: "Active lenders",
        value: fmtNum(active),
        icon: "users",
        hint: "Portfolio size",
      },
      {
        label: "Active referrals",
        value: fmtNum(withReferrals),
        icon: "friends",
        trend: referralRate,
        trendLabel: "of active",
      },
      {
        label: "Lent earners",
        value: fmtNum(withLent),
        icon: "handshake",
        trend: lentEarnerRate,
        trendLabel: "of active",
      },
      {
        label: "From referrers",
        value: fmtNum(fromReferrers),
        icon: "check",
        trend: fromShare,
        trendLabel: "of active",
      },
      {
        label: "Invite to register",
        value: fmtPct(inviteToReg),
        icon: "percent",
        hint: invited > 0 ? `${fmtNum(registered)} / ${fmtNum(invited)}` : "No invites",
      },
    ],
    overviewStats: [
      { label: "Active referrals", value: fmtNum(withReferrals) },
      { label: "Lent referral earners", value: fmtNum(withLent) },
      { label: "Not actively referring", value: fmtNum(without) },
      { label: "From referrers", value: fmtNum(fromReferrers) },
      { label: "Direct lenders", value: fmtNum(direct) },
    ],
    growth: {
      chartTitle: "Portfolio segments",
      chartHint: "Lender segments and invite funnel side by side",
      categories: ["From referrers", "Direct", "Referring", "Lent earners", "Not referring"],
      registered: [fromReferrers, direct, withReferrals, withLent, without],
      lent: [invited, registered, withReferrals, withLent, without],
      seriesNames: ["Lender segments", "Invite funnel"],
      stats: [
        { label: "Referral rate", value: fmtPct(referralRate) },
        { label: "Lent earner rate", value: fmtPct(lentEarnerRate) },
        { label: "Invite to register", value: fmtPct(inviteToReg) },
      ],
      yearBars: [
        { label: "Active referrals", value: withReferrals },
        { label: "Lent earners", value: withLent },
        { label: "Not referring", value: without },
        { label: "From referrers", value: fromReferrers },
        { label: "Direct", value: direct },
      ],
    },
    audience: {
      mixToggleLabel: "Segments",
      leadersToggleLabel: "Funnel",
      mix: [
        { label: "Active lenders", value: active },
        { label: "From referrers", value: fromReferrers },
        { label: "Direct lenders", value: direct },
        { label: "Active referrals", value: withReferrals },
        { label: "Lent earners", value: withLent },
        { label: "Not referring", value: without },
      ].filter((row) => row.value > 0),
      leaders: [
        { label: "Invited users", value: invited },
        { label: "Registered users", value: registered },
        { label: "Still invited only", value: Math.max(0, invited - registered) },
      ].filter((row) => row.value > 0),
      donutTitle: "From referrers vs Direct",
      donutLabels: ["From referrers", "Direct"],
      donutSeries: [fromReferrers, direct],
    },
  };
};

/** @deprecated kept for any old imports; prefer buildYearWiseInsightsData */
export const buildYearWiseInsightsSections = (args) => {
  const data = buildYearWiseInsightsData(args);
  return [
    { title: "Overview", cards: (data.overviewStats || []).map((item) => ({ label: item.label, value: item.value })) },
  ];
};

/** @deprecated kept for any old imports; prefer buildPortfolioInsightsData */
export const buildPortfolioInsightsSections = (args) => {
  const data = buildPortfolioInsightsData(args);
  return [
    { title: "Overview", cards: (data.overviewStats || []).map((item) => ({ label: item.label, value: item.value })) },
  ];
};

export default AdminAIReferralInsightsPanel;
