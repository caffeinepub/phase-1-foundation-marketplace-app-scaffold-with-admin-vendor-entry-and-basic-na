# Multi-Vendor Marketplace

## Current State
- Organizations are fully stored on-chain via the Motoko backend (`createOrganization`, `deleteOrganization`, `assignVendorToOrg`, `removeVendorFromOrg`).
- The frontend `useUpdateOrganization` hook exists but throws `"updateOrganization not yet supported"` because no backend method exists.
- The Admin Dashboard has no edit UI for organizations — only create and delete.
- Vendors can be assigned/removed from orgs but org metadata (name, description, logoUrl) cannot be changed after creation.

## Requested Changes (Diff)

### Add
- `updateOrganization(id, name, description, logoUrl)` backend method in `main.mo`, restricted to App Owner or Admin.
- Edit dialog in the Admin Dashboard Organizations section — pre-populated with existing org data, triggered by an "Edit" button on each org card.
- Stable storage already covers organizations; no new stable vars needed.

### Modify
- `useUpdateOrganization` hook in `useOrganizations.ts` — replace the stub with a real backend call using the new `updateOrganization` actor method.
- Admin Dashboard (`AdminPlaceholderPage.tsx`) — add Edit button per org card, edit dialog state, and wire the `useUpdateOrganization` mutation.

### Remove
- The `throw new Error("updateOrganization not yet supported")` stub in `useUpdateOrganization`.

## Implementation Plan
1. Add `updateOrganization(id: OrganizationId, name: Text, description: Text, logoUrl: Text) : async ()` to `main.mo`, guarded by `isAppOwnerOrAdmin`.
2. Update `useUpdateOrganization` in `useOrganizations.ts` to call `actor.updateOrganization(...)` and invalidate the organizations query on success.
3. Add edit state (open flag, form fields) to `AdminPlaceholderPage.tsx`.
4. Add an "Edit" button to each org card that opens a pre-filled dialog.
5. Wire the dialog's Save button to `useUpdateOrganization`.
6. Validate, build, and deploy.
