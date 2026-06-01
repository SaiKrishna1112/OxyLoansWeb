# AI Lender Dashboard — Change Log & Feature Reference

**Branch:** `feature/ai-lender-chat`  
**Last updated:** 2026-05-29  
**Primary file:** `src/components/pages/Oxyloans/Lender/LenderPortfolioDashboard.jsx`

---

## Summary of Changes (May 26–29, 2026)

These changes were built on top of the `d847e90` commit and represent the
current test server state. They are ready to merge to prod after review.

---

## 1. Login & Navigation

### Login Redirect (Loginotp.jsx)
- **Before:** LENDER → `/dashboard` (old basic dashboard)
- **After:** LENDER → `/lenderAIDashboard` (AI portfolio dashboard)
- ADMIN / HELPDESKADMIN → `/oxyloansadmindashboard`
- Borrower → `/borrowerDashboard`

### Sidebar (SideBar.jsx)
Order for lender:
1. **AI Dashboard** → `/lenderAIDashboard` ← primary entry point
2. **Dashboard** → `/dashboard` (old, kept for fallback)
3. **AI Earnings** → `/ai/lender-earnings`
4. **AI Plan** → `/ai/plan`
5. Transactions, Profile, Load Wallet … (unchanged)

### New Routes (approuter.jsx)
| Route | Component | Notes |
|---|---|---|
| `/ai/lender-earnings` | `LenderEarningsDashboard` | Detailed earnings view |
| `/ai/lender-earnings/:lenderId` | `LenderEarningsDashboard` | Admin view for any lender |
| `/ai/plan` | `LenderAIPlanPage` | Free / Smart / Pro plan cards |

---

## 2. New Pages

### LenderAIPlanPage (`src/components/pages/Dashboard/LenderAIPlanPage.jsx`)
Standalone subscription tier page at `/ai/plan`.
- 3 plan cards: **Free** (₹0 / Groq), **Smart** (₹500/yr / Gemini), **Pro** (₹1,000/yr / Claude)
- Feature checklist per plan (✓ included, ✗ not included)
- Current plan highlighted — fetched from `data.membershipTier` on portfolio API
- Upgrade buttons show "🔒 Upgrade — Coming Soon" (payment flow not yet built)
- AI Model comparison table at bottom
- **Payment flow (TODO):** Wire to existing Cashfree gateway, same as lender membership

### LenderEarningsDashboard (`src/components/pages/Dashboard/LenderEarningsDashboard.jsx`)
Detailed earnings breakdown page at `/ai/lender-earnings`.
- FY filter, monthly breakdown, interest + principal table

---

## 3. AI Dashboard — This Month Strip (LR34447 requests)

All features requested by LR34447 are implemented in
`Oxyloans/Lender/LenderPortfolioDashboard.jsx`.

### 3a. Strip moved below Earnings Period filter
**Before:** 5 highlight tiles appeared at the very top of the page (above the
hero card) — always visible regardless of which period was selected.

**After:** Strip only appears when **Current Month** tab is selected in the
Earnings Period filter. All other tabs (All Time, FY, Custom) show the standard
earnings summary instead.

Layout:
```
Earnings Period: [Current Month] [All Time] [FY 24-25] [FY 25-26] [FY 26-27] [Custom]
                  ↑ default selected
↓ When Current Month is active:
┌─────────────────┬──────────────────┬─────────────┬──────────────────┬──────────────────┬─────────────────────┐
│ Interest This   │ Principal This   │ Wallet      │ Maturing This    │ Referral This    │ Deal Participation  │
│ Month           │ Month            │ Balance     │ Month            │ Month            │ (new — see §3f)     │
│ ₹X earned       │ ₹Y returned      │ ₹Z          │ N deals          │ ₹W credited      │ mine / platform     │
│ + ₹P projected  │ ▼ per deal       │ invest gap  │ ▼ deal list      │                  │ X% rate             │
│ ▼ per deal      │                  │             │                  │                  │                     │
└─────────────────┴──────────────────┴─────────────┴──────────────────┴──────────────────┴─────────────────────┘
```

