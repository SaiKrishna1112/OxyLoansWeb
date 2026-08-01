import React from "react";

const fmtNum = (value) => Number(value || 0).toLocaleString("en-IN");
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);
const pickNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const DEEP_LEVEL_PALETTE = [
  { bg: "#ecfeff", border: "#0891b2", text: "#155e75", badge: "#0e7490" },
  { bg: "#fff7ed", border: "#ea580c", text: "#9a3412", badge: "#c2410c" },
  { bg: "#f0fdf4", border: "#16a34a", text: "#14532d", badge: "#15803d" },
  { bg: "#fef2f2", border: "#e11d48", text: "#9f1239", badge: "#be123c" },
  { bg: "#eef2ff", border: "#4f46e5", text: "#312e81", badge: "#4338ca" },
  { bg: "#fdf4ff", border: "#c026d3", text: "#86198f", badge: "#a21caf" },
  { bg: "#fffbeb", border: "#ca8a04", text: "#854d0e", badge: "#a16207" },
  { bg: "#f0f9ff", border: "#0284c7", text: "#075985", badge: "#0369a1" },
  { bg: "#ecfdf5", border: "#0d9488", text: "#115e59", badge: "#0f766e" },
  { bg: "#faf5ff", border: "#7c3aed", text: "#5b21b6", badge: "#6d28d9" },
  { bg: "#fff1f2", border: "#f43f5e", text: "#9f1239", badge: "#e11d48" },
  { bg: "#f7fee7", border: "#65a30d", text: "#3f6212", badge: "#4d7c0f" },
];

export const tierClass = (isRoot, depth) => {
  if (isRoot || depth === 0) return "tier-l0";
  if (depth >= 1 && depth <= 4) return `tier-l${depth}`;
  return "tier-l-deep";
};

export const tierStyle = (isRoot, depth) => {
  if (isRoot || depth <= 4) return undefined;
  const palette = DEEP_LEVEL_PALETTE[(depth - 5) % DEEP_LEVEL_PALETTE.length];
  return {
    "--ftree-deep-bg": palette.bg,
    "--ftree-deep-border": palette.border,
    "--ftree-deep-text": palette.text,
    "--ftree-deep-badge": palette.badge,
  };
};

export const roleLabel = (isRoot, depth) => {
  if (isRoot || depth === 0) return "MAIN";
  return `L${depth}`;
};

