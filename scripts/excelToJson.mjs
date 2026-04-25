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

// Build per-client sheet snapshots for the chat feature. Each snapshot is a
// trimmed, per-sheet array of row objects with explicit row numbers, used for
// citation-required answers in the SaveriskChat panel. Sheets are capped so
// the bundle stays small; for chat purposes the most recent 50 rows of any
// sheet cover virtually every insurance question we'd realistically expect.
const CHAT_SHEETS = [
  'Overview', 'Current Directors', 'Past Directors', 'Defaults',
  'Index Of Charges', 'Triggers', 'Media', 'Legal Cases', 'Legal Overview',
  'Consolidated Summary', 'Standalone Summary', 'Cross Directorship Holding',
  'Peers', 'Peers Ranking', 'Linkages', 'Received in India',
];
const SHEET_ROW_CAP = 50;

const buildSnapshot = (cin) => {
  const wb = saveriskByCin[cin];
  if (!wb) return {};
  const snapshot = {};

  // Helper: convert an Excel serial number to ISO date string. Excel's
  // epoch is 1899-12-30 (with the famous 1900 leap-year bug compensated).
  // Real Saverisk files store dates as Excel serials; the model should see
  // human-readable dates so its citations make sense.
  const excelSerialToISO = (n) => {
    if (typeof n !== 'number' || !isFinite(n) || n < 10000 || n > 60000) return null;
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const d = new Date(epoch.getTime() + n * 86400000);
    return d.toISOString().slice(0, 10);
  };

  // Helper: clean a row object — drop __EMPTY columns and convert any
  // detected Excel serial date in fields with a "date"-like key.
  const cleanRow = (row) => {
    const cleaned = {};
    for (const [k, v] of Object.entries(row)) {
      if (k.startsWith('__EMPTY')) continue;
      const lk = k.toLowerCase();
      if (lk === 'date' || lk.includes('date')) {
        const iso = excelSerialToISO(v);
        cleaned[k] = iso || v;
      } else {
        cleaned[k] = v;
      }
    }
    return cleaned;
  };

  for (const sheetName of CHAT_SHEETS) {
    if (!wb.Sheets[sheetName]) continue;
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });
    if (rows.length === 0) continue;
    // Clean rows first
    const cleaned = rows.map(cleanRow);
    // Sort triggers and media by date desc so the cap keeps the most recent
    let sorted = cleaned;
    if (sheetName === 'Triggers' || sheetName === 'Media') {
      sorted = [...cleaned].sort((a, b) => {
        const da = String(a.Date || '');
        const db = String(b.Date || '');
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return da < db ? 1 : -1;
      });
    }
    const capped = sorted.slice(0, SHEET_ROW_CAP);
    // Attach explicit row numbers (1-indexed, with header at row 1) so
    // citations can reference "row 7 of Triggers" deterministically.
    snapshot[sheetName] = capped.map((r, i) => ({ _row: i + 2, ...r }));
  }
  return snapshot;
};

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
    'commercial vehicles and components': 'Automotive',
    'solar and wind power generation': 'Renewables',
    'multi-specialty hospital network': 'Healthcare Delivery',
    'hyperlocal quick-commerce': 'E-commerce',
    'flexible packaging and films': 'Packaging',
  };
  // Also map prospect industry-raw values directly
  const directMap = {
    'energy': 'Renewables',
    'healthcare': 'Healthcare Delivery',
    'e-commerce': 'E-commerce',
    'automotive': 'Automotive',
    'renewables': 'Renewables',
    'packaging': 'Packaging',
  };
  let industry = industryMap[industryRaw.toLowerCase().trim()] || directMap[industryRaw.toLowerCase().trim()] || industryRaw;
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
    // Find all month-style columns, then pick the one with the largest value.
    // Saverisk's most-recent-month column may be partial (mid-month snapshot)
    // showing only one location, so taking it blindly underreports the count.
    // Picking max across the columns gives the headcount when data is complete.
    const keys = Object.keys(empRow).filter((k) =>
      /\d{4}/.test(k) && k.toLowerCase() !== 'data type'
    );
    const values = keys.map((k) => Number(empRow[k]) || 0).filter((n) => n > 0);
    if (values.length > 0) {
      employees = Math.max(...values);
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

// Read the Defaults sheet to detect material regulatory or environmental issues.
// Returns an object with the detected issue patterns, used to set guardrail
// statuses for Environmental and Compliance rules.
const readDefaultsSignals = (cin) => {
  const wb = saveriskByCin[cin];
  if (!wb) return { environmental: null, compliance: null };
  const rows = readSheet(wb, 'Defaults');
  let environmental = null;
  let compliance = null;
  for (const r of rows) {
    const cat = String(r.Category || '').toLowerCase();
    const remarks = String(r.Remarks || '').toLowerCase();
    const type = String(r.Type || '').toLowerCase();
    const isMaterial = type === 'material';

    // Environmental signal: pollution / NGT / environmental in remarks
    if (
      remarks.includes('pollution control') ||
      remarks.includes('ngt') ||
      remarks.includes('environmental')
    ) {
      environmental = {
        status: isMaterial ? 'fail' : 'warn',
        detail: String(r.Remarks),
      };
    }
    // Compliance signal: regulatory penalty / litigation / sebi enforcement
    if (
      cat.includes('regulatory penalty') ||
      cat.includes('litigation') ||
      cat.includes('enforcement') ||
      remarks.includes('sebi enforcement')
    ) {
      // Only override if not already set to fail by an environmental signal
      const newStatus = isMaterial ? 'warn' : 'pass';
      if (!compliance || (compliance.status === 'pass' && newStatus === 'warn')) {
        compliance = { status: newStatus, detail: String(r.Remarks) };
      }
    }
  }
  return { environmental, compliance };
};

const buildGuardrails = (lossRatio3y, defaultsSignals, industry) => {
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

  // Environmental guardrail — only relevant for industries with environmental exposure
  const environmentalIndustries = ['Infrastructure', 'Heavy Manufacturing', 'Mining and Resources', 'Pharmaceuticals', 'Biotech'];
  if (environmentalIndustries.includes(industry)) {
    if (defaultsSignals.environmental) {
      out.push({
        rule: 'Environmental and regulatory standing must be clean',
        status: defaultsSignals.environmental.status,
        detail: defaultsSignals.environmental.detail,
      });
    } else {
      out.push({
        rule: 'Environmental and regulatory standing must be clean',
        status: 'pass',
        detail: 'No outstanding environmental notices on file.',
      });
    }
  }

  // Compliance and sanctions screening — connected to Defaults compliance signal
  if (defaultsSignals.compliance && defaultsSignals.compliance.status !== 'pass') {
    out.push({
      rule: 'Compliance and sanctions screening must be current',
      status: defaultsSignals.compliance.status,
      detail: defaultsSignals.compliance.detail,
    });
  } else {
    out.push({
      rule: 'Compliance and sanctions screening must be current',
      status: 'pass',
      detail: 'Last screening was cleared recently.',
    });
  }

  return out;
};

// Build a trigger-mapping lookup for fast offer generation.
const triggerMap = {};
for (const r of triggerMappingRows) {
  const key = `${String(r.trigger_category).toLowerCase()}::${String(r.trigger_type).toLowerCase()}`;
  triggerMap[key] = {
    suggestedProduct: String(r.suggested_product || ''),
    suggestedAction: String(r.suggested_action || ''),
    defaultConfidence: String(r.default_confidence || ''),
    rationale: String(r.rationale || ''),
  };
}

// Benchmark helpers: given an industry/revenue/employee profile and a product,
// return a price range with sample size.
const revenueBandFor = (revRupees) => {
  const cr = revRupees / 1e7;
  if (cr < 500) return '0-500';
  if (cr < 1500) return '500-1500';
  if (cr < 5000) return '1500-5000';
  if (cr < 15000) return '5000-15000';
  return '15000+';
};
const employeeBandFor = (n) => {
  if (n < 500) return '0-500';
  if (n < 2000) return '500-2000';
  if (n < 5000) return '2000-5000';
  if (n < 15000) return '5000-15000';
  return '15000+';
};

// Build a benchmark range for (industry, revenueBand, product).
const benchmarkRange = (industry, revRupees, employees, product) => {
  const revBand = revenueBandFor(revRupees);
  const empBand = employeeBandFor(employees);
  let matches = benchRows.filter(
    (r) =>
      r.industry === industry &&
      r.revenue_band_cr === revBand &&
      r.product === product
  );
  let fallback = 'industry+revenue';
  if (matches.length < 3) {
    matches = benchRows.filter(
      (r) => r.industry === industry && r.product === product
    );
    fallback = 'industry';
  }
  if (matches.length < 3) {
    return null;
  }
  const premiums = matches.map((r) => Number(r.annual_premium)).sort((a, b) => a - b);
  const low = premiums[Math.floor(premiums.length * 0.25)];
  const high = premiums[Math.floor(premiums.length * 0.75)];
  const median = premiums[Math.floor(premiums.length / 2)];
  return {
    low, high, median,
    sample: matches.length,
    fallbackLevel: fallback,
    industry, revenueBand: revBand, employeeBand: empBand,
    product,
  };
};

// Read triggers from a client's Saverisk file.
const readTriggers = (cin) => {
  const wb = saveriskByCin[cin];
  if (!wb) return [];
  const rows = readSheet(wb, 'Triggers');
  return rows
    .filter((r) => r.Date && r.Category)
    .map((r) => ({
      date: String(r.Date).slice(0, 10),
      category: String(r.Category),
      type: String(r.Type),
      comment: String(r.Comment || ''),
      sourceUrl: String(r['Source Url'] || ''),
    }));
};

const readMedia = (cin) => {
  const wb = saveriskByCin[cin];
  if (!wb) return [];
  const rows = readSheet(wb, 'Media');
  return rows
    .filter((r) => r['News Title'])
    .map((r) => ({
      title: String(r['News Title']),
      date: String(r.Date).slice(0, 10),
      source: String(r.Description || ''),
      url: String(r.Url || ''),
    }));
};

const readPeersRanking = (cin) => {
  const wb = saveriskByCin[cin];
  if (!wb) return null;
  const rows = readSheet(wb, 'Peers Ranking');
  const rankRows = rows.filter((r) =>
    r['Company Name (rs.cr)'] &&
    !String(r['Company Name (rs.cr)']).includes('Rank') &&
    typeof r.Revenue === 'number'
  );
  if (rankRows.length === 0) return null;
  // Some sheets list the focal company twice — once as a header row showing
  // actual values, once again interleaved among the peer ranks. Keep only
  // the first occurrence of each company name so the rendered table doesn't
  // double up. Real Saverisk files (Vedanta, Suez) put actual financial
  // figures in the first row rather than ranks; detect by checking whether
  // any rank-like column exceeds the row count, indicating actuals.
  const N = rankRows.length;
  const looksLikeActuals = (r) => {
    const vals = ['Revenue', 'Ebitda', 'Debt/ebitda', 'Pat Margin', 'Leverage']
      .map((k) => Number(r[k]))
      .filter((v) => isFinite(v));
    // If any value is outside the plausible rank range (1..N), treat as
    // actual financial figures rather than ranks
    return vals.some((v) => v > N + 5 || (!Number.isInteger(v) && v < 100));
  };
  const seen = new Set();
  const deduped = [];
  for (const r of rankRows) {
    const name = String(r['Company Name (rs.cr)']);
    if (seen.has(name)) continue;
    if (looksLikeActuals(r)) continue;
    seen.add(name);
    deduped.push(r);
  }
  return deduped.map((r) => ({
    company: String(r['Company Name (rs.cr)']),
    revenueRank: Number(r.Revenue) || null,
    ebitdaRank: Number(r.Ebitda) || null,
    debtEbitdaRank: Number(r['Debt/ebitda']) || null,
    patMarginRank: Number(r['Pat Margin']) || null,
    leverageRank: Number(r.Leverage) || null,
  }));
};

const readCrossDirectorship = (cin) => {
  const wb = saveriskByCin[cin];
  if (!wb) return [];
  const rows = readSheet(wb, 'Cross Directorship Holding');
  return rows
    .filter((r) => r.Company && r['Sr. No.'])
    .map((r) => ({
      company: String(r.Company),
      cin: String(r.Cin || ''),
      commonDirectors: Number(r['% Common Directors']) || 0,
      state: String(r.State || ''),
      paidUpCapital: Number(r['Paid Up Cap (rs Lacs)']) || 0,
    }));
};

const readLegalOverview = (cin) => {
  const wb = saveriskByCin[cin];
  if (!wb) return null;
  const rows = readSheet(wb, 'Legal Overview');
  const totalRow = rows.find((r) => String(r.Category || '').toLowerCase().includes('total cases'));
  const highRiskRow = rows.find((r) => String(r.Category || '').toLowerCase().includes('high risk'));
  if (!totalRow) return null;
  return {
    totalCases: Number(totalRow.Total) || 0,
    highRiskCases: highRiskRow ? Number(highRiskRow.Total) || 0 : 0,
    asAppellant: Number(totalRow.Appellant) || 0,
    asRespondent: Number(totalRow.Respondent) || 0,
  };
};

// ============================================================================
//  OFFER ASSEMBLY — clients and prospects
// ============================================================================
//
// Two generators live here:
//   - generateOffers — for existing clients, walking real Saverisk triggers,
//     industry-template gaps, renewal uplifts, and revenue-growth upsells.
//   - generateProspectOffers — for new business prospects, walking the
//     industry's coverage template gated by peer-adoption percentage.
//
// Both are enriched with a benchmark range pulled from Howden's placement
// history (see benchmarkRange).

// Tuning constants. In production these would live in rules.xlsx alongside
// thresholds and renewal_windows, then read into the engine here.
const TRIGGER_LOOKBACK_MONTHS = 18;
const RENEWAL_UPLIFT_FLOOR_PCT = 0.85; // current premium below this fraction of median triggers an uplift suggestion
const REVENUE_GROWTH_TRIGGER_PCT = 20; // 3y revenue growth at or above this triggers a growth-upsell review
const ADOPTION_THRESHOLD_PCT = 40;     // prospect offers below this peer-adoption percentage are not surfaced

// Sort triggers most-recent-first and apply the lookback cutoff. Used by
// both offer generators.
const recentTriggersIn = (triggers) => {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - TRIGGER_LOOKBACK_MONTHS);
  return [...triggers]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .filter((t) => new Date(t.date) >= cutoff);
};

