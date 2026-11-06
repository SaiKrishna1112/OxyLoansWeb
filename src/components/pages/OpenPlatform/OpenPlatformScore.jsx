import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { MARKETPLACE_URL } from "../../../config";
import "./OpenPlatformScore.css";

const BASE = MARKETPLACE_URL + "/v1/public/open-platform";

const fmt = n => (n != null && n !== "" ? Number(n).toLocaleString("en-IN") : "–");
const inr = n => (n != null && Number(n) > 0 ? "₹" + Math.round(n).toLocaleString("en-IN") : "–");
const lakh = n => {
  if (n == null || Number(n) === 0) return "–";
  const v = Number(n);
  if (v >= 1e7) return "₹" + (v / 1e7).toFixed(2) + " Cr";
  return "₹" + (v / 1e5).toFixed(1) + " L";
};
const scoreColor = s => s >= 700 ? "var(--good)" : s >= 550 ? "var(--gold)" : "var(--bad)";
const stagePillClass = i => ["p-gold","p-brand","p-brand","p-warn","p-good","p-good"][i] || "p-brand";

const RANGES = [
  { label: "7 days", value: "7d" },
  { label: "15 days", value: "15d" },
  { label: "30 days", value: "30d" },
  { label: "6 months", value: "6m" },
  { label: "1 year", value: "1y" },
];

const STAGE_LABELS = [
  "Data collection","Just registered","Ready to borrow",
  "Commitment received","Loan executed","Loan closed",
];

function StatTile({ label, value, sub }) {
  return (
    <div className="ops-stat">
      <span className="ops-label">{label}</span>
      <b>{value}</b>
      {sub && <span className="ops-small ops-muted">{sub}</span>}
    </div>
  );
}

function SkeletonStats({ count = 4 }) {
  return (
    <div className="ops-stats">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="ops-stat ops-skeleton" style={{ height: 70 }} />
      ))}
    </div>
  );
}

