# Specification

## Summary
**Goal:** Add public backend queries for (1) checking whether the current caller is an admin and (2) checking whether any admins exist, then update the admin bootstrap UI to use these APIs without triggering authorization errors.

**Planned changes:**
- Backend: expose a new query method `isCallerAdmin() : async Bool` that returns whether the caller is in the persisted admin allowlist.
- Backend: expose a new public query method (e.g., `getAdminCount() : async Nat`) that returns the current size of the admin allowlist and does not require admin/app-owner authorization.
- Frontend: update `useMarketplaceQueries.ts` to use `actor.isCallerAdmin()` for the caller-admin check.
- Frontend: add a new React Query hook to read the admin count / “any admins exist” signal from the backend.
- Frontend: update `AdminPlaceholderPage.tsx` to decide whether to show “Claim Initial Admin” using the public admin-count signal instead of relying on admin-guarded `getAdmins()` for unauthorized users.

**User-visible outcome:** Visiting `/admin` no longer produces authorization errors just to determine bootstrap state; non-admin users can see “Claim Initial Admin” only when no admins exist, and otherwise see appropriate guidance when admins already exist.
