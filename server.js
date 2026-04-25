import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.warn('[server] ANTHROPIC_API_KEY is not set. The advisor endpoint will return 500 until it is configured.');
}

// Single Anthropic client reused across requests. Construction is cheap but
// repeating it per request creates needless garbage and confuses connection
// reuse if the SDK ever pools internally.
const anthropic = API_KEY ? new Anthropic({ apiKey: API_KEY }) : null;

const app = express();
// 2 MB ceiling on inbound JSON. The Saverisk chat endpoint sends a system
// prompt containing 1–4 retrieved sheet snapshots; Vedanta's Triggers alone
// can come close to 200 KB. 2 MB gives headroom without inviting abuse.
app.use(express.json({ limit: '2mb' }));

/* -------- API: Claude advisor proxy -------- */
app.post('/api/claude', async (req, res) => {
  if (!anthropic) {
    return res.status(500).json({
      error: 'ANTHROPIC_API_KEY is not configured on the server. Set it in the Railway service variables.',
    });
  }

  try {
    const { model, max_tokens, system, messages } = req.body || {};
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages is required and must be an array' });
    }

    const response = await anthropic.messages.create({
      model: model || process.env.CLAUDE_MODEL || 'claude-sonnet-4-5',
      max_tokens: max_tokens || 1000,
      system: system || undefined,
      messages,
    });

    res.json(response);
  } catch (err) {
    console.error('[api/claude] error:', err?.message || err);
    res.status(500).json({
      error: err?.message || 'Upstream Anthropic call failed',
      type: err?.type || 'internal_error',
    });
  }
});

/* -------- health check for Railway -------- */
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    hasApiKey: Boolean(API_KEY),
    time: new Date().toISOString(),
  });
});

/* -------- static: serve the Vite build -------- */
const dist = path.join(__dirname, 'dist');
app.use(express.static(dist));

// Serve the raw data directory so the About page can offer download links to
// the synthetic Excel files (master.xlsx, policies.xlsx, rules.xlsx, plus the
// per-client Saverisk files in data/clients/). The directory ships in the
// repository under data/.
const dataDir = path.join(__dirname, 'data');
app.use('/data', express.static(dataDir));

// SPA fallback: any non-API route returns index.html
app.get(/^(?!\/api\/).*/, (_req, res) => {
  res.sendFile(path.join(dist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[server] Howden Sales Intelligence listening on port ${PORT}`);
});
