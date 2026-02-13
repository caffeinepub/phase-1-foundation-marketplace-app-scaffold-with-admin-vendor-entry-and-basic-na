import { type ReactNode } from 'react';
import { Link, useMatchRoute } from '@tanstack/react-router';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, Package } from 'lucide-react';

interface VendorLayoutPageProps {
  children?: ReactNode;
}

export default function VendorLayoutPage({ children }: VendorLayoutPageProps) {
  const matchRoute = useMatchRoute();
  const isProfileRoute = matchRoute({ to: '/vendor/profile' });
  const isProductsRoute = matchRoute({ to: '/vendor/products' });

  const currentTab = isProfileRoute ? 'profile' : isProductsRoute ? 'products' : 'profile';

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Vendor Dashboard</h1>
            <p className="text-muted-foreground">Manage your store and products</p>
          </div>
        </div>

        <Tabs value={currentTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="profile" asChild>
              <Link to="/vendor/profile" className="cursor-pointer">
                <Store className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </TabsTrigger>
            <TabsTrigger value="products" asChild>
              <Link to="/vendor/products" className="cursor-pointer">
                <Package className="h-4 w-4 mr-2" />
                Products
              </Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {children}
      </div>
    </div>
  );
}
