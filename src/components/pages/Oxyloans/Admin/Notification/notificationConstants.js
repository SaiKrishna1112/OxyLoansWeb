export const NOTIFICATION_TYPES = [
  { group: "Marketing", options: [
    { value: "OFFER_CREATED", label: "New Offer" },
    { value: "CAMPAIGN_STARTED", label: "Campaign Started" },
    { value: "PROMOTION_AVAILABLE", label: "Promotion" },
  ]},
  { group: "Deals", options: [
    { value: "NEW_DEAL_OPENED", label: "New Deal Opened" },
    { value: "DEAL_PARTICIPATED", label: "Deal Participated" },
    { value: "DEAL_FULLY_FUNDED", label: "Deal Fully Funded" },
    { value: "DEAL_CLOSED", label: "Deal Closed" },
    { value: "DEAL_CLOSING_SOON", label: "Deal Closing Soon" },
  ]},
  { group: "Financial", options: [
    { value: "WALLET_LOADED", label: "Wallet Loaded" },
    { value: "WALLET_WITHDRAWAL", label: "Wallet Withdrawal" },
    { value: "INTEREST_CREDITED", label: "Interest Credited" },
    { value: "PRINCIPAL_CREDITED", label: "Principal Credited" },
    { value: "CASHBACK_CREDITED", label: "Cashback Credited" },
    { value: "REFERRAL_BONUS", label: "Referral Bonus" },
  ]},
  { group: "Payments", options: [
    { value: "EMI_DUE", label: "EMI Due" },
    { value: "EMI_MISSED", label: "EMI Missed" },
    { value: "PAYMENT_RECEIVED", label: "Payment Received" },
  ]},
  { group: "User / KYC", options: [
    { value: "KYC_APPROVED", label: "KYC Approved" },
    { value: "KYC_REJECTED", label: "KYC Rejected" },
    { value: "BANK_ACCOUNT_VERIFIED", label: "Bank Verified" },
    { value: "PROFILE_COMPLETION_PENDING", label: "Profile Pending" },
  ]},
];

export const PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

export const SEGMENTS = [
  { value: "ALL", label: "All active users", description: "Every active user on the platform" },
  { value: "ACTIVE_LENDERS", label: "Active lenders", description: "Lenders with ACTIVE status" },
  { value: "LENDERS", label: "All lenders", description: "All lender accounts" },
  { value: "ACTIVE_BORROWERS", label: "Active borrowers", description: "Borrowers with ACTIVE status" },
  { value: "BORROWERS", label: "All borrowers", description: "All borrower accounts" },
];

export const AUDIENCE_MODES = [
  { value: "all", label: "All Users", icon: "fa-users", description: "Broadcast to everyone" },
  { value: "segment", label: "Segment", icon: "fa-layer-group", description: "Lenders, borrowers, etc." },
  { value: "limited", label: "Selected IDs", icon: "fa-list-check", description: "Comma-separated user IDs" },
  { value: "individual", label: "One User", icon: "fa-user", description: "Single user by ID" },
];

export const DISPATCH_STATUS_COLORS = {
  QUEUED: "default",
  PROCESSING: "processing",
  COMPLETED: "success",
  FAILED: "error",
  PARTIAL: "warning",
};

export const flattenNotificationTypes = () =>
  NOTIFICATION_TYPES.flatMap((g) => g.options);
