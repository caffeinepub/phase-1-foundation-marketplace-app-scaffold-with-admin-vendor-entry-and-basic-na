# Multi-Vendor Marketplace

## Current State

The backend has `verifyVendor(vendorId)` which is one-way — it sets `isVerified = true` but there is no way to revert it or suspend a vendor. The `VendorProfile` type only has `isVerified: Bool`. The Admin Dashboard renders a vendor list with a Verify button but no Unverify or Suspend actions.

## Requested Changes (Diff)

### Add
- `stable var stableSuspendedVendors : [(VendorId, Bool)]` — separate stable map, no schema change to VendorProfile
- `var suspendedVendors` runtime map populated from stable on postupgrade
- `unverifyVendor(vendorId)` — admin/owner only, sets isVerified = false
- `suspendVendor(vendorId)` — admin/owner only, marks vendor as suspended in the suspendedVendors map
- `unsuspendVendor(vendorId)` — admin/owner only, removes vendor from suspendedVendors map
- `isVendorSuspended(vendorId)` — public query, returns Bool
- Update `listVerifiedVendors` to exclude suspended vendors
- Frontend: Unverify button (shown when vendor isVerified) and Suspend/Unsuspend toggle button in Admin vendor list

### Modify
- `preupgrade` — persist `suspendedVendors` to `stableSuspendedVendors`
- `listVerifiedVendors` — filter out suspended vendors

### Remove
- Nothing removed

## Implementation Plan

1. Part A: Edit `src/backend/main.mo` — add stable var, runtime map, four new methods, update preupgrade and listVerifiedVendors
2. Part B: Update frontend Admin vendor section — add Unverify and Suspend/Unsuspend buttons with confirmation dialogs, wire to new backend hooks
