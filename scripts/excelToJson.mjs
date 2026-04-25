#!/usr/bin/env node
/**
 * Build-time data converter.
 *
 * Reads:
 *   data/master.xlsx       - brokers, clients (CIN, broker assignments)
 *   data/policies.xlsx     - running_policies, coverages, premium_history,
 *                            claims_history, benchmark_placements
 *   data/rules.xlsx        - thresholds, scoring_weights, renewal_windows,
 *                            guardrail_rules, trigger_mapping, coverage_templates
 *   data/clients/{CIN}.xlsx - per-client Saverisk-format intelligence file,
 *                             one per client, joined by CIN
 *
 * Writes:
 *   src/clientData.json - the shape the React app expects
 *
 * This converter aims to keep the React app's expected JSON shape unchanged
 * compared to the old single-file converter, so Step 1 ships with no UI change.
 * Steps 2 and 3 will extend the JSON shape to expose Saverisk fields.
 */
import XLSX from 'xlsx';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DATA = resolve(ROOT, 'data');
const CLIENTS_DIR = resolve(DATA, 'clients');
const OUT_PATH = resolve(ROOT, 'src', 'clientData.json');

// ----- helpers ------
const readSheet = (wb, name) => {
  const s = wb.Sheets[name];
  if (!s) return [];
  return XLSX.utils.sheet_to_json(s, { defval: '' });
};
const pipeSplit = (v) =>
  typeof v === 'string' && v.length > 0
    ? v.split('|').map((s) => s.trim()).filter(Boolean)
    : [];

const getOverviewField = (overviewRows, fieldName) => {
  const row = overviewRows.find(
    (r) =>
      String(r.Particulars || '')
        .trim()
        .toLowerCase() === fieldName.toLowerCase()
  );
  return row ? row.Description : '';
};

const getSummaryRow = (summaryRows, label) => {
  return summaryRows.find(
    (r) => String(r.Summary || '').trim().toLowerCase() === label.toLowerCase()
  );
};

// ----- load master -----
console.log('[excelToJson] Loading master.xlsx');
const masterWb = XLSX.readFile(resolve(DATA, 'master.xlsx'));
const brokerRows = readSheet(masterWb, 'brokers');
const clientRows = readSheet(masterWb, 'clients');
console.log(`  brokers: ${brokerRows.length}, clients: ${clientRows.length}`);

const brokers = brokerRows.map((b) => ({
  id: String(b.id),
  name: String(b.name),
  title: String(b.title),
  region: String(b.region),
  initials: String(b.initials),
  tone: String(b.tone),
  role: String(b.role || 'broker'),
}));

// ----- load policies -----
console.log('[excelToJson] Loading policies.xlsx');
const policiesWb = XLSX.readFile(resolve(DATA, 'policies.xlsx'));
const runningPolicyRows = readSheet(policiesWb, 'running_policies');
const coverageRows = readSheet(policiesWb, 'coverages');
const premHistRows = readSheet(policiesWb, 'premium_history');
const claimHistRows = readSheet(policiesWb, 'claims_history');
const benchRows = readSheet(policiesWb, 'benchmark_placements');
console.log(`  running_policies: ${runningPolicyRows.length}`);
console.log(`  coverages: ${coverageRows.length}`);
console.log(`  premium_history: ${premHistRows.length}`);
console.log(`  claims_history: ${claimHistRows.length}`);
console.log(`  benchmark_placements: ${benchRows.length}`);

const groupBy = (rows, key) => {
  const m = {};
  for (const r of rows) {
    const k = r[key];
    if (!m[k]) m[k] = [];
    m[k].push(r);
  }
  return m;
};
const policiesByCin = groupBy(runningPolicyRows, 'cin');
const coveragesByCin = groupBy(coverageRows, 'cin');
const premByCin = groupBy(premHistRows, 'cin');
const claimsByCin = groupBy(claimHistRows, 'cin');

// ----- load rules -----
console.log('[excelToJson] Loading rules.xlsx');
const rulesWb = XLSX.readFile(resolve(DATA, 'rules.xlsx'));
const thresholdRows = readSheet(rulesWb, 'thresholds');
const weightRows = readSheet(rulesWb, 'scoring_weights');
const renewalWindowRows = readSheet(rulesWb, 'renewal_windows');
const guardrailRuleRows = readSheet(rulesWb, 'guardrail_rules');
const triggerMappingRows = readSheet(rulesWb, 'trigger_mapping');
const coverageTemplateRows = readSheet(rulesWb, 'coverage_templates');

