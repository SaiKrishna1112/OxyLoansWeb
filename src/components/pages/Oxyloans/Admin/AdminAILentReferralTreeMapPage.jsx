import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaArrowLeft, FaChevronRight, FaDownload, FaProjectDiagram, FaSync, FaTimes, FaUser, FaUserFriends } from "react-icons/fa";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  downloadAdminAIActiveLenderReferralTreeExcel,
  getAdminAIActiveLenderProfile,
  getAdminAIActiveLenderReferrals,
  getAdminAIActiveLenderReferralTree,
  parseAdminAIExportError,
} from "../../../HttpRequest/admin";
import "./AdminAIDashboard.css";

const PORTFOLIO_PATH = "/adminAIActiveLendersReferralPortfolio";
const fmtNum = (value) => Number(value || 0).toLocaleString("en-IN");
const fmtMoney = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN")}`;
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);
const pickNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const responseData = (payload) => payload?.data || payload || {};
const csvEscape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const tierClass = (isRoot, depth) => {
  if (isRoot || depth === 0) return "tier-l0";
  if (depth === 1) return "tier-l1";
  if (depth === 2) return "tier-l2";
  if (depth === 3) return "tier-l3";
  return "tier-l4";
};

const roleLabel = (isRoot, depth) => {
  if (isRoot || depth === 0) return "MAIN";
  return `L${depth}`;
};

/** Count members at each depth (L1 = direct, L2 = under L1, …). Root is excluded. */
const countMembersByLevel = (tree) => {
  const counts = {};
  const walk = (nodes, depth) => {
    (nodes || []).forEach((node) => {
      counts[depth] = (counts[depth] || 0) + 1;
      walk(node.children, depth + 1);
    });
  };
  walk(tree?.children, 1);
  return counts;
};

const findNodeChildren = (tree, lenderId) => {
  const targetId = pickNumber(lenderId);
  if (!tree || !targetId) return [];
  const rootId = pickNumber(tree.lenderId);
  if (rootId === targetId) {
    return Array.isArray(tree.children) ? tree.children : [];
  }
  const walk = (nodes) => {
    for (const node of nodes || []) {
      const id = pickNumber(node.refereeId);
      if (id === targetId) {
        return Array.isArray(node.children) ? node.children : [];
      }
      const found = walk(node.children);
      if (found) return found;
    }
    return null;
  };
  return walk(tree.children) || [];
};

const mapChildRows = (children, parentDepth = 0) =>
  (children || []).map((node) => {
    const refereeId = pickNumber(node.refereeId);
    const childCount = Array.isArray(node.children) ? node.children.length : pickNumber(node.childCount);
    return {
      lenderId: refereeId,
      name: valueOrDash(node.refereeName) || (refereeId ? `User ${refereeId}` : "-"),
      lenderCode: valueOrDash(node.refereeCode) || (refereeId ? `LR${refereeId}` : "-"),
      status: valueOrDash(node.status),
      referredOn: valueOrDash(node.referredOn),
      childCount,
      depth: parentDepth + 1,
    };
  });

const buildLentRefereesCsvBlob = (tree, rootName, rootId) => {
  const rootCode = valueOrDash(tree?.lenderCode) || (rootId ? `LR${rootId}` : "-");
  const children = Array.isArray(tree?.children) ? tree.children : [];
  const header = [
    "S.No",
    "Referrer Lender ID",
    "Referrer Name",
    "Referrer Code",
    "Referee Lender ID",
    "Referee Name",
    "Referee Code",
    "Status",
    "Referred On",
    "Has Lent Downline",
    "Downline Count",
  ];
  const lines = children.map((node, index) => {
    const refereeId = pickNumber(node.refereeId);
    const refereeName = valueOrDash(node.refereeName) || (refereeId ? `User ${refereeId}` : "-");
    const refereeCode = valueOrDash(node.refereeCode) || (refereeId ? `LR${refereeId}` : "-");
    const childCount = Array.isArray(node.children) ? node.children.length : pickNumber(node.childCount);
    return [
      index + 1,
      rootId,
      rootName,
      rootCode,
      refereeId,
      refereeName,
      refereeCode,
      valueOrDash(node.status),
      valueOrDash(node.referredOn),
      childCount > 0 ? "Yes" : "No",
      childCount,
    ]
      .map(csvEscape)
      .join(",");
  });
  return new Blob([`\uFEFF${header.join(",")}\n${lines.join("\n")}`], {
    type: "text/csv;charset=utf-8;",
  });
};

