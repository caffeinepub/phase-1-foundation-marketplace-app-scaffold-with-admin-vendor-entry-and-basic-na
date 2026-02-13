import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { Store, Package, Shield, User, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AuthControls from '../auth/AuthControls';
import { useRoleMode } from '../../hooks/useRoleMode';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin, useIsCallerAppOwner } from '../../hooks/useMarketplaceQueries';

export default function HeaderNav() {
  const { roleMode } = useRoleMode();
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: isAppOwner, isLoading: isAppOwnerLoading } = useIsCallerAppOwner();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isActive = (path: string) => currentPath === path || currentPath.startsWith(path + '/');
  const isAuthorized = isAdmin || isAppOwner;
  const isAuthLoading = isAdminLoading || isAppOwnerLoading;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-foreground/80 transition-colors">
              <Store className="h-6 w-6" />
              <span>Marketplace</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              <Button
                variant={isActive('/') && currentPath === '/' ? 'secondary' : 'ghost'}
                size="sm"
                asChild
              >
                <Link to="/">Home</Link>
              </Button>
              
              <Button
                variant={isActive('/products') ? 'secondary' : 'ghost'}
                size="sm"
                asChild
              >
                <Link to="/products">
                  <Package className="h-4 w-4 mr-2" />
                  Products
                </Link>
              </Button>

              <Button
                variant={isActive('/vendors') ? 'secondary' : 'ghost'}
                size="sm"
                asChild
              >
                <Link to="/vendors">
                  <Building2 className="h-4 w-4 mr-2" />
                  Vendors
                </Link>
              </Button>

              {identity && (
                <>
                  {isAuthLoading ? (
                    <Button variant="ghost" size="sm" disabled>
                      <Shield className="h-4 w-4 mr-2 animate-pulse" />
                      Admin
                    </Button>
                  ) : isAuthorized ? (
                    <Button
                      variant={isActive('/admin') ? 'secondary' : 'ghost'}
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
                          <Button variant="ghost" size="sm" disabled className="opacity-50">
                            <Shield className="h-4 w-4 mr-2" />
                            Admin
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Admin or App Owner access required</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  <Button
                    variant={isActive('/vendor') ? 'secondary' : 'ghost'}
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
            {roleMode && (
              <Badge variant="outline" className="hidden sm:flex">
                {roleMode === 'admin' ? (
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