// Peer-adoption percentage map keyed by `${industry}::${product}`.
// The benchmark dataset has one row per (insured × product) but no shared
// insured ID across rows. So we approximate adoption by normalising each
// product's row count against the most-frequent product in that industry.
// The resulting score reads as "share of peers who carry this cover,
// relative to the most adopted cover in the segment".
// Honest about what this is: a synthetic-data approximation. Production
// would compute this from real placement data with a true insured key.
const peerAdoptionPct = (() => {
  const rowsByPair = {};
  for (const r of benchRows) {
    const key = `${r.industry}::${r.product}`;
    rowsByPair[key] = (rowsByPair[key] || 0) + 1;
  }
  const maxByIndustry = {};
  for (const key of Object.keys(rowsByPair)) {
    const [industry] = key.split('::');
    if (!maxByIndustry[industry] || rowsByPair[key] > maxByIndustry[industry]) {
      maxByIndustry[industry] = rowsByPair[key];
    }
  }
  const result = {};
  for (const key of Object.keys(rowsByPair)) {
    const [industry] = key.split('::');
    const max = maxByIndustry[industry] || 1;
    result[key] = Math.round((rowsByPair[key] / max) * 100);
  }
  return result;
})();

// Generate prospect opportunity offers.
// For prospects, every product in the industry's coverage template is a
// candidate (prospects have no existing coverage with us). Each candidate is
// gated by peer-adoption percentage and the surviving products are ranked
// by adoption, with a recent corporate trigger from the trigger_mapping
// reinforcing the case where one applies.
const generateProspectOffers = (triggers, srData) => {
  const industry = srData.industry;
  const template = coverageTemplates[industry] || [];
  const offers = [];

  // Mark which template products have a recent trigger reinforcing them
  const triggerProducts = new Map();
  for (const t of recentTriggersIn(triggers)) {
    const key = `${t.category.toLowerCase()}::${t.type.toLowerCase()}`;
    const map = triggerMap[key];
    if (!map || !map.suggestedProduct) continue;
    if (!triggerProducts.has(map.suggestedProduct)) {
      triggerProducts.set(map.suggestedProduct, t);
    }
  }

  for (const product of template) {
    const range = benchmarkRange(industry, srData.revenue, srData.employees, product);
    const adoption = peerAdoptionPct[`${industry}::${product}`];
    if (adoption === undefined || adoption === null) continue;
    if (adoption < ADOPTION_THRESHOLD_PCT) continue;

    const triggerEvent = triggerProducts.get(product);
    const triggered = !!triggerEvent;

    let confidence = 'medium';
    if (adoption >= 80) confidence = 'high';
    else if (adoption < 50) confidence = 'low';

    // Reason text — different framing for triggered vs untriggered
    let reason;
    if (triggered) {
      reason = `${adoption}% of ${industry} peers in our book carry this cover. A recent corporate trigger reinforces the case: ${triggerEvent.comment.substring(0, 100)}`;
    } else {
      reason = `${adoption}% of ${industry} peers in our book carry this cover, making it a strong starting position for the conversation.`;
    }

    offers.push({
      product,
      type: 'prospect-opportunity',
      confidence,
      estPremium: range ? range.median : 0,
      probability: adoption,
      reason,
      triggerDate: triggered ? triggerEvent.date : null,
      triggerCategory: triggered ? triggerEvent.category : null,
      triggerType: triggered ? triggerEvent.type : null,
      benchmark: range,
    });
  }

  // Sort by probability desc, with triggered events tie-breaking up
  offers.sort((a, b) => b.probability - a.probability || (b.triggerDate ? 1 : 0) - (a.triggerDate ? 1 : 0));
  return offers;
};


