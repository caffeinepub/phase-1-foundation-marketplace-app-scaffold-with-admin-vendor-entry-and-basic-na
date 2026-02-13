import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface BackendMetadata {
    version: string;
    environment: Environment;
}
export type Timestamp = bigint;
export type ProductId = bigint;
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
export interface Product {
    id: ProductId;
    title: string;
    isPublished: boolean;
    ownerPrincipal: Principal;
    createdAt: Timestamp;
    description: string;
    updatedAt: Timestamp;
    imageUrl: string;
    currency: string;
    category: string;
    price: bigint;
}
export enum Environment {
    dev = "dev",
    prod = "prod"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProduct(title: string, description: string, price: bigint, currency: string, imageUrl: string, category: string, isPublished: boolean): Promise<ProductId>;
    createVendorProfile(companyName: string, logoUrl: string): Promise<VendorId>;
    getAllVendorProfiles(): Promise<Array<VendorProfile>>;
    getBackendMetadata(): Promise<BackendMetadata>;
    getCallerProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCallerVendorProfile(): Promise<VendorProfile | null>;
    getProductById(productId: ProductId): Promise<Product | null>;
    getPublishedProducts(): Promise<Array<Product>>;
    getTotalVendorCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVendorProductsByPrincipal(owner: Principal): Promise<Array<Product>>;
    getVendorProductsByVendorId(vendorId: VendorId): Promise<Array<Product>>;
    getVendorProfile(vendorId: VendorId): Promise<VendorProfile | null>;
    getVendorProfileByUser(owner: Principal): Promise<VendorProfile | null>;
    getVerifiedVendorProfiles(): Promise<Array<VendorProfile>>;
    isCallerAdmin(): Promise<boolean>;
    ping(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateProduct(productId: ProductId, title: string, description: string, price: bigint, currency: string, imageUrl: string, category: string, isPublished: boolean): Promise<void>;
    updateVendorProfile(vendorId: VendorId, companyName: string, logoUrl: string): Promise<void>;
    upsertCallerVendorProfile(companyName: string, logoUrl: string): Promise<VendorId>;
    verifyVendor(vendorId: VendorId): Promise<void>;
    whoami(): Promise<Principal>;
}
