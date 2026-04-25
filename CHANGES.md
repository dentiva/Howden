# Changes log — Howden Sales Intelligence Engine

This file lists what's in the current build, in build order. Use it to confirm
your deployed version matches what you're testing against.

## Build identifier

This build was packaged on 25 April 2026 and includes everything below.

If you deploy this and the app shows fewer than four login tiles, or Aarti
shows zero clients, the bundle being served is older than this. Force a
clean rebuild — see DEPLOY.md.

---

## What's in this build

### Step 1 — Foundation (earlier)
- React + Vite frontend
- Express backend with `/api/claude` proxy and `/api/health` endpoint
- Excel-to-JSON converter (`scripts/excelToJson.mjs`) reads source spreadsheets
  at build time and emits `src/clientData.json`
- Login as Priya (5 clients) or Rahul (6 clients), portfolio-level Advisor chat

### Step 2 — Synthetic data and scoring
- 9 synthetic Indian client companies covering 9 industries
- Saverisk-format intelligence files for each client (22 sheets)
- Attractiveness score, loss ratio, claims trend computed at render time
- Coverage gap detection per industry
- Benchmark dataset (regenerated to 2,086 rows across 17 industries, 7-9
  products per industry, in the latest build)

### Step 3A-3D — Real Saverisk anchors and architecture
- Vedanta and Suez added as real Saverisk-anchored clients
- 4-file data architecture (master.xlsx, policies.xlsx, rules.xlsx,
  per-client Saverisk files)
- Triggers Timeline, Peer Rankings, Group Exposure panels on every
  client detail page
- Aarti Krishnan (Super Admin) login with operations dashboard view
- Secondary RM support (Vedanta and Suez each shared between Priya and Rahul)
- About page rewritten with SR / HB / AI badge taxonomy

### Step 3D — Renewal-uplift and growth-upsell offers
- Renewal-uplift offers fire when current premium <85% of benchmark median
  for renewals in 90-day window (14 such offers in current data)
- Revenue-growth-upsell offers fire when revenue grew but premium did not
  track it (5 such offers in current data)

### Step 3E — Prospects pillar
- 5 prospect companies (Keshav Motors, Surya Green, Ananta Healthcare,
  Ekam QuickCommerce, Dhruv Packaging)
- Prospects login as a fourth pillar
- Opportunity offers per prospect with peer-adoption probability
- Total opportunity ₹57.40 Cr across 5 prospects

### Step 3F — Per-company chat with citations
- Chat scoped to a single client/prospect
- Keyword-based sheet retrieval
- JSON output format with sheet+row+excerpt for every claim
- Three hard refusal categories (predictive / cross-client / Howden-internal)
  blocked before any model call

### Step 3G — Cleanup, anchor product, insurance-sector chat
**Code review and cleanup:**
- Centralised constants in converter (lookback, threshold, growth)
- `recentTriggersIn` helper extracted, `peerAdoptionPct` hoisted
- `generateOffers` uses `renewalWindows.attention_days` from rules.xlsx
- Diagnosed and fixed underlying benchmark dataset corruption
  (was 1 product per industry across 12 industries → now 7-9 per industry,
   2086 total rows)
- App.jsx unused props removed, useEffect deps audited
- server.js cleanup: Anthropic client hoisted to module scope, body limit
  raised 1MB → 2MB

**Polish:**
- Peer ranking duplicate ranks fixed in 14 synthetic files (each metric
  column now a unique permutation 1..N)
- `readPeersRanking` deduplicates focal client appearing twice and filters
  the actuals row in real Saverisk files (Vedanta now shows clean ranks)
- Industry-aware trigger comments (Acharya → "delivery centre", not
  "manufacturing site"; Kaveri → "research and bioprocessing facility";
  Meridian → "mill complex"; NovaTrade → "regional branch"; Ashoka →
  "fulfilment hub") — 14 comments fixed across 5 files
- About page chat section added explaining the three refusal classes
- Audit log labels prospects-mode events as `actor: 'Prospect mode'`

**Anchor product feature (CEO list item 4):**
- For clients: anchor = largest current line by annual premium, tie-break
  by renewing-soonest. Brand-coloured Anchor block in hero with target
  icon, AI tag, product, premium, renewal date, rationale. Anchor product
  also highlighted in the In-force coverage list with brand-colour chip
  and "ANCHOR" suffix.