// Generate offers for an existing client. Walks four sources:
//   1. Recent corporate triggers via the trigger_mapping
//   2. Industry-template coverage gaps not already in place
//   3. Running policies whose current premium sits well below benchmark median
//   4. A growth-vs-premium drift signal flagged as a sum-insured review
const generateOffers = (currentCoverages, triggers, srData, runningPolicies, premiumHistory) => {
  const seen = new Set();
  const offers = [];
  const renewalAttentionDays = renewalWindows.attention_days || 90;

  // ---- Trigger-driven offers ----
  for (const t of recentTriggersIn(triggers)) {
    const key = `${t.category.toLowerCase()}::${t.type.toLowerCase()}`;
    const map = triggerMap[key];
    if (!map || !map.suggestedProduct) continue;
    if (seen.has(map.suggestedProduct)) continue;
    if (
      currentCoverages.includes(map.suggestedProduct) &&
      map.suggestedAction === 'cross-sell'
    ) {
      continue;
    }
    seen.add(map.suggestedProduct);
    const range = benchmarkRange(
      srData.industry, srData.revenue, srData.employees, map.suggestedProduct
    );
    offers.push({
      product: map.suggestedProduct,
      type: map.suggestedAction,
      confidence: map.defaultConfidence,
      estPremium: range ? range.median : 0,
      reason: `${map.rationale} Triggered by: ${t.comment.substring(0, 110)}`,
      triggerDate: t.date,
      triggerCategory: t.category,
      triggerType: t.type,
      benchmark: range,
    });
  }

  // ---- Industry-template gaps ----
  const template = coverageTemplates[srData.industry] || [];
  for (const gapProduct of template) {
    if (currentCoverages.includes(gapProduct)) continue;
    if (seen.has(gapProduct)) continue;
    const range = benchmarkRange(srData.industry, srData.revenue, srData.employees, gapProduct);
    if (!range) continue;
    seen.add(gapProduct);
    offers.push({
      product: gapProduct,
      type: 'cross-sell',
      confidence: 'medium',
      estPremium: range.median,
      reason: `Industry peers in ${srData.industry} typically carry ${gapProduct}; this client does not.`,
      triggerDate: null,
      triggerCategory: 'Coverage gap',
      triggerType: 'Template-based',
      benchmark: range,
    });
  }

  // ---- Renewal-uplift offers ----
  // For each running policy renewing inside the attention window (default 90
  // days, configurable via rules.xlsx), check whether its current premium is
  // below RENEWAL_UPLIFT_FLOOR_PCT of the Howden book benchmark median for
  // the (industry, revenue band, product) combination. If so, suggest a
  // renewal uplift to the median.
  if (runningPolicies && runningPolicies.length > 0) {
    const today = new Date();
    for (const pol of runningPolicies) {
      if (!pol.renewal_date) continue;
      const ren = new Date(pol.renewal_date);
      const daysLeft = Math.floor((ren - today) / (1000 * 60 * 60 * 24));
      if (daysLeft < 0 || daysLeft > renewalAttentionDays) continue;
      const product = pol.product;
      const range = benchmarkRange(srData.industry, srData.revenue, srData.employees, product);
      if (!range) continue;
      const currentPrem = Number(pol.annual_premium) || 0;
      if (currentPrem >= range.median * RENEWAL_UPLIFT_FLOOR_PCT) continue;
      const uplift = range.median - currentPrem;
      const renewalKey = `renewal-uplift::${product}`;
      if (seen.has(renewalKey)) continue;
      seen.add(renewalKey);
      offers.push({
        product,
        type: 'renewal-uplift',
        confidence: 'medium',
        estPremium: uplift,
        reason: `Current ${product} premium of ${formatRupeesPretty(currentPrem)} sits below the Howden book median of ${formatRupeesPretty(range.median)} for comparable risks in the segment. Renewal in ${daysLeft} day${daysLeft === 1 ? '' : 's'} — review whether the current sum insured and limits are adequate for the client's current exposure profile, and discuss with the client at renewal.`,
        triggerDate: pol.renewal_date,
        triggerCategory: 'Renewal window',
        triggerType: 'Below benchmark median',
        benchmark: range,
      });
    }
  }

  // ---- Revenue-growth upsell ----
  // If 3-year revenue growth is meaningful but the latest premium hasn't
  // grown by at least half as much, sum-insured may be lagging. Surface as
  // a portfolio-wide review prompt rather than tied to one specific product.
  if (premiumHistory && premiumHistory.length >= 4 && srData.growth3Y >= REVENUE_GROWTH_TRIGGER_PCT) {
    const latestPrem = premiumHistory[premiumHistory.length - 1].v;
    const oldestPrem = premiumHistory[premiumHistory.length - 4].v;
    if (oldestPrem > 0) {
      const premGrowthPct = ((latestPrem - oldestPrem) / oldestPrem) * 100;
      if (premGrowthPct < srData.growth3Y / 2) {
        offers.push({
          product: 'Sum insured review',
          type: 'upsell',
          confidence: 'medium',
          estPremium: 0,
          reason: `Revenue grew by ${srData.growth3Y}% over three years while premium grew by only ${Math.round(premGrowthPct)}%. The sum insured on property, marine, and liability covers should be reviewed at the next renewal to track exposure.`,
          triggerDate: null,
          triggerCategory: 'Growth signal',
          triggerType: 'Sum insured drift',
          benchmark: null,
        });
      }
    }
  }

  return offers;
};

