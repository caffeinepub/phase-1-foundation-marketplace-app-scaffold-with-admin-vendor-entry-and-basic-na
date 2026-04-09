// Migration module: drops the `accessControlState` stable variable
// that was introduced by the old caffeineai-authorization mixin.
// All other stable fields are unchanged and will be inherited automatically.
import Map "mo:core/Map";

module {
  // Old types defined inline (from .old/src/backend/dist/backend.most)
  type UserRole = { #admin; #guest; #user };

  type OldActor = {
    var accessControlState : {
      var adminAssigned : Bool;
      userRoles : Map.Map<Principal, UserRole>;
    };
  };

  // No output fields needed — all other stable fields are compatible
  // and will be inherited without explicit migration.
  type NewActor = {};

  public func run(_old : OldActor) : NewActor {
    // accessControlState is consumed and discarded intentionally.
    // All other stable vars (stableVendors, adminAllowlist, etc.)
    // are compatible and inherited from the old actor automatically.
    {};
  };
};
