import React from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { getAdminAIActiveLenderReferralTree } from "../../../HttpRequest/admin";
import AdminAIReferralTreeVisual, { levelCountEntries } from "./AdminAIReferralTreeVisual";

const responseData = (payload) => payload?.data || payload || {};
const pickNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};
const valueOrDash = (value) => (value == null || value === "" ? "-" : value);

const waitFrames = (count = 2) =>
  new Promise((resolve) => {
    const step = (left) => {
      if (left <= 0) {
        resolve();
        return;
      }
      requestAnimationFrame(() => step(left - 1));
    };
    step(count);
  });

const createCaptureHost = () => {
  const host = document.createElement("div");
  host.className = "admin-ai-ftree-pdf-capture-host";
  host.setAttribute("aria-hidden", "true");
  document.body.appendChild(host);
  return host;
};

const mountTreePage = async (host, { tree, rank, title }) => {
  const root = createRoot(host);
  await new Promise((resolve) => {
    root.render(
      React.createElement(AdminAIReferralTreeVisual, {
        tree,
        rank,
        title,
        className: "is-capture is-landscape",
      })
    );
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
  await waitFrames(2);
  await new Promise((resolve) => setTimeout(resolve, 180));

  const pageEl = host.querySelector(".admin-ai-ftree-pdf-page");
  if (pageEl) {
    // Expand host to full horizontal tree width (no wrap).
    const wide = Math.max(pageEl.scrollWidth, pageEl.offsetWidth, 2200);
    host.style.width = wide + "px";
    pageEl.style.width = wide + "px";
  }
  await waitFrames(2);

  return {
    pageEl,
    unmount: () => {
      try {
        root.unmount();
      } catch (e) {
        /* ignore */
      }
      host.innerHTML = "";
      host.style.width = "";
    },
  };
};

const captureElementPng = async (element) => {
  if (!element) {
    throw new Error("Tree page element missing.");
  }
  const captureWidth = Math.max(element.scrollWidth, element.clientWidth, 2200);
  const captureHeight = Math.max(element.scrollHeight, element.clientHeight, 700);
  const canvas = await html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: Math.min(1.35, window.devicePixelRatio || 1.2),
    useCORS: true,
    logging: false,
    allowTaint: true,
    scrollX: 0,
    scrollY: 0,
    width: captureWidth,
    height: captureHeight,
    windowWidth: captureWidth,
    windowHeight: captureHeight,
  });
  const dataUrl = canvas.toDataURL("image/jpeg", 0.88);
  if (!dataUrl || dataUrl.length < 100) {
    throw new Error("Failed to capture tree image.");
  }
  return {
    dataUrl,
    width: canvas.width,
    height: canvas.height,
  };
};

/** Always add as a landscape page, image fitted like a wide screenshot. */
const addLandscapeImagePage = (pdf, image, pageIndex) => {
  const margin = 10;
  // Prefer image aspect; force landscape page (width >= height).
  const imgRatio = image.width / Math.max(image.height, 1);
  let pageW;
  let pageH;
  if (imgRatio >= 1) {
    // Already landscape/wide image.
    pageW = 1190; // ~A3 landscape width in pt
    pageH = Math.max(pageW / imgRatio, 520);
    if (pageH > 842) {
      pageH = 842;
      pageW = pageH * imgRatio;
    }
  } else {
    // Tall capture: still use landscape page and fit image inside.
    pageW = 1190;
    pageH = 842;
  }

  if (pageIndex === 0) {
    pdf.setPage(1);
    // Recreate first page size by deleting default and adding sized page is awkward;
    // instead set size via internal API after construction.
  }

  if (pageIndex > 0) {
    pdf.addPage([pageW, pageH], "landscape");
  } else {
    // Resize the initial page to landscape custom size.
    pdf.internal.pageSize.setWidth(pageW);
    pdf.internal.pageSize.setHeight(pageH);
  }

  const maxW = pageW - margin * 2;
  const maxH = pageH - margin * 2;
  const ratio = Math.min(maxW / image.width, maxH / image.height);
  const drawW = image.width * ratio;
  const drawH = image.height * ratio;
  const x = (pageW - drawW) / 2;
  const y = (pageH - drawH) / 2;
  pdf.addImage(image.dataUrl, "JPEG", x, y, drawW, drawH, undefined, "FAST");
};

export const exportTopReferrersLentTreePdf = async (referrers, options = {}) => {
  const limit = Math.max(1, Math.min(pickNumber(options.limit) || 10, 50));
  const onProgress = typeof options.onProgress === "function" ? options.onProgress : () => {};
  const rows = (Array.isArray(referrers) ? referrers : []).slice(0, limit);
  if (!rows.length) {
    throw new Error("No top referrers available to export.");
  }

  const host = createCaptureHost();
  // Start landscape; each page size is adjusted to the wide tree image.
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: [1190, 842],
    compress: true,
  });

  try {
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const lenderId = pickNumber(row.referrerId || row.lenderId);
      const rank = pickNumber(row.rank) || index + 1;
      const name = valueOrDash(row.name);
      const code = valueOrDash(row.referrerCode) || (lenderId ? "LR" + lenderId : "-");

      onProgress({
        phase: "fetch",
        current: index + 1,
        total: rows.length,
        rank,
        name,
        code,
        message: "Loading tree #" + rank + " " + code + "...",
      });

      if (!lenderId) {
        throw new Error("Missing lender id for rank #" + rank + ".");
      }

      const treePayload = responseData(await getAdminAIActiveLenderReferralTree(lenderId));
      if (treePayload.status && treePayload.status !== "SUCCESS") {
        throw new Error(treePayload.message || ("Failed to load tree for " + code + "."));
      }

      const levels = levelCountEntries(treePayload);
      onProgress({
        phase: "capture",
        current: index + 1,
        total: rows.length,
        rank,
        name,
        code,
        levels,
        message: "Rendering landscape tree #" + rank + " " + code + "...",
      });

      const mounted = await mountTreePage(host, {
        tree: treePayload,
        rank,
        title: "Top " + limit + " Referrers - Lent Referral Tree Map",
      });

      try {
        const image = await captureElementPng(mounted.pageEl);
        addLandscapeImagePage(pdf, image, index);
      } finally {
        mounted.unmount();
      }
    }

    onProgress({
      phase: "save",
      current: rows.length,
      total: rows.length,
      message: "Saving landscape PDF...",
    });

    const stamp = new Date().toISOString().slice(0, 10);
    const fileName = "top-" + limit + "-referrers-lent-tree-maps-landscape-" + stamp + ".pdf";
    pdf.save(fileName);
    return { fileName, pageCount: rows.length };
  } finally {
    try {
      host.remove();
    } catch (e) {
      /* ignore */
    }
  }
};

export default exportTopReferrersLentTreePdf;