- For prospects: probable anchor = highest probability × benchmark median
  premium (option (c) — expected value). Green-themed "Probable anchor"
  block in hero. Anchor offer card in opportunity offers panel gets a
  green left-edge ribbon and "PROBABLE ANCHOR" pill.

**Insurance-sector chat overhaul:**
- Chat keyword map expanded from ~80 to ~200 entries, including insurance
  shorthand (D&O, PI, BBB, IAR, GPA, sum insured, exposure, cyber posture,
  ESG, IRDAI, MCA, ROC, multi-site, sued, suing, pending case, fined, etc.)
- Chat system prompt rewritten with insurance-context primer:
  - Explicit "Howden is a broker NOT an insurer"
  - 12 signal-to-implication mappings (Capital Raised → D&O review,
    Expansion → IAR/Marine review, Cyber Incident → Cyber Liability, etc.)
  - Industry-specific framing examples
  - Partial-data path for when file partially answers
  - "What to avoid" section blocking insurer recommendations and premium
    quotes
  - Stricter currency rules
- Refusal patterns expanded from 3 → 6 categories: Personal info, Predictive,
  Cross-client, Howden-internal, Pricing/underwriting, Insurer/carrier.
  Pricing pattern requires a product noun. Predictive pattern narrowed to
  not catch legitimate analytical questions.
- Suggested chat starters reframed for broker workflow ("What in this file
  is materially relevant to insurance?" as the killer first question).
- Renewal-uplift offer reason text reframed from premium-uplift framing
  to coverage-adequacy framing (closes the COO fiduciary review flag).

**Stronger advisor pitch:**
- Advisor context expanded to include `anchor_product`, `running_policies`,
  `recent_triggers`, `peer_ranking`, `sector`, `state`, `listed`
- New "WHEN THE BROKER ASKS YOU TO DRAFT A PITCH" section in advisor system
  prompt enforces 5-part structure: Anchor → Why Now → What the Evidence
  Shows → What We Propose → The Ask
- 180-280 word band, banned marketing phrases listed
- Anchor-aware pitch starter (uses anchor product in the prompt text)
- Remediation pitch path when expansion is guardrail-blocked
- Lead capture records anchor product alongside pitch text
- Token budget bumped 1000 → 1400 to accommodate the structured pitch

**Final UI polish:**
- Chat output formatting fix: `AnswerWithCitations` now renders paragraph
  breaks (\n\n) properly. Was rendering everything as inline spans, which
  collapsed paragraph breaks into one blob.
- System prompt updated to encourage paragraph breaks for longer answers.
- Chat drawer width capped tighter (540px → 460px), softer shadow, lighter
  backdrop. Citation popover narrower and right-anchored.
- Prospects login card sage-tinted background and border, distinguishing
  it from the three brokerage role cards above.

---

## Test checklist after deploy

You're on the latest build if:

1. **Login page** shows **four cards**: Priya, Rahul, Aarti, Prospects
   (Prospects card sage-tinted)
2. **Aarti's tile** shows "Super Admin" chip, "All books", "11 clients",
   "₹44.81 Cr"
3. Open **Acharya** as Rahul → hero shows **Anchor: Group Health, ₹57.33
   Lakh, renews 2026-05-11**. In-force list highlights Group Health with a
   brand-colour chip.
4. Open **Surya Green** as Prospects → hero shows **Probable anchor:
   Industrial All Risk, 89% likely, ₹4.51 Cr**. Offer card has green ribbon.
5. Click "Ask about this prospect" on Surya Green → chat panel slides in
   from the right at ~460px wide. Ask "Any triggers in the last twelve
   months that affect cover requirements?" → answer comes back with proper
   paragraph breaks.
6. Chat refusal: ask "What rate should we quote?" → instant deterministic
   refusal, no API call.
7. Open the Advisor chat for Acharya, click the anchor-aware suggestion
   "Draft a renewal-conversation pitch for Acharya anchored on Group
   Health" → 5-part structured pitch in the response.

If any of these are missing, the deployed bundle is older than this build.
See DEPLOY.md.
