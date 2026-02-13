import type { Principal } from "@icp-sdk/core/principal";

export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

export interface VendorProfile {
    id: VendorId;
    user: Principal;
    logoUrl: string;
    isVerified: boolean;
    companyName: string;
}

export type VendorId = bigint;

export interface UserProfile {
    name: string;
}

export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}

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

export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createVendorProfile(companyName: string, logoUrl: string): Promise<VendorId>;
    getAllVendorProfiles(): Promise<Array<VendorProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getTotalVendorCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVendorProfile(vendorId: VendorId): Promise<VendorProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateVendorProfile(vendorId: VendorId, companyName: string, logoUrl: string): Promise<void>;
    verifyVendor(vendorId: VendorId): Promise<void>;
    
    // Phase 2: Product browsing
    getPublishedProducts(): Promise<Array<Product>>;
    getProductById(productId: ProductId): Promise<Product | null>;
    
    // Phase 2: Vendor product management
    getCallerProducts(): Promise<Array<Product>>;
    createProduct(title: string, description: string, price: bigint, currency: string, imageUrl: string, category: string, isPublished: boolean): Promise<ProductId>;
    updateProduct(productId: ProductId, title: string, description: string, price: bigint, currency: string, imageUrl: string, category: string, isPublished: boolean): Promise<void>;
    
    // Phase 2: Vendor profile caller-scoped
    getCallerVendorProfile(): Promise<VendorProfile | null>;
    upsertCallerVendorProfile(companyName: string, logoUrl: string): Promise<VendorId>;
}
