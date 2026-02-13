import { useParams, Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, ArrowLeft, AlertCircle, Store } from 'lucide-react';
import { useProductById, useVendorProfileById } from '../hooks/useMarketplaceQueries';

export default function ProductDetailPage() {
  const { productId } = useParams({ from: '/products/$productId' });
  const productIdBigInt = productId ? BigInt(productId) : undefined;
  
  const { data: product, isLoading: productLoading, error: productError } = useProductById(productIdBigInt);
  
  // Try to fetch vendor profile if we have the product
  const vendorId = product?.ownerPrincipal ? undefined : undefined; // We'll need to map principal to vendorId
  const { data: vendorProfile } = useVendorProfileById(vendorId);

  const formatPrice = (price: bigint, currency: string) => {
    const priceNum = Number(price) / 100; // Assuming price is in cents
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(priceNum);
  };

  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <Skeleton className="h-10 w-32" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <Link to="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {productError ? 'Failed to load product details.' : 'Product not found.'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <Link to="/products">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            {product.imageUrl ? (
              <div className="aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square w-full flex items-center justify-center rounded-lg border bg-muted">
                <Package className="h-24 w-24 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-3xl font-bold">{product.title}</h1>
                {product.category && (
                  <Badge variant="secondary" className="shrink-0">
                    {product.category}
                  </Badge>
                )}
              </div>
              <p className="text-3xl font-bold text-primary">
                {formatPrice(product.price, product.currency)}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <Separator />

            {/* Vendor Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Vendor Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {vendorProfile ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      {vendorProfile.logoUrl && (
                        <img
                          src={vendorProfile.logoUrl}
                          alt={vendorProfile.companyName}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{vendorProfile.companyName}</p>
                        {vendorProfile.isVerified && (
                          <Badge variant="outline" className="text-xs">
                            Verified Vendor
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Vendor: {product.ownerPrincipal.toString().slice(0, 10)}...
                  </p>
                )}
              </CardContent>
            </Card>

            <Alert>
              <AlertDescription>
                This is a marketplace listing. Contact the vendor directly for purchase inquiries.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
}
