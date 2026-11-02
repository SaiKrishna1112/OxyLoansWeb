# -*- coding: utf-8 -*-
file_path = 'src/components/pages/Oxyloans/Borrower/redesign/components/instantLoan/InstantLoanStepOfferSelection.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update fetchLoansInitiated so it does not inject mock lenders when no one has given offers
old_fallback_block = '''    // Default 3 matched competing peer lenders in P2P market reviewing this active loan request
    const currentTarget = Number(activeReq?.requestAmount || activeReq?.loanRequestAmount || requestedAmount || 10000);
    const halfAmt = Math.round(currentTarget * 0.5);
    const excessOfferAmt = Math.round(currentTarget * 0.7);
    const reqId = activeReq?.loanRequestId || `LR10${profileData.userId || "41682"}`;

    const matchedFallback = [
      {
        id: `LOAN_PEER_${profileData.userId || "41682"}_1`,
        serialNumber: 1,
        loanRequestId: reqId,
        borrowerId: profileData.userId || "41682",
        lenderId: "LR1041682",
        lenderName: "Radha Krishna Rao (Registered P2P Lender)",
        lenderInterestedAmount: halfAmt,
        roi: confirmedLenderRoi || 16.5,
        duration: selectedTenure === 1 ? 30 : selectedTenure * 30,
        loanStatus: "MATCHED",
        lenderStatus: "PENDING",
        borrowerStatus: "INITIATED",
        createdAt: new Date().toISOString(),
        distance: 5,
        borrowerAggrement: null,
        borrowerEsigned: false,
        role: "Primary Peer Lender",
        sharePercentage: 50,
      },
      {
        id: `LOAN_PEER_${profileData.userId || "41682"}_2`,
        serialNumber: 2,
        loanRequestId: reqId,
        borrowerId: profileData.userId || "41682",
        lenderId: "LR1045920",
        lenderName: "Suresh Varma (Certified P2P Lender)",
        lenderInterestedAmount: currentTarget - halfAmt,
        roi: confirmedLenderRoi || 16.5,
        duration: selectedTenure === 1 ? 30 : selectedTenure * 30,
        loanStatus: "MATCHED",
        lenderStatus: "PENDING",
        borrowerStatus: "INITIATED",
        createdAt: new Date().toISOString(),
        distance: 12,
        borrowerAggrement: null,
        borrowerEsigned: false,
        role: "Syndicate Co-Lender #1",
        sharePercentage: 50,
      },
      {
        id: `LOAN_PEER_${profileData.userId || "41682"}_3`,
        serialNumber: 3,
        loanRequestId: reqId,
        borrowerId: profileData.userId || "41682",
        lenderId: "LR1048891",
        lenderName: "Ananya Sharma (Verified P2P Investor)",
        lenderInterestedAmount: excessOfferAmt,
        roi: Number(((confirmedLenderRoi || 16.5) + 0.5).toFixed(2)),
        duration: selectedTenure === 1 ? 30 : selectedTenure * 30,
        loanStatus: "MATCHED",
        lenderStatus: "PENDING",
        borrowerStatus: "INITIATED",
        createdAt: new Date().toISOString(),
        distance: 8,
        borrowerAggrement: null,
        borrowerEsigned: false,
        role: "Syndicate Co-Lender #2",
        sharePercentage: Math.round((excessOfferAmt / (currentTarget || 1)) * 100),
      },
    ];

    setLoanInitiatedInfo({
      apiData: matchedFallback,
      hasData: true,
      loading: false,
      errorMessage: "",
    });'''

new_fallback_block = '''    // If no lenders have given offers yet, keep list empty and hasData false
    setLoanInitiatedInfo({
      apiData: [],
      hasData: false,
      loading: false,
      errorMessage: "",
    });'''

if old_fallback_block in content:
    content = content.replace(old_fallback_block, new_fallback_block)
    print("Replaced fallback mock in fetchLoansInitiated")
else:
    print("Could not find old_fallback_block")

