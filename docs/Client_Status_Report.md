# Divyaang Disha — Project Status Report

**For:** Client review  
**Date:** 26 August 2026  
**Products covered:** Admin web app · Mobile app · Backend API

---

## 1. Summary

Divyaang Disha is a platform to help people with disabilities find services, buy or sell items, and contact providers. The project has three parts:

| Part | Purpose | Status |
|------|---------|--------|
| **Admin web app** | Staff manage listings, users, content, and enquiries | **Mostly working** — tied to live API |
| **Backend API** | Stores all data and powers the admin | **Built** — needs stable database in dev |
| **Mobile app** | End users browse, post, and enquire on phone | **UI built** — still uses demo data, not live API |

**In plain terms:** the admin side is close to usable for staff. The mobile app looks and flows well, but it does not yet save to the same database as admin.

---

## 2. Admin web app — what works today

The admin app is a browser-based dashboard for staff. When the backend and database are running, these areas work end to end (create, view, edit, delete).

### Login and security

| Feature | Status | Notes |
|---------|--------|-------|
| Login / logout | Working | Email + password |
| Forgot / reset password | Working | Reset token shown in dev; email send not live yet |
| Role-based access | Working | Menu shows only what each role may use |
| Protected pages | Working | Must log in to open dashboard |

### Who can log in to admin

| Role | Can log in? | What they can do |
|------|-------------|------------------|
| **Main admin** | Yes | Full access to all modules |
| **State admin** | Yes | Manage data for their state (providers scoped by state) |
| **Service provider admin** | Yes | View and edit only providers assigned to them |
| **Volunteer** | Yes | Volunteer directory + enquiries |
| **App user** | No | Uses mobile app only (not admin) |

### Dashboard

| Feature | Status |
|---------|--------|
| User counts (total / active / inactive) | Working |
| Service provider counts | Working |
| Listing and enquiry counts | Working |
| Last 7 days activity | Working |

### Service providers

| Feature | Status |
|---------|--------|
| Categories | Working |
| Subcategories | Working |
| Keywords | Working |
| Provider listings (create, edit, delete) | Working |
| Approve / reject workflow | Working |
| Search (name, city, keyword, nearby radius) | Working |
| Assign provider admin to a listing | Working |
| Provider admin accounts page | Working |

### Users and staff accounts

| Feature | Status |
|---------|--------|
| App users (end users) | Working |
| State admins (create, edit, deactivate) | Working |
| Provider admin accounts | Working |
| Volunteer login accounts | Working |

### Enquiries

| Feature | Status | Notes |
|---------|--------|-------|
| User enquiries list | Working | View, add, edit, delete |
| Service provider enquiries list | Working | Separate tab by type |
| Status workflow (New / Contacted / Closed) | Not yet | Planned |
| Filter enquiries by role (state / provider) | Not yet | All roles with access see all enquiries today |

### Marketplace

| Feature | Status |
|---------|--------|
| Product listings | Working |
| Buyers | Working |
| Sellers | Working |

### Content management

| Feature | Status |
|---------|--------|
| FAQ | Working |
| Useful links | Working |
| Help & support tickets | Working |
| Static pages (About, Terms, Privacy) | Working |
| Blogs | Working |
| Job alerts | Working |
| Suggestions | Working |
| Volunteer directory (contact records) | Working |

### Admin — not working or incomplete

| Item | Status |
|------|--------|
| States page in sidebar | API exists; menu link not wired yet |
| Image upload (photos) | URL paste only; no file upload |
| Password reset email | Token works; email not sent automatically |
| Sample/demo routes (`/sample`, `/sample2`) | Dev-only; not part of product |

---

## 3. Mobile app — what works today

The mobile app (Divyaang Disha) is built with Expo for Android and iOS. Most screens are designed and clickable. **Important:** almost all data is **demo / sample data** stored in the app for testing. It does **not** connect to the live backend yet.

### What works well (UI and flow)

