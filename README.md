# mindoh-web

Frontend for the Mindoh expense tracker, built with React + TypeScript + Vite + MUI.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** — build tool
- **MUI v5** — UI components
- **Axios** — API client
- **React Router v7** — client-side routing
- **date-fns** — date utilities
- **Cloudflare Pages / Workers** — deployment (with SPA routing)

## Project Structure

```
mindoh-web/
├── public/
│   └── favicon.svg
├── src/
│   ├── common/
│   │   ├── FilterChip.tsx
│   │   ├── FilterSection.tsx
│   │   └── SummaryCard.tsx
│   ├── components/
│   │   ├── Dashboard.tsx       Overview / summary cards
│   │   ├── Transactions.tsx    Paginated expense list with sort
│   │   ├── Summary.tsx         Grouped time-bucket table
│   │   ├── AddExpense.tsx
│   │   ├── Layout.tsx          App shell with sidebar nav
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── Settings.tsx
│   ├── constants/
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── services/
│   │   ├── api.ts              Axios instance — reads VITE_API_BASE_URL
│   │   ├── authService.ts
│   │   └── expenseService.ts
│   └── types/
│       └── api.ts
├── wrangler.jsonc              Cloudflare Worker config (SPA routing)
├── vite.config.ts
└── index.html
```

## Test Account

A pre-seeded account is available for testing against the production backend:

| Field | Value |
|---|---|
| Username | `test111` |
| Password | `nvmQF6F2scnn..u` |

## Local Development

```sh
git clone https://github.com/nhathuyle2002/mindoh-web
cd mindoh-web
npm install
npm run dev
```

App: http://localhost:5173  
Requires the backend running at http://localhost:8080.

## Environment Variables

| Variable | Description |
|---|---|
| VITE_API_BASE_URL | Backend API base URL |

Create `.env` for local dev:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

Production (`.env.production`):
```
VITE_API_BASE_URL=https://mindoh-service-production.up.railway.app/api
```

## Build

```sh
npm run build
# output → dist/
```

## Deployment (Cloudflare Pages / Workers)

The app is deployed as a Cloudflare Worker serving static assets.

- `wrangler.jsonc` sets `not_found_handling: "single-page-application"` so all routes fall through to `index.html` — no `_redirects` file needed
- Cloudflare auto-deploys on every push to `main` via the Git integration dashboard
- Custom domain: https://mindoh.wannadev.id.vn

No GitHub Actions workflow is required — Cloudflare handles the full build and deploy pipeline.