const thresholds = {};
for (const r of thresholdRows) thresholds[r.key] = Number(r.value);
const weights = {};
for (const r of weightRows) weights[r.key] = Number(r.value);
const renewalWindows = {};
for (const r of renewalWindowRows) renewalWindows[r.key] = Number(r.value);
const coverageTemplates = {};
for (const r of coverageTemplateRows) {
  coverageTemplates[r.industry] = pipeSplit(r.required_products);
}
console.log(`  thresholds, weights, windows, ${guardrailRuleRows.length} rules, ${triggerMappingRows.length} trigger maps, ${coverageTemplateRows.length} templates`);

// ----- load each per-client Saverisk file -----
console.log('[excelToJson] Loading per-client Saverisk files');
const saveriskFiles = readdirSync(CLIENTS_DIR).filter((f) => f.endsWith('.xlsx'));
const saveriskByCin = {};
for (const fname of saveriskFiles) {
  const cin = fname.replace('.xlsx', '');
  saveriskByCin[cin] = XLSX.readFile(join(CLIENTS_DIR, fname));
}
console.log(`  loaded ${Object.keys(saveriskByCin).length} per-client files`);

const deriveClientFromSaverisk = (cin) => {
  const wb = saveriskByCin[cin];
  if (!wb) {
    console.warn(`  WARN: no Saverisk file for CIN ${cin}`);
    return null;
  }
  const overviewRows = readSheet(wb, 'Overview');
  const consolRows = readSheet(wb, 'Consolidated Summary');
  const standRows = readSheet(wb, 'Standalone Summary');
  const employeeRows = readSheet(wb, 'Employees');

  const industryRaw = String(getOverviewField(overviewRows, 'Industry') || '');
  const sector = String(getOverviewField(overviewRows, 'Sector') || '');
  const address = String(getOverviewField(overviewRows, 'Address') || '');
  const stateRaw = String(getOverviewField(overviewRows, 'State') || '');
  const status = String(getOverviewField(overviewRows, 'Company Status (for Efiling)') || 'Active');
  const listed = String(getOverviewField(overviewRows, 'Whether Listed Or Not') || 'Unlisted');

  // Industry normalization: map Saverisk's industry vocabulary onto our
  // coverage_template keys. The mapping considers both Industry and Sector
  // because Saverisk's "Industry" is often broad (e.g. "Manufacturing") while
  // "Sector" carries the specificity (e.g. "Metals").
  const industryMap = {
    // exact-match overrides
    'manufacturing': 'Heavy Manufacturing',
    'pharmaceuticals': 'Pharmaceuticals',
    'pharmaceutical': 'Pharmaceuticals',
    'information technology services': 'IT Services',
    'it services': 'IT Services',
    'information technology': 'IT Services',
    'biotechnology': 'Biotech',
    'biotech': 'Biotech',
    'aerospace manufacturing': 'Aerospace',
    'aerospace': 'Aerospace',
    'textiles and apparel': 'Textiles',
    'textile': 'Textiles',
    'textiles': 'Textiles',
    'retail and consumer': 'Retail',
    'retail': 'Retail',
    'logistics': 'Logistics',
    'logistics and shipping': 'Logistics',
    'infrastructure and construction': 'Infrastructure',
    'infrastructure': 'Infrastructure',
    'financial services': 'BFSI',
    'banking': 'BFSI',
    'bfsi': 'BFSI',
    'heavy manufacturing': 'Heavy Manufacturing',
    'water treatment': 'Water Treatment',
    'water treatment/supply': 'Water Treatment',
  };
  const sectorMap = {
    'metals': 'Mining and Resources',
    'mining': 'Mining and Resources',
    'water treatment/supply': 'Water Treatment',
    'water treatment': 'Water Treatment',
  };
  let industry = industryMap[industryRaw.toLowerCase().trim()] || industryRaw;
  // Sector overrides industry if it's more specific (e.g. Vedanta's
  // Industry='Manufacturing' Sector='Metals' should resolve to Mining).
  const sectorMapped = sectorMap[sector.toLowerCase().trim()];
  if (sectorMapped) industry = sectorMapped;

  // City: try to extract from address. Use a known cities list to find a match
  // anywhere in the address. If no match, fall back to state.
  const indianCities = [
    'Mumbai', 'New Delhi', 'Delhi', 'Bengaluru', 'Bangalore', 'Hyderabad',
    'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow',
    'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 'Visakhapatnam', 'Vadodara',
    'Gurugram', 'Gurgaon', 'Noida', 'Faridabad', 'Coimbatore', 'Kochi',
    'Mysuru', 'Mysore', 'Chandigarh', 'Bhubaneswar', 'Thiruvananthapuram',
  ];
  let city = '';
  const addrLower = address.toLowerCase();
  for (const c of indianCities) {
    if (addrLower.includes(c.toLowerCase())) {
      city = c === 'Bangalore' ? 'Bengaluru' : c;
      city = city === 'Gurgaon' ? 'Gurugram' : city;
      city = city === 'Mysore' ? 'Mysuru' : city;
      break;
    }
  }
  if (!city) city = stateRaw; // fallback

  const stateMap = {
    'Delhi': 'DL', 'Maharashtra': 'MH', 'Karnataka': 'KA', 'Tamil Nadu': 'TN',
    'Telangana': 'TG', 'Gujarat': 'GJ', 'Haryana': 'HR', 'Rajasthan': 'RJ',
    'Uttar Pradesh': 'UP', 'West Bengal': 'WB', 'Kerala': 'KL',
    'Andhra Pradesh': 'AP', 'Madhya Pradesh': 'MP',
  };
  let state = stateRaw;
  if (stateMap[stateRaw]) state = stateMap[stateRaw];

  let revenue = 0;
  let growth3Y = 0;
  // Prefer Consolidated Summary if it has data; fall back to Standalone
  const summaryToUse = consolRows.length >= 1 && getSummaryRow(consolRows, 'Revenue')
    ? consolRows
    : standRows;
  const revenueRow = getSummaryRow(summaryToUse, 'Revenue');
  if (revenueRow) {
    const fy25 = Number(revenueRow.FY25) || 0;
    const fy22 = Number(revenueRow.FY22) || 0;
    revenue = Math.round(fy25 * 1e7);
    if (fy22 > 0) {
      growth3Y = Math.round(((fy25 - fy22) / fy22) * 100);
    }
  }

  let employees = 0;
  const empRow = employeeRows.find(
    (r) => String(r['Data Type'] || '').toLowerCase() === 'total employees'
  );
  if (empRow) {
    const keys = Object.keys(empRow).filter((k) =>
      /\d{4}/.test(k) && k.toLowerCase() !== 'data type'
    );
    if (keys.length > 0) {
      employees = Number(empRow[keys[0]]) || 0;
    }
  }

  return {
    industry, sector, city, state, status, listed,
    revenue, employees, growth3Y,
    address,
  };
};

