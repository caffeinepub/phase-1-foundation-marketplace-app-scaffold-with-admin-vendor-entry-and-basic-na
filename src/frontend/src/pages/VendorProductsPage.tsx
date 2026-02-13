import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Package, Plus, Edit, AlertCircle } from 'lucide-react';
import { useCallerProducts } from '../hooks/useMarketplaceQueries';
import VendorProductForm from '../components/vendor/VendorProductForm';
import type { Product } from '../backend';

export default function VendorProductsPage() {
  const { data: products, isLoading, error } = useCallerProducts();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const formatPrice = (price: bigint, currency: string) => {
    const priceNum = Number(price) / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(priceNum);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load your products. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Products</h2>
          <p className="text-muted-foreground">
            Manage your product listings
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
              <DialogDescription>
                Add a new product to your store
              </DialogDescription>
            </DialogHeader>
            <VendorProductForm
              onSuccess={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {products && products.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No products yet</p>
            <p className="text-muted-foreground mb-6">
              Get started by adding your first product to the marketplace
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {products?.map(product => (
            <Card key={product.id.toString()}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <CardTitle>{product.title}</CardTitle>
                      <Badge variant={product.isPublished ? 'default' : 'secondary'}>
                        {product.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      {product.category && (
                        <Badge variant="outline">{product.category}</Badge>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={editingProduct?.id === product.id} onOpenChange={(open) => {
                      if (!open) setEditingProduct(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Product</DialogTitle>
                          <DialogDescription>
                            Update your product details
                          </DialogDescription>
                        </DialogHeader>
                        <VendorProductForm
                          product={product}
                          onSuccess={() => setEditingProduct(null)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {product.imageUrl && (
                      <div className="w-20 h-20 rounded-md overflow-hidden bg-muted">
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(product.price, product.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Updated {new Date(Number(product.updatedAt) / 1000000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
