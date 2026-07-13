import axios from "axios";
import { OFFER_ADMIN_API_URL } from "../../config";
import { OFFER_SEGMENTS } from "../pages/Oxyloans/Admin/OfferManagement/utils/offerConstants";

const getToken = () =>
  sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken");

const requireAuth = () => {
  const token = getToken();
  if (!token) {
    const err = new Error("Not logged in. Please log in as admin.");
    err.code = "NO_TOKEN";
    throw err;
  }
  return {
    "Content-Type": "application/json",
    accessToken: token,
  };
};

const unwrap = (response) => {
  const body = response.data;
  if (body && typeof body.success === "boolean") {
    if (!body.success) {
      throw new Error(body.message || "Request failed");
    }
    return body.data;
  }
  return body;
};

const request = async (method, path, { params, data } = {}) => {
  try {
    const response = await axios({
      method,
      url: `${OFFER_ADMIN_API_URL}${path}`,
      headers: requireAuth(),
      params,
      data,
      timeout: 120000,
    });
    return response;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errorMessage ||
      error.message ||
      "An unexpected error occurred";
    throw new Error(message);
  }
};

const offerAdminApi = {
  /** Dashboard: counts only (fast). Pass includeLenders=true for Eligible Lenders page. */
  getSegmentSummary: async (includeLenders = false) =>
    unwrap(await request("GET", "/segments/summary", { params: { includeLenders } })),

  getOfferCounts: async () => {
    // Prefer dedicated counts APIs; fall back to listing by status (works on older deploys)
    const tryPaths = ["/offer-counts", "/offers/counts"];
    for (const path of tryPaths) {
      try {
        const data = unwrap(await request("GET", path));
        if (data && typeof data === "object") {
          return {
            pending: Number(data.pending) || 0,
            approved: Number(data.approved) || 0,
            rejected: Number(data.rejected) || 0,
            total: Number(data.total) || 0,
          };
        }
      } catch {
        /* try next / fallback */
      }
    }

    let pending = 0;
    let approved = 0;
    let rejected = 0;
    await Promise.all(
      OFFER_SEGMENTS.map(async (s) => {
        const [gen, app, rej] = await Promise.all([
          offerAdminApi.getOffersBySegment(s.value, "GENERATED", 500).catch(() => []),
          offerAdminApi.getOffersBySegment(s.value, "APPROVED", 500).catch(() => []),
          offerAdminApi.getOffersBySegment(s.value, "REJECTED", 500).catch(() => []),
        ]);
        pending += (gen || []).length;
        approved += (app || []).length;
        rejected += (rej || []).length;
      })
    );
    return { pending, approved, rejected, total: pending + approved + rejected };
  },

  generateOffers: async (segment, limit = 5) =>
    unwrap(await request("POST", "/offers/generate", { data: { segment, limit } })),

  getAllPendingOffers: async (limitPerSegment = 100) => {
    const lists = await Promise.all(
      OFFER_SEGMENTS.map((s) =>
        offerAdminApi.getOffersBySegment(s.value, "GENERATED", limitPerSegment).catch(() => [])
      )
    );
    return lists.flat();
  },

  getPendingOffers: async (segment, limit = 100) =>
    unwrap(await request("GET", "/offers/pending", { params: { segment, limit } })),

  getOffersBySegment: async (segment, status, limit = 100) => {
    const params = { segment, limit };
    if (status) params.status = status;
    return unwrap(await request("GET", "/offers", { params }));
  },

  approveOffer: async (offerId) => unwrap(await request("PUT", `/offers/${offerId}/approve`)),

  rejectOffer: async (offerId) => unwrap(await request("PUT", `/offers/${offerId}/reject`)),

  approveOffersBatch: async (offerIds) =>
    unwrap(await request("POST", "/offers/approve", { data: { offerIds } })),

  getEligibleLenders: async () => {
    const summary = await offerAdminApi.getSegmentSummary(true);
    const seen = new Set();
    const lenders = [];
    (summary || []).forEach((seg) => {
      (seg.lenders || []).forEach((l) => {
        const key = `${seg.segment}-${l.lenderId}`;
        if (seen.has(key)) return;
        seen.add(key);
        lenders.push({
          userId: l.lenderId,
          name: l.lenderName,
          mobile: l.mobile || "—",
          email: l.email || "—",
          segment: seg.segment,
          segmentLabel: seg.displayName,
          offerAssigned: seg.description,
        });
      });
    });
    return lenders;
  },

  getHistory: async () => {
    const all = [];
    for (const seg of OFFER_SEGMENTS) {
      try {
        const offers = await offerAdminApi.getOffersBySegment(seg.value, null, 200);
        (offers || []).forEach((o) => {
          all.push({ ...o, segment: o.segment || seg.value });
        });
      } catch {
        /* segment may have no offers */
      }
    }
    return all.sort(
      (a, b) => new Date(b.generatedAt || 0) - new Date(a.generatedAt || 0)
    );
  },

  getApprovedOffers: async (segment) => {
    if (segment) {
      return offerAdminApi.getOffersBySegment(segment, "APPROVED");
    }
    const all = [];
    for (const seg of OFFER_SEGMENTS) {
      try {
        const offers = await offerAdminApi.getOffersBySegment(seg.value, "APPROVED", 100);
        all.push(...(offers || []));
      } catch {
        /* skip */
      }
    }
    return all;
  },

  getRejectedOffers: async (segment) => {
    if (segment) {
      return offerAdminApi.getOffersBySegment(segment, "REJECTED");
    }
    const all = [];
    for (const seg of OFFER_SEGMENTS) {
      try {
        const offers = await offerAdminApi.getOffersBySegment(seg.value, "REJECTED", 100);
        all.push(...(offers || []));
      } catch {
        /* skip */
      }
    }
    return all;
  },
};

export default offerAdminApi;
