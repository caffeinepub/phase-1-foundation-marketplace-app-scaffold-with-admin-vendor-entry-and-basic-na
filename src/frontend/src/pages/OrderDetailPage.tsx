import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link, useParams } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Package } from "lucide-react";
import type { OrderStatus } from "../backend";
import RequireAuth from "../components/auth/RequireAuth";
import { useOrderById } from "../hooks/useMarketplaceQueries";

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

function OrderDetailContent({ orderIdStr }: { orderIdStr: string }) {
  let orderId: bigint | undefined;
  try {
    orderId = BigInt(orderIdStr);
  } catch {
    orderId = undefined;
  }

  const { data: order, isLoading, error } = useOrderById(orderId);

  const statusConfig = order
    ? getStatusConfig(order.status as OrderStatus)
    : null;

  const subtotal =
    order?.items.reduce(
      (sum, item) =>
        sum + BigInt(Math.round(Number(item.price) * Number(item.quantity))),
      BigInt(0),
    ) ?? BigInt(0);

  return (
    <div data-ocid="order_detail.page" className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back button */}
        <div>
          <Link to="/orders">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 -ml-2"
              data-ocid="order_detail.back_button"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div data-ocid="order_detail.loading_state" className="space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24 ml-auto" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error / not-found state */}
        {!isLoading && (error || order === null || orderId === undefined) && (
          <Alert variant="destructive" data-ocid="order_detail.error_state">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {orderId === undefined
                ? "Invalid order ID."
                : order === null
                  ? "Order not found. It may have been removed or you may not have permission to view it."
                  : "Failed to load order details. Please try again later."}
            </AlertDescription>
          </Alert>
        )}

        {/* Order detail */}
        {!isLoading && !error && order !== null && order && statusConfig && (
          <>
            {/* Order header */}
            <div data-ocid="order_detail.section" className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold">Order Detail</h1>
                <Badge
                  variant={statusConfig.variant}
                  className={`${statusConfig.className} text-sm`}
                >
                  {statusConfig.label}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                <span>
                  <span className="font-medium text-foreground">Order ID:</span>{" "}
                  <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                    #{order.id.toString()}
                  </code>
                </span>
                <span>
                  <span className="font-medium text-foreground">Placed:</span>{" "}
                  {formatDate(order.createdAt)}
                </span>
                {order.updatedAt !== order.createdAt && (
                  <span>
                    <span className="font-medium text-foreground">
                      Updated:
                    </span>{" "}
                    {formatDate(order.updatedAt)}
                  </span>
                )}
              </div>
            </div>

            {/* Items table */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Order Items ({order.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Line Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item, idx) => (
                      <TableRow
                        key={`${item.productId.toString()}-${idx}`}
                        data-ocid={`order_detail.item.${idx + 1}`}
                      >
                        <TableCell>
                          <Link
                            to="/products/$productId"
                            params={{ productId: item.productId.toString() }}
                            className="font-medium hover:text-primary transition-colors hover:underline"
                          >
                            {item.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatPrice(item.price, item.currency)}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.quantity.toString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPrice(
                            BigInt(
                              Math.round(
                                Number(item.price) * Number(item.quantity),
                              ),
                            ),
                            item.currency,
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Order summary */}
            <Card data-ocid="order_detail.panel">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal, order.currency)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPrice(order.totalAmount, order.currency)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { orderId } = useParams({ from: "/orders/$orderId" });

  return (
    <RequireAuth>
      <OrderDetailContent orderIdStr={orderId} />
    </RequireAuth>
  );
}