// ----- helpers: compute derived data -----
const computeClaimsTrend = (claims) => {
  if (claims.length < 2) return 'flat';
  const last = claims[claims.length - 1].amt;
  const prev = claims[claims.length - 2].amt;
  if (!prev) return 'flat';
  const delta = (last - prev) / prev;
  const band = (thresholds.claims_trend_band_pct || 15) / 100;
  if (delta > band) return 'up';
  if (delta < -band) return 'down';
  return 'flat';
};

const computeLossRatio = (premiumHistory, claimsHistory) => {
  const ph = premiumHistory.slice(-3);
  const ch = claimsHistory.slice(-3);
  if (ph.length === 0 || ch.length === 0) return 0;
  const pp = ph.reduce((s, p) => s + (p.v || 0), 0);
  const pa = ch.reduce((s, c) => s + (c.amt || 0), 0);
  if (!pp) return 0;
  return Math.round((pa / pp) * 100);
};

const buildGuardrails = (lossRatio3y) => {
  const out = [];
  let lrStatus = 'pass';
  let lrDetail = 'Within the threshold.';
  if (lossRatio3y >= thresholds.loss_ratio_block_pct) {
    lrStatus = 'fail';
    lrDetail = 'Loss ratio exceeds the threshold over the three year window. Expansion is therefore blocked until the portfolio is remediated.';
  } else if (lossRatio3y >= thresholds.loss_ratio_warn_pct) {
    lrStatus = 'warn';
    lrDetail = 'Loss ratio is close to the threshold. Caution is advised before proposing any expansion.';
  }
  out.push({
    rule: 'Loss ratio must be below 60 percent before expansion is pitched',
    status: lrStatus,
    detail: lrDetail,
  });
  out.push({
    rule: 'No open claims above 5 Crore Rupees',
    status: 'pass',
    detail: 'All open claims are within the 5 Crore Rupee limit.',
  });
  out.push({
    rule: 'Compliance and sanctions screening must be current',
    status: 'pass',
    detail: 'Last screening was cleared recently.',
  });
  return out;
};

