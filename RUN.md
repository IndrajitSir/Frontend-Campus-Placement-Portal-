# Frontend — Run Locally & Production

React 19 + Vite + Tailwind 4 + React Router 7. Served by **nginx** in production.

---

## 1. Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 20.x (LTS) | |
| npm | 9+ | |
| Docker | 24+ | Only for the containerized build |
| Backend | — | Must be running (see `Backend-Campus-Placement-Portal/RUN.md`) |

---

## 2. Local development (Vite dev server)

### 2.1 Install dependencies

```bash
cd Frontend-Campus-Placement-Portal-
npm install
```

### 2.2 Environment file

```bash
cp .env.example .env
```

Edit `.env`:

```dotenv
# Base URL the *browser* uses to reach the backend API.
# Default for local dev:
VITE_API_URL=http://localhost:6005
VITE_API_VERSION=2
```

### 2.3 Run

```bash
npm run dev
```

Open **http://localhost:5173** (Vite's default port). The backend's `FRONTEND_URL`/`CORS_ORIGIN` must be set to `http://localhost:5173`.

Other scripts:

```bash
npm run build      # production build → dist/
npm run preview    # serve the built dist/ locally (http://localhost:4173)
npm run lint       # ESLint
```

---

## 3. Production (Docker / nginx)

The frontend container builds the app with Vite and serves the static bundle with nginx (SPA fallback, gzip, immutable asset caching).

### 3.1 API keys needed BEFORE building the image

`VITE_API_URL` and `VITE_API_VERSION` are **baked into the bundle at build time** — they cannot be changed at runtime. Set them before `docker build` (or as build args):

| Variable | Required | Value |
| --- | --- | --- |
| `VITE_API_URL` | ✅ | Public backend URL the browser can reach, e.g. `https://api.your-domain.com` (or `http://localhost:6005` for a local test build). |
| `VITE_API_VERSION` | ◻️ | `2` (default, fine). |

> ⚠️ The browser must reach `VITE_API_URL` directly — it is **not** proxied by the frontend's nginx (the nginx config only serves static files and SPA routes). Also make sure the backend's `FRONTEND_URL`/`CORS_ORIGIN` is set to this frontend's public origin.

### 3.2 Build & run standalone

```bash
cd Frontend-Campus-Placement-Portal-
docker build \
  --build-arg VITE_API_URL=https://api.your-domain.com \
  --build-arg VITE_API_VERSION=2 \
  -t campusplace-frontend .
docker run -d -p 8080:80 --name campusplace-frontend campusplace-frontend
```

Open `http://localhost:8080`.

### 3.3 Deploying via the production stack (recommended)

Use the backend's `docker-compose.prod.yml` — it builds the frontend automatically from this folder and passes `VITE_API_URL` from `.env.production`:

```bash
cd Backend-Campus-Placement-Portal
cp env.production.example .env.production   # set VITE_API_URL to the public backend URL
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```
```bash
sudo docker compose -f docker-compose.prod.yml ps # Check the Status of the Services
sudo docker compose -f docker-compose.prod.yml logs -f # Stream the Logs
sudo docker compose -f docker-compose.prod.yml stats # To view live resource usage (CPU/Memory)
sudo docker compose -f docker-compose.prod.yml exec <service_name> sh # To open a terminal inside one of the running containers
sudo docker compose -f docker-compose.prod.yml down # To stop and remove the containers later
```

Frontend is served on `http://localhost:80` (override with `FRONTEND_PORT=8080`).

### 3.4 Deploying to Vercel / Netlify (alternative)

The project ships with `vercel.json` (SPA rewrite) — no Docker needed:

1. Import the repo in Vercel: framework **Vite**, build command `npm run build`, output `dist`.
2. Add environment variables in Project Settings → Environment Variables:
   - `VITE_API_URL` → `https://your-backend.onrender.com` (public backend URL)
   - `VITE_API_VERSION` → `2`
3. Deploy. The live site already has these set.

---

## 4. Environment variable reference

| Variable | Build-time? | Default | Purpose |
| --- | --- | --- | --- |
| `VITE_API_URL` | ✅ yes | `http://localhost:6005` | Base URL for all API calls (axios). |
| `VITE_API_VERSION` | ✅ yes | `2` | API version suffix. |
| `FRONTEND_PORT` | n/a (compose) | `80` in the backend prod stack / `8080` in this folder's standalone compose | Host port mapping for the nginx container. |

---

## 5. Troubleshooting

| Symptom | Likely cause / fix |
| --- | --- |
| API calls go to `localhost:6005` in production | `VITE_API_URL` was not set at build time — rebuild with the public URL. |
| Blank page in Docker but works in dev | Old build without env vars — rebuild with `--build-arg`. |
| CORS / auth-cookie errors | Backend `FRONTEND_URL` doesn't match this app's origin; or cookies blocked (frontend + backend must share a top-level domain or `sameSite=None`/HTTPS in prod). |
| `npm install` fails on `sharp`/`bcrypt` | Use Node 20 LTS; on Windows install the VS Build Tools or use WSL/Docker. |
