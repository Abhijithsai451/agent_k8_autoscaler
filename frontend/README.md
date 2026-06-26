# kron - control plane frontend

Next.js control plane for `k8s-agent-composio`.
It is a pure REST client of the FastAPI gateway, it holds no backend logic.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4 + shadcn/ui (Nova preset: Lucide icons, Geist font)
- shadcn components used: button, card, input, textarea, label, badge, separator, skeleton, sonner
- Native fetch wrapped in `src/lib/api.ts`, no data-fetching library

## Run it

```bash
cd frontend
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_GATEWAY_URL at the gateway
npm run dev                         # http://localhost:3000
```

The gateway must be running (default `http://localhost:8000`) and it already allows
CORS from `http://localhost:3000`. For real task results, the Temporal stack and the
worker also need to be up.

## the core loop

1. Sign in with any user id (dev identity, no password, just scopes your tasks).
2. On the dashboard, write a goal (optionally name a toolkit like `googlecalendar`) and
   Dispatch. You get a toast with the new workflow id and it appears in Your tasks.
3. You can leave. This is dispatch and forget.
4. Click a task to open it. You see the Temporal execution status, and once finished the
   result summary, the steps taken, and each turn with its tool calls. Toggle Raw JSON
   for the full payload. Refresh re-fetches on demand.

## connections and the needs-auth flow

**Reactive (works with the gateway today).** Dispatch with a toolkit you have not
connected. The gateway returns a 409, and instead of an error you get a Connect card
naming the app with a Connect button (opens the Composio Connect Link in a new tab) and
an "I have connected, retry" button that re-runs the same dispatch.

**Proactive (`/connections`).** Lists common toolkits to connect ahead of time. This
needs a gateway endpoint that does not exist yet:

will add it soon...

```
POST /connections/{toolkit}
Authorization: Bearer <token>
(no body)
-> 200 { "toolkit": "<slug>", "connect_url": "https://connect.composio.dev/..." }
```

It would reuse the existing `_connect_link` helper in
`apps/gateway/routes/preflight.py`.

## Notes on the gateway contract

- `GET /tasks/{id}` returns both `status` (agent-level, often null until the workflow
  answers) and `execution_status` (the reliable Temporal status). The UI keys its badge
  off `execution_status`.
- `result` is `{ status, summary, steps_taken, steps[] }`. There is no `needs_auth` in
  the result, the detail view just renders what is there.
