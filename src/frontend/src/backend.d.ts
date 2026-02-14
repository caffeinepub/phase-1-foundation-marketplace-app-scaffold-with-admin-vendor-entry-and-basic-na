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
    version: Version;
    environment: Env;
}
export type Money = bigint;
export type Timestamp = bigint;
export type Name = string;
export type Url = string;
export interface UpgradeSummary {
    lastProductId: bigint;
    productCount: bigint;
    version: bigint;
    vendorCount: bigint;
    lastVendorId: bigint;
}
export type ProductCurrency = string;
export type Version = string;
export type ProductId = bigint;
export interface VendorProfile {
    id: VendorId;
    user: Principal;
    logoUrl: Url;
    isVerified: boolean;
    companyName: Name;
}
export type VendorId = bigint;
export interface Product {
    id: ProductId;
    title: string;
    isPublished: boolean;
    ownerPrincipal: Principal;
    createdAt: Timestamp;
    description: string;
    updatedAt: Timestamp;
    imageUrl: string;
    currency: ProductCurrency;
    category: string;
    price: Money;
}
export interface UserProfile {
    name: string;
}
export enum Env {
    dev = "dev",
    prod = "prod"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAdmin(adminPrincipal: Principal): Promise<void>;
    addVendorProfile(profile: VendorProfile): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bootstrapAdmins(principals: Array<Principal>): Promise<void>;
    bootstrapFirstAdmin(): Promise<void>;
    claimAppOwner(): Promise<void>;
    createProduct(title: string, description: string, price: bigint, currency: string, imageUrl: string, category: string, isPublished: boolean): Promise<ProductId>;
    createVendorProfile(companyName: string, logoUrl: string): Promise<VendorId>;
    getAdmins(): Promise<Array<Principal>>;
    getAllVendorProfiles(): Promise<Array<VendorProfile>>;
    getAppOwner(): Promise<Principal | null>;
    getBackendMetadata(): Promise<BackendMetadata>;
    getCallerProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCallerVendorProfile(): Promise<VendorProfile | null>;
    getProductById(productId: ProductId): Promise<Product | null>;
    getPublishedProducts(): Promise<Array<Product>>;
    getTotalVendorCount(): Promise<bigint>;
    getUpgradeSummary(): Promise<UpgradeSummary>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVendorProductsByPrincipal(owner: Principal): Promise<Array<Product>>;
    getVendorProductsByVendorId(vendorId: VendorId): Promise<Array<Product>>;
    getVendorProfile(vendorId: VendorId): Promise<VendorProfile | null>;
    getVendorProfileByUser(owner: Principal): Promise<VendorProfile | null>;
    getVerifiedVendorProfiles(): Promise<Array<VendorProfile>>;
    /**
     * / Returns true if there are any admins in the system.
     */
    hasAdmin(): Promise<boolean>;
    isAdmin(principal: Principal): Promise<boolean>;
    isAdminInternal(principal: Principal): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isCallerAppOwner(): Promise<boolean>;
    listPublishedProductsByVendor(vendorPrincipal: Principal): Promise<Array<Product>>;
    listVerifiedVendors(): Promise<Array<VendorProfile>>;
    ping(): Promise<boolean>;
    removeAdmin(adminPrincipal: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAdmins(admins: Array<Principal>): Promise<void>;
    updateProduct(productId: ProductId, title: string, description: string, price: bigint, currency: string, imageUrl: string, category: string, isPublished: boolean): Promise<void>;
    updateVendorProfile(vendorId: VendorId, companyName: string, logoUrl: string): Promise<void>;
    upsertCallerVendorProfile(companyName: string, logoUrl: string): Promise<VendorId>;
    verifyVendor(vendorId: VendorId): Promise<void>;
    whoami(): Promise<Principal>;
}
