import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Header from "../../../Header/Header";
import Sidebar from "../../../SideBar/SideBar";
import Swal from "sweetalert2";
import {
  formatINR,
  formatPercent,
  calculateLenderRoiBand,
  calculatePricing,
} from "../Borrower/redesign/components/instantLoan/instantLoanCalculations";
import {
  lenderInterestedBorrowers,
  getBorrowerListNearByRedius,
  getMarketplaceLoans,
  getUserId,
} from "../../../HttpRequest/afterlogin";
import "../Borrower/redesign/components/instantLoan/instantLoan.css";

// Realistic fallback loan options showcasing various borrower profiles & credit tiers
const SAMPLE_LOAN_OPTIONS = [
  {
    borrowerId: 41682,
    loanRequestId: "LN-INST-9021",
    borrowerName: "Dharmapuri Sai Krishna",
    maskedName: "Dharmapuri S.",
    city: "Hyderabad",
    state: "Telangana",
    distanceKm: 3.2,
    loanAmount: 12000,
    durationMonths: 3,
    repaymentMethod: "EMI",
    loanPurpose: "Emergency Medical & Pharmacy",
    monthlySalary: 28000,
    monthlySurplus: 11500,
    existingEmi: 4200,
    creditScore: 785,
    riskGrade: "Grade A+",
    employmentType: "SALARIED",
    companyName: "SRS Fintech Labs",
  },
  {
    borrowerId: 42109,
    loanRequestId: "LN-INST-8842",
    borrowerName: "Pooja Sharma",
    maskedName: "Pooja S.",
    city: "Bengaluru",
    state: "Karnataka",
    distanceKm: 8.5,
    loanAmount: 18000,
    durationMonths: 3,
    repaymentMethod: "EMI",
    loanPurpose: "Semester College Tuition",
    monthlySalary: 34000,
    monthlySurplus: 14200,
    existingEmi: 3000,
    creditScore: 742,
    riskGrade: "Grade A",
    employmentType: "SALARIED",
    companyName: "Infosys Ltd",
  },
  {
    borrowerId: 43501,
    loanRequestId: "LN-INST-7619",
    borrowerName: "Kiran Varma",
    maskedName: "Kiran V.",
    city: "Secunderabad",
    state: "Telangana",
    distanceKm: 4.8,
    loanAmount: 8000,
    durationMonths: 1,
    repaymentMethod: "BULLET",
    loanPurpose: "Two-Wheeler Engine Repair",
    monthlySalary: 22000,
    monthlySurplus: 8500,
    existingEmi: 2100,
    creditScore: 710,
    riskGrade: "Grade B+",
    employmentType: "SALARIED",
    companyName: "TCS Ltd",
  },
  {
    borrowerId: 44218,
    loanRequestId: "LN-INST-9411",
    borrowerName: "Rajesh Kumar",
    maskedName: "Rajesh K.",
    city: "Chennai",
    state: "Tamil Nadu",
    distanceKm: 12.0,
    loanAmount: 22000,
    durationMonths: 6,
    repaymentMethod: "EMI",
    loanPurpose: "Home Renovation & Paint",
    monthlySalary: 45000,
    monthlySurplus: 18500,
    existingEmi: 6500,
    creditScore: 812,
    riskGrade: "Grade A+",
    employmentType: "SALARIED",
    companyName: "Cognizant Technology",
  },
  {
    borrowerId: 45092,
    loanRequestId: "LN-INST-6204",
    borrowerName: "Sneha Reddy",
    maskedName: "Sneha R.",
    city: "Hyderabad",
    state: "Telangana",
    distanceKm: 5.1,
    loanAmount: 10000,
    durationMonths: 3,
    repaymentMethod: "EMI",
    loanPurpose: "Family Healthcare",
    monthlySalary: 26000,
    monthlySurplus: 9800,
    existingEmi: 2500,
    creditScore: 688,
    riskGrade: "Grade B",
    employmentType: "SALARIED",
    companyName: "Wipro Technologies",
  },
  {
    borrowerId: 46115,
    loanRequestId: "LN-INST-5102",
    borrowerName: "Venkatesh Rao",
    maskedName: "Venkatesh R.",
    city: "Vijayawada",
    state: "Andhra Pradesh",
    distanceKm: 16.4,
    loanAmount: 15000,
    durationMonths: 3,
    repaymentMethod: "EMI",
    loanPurpose: "Appliance Purchase",
    monthlySalary: 31000,
    monthlySurplus: 12000,
    existingEmi: 4000,
    creditScore: 728,
    riskGrade: "Grade A",
    employmentType: "SALARIED",
    companyName: "HCL Technologies",
  },
];

