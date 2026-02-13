# Specification

## Summary
**Goal:** Replace Phase 1 placeholders with real Phase 2 vendor onboarding, vendor product management, and public product browsing backed by new Motoko backend APIs and persisted data models.

**Planned changes:**
- Add backend (single Motoko actor) data models and Candid APIs for vendor profiles and product listings, including ownership-based authorization and public-only published product browsing.
- Update the public `/products` page to fetch and render published products from the backend with basic client-side text search and category filtering, including loading/empty/error states.
- Add a public product detail route (e.g., `/products/$productId`) that fetches a product by id and displays product fields plus the vendor display name when available.
- Replace vendor-area placeholders with a protected vendor profile screen to view/edit/save the signed-in vendor’s profile (displayName required; description/logoUrl optional) with success/error feedback.
- Add protected vendor product management screens to list, create, edit, and publish/unpublish the signed-in vendor’s products, with post-mutation refresh via React Query invalidation/refetch.

**User-visible outcome:** Users can browse a real list of published products, search/filter them, and open product detail pages; signed-in vendors can complete their profile and manage their own product listings (create/edit/publish/unpublish) in the vendor area.
