# Specification

## Summary
**Goal:** Unblock error-free canister deployment by persisting all marketplace backend state across upgrades with upgrade-safe storage and hooks.

**Planned changes:**
- Move all required backend state from in-memory structures in `backend/main.mo` into stable storage so it survives upgrades (access control state, `userProfiles`, `vendors`, `products`, `lastVendorId`, `lastProductId`).
- Add `system func preupgrade()` and `system func postupgrade()` in `backend/main.mo` to round-trip all persisted state and restore in-memory structures without changing existing API behavior.
- Add a conditional migration path to preserve already-deployed in-memory Map-based state when transitioning to stable storage, creating `backend/migration.mo` only if required by the platform migration policy.
- Add minimal backend-only sanity checks/logging around upgrade hooks/migration for diagnosing upgrade issues without introducing new public APIs or changing user-facing behavior.

**User-visible outcome:** After a canister upgrade, previously created vendors, products, and user profiles remain available via existing query methods, with no UX/copy changes.