# 2. Add hasLenderOffers and update lenderList
old_lender_list = '''  const lenderList = useMemo(() => {
    const isBullet = selectedTenure === 1 || selectedOfferType === "BULLET";
    const tenureMonths = isBullet ? 1 : selectedTenure;
    const tenureText = isBullet ? "30 Days" : `${selectedTenure} Months`;

    const calcOffer = (roi, feeAddon = 0) => {
      const p = requestedAmount;
      const fee = Math.round(p * 0.03 * 1.18) + feeAddon;
      if (isBullet) {
        const interest = Math.round((p * (roi / 100)) / 12);
        const total = p + interest;
        return { emi: total, totalRepayment: total, processingFee: fee };
      }
      const r = roi / 12 / 100;
      const emi = Math.round((p * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1));
      const total = emi * tenureMonths;
      return { emi, totalRepayment: total, processingFee: fee };
    };

    const oxy = calcOffer(16.5, 0);
    const bharat = calcOffer(17.0, 5);
    const trust = calcOffer(17.5, 35);

    return [
      {
        id: "OXY_P2P_01",
        name: "OxyLoans P2P",
        badgeText: "Verified",
        badgeBg: "rgba(22, 163, 74, 0.1)",
        badgeColor: "#15803d",
        badgeBorder: "rgba(22, 163, 74, 0.25)",
        logoBg: "#059669",
        icon: "fa-solid fa-circle-nodes",
        roi: 16.5,
        emi: oxy.emi,
        totalRepayment: oxy.totalRepayment,
        processingFee: oxy.processingFee,
        tenureText,
      },
      {
        id: "BHARAT_FINVEST_02",
        name: "Bharat FinVest",
        badgeText: "(RBI Registered)",
        badgeBg: "rgba(22, 163, 74, 0.08)",
        badgeColor: "#15803d",
        badgeBorder: "rgba(22, 163, 74, 0.2)",
        logoBg: "#831843",
        icon: "fa-solid fa-landmark",
        roi: 17.0,
        emi: bharat.emi,
        totalRepayment: bharat.totalRepayment,
        processingFee: bharat.processingFee,
        tenureText,
      },
      {
        id: "TRUSTLEND_03",
        name: "TrustLend Capital",
        badgeText: "(RBI Registered)",
        badgeBg: "rgba(22, 163, 74, 0.08)",
        badgeColor: "#15803d",
        badgeBorder: "rgba(22, 163, 74, 0.2)",
        logoBg: "#b45309",
        icon: "fa-solid fa-shield",
        roi: 17.5,
        emi: trust.emi,
        totalRepayment: trust.totalRepayment,
        processingFee: trust.processingFee,
        tenureText,
      },
    ];
  }, [requestedAmount, selectedTenure, selectedOfferType]);'''

new_lender_list = '''  const hasLenderOffers = useMemo(() => {
    return Boolean(
      loanInitiatedInfo?.hasData &&
      Array.isArray(loanInitiatedInfo?.apiData) &&
      loanInitiatedInfo.apiData.length > 0
    );
  }, [loanInitiatedInfo]);

  const lenderList = useMemo(() => {
    if (!loanInitiatedInfo?.hasData || !Array.isArray(loanInitiatedInfo?.apiData) || loanInitiatedInfo.apiData.length === 0) {
      return [];
    }

    const isBullet = selectedTenure === 1 || selectedOfferType === "BULLET";
    const tenureMonths = isBullet ? 1 : selectedTenure;
    const tenureText = isBullet ? "30 Days" : `${selectedTenure} Months`;

    return loanInitiatedInfo.apiData.map((item, idx) => {
      const p = Number(item.lenderInterestedAmount || requestedAmount);
      const roi = Number(item.roi || confirmedLenderRoi || 16.5);
      const fee = Math.round(p * 0.03 * 1.18);
      let emi = 0;
      let totalRepayment = 0;

      if (isBullet) {
        const interest = Math.round((p * (roi / 100)) / 12);
        totalRepayment = p + interest;
        emi = totalRepayment;
      } else {
        const r = roi / 12 / 100;
        emi = Math.round((p * r * Math.pow(1 + r, tenureMonths)) / (Math.pow(1 + r, tenureMonths) - 1));
        totalRepayment = emi * tenureMonths;
      }

      return {
        id: item.id || `LENDER_${idx}`,
        raw: item,
        name: item.lenderName || `Matched Lender #${idx + 1}`,
        badgeText: isAcceptedStatus(item.borrowerStatus) ? "Accepted" : "Verified",
        badgeBg: "rgba(22, 163, 74, 0.1)",
        badgeColor: "#15803d",
        badgeBorder: "rgba(22, 163, 74, 0.25)",
        logoBg: idx % 3 === 0 ? "#059669" : idx % 3 === 1 ? "#831843" : "#b45309",
        icon: idx % 3 === 0 ? "fa-solid fa-circle-nodes" : idx % 3 === 1 ? "fa-solid fa-landmark" : "fa-solid fa-shield",
        roi,
        emi,
        totalRepayment,
        processingFee: fee,
        tenureText,
      };
    });
  }, [loanInitiatedInfo, requestedAmount, selectedTenure, selectedOfferType, confirmedLenderRoi]);'''

if old_lender_list in content:
    content = content.replace(old_lender_list, new_lender_list)
    print("Replaced lenderList with live offers and added hasLenderOffers")
else:
    print("Could not find old_lender_list")

# 3. Wrap Section 3 in {hasLenderOffers && ( ... )}
sec3_start_marker = '{/* 5. Numbered Circle 3: Lender Offers for Your Selected Plan */}'
sec3_end_marker = '{/* 6. Bottom Sticky Summary & CTA Bar */}'

s3_start = content.find(sec3_start_marker)
s3_end = content.find(sec3_end_marker)

if s3_start != -1 and s3_end != -1:
    old_sec3 = content[s3_start:s3_end].strip()
    new_sec3 = f'''{{/* 5. Numbered Circle 3: Lender Offers for Your Selected Plan (Only shown when lenders have offered) */}}
      {{hasLenderOffers && (
{old_sec3.replace('{/* 5. Numbered Circle 3: Lender Offers for Your Selected Plan */}', '').strip()}
      )}}

      '''
    content = content[:s3_start] + new_sec3 + content[s3_end:]
    print("Wrapped Section 3 in hasLenderOffers condition")
else:
    print("Could not find Section 3 markers", s3_start, s3_end)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("File updated successfully!")
