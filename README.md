<div align="center">

# 📝 EdinForm

### A Production-Style, Typeform-Inspired Form Builder SaaS

_Built on a Turborepo monorepo with tRPC, Zod, Drizzle ORM, and beautiful Scalar API docs._

[![Live Site](https://img.shields.io/badge/🌐_Live-edinform.in-6366F1?style=for-the-badge)](https://edinform.in)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel)](https://edin-form11-web-ashen.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render)](https://edinform11-2.onrender.com)
[![API Docs](https://img.shields.io/badge/API_Docs-Scalar-1E293B?style=for-the-badge)](https://edinform11-2.onrender.com/docs)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](#-license)

[Live Demo](https://edinform.in) · [Explore Forms](https://edinform.in/explore) · [API Reference](https://edinform11-2.onrender.com/docs) · [Report an Issue](https://github.com/Ayush-Panda-design/EdinForm11/issues)

</div>

<br>

---

## ✨ Overview

**EdinForm** is a full-featured form-builder platform — think _Typeform meets a real production SaaS_. It comes with a polished multi-step public form experience, a creator dashboard with real analytics, conditional logic, response limits, QR sharing, CSV export, and a complete type-safe API layer documented with Scalar.

Everything below is **live and working end-to-end** — not a mockup.

> 💡 **See it in action:** the demo forms on [edinform.in/explore](https://edinform.in/explore) were built _directly through the EdinForm UI itself_ — proving the entire creator flow works, from field creation to publishing to receiving real responses.

<br>

## 🚀 Live Demo

<div align="center">

| Resource                 | Link                                                                                         |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| 🌐 **Production Domain** | [edinform.in](https://edinform.in)                                                           |
| 🎨 **Frontend (Vercel)** | [edin-form11-web-ashen.vercel.app](https://edin-form11-web-ashen.vercel.app)                 |
| ⚙️ **Backend (Render)**  | [edinform11-2.onrender.com](https://edinform11-2.onrender.com)                               |
| 📚 **API Docs (Scalar)** | [edinform11-2.onrender.com/docs](https://edinform11-2.onrender.com/docs)                     |
| 🧾 **OpenAPI Spec**      | [edinform11-2.onrender.com/openapi.json](https://edinform11-2.onrender.com/openapi.json)     |
| 💻 **Source Code**       | [github.com/Ayush-Panda-design/EdinForm11](https://github.com/Ayush-Panda-design/EdinForm11) |

</div>

### 🔑 Demo Credentials

| Role           | Email                 | Password      |
| -------------- | --------------------- | ------------- |
| 👤 **Creator** | `creator@example.com` | `password123` |
| 🛡️ **Admin**   | `admin@example.com`   | `password123` |

> ⚠️ Note: Render's free tier sleeps after inactivity — the **first request may take ~30 seconds** to wake up. Thanks for your patience!

<br>

---

## 🎨 Demo Forms

Three themed sample forms, built live through the EdinForm creator dashboard — **not** injected via a seed script — publicly visible right now on [`/explore`](https://edinform.in/explore), each with real submissions and populated analytics.

<div align="center">

|  #   | Form                          | Theme                                              |
| :--: | ----------------------------- | -------------------------------------------------- |
| 🌍 1 | **NPS — Europe Trip Overall** | Overall travel satisfaction & NPS rating           |
| 🇫🇷 2 | **FR France**                 | Country-specific travel experience & highlights    |
| 🏴󠁧󠁢󠁳󠁣󠁴󠁿 3 | **GB Scotland**               | Destination feedback — nature, landmarks & culture |

</div>

<br>

---

## 🧩 Feature Set

### 🔷 Core Features

<table>
<tr>
<td width="50%" valign="top">

- 🔐 JWT-based auth (sign up / sign in / sign out)
- 📊 Creator dashboard with full form management
- ✏️ Create, edit, publish, unpublish, duplicate & archive forms
- 🧾 9 field types, all validated with Zod
- ⚙️ Required / optional field settings
- 🌐 Public submission — no login required

</td>
<td width="50%" valign="top">

- 🔎 Public forms listed on `/explore`
- 🔗 Unlisted forms via direct link only
- 📈 Response management & analytics per form
- 📧 Email notifications (Resend + console fallback)
- 🖥️ Landing page & pricing page
- 🛡️ Rate limiting & basic spam protection

</td>
</tr>
</table>

### 💎 Bonus Features — _All Implemented_

<div align="center">

| ✅  | Feature                      | Description                                                 |
| :-: | ---------------------------- | ----------------------------------------------------------- |
| 👁️  | **Form Preview**             | Preview before publishing — multi-step or classic mode      |
| 🌿  | **Conditional Logic**        | Show/hide fields based on earlier answers                   |
| 📱  | **QR Code Sharing**          | QR modal, copy link, download as PNG                        |
| 🎬  | **Multi-step Typeform UI**   | Dark theme, cover screen, keyboard nav, per-step validation |
| 🚦  | **Response Limits**          | Max responses, enforced server-side on fetch _and_ submit   |
| ⏰  | **Form Expiry**              | Close date/time, enforced server-side (403 after expiry)    |
| 📥  | **CSV Export**               | Download all responses for any form                         |
| 📊  | **Recharts Analytics**       | Per-form and creator-wide dashboards                        |
| 🔗  | **Custom Slugs**             | Auto-generated, human-readable slugs                        |
| 🖼️  | **QR PNG Download**          | Print- and social-ready QR codes                            |
| 🧭  | **Explore Page**             | Browse public forms — search + pagination                   |
| 📋  | **Form Duplication**         | Clone any form instantly                                    |
| 🗄️  | **Form Archiving**           | Archive forms you no longer need                            |
| 📶  | **Progress Bar**             | Live progress indicator in multi-step forms                 |
| ⏱️  | **Completion Time Tracking** | Time-to-submit sent with every response                     |

</div>

<br>

---

## 📦 Tech Stack

<div align="center">

| Layer                   | Technology                                |
| ----------------------- | ----------------------------------------- |
| 🏗️ **Monorepo**         | Turborepo + pnpm workspaces               |
| 🎨 **Frontend**         | Next.js 16 (App Router) + Tailwind CSS v4 |
| ⚙️ **Backend**          | Express + tRPC (type-safe RPC + REST)     |
| ✅ **Validation**       | Zod — everywhere                          |
| 🗄️ **Database ORM**     | Drizzle ORM + PostgreSQL                  |
| 📚 **API Docs**         | Scalar (OpenAPI 3.1)                      |
| 🔐 **Auth**             | JWT bearer tokens                         |
| 🚦 **Rate Limiting**    | Upstash Redis → in-memory fallback        |
| 📧 **Email**            | Resend → console.log fallback             |
| 📈 **Charts**           | Recharts                                  |
| 🔳 **QR Codes**         | qrcode.react                              |
| ☁️ **Frontend Hosting** | Vercel                                    |
| ☁️ **Backend Hosting**  | Render                                    |
| 🌐 **Domain**           | edinform.in                               |

</div>

<br>

---

## 🗂️ Monorepo Structure

```text
edinform/
├── apps/
│   ├── api/                        # Express + tRPC backend (port 8000)
│   │   └── src/
│   │       ├── index.ts
│   │       ├── server.ts
│   │       └── seed/                # API-level demo data for local dev
│   │
│   └── web/                        # Next.js 16 frontend (port 3000)
│       ├── app/
│       │   ├── page.tsx                    # Landing page
│       │   ├── pricing/                    # Pricing page
│       │   ├── explore/                    # Public forms explore
│       │   ├── forms/[slug]/               # Multi-step public form (no auth)
│       │   └── dashboard/
│       │       ├── page.tsx                # Forms list + QR buttons
│       │       ├── analytics/
│       │       ├── settings/
│       │       └── forms/
│       │           ├── new/
│       │           └── [id]/
│       │               ├── edit/           # Preview + QR + Logic + Limits
│       │               ├── responses/
│       │               └── analytics/
│       ├── components/
│       │   └── forms/
│       │       ├── field-renderer.tsx           # Field input + logic evaluator
│       │       ├── form-preview-modal.tsx       # Preview (multi-step + classic)
│       │       ├── qr-share-modal.tsx           # QR code share modal
│       │       └── conditional-logic-editor.tsx # Conditional rule builder UI
│       ├── providers/
│       │   ├── global.tsx
│       │   └── auth-provider.tsx
│       └── lib/
│           └── auth.ts
│
└── packages/
    ├── database/                   # Drizzle schema + migrations
    ├── trpc/server/routes/         # forms, responses, analytics, public, auth
    ├── services/                   # Business logic
    ├── validators/                 # Zod schemas
    └── types/                      # Shared types (maxResponses, closeAfterDate…)
```

<br>

---

## ⚡ Quick Start (Local Development)

### ✅ Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 9 → `npm install -g pnpm`
- **Docker** (for PostgreSQL)

### 1️⃣ Clone & Install

```bash
git clone https://github.com/Ayush-Panda-design/EdinForm11.git
cd EdinForm11
pnpm install
```

### 2️⃣ Environment Setup

```bash
cp .env.example .env
```

**`.env`**

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/edinform
PORT=8000
NODE_ENV=development
BASE_URL=http://localhost:8000
APP_URL=http://localhost:3000
```

**`apps/web/.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/trpc
```

**Optional integrations**

```env
# Upstash Redis — distributed rate limiting
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Resend — email notifications
RESEND_API_KEY=re_xxx
EMAIL_FROM=EdinForm <noreply@edinform.in>
```

### 3️⃣ Start the Database

```bash
docker compose up -d
```

### 4️⃣ Push Schema & Seed Data

```bash
pnpm db:migrate   # push Drizzle schema
pnpm seed         # seed API-level demo data (users, sample forms, responses)
```

> 📌 The seed script (`apps/api/src/seed/`) is for **local development and API testing only**. The three themed forms on the live demo were created through the real EdinForm UI.

### 5️⃣ Run the Dev Servers

```bash
pnpm dev
```

<div align="center">

| Service     | URL                        |
| ----------- | -------------------------- |
| 🖥️ Web      | http://localhost:3000      |
| ⚙️ API      | http://localhost:8000      |
| 📚 API Docs | http://localhost:8000/docs |

</div>

<br>

---

## 🔐 Authentication

JWT is stored client-side in `localStorage` as `edinform_token`, sent on every tRPC call as `Authorization: Bearer <token>`.

```bash
# Sign in
curl -X POST https://edinform11-2.onrender.com/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"creator@example.com","password":"password123"}'
```

<br>

---

## 📡 API Overview

📚 Full interactive docs live at **[edinform11-2.onrender.com/docs](https://edinform11-2.onrender.com/docs)**

<details>
<summary><b>🔑 Auth</b></summary>
<br>

| Method | Path                 | Auth | Description  |
| ------ | -------------------- | :--: | ------------ |
| `POST` | `/api/auth/sign-up`  |  ❌  | Register     |
| `POST` | `/api/auth/sign-in`  |  ❌  | Login        |
| `POST` | `/api/auth/sign-out` |  ✅  | Logout       |
| `GET`  | `/api/auth/me`       |  ✅  | Current user |

</details>

<details>
<summary><b>📝 Forms</b></summary>
<br>

| Method   | Path                       | Auth | Description                                                |
| -------- | -------------------------- | :--: | ---------------------------------------------------------- |
| `POST`   | `/api/forms`               |  ✅  | Create form                                                |
| `GET`    | `/api/forms`               |  ✅  | List my forms                                              |
| `GET`    | `/api/forms/:id`           |  ✅  | Get form + fields                                          |
| `PATCH`  | `/api/forms/:id`           |  ✅  | Update (title, settings, `maxResponses`, `closeAfterDate`) |
| `DELETE` | `/api/forms/:id`           |  ✅  | Delete                                                     |
| `POST`   | `/api/forms/:id/publish`   |  ✅  | Publish (public / unlisted)                                |
| `POST`   | `/api/forms/:id/unpublish` |  ✅  | Unpublish                                                  |
| `POST`   | `/api/forms/:id/duplicate` |  ✅  | Duplicate                                                  |

</details>

<details>
<summary><b>🧩 Fields</b></summary>
<br>

| Method   | Path                                 | Auth | Description                         |
| -------- | ------------------------------------ | :--: | ----------------------------------- |
| `POST`   | `/api/forms/:formId/fields`          |  ✅  | Add field (with `conditionalLogic`) |
| `PATCH`  | `/api/forms/:formId/fields/:fieldId` |  ✅  | Update field                        |
| `DELETE` | `/api/forms/:formId/fields/:fieldId` |  ✅  | Delete field                        |
| `POST`   | `/api/forms/:formId/fields/reorder`  |  ✅  | Reorder fields                      |

</details>

<details>
<summary><b>📨 Responses (Public)</b></summary>
<br>

| Method | Path                        | Auth | Description                              |
| ------ | --------------------------- | :--: | ---------------------------------------- |
| `POST` | `/api/responses/submit`     |  ❌  | Submit response (enforces limits/expiry) |
| `GET`  | `/api/responses`            |  ✅  | List responses (paginated)               |
| `GET`  | `/api/responses/export/csv` |  ✅  | Export CSV                               |

</details>

<details>
<summary><b>🌍 Public</b></summary>
<br>

| Method | Path                      | Auth | Description                                  |
| ------ | ------------------------- | :--: | -------------------------------------------- |
| `GET`  | `/api/public/forms/:slug` |  ❌  | Get published form (checks expiry + limit)   |
| `GET`  | `/api/public/explore`     |  ❌  | Browse public forms with search + pagination |

</details>

<details>
<summary><b>📊 Analytics</b></summary>
<br>

| Method | Path                             | Auth | Description           |
| ------ | -------------------------------- | :--: | --------------------- |
| `GET`  | `/api/analytics/form?formId=...` |  ✅  | Per-form analytics    |
| `GET`  | `/api/analytics/dashboard`       |  ✅  | Creator-wide overview |

</details>

<br>

---

## 📋 Field Types

<div align="center">

| Type            | Description                  |
| --------------- | ---------------------------- |
| `short_text`    | Single-line text             |
| `long_text`     | Multi-line textarea          |
| `email`         | Email with format validation |
| `number`        | Numeric input                |
| `single_select` | Radio — pick one             |
| `multi_select`  | Checkboxes — pick many       |
| `checkbox`      | Yes/No toggle                |
| `date`          | Date picker                  |
| `rating`        | 1–5 star rating              |

</div>

<br>

---

## 🌿 Conditional Logic

Each field can carry a single `showIf` rule, evaluated live as the user fills out the form:

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

| Operator       | Description                         |
| -------------- | ----------------------------------- |
| `equals`       | Answer exactly matches value        |
| `not_equals`   | Answer does not match value         |
| `contains`     | Answer contains value (text fields) |
| `is_empty`     | No answer given                     |
| `is_not_empty` | Any answer given                    |

> Hidden fields are skipped cleanly on submission — no stray data, no validation errors.

<br>

---

## 👁️ Form Visibility

| Mode             | Behaviour                                      |
| ---------------- | ---------------------------------------------- |
| 🚧 `unpublished` | Draft — not accepting responses                |
| 🌐 `public`      | Listed on `/explore` — anyone can fill         |
| 🔗 `unlisted`    | Only accessible via direct link `/forms/:slug` |

<br>

---

## ⏰ Response Limits & Expiry

| Setting           | Field                         | Enforcement                                                       |
| ----------------- | ----------------------------- | ----------------------------------------------------------------- |
| 🚦 Response limit | `maxResponses` _(int)_        | Blocks after N submissions — on both fetch **and** submit         |
| ⏳ Close date     | `closeAfterDate` _(datetime)_ | Returns `403` after this date/time — on both fetch **and** submit |

<br>

---

## 🛡️ Rate Limiting

| Endpoint                 | Limit              |
| ------------------------ | ------------------ |
| `POST /responses/submit` | 10 / 15 min per IP |
| `POST /auth/sign-in`     | 10 / 15 min per IP |
| `POST /auth/sign-up`     | 5 / 15 min per IP  |
| `/public/*`              | 60 / min per IP    |

Uses **Upstash Redis** when configured; falls back automatically to an **in-memory Map** otherwise.

<br>

---

## 🚀 Deployment

### 🌍 Current Stack

| Service     | Platform | URL                                                                          |
| ----------- | -------- | ---------------------------------------------------------------------------- |
| 🎨 Frontend | Vercel   | [edin-form11-web-ashen.vercel.app](https://edin-form11-web-ashen.vercel.app) |
| ⚙️ Backend  | Render   | [edinform11-2.onrender.com](https://edinform11-2.onrender.com)               |
| 🌐 Domain   | —        | [edinform.in](https://edinform.in)                                           |

### 🛠️ Deploy Your Own

<details>
<summary><b>▲ Vercel (Frontend)</b></summary>
<br>

1. Push to GitHub
2. Import `apps/web` into Vercel, set root directory to `apps/web`
3. Add env var: `NEXT_PUBLIC_API_URL=https://your-api-url/trpc`

</details>

<details>
<summary><b>🎨 Render (Backend)</b></summary>
<br>

1. New Web Service → connect GitHub repo
2. **Build command:** `pnpm install --no-frozen-lockfile --prod=false && pnpm --filter @repo/api build`
3. **Pre-Deploy command** _(Settings → Advanced)_: `pnpm --filter @repo/database db:migrate`
4. **Start command:** `node apps/api/dist/index.js`
5. Create a PostgreSQL database in the **same region** as the web service
6. Link the Postgres database from the Environment tab (or set `DATABASE_URL` to the **External Database URL** if in different regions)
7. Optional fallback: `DATABASE_URL_EXTERNAL` when using the Internal URL
8. Add env vars: `PORT=8000`, `BASE_URL`, `APP_URL`

> ⚠️ **Region mismatch:** Internal hostnames (`dpg-xxxxx-a`) only resolve when API and Postgres share a region. `ENOTFOUND dpg-xxxxx-a` errors mean you should use the External Database URL or move both services to the same region.

</details>

<details>
<summary><b>🚂 Railway (Alternative)</b></summary>
<br>

1. New Project → Deploy from GitHub
2. Add a PostgreSQL service
3. Set env vars and deploy `apps/api` and `apps/web` as separate services
4. Run `pnpm --filter api seed` after deploy

</details>

<details>
<summary><b>🐳 Docker Compose (Self-hosted)</b></summary>
<br>

```bash
docker compose -f docker-compose.prod.yml up -d
```

</details>

<br>

---

## 🔧 Scripts

| Command            | Description                           |
| ------------------ | ------------------------------------- |
| `pnpm dev`         | Start all apps in development         |
| `pnpm build`       | Build all apps                        |
| `pnpm db:migrate`  | Push Drizzle schema / run migrations  |
| `pnpm db:studio`   | Open Drizzle Studio GUI               |
| `pnpm seed`        | Seed API-level demo data locally      |
| `pnpm lint`        | Lint all packages                     |
| `pnpm check-types` | TypeScript type check across monorepo |

<br>

---

## ✅ Feature Checklist

<table>
<tr>
<td valign="top" width="50%">

**Core**

- [x] JWT auth — sign up / in / out
- [x] Creator dashboard
- [x] Create / edit / delete / publish / unpublish
- [x] 9 field types with Zod validation
- [x] Required / optional field config
- [x] Public submission — no login required
- [x] Public forms on `/explore`
- [x] Unlisted forms — direct link only
- [x] Unpublished forms reject responses gracefully
- [x] Expired / limited / invalid links handled properly
- [x] Response analytics per form
- [x] Email notifications (Resend + fallback)
- [x] Landing page + pricing page
- [x] Scalar API documentation
- [x] Rate limiting (Redis + in-memory fallback)
- [x] 3 themed demo forms built through the UI
- [x] Demo credentials

</td>
<td valign="top" width="50%">

**Bonus**

- [x] Form preview — multi-step + classic
- [x] Conditional logic
- [x] QR code sharing + PNG download
- [x] Multi-step Typeform-style UI
- [x] Response limits, server-enforced
- [x] Form expiry, server-enforced
- [x] CSV export
- [x] Recharts analytics dashboards
- [x] Custom auto-generated slugs
- [x] Explore page — search + pagination
- [x] Progress bar in public forms
- [x] Completion time tracking
- [x] Form duplication
- [x] Form archiving

</td>
</tr>
</table>

<br>

---

## 🐛 Troubleshooting

| Problem                                   | Fix                                                                              |
| ----------------------------------------- | -------------------------------------------------------------------------------- |
| **Database connection error**             | Run `docker compose up -d` and verify `DATABASE_URL` in `.env`                   |
| **`pnpm` not found**                      | Run `npm install -g pnpm`                                                        |
| **"Form not available" on a public form** | Form must be published, not expired, and under its response limit                |
| **CORS errors**                           | Ensure `APP_URL` in `.env` matches your frontend URL exactly (no trailing slash) |
| **TypeScript errors after pulling**       | Run `pnpm check-types`; if the schema changed, run `pnpm db:migrate`             |
| **Backend cold start on Render**          | Free-tier services sleep after inactivity — the first request may take ~30s      |

<br>

---

## 📄 License

Released under the **MIT License** — build something awesome. 🚀

<br>

<div align="center">

### Built with ❤️ for the EdinForm Hackathon · 2026

_Featuring Conditional Logic · Form Preview · QR Sharing · Multi-step UI · Response Limits & Expiry_

⭐ **If you like this project, consider giving it a star!** ⭐

</div>
