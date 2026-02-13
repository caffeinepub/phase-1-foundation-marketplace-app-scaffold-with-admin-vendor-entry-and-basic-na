// Phase 2 marketplace types (temporary until backend is updated)
import type { Principal } from '@icp-sdk/core/principal';

export type ProductId = bigint;

export interface Product {
  id: ProductId;
  ownerPrincipal: Principal;
  title: string;
  description: string;
  price: bigint;
  currency: string;
  imageUrl: string;
  category: string;
  isPublished: boolean;
  createdAt: bigint;
  updatedAt: bigint;
}
