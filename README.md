# multi-agent-session-demo

Throwaway app built **by** a live multi-agent Claude Code session, as a demo of the
[`multi-agent-session`](https://github.com/rustynations/multi-agent-session-communication)
skill.

Three agents — ARCHITECT, BACKEND, FRONTEND — coordinated entirely through
[issue #1](https://github.com/rustynations/multi-agent-session-demo/issues/1). A human
(Rusty) joined the same thread, ran the app locally, and approved the result. No agent
could see another's terminal; the issue comments were the only channel.

Private + kept for reference. Not deployed. The API key lives in a gitignored `.env`.

## What it does

Type a US ZIP code, get the current weather there — temperature, conditions, and city
name. A bad or empty ZIP returns a friendly message instead of a crash.

The OpenWeatherMap API key never reaches the browser. The React app calls the Express
server; only the server calls OpenWeatherMap.

## Run it

You need `OPENWEATHER_API_KEY` set in a `.env` file at the repo root.

Two terminals, because there are two `package.json` files:

```bash
# terminal 1 — backend on :3001
cd server && npm install && npm start

# terminal 2 — frontend on :5173
cd web && npm install && npm run dev
```

Then open <http://localhost:5173>.

The frontend proxies `/api` to the backend, so the browser only ever requests a relative
path. There is no host in the app code and no CORS configuration.

## Layout

```
├── server/    Express — the endpoint, ZIP validation, key hiding, upstream errors
└── web/       React (Vite) — ZIP input, result card, error state, light/dark themes
```

## The API contract

The two halves were built in parallel against this, agreed on the issue before either
side was written. They fit on the first try.

```
GET /api/weather?zip=90210
```

Success — `200`:

```json
{ "zip": "90210", "city": "Beverly Hills", "tempF": 72.5, "conditions": "clear sky" }
```

Every error uses one shape, so the frontend reads `body.error` and never branches on the
status code to find the message:

| Status | Cause | Message |
|---|---|---|
| `400` | `zip` missing, empty, or not exactly 5 digits | `Enter a valid 5-digit US ZIP code.` |
| `404` | OpenWeatherMap does not know that ZIP | `No weather found for that ZIP.` |
| `502` | Upstream unreachable, timed out, or returned an unusable payload | `Weather service unavailable. Please try again.` |

A wrong or not-yet-activated API key surfaces as a `502`. The browser is told nothing
about the cause; the server terminal logs `upstream status 401`.

## Notes worth keeping

Things this build turned up that generalise beyond a weather demo.

**A Node `fetch` error object carries the request URL, and the URL carries the API key.**
`server/index.js` uses a bare `catch {` on the upstream call for that reason — logging the
error would print the key. Error logs name the ZIP and a short reason, never the object.

**`req.query.zip` is an array when the parameter is repeated.** `?zip=1&zip=2` would throw
on `.trim()`, so the value is type-guarded before use.

**A theme toggle's `[data-theme]` rules must come after the `prefers-color-scheme` block.**
Same specificity means the later rule wins. Put the overrides first and a forced-light
choice works on a light-mode machine and silently does nothing on a dark-mode one — it
passes on the machine you built it on. `web/src/styles.css` orders them correctly *and*
adds `:not([data-theme='light'])` to the media query, so the fix does not depend on the
order surviving a future edit.

**Applying a stored theme in a `useEffect` flashes the wrong theme.** React mounts after
first paint. `web/index.html` reads `localStorage` in an inline script in `<head>` instead.

**`<meta name="color-scheme">` is fixed at parse time**, so it cannot follow a toggle. The
`color-scheme` CSS property inside each token block does, which keeps the native input and
the scrollbar in step with an override.

**Opacity breaks contrast audits that only read tokens.** The postmark measured fine as a
token and failed WCAG AA at 4.39:1 once `opacity: .82` was blended in. All ratios here are
measured on the rendered colour.

**A placeholder dark enough to pass AA reads as a filled field.** The ZIP placeholder was
removed rather than darkened, and replaced with a persistent hint wired up with
`aria-describedby` — which also stays visible once typing starts.
