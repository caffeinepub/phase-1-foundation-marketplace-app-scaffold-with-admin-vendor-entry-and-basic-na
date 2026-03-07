import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";

module {
  type Money = Nat;
  type ProductCurrency = Text;
  type ProductId = Nat;
  type VendorId = Nat;
  type Timestamp = Int;
  type OrganizationId = Nat;

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

  type UserProfile = { name : Text };

  type VendorProfile = {
    id : VendorId;
    user : Principal;
    companyName : Text;
    logoUrl : Text;
    isVerified : Bool;
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
    products : Map.Map<ProductId, Product>;
    vendors : Map.Map<VendorId, VendorProfile>;
    organizations : Map.Map<OrganizationId, Organization>;
  };

  public func run(old : OldActor) : OldActor {
    old; // No state changes needed
  };
};
