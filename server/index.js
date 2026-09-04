// Backend for the ZIP-code weather lookup demo.
//
// The frontend calls this server; this server calls OpenWeatherMap. The API key is read
// from process.env only and never leaves this file — not in a response, not in an error
// message, not in a log line.

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import dotenv from 'dotenv';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env lives at the repo root, one level up from server/.
dotenv.config({ path: path.join(__dirname, '..', '.env'), quiet: true });

const API_KEY = process.env.OPENWEATHER_API_KEY;
const PORT = process.env.PORT || 3001;
const UPSTREAM_TIMEOUT_MS = 8000;

// Log the variable name, never the value.
if (!API_KEY) {
  console.error('OPENWEATHER_API_KEY is not set');
  process.exit(1);
}

// The only three error strings this server ever returns. Upstream detail never gets out.
const ERRORS = {
  badZip: 'Enter a valid 5-digit US ZIP code.',
  notFound: 'No weather found for that ZIP.',
  upstream: 'Weather service unavailable. Please try again.',
};

const app = express();

app.get('/api/weather', async (req, res) => {
  const zip = typeof req.query.zip === 'string' ? req.query.zip.trim() : '';

  if (!/^\d{5}$/.test(zip)) {
    return res.status(400).json({ error: ERRORS.badZip });
  }

  const url = new URL('https://api.openweathermap.org/data/2.5/weather');
  url.searchParams.set('zip', `${zip},US`);
  url.searchParams.set('units', 'imperial');
  url.searchParams.set('appid', API_KEY);

  let upstream;
  try {
    upstream = await fetch(url, { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) });
  } catch {
    // Unreachable or timed out. Do not log the error object — the URL carries the key.
    console.error(`weather lookup failed for zip ${zip}: upstream unreachable`);
    return res.status(502).json({ error: ERRORS.upstream });
  }

  if (upstream.status === 404) {
    return res.status(404).json({ error: ERRORS.notFound });
  }

  if (!upstream.ok) {
    console.error(`weather lookup failed for zip ${zip}: upstream status ${upstream.status}`);
    return res.status(502).json({ error: ERRORS.upstream });
  }

  let data;
  try {
    data = await upstream.json();
  } catch {
    console.error(`weather lookup failed for zip ${zip}: upstream returned non-JSON`);
    return res.status(502).json({ error: ERRORS.upstream });
  }

  const city = data?.name;
  const tempF = data?.main?.temp;
  const conditions = data?.weather?.[0]?.description;

  if (typeof city !== 'string' || typeof tempF !== 'number' || typeof conditions !== 'string') {
    console.error(`weather lookup failed for zip ${zip}: upstream payload missing fields`);
    return res.status(502).json({ error: ERRORS.upstream });
  }

  return res.status(200).json({ zip, city, tempF, conditions });
});

// Anything else under /api gets the same one-shape error, so the frontend never has to
// parse an HTML 404 page.
app.use('/api', (_req, res) => {
  res.status(404).json({ error: ERRORS.notFound });
});

app.listen(PORT, () => {
  console.log(`weather server listening on http://localhost:${PORT}`);
});
