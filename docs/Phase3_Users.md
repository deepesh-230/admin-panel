# Phase 3 — Users and State Administration

**Status:** COMPLETE  
**Date:** 2026-08-14  
**Depends on:** Phase 2 (`docs/Phase2_Master_Data.md`)

---

## Backend APIs (`/api/v1/users`)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/users` | Search, role, state, status, pagination, sorting |
| GET | `/users/:id` | Single user |
| POST | `/users` | Create user (role + optional state) |
| PATCH | `/users/:id` | Update profile/role/state/password |
| PATCH | `/users/:id/status` | Activate / deactivate |
| DELETE | `/users/:id` | Delete (cannot delete self) |

### Query params (list)
- `search`, `role`, `stateId`, `isActive`
- `page`, `limit`
- `sortBy` (`createdAt` \| `email` \| `name` \| `updatedAt`)
- `sortOrder` (`asc` \| `desc`)

### State boundaries
- **STATE_ADMIN** only sees/manages users in their assigned state
- **STATE_ADMIN** cannot see/create/edit **ADMIN** accounts
- **STATE_ADMIN** cannot change roles to ADMIN/STATE_ADMIN or move users across states
- Shared helper: `src/common/utils/state-scope.ts` (also used by state-admins)

### Permissions
- `users.read` / `users.write`
- STATE_ADMIN seed now includes `users.write`

---

## Admin UI

| Page | Route |
|------|-------|
| Users (All / Active / Inactive tabs) | `/user` |
| Active Users (sidebar shortcut) | `/user?status=active` |
| Inactive Users (sidebar shortcut) | `/user?status=inactive` |
| State Admins (from Phase 2) | `/master/state-admins` |
| States (from Phase 2) | `/master/states` |

Features: search, role filter, state filter, status toggle, pagination, add/edit/delete.

---

## Next
**Phase 4 — Service Provider Management**