// Format Rupees in INR scale labels (Crore / Lakh) for the offer reason text.
function formatRupeesPretty(rupees) {
  if (!rupees || rupees === 0) return '0';
  const abs = Math.abs(rupees);
  if (abs >= 1e7) return `₹${(rupees / 1e7).toFixed(2)} Crore`;
  if (abs >= 1e5) return `₹${(rupees / 1e5).toFixed(2)} Lakh`;
  return `₹${rupees.toLocaleString('en-IN')}`;
}

// ----------------------------------------------------------------------------
// ANCHOR PRODUCT — the cover most central to a client / prospect conversation
// ----------------------------------------------------------------------------
// For an existing client, the anchor is the running policy with the largest
// annual premium. Tie-break by renewal date (renewing-soonest wins) so the
// anchor changes through the year as different covers come up for renewal.
//
// For a prospect, the anchor is the offer with the highest expected value,
// computed as probability × benchmark median premium. This lifts a high-
// probability low-premium offer (Workmen's Compensation at 100%) below a
// high-value offer with a still-reasonable probability (Industrial All Risk
// at 89%, ₹5.2 Cr median). The result is the cover that combines reasonable
// landing odds with material deal size.

const computeClientAnchor = (runningPolicies) => {
  if (!runningPolicies || runningPolicies.length === 0) return null;
  // Sort: largest premium first, then renewing-soonest as tiebreak
  const sorted = [...runningPolicies].sort((a, b) => {
    const premDiff = (Number(b.annual_premium) || 0) - (Number(a.annual_premium) || 0);
    if (premDiff !== 0) return premDiff;
    const dateA = new Date(a.renewal_date || '9999-12-31');
    const dateB = new Date(b.renewal_date || '9999-12-31');
    return dateA - dateB;
  });
  const top = sorted[0];
  return {
    product: String(top.product),
    annualPremium: Number(top.annual_premium) || 0,
    renewalDate: String(top.renewal_date || ''),
    rationale: `Largest current line by annual premium (${formatRupeesPretty(Number(top.annual_premium) || 0)}). The anchor of any conversation about this client.`,
    kind: 'client',
  };
};

