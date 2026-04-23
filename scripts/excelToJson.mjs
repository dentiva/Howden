#!/usr/bin/env node
/**
 * Read data/clients.xlsx and emit src/clientData.json containing:
 *   { brokers: [...], clients: [...] }
 *
 * The React app imports the JSON; all nested structure (guardrails, evidence,
 * offers, doNotOffer, premiumHistory, claimsHistory) is rebuilt by joining
 * the detail sheets back onto each client by id.
 *
 * Run automatically by `npm run build` (via package.json prebuild script).
 * Also usable standalone: `node scripts/excelToJson.mjs`.
 */
import XLSX from 'xlsx';
import { writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const XLSX_PATH = resolve(ROOT, 'data', 'clients.xlsx');
const OUT_PATH = resolve(ROOT, 'src', 'clientData.json');

if (!existsSync(XLSX_PATH)) {
  console.error(`[excelToJson] missing ${XLSX_PATH}`);
  process.exit(1);
}

const wb = XLSX.readFile(XLSX_PATH);

function sheet(name) {
  const s = wb.Sheets[name];
  if (!s) throw new Error(`sheet not found: ${name}`);
  return XLSX.utils.sheet_to_json(s, { defval: '' });
}

const brokerRows = sheet('brokers');
const clientRows = sheet('clients');
const guardrailRows = sheet('guardrails');
const evidenceRows = sheet('evidence');
const offerRows = sheet('offers');
const dnoRows = sheet('do_not_offer');
const premRows = sheet('premium_history');
const claimRows = sheet('claims_history');

const pipeSplit = (v) =>
  typeof v === 'string' && v.length > 0
    ? v.split('|').map((s) => s.trim()).filter(Boolean)
    : [];

const byClient = (rows) => {
  const map = {};
  for (const r of rows) {
    const id = r.client_id;
    if (!map[id]) map[id] = [];
    map[id].push(r);
  }
  return map;
};

const guardrailsByClient = byClient(guardrailRows);
const evidenceByClient = byClient(evidenceRows);
const offersByClient = byClient(offerRows);
const dnoByClient = byClient(dnoRows);
const premByClient = byClient(premRows);
const claimsByClient = byClient(claimRows);

const brokers = brokerRows.map((b) => ({
  id: String(b.id),
  name: String(b.name),
  title: String(b.title),
  region: String(b.region),
  initials: String(b.initials),
  tone: String(b.tone),
}));

const clients = clientRows.map((c) => {
  const id = String(c.id);
  return {
    id,
    broker: String(c.broker),
    name: String(c.name),
    industry: String(c.industry),
    sector: String(c.sector),
    city: String(c.city),
    state: String(c.state),
    revenue: Number(c.revenue),
    employees: Number(c.employees),
    premium: Number(c.premium),
    claimsTrend: String(c.claimsTrend),
    renewalDate: String(c.renewalDate),
    growth3Y: Number(c.growth3Y),
    currentCoverages: pipeSplit(c.currentCoverages),
    gaps: pipeSplit(c.gaps),
    premiumHistory: (premByClient[id] || []).map((p) => ({
      y: String(p.year),
      v: Number(p.premium_cr),
    })),
    claimsHistory: (claimsByClient[id] || []).map((h) => ({
      y: String(h.year),
      n: Number(h.claim_count),
      amt: Number(h.incurred_cr),
    })),
    guardrails: (guardrailsByClient[id] || []).map((g) => ({
      rule: String(g.rule),
      status: String(g.status),
      detail: String(g.detail),
    })),
    evidence: (evidenceByClient[id] || []).map((e) => ({
      src: String(e.source),
      note: String(e.note),
    })),
    policyRecommendations: {
      offer: (offersByClient[id] || []).map((o) => ({
        product: String(o.product),
        type: String(o.type),
        confidence: String(o.confidence),
        estPremium: Number(o.estPremium) || 0,
        reason: String(o.reason),
      })),
      doNotOffer: (dnoByClient[id] || []).map((d) => ({
        product: String(d.product),
        blocker: String(d.blocker),
        reason: String(d.reason),
      })),
    },
    narrative: String(c.narrative),
  };
});

const payload = {
  _meta: {
    generated_at: new Date().toISOString(),
    source_file: 'data/clients.xlsx',
    broker_count: brokers.length,
    client_count: clients.length,
  },
  brokers,
  clients,
};

writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2));
console.log(
  `[excelToJson] wrote ${OUT_PATH} -- ${brokers.length} brokers, ${clients.length} clients`,
);
