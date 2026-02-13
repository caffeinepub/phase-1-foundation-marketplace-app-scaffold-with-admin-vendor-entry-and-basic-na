# Specification

## Summary
**Goal:** Let both Admins and the App Creator/Owner manage the admin allowlist, with a one-time owner claim flow, and clarify that full end-to-end user management is planned for a later phase.

**Planned changes:**
- Backend: add a persistent optional App Owner/Creator principal, with query APIs to read it and check if the caller is the owner, plus a one-time “claim owner” method when unset.
- Backend: update authorization for all admin allowlist management APIs so they are accessible to either allowlisted admins or the App Owner/Creator, with clear unauthorized errors and existing safety constraints preserved.
- Frontend: add React Query hooks to fetch the App Owner state and whether the caller is the owner, wired to backend methods.
- Frontend: update admin gating (RequireAdmin) and relevant UI copy to allow access for “Admin or App Owner”.
- Frontend: refine the Admin Dashboard admin assignment area to show the App Owner status, whether the current user is the owner, and a “Claim App Owner” action only when owner is unset; keep allowlist controls available to admins and the owner.
- Frontend: add a small “Users (Planned)” section explaining broader user lifecycle/management will be addressed in a later phase (no new user-management features implemented).

**User-visible outcome:** The App Owner/Creator can access admin allowlist management even if not already on the allowlist, can claim ownership once if unset, and the Admin Dashboard clearly indicates that comprehensive user management is planned for a later phase.
