# Multi-Vendor Marketplace

## Current State
The app has a fully functional marketplace with vendors, products, cart, orders, admin dashboard, and an Organizations feature. However, Organizations are stored only in the browser's localStorage. This means org data is lost when the browser is cleared or a different device is used. All other data (vendors, products, orders, admins, app owner) is already persisted on-chain in stable Motoko variables.

## Requested Changes (Diff)

### Add
- `Organization` type in the Motoko backend with fields: id (Nat), name (Text), description (Text), logoUrl (Text), adminPrincipal (Principal), createdAt (Timestamp), vendorIds ([Nat] — stored as VendorId array)
- Stable storage variable `stableOrganizations : [(Nat, Organization)]`
- `lastOrgId` counter with stable backing
- Backend CRUD methods:
  - `createOrganization(name, description, logoUrl) : async Nat` — admin/owner only
  - `getOrganization(id: Nat) : async ?Organization` — public
  - `getAllOrganizations() : async [Organization]` — public
  - `deleteOrganization(id: Nat) : async ()` — admin/owner only
  - `assignVendorToOrg(orgId: Nat, vendorId: Nat) : async ()` — admin/owner only, exclusive (removes from other orgs)
  - `removeVendorFromOrg(orgId: Nat, vendorId: Nat) : async ()` — admin/owner only
- preupgrade/postupgrade hooks updated to persist organizations
- Frontend `Organization` type updated so `id` is `string` (stringified Nat), `vendorIds` are `string[]` (stringified VendorIds), `createdAt` is `number` (converted from Timestamp bigint)
- New frontend hook file `useOrganizations.ts` rewritten to call backend instead of localStorage

### Modify
- `main.mo` — add Organization type, stable vars, methods, update hooks
- `useOrganizations.ts` — replace localStorage adapter with backend API calls using the new backend methods
- `AdminPlaceholderPage.tsx` — no logic changes needed; the hook interface stays the same
- `OrganizationsPage.tsx` — no changes needed
- `OrganizationDetailPage.tsx` — no changes needed

### Remove
- All localStorage read/write logic in `useOrganizations.ts`
- `generateUUID()` helper (replaced by backend Nat IDs)
- `STORAGE_KEY` constant

## Implementation Plan
1. Add `Organization` type, stable vars, lastOrgId counter, CRUD methods, and updated preupgrade/postupgrade to `main.mo`
2. Rewrite `useOrganizations.ts` to use backend API calls (keep the same exported hook names and return types so all pages continue working without changes)
3. Update the frontend `Organization` type to match the backend shape
4. Validate and deploy
