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
import { Link } from "@tanstack/react-router";
import { AlertCircle, Building2, CheckCircle, Store } from "lucide-react";
import { useEffect, useState } from "react";
import {
  useCallerVendorProfile,
  useUpsertCallerVendorProfile,
} from "../hooks/useMarketplaceQueries";
import { useVendorOrganization } from "../hooks/useOrganizations";

export default function VendorProfilePage() {
  const {
    data: vendorProfile,
    isLoading,
    isFetched,
  } = useCallerVendorProfile();
  const upsertMutation = useUpsertCallerVendorProfile();

  const vendorIdStr = vendorProfile ? vendorProfile.id.toString() : "";
  const vendorOrg = useVendorOrganization(vendorIdStr);

  const [companyName, setCompanyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  // Update form state when vendor profile is loaded or changes
  useEffect(() => {
    if (vendorProfile) {
      setCompanyName(vendorProfile.companyName);
      setLogoUrl(vendorProfile.logoUrl);
    } else if (isFetched && !vendorProfile) {
      // First-time vendor with no profile - initialize with empty values
      setCompanyName("");
      setLogoUrl("");
    }
  }, [vendorProfile, isFetched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      return;
    }

    try {
      await upsertMutation.mutateAsync({
        companyName: companyName.trim(),
        logoUrl: logoUrl.trim(),
      });
    } catch (error) {
      console.error("Failed to save vendor profile:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {upsertMutation.isSuccess && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Vendor profile saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {upsertMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to save vendor profile. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            <CardTitle>Vendor Profile</CardTitle>
          </div>
          <CardDescription>
            {vendorProfile
              ? "Manage your store information and branding"
              : "Create your vendor profile to start selling"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter your company name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL (optional)</Label>
              <Input
                id="logoUrl"
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-sm text-muted-foreground">
                Provide a URL to your company logo image
              </p>
            </div>

            {logoUrl && (
              <div className="space-y-2">
                <Label>Logo Preview</Label>
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="h-16 w-16 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <p className="text-sm text-muted-foreground">
                    This is how your logo will appear to customers
                  </p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={upsertMutation.isPending || !companyName.trim()}
            >
              {upsertMutation.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Organization Membership Card */}
      {vendorProfile && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Organization</CardTitle>
            </div>
            <CardDescription>
              Your organization membership in the marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vendorOrg ? (
              <div className="flex items-center gap-3">
                {vendorOrg.logoUrl ? (
                  <img
                    src={vendorOrg.logoUrl}
                    alt={vendorOrg.name}
                    className="h-10 w-10 rounded-md object-cover border border-border flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {vendorOrg.name}
                  </p>
                  <Badge variant="secondary" className="text-xs mt-0.5">
                    Member
                  </Badge>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link
                    to="/organizations/$orgId"
                    params={{ orgId: vendorOrg.id }}
                  >
                    View
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm">Not assigned to an organization</p>
                  <p className="text-xs">
                    Contact an admin to be added to an organization.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
