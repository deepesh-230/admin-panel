# Admin Flow Completion Plan

**Product:** Divyaang Disha  
**Scope:** Backend + Admin web (`backend` + `my-app`)  
**Out of scope:** Mobile app wiring (do after admin is stable)  
**Date:** 2026-08-26 (updated)  
**Goal:** Make the admin flow real, reliable, and shippable.

---

## 1. One-line goal

Staff can log in, manage master data, approve providers, handle enquiries, and manage content — with data that sticks, and no broken links in the admin UI.

---

## 2. Current state (short)

| Area | Status |
|------|--------|
| Auth + RBAC | Built |
| Master data (states, categories, subcategories, keywords) | Built |
| Users + state admins | Built |
| Service providers (CRUD, approve, reject, assign admin, search) | Built |
| Enquiries + CMS + marketplace CRUD | Built |
| Dashboard stats | Built |
| Admin pages for most menus | Built |
| **Service provider admin login** | **Done** — scoped to assigned providers |
| **Volunteer login** | **Done** — `VOLUNTEER` role + volunteer account CRUD |
| **Provider admin accounts UI** | **Done** — `/provider-admins` |
| **Volunteer login accounts UI** | **Done** — `/volunteer-admins` |
| **Permission-based sidebar** | **Done** — menu hides by `user.permissions` |
| **Role-based login redirect** | **Done** — each role lands on its home page |
| Local DB connection | **Fixed** — local Postgres `admin_panel` |
| States page in sidebar/routes | **Done** |
| Email for password reset | **Missing** |
| Image upload | **Missing** |
| Enquiry status workflow | **Done** — NEW / CONTACTED / CLOSED |
| Enquiry scoping by role | **Done** — admin / state / provider / volunteer |
| Category Home vs Providers type | **Done** — `CARE` / `SERVICE` |

**Bottom line:** Phases A–C core tickets done. Next: Phase D (email + upload), then Phase E harden / QA.

---

## 3. Who can log in (roles)

| Role | Admin login? | Home page | Enquiries | Main access |
|------|--------------|-----------|-----------|-------------|
| **ADMIN** | Yes | Dashboard | Full — all kinds, all states | Everything |
| **STATE_ADMIN** | Yes | Dashboard | Scoped to their `stateId` | Almost all; cannot create state admins / states |
| **SERVICE_PROVIDER_ADMIN** | Yes | Service Provider → Listing | Only enquiries for assigned provider(s) | Only assigned providers; edit only |
| **VOLUNTEER** | Yes | Volunteer directory | User enquiries only (`kind=USER`) | Volunteer directory + user enquiries |
| **END_USER** | No | — | — | Mobile app only |

### Permission model (how it works)

- **Admin** gets every permission in seed. API also skips permission checks for `ADMIN`.
- **Other roles** get a fixed list in `backend/prisma/seed.ts`. Sidebar and routes use `user.permissions` from login.
- **API guards** are the real lock. Hidden menu items are UX only.

### Two volunteer concepts (do not mix up)

| Name | What it is | Who manages it |
|------|------------|----------------|
| **Volunteer directory** (`/volunteers`) | CMS contact records (name, phone, location) | Admin, state admin, volunteer |
| **Volunteer accounts** (`/volunteer-admins`) | Login users with `VOLUNTEER` role | Admin only (create/edit/delete) |

### Provider admin setup flow

1. Admin creates account under **Service Provider → Provider admins** (or Users with role `SERVICE_PROVIDER_ADMIN`).
2. Admin opens a provider listing → **Assign admin** to link that user.
3. Provider admin logs in → sees only assigned listings → can edit, not approve/reject/delete.

---

## 4. How we go

Work in **six short phases**. Do them in order. Do not start mobile until Phase F is done.

```text
A Fix foundation (DB + smoke)
    →
B Wire missing admin UI
    →
C Close product gaps (status, type, enquiry scope, cleanup)
    →
D Add support APIs (email, upload)
    →
E Harden (state lock, validation, multi-role QA)
    →
F Freeze admin + handoff notes
```