### 3b. Interest This Month — breakdown
- Shows `₹X earned` + `₹Y projected` with progress bar (% earned of month total)
- Click tile → expands per-deal breakdown from `data.currentMonthInterestByDeal`
- Each row: deal name + amount; projected deals marked with "projected" label
- **Annual payout deals excluded** from projection (`payoutFrequency !== "YEARLY"` filter)
- Note displayed: "Annual payout deals excluded from projection"

**Backend field:** `currentMonthInterestByDeal` — array of:
```json
{ "dealId": 123, "dealName": "Deal Name", "amount": 5000, "status": "paid|projected", "payoutFrequency": "MONTHLY|YEARLY" }
```

### 3c. Principal This Month — breakdown (new)
- Shows `₹X returned` or "No deals closed this month"
- Click tile → expands per-deal breakdown from `data.currentMonthPrincipalByDeal`
- Each row: deal name + principal amount

**Backend field needed:** `currentMonthPrincipalByDeal` — array of:
```json
{ "dealId": 123, "dealName": "Deal Name", "amount": 100000 }
```
> Currently `currentMonthPrincipalReturned` (total) exists. The per-deal array
> needs to be added to `LenderPortfolioDto` and populated in `LenderPortfolioService`.

### 3d. Wallet Balance tile
- Shows investable amount with gap message (`data.investableGapMessage`)
- Green if ₹0 (fully invested), blue if wallet has balance

### 3e. Maturing This Month
- Count of deals maturing in current month (`data.maturingThisMonthCount`)
- Click → expands list of deals (`data.maturingThisMonthDeals`)

### 3f. Deal Participation Tile (NEW — backend pending)
**Request from LR27127:** Show how many platform deals this lender participated
in vs total deals launched on the platform this month.

**Frontend:** Tile added. Shows `mine / launched` with participation % bar.
Falls back to "Platform data coming soon" if `platformDealsLaunchedThisMonth` is 0.

**Backend TODO:**
1. Add to `LenderPortfolioDto`:
   ```java
   private Integer platformDealsLaunchedThisMonth;  // total deals on platform this month
   private Integer myDealsThisMonth;                 // this lender's active deals started this month
   ```
2. In `LenderPortfolioService.buildPortfolioDto()`:
   ```java
   // platform deals launched this month
   LocalDate firstOfMonth = LocalDate.now().withDayOfMonth(1);
   int platformLaunched = dealRepository.countDealsLaunchedAfter(firstOfMonth);
   int myThisMonth = lenderDealRepository.countByLenderIdAndStartDateAfter(lenderId, firstOfMonth);
   dto.setPlatformDealsLaunchedThisMonth(platformLaunched);
   dto.setMyDealsThisMonth(myThisMonth);
   ```
3. REST endpoint: no change needed — already returned via `/v1/ai/lender/{id}/portfolio`

---

## 4. LR34447 Feature Checklist

| Feature | Status | Where |
|---|---|---|
| Default to Current Month in FY filter | ✅ Done | `useState(currentMonthFilter())` — line ~1069 |
| One more star motivation tip | ✅ Done | `data.nextStarTip` banner below reinvestment stars |
| Silver / Gold / Platinum / Loyal badges | ✅ Done | `MembershipBadge` component, `data.membershipBadge` |
| Collapse/expand AI narrative | ✅ Done | `narrativeExpanded` — defaults to 2 lines, expandable |
| This Month highlight strip | ✅ Done | Below FY filter when Current Month selected |
| Interest this month + projected | ✅ Done | With per-deal breakdown |
| Annual deals excluded from projection | ✅ Done | `payoutFrequency !== "YEARLY"` filter |
| Principal returned this month | ✅ Done | With per-deal breakdown (needs backend field) |
| Deals maturing this month | ✅ Done | Clickable count → deal list |
| Referral earned this month | ✅ Done | `data.referralThisMonthCredited` |
| Platform Pulse section | ✅ Done | Bottom of page — company-wide monthly stats |

---

## 5. Backend Fields Reference

