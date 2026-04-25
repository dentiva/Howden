# Deploy guide — Howden Sales Intelligence Engine

## First-time deploy to Railway

1. Unzip into a folder, e.g. `howden-sales-intelligence/`
2. Initialise Git and push to a new repo:
   ```bash
   cd howden-sales-intelligence
   git init
   git add -A
   git commit -m "Howden Sales Intelligence PoC"
   git branch -M main
   git remote add origin git@github.com:YOUR-ORG/howden-sales-intelligence.git
   git push -u origin main
   ```
3. On railway.app: New Project → Deploy from GitHub repo → pick the repo
4. In the service settings → Variables, set:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
   - (optional) `CLAUDE_MODEL` = override the default `claude-sonnet-4-5`
5. Railway auto-runs `npm install` → `npm run build` → `npm start`
6. Generate a public domain in Networking → Generate Domain
7. Smoke test: hit `/api/health` and confirm `hasApiKey: true`

---

## Updating an already-deployed Railway service

The single biggest issue you'll hit: **stale bundle cache**. Railway sometimes
serves the previous build even after a successful redeploy. Browser caching
makes it worse. Here is the routine that always works.

### Step 1 — Replace the project folder cleanly

Don't try to merge file by file. Replace the whole folder:

```bash
# In your existing repo
cd howden-sales-intelligence
rm -rf src data scripts server.js package.json README.md \
       index.html vite.config.js tailwind.config.js postcss.config.js \
       railway.json CHANGES.md DEPLOY.md
```

Then unzip the new build over the same folder. The `.git/` folder stays, so
your repo history is preserved.

### Step 2 — Commit and push

```bash
git add -A
git status   # should show many modifications/additions
git commit -m "Sync to latest build"
git push
```

### Step 3 — Force a Railway rebuild

Railway should pick up the push automatically. If you don't see a new
deployment kick off within a minute, force one:

```bash
git commit --allow-empty -m "Force rebuild"
git push
```

### Step 4 — Watch the build log

In Railway dashboard → your service → Deployments tab → click the latest
deployment → Build Logs. Look for these two lines:

```
[excelToJson] Built 11 client records
[excelToJson] wrote .../src/clientData.json
  brokers: 3, clients: 11, prospects: 5, benchmark: 2086, snapshot rows: 2227
```

If you see `prospects: 5, clients: 11` your build used the right data.
If you see different numbers (`prospects: 0` or `clients: 5`) the source
files Railway built from are stale — see "Repo files vs zip files" below.

### Step 5 — Hard-refresh the browser

After deployment succeeds, browsers will still serve the cached old bundle.
Bypass the cache:

- **Mac**: `Cmd + Shift + R`
- **Windows**: `Ctrl + Shift + F5`

Or open in an Incognito / Private window.

### Step 6 — Confirm the right build is live

You're on the latest build if the login page shows **four cards** (Priya,
Rahul, Aarti, Prospects) and Aarti's tile shows "11 clients / ₹44.81 Cr".

If you see only three cards or Aarti at zero, the bundle is older than
the current build. Re-run Step 3.

---

## Repo files vs zip files

If your build log shows fewer clients/prospects than expected, your repo
has stale `data/` files even though `src/App.jsx` is new. The build
converter reads source spreadsheets from `data/` at build time:

```
data/master.xlsx           — broker and client roster (must list 11 clients + 5 prospects)
data/policies.xlsx         — running policies, benchmark placements (~2086 rows)
data/rules.xlsx            — guardrails, scoring weights, thresholds
data/clients/{CIN}.xlsx    — 16 per-client Saverisk files (11 clients + 5 prospects)
```

To check what's in your repo's `data/` folder:

```bash
ls data/
# expect: master.xlsx, policies.xlsx, rules.xlsx, clients/, .gitkeep
ls data/clients/ | wc -l
# expect: 16
```

If those are wrong, the zip's `data/` folder is the source of truth.
Replace the entire `data/` directory.

---

## Required environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | — | Your Anthropic API key. Without this, chat and advisor return 500s but the rest of the app works. |
| `CLAUDE_MODEL` | No | `claude-sonnet-4-5` | Override the model used by both the advisor and the per-company chat. |
| `PORT` | No | Railway sets this | Don't override on Railway. Locally, defaults to 3000. |

---

## Local development

```bash
npm install
npm run dev          # frontend on Vite dev server
npm run server       # Express server on :3000
```

For end-to-end local testing of the chat flow, you need the API key set:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm run build && npm start
```

---

## Troubleshooting

**Symptom:** Build fails with "Cannot find package 'xlsx'"
**Cause:** `npm install` was run with `--production` or `--omit=dev`.
The xlsx package is in devDependencies because it's only needed at build time.
**Fix:** Re-install without those flags: `npm install`.

**Symptom:** App loads but chat returns 500s
**Cause:** `ANTHROPIC_API_KEY` not set or invalid.
**Fix:** Check `/api/health` — `hasApiKey` should be `true`.

**Symptom:** App loads but every detail page is blank or shows zeros
**Cause:** `src/clientData.json` wasn't generated. The `prebuild` script in
package.json runs `node scripts/excelToJson.mjs` which creates this file.
**Fix:** Confirm `package.json` has the `prebuild` script. Run
`node scripts/excelToJson.mjs` manually and check it produces output.

**Symptom:** Bundle takes 5+ seconds to first paint
**Cause:** The 1.3 MB JSON dataset is inlined into the JavaScript bundle
(known PoC limitation — flagged in the COO review). For demo purposes
this is fine. For pilot, the dataset should be fetched per-client from a
server endpoint gated by RM access.
