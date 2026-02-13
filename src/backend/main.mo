import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Auth "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";
import List "mo:core/List";

(with migration = Migration.run)
actor {
  public type Environment = {
    #dev;
    #prod;
  };

  public type BackendMetadata = {
    version : Text;
    environment : Environment;
  };

  public query ({ caller }) func getBackendMetadata() : async BackendMetadata {
    {
      version = "2.1.0";
      environment = #prod;
    };
  };

  public query ({ caller }) func ping() : async Bool {
    true;
  };

  public query ({ caller }) func whoami() : async Principal {
    caller;
  };

  public type UserProfile = {
    name : Text;
  };

  let accessControlState = Auth.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
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

  public type VendorId = Nat;
  var lastVendorId = 0;

  public type VendorProfile = {
    id : VendorId;
    user : Principal;
    companyName : Text;
    logoUrl : Text;
    isVerified : Bool;
  };

  let vendors = Map.empty<VendorId, VendorProfile>();

  public query ({ caller }) func getTotalVendorCount() : async Nat {
    vendors.size();
  };

  public shared ({ caller }) func createVendorProfile(companyName : Text, logoUrl : Text) : async VendorId {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create vendor profiles");
    };

    let vendorId = lastVendorId;
    let vendorProfile : VendorProfile = {
      id = vendorId;
      user = caller;
      companyName;
      logoUrl;
      isVerified = false;
    };

    vendors.add(vendorId, vendorProfile);
    lastVendorId += 1;
    vendorProfile.id;
  };

  public query ({ caller }) func getAllVendorProfiles() : async [VendorProfile] {
    if (not (Auth.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all vendor profiles");
    };
    let vendorProfiles = vendors.values().toArray();
    vendorProfiles;
  };

  public query ({ caller }) func getVendorProfile(vendorId : VendorId) : async ?VendorProfile {
    vendors.get(vendorId);
  };

  public shared ({ caller }) func updateVendorProfile(vendorId : VendorId, companyName : Text, logoUrl : Text) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update vendor profiles");
    };

    switch (vendors.get(vendorId)) {
      case null {
        Runtime.trap("Vendor profile not found");
      };
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

  public shared ({ caller }) func verifyVendor(vendorId : VendorId) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can verify vendors");
    };

    switch (vendors.get(vendorId)) {
      case null {
        Runtime.trap("Vendor profile not found");
      };
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

  public query ({ caller }) func getVendorProfileByUser(owner : Principal) : async ?VendorProfile {
    switch (vendors.values().find(func(v) { v.user == owner })) {
      case (null) { null };
      case (?vendor) { ?vendor };
    };
  };

  public type ProductId = Nat;
  public type Timestamp = Int;

  public type Product = {
    id : ProductId;
    ownerPrincipal : Principal;
    title : Text;
    description : Text;
    price : Nat;
    currency : Text;
    imageUrl : Text;
    category : Text;
    isPublished : Bool;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  let products = Map.empty<ProductId, Product>();
  var lastProductId = 0;

  public query ({ caller }) func getVerifiedVendorProfiles() : async [VendorProfile] {
    vendors.values().filter(func(v) { v.isVerified }).toArray();
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
      case (null) {
        Runtime.trap("Product not found");
      };
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

  public query ({ caller }) func getProductById(productId : ProductId) : async ?Product {
    switch (products.get(productId)) {
      case (null) { null };
      case (?product) {
        if (product.isPublished or product.ownerPrincipal == caller or Auth.isAdmin(accessControlState, caller)) {
          ?product;
        } else {
          Runtime.trap("Unauthorized: Cannot view unpublished products");
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
      case (null) {
        Runtime.trap("Vendor not found");
      };
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

  public shared ({ caller }) func upsertCallerVendorProfile(companyName : Text, logoUrl : Text) : async VendorId {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update their vendor profile");
    };

    switch (vendors.values().toArray().find(func(v) { v.user == caller })) {
      case (null) {
        // No existing vendor profile, create a new one for this user
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
        // Update the existing vendor profile
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
};
