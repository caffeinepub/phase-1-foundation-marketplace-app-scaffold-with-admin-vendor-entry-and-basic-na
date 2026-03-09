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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Loader2,
  Package,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useMemo, useState } from "react";

const PRODUCTS_PER_PAGE = 12;
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddToCart,
  usePublishedProducts,
} from "../hooks/useMarketplaceQueries";
import { PRODUCT_PLACEHOLDER } from "../utils/placeholders";

export default function PublicProductsPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: products, isLoading, error } = usePublishedProducts();
  const addToCartMutation = useAddToCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Extract unique categories
  const categories = useMemo(() => {
    if (!products) return [];
    const uniqueCategories = new Set(
      products.map((p) => p.category).filter(Boolean),
    );
    return Array.from(uniqueCategories).sort();
  }, [products]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      const matchesSearch =
        searchQuery === "" ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * PRODUCTS_PER_PAGE,
    safePage * PRODUCTS_PER_PAGE,
  );

  const formatPrice = (price: bigint, currency: string) => {
    const priceNum = Number(price) / 100; // Assuming price is in cents
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(priceNum);
  };

  const handleProductClick = (productId: bigint) => {
    navigate({
      to: "/products/$productId",
      params: { productId: productId.toString() },
    });
  };

  const handleAddToCart = async (e: React.MouseEvent, productId: bigint) => {
    e.stopPropagation();
    setAddingProductId(productId.toString());
    try {
      await addToCartMutation.mutateAsync({ productId, quantity: 1n });
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full">
            <Package className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Product Listings</h1>
          <p className="text-lg text-muted-foreground">
            Browse products from our marketplace vendors
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={selectedCategory}
            onValueChange={(v) => {
              setSelectedCategory(v);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load products. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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

        {/* Empty State */}
        {!isLoading && !error && filteredProducts.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No products found</p>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your search or filters"
                  : "Products will appear here once vendors add them to the marketplace"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Products Grid */}
        {!isLoading && !error && filteredProducts.length > 0 && (
          <TooltipProvider>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts.map((product, index) => {
                const isAdding = addingProductId === product.id.toString();
                return (
                  <article
                    key={product.id.toString()}
                    className="group flex flex-col"
                  >
                    <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 flex flex-col">
                      <button
                        type="button"
                        onClick={() => handleProductClick(product.id)}
                        className="text-left flex-1 flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-t-lg"
                      >
                        <CardHeader className="space-y-4 flex-1">
                          <div className="aspect-video w-full overflow-hidden rounded-md bg-muted">
                            <img
                              src={product.imageUrl || PRODUCT_PLACEHOLDER}
                              alt={product.title}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                                {product.title}
                              </CardTitle>
                            </div>
                            <CardDescription className="line-clamp-2">
                              {product.description}
                            </CardDescription>
                          </div>
                        </CardHeader>
                      </button>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">
                            {formatPrice(product.price, product.currency)}
                          </span>
                          {product.category && (
                            <Badge variant="secondary">
                              {product.category}
                            </Badge>
                          )}
                        </div>
                        <Button
                          data-ocid={`products.view_details.button.${index + 1}`}
                          variant="outline"
                          className="w-full gap-2"
                          size="sm"
                          onClick={() => handleProductClick(product.id)}
                        >
                          View Details
                        </Button>
                        {identity ? (
                          <Button
                            data-ocid={`products.add_to_cart.button.${index + 1}`}
                            className="w-full gap-2"
                            size="sm"
                            disabled={isAdding}
                            onClick={(e) => handleAddToCart(e, product.id)}
                          >
                            {isAdding ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <ShoppingCart className="h-4 w-4" />
                            )}
                            {isAdding ? "Adding..." : "Add to Cart"}
                          </Button>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Button
                                  data-ocid={`products.add_to_cart.button.${index + 1}`}
                                  className="w-full gap-2"
                                  size="sm"
                                  disabled
                                >
                                  <ShoppingCart className="h-4 w-4" />
                                  Add to Cart
                                </Button>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Sign in to add to cart</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </CardContent>
                    </Card>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button
                  data-ocid="products.pagination_prev"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {safePage} of {totalPages}
                </span>
                <Button
                  data-ocid="products.pagination_next"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={safePage >= totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
