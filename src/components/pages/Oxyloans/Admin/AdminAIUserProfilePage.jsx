import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaArrowLeft, FaCopy, FaRobot, FaUser } from "react-icons/fa";
import OxyloansAdminSidebar from "../../../SideBar/OxyloansAdminSidebar";
import OxyloansAdminHeader from "../../../Header/OxyloansAdminHeader";
import Footer from "../../../Footer/Footer";
import {
  getAdminAIUsers,
  getAdminAIActiveLenderProfile,
  getAdminAIActiveLenderBankDetails,
  getAdminAIActiveLenderWallet,
  getAdminAIActiveLenderDeals,
  getAdminAIActiveLenderLegacyDetails,
  getAdminAIBorrowerProfile,
  getAdminAIBorrowerDeals,
} from "../../../HttpRequest/admin";
import "./AdminAIDashboard.css";

const responseData = (payload) => (payload && payload.data ? payload.data : payload);
const pickNumber = (...values) => {
  for (const value of values) {
    if (value != null && value !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return 0;
};
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);
const fmtNum = (n) => (n == null ? "0" : Number(n).toLocaleString("en-IN"));
const fmtMoney = (n) => `Rs ${fmtNum(Math.round(Number(n) || 0))}`;

const formatDate = (value) => {
  if (!value) return "-";
  const text = String(value).trim();
  if (!text) return "-";
  const datePart = text.includes("T") ? text.split("T")[0] : text.split(" ")[0];
  const parts = datePart.split("-");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return text;
};

const formatUserCode = (userId, userCode, primaryType) => {
  if (userCode) return userCode;
  if (!userId) return "-";
  const prefix = String(primaryType || "").toUpperCase() === "BORROWER" ? "BR" : "LR";
  return `${prefix}${userId}`;
};

const gmailUrl = (email) => (email ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}` : "");

const hasBankDetailsData = (profile) =>
  Boolean(
    profile?.bankName || profile?.accountNumber || profile?.ifscCode || profile?.branchName || profile?.userNameAccordingToBank
  );

const mapBankProfile = (bankData) => ({
  bankName: bankData.bankName,
  accountNumber: bankData.accountNumber,
  ifscCode: bankData.ifscCode,
  branchName: bankData.branchName,
  accountType: bankData.accountType,
  userNameAccordingToBank: bankData.userNameAccordingToBank,
  bankAddress: bankData.bankAddress,
  modeOfTransactions: bankData.modeOfTransactions,
  bankDetailsVerified: bankData.bankDetailsVerified,
  bankDetailsUpdatedOn: bankData.bankDetailsUpdatedOn,
  bankDetailsSource: bankData.bankDetailsSource,
});

const mergeProfile = (base, extra) => {
  if (!base && !extra) return null;
  const merged = { ...(base || {}) };
  if (!extra) return merged;
  Object.entries(extra).forEach(([key, value]) => {
    if (value == null || value === "") return;
    if (Array.isArray(value) || typeof value === "object") {
      merged[key] = value;
      return;
    }
    merged[key] = value;
  });
  return merged;
};

const mergeProfiles = (...sources) => sources.reduce((acc, source) => mergeProfile(acc, source), null);

const normalizeUserToProfile = (user) => {
  if (!user) return null;
  const addr = user.address && typeof user.address === "object" ? user.address : {};
  const addressLine = addr.addressLine || (typeof user.address === "string" ? user.address : "");
  const primaryType = user.primaryType || user.lenderType;
  const userId = user.userId || user.lenderId || user.borrowerId;
  return {
    userId,
    lenderId: userId,
    borrowerId: userId,
    userCode: user.userCode || formatUserCode(userId, null, primaryType),
    name: user.name,
    email: user.email,
    mobileNumber: user.mobileNumber,
    registeredOn: user.registeredOn,
    city: addr.city || user.city,
    state: addr.state || user.state,
    pincode: addr.pincode || user.pincode,
    addressLine,
    address: addressLine,
    dob: user.dob,
    panNumber: user.panNumber,
    aadharNumber: user.aadharNumber,
    whatsappNumber: user.whatsappNumber,
    lenderGroupId: user.lenderGroupId,
    lenderGroupName: user.lenderGroupName,
    lenderType: user.lenderType || primaryType,
    primaryType,
    dealsCount: user.dealsCount,
    totalParticipationAmount: user.totalParticipationAmount,
    totalDealAmount: user.totalDealAmount,
    bankName: user.bankName,
    accountNumber: user.accountNumber,
    ifscCode: user.ifscCode,
    branchName: user.branchName,
    accountType: user.accountType,
    userNameAccordingToBank: user.userNameAccordingToBank,
    bankAddress: user.bankAddress,
    modeOfTransactions: user.modeOfTransactions,
    bankDetailsVerified: user.bankDetailsVerified,
    bankDetailsSource: user.bankDetailsSource,
    gender: user.gender,
  };
};

const formatCompleteAddress = (profile) => {
  const parts = [profile?.addressLine || profile?.address, profile?.city, profile?.state, profile?.pincode].filter(
    (part) => part != null && String(part).trim() !== ""
  );
  return parts.length ? parts.join(", ") : "-";
};

const formatLenderGroup = (profile) => {
  const id = profile?.lenderGroupId;
  const name = profile?.lenderGroupName;
  if (!id && !name) return "-";
  if (id && name) return `${id} - ${name}`;
  return String(id || name);
};

const ProfileRow = ({ label, value, copyable, mailLink }) => (
  <div className="admin-ai-profile-row">
    <span className="admin-ai-profile-row-label">{label}</span>
    <span className="admin-ai-profile-row-value">
      {mailLink ? (
        <a href={mailLink} target="_blank" rel="noreferrer">
          {valueOrDash(value)}
        </a>
      ) : (
        valueOrDash(value)
      )}
      {copyable && value ? (
        <button className="admin-ai-copy-btn" type="button" onClick={() => navigator.clipboard?.writeText(String(value))}>
          <FaCopy />
        </button>
      ) : null}
    </span>
  </div>
);

const AdminAIUserProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = pickNumber(searchParams.get("userId"));
  const listView = searchParams.get("view") || "registered";
  const listLabel = searchParams.get("label") || "Registered Users";
  const requestedReturnTo = searchParams.get("returnTo") || "";

  const [profile, setProfile] = useState(null);
  const [deals, setDeals] = useState(null);
  const [dealsTab, setDealsTab] = useState("active");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isLender = useMemo(
    () => String(profile?.primaryType || "").toUpperCase() === "LENDER",
    [profile?.primaryType]
  );

  const loadBankDetailsForProfile = async (id) => {
    try {
      const bankData = responseData(await getAdminAIActiveLenderBankDetails(id));
      if (bankData && hasBankDetailsData(bankData)) {
        return mapBankProfile(bankData);
      }
    } catch {
      // optional
    }
    try {
      const legacyData = responseData(await getAdminAIActiveLenderLegacyDetails(id));
      if (legacyData && hasBankDetailsData(legacyData)) {
        return mapBankProfile({ ...legacyData, bankDetailsSource: legacyData.bankDetailsSource || "legacy_admin_api" });
      }
    } catch {
      return null;
    }
    return null;
  };

  useEffect(() => {
    if (!userId) {
      setError("User ID is required.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      setLoading(true);
      setError("");
      setDeals(null);
      setDealsTab("active");

      try {
        const usersData = responseData(await getAdminAIUsers(1, 1, listView, { userId: String(userId) }));
        const baseUser = (usersData?.users || [])[0] || null;
        if (!baseUser) {
          if (!cancelled) {
            setError("User not found.");
            setProfile(null);
          }
          return;
        }

        const baseProfile = normalizeUserToProfile(baseUser);
        const userIsLender = String(baseUser.primaryType || "").toUpperCase() === "LENDER";

        if (userIsLender) {
          const [profileData, bankProfile, walletData, dealsData] = await Promise.all([
            getAdminAIActiveLenderProfile(userId).catch(() => null),
            loadBankDetailsForProfile(userId),
            getAdminAIActiveLenderWallet(userId).catch(() => null),
            getAdminAIActiveLenderDeals(userId).catch(() => null),
          ]);
          const apiProfile = responseData(profileData)?.profile || null;
          const wallet = responseData(walletData) || {};
          const dealsPayload = responseData(dealsData) || {};
          const enriched = mergeProfiles(baseProfile, apiProfile, bankProfile, {
            walletAmount: pickNumber(wallet.walletAmount),
            referrals: apiProfile?.referrals,
            referralSummary: apiProfile?.referralSummary,
            personalReferences: apiProfile?.personalReferences,
            referredBy: apiProfile?.referredBy,
          });
          if (!cancelled) {
            setProfile(enriched);
            setDeals(dealsPayload);
            if (!dealsPayload.activeDeals?.length && dealsPayload.closedDeals?.length) {
              setDealsTab("closed");
            }
          }
        } else {
          const [profileData, dealsData] = await Promise.all([
            getAdminAIBorrowerProfile(userId).catch(() => null),
            getAdminAIBorrowerDeals(userId).catch(() => null),
          ]);
          const apiProfile = responseData(profileData)?.profile || null;
          const dealsPayload = responseData(dealsData) || {};
          const enriched = mergeProfiles(baseProfile, apiProfile);
          if (!cancelled) {
            setProfile(enriched);
            setDeals(dealsPayload);
            if (!dealsPayload.activeDeals?.length && dealsPayload.closedDeals?.length) {
              setDealsTab("closed");
            }
          }
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load user profile.");
          setProfile(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [userId, listView]);

  const visibleDeals = dealsTab === "active" ? deals?.activeDeals || [] : deals?.closedDeals || [];
  const backUrl = requestedReturnTo.startsWith("/") && !requestedReturnTo.startsWith("//")
    ? requestedReturnTo
    : `/adminAIDashboard${listView ? `?usersView=${encodeURIComponent(listView)}` : ""}`;

  return (
    <div className="main-wrapper">
      <OxyloansAdminHeader />
      <OxyloansAdminSidebar />
      <div className="page-wrapper">
        <div className="content container-fluid admin-ai-page">
          <section className="admin-ai-hero admin-ai-hero-glow">
            <div>
              <span className="admin-ai-pill">
                <FaRobot /> AI Operations
              </span>
              <h2>User Profile</h2>
              <p>Full profile, bank details, and deal history for registered platform users.</p>
            </div>
            <strong>Admin / AI Dashboard / {listLabel} / Profile</strong>
          </section>

          <div className="admin-ai-summary-bar">
            <div className="admin-ai-summary-card admin-ai-summary-card-glow">
              <FaUser />
              <div>
                <span>{profile ? formatUserCode(profile.userId, profile.userCode, profile.primaryType) : "User"}</span>
                <strong>{valueOrDash(profile?.name)}</strong>
              </div>
            </div>
            <button className="admin-ai-close-btn" type="button" onClick={() => navigate(backUrl)}>
              <FaArrowLeft /> Back to {listLabel}
            </button>
          </div>

          <section className="admin-ai-panel admin-ai-panel-premium">
            {loading ? <div className="admin-ai-empty-state">Loading user profile...</div> : null}
            {error ? <div className="alert alert-danger">{error}</div> : null}

            {!loading && profile ? (
              <div className="admin-ai-profile-box admin-ai-profile-box-rich">
                <div className="admin-ai-panel-head">
                  <div>
                    <h5>
                      {formatUserCode(profile.userId, profile.userCode, profile.primaryType)} {valueOrDash(profile.name)}
                    </h5>
                    <p>
                      {isLender
                        ? "Full lender profile with bank details, wallet, and deal participation."
                        : "Full borrower profile with identity details and borrower deal history."}
                    </p>
                  </div>
                </div>

                <div className="admin-ai-profile-stats-row">
                  {isLender ? (
                    <div className="admin-ai-profile-stat">
                      <small>Wallet</small>
                      <strong>{fmtMoney(profile.walletAmount)}</strong>
                    </div>
                  ) : null}
                  <div className="admin-ai-profile-stat">
                    <small>{isLender ? "Total Investment" : "Total Deal Amount"}</small>
                    <strong>
                      {fmtMoney(isLender ? profile.totalParticipationAmount : profile.totalDealAmount || profile.totalParticipationAmount)}
                    </strong>
                  </div>
                  <div className="admin-ai-profile-stat">
                    <small>Deals</small>
                    <strong>{fmtNum(profile.dealsCount || visibleDeals.length || deals?.allDeals?.length)}</strong>
                  </div>
                  <div className="admin-ai-profile-stat">
                    <small>Account Type</small>
                    <strong>{valueOrDash(profile.primaryType)}</strong>
                  </div>
                </div>

                <div className="admin-ai-profile-sections">
                  <div className="admin-ai-profile-section">
                    <h6>Contact Information</h6>
                    <div className="admin-ai-profile-table">
                      <ProfileRow label="Email" value={profile.email} copyable mailLink={gmailUrl(profile.email)} />
                      <ProfileRow label="Mobile Number" value={profile.mobileNumber} copyable />
                      <ProfileRow label="WhatsApp" value={profile.whatsappNumber} copyable />
                      <ProfileRow label="Registered On" value={formatDate(profile.registeredOn)} />
                    </div>
                  </div>
                  <div className="admin-ai-profile-section">
                    <h6>Location</h6>
                    <div className="admin-ai-profile-table">
                      <ProfileRow label="City" value={profile.city} />
                      <ProfileRow label="State" value={profile.state} />
                      <ProfileRow label="Pincode" value={profile.pincode} />
                      <ProfileRow label="Address" value={formatCompleteAddress(profile)} />
                    </div>
                  </div>
                  <div className="admin-ai-profile-section">
                    <h6>Identity</h6>
                    <div className="admin-ai-profile-table">
                      <ProfileRow
                        label="User ID"
                        value={formatUserCode(profile.userId, profile.userCode, profile.primaryType)}
                      />
                      {isLender ? (
                        <>
                          <ProfileRow label="Lender Group" value={formatLenderGroup(profile)} />
                          <ProfileRow label="Lender Type" value={profile.lenderType || profile.primaryType} />
                        </>
                      ) : (
                        <ProfileRow label="Gender" value={profile.gender} />
                      )}
                      <ProfileRow label="Date of Birth" value={formatDate(profile.dob)} />
                      <ProfileRow label="PAN Number" value={profile.panNumber} />
                      <ProfileRow label="Aadhar Number" value={profile.aadharNumber} />
                    </div>
                  </div>
                  <div className="admin-ai-profile-section admin-ai-profile-section-wide">
                    <h6>Bank Details</h6>
                    <div className="admin-ai-profile-table">
                      <ProfileRow label="Bank Name" value={profile.bankName} />
                      <ProfileRow label="Account Number" value={profile.accountNumber} copyable />
                      <ProfileRow label="IFSC Code" value={profile.ifscCode} copyable />
                      <ProfileRow label="Branch Name" value={profile.branchName} />
                      <ProfileRow label="Account Type" value={profile.accountType} />
                      <ProfileRow label="Name As Per Bank" value={profile.userNameAccordingToBank} />
                      <ProfileRow label="Bank Address" value={profile.bankAddress} />
                      <ProfileRow label="Mode Of Transactions" value={profile.modeOfTransactions} />
                      <ProfileRow
                        label="Verification Status"
                        value={
                          profile.bankDetailsVerified === true
                            ? "Verified"
                            : hasBankDetailsData(profile)
                              ? "Not Verified"
                              : "-"
                        }
                      />
                      {profile.bankDetailsSource ? (
                        <ProfileRow label="Data Source" value={profile.bankDetailsSource} />
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="admin-ai-deal-tabs">
                  <button type="button" className={dealsTab === "active" ? "active" : ""} onClick={() => setDealsTab("active")}>
                    Active Deals ({deals?.activeDeals?.length || 0})
                  </button>
                  <button type="button" className={dealsTab === "closed" ? "active" : ""} onClick={() => setDealsTab("closed")}>
                    Closed Deals ({deals?.closedDeals?.length || 0})
                  </button>
                </div>
                <div className="admin-ai-deal-list">
                  {visibleDeals.length === 0 ? (
                    <div className="admin-ai-empty-state">No {dealsTab} deals found for this {isLender ? "lender" : "borrower"}.</div>
                  ) : null}
                  {visibleDeals.map((deal) => (
                    <div className="admin-ai-deal-row" key={`${profile.userId}-${deal.dealId}`}>
                      <div>
                        <small>DEAL</small>
                        <strong>
                          #{deal.dealId} {valueOrDash(deal.dealName)}
                        </strong>
                      </div>
                      <div>
                        <small>{isLender ? "AMOUNT" : "DEAL AMOUNT"}</small>
                        <strong>{fmtMoney(isLender ? deal.participatedAmount || deal.totalParticipationAmount : deal.dealAmount)}</strong>
                      </div>
                      <div>
                        <small>ROI</small>
                        <strong>{valueOrDash(deal.roi)}%</strong>
                      </div>
                      <div>
                        <small>STATUS</small>
                        <strong>{valueOrDash(deal.status || deal.displayStatus)}</strong>
                      </div>
                      {isLender ? (
                        <div>
                          <small>RECEIVED</small>
                          <strong>{formatDate(deal.receivedOn)}</strong>
                        </div>
                      ) : (
                        <>
                          <div>
                            <small>COLLECTED</small>
                            <strong>{fmtMoney(deal.collectedAmount)}</strong>
                          </div>
                          <div>
                            <small>LENDERS</small>
                            <strong>{fmtNum(deal.lendersCount)}</strong>
                          </div>
                          <div>
                            <small>RECEIVED</small>
                            <strong>{formatDate(deal.receivedOn)}</strong>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default AdminAIUserProfilePage;
