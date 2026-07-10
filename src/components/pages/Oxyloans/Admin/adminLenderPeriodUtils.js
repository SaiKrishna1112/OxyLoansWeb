/** Presets for active-lenders period filter (participation received_on window). */
export const LENDER_PERIOD_PRESETS = [
  { id: "ALL", label: "All time" },
  { id: "3M", label: "Last 3 months", months: 3 },
  { id: "6M", label: "Last 6 months", months: 6 },
  { id: "1Y", label: "Last 1 year", months: 12 },
  { id: "CUSTOM", label: "Custom range" },
];

const pad = (n) => String(n).padStart(2, "0");

export const toIsoDate = (d) => {
  if (!d) return "";
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};

/** Resolve preset + optional custom inputs → { startDate, endDate, label } */
export const resolveLenderPeriod = (presetId = "ALL", customStart = "", customEnd = "") => {
  const preset = LENDER_PERIOD_PRESETS.find((p) => p.id === presetId) || LENDER_PERIOD_PRESETS[0];
  const today = new Date();
  const endDate = presetId === "CUSTOM" && customEnd ? customEnd : toIsoDate(today);

  if (presetId === "ALL") {
    return { startDate: null, endDate: null, label: preset.label, presetId };
  }
  if (presetId === "CUSTOM") {
    return {
      startDate: customStart || null,
      endDate: endDate || null,
      label: customStart && endDate ? `${customStart} → ${endDate}` : "Custom range",
      presetId,
    };
  }
  const start = new Date(today);
  start.setMonth(start.getMonth() - (preset.months || 3));
  const startDate = toIsoDate(start);
  return {
    startDate,
    endDate,
    label: `${preset.label} (${startDate} → ${endDate})`,
    presetId,
  };
};

export const formatPeriodChip = (period) => {
  if (!period?.startDate) return "All time";
  if (period.endDate) return `${period.startDate} → ${period.endDate}`;
  return period.startDate;
};
