# Howden Sales Intelligence Engine

Sales Intelligence engine built by Altius Soft for Howden relationship managers in India. Proof of concept.

This is a single repository with a React frontend and an Express backend. The backend proxies calls to the underlying language model so that the API key is never exposed in the browser.

## What is inside

- `src/` — React application (single file `App.jsx` plus a small entry point)
- `server.js` — Express server that serves the built frontend and exposes `/api/claude`
- `data/master.xlsx` — Brokers and the client roster (CIN, broker assignments)
- `data/policies.xlsx` — Howden's internal policy data (running policies, coverages, premium history, claims history, benchmark placements). Synthetic for the proof of concept; in production replaced by a connector to the policy administration system.
- `data/rules.xlsx` — Configuration owned by the Super Admin role. Contains thresholds, scoring weights, renewal windows, guardrail rule definitions, trigger-to-product mappings, and coverage templates per industry.
- `data/clients/{CIN}.xlsx` — Per-client intelligence files in the Saverisk format. One file per client, named with the client's CIN. Holds generic information (industry, sector, financials, directors, peer rankings, triggers, media, legal cases). Two real Saverisk reports for Suez India and Vedanta Limited are included as anchor examples; the other nine files are synthetic stubs that follow the canonical 22-sheet schema.
- `scripts/excelToJson.mjs` — Build script that reads all of the above, joins by CIN, and emits `src/clientData.json` for the React app to import. Runs automatically before `npm run build` and `npm run dev` via the `prebuild` and `predev` hooks in `package.json`.
- `index.html` — Vite entry HTML
- `vite.config.js` — Vite config with a dev proxy to the Express server
- `railway.json` — Railway build and deploy configuration
- `.env.example` — Template for the required environment variables

## Editing the data

The data lives across three top-level Excel files plus one file per client. To change any number or piece of text shown in the application, edit the relevant cell in the relevant file and rebuild. No code change is required.

### `data/master.xlsx` — broker roster

| Sheet | Contents |
| --- | --- |
| `brokers` | Relationship manager personas. Includes a `role` column distinguishing `broker` from `super` (Super Admin) |
| `clients` | One row per client. Columns: `cin`, `short_id`, `display_name`, `broker_id` (primary RM), `secondary_broker_id` (optional secondary RM) |

### `data/policies.xlsx` — Howden's internal policy data

| Sheet | Contents |
| --- | --- |
| `running_policies` | One row per policy per client. Columns: `cin`, `product`, `sum_insured`, `annual_premium`, `renewal_date`, `insurer` |
| `coverages` | Per-client coverage list, used for gap analysis |
| `premium_history` | Year-by-year premium per client (Crore Rupees) |
| `claims_history` | Year-by-year claim count and incurred amount per client |
| `benchmark_placements` | Synthetic Howden book of placements outside the demo client set, used to compute benchmark ranges for cross-sell, upsell, and renewal-uplift suggestions |

### `data/rules.xlsx` — Super Admin owned configuration

| Sheet | Contents |
| --- | --- |
| `thresholds` | Numeric thresholds (loss ratio block, high opportunity score, claims trend band, etc.) |
| `scoring_weights` | Attractiveness score component weights |
| `renewal_windows` | Days defining urgent and attention renewal windows |
| `guardrail_rules` | Definitions of guardrail rules. Each row has a rule ID, a human-readable rule, an evaluator, and a flag indicating whether failure blocks expansion |
| `trigger_mapping` | Maps Saverisk trigger categories and types onto suggested products and actions |
| `coverage_templates` | Per-industry expected coverage list, used to compute gaps |

### `data/clients/{CIN}.xlsx` — per-client Saverisk files

Each client has its own Excel file in this folder. Filename is the client's CIN (e.g. `L13209RJ1965PLC002138.xlsx` for Vedanta). The file follows the canonical 22-sheet Saverisk schema, with sheets for Overview, Consolidated Summary, Standalone Summary, Current Directors, Defaults, Index of Charges, Peers, Peers Ranking, Media, Triggers, Legal Cases, and others.

The build script reads these files at build time and joins them with the policy and rule data by CIN. Adding a new client to the demo means adding one row to `data/master.xlsx` and dropping a new Saverisk file into `data/clients/`.

After editing any file, run `npm run data` to regenerate `src/clientData.json` without running a full build, or simply run `npm run build` which triggers the regeneration automatically.

## Deploying to Railway

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In Railway, create a new project and pick **Deploy from GitHub repo**. Select this repository.
3. Once the service is created, open the **Variables** tab and add:
   - `ANTHROPIC_API_KEY` — your Anthropic API key. This is required for the chat advisor to work.
4. Railway will build the service using Nixpacks. The build runs `npm install` and the `postinstall` script which runs `vite build` to produce the `dist` folder.
5. The service starts with `npm start`, which runs `node server.js`. Express serves the built frontend and exposes the API.
6. When the deploy finishes, open the generated Railway domain in a browser. Sign in as either broker and the advisor chat will work because the server holds the API key.

Health check: `GET /api/health` returns `{ ok: true, hasApiKey: true }` when the key is configured.

## Running locally

Requires Node 18 or later.

```bash
cp .env.example .env
# edit .env and set ANTHROPIC_API_KEY

npm install
npm run dev
```

`npm run dev` starts two processes:

- Vite on `http://localhost:5173` serving the frontend with hot reload
- Express on `http://localhost:3000` serving `/api/claude`

Vite proxies API calls to Express automatically. Open `http://localhost:5173` in your browser.

To run the production build locally:

```bash
npm run build
npm start
# then open http://localhost:3000
```

## What the application does

The application is a portfolio dashboard and conversational advisor for commercial insurance relationship managers. It demonstrates:

- An Attractiveness score for every client, computed at render time from a transparent six component formula that is documented on the About page
- A set of business guardrails, enforced in code, that decide whether an expansion pitch is permitted for a given client
- An explicit list of policies to offer and policies not to offer, with reasons attached to every item
- A dashboard panel that aggregates cross sell and upsell opportunities across the portfolio
- Role based access control between two broker personas, with complete audit logging
- A grounded conversational advisor that answers questions about a specific client, using the client data in the page as context
- A lead capture loop where a pitch generated in the chat can be saved as a customer relationship management lead with a back link to the conversation that produced it

All data inside the application is synthetic and lives in `data/clients.xlsx`. The client list has been written specifically for the demonstration.

## Security notes

- The Anthropic API key is held by the Express server only. It is never exposed in the browser and it is never bundled into the frontend build.
- The server does not persist any conversation data. Everything is held in the browser for the duration of a session.
- For production use, consider adding authentication in front of the application and adding rate limiting to the `/api/claude` endpoint.
