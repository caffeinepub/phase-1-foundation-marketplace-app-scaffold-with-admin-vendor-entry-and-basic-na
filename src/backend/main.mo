import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Auth "authorization/access-control";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import Text "mo:core/Text";
import Migration "migration";

(with migration = Migration.run)
actor {
  /// User Profile Types
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  /// Vendor Types
  public type VendorId = Nat;

  public type VendorProfile = {
    id : VendorId;
    user : Principal;
    companyName : Text;
    logoUrl : Text;
    isVerified : Bool;
  };

  var lastVendorId = 0;
  let vendors = Map.empty<VendorId, VendorProfile>();

  let accessControlState = Auth.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Functions
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

  // Get Vendor Count - Public access
  public query ({ caller }) func getTotalVendorCount() : async Nat {
    vendors.size();
  };

  // Create Vendor Profile - Users only
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

  // Get All Vendors - Public access
  public query ({ caller }) func getAllVendorProfiles() : async [VendorProfile] {
    let vendorProfiles = vendors.values().toArray();
    vendorProfiles;
  };

  // Get Vendor by ID - Public access
  public query ({ caller }) func getVendorProfile(vendorId : VendorId) : async ?VendorProfile {
    vendors.get(vendorId);
  };

  // Update Vendor Profile - Owner only
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

  // Verify Vendor - Admin only
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
};

