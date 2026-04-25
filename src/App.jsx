import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  ArrowUp, Ban, Wand2, Download, Network, Calendar,
} from 'lucide-react';
// Broker, client, prospect data and Saverisk snapshots are generated at
// build time by scripts/excelToJson.mjs, which reads master.xlsx,
// policies.xlsx, rules.xlsx, and per-client files in data/clients/, then
// emits src/clientData.json. See the About page for the full data model.
import clientData from './clientData.json';

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
    .prose code { background: rgba(15,23,42,0.06); padding: 1px 5px; border-radius: 4px; font-size: 0.88em; font-family: 'JetBrains Mono', monospace; color: var(--ink); }

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

// Loss ratio, 3-year rolling. Computed as the pooled incurred claims across the
// three most recent complete policy years divided by the pooled earned premium
// over the same period, expressed as a percentage. Brokers and insurers use a
// rolling window rather than a single year because single year figures swing
// wildly with one large claim and are not a reliable base for rate or appetite
// decisions. Both premiumHistory and claimsHistory are raw inputs from the
// policy register and claims warehouse.
const computeLossRatio = (client) => {
  const ph = (client.premiumHistory || []).slice(-3);
  const ch = (client.claimsHistory || []).slice(-3);
  if (ph.length === 0 || ch.length === 0) return 0;
  const pooledPrem = ph.reduce((s, p) => s + (p.v || 0), 0);
  const pooledAmt = ch.reduce((s, c) => s + (c.amt || 0), 0);
  if (!pooledPrem || pooledPrem === 0) return 0;
  return Math.round((pooledAmt / pooledPrem) * 100);
};

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
  const lr = computeLossRatio(client);
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
   CLIENT DATA — read at build time from data/clients.xlsx
   ============================================================ */

const BROKERS = clientData.brokers;
const CLIENTS = clientData.clients;
const PROSPECTS = clientData.prospects || [];
const SR_SNAPSHOTS = clientData.srSnapshots || {};

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
    loss_ratio_pct: computeLossRatio(c),
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

const buildAdvisorSystemPrompt = (client, portfolio, brokerName, role = 'broker') => {
  const isAdmin = role === 'super';
  if (!client) {
    const brief = buildPortfolioBrief(portfolio, brokerName);
    if (isAdmin) {
      return `You are the Howden Sales Intelligence Advisor, in the operations dashboard mode. Howden is a broker, not an insurer.

The user is ${brokerName || 'an operations leader'} and is viewing all clients across both relationship managers' books. Your role is to answer portfolio-wide and operational questions: where the largest concentrations of risk sit, which renewals are clustering, which guardrails are tripping across the book, which industry segments are over or under-served. Be specific with client names, broker names, and numbers from the brief. When asked about a single broker's performance, frame it as a portfolio observation rather than a personal evaluation.

Combined portfolio brief, both books:
${JSON.stringify(brief, null, 2)}

Data discipline, which is the most important rule:
Use only numbers, names, dates, premiums, claims, guardrail states, and recommendations that are present in the brief above. If the user asks for a figure that is not in the brief — a specific quote, a market share, a benchmark beyond those listed, a competitor's win rate — say clearly that the figure is not available and suggest the relevant system to source it from, such as the underwriting desk or the placement team. Do not extrapolate. Do not cite sources such as "industry reports" unless that exact source is referenced for a specific client in the brief.

Style guidance:
Concise, business-appropriate prose. Indian currency conventions such as 3.85 Crore Rupees or 21.4 Lakh Rupees. Plain prose with light markdown only where it aids comprehension.`;
    }
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
    sector: client.sector,
    city: client.city,
    state: client.state,
    revenue_inr: client.revenue,
    employees: client.employees,
    listed: client.listed,
    annual_premium_inr: client.premium,
    potential_additional_premium_inr: computePotentialFromGaps(client),
    loss_ratio_pct: computeLossRatio(client),
    claims_trend: client.claimsTrend,
    renewal_date: client.renewalDate,
    days_to_renewal: daysBetween(client.renewalDate),
    attractiveness_score: computeAttractivenessScore(client),
    growth_3yr_cagr_pct: client.growth3Y,
    current_coverages: client.currentCoverages,
    coverage_gaps: client.gaps,
    anchor_product: client.anchor || null,
    running_policies: client.runningPolicies || [],
    premium_history_cr: client.premiumHistory,
    claims_history: client.claimsHistory,
    business_guardrails: client.guardrails,
    source_evidence: client.evidence,
    recent_triggers: (client.triggers || []).slice(0, 8),
    peer_ranking: client.peersRanking ? client.peersRanking.slice(0, 6) : null,
    analyst_note: client.narrative,
    policy_recommendations: client.policyRecommendations,
    expansion_pitch_allowed_by_code: canPitchExpansion(client),
  };
  const guardRule = canPitchExpansion(client)
    ? `Expansion pitches are currently permitted by the guardrail engine. You may generate expansion oriented pitches when the broker asks for one, but you must still reference any warning level guardrails in your answer.`
    : `Expansion pitches are blocked by the guardrail engine because at least one rule has failed. If the broker asks for an expansion pitch, do not draft one. Instead, explain which rule has failed and what must be resolved first. You may still help with remediation, repricing, and risk engineering conversations.`;

  return `You are the Howden Sales Intelligence Advisor, an assistant for commercial insurance relationship managers in India. Howden is a broker, not an insurer — you represent the client's interests at placement, not the carrier's.

The relationship manager is currently focused on the client described in the JSON below. Every answer you give must be grounded in this data and must quote specific numbers, dates, and product names from it when relevant.

==========
CLIENT BRIEF
==========
${JSON.stringify(ctx, null, 2)}

==========
GUARDRAIL POLICY
==========
${guardRule}

==========
WHEN THE BROKER ASKS YOU TO DRAFT A PITCH
==========
A broker pitch is not a product description. It is a short, evidence-backed commercial case the relationship manager can take to the client tomorrow. Draft pitches in this five-part structure, in clear prose paragraphs (no headings, no bullet points unless naturally three-plus items):

1. ANCHOR. Open with the anchor product for this client (see anchor_product in the brief) or, if the broker has named a different cover, the named cover. State what's being proposed in one sentence.

2. WHY NOW. The single most material reason this is a conversation for this month, not next quarter. Reference a specific trigger from recent_triggers (with the date), an upcoming renewal date, a recent claims pattern from claims_history, or a peer-ranking signal from peer_ranking. If days_to_renewal is under 90, lead with the renewal window.

3. WHAT THE EVIDENCE SHOWS. Two or three sentences summarising the case from the brief — the gap or under-coverage, the benchmark median where one is referenced in policy_recommendations, the loss ratio if material, the directors-and-officers exposure if a Capital Raised or expansion trigger is on file, the cyber posture if a cyber incident is on file. Quote specific Crore or Lakh figures from the data, with Indian conventions.

4. WHAT WE PROPOSE. The specific cover, indicative scope (sum insured, limits, sub-limits where the data supports a directional figure), and how it sits with the existing programme. If the brief contains policy_recommendations entries, draw the proposal from those. Where a precise figure is not in the brief, say "indicative" or "subject to underwriting" rather than inventing a number.

5. THE ASK. A specific next step with a time horizon. Examples: "Propose a 30-minute call this week to walk through the IAR sum-insured calculation against the new plant disclosure." "Suggest a joint review with the client's CFO before the 14 July renewal, with a draft proposal in their hands seven days prior." Avoid limp closes like "happy to discuss further".

The pitch must be 180–280 words. No marketing language. No "purpose-built", "AI-powered", "best-in-class", "unparalleled", "tailored solution". No exclamation marks. The relationship manager is going to take what you write and adapt it for an email or a meeting brief, so make every sentence carry weight.

If the brief identifies an anchor_product, the pitch should be anchored on that cover unless the broker explicitly asks for a pitch on a different cover. If you anchor away from the system anchor, briefly note why (for example "the broker has asked specifically about Cyber Liability, which the data also supports given the recent incident").

If expansion is BLOCKED by the guardrail engine and the broker has asked for an expansion pitch, do not draft one. Instead, explain in the same five-part structure (Anchor = the failing rule; Why Now = the renewal/loss window; etc.) what must be resolved first, and what a remediation conversation with the client should look like.

==========
DATA DISCIPLINE — most important rule
==========
You must only use numbers, names, dates, percentages, limits, premiums, coverages, claims amounts, guardrail states, evidence items, and recommendations that are present in the brief above. If the broker asks for a figure not in the brief — a specific premium quote, a competitor's market share, a peer median beyond those listed, a historical conversion rate, an expected discount, a reinsurance rate, or any benchmark not shown in the evidence list — say clearly that the figure is not available in the broker's current data set, and invite the broker to source it from the relevant system (the underwriting desk, the placement team, or the external benchmarking subscription). Do not extrapolate. Do not round indicative figures into fresh quotes. Do not cite sources such as "industry reports" or "market surveys" unless that exact source appears in the evidence list. It is better to say "that figure is not in the brief" than to produce a plausible sounding number that the broker cannot defend in front of the client.

You represent a broker, not an insurer. Avoid commenting on insurer-side internal metrics unless they are explicitly in the guardrails or evidence for this client. Do not recommend a specific carrier — that is a placement-desk decision.

==========
STYLE
==========
Concise, business-appropriate prose. Indian currency conventions: ₹3.85 Crore (1 Crore = 1,00,00,000), ₹21.4 Lakh (1 Lakh = 1,00,000) — pick the unit that fits the figure. Avoid hyphenated marketing phrases. Plain prose with light markdown only where it aids comprehension.`;
};

const askAdvisor = async (userMessage, client, history, portfolio, brokerName, brokerRole) => {
  const messages = [
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 1400,
      system: buildAdvisorSystemPrompt(client, portfolio, brokerName, brokerRole),
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
   FORMULA EXPLANATIONS + TOOLTIP
   A single place that produces the "how was this computed" narrative
   for every derived value in the UI, plus a lightweight hover component
   that renders it.
   ============================================================ */

const formatSignedPoints = (n) => (n >= 0 ? `+${n}` : `${n}`);

// Returns { title, formula, rows: [{label, value}], result }
// for a given metric on a given client or portfolio.
const buildExplanation = (metric, ctx) => {
  if (metric === 'lossRatio') {
    const c = ctx.client;
    const ph = (c.premiumHistory || []).slice(-3);
    const ch = (c.claimsHistory || []).slice(-3);
    const pooledPrem = ph.reduce((s, p) => s + (p.v || 0), 0);
    const pooledAmt = ch.reduce((s, c2) => s + (c2.amt || 0), 0);
    const lr = computeLossRatio(c);
    const rows = [];
    ph.forEach((p, i) => {
      const amt = (ch[i] || {}).amt || 0;
      rows.push({ label: `FY${p.y} premium`, value: `${p.v} Crore Rupees` });
      rows.push({ label: `FY${p.y} incurred`, value: `${amt} Crore Rupees` });
    });
    rows.push({ label: '3-year pooled premium', value: `${pooledPrem.toFixed(2)} Crore Rupees` });
    rows.push({ label: '3-year pooled incurred', value: `${pooledAmt.toFixed(2)} Crore Rupees` });
    return {
      title: 'How Loss Ratio is computed',
      formula: 'lossRatio = (3-year pooled incurred ÷ 3-year pooled premium) × 100',
      rows,
      result: `${lr}%`,
    };
  }

  if (metric === 'attractivenessScore') {
    const c = ctx.client;
    const k = computeAttractivenessComponents(c);
    return {
      title: 'How Attractiveness is computed',
      formula: 'score = 50 + loss ratio + growth + claims trend + gaps + guardrails + offers',
      rows: [
        { label: 'Base', value: `${k.base}` },
        { label: `Loss ratio (${computeLossRatio(c)}%)`, value: formatSignedPoints(k.lrPts) },
        { label: `3-year growth (${c.growth3Y}%)`, value: formatSignedPoints(k.gPts) },
        { label: `Claims trend (${c.claimsTrend})`, value: formatSignedPoints(k.tPts) },
        { label: `Coverage gaps (${(c.gaps || []).length})`, value: formatSignedPoints(k.gapPts) },
        { label: `Guardrails (${(c.guardrails || []).filter(r => r.status === 'fail').length} failed, ${(c.guardrails || []).filter(r => r.status === 'warn').length} warning)`, value: formatSignedPoints(k.grPts) },
        { label: `Viable offers (${((c.policyRecommendations || {}).offer || []).length})`, value: formatSignedPoints(k.offPts) },
      ],
      result: `${k.score} out of 100`,
    };
  }

  if (metric === 'potentialFromGaps') {
    const c = ctx.client;
    const offers = (c.policyRecommendations || {}).offer || [];
    const blocked = !canPitchExpansion(c);
    return {
      title: 'How Potential from Gaps is computed',
      formula: blocked
        ? 'If any guardrail has failed, potential from gaps is zero'
        : 'Sum of estimated premium across every recommended offer',
      rows: blocked
        ? [{ label: 'Expansion blocked by a guardrail', value: '0' }]
        : offers.map(o => ({ label: o.product, value: formatINR(o.estPremium || 0) })),
      result: formatINR(computePotentialFromGaps(c)),
    };
  }

  if (metric === 'expansionAllowed') {
    const c = ctx.client;
    const fails = (c.guardrails || []).filter(r => r.status === 'fail');
    const allowed = canPitchExpansion(c);
    return {
      title: 'How Expansion Allowed is computed',
      formula: 'Allowed when no guardrail rule has status "failed"',
      rows: fails.length
        ? fails.map(f => ({ label: f.rule, value: 'failed' }))
        : [{ label: 'All guardrail rules are pass or warn', value: 'allowed' }],
      result: allowed ? 'Allowed' : 'Blocked',
    };
  }

  if (metric === 'potentialPipeline') {
    const clients = ctx.clients || [];
    return {
      title: 'How Potential Pipeline is computed',
      formula: 'Sum of Potential from Gaps across every client in the portfolio',
      rows: clients.map(c => ({
        label: c.name,
        value: formatINR(computePotentialFromGaps(c)),
      })),
      result: formatINR(clients.reduce((a, c) => a + computePotentialFromGaps(c), 0)),
    };
  }

  if (metric === 'avgLossRatio') {
    const clients = ctx.clients || [];
    const total = clients.reduce((a, c) => a + computeLossRatio(c), 0);
    const avg = clients.length ? total / clients.length : 0;
    return {
      title: 'How Average Loss Ratio is computed',
      formula: 'Mean of each client\u2019s latest year loss ratio',
      rows: clients.map(c => ({ label: c.name, value: `${computeLossRatio(c)}%` })),
      result: `${avg.toFixed(1)}%`,
    };
  }

  if (metric === 'highOpportunityCount') {
    const clients = ctx.clients || [];
    const qualifying = clients.filter(c => computeAttractivenessScore(c) >= 75);
    return {
      title: 'How High Opportunity count is computed',
      formula: 'Count of clients where attractiveness score is at least 75',
      rows: clients.map(c => ({
        label: c.name,
        value: `${computeAttractivenessScore(c)}${computeAttractivenessScore(c) >= 75 ? ' ✓' : ''}`,
      })),
      result: `${qualifying.length} of ${clients.length}`,
    };
  }

  return null;
};

const FormulaTooltip = ({ metric, ctx, width = 320, placement = 'top', children }) => {
  const explanation = buildExplanation(metric, ctx);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  // Recompute position when opening. `position: fixed` keeps the panel
  // outside any overflow:hidden ancestor, so it cannot be clipped.
  const reposition = () => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const margin = 10;
    const panelWidth = width;
    const panelHeight = 260; // approx max; adjusted below by row count
    const rows = explanation ? explanation.rows.length : 0;
    const estHeight = Math.min(panelHeight, 160 + rows * 18);

    let top, left;
    // Default: below the trigger
    top = r.bottom + margin;
    left = r.left;
    // If that would push below viewport, flip above
    if (top + estHeight > window.innerHeight - 8) {
      top = r.top - margin - estHeight;
    }
    // If still above viewport top, fall back to below and accept scrolling inside panel
    if (top < 8) {
      top = r.bottom + margin;
    }
    // Horizontal clamp
    if (left + panelWidth > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - panelWidth - 8);
    }
    if (left < 8) left = 8;
    setCoords({ top, left });
  };

  if (!explanation) return children || null;
  const { title, formula, rows, result } = explanation;

  const panel = (
    <div
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        zIndex: 1000,
        width,
        background: 'var(--ink)',
        color: '#fff',
        borderRadius: 8,
        padding: 12,
        fontSize: 11.5,
        lineHeight: 1.45,
        boxShadow: '0 14px 40px -8px rgba(0,0,0,0.38)',
        pointerEvents: 'none',
      }}
      role="tooltip"
    >
      <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 6, color: '#fff' }}>{title}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: 'rgba(255,255,255,0.78)', marginBottom: 8, lineHeight: 1.5 }}>
        {formula}
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 8, marginBottom: 8, maxHeight: 220, overflowY: 'auto' }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '2px 0', fontSize: 11 }}>
            <span style={{ color: 'rgba(255,255,255,0.78)', flex: 1, minWidth: 0 }}>{r.label}</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#fff', whiteSpace: 'nowrap' }}>{r.value}</span>
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.18)', paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
        <span style={{ color: 'rgba(255,255,255,0.78)', fontWeight: 500 }}>Result</span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#fff' }}>{result}</span>
      </div>
    </div>
  );

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {children}
      <button
        ref={triggerRef}
        type="button"
        tabIndex={-1}
        aria-label={title}
        onMouseEnter={() => { reposition(); setOpen(true); }}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => { reposition(); setOpen(true); }}
        onBlur={() => setOpen(false)}
        style={{
          background: 'transparent',
          border: 'none',
          padding: 0,
          color: open ? 'var(--brand)' : 'var(--ink-4)',
          display: 'inline-flex',
          alignItems: 'center',
          cursor: 'help',
          transition: 'color .15s ease',
        }}
      >
        <Info size={12} strokeWidth={2.2} />
      </button>
      {open && createPortal(panel, document.body)}
    </span>
  );
};

