# OxyLoans AI Dashboard — Mobile Integration Guide

> **For**: Mobile App Developer  
> **Purpose**: Implement the AI Assistant chat feature in the mobile app, matching the web AI Dashboard  
> **Status**: Backend live on test server · Frontend live on test server

---

## 1. What Was Built

A conversational AI assistant for lenders that:
- Understands natural language questions about their account
- Fetches real data from the OxyLoans backend APIs
- Returns both a **text answer** (the AI's reply) and **structured card data** for rich UI rendering
- Supports domains: profile, wallet, deals, interest earnings, referrals, principal returns

The web version lives at: `/lenderAIDashboard` (accessible after login)  
The chat is a floating widget on the bottom-right of that page.

---

## 2. API Reference

### Endpoint

```
POST /oxyloans/v1/ai/chat
```

**Base URLs:**
| Environment | Base URL |
|---|---|
| Test | `http://ec2-15-207-239-145.ap-south-1.compute.amazonaws.com:8080/oxyloans` |
| Production | `https://fintech.oxyloans.com/oxyloans` |

### Request Headers

```
accessToken: <user_access_token>
Content-Type: application/json
```

The `accessToken` is the same token used for all other authenticated API calls — obtained from the login response.

### Request Body

```json
{
  "message": "What is my wallet balance?",
  "primaryType": "LENDER"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `message` | string | yes | The user's natural language question |
| `primaryType` | string | yes | Always `"LENDER"` for lender users |

### Response

```json
{
  "answer": "💰 **Wallet Balance** **₹12,500** available to invest",
  "intent": "LENDER_PROFILE",
  "responseData": {
    "type": "LENDER_PROFILE",
    "lenderName": "Mounika Sharma",
    "walletBalance": 12500,
    "membershipStatus": "ACTIVE",
    "mobile": "98XXXXXXXX",
    "email": "m****@gmail.com",
    "validityDate": "2025-12-31"
  }
}
```

| Field | Type | Description |
|---|---|---|
| `answer` | string | AI-generated text reply. May contain markdown (`**bold**`, `_italic_`) and emoji |
| `intent` | string | Which API/domain was used to answer. See full list below |
| `responseData` | object \| null | Structured card data for rich UI. `null` for general/info questions |

---

## 3. Intent Types

The `intent` field tells you what kind of data (if any) is in `responseData`:

| intent value | responseData present | Description |
|---|---|---|
| `GENERAL_INFO` | no (null) | General question answered using AI knowledge |
| `LENDER_PROFILE` | yes | Profile, wallet, membership details |
| `DEALS_STATISTICS` | yes | Aggregate deal counts and amounts |
| `LENDER_RUNNING_DEALS` | yes | List of participated/running deals |
| `INTEREST_HISTORY` | yes | Interest earnings history |
| `PRINCIPAL_HISTORY` | yes | Principal returned history |
| `OPEN_DEALS` | yes | Currently open deals available to invest |
| `REFERRAL_HISTORY` | yes | Referral bonus history |
| `LENDER_INTEREST` | no (null) | Interest-specific flow, answer in text |
| `DEAL` | no (null) | Deal-specific flow, answer in text |

When `responseData` is `null`, display only the `answer` text (with markdown formatting).  
When `responseData` is present, display the `answer` as a caption and render a structured card below it.

---

## 4. responseData Card Structures

The `type` field inside `responseData` matches the `intent` value above. Use it to decide which card component to render.

---

### 4.1 LENDER_PROFILE

Triggered by: "my profile", "wallet balance", "my name", "membership status", "mobile number"

```json
{
  "type": "LENDER_PROFILE",
  "lenderName": "Mounika Sharma",
  "walletBalance": 12500.00,
  "membershipStatus": "ACTIVE",
  "mobile": "98XXXXXXXX",
  "email": "m****@gmail.com",
  "panStatus": "APPROVED",
  "groupName": "Gold",
  "validityDate": "2025-12-31"
}
```

**UI suggestion:** Show as a profile card with avatar initials, name large, wallet balance in green highlight, membership badge.

---

### 4.2 DEALS_STATISTICS

Triggered by: "how many deals", "total closed deals", "active deals count", "disbursed amount"

```json
{
  "type": "DEALS_STATISTICS",
  "activeDeals": 5,
  "closedDeals": 12,
  "disbursedDeals": 2,
  "totalInvested": 250000.00,
  "totalRepaid": 180000.00
}
```

**UI suggestion:** 3-column stat grid — Active / Closed / Disbursed counts, then amounts below.

---

### 4.3 LENDER_RUNNING_DEALS

Triggered by: "my running deals", "participated deals", "my investments list"

```json
{
  "type": "LENDER_RUNNING_DEALS",
  "deals": [
    {
      "dealName": "Deal ABC",
      "participatedAmount": 50000,
      "rateOfInterest": 18.0,
      "closedDate": "2025-06-30",
      "status": "RUNNING"
    }
  ]
}
```

**UI suggestion:** Vertical scrollable list of deal cards. Status badge (RUNNING = green, CLOSED = grey).

---

### 4.4 INTEREST_HISTORY

Triggered by: "interest earned", "interest history", "this month interest", "total interest"

```json
{
  "type": "INTEREST_HISTORY",
  "totalEarned": 83348.00,
  "totalCount": 45,
  "items": [
    {
      "earnedDate": "2025-05-01",
      "amount": 2450.00,
      "remarks": "Deal ABC - Monthly Interest",
      "differencInDays": 30
    }
  ]
}
```

**UI suggestion:** Header showing total earned, then date-sorted list of interest credits.

---

### 4.5 PRINCIPAL_HISTORY

Triggered by: "principal returned", "capital returned", "money credited back"

```json
{
  "type": "PRINCIPAL_HISTORY",
  "items": [
    {
      "returnedDate": "2025-04-15",
      "dealName": "Deal XYZ",
      "amount": 100000.00,
      "remarks": "Principal Return",
      "currentAmount": 100000.00
    }
  ]
}
```

---

### 4.6 OPEN_DEALS

Triggered by: "open deals", "available deals", "where can I invest", "today's deals", "best deals"

```json
{
  "type": "OPEN_DEALS",
  "deals": [
    {
      "dealName": "Deal PQR",
      "borrowerName": "John Doe",
      "dealAmount": 500000,
      "rateOfInterest": 20.0,
      "duration": 12,
      "repaymentType": "MONTHLY",
      "remainingAmountToPaticipateInDeal": 150000,
      "fundingStatus": "PARTIAL",
      "dealStatus": "HAPPENING"
    }
  ]
}
```

**UI suggestion:** Horizontal scroll cards or list. Show ROI % prominently, remaining amount as a progress bar.

---

### 4.7 REFERRAL_HISTORY

Triggered by: "referral bonus", "my referrals", "who joined using my referral"

```json
{
  "type": "REFERRAL_HISTORY",
  "items": [
    {
      "referredName": "Priya K",
      "amount": 500.00,
      "bonusDate": "2025-03-10",
      "status": "CREDITED"
    }
  ]
}
```

---

## 5. Text Formatting Rules

The `answer` field uses simple markdown. Apply these formatting rules when rendering:

| Pattern | Render as |
|---|---|
| `**text**` | Bold text |
| `_text_` | Italic text |
| `₹12,500` | Amount — highlight in green/teal color |
| Line starting with emoji + `**...**` | Render as a stat card (colored background) |

**Example answer text:**
```
💰 **Wallet Balance** **₹12,500** available to invest _Tip: Check open deals!_
```
Should render as:
- 💰 → emoji icon
- **Wallet Balance** → bold label
- **₹12,500** → bold amount in green
- _Tip: Check open deals!_ → italic hint text

When `responseData` is present, the `answer` is a short caption — show it above or below the card in smaller/muted text, still with formatting applied.

---

## 6. Authentication Flow

Use the existing app login flow. The AI chat uses the same `accessToken` and `userId` as all other API calls.

```
User logs in → receive accessToken → store in session
AI chat request → include accessToken in header → backend resolves userId from token
```

No separate auth needed for the AI endpoint.

---

## 7. Suggested UI Flow (Screen Design)

```
┌─────────────────────────────────┐
│  🏦 OxyLoans AI Assistant       │
│  Lender Assistant • Online      │
├─────────────────────────────────┤
│                                 │
│  [AI] Hi Mounika! Ask me about  │
│       your deals, earnings...   │
│                                 │
│  [USER] What is my wallet bal?  │
│                                 │
│  [AI]  💰 Wallet Balance        │  ← caption (formatted text)
│  ┌───────────────────────────┐  │
│  │ 👤 Mounika Sharma         │  │  ← LENDER_PROFILE card
│  │ 💵 ₹12,500 available      │  │
│  │ ✅ ACTIVE membership      │  │
│  └───────────────────────────┘  │
│  [Show my deals] [Interest?]    │  ← suggested follow-up chips
│                                 │
├─────────────────────────────────┤
│  [Type your question...] [Send] │
└─────────────────────────────────┘
```

**Suggested quick-start questions** (show as chips on first open):
- "What's my wallet balance?"
- "Show my running deals"
- "How much interest did I earn this month?"
- "Are there any open deals?"
- "My total earnings this year?"

---

## 8. Error Handling

| Scenario | Handle as |
|---|---|
| Network error / timeout | Show: "Sorry, I'm having trouble connecting. Please try again." |
| `answer` missing in response | Fall back to: `"I couldn't find an answer for that."` |
| `responseData` is null | Show only the `answer` text — no card |
| Empty `deals` or `items` array | Show: "No data found." inside the card area |

---

## 9. Key Files in the Project (for reference)

| File | What it does |
|---|---|
| `frontend/OxyLoansWeb/src/components/pages/Oxyloans/Lender/LenderPortfolioDashboard.jsx` | Web AI Dashboard page + `AIChatWidget` component |
| `frontend/OxyLoansWeb/src/components/ChatDrawer.jsx` | All card components (`RichMessage`, `FormattedText`, `LenderProfileView`, etc.) |
| `oxyloans.com/oxyloans-service/src/main/java/com/oxyloans/service/user/AiAssistantService.java` | Backend AI logic — intent routing, data fetching, response assembly |
| `oxyloans.com/oxyloans-rest/src/main/resources/api-catalog.json` | All data APIs the AI can call, with descriptions |
| `oxyloans.com/oxyloans-dto/src/main/java/com/oxyloans/request/user/AiChatResponse.java` | Response DTO: `answer`, `intent`, `responseData` |

---

## 10. Quick Test

You can test the API directly using curl or Postman:

```bash
curl -X POST \
  http://ec2-15-207-239-145.ap-south-1.compute.amazonaws.com:8080/oxyloans/v1/ai/chat \
  -H "accessToken: <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "what is my wallet balance", "primaryType": "LENDER"}'
```

Replace `<your_token>` with a valid lender access token from a test login.

---

*Backend branch: `feature/ai-layer` (Bitbucket)*  
*Frontend branch: `feature/ai-lender-chat` (GitHub)*
