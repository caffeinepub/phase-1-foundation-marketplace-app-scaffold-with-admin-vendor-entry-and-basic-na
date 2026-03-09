import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Loader2,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddToCart,
  useProductById,
  useVendorProfileByUser,
} from "../hooks/useMarketplaceQueries";
import { PRODUCT_PLACEHOLDER } from "../utils/placeholders";

export default function ProductDetailPage() {
  const { productId } = useParams({ strict: false });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const addToCartMutation = useAddToCart();
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const productIdBigInt = productId ? BigInt(productId) : undefined;
  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useProductById(productIdBigInt);

  const { data: vendorProfile, isLoading: vendorLoading } =
    useVendorProfileByUser(product?.ownerPrincipal);

  const formatPrice = (price: bigint, currency: string) => {
    const priceNum = Number(price) / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(priceNum);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity: BigInt(quantity),
      });
      setAddedSuccess(true);
      toast.success("Added to cart");
      setTimeout(() => setAddedSuccess(false), 3000);
    } catch {
      toast.error("Failed to add to cart. Please try again.");
    }
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
          <Button variant="ghost" onClick={() => navigate({ to: "/products" })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {productError
                ? "Failed to load product details."
                : "Product not found."}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate({ to: "/products" })}>
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
                  <Button
                    data-ocid="product_detail.visit_storefront.button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate({
                        to: "/vendors/$vendorId",
                        params: { vendorId: vendorProfile.id.toString() },
                      })
                    }
                  >
                    Visit Storefront
                  </Button>
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

            {/* Add to Cart Section */}
            <div className="border-t pt-6 space-y-4">
              <h3 className="text-lg font-semibold">Add to Cart</h3>
              {identity ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      data-ocid="product_detail.quantity.input"
                      id="quantity"
                      type="number"
                      min={1}
                      max={99}
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.max(1, Number.parseInt(e.target.value) || 1),
                        )
                      }
                      className="w-24"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      data-ocid="product_detail.add_to_cart.button"
                      className="gap-2 min-w-[160px]"
                      onClick={handleAddToCart}
                      disabled={addToCartMutation.isPending}
                    >
                      {addToCartMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : addedSuccess ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <ShoppingCart className="h-4 w-4" />
                      )}
                      {addToCartMutation.isPending
                        ? "Adding..."
                        : addedSuccess
                          ? "Added!"
                          : "Add to Cart"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    <button
                      type="button"
                      className="text-primary hover:underline font-medium"
                      onClick={() => navigate({ to: "/select-role" })}
                    >
                      Sign in
                    </button>{" "}
                    to add this item to your cart
                  </p>
                </div>
              )}
            </div>

            <div className="border-t pt-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                Listed on{" "}
                {new Date(
                  Number(product.createdAt) / 1000000,
                ).toLocaleDateString()}
              </p>
              {product.updatedAt !== product.createdAt && (
                <p className="text-sm text-muted-foreground">
                  Last updated{" "}
                  {new Date(
                    Number(product.updatedAt) / 1000000,
                  ).toLocaleDateString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
