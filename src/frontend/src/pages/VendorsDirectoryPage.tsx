import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Store, AlertCircle, ShieldCheck } from 'lucide-react';
import { useVerifiedVendors } from '../hooks/useMarketplaceQueries';
import { VENDOR_LOGO_PLACEHOLDER } from '../utils/placeholders';

export default function VendorsDirectoryPage() {
  const navigate = useNavigate();
  const { data: vendors, isLoading, error } = useVerifiedVendors();

  const handleVendorClick = (vendorId: bigint) => {
    navigate({ to: '/vendors/$vendorId', params: { vendorId: vendorId.toString() } });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Verified Vendors</h1>
          <p className="text-lg text-muted-foreground">
            Browse our trusted marketplace vendors
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load vendors. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && vendors && vendors.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No verified vendors yet</p>
              <p className="text-muted-foreground">
                Verified vendors will appear here once they are approved by administrators
              </p>
            </CardContent>
          </Card>
        )}

        {/* Vendors Grid */}
        {!isLoading && !error && vendors && vendors.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map(vendor => (
              <Card
                key={vendor.id.toString()}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleVendorClick(vendor.id)}
              >
                <CardHeader className="text-center space-y-4">
                  <img
                    src={vendor.logoUrl || VENDOR_LOGO_PLACEHOLDER}
                    alt={vendor.companyName}
                    className="h-20 w-20 rounded-full object-cover mx-auto border-2 border-border"
                  />
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{vendor.companyName}</CardTitle>
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="default" className="gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        Verified
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    View Storefront
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
