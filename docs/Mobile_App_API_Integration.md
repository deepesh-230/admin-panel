# Mobile App — API Integration Guide

**Product:** Divyaang Disha  
**Mobile app:** `divyaang-disha/` (Expo + React Native)  
**Backend:** `backend/` — NestJS, base path `/api/v1`  
**Date:** 2026-09-01  
**Purpose:** Map every mobile feature to backend APIs — what exists, what can be wired now, and what still needs to be built.

---

## 1. Executive summary

| Area | Status |
|------|--------|
| Mobile UI / screens | ~90% built |
| Mobile ↔ backend connection | **~0%** — all data via `legacyApi` mock |
| Backend ready for mobile today | Auth (register/login/reset) + public provider search |
| Backend exists but admin-only | Categories, CMS, enquiries, marketplace, uploads |
| Not built anywhere | Reviews, chat, banners, OTP/SMS, Razorpay, end-user posts |

**Integration strategy:** Replace `divyaang-disha/src/api/legacy.ts` with a real HTTP client (`apiClient.ts`) that calls `/api/v1/*`. Add missing **public read** and **end-user write** endpoints on the backend before wiring CMS, enquiries, and user posts.

---

## 2. Mobile app today

### Stack

- **Expo ~57** + **React Native 0.86** + **Expo Router**
- API layer: `src/api/legacy.ts` — 39 mock methods, in-memory + `dummy-data.ts`
- Session: `src/utils/session.ts` (AsyncStorage) — `completeLogin()` exists but **auth screens never call it**
- No `fetch` / `axios` / env var for API URL yet

### Category type mapping (important)

| Mobile (`legacyApi`) | Tab | Backend (`Category.type`) |
|----------------------|-----|---------------------------|
| `type = '0'` | Home (care services) | `CARE` |
| `type = '1'` | Providers (emergency) | `SERVICE` |

### All `legacyApi` methods (mobile expects these)

| Method | Mobile screen(s) | Backend today |
|--------|------------------|---------------|
| `getCategories(type?)` | Home, Providers, Add post | Admin-only — **needs public read** |
| `getSubcategories(categoryId)` | Category accordion, Add post | Admin-only — **needs public read** |
| `getSubcategoriesByCategoryIds(ids)` | Add post (multi-category) | Admin-only — **needs public read** |
| `getHomeBanners()` | Home carousel | **Not built** |
| `getProviders({...})` | Category → provider list | **Ready** → `GET /service-providers/search` |
| `getProvidersBySubcategories({...})` | Category (multi-filter) | **Ready** → same search endpoint |
| `getProviderDetail(id)` | Provider detail | **Ready** → `GET /service-providers/search/:id` |
| `getReviews(productId)` | Provider / product detail | **Not built** |
| `submitReview({...})` | Provider detail | **Not built** |
| `submitEnquiry({...})` | Provider detail | Staff-only — **needs public/user endpoint** |
| `addPost({...})` | Add service post | **Needs end-user create flow** |
| `updatePost({...})` | Edit service post | **Needs end-user update** |
| `deletePost(id)` | My posts | **Needs end-user delete** |
| `deleteListingImage(id)` | Edit post gallery | **Not built** |
| `getMyPosts(userId)` | Menu → My posts | **Needs user-scoped list** |
| `getListingEnquiries(productId)` | Menu → Post enquiries | Staff-only |
| `getVendorChats(vendorId, productId)` | Menu → Post chats | **Not built** |
| `getSaleProducts(location?)` | Sale tab | Admin listings — **needs public marketplace** |
| `getSaleProductDetail(id)` | Product detail | **Needs public marketplace read** |
| `addProduct({...})` | Add sale item | **Needs end-user marketplace create** |
| `submitSaleEnquiry({...})` | Product detail | **Needs public enquiry** |
| `getMyProducts(userId)` | Menu → My products | **Needs user-scoped list** |
| `login(email, password)` | Auth (not wired in UI) | **Ready** → `POST /auth/login` |
| `register({...})` | Auth (not wired) | **Ready** → `POST /auth/register` |
| `forgotPassword(email)` | Auth (not wired) | **Ready** → `POST /auth/forgot-password` |
| `verifyOtp(...)` | Auth OTP screen | **Not built** (app uses OTP UI; backend uses email link) |
| `resetPassword(...)` | Reset password | **Ready** → `POST /auth/reset-password` |
| `getProfile(userId)` | Menu, edit profile | Partial — `GET /auth/me` after login |
| `getBlogs()` | Menu → Blogs | Admin CMS — **needs public read** |
| `getJobAlerts()` | Menu → Announcements | Admin CMS — **needs public read** |
| `getFaq()` | Menu → FAQ | Admin CMS — **needs public read** |
| `getUsefulLinks()` | Menu → Useful links | Admin CMS — **needs public read** |
| `getAboutUs()` | Menu → About | Admin pages — **needs public read by slug** |
| `getPrivacyPolicy()` | Menu → Privacy | Admin pages — **needs public read by slug** |
| `getTerms()` | Menu → Terms | Admin pages — **needs public read by slug** |
| `getContactUs()` | Menu → Contact | **Not built** (no Contact model/API) |
| `submitHelp({...})` | Menu → Help & support | Admin help-tickets — **needs public create** |
| `getAskList(userId)` | Menu → Ask questions | **Not built** (suggestions model exists, no user API) |
| `submitQuestion({...})` | Menu → Ask questions | Admin suggestions — **needs user create** |