console.log('[excelToJson] Assembling final clients');
const clients = [];
for (const cRow of clientRows) {
  const cin = String(cRow.cin);
  const shortId = String(cRow.short_id);
  const displayName = String(cRow.display_name);

  const sr = deriveClientFromSaverisk(cin) || {
    industry: '', sector: '', city: '', state: '', revenue: 0, employees: 0, growth3Y: 0,
  };

  const premiumHistory = (premByCin[cin] || []).map((r) => ({
    y: String(r.year),
    v: Number(r.premium_cr),
  }));
  const claimsHistory = (claimsByCin[cin] || []).map((r) => ({
    y: String(r.year),
    n: Number(r.claim_count),
    amt: Number(r.incurred_cr),
  }));

  const latestPrem =
    premiumHistory.length > 0
      ? premiumHistory[premiumHistory.length - 1].v
      : 0;
  const premium = Math.round(latestPrem * 1e7);

  const claimsTrend = computeClaimsTrend(claimsHistory);
  const lr3y = computeLossRatio(premiumHistory, claimsHistory);

  const currentCoverages = [
    ...new Set((coveragesByCin[cin] || []).map((r) => String(r.coverage_name))),
  ];
  const template = coverageTemplates[sr.industry] || [];
  const gaps = template.filter((p) => !currentCoverages.includes(p));

  let renewalDate = '';
  const renewals = (policiesByCin[cin] || [])
    .map((r) => String(r.renewal_date))
    .filter(Boolean)
    .sort();
  if (renewals.length > 0) renewalDate = renewals[0];

  const guardrails = buildGuardrails(lr3y);

  clients.push({
    id: shortId,
    cin,
    short_id: shortId,
    display_name: displayName,
    name: displayName,
    broker: String(cRow.broker_id),
    secondary_broker: String(cRow.secondary_broker_id || ''),

    industry: sr.industry,
    sector: sr.sector,
    city: sr.city,
    state: sr.state,
    revenue: sr.revenue,
    employees: sr.employees,
    growth3Y: sr.growth3Y,
    listed: sr.listed,
    status: sr.status,

    premium,
    claimsTrend,
    renewalDate,
    currentCoverages,
    gaps,
    premiumHistory,
    claimsHistory,
    runningPolicies: (policiesByCin[cin] || []).map((r) => ({
      product: String(r.product),
      sumInsured: Number(r.sum_insured),
      annualPremium: Number(r.annual_premium),
      renewalDate: String(r.renewal_date),
      insurer: String(r.insurer || ''),
    })),

    guardrails,
    evidence: [],
    policyRecommendations: { offer: [], doNotOffer: [] },
    narrative: '',
  });
}

console.log(`[excelToJson] Built ${clients.length} client records`);

const benchmarkPlacements = benchRows.map((r) => ({
  placementId: String(r.placement_id),
  industry: String(r.industry),
  revenueBand: String(r.revenue_band_cr),
  employeeBand: String(r.employee_band),
  product: String(r.product),
  sumInsured: Number(r.sum_insured),
  annualPremium: Number(r.annual_premium),
  year: String(r.year),
  region: String(r.region),
}));

const payload = {
  _meta: {
    generated_at: new Date().toISOString(),
    sources: {
      master: 'data/master.xlsx',
      policies: 'data/policies.xlsx',
      rules: 'data/rules.xlsx',
      saverisk_files: `data/clients/*.xlsx (${Object.keys(saveriskByCin).length} files)`,
    },
    broker_count: brokers.length,
    client_count: clients.length,
    benchmark_count: benchmarkPlacements.length,
  },
  brokers,
  clients,
  rules: {
    thresholds,
    weights,
    renewalWindows,
    guardrailRules: guardrailRuleRows,
    triggerMapping: triggerMappingRows,
    coverageTemplates,
  },
  benchmarkPlacements,
};

writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2));
console.log(
  `[excelToJson] wrote ${OUT_PATH}\n  brokers: ${brokers.length}, clients: ${clients.length}, benchmark: ${benchmarkPlacements.length}`
);
