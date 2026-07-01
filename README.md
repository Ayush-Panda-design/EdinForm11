# EdinForm — Production-Style Form Builder SaaS

> A full-featured Typeform-style form builder built on a **Turborepo monorepo** with tRPC, Zod, Drizzle ORM, and Scalar API docs.

---

## 🚀 Live Demo

| | |
|---|---|
| **🌐 Domain** | [https://edinform.in](https://edinform.in) |
| **Frontend (Vercel)** | [https://edin-form11-web-ashen.vercel.app](https://edin-form11-web-ashen.vercel.app) |
| **Backend (Render)** | [https://edinform11-2.onrender.com](https://edinform11-2.onrender.com) |
| **GitHub Repository** | [Ayush-Panda-design/EdinForm11](https://github.com/Ayush-Panda-design/EdinForm11) |
| **API Docs (Scalar)** | [https://edinform11-2.onrender.com/docs](https://edinform11-2.onrender.com/docs) |
| **OpenAPI JSON** | [https://edinform11-2.onrender.com/openapi.json](https://edinform11-2.onrender.com/openapi.json) |

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Creator** | `creator@example.com` | `password123` |
| **Admin** | `admin@example.com` | `password123` |

> The live demo forms were created directly through the EdinForm product itself — not injected via a seed script — demonstrating that the full form creation flow works end-to-end. The forms and their responses are visible immediately at [edinform.in/explore](https://edinform.in/explore) without any setup.

---

## ✨ Features

### Core Features

- User authentication (JWT-based sign up / sign in / sign out)
- Creator dashboard with full form management
- Create, edit, publish, unpublish, duplicate, and archive forms
- 9 field types with Zod validation
- Required / optional field settings per field
- Public form submission without login
- Public forms listed on `/explore`
- Unlisted forms accessible via direct link only
- Response management and analytics per form
- Email notifications (Resend integration with console fallback)
- Landing page and pricing page
- Scalar API documentation
- Rate limiting and basic spam protection
- Demo credentials with demo data

### Bonus Features (All Implemented ✅)

| Feature | Description |
|---|---|
| **Form Preview** | Preview before publishing in multi-step or classic mode |
| **Conditional Logic** | Show/hide fields based on answers to earlier questions |
| **QR Code Sharing** | QR modal with copy link + download PNG for every published form |
| **Multi-step Typeform UI** | Full Typeform-style experience: dark theme, cover screen, keyboard nav, per-step validation |
| **Response Limits** | Set max responses — enforced server-side at both fetch and submit |
| **Form Expiry** | Set close date/time — enforced server-side, returns 403 after expiry |
| **CSV Export** | Download all responses for any form as CSV |
| **Recharts Analytics** | Charts and analytics dashboards per form and creator-wide |
| **Custom Slugs** | Auto-generated, human-readable slugs for each form |
| **QR PNG Download** | Download QR code as PNG for print/social |
| **Explore Page** | Browse all public forms with search and pagination |
| **Form Duplication** | Clone any form instantly |
| **Form Archiving** | Archive forms you no longer need |
| **Progress Bar** | Progress indicator in multi-step public form |
| **Completion Time Tracking** | Time-to-submit sent with every response |

---

## 📦 Tech Stack

| Layer | Tech |
|-------|------|
| Monorepo | **Turborepo** + pnpm workspaces |
| Frontend | **Next.js 16** (App Router) + TailwindCSS v4 |
| Backend | **Express** + **tRPC** (type-safe RPC + REST) |
| Validation | **Zod** (everywhere) |
| Database ORM | **Drizzle ORM** + PostgreSQL |
| API Docs | **Scalar** (OpenAPI 3.1) |
| Auth | JWT bearer tokens |
| Rate Limiting | Upstash Redis (falls back to in-memory) |
| Email | Resend (falls back to console.log) |
| Charts | Recharts |
| QR Codes | qrcode.react |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Domain | edinform.in |

---

## 🗂️ Monorepo Structure

```
edinform/
├── apps/
│   ├── api/                  # Express + tRPC backend (port 8000)
│   │   └── src/
│   │       ├── index.ts
│   │       ├── server.ts
│   │       └── seed/         # API-level demo data for local development
│   │
│   └── web/                  # Next.js 16 frontend (port 3000)
│       ├── app/
│       │   ├── page.tsx              # Landing page
│       │   ├── pricing/              # Pricing page
│       │   ├── explore/              # Public forms explore
│       │   ├── forms/[slug]/         # Multi-step public form (no auth)
│       │   └── dashboard/
│       │       ├── page.tsx          # Forms list + QR buttons
│       │       ├── analytics/
│       │       ├── settings/
│       │       └── forms/
│       │           ├── new/
│       │           └── [id]/
│       │               ├── edit/     # Editor: Preview + QR + Conditional Logic + Limits
│       │               ├── responses/
│       │               └── analytics/
│       ├── components/
│       │   └── forms/
│       │       ├── field-renderer.tsx           # Shared field input + conditional logic evaluator
│       │       ├── form-preview-modal.tsx        # Preview modal (multi-step + classic)
│       │       ├── qr-share-modal.tsx            # QR code share modal
│       │       └── conditional-logic-editor.tsx  # Conditional rule builder UI
│       ├── providers/
│       │   ├── global.tsx
│       │   └── auth-provider.tsx
│       └── lib/
│           └── auth.ts
│
└── packages/
    ├── database/             # Drizzle schema + migrations
    ├── trpc/server/routes/   # forms, responses, analytics, public, auth
    ├── services/             # Business logic
    ├── validators/           # Zod schemas
    └── types/                # Shared TypeScript types (maxResponses, closeAfterDate, etc.)
```

---

## ⚡ Quick Start (Local Dev)

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 9  →  `npm install -g pnpm`
- **Docker** (for PostgreSQL)

### 1. Clone & Install

```bash
git clone https://github.com/Ayush-Panda-design/EdinForm11.git
cd EdinForm11
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/edinform
PORT=8000
NODE_ENV=development
BASE_URL=http://localhost:8000
APP_URL=http://localhost:3000
```

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/trpc
```

Optional integrations:

```env
# Upstash Redis — distributed rate limiting
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Resend — email notifications
RESEND_API_KEY=re_xxx
EMAIL_FROM=EdinForm <noreply@edinform.in>
```

### 3. Start Database

```bash
docker compose up -d
```

### 4. Push Schema & Seed Data

```bash
pnpm db:migrate   # push Drizzle schema
pnpm seed         # seed API-level demo data (users, sample forms, responses)
```

> **Note:** The seed script (`apps/api/src/seed/`) loads demo data for local development and API testing. The three themed forms visible on the live demo at [edinform.in/explore](https://edinform.in/explore) were created directly through the EdinForm UI, showcasing the real creator experience.

### 5. Run Dev Servers

```bash
pnpm dev
```

- **Web**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🎨 Demo Forms

Three themed sample forms were built live through the EdinForm creator dashboard — not injected via a seed script — proving that the full form-building flow works end-to-end. They are publicly visible at [edinform.in/explore](https://edinform.in/explore).

| # | Form | Theme |
|---|------|-------|
| 1 | **NPS — Europe Trip Overall** | Overall travel satisfaction and NPS rating |
| 2 | **FR France** | Country-specific travel experience and highlights |
| 3 | **GB Scotland** | Destination feedback — nature, landmarks, and culture |

All three forms are live, accepting responses, and have analytics populated from real submissions.

---

## 🔐 Authentication

JWT stored in `localStorage` as `edinform_token`, sent as `Authorization: Bearer <token>` on every tRPC call.

```bash
# Sign in
curl -X POST https://edinform11-2.onrender.com/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"creator@example.com","password":"password123"}'
```

---

## 📡 API Overview

Full interactive docs at **[https://edinform11-2.onrender.com/docs](https://edinform11-2.onrender.com/docs)**

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/sign-up` | ❌ | Register |
| POST | `/api/auth/sign-in` | ❌ | Login |
| POST | `/api/auth/sign-out` | ✅ | Logout |
| GET  | `/api/auth/me` | ✅ | Current user |

### Forms

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/forms` | ✅ | Create form |
| GET  | `/api/forms` | ✅ | List my forms |
| GET  | `/api/forms/:id` | ✅ | Get form + fields |
| PATCH | `/api/forms/:id` | ✅ | Update (title, settings, **maxResponses**, **closeAfterDate**) |
| DELETE | `/api/forms/:id` | ✅ | Delete |
| POST | `/api/forms/:id/publish` | ✅ | Publish (public / unlisted) |
| POST | `/api/forms/:id/unpublish` | ✅ | Unpublish |
| POST | `/api/forms/:id/duplicate` | ✅ | Duplicate |

### Fields

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/forms/:formId/fields` | ✅ | Add field (with **conditionalLogic**) |
| PATCH | `/api/forms/:formId/fields/:fieldId` | ✅ | Update field |
| DELETE | `/api/forms/:formId/fields/:fieldId` | ✅ | Delete field |
| POST | `/api/forms/:formId/fields/reorder` | ✅ | Reorder fields |

### Responses (Public)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/responses/submit` | ❌ | Submit response (enforces limits/expiry) |
| GET  | `/api/responses` | ✅ | List responses (paginated) |
| GET  | `/api/responses/export/csv` | ✅ | Export CSV |

### Public

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/public/forms/:slug` | ❌ | Get published form (checks expiry + limit) |
| GET | `/api/public/explore` | ❌ | Browse public forms with search + pagination |

### Analytics

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/analytics/form?formId=...` | ✅ | Per-form analytics |
| GET | `/api/analytics/dashboard` | ✅ | Creator-wide overview |

---

## 📋 Field Types

| Type | Description |
|------|-------------|
| `short_text` | Single-line text |
| `long_text` | Multi-line textarea |
| `email` | Email with format validation |
| `number` | Numeric input |
| `single_select` | Radio — pick one |
| `multi_select` | Checkboxes — pick many |
| `checkbox` | Yes/No toggle |
| `date` | Date picker |
| `rating` | 1–5 star rating |

---

## 🌿 Conditional Logic

Each field can have one `showIf` rule:

```json
{
  "conditionalLogic": {
    "showIf": {
      "fieldId": "uuid-of-source-field",
      "operator": "equals",
      "value": "yes"
    }
  }
}
```

| Operator | Description |
|----------|-------------|
| `equals` | Answer exactly matches value |
| `not_equals` | Answer does not match value |
| `contains` | Answer contains value (text fields) |
| `is_empty` | No answer given |
| `is_not_empty` | Any answer given |

Conditional logic is evaluated in real time during form filling. Hidden fields are skipped cleanly on submission.

---

## 👁️ Form Visibility

| Mode | Behaviour |
|------|-----------|
| `unpublished` | Draft — not accepting responses |
| `public` | Listed on `/explore` — anyone can fill |
| `unlisted` | Only accessible via direct link `/forms/:slug` |

---

## ⏰ Response Limits & Expiry

| Setting | Field | Enforcement |
|---------|-------|-------------|
| Response limit | `maxResponses` (int) | Blocks after N submissions at both fetch and submit |
| Close date | `closeAfterDate` (datetime) | Returns 403 after this date/time at both fetch and submit |

---

## 🛡️ Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `POST /responses/submit` | 10 / 15 min per IP |
| `POST /auth/sign-in` | 10 / 15 min per IP |
| `POST /auth/sign-up` | 5 / 15 min per IP |
| `/public/*` | 60 / min per IP |

Uses Upstash Redis when configured; falls back to in-memory Map automatically.

---

## 🚀 Deployment

### Current Deployment Stack

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [edin-form11-web-ashen.vercel.app](https://edin-form11-web-ashen.vercel.app) |
| Backend | Render | [edinform11-2.onrender.com](https://edinform11-2.onrender.com) |
| Domain | edinform.in | [https://edinform.in](https://edinform.in) |

### Deploy Your Own

#### Vercel (Frontend)

1. Push to GitHub
2. Import `apps/web` into Vercel, set root directory to `apps/web`
3. Add env var: `NEXT_PUBLIC_API_URL=https://your-api-url/trpc`

#### Render (Backend)

1. New Web Service → connect GitHub repo
2. Build command: `pnpm install && pnpm build`
3. Start command: `node apps/api/dist/index.js`
4. Add env vars: `DATABASE_URL`, `PORT=8000`, `BASE_URL`, `APP_URL`
5. Add a PostgreSQL database from the Render dashboard

#### Railway (Alternative)

1. New Project → Deploy from GitHub
2. Add PostgreSQL service
3. Set env vars and deploy `apps/api` and `apps/web` as separate services
4. Run `pnpm --filter api seed` after deploy

#### Docker Compose (Self-hosted)

```bash
docker compose -f docker-compose.prod.yml up -d
```

---

## 🔧 Scripts

```bash
pnpm dev              # Start all apps in development
pnpm build            # Build all apps
pnpm db:migrate       # Push Drizzle schema / run migrations
pnpm db:studio        # Open Drizzle Studio GUI
pnpm seed             # Seed API-level demo data locally
pnpm lint             # Lint all packages
pnpm check-types      # TypeScript type check across monorepo
```

---

## ✅ Feature Checklist

### Core (All Required Features)

- [x] User auth — JWT sign up / sign in / sign out
- [x] Creator dashboard
- [x] Create / edit / delete / publish / unpublish forms
- [x] 9 field types with Zod validation
- [x] Required / optional field configuration
- [x] Public form submission (no login required)
- [x] Public forms on `/explore` page
- [x] Unlisted forms (direct link only, hidden from explore)
- [x] Unpublished forms reject responses gracefully
- [x] Invalid / expired / limited form links handled with proper errors
- [x] Response analytics per form
- [x] Email notifications (Resend + console fallback)
- [x] Landing page + pricing page
- [x] Scalar API documentation
- [x] Rate limiting (Upstash Redis + in-memory fallback)
- [x] 3 themed demo forms created through the product UI
- [x] Demo credentials

### Bonus (All Implemented)

- [x] Form preview — multi-step + classic mode modal
- [x] Conditional logic — show/hide fields based on answers
- [x] QR code sharing — modal, copy link, download PNG
- [x] Multi-step Typeform-style UI — dark theme, cover screen, keyboard nav, per-step validation
- [x] Response limits — max count, enforced server-side
- [x] Form expiry — close date/time, enforced server-side
- [x] CSV export for responses
- [x] Recharts analytics dashboards
- [x] Custom auto-generated slugs
- [x] Explore page with search + pagination
- [x] Progress bar in public multi-step form
- [x] Completion time tracking sent with submissions
- [x] Form duplication
- [x] Form archiving

---

## 🐛 Troubleshooting

**Database connection error** → run `docker compose up -d` and verify `DATABASE_URL` in `.env`

**pnpm not found** → run `npm install -g pnpm`

**"Form not available" on public form** → form must be published and not expired or over its response limit

**CORS errors** → ensure `APP_URL` in `.env` matches your frontend URL exactly (no trailing slash)

**TypeScript errors after pulling** → run `pnpm check-types`; if schema changed, run `pnpm db:migrate`

**Backend cold start on Render** → free tier Render services sleep after inactivity; the first request may take ~30 seconds to wake up

---

## 📄 License

MIT — build something awesome.

---

Built with ❤️ for the EdinForm Hackathon · 2026v — featuring Conditional Logic, Form Preview, QR Sharing, Multi-step UI, Response Limits & Expiry.
