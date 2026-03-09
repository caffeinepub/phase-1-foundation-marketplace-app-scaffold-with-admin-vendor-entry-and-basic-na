import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Search, ShieldCheck, Store, X } from "lucide-react";
import { useMemo, useState } from "react";

const VENDORS_PER_PAGE = 9;
import { useListVerifiedVendors } from "../hooks/useMarketplaceQueries";
import { VENDOR_LOGO_PLACEHOLDER } from "../utils/placeholders";

export default function VendorsDirectoryPage() {
  const navigate = useNavigate();
  const { data: vendors, isLoading, error } = useListVerifiedVendors();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredVendors = useMemo(() => {
    if (!vendors) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter((v) => v.companyName.toLowerCase().includes(q));
  }, [vendors, searchQuery]);

  const hasVendors = !isLoading && !error && vendors && vendors.length > 0;
  const isSearchActive = searchQuery.trim().length > 0;
  const noSearchResults =
    hasVendors && isSearchActive && filteredVendors.length === 0;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredVendors.length / VENDORS_PER_PAGE),
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedVendors = filteredVendors.slice(
    (safePage - 1) * VENDORS_PER_PAGE,
    safePage * VENDORS_PER_PAGE,
  );

  const handleVendorClick = (vendorId: bigint) => {
    navigate({
      to: "/vendors/$vendorId",
      params: { vendorId: vendorId.toString() },
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Verified Vendors</h1>
          <p className="text-lg text-muted-foreground">
            Browse our trusted marketplace vendors
          </p>
        </div>

        {/* Search Bar */}
        {!isLoading && !error && vendors && vendors.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl mx-auto w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                data-ocid="vendors_directory.search_input"
                type="search"
                placeholder="Search vendors by name…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-9"
                aria-label="Search vendors"
              />
              {isSearchActive && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Count */}
        {hasVendors && isSearchActive && (
          <p
            data-ocid="vendors_directory.results_count"
            className="text-sm text-muted-foreground text-center"
            aria-live="polite"
            aria-atomic="true"
          >
            Showing{" "}
            <span className="font-medium text-foreground">
              {filteredVendors.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {vendors!.length}
            </span>{" "}
            vendor{vendors!.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Error State */}
        {error && (
          <Alert
            variant="destructive"
            data-ocid="vendors_directory.error_state"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load vendors. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && (
          <div
            data-ocid="vendors_directory.loading_state"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State — no vendors at all */}
        {!isLoading && !error && vendors && vendors.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                No verified vendors yet
              </p>
              <p className="text-muted-foreground">
                Verified vendors will appear here once they are approved by
                administrators
              </p>
            </CardContent>
          </Card>
        )}

        {/* Empty State — no search results */}
        {noSearchResults && (
          <Card data-ocid="vendors_directory.empty_state">
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">
                No vendors match your search
              </p>
              <p className="text-muted-foreground mb-6">
                No results for{" "}
                <span className="font-medium text-foreground">
                  &ldquo;{searchQuery}&rdquo;
                </span>
                . Try a different name.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
              >
                Clear search
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Vendors Grid */}
        {!isLoading && !error && filteredVendors.length > 0 && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedVendors.map((vendor, index) => (
                <Card
                  key={vendor.id.toString()}
                  data-ocid={`vendors_directory.item.${index + 1}`}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleVendorClick(vendor.id)}
                >
                  <CardHeader className="text-center space-y-4">
                    <img
                      src={vendor.logoUrl || VENDOR_LOGO_PLACEHOLDER}
                      alt={vendor.companyName}
                      className="h-20 w-20 rounded-full object-cover mx-auto border-2 border-border"
                    />
                    <div className="space-y-2">
                      <CardTitle className="text-xl">
                        {vendor.companyName}
                      </CardTitle>
                      <div className="flex items-center justify-center gap-2">
                        <Badge variant="default" className="gap-1">
                          <ShieldCheck className="h-3 w-3" />
                          Verified
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      View Storefront
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <Button
                  data-ocid="vendors.pagination_prev"
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
                  data-ocid="vendors.pagination_next"
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
          </>
        )}
      </div>
    </div>
  );
}
