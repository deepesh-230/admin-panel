# Phase 0 — Existing Project Audit

**Project:** DivyaangDisha Backend & Admin Dashboard  
**Audit date:** 2026-08-14  
**Plan reference:** `docs/DivyaangDisha_Backend_Admin_Implementation_Plan.md`  
**Status:** COMPLETE  

---

## 1. Objective

Complete Phase 0 as defined in the implementation plan:

1. Audit the existing backend and Admin Dashboard.
2. Produce a module-by-module matrix (Existing / Partial / Missing / Needs Refactor / Action).
3. Produce a **Current → Required → Missing → Modify** checklist.
4. Do **not** rewrite working code without cause — preserve what works and extend.

---

## 2. Repository Layout

| Path | Role |
|------|------|
| `admin-panel/backend` | NestJS + Prisma + PostgreSQL API |
| `admin-panel/my-app` | React (Vite) Admin Dashboard |
| `my-app/docs/` | Plan + this audit |

**Out of current scope (per plan):** React Native mobile UI.

**Design experiments (not production):**

| Path | Notes |
|------|-------|
| `my-app/src/sample/` | PickBazar-style UI experiment |
| `my-app/src/sample2/` | AdminSuite-style UI experiment |

These must **not** be counted toward feature completion.

---

## 3. Backend Audit Summary

| Area | Finding |
|------|---------|
| Framework | NestJS 11 |
| Database | PostgreSQL |
| ORM | Prisma 6 |
| Models | `Enquiry`, `Listing` only (`prisma/schema.prisma`) |
| API prefix | None (not `/api/v1`) |
| Auth | Missing |
| Authorization / RBAC | Missing |
| Validation | Inline body types only; no DTO/class-validator layer |
| File uploads / images | Missing (Listing.image is a string URL field) |
| Google Maps | Missing |
| Chat | Missing |
| Notifications | Missing |
| Email / WhatsApp | Missing |
| CORS | Enabled globally in `main.ts` |
| Logging | Nest defaults only |
| Error handling | Nest defaults; no standardized error envelope |
| Tests | Scaffold only (`app.controller.spec.ts`, e2e scaffold); no module tests |
| Env | `DATABASE_URL`, `PORT` (default 3000) |

### Existing backend routes

| Method | Path | Notes |
|--------|------|-------|
| GET | `/` | Health/hello |
| GET | `/dashboard/stats` | Listings/enquiries counted; users/providers **hardcoded** |
| GET | `/listings` | Optional `?search=` |
| GET | `/listings/:id` | |
| POST | `/listings` | |
| PATCH | `/listings/:id` | |
| PATCH | `/listings/:id/status` | Boolean activate/deactivate |
| DELETE | `/listings/:id` | |
| GET | `/enquiries` | Optional `?search=` |
| GET | `/enquiries/:id` | |
| POST | `/enquiries` | |
| PATCH | `/enquiries/:id` | |
| DELETE | `/enquiries/:id` | |

### Backend models vs plan

Current `Listing` / `Enquiry` are flat admin-table shapes (string category/subCategory, etc.), **not** the relational marketplace / service-provider models from the plan (SELL/NEED, approval workflow, geo, provider admins, etc.).

**Preserve for now:** working CRUD endpoints and Prisma models used by the current admin screens.  
**Plan later:** introduce proper domain models; migrate or map listings/enquiries without breaking the current admin until replacements are ready.

---

## 4. Admin Dashboard Audit Summary

| Area | Finding |
|------|---------|
| Framework | React 19 + Vite + TypeScript + Tailwind 4 + React Router 7 |
| Auth | Missing (no login, tokens, protected routes) |
| Permissions / RBAC | Missing (header hardcodes “Administrator”) |
| API client | `src/utils/apiClient.ts` — no auth headers, no `/api/v1`, no envelope |
| State management | Local component state only |
| Working screens | Dashboard (partial), Listings list, Listing Enquiries |
| Nav stubs | Most sidebar items → “Page under construction” |
| Tables / forms | Present for Listings + Enquiries |
| Search | Client/query `search` supported |
| Pagination | Client-side `slice` / show-count only (not server pagination) |
| Settings | Missing |
| CMS screens | Missing (nav only) |
| Tests | None |

### Production routes that work

| Route | Page |
|-------|------|
| `/dashboard` | Stats cards (partial) |
| `/listings/list` | Listings CRUD + status toggle |
| `/enquiries/listing` | Enquiries CRUD |

### Sidebar items without pages

Category, Sub Category, uploads Listings, User, Product Enquiries, Faq, Useful links, Help & support, Pages, Blog, Job Alerts, Suggestions, Sales List.

Also missing from nav entirely vs plan: Settings, Banners, Push Notifications, Chat, Reports, Emergency Providers, States / State Admins.

---

## 5. Module-by-Module Matrix