### Local-only (not in backend)

| Feature | Storage | Notes |
|---------|---------|-------|
| My enquiries list | AsyncStorage `dd_my_enquiries_v1` | Should move to `GET /profile/enquiries` |
| Sponsorship tier | AsyncStorage `dd_sponsorship_v1` | Needs Razorpay + backend |
| Location radius prefs | AsyncStorage `dd_location_prefs_v1` | Keep on device |
| Language | AsyncStorage `dd_language` | Keep on device |
| Chat messages | Hardcoded in `chat.tsx` | Needs conversations API |
| Get Featured submit | Local Alert only | Needs admin workflow / API |
| Places autocomplete | `src/api/places.ts` dummy | Google Places (external) |
| Payments | `src/payments/checkout.ts` stub | Razorpay (not built) |

---

## 3. Backend APIs — ready to integrate now

These exist and are **public** (no JWT) or work for **END_USER** after login.

### 3.1 Health

| Method | Path | Auth | Mobile use |
|--------|------|------|------------|
| GET | `/api/v1/health` | Public | App startup / connectivity check |

### 3.2 Authentication

| Method | Path | Auth | Mobile use |
|--------|------|------|------------|
| POST | `/api/v1/auth/register` | Public | Register screen — creates `END_USER` |
| POST | `/api/v1/auth/login` | Public | Login — returns `accessToken`, `refreshToken`, `user` |
| POST | `/api/v1/auth/refresh` | Public | Silent token refresh |
| POST | `/api/v1/auth/logout` | Public | Revoke refresh token |
| POST | `/api/v1/auth/forgot-password` | Public | Forgot password — sends email link (SMTP) |
| POST | `/api/v1/auth/reset-password` | Public | Reset with token from email |
| GET | `/api/v1/auth/me` | JWT | Profile after login |

**Register body:** `{ name?, email, phone?, password }` (min 8 chars)  
**Login body:** `{ email, password }`  
**Response shape:** `{ success, message, data: { user, accessToken, refreshToken, expiresIn } }`

**Auth gap:** Mobile OTP flow (`verifyOtp`) has no backend equivalent. Options:
- **A (recommended):** Wire login to email+password; keep OTP screen as optional later phase
- **B:** Add SMS/Firebase OTP endpoints (not planned yet)

### 3.3 Service provider discovery (public)

