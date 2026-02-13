import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Auth "authorization/access-control";
import Debug "mo:core/Debug";

import MixinAuthorization "authorization/MixinAuthorization";

// Required for stable Map support
import Map "mo:core/Map";

actor {
  // Needed for metadata queries
  type Env = {
    #dev;
    #prod;
  };

  public type Version = Text;
  var version : Version = "2.2.0";
  var environment : Env = #prod;

  public type BackendMetadata = {
    version : Version;
    environment : Env;
  };

  public query ({ caller }) func getBackendMetadata() : async BackendMetadata {
    {
      version;
      environment;
    };
  };

  // Time constants
  let oneDayInNanos = 24 * 60 * 60 * 1_000_000_000;

  // Type definitions
  type Money = Nat;
  type ProductCurrency = Text;
  public type ProductId = Nat;
  public type VendorId = Nat;
  type Timestamp = Int;

  var accessControlState = Auth.initState();
  var appOwner : ?Principal = null;

  include MixinAuthorization(accessControlState);

  var userProfiles = Map.empty<Principal, UserProfile>();
  var vendors = Map.empty<VendorId, VendorProfile>();
  var products = Map.empty<Nat, Product>();

  var lastVendorId = 0;
  var lastProductId = 0;
  var adminAllowlist = Map.empty<Principal, Bool>();

  public type Product = {
    id : ProductId;
    ownerPrincipal : Principal;
    title : Text;
    description : Text;
    price : Money;
    currency : ProductCurrency;
    imageUrl : Text;
    category : Text;
    isPublished : Bool;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type UpgradeSummary = {
    version : Nat;
    vendorCount : Nat;
    productCount : Nat;
    lastVendorId : Nat;
    lastProductId : Nat;
  };

  type Name = Text;
  type Url = Text;

  public type VendorProfile = {
    id : VendorId;
    user : Principal;
    companyName : Name;
    logoUrl : Url;
    isVerified : Bool;
  };

  public type UserProfile = {
    name : Text;
  };

  // Helper function to check if caller is app owner or admin
  private func isAppOwnerOrAdmin(caller : Principal) : Bool {
    let isOwner = switch (appOwner) {
      case (?owner) { caller == owner };
      case (null) { false };
    };
    let isAdminInList = adminAllowlist.containsKey(caller);
    isOwner or isAdminInList;
  };

  // System hooks (upgrade support)
  public query ({ caller }) func ping() : async Bool { true };
  public query ({ caller }) func whoami() : async Principal { caller };

  // App Owner Management
  public query ({ caller }) func getAppOwner() : async ?Principal {
    appOwner;
  };

  public query ({ caller }) func isCallerAppOwner() : async Bool {
    switch (appOwner) {
      case (?owner) { caller == owner };
      case (null) { false };
    };
  };

  public shared ({ caller }) func claimAppOwner() : async () {
    switch (appOwner) {
      case (?_) {
        Runtime.trap("App owner already set. Cannot claim ownership again.");
      };
      case (null) {
        appOwner := ?caller;
      };
    };
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not Auth.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Vendor and Product queries (public for marketplace browsing)
  public query ({ caller }) func getTotalVendorCount() : async Nat {
    vendors.size();
  };

  public query ({ caller }) func getAllVendorProfiles() : async [VendorProfile] {
    if (not (Auth.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all vendor profiles");
    };
    vendors.values().toArray();
  };

  public shared ({ caller }) func addVendorProfile(profile : VendorProfile) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can directly add vendor profiles");
    };
    vendors.add(profile.id, profile);
  };

  public query ({ caller }) func getVendorProfile(vendorId : VendorId) : async ?VendorProfile {
    vendors.get(vendorId);
  };

  public query ({ caller }) func getVendorProfileByUser(owner : Principal) : async ?VendorProfile {
    switch (vendors.values().find(func(v) { v.user == owner })) {
      case (null) { null };
      case (?vendor) { ?vendor };
    };
  };

  public query ({ caller }) func getVerifiedVendorProfiles() : async [VendorProfile] {
    vendors.values().filter(func(v) { v.isVerified }).toArray();
  };

  public query ({ caller }) func getProductById(productId : ProductId) : async ?Product {
    switch (products.get(productId)) {
      case (null) { null };
      case (?product) {
        if (product.isPublished or product.ownerPrincipal == caller or Auth.isAdmin(accessControlState, caller)) {
          ?product;
        } else {
          null;
        };
      };
    };
  };

  public query ({ caller }) func getPublishedProducts() : async [Product] {
    products.values().filter(func(p) { p.isPublished }).toArray();
  };

  public query ({ caller }) func getCallerProducts() : async [Product] {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their products");
    };

    products.values().filter(func(p) { p.ownerPrincipal == caller }).toArray();
  };

  public query ({ caller }) func getVendorProductsByPrincipal(owner : Principal) : async [Product] {
    products.values().filter(
      func(p) { p.ownerPrincipal == owner and p.isPublished }
    ).toArray();
  };

  public query ({ caller }) func getVendorProductsByVendorId(vendorId : VendorId) : async [Product] {
    switch (vendors.get(vendorId)) {
      case (null) { Runtime.trap("Vendor not found") };
      case (?vendor) {
        products.values().filter(
          func(p) { p.ownerPrincipal == vendor.user and p.isPublished }
        ).toArray();
      };
    };
  };

  public query ({ caller }) func getCallerVendorProfile() : async ?VendorProfile {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can get their vendor profile");
    };
    switch (vendors.values().find(func(v) { v.user == caller })) {
      case (null) { null };
      case (?vendor) { ?vendor };
    };
  };

  public shared ({ caller }) func updateVendorProfile(vendorId : VendorId, companyName : Text, logoUrl : Text) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update vendor profiles");
    };

    switch (vendors.get(vendorId)) {
      case (null) { Runtime.trap("Vendor profile not found") };
      case (?existingVendor) {
        if (existingVendor.user != caller and not Auth.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own vendor profile");
        };

        let updatedVendor : VendorProfile = {
          id = existingVendor.id;
          user = existingVendor.user;
          companyName;
          logoUrl;
          isVerified = existingVendor.isVerified;
        };

        vendors.add(vendorId, updatedVendor);
      };
    };
  };

  public shared ({ caller }) func createVendorProfile(companyName : Text, logoUrl : Text) : async VendorId {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create vendor profiles");
    };

    let vendorId = lastVendorId;
    let newVendor : VendorProfile = {
      id = vendorId;
      user = caller;
      companyName;
      logoUrl;
      isVerified = false;
    };

    vendors.add(vendorId, newVendor);
    lastVendorId += 1;
    newVendor.id;
  };

  public shared ({ caller }) func upsertCallerVendorProfile(companyName : Text, logoUrl : Text) : async VendorId {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update their vendor profile");
    };

    switch (vendors.values().toArray().find(func(v) { v.user == caller })) {
      case (null) {
        let newVendorId = lastVendorId;
        let newVendor : VendorProfile = {
          id = newVendorId;
          user = caller;
          companyName;
          logoUrl;
          isVerified = false;
        };
        vendors.add(newVendorId, newVendor);
        lastVendorId += 1;
        newVendorId;
      };
      case (?existingVendor) {
        let updatedVendor : VendorProfile = {
          id = existingVendor.id;
          user = caller;
          companyName;
          logoUrl;
          isVerified = existingVendor.isVerified;
        };
        vendors.add(existingVendor.id, updatedVendor);
        existingVendor.id;
      };
    };
  };

  public shared ({ caller }) func verifyVendor(vendorId : VendorId) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can verify vendors");
    };

    switch (vendors.get(vendorId)) {
      case (null) { Runtime.trap("Vendor profile not found") };
      case (?existingVendor) {
        let verifiedVendor : VendorProfile = {
          id = existingVendor.id;
          user = existingVendor.user;
          companyName = existingVendor.companyName;
          logoUrl = existingVendor.logoUrl;
          isVerified = true;
        };

        vendors.add(vendorId, verifiedVendor);
      };
    };
  };

  public shared ({ caller }) func createProduct(
    title : Text,
    description : Text,
    price : Nat,
    currency : Text,
    imageUrl : Text,
    category : Text,
    isPublished : Bool,
  ) : async ProductId {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create products");
    };

    let productId = lastProductId;
    lastProductId += 1;
    let now = Time.now();

    let product : Product = {
      id = productId;
      ownerPrincipal = caller;
      title;
      description;
      price;
      currency;
      imageUrl;
      category;
      isPublished;
      createdAt = now;
      updatedAt = now;
    };

    products.add(productId, product);
    productId;
  };

  public shared ({ caller }) func updateProduct(
    productId : ProductId,
    title : Text,
    description : Text,
    price : Nat,
    currency : Text,
    imageUrl : Text,
    category : Text,
    isPublished : Bool,
  ) : async () {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existingProduct) {
        if (existingProduct.ownerPrincipal != caller and not Auth.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only product owner or admin can update the product");
        };

        let updatedProduct : Product = {
          existingProduct with
          title;
          description;
          price;
          currency;
          imageUrl;
          category;
          isPublished;
          updatedAt = Time.now();
        };

        products.add(productId, updatedProduct);
      };
    };
  };

  public query ({ caller }) func getUpgradeSummary() : async UpgradeSummary {
    if (not (Auth.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access upgrade summary");
    };

    {
      version = 2;
      vendorCount = vendors.size();
      productCount = products.size();
      lastVendorId;
      lastProductId;
    };
  };

  public query ({ caller }) func listVerifiedVendors() : async [VendorProfile] {
    vendors.values().filter(func(v) { v.isVerified }).toArray();
  };

  public query ({ caller }) func listPublishedProductsByVendor(vendorPrincipal : Principal) : async [Product] {
    products.values().filter(
      func(p) { p.ownerPrincipal == vendorPrincipal and p.isPublished }
    ).toArray();
  };

  // ======= ADMIN MANAGEMENT =======
  // The adminAllowlist is the persistent source of truth for admin principals.
  // All admin operations must update both the allowlist AND the AccessControl state.

  /// Helper function to sync admin role in AccessControl state
  private func syncAdminRole(principal : Principal, isAdmin : Bool) {
    if (isAdmin) {
      Auth.assignRole(accessControlState, principal, principal, #admin);
    };
    // Note: AccessControl module doesn't provide a way to remove roles,
    // so we can only add admins to the AccessControl state.
    // The adminAllowlist remains the authoritative source.
  };

  /// Internal check (needed for bootstrap).
  public shared ({ caller }) func isAdminInternal(principal : Principal) : async Bool {
    adminAllowlist.containsKey(principal);
  };

  /// Public check (for canister to canister or frontend).
  public query ({ caller }) func isAdmin(principal : Principal) : async Bool {
    adminAllowlist.containsKey(principal);
  };

  /// Get all admin principals (guarded - app owner or admin only).
  public query ({ caller }) func getAdmins() : async [Principal] {
    if (not isAppOwnerOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only app owner or admins can view all admin profiles");
    };
    adminAllowlist.keys().toArray();
  };

  /// Set the complete admin list (guarded - app owner or admin only).
  public shared ({ caller }) func setAdmins(admins : [Principal]) : async () {
    if (not isAppOwnerOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only app owner or admins can set admin list");
    };

    if (admins.size() == 0) {
      Runtime.trap("Must provide at least one admin: Cannot have empty admin list");
    };

    adminAllowlist.clear();
    for (admin in admins.values()) {
      adminAllowlist.add(admin, true);
      syncAdminRole(admin, true);
    };
  };

  /// Add a new admin (guarded - app owner or admin only).
  public shared ({ caller }) func addAdmin(adminPrincipal : Principal) : async () {
    if (not isAppOwnerOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only app owner or admins can add new admin");
    };

    adminAllowlist.add(adminPrincipal, true);
    syncAdminRole(adminPrincipal, true);
  };

  /// Remove an admin (guarded - app owner or admin only).
  public shared ({ caller }) func removeAdmin(adminPrincipal : Principal) : async () {
    if (not isAppOwnerOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only app owner or admins can remove admin");
    };
    
    // Prevent removing the last admin
    if (adminAllowlist.size() == 1 and adminAllowlist.containsKey(adminPrincipal)) {
      Runtime.trap("Cannot remove the last admin");
    };
    
    switch (adminAllowlist.get(adminPrincipal)) {
      case (null) { Runtime.trap("Principal not in admin list") };
      case (?_) { 
        adminAllowlist.remove(adminPrincipal);
        // Note: We cannot remove the role from AccessControl state,
        // but the adminAllowlist check takes precedence in all admin operations
      };
    };
  };

  /// Bootstrap first admin when list is empty (no authorization required).
  public shared ({ caller }) func bootstrapFirstAdmin() : async () {
    if (not adminAllowlist.isEmpty()) {
      Runtime.trap("Admin already exists in canister. Use addAdmin instead.");
    };

    adminAllowlist.add(caller, true);
    syncAdminRole(caller, true);
  };

  /// Bootstrap multiple admins when list is empty (no authorization required).
  public shared ({ caller }) func bootstrapAdmins(principals : [Principal]) : async () {
    if (not adminAllowlist.isEmpty()) {
      Runtime.trap("Admin list not empty. Use setAdmins instead.");
    };

    if (principals.size() == 0) {
      Runtime.trap("Must provide at least one admin principal");
    };

    for (principal in principals.values()) {
      adminAllowlist.add(principal, true);
      syncAdminRole(principal, true);
    };
  };
};