| Area | Status | Notes |
|------|--------|-------|
| Welcome, login, register screens | UI works | Login goes to OTP screen; **no real account is created** |
| OTP verification | UI works | Any 4-digit code passes; **not sent by email/SMS** |
| Home tab | UI works | Categories, banners, search — **demo data** |
| Providers tab | UI works | Browse by category — **demo data** |
| Sale tab | UI works | Product grid and detail — **demo data** |
| Menu tab | UI works | Profile, settings, links — mix of local + demo |
| Browse category → providers | UI works | Demo listings |
| Provider detail page | UI works | Info, reviews, enquiry form — **demo** |
| Product detail page | UI works | Sale item detail and enquiry — **demo** |
| Add service provider post | UI works | Saves in app memory only; **lost on reload** |
| Add sale item | UI works | Same — **not saved to server** |
| My posts / my products | UI works | Shows demo or session data |
| My enquiries | UI works | Saved on device only |
| Edit profile | UI works | Saved on device only |
| FAQ, blogs, links, about, contact | UI works | **Demo content** |
| Help & support form | UI works | **Demo submit** |
| Ask a question | UI works | **Demo submit** |
| Language picker | UI works | Saves choice; **UI text does not translate** |
| Maps / location picker | UI works | **Sample places**, not live Google search |
| Get Featured / Sponsorship | UI works | **Fake payment** (alert only, no Razorpay) |
| Chat screen | UI only | **Hardcoded sample messages** — not real chat |

### Mobile — not connected to backend yet

| Feature | Backend ready? | Mobile connected? |
|---------|----------------|-------------------|
| Real login / register | Partial | No |
| Browse approved providers from admin | Yes (public search API) | No |
| Categories from admin | Admin-only API | No |
| Submit enquiry to admin | Admin API exists | No |
| Sale / marketplace from admin | Admin API exists | No |
| FAQ / blogs / pages from admin | Admin API exists | No |
| Real OTP | No | No |
| Real payments | No | No |
| Push notifications | No | No |

---

## 4. Backend API — what exists

The backend (NestJS + PostgreSQL) powers the admin app. It is **not** fully wired to the mobile app yet.

### Working for admin

- Authentication (login, refresh, logout, password reset token)
- Users, roles, and permissions
- States, categories, subcategories, keywords
- Service providers (including public search for future mobile use)
- Enquiries, marketplace, CMS content
- Dashboard statistics
- Volunteer accounts and provider admin assignment

### Ready for mobile (built but not used by app yet)

- `GET /api/v1/service-providers/search` — public provider search
- `GET /api/v1/service-providers/search/:id` — public provider detail
- `POST /api/v1/auth/register` — end user registration

### Not built yet

- OTP / SMS auth
- File / image upload
- Reviews, chat, banners
- Payment (Razorpay)
- Public read APIs for FAQ, blogs, categories (mobile needs these)

---

## 5. How admin and mobile connect today

```text
                    TODAY
                    -----

   Admin web app  --------->  Backend API  --------->  Database
        (live)                  (live)

   Mobile app    - - - - - >  (not connected)
        (demo data only)
```

**After mobile integration (planned):**

```text
   Admin web app  --------->  Backend API  <---------  Mobile app
                                    |
                               Database
```

Staff actions in admin (approve a provider, add FAQ) will then appear in the mobile app once it reads from the same API.

---

## 6. Overall completion (estimate)

| Product | UI / screens | Live data / API | Client-ready? |
|---------|--------------|-----------------|---------------|
| **Admin web app** | ~90% | ~85% | **Near ready** — after DB stable + small fixes |
| **Backend API** | n/a | ~85% for admin; ~25% for mobile | **Admin-ready** |
| **Mobile app** | ~90% | ~5% (demo only) | **Demo / prototype** — not production |

---

## 7. Recommended next steps (for client alignment)

**Phase 1 — Finish admin (short term)**  
1. Stable database connection in dev and staging  
2. Wire States page in admin menu  
3. Enquiry status (New / Contacted / Closed)  
4. Limit enquiries by role (state / provider)  
5. Password reset email and image upload (optional but useful)

**Phase 2 — Connect mobile (medium term)**  
1. Point mobile app to backend instead of demo data  
2. Real login and registration  
3. Browse providers and categories from admin data  
4. Submit enquiries that appear in admin  
5. Marketplace and content pages from admin CMS

**Phase 3 — Production extras (later)**  
1. OTP or SMS verification  
2. Razorpay (Get Featured / Sponsorship)  
3. Push notifications  
4. Chat (if required)

---

## 8. Default test login (development only)

| Role | Email (example) | Notes |
|------|-----------------|-------|
| Main admin | `admin@divyaangdisha.com` | Created by database seed |
| State admin | Created in admin | Admin creates under State Admin |
| Provider admin | Created in admin | Then assigned to a provider listing |
| Volunteer | Created in admin | Under Volunteer accounts |

**Do not share production passwords in this document.** Use staging credentials only.

---

## 9. Document purpose

This report describes **what is working as of the date above**, based on the current codebase. It is meant for client review and planning. It does not promise production deployment until Phase 1 (admin) and Phase 2 (mobile API) are complete and tested in staging.

For internal implementation detail, see `Admin_Flow_Completion_Plan.md` in the same folder.

---

*Prepared for Divyaang Disha · Admin panel project*