Legend: **E** = Existing · **P** = Partial · **M** = Missing · **R** = Needs Refactor

| Module | Backend | Admin | Needs Refactor | PDF / Plan Requirement | Action |
|--------|---------|-------|----------------|------------------------|--------|
| Authentication | M | M | — | Register/login/refresh/logout/forgot/reset; `/api/v1/auth/*` | **Build in Phase 1** |
| RBAC / Roles | M | M | — | ADMIN, STATE_ADMIN, END_USER, SERVICE_PROVIDER_ADMIN | **Build in Phase 1** |
| Users | M | M | — | User CRUD, status, filters | **Build in Phase 3 / Admin Phase 15** |
| States | M | M | — | Master data states | **Build in Phase 2** |
| State Admins | M | M | — | State-scoped admins | **Build in Phase 2–3** |
| Categories | M | M (nav stub) | — | Category master data | **Build in Phase 2 / Admin Phase 16** |
| Subcategories | M | M (nav stub) | — | Subcategory master data | **Build in Phase 2 / Admin Phase 16** |
| Keywords | M | M | — | Keyword search for providers | **Build in Phase 2** |
| Service Providers | M | M | — | CRUD, approve/reject, location, provider admins | **Build in Phase 4–6** |
| Emergency Providers | M | M | — | Separate emergency module | **Build in Phase 7** |
| Listings (marketplace) | P | P | **Yes** | SELL/NEED, approval, geo, images | **Keep current CRUD; redesign model in Phase 8** |
| Upload Listings | M | M (nav stub) | — | Bulk import workflow | **Build in Phase 9** |
| Sales List | M | M (nav stub) | — | Dedicated sales admin view | **Build in Phase 17** |
| Enquiries | P | P | **Yes** | Types, assign, reply, routing, status workflow | **Extend current CRUD in Phase 10** |
| Enquiry Routing | M | M | — | Provider Admin → State Admin → Main Admin | **Build in Phase 6 / 10** |
| Chat | M | M | — | Conversations + messages | **Build in Phase 11** |
| Notifications | M | M | — | In-app / push / admin push | **Build in Phase 12** |
| CMS (FAQ, Pages, Blog, Jobs, Links) | M | M (nav stubs) | — | Content modules | **Build in Phase 18** |
| Suggestions / Help & Support | M | M | — | Support tickets / contact | **Build in Phase 18–19** |
| Dashboard | P | P | **Yes** | Real stats + clickable filtered navigation | **Harden in Phase 14** |
| Settings (general/social/banners) | M | M | — | Config + banners | **Build in Phase 20** |
| Reports | M | M | — | State-wise / activity reports | **Build in Phase 21** |
| API standards | M | M | **Yes** | `/api/v1`, success/error envelope, pagination | **Introduce from Phase 1 onward** |
| Security / Ops | P | M | — | Hashing, rate limit, logging, health, backups | **Phase 24** |
| Tests | P (scaffold) | M | — | Unit + integration + admin flows | **Phase 25 (ongoing)** |
| API documentation | M | — | — | OpenAPI / Swagger | **Phase 26** |

---

## 6. Current → Required → Missing → Modify Checklist

### 6.1 Authentication & RBAC

| Current | Required | Missing | Modify |
|---------|----------|---------|--------|
| No auth on backend or admin | JWT (or equivalent) auth, refresh, password reset, `/api/v1/auth/*` | Everything | Add Auth module; protect routes; add login screen; attach `Authorization` in `apiClient` |
| No roles/permissions | Backend-enforced RBAC for Admin / State Admin (+ mobile roles later) | Everything | Add Role/Permission models and guards |

### 6.2 Master Data

| Current | Required | Missing | Modify |
|---------|----------|---------|--------|
| Category/subCategory as free strings on Listing/Enquiry | Relational Category → Subcategory → Keywords; States | All master-data APIs + admin screens | Later migrate string fields to FKs; do not break current UI until dual-write/migration plan exists |

### 6.3 Users & State Admins

| Current | Required | Missing | Modify |
|---------|----------|---------|--------|
| Hardcoded dashboard user counts; header shows static “Administrator” | User CRUD, status, state/role filters; State Admin linkage | All APIs + `/user` page | Replace stub dashboard numbers with real counts once User model exists |

### 6.4 Service / Emergency Providers

| Current | Required | Missing | Modify |
|---------|----------|---------|--------|
| Nothing | Full provider lifecycle, approval, location, search, provider admins, emergency module | Everything | New modules; no existing code to preserve |

### 6.5 Listings / Marketplace / Sales

| Current | Required | Missing | Modify |
|---------|----------|---------|--------|
| Flat `Listing` CRUD + status boolean; admin list/form works | SELL/NEED types, approval, images, filters, Sales List, bulk upload | Domain model, approve/reject, upload, sales UI | **Preserve** current endpoints for admin until new listing domain is ready; then migrate schema carefully |

