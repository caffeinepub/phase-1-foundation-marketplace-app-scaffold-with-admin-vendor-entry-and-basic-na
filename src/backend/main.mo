import Int "mo:core/Int";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Auth "authorization/access-control";
import Map "mo:core/Map";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";
(with migration = Migration.run)
actor {
  type Env = {
    #dev;
    #prod;
  };

  public type Version = Text;
  var version : Version = "2.2.0 (updated)";
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

  let oneDayInNanos = 24 * 60 * 60 * 1_000_000_000;

  type Money = Nat;
  type ProductCurrency = Text;
  public type ProductId = Nat;
  public type VendorId = Nat;
  type Timestamp = Int;
  public type OrganizationId = Nat;

  type CartItem = {
    productId : ProductId;
    quantity : Nat;
  };

  type OrderStatus = {
    #pending;
    #confirmed;
    #shipped;
    #delivered;
    #cancelled;
  };

  type OrderItem = {
    productId : ProductId;
    title : Text;
    price : Money;
    currency : Text;
    quantity : Nat;
  };

  type OrderId = Nat;

  type Order = {
    id : OrderId;
    buyer : Principal;
    items : [OrderItem];
    totalAmount : Money;
    currency : Text;
    status : OrderStatus;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type Organization = {
    id : OrganizationId;
    name : Text;
    description : Text;
    logoUrl : Text;
    adminPrincipal : Principal;
    createdAt : Timestamp;
    vendorIds : [VendorId];
  };

  var accessControlState = Auth.initState();
  var appOwner : ?Principal = null;
  include MixinAuthorization(accessControlState);

  stable var stableVendors : [(Nat, VendorProfile)] = [];
  stable var stableProducts : [(Nat, Product)] = [];
  stable var stableUserProfiles : [(Principal, UserProfile)] = [];
  stable var stableAdminAllowlist : [(Principal, Bool)] = [];
  stable var stableAppOwner : ?Principal = null;
  stable var stableLastVendorId : Nat = 0;
  stable var stableLastProductId : Nat = 0;

  stable var stableOrders : [(Nat, Order)] = [];
  stable var stableCarts : [(Principal, [CartItem])] = [];
  stable var stableLastOrderId : Nat = 0;

  stable var stableOrganizations : [(Nat, Organization)] = [];
  stable var stableLastOrgId : Nat = 0;

  var userProfiles = Map.fromIter<Principal, UserProfile>(stableUserProfiles.vals());
  var vendors = Map.fromIter<VendorId, VendorProfile>(stableVendors.vals());
  var products = Map.fromIter<Nat, Product>(stableProducts.vals());
  var lastVendorId = stableLastVendorId;
  var lastProductId = stableLastProductId;
  var adminAllowlist = Map.fromIter(stableAdminAllowlist.vals());
  var carts = Map.fromIter<Principal, [CartItem]>(stableCarts.vals());
  var orders = Map.fromIter<Nat, Order>(stableOrders.vals());
  var lastOrderId = stableLastOrderId;

  var organizations = Map.fromIter<Nat, Organization>(stableOrganizations.vals());
  var lastOrgId = stableLastOrgId;

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

  public type UserProfileWithPrincipal = {
    principal : Principal;
    profile : UserProfile;
  };

  private func isAppOwnerOrAdmin(caller : Principal) : Bool {
    let isOwner = switch (appOwner) {
      case (?owner) { caller == owner };
      case (null) { false };
    };
    let isAdminInList = adminAllowlist.containsKey(caller);
    isOwner or isAdminInList;
  };

  system func preupgrade() {
    stableVendors := vendors.entries().toArray();
    stableProducts := products.entries().toArray();
    stableUserProfiles := userProfiles.entries().toArray();
    stableAdminAllowlist := adminAllowlist.entries().toArray();
    stableAppOwner := appOwner;
    stableLastVendorId := lastVendorId;
    stableLastProductId := lastProductId;
    stableCarts := carts.entries().toArray();
    stableOrders := orders.entries().toArray();
    stableLastOrderId := lastOrderId;
    stableOrganizations := organizations.entries().toArray();
    stableLastOrgId := lastOrgId;
  };

  system func postupgrade() {};

  public query ({ caller }) func ping() : async Bool { true };
  public query ({ caller }) func whoami() : async Principal { caller };
  public query ({ caller }) func getAppOwner() : async ?Principal { appOwner };

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

  public query ({ caller }) func isAdminInternal(principal : Principal) : async Bool {
    adminAllowlist.containsKey(principal);
  };

  public query ({ caller }) func isAdmin(principal : Principal) : async Bool {
    adminAllowlist.containsKey(principal);
  };

  public query ({ caller }) func hasAdmin() : async Bool {
    not adminAllowlist.isEmpty();
  };

  public query ({ caller }) func getAdmins() : async [Principal] {
    if (not isAppOwnerOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only app owner or admins can view all admin profiles");
    };
    adminAllowlist.keys().toArray();
  };

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
    };
  };

  public shared ({ caller }) func addAdmin(adminPrincipal : Principal) : async () {
    if (not isAppOwnerOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only app owner or admins can add new admin");
    };

    adminAllowlist.add(adminPrincipal, true);
  };

  public shared ({ caller }) func removeAdmin(adminPrincipal : Principal) : async () {
    if (not isAppOwnerOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only app owner or admins can remove admin");
    };

    if (adminAllowlist.size() == 1 and adminAllowlist.containsKey(adminPrincipal)) {
      Runtime.trap("Cannot remove the last admin");
    };

    switch (adminAllowlist.get(adminPrincipal)) {
      case (null) { Runtime.trap("Principal not in admin list") };
      case (?_) {
        adminAllowlist.remove(adminPrincipal);
      };
    };
  };

  public shared ({ caller }) func bootstrapFirstAdmin() : async () {
    if (not adminAllowlist.isEmpty()) {
      Runtime.trap("Admin already exists in canister. Use addAdmin instead.");
    };

    adminAllowlist.add(caller, true);
  };

  public shared ({ caller }) func bootstrapAdmins(principals : [Principal]) : async () {
    if (not adminAllowlist.isEmpty()) {
      Runtime.trap("Admin list not empty. Use setAdmins instead.");
    };

    if (principals.size() == 0) {
      Runtime.trap("Must provide at least one admin principal");
    };

    for (principal in principals.values()) {
      adminAllowlist.add(principal, true);
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isAppOwnerOrAdmin(caller)) {
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

  public query ({ caller }) func getAllUserProfiles() : async [UserProfileWithPrincipal] {
    if (not isAppOwnerOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can access all user profiles");
    };

    userProfiles.entries().toArray().map<(Principal, UserProfile), UserProfileWithPrincipal>(
      func((principal, profile)) {
        { principal; profile };
      }
    );
  };

  public query ({ caller }) func getTotalUserCount() : async Nat {
    userProfiles.size();
  };

  public query ({ caller }) func getTotalVendorCount() : async Nat {
    vendors.size();
  };

  public query ({ caller }) func getAllVendorProfiles() : async [VendorProfile] {
    if (not isAppOwnerOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all vendor profiles");
    };
    vendors.values().toArray();
  };

  public shared ({ caller }) func addVendorProfile(profile : VendorProfile) : async () {
    if (not isAppOwnerOrAdmin(caller)) {
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
        if (product.isPublished or product.ownerPrincipal == caller or isAppOwnerOrAdmin(caller)) {
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
        if (existingVendor.user != caller and not isAppOwnerOrAdmin(caller)) {
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
          logoUrl = logoUrl;
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
          companyName = companyName;
          logoUrl;
          isVerified = existingVendor.isVerified;
        };
        vendors.add(existingVendor.id, updatedVendor);
        existingVendor.id;
      };
    };
  };

  public shared ({ caller }) func verifyVendor(vendorId : VendorId) : async () {
    if (not isAppOwnerOrAdmin(caller)) {
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
        if (existingProduct.ownerPrincipal != caller and not isAppOwnerOrAdmin(caller)) {
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
    if (not isAppOwnerOrAdmin(caller)) {
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

  // === Cart and Order Management ===

  // Add item to cart (authenticated user only).
  public shared ({ caller }) func addToCart(productId : ProductId, quantity : Nat) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add to cart");
    };

    if (quantity == 0) {
      Runtime.trap("Quantity must be greater than 0");
    };

    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?_) {
        let existingCart = switch (carts.get(caller)) {
          case (?items) { items };
          case (null) { [] };
        };

        let updatedCart = switch (existingCart.find(func(item) { item.productId == productId })) {
          case (null) {
            existingCart.concat([
              { productId; quantity },
            ]);
          };
          case (?_) {
            existingCart.map(
              func(item) {
                if (item.productId == productId) {
                  { productId = item.productId; quantity = item.quantity + quantity };
                } else {
                  item;
                };
              }
            );
          };
        };
        carts.add(caller, updatedCart);
      };
    };
  };

  // Remove item from cart (authenticated user only).
  public shared ({ caller }) func removeFromCart(productId : ProductId) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove from cart");
    };

    let currentCart = switch (carts.get(caller)) {
      case (?items) { items };
      case (null) { Runtime.trap("Cart is empty") };
    };

    let updatedCart = currentCart.filter(func(item) { item.productId != productId });

    if (updatedCart.size() == currentCart.size()) {
      Runtime.trap("Product not found in cart");
    };

    carts.add(caller, updatedCart);
  };

  // Get caller's cart (returns empty if not logged in).
  public query ({ caller }) func getCart() : async [CartItem] {
    switch (carts.get(caller)) {
      case (?items) { items };
      case (null) { [] };
    };
  };

  // Clear cart (authenticated user only).
  public shared ({ caller }) func clearCart() : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear cart");
    };

    carts.remove(caller);
  };

  // Place order (converts cart to Order, clears cart).
  public shared ({ caller }) func placeOrder() : async OrderId {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    let cartItems = switch (carts.get(caller)) {
      case (?items) { items };
      case (null) { Runtime.trap("Cart is empty") };
    };

    if (cartItems.size() == 0) {
      Runtime.trap("Cart is empty");
    };

    var totalAmount : Money = 0;
    let orderItems = cartItems.map(
      func(cartItem) {
        switch (products.get(cartItem.productId)) {
          case (null) { Runtime.trap("Product not found: " # cartItem.productId.toText()) };
          case (?product) {
            totalAmount += product.price * cartItem.quantity;
            {
              productId = product.id;
              title = product.title;
              price = product.price;
              currency = product.currency;
              quantity = cartItem.quantity;
            };
          };
        };
      }
    );

    let newOrderId = lastOrderId;
    let timestamp = Time.now();

    let order : Order = {
      id = newOrderId;
      buyer = caller;
      items = orderItems;
      totalAmount;
      currency = "ICP";
      status = #pending;
      createdAt = timestamp;
      updatedAt = timestamp;
    };

    orders.add(newOrderId, order);
    lastOrderId += 1;
    carts.remove(caller);

    newOrderId;
  };

  // Get all orders for caller (authenticated user only).
  public query ({ caller }) func getCallerOrders() : async [Order] {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their orders");
    };
    orders.values().toArray().filter(func(order) { order.buyer == caller });
  };

  // Get order by ID (must own or be admin/appowner).
  public query ({ caller }) func getOrderById(orderId : OrderId) : async ?Order {
    switch (orders.get(orderId)) {
      case (null) { null };
      case (?order) {
        if (order.buyer == caller) {
          ?order;
        } else if (isAppOwnerOrAdmin(caller)) {
          ?order;
        } else {
          null;
        };
      };
    };
  };

  // Get all orders (admin/appowner only).
  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not isAppOwnerOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin or app owner can access all orders");
    };
    orders.values().toArray();
  };

  // Get total order count.
  public query ({ caller }) func getTotalOrderCount() : async Nat {
    orders.size();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : OrderId, newStatus : OrderStatus) : async () {
    if (not isAppOwnerOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins or owner can update order status");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : Order = {
          order with
          status = newStatus;
          updatedAt = Time.now();
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  // ========= NEW =========

  public query ({ caller }) func getVendorOrders() : async [Order] {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view their orders");
    };

    // 1. Find product IDs owned by caller
    let ownedProductIds = products.values().filter(func(product) { product.ownerPrincipal == caller }).toArray();

    // 2. If no products owned, return empty array
    if (ownedProductIds.isEmpty()) {
      return [];
    };

    // 3. Filter orders that contain at least one of the owned products
    let matchingOrders = orders.values().toArray().filter(
      func(order) {
        order.items.any(
          func(item) {
            ownedProductIds.any(
              func(product) { product.id == item.productId }
            );
          }
        );
      }
    );

    matchingOrders;
  };

  // === Organization Management ===

  public shared ({ caller }) func createOrganization(
    name : Text,
    description : Text,
    logoUrl : Text,
  ) : async OrganizationId {
    if (not isAppOwnerOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin/appowner can create organizations");
    };

    let orgId = lastOrgId;
    let newOrg : Organization = {
      id = orgId;
      name;
      description;
      logoUrl;
      adminPrincipal = caller;
      createdAt = Time.now();
      vendorIds = [];
    };

    organizations.add(orgId, newOrg);
    lastOrgId += 1;
    orgId;
  };

  // New updateOrganization method
  public shared ({ caller }) func updateOrganization(
    id : OrganizationId,
    name : Text,
    description : Text,
    logoUrl : Text,
  ) : async () {
    if (not isAppOwnerOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin or owner can update organizations");
    };

    switch (organizations.get(id)) {
      case (null) { Runtime.trap("Organization not found") };
      case (?existingOrg) {
        let updatedOrg : Organization = {
          existingOrg with
          name;
          description;
          logoUrl;
        };
        organizations.add(id, updatedOrg);
      };
    };
  };

  public query ({ caller }) func getOrganization(id : OrganizationId) : async ?Organization {
    organizations.get(id);
  };

  public query ({ caller }) func getAllOrganizations() : async [Organization] {
    organizations.values().toArray();
  };

  public shared ({ caller }) func deleteOrganization(id : OrganizationId) : async () {
    if (not isAppOwnerOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin/appowner can delete organizations");
    };

    switch (organizations.get(id)) {
      case (null) { Runtime.trap("Organization not found") };
      case (?_) {
        organizations.remove(id);
      };
    };
  };

  public shared ({ caller }) func assignVendorToOrg(orgId : OrganizationId, vendorId : VendorId) : async () {
    if (not isAppOwnerOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin/appowner can assign vendors to organizations");
    };

    // Find and remove vendorId from all organizations
    for ((id, org) in organizations.entries()) {
      if (org.vendorIds.find(func(id) { id == vendorId }) != null) {
        let updatedVendorIds = org.vendorIds.filter(func(id) { id != vendorId });
        let newOrg : Organization = {
          org with vendorIds = updatedVendorIds
        };
        organizations.add(id, newOrg);
      };
    };

    // Add vendorId to the specified organization
    switch (organizations.get(orgId)) {
      case (null) { Runtime.trap("Organization not found") };
      case (?org) {
        var vendorIdsVar : [VendorId] = org.vendorIds;
        let newOrg : Organization = {
          org with vendorIds = vendorIdsVar.concat([vendorId])
        };
        organizations.add(orgId, newOrg);
      };
    };
  };

  public shared ({ caller }) func removeVendorFromOrg(orgId : OrganizationId, vendorId : VendorId) : async () {
    if (not isAppOwnerOrAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admin/appowner can remove vendors from organizations");
    };

    switch (organizations.get(orgId)) {
      case (null) { Runtime.trap("Organization not found") };
      case (?org) {
        let updatedVendorIds = org.vendorIds.filter(func(id) { id != vendorId });
        let newOrg : Organization = {
          org with vendorIds = updatedVendorIds
        };
        organizations.add(orgId, newOrg);
      };
    };
  };

  public query ({ caller }) func getVendorOrganization(vendorId : VendorId) : async ?Organization {
    switch (organizations.values().find(func(org) { org.vendorIds.any(func(id) { id == vendorId }) })) {
      case (null) { null };
      case (?org) { ?org };
    };
  };
};
