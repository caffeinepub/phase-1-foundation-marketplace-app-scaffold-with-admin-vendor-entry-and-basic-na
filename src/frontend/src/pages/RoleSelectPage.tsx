import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
  ShoppingBag,
  User,
} from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useHasAdmin,
  useIsCallerAdmin,
  useIsCallerAppOwner,
} from "../hooks/useMarketplaceQueries";
import { useRoleMode } from "../hooks/useRoleMode";

export default function RoleSelectPage() {
  const { setRoleMode } = useRoleMode();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: isAppOwner, isLoading: isAppOwnerLoading } =
    useIsCallerAppOwner();
  const { data: hasAdmin, isLoading: hasAdminLoading } = useHasAdmin();
  const navigate = useNavigate();

  const isAuthorized = isAdmin || isAppOwner;
  const isAuthLoading = isAdminLoading || isAppOwnerLoading || hasAdminLoading;

  // Allow navigation to /admin even when not yet authorized if no admins exist yet
  // (bootstrap scenario — RequireAdmin will let them through to claim)
  const canNavigateToAdmin = isAuthorized || hasAdmin === false;

  const handleRoleSelect = (role: "admin" | "vendor" | "buyer") => {
    setRoleMode(role);
    if (role === "admin") navigate({ to: "/admin" });
    else if (role === "vendor") navigate({ to: "/vendor" });
    else navigate({ to: "/products" });
  };

  if (!identity) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Select Your Role</h1>
          <p className="text-lg text-muted-foreground">
            Choose how you'd like to access the marketplace
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card
            data-ocid="role_select.admin.card"
            className={`transition-colors ${canNavigateToAdmin || isAuthLoading ? "hover:border-primary cursor-pointer" : "opacity-60"}`}
            onClick={() =>
              canNavigateToAdmin && !isAuthLoading && handleRoleSelect("admin")
            }
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <CardTitle className="text-2xl">Admin</CardTitle>
                  {isAuthLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : isAuthorized ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Authorized
                    </Badge>
                  ) : hasAdmin === false ? (
                    <Badge variant="secondary" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Setup Required
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="gap-1 text-muted-foreground"
                    >
                      <AlertCircle className="h-3 w-3" />
                      Not Authorized
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  Manage the marketplace, vendors, and platform settings
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {isAuthLoading ? (
                <Button
                  data-ocid="role_select.admin.button"
                  className="w-full"
                  size="lg"
                  disabled
                >
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking Authorization...
                </Button>
              ) : isAuthorized ? (
                <Button
                  data-ocid="role_select.admin.button"
                  className="w-full"
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRoleSelect("admin");
                  }}
                >
                  Continue as Admin
                </Button>
              ) : hasAdmin === false ? (
                <Button
                  data-ocid="role_select.admin.button"
                  className="w-full"
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRoleSelect("admin");
                  }}
                >
                  Claim Admin Access
                </Button>
              ) : (
                <Button
                  data-ocid="role_select.admin.button"
                  className="w-full"
                  size="lg"
                  disabled
                  variant="outline"
                >
                  Admin or App Owner Access Required
                </Button>
              )}
              <div className="mt-4 text-sm text-muted-foreground space-y-1">
                <p className="font-medium">Admin capabilities:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Vendor approval and management</li>
                  <li>Admin assignment and permissions</li>
                  <li>Platform configuration</li>
                  <li>Analytics and reporting</li>
                </ul>
              </div>
              {!isAuthLoading && !isAuthorized && hasAdmin !== false && (
                <Alert
                  className="mt-4"
                  data-ocid="role_select.admin.error_state"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Your principal is not in the admin allowlist. Ask an
                    existing admin to add you, or contact the app owner for
                    access.
                  </AlertDescription>
                </Alert>
              )}
              {!isAuthLoading && hasAdmin === false && (
                <Alert
                  className="mt-4"
                  data-ocid="role_select.admin.success_state"
                >
                  <Shield className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    No admins have been set up yet. Click above to claim initial
                    admin or app owner privileges.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card
            data-ocid="role_select.vendor.card"
            className="hover:border-primary transition-colors cursor-pointer"
            onClick={() => handleRoleSelect("vendor")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <User className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Vendor</CardTitle>
              <CardDescription>
                Manage your products, orders, and vendor profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                data-ocid="role_select.vendor.button"
                className="w-full"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelect("vendor");
                }}
              >
                Continue as Vendor
              </Button>
              <div className="mt-4 text-sm text-muted-foreground space-y-1">
                <p className="font-medium">Vendor capabilities:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Product listing management</li>
                  <li>Order processing</li>
                  <li>Sales analytics</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card
            data-ocid="role_select.buyer.card"
            className="hover:border-primary transition-colors cursor-pointer"
            onClick={() => handleRoleSelect("buyer")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <ShoppingBag className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Buyer</CardTitle>
              <CardDescription>
                Browse products, add to cart, and manage your orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                data-ocid="role_select.buyer.button"
                className="w-full"
                size="lg"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRoleSelect("buyer");
                }}
              >
                Browse as Buyer
              </Button>
              <div className="mt-4 text-sm text-muted-foreground space-y-1">
                <p className="font-medium">Buyer capabilities:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Browse all products</li>
                  <li>Add to cart and checkout</li>
                  <li>View order history</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
