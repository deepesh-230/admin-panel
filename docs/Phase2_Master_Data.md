# Phase 2 — Master Data

**Status:** COMPLETE  
**Date:** 2026-08-14  
**Depends on:** Phase 1 (`docs/Phase1_Auth_RBAC.md`)

---

## Delivered APIs (`/api/v1`)

| Module | Endpoints |
|--------|-----------|
| States | `GET/POST /states`, `GET/PATCH/DELETE /states/:id` |
| State Admins | `GET/POST /state-admins`, `GET/PATCH/DELETE /state-admins/:id` |
| Categories | `GET/POST /categories`, `GET/PATCH/DELETE /categories/:id` |
| Subcategories | `GET /categories/:categoryId/subcategories`, `POST/PATCH/DELETE /subcategories`, `GET /subcategories/:id` |
| Keywords | `GET /subcategories/:id/keywords`, `GET/POST/PATCH/DELETE /keywords` |

### Access rules
- **States write / State Admins write:** ADMIN only
- **Categories / Subcategories / Keywords:** ADMIN + STATE_ADMIN
- **STATE_ADMIN** list of state-admins is scoped to their own state

### Data model
```text
Category
  └── Subcategory
        └── Keyword

State
User (STATE_ADMIN) ── UserState ── State
```

---

## Admin UI

| Page | Route |
|------|-------|
| Categories | `/listings/category` |
| Sub Categories (+ keywords modal) | `/listings/sub-category` |
| States | `/master/states` |
| State Admins | `/master/state-admins` |

Sidebar: Category / Sub Category under Listings; States / State Admins under User.

---

## Permissions added
- `states.read` / `states.write`
- `state_admins.read` / `state_admins.write`
- `categories.read` / `categories.write`

---

## Seed samples
- Categories: Physical Disabilities, Sensory Disabilities
- Subcategories + keywords (wheelchair, crutches, braille, screen reader)
- Default state: Telangana

---

## Next
**Phase 3 — Users and State Administration** (full user management APIs/UI, stronger state-boundary enforcement)
