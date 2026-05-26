# FormCraft — Production-Style Form Builder SaaS

A full-featured Typeform-style form builder built on a **Turborepo monorepo** with tRPC, Zod, Drizzle ORM, and Scalar API docs.

---

## 🚀 Demo

| | |
|---|---|
| **Live Demo** | https://formcraft-demo.up.railway.app *(see deploy section)* |
| **Demo Creator** | `creator@example.com` / `password123` |
| **Demo Admin** | `admin@example.com` / `password123` |
| **API Docs** | `http://localhost:8000/docs` (Scalar) |
| **OpenAPI JSON** | `http://localhost:8000/openapi.json` |

### Seeded Demo Forms
| Form | Responses | Visibility |
|------|-----------|------------|
| Anime Fan Survey 2024 | 45 | Public |
| Product Feedback — FormCraft Beta | 30 | Public |
| GameFest 2024 Tournament Registration | 60 | Public |

---

## ✨ Features

### 5 New Features Added (v2)

#### 1. 🔍 Form Preview Mode
Preview your form before publishing without saving any data. Available in two modes:
- **Multi-step (Typeform style)** — one field at a time with animated transitions
- **All fields** — traditional scrollable preview

Access via the **Preview** button in the form editor (dropdown selector for mode).

#### 2. 🌿 Conditional Logic Between Fields
Show or hide fields based on answers to previous questions.

Each field supports a **Show if** rule:
- Source field: any earlier field
- Operators: `equals`, `does not equal`, `contains`, `is empty`, `is not empty`
- For select fields: pick the option value from a dropdown
- Live preview in the editor shows human-readable summary

Conditional logic is evaluated in real time on the public form so hidden fields are skipped cleanly.

#### 3. 📱 QR Code Share
Every published form gets a **QR code** accessible from:
- Form editor header (QR icon)
- Dashboard form card (QR icon)

Features:
- Full-colour QR rendered with `qrcode.react`
- **Copy link** button with confirmation
- **Download QR as PNG** for print/social use
- Opens form URL directly

#### 4. 🪄 Multi-Step Form UI (Typeform-style)
The public form at `/forms/:slug` is now a **full Typeform experience**:
- Dark gradient design (slate + violet)
- Cover screen with form title, description, and "Start" CTA
- One question per screen with smooth transitions
- Progress bar at top
- Keyboard navigation: `Enter` to advance
- Back button to revise answers
- Per-step validation with inline error messages
- Email format validation
- Required-field enforcement before moving forward
- Completion time tracking sent with submission
- Beautiful success screen

Toggle between multi-step and classic (all fields) in form settings.

#### 5. ⏰ Response Limits & Expiry
Configure form closing conditions from the **Limits & Expiry** tab in the editor:

**Response Limit:**
- Set a maximum number of accepted responses
- Live counter shows `X / Y responses received`
- Enforced at both the tRPC `submit` route and the public form fetch
- Shows "Limit reached!" badge when hit

**Form Expiry:**
- Set a close date/time with a `datetime-local` picker
- Shows green "closes on DATE" confirmation when future
- Shows red "in the past — form is currently closed" warning
- Remove expiry with one click
- Enforced at form fetch: expired forms return `FORBIDDEN`

Both limits are shown in the status banner in the form editor and visible to the creator at a glance.

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

---

## 🗂️ Monorepo Structure

```
formcraft/
├── apps/
│   ├── api/                  # Express + tRPC backend (port 8000)
│   │   └── src/
│   │       ├── index.ts
│   │       ├── server.ts
│   │       └── seed/         # Demo data seeder
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
│       │               ├── edit/     # Editor with Preview + QR + Conditional Logic + Limits
│       │               ├── responses/
│       │               └── analytics/
│       ├── components/
│       │   └── forms/
│       │       ├── field-renderer.tsx          # Shared field input + conditional logic evaluator
│       │       ├── form-preview-modal.tsx       # Preview modal (multi-step + classic)
│       │       ├── qr-share-modal.tsx           # QR code share modal
│       │       └── conditional-logic-editor.tsx # Conditional rule builder UI
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
    └── types/                # Shared TypeScript types (includes maxResponses, closeAfterDate)
```

---

## ⚡ Quick Start (Local Dev)

### Prerequisites
- **Node.js** ≥ 18
- **pnpm** ≥ 9 (`npm install -g pnpm`)
- **Docker** (for PostgreSQL)

### 1. Clone & Install

```bash
git clone https://github.com/Ayush-Panda-design/FormBuilder.git
cd FormBuilder
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/formcraft
PORT=8000
NODE_ENV=development
BASE_URL=http://localhost:8000
APP_URL=http://localhost:3000
```

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/trpc
```

Optional:

```env
# Upstash Redis — distributed rate limiting
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Resend — email notifications
RESEND_API_KEY=re_xxx
EMAIL_FROM=FormCraft <noreply@formcraft.io>
```

### 3. Start Database

```bash
docker compose up -d
```

### 4. Push Schema & Seed Data

```bash
pnpm db:migrate   # push Drizzle schema
pnpm seed      # seed demo users, forms, responses
```

### 5. Run Dev Servers

```bash
pnpm dev
```

- **Web**: http://localhost:3000
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs

---

## 🔐 Authentication

JWT stored in `localStorage` as `formcraft_token`, sent as `Authorization: Bearer <token>` on every tRPC call.

```bash
# Sign in
curl -X POST http://localhost:8000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"creator@example.com","password":"password123"}'
```

---

## 📡 API Overview

Full docs at **http://localhost:8000/docs**

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
| POST | `/api/forms/:id/publish` | ✅ | Publish (public/unlisted) |
| POST | `/api/forms/:id/unpublish` | ✅ | Unpublish |
| POST | `/api/forms/:id/duplicate` | ✅ | Duplicate |

### Fields
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/forms/:formId/fields` | ✅ | Add field (with **conditionalLogic**) |
| PATCH | `/api/forms/:formId/fields/:fieldId` | ✅ | Update field |
| DELETE | `/api/forms/:formId/fields/:fieldId` | ✅ | Delete field |
| POST | `/api/forms/:formId/fields/reorder` | ✅ | Reorder |

