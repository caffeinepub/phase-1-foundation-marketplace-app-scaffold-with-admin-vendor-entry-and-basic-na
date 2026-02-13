import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { VendorProfile, VendorId, Product, ProductId, UpgradeSummary } from '../backend';
import { Principal } from '@dfinity/principal';

// Public product browsing
export function usePublishedProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['publishedProducts'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getPublishedProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

// Product detail
export function useProductById(productId: ProductId | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Product | null>({
    queryKey: ['product', productId?.toString()],
    queryFn: async () => {
      if (!actor || !productId) throw new Error('Actor or productId not available');
      return actor.getProductById(productId);
    },
    enabled: !!actor && !isFetching && productId !== undefined,
  });
}

// Vendor profile by ID (for displaying vendor info on product detail)
export function useVendorProfileById(vendorId: VendorId | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<VendorProfile | null>({
    queryKey: ['vendorProfile', vendorId?.toString()],
    queryFn: async () => {
      if (!actor || vendorId === undefined) throw new Error('Actor or vendorId not available');
      return actor.getVendorProfile(vendorId);
    },
    enabled: !!actor && !isFetching && vendorId !== undefined,
  });
}

// Vendor profile by owner principal (for product detail page)
export function useVendorProfileByUser(owner: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<VendorProfile | null>({
    queryKey: ['vendorProfileByUser', owner?.toString()],
    queryFn: async () => {
      if (!actor || !owner) throw new Error('Actor or owner principal not available');
      return actor.getVendorProfileByUser(owner);
    },
    enabled: !!actor && !isFetching && !!owner,
    retry: false,
  });
}

// Phase 5: Public verified vendors list (original method)
export function useVerifiedVendors() {
  const { actor, isFetching } = useActor();

  return useQuery<VendorProfile[]>({
    queryKey: ['verifiedVendors'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getVerifiedVendorProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

// Phase 5: Public verified vendors list (new discovery API)
export function useListVerifiedVendors() {
  const { actor, isFetching } = useActor();

  return useQuery<VendorProfile[]>({
    queryKey: ['listVerifiedVendors'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.listVerifiedVendors();
    },
    enabled: !!actor && !isFetching,
  });
}

// Phase 5: Vendor's published products by vendor ID
export function useVendorProducts(vendorId: VendorId | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['vendorProducts', vendorId?.toString()],
    queryFn: async () => {
      if (!actor || vendorId === undefined) throw new Error('Actor or vendorId not available');
      return actor.getVendorProductsByVendorId(vendorId);
    },
    enabled: !!actor && !isFetching && vendorId !== undefined,
    retry: false,
  });
}

// Phase 5: Vendor's published products by principal (new discovery API)
export function useListPublishedProductsByVendor(vendorPrincipal: Principal | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['listPublishedProductsByVendor', vendorPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !vendorPrincipal) throw new Error('Actor or vendorPrincipal not available');
      return actor.listPublishedProductsByVendor(vendorPrincipal);
    },
    enabled: !!actor && !isFetching && !!vendorPrincipal,
    retry: false,
  });
}

// Caller's vendor profile
export function useCallerVendorProfile() {
  const { actor, isFetching } = useActor();

  return useQuery<VendorProfile | null>({
    queryKey: ['callerVendorProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getCallerVendorProfile();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

// Upsert caller's vendor profile
export function useUpsertCallerVendorProfile() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ companyName, logoUrl }: { companyName: string; logoUrl: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.upsertCallerVendorProfile(companyName, logoUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerVendorProfile'] });
    },
  });
}

// Caller's products
export function useCallerProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['callerProducts'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getCallerProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

// Create product
export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (product: {
      title: string;
      description: string;
      price: bigint;
      currency: string;
      imageUrl: string;
      category: string;
      isPublished: boolean;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.createProduct(
        product.title,
        product.description,
        product.price,
        product.currency,
        product.imageUrl,
        product.category,
        product.isPublished
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['callerProducts'] });
      queryClient.invalidateQueries({ queryKey: ['publishedProducts'] });
    },
  });
}

// Update product
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (product: {
      productId: ProductId;
      title: string;
      description: string;
      price: bigint;
      currency: string;
      imageUrl: string;
      category: string;
      isPublished: boolean;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateProduct(
        product.productId,
        product.title,
        product.description,
        product.price,
        product.currency,
        product.imageUrl,
        product.category,
        product.isPublished
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['callerProducts'] });
      queryClient.invalidateQueries({ queryKey: ['publishedProducts'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId.toString()] });
    },
  });
}

// Admin: Get all vendor profiles
export function useAllVendorProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<VendorProfile[]>({
    queryKey: ['allVendorProfiles'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getAllVendorProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

// Admin: Verify vendor
export function useVerifyVendor() {
  const queryClient = useQueryClient();
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (vendorId: VendorId) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.verifyVendor(vendorId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allVendorProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['verifiedVendors'] });
      queryClient.invalidateQueries({ queryKey: ['listVerifiedVendors'] });
    },
  });
}

// Admin: Check if caller is admin
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

// Admin: Get upgrade summary for diagnostics
export function useUpgradeSummary() {
  const { actor, isFetching } = useActor();

  return useQuery<UpgradeSummary>({
    queryKey: ['upgradeSummary'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getUpgradeSummary();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}
