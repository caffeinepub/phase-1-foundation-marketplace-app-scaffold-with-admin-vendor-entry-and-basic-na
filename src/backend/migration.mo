import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";

module {
  type UserProfile = {
    name : Text;
  };

  type VendorId = Nat;

  type VendorProfile = {
    id : VendorId;
    user : Principal;
    companyName : Text;
    logoUrl : Text;
    isVerified : Bool;
  };

  type OldActor = {
    enabled : Bool;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, UserProfile>;
    lastVendorId : Nat;
    vendors : Map.Map<VendorId, VendorProfile>;
  };

  public func run(old : OldActor) : NewActor {
    {
      userProfiles = Map.empty<Principal, UserProfile>();
      lastVendorId = 0;
      vendors = Map.empty<VendorId, VendorProfile>();
    };
  };
};
