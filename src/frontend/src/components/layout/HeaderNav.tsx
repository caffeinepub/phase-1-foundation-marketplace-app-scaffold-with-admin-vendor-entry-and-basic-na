import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  Network,
  Package,
  Shield,
  ShoppingCart,
  Store,
  User,
} from "lucide-react";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import {
  useGetCart,
  useIsCallerAdmin,
  useIsCallerAppOwner,
} from "../../hooks/useMarketplaceQueries";
import { useRoleMode } from "../../hooks/useRoleMode";
import AuthControls from "../auth/AuthControls";

export default function HeaderNav() {
  const { roleMode } = useRoleMode();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: isAppOwner, isLoading: isAppOwnerLoading } =
    useIsCallerAppOwner();
  const { data: cartItems } = useGetCart();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const cartItemCount =
    identity && cartItems
      ? cartItems.reduce((sum, item) => sum + Number(item.quantity), 0)
      : 0;

  const isActive = (path: string) =>
    currentPath === path || currentPath.startsWith(`${path}/`);
  const isAuthorized = isAdmin || isAppOwner;
  const isAuthLoading = isAdminLoading || isAppOwnerLoading;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-foreground/80 transition-colors"
            >
              <Store className="h-6 w-6" />
              <span>Marketplace</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant={
                  isActive("/") && currentPath === "/" ? "secondary" : "ghost"
                }
                size="sm"
                asChild
              >
                <Link to="/">Home</Link>
              </Button>

              <Button
                variant={isActive("/products") ? "secondary" : "ghost"}
                size="sm"
                asChild
              >
                <Link to="/products">
                  <Package className="h-4 w-4 mr-2" />
                  Products
                </Link>
              </Button>

              <Button
                variant={isActive("/vendors") ? "secondary" : "ghost"}
                size="sm"
                asChild
              >
                <Link to="/vendors">
                  <Building2 className="h-4 w-4 mr-2" />
                  Vendors
                </Link>
              </Button>

              <Button
                variant={isActive("/organizations") ? "secondary" : "ghost"}
                size="sm"
                asChild
                data-ocid="nav.organizations.link"
              >
                <Link to="/organizations">
                  <Network className="h-4 w-4 mr-2" />
                  Organizations
                </Link>
              </Button>

              {identity && (
                <>
                  <Button
                    variant={isActive("/orders") ? "secondary" : "ghost"}
                    size="sm"
                    asChild
                  >
                    <Link to="/orders">Orders</Link>
                  </Button>

                  <Button
                    variant={isActive("/profile") ? "secondary" : "ghost"}
                    size="sm"
                    asChild
                    data-ocid="nav.profile.link"
                  >
                    <Link to="/profile">
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </Link>
                  </Button>

                  {isAuthLoading ? (
                    <Button variant="ghost" size="sm" disabled>
                      <Shield className="h-4 w-4 mr-2 animate-pulse" />
                      Admin
                    </Button>
                  ) : isAuthorized ? (
                    <Button
                      variant={isActive("/admin") ? "secondary" : "ghost"}
                      size="sm"
                      asChild
                    >
                      <Link to="/admin">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin
                      </Link>
                    </Button>
                  ) : (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="opacity-50"
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Admin
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            Admin or App Owner access required
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  <Button
                    variant={isActive("/vendor") ? "secondary" : "ghost"}
                    size="sm"
                    asChild
                  >
                    <Link to="/vendor">
                      <User className="h-4 w-4 mr-2" />
                      Vendor
                    </Link>
                  </Button>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {identity && (
              <Link
                to="/cart"
                data-ocid="nav.cart.link"
                className="relative flex items-center justify-center h-9 w-9 rounded-md hover:bg-secondary transition-colors"
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground leading-none">
                    {cartItemCount > 99 ? "99+" : cartItemCount}
                  </span>
                )}
              </Link>
            )}
            {roleMode && (
              <Badge variant="outline" className="hidden sm:flex">
                {roleMode === "admin" ? (
                  <>
                    <Shield className="h-3 w-3 mr-1" />
                    Admin Mode
                  </>
                ) : (
                  <>
                    <User className="h-3 w-3 mr-1" />
                    Vendor Mode
                  </>
                )}
              </Badge>
            )}
            <AuthControls />
          </div>
        </div>
      </div>
    </header>
  );
}