const computeProspectAnchor = (offers) => {
  if (!offers || offers.length === 0) return null;
  // Score = probability × estPremium. Filter to offers with both signals
  // present; otherwise we'd anchor on a free pick. estPremium is in Rupees
  // already (benchmark median).
  const scored = offers
    .filter((o) => o.probability && o.estPremium)
    .map((o) => ({
      ...o,
      anchorScore: (o.probability / 100) * o.estPremium,
    }))
    .sort((a, b) => b.anchorScore - a.anchorScore);
  if (scored.length === 0) return null;
  const top = scored[0];
  return {
    product: top.product,
    estPremium: top.estPremium,
    probability: top.probability,
    rationale: `Highest expected value: ${top.probability}% peer adoption × benchmark median ${formatRupeesPretty(top.estPremium)}. Lead the conversation with this cover.`,
    kind: 'prospect-probable',
  };
};

// Build evidence rows from a client's Saverisk file.
const buildEvidence = (cin) => {
  const triggers = readTriggers(cin);
  const media = readMedia(cin);
  const wb = saveriskByCin[cin];
  const defaults = wb ? readSheet(wb, 'Defaults').filter((r) => r.Source) : [];

  const items = [];
  const sortedTriggers = [...triggers].sort((a, b) => (a.date < b.date ? 1 : -1));
  const materialTriggers = sortedTriggers.filter((t) => t.category === 'Risk' || t.category === 'Opportunity').slice(0, 3);
  for (const t of materialTriggers) {
    items.push({
      src: `Saverisk Triggers, ${t.date}`,
      note: `${t.category}: ${t.comment}`,
    });
  }
  const sortedMedia = [...media].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 2);
  for (const m of sortedMedia) {
    items.push({
      src: `Press coverage, ${m.date}, ${m.source}`,
      note: m.title,
    });
  }
  for (const d of defaults.slice(0, 1)) {
    items.push({
      src: `Public filings, ${d.Source || 'MCA'}`,
      note: String(d.Remarks || ''),
    });
  }
  return items;
};