export default function OpenPlatformScore() {
  const [summary, setSummary]       = useState(null);
  const [lenders, setLenders]       = useState(null);
  const [partners, setPartners]     = useState(null);
  const [recovery, setRecovery]     = useState(null);
  const [advocates, setAdvocates]   = useState(null);
  const [performance, setPerformance] = useState(null);

  // borrower section state
  const [range, setRange]           = useState("30d");
  const [stageFilter, setStageFilter] = useState(null);
  const [bPage, setBPage]           = useState(0);
  const [bStats, setBStats]         = useState(null);
  const [bFunnel, setBFunnel]       = useState(null);
  const [bRows, setBRows]           = useState([]);
  const [bTotal, setBTotal]         = useState(0);
  const [bLoading, setBLoading]     = useState(false);

  // load non-borrower sections on mount
  useEffect(() => {
    axios.get(`${BASE}/summary`).then(r => setSummary(r.data)).catch(() => {});
    axios.get(`${BASE}/lenders`).then(r => setLenders(r.data)).catch(() => {});
    axios.get(`${BASE}/partners`).then(r => setPartners(r.data)).catch(() => {});
    axios.get(`${BASE}/recovery`).then(r => setRecovery(r.data)).catch(() => {});
    axios.get(`${BASE}/advocates`).then(r => setAdvocates(r.data)).catch(() => {});
    axios.get(`${BASE}/performance`).then(r => setPerformance(r.data)).catch(() => {});
  }, []);

  // load borrower section when filter or page changes
  const fetchBorrowers = useCallback(() => {
    setBLoading(true);
    const params = { range, page: bPage };
    if (stageFilter !== null) params.stage = stageFilter;
    axios.get(`${BASE}/borrowers`, { params })
      .then(r => {
        const d = r.data;
        setBStats(d.stats);
        setBFunnel(d.funnel);
        setBTotal(d.totalRows || 0);
        setBRows(prev => bPage === 0 ? (d.rows || []) : [...prev, ...(d.rows || [])]);
        setBLoading(false);
      })
      .catch(() => setBLoading(false));
  }, [range, stageFilter, bPage]);

  useEffect(() => { fetchBorrowers(); }, [fetchBorrowers]);

  const handleRange = r => { setRange(r); setBPage(0); setBRows([]); };
  const handleStage = i => { setStageFilter(prev => prev === i ? null : i); setBPage(0); setBRows([]); };

  const pinsCovered = summary?.pinCodesCovered ?? 0;
  const totalPins   = summary?.totalPinCodes   ?? 11900;
  const asOf        = summary?.asOf || performance?.asOf || "";

  return (
    <div className="ops-page">
      {/* ── sticky nav ── */}
      <header className="ops-top">
        <div className="ops-wrap">
          <div className="ops-logo">Oxy<span>Loans</span> · Open Platform</div>
          <nav className="ops-nav" aria-label="Sections">
            <a href="#borrowers">Borrowers</a>
            <a href="#lenders">Lenders</a>
            <a href="#partners">Partners</a>
            <a href="#recovery">Recovery Agents</a>
            <a href="#advocates">Advocates</a>
            <a href="#performance">Loan Performance</a>
          </nav>
        </div>
      </header>

      <main className="ops-wrap ops-main">
        {/* ── HERO ── */}
        <section className="ops-panel ops-hero">
          <span className="ops-label">Open to everyone · no login needed</span>
          <h1 className="ops-hero-h">Every loan has a journey. <em>See all of it, in the open.</em></h1>
          <p className="ops-muted">OxyLoans is an RBI-registered NBFC-P2P platform. Five groups of people make it work. Here is what each of them is doing, updated daily.</p>

          <div className="ops-five">
            {summary?.elements?.length > 0
              ? summary.elements.map(el => (
                  <a key={el.letter} className="ops-el" href={el.href}>
                    <span className="ops-el-letter">{el.letter}</span>
                    <b>{fmt(el.count)}</b>
                    <span className="ops-small ops-muted">{el.name}</span>
                  </a>
                ))
              : [1,2,3,4,5].map(i => <div key={i} className="ops-el ops-skeleton" style={{ height: 76 }} />)
            }
          </div>

          <div className="ops-cover">
            <div className="ops-head">
              <span className="ops-small"><b>PIN codes covered by partners</b></span>
              <span className="ops-small ops-muted">{fmt(pinsCovered)} of {fmt(totalPins)}</span>
            </div>
            <div className="ops-bar">
              <i style={{ width: totalPins > 0 ? (pinsCovered / totalPins * 100) + "%" : "0%" }} />
            </div>
          </div>
        </section>

        {/* ── BORROWERS ── */}
        <section className="ops-panel" id="borrowers">
          <div className="ops-head">
            <div>
              <h2>Borrower journey</h2>
              <p className="ops-muted ops-small">Every borrower, from the day they register to the day their loan closes. Tap a stage to filter.</p>
            </div>
            <div className="ops-seg" role="group" aria-label="Registered in">
              {RANGES.map(r => (
                <button key={r.value} className={range === r.value ? "on" : ""}
                  onClick={() => handleRange(r.value)}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {bStats ? (
            <div className="ops-stats">
              <StatTile label="Borrowers registered" value={fmt(bStats.borrowersRegistered)} sub={`in the ${bStats.rangeLabel}`} />
              <StatTile label="Amount required" value={lakh(bStats.amountRequired)} sub="by borrowers not yet funded" />
              <StatTile label="Loans executed" value={fmt(bStats.loansExecuted)} sub={lakh(bStats.amountDisbursed) !== "–" ? lakh(bStats.amountDisbursed) + " disbursed" : ""} />
              <StatTile label="Average OxyScore" value={bStats.averageOxyScore > 0 ? bStats.averageOxyScore + " / 1000" : "–"} />
            </div>
          ) : <SkeletonStats />}

          {bFunnel && (
            <div className="ops-funnel">
              {bFunnel.map((s, i) => (
                <button key={i}
                  className={`ops-stage${stageFilter === i ? " on" : ""}`}
                  onClick={() => handleStage(i)}
                  aria-pressed={stageFilter === i}>
                  <span className="ops-stage-k">Stage {i + 1}</span>
                  <span className="ops-stage-n">{fmt(s.count)}</span>
                  <span className="ops-stage-s">{s.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="ops-tbl">
            <table>
              <thead>
                <tr>
                  <th>Borrower ID</th><th>City</th><th>OxyScore</th><th>Tenure</th>
                  <th className="num">Amount required</th><th>Employment</th>
                  <th>Journey</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bLoading && bRows.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", padding: 20, color: "var(--muted)" }}>Loading…</td></tr>
                ) : bRows.length > 0 ? bRows.map((b, i) => (
                  <tr key={i}>
                    <td className="ops-id">{b.id}</td>
                    <td>{b.city || "–"}</td>
                    <td>
                      <div className="ops-score">
                        <span>{b.oxyScore > 0 ? b.oxyScore + " / 1000" : "–"}</span>
                        {b.oxyScore > 0 && (
                          <div className="ops-bar ops-bar-sm">
                            <i style={{ width: (b.oxyScore / 10) + "%", background: scoreColor(b.oxyScore) }} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{b.tenure}</td>
                    <td className="num">{inr(b.amountRequired)}</td>
                    <td>{b.employment}</td>
                    <td>
                      <span className="ops-steps" aria-label={`Stage ${b.stageIndex + 1} of 6`}>
                        {STAGE_LABELS.map((_, si) => (
                          <i key={si} className={si < b.stageIndex ? "done" : si === b.stageIndex ? "now" : ""} />
                        ))}
                      </span>
                    </td>
                    <td><span className={`ops-pill ${stagePillClass(b.stageIndex)}`}>{b.status}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan={8} style={{ padding: 16, color: "var(--muted)" }}>No borrowers at this stage in this period.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {bRows.length < bTotal && (
            <div>
              <button className="ops-btn" onClick={() => setBPage(p => p + 1)} disabled={bLoading}>
                {bLoading ? "Loading…" : "Show more"}
              </button>
            </div>
          )}
        </section>

        {/* ── LENDERS ── */}
        <section className="ops-panel" id="lenders">
          <div className="ops-head">
            <div>
              <h2>Lenders</h2>
              <p className="ops-muted ops-small">People who lend to verified borrowers on OxyLoans.</p>
            </div>
          </div>
          {lenders ? (
            <div className="ops-stats">
              <StatTile label="Active lenders" value={fmt(lenders.stats.activeLenders)} />
              <StatTile label="Total lent" value={lakh(lenders.stats.totalLent)} sub="since 2016" />
              <StatTile label="Lending this month" value={lakh(lenders.stats.lendingThisMonth)} />
              <StatTile label="Average ticket" value={inr(lenders.stats.averageTicket)} />
            </div>
          ) : <SkeletonStats />}
        </section>

        {/* ── PARTNERS ── */}
        <section className="ops-panel" id="partners">
          <div className="ops-head">
            <div>
              <h2>Partners · PIN-code based</h2>
              <p className="ops-muted ops-small">Partners register by PIN code and grow the network in their area.</p>
            </div>
          </div>

          <div className="ops-tree" aria-label="A partner can invite">
            <span className="ops-chip ops-chip-root">Partner</span>
            <span className="ops-arrow">can invite →</span>
            {["Lender","Borrower","Recovery Agent","Advocate","Another Partner"].map(c => (
              <span key={c} className="ops-chip">{c}</span>
            ))}
          </div>

          {partners ? (
            <div className="ops-stats">
              <StatTile label="Total partners" value={fmt(partners.stats.totalPartners)} />
              <StatTile label="PIN codes covered"
                value={`${fmt(partners.stats.pinCodesCovered)} / ${fmt(partners.stats.totalPinCodes)}`}
                sub={partners.stats.totalPinCodes > 0
                  ? (partners.stats.pinCodesCovered / partners.stats.totalPinCodes * 100).toFixed(1) + "% of target"
                  : ""} />
              <StatTile label="Lenders brought in" value={fmt(partners.stats.lendersBroughtIn)} />
              <StatTile label="Investment via partners" value={lakh(partners.stats.investmentViaPartners)} />
            </div>
          ) : <SkeletonStats />}

          <div className="ops-cta">
            <div>
              <b>Your PIN code may not have a partner yet.</b>{" "}
              <span className="ops-muted ops-small">Partners invite lenders, borrowers, recovery agents and advocates, and earn on every one.</span>
            </div>
            <a className="ops-btn ops-btn-solid" href="https://www.askoxy.ai" target="_blank" rel="noopener noreferrer">
              Become a partner
            </a>
          </div>

          {partners?.rows?.length > 0 && (
            <div className="ops-tbl">
              <table>
                <thead>
                  <tr>
                    <th>Partner ID</th><th>Area</th>
                    <th className="num">Lenders</th><th className="num">Borrowers</th>
                    <th className="num">Total investment</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.rows.map((p, i) => (
                    <tr key={i}>
                      <td className="ops-id">{p.partnerId}</td>
                      <td>{p.area}</td>
                      <td className="num">{fmt(p.lenders)}</td>
                      <td className="num">{fmt(p.borrowers)}</td>
                      <td className="num">{lakh(p.totalInvestment)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── RECOVERY AGENTS ── */}
        <section className="ops-panel" id="recovery">
          <div className="ops-head">
            <div>
              <h2>Recovery Agents</h2>
              <p className="ops-muted ops-small">For the first 30 days after an EMI is missed, the OXY AI system calls the borrower. After 30 days, a recovery agent in the borrower's area takes over.</p>
            </div>
          </div>
          {recovery == null
            ? <div className="ops-skeleton" style={{ height: 60 }} />
            : recovery.stats.totalAgents > 0 ? (
              <>
                <div className="ops-stats">
                  <StatTile label="Total recovery agents" value={fmt(recovery.stats.totalAgents)} />
                  <StatTile label="Amount allocated" value={lakh(recovery.stats.allocatedToAgents)} />
                  <StatTile label="Amount recovered" value={lakh(recovery.stats.recoveredByAgents)} />
                </div>
                {recovery.dataNote && <p className="ops-small ops-muted">{recovery.dataNote}</p>}
                {recovery.rows?.length > 0 && (
                  <div className="ops-tbl">
                    <table>
                      <thead>
                        <tr>
                          <th>Agent ID</th><th>Location</th>
                          <th className="num">Cases allocated</th><th className="num">Amount allocated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recovery.rows.map((r, i) => (
                          <tr key={i}>
                            <td className="ops-id">{r.agentId}</td>
                            <td>{r.location}</td>
                            <td className="num">{fmt(r.casesAllocated)}</td>
                            <td className="num">{lakh(r.amountAllocated)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <div className="ops-growing">
                <b>Growing — recovery agents are being onboarded</b>
                <p className="ops-muted ops-small">OXY AI handles overdue EMIs in the first 30 days. Recovery agents join as the platform scales to new PIN codes.</p>
              </div>
            )
          }
        </section>

        {/* ── ADVOCATES ── */}
        <section className="ops-panel" id="advocates">
          <div className="ops-head">
            <div>
              <h2>Advocates</h2>
              <p className="ops-muted ops-small">Lawyers who take a case through three stages for lenders: legal notice, court filing and court hearings.</p>
            </div>
          </div>
          {advocates == null
            ? <div className="ops-skeleton" style={{ height: 60 }} />
            : advocates.stats.totalAdvocates > 0 ? (
              <>
                <div className="ops-stats">
                  <StatTile label="Total advocates" value={fmt(advocates.stats.totalAdvocates)} />
                </div>
                {advocates.dataNote && <p className="ops-small ops-muted">{advocates.dataNote}</p>}
              </>
            ) : (
              <div className="ops-growing">
                <b>Growing — advocates are being onboarded</b>
                <p className="ops-muted ops-small">Legal representation is available for escalated cases. Advocates join as the platform scales to new areas.</p>
              </div>
            )
          }
        </section>

        {/* ── LOAN PERFORMANCE ── */}
        <section className="ops-panel" id="performance">
          <div className="ops-head">
            <div>
              <h2>Loan performance</h2>
              <p className="ops-muted ops-small">What happens after a loan is executed, by the year it was disbursed.</p>
            </div>
          </div>
          {performance == null
            ? <SkeletonStats />
            : (
              <>
                <div className="ops-stats">
                  <StatTile label="Loans executed" value={fmt(performance.stats.totalLoansExecuted)} sub="since 2019" />
                  <StatTile label="Amount disbursed" value={lakh(performance.stats.totalAmountDisbursed)} />
                  <StatTile label="Loans closed" value={fmt(performance.stats.totalLoansClosed)} />
                  <StatTile label="Overdue 90+ days" value={performance.stats.overdue90PlusPct + "%"} sub="of all loans disbursed" />
                </div>
                <div className="ops-legend">
                  <span style={{ "--c": "var(--good)" }}>Closed</span>
                  <span style={{ "--c": "var(--brand)" }}>Running, on time</span>
                  <span style={{ "--c": "var(--warn)" }}>Overdue under 90 days</span>
                  <span style={{ "--c": "var(--bad)" }}>Overdue 90+ days</span>
                </div>
                <div className="ops-perf">
                  {performance.byYear.map(py => (
                    <div key={py.year} className="ops-yr">
                      <b>{py.year}</b>
                      <div className="ops-split" role="img"
                        aria-label={`${py.year}: ${py.closedPct}% closed, ${py.ontimePct}% on time, ${py.overdueLt90Pct}% overdue <90d, ${py.overdue90pPct}% overdue 90d+`}>
                        <i style={{ width: py.closedPct + "%",      background: "var(--good)" }} />
                        <i style={{ width: py.ontimePct + "%",      background: "var(--brand)" }} />
                        <i style={{ width: py.overdueLt90Pct + "%", background: "var(--warn)" }} />
                        <i style={{ width: py.overdue90pPct + "%",  background: "var(--bad)" }} />
                      </div>
                      <span className="ops-small ops-muted">{fmt(py.loans)} loans</span>
                    </div>
                  ))}
                </div>
              </>
            )
          }
        </section>

        {/* ── FOOTER ── */}
        <div className="ops-foot">
          <span>OxyLoans is registered with the RBI as an NBFC-P2P. Lending on P2P platforms carries risk, including loss of principal. Past performance does not guarantee future results.</span>
          {asOf && <span>Figures as of {asOf}</span>}
        </div>
      </main>
    </div>
  );
}
