# Phase 1 — Authentication & RBAC

**Status:** COMPLETE (closed gaps)  
**Date:** 2026-08-14  
**Depends on:** Phase 0 (`docs/Phase0_Audit_Checklist.md`)

---

## Checklist vs plan

| Requirement | Status |
|-------------|--------|
| User | Done |
| Role | Done |
| Permission (+ RolePermission) | Done |
| State | Done |
| UserState | Done |
| ServiceProviderAdmin | Done (placeholder for Phase 4) |
| Session | Done (linked to RefreshToken) |
| RefreshToken | Done |
| Auth APIs (register/login/refresh/logout/forgot/reset/me) | Done |
| Roles: ADMIN, STATE_ADMIN, END_USER, SERVICE_PROVIDER_ADMIN | Done |
| Backend-enforced permissions (not UI-only) | Done (`PermissionsGuard`) |
| Backend-enforced roles | Done (`RolesGuard`) |
| `/api/v1` + response envelope | Done |
| Admin login + protected routes | Done |
| Forgot / reset password UI | Done (`/forgot-password`, `/reset-password`) |
| Permissions unit tests | Done (`permissions.guard.spec.ts`) |

---

## Permission enforcement

Protected modules require both role **and** permission:

| Route group | Roles | Permissions |
|-------------|-------|-------------|
| `/dashboard/*` | ADMIN, STATE_ADMIN | `dashboard.read` |
| `/listings` GET | ADMIN, STATE_ADMIN | `listings.read` |
| `/listings` write | ADMIN, STATE_ADMIN | `listings.write` |
| `/enquiries` GET | ADMIN, STATE_ADMIN | `enquiries.read` |
| `/enquiries` write | ADMIN, STATE_ADMIN | `enquiries.write` |

`ADMIN` bypasses permission checks. Other roles must have the codes assigned via seed/RBAC.

---

## Session model

On login/register/refresh the backend creates:

1. `RefreshToken` (hashed)
2. `Session` (userAgent, ipAddress, expiresAt, linked to refresh token)

Logout revokes both.

---

## Password reset

- Token stored hashed in `PasswordResetToken`
- Email provider not wired yet — token is logged server-side
- In non-production, API may also return `data.resetToken` so the admin UI can continue the flow
- Admin pages: `/forgot-password`, `/reset-password`

---

## Default admin

```text
Email:    admin@divyaangdisha.com
Password: Admin@123
```

Seeded with primary state **Telangana** via `UserState`.

---

## Remaining non-blockers (not Phase 1 scope)

1. Real email/SMS delivery for reset tokens (needs provider — Phase 12/ops)
2. Final PDF permission matrix confirmation (open requirement from plan §35)
3. Formal Prisma migrate history cleanup (schema applied with `db push` after earlier drift)

---

## Next

**Phase 2 — Master Data** (States CRUD APIs/UI, State Admins, Categories, Subcategories, Keywords)
