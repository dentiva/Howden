import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, ReferenceLine,
} from 'recharts';
import {
  Search, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2,
  XCircle, Send, MessageSquare, ArrowLeft, Sparkles, LogOut, Shield, Briefcase, Building2, FileText, Target,
  Clock, ChevronRight, Loader2, X, Users, History, MapPin, Layers,
  ShieldCheck, FileSearch, Plus, ArrowUpRight, Hexagon, Info, UserCheck, Lock, CircleDollarSign, Copy,
  Link2, ClipboardList, BookOpen, ThumbsUp, ThumbsDown, Rocket, Activity,
  ArrowUp, Ban, Wand2,
} from 'lucide-react';

/* ============================================================
   TOKENS AND GLOBAL STYLES
   ============================================================ */

const FontAndTokens = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    :root {
      --canvas: #FBFAF6;
      --canvas-2: #F4F1EA;
      --ink: #0B1220;
      --ink-2: #334155;
      --ink-3: #64748B;
      --ink-4: #94A3B8;
      --hair: rgba(15,23,42,0.08);
      --hair-2: rgba(15,23,42,0.04);
      --surface: #FFFFFF;
      --glass: rgba(255,255,255,0.72);
      --brand: #0B3B5C;
      --brand-2: #1E5A8A;
      --brand-soft: #E7EEF5;
      --emerald: #047857;
      --emerald-2: #10B981;
      --emerald-soft: #ECFDF5;
      --rose: #BE123C;
      --rose-2: #F43F5E;
      --rose-soft: #FFF1F2;
      --amber: #B45309;
      --amber-soft: #FEF3C7;
      --gold: #A67C2E;
    }

    .app-root {
      font-family: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--ink);
      background: var(--canvas);
      font-feature-settings: 'ss01','ss02','cv11';
      -webkit-font-smoothing: antialiased;
    }
    .font-display { font-family: 'Fraunces', Georgia, serif; font-optical-sizing: auto; letter-spacing: -0.02em; }
    .font-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
    .tabular { font-variant-numeric: tabular-nums; }

    .glass {
      background: var(--glass);
      backdrop-filter: blur(18px) saturate(1.1);
      -webkit-backdrop-filter: blur(18px) saturate(1.1);
      border: 1px solid var(--hair);
    }
    .hairline { border: 1px solid var(--hair); }
    .hairline-t { border-top: 1px solid var(--hair); }
    .hairline-b { border-bottom: 1px solid var(--hair); }
    .hairline-l { border-left: 1px solid var(--hair); }

    .canvas-noise {
      background-image:
        radial-gradient(1200px 600px at 0% -10%, rgba(11,59,92,0.05), transparent 60%),
        radial-gradient(900px 500px at 100% 0%, rgba(176,135,68,0.05), transparent 60%),
        var(--canvas);
    }

    .tile-pop { transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
    .tile-pop:hover { transform: translateY(-2px); box-shadow: 0 18px 40px -20px rgba(11,18,32,0.18); border-color: rgba(15,23,42,0.16); }

    .fade-up { animation: fadeUp .5s cubic-bezier(.2,.7,.2,1) both; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

    .stagger > * { animation: fadeUp .5s cubic-bezier(.2,.7,.2,1) both; }
    .stagger > *:nth-child(1) { animation-delay: .02s; }
    .stagger > *:nth-child(2) { animation-delay: .06s; }
    .stagger > *:nth-child(3) { animation-delay: .10s; }
    .stagger > *:nth-child(4) { animation-delay: .14s; }
    .stagger > *:nth-child(5) { animation-delay: .18s; }
    .stagger > *:nth-child(6) { animation-delay: .22s; }
    .stagger > *:nth-child(7) { animation-delay: .26s; }
    .stagger > *:nth-child(8) { animation-delay: .30s; }
    .stagger > *:nth-child(9) { animation-delay: .34s; }
    .stagger > *:nth-child(10) { animation-delay: .38s; }

    .scrollbar-slim::-webkit-scrollbar { width: 6px; height: 6px; }
    .scrollbar-slim::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.15); border-radius: 999px; }
    .scrollbar-slim::-webkit-scrollbar-track { background: transparent; }

    .chip {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 3px 9px; border-radius: 999px;
      font-size: 11px; font-weight: 500; letter-spacing: 0.01em;
      border: 1px solid var(--hair);
    }

    .score-gauge { transform: rotate(-90deg); }

    .markdown p { margin: 0 0 8px 0; }
    .markdown p:last-child { margin-bottom: 0; }
    .markdown strong { font-weight: 600; color: var(--ink); }
    .markdown ul { margin: 6px 0 8px 0; padding-left: 18px; }
    .markdown li { margin-bottom: 3px; }
    .markdown code { background: rgba(15,23,42,0.06); padding: 1px 5px; border-radius: 4px; font-size: 0.9em; font-family: 'JetBrains Mono', monospace; }

    .prose p { margin: 0 0 14px 0; line-height: 1.65; color: var(--ink-2); font-size: 14px; }
    .prose h2 { font-family: 'Fraunces', serif; font-size: 22px; font-weight: 500; margin: 28px 0 10px 0; color: var(--ink); letter-spacing: -0.01em; }
    .prose h3 { font-family: 'Fraunces', serif; font-size: 16.5px; font-weight: 500; margin: 18px 0 8px 0; color: var(--ink); }
    .prose ul { margin: 0 0 14px 0; padding-left: 20px; color: var(--ink-2); font-size: 14px; line-height: 1.65; }
    .prose li { margin-bottom: 6px; }
    .prose li strong { font-weight: 600; color: var(--ink); }
    .prose .formula-block { background: var(--canvas-2); border: 1px solid var(--hair); border-radius: 8px; padding: 14px 16px; margin: 10px 0 16px 0; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 12px; line-height: 1.7; color: var(--ink-2); white-space: pre-wrap; }
    .prose table { width: 100%; border-collapse: collapse; font-size: 12.5px; margin: 8px 0 16px 0; }
    .prose th, .prose td { text-align: left; padding: 7px 10px; border-bottom: 1px solid var(--hair); color: var(--ink-2); }
    .prose th { font-weight: 600; color: var(--ink); font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.05em; background: var(--canvas-2); }
    .prose td.tab { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; }

    button { cursor: pointer; }
    button:disabled { cursor: not-allowed; opacity: 0.6; }
  `}</style>
);

/* ============================================================
   UTILITIES
   ============================================================ */

const formatINR = (amt, compact = true) => {
  if (amt == null || isNaN(amt)) return '\u2014';
  if (!compact) return '\u20B9' + amt.toLocaleString('en-IN');
  if (amt >= 1e7) return `\u20B9${(amt / 1e7).toFixed(2)} Cr`;
  if (amt >= 1e5) return `\u20B9${(amt / 1e5).toFixed(1)} L`;
  return `\u20B9${amt.toLocaleString('en-IN')}`;
};

const daysBetween = (iso) => {
  const d = new Date(iso); const now = new Date();
  return Math.round((d - now) / (1000 * 60 * 60 * 24));
};

const scoreTone = (s) => {
  if (s >= 75) return { label: 'High', fg: 'var(--emerald)', bg: 'var(--emerald-soft)' };
  if (s >= 55) return { label: 'Medium', fg: 'var(--amber)', bg: 'var(--amber-soft)' };
  return { label: 'Low', fg: 'var(--rose)', bg: 'var(--rose-soft)' };
};


const trendIcon = (t) => t === 'up' ? TrendingUp : t === 'down' ? TrendingDown : Minus;
const trendColor = (t) => t === 'up' ? 'var(--rose)' : t === 'down' ? 'var(--emerald)' : 'var(--ink-3)';

const canPitchExpansion = (client) => !client.guardrails.some(g => g.status === 'fail');

const computePotentialFromGaps = (client) => {
  if (!canPitchExpansion(client)) return 0;
  const offers = client.policyRecommendations?.offer || [];
  return offers.reduce((sum, r) => sum + (r.estPremium || 0), 0);
};

// Attractiveness scoring.
// Derived at render time from the raw facts on the client record. The formula is
// deliberately simple and additive so that it can be explained on the About page
// and defended to a stakeholder. Returns both the final 0-100 score and the
// component breakdown, so callers can show the working.
const computeAttractivenessComponents = (client) => {
  const lr = client.lossRatio;
  const g = client.growth3Y;
  const trend = client.claimsTrend;
  const gaps = (client.gaps || []).length;
  const fails = (client.guardrails || []).filter(r => r.status === 'fail').length;
  const warns = (client.guardrails || []).filter(r => r.status === 'warn').length;
  const offers = ((client.policyRecommendations || {}).offer || []).length;

  const base = 50;
  let lrPts;
  if (lr < 45) lrPts = 18;
  else if (lr < 55) lrPts = 8;
  else if (lr < 60) lrPts = 0;
  else if (lr < 65) lrPts = -10;
  else lrPts = -16;
  let gPts;
  if (g < 10) gPts = 0;
  else if (g < 20) gPts = 6;
  else if (g < 30) gPts = 12;
  else gPts = 16;
  const tPts = trend === 'down' ? 6 : trend === 'up' ? -6 : 0;
  const gapPts = Math.min(gaps * 2, 8);
  const grPts = fails * -14 + warns * -3;
  const offPts = Math.min(offers * 2, 6);
  const raw = base + lrPts + gPts + tPts + gapPts + grPts + offPts;
  const score = Math.max(0, Math.min(100, raw));
  return { score, base, lrPts, gPts, tPts, gapPts, grPts, offPts, raw };
};

const computeAttractivenessScore = (client) => computeAttractivenessComponents(client).score;

/* ============================================================
   MOCK DATA: BROKERS AND CLIENTS
   ============================================================ */

const BROKERS = [
  {
    id: 'priya', name: 'Priya Sharma',
    title: 'Senior Relationship Manager',
    region: 'West and South India',
    initials: 'PS', tone: '#0B3B5C',
  },
  {
    id: 'rahul', name: 'Rahul Desai',
    title: 'Relationship Manager',
    region: 'North India and Hyderabad',
    initials: 'RD', tone: '#A67C2E',
  },
];

const CLIENTS = [
  {
    id: 'bhil', broker: 'priya',
    name: 'Bharat Heavy Industries Ltd',
    industry: 'Heavy Manufacturing', sector: 'Industrial',
    city: 'Mumbai', state: 'MH',
    revenue: 34500000000, employees: 6200,
    premium: 38500000, lossRatio: 42, claimsTrend: 'down',
    renewalDate: '2026-07-14',
    currentCoverages: ['Property and Fire', 'Marine Cargo', 'Workmen\u2019s Compensation', 'Group Health', 'Public Liability', 'Business Interruption', 'Product Liability'],
    gaps: ['Cyber Liability', 'Directors and Officers Liability', 'Trade Credit'],
    growth3Y: 18,
    premiumHistory: [{ y: '22', v: 2.6 }, { y: '23', v: 2.95 }, { y: '24', v: 3.35 }, { y: '25', v: 3.85 }],
    claimsHistory: [{ y: '22', n: 11, amt: 0.9 }, { y: '23', n: 9, amt: 1.2 }, { y: '24', n: 7, amt: 0.8 }, { y: '25', n: 6, amt: 0.6 }],
    guardrails: [
      { rule: 'Loss ratio must be below 60 percent before expansion is pitched', status: 'pass', detail: 'Loss ratio is 42 percent, which sits well within the threshold.' },
      { rule: 'No open claims above 5 Crore Rupees', status: 'pass', detail: 'The largest open claim is 1.4 Crore Rupees and relates to mechanical breakdown.' },
      { rule: 'Compliance and sanctions screening must be current', status: 'pass', detail: 'The last screening was cleared on 12 February 2026.' },
      { rule: 'Credit rating must be at least BBB', status: 'pass', detail: 'The current CRISIL rating is AA minus with a stable outlook.' },
    ],
    evidence: [
      { src: 'Internal Policy Register', note: 'Seven active policies with the last endorsement recorded on 3 March 2026.' },
      { src: 'Claims Data Warehouse', note: 'Loss ratio smoothed across four policy years to remove seasonality.' },
      { src: 'General Insurance Council Benchmarks for FY25', note: 'Directors and officers penetration in heavy manufacturing is approximately 38 percent. The client currently has no cover in place.' },
      { src: 'Client Annual Report FY25', note: 'Capital expenditure guidance of 820 Crore Rupees is stated for the Pune facility expansion.' },
    ],
    policyRecommendations: {
      offer: [
        { product: 'Directors and Officers Liability', type: 'cross-sell', confidence: 'high', estPremium: 3500000, reason: 'Capital expansion of 820 Crore Rupees brings board exposure into scope, and directors cover penetration in heavy manufacturing is approximately 38 percent.' },
        { product: 'Cyber Liability', type: 'cross-sell', confidence: 'high', estPremium: 2800000, reason: 'The client operates connected operational technology across three plants with no standalone cyber cover in place.' },
        { product: 'Trade Credit', type: 'cross-sell', confidence: 'medium', estPremium: 3500000, reason: 'Export receivables of approximately 210 Crore Rupees remain uninsured against buyer default.' },
      ],
      doNotOffer: [
        { product: 'Increased property sub-limits', reason: 'Premium for property is already concentrated and the client has indicated resistance to further property loading this cycle.', blocker: 'relationship' },
      ],
    },
    narrative: 'This is a long tenured industrial account with a strong technical profile. The recent expansion programme is likely to create demand for additional covers over the next two quarters.',
  },
  {
    id: 'shakti', broker: 'priya',
    name: 'Shakti Pharmaceuticals Pvt Ltd',
    industry: 'Pharmaceuticals', sector: 'Healthcare',
    city: 'Hyderabad', state: 'TG',
    revenue: 12800000000, employees: 2400,
    premium: 21400000, lossRatio: 58, claimsTrend: 'up',
    renewalDate: '2026-05-22',
    currentCoverages: ['Property and Fire', 'Product Liability', 'Group Health', 'Marine Cargo', 'Workmen\u2019s Compensation'],
    gaps: ['Cyber Liability', 'Clinical Trials Liability', 'Directors and Officers Liability'],
    growth3Y: 22,
    premiumHistory: [{ y: '22', v: 1.3 }, { y: '23', v: 1.6 }, { y: '24', v: 1.9 }, { y: '25', v: 2.14 }],
    claimsHistory: [{ y: '22', n: 4, amt: 0.4 }, { y: '23', n: 5, amt: 0.7 }, { y: '24', n: 7, amt: 1.1 }, { y: '25', n: 9, amt: 1.3 }],
    guardrails: [
      { rule: 'Loss ratio must be below 60 percent before expansion is pitched', status: 'warn', detail: 'Loss ratio is 58 percent. This is within two points of the threshold, and caution is advised before proposing any expansion.' },
      { rule: 'No open claims above 5 Crore Rupees', status: 'pass', detail: 'The largest open claim is 2.1 Crore Rupees under product liability.' },
      { rule: 'Cyber risk class must be medium or lower', status: 'warn', detail: 'The client handles protected health information and research intellectual property, so the risk class remains high until cyber cover is bound.' },
      { rule: 'Compliance and sanctions screening must be current', status: 'pass', detail: 'The last screening was cleared on 18 January 2026.' },
    ],
    evidence: [
      { src: 'Claims Data Warehouse', note: 'There were nine claims in FY25 compared with five in FY23.' },
      { src: 'General Insurance Council Benchmarks for FY25', note: 'Average loss ratio across Indian pharmaceutical peers is 46 percent.' },
      { src: 'Regulatory Filings', note: 'A USFDA pre-approval inspection is scheduled in the second quarter of FY26.' },
      { src: 'Industry News Feed', note: 'A ransomware incident was reported at a comparable Hyderabad company in February 2026.' },
    ],
    policyRecommendations: {
      offer: [
        { product: 'Cyber Liability', type: 'cross-sell', confidence: 'high', estPremium: 2800000, reason: 'The client handles protected health information and research intellectual property, and a peer in the same city faced a ransomware attempt last month.' },
        { product: 'Clinical Trials Liability', type: 'cross-sell', confidence: 'high', estPremium: 2200000, reason: 'The upcoming USFDA inspection and active trial pipeline place indemnity obligations on the sponsor that are not currently covered.' },
      ],
      doNotOffer: [
        { product: 'Directors and Officers Liability', reason: 'Loss ratio is within two points of the 60 percent guardrail, and the claims trend is upward. Proposing additional covers now would invite pushback before the claims position stabilises.', blocker: 'guardrail' },
        { product: 'Additional property line loading', reason: 'Three open claims under property are in late-stage assessment, and asking the client to expand the same line today would damage the relationship.', blocker: 'relationship' },
      ],
    },
    narrative: 'The growth story here is still intact, but the underwriting signals have started to soften. Any pitch in the coming quarter should lead with risk mitigation rather than with price discussions.',
  },
  {
    id: 'sundaram', broker: 'priya',
    name: 'Sundaram Logistics and Shipping',
    industry: 'Logistics and Shipping', sector: 'Transport',
    city: 'Chennai', state: 'TN',
    revenue: 8200000000, employees: 1850,
    premium: 15600000, lossRatio: 71, claimsTrend: 'up',
    renewalDate: '2026-06-03',
    currentCoverages: ['Marine Cargo', 'Marine Hull', 'Property and Fire', 'Workmen\u2019s Compensation', 'Public Liability'],
    gaps: ['Cyber Liability', 'Trade Credit', 'Directors and Officers Liability'],
    growth3Y: 9,
    premiumHistory: [{ y: '22', v: 1.1 }, { y: '23', v: 1.3 }, { y: '24', v: 1.45 }, { y: '25', v: 1.56 }],
    claimsHistory: [{ y: '22', n: 8, amt: 0.9 }, { y: '23', n: 11, amt: 1.6 }, { y: '24', n: 13, amt: 2.2 }, { y: '25', n: 16, amt: 2.8 }],
    guardrails: [
      { rule: 'Loss ratio must be below 60 percent before expansion is pitched', status: 'fail', detail: 'Loss ratio is 71 percent and now exceeds the retention limits. Expansion proposals are therefore blocked until the portfolio is remediated.' },
      { rule: 'No open claims above 5 Crore Rupees', status: 'warn', detail: 'There is an open marine hull claim of 3.9 Crore Rupees still under investigation.' },
      { rule: 'Insurer appetite for the class must remain open', status: 'warn', detail: 'Several domestic insurers have communicated reduced appetite for marine hull risks this quarter.' },
      { rule: 'Compliance and sanctions screening must be current', status: 'pass', detail: 'The last screening was cleared on 22 February 2026.' },
    ],
    evidence: [
      { src: 'Claims Data Warehouse', note: 'Incurred losses in FY25 were 2.8 Crore Rupees.' },
      { src: 'Placement desk feedback', note: 'Multiple domestic insurers have signalled reduced marine hull appetite for the current quarter.' },
      { src: 'Underwriting file note', note: 'Additional premium loading for Red Sea and Gulf of Aden transits has been applied by the lead insurer since November 2024.' },
    ],
    policyRecommendations: {
      offer: [
        { product: 'Risk engineering and claims remediation review', type: 'remediation', confidence: 'high', estPremium: 0, reason: 'Loss ratio at 71 percent has failed the expansion guardrail. The only commercial conversation that makes sense in this state is a structured remediation plan to bring the portfolio back within appetite.' },
      ],
      doNotOffer: [
        { product: 'Any expansion of cover at this renewal', reason: 'Loss ratio of 71 percent breaches the retention threshold. Expansion pitches are blocked by the guardrail engine until the portfolio is remediated.', blocker: 'guardrail' },
        { product: 'Trade Credit', reason: 'The client declined a trade credit proposal in 2025 and procurement posture has not changed.', blocker: 'past-rejection' },
        { product: 'New marine hull capacity', reason: 'Several domestic insurers have signalled reduced marine hull appetite this quarter, so placing additional capacity will be difficult at this time.', blocker: 'appetite' },
        { product: 'Directors and Officers Liability', reason: 'The account cannot carry additional premium load until the claims position is corrected and the loss ratio has returned below the threshold.', blocker: 'guardrail' },
      ],
    },
    narrative: 'This account needs to be retained before it can be expanded. The immediate focus should be on claims remediation, price correction, and risk engineering, rather than on writing any additional lines.',
  },
  {
    id: 'meridian', broker: 'priya',
    name: 'Meridian Textiles Ltd',
    industry: 'Textiles and Apparel', sector: 'Consumer Manufacturing',
    city: 'Ahmedabad', state: 'GJ',
    revenue: 5600000000, employees: 3100,
    premium: 9800000, lossRatio: 51, claimsTrend: 'flat',
    renewalDate: '2026-08-29',
    currentCoverages: ['Property and Fire', 'Marine Cargo', 'Workmen\u2019s Compensation', 'Group Health', 'Business Interruption'],
    gaps: ['Cyber Liability', 'Trade Credit', 'Product Liability'],
    growth3Y: 14,
    premiumHistory: [{ y: '22', v: 0.7 }, { y: '23', v: 0.82 }, { y: '24', v: 0.92 }, { y: '25', v: 0.98 }],
    claimsHistory: [{ y: '22', n: 3, amt: 0.3 }, { y: '23', n: 4, amt: 0.5 }, { y: '24', n: 4, amt: 0.5 }, { y: '25', n: 3, amt: 0.4 }],
    guardrails: [
      { rule: 'Loss ratio must be below 60 percent before expansion is pitched', status: 'pass', detail: 'Loss ratio is 51 percent, a comfortable margin below the threshold.' },
      { rule: 'Sum insured adequacy must be checked annually', status: 'pass', detail: 'Valuation was reviewed in January 2026 and is within five percent of book value.' },
      { rule: 'Compliance and sanctions screening must be current', status: 'pass', detail: 'The last screening was cleared.' },
    ],
    evidence: [
      { src: 'Client Financial Statements FY25', note: 'Export receivables amount to 480 Crore Rupees and remain substantially uninsured.' },
      { src: 'Industry Benchmarks', note: 'Approximately 61 percent of textile peers hold trade credit cover.' },
      { src: 'Internal Risk Survey', note: 'The fire risk score has improved to B plus after the recent site upgrades.' },
    ],
    policyRecommendations: {
      offer: [
        { product: 'Trade Credit', type: 'cross-sell', confidence: 'high', estPremium: 1800000, reason: 'Export receivables have reached 480 Crore Rupees, and approximately 61 percent of textile peers already hold trade credit cover.' },
        { product: 'Product Liability', type: 'cross-sell', confidence: 'medium', estPremium: 600000, reason: 'Branded apparel exports to the United States and Europe expose the client to product liability claims that are not currently covered.' },
        { product: 'Cyber Liability', type: 'cross-sell', confidence: 'medium', estPremium: 600000, reason: 'Limited but growing direct to consumer online channel introduces data exposure that does not yet have cover.' },
      ],
      doNotOffer: [],
    },
    narrative: 'The existing portfolio is modest but very clean, and the size of the uninsured export receivables creates a clear opportunity for a trade credit proposal.',
  },
  {
    id: 'acharya', broker: 'priya',
    name: 'Acharya TechSoft Systems',
    industry: 'Information Technology Services', sector: 'Technology',
    city: 'Bengaluru', state: 'KA',
    revenue: 18900000000, employees: 8400,
    premium: 17200000, lossRatio: 34, claimsTrend: 'flat',
    renewalDate: '2026-05-11',
    currentCoverages: ['Professional Indemnity', 'Cyber Liability', 'Group Health', 'Group Term Life', 'Workmen\u2019s Compensation', 'Directors and Officers Liability'],
    gaps: ['Crime and Fidelity', 'Employment Practices Liability'],
    growth3Y: 26,
    premiumHistory: [{ y: '22', v: 0.95 }, { y: '23', v: 1.25 }, { y: '24', v: 1.5 }, { y: '25', v: 1.72 }],
    claimsHistory: [{ y: '22', n: 2, amt: 0.1 }, { y: '23', n: 3, amt: 0.2 }, { y: '24', n: 2, amt: 0.2 }, { y: '25', n: 2, amt: 0.15 }],
    guardrails: [
      { rule: 'Loss ratio must be below 60 percent before expansion is pitched', status: 'pass', detail: 'Loss ratio is 34 percent, which is in the strongest band.' },
      { rule: 'Cyber exposure must be adequately covered', status: 'pass', detail: 'Cyber limits were raised to 50 Crore Rupees in FY25.' },
      { rule: 'Compliance and sanctions screening must be current', status: 'pass', detail: 'The last screening was cleared on 29 January 2026.' },
      { rule: 'No open disputes on professional indemnity', status: 'pass', detail: 'There are no notified circumstances at present.' },
    ],
    evidence: [
      { src: 'Internal Policy Register', note: 'Six active policies with a coordinated renewal cycle.' },
      { src: 'Client Annual Report FY25', note: 'A United States subsidiary was incorporated in Delaware in October 2025.' },
      { src: 'Industry Benchmarks', note: 'Around 74 percent of Indian technology peers carry employment practices cover, and this rises to 91 percent for those with US operations.' },
    ],
    policyRecommendations: {
      offer: [
        { product: 'Employment Practices Liability', type: 'cross-sell', confidence: 'high', estPremium: 1100000, reason: 'A United States subsidiary was incorporated in Delaware in October 2025. Employment practices cover penetration among Indian technology peers with US operations is 91 percent.' },
        { product: 'Crime and Fidelity', type: 'cross-sell', confidence: 'medium', estPremium: 600000, reason: 'A workforce of 8,400 across multiple locations creates internal fraud exposure that the current programme does not address.' },
      ],
      doNotOffer: [
        { product: 'Late-addition cover proposals for this renewal cycle', reason: 'The coordinated renewal cycle begins in 19 days. Introducing a new cover now risks a rushed placement, so any recommendation beyond Employment Practices should be scheduled for the subsequent cycle.', blocker: 'timing' },
      ],
    },
    narrative: 'This is a flagship account. The renewal window is tight, but the pitch for employment practices liability cover arising from the new United States subsidiary is narrow, specific, and straightforward to defend.',
  },
  {
    id: 'kaveri', broker: 'rahul',
    name: 'Kaveri BioSciences Ltd',
    industry: 'Biotechnology', sector: 'Healthcare',
    city: 'Bengaluru', state: 'KA',
    revenue: 7400000000, employees: 1650,
    premium: 14300000, lossRatio: 47, claimsTrend: 'flat',
    renewalDate: '2026-09-17',
    currentCoverages: ['Property and Fire', 'Product Liability', 'Marine Cargo', 'Group Health', 'Clinical Trials Liability'],
    gaps: ['Cyber Liability', 'Directors and Officers Liability', 'Intellectual Property Infringement'],
    growth3Y: 31,
    premiumHistory: [{ y: '22', v: 0.7 }, { y: '23', v: 0.95 }, { y: '24', v: 1.2 }, { y: '25', v: 1.43 }],
    claimsHistory: [{ y: '22', n: 2, amt: 0.2 }, { y: '23', n: 3, amt: 0.3 }, { y: '24', n: 3, amt: 0.4 }, { y: '25', n: 3, amt: 0.35 }],
    guardrails: [
      { rule: 'Loss ratio must be below 60 percent before expansion is pitched', status: 'pass', detail: 'Loss ratio is 47 percent.' },
      { rule: 'Clinical trial exposures must remain within capacity limits', status: 'pass', detail: 'Active trials in India and Singapore are within the capacity that has been allocated.' },
      { rule: 'Compliance and sanctions screening must be current', status: 'pass', detail: 'The last screening was cleared on 5 February 2026.' },
    ],
    evidence: [
      { src: 'Client Funding Disclosures', note: 'The Series C round closed in January 2026 and was led by a sovereign fund.' },
      { src: 'Industry Benchmarks', note: 'Post Series C directors and officers penetration in biotechnology is approximately 89 percent.' },
      { src: 'Regulatory Filings', note: 'There are two active phase three trials covering dermatology and oncology.' },
    ],
    policyRecommendations: {
      offer: [
        { product: 'Directors and Officers Liability', type: 'cross-sell', confidence: 'high', estPremium: 2200000, reason: 'The Series C funding round of 680 Crore Rupees closed in January 2026. Post Series C directors cover penetration in biotechnology is approximately 89 percent.' },
        { product: 'Cyber Liability', type: 'cross-sell', confidence: 'high', estPremium: 900000, reason: 'The research and development data estate includes clinical trial participant records and proprietary compound data that are not covered today.' },
        { product: 'Intellectual Property Infringement', type: 'cross-sell', confidence: 'medium', estPremium: 500000, reason: 'Two active phase three trials and an expanding patent portfolio expose the client to infringement claims that specialist cover can respond to.' },
      ],
      doNotOffer: [],
    },
    narrative: 'Biotechnology companies that have just closed a Series C funding round almost always bind directors and officers cover within six months. Timing the pitch accurately is more important than the size of the first quote.',
  },
  {
    id: 'tricolor', broker: 'rahul',
    name: 'Tricolor Infrastructure Corp',
    industry: 'Infrastructure and Construction', sector: 'Industrial',
    city: 'Gurugram', state: 'HR',
    revenue: 22300000000, employees: 5400,
    premium: 28700000, lossRatio: 63, claimsTrend: 'up',
    renewalDate: '2026-04-30',
    currentCoverages: ['Contractors All Risks', 'Workmen\u2019s Compensation', 'Public Liability', 'Property and Fire', 'Marine Cargo', 'Group Health'],
    gaps: ['Environmental Liability', 'Cyber Liability', 'Surety Bonds'],
    growth3Y: 12,
    premiumHistory: [{ y: '22', v: 2.0 }, { y: '23', v: 2.3 }, { y: '24', v: 2.6 }, { y: '25', v: 2.87 }],
    claimsHistory: [{ y: '22', n: 14, amt: 1.8 }, { y: '23', n: 17, amt: 2.4 }, { y: '24', n: 19, amt: 3.1 }, { y: '25', n: 22, amt: 3.9 }],
    guardrails: [
      { rule: 'Loss ratio must be below 60 percent before expansion is pitched', status: 'fail', detail: 'Loss ratio is 63 percent, which breaches the threshold. Remediation is required before any expansion is considered.' },
      { rule: 'Environmental and regulatory standing must be clean', status: 'warn', detail: 'Two National Green Tribunal notices remain open on the Uttar Pradesh project.' },
      { rule: 'Compliance and sanctions screening must be current', status: 'pass', detail: 'The last screening was cleared.' },
      { rule: 'Insurer appetite for large contractors must remain open', status: 'warn', detail: 'Lead insurers have tightened their appetite for large contractors all risks programmes following the recent loss experience across the class.' },
    ],
    evidence: [
      { src: 'Claims Data Warehouse', note: 'There were 22 claims in FY25, an increase of 16 percent compared with the prior year.' },
      { src: 'Regulatory Filings', note: 'Two National Green Tribunal notices remain open in relation to the Uttar Pradesh project.' },
      { src: 'Order Book Filings', note: 'The client has an order book of 7,200 Crore Rupees, comprising four major highway packages.' },
    ],
    policyRecommendations: {
      offer: [
        { product: 'Rate correction at renewal and risk engineering review', type: 'remediation', confidence: 'high', estPremium: 0, reason: 'Loss ratio at 63 percent has failed the expansion guardrail. The right conversation for this renewal is a structured repricing discussion paired with a site risk survey, rather than any new cover.' },
      ],
      doNotOffer: [
        { product: 'Any expansion of cover at this renewal', reason: 'Loss ratio of 63 percent breaches the expansion threshold, and the renewal falls in only eight days. Expansion pitches are blocked until the portfolio is remediated.', blocker: 'guardrail' },
        { product: 'Environmental Liability', reason: 'Two National Green Tribunal notices remain open on the Uttar Pradesh project. Proposing environmental cover during open regulatory action creates notification obligations the client will not accept.', blocker: 'regulatory' },
        { product: 'Surety Bonds', reason: 'Lead insurers have tightened appetite for large contractors all risks programmes following the recent loss experience across the class, so placing incremental contractor exposure will be difficult.', blocker: 'appetite' },
      ],
    },
    narrative: 'The renewal is only days away and several guardrails have moved into the red. An expansion pitch is premature at this stage, and the conversation should focus on repricing and on risk engineering for the contracting sites.',
  },
  {
    id: 'novatrade', broker: 'rahul',
    name: 'NovaTrade Financial Services',
    industry: 'Financial Services', sector: 'Banking Financial Services and Insurance',
    city: 'Mumbai', state: 'MH',
    revenue: 14600000000, employees: 2100,
    premium: 19800000, lossRatio: 39, claimsTrend: 'flat',
    renewalDate: '2026-06-20',
    currentCoverages: ['Directors and Officers Liability', 'Professional Indemnity', 'Bankers Blanket Bond', 'Cyber Liability', 'Group Health', 'Crime and Fidelity'],
    gaps: ['Cyber Liability limit uplift', 'Employment Practices Liability', 'Trade Credit'],
    growth3Y: 19,
    premiumHistory: [{ y: '22', v: 1.25 }, { y: '23', v: 1.5 }, { y: '24', v: 1.76 }, { y: '25', v: 1.98 }],
    claimsHistory: [{ y: '22', n: 2, amt: 0.3 }, { y: '23', n: 3, amt: 0.4 }, { y: '24', n: 2, amt: 0.35 }, { y: '25', n: 3, amt: 0.4 }],
    guardrails: [
      { rule: 'Loss ratio must be below 60 percent before expansion is pitched', status: 'pass', detail: 'Loss ratio is 39 percent.' },
      { rule: 'Cyber exposure must be adequately covered', status: 'warn', detail: 'The current limit of 25 Crore Rupees is likely to be insufficient against the median incident cost for this peer group.' },
      { rule: 'SEBI and regulatory standing must be clean', status: 'pass', detail: 'The AIF registration is active and there are no enforcement actions.' },
    ],
    evidence: [
      { src: 'Industry Benchmarks', note: 'The median cyber limit across Indian financial services firms in FY25 is approximately 60 Crore Rupees.' },
      { src: 'Regulatory Filings', note: 'The SEBI approval for alternative investment fund expansion was granted in December 2025.' },
      { src: 'Client Product Roadmap', note: 'The wealth technology application launch is scheduled for the second quarter of FY26.' },
    ],
    policyRecommendations: {
      offer: [
        { product: 'Cyber Liability limit uplift', type: 'upsell', confidence: 'high', estPremium: 2500000, reason: 'The current cyber limit of 25 Crore Rupees sits well below the Indian financial services peer median of 60 Crore Rupees, and the new wealth technology application launches within six weeks.' },
        { product: 'Employment Practices Liability', type: 'cross-sell', confidence: 'medium', estPremium: 1200000, reason: 'A hiring programme is underway for the alternative investment fund expansion, and the sector has seen a rise in employment practice claims.' },
        { product: 'Trade Credit', type: 'cross-sell', confidence: 'medium', estPremium: 1300000, reason: 'The wealth technology product introduces counterparty exposure on distributor fee receivables that the existing programme does not cover.' },
      ],
      doNotOffer: [],
    },
    narrative: 'This is a strong cross sell opportunity for a higher cyber limit, because the gap between the current cover and the peer median is large and easy to articulate.',
  },
  {
    id: 'ashoka', broker: 'rahul',
    name: 'Ashoka Retail Group',
    industry: 'Retail and Consumer', sector: 'Consumer',
    city: 'Pune', state: 'MH',
    revenue: 9300000000, employees: 4700,
    premium: 11200000, lossRatio: 54, claimsTrend: 'flat',
    renewalDate: '2026-07-02',
    currentCoverages: ['Property and Fire', 'Public Liability', 'Group Health', 'Workmen\u2019s Compensation', 'Marine Cargo'],
    gaps: ['Cyber Liability', 'Product Liability', 'Business Interruption'],
    growth3Y: 11,
    premiumHistory: [{ y: '22', v: 0.78 }, { y: '23', v: 0.9 }, { y: '24', v: 1.03 }, { y: '25', v: 1.12 }],
    claimsHistory: [{ y: '22', n: 6, amt: 0.5 }, { y: '23', n: 7, amt: 0.6 }, { y: '24', n: 7, amt: 0.55 }, { y: '25', n: 8, amt: 0.6 }],
    guardrails: [
      { rule: 'Loss ratio must be below 60 percent before expansion is pitched', status: 'pass', detail: 'Loss ratio is 54 percent.' },
      { rule: 'Cyber risk class must be medium or lower', status: 'warn', detail: 'The business is in scope for card payment security standards, and the risk class remains high until cover is bound.' },
      { rule: 'Compliance and sanctions screening must be current', status: 'pass', detail: 'The last screening was cleared.' },
    ],
    evidence: [
      { src: 'Industry Benchmarks', note: 'Approximately 73 percent of retail peers with a significant online channel hold cyber cover.' },
      { src: 'Client Website Audit', note: 'The online storefront handles customer personal information and stores payment card tokens.' },
      { src: 'Client Annual Report FY25', note: 'Online share of revenue reached 34 percent, up from 19 percent in FY23.' },
    ],
    policyRecommendations: {
      offer: [
        { product: 'Cyber Liability', type: 'cross-sell', confidence: 'high', estPremium: 2400000, reason: 'Online share of revenue reached 34 percent in FY25, up from 19 percent in FY23. The storefront handles customer personal information and payment card tokens without any standalone cyber cover in place.' },
        { product: 'Business Interruption', type: 'cross-sell', confidence: 'medium', estPremium: 1500000, reason: 'A new warehouse in Nagpur has concentrated fulfilment risk, and an outage at that site would now disrupt a material share of revenue.' },
      ],
      doNotOffer: [
        { product: 'Product Liability expansion', reason: 'Exposure characterisation for the private label portfolio is not yet complete. Proposing cover without clear exposure clarity creates a mispriced placement risk.', blocker: 'data-gap' },
        { product: 'Mid-year property uplifts', reason: 'The client has a clear pattern of resisting new covers added outside the renewal cycle, so proposing property uplifts mid-year is unlikely to land.', blocker: 'relationship' },
      ],
    },
    narrative: 'The retail business has shifted materially online over the past two years. A cyber liability proposal is the natural lead, and business interruption cover is a reasonable follow up once cyber is bound.',
  },
  {
    id: 'vayu', broker: 'rahul',
    name: 'Vayu Aerospace Components',
    industry: 'Aerospace Manufacturing', sector: 'Industrial',
    city: 'Hyderabad', state: 'TG',
    revenue: 4200000000, employees: 980,
    premium: 8600000, lossRatio: 48, claimsTrend: 'down',
    renewalDate: '2026-10-08',
    currentCoverages: ['Property and Fire', 'Product Liability', 'Marine Cargo', 'Workmen\u2019s Compensation', 'Group Health'],
    gaps: ['Aviation Products Liability limit uplift', 'Cyber Liability', 'Trade Credit'],
    growth3Y: 24,
    premiumHistory: [{ y: '22', v: 0.5 }, { y: '23', v: 0.62 }, { y: '24', v: 0.77 }, { y: '25', v: 0.86 }],
    claimsHistory: [{ y: '22', n: 3, amt: 0.4 }, { y: '23', n: 3, amt: 0.3 }, { y: '24', n: 2, amt: 0.25 }, { y: '25', n: 2, amt: 0.2 }],
    guardrails: [
      { rule: 'Loss ratio must be below 60 percent before expansion is pitched', status: 'pass', detail: 'Loss ratio is 48 percent and continues to fall.' },
      { rule: 'Insurer appetite for aviation products must remain open', status: 'pass', detail: 'Both the domestic and London aviation products markets are open for this class of risk.' },
      { rule: 'Compliance and export controls must be current', status: 'pass', detail: 'Directorate General of Civil Aviation and United States export compliance are both confirmed as current.' },
    ],
    evidence: [
      { src: 'Client disclosure at renewal meeting', note: 'The client has confirmed that a tier one aerospace original equipment manufacturer contract now requires a higher products liability limit than the current programme carries.' },
      { src: 'Claims Data Warehouse', note: 'The loss ratio has improved by seven points across three years.' },
      { src: 'Industry Benchmarks', note: 'Approximately 58 percent of aerospace component peers carry cyber cover.' },
    ],
    policyRecommendations: {
      offer: [
        { product: 'Aviation Products Liability limit uplift to 125 Crore Rupees', type: 'upsell', confidence: 'high', estPremium: 2400000, reason: 'The Boeing supplier performance specification now requires products liability cover of 125 Crore Rupees. The current limit of 75 Crore Rupees leaves the client non-compliant with a tier one contract.' },
        { product: 'Cyber Liability', type: 'cross-sell', confidence: 'medium', estPremium: 1000000, reason: 'Export compliance and supply chain integration with original equipment manufacturers introduces data exposure that specialist cyber cover can respond to, and peer penetration is approximately 58 percent.' },
      ],
      doNotOffer: [],
    },
    narrative: 'The original equipment manufacturer contract now requires a higher products liability limit than the client currently carries. The pitch for that uplift therefore almost writes itself.',
  },
];

/* ============================================================
   AI ADVISOR (CLAUDE API)
   ============================================================ */

const buildPortfolioBrief = (portfolio, brokerName) => {
  if (!portfolio || portfolio.length === 0) return null;
  return portfolio.map(c => ({
    client: c.name,
    industry: c.industry,
    city: c.city,
    annual_premium_inr: c.premium,
    potential_additional_premium_inr: computePotentialFromGaps(c),
    loss_ratio_pct: c.lossRatio,
    claims_trend: c.claimsTrend,
    days_to_renewal: daysBetween(c.renewalDate),
    renewal_date: c.renewalDate,
    attractiveness_score: computeAttractivenessScore(c),
    current_coverages: c.currentCoverages,
    coverage_gaps: c.gaps,
    expansion_allowed: canPitchExpansion(c),
    offer: (c.policyRecommendations?.offer || []).map(r => ({
      product: r.product, type: r.type, confidence: r.confidence, est_premium_inr: r.estPremium,
    })),
    do_not_offer: (c.policyRecommendations?.doNotOffer || []).map(r => ({
      product: r.product, blocker: r.blocker,
    })),
    analyst_note: c.narrative,
  }));
};

const buildAdvisorSystemPrompt = (client, portfolio, brokerName) => {
  if (!client) {
    const brief = buildPortfolioBrief(portfolio, brokerName);
    return `You are the Howden Sales Intelligence Advisor, an assistant for commercial insurance relationship managers in India. Howden is a broker, not an insurer.

