import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getAdminAISharedBankAccounts, getAdminAIActiveLenderReferrals, getAdminAIActiveLenderReferralDeals } from "../../../HttpRequest/admin";
import { LoadingBlock, number } from "./adminAIDashboardShared";
import { ADMIN_AI_DASHBOARD_PATH, goToAdminAIDashboard } from "./adminAINavigation";

export const SharedBankAccountsPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [details, setDetails] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const tab = searchParams.get("tab") || "shared";
  const setTab = (nextTab) => {
    const next = new URLSearchParams(searchParams);
    if (!nextTab || nextTab === "shared") {
      next.delete("tab");
    } else {
      next.set("tab", nextTab);
    }
    setSearchParams(next, { replace: true });
  };
  const [expandedKey, setExpandedKey] = useState("");
  const [referralEarningsByUser, setReferralEarningsByUser] = useState({});

  const loadSharedBanks = async (event) => {
    if (event) {
      event.preventDefault();
    }
    setLoading(true);
    setError("");
    try {
      const data = await getAdminAISharedBankAccounts();
      if (!data || data.found === false) {
        setDetails(null);
        setError(data?.message || data?.errorMessage || "Failed to load shared bank accounts.");
        return;
      }
      setDetails(data);
      setAppliedSearch(String(searchInput || "").trim());
      setExpandedKey("");
    } catch (err) {
      setDetails(null);
      setError(err?.response?.data?.message || err?.message || "Failed to load shared bank accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSharedBanks();
  }, []);

  const cameFromPath = (() => {
    const incoming = location.state?.from;
    if (typeof incoming === "string" && incoming.startsWith("/") && !incoming.includes("shared-bank-accounts")) {
      return incoming;
    }
    try {
      const stored = window.sessionStorage.getItem("oxy-sba-from") || "";
      if (stored.startsWith("/") && !stored.includes("shared-bank-accounts")) {
        return stored;
      }
    } catch {
      return ADMIN_AI_DASHBOARD_PATH;
    }
    return ADMIN_AI_DASHBOARD_PATH;
  })();

  useEffect(() => {
    const incoming = location.state?.from;
    if (typeof incoming === "string" && incoming.startsWith("/") && !incoming.includes("shared-bank-accounts")) {
      try {
        window.sessionStorage.setItem("oxy-sba-from", incoming);
      } catch {
        return undefined;
      }
    }
    return undefined;
  }, [location.state]);

  const query = appliedSearch.toLowerCase();
  const matchesQuery = (...values) => {
    if (!query) {
      return true;
    }
    return values.some((value) => String(value || "").toLowerCase().includes(query));
  };

  const hiddenSharedAccounts = new Set(["62317374965", "62415586468", "026291800001191"]);
  const sharedAccounts = (details?.sharedAccounts || []).filter((group) => {
    const accountNorm = String(group.accountNumberNorm || group.accountNumber || "").replace(/\D/g, "");
    if (hiddenSharedAccounts.has(accountNorm)) {
      return false;
    }
    return matchesQuery(
      group.accountNumber,
      group.ifscCode,
      group.bankName,
      ...(group.lenders || []).flatMap((lender) => [lender.userCode, lender.name, lender.mobileNumber])
    );
  });
  const sharedPersonCount = (() => {
    const userIds = new Set();
    sharedAccounts.forEach((group) => {
      (group.lenders || []).forEach((lender) => {
        if (lender?.userId) {
          userIds.add(lender.userId);
        }
      });
    });
    if (userIds.size) {
      return userIds.size;
    }
    return sharedAccounts.reduce((sum, group) => sum + Number(group.userCount || 0), 0);
  })();
  const hiddenReferralPairs = new Set(["55015-60008"]);
  const referralPairKey = (left, right) => {
    const first = Math.min(Number(left) || 0, Number(right) || 0);
    const second = Math.max(Number(left) || 0, Number(right) || 0);
    return `${first}-${second}`;
  };
  const referralMatches = (details?.referralNameMatches || []).filter((row) => {
    if (hiddenReferralPairs.has(referralPairKey(row.referrerUserId, row.refereeUserId))) {
      return false;
    }
    return matchesQuery(
      row.referrerUserCode,
      row.referrerName,
      row.refereeUserCode,
      row.refereeName,
      row.matchLabel,
      row.matchType
    );
  }).sort((left, right) => Number(Boolean(right.sameBankAccount)) - Number(Boolean(left.sameBankAccount)));

  const openLenderProfile = (userId, userCode, name) => {
    const id = Number(userId);
    if (!id) {
      return;
    }
    const returnTo = tab === "shared"
      ? "/adminAIDashboard/shared-bank-accounts"
      : `/adminAIDashboard/shared-bank-accounts?tab=${tab}`;
    const params = new URLSearchParams({
      lenderId: String(id),
      view: "profile",
      returnTo,
    });
    navigate(`/adminAIDeals?${params.toString()}`, {
      state: {
        lender: {
          lenderId: id,
          userCode: userCode || `LR${id}`,
          name: name || "",
        },
      },
    });
  };
  const bankChanges = (details?.bankAccountChanges || []).filter((change) =>
    matchesQuery(change.userCode, change.name, change.currentAccountNumber, change.currentIfscCode)
  );
  const looksLikeTestName = (name) => /^\s*test\b/i.test(String(name || ""));
  const reusedAccounts = (details?.reusedHistoryAccounts || []).filter((row) => {
    const accountNorm = String(row.previousAccountNumber || "").replace(/\D/g, "");
    if (hiddenSharedAccounts.has(accountNorm)) {
      return false;
    }
    const currentOwners = row.currentOwners || [];
    if (looksLikeTestName(row.previousOwnerName) || currentOwners.some((owner) => looksLikeTestName(owner.name))) {
      return false;
    }
    return matchesQuery(row.previousAccountNumber, row.previousOwnerUserCode, row.previousOwnerName);
  });

  const toggleExpanded = (key) => setExpandedKey((current) => (current === key ? "" : key));

  useEffect(() => {
    if (tab !== "shared" || !expandedKey || !details) {
      return undefined;
    }
    const group = (details.sharedAccounts || []).find((item) =>
      (item.accountNumberNorm || item.accountNumber) === expandedKey
    );
    const lenders = group?.lenders || [];
    const ids = lenders.map((lender) => Number(lender.userId)).filter((userId) => userId > 0);
    if (!ids.length) {
      return undefined;
    }
    let cancelled = false;
    Promise.all(ids.map(async (userId) => {
      try {
        return { userId, ...(await loadReferralEarningsForUser(userId)) };
      } catch {
        return { userId, earned: 0, paid: 0, unpaid: 0, count: 0 };
      }
    })).then((rows) => {
      if (cancelled) {
        return;
      }
      setReferralEarningsByUser((current) => {
        const next = { ...current };
        rows.forEach((row) => {
          next[row.userId] = row;
        });
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [tab, expandedKey, details]);

  const applySearch = (event) => {
    if (event) {
      event.preventDefault();
    }
    const nextQuery = String(searchInput || "").trim();
    if (!details) {
      loadSharedBanks();
      return;
    }
    setAppliedSearch(nextQuery);
    setExpandedKey("");
  };

  return (
    <div className="sba-page">
      <div className="sba-toolbar">
        <div className="sba-nav-actions">
          <button
            type="button"
            className="sba-back"
            onClick={() => navigate(cameFromPath)}
            title={`Back to ${cameFromPath === ADMIN_AI_DASHBOARD_PATH ? "Admin AI Dashboard" : "previous page"}`}
          >
            Back
          </button>
          <button
            type="button"
            className="sba-dash-btn"
            onClick={() => goToAdminAIDashboard(navigate)}
          >
            Admin AI Dashboard
          </button>
        </div>
        <p className="sba-toolbar-copy">Same bank accounts, matching referral names, and bank changes</p>
        <form className="sba-search" onSubmit={applySearch}>
          <input
            value={searchInput}
            placeholder="Search LR ID, name, or account number"
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {error ? <div className="alert alert-danger">{error}</div> : null}
      {loading && !details ? <LoadingBlock label="Scanning active lender bank accounts and names..." /> : null}

      {details ? (
        <>
          <div className="sba-kpis">
            {sbaKpi("Active lenders", details.totalActiveLenders, "teal")}
            <div className="sba-kpi sba-kpi--red sba-kpi-split">
              <div>
                <small>Shared accounts</small>
                <strong>{number(sharedAccounts.length)}</strong>
              </div>
              <span className="sba-kpi-divider" aria-hidden="true" />
              <div>
                <small>Persons sharing them</small>
                <strong>{number(sharedPersonCount)}</strong>
              </div>
            </div>
            {sbaKpi("Referral name matches", referralMatches.length, "purple")}
          </div>

          <div className="sba-tabs">
            {sbaTab(tab, setTab, "shared", "Shared banks", sharedAccounts.length)}
            {sbaTab(tab, setTab, "referral", "Referral name match", referralMatches.length)}
            {sbaTab(tab, setTab, "changes", "Bank history", bankChanges.length)}
            {sbaTab(tab, setTab, "reused", "Old account reused", reusedAccounts.length)}
          </div>

          {tab === "shared" ? (
            <SbaSharedBanksList
              rows={sharedAccounts}
              expandedKey={expandedKey}
              onToggle={toggleExpanded}
              onOpenProfile={openLenderProfile}
              referralEarningsByUser={referralEarningsByUser}
            />
          ) : null}

          {tab === "referral" ? (
            <SbaReferralMatchList rows={referralMatches} onOpenProfile={openLenderProfile} />
          ) : null}

          {tab === "changes" ? (
            <SbaBankHistoryList
              rows={bankChanges}
              expandedKey={expandedKey}
              onToggle={toggleExpanded}
              onOpenProfile={openLenderProfile}
            />
          ) : null}

          {tab === "reused" ? (
            <SbaReusedAccountsList rows={reusedAccounts} onOpenProfile={openLenderProfile} />
          ) : null}
        </>
      ) : null}
    </div>
  );
};

const sbaKpi = (label, value, tone) => (
  <div className={`sba-kpi sba-kpi--${tone}`}>
    <small>{label}</small>
    <strong>{number(value || 0)}</strong>
  </div>
);

const SbaUserIdLink = ({ userId, userCode, name, onOpen }) => {
  const code = userCode || (userId ? `LR${userId}` : "-");
  return (
    <div className="sba-userid-wrap">
      <button
        type="button"
        className="sba-userid"
        title={`Open profile for ${code}`}
        onClick={() => onOpen(userId, userCode, name)}
      >
        {code}
      </button>
      <span>{name || "-"}</span>
    </div>
  );
};

const sbaTab = (tab, setTab, id, label, count) => (
  <button type="button" className={tab === id ? "is-active" : ""} onClick={() => setTab(id)}>
    {label}
    <span>{number(count || 0)}</span>
  </button>
);

const bankInitials = (bankName) => {
  const parts = String(bankName || "Bank")
    .replace(/[^a-zA-Z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const first = parts[0] ? parts[0][0] : "B";
  const second = parts[1] ? parts[1][0] : (parts[0] && parts[0][1] ? parts[0][1] : "K");
  return `${first}${second}`.toUpperCase();
};

const formatAccountNumber = (accountNumber) => {
  const digits = String(accountNumber || "").replace(/\D/g, "");
  if (!digits) {
    return "-";
  }
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
};

const nameInitials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) {
    return "LR";
  }
  return ((parts[0][0] || "") + (parts[1]?.[0] || "")).toUpperCase();
};

const rupees = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN")}`;

const parseReferralEarningsPayload = (payload) => {
  const data = payload?.data || payload || {};
  const summary = data.earningsSummary || data.referralSummary || {};
  return {
    earned: Number(summary.totalEarned ?? summary.refEarnings ?? 0),
    paid: Number(summary.amountPaid ?? summary.refPaid ?? 0),
    unpaid: Number(summary.amountNotPaid ?? summary.refUnpaid ?? 0),
    count: Number(summary.refCount ?? data.totalCount ?? 0),
  };
};

const loadReferralEarningsForUser = async (userId) => {
  try {
    const payload = await getAdminAIActiveLenderReferrals(userId, 1, 1);
    return parseReferralEarningsPayload(payload);
  } catch {
    return { earned: 0, paid: 0, unpaid: 0, count: 0 };
  }
};

const loadPairReferralEarnings = async (referrerId, refereeId) => {
  try {
    const payload = await getAdminAIActiveLenderReferralDeals(referrerId, refereeId);
    const data = payload?.data || payload || {};
    const deals = Array.isArray(data.bonusDeals) ? data.bonusDeals : [];
    let earned = 0;
    let paid = 0;
    let unpaid = 0;
    deals.forEach((deal) => {
      const amount = Number(deal.amount || deal.bonusAmount || 0);
      earned += amount;
      if (String(deal.paymentStatus || "").toLowerCase() === "paid") {
        paid += amount;
      } else {
        unpaid += amount;
      }
    });
    return { earned, paid, unpaid, count: deals.length };
  } catch {
    return { earned: 0, paid: 0, unpaid: 0, count: 0 };
  }
};

const runInBatches = async (items, size, worker) => {
  const results = [];
  for (let index = 0; index < items.length; index += size) {
    const chunk = items.slice(index, index + size);
    results.push(...await Promise.all(chunk.map(worker)));
  }
  return results;
};

const lenderReferralEarnings = (lender, fetched) => {
  if (fetched) {
    return fetched;
  }
  if (lender.referralEarnings != null || lender.referralPaid != null) {
    return {
      earned: Number(lender.referralEarnings || 0),
      paid: Number(lender.referralPaid || 0),
      unpaid: Number(lender.referralUnpaid || 0),
      count: Number(lender.referralCount || 0),
    };
  }
  return null;
};

const SbaEarningsStrip = ({
  earnings,
  fromThis,
  fromThisLabel,
  earnedLabel = "Referral earned",
  paidLabel = "Paid",
  unpaidLabel = "Unpaid",
}) => (
  <>
    <div className="sba-earn-grid">
      <span><small>{earnedLabel}</small><strong>{earnings ? rupees(earnings.earned) : "..."}</strong></span>
      <span><small>{paidLabel}</small><strong>{earnings ? rupees(earnings.paid) : "..."}</strong></span>
      <span><small>{unpaidLabel}</small><strong>{earnings ? rupees(earnings.unpaid) : "..."}</strong></span>
    </div>
    {fromThis ? (
      <p className="sba-earn-from">{fromThisLabel}: <strong>{rupees(fromThis.earned)}</strong></p>
    ) : null}
  </>
);

const SbaSharedBanksList = ({ rows, expandedKey, onToggle, onOpenProfile, referralEarningsByUser = {} }) => {
  if (!rows.length) {
    return <div className="sba-empty">No shared current bank accounts found.</div>;
  }
  return (
    <div className="sba-shared-list">
      {rows.map((group) => {
        const key = group.accountNumberNorm || group.accountNumber;
        const open = expandedKey === key;
        const lenders = group.lenders || [];
        return (
          <article key={key} className={`sba-shared-card${open ? " is-open" : ""}`}>
            <button type="button" className="sba-shared-head" onClick={() => onToggle(key)}>
              <span className="sba-bank-mark">{bankInitials(group.bankName)}</span>
              <div className="sba-shared-copy">
                <strong className="sba-account">{formatAccountNumber(group.accountNumber)}</strong>
                <div className="sba-bank-meta">
                  <span>{group.bankName || "Bank"}</span>
                  {group.ifscCode ? <em className="sba-ifsc">{group.ifscCode}</em> : null}
                </div>
                <div className="sba-lender-preview">
                  {lenders.slice(0, 3).map((lender) => (
                    <span key={lender.userId} className="sba-avatar" title={lender.name || lender.userCode}>
                      {nameInitials(lender.name || lender.userCode)}
                    </span>
                  ))}
                  {lenders.length > 3 ? <span className="sba-avatar sba-avatar-more">+{lenders.length - 3}</span> : null}
                  <small>
                    {lenders.map((lender) => lender.name || lender.userCode).filter(Boolean).slice(0, 2).join(" · ")}
                    {lenders.length > 2 ? ` +${lenders.length - 2}` : ""}
                  </small>
                </div>
              </div>
              <div className={`sba-shared-stat${open ? " is-open" : ""}`}>
                <strong>{number(group.userCount || lenders.length)}</strong>
                <small>Lenders</small>
                <em>{open ? "Hide" : "View"}</em>
              </div>
            </button>
            {open ? (
              <div className="sba-shared-people">
                {lenders.map((lender) => {
                  const earnings = lenderReferralEarnings(lender, referralEarningsByUser[lender.userId]);
                  return (
                  <div key={lender.userId} className="sba-lender-card">
                    <span className="sba-avatar sba-avatar-lg">{nameInitials(lender.name || lender.userCode)}</span>
                    <div>
                      <SbaUserIdLink
                        userId={lender.userId}
                        userCode={lender.userCode}
                        name={lender.name}
                        onOpen={onOpenProfile}
                      />
                      <p>{lender.mobileNumber || "No mobile"}</p>
                      <SbaEarningsStrip earnings={earnings} />
                      {earnings && Number(earnings.count) > 0 ? (
                        <p className="sba-earn-count">{number(earnings.count)} referees</p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="sba-profile-btn"
                      onClick={() => onOpenProfile(lender.userId, lender.userCode, lender.name)}
                    >
                      Profile
                    </button>
                  </div>
                  );
                })}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
};

const referralMatchWhy = (row) => {
  const token = String(row.matchedToken || "").trim();
  const type = String(row.matchType || "").toUpperCase();
  if (type === "SAME_GIVEN_NAME") {
    return token
      ? `Both people share the given name “${token}”.`
      : "Both people share the same given name.";
  }
  if (type === "SHARED_DISTINCTIVE_NAME") {
    return token
      ? `Both people share the name “${token}”.`
      : "Both people share a distinctive name.";
  }
  return row.matchLabel || "Name match";
};

const referralStatusText = (row) => {
  const status = String(row.status || "").trim();
  const source = String(row.source || "").trim();
  if (status && source) {
    return `${status} · ${source}`;
  }
  return status || source || "Referral linked";
};

const SbaReferralPerson = ({
  userId,
  userCode,
  name,
  role,
  onOpen,
  showProfile,
  earnings,
}) => (
  <div className="sba-ref-person">
    <span className="sba-avatar sba-avatar-lg">{nameInitials(name || userCode)}</span>
    <div>
      <small className="sba-ref-role">{role}</small>
      <SbaUserIdLink userId={userId} userCode={userCode} name={name} onOpen={onOpen} />
      <SbaEarningsStrip
        earnings={earnings}
        earnedLabel="This person earned"
        paidLabel="Paid to them"
        unpaidLabel="Unpaid to them"
      />
      <p className="sba-earn-note">Own referral bonus only — not money from the other person.</p>
    </div>
    {showProfile ? (
      <button type="button" className="sba-profile-btn" onClick={() => onOpen(userId, userCode, name)}>
        Profile
      </button>
    ) : null}
  </div>
);

const personLabel = (name, userCode, userId) => name || userCode || (userId ? `LR${userId}` : "this person");

const SbaPairFromRefereeBar = ({ row, pairEarnings }) => {
  const referrer = personLabel(row.referrerName, row.referrerUserCode, row.referrerUserId);
  const referee = personLabel(row.refereeName, row.refereeUserCode, row.refereeUserId);
  return (
    <div className="sba-ref-from-bar">
      <div className="sba-ref-from-copy">
        <strong>Money {referrer} got from {referee}</strong>
        <p>
          This green box is the referrer’s bonus from the right-side person only.
          It is not {referee}’s own earning.
        </p>
      </div>
      <div className="sba-earn-grid sba-earn-grid-from">
        <span><small>From this referee</small><strong>{pairEarnings ? rupees(pairEarnings.earned) : "..."}</strong></span>
        <span><small>Paid to referrer</small><strong>{pairEarnings ? rupees(pairEarnings.paid) : "..."}</strong></span>
        <span><small>Unpaid to referrer</small><strong>{pairEarnings ? rupees(pairEarnings.unpaid) : "..."}</strong></span>
      </div>
    </div>
  );
};

const SbaReferralMatchCard = ({ row, onOpenProfile, earningsByUser = {}, pairEarnings }) => {
  const sameBank = Boolean(row.sameBankAccount);
  return (
    <article className={`sba-ref-card${sameBank ? " is-same" : " is-compact"}`}>
      {sameBank ? (
        <div className="sba-ref-banner">Same bank account — referrer and referee are using one account</div>
      ) : null}
      <div className="sba-ref-body">
        <SbaReferralPerson
          userId={row.referrerUserId}
          userCode={row.referrerUserCode}
          name={row.referrerName}
          role="Who referred"
          onOpen={onOpenProfile}
          showProfile={sameBank}
          earnings={earningsByUser[row.referrerUserId]}
        />
        <div className="sba-ref-arrow" aria-hidden="true">
          <span>Referred</span>
        </div>
        <SbaReferralPerson
          userId={row.refereeUserId}
          userCode={row.refereeUserCode}
          name={row.refereeName}
          role="Who joined"
          onOpen={onOpenProfile}
          showProfile={sameBank}
          earnings={earningsByUser[row.refereeUserId]}
        />
      </div>
      <SbaPairFromRefereeBar row={row} pairEarnings={pairEarnings} />
      <div className="sba-ref-meta">
        <em className={`sba-pill sba-pill--${String(row.matchType || "").toLowerCase()}`}>
          {row.matchLabel || "Name match"}
        </em>
        <span className="sba-ref-why">{referralMatchWhy(row)}</span>
        <span className="sba-ref-status">{referralStatusText(row)}</span>
        {sameBank ? (
          <em className="sba-pill sba-pill--same-bank">Same account</em>
        ) : (
          <em className="sba-pill sba-pill--diff-bank">Different banks</em>
        )}
      </div>
    </article>
  );
};

const REFERRAL_PAGE_SIZE = 20;

const SbaReferralMatchList = ({ rows, onOpenProfile }) => {
  const [page, setPage] = useState(1);
  const [earningsByUser, setEarningsByUser] = useState({});
  const [pairEarningsByKey, setPairEarningsByKey] = useState({});
  const earningsRef = useRef({});
  const pairRef = useRef({});
  earningsRef.current = earningsByUser;
  pairRef.current = pairEarningsByKey;
  const totalCount = rows.length;
  const sameBankCount = rows.filter((row) => row.sameBankAccount).length;
  const otherCount = totalCount - sameBankCount;
  const totalPages = Math.max(1, Math.ceil((totalCount || 1) / REFERRAL_PAGE_SIZE));
  const listKey = `${totalCount}:${rows[0]?.referrerUserId || 0}-${rows[0]?.refereeUserId || 0}:${rows[totalCount - 1]?.referrerUserId || 0}-${rows[totalCount - 1]?.refereeUserId || 0}`;
  useEffect(() => {
    setPage(1);
  }, [listKey]);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * REFERRAL_PAGE_SIZE;
  const pageRows = rows.slice(start, start + REFERRAL_PAGE_SIZE);
  const pageIdKey = pageRows.map((row) => `${row.referrerUserId}-${row.refereeUserId}`).join(",");
  useEffect(() => {
    if (!pageIdKey) {
      return undefined;
    }
    const pairs = pageIdKey.split(",").filter(Boolean).map((key) => {
      const [referrerUserId, refereeUserId] = key.split("-").map(Number);
      return { key, referrerUserId, refereeUserId };
    });
    const userIds = [...new Set(pairs.flatMap((pair) => [pair.referrerUserId, pair.refereeUserId]))]
      .filter((userId) => userId > 0 && earningsRef.current[userId] == null);
    const missingPairs = pairs.filter((pair) => pairRef.current[pair.key] == null);
    let cancelled = false;
    const load = async () => {
      if (userIds.length) {
        const rowsLoaded = await runInBatches(userIds, 5, async (userId) => ({
          userId,
          ...(await loadReferralEarningsForUser(userId)),
        }));
        if (cancelled) {
          return;
        }
        setEarningsByUser((current) => {
          const next = { ...current };
          rowsLoaded.forEach((row) => {
            next[row.userId] = row;
          });
          return next;
        });
      }
      if (missingPairs.length) {
        const pairRows = await runInBatches(missingPairs, 4, async (pair) => ({
          key: pair.key,
          ...(await loadPairReferralEarnings(pair.referrerUserId, pair.refereeUserId)),
        }));
        if (cancelled) {
          return;
        }
        setPairEarningsByKey((current) => {
          const next = { ...current };
          pairRows.forEach((row) => {
            next[row.key] = row;
          });
          return next;
        });
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [pageIdKey]);
  if (!totalCount) {
    return <div className="sba-empty">No referral pairs sharing a distinctive given name.</div>;
  }
  const sameBankRows = pageRows.filter((row) => row.sameBankAccount);
  const otherRows = pageRows.filter((row) => !row.sameBankAccount);
  const rangeStart = start + 1;
  const rangeEnd = start + pageRows.length;
  const goToPage = (nextPage) => {
    const clamped = Math.min(Math.max(1, nextPage), totalPages);
    setPage(clamped);
  };
  const pairKey = (row) => `${row.referrerUserId}-${row.refereeUserId}`;
  return (
    <div className="sba-ref-page">
      <div className="sba-ref-legend">
        <p>
          These are referral pairs where both people share a distinctive name.
          Orange cards also use the <strong>same bank account</strong>.
        </p>
        <div className="sba-ref-legend-chips">
          <span className="sba-ref-chip is-same">{sameBankCount} same bank</span>
          <span className="sba-ref-chip">{otherCount} different banks</span>
        </div>
      </div>
      <div className="sba-ref-pager">
        <span className="sba-ref-pager-count">
          Showing {number(rangeStart)}-{number(rangeEnd)} of {number(totalCount)} · 20 per page
        </span>
        <div className="sba-ref-pager-buttons">
          <button type="button" disabled={safePage <= 1} onClick={() => goToPage(safePage - 1)}>
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNo) => (
            <button
              key={pageNo}
              type="button"
              className={pageNo === safePage ? "is-active" : ""}
              onClick={() => goToPage(pageNo)}
            >
              {pageNo}
            </button>
          ))}
          <button type="button" disabled={safePage >= totalPages} onClick={() => goToPage(safePage + 1)}>
            Next
          </button>
        </div>
      </div>
      {sameBankRows.length ? (
        <section className="sba-ref-section">
          <h4>Same bank account</h4>
          <p>Highest risk: one person referred the other, names match, and both use the same account.</p>
          <div className="sba-ref-list">
            {sameBankRows.map((row) => (
              <SbaReferralMatchCard
                key={`${row.referrerUserId}-${row.refereeUserId}-${row.matchType}`}
                row={row}
                onOpenProfile={onOpenProfile}
                earningsByUser={earningsByUser}
                pairEarnings={pairEarningsByKey[pairKey(row)]}
              />
            ))}
          </div>
        </section>
      ) : null}
      {otherRows.length ? (
        <section className="sba-ref-section">
          <h4>Name match only</h4>
          <p>Referral pairs with a shared name, but they use different bank accounts.</p>
          <div className="sba-ref-list">
            {otherRows.map((row) => (
              <SbaReferralMatchCard
                key={`${row.referrerUserId}-${row.refereeUserId}-${row.matchType}`}
                row={row}
                onOpenProfile={onOpenProfile}
                earningsByUser={earningsByUser}
                pairEarnings={pairEarningsByKey[pairKey(row)]}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};

const SbaReusedAccountsList = ({ rows, onOpenProfile }) => {
  if (!rows.length) {
    return <div className="sba-empty">No old bank accounts that are now used by another active lender.</div>;
  }
  return (
    <div className="sba-reused-page">
      <div className="sba-ref-legend">
        <p>
          These old accounts were used by one lender and are now used by another active lender.
          The <strong>current owner</strong> is shown on the right.
        </p>
        <div className="sba-ref-legend-chips">
          <span className="sba-ref-chip">{rows.length} reused accounts</span>
        </div>
      </div>
      <div className="sba-reused-list">
      {rows.map((row, index) => {
        const currentOwners = row.currentOwners || [];
        const bankName = currentOwners[0]?.bankName || "";
        const currentOwnerNames = currentOwners
          .map((owner) => {
            const code = owner.userCode || (owner.userId ? `LR${owner.userId}` : "");
            const displayName = owner.name || "";
            return `${code}${displayName ? ` ${displayName}` : ""}`.trim();
          })
          .filter(Boolean);
        return (
          <article key={`${row.previousOwnerUserId}-${row.previousAccountNumber}-${index}`} className="sba-reused-card">
            <div className="sba-reused-top">
              <span className="sba-bank-mark">{bankInitials(bankName || "AC")}</span>
              <div>
                <strong className="sba-account">{formatAccountNumber(row.previousAccountNumber)}</strong>
                <div className="sba-bank-meta">
                  {bankName ? <span>{bankName}</span> : <span>Old account reused</span>}
                  {row.previousIfscCode ? <em className="sba-ifsc">{row.previousIfscCode}</em> : null}
                  {row.changedOn ? <em className="sba-date-chip">Changed {row.changedOn}</em> : null}
                </div>
                <p className="sba-current-owner-line">
                  Current owner of this account:{" "}
                  <strong>{currentOwnerNames.join(", ") || "Not found"}</strong>
                </p>
              </div>
            </div>
            <div className="sba-reused-flow">
              <div className="sba-reused-side">
                <small>Previously used by</small>
                <div className="sba-lender-card">
                  <span className="sba-avatar sba-avatar-lg">
                    {nameInitials(row.previousOwnerName || row.previousOwnerUserCode)}
                  </span>
                  <div>
                    <SbaUserIdLink
                      userId={row.previousOwnerUserId}
                      userCode={row.previousOwnerUserCode}
                      name={row.previousOwnerName}
                      onOpen={onOpenProfile}
                    />
                  </div>
                  <button
                    type="button"
                    className="sba-profile-btn"
                    onClick={() => onOpenProfile(row.previousOwnerUserId, row.previousOwnerUserCode, row.previousOwnerName)}
                  >
                    Profile
                  </button>
                </div>
              </div>
              <span className="sba-reused-arrow">Now used by</span>
              <div className="sba-reused-side">
                <small>Current owner of this account</small>
                {currentOwners.map((owner) => (
                  <div key={owner.userId} className="sba-lender-card sba-lender-card-current">
                    <span className="sba-avatar sba-avatar-lg">{nameInitials(owner.nameAsPerBank || owner.name || owner.userCode)}</span>
                    <div>
                      <SbaUserIdLink
                        userId={owner.userId}
                        userCode={owner.userCode}
                        name={owner.name}
                        onOpen={onOpenProfile}
                      />
                      {owner.nameAsPerBank ? <p>Name in bank: {owner.nameAsPerBank}</p> : null}
                      {owner.mobileNumber ? <p>{owner.mobileNumber}</p> : null}
                    </div>
                    <button
                      type="button"
                      className="sba-profile-btn"
                      onClick={() => onOpenProfile(owner.userId, owner.userCode, owner.name)}
                    >
                      Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </article>
        );
      })}
      </div>
    </div>
  );
};

const HISTORY_PAGE_SIZE = 20;

const SbaBankHistoryList = ({ rows, expandedKey, onToggle, onOpenProfile }) => {
  const [page, setPage] = useState(1);
  const totalCount = rows.length;
  const manyCount = rows.filter((row) => Number(row.distinctAccountCount || 0) >= 3).length;
  const totalPages = Math.max(1, Math.ceil((totalCount || 1) / HISTORY_PAGE_SIZE));
  const listKey = `${totalCount}:${rows[0]?.userId || 0}:${rows[totalCount - 1]?.userId || 0}`;
  useEffect(() => {
    setPage(1);
  }, [listKey]);
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * HISTORY_PAGE_SIZE;
  const pageRows = rows.slice(start, start + HISTORY_PAGE_SIZE);
  if (!totalCount) {
    return <div className="sba-empty">No bank-account changes in history.</div>;
  }
  const rangeStart = start + 1;
  const rangeEnd = start + pageRows.length;
  const goToPage = (nextPage) => setPage(Math.min(Math.max(1, nextPage), totalPages));
  return (
    <div className="sba-hist-page">
      <div className="sba-ref-legend sba-hist-legend">
        <p>
          These lenders changed their bank account over time.
          The <strong>current account is highlighted</strong>. Open a card to see older accounts.
        </p>
        <div className="sba-ref-legend-chips">
          <span className="sba-ref-chip is-hist">{totalCount} lenders changed</span>
          <span className="sba-ref-chip">{manyCount} with 3+ accounts</span>
        </div>
      </div>
      <div className="sba-ref-pager">
        <span className="sba-ref-pager-count">
          Showing {number(rangeStart)}-{number(rangeEnd)} of {number(totalCount)} · 20 per page
        </span>
        <div className="sba-ref-pager-buttons">
          <button type="button" disabled={safePage <= 1} onClick={() => goToPage(safePage - 1)}>Previous</button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNo) => (
            <button
              key={pageNo}
              type="button"
              className={pageNo === safePage ? "is-active" : ""}
              onClick={() => goToPage(pageNo)}
            >
              {pageNo}
            </button>
          ))}
          <button type="button" disabled={safePage >= totalPages} onClick={() => goToPage(safePage + 1)}>Next</button>
        </div>
      </div>
      <div className="sba-hist-list">
        {pageRows.map((row) => (
          <SbaBankHistoryCard
            key={`chg-${row.userId}`}
            row={row}
            open={expandedKey === `chg-${row.userId}`}
            onToggle={() => onToggle(`chg-${row.userId}`)}
            onOpenProfile={onOpenProfile}
          />
        ))}
      </div>
    </div>
  );
};

const SbaBankHistoryCard = ({ row, open, onToggle, onOpenProfile }) => {
  const accountCount = Number(row.distinctAccountCount || (row.history || []).length || 0);
  const history = [...(row.history || [])];
  const currentItems = history.filter((item) => item.sameAsCurrent);
  const oldItems = history.filter((item) => !item.sameAsCurrent);
  return (
    <article className={`sba-hist-card${open ? " is-open" : ""}${accountCount >= 3 ? " is-many" : ""}`}>
      <div className="sba-hist-head">
        <span className="sba-bank-mark sba-hist-mark">{bankInitials(row.currentBankName)}</span>
        <div className="sba-hist-copy">
          <SbaUserIdLink userId={row.userId} userCode={row.userCode} name={row.name} onOpen={onOpenProfile} />
          <strong className="sba-account">{formatAccountNumber(row.currentAccountNumber)}</strong>
          <div className="sba-bank-meta">
            <em className="sba-pill sba-pill--current">Current account</em>
            <span>{row.currentBankName || "Bank"}</span>
            {row.currentIfscCode ? <em className="sba-ifsc">{row.currentIfscCode}</em> : null}
            {row.mobileNumber ? <span>{row.mobileNumber}</span> : null}
          </div>
        </div>
        <button type="button" className="sba-profile-btn" onClick={() => onOpenProfile(row.userId, row.userCode, row.name)}>
          Profile
        </button>
        <button type="button" className={`sba-hist-stat${open ? " is-open" : ""}`} onClick={onToggle}>
          <strong>{number(accountCount)}</strong>
          <small>Accounts</small>
          <em>{open ? "Close" : "View"}</em>
        </button>
      </div>
      {open ? (
        <div className="sba-hist-open">
          <div className="sba-hist-close-row">
            <span>Account history</span>
            <button type="button" className="sba-close-btn" onClick={onToggle}>
              Close
            </button>
          </div>
          <div className="sba-hist-timeline">
          <div className="sba-hist-now">
            <small>Using now</small>
            <strong>{formatAccountNumber(row.currentAccountNumber)}</strong>
            <p>
              {row.currentBankName || "Bank"}
              {row.currentIfscCode ? ` · ${row.currentIfscCode}` : ""}
            </p>
            {currentItems[0]?.updatedOn ? <em className="sba-date-chip">Updated {currentItems[0].updatedOn}</em> : null}
          </div>
          {oldItems.length ? (
            <div className="sba-hist-old-list">
              <small>Previously used</small>
              {oldItems.map((item, index) => (
                <div key={`${row.userId}-old-${index}`} className="sba-hist-old">
                  <strong>{formatAccountNumber(item.accountNumber)}</strong>
                  <p>
                    {item.bankName || "Bank"}
                    {item.ifscCode ? ` · ${item.ifscCode}` : ""}
                  </p>
                  {item.updatedOn ? <em className="sba-date-chip">Changed {item.updatedOn}</em> : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="sba-empty">No older account details found.</div>
          )}
          </div>
          <div className="sba-hist-close-row sba-hist-close-row-bottom">
            <span>Done reviewing this lender?</span>
            <button type="button" className="sba-close-btn" onClick={onToggle}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
};

const SbaGroupList = ({
  emptyText,
  rows,
  expandedKey,
  onToggle,
  rowKey,
  title,
  subtitle,
  count,
  countLabel,
  lenders,
  history,
  badge,
}) => {
  if (!rows.length) {
    return <div className="sba-empty">{emptyText}</div>;
  }
  return (
    <div className="sba-list">
      {rows.map((row) => {
        const key = rowKey(row);
        const open = expandedKey === key;
        return (
          <article key={key} className="sba-card">
            <button type="button" className="sba-card-head" onClick={() => onToggle(key)}>
              <div>
                <strong>{title(row)}</strong>
                <p>{subtitle(row)}</p>
              </div>
              <div className="sba-card-meta">
                {badge && badge(row) ? <em className="sba-pill sba-pill--same_surname">{badge(row)}</em> : null}
                <span className="sba-count">
                  {number(count(row) || 0)} {countLabel}
                </span>
              </div>
            </button>
            {open && lenders ? (
              <div className="sba-people">
                {(lenders(row) || []).map((lender) => (
                  <div key={lender.userId} className="sba-person">
                    <strong>{lender.userCode}</strong>
                    <span>{lender.name || "-"}</span>
                    <span>{lender.mobileNumber || "-"}</span>
                    <span>{lender.accountNumber || "No bank"}</span>
                  </div>
                ))}
              </div>
            ) : null}
            {open && history ? (
              <div className="sba-people">
                {(history(row) || []).map((item, index) => (
                  <div key={`${key}-${index}`} className="sba-person">
                    <strong>{item.updatedOn || "No date"}</strong>
                    <span>{item.accountNumber || "-"}</span>
                    <span>{item.ifscCode || "-"}</span>
                    <span>{item.sameAsCurrent ? "Current" : item.bankName || "-"}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
};
