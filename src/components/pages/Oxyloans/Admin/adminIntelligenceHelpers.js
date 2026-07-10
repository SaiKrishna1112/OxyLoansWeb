/** Client-side deal ops rules when /admin/deal-intelligence is unavailable */

const round2 = (v) => Math.round(Number(v) * 100) / 100;

export const recommendDealAction = (deal, lenderRoi, borrowerRoi, monthsRunning = 0, daysToMaturity = null) => {
  const fillPct = deal.fillPercent ?? 0;
  const spread = borrowerRoi - lenderRoi;
  const duration = deal.durationMonths || 0;

  let action = "HOLD";
  let reason = `Fill ${fillPct}%, spread ${round2(spread)}%.`;
  let suggestedNextStep = "Monitor monthly interest and participation.";

  if (daysToMaturity != null && daysToMaturity <= 45) {
    action = "CLOSE_SOON";
    reason = `Maturity in ${daysToMaturity} days.`;
    suggestedNextStep = "Plan principal return and a follow-on deal for reinvestment.";
  } else if (spread < 0.55 && monthsRunning >= 3) {
    action = "CLOSE";
    reason = `Thin spread (${round2(spread)}%) after ${monthsRunning}+ months at ${lenderRoi}% lender ROI.`;
    suggestedNextStep = "Close and relaunch with better borrower/lender ROI mix (keep spread ≥ 0.55%).";
  } else if (fillPct >= 95 && monthsRunning >= 1) {
    action = "RELAUNCH_SIMILAR";
    reason = `${fillPct}% filled — strong demand at ${lenderRoi}% ROI.`;
    suggestedNextStep = `Launch similar deal at ${lenderRoi}–${round2(Math.min(2.1, lenderRoi + 0.15))}% lender ROI.`;
  } else if (fillPct < 55 && monthsRunning >= 2) {
    const alt = lenderRoi <= 1.55 ? 1.75 : 1.55;
    action = "RELAUNCH_DIFFERENT_ROI";
    reason = `Only ${fillPct}% filled at ${lenderRoi}% after ${monthsRunning} months.`;
    suggestedNextStep = `Try ~${alt}% lender ROI with clearer min/max tickets (₹50L PAN limit).`;
  } else if (duration > 0 && monthsRunning >= duration - 2) {
    action = "CLOSE";
    reason = `Ran ${monthsRunning} of ${duration} months.`;
    suggestedNextStep = "Start orderly closure and lender communication.";
  }

  return {
    lenderRoi: round2(lenderRoi),
    borrowerRoi: round2(borrowerRoi),
    spreadPercent: round2(spread),
    action,
    reason,
    suggestedNextStep,
  };
};

export const mapDealRowToRecommendation = (deal) => {
  const lenderRoi = Number(deal.rateOfInterest) || 1.65;
  const borrowerRoi = Math.min(3, Math.max(2.75, lenderRoi + 1.15));
  const rec = recommendDealAction(deal, lenderRoi, borrowerRoi);
  return {
    dealId: deal.dealId,
    dealName: deal.dealName,
    borrowerName: deal.borrowerName,
    dealAmount: deal.dealAmount,
    participatedAmount: deal.participatedAmount,
    fillPercent: deal.fillPercent,
    monthsRunning: 0,
    daysToMaturity: null,
    interestPaidToLenders: 0,
    borrowerFeesCollected: 0,
    ...rec,
  };
};

export const buildAiSummaryText = (feeSummary, closeCandidates, relaunchCandidates, launch) => {
  const fs = feeSummary || {};
  const lines = [
    `• ${fs.activeRunningDeals ?? 0} active deals · borrower fees ₹${Number(fs.borrowerFeesCollected || 0).toLocaleString("en-IN")} · avg spread ${fs.avgSpreadPercent ?? "—"}%.`,
    `• Lender payouts (all time): interest ₹${Number(fs.lenderInterestPaid || 0).toLocaleString("en-IN")}, principal ₹${Number(fs.lenderPrincipalReturned || 0).toLocaleString("en-IN")}.`,
    `• Actions: ${closeCandidates?.length || 0} close/wind-down, ${relaunchCandidates?.length || 0} relaunch — open Deal Intelligence for details.`,
    launch?.suggestedDealSize
      ? `• Launch idea: ~₹${Number(launch.suggestedDealSize).toLocaleString("en-IN")} at ${launch.suggestedLenderRoiMin}–${launch.suggestedLenderRoiMax}% lender / ~${launch.suggestedBorrowerRoi}% borrower ROI.`
      : "• Review running deals fill % and ROI spread before next launch.",
  ];
  return lines.join("\n");
};
