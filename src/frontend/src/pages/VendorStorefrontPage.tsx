import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Store, Package, AlertCircle, ShieldCheck } from 'lucide-react';
import { useVendorProfileById, useVendorProducts } from '../hooks/useMarketplaceQueries';
import { PRODUCT_PLACEHOLDER, VENDOR_LOGO_PLACEHOLDER } from '../utils/placeholders';

export default function VendorStorefrontPage() {
  const { vendorId } = useParams({ strict: false });
  const navigate = useNavigate();

  const vendorIdBigInt = vendorId ? BigInt(vendorId) : undefined;
  const { data: vendor, isLoading: vendorLoading, error: vendorError } = useVendorProfileById(vendorIdBigInt);
  const { data: products, isLoading: productsLoading, error: productsError } = useVendorProducts(vendorIdBigInt);

  const formatPrice = (price: bigint, currency: string) => {
    const priceNum = Number(price) / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(priceNum);
  };

  const handleProductClick = (productId: bigint) => {
    navigate({ to: '/products/$productId', params: { productId: productId.toString() } });
  };

  // Loading state
  if (vendorLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-10 w-32" />
          <Card>
            <CardHeader className="text-center space-y-4">
              <Skeleton className="h-24 w-24 rounded-full mx-auto" />
              <Skeleton className="h-8 w-1/2 mx-auto" />
              <Skeleton className="h-4 w-1/3 mx-auto" />
            </CardHeader>
          </Card>
          <Skeleton className="h-8 w-48" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state for vendor
  if (vendorError || !vendor) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => navigate({ to: '/vendors' })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vendors
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {vendorError ? 'Failed to load vendor information.' : 'Vendor not found.'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <Button variant="ghost" onClick={() => navigate({ to: '/vendors' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vendors
        </Button>

        {/* Vendor Profile Header */}
        <Card>
          <CardHeader className="text-center space-y-4">
            <img
              src={vendor.logoUrl || VENDOR_LOGO_PLACEHOLDER}
              alt={vendor.companyName}
              className="h-24 w-24 rounded-full object-cover mx-auto border-2 border-border"
            />
            <div className="space-y-2">
              <CardTitle className="text-3xl">{vendor.companyName}</CardTitle>
              <div className="flex items-center justify-center gap-2">
                {vendor.isVerified && (
                  <Badge variant="default" className="gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Verified Vendor
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Products Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Products</h2>
          </div>

          {/* Products Error State */}
          {productsError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load products. Please try again later.
              </AlertDescription>
            </Alert>
          )}

          {/* Products Loading State */}
          {productsLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-48 w-full rounded-md" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Products Empty State */}
          {!productsLoading && !productsError && products && products.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No products available</p>
                <p className="text-muted-foreground">
                  This vendor hasn't published any products yet
                </p>
              </CardContent>
            </Card>
          )}

          {/* Products Grid */}
          {!productsLoading && !productsError && products && products.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <Card
                  key={product.id.toString()}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleProductClick(product.id)}
                >
                  <CardHeader className="space-y-4">
                    <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
                      <img
                        src={product.imageUrl || PRODUCT_PLACEHOLDER}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="line-clamp-1">{product.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {product.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(product.price, product.currency)}
                      </p>
                      {product.category && (
                        <Badge variant="secondary">{product.category}</Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product.id);
                      }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