// ============================================================================
//  OFFER ASSEMBLY
// ============================================================================

console.log('[excelToJson] Assembling final clients and prospects');
const clients = [];
const prospects = [];
for (const cRow of clientRows) {
  const cin = String(cRow.cin);
  const shortId = String(cRow.short_id);
  const displayName = String(cRow.display_name);
  const isProspect = String(cRow.is_prospect || '').toLowerCase() === 'yes';

  const sr = deriveClientFromSaverisk(cin) || {
    industry: '', sector: '', city: '', state: '', revenue: 0, employees: 0, growth3Y: 0,
  };

  // ---- Prospect path: skip policy data, generate prospect offers ----
  if (isProspect) {
    const triggers = readTriggers(cin);
    const media = readMedia(cin);
    const peersRanking = readPeersRanking(cin);
    const crossDirectorship = readCrossDirectorship(cin);
    const legalOverview = readLegalOverview(cin);

    const offers = generateProspectOffers(triggers, sr);
    const totalOpportunityValue = offers.reduce((s, o) => s + (o.estPremium || 0), 0);
    const highProbCount = offers.filter((o) => o.probability >= 60).length;
    const anchor = computeProspectAnchor(offers);

    // Synthesise a brief narrative
    const narrativeParts = [];
    if (sr.industry && sr.city) {
      const acronymIndustries = new Set(['BFSI', 'IT Services']);
      const ind = acronymIndustries.has(sr.industry) ? sr.industry : sr.industry.toLowerCase();
      const article = /^[aeiouAEIOU]/.test(ind) ? 'An' : 'A';
      narrativeParts.push(`${article} ${ind} prospect based in ${sr.city}.`);
    }
    if (sr.growth3Y >= 25) {
      narrativeParts.push(`Revenue has grown materially over the past three years; a strong fit for a Howden conversation.`);
    } else if (sr.growth3Y >= 10) {
      narrativeParts.push(`Revenue has grown steadily over the past three years.`);
    }
    if (highProbCount >= 4) {
      narrativeParts.push(`${highProbCount} high-probability opportunities identified from peer adoption.`);
    } else if (highProbCount >= 1) {
      narrativeParts.push(`${highProbCount} viable opportunit${highProbCount === 1 ? 'y' : 'ies'} identified.`);
    }
    const narrative = narrativeParts.join(' ');

    prospects.push({
      id: shortId,
      cin,
      short_id: shortId,
      display_name: displayName,
      name: displayName,
      industry: sr.industry,
      sector: sr.sector,
      city: sr.city,
      state: sr.state,
      revenue: sr.revenue,
      employees: sr.employees,
      growth3Y: sr.growth3Y,
      listed: sr.listed,
      status: sr.status,
      narrative,
      // Prospect-specific
      offers,
      anchor,
      totalOpportunityValue,
      highProbCount,
      // SR-sourced data, same as clients
      triggers: triggers.slice(0, 30),
      media: media.slice(0, 20),
      peersRanking,
      crossDirectorship: crossDirectorship.slice(0, 10),
      legalOverview,
    });
    continue;
  }

  // ---- Client path: original processing below ----

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

  const defaultsSignals = readDefaultsSignals(cin);
  const guardrails = buildGuardrails(lr3y, defaultsSignals, sr.industry);

  // Synthesised narrative grounded in the client's data. In production this is
  // broker commentary captured in the CRM; here we generate from data signals
  // so the field is meaningful while remaining honestly synthetic.
  const narrativeParts = [];
  if (sr.industry && sr.city) {
    // Acronyms stay capitalised; everything else lower-cased
    const acronymIndustries = new Set(['BFSI', 'IT Services']);
    const ind = acronymIndustries.has(sr.industry) ? sr.industry : sr.industry.toLowerCase();
    const article = /^[aeiouAEIOU]/.test(ind) ? 'An' : 'A';
    narrativeParts.push(`${article} ${ind} account based in ${sr.city}.`);
  }
  if (sr.growth3Y >= 25) {
    narrativeParts.push(`Revenue has grown materially over the past three years, which is creating new exposures alongside the cross-sell opportunities.`);
  } else if (sr.growth3Y >= 10) {
    narrativeParts.push(`Revenue has grown steadily over the past three years.`);
  } else if (sr.growth3Y >= 0) {
    narrativeParts.push(`Revenue has remained broadly stable.`);
  } else {
    narrativeParts.push(`Revenue has softened over the past three years and warrants caution at renewal.`);
  }
  if (lr3y >= thresholds.loss_ratio_block_pct) {
    narrativeParts.push(`Loss experience is materially above appetite, and expansion proposals are blocked until the portfolio is remediated.`);
  } else if (lr3y >= thresholds.loss_ratio_warn_pct) {
    narrativeParts.push(`Loss experience sits close to the threshold and is being watched.`);
  } else if (lr3y < 40) {
    narrativeParts.push(`Loss experience is best-in-class for the segment.`);
  }
  if (defaultsSignals.environmental && defaultsSignals.environmental.status === 'fail') {
    narrativeParts.push(`Open environmental notices on the record require resolution before expansion is considered.`);
  }
  const narrative = narrativeParts.join(' ');

  // SR data (from Saverisk file)
  const triggers = readTriggers(cin);
  const media = readMedia(cin);
  const peersRanking = readPeersRanking(cin);
  const crossDirectorship = readCrossDirectorship(cin);
  const legalOverview = readLegalOverview(cin);

  // Evidence: synthesised from triggers + media + defaults
  const evidence = buildEvidence(cin);

  // Offers: generated from triggers via the trigger_mapping (with benchmark
  // ranges from Howden's placement history). Falls back to template-based
  // cross-sells for industry coverage gaps not surfaced by triggers.
  const offers = generateOffers(currentCoverages, triggers, sr, policiesByCin[cin] || [], premiumHistory);
  const anchor = computeClientAnchor(policiesByCin[cin] || []);

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
    anchor,
    premiumHistory,
    claimsHistory,
    runningPolicies: (policiesByCin[cin] || []).map((r) => ({
      product: String(r.product),
      sumInsured: Number(r.sum_insured),
      annualPremium: Number(r.annual_premium),
      renewalDate: String(r.renewal_date),
      insurer: String(r.insurer || ''),
    })),

    // SR-sourced data, surfaced alongside computed values.
    // For large companies (Vedanta) we cap the lists at sensible UI limits;
    // the full data remains in the source file.
    triggers: triggers.slice(0, 30),
    media: media.slice(0, 20),
    peersRanking,
    crossDirectorship: crossDirectorship.slice(0, 10),
    legalOverview,

    guardrails,
    evidence,
    policyRecommendations: { offer: offers, doNotOffer: [] },
    narrative,
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

// Build per-client and per-prospect snapshots for chat
const srSnapshots = {};
for (const c of clients) {
  srSnapshots[c.cin] = buildSnapshot(c.cin);
}
for (const p of prospects) {
  srSnapshots[p.cin] = buildSnapshot(p.cin);
}
const totalSnapshotRows = Object.values(srSnapshots).reduce(
  (sum, snap) => sum + Object.values(snap).reduce((s, rows) => s + rows.length, 0),
  0
);

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
    prospect_count: prospects.length,
    benchmark_count: benchmarkPlacements.length,
    snapshot_row_count: totalSnapshotRows,
  },
  brokers,
  clients,
  prospects,
  rules: {
    thresholds,
    weights,
    renewalWindows,
    guardrailRules: guardrailRuleRows,
    triggerMapping: triggerMappingRows,
    coverageTemplates,
  },
  benchmarkPlacements,
  srSnapshots,
};

writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2));
console.log(
  `[excelToJson] wrote ${OUT_PATH}\n  brokers: ${brokers.length}, clients: ${clients.length}, prospects: ${prospects.length}, benchmark: ${benchmarkPlacements.length}, snapshot rows: ${totalSnapshotRows}`
);
