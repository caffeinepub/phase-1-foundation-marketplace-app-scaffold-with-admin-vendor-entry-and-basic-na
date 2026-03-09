import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Edit,
  Loader2,
  Package,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend";
import VendorProductForm from "../components/vendor/VendorProductForm";
import {
  useCallerProducts,
  useDeleteProduct,
  useUpdateProduct,
} from "../hooks/useMarketplaceQueries";

export default function VendorProductsPage() {
  const { data: products, isLoading, error } = useCallerProducts();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const [removingProductId, setRemovingProductId] = useState<bigint | null>(
    null,
  );
  const [deletingProductId, setDeletingProductId] = useState<bigint | null>(
    null,
  );

  const handleRemoveFromStore = async (product: Product) => {
    setRemovingProductId(product.id);
    try {
      await updateProductMutation.mutateAsync({
        productId: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        currency: product.currency,
        imageUrl: product.imageUrl,
        category: product.category,
        isPublished: false,
      });
      toast.success("Product removed from store");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to remove product";
      toast.error(msg);
    } finally {
      setRemovingProductId(null);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    setDeletingProductId(product.id);
    try {
      await deleteProductMutation.mutateAsync(product.id);
      toast.success("Product deleted");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete product";
      toast.error(msg);
    } finally {
      setDeletingProductId(null);
    }
  };

  const formatPrice = (price: bigint, currency: string) => {
    const priceNum = Number(price) / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(priceNum);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
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
          <p className="text-muted-foreground">Manage your product listings</p>
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
            <VendorProductForm onSuccess={() => setIsCreateDialogOpen(false)} />
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
          {products?.map((product) => (
            <Card key={product.id.toString()}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <CardTitle>{product.title}</CardTitle>
                      <Badge
                        variant={product.isPublished ? "default" : "secondary"}
                      >
                        {product.isPublished ? "Published" : "Draft"}
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
                    <Dialog
                      open={editingProduct?.id === product.id}
                      onOpenChange={(open) => {
                        if (!open) setEditingProduct(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingProduct(product)}
                          data-ocid="vendor.product.edit_button"
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

                    {product.isPublished && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={removingProductId === product.id}
                            data-ocid="vendor.product.delete_button"
                          >
                            {removingProductId === product.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            {removingProductId === product.id
                              ? "Removing…"
                              : "Remove"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent data-ocid="vendor.product.remove.dialog">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Remove from store?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Remove this product from the store? It will become
                              a draft and no longer be publicly visible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="vendor.product.remove.cancel_button">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              data-ocid="vendor.product.remove.confirm_button"
                              onClick={() => handleRemoveFromStore(product)}
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {!product.isPublished && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={deletingProductId === product.id}
                            data-ocid="vendor.product.delete_button"
                            className="text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
                          >
                            {deletingProductId === product.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            {deletingProductId === product.id
                              ? "Deleting…"
                              : "Delete"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent data-ocid="vendor.product.delete.dialog">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Permanently delete this product?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This cannot be undone. The product will be
                              permanently removed from the marketplace.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="vendor.product.delete.cancel_button">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              data-ocid="vendor.product.delete.confirm_button"
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDeleteProduct(product)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
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
                        Updated{" "}
                        {new Date(
                          Number(product.updatedAt) / 1000000,
                        ).toLocaleDateString()}
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