/* ============================================================
   AI TAG / SR TAG / HB TAG
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

// SR (Saverisk) — sourced from the per-client intelligence file
const SrTag = ({ label = 'SR', size = 'sm' }) => {
  const px = size === 'xs' ? '2px 6px' : '2px 7px';
  const fz = size === 'xs' ? 9 : 9.5;
  const iz = size === 'xs' ? 8 : 9;
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded-full tabular"
      style={{
        background: 'rgba(74,85,104,0.08)',
        color: 'var(--ink-2)',
        border: '1px solid rgba(74,85,104,0.18)',
        padding: px,
        fontSize: fz,
        fontWeight: 500,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        lineHeight: 1.1,
        verticalAlign: 'middle',
      }}
      title="Sourced from the client intelligence file (Saverisk-style per-client report). In production this would be refreshed automatically when a new file lands."
    >
      <FileText size={iz} strokeWidth={2.4} />
      {label}
    </span>
  );
};

// HB (Howden Book) — benchmarked from Howden's own placement history
const HbTag = ({ label = 'HB', size = 'sm' }) => {
  const px = size === 'xs' ? '2px 6px' : '2px 7px';
  const fz = size === 'xs' ? 9 : 9.5;
  const iz = size === 'xs' ? 8 : 9;
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded-full tabular"
      style={{
        background: 'rgba(166,124,46,0.10)',
        color: '#A67C2E',
        border: '1px solid rgba(166,124,46,0.24)',
        padding: px,
        fontSize: fz,
        fontWeight: 500,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        lineHeight: 1.1,
        verticalAlign: 'middle',
      }}
      title="Computed from Howden's own placement history for comparable risks (industry, revenue band, employee band)."
    >
      <Briefcase size={iz} strokeWidth={2.4} />
      {label}
    </span>
  );
};

// Benchmark badge — shows the [HB] tag and reveals the placement-history range on hover.
// The hover popup explains how the range was computed: industry, revenue band, sample size.
const BenchmarkBadge = ({ benchmark }) => {
  const [open, setOpen] = useState(false);
  if (!benchmark) return null;
  const fmt = (v) => formatINR(v);
  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <HbTag size="xs" />
      {open && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 p-3 rounded-lg hairline"
          style={{
            background: 'var(--surface)',
            boxShadow: '0 8px 24px rgba(11,59,92,0.12)',
            width: 280,
            fontSize: 11.5,
          }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Briefcase size={11} style={{ color: '#A67C2E' }} />
            <span className="font-medium uppercase tracking-[0.10em]" style={{ color: 'var(--ink)', fontSize: 10.5 }}>
              Howden book benchmark
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2.5">
            <div>
              <div className="text-[9.5px] uppercase tracking-[0.1em]" style={{ color: 'var(--ink-4)' }}>25th</div>
              <div className="tabular" style={{ color: 'var(--ink-2)' }}>{fmt(benchmark.low)}</div>
            </div>
            <div>
              <div className="text-[9.5px] uppercase tracking-[0.1em]" style={{ color: 'var(--ink-4)' }}>Median</div>
              <div className="tabular font-medium" style={{ color: 'var(--ink)' }}>{fmt(benchmark.median)}</div>
            </div>
            <div>
              <div className="text-[9.5px] uppercase tracking-[0.1em]" style={{ color: 'var(--ink-4)' }}>75th</div>
              <div className="tabular" style={{ color: 'var(--ink-2)' }}>{fmt(benchmark.high)}</div>
            </div>
          </div>
          <div className="text-[10.5px]" style={{ color: 'var(--ink-3)', lineHeight: 1.5 }}>
            From {benchmark.sample} comparable placements
            {benchmark.fallbackLevel === 'industry+revenue'
              ? ` in ${benchmark.industry} at ${benchmark.revenueBand} Cr revenue.`
              : ` across ${benchmark.industry} (broader sample because the revenue-band-specific sample was thin).`}
          </div>
        </div>
      )}
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
  if (t === 'renewal-uplift') return { label: 'Renewal uplift', Icon: Clock, fg: '#A67C2E', bg: 'rgba(166,124,46,0.10)' };
  if (t === 'review') return { label: 'Review', Icon: FileSearch, fg: 'var(--ink-2)', bg: 'var(--canvas-2)' };
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
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="chip tabular" style={{ background: cm.bg, color: cm.fg, borderColor: 'transparent', padding: '1px 6px', fontSize: 10 }}>
                      {cm.label}
                    </span>
                    {r.estPremium > 0 ? (
                      <span className="text-[11px] tabular flex items-center gap-1.5" style={{ color: 'var(--ink-2)' }}>
                        Estimated {formatINR(r.estPremium)}
                        {r.benchmark && (
                          <BenchmarkBadge benchmark={r.benchmark} />
                        )}
                      </span>
                    ) : (
                      <span className="text-[11px] italic" style={{ color: 'var(--ink-4)' }}>
                        Indicative pricing pending placement check
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

const Login = ({ onLogin, onAbout, clients, prospects }) => {
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
            This demonstration shows how a relationship manager sees the full state of every account under management, understands which opportunities to pursue first, and briefs themselves on each client before a conversation. The same intelligence is available to Operations through a portfolio-wide view, and to the New Business team through a Prospect view that scores companies who are not yet on the books.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BROKERS.filter(b => b.role !== 'super').map((b, i) => {
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

        {/* Super Admin and Prospects tiles below the broker grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {(() => {
            const admin = BROKERS.find(b => b.role === 'super');
            if (!admin) return null;
            const allCount = clients.length;
            const allPrem = clients.reduce((a, c) => a + c.premium, 0);
            return (
              <button
                onClick={() => onLogin(admin.id)}
                className="tile-pop text-left p-5 rounded-2xl glass hairline"
                style={{ animationDelay: '0.30s' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-display text-[15px] text-white"
                    style={{ background: `linear-gradient(135deg, ${admin.tone} 0%, ${admin.tone}CC 100%)` }}
                  >
                    {admin.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-display text-[17px] leading-none truncate" style={{ color: 'var(--ink)' }}>{admin.name}</div>
                      <span className="chip" style={{ background: 'var(--brand-soft)', color: 'var(--brand)', borderColor: 'transparent', padding: '1px 6px', fontSize: 9.5 }}>
                        Super Admin
                      </span>
                    </div>
                    <div className="text-[11.5px] mt-1" style={{ color: 'var(--ink-3)' }}>{admin.title}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-3 hairline-t">
                  <div>
                    <div className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>Scope</div>
                    <div className="text-[12px] mt-1" style={{ color: 'var(--ink-2)' }}>All books</div>
                  </div>
                  <div>
                    <div className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>Clients</div>
                    <div className="text-[12px] mt-1 tabular" style={{ color: 'var(--ink-2)' }}>{allCount}</div>
                  </div>
                  <div>
                    <div className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>Premium</div>
                    <div className="text-[12px] mt-1 tabular" style={{ color: 'var(--ink-2)' }}>{formatINR(allPrem)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 mt-4 text-[11.5px] font-medium" style={{ color: admin.tone }}>
                  Open the operations dashboard <ArrowUpRight size={13} />
                </div>
              </button>
            );
          })()}

          {/* Prospects tile — fourth login button */}
          <button
            onClick={() => onLogin('__prospects__')}
            className="tile-pop text-left p-5 rounded-2xl glass hairline"
            style={{ animationDelay: '0.36s' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center font-display text-[14px] text-white"
                style={{ background: 'linear-gradient(135deg, #5B7553 0%, #5B7553CC 100%)' }}
              >
                <Target size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="font-display text-[17px] leading-none" style={{ color: 'var(--ink)' }}>Prospects</div>
                  <span className="chip" style={{ background: 'rgba(91,117,83,0.12)', color: '#5B7553', borderColor: 'transparent', padding: '1px 6px', fontSize: 9.5 }}>
                    New business
                  </span>
                </div>
                <div className="text-[11.5px] mt-1" style={{ color: 'var(--ink-3)' }}>Companies in the funnel, not yet on the books</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3 hairline-t">
              <div>
                <div className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>Scope</div>
                <div className="text-[12px] mt-1" style={{ color: 'var(--ink-2)' }}>Funnel</div>
              </div>
              <div>
                <div className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>Prospects</div>
                <div className="text-[12px] mt-1 tabular" style={{ color: 'var(--ink-2)' }}>{prospects ? prospects.length : 0}</div>
              </div>
              <div>
                <div className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>Opportunity</div>
                <div className="text-[12px] mt-1 tabular" style={{ color: 'var(--ink-2)' }}>{formatINR((prospects || []).reduce((s, p) => s + (p.totalOpportunityValue || 0), 0))}</div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-1 mt-4 text-[11.5px] font-medium" style={{ color: '#5B7553' }}>
              Open the prospects view <ArrowUpRight size={13} />
            </div>
          </button>
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
          <li><strong>Shows access control in action</strong>. Two brokers, two portfolios, two different answers. A super-admin role sees the full book. A new-business view scores prospects who are not yet on the books.</li>
          <li><strong>Answers questions about a single company with citations.</strong> Every claim points to a specific sheet and row in that company's Saverisk file. Predictive, cross-client, and Howden-internal questions are politely declined.</li>
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
        <p>The data behind this demonstration lives across four kinds of file in the repository, all read at build time and joined together by CIN. The build script reads each file, normalises industry vocabulary, computes derived values, and emits a single JSON file that the interface loads. Editing any of the source files and rebuilding is therefore enough to change every number and every piece of text shown in the application, with no code change. In the production Howden deployment the same pattern applies, except the connectors read live data from SharePoint, the policy register, the claims warehouse, the CRM, and the Saverisk subscription rather than from files in the repository.</p>
        <h3>Top-level files in <code>data/</code></h3>
        <table>
          <thead>
            <tr><th>File</th><th>Contents</th></tr>
          </thead>
          <tbody>
            <tr><td className="tab">master.xlsx</td><td>Brokers and the client roster, including each client's CIN, primary relationship manager, and optional secondary relationship manager.</td></tr>
            <tr><td className="tab">policies.xlsx</td><td>Howden's internal policy data: running policies, coverages, premium history, claims history, and a synthetic Howden book of comparable placements used as a benchmark.</td></tr>
            <tr><td className="tab">rules.xlsx</td><td>Configuration owned by the Super Admin role. Holds thresholds, scoring weights, renewal windows, guardrail rule definitions, the trigger-to-product mapping, and per-industry coverage templates.</td></tr>
          </tbody>
        </table>
        <h3>Per-client files in <code>data/clients/</code></h3>
        <p>Each client also has its own intelligence file in <code>data/clients/&#123;CIN&#125;.xlsx</code>, in the Saverisk format. One file per client, named with the client's CIN. The file follows a canonical 22-sheet schema and holds generic information about the company that is not specific to any insurance contract: the Overview sheet (industry, sector, address, listed status, auditors), Consolidated and Standalone Summary sheets (revenue, EBITDA, PAT, total assets across seven years), Current Directors, Past Directors, Cross Directorship Holding (which links each client's directors to other companies they sit on the board of), Defaults (regulatory penalties, litigation, environmental notices), Index of Charges, Peers, Peers Ranking, Media (recent news), Triggers (categorised events), Legal Cases and Legal Overview, Linkages, Received in India, and others.</p>
        <p>Two of the eleven clients in this demonstration are anchored on real Saverisk reports for Suez India Private Limited and Vedanta Limited. The other nine are synthetic files written in the same canonical schema. The build script reads them all the same way and joins them with the policy data through the CIN.</p>
        <p style={{ margin: '4px 0 18px 0' }}>
          <a
            href="/data/master.xlsx"
            download
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              background: 'var(--brand)',
              color: '#fff',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 12.5,
              fontWeight: 500,
            }}
          >
            <Download size={14} strokeWidth={2.2} />
            Download master.xlsx
          </a>
        </p>
        <p>A value that appears in the interface alongside a small grey <strong>SR</strong> badge is sourced from a per-client Saverisk file. A value alongside a small amber <strong>HB</strong> badge is benchmarked from Howden's own placement history. A value alongside a brand-coloured <strong>AI</strong> badge is computed by the engine from the inputs above. Values without any badge are direct policy fields from <code>policies.xlsx</code>. The table below lists each derived field and where it would be drawn from in the Howden production environment.</p>
        <table>
          <thead>
            <tr><th>Field</th><th>Source in production</th></tr>
          </thead>
          <tbody>
            <tr><td>Client identity (industry, sector, address, listed status)</td><td>Per-client Saverisk file, refreshed at the cadence the subscription provides</td></tr>
            <tr><td>Revenue, EBITDA, PAT, total assets, employee headcount</td><td>Per-client Saverisk file, sourced from MCA filings</td></tr>
            <tr><td>Premium history and policy register</td><td>Howden's policy administration system</td></tr>
            <tr><td>Claims history</td><td>Claims data warehouse</td></tr>
            <tr><td>Coverage gaps</td><td>Computed against per-industry coverage templates in <code>rules.xlsx</code></td></tr>
            <tr><td>Guardrail rule, status, and detail</td><td>Rule engine reading thresholds from <code>rules.xlsx</code> and signals from each client's Saverisk file</td></tr>
            <tr><td>Evidence notes</td><td>Synthesised from the most recent material triggers, media, and defaults in the Saverisk file</td></tr>
            <tr><td>Cross-sell and review recommendations</td><td>Generated from the Saverisk Triggers list via the trigger-to-product mapping in <code>rules.xlsx</code>, with template-based fallback for industry coverage gaps</td></tr>
            <tr><td>Estimated premium ranges</td><td>Howden's own placement history, filtered by industry and revenue band</td></tr>
            <tr><td>Peer ranking</td><td>Per-client Saverisk file, Peers Ranking sheet</td></tr>
            <tr><td>Group exposure</td><td>Per-client Saverisk file, Cross Directorship Holding sheet</td></tr>
          </tbody>
        </table>

        <h2>Per-company chat with citations</h2>
        <p>Every client and prospect detail page carries an "Ask about this company" button that opens a chat scoped to that single company. The chat retrieves the most relevant Saverisk sheets for the question (using a keyword index for sheet selection), passes them to the model along with a strict system prompt, and renders the answer with inline citation markers like <code>[1]</code>, <code>[2]</code>. Click any marker to see the sheet name, row number, and a short excerpt of the source row. Below each answer the chat shows which sheets it actually consulted.</p>
        <p>Three classes of question are refused before the model is called, with a fixed message and no API charge:</p>
        <ul>
          <li><strong>Predictive</strong>. Anything asking what the company will do next or what is likely to happen. The Saverisk file describes events that have happened; it does not forecast.</li>
          <li><strong>Cross-client.</strong> Comparisons across other clients in the book. The chat is scoped to one company at a time. Comparison is the portfolio view's job.</li>
          <li><strong>Howden-internal.</strong> Questions about insurer appetite, placement-desk knowledge, broker pricing. That information sits outside the Saverisk file.</li>
        </ul>
        <p>If the data does not support an answer, the model is instructed to say so explicitly rather than to guess. Every chat exchange is recorded in the audit log.</p>

        <h2>Formulas for derived values</h2>
        <p>Every value carrying an AI tag in the interface is computed at render time from the synthesised inputs above. No derived value is stored. The formulas below are the exact rules that the code runs today.</p>

        <h3>Annual Premium</h3>
        <p>The most recent year of premium from the premium history, converted from Crore Rupees to Rupees for display.</p>
        <div className="formula-block">annualPremium = premiumHistory[latest].value × 10,000,000</div>

        <h3>Claims Trend (direction label)</h3>
        <p>A three-way direction label derived by comparing the most recent year's incurred claims against the previous year. Small year-on-year variation within a fifteen percent band is classified as flat, which prevents the label from chasing noise.</p>
        <div className="formula-block">delta = (latestYearIncurred - previousYearIncurred) ÷ previousYearIncurred
