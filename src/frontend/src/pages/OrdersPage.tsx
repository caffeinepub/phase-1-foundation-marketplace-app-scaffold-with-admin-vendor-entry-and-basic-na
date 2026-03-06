import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Package,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";
import type { Order, OrderStatus } from "../backend";
import RequireAuth from "../components/auth/RequireAuth";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerOrders } from "../hooks/useMarketplaceQueries";

function formatPrice(amount: bigint, currency: string): string {
  const num = Number(amount) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(num);
}

function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp) / 1_000_000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusConfig(status: OrderStatus): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  className: string;
} {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        variant: "outline",
        className:
          "border-yellow-400 text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30",
      };
    case "confirmed":
      return {
        label: "Confirmed",
        variant: "outline",
        className:
          "border-blue-400 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30",
      };
    case "shipped":
      return {
        label: "Shipped",
        variant: "outline",
        className:
          "border-orange-400 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30",
      };
    case "delivered":
      return {
        label: "Delivered",
        variant: "outline",
        className:
          "border-green-400 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        variant: "destructive",
        className: "",
      };
    default:
      return {
        label: String(status),
        variant: "secondary",
        className: "",
      };
  }
}

interface OrderCardProps {
  order: Order;
  index: number;
}

function OrderCard({ order, index }: OrderCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const statusConfig = getStatusConfig(order.status as OrderStatus);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card data-ocid={`orders.item.${index}`}>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-mono text-muted-foreground">
                  Order #{order.id.toString()}
                </span>
                <Badge
                  variant={statusConfig.variant}
                  className={statusConfig.className}
                >
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-lg font-bold text-primary">
                {formatPrice(order.totalAmount, order.currency)}
              </p>
              <p className="text-xs text-muted-foreground">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </CardHeader>

        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="w-full flex items-center justify-between px-6 pb-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>{isOpen ? "Hide" : "View"} order items</span>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <Separator className="mb-4" />
            <div className="space-y-3">
              {order.items.map((item, itemIndex) => (
                <div
                  key={`${item.productId.toString()}-${itemIndex}`}
                  className="flex items-center justify-between gap-4 py-2"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        to="/products/$productId"
                        params={{ productId: item.productId.toString() }}
                        className="text-sm font-medium hover:text-primary transition-colors truncate block"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(item.price, item.currency)} ×{" "}
                        {item.quantity.toString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium flex-shrink-0">
                    {formatPrice(
                      BigInt(
                        Math.round(Number(item.price) * Number(item.quantity)),
                      ),
                      item.currency,
                    )}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function OrdersPageContent() {
  const { data: orders, isLoading, error } = useCallerOrders();

  return (
    <div data-ocid="orders.page" className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">My Orders</h1>
            <p className="text-muted-foreground">Track your order history</p>
          </div>
          {orders && orders.length > 0 && (
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load your orders. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && !error && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && orders && orders.length === 0 && (
          <Card data-ocid="orders.empty_state">
            <CardContent className="py-16 flex flex-col items-center text-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-semibold">No orders yet</p>
                <p className="text-muted-foreground text-sm">
                  Once you place an order, it will appear here.
                </p>
              </div>
              <div className="flex gap-3 mt-2">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  <Package className="h-4 w-4" />
                  Browse Products
                </Link>
                <Link
                  to="/cart"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  View Cart
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders List */}
        {!isLoading && !error && orders && orders.length > 0 && (
          <div className="space-y-4">
            {orders
              .slice()
              .sort((a, b) => Number(b.createdAt) - Number(a.createdAt))
              .map((order, index) => (
                <OrderCard
                  key={order.id.toString()}
                  order={order}
                  index={index + 1}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const { identity } = useInternetIdentity();

  return <RequireAuth>{identity && <OrdersPageContent />}</RequireAuth>;
}