### 6.6 Enquiries

| Current | Required | Missing | Modify |
|---------|----------|---------|--------|
| Basic enquiry CRUD; Listing Enquiries admin page | Service vs product enquiries, assign, reply, status workflow, routing | Product enquiries UI, reply/assign APIs, routing service | **Extend** existing Enquiry model/APIs; keep current CRUD working |

### 6.7 Chat & Notifications

| Current | Required | Missing | Modify |
|---------|----------|---------|--------|
| Nothing | Conversations/messages; in-app + push + admin push | Everything | New modules |

### 6.8 CMS / Support / Settings

| Current | Required | Missing | Modify |
|---------|----------|---------|--------|
| Sidebar labels only | FAQ, Useful Links, Pages, Blog, Job Alerts, Suggestions, Help & Support, General/Social/Banners | Everything | New modules + admin pages for each nav item |

### 6.9 Dashboard

| Current | Required | Missing | Modify |
|---------|----------|---------|--------|
| Stats UI; backend mixes DB counts + hardcoded values; latest-7-days empty; cards not clickable; admin hardcodes localhost in one fetch | Real stats, 7-day metrics, click-through to filtered pages, use `VITE_API_URL` | Clickable filters, real user/provider stats, 7-day data | **Refactor** `DashboardService` + `Dashboard.tsx`; keep card layout |

### 6.10 API Platform

| Current | Required | Missing | Modify |
|---------|----------|---------|--------|
| Unversioned `/listings`, `/enquiries`, `/dashboard/stats`; raw JSON arrays/objects | `/api/v1`, standard success/error + pagination | Versioning, envelope, consistent errors | Introduce global prefix + interceptors; version-migrate admin client |

### 6.11 Production Readiness

| Current | Required | Missing | Modify |
|---------|----------|---------|--------|
| Basic Nest app, CORS on, Prisma, Jest scaffold | Security, logging, health, tests, Swagger, deployment runbooks | Most ops/security/docs | Build after core modules (Phases 24–26) |

---

## 7. What Must Be Preserved (Do Not Rewrite Blindly)

1. Working NestJS + Prisma + PostgreSQL foundation.
2. Working Listings CRUD + status toggle (backend + admin).
3. Working Enquiries CRUD (backend + admin Listing Enquiries).
4. Admin shell (Layout, Sidebar, Header, shared UI primitives).
5. Existing `VITE_API_URL` / env-based API base URL pattern (fix hardcoded localhost usage).

---

## 8. Highest-Priority Gaps Before Feature Build

1. **Phase 1** — Authentication + RBAC (blocks secure admin and all protected APIs).
2. **API conventions** — `/api/v1` + response envelope (start with Phase 1 so new APIs are correct).
3. **Phase 2** — Master data (states, categories, subcategories) — foundation for providers/listings.
4. Align Admin nav stubs with real modules as each phase lands.
5. Treat `sample/` and `sample2/` as disposable UI references only.

---

## 9. Open Requirements (Do Not Invent — Confirm Later)

Carried from plan §35; still unresolved:

1. Exact Admin vs State Admin permission matrix  
2. Exact Service Provider / Emergency Provider / Sales Listing fields  
3. Bulk upload file format and validation rules  
4. Exact chat UI/behavior  
5. Notification channels / push targeting rules  
6. Report metrics  
7. Image/file size limits  
8. Exact approval/rejection rules and status enums  
9. Search ranking / radius behavior  
10. Multi-language behavior if required  

Record decisions before locking those modules.

---

## 10. Phase 0 Exit Criteria

| Criterion | Status |
|-----------|--------|
| Backend audited (stack, models, APIs, gaps) | Done |
| Admin audited (routes, screens, API client, gaps) | Done |
| Module-by-module matrix produced | Done (§5) |
| Current → Required → Missing → Modify checklist produced | Done (§6) |
| Preserve-vs-replace guidance documented | Done (§7) |
| Next phase identified | **Phase 1 — Auth + RBAC** |

---

## 11. Phase 0 Conclusion

**Phase 0 is complete.**

The codebase is an early scaffold: NestJS/Prisma backend and React admin with a thin vertical slice (Listings + Enquiries + partial Dashboard). Core DivyaangDisha platform modules (auth, master data, providers, marketplace domain, chat, notifications, CMS, settings) are missing.

**Next step:** Begin **Phase 1 — Backend Foundation, Authentication and RBAC**, and update the admin to consume authenticated `/api/v1` APIs.

> **Update (2026-08-14):** Phase 1 is complete. See `docs/Phase1_Auth_RBAC.md`.

---

## 12. Document Control

| Field | Value |
|-------|-------|
| Created | 2026-08-14 |
| Owner | Engineering |
| Related plan | `DivyaangDisha_Backend_Admin_Implementation_Plan.md` |
| Supersedes | Informal chat audit (2026-08-14) |
