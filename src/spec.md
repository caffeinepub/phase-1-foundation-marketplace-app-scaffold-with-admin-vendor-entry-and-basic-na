# Specification

## Summary
**Goal:** Make the marketplace backend upgrade-safe by persisting all critical state across canister upgrades, with a conditional migration path and minimal diagnostics.

**Planned changes:**
- Move current in-memory backend state in `backend/main.mo` into stable storage and implement `preupgrade`/`postupgrade` hooks to serialize and restore the full state (access control state, user profiles, vendors, products, ID counters, and required metadata).
- Add a conditional upgrade migration path to preserve already-deployed in-memory Map-based state when transitioning to stable persistence (create or update `backend/migration.mo` only if required by the platform policy), ensuring migration is idempotent.
- Add minimal, non-user-facing sanity checks/logging around upgrade hooks (and migration if present) using only non-sensitive diagnostics (counts/counters/version info).
- Ensure the admin-only `getUpgradeSummary` endpoint accurately reflects persisted counts and counters after upgrades, without changing its authorization behavior.

**User-visible outcome:** After a canister upgrade, existing vendor profiles and products remain available through existing APIs/UI, new vendor/product IDs continue allocating without collisions, and admins can verify preservation via the existing upgrade summary/diagnostics.