| Method | Path | Auth | Maps to `legacyApi` |
|--------|------|------|---------------------|
| GET | `/api/v1/service-providers/search` | Public | `getProviders`, `getProvidersBySubcategories` |
| GET | `/api/v1/service-providers/search/:id` | Public | `getProviderDetail` |

**Query params:** `search`, `keyword`, `categoryId`, `subcategoryId`, `stateId`, `city`, `latitude`, `longitude`, `radius` (km), `page`, `limit`, `sortBy`, `sortOrder`

**Rules:** Only `APPROVED` + `isActive=true` providers returned. Nearby search requires all three: `latitude`, `longitude`, `radius`.

**Response fields (per item):** `id`, `name`, `categoryId`, `subcategoryId`, `description`, `phone`, `landline`, `email`, `address`, `city`, `about`, `services`, `coverPhotoUrl`, `gallery[]`, `latitude`, `longitude`, `distanceKm`, `category`, `subcategory`, `state`, …

### 3.4 Static uploads (read)

| Method | Path | Auth | Mobile use |
|--------|------|------|------------|
| GET | `/uploads/:filename` | Public | Display images uploaded via admin |

---

## 4. Backend APIs — exist but need changes for mobile

These are built for **admin/staff**. Mobile needs either **public read** routes or **END_USER** authenticated routes.

### 4.1 Master data (categories, subcategories, states)

| Current endpoint | Roles today | What mobile needs |
|------------------|-------------|-------------------|
| `GET /categories?type=CARE\|SERVICE&isActive=true` | ADMIN, STATE_ADMIN | **Public read** (active only) |
| `GET /categories/:id/subcategories` | ADMIN, STATE_ADMIN | **Public read** |
| `GET /subcategories/:id` | ADMIN, STATE_ADMIN | **Public read** (optional) |
| `GET /states` | ADMIN, STATE_ADMIN | **Public read** (for registration / filters) |

**Suggested new routes:**

```
GET /api/v1/public/categories?type=CARE|SERVICE
GET /api/v1/public/categories/:id/subcategories
GET /api/v1/public/states
```

Or add `@Public()` on filtered GET handlers returning `isActive=true` only.

### 4.2 CMS content (read-only for mobile)

| Mobile method | Admin endpoint today | Suggested public route |
|---------------|----------------------|------------------------|
| `getFaq()` | `GET /faqs` | `GET /public/faqs` |
| `getBlogs()` | `GET /blogs` | `GET /public/blogs` |
| `getJobAlerts()` | `GET /job-alerts` | `GET /public/job-alerts` |
| `getUsefulLinks()` | `GET /useful-links` | `GET /public/useful-links` |
| `getAboutUs()` | `GET /pages` (slug) | `GET /public/pages/about` |
| `getPrivacyPolicy()` | same | `GET /public/pages/privacy-policy` |
| `getTerms()` | same | `GET /public/pages/terms` |

Filter: `isActive=true` only. No auth required.

### 4.3 Enquiries (submit from mobile)

| Current | Problem | Mobile need |
|---------|---------|-------------|
| `POST /enquiries` | Requires staff role + `enquiries.write` | Public or END_USER create |

**Suggested:**

```
POST /api/v1/public/enquiries          # guest submit (provider / sale enquiry)
GET  /api/v1/profile/enquiries         # logged-in user's enquiries (JWT, END_USER)
```

**Map from `submitEnquiry`:**

| legacyApi field | Backend `CreateEnquiryDto` |
|-----------------|----------------------------|
| `categoryId` → category name | `category` (string label) |
| `subcategoryId` → name | `subCategory` |
| `productId` → provider name | `product` |
| `name` | `name` |
| `email` | `email` |
| `message` | *(add `message` field to schema — currently missing)* |
| `createdBy` | `createdBy` (user id or guest id) |
| `productId` (uuid) | `providerId` |
| — | `kind`: `USER` or `PROVIDER` |
| — | `date`: ISO date string |

**Schema gap:** `Enquiry` model has no `phone` or `message` field — add before mobile wiring.

### 4.4 User posts (service providers created by app users)

