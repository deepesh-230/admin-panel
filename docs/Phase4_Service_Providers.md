# Phase 4 — Service Provider Management

**Status:** COMPLETE  
**Date:** 2026-08-14  
**Depends on:** Phase 3 (`docs/Phase3_Users.md`)

---

## Data model

```text
ServiceProvider
  ├── Category / Subcategory
  ├── State (+ city, lat/lng, googlePlaceId)
  ├── approvalStatus: DRAFT | PENDING_APPROVAL | APPROVED | REJECTED
  ├── isActive
  ├── createdBy / approvedBy
  └── ServiceProviderAdmin[] ── User (promoted to SERVICE_PROVIDER_ADMIN)
```

---

## Backend APIs (`/api/v1/service-providers`)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/service-providers` | Filters: search, state, category, subcategory, approvalStatus, isActive |
| GET | `/service-providers/:id` | Detail + admins |
| POST | `/service-providers` | Create (admin defaults to APPROVED) |
| PATCH | `/service-providers/:id` | Update |
| DELETE | `/service-providers/:id` | Delete |
| POST | `/service-providers/:id/approve` | Approve + activate |
| POST | `/service-providers/:id/reject` | Reject with reason |
| GET | `/service-providers/:id/admins` | List assigned admins |
| POST | `/service-providers/:id/admins` | Assign admin (`userId`, optional `isPrimary`) |
| DELETE | `/service-providers/:id/admins/:userId` | Remove admin |

### Access
- Roles: ADMIN, STATE_ADMIN
- Permissions: `providers.read` / `providers.write`
- STATE_ADMIN scoped to their assigned state

### Admin assignment
- Assigning a user sets their role to `SERVICE_PROVIDER_ADMIN` if needed
- Multiple admins per provider; optional primary flag

---

## Admin UI

| Page | Route |
|------|-------|
| Service Providers | `/listings/providers` |

Features: approval tabs, search/state/category filters, CRUD modal, approve/reject, active toggle, admin assignment modal.

Sidebar: **Service Providers** under Listings.

---

## Seed samples
- Approved: Hyderabad Mobility Care Centre
- Pending: Vision Assist Clinic (Pending)

---

## Next
**Phase 5 — Service Provider Search** ✅ (`docs/Phase5_Provider_Search.md`)

**Phase 6 — Service Provider Admin and Enquiry Routing**