All fields come from `GET /v1/ai/lender/{id}/portfolio` (`LenderPortfolioDto`).

### Already implemented:
| Field | Type | Description |
|---|---|---|
| `membershipTier` | String | FREE / SMART / PRO — drives AI model + feature gating |
| `membershipBadge` | String | SILVER / GOLD / PLATINUM / LOYAL / MEMBER |
| `nextStarTip` | String | Message on how to earn next reinvestment star |
| `currentMonthInterestEarned` | Long | Interest paid to lender this month |
| `currentMonthInterestProjected` | Long | Projected interest (monthly deals only) |
| `currentMonthInterestByDeal` | List | Per-deal breakdown (dealId, dealName, amount, status) |
| `currentMonthPrincipalReturned` | Long | Principal returned this month total |
| `maturingThisMonthCount` | Integer | Count of deals maturing this month |
| `maturingThisMonthDeals` | List | Deal list (dealId, amount) |
| `referralThisMonthCredited` | Long | Referral bonus credited this month |
| `walletBalance` | Long | Current wallet balance |
| `investableGapMessage` | String | Human-readable message about investable gap |

### Pending (TODO for backend):
| Field | Type | Description |
|---|---|---|
| `currentMonthPrincipalByDeal` | List | Per-deal principal breakdown — for tile drill-down |
| `platformDealsLaunchedThisMonth` | Integer | Platform-wide deal count (LR27127 request) |
| `myDealsThisMonth` | Integer | This lender's deals started this month |

---

## 6. Subscription / AI Plan

### Plan definitions (LenderAIPlanPage.jsx):
| Plan | AI Model | Price | Key features |
|---|---|---|---|
| Free | Groq (Llama) | ₹0 | Basic portfolio stats, AI narrative |
| Smart (OXI Smart) | Gemini 2.0 Flash | ₹500/yr + GST | FY filter, 6 chart types, maturity planner, earnings intelligence |
| Pro (OXI Pro) | Claude (Anthropic) | ₹1,000/yr + GST | Everything + investable gap, platform health pulse, priority support |

### Backend tier logic (AITaskRouter.java):
```
ai.tier.premium.lender.ids=   # empty = all lenders get PRO (trial mode)
ai.tier.gemini.lender.ids=39928
ai.provider=groq               # default fallback
```

### Payment flow (TODO):
- Upgrade buttons currently show "🔒 Upgrade — Coming Soon"
- To be wired to existing Cashfree payment gateway (same as lender membership)
- After payment: update `membershipTier` in DB → user gets next AI model on next login

---

## 7. Files Changed in This Commit

| File | Change |
|---|---|
| `src/components/pages/Authentication/Loginotp.jsx` | LENDER redirect → `/lenderAIDashboard` |
| `src/components/SideBar/SideBar.jsx` | AI Dashboard first; added AI Earnings, AI Plan links |
| `src/approuter.jsx` | Added `/ai/lender-earnings`, `/ai/plan` routes |
| `src/components/pages/Oxyloans/Lender/LenderPortfolioDashboard.jsx` | Strip moved below FY filter; principal breakdown; deal participation tile |
| `src/components/pages/Dashboard/LenderAIPlanPage.jsx` | NEW — subscription plan page |
| `src/components/pages/Dashboard/LenderEarningsDashboard.jsx` | NEW — detailed earnings page |

---

## 8. Pending Before Prod Deploy

- [ ] `otp.bypass=false` in `application-test.properties` (currently `true` for testing)
- [ ] Run `in_app_notification` table DDL on `oxyloansprodtest` (marketplace-migration.sql lines 251–264)
- [ ] Change `ENV="test"` → `ENV="production"` in `src/config.js`
- [ ] Backend: add `currentMonthPrincipalByDeal` to `LenderPortfolioDto`
- [ ] Backend: add `platformDealsLaunchedThisMonth` + `myDealsThisMonth` to `LenderPortfolioDto`
- [ ] Payment flow for Smart/Pro plan upgrades via Cashfree
- [ ] Full regression: LR43445 (Vahini) and LR27127 (Satish Kumar) portfolio views