The broker is ${brokerName || 'a relationship manager'}, and no single client is currently selected. You have been given a complete brief for every client under the broker's management. Use this data to answer any portfolio level question, such as which clients have a particular coverage gap, which renewals are coming up, where the best cross sell opportunities are, which accounts are blocked from expansion, or which clients are in the watch zone. Quote specific client names, numbers, dates, and guardrail states from the brief.

Portfolio brief:
${JSON.stringify(brief, null, 2)}

Data discipline, which is the most important rule:
You must only use numbers, names, dates, percentages, limits, premiums, coverages, claims amounts, guardrail states, and recommendations that are present in the portfolio brief above. If the broker asks for any figure that is not in the brief, such as a specific premium quote, a competitor market share, a peer median beyond those listed, a historical conversion rate, an expected discount, a reinsurance rate, or any benchmark that is not shown, you must state clearly that the figure is not available in the broker's current data set, and then invite the broker to source it from the relevant system such as the underwriting desk, the placement team, or the external benchmarking subscription. Do not extrapolate. Do not cite sources such as "industry reports" or "market surveys" unless that exact source is referenced for a specific client in the brief. It is better to say "that figure is not in the brief" than to produce a plausible sounding number that the broker cannot defend in front of the client.

You also represent a broker, not an insurer, so avoid commenting on insurer-side internal metrics.

