# OxyLoans Frontend — Claude Context

## Working Directory
`/Users/radha/projects/oxyloans14.4/frontend/OxyLoansWeb`
React app. Radha's GitHub: `https://github.com/Ramadevithatavarti/oxyloans-web`
Sai's Bitbucket repo: `SaiKrishna1112/OxyLoansWeb`

## Tech Stack
- React (Create React App)
- Backend API base URL: configured in `src/config.js` as `MARKETPLACE_URL`
- Auth: `accessToken` stored in localStorage after login, sent as header on all API calls

## Run & Build
```bash
npm start        # dev server
npm run build    # production build
```

## Deploy (test server)
```bash
scp -P 2245 -i ~/Downloads/oxybrtest.pem -r build/* centos@15.207.239.145:/home/centos/frontend-build/
```

## AI Dashboard — What Was Built

### Page: `/lender-portfolio`
File: `src/components/pages/Oxyloans/Lender/LenderPortfolioDashboard.jsx`

**Tier system** (stored per lender in backend, URL override for testing):
- `?tier=FREE` — basic stats only
- `?tier=SMART` — adds active deals, payout reliability, reinvestment profile, referral totals
- `?tier=PRO` — everything + FY filter, charts, maturity planner, earnings intelligence, monthly referral table

**Collapsible sections** — all sections use `SectionCard` component:
- Default OPEN: Active Deals
- Default CLOSED: Charts, Reinvestment Profile, Smart Maturity Planner, Earnings Intelligence, Payout Reliability, Deal History, Referral Earnings
- Deal History is externally controlled (`dealSectionOpen` state) — opens automatically when an earnings tile is clicked

**Deal History filter**: ALL | ACTIVE | CLOSED toggle. "Show more" pagination loads 20 at a time.

**Referral monthly table**: shows 10 rows initially, "show more" adds 10 at a time. Always shows All Time regardless of FY filter.

**API calls made by this page:**
- `GET /v1/ai/lender/{id}/portfolio`
- `GET /v1/ai/lender/{id}/earnings?fy=&from=&to=`
- `GET /v1/ai/lender/{id}/upcoming-payouts` (loads independently/async)

## Sharing Changes with Sai
Changes are shared as a git patch file.
```bash
# Create patch (run in this repo)
git format-patch origin/master --stdout > ~/Desktop/ai-layer.patch

# Sai applies it in his repo
git apply ai-layer.patch
# If conflicts:
git apply --3way ai-layer.patch
```

## Security Rules
- Never store sensitive user data (PAN, Aadhaar) in localStorage or component state beyond what's needed for display
- Always send `accessToken` header on API calls — never embed tokens in URLs
- Document download URLs returned by the API are pre-signed (time-limited) — do not cache or store them
