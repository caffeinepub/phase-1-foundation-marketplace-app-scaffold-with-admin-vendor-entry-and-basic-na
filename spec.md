# Multi-Vendor Marketplace

## Current State

The backend (`main.mo` v2.2.0) has full CRUD for vendors, products, user profiles, admin allowlist, and app owner. All state lives in regular mutable `var` and `Map` — none of it survives a canister upgrade. The frontend is fully wired to all existing APIs.

## Requested Changes (Diff)

### Add
- `stable var` declarations for every piece of backend state: `stableVendors`, `stableProducts`, `stableUserProfiles`, `stableAdminAllowlist`, `stableAppOwner`, `stableLastVendorId`, `stableLastProductId`, `stableAccessControlRoles`.
- `system func preupgrade()` — copies all in-memory Maps and vars into the stable vars before each upgrade.
- `system func postupgrade()` — no-op body (Maps are re-loaded from stable vars during actor construction).
- In-memory Maps initialised from stable vars at actor construction time using `Map.fromIter`.
- Bump `version` to `"2.3.0"` and bump `getUpgradeSummary` version field to `3`.

### Modify
- All in-memory `var` declarations for `vendors`, `products`, `userProfiles`, `adminAllowlist`, `appOwner`, `lastVendorId`, `lastProductId` must be loaded from their stable counterparts at startup.
- `accessControlState.userRoles` and `adminAssigned` restored from `stableAccessControlRoles` at startup.

### Remove
- Nothing — all existing APIs, types, and logic remain unchanged.

## Implementation Plan

1. Add eight `stable var` declarations above the in-memory state block.
2. Change in-memory `var` initialisers to use `Map.fromIter` over the matching stable var.
3. Restore `appOwner` and `accessControlState` from stable vars at startup.
4. Add `preupgrade` system function that serialises all Maps and vars to stable storage.
5. Add `postupgrade` system function (empty body).
6. Keep all existing query and update endpoints, types, and permission logic exactly as-is.
