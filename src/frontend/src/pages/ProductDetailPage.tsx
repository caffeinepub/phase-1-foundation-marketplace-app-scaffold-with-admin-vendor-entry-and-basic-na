import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';
import { useProductById, useVendorProfileByUser } from '../hooks/useMarketplaceQueries';
import { PRODUCT_PLACEHOLDER } from '../utils/placeholders';

export default function ProductDetailPage() {
  const { productId } = useParams({ strict: false });
  const navigate = useNavigate();
  
  const productIdBigInt = productId ? BigInt(productId) : undefined;
  const { data: product, isLoading: productLoading, error: productError } = useProductById(productIdBigInt);
  
  const { data: vendorProfile, isLoading: vendorLoading } = useVendorProfileByUser(
    product?.ownerPrincipal
  );

  const formatPrice = (price: bigint, currency: string) => {
    const priceNum = Number(price) / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(priceNum);
  };

  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-32" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => navigate({ to: '/products' })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
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
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate({ to: '/products' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <CardTitle className="text-3xl">{product.title}</CardTitle>
                <CardDescription className="text-base">
                  {product.description}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(product.price, product.currency)}
                </p>
                {product.category && (
                  <Badge variant="secondary" className="mt-2">
                    {product.category}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted">
              <img
                src={product.imageUrl || PRODUCT_PLACEHOLDER}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Vendor Information</h3>
              {vendorLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : vendorProfile ? (
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  {vendorProfile.logoUrl && (
                    <img
                      src={vendorProfile.logoUrl}
                      alt={vendorProfile.companyName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{vendorProfile.companyName}</p>
                      {vendorProfile.isVerified && (
                        <Badge variant="default" className="gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Vendor ID: {vendorProfile.id.toString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Vendor: {product.ownerPrincipal.toString().slice(0, 8)}...
                    {product.ownerPrincipal.toString().slice(-6)}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t pt-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                Listed on {new Date(Number(product.createdAt) / 1000000).toLocaleDateString()}
              </p>
              {product.updatedAt !== product.createdAt && (
                <p className="text-sm text-muted-foreground">
                  Last updated {new Date(Number(product.updatedAt) / 1000000).toLocaleDateString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
