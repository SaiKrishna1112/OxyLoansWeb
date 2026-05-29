# OxyLoans AI Portfolio Dashboard — Team Reference

## What Was Built

A new page `/lender-portfolio` that shows every lender a personalised AI-powered investment summary.

**File:** `src/components/pages/Oxyloans/Lender/LenderPortfolioDashboard.jsx`

---

## How to Add It to the App

### 1. Add the Route

In your routes file (wherever other lender routes are defined):

```jsx
import LenderPortfolioDashboard from "./components/pages/Oxyloans/Lender/LenderPortfolioDashboard";

// Add this route:
<Route path="/lender-portfolio" component={LenderPortfolioDashboard} />
// Or with lender ID param:
<Route path="/lender-portfolio/:lenderId" component={LenderPortfolioDashboard} />
```

### 2. Add to Sidebar

Find the lender sidebar links and add:

```jsx
<li>
  <a href="/lender-portfolio">
    <i className="fe fe-bar-chart-2" /> <span>My AI Portfolio</span>
  </a>
</li>
```

---

## Tier System

The dashboard has three plan tiers. The backend returns the tier for each lender.

| Tier | What lender sees |
|------|-----------------|
| **FREE** | Basic stats: invested, interest, wallet, deals count |
| **SMART** | + AI narrative insights, current FY earnings, reinvestment profile, referrals |
| **PRO** | + FY filter & custom date range, investment charts, maturity planner, earnings intelligence |

### Tier Preview Switcher (Demo Mode)

There is a banner at the top of the page — "Experience All Plans". Lenders can click FREE / SMART / PRO to preview what each tier shows. This is purely a frontend state change (no API calls) and is used to demonstrate the plans before commercialisation.

### URL Override for Testing

Add `?tier=FREE`, `?tier=SMART`, or `?tier=PRO` to the URL to force a tier without changing backend config. Useful for QA.

---

## API Calls

All calls use `accessToken` from `localStorage` as a header. Base URL is `MARKETPLACE_URL` from `src/config.js`.

| Endpoint | When called | What it returns |
|----------|-------------|-----------------|
| `GET /v1/ai/lender/{id}/portfolio` | Page load | Full portfolio: stats, deals, AI narrative, tier |
| `GET /v1/ai/lender/{id}/earnings?fy=&from=&to=` | Page load + FY filter change | Monthly earnings, FY totals, forecast |
| `GET /v1/ai/lender/{id}/upcoming-payouts` | Page load (parallel) | Next 60 days of scheduled payments |

The lender ID comes from the URL param (`:lenderId`) or falls back to `getUserId()` from localStorage.

---

## Backend Config (for reference — managed by Radha)

In `application.properties` on the server (never committed to git):

```properties
# Leave empty = ALL lenders get access
ai.enabled.lender.ids=

# Leave empty = ALL lenders get PRO tier
# To restrict after trial: ai.tier.premium.lender.ids=34447,27127,...
ai.tier.premium.lender.ids=

# Groq API (llama-3.3-70b) — used for AI narrative generation
groq.api.key=...
```

---

## Running Locally

```bash
npm install
npm start          # dev server on localhost:3000
npm run build      # production build → /build folder
```

**Backend URL**: Set in `src/config.js` → `MARKETPLACE_URL`. For local testing point it at `http://15.207.239.145:8080/oxynew`.

---

## Deploying to Test Server

```bash
npm run build
scp -P 2245 -i ~/Downloads/oxybrtest.pem -r build/* centos@15.207.239.145:/home/centos/frontend-build/
```

---

## Key Components in LenderPortfolioDashboard.jsx

| Component | Purpose |
|-----------|---------|
| `TierPreviewBanner` | Collapsible banner — FREE/SMART/PRO switcher for demo |
| `OxiBadge` | Tier pill badge shown in the hero header |
| `LockCard` | Greyed-out locked section shown on lower tiers |
| `SectionCard` | Collapsible card wrapper used for every section |
| `DealAnalyticsCharts` | ApexCharts — ROI distribution, tenure, monthly earnings |
| `UpcomingPayoutsSection` | Next 60 days payment calendar |
| `EarningsPeriodSummary` | FY/period 3-tile summary with AI narrative |
| `AIChatWidget` | Floating 🤖 chat button — calls `/v1/ai/chat` |

---

## Sharing Changes Between Repos

Changes are shared as a git patch when Sai cannot pull directly.

```bash
# Radha creates patch (run in this repo, from master)
git format-patch origin/master --stdout > ~/Desktop/ai-layer.patch

# Sai applies it in his repo
git apply ai-layer.patch
# If conflicts:
git apply --3way ai-layer.patch
```

---

## GitHub Repos

- **Radha's GitHub** (latest): `https://github.com/Ramadevithatavarti/oxyloans-web`
- **Sai's GitHub**: `https://github.com/SaiKrishna1112/OxyLoansWeb`
- **Bitbucket** (backend): `https://bitbucket.org/srsfintechlabs/oxyloans.com` — branch `feature/ai-layer`