Each phase has:

- **Why**
- **Do**
- **Done when**
- **Test**

Keep changes small. Prefer fix over rewrite.

---

## 5. Phase A — Fix foundation

### Why

Nothing else matters if login cannot talk to Postgres.

### Do

1. Fix `DATABASE_URL` in `backend/.env` so Neon (or local Postgres) is reachable.
2. Run migrations (includes `VOLUNTEER` role):

   ```bash
   cd backend
   pnpm exec prisma migrate deploy
   pnpm exec prisma generate
   ```

3. Seed (updates role permissions): `pnpm seed`  
   Default admin: `admin@divyaangdisha.com` / `Admin@123`
4. Start backend: `pnpm run start:dev`.
5. Point admin `.env` at the same API (`VITE_API_URL=http://localhost:3000`).
6. Start admin: `pnpm run dev`.

### Smoke checklist

| Check | Pass |
|-------|------|
| `GET /api/v1/health` returns OK | ☑ |
| Admin login works | ☑ |
| Dashboard shows numbers (not forever loading) | ☑ |
| Categories list loads | ☑ |
| Service providers list loads | ☑ |
| Provider admin login works (after assign) | ☐ (create + assign in UI, then verify) |
| Volunteer login works (after account created) | ☐ (create account in UI, then verify) |
| Logout works | ☑ |

### Done when

Admin can log in and open Dashboard + Categories + Providers without API errors. At least one provider admin and one volunteer account can log in.

### Stop rule

Do not start Phase B until smoke passes.

---

## 6. Phase B — Wire missing admin UI

### Why

Some APIs exist but staff cannot reach them from the main app.

### Do

1. **States**
   - Add route `/states` → `StatesList`.
   - Add sidebar item (under master data or near State Admin).
2. Confirm States CRUD works (create / edit / toggle / delete).
3. Confirm State Admin create form still loads states from API.
4. Remove or hide dead routes:
   - Keep `/sample` and `/sample2` as private experiments, or remove from day-to-day use.
   - Do not treat them as product.
5. Replace “Page under construction” catch-all with a simple 404 that links back to Dashboard.

### Already done (skip)

- Provider admins page (`/provider-admins`)
- Volunteer login accounts page (`/volunteer-admins`)
- Permission-based sidebar
- Role-based login redirect

### Done when

Staff can manage States from the sidebar. No dead “product” pages in the main menu.

### Test

| Check | Pass |
|-------|------|
| Sidebar → States opens | ☑ (wired) |
| Create state “Karnataka” | ☑ (API smoke) |
| Assign that state to a state admin | ☐ |
| Provider create form shows the new state | ☐ |

---

## 7. Phase C — Close product gaps in admin

### Why

A few rules the product needs are still thin or messy.

### C1. Enquiry status

**Today:** enquiries are create / edit / delete only.

**Do:**

1. Add `status` on `Enquiry`:
   - `NEW`
   - `CONTACTED`
   - `CLOSED`
2. Backend: allow PATCH status; filter list by status.
3. Admin UI: status badge + filter tabs + change status from the row or modal.

**Done when:** staff can mark an enquiry Contacted / Closed and filter by status.

### C2. Enquiry scoping by role (new — required)

**Today:** anyone with `enquiries.read` sees **all** enquiries. No filter by state or provider.

**Do:**

| Role | Should see |
|------|------------|
| ADMIN | All enquiries |
| STATE_ADMIN | Enquiries tied to their state (needs link on enquiry or provider) |
| SERVICE_PROVIDER_ADMIN | Enquiries for their assigned provider(s) only |
| VOLUNTEER | All user enquiries, or a subset — confirm with product |

**Backend:**

1. Add optional `providerId` / `stateId` on `Enquiry` if missing.
2. Filter `findAll` by role in `EnquiriesService`.
3. Pass `currentUser` into enquiry endpoints (today they do not).

**Admin UI:**

1. Provider admin and volunteer only see allowed rows.
2. State admin list is state-scoped.