| Mobile method | Admin endpoint | What to build |
|---------------|----------------|---------------|
| `addPost` | `POST /service-providers` | END_USER create → `PENDING_APPROVAL` |
| `updatePost` | `PATCH /service-providers/:id` | END_USER update own posts only |
| `deletePost` | `DELETE /service-providers/:id` | END_USER delete own posts |
| `getMyPosts` | — | `GET /profile/providers` (by `createdById`) |

**Also needed:**
- `POST /uploads` opened to **END_USER** (or `POST /public/uploads` with auth)
- Image fields: `coverPhotoUrl` + `gallery[]` (URLs from upload response)

### 4.5 Marketplace / Sale tab

| Mobile method | Admin endpoint | What to build |
|---------------|----------------|---------------|
| `getSaleProducts` | `GET /marketplace/products` | Public read (active only) |
| `getSaleProductDetail` | `GET /marketplace/products/:id` | Public read |
| `addProduct` | `POST /marketplace/products` | END_USER create |
| `getMyProducts` | — | `GET /profile/marketplace/products` |
| `submitSaleEnquiry` | `POST /enquiries` | Public enquiry with `kind=USER` |

**Note:** Legacy `Listing` model (`/listings`) is quarantined. Sale tab should target `MarketplaceProduct`, not `Listing`.

### 4.6 Help & support

| Mobile method | Admin endpoint | Suggested |
|---------------|----------------|-----------|
| `submitHelp` | `POST /help-tickets` | `POST /public/help-tickets` (no auth) |

### 4.7 Profile

| Mobile method | Backend today | Suggested |
|---------------|---------------|-----------|
| `getProfile` | `GET /auth/me` | Extend user model if `image`, `location`, `country_code` needed |
| Edit profile (local only) | — | `PATCH /profile` or `PATCH /users/:id` for END_USER self |

---

## 5. APIs not built — need new backend work

| Feature | Mobile location | Priority | Notes |
|---------|-----------------|----------|-------|
| **Home banners** | Home tab | Medium | New `Banner` model + `GET /public/banners` |
| **Reviews** | Provider / product detail | Medium | New `Review` model + CRUD |
| **Chat / conversations** | `chat.tsx`, post-chats | Low | New `Conversation` + `Message` models |
| **OTP / SMS auth** | `auth/otp.tsx` | Low / TBD | Firebase or SMS provider |
| **Razorpay payments** | `menu/sponsor.tsx` | Low | Order create + webhook |
| **Get Featured** | `menu/get-featured.tsx` | Low | Admin workflow or feature-request model |
| **Contact Us** | `menu/contact.tsx` | Low | CMS page or `ContactSettings` singleton |
| **Ask questions (tickets)** | `menu/ask.tsx` | Medium | User-facing `Suggestions` API or new `SupportTicket` |
| **Volunteer directory (public)** | Not in mobile yet | Low | `GET /public/volunteers` |
| **Push notifications** | — | Low | FCM + device tokens |
| **Delete gallery image** | Edit post | Medium | Part of provider PATCH or dedicated endpoint |

---

## 6. Integration matrix (at a glance)

| Mobile feature | Integrate now | Needs backend change | Not built |
|----------------|---------------|----------------------|-----------|
| Login / register / reset | ✅ | — | OTP |
| Browse providers (list + detail) | ✅ | Field mapping adapter | — |
| Categories + subcategories | — | **Done** (public read) | — |
| Submit provider enquiry | — | Public POST + schema (`message`, `phone`) | — |
| FAQ / blogs / links / pages | — | **Done** (public read) | Contact Us (env-based `/public/contact`) |
| Home banners | — | — | Banner API |
| Add / edit / delete service post | — | END_USER provider CRUD + upload | — |
| My posts | — | `GET /profile/providers` | — |
| Sale tab browse | — | **Done** (public marketplace read) | — |
| Add sale product | — | **Done** (END_USER create + upload) | — |
| Sale enquiry | — | **Done** (`POST /public/enquiries`) | — |
| Reviews | — | — | Review API |
| Help form | — | Public help-ticket create | — |
| Ask questions | — | User suggestion API | — |
| Profile edit | Partial (`/auth/me`) | PATCH profile fields | — |
| Image upload (user posts) | — | Open upload to END_USER | — |
| Chat | — | — | Chat API |
| Sponsorship / payments | — | — | Razorpay |
| Places autocomplete | External | — | Google Places key |