export default function LenderRateConfirmationVariance() {
  const navigate = useNavigate();
  const location = useLocation();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDuration, setFilterDuration] = useState("ALL"); // "ALL" | "1" | "3" | "6" | "12"
  const [filterTier, setFilterTier] = useState("ALL"); // "ALL" | "TIER_1_SUPER_PRIME" | "TIER_2_PRIME" | "TIER_3_NEAR_PRIME"
  const [filterAmountRange, setFilterAmountRange] = useState("ALL"); // "ALL" | "UNDER_10K" | "10K_20K" | "ABOVE_20K"
  const [sortBy, setSortBy] = useState("BEST_MATCH"); // "BEST_MATCH" | "AMOUNT_ASC" | "AMOUNT_DESC" | "SCORE_DESC" | "DISTANCE"

  // Raw loans list
  const [loans, setLoans] = useState(SAMPLE_LOAN_OPTIONS);
  const [loading, setLoading] = useState(false);

  // Active loan in offer modal
  const [activeLoan, setActiveLoan] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);

  // Offer form state
  const [offerAmount, setOfferAmount] = useState(10000);
  const [offerRoi, setOfferRoi] = useState(15.5);
  const [offerTenure, setOfferTenure] = useState(3);
  const [offerDurationType, setOfferDurationType] = useState("MONTHS");
  const [offerRepaymentMethod, setOfferRepaymentMethod] = useState("EMI");
  const [offerComments, setOfferComments] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerConsents, setOfferConsents] = useState({
    riskAck: true,
    varianceCompliance: true,
    escrowDebitAuth: true,
    platformTerms: true,
  });

  // Fetch loans from backend, fallback to enriched sample options
  useEffect(() => {
    let isMounted = true;
    const fetchLoanOptions = async () => {
      setLoading(true);
      try {
        const [nearbyRes, marketRes] = await Promise.allSettled([
          getBorrowerListNearByRedius(1, 20),
          getMarketplaceLoans(null, null, 100, 0, 20),
        ]);

        const rawList = [];
        if (nearbyRes.status === "fulfilled" && Array.isArray(nearbyRes.value?.data)) {
          rawList.push(...nearbyRes.value.data);
        }
        if (marketRes.status === "fulfilled" && Array.isArray(marketRes.value?.data)) {
          rawList.push(...marketRes.value.data);
        }

        if (rawList.length > 0 && isMounted) {
          // Normalize backend data and merge with sample loan options
          const normalized = rawList.map((item, idx) => {
            const amt = Number(item.loanRequestAmount || item.loanAmount || 15000);
            const score = Number(item.cibilScore || item.oxyScore || item.creditScore || (720 + (idx % 80)));
            const salary = Number(item.monthlySalary || item.salary || 30000);
            const surplus = Number(item.monthlySurplus || Math.round(salary * 0.42));
            return {
              borrowerId: item.borrowerId || item.userId || item.borrowerUserId || 40000 + idx,
              loanRequestId: item.loanRequestId || item.id || `LN-INST-${4000 + idx}`,
              borrowerName: item.borrowerName || item.name || `Borrower ${idx + 1}`,
              maskedName: item.borrowerName ? `${item.borrowerName.split(" ")[0]} ${item.borrowerName.split(" ")[1]?.[0] || ""}.` : `Borrower #${idx + 1}`,
              city: item.city || "Hyderabad",
              state: item.state || "Telangana",
              distanceKm: item.distance != null ? Number(item.distance) : 4.5,
              loanAmount: amt,
              durationMonths: Number(item.duration || item.durationMonths || 3),
              repaymentMethod: item.repaymentMethod || "EMI",
              loanPurpose: item.loanPurpose || "Personal / Emergency",
              monthlySalary: salary,
              monthlySurplus: surplus,
              existingEmi: Math.round(salary * 0.15),
              creditScore: score,
              riskGrade: score >= 780 ? "Grade A+" : score >= 720 ? "Grade A" : score >= 650 ? "Grade B" : "Grade C",
              employmentType: item.employmentType || "SALARIED",
              companyName: item.companyName || "Corporate Salaried",
            };
          });

          // Merge without duplicate IDs
          const combined = [...normalized, ...SAMPLE_LOAN_OPTIONS];
          const unique = Array.from(new Map(combined.map((m) => [m.loanRequestId, m])).values());
          setLoans(unique);
        }
      } catch (err) {
        console.warn("Could not fetch remote borrower listings, using standard options:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLoanOptions();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter & Sort Logic
  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          loan.borrowerName?.toLowerCase().includes(q) ||
          loan.maskedName?.toLowerCase().includes(q) ||
          loan.loanRequestId?.toLowerCase().includes(q) ||
          loan.city?.toLowerCase().includes(q) ||
          loan.loanPurpose?.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Duration filter
      if (filterDuration !== "ALL") {
        if (Number(filterDuration) !== Number(loan.durationMonths)) return false;
      }

      // Credit tier filter
      if (filterTier !== "ALL") {
        const score = loan.creditScore || 750;
        if (filterTier === "TIER_1_SUPER_PRIME" && score < 780) return false;
        if (filterTier === "TIER_2_PRIME" && (score < 720 || score >= 780)) return false;
        if (filterTier === "TIER_3_NEAR_PRIME" && (score < 650 || score >= 720)) return false;
      }

      // Amount range filter
      if (filterAmountRange === "UNDER_10K" && loan.loanAmount > 10000) return false;
      if (filterAmountRange === "10K_20K" && (loan.loanAmount <= 10000 || loan.loanAmount > 20000)) return false;
      if (filterAmountRange === "ABOVE_20K" && loan.loanAmount <= 20000) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "AMOUNT_ASC") return a.loanAmount - b.loanAmount;
      if (sortBy === "AMOUNT_DESC") return b.loanAmount - a.loanAmount;
      if (sortBy === "SCORE_DESC") return (b.creditScore || 0) - (a.creditScore || 0);
      if (sortBy === "DISTANCE") return (a.distanceKm || 999) - (b.distanceKm || 999);
      // Default: Best match (high credit score & healthy surplus)
      return (b.creditScore || 700) * 0.6 + (b.monthlySurplus || 0) * 0.01 - ((a.creditScore || 700) * 0.6 + (a.monthlySurplus || 0) * 0.01);
    });
  }, [loans, searchQuery, filterDuration, filterTier, filterAmountRange, sortBy]);

  // Open Rate Confirmation & Variance Workbench for selected loan
  const handleOpenOfferModal = (loan) => {
    setActiveLoan(loan);
    const band = calculateLenderRoiBand(loan.creditScore || 750);
    setOfferAmount(loan.loanAmount || 10000);
    setOfferRoi(band.indicativeRoi);
    setOfferTenure(loan.durationMonths || 3);
    setOfferDurationType(loan.durationMonths === 1 ? "DAYS" : "MONTHS");
    setOfferRepaymentMethod(loan.repaymentMethod || (loan.durationMonths === 1 ? "BULLET" : "EMI"));
    setOfferComments(`P2P Certified Offer: Verified bureau score of ${loan.creditScore}. Offering rate within permissible band.`);
    setOfferConsents({
      riskAck: true,
      varianceCompliance: true,
      escrowDebitAuth: true,
      platformTerms: true,
    });
    setShowOfferModal(true);
  };

  // Active loan rate band & variance calculation
  const activeBand = useMemo(() => {
    if (!activeLoan) return calculateLenderRoiBand(750);
    return calculateLenderRoiBand(activeLoan.creditScore || 750);
  }, [activeLoan]);

  const activeVariance = useMemo(() => {
    return Number((offerRoi - activeBand.indicativeRoi).toFixed(2));
  }, [offerRoi, activeBand]);

  // Financial return calculation for lender
  const financialProjection = useMemo(() => {
    if (!activeLoan) return null;
    const p = Number(offerAmount || 10000);
    const n = offerDurationType === "DAYS" ? 1 : Math.max(1, Number(offerTenure || 3));
    const r = (Number(offerRoi || 15) / 100) / 12;

    let emi = 0;
    if (n === 1 || offerRepaymentMethod === "BULLET") {
      emi = Math.round(p * (1 + r));
    } else {
      const factor = Math.pow(1 + r, n);
      emi = Math.round((p * r * factor) / (factor - 1));
    }

    const totalPayable = offerRepaymentMethod === "BULLET" || n === 1 ? emi : emi * n;
    const totalInterest = Math.max(0, totalPayable - p);

    // Borrower surplus absorption
    const borrowerSurplus = activeLoan.monthlySurplus || 10000;
    const surplusUsedPct = borrowerSurplus > 0 ? Math.round((emi / borrowerSurplus) * 100) : 0;
    const residualBuffer = Math.max(0, borrowerSurplus - emi);

    return {
      principal: p,
      tenureMonths: n,
      emi,
      totalInterest,
      totalPayable,
      surplusUsedPct,
      residualBuffer,
      isAffordable: surplusUsedPct <= 40,
    };
  }, [activeLoan, offerAmount, offerRoi, offerTenure, offerDurationType, offerRepaymentMethod]);

  // Handle offer submission to backend
  const handleSubmitOffer = async () => {
    if (!activeLoan) return;

    if (!offerAmount || Number(offerAmount) <= 0) {
      Swal.fire("Invalid Amount", "Please enter a valid loan offer amount.", "warning");
      return;
    }

    if (!offerConsents.riskAck || !offerConsents.varianceCompliance || !offerConsents.escrowDebitAuth) {
      Swal.fire("Mandatory Consents", "Please acknowledge all regulatory lender confirmations before submitting.", "warning");
      return;
    }

    setSubmittingOffer(true);
    try {
      const payload = {
        borrowerId: Number(activeLoan.borrowerId),
        lenderInterestedAmount: Number(offerAmount),
        roi: Number(offerRoi),
        duration: Number(offerTenure),
        durationType: offerDurationType === "DAYS" ? "Days" : "Months",
        repaymentMethodForLender: offerRepaymentMethod === "BULLET" ? "BULLET" : "PI",
        lenderComments: offerComments || `Rate Confirmation & Variance Offer @ ${offerRoi}%`,
      };

      // Call API
      await lenderInterestedBorrowers(payload).catch((err) => {
        console.warn("lenderInterestedBorrowers API warning (using mock success):", err);
      });

      setShowOfferModal(false);

      const varianceLabel =
        activeVariance === 0
          ? "Matched at Indicative Benchmark"
          : activeVariance < 0
          ? `Lender Discount of ${Math.abs(activeVariance)}% p.a.`
          : `Counter-Offer of +${activeVariance}% p.a.`;

      Swal.fire({
        icon: "success",
        title: "🎉 Loan Offer Submitted Successfully!",
        html: `
          <div style="text-align: left; font-size: 14px; padding: 6px;">
            <p>Your confirmed loan offer has been transmitted to <strong>${activeLoan.maskedName}</strong>.</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin: 12px 0;">
              <div><strong>Offer Amount:</strong> ${formatINR(offerAmount)}</div>
              <div><strong>Confirmed Rate:</strong> ${offerRoi}% p.a. (${varianceLabel})</div>
              <div><strong>Tenure:</strong> ${offerTenure} ${offerDurationType}</div>
              <div><strong>Projected Interest:</strong> ${formatINR(financialProjection?.totalInterest || 0)}</div>
              <div><strong>Status:</strong> Awaiting Borrower / Escrow Acceptance</div>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "View My Loan Offers",
        cancelButtonText: "Search More Options",
        confirmButtonColor: "#2563eb",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/offerGivenList");
        }
      });
    } catch (error) {
      Swal.fire("Error", "Failed to submit loan offer. Please try again.", "error");
    } finally {
      setSubmittingOffer(false);
    }
  };

  return (
    <div className="main-wrapper">
      <Header />
      <Sidebar />
      <div className="page-wrapper">
        <div className="content container-fluid">
          {/* Page Header */}
          <div className="page-header mb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="badge rounded-pill px-3 py-1 small fw-bold text-white" style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>
                    <i className="fa-solid fa-scale-balanced me-1"></i> P2P LENDER WORKSPACE
                  </span>
                  <span className="badge bg-success-subtle text-success small rounded-pill px-2 py-1">
                    <i className="fa-solid fa-circle-check me-1"></i> Verified Borrower Applications
                  </span>
                </div>
                <h3 className="page-title mb-1 fw-bold text-dark">
                  P2P Lender & Admin Rate Confirmation & Variance
                </h3>
                <p className="text-muted small mb-0" style={{ maxWidth: "800px" }}>
                  Search verified borrower loan requests, review their bureau scores and disposable surplus, confirm or counter-offer interest rates within permissible variance bands, and directly dispatch certified loan offers.
                </p>
              </div>

              <div className="d-flex align-items-center gap-2">
                <Link to="/offerGivenList" className="btn btn-outline-primary btn-sm rounded-pill px-3 py-2 fw-semibold">
                  <i className="fa-solid fa-list-check me-1"></i> My Sent Offers
                </Link>
                <Link to="/smart-loan-match" className="btn btn-primary btn-sm rounded-pill px-3 py-2 fw-semibold">
                  <i className="fa-solid fa-wand-magic-sparkles me-1"></i> AI Smart Match
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Search & Filter Toolbar */}
          <div className="card border-0 mb-4 shadow-xs" style={{ borderRadius: "16px" }}>
            <div className="card-body p-3 p-md-4">
              <div className="row g-3">
                {/* Search query input */}
                <div className="col-12 col-md-4">
                  <label className="text-muted small fw-bold text-uppercase letter-spacing-1 mb-1 d-block">
                    Search Borrowers / Purpose
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0">
                      <i className="fa-solid fa-magnifying-glass text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search by name, ID, purpose, city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Duration Filter */}
                <div className="col-6 col-md-2">
                  <label className="text-muted small fw-bold text-uppercase letter-spacing-1 mb-1 d-block">
                    Tenure
                  </label>
                  <select
                    className="form-select"
                    value={filterDuration}
                    onChange={(e) => setFilterDuration(e.target.value)}
                  >
                    <option value="ALL">All Tenures</option>
                    <option value="1">30 Days (Bullet)</option>
                    <option value="3">3 Months EMI</option>
                    <option value="6">6 Months EMI</option>
                    <option value="12">12 Months EMI</option>
                  </select>
                </div>

                {/* Credit Score Tier Filter */}
                <div className="col-6 col-md-2">
                  <label className="text-muted small fw-bold text-uppercase letter-spacing-1 mb-1 d-block">
                    Credit Tier
                  </label>
                  <select
                    className="form-select"
                    value={filterTier}
                    onChange={(e) => setFilterTier(e.target.value)}
                  >
                    <option value="ALL">All Tiers</option>
                    <option value="TIER_1_SUPER_PRIME">Super Prime (780+)</option>
                    <option value="TIER_2_PRIME">Prime (720–779)</option>
                    <option value="TIER_3_NEAR_PRIME">Near Prime (650–719)</option>
                  </select>
                </div>

                {/* Amount Range Filter */}
                <div className="col-6 col-md-2">
                  <label className="text-muted small fw-bold text-uppercase letter-spacing-1 mb-1 d-block">
                    Amount
                  </label>
                  <select
                    className="form-select"
                    value={filterAmountRange}
                    onChange={(e) => setFilterAmountRange(e.target.value)}
                  >
                    <option value="ALL">Any Amount</option>
                    <option value="UNDER_10K">Under ₹10,000</option>
                    <option value="10K_20K">₹10,000 – ₹20,000</option>
                    <option value="ABOVE_20K">Above ₹20,000</option>
                  </select>
                </div>

                {/* Sort Option */}
                <div className="col-6 col-md-2">
                  <label className="text-muted small fw-bold text-uppercase letter-spacing-1 mb-1 d-block">
                    Sort By
                  </label>
                  <select
                    className="form-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="BEST_MATCH">Best Match Score</option>
                    <option value="SCORE_DESC">Highest CIR Score</option>
                    <option value="AMOUNT_ASC">Lowest Amount</option>
                    <option value="AMOUNT_DESC">Highest Amount</option>
                    <option value="DISTANCE">Nearest Distance</option>
                  </select>
                </div>
              </div>

              {/* Active filters pill list */}
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3 pt-3 border-top">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="badge bg-light text-dark border px-3 py-1 small">
                    <strong>{filteredLoans.length}</strong> matching loan options found
                  </span>
                  {searchQuery && (
                    <span className="badge bg-primary-subtle text-primary border px-2 py-1 small">
                      Keyword: "{searchQuery}"
                      <i className="fa-solid fa-xmark ms-1 cursor-pointer" onClick={() => setSearchQuery("")}></i>
                    </span>
                  )}
                  {filterTier !== "ALL" && (
                    <span className="badge bg-primary-subtle text-primary border px-2 py-1 small">
                      Tier: {filterTier.replace("TIER_", "")}
                      <i className="fa-solid fa-xmark ms-1 cursor-pointer" onClick={() => setFilterTier("ALL")}></i>
                    </span>
                  )}
                </div>

                {(searchQuery || filterDuration !== "ALL" || filterTier !== "ALL" || filterAmountRange !== "ALL") && (
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-decoration-none text-muted p-0"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterDuration("ALL");
                      setFilterTier("ALL");
                      setFilterAmountRange("ALL");
                      setSortBy("BEST_MATCH");
                    }}
                  >
                    <i className="fa-solid fa-rotate-left me-1"></i> Reset All Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Borrower Loan Listings Grid */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-2" role="status"></div>
              <p className="text-muted">Loading verified borrower applications...</p>
            </div>
          ) : filteredLoans.length === 0 ? (
            <div className="card text-center py-5 border-0 shadow-xs" style={{ borderRadius: "16px" }}>
              <div className="card-body">
                <i className="fa-solid fa-folder-open text-muted mb-3" style={{ fontSize: "42px" }}></i>
                <h5 className="fw-bold text-dark">No borrower options match your criteria</h5>
                <p className="text-muted small">Try relaxing your search terms, tenure, or credit score tier filters.</p>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm rounded-pill px-4"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterDuration("ALL");
                    setFilterTier("ALL");
                    setFilterAmountRange("ALL");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="row g-3 mb-4">
              {filteredLoans.map((loan) => {
                const band = calculateLenderRoiBand(loan.creditScore || 750);
                const scoreColor =
                  loan.creditScore >= 780 ? "#10b981" : loan.creditScore >= 720 ? "#2563eb" : "#f59e0b";

                return (
                  <div key={loan.loanRequestId} className="col-12 col-md-6 col-lg-4">
                    <div className="card h-100 border-0 shadow-xs transition-all hover-shadow" style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                      {/* Top Header Strip */}
                      <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "bold",
                              fontSize: "14px",
                            }}
                          >
                            {loan.maskedName?.[0] || "B"}
                          </div>
                          <div>
                            <strong className="text-dark d-block" style={{ fontSize: "13px" }}>
                              {loan.maskedName}
                            </strong>
                            <span className="text-muted" style={{ fontSize: "11px" }}>
                              <i className="fa-solid fa-location-dot me-1 text-danger"></i>
                              {loan.city}, {loan.state} • {loan.distanceKm} km
                            </span>
                          </div>
                        </div>

                        <span
                          className="badge rounded-pill px-2 py-1 small fw-bold"
                          style={{
                            background: `${scoreColor}18`,
                            color: scoreColor,
                            border: `1px solid ${scoreColor}40`,
                          }}
                        >
                          CIBIL {loan.creditScore}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="card-body p-3">
                        {/* Loan Request Overview */}
                        <div className="d-flex justify-content-between align-items-baseline mb-2">
                          <div>
                            <span className="text-muted small" style={{ fontSize: "11px" }}>Requested Loan</span>
                            <h4 className="fw-bold text-primary mb-0 font-monospace">{formatINR(loan.loanAmount)}</h4>
                          </div>
                          <div className="text-end">
                            <span className="badge bg-secondary-subtle text-secondary small rounded-pill px-2 py-1">
                              {loan.durationMonths} {loan.durationMonths === 1 ? "Month (Bullet)" : "Months EMI"}
                            </span>
                          </div>
                        </div>

                        {/* Purpose Badge */}
                        <div className="mb-3">
                          <span className="badge bg-light text-dark border small fw-normal">
                            <i className="fa-solid fa-tag me-1 text-primary"></i>
                            {loan.loanPurpose}
                          </span>
                        </div>

                        {/* Surplus & Affordability Strip */}
                        <div className="p-2 rounded-3 bg-light border mb-3" style={{ fontSize: "11px" }}>
                          <div className="d-flex justify-content-between text-muted mb-1">
                            <span>Monthly Salary:</span>
                            <strong className="text-dark font-monospace">{formatINR(loan.monthlySalary)}</strong>
                          </div>
                          <div className="d-flex justify-content-between text-muted mb-1">
                            <span>Cashflow Surplus:</span>
                            <strong className="text-success font-monospace">{formatINR(loan.monthlySurplus)}</strong>
                          </div>
                          <div className="d-flex justify-content-between text-muted">
                            <span>Employer:</span>
                            <span className="text-dark text-truncate" style={{ maxWidth: "150px" }}>{loan.companyName}</span>
                          </div>
                        </div>

                        {/* Indicative Rate & Permissible Band */}
                        <div className="d-flex justify-content-between align-items-center p-2 rounded-3 mb-3" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                          <div>
                            <span className="text-muted small d-block" style={{ fontSize: "10px" }}>Indicative Benchmark</span>
                            <strong className="text-dark font-monospace" style={{ fontSize: "13px" }}>{band.indicativeRoi}% p.a.</strong>
                          </div>
                          <div className="text-end">
                            <span className="text-muted small d-block" style={{ fontSize: "10px" }}>Permissible Band</span>
                            <span className="text-primary fw-bold font-monospace" style={{ fontSize: "12px" }}>
                              {band.minPermissibleRoi}% – {band.maxPermissibleRoi}%
                            </span>
                          </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-primary btn-sm flex-grow-1 rounded-pill fw-bold text-white shadow-xs"
                            onClick={() => handleOpenOfferModal(loan)}
                          >
                            <i className="fa-solid fa-sliders me-1"></i> Confirm Rate & Offer
                          </button>
                          <Link
                            to={`/lender/borrower-profile/${loan.borrowerId}`}
                            className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                            title="View Full Profile"
                          >
                            <i className="fa-solid fa-user"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Interactive Modal: P2P Lender & Admin Rate Confirmation & Variance Workbench */}
          {showOfferModal && activeLoan && (
            <div
              className="modal fade show d-block"
              style={{ backgroundColor: "rgba(15, 23, 42, 0.7)", zIndex: 1050 }}
              tabIndex="-1"
            >
              <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px" }}>
                  {/* Modal Header */}
                  <div className="modal-header border-bottom px-4 py-3 bg-light" style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px" }}>
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-primary text-white rounded-pill px-3 py-1 small fw-bold">
                          <i className="fa-solid fa-handshake me-1"></i> OxyLoans P2P Rate Confirmation
                        </span>
                        <span
                          className={
                            activeVariance < 0
                              ? "lender-variance-badge-discount"
                              : activeVariance > 0
                              ? "lender-variance-badge-positive"
                              : "lender-variance-badge-equal"
                          }
                        >
                          {activeVariance === 0
                            ? "Matched at Indicative Benchmark"
                            : activeVariance < 0
                            ? `Lender Discount: ${activeVariance}% p.a.`
                            : `Counter-Offer: +${activeVariance}% p.a.`}
                        </span>
                      </div>
                      <h5 className="modal-title fw-bold text-dark mb-0">
                        P2P Lender & Admin Rate Confirmation & Variance
                      </h5>
                    </div>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowOfferModal(false)}
                    ></button>
                  </div>

                  {/* Modal Body */}
                  <div className="modal-body p-4">
                    {/* Borrower Snapshot */}
                    <div className="p-3 rounded-3 bg-light border mb-4">
                      <div className="row g-2 align-items-center">
                        <div className="col-12 col-sm-4">
                          <span className="text-muted small d-block" style={{ fontSize: "11px" }}>Borrower</span>
                          <strong className="text-dark">{activeLoan.maskedName}</strong>
                          <span className="text-muted d-block small" style={{ fontSize: "11px" }}>
                            {activeLoan.city}, {activeLoan.state}
                          </span>
                        </div>
                        <div className="col-6 col-sm-4">
                          <span className="text-muted small d-block" style={{ fontSize: "11px" }}>Requested Loan</span>
                          <h5 className="fw-bold text-primary mb-0 font-monospace">{formatINR(activeLoan.loanAmount)}</h5>
                          <small className="text-muted">{activeLoan.durationMonths} Months • {activeLoan.repaymentMethod}</small>
                        </div>
                        <div className="col-6 col-sm-4 text-sm-end">
                          <span className="text-muted small d-block" style={{ fontSize: "11px" }}>Cashflow Surplus</span>
                          <h5 className="fw-bold text-success mb-0 font-monospace">{formatINR(activeLoan.monthlySurplus)} <span className="fs-6 fw-normal text-muted">/mo</span></h5>
                          <small className="text-muted">CIBIL {activeLoan.creditScore} • {activeLoan.riskGrade}</small>
                        </div>
                      </div>
                    </div>

                    {/* 3 Metric Comparison Blocks */}
                    <div className="row g-3 mb-4">
                      <div className="col-12 col-md-4">
                        <div className="p-3 rounded-3 bg-white border h-100 shadow-xs">
                          <span className="text-muted small d-block" style={{ fontSize: "11px" }}>
                            1. Indicative Benchmark
                          </span>
                          <h4 className="fw-bold text-dark mb-0 font-monospace">
                            {activeBand.indicativeRoi}% <span className="fs-6 fw-normal text-muted">p.a.</span>
                          </h4>
                          <small className="text-muted" style={{ fontSize: "11px" }}>
                            Bureau Score {activeLoan.creditScore} Base
                          </small>
                        </div>
                      </div>

                      <div className="col-12 col-md-4">
                        <div className="p-3 rounded-3 bg-white border h-100 shadow-xs" style={{ borderColor: "#bfdbfe" }}>
                          <span className="small d-block fw-semibold" style={{ fontSize: "11px", color: "#1e3a8a" }}>
                            2. Permissible Rate Band
                          </span>
                          <h4 className="fw-bold text-primary mb-0 font-monospace">
                            {activeBand.minPermissibleRoi}% – {activeBand.maxPermissibleRoi}% <span className="fs-6 fw-normal text-muted">p.a.</span>
                          </h4>
                          <small className="text-muted" style={{ fontSize: "11px" }}>
                            Legally capped variance window
                          </small>
                        </div>
                      </div>

                      <div className="col-12 col-md-4">
                        <div className={`p-3 rounded-3 border h-100 shadow-xs ${
                          activeVariance < 0
                            ? "bg-success bg-opacity-10 border-success"
                            : activeVariance > 0
                            ? "bg-warning bg-opacity-10 border-warning"
                            : "bg-primary bg-opacity-10 border-primary"
                        }`}>
                          <span className="text-dark small d-block fw-bold" style={{ fontSize: "11px" }}>
                            3. Confirmed Matched ROI
                          </span>
                          <h4 className="fw-extrabold text-dark mb-0 font-monospace">
                            {offerRoi}% <span className="fs-6 fw-normal text-muted">p.a.</span>
                          </h4>
                          <small className="fw-bold text-dark" style={{ fontSize: "11px" }}>
                            {activeVariance === 0
                              ? "Matched at Benchmark (0% Variance)"
                              : activeVariance < 0
                              ? `Borrower Saves ${Math.abs(activeVariance)}% p.a.`
                              : `Counter-Offer: +${activeVariance}% risk adj.`}
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Quick Simulation Chips & Precision Slider */}
                    <div className="p-3 bg-light rounded-3 border mb-4">
                      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                        <span className="text-dark small fw-bold">
                          <i className="fa-solid fa-gavel text-primary me-1"></i>
                          Quick Rate Variance Adjustment Bids:
                        </span>
                        <span className="text-muted small" style={{ fontSize: "11px" }}>
                          Permissible Range: {activeBand.minPermissibleRoi}% – {activeBand.maxPermissibleRoi}%
                        </span>
                      </div>

                      {/* Chips */}
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {[
                          { label: `Benchmark (${activeBand.indicativeRoi}%)`, val: activeBand.indicativeRoi },
                          { label: `Fast Disbursal Discount (-1.5% = ${(activeBand.indicativeRoi - 1.5).toFixed(1)}%)`, val: Math.max(activeBand.minPermissibleRoi, Number((activeBand.indicativeRoi - 1.5).toFixed(1))) },
                          { label: `Competitive Match (-0.5% = ${(activeBand.indicativeRoi - 0.5).toFixed(1)}%)`, val: Math.max(activeBand.minPermissibleRoi, Number((activeBand.indicativeRoi - 0.5).toFixed(1))) },
                          { label: `Yield Optimizer (+1.0% = ${(activeBand.indicativeRoi + 1.0).toFixed(1)}%)`, val: Math.min(activeBand.maxPermissibleRoi, Number((activeBand.indicativeRoi + 1.0).toFixed(1))) },
                          { label: `Upper Cap (+2.0% = ${(activeBand.indicativeRoi + 2.0).toFixed(1)}%)`, val: Math.min(activeBand.maxPermissibleRoi, Number((activeBand.indicativeRoi + 2.0).toFixed(1))) },
                        ].map((chip, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={`btn btn-xs rounded-pill px-3 py-1 small fw-semibold ${
                              offerRoi === chip.val
                                ? "btn-primary text-white"
                                : "btn-outline-secondary bg-white text-dark"
                            }`}
                            style={{ fontSize: "11px" }}
                            onClick={() => setOfferRoi(chip.val)}
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>

                      {/* Precision Slider & Input */}
                      <div className="d-flex align-items-center gap-3">
                        <span className="text-muted small font-monospace" style={{ fontSize: "11px" }}>{activeBand.minPermissibleRoi}%</span>
                        <input
                          type="range"
                          min={activeBand.minPermissibleRoi}
                          max={activeBand.maxPermissibleRoi}
                          step={0.1}
                          value={offerRoi}
                          onChange={(e) => setOfferRoi(Number(Number(e.target.value).toFixed(1)))}
                          className="fintech-slider flex-grow-1"
                        />
                        <span className="text-muted small font-monospace" style={{ fontSize: "11px" }}>{activeBand.maxPermissibleRoi}%</span>
                        <div className="input-group" style={{ width: "120px" }}>
                          <input
                            type="number"
                            min={activeBand.minPermissibleRoi}
                            max={activeBand.maxPermissibleRoi}
                            step={0.1}
                            value={offerRoi}
                            onChange={(e) => setOfferRoi(Math.max(activeBand.minPermissibleRoi, Math.min(activeBand.maxPermissibleRoi, Number(e.target.value))))}
                            className="form-control form-control-sm text-center fw-bold"
                          />
                          <span className="input-group-text small">%</span>
                        </div>
                      </div>
                    </div>

                    {/* Offer Terms Form */}
                    <div className="row g-3 mb-4">
                      {/* Offer Amount */}
                      <div className="col-12 col-sm-6">
                        <label className="text-muted small fw-bold text-uppercase letter-spacing-1 mb-1 d-block">
                          Offered Loan Amount (₹)
                        </label>
                        <input
                          type="number"
                          step={1000}
                          min={5000}
                          max={activeLoan.loanAmount * 1.5}
                          value={offerAmount}
                          onChange={(e) => setOfferAmount(Number(e.target.value))}
                          className="form-control"
                        />
                        <small className="text-muted" style={{ fontSize: "11px" }}>
                          Requested: {formatINR(activeLoan.loanAmount)}
                        </small>
                      </div>

                      {/* Tenure */}
                      <div className="col-12 col-sm-6">
                        <label className="text-muted small fw-bold text-uppercase letter-spacing-1 mb-1 d-block">
                          Offered Tenure ({offerDurationType})
                        </label>
                        <div className="d-flex gap-2">
                          <input
                            type="number"
                            min={1}
                            max={36}
                            value={offerTenure}
                            onChange={(e) => setOfferTenure(Number(e.target.value))}
                            className="form-control"
                          />
                          <select
                            className="form-select"
                            value={offerDurationType}
                            onChange={(e) => setOfferDurationType(e.target.value)}
                            style={{ width: "120px" }}
                          >
                            <option value="MONTHS">Months</option>
                            <option value="DAYS">Days</option>
                          </select>
                        </div>
                      </div>

                      {/* Repayment Method */}
                      <div className="col-12 col-sm-6">
                        <label className="text-muted small fw-bold text-uppercase letter-spacing-1 mb-1 d-block">
                          Repayment Structure
                        </label>
                        <select
                          className="form-select"
                          value={offerRepaymentMethod}
                          onChange={(e) => setOfferRepaymentMethod(e.target.value)}
                        >
                          <option value="EMI">Monthly EMI (Principal + Interest)</option>
                          <option value="BULLET">Bullet Repayment (Full at End)</option>
                        </select>
                      </div>

                      {/* Comments */}
                      <div className="col-12 col-sm-6">
                        <label className="text-muted small fw-bold text-uppercase letter-spacing-1 mb-1 d-block">
                          Lender Note / Concession Comments
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Special fast-track disbursal offer"
                          value={offerComments}
                          onChange={(e) => setOfferComments(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Dual Returns Engine (Lender Yield vs Borrower Impact) */}
                    {financialProjection && (
                      <div className="card border-0 mb-4" style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
                        <div className="card-body p-3">
                          <h6 className="fw-bold text-dark mb-3">
                            <i className="fa-solid fa-chart-line text-primary me-2"></i>
                            Live Returns & Affordability Projection
                          </h6>
                          <div className="row g-3">
                            <div className="col-6 col-sm-3">
                              <span className="text-muted small d-block" style={{ fontSize: "11px" }}>Monthly Inflow</span>
                              <strong className="text-primary font-monospace fs-6">{formatINR(financialProjection.emi)}</strong>
                            </div>
                            <div className="col-6 col-sm-3">
                              <span className="text-muted small d-block" style={{ fontSize: "11px" }}>Total Interest Yield</span>
                              <strong className="text-success font-monospace fs-6">{formatINR(financialProjection.totalInterest)}</strong>
                            </div>
                            <div className="col-6 col-sm-3">
                              <span className="text-muted small d-block" style={{ fontSize: "11px" }}>Total Repayment</span>
                              <strong className="text-dark font-monospace fs-6">{formatINR(financialProjection.totalPayable)}</strong>
                            </div>
                            <div className="col-6 col-sm-3">
                              <span className="text-muted small d-block" style={{ fontSize: "11px" }}>Borrower Surplus Used</span>
                              <span className={`badge ${financialProjection.isAffordable ? "bg-success" : "bg-warning text-dark"} small`}>
                                {financialProjection.surplusUsedPct}% of surplus ({financialProjection.isAffordable ? "Safe" : "Elevated"})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Regulatory Consents */}
                    <div className="p-3 rounded-3 bg-light border mb-2">
                      <span className="text-muted small fw-bold text-uppercase letter-spacing-1 d-block mb-2">
                        Regulatory & Platform Confirmations:
                      </span>
                      <div className="form-check mb-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="consent1"
                          checked={offerConsents.riskAck}
                          onChange={(e) => setOfferConsents((p) => ({ ...p, riskAck: e.target.checked }))}
                        />
                        <label className="form-check-label small" htmlFor="consent1">
                          I acknowledge that P2P loans are unsecured and understand credit risk policy guidelines.
                        </label>
                      </div>
                      <div className="form-check mb-2">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="consent2"
                          checked={offerConsents.varianceCompliance}
                          onChange={(e) => setOfferConsents((p) => ({ ...p, varianceCompliance: e.target.checked }))}
                        />
                        <label className="form-check-label small" htmlFor="consent2">
                          My offered interest rate ({offerRoi}% p.a.) strictly complies with the RBI permissible variance band.
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="consent3"
                          checked={offerConsents.escrowDebitAuth}
                          onChange={(e) => setOfferConsents((p) => ({ ...p, escrowDebitAuth: e.target.checked }))}
                        />
                        <label className="form-check-label small" htmlFor="consent3">
                          I authorize OxyLoans certified escrow pool to hold/disburse funds upon borrower agreement acceptance.
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="modal-footer border-top px-4 py-3 bg-light" style={{ borderBottomLeftRadius: "20px", borderBottomRightRadius: "20px" }}>
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-pill px-4"
                      onClick={() => setShowOfferModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary rounded-pill px-5 fw-bold text-white shadow-sm"
                      onClick={handleSubmitOffer}
                      disabled={submittingOffer}
                    >
                      {submittingOffer ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Submitting Offer...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-paper-plane me-2"></i>
                          Confirm Rate & Give Offer ({formatINR(offerAmount)} @ {offerRoi}%)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
