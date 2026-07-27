import React from "react";

const fmtNum = (value) => Number(value || 0).toLocaleString("en-IN");
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);
const pickNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const tierClass = (isRoot, depth) => {
  if (isRoot || depth === 0) return "tier-l0";
  if (depth === 1) return "tier-l1";
  if (depth === 2) return "tier-l2";
  if (depth === 3) return "tier-l3";
  return "tier-l4";
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

const FtreeCard = ({ name, lenderId, isRoot = false, depth = 0, childCount = 0 }) => {
  const isParentReferee = !isRoot && childCount > 0;
  const displayId = lenderId ? `LR${lenderId}` : "-";
  return (
    <div
      className={[
        "admin-ai-ftree-card",
        "admin-ai-ftree-card--compact",
        tierClass(isRoot, depth),
        isParentReferee ? "has-children" : "is-leaf",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="admin-ai-ftree-card-level">{roleLabel(isRoot, depth)}</span>
      <span className="admin-ai-ftree-card-main">
        <strong title={name}>{name}</strong>
        <span className="admin-ai-ftree-id-row">
          <b className="admin-ai-ftree-id">{displayId}</b>
          {isParentReferee ? <em className="admin-ai-ftree-kids-pill">뿯↽{fmtNum(childCount)}</em> : null}
        </span>
      </span>
    </div>
  );
};

const FtreeNode = ({ node, depth = 1, parentId = null }) => {
  const children = Array.isArray(node?.children) ? node.children : [];
  const refereeId = pickNumber(node.refereeId);
  const name = valueOrDash(node.refereeName) || (refereeId ? `User ${refereeId}` : "-");
  const singleChildChain = children.length === 1;

  return (
    <div
      className={`admin-ai-ftree-node ${tierClass(false, depth)}${singleChildChain ? " is-chain" : ""}${
        children.length > 1 ? " is-branch" : ""
      }`}
      data-depth={depth}
      data-parent-id={parentId || ""}
    >
      <div className="admin-ai-ftree-node-stem" aria-hidden="true" />
      <FtreeCard name={name} lenderId={refereeId || null} depth={depth} childCount={children.length} />
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
        <span className="tier-l4">L4+</span>
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
