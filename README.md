# A render error while a server action is in flight crashes the app with React error #482

On `next@16.3.8` (latest stable), a component that throws during render while a server action is in flight never reaches `error.jsx`. The page freezes (no commits) for several seconds, then React throws error #482 ("An unknown Component is an async Client Component…") and Next shows "This page couldn't load". On `next@16.4.0-canary.58` the same app shows `error.jsx` immediately.

## Reproduce

```bash
npm install
npm run build && npm start        # http://localhost:4390
```

1. Open the page. The counter climbs: a server action fires every 100ms and takes ~200ms, so one is always in flight.
2. Click **Throw during render**.
3. **16.3.8:** the counter freezes; ~6s later the console shows React error #482 and the page is replaced by "This page couldn't load".
4. **Expected (and what canary.58 does):** "Caught by error.jsx: a render error" right away.

To compare: `npm install next@16.4.0-canary.58 && npm run build && npm start`.

## Why

The app router's `useActionQueue` reads its state with `use()` while an action is in flight, and nothing above `Router` is a Suspense boundary. When a render errors, React retries all pending lanes synchronously before committing the error boundary (`recoverFromConcurrentError`). That retry suspends at the shell on the in-flight action, and the React build bundled with 16.3.x (`19.3.0-canary-cbb046ab-20260731`) then leaves error recovery enabled, so the error boundary never commits. Each new server action re-renders, errors, retries and suspends again, until the shell-suspend guard (`shellSuspendCounter > 100`) throws #482 from `trackUsedThenable`.

This is react/react#37739 (merged 2026-10-02, a regression from react/react#36911). It reached canary through vercel/next.js#99600 (`16.4.0-canary.58`). No stable release carries it yet.

## Results

| build | after the throw |
| --- | --- |
| `next@16.3.8` (React `cbb046ab-20260731`) | freezes ~6s, then #482 and "This page couldn't load" (2/2 runs) |
| `next@16.4.0-canary.58` (React `278794d7-20261002`) | `error.jsx` renders immediately (2/2 runs) |
