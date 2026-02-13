import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, CheckCircle, AlertCircle, Store } from 'lucide-react';
import { useAllVendorProfiles, useVerifyVendor } from '../hooks/useMarketplaceQueries';
import { useState } from 'react';
import type { VendorId } from '../backend';

export default function AdminPlaceholderPage() {
  const { data: vendors, isLoading, error } = useAllVendorProfiles();
  const verifyVendorMutation = useVerifyVendor();
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const handleVerify = async (vendorId: VendorId) => {
    setVerifyError(null);
    try {
      await verifyVendorMutation.mutateAsync(vendorId);
    } catch (err: any) {
      setVerifyError(err.message || 'Failed to verify vendor. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">Vendor management and verification</p>
              </div>
            </div>
          </div>
        </div>

        {verifyError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{verifyError}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Vendor Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Skeleton className="h-16 w-16 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-10 w-24" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load vendor profiles. Please try again later.
                </AlertDescription>
              </Alert>
            ) : !vendors || vendors.length === 0 ? (
              <div className="text-center py-12">
                <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No vendor profiles found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vendors.map((vendor) => (
                  <div
                    key={vendor.id.toString()}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {/* Vendor Logo */}
                    <div className="shrink-0">
                      {vendor.logoUrl ? (
                        <img
                          src={vendor.logoUrl}
                          alt={vendor.companyName}
                          className="h-16 w-16 rounded-lg object-cover border"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center border">
                          <Store className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Vendor Info */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{vendor.companyName}</h3>
                        {vendor.isVerified && (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>
                          <span className="font-medium">Vendor ID:</span> {vendor.id.toString()}
                        </p>
                        <p className="break-all">
                          <span className="font-medium">Owner:</span>{' '}
                          {vendor.user.toString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0">
                      {!vendor.isVerified ? (
                        <Button
                          onClick={() => handleVerify(vendor.id)}
                          disabled={verifyVendorMutation.isPending}
                          size="sm"
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          {verifyVendorMutation.isPending ? 'Verifying...' : 'Verify'}
                        </Button>
                      ) : (
                        <Badge variant="outline" className="gap-1 px-3 py-1">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
