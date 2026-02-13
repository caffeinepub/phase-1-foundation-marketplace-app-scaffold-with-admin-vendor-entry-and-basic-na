import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  public type ProductId = Nat;
  public type VendorId = Nat;

  public type VendorProfile = {
    id : VendorId;
    user : Principal;
    companyName : Text;
    logoUrl : Text;
    isVerified : Bool;
  };

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
    createdAt : Int;
    updatedAt : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  public type OldActor = {
    vendors : Map.Map<Nat, VendorProfile>;
    products : Map.Map<Nat, Product>;
    userProfiles : Map.Map<Principal, UserProfile>;
    lastVendorId : Nat;
    lastProductId : Nat;
  };

  public type NewActor = {
    vendors : Map.Map<Nat, VendorProfile>;
    products : Map.Map<Nat, Product>;
    userProfiles : Map.Map<Principal, UserProfile>;
    lastVendorId : Nat;
    lastProductId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
