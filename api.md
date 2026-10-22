# OxyLoans Instant Loan Flow — API Architecture & Integration Specification

> **Version:** 2.0.0  
> **Status:** Active / Production Pilot  
> **Target Borrower Pilot ID:** `41682`  
> **Centralized API Client Module:** [`src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/instantLoanApi.js`](file:///E:/Oxyloans/Oxyloans%20web/OxyloansReact/src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/instantLoanApi.js)  
> **Centralized Re-Export:** [`src/components/HttpRequest/instantLoanApi.js`](file:///E:/Oxyloans/Oxyloans%20web/OxyloansReact/src/components/HttpRequest/instantLoanApi.js)

---

## 1. Executive Summary & Flow Scope

The **Instant Loan Flow** provides pre-approved borrowers with a seamless 7-step digital journey from KYC verification to automated escrow disbursal:

```
[Step 1: Complete Borrower Profile & KYC]
               │
               ▼
[Step 2: Pre-Eligibility Assessment, Emergency References & Fee (₹150)]
               │
               ▼
[Step 3: Paysprint Credit Bureau CIR & PAN Audit Verification]
               │
               ▼
[Step 4: Real-Time Underwriting & Offer Selection (Bullet vs EMI)]
               │
               ▼
[Step 5: Aadhaar eSign & NPCI eNACH Repayment Mandate]
               │
               ▼
[Step 6: Bank Account Verification & ₹1.00 Penny Drop (Disbursal Time)]
               │
               ▼
[Step 7: Escrow Disbursal Status & Countdown Tracker — Unlocks Sidebar & Full Profile]
```

### Flow & Navigation Architecture Rules
1. **Login & Registration Experience:**
   - After login or registration, Borrower `41682` is routed to `/instant-borrower-dashboard`.
   - On this screen, the borrower sees **ONLY the Header and the Instant Loan Flow Screen** (NO sidebar).
   - Sidebar toggle buttons, mobile toggles, and sidebar navigation are completely suppressed (`body.instant-flow-no-sidebar`).
2. **PAN Verification Timing:**
   - PAN card format is validated at Step 1, but legal and risk verification occurs strictly against Credit Bureau CIR records in **Step 3**.
3. **Bank Details Verification Timing:**
   - Bank details and NPCI Penny Drop (₹1.00 IMPS validation) are verified at **Step 6** (disbursal setup time).
4. **Sidebar & Profile Unlock Milestone:**
   - The sidebar and full profile access are locked while steps 1 through 6 are in progress.
   - Once all 6 steps are completed (`currentStep >= 7` / `isCompleted: true`), the sidebar automatically unlocks and appears, and the user gains full access to view and manage `/instant-borrower-profile`.

### Strict User Isolation Guarantee
- **Borrower ID `41682`:** Exclusive pilot user for this refined instant flow.
- **All Other Borrowers:** Retain their 100% existing legacy experience undisturbed (`/borrowerDashboard`, `/borrowerProfile`, `/loanRequest`, etc.).

---

## 2. Existing OxyLoans APIs Integrated into `instantLoanApi.js`

All endpoints listed below are wired into [`instantLoanApi.js`](file:///E:/Oxyloans/Oxyloans%20web/OxyloansReact/src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/instantLoanApi.js) with standard `accessToken` headers, timeouts, and graceful fallbacks.

### Base URLs
- `API_USER_URL`: `https://fintech.oxyloans.com/oxyloans/v1/user/`
- `MARKETPLACE_URL`: `https://fintech.oxyloans.com/oxyloans`

---

### Step 1: Borrower Profile & KYC

> **Important Note:** Emergency reference numbers are **NOT** used or required in this instant loan flow. OxyLoans provides a separate dedicated API (`/v1/user/borrowerReferenceDetails`) for reference contacts, which is managed independently. Step 1 focuses solely on borrower personal, residential, and employment information.

#### 1. Fetch Borrower Profile
- **Function:** `fetchBorrowerProfile(userId)`
- **HTTP Method:** `GET`
- **Endpoint:** `/v1/user/personal/{userId}` (e.g. `https://fintech.oxyloans.com/oxyloans/v1/user/personal/41682`)
- **Headers:** `{ "accessToken": "<token>", "Content-Type": "application/json" }`
- **Response (200 OK — Live Backend Response):**
```json
{
  "userId": 41682,
  "userDisplayId": "BR1041682",
  "firstName": "DHARMAPURI SAI KRISHNA",
  "lastName": "",
  "userName": "Mr  DHARMPURI  SAIKR",
  "fatherName": "Satya",
  "dob": "08/11/1999",
  "gender": "Male",
  "maritalStatus": "Single",
  "panNumber": "JUXPK2964M",
  "panVerified": true,
  "mobileNumber": "7702443666",
  "whatsAppNumber": "918125861874",
  "email": "somethingspecialday@gmail.com",
  "emailVerified": true,
  "address": "Hyderabad,\n",
  "permanentAddress": "Hyderabad,\n",
  "locality": "Tirumalagiri",
  "city": "Hyderabad",
  "state": "Telangana",
  "pinCode": "500085",
  "employment": "SALARIED",
  "companyName": "oxyloans",
  "salary": 25000,
  "salaryNew": 25000.0,
  "workExperience": "2",
  "loanRequestAmount": 5000.0,
  "accountNumber": "34209820038",
  "ifscCode": "SBIN0008505",
  "bankName": "STATE BANK OF INDIA",
  "branchName": "MUKUNDAPURAM",
  "bankAddress": "MUKUNDAPURAM",
  "referenceDetailsResponseDto": {
    "reference1": "9848022338",
    "reference2": "9121234567",
    "reference3": "8712230023",
    "reference4": "8712230006"
  }
}
```

#### 2. Update Borrower Profile Details
- **Function:** `updateBorrowerProfile(payload)`
- **HTTP Method:** `PATCH`
- **Endpoint:** `/v1/user/personalDetails`
- **Request Body:**
```json
{
  "userId": 41682,
  "firstName": "DHARMAPURI SAI KRISHNA",
  "lastName": "",
  "mobileNumber": "7702443666",
  "whatsAppNumber": "918125861874",
  "email": "somethingspecialday@gmail.com",
  "gender": "Male",
  "fatherName": "Satya",
  "maritalStatus": "Single",
  "dob": "1999-11-08",
  "panNumber": "JUXPK2964M",
  "salary": 25000,
  "employmentType": "SALARIED",
  "companyName": "oxyloans",
  "designation": "Software Engineer",
  "workExperience": "2",
  "address": "Hyderabad",
  "locality": "Tirumalagiri",
  "city": "Hyderabad",
  "state": "Telangana",
  "pinCode": "500085"
}
```
- **Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "message": "Profile details updated successfully."
}
```

---

### Step 2: Pre-Eligibility, Emergency References & Assessment Fee

> **Important Architecture Rule:** In Step 2, emergency references are loaded and saved exclusively via OxyLoans' dedicated reference endpoints (`GET /v1/user/{userId}/borrowerReferenceDetails` and `PATCH /v1/user/borrowerReferenceDetails`). They are **NOT** read from the profile details API (`/personal/{userId}`).

#### 3. Fetch Emergency References (Dedicated API)
- **Function:** `fetchBorrowerReferences(userId)`
- **HTTP Method:** `GET`
- **Endpoint:** `/v1/user/{userId}/borrowerReferenceDetails`
- **Response (200 OK):**
```json
{
  "userId": 41682,
  "referenceDto": [
    {
      "name": "Satya (Father)",
      "referenceNumber": "9848022338",
      "relation": "Parent",
      "address": "Tirumalagiri, Hyderabad",
      "landMark": "Father Reference"
    },
    {
      "name": "Kiran V (Colleague)",
      "referenceNumber": "9121234567",
      "relation": "Colleague",
      "address": "Madhapur, Hyderabad",
      "landMark": "Colleague Reference"
    }
  ]
}
```

#### 4. Save / Update Emergency References (Dedicated API)
- **Function:** `saveBorrowerReferences(ref1, ref2, userId)`
- **HTTP Method:** `PATCH`
- **Endpoint:** `/v1/user/borrowerReferenceDetails`
- **Request Body:**
```json
{
  "userId": 41682,
  "updateReferenceDetails": true,
  "referenceDto": [
    {
      "name": "Satya (Father)",
      "referenceNumber": "9848022338",
      "address": "Tirumalagiri, Hyderabad",
      "landMark": "Parent"
    },
    {
      "name": "Kiran V (Colleague)",
      "referenceNumber": "9121234567",
      "address": "Madhapur, Hyderabad",
      "landMark": "Colleague"
    }
  ]
}
```
- **Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "message": "Borrower references updated successfully."
}
```

#### 5. Fetch Borrower Pre-Approved Eligible Amount
- **Function:** `fetchBorrowerEligibility(userId)`
- **HTTP Method:** `GET`
- **Endpoint:** `/v1/user/borrowerElgibleAmount/{userId}`
- **Response (200 OK):**
```json
{
  "userId": 41682,
  "eligibleAmount": 58500,
  "maxEligibleLimit": 100000,
  "salaryMultiplier": 0.9
}
```

#### 6. Fetch Indicative ROI Based on CIBIL Tier
- **Function:** `fetchCibilRoi(userId)`
- **HTTP Method:** `GET`
- **Endpoint:** `/v1/user/{userId}/getCibilBasedRoi`
- **Response (200 OK):**
```json
{
  "userId": 41682,
  "cibilScore": 802,
  "indicativeRoi": 16.5,
  "roiBand": {
    "minRoi": 14.5,
    "maxRoi": 19.5,
    "recommendedRoi": 16.5
  },
  "tier": "Prime+"
}
```

#### 7. Fetch Maximum Allowed Request Amount
- **Function:** `fetchBorrowerRequestLimit(userId)`
- **HTTP Method:** `GET`
- **Endpoint:** `/v1/user/borrowerRequestAmount/{userId}`
- **Response (200 OK):**
```json
{
  "userId": 41682,
  "maxAllowedAmount": 200000,
  "minAllowedAmount": 10000
}
```

---

### Step 3: Credit Bureau (Paysprint CIR) & Document Audit

#### 8. Live Paysprint Credit Bureau Pull
- **Function:** `fetchPaysprintBureauReport(payload)`
- **HTTP Method:** `POST`
- **Endpoint:** Real Paysprint CIR gateway via OxyLoans middleware
- **Request Body:**
```json
{
  "name": "NARENDRA KUMAR BALIJEPALLI",
  "mobile": "9492902990",
  "documentId": "CDBPB2737H",
  "dateOfBirth": "1994-08-08",
  "address": "KPHB",
  "pincode": "500072"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "score": 802,
  "personal": {
    "pan": "CDBPB2737H",
    "dob": "1994-08-08",
    "name": "NARENDRA KUMAR BALIJEPALLI"
  },
  "metrics": {
    "totalAccounts": 8,
    "activeAccounts": 4,
    "closedAccounts": 4,
    "writeOffs": 0,
    "settled": 0,
    "overdueAccounts": 0,
    "totalBalance": 64200,
    "onTimePaymentPercent": 99.4
  }
}
```

---

### Step 4: Loan Request & Escrow Offer Selection

#### 9. Submit Instant Loan Application
- **Function:** `submitInstantLoanApplication(loanPayload)`
- **HTTP Method:** `PATCH`
- **Endpoint:** `/v1/user/borrowerLoanRequest`
- **Request Body:**
```json
{
  "userId": 41682,
  "loanRequestAmount": 45000,
  "rateOfInterest": 16.5,
  "duration": 3,
  "durationType": "MONTHS",
  "repaymentMethod": "EMI",
  "loanPurpose": "Personal / Emergency Short Term",
  "expectedDate": "2026-10-06"
}
```
- **Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "loanId": "LOAN_INST_1790930190",
  "message": "Loan request submitted and queued for escrow matching."
}
```

#### 10. Fetch Initiated / Matched Escrow Offers
- **Function:** `fetchInitiatedOffers(userId)`
- **HTTP Method:** `GET`
- **Endpoint:** `/v1/user/listOfBorrowerLoansInitiated/{userId}`
- **Response (200 OK):**
```json
[
  {
    "loanId": "LOAN_41682_30D",
    "loanRequestAmount": 30000,
    "rateOfInterest": 16.5,
    "duration": 1,
    "durationType": "MONTHS",
    "repaymentMethod": "BULLET",
    "loanStatus": "OFFERED",
    "lenderName": "OxyLoans Certified Escrow Lending Pool #41682"
  },
  {
    "loanId": "LOAN_41682_3M",
    "loanRequestAmount": 45000,
    "rateOfInterest": 16.5,
    "duration": 3,
    "durationType": "MONTHS",
    "repaymentMethod": "EMI",
    "loanStatus": "OFFERED",
    "lenderName": "OxyLoans Certified Escrow Lending Pool #41682"
  }
]
```

#### 11. Accept / Confirm Loan Offer
- **Function:** `acceptLoanOffer(payload)`
- **HTTP Method:** `PATCH`
- **Endpoint:** `/v1/user/borrowerLoanAccepteOrReject`
- **Request Body:**
```json
{
  "loanId": "LOAN_41682_3M",
  "status": "ACCEPTED"
}
```
- **Response (200 OK):**
```json
{
  "status": "ACCEPTED",
  "message": "Loan offer confirmed by borrower."
}
```

---

### Step 5: Digital Paperwork & Repayment Mandate

#### 12. Generate Borrower Digital Agreement
- **Function:** `generateDigitalAgreement(payload)`
- **HTTP Method:** `POST`
- **Endpoint:** `/v1/user/aggrementGenerationforBorrowerSide`
- **Request Body:**
```json
{
  "borrowerId": 41682,
  "loanId": "LOAN_41682_3M",
  "agreementType": "P2P_INSTANT_DIGITAL_V2",
  "principal": 45000,
  "emiAmount": 15415
}
```
- **Response (200 OK):**
```json
{
  "status": "GENERATED",
  "agreementDocId": "DOC_AGR_1790930400",
  "agreementUrl": "/agreements/view/DOC_AGR_1790930400",
  "message": "Digital agreement generated successfully."
}
```

#### 13. Register NPCI eNACH Recurring Repayment Mandate
- **Function:** `registerEnachMandate(mandateData)`
- **HTTP Method:** `POST`
- **Endpoint:** `/v1/marketplace/enach/register`
- **Request Body:**
```json
{
  "borrowerId": 41682,
  "loanId": "LOAN_41682_3M",
  "maxAmount": 30830,
  "frequency": "MONTHLY",
  "mandateMode": "NETBANKING",
  "accountNumber": "949290299001",
  "ifscCode": "SBIN0005220"
}
```
- **Response (200 OK):**
```json
{
  "status": "REGISTERED",
  "umrn": "NACH_93021948",
  "mandateId": "MANDATE_1790930500",
  "message": "eNACH Mandate registered successfully with NPCI."
}
```

---

### Step 6: Bank Account Verification & Penny Drop

#### 14. IMPS Penny Drop Verification (₹1.00)
- **Function:** `verifyPennyDropBankAccount(bankDetails)`
- **HTTP Method:** `POST`
- **Endpoint:** `/v1/user/verifyBankAccountAndIfsc`
- **Request Body:**
```json
{
  "bankAccount": "384910294819",
  "ifscCode": "SBIN0005220",
  "borrowerName": "BALIJEPALLI NARENDRA KUMAR"
}
```
- **Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "beneficiaryName": "BALIJEPALLI NARENDRA KUMAR",
  "verificationMethod": "IMPS_PENNY_DROP",
  "isAccountActive": true,
  "message": "Bank account verified successfully."
}
```

#### 15. Save Verified Bank Details to Borrower Profile
- **Function:** `saveVerifiedBankDetails(bankDetails, userId)`
- **HTTP Method:** `POST`
- **Endpoint:** `/v1/user/personal/{userId}/bankDetails`
- **Request Body:**
```json
{
  "accountNumber": "384910294819",
  "confirmAccountNumber": "384910294819",
  "ifscCode": "SBIN0005220",
  "bankName": "State Bank of India",
  "accountHolderName": "BALIJEPALLI NARENDRA KUMAR",
  "accountType": "SAVINGS"
}
```
- **Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "message": "Bank details saved and locked for disbursement."
}
```

---

### Step 7: Disbursal Tracking & Repayment Tracking

#### 16. Fetch Disbursement Status & Amount
- **Function:** `fetchDisbursementStatus(userId)`
- **HTTP Method:** `GET`
- **Endpoint:** `/v1/user/getDisbursementAmount/{userId}`
- **Response (200 OK):**
```json
{
  "userId": 41682,
  "disbursementStatus": "DISBURSEMENT_INITIATED",
  "netDisbursementAmount": 43672,
  "sanctionedAmount": 45000,
  "processingFeeDeducted": 1125,
  "gstDeducted": 203,
  "bankTransferMode": "IMPS_ESCROW",
  "estimatedCreditMinutes": 112,
  "batchStatus": "IN_QUEUE"
}
```

#### 17. Fetch Borrower Active Running Loans
- **Function:** `fetchBorrowerActiveLoans(userId)`
- **HTTP Method:** `GET`
- **Endpoint:** `/v1/user/myrunnigLoans/{userId}`
- **Response (200 OK):**
```json
[
  {
    "loanId": "LOAN_ACTIVE_41682",
    "loanAmount": 45000,
    "rateOfInterest": 16.5,
    "tenureMonths": 3,
    "status": "DISBURSED",
    "monthlyEmi": 15415,
    "nextDueDate": "2026-11-06"
  }
]
```

---

## 3. New / Recommended APIs for End-to-End Autonomous Processing

To transform the current pilot into a **100% automated straight-through processing (STP) instant digital lending engine** (matching Navi, KreditBee, Cashe standards), the backend team should implement the following dedicated micro-endpoints:

---

### Endpoint A: Application Session Lifecycle
- **Endpoint:** `POST /v1/user/instant-loan/initiate`
- **Purpose:** Initializes an immutable Instant Loan application lifecycle entity with audit trail and telemetry.
- **Request Body:**
```json
{
  "borrowerId": 41682,
  "requestedAmount": 45000,
  "channel": "REACT_WEB_PILOT",
  "deviceInfo": {
    "userAgent": "Mozilla/5.0 ...",
    "ipAddress": "49.204.112.5"
  }
}
```
- **Response (201 Created):**
```json
{
  "applicationId": "INST_APP_41682_20261006_01",
  "borrowerId": 41682,
  "currentStep": 1,
  "status": "INITIATED",
  "expiresAt": "2026-10-07T14:30:00Z"
}
```

---

### Endpoint B: Server-Side Real-Time Underwriting Engine
- **Endpoint:** `POST /v1/user/instant-loan/underwrite`
- **Purpose:** Executes server-side risk model scoring, FOIR validation, and bureau tier assignment.
- **Request Body:**
```json
{
  "applicationId": "INST_APP_41682_20261006_01",
  "monthlySalary": 65000,
  "bureauScore": 802,
  "existingEmi": 11700,
  "employmentType": "SALARIED",
  "companyCategory": "CAT_A"
}
```
- **Response (200 OK):**
```json
{
  "applicationId": "INST_APP_41682_20261006_01",
  "decision": "APPROVED",
  "sanctionedLimit": 58500,
  "riskTier": "PRIME_PLUS",
  "approvedRoi": 16.5,
  "maxFoirAllowed": 0.55,
  "calculatedFoir": 0.38,
  "allowedTenures": [1, 3],
  "rejectionReason": null
}
```

---

### Endpoint C: Dynamic Key Fact Statement (KFS) & Amortization Generator
- **Endpoint:** `POST /v1/user/instant-loan/offers/generate`
- **Purpose:** Generates RBI-compliant Key Fact Statement (KFS) with Annual Percentage Rate (APR) breakdown and amortizations.
- **Request Body:**
```json
{
  "applicationId": "INST_APP_41682_20261006_01",
  "principal": 45000,
  "tenureMonths": 3,
  "annualRoi": 16.5,
  "processingFeePercent": 2.5
}
```
- **Response (200 OK):**
```json
{
  "kfsId": "KFS_41682_99382",
  "principal": 45000,
  "annualPercentageRate": 21.84,
  "annualRoi": 16.5,
  "monthlyEmi": 15415,
  "totalInterest": 1245,
  "processingFee": 1125,
  "gst": 203,
  "netDisbursal": 43672,
  "totalPayable": 46245,
  "schedule": [
    { "installment": 1, "principalPart": 14812, "interestPart": 603, "totalEmi": 15415, "dueDate": "2026-11-06" },
    { "installment": 2, "principalPart": 15015, "interestPart": 400, "totalEmi": 15415, "dueDate": "2026-12-06" },
    { "installment": 3, "principalPart": 15173, "interestPart": 242, "totalEmi": 15415, "dueDate": "2027-01-06" }
  ]
}
```

---

### Endpoint D: Institutional Escrow Auto-Assignment
- **Endpoint:** `POST /v1/user/instant-loan/offers/lock-escrow`
- **Purpose:** Automatically earmarks capital from the certified P2P lender escrow pool without manual admin intervention.
- **Request Body:**
```json
{
  "applicationId": "INST_APP_41682_20261006_01",
  "chosenOfferType": "EMI",
  "tenureMonths": 3,
  "principal": 45000
}
```
- **Response (200 OK):**
```json
{
  "escrowCommitmentId": "ESCROW_COMM_41682_7719",
  "escrowPoolId": "POOL_PRIMARY_41682",
  "capitalLocked": 45000,
  "commitmentStatus": "LOCKED",
  "lockedUntil": "2026-10-06T18:00:00Z"
}
```

---

### Endpoint E: Aadhaar eSign OTP Request & Verification
- **Endpoint 1:** `POST /v1/user/instant-loan/esign/request-otp`
  - **Request Body:** `{ "applicationId": "...", "aadhaarNumber": "123456789012" }`
  - **Response (200 OK):** `{ "txnRef": "UIDAI_TXN_88192", "message": "OTP sent to registered mobile number ending in XX90." }`

- **Endpoint 2:** `POST /v1/user/instant-loan/esign/verify-otp`
  - **Request Body:** `{ "applicationId": "...", "txnRef": "UIDAI_TXN_88192", "otp": "491823" }`
  - **Response (200 OK):**
```json
{
  "esignStatus": "SUCCESS",
  "signerName": "NARENDRA KUMAR BALIJEPALLI",
  "signedDocumentHash": "SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "timestamp": "2026-10-06T14:12:05Z"
}
```

---

### Endpoint F: Instant Escrow Payout Trigger (IMPS Direct Credit)
- **Endpoint:** `POST /v1/user/instant-loan/disburse/trigger`
- **Purpose:** Initiates immediate payout from the designated Escrow nodal account (Yes Bank / ICICI / Axis nodal) via IMPS switch.
- **Request Body:**
```json
{
  "applicationId": "INST_APP_41682_20261006_01",
  "escrowCommitmentId": "ESCROW_COMM_41682_7719",
  "accountNumber": "384910294819",
  "ifscCode": "SBIN0005220",
  "beneficiaryName": "BALIJEPALLI NARENDRA KUMAR",
  "disbursalAmount": 43672,
  "authSecurityKey": "<internal-escrow-secret>"
}
```
- **Response (200 OK):**
```json
{
  "transferStatus": "PROCESSED",
  "rrn": "628014902194",
  "paymentMode": "IMPS",
  "disbursedAt": "2026-10-06T14:15:30Z",
  "utrNumber": "SBIN26100600192847",
  "balanceInEscrowAfter": 450000.00
}
```

---

### Endpoint G: Real-Time Lifecycle Status Polling
- **Endpoint:** `GET /v1/user/instant-loan/status/{applicationId}`
- **Purpose:** Single lightweight pollable status endpoint for front-end countdown and webhook listener.
- **Response (200 OK):**
```json
{
  "applicationId": "INST_APP_41682_20261006_01",
  "borrowerId": 41682,
  "overallStatus": "DISBURSED",
  "steps": {
    "profileKyc": "COMPLETED",
    "assessmentFee": "COMPLETED",
    "bureauVerification": "COMPLETED",
    "offerSelection": "COMPLETED",
    "aadhaarEsign": "COMPLETED",
    "enachMandate": "ACTIVE",
    "bankPennyDrop": "VERIFIED",
    "escrowDisbursal": "CREDITED"
  },
  "creditTxnRef": "SBIN26100600192847",
  "amountCredited": 43672,
  "firstEmiDueDate": "2026-11-06"
}
```

---

### Endpoint H: RBI Look-up / Cooling-Off Period Cancelation
- **Endpoint:** `POST /v1/user/instant-loan/cooling-off/cancel`
- **Purpose:** Implements RBI's mandatory 3-day look-up period allowing the borrower to exit the loan without penalty by returning principal + proportionate interest.
- **Request Body:**
```json
{
  "applicationId": "INST_APP_41682_20261006_01",
  "borrowerId": 41682,
  "cancelReason": "Borrower exercising 3-day cooling-off right"
}
```
- **Response (200 OK):**
```json
{
  "status": "COOLING_OFF_PROCESSED",
  "returnPayableAmount": 43672,
  "penaltyWaived": true,
  "mandateDeactivated": true
}
```

---

## 4. RBI Regulatory & Digital Lending Guidelines (DLG) Alignment

1. **Direct Account-to-Account Escrow Disbursal:**  
   Funds are transferred directly from the bank account of the regulated lending escrow pool to the verified bank account of borrower `41682` without passing through any third-party pool accounts.

2. **Key Fact Statement (KFS):**  
   Every loan offer displays illustrative and annualized APR including processing fee (`2.5%`) and GST (`18%`), complying with RBI circular *RBI/2022-23/111*.

3. **Explicit Consent & Audit Trail:**  
   Aadhaar eSign thumbprints and NPCI mandate registrations are permanently timestamped and logged.

4. **30-Day Cooldown Protection:**  
   If a borrower's credit score is below `650` or write-offs exist, the system triggers the 30-day cooldown lock (`InstantLoanNotEligible.jsx`) to avoid bureau inquiry fatigue.

---

## 5. File Mapping & Implementation References

| Component / File | Purpose | API Functions Consumed |
|---|---|---|
| [`instantLoanApi.js`](file:///E:/Oxyloans/Oxyloans%20web/OxyloansReact/src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/instantLoanApi.js) | Central API Module | All 17 live & integrated endpoints |
| [`InstantLoanFlow.jsx`](file:///E:/Oxyloans/Oxyloans%20web/OxyloansReact/src/components/pages/Oxyloans/Borrower/redesign/pages/InstantLoanFlow.jsx) | 7-Step Main Orchestrator | `fetchBorrowerProfile`, `loadInstantLoanStorage`, `saveInstantLoanStorage`, `clearInstantLoanStorage` |
| [`InstantLoanStepProfile.jsx`](file:///E:/Oxyloans/Oxyloans%20web/OxyloansReact/src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepProfile.jsx) | Step 1: KYC & References | `fetchBorrowerReferences`, `saveBorrowerReferences` |
| [`InstantLoanStepPreEligibility.jsx`](file:///E:/Oxyloans/Oxyloans%20web/OxyloansReact/src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepPreEligibility.jsx) | Step 2: Limits & Fee | `fetchBorrowerEligibility`, `fetchCibilRoi`, `processPlatformAssessmentFee` |
| [`InstantLoanStepBureauVerification.jsx`](file:///E:/Oxyloans/Oxyloans%20web/OxyloansReact/src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepBureauVerification.jsx) | Step 3: CIR Audit | `verifyBureauAndIdentity`, `fetchPaysprintBureauReport` |
| [`InstantLoanStepOfferSelection.jsx`](file:///E:/Oxyloans/Oxyloans%20web/OxyloansReact/src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx) | Step 4: Underwriting & Offers | `submitInstantLoanApplication`, `fetchInitiatedOffers`, `acceptLoanOffer` |
| [`InstantLoanStepAgreementEnach.jsx`](file:///E:/Oxyloans/Oxyloans%20web/OxyloansReact/src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepAgreementEnach.jsx) | Step 5: eSign & eNACH | `generateDigitalAgreement`, `initiateAadhaarEsign`, `registerEnachMandate` |
| [`InstantLoanStepBankDetails.jsx`](file:///E:/Oxyloans/Oxyloans%20web/OxyloansReact/src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepBankDetails.jsx) | Step 6: Bank & Penny Drop | `verifyPennyDropBankAccount`, `saveVerifiedBankDetails` |
| [`InstantLoanStepDisbursalTracker.jsx`](file:///E:/Oxyloans/Oxyloans%20web/OxyloansReact/src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepDisbursalTracker.jsx) | Step 7: Disbursal Countdown | `fetchDisbursementStatus`, `fetchBorrowerActiveLoans` |