const FtreeCard = ({
  name,
  lenderId,
  isRoot = false,
  depth = 0,
  parentName = "",
  parentId = null,
  childCount = 0,
  selected = false,
  onSelect,
}) => {
  const isParentReferee = !isRoot && childCount > 0;
  const displayId = lenderId ? `LR${lenderId}` : "-";
  return (
    <button
      type="button"
      className={[
        "admin-ai-ftree-card",
        "admin-ai-ftree-card--compact",
        "is-clickable",
        tierClass(isRoot, depth),
        isParentReferee ? "has-children" : "is-leaf",
        selected ? "is-selected" : "",
      ].filter(Boolean).join(" ")}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const id = pickNumber(lenderId);
        if (id > 0 && typeof onSelect === "function") {
          onSelect({
            lenderId: id,
            name,
            depth,
            parentName,
            parentId,
            childCount,
            isRoot,
          });
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          const id = pickNumber(lenderId);
          if (id > 0 && typeof onSelect === "function") {
            onSelect({
              lenderId: id,
              name,
              depth,
              parentName,
              parentId,
              childCount,
              isRoot,
            });
          }
        }
      }}
      title={[
        name,
        displayId,
        "Click for personal details & earnings",
        parentName ? `Referred by: ${parentName}${parentId ? ` (LR${parentId})` : ""}` : "",
        isParentReferee ? `Also referring ${childCount} Lent user(s) below` : "No Lent children",
      ].filter(Boolean).join(" · ")}
    >
      <span className="admin-ai-ftree-card-level">{roleLabel(isRoot, depth)}</span>
      <span className="admin-ai-ftree-card-main">
        <strong title={name}>{name}</strong>
        <span className="admin-ai-ftree-id-row">
          <b className="admin-ai-ftree-id">{displayId}</b>
          {isParentReferee ? <em className="admin-ai-ftree-kids-pill">↓{fmtNum(childCount)}</em> : null}
        </span>
      </span>
    </button>
  );
};