**Legend:** ✅ = backend ready, wire mobile client only.

---

## 7. Recommended integration phases

### Phase M1 — Foundation (wire what exists)

**Status: Done**

1. `EXPO_PUBLIC_API_URL` + `src/api/client.ts` (fetch + JWT + refresh).
2. Auth wired: register, login, logout, forgot/reset password, `completeLogin()`.
3. Provider search wired via `src/api/providers.ts` → `legacyApi.getProviders` / `getProviderDetail`.
4. Response adapter: `src/api/adapters/provider.ts`.

**Note:** Categories/subcategories still use mock data until M2 (public read APIs). Provider search works with real UUIDs from admin; mock category IDs are ignored on the API filter.

**Unlocks:** Real login, real approved providers on list/detail (when backend is running).

### Phase M2 — Public reads (backend + mobile)

**Status: Done**

1. Backend: `GET /api/v1/public/categories`, `/public/categories/:id/subcategories`, `/public/states`, `/public/faqs`, `/public/blogs`, `/public/job-alerts`, `/public/useful-links`, `/public/pages/:slug`, `/public/contact`.
2. Mobile: `src/api/public.ts` + adapters; `legacyApi` wired for categories, subcategories, FAQ, blogs, announcements, links, about/privacy/terms, contact.
3. Seed: CARE category + sample CMS rows for mobile testing.

**Still mock:** Home banners (`getHomeBanners`) — deferred to M5.

**Unlocks:** Admin-managed categories and content appear in the app.

### Phase M3 — User actions

1. Backend: extend `Enquiry` schema (`phone`, `message`); `POST /public/enquiries`.
2. Backend: END_USER `POST/PATCH/DELETE` service-providers (own posts, pending approval).
3. Backend: `POST /uploads` for END_USER; `GET /profile/providers`, `/profile/enquiries`.
4. Mobile: enquiry forms, add/edit post, my posts, my enquiries.

**Unlocks:** Users can enquire and submit listings for admin approval.

### Phase M4 — Marketplace (Sale tab)

**Status: Done**

1. Backend: extended `MarketplaceProduct` (description, address, color, brand, features, gallery, `createdById`); `Enquiry` gains `phone`, `message`, `marketplaceProductId`.
2. Public: `GET /public/marketplace/products`, `GET /public/marketplace/products/:id`, `POST /public/enquiries`.
3. Profile (END_USER): `GET/POST /profile/marketplace/products`.
4. Uploads open to `END_USER` for product images.
5. Mobile: Sale tab, product detail, add product, my products, sale enquiry wired via `marketplaceApi`.

**Unlocks:** Sale tab reads live marketplace data; logged-in users can list items and submit enquiries to admin.

### Phase M5 — Later

Reviews, chat, banners, Razorpay, OTP, push notifications, Get Featured.

---

## 8. Field mapping — providers (legacy ↔ backend)

Use an adapter in `src/api/adapters/provider.ts` so screens keep working during migration.

| legacyApi (`LegacyProvider`) | Backend (`ServiceProvider`) |
|------------------------------|----------------------------|
| `id` | `id` |
| `title` | `name` |
| `category_id` | `categoryId` |
| `subcategory` | `subcategoryId` |
| `address` | `address` |
| `mail` | `email` |
| `mobile` | `phone` |
| `landline` | `landline` |
| `about` | `about` |
| `services` | `services` |
| `latitude` / `longitude` | `latitude` / `longitude` (number → string in UI) |
| `image` | `coverPhotoUrl` |
| `additional_images` | `gallery` |
| `distance_km` | `distanceKm` |
| `city` | `city` |
| `state` | `state.name` |
| `status` | `isActive` ? `'1'` : `'0'` |
| `approval_status` | `approvalStatus` |

