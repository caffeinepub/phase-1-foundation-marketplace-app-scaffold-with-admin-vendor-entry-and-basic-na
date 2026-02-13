import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { Store, Package, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AuthControls from '../auth/AuthControls';
import { useRoleMode } from '../../hooks/useRoleMode';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

export default function HeaderNav() {
  const { roleMode } = useRoleMode();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isActive = (path: string) => currentPath === path;

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
                variant={isActive('/') ? 'secondary' : 'ghost'}
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

              {identity && (
                <>
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
            {identity && roleMode && (
              <Badge variant="outline" className="hidden sm:flex">
                {roleMode === 'admin' ? 'Admin Mode' : 'Vendor Mode'}
              </Badge>
            )}
            <AuthControls />
          </div>
        </div>
      </div>
    </header>
  );
}
