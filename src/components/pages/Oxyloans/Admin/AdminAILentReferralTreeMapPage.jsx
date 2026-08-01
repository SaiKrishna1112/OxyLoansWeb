import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaArrowLeft,
  FaChevronRight,
  FaDownload,
  FaEnvelope,
  FaProjectDiagram,
  FaSync,
  FaTimes,
  FaUser,
  FaUserFriends,
  FaWhatsapp,
} from "react-icons/fa";
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
import AdminAILenderCampaignModal from "./AdminAILenderCampaignModal";
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

const TREE_MAX_LEVEL = 20;
const TREE_TYPES = [
  { id: "lent", label: "Lent Tree", short: "Lent" },
  { id: "registered", label: "Registered Tree", short: "Registered" },
  { id: "invited", label: "Invited Tree", short: "Invited" },
];
const treeTypeMeta = (treeType) => TREE_TYPES.find((row) => row.id === treeType) || TREE_TYPES[0];
const campaignSegmentForTree = (treeType, lenderId) => {
  if (treeType === "registered") return `activeLenderRegisteredTreeDownline_r${lenderId}`;
  if (treeType === "invited") return `activeLenderInvitedTreeDownline_r${lenderId}`;
  return `activeLenderLentTreeDownline_r${lenderId}`;
};

/** Fixed Main–L4 colors. From L5+, unique non-repeating chain palette (cycles only after many levels). */
const DEEP_LEVEL_PALETTE = [
  { bg: "#ecfeff", border: "#0891b2", text: "#155e75", badge: "#0e7490" }, // L5 cyan
  { bg: "#fff7ed", border: "#ea580c", text: "#9a3412", badge: "#c2410c" }, // L6 vivid orange
  { bg: "#f0fdf4", border: "#16a34a", text: "#14532d", badge: "#15803d" }, // L7 green
  { bg: "#fef2f2", border: "#e11d48", text: "#9f1239", badge: "#be123c" }, // L8 rose
  { bg: "#eef2ff", border: "#4f46e5", text: "#312e81", badge: "#4338ca" }, // L9 indigo
  { bg: "#fdf4ff", border: "#c026d3", text: "#86198f", badge: "#a21caf" }, // L10 fuchsia
  { bg: "#fffbeb", border: "#ca8a04", text: "#854d0e", badge: "#a16207" }, // L11 gold
  { bg: "#f0f9ff", border: "#0284c7", text: "#075985", badge: "#0369a1" }, // L12 sky
  { bg: "#ecfdf5", border: "#0d9488", text: "#115e59", badge: "#0f766e" }, // L13 teal
  { bg: "#faf5ff", border: "#7c3aed", text: "#5b21b6", badge: "#6d28d9" }, // L14 violet
  { bg: "#fff1f2", border: "#f43f5e", text: "#9f1239", badge: "#e11d48" }, // L15 pink-red
  { bg: "#f7fee7", border: "#65a30d", text: "#3f6212", badge: "#4d7c0f" }, // L16 lime
];

const tierClass = (isRoot, depth) => {
  if (isRoot || depth === 0) return "tier-l0";
  if (depth >= 1 && depth <= 4) return `tier-l${depth}`;
  return "tier-l-deep";
};

