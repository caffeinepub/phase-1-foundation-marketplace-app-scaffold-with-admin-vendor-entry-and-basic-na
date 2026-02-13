import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { VendorProfile, VendorId } from '../backend';
import type { Product, ProductId } from '../types/marketplace';

// Public product browsing
export function usePublishedProducts() {
  const { actor, isFetching } = useActor();

  return useQuery<Product[]>({
    queryKey: ['publishedProducts'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      // Backend method not yet implemented - return empty array
      // TODO: Uncomment when backend is updated
      // return actor.getPublishedProducts();
      return [];
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
      // Backend method not yet implemented - return null
      // TODO: Uncomment when backend is updated
      // return actor.getProductById(productId);
      return null;
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

// Caller's vendor profile
export function useCallerVendorProfile() {
  const { actor, isFetching } = useActor();

  return useQuery<VendorProfile | null>({
    queryKey: ['callerVendorProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      // Backend method not yet implemented - return null
      // TODO: Uncomment when backend is updated
      // return actor.getCallerVendorProfile();
      return null;
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
      // Backend method not yet implemented - throw error
      // TODO: Uncomment when backend is updated
      // return actor.upsertCallerVendorProfile(companyName, logoUrl);
      throw new Error('Vendor profile management not yet implemented in backend');
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
      // Backend method not yet implemented - return empty array
      // TODO: Uncomment when backend is updated
      // return actor.getCallerProducts();
      return [];
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
      // Backend method not yet implemented - throw error
      // TODO: Uncomment when backend is updated
      // return actor.createProduct(
      //   product.title,
      //   product.description,
      //   product.price,
      //   product.currency,
      //   product.imageUrl,
      //   product.category,
      //   product.isPublished
      // );
      throw new Error('Product creation not yet implemented in backend');
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
      // Backend method not yet implemented - throw error
      // TODO: Uncomment when backend is updated
      // return actor.updateProduct(
      //   product.productId,
      //   product.title,
      //   product.description,
      //   product.price,
      //   product.currency,
      //   product.imageUrl,
      //   product.category,
      //   product.isPublished
      // );
      throw new Error('Product update not yet implemented in backend');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['callerProducts'] });
      queryClient.invalidateQueries({ queryKey: ['publishedProducts'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId.toString()] });
    },
  });
}
