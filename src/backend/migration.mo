import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Auth "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Iter "mo:core/Iter";

module {
  type VendorId = Nat;
  type ProductId = Nat;
  type Money = Nat;
  type Timestamp = Int;
  type OrganizationId = Nat;

  type ProductCurrency = Text;
  type Name = Text;
  type Url = Text;

  type VendorProfile = {
    id : VendorId;
    user : Principal;
    companyName : Name;
    logoUrl : Url;
    isVerified : Bool;
  };

  type CartItem = {
    productId : ProductId;
    quantity : Nat;
  };

  type Product = {
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

  type Organization = {
    id : OrganizationId;
    name : Text;
    description : Text;
    logoUrl : Text;
    adminPrincipal : Principal;
    createdAt : Timestamp;
    vendorIds : [VendorId];
  };

  type OldActor = {
    stableVendors : [(VendorId, VendorProfile)];
    stableProducts : [(ProductId, Product)];
    stableUserProfiles : [(Principal, { name : Text })];
    stableAdminAllowlist : [(Principal, Bool)];
    stableAppOwner : ?Principal;
    stableLastVendorId : Nat;
    stableLastProductId : Nat;
    stableOrders : [(OrderId, Order)];
    stableCarts : [(Principal, [CartItem])];
    stableLastOrderId : OrderId;
  };

  type NewActor = {
    stableVendors : [(VendorId, VendorProfile)];
    stableProducts : [(ProductId, Product)];
    stableUserProfiles : [(Principal, { name : Text })];
    stableAdminAllowlist : [(Principal, Bool)];
    stableAppOwner : ?Principal;
    stableLastVendorId : Nat;
    stableLastProductId : Nat;
    stableOrders : [(OrderId, Order)];
    stableCarts : [(Principal, [CartItem])];
    stableLastOrderId : OrderId;
    stableOrganizations : [(OrganizationId, Organization)];
    stableLastOrgId : OrganizationId;
  };

  public func run(old : OldActor) : NewActor {
    { old with stableOrganizations = []; stableLastOrgId = 0 };
  };
};
