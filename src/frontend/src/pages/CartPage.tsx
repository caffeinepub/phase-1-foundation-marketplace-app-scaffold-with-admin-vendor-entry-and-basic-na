import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Package,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { CartItem, Product } from "../backend";
import RequireAuth from "../components/auth/RequireAuth";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useClearCart,
  useGetCart,
  usePlaceOrder,
  usePublishedProducts,
  useRemoveFromCart,
} from "../hooks/useMarketplaceQueries";
import { PRODUCT_PLACEHOLDER } from "../utils/placeholders";

function formatPrice(price: bigint, currency: string): string {
  const priceNum = Number(price) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(priceNum);
}

function formatLineTotal(
  price: bigint,
  quantity: bigint,
  currency: string,
): string {
  const total = (Number(price) / 100) * Number(quantity);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(total);
}

interface CartItemRowProps {
  cartItem: CartItem;
  product: Product | undefined;
  index: number;
  onRemove: (productId: bigint) => void;
  isRemoving: boolean;
}

function CartItemRow({
  cartItem,
  product,
  index,
  onRemove,
  isRemoving,
}: CartItemRowProps) {
  if (!product) {
    return (
      <div
        data-ocid={`cart.item.${index}`}
        className="flex items-center gap-4 py-4"
      >
        <Skeleton className="h-20 w-20 rounded-md flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div
      data-ocid={`cart.item.${index}`}
      className="flex items-start sm:items-center gap-4 py-4"
    >
      {/* Product Image */}
      <div className="h-20 w-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
        <img
          src={product.imageUrl || PRODUCT_PLACEHOLDER}
          alt={product.title}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link
          to="/products/$productId"
          params={{ productId: product.id.toString() }}
          className="font-medium hover:text-primary transition-colors line-clamp-2"
        >
          {product.title}
        </Link>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="text-sm text-muted-foreground">
            {formatPrice(product.price, product.currency)} each
          </span>
          {product.category && (
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-muted-foreground">
            Qty: {cartItem.quantity.toString()}
          </span>
        </div>
      </div>

      {/* Line Total + Remove */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span className="font-semibold text-primary">
          {formatLineTotal(product.price, cartItem.quantity, product.currency)}
        </span>
        <Button
          data-ocid={`cart.remove.button.${index}`}
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1"
          onClick={() => onRemove(cartItem.productId)}
          disabled={isRemoving}
          aria-label={`Remove ${product.title} from cart`}
        >
          {isRemoving ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <X className="h-3 w-3" />
          )}
          Remove
        </Button>
      </div>
    </div>
  );
}

interface CartPageInnerProps {
  cartItems: CartItem[];
  products: Product[] | undefined;
}

function CartPageInner({ cartItems, products }: CartPageInnerProps) {
  const navigate = useNavigate();
  const removeFromCartMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();
  const placeOrderMutation = usePlaceOrder();
  const [removingProductId, setRemovingProductId] = useState<string | null>(
    null,
  );

  const productsMap = new Map<string, Product>(
    (products ?? []).map((p) => [p.id.toString(), p]),
  );

  const handleRemove = async (productId: bigint) => {
    setRemovingProductId(productId.toString());
    try {
      await removeFromCartMutation.mutateAsync(productId);
      toast.success("Item removed from cart");
    } catch {
      toast.error("Failed to remove item. Please try again.");
    } finally {
      setRemovingProductId(null);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCartMutation.mutateAsync();
      toast.success("Cart cleared");
    } catch {
      toast.error("Failed to clear cart. Please try again.");
    }
  };

  const handlePlaceOrder = async () => {
    try {
      await placeOrderMutation.mutateAsync();
      toast.success("Order placed successfully!");
      navigate({ to: "/orders" });
    } catch {
      toast.error("Failed to place order. Please try again.");
    }
  };

  // Calculate subtotal using only items where we have product data
  const subtotal = cartItems.reduce((sum, cartItem) => {
    const product = productsMap.get(cartItem.productId.toString());
    if (!product) return sum;
    return sum + (Number(product.price) / 100) * Number(cartItem.quantity);
  }, 0);

  const subtotalCurrency = (() => {
    for (const cartItem of cartItems) {
      const product = productsMap.get(cartItem.productId.toString());
      if (product) return product.currency || "USD";
    }
    return "USD";
  })();

  const formattedSubtotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: subtotalCurrency,
  }).format(subtotal);

  if (cartItems.length === 0) {
    return (
      <Card data-ocid="cart.empty_state">
        <CardContent className="py-16 flex flex-col items-center text-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-semibold">Your cart is empty</p>
            <p className="text-muted-foreground text-sm">
              Browse our marketplace and add items to get started.
            </p>
          </div>
          <Button asChild className="mt-2 gap-2">
            <Link to="/products">
              <Package className="h-4 w-4" />
              Browse Products
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8 items-start">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart
              <Badge variant="secondary">
                {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
            <Button
              data-ocid="cart.clear.button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1"
              onClick={handleClearCart}
              disabled={clearCartMutation.isPending}
            >
              {clearCartMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Clear Cart
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-border">
              {cartItems.map((cartItem, index) => (
                <CartItemRow
                  key={cartItem.productId.toString()}
                  cartItem={cartItem}
                  product={productsMap.get(cartItem.productId.toString())}
                  index={index + 1}
                  onRemove={handleRemove}
                  isRemoving={
                    removingProductId === cartItem.productId.toString()
                  }
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Subtotal ({cartItems.length} item
                {cartItems.length !== 1 ? "s" : ""})
              </span>
              <span className="font-medium">{formattedSubtotal}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-primary">{formattedSubtotal}</span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              data-ocid="cart.place_order.button"
              className="w-full gap-2"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={placeOrderMutation.isPending}
            >
              {placeOrderMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              {placeOrderMutation.isPending
                ? "Placing Order..."
                : "Place Order"}
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/products">Continue Shopping</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function CartPageContent() {
  const {
    data: cartItems,
    isLoading: cartLoading,
    error: cartError,
  } = useGetCart();
  const { data: products, isLoading: productsLoading } = usePublishedProducts();

  const isLoading = cartLoading || productsLoading;

  return (
    <div data-ocid="cart.page" className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground">
            Review your items and place your order
          </p>
        </div>

        {/* Error State */}
        {cartError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load your cart. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && !cartError && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 py-4 border-b last:border-0"
                    >
                      <Skeleton className="h-20 w-20 rounded-md flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cart Contents */}
        {!isLoading && !cartError && cartItems && (
          <CartPageInner cartItems={cartItems} products={products} />
        )}
      </div>
    </div>
  );
}

export default function CartPage() {
  const { identity } = useInternetIdentity();

  return <RequireAuth>{identity && <CartPageContent />}</RequireAuth>;
}