Style guidance:
Keep replies concise and business appropriate. Write in full sentences, not in fragments. Use Indian currency conventions such as 3.85 Crore Rupees or 21.4 Lakh Rupees. Avoid marketing language and hyphenated phrases such as "purpose built" or "AI powered". Format is plain prose with light markdown only where it aids comprehension.`;
  }
  const ctx = {
    client: client.name,
    industry: client.industry,
    city: client.city,
    revenue_inr: client.revenue,
    employees: client.employees,
    annual_premium_inr: client.premium,
    potential_additional_premium_inr: computePotentialFromGaps(client),
    loss_ratio_pct: client.lossRatio,
    claims_trend: client.claimsTrend,
    renewal_date: client.renewalDate,
    days_to_renewal: daysBetween(client.renewalDate),
    attractiveness_score: computeAttractivenessScore(client),
    growth_3yr_cagr_pct: client.growth3Y,
    current_coverages: client.currentCoverages,
    coverage_gaps: client.gaps,
    premium_history_cr: client.premiumHistory,
    claims_history: client.claimsHistory,
    business_guardrails: client.guardrails,
    source_evidence: client.evidence,
    analyst_note: client.narrative,
    policy_recommendations: client.policyRecommendations,
    expansion_pitch_allowed_by_code: canPitchExpansion(client),
  };
  const guardRule = canPitchExpansion(client)
    ? `Expansion pitches are currently permitted by the guardrail engine. You may generate expansion oriented pitches when the broker asks for one, but you must still reference any warning level guardrails in your answer.`
    : `Expansion pitches are blocked by the guardrail engine because at least one rule has failed. If the broker asks for an expansion pitch, do not draft one. Instead, explain which rule has failed and what must be resolved first. You may still help with remediation, repricing, and risk engineering conversations.`;

  return `You are the Howden Sales Intelligence Advisor, an assistant for commercial insurance relationship managers in India. Howden is a broker, not an insurer.

