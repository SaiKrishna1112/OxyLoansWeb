# OxyLoans Project Development & Conversions Process Log

This document tracks all features, user interface redesigns, API integrations, chat completions, and conversions developed in the OxyLoans React application.

---

## 🚀 Overview

The **OxyLoans React Web Platform** is a Peer-to-Peer (P2P) Fintech Lending Marketplace connecting Borrowers and Lenders. This project includes modern UI redesigns (`/redesign`), automated digital contract eSigning, Cashfree eNACH auto-debit registration, AI-driven credit scoring, and comprehensive admin disbursal controls.

---

## 📋 Completed Features & Conversions Log

### 1. eNACH Auto-Debit Setup & Redirect Fixes (`MarketplaceEnach.jsx`)
- **Location**: `src/components/pages/Oxyloans/Borrower/redesign/pages/MarketplaceEnach.jsx`
- **APIs**:
  - `GET /v1/user/{userId}/loan/{loanRequestId}/borrowerLoanEnachMandates`
  - `POST /v1/user/{userId}/loan/borrowerLoanCashfreeEnach/{mandateId}/start`
  - `GET /v1/user/{userId}/loan/borrowerLoanCashfreeEnach/{mandateId}/status`
- **Key Enhancements & Bug Fixes**:
  - **Token & Session Persistence**: Fixed 401 Unauthorized errors after Cashfree external redirects by prioritizing `sessionStorage` token state and synchronizing with `localStorage`.
  - **Header Standardization**: Updated request headers in `afterlogin.js` to supply both `accessToken` and `accesstoken` across all eNACH backend endpoints.
  - **Cashfree SDK Safeguards**: Wrapped Cashfree JS SDK checkout in safe initialization checks with fallback to `authorizationUrl` redirects.
  - **Trailing Slash Route Support**: Added optional trailing slash matching (`/enach/:loanRequestId/`) in `approuter.jsx` and `appcontainer.jsx`.
  - **Automated Mandate Polling & Status Transition**: Automatic polling for `ACTIVE` or `SUCCESS` mandate status with SweetAlert2 notifications.

---

### 2. Agreement eSign Workflow (`MarketplaceEsign.jsx`)
- **Location**: `src/components/pages/Oxyloans/Borrower/redesign/pages/MarketplaceEsign.jsx`
- **APIs**:
  - `GET /v1/user/{userId}/loan/{loanRequestId}/borrowerLoanAgreementStatus`
  - `POST /v1/user/{userId}/loan/borrowerLoanAgreement/start`
  - `POST /v1/user/{userId}/loan/{loanRequestId}/uploadAgreementForLRAndBr`
- **Key Features**:
  - Digital loan agreement preview and multi-party signing.
  - Cashfree eSign modal & fallback external window redirect logic.
  - Automatic progression to eNACH setup (`/enach/:loanRequestId`).

---

### 3. Borrower Marketplace Listings & Nearby Borrowers
- **Location**:
  - `src/components/pages/Oxyloans/Borrower/redesign/pages/BorrowerMarketplaceListings.jsx`
  - `src/components/pages/Oxyloans/Borrower/redesign/pages/NearbyBorrowers.jsx`
- **Key Features**:
  - Interactive grid and map views for lenders to browse active loan requests.
  - Geolocation filtering by proximity radius (km).
  - Risk rating tags, interest rate ranges, and repayment terms display.

---

### 4. Admin Disbursal & Reconciliation Controls (`AdminDisbursalControl.jsx`)
- **Location**: `src/components/pages/Oxyloans/Admin/AdminDisbursalControl.jsx`
- **APIs**:
  - eNACH status audit (`ENACH_APPROVED` / `PENDING`).
  - Disbursal wallet deduction and transaction verification.
  - False-paid EMI reversals and manual reconciliation triggers.

---

### 5. Authentication, Token Sliding Expiry & Interceptors (`afterlogin.js`)
- **Location**: `src/components/HttpRequest/afterlogin.js`
- **Key Enhancements**:
  - Axios response interceptor for `401 Unauthorized` session renewal prompts.
  - Synchronized `sessionStorage` and `localStorage` token generation (`getNewSessionTime`).
  - Consistent header handling (`accessToken` + `accesstoken`) across all authenticated API calls.

---

### 6. Loan Negotiation & Consent Management
- **Components**:
  - `InterestRateNegotiation.jsx`: Interactive counter-offer negotiation between borrowers & lenders.
  - `BorrowerMarketplaceConsent.jsx` & `LenderMarketplaceConsent.jsx`: Digital consent forms before contract generation.
  - `FeeDisclosure.jsx` & `RepaymentView.jsx`: Transparent fee breakdowns and EMI amortization tables.

---

## 📌 Route Mapping Summary

| Path | Component | Description |
| :--- | :--- | :--- |
| `/my-marketplace-loans` | `BorrowerMarketplaceListings` | Borrower loan requests overview |
| `/nearby-borrowers` | `NearbyBorrowers` | Proximity loan discovery |
| `/esign/:loanRequestId` | `MarketplaceEsign` | Cashfree digital contract eSign |
| `/enach/:loanRequestId` | `MarketplaceEnach` | Cashfree eNACH auto-debit setup |
| `/borrower-emi-schedule` | `BorrowerEmiSchedule` | Loan EMI repayment schedule |
| `/admin/disbursal-control` | `AdminDisbursalControl` | Disbursal and mandate admin management |

---

## 🛠 Maintenance & Development Guidelines
1. **Header Consistency**: Always include both `accessToken` and `accesstoken` headers in new backend API helper functions inside `afterlogin.js`.
2. **Session Storage**: Use `sessionStorage` as the primary token holder and keep `localStorage` synced for tab resets or cross-domain redirects.
3. **Route Handling**: When creating new route paths that receive external callbacks, register both canonical (`/path/:id`) and trailing slash (`/path/:id/`) patterns in `approuter.jsx` and `appcontainer.jsx`.