**Images:** Legacy uses `IMAGE_BASE = 'https://divyaangdisha.com/disability/'`. New uploads use `PUBLIC_API_URL/uploads/...`. Adapter should pass through full URLs as-is.

---

## 9. Auth session — mobile wiring checklist

| Step | File | Action |
|------|------|--------|
| 1 | `.env` | `EXPO_PUBLIC_API_URL=http://localhost:3000` |
| 2 | `src/api/client.ts` | fetch wrapper, store tokens in AsyncStorage |
| 3 | `src/app/auth/login.tsx` | Call `POST /auth/login` → `completeLogin(user, tokens)` |
| 4 | `src/app/auth/register.tsx` | Call `POST /auth/register` |
| 5 | `src/app/auth/forgot.tsx` | Call `POST /auth/forgot-password` |
| 6 | `src/app/auth/reset-password.tsx` | Call `POST /auth/reset-password` with `?token=` |
| 7 | `src/app/auth/otp.tsx` | Skip API for now OR redirect after password login |
| 8 | `src/api/legacy.ts` | Deprecate — replace callers one by one |

---

## 10. Backend work backlog (for mobile)

Priority order for backend team:

| # | Task | Blocks |
|---|------|--------|
| 1 | Public categories + subcategories read | Home, Providers tabs |
| 2 | Public CMS reads (FAQ, blogs, pages, links, job alerts) | Menu content screens |
| 3 | Enquiry schema + `POST /public/enquiries` | Provider / product enquiry |
| 4 | END_USER service-provider create/list/update/delete | Add post, My posts |
| 5 | Upload permission for END_USER | Post images |
| 6 | Public marketplace product read + END_USER create | Sale tab |
| 7 | `PATCH /profile` (name, phone, image, location) | Edit profile |
| 8 | Public help-ticket create | Help & support |
| 9 | Banners API | Home carousel |
| 10 | Reviews API | Provider detail reviews |
| 11 | Chat / conversations | Chat screens |
| 12 | Razorpay + sponsorship | Sponsor flow |
| 13 | OTP / SMS auth | OTP screen (optional) |

---

## 11. Environment variables

### Mobile (`divyaang-disha`)

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
# EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=...   # for places autocomplete
```

### Backend (already used / needed for mobile)

```env
ADMIN_URL=...              # password reset links (admin + mobile if shared)
PUBLIC_API_URL=...         # image URLs returned from /uploads
SMTP_*                     # forgot-password email
```

---

## 12. Related docs

| Doc | Contents |
|-----|----------|
| `Admin_Flow_Completion_Plan.md` | Admin phases A–F; mobile handoff in Phase F |
| `Client_Status_Report.md` | Client-facing status (~5% mobile connected) |
| `Phase5_Provider_Search.md` | Public search API detail |
| `Listings_vs_Service_Providers.md` | Sale tab → marketplace, not legacy listings |
| `Phase1_Auth_RBAC.md` | Auth + roles (END_USER has no permissions) |

---

## 13. Definition of “mobile integrated”

Mobile is production-ready when:

1. Login / register / reset password use real API (no mock).
2. Home + Providers tabs load categories/subcategories from admin DB.
3. Provider list/detail/enquiry use live approved providers.
4. CMS screens (FAQ, blogs, links, about, terms, privacy) load from admin.
5. User can submit a service post → appears as `PENDING_APPROVAL` in admin.
6. User enquiries appear in admin enquiry list.
7. Sale tab uses marketplace products from admin (or scope is explicitly deferred).
8. Profile persists to server.
9. No critical screen relies on `dummy-data.ts` or in-memory `legacyApi` stores.

---

*Generated from analysis of `divyaang-disha/` and `backend/` — 2026-09-01.*