**Done when:** provider admin does not see another clinic’s enquiries. State admin does not see other states (if product wants that).

### C3. Category type (Home vs Providers)

**Today:** mobile wants `type` `0` / `1`. Schema has no type.

**Do (admin-first):**

1. Add optional `type` (or `channel`) on `Category`:
   - `CARE` (Home tab)
   - `SERVICE` (Providers tab)
2. Migration + seed update.
3. Admin Categories form: dropdown for type.
4. List shows type.

**Done when:** admin can set type on every category. (Mobile will use this later.)

### C4. Clean legacy listings

**Today:** old `Listing` model + `/listings` still exist. Real listings are `ServiceProvider`.

**Do:**

1. Keep `/listings` only if still needed for sample pages.
2. Document in this folder: “Service providers = live listing. Old listings = legacy.”
3. Optional later: remove old listings after sample pages are gone.

**Done when:** team agrees which listing path is live. No new features on old `/listings`.

### C5. Marketplace fields (light)

**Do only what admin forms need:**

1. Ensure product fields match the admin form (name, prices, phone, intent, seller name, active).
2. Add optional `imageUrl` if the form needs a photo URL.
3. Keep buyers / sellers CRUD as-is unless a clear bug appears.

**Done when:** marketplace pages save and reload without missing fields.

---

## 8. Phase D — Support APIs admin needs

### Why

Staff flows feel unfinished without mail and uploads.

### D1. Password reset email

**Today:** token is logged / returned in non-prod.

**Do:**

1. Pick one mail path (Resend, SES, or SMTP).
2. Send reset link: `{ADMIN_URL}/reset-password?token=...`
3. Keep token exposure off in production.
4. Admin Forgot Password page shows only “If the email exists, we sent a link.”

**Done when:** forgot password sends a real mail in staging.

### D2. Image upload

**Today:** cover / blog image = pasted URL.

**Do:**

1. Add `POST /api/v1/uploads` (auth required, admin / state admin).
2. Store in S3 / Cloudinary / local `uploads/` (pick one).
3. Return public URL.
4. Admin forms: file picker that sets the URL field.

**Start with:** provider cover photo + blog image.

**Done when:** staff can upload a cover without leaving the form.

### Do not build yet (admin freeze)

- Chat
- Push notifications
- Razorpay
- Reviews
- Banners (unless product asks now)

Those can wait for a later admin phase or mobile phase.

---

## 9. Phase E — Harden the admin flow

### Why

Built is not the same as safe and clear for staff.

### E1. Role-aware menu

**Status: Done**

- Sidebar filters by `user.permissions`.
- Protected routes redirect if permission missing.
- Re-test after any new menu item is added.

### E2. State admin scope checks in UI

1. State admin should not pick another state when creating providers (lock `stateId`).
2. Show their state name in the header.

### E3. Provider admin UI limits

**Status: Partially done**

- Create / approve / reject / delete / assign admin hidden for provider admin.
- Re-test edit form does not expose locked fields (`isActive`, `stateId`).

### E4. Stronger CMS / enquiry DTOs

1. Replace loose `Record<string, unknown>` where easy.
2. Return clear 400 messages for bad input.

### E5. Empty + error states

On every list page:

- Loading spinner
- Empty “No records”
- Toast on save / delete fail

### E6. QA script (manual)

Run this full path once:

1. Login as **admin**.
2. Create state → category → subcategory → keyword.
3. Create provider as Draft / Pending.
4. Approve provider.
5. Create provider admin user → assign to provider.
6. Create volunteer login account.
7. Create user enquiry + provider enquiry; set status (after C1).
8. Add FAQ, useful link, blog, job alert, page.
9. Add marketplace product + buyer + seller.
10. Logout.
11. Login as **state admin** — confirm state scope on providers.
12. Login as **provider admin** — confirm only assigned provider(s); enquiries scoped (after C2).
13. Login as **volunteer** — confirm volunteer directory + enquiry access.

### Done when

Full path passes with no console API errors. Each role sees only what it should.

---

## 10. Phase F — Freeze admin + handoff

