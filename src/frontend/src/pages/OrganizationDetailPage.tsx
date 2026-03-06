import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  ShieldCheck,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import type { VendorId } from "../backend";
import { useVendorProfileById } from "../hooks/useMarketplaceQueries";
import { useOrganization, useOrganizations } from "../hooks/useOrganizations";
import { VENDOR_LOGO_PLACEHOLDER } from "../utils/placeholders";

function VendorCard({ vendorId }: { vendorId: string }) {
  const navigate = useNavigate();
  const vendorIdBigInt = BigInt(vendorId) as VendorId;
  const { data: vendor, isLoading } = useVendorProfileById(vendorIdBigInt);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!vendor) return null;

  return (
    <Card
      className="group hover:shadow-md transition-all duration-200 cursor-pointer border hover:border-primary/30"
      onClick={() =>
        navigate({
          to: "/vendors/$vendorId",
          params: { vendorId: vendor.id.toString() },
        })
      }
    >
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center gap-4">
          <img
            src={vendor.logoUrl || VENDOR_LOGO_PLACEHOLDER}
            alt={vendor.companyName}
            className="h-14 w-14 rounded-full object-cover border-2 border-border flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm truncate">
                {vendor.companyName}
              </p>
              {vendor.isVerified && (
                <Badge variant="default" className="gap-1 text-xs">
                  <ShieldCheck className="h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              View storefront
            </p>
          </div>
          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

function truncatePrincipal(principal: string): string {
  if (principal.length <= 20) return principal;
  return `${principal.slice(0, 10)}…${principal.slice(-8)}`;
}

export default function OrganizationDetailPage() {
  const { orgId } = useParams({ from: "/organizations/$orgId" });

  // useOrganizations drives the cache; useOrganization reads from it
  const { isLoading } = useOrganizations();
  const org = useOrganization(orgId);

  // Loading state
  if (isLoading) {
    return (
      <div data-ocid="org_detail.page" className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-9 w-48" />
          <div className="flex items-start gap-6">
            <Skeleton className="h-20 w-20 rounded-xl flex-shrink-0" />
            <div className="space-y-3 flex-1">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-1/4" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!org) {
    return (
      <div data-ocid="org_detail.page" className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/organizations" data-ocid="org_detail.back.link">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Organizations
            </Link>
          </Button>
          <Card className="border-dashed">
            <CardContent className="py-16 text-center space-y-3">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-muted mx-auto">
                <Building2 className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-lg font-semibold">Organization not found</p>
              <p className="text-sm text-muted-foreground">
                This organization may have been removed.
              </p>
              <Button asChild variant="outline" className="mt-2">
                <Link to="/organizations">Browse all organizations</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div data-ocid="org_detail.page" className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild>
          <Link to="/organizations" data-ocid="org_detail.back.link">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizations
          </Link>
        </Button>

        {/* Organization Header */}
        <div className="flex items-start gap-6">
          {org.logoUrl ? (
            <img
              src={org.logoUrl}
              alt={org.name}
              className="h-20 w-20 rounded-xl object-cover border-2 border-border flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget
                  .nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="h-20 w-20 rounded-xl bg-primary/10 flex-shrink-0 items-center justify-center"
            style={{ display: org.logoUrl ? "none" : "flex" }}
          >
            <Building2 className="h-10 w-10 text-primary" />
          </div>
          <div className="space-y-2 min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{org.name}</h1>
            {org.description && (
              <p className="text-muted-foreground">{org.description}</p>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary" className="gap-1">
                <Users className="h-3.5 w-3.5" />
                {org.vendorIds.length}{" "}
                {org.vendorIds.length === 1 ? "vendor" : "vendors"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Est. {new Date(org.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Principal Info */}
        {org.adminPrincipalText && (
          <Card className="bg-muted/40 border-muted">
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Wallet className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground">
                  Created by:
                </span>
                <code
                  className="text-xs font-mono text-foreground/80 truncate"
                  title={org.adminPrincipalText}
                >
                  {truncatePrincipal(org.adminPrincipalText)}
                </code>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vendors Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Member Vendors</h2>
          </div>

          {org.vendorIds.length === 0 ? (
            <Card
              data-ocid="org_detail.vendors.empty_state"
              className="border-dashed"
            >
              <CardContent className="py-12 text-center space-y-3">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-muted mx-auto">
                  <Store className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  No vendors have been assigned to this organization yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div
              data-ocid="org_detail.vendors.list"
              className="grid sm:grid-cols-2 gap-4"
            >
              {org.vendorIds.map((vendorId, index) => (
                <div
                  key={vendorId}
                  data-ocid={`org_detail.vendors.item.${index + 1}`}
                >
                  <VendorCard vendorId={vendorId} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
