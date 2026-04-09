import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export type OrderId = bigint;
export type Timestamp = bigint;
export type Money = bigint;
export interface BackendMetadata {
    version: Version;
    environment: Env;
}
export interface OrderItem {
    title: string;
    productId: ProductId;
    currency: string;
    quantity: bigint;
    price: Money;
}
export interface UserProfileWithPrincipal {
    principal: Principal;
    profile: UserProfile;
}
export type Name = string;
export interface Order {
    id: OrderId;
    status: OrderStatus;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    totalAmount: Money;
    currency: string;
    buyer: Principal;
    items: Array<OrderItem>;
}
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
export type OrganizationId = bigint;
export type ProductId = bigint;
export interface CartItem {
    productId: ProductId;
    quantity: bigint;
}
export interface VendorProfile {
    id: VendorId;
    user: Principal;
    logoUrl: Url;
    isVerified: boolean;
    companyName: Name;
}
export interface Organization {
    id: OrganizationId;
    adminPrincipal: Principal;
    name: string;
    createdAt: Timestamp;
    description: string;
    logoUrl: string;
    vendorIds: Array<VendorId>;
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
    currency: ProductCurrency;
    category: string;
    price: Money;
}
export type VendorId = bigint;
export enum Env {
    dev = "dev",
    prod = "prod"
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    delivered = "delivered",
    confirmed = "confirmed"
}
export interface backendInterface {
    addAdmin(adminPrincipal: Principal): Promise<void>;
    addToCart(productId: ProductId, quantity: bigint): Promise<void>;
    addVendorProfile(profile: VendorProfile): Promise<void>;
    assignVendorToOrg(orgId: OrganizationId, vendorId: VendorId): Promise<void>;
    bootstrapAdmins(principals: Array<Principal>): Promise<void>;
    bootstrapFirstAdmin(): Promise<void>;
    claimAppOwner(): Promise<void>;
    clearCart(): Promise<void>;
    createOrganization(name: string, description: string, logoUrl: string): Promise<OrganizationId>;
    createProduct(title: string, description: string, price: bigint, currency: string, imageUrl: string, category: string, isPublished: boolean): Promise<ProductId>;
    createVendorProfile(companyName: string, logoUrl: string): Promise<VendorId>;
    deleteOrganization(id: OrganizationId): Promise<void>;
    deleteProduct(productId: ProductId): Promise<void>;
    getAdmins(): Promise<Array<Principal>>;
    getAllOrders(): Promise<Array<Order>>;
    getAllOrganizations(): Promise<Array<Organization>>;
    getAllUserProfiles(): Promise<Array<UserProfileWithPrincipal>>;
    getAllVendorProfiles(): Promise<Array<VendorProfile>>;
    getAppOwner(): Promise<Principal | null>;
    getBackendMetadata(): Promise<BackendMetadata>;
    getCallerOrders(): Promise<Array<Order>>;
    getCallerProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerVendorProfile(): Promise<VendorProfile | null>;
    getCart(): Promise<Array<CartItem>>;
    getOrderById(orderId: OrderId): Promise<Order | null>;
    getOrganization(id: OrganizationId): Promise<Organization | null>;
    getProductById(productId: ProductId): Promise<Product | null>;
    getPublishedProducts(): Promise<Array<Product>>;
    getTotalOrderCount(): Promise<bigint>;
    getTotalUserCount(): Promise<bigint>;
    getTotalVendorCount(): Promise<bigint>;
    getUpgradeSummary(): Promise<UpgradeSummary>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVendorOrders(): Promise<Array<Order>>;
    getVendorOrganization(vendorId: VendorId): Promise<Organization | null>;
    getVendorProductsByPrincipal(owner: Principal): Promise<Array<Product>>;
    getVendorProductsByVendorId(vendorId: VendorId): Promise<Array<Product>>;
    getVendorProfile(vendorId: VendorId): Promise<VendorProfile | null>;
    getVendorProfileByUser(owner: Principal): Promise<VendorProfile | null>;
    getVerifiedVendorProfiles(): Promise<Array<VendorProfile>>;
    hasAdmin(): Promise<boolean>;
    isAdmin(principal: Principal): Promise<boolean>;
    isAdminInternal(principal: Principal): Promise<boolean>;
    isCallerAppOwner(): Promise<boolean>;
    isVendorSuspended(vendorId: VendorId): Promise<boolean>;
    listPublishedProductsByVendor(vendorPrincipal: Principal): Promise<Array<Product>>;
    listVerifiedVendors(): Promise<Array<VendorProfile>>;
    ping(): Promise<boolean>;
    placeOrder(): Promise<OrderId>;
    removeAdmin(adminPrincipal: Principal): Promise<void>;
    removeFromCart(productId: ProductId): Promise<void>;
    removeVendorFromOrg(orgId: OrganizationId, vendorId: VendorId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAdmins(admins: Array<Principal>): Promise<void>;
    suspendVendor(vendorId: VendorId): Promise<void>;
    unsuspendVendor(vendorId: VendorId): Promise<void>;
    unverifyVendor(vendorId: VendorId): Promise<void>;
    updateOrderStatus(orderId: OrderId, newStatus: OrderStatus): Promise<void>;
    updateOrganization(id: OrganizationId, name: string, description: string, logoUrl: string): Promise<void>;
    updateProduct(productId: ProductId, title: string, description: string, price: bigint, currency: string, imageUrl: string, category: string, isPublished: boolean): Promise<void>;
    updateVendorProfile(vendorId: VendorId, companyName: string, logoUrl: string): Promise<void>;
    upsertCallerVendorProfile(companyName: string, logoUrl: string): Promise<VendorId>;
    verifyVendor(vendorId: VendorId): Promise<void>;
    whoami(): Promise<Principal>;
}
