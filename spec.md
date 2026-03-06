# Multi-Vendor Marketplace

## Current State
- Organizations are stored only in browser localStorage via `useOrganizations.ts` hooks
- Organization data (name, description, logoUrl, vendorIds, createdAt) is not persisted on the backend canister
- All other marketplace data (vendors, products, users, orders, admins, appOwner) uses stable Motoko storage with preupgrade/postupgrade hooks
- The Admin Dashboard manages organizations locally (create, delete, assign/remove vendors)
- Public OrganizationsPage and OrganizationDetailPage read from localStorage
- VendorCard in OrganizationDetailPage fetches vendor profiles via backend by vendorId

## Requested Changes (Diff)

### Add
- `Organization` type in Motoko: `{ id: Nat; name: Text; description: Text; logoUrl: Text; adminPrincipal: Principal; vendorIds: [Nat]; createdAt: Int }`
- Stable storage for organizations: `stableOrganizations : [(Nat, Organization)]` and `stableLastOrgId : Nat`
- In-memory `organizations` Map and `lastOrgId` counter, populated in preupgrade/postupgrade
- Backend query: `listOrganizations() : async [Organization]` — public, returns all
- Backend query: `getOrganization(orgId: Nat) : async ?Organization` — public
- Backend update: `createOrganization(name, description, logoUrl) : async Nat` — admin/appOwner only
- Backend update: `deleteOrganization(orgId: Nat) : async ()` — admin/appOwner only
- Backend update: `assignVendorToOrganization(orgId: Nat, vendorId: Nat) : async ()` — admin/appOwner only; enforces exclusive membership (removes vendor from any prior org first)
- Backend update: `removeVendorFromOrganization(orgId: Nat, vendorId: Nat) : async ()` — admin/appOwner only
- Backend query: `getVendorOrganization(vendorId: Nat) : async ?Organization` — public, returns the org a vendor belongs to (if any)
- `organizationCount` added to `UpgradeSummary`

### Modify
- `UpgradeSummary` type: add `organizationCount: Nat` field
- `getUpgradeSummary` implementation: include `organizationCount`
- `preupgrade` / `postupgrade` hooks: persist organizations and lastOrgId
- Frontend `useOrganizations.ts`: replace all localStorage logic with React Query hooks backed by the new backend APIs
- Frontend `AdminPlaceholderPage.tsx`: call the new backend mutation hooks for org CRUD and vendor assignment/removal
- Frontend `OrganizationsPage.tsx`: use new `useListOrganizations` hook (React Query, not localStorage)
- Frontend `OrganizationDetailPage.tsx`: use new `useGetOrganization(orgId)` hook; orgId is now a Nat stringified

### Remove
- All localStorage-based organization storage in `useOrganizations.ts`
- `generateUUID`, `readOrganizations`, `writeOrganizations` helper functions in `useOrganizations.ts`

## Implementation Plan
1. Add `Organization` type, stable vars, Map, and counter to `main.mo`
2. Implement `listOrganizations`, `getOrganization`, `createOrganization`, `deleteOrganization`, `assignVendorToOrganization`, `removeVendorFromOrganization`, `getVendorOrganization` in `main.mo`
3. Update `UpgradeSummary` and `getUpgradeSummary` to include `organizationCount`
4. Update `preupgrade`/`postupgrade` to persist organizations
5. Rewrite `useOrganizations.ts` hooks to use React Query + backend actor calls
6. Update `AdminPlaceholderPage.tsx` to use new backend-backed mutation hooks; orgId is now `bigint`
7. Update `OrganizationsPage.tsx` to use `useListOrganizations` hook
8. Update `OrganizationDetailPage.tsx` to use `useGetOrganization` hook with numeric orgId
9. Update `VendorCard` in `OrganizationDetailPage.tsx` to accept `vendorId: VendorId` (bigint) directly