/** Count members at each depth (L1 = direct, …). Root excluded. */
export const countMembersByLevel = (tree) => {
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

export const levelCountEntries = (tree) => {
  const counts = countMembersByLevel(tree);
  return Object.keys(counts)
    .map(Number)
    .sort((a, b) => a - b)
    .map((level) => ({ level, count: counts[level] }));
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

const FtreeCard = ({ name, lenderId, displayCode = "", isRoot = false, depth = 0, childCount = 0 }) => {
  const isParentReferee = !isRoot && childCount > 0;
  const displayId = displayCode || (lenderId ? `LR${lenderId}` : "-");
  return (
    <div
      className={[
        "admin-ai-ftree-card",
        "admin-ai-ftree-card--compact",
        "admin-ai-ftree-card--clear",
        tierClass(isRoot, depth),
        isParentReferee ? "has-children" : "is-leaf",
        depth >= 5 ? "is-deep-chain" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={tierStyle(isRoot, depth)}
    >
      <span className="admin-ai-ftree-card-level">{roleLabel(isRoot, depth)}</span>
      <span className="admin-ai-ftree-card-main">
        <strong title={name}>{name}</strong>
        <span className="admin-ai-ftree-id-row">
          <b className="admin-ai-ftree-id" title={displayId}>{displayId}</b>
          {isParentReferee ? <em className="admin-ai-ftree-kids-pill">↓{fmtNum(childCount)}</em> : null}
        </span>
      </span>
    </div>
  );
};

const FtreeNode = ({ node, depth = 1, parentId = null }) => {
  const children = Array.isArray(node?.children) ? node.children : [];
  const refereeId = pickNumber(node.refereeId);
  const name = inviteDisplayLabel(node);
  const displayCode = inviteDisplayCode(node);
  const singleChildChain = children.length === 1;

  return (
    <div
      className={[
        "admin-ai-ftree-node",
        tierClass(false, depth),
        singleChildChain ? "is-chain" : "",
        children.length > 1 ? "is-branch" : "",
        depth >= 5 ? "is-deep-chain" : "",
      ].filter(Boolean).join(" ")}
      data-depth={depth}
      data-level={roleLabel(false, depth)}
      data-parent-id={parentId || ""}
      style={tierStyle(false, depth)}
    >
      <div className="admin-ai-ftree-node-stem" aria-hidden="true" />
      <FtreeCard
        name={name}
        lenderId={refereeId || null}
        displayCode={displayCode}
        depth={depth}
        childCount={children.length}
      />
      {children.length ? (
        <div
          className={`admin-ai-ftree-branch ${
            singleChildChain ? "admin-ai-ftree-branch--chain" : "admin-ai-ftree-branch--multi"
          }`}
        >
          <div className="admin-ai-ftree-vline" />
          <div
            className={`admin-ai-ftree-kids ${
              singleChildChain ? "admin-ai-ftree-kids--chain" : "admin-ai-ftree-kids--siblings"
            }`}
          >
            {children.map((child) => (
              <FtreeNode
                key={`${node.refereeId}-${child.refereeId}-${child.referenceId || child.refereeId}`}
                node={child}
                depth={depth + 1}
                parentId={refereeId}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

/**
 * Static Lent referral tree stage for on-screen display and PDF capture.
 */
const AdminAIReferralTreeVisual = ({
  tree,
  rank = null,
  title = "Lent Referral Tree Map",
  className = "",
}) => {
  if (!tree) return null;
  const children = Array.isArray(tree.children) ? tree.children : [];
  const rootId = pickNumber(tree.lenderId);
  const rootName =
    valueOrDash(tree.name) !== "-"
      ? valueOrDash(tree.name)
      : valueOrDash(tree.lenderCode) || (rootId ? `LR${rootId}` : "-");
  const rootCode = valueOrDash(tree.lenderCode) || (rootId ? `LR${rootId}` : "-");
  const levels = levelCountEntries(tree);
  const totalInTree = levels.reduce((sum, row) => sum + row.count, 0);
  const lentCount =
    pickNumber(tree?.referralSummary?.lent) + pickNumber(tree?.referralSummary?.disbursed);

  return (
    <div className={`admin-ai-ftree-pdf-page ${className}`.trim()}>
      <div className="admin-ai-ftree-pdf-head">
        <div>
          {rank != null ? <span className="admin-ai-ftree-pdf-rank">#{rank}</span> : null}
          <h3>{title}</h3>
          <p>
            <strong>{rootName}</strong> 뿯½ {rootCode}
            {rootId ? ` 뿯½ ID ${rootId}` : ""}
          </p>
        </div>
        <div className="admin-ai-ftree-pdf-stats">
          <span className="admin-ai-top-referrer-count-box lent-count">{fmtNum(lentCount)} Lent</span>
          <span className="admin-ai-top-referrer-count-box total-count">{fmtNum(totalInTree)} in tree</span>
          {levels.map(({ level, count }) => (
            <span
              key={level}
              className={`admin-ai-top-referrer-count-box admin-ai-ftree-level-count ${tierClass(false, level)}`}
              style={tierStyle(false, level)}
            >
              L{level} = {fmtNum(count)}
            </span>
          ))}
        </div>
      </div>

      <div className="admin-ai-ftree-legend">
        <span className="tier-l0">Main</span>
        <span className="tier-l1">L1</span>
        <span className="tier-l2">L2</span>
        <span className="tier-l3">L3</span>
        <span className="tier-l4">L4</span>
        {levels
          .filter(({ level }) => level >= 5)
          .map(({ level }) => (
            <span key={`legend-l${level}`} className="tier-l-deep" style={tierStyle(false, level)}>
              L{level}
            </span>
          ))}
      </div>

      <section className="admin-ai-ftree-stage admin-ai-ftree-stage--dense admin-ai-ftree-stage--pdf">
        <div className="admin-ai-ftree">
          <div className="admin-ai-ftree-node tier-l0 is-root">
            <FtreeCard name={rootName} lenderId={rootId || null} isRoot depth={0} childCount={children.length} />
            {children.length ? (
              <div className="admin-ai-ftree-branch admin-ai-ftree-branch--multi">
                <div className="admin-ai-ftree-vline" />
                <div className="admin-ai-ftree-kids admin-ai-ftree-kids--siblings">
                  {children.map((child) => (
                    <FtreeNode
                      key={`root-${child.refereeId}-${child.referenceId || child.refereeId}`}
                      node={child}
                      depth={1}
                      parentId={rootId}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <p className="admin-ai-ftree-pdf-empty">No Lent referees under this lender.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminAIReferralTreeVisual;