if delta &gt; 0.15 → "up"
if delta &lt; -0.15 → "down"
otherwise → "flat"</div>

        <h3>Loss Ratio (per client, 3-year rolling)</h3>
        <p>Pooled incurred claims across the three most recent complete policy years divided by pooled earned premium over the same period, expressed as a percentage. Brokers and insurers use a rolling window rather than a single year because single-year figures swing wildly with one large claim and are not a reliable base for rate or appetite decisions.</p>
        <div className="formula-block">lossRatio = (sum of FY23+FY24+FY25 incurred claims ÷ sum of FY23+FY24+FY25 earned premium) × 100</div>
        <p>In production, the loss ratio is typically supplied pre-computed by the claims data warehouse on the same rolling basis. This engine recomputes it from the underlying history so that the figure shown in the interface can be traced back to the specific claim and premium records feeding it.</p>

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
        <p>The score penalises deterioration more heavily than it rewards improvement, which reflects the underwriting principle that mispricing a distressed risk costs more than under-crediting a healthy one. In a production version these weights will be held as an editable configuration, reviewed and approved by the chief underwriting office, rather than sitting in application code.</p>

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
            <tr><td>Offer ranking weight</td><td className="tab">Confidence tier sorts first, estimated premium breaks ties within the same tier</td><td>Cross-sell and upsell dashboard sort order</td></tr>
            <tr><td>Advisor system prompt and data discipline rules</td><td className="tab">Plain text inside the code</td><td>Every advisor response on every client</td></tr>
            <tr><td>List of broker personas</td><td className="tab">Priya Sharma and Rahul Desai</td><td>Login screen, access control simulation</td></tr>
          </tbody>
        </table>

        <h2>Possible future upgrades</h2>
        <p>This proof of concept demonstrates the mechanics of a sales intelligence engine operating on internal Howden data. A production version could centralise further, drawing on sources that already exist in the Indian market. The areas below are the ones an experienced broker or underwriter would expect to see on the roadmap. Each is feasible to varying degrees, and we have flagged where the required data is public, where it lives inside paid or private sources, and where it lives only as tacit knowledge today.</p>

        <h3>Industry reference data from IRDAI and the General Insurance Council</h3>
        <p>IRDAI publishes the annual <em>Handbook on Indian Insurance Statistics</em> and quarterly public disclosures. The General Insurance Council publishes monthly segment-level premium figures by line of business. Neither source publishes granular loss ratio data by class or region, so positioning a client against a precise cohort percentile is not possible from public sources alone. What is feasible is showing segment-level trend lines — for example, industry-wide Fire loss ratio direction over four quarters — as context against a client's own figures. More specific benchmarking would require a subscription to a data provider or a pooled-intelligence arrangement with other brokers.</p>

        <h3>Public filings as a cross-sell and upsell signal</h3>
        <p>BSE and NSE corporate announcements, annual reports, and SEBI disclosures are public and available through exchange feeds. Registrar of Companies filings are available through the MCA21 portal on a per-document basis. These are the canonical source of exposure-creating events: capex announcements, foreign subsidiary formations, acquisitions, debenture issuances, director changes, and regulatory notices. A production pipeline ingests these filings, extracts the exposure-relevant events, and maps each to the policy lines it should trigger — a plant expansion announcement fires a property and marine cargo conversation, a foreign subsidiary filing fires territorial extension on PI and D&amp;O, and so on. The broker gets a morning brief of filings from the past day that affect their book.</p>

        <h3>Panel insurer appetite, captured as structured knowledge</h3>
        <p>A significant portion of what a relationship manager relies on today lives only in the placement desk's head: which insurer is leaning in on pharmaceutical D&amp;O this cycle, which has reserved cyber capacity, which is hard on large contractor programmes. This is internal Howden knowledge rather than a public feed. A production version captures it as structured appetite records — insurer, line of business, class, direction, effective date, noted by whom — and feeds it into pitch drafting and do-not-offer reasoning. The value is centralising tacit knowledge so it survives team changes, not importing anything new from outside.</p>

        <h3>Deeper claims intelligence from the Howden claims warehouse</h3>
        <p>The engine currently reads incurred claims and premium. A broker pricing a renewal or an expansion also benefits from the paid-versus-outstanding split, claim status, adjuster reserve movements, and reinsurer recovery tracking. All of these live inside the Howden claims handling system today, and surfacing them through the same engine would mean a 48 percent headline loss ratio made up mostly of case reserves in litigation reads differently from one made up of settled claims. Development triangles and industry IBNR data would require paid reinsurance market sources.</p>

        <h3>Regulatory and compliance feeds</h3>
        <p>IRDAI circulars, SEBI enforcement orders, RBI cyber and outsourcing directions, CERT-In incident directives, DGCA advisories, and DGFT export control notifications are all public and published on the respective regulator websites. National Green Tribunal orders are public. State pollution control board notices are public but patchy in machine-readable form, and some states only publish in local languages. A production version subscribes to the consistently-structured feeds and classifies each notice against the affected lines, so that a single CERT-In direction on API logging fires cyber liability conversations across an entire financial services book in one morning.</p>

        <h3>Catastrophe exposure context</h3>
        <p>For property, marine, and engineering risks in India, the placement conversation benefits from visibility of natural catastrophe exposure at each insured location. The NDMA Hazard Atlas and the India Meteorological Department publish zone-level hazard maps that are freely available — seismic zone, broad flood exposure, broad cyclone exposure at district level. Finer-grained models used for actual pricing, such as pincode-level flood probability or building-level wind risk, live with commercial catastrophe modelling providers and are a paid subscription. A production version can use the public zone-level data for conversation context, and flag where a paid model would improve placement.</p>

        <h3>Event-triggered alerting, not just scheduled scoring</h3>
        <p>This demonstration computes scores on page load. A production version fires when something changes: a regulatory notice lands, a public filing announces a capex, a claim crosses a materiality threshold, a peer company in the same sector suffers a significant loss, a renewal falls into the 90-day window. Each is an event, and each places a specific item on the relationship manager's queue with a drafted next action. The relationship manager opens the engine in the morning and works through the overnight queue in priority order.</p>

        <h3>Retention risk, separated from opportunity</h3>
        <p>The attractiveness score in this demonstration combines two different signals into one number: how valuable is this client to grow, and how likely is this client to be retained. A production version separates them. A growing biotech account with a healthy loss ratio can be high-opportunity and high-retention-risk at the same time. The appropriate intervention in that case is different from a low-opportunity watch account with a stable programme. Two scores, two queues, two sets of suggested actions.</p>

        <h3>Per-line-of-business guardrails</h3>
        <p>The demonstration applies the expansion guardrail across the whole client. A production version applies it per line of business, so that a marine hull loss ratio above threshold blocks expansion on marine but not on cyber or directors and officers cover, which are unrelated exposures. This matches how appetite, placement, and pricing decisions are actually made at a commercial broker.</p>

        <h3>Placement-ready output</h3>
        <p>The advisor in this demonstration suggests a product and provides narrative reasons. A production advisor drafts the RFQ: class, limits, sub-limits, wording references, underwriter contacts on the Howden panel, and historical rate guidance for comparable risks held inside Howden's own placement history. The placement desk edits rather than authors. This is the path from conversational advisor to placement co-pilot.</p>

        <h3>Traceability on every number</h3>
        <p>The hover tooltips in this demonstration explain how each derived value was computed from the inputs on the page. A production version extends this to the claim and policy records that fed the inputs, so that clicking a loss ratio leads to the specific claim numbers, adjuster notes, and reinsurer recoveries behind it. This matters for client-facing conversations, for regulator audit, and for internal peer review of pitch decisions.</p>

        <h3>Governance layer required for India</h3>
        <p>The Digital Personal Data Protection Act 2023 is in force. A production version running on Howden client data needs purpose limitation, consent management where consent is the lawful basis, data residency inside India, and a verified breach-notification path. It also needs to meet IRDAI intermediary regulations on record retention and audit trail. None of this is visible in the demonstration interface, but all of it is a precondition for production deployment.</p>

        <h3>Administrative surfaces for underwriters and compliance</h3>
        <p>Every threshold, every weight, every guardrail rule, and every do-not-offer policy currently hardcoded in the application should be editable by the people responsible for them, with version history and approval workflow. Attractiveness weights change as market conditions change, guardrail thresholds change as appetite changes, and the engine needs to let a chief underwriter or head of compliance make those changes without asking an engineer.</p>

        <h2>About this demonstration</h2>
        <ul>
          <li>All data is synthetic. Two broker personas, ten clients, four policy years.</li>
          <li>The advisor is the Claude language model, called through a secured server side proxy so that the API key never reaches the browser. In the Howden production deployment the advisor would be hosted inside Howden's own Azure tenant with the same pattern.</li>
          <li>The engine currently operates on the client records in <code>data/clients.xlsx</code>. The production version will read from the live systems listed in the input sources table above, through the same Excel connector pattern or through direct API connectors to the underlying systems.</li>
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
  const avgLR = clients.length ? clients.reduce((a, c) => a + computeLossRatio(c), 0) / clients.length : 0;
  const renewals90 = clients.filter(c => {
    const d = daysBetween(c.renewalDate); return d >= 0 && d <= 90;
  }).length;
  const highOpps = clients.filter(c => computeAttractivenessScore(c) >= 75).length;
  const items = [
    { label: 'Portfolio Premium', value: formatINR(totalPrem), sub: `across ${clients.length} clients`, tone: 'ink' },
    { label: 'Potential Pipeline', value: formatINR(potentialPrem), sub: 'from identified gaps', tone: 'emerald', ai: true, metric: 'potentialPipeline' },
    { label: 'Average Loss Ratio', value: `${avgLR.toFixed(1)}%`, sub: avgLR < 55 ? 'within healthy range' : avgLR < 65 ? 'in the watch zone' : 'above healthy range', tone: avgLR < 55 ? 'emerald' : avgLR < 65 ? 'amber' : 'rose', metric: 'avgLossRatio' },
    { label: 'Renewals within 90 days', value: renewals90, sub: 'requiring attention', tone: renewals90 >= 3 ? 'amber' : 'ink' },
    { label: 'High Opportunity', value: highOpps, sub: 'clients scoring at least 75', tone: 'emerald', ai: true, metric: 'highOpportunityCount' },
    { label: 'Leads Created', value: leads.length, sub: `${actions} actions this session`, tone: 'ink' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px overflow-hidden rounded-xl hairline" style={{ background: 'var(--hair)' }}>
      {items.map((it, i) => {
        const toneFg = it.tone === 'emerald' ? 'var(--emerald)' : it.tone === 'rose' ? 'var(--rose)' : it.tone === 'amber' ? 'var(--amber)' : 'var(--ink)';
        const labelNode = (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>{it.label}</span>
            {it.ai ? <AiTag size="xs" label="AI" /> : null}
          </div>
        );
        return (
          <div key={i} className="p-4" style={{ background: 'var(--surface)' }}>
            <div className="flex flex-col gap-1">
              {it.metric ? (
                <FormulaTooltip metric={it.metric} ctx={{ clients }} width={280} placement="bottom">
                  {labelNode}
                </FormulaTooltip>
              ) : labelNode}
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

const ClientTile = ({ client, currentBrokerId, onClick }) => {
  const dtr = daysBetween(client.renewalDate);
  const urgent = dtr >= 0 && dtr <= 45;
  const past = dtr < 0;
  const TIcon = trendIcon(client.claimsTrend);
  const tone = scoreTone(computeAttractivenessScore(client));
  const blocked = !canPitchExpansion(client);

  // Shared-RM context: if there's a secondary RM on this client, decide which
  // side the current user is on so we can show the right tag.
  const currentBroker = BROKERS.find(b => b.id === currentBrokerId);
  const isAdmin = currentBroker && currentBroker.role === 'super';
  const primary = BROKERS.find(b => b.id === client.broker);
  const secondary = client.secondary_broker ? BROKERS.find(b => b.id === client.secondary_broker) : null;
  let sharedLabel = null;
  if (isAdmin && primary && secondary) {
    sharedLabel = `${primary.name.split(' ')[0]} (primary) · ${secondary.name.split(' ')[0]} (secondary)`;
  } else if (currentBrokerId === client.broker && secondary) {
    sharedLabel = `Shared with ${secondary.name.split(' ')[0]}`;
  } else if (currentBrokerId === client.secondary_broker && primary) {
    sharedLabel = `Primary RM ${primary.name.split(' ')[0]}`;
  }

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
            <SrTag size="xs" />
          </div>
          <h3 className="font-display text-[18px] leading-[1.15]" style={{ color: 'var(--ink)' }}>
            {client.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11.5px]" style={{ color: 'var(--ink-4)' }}>
            <MapPin size={10} /> {client.city}, {client.state}
          </div>
          {sharedLabel && (
            <div className="flex items-center gap-1 mt-1.5 text-[10.5px]" style={{ color: 'var(--brand)' }}>
              <Users size={10} /> {sharedLabel}
            </div>
          )}
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
          <div className="text-[13.5px] tabular mt-0.5" style={{ color: computeLossRatio(client) > 60 ? 'var(--rose)' : computeLossRatio(client) > 50 ? 'var(--amber)' : 'var(--emerald)' }}>
            {computeLossRatio(client)}%
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
   TRIGGERS TIMELINE
   ============================================================ */

const triggerCategoryTone = (cat) => {
  if (cat === 'Risk') return { fg: 'var(--rose)', bg: 'var(--rose-soft)' };
  if (cat === 'Opportunity') return { fg: 'var(--emerald)', bg: 'var(--emerald-soft)' };
  return { fg: 'var(--ink-3)', bg: 'var(--canvas-2)' };
};

const TriggersTimeline = ({ triggers }) => {
  if (!triggers || triggers.length === 0) {
    return (
      <div className="text-[11.5px] italic p-3 rounded-lg" style={{ color: 'var(--ink-4)', background: 'var(--canvas-2)' }}>
        No triggers on file in the last eighteen months.
      </div>
    );
  }
  // Show only the 12 most recent
  const items = triggers.slice(0, 12);
  return (
    <div className="flex flex-col gap-2">
      {items.map((t, i) => {
        const tone = triggerCategoryTone(t.category);
        return (
          <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg" style={{ background: 'var(--canvas-2)' }}>
            <div
              className="w-1 self-stretch rounded-full"
              style={{ background: tone.fg }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10.5px] tabular" style={{ color: 'var(--ink-4)' }}>{t.date}</span>
                <span className="chip tabular" style={{ background: tone.bg, color: tone.fg, borderColor: 'transparent', padding: '1px 6px', fontSize: 10 }}>
                  {t.category}
                </span>
                <span className="text-[10.5px] uppercase tracking-[0.10em]" style={{ color: 'var(--ink-3)' }}>{t.type}</span>
              </div>
              <div className="text-[11.5px]" style={{ color: 'var(--ink-2)', lineHeight: 1.45 }}>{t.comment}</div>
            </div>
          </div>
        );
      })}
      {triggers.length > items.length && (
        <div className="text-[10.5px] italic px-1 mt-1" style={{ color: 'var(--ink-4)' }}>
          {triggers.length - items.length} older triggers omitted from this view.
        </div>
      )}
    </div>
  );
};

/* ============================================================
   PEER RANKINGS
   ============================================================ */

const PeerRankingsPanel = ({ ranking, clientName }) => {
  if (!ranking || ranking.length === 0) {
    return (
      <div className="text-[11.5px] italic p-3 rounded-lg" style={{ color: 'var(--ink-4)', background: 'var(--canvas-2)' }}>
        Peer ranking is not available for this client.
      </div>
    );
  }
  // Build a dense table: company, revenue rank, EBITDA rank, PAT margin rank
  const sorted = [...ranking].sort((a, b) =>
    (a.revenueRank || 99) - (b.revenueRank || 99)
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[11.5px]">
        <thead>
          <tr className="hairline-b" style={{ color: 'var(--ink-3)' }}>
            <th className="text-left py-1.5 pr-2 font-medium uppercase tracking-[0.10em] text-[10px]">Company</th>
            <th className="text-right py-1.5 px-2 font-medium uppercase tracking-[0.10em] text-[10px]">Revenue</th>
            <th className="text-right py-1.5 px-2 font-medium uppercase tracking-[0.10em] text-[10px]">EBITDA</th>
            <th className="text-right py-1.5 pl-2 font-medium uppercase tracking-[0.10em] text-[10px]">PAT margin</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => {
            const isThis = p.company.toLowerCase() === clientName.toLowerCase();
            return (
              <tr key={i} className="hairline-b" style={{ background: isThis ? 'rgba(11,59,92,0.04)' : 'transparent' }}>
                <td className="py-1.5 pr-2 truncate max-w-[220px]" style={{ color: isThis ? 'var(--brand)' : 'var(--ink-2)', fontWeight: isThis ? 500 : 400 }}>
                  {p.company}
                </td>
                <td className="py-1.5 px-2 text-right tabular" style={{ color: 'var(--ink-2)' }}>
                  {p.revenueRank ? `#${p.revenueRank}` : '—'}
                </td>
                <td className="py-1.5 px-2 text-right tabular" style={{ color: 'var(--ink-2)' }}>
                  {p.ebitdaRank ? `#${p.ebitdaRank}` : '—'}
                </td>
                <td className="py-1.5 pl-2 text-right tabular" style={{ color: 'var(--ink-2)' }}>
                  {p.patMarginRank ? `#${p.patMarginRank}` : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

/* ============================================================
   GROUP EXPOSURE
   ============================================================ */

const GroupExposurePanel = ({ crossDirectorship, allClients, currentClientId }) => {
  if (!crossDirectorship || crossDirectorship.length === 0) {
    return (
      <div className="text-[11.5px] italic p-3 rounded-lg" style={{ color: 'var(--ink-4)', background: 'var(--canvas-2)' }}>
        No cross-directorship exposure has been identified for this client.
      </div>
    );
  }
  // Index our roster by CIN AND by name (case-insensitive) to detect overlaps
  const rosterByCin = new Map();
  const rosterByName = new Map();
  for (const c of allClients) {
    if (c.cin) rosterByCin.set(c.cin, c);
    rosterByName.set(c.name.toLowerCase(), c);
  }
  // Tag each row with whether the company is also in our book
  const enriched = crossDirectorship.map((row) => {
    const inBookByCin = row.cin && rosterByCin.get(row.cin);
    const inBookByName = rosterByName.get(row.company.toLowerCase());
    const inBook = inBookByCin || inBookByName;
    return {
      ...row,
      isInBook: !!inBook && (inBook.id !== currentClientId),
      bookClientId: inBook ? inBook.id : null,
      bookClientName: inBook ? inBook.name : null,
    };
  });
  // Sort: in-book companies first, by stake desc
  enriched.sort((a, b) => {
    if (a.isInBook && !b.isInBook) return -1;
    if (!a.isInBook && b.isInBook) return 1;
    return b.commonDirectors - a.commonDirectors;
  });
  return (
    <div className="flex flex-col gap-1.5">
      {enriched.slice(0, 8).map((row, i) => (
        <div
          key={i}
          className="flex items-center gap-2 p-2 rounded-lg"
          style={{
            background: row.isInBook ? 'rgba(166,124,46,0.08)' : 'var(--canvas-2)',
            border: row.isInBook ? '1px solid rgba(166,124,46,0.25)' : '1px solid transparent',
          }}
        >
          <Network size={13} style={{ color: row.isInBook ? '#A67C2E' : 'var(--ink-3)' }} />
          <div className="min-w-0 flex-1">
            <div className="text-[11.5px] truncate" style={{ color: 'var(--ink)', fontWeight: row.isInBook ? 500 : 400 }}>
              {row.company}
            </div>
            <div className="text-[10.5px] mt-0.5" style={{ color: 'var(--ink-4)' }}>
              {row.commonDirectors}% common directors{row.state ? ` · ${row.state}` : ''}
              {row.isInBook && ' · already in our book'}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

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
  const anchorProduct = client.anchor && client.anchor.product;
  const list = [];
  list.push(`What should I offer ${first}, and what should I not offer right now?`);
  if (!blocked) {
    if (anchorProduct) {
      list.push(`Draft a renewal-conversation pitch for ${first} anchored on ${anchorProduct}.`);
    } else {
      list.push(`Draft a renewal-conversation pitch for the most material coverage gap at ${first}.`);
    }
  } else {
    list.push(`The guardrails have blocked expansion for ${first}. Draft a remediation pitch instead.`);
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
  const [chatOpen, setChatOpen] = useState(false);
  const snapshot = SR_SNAPSHOTS[client.cin] || {};

  return (
    <div className="fade-up">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[12.5px] hover:underline"
          style={{ color: 'var(--ink-3)' }}
        >
          <ArrowLeft size={13} /> Back to the portfolio
        </button>
        <button
          onClick={() => setChatOpen(true)}
          className="flex items-center gap-1.5 text-[12px] px-3 h-8 rounded-lg hairline"
          style={{ background: 'var(--surface)', color: 'var(--ink-2)' }}
        >
          <MessageSquare size={12} style={{ color: 'var(--brand)' }} />
          Ask about this company
        </button>
      </div>

      {/* HERO */}
      <div className="p-6 rounded-2xl hairline mb-4" style={{ background: 'var(--surface)' }}>
        <div className="flex flex-wrap items-start gap-6 justify-between">
          <div className="flex-1 min-w-[260px]">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Chip tone="brand" icon={Briefcase}>{client.industry}</Chip>
              <Chip icon={MapPin}>{client.city}, {client.state}</Chip>
              <Chip icon={Users}>{client.employees.toLocaleString('en-IN')} employees</Chip>
              <Chip icon={CircleDollarSign}>Revenue {formatINR(client.revenue)}</Chip>
              <SrTag size="xs" />
            </div>
            <h1 className="font-display text-[32px] leading-tight" style={{ color: 'var(--ink)' }}>{client.name}</h1>
            <div className="text-[10.5px] tabular mt-1" style={{ color: 'var(--ink-4)' }}>
              CIN {client.cin}
            </div>
            {client.anchor && (
              <div
                className="mt-3 p-2.5 rounded-lg flex items-start gap-2.5 max-w-2xl"
                style={{ background: 'var(--brand-soft)', border: '1px solid var(--brand)' }}
              >
                <Target size={14} strokeWidth={2.4} style={{ color: 'var(--brand)', marginTop: 2, flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: 'var(--brand)', fontWeight: 600 }}>
                      Anchor
                    </span>
                    <span className="text-[13px] font-medium" style={{ color: 'var(--ink)' }}>
                      {client.anchor.product}
                    </span>
                    <span className="text-[11px] tabular" style={{ color: 'var(--ink-3)' }}>
                      · {formatINR(client.anchor.annualPremium)} · renews {client.anchor.renewalDate}
                    </span>
                    <AiTag size="xs" label="AI" />
                  </div>
                  <div className="text-[11.5px] mt-1" style={{ color: 'var(--ink-3)' }}>
                    {client.anchor.rationale}
                  </div>
                </div>
              </div>
            )}
            <p className="text-[13.5px] mt-2 max-w-2xl" style={{ color: 'var(--ink-2)', lineHeight: 1.6 }}>
              {client.narrative}
            </p>
          </div>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex flex-col items-center">
              <ScoreRing score={computeAttractivenessScore(client)} size={72} stroke={5} />
              <div className="mt-2">
                <FormulaTooltip metric="attractivenessScore" ctx={{ client }} width={300} placement="bottom">
                  <AiTag size="xs" label="AI" />
                </FormulaTooltip>
              </div>
              <div className="text-[11px] mt-1" style={{ color: scoreTone(computeAttractivenessScore(client)).fg }}>{scoreTone(computeAttractivenessScore(client)).label}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-5 mt-5 hairline-t">
          <StatBlock label="Annual Premium" value={formatINR(client.premium)} sub="on the FY25 basis" />
          <div className="flex flex-col gap-1">
            <FormulaTooltip metric="potentialFromGaps" ctx={{ client }} width={300} placement="bottom">
              <div className="flex items-center gap-1.5">
                <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>Potential from Gaps</span>
                <AiTag size="xs" label="AI" />
              </div>
            </FormulaTooltip>
            <span className="font-display text-[22px] leading-none tabular" style={{ color: canPitchExpansion(client) ? 'var(--emerald)' : 'var(--ink-4)' }}>
              {formatINR(computePotentialFromGaps(client))}
            </span>
            <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>
              {canPitchExpansion(client)
                ? `sum across ${(client.policyRecommendations?.offer || []).length} recommended items`
                : 'expansion blocked by a guardrail'}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <FormulaTooltip metric="lossRatio" ctx={{ client }} width={280} placement="bottom">
              <div className="flex items-center gap-1.5">
                <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>Loss Ratio</span>
                <AiTag size="xs" label="AI" />
              </div>
            </FormulaTooltip>
            <span className="font-display text-[22px] leading-none tabular" style={{ color: computeLossRatio(client) < 55 ? 'var(--emerald)' : computeLossRatio(client) < 65 ? 'var(--amber)' : 'var(--rose)' }}>
              {`${computeLossRatio(client)}%`}
            </span>
            <span className="text-[11px]" style={{ color: 'var(--ink-3)' }}>
              {computeLossRatio(client) < 55 ? 'within appetite' : computeLossRatio(client) < 65 ? 'in the watch zone' : 'above the retention limit'}
            </span>
          </div>
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

          <Panel
            title="Triggers timeline"
            subtitle="Recent events on the client's record. Used to drive the cross-sell and review recommendations above."
            icon={Calendar}
            headerRight={<SrTag size="xs" />}
          >
            <TriggersTimeline triggers={client.triggers} />
          </Panel>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <Panel title="Coverage map" icon={Layers}>
            <div className="mb-4">
              <div className="text-[11px] uppercase tracking-[0.14em] mb-2" style={{ color: 'var(--ink-3)' }}>In force ({client.currentCoverages.length})</div>
              <div className="flex flex-wrap gap-1.5">
                {client.currentCoverages.map((c, i) => {
                  const isAnchor = client.anchor && client.anchor.product === c;
                  return (
                    <span
                      key={i}
                      className="chip"
                      style={{
                        background: isAnchor ? 'var(--brand)' : 'var(--emerald-soft)',
                        color: isAnchor ? '#fff' : 'var(--emerald)',
                        borderColor: 'transparent',
                      }}
                      title={isAnchor ? client.anchor.rationale : undefined}
                    >
                      {isAnchor ? <Target size={11} strokeWidth={2.6} /> : <CheckCircle2 size={11} strokeWidth={2.3} />}
                      {c}
                      {isAnchor && (
                        <span style={{ fontSize: 9, marginLeft: 4, opacity: 0.85, letterSpacing: '0.06em' }}>ANCHOR</span>
                      )}
                    </span>
                  );
                })}
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

          <Panel
            title="Peer ranking"
            subtitle="Where this client sits versus comparable companies in the segment."
            icon={Target}
            headerRight={<SrTag size="xs" />}
          >
            <PeerRankingsPanel ranking={client.peersRanking} clientName={client.name} />
          </Panel>

          {client.crossDirectorship && client.crossDirectorship.length > 0 && (
            <Panel
              title="Group exposure"
              subtitle="Companies with directors in common with this client. Highlighted entries are also in our book."
              icon={Network}
              headerRight={<SrTag size="xs" />}
            >
              <GroupExposurePanel
                crossDirectorship={client.crossDirectorship}
                allClients={CLIENTS}
                currentClientId={client.id}
              />
            </Panel>
          )}
        </div>
      </div>

      <SaveriskChat
        entity={client}
        entityKind="client"
        snapshot={snapshot}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        onAudit={onAudit}
      />
    </div>
  );
};

const ChatPanel = ({ open, onClose, client, portfolio, brokerName, brokerRole, messagesByClient, setMessagesByClient, onAudit, onCreateLead }) => {
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
      const reply = await askAdvisor(content, client, next, portfolio, brokerName, brokerRole);
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
      anchorProduct: client.anchor ? client.anchor.product : null,
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
   PROSPECTS — pillar for companies not yet on the books
   ============================================================ */

// Probability badge — shows a circular indicator of the peer-adoption % with
// a hover tooltip explaining the source.
const ProbabilityBadge = ({ probability, industry }) => {
  const [open, setOpen] = useState(false);
  if (probability === undefined || probability === null) return null;
  const fg = probability >= 80 ? 'var(--emerald)' : probability >= 60 ? '#A67C2E' : 'var(--ink-3)';
  const bg = probability >= 80 ? 'var(--emerald-soft)' : probability >= 60 ? 'rgba(166,124,46,0.10)' : 'var(--canvas-2)';
  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        className="inline-flex items-center gap-1 rounded-full tabular"
        style={{
          background: bg,
          color: fg,
          padding: '2px 7px',
          fontSize: 10.5,
          fontWeight: 500,
          border: '1px solid transparent',
        }}
      >
        <Target size={10} strokeWidth={2.4} />
        {probability}% likely
      </span>
      {open && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 p-3 rounded-lg hairline"
          style={{
            background: 'var(--surface)',
            boxShadow: '0 8px 24px rgba(11,59,92,0.12)',
            width: 260,
            fontSize: 11.5,
          }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Target size={11} style={{ color: fg }} />
            <span className="font-medium uppercase tracking-[0.10em]" style={{ color: 'var(--ink)', fontSize: 10.5 }}>
              Probability of placement
            </span>
          </div>
          <div className="text-[11.5px]" style={{ color: 'var(--ink-2)', lineHeight: 1.45 }}>
            {probability}% of comparable {industry || 'industry'} placements in Howden's book carry this cover. Higher percentages indicate the cover is widely adopted in the segment, which makes the prospect conversation easier to anchor.
          </div>
        </div>
      )}
    </span>
  );
};

// Prospect tile for the prospects grid
const ProspectTile = ({ prospect, onClick }) => {
  const offers = prospect.offers || [];
  const totalValue = prospect.totalOpportunityValue || 0;
  const highProb = prospect.highProbCount || 0;
  return (
    <button
      onClick={onClick}
      className="tile-pop text-left p-5 rounded-xl hairline relative overflow-hidden"
      style={{ background: 'var(--surface)' }}
    >
      <div
        className="absolute inset-x-0 top-0"
        style={{ height: 3, background: '#5B7553', opacity: 0.75 }}
      />
      <div className="absolute right-3 top-3 flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(91,117,83,0.12)', color: '#5B7553', fontSize: 10 }}>
        <Target size={9} /> Prospect
      </div>

      <div className="flex items-start gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <Building2 size={12} style={{ color: 'var(--ink-3)' }} />
            <span className="text-[10.5px] uppercase tracking-[0.14em] truncate" style={{ color: 'var(--ink-3)' }}>
              {prospect.industry}
            </span>
            <SrTag size="xs" />
          </div>
          <h3 className="font-display text-[18px] leading-[1.15]" style={{ color: 'var(--ink)' }}>
            {prospect.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 text-[11.5px]" style={{ color: 'var(--ink-4)' }}>
            <MapPin size={10} /> {prospect.city}, {prospect.state}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <div className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-4)' }}>Revenue</div>
          <div className="text-[13.5px] tabular mt-0.5" style={{ color: 'var(--ink)' }}>{formatINR(prospect.revenue)}</div>
        </div>
        <div>
          <div className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-4)' }}>Growth</div>
          <div className="text-[13.5px] tabular mt-0.5" style={{ color: 'var(--ink)' }}>{prospect.growth3Y}%</div>
        </div>
        <div>
          <div className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-4)' }}>Employees</div>
          <div className="text-[13.5px] tabular mt-0.5" style={{ color: 'var(--ink)' }}>{(prospect.employees || 0).toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 hairline-t">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-4)' }}>Opportunity</div>
            <div className="text-[13.5px] tabular flex items-center gap-1.5" style={{ color: 'var(--emerald)' }}>
              {formatINR(totalValue)}
              <HbTag size="xs" />
            </div>
          </div>
          <div>
            <div className="text-[9.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-4)' }}>High prob</div>
            <div className="text-[13.5px] tabular" style={{ color: 'var(--ink)' }}>{highProb}/{offers.length}</div>
          </div>
        </div>
        <ChevronRight size={14} style={{ color: 'var(--ink-3)' }} />
      </div>
    </button>
  );
};

// Detail page for a single prospect
const ProspectDetail = ({ prospect, onBack, onAudit }) => {
  const offers = prospect.offers || [];
  const totalValue = prospect.totalOpportunityValue || 0;
  const [chatOpen, setChatOpen] = useState(false);
  const snapshot = SR_SNAPSHOTS[prospect.cin] || {};
  // ProspectDetail may be rendered without onAudit; fall back to a noop
  const safeAudit = onAudit || (() => {});

  return (
    <div className="fade-up">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[12.5px] hover:underline"
          style={{ color: 'var(--ink-3)' }}
        >
          <ArrowLeft size={13} /> Back to prospects
        </button>
        <button
          onClick={() => setChatOpen(true)}
          className="flex items-center gap-1.5 text-[12px] px-3 h-8 rounded-lg hairline"
          style={{ background: 'var(--surface)', color: 'var(--ink-2)' }}
        >
          <MessageSquare size={12} style={{ color: '#5B7553' }} />
          Ask about this prospect
        </button>
      </div>

      {/* HERO */}
      <div className="p-6 rounded-2xl hairline mb-4" style={{ background: 'var(--surface)' }}>
        <div className="flex flex-wrap items-start gap-6 justify-between">
          <div className="flex-1 min-w-[260px]">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Chip tone="brand" icon={Briefcase}>{prospect.industry}</Chip>
              <Chip icon={MapPin}>{prospect.city}, {prospect.state}</Chip>
              <Chip icon={Users}>{(prospect.employees || 0).toLocaleString('en-IN')} employees</Chip>
              <Chip icon={CircleDollarSign}>Revenue {formatINR(prospect.revenue)}</Chip>
              <span className="chip" style={{ background: 'rgba(91,117,83,0.12)', color: '#5B7553', borderColor: 'transparent' }}>
                <Target size={11} strokeWidth={2.5} /> Prospect
              </span>
              <SrTag size="xs" />
            </div>
            <h1 className="font-display text-[32px] leading-tight" style={{ color: 'var(--ink)' }}>{prospect.name}</h1>
            <div className="text-[10.5px] tabular mt-1" style={{ color: 'var(--ink-4)' }}>
              CIN {prospect.cin}
            </div>
            {prospect.anchor && (
              <div
                className="mt-3 p-2.5 rounded-lg flex items-start gap-2.5 max-w-2xl"
                style={{ background: 'rgba(91,117,83,0.10)', border: '1px solid #5B7553' }}
              >
                <Target size={14} strokeWidth={2.4} style={{ color: '#5B7553', marginTop: 2, flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-[10px] uppercase tracking-[0.14em]" style={{ color: '#5B7553', fontWeight: 600 }}>
                      Probable anchor
                    </span>
                    <span className="text-[13px] font-medium" style={{ color: 'var(--ink)' }}>
                      {prospect.anchor.product}
                    </span>
                    <span className="text-[11px] tabular" style={{ color: 'var(--ink-3)' }}>
                      · {prospect.anchor.probability}% likely · est {formatINR(prospect.anchor.estPremium)}
                    </span>
                    <AiTag size="xs" label="AI" />
                  </div>
                  <div className="text-[11.5px] mt-1" style={{ color: 'var(--ink-3)' }}>
                    {prospect.anchor.rationale}
                  </div>
                </div>
              </div>
            )}
            <p className="text-[13.5px] mt-2 max-w-2xl" style={{ color: 'var(--ink-2)', lineHeight: 1.6 }}>
              {prospect.narrative}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-5 mt-5 hairline-t">
          <StatBlock label="Total opportunity" value={formatINR(totalValue)} sub={`across ${offers.length} viable products`} />
          <StatBlock label="High-probability" value={`${prospect.highProbCount}`} sub="80% peer adoption or above" />
          <StatBlock label="Revenue growth" value={`${prospect.growth3Y}%`} sub="three years" />
          <StatBlock label="Triggers on file" value={`${(prospect.triggers || []).length}`} sub="last eighteen months" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* OFFERS */}
          <Panel
            title="Opportunity offers"
            subtitle="Products this prospect would plausibly buy, ranked by adoption among comparable peers in the Howden book."
            icon={Rocket}
            headerRight={<span className="flex items-center gap-1.5"><AiTag size="xs" label="AI" /><HbTag size="xs" /></span>}
          >
            {offers.length === 0 ? (
              <div className="text-[11.5px] italic p-3 rounded-lg" style={{ color: 'var(--ink-4)', background: 'var(--canvas-2)' }}>
                No viable opportunities identified for this prospect.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {offers.map((o, i) => {
                  const conf = confidenceTone(o.confidence);
                  const isAnchor = prospect.anchor && prospect.anchor.product === o.product;
                  return (
                    <div
                      key={i}
                      className="p-3 rounded-lg hairline relative overflow-hidden"
                      style={{
                        background: 'var(--canvas)',
                        borderColor: isAnchor ? '#5B7553' : 'var(--hair)',
                        borderLeftWidth: isAnchor ? 3 : 1,
                        borderLeftColor: isAnchor ? '#5B7553' : 'var(--hair)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1.5 flex-wrap">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="text-[13px] font-medium" style={{ color: 'var(--ink)' }}>{o.product}</div>
                            {isAnchor && (
                              <span
                                className="inline-flex items-center gap-1 chip tabular"
                                style={{
                                  background: '#5B7553',
                                  color: '#fff',
                                  borderColor: 'transparent',
                                  padding: '1px 6px',
                                  fontSize: 9.5,
                                  letterSpacing: '0.06em',
                                }}
                                title={prospect.anchor.rationale}
                              >
                                <Target size={9} strokeWidth={2.6} />
                                PROBABLE ANCHOR
                              </span>
                            )}
                          </div>
                          {o.triggerDate && (
                            <div className="text-[10.5px] mt-0.5" style={{ color: 'var(--ink-4)' }}>
                              Reinforced by {o.triggerCategory.toLowerCase()} trigger on {o.triggerDate}
                            </div>
                          )}
                        </div>
                        <ProbabilityBadge probability={o.probability} industry={prospect.industry} />
                      </div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="chip tabular" style={{ background: conf.bg, color: conf.fg, borderColor: 'transparent', padding: '1px 6px', fontSize: 10 }}>
                          {conf.label}
                        </span>
                        {o.estPremium > 0 && (
                          <span className="text-[11px] tabular flex items-center gap-1.5" style={{ color: 'var(--ink-2)' }}>
                            Estimated {formatINR(o.estPremium)}
                            {o.benchmark && <BenchmarkBadge benchmark={o.benchmark} />}
                          </span>
                        )}
                      </div>
                      <div className="text-[11.5px]" style={{ color: 'var(--ink-3)', lineHeight: 1.5 }}>{o.reason}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          <Panel
            title="Triggers timeline"
            subtitle="Recent events on the prospect's record. Used to reinforce the offer ranking above."
            icon={Calendar}
            headerRight={<SrTag size="xs" />}
          >
            <TriggersTimeline triggers={prospect.triggers || []} />
          </Panel>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <Panel
            title="Peer ranking"
            subtitle="Where this prospect sits versus comparable companies in the segment."
            icon={Target}
            headerRight={<SrTag size="xs" />}
          >
            <PeerRankingsPanel ranking={prospect.peersRanking} clientName={prospect.name} />
          </Panel>

          {prospect.crossDirectorship && prospect.crossDirectorship.length > 0 && (
            <Panel
              title="Group exposure"
              subtitle="Companies with directors in common with this prospect."
              icon={Network}
              headerRight={<SrTag size="xs" />}
            >
              <GroupExposurePanel
                crossDirectorship={prospect.crossDirectorship}
                allClients={CLIENTS}
                currentClientId={prospect.id}
              />
            </Panel>
          )}

          {prospect.legalOverview && (
            <Panel
              title="Litigation overview"
              subtitle="Cases on the prospect's record across courts and tribunals."
              icon={FileText}
              headerRight={<SrTag size="xs" />}
            >
              <div className="grid grid-cols-2 gap-3">
                <StatBlock label="Total cases" value={prospect.legalOverview.totalCases} sub="across all categories" />
                <StatBlock label="High-risk cases" value={prospect.legalOverview.highRiskCases} sub="needing attention" />
              </div>
            </Panel>
          )}
        </div>
      </div>

      <SaveriskChat
        entity={prospect}
        entityKind="prospect"
        snapshot={snapshot}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        onAudit={safeAudit}
      />
    </div>
  );
};

// Prospects dashboard — list of prospect tiles + KPI strip
const ProspectsDashboard = ({ prospects, onSelect }) => {
  const totalOpp = prospects.reduce((s, p) => s + (p.totalOpportunityValue || 0), 0);
  const highProbTotal = prospects.reduce((s, p) => s + (p.highProbCount || 0), 0);
  const offerTotal = prospects.reduce((s, p) => s + ((p.offers || []).length), 0);
  const avgTriggers = prospects.length
    ? Math.round(prospects.reduce((s, p) => s + ((p.triggers || []).length), 0) / prospects.length)
    : 0;

  return (
    <div className="fade-up">
      <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em]" style={{ color: 'var(--ink-3)' }}>
            New business · prospects pillar
          </div>
          <h1 className="font-display text-[32px] leading-tight mt-1" style={{ color: 'var(--ink)' }}>
            Prospects under <em className="italic" style={{ color: '#5B7553' }}>active evaluation</em>.
          </h1>
          <p className="text-[13px] mt-2 max-w-2xl" style={{ color: 'var(--ink-3)', lineHeight: 1.55 }}>
            These {prospects.length} companies are not yet on the Howden books. The intelligence engine has scored each against the per-client Saverisk file and the Howden book of comparable placements, surfacing products where peer adoption is high enough to anchor the conversation.
          </p>
        </div>
      </div>

      <div className="mb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-xl hairline" style={{ background: 'var(--hair)' }}>
          <div className="p-4" style={{ background: 'var(--surface)' }}>
            <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>Total opportunity</div>
            <div className="font-display text-[22px] leading-none tabular mt-1" style={{ color: 'var(--emerald)' }}>{formatINR(totalOpp)}</div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--ink-3)' }}>across {prospects.length} prospects</div>
          </div>
          <div className="p-4" style={{ background: 'var(--surface)' }}>
            <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>Viable offers</div>
            <div className="font-display text-[22px] leading-none tabular mt-1" style={{ color: 'var(--ink)' }}>{offerTotal}</div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--ink-3)' }}>products surfaced overall</div>
          </div>
          <div className="p-4" style={{ background: 'var(--surface)' }}>
            <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>High-probability</div>
            <div className="font-display text-[22px] leading-none tabular mt-1" style={{ color: '#A67C2E' }}>{highProbTotal}</div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--ink-3)' }}>at least 80% peer adoption</div>
          </div>
          <div className="p-4" style={{ background: 'var(--surface)' }}>
            <div className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>Avg triggers / prospect</div>
            <div className="font-display text-[22px] leading-none tabular mt-1" style={{ color: 'var(--ink)' }}>{avgTriggers}</div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--ink-3)' }}>last eighteen months</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {prospects.map(p => (
          <ProspectTile key={p.id} prospect={p} onClick={() => onSelect(p.id)} />
        ))}
      </div>
    </div>
  );
};

/* ============================================================
   SAVERISK CHAT — citation-required Q&A on a single client / prospect
   ============================================================ */

// Keyword → list of sheet names. The retrieval picks all sheets whose
// keywords appear anywhere in the question. If nothing matches, we fall back
// to a small default set. Keep this list lowercase.
const CHAT_SHEET_KEYWORDS = {
  // Directors & governance
  'director': ['Current Directors', 'Past Directors', 'Cross Directorship Holding'],
  'directors': ['Current Directors', 'Past Directors', 'Cross Directorship Holding'],
  'board': ['Current Directors', 'Past Directors'],
  'cs ': ['Current Directors'],
  'company secretary': ['Current Directors'],
  'kmp': ['Current Directors', 'Past Directors'],
  'managing director': ['Current Directors', 'Past Directors'],
  'md ': ['Current Directors', 'Past Directors'],
  'ceo': ['Current Directors', 'Past Directors'],
  'cfo': ['Current Directors', 'Past Directors'],
  'cto': ['Current Directors', 'Past Directors'],
  'whole-time': ['Current Directors', 'Past Directors'],
  'wholetime': ['Current Directors', 'Past Directors'],
  'independent': ['Current Directors', 'Past Directors'],
  'promoter': ['Cross Directorship Holding', 'Linkages', 'Current Directors'],
  'promoters': ['Cross Directorship Holding', 'Linkages', 'Current Directors'],
  'group': ['Cross Directorship Holding', 'Linkages'],
  'group structure': ['Cross Directorship Holding', 'Linkages'],
  'subsidiary': ['Cross Directorship Holding', 'Linkages'],
  'subsidiaries': ['Cross Directorship Holding', 'Linkages'],
  'related entit': ['Cross Directorship Holding', 'Linkages'],
  'related part': ['Cross Directorship Holding', 'Linkages'],
  'common direct': ['Cross Directorship Holding'],
  'parent compan': ['Cross Directorship Holding', 'Linkages'],
  'holding compan': ['Cross Directorship Holding', 'Linkages'],

  // Financials
  'revenue': ['Consolidated Summary', 'Standalone Summary'],
  'sales': ['Consolidated Summary', 'Standalone Summary'],
  'turnover': ['Consolidated Summary', 'Standalone Summary'],
  'top line': ['Consolidated Summary', 'Standalone Summary'],
  'topline': ['Consolidated Summary', 'Standalone Summary'],
  'bottom line': ['Consolidated Summary', 'Standalone Summary'],
  'bottomline': ['Consolidated Summary', 'Standalone Summary'],
  'ebitda': ['Consolidated Summary', 'Standalone Summary'],
  'profit': ['Consolidated Summary', 'Standalone Summary'],
  'pat': ['Consolidated Summary', 'Standalone Summary'],
  'pbt': ['Consolidated Summary', 'Standalone Summary'],
  'margin': ['Consolidated Summary', 'Standalone Summary'],
  'asset': ['Consolidated Summary', 'Standalone Summary', 'Index Of Charges'],
  'financ': ['Consolidated Summary', 'Standalone Summary'],
  'growth': ['Consolidated Summary', 'Standalone Summary'],
  'size': ['Consolidated Summary', 'Standalone Summary'],
  'segment size': ['Consolidated Summary', 'Standalone Summary'],
  'how big': ['Consolidated Summary', 'Standalone Summary'],
  'networth': ['Consolidated Summary', 'Standalone Summary'],
  'net worth': ['Consolidated Summary', 'Standalone Summary'],
  'leverage': ['Consolidated Summary', 'Standalone Summary', 'Index Of Charges'],

  // Defaults / regulatory / compliance
  'fine': ['Defaults'],
  'penalty': ['Defaults'],
  'penalties': ['Defaults'],
  'fined': ['Defaults'],
  'compliance': ['Defaults'],
  'compliant': ['Defaults'],
  'regulatory': ['Defaults'],
  'regulator': ['Defaults'],
  'pollution': ['Defaults'],
  'environmental': ['Defaults'],
  'esg': ['Defaults', 'Media'],
  'sustainability': ['Defaults', 'Media'],
  'pcb': ['Defaults'],
  'sebi': ['Defaults'],
  'rbi': ['Defaults'],
  'ngt': ['Defaults'],
  'mca': ['Defaults', 'Overview'],
  'roc': ['Defaults', 'Overview'],
  'irdai': ['Defaults'],
  'cci': ['Defaults'],
  'enforcement': ['Defaults'],
  'show cause': ['Defaults'],
  'show-cause': ['Defaults'],
  'notice': ['Defaults'],
  'sanction': ['Defaults'],
  'sanctions': ['Defaults'],
  'default': ['Defaults'],
  'red flag': ['Defaults', 'Triggers'],
  'redflag': ['Defaults', 'Triggers'],
  'flag': ['Defaults', 'Triggers'],

  // Charges / debt / encumbrance
  'charge': ['Index Of Charges'],
  'charges': ['Index Of Charges'],
  'lender': ['Index Of Charges'],
  'lenders': ['Index Of Charges'],
  'debt': ['Index Of Charges', 'Consolidated Summary'],
  'borrow': ['Index Of Charges'],
  'mortgage': ['Index Of Charges'],
  'encumbrance': ['Index Of Charges'],
  'satisfaction': ['Index Of Charges'],
  'open charge': ['Index Of Charges'],
  'pledge': ['Index Of Charges'],
  'collateral': ['Index Of Charges'],
  'secured': ['Index Of Charges'],

  // Triggers / events / news
  'trigger': ['Triggers'],
  'event': ['Triggers'],
  'change': ['Triggers'],
  'recent': ['Triggers', 'Media'],
  'latest': ['Triggers', 'Media'],
  'news': ['Media'],
  'media': ['Media'],
  'announce': ['Triggers', 'Media'],
  'announcement': ['Triggers', 'Media'],
  'opportunity': ['Triggers'],
  'opportunit': ['Triggers'],
  'capital rais': ['Triggers'],
  'capital infusion': ['Triggers'],
  'mou': ['Triggers'],
  'memorandum': ['Triggers'],
  'expansion': ['Triggers'],
  'capex': ['Triggers'],
  'expand': ['Triggers'],
  'new plant': ['Triggers'],
  'new site': ['Triggers'],
  'new facility': ['Triggers'],
  'bidding': ['Triggers'],
  'tender': ['Triggers'],
  'contract win': ['Triggers'],
  'order book': ['Triggers'],
  'agm': ['Triggers'],
  'fund': ['Triggers'],
  'funding': ['Triggers'],
  'series': ['Triggers'],
  'ipo': ['Triggers', 'Media'],
  'pre-ipo': ['Triggers', 'Media'],
  'merger': ['Triggers', 'Media'],
  'acquisition': ['Triggers', 'Media'],
  'demerger': ['Triggers', 'Media'],
  'cyber incident': ['Triggers', 'Media'],
  'cyber attack': ['Triggers', 'Media'],
  'breach': ['Triggers', 'Media'],
  'data breach': ['Triggers', 'Media'],
  'recall': ['Triggers', 'Media'],
  'product recall': ['Triggers', 'Media'],
  'fire': ['Triggers', 'Media'],
  'accident': ['Triggers', 'Media'],
  'incident': ['Triggers', 'Media'],

  // Litigation
  'lawsuit': ['Legal Cases', 'Legal Overview'],
  'litigation': ['Legal Cases', 'Legal Overview'],
  'sued': ['Legal Cases', 'Legal Overview'],
  'sue': ['Legal Cases', 'Legal Overview'],
  'suing': ['Legal Cases', 'Legal Overview'],
  'pending case': ['Legal Cases', 'Legal Overview'],
  'pending suit': ['Legal Cases', 'Legal Overview'],
  'claimant': ['Legal Cases', 'Legal Overview'],
  'respondent': ['Legal Cases', 'Legal Overview'],
  'plaintiff': ['Legal Cases', 'Legal Overview'],
  'defendant': ['Legal Cases', 'Legal Overview'],
  'legal': ['Legal Cases', 'Legal Overview'],
  'court': ['Legal Cases', 'Legal Overview'],
  'case': ['Legal Cases', 'Legal Overview'],
  'cases': ['Legal Cases', 'Legal Overview'],
  'tribunal': ['Legal Cases', 'Legal Overview'],
  'arbitration': ['Legal Cases', 'Legal Overview'],
  'writ': ['Legal Cases'],
  'high court': ['Legal Cases'],
  'criminal': ['Legal Cases'],
  'consumer': ['Legal Cases', 'Legal Overview'],
  'taxation': ['Legal Cases', 'Legal Overview', 'Defaults'],
  'tax matter': ['Legal Cases', 'Legal Overview', 'Defaults'],
  'tax dispute': ['Legal Cases', 'Legal Overview', 'Defaults'],

  // Insurance lines & exposure framings — broker shorthand
  'd&o': ['Triggers', 'Current Directors', 'Legal Cases'],
  'd & o': ['Triggers', 'Current Directors', 'Legal Cases'],
  'directors and officers': ['Triggers', 'Current Directors', 'Legal Cases'],
  'directors & officers': ['Triggers', 'Current Directors', 'Legal Cases'],
  'directors\' liability': ['Triggers', 'Current Directors', 'Legal Cases'],
  'pi ': ['Legal Cases', 'Defaults', 'Triggers'],
  'professional indemnity': ['Legal Cases', 'Defaults', 'Triggers'],
  'professional liability': ['Legal Cases', 'Defaults', 'Triggers'],
  'public liability': ['Triggers', 'Defaults', 'Legal Cases'],
  'product liability': ['Legal Cases', 'Defaults', 'Triggers'],
  'workmen': ['Defaults', 'Triggers', 'Employees'],
  'employee': ['Triggers', 'Defaults'],
  'workforce': ['Triggers'],
  'employment': ['Triggers', 'Defaults', 'Legal Cases'],
  'cyber': ['Triggers', 'Media', 'Defaults'],
  'cyber liab': ['Triggers', 'Media', 'Defaults'],
  'cyber risk': ['Triggers', 'Media', 'Defaults'],
  'cyber posture': ['Triggers', 'Media', 'Defaults'],
  'cyber readiness': ['Triggers', 'Media', 'Defaults'],
  'crime': ['Defaults', 'Legal Cases', 'Triggers'],
  'crime cover': ['Defaults', 'Legal Cases', 'Triggers'],
  'fidelity': ['Defaults', 'Legal Cases'],
  'bbb': ['Defaults', 'Legal Cases'],
  'bankers blanket': ['Defaults', 'Legal Cases'],
  'property cover': ['Triggers', 'Defaults'],
  'fire cover': ['Triggers', 'Defaults'],
  'marine': ['Triggers'],
  'marine cargo': ['Triggers'],
  'transit': ['Triggers'],
  'business interruption': ['Triggers', 'Defaults'],
  'bi cover': ['Triggers', 'Defaults'],
  'group health': ['Triggers'],
  'group medical': ['Triggers'],
  'group life': ['Triggers'],
  'gpa': ['Triggers'],
  'group personal accident': ['Triggers'],
  'crop': ['Triggers', 'Media'],
  'project insurance': ['Triggers', 'Defaults'],
  'project cover': ['Triggers', 'Defaults'],
  'car policy': ['Triggers'],
  'erection all risk': ['Triggers'],
  'iar ': ['Triggers'],
  'industrial all risk': ['Triggers'],
  'performance bond': ['Triggers'],
  'surety': ['Triggers'],
  'trade credit': ['Triggers', 'Consolidated Summary'],
  'sum insured': ['Triggers', 'Consolidated Summary'],
  'si ': ['Triggers', 'Consolidated Summary'],
  'limit': ['Triggers'],
  'cover adequacy': ['Triggers', 'Consolidated Summary'],
  'adequate cover': ['Triggers', 'Consolidated Summary'],
  'exposure': ['Triggers', 'Defaults', 'Legal Cases', 'Consolidated Summary'],
  'risk': ['Triggers', 'Defaults', 'Legal Cases'],
  'risk profile': ['Triggers', 'Defaults', 'Legal Cases'],
  'material': ['Triggers', 'Media', 'Defaults', 'Legal Cases'],
  'red flag': ['Defaults', 'Legal Cases', 'Triggers'],
  'underwriting': ['Triggers', 'Defaults', 'Legal Cases', 'Consolidated Summary'],
  'placement': ['Overview', 'Consolidated Summary'],
  'renewal': ['Triggers', 'Overview'],
  'policy': ['Triggers', 'Overview'],
  'cover': ['Triggers'],
  'covers': ['Triggers'],
  'coverage': ['Triggers'],

  // Peers / competitors
  'peer': ['Peers', 'Peers Ranking'],
  'peers': ['Peers', 'Peers Ranking'],
  'competitor': ['Peers', 'Peers Ranking'],
  'competition': ['Peers', 'Peers Ranking'],
  'compet': ['Peers', 'Peers Ranking'],
  'rank': ['Peers Ranking'],
  'ranking': ['Peers Ranking'],
  'industry': ['Peers', 'Peers Ranking', 'Overview'],
  'segment': ['Peers', 'Peers Ranking', 'Overview'],

  // Overview / basics
  'cin': ['Overview'],
  'incorporat': ['Overview'],
  'address': ['Overview'],
  'auditor': ['Overview'],
  'pan': ['Overview'],
  'listed': ['Overview'],
  'listing': ['Overview'],
  'unlisted': ['Overview'],
  'sector': ['Overview'],
  'state': ['Overview'],
  'location': ['Overview'],
  'office': ['Overview'],
  'plant location': ['Overview', 'Triggers'],
  'site': ['Overview', 'Triggers'],
  'pincode': ['Overview'],
  'authorised capital': ['Overview'],
  'paid up capital': ['Overview'],
  'paid-up capital': ['Overview'],
  'multi-site': ['Overview', 'Triggers'],
  'single-site': ['Overview', 'Triggers'],
  'geographic': ['Overview', 'Triggers'],

  // FX / FDI
  'fdi': ['Received in India'],
  'foreign': ['Received in India'],
  'received in india': ['Received in India'],
  'odi': ['Received in India'],
  'inbound investment': ['Received in India'],
};

const DEFAULT_CHAT_SHEETS = ['Overview', 'Triggers', 'Defaults'];

const pickRelevantSheets = (question, snapshot) => {
  const q = question.toLowerCase();
  const matched = new Set();
  for (const [kw, sheets] of Object.entries(CHAT_SHEET_KEYWORDS)) {
    if (q.includes(kw)) {
      for (const s of sheets) {
        if (snapshot[s]) matched.add(s);
      }
    }
  }
  if (matched.size === 0) {
    for (const s of DEFAULT_CHAT_SHEETS) {
      if (snapshot[s]) matched.add(s);
    }
  }
  // Cap to the 4 most useful sheets to keep prompt size manageable
  return Array.from(matched).slice(0, 4);
};

// Hard refusal patterns. These checks run BEFORE the model call to save
// tokens and to give a deterministic refusal for clearly out-of-scope queries.
// Hard refusals run before the model call to give a deterministic answer for
// out-of-scope questions and save tokens. Patterns are deliberately narrow so
// that legitimate analytical broker questions ("would D&O be relevant given
// the recent capital raise?") are NOT refused — those should reach the model.
// Order matters: more specific patterns come first.
const REFUSAL_PATTERNS = [
  {
    test: /\b(?:home\s+address|residential\s+address|personal\s+(?:phone|email|address|mobile)|aadhaar|aadhar|date\s+of\s+birth\s+of|salary\s+of|net\s+worth\s+of\s+(?:the\s+md|the\s+ceo|the\s+chairman|mr\.?|ms\.?|mrs\.?))\b/i,
    response:
      "I won't share personal information about individuals — home addresses, contact details, dates of birth, personal financials. That isn't appropriate for this assistant even if it appeared in the file. I can describe their professional role, tenure, and other-board appointments.",
    label: 'Personal information request',
  },
  {
    test: /\b(predict|forecast|prognos|crystal\s+ball|next\s+(?:quarter|year|fy)|in\s+the\s+future|going\s+to\s+(?:happen|occur))\b/i,
    response:
      "I can't predict what this company will do in the future. I can summarise what's already in the file — recent corporate triggers, ongoing litigation, current financial trajectory, regulatory record — and you can use that to form a view. Try asking 'what recent triggers might be material to insurance' instead.",
    label: 'Predictive question',
  },
  {
    test: /\b(?:vs\.?|versus|compared?\s+(?:to|with|against))\s+(?:other|another|all|every|the\s+other|our\s+other)\b|\bacross\s+(?:our\s+)?(?:book|portfolio|clients|prospects)\b|\b(?:rank(?:ings)?\s+(?:against|across))\b|\b(?:against|amongst)\s+(?:all|other|every|our\s+other|the\s+other)\s+(?:clients?|companies|prospects?|book)\b|\bclients?\s+in\s+(?:our|the)\s+book\b|\b(?:how\s+(?:do|does)\s+(?:they|this)\s+stack\s+up\s+against\s+(?:other|all|our))\b/i,
    response:
      "I can only answer questions grounded in this single company's Saverisk file. Cross-client comparisons need the portfolio view, where the full book is loaded. If you want a peer comparison within this file, I can pull the Peers and Peers Ranking sheets — those are scoped to this company.",
    label: 'Cross-client comparison',
  },
  {
    test: /\b(?:howden\s+(?:appetite|placement|underwriting|view|opinion|stance|position)|placement\s+desk|insurer\s+appetite|broker(?:age)?\s+(?:commission|rate|pricing|margin|fee)|(?:our|your)\s+(?:placement|underwriting|appetite|capacity|pricing|commission))\b/i,
    response:
      "I can't speak to Howden's internal processes — placement-desk knowledge, insurer appetites, broker commissions or pricing. That information sits outside this Saverisk file. I can answer questions about the company itself — directors, financials, regulatory record, recent triggers, litigation, peer position.",
    label: 'Howden-internal question',
  },
  {
    test: /\b(?:what\s+(?:rate|premium|price)\s+(?:should\s+(?:we|i)\s+(?:quote|charge|set))?|what(?:'s|\s+is)\s+(?:our|the)\s+(?:rate|premium|price|quote)|recommend(?:ed)?\s+(?:a\s+|the\s+)?(?:premium|rate|pricing|price|quote)|how\s+much\s+(?:should\s+)?(?:we\s+)?(?:charge|quote|price)|what\s+would\s+you\s+(?:price|quote)|quote\s+(?:a\s+|the\s+)?(?:premium|rate|price))\b/i,
    response:
      "Pricing is the underwriting team's call, not an analyst's. The benchmark median you can see on each offer card is a sample reference, not a quote. For an actual rate, talk to the placement desk with this prospect's profile in hand.",
    label: 'Pricing / underwriting decision',
  },
  {
    test: /\b(?:which\s+insurer|place\s+(?:it\s+)?with\s+(?:which|whom|what)|recommend(?:ed)?\s+insurer|which\s+carrier|hdfc\s+ergo|icici\s+lombard|tata\s+aig|reliance\s+general|new\s+india|oriental|national|united\s+india|bajaj\s+allianz|cholamandalam|future\s+generali|liberty\s+general|sbi\s+general|iffco\s+tokio)\b/i,
    response:
      "Insurer choice is a placement-desk decision and depends on appetite, capacity, and current relationships — none of which are in this Saverisk file. I can describe the risk profile to help you brief the placement team, but I can't recommend a specific carrier.",
    label: 'Insurer / carrier recommendation',
  },
];

const checkHardRefusal = (question) => {
  for (const r of REFUSAL_PATTERNS) {
    if (r.test.test(question)) return r;
  }
  return null;
};

// System prompt for the citation-required Saverisk chat. Insurance-broker
// aware — surfaces implications for cover, not just facts. Heavy emphasis on
// JSON output format with sheet+row+excerpt for every claim.
const buildSaveriskSystemPrompt = (entity, entityKind, sheets, snapshot) => {
  const sheetData = {};
  for (const s of sheets) {
    sheetData[s] = snapshot[s] || [];
  }

  const isProspect = entityKind === 'prospect';
  const subjectFraming = isProspect
    ? `${entity.name} is a prospect — a company being evaluated by the new business team for placement with Howden India.`
    : `${entity.name} is an existing Howden India client.`;

  return `You are an analyst assistant for a Howden India relationship manager. Howden is a commercial insurance broker, NOT an insurer. The relationship manager is asking a question about a single named company. ${subjectFraming}

Your job: answer the broker's question using ONLY the rows of Saverisk data provided below. You must cite every factual claim with a reference to a specific row and a short excerpt from that row. You must answer with insurance implications in mind, not as a generic corporate analyst.

==========
COMPANY METADATA
==========
- Name: ${entity.name}
- CIN: ${entity.cin}
- Industry: ${entity.industry || 'not specified'}
- Sector: ${entity.sector || 'not specified'}
- City: ${entity.city || 'not specified'}, State: ${entity.state || 'not specified'}
${entity.revenue ? `- Annual revenue: ₹${(entity.revenue / 1e7).toFixed(2)} Crore` : ''}
${entity.employees ? `- Employees: ${entity.employees}` : ''}
${entity.listed ? `- Listing status: ${entity.listed}` : ''}

==========
SAVERISK DATA — scoped to the most relevant sheets for this question
==========
${JSON.stringify(sheetData, null, 2)}

==========
HOW TO READ THIS DATA AS AN INSURANCE BROKER
==========
Treat the file as a corporate intelligence pack, not a policy document. The Saverisk file does NOT contain the company's existing insurance policies, sums insured, claims history with insurers, or premium paid — that information lives in Howden's policy register, which you do not have. Acknowledge this gap when relevant.

Common signals and their broker implications (use these to frame answers, do not invent facts):
- Capital Raised, IPO, pre-IPO funding → board exposure expanded → D&O cover and limit review
- Expansion, new plant, new site, capex → increased physical asset base → Property / Industrial All Risk sum-insured review, Marine Cargo for inbound equipment
- MoU, project win, bidding → upcoming project execution → Project Insurance, Performance Bond, Erection All Risk
- Cyber Incident, data breach → Cyber Liability cover review and limit increase
- Recall, product complaint → Product Liability and Crisis Management cover
- Lawsuit involving directors → D&O exposure
- Lawsuit alleging service failure → Professional Indemnity exposure
- Regulatory penalty (SEBI, RBI, IRDAI, NGT, PCB) → D&O defence cost cover, Pollution Legal Liability where relevant
- Open charges with lenders, large secured debt → Credit insurance and Trade Credit potentially
- New director appointment, MD change → D&O run-off and going-forward limits
- Director resignation, signatory left → check for D&O notification trigger
- Material revenue growth without commensurate cover scaling → sum-insured adequacy

Industry context for this company (${entity.industry || 'general'}): use the industry as a lens. A logistics company is most exposed on Marine Cargo, vehicle fleet, transit; a BFSI firm on Bankers Blanket Bond, Crime, Cyber, Professional Indemnity; a biotech on Product Liability, Clinical Trials, Cargo; a manufacturer on Property and Fire, Industrial All Risk, Public Liability, Workmen's Compensation. Frame your answer in the relevant industry's vocabulary.

==========
OUTPUT FORMAT — strict JSON, no markdown fences, no preamble
==========
{
  "answer": "Your answer in clear prose, using inline citation markers [1], [2], etc.",
  "citations": [
    { "sheet": "Triggers", "row": 7, "excerpt": "short excerpt under 160 chars" },
    { "sheet": "Defaults", "row": 3, "excerpt": "..." }
  ]
}

==========
CITATION RULES — non-negotiable
==========
1. EVERY factual claim must have a citation. If you can't cite it, don't say it.
2. The "row" number must match the "_row" field in the data above. The "_row" field is 1-indexed against the original spreadsheet, where row 1 is the header. So data starts at _row 2.
3. The "excerpt" must be a short factual quote drawn directly from the row, under 160 characters.
4. Citation markers like [1] in the answer must match the index in the citations array (1-indexed).
5. Same fact appearing in multiple rows: cite the most specific or most recent row.
6. When you make an insurance-implication observation that is your interpretation rather than a row fact, do NOT cite it — frame it as an observation. Example: "[1] suggests a D&O limit review may be warranted" — the [1] cites the trigger row, the implication is your inference.

==========
WHEN THE DATA SUPPORTS ONLY A PARTIAL ANSWER
==========
Many broker questions ask about things the Saverisk file partially covers. Be specific about what's in scope and what isn't:
- If the file has the trigger but not the cover detail: state the trigger fact with citation, then note that current sum-insured details are not in this file and would need to be checked in the policy register.
- If the file has the regulatory issue but not the resolution: state what's there, note that subsequent updates may have happened since the data refresh.
- Never invent figures, dates, names, or amounts that are not in the cited row.

If the data sheets above are entirely silent on the question, say so explicitly. Example: "The Saverisk file is silent on this. The provided sheets cover X, Y, Z — none speak to your question. You may need a more recent intelligence pull or the underwriting file." Return an empty citations array in that case.

==========
WHAT TO AVOID
==========
- Do not recommend a specific insurer.
- Do not quote a price or premium estimate. The benchmark medians visible to the broker on offer cards are sample references, not quotes.
- Do not advise the company should buy more cover. Frame any cover observation as a coverage adequacy or exposure question, not a sales recommendation. A broker is a fiduciary representing the client.
- Do not share personal contact details of individuals.
- Do not answer "what should we do" — answer "here is what the file tells you".

==========
STYLE
==========
- Concise. Two to four sentences for most answers. A list only if the answer is genuinely three-plus items.
- Indian currency conventions: ₹3.85 Crore (where 1 Crore = 1,00,00,000), ₹21.4 Lakh (where 1 Lakh = 1,00,000). Be consistent — pick the unit that fits the figure.
- Plain prose. No markdown bold or italic in the answer text.
- The relationship manager is working under time pressure. No "I hope this helps", no apologies, no preamble.
- Lead with the answer. Implications follow.

Respond with only the JSON object.`;
};

// Send a question to the model with retrieved sheets, parse the JSON response.
const askSaveriskChat = async (question, entity, entityKind, snapshot, history) => {
  const sheets = pickRelevantSheets(question, snapshot);

  const messages = [
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: question },
  ];

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 1500,
      system: buildSaveriskSystemPrompt(entity, entityKind, sheets, snapshot),
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

  // Strip ```json fences if model wrapped output despite instructions
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    // Fall back: if JSON parsing fails, treat the whole text as the answer
    // with no citations. This is the model misbehaving — surface it honestly.
    parsed = {
      answer: cleaned,
      citations: [],
      _parseError: true,
    };
  }

  return {
    answer: parsed.answer || '',
    citations: Array.isArray(parsed.citations) ? parsed.citations : [],
    sheetsUsed: sheets,
    parseError: !!parsed._parseError,
  };
};

// Render an answer with inline [n] citation markers as clickable chips
const AnswerWithCitations = ({ answer, citations }) => {
  const [openIdx, setOpenIdx] = useState(null);
  if (!answer) return null;

  // Split answer on [n] markers, keeping them
  const parts = answer.split(/(\[\d+\])/g);

  return (
    <div className="text-[13px]" style={{ color: 'var(--ink)', lineHeight: 1.55 }}>
      {parts.map((part, i) => {
        const m = part.match(/^\[(\d+)\]$/);
        if (m) {
          const idx = parseInt(m[1], 10) - 1;
          const cit = citations[idx];
          if (!cit) return <span key={i}>{part}</span>;
          const isOpen = openIdx === idx;
          return (
            <span key={i} className="relative inline-block">
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="inline-flex items-center justify-center mx-0.5 align-baseline tabular hover:underline"
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'var(--brand)',
                  background: 'var(--brand-soft)',
                  padding: '0 5px',
                  height: 16,
                  minWidth: 16,
                  borderRadius: 4,
                  border: '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                {idx + 1}
              </button>
              {isOpen && (
                <div
                  className="absolute z-50 mt-1 left-0 p-2.5 rounded-lg hairline"
                  style={{
                    background: 'var(--surface)',
                    boxShadow: '0 8px 24px rgba(11,59,92,0.16)',
                    width: 320,
                    fontSize: 11,
                    lineHeight: 1.45,
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <FileText size={10} style={{ color: 'var(--ink-3)' }} />
                      <span className="font-medium" style={{ color: 'var(--ink-2)', fontSize: 10.5 }}>
                        {cit.sheet} · row {cit.row}
                      </span>
                    </div>
                    <button onClick={() => setOpenIdx(null)} style={{ color: 'var(--ink-4)' }}>
                      <X size={11} />
                    </button>
                  </div>
                  <div style={{ color: 'var(--ink)' }}>"{cit.excerpt}"</div>
                </div>
              )}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
};

const SaveriskChat = ({ entity, entityKind, snapshot, open, onClose, onAudit }) => {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const endRef = useRef(null);

  // Reset chat history when the entity changes
  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [entity?.cin]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const content = (text || draft).trim();
    if (!content || loading) return;
    setError(null);

    // Hard refusal check before model call
    const refusal = checkHardRefusal(content);
    if (refusal) {
      const next = [
        ...messages,
        { role: 'user', content, ts: Date.now() },
        { role: 'assistant', content: refusal.response, citations: [], refused: true, refusalLabel: refusal.label, ts: Date.now() },
      ];
      setMessages(next);
      setDraft('');
      onAudit?.('Chat Refused', `${refusal.label}: ${content.substring(0, 80)}`);
      return;
    }

    const next = [...messages, { role: 'user', content, ts: Date.now() }];
    setMessages(next);
    setDraft('');
    setLoading(true);
    onAudit?.('Chat Question', `About ${entity.name}: ${content.substring(0, 80)}`);

    try {
      // History sent to model: previous turns only (not including this one yet)
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const result = await askSaveriskChat(content, entity, entityKind, snapshot, history);
      setMessages([
        ...next,
        {
          role: 'assistant',
          content: result.answer,
          citations: result.citations,
          sheetsUsed: result.sheetsUsed,
          parseError: result.parseError,
          ts: Date.now(),
        },
      ]);
    } catch (err) {
      setError(err.message || 'Something went wrong calling the model.');
    } finally {
      setLoading(false);
    }
  };

  // Suggested first questions, tailored to entity kind. Aligned to a relationship
  // manager's actual workflow when briefing themselves on a company.
  const suggestions = entityKind === 'prospect'
    ? [
        'What in this file is materially relevant to insurance?',
        'Any triggers in the last twelve months that affect cover requirements?',
        'Pending litigation that could affect D&O or PI exposure?',
        'Regulatory or compliance issues that would flag at underwriting?',
      ]
    : [
        'What in this file is materially relevant to insurance?',
        'Any recent triggers I should brief the client on at renewal?',
        'Pending litigation that would affect their D&O or PI exposure?',
        'Has anything in the file changed since last renewal that I should know?',
      ];

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(11,59,92,0.16)' }}
      />
      {/* Drawer */}
      <aside
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col hairline-l"
        style={{ width: 'min(540px, 100vw)', background: 'var(--surface)' }}
      >
        {/* Header */}
        <div className="px-5 py-4 hairline-b flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare size={13} style={{ color: 'var(--brand)' }} />
              <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: 'var(--ink-3)' }}>
                Ask about this {entityKind === 'prospect' ? 'prospect' : 'company'}
              </span>
              <SrTag size="xs" />
            </div>
            <div className="font-display text-[15px] leading-tight" style={{ color: 'var(--ink)' }}>
              {entity.name}
            </div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--ink-3)', lineHeight: 1.4 }}>
              Answers are grounded in this company's Saverisk file only. Every claim cites a sheet and row that you can inspect.
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: 'var(--ink-3)' }}>
            <X size={15} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {messages.length === 0 && (
            <div className="flex flex-col gap-3">
              <div className="text-[12px]" style={{ color: 'var(--ink-3)', lineHeight: 1.55 }}>
                Try one of these to get started:
              </div>
              <div className="flex flex-col gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    className="text-left text-[12px] px-3 py-2 rounded-lg hairline hover:bg-[var(--canvas-2)]"
                    style={{ color: 'var(--ink-2)', background: 'var(--canvas)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="text-[11px] mt-3 p-3 rounded-lg" style={{ color: 'var(--ink-3)', background: 'var(--canvas-2)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--ink-2)' }}>Out of scope:</strong> predictions about future behaviour, comparisons with other clients, or questions about Howden's internal processes. Those will be politely declined without a model call.
              </div>
            </div>
          )}

          {messages.map((m, i) => {
            if (m.role === 'user') {
              return (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] px-3 py-2 rounded-lg" style={{ background: 'var(--brand)', color: '#fff', fontSize: 13, lineHeight: 1.5 }}>
                    {m.content}
                  </div>
                </div>
              );
            }
            // Assistant
            return (
              <div key={i} className="flex flex-col gap-2">
                <div className="px-3 py-2.5 rounded-lg hairline" style={{ background: 'var(--canvas)' }}>
                  {m.refused ? (
                    <div className="flex items-start gap-2">
                      <Shield size={13} style={{ color: 'var(--ink-3)', marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div className="text-[10.5px] uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--ink-3)' }}>
                          {m.refusalLabel}
                        </div>
                        <div className="text-[12.5px]" style={{ color: 'var(--ink-2)', lineHeight: 1.5 }}>
                          {m.content}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <AnswerWithCitations answer={m.content} citations={m.citations || []} />
                      {m.parseError && (
                        <div className="text-[10.5px] mt-2 italic" style={{ color: 'var(--amber)' }}>
                          The model returned text outside the expected JSON shape. Showing as plain answer with no citations.
                        </div>
                      )}
                      {m.sheetsUsed && m.sheetsUsed.length > 0 && (
                        <div className="text-[10.5px] mt-2 flex items-center gap-1.5 flex-wrap" style={{ color: 'var(--ink-4)' }}>
                          <span>Searched:</span>
                          {m.sheetsUsed.map((s, j) => (
                            <span key={j} className="chip" style={{ background: 'var(--canvas-2)', color: 'var(--ink-3)', borderColor: 'transparent', padding: '0px 5px', fontSize: 9.5 }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--ink-3)' }}>
              <Sparkles size={11} />
              <span>Reading the file…</span>
            </div>
          )}

          {error && (
            <div className="px-3 py-2 rounded-lg text-[12px]" style={{ background: 'rgba(204,84,72,0.08)', color: 'var(--rose)' }}>
              {error}
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Composer */}
        <div className="px-5 py-3 hairline-t" style={{ background: 'var(--surface)' }}>
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask about directors, triggers, financials, regulatory record…"
              rows={2}
              className="flex-1 hairline rounded-lg px-3 py-2 text-[13px] resize-none focus:outline-none"
              style={{ background: 'var(--canvas)', color: 'var(--ink)', lineHeight: 1.45 }}
            />
            <button
              onClick={() => send()}
              disabled={!draft.trim() || loading}
              className="h-9 px-3 rounded-lg flex items-center gap-1.5 text-[12px] disabled:opacity-40"
              style={{ background: 'var(--brand)', color: '#fff' }}
            >
              <Send size={12} /> Send
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

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
  const isAdmin = broker && broker.role === 'super';
  const isProspectsMode = brokerId === '__prospects__';
  const myClients = useMemo(() => {
    if (!brokerId) return [];
    if (isProspectsMode) return [];
    if (isAdmin) {
      // Super Admin sees every client, sorted by city → industry → name
      return [...CLIENTS].sort((a, b) =>
        (a.city || '').localeCompare(b.city || '') ||
        (a.industry || '').localeCompare(b.industry || '') ||
        (a.name || '').localeCompare(b.name || '')
      );
    }
    // Brokers see clients where they are primary OR secondary
    return CLIENTS.filter(c => c.broker === brokerId || c.secondary_broker === brokerId);
  }, [brokerId, isAdmin, isProspectsMode]);
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
    if (filter === 'risk') arr = arr.filter(c => computeLossRatio(c) > 60 || c.claimsTrend === 'up');
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
    { k: 'risk', label: 'Risk flags', count: myClients.filter(c => computeLossRatio(c) > 60 || c.claimsTrend === 'up').length },
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
          if (id === '__prospects__') {
            setAuditLog([{ ts: Date.now(), action: 'Session started', detail: 'Signed in to the prospects view', actor: 'Prospect mode' }]);
          } else {
            const b = BROKERS.find(x => x.id === id);
            setAuditLog([{ ts: Date.now(), action: 'Session started', detail: `Signed in as ${b.name}`, actor: b.name }]);
          }
          setView('dashboard');
        }}
        onAbout={() => setView('about')}
        clients={CLIENTS}
        prospects={PROSPECTS}
      />
    </div>
  );

  // Prospects mode — separate UI tree, simpler than the broker dashboard
  // (no policy/claims/coverage data per prospect; the focus is opportunity
  // discovery from Saverisk + Howden book peer adoption).
  if (isProspectsMode) {
    const sel = selectedId ? PROSPECTS.find(p => p.id === selectedId) : null;
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
              <div className="hairline-l h-6"></div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                     style={{ background: 'linear-gradient(135deg, #5B7553 0%, #5B7553CC 100%)' }}>
                  <Target size={13} />
                </div>
                <div>
                  <div className="text-[12.5px] leading-none" style={{ color: 'var(--ink)' }}>Prospects view</div>
                  <div className="text-[10.5px]" style={{ color: 'var(--ink-3)' }}>New business pillar</div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('about')}
                className="text-[12px] px-2.5 h-8 rounded-lg hairline flex items-center gap-1.5"
                style={{ color: 'var(--ink-2)', background: 'var(--surface)' }}
              >
                <BookOpen size={12} /> About
              </button>
              <button
                onClick={() => {
                  setBrokerId(null);
                  setSelectedId(null);
                  setView('login');
                  setAuditLog([]);
                }}
                className="text-[12px] px-2.5 h-8 rounded-lg hairline flex items-center gap-1.5"
                style={{ color: 'var(--ink-2)', background: 'var(--surface)' }}
              >
                <LogOut size={12} /> Sign out
              </button>
            </div>
          </div>
        </header>

        <main className="px-6 py-6 max-w-[1400px] mx-auto">
          {sel ? (
            <ProspectDetail
              prospect={sel}
              onBack={() => setSelectedId(null)}
              onAudit={(action, detail) => {
                setAuditLog(prev => [...prev, { ts: Date.now(), action, detail, actor: 'Prospect mode' }]);
              }}
            />
          ) : (
            <ProspectsDashboard prospects={PROSPECTS} onSelect={(id) => setSelectedId(id)} />
          )}
        </main>
      </div>
    );
  }

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
                    {isAdmin ? 'Operations · all books' : broker.region}
                  </div>
                  <h1 className="font-display text-[32px] leading-tight mt-1" style={{ color: 'var(--ink)' }}>
                    {isAdmin
                      ? <>Operations dashboard, <em className="italic" style={{ color: 'var(--brand)' }}>{broker.name.split(' ')[0]}</em>.</>
                      : <>Good morning, <em className="italic" style={{ color: 'var(--brand)' }}>{broker.name.split(' ')[0]}</em>.</>
                    }
                  </h1>
                  <p className="text-[13px] mt-2 max-w-2xl" style={{ color: 'var(--ink-3)', lineHeight: 1.55 }}>
                    {isAdmin
                      ? <>You are viewing all {myClients.length} clients across both books, sorted by location and industry. {myClients.filter(c => computeAttractivenessScore(c) >= 75).length} score as high opportunity right now, and {myClients.filter(c => { const d = daysBetween(c.renewalDate); return d >= 0 && d <= 45; }).length} have renewals falling within the next forty five days.</>
                      : <>You have {myClients.length} clients under management. {myClients.filter(c => computeAttractivenessScore(c) >= 75).length} of them currently score as high opportunity, and {myClients.filter(c => { const d = daysBetween(c.renewalDate); return d >= 0 && d <= 45; }).length} have a renewal falling within the next forty five days.</>
                    }
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
                      currentBrokerId={brokerId}
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
          brokerRole={broker ? broker.role : 'broker'}
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