const tierStyle = (isRoot, depth) => {
  if (isRoot || depth <= 4) return undefined;
  const palette = DEEP_LEVEL_PALETTE[(depth - 5) % DEEP_LEVEL_PALETTE.length];
  return {
    "--ftree-deep-bg": palette.bg,
    "--ftree-deep-border": palette.border,
    "--ftree-deep-text": palette.text,
    "--ftree-deep-badge": palette.badge,
  };
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

const findNodeChildren = (tree, personOrId) => {
  if (!tree) return [];
  const targetKey = typeof personOrId === "object"
    ? nodeSelectKey(personOrId)
    : (pickNumber(personOrId) > 0 ? `u${pickNumber(personOrId)}` : "");
  if (!targetKey) return [];
  const rootKey = nodeSelectKey({ lenderId: tree.lenderId, isRoot: true });
  if (rootKey === targetKey) {
    return Array.isArray(tree.children) ? tree.children : [];
  }
  const walk = (nodes) => {
    for (const node of nodes || []) {
      if (nodeSelectKey(node) === targetKey) {
        return Array.isArray(node.children) ? node.children : [];
      }
      const found = walk(node.children);
      if (found) return found;
    }
    return null;
  };
  return walk(tree.children) || [];
};

const inviteDisplayLabel = (node) => {
  const name = String(node?.refereeName || "").trim();
  const email = String(node?.refereeEmail || "").trim();
  const mobile = String(node?.refereeMobileNumber || "").trim();
  const refereeId = pickNumber(node?.refereeId);
  const referenceId = pickNumber(node?.referenceId);
  const looksLikeInviteId = /^invite\s*#?\s*\d+$/i.test(name) || /^user\s+\d+$/i.test(name);
  if (name && !looksLikeInviteId && name !== "-") return name;
  if (email) return email;
  if (mobile) return mobile;
  if (name) return name;
  if (refereeId > 0) return `User ${refereeId}`;
  if (referenceId > 0) return `Invite #${referenceId}`;
  return "-";
};

const inviteDisplayCode = (node) => {
  const code = String(node?.refereeCode || "").trim();
  if (code && code !== "-") return code;
  const refereeId = pickNumber(node?.refereeId);
  if (refereeId > 0) return `LR${refereeId}`;
  const email = String(node?.refereeEmail || "").trim();
  if (email) return email.includes("@") ? email.split("@")[0] : email;
  const mobile = String(node?.refereeMobileNumber || "").trim();
  if (mobile) return mobile;
  const referenceId = pickNumber(node?.referenceId);
  return referenceId > 0 ? `INV${referenceId}` : "-";
};

const nodeSelectKey = (nodeOrPerson) => {
  if (!nodeOrPerson) return "";
  if (nodeOrPerson.isRoot) {
    const rootId = pickNumber(nodeOrPerson.lenderId || nodeOrPerson.refereeId);
    return rootId > 0 ? `u${rootId}` : "root";
  }
  const refereeId = pickNumber(nodeOrPerson.refereeId ?? nodeOrPerson.lenderId);
  if (refereeId > 0) return `u${refereeId}`;
  const referenceId = pickNumber(nodeOrPerson.referenceId);
  if (referenceId > 0) return `r${referenceId}`;
  const code = String(nodeOrPerson.lenderCode || nodeOrPerson.refereeCode || "").trim();
  return code ? `c${code}` : "";
};

const formatTreeSourceLabel = (source) => {
  const value = String(source || "").trim();
  if (!value) return "-";
  if (/^bulkinvite$/i.test(value)) return "BulkInvite";
  if (/^partner$/i.test(value)) return "Partner";
  if (/^referrallink$/i.test(value)) return "Invite";
  return value;
};

const personFromTreeNode = (node, extras = {}) => {
  const refereeId = pickNumber(node?.refereeId);
  const referenceId = pickNumber(node?.referenceId);
  const name = inviteDisplayLabel(node);
  const lenderCode = inviteDisplayCode(node);
  return {
    lenderId: refereeId || 0,
    referenceId,
    name,
    lenderCode,
    email: String(node?.refereeEmail || "").trim(),
    mobileNumber: String(node?.refereeMobileNumber || "").trim(),
    status: String(node?.status || "").trim(),
    referredOn: String(node?.referredOn || "").trim(),
    source: String(node?.source || "").trim(),
    childCount: Array.isArray(node?.children) ? node.children.length : pickNumber(node?.childCount),
    selectKey: nodeSelectKey({ refereeId, referenceId, lenderCode }),
    ...extras,
  };
};

const mapChildRows = (children, parentDepth = 0) =>
  (children || []).map((node) => {
    const person = personFromTreeNode(node, { depth: parentDepth + 1 });
    return {
      ...person,
      status: valueOrDash(node.status),
      referredOn: valueOrDash(node.referredOn),
    };
  });

const isTreeStatusMatch = (status, treeType) => {
  const value = String(status || "").trim();
  if (treeType === "registered") return /^registered$/i.test(value);
  if (treeType === "invited") return /^invited$/i.test(value);
  return /^lent$/i.test(value) || /^disbursed$/i.test(value);
};

const isLentTreeStatus = (status) => isTreeStatusMatch(status, "lent");

const buildFullTreeUsersCsvBlob = (tree, rootName, rootId, treeType = "lent") => {
  const typeLabel = treeTypeMeta(treeType).short;
  const rootCode = valueOrDash(tree?.lenderCode) || (rootId ? `LR${rootId}` : "-");
  const header = [
    "S.No",
    "Level",
    "Level Label",
    "Tree Path (Main > L1 > L2 > ...)",
    "User Lender ID",
    "User Code",
    "User Name",
    "Mobile",
    "Email",
    `Status (${typeLabel} only)`,
    "Source",
    "Referred On",
    "Parent Lender ID",
    "Parent Code",
    "Parent Name",
    `Direct ${typeLabel} Kids Count`,
    `Has ${typeLabel} Downline`,
  ];
  const rows = [];
  const walk = (nodes, level, parentId, parentName, parentCode, pathNames) => {
    if (level > TREE_MAX_LEVEL) return;
    (nodes || []).forEach((node) => {
      if (!isTreeStatusMatch(node.status, treeType)) return;
      const refereeId = pickNumber(node.refereeId);
      const refereeName = valueOrDash(node.refereeName) || (refereeId ? `User ${refereeId}` : "-");
      const refereeCode = valueOrDash(node.refereeCode) || (refereeId ? `LR${refereeId}` : "-");
      const childCount = Array.isArray(node.children) ? node.children.length : pickNumber(node.childCount);
      const nextPath = [...pathNames, refereeName];
      const source = String(node.source || "").trim();
      const sourceLabel = /^bulkinvite$/i.test(source)
        ? "BulkInvite"
        : /^partner$/i.test(source)
          ? "Partner"
          : /^referrallink$/i.test(source)
            ? "Invite"
            : source;
      rows.push([
        rows.length + 1,
        level,
        `L${level}`,
        nextPath.join(" > "),
        refereeId,
        refereeCode,
        refereeName,
        valueOrDash(node.refereeMobileNumber),
        valueOrDash(node.refereeEmail),
        valueOrDash(node.status),
        sourceLabel,
        valueOrDash(node.referredOn),
        parentId || "",
        parentCode || "",
        parentName || "",
        childCount,
        childCount > 0 ? "Yes" : "No",
      ]);
      walk(node.children, level + 1, refereeId, refereeName, refereeCode, nextPath);
    });
  };

  rows.push([
    1,
    0,
    "Main",
    rootName || rootCode,
    rootId,
    rootCode,
    rootName,
    valueOrDash(tree?.mobileNumber),
    valueOrDash(tree?.email),
    "Main",
    "",
    "",
    "",
    "",
    "",
    Array.isArray(tree?.children) ? tree.children.length : pickNumber(tree?.childCount),
    (Array.isArray(tree?.children) ? tree.children.length : pickNumber(tree?.childCount)) > 0 ? "Yes" : "No",
  ]);
  walk(tree?.children, 1, rootId, rootName, rootCode, [rootName || rootCode]);
  const body = rows.map((cols, index) => {
    const next = [...cols];
    next[0] = index + 1;
    return next.map(csvEscape).join(",");
  });
  return new Blob([`\uFEFF${header.join(",")}\n${body.join("\n")}`], {
    type: "text/csv;charset=utf-8;",
  });
};

const FtreeCard = ({
  name,
  lenderId,
  displayCode = "",
  selectPayload = null,
  isRoot = false,
  depth = 0,
  parentName = "",
  parentId = null,
  childCount = 0,
  selected = false,
  onSelect,
}) => {
  const isParentReferee = !isRoot && childCount > 0;
  const displayId = displayCode || (lenderId ? `LR${lenderId}` : "-");
  const levelText = roleLabel(isRoot, depth);
  const emitSelect = () => {
    if (typeof onSelect !== "function") return;
    if (selectPayload) {
      onSelect(selectPayload);
      return;
    }
    const id = pickNumber(lenderId);
    if (id > 0) {
      onSelect({
        lenderId: id,
        name,
        depth,
        parentName,
        parentId,
        childCount,
        isRoot,
        selectKey: nodeSelectKey({ lenderId: id, isRoot }),
      });
    }
  };
  return (
    <button
      type="button"
      className={[
        "admin-ai-ftree-card",
        "admin-ai-ftree-card--compact",
        "admin-ai-ftree-card--clear",
        "is-clickable",
        tierClass(isRoot, depth),
        isParentReferee ? "has-children" : "is-leaf",
        selected ? "is-selected" : "",
        depth >= 5 ? "is-deep-chain" : "",
      ].filter(Boolean).join(" ")}
      style={tierStyle(isRoot, depth)}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        emitSelect();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          event.stopPropagation();
          emitSelect();
        }
      }}
      title={[
        `${levelText}: ${name}`,
        displayId,
        "Click for invite / person details",
        parentName ? `Referred by: ${parentName}${parentId ? ` (LR${parentId})` : ""}` : "",
        isParentReferee ? `Also referring ${childCount} user(s) below` : "No children in this tree",
      ].filter(Boolean).join(" · ")}
    >
      <span className="admin-ai-ftree-card-level" aria-label={`Level ${levelText}`}>
        {levelText}
      </span>
      <span className="admin-ai-ftree-card-main">
        <strong title={name}>{name}</strong>
        <span className="admin-ai-ftree-id-row">
          <b className="admin-ai-ftree-id" title={displayId}>{displayId}</b>
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
  selectedKey = null,
  onSelect,
}) => {
  const children = Array.isArray(node?.children) ? node.children : [];
  const refereeId = pickNumber(node.refereeId);
  const person = personFromTreeNode(node, {
    depth,
    parentName,
    parentId,
    isRoot: false,
  });
  const singleChildChain = children.length === 1;

  return (
    <div
      className={`admin-ai-ftree-node ${tierClass(false, depth)}${singleChildChain ? " is-chain" : ""}${children.length > 1 ? " is-branch" : ""}${depth >= 5 ? " is-deep-chain" : ""}`}
      data-depth={depth}
      data-level={roleLabel(false, depth)}
      data-parent-id={parentId || ""}
      style={tierStyle(false, depth)}
    >
      <div className="admin-ai-ftree-node-stem" aria-hidden="true" />
      <FtreeCard
        name={person.name}
        lenderId={refereeId || null}
        displayCode={person.lenderCode}
        selectPayload={person}
        depth={depth}
        parentName={parentName}
        parentId={parentId}
        childCount={children.length}
        selected={selectedKey === person.selectKey}
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
                parentName={person.name}
                parentId={refereeId || parentId}
                selectedKey={selectedKey}
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
  const [campaignState, setCampaignState] = useState(null);
  const [treeType, setTreeType] = useState("lent");
  const activeTreeMeta = treeTypeMeta(treeType);

  const selectedChildren = useMemo(() => {
    if (!selected || !tree) return [];
    const kids = findNodeChildren(tree, selected);
    return mapChildRows(kids, pickNumber(selected.depth));
  }, [selected, tree]);

  const loadTree = useCallback(async (id, type = "lent") => {
    if (!id) {
      setTree(null);
      setError("lenderId is required.");
      return;
    }
    setLoading(true);
    setError("");
    setSelected(null);
    setDetail(null);
    setShowChildren(false);
    try {
      const data = responseData(await getAdminAIActiveLenderReferralTree(id, type));
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
    loadTree(lenderId, treeType);
  }, [lenderId, treeType, loadTree]);

  const loadPersonDetail = useCallback(async (person) => {
    if (!person) return;
    const id = pickNumber(person?.lenderId);
    const selectKey = person.selectKey || nodeSelectKey(person);
    setSelected({ ...person, selectKey });
    setShowChildren(false);
    setDetailError("");

    // Invited (and some registered) nodes may have no user account yet — show tree-row details.
    if (!id) {
      setDetailLoading(false);
      setDetail({
        lenderId: 0,
        referenceId: pickNumber(person.referenceId),
        name: valueOrDash(person.name),
        lenderCode: valueOrDash(person.lenderCode),
        email: valueOrDash(person.email),
        mobileNumber: valueOrDash(person.mobileNumber),
        city: "-",
        state: "-",
        status: valueOrDash(person.status),
        referredOn: valueOrDash(person.referredOn),
        source: formatTreeSourceLabel(person.source),
        depth: person.depth,
        isRoot: !!person.isRoot,
        parentName: valueOrDash(person.parentName),
        parentId: person.parentId,
        childCount: pickNumber(person.childCount),
        totalEarned: 0,
        amountPaid: 0,
        amountNotPaid: 0,
        totalInvestment: 0,
        ownParticipation: 0,
        referredByName: valueOrDash(person.parentName),
        referredById: pickNumber(person.parentId),
        inviteOnly: true,
        selectKey,
      });
      return;
    }

    setDetailLoading(true);
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
        referenceId: pickNumber(person.referenceId),
        name: valueOrDash(profile.name || profile.fullName || person.name),
        lenderCode: valueOrDash(profile.userCode || profile.lenderCode || person.lenderCode || `LR${id}`),
        email: valueOrDash(profile.email || person.email),
        mobileNumber: valueOrDash(profile.mobileNumber || person.mobileNumber),
        city: valueOrDash(profile.city),
        state: valueOrDash(profile.state),
        status: valueOrDash(person.status),
        referredOn: valueOrDash(person.referredOn),
        source: formatTreeSourceLabel(person.source),
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
        inviteOnly: false,
        selectKey,
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
    const blob = buildFullTreeUsersCsvBlob(tree, rootNameLocal, rootIdLocal || lenderId, treeType);
    saveAs(blob, `${code}-${treeType}-tree-chain-${new Date().toISOString().slice(0, 10)}.csv`);
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
      saveAs(blob, `${code}-${treeType}-referral-tree-map-${new Date().toISOString().slice(0, 10)}.png`);
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
      const response = await downloadAdminAIActiveLenderReferralTreeExcel(lenderId, treeType);
      const blob = response?.data;
      if (!blob) throw new Error("Empty Excel response.");
      const contentType = String(blob.type || "");
      if (contentType.includes("json") || contentType.includes("text/plain") || blob.size < 64) {
        throw new Error("Server Excel unavailable.");
      }
      saveAs(blob, `${code}-${treeType}-tree-chain-${new Date().toISOString().slice(0, 10)}.xlsx`);
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
    loadTree(lenderId, treeType);
  };

  const switchTreeType = (nextType) => {
    if (!nextType || nextType === treeType || loading) return;
    setTreeType(nextType);
  };

  const children = Array.isArray(tree?.children) ? tree.children : [];
  const statusCount = treeType === "registered"
    ? pickNumber(tree?.referralSummary?.registered)
    : treeType === "invited"
      ? pickNumber(tree?.referralSummary?.invited)
      : pickNumber(tree?.referralSummary?.lent) + pickNumber(tree?.referralSummary?.disbursed);
  const levelCounts = countMembersByLevel(tree);
  const levelEntries = Object.keys(levelCounts)
    .map(Number)
    .sort((a, b) => a - b)
    .map((level) => ({ level, count: levelCounts[level] }));
  const totalInTree = levelEntries.reduce((sum, row) => sum + row.count, 0);
  const openTreeDownlineCampaign = (channel) => {
    if (!lenderId || !tree) return;
    const rootCode = tree?.lenderCode || `LR${lenderId}`;
    setCampaignState({
      channel,
      segment: campaignSegmentForTree(treeType, lenderId),
      segmentLabel: `${activeTreeMeta.short} tree downline of ${rootCode} (excl. parent)`,
      recipientCount: totalInTree || children.length,
    });
  };
  const rootName = valueOrDash(tree?.name) !== "-"
    ? valueOrDash(tree?.name)
    : valueOrDash(tree?.lenderCode) || `LR${lenderId}`;
  const rootId = pickNumber(tree?.lenderId) || lenderId;
  const selectedKey = selected?.selectKey || nodeSelectKey(selected);
  const rootSelectPayload = {
    lenderId: rootId,
    name: rootName,
    lenderCode: valueOrDash(tree?.lenderCode) || (rootId ? `LR${rootId}` : "-"),
    email: valueOrDash(tree?.email),
    mobileNumber: valueOrDash(tree?.mobileNumber),
    depth: 0,
    isRoot: true,
    childCount: children.length,
    selectKey: nodeSelectKey({ lenderId: rootId, isRoot: true }),
  };

  return (
    <div className="admin-ai-page-shell">
      <div className="admin-ai-dashboard-wrap admin-ai-ftree-page">
        <header className="admin-ai-ftree-page-head">
          <div className="admin-ai-ftree-page-head-main">
            <button type="button" className="admin-ai-referral-back" onClick={goBackToPortfolio}>
              <FaArrowLeft /> Portfolio
            </button>
            <h2>{activeTreeMeta.label} Map</h2>
            <div className="admin-ai-ftree-page-identity">
              <strong className="admin-ai-ftree-page-name">{rootName}</strong>
              <span className="admin-ai-ftree-page-lender-id">
                Lender ID <b>{rootId || "-"}</b>
              </span>
            </div>
            <div className="admin-ai-ftree-type-toggle" role="tablist" aria-label="Referral tree type">
              {TREE_TYPES.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  role="tab"
                  aria-selected={treeType === row.id}
                  className={`admin-ai-ftree-type-btn is-${row.id}${treeType === row.id ? " is-active" : ""}`}
                  disabled={loading || !lenderId}
                  onClick={() => switchTreeType(row.id)}
                  title={`Show ${row.label} for this lender`}
                >
                  {row.short}
                </button>
              ))}
            </div>
          </div>
          <div className="admin-ai-ftree-page-actions">
            <button
              type="button"
              className="admin-ai-search-btn admin-ai-ftree-campaign-email"
              disabled={loading || !tree || !totalInTree}
              onClick={() => openTreeDownlineCampaign("email")}
              title={`Email campaign for all ${activeTreeMeta.short} tree users except the parent referrer`}
            >
              <FaEnvelope /> Email
            </button>
            <button
              type="button"
              className="admin-ai-search-btn admin-ai-ftree-campaign-whatsapp"
              disabled={loading || !tree || !totalInTree}
              onClick={() => openTreeDownlineCampaign("whatsapp")}
              title={`WhatsApp campaign for all ${activeTreeMeta.short} tree users except the parent referrer`}
            >
              <FaWhatsapp /> WhatsApp
            </button>
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
              title={`Download ${activeTreeMeta.short} referral chain Excel (L1–L20)`}
            >
              <FaDownload /> {exporting ? "..." : "Excel"}
            </button>
            <button
              type="button"
              className="admin-ai-search-btn"
              disabled={loading || !lenderId}
              onClick={refreshTree}
              title={`Refresh ${activeTreeMeta.short} referral tree`}
            >
              <FaSync /> {loading ? "..." : "Refresh"}
            </button>
            <button type="button" className="admin-ai-close-btn" onClick={goBackToPortfolio}>
              <FaTimes /> Close
            </button>
          </div>
        </header>

        <div className="admin-ai-ftree-stats">
          <span className={`admin-ai-top-referrer-count-box ${treeType}-count`}>
            {fmtNum(statusCount)} {activeTreeMeta.short}
          </span>
          <span className="admin-ai-top-referrer-count-box total-count">{fmtNum(totalInTree || children.length)} in tree</span>
          {levelEntries.map(({ level, count }) => (
            <span
              key={level}
              className={`admin-ai-top-referrer-count-box admin-ai-ftree-level-count ${tierClass(false, level)}`}
              style={tierStyle(false, level)}
              title={`Level ${level} members in this ${activeTreeMeta.short} chain`}
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
          <span className="tier-l4">L4</span>
          {levelEntries
            .filter(({ level }) => level >= 5)
            .map(({ level }) => {
              const style = tierStyle(false, level);
              return (
                <span
                  key={`legend-l${level}`}
                  className="tier-l-deep"
                  style={style}
                  title={`Level ${level} chain color`}
                >
                  L{level}
                </span>
              );
            })}
          <span className="role-has-kids">↓N kids</span>
        </div>

        {error ? <div className="alert alert-danger">{error}</div> : null}
        {loading ? <div className="admin-ai-empty-state">Loading {activeTreeMeta.short} referral tree map...</div> : null}

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
                  displayCode={rootSelectPayload.lenderCode}
                  selectPayload={rootSelectPayload}
                  isRoot
                  depth={0}
                  childCount={children.length}
                  selected={selectedKey === rootSelectPayload.selectKey}
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
                        selectedKey={selectedKey}
                        onSelect={loadPersonDetail}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="admin-ai-empty-state">
                  <FaProjectDiagram />
                  <p>No {activeTreeMeta.short} referees under this lender.</p>
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
                  <small><FaUser /> {detail?.inviteOnly || treeType === "invited" ? "Selected invite" : "Selected person"}</small>
                  <h3>{valueOrDash(detail?.name || selected.name)}</h3>
                  <p>
                    {valueOrDash(detail?.lenderCode || selected.lenderCode || (selected.lenderId ? `LR${selected.lenderId}` : "-"))}
                    {selected.isRoot ? " · Main referrer" : ` · Level ${selected.depth}`}
                    {detail?.status ? ` · ${detail.status}` : ""}
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
                  {!detail.inviteOnly ? (
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
                  ) : (
                    <div className="admin-ai-ftree-detail-money">
                      <div className="earned">
                        <small>Invite status</small>
                        <strong>{valueOrDash(detail.status || "Invited")}</strong>
                      </div>
                      <div className="paid">
                        <small>Invite ID</small>
                        <strong>{detail.referenceId ? `INV${detail.referenceId}` : valueOrDash(detail.lenderCode)}</strong>
                      </div>
                      <div className="unpaid">
                        <small>Source</small>
                        <strong>{valueOrDash(detail.source)}</strong>
                      </div>
                      <div className="investment">
                        <small>Referred on</small>
                        <strong>{valueOrDash(detail.referredOn)}</strong>
                      </div>
                    </div>
                  )}

                  <div className="admin-ai-ftree-detail-grid">
                    <div><small>Name</small><strong>{valueOrDash(detail.name)}</strong></div>
                    <div><small>Code</small><strong>{valueOrDash(detail.lenderCode)}</strong></div>
                    <div><small>Email</small><strong>{valueOrDash(detail.email)}</strong></div>
                    <div><small>Mobile</small><strong>{valueOrDash(detail.mobileNumber)}</strong></div>
                    {detail.lenderId ? (
                      <div><small>Lender ID</small><strong>{valueOrDash(detail.lenderId)}</strong></div>
                    ) : (
                      <div><small>Invite record ID</small><strong>{detail.referenceId || "-"}</strong></div>
                    )}
                    <div><small>Status</small><strong>{valueOrDash(detail.status || (detail.isRoot ? "Main" : activeTreeMeta.short))}</strong></div>
                    <div><small>Source</small><strong>{valueOrDash(detail.source)}</strong></div>
                    <div><small>Referred on</small><strong>{valueOrDash(detail.referredOn)}</strong></div>
                    <div><small>City</small><strong>{valueOrDash(detail.city)}</strong></div>
                    <div><small>State</small><strong>{valueOrDash(detail.state)}</strong></div>
                    <div><small>Referred by</small><strong>{valueOrDash(detail.referredByName)}{detail.referredById ? ` · LR${detail.referredById}` : ""}</strong></div>
                    <div><small>Tree level</small><strong>{detail.isRoot ? "Main" : `L${detail.depth}`}</strong></div>
                    <button
                      type="button"
                      className={`admin-ai-ftree-children-trigger${showChildren ? " is-open" : ""}${selectedChildren.length ? " has-kids" : ""}`}
                      disabled={!selectedChildren.length}
                      onClick={() => setShowChildren((open) => !open)}
                      title={selectedChildren.length ? `Click to view ${activeTreeMeta.short} children names & details` : `No ${activeTreeMeta.short} children in tree`}
                    >
                      <small>{activeTreeMeta.short} children in tree</small>
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
                        <strong>{activeTreeMeta.short} children ({fmtNum(selectedChildren.length)})</strong>
                        <em>Click a row to open that person</em>
                      </header>
                      {selectedChildren.length ? (
                        <ul>
                          {selectedChildren.map((child) => (
                            <li key={child.selectKey || child.lenderCode || child.referenceId}>
                              <button
                                type="button"
                                onClick={() =>
                                  loadPersonDetail({
                                    ...child,
                                    parentName: detail.name || selected.name,
                                    parentId: detail.lenderId || selected.lenderId,
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
                                  <em>Email: {child.email || "-"}</em>
                                  <em>Mobile: {child.mobileNumber || "-"}</em>
                                  <em>Referred: {child.referredOn}</em>
                                  <em>↓{fmtNum(child.childCount)} kids</em>
                                </span>
                                <FaChevronRight />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="admin-ai-ftree-children-empty">No {activeTreeMeta.short} children under this person.</p>
                      )}
                    </div>
                  ) : null}
                </>
              ) : null}
            </aside>
          </div>
        ) : null}
      </div>

      <AdminAILenderCampaignModal
        open={Boolean(campaignState)}
        onClose={() => setCampaignState(null)}
        segment={campaignState?.segment}
        segmentLabel={campaignState?.segmentLabel}
        recipientCount={campaignState?.recipientCount}
        initialChannel={campaignState?.channel}
        onSent={(result, meta) => {
          if (meta?.dryRun) return;
          setCampaignState(null);
        }}
      />
    </div>
  );
};

export default AdminAILentReferralTreeMapPage;