The broker is currently focused on the following client. Every answer you give must be grounded in this data, and you must quote the specific numbers when relevant.

${JSON.stringify(ctx, null, 2)}

Guardrail policy:
${guardRule}

Data discipline, which is the most important rule:
You must only use numbers, names, dates, percentages, limits, premiums, coverages, claims amounts, guardrail states, evidence items, and recommendations that are present in the JSON context above. If the broker asks for any figure that is not in the context, such as a specific premium quote, a competitor market share, a peer median beyond those listed, a historical conversion rate, an expected discount, a reinsurance rate, or any benchmark not shown in the evidence list, you must state clearly that the figure is not available in the broker's current data set, and then invite the broker to source it from the relevant system such as the underwriting desk, the placement team, or the external benchmarking subscription. Do not extrapolate. Do not round indicative figures into fresh quotes. Do not cite sources such as "industry reports" or "market surveys" unless that exact source appears in the evidence list. It is better to say "that figure is not in the brief" than to produce a plausible sounding number that the broker cannot defend in front of the client.

You also represent a broker, not an insurer, so avoid commenting on insurer-side internal metrics unless they are explicitly listed in the guardrails or evidence for this client.

Style guidance:
Keep replies concise and business appropriate. Write in full sentences, not in fragments. Use Indian currency conventions such as 3.85 Crore Rupees or 21.4 Lakh Rupees. Avoid marketing language and hyphenated phrases such as "purpose built" or "AI powered". Format is plain prose with light markdown only where it aids comprehension.`;
};

const askAdvisor = async (userMessage, client, history, portfolio, brokerName) => {
  const messages = [
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      system: buildAdvisorSystemPrompt(client, portfolio, brokerName),
      messages,
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = data.content
    .filter(c => c.type === 'text')
    .map(c => c.text)
    .join('\n')
    .trim();
  return text || '(no response)';
};

/* ============================================================
   LIGHT MARKDOWN RENDERER
   ============================================================ */

const inlineFormat = (s) => {
  let out = s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  return out;
};

const renderMarkdown = (text) => {
  const blocks = text.split(/\n{2,}/);
  return blocks.map((block, i) => {
    const lines = block.split('\n');
    const isList = lines.every(l => /^\s*[-•*]\s+/.test(l));
    if (isList) {
      return (
        <ul key={i}>
          {lines.map((l, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: inlineFormat(l.replace(/^\s*[-•*]\s+/, '')) }} />
          ))}
        </ul>
      );
    }
    return (
      <p key={i} dangerouslySetInnerHTML={{ __html: inlineFormat(block.replace(/\n/g, '<br/>')) }} />
    );
  });
};

/* ============================================================
   SMALL COMPONENTS
   ============================================================ */

const Logo = ({ size = 28 }) => (
  <div className="flex items-center gap-2.5">
    <div
      className="flex items-center justify-center rounded-md"
      style={{
        width: size, height: size,
        background: 'linear-gradient(135deg, #0B3B5C 0%, #1E5A8A 100%)',
        boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 6px 20px -8px rgba(11,59,92,0.5)',
      }}
    >
      <Hexagon size={size * 0.55} color="#fff" strokeWidth={1.5} />
    </div>
    <div className="flex flex-col leading-tight">
      <span className="text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--ink-3)' }}>Howden</span>
      <span className="text-[13px] font-medium font-display" style={{ color: 'var(--ink)' }}>
        Sales Intelligence <span style={{ color: 'var(--ink-3)', fontWeight: 400, fontSize: '11.5px' }}>by Altius Soft</span>
      </span>
    </div>
  </div>
);

const ScoreRing = ({ score, size = 56, stroke = 4, inverse = false }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, score)) / 100;
  const tone = scoreTone(score);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="score-gauge">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(15,23,42,0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={tone.fg} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={c * (1 - p)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.2,.7,.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="tabular font-mono font-medium" style={{ fontSize: size * 0.32, color: 'var(--ink)' }}>{score}</span>
      </div>
    </div>
  );
};

const Chip = ({ children, tone = 'ink', icon: Icon }) => {
  const palette = {
    ink: { bg: '#fff', fg: 'var(--ink-2)', bd: 'var(--hair)' },
    emerald: { bg: 'var(--emerald-soft)', fg: 'var(--emerald)', bd: 'rgba(4,120,87,0.15)' },
    rose: { bg: 'var(--rose-soft)', fg: 'var(--rose)', bd: 'rgba(190,18,60,0.15)' },
    amber: { bg: 'var(--amber-soft)', fg: 'var(--amber)', bd: 'rgba(180,83,9,0.15)' },
    brand: { bg: 'var(--brand-soft)', fg: 'var(--brand)', bd: 'rgba(11,59,92,0.15)' },
  }[tone];
  return (
    <span className="chip" style={{ background: palette.bg, color: palette.fg, borderColor: palette.bd }}>
      {Icon ? <Icon size={11} strokeWidth={2.2} /> : null}
      {children}
    </span>
  );
};

const StatBlock = ({ label, value, sub, tone = 'ink' }) => {
  const toneFg = tone === 'emerald' ? 'var(--emerald)' : tone === 'rose' ? 'var(--rose)' : tone === 'amber' ? 'var(--amber)' : 'var(--ink)';
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>{label}</span>
      <span className="font-display text-[22px] leading-none tabular" style={{ color: toneFg }}>{value}</span>
      {sub ? <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>{sub}</span> : null}
    </div>
  );
};

const Panel = ({ title, subtitle, icon: Icon, children, headerRight }) => (
  <div className="p-5 rounded-xl hairline" style={{ background: 'var(--surface)' }}>
    <div className="flex items-start justify-between mb-4 gap-3">
      <div className="flex items-start gap-2.5">
        {Icon ? (
          <div className="w-7 h-7 rounded-md flex items-center justify-center mt-0.5" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
            <Icon size={14} strokeWidth={2.2} />
          </div>
        ) : null}
        <div>
          <div className="font-display text-[16px]" style={{ color: 'var(--ink)' }}>{title}</div>
          {subtitle ? <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--ink-3)' }}>{subtitle}</div> : null}
        </div>
      </div>
      {headerRight}
    </div>
    {children}
  </div>
);

/* ============================================================
   AI TAG
   ============================================================ */

const AiTag = ({ label = 'AI derived', size = 'sm' }) => {
  const px = size === 'xs' ? '2px 6px' : '2px 7px';
  const fz = size === 'xs' ? 9 : 9.5;
  const iz = size === 'xs' ? 8 : 9;
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded-full tabular"
      style={{
        background: 'linear-gradient(135deg, rgba(11,59,92,0.08) 0%, rgba(166,124,46,0.08) 100%)',
        color: 'var(--brand)',
        border: '1px solid rgba(11,59,92,0.14)',
        padding: px,
        fontSize: fz,
        fontWeight: 500,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        lineHeight: 1.1,
        verticalAlign: 'middle',
      }}
      title="This value was produced by the intelligence engine rather than pulled directly from a source system."
    >
      <Sparkles size={iz} strokeWidth={2.4} />
      {label}
    </span>
  );
};

/* ============================================================
   POLICY RECOMMENDATIONS
   ============================================================ */

const confidenceTone = (c) => {
  if (c === 'high') return { fg: 'var(--emerald)', bg: 'var(--emerald-soft)', label: 'High confidence' };
  if (c === 'medium') return { fg: 'var(--amber)', bg: 'var(--amber-soft)', label: 'Medium confidence' };
  return { fg: 'var(--ink-3)', bg: 'var(--canvas-2)', label: 'Low confidence' };
};

const recTypeMeta = (t) => {
  if (t === 'cross-sell') return { label: 'Cross sell', Icon: Plus, fg: 'var(--brand)', bg: 'var(--brand-soft)' };
  if (t === 'upsell') return { label: 'Upsell', Icon: ArrowUp, fg: 'var(--emerald)', bg: 'var(--emerald-soft)' };
  if (t === 'remediation') return { label: 'Remediation', Icon: ShieldCheck, fg: 'var(--amber)', bg: 'var(--amber-soft)' };
  return { label: 'Action', Icon: Rocket, fg: 'var(--ink-2)', bg: 'var(--canvas-2)' };
};

const blockerMeta = (b) => {
  const map = {
    guardrail: 'Blocked by guardrail',
    'past-rejection': 'Previously declined',
    appetite: 'Insurer appetite reduced',
    regulatory: 'Regulatory exposure',
    relationship: 'Relationship risk',
    timing: 'Timing constraint',
    'data-gap': 'Exposure unclear',
    market: 'Market conditions',
  };
  return map[b] || 'Do not pitch';
};

const PolicyRecommendationsPanel = ({ client }) => {
  const offer = client.policyRecommendations?.offer || [];
  const doNotOffer = client.policyRecommendations?.doNotOffer || [];

  return (
    <div className="p-5 rounded-xl hairline" style={{ background: 'var(--surface)' }}>
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center mt-0.5" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
            <Wand2 size={14} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="font-display text-[16px]" style={{ color: 'var(--ink)' }}>Policy recommendations</div>
              <AiTag />
            </div>
            <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--ink-3)' }}>
              Products to pitch, and products to hold back, based on the client record.
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* OFFER SIDE */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'var(--emerald-soft)', color: 'var(--emerald)' }}>
              <ThumbsUp size={11} strokeWidth={2.4} />
            </div>
            <span className="text-[11.5px] font-medium uppercase tracking-[0.1em]" style={{ color: 'var(--emerald)' }}>
              Offer these
            </span>
            <span className="text-[11px] font-mono" style={{ color: 'var(--ink-4)' }}>{offer.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {offer.length === 0 && (
              <div className="text-[11.5px] italic p-3 rounded-lg" style={{ color: 'var(--ink-4)', background: 'var(--canvas-2)' }}>
                No products surfaced for active pitching right now.
              </div>
            )}
            {offer.map((r, i) => {
              const tm = recTypeMeta(r.type);
              const cm = confidenceTone(r.confidence);
              return (
                <div key={i} className="p-3 rounded-lg hairline" style={{ background: 'var(--canvas-2)' }}>
                  <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
                    <span className="text-[13px] font-medium" style={{ color: 'var(--ink)' }}>{r.product}</span>
                    <div className="flex items-center gap-1">
                      <span className="chip" style={{ background: tm.bg, color: tm.fg, borderColor: 'transparent', padding: '1px 6px', fontSize: 10 }}>
                        <tm.Icon size={9} strokeWidth={2.6} />{tm.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="chip tabular" style={{ background: cm.bg, color: cm.fg, borderColor: 'transparent', padding: '1px 6px', fontSize: 10 }}>
                      {cm.label}
                    </span>
                    {r.estPremium > 0 && (
                      <span className="text-[11px] tabular" style={{ color: 'var(--ink-2)' }}>
                        Estimated {formatINR(r.estPremium)}
                      </span>
                    )}
                  </div>
                  <div className="text-[11.5px]" style={{ color: 'var(--ink-3)', lineHeight: 1.5 }}>{r.reason}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DO NOT OFFER SIDE */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'var(--rose-soft)', color: 'var(--rose)' }}>
              <ThumbsDown size={11} strokeWidth={2.4} />
            </div>
            <span className="text-[11.5px] font-medium uppercase tracking-[0.1em]" style={{ color: 'var(--rose)' }}>
              Do not offer
            </span>
            <span className="text-[11px] font-mono" style={{ color: 'var(--ink-4)' }}>{doNotOffer.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {doNotOffer.length === 0 && (
              <div className="text-[11.5px] italic p-3 rounded-lg" style={{ color: 'var(--ink-4)', background: 'var(--canvas-2)' }}>
                Nothing is blocked. The client is in a position to hear any reasonable pitch.
              </div>
            )}
            {doNotOffer.map((r, i) => (
              <div key={i} className="p-3 rounded-lg hairline" style={{ background: 'var(--rose-soft)', borderColor: 'rgba(190,18,60,0.15)' }}>
                <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
                  <span className="text-[13px] font-medium" style={{ color: 'var(--ink)' }}>{r.product}</span>
                  <span className="chip" style={{ background: '#fff', color: 'var(--rose)', borderColor: 'rgba(190,18,60,0.25)', padding: '1px 6px', fontSize: 10 }}>
                    <Ban size={9} strokeWidth={2.6} />{blockerMeta(r.blocker)}
                  </span>
                </div>
                <div className="text-[11.5px]" style={{ color: 'var(--ink-3)', lineHeight: 1.5 }}>{r.reason}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   CROSS SELL AND UPSELL DASHBOARD PANEL
   ============================================================ */

const CrossSellDashboardPanel = ({ clients, onOpenClient }) => {
  const all = [];
  for (const c of clients) {
    const recs = c.policyRecommendations?.offer || [];
    for (const r of recs) {
      if (r.type === 'cross-sell' || r.type === 'upsell') {
        all.push({ ...r, clientId: c.id, clientName: c.name, clientIndustry: c.industry });
      }
    }
  }
  const score = (r) => {
    const conf = r.confidence === 'high' ? 3 : r.confidence === 'medium' ? 2 : 1;
    return conf * 1e9 + (r.estPremium || 0);
  };
  all.sort((a, b) => score(b) - score(a));

  const crossSell = all.filter(r => r.type === 'cross-sell');
  const upsell = all.filter(r => r.type === 'upsell');

  const totalCrossSell = crossSell.reduce((s, r) => s + (r.estPremium || 0), 0);
  const totalUpsell = upsell.reduce((s, r) => s + (r.estPremium || 0), 0);

  const renderRow = (r, i) => {
    const cm = confidenceTone(r.confidence);
    const tm = recTypeMeta(r.type);
    return (
      <button
        key={i}
        onClick={() => onOpenClient(r.clientId)}
        className="text-left p-3 rounded-lg hairline tile-pop w-full"
        style={{ background: 'var(--canvas-2)' }}
      >
        <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
          <div className="min-w-0">
            <div className="text-[12.5px] font-medium" style={{ color: 'var(--ink)' }}>{r.product}</div>
            <div className="text-[10.5px] mt-0.5" style={{ color: 'var(--ink-3)' }}>{r.clientName}</div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="chip" style={{ background: tm.bg, color: tm.fg, borderColor: 'transparent', padding: '1px 6px', fontSize: 10 }}>
              <tm.Icon size={9} strokeWidth={2.6} />{tm.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="chip tabular" style={{ background: cm.bg, color: cm.fg, borderColor: 'transparent', padding: '1px 6px', fontSize: 10 }}>
            {cm.label}
          </span>
          {r.estPremium > 0 && (
            <span className="text-[11px] tabular" style={{ color: 'var(--emerald)' }}>
              {formatINR(r.estPremium)}
            </span>
          )}
          <span className="ml-auto text-[10.5px] flex items-center gap-0.5" style={{ color: 'var(--ink-4)' }}>
            Open <ChevronRight size={10} />
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="p-5 rounded-xl hairline" style={{ background: 'var(--surface)' }}>
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center mt-0.5" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
            <Rocket size={14} strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="font-display text-[16px]" style={{ color: 'var(--ink)' }}>Cross sell and upsell opportunities</div>
              <AiTag />
            </div>
            <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--ink-3)' }}>
              Ranked across the portfolio by confidence and estimated premium. Click any card to open the client.
            </div>
          </div>
        </div>
      </div>

      {all.length === 0 ? (
        <div className="text-[12.5px] p-4 rounded-lg text-center" style={{ background: 'var(--canvas-2)', color: 'var(--ink-3)' }}>
          No active cross sell or upsell opportunities are surfaced across this portfolio.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}>
                <Plus size={11} strokeWidth={2.6} />
              </div>
              <span className="text-[11.5px] font-medium uppercase tracking-[0.1em]" style={{ color: 'var(--brand)' }}>Cross sell</span>
              <span className="text-[11px] font-mono" style={{ color: 'var(--ink-4)' }}>{crossSell.length}</span>
              <span className="ml-auto text-[11px] tabular" style={{ color: 'var(--emerald)' }}>{formatINR(totalCrossSell)}</span>
            </div>
            <div className="flex flex-col gap-2">
              {crossSell.slice(0, 4).map((r, i) => renderRow(r, i))}
              {crossSell.length === 0 && (
                <div className="text-[11px] italic p-3 rounded-lg" style={{ color: 'var(--ink-4)', background: 'var(--canvas-2)' }}>
                  No cross sell opportunities surfaced.
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'var(--emerald-soft)', color: 'var(--emerald)' }}>
                <ArrowUp size={11} strokeWidth={2.6} />
              </div>
              <span className="text-[11.5px] font-medium uppercase tracking-[0.1em]" style={{ color: 'var(--emerald)' }}>Upsell</span>
              <span className="text-[11px] font-mono" style={{ color: 'var(--ink-4)' }}>{upsell.length}</span>
              <span className="ml-auto text-[11px] tabular" style={{ color: 'var(--emerald)' }}>{formatINR(totalUpsell)}</span>
            </div>
            <div className="flex flex-col gap-2">
              {upsell.slice(0, 4).map((r, i) => renderRow(r, i))}
              {upsell.length === 0 && (
                <div className="text-[11px] italic p-3 rounded-lg" style={{ color: 'var(--ink-4)', background: 'var(--canvas-2)' }}>
                  No upsell opportunities surfaced.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   LOGIN
   ============================================================ */

const Login = ({ onLogin, onAbout, clients }) => {
  const portfolioStats = (brokerId) => {
    const mine = clients.filter(c => c.broker === brokerId);
    const prem = mine.reduce((a, c) => a + c.premium, 0);
    return { count: mine.length, prem };
  };
  return (
    <div className="min-h-screen canvas-noise flex items-center justify-center p-6">
      <div className="max-w-4xl w-full fade-up">
        <div className="flex flex-col items-center text-center mb-10">
          <Logo size={40} />
          <h1 className="font-display text-[40px] leading-[1.08] mt-6 mb-3" style={{ color: 'var(--ink)' }}>
            Portfolio intelligence for <em className="italic" style={{ color: 'var(--brand)' }}>Howden</em> relationship managers
          </h1>
          <p className="text-[14px] max-w-xl" style={{ color: 'var(--ink-3)' }}>
            This demonstration shows how a relationship manager can see the full state of every account under management, understand which opportunities to pursue first, and brief themselves on each client before a conversation. Sign in as one of the two brokers to begin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BROKERS.map((b, i) => {
            const s = portfolioStats(b.id);
            return (
              <button
                key={b.id}
                onClick={() => onLogin(b.id)}
                className="tile-pop text-left p-6 rounded-2xl glass hairline"
                style={{ animationDelay: `${0.1 + i * 0.08}s` }}
              >
                <div className="flex items-center gap-4 mb-5">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center font-display text-[20px] text-white"
                    style={{ background: `linear-gradient(135deg, ${b.tone} 0%, ${b.tone}CC 100%)` }}
                  >
                    {b.initials}
                  </div>
                  <div>
                    <div className="font-display text-[22px] leading-none" style={{ color: 'var(--ink)' }}>{b.name}</div>
                    <div className="text-[12.5px] mt-1.5" style={{ color: 'var(--ink-3)' }}>{b.title}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 hairline-t">
                  <div>
                    <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>Region</div>
                    <div className="text-[13px] mt-1" style={{ color: 'var(--ink-2)' }}>{b.region}</div>
                  </div>
                  <div>
                    <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>Clients</div>
                    <div className="text-[13px] mt-1 tabular" style={{ color: 'var(--ink-2)' }}>{s.count}</div>
                  </div>
                  <div>
                    <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>Premium</div>
                    <div className="text-[13px] mt-1 tabular" style={{ color: 'var(--ink-2)' }}>{formatINR(s.prem)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 mt-5 text-[12.5px] font-medium" style={{ color: b.tone }}>
                  Enter this portfolio <ArrowUpRight size={14} />
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            onClick={onAbout}
            className="flex items-center gap-1.5 text-[12.5px] px-3 py-1.5 rounded-lg hairline"
            style={{ color: 'var(--ink-2)', background: 'var(--surface)' }}
          >
            <BookOpen size={12} /> Read about this demonstration
          </button>
        </div>

        <div className="mt-6 text-center text-[11px] tracking-wide" style={{ color: 'var(--ink-4)' }}>
          Proof of concept. The data shown inside this application is synthetic and was generated for the demonstration. Built by Altius Soft.
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   ABOUT PAGE
   ============================================================ */

const About = ({ onBack }) => (
  <div className="min-h-screen canvas-noise">
    <div className="max-w-3xl mx-auto px-6 py-10 fade-up">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[12.5px] mb-6"
        style={{ color: 'var(--ink-3)' }}
      >
        <ArrowLeft size={13} /> Back
      </button>

      <Logo size={32} />

      <h1 className="font-display mt-6 mb-2" style={{ fontSize: 36, lineHeight: 1.1, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
        Sales Intelligence engine
      </h1>
      <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 18 }}>
        Built by Altius Soft for Howden relationship managers in India.
      </p>

      <div className="prose">
        <h2>What it does</h2>
        <ul>
          <li><strong>Scores every client</strong> on attractiveness and potential pipeline.</li>
          <li><strong>Flags renewals, claims shifts, and business triggers</strong> as they happen.</li>
          <li><strong>Lists what to offer and what not to offer</strong> for each client, with reasons.</li>
          <li><strong>Enforces guardrails in code</strong>, so a blocked pitch stays blocked.</li>
          <li><strong>Drafts pitches on request</strong> and saves them as CRM leads, with a link back to the conversation.</li>
          <li><strong>Shows access control in action</strong>. Two brokers, two portfolios, two different answers.</li>
        </ul>

        <h2>Live system</h2>
        <ul>
          <li><strong>Hosted entirely inside the Howden Azure tenant.</strong> Client data never leaves the environment Howden already governs.</li>
          <li><strong>Data arrives through connectors</strong> to the tools Howden already uses, including Excel connectors for spreadsheet extracts, plus connectors to the policy register, claims warehouse, CRM, and SharePoint.</li>
          <li><strong>No data centralisation required.</strong> The engine reads structured and unstructured data in place.</li>
          <li><strong>Access control is applied before retrieval</strong>, so the model only sees records the user is permitted to see.</li>
          <li><strong>Every retrieval and every response is audited.</strong></li>
          <li><strong>No training on Howden data.</strong></li>
        </ul>

        <h2>Input values we have synthesised for this demonstration</h2>
        <p>The ten client records were written by hand for this proof of concept. In production, every field listed below is read from an existing Howden system through a connector, and nothing on this list is invented by the engine. A value that appears without an AI tag anywhere in the interface is a synthesised input, not an output.</p>
        <table>
          <thead>
            <tr><th>Field</th><th>Source in production</th></tr>
          </thead>
          <tbody>
            <tr><td>Client identity</td><td>Name, industry, sector, city, state from the CRM</td></tr>
            <tr><td>Revenue and employee count</td><td>Client master data, enriched from public filings where available</td></tr>
            <tr><td>Annual premium</td><td>Policy register</td></tr>
            <tr><td>Loss ratio</td><td>Claims data warehouse, reconciled against the policy register</td></tr>
            <tr><td>Claims trend</td><td>Derived in the warehouse from the four most recent policy years</td></tr>
            <tr><td>Premium history (four years)</td><td>Policy register</td></tr>
            <tr><td>Claims history (four years, count and incurred)</td><td>Claims data warehouse</td></tr>
            <tr><td>Renewal date</td><td>Policy register</td></tr>
            <tr><td>3-year revenue growth</td><td>Client master data and public filings</td></tr>
            <tr><td>Current coverages</td><td>Policy register</td></tr>
            <tr><td>Coverage gaps</td><td>Underwriting desk output, or rule-based identification against a peer coverage template</td></tr>
            <tr><td>Guardrail states</td><td>Rule engine output, computed over claims, policy, compliance, and appetite data</td></tr>
            <tr><td>Evidence notes</td><td>Underwriting desk, placement desk, broker meeting notes, public filings feed</td></tr>
            <tr><td>Analyst narrative</td><td>Broker or underwriter commentary captured in the CRM</td></tr>
            <tr><td>Offer and do-not-offer recommendations, including each product, type, confidence tier, estimated premium, and reason</td><td>Sales intelligence model output, grounded in the fields above</td></tr>
          </tbody>
        </table>

        <h2>Formulas for derived values</h2>
        <p>Every value carrying an AI tag in the interface is computed at render time from the synthesised inputs above. No derived value is stored. The formulas below are the exact rules that the code runs today.</p>

        <h3>Attractiveness score (0 to 100)</h3>
        <p>A weighted additive score built from six components, starting at a neutral base of 50. The final score is clamped to the range 0 to 100.</p>
        <div className="formula-block">score = 50 + lossRatioPoints + growthPoints + claimsTrendPoints + coverageGapPoints + guardrailPoints + offerPoints</div>
        <table>
          <thead>
            <tr><th>Component</th><th>Rule</th></tr>
          </thead>
          <tbody>
            <tr><td>Loss Ratio</td><td className="tab">&lt;45% = +18, 45 to 54% = +8, 55 to 59% = 0, 60 to 64% = -10, 65% and above = -16</td></tr>
            <tr><td>3-year Growth</td><td className="tab">&lt;10% = 0, 10 to 19% = +6, 20 to 29% = +12, 30% and above = +16</td></tr>
            <tr><td>Claims Trend</td><td className="tab">down = +6, flat = 0, up = -6</td></tr>
            <tr><td>Coverage Gaps</td><td className="tab">+2 per identified gap, capped at +8</td></tr>
            <tr><td>Guardrail State</td><td className="tab">-14 per failed rule, -3 per warning rule</td></tr>
            <tr><td>Viable Offers</td><td className="tab">+2 per offer recommendation, capped at +6</td></tr>
          </tbody>
        </table>

        <h3>Potential from Gaps (per client)</h3>
        <p>The sum of estimated premium across every cross-sell and upsell recommendation on the client. If any guardrail is in a failed state, the value is zero, because expansion pitches are blocked.</p>
        <div className="formula-block">if any guardrail is failed:
    potentialFromGaps = 0
else:
    potentialFromGaps = sum of estPremium across all offer items</div>

        <h3>Potential Pipeline (portfolio KPI)</h3>
        <div className="formula-block">potentialPipeline = sum of potentialFromGaps across all portfolio clients</div>

        <h3>High Opportunity count (portfolio KPI)</h3>
        <div className="formula-block">highOpportunityCount = count of clients where attractivenessScore &gt;= 75</div>

        <h3>Expansion Allowed (per client)</h3>
        <p>A binary flag that determines whether the advisor is permitted to draft an expansion pitch. Enforced in code before the language model is called, not by prompting alone.</p>
        <div className="formula-block">expansionAllowed = no guardrail has status "failed"</div>

        <h3>Offer ranking on the Cross-sell and Upsell dashboard</h3>
        <div className="formula-block">rankKey = (confidenceTier * 1_000_000_000) + estPremium
confidenceTier: high = 3, medium = 2, low = 1</div>

        <h2>Values that are hardcoded in the code</h2>
        <p>These are not business data. They are configuration constants and thresholds currently held inline in the application code. In the production build, each of these will move into an administrative interface so that Howden underwriters and compliance officers can edit, version, and approve them without a code change.</p>
        <table>
          <thead>
            <tr><th>Constant</th><th>Current value</th><th>Where it lives in the UI</th></tr>
          </thead>
          <tbody>
            <tr><td>Attractiveness score weights</td><td className="tab">See the six-component formula above</td><td>Drives every score, tile, ring, and filter count</td></tr>
            <tr><td>High Opportunity threshold</td><td className="tab">score &gt;= 75</td><td>KPI strip, filter tab, dashboard greeting line</td></tr>
            <tr><td>Loss ratio expansion guardrail</td><td className="tab">&lt; 60 percent to permit expansion</td><td>Guardrail rule on every client record</td></tr>
            <tr><td>Loss ratio health bands</td><td className="tab">&lt;55% healthy, 55 to 64% watch, 65%+ elevated</td><td>Portfolio KPI tone, client detail stat block</td></tr>
            <tr><td>Renewal urgency window</td><td className="tab">within 45 days is urgent, within 90 days is a radar item</td><td>Client tile, renewal filter, KPI strip</td></tr>
            <tr><td>Offer ranking weight</td><td className="tab">Confidence tier beats premium size, by a factor of one billion</td><td>Cross-sell and upsell dashboard sort order</td></tr>
            <tr><td>Advisor system prompt and data discipline rules</td><td className="tab">Plain text inside the code</td><td>Every advisor response on every client</td></tr>
            <tr><td>List of broker personas</td><td className="tab">Priya Sharma and Rahul Desai</td><td>Login screen, access control simulation</td></tr>
          </tbody>
        </table>

        <h2>Coming after this proof of concept</h2>
        <ul>
          <li>Meeting notes and transcripts flow into actionable CRM leads.</li>
          <li>Guardrail rules editable by underwriters and compliance, with versioning.</li>
          <li>Live event triggering from policy, claims, news, and market feeds.</li>
          <li>Pilot measurement against baseline for cross sell, retention, and productivity.</li>
          <li>Structured pitch decks generated from approved templates.</li>
        </ul>

        <h2>This demonstration</h2>
        <ul>
          <li>All data is synthetic. Two broker personas, ten clients.</li>
          <li>The advisor is a live model hosted through the Howden Azure tenant in production. In this demonstration it is called through a secured server side proxy.</li>
        </ul>
      </div>

      <div className="mt-10 text-center text-[11px] tracking-wide" style={{ color: 'var(--ink-4)' }}>
        Proof of concept. Synthetic data throughout. Built by Altius Soft.
      </div>
    </div>
  </div>
);

/* ============================================================
   KPI STRIP
   ============================================================ */

const KPIStrip = ({ clients, leads, actions }) => {
  const totalPrem = clients.reduce((a, c) => a + c.premium, 0);
  const potentialPrem = clients.reduce((a, c) => a + computePotentialFromGaps(c), 0);
  const avgLR = clients.length ? clients.reduce((a, c) => a + c.lossRatio, 0) / clients.length : 0;
  const renewals90 = clients.filter(c => {
    const d = daysBetween(c.renewalDate); return d >= 0 && d <= 90;
  }).length;
  const highOpps = clients.filter(c => computeAttractivenessScore(c) >= 75).length;
  const items = [
    { label: 'Portfolio Premium', value: formatINR(totalPrem), sub: `across ${clients.length} clients`, tone: 'ink' },
    { label: 'Potential Pipeline', value: formatINR(potentialPrem), sub: 'from identified gaps', tone: 'emerald', ai: true },
    { label: 'Average Loss Ratio', value: `${avgLR.toFixed(1)}%`, sub: avgLR < 55 ? 'within healthy range' : avgLR < 65 ? 'in the watch zone' : 'above healthy range', tone: avgLR < 55 ? 'emerald' : avgLR < 65 ? 'amber' : 'rose' },
    { label: 'Renewals within 90 days', value: renewals90, sub: 'requiring attention', tone: renewals90 >= 3 ? 'amber' : 'ink' },
    { label: 'High Opportunity', value: highOpps, sub: 'clients scoring at least 75', tone: 'emerald', ai: true },
    { label: 'Leads Created', value: leads.length, sub: `${actions} actions this session`, tone: 'ink' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px overflow-hidden rounded-xl hairline" style={{ background: 'var(--hair)' }}>
      {items.map((it, i) => {
        const toneFg = it.tone === 'emerald' ? 'var(--emerald)' : it.tone === 'rose' ? 'var(--rose)' : it.tone === 'amber' ? 'var(--amber)' : 'var(--ink)';
        return (
          <div key={i} className="p-4" style={{ background: 'var(--surface)' }}>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>{it.label}</span>
                {it.ai ? <AiTag size="xs" label="AI" /> : null}
              </div>
              <span className="font-display text-[22px] leading-none tabular" style={{ color: toneFg }}>{it.value}</span>
              {it.sub ? <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>{it.sub}</span> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ============================================================
   CLIENT TILE
   ============================================================ */

const ClientTile = ({ client, onClick }) => {
  const dtr = daysBetween(client.renewalDate);
  const urgent = dtr >= 0 && dtr <= 45;
  const past = dtr < 0;
  const TIcon = trendIcon(client.claimsTrend);
  const tone = scoreTone(computeAttractivenessScore(client));
  const blocked = !canPitchExpansion(client);

  return (
    <button
      onClick={onClick}
      className="tile-pop text-left p-5 rounded-xl hairline relative overflow-hidden"
      style={{ background: 'var(--surface)' }}
    >
      <div
        className="absolute inset-x-0 top-0"
        style={{ height: 3, background: tone.fg, opacity: 0.75 }}
      />
      {blocked && (
        <div className="absolute right-3 top-3 flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'var(--rose-soft)', color: 'var(--rose)', fontSize: 10 }}>
          <Lock size={9} /> Expansion blocked
        </div>
      )}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <Building2 size={12} style={{ color: 'var(--ink-3)' }} />
            <span className="text-[10.5px] uppercase tracking-[0.14em] truncate" style={{ color: 'var(--ink-3)' }}>
              {client.industry}
            </span>
          </div>
          <h3 className="font-display text-[18px] leading-[1.15]" style={{ color: 'var(--ink)' }}>
            {client.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11.5px]" style={{ color: 'var(--ink-4)' }}>
            <MapPin size={10} /> {client.city}, {client.state}
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <ScoreRing score={computeAttractivenessScore(client)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <div className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-4)' }}>Premium</div>
          <div className="text-[13.5px] tabular mt-0.5" style={{ color: 'var(--ink)' }}>{formatINR(client.premium)}</div>
        </div>
        <div>
          <div className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-4)' }}>Loss Ratio</div>
          <div className="text-[13.5px] tabular mt-0.5" style={{ color: client.lossRatio > 60 ? 'var(--rose)' : client.lossRatio > 50 ? 'var(--amber)' : 'var(--emerald)' }}>
            {client.lossRatio}%
          </div>
        </div>
        <div>
          <div className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-4)' }}>Claims</div>
          <div className="text-[13.5px] flex items-center gap-1 mt-0.5" style={{ color: trendColor(client.claimsTrend) }}>
            <TIcon size={13} strokeWidth={2.5} />
            <span className="capitalize text-[11.5px]">{client.claimsTrend}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 hairline-t">
        <div className="flex items-center gap-1.5 text-[11.5px]" style={{ color: past ? 'var(--rose)' : urgent ? 'var(--amber)' : 'var(--ink-3)' }}>
          <Clock size={11} />
          <span className="tabular">
            {past ? `${Math.abs(dtr)} days overdue` : dtr === 0 ? 'Renews today' : `${dtr} days to renewal`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11.5px] font-medium" style={{ color: tone.fg }}>
            <span>{tone.label}</span>
            <AiTag size="xs" label="AI" />
            <ChevronRight size={13} />
          </div>
        </div>
      </div>

      {client.gaps.length > 0 && (
        <div className="mt-3 pt-3 hairline-t flex flex-wrap gap-1">
          {client.gaps.slice(0, 2).map((g, i) => (
            <span key={i} className="text-[10.5px] px-2 py-0.5 rounded" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}>
              + {g}
            </span>
          ))}
          {client.gaps.length > 2 && (
            <span className="text-[10.5px] px-2 py-0.5 rounded" style={{ color: 'var(--ink-4)' }}>
              and {client.gaps.length - 2} more
            </span>
          )}
        </div>
      )}
    </button>
  );
};

/* ============================================================
   FEATURE CONTRIBUTION CHART
   ============================================================ */


/* ============================================================
   GUARDRAILS
   ============================================================ */

const GuardrailsList = ({ guardrails }) => {
  const statusMeta = {
    pass: { Icon: CheckCircle2, fg: 'var(--emerald)', bg: 'var(--emerald-soft)', label: 'Passes' },
    warn: { Icon: AlertTriangle, fg: 'var(--amber)', bg: 'var(--amber-soft)', label: 'Warning' },
    fail: { Icon: XCircle, fg: 'var(--rose)', bg: 'var(--rose-soft)', label: 'Fails' },
  };
  return (
    <div className="flex flex-col">
      {guardrails.map((g, i) => {
        const m = statusMeta[g.status];
        return (
          <div key={i} className="flex items-start gap-3 py-3" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--hair)' }}>
            <div
              className="shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: m.bg, color: m.fg }}
            >
              <m.Icon size={13} strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-medium" style={{ color: 'var(--ink)' }}>{g.rule}</span>
                <span className="chip tabular" style={{ background: m.bg, color: m.fg, borderColor: 'transparent' }}>
                  {m.label}
                </span>
              </div>
              <div className="text-[12px] mt-1" style={{ color: 'var(--ink-3)' }}>{g.detail}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ============================================================
   EVIDENCE
   ============================================================ */

const EvidencePanel = ({ evidence }) => (
  <div className="grid grid-cols-1 gap-2">
    {evidence.map((e, i) => (
      <div key={i} className="p-3 rounded-lg flex items-start gap-3" style={{ background: 'var(--canvas-2)' }}>
        <FileSearch size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--brand)' }} />
        <div className="min-w-0 flex-1">
          <div className="text-[11.5px] font-medium" style={{ color: 'var(--ink)' }}>{e.src}</div>
          <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--ink-3)' }}>{e.note}</div>
        </div>
      </div>
    ))}
  </div>
);

/* ============================================================
   SIGNALS
   ============================================================ */




/* ============================================================
   CHAT ADVISOR
   ============================================================ */

const starters = (client) => {
  if (!client) {
    return [
      'Which clients in my portfolio have a cyber cover gap at present?',
      'Which accounts have a renewal in the next thirty days?',
      'Summarise the overall health of my portfolio in three short paragraphs.',
    ];
  }
  const first = client.name.split(' ')[0];
  const blocked = !canPitchExpansion(client);
  const list = [];
  list.push(`What should I offer ${first}, and what should I not offer right now?`);
  if (!blocked) {
    list.push(`Draft a short pitch for the most important coverage gap at ${first}.`);
  } else {
    list.push(`The guardrails have blocked expansion for ${first}. What should I resolve first?`);
  }
  list.push(`Walk me through the renewal strategy for the next forty five days.`);
  list.push(`Why did the opportunity score land at ${computeAttractivenessScore(client)}? Explain the top three drivers.`);
  return list;
};

/* ============================================================
   CLIENT DETAIL
   ============================================================ */

const ClientDetail = ({ client, onBack, onAudit }) => {
  useEffect(() => { onAudit('Viewed Client', client.name); /* eslint-disable-next-line */ }, [client.id]);

  const dtr = daysBetween(client.renewalDate);
  const TIcon = trendIcon(client.claimsTrend);
  const expansionAllowed = canPitchExpansion(client);

  return (
    <div className="fade-up">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[12.5px] mb-4 hover:underline"
        style={{ color: 'var(--ink-3)' }}
      >
        <ArrowLeft size={13} /> Back to the portfolio
      </button>

      {/* HERO */}
      <div className="p-6 rounded-2xl hairline mb-4" style={{ background: 'var(--surface)' }}>
        <div className="flex flex-wrap items-start gap-6 justify-between">
          <div className="flex-1 min-w-[260px]">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Chip tone="brand" icon={Briefcase}>{client.industry}</Chip>
              <Chip icon={MapPin}>{client.city}, {client.state}</Chip>
              <Chip icon={Users}>{client.employees.toLocaleString('en-IN')} employees</Chip>
              <Chip icon={CircleDollarSign}>Revenue {formatINR(client.revenue)}</Chip>
            </div>
            <h1 className="font-display text-[32px] leading-tight" style={{ color: 'var(--ink)' }}>{client.name}</h1>
            <p className="text-[13.5px] mt-2 max-w-2xl" style={{ color: 'var(--ink-2)', lineHeight: 1.6 }}>
              {client.narrative}
            </p>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex flex-col items-center">
              <ScoreRing score={computeAttractivenessScore(client)} size={72} stroke={5} />
              <div className="mt-2">
                <AiTag size="xs" label="AI" />
              </div>
              <div className="text-[11px] mt-1" style={{ color: scoreTone(computeAttractivenessScore(client)).fg }}>{scoreTone(computeAttractivenessScore(client)).label}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-5 mt-5 hairline-t">
          <StatBlock label="Annual Premium" value={formatINR(client.premium)} sub="on the FY25 basis" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>Potential from Gaps</span>
              <AiTag size="xs" label="AI" />
            </div>
            <span className="font-display text-[22px] leading-none tabular" style={{ color: canPitchExpansion(client) ? 'var(--emerald)' : 'var(--ink-4)' }}>
              {formatINR(computePotentialFromGaps(client))}
            </span>
            <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>
              {canPitchExpansion(client)
                ? `sum across ${(client.policyRecommendations?.offer || []).length} recommended items`
                : 'expansion blocked by a guardrail'}
            </span>
          </div>
          <StatBlock
            label="Loss Ratio"
            value={`${client.lossRatio}%`}
            sub={client.lossRatio < 55 ? 'within appetite' : client.lossRatio < 65 ? 'in the watch zone' : 'above the retention limit'}
            tone={client.lossRatio < 55 ? 'emerald' : client.lossRatio < 65 ? 'amber' : 'rose'}
          />
          <div className="flex flex-col gap-1">
            <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>Claims Trend</span>
            <span className="font-display text-[22px] leading-none flex items-center gap-2" style={{ color: trendColor(client.claimsTrend) }}>
              <TIcon size={22} strokeWidth={2.5} />
              <span className="capitalize">{client.claimsTrend}</span>
            </span>
            <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>over FY22 to FY25</span>
          </div>
          <StatBlock
            label="Renewal"
            value={dtr < 0 ? `${Math.abs(dtr)} days late` : `${dtr} days`}
            sub={new Date(client.renewalDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            tone={dtr < 0 ? 'rose' : dtr <= 45 ? 'amber' : 'ink'}
          />
        </div>

        {!expansionAllowed && (
          <div className="mt-5 p-3 rounded-lg flex items-start gap-3" style={{ background: 'var(--rose-soft)', color: 'var(--rose)', border: '1px solid rgba(190,18,60,0.15)' }}>
            <Lock size={14} className="mt-0.5 shrink-0" />
            <div className="text-[12.5px]" style={{ lineHeight: 1.55 }}>
              Expansion pitches are blocked for this client by the guardrail engine. At least one rule has failed, and the restriction is enforced in code, not only through prompting. The advisor will help you with remediation, repricing, and risk engineering instead. Resolve the failing rule before attempting an expansion proposal.
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <PolicyRecommendationsPanel client={client} />

          <Panel
            title="Business Guardrails"
            subtitle="These rules are checked in code before any expansion pitch is permitted."
            icon={ShieldCheck}
          >
            <GuardrailsList guardrails={client.guardrails} />
          </Panel>

          <Panel
            title="Source Evidence"
            subtitle="The records that the scoring and recommendations were grounded in."
            icon={FileText}
          >
            <EvidencePanel evidence={client.evidence} />
          </Panel>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <Panel title="Coverage map" icon={Layers}>
            <div className="mb-4">
              <div className="text-[11px] uppercase tracking-[0.14em] mb-2" style={{ color: 'var(--ink-3)' }}>In force ({client.currentCoverages.length})</div>
              <div className="flex flex-wrap gap-1.5">
                {client.currentCoverages.map((c, i) => (
                  <span key={i} className="chip" style={{ background: 'var(--emerald-soft)', color: 'var(--emerald)', borderColor: 'transparent' }}>
                    <CheckCircle2 size={11} strokeWidth={2.3} />{c}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] mb-2" style={{ color: 'var(--ink-3)' }}>Gaps identified ({client.gaps.length})</div>
              <div className="flex flex-wrap gap-1.5">
                {client.gaps.map((c, i) => (
                  <span key={i} className="chip" style={{ background: 'var(--amber-soft)', color: 'var(--amber)', borderColor: 'transparent' }}>
                    <Plus size={11} strokeWidth={2.5} />{c}
                  </span>
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="Premium trajectory" icon={TrendingUp} subtitle="FY22 through FY25, in Crore Rupees">
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={client.premiumHistory} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`g-${client.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--brand)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="y" tick={{ fontSize: 10, fill: 'var(--ink-3)', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9.5, fill: 'var(--ink-3)', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} width={28} />
                  <Tooltip contentStyle={{ fontSize: 11, border: '1px solid var(--hair)', borderRadius: 8, fontFamily: 'Geist' }} formatter={(v) => [`${v} Crore Rupees`, 'Premium']} />
                  <Area type="monotone" dataKey="v" stroke="var(--brand)" strokeWidth={2} fill={`url(#g-${client.id})`} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Claims history" icon={Activity} subtitle="Incurred losses by year, in Crore Rupees, with claim count">
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={client.claimsHistory} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
                  <XAxis dataKey="y" tick={{ fontSize: 10, fill: 'var(--ink-3)', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 9.5, fill: 'var(--ink-3)', fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} width={28} />
                  <Tooltip
                    contentStyle={{ fontSize: 11, border: '1px solid var(--hair)', borderRadius: 8, fontFamily: 'Geist' }}
                    formatter={(v, name, p) => [`${v} Crore Rupees from ${p.payload.n} claims`, 'Losses']}
                  />
                  <Bar dataKey="amt" radius={[3, 3, 0, 0]} barSize={24}>
                    {client.claimsHistory.map((d, i) => (
                      <Cell key={i} fill={d.amt > 1.5 ? 'var(--rose)' : d.amt > 0.8 ? 'var(--amber)' : 'var(--emerald)'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

const ChatPanel = ({ open, onClose, client, portfolio, brokerName, messagesByClient, setMessagesByClient, onAudit, onCreateLead }) => {
  const key = client ? client.id : '__portfolio__';
  const messages = messagesByClient[key] || [];
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = async (text) => {
    const content = (text || draft).trim();
    if (!content || loading) return;
    setError(null);
    const next = [...messages, { role: 'user', content, ts: Date.now() }];
    setMessagesByClient({ ...messagesByClient, [key]: next });
    setDraft('');
    setLoading(true);
    onAudit('Advisor Query Submitted', client ? `About ${client.name}` : 'Portfolio level question');
    try {
      const reply = await askAdvisor(content, client, next, portfolio, brokerName);
      setMessagesByClient(prev => ({
        ...prev,
        [key]: [...(prev[key] || next), { role: 'assistant', content: reply, ts: Date.now() }],
      }));
      if (/pitch|draft|snippet|email/i.test(content)) onAudit('Pitch Draft Generated', client ? client.name : 'Portfolio view');
    } catch (e) {
      setError(e.message || 'Something went wrong when contacting the advisor.');
    } finally {
      setLoading(false);
    }
  };

  const makeLead = (messageIndex) => {
    if (!client) return;
    const assistantMessage = messages[messageIndex];
    if (!assistantMessage || assistantMessage.role !== 'assistant') return;
    const prior = messages.slice(0, messageIndex).reverse().find(m => m.role === 'user');
    onCreateLead({
      id: `lead_${Date.now()}`,
      clientId: client.id,
      clientName: client.name,
      createdAt: Date.now(),
      pitch: assistantMessage.content,
      originatingPrompt: prior ? prior.content : '',
      conversationKey: key,
      estimatedValue: computePotentialFromGaps(client),
      status: 'draft',
    });
    onAudit('Lead Created', `Saved to CRM for ${client.name}`);
  };

  const copyMessage = (content) => {
    try { navigator.clipboard?.writeText(content); } catch { /* ignore */ }
    onAudit('Pitch Copied', client ? client.name : 'Portfolio view');
  };

  return (
    <aside
      className="flex flex-col hairline-l shrink-0"
      style={{
        width: open ? 400 : 0,
        transition: 'width .3s cubic-bezier(.2,.7,.2,1)',
        background: 'var(--surface)',
        overflow: 'hidden',
      }}
    >
      <div className="p-4 hairline-b flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%)' }}
          >
            <Sparkles size={14} color="#fff" />
          </div>
          <div className="min-w-0">
            <div className="font-display text-[15px] leading-tight" style={{ color: 'var(--ink)' }}>Sales Advisor</div>
            <div className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--ink-3)' }}>
              {client ? <>Briefing on <span style={{ color: 'var(--ink-2)' }}>{client.name}</span></> : 'Portfolio view. Ask anything about your accounts.'}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-1" style={{ color: 'var(--ink-3)' }}>
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-slim p-4 flex flex-col gap-3" style={{ background: 'var(--canvas)' }}>
        {messages.length === 0 && (
          <div className="flex flex-col gap-3">
            <div
              className="p-3.5 rounded-lg text-[12.5px]"
              style={{ background: 'var(--brand-soft)', color: 'var(--ink-2)', border: '1px solid rgba(11,59,92,0.12)', lineHeight: 1.6 }}
            >
              <div className="flex items-center gap-1.5 font-medium mb-1.5" style={{ color: 'var(--brand)' }}>
                <Sparkles size={12} /> Grounded on your client data
              </div>
              {client
                ? `The advisor has been given the full brief for ${client.name}, including policies, claims, coverage gaps, guardrail states, and the recent signals shown on this page. Ask for a pitch, an explanation of the score, or a renewal strategy, and the answer will refer to the specific numbers on screen.`
                : 'The advisor has been given a full brief for every client in your portfolio, including policies, claims, coverage gaps, guardrail states, and recent signals. Ask which clients have a particular gap, which renewals are coming up, where the best cross sell opportunities sit, or anything else about your book.'}
              {client && !canPitchExpansion(client) && (
                <div className="mt-2 p-2 rounded flex items-start gap-1.5 text-[11.5px]" style={{ background: 'rgba(190,18,60,0.08)', color: 'var(--rose)' }}>
                  <Lock size={11} className="mt-0.5 shrink-0" />
                  <span>Expansion pitches are currently blocked for this client. The advisor will redirect such requests.</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>Suggested starters</div>
              {starters(client).map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s)}
                  disabled={loading}
                  className="text-left p-3 rounded-lg hairline text-[12.5px] tile-pop"
                  style={{ background: 'var(--surface)', color: 'var(--ink-2)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[92%] rounded-lg p-3 text-[12.5px] markdown"
              style={m.role === 'user'
                ? { background: 'var(--brand)', color: '#fff', lineHeight: 1.55 }
                : { background: 'var(--surface)', color: 'var(--ink-2)', border: '1px solid var(--hair)', lineHeight: 1.6 }
              }
            >
              {m.role === 'assistant' ? renderMarkdown(m.content) : m.content}
              {m.role === 'assistant' && client && (
                <div className="mt-3 pt-3 flex items-center gap-2 flex-wrap" style={{ borderTop: '1px solid var(--hair)' }}>
                  <button
                    onClick={() => makeLead(i)}
                    className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md"
                    style={{ background: 'var(--brand)', color: '#fff' }}
                  >
                    <ClipboardList size={11} /> Save as CRM lead
                  </button>
                  <button
                    onClick={() => copyMessage(m.content)}
                    className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md hairline"
                    style={{ background: 'var(--surface)', color: 'var(--ink-2)' }}
                  >
                    <Copy size={11} /> Copy text
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg p-3 text-[12px] flex items-center gap-2 hairline" style={{ background: 'var(--surface)', color: 'var(--ink-3)' }}>
              <Loader2 size={13} className="animate-spin" />
              <span>The advisor is thinking.</span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg p-3 text-[11.5px]" style={{ background: 'var(--rose-soft)', color: 'var(--rose)', lineHeight: 1.55 }}>
            {error}
          </div>
        )}

        <div ref={endRef} />
      </div>

      <div className="p-3 hairline-t" style={{ background: 'var(--surface)' }}>
        <div className="flex items-end gap-2 rounded-xl hairline p-2" style={{ background: 'var(--canvas)' }}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            placeholder={client ? `Ask about ${client.name.split(' ')[0]}` : 'Ask about your portfolio'}
            rows={2}
            className="flex-1 resize-none bg-transparent outline-none text-[12.5px] placeholder:text-[var(--ink-4)]"
            style={{ color: 'var(--ink)', lineHeight: 1.55 }}
            disabled={loading}
          />
          <button
            onClick={() => send()}
            disabled={loading || !draft.trim()}
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: draft.trim() ? 'var(--brand)' : 'var(--canvas-2)',
              color: draft.trim() ? '#fff' : 'var(--ink-4)',
              transition: 'background .2s',
            }}
          >
            <Send size={13} />
          </button>
        </div>
        <div className="text-[10px] mt-1.5 flex items-center gap-1" style={{ color: 'var(--ink-4)' }}>
          <Sparkles size={9} /> Sales Intelligence engine by Altius Soft. The reply is grounded in the client data shown on this page.
        </div>
      </div>
    </aside>
  );
};

/* ============================================================
   AUDIT DRAWER
   ============================================================ */

const AuditDrawer = ({ open, onClose, log }) => (
  <div
    className="fixed inset-y-0 right-0 z-40"
    style={{
      width: open ? 380 : 0,
      transition: 'width .3s cubic-bezier(.2,.7,.2,1)',
      overflow: 'hidden',
    }}
  >
    <div className="h-full flex flex-col" style={{ background: 'var(--surface)', borderLeft: '1px solid var(--hair)' }}>
      <div className="p-4 hairline-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={15} style={{ color: 'var(--brand)' }} />
          <div>
            <div className="font-display text-[15px]" style={{ color: 'var(--ink)' }}>Audit log</div>
            <div className="text-[11px]" style={{ color: 'var(--ink-3)' }}>A record of every action taken during this session.</div>
          </div>
        </div>
        <button onClick={onClose} className="p-1" style={{ color: 'var(--ink-3)' }}><X size={15} /></button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-slim p-4 flex flex-col gap-2">
        {log.length === 0 && (
          <div className="text-[12px]" style={{ color: 'var(--ink-4)' }}>No actions have been recorded yet during this session.</div>
        )}
        {log.slice().reverse().map((l, i) => (
          <div key={i} className="p-3 rounded-lg hairline text-[12px]" style={{ background: 'var(--canvas)' }}>
            <div className="flex items-center justify-between">
              <span className="font-medium" style={{ color: 'var(--ink)' }}>{l.action}</span>
              <span className="font-mono text-[10.5px]" style={{ color: 'var(--ink-4)' }}>
                {new Date(l.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            {l.detail && <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--ink-3)' }}>{l.detail}</div>}
            <div className="text-[10px] mt-1 font-mono" style={{ color: 'var(--ink-4)' }}>Actor is {l.actor}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ============================================================
   CRM LEADS DRAWER
   ============================================================ */

const LeadsDrawer = ({ open, onClose, leads, clients, onOpenClient, onMarkAccepted, onDelete }) => (
  <div
    className="fixed inset-y-0 right-0 z-40"
    style={{
      width: open ? 440 : 0,
      transition: 'width .3s cubic-bezier(.2,.7,.2,1)',
      overflow: 'hidden',
    }}
  >
    <div className="h-full flex flex-col" style={{ background: 'var(--surface)', borderLeft: '1px solid var(--hair)' }}>
      <div className="p-4 hairline-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList size={15} style={{ color: 'var(--brand)' }} />
          <div>
            <div className="font-display text-[15px]" style={{ color: 'var(--ink)' }}>CRM Leads</div>
            <div className="text-[11px]" style={{ color: 'var(--ink-3)' }}>Each lead links back to the conversation it originated from.</div>
          </div>
        </div>
        <button onClick={onClose} className="p-1" style={{ color: 'var(--ink-3)' }}><X size={15} /></button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-slim p-4 flex flex-col gap-3">
        {leads.length === 0 && (
          <div className="p-8 text-center rounded-lg hairline" style={{ background: 'var(--canvas)' }}>
            <ClipboardList size={20} style={{ color: 'var(--ink-4)', margin: '0 auto 10px' }} />
            <div className="text-[12.5px]" style={{ color: 'var(--ink-3)' }}>No leads have been created yet.</div>
            <div className="text-[11.5px] mt-1.5" style={{ color: 'var(--ink-4)' }}>
              When the advisor drafts a pitch for a client, you can save it here as a lead. Each lead keeps a link to the conversation that produced it.
            </div>
          </div>
        )}
        {leads.slice().reverse().map((lead) => {
          const client = clients.find(c => c.id === lead.clientId);
          return (
            <div key={lead.id} className="p-3 rounded-lg hairline" style={{ background: 'var(--canvas)' }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="font-display text-[14.5px]" style={{ color: 'var(--ink)' }}>{lead.clientName}</div>
                  <div className="text-[10.5px] mt-0.5" style={{ color: 'var(--ink-4)' }}>
                    Created {new Date(lead.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <Chip tone={lead.status === 'accepted' ? 'emerald' : 'amber'}>
                  {lead.status === 'accepted' ? 'Accepted' : 'Draft'}
                </Chip>
              </div>
              {lead.originatingPrompt && (
                <div className="text-[11px] mb-2 p-2 rounded" style={{ background: 'var(--surface)', color: 'var(--ink-3)' }}>
                  <span className="font-medium" style={{ color: 'var(--ink-2)' }}>Originating question: </span>
                  {lead.originatingPrompt}
                </div>
              )}
              <div className="text-[11.5px] p-2.5 rounded markdown" style={{ background: 'var(--surface)', color: 'var(--ink-2)', lineHeight: 1.55, maxHeight: 180, overflow: 'auto' }}>
                {renderMarkdown(lead.pitch)}
              </div>
              <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
                <div className="text-[11px] tabular" style={{ color: 'var(--emerald)' }}>
                  <CircleDollarSign size={11} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                  Estimated value {formatINR(lead.estimatedValue)}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenClient(client)}
                    className="flex items-center gap-1 text-[11px] px-2 py-1 rounded hairline"
                    style={{ background: 'var(--surface)', color: 'var(--ink-2)' }}
                    title="Return to the conversation that produced this lead"
                  >
                    <Link2 size={10} /> Open conversation
                  </button>
                  {lead.status !== 'accepted' && (
                    <button
                      onClick={() => onMarkAccepted(lead.id)}
                      className="flex items-center gap-1 text-[11px] px-2 py-1 rounded"
                      style={{ background: 'var(--emerald)', color: '#fff' }}
                    >
                      <CheckCircle2 size={10} /> Mark accepted
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(lead.id)}
                    className="flex items-center justify-center w-6 h-6 rounded"
                    style={{ color: 'var(--ink-4)' }}
                    title="Remove lead"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

/* ============================================================
   APP
   ============================================================ */

export default function App() {
  const [view, setView] = useState('login');
  const [brokerId, setBrokerId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [chatOpen, setChatOpen] = useState(true);
  const [auditOpen, setAuditOpen] = useState(false);
  const [leadsOpen, setLeadsOpen] = useState(false);
  const [auditLog, setAuditLog] = useState([]);
  const [leads, setLeads] = useState([]);
  const [messagesByClient, setMessagesByClient] = useState({});

  const broker = BROKERS.find(b => b.id === brokerId);
  const myClients = useMemo(
    () => CLIENTS.filter(c => c.broker === brokerId),
    [brokerId]
  );
  const myLeads = useMemo(
    () => leads.filter(l => myClients.some(c => c.id === l.clientId)),
    [leads, myClients]
  );

  const filtered = useMemo(() => {
    let arr = myClients;
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.gaps.some(g => g.toLowerCase().includes(q))
      );
    }
    if (filter === 'renewals') arr = arr.filter(c => { const d = daysBetween(c.renewalDate); return d >= 0 && d <= 90; });
    if (filter === 'opportunity') arr = arr.filter(c => computeAttractivenessScore(c) >= 75);
    if (filter === 'risk') arr = arr.filter(c => c.lossRatio > 60 || c.claimsTrend === 'up');
    return arr;
  }, [myClients, search, filter]);

  const selected = selectedId ? CLIENTS.find(c => c.id === selectedId) : null;

  const logAudit = (action, detail) => {
    setAuditLog(prev => [...prev, { ts: Date.now(), action, detail, actor: broker ? broker.name : 'anonymous' }]);
  };

  const createLead = (lead) => {
    setLeads(prev => [...prev, lead]);
  };
  const markAccepted = (id) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'accepted' } : l));
    logAudit('Lead Accepted', `Lead ${id.slice(-6)} was marked accepted`);
  };
  const deleteLead = (id) => {
    setLeads(prev => prev.filter(l => l.id !== id));
    logAudit('Lead Removed', `Lead ${id.slice(-6)} was deleted`);
  };

  const filters = [
    { k: 'all', label: 'All clients', count: myClients.length },
    { k: 'renewals', label: 'Renewals within ninety days', count: myClients.filter(c => { const d = daysBetween(c.renewalDate); return d >= 0 && d <= 90; }).length },
    { k: 'opportunity', label: 'High opportunity', count: myClients.filter(c => computeAttractivenessScore(c) >= 75).length },
    { k: 'risk', label: 'Risk flags', count: myClients.filter(c => c.lossRatio > 60 || c.claimsTrend === 'up').length },
  ];

  if (view === 'about') {
    return (
      <div className="app-root">
        <FontAndTokens />
        <About onBack={() => setView(brokerId ? 'dashboard' : 'login')} />
      </div>
    );
  }

  if (!brokerId) return (
    <div className="app-root">
      <FontAndTokens />
      <Login
        onLogin={(id) => {
          setBrokerId(id);
          const b = BROKERS.find(x => x.id === id);
          setAuditLog([{ ts: Date.now(), action: 'Session started', detail: `Signed in as ${b.name}`, actor: b.name }]);
          setView('dashboard');
        }}
        onAbout={() => setView('about')}
        clients={CLIENTS}
      />
    </div>
  );

  return (
    <div className="app-root min-h-screen canvas-noise">
      <FontAndTokens />

      <header
        className="sticky top-0 z-30 hairline-b glass"
        style={{ background: 'rgba(251,250,246,0.82)' }}
      >
        <div className="px-6 h-14 flex items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Logo />
            <div className="hidden md:flex items-center gap-2 text-[11.5px]" style={{ color: 'var(--ink-3)' }}>
              <ChevronRight size={12} />
              <span>Portfolio of {broker.name}</span>
              {selected && (<><ChevronRight size={12} /><span style={{ color: 'var(--ink-2)' }}>{selected.name}</span></>)}
            </div>
          </div>

          <div className="flex-1 max-w-md hidden md:block">
            <div className="flex items-center gap-2 px-3 h-9 rounded-lg hairline" style={{ background: 'var(--surface)' }}>
              <Search size={14} style={{ color: 'var(--ink-3)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search clients, industries, or coverage gaps"
                className="flex-1 bg-transparent outline-none text-[12.5px] placeholder:text-[var(--ink-4)]"
                style={{ color: 'var(--ink)' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ color: 'var(--ink-4)' }}><X size={13} /></button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('about')}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg hairline text-[11.5px]"
              style={{ background: 'var(--surface)', color: 'var(--ink-2)' }}
              title="About this demonstration"
            >
              <Info size={13} />
            </button>

            <button
              onClick={() => { setLeadsOpen(o => !o); setAuditOpen(false); }}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg hairline text-[11.5px]"
              style={{ background: 'var(--surface)', color: 'var(--ink-2)' }}
              title="CRM leads"
            >
              <ClipboardList size={13} /> Leads
              <span className="chip font-mono" style={{ background: 'var(--canvas-2)', borderColor: 'transparent', color: 'var(--ink-3)' }}>{myLeads.length}</span>
            </button>

            <button
              onClick={() => { setAuditOpen(o => !o); setLeadsOpen(false); }}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg hairline text-[11.5px]"
              style={{ background: 'var(--surface)', color: 'var(--ink-2)' }}
              title="Audit log"
            >
              <History size={13} /> Audit
              <span className="chip font-mono" style={{ background: 'var(--canvas-2)', borderColor: 'transparent', color: 'var(--ink-3)' }}>{auditLog.length}</span>
            </button>

            <button
              onClick={() => setChatOpen(o => !o)}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-[11.5px]"
              style={{ background: chatOpen ? 'var(--brand)' : 'var(--surface)', color: chatOpen ? '#fff' : 'var(--ink-2)', border: `1px solid ${chatOpen ? 'var(--brand)' : 'var(--hair)'}` }}
            >
              <MessageSquare size={13} /> Advisor
            </button>

            <div className="h-9 flex items-center gap-2 pl-3 pr-1 rounded-lg hairline ml-1" style={{ background: 'var(--surface)' }}>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px]"
                style={{ background: `linear-gradient(135deg, ${broker.tone} 0%, ${broker.tone}CC 100%)` }}
              >
                {broker.initials}
              </div>
              <div className="hidden lg:block">
                <div className="text-[11.5px] leading-none font-medium" style={{ color: 'var(--ink)' }}>{broker.name}</div>
                <div className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: 'var(--ink-3)' }}>
                  <UserCheck size={9} /> access enforced
                </div>
              </div>
              <button
                onClick={() => {
                  logAudit('Session ended');
                  setBrokerId(null); setSelectedId(null); setMessagesByClient({}); setView('login');
                }}
                className="w-7 h-7 ml-1 rounded-md flex items-center justify-center"
                style={{ color: 'var(--ink-3)' }}
                title="Sign out"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <main className="flex-1 min-w-0 p-6 pb-16">
          {!selected ? (
            <>
              <div className="mb-6 flex items-end justify-between flex-wrap gap-4 fade-up">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em]" style={{ color: 'var(--ink-3)' }}>
                    {broker.region}
                  </div>
                  <h1 className="font-display text-[32px] leading-tight mt-1" style={{ color: 'var(--ink)' }}>
                    Good morning, <em className="italic" style={{ color: 'var(--brand)' }}>{broker.name.split(' ')[0]}</em>.
                  </h1>
                  <p className="text-[13px] mt-2 max-w-2xl" style={{ color: 'var(--ink-3)', lineHeight: 1.55 }}>
                    You have {myClients.length} clients under management. {myClients.filter(c => computeAttractivenessScore(c) >= 75).length} of them currently score as high opportunity, and {myClients.filter(c => { const d = daysBetween(c.renewalDate); return d >= 0 && d <= 45; }).length} have a renewal falling within the next forty five days.
                  </p>
                </div>
              </div>

              <div className="mb-5 fade-up">
                <KPIStrip clients={myClients} leads={myLeads} actions={auditLog.length} />
              </div>

              <div className="mb-4 flex items-center gap-1.5 flex-wrap fade-up">
                {filters.map(f => {
                  const active = filter === f.k;
                  return (
                    <button
                      key={f.k}
                      onClick={() => setFilter(f.k)}
                      className="flex items-center gap-2 h-8 px-3 rounded-lg text-[12px] hairline"
                      style={{
                        background: active ? 'var(--brand)' : 'var(--surface)',
                        color: active ? '#fff' : 'var(--ink-2)',
                        borderColor: active ? 'var(--brand)' : 'var(--hair)',
                      }}
                    >
                      {f.label}
                      <span className="chip font-mono"
                        style={{
                          background: active ? 'rgba(255,255,255,0.2)' : 'var(--canvas-2)',
                          color: active ? '#fff' : 'var(--ink-3)',
                          borderColor: 'transparent',
                          padding: '1px 6px',
                        }}>
                        {f.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {filtered.length === 0 ? (
                <div className="p-10 rounded-xl hairline text-center" style={{ background: 'var(--surface)' }}>
                  <div className="text-[13px]" style={{ color: 'var(--ink-3)' }}>
                    No clients match the current filter or search.
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
                  {filtered.map(c => (
                    <ClientTile
                      key={c.id}
                      client={c}
                      onClick={() => setSelectedId(c.id)}
                    />
                  ))}
                </div>
              )}

              <div className="mt-6 fade-up">
                <CrossSellDashboardPanel
                  clients={myClients}
                  onOpenClient={(id) => setSelectedId(id)}
                />
              </div>
            </>
          ) : (
            <ClientDetail
              client={selected}
              onBack={() => setSelectedId(null)}
              onAudit={logAudit}
            />
          )}
        </main>

        <ChatPanel
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          client={selected}
          portfolio={myClients}
          brokerName={broker ? broker.name : null}
          messagesByClient={messagesByClient}
          setMessagesByClient={setMessagesByClient}
          onAudit={logAudit}
          onCreateLead={createLead}
        />
      </div>

      <AuditDrawer open={auditOpen} onClose={() => setAuditOpen(false)} log={auditLog} />
      <LeadsDrawer
        open={leadsOpen}
        onClose={() => setLeadsOpen(false)}
        leads={myLeads}
        clients={CLIENTS}
        onOpenClient={(c) => { if (c) { setSelectedId(c.id); setLeadsOpen(false); } }}
        onMarkAccepted={markAccepted}
        onDelete={deleteLead}
      />
    </div>
  );
}
