import React from "react";
import { Link, useLocation } from "react-router-dom";

/** Click any item → opens that page only → fetches only that report's data. */
export const AI_NAV_SECTIONS = [
  {
    title: "Home",
    items: [
      { path: "/adminAIDashboard", label: "Control Panel Home", icon: "fas fa-home", exact: true },
    ],
  },
  {
    title: "CMS & Payouts",
    items: [
      {
        path: "/adminAIDashboard/cms-lender-payouts",
        label: "Lender Payout Status",
        icon: "fas fa-money-check-alt",
        isNew: true,
        hint: "Credited vs not credited per deal",
      },
      { path: "/adminAIDashboard/cms-reconciliation", label: "CMS Reconciliation", icon: "fas fa-scale-balanced", hint: "Initiated vs confirmed bank payouts" },
      { path: "/adminAIDashboard/view-payments", label: "Upcoming Payouts", icon: "fas fa-calendar-check", hint: "Interest due in next 3 days" },
    ],
  },
  {
    title: "Wallet & Participation",
    items: [
      { path: "/adminAIDashboard/capital-liquidity", label: "Lender Wallet", icon: "fas fa-wallet", hint: "Balance, deployment, liquidity" },
      { path: "/adminAIDashboard/participation-insights", label: "Participation", icon: "fas fa-chart-pie", hint: "Monthly, quarterly, annual mix" },
    ],
  },
  {
    title: "Borrowers",
    items: [
      { path: "/adminAIDashboard/borrower-summary", label: "Borrower Summary", icon: "fas fa-layer-group" },
      { path: "/adminAIDashboard/borrower-fees", label: "Borrower Fees", icon: "fas fa-file-invoice-dollar" },
      { path: "/adminAIDashboard/borrower-collateral", label: "FD Collateral", icon: "fas fa-shield-alt" },
      { path: "/adminAIDashboard/borrower-accounts", label: "Borrower Accounts", icon: "fas fa-user-graduate" },
    ],
  },
  {
    title: "Deals",
    items: [
      { path: "/adminAIDashboard/portfolio-overview", label: "Portfolio Overview", icon: "fas fa-chart-pie" },
      { path: "/adminAIDashboard/deals-directory", label: "Deal Directory", icon: "fas fa-briefcase" },
      { path: "/adminAIDashboard/deal-roi-board", label: "Deal Performance", icon: "fas fa-table-list" },
      { path: "/adminAIDashboard/deal-intelligence", label: "Deal Recommendations", icon: "fas fa-lightbulb" },
    ],
  },
  {
    title: "Lenders",
    items: [
      { path: "/adminAIDashboard/top-lenders", label: "Top Lenders", icon: "fas fa-trophy" },
      { path: "/adminAIDashboard/lender-directory", label: "Lender Directory", icon: "fas fa-address-book" },
      { path: "/adminAIDashboard/risk-summary", label: "Risk Overview", icon: "fas fa-shield-halved" },
      { path: "/adminAIDashboard/operations-alerts", label: "Priority Alerts", icon: "fas fa-bell" },
    ],
  },
  {
    title: "Financial Year",
    items: [
      { path: "/adminAIDashboard/financial-kpis", label: "FY KPIs", icon: "fas fa-gauge-high" },
      { path: "/adminAIDashboard/monthly-payout", label: "FY Payout Trend", icon: "fas fa-chart-line" },
      { path: "/adminAIDashboard/fy-earners", label: "FY Top Earners", icon: "fas fa-medal" },
      { path: "/adminAIDashboard/top-deals", label: "FY Top Deals", icon: "fas fa-handshake" },
      { path: "/adminAIDashboard/fees-revenue", label: "Revenue & Fees", icon: "fas fa-receipt" },
    ],
  },
];

const isActive = (pathname, path, exact) => {
  if (exact) return pathname === path || pathname === `${path}/`;
  return pathname === path || pathname.startsWith(`${path}/`);
};

const AdminAIDashboardNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="ai-dash-nav" aria-label="Analytics menu — one report per page">
      <div className="ai-dash-nav-head">
        <i className="fas fa-list me-2" />
        <span>Analytics Menu</span>
      </div>
      {AI_NAV_SECTIONS.map((section) => (
        <div key={section.title} className="ai-dash-nav-section">
          <div className="ai-dash-nav-section-title">{section.title}</div>
          <ul className="ai-dash-nav-list">
            {section.items.map((item) => {
              const active = isActive(pathname, item.path, item.exact);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`ai-dash-nav-link ${active ? "ai-dash-nav-link--active" : ""}`}
                    title={item.hint || item.label}
                  >
                    <i className={`${item.icon} ai-dash-nav-icon`} />
                    <span className="ai-dash-nav-label">
                      {item.label}
                      {item.isNew && <span className="ai-nav-new-pill">NEW</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
};

export default AdminAIDashboardNav;
