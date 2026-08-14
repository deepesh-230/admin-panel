# Phase 5 — Service Provider Search

**Status:** COMPLETE  
**Date:** 2026-08-14  
**Depends on:** Phase 4 (`docs/Phase4_Service_Providers.md`)

---

## Goal
Robust provider discovery for admin and (later) mobile — keyword, category, location, and radius search.

---

## Admin list filters (`GET /api/v1/service-providers`)

| Param | Notes |
|-------|--------|
| `search` | Name, email, phone, city, address, description, services, about, category/subcategory names + **keyword→subcategory** match |
| `keyword` | Explicit keyword term (resolves `Keyword` master data) |
| `categoryId` / `subcategoryId` | Exact filters |
| `stateId` / `city` | Location filters |
| `approvalStatus` / `isActive` | Status |
| `latitude` + `longitude` + `radius` | Nearby search (km, Haversine); results include `distanceKm` |
| `page` / `limit` / `sortBy` / `sortOrder` | Pagination; `sortBy=distance` when nearby |

STATE_ADMIN remains scoped to their assigned state.

---

## Public / mobile discovery

| Method | Path | Notes |
|--------|------|-------|
| GET | `/service-providers/search` | **Public** — only `APPROVED` + `isActive` |
| GET | `/service-providers/search/:id` | **Public** detail |

Same query params as admin list (status filters ignored / forced approved+active).

Guards: `@Public()` also bypasses Roles + Permissions (updated).

---

## Admin UI

`/listings/providers` now includes:
- Keyword + city filters
- Nearby lat / lng / radius (km) with distance column
- Lat/lng fields on create/edit form

---

## Example

```text
GET /api/v1/service-providers/search
  ?keyword=wheelchair
  &city=Hyderabad
  &latitude=17.41
  &longitude=78.45
  &radius=25
  &page=1
  &limit=20
  &sortBy=distance
  &sortOrder=asc
```

---

## Next
**Phase 6 — Service Provider Admin and Enquiry Routing**