const FtreeNode = ({
  node,
  depth = 1,
  parentName = "",
  parentId = null,
  selectedId = null,
  onSelect,
}) => {
  const children = Array.isArray(node?.children) ? node.children : [];
  const refereeId = pickNumber(node.refereeId);
  const name = valueOrDash(node.refereeName) || (refereeId ? `User ${refereeId}` : "-");
  const singleChildChain = children.length === 1;

  return (
    <div
      className={`admin-ai-ftree-node ${tierClass(false, depth)}${singleChildChain ? " is-chain" : ""}${children.length > 1 ? " is-branch" : ""}`}
      data-depth={depth}
      data-parent-id={parentId || ""}
    >
      <div className="admin-ai-ftree-node-stem" aria-hidden="true" />
      <FtreeCard
        name={name}
        lenderId={refereeId || null}
        depth={depth}
        parentName={parentName}
        parentId={parentId}
        childCount={children.length}
        selected={selectedId === refereeId}
        onSelect={onSelect}
      />
      {children.length ? (
        <div className={`admin-ai-ftree-branch ${singleChildChain ? "admin-ai-ftree-branch--chain" : "admin-ai-ftree-branch--multi"}`}>
          <div className="admin-ai-ftree-vline" />
          <div className={`admin-ai-ftree-kids ${singleChildChain ? "admin-ai-ftree-kids--chain" : "admin-ai-ftree-kids--siblings"}`}>
            {children.map((child) => (
              <FtreeNode
                key={`${node.refereeId}-${child.refereeId}-${child.referenceId}`}
                node={child}
                depth={depth + 1}
                parentName={name}
                parentId={refereeId}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const AdminAILentReferralTreeMapPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const lenderId = pickNumber(searchParams.get("lenderId"));
  const returnTo =
    searchParams.get("returnTo") ||
    location.state?.from ||
    PORTFOLIO_PATH;

  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportingPicture, setExportingPicture] = useState(false);
  const treeStageRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [showChildren, setShowChildren] = useState(false);

  const selectedChildren = useMemo(() => {
    if (!selected || !tree) return [];
    const kids = findNodeChildren(tree, selected.lenderId);
    return mapChildRows(kids, pickNumber(selected.depth));
  }, [selected, tree]);

  const loadTree = useCallback(async (id) => {
    if (!id) {
      setTree(null);
      setError("lenderId is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = responseData(await getAdminAIActiveLenderReferralTree(id));
      if (data.status && data.status !== "SUCCESS") {
        throw new Error(data.message || "Failed to load tree map.");
      }
      setTree(data);
    } catch (requestError) {
      setTree(null);
      setError(requestError?.response?.data?.message || requestError?.message || "Failed to load tree map.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTree(lenderId);
  }, [lenderId, loadTree]);

  const loadPersonDetail = useCallback(async (person) => {
    const id = pickNumber(person?.lenderId);
    if (!id) return;
    setSelected(person);
    setShowChildren(false);
    setDetailLoading(true);
    setDetailError("");
    setDetail(null);
    try {
      const [profileRes, referralRes] = await Promise.all([
        getAdminAIActiveLenderProfile(id).catch(() => null),
        getAdminAIActiveLenderReferrals(id, 1, 1).catch(() => null),
      ]);
      const profilePayload = responseData(profileRes);
      const referralPayload = responseData(referralRes);
      const profile = profilePayload?.profile || profilePayload || {};
      const earnings = referralPayload?.earningsSummary || referralPayload?.referralSummary || {};
      const referredBy = referralPayload?.referredBy || {};
      setDetail({
        lenderId: id,
        name: valueOrDash(profile.name || profile.fullName || person.name),
        lenderCode: valueOrDash(profile.userCode || profile.lenderCode || `LR${id}`),
        email: valueOrDash(profile.email),
        mobileNumber: valueOrDash(profile.mobileNumber),
        city: valueOrDash(profile.city),
        state: valueOrDash(profile.state),
        depth: person.depth,
        isRoot: !!person.isRoot,
        parentName: valueOrDash(person.parentName),
        parentId: person.parentId,
        childCount: pickNumber(person.childCount),
        totalEarned: pickNumber(earnings.totalEarned ?? earnings.refEarnings),
        amountPaid: pickNumber(earnings.amountPaid ?? earnings.refPaid),
        amountNotPaid: pickNumber(earnings.amountNotPaid ?? earnings.refUnpaid),
        totalInvestment: pickNumber(
          earnings.totalInvestment
          ?? earnings.refAmt
          ?? profile.totalParticipationAmount
          ?? profile.totalInvestment
        ),
        ownParticipation: pickNumber(profile.totalParticipationAmount ?? profile.totalInvestment),
        referredByName: valueOrDash(referredBy.name || referredBy.referrerName || person.parentName),
        referredById: pickNumber(referredBy.referrerId || referredBy.lenderId || person.parentId),
      });
    } catch (requestError) {
      setDetail(null);
      setDetailError(requestError?.response?.data?.message || requestError?.message || "Failed to load person details.");
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetail = () => {
    setSelected(null);
    setDetail(null);
    setDetailError("");
    setShowChildren(false);
  };

  const goBackToPortfolio = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    navigate(returnTo.startsWith("/") ? returnTo : PORTFOLIO_PATH, { replace: true });
  };

  const downloadTreeLocal = (rootNameLocal, rootIdLocal) => {
    const code = valueOrDash(tree?.lenderCode) || `LR${rootIdLocal || lenderId}`;
    const blob = buildLentRefereesCsvBlob(tree, rootNameLocal, rootIdLocal || lenderId);
    saveAs(blob, `${code}-referees-list-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const captureTreeStagePng = async () => {
    closeDetail();
    const stage = treeStageRef.current;
    if (!stage) {
      throw new Error("Tree chart is not ready to capture.");
    }
    const prevOverflow = stage.style.overflow;
    const prevOverflowX = stage.style.overflowX;
    const prevOverflowY = stage.style.overflowY;
    const prevHeight = stage.style.height;
    const prevMaxHeight = stage.style.maxHeight;
    stage.style.overflow = "visible";
    stage.style.overflowX = "visible";
    stage.style.overflowY = "visible";
    stage.style.height = "auto";
    stage.style.maxHeight = "none";
    try {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const canvas = await html2canvas(stage, {
        backgroundColor: "#f8fafc",
        scale: Math.min(2, window.devicePixelRatio || 2),
        useCORS: true,
        logging: false,
        allowTaint: true,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.scrollHeight,
      });
      const pngDataUrl = canvas.toDataURL("image/png");
      if (!pngDataUrl || pngDataUrl.length < 100) {
        throw new Error("Failed to capture tree chart image.");
      }
      return { pngDataUrl, stage, prevOverflow, prevOverflowX, prevOverflowY, prevHeight, prevMaxHeight };
    } catch (captureError) {
      stage.style.overflow = prevOverflow;
      stage.style.overflowX = prevOverflowX;
      stage.style.overflowY = prevOverflowY;
      stage.style.height = prevHeight;
      stage.style.maxHeight = prevMaxHeight;
      throw captureError;
    }
  };

  const restoreTreeStageStyles = (capture) => {
    if (!capture?.stage) return;
    const { stage, prevOverflow, prevOverflowX, prevOverflowY, prevHeight, prevMaxHeight } = capture;
    stage.style.overflow = prevOverflow;
    stage.style.overflowX = prevOverflowX;
    stage.style.overflowY = prevOverflowY;
    stage.style.height = prevHeight;
    stage.style.maxHeight = prevMaxHeight;
  };

  const downloadTreePicture = async () => {
    if (!lenderId || !tree) {
      setError("Tree is not loaded yet. Please wait and try again.");
      return;
    }
    const rootIdLocal = pickNumber(tree?.lenderId) || lenderId;
    const code = valueOrDash(tree?.lenderCode) || `LR${rootIdLocal}`;
    setExportingPicture(true);
    setError("");
    let capture = null;
    try {
      capture = await captureTreeStagePng();
      const response = await fetch(capture.pngDataUrl);
      const blob = await response.blob();
      saveAs(blob, `${code}-lent-referral-tree-map-${new Date().toISOString().slice(0, 10)}.png`);
    } catch (requestError) {
      setError(requestError?.message || "Failed to download tree picture.");
    } finally {
      restoreTreeStageStyles(capture);
      setExportingPicture(false);
    }
  };

  const downloadTree = async () => {
    if (!lenderId || !tree) {
      setError("Tree is not loaded yet. Please wait and try again.");
      return;
    }
    const rootNameLocal = valueOrDash(tree?.name) !== "-"
      ? valueOrDash(tree?.name)
      : valueOrDash(tree?.lenderCode) || `LR${lenderId}`;
    const rootIdLocal = pickNumber(tree?.lenderId) || lenderId;
    const code = valueOrDash(tree?.lenderCode) || `LR${rootIdLocal}`;
    setExporting(true);
    setError("");
    try {
      // Excel sheet = only this referrer's direct Lent referees list.
      const response = await downloadAdminAIActiveLenderReferralTreeExcel(lenderId);
      const blob = response?.data;
      if (!blob) throw new Error("Empty Excel response.");
      const contentType = String(blob.type || "");
      if (contentType.includes("json") || contentType.includes("text/plain") || blob.size < 64) {
        throw new Error("Server Excel unavailable.");
      }
      saveAs(blob, `${code}-referees-list-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (requestError) {
      try {
        downloadTreeLocal(rootNameLocal, rootIdLocal);
      } catch {
        setError((await parseAdminAIExportError(requestError)) || requestError?.message || "Failed to download Excel list.");
      }
    } finally {
      setExporting(false);
    }
  };

  const refreshTree = () => {
    if (!lenderId || loading) return;
    loadTree(lenderId);
  };

  const children = Array.isArray(tree?.children) ? tree.children : [];
  const lentCount = pickNumber(tree?.referralSummary?.lent) + pickNumber(tree?.referralSummary?.disbursed);
  const levelCounts = countMembersByLevel(tree);
  const levelEntries = Object.keys(levelCounts)
    .map(Number)
    .sort((a, b) => a - b)
    .map((level) => ({ level, count: levelCounts[level] }));
  const totalInTree = levelEntries.reduce((sum, row) => sum + row.count, 0);
  const rootName = valueOrDash(tree?.name) !== "-"
    ? valueOrDash(tree?.name)
    : valueOrDash(tree?.lenderCode) || `LR${lenderId}`;
  const rootId = pickNumber(tree?.lenderId) || lenderId;
  const selectedId = pickNumber(selected?.lenderId);

  return (
    <div className="admin-ai-page-shell">
      <div className="admin-ai-dashboard-wrap admin-ai-ftree-page">
        <header className="admin-ai-ftree-page-head">
          <div className="admin-ai-ftree-page-head-main">
            <button type="button" className="admin-ai-referral-back" onClick={goBackToPortfolio}>
              <FaArrowLeft /> Portfolio
            </button>
            <h2>Lent Referral Tree Map</h2>
            <div className="admin-ai-ftree-page-identity">
              <strong className="admin-ai-ftree-page-name">{rootName}</strong>
              <span className="admin-ai-ftree-page-lender-id">
                Lender ID <b>{rootId || "-"}</b>
              </span>
            </div>
          </div>
          <div className="admin-ai-ftree-page-actions">
            <button
              type="button"
              className="admin-ai-search-btn admin-ai-ftree-picture-btn"
              disabled={exportingPicture || loading || !tree}
              onClick={downloadTreePicture}
              title="Download exact on-screen tree chart as PNG picture"
            >
              <FaDownload /> {exportingPicture ? "..." : "Picture"}
            </button>
            <button
              type="button"
              className="admin-ai-search-btn"
              disabled={exporting || loading || !tree}
              onClick={downloadTree}
              title="Download Excel Referees List for this referrer"
            >
              <FaDownload /> {exporting ? "..." : "Excel"}
            </button>
            <button
              type="button"
              className="admin-ai-search-btn"
              disabled={loading || !lenderId}
              onClick={refreshTree}
              title="Refresh lent referral tree"
            >
              <FaSync /> {loading ? "..." : "Refresh"}
            </button>
            <button type="button" className="admin-ai-close-btn" onClick={goBackToPortfolio}>
              <FaTimes /> Close
            </button>
          </div>
        </header>

        <div className="admin-ai-ftree-stats">
          <span className="admin-ai-top-referrer-count-box lent-count">{fmtNum(lentCount)} Lent</span>
          <span className="admin-ai-top-referrer-count-box total-count">{fmtNum(totalInTree || children.length)} in tree</span>
          {levelEntries.map(({ level, count }) => (
            <span
              key={level}
              className={`admin-ai-top-referrer-count-box admin-ai-ftree-level-count ${tierClass(false, level)}`}
              title={`Level ${level} members in this tree`}
            >
              L{level} = {fmtNum(count)}
            </span>
          ))}
        </div>

        <div className="admin-ai-ftree-legend">
          <span className="tier-l0">Main</span>
          <span className="tier-l1">L1</span>
          <span className="tier-l2">L2</span>
          <span className="tier-l3">L3</span>
          <span className="tier-l4">L4+</span>
          <span className="role-has-kids">↓N kids</span>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}
        {loading ? <div className="admin-ai-empty-state">Loading Lent referral tree map...</div> : null}

        {!loading && tree ? (
          <section
            ref={treeStageRef}
            className="admin-ai-ftree-stage admin-ai-ftree-stage--dense"
          >
            <div className="admin-ai-ftree">
              <div className="admin-ai-ftree-root">
                <FtreeCard
                  name={rootName}
                  lenderId={rootId}
                  isRoot
                  depth={0}
                  childCount={children.length}
                  selected={selectedId === rootId}
                  onSelect={loadPersonDetail}
                />
              </div>

              {children.length ? (
                <div className="admin-ai-ftree-branch admin-ai-ftree-branch--root admin-ai-ftree-branch--multi">
                  <div className="admin-ai-ftree-vline" />
                  <div className="admin-ai-ftree-kids admin-ai-ftree-kids--root">
                    {children.map((child) => (
                      <FtreeNode
                        key={`${child.refereeId}-${child.referenceId}`}
                        node={child}
                        depth={1}
                        parentName={rootName}
                        parentId={rootId}
                        selectedId={selectedId}
                        onSelect={loadPersonDetail}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="admin-ai-empty-state">
                  <FaProjectDiagram />
                  <p>No Lent referees under this lender.</p>
                </div>
              )}
            </div>
          </section>
        ) : null}

        {selected ? (
          <div className="admin-ai-ftree-detail-overlay" onClick={closeDetail} role="presentation">
            <aside
              className="admin-ai-ftree-detail-panel"
              aria-live="polite"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="admin-ai-ftree-detail-head">
                <div>
                  <small><FaUser /> Selected person</small>
                  <h3>{valueOrDash(detail?.name || selected.name)}</h3>
                  <p>
                    {valueOrDash(detail?.lenderCode || `LR${selected.lenderId}`)}
                    {selected.isRoot ? " · Main referrer" : ` · Level ${selected.depth}`}
                  </p>
                </div>
                <button type="button" className="admin-ai-close-btn" onClick={closeDetail}>
                  <FaTimes /> Close
                </button>
              </header>

              {detailLoading ? <div className="admin-ai-empty-state">Loading details...</div> : null}
              {detailError ? <div className="alert alert-danger">{detailError}</div> : null}

              {!detailLoading && detail ? (
                <>
                  <div className="admin-ai-ftree-detail-money">
                    <div className="earned">
                      <small>Total earning</small>
                      <strong>{fmtMoney(detail.totalEarned)}</strong>
                    </div>
                    <div className="paid">
                      <small>Paid amount</small>
                      <strong>{fmtMoney(detail.amountPaid)}</strong>
                    </div>
                    <div className="unpaid">
                      <small>Unpaid amount</small>
                      <strong>{fmtMoney(detail.amountNotPaid)}</strong>
                    </div>
                    <div className="investment">
                      <small>Total investment (lent users)</small>
                      <strong>{fmtMoney(detail.totalInvestment)}</strong>
                    </div>
                  </div>

                  <div className="admin-ai-ftree-detail-grid">
                    <div><small>Lender ID</small><strong>{valueOrDash(detail.lenderId)}</strong></div>
                    <div><small>Code</small><strong>{valueOrDash(detail.lenderCode)}</strong></div>
                    <div><small>Mobile</small><strong>{valueOrDash(detail.mobileNumber)}</strong></div>
                    <div><small>Email</small><strong>{valueOrDash(detail.email)}</strong></div>
                    <div><small>City</small><strong>{valueOrDash(detail.city)}</strong></div>
                    <div><small>State</small><strong>{valueOrDash(detail.state)}</strong></div>
                    <div><small>Referred by</small><strong>{valueOrDash(detail.referredByName)}{detail.referredById ? ` · LR${detail.referredById}` : ""}</strong></div>
                    <button
                      type="button"
                      className={`admin-ai-ftree-children-trigger${showChildren ? " is-open" : ""}${selectedChildren.length ? " has-kids" : ""}`}
                      disabled={!selectedChildren.length}
                      onClick={() => setShowChildren((open) => !open)}
                      title={selectedChildren.length ? "Click to view Lent children names & details" : "No Lent children in tree"}
                    >
                      <small>Lent children in tree</small>
                      <strong>
                        {fmtNum(selectedChildren.length || detail.childCount)}
                        {selectedChildren.length ? <FaChevronRight /> : null}
                      </strong>
                    </button>
                    {detail.ownParticipation > 0 ? (
                      <div><small>Own participation</small><strong>{fmtMoney(detail.ownParticipation)}</strong></div>
                    ) : null}
                  </div>

                  {showChildren ? (
                    <div className="admin-ai-ftree-children-panel">
                      <header>
                        <FaUserFriends />
                        <strong>Lent children ({fmtNum(selectedChildren.length)})</strong>
                        <em>Click a row to open that person</em>
                      </header>
                      {selectedChildren.length ? (
                        <ul>
                          {selectedChildren.map((child) => (
                            <li key={child.lenderId || child.lenderCode}>
                              <button
                                type="button"
                                onClick={() =>
                                  loadPersonDetail({
                                    lenderId: child.lenderId,
                                    name: child.name,
                                    depth: child.depth,
                                    parentName: detail.name || selected.name,
                                    parentId: detail.lenderId || selected.lenderId,
                                    childCount: child.childCount,
                                    isRoot: false,
                                  })
                                }
                              >
                                <span className="admin-ai-ftree-children-main">
                                  <b>{child.name}</b>
                                  <em>{child.lenderCode} · Level {child.depth}</em>
                                </span>
                                <span className="admin-ai-ftree-children-meta">
                                  <em>Status: {child.status}</em>
                                  <em>Referred: {child.referredOn}</em>
                                  <em>↓{fmtNum(child.childCount)} kids</em>
                                </span>
                                <FaChevronRight />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="admin-ai-ftree-children-empty">No Lent children under this person.</p>
                      )}
                    </div>
                  ) : null}
                </>
              ) : null}
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AdminAILentReferralTreeMapPage;
