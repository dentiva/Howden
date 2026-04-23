# Howden Sales Intelligence Engine

Proof of concept for an AI powered sales intelligence assistant for Howden relationship managers in India.

This is a single repository with a React frontend and an Express backend. The backend proxies calls to the Anthropic API so that the API key is never exposed in the browser.

## What is inside

- `src/` — React application (single file `App.jsx` plus a small entry point)
- `server.js` — Express server that serves the built frontend and exposes `/api/claude`
- `index.html` — Vite entry HTML
- `vite.config.js` — Vite config with a dev proxy to the Express server
- `railway.json` — Railway build and deploy configuration
- `.env.example` — Template for the required environment variables

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

- An Attractiveness score and a Sales Friction score for every client, with the features that drove each score shown as contribution charts
- A set of business guardrails, enforced in code, that decide whether an expansion pitch is permitted for a given client
- An explicit list of policies to offer and policies not to offer, with reasons attached to every item
- A dashboard panel that aggregates cross sell and upsell opportunities across the portfolio
- An event signals panel for each client showing renewals, claims, regulatory notices, and other triggers
- Role based access control between two broker personas, with complete audit logging
- A grounded conversational advisor that uses the Claude API to answer questions about a specific client
- A lead capture loop where a pitch generated in the chat can be saved as a customer relationship management lead with a back link to the conversation that produced it

All data inside the application is synthetic. The client list has been written specifically for the demonstration.

## Security notes

- The Anthropic API key is held by the Express server only. It is never exposed in the browser and it is never bundled into the frontend build.
- The server does not persist any conversation data. Everything is held in the browser for the duration of a session.
- For production use, consider adding authentication in front of the application and adding rate limiting to the `/api/claude` endpoint.
