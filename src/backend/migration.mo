import Map "mo:core/Map";
import Nat "mo:core/Nat";
import VendorId "mo:core/Nat";
import ProductId "mo:core/Nat";
import Auth "authorization/access-control";

module {
  type UserProfile = {
    name : Text;
  };

  type VendorProfile = {
    id : Nat;
    user : Principal;
    companyName : Text;
    logoUrl : Text;
    isVerified : Bool;
  };

  type Product = {
    id : Nat;
    ownerPrincipal : Principal;
    title : Text;
    description : Text;
    price : Nat;
    currency : Text;
    imageUrl : Text;
    category : Text;
    isPublished : Bool;
    createdAt : Int;
    updatedAt : Int;
  };

  type OldActor = {
    accessControlState : Auth.AccessControlState;
    userProfiles : Map.Map<Principal, UserProfile>;
    vendors : Map.Map<Nat, VendorProfile>;
    products : Map.Map<Nat, Product>;
    lastVendorId : Nat;
    lastProductId : Nat;
  };

  type NewActor = {
    accessControlState : Auth.AccessControlState;
    userProfiles : Map.Map<Principal, UserProfile>;
    vendors : Map.Map<Nat, VendorProfile>;
    products : Map.Map<Nat, Product>;
    lastVendorId : Nat;
    lastProductId : Nat;
  };

  public func run(old : OldActor) : NewActor { old };
};
