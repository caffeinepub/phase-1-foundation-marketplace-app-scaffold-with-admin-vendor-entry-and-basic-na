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
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { Building2, Search, Users } from "lucide-react";
import { useState } from "react";
import { useOrganizations } from "../hooks/useOrganizations";

function OrganizationCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-lg flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
}

export default function OrganizationsPage() {
  const navigate = useNavigate();
  const { data: organizations = [], isLoading } = useOrganizations();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = searchQuery.trim()
    ? organizations.filter((o) =>
        o.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : organizations;

  const handleOrgClick = (orgId: string) => {
    navigate({ to: "/organizations/$orgId", params: { orgId } });
  };

  return (
    <div
      data-ocid="organizations.page"
      className="container mx-auto px-4 py-12"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight">
                Organizations
              </h1>
              {!isLoading && organizations.length > 0 && (
                <Badge variant="secondary" className="text-sm">
                  {organizations.length}{" "}
                  {organizations.length === 1
                    ? "organization"
                    : "organizations"}
                </Badge>
              )}
            </div>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Explore organizations and the vendors that belong to them across
              our marketplace.
            </p>
          </div>
        </div>

        {/* Search */}
        {(isLoading || organizations.length > 0) && (
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              data-ocid="organizations.search_input"
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <OrganizationCardSkeleton />
            <OrganizationCardSkeleton />
            <OrganizationCardSkeleton />
          </div>
        )}

        {/* Empty State — no organizations at all */}
        {!isLoading && organizations.length === 0 && (
          <Card data-ocid="organizations.empty_state" className="border-dashed">
            <CardContent className="py-16 text-center space-y-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mx-auto">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold">No organizations yet</p>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Admins can create organizations from the Admin Dashboard to
                  group vendors together.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No search results */}
        {!isLoading &&
          organizations.length > 0 &&
          filtered.length === 0 &&
          searchQuery.trim() && (
            <Card
              data-ocid="organizations.empty_state"
              className="border-dashed"
            >
              <CardContent className="py-12 text-center space-y-3">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-muted mx-auto">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-semibold">No results for "{searchQuery}"</p>
                <p className="text-sm text-muted-foreground">
                  Try a different search term.
                </p>
              </CardContent>
            </Card>
          )}

        {/* Organizations Grid */}
        {!isLoading && filtered.length > 0 && (
          <div
            data-ocid="organizations.list"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((org, index) => (
              <Card
                key={org.id}
                data-ocid={`organizations.item.${index + 1}`}
                className="group hover:shadow-lg transition-all duration-200 cursor-pointer border hover:border-primary/30"
                onClick={() => handleOrgClick(org.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-4">
                    {org.logoUrl ? (
                      <img
                        src={org.logoUrl}
                        alt={org.name}
                        className="h-14 w-14 rounded-lg object-cover border border-border flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget
                            .nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="h-14 w-14 rounded-lg bg-primary/10 flex-shrink-0 items-center justify-center"
                      style={{ display: org.logoUrl ? "none" : "flex" }}
                    >
                      <Building2 className="h-7 w-7 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                        {org.name}
                      </CardTitle>
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <Users className="h-3 w-3" />
                        {org.vendorIds.length}{" "}
                        {org.vendorIds.length === 1 ? "vendor" : "vendors"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-4">
                  {org.description && (
                    <CardDescription className="line-clamp-2 text-sm">
                      {org.description}
                    </CardDescription>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOrgClick(org.id);
                    }}
                  >
                    View Organization
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Count footer */}
        {!isLoading && filtered.length > 0 && searchQuery.trim() && (
          <p className="text-center text-sm text-muted-foreground">
            Showing {filtered.length} of {organizations.length}{" "}
            {organizations.length === 1 ? "organization" : "organizations"}
          </p>
        )}
      </div>
    </div>
  );
}