### Responses (Public)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/responses/submit` | ❌ | Submit response (enforces limits/expiry) |
| GET  | `/api/responses` | ✅ | List responses (paginated) |
| GET  | `/api/responses/export/csv` | ✅ | Export CSV |

### Public
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/public/forms/:slug` | ❌ | Get form (checks expiry + limit) |
| GET | `/api/public/explore` | ❌ | Browse public forms |

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

## 🌿 Conditional Logic Reference

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

**Operators:**
| Operator | Description |
|----------|-------------|
| `equals` | Answer equals value |
| `not_equals` | Answer doesn't equal value |
| `contains` | Answer contains value (text) |
| `is_empty` | No answer given |
| `is_not_empty` | Any answer given |

---

## 👁️ Form Visibility

| Mode | Behaviour |
|------|-----------|
| `unpublished` | Draft, not accepting responses |
| `public` | Listed on `/explore`, anyone can fill |
| `unlisted` | Only via direct link `/forms/:slug` |

---

## ⏰ Limits & Expiry

| Setting | Field | Behaviour |
|---------|-------|-----------|
| Response limit | `maxResponses` (int) | Stops accepting after N submissions |
| Close date | `closeAfterDate` (datetime) | Returns 403 after this date/time |

Both are enforced at:
1. `GET /public/forms/:slug` — form fetch returns 403 to prevent even loading
2. `POST /responses/submit` — responses service rejects submissions

---

## 🛡️ Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `POST /responses/submit` | 10 / 15 min per IP |
| `POST /auth/sign-in` | 10 / 15 min per IP |
| `POST /auth/sign-up` | 5 / 15 min per IP |
| `/public/*` | 60 / min per IP |

Uses Upstash Redis when configured, falls back to in-memory Map.

---

## 🚀 Deployment

### Railway (recommended)
1. Push to GitHub
2. New Project → Deploy from GitHub
3. Add PostgreSQL service
4. Set env vars (`DATABASE_URL`, `PORT=8000`, `BASE_URL`, `APP_URL`)
5. Deploy `apps/api` and `apps/web` as separate services
6. Run `pnpm --filter api seed`

### Vercel (web) + Railway (api)
1. Deploy `apps/web` to Vercel, set root dir = `apps/web`
2. Add `NEXT_PUBLIC_API_URL=https://your-api.railway.app/trpc`
3. Deploy `apps/api` to Railway

### Docker Compose (self-hosted)
```bash
docker compose -f docker-compose.prod.yml up -d
```

---

## 🔧 Scripts

```bash
pnpm dev              # Start all apps
pnpm build            # Build all
pnpm db:migrate          # Push schema
pnpm db:migrate       # Run migrations
pnpm db:studio        # Drizzle Studio GUI
pnpm seed             # Seed demo data
pnpm lint             # Lint
pnpm check-types      # TypeScript check
```

---

## ✅ Feature Checklist

### Core
- [x] User auth (JWT, sign up/in/out)
- [x] Creator dashboard
- [x] Create / edit / delete / publish / unpublish forms
- [x] 9 field types with Zod validation
- [x] Required / optional field settings
- [x] Public form submission (no login)
- [x] Public forms on `/explore`
- [x] Unlisted forms (direct link only)
- [x] Response analytics per form
- [x] Email notifications (Resend / fallback)
- [x] Landing page + pricing page
- [x] Scalar API documentation
- [x] Rate limiting
- [x] Demo credentials + seeded data

### New in v2
- [x] **Form preview** (multi-step + classic, modal)
- [x] **Conditional logic** (show/hide fields based on answers)
- [x] **QR code sharing** (modal, copy link, download PNG)
- [x] **Multi-step Typeform-style UI** (dark theme, cover screen, keyboard nav, per-step validation)
- [x] **Response limits** (max count, enforced server-side)
- [x] **Form expiry** (close date/time, enforced server-side)

### Bonus
- [x] CSV export
- [x] Recharts analytics dashboards
- [x] Form duplication + archiving
- [x] Custom auto-generated slugs
- [x] Explore page with search + pagination
- [x] Progress bar in public form
- [x] Completion time tracking
- [x] QR PNG download

---

## 🐛 Troubleshooting

**Database connection error** → `docker compose up -d` and check `DATABASE_URL`

**pnpm not found** → `npm install -g pnpm`

**"Form not available" on public form** → Form must be published and not expired/limited

**CORS errors** → Ensure `APP_URL` in `.env` matches your frontend URL exactly

**TypeScript errors after pulling** → `pnpm check-types` to identify, `pnpm db:migrate` if schema changed

---

## 📄 License

MIT — build something awesome.

---

Built with ❤️ for the FormCraft Hackathon · v2 with Conditional Logic, Preview, QR Sharing, Multi-step UI & Response Limits.
#   F o r m C r a f t  
 #   E d i n F o r m 2  
 #   E d i n F o r m 4  
 #   E d i n F o r m 5  
 #   E d i n F o r m 9  
 #   E d i n F o r m 1 1  
 