### Why

Stop admin thrash before mobile starts.

### Do

1. Tag a release note: `admin-stable-YYYY-MM-DD`.
2. Write a short API list of what mobile can use now (auth + public provider search).
3. List what mobile still needs (public categories, user post, enquiry create, public CMS).
4. Do not add new admin features unless they block staff.

### Done when

Admin is the source of truth for providers, users, enquiries, and content.

---

## 11. Suggested order of tickets

Work these as tickets, top first:

| # | Ticket | Phase | Size | Status |
|---|--------|-------|------|--------|
| 1 | Fix DB + smoke login | A | S | **Done** (local Postgres) |
| 2 | Wire States route + sidebar | B | S | **Done** |
| 3 | Enquiry status field + UI tabs | C | M | **Done** |
| 4 | **Enquiry scoping by role** | C | M | **Done** |
| 5 | Category type field + admin form | C | M | **Done** |
| 6 | Document / quarantine old listings | C | S | **Done** |
| 7 | Password reset email | D | M | Open |
| 8 | Upload API + provider cover picker | D | M | Open |
| 9 | Lock state for STATE_ADMIN forms | E | S | Open |
| 10 | Full multi-role QA script | E | M | Open |
| 11 | Admin freeze + mobile API gap list | F | S | Open |
| — | Service provider admin login | — | M | **Done** |
| — | Volunteer login + accounts CRUD | — | M | **Done** |
| — | Permission-based sidebar | — | M | **Done** |
| — | Provider admins page | — | S | **Done** |

**S** = small (hours). **M** = medium (1–2 days).

---

## 12. Definition of “admin flow finished”

Admin is done when all of these are true:

1. Login / logout / reset password work in staging for **admin, state admin, provider admin, volunteer**.
2. States, categories, subcategories, keywords are manageable.
3. Providers can be created, filtered, approved, rejected, and assigned an admin.
4. App users, state admins, provider admins, and volunteer accounts can be managed.
5. Enquiries can be listed by kind, filtered by status, and **scoped by role**.
6. Marketplace + CMS pages save real DB rows.
7. Dashboard counts match the DB.
8. State admin only sees their state (providers + enquiries).
9. Provider admin only sees assigned providers and their enquiries.
10. No critical dead links in the main sidebar.
11. Mobile work has a clear “use these APIs / wait for these APIs” list.

---

## 13. What we will not do in this plan

- Mobile `legacyApi` replacement
- OTP / Firebase auth
- Live chat
- Razorpay
- Push notifications
- Big UI redesign of admin
- Rewriting Nest or React from scratch

---

## 14. Day-by-day sketch (optional)

If one person works full time:

| Day | Focus |
|-----|--------|
| Day 1 | Phase A smoke + Phase B States |
| Day 2 | Enquiry status + enquiry scoping |
| Day 3 | Category type + state lock in UI |
| Day 4 | Email reset + upload cover |
| Day 5 | Multi-role QA + freeze notes |

Two people: split backend vs admin UI per ticket.

---

## 15. Risks

| Risk | What to do |
|------|------------|
| Neon DB sleeps / blocks | Use a local Postgres for daily work |
| Enquiry scoping unclear | Confirm rules with product before C2 |
| Volunteer vs volunteer directory confusion | Use sidebar labels: “Volunteer directory” vs “Volunteer accounts” |
| Upload choice delays D2 | Ship URL paste first; add upload next |
| Email provider delay | Keep token link in staging until mail works |
| Scope creep into mobile | Park mobile tickets in a separate list |

---

## 16. First action now

1. ~~Fix `DATABASE_URL` and get `GET /api/v1/health` + login green.~~ **Done** (local Postgres).
2. ~~Run migrate/seed for `VOLUNTEER` + new enquiry/category fields.~~ **Done** (`prisma db push` + seed).
3. ~~Wire States in sidebar + route.~~ **Done**.
4. ~~Enquiry status + enquiry scoping by role.~~ **Done**.
5. **Next:** Phase D — password reset email + image upload, then Phase E QA.
